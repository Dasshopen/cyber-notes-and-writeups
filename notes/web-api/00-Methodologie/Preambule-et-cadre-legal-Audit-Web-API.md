---
title: Préambule et cadre légal — Audit Web API
tags:
  - offensif/audit-web-api
  - pentest
  - methodologie
  - legal
---

# Préambule et cadre légal

> **Note.** Objectif
> Cadre d'un audit web/API : objectifs, cadre contractuel, approches boîte noire/grise/blanche.

## Objectif d'un audit de sécurité applicatif

Un audit de sécurité web/API vise à évaluer, dans un périmètre et une durée définis, la résistance d'une application aux attaques réalistes, en identifiant les vulnérabilités exploitables, en démontrant leur impact (preuve de concept maîtrisée) et en proposant des recommandations de remédiation priorisées.

Il se distingue :

- du **scan de vulnérabilités automatisé**, qui produit une liste brute de failles potentielles sans validation manuelle ni contextualisation du risque métier ;
- du **bug bounty**, réalisé en continu par une communauté de chercheurs externes sur un périmètre public, sans date de fin ;
- de l'**audit de code (SAST)**, qui analyse le code source plutôt que l'application en fonctionnement (DAST).

## Cadre contractuel

> **Note.** Autorisation préalable obligatoire
> Aucune action de test ne doit être engagée sans un **mandat d'audit** (ou ordre de mission / convention de test) signé par une personne habilitée côté client, précisant explicitement :
> - le périmètre exact (domaines, IP, applications, comptes de test) ;
> - les techniques autorisées et exclues (ex. : déni de service exclu, ingénierie sociale exclue) ;
> - la fenêtre temporelle des tests ;
> - les contacts d'urgence en cas d'incident ;
> - le traitement des données découvertes (confidentialité, destruction en fin de mission).

Éléments habituels d'un mandat :

| Élément | Description |
|---|---|
| Get Out of Jail Free letter | Document attestant de l'autorisation, à conserver sur soi pendant les tests on-site |
| Règles d'engagement (RoE) | Techniques autorisées, horaires, IP sources des testeurs |
| Périmètre (scope) | Liste exhaustive des cibles in-scope / out-of-scope |
| Critères d'arrêt | Conditions déclenchant l'arrêt immédiat (ex. : instabilité de production) |

## Boîte noire, grise, blanche

| Approche | Informations fournies | Objectif | Limite |
|---|---|---|---|
| Boîte noire (black box) | Aucune, hormis l'URL/le périmètre | Simuler un attaquant externe sans connaissance préalable | Couverture partielle dans le temps imparti |
| Boîte grise (grey box) | Un compte utilisateur standard, parfois la documentation API | Simuler un attaquant ayant un accès légitime limité (client, partenaire) | Nécessite une coordination avec le client pour les comptes |
| Boîte blanche (white box) | Code source, architecture, comptes à tous les niveaux de privilège | Maximiser la couverture et l'efficacité dans un temps contraint | Ne teste pas la difficulté réelle de découverte pour un attaquant externe |

> **Note.** Choix de l'approche
> La boîte grise est le compromis le plus courant en audit commercial : elle permet de couvrir en profondeur les fonctionnalités authentifiées (souvent les plus critiques) sans le coût d'une revue de code complète.

## Voir également

- [Methodologie-generale](Methodologie-generale.md)
- [Audit-Web-et-API-MOC](../Audit-Web-et-API-MOC.md)
