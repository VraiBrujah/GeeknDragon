# 📋 Sondage des Requis - ORIA MVP (4 Modules)

**Date de création** : 2025-10-07
**Version** : 2.0
**Objectif** : Déterminer les requis à développer pour le MVP ORIA et définir les droits par rôle utilisateur

---

## 🎯 Instructions d'utilisation

Ce sondage permet de sélectionner les requis fonctionnels pour le MVP ORIA en 4 modules principaux, inspirés de Zoho, et de définir les permissions par rôle.

### Utilisation du système

1. **Sélectionner un utilisateur** : Cliquez sur "Sélectionner un utilisateur" ou créez-en un nouveau
2. **Répondre au sondage** : Cochez les cases pour les fonctionnalités souhaitées et les permissions par rôle
3. **Personnaliser les priorités** : Modifiez les priorités (1-10) selon vos besoins
4. **Ajouter des notes** : Utilisez le champ Notes pour vos commentaires personnels
5. **Sauvegarder** : Cliquez sur "Sauvegarder" régulièrement (le système conserve votre session lors du rafraîchissement F5)
6. **Exporter** : Exportez vos réponses en JSON ou CSV
7. **Comparer** : Comparez les réponses de plusieurs utilisateurs côte à côte
8. **Déconnexion** : Utilisez le bouton "Déconnexion" pour changer d'utilisateur

### Légende des colonnes

| Colonne | Description |
|---------|-------------|
| **MVP** | ☐ Inclure dans le MVP / ☑ Sélectionné |
| **Rôles (Admin, Gestionnaire, etc.)** | Actions autorisées : **C**(réer) **L**(ire) **E**(diter) **S**(upprimer) e**X**(porter) **V**(alider) |
| **Priorité (1-10)** | Niveau de priorité éditable (1=faible, 10=critique) - Personnalisez selon vos besoins |
| **Complexité (1-10)** | Estimation de la difficulté technique (1=simple, 10=très complexe) |
| **Estimation** | Temps de développement estimé pour un développeur seul, incluant conception, développement, tests et intégration |
| **Notes** | Champ libre pour vos commentaires et observations personnels |

### Rôles définis

1. **Admin** - Administrateur système (accréditation 80-98)
2. **Gestionnaire** - Gestionnaire d'équipe/département (accréditation 50-79)
3. **Superviseur** - Superviseur terrain (accréditation 30-49)
4. **Employé** - Personnel terrain (accréditation 10-29)
5. **Patient** - Usager (CHSLD) (accréditation 2-9)
6. **Famille** - Proche/Visiteur (accréditation 0-1)

### Échelles de référence

**Priorité (1-10)** :
- 10 : Critique - Bloquant pour MVP
- 7-9 : Haute - Important pour MVP
- 4-6 : Moyenne - Utile mais non bloquant
- 1-3 : Basse - Post-MVP

**Complexité (1-10)** :
- 1-3 : Simple - Fonctionnalité basique CRUD
- 4-6 : Moyenne - Logique métier modérée
- 7-9 : Complexe - Algorithmes avancés, intégrations
- 10 : Très complexe - IA, optimisation, sécurité avancée

**Estimations** :
- Simple (1-3) : 8-16h (1-2 jours)
- Moyen (4-6) : 24-40h (3-5 jours)
- Complexe (7-9) : 80-120h (2-3 semaines)
- Très complexe (10) : 120-200h (3-5 semaines)

*Note : Les estimations incluent conception, développement, tests, intégration et documentation pour un développeur travaillant seul.*

---

## MODULE 1 : COMMUNICATION

Ce module gère toutes les interactions : demandes (congés, échanges), messagerie, annonces, rapports d'incident.

### 1.1 Demandes de Congés

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| COM-001 | Soumettre une demande de congé avec dates de début et fin, type de congé et motif optionnel | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| COM-002 | Approuver ou refuser une demande de congé avec justification et notification automatique à l'employé | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| COM-003 | Validation des ressources humaines en deuxième niveau pour certains types de congés nécessitant double approbation | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| COM-004 | Consulter l'historique complet des congés avec filtres par date, type, statut et employé | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| COM-005 | Annuler ou modifier une demande de congé avant son approbation finale avec notification des parties concernées | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| COM-006 | Joindre un justificatif médical ou autre document PDF ou image lors de la demande de congé | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| COM-007 | Calculer automatiquement le solde de congés restant par type (vacances, maladie, personnel) avec projection fin d'année | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| COM-008 | Afficher le calendrier des congés approuvés de l'équipe pour éviter conflits et maintenir effectifs minimaux | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| COM-009 | Configurer les règles d'accumulation de congés selon ancienneté et convention collective avec calcul automatique | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 9 | 80-120h | |
| COM-010 | Gérer les reports de congés non utilisés d'une année à l'autre avec limites maximales et dates d'expiration | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |

### 1.2 Absences Maladie

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| COM-101 | Déclarer une absence maladie imprévue en temps réel avec notification immédiate au gestionnaire et superviseur | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| COM-102 | Valider un justificatif médical pour les absences maladie de plus de 2 jours consécutifs conformément aux normes du travail | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| COM-103 | Suivre le taux d'absentéisme par employé, équipe et département avec alertes automatiques si dépassement de seuils | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| COM-104 | Gérer les absences de longue durée avec suivi médical, retour progressif au travail et accommodements raisonnables | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 9 | 80-120h | |
| COM-105 | Intégrer avec les assurances collectives pour déclarations d'invalidité et suivi des prestations | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 9 | 80-120h | |

### 1.3 Échanges de Quarts

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| COM-201 | Proposer un échange de quart de travail à un ou plusieurs collègues avec message explicatif et date limite de réponse | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| COM-202 | Accepter ou refuser une proposition d'échange de quart provenant d'un collègue avec notification automatique | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| COM-203 | Valider ou rejeter un échange de quart approuvé entre employés par le gestionnaire pour confirmer la modification d'horaire | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| COM-204 | Annuler une demande d'échange de quart avant sa validation finale par les parties concernées | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| COM-205 | Consulter l'historique complet des échanges de quarts avec raisons, dates et statuts d'approbation | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| COM-206 | Configurer des limitations sur le nombre d'échanges de quarts par période pour éviter abus et maintenir stabilité | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |

### 1.4 Rapports d'Incident

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| COM-301 | Soumettre un rapport d'incident de sécurité ou santé au travail avec description détaillée, lieu, date, heure et personnes impliquées | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 7 | 24-40h | |
| COM-302 | Traiter et suivre l'évolution d'un incident avec statuts (nouveau, en cours, résolu, fermé) et historique des actions | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 7 | 24-40h | |
| COM-303 | Joindre des photos, vidéos ou documents PDF au rapport d'incident pour documenter la situation | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 5 | 8-16h | |
| COM-304 | Archiver automatiquement les incidents conformément aux exigences de la CNESST pour conservation de 5 ans minimum | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 5 | 8-16h | |

### 1.5 Babillard / Annonces

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| COM-401 | Publier une annonce visible globalement pour toute l'organisation ou ciblée pour une équipe spécifique avec date d'expiration | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| COM-402 | Consulter le fil d'actualité avec annonces triées par date de publication et badge de notification pour nouveautés | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| COM-403 | Modifier le contenu ou supprimer une annonce existante avec conservation de l'historique des modifications | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| COM-404 | Accuser réception d'une annonce pour confirmer sa lecture avec suivi des employés ayant lu ou non | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |

### 1.6 Messagerie Interne

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| COM-501 | Envoyer un message privé individuel chiffré de bout en bout entre deux utilisateurs avec garantie de confidentialité | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| COM-502 | Créer un groupe ou canal de discussion thématique avec gestion des membres et permissions personnalisées | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 7 | 24-40h | |
| COM-503 | Joindre des fichiers, images ou documents aux messages avec prévisualisation et limite de taille configurable | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| COM-504 | Afficher l'accusé de réception d'un message avec statut vu ou lu et horodatage de consultation | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |

### 1.7 Notifications

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| COM-601 | Configurer les préférences de notification par canal (courriel, SMS, application mobile, notification poussée) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| COM-602 | Recevoir des notifications en temps réel pour événements critiques (absence imprévue, incident sécurité, quart non couvert) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| COM-603 | Gérer les rappels automatiques pour actions en attente (approbations, validations, tâches non complétées) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| COM-604 | Consulter l'historique des notifications envoyées avec leur statut de lecture et horodatage de consultation | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| COM-605 | Valider automatiquement les notifications après un délai configurable pour éviter accumulation de notifications non traitées | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 5 | 8-16h | Auto-validation temporisée pour garder interface propre |

### 1.8 Collaboration d'Équipe

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| COM-701 | Créer et gérer des notes de transmission entre quarts de travail pour continuité des soins et communications importantes | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| COM-702 | Partager des listes de vérification et procédures opératoires standardisées accessibles pendant les quarts de travail | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| COM-703 | Documenter les événements importants du quart avec horodatage pour assurer continuité des soins et traçabilité | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| COM-704 | Créer et gérer des tableaux blancs collaboratifs pour lieux ou patients avec éléments, responsables et statuts pour coordination d'équipe | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-32h | Fonctionnalité permettant le suivi collaboratif de tâches et notes partagées par équipe |

---

## MODULE 2 : GESTION DES HORAIRES

Ce module couvre la planification, assignation, visualisation et gestion complète des quarts de travail.

### 2.1 Création et Planification

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| HOR-001 | Créer quart de travail manuel | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| HOR-002 | Éditer quart existant | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| HOR-003 | Supprimer quart planifié | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| HOR-004 | Créer modèle de quart récurrent | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| HOR-005 | Dupliquer semaine horaire | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| HOR-006 | Créer des modèles d'horaires récurrents avec rotation configurables (2 semaines, 3 semaines, mensuelle, personnalisée) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| HOR-007 | Copier un horaire existant vers une nouvelle période avec possibilité d'ajustements mineurs avant publication | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| HOR-008 | Planifier les horaires à l'avance sur plusieurs mois avec visibilité progressive pour les employés selon période | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| HOR-009 | Bloquer des périodes de haute demande (Noël, été, événements) avec règles spéciales et restrictions de congés | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |

### 2.2 Assignation Employés

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| HOR-101 | Assigner employé à quart (manuel) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| HOR-102 | Retirer employé assigné | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| HOR-103 | Assignation automatique IA (optimisée) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 9 | 80-120h | |
| HOR-104 | Assigner plusieurs employés (même quart) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| HOR-105 | Planification automatique intelligente avec prévision de la demande basée sur l'historique et les tendances saisonnières | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 9 | 80-120h | |
| HOR-106 | Correspondance automatique entre les compétences requises pour un quart et les certifications des employés disponibles | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 9 | 80-120h | |
| HOR-107 | Remplissage automatique des quarts de travail ouverts en proposant les employés qualifiés et disponibles selon leurs compétences | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 9 | 80-120h | |
| HOR-108 | Gérer les bassins d'employés flottants pouvant être assignés à différentes unités ou départements selon les besoins | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 9 | 80-120h | |

### 2.3 Quarts Ouverts / Volontariat

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| HOR-201 | Publier quart ouvert (non assigné) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| HOR-202 | Postuler sur quart ouvert (employé) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| HOR-203 | Approuver candidature quart | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| HOR-204 | Prioriser automatiquement les candidatures aux quarts ouverts selon l'ancienneté, les compétences et l'historique de l'employé | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 9 | 80-120h | |
| HOR-205 | Enregistrer horodatages de toutes les actions sur les quarts pour assurer équité et traçabilité complète des opérations | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| HOR-206 | Publier des quarts en temps supplémentaire avec majoration salariale configurée selon politique organisationnelle | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| HOR-207 | Gérer une liste d'attente pour quarts populaires avec ordre d'attribution équitable basé sur ancienneté et historique | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |

### 2.4 Disponibilités et Préférences

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| HOR-301 | Saisir disponibilités (employé) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| HOR-302 | Consulter disponibilités équipe | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| HOR-303 | Définir préférences horaires (jour/soir/nuit) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| HOR-304 | Alerte assignation hors disponibilité | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| HOR-305 | Gérer les indisponibilités récurrentes (cours universitaires, engagements personnels) avec répétition automatique | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| HOR-306 | Définir des préférences de collègues préférés pour travail d'équipe et cohésion optimale | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 5 | 8-16h | |

### 2.5 Visualisation Calendrier

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| HOR-401 | Vue calendrier individuelle (employé) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| HOR-402 | Vue calendrier équipe | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| HOR-403 | Vue calendrier globale (tous sites) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| HOR-404 | Filtrer par lieu/département/poste | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| HOR-405 | Glisser-déposer (drag & drop UX) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |

### 2.6 Détection Conflits

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| HOR-501 | Détecter chevauchement quarts (même employé) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| HOR-502 | Détecter violation repos minimum (8h) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| HOR-503 | Détecter dépassement heures/semaine | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| HOR-504 | Détecter employé non qualifié (compétences) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| HOR-505 | Alerter automatiquement lorsqu'un employé approche ou dépasse le seuil d'heures supplémentaires excessives défini | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| HOR-506 | Contrôler et valider le ratio minimal de personnel par quart selon le type de poste (exemple: minimum 2 infirmiers par quart de nuit) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |

### 2.7 Exportation Horaires

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| HOR-601 | Exporter PDF calendrier hebdo | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| HOR-602 | Exporter Excel planning mensuel | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| HOR-603 | Export iCal (calendrier externe) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |

### 2.8 Historique Modifications

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| HOR-701 | Journaliser toute modification horaire | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 5 | 8-16h | |
| HOR-702 | Consulter historique (qui/quand/quoi) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 5 | 8-16h | |

### 2.9 Pointage et Présence

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| HOR-801 | Pointer l'arrivée et le départ de chaque quart de travail avec horodatage précis et géolocalisation optionnelle | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| HOR-802 | Gérer les retards et départs anticipés avec justification obligatoire et validation du superviseur | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| HOR-803 | Ajuster automatiquement les heures réellement travaillées vs heures planifiées avec calcul des écarts et approbation | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| HOR-804 | Détecter automatiquement les anomalies de pointage (oublis, incohérences temporelles, doublons) avec alertes | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| HOR-805 | Exporter les données de présence vers système de paie avec format compatible (CSV, XML, API) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 9 | 80-120h | |

### 2.10 Gestion Heures Supplémentaires

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| HOR-901 | Calculer automatiquement les heures supplémentaires selon règles LNT Québec (au-delà de 40h/semaine à taux 1.5x) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 9 | 80-120h | |
| HOR-902 | Distinguer automatiquement heures normales, supplémentaires (1.5x) et majorées (2x pour jours fériés) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 9 | 80-120h | |
| HOR-903 | Pré-approuver ou rejeter les demandes d'heures supplémentaires avant leur exécution avec workflow configurable | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| HOR-904 | Suivre le budget d'heures supplémentaires par équipe et département avec alertes de dépassement budgétaire | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| HOR-905 | Offrir option de compensation en temps libre au lieu de paiement selon préférence employé et règles organisationnelles | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |

---

## MODULE 3 : GESTIONNAIRE (RH Opérationnel)

Ce module regroupe la gestion du personnel, des lieux, équipes, tâches et patients (CHSLD).

### 3.1 Gestion Employés

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| GES-001 | Créer fiche employé | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| GES-002 | Consulter profil employé | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| GES-003 | Modifier profil employé | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| GES-004 | Désactiver/archiver employé | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| GES-005 | Importer employés en masse (CSV) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| GES-005b | Exporter liste employés en masse (CSV/Excel) avec filtres personnalisables pour rapports et analyses externes | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | Complémentaire à GES-005 pour import/export bidirectionnel |
| GES-006 | Gérer les compétences et certifications des employés avec dates d'obtention et d'expiration | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| GES-007 | Suivre la formation obligatoire et envoyer des rappels automatiques avant expiration des certifications | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| GES-008 | Gérer le processus d'intégration des nouveaux employés avec liste de vérification et tâches automatisées | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| GES-009 | Centraliser tous les documents RH (contrat, évaluations, formations, disciplinaires) par employé dans dossier sécurisé | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| GES-010 | Gérer les évaluations de performance avec objectifs mesurables, révisions périodiques et plans de développement | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 9 | 80-120h | |

### 3.2 Gestion Lieux

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| GES-101 | Créer lieu/unité | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| GES-102 | Consulter lieu | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| GES-103 | Modifier lieu | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| GES-104 | Supprimer/archiver lieu | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| GES-105 | Hiérarchie lieux (parent→enfants) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |

### 3.3 Gestion Équipes

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| GES-201 | Créer équipe/département | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| GES-202 | Consulter équipe | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| GES-203 | Modifier équipe | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| GES-204 | Supprimer équipe | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| GES-205 | Assigner employé à équipe | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| GES-206 | Désigner responsable équipe | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |

### 3.4 Gestion Tâches

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| GES-301 | Créer tâche sur quart | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| GES-302 | Consulter tâches quart | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| GES-303 | Modifier tâche | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| GES-304 | Supprimer tâche | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| GES-305 | Marquer tâche complétée | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| GES-306 | Valider tâches (superviseur) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| GES-307 | Transmission tâches non terminées | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| GES-308 | Créer des modèles de tâches récurrentes standardisées pour différents types de quarts et contextes opérationnels | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| GES-309 | Affecter automatiquement des tâches spécifiques aux employés qualifiés selon leurs compétences et certifications | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| GES-310 | Suivre le temps réel passé sur chaque tâche pour analyse de productivité et optimisation future des allocations | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 7 | 24-40h | |

### 3.5 Gestion Patients (CHSLD)

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| GES-401 | Créer profil patient | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| GES-402 | Consulter profil patient | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| GES-403 | Modifier profil patient | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| GES-404 | Archiver patient (sortie) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| GES-405 | Assigner patient à employé (prise en charge) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| GES-406 | Gérer tâches liées patient (soins) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| GES-407 | Consulter historique patient | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |

### 3.6 Rapports et KPI

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| GES-501 | Consulter KPI RH (taux absentéisme, turnover) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| GES-502 | Exporter rapports RH (PDF/Excel) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| GES-503 | Sondages feedback employés | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| GES-504 | Afficher un tableau de bord temps réel avec indicateurs clés (taux présence, absences, heures supplémentaires, coûts) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| GES-505 | Analyser les coûts de main-d'oeuvre par département avec prévisions budgétaires et comparaisons historiques | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 9 | 80-120h | |
| GES-506 | Comparer les performances entre équipes et départements avec indicateurs normalisés et benchmarking | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| GES-507 | Générer des rapports de conformité réglementaire (LNT Québec, CNESST) automatiques avec preuves documentées | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| GES-508 | Exporter toutes les données vers outils d'analyse externe (Excel, Power BI, Tableau) avec formats standardisés | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |

### 3.7 Gestion des Remplacements

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| GES-601 | Gérer une liste de remplaçants qualifiés par type de poste avec disponibilités et compétences validées | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| GES-602 | Contacter automatiquement les remplaçants selon ordre de priorité (ancienneté, distance, historique) avec notifications multiples | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 9 | 80-120h | |
| GES-603 | Suivre l'historique complet des remplacements avec taux d'acceptation, refus et raisons pour optimisation | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| GES-604 | Gérer les remplacements d'urgence avec protocole accéléré et notifications prioritaires à tous remplaçants qualifiés | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |

### 3.8 Prévisions et Budgétisation

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| GES-701 | Prévoir les besoins futurs en personnel selon volume d'activité historique et tendances saisonnières avec IA | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 9 | 80-120h | |
| GES-702 | Budgétiser les coûts de main-d'oeuvre par période et département avec allocations et contrôles budgétaires | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 9 | 80-120h | |
| GES-703 | Comparer les prévisions budgétaires vs dépenses réelles avec analyse des écarts et justifications | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| GES-704 | Optimiser automatiquement les horaires pour respecter les contraintes budgétaires sans compromettre les services | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 9 | 80-120h | |

---

## MODULE 4 : ADMINISTRATION ET BIEN-ÊTRE

Ce module couvre la configuration globale, la sécurité, les règles métier et le module bien-être avec IA.

### 4.1 Configuration Globale

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| ADM-001 | Créer organisation (multi-tenant) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 9 | 80-120h | |
| ADM-002 | Configurer profil organisation (nom, fuseau, devise) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| ADM-003 | Personnaliser branding (logo, couleurs) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| ADM-004 | Définir jours fériés annuels | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| ADM-005 | Configurer les fuseaux horaires multiples pour organisations opérant dans différentes régions géographiques | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| ADM-006 | Gérer les langues disponibles dans l'interface (français, anglais, multilingue) avec traductions complètes | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| ADM-007 | Personnaliser les étiquettes et terminologie selon secteur d'activité (santé, commerce, industrie, etc.) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |

### 4.2 Types et Référentiels

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| ADM-101 | Définir types de quarts (jour/soir/nuit) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| ADM-102 | Définir types d'employés (temps plein/partiel) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| ADM-103 | Définir types de congés (vacances/maladie/sans solde) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| ADM-104 | Définir types de lieux (succursale/étage/unité) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| ADM-105 | Définir les types de tâches avec temps estimé, compétences requises et instructions détaillées | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| ADM-106 | Gérer la hiérarchie complète des postes et titres d'emploi avec responsabilités et niveaux de rémunération | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| ADM-107 | Configurer les types d'événements et incidents avec niveau de gravité et procédures de traitement | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |

### 4.3 Sécurité et Permissions

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| ADM-201 | Gérer comptes utilisateurs | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| ADM-202 | Attribuer rôles (Admin/Gestionnaire/etc) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| ADM-203 | Activer MFA (authentification 2 facteurs) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| ADM-204 | Politique mot de passe (complexité, expiration) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| ADM-205 | Journal audit complet (logs) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| ADM-206 | Gérer les sessions actives de tous utilisateurs et forcer déconnexion à distance en cas de compromission | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| ADM-207 | Configurer les restrictions d'accès par plage d'adresses IP ou géolocalisation pour sécurité renforcée | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| ADM-208 | Consulter l'historique complet des connexions avec détection automatique d'activités suspectes et alertes | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |

### 4.4 Règles Métier (Moteur)

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| ADM-301 | Limite heures/jour (ex: 14h max) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| ADM-302 | Repos minimum entre quarts (8h) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| ADM-303 | Limite heures/semaine (40h-50h) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| ADM-304 | Ratio personnel minimal (ex: 2 infirmiers/quart) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| ADM-305 | Validation double approbation | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| ADM-306 | Règles priorité (ancienneté, compétences) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 9 | 80-120h | |
| ADM-307 | Builder de règles (JSONLogic visuel) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 9 | 80-120h | |

### 4.5 Intégrations

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| ADM-401 | Export paie (Sage/Nethris/ADP) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 9 | 80-120h | |
| ADM-402 | Intégration SIRH/ERP | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 9 | 80-120h | |
| ADM-403 | SSO/LDAP (Active Directory) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 9 | 80-120h | |
| ADM-404 | Export calendrier (iCal) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| ADM-405 | Intégrer avec systèmes de gestion des temps (terminaux biométriques, badgeuse, NFC) pour pointage automatisé | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 9 | 80-120h | |
| ADM-406 | Synchroniser bidirectionnellement avec Active Directory ou LDAP pour gestion centralisée des utilisateurs | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 9 | 80-120h | |
| ADM-407 | Configurer des webhooks pour envoyer notifications vers systèmes externes (Slack, Teams, systèmes internes) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 7 | 24-40h | |
| ADM-408 | Fournir une API REST complète et documentée pour intégrations tierces personnalisées avec authentification sécurisée | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 9 | 80-120h | |

### 4.6 Bien-être avec IA

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| BET-001 | Chatbot IA empathique | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 9 | 80-120h | |
| BET-002 | Sondage humeur (quotidien/hebdo) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| BET-003 | Suggestions personnalisées IA | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 9 | 80-120h | |
| BET-004 | Nudges bien-être (rappels pause) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| BET-005 | Dashboard bien-être (employé) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| BET-006 | Dashboard agrégé (gestionnaire) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| BET-007 | Score bien-être agrégé (équipe) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 9 | 80-120h | |
| BET-008 | Défis santé (gamification) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| BET-009 | Ressources psychoéducatives | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| BET-010 | Surveiller en continu le bien-être des employés par analyses passives plutôt que seulement par sondages annuels | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 9 | 80-120h | |
| BET-011 | Analyser les habitudes de travail pour détecter heures excessives, pauses manquées et comportements à risque d'épuisement | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 9 | 80-120h | |
| BET-012 | Suivre l'intensité de la charge de travail de chaque employé avec alertes en cas de surcharge prolongée | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 9 | 80-120h | |
| BET-013 | Proposer automatiquement des interventions personnalisées comme ajustement de charge de travail ou rappels de pause | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 9 | 80-120h | |

### 4.7 Analyse Passive (IA)

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| BET-101 | Analyser automatiquement le ton émotionnel des messages par traitement du langage naturel pour détecter sentiment négatif | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 9 | 80-120h | |
| BET-102 | Suivre la fréquence et les habitudes de communication de chaque employé pour identifier changements comportementaux | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 9 | 80-120h | |
| BET-103 | Détecter les délais de réponse anormalement longs ou courts pouvant indiquer stress ou désengagement | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 7 | 24-40h | |
| BET-104 | Identifier automatiquement les mots-clés émotionnels négatifs comme détresse, stress, fatigue dans les communications | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 9 | 80-120h | |
| BET-105 | Détecter précocement les signaux faibles d'épuisement professionnel par analyse prédictive multicritères | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 9 | 80-120h | |
| BET-106 | Envoyer des alertes confidentielles aux gestionnaires lorsqu'un employé présente un risque élevé d'épuisement | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 7 | 24-40h | |
| BET-107 | Anonymiser complètement toutes les données sensibles conformément au RGPD européen et à la Loi 25 québécoise | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| BET-108 | Analyser les données de communication provenant de multiples sources (courriels, messagerie interne, outils externes) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 9 | 80-120h | |
| BET-109 | Intégrer avec les plateformes d'analyse du bien-être Microsoft Viva Insights ou Workday People Analytics | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 9 | 80-120h | |

### 4.8 Sauvegarde et Archivage

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| ADM-501 | Effectuer des sauvegardes automatiques quotidiennes de toutes les données avec rétention configurable | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| ADM-502 | Exporter toutes les données d'une organisation complète vers format archive standard pour conservation légale | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| ADM-503 | Restaurer les données depuis une sauvegarde spécifique avec sélection granulaire (employé, période, module) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 9 | 80-120h | |
| ADM-504 | Archiver automatiquement les données anciennes selon politique de rétention avec compression et indexation | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| ADM-505 | Purger définitivement les données au-delà de la période de rétention légale avec preuve de destruction | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |

### 4.9 Conformité et Juridique

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| ADM-601 | Générer automatiquement des rapports de conformité LNT Québec (heures travaillées, repos, congés, heures sup) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 9 | 80-120h | |
| ADM-602 | Générer des preuves électroniques horodatées et infalsifiables pour litiges juridiques ou audits réglementaires | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 9 | 80-120h | |
| ADM-603 | Gérer les demandes d'accès à l'information selon RGPD européen et Loi 25 québécoise avec workflow tracé | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| ADM-604 | Assurer la traçabilité complète de toutes modifications avec identification de l'auteur, date, heure et contexte | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| ADM-605 | Recueillir le consentement explicite des employés pour collecte et traitement des données personnelles conformément à la loi | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |

---

## 📊 STATISTIQUES DU SONDAGE

**Total requis identifiés** : 340
**Modules couverts** : 4 (Communication, Horaires, Gestionnaire, Administration+Bien-être)
**Nouvelles sections ajoutées** : 7 (1.8 Collaboration d'Équipe, 2.9 Pointage et Présence, 2.10 Gestion Heures Supplémentaires, 3.7 Gestion des Remplacements, 3.8 Prévisions et Budgétisation, 4.8 Sauvegarde et Archivage, 4.9 Conformité et Juridique)
**Rôles définis** : 6 (Admin, Gestionnaire, Superviseur, Employé, Patient, Famille)
**Actions par rôle** : 6 (Créer, Lire, Éditer, Supprimer, eXporter, Valider)

### Répartition des Requis par Module
- **MODULE 1 - Communication** : 83 requis (incluant 19 ajouts critiques)
- **MODULE 2 - Gestion des Horaires** : 93 requis (incluant 15 ajouts critiques + 2 nouvelles sections)
- **MODULE 3 - Gestionnaire** : 93 requis (incluant 19 ajouts critiques + 2 nouvelles sections)
- **MODULE 4 - Administration et Bien-être** : 71 requis (incluant 17 ajouts critiques + 2 nouvelles sections)

## 🎯 NOUVEAUX REQUIS IDENTIFIÉS (Analyse Concurrentielle 2025)

### MODULE 2 : HORAIRES
- HOR-105 : Planification automatique intelligente avec prévision de la demande basée sur l'historique
- HOR-106 : Correspondance automatique entre compétences requises et certifications des employés
- HOR-107 : Remplissage automatique des quarts ouverts avec employés qualifiés disponibles
- HOR-108 : Gestion des bassins d'employés flottants pouvant être assignés à différentes unités
- HOR-204 : Priorisation automatique des candidatures selon ancienneté, compétences et historique
- HOR-205 : Enregistrement horodaté de toutes actions pour assurer équité et traçabilité
- HOR-505 : Alertes automatiques lors de dépassement du seuil d'heures supplémentaires
- HOR-506 : Contrôle et validation du ratio minimal de personnel par quart selon type de poste

### MODULE 3 : GESTIONNAIRE
- GES-503 : Sondages de rétroaction des employés

### MODULE 4 : BIEN-ÊTRE INTELLIGENCE ARTIFICIELLE
- BET-010 : Surveillance continue du bien-être par analyses passives plutôt que sondages annuels uniquement
- BET-011 : Analyse des habitudes de travail pour détecter heures excessives et pauses manquées
- BET-012 : Suivi de l'intensité de la charge de travail avec alertes en cas de surcharge prolongée
- BET-013 : Propositions automatiques d'interventions personnalisées comme ajustement de charge ou rappels de pause
- BET-108 : Analyse des données provenant de multiples sources de communication (courriels, messagerie interne, outils externes)
- BET-109 : Intégration avec plateformes d'analyse du bien-être Microsoft Viva Insights ou Workday People Analytics

**Sources documentées** : Agendrix, Deputy, Homebase, Evolia, Workday, Shiftboard, StaffReady, Microsoft Viva Insights, Workday People Analytics (2025)

---

**Fin du sondage - Version 4 modules - Prêt pour sélection MVP**
