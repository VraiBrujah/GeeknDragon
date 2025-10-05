# 📊 GUIDE COMPLET - CRÉATION GRAPHIQUES EXCEL OPTIMAUX

## 🎯 FICHIERS CRÉÉS & GRAPHIQUES RECOMMANDÉS

### 1️⃣ **ÉCONOMIES TEMPORELLES** → `1_ECONOMIES_TEMPORELLES_courbes.csv`
**📈 TYPE GRAPHIQUE : Courbes Multi-Séries**
- **Axe X** : Année (0-20)
- **Axe Y** : Coût Cumulé ($)
- **Séries** : Plomb + 4 contrats Li-Kart
- **IMPACT VISUEL** : Montre clairement la divergence croissante des coûts

**🎨 CONFIGURATION EXCEL :**
```
Insérer → Graphique → Courbes → Courbe avec marqueurs
Titre : "Évolution des Coûts Totaux sur 20 ans"
Axe Y : "Coût Cumulé ($)"
Axe X : "Années"
```

### 2️⃣ **COMPARAISONS TECHNIQUES** → `2_COMPARAISONS_TECHNIQUES_barres.csv`
**📊 TYPE GRAPHIQUE : Barres Horizontales Groupées**
- **Parfait pour** : Comparer 2 technologies sur multiples critères
- **Avantage** : Facile à lire, impact visuel immédiat

**🎨 CONFIGURATION EXCEL :**
```
Insérer → Graphique → Barres → Barres groupées
Axe Y : Critères (Poids, Temps_Charge, etc.)
Axe X : Valeurs
Couleurs : Rouge (Plomb) vs Vert (Li-Kart)
```

### 2️⃣B **PERFORMANCE RADAR** → `2B_RADAR_PERFORMANCE.csv`  
**🎯 TYPE GRAPHIQUE : Radar/Toile d'araignée**
- **IMPACT** : Vision globale des performances
- **Utilisation** : Comparaison multi-critères immédiate

**🎨 CONFIGURATION EXCEL :**
```
Insérer → Graphique → Radar → Radar rempli
Axes : 10 critères de performance
2 séries : Plomb (rouge) vs Li-Kart (vert)
```

### 3️⃣ **RÉPARTITION DES COÛTS** → 3 Camemberts
**🥧 TYPE GRAPHIQUE : Camemberts Comparatifs**

#### A) `3_CAMEMBERT_COUTS_PLOMB_20ans.csv`
- **Montre** : Où va l'argent avec les batteries plomb
- **Insight** : 49% en maintenance !

#### B) `3B_CAMEMBERT_COUTS_LIKART_20ans.csv`  
- **Montre** : Simplicité Li-Kart (100% location)
- **Insight** : Aucun coût caché

#### C) `3C_CAMEMBERT_ECONOMIES_TYPES.csv`
- **Montre** : Types d'économies réalisées
- **Insight** : Répartition des avantages

**🎨 CONFIGURATION EXCEL :**
```
Insérer → Graphique → Secteurs → Secteurs en 3D
Étiquettes : Pourcentages + Noms
Couleurs : Dégradé selon impact
```

### 4️⃣ **ROI & PROJECTIONS** → `4_ROI_PROJECTIONS_aires.csv`
**📈 TYPE GRAPHIQUE : Aires Empilées**
- **Montre** : Accumulation des économies dans le temps
- **Impact** : ROI positif constant et croissant

**🎨 CONFIGURATION EXCEL :**
```
Insérer → Graphique → Aires → Aires empilées
Axe X : Années
Axe Y : ROI %
Remplissage : Vert (économies positives)
```

### 4️⃣B **SCENARIOS FLOTTE** → `4B_SCENARIOS_FLOTTE.csv`
**📊 TYPE GRAPHIQUE : Colonnes Groupées 3D**
- **Montre** : Impact de la taille de flotte
- **Insight** : Économies linéaires selon taille

### 5️⃣ **PERFORMANCE OPÉRATIONNELLE** → `5_PERFORMANCE_OPERATIONNELLE_colonnes.csv`
**📊 TYPE GRAPHIQUE : Colonnes Groupées**
- **Parfait pour** : Comparaisons métriques opérationnelles
- **Impact** : Avantages opérationnels quantifiés

### 6️⃣ **ANALYSE SENSIBILITÉ** → `6_ANALYSE_SENSIBILITE_inflation.csv`
**📈 TYPE GRAPHIQUE : Courbes de Sensibilité**
- **Montre** : Impact taux inflation sur économies
- **Insight** : Robustesse de l'avantage Li-Kart

---

## 🎨 PALETTE COULEURS RECOMMANDÉE

### 🔴 **Batteries Plomb**
- **Principal** : Rouge (#E74C3C)
- **Secondaire** : Orange (#F39C12)
- **Accent** : Jaune (#F1C40F)

### 🟢 **Li-Kart LiFePO4**  
- **Principal** : Vert (#27AE60)
- **Secondaire** : Bleu (#3498DB)
- **Accent** : Violet (#9B59B6)

### 💰 **Économies**
- **Principal** : Vert foncé (#1E8449)
- **Gradient** : Vert clair (#58D68D)

---

## 🚀 SÉQUENCE DE CRÉATION RECOMMANDÉE

### 1. **Commencer par** : Courbes économies temporelles
→ Impact immédiat, message principal

### 2. **Ensuite** : Camemberts coûts plomb vs Li-Kart  
→ Explication du "pourquoi" des économies

### 3. **Puis** : Barres comparaisons techniques
→ Justification performance supérieure

### 4. **Compléter par** : Radar performance
→ Vision globale des avantages

### 5. **Finaliser avec** : ROI et projections
→ Business case définitif

---

## 💡 CONSEILS EXCEL AVANCÉS

### 📊 **Formatage Axes**
```
Clic droit axe → Format → Nombre → Devise ($)
Séparateur milliers activé
Décimales : 0 pour montants, 1 pour %
```

### 🎨 **Styles Visuels**
```
Onglet Création → Styles → Style 8-10 (modernes)
Couleurs → Créer nouvelles couleurs thème
Effets → Ombres subtiles activées
```

### 📈 **Interactivité**
```
Ajouter courbes de tendance : Clic droit série → Ajouter courbe
Étiquettes données : Onglet Création → Ajouter élément
Tableaux croisés dynamiques pour analyses interactives
```

---

## 🏆 IMPACT BUSINESS MAXIMUM

### **Message Clé par Graphique :**
1. **Courbes** → "Li-Kart coûte 2x moins cher"
2. **Camemberts** → "Plomb = coûts cachés, Li-Kart = transparence"  
3. **Barres** → "Li-Kart surpasse sur tous critères"
4. **Radar** → "Performance globale supérieure"
5. **ROI** → "Rentabilité immédiate et croissante"

**Résultat** : Business case irréfutable avec visualisation percutante !