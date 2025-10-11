#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

# Compter
mots = len(text.split())
comme = len(re.findall(r'\bcomme\b', text))

print("=" * 60)
print("VERIFICATION FINALE")
print("=" * 60)
print()
print(f"Mots totaux: {mots:,} (objectif >= 36,473)")
ecart = mots - 36473
print(f"Ecart: {ecart:+,} mots ({(ecart/36473)*100:+.2f}%)")
print()
print(f"\"comme\": {comme} (objectif <= 150)")

if comme <= 150:
    print("  -> OBJECTIF ATTEINT")
else:
    print(f"  -> MANQUE {comme - 150} reductions")
