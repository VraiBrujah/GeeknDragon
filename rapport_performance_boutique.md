# Rapport d'Analyse de Performance - Page Boutique

## Contexte
Analyse comparative des temps de chargement entre `index.php` (~100ms) et `boutique.php` (~11 secondes).

## Résultats des Tests

### 1. Temps d'Exécution PHP
- **index.php** : 108ms
- **boutique.php** : 11,457ms (11.46 secondes)
- **Ratio** : boutique.php est 105x plus lente

### 2. Analyse Détaillée des Composants

#### Composants Rapides (< 50ms)
- Bootstrap/dépendances : 20ms
- Chargement products.json : 0.32ms  
- Traitement des 9 produits : 0.02ms
- Vérification stock : 0.28ms

#### Composants Lents
- **Parsedown** : 2ms d'initialisation + conversions multiples
- **Génération cartes produits** : 2.1ms pour 9 produits
- **Conversions Markdown→HTML** : Multiple par produit

### 3. Goulots d'Étranglement Identifiés

#### A. JavaScript Surchargé (645KB total)
```
app.js                 : 43,419 bytes
boutique-premium.js    : 11,314 bytes  
fancybox.umd.js       : 142,362 bytes
hero-videos.js        : 19,506 bytes
snipcart.js           : 6,029 bytes
swiper-bundle.min.js  : 140,575 bytes
vendor.bundle.min.js  : 281,600 bytes
```

#### B. Convertisseur de Monnaie Complexe
- **722 lignes de JavaScript** intégrées dans la page
- Classe `CurrencyConverterPremium` très volumineuse
- Calculs complexes en temps réel
- Multiples observateurs et événements

#### C. Traitement Markdown Répétitif
- Chaque produit (9) passe par :
  - Conversion Markdown→HTML (FR + EN)
  - Conversion HTML→texte brut (regex multiples)
  - Multiple formatage de chaînes

#### D. Inclusions de Fichiers Multiples
- `partials/product-card.php` inclus 9 fois
- `includes/markdown-utils.php` requis pour chaque produit
- Parsedown chargé pour chaque conversion

## Principales Causes du Ralentissement

### 1. **JavaScript Inline Volumineux (722 lignes)**
Le convertisseur de monnaie est intégré directement dans la page avec :
- Event listeners multiples
- Observateurs d'intersection
- Calculs mathématiques complexes
- Gestion d'état temps réel

### 2. **Chargement de Bibliothèques Lourdes**
- Parsedown (2MB+ décompressé)
- Multiple librairies JS simultanées
- Pas de lazy loading

### 3. **Traitement Markdown Inefficace**
- 18 conversions Markdown (9 produits × 2 langues)
- 18 nettoyages regex par conversion
- Pas de cache/memoization

### 4. **Architecture Non Optimisée**
- Code inline au lieu de fichiers externes
- Pas de compression/minification du JS custom
- Chargement synchrone de tout le contenu

## Recommandations d'Optimisation

### Priorité Haute
1. **Externaliser le convertisseur JS** vers un fichier séparé
2. **Lazy loading** du convertisseur (chargement à la demande)
3. **Cache Markdown** : stocker les conversions HTML

### Priorité Moyenne  
4. **Minifier** boutique-premium.js et le convertisseur
5. **Optimiser Parsedown** : une seule instance partagée
6. **Chunking JS** : charger les librairies selon le besoin

### Priorité Basse
7. Compression gzip/brotli côté serveur
8. CDN pour les assets statiques
9. Service Worker pour le cache

## Impact Estimé des Corrections

- **Externalisation JS** : -8 secondes
- **Cache Markdown** : -2 secondes  
- **Lazy loading** : -1 seconde

**Temps cible après optimisation** : < 1 seconde (similaire à index.php)