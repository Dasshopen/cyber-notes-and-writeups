---
title: Découverte des spécifications API
tags:
  - offensif/audit-web-api
  - pentest
  - api
  - reconnaissance
---

# Découverte des spécifications API

> **Note.** Objectif
> Retrouver la spécification d'une API (documentation ou déduction) pour couvrir systématiquement chaque ressource, méthode et paramètre.

## Spécifications Swagger / OpenAPI

De nombreuses API exposent leur documentation directement, parfois par oubli en environnement de production.

```bash
# Chemins courants à tester
/swagger.json
/swagger.yaml
/swagger-ui.html
/openapi.json
/v2/api-docs
/api-docs
/.well-known/openapi.json
```

```bash
# Fuzzing ciblé sur des chemins de documentation connus
ffuf -u https://api.exemple.tld/FUZZ \
  -w swagger-wordlist.txt -mc 200
```

Une fois une spécification OpenAPI récupérée, elle peut être importée directement dans Burp Suite ou Postman pour générer automatiquement l'ensemble des requêtes à tester, ou exploitée avec des outils dédiés :

```bash
# Génération de requêtes de test depuis une spec OpenAPI
docker run --rm -v $(pwd):/data schemathesis/schemathesis \
  run --checks all /data/openapi.json --base-url https://api.exemple.tld
```

## Collections Postman

Les collections Postman exportées et publiées par erreur (dépôts publics, workspaces partagés) contiennent souvent des requêtes authentifiées complètes, avec jetons ou clés d'API en variables d'environnement.

> [!danger] Fuite de collections Postman
> Le moteur de recherche public de Postman et des dépôts GitHub indexent des milliers de collections contenant des identifiants valides. Rechercher `site:postman.com exemple.tld` ou des dorks GitHub (`filename:*.postman_collection.json exemple`) fait partie de la reconnaissance passive légitime sur le périmètre audité.

## Versionnement d'API

Le versionnement révèle souvent des versions obsolètes toujours actives, avec des contrôles de sécurité moins matures.

| Schéma de versionnement | Exemple | Piège fréquent |
|---|---|---|
| Dans l'URL | `/api/v1/users`, `/api/v2/users` | La v1 reste active et moins protégée après migration vers v2 |
| Dans l'en-tête | `Accept: application/vnd.exemple.v2+json` | Tester les valeurs de version non documentées (v0, v1, beta) |
| Sous-domaine | `api-legacy.exemple.tld` | Sous-domaine oublié, souvent sans WAF devant |

> **Note.** Tester systématiquement les versions antérieures
> Lorsqu'une version `v2` est identifiée, tester explicitement `v1` sur les mêmes endpoints : les correctifs de sécurité appliqués en v2 ne sont pas toujours rétroportés.

> **Note.** Cadre d'usage
> À mener dans le périmètre défini par le mandat — voir
> [Preambule-et-cadre-legal-Audit-Web-API](../00-Methodologie/Preambule-et-cadre-legal-Audit-Web-API.md).

## Voir également

- [Cartographie-de-la-surface-d-attaque](Cartographie-de-la-surface-d-attaque.md)
- [Authentification-API-JWT-OAuth2-cles-API](../03-Specificites-API/Authentification-API-JWT-OAuth2-cles-API.md)
- [Audit-Web-et-API-MOC](../Audit-Web-et-API-MOC.md)
