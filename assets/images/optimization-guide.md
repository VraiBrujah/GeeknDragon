# Guide d'Optimisation des Images - Geek & Dragon

## Images trouvées : 169 (261.72 MB)

## Optimisations recommandées :

### 1. Conversion WebP
- Réduction moyenne : 25-35% de la taille
- Commande : `cwebp -q 85 input.jpg -o output.webp`

### 2. Versions responsive
- Petite : 300px de large
- Moyenne : 600px de large  
- Grande : 1200px de large

### 3. Compression JPEG
- Qualité recommandée : 85%
- Suppression des métadonnées EXIF

### 4. Optimisation PNG
- Compression sans perte avec pngcrush ou optipng
- Conversion en WebP pour les images sans transparence

## Outils recommandés :
- ImageMagick (ligne de commande)
- Squoosh.app (interface web)
- TinyPNG/TinyJPG (service en ligne)

## Gains estimés :
- Réduction taille : 30-50%
- Amélioration temps de chargement : 20-40%