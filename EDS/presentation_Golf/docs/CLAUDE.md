# CLAUDE.md - Présentation Golf EDS Québec

## Contexte du Projet

**Présentation Golf EDS Québec** est une présentation interactive web pour les solutions de batteries lithium destinées aux terrains de golf, développée par EDS Québec. Le projet vise à présenter les avantages technologiques et financiers des kits lithium LiFePO₄ 48V 105Ah pour l'industrie du golf.

**Répertoire de Travail** : `E:\GitHub\GeeknDragon\EDS\presentation_Golf`

## 🌐 DIRECTIVES DE DÉVELOPPEMENT FUNDAMENTALES

### 📢 Communication & Langue
- **Communication exclusive en français** : Toutes les interactions, explications et retours doivent être en français
- **Documentation française** : Tous les commentaires, docstrings et documentation technique en français
- **Identifiants anglais, docs français** : Noms de variables/fonctions en anglais, commentaires/documentation en français
- **Présentation bilingue** : Support FR/EN avec basculement dynamique

### 🏗️ Principes d'Architecture & Génie Logiciel

#### Architecture Statique & Performance
- **Site statique optimisé** : HTML/CSS/JS pur, aucun framework lourd nécessaire
- **Chargement asynchrone** : Données CSV chargées via fetch avec cache-busting
- **Présentation fluide** : Animations CSS, transitions smooth pour UX premium
- **Responsive design** : Support desktop et mobile avec breakpoints adaptatifs

#### Gestion des Données Centralisée
- **Architecture data-driven** : Configuration via CSV pour faciliter les mises à jour
- **Séparation contenu/présentation** : Données dans CSV, logique dans JS, style dans CSS
- **Support multilingue** : data_clean.csv (FR) et data_en_clean.csv (EN)
- **Formules dynamiques** : Calculs financiers configurables via formulas.csv
- **⚠️ ANTI-HARDCODAGE ABSOLU** : Aucune valeur numérique/métier dans le code
- **Source unique variables.csv** : Toutes les valeurs métier dans variables.csv
- **Fonction getVariable() obligatoire** : Accès aux données uniquement via getVariable()
- **Vérification systématique** : Avant ajout, vérifier si variable existe déjà

#### Clean Code & Maintenabilité
- **Fonctions modulaires** : Une responsabilité par fonction
- **Gestion d'erreurs robuste** : Try/catch appropriés, fallbacks gracieux
- **Code commenté** : Documentation française pour logique complexe
- **Conventions cohérentes** : Nommage stable, indentation 2 espaces

### 🔒 Autonomie & Isolation

#### Fonctionnement Standalone Absolu
- **Aucune dépendance réseau** : Pas d'API externes, CDN ou services distants
- **Assets locaux complets** : Images, polices, icônes hébergés localement
- **Configuration locale** : Toutes les données dans des fichiers CSV versionnés
- **Cache-busting intelligent** : Timestamps pour éviter problèmes de cache

#### Sécurité & Confidentialité
- **Aucune télémétrie** : Pas de tracking, analytics ou collecte de données
- **Exécution locale pure** : Fonctionne avec file:// ou serveur local simple
- **Données sensibles externalisées** : Configuration dans CSV modifiables

### 🚫 Interdictions Strictes

#### Code & Configuration
- **🚫 HARDCODAGE STRICTEMENT INTERDIT** : Aucune valeur numérique/métier dans le code
- **🚫 DUPLICATION INTERDITE** : Une variable = un seul endroit (variables.csv)
- **🚫 VALEURS STATIQUES INTERDITES** : Utiliser getVariable() pour toute donnée métier
- **🚫 CALCULS DUPLIQUÉS INTERDITS** : Logique de calcul centralisée dans formulas.csv
- **Pas de données simulées** : Données réelles d'EDS Québec uniquement
- **Pas de dépendances externes** : Bibliothèques minimales, code vanilla privilégié

#### ⚙️ PROCESSUS OBLIGATOIRE AVANT MODIFICATION
1. **Vérifier variables.csv** : La variable existe-t-elle déjà ?
2. **Vérifier formulas.csv** : Le calcul existe-t-il déjà ?
3. **Vérifier data_*.csv** : Le texte existe-t-il déjà ?
4. **Utiliser l'existant** : Réutiliser ou étendre, ne jamais dupliquer
5. **Si nouveau** : Ajouter dans le bon CSV avec documentation complète

#### Médias & Assets
- **Optimisation requise** : Images WebP avec fallbacks JPG/PNG
- **Taille contrôlée** : Médias optimisés pour web, pas de fichiers volumineux
- **Chemins relatifs stables** : Structure d'assets prévisible et documentée

### 📊 Architecture de Données

#### Structure CSV Centralisée
```csv
# data_clean.csv / data_en_clean.csv
section,key,value
header,company_name,EDS QUÉBEC
hero,main_title,TRANSFORMEZ VOTRE TERRAIN...
pricing,battery_cost_per_kwh,450
```

#### Variables Dynamiques (variables.csv)
```csv
variable_id,description_fr,description_en,default_value,unit
cart_count,Nombre de voiturettes,Number of carts,50,unités
years,Années d'utilisation,Years of use,8,ans
```

#### Formules Configurables (formulas.csv)
```csv
formula_id,description_fr,expression,parameters
lead_annual_cost,Coût annuel batteries plomb,{lead_battery_cost} * {cart_count} / {lead_lifespan},lead_battery_cost;cart_count;lead_lifespan
```

### 🎯 Fonctionnalités Clés

#### Présentation Interactive
- **Slides dynamiques** : Progression fluide avec animations
- **Calculateur de ROI** : Interface slider pour calculs en temps réel
- **Graphiques comparatifs** : Visualisation coûts plomb vs lithium
- **Support multimédia** : Images haute qualité, musique d'ambiance

#### Calculateur Financier Avancé
- **Calculs temps réel** : Mise à jour instantanée via sliders
- **Formules configurables** : Expressions mathématiques en CSV
- **Comparaisons automatiques** : ROI, TCO, économies sur durée de vie
- **Visualisation claire** : Graphiques et métriques compréhensibles

#### Expérience Utilisateur Premium
- **Design moderne** : Interface épurée, professionnelle
- **Animations fluides** : Transitions CSS optimisées
- **Musique d'ambiance** : Contrôle audio avec playlists
- **Responsive complet** : Adaptation mobile/desktop

### 🎵 Système Audio Intelligent

#### Gestion Musicale Avancée
```javascript
// Système de playlists configurables
const musicConfig = {
  tracks: [
    { file: 'ethereal-glow.mp3', name: 'Éclat Éthéré' },
    { file: 'whispered-horizons.mp3', name: 'Horizons Murmurés' }
  ],
  autoplay: false,
  loop: true,
  volume: 0.3
};
```

#### Contrôles Audio UX
- **Interface élégante** : Boutons play/pause/suivant intuitifs
- **Gestion volume** : Contrôle utilisateur avec persistance
- **Playlists configurables** : index.json pour faciliter ajouts
- **Respect utilisateur** : Pas de lecture automatique invasive

### 🔧 Outils de Développement

#### Serveur Local
```bash
# Python (recommandé)
python -m http.server 8000
# Ouvrir: http://localhost:8000/presentation_golf.html

# Node.js (alternatif)
npx serve .
```

#### Tests & Validation
```bash
# Tests de fumée (aucune dépendance réseau)
python tests/smoke_test.py

# Validation liens HTML
python tests/validate_links.py

# Tests complets Windows
./scripts/run_tests.ps1
```

#### Structure de Fichiers
```
presentation_Golf/
├── presentation_golf.html    # Point d'entrée principal
├── styles.css               # Styles centralisés
├── script.js                # Logique JavaScript
├── data_clean.csv           # Données françaises
├── data_en_clean.csv        # Données anglaises
├── variables.csv            # Variables configurables
├── formulas.csv             # Formules de calcul
├── images/                  # Assets visuels optimisés
├── flags/                   # Icônes drapeaux SVG
├── musique/                 # Pistes audio + config
└── AGENTS.md               # Guide développeur
```

### 📝 Standards de Code

#### JavaScript ES6+ - ANTI-HARDCODAGE OBLIGATOIRE
```javascript
/**
 * ⚠️ EXEMPLE CORRECT - Utilisation systématique de getVariable()
 */
function updateCartCalculation() {
    // ✅ CORRECT : Toutes les valeurs depuis variables.csv
    const leadCost = getVariable('lead_cost_replacement_unit');
    const maintenance = getVariable('lead_maintenance_cost_unit');
    const lithiumMonthly = getVariable('lifepo4_monthly_10y');
    const fleetMinimum = getVariable('fleet_minimum_carts');

    // Calculs basés exclusivement sur variables.csv
    const totalCost = leadCost * currentCartCount;
    const isFleetEligible = currentCartCount >= fleetMinimum;
}

/**
 * 🚫 EXEMPLES INCORRECTS - Hardcodage interdit
 */
function badExamples() {
    // ❌ INTERDIT : Valeurs hardcodées
    const leadCost = 1400;           // ❌ Utiliser getVariable('lead_cost_replacement_unit')
    const maintenance = 1200;        // ❌ Utiliser getVariable('lead_maintenance_cost_unit')
    const lithiumMonthly = 97.64;    // ❌ Utiliser getVariable('lifepo4_monthly_10y')
    const fleetMin = 30;             // ❌ Utiliser getVariable('fleet_minimum_carts')

    // ❌ INTERDIT : Calculs dupliqués
    const savings = 12683.2;         // ❌ Utiliser formulas.csv
}

/**
 * ✅ PROCESSUS OBLIGATOIRE avant ajout de variable
 */
function checkBeforeAdding(variableId) {
    // 1. Vérifier si existe déjà
    if (variables[variableId]) {
        console.warn(`Variable ${variableId} existe déjà - UTILISER L'EXISTANTE`);
        return getVariable(variableId);
    }

    // 2. Si nouveau, ajouter dans variables.csv avec documentation
    console.log(`Nouvelle variable ${variableId} à ajouter dans variables.csv`);
    return null;
}
```

#### CSS Organisé
```css
/* Variables CSS pour cohérence */
:root {
    --primary-color: #2c5aa0;
    --secondary-color: #f8f9fa;
    --accent-color: #ffd700;
    --text-primary: #333;
    --transition-smooth: all 0.3s ease;
}

/* Composants modulaires */
.cart-calculator-section {
    background: var(--secondary-color);
    border-radius: 12px;
    transition: var(--transition-smooth);
}
```

#### HTML Sémantique
```html
<!-- Structure accessible et SEO-friendly -->
<section class="hero fade-in" aria-label="Présentation principale">
    <h2 id="hero-title">Titre dynamique chargé depuis CSV</h2>
    <img id="hero-image" src="images/golf_cart_sunset.jpg"
         alt="Voiturette de golf moderne" loading="lazy">
</section>
```

### 🚀 Optimisations Performance

#### Chargement Intelligent
- **Lazy loading** : Images chargées à la demande
- **Cache busting** : Timestamps pour éviter cache obsolète
- **Compression assets** : Images WebP, CSS/JS minifiés
- **Priorisation critique** : CSS/JS essentiels inline si nécessaire

#### Gestion Mémoire
- **Event listeners optimisés** : Ajout/suppression appropriés
- **Débouncing calculs** : Éviter recalculs excessifs sur sliders
- **Cleanup automatique** : Libération ressources audio/vidéo

### 🔍 Maintenance & Évolution - PROTOCOLE ANTI-HARDCODAGE

#### ⚙️ PROCESSUS OBLIGATOIRE avant toute modification

##### 🔎 Étape 1 : RECHERCHE & VÉRIFICATION
```bash
# Vérifier si variable/calcul/texte existe déjà
grep -r "lead_cost" .                    # Recherche globale
grep -r "1400" .                        # Recherche valeur numérique
grep -r "maintenance" variables.csv     # Vérification variables
grep -r "calculation" formulas.csv      # Vérification formules
```

##### 📝 Étape 2 : DOCUMENTATION & AJOUT
1. **Si variable existe** : ✅ Utiliser getVariable('existing_var')
2. **Si nouveau** : ➕ Ajouter dans variables.csv avec description complète
3. **Si calcul existe** : ✅ Utiliser formule existante
4. **Si nouveau calcul** : ➕ Ajouter dans formulas.csv

##### ✅ Étape 3 : VALIDATION
1. **Tester localement** : Vérifier rendu et calculs
2. **Vérifier cohérence** : Toutes sections utilisent mêmes valeurs
3. **Valider multilingue** : FR et EN synchronisés

#### Ajout de Variables (Nouveau)
1. **Vérifier variables.csv** : Variable existe-t-elle déjà ?
2. **Ajouter avec documentation** : ID, valeur, unité, descriptions FR/EN
3. **Utiliser getVariable()** : Jamais hardcoder dans le code
4. **Tester** : Vérifier fonctionnement dans toutes les sections
3. **Valider responsive** : Desktop et mobile
4. **Commit atomique** : Un changement = un commit

#### Nouveaux Calculs (Processus Anti-Duplication)
1. **Vérifier formulas.csv** : Calcul existe-t-il déjà ?
2. **Vérifier variables.csv** : Variables nécessaires existent-elles ?
3. **Ajouter variables manquantes** : Dans variables.csv avec documentation
4. **Définir formule centralisée** : Dans formulas.csv avec expression claire
5. **Implémenter via getVariable()** : Jamais hardcoder les valeurs
6. **Tester cohérence globale** : Même résultat dans toutes sections

#### Optimisations Visuelles
- **Images** : Optimisation WebP + fallbacks
- **Animations** : CSS transforms, éviter propriétés layout
- **Accessibilité** : ARIA labels, contraste, navigation clavier
- **SEO** : Meta tags, alt text, structured data

### 📋 Checklist Déploiement

Avant chaque version :
- [ ] Tous les CSV validés (syntaxe, données cohérentes)
- [ ] Tests smoke passent (aucune erreur console)
- [ ] Responsive vérifié (mobile/desktop)
- [ ] Performance acceptable (<2s chargement initial)
- [ ] Calculs validés manuellement (échantillon)
- [ ] Musique fonctionne (lecture/pause/volume)
- [ ] Basculement FR/EN opérationnel
- [ ] Assets optimisés (images <500KB)

### 🎯 Objectifs Business

#### Conversion Prospects
- **Démonstration ROI claire** : Calculateur convaincant
- **Présentation professionnelle** : Crédibilité technique
- **Différenciation concurrentielle** : Technologie canadienne
- **Support décisionnel** : Métriques précises et comparaisons

#### Expérience Client
- **Interface intuitive** : Utilisation sans formation
- **Contenu adaptatif** : FR/EN selon audience
- **Présentation immersive** : Visuel et audio engageants
- **Outils pratiques** : Calculateurs, comparaisons, téléchargements

#### Excellence Technique
- **Performance optimale** : Chargement rapide, navigation fluide
- **Fiabilité totale** : Calculs précis, pas de bugs
- **Maintenabilité simple** : Mises à jour via CSV
- **Évolutivité** : Architecture extensible

---

## ⚠️ DIRECTIVES CRITIQUES - RESPECT OBLIGATOIRE

### 🔴 Règles de Développement Non-Négociables

#### 📁 Gestion des Fichiers
- **JAMAIS créer de nouveaux fichiers** sauf si absolument nécessaire
- **TOUJOURS privilégier la modification** des fichiers existants (CSV, CSS, JS)
- **Nettoyer et optimiser** : Consolidation du code, élimination redondances
- **Réutilisation maximale** : Une fonction = un endroit, utilisée partout

#### 🏗️ Architecture & Patterns
- **Patterns obligatoires** : Module pattern, Observer pour événements
- **Clean Code strict** : Fonctions <30 lignes, noms explicites, responsabilité unique
- **Documentation française** : Commentaires, messages d'erreur en français
- **Orienté fonctionnel** : Privilégier composition à héritage

#### 🌐 Standards Web & UX
- **Accessibilité WCAG 2.1** : Navigation clavier, contraste, ARIA
- **Performance Web Vitals** : LCP <2.5s, FID <100ms, CLS <0.1
- **Progressive Enhancement** : Fonctionnel sans JS (contenu de base)
- **Mobile First** : Design responsive natif

#### 🔒 Autonomie & Sécurité Absolue
- **Site 100% statique** : Aucune dépendance serveur dynamique
- **Assets locaux complets** : Images, polices, scripts hébergés
- **AUCUNE fuite données** : Pas de tracking, analytics, télémétrie
- **Mode offline intégral** : Fonctionnement sans internet

#### 🚫 Interdictions Absolues
- **Hardcodage interdit** : Toutes valeurs dans CSV configurables
- **CDN/APIs externes interdits** : Tout local, aucun appel réseau
- **Données simulées interdites** : Informations réelles EDS uniquement
- **Frameworks lourds interdits** : Vanilla JS/CSS, bibliothèques minimales

#### ✅ Validation Obligatoire
- **Tests automatisés** : Smoke tests, validation liens
- **Configuration externalisée** : CSV pour tous paramètres
- **Documentation complète** : README, AGENTS.md, commentaires français
- **Performance mesurée** : Lighthouse >90, temps chargement <2s

**CES RÈGLES SONT NON-NÉGOCIABLES ET DOIVENT ÊTRE RESPECTÉES À 100%**

---

## 🏢 Spécialisation EDS Québec

### 🔋 Expertise Batteries Lithium
- **Technologie LiFePO₄** : Chimie la plus sûre et durable
- **Solutions 48V** : Standard golf avec optimisations propriétaires
- **Fabrication québécoise** : Contrôle qualité et support local
- **Garanties étendues** : Confiance produit, différenciation marché

### ⚡ Avantages Concurrentiels
- **ROI démontrable** : Calculateurs précis avec données réelles
- **Durabilité prouvée** : 8+ ans vs 3-4 ans batteries plomb
- **Performance constante** : Pas de dégradation tension en décharge
- **Maintenance minimale** : Économies opérationnelles substantielles

### 🎯 Audiences Cibles
- **Directeurs terrains golf** : ROI, réduction coûts opérationnels
- **Gérants équipement** : Fiabilité, maintenance simplifiée
- **Décideurs financiers** : TCO, amortissement, cash-flow
- **Équipes techniques** : Spécifications, installation, support

**Note** : Cette présentation nécessite une compréhension approfondie des enjeux de l'industrie du golf ET des technologies batteries pour transformer les prospects en clients convaincus par la supériorité technique et économique des solutions EDS Québec.