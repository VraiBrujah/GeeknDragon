#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH: Remplacement 'qui' + verbes modaux")
print()

avant = text.count(' qui ')

# Remplacements
remplacements = [
    (r'qui refusait de', 'refusant de'),
    (r'qui refusait d\'', 'refusant d\''),
    (r'qui refusaient de', 'refusant de'),
    (r'qui pouvait ', 'pouvant '),
    (r'qui pouvaient ', 'pouvant '),
    (r'qui devait ', 'devant '),
    (r'qui devaient ', 'devant '),
    (r'qui faisait ', 'faisant '),
    (r'qui faisaient ', 'faisant '),
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
