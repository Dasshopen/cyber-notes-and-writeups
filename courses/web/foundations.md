# Pentest Web — Architecture et méthodologie

## Objectif de la fiche

Organiser les notions prises pendant le cours du 28 septembre 2026. Les chiffres
et recommandations sans source sont isolés plutôt que présentés comme des règles.

## 1. Comprendre l'architecture

Une application web associe un client, un serveur et, souvent, une base de données.
Les notes citent PHP, JavaScript et Ruby côté serveur ; JavaScript et les technologies
du navigateur côté client. jQuery, Bootstrap et React sont à distinguer des langages
serveur. Flash est une technologie historique, pas une recommandation actuelle.

Les bases citées sont Oracle, MySQL, Microsoft SQL Server, PostgreSQL et MongoDB.
WordPress, Shopify et Wix apparaissent dans les notes sur les plateformes de contenu.

## 2. Protocoles et échanges

- **HTTP/HTTPS** : échanges entre le navigateur et l'application.
- **WebSocket** : échanges sur une connexion persistante, notamment pour les interfaces
  de messagerie ou de mise à jour en temps réel.
- **API SOAP** : échanges reposant notamment sur XML.
- **API REST** : style d'architecture ; les exemples de cours utilisent JSON.

La liste initiale des couches OSI mélangeait technologies et interfaces de programmation.
Elle n'est pas reprise comme un tableau de référence : ce point reste à vérifier.

## 3. Encadrer l'audit

Les *Rules of Engagement* (ROE) précisent les limites des tests. Avant toute opération,
il faut comprendre ses conséquences et respecter le périmètre autorisé.

Le déroulement consigné est : comprendre le système, cartographier l'application,
identifier des pistes, vérifier les résultats manuellement, puis rédiger le rapport.

Un outil automatique aide à repérer des pistes ; il ne suffit pas à confirmer une faille.
La restitution doit expliquer l'impact et les éléments du score, pas seulement afficher
un chiffre CVSS.

## 4. Outils cités

| Usage | Exemples présents dans les notes |
| --- | --- |
| Proxy et observation HTTP | Burp Suite, Caido, ZAP |
| Cartographie et tests | Nmap, Nuclei, Wfuzz |
| Analyse ciblée d'injections | sqlmap, Ghauri |
| Observation du navigateur | Wappalyzer, gestionnaires de cookies et de proxy |

Les fonctionnalités à distinguer sont le crawler, le scanner, l'analyse de jetons
et la comparaison de réponses. Le choix d'un outil dépend du contexte et des règles.

## Points à vérifier

Les notes mentionnaient un délai moyen de correction de 33 jours, une valeur
d'entropie de 80 et des longueurs de mots de passe de 14, 16 et 20 caractères.
Aucune source ni condition d'application n'était fournie : ces nombres ne sont
pas présentés comme des recommandations vérifiées.
