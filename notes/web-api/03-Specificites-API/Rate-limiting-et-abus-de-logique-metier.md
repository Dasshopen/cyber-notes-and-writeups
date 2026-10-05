---
title: Rate limiting et abus de logique métier
tags:
  - offensif/audit-web-api
  - pentest
  - api
  - owasp
  - rate-limiting
  - logique-metier
---

# Rate limiting et abus de logique métier

> **Note.** Objectif
> L'absence de limitation de débit (API4:2023 — Unrestricted Resource Consumption) et les défauts de logique métier permettent des abus qui ne relèvent pas d'une injection technique classique, mais d'un détournement du fonctionnement prévu de l'application.

## Absence de rate limiting

### Points de test prioritaires

| Endpoint | Risque en l'absence de limitation |
|---|---|
| Authentification (login) | Bruteforce de mots de passe |
| Réinitialisation de mot de passe / OTP | Bruteforce du code de vérification (souvent 4 à 6 chiffres) |
| Création de compte | Création massive de comptes, contournement de quotas |
| Endpoints coûteux en ressources (export, recherche, génération de rapport) | Déni de service applicatif par épuisement des ressources serveur |
| Endpoints facturés à l'usage | Abus économique (consommation de crédits/API tierces payantes au nom du service) |

```bash
# Test de rate limiting sur un endpoint d'authentification
ffuf -u https://exemple.tld/api/login -X POST \
  -d '{"email":"victime@exemple.tld","password":"FUZZ"}' \
  -H "Content-Type: application/json" \
  -w mots_de_passe.txt -mc 200,401 -rate 50
```

> **Note.** Prudence sur les tests de volumétrie
> Les tests de rate limiting génèrent un volume de requêtes important : les borner explicitement dans le [mandat d'audit](../00-Methodologie/Preambule-et-cadre-legal-Audit-Web-API.md) et coordonner avec le client la fenêtre de test pour éviter tout impact sur la production ou déclenchement de fausses alertes SOC non planifiées.

### Contournement de limitations existantes

| Mécanisme de limitation | Contournement possible |
|---|---|
| Limitation par adresse IP | Rotation via en-têtes falsifiables (`X-Forwarded-For`, `X-Real-IP`) si l'application leur fait confiance |
| Limitation par compte | Création de comptes multiples si l'inscription n'est pas elle-même limitée |
| Limitation par jeton de session | Génération de nouveaux jetons/sessions plus rapide que le renouvellement de la fenêtre de limitation |

## Abus de logique métier

Vulnérabilités propres au fonctionnement métier de l'application, non détectables par un scanner générique — elles nécessitent une compréhension du processus métier testé.

| Cas type | Exemple |
|---|---|
| Contournement d'étapes d'un workflow | Accéder directement à l'étape de confirmation d'une commande sans passer par le paiement, en devinant/rejouant l'URL de l'étape suivante |
| Manipulation de prix côté client | Modification du prix ou de la quantité dans une requête interceptée avant validation côté serveur |
| Réutilisation de code promotionnel | Code promo à usage unique réutilisable en rejouant la requête ou en la parallélisant (race condition) |
| Race condition sur une opération unique | Envoi simultané de multiples requêtes de retrait/validation pour dépasser une limite censée être unitaire (ex. : double dépense d'un même crédit) |

```bash
# Test de race condition avec envoi de requêtes concurrentes
# (approche "single-packet attack" recommandée par PortSwigger pour minimiser la gigue réseau)
# via Burp Repeater "Send group in parallel" ou l'extension Turbo Intruder
```

> **Note.** Cartographier le workflow avant de tester
> L'abus de logique métier se découvre en modélisant le processus attendu (diagramme d'états) puis en cherchant systématiquement les transitions que l'application n'interdit pas explicitement côté serveur.

## Voir également

- [BOLA-Exces-d-autorisation-au-niveau-objet](BOLA-Exces-d-autorisation-au-niveau-objet.md)
- [Methodologie-generale](../00-Methodologie/Methodologie-generale.md)
- [Audit-Web-et-API-MOC](../Audit-Web-et-API-MOC.md)
