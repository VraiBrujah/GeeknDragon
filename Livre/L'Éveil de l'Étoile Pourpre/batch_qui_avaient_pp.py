#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH: Remplacement 'qui avaient' + participe passe -> 'ayant'")
print()

avant = text.count(' qui ')

# Trouver tous les "qui avaient" pour identifier les patterns
pattern = r'qui avaient (\w+)'
matches = re.findall(pattern, text)

print(f"Patterns 'qui avaient' detectes: {len(matches)}")
if matches:
    from collections import Counter
    counter = Counter(matches)
    print("Patterns trouves:")
    for mot, count in counter.items():
        print(f"  'qui avaient {mot}': {count}x")
print()

# Remplacements ciblés basés sur patterns réels
remplacements = [
    (r'qui avaient été', 'ayant été'),
    (r'qui avaient fait', 'ayant fait'),
    (r'qui avaient vu', 'ayant vu'),
    (r'qui avaient cru', 'ayant cru'),
    (r'qui avaient vécu', 'ayant vécu'),
    (r'qui avaient connu', 'ayant connu'),
    (r'qui avaient perdu', 'ayant perdu'),
    (r'qui avaient trouvé', 'ayant trouvé'),
    (r'qui avaient laissé', 'ayant laissé'),
    (r'qui avaient créé', 'ayant créé'),
    (r'qui avaient disparu', 'ayant disparu'),
    (r'qui avaient survécu', 'ayant survécu'),
    (r'qui avaient refusé', 'ayant refusé'),
    (r'qui avaient accepté', 'ayant accepté'),
    (r'qui avaient transformé', 'ayant transformé'),
    (r'qui avaient dominé', 'ayant dominé'),
    (r'qui avaient gardé', 'ayant gardé'),
    (r'qui avaient oublié', 'ayant oublié'),
    (r'qui avaient donné', 'ayant donné'),
    (r'qui avaient pris', 'ayant pris'),
]

count = 0
for avant_str, apres_str in remplacements:
    occurrences = len(re.findall(avant_str, text))
    if occurrences > 0:
        print(f"  '{avant_str}' -> '{apres_str}': {occurrences}x")
        text = re.sub(avant_str, apres_str, text)
        count += occurrences

print()
print(f"TOTAL REMPLACEMENTS: {count}")

apres = text.count(' qui ')
print(f"'qui' AVANT: {avant}")
print(f"'qui' APRES: {apres}")
print(f"REDUCTION: -{avant - apres}")
print()

# Sauvegarder
with open('00_prologue.md', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fichier sauvegarde!")
