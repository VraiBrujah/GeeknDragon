#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH: Variation 'dans l'' -> alternatives")
print()

avant = text.count(' dans ')
print(f"'dans' AVANT: {avant}")
print()

# Remplacements ciblés pour "dans l'"
remplacements = [
    # Contextes spatiaux
    (r"dans l'air", "à travers l'air"),
    (r"dans l'ombre", "au sein de l'ombre"),
    (r"dans l'obscurité", "au sein de l'obscurité"),
    (r"dans l'eau", "au sein de l'eau"),
    (r"dans l'espace", "à travers l'espace"),
    (r"dans l'enceinte", "au sein de l'enceinte"),
    (r"dans l'entrée", "à travers l'entrée"),
    (r"dans l'alcôve", "au sein de l'alcôve"),
    (r"dans l'abîme", "au cœur de l'abîme"),
    (r"dans l'antre", "au cœur de l'antre"),
    (r"dans l'arène", "au sein de l'arène"),

    # Contextes temporels/abstraits
    (r"dans l'instant", "en cet instant"),
    (r"dans l'éternité", "au sein de l'éternité"),
    (r"dans l'histoire", "au fil de l'histoire"),
    (r"dans l'esprit", "au sein de l'esprit"),
    (r"dans l'âme", "au sein de l'âme"),
    (r"dans l'espoir", "au sein de l'espoir"),
    (r"dans l'attente", "en l'attente"),
    (r"dans l'oubli", "au sein de l'oubli"),
    (r"dans l'ombre", "au sein de l'ombre"),
    (r"dans l'écho", "au sein de l'écho"),
    (r"dans l'univers", "au sein de l'univers"),
]

count = 0
for avant_str, apres_str in remplacements:
    occurrences = len(re.findall(avant_str, text, re.IGNORECASE))
    if occurrences > 0:
        print(f"  '{avant_str}' -> '{apres_str}': {occurrences}x")
        text = re.sub(avant_str, apres_str, text, flags=re.IGNORECASE)
        count += occurrences

print()
print(f"TOTAL REMPLACEMENTS: {count}")

apres = text.count(' dans ')
print(f"'dans' APRES: {apres}")
print(f"REDUCTION: -{avant - apres}")
print()

# Sauvegarder
with open('00_prologue.md', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fichier sauvegarde!")
