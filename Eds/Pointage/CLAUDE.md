# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet - Système Suivi Construction Maison Québec

Application web complète (100% local) pour le suivi de construction d'UNE MAISON au Québec avec gestion de la main-d'œuvre (artisans/travailleurs autonomes), des matériaux (factures fournisseurs), des taxes québécoises (TPS 5% + TVQ 9.975%), et du suivi financier complet. Hébergement prévu sur HostPapa en fichiers statiques.

## Architecture Technique

### Technologies principales recommandées
- **Frontend** : HTML5 + CSS3 (Flexbox/Grid) + JavaScript Vanilla
- **Framework CSS** : Bootstrap 5 ou Bulma (léger)
- **Calendrier** : Flatpickr (6kb) - français/anglais
- **Stockage** : LocalStorage natif (JSON) + IndexedDB pour photos
- **Photos** : HTML5 File API + Canvas pour redimensionnement
- **Graphiques** : Chart.js (65kb) - main-d'œuvre vs matériaux
- **Export PDF** : jsPDF (150kb) + html2canvas (90kb)
- **Export Data** : CSV natif JavaScript + JSON backup

### Structure de fichiers maison Québec
```
maison-quebec/
├── index.html                  // Page principale tableau de bord
├── style.css                  // Thème sombre moderne + responsive
├── script.js                  // Logique complète + calculs taxes QC
├── config-maison.json         // Configuration projet maison
├── artisans.json             // Équipe construction (travailleurs autonomes)
├── pointages.json            // Temps travaux quotidiens
├── factures-materiaux.json   // Factures fournisseurs QC avec TPS/TVQ
├── paiements.json            // Acomptes main-d'œuvre + paiements matériaux
├── etapes-construction.json  // Étapes avec budgets et inspections
├── photos/
│   ├── progression/          // Photos avancement maison
│   └── factures/            // Scans factures fournisseurs
├── rapports/                 // Exports PDF
└── vendor/                   // Chart.js, jsPDF, Flatpickr
```

## Modèles de données

### Artisan/Travailleur Autonome Québec
```json
{
  "id": "1, 2, 3...",
  "nom": "Tremblay",
  "prenom": "Jean",
  "specialite": "Charpentier-menuisier|Électricien|Plombier|Maçon|Couvreur",
  "taux_horaire_ttc": 38.00,
  "taxes_incluses": true,
  "calcul_taxes_actif": false,
  "taux_horaire_ht": 0.00,
  "tps_applicable": false,
  "tvq_applicable": false,
  "statut": "actif|termine|en_attente",
  "telephone": "514-555-1234",
  "debut_contrat": "2025-03-01",
  "fin_prevue": "2025-10-15",
  "type_travailleur": "autonome",
  "notes_facturation": "Taux négocié tout compris"
}
```

### Pointage Travaux Maison
```json
{
  "id": "1, 2, 3...",
  "artisan_id": 1,
  "date": "2025-01-15",
  "heure_debut": "08:00",
  "heure_fin": "16:30",
  "temps_pause_minutes": 60,
  "heures_travaillees": 7.5,
  "taux_horaire_ttc": 38.00,
  "taxes_incluses": true,
  "calcul_taxes_actif": false,
  "taux_horaire_ht": 0.00,
  "tps_5_pct": 0.00,
  "tvq_9975_pct": 0.00,
  "taxes_totales": 0.00,
  "cout_main_oeuvre_ttc": 285.00,
  "type_travaux": "Installation charpente toiture",
  "etape_maison": "Charpente et Structure",
  "notes": "Pose poutres principales terminée - bon avancement",
  "photos": ["progression_charpente_15jan.jpg"],
  "termine": true
}
```

### Facture Matériaux Québec
```json
{
  "id": "1, 2, 3...",
  "date_achat": "2025-01-15",
  "fournisseur": "Réno-Dépôt Laval",
  "numero_facture": "RD-2025-001234",
  "numero_tps": "123456789 RT0001",
  "numero_tvq": "1234567890 TQ0001",
  "montant_ht": 2450.00,
  "tps_5_pct": 122.50,
  "tvq_9975_pct": 244.38,
  "taxes_totales": 366.88,
  "montant_total": 2816.88,
  "categorie": "Bois d'œuvre charpente",
  "etape_maison": "Charpente et Structure",
  "description": "Poutres 2x10, planches OSB, connecteurs Simpson",
  "photo_facture": "facture_renodepot_15jan.jpg",
  "notes": "Livraison directe chantier Laval",
  "payee": true,
  "eligible_remboursement_tps_tvq": true
}
```

### Configuration Projet Maison
```json
{
  "id": "config_maison",
  "nom_projet": "Ma Maison - 123 Rue Principale, Laval QC",
  "adresse_complete": "123 Rue Principale, Laval, QC H7S 1A1",
  "type_construction": "Maison unifamiliale neuve",
  "superficie_carree": 1850,
  "budget_total_estime": 450000.00,
  "budget_main_oeuvre": 180000.00,
  "budget_materiaux": 270000.00,
  "date_debut_prevue": "2025-03-01",
  "date_fin_prevue": "2025-10-15",
  "permis_construction": "2025-PC-LAV-0001",
  "licence_rbq": "5678-1234-01"
}
```

## Fonctionnalités principales

### Main-d'œuvre (Travailleurs Autonomes)
1. **Gestion artisans** : CRUD avec spécialités Québec et taux horaires TTC/HT
2. **Pointage quotidien** : Calendrier + heures avec calculs taxes optionnels
3. **Calculs main-d'œuvre** : Coûts par artisan/spécialité avec TPS/TVQ si applicable

### Matériaux
4. **Factures fournisseurs** : Scan/photo avec calculs TPS 5% + TVQ 9.975%
5. **Catégories matériaux** : Bois, électricité, plomberie, isolation, etc.
6. **Suivi paiements** : Séparation claire matériaux vs main-d'œuvre

### Financier Global
7. **Dashboard maison** : Coûts temps réel (main-d'œuvre + matériaux)
8. **Graphiques Chart.js** : Répartition coûts, avancement, budget vs réel
9. **Exports PDF/CSV** : Rapports banque, assurance, comptabilité Québec

### Suivi Projet
10. **Étapes construction** : 8 phases avec budgets, durées, inspections
11. **Photos progression** : Documentation quotidienne avec notes
12. **Calcul avancement** : % global et par étape de la maison

## Contraintes techniques

- **100% local** : Aucune base de données, aucun serveur requis
- **Pas d'authentification** : Accès direct propriétaire uniquement
- **Sauvegarde temps réel** : LocalStorage + JSON automatique
- **Photos/factures** : IndexedDB pour stockage volumineux
- **Responsive design** : Compatible desktop/tablette/mobile
- **Performance** : Chargement < 3s, sauvegarde < 200ms
- **Thème sombre** : Interface moderne (#1a1a1a fond, #2d2d2d cartes)
- **Taxes Québec** : TPS 5% + TVQ 9.975% = 14.975% total
- **Monnaie** : Tous montants en dollars canadiens (CAD$)

## API JavaScript et Services

### StorageService (LocalStorage + IndexedDB)
```javascript
// Sauvegarde automatique JSON
saveArtisan(artisan)
savePointage(pointage)
saveFactureMateriau(facture)
savePaiement(paiement)
saveConfigMaison(config)
saveEtapeConstruction(etape)

// Photos/factures dans IndexedDB
savePhoto(photoBase64, type='progression'|'facture')
getPhotos(type, dateRange)
deletePhoto(photoId)
```

### TaxesQuebecService
```javascript
calculerTPS(montantHT)           // 5%
calculerTVQ(montantHT)           // 9.975%
calculerTaxesTotales(montantHT)  // 14.975%
calculerMontantTTC(montantHT)
extraireMontantHT(montantTTC)    // Reverse calculation
```

### CalculsFinanciersService
```javascript
// Main-d'œuvre
calculerCoutMainOeuvre(pointage, artisan)
calculerSoldeArtisan(artisanId)
genererRapportArtisan(artisanId, periode)

// Matériaux
calculerTotalFactures(categorie?)
calculerSoldeMateriaux()
genererRapportMateriaux(fournisseur?, periode)

// Global Maison
calculerCoutTotalMaison()
calculerEcartBudget()
calculerAvancementGlobal()
genererTableauBordMaison()
```

### ExportService
```javascript
// PDF avec jsPDF
exporterPDFBanque(donnees)
exporterPDFAssurance(donnees)
exporterPDFComptabilite(donnees)

// CSV/Excel
exporterCSVArtisans()
exporterCSVPointages(periode)
exporterCSVFactures(periode)

// Backup complet
exporterBackupJSON()
importerBackupJSON(file)
```

### GraphiquesService (Chart.js)
```javascript
genererGraphiqueRepartition()    // Pie: main-d'œuvre vs matériaux
genererGraphiqueAvancement()     // Bar: % par étape
genererGraphiqueBudget()         // Line: prévu vs réel
genererGraphiqueSpecialites()    // Bar: coûts par spécialité
```

## Déploiement HostPapa Québec

1. Build production (si utilisation Vite/bundler)
2. Upload FTP vers public_html
3. Configuration .htaccess pour SPA + cache
4. Activation HTTPS obligatoire + Gzip
5. Test fonctionnel complet avec données Québec
6. Vérification calculs taxes TPS/TVQ
7. Test responsive mobile/tablette

## Calculs spécifiques Québec

```javascript
// MAIN-D'ŒUVRE (Par défaut TTC, taxes optionnelles)
if (artisan.calcul_taxes_actif) {
  cout_ht = heures_travaillees * artisan.taux_horaire_ht
  tps = cout_ht * 0.05
  tvq = cout_ht * 0.09975
  cout_ttc = cout_ht + tps + tvq
} else {
  cout_ttc = heures_travaillees * artisan.taux_horaire_ttc
}

// MATÉRIAUX (Toujours HT + taxes Québec)
montant_ht = facture.montant_ht
tps = montant_ht * 0.05
tvq = montant_ht * 0.09975
taxes_totales = tps + tvq  // 14.975% total
montant_total = montant_ht + taxes_totales

// GLOBAL MAISON
COUT_TOTAL_MAISON = sum(main_oeuvre_ttc) + sum(materiaux_total)
PAYE_TOTAL = sum(acomptes_artisans) + sum(paiements_materiaux)
SOLDE_DU_TOTAL = COUT_TOTAL_MAISON - PAYE_TOTAL

// BUDGET vs RÉEL
ecart_budget = COUT_TOTAL_MAISON - config_maison.budget_total_estime
pourcentage_utilise = (COUT_TOTAL_MAISON / budget_total_estime) * 100
```

## Workflow de développement

### Phase 1: Setup & Base Maison
- Structure projet construction Québec
- CSS framework (Bulma) + thème sombre
- LocalStorage + IndexedDB pour photos
- Configuration projet maison

### Phase 2: Main-d'œuvre
- CRUD artisans/travailleurs autonomes
- Calendrier Flatpickr français
- Calculs TTC/HT avec taxes optionnelles
- Pointage quotidien par artisan

### Phase 3: Matériaux & Finance
- Module factures matériaux QC
- Calculs TPS/TVQ automatiques
- Paiements séparés (main-d'œuvre vs matériaux)
- Dashboard financier global maison

### Phase 4: Rapports & Export
- Graphiques Chart.js (répartition coûts)
- Export PDF avec jsPDF (banque/assurance)
- Photos progression avec notes
- Déploiement HostPapa Québec