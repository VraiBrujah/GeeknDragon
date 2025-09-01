# Schéma Base de Données Multi-Tenant Sécurisée - TrackingBMS

**Version :** 1.0  
**Date :** 2025-09-01  
**Répertoire de Travail :** `C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\TrackingBMS`

## 1. Stratégie Multi-Tenant

### 1.1 Approche Choisie : Database-per-Tenant

**Avantages :**
- **Isolation maximale** des données entre clients
- **Sécurité renforcée** (impossible d'accéder aux données d'autres clients)
- **Personnalisation** : Schémas adaptables par client
- **Performance** : Pas de pollution des index avec tenant_id
- **Backup sélectif** : Sauvegarde par client

**Inconvénients gérés :**
- **Complexité** : Gérée par le module Database Manager
- **Ressources** : Optimisation avec pool de connexions

### 1.2 Structure Générale

```
trackingbms_core          (Base système)
├── clients               (Liste des clients/tenants)
├── modules               (Modules système disponibles)
├── system_config         (Configuration globale)
└── audit_logs            (Logs système global)

client_1_batteries        (Client EDS Québec - batteries)
├── battery_types         (Types de batteries)
├── locations            (Lieux d'installation)
├── batteries            (Batteries individuelles)
├── bms_data             (Données temps réel)
├── bms_data_history     (Historique des données)
├── custom_fields        (Champs personnalisés)
├── alerts               (Alertes)
├── users                (Utilisateurs du client)
└── audit_logs           (Logs spécifiques client)

client_2_solaire         (Client futur - panneaux solaires)
├── panel_types          (Types de panneaux)
├── installations        (Sites d'installation)
├── panels               (Panneaux individuels)
├── production_data      (Données de production)
├── ...
```

## 2. Base de Données Core (trackingbms_core)

### 2.1 Table clients
```sql
CREATE TABLE clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid CHAR(36) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    database_name VARCHAR(64) NOT NULL UNIQUE,
    industry_type ENUM('batteries', 'solar', 'industrial', 'residential') NOT NULL,
    status ENUM('active', 'suspended', 'trial', 'archived') DEFAULT 'trial',
    
    -- Configuration
    max_users INT DEFAULT 10,
    max_devices INT DEFAULT 100,
    max_storage_gb DECIMAL(10,2) DEFAULT 10.00,
    
    -- Personnalisation UI
    brand_color VARCHAR(7) DEFAULT '#1976d2',
    logo_url VARCHAR(255),
    custom_css TEXT,
    
    -- Facturation
    subscription_plan ENUM('free', 'basic', 'pro', 'enterprise') DEFAULT 'free',
    billing_cycle ENUM('monthly', 'yearly') DEFAULT 'monthly',
    next_billing_date DATE,
    
    -- Sécurité
    encryption_key VARCHAR(255) NOT NULL,
    api_rate_limit INT DEFAULT 1000, -- requêtes par heure
    allowed_ip_ranges JSON, -- Restriction IP
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_activity TIMESTAMP NULL,
    
    -- Indexes
    INDEX idx_status (status),
    INDEX idx_industry (industry_type),
    INDEX idx_activity (last_activity)
);
```

### 2.2 Table modules
```sql
CREATE TABLE modules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    version VARCHAR(20) NOT NULL,
    description TEXT,
    
    -- Configuration module
    config_schema JSON, -- Schéma de configuration
    default_config JSON, -- Configuration par défaut
    
    -- Compatibilité
    min_php_version VARCHAR(10) DEFAULT '8.1',
    required_extensions JSON, -- ['pdo', 'curl', 'json']
    dependencies JSON, -- Autres modules requis
    
    -- États
    is_core BOOLEAN DEFAULT FALSE,
    is_enabled BOOLEAN DEFAULT TRUE,
    requires_license BOOLEAN DEFAULT FALSE,
    
    -- Métadonnées
    author VARCHAR(255),
    license VARCHAR(50) DEFAULT 'proprietary',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2.3 Table client_modules (Association clients-modules)
```sql
CREATE TABLE client_modules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    module_id INT NOT NULL,
    
    -- Configuration spécifique client
    config JSON,
    custom_settings JSON,
    
    -- État
    is_enabled BOOLEAN DEFAULT TRUE,
    installation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Contraintes
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_client_module (client_id, module_id)
);
```

### 2.4 Table system_config
```sql
CREATE TABLE system_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(255) NOT NULL UNIQUE,
    config_value JSON NOT NULL,
    description TEXT,
    is_sensitive BOOLEAN DEFAULT FALSE, -- Données sensibles (chiffrées)
    
    -- Versioning
    version INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_key (config_key)
);
```

### 2.5 Table audit_logs (Système global)
```sql
CREATE TABLE audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NULL, -- NULL pour événements système
    user_id INT NULL,
    
    -- Événement
    event_type ENUM('auth', 'data', 'config', 'system', 'security') NOT NULL,
    action VARCHAR(100) NOT NULL, -- login, create, update, delete, etc.
    resource_type VARCHAR(100), -- client, user, battery, etc.
    resource_id VARCHAR(255),
    
    -- Contexte
    ip_address INET6_ATON NOT NULL,
    user_agent TEXT,
    request_data JSON, -- Données de la requête
    response_data JSON, -- Réponse
    
    -- Résultat
    status ENUM('success', 'failure', 'error') NOT NULL,
    error_message TEXT,
    
    -- Métadonnées
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processing_time DECIMAL(8,3), -- Temps de traitement en ms
    
    -- Index pour performance
    INDEX idx_client_timestamp (client_id, timestamp),
    INDEX idx_event_timestamp (event_type, timestamp),
    INDEX idx_resource (resource_type, resource_id),
    INDEX idx_status_timestamp (status, timestamp)
);
```

## 3. Schéma Type Client : Batteries (client_X_batteries)

### 3.1 Table battery_types
```sql
CREATE TABLE battery_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    
    -- Spécifications techniques
    chemistry ENUM('li-ion', 'lifepo4', 'ncm', 'lco', 'lfp', 'other') NOT NULL,
    nominal_voltage DECIMAL(5,2) NOT NULL, -- Volts
    capacity_ah DECIMAL(8,2) NOT NULL, -- Ampères-heures
    capacity_wh DECIMAL(10,2) NOT NULL, -- Watt-heures
    max_charge_current DECIMAL(8,2), -- Ampères
    max_discharge_current DECIMAL(8,2), -- Ampères
    
    -- Températures
    operating_temp_min INT DEFAULT -20, -- Celsius
    operating_temp_max INT DEFAULT 60,  -- Celsius
    storage_temp_min INT DEFAULT -40,   -- Celsius
    storage_temp_max INT DEFAULT 85,    -- Celsius
    
    -- Cycle de vie
    cycle_life INT DEFAULT 2000,
    depth_of_discharge DECIMAL(3,2) DEFAULT 0.80, -- 80%
    
    -- Dimensions physiques
    length_mm DECIMAL(8,2),
    width_mm DECIMAL(8,2),
    height_mm DECIMAL(8,2),
    weight_kg DECIMAL(8,3),
    
    -- Configuration BMS
    cell_count INT NOT NULL,
    parallel_strings INT DEFAULT 1,
    bms_type VARCHAR(100), -- foxBMS, Libre Solar, etc.
    communication_protocol ENUM('thingset', 'modbus', 'canbus', 'serial') DEFAULT 'thingset',
    
    -- Métadonnées
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    datasheet_url VARCHAR(500),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_chemistry (chemistry),
    INDEX idx_active (is_active),
    INDEX idx_manufacturer (manufacturer)
);
```

### 3.2 Table locations
```sql
CREATE TABLE locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    
    -- Hiérarchie
    parent_id INT NULL,
    level INT DEFAULT 1, -- 1=Site, 2=Bâtiment, 3=Zone, etc.
    path VARCHAR(500), -- Ex: /site1/batiment2/zone3
    
    -- Informations géographiques
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(2) DEFAULT 'CA',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Conditions environnementales
    environment_type ENUM('indoor', 'outdoor', 'semi-outdoor') DEFAULT 'indoor',
    climate_controlled BOOLEAN DEFAULT FALSE,
    humidity_controlled BOOLEAN DEFAULT FALSE,
    
    -- Sécurité et accès
    access_level ENUM('public', 'restricted', 'secure', 'high-security') DEFAULT 'restricted',
    requires_authorization BOOLEAN DEFAULT TRUE,
    
    -- Contact responsable
    responsible_name VARCHAR(255),
    responsible_phone VARCHAR(50),
    responsible_email VARCHAR(255),
    
    -- Métadonnées
    description TEXT,
    installation_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Contraintes et index
    FOREIGN KEY (parent_id) REFERENCES locations(id) ON DELETE SET NULL,
    INDEX idx_parent (parent_id),
    INDEX idx_level (level),
    INDEX idx_active (is_active),
    INDEX idx_path (path),
    INDEX idx_coordinates (latitude, longitude)
);
```

### 3.3 Table batteries (Batteries individuelles)
```sql
CREATE TABLE batteries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid CHAR(36) UNIQUE NOT NULL,
    
    -- Identification
    serial_number VARCHAR(255) NOT NULL UNIQUE,
    internal_id VARCHAR(100), -- ID interne client
    name VARCHAR(255) NOT NULL,
    
    -- Relations
    battery_type_id INT NOT NULL,
    location_id INT NOT NULL,
    
    -- Configuration BMS
    bms_id VARCHAR(255), -- ID dans le système BMS
    bms_ip_address INET6_ATON,
    bms_port INT DEFAULT 80,
    bms_protocol ENUM('thingset', 'modbus', 'canbus', 'serial') DEFAULT 'thingset',
    bms_config JSON, -- Configuration spécifique BMS
    
    -- État opérationnel
    status ENUM('commissioning', 'operational', 'maintenance', 'fault', 'decommissioned') DEFAULT 'commissioning',
    health_score DECIMAL(5,2) DEFAULT 100.00, -- 0-100%
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    
    -- Données contractuelles
    warranty_start_date DATE,
    warranty_end_date DATE,
    purchase_date DATE,
    installation_date DATE,
    commissioning_date DATE,
    
    -- Valeurs limites personnalisées (override du type)
    custom_voltage_min DECIMAL(5,2),
    custom_voltage_max DECIMAL(5,2),
    custom_temp_min INT,
    custom_temp_max INT,
    custom_current_charge_max DECIMAL(8,2),
    custom_current_discharge_max DECIMAL(8,2),
    
    -- Alertes
    alerts_enabled BOOLEAN DEFAULT TRUE,
    critical_alerts_only BOOLEAN DEFAULT FALSE,
    alert_contacts JSON, -- Emails/SMS pour cette batterie
    
    -- Métadonnées
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_data_received TIMESTAMP NULL,
    
    -- Contraintes et index
    FOREIGN KEY (battery_type_id) REFERENCES battery_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT,
    
    INDEX idx_serial (serial_number),
    INDEX idx_bms_id (bms_id),
    INDEX idx_status (status),
    INDEX idx_active (is_active),
    INDEX idx_location (location_id),
    INDEX idx_type (battery_type_id),
    INDEX idx_last_data (last_data_received)
);
```

### 3.4 Table custom_fields (Champs personnalisés)
```sql
CREATE TABLE custom_fields (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Configuration du champ
    field_name VARCHAR(100) NOT NULL,
    field_label VARCHAR(255) NOT NULL,
    field_type ENUM('text', 'number', 'date', 'boolean', 'select', 'multiselect', 'textarea') NOT NULL,
    
    -- Validation
    is_required BOOLEAN DEFAULT FALSE,
    validation_rules JSON, -- Règles de validation
    default_value TEXT,
    options JSON, -- Options pour select/multiselect
    
    -- Affichage
    display_order INT DEFAULT 0,
    is_visible_in_list BOOLEAN DEFAULT TRUE,
    is_visible_in_detail BOOLEAN DEFAULT TRUE,
    is_searchable BOOLEAN DEFAULT TRUE,
    
    -- Portée
    applies_to ENUM('battery', 'location', 'battery_type') NOT NULL,
    
    -- Métadonnées
    description TEXT,
    help_text TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_applies_to (applies_to),
    INDEX idx_active (is_active),
    UNIQUE KEY unique_field_name (field_name, applies_to)
);
```

### 3.5 Table custom_field_values (Valeurs des champs personnalisés)
```sql
CREATE TABLE custom_field_values (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    custom_field_id INT NOT NULL,
    
    -- Référence polymorphe
    entity_type ENUM('battery', 'location', 'battery_type') NOT NULL,
    entity_id INT NOT NULL,
    
    -- Valeur
    field_value TEXT,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Contraintes
    FOREIGN KEY (custom_field_id) REFERENCES custom_fields(id) ON DELETE CASCADE,
    UNIQUE KEY unique_field_entity (custom_field_id, entity_type, entity_id),
    
    INDEX idx_entity (entity_type, entity_id)
);
```

### 3.6 Table bms_data (Données temps réel)
```sql
CREATE TABLE bms_data (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    battery_id INT NOT NULL,
    
    -- Horodatage
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    bms_timestamp TIMESTAMP NULL, -- Timestamp du BMS si différent
    
    -- Tensions (Volts)
    pack_voltage DECIMAL(8,3),
    cell_voltages JSON, -- Array des tensions cellules
    cell_voltage_min DECIMAL(6,3),
    cell_voltage_max DECIMAL(6,3),
    cell_voltage_avg DECIMAL(6,3),
    cell_voltage_diff DECIMAL(6,3), -- Différence min/max
    
    -- Courants (Ampères)
    pack_current DECIMAL(9,3),
    charge_current DECIMAL(9,3),
    discharge_current DECIMAL(9,3),
    
    -- Puissances (Watts)
    pack_power DECIMAL(10,2),
    charge_power DECIMAL(10,2),
    discharge_power DECIMAL(10,2),
    
    -- Températures (Celsius)
    temperatures JSON, -- Array des températures
    temp_min DECIMAL(5,2),
    temp_max DECIMAL(5,2),
    temp_avg DECIMAL(5,2),
    ambient_temp DECIMAL(5,2),
    
    -- États de charge
    soc_percent DECIMAL(5,2), -- State of Charge (0-100%)
    soh_percent DECIMAL(5,2), -- State of Health (0-100%)
    remaining_capacity_ah DECIMAL(8,2),
    full_capacity_ah DECIMAL(8,2),
    
    -- Cycles et statistiques
    charge_cycles INT,
    total_charge_ah DECIMAL(12,2),
    total_discharge_ah DECIMAL(12,2),
    total_energy_charged_wh DECIMAL(15,2),
    total_energy_discharged_wh DECIMAL(15,2),
    
    -- États et modes
    operation_mode ENUM('idle', 'charging', 'discharging', 'balancing', 'fault') NOT NULL,
    balancing_active BOOLEAN DEFAULT FALSE,
    charging_enabled BOOLEAN DEFAULT TRUE,
    discharging_enabled BOOLEAN DEFAULT TRUE,
    
    -- Alertes et erreurs
    fault_codes JSON, -- Codes d'erreur BMS
    warning_codes JSON, -- Codes d'avertissement
    protection_status JSON, -- États des protections
    
    -- Métadonnées qualité
    data_quality ENUM('excellent', 'good', 'fair', 'poor', 'invalid') DEFAULT 'good',
    signal_strength DECIMAL(3,0), -- 0-100% si applicable
    communication_errors INT DEFAULT 0,
    
    -- Contraintes et index
    FOREIGN KEY (battery_id) REFERENCES batteries(id) ON DELETE CASCADE,
    
    INDEX idx_battery_timestamp (battery_id, timestamp),
    INDEX idx_timestamp (timestamp),
    INDEX idx_operation_mode (operation_mode),
    INDEX idx_data_quality (data_quality)
);
```

### 3.7 Table bms_data_history (Données historiques agrégées)
```sql
CREATE TABLE bms_data_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    battery_id INT NOT NULL,
    
    -- Période d'agrégation
    period_type ENUM('hourly', 'daily', 'weekly', 'monthly') NOT NULL,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    
    -- Statistiques tensions
    pack_voltage_avg DECIMAL(8,3),
    pack_voltage_min DECIMAL(8,3),
    pack_voltage_max DECIMAL(8,3),
    cell_voltage_avg DECIMAL(6,3),
    cell_voltage_min DECIMAL(6,3),
    cell_voltage_max DECIMAL(6,3),
    
    -- Statistiques courants
    pack_current_avg DECIMAL(9,3),
    pack_current_min DECIMAL(9,3),
    pack_current_max DECIMAL(9,3),
    
    -- Statistiques températures
    temp_avg DECIMAL(5,2),
    temp_min DECIMAL(5,2),
    temp_max DECIMAL(5,2),
    
    -- Statistiques SOC/SOH
    soc_avg DECIMAL(5,2),
    soc_min DECIMAL(5,2),
    soc_max DECIMAL(5,2),
    soh_avg DECIMAL(5,2),
    soh_start DECIMAL(5,2),
    soh_end DECIMAL(5,2),
    
    -- Énergie et cycles
    energy_charged_wh DECIMAL(15,2),
    energy_discharged_wh DECIMAL(15,2),
    efficiency_percent DECIMAL(5,2),
    partial_cycles DECIMAL(8,2), -- Cycles partiels
    
    -- Temps d'opération (minutes)
    time_idle INT DEFAULT 0,
    time_charging INT DEFAULT 0,
    time_discharging INT DEFAULT 0,
    time_balancing INT DEFAULT 0,
    time_fault INT DEFAULT 0,
    
    -- Qualité des données
    data_points_count INT,
    data_quality_avg DECIMAL(3,1),
    communication_errors_total INT,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Contraintes et index
    FOREIGN KEY (battery_id) REFERENCES batteries(id) ON DELETE CASCADE,
    
    INDEX idx_battery_period (battery_id, period_type, period_start),
    INDEX idx_period_start (period_start),
    UNIQUE KEY unique_battery_period (battery_id, period_type, period_start)
);
```

### 3.8 Table alerts (Alertes et notifications)
```sql
CREATE TABLE alerts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    battery_id INT NOT NULL,
    
    -- Classification de l'alerte
    severity ENUM('info', 'warning', 'critical', 'emergency') NOT NULL,
    category ENUM('voltage', 'current', 'temperature', 'soc', 'soh', 'communication', 'system') NOT NULL,
    alert_code VARCHAR(50) NOT NULL, -- Code interne de l'alerte
    
    -- Message
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    description TEXT, -- Description détaillée
    
    -- Valeurs contextuelles
    trigger_value DECIMAL(12,3),
    threshold_value DECIMAL(12,3),
    current_value DECIMAL(12,3),
    unit VARCHAR(20),
    
    -- États
    status ENUM('active', 'acknowledged', 'resolved', 'suppressed') DEFAULT 'active',
    is_persistent BOOLEAN DEFAULT FALSE, -- Alerte récurrente
    
    -- Horodatage
    first_occurrence TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_occurrence TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP NULL,
    resolved_at TIMESTAMP NULL,
    
    -- Gestion
    acknowledged_by INT NULL, -- ID utilisateur
    resolved_by INT NULL,     -- ID utilisateur
    resolution_notes TEXT,
    
    -- Notifications
    notifications_sent JSON, -- Historique des notifications envoyées
    escalation_level INT DEFAULT 0,
    next_escalation TIMESTAMP NULL,
    
    -- Actions automatiques
    auto_actions_triggered JSON, -- Actions automatiques exécutées
    
    -- Métadonnées
    raw_data JSON, -- Données brutes ayant déclenché l'alerte
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Contraintes et index
    FOREIGN KEY (battery_id) REFERENCES batteries(id) ON DELETE CASCADE,
    
    INDEX idx_battery_status (battery_id, status),
    INDEX idx_severity_created (severity, created_at),
    INDEX idx_category_status (category, status),
    INDEX idx_active_alerts (status, created_at) -- Pour alertes actives
);
```

### 3.9 Table users (Utilisateurs du client)
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid CHAR(36) UNIQUE NOT NULL,
    
    -- Authentification
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Informations personnelles
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    job_title VARCHAR(255),
    department VARCHAR(255),
    
    -- Rôles et permissions
    role ENUM('super_admin', 'admin', 'operator', 'viewer', 'readonly') DEFAULT 'viewer',
    permissions JSON, -- Permissions granulaires
    
    -- Restrictions d'accès
    allowed_locations JSON, -- IDs des locations accessibles
    allowed_battery_types JSON, -- Types de batteries accessibles
    ip_restrictions JSON, -- Restrictions IP
    
    -- Préférences utilisateur
    language VARCHAR(5) DEFAULT 'fr',
    timezone VARCHAR(50) DEFAULT 'America/Montreal',
    date_format VARCHAR(20) DEFAULT 'Y-m-d',
    notifications_email BOOLEAN DEFAULT TRUE,
    notifications_sms BOOLEAN DEFAULT FALSE,
    dashboard_config JSON, -- Configuration dashboard personnalisé
    
    -- Sécurité
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    password_expires_at TIMESTAMP NULL,
    force_password_change BOOLEAN DEFAULT FALSE,
    
    -- Sessions et activité
    last_login TIMESTAMP NULL,
    last_activity TIMESTAMP NULL,
    session_token VARCHAR(255),
    session_expires_at TIMESTAMP NULL,
    
    -- États
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP NULL,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    
    -- Contraintes et index
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active),
    INDEX idx_last_activity (last_activity)
);
```

## 4. Scripts de Création et Migration

### 4.1 Script de Création Base Core
```sql
-- /database/schemas/001_create_core.sql
-- Script de création de la base de données core

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Création base si nécessaire
CREATE DATABASE IF NOT EXISTS trackingbms_core
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE trackingbms_core;

-- Tables core (voir sections précédentes)
-- ... (contenu des tables clients, modules, etc.)

SET FOREIGN_KEY_CHECKS = 1;

-- Données initiales
INSERT INTO modules (name, display_name, version, description, is_core) VALUES
('core', 'Module Core', '1.0', 'Module noyau du système', TRUE),
('auth', 'Authentification', '1.0', 'Gestion authentification et autorisations', TRUE),
('gateway', 'Passerelle API', '1.0', 'Point d\'entrée API', TRUE),
('bms-connector', 'Connecteur BMS', '1.0', 'Interface avec systèmes BMS', FALSE),
('data-processor', 'Processeur Données', '1.0', 'Traitement et analyse données', FALSE),
('web-interface', 'Interface Web', '1.0', 'Interface utilisateur web', FALSE),
('database', 'Gestionnaire BD', '1.0', 'Gestion base de données', TRUE);

-- Configuration système par défaut
INSERT INTO system_config (config_key, config_value, description) VALUES
('system.version', '"1.0.0"', 'Version du système'),
('system.maintenance_mode', 'false', 'Mode maintenance activé'),
('database.auto_backup', 'true', 'Sauvegarde automatique'),
('security.session_lifetime', '3600', 'Durée de vie session (secondes)'),
('alerts.email_enabled', 'true', 'Notifications email activées'),
('performance.cache_enabled', 'true', 'Cache activé');
```

### 4.2 Template Client Batteries
```sql
-- /database/templates/client_batteries_template.sql
-- Template pour création base client batteries

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Variables à remplacer : {{CLIENT_DB_NAME}}
CREATE DATABASE IF NOT EXISTS {{CLIENT_DB_NAME}}
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE {{CLIENT_DB_NAME}};

-- Tables client (voir sections précédentes)
-- ... (contenu des tables battery_types, locations, etc.)

SET FOREIGN_KEY_CHECKS = 1;

-- Données initiales standard
INSERT INTO battery_types (name, slug, chemistry, nominal_voltage, capacity_ah, capacity_wh, cell_count) VALUES
('LiFePO4 12V 100Ah', 'lifepo4-12v-100ah', 'lifepo4', 12.8, 100, 1280, 4),
('Li-ion 24V 50Ah', 'li-ion-24v-50ah', 'li-ion', 25.2, 50, 1260, 7),
('NCM 48V 20Ah', 'ncm-48v-20ah', 'ncm', 48.0, 20, 960, 13);

INSERT INTO locations (name, slug, level, environment_type) VALUES
('Site Principal', 'site-principal', 1, 'indoor'),
('Entrepôt Nord', 'entrepot-nord', 1, 'indoor'),
('Installation Externe', 'installation-externe', 1, 'outdoor');

-- Champs personnalisés de base
INSERT INTO custom_fields (field_name, field_label, field_type, applies_to, display_order) VALUES
('project_name', 'Nom du Projet', 'text', 'battery', 1),
('functionality', 'Fonctionnalité', 'select', 'battery', 2),
('responsible_person', 'Responsable', 'text', 'battery', 3),
('installation_notes', 'Notes Installation', 'textarea', 'battery', 4),
('maintenance_contract', 'Contrat Maintenance', 'boolean', 'battery', 5);

-- Options pour le champ fonctionnalité
UPDATE custom_fields 
SET options = '["Éclairage", "Backup UPS", "Traction", "Stockage Énergie", "Test/R&D", "Autre"]'
WHERE field_name = 'functionality';
```

### 4.3 Script d'Installation Automatique
```php
<?php
// /database/scripts/install.php
// Script d'installation automatique du système

class DatabaseInstaller {
    
    private $config;
    private $pdo;
    
    public function __construct(array $config) {
        $this->config = $config;
        $this->connectToDatabase();
    }
    
    public function install(): bool {
        try {
            $this->log("Début installation TrackingBMS Database");
            
            // 1. Créer base core
            $this->createCoreDatabase();
            
            // 2. Créer utilisateur système initial
            $this->createSystemUser();
            
            // 3. Vérifier modules requis
            $this->verifyRequiredModules();
            
            $this->log("Installation terminée avec succès");
            return true;
            
        } catch (Exception $e) {
            $this->log("Erreur installation: " . $e->getMessage());
            return false;
        }
    }
    
    public function createClientDatabase(int $clientId, string $industryType = 'batteries'): bool {
        try {
            $client = $this->getClient($clientId);
            $dbName = $client['database_name'];
            
            // Charger template selon type industrie
            $templateFile = "/database/templates/client_{$industryType}_template.sql";
            $template = file_get_contents($templateFile);
            
            // Remplacer variables
            $sql = str_replace('{{CLIENT_DB_NAME}}', $dbName, $template);
            
            // Exécuter création
            $this->pdo->exec($sql);
            
            $this->log("Base client créée: {$dbName}");
            return true;
            
        } catch (Exception $e) {
            $this->log("Erreur création base client: " . $e->getMessage());
            return false;
        }
    }
    
    private function createCoreDatabase(): void {
        $sql = file_get_contents('/database/schemas/001_create_core.sql');
        $this->pdo->exec($sql);
        $this->log("Base core créée");
    }
    
    private function createSystemUser(): void {
        $passwordHash = password_hash('admin123!', PASSWORD_ARGON2ID);
        
        $stmt = $this->pdo->prepare("
            INSERT INTO trackingbms_core.clients 
            (uuid, name, company, database_name, industry_type, status, encryption_key) 
            VALUES (?, 'Système', 'TrackingBMS', 'system_admin', 'batteries', 'active', ?)
        ");
        
        $uuid = $this->generateUUID();
        $encryptionKey = base64_encode(random_bytes(32));
        
        $stmt->execute([$uuid, $encryptionKey]);
        $this->log("Utilisateur système créé");
    }
    
    private function verifyRequiredModules(): void {
        $required = ['core', 'auth', 'gateway', 'database'];
        
        $stmt = $this->pdo->prepare("SELECT name FROM trackingbms_core.modules WHERE name = ? AND is_enabled = 1");
        
        foreach ($required as $module) {
            $stmt->execute([$module]);
            if (!$stmt->fetch()) {
                throw new Exception("Module requis manquant: {$module}");
            }
        }
        
        $this->log("Modules requis vérifiés");
    }
    
    private function connectToDatabase(): void {
        $dsn = "mysql:host={$this->config['host']};port={$this->config['port']};charset=utf8mb4";
        $this->pdo = new PDO($dsn, $this->config['username'], $this->config['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    }
    
    private function generateUUID(): string {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
    
    private function log(string $message): void {
        echo "[" . date('Y-m-d H:i:s') . "] {$message}" . PHP_EOL;
    }
}

// Configuration par défaut HostPapa
$config = [
    'host' => 'localhost',
    'port' => 3306,
    'username' => getenv('DB_USER') ?: 'trackingbms_user',
    'password' => getenv('DB_PASS') ?: 'secure_password',
];

// Installation
$installer = new DatabaseInstaller($config);
if ($installer->install()) {
    echo "Installation réussie!" . PHP_EOL;
} else {
    echo "Échec de l'installation!" . PHP_EOL;
    exit(1);
}
?>
```

## 5. Sécurité et Performance

### 5.1 Index Optimisés pour Performance
```sql
-- Index composites pour requêtes fréquentes
CREATE INDEX idx_battery_status_location ON batteries (status, location_id, is_active);
CREATE INDEX idx_bms_data_recent ON bms_data (battery_id, timestamp DESC, data_quality);
CREATE INDEX idx_alerts_active_severity ON alerts (status, severity, battery_id, created_at);
CREATE INDEX idx_history_period_battery ON bms_data_history (period_type, battery_id, period_start);

-- Index pour recherche full-text
ALTER TABLE batteries ADD FULLTEXT(name, serial_number, internal_id);
ALTER TABLE locations ADD FULLTEXT(name, address, description);
```

### 5.2 Procédures de Sécurité
```sql
-- Procédure de chiffrement des données sensibles
DELIMITER $$
CREATE PROCEDURE EncryptSensitiveData(IN clientId INT, IN encryptionKey VARCHAR(255))
BEGIN
    DECLARE clientDbName VARCHAR(64);
    
    SELECT database_name INTO clientDbName 
    FROM clients 
    WHERE id = clientId;
    
    -- Chiffrer mots de passe et données sensibles
    SET @sql = CONCAT('UPDATE ', clientDbName, '.users SET 
        phone = AES_ENCRYPT(phone, "', encryptionKey, '"),
        two_factor_secret = AES_ENCRYPT(two_factor_secret, "', encryptionKey, '")
        WHERE phone IS NOT NULL OR two_factor_secret IS NOT NULL'
    );
    
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$
DELIMITER ;
```

Cette architecture de base de données multi-tenant garantit l'isolation complète des données, la sécurité maximale et la performance optimale pour le système TrackingBMS sur l'hébergement HostPapa.