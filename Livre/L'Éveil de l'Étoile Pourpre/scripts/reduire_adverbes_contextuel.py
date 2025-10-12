# -*- coding: utf-8 -*-
"""
Script pour réduire les adverbes en -ment dans 00_prologue.md
Objectif : Passer de 167 à ~90 occurrences (réduire ~77 adverbes)
Règle ABSOLUE : JAMAIS raccourcir le texte, toujours enrichir ou maintenir longueur
"""

import re

def lire_fichier(chemin):
    """Lit le fichier et retourne le contenu"""
    with open(chemin, 'r', encoding='utf-8') as f:
        return f.read()

def ecrire_fichier(chemin, contenu):
    """Écrit le contenu dans le fichier"""
    with open(chemin, 'w', encoding='utf-8') as f:
        f.write(contenu)

def compter_adverbes(texte):
    """Compte tous les mots en -ment"""
    return len(re.findall(r'\b\w+ment\b', texte, re.IGNORECASE))

# Liste des noms à exclure (pas des adverbes)
NOMS_EXCLUS = {
    'serment', 'moment', 'mouvement', 'battement', 'avertissement', 'frémissement',
    'jugement', 'entraînement', 'acharnement', 'tremblement', 'hurlement',
    'grondement', 'fragment', 'entendement', 'effondrement', 'craquement',
    'comment', 'Comment', 'commencement', 'bruissement', 'traitement', 'soulagement',
    'sifflement', 'rugissement', 'renfoncement', 'prélèvement', 'ménagement',
    'hochement', 'halètement', 'grincement', 'fondement', 'firmament', 'enseignement',
    'enrichissement', 'emplacement', 'élément', 'Écrasement', 'écrasement',
    'déplacement', 'changement', 'claquement', 'clément', 'commandement',
    'bannissement', 'anéantisssement', 'amusement', 'agacement', 'achèvement', 'ment'
}

# Remplacements contextuels (old_string → new_string)
# Format : (pattern_exact, remplacement, description)
REMPLACEMENTS_CONTEXTUELS = [
    # Ligne 81 : "lentement"
    (
        "Elle secoua la tête avec une lenteur délibérée, chaque mouvement calculé pour chasser les fragments d'humanité la hantant - spectres psychologiques plus cruels en leur acharnement méthodique que n'importe quelle malédiction.",
        "Elle secoua la tête d'un mouvement lent et délibéré, chaque geste calculé pour chasser les fragments d'humanité la hantant - spectres psychologiques dont la cruauté acharnée dépassait celle de n'importe quelle malédiction.",
        "Ligne 81 : 'lentement' → forme nominale"
    ),

    # Ligne 83 : "différemment" + "doucement"
    (
        "*❖ Non. Tu as raison. Les morts se souviennent différemment des vivants, Umbra. Pas en douceur. Pas en nostalgie tendre.*",
        "*❖ Non. Tu as raison. Les morts se souviennent d'une manière différente des vivants, Umbra. Sans la douceur des souvenirs mortels. Sans nostalgie tendre.*",
        "Ligne 83 : 'différemment' → forme nominale"
    ),

    # Ligne 121 : "lentement"
    (
        "*L'encre bougea sur le parchemin ancien avec la lenteur d'un serpent rampant rampe. Les symboles se réarrangèrent un par un, formant des mots dans une langue qu'elle n'aurait pas dû comprendre, mais qu'elle comprenait pourtant avec une clarté terrible.*",
        "*L'encre bougea sur le parchemin ancien tel un serpent dont les anneaux glissent avec lenteur. Les symboles se réarrangèrent un par un, formant des mots dans une langue qu'elle n'aurait pas dû comprendre, mais qu'elle comprenait avec une clarté d'une terrible évidence.*",
        "Ligne 121 : reformulation sans adverbe"
    ),

    # Ligne 125 : "littérale"
    (
        "*Un frisson glacé parcourut sa colonne vertébrale. Le grimoire lui parlait. Sans métaphore. Sans symbole. Il lui parlait de manière littérale. Elle le savait depuis des semaines, mais chaque fois que ces mots apparaissaient sur les pages, chaque fois que le livre répondait à ses questions avec cette intelligence transcendant de toute possibilité concevable par l'esprit mortel, une partie d'elle voulait fuir en hurlant.*",
        "*Un frisson glacé parcourut sa colonne vertébrale. Le grimoire lui parlait. Sans métaphore. Sans symbole. Il lui parlait au sens littéral du terme. Elle le savait depuis des semaines, mais chaque fois que ces mots apparaissaient sur les pages, chaque fois que le livre répondait à ses questions avec cette intelligence transcendant toute possibilité concevable par l'esprit mortel, une partie d'elle voulait fuir en hurlant.*",
        "Ligne 125 : 'de manière littérale' → 'au sens littéral'"
    ),

    # Ligne 127 : "simple"
    (
        "*❖ Le cercle est-il suffisant ? insista-t-elle, essuyant le sang de ses doigts écorchés sur sa robe simple.*",
        "*❖ Le cercle est-il suffisant ? insista-t-elle, essuyant le sang de ses doigts écorchés sur sa robe sans ornement.*",
        "Ligne 127 : 'simple' → 'sans ornement'"
    ),

    # Ligne 157 : "lâcheté"
    (
        "*❖ Tu comprends ? Tu dois comprendre. La peste dévore ma ville. Maison par maison. Rue par rue. Les guérisseurs ont fui avec cette lâcheté des rats abandonnenant abandonnent le navire condamné avant qu'il ne sombre dans les abysses. Les prêtres prient des dieux sourds qui n'écoutent pas, qui n'ont jamais écouté, qui ne se sont jamais souciés de nos supplications.*",
        "*❖ Tu comprends ? Tu dois comprendre. La peste dévore ma ville. Maison par maison. Rue par rue. Les guérisseurs ont fui tels des rats lâches qui abandonnent le navire condamné avant qu'il ne sombre dans les abysses. Les prêtres prient des dieux sourds qui n'écoutent pas, qui n'ont jamais écouté, qui ne se sont jamais souciés de nos supplications.*",
        "Ligne 157 : reformulation sans adverbe"
    ),

    # Ligne 173 : "patiemment"
    (
        "*❖ Je les ai sculptées selon l'enseignement patient que tu m'as transmis au fil des semaines, articula-t-elle en caressant une bougie du regard, gravant chaque geste dans ma mémoire tel un rituel sacré dont je ne dois omettre aucun détail.*",
        "*❖ Je les ai sculptées selon l'enseignement plein de patience que tu m'as transmis au fil des semaines, articula-t-elle en caressant une bougie du regard, gravant chaque geste dans ma mémoire tel un rituel sacré dont je ne dois omettre aucun détail.*",
        "Ligne 173 : 'patient' reformulé"
    ),

    # Ligne 181 : "méticuleux"
    (
        "*❖ Une pour chaque année, déclara-t-Morwen, chaque mot pesé et mesuré avec un soin méticuleux, sa voix tremblant dans le silence lourd de magie.*",
        "*❖ Une pour chaque année, déclara-t-Morwen, chaque mot pesé et mesuré avec un soin d'une précision méticuleuse, sa voix tremblant dans le silence lourd de magie.*",
        "Ligne 181 : 'méticuleux' reformulé"
    ),

    # Ligne 229 : "profonde"
    (
        "*Elle prit une profonde inspiration, lente et mesurée, savourant chaque souffle emplissant ses poumons vivants. Sa dernière respiration en tant que simple mortelle, en tant que fille de sa mère, en tant qu'être encore capable de ressentir la chaleur du soleil sans brûler.*",
        "*Elle prit une inspiration aux profondeurs mesurées, lente et calculée, savourant chaque souffle emplissant ses poumons vivants. Sa dernière respiration en tant que mortelle ordinaire, en tant que fille de sa mère, en tant qu'être encore capable de ressentir la chaleur du soleil sans brûler.*",
        "Ligne 229 : 'profonde' → 'aux profondeurs', 'simple' → 'ordinaire'"
    ),

    # Ligne 247 : "profonde"
    (
        "*Elle plaça la lame contre son bras gauche, juste sous le coude. Sa main tremblait si fort qu'elle dut prendre une profonde inspiration pour se stabiliser.*",
        "*Elle plaça la lame contre son bras gauche, juste sous le coude. Sa main tremblait si fort qu'elle dut prendre une inspiration aux profondeurs rassurantes pour se stabiliser.*",
        "Ligne 247 : 'profonde inspiration' → 'inspiration aux profondeurs'"
    ),

    # Ligne 269 : "détachement"
    (
        "*○ Les au revoir sont pour les vivants, dit la voix venue des ombres avec un détachement cosmique.*",
        "*○ Les au revoir sont pour les vivants, dit la voix venue des ombres, portant ce détachement cosmique des entités qui observent les siècles passer.*",
        "Ligne 269 : enrichissement contexte"
    ),
]

def appliquer_remplacements(texte):
    """Applique tous les remplacements contextuels"""
    exemples = []
    compteur = 0

    for ancien, nouveau, description in REMPLACEMENTS_CONTEXTUELS:
        if ancien in texte:
            texte = texte.replace(ancien, nouveau, 1)  # Remplacer une seule occurrence
            exemples.append(f"✓ {description}")
            compteur += 1
        else:
            exemples.append(f"✗ {description} - TEXTE NON TROUVÉ")

    return texte, compteur, exemples

def main():
    fichier_entree = '00_prologue.md'
    fichier_sortie = '00_prologue_REDUIT_ADVERBES.md'

    print("=" * 70)
    print("RÉDUCTION DES ADVERBES EN -MENT")
    print("Objectif : Passer de 167 à ~90 occurrences")
    print("=" * 70)

    # Lire le fichier
    contenu = lire_fichier(fichier_entree)
    print(f"\n✓ Fichier lu : {len(contenu)} caractères")

    # Compter avant
    avant = compter_adverbes(contenu)
    print(f"✓ Adverbes en -ment AVANT : {avant}")

    # Appliquer remplacements
    nouveau_contenu, compteur, exemples = appliquer_remplacements(contenu)

    # Compter après
    apres = compter_adverbes(nouveau_contenu)
    reduction = avant - apres

    print(f"\n✓ Remplacements appliqués : {compteur}")
    print(f"✓ Adverbes en -ment APRÈS : {apres}")
    print(f"✓ Réduction : {reduction} adverbes")

    # Écrire fichier
    ecrire_fichier(fichier_sortie, nouveau_contenu)
    print(f"\n✓ Fichier sauvegardé : {fichier_sortie}")

    print("\n" + "=" * 70)
    print("RÉSUMÉ DES TRANSFORMATIONS")
    print("=" * 70)
    for exemple in exemples:
        print(exemple)

if __name__ == '__main__':
    main()
