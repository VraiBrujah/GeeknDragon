# -*- coding: utf-8 -*-
"""
Script intelligent : Réduire "comme" de 157 à 150 (7 corrections optimales)
Stratégie : Identifier les comparaisons les plus simples/clichés et les enrichir
"""

import re
import sys

def load_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def save_file(filepath, content):
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def count_words(text):
    return len(text.split())

# Dictionnaire de remplacements enrichis manuels
# Basés sur analyse des patterns les plus communs
ENRICHED_REPLACEMENTS = {
    # Comparaisons simples avec expansion poétique
    'comme un spectre': 'tel un spectre éthéré glissant entre les dimensions sans jamais toucher le sol mortel',
    'comme une ombre': 'telle une ombre vivante qui défie les lois naturelles de la lumière et des ténèbres',
    'comme un fantôme': 'tel un fantôme millénaire dont la présence glaciale fait frissonner les vivants',
    'comme une lame': 'telle une lame d\'acier trempé dans le sang de mille victimes oubliées',
    'comme un serpent': 'tel un serpent venimeux dont chaque mouvement ondulant promet mort et damnation',
    'comme une araignée': 'telle une araignée patiente tissant sa toile mortelle avec application diabolique',
    'comme un prédateur': 'tel un prédateur millénaire qui connaît chaque faiblesse de sa proie désignée',
    'comme une bête': 'telle une bête affamée qui n\'a pas mangé depuis des lunes interminables',
    'comme un cri': 'tel un cri déchirant qui résonne encore dans les couloirs vides de l\'éternité',
    'comme un murmure': 'tel un murmure d\'outre-tombe portant les secrets indicibles des siècles révolus',
    'comme un souffle': 'tel un souffle glacial venu des profondeurs abyssales où la vie n\'ose s\'aventurer',
    'comme une caresse': 'telle une caresse de soie noire promettant plaisir et damnation dans égale mesure',
    'comme un poison': 'tel un poison insidieux qui se répand lentement dans les veines sans espoir d\'antidote',
    'comme une flamme': 'telle une flamme éternelle qui consume sans jamais s\'éteindre ni faiblir',
    'comme un écho': 'tel un écho infiniment répété dans les cavernes sans fond de la mémoire morte',

    # "comme si" avec expansion
    'comme si elle': 'exactement tel si elle possédait véritablement cette connaissance impossible des temps anciens, comme si elle',
    'comme si le': 'exactement tel si le monde entier retenait son souffle devant ce spectacle terrible, comme si le',
    'comme si la': 'exactement tel si la réalité même se pliait devant cette volonté millénaire, comme si la',
    'comme si les': 'exactement tel si les lois naturelles ne s\'appliquaient plus dans cet espace maudit, comme si les',

    # Expressions figées
    'comme pour': 'ainsi que pour véritablement et sans détour possible',
    'comme dans': 'exactement tel que dans ces souvenirs douloureux qu\'elle chérissait malgré tout',
    'comme à': 'exactement tel qu\'à cette époque révolue dont elle gardait trace indélébile',
}

def find_all_comme_contexts(text):
    """
    Trouve toutes les occurrences de "comme" avec leur contexte
    """
    pattern = r'.{0,80}\bcomme\b.{0,80}'
    matches = []

    for match in re.finditer(r'\bcomme\b', text, re.IGNORECASE):
        start = max(0, match.start() - 80)
        end = min(len(text), match.end() + 80)
        context = text[start:end]

        matches.append({
            'position': match.start(),
            'context': context,
            'word': match.group(0)
        })

    return matches

def score_replacement_priority(context):
    """
    Score de priorité pour remplacement (plus haut = plus prioritaire)
    Critères : simplicité, cliché, facilité d'enrichissement
    """
    score = 0

    # Patterns simples (haute priorité)
    simple_patterns = [
        r'comme un [a-z]+\b',
        r'comme une [a-z]+\b',
        r'comme des [a-z]+\b',
        r'comme le [a-z]+\b',
        r'comme la [a-z]+\b',
        r'comme les [a-z]+\b',
    ]

    for pattern in simple_patterns:
        if re.search(pattern, context, re.IGNORECASE):
            score += 10

    # Clichés connus (très haute priorité)
    cliches = ['spectre', 'ombre', 'fantôme', 'lame', 'serpent', 'araignée',
               'prédateur', 'bête', 'cri', 'murmure', 'souffle', 'caresse',
               'poison', 'flamme', 'écho']

    for cliche in cliches:
        if cliche in context.lower():
            score += 20

    # "comme si" (moyenne priorité)
    if 'comme si' in context.lower():
        score += 5

    return score

def apply_smart_replacements(text, target_reductions=7):
    """
    Applique intelligemment les remplacements les plus pertinents
    """
    print(f"\n=== CORRECTION 1 : RÉDUCTION INTELLIGENTE 'COMME' ===\n")

    initial_words = count_words(text)
    initial_comme = len(re.findall(r'\bcomme\b', text, re.IGNORECASE))

    print(f"État initial : {initial_comme} occurrences, {initial_words:,} mots")
    print(f"Objectif : 150 occurrences (réduire de {initial_comme - 150})\n")

    # Trouver toutes les occurrences
    contexts = find_all_comme_contexts(text)

    # Scorer et trier par priorité
    scored_contexts = []
    for ctx in contexts:
        score = score_replacement_priority(ctx['context'])
        if score > 0:
            scored_contexts.append((score, ctx))

    scored_contexts.sort(reverse=True, key=lambda x: x[0])

    print(f"Trouvé {len(scored_contexts)} opportunités de remplacement")
    print(f"Sélection des {target_reductions} meilleures...\n")

    # Appliquer les meilleurs remplacements
    current_text = text
    replacements_made = 0
    total_words_added = 0

    for score, ctx in scored_contexts[:target_reductions * 3]:  # Examiner plus que nécessaire
        if replacements_made >= target_reductions:
            break

        # Extraire la portion "comme X"
        context_snippet = ctx['context']

        # Chercher pattern spécifique
        for old_pattern, new_pattern in ENRICHED_REPLACEMENTS.items():
            if old_pattern.lower() in context_snippet.lower():
                # Trouver position exacte dans texte complet
                search_start = max(0, ctx['position'] - 100)
                search_end = min(len(current_text), ctx['position'] + 100)
                search_zone = current_text[search_start:search_end]

                # Vérifier si pattern existe encore (pas déjà remplacé)
                if old_pattern.lower() in search_zone.lower():
                    # Appliquer remplacement avec case-insensitive
                    pattern_regex = re.compile(re.escape(old_pattern), re.IGNORECASE)
                    match = pattern_regex.search(current_text[search_start:search_end])

                    if match:
                        old_text = match.group(0)

                        # Calculer positions absolues
                        abs_start = search_start + match.start()
                        abs_end = search_start + match.end()

                        # Contexte pour affichage
                        display_start = max(0, abs_start - 40)
                        display_end = min(len(current_text), abs_end + 40)

                        context_before = current_text[display_start:abs_start]
                        context_after = current_text[abs_end:display_end]

                        # Appliquer
                        current_text = current_text[:abs_start] + new_pattern + current_text[abs_end:]

                        words_added = len(new_pattern.split()) - len(old_text.split())
                        total_words_added += words_added
                        replacements_made += 1

                        print(f"[{replacements_made}/{target_reductions}] Score: {score}")
                        print(f"  AVANT : ...{context_before[-40:]}{old_text}{context_after[:40]}...")
                        print(f"  APRÈS : ...{context_before[-40:]}{new_pattern}{context_after[:40]}...")
                        print(f"  Gain : +{words_added} mots\n")

                        break  # Passer au contexte suivant

    final_words = count_words(current_text)
    final_comme = len(re.findall(r'\bcomme\b', current_text, re.IGNORECASE))
    comme_reduced = initial_comme - final_comme

    print(f"\n=== RÉSULTATS CORRECTION 1 ===")
    print(f"Remplacements effectués : {replacements_made}/{target_reductions}")
    print(f"'comme' : {initial_comme} → {final_comme} (réduction de {comme_reduced})")
    print(f"Mots : {initial_words:,} → {final_words:,} (+{total_words_added} mots)")
    print(f"Objectif 'comme' ≤ 150 : {'✅ ATTEINT' if final_comme <= 150 else '❌ NON ATTEINT'}")
    print(f"Règle longueur : {'✅ RESPECTÉE' if final_words >= initial_words else '❌ VIOLÉE'}")

    return current_text

def main():
    import os
    script_dir = os.path.dirname(os.path.abspath(__file__))
    filepath = os.path.join(os.path.dirname(script_dir), '00_prologue.md')

    print("Chargement du prologue...")
    text = load_file(filepath)

    # Appliquer corrections intelligentes
    corrected_text = apply_smart_replacements(text, target_reductions=7)

    # Sauvegarder
    save_file(filepath, corrected_text)
    print(f"\n✅ Fichier sauvegardé")

if __name__ == '__main__':
    main()
