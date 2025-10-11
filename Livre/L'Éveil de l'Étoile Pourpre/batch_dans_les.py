#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH: Variation 'dans les' -> alternatives")
print()

avant = text.count(' dans ')
print(f"'dans' AVANT: {avant}")
print()

# Remplacements ciblés contextuels pour "dans les"
# Objectif: varier environ 30-40 occurrences sur 90
remplacements = [
    # Contextes spatiaux
    (r'dans les ténèbres', 'au sein des ténèbres'),
    (r'dans les ombres', 'parmi les ombres'),
    (r'dans les profondeurs', 'au cœur des profondeurs'),
    (r'dans les ruines', 'parmi les ruines'),
    (r'dans les couloirs', 'à travers les couloirs'),
    (r'dans les montagnes', 'au sein des montagnes'),
    (r'dans les entrailles', 'en les entrailles'),
    (r'dans les flammes', 'parmi les flammes'),
    (r'dans les cendres', 'parmi les cendres'),
    (r'dans les décombres', 'parmi les décombres'),
    (r'dans les abysses', 'au sein des abysses'),
    (r'dans les cavernes', 'au cœur des cavernes'),
    (r'dans les chambres', 'à travers les chambres'),
    (r'dans les salles', 'à travers les salles'),
    (r'dans les cryptes', 'au sein des cryptes'),

    # Contextes temporels
    (r'dans les siècles', 'à travers les siècles'),
    (r'dans les âges', 'à travers les âges'),
    (r'dans les années', 'au fil des années'),
    (r'dans les temps', 'en ces temps'),
    (r'dans les jours', 'au fil des jours'),

    # Contextes abstraits
    (r'dans les veines', 'à travers les veines'),
    (r'dans les pensées', 'parmi les pensées'),
    (r'dans les souvenirs', 'parmi les souvenirs'),
    (r'dans les mémoires', 'au sein des mémoires'),
    (r'dans les regards', 'au sein des regards'),
    (r'dans les mots', 'à travers les mots'),
    (r'dans les silences', 'au sein des silences'),
    (r'dans les échos', 'parmi les échos'),
    (r'dans les airs', 'à travers les airs'),
    (r'dans les cieux', 'à travers les cieux'),
    (r'dans les os', 'jusque dans les os'),  # enrichissement idiomatique
    (r'dans les chairs', 'en les chairs'),
    (r'dans les âmes', 'au sein des âmes'),
    (r'dans les cœurs', 'au sein des cœurs'),
    (r'dans les entrailles', 'en les entrailles'),
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
