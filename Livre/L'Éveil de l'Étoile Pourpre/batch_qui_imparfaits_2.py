#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH 2: Remplacement 'qui' + verbes imparfait -> participe present")
print()

avant = text.count(' qui ')

# Remplacements des imparfaits restants identifiés
remplacements = [
    ('qui résonnait', 'résonnant'),
    ('qui venait', 'venant'),
    ('qui dépassaient', 'dépassant'),
    ('qui rendait', 'rendant'),
    ('qui brûlait', 'brûlant'),
    ('qui transcendait', 'transcendant'),
    ('qui restait', 'restant'),
    ('qui confinait', 'confinant'),
    ('qui frisait', 'frisant'),
    ('qui défiaient', 'défiant'),
    ('qui évoquait', 'évoquant'),
    ('qui entouraient', 'entourant'),
    ('qui menaçait', 'menaçant'),
    ('qui surgissait', 'surgissant'),
    ('qui parcourait', 'parcourant'),
    ('qui témoignait', 'témoignant'),
    ('qui rappelait', 'rappelant'),
    ('qui troublait', 'troublant'),
    ('qui irradiait', 'irradiant'),
    ('qui glissait', 'glissant'),
    ('qui protégeait', 'protégeant'),
    ('qui dominait', 'dominant'),
    ('qui traçait', 'traçant'),
    ('qui vacillait', 'vacillant'),
    ('qui tremblait', 'tremblant'),
    ('qui persistait', 'persistant'),
    ('qui régnait', 'régnant'),
    ('qui pulsait', 'pulsant'),  # vérification si restants
    ('qui brillait', 'brillant'),  # vérification si restants
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
