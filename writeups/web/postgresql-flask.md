# Challenge Web — PostgreSQL, session Flask et templates

> **Statut : récit partiel.** Le passage à un compte administrateur est rapporté
> dans les notes. La récupération du flag n'est pas documentée dans le texte.

## Objectif et contexte

Les premières observations ont été réalisées avec les outils du navigateur et Burp
Suite. Une indication sur le site orientait les recherches vers PostgreSQL. Le nom
exact du challenge et l'énoncé ne sont pas conservés dans cette note.

## 1. Examiner la recherche

J'ai commencé par étudier une éventuelle injection SQL. Les notes indiquent que
certaines entrées provoquaient une erreur, tandis que d'autres produisaient une
réponse exploitable. Les requêtes exactes figuraient dans des captures et ne sont
pas disponibles dans le texte.

## 2. Comprendre les données retournées

Les observations mentionnent trois colonnes et une table `users`. Les champs
`username` et `password` ont ensuite été examinés ensemble. Une analyse hors ligne
de la valeur associée au compte administrateur a été envisagée.

Les notes ne précisent ni le format de cette valeur ni le résultat de cette analyse.
Il serait donc incorrect de présenter cette étape comme une récupération de mot de
passe réussie.

## 3. Étudier la session Flask

Une valeur décrite comme un secret Flask et un cookie de session apparaissaient dans
les notes initiales. Ils ne sont pas reproduits dans cette version : `[REDACTED]`.

La commande de décodage consignée était :

```bash
flask-unsign --decode --cookie "flask Cookie"
```

`flask Cookie` est ici un libellé de remplacement. Les notes rapportent ensuite un
accès administrateur, sans conserver les étapes nécessaires à sa reproduction.

## 4. Examiner le moteur de templates

Un exemple visible dans l'interface d'export a orienté les recherches vers Jinja.
Le journal mentionne plusieurs essais et la lecture de fichiers dont `app.py` et
`entrypoint.sh`. Les entrées exactes et les réponses ne sont pas disponibles dans
le texte conservé.

## Bilan

Ce cas illustre l'intérêt d'analyser séparément la recherche, les données retournées,
la gestion de session et le rendu des templates. En revanche, le journal ne suffit
pas à établir une chaîne complète et reproductible : il manque l'énoncé, les
requêtes, les réponses et la validation finale.
