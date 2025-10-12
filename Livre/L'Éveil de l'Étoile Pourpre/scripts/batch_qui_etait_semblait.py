#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("BATCH: Remplacement 'qui etait' et 'qui semblait'")
print()

avant = text.count(' qui ')

# Remplacements "qui était"
remplacements_etait = [
    (r'qui était (\w+)', r', \1,'),  # "qui était sombre" -> ", sombre,"
]

# Remplacements "qui semblait"
remplacements_semblait = [
    (r'qui semblait (\w+)', r'semblant \1'),  # "qui semblait surnaturelle" -> "semblant surnaturelle"
]

count = 0

print("Remplacements 'qui était':")
for pattern, repl in remplacements_etait:
    matches = re.findall(pattern, text)
    if matches:
        print(f"  Trouve: {len(matches)} occurrences")
        text = re.sub(pattern, repl, text)
        count += len(matches)

print()
print("Remplacements 'qui semblait':")
for pattern, repl in remplacements_semblait:
    matches = re.findall(pattern, text)
    if matches:
        print(f"  Trouve: {len(matches)} occurrences")
        text = re.sub(pattern, repl, text)
        count += len(matches)

print()
print(f"TOTAL REMPLACEMENTS: {count}")

apres = text.count(' qui ')
print(f"'qui' AVANT: {avant}")
print(f"'qui' APRES: {apres}")
print(f"REDUCTION: -{avant - apres}")
print()

# Sauvegarder
with open('00_prologue.md', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fichier sauvegarde!")
