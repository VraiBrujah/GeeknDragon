#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

text = open('00_prologue.md', 'r', encoding='utf-8').read()

count_avant = text.count('au-delà')
print(f"'au-delà' avant: {count_avant}")
print(f"Objectif: 8")
print(f"A reduire: {count_avant - 8}")
print()

# Trouver toutes occurrences
matches = list(re.finditer(r'au-delà', text, re.IGNORECASE))

# Alternatives
alternatives = ['par-delà', 'outre', 'passé', 'au-dessus de', 'hors de', 'transcendant']
compteur = 0

# Remplacer 7 occurrences (garder 1 sur 2 environ)
indices_a_remplacer = [i for i in range(len(matches)) if i % 2 == 0][:7]

print(f"Remplacements: {len(indices_a_remplacer)}")
print()

# Remplacer en ordre inverse
for i in reversed(indices_a_remplacer):
    match = matches[i]
    alt = alternatives[compteur % len(alternatives)]
    compteur += 1
    print(f"  {i+1}. 'au-delà' -> '{alt}'")
    text = text[:match.start()] + alt + text[match.end():]

print()

open('00_prologue.md', 'w', encoding='utf-8').write(text)

count_apres = text.count('au-delà')
print(f"'au-delà' apres: {count_apres}")
print(f"Reduction: -{count_avant - count_apres}")

if count_apres <= 8:
    print("OBJECTIF ATTEINT!")
