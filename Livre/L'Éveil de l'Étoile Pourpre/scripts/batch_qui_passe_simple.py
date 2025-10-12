#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH: Remplacement 'qui' + passe simple -> participe present ou restructuration")
print()

avant = text.count(' qui ')

# Le passé simple peut être transformé en participe présent pour actions simultanées
# ou restructuré selon contexte
remplacements = [
    # Passé simple -> participe présent (actions simultanées/descriptives)
    ('qui fit ', 'faisant '),
    ('qui sembla ', 'semblant '),
    ('qui marcha ', 'marchant '),
    ('qui refusa ', 'refusant '),
    ('qui arriva ', 'arrivant '),
    ('qui emplit ', 'emplissant '),
    ('qui résonna ', 'résonnant '),
    ('qui sortit ', 'sortant '),
    ('qui surgit ', 'surgissant '),
    ('qui parut ', 'paraissant '),
    ('qui devint ', 'devenant '),
    ('qui prit ', 'prenant '),
    ('qui donna ', 'donnant '),
    ('qui porta ', 'portant '),
    ('qui révéla ', 'révélant '),
    ('qui transforma ', 'transformant '),
    ('qui créa ', 'créant '),
    ('qui détruisit ', 'détruisant '),
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
