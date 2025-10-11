#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re
from collections import Counter

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

# Trouver patterns "comme X"
patterns = re.findall(r'comme [a-zàâäéèêëïîôùûüÿç]+', text, re.IGNORECASE)
counts = Counter(patterns)

print("=" * 60)
print("TOP 15 PATTERNS \"comme X\" REPETITIFS")
print("=" * 60)
print()

for i, (pattern, count) in enumerate(counts.most_common(15), 1):
    if count > 1:  # Seulement les répétitifs
        print(f"{i:2}. {count:2}x : {pattern}")

print()
print(f"TOTAL \"comme\": {len(re.findall(r'\\bcomme\\b', text))} occurrences")
