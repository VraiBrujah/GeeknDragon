# 🔍 Analyse des Requis Manquants - ORIA MVP

**Date d'analyse** : 2025-10-07
**Objectif** : Identifier les requis manquants dans les 4 méta-modules

---

## MODULE 1 : COMMUNICATION

### ✅ Sections existantes
1. Demandes de Congés (6 requis)
2. Absences Maladie (2 requis)
3. Échanges de Quarts (4 requis)
4. Rapports d'Incident (4 requis)
5. Babillard/Annonces (4 requis)
6. Messagerie Interne (4 requis)
7. Notifications (?)

### 🚨 REQUIS MANQUANTS IDENTIFIÉS

#### 1.1 Demandes de Congés
- **COM-007** : Calculer automatiquement le solde de congés restant par type (vacances, maladie, personnel)
- **COM-008** : Afficher le calendrier des congés d'équipe pour éviter conflits et sous-effectif
- **COM-009** : Configurer les règles d'accumulation de congés selon ancienneté et convention collective
- **COM-010** : Gérer les reports de congés non utilisés d'une année à l'autre avec limites maximales

#### 1.2 Absences Maladie
- **COM-103** : Suivre le taux d'absentéisme par employé, équipe et département avec alertes
- **COM-104** : Gérer les absences de longue durée avec suivi médical et retour progressif au travail
- **COM-105** : Intégrer avec les assurances collectives pour déclarations d'invalidité

#### 1.3 Échanges de Quarts
- **COM-205** : Historique complet des échanges de quarts avec raisons et approbations
- **COM-206** : Limitations configurables sur nombre d'échanges par période pour éviter abus

#### 1.7 Notifications (SECTION À COMPLÉTER)
- **COM-601** : Configurer les préférences de notification par canal (courriel, SMS, application, poussée)
- **COM-602** : Recevoir des notifications en temps réel pour événements critiques (absence imprévue, incident)
- **COM-603** : Gérer les rappels automatiques pour actions en attente (approbations, validations)
- **COM-604** : Consulter l'historique des notifications envoyées et leur statut de lecture

#### 1.8 Collaboration d'Équipe (NOUVELLE SECTION)
- **COM-701** : Créer et gérer des notes de transmission entre quarts de travail
- **COM-702** : Partager des listes de vérification et procédures opératoires standardisées
- **COM-703** : Documenter les événements importants du quart pour continuité des soins

---

## MODULE 2 : GESTION DES HORAIRES

### ✅ Sections existantes
1. Création et Planification (5 requis)
2. Assignation Employés (8 requis)
3. Quarts Ouverts/Volontariat (5 requis)
4. Disponibilités et Préférences (4 requis)
5. Visualisation Calendrier (5 requis)
6. Détection Conflits (6 requis)
7. Exportation Horaires (3 requis)
8. Historique Modifications (2 requis)

### 🚨 REQUIS MANQUANTS IDENTIFIÉS

#### 2.1 Création et Planification
- **HOR-006** : Créer des modèles d'horaires récurrents (rotation 2 semaines, 3 semaines, mensuelle)
- **HOR-007** : Copier un horaire existant vers une nouvelle période avec ajustements mineurs
- **HOR-008** : Planifier à l'avance les horaires sur plusieurs mois avec visibilité employés
- **HOR-009** : Bloquer des périodes de haute demande (Noël, été) avec règles spéciales

#### 2.3 Quarts Ouverts/Volontariat
- **HOR-206** : Publier des quarts en surtemps avec majoration salariale configurée
- **HOR-207** : Gérer une liste d'attente pour quarts populaires avec ordre d'attribution équitable

#### 2.4 Disponibilités et Préférences
- **HOR-305** : Gérer les indisponibilités récurrentes (cours, engagements personnels)
- **HOR-306** : Définir des préférences de collègues préférés pour travail d'équipe

#### 2.9 Pointage et Présence (NOUVELLE SECTION)
- **HOR-801** : Pointer l'arrivée et le départ avec horodatage géolocalisé
- **HOR-802** : Gérer les retards et départs anticipés avec justification
- **HOR-803** : Ajuster automatiquement les heures travaillées vs heures planifiées
- **HOR-804** : Détecter les anomalies de pointage (oublis, incohérences)
- **HOR-805** : Exporter les données de présence vers système de paie

#### 2.10 Gestion Heures Supplémentaires (NOUVELLE SECTION)
- **HOR-901** : Calculer automatiquement les heures supplémentaires selon règles LNT Québec (>40h/semaine)
- **HOR-902** : Distinguer heures normales, supplémentaires 1.5x et majorées 2x (jours fériés)
- **HOR-903** : Préapprouver ou rejeter les heures supplémentaires avant exécution
- **HOR-904** : Suivre le budget d'heures supplémentaires par équipe et département
- **HOR-905** : Offrir option de compensation en temps au lieu de paiement

---

## MODULE 3 : GESTIONNAIRE

### ✅ Sections existantes
1. Gestion Employés (5 requis)
2. Gestion Lieux (5 requis)
3. Gestion Équipes (6 requis)
4. Gestion Tâches (7 requis)
5. Gestion Patients CHSLD (7 requis)
6. Rapports et KPI (3 requis)

### 🚨 REQUIS MANQUANTS IDENTIFIÉS

#### 3.1 Gestion Employés
- **GES-006** : Gérer les compétences et certifications des employés avec dates d'expiration
- **GES-007** : Suivre la formation obligatoire et envoyer rappels avant expiration
- **GES-008** : Gérer le processus d'intégration (onboarding) des nouveaux employés avec checklist
- **GES-009** : Centraliser les documents RH (contrat, évaluations, formations) par employé
- **GES-010** : Gérer les évaluations de performance avec objectifs et révisions périodiques

#### 3.4 Gestion Tâches
- **GES-308** : Créer des modèles de tâches récurrentes pour différents types de quarts
- **GES-309** : Affecter des tâches spécifiques à des employés qualifiés automatiquement
- **GES-310** : Suivre le temps passé sur chaque tâche pour optimisation future

#### 3.6 Rapports et KPI
- **GES-504** : Tableau de bord temps réel avec indicateurs clés (présence, absences, heures sup)
- **GES-505** : Analyser les coûts de main-d'oeuvre avec prévisions budgétaires
- **GES-506** : Comparer les performances entre équipes et départements
- **GES-507** : Générer des rapports de conformité réglementaire (LNT, CNESST)
- **GES-508** : Exporter les données pour analyse dans outils externes (Excel, Power BI)

#### 3.7 Gestion des Remplacements (NOUVELLE SECTION)
- **GES-601** : Gérer une liste de remplaçants qualifiés par type de poste
- **GES-602** : Contacter automatiquement les remplaçants selon ordre de priorité
- **GES-603** : Suivre l'historique des remplacements et taux d'acceptation
- **GES-604** : Gérer les remplacements d'urgence avec protocole accéléré

#### 3.8 Prévisions et Budgétisation (NOUVELLE SECTION)
- **GES-701** : Prévoir les besoins en personnel selon volume d'activité historique
- **GES-702** : Budgétiser les coûts de main-d'oeuvre par période et département
- **GES-703** : Comparer les prévisions vs réel avec analyse des écarts
- **GES-704** : Optimiser les horaires pour respecter contraintes budgétaires

---

## MODULE 4 : ADMINISTRATION ET BIEN-ÊTRE

### ✅ Sections existantes
1. Configuration Globale (4 requis)
2. Types et Référentiels (4 requis)
3. Sécurité et Permissions (5 requis)
4. Règles Métier (7 requis)
5. Intégrations (4 requis)
6. Bien-être avec IA (13 requis)
7. Analyse Passive IA (9 requis)

### 🚨 REQUIS MANQUANTS IDENTIFIÉS

#### 4.1 Configuration Globale
- **ADM-005** : Configurer les fuseaux horaires pour organisations multi-sites
- **ADM-006** : Gérer les langues disponibles dans l'interface (français, anglais, multilingue)
- **ADM-007** : Personnaliser les étiquettes et terminologie selon secteur d'activité

#### 4.2 Types et Référentiels
- **ADM-105** : Définir les types de tâches avec temps estimé et compétences requises
- **ADM-106** : Gérer la hiérarchie des postes et titres d'emploi
- **ADM-107** : Configurer les types d'événements et incidents

#### 4.3 Sécurité et Permissions
- **ADM-206** : Gérer les sessions actives et forcer déconnexion à distance
- **ADM-207** : Configurer les restrictions d'accès par adresse IP ou géolocalisation
- **ADM-208** : Historique complet des connexions avec détection d'activités suspectes

#### 4.5 Intégrations
- **ADM-405** : Intégrer avec systèmes de gestion des temps (biométrie, badgeuse)
- **ADM-406** : Synchronisation bidirectionnelle avec Active Directory ou LDAP
- **ADM-407** : Webhooks pour notifications vers systèmes externes (Slack, Teams, etc.)
- **ADM-408** : API REST complète pour intégrations tierces personnalisées

#### 4.8 Sauvegarde et Archivage (NOUVELLE SECTION)
- **ADM-501** : Sauvegardes automatiques quotidiennes avec rétention configurable
- **ADM-502** : Exporter toutes les données d'une organisation pour archivage
- **ADM-503** : Restaurer des données depuis une sauvegarde spécifique
- **ADM-504** : Archiver automatiquement les données anciennes selon politique de rétention
- **ADM-505** : Purger les données au-delà de la période de rétention légale

#### 4.9 Conformité et Juridique (NOUVELLE SECTION)
- **ADM-601** : Générer des rapports de conformité LNT Québec (heures, repos, congés)
- **ADM-602** : Preuves électroniques horodatées pour litiges ou audits
- **ADM-603** : Gestion des demandes d'accès à l'information (RGPD, Loi 25)
- **ADM-604** : Traçabilité complète de toutes modifications avec auteur et date
- **ADM-605** : Consentement explicite des employés pour collecte et traitement données

---

## 📊 RÉSUMÉ DES REQUIS MANQUANTS

### Par Module
- **MODULE 1 - Communication** : 19 requis manquants
- **MODULE 2 - Horaires** : 15 requis manquants
- **MODULE 3 - Gestionnaire** : 19 requis manquants
- **MODULE 4 - Administration** : 17 requis manquants

**TOTAL : 70 requis manquants identifiés**

### Nouvelles Sections à Ajouter
1. MODULE 1 : Collaboration d'Équipe (1.8)
2. MODULE 2 : Pointage et Présence (2.9)
3. MODULE 2 : Gestion Heures Supplémentaires (2.10)
4. MODULE 3 : Gestion des Remplacements (3.7)
5. MODULE 3 : Prévisions et Budgétisation (3.8)
6. MODULE 4 : Sauvegarde et Archivage (4.8)
7. MODULE 4 : Conformité et Juridique (4.9)

---

## 🎯 REQUIS CRITIQUES À PRIORISER

### Obligatoires pour MVP v1
1. **HOR-801 à HOR-805** : Pointage et présence (essentiel pour paie)
2. **HOR-901 à HOR-905** : Gestion heures supplémentaires (conformité légale)
3. **GES-006 à GES-009** : Gestion complète dossier employé
4. **GES-601 à GES-604** : Gestion remplacements (opérationnel critique)
5. **ADM-601 à ADM-605** : Conformité légale (obligatoire Québec)
6. **COM-007** : Calcul soldes de congés (gestion RH de base)

### Optionnels pour MVP v2
1. **GES-701 à GES-704** : Prévisions et budgétisation
2. **COM-701 à COM-703** : Collaboration d'équipe
3. **ADM-501 à ADM-505** : Sauvegarde et archivage

---

**Conclusion** : Le sondage actuel couvre ~270 requis mais il manque **70 requis essentiels** pour une solution complète de gestion RH et horaires. La priorité doit être donnée aux fonctionnalités de pointage, heures supplémentaires, gestion documentaire des employés, et conformité réglementaire québécoise.
