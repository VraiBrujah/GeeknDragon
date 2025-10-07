#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fusion complète des requis dans 4 méta-modules exhaustifs
Avec estimations réalistes pour 1 développeur seul, from scratch
"""

import re

# Mapping: Anciens modules → Nouveaux méta-modules
MAPPING = {
    "MODULE 1: COMMUNICATION": [
        "MODULE 7 - COMMUNICATION",
        "MODULE 11 - CONGÉS ET ABSENCES", 
        "MODULE 16 - DEMANDES ET ÉCHANGES DE QUARTS",
        "MODULE 17 - SYSTÈME DE RECONNAISSANCE (BRAVO)",
        "Section: Messagerie, Annonces, Rapports incidents, Tableaux blancs"
    ],
    "MODULE 2: GESTION DES HORAIRES": [
        "MODULE 4 - GESTION COMPLÈTE DES HORAIRES",
        "MODULE 10 - POINTAGE ET PRÉSENCES",
        "MODULE 1 - MOTEUR DE RÈGLES (règles d'horaires)",
        "Section: Planification, Assignation, Conflits, Optimisation"
    ],
    "MODULE 3: GESTIONNAIRE (RH Opérationnel)": [
        "MODULE 2 - SÉCURITÉ / UTILISATEURS",
        "MODULE 3 - AUDIT ET TRAÇABILITÉ",
        "MODULE 9 - GESTION DES TÂCHES",
        "MODULE 12 - PAIE ET COMPTABILITÉ",
        "Section: Employés, Compétences, Certifications, Performances"
    ],
    "MODULE 4: ADMINISTRATION ET BIEN-ÊTRE": [
        "MODULE 6 - BIEN-ÊTRE AVEC IA",
        "MODULE 13 - ADMINISTRATION",
        "MODULE 5 - STATISTIQUES ET ANALYSES",
        "MODULE 15 - DASHBOARDS ET RAPPORTS",
        "MODULE 8 - GESTION DES PATIENTS (si pertinent)",
        "MODULE 18 - MULTI-TENANT",
        "MODULE 19 - ASSISTANT IA LOCAL",
        "Section: Configuration, Rapports, Analytics, Bien-être"
    ]
}

# Estimations réalistes pour from scratch, 1 dev
COMPLEXITY_MAP = {
    "Simple": {"complexity": 6, "estimate": "16-24h"},    # 2-3 jours
    "Moyen": {"complexity": 8, "estimate": "40-80h"},     # 1-2 semaines  
    "Complexe": {"complexity": 10, "estimate": "120-200h"} # 3-5 semaines
}

PRIORITY_MAP = {
    "Haute": 10,
    "Moyenne": 5,
    "Basse": 3
}

print("Mapping créé:")
for meta, sources in MAPPING.items():
    print(f"\n{meta}:")
    for src in sources:
        print(f"  ← {src}")

print("\n=== ESTIMATIONS RÉALISTES (1 dev, from scratch) ===")
for level, data in COMPLEXITY_MAP.items():
    print(f"{level}: Complexité {data['complexity']}/10, Estimation {data['estimate']}")
