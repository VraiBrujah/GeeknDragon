#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH: Remplacement 'qui ont' personnalise")
print()

avant = text.count(' qui ')

# Remplacements basés sur les participes détectés
remplacements = [
    (r'qui ont accompli', 'ayant accompli'),
    (r'qui ont échoué', 'ayant échoué'),
    (r'qui ont réussi', 'ayant réussi'),
    (r'qui ont défié', 'ayant défié'),
    (r'qui ont payé', 'ayant payé'),
    (r'qui ont franchi', 'ayant franchi'),
    (r'qui ont consumé', 'ayant consumé'),
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
