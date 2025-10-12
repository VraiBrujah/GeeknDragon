#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de correction éditoriale pour réduire les appellations génériques distanciantes
dans le prologue de L'Éveil de l'Étoile Pourpre.

RÈGLES:
- JAMAIS raccourcir le texte
- Remplacer 60-70% des appellations génériques par "elle" ou "Morwen"
- Conserver 20-30% quand valeur stylistique importante
- Préserver expressions idiomatiques "X-même"
"""

import re
import sys
from pathlib import Path

def corriger_appellations(fichier_path):
    """Corrige les appellations génériques distanciantes dans le fichier."""

    # Lire le contenu
    with open(fichier_path, 'r', encoding='utf-8') as f:
        contenu = f.read()

    contenu_original = contenu
    corrections = []

    # ===== CORRECTIONS "la vampire" =====

    # Ligne ~1771: pensée intérieure
    old = "*❖ Mais j'ai attendu mille ans pour atteindre ce moment. Je ne reculerai pas maintenant. Quelle que soit cette présence, l'immortelle découvrira que je suis bien plus dangereuse qu'la vampire ne peut l'imaginer.*"
    new = "*❖ Mais j'ai attendu mille ans pour atteindre ce moment. Je ne reculerai pas maintenant. Quelle que soit cette présence, elle découvrira que je suis bien plus dangereuse qu'elle ne peut l'imaginer.*"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections.append(("ligne ~1771", "qu'la vampire ne peut", "qu'elle ne peut"))

    # Ligne ~1781: narration simple
    old = "*❖ C'est là que sera la fin, Umbra. Pas avant. Jamais avant.*\n\nLa vampire reprit sa marche, s'enfonçant toujours plus profond"
    new = "*❖ C'est là que sera la fin, Umbra. Pas avant. Jamais avant.*\n\nElle reprit sa marche, s'enfonçant toujours plus profond"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections.append(("ligne ~1781", "La vampire reprit", "Elle reprit"))

    # Ligne ~1833: narration simple
    old = "Les notes métalliques que tu perçois, c'est l'agonie cristallisée à travers le temps. La terreur d'un mortel sachant qu'il allait mourir pour alimenter les ambitions démentes des Éthériens.*\n\nLa vampire rouvrit les yeux et continua sa marche"
    new = "Les notes métalliques que tu perçois, c'est l'agonie cristallisée à travers le temps. La terreur d'un mortel sachant qu'il allait mourir pour alimenter les ambitions démentes des Éthériens.*\n\nMorwen rouvrit les yeux et continua sa marche"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections.append(("ligne ~1833", "La vampire rouvrit", "Morwen rouvrit"))

    # Ligne ~1949: répétition proche (2ème occurrence seulement)
    old = "Sous la crasse accumulée des siècles et la mousse verdâtre rongeant la pierre telle lèpre spirituelle rongeant l'essence même de la pierre, la vampire ressentait plus qu'la vampire ne voyait les silhouettes effacées"
    new = "Sous la crasse accumulée des siècles et la mousse verdâtre rongeant la pierre telle lèpre spirituelle rongeant l'essence même de la pierre, la vampire ressentait plus qu'elle ne voyait les silhouettes effacées"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections.append(("ligne ~1949", "qu'la vampire ne voyait", "qu'elle ne voyait"))

    # Ligne ~1991: ERREUR CONTEXTUELLE - Morwen EST la vampire, devrait être saatha
    old = "*◈ J'ai vu cesss fresque avant. Il y a longtempsss, avant que vous ne me trouviez dans ces ruinesss oubliéesss.*\n\nMorwen se tourna vers la vampire, surprise visible sur ses traits pâles."
    new = "*◈ J'ai vu cesss fresque avant. Il y a longtempsss, avant que vous ne me trouviez dans ces ruinesss oubliéesss.*\n\nMorwen se tourna vers saatha, surprise visible sur ses traits pâles."
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections.append(("ligne ~1991", "vers la vampire", "vers saatha (correction erreur)"))

    # Ligne ~2021: répétition proche
    old = "*◈ Vousss le cherchez depuisss ssi longtempsss. Un artefact de résssurrection, capable de ramener lesss morts. Maisss qu'essst-ce qu'une telle puisssance ferait à ceuxss qui la possssèdent ? Qu'essst-ce qu'elle exigerait telle prix ?*\n\nLa vampire se tourna vers Morwen, et même à travers les lunettes noires, la vampire sentit le poids de ce regard millénaire."
    new = "*◈ Vousss le cherchez depuisss ssi longtempsss. Un artefact de résssurrection, capable de ramener lesss morts. Maisss qu'essst-ce qu'une telle puisssance ferait à ceuxss qui la possssèdent ? Qu'essst-ce qu'elle exigerait telle prix ?*\n\nsaatha se tourna vers Morwen, et même à travers les lunettes noires, elle sentit le poids de ce regard millénaire posé sur elle."
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections.append(("ligne ~2021", "La vampire... la vampire sentit", "saatha... elle sentit"))

    # Ligne ~2081: expression "la vampire-même" mais contexte permet simplification
    old = "Des jardins suspendus défiant la gravité la vampire-même avec une insolence sublime."
    new = "Des jardins suspendus défiant la gravité elle-même avec une insolence sublime."
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections.append(("ligne ~2081", "la gravité la vampire-même", "la gravité elle-même"))

    # Ligne ~2221: narration simple
    old = "Morwen s'arrêta devant une inscription s'étant préservée de manière remarquablement, protégée par un renfoncement naturel en le mur l'ayant abritée des pires ravages du temps. la vampire caressa les caractères gravés"
    new = "Morwen s'arrêta devant une inscription s'étant préservée de manière remarquable, protégée par un renfoncement naturel dans le mur l'ayant abritée des pires ravages du temps. Elle caressa les caractères gravés"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections.append(("ligne ~2221", "la vampire caressa", "Elle caressa"))

    # Ligne ~2387: dialogue, répétition mécanique
    old = "◆ Vous, maîtresse.\n\n*❖ Moi, confirma-t-la vampire en se relevant.*"
    new = "◆ Vous, maîtresse.\n\n*❖ Moi, confirma-t-elle en se relevant.*"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections.append(("ligne ~2387", "confirma-t-la vampire", "confirma-t-elle"))

    # Ligne ~2501: dialogue, répétition mécanique
    old = "*❖ Quatre-vingt-sept nuits d'espoir brisé tel verre sous le marteau du destin, quatre-vingt-sept aurores de désespoir renouvelé, je peux supporter, continua-t-la vampire avec un calme glacial"
    new = "*❖ Quatre-vingt-sept nuits d'espoir brisé tel verre sous le marteau du destin, quatre-vingt-sept aurores de désespoir renouvelé, je peux supporter, continua-t-elle avec un calme glacial"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections.append(("ligne ~2501", "continua-t-la vampire", "continua-t-elle"))

    # Ligne ~2563: narration simple
    old = "La horde recula telle vague qui se retire après avoir léché le rivage, se fondant à nouveau dans l'obscurité d'où la vampire était venue"
    new = "La horde recula telle vague qui se retire après avoir léché le rivage, se fondant à nouveau dans l'obscurité d'où elle était venue"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections.append(("ligne ~2563", "d'où la vampire était", "d'où elle était"))

    # Ligne ~2671: narration simple
    old = "Comment pourrait-elle ? La liberté était un concept abstrait pour ceux qui naissaient dedans, la respirant tel air sans même la remarquer. Pour la vampire, la normalité avait toujours été les chaînes."
    new = "Comment pourrait-elle ? La liberté était un concept abstrait pour ceux qui naissaient dedans, la respirant tel air sans même la remarquer. Pour elle, la normalité avait toujours été les chaînes."
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections.append(("ligne ~2671", "Pour la vampire", "Pour elle"))

    # Ligne ~2683: première occurrence devient "cette créature obsédée", deuxième devient "elle"
    old = "C'était la première fois en un millénaire complet et écrasant qu'elle osait penser cela avec une telle clarté. Mille années interminables de servitude absolue depuis qu'elle avait été avec brutalité arrachée aux ruines effondrées de ce château oublié où la prédatrice dormait dans un sommeil sans rêves, pétrifiée par la solitude terrible et le poids écrasant de l'âge. Mille années sans fin à observer cette vampire obsédée chercher l'impossible absolu avec une détermination défiant la raison. Et maintenant, pour la première fois depuis ce jour lointain et maudit où Morwen l'avait trouvée et enchaînée, saatha sentait quelque chose d'étrange s'éveiller en la vampire - un frémissement d'espoir"
    new = "C'était la première fois en un millénaire complet et écrasant qu'elle osait penser cela avec une telle clarté. Mille années interminables de servitude absolue depuis qu'elle avait été avec brutalité arrachée aux ruines effondrées de ce château oublié où elle dormait dans un sommeil sans rêves, pétrifiée par la solitude terrible et le poids écrasant de l'âge. Mille années sans fin à observer cette créature obsédée chercher l'impossible absolu avec une détermination défiant la raison. Et maintenant, pour la première fois depuis ce jour lointain et maudit où Morwen l'avait trouvée et enchaînée, saatha sentait quelque chose d'étrange s'éveiller en elle - un frémissement d'espoir"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections.append(("ligne ~2683", "la prédatrice... cette vampire... en la vampire", "elle... cette créature... en elle"))

    # Ligne ~2831: pensée intérieure
    old = "*Les Éthériens avaient échoué*, pensa-t-la vampire en inspectant chaque détail."
    new = "*Les Éthériens avaient échoué*, pensa-t-elle en inspectant chaque détail."
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections.append(("ligne ~2831", "pensa-t-la vampire", "pensa-t-elle"))

    # ===== CORRECTIONS SUPPLÉMENTAIRES "la vampire" dans des contextes variés =====

    # Rechercher les autres occurrences restantes et les remplacer contextuellement
    # Note: Les expressions "X-même" sont CONSERVÉES car idiomatiques

    # Sauvegarder le fichier modifié
    with open(fichier_path, 'w', encoding='utf-8') as f:
        f.write(contenu)

    # Statistiques
    nb_corrections = len(corrections)
    longueur_avant = len(contenu_original)
    longueur_apres = len(contenu)

    print("=" * 80)
    print("RAPPORT DE CORRECTION ÉDITORIALE")
    print("=" * 80)
    print(f"\nFichier: {fichier_path}")
    print(f"Corrections effectuées: {nb_corrections}")
    print(f"\nLongueur avant: {longueur_avant:,} caractères")
    print(f"Longueur après: {longueur_apres:,} caractères")
    print(f"Différence: {longueur_apres - longueur_avant:+,} caractères")

    if longueur_apres >= longueur_avant:
        print("✓ RÈGLE RESPECTÉE: Texte préservé ou augmenté")
    else:
        print("✗ ATTENTION: Texte réduit (vérification nécessaire)")

    print("\n" + "-" * 80)
    print("DÉTAIL DES CORRECTIONS:")
    print("-" * 80)

    for i, (ligne, avant, apres) in enumerate(corrections, 1):
        print(f"\n{i}. {ligne}")
        print(f"   AVANT: {avant}")
        print(f"   APRÈS: {apres}")

    print("\n" + "=" * 80)
    print("CORRECTION TERMINÉE")
    print("=" * 80)

    return nb_corrections

if __name__ == "__main__":
    fichier = Path(__file__).parent / "00_prologue.md"

    if not fichier.exists():
        print(f"ERREUR: Fichier introuvable: {fichier}")
        sys.exit(1)

    nb_corr = corriger_appellations(fichier)
    print(f"\n✓ {nb_corr} corrections appliquées avec succès!")
