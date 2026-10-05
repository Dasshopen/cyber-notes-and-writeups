---
title: Outil - ffuf
tags:
  - offensif/audit-web-api
  - pentest
  - outil
  - web
  - fuzzing
---

# Outil - ffuf

> **Note.** Présentation
> ffuf (Fuzz Faster U Fool) est un fuzzer HTTP en ligne de commande écrit en Go, utilisé pour la découverte de contenu (répertoires, fichiers), le fuzzing de paramètres et de sous-domaines.

## Syntaxe de base

```bash
ffuf -u https://exemple.tld/FUZZ -w wordlist.txt
```

Le mot-clé `FUZZ` marque le point d'insertion ; il peut être placé dans le chemin, un en-tête, le corps de requête ou le nom d'hôte.

## Fuzzing de répertoires et fichiers

```bash
ffuf -u https://exemple.tld/FUZZ \
  -w /opt/SecLists/Discovery/Web-Content/raft-large-directories.txt \
  -mc 200,301,302,401,403 \
  -fs 1234 \
  -t 50 \
  -o resultats.json -of json
```

| Option | Rôle |
|---|---|
| `-mc` | Codes HTTP à afficher (match code) |
| `-fc` | Codes HTTP à exclure (filter code) |
| `-fs` | Exclure les réponses d'une taille donnée (filter size) — utile contre les faux positifs |
| `-fw` | Exclure par nombre de mots dans la réponse |
| `-t` | Nombre de threads concurrents |
| `-recursion` | Fuzzing récursif sur les répertoires découverts |

## Fuzzing de sous-domaines

```bash
ffuf -u https://FUZZ.exemple.tld/ -w sous-domaines.txt -H "Host: FUZZ.exemple.tld"
```

## Fuzzing de paramètres et de valeurs

```bash
# Paramètre GET
ffuf -u "https://exemple.tld/page?FUZZ=1" -w params.txt -mc 200

# Corps JSON (POST)
ffuf -u https://exemple.tld/api/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"user":"admin","pass":"FUZZ"}' \
  -w mots_de_passe.txt -mc 200 -fc 401
```

## Points d'insertion multiples

```bash
# Deux positions distinctes avec deux wordlists
ffuf -u https://exemple.tld/FUZZ1/FUZZ2 \
  -w wordlist1.txt:FUZZ1 -w wordlist2.txt:FUZZ2
```

> **Note.** Calibrer les filtres avant de lancer une campagne longue
> Toujours effectuer un essai avec un mot manifestement inexistant en amont pour identifier la taille/nombre de mots d'une réponse « non trouvée » type et configurer `-fs`/`-fw` en conséquence — sans quoi les résultats sont noyés dans les faux positifs.

## Voir également

- [Decouverte-de-contenu](../01-Reconnaissance-et-cartographie/Decouverte-de-contenu.md)
- [Decouverte-des-specifications-API](../01-Reconnaissance-et-cartographie/Decouverte-des-specifications-API.md)
- [Audit-Web-et-API-MOC](../Audit-Web-et-API-MOC.md)
