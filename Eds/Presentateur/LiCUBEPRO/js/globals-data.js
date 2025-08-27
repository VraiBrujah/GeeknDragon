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
    "model": "LCP-24V-105Ah",
    "chemistry": "LiFePO4 (Lithium Fer Phosphate)",
    "voltage_nominal_v": 24.0,
    "capacity_ah": 105,
    "energy_total_wh": 2520,
    "energy_density_wh_per_kg": 110,
    "volumetric_density_wh_per_l": 161,
    "dod_usable_percentage": 96,
    "efficiency_pct": 96,
    "cycle_life_at_80dod": 8000,
    "cycle_life": 8000,
    "lifespan_years": 20,
    "replacements_20_years": 0,
    "soc_operating_range_pct": [10, 90],
    "charge_time_hours": [1, 2],
    "charge_current_recommended_a": 100,
    "charge_current_max_a": 100,
    "temp_charge_c": [-40, 45],
    "temp_discharge_c": [-40, 55],
    "temp_auto_heating": true,
    "dimensions_mm": [420, 240, 155],
    "weight_kg": 23,
    "ip_rating": "IP20",
    "ip_option": "IP65",
    "connectivity": ["Bluetooth", "Wi-Fi", "GPRS", "GPS"],
    "monitoring_features": ["GPS", "Télémétrie", "Cloud", "Alarmes"],
    "safety_protections": ["OVP", "UVP", "OCP", "OTP", "Court-circuit"],
    "can_bus": "VE.CAN compatible",
    "certifications": ["UN38.3", "CSA", "UL1973", "UL9540A"],
    "environmental_compliance": ["RoHS", "Sans métaux lourds", "Recyclable"],
    "maintenance_required": false,
    "price_cad_min": 5000,
    "price_cad_max": 5500,
    "monitoring_monthly_cad": 25,
    "location_price_min_monthly": 150,
    "location_price_max_monthly": 200,
    "location_installation_fee": 500,
    "warranty_years": 10,
    "weight_reduction_vs_nicd_percentage": 71
  },
  "nicd": {
    "brand": "Batterie Ni-Cd industrielle (Saft)",
    "chemistry": "Nickel Cadmium (Ni-Cd)",
    "voltage_nominal_v": 24.0,
    "capacity_ah": 100,
    "energy_total_wh": 2400,
    "energy_density_wh_per_kg": 30,
    "volumetric_density_wh_per_l": 27,
    "dod_recommended_percentage": 60,
    "cycle_life_min": 2000,
    "cycle_life_max": 3000,
    "cycle_life_typical": 2500,
    "lifespan_years": 5,
    "replacements_20_years_min": 2,
    "replacements_20_years_max": 3,
    "charge_time_hours": [8, 12],
    "charge_rapid": false,
    "maintenance_required": true,
    "maintenance_visits_per_year": 2,
    "maintenance_cost_per_visit": [200, 300],
    "maintenance_cost_20_years": [8000, 12000],
    "weight_kg": 80,
    "dimensions_mm": [600, 500, 300],
    "connectivity": [],
    "safety_protections": [],
    "temp_operating_min": -50,
    "temp_operating_max": 70,
    "auto_heating": false,
    "environmental_impact": "Contient du cadmium, recyclage complexe",
    "transport_classification": "UN2795 Batteries Wet, Alkali",
    "price_cad": 12000,
    "total_units_needed_20_years_min": 3,
    "total_units_needed_20_years_max": 4
  },
  "calculations": {
    "tco_vente": {
      "licube": {
        "material_cost_min": 5000,
        "material_cost_max": 5500,
        "monitoring_optional_20_years": 6000,
        "total_without_monitoring_min": 5000,
        "total_without_monitoring_max": 5500,
        "total_with_monitoring_min": 11000,
        "total_with_monitoring_max": 11500,
        "replacements_cost": 0,
        "maintenance_cost": 0
      },
      "nicd": {
        "material_cost_min": 36000,
        "material_cost_max": 48000,
        "maintenance_cost_min": 8000,
        "maintenance_cost_max": 12000,
        "total_min": 44000,
        "total_max": 60000,
        "units_needed_min": 3,
        "units_needed_max": 4
      },
      "savings": {
        "vs_nicd_min_licube_min": 39000,
        "vs_nicd_max_licube_max": 48500,
        "percentage_min": 88.6,
        "percentage_max": 91.7,
        "roi_months": 6
      }
    },
    "tco_location": {
      "licube": {
        "monthly_min": 150,
        "monthly_max": 200,
        "installation_fee": 500,
        "total_20_years_min": 36500,
        "total_20_years_max": 48500,
        "monitoring_included": true
      },
      "nicd": {
        "equivalent_monthly_cost": 250,
        "total_20_years": 60000,
        "calculation_base": "60000 CAD / 240 mois = 250$/mois"
      },
      "savings": {
        "monthly_min": 50,
        "monthly_max": 100,
        "total_min": 11500,
        "total_max": 23500,
        "percentage_min": 19.2,
        "percentage_max": 39.2
      }
    }
  },
  "calculator": {
    "analysis_period_years": 20,
    "units_count": 1,
    "maintenance_factor": 1.0
  },
  "modes": {
    "vente": {
      "monitoring_included": false,
      "licube": {
        "price_min": 5000,
        "price_max": 5500,
        "price_display_min": "5000$*",
        "price_display_max": "5500$",
        "monitoring_optional_monthly": 25
      },
      "nicd": {
        "price_per_unit": 12000,
        "units_needed_min": 3,
        "units_needed_max": 4,
        "total_material_min": 36000,
        "total_material_max": 48000,
        "maintenance_min": 8000,
        "maintenance_max": 12000,
        "tco_total_min": 44000,
        "tco_total_max": 60000
      }
    },
    "location": {
      "monitoring_included": true,
      "licube": {
        "monthly_min": 150,
        "monthly_max": 200,
        "monthly_display_min": "150$*",
        "monthly_display_max": "200$",
        "installation_fee": 500
      },
      "nicd": {
        "equivalent_monthly_cost": 250,
        "monthly_display": "250$/mois",
        "note": "Coût équivalent basé sur TCO 20 ans (60000$ / 240 mois)"
      }
    }
  },
  "mode": {
    "vente": {
      "monitoring_included": false
    },
    "location": {
      "monitoring_included": true
    }
  },
  "battery_specs": {
    "weight_reduction_percentage": 71
  },
  "footnotes": {
    "price_minimum": "* Prix minimum affiché. Voir tableau de prix complet pour la gamme complète.",
    "tco_calculation_basis": "** TCO calculé sur 20 ans, 1 cycle/jour (7305 cycles total). Inclut matériel, maintenance et remplacements.",
    "monitoring_optional": "*** Monitoring optionnel 25$/mois (6000$ sur 20 ans).",
    "nicd_replacement_explanation": "**** Ni-Cd nécessite 2-3 remplacements sur 20 ans vs 0 pour Li-CUBE PRO.",
    "location_monitoring_included": "***** Location inclut monitoring, GPS, télémétrie et maintenance.",
    "location_comparison_nicd": "****** Ni-Cd équivalent: 60000$ TCO / 240 mois = 250$/mois vs Li-CUBE 150-200$/mois.",
    "location_savings_calculation": "******* Économies: 250$ - 150$ = 100$/mois maximum (23500$ sur 20 ans)."
  },
  "marketing_messages": {
    "vente": {
      "primary": "À partir de 5000$ seulement",
      "secondary": "89% d'économies vs Ni-Cd sur 20 ans",
      "value_prop": "0 maintenance, 0 remplacement, 20 ans de garantie"
    },
    "location": {
      "primary": "À partir de 150$/mois*",
      "secondary": "vs 250$/mois équivalent Ni-Cd",
      "value_prop": "100$/mois d'économies + monitoring inclus",
      "comparison": "150-200$/mois vs 250$/mois Ni-Cd"
    }
  }
};

// Log de confirmation du chargement
console.log('✅ GLOBALS_DATA chargé:', Object.keys(window.GLOBALS_DATA).length, 'sections');
console.log('📊 Prix Li-CUBE (vente):', window.GLOBALS_DATA.licube.price_cad_max, 'CAD');
console.log('💰 TCO vente 20 ans:', window.GLOBALS_DATA.calculations.tco_vente.licube.total_with_monitoring_max, 'CAD');
console.log('💸 Économies vente:', window.GLOBALS_DATA.calculations.tco_vente.savings.percentage_max + '%');

// Notification de disponibilité
window.dispatchEvent(new CustomEvent('globals-data-loaded', {
  detail: { data: window.GLOBALS_DATA }
}));