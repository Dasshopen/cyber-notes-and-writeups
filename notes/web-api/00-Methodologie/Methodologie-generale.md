---
title: Méthodologie générale
tags:
  - offensif/audit-web-api
  - pentest
  - methodologie
  - owasp
---

# Méthodologie générale

> **Note.** Cycle d'un audit
> Un audit web/API suit un cycle en cinq phases, itératif : reconnaissance, cartographie, tests, exploitation, reporting. Cette note décrit ce cycle et positionne les référentiels OWASP utilisés dans le reste du dossier.

## Cycle général

```
Reconnaissance → Cartographie → Tests de vulnérabilités → Exploitation → Reporting
        ↑______________________________________________________|
                     (itération sur découvertes)
```

1. **Reconnaissance** — collecte passive et active d'informations sur la cible (voir [Cartographie-de-la-surface-d-attaque](../01-Reconnaissance-et-cartographie/Cartographie-de-la-surface-d-attaque.md)).
2. **Cartographie** — inventaire exhaustif des fonctionnalités, endpoints, rôles et flux de données ([Decouverte-de-contenu](../01-Reconnaissance-et-cartographie/Decouverte-de-contenu.md), [Decouverte-des-specifications-API](../01-Reconnaissance-et-cartographie/Decouverte-des-specifications-API.md)).
3. **Tests de vulnérabilités** — application systématique des familles de tests (OWASP Top 10, OWASP API Security Top 10) sur chaque endpoint/fonctionnalité cartographié.
4. **Exploitation** — démonstration maîtrisée de l'impact réel d'une faille (preuve de concept), sans dépasser le périmètre autorisé ni dégrader le service.
5. **Reporting** — formalisation des constats, de leur sévérité et des recommandations ([Structure-d-un-rapport-d-audit](../05-Reporting/Structure-d-un-rapport-d-audit.md)).

> **Note.** Exploitation maîtrisée
> L'exploitation en audit n'est pas une fin en soi : elle doit rester proportionnée (preuve de concept minimale) et ne jamais compromettre la disponibilité ou l'intégrité des données de production sans accord explicite du client.

## Référentiels

- **OWASP Testing Guide (WSTG)** — méthodologie détaillée de test, organisée par catégorie (gestion de configuration, authentification, gestion de session, validation des entrées, logique métier, etc.). Référence pour construire un plan de tests exhaustif.
- **OWASP Top 10** — dix catégories de risques les plus critiques pour les applications web, révisées périodiquement (édition 2021 en vigueur).
- **OWASP API Security Top 10** — équivalent pour les API, avec des catégories spécifiques (BOLA, excès d'autorisation au niveau fonction, assignation de masse, etc.).

| Référentiel | Portée | Usage principal |
|---|---|---|
| OWASP WSTG | Méthodologie de test complète | Construire un plan de tests et une checklist |
| OWASP Top 10 (web) | 10 catégories de risque | Prioriser et classer les constats web |
| OWASP API Security Top 10 | 10 catégories de risque API | Prioriser et classer les constats API |

## Organisation d'une mission type

| Jour | Activité |
|---|---|
| J1 | Cadrage, reconnaissance, cartographie |
| J2-J4 | Tests systématiques par catégorie OWASP, sur chaque rôle |
| J5 | Exploitation ciblée des constats à fort impact, vérifications croisées |
| J6 | Rédaction du rapport, contre-vérification (retest le cas échéant) |

## Voir également

- [Preambule-et-cadre-legal-Audit-Web-API](Preambule-et-cadre-legal-Audit-Web-API.md)
- [Structure-d-un-rapport-d-audit](../05-Reporting/Structure-d-un-rapport-d-audit.md)
- [Audit-Web-et-API-MOC](../Audit-Web-et-API-MOC.md)
