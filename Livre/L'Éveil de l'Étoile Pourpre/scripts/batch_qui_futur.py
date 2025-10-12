#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH: Remplacement 'qui' + futur -> restructuration")
print()

avant = text.count(' qui ')

# Trouver les futurs
pattern = r'qui (\w+ra\b|\w+ras\b|\w+rez\b|\w+rons\b|\w+ront\b)'
matches = re.findall(pattern, text)

print(f"Patterns futur detectes: {len(matches)}")
if matches:
    from collections import Counter
    counter = Counter(matches)
    print("Verbes au futur:")
    for verbe, count in counter.items():
        print(f"  'qui {verbe}': {count}x")
print()

# Remplacements ciblés
# Le futur peut être restructuré avec "devant + inf" ou "destiné à + inf"
remplacements = [
    (r'qui brisera', 'devant briser'),
    (r'qui devrait', 'devant'),  # conditionnel mais proche futur
    (r'qui détruira', 'devant détruire'),
    (r'qui transformera', 'devant transformer'),
    (r'qui révélera', 'devant révéler'),
    (r'qui permettra', 'devant permettre'),
    (r'qui changera', 'devant changer'),
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
