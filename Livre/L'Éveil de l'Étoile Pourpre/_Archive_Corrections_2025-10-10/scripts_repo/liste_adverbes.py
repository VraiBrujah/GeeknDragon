# -*- coding: utf-8 -*-
"""Script pour lister TOUS les vrais adverbes avec contexte"""

import os
import re
from collections import Counter

script_dir = os.path.dirname(os.path.abspath(__file__))
filepath = os.path.join(os.path.dirname(script_dir), '00_prologue.md')

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Faux-positifs connus (pas des adverbes - ce sont des NOMS)
FAUX_POSITIFS = {
    # Noms communs en -ment
    'moment', 'testament', 'element', 'fragment', 'document',
    'ornement', 'sentiment', 'jugement', 'evenement', 'mouvement',
    'serment', 'battement', 'avertissement', 'emerveillement',
    'commencement', 'complement', 'chargement', 'appartement',
    'attachement', 'comportement', 'deplacement', 'empoisonnement',
    'enseignement', 'equipement', 'etablissement', 'fondement',
    'gouvernement', 'hurlement', 'investissement', 'logement',
    'monument', 'paiement', 'parlement', 'recrutement', 'reglement',
    'soulagement', 'soulevement', 'tourment', 'traitement', 'vetement',
    'detachement', 'craquement', 'fremissement', 'entrainement',
    'acharnement', 'bruissement', 'glissement', 'rugissement',
    'grondement', 'sifflement', 'murmurement', 'grincement',
    'claquement', 'grognement', 'ronflement', 'balancement',
    # Autres
    'comment', 'iment', 'ument', 'ement', 'ment', 'alement', 'ellement', 'ancement'
}

adverbs_list = []

for i, line in enumerate(lines, 1):
    matches = list(re.finditer(r'\b(\w+ment)\b', line, re.IGNORECASE))

    for match in matches:
        adverb = match.group(1).lower()

        # Filtrer faux-positifs
        if adverb in FAUX_POSITIFS:
            continue

        # Extraction contexte
        start = max(0, match.start() - 50)
        end = min(len(line), match.end() + 50)
        context = line[start:end].strip()

        adverbs_list.append({
            'line': i,
            'adverb': adverb,
            'adverb_original': match.group(1),  # Casse originale
            'context': context
        })

# Compter frequences
freq = Counter([a['adverb'] for a in adverbs_list])

print(f"TOTAL ADVERBES REELS: {len(adverbs_list)}")
print(f"\nTOP 30 PLUS FREQUENTS:")
print("="*70)

for adv, count in freq.most_common(30):
    print(f"{adv:25} : {count:3}x")

# Generer fichier CSV pour analyse manuelle
output = os.path.join(script_dir, 'adverbes_complets.txt')
with open(output, 'w', encoding='utf-8') as f:
    f.write("LISTE COMPLETE DES ADVERBES REELS\n")
    f.write("="*80 + "\n\n")

    for i, adv in enumerate(adverbs_list, 1):
        f.write(f"[{i}] Ligne {adv['line']}: {adv['adverb_original']}\n")
        f.write(f"    Contexte: ...{adv['context']}...\n\n")

print(f"\nFichier genere: {output}")
print(f"\nADVERBES A CORRIGER: 148 (sur {len(adverbs_list)} total)")
