#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH: Variation 'Elle/elle' -> designations (vampire, immortelle, Morwen)")
print()

# Compter toutes formes de "elle"
count_avant = len(re.findall(r'\belle\b', text, re.IGNORECASE))
print(f"'elle' AVANT (toutes formes): {count_avant}")
print()

# STRATEGIE: Remplacer ~1 "Elle" sur 5 en début de phrase par des désignations
# Pour éviter sur-remplacement, on cible des patterns très spécifiques

# Trouver toutes les phrases commençant par "Elle"
pattern_elle_debut = r'\n(Elle (?:avait|était|se|fit|rouvrit|ferma|pouvait|venait|toucha|secoua|porta|inspira|portait|caressa|voyait|cherchait))'

matches = re.findall(pattern_elle_debut, text)
print(f"Phrases detectees commençant par 'Elle + verbe': {len(matches)}")
print()

# Remplacements ciblés (environ 50 sur ~250 occurrences)
# IMPORTANT: On va remplacer seulement des occurrences stratégiques pour éviter incohérence
# On alterne les désignations pour créer variation

remplacements = [
    # "Elle avait" -> "La vampire avait" / "L'immortelle avait" / "Morwen avait"
    (r'\nElle avait (\w+) (les|la|le|l\'|des|un|une|son|sa|ses) (\w+) (depuis|pour|dans|avec|contre|par)',
     r'\nLa vampire avait \1 \2 \3 \4'),

    # "Elle était" -> "L'immortelle était" / "La vampire était"
    (r'\nElle était (\w+), (im|in|dé|re|é)',
     r'\nL\'immortelle était \1, \2'),

    # "Elle se" -> Utiliser désignation + verbe pronominal
    (r'\nElle se (\w+ait) (dans|vers|contre|sur|avec)',
     r'\nLa vampire se \1 \2'),

    # "Elle fit" -> "Morwen fit" / "La vampire fit"
    (r'\nElle fit (un|une|le|la|les|courir|glisser|passer)',
     r'\nMorwen fit \1'),

    # "Elle rouvrit" -> "L'immortelle rouvrit"
    (r'\nElle rouvrit',
     r'\nL\'immortelle rouvrit'),

    # "Elle ferma" -> "La vampire ferma"
    (r'\nElle ferma',
     r'\nLa vampire ferma'),

    # "Elle toucha" -> "La vampire toucha"
    (r'\nElle toucha',
     r'\nMorwen toucha'),

    # "Elle secoua" -> "L'immortelle secoua"
    (r'\nElle secoua',
     r'\nL\'immortelle secoua'),

    # "Elle inspira" -> "La vampire inspira"
    (r'\nElle inspira',
     r'\nLa vampire inspira'),
]

count = 0
for avant_str, apres_str in remplacements:
    occurrences = len(re.findall(avant_str, text))
    if occurrences > 0:
        print(f"  Pattern trouve: {occurrences}x")
        # Ne remplacer que PREMIERE occurrence de chaque pattern pour éviter sur-variation
        text = re.sub(avant_str, apres_str, text, count=1)
        count += 1

print()
print(f"TOTAL REMPLACEMENTS EFFECTUES: {count}")

count_apres = len(re.findall(r'\belle\b', text, re.IGNORECASE))
print(f"'elle' APRES: {count_apres}")
print(f"REDUCTION: -{count_avant - count_apres}")
print()

# Sauvegarder
with open('00_prologue.md', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fichier sauvegarde!")
print()
print("NOTE: Remplacement conservateur (1 occurrence/pattern) pour tester coherence")
print("Batch supplementaires necessaires pour atteindre objectif -243")
