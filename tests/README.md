# Tests Automatisés - Geek & Dragon

Documentation complète de la suite de tests pour validation qualité du code.

**Auteur** : Brujah  
**Version** : 1.0.0  
**Dernière mise à jour** : 2025-10-15

---

## 📋 Vue d'ensemble

Cette suite de tests valide les 3 modules JavaScript critiques du projet :
1. **currency-converter.js** - Convertisseur monnaie D&D (métaheuristique)
2. **coin-lot-optimizer.js** - Optimiseur lots (algorithme sac à dos)
3. **snipcart-utils.js** - Utilitaires panier e-commerce

---

## 🚀 Exécution des tests

### Tests unitaires (Jest)

```bash
# Lancer tous les tests
npm test

# Mode watch (relance automatique)
npm run test:watch

# Avec couverture de code
npm run test:coverage
```

### Objectifs de couverture

| Catégorie | Seuil minimum | Statut |
|-----------|---------------|--------|
| Branches | 60% | ✅ Configuré |
| Functions | 60% | ✅ Configuré |
| Lines | 60% | ✅ Configuré |
| Statements | 60% | ✅ Configuré |

---

## 📂 Structure des tests

```
tests/
├── unit/
│   ├── currency-converter.test.js    # 25+ tests convertisseur
│   ├── coin-lot-optimizer.test.js     # 15+ tests optimiseur
│   └── snipcart-utils.test.js         # 10+ tests Snipcart
├── e2e/                                # Tests end-to-end (à venir)
├── fixtures/                           # Données de test
├── setup.js                            # Configuration globale Jest
└── README.md                           # Ce fichier
```

---

## ✅ Tests critiques implémentés

### 1. Currency Converter (Convertisseur)

#### Cas critique ADR-008 : 1661 cuivres
```javascript
test('doit minimiser le nombre de pièces pour 1661 cuivres', () => {
  const result = converter.optimize(1661);
  const totalCoins = Object.values(result.coins)
    .reduce((sum, qty) => sum + qty, 0);
  
  // Solution optimale : 4 pièces minimum
  expect(totalCoins).toBeLessThanOrEqual(4);
});
```

**Validation** :
- ✅ Nombre de pièces minimal (≤4)
- ✅ Total exact = 1661 cuivres
- ✅ Temps exécution <100ms

#### Autres tests convertisseur
- Taux D&D standards (copper:1, platinum:1000)
- Tous métaux × tous multiplicateurs (25 combinaisons)
- Performance 100 conversions <1s
- Cas limites (zéro, négatif, 1 million)

---

### 2. Coin Lot Optimizer (Optimiseur)

#### Génération variations produits
```javascript
test('doit générer 25 variations pour coin-custom-single', () => {
  const variations = optimizer.generateAllProductVariations();
  const customCoins = variations.filter(v => 
    v.productId === 'coin-custom-single'
  );
  
  // 5 métaux × 5 multiplicateurs = 25
  expect(customCoins.length).toBe(25);
});
```

**Validation** :
- ✅ 25 variations pièces personnalisées
- ✅ 5 variations Quintessence Métallique
- ✅ Parsing dynamique products.json
- ✅ Prix et capacités cohérents

#### Tests optimisation
- Solution minimum coût pour besoins simples
- Interdiction déficit (couverture 100%)
- Autorisation surplus
- Performance <500ms

---

### 3. Snipcart Utils (Utilitaires Panier)

#### Création boutons Snipcart
```javascript
test('doit créer bouton avec champs personnalisés', () => {
  const button = SnipcartUtils.createAddToCartButton(
    productData,
    { customFields: { metal: 'gold', multiplier: '100' } }
  );
  
  expect(button.getAttribute('data-item-custom1-value'))
    .toBe('gold');
});
```

**Validation** :
- ✅ Attributs Snipcart corrects
- ✅ Champs personnalisés (métal, mult.)
- ✅ Support multilingue FR/EN
- ✅ Normalisation formats

---

## 🎯 Résultats attendus

### Exécution complète
```bash
$ npm test

PASS  tests/unit/currency-converter.test.js
  ✓ Cas critique 1661 cuivres (15ms)
  ✓ Performance <100ms (45ms)
  ✓ Tous métaux et multiplicateurs (78ms)

PASS  tests/unit/coin-lot-optimizer.test.js
  ✓ Génération 25 variations pièces (12ms)
  ✓ Optimisation besoins simples (95ms)
  ✓ Performance <500ms (230ms)

PASS  tests/unit/snipcart-utils.test.js
  ✓ Création boutons Snipcart (8ms)
  ✓ Normalisation champs custom (5ms)
  ✓ Traduction métaux FR/EN (3ms)

Tests:       50+ passed
Time:        2.5s
Coverage:    65% (branches), 70% (functions)
```

---

## 🐛 Debugging

### Tests qui échouent

```bash
# Lancer un seul fichier
npm test currency-converter.test.js

# Mode verbose
npm test -- --verbose

# Afficher tous les logs
npm test -- --silent=false
```

### Coverage insuffisante

```bash
# Générer rapport HTML détaillé
npm run test:coverage

# Ouvrir dans le navigateur
start coverage/lcov-report/index.html
```

---

## 📊 Métriques de qualité

### Performance tests
- **Temps total suite** : <5s
- **Tests individuels** : <100ms (convertisseur), <500ms (optimiseur)
- **Couverture cible** : 60% minimum, 80% idéal

### Maintenabilité
- **Tests par module** : 10-25 tests
- **Assertions par test** : 1-5 assertions
- **Documentation** : JSDoc complet

---

## 🔮 Prochaines étapes

### Tests E2E Playwright (à implémenter)

```javascript
// tests/e2e/parcours-achat.spec.js
test('Parcours complet convertisseur → panier', async ({page}) => {
  await page.goto('/aide-jeux');
  await page.fill('#copper-input', '1661');
  await page.click('[data-action="convert"]');
  
  await expect(page.locator('.result'))
    .toContainText('4 pièces');
  
  await page.click('[data-action="add-optimal-lots"]');
  await expect(page.locator('.snipcart-cart-count'))
    .toHaveText('2');
});
```

### CI/CD GitHub Actions

```yaml
# .github/workflows/tests.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

---

## 📚 Références

- **ADR-002** : Métaheuristique convertisseur
- **ADR-003** : Algorithme sac à dos optimiseur
- **ADR-008** : Test critique 1661 cuivres

---

**Développé avec rigueur par Brujah**  
*Pour un code robuste et maintenable* ✨
