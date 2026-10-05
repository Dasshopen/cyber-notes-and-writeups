---
title: CSRF et SSRF
tags:
  - offensif/audit-web-api
  - pentest
  - web
  - owasp
  - csrf
  - ssrf
---

# CSRF et SSRF

> **Note.** Deux principes distincts
> Le CSRF (Cross-Site Request Forgery) exploite la confiance du serveur envers le navigateur authentifié d'une victime. Le SSRF (Server-Side Request Forgery) exploite la confiance du serveur envers ses propres capacités réseau. Bien que leurs acronymes se ressemblent, leurs mécanismes et impacts sont différents.

## CSRF

### Principe

Un attaquant force le navigateur d'une victime authentifiée à émettre une requête vers l'application cible, à son insu, en s'appuyant sur l'envoi automatique des cookies de session par le navigateur.

```html
<!-- Page hébergée par l'attaquant, visitée par la victime authentifiée -->
<html>
  <body onload="document.forms[0].submit()">
    <form action="https://exemple.tld/compte/email" method="POST">
      <input type="hidden" name="email" value="attaquant@evil.tld">
    </form>
  </body>
</html>
```

### Conditions d'exploitabilité

- Authentification basée sur des cookies envoyés automatiquement par le navigateur (session classique).
- Absence de jeton anti-CSRF (`csrf_token`) vérifié côté serveur.
- Cookie de session sans attribut `SameSite=Strict` ou `Lax` (ou action déclenchable en navigation top-level pour `Lax`).
- Absence de vérification de l'en-tête `Origin`/`Referer`.

> **Note.** Cas où le CSRF classique ne s'applique pas
> Une API authentifiée exclusivement par jeton porté dans l'en-tête `Authorization` (JWT, Bearer) n'est pas vulnérable au CSRF au sens classique, le navigateur ne l'envoyant pas automatiquement — sauf si le jeton est également stocké dans un cookie.

## SSRF

### Principe

Le serveur applicatif est amené à effectuer, pour le compte de l'attaquant, une requête vers une destination choisie par ce dernier — souvent via une fonctionnalité légitime (import d'image depuis une URL, webhook, génération de PDF depuis une URL).

```http
POST /import-image HTTP/1.1
Host: exemple.tld
Content-Type: application/json

{"url": "http://169.254.169.254/latest/meta-data/iam/security-credentials/"}
```

### Cibles typiques

| Cible | Intérêt pour l'attaquant |
|---|---|
| `http://169.254.169.254/...` (métadonnées cloud AWS/GCP/Azure) | Vol des identifiants IAM temporaires de l'instance |
| `http://localhost:PORT/` | Accès à des services internes non exposés (admin, base de données) |
| `file:///etc/passwd` | Lecture de fichiers locaux si le schéma `file://` n'est pas bloqué |
| Adresses RFC 1918 (`10.0.0.0/8`, `192.168.0.0/16`) | Cartographie et pivot vers le réseau interne |

### Contournement de filtres SSRF

| Filtre | Contournement possible |
|---|---|
| Blocage de `localhost` | `127.0.0.1`, `0.0.0.0`, `[::1]`, `127.1`, encodage décimal `2130706433` |
| Liste blanche de domaines | Redirection HTTP 302 vers l'IP interne depuis un domaine autorisé contrôlé par l'attaquant |
| Blocage d'IP privées connues | Enregistrement DNS public pointant vers une IP privée (DNS rebinding) |

> [!danger] Impact SSRF en environnement cloud
> Le vol de métadonnées d'instance cloud via SSRF est une des chaînes d'exploitation les plus critiques en environnement AWS/Azure/GCP : elle peut conduire à une prise de contrôle complète du compte cloud à partir d'une simple fonctionnalité d'import d'URL.

> **Note.** Cadre d'usage
> Le SSRF peut atteindre des ressources internes hors périmètre applicatif
> (métadonnées cloud, réseau interne) : le périmètre exact doit être couvert par
> le mandat — voir [Preambule-et-cadre-legal-Audit-Web-API](../00-Methodologie/Preambule-et-cadre-legal-Audit-Web-API.md).

## Voir également

- [Cross-Site-Scripting-XSS](Cross-Site-Scripting-XSS.md)
- [Controle-d-acces-defaillant-IDOR-et-path-traversal](Controle-d-acces-defaillant-IDOR-et-path-traversal.md)
- [Audit-Web-et-API-MOC](../Audit-Web-et-API-MOC.md)
