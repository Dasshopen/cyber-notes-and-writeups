---
title: Rédaction des recommandations
tags:
  - offensif/audit-web-api
  - pentest
  - reporting
---

# Rédaction des recommandations

> **Note.** Objectif
> Une recommandation n'a de valeur que si elle est actionnable : elle doit permettre à une équipe technique de corriger la vulnérabilité sans devoir elle-même concevoir la solution, et être reliée explicitement au risque métier qu'elle réduit.

## Formuler une remédiation actionnable

| Recommandation à éviter (trop générique) | Recommandation actionnable |
|---|---|
| « Sécuriser l'authentification » | « Implémenter une limitation à 5 tentatives par compte sur 15 minutes sur l'endpoint `/api/login`, avec verrouillage progressif » |
| « Corriger l'injection SQL » | « Remplacer la concaténation de chaînes par des requêtes préparées (PDO `prepare()`/`bindParam()`) sur l'ensemble des points d'entrée listés en annexe A » |
| « Améliorer le contrôle d'accès » | « Ajouter une vérification systématique, côté serveur, que l'`utilisateur_id` du jeton correspond à l'`utilisateur_id` de l'objet demandé, sur les 14 endpoints listés » |

## Structure d'une recommandation

1. **Action corrective immédiate** — traitement du symptôme précis identifié (ex. : échapper l'entrée, ajouter le contrôle manquant).
2. **Action structurelle** — traitement de la cause racine si elle dépasse le constat isolé (ex. : middleware d'autorisation centralisé plutôt qu'un correctif endpoint par endpoint).
3. **Vérification** — critère permettant de confirmer que le correctif est effectif (test de non-régression, condition de retest).

> **Note.** Regrouper les recommandations structurelles
> Lorsque plusieurs constats partagent une cause racine (ex. : absence de requêtes préparées sur tout le code), formuler une recommandation structurelle unique référençant l'ensemble des constats concernés plutôt que de répéter la même remédiation dans chaque fiche.

## Différencier risque technique et risque métier

| Dimension | Question posée | Exemple de formulation |
|---|---|---|
| Risque technique | Quelle est la faisabilité et la sévérité de l'exploitation ? | « Exploitable sans authentification, complexité faible, score CVSS 9.1 » |
| Risque métier | Quel est l'impact sur l'activité si la vulnérabilité est exploitée ? | « Exposition de l'intégralité de la base clients (données personnelles au sens RGPD), risque de notification CNIL et d'atteinte à la réputation » |

> **Note.** Le score technique seul ne priorise pas toujours correctement
> Une vulnérabilité de sévérité technique moyenne peut représenter un risque métier majeur (ex. : fuite d'un identifiant unique permettant l'accès à des données de santé), justifiant une priorisation supérieure au score CVSS brut dans la synthèse managériale.

## Priorisation

| Priorité | Critère |
|---|---|
| Immédiate | Exploitable sans authentification, impact critique, correctif simple |
| Court terme | Sévérité élevée ou moyenne avec exposition réelle confirmée |
| Moyen terme | Recommandations structurelles nécessitant un développement ou une revue d'architecture |
| Bonnes pratiques | Renforcement défensif sans vulnérabilité exploitée démontrée (durcissement) |

## Voir également

- [Structure-d-un-rapport-d-audit](Structure-d-un-rapport-d-audit.md)
- [Audit-Web-et-API-MOC](../Audit-Web-et-API-MOC.md)
