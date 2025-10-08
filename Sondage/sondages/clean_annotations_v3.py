#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Nettoyage complet et agressif des annotations temporaires
"""

import re

with open('SONDAGE_ORIA_MVP_4_MODULES.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

cleaned_lines = []
changes = 0

for line in lines:
    # Vérifier si c'est une ligne de tableau de requis
    if re.match(r'^\|\s*(COM|HOR|GES|ADM|BET|PAY)-\d+\s*\|', line):
        parts = line.split('|')
        if len(parts) >= 13:
            notes_col = parts[-2]
            original_notes = notes_col

            # Liste complète de patterns à retirer
            cleaned_notes = notes_col

            # Patterns complets à retirer
            patterns_full = [
                r'OrIAV\d+\s+[A-Z]+-[\d.]+\s+-\s*[^|]*',  # OrIAV1 EPIC-007 - ...
                r'Oriav\d+\s+[A-Z]+-\d+\s+-\s*[^|]*',     # Oriav2 AUTH-005 - ...
                r'oria-v\d+\s+FEAT-\d+\s+-\s*[^|]*',      # oria-v3 FEAT-019 - ...
                r'OrIAV\d+\s+[a-z_]+\s+-\s*[^|]*',        # OrIAV1 lieux_historique_travail - ...
                r'OrIAV\d+\s+-\s*[^|]*',                  # OrIAV1 - ...
                r'Oriav\d+\s+-\s*[^|]*',                  # Oriav2 - ...
                r'Culture Amp[^|]*',                      # Culture Amp ...
                r'Officevibe[^|]*',                       # Officevibe ...
                r'Schedule360[^|]*',                      # Schedule360 ...
                r'QGenda[^|]*',                           # QGenda ...
                r'Shiftboard[^|]*',                       # Shiftboard ...
                r'CRITIQUE MVP\s+-\s*[^|]*',              # CRITIQUE MVP - ...
                r'CRITIQUE\s+-\s*[^|]*',                  # CRITIQUE - ...
                r'Source:\s*OrIAV\d+\s+REQ-[A-Z]+-\d+\s*[^|]*',  # Source: OrIAV3 REQ-PLAN-001 ...
            ]

            for pattern in patterns_full:
                cleaned_notes = re.sub(pattern, '', cleaned_notes, flags=re.IGNORECASE)

            # Patterns partiels (début de ligne)
            patterns_start = [
                r'^\s*OrIAV\d+\s+',
                r'^\s*Oriav\d+\s+',
                r'^\s*oria-v\d+\s+',
            ]

            for pattern in patterns_start:
                cleaned_notes = re.sub(pattern, '', cleaned_notes, flags=re.IGNORECASE)

            # Nettoyer caractères résiduels
            cleaned_notes = re.sub(r'\s+-\s+', ' ', cleaned_notes)  # Tirets seuls
            cleaned_notes = re.sub(r'\s+', ' ', cleaned_notes)       # Espaces multiples
            cleaned_notes = cleaned_notes.strip()

            # Vider si reste juste ponctuation
            if re.match(r'^[-.,;:]+$', cleaned_notes):
                cleaned_notes = ''

            if cleaned_notes != original_notes:
                parts[-2] = ' ' + cleaned_notes + ' '
                line = '|'.join(parts)
                changes += 1

    cleaned_lines.append(line)

print(f"[OK] Nettoyage termine: {changes} lignes modifiees")

with open('SONDAGE_ORIA_MVP_4_MODULES.md', 'w', encoding='utf-8') as f:
    f.writelines(cleaned_lines)

print(f"[OK] Fichier mis a jour: SONDAGE_ORIA_MVP_4_MODULES.md")
