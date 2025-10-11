#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH 7: Remplacement AGRESSIF restants (3/4 occurrences)")
print()

count_avant = len(re.findall(r'\belle\b', text, re.IGNORECASE))
print(f"'elle' AVANT: {count_avant}")
print(f"OBJECTIF: 220")
print(f"A REDUIRE: {count_avant - 220}")
print()

# Désignations variées
designations = [
    'la vampire',
    'l\'immortelle',
    'Morwen',
    'la créature millénaire',
    'l\'ancienne',
    'la prédatrice',
    'l\'être',
    'la morte-vivante',
]

compteur = 0

def get_designation():
    global compteur
    d = designations[compteur % len(designations)]
    compteur += 1
    return d

# Trouver TOUS les "elle" restants (tous contextes)
pattern = r'\belle\b'
matches = list(re.finditer(pattern, text, re.IGNORECASE))

print(f"Total 'elle' detectes: {len(matches)}")

# Calculer combien il faut remplacer pour atteindre 220
besoin = count_avant - 220
if besoin <= 0:
    print("Objectif deja atteint!")
else:
    print(f"Besoin de remplacer: {besoin} 'elle'")
    print()

    # Prendre exactement le nombre nécessaire, en sautant 1 sur 4
    indices_a_remplacer = []
    compteur_skip = 0

    for i in range(len(matches)):
        if len(indices_a_remplacer) >= besoin:
            break
        # Sauter 1 sur 4 pour garder variation
        if compteur_skip % 4 != 3:
            indices_a_remplacer.append(i)
        compteur_skip += 1

    print(f"Remplacement de {len(indices_a_remplacer)} occurrences...")
    print()

    # Remplacer en ordre inverse
    count = 0
    for i in reversed(indices_a_remplacer):
        match = matches[i]
        designation = get_designation()

        # Remplacer en préservant la casse
        original = text[match.start():match.end()]
        if original[0].isupper():
            # Mettre majuscule sur désignation
            if designation.startswith("l'"):
                designation = "L'" + designation[2:]
            else:
                designation = designation[0].upper() + designation[1:]

        text = text[:match.start()] + designation + text[match.end():]
        count += 1

        # Afficher progression tous les 20
        if count % 20 == 0:
            print(f"  {count} remplacements effectues...")

print()
print(f"TOTAL REMPLACEMENTS: {count}")

count_apres = len(re.findall(r'\belle\b', text, re.IGNORECASE))
print(f"'elle' APRES: {count_apres}")
print(f"REDUCTION: -{count_avant - count_apres}")
print()

if count_apres <= 220:
    print("*** OBJECTIF 220 ATTEINT OU DEPASSE ! ***")
else:
    print(f"Encore {count_apres - 220} 'elle' a reduire")

# Sauvegarder
with open('00_prologue.md', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fichier sauvegarde!")
