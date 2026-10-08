# Webpack Source Map Exposure Lab

Mini-lab pédagogique montrant pourquoi les **source maps Webpack exposées en production** peuvent révéler du code source qui n'était pas censé être facilement accessible côté client.

> Ce dossier est un environnement de démonstration personnel, pas le write-up
> d'une résolution de challenge.
> Il ne contient aucun flag, secret réel, identifiant de challenge ou contenu provenant d'une plateforme tierce.

## Objectif

Comprendre le chemin suivant :

```text
bundle JavaScript
        ↓
source map (.map)
        ↓
sources / sourcesContent
        ↓
code source original
        ↓
commentaires, routes, logique frontend, endpoints internes, etc.
```

## Risque

Une source map peut aider le navigateur à reconstruire les fichiers sources d'origine.

Selon la configuration Webpack, un utilisateur peut parfois retrouver :

- les noms et chemins des fichiers sources ;
- les composants frontend ;
- les commentaires développeur ;
- les routes non affichées dans l'interface ;
- la logique métier côté client ;
- les endpoints utilisés par l'application ;
- des secrets placés par erreur dans le frontend.

Une source map ne crée pas à elle seule une vulnérabilité serveur, mais elle peut **augmenter fortement la quantité d'informations exposées**.

## Structure

```text
webpack-sourcemap-exposure/
├── src/
│   ├── index.js
│   └── internal.js
├── webpack.vulnerable.js
├── webpack.fixed.js
├── package.json
├── package-lock.json
├── scripts/
│   └── check-builds.cjs
└── README.md
```

## Démonstration

### 1. Installer les dépendances

```bash
npm ci --ignore-scripts
```

### 2. Build vulnérable

```bash
npm run build:vulnerable
```

Le build génère :

```text
dist/
├── bundle.js
└── bundle.js.map
```

Le fichier `.map` contient les informations permettant de reconstruire les sources.

Tu peux l'ouvrir et observer notamment :

```json
{
  "sources": [...],
  "sourcesContent": [...]
}
```

### 3. Ce qu'il faut analyser

```text
1. repérer le bundle JavaScript
2. chercher une référence sourceMappingURL
3. récupérer le fichier .map
4. lire "sources"
5. lire "sourcesContent"
6. reconstruire les fichiers intéressants
7. chercher les données qui n'auraient pas dû être exposées
```

Dans ce lab, `src/internal.js` contient volontairement des informations factices qui illustrent ce type de fuite.

## Exemple vulnérable

`webpack.vulnerable.js` utilise :

```js
devtool: "source-map"
```

Webpack génère alors une source map complète.

## Exemple corrigé

`webpack.fixed.js` utilise :

```js
devtool: false
```

Ce build ne génère plus de source map. Il s'agit d'une option de remédiation :
une application peut aussi conserver des maps pour son observabilité, à condition
de contrôler leur accès et de ne pas les publier avec les ressources publiques.

Lancement :

```bash
npm run build:fixed
```

Les deux configurations écrivent dans `dist/` et utilisent `clean: true` :
le second build remplace les fichiers du premier. Inspecter le build avec map
avant de lancer le build sans map.

### Vérification automatique

```bash
npm test
```

Le test construit les deux variantes localement. Il vérifie que la première map
contient le commentaire fictif de `internal.js`, puis que le second build
supprime la map et la référence `sourceMappingURL`.
Il ne contacte aucune application cible et n'exécute pas le bundle dans un navigateur.

## Nuances importantes

- `devtool: "source-map"` est une option de débogage valide. Le risque étudié ici
  est la publication d'informations que l'on ne souhaitait pas exposer, pas
  l'existence d'une map en elle-même.
- Désactiver les maps ne rend pas confidentiel le JavaScript livré au navigateur.
  Des routes ou valeurs nécessaires à l'exécution peuvent rester dans le bundle.
  Ce lab illustre notamment l'exposition de **commentaires** via `sourcesContent`.
- `hidden-source-map` retire la référence dans le bundle, mais produit encore
  un fichier map : il faut empêcher sa publication ou contrôler son accès.

Référence : [Webpack — Devtool](https://webpack.js.org/configuration/devtool/).

## Remédiations

Pour une application de production :

- ne pas publier de source maps si elles ne sont pas nécessaires ;
- si elles sont nécessaires pour l'observabilité, éviter de les rendre publiquement accessibles ;
- ne jamais mettre de secret réel dans le frontend ;
- considérer tout code livré au navigateur comme lisible par l'utilisateur ;
- vérifier les artefacts générés avant déploiement.

## À retenir

Masquer un bouton, commenter une route ou minifier du JavaScript ne protège pas une donnée sensible.

> Tout ce qui est livré au navigateur doit être considéré comme accessible à l'utilisateur.

## Usage

Projet conçu uniquement pour l'apprentissage, la démonstration et la sensibilisation à la sécurité frontend.
