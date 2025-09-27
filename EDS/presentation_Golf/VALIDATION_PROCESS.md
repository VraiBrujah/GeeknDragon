# PROCESSUS DE VALIDATION ANTI-HARDCODAGE

## 🚨 RÈGLES ABSOLUES

### ❌ STRICTEMENT INTERDIT
- **Hardcodage de valeurs métier** : Aucune valeur numérique/métier dans le code
- **Duplication de données** : Une donnée = un seul endroit
- **Variables dispersées** : Toutes les valeurs dans variables.csv
- **Calculs dupliqués** : Logique centralisée dans formulas.csv

### ✅ OBLIGATOIRE
- **getVariable() uniquement** : Seul moyen d'accéder aux données métier
- **Vérification systématique** : Rechercher avant ajouter
- **Documentation complète** : Descriptions FR/EN pour chaque variable
- **Tests de cohérence** : Même valeur dans toutes les sections

## 🔍 PROCESSUS DE VÉRIFICATION AVANT MODIFICATION

### Étape 1 : RECHERCHE GLOBALE
```bash
# Rechercher si la donnée existe déjà
grep -r "valeur_recherchée" .
grep -r "nom_variable" .
grep -r "calcul_similaire" .
```

### Étape 2 : VÉRIFICATION PAR FICHIER

#### A. Variables (variables.csv)
```bash
grep "variable_id" variables.csv
```
**Questions à se poser :**
- Cette variable existe-t-elle déjà ?
- Y a-t-il une variable similaire ?
- Puis-je réutiliser une variable existante ?

#### B. Formules (formulas.csv)
```bash
grep "formula_id" formulas.csv
grep "expression" formulas.csv
```
**Questions à se poser :**
- Ce calcul existe-t-il déjà ?
- Y a-t-il une formule similaire ?
- Puis-je étendre une formule existante ?

#### C. Données texte (data_*.csv)
```bash
grep "key,value" data_clean.csv
grep "texte_similaire" data_clean.csv
```
**Questions à se poser :**
- Ce texte existe-t-il déjà ?
- Y a-t-il un libellé similaire ?
- Puis-je réutiliser un texte existant ?

### Étape 3 : DÉCISION

#### Si la donnée EXISTE déjà :
✅ **UTILISER L'EXISTANTE**
```javascript
// ✅ CORRECT
const value = getVariable('existing_variable_id');
```

#### Si la donnée est NOUVELLE :
📝 **AJOUTER AVEC DOCUMENTATION**

**Variables.csv :**
```csv
variable_id,value,unit,name_fr,name_en,description_fr,description_en
new_variable,1234,$,Nouveau coût,New cost,Description française complète,Complete English description
```

**Formulas.csv :**
```csv
formula_id,formula_expression,variables_used,description_fr,description_en,usage_context
new_calculation,"var1 * var2 + var3","var1,var2,var3","Calcul français","English calculation","Contexte d'usage"
```

## 🧪 TESTS DE VALIDATION

### Tests Automatiques
```bash
# 1. Vérifier qu'aucune valeur n'est hardcodée
grep -r "[0-9]{3,}" script.js
grep -r "parseFloat.*||.*[0-9]" script.js

# 2. Vérifier que toutes les variables utilisent getVariable()
grep -r "getVariable" script.js

# 3. Vérifier cohérence entre fichiers
grep -r "specific_value" . --include="*.csv"
```

### Tests Manuels
1. **Changer une valeur dans variables.csv**
2. **Vérifier que TOUTES les sections se mettent à jour**
3. **Tester en FR et EN**
4. **Valider calculs avec calculatrice**

## 📋 CHECKLIST AVANT COMMIT

### ✅ Code
- [ ] Aucune valeur numérique hardcodée dans JS
- [ ] Toutes les variables via getVariable()
- [ ] Aucun parseFloat avec valeur par défaut hardcodée
- [ ] Pas de duplication de logique

### ✅ Données
- [ ] Variables documentées avec descriptions FR/EN
- [ ] Formules centralisées dans formulas.csv
- [ ] Textes centralisés dans data_*.csv
- [ ] Aucune contradiction entre fichiers

### ✅ Tests
- [ ] Modification d'une variable met à jour toutes les sections
- [ ] Calculs cohérents entre sections
- [ ] Fonctionnement FR/EN
- [ ] Performance acceptable

## 🚨 EXEMPLES D'ERREURS À ÉVITER

### ❌ HARDCODAGE INTERDIT
```javascript
// ❌ INTERDIT
const leadCost = 1400;
const maintenance = 1200;
const savings = 12683;

// ❌ INTERDIT
const value = parseFloat(data.something) || 1400;
```

### ✅ UTILISATION CORRECTE
```javascript
// ✅ CORRECT
const leadCost = getVariable('lead_cost_replacement_unit');
const maintenance = getVariable('lead_maintenance_cost_unit');
const savings = getVariable('savings_10y_unit');

// ✅ CORRECT (fallback zéro acceptable)
const value = getVariable('variable_id'); // getVariable gère déjà le fallback
```

### ❌ DUPLICATION INTERDITE
```javascript
// ❌ INTERDIT - Calcul dupliqué
function calculateSavings() {
    return 24400 - 11717; // Valeurs hardcodées
}

// Dans un autre endroit
const savings = 12683; // Même calcul dupliqué
```

### ✅ CENTRALISATION CORRECTE
```csv
# variables.csv
lead_total_cost_10y_unit,24400,$,...
lifepo4_total_10y_unit,11717,$,...
savings_10y_unit,12683,$,...
```

```javascript
// ✅ CORRECT - Source unique
const savings = getVariable('savings_10y_unit');
```

## 🔄 PROCESSUS DE CORRECTION D'ERREURS

### Quand une incohérence est détectée :

1. **IDENTIFIER LA SOURCE** : Quelle valeur est dupliquée/hardcodée ?
2. **CENTRALISER** : Mettre la valeur dans variables.csv
3. **NETTOYER** : Remplacer toutes les occurrences par getVariable()
4. **VALIDER** : Tester que tout fonctionne encore
5. **DOCUMENTER** : Ajouter descriptions FR/EN complètes

### Exemple de correction :
```javascript
// ❌ AVANT (hardcodé)
const leadCost = 1400;
const maintenanceCost = 1200;

// ✅ APRÈS (centralisé)
const leadCost = getVariable('lead_cost_replacement_unit');
const maintenanceCost = getVariable('lead_maintenance_cost_unit');
```

```csv
# variables.csv - Ajout avec documentation
lead_cost_replacement_unit,1400,$,Coût remplacement plomb,Lead replacement cost,Coût réaliste marché canadien 2024,Realistic Canadian market cost 2024
lead_maintenance_cost_unit,1200,$,Coût maintenance annuel,Annual maintenance cost,12h × 100$/h technicien spécialisé,12h × 100$/h specialized technician
```

## 📞 EN CAS DE DOUTE

**Questions à se poser :**
1. Cette valeur existe-t-elle déjà quelque part ?
2. Puis-je réutiliser une variable existante ?
3. Ai-je documenté cette nouvelle donnée ?
4. Tous les calculs sont-ils cohérents ?

**Principe fondamental :**
> **UNE DONNÉE MÉTIER = UN SEUL ENDROIT = variables.csv**

**En cas d'hésitation :** Rechercher d'abord, ajouter ensuite !