# Architecture Modulaire Autonome - TrackingBMS

**Version :** 1.0  
**Date :** 2025-09-01  
**Répertoire de Travail :** `C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\TrackingBMS`

## 1. Principe Architectural

### 1.1 Vision Globale
Architecture basée sur des modules autonomes communicant via API REST standardisée. Chaque module peut fonctionner indépendamment et être développé/déployé séparément.

### 1.2 Règles Fondamentales
- **Autonomie** : Chaque module a sa propre logique métier
- **Communication** : API REST uniquement entre modules  
- **Isolation** : Aucun accès direct aux données d'autres modules
- **Extensibilité** : Ajout de modules sans modification de l'existant
- **Résilience** : Panne d'un module n'affecte pas les autres

## 2. Cartographie des Modules

```
┌─────────────────────────────────────────────────────────────┐
│                        API Gateway                          │
│                    (Point d'entrée unique)                  │
└─────────────┬─────────────────────────────────────────┬─────┘
              │                                         │
              ▼                                         ▼
┌─────────────────────────┐                 ┌─────────────────────────┐
│     Module Core         │◄────────────────┤   Module Auth & ACL     │
│   (Orchestrateur)       │                 │   (Authentification)    │
│                         │                 │                         │
│ - Service Discovery     │                 │ - JWT Management        │
│ - Health Check          │                 │ - Multi-Tenant Auth     │
│ - Logging Central       │                 │ - Permissions           │
│ - Configuration         │                 │ - Rate Limiting         │
└─────────────┬───────────┘                 └─────────────────────────┘
              │
              ▼
┌─────────────────────────┐    ┌─────────────────────────┐    ┌─────────────────────────┐
│   Module BMS Connector  │    │  Module Data Processor  │    │  Module Database Mgr    │
│                         │    │                         │    │                         │
│ - DalyBMS Integration   │────┤ - Data Transformation   │────┤ - Multi-Tenant DB       │
│ - UART Communication   │    │ - Real-time Processing  │    │ - CRUD Operations       │
│ - CAN/RS485 Protocol   │    │ - Alert Generation      │    │ - Data Isolation        │
│ - Multi-Channel Support│    │ - Statistics Computing  │    │ - Backup Management     │
└─────────────────────────┘    └─────────────────────────┘    └─────────────────────────┘
              │                              │                              │
              ▼                              ▼                              ▼
┌─────────────────────────┐    ┌─────────────────────────┐    ┌─────────────────────────┐
│  Module Web Interface   │    │  Module Client Manager  │    │  Module Notification    │
│                         │    │                         │    │                         │
│ - Dashboard UI          │    │ - Client Management     │    │ - Email Alerts          │
│ - Charts & Graphs       │    │ - User Permissions      │    │ - SMS Notifications     │
│ - Responsive Design     │    │ - Custom Fields         │    │ - Webhook Integration   │
│ - Real-time Updates     │    │ - Hierarchical Display  │    │ - Alert Rules Engine    │
└─────────────────────────┘    └─────────────────────────┘    └─────────────────────────┘
```

## 3. Spécifications Détaillées des Modules

### 3.1 Module Core (Orchestrateur)

#### Responsabilités
- **Service Discovery** : Enregistrement et découverte des modules
- **Health Monitoring** : Surveillance de l'état des modules
- **Configuration centralisée** : Distribution des paramètres
- **Logging centralisé** : Agrégation des logs de tous les modules

#### Structure
```
/modules/core/
├── src/
│   ├── ServiceRegistry.php      (Registre des services)
│   ├── HealthChecker.php        (Surveillance santé)
│   ├── ConfigManager.php        (Gestion configuration)
│   ├── LogAggregator.php        (Agrégation logs)
│   └── ModuleLoader.php         (Chargement dynamique)
├── api/
│   ├── health/                  (GET /api/v1/core/health)
│   ├── services/                (GET /api/v1/core/services)
│   └── config/                  (GET/PUT /api/v1/core/config)
├── config/
│   ├── modules.yaml             (Configuration modules)
│   └── core.yaml                (Configuration core)
└── tests/
    ├── unit/
    └── integration/
```

#### API Endpoints
```php
GET  /api/v1/core/health           // État général du système
GET  /api/v1/core/services         // Liste des services actifs
POST /api/v1/core/services/reload  // Recharger les services
GET  /api/v1/core/config/{module}  // Configuration d'un module
PUT  /api/v1/core/config/{module}  // Mettre à jour la config
GET  /api/v1/core/logs             // Logs centralisés (paginés)
```

### 3.2 Module API Gateway

#### Responsabilités
- **Point d'entrée unique** pour toutes les requêtes externes
- **Routage intelligent** vers les modules appropriés
- **Load balancing** entre instances de modules
- **Documentation OpenAPI** automatique

#### Structure
```
/modules/gateway/
├── src/
│   ├── Router.php               (Routage des requêtes)
│   ├── LoadBalancer.php         (Répartition de charge)
│   ├── RateLimiter.php          (Limitation débit)
│   ├── RequestValidator.php     (Validation requêtes)
│   └── OpenAPIGenerator.php     (Génération documentation)
├── middleware/
│   ├── AuthMiddleware.php       (Middleware auth)
│   ├── CorsMiddleware.php       (Gestion CORS)
│   └── LoggingMiddleware.php    (Logging requêtes)
├── routes/
│   ├── api.yaml                 (Définition routes)
│   └── openapi.yaml             (Spec OpenAPI)
└── public/
    ├── docs/                    (Documentation auto-générée)
    └── swagger-ui/              (Interface Swagger)
```

### 3.3 Module Auth & ACL

#### Responsabilités
- **Authentification multi-tenant** avec isolation
- **Gestion des tokens JWT** 
- **Contrôle d'accès granulaire** (ACL)
- **Gestion des sessions** et rate limiting

#### Structure
```
/modules/auth/
├── src/
│   ├── AuthManager.php          (Gestion authentification)
│   ├── JWTHandler.php           (Tokens JWT)
│   ├── ACLManager.php           (Contrôle d'accès)
│   ├── SessionManager.php       (Gestion sessions)
│   └── TenantIsolator.php       (Isolation multi-tenant)
├── providers/
│   ├── DatabaseProvider.php    (Auth base de données)
│   ├── LDAPProvider.php         (Auth LDAP - futur)
│   └── SSOProvider.php          (Single Sign-On - futur)
├── policies/
│   ├── BatteryPolicy.php        (Droits sur batteries)
│   ├── ClientPolicy.php         (Droits clients)
│   └── SystemPolicy.php         (Droits système)
└── migrations/
    ├── 001_create_users.sql
    ├── 002_create_permissions.sql
    └── 003_create_sessions.sql
```

#### API Endpoints
```php
POST /api/v1/auth/login           // Connexion utilisateur
POST /api/v1/auth/refresh         // Renouveler token
POST /api/v1/auth/logout          // Déconnexion
GET  /api/v1/auth/profile         // Profil utilisateur
PUT  /api/v1/auth/profile         // Modifier profil
GET  /api/v1/auth/permissions     // Permissions utilisateur
POST /api/v1/auth/validate-token  // Valider token (inter-module)
```

### 3.4 Module BMS Connector

#### Responsabilités
- **Interface unifiée** pour tous types de BMS
- **Collecte temps réel** des données
- **Normalisation des protocoles** différents
- **Gestion des reconnexions** automatiques

#### Structure
```
/modules/bms-connector/
├── src/
│   ├── BMSManager.php           (Gestionnaire principal)
│   ├── DataCollector.php        (Collecteur données)
│   ├── ProtocolNormalizer.php   (Normalisation protocoles)
│   └── ConnectionManager.php    (Gestion connexions)
├── drivers/
│   ├── DalyBMSDriver.php        (Driver DalyBMS - principal)
│   ├── FoxBMSDriver.php         (Driver foxBMS - legacy)
│   ├── LibreSolarDriver.php     (Driver Libre Solar - legacy)
│   ├── GreenBMSDriver.php       (Driver Green-BMS - legacy)
│   └── AbstractBMSDriver.php    (Interface commune)
├── protocols/
│   ├── DalyUARTProtocol.php     (Protocol UART DalyBMS)
│   ├── DalyCANProtocol.php      (Protocol CAN DalyBMS)
│   ├── DalyModbusProtocol.php   (Protocol Modbus RS485)
│   ├── ThingSetProtocol.php     (Protocol ThingSet/JSON - legacy)
│   ├── ModbusProtocol.php       (Protocol Modbus - legacy)
│   └── CANBusProtocol.php       (Protocol CAN Bus - legacy)
├── config/
│   ├── bms-types.yaml           (Types BMS supportés)
│   └── connection-profiles.yaml (Profils connexion)
└── tests/
    ├── unit/
    ├── integration/
    └── mocks/                   (Mocks pour tests)
```

#### API Endpoints
```php
GET  /api/v1/bms/types            // Types BMS supportés (DalyBMS prioritaire)
POST /api/v1/bms/connect          // Connecter un BMS DalyBMS
GET  /api/v1/bms/status/{id}      // Statut connexion BMS
GET  /api/v1/bms/data/{id}        // Données temps réel BMS
GET  /api/v1/bms/data/{id}/history // Historique données
GET  /api/v1/bms/cells/{id}       // Tensions cellules individuelles
GET  /api/v1/bms/temperatures/{id} // Températures sondes
GET  /api/v1/bms/alarms/{id}      // États alarmes et protections
POST /api/v1/bms/configure/{id}   // Configuration BMS
POST /api/v1/bms/transmitter/pair // Pairing émetteur Bluetooth
GET  /api/v1/bms/transmitters     // Liste émetteurs découverts
DELETE /api/v1/bms/disconnect/{id} // Déconnecter BMS
```

### 3.5 Module Data Processor

#### Responsabilités
- **Traitement des données** brutes BMS
- **Calculs statistiques** et métriques
- **Génération d'alertes** automatiques
- **Historisation intelligente** des données

#### Structure
```
/modules/data-processor/
├── src/
│   ├── DataProcessor.php        (Processeur principal)
│   ├── StatisticsCalculator.php (Calculs statistiques)
│   ├── AlertGenerator.php       (Génération alertes)
│   ├── DataValidator.php        (Validation données)
│   └── HistoryManager.php       (Gestion historique)
├── processors/
│   ├── BatteryHealthProcessor.php    (Santé batterie)
│   ├── PerformanceProcessor.php      (Performance)
│   ├── TemperatureProcessor.php      (Température)
│   └── ChargeCycleProcessor.php      (Cycles charge)
├── alerts/
│   ├── rules/                   (Règles d'alertes)
│   │   ├── temperature.yaml
│   │   ├── voltage.yaml
│   │   └── health.yaml
│   └── templates/               (Templates notifications)
├── aggregators/
│   ├── HourlyAggregator.php     (Agrégation horaire)
│   ├── DailyAggregator.php      (Agrégation quotidienne)
│   └── MonthlyAggregator.php    (Agrégation mensuelle)
└── config/
    ├── processing-rules.yaml    (Règles traitement)
    └── alert-thresholds.yaml    (Seuils alertes)
```

### 3.6 Module Database Manager

#### Responsabilités
- **Isolation multi-tenant** stricte
- **Opérations CRUD** sécurisées
- **Migrations automatiques** de schéma
- **Backup/Restore** automatisé

#### Structure
```
/modules/database/
├── src/
│   ├── DatabaseManager.php      (Gestionnaire principal)
│   ├── TenantManager.php        (Gestion tenants)
│   ├── MigrationRunner.php      (Exécution migrations)
│   ├── BackupManager.php        (Gestion sauvegardes)
│   └── QueryBuilder.php         (Construction requêtes)
├── repositories/
│   ├── BatteryRepository.php    (Repository batteries)
│   ├── ClientRepository.php     (Repository clients)
│   ├── UserRepository.php       (Repository utilisateurs)
│   └── AbstractRepository.php   (Base repository)
├── migrations/
│   ├── core/                    (Migrations système)
│   └── tenant-template/         (Template tenant)
├── schemas/
│   ├── core.sql                 (Schéma core)
│   └── tenant.sql               (Schéma tenant)
└── backup/
    ├── scripts/                 (Scripts backup)
    └── restore/                 (Scripts restore)
```

### 3.7 Module Web Interface

#### Responsabilités
- **Interface utilisateur** responsive
- **Dashboards temps réel** avec WebSocket
- **Graphiques interactifs** des données
- **Personnalisation** par utilisateur

#### Structure
```
/modules/web-interface/
├── public/
│   ├── index.html               (Point d'entrée)
│   ├── assets/
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   └── components/              (Composants réutilisables)
├── src/
│   ├── js/
│   │   ├── app.js               (Application principale)
│   │   ├── api-client.js        (Client API)
│   │   ├── websocket-client.js  (Client WebSocket)
│   │   └── chart-manager.js     (Gestion graphiques)
│   ├── css/
│   │   ├── main.css            (Styles principaux)
│   │   ├── dashboard.css       (Styles dashboard)
│   │   └── responsive.css      (Styles responsive)
│   └── templates/
│       ├── dashboard.html      (Template dashboard)
│       ├── battery-detail.html (Détail batterie)
│       └── alerts.html         (Alertes)
└── config/
    ├── ui-config.yaml          (Configuration interface)
    └── chart-config.yaml       (Configuration graphiques)
```

## 4. Communication Inter-Modules

### 4.1 Protocole Standard API REST

#### Format de Requête
```json
{
  "module": "source-module",
  "version": "1.0",
  "timestamp": "2025-09-01T10:30:00Z",
  "request_id": "uuid-v4",
  "data": {
    // Payload spécifique
  }
}
```

#### Format de Réponse
```json
{
  "status": "success|error",
  "code": 200,
  "message": "Operation successful",
  "timestamp": "2025-09-01T10:30:01Z",
  "request_id": "uuid-v4",
  "data": {
    // Données de réponse
  },
  "meta": {
    "pagination": {...},
    "performance": {...}
  }
}
```

### 4.2 Contrats d'Interface

#### Interface Module Abstrait
```php
interface ModuleInterface
{
    public function initialize(array $config): bool;
    public function getHealth(): HealthStatus;
    public function getInfo(): ModuleInfo;
    public function processRequest(Request $request): Response;
    public function shutdown(): bool;
}
```

#### Interface Communication
```php
interface CommunicationInterface
{
    public function sendRequest(string $module, Request $request): Response;
    public function broadcast(Event $event): void;
    public function subscribe(string $event, callable $callback): void;
}
```

### 4.3 Événements Système

#### Types d'Événements
- **system.module.started** : Démarrage module
- **system.module.stopped** : Arrêt module
- **system.module.health_changed** : Changement santé module
- **data.bms.new** : Nouvelles données BMS
- **data.alert.generated** : Alerte générée
- **auth.user.login** : Connexion utilisateur
- **auth.user.logout** : Déconnexion utilisateur

## 5. Configuration et Déploiement

### 5.1 Structure de Configuration
```yaml
# config/system.yaml
system:
  name: "TrackingBMS"
  version: "1.0.0"
  environment: "production"
  
modules:
  core:
    enabled: true
    instances: 1
    config: "config/core.yaml"
  
  gateway:
    enabled: true
    instances: 1
    port: 8080
    config: "config/gateway.yaml"
  
  auth:
    enabled: true
    instances: 1
    config: "config/auth.yaml"
    
database:
  host: "localhost"
  port: 3306
  username: "${DB_USER}"
  password: "${DB_PASS}"
  
cache:
  driver: "redis"
  host: "localhost"
  port: 6379
```

### 5.2 Déploiement HostPapa

#### Structure de Déploiement
```
/public_html/trackingbms/
├── public/                      (Dossier web accessible)
│   ├── index.php               (Point d'entrée API)
│   ├── assets/                 (CSS, JS, images)
│   └── docs/                   (Documentation API)
├── modules/                    (Modules applicatifs)
├── config/                     (Configuration)
├── vendor/                     (Dépendances Composer)
├── storage/
│   ├── logs/                   (Logs système)
│   ├── cache/                  (Cache fichiers)
│   └── uploads/                (Fichiers uploadés)
└── database/
    ├── migrations/             (Scripts migration)
    └── backups/                (Sauvegardes)
```

## 6. Tests et Qualité

### 6.1 Stratégie de Tests par Module

#### Tests Unitaires (70%)
- Tests isolés de chaque classe/fonction
- Mocks pour dépendances externes
- Couverture > 90%

#### Tests d'Intégration (20%)
- Tests communication inter-modules
- Tests base de données
- Tests APIs réelles

#### Tests End-to-End (10%)
- Tests scénarios utilisateur complets
- Tests performance
- Tests sécurité

### 6.2 Outils de Qualité
- **PHPUnit** : Tests automatisés
- **PHPStan** : Analyse statique
- **PHP-CS-Fixer** : Standards de code
- **PHPMD** : Détection problèmes design

## 7. Monitoring et Observabilité

### 7.1 Métriques Système
- **Performance** : Temps réponse, CPU, mémoire
- **Santé modules** : Status, erreurs, indisponibilité
- **Business** : Nombre BMS connectés, utilisateurs actifs
- **Sécurité** : Tentatives intrusion, authentifications

### 7.2 Logging Centralisé
- **Format JSON** structuré
- **Niveaux** : DEBUG, INFO, WARNING, ERROR, CRITICAL
- **Rotation** automatique des logs
- **Alertes** sur erreurs critiques

---

Cette architecture modulaire garantit l'évolutivité, la maintenabilité et la résilience du système TrackingBMS tout en respectant les contraintes d'hébergement HostPapa.