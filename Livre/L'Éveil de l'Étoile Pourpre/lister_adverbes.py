#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re
from collections import Counter

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

# Exclusions
exclus = ['moment', 'testament', 'élément', 'fragment', 'document',
          'ornement', 'sentiment', 'jugement', 'événement', 'mouvement']

# Trouver tous les adverbes -ment
matches = re.findall(r'\b\w+ment\b', text, re.IGNORECASE)
adverbes = [m for m in matches if m.lower() not in exclus]

# Compter les occurrences
counts = Counter(adverbes)

print("=" * 60)
print("ADVERBES -MENT DETECTES (174 total)")
print("=" * 60)
print()
print("TOP 40 PAR FREQUENCE:")
print()

for i, (adv, count) in enumerate(counts.most_common(40), 1):
    print(f"{i:2}. {adv:25} : {count:2}x")

print()
print(f"TOTAL DISTINCT: {len(counts)} adverbes differents")
print(f"TOTAL OCCURRENCES: {sum(counts.values())} occurrences")
