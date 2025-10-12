#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH: Remplacement 'qui' + present indicatif -> participe present")
print()

avant = text.count(' qui ')

# Présent indicatif -> participe présent
remplacements = [
    ('qui attend ', 'attendant '),
    ('qui consume ', 'consumant '),
    ('qui dort ', 'dormant '),
    ('qui est ', 'étant '),
    ('qui fait ', 'faisant '),
    ('qui marche ', 'marchant '),
    ('qui pense ', 'pensant '),
    ('qui arrive ', 'arrivant '),
    ('qui sait ', 'sachant '),  # irrégulier
    ('qui devient ', 'devenant '),
    ('qui vient ', 'venant '),
    ('qui prend ', 'prenant '),
    ('qui donne ', 'donnant '),
    ('qui porte ', 'portant '),
    ('qui révèle ', 'révélant '),
    ('qui crée ', 'créant '),
    ('qui détruit ', 'détruisant '),
    ('qui brise ', 'brisant '),
    ('qui percent ', 'perçant '),
    ('qui sentent ', 'sentant '),
    ('qui rugissent ', 'rugissant '),
    ('qui présagent ', 'présageant '),
    ('qui remonte ', 'remontant '),
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
