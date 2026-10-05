---
title: Outil - Burp Suite
tags:
  - offensif/audit-web-api
  - pentest
  - outil
  - web
  - api
---

# Outil - Burp Suite

> **Note.** Présentation
> Burp Suite (PortSwigger) est la plateforme de référence pour l'audit manuel d'applications web et d'API : proxy d'interception, modification de requêtes à la volée et suite d'extensions couvrant l'essentiel des besoins d'un test d'intrusion applicatif.

## Proxy

Intercepte le trafic entre le navigateur (ou un client API) et l'application cible, permettant l'observation et la modification de chaque requête/réponse.

```
Navigateur → Burp Proxy (127.0.0.1:8080) → Application cible
```

> **Note.** Certificat pour le trafic HTTPS
> Installer le certificat CA de Burp (`http://burp` une fois le proxy configuré) dans le magasin de confiance du navigateur ou de l'appareil mobile testé, faute de quoi les connexions TLS échouent (erreur de certificat).

## Repeater

Permet de renvoyer manuellement, de façon répétée, une requête capturée en modifiant librement ses paramètres — outil central pour valider une hypothèse de vulnérabilité pas à pas (injection, contrôle d'accès, manipulation de jeton).

## Intruder

Automatise l'envoi d'un grand nombre de variantes d'une même requête à partir d'une position d'insertion marquée, utile pour le fuzzing de paramètres, le bruteforce d'authentification ou l'énumération d'identifiants (IDOR).

| Type d'attaque | Usage |
|---|---|
| Sniper | Une position, une liste de charges utiles — fuzzing simple d'un paramètre |
| Battering ram | Une même charge utile insérée simultanément à plusieurs positions |
| Pitchfork | Plusieurs positions, une liste de charges par position, avancement synchronisé |
| Cluster bomb | Plusieurs positions, toutes les combinaisons possibles entre les listes |

## Extensions utiles (BApp Store)

| Extension | Usage |
|---|---|
| Autorize | Automatise les tests de contrôle d'accès (IDOR/BOLA) en rejouant chaque requête avec un second jeton |
| JWT Editor | Édition, forge et attaque de jetons JWT (`alg:none`, confusion de clé) |
| Turbo Intruder | Envoi de requêtes à très haute fréquence, utile pour les tests de race condition |
| Logger++ | Journalisation avancée et filtrage du trafic proxy |
| Param Miner | Découverte de paramètres HTTP cachés, y compris via le cache web |
| Software Vulnerability Scanner | Détection de composants tiers obsolètes via les en-têtes et empreintes |

## Voir également

- [Cross-Site-Scripting-XSS](../02-Vulnerabilites-web-classiques/Cross-Site-Scripting-XSS.md)
- [BOLA-Exces-d-autorisation-au-niveau-objet](../03-Specificites-API/BOLA-Exces-d-autorisation-au-niveau-objet.md)
- [Audit-Web-et-API-MOC](../Audit-Web-et-API-MOC.md)
