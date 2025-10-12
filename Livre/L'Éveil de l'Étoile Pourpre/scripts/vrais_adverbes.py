#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re
from collections import Counter

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

# Exclusions standard
exclus_standard = ['moment', 'testament', 'élément', 'fragment', 'document',
                   'ornement', 'sentiment', 'jugement', 'événement', 'mouvement']

# NOMS à exclure (pas de vrais adverbes)
noms_en_ment = [
    'serment', 'battement', 'détachement', 'comment', 'avertissement',
    'émerveillement', 'frémissement', 'entraînement', 'hurlement',
    'commencement', 'craquement', 'entendement', 'acharnement', 'bruissement',
    'grondement', 'tremblement', 'effondrement', 'firmament', 'commandement',
    'enseignement', 'rugissement', 'achèvement', 'ménagement', 'emplacement',
    'écrasement', 'aveuglement', 'fondement', 'bannissement', 'appartement',
    'gouvernement', 'établissement', 'traitement', 'bâtiment', 'campement',
    'changement', 'chargement', 'classement', 'comportement', 'dénouement',
    'développement', 'emprisonnement', 'enchaînement', 'enfermement',
    'engloutissement', 'engourdissement', 'enlèvement', 'ensevelissement',
    'équipement', 'établissement', 'fléchissement', 'fourmillement',
    'glissement', 'grincement', 'groupement', 'heurtement', 'isolement',
    'logement', 'miment', 'ravissement', 'remuement', 'renflement',
    'retentissement', 'scintillement', 'sifflement', 'soubresaut',
    'soulèvement', 'tressaillement'
]

# Combiner toutes les exclusions
toutes_exclusions = exclus_standard + noms_en_ment

# Trouver tous les mots -ment
matches = re.findall(r'\b\w+ment\b', text, re.IGNORECASE)
vrais_adverbes = [m for m in matches if m.lower() not in toutes_exclusions]

# Compter
counts = Counter(vrais_adverbes)

print("=" * 60)
print("VRAIS ADVERBES -MENT (sans noms)")
print("=" * 60)
print()

for i, (adv, count) in enumerate(counts.most_common(50), 1):
    print(f"{i:2}. {adv:30} : {count:2}x")

print()
print(f"TOTAL DISTINCT: {len(counts)} vrais adverbes")
print(f"TOTAL OCCURRENCES: {sum(counts.values())} occurrences")
print()
print(f"OBJECTIF: <= 145")
if sum(counts.values()) <= 145:
    print("OBJECTIF ATTEINT!")
else:
    print(f"MANQUE: {sum(counts.values()) - 145} reductions")
