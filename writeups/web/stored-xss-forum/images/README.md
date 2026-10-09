# Captures à ajouter

Les six captures historiques ne sont pas disponibles dans ce dossier. Aucun fichier PNG n'a été fabriqué. Les blocs « 📸 Capture à ajouter » du write-up donnent leur emplacement et leur légende.

| Fichier attendu | Cadrage et annotation | Assainissement indispensable |
| --- | --- | --- |
| `01-forum-interface.png` | Formulaire, messages et statut ; « surface d'injection » | Domaine exact, URL d'instance, détails personnels |
| `02-html-status.png` | Élément `span` ; « rôle affiché ≠ privilèges » | Autres éléments DOM sensibles |
| `03-xss-alert.png` | Alerte réelle `XSS_OK`, ou historique entièrement assainie | Toute valeur issue des cookies et détails d'instance |
| `04-http-server.png` | Commande Python et ligne d'écoute | Chemins personnels, noms de machine, terminaux adjacents |
| `05-ssh-tunnel.png` | Commande SSH et confirmation du tunnel | URL temporaire entière, informations de connexion, QR code |
| `06-request-logs.png` | Marqueurs fictifs et codes HTTP ; limites d'attribution | Toutes les valeurs de cookies et identifiants, y compris les lignes voisines |

Le fichier [07-flow-diagram.svg](07-flow-diagram.svg) est un **schéma créé pour le document**, pas une capture d'écran historique. Il ne contient aucune adresse active ni donnée de session.

Pour ajouter une capture, travailler sur une copie, caviarder par aplats opaques irréversibles puis exporter une image sans calques récupérables. Une zone simplement floutée ou recouverte dans un fichier éditable ne garantit pas la suppression du contenu. Vérifier les métadonnées, les barres d'adresse, les onglets et l'ensemble du terminal. Ne pas importer les valeurs originales de cookies dans le dépôt, même dans un fichier ensuite supprimé.

Après ajout d'un PNG réel, remplacer uniquement le bloc correspondant par une image Markdown avec un texte alternatif et une légende fidèle. Exemple : `![Interface du forum assainie](images/01-forum-interface.png)` depuis le README principal. Ne pas intégrer ce lien tant que le PNG n'existe pas.
