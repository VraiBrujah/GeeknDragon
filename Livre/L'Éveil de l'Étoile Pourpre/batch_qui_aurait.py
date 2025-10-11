#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH: Remplacement 'qui aurait/auraient' -> restructuration")
print()

avant = text.count(' qui ')

# Trouver les contextes "qui aurait/auraient"
pattern_aurait = r'qui aurait (\w+)'
pattern_auraient = r'qui auraient (\w+)'

matches_aurait = re.findall(pattern_aurait, text)
matches_auraient = re.findall(pattern_auraient, text)

print(f"Patterns 'qui aurait' detectes: {len(matches_aurait)}")
if matches_aurait:
    from collections import Counter
    counter = Counter(matches_aurait)
    for mot, count in counter.items():
        print(f"  'qui aurait {mot}': {count}x")

print(f"\nPatterns 'qui auraient' detectes: {len(matches_auraient)}")
if matches_auraient:
    counter = Counter(matches_auraient)
    for mot, count in counter.items():
        print(f"  'qui auraient {mot}': {count}x")

print()
print("Ces patterns necessitent traitement manuel (conditionnel complexe)")
print("Extraction des contextes pour analyse...")
print()

# Extraire contextes complets (50 caractères avant et après)
for match in re.finditer(r'.{0,50}qui aurait \w+.{0,50}', text):
    print(f"CONTEXTE: ...{match.group()}...")
    print()

print("Fichier NON modifie - analyse seulement")
