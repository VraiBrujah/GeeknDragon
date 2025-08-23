# 🖼️ Guide du Système de Gestion Dynamique des Images Li-CUBE PRO™

## 📋 Aperçu

Ce système permet de gérer centralement les chemins vers les images Li-CUBE PRO™ dans tous les fichiers HTML du projet. Il élimine le besoin de modifier manuellement chaque fichier lorsque l'emplacement des images change.

## 🎯 Problème Résolu

**AVANT :** Changements d'emplacement d'images nécessitaient la modification manuelle de nombreux fichiers HTML.

**APRÈS :** Un seul changement dans `js/image-config.js` met à jour automatiquement tous les chemins d'images.

---

## 🗂️ Structure des Fichiers

```
LiCUBEPRO/
├── js/
│   └── image-config.js          # Configuration centralisée
├── image/
│   └── Produit/
│       └── Li-CUBE PRO/         # Images du produit
│           ├── Li-CUBE PRO.png
│           ├── Li-CUBE PRO image 1.png
│           ├── Li-CUBE PRO image 2.png
│           └── Li-CUBE PRO image 3.png
├── presentations-vente/         # Profondeurs 3-4
├── presentations-location/      # Profondeurs 3-4
├── edsquebec.html              # Profondeur 1
├── licubepro.html              # Profondeur 1
└── test-image-system.html      # Page de test
```

---

## ⚙️ Configuration

### Fichier Principal: `js/image-config.js`

```javascript
const IMAGE_CONFIG = {
    // Chemin de base vers les images (CONFIGURABLE)
    imagePath: 'image/Produit/Li-CUBE PRO/',
    
    // Images disponibles (INVENTAIRE)
    availableImages: {
        'Li-CUBE PRO.png': 'Image principale du produit',
        'Li-CUBE PRO image 1.png': 'Vue standard',
        'Li-CUBE PRO image 2.png': 'Vue détaillée',
        'Li-CUBE PRO image 3.png': 'Vue complète'
    }
};
```

### Profondeurs par Emplacement

| Profondeur | Emplacement | Exemple de Fichier |
|------------|-------------|-------------------|
| **1** | `LiCUBEPRO/` | `edsquebec.html`, `licubepro.html` |
| **2** | `presentations-*/images-onepage/` | `comparaison-visuelle.html` |
| **3** | `presentations-*/versions-pdf/`<br>`presentations-*/presentations-vendeurs/` | `fiche-technique.html`<br>`presentation-complete.html` |
| **4** | `presentations-*/supports-print/flyers/`<br>`presentations-*/supports-print/posters/` | `flyer-client-standard.html`<br>`poster-convention-a1.html` |

---

## 🔧 Utilisation

### 1. Dans les Fichiers HTML

**❌ ANCIENNE MÉTHODE :**
```html
<img src="../../../image/Produit/Li-CUBE PRO/Li-CUBE PRO image 1.png" alt="Li-CUBE PRO™">
```

**✅ NOUVELLE MÉTHODE :**
```html
<img data-licube-image="Li-CUBE PRO image 1.png" 
     data-depth="3" 
     alt="Li-CUBE PRO™" 
     class="licube-product-image">
```

### 2. Inclusion du Script

Ajouter avant la fermeture de `</body>` :

```html
<!-- Script de gestion dynamique des images Li-CUBE PRO™ -->
<script src="../../js/image-config.js"></script>
```

⚠️ **Important :** Ajuster le chemin selon la profondeur du fichier !

### 3. Pour les Images CSS Background

**CSS :**
```css
.element {
    background-image: var(--licube-bg-image, url('../../image/Produit/Li-CUBE PRO/Li-CUBE PRO image 1.png'));
}
```

**JavaScript :**
```javascript
document.addEventListener('DOMContentLoaded', function() {
    const licubeImagePath = loadLiCubeImage('Li-CUBE PRO image 1.png', 3);
    document.documentElement.style.setProperty('--licube-bg-image', `url('${licubeImagePath}')`);
});
```

---

## 🎛️ Fonctions Disponibles

### Fonctions Principales

```javascript
// Obtenir le chemin d'une image
const chemin = loadLiCubeImage('Li-CUBE PRO image 1.png', 3);

// Changer l'emplacement des images
updateImagePaths('nouveau/chemin/images/');

// Configuration avancée
IMAGE_CONFIG.getImagePath('Li-CUBE PRO.png', 2);
IMAGE_CONFIG.updateImagePath('assets/images/licube/');
IMAGE_CONFIG.updateAllImagePaths();
```

### Attributs HTML

```html
<img data-licube-image="FILENAME.png"    <!-- Nom exact du fichier -->
     data-depth="DEPTH_NUMBER"           <!-- Profondeur du fichier HTML -->
     alt="DESCRIPTION"                   <!-- Description de l'image -->
     class="licube-product-image">       <!-- Classe CSS optionnelle -->
```

---

## 🔄 Changement d'Emplacement des Images

### Méthode 1 : Modification du Fichier de Configuration

1. Ouvrir `js/image-config.js`
2. Modifier la ligne :
   ```javascript
   imagePath: 'NOUVEAU/CHEMIN/VERS/IMAGES/',
   ```
3. Sauvegarder le fichier
4. **Toutes les images sont automatiquement mises à jour !**

### Méthode 2 : Modification Dynamique (JavaScript)

```javascript
// Changer vers un nouvel emplacement
updateImagePaths('assets/images/products/licube/');

// Ou utiliser la méthode directe
IMAGE_CONFIG.updateImagePath('media/produits/li-cube-pro/');
```

### Exemples de Chemins

```javascript
// Pour images dans le dossier racine
imagePath: 'image/Produit/Li-CUBE PRO/',

// Pour images dans un sous-dossier assets
imagePath: 'assets/images/licube-pro/',

// Pour images sur un CDN
imagePath: 'https://cdn.edsquebec.com/images/produits/licube/',

// Pour images dans un dossier parent
imagePath: '../images/products/licube/',
```

---

## 🧪 Test et Validation

### Page de Test

Ouvrir `test-image-system.html` dans un navigateur pour :
- ✅ Valider le chargement des images
- 🔧 Tester les changements d'emplacement
- 🐛 Activer le mode debug
- 📊 Voir le statut du système

### Console de Debug

Activer le debug dans le JavaScript :
```javascript
window.DEBUG_IMAGE_PATHS = true;
```

### Vérification Manuelle

1. **Vérifier la configuration :**
   ```javascript
   console.log(IMAGE_CONFIG);
   ```

2. **Compter les images initialisées :**
   ```javascript
   console.log(document.querySelectorAll('img.licube-dynamic-image').length);
   ```

3. **Lister les images détectées :**
   ```javascript
   document.querySelectorAll('img[data-licube-image]').forEach((img, i) => {
       console.log(`Image ${i+1}: ${img.getAttribute('data-licube-image')} (depth: ${img.getAttribute('data-depth')})`);
   });
   ```

---

## 🚨 Dépannage

### Problèmes Courants

| Problème | Cause Probable | Solution |
|----------|----------------|----------|
| Images ne se chargent pas | Chemin incorrect dans `imagePath` | Vérifier et corriger le chemin dans `js/image-config.js` |
| Script non trouvé | Chemin vers le script incorrect | Ajuster le chemin selon la profondeur : `../js/image-config.js` |
| Attribut `data-depth` incorrect | Mauvaise valeur de profondeur | Compter les niveaux de dossiers depuis la racine |
| Console errors | Image n'existe pas | Vérifier que le fichier image existe physiquement |

### Messages d'Erreur Typiques

```
IMAGE_CONFIG: Image 'filename.png' non trouvée dans availableImages
→ Ajouter l'image dans availableImages ou vérifier le nom

IMAGE_CONFIG: depth doit être un nombre positif
→ Corriger l'attribut data-depth dans le HTML

IMAGE_CONFIG: imageName requis et doit être une chaîne
→ Vérifier l'attribut data-licube-image
```

### Fallback (Solution de Secours)

Le système inclut un mécanisme de fallback automatique :
1. Tentative avec le chemin principal
2. Tentative avec un chemin alternatif
3. Affichage d'un placeholder si échec

---

## 📈 Avantages du Système

### ✅ Pour les Développeurs
- **Maintenance simplifiée** : Un seul point de configuration
- **Évite les erreurs** : Validation automatique des chemins
- **Debug facile** : Console intégrée et logs détaillés
- **Flexibilité** : Changement d'emplacement en temps réel

### ✅ Pour les Utilisateurs
- **Performance** : Chargement optimisé des images
- **Fiabilité** : Gestion automatique des erreurs
- **Compatibilité** : Fonctionne sur tous les navigateurs modernes

### ✅ Pour la Maintenance
- **Documentation** : Code entièrement commenté en français
- **Tests** : Page de validation intégrée
- **Évolutivité** : Facile à étendre pour d'autres produits

---

## 🔮 Évolutions Futures

### Fonctionnalités Prévues
- Support pour d'autres gammes de produits EDS Québec
- Optimisation automatique des images (WebP, lazy loading)
- Cache intelligent pour les performances
- Interface d'administration pour la gestion des images

### Extension du Système
```javascript
// Configuration multi-produits (futur)
const PRODUCT_IMAGES = {
    'licube-pro': { path: 'image/Produit/Li-CUBE PRO/', images: {...} },
    'autre-produit': { path: 'image/Produit/Autre/', images: {...} }
};
```

---

## 📞 Support

Pour toute question ou problème avec le système d'images :

- **Documentation complète** : Ce fichier `GUIDE-SYSTEME-IMAGES.md`
- **Page de test** : `test-image-system.html`
- **Code source** : `js/image-config.js` (entièrement commenté)

---

**Développé par EDS Québec - Energy Dream System**  
*Système de gestion d'images version 1.0.0*  
*Dernière mise à jour : Janvier 2025*