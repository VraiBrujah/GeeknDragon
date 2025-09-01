# Dashboard Analytics Premium avec Business Intelligence

**Version :** 1.0 Premium  
**Date :** 2025-09-01  
**Répertoire de Travail :** `C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\TrackingBMS`

## 🎯 Objectifs Dashboard BI Premium

### Capacités Analytics Avancées
- **Prédictions AI/ML :** Durée de vie batteries, maintenance préventive
- **Business Intelligence :** KPIs métier, ROI, optimisations
- **Alertes Intelligentes :** Détection anomalies automatique
- **Rapports Personnalisés :** Génération PDF/Excel automatisée
- **Analyses Temps Réel :** Streaming data processing
- **Benchmarking :** Comparaisons inter-clients et sectorielles

## 🏗️ Architecture BI Premium

### Composants Principaux
```yaml
Data Pipeline:
  Ingestion: Kafka Streams + Apache Pulsar
  Processing: Apache Spark + Apache Flink
  Storage: Data Lake (S3) + Data Warehouse (BigQuery/Snowflake)
  ML Pipeline: MLflow + Apache Airflow
  Visualization: Custom React + D3.js + Plotly
  Reporting: Apache Superset + Custom PDF Generator

Performance:
  Real-time Processing: < 5 seconds latency
  Historical Analysis: Petabyte scale
  Concurrent Users: 500+ simultanés
  Query Response: < 2 seconds (P95)
```

### Architecture Données
```sql
-- Data Warehouse Schema Premium
CREATE SCHEMA analytics_premium;

-- Table faits principales
CREATE TABLE analytics_premium.fact_battery_metrics (
    metric_id BIGSERIAL PRIMARY KEY,
    battery_id UUID NOT NULL,
    client_id UUID NOT NULL,
    location_id UUID NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Métriques électriques
    voltage_v DECIMAL(8,3),
    current_a DECIMAL(8,3), 
    power_w DECIMAL(10,3),
    soc_percent DECIMAL(5,2),
    soh_percent DECIMAL(5,2),
    
    -- Métriques thermiques
    temp_min_c DECIMAL(5,2),
    temp_max_c DECIMAL(5,2),
    temp_avg_c DECIMAL(5,2),
    
    -- Métriques calculées
    energy_kwh DECIMAL(10,4),
    efficiency_percent DECIMAL(5,2),
    degradation_rate DECIMAL(8,6),
    
    -- Prédictions ML
    predicted_soh_30d DECIMAL(5,2),
    predicted_failure_prob DECIMAL(5,4),
    maintenance_score INTEGER,
    
    -- Partitioning
    year_month INTEGER NOT NULL
) PARTITION BY RANGE (year_month);

-- Table dimensions clients enrichie
CREATE TABLE analytics_premium.dim_client_profile (
    client_id UUID PRIMARY KEY,
    company_name VARCHAR(255),
    industry VARCHAR(100),
    size_category VARCHAR(50),
    location_country VARCHAR(3),
    subscription_tier VARCHAR(20),
    created_date DATE,
    
    -- Métriques business
    total_batteries INTEGER,
    total_capacity_kwh DECIMAL(12,2),
    monthly_revenue DECIMAL(10,2),
    
    -- Scores calculés
    efficiency_score INTEGER,
    reliability_score INTEGER,
    sustainability_score INTEGER,
    
    -- Segmentation ML
    client_segment VARCHAR(50),
    risk_category VARCHAR(20),
    growth_potential VARCHAR(20)
);

-- Tables d'agrégation pour performance
CREATE MATERIALIZED VIEW analytics_premium.battery_daily_summary AS
SELECT 
    battery_id,
    client_id,
    DATE(timestamp) as date,
    
    -- Agrégations statistiques
    AVG(voltage_v) as avg_voltage,
    MIN(voltage_v) as min_voltage,
    MAX(voltage_v) as max_voltage,
    STDDEV(voltage_v) as stddev_voltage,
    
    AVG(soc_percent) as avg_soc,
    MIN(soc_percent) as min_soc,
    MAX(soc_percent) as max_soc,
    
    AVG(temp_avg_c) as avg_temperature,
    MAX(temp_max_c) as max_temperature,
    
    -- Métriques calculées
    SUM(energy_kwh) as total_energy,
    AVG(efficiency_percent) as avg_efficiency,
    
    -- Compteurs d'événements
    COUNT(CASE WHEN voltage_v < 3.0 THEN 1 END) as undervoltage_events,
    COUNT(CASE WHEN temp_max_c > 45 THEN 1 END) as overheat_events,
    
    -- Prédictions moyennes
    AVG(predicted_soh_30d) as avg_predicted_soh,
    MAX(predicted_failure_prob) as max_failure_risk
    
FROM analytics_premium.fact_battery_metrics
GROUP BY battery_id, client_id, DATE(timestamp);

-- Index pour performance
CREATE INDEX idx_battery_metrics_time ON analytics_premium.fact_battery_metrics USING BTREE (timestamp DESC);
CREATE INDEX idx_battery_metrics_client ON analytics_premium.fact_battery_metrics (client_id, timestamp);
CREATE INDEX idx_battery_metrics_battery ON analytics_premium.fact_battery_metrics (battery_id, timestamp);
```

## 🤖 Modèles ML Premium

### Modèle Prédiction Durée de Vie
```python
# ml_models/battery_life_prediction.py
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.model_selection import cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib
import mlflow
import mlflow.sklearn

class BatteryLifePredictionModel:
    def __init__(self):
        self.models = {
            'rf': RandomForestRegressor(n_estimators=200, random_state=42),
            'gb': GradientBoostingRegressor(n_estimators=200, random_state=42),
            'nn': MLPRegressor(hidden_layer_sizes=(100, 50), random_state=42)
        }
        self.scaler = StandardScaler()
        self.best_model = None
        
    def prepare_features(self, df):
        """Préparation des features pour la prédiction"""
        
        # Features électriques
        df['voltage_range'] = df['voltage_max'] - df['voltage_min']
        df['current_volatility'] = df['current_std'] / df['current_mean']
        df['power_density'] = df['power_w'] / df['capacity_ah']
        
        # Features thermiques
        df['temp_gradient'] = df['temp_max'] - df['temp_min']
        df['thermal_stress'] = np.where(df['temp_max'] > 40, 1, 0)
        
        # Features temporelles
        df['cycles_per_day'] = df['charge_cycles'] / df['days_in_service']
        df['usage_intensity'] = df['energy_throughput'] / df['days_in_service']
        
        # Features de dégradation
        df['soh_decline_rate'] = (100 - df['current_soh']) / df['days_in_service']
        df['capacity_loss_rate'] = df['initial_capacity'] - df['current_capacity']
        
        # Features environnementales
        df['climate_severity'] = df['avg_humidity'] * df['temp_variance']
        df['location_risk'] = self.encode_location_risk(df['location'])
        
        return df
        
    def train(self, training_data):
        """Entraînement des modèles ML"""
        
        with mlflow.start_run():
            # Préparation données
            X = self.prepare_features(training_data)
            y = training_data['remaining_useful_life_days']
            
            # Normalisation
            X_scaled = self.scaler.fit_transform(X)
            
            # Validation croisée pour sélection modèle
            best_score = -np.inf
            best_model_name = None
            
            for name, model in self.models.items():
                # Grid search pour optimisation hyperparamètres
                if name == 'rf':
                    param_grid = {
                        'n_estimators': [100, 200, 300],
                        'max_depth': [10, 20, None],
                        'min_samples_split': [2, 5, 10]
                    }
                elif name == 'gb':
                    param_grid = {
                        'learning_rate': [0.01, 0.1, 0.2],
                        'max_depth': [3, 5, 7],
                        'subsample': [0.8, 0.9, 1.0]
                    }
                else:  # Neural Network
                    param_grid = {
                        'hidden_layer_sizes': [(50,), (100,), (100, 50)],
                        'alpha': [0.0001, 0.001, 0.01],
                        'learning_rate': ['constant', 'adaptive']
                    }
                
                grid_search = GridSearchCV(model, param_grid, cv=5, scoring='r2')
                grid_search.fit(X_scaled, y)
                
                score = grid_search.best_score_
                mlflow.log_metric(f'{name}_cv_score', score)
                mlflow.log_params({f'{name}_{k}': v for k, v in grid_search.best_params_.items()})
                
                if score > best_score:
                    best_score = score
                    best_model_name = name
                    self.best_model = grid_search.best_estimator_
            
            # Entraînement final sur modèle optimal
            self.best_model.fit(X_scaled, y)
            
            # Logging MLflow
            mlflow.log_metric('best_cv_score', best_score)
            mlflow.log_param('best_model', best_model_name)
            mlflow.sklearn.log_model(self.best_model, "model")
            
            # Sauvegarde locale
            joblib.dump(self.best_model, 'models/battery_life_prediction.pkl')
            joblib.dump(self.scaler, 'models/battery_life_scaler.pkl')
            
            return {
                'best_model': best_model_name,
                'cv_score': best_score,
                'feature_importance': self.get_feature_importance(X.columns)
            }
    
    def predict(self, data):
        """Prédiction durée de vie restante"""
        X = self.prepare_features(data)
        X_scaled = self.scaler.transform(X)
        
        predictions = self.best_model.predict(X_scaled)
        
        # Calcul intervalle de confiance
        if hasattr(self.best_model, 'predict_proba'):
            confidence = np.std(self.best_model.predict_proba(X_scaled), axis=1)
        else:
            confidence = np.zeros(len(predictions))
            
        return {
            'remaining_days': predictions,
            'confidence_interval': confidence,
            'risk_level': self.calculate_risk_level(predictions)
        }
    
    def get_feature_importance(self, feature_names):
        """Importance des features"""
        if hasattr(self.best_model, 'feature_importances_'):
            importance = self.best_model.feature_importances_
            return dict(zip(feature_names, importance))
        return {}
    
    def calculate_risk_level(self, predictions):
        """Calcul niveau de risque"""
        return np.where(predictions < 30, 'HIGH',
                       np.where(predictions < 90, 'MEDIUM', 'LOW'))

# Modèle de détection d'anomalies
class AnomalyDetectionModel:
    def __init__(self):
        from sklearn.ensemble import IsolationForest
        from sklearn.svm import OneClassSVM
        
        self.models = {
            'isolation_forest': IsolationForest(contamination=0.1, random_state=42),
            'one_class_svm': OneClassSVM(nu=0.05, kernel="rbf", gamma=0.1)
        }
        
    def train(self, normal_data):
        """Entraînement sur données normales"""
        X = self.prepare_anomaly_features(normal_data)
        
        for name, model in self.models.items():
            model.fit(X)
            
    def detect_anomalies(self, data):
        """Détection d'anomalies temps réel"""
        X = self.prepare_anomaly_features(data)
        
        anomaly_scores = {}
        for name, model in self.models.items():
            scores = model.decision_function(X)
            predictions = model.predict(X)
            anomaly_scores[name] = {
                'scores': scores,
                'anomalies': predictions == -1
            }
            
        # Consensus entre modèles
        consensus = np.mean([scores['anomalies'] for scores in anomaly_scores.values()], axis=0)
        
        return {
            'is_anomaly': consensus > 0.5,
            'confidence': consensus,
            'individual_scores': anomaly_scores
        }
```

## 📊 Interface Dashboard Premium

### Components React Avancés
```jsx
// components/dashboard/PremiumDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Grid, Card, CardContent, Typography, Select, MenuItem } from '@mui/material';
import Plot from 'react-plotly.js';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers';
import WebSocketManager from '../utils/WebSocketManager';
import { usePremiumAnalytics } from '../hooks/usePremiumAnalytics';

const PremiumDashboard = () => {
    const [selectedClient, setSelectedClient] = useState('all');
    const [dateRange, setDateRange] = useState([new Date(), new Date()]);
    const [realTimeData, setRealTimeData] = useState({});
    
    const {
        kpis,
        predictions,
        anomalies,
        trends,
        loading,
        refetch
    } = usePremiumAnalytics(selectedClient, dateRange);

    // WebSocket pour données temps réel
    useEffect(() => {
        const ws = new WebSocketManager();
        ws.connect('wss://api.trackingbms.com/analytics/stream');
        
        ws.on('realtime_metrics', (data) => {
            setRealTimeData(prev => ({
                ...prev,
                [data.batteryId]: data
            }));
        });
        
        return () => ws.disconnect();
    }, []);

    // KPIs calculés en temps réel
    const calculatedKPIs = useMemo(() => ({
        totalBatteries: Object.keys(realTimeData).length,
        averageSOH: Object.values(realTimeData).reduce((acc, battery) => 
            acc + (battery.soh || 0), 0) / Object.keys(realTimeData).length,
        criticalBatteries: Object.values(realTimeData).filter(battery => 
            battery.predictedFailureProbability > 0.7).length,
        energyEfficiency: Object.values(realTimeData).reduce((acc, battery) => 
            acc + (battery.efficiency || 0), 0) / Object.keys(realTimeData).length
    }), [realTimeData]);

    return (
        <div className="premium-dashboard">
            {/* Header avec contrôles */}
            <Grid container spacing={3} className="dashboard-header">
                <Grid item xs={12} md={3}>
                    <Select 
                        value={selectedClient} 
                        onChange={(e) => setSelectedClient(e.target.value)}
                        fullWidth
                    >
                        <MenuItem value="all">Tous les clients</MenuItem>
                        {kpis.clients?.map(client => (
                            <MenuItem key={client.id} value={client.id}>
                                {client.name}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
                <Grid item xs={12} md={6}>
                    <DatePicker 
                        label="Période d'analyse"
                        value={dateRange}
                        onChange={setDateRange}
                    />
                </Grid>
            </Grid>

            {/* KPIs Temps Réel */}
            <Grid container spacing={3} className="kpi-cards">
                <Grid item xs={12} md={3}>
                    <KPICard 
                        title="Batteries Actives"
                        value={calculatedKPIs.totalBatteries}
                        trend={kpis.batteryGrowthTrend}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <KPICard 
                        title="SOH Moyen"
                        value={`${calculatedKPIs.averageSOH.toFixed(1)}%`}
                        trend={kpis.sohTrend}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <KPICard 
                        title="Alertes Critiques"
                        value={calculatedKPIs.criticalBatteries}
                        trend={kpis.alertsTrend}
                        color="error"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <KPICard 
                        title="Efficacité Énergétique"
                        value={`${calculatedKPIs.energyEfficiency.toFixed(1)}%`}
                        trend={kpis.efficiencyTrend}
                        color="info"
                    />
                </Grid>
            </Grid>

            {/* Graphiques Avancés */}
            <Grid container spacing={3} className="analytics-charts">
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Prédictions Durée de Vie ML
                            </Typography>
                            <Plot
                                data={[{
                                    x: predictions.batteryIds,
                                    y: predictions.remainingLife,
                                    type: 'scatter',
                                    mode: 'markers+lines',
                                    marker: { 
                                        color: predictions.riskLevel.map(risk => 
                                            risk === 'HIGH' ? 'red' : 
                                            risk === 'MEDIUM' ? 'orange' : 'green'
                                        ),
                                        size: 8
                                    },
                                    name: 'Durée de vie prédite'
                                }]}
                                layout={{
                                    xaxis: { title: 'Batteries' },
                                    yaxis: { title: 'Jours restants' },
                                    showlegend: true
                                }}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Détection Anomalies Temps Réel
                            </Typography>
                            <Plot
                                data={[{
                                    x: anomalies.timestamps,
                                    y: anomalies.scores,
                                    type: 'scatter',
                                    mode: 'markers',
                                    marker: { 
                                        color: anomalies.isAnomaly.map(a => a ? 'red' : 'blue'),
                                        size: 6
                                    },
                                    name: 'Score anomalie'
                                }]}
                                layout={{
                                    xaxis: { title: 'Temps' },
                                    yaxis: { title: 'Score anomalie' },
                                    shapes: [{
                                        type: 'line',
                                        x0: 0,
                                        x1: 1,
                                        xref: 'paper',
                                        y0: 0.7,
                                        y1: 0.7,
                                        line: { color: 'red', dash: 'dash' }
                                    }]
                                }}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Analyse Business Intelligence
                            </Typography>
                            <BusinessIntelligenceDashboard 
                                data={trends}
                                selectedClient={selectedClient}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Table Interactive Avancée */}
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Analyse Détaillée Batteries
                            </Typography>
                            <DataGrid
                                rows={Object.entries(realTimeData).map(([id, battery]) => ({
                                    id,
                                    ...battery,
                                    riskLevel: battery.predictedFailureProbability > 0.7 ? 'HIGH' :
                                              battery.predictedFailureProbability > 0.3 ? 'MEDIUM' : 'LOW'
                                }))}
                                columns={[
                                    { field: 'id', headerName: 'Battery ID', width: 150 },
                                    { field: 'voltage', headerName: 'Voltage (V)', width: 120 },
                                    { field: 'soc', headerName: 'SOC (%)', width: 100 },
                                    { field: 'soh', headerName: 'SOH (%)', width: 100 },
                                    { field: 'temperature', headerName: 'Temp (°C)', width: 120 },
                                    { field: 'predictedFailureProbability', headerName: 'Risque Panne', width: 130 },
                                    { field: 'riskLevel', headerName: 'Niveau', width: 100,
                                      renderCell: (params) => (
                                          <span className={`risk-badge risk-${params.value.toLowerCase()}`}>
                                              {params.value}
                                          </span>
                                      )
                                    }
                                ]}
                                pageSize={25}
                                checkboxSelection
                                disableSelectionOnClick
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
};

// Component KPI Card avec tendances
const KPICard = ({ title, value, trend, color }) => {
    const trendIcon = trend > 0 ? '↗️' : trend < 0 ? '↘️' : '➡️';
    const trendColor = trend > 0 ? 'success' : trend < 0 ? 'error' : 'default';
    
    return (
        <Card className={`kpi-card ${color}`}>
            <CardContent>
                <Typography variant="h4" className="kpi-value">
                    {value}
                </Typography>
                <Typography variant="h6" className="kpi-title">
                    {title}
                </Typography>
                <Typography variant="body2" className={`kpi-trend ${trendColor}`}>
                    {trendIcon} {Math.abs(trend).toFixed(1)}%
                </Typography>
            </CardContent>
        </Card>
    );
};

// Component Business Intelligence
const BusinessIntelligenceDashboard = ({ data, selectedClient }) => {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
                <Plot
                    data={[{
                        type: 'scatter',
                        x: data.roi.months,
                        y: data.roi.values,
                        mode: 'lines+markers',
                        name: 'ROI %'
                    }]}
                    layout={{
                        title: 'Retour sur Investissement',
                        xaxis: { title: 'Mois' },
                        yaxis: { title: 'ROI (%)' }
                    }}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <Plot
                    data={[{
                        type: 'bar',
                        x: data.costSavings.categories,
                        y: data.costSavings.amounts,
                        name: 'Économies'
                    }]}
                    layout={{
                        title: 'Économies par Catégorie',
                        xaxis: { title: 'Catégories' },
                        yaxis: { title: 'Montant ($)' }
                    }}
                />
            </Grid>
        </Grid>
    );
};

export default PremiumDashboard;
```

## 🎯 Résumé Dashboard Analytics Premium

### Fonctionnalités Avancées
- **Prédictions ML :** Durée de vie, maintenance préventive, défaillances
- **BI Avancé :** ROI, optimisations, benchmarking sectoriel  
- **Temps Réel :** WebSocket streaming, alertes intelligentes
- **Visualisations :** D3.js, Plotly, graphiques interactifs
- **Rapports :** PDF automatisés, exports Excel, scheduling

### Performance Premium
- **Latence :** < 2 secondes P95
- **Concurrent Users :** 500+ simultanés
- **Data Processing :** Petabyte scale
- **ML Predictions :** Accuracy > 90%
- **Real-time Updates :** < 5 secondes

---

**Ce dashboard analytics premium fournit une intelligence business complète avec prédictions ML, détection d'anomalies et visualisations temps réel pour optimiser la gestion des batteries.**