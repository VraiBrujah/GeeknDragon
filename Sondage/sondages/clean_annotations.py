#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script pour nettoyer les annotations temporaires dans SONDAGE_ORIA_MVP_4_MODULES.md
Conserve uniquement les descriptions métier professionnelles.
"""

import re

# Patterns à retirer ou simplifier
patterns_to_remove = [
    r'OrIAV\d+\s+[A-Z]+-\d+\s+-\s+',  # OrIAV1 EPIC-007 -
    r'OrIAV\d+\s+TASK-[\d.]+\s+-\s+',  # OrIAV1 TASK-007.1 -
    r'Oriav\d+\s+[A-Z]+-\d+\s+-\s+',  # Oriav2 AUTH-005 -
    r'oria-v\d+\s+FEAT-\d+\s+-\s+',   # oria-v3 FEAT-019 -
    r'OrIAV\d+\s+-\s+',                # OrIAV1 -
    r'Oriav\d+\s+-\s+',                # Oriav2 -
    r'Culture Amp[^|]*-\s+',           # Culture Amp ... -
    r'Officevibe[^|]*-\s+',            # Officevibe ... -
    r'Schedule360[^|]*-\s+',           # Schedule360 ... -
    r'QGenda[^|]*-\s+',                # QGenda ... -
    r'Shiftboard[^|]*-\s+',            # Shiftboard ... -
    r'CRITIQUE MVP\s+-\s+',            # CRITIQUE MVP -
    r'CRITIQUE\s+-\s+',                # CRITIQUE -
    r'Source:\s+OrIAV\d+\s+REQ-[A-Z]+-\d+\s*',  # Source: OrIAV3 REQ-PLAN-001
]

# Lire le fichier
with open('SONDAGE_ORIA_MVP_4_MODULES.md', 'r', encoding='utf-8') as f:
    content = f.read()

# Fonction pour nettoyer une ligne de notes
def clean_notes(match):
    full_line = match.group(0)
    notes_content = match.group(1)

    # Si vide, retourner tel quel
    if not notes_content.strip():
        return full_line

    # Appliquer tous les patterns de nettoyage
    cleaned = notes_content
    for pattern in patterns_to_remove:
        cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE)

    # Nettoyer espaces multiples
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()

    # Si après nettoyage c'est vide ou juste "-", vider complètement
    if cleaned in ['', '-', '.']:
        cleaned = ''

    # Reconstruire la ligne
    return full_line.replace(notes_content, cleaned)

# Nettoyer les lignes de tableau (dernière colonne = Notes)
# Pattern: cherche la dernière cellule du tableau
content_cleaned = re.sub(
    r'(\|\s*[^|]*\|\s*[^|]*\|\s*[^|]*\|\s*[^|]*\|\s*[^|]*\|\s*[^|]*\|\s*[^|]*\|\s*\d+\s*\|\s*\d+\s*\|\s*[\d-]+h\s*\|\s*)([^|]*)\|',
    clean_notes,
    content
)

# Compter les changements
original_lines = content.split('\n')
cleaned_lines = content_cleaned.split('\n')
changes = 0
for i, (orig, cleaned) in enumerate(zip(original_lines, cleaned_lines), 1):
    if orig != cleaned:
        changes += 1
        # print(f"Ligne {i} modifiée:")
        # print(f"  AVANT: {orig[-100:]}")
        # print(f"  APRÈS: {cleaned[-100:]}")

print(f"[OK] Nettoyage termine: {changes} lignes modifiees")

# Écrire le fichier nettoyé
with open('SONDAGE_ORIA_MVP_4_MODULES_CLEANED.md', 'w', encoding='utf-8') as f:
    f.write(content_cleaned)

print(f"[OK] Fichier nettoye sauvegarde: SONDAGE_ORIA_MVP_4_MODULES_CLEANED.md")
