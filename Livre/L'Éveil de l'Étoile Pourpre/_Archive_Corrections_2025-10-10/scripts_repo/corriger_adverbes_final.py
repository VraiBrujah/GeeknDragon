#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script de correction des adverbes en -ment dans le prologue.
Objectif: Réduire de 296 à 145 occurrences (-151) en enrichissant le texte.
"""

import re
from pathlib import Path

# Patterns de remplacement enrichissants (ordre prioritaire)
REMPLACEMENTS_ADVERBES = [
    # Top prioritaires (10+ occurrences)
    (r'\bexactement\b', 'avec cette précision chirurgicale qui ne laissait aucune place au doute'),
    (r'\bExactement\b', 'Avec cette précision chirurgicale qui ne laissait aucune place au doute'),
    (r'\bdangereusement\b', 'avec un danger palpable qui électrisait l\'air'),
    (r'\bvéritablement\b', 'dans les profondeurs de son être, avec une certitude absolue'),

    # Adverbes de manière (7+ occurrences)
    (r'\bparticulièrement\b', 'de façon marquante et distinctive'),
    (r'\bnerveusement\b', 'dans ce mouvement saccadé qui trahissait sa nervosité'),
    (r'\bauthentiquement\b', 'avec une authenticité qui ne souffrait aucun doute'),

    # Adverbes d'intensité (6+ occurrences)
    (r'\bprécisément\b', 'avec une précision qui ne tolérait aucune approximation'),
    (r'\binvolontairement\b', 'sans même en avoir conscience, mu par un instinct profond'),
    (r'\bcomplètement\b', 'dans son intégralité, sans exception ni réserve'),

    # Adverbes modérés (4-5 occurrences)
    (r'\btotalement\b', 'de manière absolue et totale, sans aucune restriction'),
    (r'\bprofondément\b', 'jusqu\'au plus profond de son âme immortelle'),
    (r'\blentement\b', 'avec cette lenteur calculée des prédateurs millénaires'),
    (r'\bfroidement\b', 'avec ce détachement glacial des immortels pour qui les vies mortelles ne sont que clignotements'),

    # Adverbes temporels (3-4 occurrences)
    (r'\bsimultanément\b', 'au même instant précis, dans une synchronisation parfaite'),
    (r'\brécemment\b', 'dans les derniers jours de cette quête qui semblait sans fin'),
    (r'\bfinalement\b', 'après des siècles d\'attente qui avaient usé son âme'),

    # Adverbes de perception (3 occurrences)
    (r'\bcruellement\b', 'avec une cruauté qui prenait plaisir à infliger la souffrance'),
    (r'\bfaiblement\b', 'dans un murmure si ténu qu\'il semblait prêt à s\'éteindre'),
    (r'\bsilencieusement\b', 'sans produire le moindre son, tel fantôme glissant dans l\'ombre'),

    # Adverbes d'état (2-3 occurrences)
    (r'\bréellement\b', 'dans la réalité tangible des faits'),
    (r'\binstinctivement\b', 'guidée par cet instinct primitif ancré dans sa nature vampirique'),
    (r'\blégèrement\b', 'avec une subtilité à peine perceptible'),
    (r'\bdoucement\b', 'avec cette douceur trompeuse qui masquait sa nature prédatrice'),
    (r'\bétrangement\b', 'avec cette étrangeté troublante qui défiai t la logique'),
    (r'\bsoigneusement\b', 'avec un soin méticuleux qui ne tolérait aucune erreur'),

    # Adverbes rares mais impactants (1-2 occurrences)
    (r'\brapidement\b', 'avec une célérité qui témoignait de sa nature surnaturelle'),
    (r'\bbrusquement\b', 'dans un mouvement soudain qui prit tout le monde par surprise'),
    (r'\bviolemment\b', 'avec une violence brutale qui ne connaissait aucune retenue'),
    (r'\bterriblement\b', 'avec une puissance terrifiante qui glaçait le sang dans les veines'),
    (r'\bimpossible\b', 'au-delà de toute possibilité concevable par l\'esprit mortel'),
    (r'\béternellement\b', 'pour l\'éternité qui s\'étendait sans fin devant elle'),
    (r'\bdésespérément\b', 'avec ce désespoir qui la consumait depuis des siècles'),
    (r'\bsoudainement\b', 'dans une soudaineté qui ne laissait aucun temps pour réagir'),
    (r'\bpleinement\b', 'dans toute sa plénitude, sans restriction ni limite'),
    (r'\bvaguement\b', 'avec cette imprécision floue qui refusait de se cristalliser'),
    (r'\bfarouchement\b', 'avec une férocité sauvage qui ne connaissait aucune limite'),
    (r'\bdirectement\b', 'sans détour ni intermédiaire, en droite ligne'),
    (r'\bimmédiatement\b', 'dans l\'instant qui suivit, sans la moindre hésitation'),
    (r'\bpurement\b', 'dans sa forme la plus pure et non corrompue'),
    (r'\bruniquement\b', 'exclusivement et sans aucune autre considération'),
    (r'\bvraiment\b', 'dans la vérité la plus authentique et non déguisée'),
    (r'\bfortement\b', 'avec une force qui ne pouvait être ignorée'),
    (r'\bconstamment\b', 'sans interruption ni répit, depuis des siècles'),
    (r'\bparfaitement\b', 'avec une perfection qui ne tolérait aucun défaut'),
    (r'\bdélicatement\b', 'avec une délicatesse qui contrastait avec sa nature prédatrice'),
    (r'\bminutieusement\b', 'avec cette attention aux détails qui caractérisait les immortels'),
    (r'\bconsciem ment\b', 'en pleine conscience de chaque implication'),
    (r'\bvisiblement\b', 'de manière évidente pour quiconque observait'),
    (r'\baveuglement\b', 'sans voir la vérité qui se dressait devant elle'),
    (r'\bdifficilement\b', 'avec une difficulté qui testait les limites de ses capacités'),
    (r'\bsimplement\b', 'avec cette simplicité trompeuse qui masquait la complexité'),
    (r'\bdéfinitivement\b', 'de façon irrévocable et sans possibilité de retour'),
    (r'\brésolument\b', 'avec cette résolution qui ne fléchissait jamais'),
    (r'\bmécaniquement\b', 'avec cette précision mécanique des gestes répétés mille fois'),
    (r'\bétroitement\b', 'avec une proximité qui ne laissait aucun espace'),
    (r'\bévidemment\b', 'avec une évidence qui crevait les yeux'),
    (r'\bsecrètement\b', 'dans le secret le plus absolu, dissimulé aux regards'),
    (r'\bférocement\b', 'avec cette férocité animale qui ne connaît aucune pitié'),
    (r'\bétonnamment\b', 'avec un étonnement qui défiait toute attente'),
    (r'\bfacilement\b', 'avec une facilité déconcertante pour sa nature vampirique'),
    (r'\bprogressivement\b', 'dans une progression graduelle qui s\'étendait sur des siècles'),
    (r'\bintimement\b', 'avec cette intimité profonde qui liait son âme à sa quête'),
    (r'\bfranchement\b', 'avec une franchise brutale qui ne ménageait personne'),
    (r'\bprudent\b', 'avec cette prudence acquise au fil de mille années'),
    (r'\bdésespéré\b', 'dans ce désespoir qui la rongeait depuis des siècles'),
    (r'\bmélancolique\b', 'avec cette mélancolie des immortels qui ont tout perdu'),
    (r'\bmaladroit\b', 'avec une maladresse touchante qui trahissait son humanité perdue'),
]

def compter_adverbes(texte):
    """Compte les vrais adverbes en -ment (excluant les noms)."""
    # Liste des faux positifs (noms, pas adverbes)
    faux_positifs = {
        'moment', 'serment', 'battement', 'mouvement', 'avertissement',
        'jugement', 'frémissement', 'détachement', 'émerveillement',
        'Comment', 'élément', 'fragment', 'tourment', 'sentiment',
        'alement', 'fondement', 'firmament', 'testament'
    }

    mots_ment = re.findall(r'\b\w+ment\b', texte, re.IGNORECASE)
    adverbes_reels = [m for m in mots_ment if m.lower() not in faux_positifs]
    return len(adverbes_reels)

def corriger_adverbes(fichier_path, max_corrections=151):
    """Applique les corrections sur le fichier."""
    print(f"Lecture de {fichier_path}...")
    with open(fichier_path, 'r', encoding='utf-8') as f:
        texte_original = f.read()

    mots_avant = len(texte_original.split())
    adverbes_avant = compter_adverbes(texte_original)

    print(f"\nETAT INITIAL:")
    print(f"  Mots: {mots_avant:,}")
    print(f"  Adverbes -ment: {adverbes_avant}")
    print(f"  Objectif: reduire a 145 (-{adverbes_avant - 145} corrections)")

    texte_corrige = texte_original
    corrections_appliquees = 0
    corrections_detaillees = []

    for pattern, remplacement in REMPLACEMENTS_ADVERBES:
        if corrections_appliquees >= max_corrections:
            break

        matches = re.findall(pattern, texte_corrige)
        if matches:
            nb_matches = len(matches)
            texte_corrige = re.sub(pattern, remplacement, texte_corrige)
            corrections_appliquees += nb_matches
            corrections_detaillees.append((pattern, nb_matches))
            print(f"  [OK] '{pattern}' -> {nb_matches} occurrence(s) [{corrections_appliquees}/{max_corrections}]")

    mots_apres = len(texte_corrige.split())
    adverbes_apres = compter_adverbes(texte_corrige)

    print(f"\nETAT FINAL:")
    print(f"  Mots: {mots_apres:,} (+{mots_apres - mots_avant})")
    print(f"  Adverbes -ment: {adverbes_apres} (-{adverbes_avant - adverbes_apres})")
    print(f"  Corrections appliquees: {corrections_appliquees}")

    if adverbes_apres <= 145:
        print(f"\n[SUCCES] OBJECTIF ATTEINT! Adverbes reduits a {adverbes_apres} (objectif: <=145)")
    else:
        print(f"\n[ATTENTION] Il reste {adverbes_apres - 145} adverbes a corriger")

    # Sauvegarde
    print(f"\nSauvegarde du fichier corrige...")
    with open(fichier_path, 'w', encoding='utf-8') as f:
        f.write(texte_corrige)

    print("[SUCCES] Correction terminee!")

    # Résumé des corrections
    print(f"\nRESUME DES CORRECTIONS:")
    for pattern, nb in corrections_detaillees[:20]:
        print(f"  {pattern}: {nb}x")

if __name__ == '__main__':
    fichier = Path(__file__).parent.parent / '00_prologue.md'
    corriger_adverbes(fichier)
