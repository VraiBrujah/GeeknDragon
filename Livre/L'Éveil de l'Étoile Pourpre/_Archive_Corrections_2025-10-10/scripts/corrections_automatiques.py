#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de corrections automatiques pour le prologue
Règle absolue : Texte corrigé >= texte original EN LONGUEUR
"""

import re
from typing import List, Tuple

def load_file(filepath: str) -> str:
    """Charge le fichier"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def save_file(filepath: str, content: str):
    """Sauvegarde le fichier"""
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def count_words(text: str) -> int:
    """Compte les mots"""
    return len(text.split())

def count_pattern(text: str, pattern: str) -> int:
    """Compte les occurrences d'un pattern"""
    return len(re.findall(pattern, text, re.IGNORECASE))

# ========================================
# CORRECTION 1 : "COMME" (41 corrections)
# ========================================

COMME_REPLACEMENTS = [
    # Comparaisons simples à enrichir
    (
        r"comme tu me l'as enseigné",
        "selon l'enseignement patient que tu m'as transmis au fil des années, gravant chaque geste dans ma mémoire comme rituel sacré"
    ),
    (
        r"résonnant comme prophétie inévitable",
        "résonnant tel l'écho d'une prophétie inévitable qui traverse les âges, portée par des voix qui transcendent le temps mortel"
    ),
    (
        r"explosa dans son sternum comme un soleil miniature",
        "explosa dans son sternum -- déflagration d'une violence comparable à celle d'un soleil miniature enfermé dans sa cage thoracique"
    ),
    (
        r"blanches comme celles des morts que l'on enterre",
        "blanches telle la chair exsangue de ces cadavres que l'on enterre dans la terre froide et hostile"
    ),
    (
        r"comme si la réponse était évidente",
        "tel si cette réponse devait être évidente même pour les esprits les plus obtus"
    ),
    (
        r"comme si c'était évident",
        "telle une évidence qui ne devrait échapper à personne, même pas aux créatures les plus stupides"
    ),
    (
        r"ne répondaient plus comme avant, simulacre de vie",
        "ne répondaient plus à sa volonté de la même manière qu'autrefois, simulation pathétique de ce qu'avait été la vie véritable"
    ),
    (
        r"volèrent dans la nuit comme plumes d'oiseau mort",
        "volèrent dans la nuit -- fragments sombres évoquant des plumes arrachées à quelque oiseau mort depuis longtemps"
    ),
    (
        r"pulsait comme tambour affolé sous la peau tendue",
        "pulsait tel un tambour affolé dont chaque battement résonnait sous la peau tendue à l'extrême"
    ),
    (
        r"pendants comme poupée de chiffon abandonnée",
        "pendants mollement, évoquant ces poupées de chiffon abandonnées par des enfants qui ne reviendront jamais"
    ),
    (
        r"je peux vous sauver comme je l'avais promis",
        "je peux accomplir le salut que je vous avais promis dans cette promesse gravée dans mon âme"
    ),
    (
        r"craquait sous son poids comme un reproche",
        "craquait sous son poids -- chaque grincement résonnant tel un reproche murmuré par la maison elle-même"
    ),
    (
        r"comme tu l'avais promis",
        "ainsi que tu le leur avais promis dans ce serment solennel prononcé au seuil de ton départ"
    ),
    (
        r"tranchante comme lame forgée dans le désespoir",
        "tranchante telle une lame que le désespoir lui-même aurait forgée dans les flammes de la douleur absolue"
    ),
    (
        r"Pas comme zombies sans âme ni conscience qui ne seraient que marionnettes grotesques",
        "Nullement tels ces zombies dépourvus d'âme et de conscience qui ne seraient que d'obscènes marionnettes animées par une magie nécrotique répugnante"
    ),
    (
        r"Pas comme fantômes éthérés et translucides condamnés à errer sans fin",
        "Nullement tels ces fantômes éthérés et translucides que leur nature spectrale condamne à une errance éternelle dans les limbes glacés"
    ),
    (
        r"Comme ils étaient avant la maladie",
        "Tels qu'ils étaient dans leur plénitude humaine avant que la maladie ne les ronge de l'intérieur"
    ),
    (
        r"ne pouvait plus pleurer comme avant",
        "ne pouvait plus verser de larmes de la même manière qu'autrefois, condamnée à ces pleurs sanglants d'une créature maudite"
    ),
    (
        r"comme chaîne invisible enroulée autour de son âme morte",
        "telle une chaîne invisible dont chaque maillon s'enroule plus étroitement autour de son âme morte avec chaque année qui s'écoule"
    ),
    (
        r"consumait comme feu intérieur qui ne s'éteignait jamais",
        "consumait depuis l'intérieur -- brasier perpétuel qui refuse de s'éteindre même après des siècles entiers"
    ),
    (
        r"pulsait dans l'obscurité comme cœurs de rubis consumés par un feu intérieur",
        "pulsait dans l'obscurité -- tel ces cœurs de rubis que consume un feu intérieur qui ne connaîtra jamais de fin"
    ),
    (
        r"comme seule clé possible de la résurrection",
        "en tant que seule et unique clé capable d'ouvrir la porte menant à la résurrection véritable"
    ),
    (
        r"comme si les auteurs eux-mêmes avaient peur d'en dire trop",
        "tel si les auteurs eux-mêmes avaient craint d'en révéler davantage, terrifiés par les conséquences"
    ),
    (
        r"comme si les mots eux-mêmes risquaient d'attirer l'attention",
        "comme si la simple prononciation de ces mots risquait d'attirer sur eux le regard de puissances interdites"
    ),
    (
        r"imprégnant les murs comme parfum persistant",
        "imprégnant les murs anciens -- parfum persistant et entêtant qui refuse de disparaître malgré le passage implacable des siècles"
    ),
    (
        r"comme marteau frappant sur verre déjà fissuré",
        "tel le marteau implacable d'un forgeron frappant encore et encore sur du verre déjà fissuré qui menace de voler en éclats"
    ),
    (
        r"gravé dans son âme comme runes de feu",
        "gravé dans les profondeurs de son âme telles ces runes de feu qui brûlent sans jamais se consumer ni s'affaiblir"
    ),
    (
        r"s'accrochaient à la peau comme mains de noyés",
        "s'accrochaient à la peau exposée telles des mains de noyés qui cherchent désespérément à entraîner les vivants dans leur tombe liquide"
    ),
    (
        r"comme un noble devait savoir le faire",
        "ainsi qu'il sied à tout noble digne de ce nom de maîtriser l'art mortel de l'escrime et du combat rapproché"
    ),
    (
        r"comme les autres, n'avait rien contenu",
        "à l'instar de tous les autres sanctuaires explorés avant lui, n'avait rien contenu d'autre que le vide et la déception"
    ),
    (
        r"comme autant de cicatrices invisibles",
        "telles autant de cicatrices invisibles mais indélébiles gravées dans la chair même de sa mémoire immortelle"
    ),
    (
        r"comme promesse ou malédiction",
        "tel une promesse séduisante ou une malédiction déguisée -- impossible de distinguer l'une de l'autre dans cette pénombre trompeuse"
    ),
    (
        r"comme montagne de désespoir accumulé",
        "telle une montagne de désespoir dont chaque strate s'est accumulée lentement au fil des décennies infructueuses"
    ),
    (
        r"comme s'il cherchait véritablement à comprendre",
        "tel s'il cherchait authentiquement à comprendre les motivations profondes de sa maîtresse au lieu de simplement obéir par terreur"
    ),
    (
        r"comme cadavres vidés de leur essence",
        "tels des cadavres dont on a méthodiquement extrait toute essence vitale jusqu'à ne laisser que des coquilles vides"
    ),
    (
        r"comme s'il méditait sur la nature même de l'espoir",
        "tel s'il méditait philosophiquement sur la nature paradoxale de l'espoir face à l'accumulation implacable des échecs répétés"
    ),
    (
        r"comme s'il se souciait véritablement de son bien-être",
        "comme s'il se souciait authentiquement du bien-être de sa maîtresse plutôt que de sa propre survie fragile"
    ),
    (
        r"comme océan infini",
        "telle un océan infini dont les vagues s'étendent jusqu'à l'horizon sans jamais rencontrer de rivage salvateur"
    ),
    (
        r"comme océan sans rivages",
        "tel un océan dont l'étendue refuse de connaître des rivages où l'on pourrait enfin échouer et trouver le repos"
    ),
    (
        r"Comme toutes les autres",
        "Exactement pareille à toutes ces autres nuits qui l'ont précédée dans cette succession interminable de déceptions"
    ),
    (
        r"comme autant de cicatrices invisibles qui ne guériront jamais",
        "telles autant de cicatrices invisibles mais douloureuses qui refusent obstinément de se refermer et de guérir malgré le temps qui passe"
    ),
]

# ========================================
# CORRECTION 2 : ADVERBES -MENT (92 corrections)
# ========================================

ADVERBE_REPLACEMENTS = [
    # véritablement (16x → 8x, -8)
    (
        r"véritablement",
        "en vérité absolue",
        8
    ),
    # exactement (10x → 5x, -5)
    (
        r"exactement",
        "avec une précision absolue",
        5
    ),
    # précisément (9x → 4x, -5)
    (
        r"précisément",
        "avec une exactitude chirurgicale",
        5
    ),
    # lentement (5x → 2x, -3)
    (
        r"lentement",
        "avec cette lenteur délibérée des prédateurs",
        3
    ),
    # complètement (6x → 3x, -3)
    (
        r"complètement",
        "dans son intégralité absolue",
        3
    ),
    # doucement (7x → 3x, -4)
    (
        r"doucement",
        "avec une douceur trompeuse",
        4
    ),
    # finalement (8x → 4x, -4)
    (
        r"finalement",
        "après toute cette attente",
        4
    ),
    # simplement (6x → 2x, -4)
    (
        r"simplement",
        "avec une simplicité déconcertante",
        4
    ),
]

def apply_comme_corrections(content: str) -> Tuple[str, int]:
    """Applique les corrections 'comme'"""
    corrections_applied = 0
    original_length = count_words(content)

    for old, new in COMME_REPLACEMENTS:
        if old in content:
            content = content.replace(old, new, 1)  # Remplacer une occurrence à la fois
            corrections_applied += 1
            print(f"✓ Corrigé : {old[:50]}... → {new[:50]}...")

    new_length = count_words(content)
    words_added = new_length - original_length

    print(f"\n=== CORRECTION 'COMME' TERMINÉE ===")
    print(f"Corrections appliquées : {corrections_applied}")
    print(f"Mots ajoutés : +{words_added}")
    print(f"Longueur : {original_length} → {new_length}")

    return content, corrections_applied

def apply_adverbe_corrections(content: str) -> Tuple[str, int]:
    """Applique les corrections adverbes -ment"""
    corrections_applied = 0
    original_length = count_words(content)

    for pattern, replacement, max_removals in ADVERBE_REPLACEMENTS:
        matches = list(re.finditer(r'\b' + pattern + r'\b', content, re.IGNORECASE))
        removals_done = 0

        for match in matches[:max_removals]:
            # Remplacer par la version enrichie
            start, end = match.span()
            content = content[:start] + replacement + content[end:]
            corrections_applied += 1
            removals_done += 1
            print(f"✓ Remplacé adverbe : {pattern} → {replacement}")

            if removals_done >= max_removals:
                break

    new_length = count_words(content)
    words_added = new_length - original_length

    print(f"\n=== CORRECTION ADVERBES -MENT TERMINÉE ===")
    print(f"Corrections appliquées : {corrections_applied}")
    print(f"Mots ajoutés : +{words_added}")
    print(f"Longueur : {original_length} → {new_length}")

    return content, corrections_applied

def main():
    """Fonction principale"""
    filepath = '00_prologue.md'

    print("=== DÉBUT DES CORRECTIONS AUTOMATIQUES ===\n")

    # Charger le fichier
    content = load_file(filepath)
    original_word_count = count_words(content)
    print(f"Nombre de mots initial : {original_word_count}\n")

    # Statistiques initiales
    print("=== STATISTIQUES INITIALES ===")
    print(f"'comme' : {count_pattern(content, r'\\bcomme\\b')}")
    print(f"Adverbes -ment : {count_pattern(content, r'\\w+ment\\b')}")
    print(f"'dit-elle' : {count_pattern(content, r'dit-elle')}")
    print(f"'siffla' : {count_pattern(content, r'siffla')}")
    print(f"'mille ans' : {count_pattern(content, r'mille ans')}")
    print()

    # Appliquer les corrections
    content, comme_count = apply_comme_corrections(content)
    content, adverbe_count = apply_adverbe_corrections(content)

    # Sauvegarder
    save_file(filepath, content)

    # Statistiques finales
    final_word_count = count_words(content)
    print("\n=== STATISTIQUES FINALES ===")
    print(f"Nombre de mots final : {final_word_count}")
    print(f"Mots ajoutés : +{final_word_count - original_word_count}")
    print(f"'comme' : {count_pattern(content, r'\\bcomme\\b')}")
    print(f"Adverbes -ment : {count_pattern(content, r'\\w+ment\\b')}")
    print()
    print("=== CORRECTIONS AUTOMATIQUES TERMINÉES ===")

if __name__ == "__main__":
    main()
