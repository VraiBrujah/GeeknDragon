#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Corrections finales et nettoyage"""

from pathlib import Path

fichier = Path(__file__).parent / "00_prologue.md"

with open(fichier, 'r', encoding='utf-8') as f:
    contenu = f.read()

# Correction erreur "je découvrirai" → "elle découvrira"
contenu = contenu.replace(
    "Quelle que soit cette présence, je découvrirai que je suis bien plus dangereuse qu'elle ne peut l'imaginer",
    "Quelle que soit cette présence, elle découvrira que je suis bien plus dangereuse qu'elle ne peut l'imaginer"
)

# Correction manquante "siffla-t-la prédatrice"
contenu = contenu.replace(
    "siffla-t-la prédatrice",
    "siffla-t-elle"
)

# Correction "répéta-t-l'immortelle"
contenu = contenu.replace(
    "répéta-t-l'immortelle",
    "répéta-t-elle"
)

# Correction "acheva-t-l'ancienne"
contenu = contenu.replace(
    "acheva-t-l'ancienne",
    "acheva-t-elle"
)

# Correction "pensa-t-l'ancienne" (si existe)
contenu = contenu.replace(
    "pensa-t-l'ancienne",
    "pensa-t-elle"
)

# Correction "dit-l'ancienne" (si existe)
contenu = contenu.replace(
    "dit-l'ancienne",
    "dit-elle"
)

with open(fichier, 'w', encoding='utf-8') as f:
    f.write(contenu)

print("Corrections finales appliquees!")
