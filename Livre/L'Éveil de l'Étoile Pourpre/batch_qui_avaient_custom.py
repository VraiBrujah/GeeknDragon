#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH: Remplacement 'qui avaient' personnalise")
print()

avant = text.count(' qui ')

# Remplacements des participes passés trouvés
remplacements = [
    (r'qui avaient rongé', 'ayant rongé'),
    (r'qui avaient secoué', 'ayant secoué'),
    (r'qui avaient imprégné', 'ayant imprégné'),
    (r'qui avaient osé', 'ayant osé'),
    (r'qui avaient façonné', 'ayant façonné'),
    (r'qui avaient choisi', 'ayant choisi'),
    (r'qui avaient usé', 'ayant usé'),
    (r'qui avaient marché', 'ayant marché'),
    (r'qui avaient fui', 'ayant fui'),
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
