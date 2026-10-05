---
title: Cartographie de la surface d'attaque
tags:
  - offensif/audit-web-api
  - pentest
  - web
  - reconnaissance
---

# Cartographie de la surface d'attaque

> **Note.** Objectif
> Identifier les composants exposés par la cible — sous-domaines, technologies, endpoints — pour conditionner la couverture de l'audit.

## Découverte de sous-domaines

Technique passive (sans interaction directe avec la cible) puis active.

```bash
# Passive - certificate transparency
curl -s "https://crt.sh/?q=%25.exemple.tld&output=json" | jq -r '.[].name_value' | sort -u

# Passive - agrégateurs
subfinder -d exemple.tld -all -o subfinder.txt
amass enum -passive -d exemple.tld -o amass.txt

# Active - résolution DNS et détection de wildcard
dnsx -l subfinder.txt -resp -o resolved.txt

# Active - bruteforce de sous-domaines
puredns bruteforce wordlist.txt exemple.tld -r resolvers.txt
```

> **Note.** Wildcard DNS
> Un domaine configuré en wildcard (`*.exemple.tld` résout toujours) fausse le bruteforce : chaque essai renvoie une réponse positive. Vérifier systématiquement en résolvant un sous-domaine aléatoire avant de lancer un bruteforce.

## Fingerprinting technologique

Identifier serveur web, framework, CMS, langage, bibliothèques front pour orienter les tests (CVE connues, comportements spécifiques).

```bash
whatweb -a 3 https://exemple.tld
httpx -l resolved.txt -title -tech-detect -status-code -o httpx.txt
wappalyzer https://exemple.tld
```

| Indice | Exemple | Information déduite |
|---|---|---|
| En-tête `Server` | `nginx/1.18.0` | Serveur et version (CVE potentielles) |
| En-tête `X-Powered-By` | `PHP/7.4.3` | Langage et version |
| Cookie de session | `JSESSIONID`, `laravel_session` | Framework applicatif |
| Fichiers statiques | `/wp-content/`, `/_next/` | CMS (WordPress) ou framework front (Next.js) |
| Messages d'erreur | Stack trace verbeuse | Framework, chemin serveur, parfois version |

## Inventaire des endpoints

- Navigation manuelle applicative avec proxy d'interception (voir [Outil-Burp-Suite](../04-Outils/Outil-Burp-Suite.md)) pour construire une sitemap.
- Extraction des endpoints référencés côté client : fichiers JavaScript, sourcemaps exposées, fichiers de configuration front.

```bash
# Extraction d'endpoints depuis du JS
katana -u https://exemple.tld -jc -o endpoints.txt
gau exemple.tld | tee urls.txt

# Recherche de secrets/endpoints dans des bundles JS
python3 -m pip install linkfinder
python3 linkfinder.py -i https://exemple.tld/static/app.js -o cli
```

> **Note.** Sourcemaps exposées
> Un fichier `app.js.map` accessible permet de reconstituer le code source front non minifié, révélant parfois des endpoints internes, des clés d'API front-end ou des commentaires sensibles.

> **Note.** Cadre d'usage
> Même passive en apparence, la cartographie doit rester dans le périmètre défini
> par le mandat — voir [Preambule-et-cadre-legal-Audit-Web-API](../00-Methodologie/Preambule-et-cadre-legal-Audit-Web-API.md).

## Voir également

- [Decouverte-de-contenu](Decouverte-de-contenu.md)
- [Decouverte-des-specifications-API](Decouverte-des-specifications-API.md)
- [Audit-Web-et-API-MOC](../Audit-Web-et-API-MOC.md)
