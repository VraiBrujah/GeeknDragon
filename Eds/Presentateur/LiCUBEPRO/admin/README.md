# 🔧 Interface d'Administration Li-CUBE PRO™

Interface complète de configuration et administration pour le système Li-CUBE PRO™ d'EDS Québec.

## 📋 Vue d'ensemble

Cette interface permet aux développeurs et administrateurs de:
- **Modifier** tous les prix, spécifications et paramètres
- **Valider** les configurations selon les règles métier
- **Tracer** toutes les formules et calculs
- **Sauvegarder** avec versioning automatique
- **Propager** les changements en temps réel

## 🏗️ Architecture

```
admin/
├── index.html                 # Portail d'accueil
├── interface.html            # Interface principale d'édition
├── schema.json               # Schéma de validation JSON
├── calculations-engine.js    # Moteur de calculs traçables
├── validation-system.js      # Système de validation et versioning
└── README.md                # Cette documentation
```

## 🚀 Démarrage rapide

1. **Accès sécurisé** : Ouvrir `admin/index.html`
2. **Interface d'édition** : Cliquer sur "Interface de Configuration"
3. **Navigation** : Utiliser la sidebar pour sélectionner les valeurs
4. **Modification** : Éditer dans le panneau central
5. **Validation** : Vérifier dans l'inspecteur de droite
6. **Sauvegarde** : Bouton "Sauvegarder" en haut

## 📊 Fonctionnalités principales

### Interface de Configuration

- **Arbre de navigation** : Vue hiérarchique de toutes les valeurs
- **Éditeur visuel** : Contrôles adaptés selon le type de donnée
- **Validation en temps réel** : Vérification immédiate des contraintes
- **Inspection détaillée** : Métadonnées, formules, dépendances
- **Recherche** : Filtrage rapide des paramètres

### Calculs Traçables

```javascript
// Exemple de formule traçable
'calculations.tco_vente.licube.total_20_years': {
    formula: '(price_base * (1 + taxes_percent/100)) + installation_cost + (monitoring_monthly * 12 * 20)',
    dependencies: [
        'modes.vente.licube.price_base',
        'modes.vente.licube.taxes_percent',
        'modes.vente.licube.installation_cost',
        'modes.vente.licube.monitoring_monthly'
    ]
}
```

### Validation et Règles Métier

- **Cohérence des prix** : Li-CUBE < Ni-Cd
- **Supériorité technique** : Cycles, efficacité, poids
- **Viabilité économique** : Taux, maintenance, garantie
- **Contraintes techniques** : Température, densité énergétique

### Versioning et Historique

- **Versions automatiques** : Chaque sauvegarde crée une version
- **Métadonnées** : Auteur, description, horodatage
- **Rollback** : Restauration vers versions antérieures
- **Différentiel** : Comparaison entre versions

## 🔍 Utilisation détaillée

### 1. Navigation dans la configuration

La sidebar présente une vue arborescente avec:
- **Sections** : Métadonnées, Modes, Spécifications
- **Indicateurs** : Badges pour modifications, calculs, erreurs
- **Recherche** : Filtre en temps réel

### 2. Édition des valeurs

Types de contrôles disponibles:
- **Nombre** : Input numérique avec unité
- **Texte** : Input texte standard
- **Booléen** : Switch on/off
- **Énumération** : Liste déroulante

### 3. Validation automatique

Règles appliquées:
- **Schéma JSON** : Types, plages, champs requis
- **Règles métier** : Logique spécifique Li-CUBE
- **Contraintes** : Relations entre valeurs

### 4. Propagation des changements

Lors de la sauvegarde:
1. **Validation complète** de la configuration
2. **Création de version** avec métadonnées
3. **Mise à jour** du pricing manager global
4. **Émission d'événement** pour les autres pages
5. **Notification** de succès/échec

## 📈 Monitoring et statistiques

L'interface fournit:
- **État du système** : Connexion, version, statut
- **Compteurs** : Modifications non sauvées, erreurs
- **Performance** : Cache, calculs, historique
- **Usage** : Pages utilisant chaque valeur

## 🔒 Sécurité

Mesures de sécurité implementées:
- **No-index** : Invisible aux moteurs de recherche
- **No-cache** : Pas de mise en cache navigateur
- **Accès restreint** : Zone développeurs uniquement
- **Validation** : Toutes les entrées sont validées
- **Atomicité** : Sauvegardes tout-ou-rien

## 🚨 Dépannage

### Problèmes courants

**Valeurs non affichées:**
- Vérifier que le pricing manager est chargé
- Contrôler la console pour erreurs JavaScript
- S'assurer que les chemins JSON sont corrects

**Validation échouée:**
- Consulter l'onglet Validation pour détails
- Vérifier les contraintes métier
- Corriger les valeurs hors plage

**Sauvegarde impossible:**
- Résoudre toutes les erreurs de validation
- Vérifier les permissions système
- Consulter les logs de l'interface

### Messages d'erreur

| Erreur | Cause | Solution |
|--------|-------|----------|
| "Configuration invalide" | Règles métier violées | Corriger les valeurs signalées |
| "Pricing manager non disponible" | Système non initialisé | Recharger la page |
| "Schéma non trouvé" | Fichier schema.json manquant | Vérifier les fichiers |

## 🔄 Intégration avec le système

### Événements émis

```javascript
// Mise à jour de configuration
window.addEventListener('edsConfigUpdated', function(event) {
    console.log('Config mise à jour:', event.detail);
});
```

### API des calculs

```javascript
// Utilisation du moteur de calculs
const engine = new CalculationsEngine(config);
const tco = engine.calculateValue(config, 'calculations.tco_vente.licube.total_20_years');
```

### Validation programmatique

```javascript
// Validation manuelle
const validator = new ValidationSystem();
const result = validator.validateConfiguration(config, schema);
```

## 🛠️ Développement

### Structure du code

- **Modulaire** : Chaque composant est indépendant
- **Événementiel** : Communication par événements DOM
- **Réactif** : Mise à jour automatique des vues
- **Extensible** : Ajout facile de nouvelles règles/calculs

### Ajout d'une nouvelle règle de validation

```javascript
businessRules.set('newRule', {
    name: 'Nouvelle règle',
    description: 'Description de la règle',
    severity: 'error', // ou 'warning'
    validate: (config) => {
        // Logique de validation
        return {
            valid: true/false,
            errors: [/* liste d'erreurs */]
        };
    }
});
```

### Ajout d'un nouveau calcul

```javascript
formulas['nouveau.calcul'] = {
    name: 'Nouveau Calcul',
    description: 'Description du calcul',
    formula: 'formule_mathematique',
    dependencies: ['chemin.source1', 'chemin.source2'],
    unit: 'unité',
    category: 'catégorie',
    calculate: (config) => {
        // Logique de calcul
        return résultat;
    }
};
```

## 📞 Support

- **Documentation** : Ce README et commentaires dans le code
- **Logs** : Console navigateur pour debugging
- **Issues** : GitHub pour signaler des problèmes
- **Contact** : Équipe de développement EDS Québec

---

*Interface d'administration Li-CUBE PRO™ - Version 2025-2.0*  
*Développé avec Claude Code pour EDS Québec*