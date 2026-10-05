# Burp Repeater — Méthodologie propre

## Baseline

Toujours garder une requête qui fonctionne normalement.

Exemple :

```http
POST /search HTTP/2
Content-Type: application/x-www-form-urlencoded

q=stagiaire
```

Résultat attendu : `Bienvenue stagiaire`.

## Un seul changement à la fois

Mauvais : changer méthode, URL, body, cookies et headers ensemble.

Bon :

```text
q=stagiaire
```

puis uniquement :

```text
q='
```

## Toujours récupérer la vraie requête navigateur

1. Faire l’action dans le navigateur.
2. Burp → HTTP History.
3. Récupérer la requête exacte.
4. Send to Repeater.
5. Modifier uniquement le paramètre testé.

## Différencier les réponses

Noter :
- code HTTP ;
- longueur ;
- message d’erreur ;
- nombre de résultats ;
- headers ;
- cookies ;
- redirections.

Exemples utiles :

```text
200 + Aucun résultat
200 + Requête invalide
200 + Ghost filter
302 + Set-Cookie
403 Forbidden
```

## GET vs POST

Si le formulaire dit :

```html
<form method="post">
```

le vrai test doit être fait en POST.

## OPTIONS / HEAD

```http
OPTIONS /note/4
```

Regarder `Allow:`.

`HEAD` peut parfois révéler :
- `Content-Length`
- `ETag`
- `Last-Modified`

Mais si rien ne change, ne pas s’acharner.

## Mémo rapide

Toujours noter :

```text
Entrée :
Réponse :
Conclusion :
```
