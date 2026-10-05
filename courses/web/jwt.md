# JWT — Deux erreurs de validation à connaître

## Objet de la note

Les notes du cours distinguent deux familles d'erreurs : l'acceptation d'un jeton
sans signature et la confusion entre algorithmes de signature.

## 1. Acceptation de `none`

Un problème apparaît si le serveur accepte un jeton non signé alors que son contexte
exige une signature vérifiée. Le nom d'un algorithme dans le jeton ne constitue
pas, à lui seul, une preuve de validation.

## 2. Confusion entre HS256 et RS256

- **HS256** utilise un mécanisme HMAC et un secret partagé.
- **RS256** utilise une signature RSA avec une paire de clés.

Les notes attirent l'attention sur une mauvaise gestion du choix d'algorithme et
du type de clé. Elles ne contiennent ni code serveur ni résultat de test : cette
fiche décrit donc des concepts, pas une vulnérabilité confirmée sur une application.
