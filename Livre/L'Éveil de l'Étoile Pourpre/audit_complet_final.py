#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re
from collections import Counter

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

# ============================================================
# METRIQUES GLOBALES
# ============================================================
mots = len(text.split())
lignes = text.count('\n') + 1
caracteres = len(text)

# ============================================================
# ADVERBES -MENT (selon méthodologie audit indépendant)
# ============================================================
exclus_standard = ['moment', 'testament', 'élément', 'fragment', 'document',
                   'ornement', 'sentiment', 'jugement', 'événement', 'mouvement']
pattern_adverbes = r'\b\w+ment\b'
matches_adverbes = re.findall(pattern_adverbes, text, re.IGNORECASE)
adverbes_audit = len([m for m in matches_adverbes if m.lower() not in exclus_standard])

# VRAIS ADVERBES (excluant noms)
noms_en_ment = [
    'serment', 'battement', 'détachement', 'comment', 'avertissement',
    'émerveillement', 'frémissement', 'entraînement', 'hurlement',
    'commencement', 'craquement', 'entendement', 'acharnement', 'bruissement',
    'grondement', 'tremblement', 'effondrement', 'firmament', 'commandement',
    'enseignement', 'rugissement', 'achèvement', 'ménagement', 'emplacement',
    'écrasement', 'aveuglement', 'fondement', 'bannissement', 'appartement',
    'gouvernement', 'établissement', 'traitement', 'bâtiment', 'campement',
    'changement', 'chargement', 'classement', 'comportement', 'dénouement',
    'développement', 'emprisonnement', 'enchaînement', 'enfermement',
    'engloutissement', 'engourdissement', 'enlèvement', 'ensevelissement',
    'équipement', 'établissement', 'fléchissement', 'fourmillement',
    'glissement', 'grincement', 'groupement', 'heurtement', 'isolement',
    'logement', 'miment', 'ravissement', 'remuement', 'renflement',
    'retentissement', 'scintillement', 'sifflement', 'soubresaut',
    'soulèvement', 'tressaillement', 'déplacement', 'renfoncement',
    'amusement', 'halètement', 'agacement', 'claquement', 'soulagement',
    'hochement', 'clignement'
]
toutes_exclusions = exclus_standard + noms_en_ment
vrais_adverbes = [m for m in matches_adverbes if m.lower() not in toutes_exclusions]
vrais_adverbes_count = len(vrais_adverbes)

# ============================================================
# "COMME"
# ============================================================
comme = len(re.findall(r'\bcomme\b', text))

# ============================================================
# "AU-DELA DE TOUTE POSSIBILITE..."
# ============================================================
au_dela = len(re.findall(r'au-delà de toute possibilité concevable par l.esprit mortel', text))

# ============================================================
# "MILLE ANS"
# ============================================================
mille_ans = len(re.findall(r'mille ans', text))

# ============================================================
# PERSONNAGES (mentions)
# ============================================================
morwen = text.count('Morwen')
umbra = text.count('Umbra')
saatha = text.count('saatha')
kael = text.count('Kael')

# ============================================================
# DIALOGUES (symboles)
# ============================================================
dialogues_morwen = text.count('❖')
dialogues_umbra = text.count('◆')
dialogues_saatha = text.count('◈')
dialogues_kael = text.count('●')
dialogues_codex = text.count('⟨')

# ============================================================
# PENSEES INTERIEURES
# ============================================================
pensees = text.count('*❖')

# ============================================================
# CALCULS
# ============================================================
ecart_mots = mots - 36473
pourcentage_mots = (ecart_mots / 36473) * 100

# ============================================================
# AFFICHAGE
# ============================================================
print("=" * 70)
print("AUDIT COMPLET - ETAT ACTUEL DU PROLOGUE")
print("L'Eveil de l'Etoile Pourpre")
print("=" * 70)
print()

print("METRIQUES GLOBALES:")
print(f"  Mots totaux: {mots:,}")
print(f"  Objectif: >= 36,473")
print(f"  Ecart: {ecart_mots:+,} mots ({pourcentage_mots:+.2f}%)")
print(f"  Lignes: {lignes:,}")
print(f"  Caracteres: {caracteres:,}")
print()

print("OBJECTIFS PHASE 2:")
print(f"  1. Adverbes -ment (methodologie audit): {adverbes_audit}")
print(f"     Objectif: <= 145")
if adverbes_audit <= 145:
    print("     -> OBJECTIF ATTEINT")
else:
    print(f"     -> MANQUE {adverbes_audit - 145} reductions")
print()
print(f"     Note: Vrais adverbes (excluant noms): {vrais_adverbes_count}")
print()

print(f"  2. \"comme\": {comme}")
print(f"     Objectif: <= 150")
if comme <= 150:
    print("     -> OBJECTIF ATTEINT")
else:
    print(f"     -> MANQUE {comme - 150} reductions")
print()

print(f"  3. \"au-dela de toute possibilite...\": {au_dela}")
print(f"     Objectif: <= 8")
if au_dela <= 8:
    print("     -> OBJECTIF ATTEINT")
else:
    print(f"     -> MANQUE {au_dela - 8} reductions")
print()

print(f"  4. \"mille ans\": {mille_ans}")
print()

print("DISTRIBUTION PERSONNAGES (mentions):")
print(f"  Morwen: {morwen}")
print(f"  Umbra: {umbra}")
print(f"  saatha: {saatha}")
print(f"  Kael: {kael}")
print()

print("DISTRIBUTION DIALOGUES:")
print(f"  Morwen (symbole special): {dialogues_morwen} dialogues")
print(f"  Umbra (symbole special): {dialogues_umbra} dialogues")
print(f"  saatha (symbole special): {dialogues_saatha} dialogues")
print(f"  Kael (symbole special): {dialogues_kael} dialogues")
print(f"  Codex (symbole special): {dialogues_codex} interventions")
print()

print(f"  Pensees interieures Morwen: {pensees}")
print()

# ============================================================
# SCORE QUALITE
# ============================================================
score_base = 77  # Score Phase 1
ajustements = 0

if mots >= 36473:
    ajustements += 2
if adverbes_audit <= 145:
    ajustements += 5
if comme <= 150:
    ajustements += 3
if au_dela <= 8:
    ajustements += 5

score_estime = score_base + ajustements

print("ESTIMATION QUALITE:")
print(f"  Score Phase 1: {score_base}/100")
print(f"  Ajustements Phase 2: +{ajustements}")
print(f"  Score estime actuel: {score_estime}/100")
print()

# ============================================================
# BILAN OBJECTIFS
# ============================================================
objectifs_atteints = 0
objectifs_total = 4

if mots >= 36473:
    objectifs_atteints += 1
if adverbes_audit <= 145:
    objectifs_atteints += 1
if comme <= 150:
    objectifs_atteints += 1
if au_dela <= 8:
    objectifs_atteints += 1

print("BILAN OBJECTIFS:")
print(f"  Objectifs atteints: {objectifs_atteints}/{objectifs_total}")
if objectifs_atteints == objectifs_total:
    print("  -> PHASE 2 COMPLETEE A 100%")
else:
    print(f"  -> {objectifs_total - objectifs_atteints} objectif(s) restant(s)")
print()

print("=" * 70)
print("FIN AUDIT")
print("=" * 70)
