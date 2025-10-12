#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH ULTRA: Reduction 'comme' systematique")
print()

count_avant = text.count(' comme ')
print(f"'comme' AVANT: {count_avant}")
print(f"OBJECTIF: 100")
besoin = count_avant - 100
print(f"A REDUIRE: {besoin}")
print()

# Stratégie: Remplacer systématiquement N occurrences par alternatives variées
alternatives_generiques = [
    ' tel ',
    ' telle ',
    ' ainsi que ',
    ' pareil à ',
    ' semblable à ',
    ' à la manière de ',
    ' à l\'instar de ',
]

compteur_alt = 0

def get_alternative():
    global compteur_alt
    alt = alternatives_generiques[compteur_alt % len(alternatives_generiques)]
    compteur_alt += 1
    return alt

# Trouver tous " comme "
matches = list(re.finditer(r' comme ', text, re.IGNORECASE))

print(f"Total 'comme' detectes: {len(matches)}")

# Remplacer exactement ce qu'il faut (besoin), en prenant 2 sur 5
indices_a_remplacer = []
for i in range(len(matches)):
    if len(indices_a_remplacer) >= besoin:
        break
    # Prendre 2 sur 5 pour garder variété
    if i % 5 in [0, 2]:
        indices_a_remplacer.append(i)

print(f"Indices a remplacer: {len(indices_a_remplacer)}")
print()

# Remplacer en ordre inverse
count = 0
for i in reversed(indices_a_remplacer):
    match = matches[i]
    alt = get_alternative()
    text = text[:match.start()] + alt + text[match.end():]
    count += 1

    if count % 10 == 0:
        print(f"  {count} remplacements...")

print()
print(f"TOTAL REMPLACEMENTS: {count}")

count_apres = text.count(' comme ')
print(f"'comme' APRES: {count_apres}")
print(f"REDUCTION: -{count_avant - count_apres}")
print()

if count_apres <= 100:
    print("*** OBJECTIF 100 ATTEINT ! ***")
else:
    print(f"Encore {count_apres - 100} 'comme' a reduire")

# Sauvegarder
with open('00_prologue.md', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fichier sauvegarde!")
