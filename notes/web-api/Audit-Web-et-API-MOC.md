---
title: Audit Web et API - MOC
tags:
  - offensif/audit-web-api
  - pentest
  - web
  - api
  - MOC
  - owasp
  - securite
cssclasses:
  - moc
---

# 🌐 Audit Web et API — Carte du contenu

> **Note.** Cadre légal
> Les techniques décrites dans ce dossier ne doivent être mises en œuvre que dans le cadre d'une **autorisation écrite préalable** (mandat d'audit, ordre de mission, convention de test signée par le client ou le responsable du système ciblé) précisant le périmètre, les techniques autorisées, la fenêtre de test et les contacts d'urgence. Toute utilisation en dehors de ce cadre contractuel est susceptible de constituer une infraction pénale. Ce contenu est destiné à la formation et à la conduite d'audits autorisés.

> **Note.** À propos
> Ce dossier couvre la méthodologie d'audit de sécurité des applications web et des API : reconnaissance, cartographie de la surface d'attaque, tests de vulnérabilités (OWASP Top 10 web et OWASP API Security Top 10), outillage et restitution des résultats sous forme de rapport.

## 0. Méthodologie

- [Preambule-et-cadre-legal-Audit-Web-API](00-Methodologie/Preambule-et-cadre-legal-Audit-Web-API.md) — objectif du guide, cadre contractuel, boîte noire/grise/blanche
- [Methodologie-generale](00-Methodologie/Methodologie-generale.md) — cycle recon → cartographie → tests → exploitation → reporting, référentiels OWASP

## 1. Reconnaissance et cartographie

- [Cartographie-de-la-surface-d-attaque](01-Reconnaissance-et-cartographie/Cartographie-de-la-surface-d-attaque.md) — sous-domaines, fingerprinting, endpoints
- [Decouverte-de-contenu](01-Reconnaissance-et-cartographie/Decouverte-de-contenu.md) — fuzzing de répertoires/fichiers, wordlists
- [Decouverte-des-specifications-API](01-Reconnaissance-et-cartographie/Decouverte-des-specifications-API.md) — Swagger/OpenAPI, Postman, versionnement

## 2. Vulnérabilités web classiques (OWASP Top 10)

- [Injection-SQL](02-Vulnerabilites-web-classiques/Injection-SQL.md) — principe, détection, exploitation, impact
- [Injection-NoSQL-MongoDB](02-Vulnerabilites-web-classiques/Injection-NoSQL-MongoDB.md) — injection d'opérateur, contournement d'authentification
- [Injection-Cypher-Neo4j](02-Vulnerabilites-web-classiques/Injection-Cypher-Neo4j.md) — moteur de graphe, exfiltration LOAD CSV
- [Cross-Site-Scripting-XSS](02-Vulnerabilites-web-classiques/Cross-Site-Scripting-XSS.md) — reflected/stored/DOM/self, exfiltration de cookies
- [CSRF-et-SSRF](02-Vulnerabilites-web-classiques/CSRF-et-SSRF.md) — deux principes distincts, exploitation, impact
- [Controle-d-acces-defaillant-IDOR-et-path-traversal](02-Vulnerabilites-web-classiques/Controle-d-acces-defaillant-IDOR-et-path-traversal.md) — méthodologie de test
- [Deserialisation-et-injection-de-gabarits-SSTI](02-Vulnerabilites-web-classiques/Deserialisation-et-injection-de-gabarits-SSTI.md) — principe, détection
- [Enumeration-et-brute-force-d-authentification](02-Vulnerabilites-web-classiques/Enumeration-et-brute-force-d-authentification.md) — user enum, jetons de reset, HTTP Basic, OSINT (Wayback, dorks)

## 3. Spécificités API

- [Authentification-API-JWT-OAuth2-cles-API](03-Specificites-API/Authentification-API-JWT-OAuth2-cles-API.md) — vue d'ensemble JWT, OAuth2/OIDC, clés API
- [Attaques-sur-les-JWT](03-Specificites-API/Attaques-sur-les-JWT.md) — alg:none, confusion RS256/HS256, kid/jwk, cassage HMAC
- [BOLA-Exces-d-autorisation-au-niveau-objet](03-Specificites-API/BOLA-Exces-d-autorisation-au-niveau-objet.md) — OWASP API Top 10, méthodologie
- [Rate-limiting-et-abus-de-logique-metier](03-Specificites-API/Rate-limiting-et-abus-de-logique-metier.md) — absence de limitation, contournement de workflow

## 4. Outils

- [Outil-Burp-Suite](04-Outils/Outil-Burp-Suite.md) — Proxy, Repeater, Intruder, extensions
- [Outil-ffuf](04-Outils/Outil-ffuf.md) — fuzzing de contenu et de paramètres
- [Outil-sqlmap](04-Outils/Outil-sqlmap.md) — automatisation de l'exploitation SQLi
- [Outil-Nuclei](04-Outils/Outil-Nuclei.md) — scan par templates

## 5. Reporting

- [Structure-d-un-rapport-d-audit](05-Reporting/Structure-d-un-rapport-d-audit.md) — sévérité (CVSS), reproductibilité
- [Redaction-des-recommandations](05-Reporting/Redaction-des-recommandations.md) — remédiation actionnable, risque technique vs métier

## 6. Annexes

- [Cheat-sheet-Payloads-et-commandes](06-Annexes/Cheat-sheet-Payloads-et-commandes.md) — payloads et commandes courantes
- [Ressources-et-references-Audit-Web-API](06-Annexes/Ressources-et-references-Audit-Web-API.md) — OWASP, PortSwigger Web Security Academy, PayloadsAllTheThings

---

## Index par tag

- Méthodologie : #pentest #methodologie #owasp #legal
- Vulnérabilités web : #injection #sqli #nosql #cypher #xss #csrf #ssrf #idor #ssti #controle-acces #brute-force
- API : #api #jwt #oauth #bola #authentification #rate-limiting
- Outils : #outil #burpsuite #ffuf #sqlmap #nuclei #scan #fuzzing
- Reporting : #reporting #cvss #cheatsheet #ressources
