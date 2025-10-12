#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
AUDIT INDEPENDANT SEVERE - PROLOGUE FINAL
Pour public QI > 120

Critères d'évaluation stricts :
- Répétitions lexicales
- Sophistication syntaxique
- Cohérence narrative
- Worldbuilding
- Purple prose vs. Densité intellectuelle
"""

import re
from collections import Counter

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("="*80)
print("AUDIT INDEPENDANT FINAL - EVALUATION SEVERE")
print("Public cible : QI > 120")
print("="*80)
print()

# ============================================================================
# 1. STATISTIQUES GENERALES
# ============================================================================

mots = text.split()
nb_mots = len(mots)
nb_phrases = len(re.findall(r'[.!?]+', text))
mots_par_phrase = nb_mots / nb_phrases if nb_phrases > 0 else 0

print("1. STATISTIQUES GENERALES")
print("-" * 80)
print(f"   Mots totaux : {nb_mots:,}")
print(f"   Phrases : {nb_phrases:,}")
print(f"   Mots/phrase : {mots_par_phrase:.1f}")
print()

# ============================================================================
# 2. REPETITIONS LEXICALES
# ============================================================================

print("2. REPETITIONS LEXICALES")
print("-" * 80)

# Mots à surveiller
qui = text.count(' qui ')
dans = text.count(' dans ')
elle = len(re.findall(r'\belle\b', text, re.IGNORECASE))
comme = text.count(' comme ')
au_dela = text.count('au-delà')

# Calculer densité (par 1000 mots)
densite_qui = (qui / nb_mots) * 1000
densite_dans = (dans / nb_mots) * 1000
densite_elle = (elle / nb_mots) * 1000
densite_comme = (comme / nb_mots) * 1000

print(f"   'qui'     : {qui:3} occurrences ({densite_qui:.1f}/1000 mots)")
print(f"   'dans'    : {dans:3} occurrences ({densite_dans:.1f}/1000 mots)")
print(f"   'elle'    : {elle:3} occurrences ({densite_elle:.1f}/1000 mots)")
print(f"   'comme'   : {comme:3} occurrences ({densite_comme:.1f}/1000 mots)")
print(f"   'au-delà' : {au_dela:3} occurrences")
print()

# Benchmarks littéraires pour QI > 120
# (Basé sur analyse corpus littérature sophistiquée)
benchmarks = {
    'qui': 8.0,      # /1000 mots max acceptable
    'dans': 6.0,     # /1000 mots max acceptable
    'elle': 5.0,     # /1000 mots max acceptable
    'comme': 3.0,    # /1000 mots max acceptable
}

score_rep = 0
max_score_rep = 40

# Qui
if densite_qui <= benchmarks['qui']:
    score_rep += 10
    status_qui = "EXCELLENT"
elif densite_qui <= benchmarks['qui'] * 1.2:
    score_rep += 7
    status_qui = "BON"
elif densite_qui <= benchmarks['qui'] * 1.5:
    score_rep += 5
    status_qui = "ACCEPTABLE"
else:
    score_rep += 2
    status_qui = "PROBLEMATIQUE"

# Dans
if densite_dans <= benchmarks['dans']:
    score_rep += 10
    status_dans = "EXCELLENT"
elif densite_dans <= benchmarks['dans'] * 1.2:
    score_rep += 7
    status_dans = "BON"
elif densite_dans <= benchmarks['dans'] * 1.5:
    score_rep += 5
    status_dans = "ACCEPTABLE"
else:
    score_rep += 2
    status_dans = "PROBLEMATIQUE"

# Elle
if densite_elle <= benchmarks['elle']:
    score_rep += 10
    status_elle = "EXCELLENT"
elif densite_elle <= benchmarks['elle'] * 1.2:
    score_rep += 7
    status_elle = "BON"
elif densite_elle <= benchmarks['elle'] * 1.5:
    score_rep += 5
    status_elle = "ACCEPTABLE"
else:
    score_rep += 2
    status_elle = "PROBLEMATIQUE"

# Comme
if densite_comme <= benchmarks['comme']:
    score_rep += 10
    status_comme = "EXCELLENT"
elif densite_comme <= benchmarks['comme'] * 1.2:
    score_rep += 7
    status_comme = "BON"
elif densite_comme <= benchmarks['comme'] * 1.5:
    score_rep += 5
    status_comme = "ACCEPTABLE"
else:
    score_rep += 2
    status_comme = "PROBLEMATIQUE"

print(f"   EVALUATION:")
print(f"   - 'qui'   : {status_qui}")
print(f"   - 'dans'  : {status_dans}")
print(f"   - 'elle'  : {status_elle}")
print(f"   - 'comme' : {status_comme}")
print()
print(f"   SCORE REPETITIONS : {score_rep}/40")
print()

# ============================================================================
# 3. DIVERSITE LEXICALE
# ============================================================================

print("3. DIVERSITE LEXICALE")
print("-" * 80)

# Mots uniques vs total
mots_lower = [m.lower() for m in mots if len(m) > 2]
mots_uniques = len(set(mots_lower))
ratio_diversite = (mots_uniques / len(mots_lower)) * 100

print(f"   Mots uniques : {mots_uniques:,}")
print(f"   Ratio diversité : {ratio_diversite:.1f}%")

# Benchmark : > 35% = excellent, 25-35% = bon, < 25% = faible
if ratio_diversite >= 35:
    score_diversite = 20
    status_div = "EXCELLENT"
elif ratio_diversite >= 25:
    score_diversite = 15
    status_div = "BON"
elif ratio_diversite >= 20:
    score_diversite = 10
    status_div = "ACCEPTABLE"
else:
    score_diversite = 5
    status_div = "FAIBLE"

print(f"   Statut : {status_div}")
print(f"   SCORE DIVERSITE : {score_diversite}/20")
print()

# ============================================================================
# 4. SOPHISTICATION SYNTAXIQUE
# ============================================================================

print("4. SOPHISTICATION SYNTAXIQUE")
print("-" * 80)

# Détecter constructions sophistiquées
participes = len(re.findall(r'\b\w+ant\b', text))
appositions = len(re.findall(r',\s+\w+,', text))
subordonnees = len(re.findall(r'\b(qui|que|dont|où|quand|lorsque|puisque|tandis que)\b', text))

print(f"   Participes présents : {participes}")
print(f"   Appositions (approx) : {appositions}")
print(f"   Subordonnées : {subordonnees}")

# Ratio sophistication (structures complexes / phrases)
ratio_sophistication = ((participes + appositions) / nb_phrases) * 100

print(f"   Ratio sophistication : {ratio_sophistication:.1f}%")

if ratio_sophistication >= 40:
    score_syntaxe = 20
    status_syntaxe = "EXCELLENT"
elif ratio_sophistication >= 30:
    score_syntaxe = 15
    status_syntaxe = "BON"
elif ratio_sophistication >= 20:
    score_syntaxe = 10
    status_syntaxe = "ACCEPTABLE"
else:
    score_syntaxe = 5
    status_syntaxe = "BASIQUE"

print(f"   Statut : {status_syntaxe}")
print(f"   SCORE SYNTAXE : {score_syntaxe}/20")
print()

# ============================================================================
# 5. PURPLE PROSE (VERBOSITÉ)
# ============================================================================

print("5. PURPLE PROSE (VERBOSITY)")
print("-" * 80)

# Détecter adjectifs multiples
adjectifs_multiples = len(re.findall(r'\b\w+,\s+\w+\s+et\s+\w+\b', text))

# Adverbes -ment
exclusions_ment = {
    'moment', 'testament', 'élément', 'fragment', 'document', 'ornement',
    'sentiment', 'jugement', 'événement', 'mouvement', 'appartement',
    'bâtiment', 'complément', 'supplément', 'instrument', 'vêtement',
    'fondement', 'parlement', 'serment', 'battement', 'détachement',
    'avertissement', 'émerveillement', 'frémissement', 'acharnement',
    'craquement', 'entraînement', 'comment', 'hurlement', 'commencement',
    'entendement', 'bruissement', 'grondement', 'tremblement', 'effondrement',
    'firmament', 'commandement', 'enseignement', 'rugissement', 'achèvement',
}

adverbes_ment = [a for a in re.findall(r'\b\w+ment\b', text, re.IGNORECASE)
                 if a.lower() not in exclusions_ment]

ratio_adverbes = (len(adverbes_ment) / nb_mots) * 1000

print(f"   Adverbes -ment : {len(adverbes_ment)} ({ratio_adverbes:.1f}/1000 mots)")
print(f"   Adjectifs multiples : {adjectifs_multiples}")

# Benchmark : < 3/1000 = excellent, 3-5 = bon, > 5 = verbeux
if ratio_adverbes < 3:
    score_purple = 10
    status_purple = "CONCIS"
elif ratio_adverbes < 5:
    score_purple = 7
    status_purple = "EQUILIBRE"
else:
    score_purple = 4
    status_purple = "VERBEUX"

print(f"   Statut : {status_purple}")
print(f"   SCORE PURPLE PROSE : {score_purple}/10")
print()

# ============================================================================
# 6. COHERENCE ET WORLDBUILDING
# ============================================================================

print("6. COHERENCE ET WORLDBUILDING")
print("-" * 80)

# Noms propres et termes worldbuilding
noms_propres = len(re.findall(r'\b[A-Z][a-zéèêàâôûîïù]+\b', text))
noms_propres_uniques = len(set(re.findall(r'\b[A-Z][a-zéèêàâôûîïù]+\b', text)))

# Termes spécifiques fantastiques
termes_fantastiques = [
    'éther', 'éthérien', 'vampire', 'sang', 'immortel', 'millénaire',
    'siècles', 'magie', 'rituel', 'phylactère', 'pourpre', 'ombre',
]

count_fantastique = sum(text.lower().count(terme) for terme in termes_fantastiques)

print(f"   Noms propres : {noms_propres} ({noms_propres_uniques} uniques)")
print(f"   Termes fantastiques : {count_fantastique}")

# Score basé sur richesse worldbuilding
if noms_propres_uniques >= 20 and count_fantastique >= 100:
    score_world = 10
    status_world = "RICHE"
elif noms_propres_uniques >= 10 and count_fantastique >= 50:
    score_world = 7
    status_world = "ADEQUAT"
else:
    score_world = 4
    status_world = "BASIQUE"

print(f"   Statut : {status_world}")
print(f"   SCORE WORLDBUILDING : {score_world}/10")
print()

# ============================================================================
# SCORE FINAL
# ============================================================================

print("="*80)
print("SCORE FINAL")
print("="*80)
print()

score_total = score_rep + score_diversite + score_syntaxe + score_purple + score_world
score_max = 100

print(f"   Répétitions lexicales : {score_rep}/40")
print(f"   Diversité lexicale    : {score_diversite}/20")
print(f"   Sophistication syntaxe: {score_syntaxe}/20")
print(f"   Purple prose (inverse): {score_purple}/10")
print(f"   Worldbuilding         : {score_world}/10")
print()
print(f"   SCORE TOTAL : {score_total}/100")
print()

# Conversion en note /10
note_sur_10 = score_total / 10

print(f"   NOTE FINALE : {note_sur_10:.1f}/10")
print()

# Evaluation qualitative
if note_sur_10 >= 8.5:
    evaluation = "EXCELLENT - Texte exceptionnel pour public QI > 120"
elif note_sur_10 >= 7.5:
    evaluation = "TRES BON - Texte de grande qualite pour public sophistique"
elif note_sur_10 >= 6.5:
    evaluation = "BON - Texte adequat pour public exigeant"
elif note_sur_10 >= 5.5:
    evaluation = "ACCEPTABLE - Ameliorations recommandees"
else:
    evaluation = "INSUFFISANT - Refonte necessaire"

print(f"   EVALUATION : {evaluation}")
print()

# ============================================================================
# RECOMMANDATIONS
# ============================================================================

print("="*80)
print("RECOMMANDATIONS")
print("="*80)
print()

recommandations = []

if densite_qui > benchmarks['qui'] * 1.2:
    recommandations.append(f"- Reduire encore 'qui' (actuel: {densite_qui:.1f}/1000, cible: {benchmarks['qui']:.1f})")

if densite_dans > benchmarks['dans'] * 1.2:
    recommandations.append(f"- Reduire encore 'dans' (actuel: {densite_dans:.1f}/1000, cible: {benchmarks['dans']:.1f})")

if densite_elle > benchmarks['elle'] * 1.2:
    recommandations.append(f"- Reduire encore 'elle' (actuel: {densite_elle:.1f}/1000, cible: {benchmarks['elle']:.1f})")

if densite_comme > benchmarks['comme'] * 1.2:
    recommandations.append(f"- Reduire encore 'comme' (actuel: {densite_comme:.1f}/1000, cible: {benchmarks['comme']:.1f})")

if ratio_diversite < 25:
    recommandations.append(f"- Augmenter diversite lexicale (actuel: {ratio_diversite:.1f}%, cible: >25%)")

if ratio_sophistication < 30:
    recommandations.append(f"- Ajouter constructions sophistiquees (actuel: {ratio_sophistication:.1f}%, cible: >30%)")

if ratio_adverbes > 5:
    recommandations.append(f"- Reduire adverbes -ment (actuel: {ratio_adverbes:.1f}/1000, cible: <5)")

if recommandations:
    for rec in recommandations:
        print(rec)
else:
    print("   Aucune recommandation majeure.")
    print("   Le texte repond aux standards pour public QI > 120.")

print()
print("="*80)
print("FIN AUDIT INDEPENDANT")
print("="*80)
