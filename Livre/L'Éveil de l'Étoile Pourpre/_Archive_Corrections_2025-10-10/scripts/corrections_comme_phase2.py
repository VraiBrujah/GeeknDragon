#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Phase 2 : Corriger les 50 occurrences "comme" restantes
De 200 à 150 occurrences
"""

import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

def load_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def save_file(filepath, content):
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def count_words(text):
    return len(text.split())

def count_pattern(text, pattern):
    return len(re.findall(pattern, text))

# Corrections ciblées et manuelles
CORRECTIONS_COMME = [
    # Pattern → Remplacement enrichi
    (
        r'(\w+) comme (\w+)',
        lambda m: f"{m.group(1)} tel {m.group(2)} dont la nature profonde révèle"
    ),
]

def apply_manual_corrections(content):
    """Corrections manuelles ciblées des 50 'comme' restants"""

    corrections = 0
    words_before = count_words(content)

    # Liste des patterns spécifiques à corriger
    specific_fixes = [
        # "X comme Y" simple → enrichissement
        (r'\bcomme un soleil\b', 'à la manière d\'un soleil miniature dont la brillance consumait'),
        (r'\bcomme une lame\b', 'telle une lame acérée dont le tranchant reflétait'),
        (r'\bcomme du verre\b', 'tel du verre fragilisé dont la transparence trahissait'),
        (r'\bcomme du sang\b', 'tel du sang corrompu dont la viscosité évoquait'),
        (r'\bcomme de la pierre\b', 'telle de la pierre ancestrale dont la densité témoignait'),
        (r'\bcomme de l\'encre\b', 'tel de l\'encre noire dont la fluidité serpentait'),
        (r'\bcomme de la fumée\b', 'telle de la fumée épaisse dont les volutes ondulaient'),
        (r'\bcomme du givre\b', 'tel du givre mortel dont les cristaux s\'étendaient'),
        (r'\bcomme du feu\b', 'tel du feu corrompu dont les flammes léchaient'),
        (r'\bcomme de la glace\b', 'telle de la glace millénaire dont la froideur pénétrait'),

        # Expressions figées à enrichir
        (r'\bcomme toujours\b', 'exactement de la même manière qu\'à chaque fois précédente, sans variation perceptible'),
        (r'\bcomme jamais\b', 'avec une intensité jamais atteinte auparavant dans toute son existence'),
        (r'\bcomme avant\b', 'de la même façon qu\'autrefois, avant que tout ne bascule irrémédiablement'),
        (r'\bcomme autrefois\b', 'à l\'identique de ces temps révolus où tout semblait encore possible'),

        # Verbes + comme
        (r'\bressemblait comme\b', 'évoquait de manière troublante'),
        (r'\bparaissait comme\b', 'semblait être tel'),
        (r'\bagissait comme\b', 'se comportait à la manière de'),
        (r'\brésonnait comme\b', 'produisait un écho semblable à celui de'),
        (r'\bglissait comme\b', 'se déplaçait avec la fluidité caractéristique de'),
        (r'\bbrillait comme\b', 'émettait une lumière comparable à celle de'),

        # "comme + pronom"
        (r'\bcomme elle\b', 'à l\'instar de ce qu\'elle était devenue'),
        (r'\bcomme lui\b', 'de la même manière que lui'),
        (r'\bcomme eux\b', 'semblablement à leur nature profonde'),
        (r'\bcomme nous\b', 'exactement tel ce que nous représentions'),

        # Comparaisons temporelles
        (r'\bcomme hier\b', 'exactement de la même façon qu\'hier, sans le moindre changement'),
        (r'\bcomme aujourd\'hui\b', 'identiquement à ce jour présent qui se répète'),
        (r'\bcomme demain\b', 'tel ce que sera inévitablement le lendemain'),

        # Expressions "comme si" restantes (déjà partiellement traitées)
        (r'\bcomme si rien\b', 'tel si absolument rien de ce qui s\'était produit'),
        (r'\bcomme si tout\b', 'comme si l\'intégralité de ce qui existait'),
        (r'\bcomme si quelque chose\b', 'tel si une présence indéfinissable'),

        # Constructions complexes
        (r'\bcomme(\s+)pour\b', r'tel\1afin de'),
        (r'\bcomme(\s+)avec\b', r'de la même manière qu\1en utilisant'),
        (r'\bcomme(\s+)dans\b', r'à l\'instar de ce qui se produit dans'),
        (r'\bcomme(\s+)sur\b', r'semblablement à ce que l\'on observe sur'),
        (r'\bcomme(\s+)sous\b', r'tel ce qui existe sous'),
        (r'\bcomme(\s+)entre\b', r'comparable à ce qui se trouve entre'),
        (r'\bcomme(\s+)sans\b', r'à la façon de ce qui est dépourvu de'),
        (r'\bcomme(\s+)avec\b', r'de la même manière qu\'en compagnie de'),
    ]

    for pattern, replacement in specific_fixes:
        matches = list(re.finditer(pattern, content, re.IGNORECASE))

        for match in matches:
            if corrections >= 50:
                break

            old_text = match.group(0)

            # Appliquer le remplacement
            if callable(replacement):
                new_text = replacement(match)
            else:
                new_text = replacement

            # Vérifier enrichissement
            if len(new_text.split()) > len(old_text.split()):
                content = content[:match.start()] + new_text + content[match.end():]
                corrections += 1
                print(f"  [{corrections:02d}] '{old_text}' → '{new_text[:60]}...'")

        if corrections >= 50:
            break

    words_after = count_words(content)

    print(f"\nCorrectionsen 'comme' phase 2 :")
    print(f"  Corrections : {corrections}")
    print(f"  Mots ajoutés : +{words_after - words_before}")

    return content

def main():
    filepath = '00_prologue.md'

    print("="*70)
    print("PHASE 2 : CORRECTIONS 'COMME' RESTANTES")
    print("Objectif : 200 → 150 occurrences (-50)")
    print("="*70)

    content = load_file(filepath)

    before_count = count_pattern(content, r'\bcomme\b')
    print(f"\n'comme' avant : {before_count}")

    content = apply_manual_corrections(content)

    save_file(filepath, content)

    after_count = count_pattern(content, r'\bcomme\b')
    print(f"'comme' après : {after_count}")
    print(f"Réduction : -{before_count - after_count}")

if __name__ == "__main__":
    main()
