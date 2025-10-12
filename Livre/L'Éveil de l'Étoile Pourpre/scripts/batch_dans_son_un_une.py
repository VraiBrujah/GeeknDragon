#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH: Variation 'dans son', 'dans un', 'dans une' -> alternatives")
print()

avant = text.count(' dans ')
print(f"'dans' AVANT: {avant}")
print()

# Remplacements pour "dans son"
remplacements_son = [
    (r'dans son esprit', 'en son esprit'),
    (r'dans son cœur', 'en son cœur'),
    (r'dans son âme', 'au sein de son âme'),
    (r'dans son corps', 'en son corps'),
    (r'dans son sang', 'à travers son sang'),
    (r'dans son regard', 'au sein de son regard'),
    (r'dans son visage', 'sur son visage'),
    (r'dans son dos', 'sur son dos'),
    (r'dans son ventre', 'au fond de son ventre'),
    (r'dans son crâne', 'en son crâne'),
    (r'dans son cerveau', 'en son cerveau'),
    (r'dans son souffle', 'en son souffle'),
    (r'dans son sillage', 'en son sillage'),
    (r'dans son ombre', 'en son ombre'),
]

# Remplacements pour "dans un/une"
remplacements_un = [
    (r'dans un silence', 'en un silence'),
    (r'dans un murmure', 'en un murmure'),
    (r'dans un souffle', 'en un souffle'),
    (r'dans un soupir', 'en un soupir'),
    (r'dans un cri', 'en un cri'),
    (r'dans un éclat', 'en un éclat'),
    (r'dans un geste', 'en un geste'),
    (r'dans un mouvement', 'en un mouvement'),
    (r'dans un monde', 'au sein d\'un monde'),
    (r'dans un lieu', 'en un lieu'),
    (r'dans un endroit', 'en un endroit'),
    (r'dans un coin', 'en un coin'),
]

remplacements_une = [
    (r'dans une voix', 'en une voix'),
    (r'dans une lueur', 'en une lueur'),
    (r'dans une lumière', 'en une lumière'),
    (r'dans une pièce', 'au sein d\'une pièce'),
    (r'dans une salle', 'au sein d\'une salle'),
    (r'dans une chambre', 'au sein d\'une chambre'),
    (r'dans une danse', 'en une danse'),
    (r'dans une étreinte', 'en une étreinte'),
    (r'dans une position', 'en une position'),
    (r'dans une direction', 'en une direction'),
]

count = 0
for avant_str, apres_str in remplacements_son + remplacements_un + remplacements_une:
    occurrences = len(re.findall(avant_str, text, re.IGNORECASE))
    if occurrences > 0:
        print(f"  '{avant_str}' -> '{apres_str}': {occurrences}x")
        text = re.sub(avant_str, apres_str, text, flags=re.IGNORECASE)
        count += occurrences

print()
print(f"TOTAL REMPLACEMENTS: {count}")

apres = text.count(' dans ')
print(f"'dans' APRES: {apres}")
print(f"REDUCTION: -{avant - apres}")
print()

# Sauvegarder
with open('00_prologue.md', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fichier sauvegarde!")
