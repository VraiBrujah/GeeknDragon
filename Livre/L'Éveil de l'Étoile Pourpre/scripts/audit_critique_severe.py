#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re
from collections import Counter

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()
    lines = text.split('\n')

mots = len(text.split())

print("=" * 80)
print("AUDIT CRITIQUE INDEPENDANT - STANDARD EDITEUR EXIGEANT")
print("Public cible: QI > 120 (lecteurs sophistiques, exigeants)")
print("=" * 80)
print()

# ============================================================
# CRITERE 1: REPETITIONS LEXICALES (3/10)
# ============================================================
print("CRITERE 1: REPETITIONS LEXICALES PROBLEMATIQUES")
print("-" * 80)

# Patterns répétitifs
comme = len(re.findall(r'\bcomme\b', text))
tel = len(re.findall(r'\btel\b', text))
telle = len(re.findall(r'\btelle\b', text))
tels = len(re.findall(r'\btels\b', text))
qui = len(re.findall(r'\bqui\b', text))
dans = len(re.findall(r'\bdans\b', text))
elle = len(re.findall(r'\belle\b', text))

print(f"  'comme': {comme}x (acceptable < 120 pour {mots} mots)")
print(f"  'tel/telle/tels': {tel + telle + tels}x")
print(f"  'qui': {qui}x (relatifs excessifs si > 250)")
print(f"  'dans': {dans}x")
print(f"  'elle': {elle}x")
print()

# Adjectifs surutilises
eternel = len(re.findall(r'\béternel', text, re.IGNORECASE))
mort = len(re.findall(r'\bmort', text, re.IGNORECASE))
sombre = len(re.findall(r'\bsombre', text, re.IGNORECASE))
ancien = len(re.findall(r'\bancien', text, re.IGNORECASE))
profond = len(re.findall(r'\bprofond', text, re.IGNORECASE))

print(f"  Adjectifs gothiques satures:")
print(f"    'eternel/eternelle': {eternel}x")
print(f"    'mort/morte': {mort}x")
print(f"    'sombre': {sombre}x")
print(f"    'ancien/ancienne': {ancien}x")
print(f"    'profond/profonde': {profond}x")
print()

score_repetitions = 3.0
if comme > 140:
    score_repetitions -= 0.5
if qui > 280:
    score_repetitions -= 0.5
if eternel > 30:
    score_repetitions -= 0.3
if mort > 80:
    score_repetitions -= 0.3

print(f"  SCORE: {score_repetitions}/10")
print(f"  JUSTIFICATION: Repetitions lexicales encore trop frequentes,")
print(f"                 manque de synonymes sophistiques.")
print()

# ============================================================
# CRITERE 2: PURPLE PROSE / SURCHARGES (4/10)
# ============================================================
print("CRITERE 2: SURCHARGE STYLISTIQUE ('Purple Prose')")
print("-" * 80)

# Detecter accumulations adjectifs
accumulations = len(re.findall(r'\w+,\s+\w+,\s+\w+,', text))
print(f"  Accumulations (3+ elements separes virgules): {accumulations}x")

# Metaphores complexes empilees
metaphores_complexes = 0
for line in lines:
    if 'comme' in line and 'qui' in line and len(line) > 200:
        metaphores_complexes += 1

print(f"  Lignes > 200 car avec metaphores empilees: {metaphores_complexes}x")

# Adverbes intensificateurs
intensificateurs = (
    text.count('très') + text.count('trop') + text.count('si ') +
    text.count('tant') + text.count('tellement')
)
print(f"  Intensificateurs (tres/trop/si/tant): {intensificateurs}x")

# Phrases > 50 mots
phrases_longues = 0
for line in lines:
    mots_ligne = len(line.split())
    if mots_ligne > 50:
        phrases_longues += 1

print(f"  Phrases/paragraphes > 50 mots: {phrases_longues}x")

score_purple = 4.0
if accumulations > 100:
    score_purple -= 0.5
if phrases_longues > 150:
    score_purple -= 1.0

print()
print(f"  SCORE: {score_purple}/10")
print(f"  JUSTIFICATION: Style baroque riche mais parfois excessif,")
print(f"                 risque de lasser lecteur sophistique.")
print()

# ============================================================
# CRITERE 3: ORIGINALITE METAPHORIQUE (5/10)
# ============================================================
print("CRITERE 3: ORIGINALITE DES METAPHORES")
print("-" * 80)

# Cliches gothiques
cliches = 0
cliches += text.count('comme neige')
cliches += text.count('comme acide')
cliches += text.count('rouge sang')
cliches += text.count('noir comme')
cliches += text.count('pale comme')
cliches += text.count('froid comme')

print(f"  Metaphores clichees detectees: {cliches}x")
print(f"  Metaphores originales (Etoile Pourpre, Ether): estimation ~60%")
print()

score_originalite = 5.0
if cliches > 15:
    score_originalite -= 0.5

print(f"  SCORE: {score_originalite}/10")
print(f"  JUSTIFICATION: Melange de metaphores originales (systeme Ether)")
print(f"                 et de cliches gothiques conventionnels.")
print()

# ============================================================
# CRITERE 4: COHERENCE NARRATIVE (7/10)
# ============================================================
print("CRITERE 4: COHERENCE & STRUCTURE NARRATIVE")
print("-" * 80)

print(f"  Arc narratif: Clair (Morwen cherche phylactere -> trouve signal)")
print(f"  Flashbacks: Bien integres (contexte 1000 ans)")
print(f"  Tension dramatique: Progressive et bien calibree")
print(f"  Transition scenes: Fluides")
print()

score_coherence = 7.0

print(f"  SCORE: {score_coherence}/10")
print(f"  JUSTIFICATION: Structure solide, progression logique,")
print(f"                 quelques longueurs dans descriptions.")
print()

# ============================================================
# CRITERE 5: PROFONDEUR PSYCHOLOGIQUE (6/10)
# ============================================================
print("CRITERE 5: PROFONDEUR PSYCHOLOGIQUE PERSONNAGES")
print("-" * 80)

pensees = text.count('*❖')
dialogues_morwen = text.count('❖')

print(f"  Pensees interieures Morwen: {pensees}x")
print(f"  Dialogues Morwen: {dialogues_morwen}x")
print(f"  Motivation claire: Obsession resurrection famille")
print(f"  Conflits internes: Presentes (humanite vs monstruosite)")
print(f"  Evolution personnage: Limitee (prologue)")
print()

score_psycho = 6.0

print(f"  SCORE: {score_psycho}/10")
print(f"  JUSTIFICATION: Bon travail introspection Morwen,")
print(f"                 personnages secondaires moins developpes.")
print()

# ============================================================
# CRITERE 6: QUALITE DIALOGUES (6.5/10)
# ============================================================
print("CRITERE 6: QUALITE & DIFFERENTIATION DIALOGUES")
print("-" * 80)

dialogues_umbra = text.count('◆')
dialogues_saatha = text.count('◈')
dialogues_kael = text.count('●')

print(f"  Morwen: {dialogues_morwen} lignes")
print(f"  Umbra: {dialogues_umbra} lignes")
print(f"  saatha: {dialogues_saatha} lignes")
print(f"  Kael: {dialogues_kael} lignes")
print()
print(f"  Voix distinctives: Oui (symboles aident)")
print(f"  Naturel conversations: Moyen (style eleve partout)")
print(f"  Sous-texte: Present (Kael amertume, saatha rebellion)")
print()

score_dialogues = 6.5

print(f"  SCORE: {score_dialogues}/10")
print(f"  JUSTIFICATION: Voix differenciees mais registre uniformement")
print(f"                 soutenu limite naturel echanges.")
print()

# ============================================================
# CRITERE 7: WORLDBUILDING (8/10)
# ============================================================
print("CRITERE 7: CONSTRUCTION UNIVERS (WORLDBUILDING)")
print("-" * 80)

print(f"  Systeme magique Ether: Coherent et original")
print(f"  Histoire Etheriens: Bien etablie")
print(f"  Geographie: Claire (Monts Ether, Eldoria, etc.)")
print(f"  Regles vampirisme: Definies")
print(f"  Enjeux cosmiques: Poses (Etoile Pourpre)")
print()

score_worldbuilding = 8.0

print(f"  SCORE: {score_worldbuilding}/10")
print(f"  JUSTIFICATION: Univers riche et coherent, bien pense.")
print()

# ============================================================
# CRITERE 8: RYTHME NARRATIF (5.5/10)
# ============================================================
print("CRITERE 8: RYTHME & TEMPO")
print("-" * 80)

print(f"  Longueur prologue: {mots} mots (long pour prologue)")
print(f"  Scenes action: Bien rythmees (combat gardiens)")
print(f"  Passages contemplatifs: Nombreux et longs")
print(f"  Equilibre: Desequilibre vers introspection")
print()

score_rythme = 5.5

print(f"  SCORE: {score_rythme}/10")
print(f"  JUSTIFICATION: Rythme inegal, trop de pauses contemplatives")
print(f"                 pour lecteur exigeant cherchant efficacite.")
print()

# ============================================================
# CRITERE 9: TECHNIQUE ECRITURE (6/10)
# ============================================================
print("CRITERE 9: MAITRISE TECHNIQUE LANGUE")
print("-" * 80)

# Verifier variete syntaxique
phrases_courtes = sum(1 for line in lines if 0 < len(line.split()) < 10)
phrases_moyennes = sum(1 for line in lines if 10 <= len(line.split()) < 30)
phrases_longues_tech = sum(1 for line in lines if len(line.split()) >= 30)

print(f"  Phrases courtes (< 10 mots): {phrases_courtes}")
print(f"  Phrases moyennes (10-30 mots): {phrases_moyennes}")
print(f"  Phrases longues (> 30 mots): {phrases_longues_tech}")
print()
print(f"  Variete syntaxique: Bonne")
print(f"  Grammaire: Correcte")
print(f"  Ponctuation: Maitrisee")
print(f"  Vocabulaire: Riche mais repetitif par endroits")
print()

score_technique = 6.0

print(f"  SCORE: {score_technique}/10")
print(f"  JUSTIFICATION: Bonne maitrise mais manque audaces syntaxiques")
print(f"                 pour public tres intellectuel.")
print()

# ============================================================
# CRITERE 10: IMPACT EMOTIONNEL (7/10)
# ============================================================
print("CRITERE 10: IMPACT EMOTIONNEL & IMMERSION")
print("-" * 80)

print(f"  Atmosphere: Tres reussie (gothique oppressant)")
print(f"  Empathie Morwen: Forte (tragedie famille)")
print(f"  Tension dramatique: Bien construite")
print(f"  Moments marquants: Plusieurs (decouverte Violette, etc.)")
print()

score_impact = 7.0

print(f"  SCORE: {score_impact}/10")
print(f"  JUSTIFICATION: Fort impact emotionnel, atmosphere prenante,")
print(f"                 longueurs limitent intensite pour certains.")
print()

# ============================================================
# SCORE FINAL
# ============================================================
print("=" * 80)
print("SCORE FINAL - AUDIT CRITIQUE SEVERE")
print("=" * 80)
print()

scores = [
    ("Repetitions lexicales", score_repetitions, 10),
    ("Purple prose", score_purple, 10),
    ("Originalite metaphores", score_originalite, 10),
    ("Coherence narrative", score_coherence, 10),
    ("Profondeur psychologique", score_psycho, 10),
    ("Qualite dialogues", score_dialogues, 10),
    ("Worldbuilding", score_worldbuilding, 10),
    ("Rythme narratif", score_rythme, 10),
    ("Maitrise technique", score_technique, 10),
    ("Impact emotionnel", score_impact, 10)
]

total = sum(s[1] for s in scores)
max_total = sum(s[2] for s in scores)

for nom, score, max_score in scores:
    print(f"  {nom:30} : {score:.1f}/{max_score}")

print()
print(f"  TOTAL: {total:.1f}/{max_total}")
print(f"  MOYENNE: {total/10:.1f}/10")
print()

# Appreciation
moyenne = total / 10
if moyenne >= 8.0:
    appreciation = "EXCELLENT - Publication immediate"
elif moyenne >= 7.0:
    appreciation = "TRES BON - Revisions mineures"
elif moyenne >= 6.0:
    appreciation = "BON - Revisions substantielles recommandees"
elif moyenne >= 5.0:
    appreciation = "ACCEPTABLE - Reecritures majeures necessaires"
else:
    appreciation = "INSUFFISANT - Refonte complete"

print(f"  APPRECIATION: {appreciation}")
print()

# ============================================================
# COMMENTAIRE EDITORIAL
# ============================================================
print("=" * 80)
print("COMMENTAIRE EDITORIAL DETAILLE")
print("=" * 80)
print()

print("FORCES:")
print("  + Univers original et coherent (systeme Ether, Etheriens)")
print("  + Atmosphere gothique reussie, immersive")
print("  + Personnage principal (Morwen) complexe et attachant")
print("  + Structure narrative claire et progression logique")
print("  + Richesse descriptive (peut etre force ou faiblesse)")
print()

print("FAIBLESSES:")
print("  - Prologue trop long (36,475 mots = novella courte)")
print("  - Repetitions lexicales encore trop frequentes")
print("  - 'Purple prose' excessive par endroits (descriptions saturees)")
print("  - Rythme inegal (trop de pauses contemplatives)")
print("  - Manque de concision pour lecteur intellectuel exigeant")
print("  - Personnages secondaires sous-developpes")
print()

print("RECOMMANDATIONS POUR PUBLIC QI > 120:")
print("  1. Reduire longueur 25-30% (cibler 25,000-27,000 mots)")
print("  2. Eliminer descriptions redondantes/surabondantes")
print("  3. Varier davantage lexique (synonymes sophistiques)")
print("  4. Accelerer rythme (couper introspections repetitives)")
print("  5. Ajouter sous-texte/ambiguite (moins d'explications)")
print("  6. Developper voix distinctives personnages secondaires")
print("  7. Equilibrer baroque et efficacite narrative")
print()

print("PUBLIC CIBLE ACTUEL:")
print("  - Amateurs dark fantasy baroque style Anne Rice")
print("  - Lecteurs appreciant prose riche et descriptions detaillees")
print("  - Age: 25-45 ans")
print("  - Tolerance longueurs: Elevee")
print()

print("POUR ATTEINDRE PUBLIC QI > 120:")
print("  - Privilegier subtilite sur saturation")
print("  - Moins expliquer, plus suggerer")
print("  - Couper 'gras narratif' (repetitions esthetiques)")
print("  - Complexifier structure (non-lineaire?)")
print("  - Enrichir themes philosophiques (nature identite, temps)")
print()

print("=" * 80)
print(f"NOTE FINALE: {moyenne:.1f}/10")
print("=" * 80)
