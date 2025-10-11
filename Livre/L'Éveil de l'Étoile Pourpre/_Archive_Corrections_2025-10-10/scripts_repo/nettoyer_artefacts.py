#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Nettoie les artefacts de fusion créés par les remplacements automatiques.
"""

import re
from pathlib import Path

# Corrections des artefacts identifiés
CORRECTIONS_ARTEFACTS = [
    # Fusions de mots détectées
    ('chirurgicaler écisément', 'avec cette précision chirurgicale qui ne laissait aucune place au doute'),
    ('absoluere ment', 'avec une certitude absolue'),
    ('absolueitement', 'avec une certitude absolue'),
    ('absoluecompl étement', 'de manière absolue et totale, sans aucune restriction'),
    ('cat égoriqueabsolument', 'de manière absolue et totale, sans aucune restriction'),
    ('r éservecompl étement', 'de manière absolue et totale, sans aucune restriction'),
    ('profond eitement', 'jusqu\'au plus profond de son âme immortelle'),
    ('profond eitablement', 'jusqu\'au plus profond de son âme immortelle'),
    ('chirurgicalencieusement', 'avec cette précision chirurgicale qui ne laissait aucune place au doute'),
    ('lesuniquement', 'exclusivement et sans aucune autre considération'),
    ('d élai édiatement', 'dans l\'instant qui suivit, sans la moindre hésitation'),
    ('simplicit éimplement', 'avec cette simplicité trompeuse qui masquait la complexité'),
    ('millim étr éeuement', 'avec cette attention aux détails qui caractérisait les immortels'),
    ('sssoudainement', 'dans une soudaineté qui ne laissait aucun temps pour réagir'),
    ('soigneussement', 'avec un soin méticuleux qui ne tolérait aucune erreur'),
    ('r éserventiquement', 'avec un soin méticuleux qui ne tolérait aucune erreur'),
    ('dexactement', 'avec cette précision chirurgicale qui ne laissait aucune place au doute'),
    ('prexactement', 'avec cette précision chirurgicale qui ne laissait aucune place au doute'),
    ('esemblablement', 'de la même manière, avec une similarité troublante'),
    ('queulement', 'exclusivement et sans aucune autre considération'),
    ('esssservissssement', 'servitude'),
    ('an éanitsssement', 'annihilation'),
    ('ssoulagement', 'soulagement'),

    # Patterns de double espace
    (r'  +', ' '),

    # Patterns de ponctuation mal espacée
    (r' ,', ','),
    (r' \.', '.'),
    (r' ;', ';'),
    (r' :', ':'),
    (r' !', '!'),
    (r' \?', '?'),
]

def nettoyer_fichier(fichier_path):
    """Nettoie les artefacts du fichier."""
    print(f"Lecture de {fichier_path}...")
    with open(fichier_path, 'r', encoding='utf-8') as f:
        texte_original = f.read()

    mots_avant = len(texte_original.split())

    print(f"\nETAT INITIAL:")
    print(f"  Mots: {mots_avant:,}")

    texte_corrige = texte_original
    corrections_appliquees = 0

    print(f"\nCORRECTIONS:")
    for pattern, remplacement in CORRECTIONS_ARTEFACTS:
        # Utiliser re.escape pour les patterns qui ne sont pas des regex
        if not pattern.startswith(r'\b'):
            matches = texte_corrige.count(pattern)
            if matches > 0:
                texte_corrige = texte_corrige.replace(pattern, remplacement)
                corrections_appliquees += matches
                print(f"  [OK] '{pattern}' -> {matches} occurrence(s)")
        else:
            matches = re.findall(pattern, texte_corrige)
            if matches:
                texte_corrige = re.sub(pattern, remplacement, texte_corrige)
                corrections_appliquees += len(matches)
                print(f"  [OK] '{pattern}' -> {len(matches)} occurrence(s)")

    mots_apres = len(texte_corrige.split())

    print(f"\nETAT FINAL:")
    print(f"  Mots: {mots_apres:,} (diff: {mots_apres - mots_avant:+d})")
    print(f"  Corrections appliquees: {corrections_appliquees}")

    # Sauvegarde
    print(f"\nSauvegarde du fichier corrige...")
    with open(fichier_path, 'w', encoding='utf-8') as f:
        f.write(texte_corrige)

    print("[SUCCES] Nettoyage termine!")

if __name__ == '__main__':
    fichier = Path(__file__).parent.parent / '00_prologue.md'
    nettoyer_fichier(fichier)
