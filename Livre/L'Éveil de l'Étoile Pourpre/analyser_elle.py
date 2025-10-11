#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re
from collections import Counter

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("="*80)
print("ANALYSE: OCCURRENCES 'ELLE'")
print("="*80)
print()

# Compter 'elle' (seulement le pronom, pas dans "elle-même", "quelle", etc.)
count_elle_total = text.count(' elle ')
count_elle_debut = text.count('\nElle ')
count_elle_virgule = text.count(', elle ')

print(f"Total 'elle' (avec espaces): {count_elle_total}")
print(f"'Elle' en début de phrase: {count_elle_debut}")
print(f"', elle' après virgule: {count_elle_virgule}")
print()

# Analyser contextes après "elle"
pattern = r'\belle\s+(\w+)'
matches = re.findall(pattern, text, re.IGNORECASE)

print(f"Total matches 'elle + mot': {len(matches)}")
print()

counter = Counter(matches)
print("TOP 30 VERBES/MOTS SUIVANT 'ELLE':")
print()
for i, (mot, count) in enumerate(counter.most_common(30), 1):
    print(f"{i:2}. elle {mot:20} : {count:3}x")

print()
print("="*80)
print("STRATEGIES DE REMPLACEMENT:")
print("="*80)
print()

strategies = [
    "1. Utiliser noms/titres: 'la vampire', 'l'immortelle', 'Morwen'",
    "2. Constructions participiales (supprimer sujet explicite)",
    "3. Tournures passives -> actives sans pronom",
    "4. Appositions descriptives",
    "5. Restructuration pour éviter répétition sujet",
]

for strategie in strategies:
    print(f"  • {strategie}")
