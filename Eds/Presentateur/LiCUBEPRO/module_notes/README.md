# 📝 Module Notes Universel

Module de notes générique et réutilisable pour n'importe quelle page web. Permet aux utilisateurs d'ajouter, sauvegarder et exporter des notes contextuelles liées à une page spécifique.

## 🎯 Caractéristiques

- ✅ **Sauvegarde automatique** basée sur l'URL de la page
- ✅ **Interface adaptative** (desktop/mobile)
- ✅ **Raccourcis clavier** (Ctrl+Shift+N)
- ✅ **Export en Markdown** téléchargeable
- ✅ **Styles personnalisables** via variables CSS
- ✅ **Compatible** avec tous les sites web
- ✅ **Aucune dépendance** externe
- ✅ **Léger** (~15KB minifié)

## 🚀 Installation rapide

### 1. Copier les fichiers

Copiez les fichiers suivants dans votre projet :
- `notes-universal.js`
- `notes-universal.css`

### 2. Inclure dans votre page HTML

```html
<!DOCTYPE html>
<html>
<head>
    <!-- Vos autres styles -->
    <link rel="stylesheet" href="path/to/notes-universal.css">
</head>
<body>
    <!-- Votre contenu -->
    
    <!-- Scripts -->
    <script src="path/to/notes-universal.js"></script>
    <script>
        // Initialisation automatique quand la page est chargée
        document.addEventListener('DOMContentLoaded', function() {
            NotesUniversel.init();
        });
    </script>
</body>
</html>
```

### 3. C'est tout !

Le bouton flottant 📝 apparaîtra automatiquement sur votre page.

## 📖 Utilisation

### Ouvrir les notes
- Cliquer sur le bouton flottant 📝
- Ou utiliser le raccourci **Ctrl+Shift+N**

### Actions disponibles
- **💾 Sauver** : Sauvegarde la note en cours
- **👁️ Voir** : Affiche les notes existantes pour cette page
- **📤 Export** : Télécharge toutes les notes en fichier Markdown
- **🗑️ Effacer** : Efface le texte en cours de saisie
- **✕ Fermer** : Ferme la fenêtre (ou touche Échap)

## 🎨 Personnalisation

### Couleurs et thème

Modifiez les variables CSS au début du fichier `notes-universal.css` :

```css
:root {
    /* Changez ces couleurs pour correspondre à votre site */
    --notes-primary-color: #YOUR_COLOR;     /* Couleur principale */
    --notes-secondary-color: #YOUR_COLOR;   /* Couleur secondaire */
    --notes-success-color: #YOUR_COLOR;     /* Couleur de succès */
    /* ... autres variables */
}
```

### Position du bouton

```javascript
NotesUniversel.init({
    styles: {
        buttonPosition: 'left',           // 'left' ou 'right'
        buttonVerticalPosition: 'top'     // 'top', 'center', 'bottom'
    }
});
```

### Textes personnalisés (multilingue)

```javascript
NotesUniversel.init({
    texts: {
        title: 'Notes',
        placeholder: 'Écrivez vos notes ici...',
        saveButton: '💾 Save',
        viewButton: '👁️ View',
        exportButton: '📤 Export',
        clearButton: '🗑️ Clear',
        // ... autres textes
    }
});
```

### Exemple complet de personnalisation

```javascript
document.addEventListener('DOMContentLoaded', function() {
    NotesUniversel.init({
        // Position du bouton
        styles: {
            primaryColor: '#007BFF',      // Bleu au lieu d'orange
            buttonPosition: 'left',       // À gauche au lieu de droite
            buttonVerticalPosition: 'top' // En haut au lieu du centre
        },
        
        // Textes en anglais
        texts: {
            title: 'My Notes',
            placeholder: 'Write your notes here...',
            saveButton: '💾 Save Note',
            viewButton: '👁️ Show Notes',
            exportButton: '📤 Download',
            clearButton: '🗑️ Clear'
        }
    });
});
```

## 📁 Gestion des fichiers

### Nom des fichiers de sauvegarde

Les notes sont sauvegardées avec un nom de fichier généré automatiquement basé sur l'URL :

**Exemple :**
- Page : `https://monsite.com/dossier/page.html`
- Fichier : `monsite_com_dossier_page_html.md`

### Stockage

- **Local** : `localStorage` du navigateur
- **Clé** : `notes_universal_{nom_fichier}`
- **Format** : Markdown avec horodatage

### Export

Les notes exportées contiennent :
- Titre de la page
- URL complète
- Date d'export
- Toutes les notes avec horodatage
- Format Markdown standard

## 🛠️ API du module

### Méthodes principales

```javascript
// Initialisation
NotesUniversel.init(options);

// Contrôle de la fenêtre
NotesUniversel.open();      // Ouvrir
NotesUniversel.close();     // Fermer
NotesUniversel.toggle();    // Basculer

// Configuration
NotesUniversel.updateConfig(newConfig);

// Informations
NotesUniversel.getPageInfo(); // Retourne infos de la page
console.log(NotesUniversel.version); // Version du module
```

### Exemple d'intégration avancée

```javascript
// Initialisation avec configuration personnalisée
NotesUniversel.init({
    styles: {
        primaryColor: '#FF6B35',
        buttonPosition: 'right'
    }
});

// Ouvrir automatiquement les notes sur certaines pages
if (window.location.pathname.includes('/admin/')) {
    setTimeout(() => {
        NotesUniversel.open();
    }, 2000);
}

// Écouter les changements de configuration
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        // Ctrl+Shift+M pour changer la position du bouton
        NotesUniversel.updateConfig({
            styles: {
                buttonPosition: 'left'
            }
        });
    }
});
```

## 🌐 Compatibilité

### Navigateurs supportés
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

### Frameworks CSS
Compatible avec :
- ✅ Bootstrap
- ✅ Tailwind CSS
- ✅ Bulma
- ✅ Foundation
- ✅ CSS personnalisé

### Appareils
- ✅ Desktop (Windows, Mac, Linux)
- ✅ Tablettes (iPad, Android)
- ✅ Smartphones (iOS, Android)

## 📱 Responsive Design

Le module s'adapte automatiquement :

- **Desktop** : Fenêtre 400px de large, bouton 55px
- **Tablettes** : Fenêtre pleine largeur moins marges, bouton 50px
- **Smartphones** : Fenêtre pleine largeur, bouton 45px, texte ajusté
- **Très petits écrans** : Optimisations spéciales pour 320px et moins

## 🚫 Résolution des problèmes

### Le bouton n'apparaît pas
- Vérifiez que le CSS est bien chargé
- Vérifiez que `NotesUniversel.init()` est appelé
- Vérifiez la console pour les erreurs JavaScript

### Les styles ne s'appliquent pas
- Vérifiez l'ordre de chargement des CSS
- Ajoutez `!important` si nécessaire
- Utilisez les variables CSS pour personnaliser

### Les notes ne se sauvegardent pas
- Vérifiez que `localStorage` est disponible
- Vérifiez que le site n'est pas en mode privé
- Vérifiez les quotas de stockage du navigateur

### Conflits avec d'autres scripts
- Le module utilise l'espace de nom `NotesUniversel`
- Les styles sont préfixés par `.notes-`
- Z-index élevé (9999-10000) pour éviter les superpositions

## 🔧 Personnalisation avancée

### Modifier les styles CSS

```css
/* Remplacer complètement l'apparence du bouton */
.notes-toggle-btn {
    background: linear-gradient(45deg, #FF6B6B, #4ECDC4) !important;
    border-radius: 10px !important;
    width: 60px !important;
    height: 40px !important;
}

/* Changer l'apparence de la fenêtre */
.notes-window {
    background: rgba(255, 255, 255, 0.95) !important;
    color: #333 !important;
    border: 1px solid #ddd !important;
}
```

### Événements personnalisés

```javascript
// Écouter l'ouverture de la fenêtre
document.addEventListener('click', function(e) {
    if (e.target.id === 'notes-toggle-btn') {
        console.log('Notes ouvertes !');
        // Votre code personnalisé
    }
});
```

## 📄 Licence

Ce module est libre d'utilisation et de modification. Aucune restriction.

## 🤝 Support

Pour toute question ou amélioration :
1. Vérifiez ce README
2. Consultez les commentaires dans le code
3. Testez avec la console développeur du navigateur

## 📋 Changelog

### Version 1.0.0
- ✅ Version initiale
- ✅ Interface complète avec sauvegarde
- ✅ Export Markdown
- ✅ Responsive design
- ✅ API publique
- ✅ Documentation complète

---

**🎉 Merci d'utiliser le Module Notes Universel !**