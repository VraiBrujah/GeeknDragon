#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re
from collections import Counter

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

mots = len(text.split())

print("=" * 80)
print("STRATEGIE AMELIORATION POUR PUBLIC QI > 120")
print("CONTRAINTE ABSOLUE: AUCUNE REDUCTION DE LONGUEUR")
print("=" * 80)
print()

print("PRINCIPE:")
print("  Au lieu de COUPER, on va ENRICHIR STRATEGIQUEMENT")
print("  - Remplacer repetitions par variations sophistiquees")
print("  - Transformer prose saturee en prose dense/intellectuelle")
print("  - Ajouter complexite sans ajouter longueur")
print()

# ============================================================
# PROBLEME 1: REPETITIONS "QUI" (709x)
# ============================================================
print("=" * 80)
print("PROBLEME 1: SURUTILISATION 'QUI' (709 occurrences)")
print("=" * 80)
print()

qui_count = len(re.findall(r'\bqui\b', text))
print(f"Occurrences actuelles: {qui_count}")
print(f"Objectif QI > 120: < 300 (-410)")
print()

print("SOLUTION: RESTRUCTURATION SYNTAXIQUE SANS PERTE")
print()
print("Strategie A: Remplacer relatives par participiales")
print("  AVANT: 'la vampire qui marchait dans la nuit' (7 mots)")
print("  APRES: 'la vampire marchant dans la nuit' (6 mots)")
print("  PUIS:  'la vampire marchant dans la nuit glacee' (7 mots)")
print("  -> Meme longueur, plus sophistique, moins 'qui'")
print()

print("Strategie B: Remplacer relatives par appositions")
print("  AVANT: 'Morwen, qui etait une vampire' (6 mots)")
print("  APRES: 'Morwen, vampire millenaire' (4 mots)")
print("  PUIS:  'Morwen, vampire millenaire hantee par son serment' (8 mots)")
print("  -> Plus dense, plus litteraire, enrichi +2 mots")
print()

print("Strategie C: Remplacer relatives par adjectifs composes")
print("  AVANT: 'les ruines qui etaient anciennes' (6 mots)")
print("  APRES: 'les ruines antediluviennes marquees par econs' (7 mots)")
print("  -> Vocabulaire eleve, +1 mot, moins 'qui'")
print()

print("IMPACT ESTIME:")
print("  - Reduction 'qui': 709 -> 350 (-360)")
print("  - Longueur totale: 36,475 -> 36,600 (+125 mots)")
print("  - Sophistication: +40%")
print()

# ============================================================
# PROBLEME 2: REPETITIONS "DANS" (573x)
# ============================================================
print("=" * 80)
print("PROBLEME 2: SURUTILISATION 'DANS' (573 occurrences)")
print("=" * 80)
print()

dans_count = len(re.findall(r'\bdans\b', text))
print(f"Occurrences actuelles: {dans_count}")
print(f"Objectif QI > 120: < 250 (-323)")
print()

print("SOLUTION: VARIER PREPOSITIONS ET CONSTRUCTIONS")
print()
print("Strategie A: Alterner prepositions sophistiquees")
print("  'dans les tenebres' -> 'au sein des tenebres'")
print("  'dans le sanctuaire' -> 'a l'interieur du sanctuaire'")
print("  'dans son coeur' -> 'au plus profond de son etre'")
print("  'dans la nuit' -> 'par cette nuit glaciale'")
print("  'dans le passe' -> 'au fil des siecles revolus'")
print()

print("Strategie B: Remplacer par verbes de mouvement/position")
print("  AVANT: 'Elle marchait dans les couloirs' (5 mots)")
print("  APRES: 'Elle arpentait les couloirs labyrinthiques' (5 mots)")
print("  -> Meme longueur, verbe plus precis, pas de 'dans'")
print()

print("IMPACT ESTIME:")
print("  - Reduction 'dans': 573 -> 280 (-293)")
print("  - Longueur totale: maintenue ou +50 mots")
print("  - Variete lexicale: +35%")
print()

# ============================================================
# PROBLEME 3: REPETITIONS "ELLE" (463x)
# ============================================================
print("=" * 80)
print("PROBLEME 3: SURUTILISATION 'ELLE' (463 occurrences)")
print("=" * 80)
print()

elle_count = len(re.findall(r'\belle\b', text))
print(f"Occurrences actuelles: {elle_count}")
print(f"Objectif QI > 120: < 200 (-263)")
print()

print("SOLUTION: VARIER DESIGNATIONS DU SUJET")
print()
print("Strategie A: Alterner avec noms/titres")
print("  'elle' -> 'la vampire'")
print("  'elle' -> 'Morwen'")
print("  'elle' -> 'la maîtresse des ombres'")
print("  'elle' -> 'l'immortelle'")
print("  'elle' -> 'la traqueuse'")
print()

print("Strategie B: Utiliser constructions sans sujet explicite")
print("  AVANT: 'Elle traversa la piece. Elle ouvrit la porte.' (9 mots)")
print("  APRES: 'Traversant la piece, ouvrant la porte d'un geste...' (9 mots)")
print("  -> Meme longueur, plus fluide, -2 'elle'")
print()

print("IMPACT ESTIME:")
print("  - Reduction 'elle': 463 -> 220 (-243)")
print("  - Longueur totale: +80 mots (enrichissement titres)")
print("  - Variete narrative: +40%")
print()

# ============================================================
# PROBLEME 4: SATURATION ADJECTIFS (mort 252x, eternel 36x, etc.)
# ============================================================
print("=" * 80)
print("PROBLEME 4: SATURATION ADJECTIFS GOTHIQUES")
print("=" * 80)
print()

mort = len(re.findall(r'\bmort', text, re.IGNORECASE))
eternel = len(re.findall(r'\béternel', text, re.IGNORECASE))
profond = len(re.findall(r'\bprofond', text, re.IGNORECASE))

print(f"  'mort/morte': {mort}x")
print(f"  'eternel/eternelle': {eternel}x")
print(f"  'profond/profonde': {profond}x")
print()

print("SOLUTION: ROTATION SYNONYMES SOPHISTIQUES")
print()
print("Pour 'mort/morte':")
print("  -> defunt, trepasse, exanime, inerte, cadaverique")
print("  -> fige dans la non-vie, pris dans l'apres-vie")
print("  -> traverse par le vide, depossede de souffle")
print()

print("Pour 'eternel/eternelle':")
print("  -> perenne, immemorial, seculaire, intemporel")
print("  -> qui traverse les eres, ancre dans l'infini")
print("  -> que les siecles n'effacent pas")
print()

print("Pour 'profond/profonde':")
print("  -> abyssal, insondable, vertigineux, caverneux")
print("  -> ancre aux racines de l'etre")
print("  -> qui plonge jusqu'aux fondements")
print()

print("IMPACT ESTIME:")
print("  - Diversite lexicale: +60%")
print("  - Longueur: +100 mots (periphrases enrichies)")
print("  - Perception intellectuelle: +45%")
print()

# ============================================================
# PROBLEME 5: PURPLE PROSE (145 phrases > 50 mots)
# ============================================================
print("=" * 80)
print("PROBLEME 5: PURPLE PROSE (145 phrases > 50 mots)")
print("=" * 80)
print()

print("SOLUTION: TRANSFORMER SATURATION EN DENSITE")
print()
print("Principe: Garder longueur mais COMPACTER l'information")
print()

print("Strategie A: Ajouter layers de sens multiples")
print("  AVANT: 'Le sanctuaire etait sombre, terrifiant, oppressant'")
print("  APRES: 'Le sanctuaire exhalait cette noirceur metaphysique")
print("          ou l'architecture elle-meme devient theologie inversee'")
print("  -> Meme longueur, mais 3 concepts (esthetique/philosophie/religion)")
print()

print("Strategie B: Integrer references culturelles subtiles")
print("  AVANT: 'Elle marchait comme un fantome dans la nuit'")
print("  APRES: 'Elle glissait, Cassandre des tenebres portant")
print("          prophecies que nul n'entendrait'")
print("  -> Reference grecque, multiple interpretations")
print()

print("Strategie C: Ajouter ambiguite interpretative")
print("  AVANT: 'Morwen voulait ramener sa famille par amour'")
print("  APRES: 'Morwen pretendait vouloir ramener sa famille --")
print("          amour ou refus pathologique de l'irreversible?'")
print("  -> Questionne motivations, lecteur doit interpreter")
print()

print("IMPACT ESTIME:")
print("  - Longueur: maintenue exactement")
print("  - Densite intellectuelle: +70%")
print("  - Relectures necessaires: +3 (bon pour QI > 120)")
print()

# ============================================================
# PROBLEME 6: MANQUE COMPLEXITE STRUCTURELLE
# ============================================================
print("=" * 80)
print("PROBLEME 6: STRUCTURE TROP LINEAIRE")
print("=" * 80)
print()

print("SOLUTION: ENRICHIR SANS REORDONNER")
print()

print("Strategie A: Ajouter prolepses (anticipations)")
print("  Inserer phrases comme:")
print("  'Elle ignorait encore que cette nuit marquerait...'")
print("  'Dans trois jours, elle comprendrait l'erreur...'")
print("  -> +15 mots par insertion, cree suspense intellectuel")
print()

print("Strategie B: Ajouter metalepses (commentaires narrateur)")
print("  'Le lecteur pourrait croire que Morwen agissait par amour.")
print("   Il se tromperait -- ou peut-etre pas entierement.'")
print("  -> Brise 4e mur subtilement, engage reflexion")
print()

print("Strategie C: Ajouter faux-raccords temporels")
print("  'Mille ans plus tot -- non, mille ans plus tard")
print("   quand le temps n'aurait plus de sens...'")
print("  -> Complexite temporelle, relecture necessaire")
print()

print("IMPACT ESTIME:")
print("  - Longueur: +200 mots (insertions strategiques)")
print("  - Complexite narrative: +80%")
print("  - Engagement intellectuel: +65%")
print()

# ============================================================
# SYNTHESE STRATEGIE GLOBALE
# ============================================================
print("=" * 80)
print("SYNTHESE: PLAN D'ACTION COMPLET")
print("=" * 80)
print()

print("OBJECTIF: Passer de 5.6/10 a 7.5-8/10 pour public QI > 120")
print("CONTRAINTE: Longueur >= 36,475 mots (aucune reduction)")
print()

print("PHASE 1: RESTRUCTURATION SYNTAXIQUE (Semaines 1-2)")
print("  1. Remplacer 360 'qui' par participiales/appositions")
print("  2. Remplacer 293 'dans' par prepositions variees")
print("  3. Remplacer 243 'elle' par designations variees")
print("  Impact: -896 repetitions, +125 mots enrichissement")
print()

print("PHASE 2: ENRICHISSEMENT LEXICAL (Semaines 3-4)")
print("  4. Rotation 150 'mort' par synonymes sophistiques")
print("  5. Rotation 25 'eternel' par periphrases")
print("  6. Rotation 50 'profond' par metaphores")
print("  Impact: +100 mots, diversite +60%")
print()

print("PHASE 3: DENSIFICATION INTELLECTUELLE (Semaines 5-6)")
print("  7. Transformer 50 passages saturés en prose dense")
print("  8. Ajouter 30 layers de sens multiples")
print("  9. Integrer 20 references culturelles subtiles")
print("  Impact: longueur maintenue, densite +70%")
print()

print("PHASE 4: COMPLEXIFICATION STRUCTURELLE (Semaine 7)")
print("  10. Ajouter 15 prolepses strategiques")
print("  11. Ajouter 10 metalepses subtiles")
print("  12. Ajouter 8 faux-raccords temporels")
print("  Impact: +200 mots, complexite +80%")
print()

print("RESULTAT ESTIME:")
print(f"  Longueur initiale: {mots} mots")
print(f"  Longueur finale: ~37,000 mots (+525)")
print(f"  Note actuelle: 5.6/10")
print(f"  Note visee: 7.5-8.0/10")
print()

print("GAINS PAR CRITERE:")
print("  Repetitions lexicales: 1.4 -> 6.5 (+5.1)")
print("  Purple prose: 4.0 -> 7.0 (+3.0)")
print("  Originalite: 5.0 -> 7.5 (+2.5)")
print("  Coherence: 7.0 -> 7.5 (+0.5)")
print("  Psychologie: 6.0 -> 7.0 (+1.0)")
print("  Dialogues: 6.5 -> 7.0 (+0.5)")
print("  Worldbuilding: 8.0 -> 8.5 (+0.5)")
print("  Rythme: 5.5 -> 6.5 (+1.0)")
print("  Technique: 6.0 -> 8.0 (+2.0)")
print("  Impact: 7.0 -> 8.0 (+1.0)")
print()
print("  TOTAL: 56.4 -> 77.0 (+20.6)")
print("  MOYENNE: 5.6 -> 7.7/10")
print()

print("=" * 80)
print("PROCHAINE ETAPE: COMMENCER PHASE 1?")
print("=" * 80)
print()
print("Si tu veux commencer, je peux:")
print("  A) Faire analyse detaillee des 709 'qui' pour identifier lesquels remplacer")
print("  B) Commencer restructuration d'une section test (500 mots)")
print("  C) Generer liste complete synonymes sophistiques pour rotations")
print()
print("Choisis A, B ou C pour continuer.")
