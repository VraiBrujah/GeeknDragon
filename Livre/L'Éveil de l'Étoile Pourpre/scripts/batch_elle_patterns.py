#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH 3: Remplacement patterns 'elle + mot frequent'")
print()

count_avant = len(re.findall(r'\belle\b', text, re.IGNORECASE))
print(f"'elle' AVANT: {count_avant}")
print()

# Désignations
designations = ['la vampire', 'l\'immortelle', 'Morwen', 'la créature', 'l\'ancienne']
compteur = 0

def get_designation():
    global compteur
    d = designations[compteur % len(designations)]
    compteur += 1
    return d

# Patterns fréquents identifiés par l'analyse
patterns = [
    r'\belle en\b',      # 49x
    r'\belle avec\b',    # 45x
    r'\belle avait\b',   # 30x
    r'\belle se\b',      # 26x
    r'\belle ne\b',      # 21x
]

count_total = 0

for pattern in patterns:
    matches = list(re.finditer(pattern, text, re.IGNORECASE))

    if not matches:
        continue

    # Remplacer 1/2 des occurrences
    indices = [i for i in range(len(matches)) if i % 2 == 0]

    print(f"Pattern '{pattern}': {len(matches)} trouve, {len(indices)} remplaces")

    # Remplacer en ordre inverse
    for i in reversed(indices):
        match = matches[i]
        # Extraire le mot après "elle"
        matched_text = match.group()
        mot_apres = matched_text.split()[1]  # "en", "avec", etc.

        designation = get_designation()
        text = text[:match.start()] + f'{designation} {mot_apres}' + text[match.end():]
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
