---
title: Énumération et brute-force d'authentification
tags:
  - offensif/audit-web-api
  - pentest
  - web
  - owasp
  - authentification
  - brute-force
---
# Énumération et brute-force d'authentification

> **Note.** Principe
> L'énumération identifie les identifiants valides (utilisateurs/emails) en
> observant le comportement de l'application ; le brute-force exploite ensuite
> ces cibles réduites contre des mots de passe faibles. Relève de A07:2021
> (Identification and Authentication Failures).

## Vecteurs d'énumération d'utilisateurs

| Vecteur | Fuite exploitée |
|---|---|
| **Erreurs verbeuses** de connexion | « utilisateur inexistant » vs « mot de passe incorrect » distingue les comptes valides |
| **Inscription** | « nom d'utilisateur / email déjà utilisé » confirme l'existence |
| **Réinitialisation de mot de passe** | réponse différente selon que l'email existe ou non |
| **Politique de mot de passe** affichée | permet d'adapter un dictionnaire aux contraintes (majuscule/chiffre/symbole) |
| **Fuites de données** externes | tester la réutilisation d'identifiants compromis |

> **Note.** Erreurs verbeuses = mine d'or
> Au-delà de l'énumération d'utilisateurs, les messages verbeux peuvent révéler
> des chemins internes, des détails de schéma de base de données ou des données
> personnelles. On les provoque via connexions invalides, `'` (SQLi), `../`
> (traversée), altération de formulaires ou fuzzing (Burp Intruder).

### Automatisation de l'énumération d'emails

```python
import requests
def check_email(email):
    url = 'http://cible.tld/functions.php'
    data = {'username': email, 'password': 'password', 'action': 'login'}
    return requests.post(url, data=data).json()

# valide si le message d'erreur "Email does not exist" est ABSENT de la réponse
```

## Réinitialisation de mot de passe — vulnérabilités

| Méthode | Faiblesse typique |
|---|---|
| Par email | sécurité dépendante du compte email + confidentialité du jeton |
| Par question de sécurité | réponses devinables / PII publiques |
| Par SMS | SIM swapping, interception |

Vulnérabilités récurrentes : **jetons prévisibles** (séquentiels, courts —
brute-forçables), **expiration** trop longue ou absente, **validation
insuffisante**, **divulgation d'information**, **transport non chiffré**.

```php
// Jeton faible : PIN à 3 chiffres → brute-force trivial (Burp Intruder 100–200)
$token = mt_rand(100, 200);
```

## Brute-force HTTP Basic

Identifiants transmis en `Authorization: Basic base64(user:pass)` (RFC 7617) —
base64 n'est **pas** du chiffrement. Sans HTTPS, interceptables ; sinon
vulnérables aux mots de passe faibles.

```bash
# Hydra
hydra -l admin -P /opt/seclists/Passwords/Common-Credentials/500-worst-passwords.txt \
  http-get://cible.tld/labs/basic_auth/
```

Avec Burp Intruder : sélectionner la chaîne base64, ajouter deux règles de
*payload processing* (préfixer `admin:`, puis encoder en base64) et retirer le
padding `=`.

## Réduction du bruit et détection

Le brute-force se heurte au **rate limiting** et au **verrouillage de compte** —
voir [Rate-limiting-et-abus-de-logique-metier](../03-Specificites-API/Rate-limiting-et-abus-de-logique-metier.md). Espacer les tentatives,
utiliser des en-têtes réalistes et privilégier le password spraying limitent la
détection.

## OSINT complémentaire

- **Wayback Machine** (`waybackurls tryhackme.com`) : anciennes URL/fichiers
  parfois encore accessibles — voir [Decouverte-de-contenu](../01-Reconnaissance-et-cartographie/Decouverte-de-contenu.md).
- **Google Dorks** : `site:cible.tld inurl:admin`,
  `filetype:log "password" site:cible.tld`, `intitle:"index of" "backup"`.

> **Note.** Cadre
> Toute énumération/brute-force nécessite une autorisation écrite explicite —
> voir [Preambule-et-cadre-legal-Audit-Web-API](../00-Methodologie/Preambule-et-cadre-legal-Audit-Web-API.md).

## Voir également

- [Rate-limiting-et-abus-de-logique-metier](../03-Specificites-API/Rate-limiting-et-abus-de-logique-metier.md)
- [Decouverte-de-contenu](../01-Reconnaissance-et-cartographie/Decouverte-de-contenu.md)
- [Outil-Burp-Suite](../04-Outils/Outil-Burp-Suite.md)
