# 📋 Système de Sondages OrIA

**Version 1.0.0** - Système de sélection des requis MVP

---

## 📖 Description

Système autonome de sondages interactifs permettant de sélectionner les requis fonctionnels pour le MVP d'OrIA. Inspiré du lecteur de manuscrits, adapté pour des tableaux QCM avec sauvegarde personnalisée.

### Fonctionnalités Principales

✅ **Lecture de sondages Markdown** - Parsing complet avec support des tableaux
✅ **Tableaux QCM interactifs** - Cases à cocher pour chaque requis
✅ **Sauvegarde personnalisée** - Format `Sondage-NomUtilisateur.json`
✅ **Chargement de réponses** - Reprendre là où vous étiez
✅ **Navigation intuitive** - Onglets + navigation par sections
✅ **Synchronisation temps réel** - Sauvegarde locale automatique
✅ **Multi-utilisateurs** - Chaque personne peut avoir sa version

---

## 🏗️ Architecture

```
Sondage/
├── index.php               # Interface principale
├── api.php                 # API REST backend
├── assets/
│   ├── css/
│   │   └── survey.css      # Styles complets
│   └── js/
│       ├── survey.js       # Logique principale
│       └── marked.min.js   # Parser Markdown
├── sondages/               # Sondages .md disponibles
│   └── SONDAGE_ORIA_MVP_4_MODULES.md
├── reponses/               # Réponses sauvegardées .json
└── README.md
```

---

## 🚀 Installation

### Prérequis
- PHP 8.0+ avec extensions : `json`, `fileinfo`
- Serveur web (Apache, Nginx, PHP Built-in)
- Navigateur moderne (Chrome, Firefox, Edge)

### Étapes

1. **Cloner ou télécharger** le dossier `Sondage/`

2. **Configurer les permissions** (Linux/Mac uniquement)
   ```bash
   chmod 755 Sondage
   chmod 755 Sondage/sondages
   chmod 775 Sondage/reponses
   ```

3. **Démarrer le serveur local**
   ```bash
   cd Sondage
   php -S localhost:8080
   ```

4. **Ouvrir dans le navigateur**
   ```
   http://localhost:8080
   ```

---

## 📝 Format des Sondages

### Structure Markdown

Les sondages utilisent des **tableaux Markdown** avec un format spécifique pour les QCM.

#### Exemple de tableau de requis

```markdown
## MODULE 1 : COMMUNICATION

### 1.1 Demandes de Congés

| ID | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité | Spécifique |
|---|---|---|---|---|---|---|---|---|---|---|---|
| COM-001 | Soumettre une demande de congé | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | Obligatoire | Simple | ☐ |
| COM-002 | Approuver ou rejeter une demande | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ... | ... | ... | ... | Obligatoire | Simple | ☐ |
```

### Colonnes du Tableau

1. **ID** : Identifiant unique du requis (ex: `COM-001`)
2. **Description** : Description détaillée de la fonctionnalité
3. **MVP** : Case à cocher pour inclure dans le MVP
4-9. **Rôles** : 6 rôles avec 6 actions chacun (C, L, E, S, X, V)
   - **C** : Créer
   - **L** : Lire
   - **E** : Éditer
   - **S** : Supprimer
   - **X** : eXporter
   - **V** : Valider
10. **Priorité** : Obligatoire / Optionnel / Avancé
11. **Complexité** : Simple / Moyen / Complexe
12. **Spécifique** : Case à cocher pour requis spécifique CHSLD

### Conversion Automatique

Le système convertit automatiquement :
- `☐` → Case à cocher interactive
- `☐C ☐L ☐E ☐S ☐X ☐V` → 6 cases à cocher pour les actions du rôle

---

## 💾 Sauvegarde et Chargement

### Workflow de Sauvegarde

1. **Cocher les requis** souhaités dans le tableau
2. **Cliquer sur "Sauvegarder"**
3. **Entrer votre nom** (ex: `Mathieu`)
4. **Confirmer** → Fichier créé : `Sondage-ORIA_MVP-Mathieu_2025-01-15_14-30-00.json`

### Format de Sauvegarde JSON

```json
{
  "user": "Mathieu",
  "survey": "SONDAGE_ORIA_MVP_4_MODULES",
  "saved_at": "2025-01-15T14:30:00-05:00",
  "version": "1.0.0",
  "responses": {
    "COM-001": {
      "mvp": true,
      "role_Admin_C": true,
      "role_Admin_L": true,
      "role_Gestionnaire_C": false,
      "role_Gestionnaire_L": true,
      ...
      "specific": false
    },
    "COM-002": { ... }
  }
}
```

### Chargement de Réponses

1. **Cliquer sur "Charger"**
2. **Sélectionner un fichier** dans la liste
3. **Cliquer sur "📂 Charger"**
4. Les cases à cocher sont **automatiquement remplies**

---

## 🔌 API REST

### Endpoints Disponibles

#### `GET /api.php?action=list`
Liste tous les sondages disponibles (fichiers `.md`)

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "name": "SONDAGE_ORIA_MVP_4_MODULES",
      "file": "SONDAGE_ORIA_MVP_4_MODULES.md",
      "slug": "sondage-oria-mvp-4-modules",
      "size": 450000,
      "modified": 1736962800
    }
  ]
}
```

#### `GET /api.php?action=survey&name=NomSondage`
Récupère le contenu d'un sondage

**Réponse :**
```json
{
  "success": true,
  "data": {
    "name": "SONDAGE_ORIA_MVP_4_MODULES",
    "file": "SONDAGE_ORIA_MVP_4_MODULES.md",
    "content": "# SONDAGE ORIA MVP...",
    "size": 450000
  }
}
```

#### `POST /api.php?action=save`
Sauvegarde les réponses d'un utilisateur

**Corps de requête :**
```json
{
  "user": "Mathieu",
  "survey": "SONDAGE_ORIA_MVP_4_MODULES",
  "responses": { ... }
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "file": "Sondage-ORIA_MVP-Mathieu_2025-01-15_14-30-00.json",
    "path": "/path/to/file.json",
    "size": 15000
  }
}
```

#### `GET /api.php?action=load&file=NomFichier.json`
Charge les réponses d'un utilisateur

#### `GET /api.php?action=list-saved`
Liste toutes les réponses sauvegardées

#### `DELETE /api.php?action=delete&file=NomFichier.json`
Supprime une réponse sauvegardée

---

## 🎨 Personnalisation

### Variables CSS

Le fichier `assets/css/survey.css` contient des variables CSS pour personnalisation facile :

```css
:root {
  --color-primary: #2563eb;      /* Bleu principal */
  --color-secondary: #8b5cf6;    /* Violet secondaire */
  --color-accent: #10b981;       /* Vert accent */
  --color-warning: #f59e0b;      /* Orange avertissement */
  --color-danger: #ef4444;       /* Rouge danger */
}
```

### Ajouter un Nouveau Sondage

1. **Créer un fichier `.md`** dans `Sondage/sondages/`
2. **Respecter le format** des tableaux de requis
3. **Recharger la page** → Le sondage apparaît automatiquement

---

## 🔒 Sécurité

### Mesures Implémentées

✅ **Validation stricte** des entrées utilisateur
✅ **Protection path traversal** (pas de `../`)
✅ **Échappement XSS** de toutes les sorties
✅ **Headers sécurisés** (`X-Content-Type-Options`, `X-Frame-Options`)
✅ **JSON-only API** avec validation JSON_THROW_ON_ERROR
✅ **Sanitization** des noms de fichiers/utilisateurs

### Recommandations Production

- **HTTPS obligatoire** en production
- **Authentification** avant accès (ajouter login)
- **Limitation de taux** (rate limiting) sur l'API
- **Backup régulier** du dossier `reponses/`

---

## 📊 Sondage ORIA MVP Inclus

Le sondage principal contient **340 requis fonctionnels** organisés en **4 modules** :

### MODULE 1 : COMMUNICATION (83 requis)
- Demandes de congés
- Absences maladie
- Échanges de quarts
- Rapports d'incident
- Babillard/Annonces
- Messagerie interne
- Notifications
- Collaboration d'équipe

### MODULE 2 : GESTION DES HORAIRES (93 requis)
- Création et planification
- Assignation employés
- Quarts ouverts/Volontariat
- Disponibilités et préférences
- Visualisation calendrier
- Détection conflits
- Exportation horaires
- Historique modifications
- **Pointage et présence** (NOUVEAU)
- **Gestion heures supplémentaires** (NOUVEAU)

### MODULE 3 : GESTIONNAIRE (93 requis)
- Gestion employés
- Gestion lieux
- Gestion équipes
- Gestion tâches
- Gestion patients CHSLD
- Rapports et KPI
- **Gestion des remplacements** (NOUVEAU)
- **Prévisions et budgétisation** (NOUVEAU)

### MODULE 4 : ADMINISTRATION ET BIEN-ÊTRE (71 requis)
- Configuration globale
- Types et référentiels
- Sécurité et permissions
- Règles métier
- Intégrations
- Bien-être avec IA (13 requis)
- Analyse passive IA (9 requis)
- **Sauvegarde et archivage** (NOUVEAU)
- **Conformité et juridique** (NOUVEAU)

---

## 🛠️ Développement

### Technologies Utilisées

- **Backend** : PHP 8.0+ (Programmation fonctionnelle pure)
- **Frontend** : Vanilla JavaScript ES6+ (Classes orientées objet)
- **Styles** : CSS3 avec variables CSS et Grid/Flexbox
- **Parser Markdown** : marked.js v11.1.1
- **API** : REST JSON avec réponses standardisées

### Structure du Code JavaScript

```javascript
class SurveyViewer {
  constructor()              // Initialisation
  loadSurveys()              // Chargement liste sondages
  switchSurvey()             // Changement de sondage
  loadSurveyContent()        // Chargement contenu
  renderSurvey()             // Affichage avec parsing MD
  convertTablesToQCM()       // Conversion tableaux → QCM
  createCheckbox()           // Création cases à cocher
  attachCheckboxListeners()  // Événements checkboxes
  saveResponses()            // Sauvegarde serveur
  loadSavedResponses()       // Chargement réponses
  saveLocalResponses()       // Sauvegarde localStorage
  restoreLocalResponses()    // Restauration localStorage
  applyResponsesToUI()       // Application réponses → UI
}
```

---

## 📚 Utilisation Typique

### Scénario : Sélection MVP par une équipe

1. **Mathieu** ouvre le sondage OrIA MVP
2. Il coche les requis qu'il juge essentiels pour le MVP
3. Il clique sur "Sauvegarder" et entre son nom
4. Un fichier `Sondage-ORIA_MVP-Mathieu_[date].json` est créé

5. **Sophie** ouvre le même sondage
6. Elle fait ses propres sélections
7. Elle sauvegarde sous `Sondage-ORIA_MVP-Sophie_[date].json`

8. **L'équipe** se réunit et compare les fichiers
9. Chacun peut **charger sa version** pour discussion
10. **Décision finale** sur les requis MVP à implémenter

---

## 🐛 Dépannage

### Problème : Sondage ne s'affiche pas
- Vérifier que le fichier `.md` est dans `sondages/`
- Vérifier les permissions de lecture
- Ouvrir la console navigateur pour erreurs JavaScript

### Problème : Sauvegarde échoue
- Vérifier permissions d'écriture sur `reponses/`
- Vérifier que PHP peut créer des fichiers
- Augmenter `upload_max_filesize` si sondage très volumineux

### Problème : Cases à cocher ne se cochent pas
- Effacer cache navigateur
- Vérifier que JavaScript est activé
- Vérifier format du tableau Markdown (colonnes manquantes ?)

---

## 📈 Améliorations Futures

- [ ] Exportation Excel/CSV des réponses
- [ ] Comparaison visuelle de plusieurs réponses
- [ ] Statistiques agrégées (% sélection par requis)
- [ ] Commentaires par requis
- [ ] Authentification multi-utilisateurs
- [ ] Mode collaboratif temps réel
- [ ] Notifications par email de sauvegarde
- [ ] Historique des versions par utilisateur
- [ ] Dark mode

---

## 📄 Licence

Propriétaire - Geek & Dragon / OrIA
© 2025 Brujah - Tous droits réservés

---

## 👤 Auteur

**Brujah**
Geek & Dragon - OrIA Project
*Québec, Canada*

---

**Version 1.0.0** - Janvier 2025
