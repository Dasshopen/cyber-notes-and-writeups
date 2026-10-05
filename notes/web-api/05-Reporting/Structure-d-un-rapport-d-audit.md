---
title: Structure d'un rapport d'audit
tags:
  - offensif/audit-web-api
  - pentest
  - reporting
  - cvss
---

# Structure d'un rapport d'audit

> **Note.** Objectif
> Le rapport est le livrable central d'un audit : il doit permettre au client de comprendre l'exposition réelle, de reproduire chaque constat et de prioriser les actions de remédiation, y compris pour un lecteur non technique (synthèse managériale).

## Plan type

| Section | Contenu |
|---|---|
| Synthèse managériale (executive summary) | Contexte, périmètre, verdict global, nombre de constats par sévérité, tendance par rapport à un audit précédent le cas échéant — rédigé pour un lecteur non technique |
| Contexte et périmètre | Dates, mandat, environnements testés, comptes de test utilisés, exclusions |
| Méthodologie | Approche (boîte noire/grise/blanche), référentiels suivis (OWASP WSTG, Top 10) |
| Synthèse des constats | Tableau récapitulatif : identifiant, titre, sévérité, statut |
| Détail des constats | Une fiche par vulnérabilité (voir structure ci-dessous) |
| Annexes | Sorties d'outils bruts, captures d'écran complémentaires, matrice CVSS détaillée |

## Fiche de constat

Chaque vulnérabilité documentée suit une structure homogène :

```
Titre : intitulé clair et spécifique (éviter "Injection SQL" générique — préciser l'endpoint)
Sévérité : Critique / Élevée / Moyenne / Faible / Informative
Score CVSS : vecteur complet + score numérique
Endpoint(s) concerné(s) : URL(s) précise(s)
Description : mécanisme de la vulnérabilité, en termes clairs
Preuve de concept : requête(s)/réponse(s) exactes permettant la reproduction
Impact : conséquence métier concrète (pas seulement technique)
Recommandation : action de remédiation actionnable (voir Rédaction des recommandations)
Références : CWE, OWASP, CVE le cas échéant
```

## Notation de sévérité — CVSS

Le score CVSS (Common Vulnerability Scoring System, version 3.1 ou 4.0) objective la sévérité à partir de métriques (vecteur d'attaque, complexité, privilèges requis, interaction utilisateur, impacts CIA).

| Score CVSS | Sévérité |
|---|---|
| 9.0 – 10.0 | Critique |
| 7.0 – 8.9 | Élevée |
| 4.0 – 6.9 | Moyenne |
| 0.1 – 3.9 | Faible |
| 0.0 | Informative |

> **Note.** CVSS ne remplace pas le jugement contextuel
> Un score CVSS générique ne reflète pas toujours l'exposition réelle dans le contexte du client (donnée exposée réellement sensible, exploitabilité pratique, mesures compensatoires existantes). Le rapport doit expliciter tout écart entre le score brut et la priorisation finale recommandée.

## Reproductibilité

> **Note.** Exigence de reproductibilité
> Chaque constat doit inclure une preuve de concept suffisamment détaillée (requête HTTP complète, valeurs exactes utilisées) pour que l'équipe technique du client puisse reproduire la vulnérabilité sans échange complémentaire, puis valider la correction lors d'un retest.

## Voir également

- [Redaction-des-recommandations](Redaction-des-recommandations.md)
- [Methodologie-generale](../00-Methodologie/Methodologie-generale.md)
- [Audit-Web-et-API-MOC](../Audit-Web-et-API-MOC.md)
