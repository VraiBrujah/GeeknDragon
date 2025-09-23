# CLAUDE.md - Geek & Dragon

## Contexte du Projet 

**Geek & Dragon** est un site e-commerce spécialisé dans les accessoires immersifs pour jeux de rôle (D&D), développé par Brujah au Québec. Le site propose des produits physiques qui enrichissent l'expérience de jeu : pièces métalliques gravées, cartes d'équipement illustrées, et fiches de personnage triptyques robustes.

**Répertoire de Travail** : `E:\GitHub\GeeknDragon`

## Spécialisation E-commerce & D&D

### 🎯 Expertise Requise
- **E-commerce Premium** : Boutique en ligne avec Snipcart, gestion de stock dynamique, paiements sécurisés
- **Univers D&D** : Connaissance approfondie des mécaniques, terminologie, et besoins des joueurs
- **Marketing Immersif** : Textes accessibles aux non-initiés mais authentiques pour les passionnés
- **Expérience Utilisateur** : Interface intuitive pour découverte de produits et calculs complexes

### 🛍️ Fonctionnalités E-commerce Clés

#### Système de Produits Sophistiqué
- **Produits Personnalisables** : Pièces avec choix de métal (cuivre, argent, électrum, or, platine) et multiplicateur (1x, 10x, 100x, 1000x, 10000x)
- **Gestion Stock Intelligente** : Synchronisation Snipcart API + fallback données locales
- **Catalogue Multilingue** : Français/Anglais avec traductions contextuelles
- **Images Optimisées** : WebP avec fallbacks, chargement paresseux

#### Convertisseur de Monnaie D&D Avancé
- **Calculs Temps Réel** : Conversion entre pièces D&D avec multiplicateurs
- **Recommandations Optimales** : Algorithme minimisant le nombre de pièces physiques
- **Interface Immersive** : Cartes visuelles par métal avec animations contextuelles
- **Recommandations de Lots** : Suggestion automatique de produits correspondant aux besoins

#### Système de Recommandations Intelligent
- **Analyse Dynamique** : Parsing automatique de products.json
- **Cache Performant** : localStorage avec invalidation temporelle
- **Algorithme Coût-Optimal** : Trouve la combinaison la moins chère pour toute quantité
- **UX Fluide** : Animations de calcul, messages contextuels

### 🎲 Spécificités D&D

#### Système Monétaire
```javascript
const rates = {
  copper: 1,      // Pièce de cuivre (base)
  silver: 10,     // 1 argent = 10 cuivres
  electrum: 50,   // 1 électrum = 50 cuivres
  gold: 100,      // 1 or = 100 cuivres
  platinum: 1000  // 1 platine = 1000 cuivres
};

const multipliers = [1, 10, 100, 1000, 10000]; // Multiplicateurs physiques
```

#### Produits Immersifs
- **Cartes d'équipement** : 560 cartes illustrées remplaçant la lecture des manuels
- **Pièces métalliques** : Gravées physiquement pour ressentir les trésors
- **Fiches triptyques** : Gestion de personnage sans ouvrir de livres

### 📝 Guidelines de Contenu

#### Ton & Style
- **Immersif mais accessible** : Évoque l'aventure sans jargon exclusif
- **Authenticité geek** : Respecte la culture D&D avec passion
- **Clarté commerciale** : Avantages produits évidents
- **Émotion tactile** : Met en avant l'expérience physique vs numérique

#### Exemples de Formulations
✅ **Bon** : "Ressentez le poids réel du butin qui glisse entre vos doigts comme un héritage oublié"
❌ **Éviter** : "Notre produit de pièces métalliques offre une fonctionnalité de simulation haptique"

✅ **Bon** : "Fini les combats contre les feuilles de personnage froissées"
❌ **Éviter** : "Interface utilisateur optimisée pour la gestion de caractéristiques"

### 🛠️ Architecture Technique

#### Stack Principal
- **Frontend** : PHP + Tailwind CSS + JavaScript ES6+
- **E-commerce** : Snipcart intégration complète
- **Données** : JSON statique avec cache intelligent
- **Performance** : Lazy loading, debouncing, optimisations

#### Composants JavaScript Critiques

##### CurrencyConverterPremium (`js/currency-converter.js`) - **UNIFIÉ & OPTIMISÉ**
- **Métaheuristique multi-stratégies** pour optimisation globale
- Convertisseur temps réel avec calcul optimal des pièces physiques
- **Recommandations de lots intégrées** avec parsing dynamique de products.json
- Gestion intelligente des produits personnalisables et fixes
- Calcul d'efficacité prix/pièce pour sélection optimale des lots
- Animation boulier multilingue pour feedback utilisateur
- Gestion états, callbacks, internationalisation
- Interface utilisateur riche (cartes, animations, traductions)

##### SnipcartUtils (`js/snipcart-utils.js`) - **RÉUTILISABLE**
- Utilitaires cohérents pour l'ajout au panier (boutique + aide-jeux)
- Génération automatique des attributs Snipcart corrects
- Support complet des champs personnalisés (métal, multiplicateur)
- Fonctions d'ajout multiple au panier avec feedback utilisateur
- Traductions automatiques et gestion multilingue

##### App Principal (`js/app.js`)
- Utilitaires génériques réutilisables
- Gestion navigation, vidéos, internationalisation
- Optimisations mobile et desktop
- Intégration Swiper/Fancybox

#### Patterns de Développement

##### Performance
```javascript
// Debouncing pour événements fréquents
const debouncedUpdate = debounce(() => {
  this.updateCalculations();
  this.notifyCallbacks();
}, 150);

// Lazy loading pour composants lourds
const initWhenVisible = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        initComponent();
        observer.disconnect();
      }
    });
  });
};
```

##### Gestion d'État
```javascript
// Callbacks pour réactivité
onChange(callback) {
  if (typeof callback === 'function') {
    this.changeCallbacks.push(callback);
  }
}

// Notification changements
notifyChange(data) {
  this.changeCallbacks.forEach(callback => {
    try { callback(data); } catch (error) {
      console.warn('Erreur callback:', error);
    }
  });
}
```

## 🏗️ Architecture des Nouveaux Composants

### CoinLotAnalyzer - Système d'Analyse Intelligent

#### Parsing Dynamique des Capacités
```javascript
// Extrait automatiquement les capacités depuis products.json
extractCoinProducts() {
  // Identifie tous les produits coin-*
  // Analyse leur structure coin_lots
  // Détermine les capacités (personnalisable, fixe, semi-fixe)
  // Génère les variations possibles
}

analyzeLotCapabilities(coinLots, isCustomizable, multipliers) {
  // Type 'customizable': peut faire n'importe quelle combinaison
  // Type 'fixed_quantity_chosen_multiplier': quantité fixe, multiplicateur choisi
  // Type 'fixed_complete': tout est défini (Collections Complètes)
}
```

#### Algorithme d'Optimisation Prix Minimum
```javascript
findOptimalLots(needs) {
  // Génère toutes les combinaisons possibles
  // Évalue chaque solution par prix total
  // Retourne la solution la moins chère
  // Assure couverture exacte des besoins
}
```

### SnipcartUtils - Utilitaires Réutilisables

#### Création Cohérente des Boutons
```javascript
createAddToCartButton(productData, options) {
  // Attributs de base identiques partout
  // Champs personnalisés automatiques
  // Support multilingue intégré
  // URL et métadonnées correctes
}

updateCustomFields(button, selections) {
  // Trouve les champs par rôle (metal, multiplier)
  // Met à jour les valeurs sélectionnées
  // Maintient la cohérence avec la boutique
}
```

#### Ajout Multiple Optimisé
```javascript
addMultipleToCart(products, onProgress) {
  // Délais entre ajouts pour éviter conflits
  // Callback de progression
  // Gestion d'erreurs robuste
  // Feedback utilisateur élégant
}
```

### Intégration Convertisseur ↔ Recommandations

1. **Convertisseur** calcule valeurs optimales par métal/multiplicateur avec métaheuristiques
2. **Algorithme** trouve les lots les moins chers via parsing dynamique
3. **SnipcartUtils** ajoute au panier avec attributs corrects

### 🧪 Système de Tests Intégré

#### Tests Automatisés (`js/currency-converter-tests.js`)
- **Tests de Base** : Validation conversion optimale, calculs métaheuristiques
- **Tests Avancés** : Recommandations de lots, minimisation coût, couverture
- **Tests Critiques** : Cas problématiques (1661 cuivres), validation algorithmes

#### Interface de Débogage (aide-jeux.php)
- **Raccourci** : `Ctrl+Shift+T` pour afficher/masquer section debug
- **Auto-activation** : URL avec `#debug` ou `?debug=1`
- **Tests en temps réel** : Validation immédiate des calculs

#### Pages de Tests Standalone
- **test-converter-system.html** : Tests complets avec interface utilisateur
- **validate-integration.html** : Validation finale de l'intégration
- **quick-test.js** : Guide de référence pour tests manuels

#### Validation Métaheuristique
```javascript
// 3 stratégies gloutonnes pour optimisation
greedyStrategy(targetValue, denoms, strategy) {
  switch (strategy) {
    case 0: // Standard greedy (plus grande valeur d'abord)
    case 1: // Éviter gros multiplicateurs 
    case 2: // Préférence une pièce par métal
  }
}
```

#### Critères de Validation
- ✅ **Performance** : Solution en <100ms, aucune boucle infinie
- ✅ **Optimalité** : Nombre minimal de pièces physiques
- ✅ **Coût** : Lots recommandés minimisent le prix total
- ✅ **Couverture** : Aucun déficit, surplus acceptable
- ✅ **Cohérence** : Même comportement boutique vs aide-jeux

## 🧹 Pratiques de Nettoyage & Optimisation

### Métaheuristiques Adoptées
- **Multi-stratégies gloutonnes** : 3 approches testées, meilleure retenue
- **Recherche locale limitée** : Performance O(n) garantie
- **Timeout de sécurité** : Aucun blocage possible
- **Animation feedback** : Boulier multilingue pendant calculs

### Réutilisation de Code
- **Pas de duplication** : Une seule fonction par fonctionnalité
- **Composants modulaires** : SnipcartUtils partagé boutique/aide-jeux
- **Parsing dynamique** : products.json analysé automatiquement
- **Pas de hardcoding** : Tout paramétrable et extensible

### Nettoyage Automatique
- **Fichiers obsolètes supprimés** : coin-lot-analyzer.js, dynamic-coin-recommender.js
- **Scripts inutiles retirés** : aide-jeux.php allégé
- **Code mort éliminé** : Fonctions non-utilisées supprimées
- **Dépendances optimisées** : Seuls les scripts nécessaires chargés

### Patterns de Conception
- **Strategy Pattern** : Multiple algorithmes d'optimisation
- **Factory Pattern** : Génération dynamique des champs Snipcart
- **Observer Pattern** : Callbacks pour réactivité
- **Template Method** : Structure commune, implémentations variables

## 🔄 Corrections Majeures Récentes

### Système de Recommandations de Lots Corrigé
- **Problème** : Recommandations incorrectes, calculs erronés, noms produits mal formés
- **Solution** : Nouveau `CoinLotAnalyzer` avec parsing dynamique et optimisation prix minimum
- **Exemple** : Pour 1661 cuivres → Quintessence Métallique (×1) + Pièce Personnalisée électrum (×10) au lieu d'une seule pièce cuivre

### Convertisseur de Monnaie Optimisé  
- **Problème** : Calcul total pièces incorrect, algorithme non-optimal
- **Solution** : Répartition globalement optimale minimisant le nombre de pièces physiques
- **Exemple** : 1661 cuivres = 4 pièces (1 platine + 1 or×10 + 3 électrum×10 + 3 électrum + 1 argent + 1 cuivre) au lieu de 8

### Ajout au Panier Unifié
- **Problème** : Code dupliqué, comportements incohérents entre pages
- **Solution** : `SnipcartUtils` réutilisable avec même logique partout
- **Bénéfice** : Noms produits corrects, traductions cohérentes, variations bien gérées

### 🔧 Maintenance & Amélioration Continue

#### Ajout de Produits
1. **Mettre à jour** `data/products.json` avec structure consistante
2. **Ajouter images** dans `/media/products/` avec nommage cohérent
3. **Tester** convertisseur et recommandations automatiquement
4. **Vérifier** traductions français/anglais

#### Optimisations Prioritaires
- **Performance** : Lazy loading, cache, optimisations bundle
- **UX** : Animations fluides, feedback utilisateur, accessibilité
- **SEO** : Meta descriptions, alt text, structured data
- **Conversion** : A/B testing, checkout flow, recommandations

#### Scripts de Maintenance
- `sync-stock.php` : Synchronisation stock Snipcart
- `build-sitemap.php` : Génération sitemap automatique
- `convert-products.php` : Migration données produits
- `validate_stock.php` : Validation cohérence stock

### 🚀 Bonnes Pratiques

#### Code JavaScript
- **Modules** : Classes réutilisables avec APIs claires
- **Performance** : Éviter fuites mémoire, optimiser DOM
- **Robustesse** : Gestion erreurs, fallbacks, validation
- **Maintenabilité** : Documentation, nommage explicite

#### PHP
- **Sécurité** : Validation inputs, échappement outputs
- **Configuration** : Variables environnement pour secrets
- **Erreurs** : Gestion gracieuse, logs appropriés
- **Standards** : PSR compliance, structure cohérente

#### Contenu
- **Immersion** : Langue évocatrice mais claire
- **Inclusivité** : Accessible aux débutants D&D
- **Conversion** : Call-to-actions contextuels
- **Authenticité** : Respecte la culture geek

### 📋 Checklist Développement

Avant chaque déploiement :
- [ ] Tests convertisseur toutes devises/multiplicateurs
- [ ] Validation recommandations avec vrais produits
- [ ] Vérification stock Snipcart synchronisé
- [ ] Tests responsive mobile/desktop
- [ ] Validation traductions français/anglais
- [ ] Performance Lighthouse (>90)
- [ ] Accessibilité WCAG 2.1 AA
- [ ] SEO meta tags complets

### 🎯 Objectifs Business

#### Conversion
- Faciliter découverte produits pour non-initiés
- Démontrer valeur ajoutée vs alternatives numériques
- Simplifier processus achat complexe (personnalisation)
- Encourager paniers plus volumineux

#### Expérience
- Immersion dès l'arrivée sur le site
- Outils pratiques (convertisseur) créent engagement
- Confiance par transparence (prix, stock, specs)
- Support client proactif

#### Technique
- Performance optimale toutes conditions
- Maintenabilité long terme
- Évolutivité fonctionnalités
- Robustesse e-commerce

---

**Note** : Ce site nécessite une compréhension profonde de l'écosystème D&D ET des enjeux e-commerce premium. L'objectif est de transformer la passion pour le JDR en expérience d'achat fluide et mémorable.