# FlipTheCoin — Journal d'analyse d'un challenge blockchain

> **Statut : résolution rapportée, détails incomplets.** Les notes indiquent une
> validation finale, mais le code et les sorties étaient uniquement en captures.

## Objectif

Le challenge demandait d'atteindre un résultat de 50. Les notes décrivent un contrat
qui utilise des informations du bloc pour produire une décision binaire. La formule
exacte n'étant pas conservée, cette description n'est pas une vérification du contrat.

## 1. Analyser la condition de progression

La lecture du code indiquait qu'un résultat favorable faisait progresser le compteur,
tandis qu'un résultat défavorable le remettait à zéro. J'ai étudié si les données du
bloc permettaient d'anticiper cette décision.

Le journal mentionne `block.timestamp` et une information relative au bloc précédent.
Sans le code source, il n'est pas possible de préciser leur combinaison ni de garantir
qu'une boucle suffit à résoudre le challenge.

## 2. Préparer l'environnement

Les commandes de préparation consignées étaient :

```bash
forge init
forge build
```

Un contrat intermédiaire a été rédigé et compilé. Son source n'est pas inclus dans
les notes textuelles ; il n'est pas reconstitué dans cette version.

## 3. Vérifier l'état du challenge

La commande de lecture conservée est :

```bash
cast call <ADRESSE_TARGET> "isSolved()(bool)" --rpc-url <RPC_URL>
```

Les paramètres entre chevrons sont des valeurs de l'environnement de challenge.
Cette commande interroge l'état du contrat ; elle ne prouve pas à elle seule la
réussite d'une transaction précédente.

## 4. Reprendre après un premier résultat négatif

La première vérification a renvoyé `false`. J'ai ensuite repris la configuration,
recompilé et vérifié les adresses utilisées. Les notes rapportent finalement
l'obtention du flag : `[REDACTED]`.

Les modifications exactes et la sortie finale n'étant pas conservées dans le texte,
elles restent à documenter avant de présenter une solution reproductible.

## Bilan

Ce cas souligne l'importance de séparer l'analyse du contrat, la configuration
de l'environnement et la vérification de l'état final. Une compilation ou une
transaction réussie ne remplace pas la validation du challenge.
