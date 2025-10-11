#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Analyse détaillée des adverbes en -ment pour identifier les vrais des faux.
"""

import re
from pathlib import Path
from collections import Counter

# Liste exhaustive des faux positifs (noms, pas adverbes)
FAUX_POSITIFS = {
    'moment', 'serment', 'battement', 'mouvement', 'avertissement',
    'jugement', 'frémissement', 'détachement', 'émerveillement',
    'Comment', 'élément', 'fragment', 'tourment', 'sentiment',
    'testament', 'document', 'ornement', 'firmament', 'fondement',
    'vêtement', 'appartement', 'compartiment', 'département',
    'monument', 'régiment', 'événement', 'changement', 'enseignement',
    'traitement', 'gisement', 'armement', 'pansement', 'campement',
    'complément', 'supplément', 'tempérament', 'entraînement',
    'ralentissement', 'affaiblissement', 'accomplissement'
}

def analyser_fichier(fichier_path):
    """Analyse tous les mots en -ment du fichier."""
    with open(fichier_path, 'r', encoding='utf-8') as f:
        texte = f.read()

    # Trouve tous les mots en -ment
    tous_mots_ment = re.findall(r'\b\w+ment\b', texte, re.IGNORECASE)

    # Compte les occurrences
    compteur = Counter([m.lower() for m in tous_mots_ment])

    # Sépare vrais adverbes et faux positifs
    vrais_adverbes = {}
    faux_positifs_trouves = {}

    for mot, count in compteur.items():
        if mot in FAUX_POSITIFS:
            faux_positifs_trouves[mot] = count
        else:
            vrais_adverbes[mot] = count

    print("=" * 70)
    print("ANALYSE DES ADVERBES EN -MENT")
    print("=" * 70)

    print(f"\nTOTAL MOTS EN -MENT: {len(tous_mots_ment)}")
    print(f"FAUX POSITIFS (noms): {sum(faux_positifs_trouves.values())}")
    print(f"VRAIS ADVERBES: {sum(vrais_adverbes.values())}")

    print(f"\n{'FAUX POSITIFS DETECTES':=^70}")
    for mot, count in sorted(faux_positifs_trouves.items(), key=lambda x: x[1], reverse=True):
        print(f"  {mot:30} : {count:3}x")

    print(f"\n{'VRAIS ADVERBES (TRIES PAR FREQUENCE)':=^70}")
    for mot, count in sorted(vrais_adverbes.items(), key=lambda x: x[1], reverse=True):
        print(f"  {mot:30} : {count:3}x")

    print(f"\n{'RESUME':=^70}")
    print(f"Total vrais adverbes a corriger: {sum(vrais_adverbes.values())}")
    print(f"Objectif: 145 adverbes maximum")
    print(f"Reste a corriger: {max(0, sum(vrais_adverbes.values()) - 145)}")
    print("=" * 70)

if __name__ == '__main__':
    fichier = Path(__file__).parent.parent / '00_prologue.md'
    analyser_fichier(fichier)
