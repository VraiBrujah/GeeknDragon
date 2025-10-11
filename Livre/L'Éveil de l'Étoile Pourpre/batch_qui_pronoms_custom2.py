#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH: Remplacement patterns pronoms detectes")
print()

avant = text.count(' qui ')

# Patterns identifiés par l'analyse précédente
remplacements = [
    # "qui l'" + verbe
    (r"qui l'ont", "l'ayant"),
    (r"qui l'attendait", "l'attendant"),
    (r"qui l'apaisait", "l'apaisant"),
    (r"qui l'attaquait", "l'attaquant"),
    (r"qui l'attiraient", "l'attirant"),
    (r"qui l'attendaient", "l'attendant"),
    (r"qui l'entendaient", "l'entendant"),

    # "qui la" + verbe
    (r"qui la touchent", "la touchant"),
    (r"qui la liait", "la liant"),
    (r"qui la possédent", "la possédant"),
    (r"qui la nourrit", "la nourrissant"),
    (r"qui la respiraient", "la respirant"),
    (r"qui la surprenait", "la surprenant"),

    # "qui le" + verbe
    (r"qui le frappaient", "le frappant"),
    (r"qui le lisaient", "le lisant"),

    # "qui les" + verbe
    (r"qui les arrache", "les arrachant"),
    (r"qui les animait", "les animant"),
    (r"qui les terrifie", "les terrifiant"),
    (r"qui les a ", "les ayant "),
    (r"qui les avait", "les ayant"),

    # "qui lui" + verbe
    (r"qui lui avait", "lui ayant"),
    (r"qui lui restait", "lui restant"),
    (r"qui lui rappelait", "lui rappelant"),

    # "qui a" + participe
    (r"qui a consumé", "ayant consumé"),
    (r"qui a servi", "ayant servi"),
    (r"qui a purgé", "ayant purgé"),
    (r"qui a suivi", "ayant suivi"),
    (r"qui a appris", "ayant appris"),
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
    with open('00_prologue.md', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Fichier sauvegarde!")
else:
    print("Aucun changement")
