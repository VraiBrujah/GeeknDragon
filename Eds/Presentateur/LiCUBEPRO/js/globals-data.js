/**
 * =================================================================
 * DONNÉES GLOBALES - VARIABLES CENTRALISÉES LI-CUBE PRO™
 * =================================================================
 * 
 * Rôle : Source de vérité unique pour toutes les variables du système
 *        Remplace GLOBALS.initial.json pour éviter les problèmes CORS
 * 
 * Variables incluses :
 * - Spécifications techniques Li-CUBE PRO™ et Ni-Cd
 * - Prix de vente et location avec nouveaux tarifs
 * - Calculs TCO pour modes vente et location
 * - Paramètres calculateur et configuration
 * 
 * @author Claude Code - EDS Québec
 * @version 2.1.0
 * @licence Propriétaire EDS Québec
 */

// Déclaration des données globales
window.GLOBALS_DATA = {
  "licube": {
    "model": "LCP-25.6V-105Ah",
    "chemistry": "LiFePO4",
    "voltage_nominal_v": 25.6,
    "capacity_ah": 105,
    "energy_total_wh": 2688,
    "energy_density_wh_per_kg": 117,
    "volumetric_density_wh_per_l": 157,
    "self_discharge_pct_per_month": 1.2,
    "efficiency_pct": 96,
    "cycle_life_at_80dod": 8000,
    "soc_operating_range_pct": [10, 90],
    "charge_current_recommended_a": 80,
    "charge_current_max_a": 100,
    "hvr_v": [27.6, 28.4],
    "hvc_v": [28.8, 29.2],
    "float_voltage_recommended_v": [25.6, 26.24],
    "discharge_current_cont_a": 105,
    "discharge_current_peak_10s_a": 210,
    "lvr_v": [23.2, 24.8],
    "lvc_v": 21.6,
    "reconnect_v": 24.0,
    "temp_charge_c": [-40, 45],
    "temp_discharge_c": [-40, 55],
    "dimensions_mm": [420, 240, 155],
    "weight_kg": 23,
    "ip_rating": "IP20",
    "ip_option": "IP65",
    "connectivity": ["Bluetooth", "Wi-Fi", "GPRS (option/location inclus)", "GPS"],
    "can_bus": "VE.CAN compatible",
    "notifications": ["Email", "SMS"],
    "price_cad_min": 5000,
    "price_cad_max": 5500,
    "service_fee_monthly_cad": 25,
    "location_price_min_monthly": 150,
    "location_price_max_monthly": 200,
    "location_installation_fee": 500,
    "warranty_years": 10,
    "weight_reduction_percentage": 71
  },
  "nicd": {
    "voltage_nominal_v": 24.0,
    "capacity_ah": 100,
    "energy_total_wh": 2400,
    "energy_density_wh_per_kg": 30,
    "volumetric_density_wh_per_l": 27,
    "cycle_life_typical": 2500,
    "charge_time_hours": [8, 12],
    "maintenance_visits_per_year": 2,
    "weight_kg": 80,
    "dimensions_mm": [600, 500, 300],
    "connectivity": [],
    "price_cad": 12000
  },
  "calculations": {
    "tco_vente": {
      "licube": {
        "purchase_price": 5500,
        "service_fee_20_years": 6000,
        "total_20_years": 11500
      },
      "nicd": {
        "total_20_years": 45000
      },
      "savings": {
        "total": 33500,
        "percentage": 74.4
      }
    },
    "tco_location": {
      "licube": {
        "monthly_fee_20_years": 48000,
        "installation_fee": 500,
        "total_20_years": 48500
      },
      "nicd": {
        "total_20_years": 45000
      },
      "savings": {
        "total": -3500,
        "percentage": -7.8
      }
    }
  },
  "calculator": {
    "analysis_period_years": 20,
    "units_count": 1,
    "maintenance_factor": 1.0
  },
  "mode": {
    "vente": {
      "monitoring_included": false
    },
    "location": {
      "monitoring_included": true
    }
  }
};

// Log de confirmation du chargement
console.log('✅ GLOBALS_DATA chargé:', Object.keys(window.GLOBALS_DATA).length, 'sections');
console.log('📊 Prix Li-CUBE (vente):', window.GLOBALS_DATA.licube.price_cad_max, 'CAD');
console.log('💰 TCO vente 20 ans:', window.GLOBALS_DATA.calculations.tco_vente.licube.total_20_years, 'CAD');
console.log('💸 Économies vente:', window.GLOBALS_DATA.calculations.tco_vente.savings.percentage + '%');

// Notification de disponibilité
window.dispatchEvent(new CustomEvent('globals-data-loaded', {
  detail: { data: window.GLOBALS_DATA }
}));