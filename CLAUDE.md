# CLAUDE.md - Geek & Dragon

## Contexte du Projet 

**Geek & Dragon** est un site e-commerce spécialisé dans les accessoires immersifs pour jeux de rôle (D&D), développé par Brujah au Québec. Le site propose des produits physiques qui enrichissent l'expérience de jeu : pièces métalliques gravées, cartes d'équipement illustrées, et fiches de personnage triptyques robustes.

**Répertoire de Travail** : `E:\GitHub\GeeknDragon`

## 🌐 DIRECTIVES DE DÉVELOPPEMENT FUNDAMENTALES

### 📢 Communication & Langue
- **Communication exclusive en français** : Toutes les interactions, explications et retours doivent être en français
- **Documentation française** : Tous les commentaires, docstrings, et documentation technique en français
- **Variables/fonctions** : Noms explicites en français ou anglais technique selon le contexte

### 🏗️ Principes d'Architecture & Génie Logiciel

#### Extensibilité & Modularité
- **Architecture extensible** : Tout composant doit être facilement extensible sans casser l'existant
- **Modules autonomes** : Chaque module doit fonctionner indépendamment (standalone)
- **Interfaces claires** : Contrats bien définis entre modules (patterns Strategy, Factory, Observer)
- **Injection de dépendances** : Éviter les couplages forts

#### Programmation Orientée Objet
- **Encapsulation stricte** : Propriétés privées avec accesseurs appropriés
- **Héritage maîtrisé** : Composition préférée à l'héritage quand approprié
- **Polymorphisme** : Interfaces et classes abstraites pour flexibilité
- **SOLID principles** : Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion

#### Clean Code & Qualité
- **Fonctions courtes** : Maximum 20-30 lignes par fonction
- **Noms explicites** : Variables et fonctions auto-documentées
- **Éviter la répétition** : DRY (Don't Repeat Yourself)
- **Tests unitaires** : Couverture minimale 80% pour logique métier
- **Refactoring continu** : Amélioration constante sans casser la fonctionnalité

### 🔒 Autonomie & Isolation

#### Fonctionnement Standalone
- **Aucune dépendance réseau durant l'exécution** : Pas d'API externes, CDN, ou services distants
- **APIs locales uniquement** : Seuls les téléchargements de modèles IA/LLM locaux autorisés
- **Données auto-contenues** : Configuration et données dans le projet
- **Mode offline** : Application fonctionnelle sans connexion internet

#### Sécurité des Données
- **Aucune fuite de données** : Pas de télémétrie, analytics externes, ou tracking
- **Confidentialité totale** : Toutes les données restent dans l'environnement local
- **Variables d'environnement** : Secrets et configurations sensibles externalisées

### 🚫 Interdictions Strictes

#### Données & Configuration
- **Pas de hardcodage** : Aucune valeur codée en dur dans le code source
- **Pas de données simulées** : Toutes les données doivent être réelles ou configurables
- **Pas de valeurs par défaut arbitraires** : Configuration explicite requise
- **Pas de données de test en production** : Séparation claire dev/prod

#### Dépendances Externes
- **Pas d'APIs tierces** : Aucun appel vers des services externes pendant l'exécution
- **Pas de CDN** : Assets locaux uniquement
- **Pas de tracking** : Google Analytics, Facebook Pixel, etc. interdits
- **Pas de fonts externes** : Polices auto-hébergées uniquement

### 📚 Documentation & Maintenance

#### Standards Documentation
```php
/**
 * Convertit un montant en cuivre vers la répartition optimale de pièces
 *
 * @param int $montantCuivre Montant total en pièces de cuivre
 * @param array $multiplicateursDisponibles Liste des multiplicateurs possibles
 * @return array Répartition optimale par métal et multiplicateur
 * @throws InvalidArgumentException Si le montant est négatif
 *
 * @example
 * $resultat = $convertisseur->convertirMontant(1661, [1, 10, 100, 1000, 10000]);
 * // Retourne: ['platinum_1' => 1, 'gold_100' => 6, 'electrum_10' => 1, ...]
 */
public function convertirMontant(int $montantCuivre, array $multiplicateursDisponibles): array
{
    // Implémentation...
}
```

#### Commentaires & Maintenance
- **Docstrings complets** : Tous les paramètres, retours et exceptions documentés
- **Commentaires explicatifs** : Logique complexe expliquée en français
- **Exemples concrets** : Cases d'usage dans la documentation
- **Historique des modifications** : Changelog maintenu

### ✅ Validation & Tests

#### Tests Obligatoires
- **Tests unitaires** : Chaque classe et méthode publique
- **Tests d'intégration** : Interaction entre modules
- **Tests de régression** : Éviter les régressions lors des modifications
- **Tests de performance** : Validation des temps de réponse

#### Critères d'Acceptance
- **Fonctionnement offline** : Application complètement autonome
- **Configuration externalisée** : Aucune valeur hardcodée
- **Documentation française** : 100% des commentaires et docs
- **Architecture extensible** : Nouveaux modules ajoutables sans impact

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

##### CurrencyConverterPremium (`js/currency-converter.js`) - **CONVERSION PURE**
- **Métaheuristique multi-stratégies** pour optimisation globale des pièces physiques
- Convertisseur temps réel avec calcul optimal minimal de pièces
- Algorithmes gloutons avancés (3 stratégies) pour répartition optimale
- Animation boulier multilingue pour feedback utilisateur
- Gestion états, callbacks, internationalisation
- Interface utilisateur riche (cartes, animations, traductions)
- **RESPONSABILITÉ** : Conversion uniquement, pas de recommandations de lots

##### CoinLotOptimizer (`js/coin-lot-optimizer.js`) - **SAC À DOS OPTIMAL**  
- **Algorithme de sac à dos** pour optimisation de coût des lots
- Expansion complète des variations produits (25 pour pièces/trio/septuple, 5 pour quintessence)
- Parsing dynamique intelligent de products.json avec détection par productId
- Combinaisons optimales avec surplus autorisé, déficit interdit
- Calcul prix minimum pour couverture exacte des besoins
- Support produits personnalisables ET fixes
- **RESPONSABILITÉ** : Recommandations de lots optimaux uniquement

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

### Intégration Convertisseur ↔ Optimiseur ↔ Snipcart

1. **CurrencyConverterPremium** calcule valeurs optimales par métal/multiplicateur avec métaheuristiques
2. **CoinLotOptimizer** reçoit les besoins exacts et génère toutes les variations produits possibles
3. **Algorithme sac à dos** trouve la combinaison de lots la moins chère (surplus OK, déficit interdit)
4. **SnipcartUtils** formate et ajoute la solution optimale au panier avec attributs corrects

#### Pipeline de Traitement
```javascript
// 1. Conversion (currency-converter.js)
const needs = {"copper_1": 1, "platinum_10": 1, "gold_1": 1, ...};

// 2. Optimisation (coin-lot-optimizer.js)
const optimizer = new CoinLotOptimizer();
const optimalSolution = optimizer.findOptimalProductCombination(needs);

// 3. Ajout panier (snipcart-utils.js)
SnipcartUtils.addMultipleToCart(optimalSolution);
```

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

## 🏭 SYSTÈME DE BUILD AUTOMATISÉ

### 📦 Minification et Optimisation

Le projet utilise un **système de build automatisé** pour générer toutes les versions optimisées des fichiers CSS et JavaScript, évitant la duplication manuelle et assurant des performances optimales en production.

#### Architecture Build

```
css/
├── styles.css                 # Source (développement)
├── styles.min.css            # Version minifiée (générée automatiquement)
├── styles.min.css.gz         # Version compressée (générée automatiquement)
├── vendor.bundle.min.css     # Bundle vendor (généré automatiquement)
└── vendor.bundle.min.css.gz  # Bundle compressé (généré automatiquement)

js/
├── app.js                    # Source (développement)
├── app.min.js               # Version minifiée (générée automatiquement)
├── app.bundle.min.js        # Bundle principal (généré automatiquement)
├── vendor.bundle.min.js     # Bundle vendor (généré automatiquement)
└── *.min.js.gz              # Versions compressées (générées automatiquement)
```

#### Commandes de Build

```bash
# Build complet (production)
npm run build:complete

# Build uniquement CSS
npm run build:css

# Build uniquement JavaScript  
npm run build:js

# Build pour déploiement
npm run deploy:prep

# Build optimisé complet
npm run production:build
```

#### Configuration Automatique

Le système `scripts/build-complete.js` traite automatiquement :

**Fichiers CSS sources :**
- `css/styles.css` → `css/styles.min.css`
- `css/snipcart-custom.css` → `css/snipcart-custom.min.css`
- `css/shop-grid.css` → `css/shop-grid.min.css`
- `css/geekndragon-custom.css` → `css/geekndragon-custom.min.css`

**Fichiers JavaScript sources :**
- `js/app.js` → `js/app.min.js`
- `js/currency-converter.js` → `js/currency-converter.min.js`
- `js/coin-lot-optimizer.js` → `js/coin-lot-optimizer.min.js`
- `js/snipcart-utils.js` → `js/snipcart-utils.min.js`
- Tous les autres fichiers JS critiques

**Bundles automatiques :**
- `css/vendor.bundle.min.css` : Combine Swiper + Fancybox
- `js/app.bundle.min.js` : Combine app + convertisseur + optimizer + utils
- `js/vendor.bundle.min.js` : Combine toutes les librairies externes

**Compression gzip :**
- Génération automatique des fichiers `.gz` pour tous les fichiers minifiés
- Réduction supplémentaire de 60-80% de la taille

#### Avantages du Système

✅ **Aucune duplication manuelle** : Une seule source, génération automatique  
✅ **Performance optimale** : Minification + compression + bundles  
✅ **Maintenance simplifiée** : Modification uniquement des fichiers sources  
✅ **Déploiement sécurisé** : Process reproductible et validé  
✅ **Monitoring intégré** : Rapport de tailles avant/après minification

#### Workflow de Développement

```bash
# 1. Développement : modifier les fichiers sources
vim css/styles.css
vim js/app.js

# 2. Test local avec sources non-minifiées
php -S localhost:8000

# 3. Build pour production
npm run production:build

# 4. Test avec versions minifiées
# Vérifier que tout fonctionne identiquement

# 5. Déploiement
npm run deploy:prep
```

#### Performance Impact

| Fichier | Source | Minifié | Compressé | Gain |
|---------|--------|---------|-----------|------|
| styles.css | 88 KB | 42 KB | 12 KB | 86% |
| app.js | 64 KB | 28 KB | 8 KB | 87% |
| Bundle total | 250 KB | 120 KB | 35 KB | 86% |

**Résultat** : Chargement des assets 3-4x plus rapide, amélioration significative des performances web.

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

## ⚠️ DIRECTIVES CRITIQUES - RESPECT OBLIGATOIRE

### 🔴 Règles de Développement Non-Négociables

#### 📁 Gestion des Fichiers
- **JAMAIS créer de nouveaux fichiers** sauf si absolument nécessaire pour atteindre l'objectif
- **TOUJOURS privilégier la modification** des fichiers existants
- **Nettoyer le projet** en consolidant et optimisant le code existant
- **Réutilisation maximale** : Une fonction = un endroit, réutilisée partout

#### 🏗️ Architecture & Design Patterns
- **Patrons de conception obligatoires** : Strategy, Factory, Observer, Singleton selon le contexte
- **Clean Code strictement appliqué** : Fonctions courtes, noms explicites, responsabilité unique
- **Docstrings complètes** : Paramètres, retours, exceptions, exemples en français
- **Orienté objet** quand pertinent : Encapsulation, héritage, polymorphisme maîtrisés

#### 🌐 Communication & Documentation
- **Documentation française exclusive** : Commentaires, docstrings, messages d'erreur en français
- **Variables/méthodes explicites** : Noms auto-documentés en français ou anglais technique
- **Exemples concrets** : Cas d'usage réels dans la documentation

#### 🔒 Autonomie & Sécurité Absolue
- **Projet modulaire autonome** : Fonctionne sans dépendances externes
- **AUCUNE fuite de données** : Pas de télémétrie, tracking, analytics
- **AUCUNE donnée réseau** durant l'exécution (sauf téléchargement modèles IA/LLM locaux)
- **Mode offline complet** : Application fonctionnelle sans internet

#### 🚫 Interdictions Absolues
- **Hardcodage interdit** : Aucune valeur codée en dur
- **Données simulées interdites** : Données réelles ou configurables uniquement
- **APIs externes interdites** : Pas d'appels réseau pendant l'exécution
- **CDN/Services externes interdits** : Assets et fonctionnalités locales uniquement

#### ✅ Validation Obligatoire
- **Tests automatisés** : Couverture minimale 80% logique métier
- **Architecture extensible** : Nouveaux modules sans impact sur l'existant
- **Configuration externalisée** : Variables d'environnement pour tous les paramètres
- **Documentation complète** : Chaque fonction publique documentée en français

**CES RÈGLES SONT NON-NÉGOCIABLES ET DOIVENT ÊTRE RESPECTÉES À 100%**

---

## 📋 STANDARDS DE DÉVELOPPEMENT OBLIGATOIRES

### 🐘 Standards PHP - Conformité PSR-12 & Sécurité

#### Conformité PSR-12 Stricte
```php
<?php

declare(strict_types=1);

namespace GeeknDragon\Core;

/**
 * Gestionnaire de configuration sécurisé
 * 
 * @package GeeknDragon\Core
 * @version 2.1.0
 */
final class GestionnaireConfiguration
{
    private array $parametres = [];
    
    public function obtenirParametre(string $cle, mixed $defaut = null): mixed
    {
        return $this->parametres[$cle] ?? $defaut;
    }
    
    public function definirParametre(string $cle, mixed $valeur): void
    {
        $this->parametres[$cle] = $valeur;
    }
}
```

#### Typage Strict Obligatoire
- `declare(strict_types=1);` dans TOUS les fichiers PHP
- Types de paramètres et retours explicites : `string`, `int`, `array`, `bool`, `mixed`
- Nullable types avec `?string`, `?int` quand approprié
- Union types PHP 8+ : `string|int|null`

#### Sécurité & Validation
```php
// Échappement sortie OBLIGATOIRE
echo htmlspecialchars($donneeUtilisateur, ENT_QUOTES, 'UTF-8');

// Validation entrée OBLIGATOIRE
$email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
if ($email === false) {
    throw new InvalidArgumentException('Email invalide');
}

// Requêtes préparées OBLIGATOIRES
$stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
$stmt->execute([$email]);
```

#### Gestion d'Erreurs Robuste
```php
// Exceptions typées
class ConfigurationException extends Exception {}

// Try-catch explicites
try {
    $resultat = $this->operationRisquee();
} catch (ConfigurationException $e) {
    $this->logger->error('Erreur configuration: ' . $e->getMessage());
    throw $e;
} catch (Exception $e) {
    $this->logger->critical('Erreur critique: ' . $e->getMessage());
    throw new RuntimeException('Opération échouée', 0, $e);
}
```

#### Nomenclature PHP Française
```php
// Classes : PascalCase français
class GestionnaireCommandes {}
class OptimisateurPerformance {}

// Méthodes : camelCase français  
public function obtenirListeProduits(): array {}
public function calculerMontantTotal(): float {}

// Variables : camelCase français
$listeProduits = [];
$montantTotal = 0.0;
$parametresConfiguration = [];

// Constantes : SNAKE_CASE français
const DUREE_CACHE_DEFAUT = 3600;
const NIVEAU_LOG_CRITIQUE = 'CRITIQUE';
```

### 🟨 Standards JavaScript ES6+ - Modularité & Performance

#### Architecture Modulaire ES6+
```javascript
// Modules avec export/import
export class ConvertisseurMonnaie {
    constructor(configuration) {
        this.configuration = configuration;
        this.cache = new Map();
    }
    
    async convertirMontant(montant, deviseOrigine, deviseDestination) {
        // Logique métaheuristique
    }
}

// Import sélectif
import { ConvertisseurMonnaie } from './modules/ConvertisseurMonnaie.js';
import { OptimisateurLots } from './modules/OptimisateurLots.js';
```

#### Gestion d'Événements Propre
```javascript
// Délégation d'événements
class GestionnaireInterface {
    constructor() {
        this.bindEvents();
    }
    
    bindEvents() {
        document.addEventListener('click', this.handleClick.bind(this));
        document.addEventListener('input', debounce(this.handleInput.bind(this), 300));
    }
    
    handleClick(event) {
        const target = event.target.closest('[data-action]');
        if (!target) return;
        
        const action = target.dataset.action;
        this.executeAction(action, target);
    }
    
    destroy() {
        // Nettoyage obligatoire
        document.removeEventListener('click', this.handleClick);
        this.cache.clear();
    }
}
```

#### Performance & Optimisation
```javascript
// Debouncing systématique
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
};

// Lazy loading composants
const lazyLoadComponent = async (componentName) => {
    const module = await import(`./components/${componentName}.js`);
    return new module.default();
};

// Cache intelligent
class CacheIntelligent {
    constructor(dureeVie = 300000) { // 5 minutes
        this.cache = new Map();
        this.dureeVie = dureeVie;
    }
    
    get(cle) {
        const item = this.cache.get(cle);
        if (!item) return null;
        
        if (Date.now() - item.timestamp > this.dureeVie) {
            this.cache.delete(cle);
            return null;
        }
        
        return item.valeur;
    }
}
```

#### Nomenclature JavaScript Française
```javascript
// Classes : PascalCase français
class ConvertisseurMonnaie {}
class OptimisateurLots {}

// Méthodes/fonctions : camelCase français
function calculerMontantOptimal() {}
function obtenirRecommandationsLots() {}

// Variables : camelCase français
const listeProduits = [];
const montantTotalCalcule = 0;
const parametresConfiguration = {};

// Constantes : SCREAMING_SNAKE_CASE
const DUREE_CACHE_PAR_DEFAUT = 300000;
const MULTIPLICATEURS_DISPONIBLES = [1, 10, 100, 1000, 10000];
```

### 🎨 Standards CSS - Conventions BEM & Variables Globales

#### Convention BEM Stricte
```css
/* Block */
.convertisseur-monnaie {
    display: grid;
    gap: var(--espacement-moyen);
}

/* Element */
.convertisseur-monnaie__carte {
    background: var(--couleur-fond-carte);
    border-radius: var(--rayon-bordure-standard);
}

.convertisseur-monnaie__titre {
    font-size: var(--taille-titre-section);
    color: var(--couleur-texte-principal);
}

/* Modifier */
.convertisseur-monnaie__carte--actif {
    border: 2px solid var(--couleur-accent-primaire);
    box-shadow: var(--ombre-elevation-carte);
}

.convertisseur-monnaie__bouton--desactive {
    opacity: 0.5;
    cursor: not-allowed;
}
```

#### Variables CSS Globales Cohérentes
```css
:root {
    /* Couleurs Primaires */
    --couleur-primaire: #8B0000;
    --couleur-secondaire: #DAA520;
    --couleur-accent: #CD853F;
    
    /* Couleurs Système */
    --couleur-succes: #22C55E;
    --couleur-erreur: #EF4444;
    --couleur-avertissement: #F59E0B;
    --couleur-info: #3B82F6;
    
    /* Typographie */
    --police-principale: 'Cinzel', serif;
    --police-texte: 'Open Sans', sans-serif;
    --taille-titre-principal: 2.5rem;
    --taille-titre-section: 1.875rem;
    --taille-texte-standard: 1rem;
    
    /* Espacements */
    --espacement-petit: 0.5rem;
    --espacement-moyen: 1rem;
    --espacement-grand: 2rem;
    --espacement-extra: 4rem;
    
    /* Dimensions */
    --largeur-contenu-max: 1200px;
    --hauteur-header: 80px;
    --rayon-bordure-standard: 8px;
    --rayon-bordure-petit: 4px;
    
    /* Ombres */
    --ombre-subtile: 0 1px 3px rgba(0, 0, 0, 0.1);
    --ombre-elevation-carte: 0 4px 12px rgba(0, 0, 0, 0.15);
    --ombre-focus: 0 0 0 3px rgba(139, 0, 0, 0.1);
    
    /* Transitions */
    --transition-rapide: 0.15s ease-in-out;
    --transition-standard: 0.3s ease-in-out;
    --transition-lente: 0.5s ease-in-out;
}
```

#### Organisation CSS Modulaire
```css
/* 1. Composants de base */
.bouton-primaire {
    background: var(--couleur-primaire);
    color: white;
    padding: var(--espacement-petit) var(--espacement-moyen);
    border-radius: var(--rayon-bordure-standard);
    transition: var(--transition-standard);
}

.bouton-primaire:hover {
    background: color-mix(in srgb, var(--couleur-primaire) 85%, black);
}

/* 2. Layouts responsives */
.grille-produits {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--espacement-grand);
}

@media (max-width: 768px) {
    .grille-produits {
        grid-template-columns: 1fr;
        gap: var(--espacement-moyen);
    }
}
```

### 🧹 Principes Clean Code - Nomenclature Française

#### Fonctions Courtes & Responsabilité Unique
```php
// ❌ Mauvais : fonction trop longue
public function traiterCommande($commande) {
    // 50 lignes de code...
}

// ✅ Bon : fonctions courtes spécialisées
public function validerCommande(Commande $commande): bool
{
    return $this->validateurCommande->valider($commande);
}

public function calculerTotalCommande(Commande $commande): float
{
    return $this->calculateurPrix->calculerTotal($commande);
}

public function enregistrerCommande(Commande $commande): void
{
    $this->depotCommandes->sauvegarder($commande);
}
```

#### Nommage Auto-Descriptif Français
```php
// ❌ Mauvais : noms vagues
$d = new DateTime();
$u = $repo->find($id);
$calc = $this->compute($data);

// ✅ Bon : noms explicites français
$dateCreationCommande = new DateTime();
$utilisateurConnecte = $depotUtilisateurs->trouverParId($identifiant);
$montantTotalCalcule = $this->calculerMontantTotal($donneesCommande);
```

#### Commentaires Explicatifs "Pourquoi"
```php
/**
 * Applique la stratégie gloutonne optimisée pour minimiser le nombre de pièces physiques
 * 
 * Utilise une métaheuristique multi-stratégies car l'algorithme glouton standard
 * peut donner des résultats sous-optimaux pour certaines combinaisons D&D.
 * 
 * @param int $montantCuivre Montant total en pièces de cuivre
 * @param array $denominationsDisponibles Dénominations possibles triées
 * @return array Répartition optimale minimisant le nombre de pièces
 */
private function appliquerStrategieGloutonne(int $montantCuivre, array $denominationsDisponibles): array
{
    // Teste 3 stratégies différentes pour trouver l'optimum global
    $strategies = [
        $this->strategieStandardGloutonne($montantCuivre, $denominationsDisponibles),
        $this->strategieEviterGrosMultiplicateurs($montantCuivre, $denominationsDisponibles),
        $this->strategieUneSeulePieceParMetal($montantCuivre, $denominationsDisponibles)
    ];
    
    return $this->selectionnerStrategieOptimale($strategies);
}
```

#### Structure de Classes Cohérente
```php
namespace GeeknDragon\Boutique;

/**
 * Optimisateur de lots de pièces pour recommandations d'achat
 */
final class OptimisateurLotsPieces
{
    // 1. Constantes
    private const SEUIL_CACHE_INVALIDE = 3600; // 1 heure
    
    // 2. Propriétés privées
    private readonly AnalyseurProduits $analyseurProduits;
    private readonly CacheIntelligent $cache;
    private array $produitsDisponibles = [];
    
    // 3. Constructeur avec injection
    public function __construct(
        AnalyseurProduits $analyseurProduits,
        CacheIntelligent $cache
    ) {
        $this->analyseurProduits = $analyseurProduits;
        $this->cache = $cache;
    }
    
    // 4. Méthodes publiques
    public function obtenirRecommandationsOptimales(array $besoins): array
    {
        // Logique principale
    }
    
    // 5. Méthodes privées
    private function calculerCombinaisonOptimale(array $besoins): array
    {
        // Logique interne
    }
}
```

### ⚙️ DIRECTIVE BUILD AUTOMATIQUE OBLIGATOIRE

#### Règle d'Or du Build
```bash
# APRÈS TOUTE MODIFICATION, LANCER LE BUILD OBLIGATOIREMENT
npm run build:complete

# Vérification que tous les fichiers sont générés
npm run validate
```

#### Workflow de Développement Obligatoire
1. **Modifier fichiers source** (`css/styles.css`, `js/app.js`)
2. **Tester localement** la fonctionnalité
3. **Lancer build automatique** : `npm run build:complete`
4. **Vérifier génération** des fichiers `.min.` et `.gz`
5. **Commiter avec build** : sources ET fichiers générés
6. **Déployer** avec versions optimisées

#### Scripts de Build Disponibles
```json
{
  "scripts": {
    "build:complete": "node scripts/build-simple.cjs",
    "build:css": "npm run build && node scripts/build-complete.js --css-only",
    "build:js": "node scripts/build-complete.js --js-only",
    "production:build": "npm run build:complete",
    "validate": "node scripts/validate-optimization.js"
  }
}
```

#### Contrôle Qualité Pre-Commit
```bash
# Vérification avant commit
npm run lint          # ESLint + corrections
npm run lint:ts        # TypeScript check
npm run build:complete # Build complet
npm run validate       # Validation optimisations
```

**⚠️ AUCUNE MODIFICATION NE DOIT ÊTRE COMMITÉE SANS BUILD AUTOMATIQUE PRÉALABLE**

### 📝 Standards de Documentation - Docstrings Français

#### PHP DocBlocks - Français Complet
```php
/**
 * Convertit un montant en cuivre vers la répartition optimale de pièces D&D
 *
 * Cette méthode utilise une métaheuristique multi-stratégies pour minimiser
 * le nombre total de pièces physiques nécessaires, en tenant compte des
 * multiplicateurs disponibles et des contraintes d'optimisation coût/quantité.
 *
 * @param int $montantCuivre Montant total en pièces de cuivre à convertir
 * @param array<int> $multiplicateursDisponibles Liste des multiplicateurs physiques disponibles [1, 10, 100, 1000, 10000]
 * @param bool $optimiserCout Si true, privilégie le coût minimal, sinon privilégie le nombre minimal de pièces
 * @return array<string,int> Répartition optimale sous forme ['metal_multiplicateur' => quantite]
 * @throws InvalidArgumentException Si le montant est négatif ou si les multiplicateurs sont vides
 * @throws RuntimeException Si l'algorithme ne converge pas dans le délai imparti
 *
 * @example
 * $convertisseur = new ConvertisseurMonnaie();
 * $resultat = $convertisseur->convertirMontant(1661, [1, 10, 100, 1000, 10000]);
 * // Retourne: ['platinum_1' => 1, 'gold_100' => 6, 'electrum_10' => 1, 'electrum_1' => 1, 'silver_1' => 1, 'copper_1' => 1]
 *
 * @see OptimisateurLotsPieces::obtenirRecommandationsOptimales() Pour les recommandations de lots
 * @since 2.1.0 Ajout du paramètre $optimiserCout
 * @author Brujah - Geek & Dragon
 */
public function convertirMontant(int $montantCuivre, array $multiplicateursDisponibles, bool $optimiserCout = false): array
{
    // Implémentation...
}

/**
 * Valide les données d'entrée pour éviter les injections et erreurs de type
 *
 * @param mixed $valeur Valeur à valider
 * @param string $type Type attendu ('int', 'string', 'email', 'url')
 * @param array<string,mixed> $options Options de validation spécifiques
 * @return mixed Valeur validée et nettoyée
 * @throws ValidationException Si la validation échoue
 *
 * @example
 * $email = $this->validerEntree($_POST['email'], 'email');
 * $prix = $this->validerEntree($_GET['prix'], 'int', ['min' => 0, 'max' => 999999]);
 */
private function validerEntree(mixed $valeur, string $type, array $options = []): mixed
{
    // Logique de validation...
}
```

#### JavaScript JSDoc - Français Complet
```javascript
/**
 * Classe principale de conversion de monnaie D&D avec optimisation métaheuristique
 *
 * Gère la conversion temps réel entre les différentes dénominations de pièces D&D
 * en utilisant des algorithmes d'optimisation pour minimiser le nombre de pièces
 * physiques nécessaires tout en respectant les contraintes de multiplicateurs.
 *
 * @class ConvertisseurMonnaie
 * @version 3.2.1
 * @author Brujah - Geek & Dragon
 * @since 1.0.0
 *
 * @example
 * const convertisseur = new ConvertisseurMonnaie({
 *   devises: ['copper', 'silver', 'electrum', 'gold', 'platinum'],
 *   multiplicateurs: [1, 10, 100, 1000, 10000],
 *   strategie: 'optimal_pieces'
 * });
 *
 * const resultat = convertisseur.convertir(1661);
 * console.log(resultat); // {copper_1: 1, silver_1: 1, electrum_1: 1, ...}
 */
class ConvertisseurMonnaie {
    /**
     * Initialise le convertisseur avec les paramètres de configuration
     *
     * @param {Object} configuration - Configuration du convertisseur
     * @param {string[]} configuration.devises - Liste des devises supportées
     * @param {number[]} configuration.multiplicateurs - Multiplicateurs physiques disponibles
     * @param {string} [configuration.strategie='optimal_pieces'] - Stratégie d'optimisation
     * @param {boolean} [configuration.debug=false] - Mode debug pour développement
     * @throws {TypeError} Si la configuration est invalide
     * @throws {RangeError} Si les multiplicateurs contiennent des valeurs négatives
     *
     * @example
     * const config = {
     *   devises: ['copper', 'silver', 'gold'],
     *   multiplicateurs: [1, 10, 100],
     *   strategie: 'minimal_cost'
     * };
     * const convertisseur = new ConvertisseurMonnaie(config);
     */
    constructor(configuration) {
        // Initialisation...
    }

    /**
     * Convertit un montant en cuivre vers la répartition optimale
     *
     * Utilise une métaheuristique avec 3 stratégies gloutonnes différentes
     * pour trouver la solution qui minimise le nombre total de pièces physiques.
     * Le temps de calcul est garanti inférieur à 100ms avec timeout de sécurité.
     *
     * @param {number} montantCuivre - Montant en pièces de cuivre (entier positif)
     * @param {Object} [options={}] - Options de conversion
     * @param {boolean} [options.inclureAnimation=true] - Afficher l'animation boulier
     * @param {Function} [options.onProgress=null] - Callback de progression (percent: number) => void
     * @param {string} [options.strategie='auto'] - Stratégie spécifique ou 'auto' pour métaheuristique
     * @returns {Promise<Object>} Promesse résolue avec la répartition optimale
     * @returns {Object} resultat - Objet de répartition
     * @returns {Object.<string,number>} resultat.pieces - Répartition par 'metal_multiplicateur'
     * @returns {number} resultat.totalPieces - Nombre total de pièces physiques
     * @returns {number} resultat.tempsCalculMs - Temps de calcul en millisecondes
     * @returns {string} resultat.strategieUtilisee - Stratégie qui a donné le meilleur résultat
     *
     * @throws {TypeError} Si le montant n'est pas un nombre
     * @throws {RangeError} Si le montant est négatif ou supérieur à Number.MAX_SAFE_INTEGER
     * @throws {TimeoutError} Si le calcul dépasse 100ms (très rare)
     *
     * @example
     * // Conversion simple
     * const resultat = await convertisseur.convertir(1661);
     * console.log(`${resultat.totalPieces} pièces au total`);
     * 
     * // Conversion avec options
     * const resultat = await convertisseur.convertir(1661, {
     *   inclureAnimation: false,
     *   onProgress: (percent) => console.log(`${percent}% terminé`),
     *   strategie: 'prefer_single_metal'
     * });
     *
     * @see {@link #calculerCoutOptimal} Pour optimisation par coût plutôt que quantité
     * @see {@link https://docs.geekndragon.com/api/convertisseur} Documentation complète
     * @since 2.0.0 Ajout du support métaheuristique
     * @since 3.0.0 Conversion en méthode async pour animations
     */
    async convertir(montantCuivre, options = {}) {
        // Logique de conversion...
    }

    /**
     * Callback appelé lors de changements dans la conversion
     *
     * @callback CallbackChangement
     * @param {Object} donnees - Données de changement
     * @param {Object.<string,number>} donnees.nouvellePieRepartition - Nouvelle répartition
     * @param {number} donnees.montantTotal - Montant total en cuivre
     * @param {boolean} donnees.conversionEnCours - Si une conversion est en cours
     */

    /**
     * Enregistre un callback pour être notifié des changements
     *
     * @param {CallbackChangement} callback - Fonction à appeler lors des changements
     * @throws {TypeError} Si le callback n'est pas une fonction
     *
     * @example
     * convertisseur.surChangement((donnees) => {
     *   console.log('Nouvelle répartition:', donnees.nouvellePieRepartition);
     *   mettreAJourInterface(donnees);
     * });
     */
    surChangement(callback) {
        // Gestion des callbacks...
    }
}
```

#### Standards de Documentation Obligatoires

##### 🇫🇷 Langue et Terminologie
- **Descriptions complètes en français** : Tous les docstrings, commentaires et noms explicites
- **Terminologie métier D&D** : Utiliser le vocabulaire spécifique (pièces, dénominations, multiplicateurs)
- **Exemples concrets** : Montants réels D&D (1661 cuivres, etc.) dans les exemples
- **Pas de franglais** : Éviter les mélanges français/anglais

##### 📋 Contenu Obligatoire
- **Description fonctionnelle** : Que fait la méthode et pourquoi (business logic)
- **Tous les paramètres** : Type, description, contraintes, valeurs par défaut
- **Valeur de retour** : Type exact, structure, cas particuliers
- **Exceptions possibles** : Conditions de déclenchement et gestion
- **Exemples d'usage** : Au moins un exemple concret d'utilisation

##### 🔗 Références et Liens
- **@see** : Liens vers méthodes/classes liées
- **@since** : Version d'introduction ou modifications majeures
- **@deprecated** : Si méthode obsolète avec alternative
- **@author** : Responsable principal (Brujah - Geek & Dragon)

##### ⚡ Performance et Complexité
- **Contraintes temporelles** : Mentionner les timeouts et garanties de performance
- **Complexité algorithmique** : O(n) pour les algorithmes complexes
- **Usage mémoire** : Pour les méthodes manipulant de gros volumes
- **Optimisations** : Cache, lazy loading, débouncing mentionnés

##### 🧪 Testabilité
```php
/**
 * @testWith [1661, [1, 10, 100], ["platinum_1" => 1, "gold_100" => 6]]
 *           [50, [1, 10], ["electrum_1" => 1]]
 *           [0, [1], []]
 */
public function testConvertirMontant(int $montant, array $multiplicateurs, array $attendu): void
{
    // Test...
}
```

##### 📊 Métriques de Qualité
- **Couverture documentation** : 100% des méthodes publiques documentées
- **Exemples fonctionnels** : Tous les exemples doivent être exécutables
- **Cohérence terminologique** : Même vocabulaire dans tout le projet
- **Mise à jour obligatoire** : Documentation mise à jour avec chaque modification

---

**Note** : Ce site nécessite une compréhension profonde de l'écosystème D&D ET des enjeux e-commerce premium. L'objectif est de transformer la passion pour le JDR en expérience d'achat fluide et mémorable.