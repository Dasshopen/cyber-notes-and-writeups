---
title: Authentification API (JWT, OAuth2, clés API)
tags:
  - offensif/audit-web-api
  - pentest
  - api
  - jwt
  - oauth
  - authentification
---

# Authentification API (JWT, OAuth2, clés API)

> **Note.** Objectif
> Les API reposent rarement sur une authentification par cookie de session classique ; elles utilisent le plus souvent des jetons JWT, des flux OAuth2/OIDC ou des clés d'API statiques. Chaque mécanisme a ses propres classes de vulnérabilités.

## JWT (JSON Web Token)

### Structure

```
en-tête.charge_utile.signature
[REDACTED]
```

L'en-tête et la charge utile sont encodés en Base64URL (non chiffrés — lisibles par quiconque intercepte le jeton) ; seule la signature garantit l'intégrité.

### Attaques classiques

| Attaque | Principe | Test |
|---|---|---|
| `alg: none` | Certaines bibliothèques acceptent un jeton dont l'en-tête déclare `"alg":"none"` sans vérifier de signature | Forger un jeton avec `alg: none` et signature vide, modifier la charge utile (ex. `role: admin`) |
| Confusion d'algorithme (RS256 → HS256) | Si le serveur vérifie avec la clé publique RS256 utilisée comme secret HMAC | Signer un jeton modifié en HS256 en utilisant la clé publique RSA connue comme secret |
| Faiblesse de la clé HMAC | Secret HS256 court ou devinable | Bruteforce hors ligne avec `hashcat` ou `jwt_tool` |
| `kid` (Key ID) manipulable | Le champ `kid` de l'en-tête pointe vers un fichier/une clé choisie par l'attaquant | Injection SQL ou path traversal via le champ `kid`, ou pointage vers une clé connue (ex. `/dev/null`) |
| Absence de vérification d'expiration | Jeton expiré toujours accepté | Rejouer un jeton après expiration (`exp`) |

```bash
# Analyse et attaques automatisées avec jwt_tool
python3 jwt_tool.py <jeton> -T   # édition interactive de la charge utile
python3 jwt_tool.py <jeton> -X a # test automatique de alg:none
python3 jwt_tool.py <jeton> -C -d wordlist.txt  # bruteforce du secret HMAC
```

> **Note.** Approfondissement
> Le détail de chaque attaque (confusion RS256→HS256, cassage hashcat/John,
> contournement par padding base64, abus de `kid`/`jwk`/`jku`) est traité dans
> [Attaques-sur-les-JWT](Attaques-sur-les-JWT.md).

> **Note.** Confidentialité de la charge utile
> Un JWT n'est pas chiffré par défaut : ne jamais y placer de données sensibles (mots de passe, numéros de carte) même si sa signature est robuste — la charge utile reste lisible par quiconque intercepte le jeton.

## OAuth2 / OIDC

Points de contrôle fréquents lors d'un audit d'implémentation OAuth2 :

| Point de contrôle | Vulnérabilité associée |
|---|---|
| Validation du paramètre `redirect_uri` | Redirection ouverte permettant l'exfiltration du code d'autorisation vers un domaine attaquant |
| Paramètre `state` | Absence ou prévisibilité → CSRF sur le flux d'autorisation |
| Validation du paramètre `scope` | Élévation de privilèges en demandant des scopes non prévus pour le client |
| Jeton d'accès dans l'URL | Fuite via logs serveur, historique navigateur, en-tête `Referer` |
| Flux implicite (`response_type=token`) | Déprécié en OAuth 2.1 : jeton exposé directement dans le fragment d'URL |
| Validation de la signature du jeton OIDC (`id_token`) | Falsification possible si la signature n'est pas vérifiée côté client de confiance |

## Clés d'API statiques

| Point de contrôle | Risque |
|---|---|
| Transmission en paramètre GET | Fuite via logs serveur/proxy, historique navigateur |
| Absence de rotation | Une clé compromise reste valide indéfiniment |
| Périmètre de la clé trop large | Une seule clé donnant accès à toutes les opérations plutôt qu'à un scope réduit |
| Absence de rate limiting associé | Bruteforce ou abus massif possible une fois une clé valide obtenue |

> **Note.** Recherche de clés exposées
> Rechercher des clés d'API codées en dur dans le code JavaScript front-end, les dépôts publics (GitHub dorking), ou les collections Postman ([Decouverte-des-specifications-API](../01-Reconnaissance-et-cartographie/Decouverte-des-specifications-API.md)).

> **Note.** Cadre d'usage
> Toute tentative de contournement d'authentification nécessite une autorisation
> écrite explicite — voir [Preambule-et-cadre-legal-Audit-Web-API](../00-Methodologie/Preambule-et-cadre-legal-Audit-Web-API.md).

## Voir également

- [BOLA-Exces-d-autorisation-au-niveau-objet](BOLA-Exces-d-autorisation-au-niveau-objet.md)
- [Decouverte-des-specifications-API](../01-Reconnaissance-et-cartographie/Decouverte-des-specifications-API.md)
- [Audit-Web-et-API-MOC](../Audit-Web-et-API-MOC.md)
