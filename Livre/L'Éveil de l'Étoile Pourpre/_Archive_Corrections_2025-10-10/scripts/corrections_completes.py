#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de corrections COMPLÈTES pour le prologue
Règle absolue : Texte corrigé >= texte original EN LONGUEUR
"""

import re

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

# ==================================================================
# TOUTES LES CORRECTIONS "COMME" (41 prioritaires)
# ==================================================================

COMME_CORRECTIONS = [
    # Ligne 173 - FAIT MANUELLEMENT
    # Ligne 489 - FAIT MANUELLEMENT

    # Ligne 679
    (
        r"Elle explosa dans son sternum comme un soleil miniature\.",
        "Elle explosa dans son sternum -- déflagration d'une violence comparable à celle d'un soleil miniature enfermé dans sa cage thoracique, brûlant tout sur son passage."
    ),

    # Ligne 773
    (
        r"blanches comme celles des morts que l'on enterre\.",
        "blanches telle la chair exsangue de ces cadavres que l'on enterre dans la terre froide et hostile, privés à jamais de la chaleur de la vie."
    ),

    # Ligne 801
    (
        r"⟨ Du sang, ⟩ répondit le Codex, comme si la réponse était évidente\.",
        "⟨ Du sang, ⟩ répondit le Codex, tel si cette réponse devait être évidente même pour les esprits les plus obtus, une vérité fondamentale de la transformation."
    ),

    # Ligne 967
    (
        r"⟨ Regarde, ⟩ dit le Codex, comme si c'était évident\.",
        "⟨ Regarde, ⟩ dit le Codex, telle une évidence qui ne devrait échapper à personne, même pas aux créatures les plus stupides errant dans ce monde déchu."
    ),

    # Ligne 991
    (
        r"ne répondaient plus comme avant, simulacre de vie\.",
        "ne répondaient plus à sa volonté de la même manière qu'autrefois, simulation pathétique de ce qu'avait été la vie véritable, simple pantomime d'un souffle qui n'existe plus."
    ),

    # Ligne 1139
    (
        r"volèrent dans la nuit comme plumes d'oiseau mort\.",
        "volèrent dans la nuit -- fragments sombres évoquant des plumes arrachées à quelque oiseau mort depuis longtemps, tombant avec cette grâce macabre de la décomposition."
    ),

    # Ligne 1141
    (
        r"pulsait comme tambour affolé sous la peau tendue\.",
        "pulsait tel un tambour affolé dont chaque battement résonnait sous la peau tendue à l'extrême, proclamant la terreur absolue de sa victime."
    ),

    # Ligne 1163
    (
        r"pendants comme poupée de chiffon abandonnée\.",
        "pendants mollement, évoquant ces poupées de chiffon abandonnées par des enfants qui ne reviendront jamais, bras morts ballant dans le vide."
    ),

    # Ligne 1249
    (
        r"comme je l'avais promis\.",
        "ainsi que je vous l'avais promis dans ce serment solennel prononcé au seuil de mon départ, gravé dans mon âme avec une encre de désespoir."
    ),

    # Ligne 1259
    (
        r"Chaque marche craquait sous son poids comme un reproche\.",
        "Chaque marche craquait sous son poids -- chaque grincement résonnant tel un reproche murmuré par la maison elle-même, accusant celle qui revenait trop tard."
    ),

    # Ligne 1321
    (
        r"comme tu l'avais promis\.",
        "ainsi que tu le leur avais promis dans ce serment solennel prononcé au seuil de ton départ, paroles suspendues entre l'espoir et le désespoir."
    ),

    # Ligne 1349
    (
        r"tranchante comme lame forgée dans le désespoir\.",
        "tranchante telle une lame que le désespoir lui-même aurait forgée dans les flammes de la douleur absolue, aiguisée sur la pierre de mille années de souffrance."
    ),

    # Ligne 1374-1375
    (
        r"Pas comme zombies sans âme ni conscience qui ne seraient que marionnettes grotesques\. Pas comme fantômes éthérés et translucides condamnés à errer sans fin\. Vivants dans toute leur humanité pleine et entière, chair chaude et cœur battant\. Comme ils étaient avant la maladie",
        "Nullement tels ces zombies dépourvus d'âme et de conscience qui ne seraient que d'obscènes marionnettes animées par une magie nécrotique répugnante. Nullement tels ces fantômes éthérés et translucides que leur nature spectrale condamne à une errance éternelle dans les limbes glacés. Vivants dans toute leur humanité pleine et entière, chair chaude et cœur battant. Tels qu'ils étaient dans leur plénitude humaine avant que la maladie ne les ronge de l'intérieur"
    ),

    # Ligne 1377
    (
        r"ne pouvait plus pleurer comme avant\.",
        "ne pouvait plus verser de larmes de la même manière qu'autrefois, condamnée à ces pleurs sanglants d'une créature maudite qui a perdu jusqu'au droit de pleurer comme les vivants."
    ),

    # Ligne 1439
    (
        r"comme chaîne invisible enroulée autour de son âme morte",
        "telle une chaîne invisible dont chaque maillon s'enroule plus étroitement autour de son âme morte avec chaque année qui s'écoule, resserrant son emprise jusqu'à l'étouffement"
    ),

    # Ligne 1441 (2 occurrences)
    (
        r"consumait comme feu intérieur qui ne s'éteignait jamais",
        "consumait depuis l'intérieur -- brasier perpétuel qui refuse de s'éteindre même après des siècles entiers, flamme éternelle dévorant ce qui reste de son humanité"
    ),
    (
        r"pulsait dans l'obscurité comme cœurs de rubis consumés par un feu intérieur qui ne s'éteindrait jamais",
        "pulsait dans l'obscurité -- tels ces cœurs de rubis que consume un feu intérieur qui ne connaîtra jamais de fin, brûlant avec cette intensité surnaturelle des damnés"
    ),

    # Ligne 1443 (2 occurrences)
    (
        r"comme seule clé possible de la résurrection",
        "en tant que seule et unique clé capable d'ouvrir la porte menant à la résurrection véritable, graal ultime de sa quête millénaire"
    ),
    (
        r"comme si les auteurs eux-mêmes avaient peur d'en dire trop, comme si les mots eux-mêmes risquaient d'attirer l'attention",
        "tel si les auteurs eux-mêmes avaient craint d'en révéler davantage, terrifiés par les conséquences, comme si la simple prononciation de ces mots risquait d'attirer sur eux le regard de puissances interdites qui ne devraient jamais être réveillées"
    ),

    # Ligne 1445
    (
        r"imprégnant les murs comme parfum persistant qui refusait de disparaître",
        "imprégnant les murs anciens -- parfum persistant et entêtant qui refuse de disparaître malgré le passage implacable des siècles, signature olfactive d'une civilisation morte"
    ),

    # Ligne 1449
    (
        r"comme marteau frappant sur verre déjà fissuré",
        "tel le marteau implacable d'un forgeron frappant encore et encore sur du verre déjà fissuré qui menace de voler en éclats à chaque nouveau coup"
    ),
    (
        r"gravé dans son âme comme runes de feu qui brûlaient",
        "gravé dans les profondeurs de son âme telles ces runes de feu qui brûlent"
    ),

    # Ligne 1455
    (
        r"s'accrochaient à la peau comme mains de noyés",
        "s'accrochaient à la peau exposée telles des mains de noyés qui cherchent désespérément à entraîner les vivants dans leur tombe liquide, griffes désespérées de morts qui refusent la solitude"
    ),

    # Ligne 1469
    (
        r"comme un noble devait savoir le faire",
        "ainsi qu'il sied à tout noble digne de ce nom de maîtriser l'art mortel de l'escrime et du combat rapproché, héritage martial transmis de génération en génération"
    ),

    # Ligne 1473
    (
        r"comme les autres, n'avait rien contenu",
        "à l'instar de tous les autres sanctuaires explorés avant lui, n'avait rien contenu d'autre que le vide et la déception, coquille vide d'espoirs morts"
    ),

    # Ligne 1475
    (
        r"comme autant de cicatrices invisibles",
        "telles autant de cicatrices invisibles mais indélébiles gravées dans la chair même de sa mémoire immortelle, marques douloureuses qui ne s'effaceront jamais"
    ),

    # Ligne 1477
    (
        r"comme promesse ou malédiction",
        "tel une promesse séduisante ou une malédiction déguisée -- impossible de distinguer l'une de l'autre dans cette pénombre trompeuse qui obscurcit tout jugement"
    ),
    (
        r"comme montagne de désespoir accumulé",
        "telle une montagne de désespoir dont chaque strate s'est accumulée lentement au fil des décennies infructueuses, couches de douleur pétrifiée empilées jusqu'au ciel"
    ),

    # Ligne 1491
    (
        r"comme s'il cherchait véritablement à comprendre",
        "tel s'il cherchait authentiquement à comprendre les motivations profondes de sa maîtresse au lieu de simplement obéir par terreur, curiosité sincère d'une ombre douée de conscience"
    ),

    # Ligne 1493
    (
        r"comme cadavres vidés de leur essence",
        "tels des cadavres dont on a méthodiquement extrait toute essence vitale jusqu'à ne laisser que des coquilles vides, enveloppes creuses de ce qui fut jadis puissant"
    ),

    # Ligne 1497
    (
        r"comme s'il méditait sur la nature même de l'espoir",
        "tel s'il méditait philosophiquement sur la nature paradoxale de l'espoir face à l'accumulation implacable des échecs répétés, question existentielle sans réponse satisfaisante"
    ),

    # Ligne 1503
    (
        r"comme s'il se souciait véritablement de son bien-être",
        "tel s'il se souciait authentiquement du bien-être de sa maîtresse plutôt que de sa propre survie fragile, sollicitude inhabituelle pour une créature née de l'ombre"
    ),

    # Ligne 1505
    (
        r"comme océan infini",
        "tel un océan infini dont les vagues s'étendent jusqu'à l'horizon sans jamais rencontrer de rivage salvateur, étendue liquide sans fin ni commencement"
    ),

    # Ligne 1551
    (
        r"qui s'étendait comme océan sans rivages",
        "qui s'étendait tel un océan dont l'étendue refuse de connaître des rivages où l'on pourrait enfin échouer et trouver le repos, mer de souffrance sans limites"
    ),

    # Ligne 1555
    (
        r"Cette nuit sera comme toutes les autres",
        "Cette nuit sera exactement pareille à toutes ces autres nuits qui l'ont précédée dans cette succession interminable de déceptions"
    ),

    # Ligne 1583
    (
        r"comme autant de cicatrices invisibles qui ne guériront jamais",
        "telles autant de cicatrices invisibles mais douloureuses qui refusent obstinément de se refermer et de guérir malgré le temps qui passe, plaies éternelles dans sa psyché immortelle"
    ),
    (
        r"comme ombre collée à mes pas",
        "telle une ombre obstinée qui refuse de se détacher de mes pas, compagne indésirable mais inséparable de chaque instant de mon existence maudite"
    ),

    # Ligne 1599
    (
        r"comme une plaie béante dans la chair du monde",
        "telle une plaie béante ouverte dans la chair vivante du monde lui-même, blessure purulente qui refuse de se refermer malgré le passage des millénaires"
    ),
    (
        r"comme des maisons entières",
        "comparables à des maisons entières dans leurs dimensions titanesques"
    ),

    # Ligne 1603
    (
        r"comme une lèpre spirituelle",
        "telle une lèpre spirituelle qui dévore la substance même de la pierre ancestrale"
    ),

    # Ligne 1607
    (
        r"comme givre mortel",
        "tel un givre mortel qui transforme tout ce qu'il touche en sculpture de glace et de mort"
    ),

    # Ligne 1611
    (
        r"comme fumée inversée qui remonte vers sa source",
        "telle une fumée inversée défiant les lois naturelles en remontant vers sa source au lieu de se dissiper dans les airs"
    ),
]

def apply_corrections(content, corrections_list, correction_name):
    """Applique une liste de corrections"""
    print(f"\n{'='*60}")
    print(f"CORRECTION : {correction_name}")
    print(f"{'='*60}")

    original_length = count_words(content)
    corrections_applied = 0

    for old_pattern, new_text in corrections_list:
        # Chercher le pattern
        matches = list(re.finditer(old_pattern, content, re.DOTALL))

        if matches:
            # Prendre la première occurrence
            match = matches[0]
            old_text = match.group(0)

            # Remplacer
            content = content[:match.start()] + new_text + content[match.end():]
            corrections_applied += 1

            old_words = len(old_text.split())
            new_words = len(new_text.split())
            diff = new_words - old_words

            print(f"✓ [{corrections_applied:02d}] Remplacé ({diff:+d} mots):")
            print(f"  AVANT ({old_words} mots): {old_text[:80]}...")
            print(f"  APRÈS ({new_words} mots): {new_text[:80]}...")

    new_length = count_words(content)
    words_added = new_length - original_length

    print(f"\n{correction_name} TERMINÉE:")
    print(f"  Corrections appliquées : {corrections_applied}")
    print(f"  Mots ajoutés : +{words_added}")
    print(f"  Longueur : {original_length} → {new_length}")

    return content, corrections_applied, words_added

def main():
    filepath = '00_prologue.md'

    print("="*60)
    print("CORRECTIONS COMPLÈTES DU PROLOGUE")
    print("="*60)

    # Charger
    content = load_file(filepath)
    original_word_count = count_words(content)

    print(f"\nNombre de mots initial : {original_word_count}")

    # Statistiques initiales
    print("\n" + "="*60)
    print("STATISTIQUES INITIALES")
    print("="*60)
    print(f"'comme' : {count_pattern(content, r'\\bcomme\\b')}")
    print(f"Adverbes -ment : {count_pattern(content, r'\\w+ment\\b')}")
    print(f"'dit-elle' : {count_pattern(content, r'dit-elle')}")
    print(f"'siffla' : {count_pattern(content, r'siffla')}")
    print(f"'mille ans' : {count_pattern(content, r'mille ans')}")

    # Appliquer corrections "comme"
    content, comme_count, comme_words = apply_corrections(
        content, COMME_CORRECTIONS, "ENRICHISSEMENT 'COMME'"
    )

    # Sauvegarder
    save_file(filepath, content)

    # Statistiques finales
    final_word_count = count_words(content)
    total_added = final_word_count - original_word_count

    print("\n" + "="*60)
    print("STATISTIQUES FINALES")
    print("="*60)
    print(f"Nombre de mots : {original_word_count} → {final_word_count} (+{total_added})")
    print(f"'comme' : {count_pattern(content, r'\\bcomme\\b')}")
    print(f"Adverbes -ment : {count_pattern(content, r'\\w+ment\\b')}")
    print(f"'dit-elle' : {count_pattern(content, r'dit-elle')}")
    print(f"'siffla' : {count_pattern(content, r'siffla')}")
    print(f"'mille ans' : {count_pattern(content, r'mille ans')}")

    print("\n" + "="*60)
    print("CORRECTIONS TERMINÉES AVEC SUCCÈS")
    print("="*60)

if __name__ == "__main__":
    main()
