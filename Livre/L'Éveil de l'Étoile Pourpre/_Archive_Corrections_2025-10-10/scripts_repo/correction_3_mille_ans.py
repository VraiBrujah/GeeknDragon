# -*- coding: utf-8 -*-
"""
Script intelligent : Réduire "mille ans" de 50 à 30 (20 corrections)
Stratégie : Remplacer par variations SANS "mille ans" mais ENRICHIES
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

def find_all_mille_ans(text):
    """
    Trouve toutes occurrences de "mille ans" avec contexte
    """
    pattern = r'mille ans'
    matches = []

    for match in re.finditer(pattern, text, re.IGNORECASE):
        start = max(0, match.start() - 100)
        end = min(len(text), match.end() + 100)
        context = text[start:end]

        matches.append({
            'text': match.group(0),
            'position': match.start(),
            'context': context
        })

    return matches

# Patterns de remplacement enrichis (SANS "mille ans")
ENRICHED_REPLACEMENTS = [
    # "depuis mille ans"
    (
        r'depuis mille ans',
        'depuis un millénaire entier de quête désespérée qui avait creusé son âme morte et vidé son cœur de toute joie',
        'depuis X millénaire'
    ),

    # "Il y a mille ans"
    (
        r"Il y a mille ans",
        "Il y a de cela dix siècles révolus, lors de cette nuit maudite où tout avait basculé irrémédiablement dans l'horreur et la damnation éternelle",
        'Il y a X siècles'
    ),

    # "il y a mille ans" (minuscule)
    (
        r"il y a mille ans",
        "il y a de cela un millénaire depuis cette transformation qui l'avait arrachée à son humanité et jetée dans les ténèbres immortelles",
        'il y a X millénaire'
    ),

    # "après mille ans"
    (
        r'après mille ans',
        'après dix siècles interminables de solitude glaciale où chaque jour s\'étirait comme éternité de souffrance silencieuse',
        'après X siècles'
    ),

    # "pendant mille ans"
    (
        r'pendant mille ans',
        'durant ce millénaire de damnation où elle avait arpenté le monde en quête de l\'impossible résurrection',
        'durant X millénaire'
    ),

    # "plus de mille ans"
    (
        r'plus de mille ans',
        'plus d\'un millénaire entier depuis cette transformation qui l\'avait arrachée à son humanité perdue',
        'plus de X millénaire'
    ),

    # "ces mille ans"
    (
        r'ces mille ans',
        'ces dix siècles interminables de chasse obsessionnelle qui avaient consumé chaque instant de son existence morte',
        'ces X siècles'
    ),

    # "en mille ans"
    (
        r'en mille ans',
        'en un millénaire complet d\'apprentissage douloureux et de découvertes sanglantes sur sa nature vampirique',
        'en X millénaire'
    ),

    # "pour mille ans"
    (
        r'pour mille ans',
        'pour ces dix siècles d\'éternité maudite qui s\'étiraient devant elle sans espoir de rédemption',
        'pour X siècles'
    ),

    # "de mille ans"
    (
        r'de mille ans',
        'd\'un millénaire révolu empli de sang versé et d\'âmes dévorées dans sa quête insatiable',
        'de X millénaire'
    ),

    # "Mille ans" début de phrase
    (
        r'Mille ans',
        'Un millénaire entier',
        'Millénaire'
    ),

    # "près de mille ans"
    (
        r'près de mille ans',
        'près d\'un millénaire complet passé à traquer l\'impossible à travers terres et océans',
        'près de X millénaire'
    ),

    # "presque mille ans"
    (
        r'presque mille ans',
        'presque dix siècles entiers de recherches acharnées qui l\'avaient menée aux confins du monde connu',
        'presque X siècles'
    ),

    # "environ mille ans"
    (
        r'environ mille ans',
        'environ un millénaire selon sa perception étrange du temps pour qui les décennies filent comme jours',
        'environ X millénaire'
    ),

    # "durant mille ans"
    (
        r'durant mille ans',
        'durant ce millénaire où elle avait perfectionné l\'art sombre de la nécromancie vampirique',
        'durant X millénaire'
    ),

    # "sur mille ans"
    (
        r'sur mille ans',
        'sur l\'étendue de dix siècles qui avaient vu naître et mourir empires et civilisations entières',
        'sur X siècles'
    ),

    # "à travers mille ans"
    (
        r'à travers mille ans',
        'à travers un millénaire de voyages incessants qui l\'avaient menée dans chaque recoin oublié du monde',
        'à travers X millénaire'
    ),

    # "au cours de mille ans"
    (
        r'au cours de mille ans',
        'au cours de ces dix siècles où elle avait accumulé savoirs interdits et pouvoirs impies',
        'au cours de X siècles'
    ),

    # "voilà mille ans"
    (
        r'voilà mille ans',
        'voilà un millénaire révolu depuis cette nuit fatidique qui avait tout changé à jamais',
        'voilà X millénaire'
    ),

    # "fait mille ans"
    (
        r'fait mille ans',
        'fait dix siècles entiers qu\'elle poursuivait ce but impossible avec acharnement obsessionnel',
        'fait X siècles'
    ),
]

def apply_smart_mille_ans_replacements(text, target_reductions=20):
    """
    Applique remplacements enrichis de "mille ans"
    """
    print(f"\n=== CORRECTION 3 : RÉDUCTION 'MILLE ANS' ===\n")

    initial_words = count_words(text)
    initial_matches = find_all_mille_ans(text)
    initial_count = len(initial_matches)

    print(f"État initial : {initial_count} occurrences de 'mille ans', {initial_words:,} mots")
    print(f"Objectif : 30 occurrences (réduire de {initial_count - 30})\n")

    current_text = text
    replacements_made = 0
    total_words_added = 0

    # Trier patterns par longueur décroissante (pour éviter conflits)
    sorted_patterns = sorted(ENRICHED_REPLACEMENTS, key=lambda x: len(x[0]), reverse=True)

    for pattern, replacement, description in sorted_patterns:
        if replacements_made >= target_reductions:
            break

        # Chercher toutes occurrences de ce pattern
        pattern_regex = re.compile(pattern, re.IGNORECASE)
        matches = list(pattern_regex.finditer(current_text))

        for match in matches:
            if replacements_made >= target_reductions:
                break

            old_text = match.group(0)

            # Vérifier que ça enrichit
            words_added = len(replacement.split()) - len(old_text.split())

            if words_added > 0:
                # Positions
                abs_start = match.start()
                abs_end = match.end()

                # Contexte affichage
                display_start = max(0, abs_start - 50)
                display_end = min(len(current_text), abs_end + 50)

                context_before = current_text[display_start:abs_start]
                context_after = current_text[abs_end:display_end]

                # Appliquer
                current_text = current_text[:abs_start] + replacement + current_text[abs_end:]

                total_words_added += words_added
                replacements_made += 1

                print(f"[{replacements_made}/{target_reductions}] {description}")
                print(f"  AVANT : ...{context_before[-50:]}{old_text}{context_after[:50]}...")
                print(f"  APRÈS : ...{context_before[-50:]}{replacement}{context_after[:50]}...")
                print(f"  Gain : +{words_added} mots\n")

                # Recalculer matches après modification
                break

    final_words = count_words(current_text)
    final_matches = find_all_mille_ans(current_text)
    final_count = len(final_matches)
    reduced = initial_count - final_count

    print(f"\n=== RÉSULTATS CORRECTION 3 ===")
    print(f"Remplacements effectués : {replacements_made}/{target_reductions}")
    print(f"'mille ans' : {initial_count} → {final_count} (réduction de {reduced})")
    print(f"Mots : {initial_words:,} → {final_words:,} (+{total_words_added} mots)")
    print(f"Objectif 'mille ans' ≤ 30 : {'✅ ATTEINT' if final_count <= 30 else '❌ NON ATTEINT'}")
    print(f"Règle longueur : {'✅ RESPECTÉE' if final_words >= initial_words else '❌ VIOLÉE'}")

    return current_text

def main():
    import os
    script_dir = os.path.dirname(os.path.abspath(__file__))
    filepath = os.path.join(os.path.dirname(script_dir), '00_prologue.md')

    print("Chargement du prologue...")
    text = load_file(filepath)

    # Appliquer corrections
    corrected_text = apply_smart_mille_ans_replacements(text, target_reductions=20)

    # Sauvegarder
    save_file(filepath, corrected_text)
    print(f"\n✅ Fichier sauvegardé")

if __name__ == '__main__':
    main()
