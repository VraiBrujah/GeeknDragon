# Modèles ML Premium pour Analytics TrackingBMS
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import mlflow
import mlflow.sklearn
from datetime import datetime, timedelta
import asyncio
import aioredis
import logging

logger = logging.getLogger(__name__)

class BatteryAnalyticsEngine:
    """Moteur d'analytics premium pour batteries avec ML"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.redis_client = None
        self.model_version = "1.0.0"
        
    async def initialize(self):
        """Initialisation async du moteur"""
        self.redis_client = await aioredis.from_url("redis://localhost:6379")
        await self.load_models()
        logger.info("Moteur analytics initialisé")
        
    async def load_models(self):
        """Chargement des modèles ML pré-entraînés"""
        try:
            self.models['life_prediction'] = joblib.load('models/battery_life_prediction.pkl')
            self.models['anomaly_detection'] = joblib.load('models/anomaly_detection.pkl')
            self.models['efficiency_optimization'] = joblib.load('models/efficiency_model.pkl')
            
            self.scalers['features'] = joblib.load('models/feature_scaler.pkl')
            self.scalers['targets'] = joblib.load('models/target_scaler.pkl')
            
            logger.info("Modèles ML chargés avec succès")
        except FileNotFoundError:
            logger.warning("Modèles non trouvés, initialisation avec défauts")
            await self.initialize_default_models()
    
    async def initialize_default_models(self):
        """Initialisation des modèles par défaut"""
        self.models['life_prediction'] = RandomForestRegressor(n_estimators=100)
        self.models['anomaly_detection'] = IsolationForest(contamination=0.1)
        self.scalers['features'] = StandardScaler()
        self.scalers['targets'] = StandardScaler()
    
    def prepare_features(self, battery_data):
        """Préparation des features pour ML"""
        features = pd.DataFrame(battery_data)
        
        # Features électriques avancées
        features['voltage_stability'] = features['voltage'].rolling(10).std()
        features['current_efficiency'] = features['power'] / (features['voltage'] * features['current'])
        features['power_density'] = features['power'] / features['capacity']
        
        # Features thermiques
        features['thermal_stress'] = np.where(features['temperature'] > 40, 1, 0)
        features['temp_gradient'] = features['temperature'].diff().fillna(0)
        
        # Features temporelles
        features['hour'] = pd.to_datetime(features['timestamp']).dt.hour
        features['day_of_week'] = pd.to_datetime(features['timestamp']).dt.dayofweek
        features['is_weekend'] = features['day_of_week'].isin([5, 6]).astype(int)
        
        # Features de cycle
        features['charge_rate'] = features['current'] / features['capacity']
        features['discharge_depth'] = (100 - features['soc']).clip(0, 100)
        
        # Features de santé
        features['soh_decline_rate'] = features['soh'].diff().fillna(0)
        features['degradation_acceleration'] = features['soh_decline_rate'].diff().fillna(0)
        
        return features.fillna(0)
    
    async def predict_remaining_life(self, battery_id, current_metrics):
        """Prédiction durée de vie restante avec ML"""
        try:
            # Préparation des données
            features_df = self.prepare_features([current_metrics])
            features_scaled = self.scalers['features'].transform(features_df.select_dtypes(include=[np.number]))
            
            # Prédiction
            if 'life_prediction' in self.models:
                remaining_days = self.models['life_prediction'].predict(features_scaled)[0]
                
                # Calcul de la confiance
                if hasattr(self.models['life_prediction'], 'estimators_'):
                    predictions = [tree.predict(features_scaled)[0] 
                                 for tree in self.models['life_prediction'].estimators_]
                    confidence = 1 - (np.std(predictions) / np.mean(predictions))
                else:
                    confidence = 0.8  # Valeur par défaut
                    
                # Classification du risque
                risk_level = self._calculate_risk_level(remaining_days)
                
                result = {
                    'battery_id': battery_id,
                    'remaining_days': max(0, int(remaining_days)),
                    'confidence': float(confidence),
                    'risk_level': risk_level,
                    'predicted_eol_date': (datetime.now() + timedelta(days=int(remaining_days))).isoformat(),
                    'model_version': self.model_version
                }
                
                # Cache dans Redis
                await self.redis_client.setex(
                    f"prediction:{battery_id}",
                    3600,  # 1 heure
                    str(result)
                )
                
                return result
            else:
                return self._default_prediction(battery_id, current_metrics)
                
        except Exception as e:
            logger.error(f"Erreur prédiction durée de vie: {e}")
            return self._default_prediction(battery_id, current_metrics)
    
    async def detect_anomalies(self, battery_id, metrics_history):
        """Détection d'anomalies en temps réel"""
        try:
            # Préparation des données
            features_df = self.prepare_features(metrics_history)
            features_scaled = self.scalers['features'].transform(features_df.select_dtypes(include=[np.number]))
            
            if 'anomaly_detection' in self.models:
                # Score d'anomalie
                anomaly_scores = self.models['anomaly_detection'].decision_function(features_scaled)
                is_anomaly = self.models['anomaly_detection'].predict(features_scaled) == -1
                
                # Détection des patterns anormaux spécifiques
                specific_anomalies = self._detect_specific_anomalies(features_df)
                
                result = {
                    'battery_id': battery_id,
                    'anomaly_scores': anomaly_scores.tolist(),
                    'is_anomaly': is_anomaly.tolist(),
                    'anomaly_types': specific_anomalies,
                    'severity': self._calculate_anomaly_severity(anomaly_scores),
                    'timestamp': datetime.now().isoformat()
                }
                
                # Alerte si anomalie critique
                if any(is_anomaly) and result['severity'] == 'HIGH':
                    await self._send_anomaly_alert(battery_id, result)
                
                return result
            else:
                return self._default_anomaly_detection(battery_id, metrics_history)
                
        except Exception as e:
            logger.error(f"Erreur détection anomalies: {e}")
            return self._default_anomaly_detection(battery_id, metrics_history)
    
    async def optimize_efficiency(self, battery_data, operational_params):
        """Optimisation de l'efficacité énergétique"""
        try:
            # Préparation des features
            features_df = self.prepare_features(battery_data)
            
            # Ajout des paramètres opérationnels
            features_df['charge_rate_setting'] = operational_params.get('charge_rate', 1.0)
            features_df['discharge_limit'] = operational_params.get('discharge_limit', 20.0)
            features_df['temperature_control'] = operational_params.get('temp_control', 25.0)
            
            if 'efficiency_optimization' in self.models:
                features_scaled = self.scalers['features'].transform(features_df.select_dtypes(include=[np.number]))
                efficiency_prediction = self.models['efficiency_optimization'].predict(features_scaled)[0]
                
                # Génération de recommandations
                recommendations = await self._generate_efficiency_recommendations(
                    features_df, efficiency_prediction, operational_params
                )
                
                return {
                    'predicted_efficiency': float(efficiency_prediction),
                    'current_efficiency': operational_params.get('current_efficiency', 0.85),
                    'improvement_potential': float(efficiency_prediction - operational_params.get('current_efficiency', 0.85)),
                    'recommendations': recommendations,
                    'estimated_savings_kwh': self._calculate_energy_savings(efficiency_prediction, operational_params)
                }
            else:
                return await self._default_efficiency_optimization(battery_data, operational_params)
                
        except Exception as e:
            logger.error(f"Erreur optimisation efficacité: {e}")
            return await self._default_efficiency_optimization(battery_data, operational_params)
    
    async def generate_business_insights(self, client_data, timeframe_days=30):
        """Génération d'insights business avec BI"""
        try:
            insights = {
                'financial_metrics': await self._calculate_financial_metrics(client_data, timeframe_days),
                'operational_kpis': await self._calculate_operational_kpis(client_data, timeframe_days),
                'predictive_maintenance': await self._analyze_maintenance_needs(client_data),
                'sustainability_metrics': await self._calculate_sustainability_metrics(client_data),
                'benchmarking': await self._generate_benchmarking_data(client_data),
                'recommendations': await self._generate_business_recommendations(client_data)
            }
            
            return insights
            
        except Exception as e:
            logger.error(f"Erreur génération insights: {e}")
            return self._default_business_insights()
    
    async def _calculate_financial_metrics(self, client_data, timeframe_days):
        """Calcul des métriques financières"""
        total_energy = sum([battery['energy_consumed'] for battery in client_data['batteries']])
        energy_cost = total_energy * client_data['energy_rate_per_kwh']
        
        # Calcul du ROI basé sur les économies de maintenance
        maintenance_savings = len(client_data['batteries']) * 100 * (timeframe_days / 365)  # $100/batterie/an économisé
        
        roi = ((maintenance_savings - energy_cost) / client_data['initial_investment']) * 100 if client_data['initial_investment'] > 0 else 0
        
        return {
            'total_energy_cost': energy_cost,
            'maintenance_savings': maintenance_savings,
            'roi_percent': roi,
            'payback_period_months': (client_data['initial_investment'] / maintenance_savings * 12) if maintenance_savings > 0 else float('inf')
        }
    
    async def _calculate_operational_kpis(self, client_data, timeframe_days):
        """Calcul des KPIs opérationnels"""
        batteries = client_data['batteries']
        
        avg_soh = np.mean([b['soh'] for b in batteries])
        avg_efficiency = np.mean([b['efficiency'] for b in batteries])
        critical_count = len([b for b in batteries if b['soh'] < 70])
        
        return {
            'average_soh': avg_soh,
            'average_efficiency': avg_efficiency,
            'critical_batteries': critical_count,
            'fleet_reliability': (len(batteries) - critical_count) / len(batteries) * 100,
            'total_uptime': np.mean([b['uptime_percent'] for b in batteries])
        }
    
    def _calculate_risk_level(self, remaining_days):
        """Classification du niveau de risque"""
        if remaining_days < 30:
            return "HIGH"
        elif remaining_days < 90:
            return "MEDIUM"
        else:
            return "LOW"
    
    def _detect_specific_anomalies(self, features_df):
        """Détection d'anomalies spécifiques"""
        anomalies = []
        
        # Voltage anormal
        if 'voltage' in features_df.columns:
            if (features_df['voltage'] < 2.5).any() or (features_df['voltage'] > 4.2).any():
                anomalies.append("VOLTAGE_OUT_OF_RANGE")
        
        # Température critique
        if 'temperature' in features_df.columns:
            if (features_df['temperature'] > 50).any():
                anomalies.append("CRITICAL_TEMPERATURE")
        
        # Dégradation rapide
        if 'soh_decline_rate' in features_df.columns:
            if (features_df['soh_decline_rate'] < -0.5).any():  # Perte SOH > 0.5% rapidement
                anomalies.append("RAPID_DEGRADATION")
        
        return anomalies
    
    def _calculate_anomaly_severity(self, scores):
        """Calcul de la sévérité d'anomalie"""
        min_score = np.min(scores)
        if min_score < -0.5:
            return "HIGH"
        elif min_score < -0.2:
            return "MEDIUM"
        else:
            return "LOW"
    
    async def _send_anomaly_alert(self, battery_id, anomaly_result):
        """Envoi d'alerte anomalie critique"""
        alert = {
            'battery_id': battery_id,
            'alert_type': 'CRITICAL_ANOMALY',
            'severity': anomaly_result['severity'],
            'anomaly_types': anomaly_result['anomaly_types'],
            'timestamp': anomaly_result['timestamp']
        }
        
        # Publier dans Redis pour notifications en temps réel
        await self.redis_client.publish('alerts:critical', str(alert))
        logger.warning(f"Anomalie critique détectée sur batterie {battery_id}: {anomaly_result['anomaly_types']}")
    
    async def _generate_efficiency_recommendations(self, features_df, predicted_efficiency, params):
        """Génération de recommandations d'efficacité"""
        recommendations = []
        
        # Analyse température
        avg_temp = features_df['temperature'].mean()
        if avg_temp > 35:
            recommendations.append({
                'category': 'THERMAL_MANAGEMENT',
                'suggestion': 'Améliorer le refroidissement - température moyenne trop élevée',
                'potential_gain': 0.05,
                'priority': 'HIGH'
            })
        
        # Analyse charge/décharge
        avg_charge_rate = features_df.get('charge_rate', pd.Series([1.0])).mean()
        if avg_charge_rate > 2.0:
            recommendations.append({
                'category': 'CHARGE_OPTIMIZATION',
                'suggestion': 'Réduire le taux de charge pour prolonger la durée de vie',
                'potential_gain': 0.03,
                'priority': 'MEDIUM'
            })
        
        # SOC management
        min_soc = features_df['soc'].min()
        if min_soc < 20:
            recommendations.append({
                'category': 'SOC_MANAGEMENT',
                'suggestion': 'Éviter les décharges profondes (<20% SOC)',
                'potential_gain': 0.08,
                'priority': 'HIGH'
            })
        
        return recommendations
    
    def _calculate_energy_savings(self, predicted_efficiency, params):
        """Calcul des économies d'énergie estimées"""
        current_efficiency = params.get('current_efficiency', 0.85)
        capacity = params.get('capacity', 100)  # kWh
        daily_cycles = params.get('daily_cycles', 1)
        
        efficiency_gain = predicted_efficiency - current_efficiency
        daily_savings = capacity * daily_cycles * efficiency_gain
        
        return max(0, daily_savings)
    
    def _default_prediction(self, battery_id, metrics):
        """Prédiction par défaut si modèle indisponible"""
        soh = metrics.get('soh', 100)
        # Estimation simple basée sur SOH
        remaining_days = int((soh - 70) * 10) if soh > 70 else 0
        
        return {
            'battery_id': battery_id,
            'remaining_days': remaining_days,
            'confidence': 0.6,
            'risk_level': self._calculate_risk_level(remaining_days),
            'predicted_eol_date': (datetime.now() + timedelta(days=remaining_days)).isoformat(),
            'model_version': 'default'
        }
    
    def _default_anomaly_detection(self, battery_id, metrics_history):
        """Détection d'anomalies par défaut"""
        return {
            'battery_id': battery_id,
            'anomaly_scores': [0.0] * len(metrics_history),
            'is_anomaly': [False] * len(metrics_history),
            'anomaly_types': [],
            'severity': 'LOW',
            'timestamp': datetime.now().isoformat()
        }
    
    async def _default_efficiency_optimization(self, battery_data, params):
        """Optimisation d'efficacité par défaut"""
        current_eff = params.get('current_efficiency', 0.85)
        return {
            'predicted_efficiency': current_eff + 0.02,
            'current_efficiency': current_eff,
            'improvement_potential': 0.02,
            'recommendations': [
                {
                    'category': 'GENERAL',
                    'suggestion': 'Optimiser les cycles de charge',
                    'potential_gain': 0.02,
                    'priority': 'MEDIUM'
                }
            ],
            'estimated_savings_kwh': 1.0
        }
    
    def _default_business_insights(self):
        """Insights business par défaut"""
        return {
            'financial_metrics': {
                'total_energy_cost': 0,
                'maintenance_savings': 0,
                'roi_percent': 0,
                'payback_period_months': 0
            },
            'operational_kpis': {
                'average_soh': 85,
                'average_efficiency': 85,
                'critical_batteries': 0,
                'fleet_reliability': 95,
                'total_uptime': 98
            },
            'predictive_maintenance': [],
            'sustainability_metrics': {},
            'benchmarking': {},
            'recommendations': []
        }

# Classe utilitaire pour streaming analytics
class StreamingAnalytics:
    """Analytics en temps réel avec processing stream"""
    
    def __init__(self, analytics_engine):
        self.engine = analytics_engine
        self.processing_queue = asyncio.Queue()
        
    async def process_stream(self):
        """Traitement du flux de données temps réel"""
        while True:
            try:
                battery_data = await self.processing_queue.get()
                
                # Traitement analytics
                predictions = await self.engine.predict_remaining_life(
                    battery_data['battery_id'], 
                    battery_data['metrics']
                )
                
                anomalies = await self.engine.detect_anomalies(
                    battery_data['battery_id'],
                    battery_data['history']
                )
                
                # Publication des résultats
                await self._publish_results(battery_data['battery_id'], {
                    'predictions': predictions,
                    'anomalies': anomalies
                })
                
            except Exception as e:
                logger.error(f"Erreur processing stream: {e}")
                await asyncio.sleep(1)
    
    async def _publish_results(self, battery_id, results):
        """Publication des résultats analytics"""
        await self.engine.redis_client.publish(
            f'analytics:results:{battery_id}', 
            str(results)
        )

if __name__ == "__main__":
    # Test du moteur analytics
    async def test_analytics():
        engine = BatteryAnalyticsEngine()
        await engine.initialize()
        
        # Test data
        test_metrics = {
            'voltage': 3.7,
            'current': 2.5,
            'soc': 85,
            'soh': 92,
            'temperature': 25,
            'power': 9.25,
            'capacity': 100,
            'timestamp': datetime.now().isoformat()
        }
        
        # Test prédiction
        prediction = await engine.predict_remaining_life('test_battery_1', test_metrics)
        print(f"Prédiction durée de vie: {prediction}")
        
        # Test détection anomalies
        history = [test_metrics] * 10  # Simuler historique
        anomalies = await engine.detect_anomalies('test_battery_1', history)
        print(f"Détection anomalies: {anomalies}")
    
    asyncio.run(test_analytics())