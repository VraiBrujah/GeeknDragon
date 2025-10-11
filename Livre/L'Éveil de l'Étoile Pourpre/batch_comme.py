#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH: Reduction 'comme' de 149 a 100 (-49)")
print()

count_avant = text.count(' comme ')
print(f"'comme' AVANT: {count_avant}")
print(f"OBJECTIF: 100")
print(f"A REDUIRE: {count_avant - 100}")
print()

# Alternatives pour "comme"
alternatives = {
    'comme si': 'tel que si',
    'comme une': 'telle une',
    'comme un': 'tel un',
    'comme des': 'tels des',
    'comme le': 'à l\'instar du',
    'comme la': 'à l\'instar de la',
    'comme les': 'à l\'instar des',
    'ressemblait comme': 'ressemblait à',  # redondance
}

# Patterns spécifiques contextuels
remplacements = [
    (r' comme si ', ' tel que si '),
    (r' comme une ombre', ' telle une ombre'),
    (r' comme un écho', ' tel un écho'),
    (r' comme une vague', ' telle une vague'),
    (r' comme un murmure', ' tel un murmure'),
    (r' comme des fantômes', ' tels des fantômes'),
    (r' comme un souvenir', ' tel un souvenir'),
    (r' comme une brûlure', ' telle une brûlure'),
    (r' comme un poison', ' tel un poison'),
    (r' comme une promesse', ' telle une promesse'),
    (r' comme des flammes', ' telles des flammes'),
    (r' comme le', ' à l\'instar du'),
    (r' comme la', ' à l\'instar de la'),
    (r' comme les', ' à l\'instar des'),
    (r' ressemblait comme', ' ressemblait à'),  # pléonasme
]

count_total = 0

for pattern, replacement in remplacements:
    matches = list(re.finditer(pattern, text, re.IGNORECASE))

    if not matches:
        continue

    # Remplacer 1/2 des occurrences
    indices = [i for i in range(len(matches)) if i % 2 == 0]

    if indices:
        print(f"  '{pattern.strip()}': {len(matches)} trouve, {len(indices)} remplace(s)")

        for i in reversed(indices):
            match = matches[i]
            text = text[:match.start()] + replacement + text[match.end():]
            count_total += 1

        # Arrêter si objectif atteint
        current = text.count(' comme ')
        if current <= 100:
            print(f"\nOBJECTIF ATTEINT! 'comme' = {current}")
            break

print()
print(f"TOTAL REMPLACEMENTS: {count_total}")

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
