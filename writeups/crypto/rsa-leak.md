# Challenge Crypto — RSA et fuite quadratique

> **Statut : résultat consigné dans les notes.** Le calcul intermédiaire et la
> validation sur les données du challenge ne sont pas entièrement documentés.

## Objectif

Les notes décrivent un chiffrement RSA accompagné d'une fuite `p² + q²`.
L'objectif était de retrouver le message. Le flag et sa représentation numérique
déchiffrée sont remplacés par `[REDACTED]`.

## 1. Identifier les paramètres

Le code fourni dans les notes génère deux nombres premiers et construit les
paramètres RSA :

```python
p = getPrime(512)
q = getPrime(512)
n = p * q
phi = (p - 1) * (q - 1)
e = 65537
d = pow(e, -1, phi)
c = pow(m, e, n)
leak = p**2 + q**2
```

Cet extrait décrit le calcul observé. Les imports et l'entrée `m` ne sont pas
fournis : ce n'est pas un script autonome de résolution.

## 2. Comprendre le rôle des valeurs

| Valeur | Rôle |
| --- | --- |
| `p`, `q` | Nombres premiers utilisés pour construire le module |
| `n` | Module RSA, égal à `p * q` |
| `e` | Exposant public |
| `phi` | Valeur utilisée pour calculer l'exposant privé dans cet exemple |
| `d` | Exposant privé |
| `m`, `c` | Message représenté par un entier et résultat du chiffrement |
| `leak` | Information supplémentaire fournie par le challenge |

## 3. Résultat rapporté

Le journal contient des valeurs pour `p`, `q`, `phi` et `d`, puis un message
déchiffré. Il ne conserve pas les étapes ayant permis d'obtenir les premiers à
partir de la fuite. Ces étapes ne sont pas inventées ici.

Flag : `[REDACTED]`.

## Bilan

Il faut distinguer le code qui produit un challenge, les données publiques
disponibles et le raisonnement de résolution. Pour compléter ce write-up, il
reste à ajouter la démarche mathématique réellement suivie et sa vérification.
