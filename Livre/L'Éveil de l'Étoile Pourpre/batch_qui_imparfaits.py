#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH: Remplacement 'qui' + verbes imparfait -> participe present")
print()

avant = text.count(' qui ')

# Remplacements (excluant "aurait/auraient" car grammaticalement incorrects)
remplacements = [
    ('qui trahissait', 'trahissant'),
    ('qui électrisait', 'électrisant'),
    ('qui contrastait', 'contrastant'),
    ('qui défiait', 'défiant'),
    ('qui savait', 'sachant'),  # Correction: savait -> sachant
    ('qui suivit', 'suivant'),
    ('qui pulsaient', 'pulsant'),
    ('qui ressemblait', 'ressemblant'),
    ('qui prenait', 'prenant'),
    ('qui glaçait', 'glaçant'),
    ('qui frôlait', 'frôlant'),
    ('qui cachait', 'cachant'),
    ('qui battait', 'battant'),
    ('qui respirait', 'respirant'),
    ('qui semblaient', 'semblant'),
    ('qui vibrait', 'vibrant'),
    ('qui ondulait', 'ondulant'),
    ('qui coule', 'coulant'),
    ('qui brûle', 'brûlant'),
    ('qui transcende', 'transcendant'),
    ('qui dévore', 'dévorant'),
    ('qui refuse', 'refusant'),
    ('qui connaît', 'connaissant'),
    ('qui défie', 'défiant'),
]

count = 0
for avant_str, apres_str in remplacements:
    occurrences = text.count(avant_str)
    if occurrences > 0:
        print(f"  '{avant_str}' -> '{apres_str}': {occurrences}x")
        text = text.replace(avant_str, apres_str)
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
