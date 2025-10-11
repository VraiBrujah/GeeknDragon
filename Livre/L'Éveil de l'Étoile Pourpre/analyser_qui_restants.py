#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("=" * 80)
print("ANALYSE DES 'QUI' RESTANTS (649 occurrences)")
print("=" * 80)
print()

# Catégories
categories = {
    'relatif_refuser': [],        # "qui refusait/refusaient"
    'relatif_pouvoir': [],         # "qui pouvait/pouvaient"
    'relatif_devoir': [],          # "qui devait/devaient"
    'relatif_faire': [],           # "qui faisait"
    'relatif_etre_long': [],       # "qui + être + longue description"
    'relatif_avoir_long': [],      # "qui + avoir + longue description"
    'relatif_sujet_phrase': [],    # "qui" sujet de la phrase (à garder)
    'autres': []
}

count = 0

for i, line in enumerate(lines, 1):
    qui_matches = list(re.finditer(r'\bqui\b', line, re.IGNORECASE))

    for match in qui_matches:
        count += 1
        context_start = max(0, match.start() - 40)
        context_end = min(len(line), match.end() + 80)
        context = line[context_start:context_end].strip()

        # Catégoriser
        after_text = line[match.end():match.end()+100]

        if re.search(r'\s+(refusait|refusaient)', after_text, re.IGNORECASE):
            categories['relatif_refuser'].append((i, context[:100]))
        elif re.search(r'\s+(pouvait|pouvaient)', after_text, re.IGNORECASE):
            categories['relatif_pouvoir'].append((i, context[:100]))
        elif re.search(r'\s+(devait|devaient)', after_text, re.IGNORECASE):
            categories['relatif_devoir'].append((i, context[:100]))
        elif re.search(r'\s+(faisait|faisaient)', after_text, re.IGNORECASE):
            categories['relatif_faire'].append((i, context[:100]))
        elif re.search(r'\s+(est|était|sont|étaient)\s+\w+', after_text, re.IGNORECASE):
            categories['relatif_etre_long'].append((i, context[:100]))
        elif re.search(r'\s+(a|avait|ont|avaient)\s+\w+', after_text, re.IGNORECASE):
            categories['relatif_avoir_long'].append((i, context[:100]))
        elif match.start() < 10:  # Début de phrase
            categories['relatif_sujet_phrase'].append((i, context[:100]))
        else:
            categories['autres'].append((i, context[:100]))

print(f"TOTAL 'qui' detectes: {count}")
print()

for cat_name, items in sorted(categories.items(), key=lambda x: len(x[1]), reverse=True):
    if items:
        print(f"{cat_name.upper().replace('_', ' ')}: {len(items)} occurrences")

print()
print("=" * 80)
print("TOP 5 PAR CATEGORIE")
print("=" * 80)
print()

for cat_name, items in sorted(categories.items(), key=lambda x: len(x[1]), reverse=True):
    if items and len(items) > 0:
        print(f"\n{cat_name.upper().replace('_', ' ')} (premiers 5):")
        print("-" * 80)
        for i, (line_num, context) in enumerate(items[:5], 1):
            # Nettoyer symboles
            clean = context.replace('❖', '').replace('◆', '').replace('◈', '').replace('●', '')
            print(f"{i}. Ligne {line_num}: {clean}...")

print()
print("=" * 80)
print("RECOMMANDATION PROCHAINE ETAPE")
print("=" * 80)
print()
print("PRIORITE 1: Traiter 'qui refusait/pouvaient/devait/faisait' (verbes modaux)")
print("PRIORITE 2: Traiter 'qui + etre/avoir' restants (descriptions longues)")
print("PRIORITE 3: Analyser 'autres' cas par cas")
