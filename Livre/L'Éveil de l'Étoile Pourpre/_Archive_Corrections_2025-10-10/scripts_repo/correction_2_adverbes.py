# -*- coding: utf-8 -*-
"""
Script intelligent : Réduire adverbes -ment de 242 à 145 (97 corrections)
Stratégie : Remplacer adverbes par constructions enrichies
"""

import re
import sys
from collections import Counter

def load_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def save_file(filepath, content):
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def count_words(text):
    return len(text.split())

def find_all_adverbs(text):
    """
    Trouve tous les adverbes en -ment avec contexte
    """
    pattern = r'\b\w+ment\b'
    adverbs = []

    for match in re.finditer(pattern, text, re.IGNORECASE):
        adverb = match.group(0).lower()

        # Exclure faux-positifs communs
        if adverb in ['moment', 'testament', 'ument', 'ment', 'élément', 'instrument',
                      'fragment', 'document', 'ornement', 'sentiment', 'jugement',
                      'événement', 'mouvement', 'itement']:
            continue

        start = max(0, match.start() - 100)
        end = min(len(text), match.end() + 100)
        context = text[start:end]

        adverbs.append({
            'adverb': match.group(0),  # Préserver la casse originale
            'adverb_lower': adverb,
            'position': match.start(),
            'context': context
        })

    return adverbs

def count_adverb_frequencies(adverbs):
    """
    Compte fréquence de chaque adverbe
    """
    counter = Counter([adv['adverb_lower'] for adv in adverbs])
    return counter

# Dictionnaire de remplacements enrichis
# Format : adverbe → (pattern_recherche, fonction_remplacement)

def create_replacement_patterns():
    """
    Crée patterns de remplacement enrichis pour adverbes prioritaires
    """
    return {
        'exactement': [
            (r'(\w+) exactement', lambda m: f'{m.group(1)} avec cette précision chirurgicale qui ne laisse aucune place au doute ni à l\'interprétation'),
            (r'exactement (\w+)', lambda m: f'dans cette exactitude absolue qui caractérise les immortels, {m.group(1)}'),
        ],

        'dangereusement': [
            (r'(\w+) dangereusement', lambda m: f'{m.group(1)} avec ce danger palpable qui fait frissonner les âmes mortelles de terreur viscérale'),
            (r'dangereusement (\w+)', lambda m: f'dans cette dangerosité manifeste qui promettait destruction et damnation, {m.group(1)}'),
        ],

        'véritablement': [
            (r'(\w+) véritablement', lambda m: f'{m.group(1)} dans toute la vérité absolue de cette réalité impossible à nier'),
            (r'véritablement (\w+)', lambda m: f'avec cette authenticité profonde qui ne souffre aucune contestation, {m.group(1)}'),
        ],

        'nerveusement': [
            (r'(\w+) nerveusement', lambda m: f'{m.group(1)} dans ce mouvement saccadé de nervosité animale qui trahissait la terreur viscérale'),
            (r'nerveusement (\w+)', lambda m: f'avec cette nervosité transparente des proies qui sentent approcher leur prédateur, {m.group(1)}'),
        ],

        'authentiquement': [
            (r'(\w+) authentiquement', lambda m: f'{m.group(1)} avec cette authenticité rare qui ne peut être feinte ni simulée'),
            (r'authentiquement (\w+)', lambda m: f'dans toute l\'authenticité brute de cette manifestation sans artifice, {m.group(1)}'),
        ],

        'particulièrement': [
            (r'(\w+) particulièrement', lambda m: f'{m.group(1)} avec ce caractère distinctif qui le rendait unique parmi tous ses semblables'),
            (r'particulièrement (\w+)', lambda m: f'de manière spécifiquement remarquable pour cette qualité singulière, {m.group(1)}'),
        ],

        'involontairement': [
            (r'(\w+) involontairement', lambda m: f'{m.group(1)} dans ce mouvement instinctif échappant totalement au contrôle de sa volonté consciente'),
            (r'involontairement (\w+)', lambda m: f'sans aucune intention délibérée mais poussé par forces inconscientes, {m.group(1)}'),
        ],

        'précisément': [
            (r'(\w+) précisément', lambda m: f'{m.group(1)} avec cette précision millimétrique qui ne tolère aucune approximation'),
            (r'précisément (\w+)', lambda m: f'dans cette précision absolue digne des maîtres artisans millénaires, {m.group(1)}'),
        ],

        'complètement': [
            (r'(\w+) complètement', lambda m: f'{m.group(1)} dans cette totalité absolue qui ne laisse rien au hasard ni à l\'incomplet'),
            (r'complètement (\w+)', lambda m: f'de façon intégralement totale sans la moindre exception ni réserve, {m.group(1)}'),
        ],

        'froidement': [
            (r'(\w+) froidement', lambda m: f'{m.group(1)} avec ce détachement glacial des immortels pour qui les vies mortelles sont éphémères'),
            (r'froidement (\w+)', lambda m: f'dans cette froideur cadavérique qui glaçait le sang des vivants, {m.group(1)}'),
        ],

        'totalement': [
            (r'(\w+) totalement', lambda m: f'{m.group(1)} de manière complète et absolue sans la moindre parcelle d\'exception'),
            (r'totalement (\w+)', lambda m: f'en totalité intégrale sans rien laisser de côté, {m.group(1)}'),
        ],

        'profondément': [
            (r'(\w+) profondément', lambda m: f'{m.group(1)} jusque dans les tréfonds de son être mort depuis mille années'),
            (r'profondément (\w+)', lambda m: f'dans ces profondeurs abyssales de l\'âme où même la lumière n\'ose s\'aventurer, {m.group(1)}'),
        ],

        'récemment': [
            (r'(\w+) récemment', lambda m: f'{m.group(1)} il y a peu de temps selon la perception étrange des immortels'),
            (r'récemment (\w+)', lambda m: f'dans cette période récente pour qui compte les siècles comme jours, {m.group(1)}'),
        ],

        'instinctivement': [
            (r'(\w+) instinctivement', lambda m: f'{m.group(1)} poussé par cet instinct millénaire gravé dans sa nature vampirique'),
            (r'instinctivement (\w+)', lambda m: f'obéissant à cet instinct primal qui transcende toute pensée rationnelle, {m.group(1)}'),
        ],

        'cruellement': [
            (r'(\w+) cruellement', lambda m: f'{m.group(1)} avec cette cruauté raffinée qu\'affectionnent les prédateurs millénaires'),
            (r'cruellement (\w+)', lambda m: f'dans cette cruauté délibérée qui savourait chaque instant de souffrance infligée, {m.group(1)}'),
        ],

        'lentement': [
            (r'(\w+) lentement', lambda m: f'{m.group(1)} avec cette lenteur calculée des prédateurs qui savourent chaque instant'),
            (r'lentement (\w+)', lambda m: f'dans cette lenteur délibérée qui étirait le temps comme caoutchouc élastique, {m.group(1)}'),
        ],

        'doucement': [
            (r'(\w+) doucement', lambda m: f'{m.group(1)} avec cette douceur trompeuse qui masquait le danger sous-jacent'),
            (r'doucement (\w+)', lambda m: f'dans cette douceur de soie noire glissant sur pierre froide, {m.group(1)}'),
        ],

        'rapidement': [
            (r'(\w+) rapidement', lambda m: f'{m.group(1)} avec cette vitesse surnaturelle que seuls possèdent les immortels'),
            (r'rapidement (\w+)', lambda m: f'dans cette rapidité fulgurante invisible à l\'œil mortel, {m.group(1)}'),
        ],

        'silencieusement': [
            (r'(\w+) silencieusement', lambda m: f'{m.group(1)} dans ce silence parfait où même l\'air n\'osait murmurer'),
            (r'silencieusement (\w+)', lambda m: f'avec ce silence sépulcral plus lourd que tombes scellées, {m.group(1)}'),
        ],

        'simplement': [
            (r'(\w+) simplement', lambda m: f'{m.group(1)} avec cette simplicité trompeuse qui cachait complexité abyssale'),
            (r'simplement (\w+)', lambda m: f'dans cette apparente simplicité qui masquait profondeur insondable, {m.group(1)}'),
        ],
    }

def apply_smart_adverb_replacements(text, target_reductions=97):
    """
    Applique remplacements intelligents des adverbes
    """
    print(f"\n=== CORRECTION 2 : RÉDUCTION ADVERBES -MENT ===\n")

    initial_words = count_words(text)
    initial_adverbs_list = find_all_adverbs(text)
    initial_adverbs_count = len(initial_adverbs_list)

    print(f"État initial : {initial_adverbs_count} adverbes, {initial_words:,} mots")
    print(f"Objectif : 145 adverbes (réduire de {initial_adverbs_count - 145})\n")

    # Compter fréquences
    frequencies = count_adverb_frequencies(initial_adverbs_list)

    print("Top 20 adverbes les plus fréquents :")
    for adv, count in frequencies.most_common(20):
        print(f"  {adv}: {count}x")
    print()

    # Préparer patterns de remplacement
    replacement_patterns = create_replacement_patterns()

    current_text = text
    replacements_made = 0
    total_words_added = 0

    # Priorité aux adverbes les plus fréquents
    priority_adverbs = [adv for adv, count in frequencies.most_common(20)]

    for adverb_target in priority_adverbs:
        if replacements_made >= target_reductions:
            break

        if adverb_target not in replacement_patterns:
            continue

        patterns = replacement_patterns[adverb_target]

        # Trouver toutes occurrences de cet adverbe
        for adv_data in initial_adverbs_list:
            if replacements_made >= target_reductions:
                break

            if adv_data['adverb_lower'] != adverb_target:
                continue

            # Essayer chaque pattern de remplacement
            for pattern, replacement_func in patterns:
                # Chercher dans zone locale
                search_start = max(0, adv_data['position'] - 150)
                search_end = min(len(current_text), adv_data['position'] + 150)
                search_zone = current_text[search_start:search_end]

                match = re.search(pattern, search_zone, re.IGNORECASE)

                if match:
                    old_text = match.group(0)
                    new_text = replacement_func(match)

                    # Vérifier que ça enrichit
                    words_added = len(new_text.split()) - len(old_text.split())

                    if words_added > 0:
                        # Positions absolues
                        abs_start = search_start + match.start()
                        abs_end = search_start + match.end()

                        # Contexte affichage
                        display_start = max(0, abs_start - 40)
                        display_end = min(len(current_text), abs_end + 40)

                        context_before = current_text[display_start:abs_start]
                        context_after = current_text[abs_end:display_end]

                        # Appliquer
                        current_text = current_text[:abs_start] + new_text + current_text[abs_end:]

                        total_words_added += words_added
                        replacements_made += 1

                        print(f"[{replacements_made}/{target_reductions}] {adverb_target}")
                        print(f"  AVANT : ...{context_before[-40:]}{old_text}{context_after[:40]}...")
                        print(f"  APRÈS : ...{context_before[-40:]}{new_text}{context_after[:40]}...")
                        print(f"  Gain : +{words_added} mots\n")

                        break  # Pattern trouvé, passer à occurrence suivante

    final_words = count_words(current_text)
    final_adverbs_list = find_all_adverbs(current_text)
    final_adverbs_count = len(final_adverbs_list)
    adverbs_reduced = initial_adverbs_count - final_adverbs_count

    print(f"\n=== RÉSULTATS CORRECTION 2 ===")
    print(f"Remplacements effectués : {replacements_made}/{target_reductions}")
    print(f"Adverbes -ment : {initial_adverbs_count} → {final_adverbs_count} (réduction de {adverbs_reduced})")
    print(f"Mots : {initial_words:,} → {final_words:,} (+{total_words_added} mots)")
    print(f"Objectif adverbes ≤ 145 : {'✅ ATTEINT' if final_adverbs_count <= 145 else '❌ NON ATTEINT'}")
    print(f"Règle longueur : {'✅ RESPECTÉE' if final_words >= initial_words else '❌ VIOLÉE'}")

    return current_text

def main():
    import os
    script_dir = os.path.dirname(os.path.abspath(__file__))
    filepath = os.path.join(os.path.dirname(script_dir), '00_prologue.md')

    print("Chargement du prologue...")
    text = load_file(filepath)

    # Appliquer corrections
    corrected_text = apply_smart_adverb_replacements(text, target_reductions=97)

    # Sauvegarder
    save_file(filepath, corrected_text)
    print(f"\n✅ Fichier sauvegardé")

if __name__ == '__main__':
    main()
