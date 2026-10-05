---
title: Attaques sur les JWT
tags:
  - offensif/audit-web-api
  - pentest
  - api
  - jwt
  - authentification
---
# Attaques sur les JWT

> **Note.** Portée de cette note
> Approfondissement des attaques sur les JSON Web Tokens, complément de la vue
> d'ensemble [Authentification-API-JWT-OAuth2-cles-API](Authentification-API-JWT-OAuth2-cles-API.md). Couvre la
> falsification de signature, le cassage de clé et l'abus des champs d'en-tête.

## Rappel de structure

`header.payload.signature`, chaque partie en Base64URL. Le header porte `alg`
(algorithme) et `typ` ; la signature est un HMAC (clé secrète) ou une signature
RSA (clé privée). Champs prédéfinis utiles : `iss`, `iat`, `exp`, `nbf`, `sub`,
`alg`, **`kid`** (identifiant de clé), **`jku`/`jwk`** (source de la clé de
vérification), `jti` (identifiant unique du token).

Lecture : jwt.io, extension **JWT Editor** (Burp), ou décodage base64 manuel.

## Falsification de la signature

### `alg: none`

Si l'implémentation fait confiance au champ `alg`, le passer à `none` et retirer
la signature peut faire accepter un token modifié (ex. `role: admin`).

### Confusion RS256 → HS256

RS256 signe avec une clé privée et vérifie avec la clé **publique** (connue).
En passant `alg` à HS256, un serveur vulnérable vérifie la signature HMAC en
utilisant la clé publique **comme secret** — que l'attaquant connaît, donc peut
forger n'importe quel token :

```bash
jwt_tool.py -X k -pk public_key.pem <jwt>   # attaque key confusion
```

Se produit typiquement avec `jwt = JWT.decode(token, public_key)` sans forcer
l'algorithme.

## Cassage de la clé HMAC

Si le secret HS256 est faible, il se casse hors ligne (dictionnaire ou listes
de secrets d'exemples copiés par les développeurs) :

```bash
hashcat -a 0 -m 16500 <jwt> wordlist.txt
john --format=HMAC-SHA256 --wordlist=wordlist.txt jwt.txt
jwt_tool.py <jwt> -C -d wordlist.txt
```

> **Note.** Limite de taille John
> Sur un JWT long, il peut être nécessaire d'augmenter `SALT_LIMBS` dans le code
> source de John pour contourner la limite de taille.

## Contournement par padding base64

Une comparaison de tokens doit se faire sur le **`jti`**, pas sur la chaîne
brute. Sinon, ajouter du padding `=` (ignoré au décodage) produit un token
**logiquement identique mais textuellement différent** — utile pour contourner
une liste noire :

```text
...WYbuO_E      → rejeté (présent en blacklist)
...WYbuO_E==    → décode à l'identique, mais échappe à la comparaison stricte
```

## Abus des champs d'en-tête

### `kid` (Key ID)

Le `kid` désigne la clé de vérification. S'il est concaténé sans contrôle, il
peut porter une **injection SQL** ou un **path traversal** : pointer vers un
fichier au contenu connu (ex. `/dev/null`, contenu vide) rend la signature
calculable, donc n'importe quel token forgeable.

### Injection de JWK (`jwk` / `jku`)

Si le serveur accepte une clé fournie dans l'en-tête `jwk` (ou téléchargée via
`jku`), on injecte **sa propre** clé et on signe le token voulu :

- **Directement** : dans Burp (extension JWT Editor), créer une *New RSA Key*,
  puis `Repeater → JSON Web Tokens → Attack → Embedded JWK`.
- **Hébergé** : si `jku` est requis, héberger le JWK sur un domaine contrôlé.

## Recommandations de vérification (audit)

- Algorithme **fixé côté serveur** (ne jamais faire confiance à `alg`) ;
- rejet de `alg: none` ; secret HMAC long et aléatoire ;
- validation de `exp`/`nbf` ; comparaison par `jti` ;
- `kid`/`jku`/`jwk` non contrôlables par le client (allow-list de clés).

> **Note.** Cadre d'usage
> La forge d'un JWT permet une usurpation d'identité : à réserver au périmètre
> couvert par le mandat — voir [Preambule-et-cadre-legal-Audit-Web-API](../00-Methodologie/Preambule-et-cadre-legal-Audit-Web-API.md).

## Voir également

- [Authentification-API-JWT-OAuth2-cles-API](Authentification-API-JWT-OAuth2-cles-API.md)
- [BOLA-Exces-d-autorisation-au-niveau-objet](BOLA-Exces-d-autorisation-au-niveau-objet.md)
- [Outil-Burp-Suite](../04-Outils/Outil-Burp-Suite.md)
