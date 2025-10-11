#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH: Remplacement 'qui' + pronom COD + verbe")
print()

avant = text.count(' qui ')

# Remplacements: "qui la/le/les + verbe" -> restructuration
remplacements = [
    (r'qui la consumait', 'la consumant'),
    (r'qui le distinguait', 'le distinguant'),
    (r'qui les entouraient', 'les entourant'),
    (r'qui les a dévorés', 'les ayant dévorés'),
    (r'qui les ont trahis', 'les ayant trahis'),
    (r'qui la surprit', 'la surprenant'),
    (r'qui la rongeait', 'la rongeant'),
    (r'qui le faisaient', 'le faisant'),
    (r'qui les créaient', 'les créant'),
    (r'qui les entourait', 'les entourant'),
    (r'qui la suivait', 'la suivant'),
    (r'qui les a menés', 'les ayant menés'),
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
