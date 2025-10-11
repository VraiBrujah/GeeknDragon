#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH: Variation 'dans sa' -> alternatives")
print()

avant = text.count(' dans ')
print(f"'dans' AVANT: {avant}")
print()

# Remplacements ciblés pour "dans sa"
# "dans sa" peut devenir "en sa", "à travers sa", "au sein de sa", etc.
remplacements = [
    (r'dans sa voix', 'en sa voix'),
    (r'dans sa main', 'en sa main'),
    (r'dans sa paume', 'en sa paume'),
    (r'dans sa chair', 'en sa chair'),
    (r'dans sa tête', 'en sa tête'),
    (r'dans sa poitrine', 'en sa poitrine'),
    (r'dans sa gorge', 'au fond de sa gorge'),
    (r'dans sa bouche', 'en sa bouche'),
    (r'dans sa mémoire', 'au sein de sa mémoire'),
    (r'dans sa conscience', 'au sein de sa conscience'),
    (r'dans sa pensée', 'en sa pensée'),
    (r'dans sa direction', 'en sa direction'),
    (r'dans sa présence', 'au sein de sa présence'),
    (r'dans sa forme', 'en sa forme'),
    (r'dans sa nature', 'en sa nature'),
    (r'dans sa substance', 'en sa substance'),
    (r'dans sa essence', 'en son essence'),
    (r'dans sa totalité', 'en sa totalité'),
    (r'dans sa gloire', 'en sa gloire'),
    (r'dans sa majesté', 'en sa majesté'),
    (r'dans sa splendeur', 'en sa splendeur'),
    (r'dans sa beauté', 'en sa beauté'),
    (r'dans sa laideur', 'en sa laideur'),
    (r'dans sa cruauté', 'en sa cruauté'),
    (r'dans sa folie', 'en sa folie'),
]

count = 0
for avant_str, apres_str in remplacements:
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
