---
title: BOLA - Excès d'autorisation au niveau objet
tags:
  - offensif/audit-web-api
  - pentest
  - api
  - owasp
  - bola
  - idor
---

# BOLA — Excès d'autorisation au niveau objet

> **Note.** Principe
> BOLA (Broken Object Level Authorization) est la catégorie API1:2023 de l'OWASP API Security Top 10, en tête du classement. C'est la déclinaison côté API de l'IDOR (voir [Controle-d-acces-defaillant-IDOR-et-path-traversal](../02-Vulnerabilites-web-classiques/Controle-d-acces-defaillant-IDOR-et-path-traversal.md)) : l'API ne vérifie pas que l'utilisateur authentifié est autorisé à accéder à l'objet précis désigné par l'identifiant fourni.

## Principe

```http
GET /api/v1/utilisateurs/1042/commandes HTTP/1.1
Authorization: Bearer <jeton_utilisateur_1042>

# L'API ne vérifie pas que le jeton correspond bien à l'ID demandé
GET /api/v1/utilisateurs/1043/commandes HTTP/1.1
Authorization: Bearer <jeton_utilisateur_1042>
```

Le BOLA touche également les identifiants imbriqués dans le corps des requêtes (JSON) et pas seulement dans l'URL :

```json
POST /api/v1/commandes/annuler
{"commande_id": 88213, "utilisateur_id": 1043}
```

## Méthodologie de test systématique

1. Créer au moins deux comptes de rôle identique (A, B) et, si pertinent, un compte de rôle inférieur (C).
2. Cartographier chaque endpoint manipulant un identifiant d'objet (URL, corps JSON, en-tête, paramètre de requête).
3. Pour chaque endpoint, matrice de test : jeton de A sur objet de B, jeton de B sur objet de A, absence de jeton, jeton expiré.
4. Tester toutes les méthodes HTTP exposées sur l'endpoint (GET souvent testé, PUT/PATCH/DELETE souvent oubliés).
5. Tester les identifiants en dehors de la plage attendue (négatifs, hors bornes, non numériques) pour révéler des comportements d'erreur informatifs.

> **Note.** Automatisation partielle
> Un outil comme Burp Suite (extension Autorize) ou un script rejouant chaque requête capturée avec le jeton d'un second compte permet d'industrialiser cette matrice de test sur une API volumineuse.

## Différence avec l'excès d'autorisation au niveau fonction (BFLA)

| | BOLA (API1) | BFLA (API5) |
|---|---|---|
| Question posée | Ai-je le droit d'accéder à *cet objet précis* ? | Ai-je le droit d'appeler *cette fonction/action* ? |
| Exemple | Utilisateur standard consultant la facture d'un autre utilisateur | Utilisateur standard appelant un endpoint d'administration (`/api/admin/utilisateurs`) |
| Test | Faire varier l'identifiant d'objet à rôle égal | Faire varier le rôle du compte à endpoint égal |

## Impact

- Accès en lecture à l'ensemble des objets d'autres utilisateurs (violation de confidentialité à grande échelle, souvent énumérable).
- Modification ou suppression d'objets appartenant à des tiers.
- Sur une API mobile ou SPA, le BOLA est souvent la vulnérabilité la plus impactante car les contrôles côté client (masquage d'UI) ne sont pas reproduits côté serveur.

> **Note.** Cadre d'usage
> L'accès à des objets appartenant à d'autres utilisateurs doit rester dans le
> périmètre autorisé — voir [Preambule-et-cadre-legal-Audit-Web-API](../00-Methodologie/Preambule-et-cadre-legal-Audit-Web-API.md).

## Voir également

- [Controle-d-acces-defaillant-IDOR-et-path-traversal](../02-Vulnerabilites-web-classiques/Controle-d-acces-defaillant-IDOR-et-path-traversal.md)
- [Authentification-API-JWT-OAuth2-cles-API](Authentification-API-JWT-OAuth2-cles-API.md)
- [Audit-Web-et-API-MOC](../Audit-Web-et-API-MOC.md)
