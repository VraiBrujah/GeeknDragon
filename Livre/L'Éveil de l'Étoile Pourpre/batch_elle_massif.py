#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH MASSIF: Reduction 'elle' par alternance designations")
print()

count_avant = len(re.findall(r'\belle\b', text, re.IGNORECASE))
print(f"'elle' AVANT: {count_avant}")
print(f"OBJECTIF: 220")
print(f"A REDUIRE: {count_avant - 220}")
print()

# STRATEGIE: Remplacer environ 1/3 des "Elle" en début de phrase
# On alterne systématiquement: Morwen, la vampire, l'immortelle, la créature

# Liste des verbes fréquents après "Elle"
verbes_frequents = [
    'avait', 'était', 'se', 'fit', 'rouvrit', 'ferma', 'pouvait',
    'venait', 'toucha', 'secoua', 'porta', 'inspira', 'portait',
    'caressa', 'voyait', 'cherchait', 'sentait', 'savait', 'devait',
    'voulait', 'pensait', 'observait', 'contemplait', 'regardait',
    'marchait', 'avançait', 'reculait', 'attendait', 'espérait',
]

# Compteurs pour alternance
compteur_remplacement = 0
designations = ['Morwen', 'La vampire', 'L\'immortelle', 'La créature']

# Fonction pour obtenir désignation alternée
def get_designation():
    global compteur_remplacement
    designation = designations[compteur_remplacement % len(designations)]
    compteur_remplacement += 1
    return designation

# Remplacer 1/3 des occurrences de chaque pattern
count = 0
for verbe in verbes_frequents:
    pattern = rf'\nElle {verbe}'
    matches = list(re.finditer(pattern, text))

    if matches:
        # Remplacer 1 sur 3
        to_replace = matches[::3]  # Prendre 1/3 des occurrences

        # Remplacer en ordre inverse pour ne pas décaler les indices
        for match in reversed(to_replace):
            designation = get_designation()
            text = text[:match.start()] + f'\n{designation} {verbe}' + text[match.end():]
            count += 1

        if to_replace:
            print(f"  'Elle {verbe}': {len(to_replace)}/{len(matches)} remplace(s)")

print()
print(f"TOTAL REMPLACEMENTS: {count}")

count_apres = len(re.findall(r'\belle\b', text, re.IGNORECASE))
print(f"'elle' APRES: {count_apres}")
print(f"REDUCTION: -{count_avant - count_apres}")
print()

if count_apres <= 220:
    print("*** OBJECTIF 220 ATTEINT ! ***")
else:
    print(f"Encore {count_apres - 220} 'elle' a reduire")

# Sauvegarder
with open('00_prologue.md', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fichier sauvegarde!")
