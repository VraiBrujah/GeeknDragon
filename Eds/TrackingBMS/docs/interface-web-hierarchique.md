# Interface Web Hiérarchique - TrackingBMS

**Version :** 1.0  
**Date :** 2025-09-01  
**Répertoire de Travail :** `C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\TrackingBMS`

## 1. Architecture Interface Utilisateur

### 1.1 Principe de Hiérarchisation

L'interface suit une structure hiérarchique logique reflétant l'organisation des données :

```
Client (Racine)
├── Types de Batteries
│   ├── LiFePO4
│   ├── Li-ion  
│   ├── NCM
│   └── Autres...
│       ├── Lieux d'Installation
│       │   ├── Site Principal
│       │   ├── Entrepôt Nord
│       │   └── Installation Externe...
│       │       ├── Batteries Individuelles
│       │       │   ├── Batterie #001
│       │       │   ├── Batterie #002
│       │       │   └── Batterie #N...
│       │       │       ├── Données Temps Réel
│       │       │       ├── Historiques
│       │       │       ├── Alertes
│       │       │       ├── Maintenance
│       │       │       └── Champs Personnalisés
```

### 1.2 Navigation Adaptative

- **Navigation breadcrumb** toujours visible
- **Sidebar collapsible** avec arborescence
- **Filtres contextuels** selon le niveau
- **Recherche globale** cross-niveaux
- **Actions rapides** par niveau

## 2. Structure des Pages

### 2.1 Layout Principal

```html
<!DOCTYPE html>
<html lang="fr" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TrackingBMS - {{PAGE_TITLE}}</title>
    
    <!-- CSS Framework (Custom + Chart.js) -->
    <link rel="stylesheet" href="/assets/css/trackingbms.min.css">
    <link rel="stylesheet" href="/assets/css/charts.css">
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#1976d2">
</head>
<body class="{{BODY_CLASSES}}">
    
    <!-- Header Global -->
    <header id="main-header" class="header-fixed">
        <div class="container-fluid">
            <!-- Logo + Client Name -->
            <div class="header-brand">
                <img src="{{CLIENT_LOGO}}" alt="{{CLIENT_NAME}}" class="logo">
                <h1 class="client-name">{{CLIENT_NAME}}</h1>
            </div>
            
            <!-- Navigation Breadcrumb -->
            <nav class="breadcrumb" aria-label="Fil d'Ariane">
                <ol id="breadcrumb-list"></ol>
            </nav>
            
            <!-- User Menu + Settings -->
            <div class="header-actions">
                <!-- Real-time Status -->
                <div class="connection-status" id="connection-indicator">
                    <span class="status-dot status-connected"></span>
                    <span class="status-text">Connecté</span>
                </div>
                
                <!-- Notifications -->
                <div class="notifications" id="notifications-dropdown">
                    <button class="btn-notification" data-count="0">
                        <i class="icon-bell"></i>
                    </button>
                    <div class="notifications-panel"></div>
                </div>
                
                <!-- User Menu -->
                <div class="user-menu" id="user-dropdown">
                    <button class="user-button">
                        <img src="{{USER_AVATAR}}" alt="{{USER_NAME}}" class="avatar">
                        <span class="user-name">{{USER_NAME}}</span>
                    </button>
                    <div class="user-panel"></div>
                </div>
            </div>
        </div>
    </header>
    
    <!-- Sidebar Navigation -->
    <aside id="sidebar" class="sidebar sidebar-expanded">
        <div class="sidebar-content">
            <!-- Quick Stats -->
            <div class="sidebar-stats">
                <div class="stat-item">
                    <span class="stat-value" id="total-batteries">--</span>
                    <span class="stat-label">Batteries</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value" id="active-alerts">--</span>
                    <span class="stat-label">Alertes</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value" id="avg-health">--</span>
                    <span class="stat-label">Santé Moy.</span>
                </div>
            </div>
            
            <!-- Navigation Tree -->
            <nav class="nav-tree" id="navigation-tree">
                <ul class="tree-root"></ul>
            </nav>
        </div>
        
        <!-- Sidebar Toggle -->
        <button class="sidebar-toggle" id="sidebar-toggle">
            <i class="icon-chevron-left"></i>
        </button>
    </aside>
    
    <!-- Main Content Area -->
    <main id="main-content" class="main-content">
        <!-- Page Header -->
        <div class="page-header">
            <div class="page-title">
                <h2 id="page-title">{{PAGE_TITLE}}</h2>
                <p class="page-subtitle" id="page-subtitle">{{PAGE_SUBTITLE}}</p>
            </div>
            
            <!-- Page Actions -->
            <div class="page-actions" id="page-actions">
                <!-- Dynamic actions based on current page -->
            </div>
        </div>
        
        <!-- Filters & Search Bar -->
        <div class="content-toolbar" id="content-toolbar">
            <!-- Search -->
            <div class="search-container">
                <input type="text" 
                       id="global-search" 
                       placeholder="Rechercher..." 
                       class="search-input">
                <i class="search-icon icon-search"></i>
            </div>
            
            <!-- Filters -->
            <div class="filters-container" id="filters-container">
                <!-- Dynamic filters based on current context -->
            </div>
            
            <!-- View Options -->
            <div class="view-options">
                <button class="btn-view active" data-view="grid">
                    <i class="icon-grid"></i>
                </button>
                <button class="btn-view" data-view="list">
                    <i class="icon-list"></i>
                </button>
                <button class="btn-view" data-view="table">
                    <i class="icon-table"></i>
                </button>
            </div>
        </div>
        
        <!-- Dynamic Content Container -->
        <div class="content-container" id="content-container">
            <!-- Content loaded dynamically here -->
        </div>
    </main>
    
    <!-- Real-time Data Panel (Collapsible) -->
    <div id="realtime-panel" class="realtime-panel realtime-hidden">
        <div class="panel-header">
            <h3>Données Temps Réel</h3>
            <button class="panel-toggle" id="realtime-toggle">
                <i class="icon-chevron-up"></i>
            </button>
        </div>
        <div class="panel-content" id="realtime-content">
            <!-- Real-time charts and data -->
        </div>
    </div>
    
    <!-- Modal Container -->
    <div id="modal-container"></div>
    
    <!-- Toast Notifications -->
    <div id="toast-container" class="toast-container"></div>
    
    <!-- Loading Overlay -->
    <div id="loading-overlay" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p class="loading-text">Chargement...</p>
    </div>
    
    <!-- JavaScript -->
    <script src="/assets/js/vendor/chart.umd.js"></script>
    <script src="/assets/js/trackingbms.min.js"></script>
    
    <!-- WebSocket Connection -->
    <script>
        // Initialize real-time connection
        TrackingBMS.init({
            apiBaseUrl: '{{API_BASE_URL}}',
            websocketUrl: '{{WEBSOCKET_URL}}',
            clientId: '{{CLIENT_ID}}',
            userId: '{{USER_ID}}',
            token: '{{JWT_TOKEN}}'
        });
    </script>
</body>
</html>
```

### 2.2 Dashboard Principal

```html
<!-- Dashboard Content Template -->
<div class="dashboard-content">
    
    <!-- Key Metrics Row -->
    <div class="metrics-row">
        <div class="metric-card metric-primary">
            <div class="metric-header">
                <h4>Batteries Actives</h4>
                <i class="metric-icon icon-battery"></i>
            </div>
            <div class="metric-body">
                <span class="metric-value" data-metric="active-batteries">{{ACTIVE_COUNT}}</span>
                <span class="metric-total">/ {{TOTAL_COUNT}}</span>
            </div>
            <div class="metric-footer">
                <span class="metric-change positive">+3 cette semaine</span>
            </div>
        </div>
        
        <div class="metric-card metric-warning">
            <div class="metric-header">
                <h4>Alertes Actives</h4>
                <i class="metric-icon icon-alert-triangle"></i>
            </div>
            <div class="metric-body">
                <span class="metric-value" data-metric="active-alerts">{{ALERT_COUNT}}</span>
                <span class="metric-breakdown">
                    <span class="alert-critical">{{CRITICAL}}</span>
                    <span class="alert-warning">{{WARNING}}</span>
                </span>
            </div>
            <div class="metric-footer">
                <a href="#alerts" class="metric-link">Voir détails</a>
            </div>
        </div>
        
        <div class="metric-card metric-success">
            <div class="metric-header">
                <h4>Santé Moyenne</h4>
                <i class="metric-icon icon-heart"></i>
            </div>
            <div class="metric-body">
                <span class="metric-value" data-metric="avg-health">{{AVG_HEALTH}}%</span>
                <div class="metric-progress">
                    <div class="progress-bar" style="width: {{AVG_HEALTH}}%"></div>
                </div>
            </div>
            <div class="metric-footer">
                <span class="metric-change positive">+2.3% ce mois</span>
            </div>
        </div>
        
        <div class="metric-card metric-info">
            <div class="metric-header">
                <h4>Énergie Totale</h4>
                <i class="metric-icon icon-zap"></i>
            </div>
            <div class="metric-body">
                <span class="metric-value" data-metric="total-energy">{{TOTAL_ENERGY}}</span>
                <span class="metric-unit">kWh</span>
            </div>
            <div class="metric-footer">
                <span class="metric-detail">Capacité installée</span>
            </div>
        </div>
    </div>
    
    <!-- Charts Row -->
    <div class="charts-row">
        <div class="chart-container chart-large">
            <div class="chart-header">
                <h4>Performance Système</h4>
                <div class="chart-controls">
                    <select class="time-range-select" id="performance-timerange">
                        <option value="1h">1 heure</option>
                        <option value="24h" selected>24 heures</option>
                        <option value="7d">7 jours</option>
                        <option value="30d">30 jours</option>
                    </select>
                </div>
            </div>
            <div class="chart-body">
                <canvas id="performance-chart" width="800" height="400"></canvas>
            </div>
        </div>
        
        <div class="chart-container chart-medium">
            <div class="chart-header">
                <h4>Répartition par Type</h4>
            </div>
            <div class="chart-body">
                <canvas id="battery-types-chart" width="400" height="400"></canvas>
            </div>
            <div class="chart-legend" id="types-legend"></div>
        </div>
    </div>
    
    <!-- Status Grid -->
    <div class="status-grid">
        <div class="status-section">
            <h4 class="section-title">Batteries Récemment Actives</h4>
            <div class="battery-list" id="recent-batteries">
                <!-- Battery cards populated via JS -->
            </div>
        </div>
        
        <div class="status-section">
            <h4 class="section-title">Alertes Récentes</h4>
            <div class="alert-list" id="recent-alerts">
                <!-- Alert items populated via JS -->
            </div>
        </div>
        
        <div class="status-section">
            <h4 class="section-title">Maintenance Planifiée</h4>
            <div class="maintenance-list" id="scheduled-maintenance">
                <!-- Maintenance items populated via JS -->
            </div>
        </div>
    </div>
    
</div>
```

### 2.3 Page Liste Batteries

```html
<!-- Battery List Page Template -->
<div class="battery-list-page">
    
    <!-- Filter Panel -->
    <div class="filter-panel" id="battery-filters">
        <div class="filter-group">
            <label for="type-filter">Type de Batterie</label>
            <select id="type-filter" class="filter-select" multiple>
                <option value="">Tous les types</option>
                <!-- Options populated dynamically -->
            </select>
        </div>
        
        <div class="filter-group">
            <label for="location-filter">Lieu</label>
            <select id="location-filter" class="filter-select" multiple>
                <option value="">Tous les lieux</option>
                <!-- Options populated dynamically -->
            </select>
        </div>
        
        <div class="filter-group">
            <label for="status-filter">État</label>
            <select id="status-filter" class="filter-select" multiple>
                <option value="">Tous les états</option>
                <option value="operational">Opérationnel</option>
                <option value="maintenance">Maintenance</option>
                <option value="fault">Défaut</option>
                <option value="commissioning">Mise en service</option>
            </select>
        </div>
        
        <div class="filter-group">
            <label for="health-filter">Santé</label>
            <div class="range-filter">
                <input type="range" id="health-min" min="0" max="100" value="0">
                <input type="range" id="health-max" min="0" max="100" value="100">
                <span class="range-display">0% - 100%</span>
            </div>
        </div>
        
        <div class="filter-actions">
            <button class="btn btn-primary" id="apply-filters">Appliquer</button>
            <button class="btn btn-secondary" id="clear-filters">Effacer</button>
        </div>
    </div>
    
    <!-- Results Header -->
    <div class="results-header">
        <div class="results-count">
            <span id="results-count">{{RESULT_COUNT}}</span> batteries trouvées
        </div>
        <div class="sort-options">
            <label for="sort-by">Trier par:</label>
            <select id="sort-by" class="sort-select">
                <option value="name">Nom</option>
                <option value="health">Santé</option>
                <option value="last_activity">Dernière activité</option>
                <option value="location">Lieu</option>
                <option value="type">Type</option>
            </select>
            <button class="btn-sort-direction" id="sort-direction" data-direction="asc">
                <i class="icon-arrow-up"></i>
            </button>
        </div>
    </div>
    
    <!-- Battery Grid/List -->
    <div class="battery-grid" id="battery-grid" data-view="grid">
        <!-- Battery cards populated dynamically -->
    </div>
    
    <!-- Pagination -->
    <div class="pagination-container" id="pagination">
        <!-- Pagination controls -->
    </div>
    
</div>

<!-- Battery Card Template -->
<template id="battery-card-template">
    <div class="battery-card" data-battery-id="{{BATTERY_ID}}">
        <div class="card-header">
            <div class="battery-name">
                <h5>{{BATTERY_NAME}}</h5>
                <span class="battery-serial">{{SERIAL_NUMBER}}</span>
            </div>
            <div class="battery-status status-{{STATUS}}">
                <i class="status-icon icon-{{STATUS_ICON}}"></i>
                <span class="status-text">{{STATUS_TEXT}}</span>
            </div>
        </div>
        
        <div class="card-body">
            <div class="battery-info">
                <div class="info-item">
                    <span class="label">Type:</span>
                    <span class="value">{{BATTERY_TYPE}}</span>
                </div>
                <div class="info-item">
                    <span class="label">Lieu:</span>
                    <span class="value">{{LOCATION_NAME}}</span>
                </div>
                <div class="info-item">
                    <span class="label">Santé:</span>
                    <span class="value health-value" data-health="{{HEALTH_SCORE}}">
                        {{HEALTH_SCORE}}%
                    </span>
                </div>
            </div>
            
            <!-- Real-time Metrics -->
            <div class="battery-metrics">
                <div class="metric">
                    <span class="metric-label">SOC</span>
                    <span class="metric-value">{{SOC}}%</span>
                    <div class="metric-bar">
                        <div class="bar-fill" style="width: {{SOC}}%"></div>
                    </div>
                </div>
                <div class="metric">
                    <span class="metric-label">Tension</span>
                    <span class="metric-value">{{VOLTAGE}}V</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Courant</span>
                    <span class="metric-value">{{CURRENT}}A</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Temp.</span>
                    <span class="metric-value">{{TEMPERATURE}}°C</span>
                </div>
            </div>
            
            <!-- Alerts Indicator -->
            <div class="alerts-indicator" data-alerts="{{ALERT_COUNT}}">
                <i class="icon-alert-triangle"></i>
                <span>{{ALERT_COUNT}} alertes</span>
            </div>
        </div>
        
        <div class="card-footer">
            <div class="last-update">
                <i class="icon-clock"></i>
                <span>Mis à jour {{LAST_UPDATE}}</span>
            </div>
            <div class="card-actions">
                <button class="btn btn-sm btn-outline" onclick="viewBatteryDetails('{{BATTERY_ID}}')">
                    Détails
                </button>
                <button class="btn btn-sm btn-outline" onclick="viewRealTimeData('{{BATTERY_ID}}')">
                    Temps Réel
                </button>
            </div>
        </div>
    </div>
</template>
```

### 2.4 Page Détail Batterie

```html
<!-- Battery Detail Page Template -->
<div class="battery-detail-page" data-battery-id="{{BATTERY_ID}}">
    
    <!-- Battery Header -->
    <div class="battery-header">
        <div class="battery-identity">
            <h2 class="battery-name">{{BATTERY_NAME}}</h2>
            <p class="battery-subtitle">
                {{BATTERY_TYPE}} • {{LOCATION_NAME}} • {{SERIAL_NUMBER}}
            </p>
        </div>
        
        <div class="battery-status-large">
            <div class="status-indicator status-{{STATUS}}">
                <i class="status-icon icon-{{STATUS_ICON}}"></i>
                <span class="status-text">{{STATUS_TEXT}}</span>
            </div>
            <div class="health-score">
                <div class="health-circle" data-health="{{HEALTH_SCORE}}">
                    <svg class="health-ring" width="80" height="80">
                        <circle class="ring-background" cx="40" cy="40" r="35"></circle>
                        <circle class="ring-progress" cx="40" cy="40" r="35" 
                                stroke-dasharray="{{HEALTH_DASH_ARRAY}}" 
                                stroke-dashoffset="{{HEALTH_DASH_OFFSET}}"></circle>
                    </svg>
                    <div class="health-text">
                        <span class="health-value">{{HEALTH_SCORE}}</span>
                        <span class="health-unit">%</span>
                    </div>
                </div>
                <span class="health-label">Santé</span>
            </div>
        </div>
        
        <div class="battery-actions">
            <button class="btn btn-primary" id="start-monitoring">
                <i class="icon-play"></i>
                Surveillance Temps Réel
            </button>
            <button class="btn btn-outline" onclick="exportBatteryData('{{BATTERY_ID}}')">
                <i class="icon-download"></i>
                Exporter Données
            </button>
            <button class="btn btn-outline" onclick="configureBattery('{{BATTERY_ID}}')">
                <i class="icon-settings"></i>
                Configurer
            </button>
        </div>
    </div>
    
    <!-- Tab Navigation -->
    <div class="tab-navigation" id="detail-tabs">
        <button class="tab-button active" data-tab="realtime">Temps Réel</button>
        <button class="tab-button" data-tab="history">Historique</button>
        <button class="tab-button" data-tab="alerts">Alertes</button>
        <button class="tab-button" data-tab="maintenance">Maintenance</button>
        <button class="tab-button" data-tab="custom">Personnalisé</button>
    </div>
    
    <!-- Tab Content -->
    <div class="tab-content">
        
        <!-- Real-time Tab -->
        <div class="tab-panel active" id="tab-realtime">
            <div class="realtime-grid">
                
                <!-- Live Metrics Cards -->
                <div class="metrics-section">
                    <h4>Métriques Principales</h4>
                    <div class="live-metrics">
                        <div class="metric-card live-metric" data-metric="soc">
                            <div class="metric-header">
                                <span class="metric-name">État de Charge</span>
                                <i class="metric-icon icon-battery"></i>
                            </div>
                            <div class="metric-display">
                                <span class="metric-value" id="live-soc">{{SOC}}</span>
                                <span class="metric-unit">%</span>
                            </div>
                            <div class="metric-bar">
                                <div class="bar-fill" style="width: {{SOC}}%"></div>
                            </div>
                        </div>
                        
                        <div class="metric-card live-metric" data-metric="voltage">
                            <div class="metric-header">
                                <span class="metric-name">Tension Pack</span>
                                <i class="metric-icon icon-zap"></i>
                            </div>
                            <div class="metric-display">
                                <span class="metric-value" id="live-voltage">{{VOLTAGE}}</span>
                                <span class="metric-unit">V</span>
                            </div>
                            <div class="metric-trend" data-trend="{{VOLTAGE_TREND}}">
                                <i class="trend-icon icon-trend-{{VOLTAGE_TREND}}"></i>
                            </div>
                        </div>
                        
                        <div class="metric-card live-metric" data-metric="current">
                            <div class="metric-header">
                                <span class="metric-name">Courant</span>
                                <i class="metric-icon icon-activity"></i>
                            </div>
                            <div class="metric-display">
                                <span class="metric-value" id="live-current">{{CURRENT}}</span>
                                <span class="metric-unit">A</span>
                            </div>
                            <div class="current-direction" data-direction="{{CURRENT_DIRECTION}}">
                                <i class="direction-icon icon-{{CURRENT_DIRECTION}}"></i>
                                <span>{{CURRENT_DIRECTION_TEXT}}</span>
                            </div>
                        </div>
                        
                        <div class="metric-card live-metric" data-metric="temperature">
                            <div class="metric-header">
                                <span class="metric-name">Température</span>
                                <i class="metric-icon icon-thermometer"></i>
                            </div>
                            <div class="metric-display">
                                <span class="metric-value" id="live-temp">{{TEMPERATURE}}</span>
                                <span class="metric-unit">°C</span>
                            </div>
                            <div class="temp-range">
                                <span class="temp-min">Min: {{TEMP_MIN}}°C</span>
                                <span class="temp-max">Max: {{TEMP_MAX}}°C</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Live Charts -->
                <div class="charts-section">
                    <div class="chart-container">
                        <div class="chart-header">
                            <h4>Tendances Temps Réel</h4>
                            <div class="chart-controls">
                                <button class="btn btn-sm" data-timespan="1h">1h</button>
                                <button class="btn btn-sm active" data-timespan="4h">4h</button>
                                <button class="btn btn-sm" data-timespan="12h">12h</button>
                            </div>
                        </div>
                        <div class="chart-body">
                            <canvas id="realtime-trends-chart" width="800" height="400"></canvas>
                        </div>
                    </div>
                </div>
                
                <!-- Cell Details -->
                <div class="cell-section">
                    <h4>Détail des Cellules</h4>
                    <div class="cell-grid" id="cell-voltages">
                        <!-- Cell voltage cards populated dynamically -->
                    </div>
                </div>
            </div>
        </div>
        
        <!-- History Tab -->
        <div class="tab-panel" id="tab-history">
            <div class="history-controls">
                <div class="date-range-picker">
                    <label for="history-start">Du:</label>
                    <input type="datetime-local" id="history-start" class="date-input">
                    <label for="history-end">Au:</label>
                    <input type="datetime-local" id="history-end" class="date-input">
                    <button class="btn btn-primary" id="load-history">Charger</button>
                </div>
                
                <div class="aggregation-options">
                    <label for="aggregation">Agrégation:</label>
                    <select id="aggregation" class="aggregation-select">
                        <option value="raw">Données brutes</option>
                        <option value="hourly">Horaire</option>
                        <option value="daily">Quotidienne</option>
                        <option value="weekly">Hebdomadaire</option>
                    </select>
                </div>
            </div>
            
            <div class="history-content">
                <div class="chart-container chart-full">
                    <canvas id="history-chart" width="1200" height="600"></canvas>
                </div>
                
                <div class="history-stats">
                    <div class="stat-card">
                        <h5>Cycles de Charge</h5>
                        <span class="stat-value">{{CYCLES_COUNT}}</span>
                    </div>
                    <div class="stat-card">
                        <h5>Énergie Totale</h5>
                        <span class="stat-value">{{TOTAL_ENERGY}} kWh</span>
                    </div>
                    <div class="stat-card">
                        <h5>Efficacité Moyenne</h5>
                        <span class="stat-value">{{AVG_EFFICIENCY}}%</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Alerts Tab -->
        <div class="tab-panel" id="tab-alerts">
            <div class="alerts-header">
                <div class="alert-filters">
                    <select id="alert-severity-filter" class="filter-select">
                        <option value="">Toutes les sévérités</option>
                        <option value="emergency">Urgence</option>
                        <option value="critical">Critique</option>
                        <option value="warning">Avertissement</option>
                        <option value="info">Information</option>
                    </select>
                    
                    <select id="alert-status-filter" class="filter-select">
                        <option value="">Tous les statuts</option>
                        <option value="active">Actives</option>
                        <option value="acknowledged">Acquittées</option>
                        <option value="resolved">Résolues</option>
                    </select>
                </div>
                
                <div class="alert-actions">
                    <button class="btn btn-outline" id="acknowledge-all">
                        Tout Acquitter
                    </button>
                    <button class="btn btn-outline" id="export-alerts">
                        Exporter
                    </button>
                </div>
            </div>
            
            <div class="alerts-list" id="alerts-list">
                <!-- Alert items populated dynamically -->
            </div>
        </div>
        
        <!-- Custom Fields Tab -->
        <div class="tab-panel" id="tab-custom">
            <div class="custom-fields-container">
                <div class="fields-header">
                    <h4>Champs Personnalisés</h4>
                    <button class="btn btn-primary" onclick="editCustomFields('{{BATTERY_ID}}')">
                        Modifier
                    </button>
                </div>
                
                <div class="custom-fields-grid" id="custom-fields-display">
                    <!-- Custom fields populated dynamically -->
                </div>
            </div>
        </div>
    </div>
    
</div>
```

## 3. Système de Navigation et Filtrage

### 3.1 JavaScript Navigation Manager

```javascript
// /assets/js/navigation-manager.js
class NavigationManager {
    constructor() {
        this.currentPath = [];
        this.breadcrumbContainer = document.getElementById('breadcrumb-list');
        this.navigationTree = document.getElementById('navigation-tree');
        this.filters = {};
        this.searchQuery = '';
        
        this.initializeNavigation();
        this.initializeEventListeners();
    }
    
    initializeNavigation() {
        // Build navigation tree based on user permissions and data
        this.loadNavigationTree();
        this.updateBreadcrumb();
    }
    
    async loadNavigationTree() {
        try {
            const response = await TrackingBMS.api.get('/navigation/tree');
            const treeData = response.data;
            
            this.renderNavigationTree(treeData);
        } catch (error) {
            console.error('Error loading navigation tree:', error);
        }
    }
    
    renderNavigationTree(data) {
        const treeRoot = this.navigationTree.querySelector('.tree-root');
        treeRoot.innerHTML = '';
        
        data.forEach(node => {
            const treeNode = this.createTreeNode(node);
            treeRoot.appendChild(treeNode);
        });
    }
    
    createTreeNode(nodeData) {
        const li = document.createElement('li');
        li.className = 'tree-node';
        li.dataset.nodeId = nodeData.id;
        li.dataset.nodeType = nodeData.type;
        
        const nodeContent = `
            <div class="tree-node-content" onclick="navigationManager.navigateTo('${nodeData.type}', '${nodeData.id}')">
                <i class="tree-icon icon-${nodeData.icon}"></i>
                <span class="tree-label">${nodeData.label}</span>
                <span class="tree-count">${nodeData.count || ''}</span>
                ${nodeData.children ? '<i class="tree-toggle icon-chevron-right"></i>' : ''}
            </div>
        `;
        
        li.innerHTML = nodeContent;
        
        if (nodeData.children) {
            const childrenUl = document.createElement('ul');
            childrenUl.className = 'tree-children';
            
            nodeData.children.forEach(child => {
                const childNode = this.createTreeNode(child);
                childrenUl.appendChild(childNode);
            });
            
            li.appendChild(childrenUl);
        }
        
        return li;
    }
    
    navigateTo(type, id) {
        // Update current path
        this.currentPath = [{ type, id }];
        
        // Update URL without page reload
        const newUrl = `/dashboard/${type}/${id}`;
        history.pushState({ type, id }, '', newUrl);
        
        // Load content for the selected node
        this.loadContent(type, id);
        
        // Update breadcrumb
        this.updateBreadcrumb();
        
        // Highlight active node in tree
        this.highlightActiveNode(type, id);
    }
    
    async loadContent(type, id) {
        const contentContainer = document.getElementById('content-container');
        const loadingOverlay = document.getElementById('loading-overlay');
        
        try {
            loadingOverlay.classList.add('active');
            
            let response;
            switch (type) {
                case 'dashboard':
                    response = await this.loadDashboard();
                    break;
                case 'battery-type':
                    response = await this.loadBatteryType(id);
                    break;
                case 'location':
                    response = await this.loadLocation(id);
                    break;
                case 'battery':
                    response = await this.loadBatteryDetail(id);
                    break;
                default:
                    throw new Error(`Unknown content type: ${type}`);
            }
            
            contentContainer.innerHTML = response.html;
            
            // Initialize page-specific functionality
            this.initializePageFeatures(type, id);
            
        } catch (error) {
            console.error('Error loading content:', error);
            this.showError('Erreur lors du chargement du contenu');
        } finally {
            loadingOverlay.classList.remove('active');
        }
    }
    
    updateBreadcrumb() {
        // Build breadcrumb based on current path
        const breadcrumbItems = [
            { label: 'Accueil', url: '/dashboard' }
        ];
        
        this.currentPath.forEach((item, index) => {
            const breadcrumbItem = this.buildBreadcrumbItem(item);
            if (breadcrumbItem) {
                breadcrumbItems.push(breadcrumbItem);
            }
        });
        
        // Render breadcrumb
        this.breadcrumbContainer.innerHTML = breadcrumbItems
            .map((item, index) => {
                const isLast = index === breadcrumbItems.length - 1;
                return `
                    <li class="breadcrumb-item ${isLast ? 'active' : ''}">
                        ${isLast ? item.label : `<a href="${item.url}">${item.label}</a>`}
                    </li>
                `;
            })
            .join('');
    }
    
    initializeEventListeners() {
        // Global search
        const globalSearch = document.getElementById('global-search');
        globalSearch.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
        
        // Filter changes
        document.addEventListener('change', (event) => {
            if (event.target.matches('.filter-select, .filter-input')) {
                this.handleFilterChange(event.target);
            }
        });
        
        // Tree node toggles
        this.navigationTree.addEventListener('click', (event) => {
            if (event.target.matches('.tree-toggle')) {
                this.toggleTreeNode(event.target.closest('.tree-node'));
            }
        });
        
        // Browser back/forward
        window.addEventListener('popstate', (event) => {
            if (event.state) {
                this.navigateTo(event.state.type, event.state.id);
            }
        });
    }
    
    handleSearch(event) {
        this.searchQuery = event.target.value;
        this.applyFilters();
    }
    
    handleFilterChange(filterElement) {
        const filterName = filterElement.id || filterElement.name;
        const filterValue = filterElement.value;
        
        this.filters[filterName] = filterValue;
        this.applyFilters();
    }
    
    async applyFilters() {
        const currentContent = this.getCurrentContentType();
        if (!currentContent) return;
        
        const filterParams = {
            ...this.filters,
            search: this.searchQuery
        };
        
        try {
            const response = await TrackingBMS.api.get(`/${currentContent}/filtered`, {
                params: filterParams
            });
            
            this.updateContentWithFilters(response.data);
        } catch (error) {
            console.error('Error applying filters:', error);
        }
    }
    
    // Utility functions
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize navigation manager
const navigationManager = new NavigationManager();
```

### 3.2 Système de Filtres Dynamiques

```javascript
// /assets/js/filter-manager.js
class FilterManager {
    constructor() {
        this.activeFilters = {};
        this.filterDefinitions = {};
        this.filterContainer = document.getElementById('filters-container');
        
        this.loadFilterDefinitions();
    }
    
    async loadFilterDefinitions() {
        try {
            const response = await TrackingBMS.api.get('/filters/definitions');
            this.filterDefinitions = response.data;
        } catch (error) {
            console.error('Error loading filter definitions:', error);
        }
    }
    
    renderFilters(contentType, context = {}) {
        const availableFilters = this.filterDefinitions[contentType] || [];
        
        this.filterContainer.innerHTML = '';
        
        availableFilters.forEach(filter => {
            const filterElement = this.createFilterElement(filter, context);
            this.filterContainer.appendChild(filterElement);
        });
    }
    
    createFilterElement(filterConfig, context) {
        const wrapper = document.createElement('div');
        wrapper.className = 'filter-group';
        
        switch (filterConfig.type) {
            case 'select':
                wrapper.innerHTML = this.createSelectFilter(filterConfig, context);
                break;
            case 'multiselect':
                wrapper.innerHTML = this.createMultiSelectFilter(filterConfig, context);
                break;
            case 'range':
                wrapper.innerHTML = this.createRangeFilter(filterConfig, context);
                break;
            case 'date-range':
                wrapper.innerHTML = this.createDateRangeFilter(filterConfig, context);
                break;
            case 'boolean':
                wrapper.innerHTML = this.createBooleanFilter(filterConfig, context);
                break;
            default:
                wrapper.innerHTML = this.createTextFilter(filterConfig, context);
        }
        
        return wrapper;
    }
    
    createSelectFilter(config, context) {
        return `
            <label for="${config.id}">${config.label}</label>
            <select id="${config.id}" class="filter-select" ${config.multiple ? 'multiple' : ''}>
                <option value="">Toutes les options</option>
                ${config.options.map(option => 
                    `<option value="${option.value}">${option.label}</option>`
                ).join('')}
            </select>
        `;
    }
    
    createRangeFilter(config, context) {
        return `
            <label>${config.label}</label>
            <div class="range-filter">
                <input type="range" 
                       id="${config.id}-min" 
                       class="range-input"
                       min="${config.min}" 
                       max="${config.max}" 
                       value="${config.defaultMin}">
                <input type="range" 
                       id="${config.id}-max" 
                       class="range-input"
                       min="${config.min}" 
                       max="${config.max}" 
                       value="${config.defaultMax}">
                <div class="range-display">
                    <span id="${config.id}-display">
                        ${config.defaultMin}${config.unit} - ${config.defaultMax}${config.unit}
                    </span>
                </div>
            </div>
        `;
    }
    
    // Additional filter creation methods...
}
```

## 4. Responsive Design et Mobile

### 4.1 CSS Media Queries

```css
/* /assets/css/responsive.css */

/* Mobile First Approach */
.main-content {
    padding: 1rem;
    margin-left: 0;
    transition: margin-left 0.3s ease;
}

.sidebar {
    position: fixed;
    top: 0;
    left: -280px;
    height: 100vh;
    width: 280px;
    background: var(--sidebar-bg);
    transition: left 0.3s ease;
    z-index: 1000;
}

/* Tablet */
@media (min-width: 768px) {
    .sidebar {
        left: -280px;
    }
    
    .sidebar.sidebar-expanded {
        left: 0;
    }
    
    .main-content {
        margin-left: 0;
    }
    
    .sidebar-expanded ~ .main-content {
        margin-left: 280px;
    }
    
    .battery-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .metrics-row {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .sidebar {
        left: 0;
        position: static;
        height: calc(100vh - var(--header-height));
    }
    
    .main-content {
        margin-left: 280px;
    }
    
    .battery-grid {
        grid-template-columns: repeat(3, 1fr);
    }
    
    .metrics-row {
        grid-template-columns: repeat(4, 1fr);
    }
    
    .charts-row {
        grid-template-columns: 2fr 1fr;
    }
}

/* Large Desktop */
@media (min-width: 1440px) {
    .battery-grid {
        grid-template-columns: repeat(4, 1fr);
    }
    
    .content-container {
        max-width: 1400px;
        margin: 0 auto;
    }
}

/* Mobile Specific Styles */
@media (max-width: 767px) {
    .header-brand .client-name {
        display: none;
    }
    
    .breadcrumb {
        display: none;
    }
    
    .page-header {
        text-align: center;
    }
    
    .filter-panel {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: white;
        z-index: 2000;
        transform: translateY(100%);
        transition: transform 0.3s ease;
    }
    
    .filter-panel.active {
        transform: translateY(0);
    }
    
    .battery-card {
        margin-bottom: 1rem;
    }
    
    .battery-metrics {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
    }
    
    .tab-navigation {
        overflow-x: auto;
        white-space: nowrap;
        -webkit-overflow-scrolling: touch;
    }
    
    .tab-button {
        flex-shrink: 0;
        min-width: 120px;
    }
    
    /* Touch-friendly buttons */
    .btn {
        min-height: 44px;
        min-width: 44px;
    }
    
    .metric-card {
        padding: 1rem;
    }
    
    .chart-container {
        overflow-x: auto;
    }
    
    canvas {
        min-width: 100%;
        height: auto !important;
    }
}

/* === MODE SOMBRE MODERNE PREMIUM === */
@media (prefers-color-scheme: dark) {
    :root {
        --bg-primary: linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%);
        --bg-secondary: linear-gradient(135deg, #1a1f2e 0%, #232935 100%);
        --bg-card: rgba(255, 255, 255, 0.03);
        --bg-glass: rgba(255, 255, 255, 0.05);
        
        /* Neon accents */
        --accent-electric: #00d4ff;
        --accent-green: #00ff88;
        --accent-purple: #8b5cf6;
        --accent-orange: #ff6b35;
        
        /* Text hierarchy */
        --text-primary: #f8fafc;
        --text-secondary: #cbd5e1;
        --text-tertiary: #94a3b8;
        --text-muted: #64748b;
        
        /* Borders & shadows */
        --border-subtle: rgba(255, 255, 255, 0.1);
        --border-accent: rgba(0, 212, 255, 0.3);
        --shadow-glow: 0 0 20px rgba(0, 212, 255, 0.2);
        --shadow-card: 0 8px 32px rgba(0, 0, 0, 0.4);
        --sidebar-bg: rgba(15, 20, 25, 0.95);
    }
}

[data-theme="dark"] {
    --bg-primary: linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%);
    --bg-secondary: linear-gradient(135deg, #1a1f2e 0%, #232935 100%);
    --bg-card: rgba(255, 255, 255, 0.03);
    --bg-glass: rgba(255, 255, 255, 0.05);
    
    /* Neon accents */
    --accent-electric: #00d4ff;
    --accent-green: #00ff88;
    --accent-purple: #8b5cf6;
    --accent-orange: #ff6b35;
    
    /* Text hierarchy */
    --text-primary: #f8fafc;
    --text-secondary: #cbd5e1;
    --text-tertiary: #94a3b8;
    --text-muted: #64748b;
    
    /* Borders & shadows */
    --border-subtle: rgba(255, 255, 255, 0.1);
    --border-accent: rgba(0, 212, 255, 0.3);
    --shadow-glow: 0 0 20px rgba(0, 212, 255, 0.2);
    --shadow-card: 0 8px 32px rgba(0, 0, 0, 0.4);
    --sidebar-bg: rgba(15, 20, 25, 0.95);
}

/* === COMPOSANTS GLASSMORPHISM === */
.dashboard-card {
    background: var(--bg-glass);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border-subtle);
    border-radius: 16px;
    box-shadow: var(--shadow-card);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dashboard-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-glow);
    border-color: var(--border-accent);
}

/* === GRAPHIQUES NÉON === */
.chart-container {
    background: radial-gradient(circle at 30% 30%, 
        rgba(0, 212, 255, 0.1) 0%, 
        transparent 50%);
    border-radius: 20px;
    padding: 24px;
    backdrop-filter: blur(10px);
}

/* === DONNÉES TEMPS RÉEL === */
.realtime-data {
    animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
    0%, 100% { 
        box-shadow: 0 0 5px var(--accent-electric);
        border-color: var(--accent-electric);
    }
    50% { 
        box-shadow: 0 0 20px var(--accent-electric), 0 0 40px rgba(0, 212, 255, 0.3);
        border-color: rgba(0, 212, 255, 0.8);
    }
}

/* === NAVIGATION MOBILE PREMIUM === */
.mobile-nav {
    background: rgba(15, 20, 25, 0.8);
    backdrop-filter: blur(16px);
    border-top: 1px solid var(--border-subtle);
}

.nav-icon {
    position: relative;
    overflow: hidden;
    border-radius: 12px;
    transition: all 0.3s ease;
}

.nav-icon::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, transparent, var(--accent-electric));
    opacity: 0;
    transition: opacity 0.3s ease;
}

.nav-icon.active::before {
    opacity: 0.2;
}

.nav-icon.active {
    background: var(--bg-glass);
    box-shadow: var(--shadow-glow);
}

/* === MÉTRIQUES BRILLANTES === */
.metric-card {
    background: var(--bg-glass);
    border: 1px solid var(--border-subtle);
    border-radius: 16px;
    backdrop-filter: blur(20px);
    position: relative;
    overflow: hidden;
}

.metric-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, 
        var(--accent-electric) 0%, 
        var(--accent-green) 33%, 
        var(--accent-purple) 66%, 
        var(--accent-orange) 100%);
    opacity: 0.8;
}

.metric-value {
    color: var(--accent-electric);
    text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
    font-weight: 700;
}

/* === ALERTES ANIMÉES === */
.alert-critical {
    background: linear-gradient(135deg, #ff3b30 0%, #ff6b35 100%);
    animation: alert-pulse 1.5s infinite;
}

@keyframes alert-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

.alert-warning {
    background: linear-gradient(135deg, #ff9800 0%, #ffc107 100%);
}

.alert-info {
    background: linear-gradient(135deg, var(--accent-electric) 0%, var(--accent-purple) 100%);
}

/* === SIDEBAR MODERNE === */
.sidebar {
    background: var(--sidebar-bg);
    backdrop-filter: blur(20px);
    border-right: 1px solid var(--border-subtle);
}

.tree-node-content:hover {
    background: var(--bg-glass);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.tree-node.active > .tree-node-content {
    background: linear-gradient(135deg, var(--accent-electric) 0%, var(--accent-purple) 100%);
    color: white;
    box-shadow: var(--shadow-glow);
}

/* === INPUTS MODERNE === */
.search-input, .filter-select, .date-input {
    background: var(--bg-glass);
    border: 1px solid var(--border-subtle);
    border-radius: 12px;
    color: var(--text-primary);
    padding: 12px 16px;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
}

.search-input:focus, .filter-select:focus, .date-input:focus {
    border-color: var(--accent-electric);
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
    outline: none;
}

/* === BUTTONS PREMIUM === */
.btn {
    background: linear-gradient(135deg, var(--accent-electric) 0%, var(--accent-purple) 100%);
    border: none;
    border-radius: 12px;
    color: white;
    padding: 12px 24px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    transition: all 0.5s ease;
    transform: translate(-50%, -50%);
}

.btn:hover::before {
    width: 300px;
    height: 300px;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 212, 255, 0.4);
}

.btn-outline {
    background: transparent;
    border: 2px solid var(--accent-electric);
    color: var(--accent-electric);
}

.btn-outline:hover {
    background: var(--accent-electric);
    color: white;
    box-shadow: var(--shadow-glow);
}

/* Print Styles */
@media print {
    .sidebar,
    .header-actions,
    .page-actions,
    .content-toolbar {
        display: none !important;
    }
    
    .main-content {
        margin-left: 0 !important;
        padding: 0 !important;
    }
    
    .battery-card,
    .metric-card {
        break-inside: avoid;
        border: 1px solid #ccc !important;
    }
    
    .chart-container {
        break-inside: avoid;
    }
}
```

Cette interface web hiérarchique offre une expérience utilisateur optimale avec navigation intuitive, filtrage avancé, responsive design complet et intégration temps réel pour le système TrackingBMS.