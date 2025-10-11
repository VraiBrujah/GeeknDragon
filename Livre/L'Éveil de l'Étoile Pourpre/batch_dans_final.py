#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH FINAL: Derniers 'dans' pour atteindre objectif 280")
print()

avant = text.count(' dans ')
print(f"'dans' AVANT: {avant}")
print(f"OBJECTIF: 280")
print(f"A REDUIRE: {avant - 280}")
print()

# Remplacements pour patterns restants
remplacements = [
    # "dans toute" -> "en toute"
    (r'dans toute ', 'en toute '),

    # "dans ses"
    (r'dans ses veines', 'à travers ses veines'),
    (r'dans ses os', 'jusque dans ses os'),
    (r'dans ses yeux', 'au fond de ses yeux'),
    (r'dans ses mains', 'en ses mains'),
    (r'dans ses bras', 'entre ses bras'),
    (r'dans ses pensées', 'parmi ses pensées'),
    (r'dans ses souvenirs', 'parmi ses souvenirs'),
    (r'dans ses entrailles', 'en ses entrailles'),

    # "dans ce/cette/ces"
    (r'dans ce monde', 'en ce monde'),
    (r'dans ce lieu', 'en ce lieu'),
    (r'dans cette salle', 'au sein de cette salle'),
    (r'dans cette pièce', 'au sein de cette pièce'),
    (r'dans cette nuit', 'en cette nuit'),
    (r'dans cette obscurité', 'au sein de cette obscurité'),
    (r'dans ces lieux', 'en ces lieux'),
    (r'dans ces temps', 'en ces temps'),

    # "dans leur/leurs"
    (r'dans leur esprit', 'en leur esprit'),
    (r'dans leurs yeux', 'au fond de leurs yeux'),
    (r'dans leurs veines', 'à travers leurs veines'),
    (r'dans leur cœur', 'au fond de leur cœur'),

    # "dans chaque"
    (r'dans chaque ', 'en chaque '),

    # "dans mon/ma/mes"
    (r'dans mon esprit', 'en mon esprit'),
    (r'dans mon cœur', 'en mon cœur'),
    (r'dans ma tête', 'en ma tête'),
    (r'dans ma mémoire', 'en ma mémoire'),
    (r'dans mes veines', 'à travers mes veines'),

    # "dans des" -> "parmi des"
    (r'dans des ', 'parmi des '),
]

count = 0
for avant_str, apres_str in remplacements:
    occurrences = len(re.findall(avant_str, text, re.IGNORECASE))
    if occurrences > 0:
        print(f"  '{avant_str}' -> '{apres_str}': {occurrences}x")
        text = re.sub(avant_str, apres_str, text, flags=re.IGNORECASE)
        count += occurrences
        # Vérifier si objectif atteint
        current = text.count(' dans ')
        if current <= 280:
            print(f"\nOBJECTIF ATTEINT! 'dans' = {current}")
            break

print()
print(f"TOTAL REMPLACEMENTS: {count}")

apres = text.count(' dans ')
print(f"'dans' APRES: {apres}")
print(f"REDUCTION: -{avant - apres}")
print()

if apres <= 280:
    print("*** OBJECTIF 280 ATTEINT OU DEPASSE ! ***")
elif apres < avant:
    print(f"Progres: encore {apres - 280} 'dans' a reduire")

# Sauvegarder
with open('00_prologue.md', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fichier sauvegarde!")
