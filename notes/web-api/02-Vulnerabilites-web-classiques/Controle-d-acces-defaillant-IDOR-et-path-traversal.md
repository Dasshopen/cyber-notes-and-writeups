---
title: Contrôle d'accès défaillant (IDOR et path traversal)
tags:
  - offensif/audit-web-api
  - pentest
  - web
  - owasp
  - idor
  - controle-acces
---

# Contrôle d'accès défaillant (IDOR et path traversal)

> **Note.** Principe
> Catégorie A01:2021 (Broken Access Control), première place de l'OWASP Top 10 2021. Regroupe les défauts de vérification des droits d'un utilisateur sur une ressource ou une action, dont les deux formes les plus fréquentes sont l'IDOR et le path traversal.

## IDOR (Insecure Direct Object Reference)

### Principe

L'application expose une référence directe à un objet (identifiant en base, nom de fichier) sans vérifier que l'utilisateur authentifié est autorisé à accéder à cet objet précis.

```http
GET /api/factures/1042 HTTP/1.1
Authorization: Bearer <jeton_utilisateur_A>

# Remplacement de l'identifiant par celui d'un autre utilisateur
GET /api/factures/1043 HTTP/1.1
Authorization: Bearer <jeton_utilisateur_A>
```

Si la facture 1043 appartient à un autre utilisateur et qu'elle est retournée sans erreur d'autorisation : IDOR confirmé.

### Méthodologie de test

1. Créer deux comptes de test avec des rôles/privilèges identiques (A et B).
2. Identifier chaque référence d'objet manipulée par l'utilisateur (ID numérique, UUID, nom de fichier, slug).
3. Pour chaque endpoint retournant un objet, rejouer la requête du compte A avec l'identifiant d'un objet appartenant à B, et inversement.
4. Tester également en écriture (PUT/PATCH/DELETE), pas uniquement en lecture.
5. Tester le cas non-authentifié (accès anonyme à un objet privé).

> **Note.** UUID non aléatoire
> Un identifiant UUID n'est pas une protection en soi contre l'IDOR : la vulnérabilité réside dans l'absence de contrôle d'autorisation, pas dans la prévisibilité de l'identifiant. Il complique seulement l'énumération en masse.

## Path traversal

### Principe

Une entrée utilisateur contrôlant un chemin de fichier permet, en insérant des séquences `../`, d'accéder à des fichiers en dehors du répertoire prévu.

```http
GET /download?file=../../../../etc/passwd HTTP/1.1
Host: exemple.tld
```

### Techniques de contournement de filtres

| Filtre | Contournement |
|---|---|
| Suppression d'une occurrence de `../` | `....//....//` (redevient `../../` après suppression naïve) |
| Encodage URL simple bloqué | Double encodage : `%252e%252e%252f` |
| Séparateur `/` filtré | Séparateur Windows `\`, ou encodé `%5c` |
| Extension de fichier imposée | Null byte historique `%00.jpg` (obsolète sur runtimes récents), ou troncature de chemin |

```bash
# Test automatisé de path traversal
ffuf -u "https://exemple.tld/download?file=FUZZ" \
  -w /opt/SecLists/Fuzzing/LFI/LFI-Jhaddix.txt -mr "root:.*:0:0"
```

## Impact

- Lecture de données appartenant à d'autres utilisateurs (violation de confidentialité, RGPD).
- Modification ou suppression de ressources d'autrui.
- Lecture de fichiers systèmes sensibles (`/etc/passwd`, fichiers de configuration contenant des secrets).
- Élévation de privilèges horizontale ou verticale.

> **Note.** Cadre d'usage
> L'accès à des données d'autres utilisateurs, même par simple modification d'un
> identifiant, doit rester strictement dans le périmètre autorisé — voir
> [Preambule-et-cadre-legal-Audit-Web-API](../00-Methodologie/Preambule-et-cadre-legal-Audit-Web-API.md).

## Voir également

- [BOLA-Exces-d-autorisation-au-niveau-objet](../03-Specificites-API/BOLA-Exces-d-autorisation-au-niveau-objet.md)
- [Methodologie-generale](../00-Methodologie/Methodologie-generale.md)
- [Audit-Web-et-API-MOC](../Audit-Web-et-API-MOC.md)
