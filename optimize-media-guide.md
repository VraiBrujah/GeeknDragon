# Guide d'optimisation des médias pour Geek & Dragon

## Problèmes identifiés

### Images trop lourdes
- Images triptyques : 3-6 MB chacune (format PNG non optimisé)
- Images de cartes : 2-3 MB chacune
- Total : Plus de 100 MB d'images

### Vidéos trop lourdes  
- cartearme.mp4 : 69 MB
- Vidéos fontaine : 20-39 MB chacune
- Total : Plus de 250 MB de vidéos

## Actions recommandées

### 1. Conversion des images (URGENT)

#### Installer les outils nécessaires
```bash
# Windows - Installer ImageMagick
# Télécharger depuis : https://imagemagick.org/script/download.php#windows

# Ou utiliser un outil en ligne comme :
# - TinyPNG.com (pour PNG/JPG)
# - Squoosh.app (Google, gratuit)
# - CloudConvert.com
```

#### Commandes pour optimiser
```bash
# Convertir les PNG en WebP (réduction de 60-80%)
magick convert images/tryp/*.png -quality 85 -define webp:method=6 images/tryp-webp/

# Créer des versions miniatures pour le lazy loading
magick convert images/tryp/*.png -resize 20x20 -blur 0x2 images/tryp-thumb/

# Optimiser les PNG existants (réduction de 20-40%)
pngquant --quality=65-80 images/tryp/*.png --output images/tryp-optimized/
```

### 2. Compression des vidéos (TRÈS URGENT)

#### Utiliser FFmpeg
```bash
# Installer FFmpeg
# Windows : télécharger depuis https://ffmpeg.org/download.html

# Comprimer cartearme.mp4 (69MB -> ~10MB)
ffmpeg -i videos/cartearme.mp4 -vcodec h264 -acodec aac -crf 28 -preset slow -vf scale=1280:-1 videos/cartearme-compressed.mp4

# Comprimer toutes les vidéos fontaine
for video in videos/fontaine*.mp4; do
  ffmpeg -i "$video" -vcodec h264 -crf 30 -preset slow -vf scale=960:-1 "${video%.mp4}-compressed.mp4"
done

# Créer des versions poster (image de prévisualisation)
ffmpeg -i videos/fontaine1.mp4 -ss 00:00:01 -vframes 1 videos/fontaine1-poster.jpg
```

### 3. Utilisation d'un CDN gratuit

#### Option 1: Cloudflare (RECOMMANDÉ)
1. Créer un compte sur cloudflare.com
2. Ajouter votre domaine
3. Activer la mise en cache des médias
4. Activer Polish (optimisation automatique des images)

#### Option 2: GitHub comme CDN
```html
<!-- Héberger les grosses vidéos sur GitHub LFS -->
<!-- Dans .gitattributes -->
videos/*.mp4 filter=lfs diff=lfs merge=lfs -text
```

#### Option 3: Services gratuits
- **Cloudinary** : 25 GB gratuits/mois
- **ImageKit** : 20 GB gratuits/mois
- **Bunny CDN** : très abordable (~0.01$/GB)

### 4. Implementation du code d'optimisation

Ajouter dans index.php et boutique.php :
```php
<!-- Dans head-common.php, ajouter : -->
<script src="/js/lazy-load-enhanced.js" defer></script>
```

### 5. Format moderne avec fallback

```html
<!-- Remplacer les images par : -->
<picture>
  <source srcset="images/cartes_equipement.webp" type="image/webp">
  <source srcset="images/cartes_equipement.jpg" type="image/jpeg">
  <img src="images/cartes_equipement.jpg" alt="Cartes" loading="lazy">
</picture>

<!-- Pour les vidéos, ajouter poster : -->
<video poster="videos/fontaine1-poster.jpg" preload="none" data-src="videos/fontaine1.mp4">
</video>
```

### 6. Optimisations immédiates sans outils

#### A. Redimensionner via CSS au lieu de fichiers
```css
/* Dans boutique-style-global.css */
.card-product img {
  max-width: 300px;
  height: auto;
}

.product-media {
  max-width: 600px;
}
```

#### B. Charger les vidéos à la demande
```javascript
// Modifier hero-videos.js pour charger une seule vidéo à la fois
```

## Résultats attendus

- **Temps de chargement** : 8-10s → 2-3s
- **Taille totale** : 350 MB → 50-80 MB  
- **Score PageSpeed** : 40 → 85+
- **Consommation data mobile** : -80%

## Actions prioritaires

1. **Immédiat** : Activer le script lazy-load-enhanced.js
2. **Aujourd'hui** : Comprimer les vidéos avec FFmpeg
3. **Cette semaine** : Convertir images en WebP
4. **Long terme** : Mettre en place un CDN

## Commande rapide pour Windows PowerShell

```powershell
# Créer les dossiers
New-Item -ItemType Directory -Path "images/optimized" -Force
New-Item -ItemType Directory -Path "videos/compressed" -Force

# Lister les fichiers à optimiser
Get-ChildItem -Path "images" -Include *.png,*.jpg -Recurse | Where {$_.Length -gt 500KB} | Select Name, @{N='Size(MB)';E={[math]::Round($_.Length/1MB,2)}}
```

## Support

Pour de l'aide avec l'optimisation :
- Discord : https://discord.gg/VaPZtZFC
- Email : contact@geekndragon.com