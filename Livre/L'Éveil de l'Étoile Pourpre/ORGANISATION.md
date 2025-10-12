# Organisation du Projet - L'Éveil de l'Étoile Pourpre

**Date réorganisation** : 2025-10-12
**État** : ✅ Structure propre et uniformisée

---

## 📁 STRUCTURE ACTUELLE

```
E:\GitHub\GeeknDragon\Livre\L'Éveil de l'Étoile Pourpre\
│
├── 📄 Fichiers Racine (4 fichiers essentiels uniquement)
│   ├── 00_prologue.md                  # ⭐ Version finale (8.4/10)
│   ├── CLAUDE.md                       # 📋 Instructions éditoriales
│   ├── PERSONNAGES_REFERENCE.md        # 📚 Bible personnages/lieux/magie
│   └── README.md                       # 📖 Documentation projet
│
├── 📂 audit/ (Audits et rapports qualité)
│   ├── ANALYSE_INFLUENCES_STYLISTIQUES_PROLOGUE.md
│   ├── AUDIT_EDITORIAL_COMPLET.md
│   ├── AUDIT_EDITORIAL_INDEPENDANT_FINAL.md
│   ├── AUDIT_PHASE_4_VERS_10_SUR_10.md
│   ├── PLAN_OPTIMISATION_QI120_VERS_10SUR10.md
│   ├── RAPPORT_AUDIT_FINAL.md
│   ├── RAPPORT_CORRECTIONS_2025-10-10_FINAL.md
│   ├── RAPPORT_CORRECTIONS_APPELLATIONS.md
│   ├── RAPPORT_CORRECTIONS_FINALES_COMPLETE.md
│   └── RAPPORT_FINAL_AMELIORATIONS.md
│
├── 📂 backup/ (Sauvegardes)
│   ├── versions/
│   │   ├── 00_prologue_BACKUP_20251010_222610.md
│   │   ├── 00_prologue_V14.md
│   │   ├── 00_prologue_V15_SECTIONS_1-9_TRANSFORMEES.md
│   │   ├── INTERLUDE_01_LA_CHAMBRE_RITUELLE.md
│   │   ├── INTERLUDE_02_LE_SANG_ET_LES_SYMBOLES.md
│   │   ├── INTERLUDE_03_LAGONIE_DE_LA_METAMORPHOSE.md
│   │   ├── INTERLUDE_04_LA_PREMIERE_CHASSE.md
│   │   ├── INTERLUDE_05_LE_SERMENT_ETERNEL.md
│   │   ├── INTERLUDE_06_MILLE_ANNEES_ECOULEES.md
│   │   ├── 00_PROLOGUE_RESTRUCTURE.md
│   │   ├── 00_STRUCTURE_NARRATIVE_RESTRUCTUREE.md
│   │   └── CLAUDE_docs_projet_20251012.md
│   └── corrections/
│       └── 00_prologue_V15_SECTIONS_1-9_TRANSFORMEES_corrections.log
│
├── 📂 Brouillon/ (Brouillons de travail)
│
├── 📂 docs/ (Documentation projet)
│   ├── audits/
│   ├── guides/
│   │   ├── CONVENTION_NOMENCLATURE.md
│   │   ├── EXEMPLE_REECRITURE.md
│   │   ├── GUIDE_STYLISTIQUE.md
│   │   └── MATRICE_TRANSFORMATION_STYLISTIQUE.md
│   └── projet/
│       ├── CLAUDE.md                    # Influences stylistiques détaillées
│       ├── Document_Projet_Livre.md
│       ├── MEMOIRE_REDACTION_CHAPITRES.md
│       ├── PLAN_ACTION_EDITORIAL.md
│       ├── STATISTIQUES_PROJET.md
│       ├── SYNTHESES_NARRATIVES_COMPLETES.md
│       └── SYSTEME_MAGIQUE_CLARIFIE.md
│
├── 📂 Inspiration/ (31 chapitres brouillons)
│   ├── chapitre_01.md
│   ├── chapitre_02.md
│   └── ... (jusqu'à chapitre_31.md)
│
├── 📂 Livre/ (Chapitres et références univers)
│   ├── 00_prologue.md                   # Version ancienne (archivée)
│   ├── 00_prologue_V14.md
│   ├── 00_prologue_V15_SECTIONS_1-9_TRANSFORMEES.md
│   ├── CHAMPS_LEXICAUX_PERSONNAGES.md
│   ├── FICHES_REFERENCE_CANON.md
│   ├── magie.md                         # Système magique complet
│   ├── monde.md                         # Géographie Etheria
│   ├── personnages.md                   # Index personnages
│   ├── races.md                         # Éthériens, vampires, gorgones
│   └── societe.md                       # Structure sociale
│
├── 📂 scripts/ (60+ scripts Python utilitaires)
│   ├── audit_complet_final.py
│   ├── correction_complete.py
│   ├── analyser_adverbes.py
│   ├── analyser_qui.py
│   ├── batch_*.py                       # (40+ scripts transformations)
│   ├── count_cognition_verbs.py
│   └── ... (tous scripts Python déplacés ici)
│
├── 📂 temp/ (Fichiers temporaires)
│   ├── adverbes_temp.txt
│   ├── batch1_remplacements_qui.txt
│   ├── rapport_final_adverbes.txt
│   ├── rapport_reduction_adverbes.txt
│   ├── RAPPORT_FINAL_REDUCTION_ADVERBES.txt
│   ├── remplacements_log.txt
│   └── vrais_adverbes.txt
│
└── 📂 _Archive_Corrections_2025-10-10/ (Archive session ancienne)
    ├── backups/
    ├── rapports/
    ├── scripts/
    ├── scripts_repo/
    └── README.md
```

---

## 🎯 RÈGLES D'ORGANISATION

### Racine (4 fichiers UNIQUEMENT)
- ✅ Fichiers texte principaux actifs
- ✅ Documentation projet essentielle
- ❌ INTERDICTION : Scripts, backups, rapports, fichiers temporaires

### audit/
- ✅ Tous rapports qualité
- ✅ Tous audits éditoriaux
- ✅ Plans optimisation
- ✅ Analyses influences stylistiques

### backup/
- ✅ `versions/` : Anciennes versions prologue, interludes, restructurations
- ✅ `corrections/` : Logs corrections

### docs/
- ✅ `guides/` : Guides style, conventions nomenclature, exemples
- ✅ `projet/` : Influences stylistiques, mémoires, statistiques
- ✅ `audits/` : Audits spécifiques documentation

### Livre/
- ✅ Chapitres (versions multiples acceptées)
- ✅ Fiches référence univers (magie, monde, races, société)
- ✅ Champs lexicaux personnages

### scripts/
- ✅ Tous fichiers `.py`
- ✅ Audits automatiques
- ✅ Corrections batch
- ✅ Analyseurs

### temp/
- ✅ Fichiers `.txt` temporaires
- ✅ Logs transformations
- ✅ Rapports intermédiaires
- ⚠️ À nettoyer régulièrement

---

## 📋 CHEMINS RÉFÉRENCÉS DANS DOCUMENTATION

### Dans CLAUDE.md (racine)

```markdown
1. `PERSONNAGES_REFERENCE.md` → ✅ Racine
2. `docs/projet/CLAUDE.md` → ✅ Sous-dossier
3. `docs/guides/GUIDE_STYLISTIQUE.md` → ✅ Sous-dossier
```

### Dans docs/projet/CLAUDE.md

```markdown
- `PERSONNAGES_REFERENCE.md` → ✅ Racine (chemin relatif ../.. implicite)
- `docs/projet/CLAUDE.md` → ✅ Même dossier
- `docs/guides/GUIDE_STYLISTIQUE.md` → ✅ Dossier frère
```

### Dans README.md

```markdown
- `00_prologue.md` → ✅ Racine
- `CLAUDE.md` → ✅ Racine
- `PERSONNAGES_REFERENCE.md` → ✅ Racine
- `audit/ANALYSE_INFLUENCES_STYLISTIQUES_PROLOGUE.md` → ✅ Sous-dossier
- `Livre/magie.md` → ✅ Sous-dossier
- `docs/projet/CLAUDE.md` → ✅ Sous-dossier
```

**Résultat** : ✅ Tous chemins valides, aucun lien cassé

---

## 🔍 UNIFORMISATION EFFECTUÉE

### CLAUDE.md
- ✅ Version racine = référence (modifiée 2025-10-09 23:19)
- ✅ Version `docs/projet/CLAUDE.md` synchronisée
- ✅ Ancienne version sauvegardée : `backup/versions/CLAUDE_docs_projet_20251012.md`

### Fichiers Déplacés

**Scripts Python** (60+ fichiers) : Racine → `scripts/`
- `audit_complet_final.py`
- `correction_complete.py`
- `analyser_*.py`
- `batch_*.py`
- `count_cognition_verbs.py`
- etc.

**Fichiers Temporaires** (7 fichiers) : Racine → `temp/`
- `adverbes_temp.txt`
- `rapport_*.txt`
- `remplacements_log.txt`
- `vrais_adverbes.txt`
- etc.

**Backups et Versions** (12 fichiers) : Racine → `backup/versions/`
- `00_prologue_BACKUP_20251010_222610.md`
- `INTERLUDE_01_*.md` (× 6)
- `00_PROLOGUE_RESTRUCTURE.md`
- `00_STRUCTURE_NARRATIVE_RESTRUCTUREE.md`

**Audits et Rapports** (10 fichiers) : Racine → `audit/`
- `AUDIT_*.md` (4 fichiers)
- `RAPPORT_*.md` (5 fichiers)
- `PLAN_*.md` (1 fichier)
- `ANALYSE_INFLUENCES_STYLISTIQUES_PROLOGUE.md`

---

## ✅ VÉRIFICATIONS EFFECTUÉES

### Structure
- ✅ Racine propre (4 fichiers essentiels uniquement)
- ✅ Sous-dossiers organisés (audit, backup, docs, scripts, temp)
- ✅ Archives anciennes préservées (`_Archive_Corrections_2025-10-10/`)

### Chemins et Références
- ✅ Tous chemins dans `CLAUDE.md` valides
- ✅ Tous chemins dans `docs/projet/CLAUDE.md` valides
- ✅ Tous chemins dans `README.md` valides
- ✅ Aucun lien cassé détecté

### Uniformisation
- ✅ `CLAUDE.md` racine = version de référence
- ✅ `docs/projet/CLAUDE.md` synchronisé
- ✅ Ancienne version sauvegardée

### Fichiers
- ✅ 93 fichiers Markdown total
- ✅ 60+ scripts Python organisés
- ✅ 7 fichiers temporaires isolés
- ✅ 12 backups archivés
- ✅ 10 audits centralisés

---

## 📊 STATISTIQUES

| Catégorie | Nombre | Emplacement |
|-----------|--------|-------------|
| **Fichiers racine** | 4 | Racine |
| **Audits/rapports** | 10 | `audit/` |
| **Backups versions** | 12 | `backup/versions/` |
| **Docs guides** | 4 | `docs/guides/` |
| **Docs projet** | 7 | `docs/projet/` |
| **Chapitres inspiration** | 31 | `Inspiration/` |
| **Fiches univers** | 7 | `Livre/` |
| **Scripts Python** | 60+ | `scripts/` |
| **Fichiers temporaires** | 7 | `temp/` |
| **Total fichiers Markdown** | 93 | Ensemble projet |

---

## 🚀 MAINTENANCE FUTURE

### Ajout Nouveau Chapitre
1. Créer fichier dans `Livre/` (ex: `chapitre_01.md`)
2. Consulter `PERSONNAGES_REFERENCE.md` pour personnages
3. Vérifier influences stylistiques dans `docs/projet/CLAUDE.md`
4. Valider avec checklist `docs/guides/GUIDE_STYLISTIQUE.md`

### Ajout Nouvel Audit
1. Créer rapport dans `audit/`
2. Nommer : `AUDIT_[TYPE]_[DATE].md` ou `RAPPORT_[TYPE]_[DATE].md`
3. Référencer dans `README.md` si pertinent

### Création Backup
1. Copier version vers `backup/versions/`
2. Nommer : `[fichier]_BACKUP_[DATE].md`
3. Logs corrections vers `backup/corrections/`

### Nettoyage Périodique
1. Vider `temp/` des fichiers >30 jours
2. Archiver anciens scripts inutilisés
3. Compresser `_Archive_Corrections_[DATE]/` si >6 mois

---

## 📝 CHANGELOG ORGANISATION

### 2025-10-12 - Réorganisation Complète
- ✅ Création structure sous-dossiers (`audit/`, `backup/`, `scripts/`, `temp/`)
- ✅ Déplacement 60+ scripts Python vers `scripts/`
- ✅ Déplacement 7 fichiers temporaires vers `temp/`
- ✅ Déplacement 12 backups vers `backup/versions/`
- ✅ Déplacement 10 audits vers `audit/`
- ✅ Uniformisation `CLAUDE.md` (racine = référence)
- ✅ Sauvegarde ancienne version `CLAUDE_docs_projet_20251012.md`
- ✅ Vérification tous chemins (aucun cassé)
- ✅ Création `README.md` documentation complète
- ✅ Création `ORGANISATION.md` structure détaillée
- ✅ Racine nettoyée : 4 fichiers essentiels uniquement

**Résultat** : Structure propre, organisée, documentée, aucun chemin cassé ✅

---

**Dernière mise à jour** : 2025-10-12
**Responsable** : Brujah
**Statut** : ✅ Organisation validée et complète
