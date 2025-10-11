# -*- coding: utf-8 -*-
"""
Analyse le prologue et génère fichier de propositions de corrections
À appliquer ensuite manuellement avec Edit
"""

import os
import re
from collections import Counter, defaultdict

script_dir = os.path.dirname(os.path.abspath(__file__))
filepath = os.path.join(os.path.dirname(script_dir), '00_prologue.md')

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()
    full_text = ''.join(lines)

print("ANALYSE DU PROLOGUE - IDENTIFICATION DES MEILLEURES CORRECTIONS")
print("="*80)

# ===== ANALYSE 1 : "COMME" =====
print("\n1. ANALYSE 'COMME' (objectif: reduire de 195 a 150, soit 45 corrections)")
print("-"*80)

comme_patterns = {
    'comme un/une/des/le/la/les + mot simple': [],
    'comme si': [],
    'comme pour': [],
    'comme dans': [],
    'comme + adjectif': [],
    'autres': []
}

for i, line in enumerate(lines, 1):
    matches = list(re.finditer(r'comme\s+(\w+)', line, re.IGNORECASE))

    for match in matches:
        full_match = match.group(0)
        next_word = match.group(1).lower()

        context_start = max(0, match.start() - 60)
        context_end = min(len(line), match.end() + 60)
        context = line[context_start:context_end].strip()

        if next_word in ['un', 'une', 'des', 'le', 'la', 'les']:
            # Extraire le nom qui suit
            extended = re.search(r'comme\s+(un|une|des|le|la|les)\s+(\w+)', line[match.start():], re.IGNORECASE)
            if extended:
                noun = extended.group(2)
                comme_patterns['comme un/une/des/le/la/les + mot simple'].append({
                    'line': i,
                    'text': extended.group(0),
                    'noun': noun,
                    'context': context,
                    'priority': 10  # Haute priorite
                })

        elif next_word == 'si':
            comme_patterns['comme si'].append({
                'line': i,
                'text': full_match,
                'context': context,
                'priority': 5  # Moyenne priorite
            })

        elif next_word == 'pour':
            comme_patterns['comme pour'].append({
                'line': i,
                'text': full_match,
                'context': context,
                'priority': 7
            })

        elif next_word == 'dans':
            comme_patterns['comme dans'].append({
                'line': i,
                'text': full_match,
                'context': context,
                'priority': 7
            })

        else:
            comme_patterns['autres'].append({
                'line': i,
                'text': full_match,
                'context': context,
                'priority': 3  # Basse priorite
            })

print("\nDistribution par type:")
for pattern_type, items in comme_patterns.items():
    print(f"  {pattern_type}: {len(items)} occurrences")

# Selectionner les 45 meilleures
all_comme = []
for items in comme_patterns.values():
    all_comme.extend(items)

all_comme.sort(key=lambda x: x['priority'], reverse=True)
top_45_comme = all_comme[:45]

print(f"\n45 meilleures opportunites selectionnees")
print(f"Lignes concernees: {sorted(set(x['line'] for x in top_45_comme))[:20]}... (premiere 20)")

# ===== ANALYSE 2 : ADVERBES -MENT =====
print("\n\n2. ANALYSE ADVERBES -MENT (objectif: reduire de 293 a 145, soit 148 corrections)")
print("-"*80)

adverbs_list = []
for i, line in enumerate(lines, 1):
    matches = list(re.finditer(r'\b(\w+ment)\b', line, re.IGNORECASE))

    for match in matches:
        adverb = match.group(1).lower()

        # Filtrer faux-positifs
        if adverb in ['moment', 'testament', 'element', 'fragment', 'document',
                      'ornement', 'sentiment', 'jugement', 'evenement', 'mouvement',
                      'iment', 'ument', 'ement', 'ment']:
            continue

        context_start = max(0, match.start() - 60)
        context_end = min(len(line), match.end() + 60)
        context = line[context_start:context_end].strip()

        adverbs_list.append({
            'line': i,
            'adverb': adverb,
            'context': context
        })

# Compter frequences
adverb_freq = Counter([a['adverb'] for a in adverbs_list])

print(f"\nTop 20 adverbes les plus frequents:")
for adv, count in adverb_freq.most_common(20):
    print(f"  {adv}: {count}x")

print(f"\nTotal adverbes a corriger: {len(adverbs_list)}")

# Priorite aux plus frequents
priority_adverbs = [adv for adv, count in adverb_freq.most_common(30)]
top_148_adverbs = [a for a in adverbs_list if a['adverb'] in priority_adverbs][:148]

print(f"148 adverbes prioritaires selectionnes")

# ===== ANALYSE 3 : "MILLE ANS" =====
print("\n\n3. ANALYSE 'MILLE ANS' (objectif: reduire de 68 a 30, soit 38 corrections)")
print("-"*80)

mille_ans_list = []
for i, line in enumerate(lines, 1):
    matches = list(re.finditer(r'mille\s+ans', line, re.IGNORECASE))

    for match in matches:
        context_start = max(0, match.start() - 80)
        context_end = min(len(line), match.end() + 80)
        context = line[context_start:context_end].strip()

        # Detecter pattern precedent
        prefix_match = re.search(r'(depuis|il y a|apres|pendant|plus de|ces|en|pour|de|pres de|presque|environ|durant|sur|a travers|au cours de|voila|fait)\s+mille\s+ans',
                                 line[max(0, match.start()-20):match.end()], re.IGNORECASE)

        pattern_type = prefix_match.group(1).lower() if prefix_match else 'autre'

        mille_ans_list.append({
            'line': i,
            'pattern': pattern_type,
            'context': context
        })

mille_ans_patterns = Counter([m['pattern'] for m in mille_ans_list])

print(f"\nDistribution par pattern:")
for pattern, count in mille_ans_patterns.most_common():
    print(f"  {pattern}: {count}x")

print(f"\nTotal 'mille ans': {len(mille_ans_list)}")
print(f"38 premiers seront corriges")

top_38_mille_ans = mille_ans_list[:38]

# ===== GENERER FICHIER DE SUGGESTIONS =====
output_file = os.path.join(script_dir, 'SUGGESTIONS_CORRECTIONS.txt')

with open(output_file, 'w', encoding='utf-8') as f:
    f.write("="*80 + "\n")
    f.write(" SUGGESTIONS DE CORRECTIONS POUR LE PROLOGUE\n")
    f.write("="*80 + "\n\n")

    f.write("INSTRUCTIONS:\n")
    f.write("1. Appliquer ces corrections avec l'outil Edit\n")
    f.write("2. TOUJOURS enrichir (texte corrige >= texte original)\n")
    f.write("3. Valider apres chaque lot de 10-15 corrections\n\n")

    f.write("="*80 + "\n")
    f.write(" CORRECTION 1 : 'COMME' (45 corrections prioritaires)\n")
    f.write("="*80 + "\n\n")

    for i, item in enumerate(top_45_comme, 1):
        f.write(f"[{i}/45] Ligne {item['line']}\n")
        f.write(f"Contexte: ...{item['context']}...\n")
        f.write(f"Cible: '{item['text']}'\n")
        f.write(f"Suggestion: [A DETERMINER - enrichir avec metaphore]\n\n")

    f.write("\n" + "="*80 + "\n")
    f.write(" CORRECTION 2 : ADVERBES -MENT (148 corrections prioritaires)\n")
    f.write("="*80 + "\n\n")

    for i, item in enumerate(top_148_adverbs, 1):
        f.write(f"[{i}/148] Ligne {item['line']}\n")
        f.write(f"Adverbe: '{item['adverb']}'\n")
        f.write(f"Contexte: ...{item['context']}...\n")
        f.write(f"Suggestion: [A DETERMINER - remplacer par construction enrichie]\n\n")

        if i >= 148:
            break

    f.write("\n" + "="*80 + "\n")
    f.write(" CORRECTION 3 : 'MILLE ANS' (38 corrections)\n")
    f.write("="*80 + "\n\n")

    for i, item in enumerate(top_38_mille_ans, 1):
        f.write(f"[{i}/38] Ligne {item['line']}\n")
        f.write(f"Pattern: '{item['pattern']} mille ans'\n")
        f.write(f"Contexte: ...{item['context']}...\n")
        f.write(f"Suggestion: Remplacer par 'millenaire', 'dix siecles', etc. (SANS 'mille ans')\n\n")

print(f"\n\n{'='*80}")
print(f"FICHIER DE SUGGESTIONS GENERE")
print(f"{'='*80}")
print(f"Emplacement: {output_file}")
print(f"\nConseils:")
print(f"1. Lire le fichier pour comprendre les patterns")
print(f"2. Appliquer corrections par lot de 10-15")
print(f"3. Valider metriques apres chaque lot")
print(f"4. Utiliser outil Edit pour modifications ciblées")
print(f"{'='*80}\n")
