#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH 4: Remplacement 'elle + verbes' restants")
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

# Tous les verbes possibles après "elle"
verbes = [
    'était', 'fit', 'rouvrit', 'ferma', 'pouvait', 'venait', 'toucha',
    'secoua', 'porta', 'inspira', 'portait', 'caressa', 'voyait',
    'cherchait', 'sentait', 'savait', 'devait', 'voulait', 'pensait',
    'observait', 'contemplait', 'regardait', 'marchait', 'avançait',
    'attendait', 'espérait', 'comprenait', 'sentit', 'ouvrit', 'prit',
    'leva', 'baissa', 'tourna', 'inclina', 'releva', 'abaissa',
    'tendit', 'retira', 'posa', 'saisit', 'laissa', 'abandonna',
    'reprit', 'continua', 'cessa', 'arrêta', 'commença', 'finit',
    'entendait', 'écoutait', 'percevait', 'ressentait', 'éprouvait',
    'murmura', 'souffla', 'répondit', 'demanda', 'interrogea',
    'reconnut', 'identifia', 'découvrit', 'trouva', 'aperçut',
]

count_total = 0

for verbe in verbes:
    pattern = rf'\belle {verbe}\b'
    matches = list(re.finditer(pattern, text, re.IGNORECASE))

    if not matches:
        continue

    # Remplacer 1/2 des occurrences
    indices = [i for i in range(len(matches)) if i % 2 == 0]

    if indices:
        print(f"  'elle {verbe}': {len(matches)} trouve, {len(indices)} remplace(s)")

        # Remplacer en ordre inverse
        for i in reversed(indices):
            match = matches[i]
            designation = get_designation()
            text = text[:match.start()] + f'{designation} {verbe}' + text[match.end():]
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
