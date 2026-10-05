---
title: Découverte de contenu
tags:
  - offensif/audit-web-api
  - pentest
  - web
  - reconnaissance
  - fuzzing
---

# Découverte de contenu

> **Note.** Objectif
> Identifier les répertoires, fichiers et paramètres non référencés dans la navigation normale (interfaces d'administration, fichiers de sauvegarde, endpoints de debug) par fuzzing systématique.

## Principe

Le fuzzing de contenu consiste à envoyer des requêtes vers l'application en substituant un mot d'une wordlist à un point d'insertion (chemin, sous-domaine, paramètre) et à observer les réponses (code HTTP, taille, temps de réponse) pour détecter les ressources existantes.

## Wordlists de référence

| Wordlist | Usage | Source |
|---|---|---|
| `raft-large-directories.txt` / `raft-large-files.txt` | Répertoires et fichiers génériques | SecLists |
| `common.txt` | Fuzzing rapide, faible bruit | SecLists / dirb |
| `api-endpoints.txt` | Endpoints API courants (`/api/v1/users`, etc.) | SecLists |
| Wordlist ciblée (générée depuis le fingerprinting) | Chemins spécifiques à un CMS/framework identifié | Construction manuelle |

## Fuzzing de répertoires et fichiers

```bash
# Fuzzing de répertoires avec ffuf (voir Outil - ffuf)
ffuf -u https://exemple.tld/FUZZ \
  -w /opt/SecLists/Discovery/Web-Content/raft-large-directories.txt \
  -mc 200,301,302,401,403 -fs 0 -t 50 -o resultats.json -of json

# Fuzzing récursif avec extension de fichiers
ffuf -u https://exemple.tld/FUZZ \
  -w raft-large-files.txt -e .php,.bak,.zip,.old,.env \
  -recursion -recursion-depth 2
```

> **Note.** Bruit et faux positifs
> Une application qui répond 200 sur toute URL inconnue (page « 404 personnalisée ») fausse le fuzzing. Toujours calibrer un filtre (`-fs` taille de réponse, `-fw` nombre de mots) après une requête de contrôle sur une ressource sciemment inexistante.

## Fuzzing de paramètres

Identifier des paramètres GET/POST cachés (paramètres de debug, de fonctionnalité non documentée) :

```bash
ffuf -u "https://exemple.tld/page?FUZZ=test" \
  -w params-large.txt -mc 200 -fs 1234
```

## Fichiers sensibles courants à vérifier systématiquement

| Fichier / chemin | Intérêt |
|---|---|
| `/.git/` | Historique complet du dépôt (`git-dumper`) |
| `/.env`, `/config.php.bak` | Secrets, identifiants base de données |
| `/robots.txt`, `/sitemap.xml` | Chemins internes révélés involontairement |
| `/backup.zip`, `/dump.sql` | Sauvegardes oubliées |
| `/.well-known/security.txt` | Contact sécurité (non offensif, utile en reconnaissance) |
| `/actuator`, `/actuator/env` | Endpoints d'administration Spring Boot exposés |

> **Note.** Cadre d'usage
> Le bruteforce de contenu génère un volume de requêtes actif contre la cible :
> à borner dans le périmètre du mandat — voir
> [Preambule-et-cadre-legal-Audit-Web-API](../00-Methodologie/Preambule-et-cadre-legal-Audit-Web-API.md).

## Voir également

- [Outil-ffuf](../04-Outils/Outil-ffuf.md)
- [Cartographie-de-la-surface-d-attaque](Cartographie-de-la-surface-d-attaque.md)
- [Audit-Web-et-API-MOC](../Audit-Web-et-API-MOC.md)
