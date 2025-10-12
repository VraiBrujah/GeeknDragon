#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH 6: Remplacement 'preposition/mot + elle'")
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

# Patterns identifiés
patterns = [
    (r'sur elle\b', 'sur {}'),
    (r'devant elle\b', 'devant {}'),
    (r'pour elle\b', 'pour {}'),
    (r'chez elle\b', 'en elle-même'),  # "chez elle" = idiomatic, reformuler
    (r'où elle\b', 'où {}'),
    (r'dont elle\b', 'dont {}'),
    (r'malgré elle\b', 'malgré {}'),
    (r'contre elle\b', 'contre {}'),
    (r'avec elle\b', 'avec {}'),
    (r'en elle\b', 'en {}'),
    (r'à elle\b', 'à {}'),
    (r'vers elle\b', 'vers {}'),
    (r'sans elle\b', 'sans {}'),
    (r'par elle\b', 'par {}'),
    (r'de elle\b', 'd\'{}'),
]

count_total = 0

for pattern, replacement_template in patterns:
    matches = list(re.finditer(pattern, text, re.IGNORECASE))

    if not matches:
        continue

    # Remplacer 2/3 des occurrences
    indices = [i for i in range(len(matches)) if i % 3 != 2]

    if indices:
        print(f"  '{pattern}': {len(matches)} trouve, {len(indices)} remplace(s)")

        for i in reversed(indices):
            match = matches[i]
            designation = get_designation()

            # Cas spécial "chez elle"
            if 'chez' in pattern:
                replacement = 'en elle-même'
            else:
                replacement = replacement_template.format(designation)

            text = text[:match.start()] + replacement + text[match.end():]
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
