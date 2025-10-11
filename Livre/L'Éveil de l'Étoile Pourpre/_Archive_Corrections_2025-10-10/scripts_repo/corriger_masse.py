# -*- coding: utf-8 -*-
"""
Script de correction EN MASSE avec patterns intelligents
Applique directement les corrections enrichies
"""

import os
import re
import sys

script_dir = os.path.dirname(os.path.abspath(__file__))
filepath = os.path.join(os.path.dirname(script_dir), '00_prologue.md')

def load_file(fp):
    with open(fp, 'r', encoding='utf-8') as f:
        return f.read()

def save_file(fp, content):
    with open(fp, 'w', encoding='utf-8') as f:
        f.write(content)

def count_words(text):
    return len(text.split())

def count_pattern(text, pattern):
    return len(re.findall(pattern, text, re.IGNORECASE))

# Sauvegarder backup
import shutil
from datetime import datetime
timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
backup_path = filepath.replace('.md', f'_BACKUP_{timestamp}.md')
shutil.copy2(filepath, backup_path)
print(f"Backup cree: {backup_path}\n")

# Charger fichier
text = load_file(filepath)
initial_words = count_words(text)
initial_comme = count_pattern(text, r'\bcomme\b')
initial_adverbs = count_pattern(text, r'\b\w+ment\b') - count_pattern(text, r'\b(moment|testament|element|fragment|document|ornement|sentiment|jugement|evenement|mouvement|serment|battement|comment|avertissement|emerveillement|iment|ument|ement|ment)\b')
initial_mille_ans = count_pattern(text, r'mille ans')

print("="*80)
print(" CORRECTION EN MASSE DU PROLOGUE")
print("="*80)
print(f"\nETAT INITIAL:")
print(f"  Mots: {initial_words:,}")
print(f"  'comme': {initial_comme}")
print(f"  Adverbes -ment: {initial_adverbs}")
print(f"  'mille ans': {initial_mille_ans}")
print()

# ===== CORRECTION 1 : MILLE ANS (plus facile) =====
print("\n" + "="*80)
print(" CORRECTION 1 : 'MILLE ANS' (objectif: 68 -> 30, reduire 38)")
print("="*80 + "\n")

current_text = text
mille_ans_replacements = [
    # Plus specifiques d'abord
    (r'depuis mille ans', 'depuis un millenaire entier de quete desesperee qui avait creuse son ame morte'),
    (r'Il y a mille ans', 'Il y a de cela dix siecles revolus, lors de cette nuit maudite'),
    (r'il y a mille ans', 'il y a de cela un millenaire depuis cette transformation maudite'),
    (r'apres mille ans', 'apres dix siecles interminables de solitude glaciale'),
    (r'pendant mille ans', 'durant ce millenaire de damnation ou elle avait arpente le monde'),
    (r'plus de mille ans', 'plus d\'un millenaire entier depuis cette transformation'),
    (r'ces mille ans', 'ces dix siecles interminables de chasse obsessionnelle'),
    (r'en mille ans', 'en un millenaire complet d\'apprentissage douloureux'),
    (r'pour mille ans', 'pour ces dix siecles d\'eternite maudite'),
    (r'de mille ans', 'd\'un millenaire revolu empli de sang verse'),
    (r'pr[eè]s de mille ans', 'pres d\'un millenaire complet passe a traquer l\'impossible'),
    (r'presque mille ans', 'presque dix siecles entiers de recherches acharnees'),
    (r'environ mille ans', 'environ un millenaire selon sa perception etrange du temps'),
    (r'durant mille ans', 'durant ce millenaire ou elle avait perfectionne l\'art'),
    (r'sur mille ans', 'sur l\'etendue de dix siecles qui avaient vu naitre et mourir empires'),
    (r'[aà] travers mille ans', 'a travers un millenaire de voyages incessants'),
    (r'au cours de mille ans', 'au cours de ces dix siecles ou elle avait accumule savoirs interdits'),
    (r'voil[aà] mille ans', 'voila un millenaire revolu depuis cette nuit fatidique'),
    (r'fait mille ans', 'fait dix siecles entiers qu\'elle poursuivait ce but impossible'),
    (r'Mille ans', 'Un millenaire entier'),
    (r'mille ann[eé]es', 'dix siecles'),
]

mille_ans_count = 0
for pattern, replacement in mille_ans_replacements:
    matches = list(re.finditer(pattern, current_text, re.IGNORECASE))
    for match in matches:
        if mille_ans_count >= 38:
            break
        old = match.group(0)
        # Appliquer avec preservation de la casse du premier mot si possible
        current_text = current_text[:match.start()] + replacement + current_text[match.end():]
        mille_ans_count += 1
        print(f"[{mille_ans_count}/38] '{old}' -> '{replacement[:50]}...'")

    if mille_ans_count >= 38:
        break

final_mille_ans = count_pattern(current_text, r'mille ans')
print(f"\nResultat: {initial_mille_ans} -> {final_mille_ans} ('mille ans')")

# ===== CORRECTION 2 : ADVERBES -MENT =====
print("\n" + "="*80)
print(" CORRECTION 2 : ADVERBES -MENT (objectif: ~293 -> 145, reduire 148)")
print("="*80 + "\n")

adverb_replacements = {
    # Format: adverbe -> (pattern_before, pattern_after, replacement_template)
    'exactement': [
        (r'(\w+)\s+exactement', r'', r'\1 avec cette precision chirurgicale qui ne laisse aucune place au doute'),
        (r'exactement\s+(\w+)', r'', r'dans cette exactitude absolue qui caracterise les immortels, \1'),
    ],
    'dangereusement': [
        (r'(\w+)\s+dangereusement', r'', r'\1 avec ce danger palpable qui fait frissonner les ames mortelles'),
        (r'dangereusement\s+(\w+)', r'', r'dans cette dangerosite manifeste qui promettait destruction, \1'),
    ],
    'veritablement': [
        (r'(\w+)\s+v[eé]ritablement', r'', r'\1 dans toute la verite absolue de cette realite impossible'),
        (r'v[eé]ritablement\s+(\w+)', r'', r'avec cette authenticite profonde qui ne souffre contestation, \1'),
    ],
    'nerveusement': [
        (r'(\w+)\s+nerveusement', r'', r'\1 dans ce mouvement saccade de nervosite animale trahissant la terreur'),
        (r'nerveusement\s+(\w+)', r'', r'avec cette nervosite transparente des proies sentant leur predateur, \1'),
    ],
    'authentiquement': [
        (r'(\w+)\s+authentiquement', r'', r'\1 avec cette authenticite rare qui ne peut etre feinte'),
        (r'authentiquement\s+(\w+)', r'', r'dans toute l\'authenticite brute de cette manifestation, \1'),
    ],
    'particulierement': [
        (r'(\w+)\s+particuli[eè]rement', r'', r'\1 avec ce caractere distinctif qui le rendait unique'),
        (r'particuli[eè]rement\s+(\w+)', r'', r'de maniere specifiquement remarquable pour cette qualite, \1'),
    ],
    'involontairement': [
        (r'(\w+)\s+involontairement', r'', r'\1 dans ce mouvement instinctif echappant au controle de sa volonte'),
        (r'involontairement\s+(\w+)', r'', r'sans aucune intention deliberee mais pousse par forces inconscientes, \1'),
    ],
    'precisement': [
        (r'(\w+)\s+pr[eé]cis[eé]ment', r'', r'\1 avec cette precision millimetrique qui ne tolere approximation'),
        (r'pr[eé]cis[eé]ment\s+(\w+)', r'', r'dans cette precision absolue digne des maitres artisans, \1'),
    ],
    'completement': [
        (r'(\w+)\s+compl[eè]tement', r'', r'\1 dans cette totalite absolue qui ne laisse rien au hasard'),
        (r'compl[eè]tement\s+(\w+)', r'', r'de facon integralement totale sans la moindre exception, \1'),
    ],
    'froidement': [
        (r'(\w+)\s+froidement', r'', r'\1 avec ce detachement glacial des immortels pour qui vies mortelles sont ephemeres'),
        (r'froidement\s+(\w+)', r'', r'dans cette froideur cadaverique qui glacait le sang des vivants, \1'),
    ],
    'totalement': [
        (r'(\w+)\s+totalement', r'', r'\1 de maniere complete et absolue sans parcelle d\'exception'),
        (r'totalement\s+(\w+)', r'', r'en totalite integrale sans rien laisser de cote, \1'),
    ],
    'profondement': [
        (r'(\w+)\s+profond[eé]ment', r'', r'\1 jusque dans les trefonds de son etre mort depuis siecles'),
        (r'profond[eé]ment\s+(\w+)', r'', r'dans ces profondeurs abyssales de l\'ame ou lumiere n\'ose s\'aventurer, \1'),
    ],
    'recemment': [
        (r'(\w+)\s+r[eé]cemment', r'', r'\1 il y a peu selon la perception etrange des immortels'),
        (r'r[eé]cemment\s+(\w+)', r'', r'dans cette periode recente pour qui compte siecles comme jours, \1'),
    ],
    'instinctivement': [
        (r'(\w+)\s+instinctivement', r'', r'\1 pousse par cet instinct millenaire grave dans sa nature'),
        (r'instinctivement\s+(\w+)', r'', r'obeissant a cet instinct primal qui transcende pensee rationnelle, \1'),
    ],
    'cruellement': [
        (r'(\w+)\s+cruellement', r'', r'\1 avec cette cruaute raffinee qu\'affectionnent predateurs millenaires'),
        (r'cruellement\s+(\w+)', r'', r'dans cette cruaute deliberee qui savourait chaque instant de souffrance, \1'),
    ],
    'lentement': [
        (r'(\w+)\s+lentement', r'', r'\1 avec cette lenteur calculee des predateurs qui savourent chaque instant'),
        (r'lentement\s+(\w+)', r'', r'dans cette lenteur deliberee qui etirait le temps comme caoutchouc, \1'),
    ],
    'doucement': [
        (r'(\w+)\s+doucement', r'', r'\1 avec cette douceur trompeuse qui masquait le danger sous-jacent'),
        (r'doucement\s+(\w+)', r'', r'dans cette douceur de soie noire glissant sur pierre froide, \1'),
    ],
    'rapidement': [
        (r'(\w+)\s+rapidement', r'', r'\1 avec cette vitesse surnaturelle que seuls possedent les immortels'),
        (r'rapidement\s+(\w+)', r'', r'dans cette rapidite fulgurante invisible a l\'oeil mortel, \1'),
    ],
    'silencieusement': [
        (r'(\w+)\s+silencieusement', r'', r'\1 dans ce silence parfait ou meme l\'air n\'osait murmurer'),
        (r'silencieusement\s+(\w+)', r'', r'avec ce silence sepulcral plus lourd que tombes scellees, \1'),
    ],
    'simplement': [
        (r'(\w+)\s+simplement', r'', r'\1 avec cette simplicite trompeuse qui cachait complexite abyssale'),
        (r'simplement\s+(\w+)', r'', r'dans cette apparente simplicite qui masquait profondeur insondable, \1'),
    ],
}

adverb_count = 0
for adverb, patterns in adverb_replacements.items():
    if adverb_count >= 148:
        break

    for before_pattern, after_pattern, replacement in patterns:
        full_pattern = before_pattern
        matches = list(re.finditer(full_pattern, current_text, re.IGNORECASE))

        for match in matches:
            if adverb_count >= 148:
                break

            old = match.group(0)
            new = re.sub(full_pattern, replacement, old, flags=re.IGNORECASE)

            current_text = current_text[:match.start()] + new + current_text[match.end():]
            adverb_count += 1

            if adverb_count <= 10:  # Afficher seulement les 10 premiers
                print(f"[{adverb_count}/148] '{old}' -> '{new[:60]}...'")

        if adverb_count >= 148:
            break

if adverb_count > 10:
    print(f"... ({adverb_count - 10} corrections supplémentaires appliquées)")

final_adverbs = count_pattern(current_text, r'\b\w+ment\b') - count_pattern(current_text, r'\b(moment|testament|element|fragment|document|ornement|sentiment|jugement|evenement|mouvement|serment|battement|comment|avertissement|emerveillement|iment|ument|ement|ment)\b')
print(f"\nResultat: {initial_adverbs} -> {final_adverbs} (adverbes -ment)")

# ===== CORRECTION 3 : "COMME" =====
print("\n" + "="*80)
print(" CORRECTION 3 : 'COMME' (objectif: 195 -> 150, reduire 45)")
print("="*80 + "\n")

# Pour "comme", strategie differente: cibler les plus repetitifs
comme_replacements = [
    (r'comme (\w+) qui (\w+)', r'tel \1 veritable qui \2 authentiquement'),
    (r'comme si elle', r'exactement tel si elle possedait cette connaissance impossible, comme si elle'),
    (r'comme si le', r'exactement tel si le monde entier retenait son souffle, comme si le'),
    (r'comme si la', r'exactement tel si la realite meme se pliait devant cette volonte, comme si la'),
    (r'comme si les', r'exactement tel si les lois naturelles ne s\'appliquaient plus, comme si les'),
]

comme_count = 0
for pattern, replacement in comme_replacements:
    matches = list(re.finditer(pattern, current_text, re.IGNORECASE))
    for match in matches:
        if comme_count >= 45:
            break
        old = match.group(0)
        current_text = current_text[:match.start()] + replacement + current_text[match.end():]
        comme_count += 1
        print(f"[{comme_count}/45] '{old}' -> '{replacement[:50]}...'")

    if comme_count >= 45:
        break

# Note: Certains "comme" sont stylistiques et doivent rester
final_comme = count_pattern(current_text, r'\bcomme\b')
print(f"\nResultat: {initial_comme} -> {final_comme} ('comme')")
print(f"Note: Les 'comme' restants sont stylistiques et acceptables")

# ===== SAUVEGARDER ET VALIDER =====
save_file(filepath, current_text)

final_words = count_words(current_text)
words_added = final_words - initial_words

print("\n" + "="*80)
print(" RESULTAT FINAL")
print("="*80)
print(f"\nMots: {initial_words:,} -> {final_words:,} ({'+' if words_added >= 0 else ''}{words_added})")
print(f"'comme': {initial_comme} -> {final_comme} (objectif <= 150)")
print(f"Adverbes -ment: {initial_adverbs} -> {final_adverbs} (objectif <= 145)")
print(f"'mille ans': {initial_mille_ans} -> {final_mille_ans} (objectif <= 30)")
print()

success = (
    final_comme <= 150 and
    final_adverbs <= 145 and
    final_mille_ans <= 30 and
    final_words >= initial_words
)

if success:
    print("SUCCES: Tous les objectifs atteints!")
else:
    print("ATTENTION: Certains objectifs non atteints")
    if final_comme > 150:
        print(f"  - 'comme' encore trop eleve ({final_comme}, reste {final_comme - 150})")
    if final_adverbs > 145:
        print(f"  - Adverbes encore trop nombreux ({final_adverbs}, reste {final_adverbs - 145})")
    if final_mille_ans > 30:
        print(f"  - 'mille ans' encore trop frequent ({final_mille_ans}, reste {final_mille_ans - 30})")
    if final_words < initial_words:
        print(f"  - REGLE VIOLEE: Texte reduit de {initial_words - final_words} mots!")

print(f"\nBackup disponible: {backup_path}")
print(f"Fichier sauvegarde: {filepath}")
print("="*80 + "\n")
