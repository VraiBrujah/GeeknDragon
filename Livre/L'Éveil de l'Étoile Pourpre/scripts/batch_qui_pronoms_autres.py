#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH: Analyse 'qui' + pronoms objets restants")
print()

avant = text.count(' qui ')

# Analyser patterns pronoms
patterns = [
    (r"qui l'(\w+)", "l'"),
    (r"qui la (\w+)", "la "),
    (r"qui le (\w+)", "le "),
    (r"qui les (\w+)", "les "),
    (r"qui lui (\w+)", "lui "),
    (r"qui a (\w+)", "a "),
]

from collections import Counter

for pattern, prefix in patterns:
    matches = re.findall(pattern, text)
    if matches:
        counter = Counter(matches)
        print(f"\nPatterns '{prefix}...' ({len(matches)}x):")
        for verbe, count in counter.most_common(10):
            print(f"  'qui {prefix}{verbe}': {count}x")

print("\n" + "="*60)
print("Identification des patterns transformables...")
print("="*60 + "\n")

# Remplacements ciblés basés sur analyse
remplacements = [
    # "qui l'" + verbe
    (r"qui l'avait", "l'ayant"),
    (r"qui l'a ", "l'ayant "),
    (r"qui l'entourait", "l'entourant"),
    (r"qui l'enveloppait", "l'enveloppant"),
    (r"qui l'habitait", "l'habitant"),
    (r"qui l'animait", "l'animant"),

    # "qui le" + verbe (si pas déjà traités)
    (r"qui le forçait", "le forçant"),
    (r"qui le guidait", "le guidant"),
    (r"qui le maintenait", "le maintenant"),

    # "qui lui" + verbe
    (r"qui lui donnait", "lui donnant"),
    (r"qui lui permettait", "lui permettant"),
    (r"qui lui conférait", "lui conférant"),

    # "qui a" + participe passé
    (r"qui a été", "ayant été"),
    (r"qui a fait", "ayant fait"),
    (r"qui a vu", "ayant vu"),
    (r"qui a créé", "ayant créé"),
    (r"qui a détruit", "ayant détruit"),
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

if count > 0:
    # Sauvegarder seulement si changements
    with open('00_prologue.md', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Fichier sauvegarde!")
else:
    print("Aucun changement - fichier non modifie")
