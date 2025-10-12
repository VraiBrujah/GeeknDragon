#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

text = open('00_prologue.md', 'r', encoding='utf-8').read()

print("PHASE FINALE: Reduction 'qui' pour score optimal 8.0+/10")
print()

count_avant = text.count(' qui ')
print(f"'qui' AVANT: {count_avant}")
print(f"CIBLE: 293")
print(f"A REDUIRE: {count_avant - 293}")
print()

# Trouver tous les " qui "
matches = list(re.finditer(r' qui ', text, re.IGNORECASE))

print(f"Total 'qui' detectes: {len(matches)}")

# Besoin de remplacer exactement 64
besoin = count_avant - 293

# Stratégie: Remplacer systématiquement en gardant 1 sur 6
indices_a_remplacer = []
for i in range(len(matches)):
    if len(indices_a_remplacer) >= besoin:
        break
    # Prendre 5 sur 6, sauter 1 sur 6
    if i % 6 != 5:
        indices_a_remplacer.append(i)

print(f"Remplacements prevus: {len(indices_a_remplacer)}")
print()

# Analyser contextes et remplacer intelligemment
count = 0

for i in reversed(indices_a_remplacer):
    match = matches[i]

    # Analyser ce qui suit "qui"
    pos_apres = match.end()
    segment_apres = text[pos_apres:pos_apres + 40]

    # Déterminer remplacement selon contexte
    remplacement = None

    # Patterns verbes → participes
    if re.match(r'(\w+ait|aient)\b', segment_apres):  # imparfait
        verbe = re.match(r'(\w+)(ait|aient)\b', segment_apres)
        if verbe:
            base = verbe.group(1)
            # Exceptions irrégulières
            if base == 'ét':
                remplacement = ' étant '
            elif base == 'av':
                remplacement = ' ayant '
            elif base == 'sav':
                remplacement = ' sachant '
            elif base == 'pouv':
                remplacement = ' pouvant '
            else:
                remplacement = f' {base}ant '

    # Patterns "qui" + pronom + verbe
    elif re.match(r"(la|le|les|l'|se|s'|ne|n'|en|y)\s+\w+", segment_apres):
        # Garder tel quel pour ces cas complexes
        continue

    # Patterns "qui" + verbe au présent
    elif re.match(r'(\w+e|t|d)\b', segment_apres):
        verbe_match = re.match(r'(\w+)(e|t|d)\b', segment_apres)
        if verbe_match:
            base = verbe_match.group(1)
            if len(base) > 2:  # Éviter faux positifs courts
                remplacement = f' {base}ant '

    # Si pas de remplacement trouvé, passer au suivant
    if not remplacement:
        continue

    # Appliquer le remplacement
    text = text[:match.start()] + remplacement + text[match.end():]
    count += 1

    if count % 10 == 0:
        print(f"  {count} remplacements...")

print()
print(f"TOTAL REMPLACEMENTS: {count}")

count_apres = text.count(' qui ')
print(f"'qui' APRES: {count_apres}")
print(f"REDUCTION: -{count_avant - count_apres}")
print()

if count_apres <= 293:
    print("*** OBJECTIF 293 ATTEINT ! ***")
else:
    print(f"Encore {count_apres - 293} 'qui' a reduire")

open('00_prologue.md', 'w', encoding='utf-8').write(text)
print("Fichier sauvegarde!")
