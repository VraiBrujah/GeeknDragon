#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH: Remplacement 'qui ont' + participe passe -> 'ayant'")
print()

avant = text.count(' qui ')

# Trouver tous les "qui ont" + mot suivant pour identifier les participes
pattern = r'qui ont (\w+)'
matches = re.findall(pattern, text)

print(f"Patterns 'qui ont' detectes: {len(matches)}")
if matches:
    from collections import Counter
    counter = Counter(matches)
    print("Top patterns:")
    for mot, count in counter.most_common(10):
        print(f"  'qui ont {mot}': {count}x")
print()

# Remplacements ciblés
remplacements = [
    (r'qui ont été', 'ayant été'),
    (r'qui ont fait', 'ayant fait'),
    (r'qui ont vu', 'ayant vu'),
    (r'qui ont cru', 'ayant cru'),
    (r'qui ont pris', 'ayant pris'),
    (r'qui ont vécu', 'ayant vécu'),
    (r'qui ont connu', 'ayant connu'),
    (r'qui ont perdu', 'ayant perdu'),
    (r'qui ont donné', 'ayant donné'),
    (r'qui ont trouvé', 'ayant trouvé'),
    (r'qui ont laissé', 'ayant laissé'),
    (r'qui ont créé', 'ayant créé'),
    (r'qui ont disparu', 'ayant disparu'),
    (r'qui ont survécu', 'ayant survécu'),
    (r'qui ont refusé', 'ayant refusé'),
    (r'qui ont accepté', 'ayant accepté'),
    (r'qui ont détruit', 'ayant détruit'),
    (r'qui ont construit', 'ayant construit'),
    (r'qui ont transformé', 'ayant transformé'),
]

count = 0
for avant_str, apres_str in remplacements:
    occurrences = len(re.findall(avant_str, text))
    if occurrences > 0:
        print(f"  '{avant_str}' -> '{apres_str}': {occurrences}x")
        text = re.sub(avant_str, apres_str, text)
        count += occurrences

print()
print(f"TOTAL REMPLACEMENTS: {count}")

apres = text.count(' qui ')
print(f"'qui' AVANT: {avant}")
print(f"'qui' APRES: {apres}")
print(f"REDUCTION: -{avant - apres}")
print()

# Sauvegarder
with open('00_prologue.md', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fichier sauvegarde!")
