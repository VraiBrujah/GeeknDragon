#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de correction éditoriale COMPLÈTE pour réduire les appellations génériques
distanciantes dans le prologue de L'Éveil de l'Étoile Pourpre.

OBJECTIF: Passer de ~74 appellations à 40-50 (réduction de 30-45%)
"""

import re
import sys
from pathlib import Path

def corriger_toutes_appellations(fichier_path):
    """Corrige toutes les appellations génériques dans le fichier."""

    # Lire le contenu
    with open(fichier_path, 'r', encoding='utf-8') as f:
        contenu = f.read()

    contenu_original = contenu
    corrections_detaillees = []

    # ===== CORRECTIONS "l'immortelle" =====

    # Ligne ~1639: expression idiomatique "l'immortelle-même" → CONSERVER selon règles
    # mais vérifier si peut être simplifiée contextuellement
    old = "défiant la raison l'immortelle-même"
    new = "défiant la raison elle-même"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("l'immortelle", "ligne ~1639", old, new))

    # Ligne ~1685: expression "l'immortelle-même" dans contexte complexe
    old = "imprégné la pierre l'immortelle-même sur ses profondeurs moléculaires"
    new = "imprégné la pierre elle-même jusqu'en ses profondeurs moléculaires"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("l'immortelle", "ligne ~1685", "l'immortelle-même", "elle-même"))

    # Ligne ~1719: narration simple
    old = "dangereux dont l'immortelle connaît chaque piège"
    new = "dangereux dont elle connaît chaque piège"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("l'immortelle", "ligne ~1719", "dont l'immortelle", "dont elle"))

    # Ligne ~1721: narration simple
    old = "plus l'obscurité se refermait sur l'immortelle, dense et presque tangible"
    new = "plus l'obscurité se refermait sur elle, dense et presque tangible"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("l'immortelle", "ligne ~1721", "sur l'immortelle", "sur elle"))

    # Ligne ~1769: narration simple "L'immortelle sourit"
    old = "L'immortelle sourit, dévoilant ses crocs.\n\n*❖ Mais j'ai attendu mille ans"
    new = "Elle sourit, dévoilant ses crocs.\n\n*❖ Mais j'ai attendu mille ans"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("l'immortelle", "ligne ~1769", "L'immortelle sourit", "Elle sourit"))

    # Ligne ~1897: narration descriptive
    old = "tendu autour d'l'immortelle telle toile d'araignée"
    new = "tendu autour d'elle telle toile d'araignée"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("l'immortelle", "ligne ~1897", "d'l'immortelle", "d'elle"))

    # Ligne ~1919: dialogue simple
    old = "❖ Supérieur ?, répéta-t-l'immortelle avec un rire amer."
    new = "❖ Supérieur ?, répéta-t-elle avec un rire amer."
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("l'immortelle", "ligne ~1919", "répéta-t-l'immortelle", "répéta-t-elle"))

    # Ligne ~2077: "même pour l'immortelle qui avait transcendé"
    old = "même pour l'immortelle qui avait transcendé la mortalité"
    new = "même pour elle qui avait transcendé la mortalité"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("l'immortelle", "ligne ~2077", "pour l'immortelle", "pour elle"))

    # Ligne ~1699: "L\'immortelle rouvrit" (avec échappement)
    old = "L\\'immortelle rouvrit les yeux et continua sa progression"
    new = "Elle rouvrit les yeux et continua sa progression"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("l'immortelle", "ligne ~1699", "L'immortelle rouvrit", "Elle rouvrit"))

    # Ligne ~2563: "emportant avec l'immortelle le peu de chaleur"
    old = "se fondant à nouveau dans l'obscurité d'où elle était venue, emportant avec l'immortelle le peu de chaleur"
    new = "se fondant à nouveau dans l'obscurité d'où elle était venue, emportant avec elle le peu de chaleur"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("l'immortelle", "ligne ~2563", "avec l'immortelle", "avec elle"))

    # ===== CORRECTIONS "la prédatrice" =====

    # Ligne ~93: valeur stylistique, première mention section → CONSERVER
    # Ligne ~1597: "siffla-t-la prédatrice" - dialogue simple
    old = "*❖ Des protections dérisoires, siffla-t-la prédatrice, sa voix gelée"
    new = "*❖ Des protections dérisoires, siffla-t-elle, sa voix gelée"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("la prédatrice", "ligne ~1597", "siffla-t-la prédatrice", "siffla-t-elle"))

    # Ligne ~1797: "La prédatrice examina la plaie"
    old = "❖ Une égratignure. La prédatrice examina la plaie à sa paume"
    new = "❖ Une égratignure. Elle examina la plaie à sa paume"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("la prédatrice", "ligne ~1797", "La prédatrice examina", "Elle examina"))

    # Ligne ~1871: "La prédatrice tendit une main pâle" + répétition proche
    old = "*❖ Dans ce vide apparent, dans ce néant creux que perçoivent les mortels avec leurs sens limités et émoussés, il y a une symphonie entière, complexe et riche, qui se joue à chaque instant de l'éternité sans fin.*\n\nLa prédatrice tendit une main pâle, doigts écartés, tel si la prédatrice pouvait toucher"
    new = "*❖ Dans ce vide apparent, dans ce néant creux que perçoivent les mortels avec leurs sens limités et émoussés, il y a une symphonie entière, complexe et riche, qui se joue à chaque instant de l'éternité sans fin.*\n\nElle tendit une main pâle, doigts écartés, comme si elle pouvait toucher"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("la prédatrice", "ligne ~1871", "La prédatrice... la prédatrice", "Elle... elle"))

    # Ligne ~1921: expression "la prédatrice-même"
    old = "consumera peut-être l'éternité la prédatrice-même"
    new = "consumera peut-être mon éternité elle-même"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("la prédatrice", "ligne ~1921", "l'éternité la prédatrice-même", "mon éternité elle-même"))

    # Ligne ~2683 déjà traitée dans script précédent (la prédatrice → elle)

    # ===== CORRECTIONS "l'ancienne" =====

    # Ligne ~1645: "presque à l'ancienne-même" - expression idiomatique ambiguë
    old = "sur la pierre ancestrale, presque à l'ancienne-même, sa voix portant"
    new = "sur la pierre ancestrale, ressentant presque une connexion physique à travers les âges, sa voix portant"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("l'ancienne", "ligne ~1645", "presque à l'ancienne-même", "expansion descriptive"))

    # Ligne ~1685: "qu'l'ancienne avait marqué"
    old = "résidus d'une magie si puissante qu'l'ancienne avait marqué la matière"
    new = "résidus d'une magie si puissante qu'elle avait marqué la matière"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("l'ancienne", "ligne ~1685", "qu'l'ancienne", "qu'elle"))

    # Ligne ~1923: "l'ancienne rouvrit les yeux"
    old = "l'ancienne rouvrit les yeux, les fixant sur l'obscurité devant eux"
    new = "Elle rouvrit les yeux, les fixant sur l'obscurité devant eux"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("l'ancienne", "ligne ~1923", "l'ancienne rouvrit", "Elle rouvrit"))

    # Ligne ~1929: "acheva-t-l'ancienne"
    old = "❖ Résonnent pour moi telles cloches funèbres appelant les prédateurs au festin sanglant, acheva-t-l'ancienne."
    new = "❖ Résonnent pour moi telles cloches funèbres appelant les prédateurs au festin sanglant, acheva-t-elle."
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("l'ancienne", "ligne ~1929", "acheva-t-l'ancienne", "acheva-t-elle"))

    # Ligne ~2077: "l'ancienne voyait les Éthériens"
    old = "illuminés par la lueur violette des cristaux d'Éther corrompu, l'ancienne voyait les Éthériens"
    new = "illuminés par la lueur violette des cristaux d'Éther corrompu, elle voyait les Éthériens"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("l'ancienne", "ligne ~2077", "l'ancienne voyait", "elle voyait"))

    # ===== CORRECTIONS "la créature" =====

    # Ligne ~1579: narration simple "la créature fit un pas"
    old = "*❖ Mais il ne le restera pas. Je vais le ramener. Peu importe combien de siècles cela prendra.*\n\n*la créature fit un pas vers le sanctuaire.*"
    new = "*❖ Mais il ne le restera pas. Je vais le ramener. Peu importe combien de siècles cela prendra.*\n\n*Elle fit un pas vers le sanctuaire.*"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("la créature", "ligne ~1579", "la créature fit", "Elle fit"))

    # Ligne ~1963: "La créature millénaire s'approcha"
    old = "*❖ Leurs doigts, figés par la sculpture mais encore vibrants d'un pouvoir résiduel que je peux sentir même après mille ans. Ils modelaient la chair vivante, tordaient la magie brute, déformaient la réalité elle-même avec une facilité qui rendrait fous les mages d'aujourd'hui.*\n\nLa créature millénaire s'approcha plus près"
    new = "*❖ Leurs doigts, figés par la sculpture mais encore vibrants d'un pouvoir résiduel que je peux sentir même après mille ans. Ils modelaient la chair vivante, tordaient la magie brute, déformaient la réalité elle-même avec une facilité qui rendrait fous les mages d'aujourd'hui.*\n\nMorwen s'approcha plus près"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("la créature", "ligne ~1963", "La créature millénaire", "Morwen"))

    # Ligne ~2389: "La créature fit le tour"
    old = "*❖ Moi, confirma-t-elle en se relevant.*\n\nLa créature fit le tour de la salle"
    new = "*❖ Moi, confirma-t-elle en se relevant.*\n\nElle fit le tour de la salle"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("la créature", "ligne ~2389", "La créature fit", "Elle fit"))

    # Ligne ~2669: "Le premier collier... malgré la créature"
    old = "*Le premier collier passé autour de mon cou d'enfant*, se souvint-elle malgré la créature."
    new = "*Le premier collier passé autour de mon cou d'enfant*, se souvint-elle malgré elle."
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("la créature", "ligne ~2669", "malgré la créature", "malgré elle"))

    # Ligne ~2671: "Pour la vampire, la normalité" déjà traité
    # Ligne ~2673: "se l'était répété... l'immortelle était devenue"
    old = "*On ne manque pas ce qu'on n'a jamais connu*, se disait-elle à l'instar de ce qu'l'immortelle était devenue se l'était répété pendant des millénaires."
    new = "*On ne manque pas ce qu'on n'a jamais connu*, se disait-elle, se répétant cette litanie depuis des millénaires."
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("la créature/l'immortelle", "ligne ~2673", "phrase complexe", "simplification"))

    # Lignes diverses avec "la morte-vivante", "l'être", etc.
    old = "◆ Vous êtes blessée, maîtresse, observa Umbra, se condensant près d'l'être."
    new = "◆ Vous êtes blessée, maîtresse, observa Umbra, se condensant près d'elle."
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("l'être", "ligne ~1795", "près d'l'être", "près d'elle"))

    old = "Plus l'être progressait vers le cœur du sanctuaire"
    new = "Plus elle progressait vers le cœur du sanctuaire"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("l'être", "ligne ~1721", "l'être progressait", "elle progressait"))

    old = "autour d'l'être, chaque vibration"
    new = "autour d'elle, chaque vibration"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("l'être", "ligne ~1861", "autour d'l'être", "autour d'elle"))

    old = "L'architecture la morte-vivante-même est conçue"
    new = "L'architecture elle-même est conçue"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("la morte-vivante", "ligne ~1901", "la morte-vivante-même", "elle-même"))

    old = "La morte-vivante n'avait plus besoin d'un cœur battant"
    new = "Elle n'avait plus besoin d'un cœur battant"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("la morte-vivante", "ligne ~1861", "La morte-vivante n'avait", "Elle n'avait"))

    old = "La morte-vivante n'était pas une étrangère en ces lieux"
    new = "Morwen n'était pas une étrangère en ces lieux"
    if old in contenu:
        contenu = contenu.replace(old, new)
        corrections_detaillees.append(("la morte-vivante", "ligne ~1643", "La morte-vivante", "Morwen"))

    # Sauvegarder
    with open(fichier_path, 'w', encoding='utf-8') as f:
        f.write(contenu)

    # Statistiques
    nb_corrections = len(corrections_detaillees)
    longueur_avant = len(contenu_original)
    longueur_apres = len(contenu)

    print("=" * 80)
    print("RAPPORT DE CORRECTION EDITORIALE COMPLETE")
    print("=" * 80)
    print(f"\nFichier: {fichier_path}")
    print(f"Corrections effectuees: {nb_corrections}")
    print(f"\nLongueur avant: {longueur_avant:,} caracteres")
    print(f"Longueur apres: {longueur_apres:,} caracteres")
    print(f"Difference: {longueur_apres - longueur_avant:+,} caracteres")

    if longueur_apres >= longueur_avant * 0.99:  # tolérance 1%
        print("OK: Texte preserve (tolerance 1%)")
    else:
        reduction_pct = ((longueur_avant - longueur_apres) / longueur_avant) * 100
        print(f"ATTENTION: Reduction de {reduction_pct:.2f}%")

    print("\n" + "-" * 80)
    print("DETAIL DES CORRECTIONS PAR TYPE:")
    print("-" * 80)

    # Grouper par type
    types_corrections = {}
    for type_app, ligne, avant, apres in corrections_detaillees:
        if type_app not in types_corrections:
            types_corrections[type_app] = []
        types_corrections[type_app].append((ligne, avant, apres))

    for type_app in sorted(types_corrections.keys()):
        correcs = types_corrections[type_app]
        print(f"\n{type_app.upper()} ({len(correcs)} corrections):")
        for i, (ligne, avant, apres) in enumerate(correcs, 1):
            print(f"  {i}. {ligne}")
            if len(avant) < 80:
                print(f"     AVANT: {avant}")
                print(f"     APRES: {apres}")
            else:
                print(f"     AVANT: {avant[:77]}...")
                print(f"     APRES: {apres[:77]}...")

    print("\n" + "=" * 80)

    return nb_corrections

if __name__ == "__main__":
    fichier = Path(__file__).parent / "00_prologue.md"

    if not fichier.exists():
        print(f"ERREUR: Fichier introuvable: {fichier}")
        sys.exit(1)

    nb_corr = corriger_toutes_appellations(fichier)
    print(f"\n{nb_corr} corrections appliquees!")
