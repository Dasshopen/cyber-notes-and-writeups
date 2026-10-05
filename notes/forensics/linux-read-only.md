# Monter une partition Linux en lecture seule

## Identifier le filesystem

Après `losetup` :

```bash
lsblk -f /dev/loop0
```

Exemple :

```text
/dev/loop0p1 ext3
```

## Monter sans rejouer le journal

```bash
sudo mkdir -p /mnt/forensic
sudo mount -t ext3 -o ro,noload /dev/loop0p1 /mnt/forensic
```

Pour ext4 :

```bash
sudo mount -t ext4 -o ro,noload /dev/loop0p1 /mnt/forensic
```

## Vérifier

```bash
mount | grep forensic
ls -la /mnt/forensic
```

## Attention aux chemins

Si l’image est montée dans `/mnt/forensic` :

```bash
sudo cat /root/.bash_history
```

lit le root de **Kali**.

Pour lire celui de la VM :

```bash
sudo cat /mnt/forensic/root/.bash_history
```

## Homes utilisateur

```bash
ls -la /mnt/forensic/home
```

Puis :

```bash
sudo ls -la /mnt/forensic/home/<user>
```

## Historique shell

```bash
sudo cat /mnt/forensic/home/<user>/.bash_history
sudo cat /mnt/forensic/root/.bash_history
```

## Fichiers récemment modifiés

```bash
sudo find /mnt/forensic/etc \
  /mnt/forensic/usr/local \
  /mnt/forensic/opt \
  -type f -printf '%T@ %p\n' 2>/dev/null \
  | sort -nr | head -50
```

## Chercher les images

```bash
find /mnt/forensic -type f \
  \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \
     -o -iname "*.gif" -o -iname "*.bmp" \) \
  2>/dev/null
```
