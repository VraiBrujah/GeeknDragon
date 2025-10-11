#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH: Transformation 'qui aurait/auraient' transformables")
print()

avant = text.count(' qui ')

# Remplacements pour participes passés (auraient + pp -> ayant + pp au conditionnel restructuré)
# Note: Certains "qui aurait" nécessitent reformulation complète pour préserver sens conditionnel

remplacements = [
    # Participes passés : "qui aurait + pp" peut devenir apposition si contexte le permet
    (r'qui aurait déchiqueté', 'susceptible de déchiqueter'),  # restructuration
    (r'qui auraient tué', 'susceptibles de tuer'),  # restructuration
    (r'qui aurait pétrifié', 'susceptible de pétrifier'),  # restructuration
    (r'qui aurait glacé', 'susceptible de glacer'),  # restructuration

    # "qui auraient permis" -> restructuration
    (r'qui auraient permis', 'susceptibles d\'avoir permis'),
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
