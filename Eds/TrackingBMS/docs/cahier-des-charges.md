# Cahier des Charges - Système de Tracking BMS Multi-Client

**Projet :** TrackingBMS  
**Version :** 1.0  
**Date :** 2025-09-01  
**Client :** EDS Québec  

## 1. Contexte et Objectifs

### 1.1 Contexte
EDS Québec souhaite développer un système de suivi et visualisation en temps réel des données BMS (Battery Management System) pour ses clients. Le système doit être évolutif pour pouvoir intégrer d'autres types de produits à l'avenir.

### 1.2 Objectifs principaux
- **MVP :** Affichage des données BMS des batteries clients via interface web
- **Vision :** Système généralisable pour tous produits EDS Québec
- **Contraintes :** Hébergement HostPapa, sécurité maximale, temps réel

## 2. Architecture Générale

### 2.1 Principe fondamental
Architecture modulaire autonome avec communication inter-modules universelle de type API REST.

### 2.2 Modules identifiés

#### Module Core (Noyau)
- Gestion de l'authentification multi-tenant
- Routage des communications
- Gestion des permissions
- Logging centralisé

#### Module BMS Connector
- Interface avec les APIs BMS (foxBMS, Libre Solar, Green-BMS)
- Collecte des données en temps réel
- Normalisation des formats de données

#### Module Database Manager
- Gestion multi-tenant sécurisée
- CRUD operations
- Backup automatique
- Isolation des données par client

#### Module API Gateway
- Point d'entrée unique pour toutes les requêtes
- Authentification/autorisation
- Rate limiting
- Documentation automatique (OpenAPI)

#### Module Data Processor
- Traitement et transformation des données brutes
- Calculs statistiques
- Alertes et notifications
- Historisation

#### Module Web Interface
- Interface utilisateur hiérarchique
- Tableaux de bord personnalisables
- Filtres et recherche avancée
- Responsive design

#### Module Client Manager
- Gestion des clients et utilisateurs
- Profils et permissions
- Personnalisation des champs
- Configuration des alertes

## 3. Spécifications Fonctionnelles

### 3.1 Gestion Multi-Client
- **Isolation totale** : Chaque client ne voit que ses données
- **Personnalisation** : Champs custom par client
- **Hiérarchisation** : Types de batteries → Lieux → Batteries → Données

### 3.2 Collecte des Données BMS
- **Temps réel** : Mise à jour < 5 secondes
- **Formats supportés** : JSON ThingSet, Modbus, CAN bus
- **Données collectées** :
  - Tension (cellules et pack)
  - Courant (charge/décharge)
  - Température (cellules et environnement)
  - État de charge (SOC)
  - État de santé (SOH)
  - Cycles de charge
  - Alertes et erreurs

### 3.3 Interface Web Utilisateur

#### Hiérarchie d'affichage
```
Client
├── Types de Batteries (Li-ion, LiFePO4, etc.)
│   ├── Lieux d'Installation
│   │   ├── Batteries Individuelles
│   │   │   ├── Données Temps Réel
│   │   │   ├── Historiques
│   │   │   └── Champs Personnalisés
```

#### Fonctionnalités interface
- **Dashboard principal** avec métriques clés
- **Filtres avancés** par type, lieu, status, date
- **Recherche globale** sur tous les champs
- **Alertes visuelles** pour anomalies
- **Export des données** (CSV, PDF, Excel)
- **Graphiques** interactifs (Chart.js ou D3.js)

### 3.4 Champs de Personnalisation
Les clients peuvent ajouter des champs custom :
- **Fonctionnalité** (éclairage, backup, traction)
- **Projet** associé
- **Responsable** maintenance
- **Notes** libres
- **Tags** pour catégorisation

## 4. Spécifications Techniques

### 4.1 Technologies Recommandées

#### Backend
- **PHP 8.2+** avec framework Symfony ou Laravel
- **MySQL 8.0+** pour base de données principale
- **Redis** pour cache et sessions
- **WebSocket** pour temps réel (ReactPHP/Swoole)

#### Frontend
- **HTML5/CSS3** responsive
- **JavaScript ES6+** (Vanilla ou Vue.js léger)
- **Chart.js** pour graphiques
- **WebSocket** client pour temps réel

#### APIs BMS Intégrées
- **foxBMS** - API REST/WebSocket
- **Libre Solar BMS** - ThingSet Protocol (JSON)
- **Green-BMS** - CAN bus via serial

### 4.2 Architecture Base de Données

#### Modèle Multi-Tenant : Database-per-Tenant
- **Base `trackingbms_core`** : Configuration système, clients
- **Bases `client_{id}`** : Données isolées par client

#### Tables principales par client
```sql
-- Gestion hiérarchique
clients_config (settings personnalisés)
battery_types (Li-ion, LiFePO4, etc.)
locations (lieux d'installation)
batteries (batteries individuelles)
custom_fields (champs personnalisés)

-- Données BMS
bms_data (données temps réel)
bms_data_history (historique horodaté)
alerts (alertes et notifications)
maintenance_logs (journaux maintenance)
```

### 4.3 Communication Inter-Modules

#### API REST Standard
- **Format** : JSON exclusivement
- **Authentication** : JWT + API Keys
- **Documentation** : OpenAPI 3.1 automatique
- **Versioning** : URL (/api/v1/)

#### Endpoints types
```
GET /api/v1/modules/{module}/status
POST /api/v1/modules/{module}/data
PUT /api/v1/modules/{module}/config
DELETE /api/v1/modules/{module}/reset
```

### 4.4 Sécurité

#### Authentification Multi-Niveau
- **Super Admin** : Gestion système globale
- **Client Admin** : Gestion de son espace client
- **Utilisateur** : Consultation de ses batteries assignées
- **Lecture seule** : Dashboards partagés

#### Chiffrement et Protection
- **HTTPS obligatoire** avec certificat SSL
- **Données sensibles chiffrées** (AES-256)
- **Logs d'audit** pour toutes les actions
- **Rate limiting** par IP et utilisateur
- **Validation stricte** des inputs (OWASP)

## 5. Hébergement HostPapa

### 5.1 Contraintes identifiées
- **PHP** : Version 8.1+ supportée
- **MySQL** : Bases multiples autorisées
- **Ressources** : CPU et RAM limitées (optimisation requise)
- **Cron jobs** : Disponibles pour tâches automatiques

### 5.2 Optimisations requises
- **Cache agressif** (Redis + APCu)
- **Compression Gzip** des réponses
- **Minification** JS/CSS
- **Lazy loading** des données
- **Pagination** intelligente

## 6. Plan de Développement

### Phase 1 : Infrastructure (4 semaines)
1. **Semaine 1** : Setup environnement + base de données
2. **Semaine 2** : Module Core + authentification
3. **Semaine 3** : API Gateway + documentation
4. **Semaine 4** : Tests et sécurisation

### Phase 2 : Connectivité BMS (3 semaines)
1. **Semaine 5** : BMS Connector pour foxBMS
2. **Semaine 6** : Integration Libre Solar
3. **Semaine 7** : Data Processor + temps réel

### Phase 3 : Interface Utilisateur (3 semaines)
1. **Semaine 8** : Interface de base + hiérarchie
2. **Semaine 9** : Dashboard + graphiques
3. **Semaine 10** : Personnalisation + filtres

### Phase 4 : Déploiement (2 semaines)
1. **Semaine 11** : Migration HostPapa + tests
2. **Semaine 12** : Formation + documentation utilisateur

## 7. Critères de Réussite

### 7.1 Performances
- **Temps de chargement** < 2 secondes
- **Mise à jour temps réel** < 5 secondes
- **Disponibilité** > 99.5%
- **Concurrent users** : 100+ simultanés

### 7.2 Fonctionnalités
- **Multi-client** : Isolation parfaite des données
- **Temps réel** : WebSocket opérationnel
- **Personnalisation** : Champs custom fonctionnels
- **Mobile** : Interface responsive complète

### 7.3 Sécurité
- **Audit** : Aucune faille OWASP Top 10
- **Chiffrement** : Toutes données sensibles
- **Authentification** : Multi-niveaux opérationnels
- **Backup** : Automatique quotidien

## 8. Risques et Mitigation

### 8.1 Risques techniques
- **Limitation HostPapa** → Tests précoces + optimisation
- **Intégration BMS** → POC par API avant développement complet
- **Performance temps réel** → Architecture cache + WebSocket

### 8.2 Risques fonctionnels
- **Complexité UI** → Développement itératif avec feedback
- **Besoins évolutifs** → Architecture modulaire extensible

## 9. Livrables Attendus

### 9.1 Documentation
- [ ] Cahier des charges (ce document)
- [ ] Spécifications techniques détaillées
- [ ] Documentation API (OpenAPI)
- [ ] Manuel utilisateur
- [ ] Guide d'installation/déploiement

### 9.2 Code et Infrastructure
- [ ] Code source complet (GitHub)
- [ ] Base de données avec schémas
- [ ] Scripts de déploiement
- [ ] Tests automatisés
- [ ] Interface web responsive

### 9.3 Formation et Support
- [ ] Session de formation clients
- [ ] Documentation maintenance
- [ ] Support technique 6 mois

---

**Validation requis avant développement** : Approbation de ce cahier des charges par EDS Québec.