#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH: Remplacement 'qui avait' par constructions sophistiquees")
print()

avant = text.count(' qui ')

# Liste des remplacements spécifiques
remplacements = [
    # Pattern: "qui avait + participe passé" -> "ayant + participe passé"
    (r'qui avait creusé', 'ayant creusé'),
    (r'qui avait jailli', 'ayant jailli'),
    (r'qui avait murmuré', 'ayant murmuré'),
    (r'qui avait appris', 'ayant appris'),
    (r'qui avait survécu', 'ayant survécu'),
    (r'qui avait mangé', 'ayant mangé'),
    (r'qui avait brûlé', 'ayant brûlé'),
    (r'qui avait été', 'ayant été'),
    (r'qui avait attendu', 'ayant attendu'),
    (r'qui avait servi', 'ayant servi'),
    (r'qui avait changé', 'ayant changé'),
    (r'qui avait détecté', 'ayant détecté'),
    (r'qui avait percé', 'ayant percé'),
    (r'qui avait permis', 'ayant permis'),
    (r'qui avait senti', 'ayant senti'),
    (r'qui avait traversé', 'ayant traversé'),
    (r'qui avait détruit', 'ayant détruit'),
    (r'qui avait coûté', 'ayant coûté'),
    (r'qui avait mal tourné', 'ayant mal tourné'),
]

count = 0
for avant_str, apres_str in remplacements:
    occurrences = len(re.findall(avant_str, text))
    if occurrences > 0:
        print(f"  '{avant_str}' -> '{apres_str}': {occurrences}x")
        text = text.replace(avant_str, apres_str)
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
