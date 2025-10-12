#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH: Remplacement 'qui se/s'' + verbe pronominal")
print()

avant = text.count(' qui ')

# Identifier tous les "qui se/s'" + verbe dans le texte
pattern_se = r'qui se (\w+)'
pattern_s = r"qui s'(\w+)"

matches_se = re.findall(pattern_se, text)
matches_s = re.findall(pattern_s, text)

print(f"Patterns 'qui se' detectes: {len(matches_se)}")
print(f"Patterns 'qui s''' detectes: {len(matches_s)}")
print()

# Remplacements ciblés basés sur verbes trouvés
remplacements = [
    # "qui se" + verbe
    (r'qui se dressait', 'se dressant'),
    (r'qui se tenait', 'se tenant'),
    (r'qui se découpait', 'se découpant'),
    (r'qui se mêlait', 'se mêlant'),
    (r'qui se reflétait', 'se reflétant'),
    (r'qui se nichait', 'se nichant'),
    (r'qui se consumait', 'se consumant'),
    (r'qui se déployait', 'se déployant'),
    (r'qui se tordait', 'se tordant'),
    (r'qui se terminait', 'se terminant'),
    (r'qui se posait', 'se posant'),
    (r'qui se perdait', 'se perdant'),
    (r'qui se glissait', 'se glissant'),
    (r'qui se dessinait', 'se dessinant'),
    (r'qui se répandait', 'se répandant'),
    (r'qui se pressaient', 'se pressant'),
    (r'qui se cachait', 'se cachant'),
    (r'qui se lovait', 'se lovant'),
    (r'qui se brisait', 'se brisant'),
    (r'qui se mêlaient', 'se mêlant'),
    (r'qui se nourrit', 'se nourrissant'),
    (r'qui se meurt', 'se mourant'),

    # "qui s'" + verbe
    (r"qui s'était", "s'étant"),
    (r"qui s'élevait", "s'élevant"),
    (r"qui s'échappait", "s'échappant"),
    (r"qui s'étendait", "s'étendant"),
    (r"qui s'accrochait", "s'accrochant"),
    (r"qui s'enfonçait", "s'enfonçant"),
    (r"qui s'ouvrait", "s'ouvrant"),
    (r"qui s'effondrait", "s'effondrant"),
    (r"qui s'évaporait", "s'évaporant"),
    (r"qui s'animait", "s'animant"),
    (r"qui s'intensifiait", "s'intensifiant"),
    (r"qui s'approchait", "s'approchant"),
    (r"qui s'offrait", "s'offrant"),
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
