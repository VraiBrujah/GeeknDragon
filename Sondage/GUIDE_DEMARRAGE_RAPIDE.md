# 🚀 Guide de Démarrage Rapide - Système de Sondages OrIA

**Répertoire de Travail Actuel** : `E:\GitHub\GeeknDragon\Sondage`

---

## 📋 Ce qui a été créé

Un **système complet de sondages interactifs** autonome, similaire au lecteur de livres mais adapté pour des tableaux QCM avec sauvegarde personnalisée.

### Fichiers Principaux

```
E:\GitHub\GeeknDragon\Sondage/
├── index.php                        ✅ Interface utilisateur complète
├── api.php                          ✅ API REST backend (8 endpoints)
├── README.md                        ✅ Documentation complète
├── GUIDE_DEMARRAGE_RAPIDE.md       ✅ Ce fichier
├── .htaccess                        ✅ Configuration Apache
│
├── assets/
│   ├── css/
│   │   └── survey.css              ✅ 900+ lignes de styles
│   └── js/
│       ├── survey.js               ✅ 600+ lignes de logique
│       └── marked.min.js           ✅ Parser Markdown
│
├── sondages/
│   ├── SONDAGE_ORIA_MVP_4_MODULES.md  ✅ 340 requis complets
│   └── TEST_SIMPLE.md                  ✅ 10 requis pour tests
│
└── reponses/                        ✅ Dossier pour sauvegardes
    └── (vide initialement)
```

---

## ⚡ Démarrage en 3 Étapes

### Étape 1 : Démarrer le Serveur

Ouvrir un terminal dans le dossier `Sondage/` :

```bash
cd E:\GitHub\GeeknDragon\Sondage
php -S localhost:8080
```

### Étape 2 : Ouvrir le Navigateur

```
http://localhost:8080
```

### Étape 3 : Commencer à Utiliser

1. **Sélectionner un sondage** (onglet en haut)
2. **Cocher les requis** souhaités
3. **Cliquer "Sauvegarder"**
4. **Entrer votre nom** (ex: Mathieu)
5. **Confirmer** → Fichier créé automatiquement !

---

## 🎯 Fonctionnalités Principales

### ✅ Lecture de Sondages Markdown
- Parsing automatique des fichiers `.md`
- Support complet des tableaux
- Navigation par sections (sidebar)
- Scroll fluide entre sections

### ✅ Tableaux QCM Interactifs
- Conversion automatique `☐` → checkbox interactive
- 6 rôles avec 6 actions chacun (36 checkboxes par requis)
- Case MVP pour sélection rapide
- Case "Spécifique" pour contextes particuliers

### ✅ Sauvegarde Personnalisée
- Format : `Sondage-[NomSondage]-[NomUser]_[Date].json`
- Sauvegarde locale automatique (localStorage)
- Aucune perte de données même si navigateur crash
- Modal élégant avec validation

### ✅ Chargement de Réponses
- Liste tous les sondages sauvegardés
- Affiche : nom utilisateur, sondage, date
- Boutons : Charger / Supprimer
- Restauration instantanée de toutes les cases

### ✅ Multi-Utilisateurs
- Chaque personne peut avoir sa version
- Fichiers séparés par utilisateur et date
- Comparaison facile des choix d'équipe

---

## 📝 Format du Sondage ORIA MVP

Le sondage principal contient **340 requis** organisés en **4 modules** :

### Structure des Tableaux

```markdown
| ID | Description | MVP | Admin | Gest. | Superv. | Employé | Patient | Famille | Priorité | Complexité | Spéc. |
|---|---|---|---|---|---|---|---|---|---|---|---|
| COM-001 | Description du requis... | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ... | ... | ... | ... | ... | Oblig. | Simple | ☐ |
```

### Colonnes Automatiquement Converties

1. **MVP** : `☐` → Checkbox "Inclure dans MVP"
2. **Rôles (6 colonnes)** : `☐C ☐L ☐E ☐S ☐X ☐V` → 6 checkboxes interactives
   - **C** = Créer
   - **L** = Lire
   - **E** = Éditer
   - **S** = Supprimer
   - **X** = eXporter
   - **V** = Valider
3. **Spécifique** : `☐` → Checkbox "Requis spécifique CHSLD"

---

## 🧪 Tester le Système

### Option 1 : Sondage de Test Simple (10 requis)

Sélectionner l'onglet **"TEST_SIMPLE"** en haut de la page.

Ce sondage contient seulement 10 requis pour valider rapidement toutes les fonctionnalités.

### Option 2 : Sondage ORIA Complet (340 requis)

Sélectionner l'onglet **"SONDAGE_ORIA_MVP_4_MODULES"**.

Ce sondage contient tous les requis pour sélectionner le MVP d'OrIA.

---

## 💾 Exemple de Sauvegarde

### Workflow Complet

1. **Ouvrir** : `http://localhost:8080`
2. **Sélectionner** : Onglet "SONDAGE_ORIA_MVP_4_MODULES"
3. **Cocher** : Requis COM-001, COM-002, COM-003
4. **Cocher** : Actions Admin (C, L, E) pour chaque requis
5. **Cliquer** : Bouton "💾 Sauvegarder"
6. **Entrer** : "Mathieu"
7. **Confirmer** : Bouton "Sauvegarder"

### Résultat

Fichier créé : `E:\GitHub\GeeknDragon\Sondage\reponses\Sondage-ORIA_MVP-Mathieu_2025-01-15_14-30-00.json`

Contenu :
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
      "role_Admin_E": true,
      "specific": false
    },
    "COM-002": { ... },
    "COM-003": { ... }
  }
}
```

---

## 🔄 Charger des Réponses Sauvegardées

1. **Cliquer** : Bouton "📂 Charger"
2. **Voir** : Liste de tous les fichiers sauvegardés
3. **Sélectionner** : Fichier souhaité
4. **Cliquer** : Bouton "📂 Charger" à côté du fichier
5. **Résultat** : Toutes les cases sont cochées automatiquement

---

## 🎨 Personnalisation

### Ajouter un Nouveau Sondage

1. **Créer** un fichier `.md` dans `E:\GitHub\GeeknDragon\Sondage\sondages\`
2. **Respecter le format** des tableaux (voir `TEST_SIMPLE.md`)
3. **Recharger** la page → Sondage apparaît automatiquement !

### Modifier les Couleurs

Éditer `assets/css/survey.css` :

```css
:root {
  --color-primary: #2563eb;      /* Changer cette couleur */
  --color-secondary: #8b5cf6;    /* Et celle-ci */
}
```

---

## 🔧 Dépannage

### Problème : "Aucun sondage disponible"

**Cause** : Fichiers `.md` absents ou mal placés

**Solution** :
1. Vérifier que `sondages/SONDAGE_ORIA_MVP_4_MODULES.md` existe
2. Vérifier les permissions de lecture du dossier
3. Recharger la page (Ctrl+F5)

### Problème : "Erreur sauvegarde"

**Cause** : Dossier `reponses/` non accessible en écriture

**Solution Windows** :
1. Clic droit sur `E:\GitHub\GeeknDragon\Sondage\reponses`
2. Propriétés → Sécurité
3. Modifier → Ajouter "Tout le monde" → Contrôle total
4. Appliquer

**Solution Linux/Mac** :
```bash
chmod 775 reponses/
```

### Problème : Cases à cocher ne fonctionnent pas

**Cause** : JavaScript désactivé ou erreur de parsing

**Solution** :
1. Ouvrir console développeur (F12)
2. Vérifier erreurs JavaScript
3. Vérifier que `marked.min.js` est chargé
4. Effacer cache navigateur (Ctrl+Shift+Delete)

---

## 📊 Statistiques du Projet

### Code Créé

- **PHP** : ~500 lignes (API + Index)
- **JavaScript** : ~600 lignes (Logique complète)
- **CSS** : ~900 lignes (Styles modernes)
- **Markdown** : ~3000 lignes (Sondages)
- **Documentation** : ~800 lignes (README + Guides)

**Total** : ~5800 lignes de code !

### Fonctionnalités

- ✅ 8 endpoints API REST
- ✅ Parsing Markdown complet
- ✅ Conversion tableaux → QCM
- ✅ 340 requis OrIA MVP
- ✅ Sauvegarde/Chargement JSON
- ✅ Navigation multi-niveaux
- ✅ Responsive mobile
- ✅ Sécurité complète
- ✅ Documentation exhaustive

---

## 🎓 Utilisation en Équipe

### Scénario Réaliste

**Lundi matin** : Réunion de sélection MVP

1. **Mathieu** (Product Owner)
   - Ouvre le sondage OrIA MVP
   - Coche les requis essentiels selon sa vision
   - Sauvegarde → `Sondage-ORIA_MVP-Mathieu_[date].json`

2. **Sophie** (Lead Dev)
   - Ouvre le même sondage
   - Coche les requis techniquement réalisables en 3 mois
   - Sauvegarde → `Sondage-ORIA_MVP-Sophie_[date].json`

3. **David** (Designer UX)
   - Ouvre le sondage
   - Coche les requis impactant l'expérience utilisateur
   - Sauvegarde → `Sondage-ORIA_MVP-David_[date].json`

4. **Réunion de consolidation**
   - Chaque personne charge sa version à tour de rôle
   - Discussion sur les différences
   - Création d'une version finale consensuelle
   - Sauvegarde → `Sondage-ORIA_MVP-Consensus_[date].json`

---

## 📈 Prochaines Étapes

### Immédiatement

1. ✅ Tester le système avec `TEST_SIMPLE.md`
2. ✅ Valider toutes les fonctionnalités (checklist dans README)
3. ✅ Faire une première sélection sur `SONDAGE_ORIA_MVP_4_MODULES.md`

### Court Terme (optionnel)

- Ajouter authentification multi-utilisateurs
- Exporter les réponses en Excel/CSV
- Statistiques agrégées (% sélection par requis)
- Mode comparaison de plusieurs réponses

### Long Terme (optionnel)

- Mode collaboratif temps réel (WebSocket)
- Commentaires par requis
- Historique des versions
- Notifications email automatiques

---

## 🎉 Félicitations !

Vous disposez maintenant d'un **système complet de sondages interactifs** pour sélectionner les requis MVP d'OrIA.

Le système est :
- ✅ **Autonome** (pas de dépendances externes)
- ✅ **Sécurisé** (validation, sanitization, headers)
- ✅ **Performant** (cache local, parsing optimisé)
- ✅ **Extensible** (ajouter de nouveaux sondages facilement)
- ✅ **Documenté** (README + guides + commentaires)

---

## 📞 Support

Pour toute question ou problème :

1. **Consulter** : `README.md` (documentation complète)
2. **Vérifier** : Console développeur (F12) pour erreurs JavaScript
3. **Tester** : `TEST_SIMPLE.md` pour isoler les problèmes

---

**Bon travail de sélection MVP !** 🚀

*Brujah - Geek & Dragon - OrIA Project*
*Janvier 2025*
