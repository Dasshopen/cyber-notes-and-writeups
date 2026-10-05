---
title: Injection NoSQL (MongoDB)
tags:
  - offensif/audit-web-api
  - pentest
  - web
  - owasp
  - injection
  - nosql
  - mongodb
---
# Injection NoSQL (MongoDB)

> **Note.** Principe
> Comme l'[Injection-SQL](Injection-SQL.md), une injection NoSQL exploite la concaténation
> d'entrées non assainies dans une requête de base de données — ici un moteur
> non relationnel (MongoDB). La différence tient à la **syntaxe** : les requêtes
> MongoDB s'appuient sur des **tableaux associatifs** et des **opérateurs**.
> Catégorie A03:2021 (Injection) de l'OWASP Top 10.

## Modèle de données MongoDB

| Relationnel | MongoDB |
|---|---|
| Ligne / entrée | **Document** (dictionnaire clé-valeur, champs arbitraires) |
| Table | **Collection** |
| Base de données | **Base de données** (regroupe des collections) |

```json
{"_id": ObjectId("5f07..."), "username": "lphillips", "age": "65", "email": "lphillips@example.com"}
```

Les requêtes filtrent via des tableaux de critères (équivalent d'un `WHERE`) et
des **opérateurs** imbriqués :

```text
['last_name' => 'Sandler']                       # égalité
['gender' => 'male', 'last_name' => 'Phillips']  # ET logique
['age' => ['$lt' => '50']]                        # opérateur $lt (<)
```

Opérateurs utiles côté attaque : `$ne` (≠), `$gt`/`$lt` (>/<), `$regex`,
`$where` (JavaScript), `$in`.

## Deux familles d'injection

- **Injection de syntaxe** — équivalent de la SQLi classique : « sortir » de la
  requête via des caractères spéciaux. Rare en NoSQL.
- **Injection d'opérateur** — injecter un opérateur MongoDB pour altérer le
  comportement de la requête sans sortir de sa structure. **Cas le plus courant.**

## Exploitation — contournement d'authentification

Code PHP vulnérable typique :

```php
$user = $_POST['user'];
$pass = $_POST['pass'];
$q = new MongoDB\Driver\Query(['username' => $user, 'password' => $pass]);
```

De nombreux langages serveur permettent de passer un **tableau** via la syntaxe
HTTP. En envoyant un opérateur `$ne` (différent de) au lieu d'une chaîne, la
condition sur le mot de passe devient toujours vraie :

```http
POST /login HTTP/1.1
Content-Type: application/x-www-form-urlencoded

user[$ne]=xxxx&pass[$ne]=yyyy
```

```json
// équivalent en JSON (API attendant du application/json)
{"user": {"$ne": "xxxx"}, "pass": {"$ne": "yyyy"}}
```

La requête retourne le premier document dont le mot de passe est « différent de
yyyy » ⇒ connexion en tant que cet utilisateur (souvent le premier créé, ex.
`admin`). Un `$regex` permet d'extraire un mot de passe caractère par caractère
(exfiltration blind).

## Détection

- Injecter `'` / `"` (syntaxe) et observer une erreur ;
- Basculer un paramètre en tableau (`param[$ne]=x`) et observer un changement de
  comportement (connexion réussie, résultat différent).

> **Note.** Outillage
> Burp Suite (Repeater/Intruder) pour la manipulation manuelle,
> **NoSQLMap** pour l'automatisation. Voir [Outil-Burp-Suite](../04-Outils/Outil-Burp-Suite.md).

## CWE associés

- **CWE-943** : Improper Neutralization of Special Elements in Data Query Logic

> **Note.** Cadre d'usage
> Toute injection testée nécessite une autorisation écrite explicite — voir
> [Preambule-et-cadre-legal-Audit-Web-API](../00-Methodologie/Preambule-et-cadre-legal-Audit-Web-API.md).

## Voir également

- [Injection-SQL](Injection-SQL.md)
- [Injection-Cypher-Neo4j](Injection-Cypher-Neo4j.md)
- [Outil-Burp-Suite](../04-Outils/Outil-Burp-Suite.md)
