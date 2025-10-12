#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Comptage final des appellations génériques"""

from pathlib import Path
import re

fichier = Path(__file__).parent / "00_prologue.md"

with open(fichier, 'r', encoding='utf-8') as f:
    contenu = f.read()

# Compter chaque type d'appellation
appellations = {
    "la vampire": len(re.findall(r'\bla vampire\b', contenu)),
    "l'immortelle": len(re.findall(r"\bl'immortelle\b", contenu)),
    "la prédatrice": len(re.findall(r'\bla prédatrice\b', contenu)),
    "l'ancienne": len(re.findall(r"\bl'ancienne\b", contenu)),
    "la créature": len(re.findall(r'\bla créature\b', contenu)),
    "la morte-vivante": len(re.findall(r'\bla morte-vivante\b', contenu)),
    "l'être": len(re.findall(r"\bl'être\b", contenu)),
}

# Comptage initial (avant corrections)
initial = {
    "la vampire": 23,
    "l'immortelle": 19,
    "la prédatrice": 8,
    "l'ancienne": 12,
    "la créature": 12,
    "la morte-vivante": 5,  # estimation
    "l'être": 4,  # estimation
}

total_initial = sum(initial.values())
total_final = sum(appellations.values())
reduction = total_initial - total_final
pct_reduction = (reduction / total_initial) * 100

print("=" * 80)
print("COMPTAGE FINAL DES APPELLATIONS GÉNÉRIQUES")
print("=" * 80)
print()
print(f"{'Appellation':<25} {'Avant':<10} {'Après':<10} {'Réduction':<15}")
print("-" * 80)

for app_type in appellations.keys():
    avant = initial.get(app_type, 0)
    apres = appellations[app_type]
    reduc = avant - apres
    if avant > 0:
        pct = (reduc / avant) * 100
        print(f"{app_type:<25} {avant:<10} {apres:<10} -{reduc} (-{pct:.0f}%)")
    else:
        print(f"{app_type:<25} {avant:<10} {apres:<10} N/A")

print("-" * 80)
print(f"{'TOTAL':<25} {total_initial:<10} {total_final:<10} -{reduction} (-{pct_reduction:.1f}%)")
print()
print("=" * 80)
print("OBJECTIF: Réduire de 30-50% → ", end="")
if 30 <= pct_reduction <= 50:
    print("✓ ATTEINT!")
elif pct_reduction > 50:
    print(f"DÉPASSÉ ({pct_reduction:.1f}%)")
else:
    print(f"INSUFFISANT ({pct_reduction:.1f}%)")
print("=" * 80)
