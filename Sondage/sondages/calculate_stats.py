#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Calculer statistiques complètes du sondage ORIA MVP
"""

import re

with open('SONDAGE_ORIA_MVP_4_MODULES.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Structures pour stocker les données
modules = {
    'COM': {'name': 'Communication', 'sections': 0, 'requis': []},
    'HOR': {'name': 'Gestion des Horaires', 'sections': 0, 'requis': []},
    'GES': {'name': 'Gestionnaire (RH)', 'sections': 0, 'requis': []},
    'ADM': {'name': 'Administration (Core)', 'sections': 0, 'requis': []},
    'BET': {'name': 'Bien-être Employés', 'sections': 0, 'requis': []},
    'PAY': {'name': 'Paie et Comptabilité', 'sections': 0, 'requis': []},
}

# Parser chaque ligne de requis
for line in lines:
    # Simplifier le regex pour capturer juste ce dont on a besoin
    match = re.match(r'^\|\s*(COM|HOR|GES|ADM|BET|PAY)-(\d+)\s*\|', line)
    if match:
        prefix = match.group(1)
        req_id = int(match.group(2))

        # Extraire les colonnes en splittant par |
        parts = line.split('|')
        if len(parts) < 13:
            continue

        # Colonnes: [0=vide, 1=ID, 2=Desc, 3=MVP, 4-9=Roles, 10=Prio, 11=Complex, 12=Est, 13=Notes]
        try:
            priorite = int(parts[10].strip())
            complexite = int(parts[11].strip())
            estimation_str = parts[12].strip()

            # Parser estimation (format: 8-16h ou 120-160h)
            est_match = re.match(r'(\d+)-(\d+)', estimation_str)
            if est_match:
                est_min = int(est_match.group(1))
                est_max = int(est_match.group(2))
            else:
                est_min = est_max = 0

            modules[prefix]['requis'].append({
                'id': req_id,
                'priorite': priorite,
                'complexite': complexite,
                'est_min': est_min,
                'est_max': est_max
            })
        except (ValueError, IndexError):
            # Ignorer lignes mal formées
            pass

# Compter sections par module (basé sur les tranches de numérotation)
for prefix, module_data in modules.items():
    requis_ids = [r['id'] for r in module_data['requis']]
    if requis_ids:
        # Compter les séries de numérotation (001-0XX, 101-1XX, etc.)
        sections = set()
        for rid in requis_ids:
            sections.add(rid // 100)  # 001-099 = 0, 101-199 = 1, etc.
        module_data['sections'] = len(sections)

# Calculer statistiques globales
total_requis = sum(len(m['requis']) for m in modules.values())
total_est_min = sum(sum(r['est_min'] for r in m['requis']) for m in modules.values())
total_est_max = sum(sum(r['est_max'] for r in m['requis']) for m in modules.values())

# Statistiques par module
print("\n" + "="*80)
print("STATISTIQUES GLOBALES - SONDAGE ORIA MVP")
print("="*80)
print(f"\nTotal requis: {total_requis}")
print(f"Estimation totale: {total_est_min}h - {total_est_max}h")
print(f"  Semaines (40h/sem): {total_est_min/40:.1f} - {total_est_max/40:.1f}")
print(f"  Mois (160h/mois): {total_est_min/160:.1f} - {total_est_max/160:.1f}")

print("\n" + "-"*80)
print("DETAILS PAR MODULE")
print("-"*80)

for prefix in ['COM', 'HOR', 'GES', 'ADM', 'BET', 'PAY']:
    m = modules[prefix]
    if not m['requis']:
        continue

    nb_requis = len(m['requis'])
    est_min = sum(r['est_min'] for r in m['requis'])
    est_max = sum(r['est_max'] for r in m['requis'])
    avg_prio = sum(r['priorite'] for r in m['requis']) / nb_requis
    avg_complex = sum(r['complexite'] for r in m['requis']) / nb_requis

    prio_10 = len([r for r in m['requis'] if r['priorite'] == 10])
    prio_9 = len([r for r in m['requis'] if r['priorite'] == 9])
    complex_9_10 = len([r for r in m['requis'] if r['complexite'] >= 9])

    print(f"\n{prefix} - {m['name']}")
    print(f"  Sections: {m['sections']}")
    print(f"  Requis: {nb_requis}")
    print(f"  Estimation: {est_min}h - {est_max}h ({est_min/40:.1f}-{est_max/40:.1f} sem)")
    print(f"  Priorite moyenne: {avg_prio:.1f}/10")
    print(f"  Complexite moyenne: {avg_complex:.1f}/10")
    print(f"  Priorite 10 (critique): {prio_10} requis")
    print(f"  Priorite 9 (haute): {prio_9} requis")
    print(f"  Complexite 9-10: {complex_9_10} requis")

# Statistiques requis critiques tous modules
print("\n" + "-"*80)
print("REQUIS CRITIQUES (Priorite 10) - TOUS MODULES")
print("-"*80)
for prefix in ['COM', 'HOR', 'GES', 'ADM', 'BET', 'PAY']:
    critiques = [r for r in modules[prefix]['requis'] if r['priorite'] == 10]
    if critiques:
        print(f"{prefix}: {len(critiques)} requis critiques")

# Scénarios développement
print("\n" + "="*80)
print("SCENARIOS DEVELOPPEMENT")
print("="*80)

print(f"\nScenario 1 developpeur seul:")
print(f"  Minimum: {total_est_min}h ({total_est_min/40:.1f} semaines = {total_est_min/160:.1f} mois)")
print(f"  Maximum: {total_est_max}h ({total_est_max/40:.1f} semaines = {total_est_max/160:.1f} mois)")

print(f"\nScenario equipe 3 developpeurs:")
print(f"  Minimum: {total_est_min/3:.0f}h ({total_est_min/(3*40):.1f} semaines = {total_est_min/(3*160):.1f} mois)")
print(f"  Maximum: {total_est_max/3:.0f}h ({total_est_max/(3*40):.1f} semaines = {total_est_max/(3*160):.1f} mois)")

print(f"\nScenario equipe 5 developpeurs:")
print(f"  Minimum: {total_est_min/5:.0f}h ({total_est_min/(5*40):.1f} semaines = {total_est_min/(5*160):.1f} mois)")
print(f"  Maximum: {total_est_max/5:.0f}h ({total_est_max/(5*40):.1f} semaines = {total_est_max/(5*160):.1f} mois)")

print("\n" + "="*80)

# Sauvegarder dans JSON pour utilisation ultérieure
import json
stats = {
    'total_requis': total_requis,
    'total_est_min': total_est_min,
    'total_est_max': total_est_max,
    'modules': {}
}

for prefix in ['COM', 'HOR', 'GES', 'ADM', 'BET', 'PAY']:
    m = modules[prefix]
    if m['requis']:
        stats['modules'][prefix] = {
            'name': m['name'],
            'sections': m['sections'],
            'nb_requis': len(m['requis']),
            'est_min': sum(r['est_min'] for r in m['requis']),
            'est_max': sum(r['est_max'] for r in m['requis']),
            'avg_prio': sum(r['priorite'] for r in m['requis']) / len(m['requis']),
            'avg_complex': sum(r['complexite'] for r in m['requis']) / len(m['requis']),
            'prio_10': len([r for r in m['requis'] if r['priorite'] == 10]),
            'prio_9': len([r for r in m['requis'] if r['priorite'] == 9]),
            'complex_9_10': len([r for r in m['requis'] if r['complexite'] >= 9]),
        }

with open('stats_oria_mvp.json', 'w', encoding='utf-8') as f:
    json.dump(stats, f, indent=2, ensure_ascii=False)

print("\n[OK] Statistiques sauvegardees: stats_oria_mvp.json\n")
