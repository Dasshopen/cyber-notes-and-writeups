---
title: Ressources et références — Audit Web API
tags:
  - offensif/audit-web-api
  - pentest
  - ressources
  - owasp
---

# Ressources et références

> **Note.** Objectif
> Sélection de ressources de référence pour approfondir la méthodologie et se tenir à jour sur les techniques d'audit web et API.

## OWASP

| Ressource | Contenu |
|---|---|
| OWASP Top 10 | Dix catégories de risques web les plus critiques, référence de classification |
| OWASP API Security Top 10 | Équivalent pour les API (BOLA, BFLA, assignation de masse, etc.) |
| OWASP Testing Guide (WSTG) | Méthodologie de test détaillée par catégorie |
| OWASP Cheat Sheet Series | Fiches de bonnes pratiques de développement sécurisé par sujet |
| OWASP ASVS (Application Security Verification Standard) | Référentiel d'exigences de sécurité, utilisable comme grille d'audit en boîte blanche |

## Plateformes d'entraînement

| Plateforme | Contenu |
|---|---|
| PortSwigger Web Security Academy | Labs gratuits couvrant l'ensemble des classes de vulnérabilités web, avec explications détaillées ; référence pour la montée en compétence |
| PentesterLab | Exercices pratiques orientés CVE réelles et code source |
| HackTheBox / TryHackMe (modules web) | Mises en situation combinant plusieurs vulnérabilités |
| crAPI / DVWA / OWASP Juice Shop | Applications volontairement vulnérables à déployer en local pour l'entraînement |

## Bases de payloads et wordlists

| Ressource | Contenu |
|---|---|
| PayloadsAllTheThings | Dépôt exhaustif de payloads par catégorie de vulnérabilité |
| SecLists | Wordlists de référence (répertoires, mots de passe, fuzzing de paramètres) |
| GTFOBins / LOLBAS | Techniques d'abus de binaires légitimes, utiles après RCE côté serveur |

## Suivi de veille

- Bulletins CVE des technologies couramment rencontrées en audit (CMS, frameworks web, serveurs applicatifs).
- Publications techniques PortSwigger (recherche annuelle « Top 10 web hacking techniques »).
- Comptes-rendus de bug bounty publics (HackerOne, Bugcrowd disclosed reports) illustrant des chaînes d'exploitation réelles.

> **Note.** Usage pédagogique
> Les plateformes d'entraînement listées ici sont conçues pour la pratique légale : elles fournissent un terrain d'expérimentation sans les contraintes de mandat applicables à une cible réelle, à privilégier pour tout apprentissage ou démonstration en formation.

## Voir également

- [Methodologie-generale](../00-Methodologie/Methodologie-generale.md)
- [Audit-Web-et-API-MOC](../Audit-Web-et-API-MOC.md)
