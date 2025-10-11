#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re
from collections import Counter

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("=" * 80)
print("ANALYSE: VERBES LES PLUS FREQUENTS APRES 'QUI'")
print("=" * 80)
print()

# Trouver tous les "qui + verbe"
pattern = r'\bqui\s+(\w+)'
matches = re.findall(pattern, text, re.IGNORECASE)

# Compter fréquences
counter = Counter(matches)

print(f"Total 'qui' detectes: {len(matches)}")
print()
print("TOP 40 VERBES APRES 'QUI':")
print()

for i, (verbe, count) in enumerate(counter.most_common(40), 1):
    print(f"{i:2}. {verbe:20} : {count:3}x")

print()
print("=" * 80)
print("PATTERNS REMPLACABLES IDENTIFIES")
print("=" * 80)
print()

# Identifier patterns remplaçables
remplacables = []
for verbe, count in counter.most_common(50):
    # Verbes en -ait/-aient/-ait (imparfait) facilement transformables en participe présent
    if verbe.endswith('ait') or verbe.endswith('aient'):
        # Essayer de dériver le participe
        if verbe.endswith('ait'):
            participe = verbe[:-3] + 'ant'
        elif verbe.endswith('aient'):
            participe = verbe[:-5] + 'ant'

        remplacables.append((f"qui {verbe}", participe, count))

print("TRANSFORMATIONS POSSIBLES (imparfait -> participe present):")
print()
for i, (pattern, participe, count) in enumerate(remplacables[:30], 1):
    print(f"{i:2}. '{pattern}' -> '{participe}' : {count}x")

print()
print(f"TOTAL POTENTIEL: {sum(c for _, _, c in remplacables[:30])} remplacements")
