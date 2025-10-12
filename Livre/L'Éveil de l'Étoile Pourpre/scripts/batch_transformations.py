#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour identifier les contextes d'adverbes à transformer
Liste les phrases à transformer manuellement avec Edit
"""

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Adverbes à chercher (Priorité 1 et 3 restants)
adverbes_cibles = [
    'lentement', 'rapidement', 'doucement', 'fortement',
    'légèrement', 'vraiment', 'certainement', 'absolument',
    'instantanément', 'finalement', 'éternellement', 'récemment',
    'profondément', 'intensément', 'extrêmement',
    'complètement', 'totalement', 'parfaitement',
    'exactement', 'précisément', 'véritablement'
]

# Créer pattern regex
pattern = re.compile(r'\b(' + '|'.join(adverbes_cibles) + r')\b', re.IGNORECASE)

print("="*80)
print("ADVERBES À TRANSFORMER - CONTEXTE COMPLET")
print("="*80)
print()

count = 0
for i, line in enumerate(lines, 1):
    match = pattern.search(line)
    if match:
        count += 1
        adverbe = match.group(1)

        # Afficher contexte (3 lignes avant, ligne actuelle, 2 lignes après)
        print(f"--- OCCURRENCE {count}: '{adverbe}' (ligne {i}) ---")

        # Lignes avant
        for j in range(max(0, i-4), i-1):
            if j < len(lines):
                print(f"  {j+1}: {lines[j].rstrip()}")

        # Ligne avec adverbe (en gras)
        print(f"**{i}: {line.rstrip()}**")

        # Lignes après
        for j in range(i, min(i+2, len(lines))):
            if j < len(lines):
                print(f"  {j+1}: {lines[j].rstrip()}")

        print()

print("="*80)
print(f"TOTAL ADVERBES TROUVÉS : {count}")
print("="*80)
