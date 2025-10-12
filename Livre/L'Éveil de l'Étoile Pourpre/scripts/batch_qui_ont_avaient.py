#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH: Remplacement 'qui ont/avaient' + participe passe")
print()

avant = text.count(' qui ')

# Pattern: "qui ont + participe passé" -> "ayant + participe passé"
# Pattern: "qui avaient + participe passé" -> "ayant + participe passé"

# Liste des participes passés courants
participes = [
    'été', 'eu', 'fait', 'dit', 'vu', 'pris', 'mis', 'voulu', 'pu',
    'su', 'dû', 'cru', 'lu', 'vécu', 'reçu', 'perdu', 'rendu',
    'appris', 'compris', 'connu', 'reconnu', 'venu', 'tenu', 'devenu',
    'survécu', 'disparu', 'couru', 'mort', 'né', 'parti', 'sorti',
    'tombé', 'resté', 'passé', 'arrivé', 'entré', 'monté', 'descendu',
    'dominé', 'créé', 'laissé', 'donné', 'trouvé', 'gardé', 'gardé',
    'oublié', 'refusé', 'accepté', 'transformé', 'détruit', 'construit',
]

count = 0

for participe in participes:
    # "qui ont + participe" -> "ayant + participe"
    pattern1 = f'qui ont {participe}'
    if pattern1 in text:
        occurrences = text.count(pattern1)
        print(f"  '{pattern1}' -> 'ayant {participe}': {occurrences}x")
        text = text.replace(pattern1, f'ayant {participe}')
        count += occurrences

    # "qui avaient + participe" -> "ayant + participe"
    pattern2 = f'qui avaient {participe}'
    if pattern2 in text:
        occurrences = text.count(pattern2)
        print(f"  '{pattern2}' -> 'ayant {participe}': {occurrences}x")
        text = text.replace(pattern2, f'ayant {participe}')
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
