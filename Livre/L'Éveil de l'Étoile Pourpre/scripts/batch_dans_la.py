#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH: Variation 'dans la' -> alternatives")
print()

avant = text.count(' dans ')
print(f"'dans' AVANT: {avant}")
print()

# Remplacements ciblés pour "dans la"
# Objectif: varier environ 30-40 occurrences
remplacements = [
    # Contextes spatiaux
    (r'dans la nuit', 'en la nuit'),
    (r'dans la pénombre', 'au sein de la pénombre'),
    (r'dans la salle', 'à travers la salle'),
    (r'dans la chambre', 'au sein de la chambre'),
    (r'dans la crypte', 'au cœur de la crypte'),
    (r'dans la grotte', 'au sein de la grotte'),
    (r'dans la caverne', 'au cœur de la caverne'),
    (r'dans la forêt', 'au sein de la forêt'),
    (r'dans la clairière', 'au sein de la clairière'),
    (r'dans la cité', 'au sein de la cité'),
    (r'dans la ville', 'au sein de la ville'),
    (r'dans la citadelle', 'au cœur de la citadelle'),
    (r'dans la tour', 'au sein de la tour'),
    (r'dans la poussière', 'parmi la poussière'),
    (r'dans la brume', 'à travers la brume'),
    (r'dans la fumée', 'à travers la fumée'),

    # Contextes temporels/abstraits
    (r'dans la mémoire', 'au sein de la mémoire'),
    (r'dans la chair', 'en la chair'),
    (r'dans la pierre', 'en la pierre'),
    (r'dans la roche', 'en la roche'),
    (r'dans la lumière', 'au sein de la lumière'),
    (r'dans la lueur', 'au sein de la lueur'),
    (r'dans la pâleur', 'au sein de la pâleur'),
    (r'dans la noirceur', 'au sein de la noirceur'),
    (r'dans la voix', 'au sein de la voix'),
    (r'dans la gorge', 'au fond de la gorge'),
    (r'dans la poitrine', 'au fond de la poitrine'),
    (r'dans la tête', 'au fond de la tête'),
    (r'dans la main', 'en la main'),
    (r'dans la paume', 'en la paume'),
    (r'dans la distance', 'au sein de la distance'),
    (r'dans la direction', 'en la direction'),
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
