# Forensic — OVA / VMDK

## Structure d’une OVA

Une OVA est généralement une archive TAR.

Lister :

```bash
tar -tf machine.ova
```

Exemple :

```text
machine.ovf
machine-disk001.vmdk
machine.mf
```

## Rôle des fichiers

### `.ovf`
Description de la VM : CPU, RAM, contrôleurs, disques, matériel virtuel.

### `.vmdk`
Le disque dur virtuel VMware. C’est généralement le fichier principal à analyser.

### `.mf`
Manifest avec des hash pour contrôler l’intégrité.

## Inspecter le VMDK

```bash
qemu-img info machine-disk001.vmdk
```

Regarder :
- format ;
- taille virtuelle ;
- taille réelle ;
- type (`streamOptimized`, sparse, etc.).

## Convertir en RAW

```bash
qemu-img convert -p -f vmdk -O raw \
  machine-disk001.vmdk machine.raw
```

Le VMDK original reste intact.

## Afficher les partitions

```bash
sudo fdisk -l machine.raw
```

## Créer les devices loop

```bash
sudo losetup -fP --show machine.raw
```

Puis :

```bash
lsblk -f /dev/loop0
```

Exemple :

```text
loop0p1 ext3
loop0p5 swap
```

## Principe forensic

Toujours travailler :
- sur une copie ;
- en lecture seule ;
- sans démarrer la VM si ce n’est pas nécessaire.

Démarrer la VM peut modifier les logs, timestamps, journal filesystem et fichiers temporaires.
