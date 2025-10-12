#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH: Variation 'dans le' -> alternatives")
print()

avant = text.count(' dans ')
print(f"'dans' AVANT: {avant}")
print()

# Remplacements ciblés pour "dans le"
remplacements = [
    # Contextes spatiaux
    (r'dans le vide', 'au sein du vide'),
    (r'dans le silence', 'au sein du silence'),
    (r'dans le néant', 'au sein du néant'),
    (r'dans le couloir', 'à travers le couloir'),
    (r'dans le temple', 'au sein du temple'),
    (r'dans le sanctuaire', 'au cœur du sanctuaire'),
    (r'dans le palais', 'au sein du palais'),
    (r'dans le château', 'au sein du château'),
    (r'dans le manoir', 'au sein du manoir'),
    (r'dans le tombeau', 'au cœur du tombeau'),
    (r'dans le sarcophage', 'au sein du sarcophage'),
    (r'dans le monde', 'au sein du monde'),
    (r'dans le ciel', 'à travers le ciel'),
    (r'dans le vent', 'à travers le vent'),
    (r'dans le froid', 'au sein du froid'),
    (r'dans le sol', 'en le sol'),
    (r'dans le mur', 'en le mur'),
    (r'dans le plafond', 'en le plafond'),

    # Contextes temporels/abstraits
    (r'dans le temps', 'à travers le temps'),
    (r'dans le passé', 'au sein du passé'),
    (r'dans le présent', 'en ce présent'),
    (r'dans le regard', 'au sein du regard'),
    (r'dans le visage', 'sur le visage'),
    (r'dans le corps', 'au sein du corps'),
    (r'dans le sang', 'à travers le sang'),
    (r'dans le cœur', 'au sein du cœur'),
    (r'dans le crâne', 'au fond du crâne'),
    (r'dans le cerveau', 'au sein du cerveau'),
    (r'dans le dos', 'sur le dos'),
    (r'dans le ventre', 'au fond du ventre'),
    (r'dans le souffle', 'au sein du souffle'),
    (r'dans le murmure', 'au sein du murmure'),
    (r'dans le cri', 'au sein du cri'),
    (r'dans le geste', 'au sein du geste'),
    (r'dans le mouvement', 'au sein du mouvement'),
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
