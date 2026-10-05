# Intelligence artificielle — Notions et premier atelier

## Objectif

Organiser les notions de cours sur les modèles de langage et leur utilisation.
Les dates, chiffres et affirmations sans source ne sont pas présentés comme une
chronologie vérifiée. Les exemples de code sont conservés comme exercices, sans
test d'exécution lors de cette révision.

## 1. Grandes familles

- **Apprentissage supervisé** : apprendre à partir d'exemples avec une cible.
- **Apprentissage non supervisé** : rechercher des structures sans cible fournie.
- **Apprentissage par renforcement** : apprendre à partir d'interactions et de récompenses.

Le deep learning utilise des réseaux de neurones. Les notes citent CNN, RNN/LSTM
et transformers. Il faut distinguer les modèles qui classent ou estiment une valeur
des modèles qui génèrent du contenu.

## 2. Principe d'un modèle de langage

Le modèle traite des tokens et produit une continuation à partir de son contexte.
Le parcours décrit dans les notes est : tokenisation, représentation des tokens,
attention, puis prédiction du token suivant. Une continuation plausible n'est
pas nécessairement une réponse exacte.

## 3. Paramètres de génération

| Paramètre | Rôle |
| --- | --- |
| `do_sample` | Choix entre tirage et sélection sans échantillonnage |
| `temperature` | Influence du hasard lors du tirage |
| `top_k`, `top_p` | Restriction des candidats au tirage |
| `max_new_tokens` | Limite de la sortie générée |

La température n'est pas nécessairement limitée à l'intervalle 0–1. Un réglage
plus déterministe ne garantit pas l'exactitude. La reproductibilité dépend aussi
du modèle, du contexte et de l'environnement d'exécution.

## 4. Contexte, entraînement et limites

Le cours distingue pré-entraînement, adaptation supervisée et méthodes fondées
sur des préférences. Un modèle spécialisé peut être utile sur une tâche ciblée ;
sa taille ne suffit pas à prédire sa qualité.

La fenêtre de contexte est limitée. La conservation ou la compression d'une
conversation dépend de l'application ; ce n'est pas une mémoire universelle du modèle.

Les points de vigilance sont les hallucinations, les biais et la complaisance.
Le modèle ne connaît pas automatiquement les événements récents. Les notes sur
la consommation d'eau, l'efficacité de l'anglais et les dates historiques n'avaient
pas de sources suffisantes : elles restent des pistes à vérifier.

## 5. Ressources citées

- Kaggle : jeux de données et exercices.
- Hugging Face : modèles et jeux de données.
- Canadian Institute for Cybersecurity, UNB : ressources liées à la cybersécurité.

## 6. Atelier : préparer un environnement

Commandes présentes dans les notes, à adapter à l'environnement :

```bash
mkdir ia-m1 && cd ia-m1
uv venv
source .venv/bin/activate
uv pip install jupyter pandas numpy scikit-learn matplotlib transformers datasets
jupyter lab
```

La note originale donne `.venv\Scripts\activate` pour Windows. La commande
effective dépend du shell utilisé. L'installation des bibliothèques ne garantit
pas la compatibilité de tous les exemples GPU.

## 7. Atelier : premier modèle

```python
from transformers import pipeline

gen = pipeline("text-generation", model="Qwen/Qwen2.5-0.5B-Instruct", device_map="auto")
msgs = [{"role": "user", "content": "Explique ce qu'est un token en une phrase."}]
print(gen(msgs, max_new_tokens=80)[0]["generated_text"][-1]["content"])
```

Cet extrait n'a pas été exécuté pendant la préparation. Les versions et dépendances
de l'environnement d'origine ne sont pas documentées.

## 8. Comparer les générations

L'exercice propose une référence avec `do_sample=False`, puis plusieurs tirages
avec des températures de 0,1, 0,7, 1,5 et 2,5. Pour isoler cet effet, les notes
emploient `top_k=0` et `top_p=1.0`.

```python
for t in [0.1, 0.7, 1.5, 2.5]:
    print(f"\n=== temperature = {t} ===")
    for i in range(3):
        out = gen(msgs, max_new_tokens=40, do_sample=True,
                  temperature=t, top_k=0, top_p=1.0)
        print(f"{i + 1}. {out[0]['generated_text'][-1]['content']}")
```

Comparer la variété, la cohérence et l'exactitude des réponses. Une graine fixe
peut aider à comparer des essais dans un même environnement, sans garantir une
identité de résultat entre matériels ou versions différents.

## Bilan de séance

Choisir les réglages selon la tâche, puis mesurer les résultats. L'exercice
sur les instructions contradictoires doit rester dans un cadre de laboratoire
et être analysé comme un problème de robustesse, pas une garantie de protection.
