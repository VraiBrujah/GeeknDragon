#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH 1: Remplacement MASSIF 'Elle' debut de phrase (2/3 occurrences)")
print()

count_avant = len(re.findall(r'\belle\b', text, re.IGNORECASE))
print(f"'elle' AVANT: {count_avant}")
print()

# Alternance de désignations
designations = [
    'Morwen',
    'La vampire',
    'L\'immortelle',
    'La créature millénaire',
    'L\'ancienne',
    'La prédatrice',
]

compteur = 0

def get_designation():
    global compteur
    d = designations[compteur % len(designations)]
    compteur += 1
    return d

# Trouver TOUS les "Elle" en début de phrase
pattern = r'\nElle\s+'
matches = list(re.finditer(pattern, text))

print(f"Total 'Elle' debut de phrase: {len(matches)}")
print(f"Cible remplacement: {len(matches) * 2 // 3} (2/3)")
print()

# Remplacer 2/3 des occurrences (prendre 2 sur 3)
indices_a_remplacer = []
for i in range(len(matches)):
    if i % 3 != 2:  # Garder seulement 1 sur 3
        indices_a_remplacer.append(i)

# Remplacer en ordre inverse
count = 0
for i in reversed(indices_a_remplacer):
    match = matches[i]
    designation = get_designation()
    text = text[:match.start()] + f'\n{designation} ' + text[match.end():]
    count += 1

print(f"REMPLACEMENTS EFFECTUES: {count}")
print()

count_apres = len(re.findall(r'\belle\b', text, re.IGNORECASE))
print(f"'elle' APRES: {count_apres}")
print(f"REDUCTION: -{count_avant - count_apres}")
print()

# Sauvegarder
with open('00_prologue.md', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fichier sauvegarde!")
print()
print(f"Reste a reduire: {count_apres - 220} 'elle'")
