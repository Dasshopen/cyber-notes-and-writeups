# Checklist CTF rapide

## Web

- [ ] Lire le HTML source
- [ ] Regarder les commentaires HTML
- [ ] Regarder le JS de l’app
- [ ] Vérifier GET / POST
- [ ] Garder une baseline Burp
- [ ] Tester un seul paramètre à la fois
- [ ] Comparer code / taille / message / redirection
- [ ] Identifier la techno backend
- [ ] Vérifier les cookies applicatifs
- [ ] Vérifier `robots.txt` manuellement
- [ ] Ne pas lancer de scanner si interdit

## SQLi

- [ ] `'` change-t-il la réponse ?
- [ ] Erreur SQL ou erreur applicative ?
- [ ] DB probable : SQLite / MySQL / PostgreSQL ?
- [ ] SQLite → penser à `||`
- [ ] Construire condition vraie / fausse
- [ ] Créer un oracle
- [ ] `length()`
- [ ] `substr()`
- [ ] `unicode()`
- [ ] Recherche binaire
- [ ] Tester des mots entiers dès qu’un préfixe devient évident

## Forensic disque

- [ ] Ne pas démarrer la VM immédiatement
- [ ] Lister le contenu OVA
- [ ] Identifier VMDK
- [ ] `qemu-img info`
- [ ] Convertir en RAW
- [ ] `fdisk -l`
- [ ] `losetup -fP`
- [ ] `lsblk -f`
- [ ] Monter `ro,noload`
- [ ] Explorer `/home`
- [ ] Explorer `/root`
- [ ] `.bash_history`
- [ ] fichiers récemment modifiés
- [ ] Desktop / Documents / Downloads
- [ ] logs
- [ ] fichiers supprimés / chiffrés si nécessaire

## Discipline

- [ ] 1 hypothèse = 1 test
- [ ] Ne pas interpréter trop vite
- [ ] Ne pas mélanger plusieurs challenges
- [ ] Noter ce qui est confirmé
- [ ] Abandonner rapidement une piste sans signal
