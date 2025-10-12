#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script d'analyse des adverbes en -ment dans le prologue
Filtre les noms communs pour ne garder que les vrais adverbes
"""

# Liste des noms communs à exclure (PAS des adverbes)
NOMS_A_EXCLURE = {
    'moment', 'moments',
    'fragment', 'fragments',
    'mouvement', 'mouvements',
    'serment', 'serments',
    'élément', 'éléments',
    'battement', 'battements',
    'testament',
    'firmament',
    'fondement', 'fondements',
    'jugement', 'jugements',
    'événement', 'événements',
    'tourment', 'tourments',
    'sentiment', 'sentiments',
    'châtiment',
    'ornement', 'ornements',
    'document', 'documents',
    'hurlement', 'hurlements',
    'commandement',
    'acharnement',
    'enseignement',
    'glissement',
    'commencement',
    'achèvement',
    'emplacement',
    'avertissement', 'avertissements',
    'craquement',
    'claquement',
    'apaisement',
    'raisonnement',
    'entraînement',
    'placement',
    'entendement',
    'bannissement',
    'bruissement',
    'frémissement', 'frémissements',
    'grincement',
    'déplacement',
    'grondement',
    'anéantissement',
    'anéantisssement',  # typo dans le texte
    'renfoncement',
    'amusement',
    'changement',
    'halètement',
    'fixement',
    'sifflement',
    'clignement',
    'tremblement', 'tremblements',
    'agacement',
    'soulagement',
    'hochement',
    'enterrement',
    'traitement',
    'effondrement',
    'prélèvement',
    'enrichissement',
    'détachement',
    'engourdissement',
    'rugissement',
    'ment',  # fragment de mot
    'comment',  # interrogatif, pas adverbe
    'Comment',
}

def analyser_adverbes(fichier_entree='adverbes_temp.txt'):
    """Analyse le fichier et sépare vrais adverbes des noms"""

    vrais_adverbes = []
    noms_exclus = []

    with open(fichier_entree, 'r', encoding='utf-8') as f:
        for ligne in f:
            ligne = ligne.strip()
            if ':' in ligne:
                numero_ligne, mot = ligne.split(':', 1)
                mot = mot.strip()

                if mot.lower() in NOMS_A_EXCLURE:
                    noms_exclus.append((numero_ligne, mot))
                else:
                    vrais_adverbes.append((numero_ligne, mot))

    return vrais_adverbes, noms_exclus

def categoriser_adverbes(vrais_adverbes):
    """Catégorise les adverbes par priorité d'élimination"""

    priorite_1_faibles = []  # lentement, doucement, rapidement, etc.
    priorite_2_redondants = []  # contexte fait que c'est redondant
    priorite_3_intensite = []  # très, profondément, extrêmement, etc.
    priorite_4_acceptables = []  # adverbes techniques ou sans alternative

    adverbes_faibles = {
        'lentement', 'rapidement', 'doucement', 'fortement',
        'simplement', 'vraiment', 'certainement', 'absolument',
        'facilement', 'difficilement', 'légèrement',
        'normalement', 'généralement', 'habituellement'
    }

    adverbes_intensite = {
        'profondément', 'intensément', 'extrêmement',
        'terriblement', 'incroyablement', 'véritablement',
        'complètement', 'totalement', 'entièrement',
        'parfaitement', 'exactement', 'précisément'
    }

    adverbes_temporels = {
        'immédiatement', 'instantanément', 'finalement',
        'récemment', 'éternellement'
    }

    for ligne, mot in vrais_adverbes:
        mot_lower = mot.lower()

        if mot_lower in adverbes_faibles:
            priorite_1_faibles.append((ligne, mot))
        elif mot_lower in adverbes_intensite:
            priorite_3_intensite.append((ligne, mot))
        elif mot_lower in adverbes_temporels:
            priorite_1_faibles.append((ligne, mot))  # Temporels sont aussi prioritaires
        else:
            priorite_4_acceptables.append((ligne, mot))

    return {
        'priorite_1': priorite_1_faibles,
        'priorite_2': priorite_2_redondants,  # À identifier manuellement
        'priorite_3': priorite_3_intensite,
        'priorite_4': priorite_4_acceptables
    }

def afficher_rapport(vrais_adverbes, noms_exclus, categories):
    """Affiche le rapport d'analyse"""

    print("="*80)
    print("RAPPORT D'ANALYSE DES ADVERBES EN -MENT")
    print("="*80)
    print()

    print(f"Total occurrences détectées : {len(vrais_adverbes) + len(noms_exclus)}")
    print(f"Noms exclus (non-adverbes) : {len(noms_exclus)}")
    print(f"VRAIS ADVERBES : {len(vrais_adverbes)}")
    print()

    print("-"*80)
    print("CATÉGORISATION PAR PRIORITÉ D'ÉLIMINATION")
    print("-"*80)
    print()

    print(f"PRIORITÉ 1 - Adverbes faibles/génériques : {len(categories['priorite_1'])}")
    for ligne, mot in sorted(categories['priorite_1']):
        print(f"  Ligne {ligne}: {mot}")
    print()

    print(f"PRIORITÉ 3 - Adverbes d'intensité banals : {len(categories['priorite_3'])}")
    for ligne, mot in sorted(categories['priorite_3']):
        print(f"  Ligne {ligne}: {mot}")
    print()

    print(f"PRIORITÉ 4 - Adverbes acceptables/complexes : {len(categories['priorite_4'])}")
    for ligne, mot in sorted(categories['priorite_4']):
        print(f"  Ligne {ligne}: {mot}")
    print()

    print("="*80)
    print(f"OBJECTIF : Passer de {len(vrais_adverbes)} à MOINS DE 40 adverbes")
    print(f"ÉLIMINATIONS REQUISES : AU MOINS {len(vrais_adverbes) - 39}")
    print("="*80)

if __name__ == '__main__':
    print("Analyse en cours...")
    vrais_adverbes, noms_exclus = analyser_adverbes()
    categories = categoriser_adverbes(vrais_adverbes)
    afficher_rapport(vrais_adverbes, noms_exclus, categories)

    # Sauvegarder les vrais adverbes pour référence
    with open('vrais_adverbes.txt', 'w', encoding='utf-8') as f:
        for ligne, mot in sorted(vrais_adverbes, key=lambda x: int(x[0])):
            f.write(f"{ligne}:{mot}\n")

    print("\nFichier 'vrais_adverbes.txt' créé avec la liste complète.")
