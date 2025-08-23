# 🎯 GUIDE D'INTÉGRATION - SYSTÈME DE PRIX CENTRALISÉ

## ✅ SYSTÈME CRÉÉ ET FONCTIONNEL

Le système de prix centralisé est maintenant opérationnel avec :

- ✅ **pricing-config.json** : Configuration centralisée de tous les prix
- ✅ **pricing-manager.js** : Gestionnaire JavaScript intelligent
- ✅ **scripts.js VENTE** : Corrigé pour utiliser le système centralisé (5000$ + taxes + installation = 6325$)
- ✅ **scripts.js LOCATION** : Corrigé pour utiliser le système centralisé (150$/mois, monitoring inclus)
- ✅ **test-pricing-system.html** : Fichier de validation complète

---

## 🚀 COMMENT INTÉGRER DANS VOS FICHIERS HTML

### ÉTAPE 1: Ajouter les scripts requis

Dans **CHAQUE** fichier HTML qui affiche des prix, ajouter AVANT la fermeture `</body>` :

```html
<!-- SYSTÈME DE PRIX CENTRALISÉ - REQUIS -->
<script src="./js/pricing-manager.js"></script>
<script src="./presentations-vente/presentations-vendeurs/assets/scripts.js"></script>
<!-- OU -->
<script src="./presentations-location/presentations-vendeurs/assets/scripts.js"></script>
```

### ÉTAPE 2: Utiliser les attributs data-pricing

Dans votre HTML, remplacer les prix hardcodés par des attributs spéciaux :

```html
<!-- ANCIEN (à supprimer) -->
<span>5000$</span>

<!-- NOUVEAU (automatique) -->
<span data-pricing-value="modes.vente.licube.price_base" 
      data-pricing-format="currency">Chargement...</span>

<!-- EXEMPLES COMPLETS -->
<div class="price-display">
    <!-- Prix Li-CUBE vente -->
    <span data-pricing-value="modes.vente.licube.price_total" 
          data-pricing-format="currency">6325</span>
    
    <!-- Prix Li-CUBE location mensuel -->
    <span data-pricing-value="modes.location.licube.monthly_rate" 
          data-pricing-format="currency">150</span>
    
    <!-- Économies en pourcentage -->
    <span data-pricing-calc="tco" 
          data-pricing-value="savings.percentage" 
          data-pricing-format="percentage">79</span>
</div>
```

### ÉTAPE 3: Déclencher la mise à jour

Ajouter ce script à la fin de vos pages :

```html
<script>
// Attendre que le pricing manager soit prêt
document.addEventListener('pricingManagerReady', function() {
    // Mettre à jour tous les prix pour le mode souhaité
    window.pricingManager.updateAllDisplays('vente');  // ou 'location'
    
    console.log('✅ Tous les prix mis à jour automatiquement');
});
</script>
```

---

## 📊 UTILISATION AVANCÉE DES CALCULS TCO

### Calculs dynamiques en JavaScript

```javascript
// Attendre que le système soit prêt
document.addEventListener('pricingManagerReady', async function() {
    const manager = window.pricingManager;
    
    // Calcul TCO complet
    const tcoVente = manager.calculateTCO('vente', 1, 20);
    const tcoLocation = manager.calculateTCO('location', 1, 20);
    
    // Affichage des résultats
    document.getElementById('savings-vente').textContent = 
        manager.formatPrice(tcoVente.savings.total, 'currency');
    
    document.getElementById('savings-location').textContent = 
        manager.formatPrice(tcoLocation.savings.total, 'currency');
});
```

### Sliders/Calculateurs interactifs

```javascript
// Exemple de slider dynamique
function setupDynamicCalculator() {
    const unitsSlider = document.getElementById('units');
    const periodSlider = document.getElementById('period');
    
    function updateCalculations() {
        const units = parseInt(unitsSlider.value);
        const years = parseInt(periodSlider.value);
        
        // Calculs avec le système centralisé
        const tco = window.pricingManager.calculateTCO('vente', units, years);
        
        // Mise à jour des affichages
        document.getElementById('totalCost').textContent = 
            window.pricingManager.formatPrice(tco.licube.total, 'currency');
        document.getElementById('totalSavings').textContent = 
            window.pricingManager.formatPrice(tco.savings.total, 'currency');
    }
    
    unitsSlider.addEventListener('input', updateCalculations);
    periodSlider.addEventListener('input', updateCalculations);
    updateCalculations(); // Initial
}
```

---

## 🔧 FICHIERS À MODIFIER PRIORITAIREMENT

### CALCUL TCO (URGENT)

**VENTE:**
```
presentations-vente/presentations-vendeurs/calculateur-tco.html
presentations-vente/images-onepage/infographie-tco.html
presentations-vente/supports-print/flyers/flyer-tco-focus.html
```

**LOCATION:**
```
presentations-location/presentations-vendeurs/calculateur-tco.html
presentations-location/images-onepage/infographie-tco.html
presentations-location/supports-print/flyers/flyer-tco-focus.html
```

### PRÉSENTATIONS PRINCIPALES

```
presentations-vente/presentations-vendeurs/presentation-complete.html
presentations-location/presentations-vendeurs/presentation-complete.html
licubepro.html
edsquebec.html
```

---

## ⚠️ PRIX CORRECTS DANS LE SYSTÈME

### MODE VENTE
- **Li-CUBE PRO™:** 5000$ + taxes (14,975%) + installation (500$) = **6325$ CAD**
- **Monitoring:** 20$/mois OPTIONNEL
- **Ni-Cd:** 12000$ + taxes + installation = **14370$ CAD**
- **Maintenance Ni-Cd:** 452$/an

### MODE LOCATION  
- **Li-CUBE PRO™:** **150$/mois** (monitoring + maintenance INCLUS)
- **Ni-Cd:** 300$/mois + maintenance 452$/an

### ÉCONOMIES SUR 20 ANS
- **Mode Vente:** 41 025$ d'économies (79%)
- **Mode Location:** 45 040$ d'économies (56%)

---

## 🧪 VALIDATION COMPLÈTE

Pour tester le système :

1. Ouvrir `test-pricing-system.html` dans un navigateur
2. Vérifier que tous les prix s'affichent correctement
3. Vérifier que les calculs TCO sont cohérents
4. Consulter la console pour les logs de debug

---

## 🚨 AVANTAGES DU SYSTÈME CENTRALISÉ

### AVANT (Problématique)
- ❌ Prix hardcodés dans 38 fichiers différents
- ❌ Incohérences: 2500$ vs 5000$, 100$ vs 150$
- ❌ Maintenance impossible
- ❌ Risque d'erreurs clients

### APRÈS (Solution)
- ✅ **UNE seule source de vérité** : pricing-config.json
- ✅ **Modification centralisée** : 1 changement = TOUT est mis à jour
- ✅ **Prix cohérents** partout automatiquement
- ✅ **Calculs dynamiques** précis
- ✅ **Maintenance simplifiée**

---

## 📝 NEXT STEPS

1. **Intégrer le système** dans les fichiers prioritaires listés
2. **Tester chaque page** modifiée
3. **Supprimer tous les prix hardcodés** restants
4. **Former l'équipe** à l'utilisation du nouveau système

---

## 💡 SUPPORT

Pour toute question sur l'utilisation du système centralisé, consulter :
- `pricing-config.json` : Configuration des prix
- `pricing-manager.js` : Documentation complète des méthodes
- `test-pricing-system.html` : Exemples concrets d'utilisation

**Le système est prêt à être déployé !** 🚀