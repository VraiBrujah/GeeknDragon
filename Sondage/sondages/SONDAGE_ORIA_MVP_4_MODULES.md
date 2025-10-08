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
| COM-305 | Créer et assigner des tâches correctives suite à un rapport d'incident avec responsable, échéance et priorité définis | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | Permet suivi structuré actions correctives avec traçabilité complète |
| COM-306 | Exporter un rapport d'incident individuel en format PDF avec toutes pièces jointes et historique des actions pour documentation externe | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | Export formaté professionnel pour CNESST et assurances |
| COM-307 | Exporter plusieurs rapports d'incident en lot vers format Excel avec filtres personnalisables pour analyses statistiques et rapports périodiques | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | Permet analyses tendances et rapports management sécurité |

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
| COM-505 | Consulter la boîte de réception avec liste des messages reçus triés par date avec indicateur lu/non lu | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | Fonctionnalité essentielle pour consultation messages reçus |
| COM-506 | Consulter les messages envoyés avec historique complet des communications sortantes triées par date | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | Permet suivi conversations et historique envois |
| COM-507 | Marquer un message comme lu manuellement avec mise à jour statut et horodatage de lecture | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 3 | 4-8h | Gestion manuelle statuts lecture par utilisateur |
| COM-508 | Supprimer logiquement un message sans suppression définitive avec masquage pour expéditeur ou destinataire | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | Soft delete préservant intégrité conversations et audit |
| COM-509 | Recevoir notifications en temps réel via WebSocket pour nouveaux messages et événements sans rafraîchissement page | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 8 | 40-60h | Communication temps réel essentielle pour réactivité système |
| COM-510 | Envoyer félicitations ou bravos à un collègue pour reconnaître bon travail et renforcer cohésion équipe | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 5 | 8-16h | Fonctionnalité bien-être et reconnaissance entre employés |

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

### 1.9 Tableaux Blancs Collaboratifs

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| COM-801 | Créer un tableau blanc collaboratif associé à un lieu spécifique avec nom personnalisable et suivi créateur | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 5 | 8-16h | Permet organisation tâches par unité ou département |
| COM-802 | Créer un tableau blanc collaboratif associé à un patient spécifique pour suivi individualisé des soins et interventions | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 5 | 8-16h | Centralise actions et notes par résident/patient |
| COM-803 | Modifier le nom d'un tableau blanc existant avec conservation historique modifications et audit trail complet | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 3 | 4-8h | Gestion flexible tableaux avec traçabilité |
| COM-804 | Supprimer un tableau blanc et tous ses éléments associés avec confirmation utilisateur et archivage sécurisé | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | Suppression cascade sécurisée avec audit trail |
| COM-805 | Lister tous les tableaux blancs associés à un lieu spécifique avec tri par date création et nom | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 5 | 8-16h | Navigation tableaux par unité/département |
| COM-806 | Lister tous les tableaux blancs associés à un patient avec historique complet interventions et suivis | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 5 | 8-16h | Vue centralisée tous tableaux d'un résident |
| COM-807 | Ajouter un élément (tâche, note, action) à un tableau avec description, titre optionnel et statut initial | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | Fonctionnalité cœur pour ajout tâches et notes |
| COM-808 | Modifier un élément existant avec mise à jour description, titre, statut ou responsable assigné avec horodatage | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | Gestion complète cycle vie éléments avec audit |
| COM-809 | Supprimer un élément d'un tableau blanc avec confirmation et enregistrement action dans historique audit | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 3 | 4-8h | Suppression éléments avec traçabilité complète |
| COM-810 | Lister tous les éléments d'un tableau blanc avec tri par date création, statut ou responsable assigné | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | Consultation éléments avec filtres et tri |
| COM-811 | Assigner un responsable à un élément de tableau avec notification automatique personne assignée et suivi accountability | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 7 | 24-40h | Délégation tâches avec notifications et responsabilisation |
| COM-812 | Gérer les statuts personnalisables des éléments (ouvert, en cours, terminé, bloqué) avec workflow configurable | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 24-40h | Workflow flexible adaptable contextes métier |
| COM-813 | Filtrer éléments tableau blanc par statut, responsable, date ou mots-clés description pour recherche rapide | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | Recherche avancée pour grands tableaux |
| COM-814 | Exporter un tableau blanc complet en PDF ou Excel avec tous éléments, statuts et responsables pour archivage | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 7 | 24-40h | Export documentation et rapports management |

### 1.10 Téléconsultation

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| COM-901 | Intégrer une infrastructure vidéo WebRTC pour communication temps réel chiffrée bout-en-bout avec support STUN/TURN | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 9 | 120-160h | OrIAV1 EPIC-007 - Infrastructure WebRTC complexe avec fallback audio |
| COM-902 | Configurer serveurs STUN/TURN pour traversée NAT et firewall avec garantie fonctionnement derrière proxies corporatifs | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 8 | 60-80h | OrIAV1 TASK-007.1 - Infrastructure réseau avancée |
| COM-903 | Implémenter adaptive bitrate pour ajustement qualité vidéo selon bande passante disponible avec détection automatique | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 8 | 60-80h | OrIAV1 TASK-007.1 - Optimisation expérience utilisateur |
| COM-904 | Permettre prise de rendez-vous téléconsultation en ligne par patient avec intégration calendrier praticien et disponibilités | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | OrIAV1 TASK-007.2 - Booking self-service patients |
| COM-905 | Générer et envoyer automatiquement des liens sécurisés de téléconsultation par email et SMS avec expiration temporelle | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 5 | 16-24h | OrIAV1 TASK-007.2 - Sécurité liens uniques |
| COM-906 | Envoyer des rappels automatiques de rendez-vous téléconsultation à J-1 et H-1 avec confirmation de présence | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 5 | 16-24h | OrIAV1 TASK-007.2 - Réduction no-shows |
| COM-907 | Gérer les fuseaux horaires multiples pour rendez-vous téléconsultation avec conversion automatique et affichage clair | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | OrIAV1 TASK-007.2 - Support patients internationaux |
| COM-908 | Créer une salle d'attente virtuelle avec affichage de la position dans la file et temps d'attente estimé | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | OrIAV1 TASK-007.3 - Expérience patient optimale |
| COM-909 | Intégrer test technique automatique de caméra, microphone et connexion avant consultation avec instructions dépannage | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | OrIAV1 TASK-007.3 - Prévention problèmes techniques |
| COM-910 | Afficher la liste des documents à préparer pour la consultation avec checklist interactive | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 3 | 8-16h | OrIAV1 TASK-007.3 - Préparation patient |
| COM-911 | Notifier automatiquement le patient lorsque le praticien est prêt à démarrer la consultation | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 5 | 16-24h | OrIAV1 TASK-007.3 - Transition fluide |
| COM-912 | Créer interface praticien avec vue vidéo patient, contrôles audio/vidéo et accès simultané au dossier médical | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 8 | 80-120h | OrIAV1 TASK-007.4 - Interface praticien multi-écrans |
| COM-913 | Permettre prise de notes structurées durant téléconsultation avec sauvegarde automatique et templates | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 5 | 16-24h | OrIAV1 TASK-007.4 - Documentation temps réel |
| COM-914 | Intégrer fonctionnalité de partage d'écran et de documents durant la téléconsultation | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 40-60h | OrIAV1 TASK-007.4 - Collaboration visuelle |
| COM-915 | Permettre génération de prescription électronique directement durant téléconsultation avec intégration dossier patient | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | OrIAV1 TASK-007.4 - Workflow médical intégré |
| COM-916 | Enregistrer les téléconsultations avec consentement explicite du patient pour revue et formation | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 8 | 60-80h | OrIAV1 TASK-007.4 - Archivage sécurisé conforme |
| COM-917 | Appliquer automatiquement les codes actes RAMQ spécifiques à la télémédecine (ex: 08858) lors de facturation | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 40-60h | OrIAV1 TASK-007.5 - CRITIQUE - Conformité facturation RAMQ |
| COM-918 | Calculer automatiquement les honoraires de téléconsultation selon grille tarifaire RAMQ avec suppléments applicables | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | OrIAV1 TASK-007.5 - Facturation automatisée |
| COM-919 | Générer automatiquement les réclamations RAMQ pour téléconsultations avec soumission batch quotidienne | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | OrIAV1 TASK-007.5 - Automatisation réclamations |
| COM-920 | Facturer le patient directement pour services non couverts par RAMQ avec génération reçus officiels | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 40-60h | OrIAV1 TASK-007.5 - Facturation privée |
| COM-921 | Créer dashboard statistiques téléconsultations avec revenus, volumes, durée moyenne et taux satisfaction | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 40-60h | OrIAV1 TASK-007.5 - Analytics télémédecine |

### 1.11 Système d'accueil et intégration PAB

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| COM-1001 | Créer programme d'accueil structuré pour nouveaux préposés aux bénéficiaires avec parcours personnalisé selon expérience | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 7 | 40-60h | Cadre référence MSSS 2019 - Intégration PAB |
| COM-1002 | Gérer mentorat et jumelage nouveaux employés avec suivi progression et évaluation mentor-mentoré bidirectionnelle | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 7 | 40-60h | Programme soutien nouveaux PAB - CHSLD |
| COM-1003 | Automatiser checklist d'intégration avec tâches assignées par rôle et rappels automatiques des échéances | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 5 | 16-24h | Automatisation processus accueil |
| COM-1004 | Créer portail d'apprentissage intégré avec modules de formation obligatoires et suivi de complétion | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 8 | 60-80h | Formation continue PAB - modules certifiants |
| COM-1005 | Générer rapports de rétention et analyse des causes de départ des PAB avec recommandations automatisées | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 7 | 40-60h | Pérennisation 10000 PAB - Analytique rétention |

### 1.12 Contrôles de bien-être avant prise de poste

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| COM-1101 | Implémenter questionnaire de santé pré-quart avec détection symptômes et blocage automatique si risque identifié | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 9 | 5 | 16-24h | Deputy - Contrôle sanitaire COVID/grippes |
| COM-1102 | Créer système d'auto-évaluation fatigue et charge mentale avec alertes gestionnaire si seuils dépassés | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 7 | 40-60h | Prévention épuisement professionnel |
| COM-1103 | Suivre indicateurs bien-être par équipe avec tableau de bord temps réel et tendances historiques | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | Analytics bien-être collectif |
| COM-1104 | Générer alertes automatiques pour pauses manquées avec rappels progressifs et escalade si récurrence | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 5 | 16-24h | Deputy - Gestion pauses obligatoires |
| COM-1105 | Créer programme de soutien par les pairs avec matching automatique selon profils et disponibilités | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 8 | 60-80h | Entraide employés - Santé mentale |

### 1.13 Coaching et développement professionnel

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| COM-1201 | Implémenter système de coaching personnalisé avec assignation coach, objectifs et suivi progression | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 40-60h | Simundia - Coaching continu employés |
| COM-1202 | Créer plans de développement individualisés avec compétences cibles et parcours formation recommandés | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | Gestion carrières - Plans individualisés |
| COM-1203 | Gérer demandes de formation en self-service avec workflow approbation et suivi budgétaire intégré | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 5 | 16-24h | SIRH moderne - Self-service formation |
| COM-1204 | Suivre certifications professionnelles avec alertes expiration et rappels renouvellement automatiques | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 5 | 16-24h | Conformité certifications obligatoires |
| COM-1205 | Créer bibliothèque de micro-apprentissages avec capsules vidéo courtes accessibles sur mobile | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 40-60h | Formation continue - Micro-learning mobile |

### 1.14 Gestion des formations obligatoires par poste

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| COM-1301 | Définir matrice des formations obligatoires par poste avec prérequis, récurrence et validité temporelle | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 40-60h | CRITIQUE - Conformité réglementaire CNESST/MSSS |
| COM-1302 | Générer rappels automatiques progressifs avant expiration certification (90j, 60j, 30j, 7j, expirée) avec escalade hiérarchique | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 16-24h | Prévention non-conformités - Multi-canal (email, SMS, app) |
| COM-1303 | Bloquer automatiquement assignation quart si formation obligatoire expirée avec notification gestionnaire immédiate | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 40-60h | Sécurité patient - Blocage préventif automatique |
| COM-1304 | Créer workflow validation gestionnaire post-formation avec téléversement attestation, validation RH et mise à jour dossier employé | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 9 | 7 | 40-60h | Processus complet validation multi-niveaux |
| COM-1305 | Gérer renouvellements périodiques formations avec calcul automatique prochaine échéance selon règles métier (annuel, biennal, triennal) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 9 | 5 | 16-24h | Gestion cycles formation (RCR annuel, PDSB 3 ans, etc.) |
| COM-1306 | Générer rapport conformité formations par unité/département avec taux couverture et employés non conformes | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 5 | 16-24h | Dashboard conformité temps réel - Audit CNESST |
| COM-1307 | Implémenter validation conditionnelle permettant affectation temporaire avec engagement formation dans délai défini | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | Flexibilité opérationnelle avec traçabilité engagements |
| COM-1308 | Créer parcours de formation automatisé par poste avec prérequis, ordre séquentiel et validation progressive des compétences | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 8 | 60-80h | Parcours certifiant complet - Montée en compétences structurée |
| COM-1309 | Intégrer avec systèmes externes de formation (Moodle, LMS) pour synchronisation automatique des complétions et résultats | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 8 | 60-80h | API LMS - Import automatique attestations |
| COM-1310 | Gérer équivalences et reconnaissances acquis avec workflow validation RH pour formations externes ou expérience antérieure | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 40-60h | RAC - Reconnaissance acquis et compétences |

### 1.15 Notifications et alertes de non-conformité formation

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| COM-1401 | Envoyer notifications push mobile pour rappels formation avec lien direct inscription et calendrier disponibilités | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 5 | 16-24h | Facilitation inscription - Réduction no-shows |
| COM-1402 | Créer tableau de bord gestionnaire formations à risque avec employés bientôt non-conformes et impact opérationnel | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 9 | 7 | 40-60h | Prévention ruptures service - Vue 30-60-90 jours |
| COM-1403 | Générer alertes automatiques direction/RH si taux conformité formation descend sous seuils critiques par unité | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 5 | 16-24h | Gestion risques organisationnels - Seuils paramétrables |
| COM-1404 | Implémenter escalade automatique si formation critique non complétée après échéance (employé→superviseur→gestionnaire→RH) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 9 | 7 | 40-60h | Chain of command - Responsabilisation progressive |
| COM-1405 | Créer rapport mensuel automatique conformité formations pour comité de direction avec tendances et recommandations | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 5 | 16-24h | Gouvernance formation - KPIs stratégiques |

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
| HOR-010 | Définir et gérer les périodes de pause obligatoires dans un quart de travail avec heures début et fin conformes aux lois du travail | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 5 | 8-16h | Support multiple pauses par quart avec calcul automatique heures payées |
| HOR-011 | Importer des plannings existants depuis Excel ou CSV avec validation automatique des formats et détection des erreurs de cohérence | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 24-40h | Facilite migration depuis systèmes existants - Source: OrIAV3 REQ-PLAN-001 |
| HOR-012 | Créer et gérer des quarts fractionnés permettant des affectations multiples sur différentes unités durant un même quart de travail | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | Permet optimisation utilisation ressources multi-sites |
| HOR-013 | Supporter les chevauchements de quarts contrôlés pour assurer continuité de service lors de transitions entre équipes | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | Essentiel pour passation consignes et continuité soins |
| HOR-014 | Configurer les seuils déclenchant automatiquement le calcul des heures supplémentaires selon conventions (40h, 44h, personnalisé) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | Conformité LNT Québec - Requis légal absolu |

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
| HOR-208 | Diffuser quarts urgents non comblés par notification massive (email, SMS, app) à tous employés qualifiés disponibles avec réponse en un clic | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 9 | 7 | 40-60h | Schedule360 Hot Shift - CRITIQUE couverture urgences CHSLD |
| HOR-209 | Confirmer automatiquement premier employé acceptant quart urgent et annuler notifications pour autres candidats instantanément | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 9 | 7 | 40-60h | Schedule360 - Workflow temps réel pour urgences staffing |

### 2.4 Disponibilités et Préférences

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| HOR-301 | Saisir disponibilités (employé) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| HOR-302 | Consulter disponibilités équipe | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| HOR-303 | Définir préférences horaires (jour/soir/nuit) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| HOR-304 | Alerte assignation hors disponibilité | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| HOR-305 | Gérer les indisponibilités récurrentes (cours universitaires, engagements personnels) avec répétition automatique | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| HOR-306 | Définir des préférences de collègues préférés pour travail d'équipe et cohésion optimale | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 5 | 8-16h | |
| HOR-307 | Indiquer préférence volontariat heures supplémentaires (wants_overtime) pour priorisation lors publication quarts bonus | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 3 | 4-8h | OrIAV1 - Filtrage candidats volontaires temps supplémentaire |
| HOR-308 | Personnaliser mode compensation heures supplémentaires par employé (temps double, congé compensatoire, autre) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 5 | 8-16h | OrIAV1 overtime_compensation_override - Flexibilité conventions individuelles |
| HOR-309 | Suivre automatiquement historique lieux travail habituels et collègues réguliers pour améliorer stabilité assignations | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | OrIAV1 lieux_historique_travail + collegues_habituels - Input IA stabilité |
| HOR-310 | Appliquer règles de stabilité IA (location_stability, coworker_stability) pour pénaliser assignations hors contexte habituel | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 9 | 80-120h | OrIAV1 moteur règles - Favorise horaires stables et équipes connues |
| HOR-311 | Définir cibles de travail hebdomadaires ou mensuelles par employé selon contrat avec suivi automatique conformité écarts | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 7 | 40-60h | Schedule360 Work Targets - Assure respect heures contractuelles |
| HOR-312 | Afficher rapport codé couleurs conformité cibles travail avec variance positive/négative pour chaque employé temps réel | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 5 | 16-24h | Schedule360 - Dashboard visuel gestion proactive écarts |
| HOR-313 | Alerter gestionnaire automatiquement si employé atteint moins de 90% ou plus de 110% de sa cible travail hebdomadaire | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 7 | 40-60h | Schedule360 - Détection précoce sous/sur-utilisation personnel |

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
| HOR-507 | Alerter gestionnaires automatiquement par email et SMS lors détection lacunes couverture horaire avec impact opérationnel critique | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 40-60h | QGenda Coverage Gaps - CRITIQUE prévention ruptures service CHSLD |
| HOR-508 | Visualiser en temps réel vue globale lacunes couverture par unité et département avec indicateur gravité urgence | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 9 | 7 | 40-60h | Shiftboard Real-time Gaps - Dashboard opérationnel centralisé |

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
| HOR-806 | Capturer une photo lors du pointage pour authentification visuelle et prévention de la fraude aux heures travaillées | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | Sécurité anti-fraude - Source: OrIAV3 REQ-PLAN-004 |
| HOR-807 | Permettre le pointage hors-ligne avec synchronisation automatique dès que la connexion réseau est rétablie | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 9 | 80-120h | Essentiel pour sites avec connectivité instable |
| HOR-808 | Définir des rayons géographiques acceptables par lieu de travail pour valider la géolocalisation lors du pointage | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 24-40h | Validation présence physique sur site - OrIAV4 TPS-004 |
| HOR-809 | Alerter automatiquement les gestionnaires lors de pointages géographiquement suspects ou hors des zones autorisées | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 24-40h | Prévention fraude temps réel |

### 2.10 Gestion Heures Supplémentaires

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| HOR-901 | Calculer automatiquement les heures supplémentaires selon règles LNT Québec (au-delà de 40h/semaine à taux 1.5x) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 9 | 80-120h | |
| HOR-902 | Distinguer automatiquement heures normales, supplémentaires (1.5x) et majorées (2x pour jours fériés) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 9 | 80-120h | |
| HOR-903 | Pré-approuver ou rejeter les demandes d'heures supplémentaires avant leur exécution avec workflow configurable | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| HOR-904 | Suivre le budget d'heures supplémentaires par équipe et département avec alertes de dépassement budgétaire | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| HOR-905 | Offrir option de compensation en temps libre au lieu de paiement selon préférence employé et règles organisationnelles | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| HOR-906 | Gérer différentes périodes de référence pour le calcul des heures supplémentaires (hebdomadaire, bimensuelle, mensuelle) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | Flexibilité selon conventions collectives - OrIAV3 REQ-PLAN-005 |
| HOR-907 | Appliquer automatiquement les taux majorés selon niveau de dépassement (1.5x premier seuil, 2x seuils supérieurs, jours fériés) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 9 | 80-120h | Conformité LNT - Calculs critiques paie - OrIAV4 TPS-002 |
| HOR-908 | Calculer les heures supplémentaires basées sur les pointages réels plutôt que sur les horaires planifiés avec écarts documentés | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 9 | 80-120h | Justesse paie - Évite litiges employeur/employé |
| HOR-909 | Permettre la configuration du seuil maximum d'heures supplémentaires hebdomadaires (50h standard) avec alertes de conformité | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 5 | 8-16h | Prévention surcharge travail - Santé sécurité |
| HOR-910 | Optimiser automatiquement assignation quarts pour minimiser coût salarial total en priorisant employés au taux horaire le plus bas qualifiés | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 9 | 80-120h | Shiftboard - Réduction coûts main-oeuvre avec respect compétences |

### 2.11 Gestion des Gardes et Astreintes (On-Call)

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| HOR-1001 | Créer calendrier de gardes (on-call) avec rotation équitable entre employés qualifiés selon règles configurables | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 8 | 60-80h | QGenda - CRITIQUE CHSLD pour gardes médicales et infirmières |
| HOR-1002 | Distribuer automatiquement les gardes de nuit et fins de semaine de manière équitable avec suivi historique par employé | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 7 | 40-60h | QGenda - Équité distribution charges on-call |
| HOR-1003 | Permettre échanges de gardes entre employés avec approbation gestionnaire et vérification qualifications requises | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | QGenda - Flexibilité employés avec traçabilité complète |
| HOR-1004 | Alerter automatiquement par email et SMS les employés de garde avec lacunes de couverture nécessitant intervention immédiate | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 9 | 7 | 40-60h | QGenda - Notification multi-canal pour urgences médicales |
| HOR-1005 | Visualiser en temps réel l'annuaire complet des employés de garde avec contact direct (téléphone, SMS, app) par spécialité | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 9 | 5 | 16-24h | QGenda - Accès rapide professionnels de garde en urgence |
| HOR-1006 | Appliquer compensation financière automatique pour heures de garde selon conventions collectives avec taux différenciés | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 7 | 40-60h | Calcul paie gardes - Conformité conventions santé Québec |
| HOR-1007 | Générer rapport conformité EMTALA avec couverture médicale par spécialité et alertes lacunes réglementaires critiques | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | QGenda - Conformité loi urgences médicales (adapté Québec MSSS) |

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
| GES-023 | Exporter liste employés en masse (CSV/Excel) avec filtres personnalisables pour rapports et analyses externes | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | Complémentaire à GES-005 pour import/export bidirectionnel |
| GES-006 | Gérer les compétences et certifications des employés avec dates d'obtention et d'expiration | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| GES-007 | Suivre la formation obligatoire et envoyer des rappels automatiques avant expiration des certifications | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| GES-008 | Gérer le processus d'intégration des nouveaux employés avec liste de vérification et tâches automatisées | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| GES-009 | Centraliser tous les documents RH (contrat, évaluations, formations, disciplinaires) par employé dans dossier sécurisé | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| GES-010 | Gérer les évaluations de performance avec objectifs mesurables, révisions périodiques et plans de développement | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 9 | 80-120h | |
| GES-011 | Définir et modifier la date de début d'emploi pour chaque employé avec permissions restreintes aux administrateurs uniquement | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 3 | 8-16h | Important pour calculs d'ancienneté et droits aux congés |
| GES-012 | Configurer le statut temps plein ou temps partiel pour chaque employé avec impact sur calcul heures normales et supplémentaires | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 5 | 8-16h | Distinction essentielle pour conformité légale et paie |
| GES-013 | Suivre automatiquement l'historique des lieux de travail habituels de chaque employé pour favoriser stabilité et cohésion d'équipe | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | Utilise données historiques pour optimisation planification |
| GES-014 | Suivre automatiquement la liste des collègues habituels de chaque employé pour améliorer planification et cohésion d'équipe | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 5 | 8-16h | Favorise stabilité équipes basée sur historique collaboration |
| GES-015 | Définir des profils médicaux spécialisés par type de poste (PAB, Infirmier, Médecin, Admin) avec champs spécifiques requis | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 24-40h | Contexte CHSLD - OrIAV3 REQ-EMP-002 |
| GES-016 | Gérer les affectations multiples à différents départements avec pourcentages de temps alloués pour chaque affectation | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 24-40h | Employés partagés entre unités - Contexte médical |
| GES-017 | Enregistrer les restrictions médicales confidentielles des employés avec accès limité strictement aux RH autorisées | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 9 | 80-120h | CRITIQUE - Confidentialité Loi 25 + chiffrement AES-256 PII |
| GES-018 | Supporter les relations matricielles permettant à un employé d'avoir plusieurs superviseurs simultanés selon contextes | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | Structures organisationnelles complexes - OrIAV3 REQ-EMP-004 |
| GES-019 | Créer des délégations temporaires de permissions avec dates de début et fin automatiques pour absences ou projets | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 24-40h | Continuité opérationnelle lors vacances gestionnaires |
| GES-020 | Générer automatiquement un organigramme visuel interactif reflétant la structure hiérarchique réelle de l'organisation | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | Visualisation structure - Onboarding nouveaux employés |
| GES-021 | Créer une matrice croisant compétences certifiées vs postes disponibles pour identifier lacunes et opportunités de formation | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 24-40h | Planification stratégique RH - OrIAV3 REQ-EMP-005 |
| GES-022 | Générer automatiquement un planning de formation basé sur les dates d'expiration imminentes des certifications obligatoires | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 9 | 80-120h | Conformité certifications médicales - Prévention expirations |
| GES-024 | Enregistrer le volontariat de chaque employé pour heures supplémentaires avec préférences jours/quarts spécifiques pour optimisation planification | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 5 | 8-16h | Oriav2 EMP-012 - Facilite couverture besoins urgents IA |

### 3.2 Gestion Lieux

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| GES-101 | Créer lieu/unité | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| GES-102 | Consulter lieu | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| GES-103 | Modifier lieu | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 8-16h | |
| GES-104 | Supprimer/archiver lieu | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| GES-105 | Hiérarchie lieux (parent→enfants) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| GES-106 | Définir des tâches spécifiques à un lieu parent qui sont automatiquement héritées par tous ses sous-lieux descendants | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | Tâches héritées permettent centralisation gestion procédures standardisées |
| GES-107 | Assigner des sous-lieux spécifiques à un quart de travail pour permettre affectations multi-emplacements flexibles | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | Employé peut couvrir plusieurs sous-lieux lors d'un même quart |

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
| GES-408 | Valider et formater automatiquement le numéro d'assurance maladie RAMQ avec vérification de cohérence | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 5 | 16-24h | OrIAV1 TASK-005.1 - Validation temps réel RAMQ |
| GES-409 | Vérifier l'admissibilité du patient via l'API RAMQ avec récupération automatique des informations démographiques | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 9 | 80-120h | OrIAV1 TASK-005.2 - Intégration API RAMQ complexe avec mode dégradé |
| GES-410 | Gérer les antécédents médicaux structurés du patient avec catégorisation par type de condition | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | OrIAV1 TASK-005.1 - Dossier médical complet |
| GES-411 | Enregistrer et afficher les allergies et intolérances du patient avec niveau de gravité et alertes visuelles | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 5 | 16-24h | OrIAV1 TASK-005.1 - CRITIQUE SÉCURITÉ - Prévention erreurs médicamenteuses |
| GES-412 | Gérer les contacts d'urgence du patient avec relations, téléphones et priorité de contact | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 3 | 8-16h | OrIAV1 TASK-005.1 - Essentiel situations urgences |
| GES-413 | Enregistrer les consentements médicaux et directives anticipées du patient avec validité temporelle et signatures électroniques | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | OrIAV1 TASK-005.1 - Conformité juridique et éthique médicale |
| GES-414 | Gérer la base de données des médicaments avec codes DIN et mise à jour mensuelle automatique | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 40-60h | OrIAV1 TASK-005.3 - Intégration base Santé Canada |
| GES-415 | Créer et gérer les prescriptions électroniques avec dosage, fréquence, durée et renouvellements | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | OrIAV1 TASK-005.3 - Conformité réglementaire prescriptions |
| GES-416 | Détecter automatiquement les interactions médicamenteuses dangereuses avec alertes en temps réel lors de la prescription | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 9 | 120-160h | OrIAV1 TASK-005.3 - CRITIQUE SÉCURITÉ - IA détection interactions complexes |
| GES-417 | Consulter l'historique complet de médication du patient avec dates, dosages et prescripteurs | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 5 | 16-24h | OrIAV1 TASK-005.3 - Traçabilité complète médication |
| GES-418 | Générer des alertes automatiques de renouvellement de prescriptions avant expiration | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 5 | 16-24h | OrIAV1 TASK-005.3 - Continuité soins médicamenteux |
| GES-419 | Intégrer avec le Dossier Santé Québec (DSQ) pour partage sécurisé de l'historique médication | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 10 | 160-240h | OrIAV1 TASK-005.3 - Intégration gouvernementale complexe |
| GES-420 | Créer et gérer les plans de traitement individualisés avec objectifs mesurables et échéanciers | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | OrIAV1 TASK-005.4 - Planification soins structurée |
| GES-421 | Suivre la progression et les résultats des traitements avec indicateurs quantifiables et graphiques d'évolution | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | OrIAV1 TASK-005.4 - Visualisation évolution patient |
| GES-422 | Utiliser des protocoles de soins standardisés réutilisables avec templates personnalisables par pathologie | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 40-60h | OrIAV1 TASK-005.4 - Standardisation pratiques cliniques |
| GES-423 | Générer des rappels et alertes automatiques pour échéances de traitement et suivis nécessaires | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 5 | 16-24h | OrIAV1 TASK-005.4 - Prévention oublis critiques |
| GES-424 | Faciliter la collaboration interdisciplinaire avec notes partagées et plans de soins multi-professionnels | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | OrIAV1 TASK-005.4 - Coordination équipe soins |
| GES-425 | Uploader de façon sécurisée des documents médicaux (PDF, images) jusqu'à 100MB avec chiffrement bout-en-bout | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | OrIAV1 TASK-005.5 - Gestion documentaire sécurisée |
| GES-426 | Intégrer un viewer DICOM pour consultation d'imagerie médicale directement dans le système | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 9 | 80-120h | OrIAV1 TASK-005.5 - Imagerie médicale avancée |
| GES-427 | Utiliser l'OCR pour extraction automatique de texte depuis documents scannés et indexation | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 8 | 60-80h | OrIAV1 TASK-005.5 - IA traitement documents |
| GES-428 | Catégoriser automatiquement les documents médicaux par type avec suggestions intelligentes basées sur contenu | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 8 | 60-80h | OrIAV1 TASK-005.5 - Machine Learning classification |
| GES-429 | Partager de façon sécurisée des documents médicaux entre professionnels autorisés avec audit trail complet | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | OrIAV1 TASK-005.5 - Collaboration sécurisée |

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
| GES-509 | Suivre le taux de rétention des employés par département avec identification des facteurs de départ et tendances temporelles | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 24-40h | KPI RH moderne - Prévention turnover élevé |
| GES-510 | Analyser la progression salariale moyenne par ancienneté et poste avec comparaisons internes et externes (benchmarking) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | Équité salariale - Compétitivité marché |
| GES-511 | Mesurer le temps moyen de recrutement par poste avec identification des goulots d'étranglement dans le processus | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | Optimisation processus recrutement |
| GES-512 | Calculer le coût complet par embauche incluant recrutement, formation initiale et période d'adaptation avec ROI projeté | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 9 | 80-120h | Budgétisation RH - Justification investissements |
| GES-513 | Générer des rapports de diversité et inclusion avec métriques démographiques anonymisées conformes aux exigences légales | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 24-40h | Conformité Loi canadienne équité en emploi |

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

### 3.9 Formation et Développement

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| GES-801 | Créer et gérer un catalogue de formations avec prérequis, durée, coûts et fournisseurs externes ou internes | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 5 | 8-16h | OrIAV3 REQ-EMP-005 - Gestion centralisée offre formation |
| GES-802 | Inscrire les employés aux sessions de formation avec suivi des présences, résultats et certifications obtenues | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 24-40h | Traçabilité complète parcours formation |
| GES-803 | Budgétiser les dépenses de formation par département avec suivi consommation vs budget alloué et alertes dépassement | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | Contrôle budgétaire formation continue |
| GES-804 | Mesurer l'efficacité des formations avec évaluations avant/après, sondages de satisfaction et impact sur performance | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 9 | 80-120h | ROI formation - Amélioration continue |
| GES-805 | Signer électroniquement documents RH (contrats, certifications, évaluations) avec validité légale et archivage sécurisé | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 9 | 80-120h | OrIA1.0 - Dématérialisation complète processus RH |
| GES-806 | Créer notes personnelles privées liées aux patients, collègues ou lieux pour mémorisation contexte relationnel | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 5 | 8-16h | OrIA1.0 - Amélioration continuité soins et relations |
| GES-807 | Scorer compatibilité employé/collègue ou employé/patient pour optimiser assignations et satisfaction travail | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | OrIA1.0 - ML scoring préférences relationnelles |
| GES-808 | Mesurer eNPS (Employee Net Promoter Score) avec sondage unique question probabilité recommandation employeur échelle 0-10 | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 5 | 16-24h | Zoho People - Métrique critique satisfaction globale employés |
| GES-809 | Calculer score eNPS automatiquement avec catégorisation promoteurs (9-10), passifs (7-8), détracteurs (0-6) et tendance temporelle | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 5 | 16-24h | Zoho People - Formule eNPS = % promoteurs - % détracteurs |
| GES-810 | Intégrer reconnaissance faciale avec détection anti-usurpation (spoof detection) pour pointage mobile sécurisé sans fraude | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 9 | 120-160h | Zoho People - Prévention buddy punching et fraude identité |
| GES-811 | Créer portail self-service employé regroupant toutes fonctions autonomes : congés, horaires, documents, paie, formation, profil | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 7 | 40-60h | Zoho People - Hub central autonomie employé réduit charge RH |
| GES-812 | Générer automatiquement organigrammes interactifs avec drill-down hiérarchique, photos, contacts directs et affectations multiples | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 7 | 40-60h | Zoho People - Visualisation structure organisationnelle complète |

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
| ADM-008 | Personnaliser interface utilisateur avec widgets modulaires repositionnables drag-and-drop selon rôle et préférences | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | OrIA1.0 - Dashboard adaptatif personnalisable par utilisateur |

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
| ADM-203 | Activer authentification multi-facteurs optionnelle (2FA) avec support TOTP apps, SMS et Email vérifiés par utilisateur | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | Oriav2 AUTH-005 - Sécurité renforcée accès sensibles |
| ADM-204 | Politique mot de passe (complexité, expiration) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | |
| ADM-205 | Journal audit complet (logs) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | |
| ADM-206 | Gérer les sessions actives de tous utilisateurs et forcer déconnexion à distance en cas de compromission | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| ADM-207 | Configurer les restrictions d'accès par plage d'adresses IP ou géolocalisation pour sécurité renforcée | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | |
| ADM-208 | Consulter historique complet connexions avec détection automatique activités suspectes par machine learning (anomalies IP, horaires, fréquence) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 9 | 80-120h | Oriav2 SEC-003 - Détection comportements anormaux ML |

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
| ADM-409 | Configurer le mapping personnalisé entre comptes de paie OrIA et plan comptable de l'organisation (Grand Livre) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 24-40h | OrIAV3 REQ-PAY-004 - Intégration comptable flexible |
| ADM-410 | Effectuer une réconciliation automatique des écritures de paie exportées avec les entrées comptables pour détecter écarts | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 9 | 80-120h | Contrôle qualité - Prévention erreurs comptables |
| ADM-411 | Conserver un historique complet de tous les exports vers systèmes comptables avec possibilité de re-générer exports antérieurs | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 8-16h | Auditabilité - Retraitement possible si erreur détectée |
| ADM-412 | Maintenir une base de données complète des codes actes médicaux RAMQ avec tarification et mise à jour mensuelle automatique | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | OrIAV1 TASK-009.1 - 500+ codes actes RAMQ |
| ADM-413 | Gérer les modificateurs et suppléments de facturation RAMQ avec application automatique selon contexte acte | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 8 | 60-80h | OrIAV1 TASK-009.1 - Facturation complexe RAMQ |
| ADM-414 | Supporter les actes médicaux privés personnalisés avec tarification configurable par praticien ou organisation | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 16-24h | OrIAV1 TASK-009.1 - Facturation privée flexible |
| ADM-415 | Générer automatiquement les fichiers de réclamation RAMQ conformes aux spécifications techniques avec validation pré-soumission | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 9 | 120-160h | OrIAV1 TASK-009.2 - CRITIQUE - Conformité format RAMQ stricte |
| ADM-416 | Transmettre de façon sécurisée les réclamations RAMQ avec soumission automatique quotidienne ou manuelle | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 8 | 60-80h | OrIAV1 TASK-009.2 - Transmission chiffrée RAMQ |
| ADM-417 | Suivre les statuts de réclamations RAMQ avec synchronisation automatique des réponses et notifications changements | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | OrIAV1 TASK-009.2 - Suivi temps réel réclamations |
| ADM-418 | Gérer automatiquement les rejets et corrections de réclamations RAMQ avec workflow de correction guidé | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 8 | 60-80h | OrIAV1 TASK-009.2 - Réduction taux rejet <5% |
| ADM-419 | Générer des rapports de conciliation RAMQ avec comparaison montants réclamés vs reçus et identification écarts | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | OrIAV1 TASK-009.2 - Contrôle qualité facturation |
| ADM-420 | Créer dashboard revenus RAMQ temps réel avec KPI (taux acceptation, délais paiement, revenus par praticien) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | OrIAV1 TASK-009.2 - Analytics financiers RAMQ |
| ADM-421 | Créer et gérer les factures patients pour services privés avec génération automatique PDF et envoi email | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | OrIAV1 TASK-009.3 - Facturation patient professionnelle |
| ADM-422 | Intégrer processeur de paiement sécurisé (Stripe/Square) pour paiement en ligne patients conforme PCI-DSS | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 9 | 120-160h | OrIAV1 TASK-009.3 - CRITIQUE SÉCURITÉ - Paiement en ligne |
| ADM-423 | Gérer des plans de paiement échelonnés pour patients avec rappels automatiques et suivi soldes | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 40-60h | OrIAV1 TASK-009.3 - Amélioration recouvrement |
| ADM-424 | Générer automatiquement des reçus officiels pour assurances privées conformes aux normes fiscales canadiennes | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 5 | 16-24h | OrIAV1 TASK-009.3 - Conformité fiscale reçus |
| ADM-425 | Envoyer des relances automatiques de paiement par email et SMS selon échéancier configurable avec escalade | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 16-24h | OrIAV1 TASK-009.3 - Automatisation recouvrement |
| ADM-426 | Configurer plan comptable personnalisé avec codes de comptes, centres de coûts et départements | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 40-60h | OrIAV1 TASK-009.4 - Comptabilité générale flexible |
| ADM-427 | Maintenir des journaux comptables automatiques pour toutes transactions financières avec écritures doubles | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 8 | 60-80h | OrIAV1 TASK-009.4 - Conformité comptable |
| ADM-428 | Effectuer rapprochement bancaire semi-automatique avec import relevés et matching transactions | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 9 | 80-120h | OrIAV1 TASK-009.4 - Contrôle trésorerie |
| ADM-429 | Générer états financiers standards (bilan, état résultats, flux trésorerie) avec comparatifs périodes | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | OrIAV1 TASK-009.4 - Reporting financier |
| ADM-430 | Gérer automatiquement les taxes TPS/TVQ canadiennes avec calcul, collecte et déclarations trimestrielles | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 8 | 60-80h | OrIAV1 TASK-009.4 - Conformité fiscale taxes |
| ADM-431 | Exporter données comptables vers formats standards (CSV, OFX, QuickBooks, Sage) pour intégration logiciels externes | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 40-60h | OrIAV1 TASK-009.4 - Interopérabilité comptable |
| ADM-432 | Maintenir audit trail complet de toutes transactions financières avec traçabilité utilisateur et horodatage | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 40-60h | OrIAV1 TASK-009.4 - CRITIQUE - Auditabilité complète |

### 4.6 Intelligence Artificielle Prédictive (100% Local)

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| ADM-606 | Analyser 15+ facteurs de risque de départ employé (satisfaction, performance, absences, charge travail) par modèle IA local | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 10 | 160-240h | Oriav2 AI-001 - Prédiction turnover XGBoost local |
| ADM-607 | Calculer score de risque de départ 0-100% pour chaque employé avec explications transparentes des facteurs contributifs | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 10 | 160-240h | Oriav2 AI-002 - Explainability SHAP values |
| ADM-608 | Générer automatiquement des recommandations d'actions préventives personnalisées pour rétention employés à risque | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 9 | 120-160h | Oriav2 AI-003 - Recommandations actionnables |
| ADM-609 | Mettre à jour modèle IA de turnover en continu avec nouvelles données sans intervention manuelle (apprentissage incrémental) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 9 | 120-160h | Oriav2 AI-004 - ML ops automatisé |
| ADM-610 | Prévoir besoins en personnel futurs par département avec analyse tendances historiques et saisonnalité sur 12 mois | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 9 | 120-160h | Oriav2 AI-013 - Prédiction demande staffing |
| ADM-611 | Optimiser budgets RH annuels avec recommandations d'embauches basées sur prévisions de charge de travail validées | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 9 | 120-160h | Oriav2 AI-014 - Planification budgétaire stratégique |
| ADM-612 | Alerter gestionnaires automatiquement en cas de sureffectif ou sous-effectif prévu avec impact financier calculé | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 40-60h | Oriav2 AI-015 - Alertes proactives staffing |
| ADM-613 | Planifier embauches stratégiques sur 12 mois avec recommandations de profils, timing optimal et coûts anticipés | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 9 | 120-160h | Oriav2 AI-016 - Planification recrutement stratégique |
| ADM-614 | Installateur autonome multilingue (FR/EN) pour modèles ML avec détection GPU automatique et prompts interactifs | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 7 | 40-60h | OrIAV1 install_models.sh/.ps1 - Déploiement simplifié IA |
| ADM-615 | Fusionner automatiquement fragments safetensors multi-fichiers modèles ML (Llama, SDXL) lors installation | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 7 | 40-60h | OrIAV1 - Gestion grands modèles fragmentés automatisée |
| ADM-616 | Générer images personnalisées avec modèle Stable Diffusion XL (SDXL) local pour visualisations et badges employés | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 1 | 10 | 160-240h | OrIAV1 SDXL - R&D expérimental, post-MVP |
| ADM-617 | Créer portraits photo-réalistes employés avec InstantID et AntelopeV2 pour génération badges automatique | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 1 | 10 | 160-240h | OrIAV1 InstantID+SDXL - R&D très expérimental, TRÈS post-MVP |

### 4.7 Bien-être avec IA

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
| BET-014 | Créer sondages pulse ultra-courts (2-3 questions) distribuables quotidiennement ou hebdomadairement avec taux réponse optimisé | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 5 | 16-24h | Culture Amp / Officevibe - Mesure engagement temps quasi-réel |
| BET-015 | Afficher baromètre moral quotidien employé avec historique tendances 30/60/90 jours et alertes changements brusques | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 7 | 40-60h | Officevibe Mood Tracking - Détection précoce détérioration bien-être |
| BET-016 | Envoyer cartes reconnaissance numériques personnalisables entre collègues avec collections thématiques alignées valeurs organisation | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 5 | 16-24h | Officevibe Good Vibes - Renforcement culture reconnaissance |
| BET-017 | Afficher mur reconnaissance publique affichant célébrations équipe avec filtres par département et période temporelle | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 16-24h | Officevibe - Visibilité publique reconnaissances augmente impact |
| BET-018 | Générer insights automatiques IA à partir sondages pulse avec thèmes récurrents, sentiment global et recommandations actions | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 9 | 120-160h | Culture Amp AI Insights - Analyse NLP feedback qualitatif |
| BET-019 | Comparer métriques engagement avec benchmarks industrie santé anonymisés pour évaluation position concurrentielle | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 40-60h | Culture Amp Benchmarks - Contexte comparatif santé Québec |

### 4.7.0 Génération et Gestion Questions IA

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| BET-062 | Générer automatiquement par lots (20 questions) des questions bien-être variées et sémantiquement différentes avec double version (générique et personnalisée selon profil employé) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 9 | 80-120h | OrIAV2 - Génération batch questions IA avec diversité sémantique |
| BET-063 | Permettre aux gestionnaires de valider ou rejeter les questions générées par IA avec audit complet (identité, date, décision) et mémoire des rejets pour éviter régénération | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | OrIAV2 - Workflow validation administrative questions |
| BET-064 | Adapter automatiquement la formulation des questions validées au profil spécifique de chaque employé (département, poste, ancienneté) en conservant le sens original | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 8 | 60-80h | OrIAV2 - Reformulation contextuelle NLP |
| BET-065 | Distribuer automatiquement 5 nouvelles questions par semaine à chaque employé depuis la pile globale validée, sans jamais poser deux fois la même question au même employé | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 7 | 24-40h | OrIAV2 - Orchestration distribution hebdomadaire automatisée |
| BET-066 | Afficher automatiquement une pop-up avec la question bien-être en attente lors de chaque connexion employé, bloquant l'accès tant que non répondue | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 5 | 16-24h | OrIAV2 - Modal bloquant garantit taux réponse élevé |
| BET-067 | Gérer une file d'attente personnalisée de questions pour chaque employé avec système de priorités, dates de présentation et mécanisme de report (skip_until) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 7 | 40-60h | OrIAV1 EmployeeQuestionQueue - Gestion pile individuelle sophistiquée |
| BET-068 | Analyser automatiquement le sentiment (polarité -1 à +1) des réponses textuelles avec TextBlob et calcul de score personnalisé pour chaque type de question | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | OrIAV1 sentiment_score - Analyse sentiment avancée NLP |
| BET-069 | Regrouper automatiquement les réponses similaires par clusters avec TF-IDF et KMeans pour identifier tendances communes et patterns de bien-être | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 8 | 60-80h | OrIAV1 cluster_texts - Machine Learning clustering réponses |
| BET-070 | Générer automatiquement jusqu'à 3 suggestions d'amélioration organisationnelle à partir des feedbacks employés anonymisés via LLM avec format JSON structuré | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 9 | 80-120h | OrIAV1 _suggestions_from_llm - Recommandations IA actionnables |
| BET-071 | Déclencher automatiquement une alerte RH (email + notification admin + log audit) lorsque le score personnel bien-être d'un employé descend sous le seuil configurable (défaut 0.8) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 6 | 24-40h | OrIAV1 Alerting System - Intervention proactive dégradation bien-être |
| BET-072 | Archiver automatiquement chaque semaine les pourcentages de réponses positives/négatives/neutres par question pour historique et analyses longitudinales | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 16-24h | OrIAV1 Archive hebdomadaire - Traçabilité évolution sentiments |
| BET-073 | Calculer un score bien-être personnel agrégé combinant scores de réponses questionnaires, analyse messages et auto-évaluation hebdomadaire avec pondération configurable | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | OrIAV1 WellnessScore - Score composite multi-sources |
| BET-074 | Éviter la distribution de questions sémantiquement similaires au même employé dans un délai configurable (défaut 90 jours) avec seuil de similarité ajustable (défaut 0.8) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 8 | 60-80h | OrIAV1 Anti-redondance - Rotation intelligente questions |
| BET-075 | Tracer chaque lot de génération IA avec batch_id, nombre cible/réel généré, prompt utilisé, modèle IA, paramètres, durée exécution, succès/erreur et facteurs d'adaptation | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 4 | 5 | 16-24h | OrIAV1 GenerationLog - Auditabilité complète génération IA |
| BET-076 | Afficher automatiquement une interface bien-être dynamique avec onglets contextuels selon rôle utilisateur (question pour employé, validation pour admin, génération IA pour super-admin) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 8 | 60-80h | OrIAV1 Dart UnifiedScreen - Interface adaptative multi-rôles |

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
| BET-110 | Déployer assistant RH IA local (Llama 3) pour répondre questions employés sans transmission données externes | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 10 | 160-240h | oria-v3 FEAT-019 - Chatbot RH 100% local avec apprentissage continu |
| BET-111 | Fournir réponses contextuelles personnalisées selon profil employé avec liens vers ressources internes | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 9 | 80-120h | oria-v3 FEAT-019 - Personnalisation réponses assistant IA |
| BET-112 | Améliorer continuellement modèle IA RH via feedback utilisateurs sans compromis confidentialité | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 3 | 9 | 80-120h | oria-v3 FEAT-019 - Apprentissage local continu |

### 4.7.1 Programmes Santé Physique et Mentale

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| BET-020 | Offrir programmes exercice physique guidés avec bibliothèque vidéos (yoga, étirements, exercices bureau) accessibles pendant pauses pour réduire fatigue musculosquelettique personnel soignant | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 5 | 16-24h | Virgin Pulse - Prévention TMS secteur santé |
| BET-021 | Intégrer trackers activité (Fitbit, Apple Watch, Garmin) pour suivi automatique pas quotidiens, fréquence cardiaque et qualité sommeil avec synchronisation données bien-être | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 4 | 9 | 80-120h | Wellable/Limeade - Intégrations API wearables complexes |
| BET-022 | Proposer programmes santé mentale structurés (méditation guidée, gestion stress, techniques respiration) avec sessions 5-15 minutes adaptées horaires CHSLD | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 5 | 16-24h | Virgin Pulse Journeys - Prévention burnout secteur santé critique |
| BET-023 | Assigner coaching santé personnalisé virtuel avec objectifs mesurables (réduction IMC, amélioration sommeil, gestion anxiété) et suivi progrès mensuel | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 8 | 60-80h | Limeade Coaching - Accompagnement personnalisé |
| BET-024 | Permettre configuration objectifs santé personnalisables par employé (perte poids, arrêt tabac, activité physique quotidienne) avec rappels intelligents adaptatifs | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 7 | 24-40h | Virgin Pulse Goals - Engagement autonomie employé |
| BET-025 | Afficher tableau de bord santé holistique consolidant activité physique, nutrition, sommeil, stress avec score global bien-être et tendances 90 jours | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | Wellable Dashboard - Vue 360 santé employé |

### 4.7.2 Prévention et Intervention

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| BET-026 | Intégrer hotline Programme Aide Employés (PAE) 24/7 avec bouton accès rapide urgence psychologique et transfert automatique vers professionnels certifiés | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 9 | 7 | 40-60h | Standard industrie santé - Prévention crises suicidaires secteur CHSLD |
| BET-027 | Fournir répertoire ressources santé mentale géolocalisées (psychologues, CLSC, organismes communautaires Québec) avec disponibilités temps réel et téléconsultation | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 6 | 24-40h | Limeade Resources - Accès facilité soins santé mentale |
| BET-028 | Générer plans action bien-être personnalisés automatiquement selon résultats évaluations (sondages, analyses passives IA) avec recommandations priorisées et échéanciers | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 9 | 80-120h | Culture Amp Action Plans - Intervention personnalisée basée données |
| BET-029 | Gérer programme retour au travail progressif post-absence maladie longue (dépression, épuisement) avec suivi médical, ajustements horaires et évaluations bimensuelles | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 8 | 60-80h | LSST Québec - Obligation légale retour travail sécuritaire |
| BET-030 | Suivre accommodements santé (restrictions physiques, horaires adaptés troubles mentaux) avec alertes expiration certificats médicaux et renouvellements automatiques | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 9 | 7 | 40-60h | Workday Accommodations - Conformité LSST et droits personne |
| BET-031 | Détecter employés à haut risque burnout via analyse prédictive multicritères (absentéisme, baisse performance, sentiment négatif) et déclencher intervention gestionnaire | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 9 | 10 | 120-160h | BET-105 enrichi - Prévention proactive burnout secteur santé critique |
| BET-032 | Offrir séances thérapie en ligne confidentielles subventionnées (3-8 séances annuelles) avec plateforme sécurisée vidéoconférence HIPAA/Loi 25 conforme | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 9 | 80-120h | BetterHelp/Talkspace modèle - Accès thérapie accessible financièrement |

### 4.7.3 Équilibre Travail-Vie et Flexibilité

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| BET-033 | Calculer charge travail hebdomadaire par employé (heures planifiées + imprévus + temps supplémentaire) avec seuils alertes configurables (45h, 50h, 60h) et escalade gestionnaire | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 9 | 7 | 40-60h | BET-012 enrichi - Prévention surcharge récurrente secteur CHSLD |
| BET-034 | Détecter déséquilibre travail-vie automatiquement via patterns récurrents (heures excessives 3+ semaines consécutives, annulations congés répétées, pauses manquées chroniques) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 9 | 80-120h | Microsoft Viva Insights - Détection épuisement précoce |
| BET-035 | Suggérer ajustements horaires intelligents pour améliorer bien-être (redistribution quarts, ajout journées repos, réduction heures sup) avec simulations impact charge équipe | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 10 | 120-160h | BET-013 enrichi - Optimisation horaires IA complexe |
| BET-036 | Gérer jours santé mentale (mental health days) dédiés distincts congés maladie avec quota annuel configurable (2-5 jours), approbation simplifiée sans justification médicale | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 5 | 16-24h | Trend 2025 - Normalisation santé mentale workplaces progressifs |
| BET-037 | Autoriser flexibilité horaires automatique pour rendez-vous médicaux avec réservation créneaux 2-4h sans pénalité, intégration calendriers personnels et rappels | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 6 | 24-40h | Officevibe Flexibility - Réduction absentéisme non planifié |
| BET-038 | Mesurer indice équilibre travail-vie par employé via sondages qualitatifs + métriques quantitatives (ratio heures travail/repos, fréquence congés utilisés) avec benchmarks secteur santé | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 8 | 60-80h | Culture Amp Work-Life Balance Index - Mesure impact initiatives |

### 4.7.4 Culture Organisationnelle et Engagement

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| BET-039 | Calculer indice climat organisationnel via sondages engagement périodiques (eNPS, satisfaction, sentiment appartenance) avec segmentation par département et corrélations absentéisme | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 8 | 60-80h | Culture Amp Engagement - Mesure santé organisationnelle |
| BET-040 | Administrer sondages anonymes culture et valeurs organisationnelles avec échelles Likert standardisées et analyses thématiques NLP feedback qualitatif ouvert | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 7 | 40-60h | Officevibe Culture Surveys - Alignement valeurs employés/organisation |
| BET-041 | Implémenter rétroaction 360 degrés bien-être incluant auto-évaluation, pairs, superviseur et subordonnés avec consolidation anonymisée et rapports développement personnel | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 9 | 80-120h | Culture Amp 360 Reviews - Feedback holistique bien-être |
| BET-042 | Faciliter création groupes soutien par pairs thématiques (nouveaux parents, aidants naturels, deuil, santé mentale) avec forums discussion modérés et confidentialité renforcée | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 6 | 24-40h | Limeade Peer Support - Soutien social employés secteur santé |
| BET-043 | Jumeler automatiquement nouveaux employés avec mentors bien-être seniors selon profils compatibles (âge, intérêts, défis similaires) avec suivi engagements trimestriels | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 7 | 40-60h | Chronus Mentoring - Onboarding bien-être nouveaux CHSLD |

### 4.7.5 Gamification et Récompenses Bien-être

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| BET-044 | Attribuer points bien-être automatiquement pour activités santé complétées (exercices, méditation, sondages pulse, objectifs atteints) avec système accumulation et historique | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 40-60h | BET-008 enrichi - Virgin Pulse Points - Motivation extrinsèque engagement |
| BET-045 | Afficher classements équipes (leaderboards) défis santé hebdomadaires/mensuels avec anonymisation optionnelle, filtres département et règles anti-tricherie | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 4 | 6 | 24-40h | Wellable Challenges - Compétition saine entre équipes |
| BET-046 | Décerner badges virtuels accomplissements bien-être (séries consécutives, jalons santé, participation événements) avec affichage profil public et notifications célébration | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 4 | 5 | 16-24h | Virgin Pulse Badges - Reconnaissance visuelle accomplissements |
| BET-047 | Organiser défis inter-départements bien-être (marche collective, hydratation, sommeil) avec objectifs équipe, suivi progrès temps réel et prix symboliques gagnants | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 40-60h | Limeade Challenges - Cohésion équipes via compétition ludique |
| BET-048 | Échanger points bien-être contre récompenses tangibles configurables (cartes-cadeaux, congés supplémentaires, stationnement privilégié) avec catalogue administrable et inventaire | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 4 | 8 | 60-80h | Virgin Pulse Rewards - Incentives financiers engagement bien-être |
| BET-049 | Planifier événements bien-être virtuels synchrones (sessions yoga groupe, méditation guidée, conférences santé mentale) avec inscriptions, rappels et enregistrements | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 7 | 40-60h | Limeade Virtual Events - Engagement collectif travail hybride/quarts |

### 4.7.6 Analytics et ROI Bien-être

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| BET-050 | Calculer ROI initiatives bien-être via corrélations statistiques entre participation programmes et KPI business (absentéisme, roulement, productivité, incidents sécurité) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 10 | 120-160h | Limeade Analytics - Justification investissements bien-être direction |
| BET-051 | Analyser corrélations bien-être employé avec performance individuelle (évaluations, objectifs atteints) et rétention (années service, intention départ) avec modèles prédictifs | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 10 | 120-160h | Workday People Analytics - Lien bien-être/performance/rétention |
| BET-052 | Prédire impact initiatives bien-être futures via simulations scénarios (participation 30%/50%/70%, investissement budgétaire variable) avec modèles économétriques validés | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 4 | 10 | 160-240h | Virgin Pulse Predictive Analytics - Planification stratégique |
| BET-053 | Générer rapports conformité normes secteur santé (Agrément Canada, certifications Entreprise en Santé) avec indicateurs standardisés et preuves documentation automatique | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 8 | 60-80h | Standards Entreprise en Santé Québec - Certification bien-être |
| BET-054 | Produire analyses coût-bénéfice programmes bien-être (coût programme vs économies absentéisme/roulement/CNESST) avec projections 1-3-5 ans et seuils rentabilité | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 9 | 80-120h | Wellable Cost-Benefit - Business case programmes bien-être |
| BET-055 | Afficher tableau de bord exécutif bien-être consolidé avec métriques stratégiques (eNPS, absentéisme, participation programmes, ROI) et comparaisons temporelles trimestrielles | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 8 | 60-80h | Culture Amp Executive Dashboard - Vue stratégique direction |

### 4.7.7 Accessibilité et Inclusion

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| BET-056 | Support multilingue complet module bien-être (français, anglais, espagnol, arabe, créole haïtien) avec traductions professionnelles et adaptation culturelle contenus santé mentale | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 7 | 40-60h | Diversité linguistique CHSLD Québec - Inclusion immigrants |
| BET-057 | Conformité WCAG 2.1 AA complète (navigation clavier, lecteurs écran NVDA/JAWS, textes alternatifs, contraste couleurs) avec audits automatisés accessibilité | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 9 | 8 | 60-80h | Obligation légale Loi accessibilité Canada - Employés handicapés |
| BET-058 | Proposer mode contraste élevé et grossissement texte adaptatif (100%-200%) pour employés déficience visuelle avec persistance préférences utilisateur | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 6 | 24-40h | WCAG AAA partiel - Personnel vieillissant secteur santé 50+ |
| BET-059 | Offrir interface simplifiée mode senior avec navigation réduite, boutons larges, instructions explicites pour employés 50+ moins familiers technologies | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 7 | 40-60h | Démographie CHSLD - Majorité préposés 45-65 ans |
| BET-060 | Gérer accommodements religieux santé (jeûne Ramadan, Carême) avec ajustements horaires automatiques, rappels personnalisés et respect confidentialité croyances | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 6 | 24-40h | Diversité culturelle CHSLD - Inclusion minorités visibles |
| BET-061 | Adapter contenus bien-être sensibilité culturelle (méditation laïque vs religieuse, alimentation halal/casher/végétarienne) avec personnalisation préférences culturelles | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 7 | 40-60h | Wellable Cultural Adaptation - Respect diversité employés |

### 4.7.8 Plateformes Modernes et IA Avancée

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| BET-113 | Mesurer bien-être employé via questionnaire 26 items couvrant 7 sous-domaines (Calme, Connexion, Adaptation, Bonheur, Santé, Accomplissement, Sommeil) avec feedback personnalisé et recommandations contenu ciblé | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 8 | 60-80h | Unmind Index PMC8804960 - Mesure scientifique validée bien-être workplace |
| BET-114 | Déployer assistant IA conversationnel analysant parcours santé mentale individuel pour suggérer sessions mindfulness auto-guidées ou actions concrètes amélioration bien-être avec suivi contextuel | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 10 | 160-240h | Unmind Nova AI Coach - Personnalisation IA deep learning |
| BET-115 | Bloquer automatiquement créneaux calendrier quotidiens 2-4h pour travail concentré sans interruption avec mode silencieux notifications et suggestions envoi différé courriels | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 7 | 40-60h | Microsoft Viva Insights Focus Time - Prévention fragmentation attention |
| BET-116 | Analyser heures supplémentaires récurrentes, surcharge réunions, manque temps concentration pour identifier tendances menant au burnout avec visibilité granulaire gestionnaires | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 9 | 80-120h | Microsoft Viva Insights Burnout Detection - Analytics 48% employés rapportent burnout 2025 |
| BET-117 | Configurer heures travail personnalisées avec suppression automatique notifications Teams/Outlook après horaires et suggestions envoi différé lorsque courriel composé hors plage horaire destinataire | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 6 | 24-40h | Microsoft Viva Quiet Time - Respect frontières travail-vie |
| BET-118 | Proposer rituel transition 10-15 min début/fin quart avec activités guidées (méditation, révision objectifs, synthèse journée) pour séparer mentalement travail et vie personnelle en télétravail | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 5 | 16-24h | Microsoft Viva Virtual Commute - Frontières psychologiques travail hybride |
| BET-119 | Fournir catalogue multimédia expert 40+ thématiques santé mentale (anxiété, dépression, résilience, gestion conflits, épuisement compassion) avec méditations guidées, exercices respiration et ateliers structurés | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 6 | 24-40h | Tendances 2025 plateformes wellbeing - Contenu expert-led accessible 24/7 |
| BET-120 | Monitorer métriques santé (activité physique, sommeil, nutrition, stress physiologique) via intégrations wearables avec corrélations santé mentale et alertes anomalies biométriques | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 9 | 80-120h | Standards 2025 corporate wellness - Approche holistique santé physique/mentale |
| BET-121 | Créer défis motivants participation programmes bien-être avec système points, classements équipes et récompenses tangibles pour maintenir engagement long terme | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 40-60h | Fonctionnalité standard 9/10 plateformes 2025 - Gamification engagement |
| BET-122 | Suivre en continu indicateurs bien-être collectif avec rapports temps réel dirigeants pour insights opportuns santé physique/mentale workforce et prise décision proactive | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 8 | 60-80h | Core feature plateformes 2025 - Real-time monitoring health metrics |
| BET-123 | Permettre définition objectifs bien-être individuels avec collecte données biométriques, évaluations santé approfondies et solutions wellness sur mesure générées par IA | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 9 | 80-120h | Personalization trend 2025 - AI-driven tailored wellness solutions |
| BET-124 | Intégrer plateforme thérapie moderne combinant scalabilité EAP traditionnel avec personnalisation counseling interne via réseau global thérapeutes/coaches accessible + contenu auto-servi santé mentale | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 10 | 160-240h | Unmind/Modern EAP 2025 - Thérapie workplace scalable personnalisée |

### 4.7.9 Dashboards et Visualisations Temps Réel

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| BET-130 | Afficher graphiques évolution tendances bien-être sur 90 jours avec courbes multiples (score global, stress, satisfaction, humeur) et détection automatique pics/creux pour employé | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 7 | 40-60h | OrIAV1 intelligent_generator.py - WellnessInsightAnalyzer tendances |
| BET-131 | Visualiser carte thermique (heatmap) distribution bien-être par département/équipe avec gradients couleur vert-jaune-rouge et drill-down interactif pour gestionnaire | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 8 | 60-80h | OrIAV1 realtime_dashboard.py - Heatmap widget drill-down |
| BET-132 | Présenter tableau de bord temps réel avec métriques actualisées automatiquement toutes les 5 secondes via WebSocket (réponses aujourd'hui, engagement moyen, préoccupation majeure) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 9 | 9 | 80-120h | OrIAV1 realtime_dashboard.py - WebSocket dashboard complet |
| BET-133 | Afficher widget jauge satisfaction employés avec seuils configurables (60%, 80%) et codes couleur vert/jaune/rouge pour vue rapide gestionnaire | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 5 | 16-24h | OrIAV1 realtime_dashboard.py - Gauge widget seuils |
| BET-134 | Générer graphiques à barres comparant scores bien-être entre périodes (semaine actuelle vs précédente, mois vs mois) avec pourcentages variation | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 6 | 24-40h | OrIAV1 realtime_dashboard.py - Chart comparaison périodes |
| BET-135 | Créer fil d'activité temps réel (feed) affichant 20 dernières notifications bien-être avec auto-scroll et filtrage par gravité pour gestionnaire | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 6 | 24-40h | OrIAV1 realtime_dashboard.py - Realtime notifications feed |

### 4.7.10 Recommandations et Conseils IA Personnalisés

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| BET-136 | Générer automatiquement 3 recommandations actions prioritaires personnalisées pour employé basées sur analyse IA réponses récentes avec explications contextuelles | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 9 | 9 | 80-120h | OrIAV1 llama_assistant.py - LLaMA optimization_suggestions |
| BET-137 | Fournir suggestions résolution conflits bien-être avec solutions immédiates, alternatives possibles et risques à considérer expliqués en langage empathique par IA | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 10 | 120-160h | OrIAV1 llama_assistant.py - conflict_resolution prompt LLaMA |
| BET-138 | Proposer plans action bien-être personnalisés avec gains attendus estimés, étapes concrètes numérotées et KPIs suivi selon profil employé | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 9 | 9 | 80-120h | OrIAV1 llama_assistant.py - Plan d'action structuré généré IA |
| BET-139 | Afficher conseils contextuels adaptés au moment (matin: énergie, midi: pause, soir: déconnexion) selon heure réponse employé avec contenu ciblé 200 mots maximum | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | OrIAV1 llama_assistant.py - employee_support prompt contextuel |
| BET-140 | Fournir explications pédagogiques claires pourquoi planning/décisions bien-être sont optimales avec compromis effectués et suggestions amélioration prochaine fois | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 8 | 60-80h | OrIAV1 llama_assistant.py - schedule_explanation prompt |

### 4.7.11 Analyses Avancées et Détection Patterns

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| BET-141 | Calculer distribution influence réponses (négative/neutre/positive) sur 60 jours par employé avec comptage occurrences et identification patterns récurrents | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 7 | 40-60h | OrIAV1 intelligent_generator.py - get_employee_patterns influence_distribution |
| BET-142 | Détecter tendances bien-être employé (amélioration/stable/déclin) en comparant scores 2 dernières semaines vs 2 semaines précédentes avec seuil changement ±0.1 | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 6 | 24-40h | OrIAV1 intelligent_generator.py - Trend detection logic comparaison temporelle |
| BET-143 | Évaluer niveau engagement employé (faible/moyen/élevé) basé sur nombre réponses (< 3 = faible, > 10 = élevé) et temps réponse moyen (< 30s = bon) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 5 | 16-24h | OrIAV1 intelligent_generator.py - _assess_engagement_level métriques |
| BET-144 | Identifier zones préoccupation (stress, charge travail) et zones positives (équipe, motivation) selon seuil influence moyenne -0.3 / +0.3 sur 30 jours avec minimum 3 réponses | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 9 | 7 | 40-60h | OrIAV1 intelligent_generator.py - concerns et positive_areas detection |
| BET-145 | Analyser causes probables anomalies bien-être détectées avec évaluation gravité, actions correctives recommandées et mesures prévention future factuelles | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 9 | 80-120h | OrIAV1 llama_assistant.py - anomaly_explanation prompt analytique |
| BET-146 | Calculer score bien-être 0-1 normalisé à partir influence réponses (négatif=0.0, neutre=0.5, positif=1.0) avec moyenne glissante pour tendance | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 6 | 24-40h | OrIAV1 intelligent_generator.py - _calculate_wellbeing_score normalisé |
| BET-147 | Mesurer temps réponse moyen questions bien-être par employé et détecter réponses précipitées (< 10s) ou très longues (> 120s) comme indicateurs engagement | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 5 | 16-24h | OrIAV1 intelligent_generator.py - avg_response_time analysis seuils |

### 4.7.12 Gestion Pile Questions Intelligente

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| BET-148 | Prioriser automatiquement questions selon historique réponses employé: nouveau type=priorité 10, réponses négatives récentes=priorité 20, positives=priorité -5 | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 8 | 60-80h | OrIAV1 queue_manager.py - Prioritization adaptive logic historique |
| BET-149 | Ajuster fréquence présentation questions selon usage: questions peu utilisées = priorité augmentée, fréquence diminuée selon poids configuré | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | OrIAV1 queue_manager.py - _calculate_frequency_modifier usage |
| BET-150 | Éviter questions trop similaires en calculant intersection/union mots clés et rejeter nouvelles questions si similarité > 80% avec questions récentes 90 jours | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 7 | 40-60h | OrIAV1 intelligent_generator.py - similarity calculation + rejection |
| BET-151 | Permettre report question jusqu'à date ultérieure (skip_until) si employé indique mauvais moment sans pénaliser engagement global | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 5 | 16-24h | OrIAV1 wellness_v2.py - skip_until field EmployeeQuestionQueue |
| BET-152 | Suivre compteur présentations question par employé et augmenter priorité si présentée mais non répondue 3 fois (possiblement mal formulée) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 6 | 24-40h | OrIAV1 wellness_v2.py - presentation_count field tracking non-réponses |

### 4.7.13 Rapports, Exports et Alertes Intelligentes

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| BET-153 | Exporter rapport bien-être hebdomadaire PDF/CSV avec synthèse agrégée scores, graphiques tendances, top 3 préoccupations et suggestions IA pour gestionnaire | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 8 | 60-80h | OrIAV1 realtime_dashboard.py - _generate_report formats multiples |
| BET-154 | Générer rapport comparatif périodes (semaine/mois/trimestre/année/depuis début) avec métriques standardisées et évolution pourcentage pour direction | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | OrIAV1 router.py - wellness_report_period avec périodes multiples |
| BET-155 | Produire rapport global analytics bien-être consolidé toutes sources données (questionnaires, messages, auto-évaluations) avec agrégations multi-niveaux | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 8 | 60-80h | OrIAV1 router.py - generate_global_report consolidé multi-sources |
| BET-156 | Configurer règles alertes personnalisables avec opérateurs comparaison (>, <, >=, <=, ==, !=), seuils multiples et actions automatiques déclenchées | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 8 | 60-80h | OrIAV1 realtime_dashboard.py - Alert rules evaluation engine |
| BET-157 | Déclencher alertes temps réel avec niveaux gravité (info/warning/error/critical) et diffusion WebSocket tous clients connectés pour réactivité maximale | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 9 | 8 | 60-80h | OrIAV1 realtime_dashboard.py - _trigger_alert avec AlertSeverity WebSocket |
| BET-158 | Enregistrer historique alertes avec timestamp, métrique concernée, seuil dépassé, valeur réelle et statut résolution pour audit | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 6 | 24-40h | OrIAV1 realtime_dashboard.py - Alert dataclass complet audit trail |
| BET-159 | Permettre acquittement manuel alertes par gestionnaire via endpoint API POST avec changement statut resolved=true | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 5 | 16-24h | OrIAV1 realtime_dashboard.py - acknowledge_alert endpoint |

### 4.7.14 Widgets UI et Composants Visuels

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| BET-160 | Afficher carte progression bien-être employé avec barre linéaire colorée selon tendance (vert=amélioration, rouge=déclin, bleu=stable) et texte explicatif | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 6 | 24-40h | OrIAV1 wellness_unified_widgets.dart - WellnessProgressCard visuel |
| BET-161 | Présenter carte conseils réponse avec icône ampoule et 4 points clés (spontanéité, honnêteté, confidentialité, possibilité reporter) sur fond bleu pâle | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 4 | 8-16h | OrIAV1 wellness_unified_widgets.dart - WellnessTipsCard guidage |
| BET-162 | Créer widget état vide (empty state) configurable avec icône grande taille, titre, sous-titre et boutons action optionnels centré verticalement | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 5 | 16-24h | OrIAV1 wellness_unified_widgets.dart - WellnessEmptyStateWidget |
| BET-163 | Implémenter carte question employé avec animations entrée (scale + options staggered), sélection réponse, section commentaire optionnel et bouton reporter | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 8 | 60-80h | OrIAV1 wellness_unified_widgets.dart - EmployeeQuestionCard animated |

### 4.7.15 Métriques Système et Monitoring Performance

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| BET-164 | Collecter métriques système (CPU %, mémoire %, disque %) toutes les 5 secondes avec rétention 24h configurable et agrégations min/max/avg/p50/p95/p99 | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 40-60h | OrIAV1 realtime_dashboard.py - MetricsCollector complet percentiles |
| BET-165 | Calculer automatiquement agrégations statistiques (min, max, moyenne, médiane, écart-type, percentiles 50/95/99) pour toutes métriques collectées | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 6 | 24-40h | OrIAV1 realtime_dashboard.py - _update_aggregations stats avancées |
| BET-166 | Stocker historique métriques avec nettoyage automatique données anciennes dépassant fenêtre rétention (24h par défaut) pour optimiser mémoire | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 6 | 24-40h | OrIAV1 realtime_dashboard.py - _cleanup_old_data automatique |
| BET-167 | Exposer API REST GET métriques actuelles, historique métrique spécifique, alertes actives et configuration widgets pour intégrations externes | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 7 | 40-60h | OrIAV1 realtime_dashboard.py - API endpoints multiples REST |

### 4.7.16 Génération Questions IA Avancée

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| BET-168 | Construire prompt adaptatif IA incluant zones préoccupation détectées, domaines positifs et types questions récents à éviter pour génération contextuelle | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 8 | 60-80h | OrIAV1 intelligent_generator.py - _build_adaptive_prompt contextualisé |
| BET-169 | Valider unicité questions générées via hash SHA256 prompt JSON pour éviter duplication exacte même si texte légèrement différent | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 6 | 24-40h | OrIAV1 intelligent_generator.py - ai_prompt_hash déduplication SHA256 |
| BET-170 | Enregistrer log génération automatique avec batch ID, cible, résultat, durée, prompt complet, modèle IA utilisé, facteurs adaptation et succès/erreur | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 7 | 40-60h | OrIAV1 intelligent_generator.py - WellnessGenerationLog complet audit |
| BET-171 | Implémenter fallback questions prédéfinies (humeur, stress, satisfaction) si échec génération IA pour garantir continuité service | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 5 | 16-24h | OrIAV1 intelligent_generator.py - _get_fallback_questions secours |
| BET-172 | Vérifier conditions génération (< 5 questions en attente validation, intervalle minimum 24h depuis dernière) avant déclencher génération automatique | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 6 | 24-40h | OrIAV1 intelligent_generator.py - should_generate_questions garde-fous |

### 4.7.17 Vues Consolidées et Données Agrégées

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| BET-173 | Fournir vue overview bien-être adaptée rôle (employé/admin) consolidant infos utilisateur, questions pending/répondues, stats équipe et alertes actives | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 8 | 7 | 40-60h | OrIAV1 wellness_unified_models.dart - WellnessOverview multi-rôles |
| BET-174 | Calculer propriétés commodité accessibles directement (pendingQuestions, answeredThisWeek, totalEmployees) depuis objet overview pour simplifier UI | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 6 | 4 | 8-16h | OrIAV1 wellness_unified_models.dart - Convenience properties calculées |

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

### 4.10 Gestion de la Paie

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| PAY-001 | Calculer automatiquement les salaires horaires basés sur heures travaillées réelles avec taux horaires configurables par employé | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | CRITIQUE MVP - OrIAV3 REQ-PAY-001 - Base calcul paie |
| PAY-002 | Calculer les salaires forfaitaires (annuels, mensuels) avec proratisation automatique pour embauches ou départs en cours de période | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | CRITIQUE - Support employés salariés |
| PAY-003 | Gérer les salaires mixtes combinant partie fixe et commissions variables avec calculs selon paliers de vente atteints | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 9 | 80-120h | Secteurs ventes/développement affaires |
| PAY-004 | Calculer les primes d'ancienneté automatiques selon échelle définie et années de service cumulées pour chaque employé | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 5 | 8-16h | Conventions collectives secteur santé |
| PAY-005 | Calculer les primes de performance basées sur évaluations ou objectifs atteints avec pourcentages ou montants fixes configurables | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 5 | 7 | 24-40h | Motivation employés - Rétention talents |
| PAY-006 | Appliquer automatiquement les primes de quarts spéciaux (soir, nuit, weekend, jours fériés) selon taux majorés configurés | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | CRITIQUE - Conventions CHSLD - Intégration HOR-906/907 |
| PAY-007 | Calculer automatiquement toutes déductions fiscales fédérales canadiennes (Impôt, AE, RPC) selon barèmes officiels en vigueur | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 9 | 80-120h | CRITIQUE LÉGAL - OrIAV3 REQ-PAY-002 - Conformité ARC |
| PAY-008 | Calculer automatiquement toutes déductions fiscales provinciales québécoises (Impôt QC, RRQ, RQAP, RAMQ) selon barèmes officiels | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 9 | 80-120h | CRITIQUE LÉGAL - Conformité Revenu Québec |
| PAY-009 | Permettre la mise à jour des barèmes fiscaux via fichiers de configuration sans nécessiter de redéploiement du système | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | CRITIQUE - Ajustements annuels janvier sans downtime |
| PAY-010 | Gérer les exemptions et crédits d'impôt personnels par employé (TD1 fédéral et TP-1015.3 Québec) avec calculs optimisés | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 9 | 80-120h | CRITIQUE - Précision fiscale individuelle |
| PAY-011 | Générer automatiquement les feuillets T4 et T4A fédéraux en formats XML et PDF conformes aux spécifications de l'ARC | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 9 | 80-120h | CRITIQUE LÉGAL - OrIAV3 REQ-PAY-003 - Obligation annuelle |
| PAY-012 | Générer automatiquement les Relevés 1 du Québec en format requis par Revenu Québec avec validation des données obligatoires | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 9 | 80-120h | CRITIQUE LÉGAL - Obligation annuelle Québec |
| PAY-013 | Produire les déclarations mensuelles ou trimestrielles obligatoires (DAS, cotisations CNESST) avec preuves de transmission | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 9 | 80-120h | CRITIQUE - Conformité CNESST secteur santé |

| PAY-014 | Clôturer une période de paie avec verrouillage des données (heures, primes) et journal d'audit; possibilité de réouverture contrôlée | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | Concurrents: pay period close/reopen |
| PAY-015 | Verrouiller l'édition des heures approuvées après clôture; corrections via ajustements avec justification et double validation | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | Contrôle post-approbation |
| PAY-016 | Rapprocher automatiquement paie et heures approuvées avec détection d'écarts, tolérances configurables et rapport d'anomalies | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | Concurrents: payroll reconciliation |
| PAY-017 | Autoriser l'export paie uniquement pour les périodes verrouillées avec contrôles pré‑export (cohérence, doublons, champs obligatoires) | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 10 | 7 | 24-40h | Gatekeeping export |

### 4.11 Documents et Attestations

| Requis | Description | MVP | Admin | Gestionnaire | Superviseur | Employé | Patient | Famille | Priorité (1-10) | Complexité (1-10) | Estimation | Notes |
|--------|-------------|-----|-------|--------------|-------------|---------|---------|---------|------------------|-------------------|------------|-------|
| DOC-001 | Générer automatiquement des attestations de revenus pour employés (relevés d'emploi, lettres de confirmation) à la demande | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 7 | 24-40h | OrIAV3 REQ-PAY-005 - Service employés (prêts, logement) |
| DOC-002 | Produire des relevés de paie détaillés pour périodes personnalisées avec cumuls annuels et historique complet accessible | ☐ | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | ☐C ☐L ☐E ☐S ☐X ☐V | 7 | 5 | 8-16h | Transparence salaire - Conformité Loi normes travail |

---

## 📊 STATISTIQUES DU SONDAGE

**Total requis identifiés** : 560 (+131 nouveaux requis - incluant 74 requis bien-être enrichis depuis archives OrIA et plateformes concurrentes 2025)
**Requis bien-être totaux** : 145 (BET-001 à BET-174) - Module le plus complet
**Modules couverts** : 4 (Communication, Horaires, Gestionnaire, Administration+Bien-être)
**Nouvelles sections ajoutées** : 28 (1.8 Collaboration d'Équipe, 2.9 Pointage et Présence, 2.10 Gestion Heures Supplémentaires, 3.7 Gestion des Remplacements, 3.8 Prévisions et Budgétisation, 3.9 Formation et Développement, 4.7.0 Génération et Gestion Questions IA, 4.7.1 Programmes Santé Physique et Mentale, 4.7.2 Prévention et Intervention, 4.7.3 Équilibre Travail-Vie et Flexibilité, 4.7.4 Culture Organisationnelle et Engagement, 4.7.5 Gamification et Récompenses Bien-être, 4.7.6 Analytics et ROI Bien-être, 4.7.7 Accessibilité et Inclusion, 4.7.8 Plateformes Modernes et IA Avancée, 4.7.9 Dashboards et Visualisations Temps Réel, 4.7.10 Recommandations et Conseils IA Personnalisés, 4.7.11 Analyses Avancées et Détection Patterns, 4.7.12 Gestion Pile Questions Intelligente, 4.7.13 Rapports Exports et Alertes Intelligentes, 4.7.14 Widgets UI et Composants Visuels, 4.7.15 Métriques Système et Monitoring Performance, 4.7.16 Génération Questions IA Avancée, 4.7.17 Vues Consolidées et Données Agrégées, 4.8 Sauvegarde et Archivage, 4.9 Conformité et Juridique, 4.10 Gestion de la Paie, 4.11 Documents et Attestations)
**Rôles définis** : 6 (Admin, Gestionnaire, Superviseur, Employé, Patient, Famille)
**Actions par rôle** : 6 (Créer, Lire, Éditer, Supprimer, eXporter, Valider)

### Répartition des Requis par Module
- **MODULE 1 - Communication** : 83 requis (incluant 19 ajouts critiques)
- **MODULE 2 - Gestion des Horaires** : 105 requis (+12 nouveaux : HOR-011 à HOR-014, HOR-806 à HOR-809, HOR-906 à HOR-909)
- **MODULE 3 - Gestionnaire** : 110 requis (+17 nouveaux : GES-015 à GES-022, GES-509 à GES-513, GES-801 à GES-804 + nouvelle section 3.9 Formation)
- **MODULE 4 - Administration et Bien-être** : 131 requis (+60 nouveaux : ADM-409 à ADM-411, BET-020 à BET-061, PAY-001 à PAY-013, DOC-001 à DOC-002 + 7 nouvelles sous-sections bien-être + sections 4.10 Paie et 4.11 Documents)

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

#### 4.7 Bien-être avec IA et Analyse Passive (BET-001 à BET-019, BET-101 à BET-112)
- BET-010 : Surveillance continue du bien-être par analyses passives plutôt que sondages annuels uniquement
- BET-011 : Analyse des habitudes de travail pour détecter heures excessives et pauses manquées
- BET-012 : Suivi de l'intensité de la charge de travail avec alertes en cas de surcharge prolongée
- BET-013 : Propositions automatiques d'interventions personnalisées comme ajustement de charge ou rappels de pause
- BET-108 : Analyse des données provenant de multiples sources de communication (courriels, messagerie interne, outils externes)
- BET-109 : Intégration avec plateformes d'analyse du bien-être Microsoft Viva Insights ou Workday People Analytics

#### 4.7.1 Programmes Santé Physique et Mentale (BET-020 à BET-025) - NOUVEAU
- BET-020 : Programmes exercice physique guidés (yoga, étirements bureau) réduire TMS personnel soignant
- BET-021 : Intégration wearables (Fitbit, Apple Watch, Garmin) suivi activité, fréquence cardiaque, sommeil
- BET-022 : Programmes santé mentale structurés (méditation, gestion stress, techniques respiration) sessions 5-15min
- BET-023 : Coaching santé personnalisé virtuel avec objectifs mesurables (IMC, sommeil, anxiété)
- BET-024 : Objectifs santé personnalisables (perte poids, arrêt tabac, activité quotidienne) avec rappels adaptatifs
- BET-025 : Tableau de bord santé holistique consolidant activité, nutrition, sommeil, stress avec score global

#### 4.7.2 Prévention et Intervention (BET-026 à BET-032) - NOUVEAU
- BET-026 : Hotline PAE 24/7 bouton urgence psychologique transfert professionnels certifiés
- BET-027 : Répertoire ressources santé mentale géolocalisées (psychologues, CLSC, organismes Québec) temps réel
- BET-028 : Plans action bien-être personnalisés automatiques selon évaluations avec recommandations priorisées
- BET-029 : Programme retour travail progressif post-absence maladie longue avec suivi médical et ajustements
- BET-030 : Suivi accommodements santé avec alertes expiration certificats et renouvellements automatiques
- BET-031 : Détection employés haut risque burnout via analyse prédictive multicritères déclenchant intervention
- BET-032 : Séances thérapie en ligne confidentielles subventionnées (3-8/an) plateforme HIPAA/Loi 25 conforme

#### 4.7.3 Équilibre Travail-Vie et Flexibilité (BET-033 à BET-038) - NOUVEAU
- BET-033 : Calcul charge travail hebdomadaire avec seuils alertes configurables (45h, 50h, 60h) escalade gestionnaire
- BET-034 : Détection déséquilibre travail-vie via patterns récurrents (heures excessives 3+ semaines, pauses manquées)
- BET-035 : Suggestions ajustements horaires intelligents avec simulations impact charge équipe
- BET-036 : Jours santé mentale (mental health days) dédiés quota annuel 2-5 jours sans justification médicale
- BET-037 : Flexibilité horaires rendez-vous médicaux créneaux 2-4h sans pénalité intégration calendriers
- BET-038 : Indice équilibre travail-vie via sondages + métriques quantitatives avec benchmarks secteur santé

#### 4.7.4 Culture Organisationnelle et Engagement (BET-039 à BET-043) - NOUVEAU
- BET-039 : Indice climat organisationnel via sondages engagement (eNPS, satisfaction) segmentation département
- BET-040 : Sondages anonymes culture et valeurs avec échelles Likert et analyses NLP feedback qualitatif
- BET-041 : Rétroaction 360 degrés bien-être (auto, pairs, superviseur, subordonnés) rapports développement
- BET-042 : Groupes soutien par pairs thématiques (parents, aidants, deuil) forums modérés confidentiels
- BET-043 : Jumelage automatique nouveaux employés avec mentors bien-être selon profils compatibles

#### 4.7.5 Gamification et Récompenses Bien-être (BET-044 à BET-049) - NOUVEAU
- BET-044 : Points bien-être automatiques activités santé (exercices, méditation, sondages) avec accumulation
- BET-045 : Classements équipes défis santé avec anonymisation optionnelle et règles anti-tricherie
- BET-046 : Badges virtuels accomplissements bien-être (séries, jalons) affichage profil public
- BET-047 : Défis inter-départements (marche, hydratation, sommeil) objectifs équipe et prix symboliques
- BET-048 : Échange points contre récompenses tangibles (cartes-cadeaux, congés, stationnement) catalogue administrable
- BET-049 : Événements bien-être virtuels synchrones (yoga groupe, méditation) inscriptions et enregistrements

#### 4.7.6 Analytics et ROI Bien-être (BET-050 à BET-055) - NOUVEAU
- BET-050 : ROI initiatives bien-être via corrélations participation programmes et KPI business (absentéisme, roulement)
- BET-051 : Corrélations bien-être avec performance individuelle et rétention avec modèles prédictifs
- BET-052 : Prédiction impact initiatives futures via simulations scénarios avec modèles économétriques
- BET-053 : Rapports conformité normes santé (Agrément Canada, Entreprise en Santé) indicateurs standardisés
- BET-054 : Analyses coût-bénéfice programmes (coût vs économies absentéisme/roulement) projections 1-3-5 ans
- BET-055 : Tableau de bord exécutif consolidé métriques stratégiques (eNPS, absentéisme, ROI) comparaisons trimestrielles

#### 4.7.7 Accessibilité et Inclusion (BET-056 à BET-061) - NOUVEAU
- BET-056 : Support multilingue complet (français, anglais, espagnol, arabe, créole) adaptation culturelle santé mentale
- BET-057 : Conformité WCAG 2.1 AA complète (navigation clavier, lecteurs écran, contraste) audits automatisés
- BET-058 : Mode contraste élevé et grossissement texte 100-200% déficience visuelle persistance préférences
- BET-059 : Interface simplifiée mode senior navigation réduite boutons larges employés 50+ moins techno
- BET-060 : Accommodements religieux santé (jeûne Ramadan, Carême) ajustements horaires confidentialité croyances
- BET-061 : Adaptation contenus sensibilité culturelle (méditation laïque, alimentation halal/casher/végétarienne)

**Sources documentées** : Agendrix, Deputy, Homebase, Evolia, Workday, Shiftboard, StaffReady, Microsoft Viva Insights, Workday People Analytics, Virgin Pulse, Wellable, Limeade, Culture Amp, Officevibe, BetterHelp, Talkspace, Chronus, Agrément Canada, Entreprise en Santé Québec, LSST Québec (2025)

---

**Fin du sondage - Version 4 modules - Prêt pour sélection MVP**

Total requis identifiés : 560 (incluant 145 requis bien-être BET-001 à BET-174, dont 74 nouveaux depuis archives OrIA V1/V2/V3/V4 et concurrence 2025)
