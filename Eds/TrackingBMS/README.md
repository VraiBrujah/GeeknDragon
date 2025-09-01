# TrackingBMS - Système de Suivi Batteries Multi-Client

**Version :** 1.0  
**Date :** 2025-09-01  
**Répertoire de Travail :** `C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\TrackingBMS`

## 📋 Aperçu du Projet

TrackingBMS est un système de suivi et visualisation en temps réel des données BMS (Battery Management System) pour EDS Québec. Le système offre une architecture modulaire sécurisée permettant à plusieurs clients de suivre leurs batteries de manière isolée via une interface web hiérarchique.

## 🎯 Objectifs

- **MVP** : Affichage temps réel des données BMS clients via interface web
- **Vision** : Système évolutif pour tous produits EDS Québec
- **Hébergement** : Compatible HostPapa avec sécurité maximale

## 🏗️ Architecture

### Architecture Modulaire Autonome

```
API Gateway ─┐
             ├─ Module Core (Orchestrateur)
             ├─ Module Auth & ACL
             ├─ Module BMS Connector
             ├─ Module Data Processor  
             ├─ Module Database Manager
             ├─ Module Web Interface
             ├─ Module Client Manager
             └─ Module Notification
```

### APIs BMS Supportées

- **foxBMS** - Plateforme BMS open source avancée
- **Libre Solar BMS** - Protocol ThingSet (JSON)
- **Green-BMS SmartBMS** - Certifié open source hardware

## 🔧 Technologies

### Backend
- **PHP 8.2+** avec Symfony/Laravel
- **MySQL 8.0+** (architecture Database-per-Tenant)
- **Redis** pour cache et sessions
- **WebSocket** pour temps réel

### Frontend  
- **HTML5/CSS3** responsive
- **JavaScript ES6+** (Vanilla/Vue.js)
- **Chart.js** pour visualisations
- **WebSocket** client

## 📁 Structure des Documents

```
docs/
├── cahier-des-charges.md           # Spécifications complètes du projet
├── architecture-modulaire.md       # Architecture technique détaillée
├── schema-base-donnees.md          # Schémas BDD multi-tenant
├── interface-web-hierarchique.md   # Interface utilisateur complète
├── plan-deploiement-hostpapa.md    # Guide déploiement HostPapa
└── README.md                       # Ce fichier
```

## 📚 Documentation Détaillée

### 1. [Cahier des Charges](docs/cahier-des-charges.md)
- Contexte et objectifs du projet
- Spécifications fonctionnelles complètes
- Critères de réussite et plan de développement
- Contraintes et risques identifiés

### 2. [Architecture Modulaire](docs/architecture-modulaire.md)
- Principe architectural avec modules autonomes
- Spécifications détaillées de chaque module
- Communication inter-modules via API REST
- Tests et qualité logicielle

### 3. [Schéma Base de Données](docs/schema-base-donnees.md)
- Architecture multi-tenant Database-per-Tenant
- Schémas complets core et client
- Scripts d'installation automatique
- Sécurité et optimisations performance

### 4. [Interface Web Hiérarchique](docs/interface-web-hierarchique.md)  
- Structure hiérarchique Client > Types > Lieux > Batteries
- Templates HTML complets et responsive
- Navigation dynamique avec filtrage avancé
- Support mobile et dark mode

### 5. [Plan Déploiement HostPapa](docs/plan-deploiement-hostpapa.md)
- Configuration optimisée pour hébergement partagé
- Scripts d'installation automatique
- Monitoring et maintenance système
- Procédures de sécurité et rollback

## 🔒 Sécurité

- **Isolation multi-tenant** : Bases de données séparées par client
- **Authentification JWT** multi-niveaux
- **Chiffrement AES-256** données sensibles  
- **HTTPS obligatoire** avec certificats SSL
- **Audit complet** toutes actions système

## ⚡ Performance

- **Temps réel** : Mise à jour < 5 secondes
- **Cache Redis** agressif pour performance
- **Compression Gzip** réponses HTTP
- **Optimisations HostPapa** spécifiques
- **Monitoring** ressources continu

## 🚀 APIs BMS Intégrées

### foxBMS
- API REST/WebSocket native
- Support complet protocoles CAN
- Documentation extensive
- Communauté active

### Libre Solar BMS  
- Protocol ThingSet (JSON human-readable)
- Compatible ESP32/Zephyr RTOS
- Intégration mobile apps
- Certification EnAccess Foundation

### Green-BMS SmartBMS
- Open Source Hardware certifié OSHWA
- Support Li-ion, LiFePO4, NCM
- Interface CAN bus
- Design modulaire

## 📊 Fonctionnalités Principales

### Multi-Client
- **Isolation complète** des données entre clients
- **Personnalisation** champs custom par client
- **Hiérarchisation** Types → Lieux → Batteries
- **Permissions granulaires** par utilisateur

### Collecte Données BMS
- **Temps réel** : Tension, courant, température, SOC, SOH
- **Historiques** : Agrégation horaire/quotidienne/mensuelle
- **Alertes** : Configuration seuils personnalisés
- **Export** : CSV, PDF, Excel

### Interface Utilisateur
- **Dashboard** métriques clés temps réel
- **Navigation** hiérarchique intuitive
- **Filtres** avancés multi-critères
- **Responsive** desktop/tablet/mobile
- **Graphiques** interactifs (Chart.js)

## 🛠️ Installation et Déploiement

### Prérequis HostPapa
- **PHP 8.1+** (8.2 recommandé)
- **MySQL 8.0+** avec bases multiples
- **SSL** Let's Encrypt
- **Cron Jobs** via cPanel

### Déploiement Rapide

```bash
# 1. Cloner le repository
git clone https://github.com/edsquebec/trackingbms.git

# 2. Exécuter script déploiement HostPapa
cd trackingbms
chmod +x scripts/deploy-hostpapa.sh
./scripts/deploy-hostpapa.sh

# 3. Configuration environnement
cp app/.env.example app/.env
nano app/.env  # Configurer DB_USER, DB_PASS, etc.

# 4. Installation base de données
php database/scripts/install.php

# 5. Test connectivité
curl https://votre-domaine.com/api/v1/health
```

## 📈 Monitoring et Maintenance

### Surveillance Continue
- **Health checks** automatiques toutes les 5 minutes
- **Backup** quotidien automatique 02h00
- **Nettoyage** logs hebdomadaire
- **Optimisation** base de données mensuelle

### Alertes Système
- **Email** dépassement seuils ressources
- **Log** toutes actions critiques
- **Dashboard** statut temps réel
- **Rollback** procédure d'urgence

## 💰 Coûts Estimés

### Hébergement HostPapa
- **Plan Business Pro** : 15$ CAD/mois
- **Domaine** : 15$ CAD/année  
- **SSL** : Gratuit (Let's Encrypt)
- **TOTAL** : ~195$ CAD/année

### Développement (12 semaines)
- **Phase 1** : Infrastructure (4 semaines)
- **Phase 2** : Connectivité BMS (3 semaines)  
- **Phase 3** : Interface utilisateur (3 semaines)
- **Phase 4** : Déploiement (2 semaines)

## 🤝 Support et Contact

### EDS Québec
- **Projet** : TrackingBMS
- **Client** : Systèmes de batteries
- **Support** : support@edsquebec.com

### Équipe Développement
- **Architecture** : Système modulaire autonome
- **Backend** : PHP 8.2+ / MySQL 8.0+
- **Frontend** : HTML5/JS/CSS3 responsive
- **Hébergement** : HostPapa optimisé

## 📋 Statut du Projet

✅ **Complété :**
- [x] Recherche APIs BMS libres de droit
- [x] Cahier des charges complet
- [x] Architecture modulaire détaillée  
- [x] Schéma base de données multi-tenant
- [x] Interface web hiérarchique planifiée
- [x] Plan déploiement HostPapa finalisé

🔜 **Prochaines Étapes :**
- [ ] Validation cahier des charges client
- [ ] Développement modules core
- [ ] Tests intégration APIs BMS
- [ ] Implémentation interface utilisateur
- [ ] Déploiement et mise en production

---

**Prêt pour validation et début d'implémentation !**

Le système TrackingBMS est entièrement spécifié avec documentation complète, architecture modulaire sécurisée, et plan de déploiement optimisé pour HostPapa. Tous les requis sont définis pour commencer le développement dès approbation du cahier des charges.