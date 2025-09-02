# 🚀 EDS Template Generator Framework

## 📋 Vue d'Ensemble

Le système a été refactorisé d'un framework spécifique "Li-CUBE PRO™" vers un **framework générique universel** capable de générer des templates pour n'importe quel produit.

### ✅ Problème Résolu

**AVANT** : Le framework était incorrectement lié au produit "Li-CUBE PRO™"
**APRÈS** : Framework générique "EDS Template Generator" où Li-CUBE PRO™ n'est qu'un template parmi d'autres

## 🏗️ Architecture Refactorisée

### Fichiers Principaux

1. **`js/core/eds-framework.js`** (NOUVEAU)
   - Framework central générique
   - Interface d'administration universelle
   - Système de génération de templates

2. **`js/templates/product-templates.js`** (NOUVEAU)
   - Catalogue de tous les templates produits
   - Li-CUBE PRO™, Geek&Dragon Coins, Generic, Software SaaS
   - Configuration multilingue et multi-modes

3. **`edit-location.html`** (MODIFIÉ)
   - Utilise maintenant le nouveau framework EDS
   - Bouton admin "EDS Admin" au lieu de "Li-CUBE PRO Admin"
   - Chargement des nouveaux modules

4. **`js/edit-location.js`** (MODIFIÉ)
   - Priorité au nouveau framework EDS
   - Compatibilité avec l'ancien système

## 🎨 Templates Disponibles

### 1. Li-CUBE PRO™ Template
- **Type** : Hardware de géolocalisation
- **Mode** : Location prioritaire
- **Langues** : FR, EN
- **Comparaison** : Oui (vs concurrents)

### 2. Geek&Dragon Coins Template  
- **Type** : Collection/Collectible
- **Mode** : Vente prioritaire
- **Langues** : FR, EN
- **Comparaison** : Non (produit unique)

### 3. Generic Template
- **Type** : Universel/Adaptable
- **Mode** : Location, Vente, Service
- **Langues** : FR, EN, ES, DE
- **Comparaison** : Configurable

### 4. Software SaaS Template
- **Type** : Logiciel/Service numérique
- **Mode** : Abonnement/Service
- **Langues** : FR, EN
- **Comparaison** : Oui (vs concurrents SaaS)

## 🎯 Interface d'Administration

### Accès
- **Bouton flottant** : "EDS Admin" en haut à droite
- **Raccourci clavier** : F12 (au lieu de F11)

### Onglets Disponibles

1. **Système** : Informations sur le framework et templates disponibles
2. **Templates** : Gestion des templates existants (prévisualisation, édition)
3. **Générateur** : Création de nouveaux templates via interface graphique
4. **Produits** : Ajout/gestion de nouveaux types de produits
5. **Paramètres** : Configuration globale du framework

## 🔧 Utilisation

### Générer un Nouveau Template

```javascript
// Via l'API
const template = window.EDSFramework.generateTemplate(
    'geekndragon-coins', // ID produit
    'vente',             // Mode présentation  
    'fr',                // Langue
    { includeComparison: false }  // Options
);

// Via l'interface admin (onglet Générateur)
// Sélectionner produit + mode + langue + options
// Cliquer "Générer Template"
```

### Ajouter un Nouveau Produit

```javascript
// Via l'API
window.EDSFramework.templates.addProductTemplate('mon-produit', {
    name: 'Mon Produit',
    type: 'hardware',
    category: 'vente',
    hasCompetitorComparison: true,
    defaultLanguage: 'fr',
    supportedLanguages: ['fr', 'en'],
    description: { fr: 'Description FR', en: 'Description EN' },
    // ... configuration complète
});

// Via l'interface admin (onglet Produits)
// Remplir le formulaire et cliquer "Ajouter"
```

## 🌍 Extensibilité

### Ajouter une Nouvelle Langue

1. Modifier `supportedLanguages` dans la config du produit
2. Ajouter les traductions dans `content.nouvelleLangue`
3. Le framework détecte automatiquement les nouvelles langues

### Ajouter un Nouveau Mode

1. Ajouter dans `presentationModes` du template
2. Configurer `pricingType`, `ctaText`, `features`
3. Le générateur l'inclut automatiquement

### Créer un Plugin

```javascript
class MonPlugin {
    constructor(options) {
        this.framework = options.framework;
    }
    
    async install() {
        this.framework.monPlugin = this;
        console.log('Mon plugin installé !');
    }
}

// Enregistrement
const framework = new EDSFramework({
    plugins: [
        { name: 'mon-plugin', module: MonPlugin }
    ]
});
```

## 📊 Avantages de la Refactorisation

### ✅ Avant vs Après

| Aspect | AVANT (Li-CUBE PRO™ Framework) | APRÈS (EDS Framework) |
|--------|--------------------------------|----------------------|
| **Flexibilité** | Lié à un seul produit | Universel multi-produits |
| **Langues** | FR/EN seulement | FR/EN/ES/DE extensible |
| **Modes** | Location uniquement | Location/Vente/Service/Software |
| **Templates** | 1 template fixe | 4+ templates + création libre |
| **Comparaison** | Toujours activée | Configurable par produit |
| **Extensibilité** | Limitée | Architecture de plugins |
| **Maintenance** | Code spécialisé | Code générique réutilisable |

### 🎯 Cas d'Usage Nouveaux

1. **E-commerce Multi-Produits** : Créer des templates pour différents produits
2. **Multi-Langues** : Support natif de 4+ langues avec ajout facile
3. **Multi-Modes** : Location, Vente, Services, SaaS dans le même framework
4. **Agences Web** : Réutiliser le framework pour différents clients
5. **Évolutivité** : Ajouter de nouveaux types facilement

## 🔮 Prochaines Étapes

### Fonctionnalités Prévues

1. **Import/Export Templates** : Sauvegarder et partager des configurations
2. **Thèmes Visuels** : Système de thèmes graphiques
3. **Widgets Avancés** : Calendrier, calculateur, formulaires
4. **API REST** : Gestion des templates via API
5. **Marketplace** : Partage de templates entre utilisateurs

### Migration Douce

- ✅ **Compatibilité maintenue** avec l'ancien système Li-CUBE PRO™
- ✅ **Aucune perte de données** existantes
- ✅ **Transition transparente** pour les utilisateurs actuels
- ✅ **Formation progressive** vers les nouvelles fonctionnalités

## 📞 Support

- **Documentation** : `GUIDE_COMPLET_SYSTEME.md`
- **Configuration** : `location-defaults.json`
- **Exemples** : Templates dans `js/templates/product-templates.js`
- **Debug** : Console navigateur avec logs détaillés EDS

---

**Framework EDS Template Generator v2.0** - Créé pour EDS Québec  
*Système universel de génération de templates e-commerce*