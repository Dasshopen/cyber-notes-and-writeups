---
title: Outil - Nuclei
tags:
  - offensif/audit-web-api
  - pentest
  - outil
  - web
  - api
  - scan
---

# Outil - Nuclei

> **Note.** Présentation
> Nuclei (ProjectDiscovery) est un scanner basé sur des templates YAML communautaires, couvrant CVE connues, mauvaises configurations, expositions de fichiers sensibles et vulnérabilités génériques. Il complète les tests manuels sans s'y substituer.

## Utilisation de base

```bash
# Mise à jour des templates communautaires
nuclei -update-templates

# Scan d'une cible unique, sévérité moyenne et plus
nuclei -u https://exemple.tld -severity medium,high,critical

# Scan d'une liste de cibles issue de la reconnaissance
nuclei -l httpx.txt -o resultats-nuclei.txt
```

## Sélection de templates

```bash
# Restreindre à des catégories précises
nuclei -u https://exemple.tld -tags cve,exposure,misconfiguration

# Restreindre aux templates spécifiques à une technologie identifiée en fingerprinting
nuclei -u https://exemple.tld -tags wordpress

# Exclure les templates générant beaucoup de bruit (dns, fuzzing lourd)
nuclei -u https://exemple.tld -etags dos,fuzz
```

| Option | Rôle |
|---|---|
| `-tags` | Filtre les templates par étiquette (cve, exposure, tech, misconfiguration…) |
| `-severity` | Filtre par sévérité (info, low, medium, high, critical) |
| `-rl` | Limite le nombre de requêtes par seconde (rate limit) |
| `-c` | Nombre de cibles traitées en concurrence |
| `-headless` | Active les templates nécessitant un rendu navigateur (XSS DOM, etc.) |

## Templates personnalisés

```yaml
id: exposition-fichier-env
info:
  name: Exposition de fichier .env
  severity: high
http:
  - method: GET
    path:
      - "{{BaseURL}}/.env"
    matchers:
      - type: word
        words:
          - "DB_PASSWORD"
```

> **Note.** Nuclei ne remplace pas l'analyse manuelle
> Les templates communautaires détectent des signatures connues et des mauvaises configurations génériques ; ils ne couvrent pas la logique métier propre à l'application (IDOR, BOLA, abus de workflow), qui nécessite une analyse manuelle contextualisée.

> **Note.** Positionnement dans le cycle d'audit
> Nuclei est le plus rentable en phase de reconnaissance (voir [Cartographie-de-la-surface-d-attaque](../01-Reconnaissance-et-cartographie/Cartographie-de-la-surface-d-attaque.md)), pour dégrossir rapidement les expositions évidentes avant de concentrer l'effort manuel sur les fonctionnalités métier.

## Voir également

- [Cartographie-de-la-surface-d-attaque](../01-Reconnaissance-et-cartographie/Cartographie-de-la-surface-d-attaque.md)
- [Decouverte-de-contenu](../01-Reconnaissance-et-cartographie/Decouverte-de-contenu.md)
- [Audit-Web-et-API-MOC](../Audit-Web-et-API-MOC.md)
