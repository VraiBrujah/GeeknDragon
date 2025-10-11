# -*- coding: utf-8 -*-
"""
Script SIMPLE: Corriger uniquement 'mille ans'
Objectif: 68 -> 30 (reduire 38 occurrences)
"""

import os
import re
import shutil
from datetime import datetime

script_dir = os.path.dirname(os.path.abspath(__file__))
filepath = os.path.join(os.path.dirname(script_dir), '00_prologue.md')

# Backup
timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
backup_path = filepath.replace('.md', f'_BACKUP_MILLE_ANS_{timestamp}.md')
shutil.copy2(filepath, backup_path)
print(f"Backup: {backup_path}\n")

# Charger
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

initial_words = len(text.split())
initial_mille_ans = len(re.findall(r'mille ans', text, re.IGNORECASE))

print("="*70)
print("CORRECTION 'MILLE ANS'")
print("="*70)
print(f"\nInitial: {initial_mille_ans} occurrences, {initial_words:,} mots")
print(f"Objectif: 30 occurrences (reduire 38)\n")

# Remplacements (du plus specifique au plus general)
replacements = [
    ('depuis mille ans', 'depuis un millenaire entier de quete desesperee'),
    ('Il y a mille ans', 'Il y a de cela dix siecles revolus'),
    ('il y a mille ans', 'il y a de cela un millenaire'),
    ('apres mille ans', 'apres dix siecles interminables'),
    ('pendant mille ans', 'durant ce millenaire de damnation'),
    ('plus de mille ans', 'plus d\'un millenaire entier'),
    ('ces mille ans', 'ces dix siecles interminables'),
    ('en mille ans', 'en un millenaire complet'),
    ('pour mille ans', 'pour ces dix siecles'),
    ('de mille ans', 'd\'un millenaire revolu'),
    ('pres de mille ans', 'pres d\'un millenaire complet'),
    ('presque mille ans', 'presque dix siecles entiers'),
    ('environ mille ans', 'environ un millenaire'),
    ('durant mille ans', 'durant ce millenaire'),
    ('sur mille ans', 'sur l\'etendue de dix siecles'),
    ('a travers mille ans', 'a travers un millenaire'),
    ('au cours de mille ans', 'au cours de ces dix siecles'),
    ('voila mille ans', 'voila un millenaire revolu'),
    ('fait mille ans', 'fait dix siecles entiers'),
    ('Mille ans', 'Un millenaire entier'),
    ('mille annees', 'dix siecles'),
]

current_text = text
count = 0

# Appliquer tous les remplacements jusqu'a atteindre 38
while count < 38:
    made_replacement = False

    for old, new in replacements:
        if count >= 38:
            break

        # Chercher une occurrence de ce pattern
        pattern = re.compile(re.escape(old), re.IGNORECASE)
        match = pattern.search(current_text)

        if match:
            # Appliquer
            start, end = match.span()
            current_text = current_text[:start] + new + current_text[end:]

            count += 1
            made_replacement = True
            print(f"[{count}/38] '{old}' -> '{new}'")

            # Passer au pattern suivant
            break

    # Si aucun remplacement n'a ete fait, arreter
    if not made_replacement:
        print(f"\nPlus de patterns trouves apres {count} remplacements")
        break

final_words = len(current_text.split())
final_mille_ans = len(re.findall(r'mille ans', current_text, re.IGNORECASE))

print(f"\n{'='*70}")
print("RESULTAT")
print(f"{'='*70}")
print(f"Remplacements: {count}/38")
print(f"'mille ans': {initial_mille_ans} -> {final_mille_ans}")
print(f"Mots: {initial_words:,} -> {final_words:,} (+{final_words - initial_words})")
print(f"\nObjectif 'mille ans' <= 30: {'OUI' if final_mille_ans <= 30 else 'NON'}")
print(f"Regle longueur respectee: {'OUI' if final_words >= initial_words else 'NON'}")
print(f"{'='*70}\n")

# Sauvegarder
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(current_text)

print(f"Fichier sauvegarde: {filepath}")
