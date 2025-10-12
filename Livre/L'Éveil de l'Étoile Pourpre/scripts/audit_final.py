#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

# Métriques globales
mots = len(text.split())
lignes = text.count('\n') + 1

# Adverbes -ment (avec exclusions correctes)
adverbes_exclus = ['moment', 'testament', 'élément', 'fragment', 'document',
                   'ornement', 'sentiment', 'jugement', 'événement', 'mouvement']
pattern_adverbes = r'\b\w+ment\b'
matches_adverbes = re.findall(pattern_adverbes, text, re.IGNORECASE)
adverbes_audit = len([m for m in matches_adverbes if m.lower() not in adverbes_exclus])

# "comme"
comme = len(re.findall(r'\bcomme\b', text))

# "au-delà de toute possibilité concevable par l'esprit mortel"
au_dela = len(re.findall(r'au-delà de toute possibilité concevable par l.esprit mortel', text))

# "mille ans"
mille_ans = len(re.findall(r'mille ans', text))

# Mentions personnages
morwen = text.count('Morwen')
umbra = text.count('Umbra')
saatha = text.count('saatha')
kael = text.count('Kael')

# Dialogues par symbole
dialogues_morwen = text.count('❖')
dialogues_umbra = text.count('◆')
dialogues_saatha = text.count('◈')
dialogues_kael = text.count('●')
dialogues_codex = text.count('⟨')

# Calcul écart objectifs
ecart_mots = mots - 36473
pourcentage_mots = (ecart_mots / 36473) * 100

print("=" * 60)
print("AUDIT COMPLET - ETAT ACTUEL DU PROLOGUE")
print("=" * 60)
print()

print("METRIQUES GLOBALES:")
print(f"  Mots totaux: {mots:,} (objectif >= 36,473)")
print(f"  Ecart: {ecart_mots:+,} mots ({pourcentage_mots:+.2f}%)")
print(f"  Lignes: {lignes:,}")
print()

print("OBJECTIFS PHASE 2:")
print(f"  Adverbes -ment: {adverbes_audit} (objectif <= 145)")
if adverbes_audit <= 145:
    print("    -> OBJECTIF ATTEINT")
else:
    print(f"    -> MANQUE {adverbes_audit - 145} reductions")
print()
print(f"  \"comme\": {comme} (objectif <= 150)")
if comme <= 150:
    print("    -> OBJECTIF ATTEINT")
else:
    print(f"    -> MANQUE {comme - 150} reductions")
print()
print(f"  \"au-dela de toute possibilite...\": {au_dela} (objectif <= 8)")
if au_dela <= 8:
    print("    -> OBJECTIF ATTEINT")
else:
    print(f"    -> MANQUE {au_dela - 8} reductions")
print()
print(f"  \"mille ans\": {mille_ans}")
print()

print("DISTRIBUTION PERSONNAGES (mentions):")
print(f"  Morwen: {morwen}")
print(f"  Umbra: {umbra}")
print(f"  saatha: {saatha}")
print(f"  Kael: {kael}")
print()

print("DISTRIBUTION DIALOGUES (symboles):")
print(f"  Morwen (❖): {dialogues_morwen} dialogues")
print(f"  Umbra (◆): {dialogues_umbra} dialogues")
print(f"  saatha (◈): {dialogues_saatha} dialogues")
print(f"  Kael (●): {dialogues_kael} dialogues")
print(f"  Codex (⟨⟩): {dialogues_codex} dialogues")
print()

# Estimation score
score_base = 77  # Score Phase 1
ajustements = 0

if adverbes_audit <= 145:
    ajustements += 5
if comme <= 150:
    ajustements += 3
if au_dela <= 8:
    ajustements += 5
if ecart_mots >= 0:
    ajustements += 2

score_estime = score_base + ajustements

print("ESTIMATION QUALITE:")
print(f"  Score Phase 1: {score_base}/100")
print(f"  Ajustements Phase 2: +{ajustements}")
print(f"  Score estime actuel: {score_estime}/100")
print()

print("=" * 60)
print("FIN AUDIT")
print("=" * 60)
