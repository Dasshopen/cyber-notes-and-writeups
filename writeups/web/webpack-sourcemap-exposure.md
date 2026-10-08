# Webpack — Retrouver une donnée exposée dans les source maps

> **Statut : challenge validé par l'auteur.** Ce récit reprend ma démarche de
> résolution ; il n'a pas fait l'objet d'un rejeu indépendant. La valeur de
> validation est masquée. Aucun nom de plateforme, code propriétaire ou capture
> de l'application du challenge n'est reproduit.

## Contexte et objectif

L'application était un frontend Vue.js compilé avec Webpack. Des source maps
accessibles côté client permettaient au navigateur de retrouver une partie
des fichiers sources originaux. L'objectif était d'identifier la donnée de
validation exposée par cette configuration.

Les extraits ci-dessous sont des illustrations génériques. Le
[mini-lab associé](../../labs/web/webpack-sourcemap-exposure/README.md) sert
uniquement de support pédagogique : il ne reproduit ni l'application Vue
du challenge ni sa résolution.

## 1. Repérer les sources dans DevTools

J'ai commencé dans l'onglet **Sources** des outils de développement du navigateur.
Une arborescence `webpack://` présentait notamment des fichiers correspondant
à la structure de l'application :

```text
src/
├── App.vue
├── main.js
├── router/
│   └── index.js
└── components/
```

Cette vue m'a orienté vers les source maps : je pouvais étudier des sources
reconstruites plutôt que seulement le bundle JavaScript compilé.

## 2. Examiner le router Vue

J'ai ouvert `src/router/index.js` pour comprendre les chemins et les composants
utilisés par l'application. À côté des routes ordinaires, j'ai remarqué une
route commentée liée à un composant inhabituel.

Essayer simplement ce chemin dans l'URL ne permettait pas d'afficher la page.
La route commentée n'était pas une route de navigation active. Il fallait donc
distinguer la possibilité d'accéder à une page depuis l'interface de la
possibilité de lire son fichier source.

## 3. Identifier le composant intéressant

Le router faisait aussi référence à un composant dont le nom suggérait qu'il
n'était pas destiné à être trouvé depuis l'interface. Je l'ai recherché dans
`src/components/`, sans reproduire ici son nom spécifique au challenge.

Dans DevTools, plusieurs représentations issues de `vue-loader` apparaissaient,
avec des indications comme :

```text
type=template
type=script
type=styles
```

Ces représentations correspondaient aux différentes parties traitées pendant
la compilation du composant. Mon objectif était de retrouver le fichier
`.vue` original, pas de confondre ses parties transformées avec sa source.

## 4. Lire la source map du bundle

J'ai récupéré le fichier `.map` associé au bundle JavaScript. Il s'agissait
d'un document JSON contenant notamment `sources` et `sourcesContent`.

Pour illustrer ces champs sans reprendre le code du challenge, voici un exemple
fictif fondé sur le commentaire présent dans le mini-lab :

```json
{
  "version": 3,
  "sources": ["webpack:///./src/internal.js"],
  "sourcesContent": ["// DEMO_TOKEN_NOT_A_REAL_SECRET"]
}
```

Cet extrait abrégé n'est pas une map complète. `sources` identifie les fichiers
et `sourcesContent`, lorsqu'il est inclus, fournit leur contenu. Dans la map
du challenge, ce contenu était disponible : il n'a pas fallu le deviner à partir
du code minifié.

## 5. Retrouver le fichier original

J'ai repéré le composant intéressant dans `sources`, puis lu l'entrée située
au même indice dans `sourcesContent`. J'ai ainsi retrouvé le fichier `.vue`
avec son template, son script et les commentaires conservés dans la source.

Le point décisif était cette correspondance entre chemin et contenu : la
navigation dans l'application n'était pas nécessaire pour lire ce fichier.

## 6. Identifier la donnée de validation

Dans le bloc `<script>`, des commentaires développeur expliquaient que les
source maps avaient été laissées actives pendant le build de production.
Une donnée de validation figurait également dans ces commentaires.

Ni ces commentaires propriétaires ni leur valeur ne sont copiés dans ce dépôt.
La valeur retrouvée est remplacée par :

```text
[REDACTED]
```

## 7. Valider le challenge

J'ai soumis la valeur retrouvée dans la source originale. La validation a été
acceptée. Ce résultat est rapporté à partir de ma résolution, pas d'une nouvelle
exécution effectuée pour la rédaction du dépôt.

## Cause de l'exposition

Il ne s'agissait pas d'une compromission de Webpack. La combinaison étudiée
était la génération d'une map contenant les sources et sa publication côté client.
Le mini-lab illustre cette génération avec :

```js
devtool: "source-map"
```

Cette option est utile au débogage. Le problème survient lorsque la map accessible
contient des informations qui ne devaient pas être publiées, en particulier ici
une donnée de validation dans un commentaire.

Une route désactivée ou un composant absent de l'interface ne protège pas une
information présente dans les artefacts livrés au navigateur.

## Impact

Selon leur contenu, des maps accessibles peuvent révéler la structure du projet,
des noms de composants, des commentaires, des routes désactivées, des endpoints
et de la logique frontend. Une donnée sensible ajoutée par erreur aux sources
peut également être exposée.

Ces informations ne prouvent pas, à elles seules, une vulnérabilité serveur.
L'impact confirmé dans mon challenge était la lecture de la donnée de validation.

## Remédiation

Le mini-lab fournit une variante sans génération de map :

```js
devtool: false
```

Cela illustre une remédiation, pas une modification appliquée à l'application
du challenge. Lorsqu'une map reste nécessaire pour le suivi d'erreurs, il faut
la conserver hors des ressources publiques ou en contrôler l'accès.

`hidden-source-map` ne suffit pas à protéger une map publiée : cette option
retire la référence du bundle, mais génère encore le fichier.

Enfin, désactiver les maps ne rend pas confidentiel le code JavaScript envoyé
au navigateur. Aucun secret ne doit dépendre de la minification ou de l'absence
d'un lien dans l'interface pour rester protégé.

Référence : [Webpack — Devtool](https://webpack.js.org/configuration/devtool/).

## Ce que j'ai appris

```text
DevTools → webpack:// → router → composant inhabituel
    → fichier .map → sources / sourcesContent
    → fichier .vue original → commentaires → validation
```

J'ai appris à séparer navigation et exposition du code : une page non accessible
dans l'interface peut laisser des informations lisibles dans une source map.
L'analyse du fichier original a été plus utile que la tentative de navigation
vers une route commentée.
