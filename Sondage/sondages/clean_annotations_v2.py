#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script pour nettoyer les annotations temporaires dans SONDAGE_ORIA_MVP_4_MODULES.md
"""

import re

# Lire le fichier
with open('SONDAGE_ORIA_MVP_4_MODULES.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

cleaned_lines = []
changes = 0

for line in lines:
    # Vérifier si c'est une ligne de tableau de requis (commence par | XXX-NNN |)
    if re.match(r'^\|\s*(COM|HOR|GES|ADM|BET|PAY)-\d+\s*\|', line):
        # Trouver la dernière colonne (Notes)
        parts = line.split('|')
        if len(parts) >= 13:  # Assurer qu'il y a assez de colonnes
            notes_col = parts[-2]  # Avant-dernière colonne (la dernière est vide après |)
            original_notes = notes_col

            # Nettoyer les annotations temporaires
            cleaned_notes = notes_col

            # Retirer préfixes techniques
            patterns = [
                r'OrIAV\d+\s+[A-Z]+-[\d.]+\s+-\s*',
                r'Oriav\d+\s+[A-Z]+-\d+\s+-\s*',
                r'oria-v\d+\s+FEAT-\d+\s+-\s*',
                r'OrIAV\d+\s+-\s*',
                r'Oriav\d+\s+-\s*',
                r'Culture Amp[^-]*-\s*',
                r'Officevibe[^-]*-\s*',
                r'Schedule360[^-]*-\s*',
                r'QGenda[^-]*-\s*',
                r'Shiftboard[^-]*-\s*',
                r'CRITIQUE MVP\s+-\s*',
                r'CRITIQUE\s+-\s*',
                r'Source:\s*OrIAV\d+\s+REQ-[A-Z]+-\d+\s*',
            ]

            for pattern in patterns:
                cleaned_notes = re.sub(pattern, '', cleaned_notes, flags=re.IGNORECASE)

            # Nettoyer espaces multiples
            cleaned_notes = re.sub(r'\s+', ' ', cleaned_notes).strip()

            # Si vide ou juste tiret, vider complètement
            if cleaned_notes in ['', '-', '.', ' ']:
                cleaned_notes = ' '

            if cleaned_notes != original_notes:
                parts[-2] = ' ' + cleaned_notes + ' '
                line = '|'.join(parts)
                changes += 1

    cleaned_lines.append(line)

print(f"[OK] Nettoyage termine: {changes} lignes modifiees")

# Écrire le fichier nettoyé
with open('SONDAGE_ORIA_MVP_4_MODULES_CLEANED.md', 'w', encoding='utf-8') as f:
    f.writelines(cleaned_lines)

print(f"[OK] Fichier nettoye sauvegarde: SONDAGE_ORIA_MVP_4_MODULES_CLEANED.md")
