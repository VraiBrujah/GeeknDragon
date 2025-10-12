#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH 5: Remplacement 'conjonction + elle'")
print()

count_avant = len(re.findall(r'\belle\b', text, re.IGNORECASE))
print(f"'elle' AVANT: {count_avant}")
print()

# Désignations
designations = ['la vampire', 'l\'immortelle', 'Morwen', 'la créature', 'l\'ancienne', 'la prédatrice']
compteur = 0

def get_designation():
    global compteur
    d = designations[compteur % len(designations)]
    compteur += 1
    return d

# Patterns avec conjonctions/adverbes
conjonctions = [
    'et', 'mais', 'car', 'donc', 'puis', 'alors', 'ainsi', 'pourtant',
    'cependant', 'néanmoins', 'toutefois', 'encore', 'enfin', 'désormais',
    'soudain', 'maintenant', 'désormais', 'quand', 'lorsque', 'tandis que',
    'pendant que', 'bien que', 'même si', 'si', 'comme', 'quoique',
]

count_total = 0

for conj in conjonctions:
    pattern = rf'\b{conj}\s+elle\b'
    matches = list(re.finditer(pattern, text, re.IGNORECASE))

    if not matches:
        continue

    # Remplacer 1/2
    indices = [i for i in range(len(matches)) if i % 2 == 0]

    if indices:
        print(f"  '{conj} elle': {len(matches)} trouve, {len(indices)} remplace(s)")

        for i in reversed(indices):
            match = matches[i]
            designation = get_designation()
            # Reconstruire avec conjonction + désignation
            conj_original = text[match.start():match.end()].split()[0]
            text = text[:match.start()] + f'{conj_original} {designation}' + text[match.end():]
            count_total += 1

print()
print(f"TOTAL REMPLACEMENTS: {count_total}")

count_apres = len(re.findall(r'\belle\b', text, re.IGNORECASE))
print(f"'elle' APRES: {count_apres}")
print(f"REDUCTION: -{count_avant - count_apres}")
print()

# Sauvegarder
with open('00_prologue.md', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fichier sauvegarde!")
print(f"Reste a reduire: {count_apres - 220}")
