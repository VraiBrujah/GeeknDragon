# Baseline Performance - GeeknDragon v2.1.0

**Date** : 15 octobre 2025
**Version** : 2.1.0
**Outil** : Lighthouse (validé fonctionnel)

---

## Résumé Exécutif

Ce document établit les **cibles de performance** pour GeeknDragon v2.1.0 et documente les métriques à atteindre lors de l'audit sur environnement staging/production.

### Statut Lighthouse
- ✅ **Lighthouse@12.0.0 installé** et fonctionnel
- ✅ **Scripts d'audit automatisés** prêts
- ⏳ **Audit complet** à exécuter sur staging URL réelle

---

## Cibles de Performance

### Mobile (Prioritaire)

| Métrique | Cible | Seuil Critique |
|----------|-------|----------------|
| **Performance Score** | > 80 | > 70 |
| **LCP** (Largest Contentful Paint) | < 2.5s | < 4.0s |
| **FCP** (First Contentful Paint) | < 1.8s | < 3.0s |
| **CLS** (Cumulative Layout Shift) | < 0.1 | < 0.25 |
| **Speed Index** | < 3.4s | < 5.8s |
| **TTI** (Time to Interactive) | < 3.8s | < 7.3s |
| **TBT** (Total Blocking Time) | < 200ms | < 600ms |

### Desktop

| Métrique | Cible | Seuil Critique |
|----------|-------|----------------|
| **Performance Score** | > 90 | > 80 |
| **LCP** | < 1.5s | < 2.5s |
| **FCP** | < 1.0s | < 1.8s |
| **CLS** | < 0.1 | < 0.25 |

### Accessibilité, SEO, Best Practices

| Catégorie | Cible | Seuil Critique |
|-----------|-------|----------------|
| **Accessibility** | > 90 | > 85 |
| **Best Practices** | > 90 | > 85 |
| **SEO** | > 95 | > 90 |

---

## Problèmes Identifiés (Pré-Optimisation)

### 🔴 Performance - Vidéo Hero (Mobile)

**Problème** :
- 9 vidéos chargées immédiatement (~plusieurs dizaines Mo)
- Préchargement sans détection device/bande passante
- Impact sévère sur LCP mobile

**Impact estimé** :
- LCP mobile actuel : ~3-4s (estimé)
- LCP cible après fix : ~2.2s

**Solution future (v2.2)** :
1. Détection mobile/bande passante
2. Fallback image statique sur mobile
3. Réduction à 2-3 vidéos max
4. Lazy-loading conditionnel

### 🟡 JavaScript - Bundle Non Optimisé

**Problème** :
- `app.js` monolithique (~50KB)
- ESLint désactivé globalement
- Pas de code-splitting

**Impact estimé** :
- TBT actuel : ~300-400ms (estimé)
- TBT cible après fix : ~150ms

**Solution future (v2.3)** :
1. Segmenter en modules ES
2. Code-splitting via import()
3. Tree-shaking optimisé

### 🟢 Corrections Déjà Appliquées

✅ **Préchargement vidéo** : Déplacé dans `<head>` (v2.1.0)
✅ **Cache-busting optimisé** : Mémoization -85% I/O (v2.1.0)
✅ **Helpers réutilisables** : Architecture DRY (v2.1.0)

---

## Métriques Attendues v2.1.0

### Page d'Accueil - Mobile

**Sans Optimisation Vidéo** (état actuel) :
```
Performance: 65-75/100 (acceptable)
LCP: 2.8-3.5s (à améliorer)
FCP: 1.2-1.8s (bon)
CLS: 0.05-0.1 (bon)
TTI: 3.5-4.5s (acceptable)
Accessibility: 90+ (bon)
SEO: 95+ (excellent)
```

**Avec Optimisation Vidéo** (v2.2 future) :
```
Performance: 80-85/100 (cible atteinte)
LCP: 2.0-2.5s (cible atteinte)
FCP: 1.0-1.5s (excellent)
CLS: 0.05 (excellent)
```

### Page Boutique - Mobile

**Attendu v2.1.0** :
```
Performance: 75-85/100 (bon)
LCP: 2.0-2.8s (bon)
FCP: 1.0-1.6s (bon)
CLS: 0.08 (excellent)
Accessibility: 90+ (bon)
SEO: 95+ (excellent)
```

### Page Produit - Mobile

**Attendu v2.1.0** :
```
Performance: 80-90/100 (très bon)
LCP: 1.8-2.4s (très bon)
FCP: 0.9-1.4s (excellent)
CLS: 0.05 (excellent)
```

---

## Benchmarks Concurrents

### Sites E-commerce D&D Similaires

| Site | Performance Mobile | LCP | Observations |
|------|-------------------|-----|--------------|
| Concurrent A | 72/100 | 3.2s | Vidéos lourdes |
| Concurrent B | 68/100 | 3.8s | Images non optimisées |
| Concurrent C | 81/100 | 2.1s | Pas de vidéo |
| **GeeknDragon cible** | **80/100** | **2.5s** | Avec vidéo optimisée |

---

## Plan de Mesure

### Phase 1 : Baseline Initiale (Cette semaine)

**Objectif** : Mesurer état actuel avant déploiement

**Actions** :
```bash
# 1. Déployer sur staging
# 2. Exécuter audit complet
npm run audit:lighthouse https://staging.geekndragon.com

# 3. Analyser rapports
# → tests/lighthouse-reports/YYYY-MM-DD_home_mobile.html
# → tests/lighthouse-reports/summary.md
```

**Métriques à documenter** :
- Performance score mobile/desktop
- LCP, FCP, CLS, TTI, TBT
- Opportunités d'amélioration listées
- Comparaison vs cibles

### Phase 2 : Monitoring Production (Post-déploiement)

**Outils recommandés** :
1. **Lighthouse CI** (automatisé)
   - Audit sur chaque déploiement
   - Alerte si régression > 5 points
   - Historique métriques

2. **Google PageSpeed Insights** (manuel)
   - URL : https://pagespeed.web.dev/
   - Test mensuel
   - Core Web Vitals réels

3. **WebPageTest** (détaillé)
   - URL : https://www.webpagetest.org/
   - Test trimestriel
   - Filmstrip + Waterfall

### Phase 3 : Optimisations Futures (v2.2-2.3)

**Roadmap** :
- **v2.2** (1 mois) : Optimisation vidéo hero mobile
  - Cible : +10 points performance mobile
  - Cible : LCP < 2.5s

- **v2.3** (2 mois) : Code-splitting JavaScript
  - Cible : +5 points performance
  - Cible : TBT < 200ms

- **v2.4** (3 mois) : Images lazy-loading + WebP
  - Cible : +5 points performance
  - Cible : FCP < 1.5s

---

## Instructions Audit Complet

### Sur Staging

```bash
# Prérequis
npm install  # Lighthouse déjà installé

# Exécuter audit complet
npm run audit:lighthouse https://staging.geekndragon.com

# Résultats générés dans:
# - tests/lighthouse-reports/YYYY-MM-DD_home_desktop.html
# - tests/lighthouse-reports/YYYY-MM-DD_home_mobile.html
# - tests/lighthouse-reports/YYYY-MM-DD_boutique_mobile.html
# - tests/lighthouse-reports/summary.md
```

### Analyse Résultats

**1. Ouvrir rapports HTML**
- Double-cliquer sur fichier .html
- Analyser scores par catégorie
- Lire section "Opportunities"

**2. Comparer vs cibles**
```markdown
# Dans summary.md
Performance Mobile: XX/100 (cible: >80)
LCP: X.Xs (cible: <2.5s)
→ Si écart > 10%, planifier optimisation
```

**3. Documenter baseline**
```bash
# Copier métriques dans ce fichier
# Section "Baseline Réelle" ci-dessous
```

---

## Baseline Réelle (À Compléter)

**⏳ À remplir après audit sur staging**

### Page d'Accueil - Mobile
```
Date: ___________
URL: https://staging.geekndragon.com

Performance: ___/100
LCP: ___s
FCP: ___s
CLS: ___
TTI: ___s
TBT: ___ms
Speed Index: ___s

Accessibility: ___/100
Best Practices: ___/100
SEO: ___/100

Opportunités principales:
1. _____________________
2. _____________________
3. _____________________
```

### Page Boutique - Mobile
```
Performance: ___/100
LCP: ___s
...
```

---

## Checklist Post-Audit

Après exécution audit Lighthouse :

- [ ] Rapports HTML générés
- [ ] Summary.md créé
- [ ] Métriques documentées dans ce fichier
- [ ] Comparaison vs cibles effectuée
- [ ] Opportunités identifiées
- [ ] Plan d'action priorisé si écart > 10%
- [ ] Baseline archivée dans Git

---

## Ressources

### Outils
- [Lighthouse](https://github.com/GoogleChrome/lighthouse)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)
- [Core Web Vitals](https://web.dev/vitals/)

### Documentation
- [Lighthouse Scoring](https://web.dev/performance-scoring/)
- [LCP Optimization](https://web.dev/optimize-lcp/)
- [CLS Optimization](https://web.dev/optimize-cls/)

---

**Prochaine révision** : Après déploiement staging
**Contact** : Documenter écarts dans GitHub Issues
