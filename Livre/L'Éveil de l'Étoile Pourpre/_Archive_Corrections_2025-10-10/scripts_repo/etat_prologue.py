# -*- coding: utf-8 -*-
"""Script simple pour calculer l'état exact du prologue"""

import os
import re

script_dir = os.path.dirname(os.path.abspath(__file__))
filepath = os.path.join(os.path.dirname(script_dir), '00_prologue.md')

with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# Mots
mots = len(text.split())

# Comme
comme = len(re.findall(r'\bcomme\b', text, re.IGNORECASE))

# Adverbes (avec exclusions complètes)
tous_adverbes_matches = re.findall(r'\b\w+ment\b', text, re.IGNORECASE)
faux_positifs_list = [
    'moment', 'serment', 'battement', 'mouvement', 'avertissement',
    'jugement', 'frémissement', 'détachement', 'émerveillement',
    'Comment', 'élément', 'fragment', 'tourment', 'sentiment',
    'testament', 'document', 'ornement', 'firmament', 'fondement',
    'vêtement', 'appartement', 'compartiment', 'département',
    'monument', 'régiment', 'événement', 'changement', 'enseignement',
    'traitement', 'gisement', 'armement', 'pansement', 'campement',
    'complément', 'supplément', 'tempérament', 'entraînement',
    'craquement', 'hurlement', 'grondement', 'bruissement',
    'sifflement', 'claquement', 'grincement', 'clignement',
    'hochement', 'hal étement', 'tremblement', 'effondrement',
    'bannissement', 'emplacement', 'déplacement', 'renfoncement',
    'prélèvement', 'écrasement', 'enrichissement', 'acharnement',
    'commencement', 'achèvement', 'ménagement', 'amusement',
    'agacement', 'entendement', 'commandement', 'rugissement',
    'fixement'
]
adverbes_reels = [m for m in tous_adverbes_matches if m.lower() not in [fp.lower() for fp in faux_positifs_list]]
tous_adverbes = len(tous_adverbes_matches)
faux_positifs = tous_adverbes - len(adverbes_reels)
adverbes = len(adverbes_reels)

# Mille ans
mille_ans = len(re.findall(r'mille ans', text, re.IGNORECASE))

print(f"ETAT ACTUEL DU PROLOGUE")
print(f"="*50)
print(f"Mots totaux   : {mots:,}")
print(f"'comme'       : {comme}")
print(f"Adverbes -ment: {adverbes} (total {tous_adverbes} - {faux_positifs} faux positifs)")
print(f"'mille ans'   : {mille_ans}")
print(f"="*50)

# Objectifs
print(f"\nOBJECTIFS")
print(f"="*50)
print(f"'comme'       : <= 150 (actuellement {comme}, reste {max(0, comme - 150)} a corriger)")
print(f"Adverbes -ment: <= 145 (actuellement {adverbes}, reste {max(0, adverbes - 145)} a corriger)")
print(f"'mille ans'   : <= 30 (actuellement {mille_ans}, reste {max(0, mille_ans - 30)} a corriger)")
print(f"="*50)
