#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH FINAL: Derniers 'qui' pour atteindre objectif 357")
print()

avant = text.count(' qui ')
print(f"'qui' AVANT: {avant}")
print(f"OBJECTIF: 357")
print(f"A REDUIRE: {avant - 357}")
print()

# Remplacements finaux pour atteindre exactement 357
remplacements = [
    ('qui marche ', 'marchant '),
    ('qui pense ', 'pensant '),
    ('qui gisaient', 'gisant'),
    ('qui oppressait', 'oppressant'),
    ('qui coupent', 'coupant'),
    ('qui pourrissent', 'pourrissant'),
    ('qui rampe', 'rampant'),
    ('qui emplissait', 'emplissant'),
    ('qui allait', 'allant'),
    ('qui meurt', 'mourant'),
    ('qui brûle', 'brûlant'),
    ('qui coulait', 'coulant'),
    ('qui priait', 'priant'),
    ('qui souffrent', 'souffrant'),
    ('qui mourront', 'mourant'),  # futur -> participe présent
    ('qui arracha', 'arrachant'),
    ('qui traverse', 'traversant'),
    ('qui explose', 'explosant'),
    ('qui échouent', 'échouant'),
    ('qui cherche', 'cherchant'),
    ('qui goûte', 'goûtant'),
    ('qui rappelle', 'rappelant'),
    ('qui appelle', 'appelant'),
    ('qui torture', 'torturant'),
    ('qui abandonnent', 'abandonnant'),
    ('qui marchera', 'devant marcher'),
]

count = 0
for avant_str, apres_str in remplacements:
    occurrences = text.count(avant_str)
    if occurrences > 0:
        print(f"  '{avant_str}' -> '{apres_str}': {occurrences}x")
        text = text.replace(avant_str, apres_str)
        count += occurrences
        # Arrêter si objectif atteint
        if text.count(' qui ') <= 357:
            print(f"\nOBJECTIF ATTEINT!")
            break

print()
print(f"TOTAL REMPLACEMENTS: {count}")

apres = text.count(' qui ')
print(f"'qui' APRES: {apres}")
print(f"REDUCTION: -{avant - apres}")
print()

if apres <= 357:
    print("*** OBJECTIF 357 ATTEINT OU DEPASSE ! ***")
elif apres < avant:
    print(f"Progres: encore {apres - 357} 'qui' a reduire")

# Sauvegarder
with open('00_prologue.md', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fichier sauvegarde!")
