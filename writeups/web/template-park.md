# Template Park — Jinja Sandbox + Mako `fetch()` + Flask Config Leak

## Objectif

Récupérer le vrai flag `PRESS_FLAG` d’un challenge Flask qui utilise deux moteurs de templates différents :

```text
/card    -> Jinja2 SandboxedEnvironment
/preview -> Mako
```

Le flag réel n’est pas laissé simplement sur disque après le démarrage. Il est chargé en mémoire puis servi uniquement par un endpoint interne protégé.

---

## 1. Architecture du challenge

Le code utilise :

```python
app = Flask(__name__)
```

Deux zones sont importantes :

```text
/card
```

utilise **Jinja2** avec un sandbox.

```text
/preview
```

utilise **Mako** avec un helper Python appelé :

```python
fetch(url)
```

Il faut donc bien séparer les deux moteurs.

---

## 2. Chargement du vrai flag

Le code charge le flag avec :

```python
def _load_press_flag() -> str:
    path = Path(
        os.environ.get(
            "PARK_FLAG_PATH",
            "/run/park.flag",
        )
    )
```

Par défaut, le chemin est :

```text
/run/park.flag
```

Si le fichier existe :

```python
data = path.read_text(encoding="utf-8")
```

puis le code essaie de le supprimer :

```python
try:
    path.unlink()
except OSError:
    pass
```

Enfin :

```python
PRESS_FLAG = _load_press_flag()
```

Le flag est donc :

```text
lu une fois
-> stocké dans PRESS_FLAG
-> supprimé du disque si possible
```

Conclusion :

```text
Lire /run/park.flag après le démarrage n’est pas forcément utile.
```

Le vrai flag reste en mémoire dans :

```python
PRESS_FLAG
```

---

## 3. Génération du token interne

Le code crée un token aléatoire :

```python
PRESS_TOKEN = secrets.token_hex(16)
```

Cela génère 16 octets aléatoires encodés en hexadécimal.

Le token change à chaque démarrage.

---

## 4. Stockage dans la configuration Flask

Le token est placé dans :

```python
app.config["PARK_PRESS_TOKEN"] = PRESS_TOKEN
```

Puis le code construit directement une URL complète :

```python
app.config["PARK_FLAG_URL"] = (
    f"http://127.0.0.1:8000/internal/press?token={PRESS_TOKEN}"
)
```

Donc la configuration Flask contient au moins :

```text
PARK_PRESS_TOKEN
PARK_FLAG_URL
```

La seconde valeur correspond déjà à une URL valide de ce type :

```text
http://127.0.0.1:8000/internal/press?token=<TOKEN>
```

---

## 5. Endpoint interne `/internal/press`

Le vrai flag est servi ici :

```python
@app.get("/internal/press")
def internal_press():
```

Première vérification :

```python
if request.remote_addr not in {
    "127.0.0.1",
    "::1",
}:
    abort(403)
```

Donc seules les requêtes locales sont acceptées.

Deuxième vérification :

```python
token = (
    request.args.get("token")
    or request.headers.get("X-Park-Press")
)
```

Le token peut donc venir :

```text
?token=...
```

ou du header :

```http
X-Park-Press: ...
```

Puis :

```python
if token != app.config["PARK_PRESS_TOKEN"]:
    abort(403)
```

Enfin :

```python
return PRESS_FLAG
```

Il faut donc réunir deux conditions :

```text
requête locale
+
bon token
```

---

## 6. Le faux flag

Le challenge contient également :

```python
CANARY = os.environ.get(
    "FAKE_SECRET_FLAG",
    "[REDACTED]"
)
```

et :

```python
@app.get("/flag")
def flag_bait():
    return CANARY
```

Donc :

```text
/flag
```

est un leurre.

À retenir : ne pas considérer automatiquement un endpoint `/flag` comme le vrai objectif. Il faut vérifier le code.

---

## 7. Branche Jinja `/card`

Le code récupère :

```python
name = request.form.get("name", "")
title = request.form.get("title", "")
```

puis crée un template :

```python
fragment = f"""
{name}
{title}
"""
```

Il le rend ensuite avec :

```python
body = (
    card_env()
    .from_string(fragment)
    .render(
        config=app.config,
        request=request,
    )
)
```

Le point capital est :

```python
config=app.config
```

Cela signifie que le template Jinja reçoit directement la configuration Flask sous le nom :

```text
config
```

Mentalement :

```text
config = app.config
```

---

## 8. Sandbox Jinja

L’environnement est créé avec :

```python
env = SandboxedEnvironment()
```

Puis certains globals classiques sont supprimés :

```python
STRIP_GLOBALS = (
    "lipsum",
    "cycler",
    "joiner",
    "namespace",
)
```

Le challenge indique donc clairement de ne pas partir immédiatement sur les gadgets Jinja classiques.

L’objectif n’est pas forcément de sortir vers `os`, `subprocess`, etc. Il faut d’abord regarder ce que le développeur expose lui-même au template.

Ici :

```python
config=app.config
```

est beaucoup plus intéressant.

---

## 9. Lecture de la configuration Flask

Comme `config` est fourni directement au template Jinja, il est possible de lire les valeurs stockées dans cette configuration.

Les valeurs importantes sont :

```text
PARK_PRESS_TOKEN
PARK_FLAG_URL
```

La démarche méthodologique :

```text
1. repérer où le secret est créé
2. suivre où il est stocké
3. regarder quels objets sont exposés au template
4. constater que app.config est donné à Jinja
5. lire la valeur intéressante
```

C’est du **data-flow analysis** :

```text
PRESS_TOKEN
   ↓
app.config
   ↓
config exposé à Jinja
   ↓
template contrôlé
```

---

## 10. Branche Mako `/preview`

Le code fait :

```python
bio = request.form.get("bio", "")
```

Puis :

```python
source = PREVIEW_PAGE.replace(
    "__BIO__",
    bio,
)
```

Donc notre entrée est insérée directement dans le template Mako.

Ensuite :

```python
html = MakoTemplate(source).render(
    fetch=fetch_url
)
```

Cela signifie que le template Mako reçoit une fonction appelée :

```text
fetch
```

qui pointe vers la fonction Python :

```python
fetch_url
```

Mentalement :

```text
dans Python :
fetch_url(...)

dans Mako :
fetch(...)
```

---

## 11. Validation de la SSTI Mako

La syntaxe Mako d’une expression est :

```mako
${ ... }
```

On peut commencer par vérifier une expression simple avant d’aller plus loin.

Le but méthodologique :

```text
entrée utilisateur
-> injectée dans source
-> compilée par MakoTemplate
-> expression évaluée
```

Cela confirme une **SSTI Mako**.

---

## 12. Le helper `fetch_url()`

Le code :

```python
def fetch_url(url: str) -> str:
    parsed = urlparse(str(url))
```

Il n’accepte que :

```python
if parsed.scheme not in {"http", "https"}:
    return "[fetch] http(s) only"
```

Puis il limite les hosts :

```python
if parsed.hostname not in {"127.0.0.1", "localhost"}:
    return "[fetch] local previews only"
```

Donc seules des URLs locales sont autorisées.

Ensuite :

```python
req = Request(
    url,
    headers={
        "User-Agent": "park-preview/1.0",
    },
)
```

et :

```python
with urlopen(req, timeout=3) as resp:
```

Donc la requête est réellement faite côté serveur.

---

## 13. Test du fetch local

Un test utile :

```mako
${fetch("http://127.0.0.1:8000")}
```

Résultat :

```text
la page d’accueil de l’application est retournée
```

Cela confirme :

```text
Mako
-> fetch()
-> fetch_url()
-> requête serveur
-> localhost:8000
```

On a donc une primitive SSRF locale contrôlée depuis la SSTI Mako.

---

## 14. Mauvais protocole : HTTPS

Un test avec :

```text
https://127.0.0.1:8000
```

peut échouer car :

```python
app.run(
    host="0.0.0.0",
    port=8000,
)
```

le serveur Flask écoute normalement en HTTP simple.

Le bon protocole est donc :

```text
http://127.0.0.1:8000
```

---

## 15. Vérification avec un faux token

Avant d’utiliser le vrai token, on peut tester :

```text
http://127.0.0.1:8000/internal/press?token=test
```

Le code fait :

```python
if token != app.config["PARK_PRESS_TOKEN"]:
    abort(403)
```

Donc un faux token doit échouer.

Comme `fetch_url()` capture les exceptions :

```python
except Exception as exc:
    return f"[fetch] {type(exc).__name__}"
```

on peut obtenir une réponse de type :

```text
[fetch] HTTPError
```

Cela confirme que l’URL est atteignable mais que le token est incorrect.

---

## 16. Chaîne finale

La chaîne logique du challenge est :

```text
PRESS_TOKEN
   ↓
app.config["PARK_PRESS_TOKEN"]
   ↓
config exposé à Jinja dans /card
   ↓
lecture du token
   ↓
Mako /preview
   ↓
fetch("http://127.0.0.1:8000/internal/press?token=...")
   ↓
requête locale
   ↓
/internal/press
   ↓
vérification localhost OK
   ↓
vérification token OK
   ↓
PRESS_FLAG
```

---

## 17. Vulnérabilités présentes

### SSTI Jinja

L’entrée utilisateur est utilisée comme template :

```python
card_env().from_string(fragment)
```

Même si Jinja est sandboxé, des données sensibles sont exposées au contexte :

```python
config=app.config
```

Le problème principal ici est aussi une **exposition de secrets dans le contexte du template**.

### SSTI Mako

L’entrée utilisateur est injectée ici :

```python
source = PREVIEW_PAGE.replace("__BIO__", bio)
```

puis compilée :

```python
MakoTemplate(source)
```

Donc le contenu utilisateur devient du code/template Mako.

### SSRF locale

Le helper :

```python
fetch_url(url)
```

effectue des requêtes HTTP côté serveur.

Même s’il limite la destination à :

```text
127.0.0.1
localhost
```

c’est précisément suffisant pour atteindre :

```text
/internal/press
```

### Exposition de secrets Flask

Le secret est stocké dans :

```python
app.config
```

puis la config complète est fournie à un template contrôlé :

```python
.render(config=app.config)
```

C’est une mauvaise séparation des données sensibles.

---

## 18. Ce qu’il fallait comprendre

Le challenge ne demandait pas forcément de bypasser totalement Jinja sandbox ou d’obtenir un shell.

La solution reposait surtout sur la lecture du code.

Il fallait suivre :

```text
où est le secret ?
où est-il copié ?
qui peut le lire ?
qui peut faire une requête localhost ?
```

---

## 19. Méthodologie de lecture de code

Quand tu vois un secret :

```python
SECRET = ...
```

fais toujours cette recherche mentale :

```text
1. Où est-il créé ?
2. Où est-il stocké ?
3. Où est-il copié ?
4. Où est-il exposé ?
5. Quelle entrée utilisateur atteint cet objet ?
6. Où est-il utilisé pour une autorisation ?
```

Ici :

```text
PRESS_TOKEN
-> app.config
-> Jinja config
-> récupéré
-> Mako fetch
-> /internal/press
```

---

## 20. Checklist SSTI / Flask

- [ ] Identifier le moteur de template
- [ ] Vérifier si l’entrée utilisateur devient du template
- [ ] Identifier Jinja / Mako / Twig / etc.
- [ ] Lire les objets passés à `.render()`
- [ ] Chercher `config`
- [ ] Chercher `request`
- [ ] Chercher les fonctions/helpers exposés
- [ ] Chercher les secrets dans `app.config`
- [ ] Suivre les variables sensibles
- [ ] Ne pas viser directement RCE si ce n’est pas nécessaire
- [ ] Vérifier les endpoints localhost
- [ ] Vérifier les helpers `fetch`, `request`, `urlopen`
- [ ] Tester HTTP puis HTTPS
- [ ] Repérer les faux flags / canaries
- [ ] Distinguer vrai flag et flag leurre
- [ ] Comprendre les contrôles avant de construire le payload final

---

## 21. Résumé ultra-court

```text
/card
  ↓
Jinja sandboxé
  ↓
config=app.config
  ↓
lecture PARK_PRESS_TOKEN
  ↓
/preview
  ↓
Mako SSTI
  ↓
fetch(url)
  ↓
localhost
  ↓
/internal/press?token=<TOKEN>
  ↓
PRESS_FLAG
```

---

## Concepts à retenir

```text
SSTI
Server-Side Template Injection

Jinja Sandbox
Environnement Jinja restreint

Mako
Moteur de template Python

SSRF
Server-Side Request Forgery

Flask app.config
Configuration globale de l’application

Data-flow analysis
Suivre une donnée sensible depuis sa création jusqu’à son utilisation
```

---

## Leçon principale

Le point le plus important de ce challenge n’est pas le payload.

C’est le raisonnement :

```text
secret créé
-> secret stocké
-> secret exposé
-> primitive locale disponible
-> combinaison des deux
```

Toujours lire les arguments de :

```python
.render(...)
```

car ce sont les objets explicitement mis à disposition du template.
