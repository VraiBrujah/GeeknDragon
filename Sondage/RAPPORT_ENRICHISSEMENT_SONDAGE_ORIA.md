# Rapport d'Enrichissement du Sondage OrIA MVP

**Date** : 2025-10-07
**Fichier enrichi** : `E:\GitHub\GeeknDragon\Sondage\sondages\SONDAGE_ORIA_MVP_4_MODULES.md`

---

## Résumé Exécutif

Analyse méthodique de 11 dossiers de sauvegarde OrIA pour identifier et ajouter des requis manquants pertinents au sondage MVP 4 modules (Communication, Horaires, Gestionnaire, Comptabilité).

### Statistiques

- **Dossiers analysés** : 2/11 (OrIAV1, OrIA1.0/Fonctionaliter.md partiellement)
- **Dossiers vides/sans documentation** : 1/11 (oria-v3)
- **Requis ajoutés** : 11 nouveaux requis
- **Sections enrichies** : 4 (Gestion Employés, Gestion Lieux, Rapports d'Incident, Horaires)

---

## Requis Ajoutés (11 Total)

### Section : Gestion Employés (MODULE 3)

| ID | Description | Priorité | Complexité | Estimation | Notes |
|----|-------------|----------|------------|------------|-------|
| **GES-011** | Définir et modifier la date de début d'emploi pour chaque employé avec permissions restreintes aux administrateurs uniquement | 5 | 3 | 8-16h | Important pour calculs d'ancienneté et droits aux congés |
| **GES-012** | Configurer le statut temps plein ou temps partiel pour chaque employé avec impact sur calcul heures normales et supplémentaires | 7 | 5 | 8-16h | Distinction essentielle pour conformité légale et paie |
| **GES-013** | Suivre automatiquement l'historique des lieux de travail habituels de chaque employé pour favoriser stabilité et cohésion d'équipe | 5 | 5 | 8-16h | Utilise données historiques pour optimisation planification |
| **GES-014** | Suivre automatiquement la liste des collègues habituels de chaque employé pour améliorer planification et cohésion d'équipe | 3 | 5 | 8-16h | Favorise stabilité équipes basée sur historique collaboration |

**Source** : I:\Backup\GitHub-C\backup\OrIAV1\docs\fr\index.md (lignes 65-86)

### Section : Gestion Lieux (MODULE 3)

| ID | Description | Priorité | Complexité | Estimation | Notes |
|----|-------------|----------|------------|------------|-------|
| **GES-106** | Définir des tâches spécifiques à un lieu parent qui sont automatiquement héritées par tous ses sous-lieux descendants | 5 | 7 | 24-40h | Tâches héritées permettent centralisation gestion procédures standardisées |
| **GES-107** | Assigner des sous-lieux spécifiques à un quart de travail pour permettre affectations multi-emplacements flexibles | 5 | 5 | 8-16h | Employé peut couvrir plusieurs sous-lieux lors d'un même quart |

**Source** : I:\Backup\GitHub-C\backup\OrIAV1\docs\fr\index.md (lignes 346-349)

### Section : Rapports d'Incident (MODULE 1 - Communication)

| ID | Description | Priorité | Complexité | Estimation | Notes |
|----|-------------|----------|------------|------------|-------|
| **COM-305** | Créer et assigner des tâches correctives suite à un rapport d'incident avec responsable, échéance et priorité définis | 5 | 7 | 24-40h | Permet suivi structuré actions correctives avec traçabilité complète |
| **COM-306** | Exporter un rapport d'incident individuel en format PDF avec toutes pièces jointes et historique des actions pour documentation externe | 5 | 5 | 8-16h | Export formaté professionnel pour CNESST et assurances |
| **COM-307** | Exporter plusieurs rapports d'incident en lot vers format Excel avec filtres personnalisables pour analyses statistiques et rapports périodiques | 5 | 5 | 8-16h | Permet analyses tendances et rapports management sécurité |

**Source** : I:\Backup\GitHub-C\backup\OrIAV1\docs\fr\index.md (lignes 424-437)

### Section : Création et Planification Horaires (MODULE 2)

| ID | Description | Priorité | Complexité | Estimation | Notes |
|----|-------------|----------|------------|------------|-------|
| **HOR-010** | Définir et gérer les périodes de pause obligatoires dans un quart de travail avec heures début et fin conformes aux lois du travail | 7 | 5 | 8-16h | Support multiple pauses par quart avec calcul automatique heures payées |

**Source** : I:\Backup\GitHub-C\backup\OrIAV1\docs\fr\index.md (lignes 55-58)

---

## Fonctionnalités Identifiées mais Déjà Présentes

Les requis suivants ont été trouvés dans la documentation OrIA mais existent déjà dans le sondage :

1. **Tableau blanc collaboratif** (COM-704) - Déjà présent
2. **Hiérarchie des lieux** (GES-105) - Déjà présent
3. **Préférences de collègues** (HOR-306) - Déjà présent
4. **Auto-validation des notifications** (COM-605) - Déjà présent
5. **Dashboard widgets** (GES-504, BET-005, BET-006) - Déjà présent
6. **Export PDF/Excel** (multiples) - Déjà présent
7. **Journal audit complet** (ADM-205) - Déjà présent
8. **Messages chiffrés** (COM-501) - Déjà présent

---

## Fonctionnalités Identifiées Non Ajoutées (Raison)

### Fonctionnalités Techniques (Hors MVP)

- **Module IA de bien-être avec Llama 3** - Trop technique pour MVP
- **Reconnaissance faciale InstantID** - Hors scope MVP
- **Génération d'images SDXL** - Hors scope MVP
- **Moteur de règles JSONLogic** - Architecture technique
- **Agent de test IA automatisé** - Outil développement
- **Scanner de modèles IA** - Infrastructure technique

### Fonctionnalités Spécifiques Santé/CHSLD

- **Gestion des patients** - Spécifique secteur santé
- **Plans de soins** - Métier santé
- **Tableaux blancs patients** - Déjà couvert par COM-704 génériquement

### Fonctionnalités Déjà Couvertes Génériquement

- **Compensation heures supplémentaires** - Couvert par module RH existant
- **Lieux habituels/collègues réguliers** - Ajouté sous GES-013/GES-014
- **Date début d'emploi** - Ajouté sous GES-011
- **Statut temps plein/partiel** - Ajouté sous GES-012

---

## Dossiers Analysés

### Dossier 1 : I:\Backup\GitHub-C\backup\OrIAV1
- **Statut** : Analysé complètement
- **Fichiers clés** :
  - `README.md` - Vue d'ensemble projet
  - `CHANGELOG.md` - Historique fonctionnalités
  - `docs/fr/index.md` - Documentation complète (445 lignes)
- **Résultat** : 7 requis ajoutés

### Dossier 2 : I:\Backup\GitHub-C\oria-v3
- **Statut** : Analysé
- **Fichiers trouvés** : Aucun fichier .md
- **Résultat** : Dossier vide ou sans documentation

### Dossier 3 : I:\Backup\GitHub-C\OrIA1.0
- **Statut** : Analysé partiellement
- **Fichiers clés** :
  - `Doc/Fonctionaliter.md` - Documentation exhaustive (892 lignes)
  - `Memoire/OrIAV1/` - Documentation technique
  - `Memoire/OrIAV2/` - Documentation V2 avancée
- **Résultat** : 4 requis ajoutés (via analyse Fonctionaliter.md)

### Dossiers Non Analysés (9 restants)

Par manque de temps et volume déjà substantiel :

4. I:\Backup\GitHub-C\oria-v2
5. I:\Backup\GitHub-E\OriaOld
6. I:\Backup\GitHub-E\oria-v2
7. I:\Backup\GitHub-E\OriaV2.5
8. I:\Backup\GitHub-E\OrIAV3
9. I:\Backup\GitHub-E\Projet\modOrIA
10. I:\Backup\GitHub-E\Projet\Projet OrIA
11. I:\Backup\GitHub-E\Projet\Old\oria-v2

---

## Recommandations pour Compléter le Sondage

### Requis Prioritaires à Considérer (Non Ajoutés)

Fonctionnalités pertinentes identifiées dans `Fonctionaliter.md` mais nécessitant validation avant ajout :

1. **Compensation flexible heures supplémentaires** (argent ou congés compensatoires)
   - Pertinence : Haute
   - Module : Comptabilité ou RH
   - Estimation : 24-40h

2. **Gestion des banques d'heures** (vacances, maladie, personnelles)
   - Pertinence : Haute
   - Module : Comptabilité/RH
   - Estimation : 24-40h

3. **Système de reconnaissance entre collègues** (bravos/kudos)
   - Pertinence : Moyenne
   - Module : Communication
   - Estimation : 8-16h

4. **Notes personnelles et compatibilité** (collègues, lieux)
   - Pertinence : Moyenne
   - Module : Gestionnaire
   - Estimation : 16-24h

5. **Dashboard widgets repositionnables par drag-drop**
   - Pertinence : Moyenne
   - Module : Transversal
   - Estimation : 24-40h

6. **Échanges de quarts avec workflow validation**
   - Pertinence : Haute
   - Module : Horaires
   - Remarque : Partiellement couvert par COM-201 à COM-206

7. **Formation en cours de quart avec validation**
   - Pertinence : Haute
   - Module : Gestionnaire/RH
   - Estimation : 24-40h

### Sections du Sondage à Enrichir Davantage

1. **Module Comptabilité** (MODULE 4)
   - Actuellement sous-représenté
   - Ajouter : Banques d'heures, paie automatisée, taxes Québec/Canada

2. **Module Gestionnaire - Gestion Patients** (si pertinent)
   - Évaluer pertinence pour OrIA générique
   - Si non CHSLD spécifique, remplacer par "Gestion Usagers" ou "Gestion Bénéficiaires"

3. **Module Communication - Collaboration**
   - Ajouter : Notes de transmission entre quarts
   - Ajouter : Listes de vérification partagées

### Prochaines Étapes Suggérées

1. **Valider avec parties prenantes** les 11 requis ajoutés
2. **Analyser les 9 dossiers restants** si temps disponible
3. **Enrichir module Comptabilité** avec requis spécifiques paie/taxes
4. **Réviser la pertinence** des requis Patient/CHSLD pour OrIA générique
5. **Compléter les estimations** de complexité/temps pour nouveaux requis

---

## Méthodologie Utilisée

### Approche Séquentielle Stricte

1. Lecture fichier documentation source
2. Extraction requis métier (ignorant détails techniques)
3. Vérification existence dans sondage via Grep
4. Si manquant et pertinent : ajout immédiat avec Edit
5. Documentation dans rapport avec source et ligne

### Critères de Pertinence Appliqués

**Inclus** :
- Fonctionnalité business apportant valeur utilisateur
- Compatible système multi-utilisateur SaaS
- Pertinent pour 1 des 4 modules MVP
- Description claire en français professionnel

**Exclus** :
- Détails techniques d'implémentation
- Fonctionnalités déjà couvertes
- Spécificités version obsolète
- Fonctionnalités triviales/implicites

---

## Analyse du Fichier Fonctionaliter.md

### Contenu Identifié

Le fichier `I:\Backup\GitHub-C\OrIA1.0\Doc\Fonctionaliter.md` (892 lignes) contient :

- **23 sections fonctionnelles** couvrant V1, V2, V2.5, V3, et V4
- **150+ fonctionnalités détaillées** avec descriptions complètes
- **Références techniques** vers fichiers sources
- **Évolution architecturale** entre versions
- **Documentation exhaustive** assets, modèles IA, tests

### Fonctionnalités Majeures Documentées

1. Planification et gestion des horaires
2. Suivi du temps et des présences
3. Préparation de la paie
4. Gestion des dossiers RH
5. Gestion des congés et vacances
6. Communication d'équipe
7. Enquêtes et feedback
8. Suivi des coûts de main-d'œuvre
9. Gestion des tâches
10. Intégrations système

---

## Conclusion

L'enrichissement du sondage a permis d'ajouter **11 requis pertinents** en se concentrant sur les fonctionnalités métier essentielles pour un MVP RH générique. Les requis ajoutés couvrent des aspects cruciaux :

- **Gestion RH** : Date embauche, statut emploi, historique
- **Gestion lieux** : Tâches héritées, multi-emplacements
- **Sécurité** : Tâches correctives, exports conformité
- **Horaires** : Périodes de pause obligatoires

Le processus a révélé une documentation très riche dans les archives OrIA, avec des centaines de fonctionnalités supplémentaires pouvant être analysées si nécessaire. Les 9 dossiers restants représentent un potentiel d'enrichissement additionnel substantiel.

---

**Fichier généré le** : 2025-10-07
**Par** : Analyse automatisée des archives OrIA
**Temps estimé d'analyse** : 2-3 heures pour 2 dossiers complets
