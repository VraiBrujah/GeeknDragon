# Images de Recettes - Carnivaute

## 📸 Gestion des Images de Recettes

### Structure d'Organisation

#### Par Catégorie de Recettes
```
recettes/
├── bases-techniques/          # 10 recettes de base
├── nez-a-queue-bouillons/    # 12 recettes de bouillons
├── petit-dejeuner-brunch/    # 10 recettes matinales
├── express-15-minutes/       # 12 recettes rapides
├── batch-cooking/            # 12 recettes lot
├── lunch-nomade/             # 10 recettes portables
├── famille-convivialite/     # 12 recettes familiales
├── gourmet-invites/          # 10 recettes raffinées
├── plein-air-voyage/         # 10 recettes outdoor
├── sport-recuperation/       # 10 recettes sportives
├── sauces-beurres/           # 12 recettes d'accompagnement
├── charcuteries/             # Images chapitres spéciaux
├── cuisson-sous-vide/        
├── recettes-crues/
└── oeufs/
```

### 📐 Spécifications Techniques

#### Format Standard Recette
- **Dimensions** : 1920x1080 pixels (16:9)
- **Résolution** : 150 DPI (web optimisé)
- **Format** : JPG haute qualité
- **Poids** : < 500 KB par image

#### Nomenclature des Fichiers
```
[categorie]_[numero]_[nom-recette].jpg

Exemples :
- express_01_steak-minute-spatial.jpg
- gourmet_05_filet-constellation.jpg
- batch_03_ragout-mars.jpg
```

### 🎨 Style Visuel Cohérent

#### Thématique Spatiale-Culinaire
- **Couleurs** : Palette chaude (rouges, oranges, bruns)
- **Éclairage** : Dramatique avec contraste élevé
- **Props** : Éléments subtils évoquant l'espace
  - Assiettes foncées (évoquant l'espace)
  - Couverts modernes/futuristes
  - Éclairage LED pour effet "vaisseau"

#### Composition Photographique
- **Angle** : 45° ou vue du dessus
- **Cadrage** : Plat principal dominant (70% de l'image)
- **Background** : Sombre et unifié
- **Focus** : Net sur le plat, arrière-plan légèrement flou

### 🥩 Styling Spécifique Carnivore

#### Mise en Valeur de la Viande
- **Cuisson visible** : Croûte dorée, saignant apparent
- **Jutosité** : Légère brillance naturelle
- **Couleurs** : Rouge, brun, doré intense
- **Textures** : Fibres et grains de viande visibles

#### Éléments d'Accompagnement
- **Minimal** : Focus sur la protéine animale
- **Complémentaires** : Sel, poivre, herbes fines
- **Sauces** : Coulées naturelles, pas de surcharge

### 📱 Formats de Sortie Multiple

#### Version Livre (Print)
- **Haute résolution** : 300 DPI
- **Profil couleur** : CMYK
- **Format** : Adapté à la mise en page

#### Version Web/Digital
- **Résolution optimisée** : 150 DPI
- **Format** : RGB
- **Compression** : Optimisée pour vitesse

#### Version Mobile
- **Dimensions** : 800x600 pixels
- **Poids** : < 200 KB
- **Format** : JPG optimisé

### 🔧 Production et Workflow

#### Checklist Pré-Production
- [ ] Liste des recettes finalisée
- [ ] Ingrédients et matériel photographique prêts
- [ ] Éclairage et décor configurés
- [ ] Nomenclature des fichiers préparée

#### Post-Production
- [ ] Retouche couleur (saturation des rouges)
- [ ] Ajustement contraste et luminosité
- [ ] Redimensionnement multi-format
- [ ] Compression optimisée
- [ ] Validation qualité

### 🚀 Images Génériques Thématiques

#### Headers de Chapitre
- **Fichiers** : `header_[chapitre].jpg`
- **Usage** : Séparation visuelle des sections
- **Style** : Abstrait spatial avec éléments culinaires

#### Backgrounds
- **Fichiers** : `bg_spatial_[variant].jpg`
- **Usage** : Arrière-plans pour textes
- **Style** : Étoiles, nébuleuses, vaisseau spatial

### ⚡ Images Placeholder

En attendant la production photo finale :
- **Nom** : `placeholder_recette.jpg`
- **Contenu** : Design sobre avec logo Carnivaute
- **Usage** : Remplacement temporaire
- **Message** : "Photo de recette en préparation"

### 📊 Métriques de Qualité

#### Standards Acceptables
- **Netteté** : Parfaite sur le plat principal
- **Colorimétrie** : Fidèle aux couleurs naturelles
- **Composition** : Équilibrée et appétissante
- **Cohérence** : Style uniforme sur toutes les images

#### KPI de Production
- **Temps/recette** : Max 30 min de shooting
- **Retouche** : Max 15 min/image
- **Taux d'acceptation** : > 95% première prise
- **Poids moyen** : < 400 KB version web