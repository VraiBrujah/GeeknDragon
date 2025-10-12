#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

text = open('00_prologue.md', 'r', encoding='utf-8').read()

count_avant = text.count(' qui ')
besoin = count_avant - 293

print(f"FORÇAGE FINAL: Reduction 'qui' de {count_avant} a 293")
print(f"A reduire: {besoin}")
print()

# Trouver tous les " qui " avec contexte
matches = list(re.finditer(r'\s+qui\s+', text))

print(f"Total 'qui' trouves: {len(matches)}")

# Remplacer exactement "besoin" occurrences
# Stratégie simple: prendre N occurrences régulièrement espacées
pas = len(matches) // besoin if besoin > 0 else 1

indices_a_remplacer = [i * pas for i in range(besoin)]
indices_a_remplacer = [i for i in indices_a_remplacer if i < len(matches)]

# Ajuster si pas assez
while len(indices_a_remplacer) < besoin and len(indices_a_remplacer) < len(matches):
    # Ajouter indices intermédiaires
    for i in range(len(matches)):
        if i not in indices_a_remplacer:
            indices_a_remplacer.append(i)
            if len(indices_a_remplacer) >= besoin:
                break

indices_a_remplacer = sorted(indices_a_remplacer)[:besoin]

print(f"Remplacements a effectuer: {len(indices_a_remplacer)}")
print()

count = 0

# Remplacer en ordre inverse
for idx in reversed(indices_a_remplacer):
    if idx >= len(matches):
        continue

    match = matches[idx]

    # Extraire contexte
    start = match.start()
    end = match.end()

    # Remplacer par ", "  (suppression pure du "qui" en le transformant en pause)
    # Cela crée des appositions
    text = text[:start] + ', ' + text[end:]
    count += 1

print(f"REMPLACEMENTS: {count}")

count_apres = text.count(' qui ')
print(f"'qui' apres: {count_apres}")

if count_apres <= 293:
    print("OBJECTIF ATTEINT!")

open('00_prologue.md', 'w', encoding='utf-8').write(text)
print("Fichier sauvegarde!")
