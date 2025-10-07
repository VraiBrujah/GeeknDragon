# 📋 Sondage des Requis - ORIA MVP V3

**Date de création** : 2025-10-07
**Version** : 1.0
**Objectif** : Déterminer les requis à développer pour le MVP et définir les droits par rôle utilisateur

---

## 🎯 Instructions d'utilisation

Ce sondage permet de sélectionner les requis fonctionnels pour le MVP ORIA V3 et de définir les permissions par rôle.

### Légende des colonnes

| Colonne | Description |
|---------|-------------|
| **MVP** | ☐ Inclure dans le MVP / ☑ Sélectionné |
| **Admin** | ☐ C(réer) ☐ L(ire) ☐ E(diter) ☐ S(upprimer) ☐ X(eXporter) ☐ V(alider) |
| **Gestionnaire** | ☐ C ☐ L ☐ E ☐ S ☐ X ☐ V |
| **Superviseur** | ☐ C ☐ L ☐ E ☐ S ☐ X ☐ V |
| **Employé** | ☐ C ☐ L ☐ E ☐ S ☐ X ☐ V |
| **Patient** | ☐ C ☐ L ☐ E ☐ S ☐ X ☐ V |
| **Famille** | ☐ C ☐ L ☐ E ☐ S ☐ X ☐ V |
| **Priorité** | Haute / Moyenne / Basse |
| **Complexité** | Simple / Moyen / Complexe |

---

## MODULE 1 : MOTEUR DE RÈGLES

### 1.1 Gestion des Règles Métier

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| RGL-001 | Créer une règle forte (blocante) | ☐ | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E ☐S | ☐L | ☐L | ☐ | ☐ | Haute | Complexe |
| RGL-002 | Créer une règle faible (pondérée 0-100) | ☐ | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E ☐S | ☐L | ☐L | ☐ | ☐ | Haute | Complexe |
| RGL-003 | Activer/désactiver une règle | ☐ | ☐E ☐L | ☐E ☐L | ☐L | ☐L | ☐ | ☐ | Haute | Simple |
| RGL-004 | Modifier les paramètres d'une règle | ☐ | ☐E ☐L | ☐E ☐L | ☐L | ☐L | ☐ | ☐ | Haute | Moyen |
| RGL-005 | Supprimer une règle | ☐ | ☐S ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Moyenne | Simple |
| RGL-006 | Importer des règles (JSON/YAML) | ☐ | ☐C ☐L | ☐L | ☐ | ☐ | ☐ | ☐ | Basse | Moyen |
| RGL-007 | Exporter des règles (JSON/YAML) | ☐ | ☐X ☐L | ☐X ☐L | ☐L | ☐ | ☐ | ☐ | Basse | Simple |

### 1.2 Règles de Conformité (CNESST/LNT-QC)

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| RGL-101 | Appliquer règle temps repos minimum (8h entre quarts) | ☐ | ☐L ☐E | ☐L | ☐L | ☐L | ☐ | ☐ | Haute | Moyen |
| RGL-102 | Appliquer règle heures max/jour (14h) | ☐ | ☐L ☐E | ☐L | ☐L | ☐L | ☐ | ☐ | Haute | Moyen |
| RGL-103 | Appliquer règle heures max/semaine (40h-50h) | ☐ | ☐L ☐E | ☐L | ☐L | ☐L | ☐ | ☐ | Haute | Moyen |
| RGL-104 | Calculer heures supplémentaires automatiquement | ☐ | ☐L ☐V | ☐L ☐V | ☐L | ☐L | ☐ | ☐ | Haute | Complexe |
| RGL-105 | Gérer jours fériés obligatoires | ☐ | ☐C ☐L ☐E | ☐L | ☐L | ☐L | ☐ | ☐ | Moyenne | Simple |
| RGL-106 | Bloquer assignation si violation règle forte | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Haute | Moyen |

### 1.3 Règles de Préférence (Règles Faibles)

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| RGL-201 | Ancienneté (privilégier employés anciens) | ☐ | ☐E ☐L | ☐E ☐L | ☐L | ☐L | ☐ | ☐ | Moyenne | Simple |
| RGL-202 | Affinité d'équipe (collègues appréciés) | ☐ | ☐E ☐L | ☐E ☐L | ☐L | ☐L | ☐ | ☐ | Basse | Moyen |
| RGL-203 | Préférences d'horaires (jour/soir/nuit) | ☐ | ☐E ☐L | ☐E ☐L | ☐L | ☐C ☐L ☐E | ☐ | ☐ | Moyenne | Simple |
| RGL-204 | Statut temps plein vs partiel | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Moyenne | Simple |
| RGL-205 | Volonté heures supplémentaires | ☐ | ☐E ☐L | ☐E ☐L | ☐L | ☐C ☐L ☐E | ☐ | ☐ | Moyenne | Simple |
| RGL-206 | Persistance de lieu (assignations récurrentes) | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Basse | Moyen |
| RGL-207 | Persistance de collègues (équipes habituelles) | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Basse | Moyen |
| RGL-208 | Assiduité (pénaliser absences fréquentes) | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Moyenne | Simple |

### 1.4 Interface de Gestion des Règles

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| RGL-301 | Interface graphique création règle (builder visuel) | ☐ | ☐C ☐L | ☐L | ☐ | ☐ | ☐ | ☐ | Moyenne | Complexe |
| RGL-302 | Prévisualisation impact règle | ☐ | ☐L | ☐L | ☐ | ☐ | ☐ | ☐ | Basse | Moyen |
| RGL-303 | Historique modifications règles (audit) | ☐ | ☐L ☐X | ☐L | ☐ | ☐ | ☐ | ☐ | Moyenne | Simple |
| RGL-304 | Validation cohérence règles (conflits) | ☐ | ☐V ☐L | ☐L | ☐ | ☐ | ☐ | ☐ | Moyenne | Complexe |

---

## MODULE 2 : SÉCURITÉ / UTILISATEURS / FORFAITS

### 2.1 Gestion Hiérarchique des Utilisateurs

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| USR-001 | Créer utilisateur Owner (accréditation 99) | ☐ | ☐C ☐L | ☐ | ☐ | ☐ | ☐ | ☐ | Haute | Simple |
| USR-002 | Créer utilisateur Administrateur (80-98) | ☐ | ☐C ☐L ☐E ☐S | ☐ | ☐ | ☐ | ☐ | ☐ | Haute | Simple |
| USR-003 | Créer utilisateur Gestionnaire (50-79) | ☐ | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E ☐S | ☐ | ☐ | ☐ | ☐ | Haute | Simple |
| USR-004 | Créer utilisateur Superviseur (30-49) | ☐ | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E | ☐ | ☐ | ☐ | Haute | Simple |
| USR-005 | Créer utilisateur Employé (10-29) | ☐ | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐ | ☐ | Haute | Simple |
| USR-006 | Créer utilisateur Patient (2-9) | ☐ | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐ | ☐ | Moyenne | Simple |
| USR-007 | Créer utilisateur Famille/Anonyme (0-1) | ☐ | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐ | Basse | Simple |

### 2.2 Gestion des Lieux et Autorisations

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| USR-101 | Créer lieu parent (établissement, bâtiment) | ☐ | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E | ☐ | ☐ | ☐ | ☐ | Haute | Simple |
| USR-102 | Créer sous-lieu récursif (étage>aile>chambre) | ☐ | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E | ☐ | ☐ | ☐ | Haute | Moyen |
| USR-103 | Assigner lieux autorisés à utilisateur | ☐ | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E | ☐L | ☐L | ☐ | ☐ | Haute | Simple |
| USR-104 | Définir lieu assigné par défaut (utilisateur) | ☐ | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐L | ☐C ☐L ☐E | ☐ | ☐ | Moyenne | Simple |
| USR-105 | Héritage autorisations lieux (parent→enfants) | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Haute | Moyen |
| USR-106 | Vérifier accès lieu (fonction utilitaire) | ☐ | ☐L | ☐L | ☐L | ☐L | ☐L | ☐L | Haute | Simple |

### 2.3 Gestion des Postes et Formations

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| USR-201 | Créer poste (infirmier, PAB, médecin...) | ☐ | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E | ☐L | ☐L | ☐ | ☐ | Haute | Simple |
| USR-202 | Créer formation/certification | ☐ | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E ☐S | ☐L | ☐L | ☐ | ☐ | Haute | Simple |
| USR-203 | Assigner formation à utilisateur | ☐ | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E ☐S | ☐L | ☐C ☐L | ☐ | ☐ | Haute | Simple |
| USR-204 | Vérifier formations requises pour poste | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Haute | Simple |
| USR-205 | Alerter expiration certification (avant échéance) | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Moyenne | Moyen |

### 2.4 Multi-Client et Forfaits

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| USR-301 | Créer client/organisation (multi-tenant) | ☐ | ☐C ☐L ☐E ☐S | ☐ | ☐ | ☐ | ☐ | ☐ | Haute | Complexe |
| USR-302 | Assigner forfait à client (Basic/Pro/Enterprise) | ☐ | ☐C ☐L ☐E | ☐ | ☐ | ☐ | ☐ | ☐ | Haute | Simple |
| USR-303 | Activer/désactiver modules par forfait | ☐ | ☐E ☐L | ☐L | ☐ | ☐ | ☐ | ☐ | Haute | Moyen |
| USR-304 | Isoler données entre clients (RLS) | ☐ | ☐L | ☐ | ☐ | ☐ | ☐ | ☐ | Haute | Complexe |

---

## MODULE 3 : AUDIT ET TRAÇABILITÉ

### 3.1 Journalisation des Actions

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| AUD-001 | Logger connexion/déconnexion utilisateur | ☐ | ☐L ☐X | ☐ | ☐ | ☐ | ☐ | ☐ | Haute | Simple |
| AUD-002 | Logger création/modification/suppression données | ☐ | ☐L ☐X | ☐ | ☐ | ☐ | ☐ | ☐ | Haute | Simple |
| AUD-003 | Logger décisions moteur de règles | ☐ | ☐L ☐X | ☐ | ☐ | ☐ | ☐ | ☐ | Haute | Moyen |
| AUD-004 | Logger consultation données sensibles | ☐ | ☐L ☐X | ☐ | ☐ | ☐ | ☐ | ☐ | Haute | Simple |
| AUD-005 | Stocker logs dans base séparée (oria-audit) | ☐ | ☐L | ☐ | ☐ | ☐ | ☐ | ☐ | Haute | Moyen |

### 3.2 Consultation et Export Audit

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| AUD-101 | Rechercher logs par date/utilisateur/action | ☐ | ☐L | ☐ | ☐ | ☐ | ☐ | ☐ | Moyenne | Moyen |
| AUD-102 | Filtrer logs par niveau sévérité | ☐ | ☐L | ☐ | ☐ | ☐ | ☐ | ☐ | Basse | Simple |
| AUD-103 | Exporter logs audit (PDF/CSV/JSON) | ☐ | ☐X ☐L | ☐ | ☐ | ☐ | ☐ | ☐ | Moyenne | Simple |
| AUD-104 | Générer rapport audit période (mandat légal) | ☐ | ☐X ☐L | ☐ | ☐ | ☐ | ☐ | ☐ | Haute | Moyen |

### 3.3 Sécurité et Confidentialité Audit

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| AUD-201 | Chiffrer logs audit (AES-256) | ☐ | ☐L | ☐ | ☐ | ☐ | ☐ | ☐ | Haute | Moyen |
| AUD-202 | Restreindre accès logs (accréditation 100 seulement) | ☐ | ☐L | ☐ | ☐ | ☐ | ☐ | ☐ | Haute | Simple |
| AUD-203 | Logger consultation audit (méta-audit) | ☐ | ☐L | ☐ | ☐ | ☐ | ☐ | ☐ | Moyenne | Simple |

---

## MODULE 4 : GESTION COMPLÈTE DES HORAIRES

### 4.1 Création et Gestion des Quarts

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| HOR-001 | Créer quart de travail (date, heures, lieu, poste) | ☐ | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E | ☐L | ☐ | ☐ | Haute | Simple |
| HOR-002 | Définir min/max employés requis par quart | ☐ | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐L | ☐L | ☐ | ☐ | Haute | Simple |
| HOR-003 | Définir pauses dans quart | ☐ | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐L | ☐L | ☐ | ☐ | Moyenne | Simple |
| HOR-004 | Définir formations requises pour quart | ☐ | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐L | ☐L | ☐ | ☐ | Haute | Simple |
| HOR-005 | Créer quart récurrent (quotidien/hebdo/mensuel) | ☐ | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E | ☐L | ☐ | ☐ | Moyenne | Moyen |
| HOR-006 | Modifier quart individuel ou série complète | ☐ | ☐E ☐L | ☐E ☐L | ☐E ☐L | ☐L | ☐ | ☐ | Haute | Moyen |
| HOR-007 | Supprimer quart (uniquement futur, pas passé) | ☐ | ☐S ☐L | ☐S ☐L | ☐L | ☐L | ☐ | ☐ | Moyenne | Simple |

### 4.2 Assignation des Employés

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| HOR-101 | Assigner employé à quart (manuellement) | ☐ | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E | ☐L | ☐ | ☐ | Haute | Simple |
| HOR-102 | Suggérer employés éligibles (IA contraintes) | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Haute | Complexe |
| HOR-103 | Scorer candidats selon règles faibles | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Moyenne | Complexe |
| HOR-104 | Affiner suggestions avec IA (LLM local) | ☐ | ☐L | ☐L | ☐L | ☐ | ☐ | ☐ | Basse | Complexe |
| HOR-105 | Apprentissage préférences gestionnaire (ML) | ☐ | ☐L | ☐L | ☐ | ☐ | ☐ | ☐ | Basse | Complexe |
| HOR-106 | Mode assignation automatique (validation auto) | ☐ | ☐E ☐L | ☐E ☐L | ☐ | ☐ | ☐ | ☐ | Basse | Complexe |

### 4.3 Quarts Ouverts et Échanges

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| HOR-201 | Créer quart ouvert (volontariat) | ☐ | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E ☐S | ☐L | ☐L | ☐ | ☐ | Moyenne | Moyen |
| HOR-202 | Postuler sur quart ouvert (employé) | ☐ | ☐L | ☐L | ☐L | ☐C ☐L | ☐ | ☐ | Moyenne | Simple |
| HOR-203 | Valider candidature sur quart ouvert (gestionnaire) | ☐ | ☐V ☐L | ☐V ☐L | ☐L | ☐L | ☐ | ☐ | Moyenne | Simple |
| HOR-204 | Demander échange de quart (employé→collègue) | ☐ | ☐L | ☐L | ☐L | ☐C ☐L | ☐ | ☐ | Basse | Moyen |
| HOR-205 | Accepter échange de quart (collègue) | ☐ | ☐L | ☐L | ☐L | ☐C ☐L | ☐ | ☐ | Basse | Simple |
| HOR-206 | Valider échange de quart (gestionnaire) | ☐ | ☐V ☐L | ☐V ☐L | ☐L | ☐L | ☐ | ☐ | Basse | Simple |

### 4.4 Visualisation et Filtres

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| HOR-301 | Vue calendrier (jour/semaine/mois) | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Haute | Moyen |
| HOR-302 | Filtrer par lieu/poste/employé/statut | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Haute | Simple |
| HOR-303 | Recherche textuelle dans horaires | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Moyenne | Simple |
| HOR-304 | Codes couleur par poste/statut | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Basse | Simple |
| HOR-305 | Exporter horaires (PDF/Excel/iCal) | ☐ | ☐X ☐L | ☐X ☐L | ☐X ☐L | ☐X ☐L | ☐ | ☐ | Moyenne | Moyen |

### 4.5 Notes et Annotations

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| HOR-401 | Ajouter note personnelle sur quart (privée) | ☐ | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E ☐S | ☐ | ☐ | Basse | Simple |
| HOR-402 | Ajouter note publique sur quart (visible tous) | ☐ | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E | ☐L | ☐ | ☐ | Moyenne | Simple |
| HOR-403 | Ajouter note restreinte (niveau accréditation) | ☐ | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E ☐S | ☐L | ☐ | ☐ | ☐ | Basse | Simple |

---

## MODULE 5 : STATISTIQUES ET ANALYSES

### 5.1 Statistiques Horaires et RH

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| STA-001 | Taux couverture quarts (complets vs incomplets) | ☐ | ☐L ☐X | ☐L ☐X | ☐L | ☐ | ☐ | ☐ | Haute | Moyen |
| STA-002 | Heures supplémentaires totales/mois/employé | ☐ | ☐L ☐X | ☐L ☐X | ☐L | ☐L | ☐ | ☐ | Haute | Moyen |
| STA-003 | Taux absentéisme par équipe/département | ☐ | ☐L ☐X | ☐L ☐X | ☐L | ☐ | ☐ | ☐ | Moyenne | Moyen |
| STA-004 | Coût main-d'œuvre réel vs planifié | ☐ | ☐L ☐X | ☐L ☐X | ☐L | ☐ | ☐ | ☐ | Haute | Complexe |
| STA-005 | Répartition employés par poste/formation | ☐ | ☐L ☐X | ☐L ☐X | ☐L | ☐ | ☐ | ☐ | Moyenne | Simple |

### 5.2 Prédictions et Insights IA

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| STA-101 | Prédire risque départ employé (turnover) | ☐ | ☐L | ☐L | ☐ | ☐ | ☐ | ☐ | Basse | Complexe |
| STA-102 | Recommander ajustements effectifs | ☐ | ☐L | ☐L | ☐L | ☐ | ☐ | ☐ | Basse | Complexe |
| STA-103 | Identifier causes mal-être (corrélations) | ☐ | ☐L | ☐L | ☐ | ☐ | ☐ | ☐ | Moyenne | Complexe |
| STA-104 | Optimiser charge travail par équipe | ☐ | ☐L | ☐L | ☐ | ☐ | ☐ | ☐ | Basse | Complexe |

### 5.3 Tableaux de Bord et Rapports

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| STA-201 | Dashboard global (admin) | ☐ | ☐L | ☐ | ☐ | ☐ | ☐ | ☐ | Haute | Moyen |
| STA-202 | Dashboard équipe (gestionnaire) | ☐ | ☐L | ☐L | ☐L | ☐ | ☐ | ☐ | Haute | Moyen |
| STA-203 | Dashboard personnel (employé) | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Moyenne | Simple |
| STA-204 | Exporter rapports (PDF/CSV/JSON) | ☐ | ☐X ☐L | ☐X ☐L | ☐X ☐L | ☐X ☐L | ☐ | ☐ | Moyenne | Simple |

---

## MODULE 6 : BIEN-ÊTRE AVEC IA

### 6.1 Génération de Questions

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| BIE-001 | Générer 20 questions sémantiques par lot | ☐ | ☐L | ☐L | ☐ | ☐ | ☐ | ☐ | Haute | Complexe |
| BIE-002 | Version générique pour validation | ☐ | ☐L | ☐L | ☐ | ☐ | ☐ | ☐ | Haute | Moyen |
| BIE-003 | Version personnalisée par profil employé | ☐ | ☐L | ☐L | ☐ | ☐L | ☐ | ☐ | Haute | Complexe |
| BIE-004 | Éviter répétitions sémantiques (1 mois) | ☐ | ☐L | ☐L | ☐ | ☐ | ☐ | ☐ | Moyenne | Moyen |

### 6.2 Validation Gestionnaire

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| BIE-101 | Valider question (passe en stack globale) | ☐ | ☐V ☐L | ☐V ☐L | ☐ | ☐ | ☐ | ☐ | Haute | Simple |
| BIE-102 | Rejeter question (retour génération) | ☐ | ☐V ☐L | ☐V ☐L | ☐ | ☐ | ☐ | ☐ | Haute | Simple |
| BIE-103 | Prévisualiser version personnalisée | ☐ | ☐L | ☐L | ☐ | ☐ | ☐ | ☐ | Moyenne | Simple |
| BIE-104 | Auditer validation (qui, quand, décision) | ☐ | ☐L ☐X | ☐L | ☐ | ☐ | ☐ | ☐ | Haute | Simple |

### 6.3 Distribution et Réponses

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| BIE-201 | Distribuer 5 questions/semaine/employé | ☐ | ☐L | ☐L | ☐ | ☐L | ☐ | ☐ | Haute | Moyen |
| BIE-202 | Pop-up obligatoire à connexion | ☐ | ☐ | ☐ | ☐ | ☐L | ☐ | ☐ | Haute | Simple |
| BIE-203 | Répondre question ouverte (texte libre) | ☐ | ☐ | ☐ | ☐ | ☐C ☐L | ☐ | ☐ | Haute | Simple |
| BIE-204 | Répondre question fermée (QCM/échelle) | ☐ | ☐ | ☐ | ☐ | ☐C ☐L | ☐ | ☐ | Haute | Simple |
| BIE-205 | Reporter question (max 3 fois) | ☐ | ☐ | ☐ | ☐ | ☐E ☐L | ☐ | ☐ | Basse | Simple |

### 6.4 Analyse et Recommandations

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| BIE-301 | Analyser sentiment réponse (IA locale) | ☐ | ☐L | ☐L | ☐ | ☐ | ☐ | ☐ | Haute | Complexe |
| BIE-302 | Calculer score satisfaction (0-100) | ☐ | ☐L | ☐L | ☐ | ☐L | ☐ | ☐ | Haute | Moyen |
| BIE-303 | Générer recommandation employé (personnalisée) | ☐ | ☐ | ☐ | ☐ | ☐L | ☐ | ☐ | Haute | Complexe |
| BIE-304 | Générer note gestionnaire (anonymisée) | ☐ | ☐ | ☐L | ☐ | ☐ | ☐ | ☐ | Haute | Complexe |
| BIE-305 | Détecter signaux faibles (retards, stress) | ☐ | ☐L | ☐L | ☐ | ☐ | ☐ | ☐ | Moyenne | Complexe |
| BIE-306 | Alerter gestionnaire si persistance problème | ☐ | ☐ | ☐L | ☐ | ☐ | ☐ | ☐ | Moyenne | Moyen |

### 6.5 Statistiques et Tendances

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| BIE-401 | Taux réponse par employé/équipe | ☐ | ☐L ☐X | ☐L ☐X | ☐ | ☐L | ☐ | ☐ | Moyenne | Simple |
| BIE-402 | Score satisfaction moyen (équipe) | ☐ | ☐L ☐X | ☐L ☐X | ☐ | ☐ | ☐ | ☐ | Haute | Simple |
| BIE-403 | Évolution temporelle (graphes) | ☐ | ☐L ☐X | ☐L ☐X | ☐ | ☐L | ☐ | ☐ | Moyenne | Moyen |
| BIE-404 | Thèmes émergents (extraction IA) | ☐ | ☐L ☐X | ☐L ☐X | ☐ | ☐ | ☐ | ☐ | Moyenne | Complexe |
| BIE-405 | Suggérer nouveaux thèmes questions | ☐ | ☐L | ☐L | ☐ | ☐ | ☐ | ☐ | Basse | Complexe |

---

## MODULE 7 : COMMUNICATION

### 7.1 Demandes et Approbations

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| COM-001 | Soumettre demande congé | ☐ | ☐C ☐L | ☐C ☐L | ☐C ☐L | ☐C ☐L | ☐ | ☐ | Haute | Simple |
| COM-002 | Approuver/refuser demande congé | ☐ | ☐V ☐L | ☐V ☐L | ☐V ☐L | ☐L | ☐ | ☐ | Haute | Simple |
| COM-003 | Notifier employé décision | ☐ | ☐ | ☐ | ☐ | ☐L | ☐ | ☐ | Haute | Simple |
| COM-004 | Déclarer absence maladie (imprévue) | ☐ | ☐C ☐L | ☐C ☐L | ☐C ☐L | ☐C ☐L | ☐ | ☐ | Haute | Simple |
| COM-005 | Joindre justificatif (billet médecin) | ☐ | ☐C ☐L | ☐L | ☐L | ☐C ☐L | ☐ | ☐ | Moyenne | Simple |

### 7.2 Messagerie et Annonces

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| COM-101 | Envoyer message privé (1-à-1) | ☐ | ☐C ☐L | ☐C ☐L | ☐C ☐L | ☐C ☐L | ☐C ☐L | ☐C ☐L | Moyenne | Moyen |
| COM-102 | Créer discussion groupe | ☐ | ☐C ☐L | ☐C ☐L | ☐C ☐L | ☐C ☐L | ☐ | ☐ | Basse | Moyen |
| COM-103 | Publier annonce équipe (tableau blanc) | ☐ | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E ☐S | ☐C ☐L | ☐L | ☐ | ☐ | Moyenne | Simple |
| COM-104 | Accuser réception message/annonce | ☐ | ☐L | ☐L | ☐L | ☐C ☐L | ☐L | ☐L | Basse | Simple |
| COM-105 | Chiffrer messages (pgcrypto) | ☐ | ☐L | ☐L | ☐L | ☐L | ☐L | ☐L | Haute | Moyen |

### 7.3 Rapports d'Incident

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| COM-201 | Soumettre rapport incident (accident, événement) | ☐ | ☐C ☐L | ☐C ☐L | ☐C ☐L | ☐C ☐L | ☐C ☐L | ☐ | Haute | Moyen |
| COM-202 | Catégoriser incident (type, gravité) | ☐ | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐C ☐L | ☐L | ☐L | ☐ | Haute | Simple |
| COM-203 | Traiter rapport (investigation, résolution) | ☐ | ☐E ☐L ☐V | ☐E ☐L ☐V | ☐L | ☐L | ☐ | ☐ | Haute | Moyen |
| COM-204 | Joindre fichiers justificatifs (photos) | ☐ | ☐C ☐L | ☐C ☐L | ☐C ☐L | ☐C ☐L | ☐C ☐L | ☐ | Moyenne | Simple |
| COM-205 | Exporter rapport incident (PDF/Excel) | ☐ | ☐X ☐L | ☐X ☐L | ☐L | ☐ | ☐ | ☐ | Moyenne | Simple |

---

## MODULE 8 : GESTION DES PATIENTS (OPTIONNEL - CHSLD)

### 8.1 Dossier Patient

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| PAT-001 | Créer dossier patient (démographiques) | ☐ | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐C ☐L | ☐ | ☐ | Moyenne | Moyen |
| PAT-002 | Ajouter informations médicales (chiffrées) | ☐ | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐ | ☐ | Moyenne | Complexe |
| PAT-003 | Assigner patient à lieu (chambre) | ☐ | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐ | ☐ | Moyenne | Simple |
| PAT-004 | Assigner patient à employé (prise en charge) | ☐ | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐L | ☐ | ☐ | Moyenne | Simple |

### 8.2 Tâches et Notes Patient

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| PAT-101 | Créer tâche patient (soin, visite) | ☐ | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐ | ☐ | Moyenne | Simple |
| PAT-102 | Ajouter note patient (privée/publique) | ☐ | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐C ☐L | ☐L | Moyenne | Simple |
| PAT-103 | Tableau blanc patient (notes collaboratives) | ☐ | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐C ☐L | ☐L | Moyenne | Moyen |

---

## MODULE 9 : GESTION DES TÂCHES

### 9.1 Tâches sur Lieux et Quarts

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| TAS-001 | Créer tâche générique (lieu/équipe) | ☐ | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E ☐S | ☐C ☐L ☐E | ☐C ☐L | ☐ | ☐ | Moyenne | Simple |
| TAS-002 | Assigner tâche à quart de travail | ☐ | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐L | ☐ | ☐ | Moyenne | Simple |
| TAS-003 | Assigner tâche à employé spécifique | ☐ | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐L | ☐ | ☐ | Moyenne | Simple |
| TAS-004 | Marquer tâche complétée | ☐ | ☐E ☐L | ☐E ☐L | ☐E ☐L | ☐E ☐L | ☐ | ☐ | Haute | Simple |
| TAS-005 | Reporter tâche non terminée (quart suivant) | ☐ | ☐E ☐L | ☐E ☐L | ☐E ☐L | ☐E ☐L | ☐ | ☐ | Moyenne | Simple |

---

## MODULE 10 : POINTAGE ET PRÉSENCES

### 10.1 Enregistrement Entrées/Sorties

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| POI-001 | Pointer entrée (début quart) | ☐ | ☐L | ☐L | ☐L | ☐C ☐L | ☐ | ☐ | Haute | Simple |
| POI-002 | Pointer sortie (fin quart) | ☐ | ☐L | ☐L | ☐L | ☐C ☐L | ☐ | ☐ | Haute | Simple |
| POI-003 | Pointer début/fin pause | ☐ | ☐L | ☐L | ☐L | ☐C ☐L | ☐ | ☐ | Moyenne | Simple |
| POI-004 | Pointage mobile (app/géolocalisation) | ☐ | ☐L | ☐L | ☐L | ☐C ☐L | ☐ | ☐ | Basse | Moyen |
| POI-005 | Pointage biométrique (reconnaissance faciale) | ☐ | ☐L | ☐L | ☐L | ☐C ☐L | ☐ | ☐ | Basse | Complexe |

### 10.2 Validation et Anomalies

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| POI-101 | Détecter retards automatiquement | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Moyenne | Simple |
| POI-102 | Détecter absences non planifiées | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Haute | Simple |
| POI-103 | Alerter gestionnaire en cas anomalie | ☐ | ☐ | ☐L | ☐L | ☐ | ☐ | ☐ | Moyenne | Simple |
| POI-104 | Corriger pointage manuellement (gestionnaire) | ☐ | ☐E ☐L | ☐E ☐L | ☐L | ☐L | ☐ | ☐ | Moyenne | Simple |

---

## MODULE 11 : CONGÉS ET ABSENCES

### 11.1 Types de Congés et Soldes

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| CON-001 | Créer type de congé (vacances, maladie, sans solde) | ☐ | ☐C ☐L ☐E ☐S | ☐L | ☐ | ☐ | ☐ | ☐ | Moyenne | Simple |
| CON-002 | Configurer règles acquisition (heures/ancienneté) | ☐ | ☐C ☐L ☐E | ☐L | ☐ | ☐ | ☐ | ☐ | Moyenne | Moyen |
| CON-003 | Calculer solde congés automatiquement | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Haute | Moyen |
| CON-004 | Consulter solde congés (employé) | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Haute | Simple |
| CON-005 | Gérer report congés (année N→N+1) | ☐ | ☐C ☐L ☐E | ☐L | ☐ | ☐L | ☐ | ☐ | Basse | Moyen |

### 11.2 Demandes et Validation

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| CON-101 | Soumettre demande congé avec dates | ☐ | ☐C ☐L | ☐C ☐L | ☐C ☐L | ☐C ☐L | ☐ | ☐ | Haute | Simple |
| CON-102 | Vérifier solde suffisant avant soumission | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Haute | Simple |
| CON-103 | Workflow validation hiérarchique (multi-niveaux) | ☐ | ☐V ☐L | ☐V ☐L | ☐V ☐L | ☐L | ☐ | ☐ | Moyenne | Moyen |
| CON-104 | Notifier employé décision (approuvé/refusé) | ☐ | ☐ | ☐ | ☐ | ☐L | ☐ | ☐ | Haute | Simple |

---

## MODULE 12 : PAIE ET COMPTABILITÉ

### 12.1 Feuilles de Temps

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| PAI-001 | Générer feuille de temps automatiquement | ☐ | ☐C ☐L ☐X | ☐C ☐L ☐X | ☐L | ☐L | ☐ | ☐ | Haute | Moyen |
| PAI-002 | Calculer heures régulières/supplémentaires | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Haute | Complexe |
| PAI-003 | Calculer primes (soir/nuit/weekend) | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Moyenne | Moyen |
| PAI-004 | Valider feuille de temps (gestionnaire) | ☐ | ☐V ☐L | ☐V ☐L | ☐L | ☐L | ☐ | ☐ | Haute | Simple |
| PAI-005 | Exporter pour système paie externe | ☐ | ☐X ☐L | ☐X ☐L | ☐ | ☐ | ☐ | ☐ | Haute | Moyen |

### 12.2 Banques d'Heures

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| PAI-101 | Gérer banque heures supplémentaires | ☐ | ☐L ☐E | ☐L ☐E | ☐L | ☐L | ☐ | ☐ | Moyenne | Moyen |
| PAI-102 | Choisir compensation (argent vs congé) | ☐ | ☐E ☐L | ☐E ☐L | ☐L | ☐E ☐L | ☐ | ☐ | Moyenne | Simple |
| PAI-103 | Suivre solde banque heures | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Moyenne | Simple |

---

## MODULE 13 : ADMINISTRATION

### 13.1 Configuration Globale

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| ADM-001 | Configurer organisation (nom, fuseau horaire) | ☐ | ☐C ☐L ☐E | ☐L | ☐ | ☐ | ☐ | ☐ | Haute | Simple |
| ADM-002 | Définir jours fériés annuels | ☐ | ☐C ☐L ☐E ☐S | ☐L | ☐ | ☐ | ☐ | ☐ | Moyenne | Simple |
| ADM-003 | Configurer périodes paie (P1/P2) | ☐ | ☐C ☐L ☐E | ☐L | ☐ | ☐ | ☐ | ☐ | Haute | Simple |
| ADM-004 | Personnaliser thème visuel (logo, couleurs) | ☐ | ☐C ☐L ☐E | ☐ | ☐ | ☐ | ☐ | ☐ | Basse | Simple |
| ADM-005 | Configurer langues disponibles (FR/EN/ES) | ☐ | ☐C ☐L ☐E | ☐ | ☐ | ☐ | ☐ | ☐ | Basse | Simple |

### 13.2 Intégrations

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| ADM-101 | Intégrer système paie externe (export) | ☐ | ☐C ☐L ☐E | ☐ | ☐ | ☐ | ☐ | ☐ | Moyenne | Complexe |
| ADM-102 | Intégrer calendrier externe (iCal/Outlook) | ☐ | ☐C ☐L ☐E | ☐L | ☐L | ☐C ☐L | ☐ | ☐ | Basse | Moyen |
| ADM-103 | Intégrer SIRH/ERP externe | ☐ | ☐C ☐L ☐E | ☐ | ☐ | ☐ | ☐ | ☐ | Basse | Complexe |

---

## MODULE 14 : AUTHENTIFICATION AVANCÉE

### 14.1 Gestion des Mots de Passe

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| AUTH-001 | Réinitialisation mot de passe par email | ☐ | ☐C ☐L | ☐C ☐L | ☐C ☐L | ☐C ☐L | ☐C ☐L | ☐C ☐L | Haute | Simple |
| AUTH-002 | Modification mot de passe utilisateur | ☐ | ☐E ☐L | ☐E ☐L | ☐E ☐L | ☐E ☐L | ☐E ☐L | ☐E ☐L | Haute | Simple |
| AUTH-003 | Politique complexité mot de passe configurable | ☐ | ☐C ☐L ☐E | ☐L | ☐ | ☐ | ☐ | ☐ | Haute | Moyen |
| AUTH-004 | Expiration automatique mot de passe (90j) | ☐ | ☐L ☐E | ☐L | ☐ | ☐L | ☐ | ☐ | Moyenne | Simple |
| AUTH-005 | Historique mots de passe (éviter réutilisation) | ☐ | ☐L | ☐L | ☐ | ☐L | ☐ | ☐ | Moyenne | Simple |

### 14.2 Authentification Multi-Facteur (MFA)

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| AUTH-101 | MFA TOTP (Google Authenticator, Authy) | ☐ | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐ | ☐ | Haute | Moyen |
| AUTH-102 | MFA SMS (code par texto) | ☐ | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐ | ☐ | Moyenne | Moyen |
| AUTH-103 | MFA Email (code par email) | ☐ | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐ | ☐ | Moyenne | Simple |
| AUTH-104 | MFA obligatoire pour Admins | ☐ | ☐L ☐E | ☐ | ☐ | ☐ | ☐ | ☐ | Haute | Simple |
| AUTH-105 | Codes de récupération MFA (backup codes) | ☐ | ☐C ☐L | ☐C ☐L | ☐C ☐L | ☐C ☐L | ☐ | ☐ | Moyenne | Simple |

### 14.3 Sécurité des Sessions

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| AUTH-201 | Expiration automatique session (30 min inactivité) | ☐ | ☐L ☐E | ☐L | ☐ | ☐L | ☐ | ☐ | Haute | Simple |
| AUTH-202 | Rate limiting tentatives connexion (5 max) | ☐ | ☐L | ☐L | ☐ | ☐L | ☐ | ☐ | Haute | Moyen |
| AUTH-203 | Alerte connexion suspecte (IP/géolocalisation) | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Moyenne | Moyen |
| AUTH-204 | Liste blanche IP (whitelist) | ☐ | ☐C ☐L ☐E ☐S | ☐ | ☐ | ☐ | ☐ | ☐ | Basse | Simple |
| AUTH-205 | Déconnexion forcée (toutes sessions utilisateur) | ☐ | ☐C ☐L | ☐ | ☐ | ☐ | ☐ | ☐ | Moyenne | Simple |

---

## MODULE 15 : DASHBOARDS ET RAPPORTS

### 15.1 Tableaux de Bord Personnalisés

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| DASH-001 | Dashboard Admin (métriques globales) | ☐ | ☐L | ☐ | ☐ | ☐ | ☐ | ☐ | Haute | Moyen |
| DASH-002 | Dashboard Gestionnaire (équipe, quarts, congés) | ☐ | ☐L | ☐L | ☐ | ☐ | ☐ | ☐ | Haute | Moyen |
| DASH-003 | Dashboard Superviseur (quarts jour, présences) | ☐ | ☐L | ☐L | ☐L | ☐ | ☐ | ☐ | Moyenne | Moyen |
| DASH-004 | Dashboard Employé (quarts, congés, pointages) | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Haute | Simple |
| DASH-005 | Widgets personnalisables (glisser-déposer) | ☐ | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐ | ☐ | Basse | Complexe |
| DASH-006 | Filtres période (jour/semaine/mois/année) | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Moyenne | Simple |

### 15.2 Génération de Rapports

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| DASH-101 | Rapport PDF horaires planifiés | ☐ | ☐C ☐L ☐X | ☐C ☐L ☐X | ☐L ☐X | ☐L ☐X | ☐ | ☐ | Haute | Moyen |
| DASH-102 | Rapport Excel feuilles de temps | ☐ | ☐C ☐L ☐X | ☐C ☐L ☐X | ☐L ☐X | ☐L ☐X | ☐ | ☐ | Haute | Moyen |
| DASH-103 | Rapport PDF congés par employé | ☐ | ☐C ☐L ☐X | ☐C ☐L ☐X | ☐L ☐X | ☐L ☐X | ☐ | ☐ | Moyenne | Simple |
| DASH-104 | Rapport Excel heures supplémentaires | ☐ | ☐C ☐L ☐X | ☐C ☐L ☐X | ☐L ☐X | ☐ | ☐ | ☐ | Haute | Moyen |
| DASH-105 | Rapport PDF bien-être (anonymisé) | ☐ | ☐C ☐L ☐X | ☐C ☐L ☐X | ☐ | ☐ | ☐ | ☐ | Moyenne | Complexe |
| DASH-106 | Rapport personnalisé (builder modèles) | ☐ | ☐C ☐L ☐E ☐X | ☐C ☐L ☐X | ☐ | ☐ | ☐ | ☐ | Basse | Complexe |
| DASH-107 | Envoi automatique rapports par email | ☐ | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐ | ☐ | ☐ | ☐ | Basse | Moyen |

### 15.3 Analyses Prédictives (IA locale)

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| DASH-201 | Prédiction turnover employés (modèle ML local) | ☐ | ☐L | ☐L | ☐ | ☐ | ☐ | ☐ | Moyenne | Complexe |
| DASH-202 | Prédiction charge de travail (pics activité) | ☐ | ☐L | ☐L | ☐L | ☐ | ☐ | ☐ | Moyenne | Complexe |
| DASH-203 | Recommandations optimisation horaires | ☐ | ☐L | ☐L | ☐L | ☐ | ☐ | ☐ | Basse | Complexe |
| DASH-204 | Détection anomalies (absences, retards) | ☐ | ☐L | ☐L | ☐L | ☐ | ☐ | ☐ | Moyenne | Moyen |

---

## MODULE 16 : DEMANDES ET ÉCHANGES DE QUARTS

### 16.1 Demandes de Quarts (Shift Requests)

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| SHIFT-001 | Consulter quarts disponibles (non assignés) | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Haute | Simple |
| SHIFT-002 | Postuler pour un quart disponible | ☐ | ☐L | ☐L | ☐C ☐L | ☐C ☐L | ☐ | ☐ | Haute | Moyen |
| SHIFT-003 | Évaluer demandes de quarts (gestionnaire) | ☐ | ☐V ☐L | ☐V ☐L | ☐V ☐L | ☐ | ☐ | ☐ | Haute | Moyen |
| SHIFT-004 | Attribution automatique selon critères (ancienneté, compétences) | ☐ | ☐C ☐L ☐E | ☐L | ☐ | ☐ | ☐ | ☐ | Moyenne | Complexe |
| SHIFT-005 | Notification attribution/refus quart | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Moyenne | Simple |
| SHIFT-006 | Historique demandes de quarts | ☐ | ☐L ☐X | ☐L ☐X | ☐L ☐X | ☐L ☐X | ☐ | ☐ | Basse | Simple |

### 16.2 Échanges de Quarts (Shift Swaps)

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| SHIFT-101 | Proposer échange de quarts (employé → employé) | ☐ | ☐L | ☐L | ☐L | ☐C ☐L | ☐ | ☐ | Haute | Moyen |
| SHIFT-102 | Accepter/refuser proposition échange | ☐ | ☐L | ☐L | ☐L | ☐E ☐L | ☐ | ☐ | Haute | Simple |
| SHIFT-103 | Validation échange par gestionnaire | ☐ | ☐V ☐L | ☐V ☐L | ☐V ☐L | ☐L | ☐ | ☐ | Haute | Moyen |
| SHIFT-104 | Vérification compétences requises (échange) | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Moyenne | Moyen |
| SHIFT-105 | Notification échange (initiateur, accepteur, gestionnaire) | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Moyenne | Simple |
| SHIFT-106 | Historique échanges de quarts | ☐ | ☐L ☐X | ☐L ☐X | ☐L ☐X | ☐L ☐X | ☐ | ☐ | Basse | Simple |
| SHIFT-107 | Annulation échange avant date effective | ☐ | ☐S ☐L | ☐S ☐L | ☐L | ☐C ☐L | ☐ | ☐ | Moyenne | Simple |

---

## MODULE 17 : SYSTÈME DE RECONNAISSANCE (BRAVO)

### 17.1 Envoi de Félicitations

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| BRAVO-001 | Envoyer Bravo à collègue | ☐ | ☐C ☐L | ☐C ☐L | ☐C ☐L | ☐C ☐L | ☐ | ☐ | Basse | Simple |
| BRAVO-002 | Catégoriser Bravo (entraide, excellence, leadership) | ☐ | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐C ☐L | ☐C ☐L | ☐ | ☐ | Basse | Simple |
| BRAVO-003 | Message personnalisé Bravo | ☐ | ☐C ☐L | ☐C ☐L | ☐C ☐L | ☐C ☐L | ☐ | ☐ | Basse | Simple |
| BRAVO-004 | Notification réception Bravo | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Basse | Simple |

### 17.2 Historique et Statistiques

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| BRAVO-101 | Consulter Bravos reçus (employé) | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Basse | Simple |
| BRAVO-102 | Consulter Bravos envoyés | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Basse | Simple |
| BRAVO-103 | Statistiques Bravos par équipe | ☐ | ☐L ☐X | ☐L ☐X | ☐L | ☐ | ☐ | ☐ | Basse | Simple |
| BRAVO-104 | Badge reconnaissance (x Bravos reçus) | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Basse | Simple |

---

## MODULE 18 : MULTI-TENANT ET ORGANISATIONS

### 18.1 Gestion des Organisations (Tenants)

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| TENANT-001 | Créer organisation (tenant) | ☐ | ☐C ☐L | ☐ | ☐ | ☐ | ☐ | ☐ | Moyenne | Complexe |
| TENANT-002 | Isolation complète données par organisation | ☐ | ☐L | ☐ | ☐ | ☐ | ☐ | ☐ | Haute | Complexe |
| TENANT-003 | Domaine personnalisé (org.oria.com) | ☐ | ☐C ☐L ☐E | ☐ | ☐ | ☐ | ☐ | ☐ | Basse | Moyen |
| TENANT-004 | Suspendre organisation (non-paiement) | ☐ | ☐E ☐L | ☐ | ☐ | ☐ | ☐ | ☐ | Moyenne | Simple |
| TENANT-005 | Activer organisation | ☐ | ☐E ☐L | ☐ | ☐ | ☐ | ☐ | ☐ | Moyenne | Simple |
| TENANT-006 | Supprimer organisation (avec données) | ☐ | ☐S ☐L | ☐ | ☐ | ☐ | ☐ | ☐ | Basse | Complexe |

### 18.2 Configuration par Organisation

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| TENANT-101 | Personnaliser branding (logo, couleurs) par tenant | ☐ | ☐C ☐L ☐E | ☐ | ☐ | ☐ | ☐ | ☐ | Basse | Moyen |
| TENANT-102 | Configurer timezone/locale par tenant | ☐ | ☐C ☐L ☐E | ☐ | ☐ | ☐ | ☐ | ☐ | Moyenne | Simple |
| TENANT-103 | Activer/désactiver fonctionnalités par tenant | ☐ | ☐E ☐L | ☐ | ☐ | ☐ | ☐ | ☐ | Moyenne | Moyen |
| TENANT-104 | Politique mot de passe personnalisée par tenant | ☐ | ☐C ☐L ☐E | ☐ | ☐ | ☐ | ☐ | ☐ | Moyenne | Simple |
| TENANT-105 | CSS personnalisé par tenant | ☐ | ☐C ☐L ☐E | ☐ | ☐ | ☐ | ☐ | ☐ | Basse | Moyen |

### 18.3 Quotas et Facturation

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| TENANT-201 | Définir quotas par plan (Starter/Pro/Enterprise) | ☐ | ☐C ☐L ☐E | ☐ | ☐ | ☐ | ☐ | ☐ | Moyenne | Moyen |
| TENANT-202 | Surveiller usage vs quotas (employés, API calls) | ☐ | ☐L | ☐ | ☐ | ☐ | ☐ | ☐ | Moyenne | Moyen |
| TENANT-203 | Alerte approche limite quota | ☐ | ☐L | ☐ | ☐ | ☐ | ☐ | ☐ | Moyenne | Simple |
| TENANT-204 | Bloquer opérations si quota dépassé | ☐ | ☐L | ☐ | ☐ | ☐ | ☐ | ☐ | Moyenne | Moyen |
| TENANT-205 | Facturation mensuelle automatique | ☐ | ☐L ☐X | ☐ | ☐ | ☐ | ☐ | ☐ | Basse | Complexe |
| TENANT-206 | Upgrade/downgrade plan | ☐ | ☐E ☐L | ☐ | ☐ | ☐ | ☐ | ☐ | Basse | Moyen |

---

## MODULE 19 : ASSISTANT IA LOCAL

### 19.1 Chatbot RH Intelligent

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| IA-001 | Poser question à assistant IA (texte) | ☐ | ☐C ☐L | ☐C ☐L | ☐C ☐L | ☐C ☐L | ☐ | ☐ | Basse | Complexe |
| IA-002 | Réponses contextuelles selon rôle utilisateur | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Basse | Complexe |
| IA-003 | Lien vers ressources pertinentes (docs, FAQ) | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Basse | Moyen |
| IA-004 | Apprentissage continu sur feedback utilisateur | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Basse | Complexe |
| IA-005 | IA 100% locale (aucune donnée externe) | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Haute | Complexe |

### 19.2 Gestion des Modèles IA

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| IA-101 | Scanner modèles IA disponibles (local) | ☐ | ☐L | ☐ | ☐ | ☐ | ☐ | ☐ | Basse | Complexe |
| IA-102 | Charger modèle IA (format GGUF, ONNX, scikit-learn) | ☐ | ☐C ☐L | ☐ | ☐ | ☐ | ☐ | ☐ | Basse | Complexe |
| IA-103 | Tester modèle IA en mode interactif | ☐ | ☐C ☐L | ☐ | ☐ | ☐ | ☐ | ☐ | Basse | Moyen |
| IA-104 | Diagnostic automatique modèle (erreurs compatibilité) | ☐ | ☐L | ☐ | ☐ | ☐ | ☐ | ☐ | Basse | Complexe |
| IA-105 | Interface web gestion modèles (modOrIA) | ☐ | ☐L | ☐ | ☐ | ☐ | ☐ | ☐ | Basse | Moyen |

---

## MODULE 20 : POINTAGE GÉOLOCALISÉ

### 20.1 Validation Géographique

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| GEO-001 | Capturer coordonnées GPS au pointage | ☐ | ☐L | ☐L | ☐L | ☐C ☐L | ☐ | ☐ | Moyenne | Moyen |
| GEO-002 | Définir périmètre autorisé par lieu (rayon GPS) | ☐ | ☐C ☐L ☐E | ☐C ☐L ☐E | ☐L | ☐ | ☐ | ☐ | Moyenne | Moyen |
| GEO-003 | Bloquer pointage hors périmètre | ☐ | ☐L ☐E | ☐L | ☐L | ☐L | ☐ | ☐ | Moyenne | Simple |
| GEO-004 | Alerte pointage suspect (hors zone) | ☐ | ☐L | ☐L | ☐L | ☐ | ☐ | ☐ | Moyenne | Simple |
| GEO-005 | Historique positions GPS (audit) | ☐ | ☐L ☐X | ☐L ☐X | ☐L | ☐ | ☐ | ☐ | Basse | Simple |

### 20.2 Reconnaissance Faciale (Optionnel)

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité | Complexité |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|----------|------------|
| GEO-101 | Capture photo au pointage (biométrie) | ☐ | ☐L | ☐L | ☐L | ☐C ☐L | ☐ | ☐ | Basse | Moyen |
| GEO-102 | Reconnaissance faciale (modèle IA local) | ☐ | ☐L | ☐L | ☐L | ☐L | ☐ | ☐ | Basse | Complexe |
| GEO-103 | Alerte identité non correspondante | ☐ | ☐L | ☐L | ☐L | ☐ | ☐ | ☐ | Basse | Moyen |
| GEO-104 | Consentement utilisateur (RGPD/Loi 25) | ☐ | ☐C ☐L ☐E | ☐L | ☐L | ☐C ☐L | ☐ | ☐ | Haute | Simple |

---

## 🎯 SYNTHÈSE DES PRIORITÉS

### Modules Haute Priorité (MVP Core)

1. ✅ **MODULE 1 : Moteur de Règles** - Cœur décisionnel
2. ✅ **MODULE 2 : Sécurité/Utilisateurs** - Authentification et hiérarchie
3. ✅ **MODULE 3 : Audit** - Conformité légale
4. ✅ **MODULE 4 : Horaires** - Planification des quarts
5. ✅ **MODULE 6 : Bien-être** - Différenciation concurrentielle
6. ✅ **MODULE 14 : Authentification Avancée** - MFA/Sécurité sessions
7. ✅ **MODULE 16 : Demandes/Échanges Quarts** - Flexibilité employés

### Modules Moyenne Priorité

8. ⏳ **MODULE 5 : Statistiques** - Insights décisionnels
9. ⏳ **MODULE 7 : Communication** - Coordination d'équipe
10. ⏳ **MODULE 10 : Pointage** - Suivi présences
11. ⏳ **MODULE 11 : Congés** - Gestion absences
12. ⏳ **MODULE 15 : Dashboards/Rapports** - Visualisation données
13. ⏳ **MODULE 20 : Pointage Géolocalisé** - Validation GPS

### Modules Basse Priorité (Post-MVP)

14. 🔜 **MODULE 8 : Patients** - Spécifique CHSLD
15. 🔜 **MODULE 9 : Tâches** - Gestion fine activités
16. 🔜 **MODULE 12 : Paie** - Intégration comptable
17. 🔜 **MODULE 13 : Administration** - Configuration avancée
18. 🔜 **MODULE 17 : Système Bravo** - Reconnaissance collègues
19. 🔜 **MODULE 18 : Multi-Tenant** - Gestion organisations
20. 🔜 **MODULE 19 : Assistant IA** - Chatbot RH local

---

## 📊 STATISTIQUES DU SONDAGE

**Total requis identifiés** : 400+
**Modules couverts** : 20
**Rôles définis** : 7 (Admin, Gestionnaire, Superviseur, Employé, Patient, Famille, IA)
**Actions par rôle** : 6 (Créer, Lire, Éditer, Supprimer, eXporter, Valider)
**Nouveaux requis V3** : 150+ (modules 14-20)

---

## 🔐 LÉGENDE DES NIVEAUX D'ACCRÉDITATION

| Rôle | Niveau | Description |
|------|--------|-------------|
| **Super Admin** | 100 | Accès audit complet (Oria) |
| **Owner** | 99 | Propriétaire organisation |
| **Administrateur** | 80-98 | Admin établissement |
| **Gestionnaire** | 50-79 | Manager équipe/département |
| **Superviseur** | 30-49 | Chef d'équipe terrain |
| **Employé** | 10-29 | Personnel soignant/technique |
| **Patient** | 2-9 | Usager services |
| **Famille/Anonyme** | 0-1 | Visiteur/proche |

---

**Fin du sondage - Prêt pour sélection MVP**
