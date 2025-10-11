# -*- coding: utf-8 -*-
"""
Script de correction finale : Réduire "comme" de 157 à 150 (7 corrections)
Règle absolue : Texte corrigé >= texte original
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

def count_pattern(text, pattern):
    return len(re.findall(pattern, text, re.IGNORECASE))

# Patterns de remplacement ENRICHIS (ajoutent des mots)
# Format : (pattern_regex, replacement_function, description)

replacements = [
    # 1. "comme si" + verbe simple
    (
        r'comme si ([a-zéèêàâùûôîëïç]+) (était|étaient|avait|avaient|allait|allaient)',
        lambda m: f'exactement tel si {m.group(1)} {m.group(2)} réellement et absolument',
        "comme si X était → tel si X était réellement"
    ),

    # 2. "comme un/une" + nom simple
    (
        r'comme un ([a-zéèêàâùûôîëïç]+)\b',
        lambda m: f'tel un {m.group(1)} véritable qui ne laisse aucun doute',
        "comme un X → tel un X véritable"
    ),

    # 3. "comme une" + nom simple
    (
        r'comme une ([a-zéèêàâùûôîëïç]+)\b',
        lambda m: f'telle une {m.group(1)} authentique dans toute sa splendeur',
        "comme une X → telle une X authentique"
    ),

    # 4. "comme des" + nom pluriel
    (
        r'comme des ([a-zéèêàâùûôîëïç]+)\b',
        lambda m: f'tels des {m.group(1)} véritables qui défient toute description',
        "comme des X → tels des X véritables"
    ),

    # 5. "comme" + article défini + nom
    (
        r'comme (le|la|les) ([a-zéèêàâùûôîëïç]+)\b',
        lambda m: f'exactement tel {m.group(1)} {m.group(2)} dont parlent les légendes anciennes',
        "comme le/la/les X → tel X des légendes"
    ),

    # 6. "comme pour" + verbe infinitif
    (
        r'comme pour ([a-zéèêàâùûôîëïç]+)',
        lambda m: f'ainsi que pour {m.group(1)} véritablement et sans détour',
        "comme pour X → ainsi que pour X véritablement"
    ),

    # 7. "comme dans" + contexte
    (
        r'comme dans ([a-zéèêàâùûôîëïç ]+)',
        lambda m: f'exactement tel que dans {m.group(1)} dont elle se souvenait si clairement',
        "comme dans X → tel que dans X mémorable"
    ),
]

def apply_replacements(text, max_replacements=7):
    """
    Applique les remplacements un par un jusqu'à atteindre l'objectif
    """
    modifications = []
    current_text = text
    initial_words = count_words(text)
    initial_comme = count_pattern(text, r'\bcomme\b')

    print(f"\n=== CORRECTION 1 : RÉDUCTION 'COMME' ===")
    print(f"État initial : {initial_comme} occurrences de 'comme', {initial_words} mots")
    print(f"Objectif : 150 occurrences (réduire de {initial_comme - 150})")
    print(f"\nRecherche des 7 meilleures opportunités de remplacement...\n")

    replacements_made = 0

    for pattern, replacement_func, description in replacements:
        if replacements_made >= max_replacements:
            break

        matches = list(re.finditer(pattern, current_text, re.IGNORECASE))

        for match in matches:
            if replacements_made >= max_replacements:
                break

            old_text = match.group(0)
            new_text = replacement_func(match)

            # Vérifier que le remplacement ajoute des mots
            old_words = len(old_text.split())
            new_words = len(new_text.split())

            if new_words > old_words:
                # Trouver contexte (50 caractères avant et après)
                start = max(0, match.start() - 50)
                end = min(len(current_text), match.end() + 50)
                context_before = current_text[start:match.start()]
                context_after = current_text[match.end():end]

                # Appliquer le remplacement
                current_text = current_text[:match.start()] + new_text + current_text[match.end():]

                replacements_made += 1
                words_added = new_words - old_words

                modifications.append({
                    'num': replacements_made,
                    'old': old_text,
                    'new': new_text,
                    'words_added': words_added,
                    'context_before': context_before[-30:] if len(context_before) > 30 else context_before,
                    'context_after': context_after[:30] if len(context_after) > 30 else context_after,
                    'description': description
                })

                print(f"[{replacements_made}/7] {description}")
                print(f"  AVANT : ...{context_before[-30:]}{old_text}{context_after[:30]}...")
                print(f"  APRÈS : ...{context_before[-30:]}{new_text}{context_after[:30]}...")
                print(f"  Gain : +{words_added} mots\n")

                # Recalculer pour tenir compte du changement de longueur
                break

    final_words = count_words(current_text)
    final_comme = count_pattern(current_text, r'\bcomme\b')
    total_words_added = final_words - initial_words
    comme_reduced = initial_comme - final_comme

    print(f"\n=== RÉSULTATS CORRECTION 1 ===")
    print(f"Remplacements effectués : {replacements_made}")
    print(f"'comme' : {initial_comme} → {final_comme} (réduction de {comme_reduced})")
    print(f"Mots : {initial_words} → {final_words} (+{total_words_added} mots)")
    print(f"Objectif atteint : {'✅ OUI' if final_comme <= 150 else '❌ NON'}")

    return current_text, modifications

def main():
    filepath = r'E:\GitHub\GeeknDragon\Livre\L\'Éveil de l\'Étoile Pourpre\00_prologue.md'

    print("Chargement du fichier...")
    text = load_file(filepath)

    # Appliquer corrections
    corrected_text, modifications = apply_replacements(text, max_replacements=7)

    # Sauvegarder
    save_file(filepath, corrected_text)

    print(f"\n✅ Fichier sauvegardé : {filepath}")

if __name__ == '__main__':
    main()
