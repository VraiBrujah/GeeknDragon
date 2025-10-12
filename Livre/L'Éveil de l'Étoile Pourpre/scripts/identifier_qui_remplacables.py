#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()
    lines = text.split('\n')

print("=" * 80)
print("IDENTIFICATION DES 'QUI' REMPLACABLES PAR BATCH")
print("=" * 80)
print()

# Patterns spécifiques à remplacer
patterns_simples = [
    (r'(\w+)\s+qui\s+(marchait|glissait|avançait|reculait|tournait|flottait|dansait|rampait)', 'verbes_mouvement'),
    (r'(\w+)\s+qui\s+(portait|tenait|brandissait|serrait)', 'verbes_possession'),
    (r'(\w+)\s+qui\s+(pulsait|brillait|scintillait|luisait|rayonnait)', 'verbes_lumiere'),
    (r'(\w+)\s+qui\s+(murmurait|chuchotait|sifflait|grondait|hurlait)', 'verbes_son'),
    (r'(\w+)\s+qui\s+(dévorait|consumait|rongeait|déchirait|transperçait)', 'verbes_destruction'),
]

print("DETECTION PAR PATTERNS:")
print()

total_remplacable = 0

for pattern, category in patterns_simples:
    matches = re.findall(pattern, text, re.IGNORECASE)
    if matches:
        print(f"{category.upper()}: {len(matches)} occurrences")
        print(f"  Exemples: {matches[:5]}")
        print()
        total_remplacable += len(matches)

print(f"TOTAL DETECTE PAR PATTERNS: {total_remplacable}")
print()

# Identifier les "qui" dans des phrases longues (> 100 caractères après "qui")
print("=" * 80)
print("'QUI' DANS PHRASES LONGUES (candidates restructuration)")
print("=" * 80)
print()

qui_phrases_longues = []
for i, line in enumerate(lines, 1):
    matches = list(re.finditer(r'\bqui\b', line, re.IGNORECASE))
    for match in matches:
        texte_apres = line[match.end():]
        if len(texte_apres) > 100:
            qui_phrases_longues.append((i, line.strip()[:150]))

print(f"Phrases avec 'qui' + texte long (>100 car): {len(qui_phrases_longues)}")
print()
print("Premiers 15 exemples:")
for i, (line_num, excerpt) in enumerate(qui_phrases_longues[:15], 1):
    # Nettoyer pour affichage
    clean_excerpt = excerpt.replace('❖', '').replace('◆', '').replace('◈', '').replace('●', '')
    print(f"{i}. Ligne {line_num}: {clean_excerpt}...")
print()

# Identifier "qui + était/avait/etc"
print("=" * 80)
print("'QUI' + VERBES AUXILIAIRES (faciles à transformer)")
print("=" * 80)
print()

auxiliaires = [
    (r'\bqui\s+était\b', 'etait'),
    (r'\bqui\s+avait\b', 'avait'),
    (r'\bqui\s+semblait\b', 'semblait'),
    (r'\bqui\s+paraissait\b', 'paraissait'),
    (r'\bqui\s+restait\b', 'restait'),
]

total_auxiliaires = 0
for pattern, nom in auxiliaires:
    count = len(re.findall(pattern, text, re.IGNORECASE))
    if count > 0:
        print(f"  'qui {nom}': {count}x")
        total_auxiliaires += count

print()
print(f"TOTAL 'QUI' + AUXILIAIRES: {total_auxiliaires}")
print()

# RECOMMANDATIONS
print("=" * 80)
print("RECOMMANDATIONS BATCH 1 (50 PREMIERS REMPLACEMENTS)")
print("=" * 80)
print()

print("ETAPE 1: Remplacer 'qui + verbes mouvement' (priorite haute)")
print("  Pattern: 'X qui marchait' -> 'X marchant'")
print("  Estimation: 30-40 occurrences")
print()

print("ETAPE 2: Remplacer 'qui était' par appositions")
print("  Pattern: 'X qui était Y' -> 'X, Y,'")
print("  Estimation: 15-20 occurrences")
print()

print("ETAPE 3: Remplacer 'qui avait' par constructions possessives")
print("  Pattern: 'X qui avait des Y' -> 'X aux Y'")
print("  Estimation: 10-15 occurrences")
print()

print("TOTAL BATCH 1: ~60 remplacements")
print("Impact estime: 709 -> 650 'qui' (-60)")
print()

print("=" * 80)
print("VEUX-TU QUE JE COMMENCE LES REMPLACEMENTS BATCH 1?")
print("=" * 80)
