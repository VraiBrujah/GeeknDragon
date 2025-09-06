# 🏠 Application de Suivi Construction Maison - Québec

## 📌 Description
Application web **100% autonome** (aucun serveur requis) pour le suivi complet de construction d'une maison au Québec avec gestion de la main-d'œuvre, des matériaux, et des coûts.

## ✅ Fonctionnalités

### 👷 Gestion Main-d'œuvre
- Artisans/travailleurs autonomes avec spécialités
- Taux horaires TTC ou HT+taxes
- Calcul automatique TPS/TVQ si applicable
- Suivi des soldes dus par artisan

### ⏰ Pointage Quotidien
- Calendrier en français
- Calcul automatique des heures
- Photos de progression
- Notes par étape de construction

### 📦 Gestion Matériaux
- Factures fournisseurs québécois
- Calcul automatique TPS (5%) + TVQ (9.975%)
- Catégories de matériaux
- Scan/photo des factures

### 💰 Paiements
- Acomptes main-d'œuvre
- Paiements fournisseurs
- Séparation claire des coûts
- Suivi des soldes

### 📊 Tableau de Bord
- KPIs en temps réel
- Graphiques interactifs (Chart.js)
- Budget vs Réel
- Avancement global

### 📄 Rapports & Exports
- PDF Banque (prêt hypothécaire)
- PDF Assurance habitation
- PDF Comptabilité Québec
- Export CSV complet
- Backup/Restore JSON

## 🚀 Installation

**AUCUNE INSTALLATION REQUISE!**

1. Télécharger tous les fichiers du projet
2. **Ouvrir directement `index.html` dans votre navigateur**
3. C'est tout! L'application fonctionne immédiatement

## 💾 Données

- **100% LOCAL** : Toutes les données restent sur votre ordinateur
- **LocalStorage** : Sauvegarde automatique en temps réel
- **IndexedDB** : Stockage des photos
- **Pas de serveur** : Aucune connexion internet requise
- **Pas de base de données** : Tout est en JSON local

## 🎯 Utilisation

### Première utilisation
1. Ouvrir `index.html` dans Chrome, Firefox, Edge ou Safari
2. Aller dans "Artisans" et ajouter vos travailleurs
3. Enregistrer les pointages quotidiens
4. Ajouter les factures de matériaux
5. Le tableau de bord se met à jour automatiquement

### Navigation
- **Tableau de bord** : Vue d'ensemble des coûts et avancement
- **Artisans** : Gérer l'équipe de construction
- **Pointage** : Enregistrer les heures quotidiennes
- **Matériaux** : Gérer les factures fournisseurs
- **Paiements** : Enregistrer les versements
- **Rapports** : Générer PDF et exports

## 📂 Structure des fichiers

```
pointage/
├── index.html          # Fichier principal (OUVRIR CELUI-CI)
├── script.js           # Logique de l'application
├── style.css           # Styles (thème sombre)
├── test.html           # Page de tests fonctionnels
├── vendor/             # Bibliothèques
│   ├── bulma.min.css   # Framework CSS
│   ├── chart.min.js    # Graphiques
│   ├── jspdf.min.js    # Export PDF
│   ├── flatpickr.*     # Calendrier
│   └── html2canvas.*   # Captures d'écran
├── data/               # Données JSON initiales
├── photos/             # Stockage photos
└── rapports/           # Exports PDF

```

## 🛠️ Technologies utilisées

- **HTML5/CSS3/JavaScript** vanilla (pas de framework)
- **Bulma CSS** : Interface moderne
- **Chart.js** : Graphiques interactifs
- **jsPDF** : Génération PDF
- **Flatpickr** : Calendrier français
- **LocalStorage** : Sauvegarde données
- **IndexedDB** : Stockage photos

## 💡 Conseils

### Sauvegarde des données
- Utilisez régulièrement le bouton "Backup" pour sauvegarder vos données
- Le fichier JSON généré contient toutes vos données
- Pour restaurer, utilisez le bouton "Restore" et sélectionnez votre fichier de backup

### Performance
- L'application charge en moins de 3 secondes
- Sauvegarde automatique instantanée
- Fonctionne hors ligne après le premier chargement

### Compatibilité
- Chrome (recommandé)
- Firefox
- Edge
- Safari
- Compatible mobile/tablette

## 🔒 Sécurité

- **100% privé** : Aucune donnée n'est envoyée sur internet
- **Stockage local** : Données uniquement sur votre ordinateur
- **Pas de compte** : Aucune authentification requise
- **Backup local** : Vous contrôlez vos sauvegardes

## 📞 Support

Pour toute question ou problème :
1. Vérifiez la console du navigateur (F12) pour les erreurs
2. Testez avec `test.html` pour diagnostiquer
3. Faites un backup avant toute manipulation importante

## 📜 Licence

Application gratuite pour usage personnel et commercial.

---

**Développé pour les entrepreneurs en construction du Québec** 🇨🇦