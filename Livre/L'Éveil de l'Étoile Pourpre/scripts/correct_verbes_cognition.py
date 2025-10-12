#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de correction des verbes de cognition pour public QI 120+
Élimine les verbes explicatifs infantilisant le lecteur intelligent
"""

import re
from pathlib import Path

# Fichier à corriger
FICHIER = Path("00_prologue.md")

# Corrections à appliquer (old_pattern, new_text, description)
CORRECTIONS = [
    # Ligne 271 - Reformulation "comprendre" redondant
    (
        r"Les morts n'en ont pas besoin\. N'en veulent pas\. N'en comprennent plus le sens\.",
        "Les morts n'en ont pas besoin. N'en veulent pas. N'ont plus de sens pour eux.",
        "Ligne 271: Supprimer verbe cognition redondant 'comprennent'"
    ),

    # Ligne 643 - Remplacer "comprenait" par "connaissait"
    (
        r"même si son corps comprenait déjà la vérité",
        "même si son corps connaissait déjà la vérité",
        "Ligne 643: Remplacer 'comprenait' par 'connaissait'"
    ),

    # Ligne 883 - Reformulation complète pour éliminer "comprenant"
    (
        r"comprenant enfin avec une clarté terrible ce que signifiait le rituel dans toute son horreur",
        "la vérité du rituel s'abattant sur elle avec une clarté terrible dans toute son horreur",
        "Ligne 883: Reformuler pour éliminer 'comprenant enfin'"
    ),

    # Ligne 1199 - Supprimer "ce qu'elle venait de comprendre"
    (
        r"sa voix portant le poids écrasant de ce qu'elle venait de comprendre",
        "sa voix portant le poids écrasant de la vérité",
        "Ligne 1199: Supprimer 'ce qu'elle venait de comprendre'"
    ),

    # Ligne 1489 - Reformuler "cherchant à comprendre"
    (
        r"cherchant en vérité à comprendre plutôt qu'à obéir en aveugle",
        "cherchant en vérité la connaissance plutôt que l'obéissance aveugle",
        "Ligne 1489: Reformuler 'cherchant à comprendre'"
    ),

    # Ligne 1515 - Supprimer "sans la comprendre"
    (
        r"qui miment la vie sans la comprendre",
        "qui miment la vie sans l'habiter",
        "Ligne 1515: Remplacer 'sans la comprendre' par métaphore plus forte"
    ),

    # Ligne 1571 - Supprimer "Je ne savais pas..."
    (
        r"Je ne savais pas\.\.\. je n'aurais jamais imaginé ce que l'avenir me réservait",
        "Jamais je n'aurais imaginé ce que l'avenir me réservait",
        "Ligne 1571: Supprimer 'Je ne savais pas' redondant"
    ),

    # Ligne 1643 - Reformuler "Morwen le savait"
    (
        r"Morwen n'était pas une étrangère en ces lieux maudits, Morwen le savait en chaque cellule morte de son corps transformé",
        "Morwen n'était pas une étrangère en ces lieux maudits, elle le ressentait en chaque cellule morte de son corps transformé",
        "Ligne 1643: Remplacer 'savait' par 'ressentait'"
    ),

    # Ligne 1671 - Reformuler "savait qu'elle était vaine"
    (
        r"invoquant l'ancienne bénédiction même s'il savait qu'elle était vaine",
        "invoquant l'ancienne bénédiction malgré sa vanité connue",
        "Ligne 1671: Reformuler 'savait qu'elle était vaine'"
    ),

    # Ligne 1845 - Supprimer "comprendre" redondant avec "percevoir"
    (
        r"de comprendre ce que les mortels ne peuvent même pas percevoir",
        "ce que les mortels ne perçoivent jamais",
        "Ligne 1845: Supprimer 'comprendre' redondant avec 'percevoir'"
    ),

    # Ligne 1895 - Supprimer "comprendre" redondant
    (
        r"que les mortels ne pourront jamais comprendre",
        "que les mortels n'atteindront jamais",
        "Ligne 1895: Supprimer 'comprendre' - remplacer par verbe action"
    ),

    # Ligne 2051 - Supprimer "comprendre" explicatif
    (
        r"pour expliquer ce qu'ils ne peuvent comprendre",
        "pour expliquer ce qui les dépasse",
        "Ligne 2051: Supprimer 'comprendre' - remplacer par expression plus forte"
    ),

    # Ligne 2311 - Reformuler "en réalisant"
    (
        r"répondit-elle en réalisant le geste qu'elle venait de faire",
        "répondit-elle, prenant conscience du geste qu'elle venait de faire",
        "Ligne 2311: Reformuler 'en réalisant'"
    ),

    # Ligne 2353 - Supprimer "comprendre" redondant
    (
        r"que l'humanité n'est pas prête à comprendre",
        "que l'humanité n'est pas prête à affronter",
        "Ligne 2353: Supprimer 'comprendre' - remplacer par verbe plus viscéral"
    ),

    # Ligne 2517 - CONSERVER (dialogue direct légitime)
    # "Mais comprends... c'est peut-être la dernière chance"
    # → CONSERVATION: Dialogue direct Morwen à Umbra, question légitime

    # Ligne 2523 - SUPPRIMER supplication explicative "Tu comprends ?"
    (
        r"Tu comprends \? de manière catégorique et sans exception parfait",
        "De manière catégorique et sans exception. Parfait",
        "Ligne 2523: Supprimer supplication 'Tu comprends ?'"
    ),

    # Ligne 2557 - Reformuler "ne me comprend pas"
    (
        r"qui ne me connaît pas, ne me comprend pas",
        "qui ne me connaît pas, ne me voit pas",
        "Ligne 2557: Reformuler 'ne me comprend pas'"
    ),

    # Ligne 2559 - CONSERVER "Elle ne savait pas"
    # → CONSERVATION: Pensée intérieure légitime exprimant incertitude

    # Ligne 2625 - Reformuler "quelque chose que je ne comprends pas"
    (
        r"Quelque chossse que je ne comprends passs encore",
        "Quelque chossse qui m'échappe encore",
        "Ligne 2625: Reformuler 'que je ne comprends pas'"
    ),

    # Ligne 2655 - "se rendorme" - CONSERVER (pas verbe cognition, juste verbe action)

    # Ligne 2665 - "savaient toutes les deux" - CONSERVER (connaissance mutuelle légitime)

    # Ligne 2765 - "que seuls les initiés comprenaient" - REFORMULER
    (
        r"selon une géométrie sacrée que seuls les initiés comprenaient",
        "selon une géométrie sacrée réservée aux seuls initiés",
        "Ligne 2765: Reformuler 'que seuls les initiés comprenaient'"
    ),

    # Ligne 2783 - "savait ce qu'il faisait" - REFORMULER
    (
        r"Elle avait vu ce grimoire auparavant\. la prédatrice savait ce qu'il faisait",
        "Elle avait vu ce grimoire auparavant. La prédatrice connaissait ses effets",
        "Ligne 2783: Reformuler 'savait ce qu'il faisait'"
    ),

    # Ligne 2807 - "Les Éthériens le savaient" - CONSERVER
    # → CONSERVATION: Référence historique légitime à une connaissance collective

    # Ligne 2841 - SUPPRIMER répétition triple "comprendre"
    (
        r"Ils comprendraient\. Une fois revenus, ils comprendraient pourquoi j'ai fait tout ceci\. Ils devraient comprendre\.",
        "Une fois revenus, ils verraient pourquoi j'ai fait tout ceci. Ils devraient voir.",
        "Ligne 2841: Supprimer triple répétition 'comprendre'"
    ),

    # Ligne 2999 - "ce qu'elle savait déjà" - REFORMULER
    (
        r"avait confirmé avec une cruauté implacable ce qu'elle savait déjà au cœur des profondeurs glacées de son âme morte",
        "avait confirmé avec une cruauté implacable la vérité qu'elle portait déjà au cœur des profondeurs glacées de son âme morte",
        "Ligne 2999: Reformuler 'ce qu'elle savait déjà'"
    ),

    # Ligne 3039 - "le rêve jamais réalisé" - CONSERVER (sens accompli, pas cognition)

    # Ligne 3095 - "réalisé son rêve impossible" - CONSERVER (sens accompli, pas cognition)

    # Ligne 3189 - "ne réalise ce qu'il est" - REFORMULER
    (
        r"avant que quelqu'un d'autre ne réalise ce qu'il est",
        "avant que quelqu'un d'autre ne découvre ce qu'il est",
        "Ligne 3189: Remplacer 'réalise' par 'découvre'"
    ),

    # Ligne 3197 - "Elle ne savait pas quoi. Elle ne savait pas comment." + "sans même comprendre pourquoi" - REFORMULER
    (
        r"Quelque chose devait être fait\. Elle ne savait pas quoi\. Elle ne savait pas comment\. Mais si elle ne faisait rien, ce porteur innocent de l'Étoile Pourpre serait sacrifié sans même comprendre pourquoi",
        "Quelque chose devait être fait. Quoi ? Comment ? Elle l'ignorait encore. Mais si elle ne faisait rien, ce porteur innocent de l'Étoile Pourpre serait sacrifié sans même connaître son destin",
        "Ligne 3197: Reformuler double 'Elle ne savait pas' et 'sans même comprendre'"
    ),
]

def corriger_fichier():
    """Applique toutes les corrections au fichier"""

    # Lire le fichier
    with open(FICHIER, 'r', encoding='utf-8') as f:
        contenu = f.read()

    contenu_original = contenu
    corrections_appliquees = 0

    # Appliquer chaque correction
    for pattern, remplacement, description in CORRECTIONS:
        if re.search(pattern, contenu):
            contenu = re.sub(pattern, remplacement, contenu)
            corrections_appliquees += 1
            print(f"[OK] {description}")
        else:
            print(f"[ERREUR] PATTERN NON TROUVE: {description}")

    # Écrire le fichier corrigé
    if contenu != contenu_original:
        with open(FICHIER, 'w', encoding='utf-8') as f:
            f.write(contenu)
        print(f"\n[OK] Fichier corrige avec succes")
        print(f"[OK] {corrections_appliquees} corrections appliquees sur {len(CORRECTIONS)} prevues")
    else:
        print("\n[ERREUR] Aucune modification effectuee")

    return corrections_appliquees

if __name__ == "__main__":
    print("=" * 70)
    print("CORRECTION DES VERBES DE COGNITION - L'Éveil de l'Étoile Pourpre")
    print("=" * 70)
    print()

    corrections = corriger_fichier()

    print()
    print("=" * 70)
    print(f"TERMINÉ: {corrections} corrections appliquées")
    print("=" * 70)
