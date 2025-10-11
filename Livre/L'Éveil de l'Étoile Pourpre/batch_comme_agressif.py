#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH AGRESSIF: Reduction 'comme' massivement")
print()

count_avant = text.count(' comme ')
print(f"'comme' AVANT: {count_avant}")
print(f"OBJECTIF: 100")
print(f"A REDUIRE: {count_avant - 100}")
print()

# Trouver tous les " comme "
pattern = r' comme '
matches = list(re.finditer(pattern, text, re.IGNORECASE))

print(f"Total 'comme' detectes: {len(matches)}")

# Calculer combien remplacer
besoin = count_avant - 100
print(f"Besoin de remplacer: {besoin}")
print()

# Remplacer 1/3 par "tel/telle" selon contexte
# Analyser ce qui suit "comme" pour choisir genre
count = 0
indices_remplaces = []

for i, match in enumerate(matches):
    if count >= besoin:
        break

    # Prendre 1 sur 3
    if i % 3 != 0:
        continue

    # Analyser contexte après "comme"
    pos_apres = match.end()
    segment_apres = text[pos_apres:pos_apres + 30]

    # Déterminer remplacement selon contexte
    if re.match(r'un\s+\w+', segment_apres, re.IGNORECASE):
        replacement = ' tel un '
    elif re.match(r'une\s+\w+', segment_apres, re.IGNORECASE):
        replacement = ' telle une '
    elif re.match(r'des\s+\w+', segment_apres, re.IGNORECASE):
        replacement = ' tels des '
    elif re.match(r'si\s+', segment_apres, re.IGNORECASE):
        replacement = ' ainsi que si '
    elif re.match(r'(le|la|les)\s+', segment_apres, re.IGNORECASE):
        replacement = ' à l\'instar de '
    else:
        # Garder comme
        continue

    indices_remplaces.append((i, replacement))
    count += 1

print(f"Remplacements a effectuer: {len(indices_remplaces)}")
print()

# Remplacer en ordre inverse
for i, replacement in reversed(indices_remplaces):
    match = matches[i]
    text = text[:match.start()] + replacement + text[match.end():]

print(f"REMPLACEMENTS EFFECTUES: {len(indices_remplaces)}")

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
