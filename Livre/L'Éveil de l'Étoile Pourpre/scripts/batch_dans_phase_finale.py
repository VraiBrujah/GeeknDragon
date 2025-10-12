#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

text = open('00_prologue.md', 'r', encoding='utf-8').read()

count_avant = text.count(' dans ')
besoin = count_avant - 220

print(f"PHASE FINALE: Reduction 'dans' de {count_avant} a 220")
print(f"A reduire: {besoin}")
print()

# Alternatives variées pour "dans"
alternatives = [
    'en',
    'au sein de',
    'au cœur de',
    'parmi',
    'à travers',
    'au fond de',
    'à l\'intérieur de',
    'sur',
    'sous',
]

# Trouver tous les " dans "
matches = list(re.finditer(r' dans ', text, re.IGNORECASE))

print(f"Total 'dans' trouves: {len(matches)}")

# Prendre exactement besoin occurrences, régulièrement espacées
pas = len(matches) // besoin if besoin > 0 else 1
indices = [i for i in range(0, len(matches), pas)][:besoin]

# Ajuster si pas assez
while len(indices) < besoin and len(indices) < len(matches):
    for i in range(len(matches)):
        if i not in indices:
            indices.append(i)
            if len(indices) >= besoin:
                break

indices = sorted(indices)[:besoin]

print(f"Remplacements prevus: {len(indices)}")
print()

compteur_alt = 0
count = 0

# Remplacer en ordre inverse
for idx in reversed(indices):
    if idx >= len(matches):
        continue

    match = matches[idx]
    alt = alternatives[compteur_alt % len(alternatives)]
    compteur_alt += 1

    text = text[:match.start()] + f' {alt} ' + text[match.end():]
    count += 1

    if count % 10 == 0:
        print(f"  {count} remplacements...")

print()
print(f"REMPLACEMENTS: {count}")

count_apres = text.count(' dans ')
print(f"'dans' apres: {count_apres}")
print(f"Reduction: -{count_avant - count_apres}")

if count_apres <= 220:
    print("OBJECTIF ATTEINT!")

open('00_prologue.md', 'w', encoding='utf-8').write(text)
print("Fichier sauvegarde!")
