#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re
from collections import Counter

text = open('00_prologue.md', 'r', encoding='utf-8').read()

# Trouver tous les adverbes en -ment
adverbes_tous = re.findall(r'\b\w+ment\b', text, re.IGNORECASE)

# Exclusions (noms)
exclusions = {
    'moment', 'testament', 'élément', 'fragment', 'document', 'ornement',
    'sentiment', 'jugement', 'événement', 'mouvement', 'appartement',
    'bâtiment', 'complément', 'supplément', 'instrument', 'vêtement',
    'fondement', 'parlement', 'serment', 'battement', 'détachement',
    'avertissement', 'émerveillement', 'frémissement', 'acharnement',
    'craquement', 'entraînement', 'comment',
}

vrais_adverbes = [a for a in adverbes_tous if a.lower() not in exclusions]

print(f"Adverbes -ment avant: {len(vrais_adverbes)}")
print(f"Objectif: 145")
print(f"A reduire: {len(vrais_adverbes) - 145}")
print()

# Compter fréquences
counter = Counter([a.lower() for a in vrais_adverbes])

print("Top 20 adverbes:")
for i, (adv, count) in enumerate(counter.most_common(20), 1):
    print(f"  {i:2}. {adv:25} : {count}x")

print()

# Stratégie: Remplacer les adverbes les plus fréquents par alternatives
remplacements = {
    # Adverbes fréquents -> alternatives sans -ment
    r'\blentement\b': 'avec lenteur',
    r'\brapidement\b': 'avec rapidité',
    r'\bdoucement\b': 'avec douceur',
    r'\bfortement\b': 'avec force',
    r'\blégèrement\b': 'avec légèreté',
    r'\bsoudainement\b': 'soudain',  # soudain n'est pas -ment
    r'\bviolemment\b': 'avec violence',
    r'\bétrangement\b': 'de manière étrange',
    r'\bréellement\b': 'en vérité',
    r'\bvraiment\b': 'en vérité',
    r'\btotalement\b': 'en totalité',
    r'\bcompletement\b': 'en entier',
    r'\bcomplètement\b': 'en entier',
    r'\bparfaitement\b': 'avec perfection',
    r'\bexactement\b': 'avec exactitude',
    r'\bprobablement\b': 'sans doute',
    r'\bcertainement\b': 'sans doute',
    r'\bfinalement\b': 'à la fin',
    r'\bégalement\b': 'aussi',
    r'\bseulement\b': 'seul',  # simplification
}

count_remplaces = 0
for pattern, replacement in remplacements.items():
    matches = list(re.finditer(pattern, text, re.IGNORECASE))

    if not matches:
        continue

    # Remplacer 1/2 des occurrences
    indices = [i for i in range(len(matches)) if i % 2 == 0]

    if indices:
        print(f"  '{pattern}': {len(matches)} -> remplacer {len(indices)}")

        for i in reversed(indices):
            match = matches[i]
            text = text[:match.start()] + replacement + text[match.end():]
            count_remplaces += 1

    # Arrêter si objectif atteint
    adv_actuels = [a for a in re.findall(r'\b\w+ment\b', text, re.IGNORECASE)
                   if a.lower() not in exclusions]
    if len(adv_actuels) <= 145:
        print(f"\nOBJECTIF ATTEINT! Adverbes: {len(adv_actuels)}")
        break

print()
print(f"TOTAL REMPLACEMENTS: {count_remplaces}")

# Recompter
adv_apres = [a for a in re.findall(r'\b\w+ment\b', text, re.IGNORECASE)
             if a.lower() not in exclusions]

print(f"Adverbes apres: {len(adv_apres)}")
print(f"Reduction: -{len(vrais_adverbes) - len(adv_apres)}")

if len(adv_apres) <= 145:
    print("OBJECTIF ATTEINT!")

open('00_prologue.md', 'w', encoding='utf-8').write(text)
print("Fichier sauvegarde!")
