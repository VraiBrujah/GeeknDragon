#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re
from collections import Counter

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("="*80)
print("ANALYSE: CONTEXTES 'DANS'")
print("="*80)
print()

# Compter 'dans'
count_dans = text.count(' dans ')
print(f"Total 'dans' (avec espaces): {count_dans}")
print()

# Analyser les patterns "dans + article/déterminant"
patterns = [
    (r'dans le ', 'dans le'),
    (r'dans la ', 'dans la'),
    (r'dans les ', 'dans les'),
    (r"dans l'", "dans l'"),
    (r'dans un ', 'dans un'),
    (r'dans une ', 'dans une'),
    (r'dans des ', 'dans des'),
    (r'dans sa ', 'dans sa'),
    (r'dans son ', 'dans son'),
    (r'dans ses ', 'dans ses'),
    (r'dans ce ', 'dans ce'),
    (r'dans cette ', 'dans cette'),
    (r'dans ces ', 'dans ces'),
    (r'dans leur ', 'dans leur'),
    (r'dans leurs ', 'dans leurs'),
    (r'dans chaque ', 'dans chaque'),
]

print("PATTERNS 'DANS + DETERMINANT':")
print()

total_patterns = 0
for pattern, label in patterns:
    matches = re.findall(pattern, text)
    if matches:
        count = len(matches)
        total_patterns += count
        print(f"  {label:20} : {count:3}x")

print()
print(f"TOTAL patterns identifiés: {total_patterns}")
print()

# Analyser ce qui suit "dans"
print("="*80)
print("MOTS SUIVANT 'DANS' (TOP 30):")
print("="*80)
print()

pattern = r'\bdans\s+(\w+)'
matches = re.findall(pattern, text, re.IGNORECASE)
counter = Counter(matches)

for i, (mot, count) in enumerate(counter.most_common(30), 1):
    print(f"{i:2}. dans {mot:20} : {count:3}x")

print()
print("="*80)
print("SUGGESTIONS DE REMPLACEMENT:")
print("="*80)
print()

suggestions = {
    'dans le/la/les': ['au sein de', 'à l\'intérieur de', 'parmi', 'au cœur de'],
    'dans son/sa/ses': ['en son/sa/ses', 'à travers son/sa/ses'],
    'dans cette/ce/ces': ['en cette/ce/ces', 'au sein de cette/ce/ces'],
    'dans un/une/des': ['parmi', 'en', 'au milieu de'],
}

for pattern, alternatives in suggestions.items():
    print(f"{pattern:20} -> {', '.join(alternatives)}")
