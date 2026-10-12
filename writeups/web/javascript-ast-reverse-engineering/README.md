# Reverse engineering d'un AST JavaScript au format JSON

> **Catégorie :** Reverse engineering / JavaScript / AST / Désobfuscation
>
> **Environnement :** Kali Linux, Node.js v24.21.0
>
> **Entrée :** `ch38.json` (AST au format ESTree avec un nœud non standard)
>
> **Sortie :** `recovered.js` (JavaScript reconstruit)

## Objectif

L'objectif est de reconstruire et comprendre un programme JavaScript fourni **non pas sous forme de fichier `.js`, mais comme un arbre syntaxique abstrait (AST) sérialisé en JSON**. Cet exercice combine deux difficultés : un nœud non standard empêche la génération du code et les chaînes utiles sont reconstruites au moyen de décalages binaires et d'un XOR.

Je présente ici ma démarche : examen du JSON, essai de Babel, essai d'Astring, inspection du nœud problématique, reconstruction du code puis lecture ligne par ligne. Les étapes d'exécution finales sont limitées au fichier analysé et à un petit script de décodage ; il n'est pas nécessaire d'exécuter aveuglément un programme inconnu.

## 1. Qu'est-ce qu'un AST ?

Un **AST** (*Abstract Syntax Tree*, « arbre syntaxique abstrait ») décrit la **structure** d'un programme : variables, fonctions, expressions, conditions et appels. Chaque élément est représenté par un **nœud** avec un champ `type` et des propriétés adaptées à sa nature.

Par exemple, l'instruction :

```js
const x = 10 + 5;
```

peut être représentée par un nœud `VariableDeclaration`, contenant un `VariableDeclarator`, un `Identifier` (`x`) et un `BinaryExpression` (`10 + 5`). L'AST n'est pas un chiffrement : c'est une représentation de la syntaxe utilisée par des analyseurs, compilateurs et outils de transformation.

**Chaîne de traitement classique :**

```text
JavaScript source ──parser──> AST ──transformations──> AST modifié ──generator──> JavaScript
```

Ici, l'AST est **déjà fourni au format JSON** : on n'a pas besoin de reparcourir le code source avec un parser. Il faut simplement parser le **JSON** en objet JavaScript avant de le donner à un générateur compatible.

```js
const data = fs.readFileSync('ch38.json', 'utf8'); // chaîne JSON
const ast = JSON.parse(data);                      // objet JavaScript
```

Ne pas confondre `JSON.parse(data)` (texte JSON → objet) et `@babel/parser` (code JavaScript → AST).

## 2. Reconnaissance : identifier le format de l'AST

Le fichier `ch38.json` commence par une structure de ce type :

```json
{
  "type": "Program",
  "start": 0,
  "end": 831,
  "body": [
    {
      "type": "ExpressionStatement",
      "start": 0,
      "end": 140,
      "expression": { "type": "CallExpression" }
    }
  ],
  "sourceType": "module"
}
```

> Extrait simplifié : le `body` original est plus long et contient six entrées.

**Indices :**

- `Program` : racine de l'arbre ; `body` contient les instructions au niveau principal.
- `start` / `end` : positions dans le texte source d'origine, pas des numéros de lignes.
- `ExpressionStatement`, `FunctionDeclaration`, `VariableDeclaration` : catégories de nœuds.
- `Literal` pour les chaînes et les nombres : convention **ESTree**, fréquente notamment avec Acorn.

Il ne suffit pas de voir `Program` pour identifier un format : Babel utilise aussi ce type. C'est la combinaison des nœuds, notamment `Literal`, qui rend ici l'hypothèse ESTree solide. Nous ne pouvons pas déterminer avec certitude quel parseur précis a généré le fichier.

Pour afficher les premières lignes :

```bash
head -n 30 ch38.json
```

Pour vérifier que c'est du JSON valide :

```bash
python3 -m json.tool ch38.json > /dev/null && echo 'JSON valide'
```

## 3. Premier essai : Babel Generator

Babel propose plusieurs briques : `@babel/parser` (JavaScript → AST), `@babel/traverse` (parcours), `@babel/types` (manipulation) et `@babel/generator` (AST → JavaScript).

### Installation

```bash
npm init -y
npm install @babel/generator
```

### Script initial : `reverse.mjs`

Ce script correspond à notre première tentative :

```js
import fs from "node:fs";
import { generate } from "@babel/generator";

// 1. Lire le fichier JSON
const data = fs.readFileSync("ch38.json", "utf8");

// 2. Transformer le JSON en objet JavaScript
const ast = JSON.parse(data);

// 3. Générer du JavaScript depuis l'AST
const output = generate(ast, {
    comments: true,
    compact: false
});

// 4. Afficher le résultat
console.log(output.code);
```

```bash
node reverse.mjs
```

**Erreur observée :**

```text
ReferenceError: unknown node of type "Literal" with constructor "Object"
```

**Pourquoi ?** Le générateur Babel attend généralement les conventions de son propre AST (`StringLiteral`, `NumericLiteral`, etc.), tandis que notre fichier contient des nœuds `Literal` ESTree. L'erreur prouve une incompatibilité sur ces nœuds ; elle ne prouve pas que tout le fichier est invalide.

**Décision :** essayer un générateur conçu pour **ESTree**, au lieu de remplacer arbitrairement tous les noms de nœuds.

## 4. Deuxième essai : Astring

[Astring](https://github.com/davidbonnet/astring) transforme des AST ESTree en code JavaScript.

```bash
npm install astring
```

### Première tentative

```js
import fs from "node:fs";
import { generate } from "astring";

const data = fs.readFileSync("ch38.json", "utf8");
const ast = JSON.parse(data);
const output = generate(ast);

fs.writeFileSync("recovered.js", output, "utf8");
```

```bash
node reverse_literal.mjs
```

**Erreur observée :**

```text
TypeError: this[statement.type] is not a function
    at Object.Program (.../astring/dist/astring.mjs:269:27)
```

**Interprétation :** Astring parcourt le `Program.body` et sélectionne un gestionnaire pour chaque `statement.type`. Il rencontre ici un type qui n'a pas de générateur correspondant. Contrairement à l'échec de Babel sur `Literal`, ce problème se situe au niveau des **instructions racines**.

## 5. Inspection du JSON : localiser le nœud suspect

Créer `inspect.mjs` :

```js
import fs from "node:fs";

// 1. Lire le fichier JSON
const data = fs.readFileSync("ch38.json", "utf8");

// 2. Transformer le JSON en objet JavaScript
const ast = JSON.parse(data);

// 3. Afficher les informations générales
console.log("===== ANALYSE AST =====");
console.log("Type racine :", ast.type);
console.log("Nombre d'instructions :", ast.body.length);

// 4. Afficher le type de chaque instruction
console.log("\n===== INSTRUCTIONS =====");
for (let i = 0; i < ast.body.length; i++) {
    console.log(`Instruction ${i} : ${ast.body[i]?.type}`);
}

// 5. Récupérer le nœud suspect
const suspiciousNode = ast.body[5];

// 6. Afficher ses propriétés
console.log("\n===== PROPRIÉTÉS DU NŒUD SUSPECT =====");
console.log(Object.keys(suspiciousNode));

// 7. Afficher son contenu complet
console.log("\n===== CONTENU DU NŒUD SUSPECT =====");
console.log(JSON.stringify(suspiciousNode, null, 2));
```

Exécuter :

```bash
node inspect.mjs
```

**Résultat de l'inspection :**

```text
Type racine : Program
Nombre d'instructions : 6
Instruction 0 Type : ExpressionStatement
Instruction 1 Type : FunctionDeclaration
Instruction 2 Type : FunctionDeclaration
Instruction 3 Type : VariableDeclaration
Instruction 4 Type : ExpressionStatement
Instruction 5 Type : jaajajajajajajajajajajajaj
```

Le dernier nœud contient uniquement :

```json
{
  "type": "jaajajajajajajajajajajajaj"
}
```

Les types des cinq premières instructions sont connus. En revanche, `jaajajajajajajajajajajajaj` **n'est pas un type d'instruction standard ESTree** : Astring ne sait pas le générer.

**Important :** c'est raisonnable de tester une reconstruction sans ce nœud, puisqu'il ne possède aucune autre propriété dans le fichier transmis. Mais ce constat ne permet pas de prouver l'intention de l'auteur (leurre, corruption, exercice de robustesse, etc.).

## 6. Reconstruction réussie : ignorer le nœud non standard

La suppression est effectuée **en mémoire seulement**. On conserve toujours `ch38.json` intact pour pouvoir reprendre l'analyse.

### Script complet : `reverse_literal.mjs`

```js
import fs from "node:fs";
import { generate } from "astring";

// 1. Lire le fichier JSON
const data = fs.readFileSync("ch38.json", "utf8");

// 2. Transformer le JSON en objet JavaScript
const ast = JSON.parse(data);

console.log("[+] AST chargé avec succès");
console.log("[+] Type racine :", ast.type);
console.log("[+] Nombre d'instructions :", ast.body.length);

// 3. Identifier et retirer le nœud suspect
const suspiciousType = "jaajajajajajajajajajajajaj";

const suspiciousNodes = ast.body.filter(
    node => node?.type === suspiciousType
);

console.log("[+] Nœuds suspects trouvés :", suspiciousNodes.length);

// On conserve uniquement les instructions qui n'ont pas ce type
ast.body = ast.body.filter(
    node => node?.type !== suspiciousType
);

console.log("[+] Instructions restantes :", ast.body.length);

// 4. Reconstruire le JavaScript
try {
    const output = generate(ast, {
        indent: "  ",
        comments: true
    });

    // 5. Enregistrer le résultat
    fs.writeFileSync("recovered.js", output, "utf8");

    console.log("[+] JavaScript reconstruit avec succès !");
    console.log("[+] Fichier créé : recovered.js");
} catch (error) {
    console.error("[-] Erreur pendant la génération :");
    console.error(error.message);
    process.exitCode = 1;
}
```

```bash
node reverse_literal.mjs
wc -l recovered.js
sed -n '1,120p' recovered.js
```

Le `filter()` élimine uniquement les entrées ayant le type indiqué. `generate(ast)` crée du **texte JavaScript** ; contrairement à Babel Generator, Astring retourne directement une chaîne, et non un objet possédant une propriété `.code`.

**Résultat :** les cinq instructions valides sont reconstruites dans `recovered.js`. La reconstruction syntaxique **n'est pas encore la désobfuscation** : il faut maintenant comprendre les valeurs calculées.

## 7. Code JavaScript reconstruit

Voici le code obtenu, correspondant à l'extrait fourni :

```js
(() => {
  let d = [1856, 1824, 1776, 1728, 1776, 1728, 1776];
  d = d.map(c => String.fromCharCode(c >> 4));
  console.log(d);
})();

function l33t() {
  console.log("vive le reverse d'AST");
}

function gen_sensor() {
  let sens = [10] + [45] + [65] + [78] + [47];
  if ((sens >>= 4) == 20) {
    sens << 4;
  }
  let sensor = (function () {
    return [65353704, 65353663, 65353663, 65353707, 65353680, 65353701, 65353663, 65353709, 65353680, 65353706, 65353710, 65353724, 65353718, 65353680, 65353707, 65353706, 65353696, 65353709, 65353705, 65353722, 65353724, 65353708, 65353710, 65353723, 65353702, 65353696, 65353697];
  })().map(c => String.fromCharCode(c ^ sens)).join('');
  return sensor;
}

let sensor = gen_sensor();
console.log(sensor);
```

### Comprendre la structure générale

- Une **IIFE** (fonction exécutée immédiatement) décode un premier tableau de sept nombres, puis affiche **un tableau** de caractères.
- La fonction `l33t()` est **déclarée mais pas appelée** dans le code fourni : son message ne s'affiche donc pas lors du parcours normal de ce fichier.
- La fonction `gen_sensor()` construit une clé numérique, puis utilise cette clé pour décoder un second tableau de nombres.
- Le programme appelle `gen_sensor()` et affiche le résultat.

## 8. Premier tableau : décalage binaire et caractères

```js
(() => {
  let d = [1856, 1824, 1776, 1728, 1776, 1728, 1776];
  d = d.map(c => String.fromCharCode(c >> 4));
  console.log(d);
})();
```

### Notions utilisées

- `(() => { ... })()` : **IIFE**, fonction fléchée créée et exécutée immédiatement ; elle évite ici de laisser `d` dans la portée globale.
- `.map(c => ...)` : applique l'opération à chaque élément d'un tableau et **retourne un nouveau tableau** ; `c` reçoit successivement chaque nombre.
- `c >> 4` : décalage binaire vers la droite de quatre bits. Pour ces petits nombres positifs, le résultat est équivalent à une division entière par `2^4 = 16`.
- `String.fromCharCode(...)` : convertit le nombre obtenu en caractère.

| Nombre | `c >> 4` | Caractère |
|---:|---:|:---:|
| 1856 | 116 | `t` |
| 1824 | 114 | `r` |
| 1776 | 111 | `o` |
| 1728 | 108 | `l` |
| 1776 | 111 | `o` |
| 1728 | 108 | `l` |
| 1776 | 111 | `o` |

**Valeur affichée par `console.log(d)` :**

```js
[ 't', 'r', 'o', 'l', 'o', 'l', 'o' ]
```

**Piège de lecture :** il n'y a **pas de `.join('')`** dans cette partie. Le résultat reste un **tableau de sept caractères**, et non la chaîne de caractères `"trololo"`. On peut lire ces lettres comme « trololo », mais le *type* de `d` reste `Array`.

## 9. Construction de la clé : concaténation et affectation

Dans `gen_sensor()` :

```js
let sens = [10] + [45] + [65] + [78] + [47];
```

Avec l'opérateur `+`, JavaScript convertit ici les tableaux `[10]`, `[45]`, etc. en chaînes et les concatène. On obtient :

```js
sens === "1045657847"; // true : chaîne, pas nombre
```

Puis :

```js
if ((sens >>= 4) == 20) {
  sens << 4;
}
```

Il faut séparer **trois** opérations :

1. `sens >>= 4` est l'équivalent de `sens = sens >> 4`. L'expression **modifie `sens`**, même si le `if` est ensuite faux. Pour cette valeur positive (qui tient dans un entier signé 32 bits), cela donne `1045657847 >> 4 = 65353615`.
2. `== 20` compare alors `65353615` à `20` : la condition est **fausse**.
3. Le bloc n'est pas exécuté. Même s'il l'était, `sens << 4;` ne réaffecte rien : une expression isolée avec `<<` calcule un résultat mais ne le stocke pas. À l'inverse, `sens <<= 4` modifierait la variable.

**Valeur réellement utilisée ensuite :**

```js
sens === 65353615; // true
```

### Rappel des opérateurs

| Opérateur | Sens | Exemple |
|---|---|---|
| `>>` | Décalage à droite, sans affectation | `128 >> 3` donne `16` |
| `>>=` | Décalage à droite **avec affectation** | `x >>= 3` change `x` |
| `<<` | Décalage à gauche, sans affectation | `10 << 3` donne `80` |
| `<<=` | Décalage à gauche **avec affectation** | `x <<= 3` change `x` |
| `^` | XOR binaire bit à bit | `5 ^ 3` donne `6` |
| `==` | Égalité avec conversion possible | `"20" == 20` donne `true` |
| `===` | Égalité stricte | `"20" === 20` donne `false` |

**Nuance JavaScript :** les opérateurs `>>`, `<<` et `^` travaillent sur des entiers signés de 32 bits. Les analogies « division/multiplication par `2^n` » sont sûres pour les petites valeurs positives de ces exemples, mais pas sans précautions pour toutes les valeurs JavaScript.

## 10. Deuxième tableau : IIFE, XOR, `map` et `join`

La partie essentielle :

```js
let sensor = (function () {
  return [65353704, 65353663, 65353663, 65353707, /* ... */ 65353697];
})().map(c => String.fromCharCode(c ^ sens)).join('');
```

Décomposition **dans l'ordre d'exécution** :

1. `(function () { ... })` : création d'une **fonction anonyme**.
2. `()` : appel immédiat de cette fonction ; `return [...]` renvoie les 27 nombres.
3. `.map(c => ...)` : parcours de chaque nombre, affecté temporairement au paramètre `c`.
4. `c ^ sens` : **XOR bit à bit** entre le nombre courant et la clé `65353615`.
5. `String.fromCharCode(...)` : transformation du code obtenu en caractère.
6. `.join('')` : assemblage des caractères du tableau en **une seule chaîne**, sans séparateur.
7. `return sensor` : renvoi de cette chaîne depuis `gen_sensor()`.

**Pourquoi le XOR ?** Il est réversible : `a ^ b ^ b === a` pour les valeurs 32 bits concernées. On peut donc encoder ou décoder en appliquant la même clé, sans qu'il s'agisse d'un chiffrement robuste.

Exemple concret avec le premier nombre :

```js
65353704 ^ 65353615  // 103
String.fromCharCode(103) // 'g'
```

Le premier caractère du message est donc `g`.

## 11. Reproduire uniquement le décodage

Le code suivant isole les **données et l'algorithme** sans exécuter l'ensemble du fichier reconstruit. Créer `decode.mjs` :

```js
const sens = 65353615;

const values = [
  65353704, 65353663, 65353663, 65353707, 65353680,
  65353701, 65353663, 65353709, 65353680, 65353706,
  65353710, 65353724, 65353718, 65353680, 65353707,
  65353706, 65353696, 65353709, 65353705, 65353722,
  65353724, 65353708, 65353710, 65353723, 65353702,
  65353696, 65353697
];

const decoded = values
  .map(c => String.fromCharCode(c ^ sens))
  .join("");

console.log(decoded);
```

```bash
node decode.mjs
```

**Résultat vérifié :**

```text
g00d_j0b_easy_deobfuscation
```

Les `0` dans `g00d` et `j0b` sont bien **des chiffres zéro**, pas des lettres `o`.

## 12. Bilan des erreurs et de leur résolution

| Problème | Cause comprise | Résolution |
|---|---|---|
| Babel : `unknown node of type "Literal"` | AST majoritairement ESTree, et non AST Babel natif | Utiliser Astring pour ESTree |
| Astring : `this[statement.type] is not a function` | Nœud racine non standard dans `body[5]` | Inspecter le nœud, l'ignorer **en mémoire** pour la génération |
| Premier `map()` interprété comme une chaîne | `map()` renvoie un **tableau** | Noter l'absence de `join()` |
| Condition `if` jugée sans effet | `>>=` effectue une **affectation même quand le test est faux** | Suivre l'état de `sens` étape par étape |
| Confusion `<<` / `<<=` | Seul le second stocke le résultat | Distinguer calcul et affectation |
| XOR difficile à lire | Les chiffres stockent des caractères masqués par la clé | Calculer la clé puis décoder chaque élément avec `^` |

## 13. Reproduction rapide

À partir d'un dossier contenant `ch38.json`, `inspect.mjs`, `reverse_literal.mjs` et `decode.mjs` :

```bash
# Initialiser un dossier Node.js
npm init -y

# Installer le générateur ESTree
npm install astring

# Installer Babel uniquement si l'on veut reproduire le premier échec
npm install @babel/generator

# Vérifier le JSON
python3 -m json.tool ch38.json > /dev/null

# Inspecter les instructions et le nœud non standard
node inspect.mjs

# Reconstruire le JavaScript
node reverse_literal.mjs

# Lire le JS reconstruit
sed -n '1,120p' recovered.js

# Reproduire le décodage isolé
node decode.mjs
```

**Conseil de prudence :** en contexte de malware analysis ou de fichiers non fiables, reconstruire un AST est une étape **statique** ; ne pas exécuter le JavaScript récupéré sur sa machine principale sans l'avoir audité ou isolé dans un environnement adapté.

## 14. Portée et reproductibilité

Cette étude est publiée dans `writeups/web/javascript-ast-reverse-engineering/`. Les scripts d'inspection, les deux tentatives de génération et le décodage isolé sont conservés intégralement dans les blocs de code du document.

Le fichier original `ch38.json` et les versions exactes des dépendances ne sont pas fournis. Il est donc possible d'étudier les scripts et de reproduire le calcul de la clé et le décodage, mais pas de rejouer indépendamment toute la reconstruction de l'AST original avec ces seuls éléments. Le JavaScript présenté est celui transmis dans mon compte rendu, pas un fichier récupéré à nouveau pendant l'intégration au portfolio.

## Conclusion

Cet exercice m'a appris à **distinguer le format d'un AST du code JavaScript**, à diagnostiquer des erreurs de génération, puis à lire progressivement un programme reconstruit. La principale difficulté n'était pas de lancer un outil : il fallait comprendre **pourquoi Babel échouait, pourquoi Astring bloquait et comment les opérateurs JavaScript modifiaient la clé du XOR**.

Au final, le programme reconstruit produit un premier tableau de caractères (`t`, `r`, `o`, `l`, `o`, `l`, `o`), puis décode le texte `g00d_j0b_easy_deobfuscation` grâce à un XOR avec `65353615`.

**Compétences travaillées :** lecture d'AST JSON, distinction ESTree/Babel, analyse d'erreurs Node.js, génération de source avec Astring, fonctions anonymes et IIFE, tableaux JavaScript, coercition de types, opérateurs bit à bit et décodage XOR.

## Références

- [ESTree — spécification communautaire de la structure des AST JavaScript](https://github.com/estree/estree)
- [Babel Generator — documentation](https://babeljs.io/docs/babel-generator)
- [Babel Parser — documentation](https://babeljs.io/docs/babel-parser)
- [Astring — dépôt et documentation](https://github.com/davidbonnet/astring)
- [MDN — `Array.prototype.map()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
- [MDN — `String.fromCharCode()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCharCode)
- [MDN — opérateurs binaires](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators#bitwise_operators)
- [MDN — IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE)
