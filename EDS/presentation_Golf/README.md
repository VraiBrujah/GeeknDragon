# Présentation EDS Québec - Batteries Golf

## 📋 Description

Présentation interactive pour les contrats de location de batteries lithium LiFePO₄ destinées aux voiturettes de golf. Cette application web affiche une comparaison technique et économique entre les batteries plomb traditionnelles et la solution lithium révolutionnaire d'EDS Québec.

## 🚀 Fonctionnalités

- **Présentation bilingue** (Français/Anglais) avec switch en temps réel
- **Calculateur de flotte dynamique** avec ajustement en temps réel
- **Système de couleurs CSV-éditable** pour personnalisation complète
- **Architecture modulaire** avec séparation données/présentation/logique
- **Audio ambiant** avec contrôles intégrés
- **Responsive design** optimisé mobile et desktop
- **Comparaison interactive** plomb vs lithium avec animations

## 📁 Structure du Projet

```
presentation_Golf/
├── assets/
│   ├── css/           # Feuilles de style
│   ├── js/            # Scripts JavaScript
│   ├── images/        # Images et icônes
│   └── audio/         # Musique d'ambiance
├── data/              # Fichiers de données CSV
│   ├── data_clean.csv     # Contenu français
│   ├── data_en_clean.csv  # Contenu anglais
│   ├── variables.csv      # Variables calculées
│   └── formulas.csv       # Formules de calcul
├── docs/              # Documentation
└── presentation_golf.html # Page principale
```

## 🎨 Système de Couleurs CSV-Éditable

Les couleurs de l'interface sont entièrement configurables via CSV avec support des gradients :

```csv
section,key,value,color,gradient_color_1,gradient_color_2
comparison_section,table_header_bg_gradient,,#1e40af,#BFF2EB
solution_section,background_gradient,,#064e3b,#059669
```

## 🔧 Installation et Utilisation

### Démarrage Rapide

```bash
# Cloner ou télécharger le projet
cd presentation_Golf

# Démarrer un serveur local
python -m http.server 8000
# ou
php -S localhost:8000
# ou
npx serve .

# Ouvrir dans le navigateur
http://localhost:8000/presentation_golf.html
```

### Configuration

1. **Modifier le contenu** : Éditer les fichiers CSV dans `/data/`
2. **Personnaliser les couleurs** : Utiliser les colonnes `color`, `gradient_color_1`, `gradient_color_2`
3. **Ajuster les calculs** : Modifier `variables.csv` et `formulas.csv`

## 📊 Architecture Technique

### Données Centralisées
- **CSV multilingue** avec synchronisation automatique
- **Variables dynamiques** calculées en temps réel
- **Formules économiques** paramétrables

### Frontend Moderne
- **JavaScript ES6+** modulaire et optimisé
- **CSS Grid/Flexbox** responsive
- **API File System** pour exports

### Fonctionnalités Avancées
- **Métaheuristiques** pour calculs d'optimisation
- **Cache intelligent** avec invalidation
- **Animations CSS** fluides
- **Accessibilité WCAG 2.1**

## 🎯 Personnalisation

### Modifier les Couleurs
```csv
# Gradient de section
section_name,background_gradient,,#couleur1,#couleur2

# Couleur simple
element_name,color_property,#couleur,#couleur
```

### Ajouter du Contenu
```csv
nouvelle_section,nouveau_element,Votre texte ici,#couleur
```

### Calculs Économiques
Les variables dans `variables.csv` alimentent automatiquement tous les calculs :
- Coûts de remplacement
- Maintenance spécialisée
- ROI et économies
- Comparaisons 10/20 ans

## 🌐 Support Multilingue

Le système détecte automatiquement la langue et charge :
- `data_clean.csv` pour le français
- `data_en_clean.csv` pour l'anglais

Synchronisation des couleurs maintenue entre les deux versions.

## 🔧 Maintenance

### Nettoyage
Le projet est optimisé et nettoyé :
- ✅ Structure organisée en dossiers logiques
- ✅ Code JavaScript optimisé
- ✅ Chemins mis à jour automatiquement
- ✅ Fichiers obsolètes supprimés

### Développement
- Code modulaire et documenté en français
- Patterns de conception appliqués
- Tests intégrés pour validations
- Architecture extensible

## 📝 Licence

Propriété d'EDS Québec - Tous droits réservés

## 🤝 Contact

**Répertoire de Travail** : `E:\GitHub\GeeknDragon\EDS\presentation_Golf`

Pour toute question technique ou modification, consultez la documentation dans `/docs/CLAUDE.md`