#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH: Remplacement 'qui' + verbes d'action simples")
print()

# Compteurs
avant = text.count(' qui ')
remplacements = 0

# Pattern 1: "qui pulsait" -> "pulsant"
pattern1 = r'(\w+)\s+qui\s+pulsait'
matches1 = re.findall(pattern1, text)
print(f"Pattern 'qui pulsait': {len(matches1)} occurrences")
text = re.sub(pattern1, r'\1 pulsant', text)
remplacements += len(matches1)

# Pattern 2: "qui portait" -> "portant"
pattern2 = r'(\w+)\s+qui\s+portait'
matches2 = re.findall(pattern2, text)
print(f"Pattern 'qui portait': {len(matches2)} occurrences")
text = re.sub(pattern2, r'\1 portant', text)
remplacements += len(matches2)

# Pattern 3: "qui rongeait" -> "rongeant"
pattern3 = r'(\w+)\s+qui\s+rongeait'
matches3 = re.findall(pattern3, text)
print(f"Pattern 'qui rongeait': {len(matches3)} occurrences")
text = re.sub(pattern3, r'\1 rongeant', text)
remplacements += len(matches3)

# Pattern 4: "qui grondait" -> "grondant"
pattern4 = r'(\w+)\s+qui\s+grondait'
matches4 = re.findall(pattern4, text)
print(f"Pattern 'qui grondait': {len(matches4)} occurrences")
text = re.sub(pattern4, r'\1 grondant', text)
remplacements += len(matches4)

# Pattern 5: "qui déchirait" -> "déchirant"
pattern5 = r'(\w+)\s+qui\s+déchirait'
matches5 = re.findall(pattern5, text)
print(f"Pattern 'qui déchirait': {len(matches5)} occurrences")
text = re.sub(pattern5, r'\1 déchirant', text)
remplacements += len(matches5)

# Pattern 6: "qui rampait" -> "rampant"
pattern6 = r'(\w+)\s+qui\s+rampait'
matches6 = re.findall(pattern6, text)
print(f"Pattern 'qui rampait': {len(matches6)} occurrences")
text = re.sub(pattern6, r'\1 rampant', text)
remplacements += len(matches6)

# Pattern 7: "qui murmurait" -> "murmurant"
pattern7 = r'(\w+)\s+qui\s+murmurait'
matches7 = re.findall(pattern7, text)
print(f"Pattern 'qui murmurait': {len(matches7)} occurrences")
text = re.sub(pattern7, r'\1 murmurant', text)
remplacements += len(matches7)

print()
print(f"TOTAL REMPLACEMENTS: {remplacements}")

apres = text.count(' qui ')
print(f"'qui' AVANT: {avant}")
print(f"'qui' APRES: {apres}")
print(f"REDUCTION: -{avant - apres}")
print()

# Sauvegarder
with open('00_prologue.md', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fichier sauvegarde avec succes!")
