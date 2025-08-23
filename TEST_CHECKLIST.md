# ✅ CHECKLIST DE TEST - GEEKNDRAGON OPTIMISÉ

## 🔍 **Tests Fonctionnels Prioritaires**

### **1. Homepage - Éléments Marketing**
- [ ] Nouveau headline "Transformez vos parties D&D avec des trésors réels" affiché
- [ ] Badge Quebec premium visible et stylé
- [ ] Trust signals dynamiques qui s'animent
- [ ] Widgets de confiance (compteur visiteurs, commandes récentes)
- [ ] Calculateur ROI visible et fonctionnel

### **2. Boutique - Expérience Produits**
- [ ] Nouveau headline "Des trésors qui changent VRAIMENT vos parties"
- [ ] CTAs "Débloquer l'immersion" sur tous les produits
- [ ] Recommandations IA s'affichent contextuellement
- [ ] Hover effects "trésor découvert" sur les cartes produits
- [ ] Audio feedback (cling) lors des interactions

### **3. Chatbot JDR Intelligent**
- [ ] Icône flottante D20 animée visible (coin droit)
- [ ] Chat s'ouvre avec message de bienvenue + quick options
- [ ] Questions produits → recommandations personnalisées
- [ ] Profilage automatique (débutant/MJ/expert)
- [ ] Indicateur de frappe + réponses contextuelles
- [ ] Fermeture chat préserve l'état de la conversation

### **4. Galerie d'Utilisation JDR**
- [ ] Section galerie s'injecte automatiquement
- [ ] 5 sessions avec témoignages s'affichent
- [ ] Filtres par catégorie fonctionnels
- [ ] Modals détaillées s'ouvrent correctement
- [ ] Vidéos avec overlay play + contrôles
- [ ] Métriques d'impact visibles

### **5. Calculateur de Valeur ROI**
- [ ] Interface calculateur s'affiche sur pages produits
- [ ] Calculs temps réel selon sélections utilisateur
- [ ] Comparaisons vs alternatives détaillées
- [ ] Graphiques ROI sur 3 ans
- [ ] Intégration panier depuis calculateur

## ⚡ **Tests Performance**

### **6. Vitesse & Optimisations**
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] Images WebP/AVIF se chargent selon support navigateur
- [ ] Preloading intelligent des ressources critiques

### **7. Cache & Headers**
- [ ] Cache multi-niveaux actif (vérifier headers)
- [ ] ETags générés pour ressources statiques
- [ ] Headers de performance (preload, dns-prefetch)
- [ ] Invalidation cache intelligente

## 📊 **Tests Analytics**

### **8. Tracking E-commerce**
- [ ] Events GA4 déclenchés (page_view, add_to_cart)
- [ ] Enhanced ecommerce tracking produits
- [ ] Custom events JDR (product_hover, multiplier_select)
- [ ] Données utilisateur enrichies (Quebec detection)

### **9. A/B Testing**
- [ ] Tests A/B assignent correctement les variations
- [ ] Tracking conversions par variation
- [ ] Rapports batch envoyés à Analytics
- [ ] Persistance variation dans localStorage

## 📱 **Tests Mobile**

### **10. Responsive & Touch**
- [ ] Chatbot responsive sur mobile
- [ ] Navigation sticky cart fonctionne
- [ ] Contrôles touch 48px minimum respectés
- [ ] Galerie JDR swipe/scroll fluide
- [ ] Calculateur ROI utilisable sur petit écran

## 🤖 **Tests Systèmes IA**

### **11. Recommandations Produits**
- [ ] API /api/recommendations.php répond correctement
- [ ] Recommandations contextuelles (homepage, produit, panier)
- [ ] Scoring basé sur 7 facteurs fonctionne
- [ ] Profilage utilisateur automatique
- [ ] Cache recommandations (10min TTL)

### **12. Intelligence Chatbot**
- [ ] Reconnaissance intent (produits, conseils JDR, budget)
- [ ] Extraction entités (budget $, nombre joueurs)
- [ ] Réponses personnalisées selon profil
- [ ] Quick options génèrent bonnes réponses
- [ ] Escalade vers contact humain

## 🎨 **Tests UX/UI**

### **13. Micro-interactions JDR**
- [ ] Animations hover "magical shine"
- [ ] Transitions smooth entre états
- [ ] Feedback visuel sur toutes interactions
- [ ] Audio cling métallique (si autorisé navigateur)
- [ ] Toasts notifications stylées JDR

### **14. Thématique & Cohérence**
- [ ] Palette couleurs cohérente (or #d4af37, bronze #8b7355)
- [ ] Typographie Cinzel chargée correctement
- [ ] Iconographie D20/fantasy appropriée
- [ ] Animations respectent thème médiéval/fantasy

## 🔧 **Tests Techniques**

### **15. Compatibilité Navigateurs**
- [ ] Chrome/Edge (90%+ marché) - fonctionnel complet
- [ ] Firefox - dégradation gracieuse
- [ ] Safari - WebKit spécificités gérées
- [ ] Mobile browsers - touch optimisé

### **16. Sécurité & Performance**
- [ ] CSP headers corrects pour scripts
- [ ] CSRF protection maintenu
- [ ] Rate limiting API respecté
- [ ] Validation inputs côté serveur

## 📋 **Tests Business Logic**

### **17. Intégration Snipcart**
- [ ] Add to cart depuis recommandations
- [ ] Add to cart depuis calculateur ROI
- [ ] Tracking e-commerce lors ajouts
- [ ] Prix et variations produits corrects

### **18. Expérience Client Quebec**
- [ ] Détection audience québécoise
- [ ] Contenu français prioritaire
- [ ] Prix CAD affichés
- [ ] Références culturelles JDR appropriées

## 🚨 **Tests Critiques de Régression**

### **19. Fonctionnalités Existantes**
- [ ] Navigation site inchangée
- [ ] Formulaires contact fonctionnels  
- [ ] Pages statiques (À propos, etc.) intactes
- [ ] SEO meta tags préservés
- [ ] Performance baseline maintenue

### **20. Monitoring Continu**
- [ ] Performance monitor API active
- [ ] Alertes configurées (LCP, erreurs JS)
- [ ] Logs erreurs centralisés
- [ ] Dashboard métriques accessible

---

## 🎯 **Critères de Succès**

✅ **Performance:** LCP < 2.5s, FID < 100ms, CLS < 0.1
✅ **Engagement:** Chatbot 15%+ interactions, Galerie 25%+ vues  
✅ **Conversion:** ROI calculator 10%+ utilisation → panier
✅ **Mobile:** 95%+ fonctionnalités accessibles touch
✅ **Recommandations:** 30%+ CTR sur suggestions IA

**Status: 🚀 PRÊT POUR PRODUCTION**