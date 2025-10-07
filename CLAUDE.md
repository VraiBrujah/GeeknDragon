---
project_type: ecommerce
project_name: Geek & Dragon
version: 2.0.0
modules_required:
  - CLAUDE-ECOMMERCE.md
tools_priority:
  - Grep  # Recherche produits/code
  - Read  # Lecture fichiers
  - Bash  # Build automatique npm
build_mandatory: true
build_command: "npm run build:complete"
---

# MÉMOIRE PROJET - Geek & Dragon

<system-reminder>
Projet actif: Geek & Dragon (E-commerce D&D)
Module chargé: CLAUDE-ECOMMERCE.md
Spécificités: Snipcart, convertisseur D&D, optimiseur lots
Build obligatoire: npm run build:complete après modifs CSS/JS
</system-reminder>

---

## 🏢 Contexte Spécifique

**Geek & Dragon** est un site e-commerce spécialisé dans les **accessoires immersifs pour jeux de rôle (D&D)**, développé par Brujah au Québec. Le site propose des **produits physiques** qui enrichissent l'expérience de jeu : pièces métalliques gravées, cartes d'équipement illustrées, et fiches de personnage triptyques robustes.

**Répertoire de Travail** : `E:\GitHub\GeeknDragon`

---

## 🛍️ SPÉCIFICITÉS E-COMMERCE GEEK & DRAGON

### Plateforme & Intégration
- **Panier** : Snipcart (hébergé, intégration complète)
- **Paiements** : Stripe via Snipcart
- **Langues** : Français (principal) + Anglais
- **Marché** : Québec/Canada principalement, international secondaire

### Produits Uniques

#### 1. Pièces Métalliques D&D Personnalisables
- **Métaux** : Cuivre, Argent, Électrum, Or, Platine
- **Multiplicateurs** : 1x, 10x, 100x, 1000x, 10000x
- **Variantes Snipcart** : `data-item-custom1-name="Métal"`, `data-item-custom2-name="Multiplicateur"`
- **Product IDs** : Format `coin_metal_multiplier` (ex: `coin_platinum_1000`)

#### 2. Cartes d'Équipement Illustrées
- **Quantité** : 560 cartes
- **Usage** : Remplacer lecture manuels pendant parties
- **Packaging** : Boîtes thématiques

#### 3. Fiches de Personnage Triptyques
- **Format** : 3 volets dépliants
- **Matériau** : Carton robuste, résistant usage intensif
- **Usage** : Éviter feuilles volantes froissées

### 🎲 Système Monétaire D&D (Règles du Jeu)

```javascript
const rates = {
  copper: 1,      // Pièce de cuivre (base de calcul)
  silver: 10,     // 1 argent = 10 cuivres
  electrum: 50,   // 1 électrum = 50 cuivres
  gold: 100,      // 1 or = 100 cuivres
  platinum: 1000  // 1 platine = 1000 cuivres
};

const multipliers = [1, 10, 100, 1000, 10000]; // Multiplicateurs physiques disponibles
```

---

## 🧮 FONCTIONNALITÉS SPÉCIFIQUES

### Convertisseur de Monnaie D&D Avancé (`js/currency-converter.js`)
- **Algorithme** : Métaheuristique multi-stratégies (3 stratégies gloutonnes)
- **Objectif** : Minimiser nombre total de pièces physiques
- **Performance** : <100ms garanti, timeout sécurité
- **Animation** : Boulier multilingue avec feedback visuel
- **Cas test critique** : 1661 cuivres (validation optimalité)
- **Responsabilité** : **Conversion pure uniquement** (pas de recommandations produits)

### Optimiseur de Lots (`js/coin-lot-optimizer.js`)
- **Algorithme** : Sac à dos (knapsack) pour optimisation coût
- **Source données** : Parsing dynamique `data/products.json`
- **Détection produits** : Par `productId` (ex: `coin`, `coin-trio`, `coin-septuple`, `coin-quintessence`)
- **Expansion variations** : 25 variations pour pièces/trio/septuple, 5 pour quintessence
- **Règles** : Surplus autorisé, déficit **interdit**
- **Responsabilité** : **Recommandations de lots optimaux uniquement**

### Utilitaires Snipcart Réutilisables (`js/snipcart-utils.js`)
- **Ajout panier cohérent** : Même logique boutique + aide-jeux
- **Génération attributs** : Automatique selon type produit
- **Champs personnalisés** : Support complet (métal, multiplicateur)
- **Traductions** : Gestion multilingue automatique
- **Ajout multiple** : Panier groupé avec feedback utilisateur

---

## 🎨 DESIGN & BRANDING

### Palette Couleurs
```css
--couleur-primaire: #8B0000;        /* Rouge grenat (accent D&D) */
--couleur-secondaire: #DAA520;      /* Or (trésor) */
--couleur-accent: #CD853F;          /* Bronze (métallique) */
```

### Typographie
```css
--police-principale: 'Cinzel', serif;      /* Titres immersifs */
--police-texte: 'Open Sans', sans-serif;   /* Lecture confortable */
```

### Ton de Marque

#### ✅ Formulations Attendues
- "Ressentez le poids réel du butin qui glisse entre vos doigts"
- "Fini les combats contre les feuilles de personnage froissées"
- "560 cartes pour ne plus jamais ouvrir un manuel en pleine aventure"
- "Touchez votre aventure"

#### ❌ Formulations à Éviter
- "Notre produit offre une fonctionnalité de simulation haptique"
- "Interface utilisateur optimisée"
- "Solution innovante de gestion"
- Jargon technique exposé aux clients

**Principe** : Immersif mais accessible, authentique pour passionnés, clair pour néophytes

---

## 🧪 TESTS SPÉCIFIQUES GEEK & DRAGON

### Tests Obligatoires Convertisseur
- ✅ **Cas critique 1661 cuivres** : Validation optimalité (4 pièces minimum)
- ✅ **Tous métaux/multiplicateurs** : Couverture complète
- ✅ **Performance <100ms** : Aucune boucle infinie
- ✅ **Cohérence multiples stratégies** : Métaheuristique convergente

### Tests Obligatoires Optimiseur
- ✅ **Parsing products.json** : Toutes variations détectées correctement
- ✅ **Coût minimal garanti** : Pas de solution sous-optimale
- ✅ **Couverture exacte** : Aucun déficit, surplus acceptable
- ✅ **Support tous types** : Pièces simples + lots (trio/septuple/quintessence)

### Tests E2E Parcours Client
```javascript
// Exemple test critique Playwright
test('Parcours achat convertisseur → lots optimaux', async ({page}) => {
  // 1. Accéder convertisseur
  await page.goto('/aide-jeux');

  // 2. Saisir montant test
  await page.fill('#copper-input', '1661');

  // 3. Vérifier calcul optimal
  const result = await page.locator('.conversion-result');
  await expect(result).toContainText('4 pièces'); // Minimum garanti

  // 4. Recommandations de lots
  await page.click('[data-action="show-recommendations"]');
  await expect(page.locator('.lot-recommendations')).toBeVisible();

  // 5. Ajout panier groupé
  await page.click('[data-action="add-optimal-lots"]');
  await expect(page.locator('.snipcart-cart-header__count')).toHaveText('2'); // Quintessence + pièce électrum
});
```

### Performance Attendue
- **Lighthouse Score** : >90 (Performance + SEO + Accessibility)
- **First Contentful Paint** : <1.5s
- **Convertisseur** : <100ms (garanti)
- **Optimiseur** : <500ms (cas complexes)
- **Chargement page produit** : <2s

---

## 🏭 BUILD AUTOMATIQUE OBLIGATOIRE

### Workflow Strict
```bash
# Après TOUTE modification CSS/JS
npm run build:complete

# Vérification génération
npm run validate

# Lint avant commit
npm run lint
```

**⚠️ INTERDICTION** de commiter sans build préalable

### Fichiers Générés Automatiquement
- `css/styles.min.css` + `.gz`
- `css/vendor.bundle.min.css` + `.gz`
- `js/app.min.js` + `.gz`
- `js/app.bundle.min.js` + `.gz`
- `js/vendor.bundle.min.js` + `.gz`
- Tous les fichiers JS critiques minifiés individuellement

---

## 📋 CHECKLIST PRÉ-DÉPLOIEMENT

### Tests Fonctionnels
- [ ] Convertisseur : Tous cas incluant 1661 cuivres
- [ ] Recommandations lots : Avec vrais produits `products.json`
- [ ] Stock Snipcart synchronisé
- [ ] Ajout panier : Variations correctes (métal/multiplicateur)
- [ ] Traductions FR/EN cohérentes
- [ ] Responsive mobile (iOS Safari + Android Chrome)

### Performance & SEO
- [ ] Lighthouse >90 toutes catégories
- [ ] Images WebP avec fallbacks
- [ ] Lazy loading actif
- [ ] Meta tags complets (Schema.org Product)
- [ ] Sitemap généré
- [ ] Accessibilité WCAG 2.1 AA

### Build & Qualité
- [ ] `npm run build:complete` exécuté
- [ ] Aucun warning ESLint critique
- [ ] Fichiers `.min.js` et `.gz` générés
- [ ] Bundles optimisés (<150KB gzip total)

---

## 🎯 OBJECTIFS BUSINESS

### Conversion
- Taux conversion boutique > 2%
- Taux abandon panier < 70%
- Utilisation convertisseur → achat > 15%

### Expérience
- Immersion dès homepage (feedback "ça donne envie")
- Convertisseur perçu comme outil utile (pas gadget)
- Processus achat simple malgré personnalisation

### Technique
- Uptime > 99.5%
- Performance stable (pas de régression)
- Maintenance simplifiée (code modulaire réutilisable)
