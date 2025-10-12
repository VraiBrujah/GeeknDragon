#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("=" * 80)
print("ANALYSE DETAILLEE DES 'QUI' - CATEGORISATION POUR RESTRUCTURATION")
print("=" * 80)
print()

# Catégories de "qui" à remplacer
categories = {
    'relatif_simple': [],      # "qui + verbe simple" -> participiale
    'relatif_etre': [],         # "qui + être + adjectif" -> apposition
    'relatif_avoir': [],        # "qui + avoir" -> apposition possessive
    'relatif_complexe': [],     # "qui + verbe + complément long" -> restructuration
    'debut_phrase': [],         # Phrase commençant par "Qui" -> garder (interrogatif)
}

count_total = 0
count_remplacable = 0

for i, line in enumerate(lines, 1):
    # Trouver tous les "qui" dans la ligne
    matches = list(re.finditer(r'\bqui\b', line, re.IGNORECASE))

    for match in matches:
        count_total += 1
        context_start = max(0, match.start() - 30)
        context_end = min(len(line), match.end() + 50)
        context = line[context_start:context_end].strip()

        # Catégoriser
        # Pattern: "qui + verbe d'action simple"
        if re.search(r'\bqui\s+(marchait|glissait|observait|regardait|sentait|touchait|avançait|reculait|tournait)', line[match.end():match.end()+50], re.IGNORECASE):
            categories['relatif_simple'].append((i, context))
            count_remplacable += 1

        # Pattern: "qui + être/était + adjectif"
        elif re.search(r'\bqui\s+(est|était|sont|étaient|fut|furent)\s+\w+', line[match.end():match.end()+50], re.IGNORECASE):
            categories['relatif_etre'].append((i, context))
            count_remplacable += 1

        # Pattern: "qui + avoir/avait"
        elif re.search(r'\bqui\s+(a|avait|ont|avaient|eut|eurent)', line[match.end():match.end()+50], re.IGNORECASE):
            categories['relatif_avoir'].append((i, context))
            count_remplacable += 1

        # Pattern: phrase commençant par "Qui" (interrogatif ou sujet)
        elif match.start() < 5:
            categories['debut_phrase'].append((i, context))

        # Pattern: relatif complexe avec proposition longue
        elif len(line[match.end():]) > 80:
            categories['relatif_complexe'].append((i, context))
            count_remplacable += 1

print(f"TOTAL 'qui' detectes: {count_total}")
print(f"Remplacables facilement: {count_remplacable}")
print(f"A conserver (interrogatifs, etc.): {count_total - count_remplacable}")
print()

print("=" * 80)
print("CATEGORIE 1: RELATIFS SIMPLES (qui + verbe action)")
print("Strategie: Transformer en participiale")
print("=" * 80)
print(f"Occurrences: {len(categories['relatif_simple'])}")
print()
print("Exemples (premiers 10):")
for i, (line_num, context) in enumerate(categories['relatif_simple'][:10], 1):
    print(f"{i}. Ligne {line_num}:")
    print(f"   ...{context}...")
    print()

print("=" * 80)
print("CATEGORIE 2: RELATIFS AVEC ETRE (qui + être + adjectif)")
print("Strategie: Transformer en apposition")
print("=" * 80)
print(f"Occurrences: {len(categories['relatif_etre'])}")
print()
print("Exemples (premiers 10):")
for i, (line_num, context) in enumerate(categories['relatif_etre'][:10], 1):
    print(f"{i}. Ligne {line_num}:")
    print(f"   ...{context}...")
    print()

print("=" * 80)
print("CATEGORIE 3: RELATIFS AVEC AVOIR (qui + avoir)")
print("Strategie: Transformer en apposition possessive")
print("=" * 80)
print(f"Occurrences: {len(categories['relatif_avoir'])}")
print()
print("Exemples (premiers 10):")
for i, (line_num, context) in enumerate(categories['relatif_avoir'][:10], 1):
    print(f"{i}. Ligne {line_num}:")
    print(f"   ...{context}...")
    print()

print("=" * 80)
print("CATEGORIE 4: RELATIFS COMPLEXES (propositions longues)")
print("Strategie: Restructuration complete")
print("=" * 80)
print(f"Occurrences: {len(categories['relatif_complexe'])}")
print()

print("=" * 80)
print("RECOMMANDATION PRIORITES")
print("=" * 80)
print()
print("PRIORITE 1: Relatifs simples (faciles, fort impact)")
print(f"  -> {len(categories['relatif_simple'])} occurrences")
print("  -> Transformation mecanique: 'qui marchait' -> 'marchant'")
print()
print("PRIORITE 2: Relatifs avec etre (impact moyen)")
print(f"  -> {len(categories['relatif_etre'])} occurrences")
print("  -> Transformation: 'qui etait sombre' -> ', sombre,'")
print()
print("PRIORITE 3: Relatifs avec avoir (impact moyen)")
print(f"  -> {len(categories['relatif_avoir'])} occurrences")
print("  -> Transformation: 'qui avait des yeux' -> 'aux yeux'")
print()
print("PRIORITE 4: Relatifs complexes (difficiles, cas par cas)")
print(f"  -> {len(categories['relatif_complexe'])} occurrences")
print("  -> Necessite analyse individuelle")
print()

# Sauvegarder analyse détaillée
with open('analyse_qui_detaillee.txt', 'w', encoding='utf-8') as f:
    f.write("=" * 80 + "\n")
    f.write("ANALYSE COMPLETE DES 'QUI' POUR RESTRUCTURATION\n")
    f.write("=" * 80 + "\n\n")

    for cat_name, cat_items in categories.items():
        f.write(f"\n{'=' * 80}\n")
        f.write(f"CATEGORIE: {cat_name.upper().replace('_', ' ')}\n")
        f.write(f"Occurrences: {len(cat_items)}\n")
        f.write(f"{'=' * 80}\n\n")

        for line_num, context in cat_items:
            f.write(f"Ligne {line_num}:\n")
            f.write(f"  {context}\n\n")

print("Analyse detaillee sauvegardee dans: analyse_qui_detaillee.txt")
