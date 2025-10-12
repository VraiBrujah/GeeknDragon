#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script de transformation des verbes de cognition selon stratégie "show don't tell"
"""

import re
import os

# Transformations spécifiques pour les participes passés utilisés comme adjectifs
ADJ_TRANSFORMATIONS = {
    # "oublié(e)(s)" comme adjectif
    r'\boubli(ée?s?)\b': {
        'cryptes oubliées': 'cryptes aux portes scellées depuis des siècles',
        'sanctuaire oublié': 'sanctuaire que nul n\'a foulé depuis des éons',
        'archives oubliées': 'archives ensevelies sous la poussière millénaire',
        'bibliothèques oubliées': 'bibliothèques dont les seuils n\'ont vu aucun pas depuis des siècles',
        'siècles oubliés': 'siècles perdus dans les brumes du temps',
        'grimoire d\'une ancienneté terrifiante, découvert dans une bibliothèque scellée d\'Eldoria où même les archivistes millénaires n\'osaient pénétrer sans protection rituelle, portait des runes d\'avertissement gravées dans sa couverture de peau humaine tannée depuis des siècles oubliés':
            'grimoire d\'une ancienneté terrifiante, découvert dans une bibliothèque scellée d\'Eldoria où même les archivistes millénaires n\'osaient pénétrer sans protection rituelle, portait des runes d\'avertissement gravées dans sa couverture de peau humaine tannée depuis des siècles dont nul ne prononçait plus le nom',
    },
}

# Patrons de remplacement contextuels
CONTEXTUAL_PATTERNS = [
    # "Elle savait que..." -> Description physique/sensorielle
    {
        'pattern': r'([A-Z][a-zéèêëàâäîïôöùûü]+)\s+savait\s+que\s+',
        'check': lambda match, context: True,
        'transform': lambda match, rest: f"{match.group(1)} -- ",
        'note': 'Supprimer "savait que" et convertir en description directe'
    },

    # "Elle croyait que..." -> Incertitude physique
    {
        'pattern': r'([A-Z][a-zéèêëàâäîïôöùûü]+)\s+croyait\s+que\s+',
        'transform': lambda match, rest: f"{match.group(1)} -- peut-être -- ",
        'note': 'Remplacer "croyait que" par incertitude narrative'
    },
]

def read_file(filepath):
    """Lit le fichier en UTF-8"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(filepath, content):
    """Écrit le fichier en UTF-8"""
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def transform_adjective_oublie(content):
    """
    Transforme les occurrences de 'oublié(e)(s)' utilisées comme adjectifs.
    Stratégie : Remplacer par descriptions plus concrètes.
    """
    transformations = []

    # Cryptes oubliées
    old = 'cryptes oubliées'
    new = 'cryptes aux portes scellées depuis des siècles'
    if old in content:
        content = content.replace(old, new)
        transformations.append((old, new))

    # Sanctuaire oublié
    old = 'sanctuaire oublié'
    new = 'sanctuaire que nul n\'a foulé depuis des éons'
    if old in content:
        content = content.replace(old, new)
        transformations.append((old, new))

    # Archives oubliées
    old = 'archives poussiéreuses des grandes bibliothèques oubliées'
    new = 'archives poussiéreuses des grandes bibliothèques ensevelies sous la poussière millénaire, dont les seuils n\'ont vu aucun pas depuis que les derniers archivistes ont fui ou péri'
    if old in content:
        content = content.replace(old, new)
        transformations.append((old, new))

    # Siècles oubliés (plusieurs variantes)
    old = 'siècles oubliés'
    new = 'siècles perdus dans les brumes du temps'
    count = content.count(old)
    if count > 0:
        content = content.replace(old, new)
        transformations.append((old, new, count))

    # Maîtres oubliés
    old = 'maîtres oubliés'
    new = 'maîtres dont les noms ont été effacés de toute mémoire'
    if old in content:
        content = content.replace(old, new)
        transformations.append((old, new))

    return content, transformations

def transform_verb_observer(content):
    """
    Transforme les occurrences du verbe 'observer' en descriptions sensorielles.
    """
    transformations = []

    # Pattern : "observant X" -> "X [description physique]"
    # Exemple : "observant ses doigts" -> "Ses doigts [tremblèrent/se contractèrent/etc.]"

    pattern1 = r',\s*observant\s+ses\s+doigts\s+exsangues\s+dans\s+la\s+faible\s+lumière\s+nocturne'
    if re.search(pattern1, content):
        old_match = re.search(pattern1, content).group(0)
        new_text = '. Ses doigts exsangues tremblèrent légèrement dans la faible lumière nocturne, peau translucide révélant le réseau de veines mortes'
        content = re.sub(pattern1, new_text, content)
        transformations.append(('observant ses doigts', 'Ses doigts tremblèrent'))

    return content, transformations

def transform_verb_croire(content):
    """
    Transforme les occurrences du verbe 'croire'.
    Stratégie : Éliminer quand c'est une opinion d'auteur, garder quand c'est dialogue essentiel.
    """
    transformations = []

    # "Les mortels croient que" -> "Les mortels affirment que" ou suppression pure si évident
    old = 'Les mortels croient que la magie est gratuite'
    new = 'Les mortels s\'imaginent -- quelle naïveté -- que la magie répond à la volonté comme serviteur obéissant'
    if old in content:
        content = content.replace(old, new)
        transformations.append((old, new))

    return content, transformations

def main():
    """Fonction principale"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    filepath = os.path.join(script_dir, '00_prologue.md')
    backup_path = os.path.join(script_dir, '00_prologue_backup_transform.md')

    print("="*80)
    print("TRANSFORMATION DES VERBES DE COGNITION - PROLOGUE")
    print("="*80)
    print()

    # Lire le fichier
    content = read_file(filepath)
    original_len = len(content)
    print(f"Fichier lu : {len(content)} caractères")

    # Créer une sauvegarde
    write_file(backup_path, content)
    print(f"Sauvegarde créée : {backup_path}")
    print()

    all_transformations = []

    # Appliquer les transformations
    print("Application des transformations...")
    print("-" * 80)

    # 1. Adjectifs "oublié"
    print("\n1. Transformation des adjectifs 'oublié(e)(s)'...")
    content, trans = transform_adjective_oublie(content)
    all_transformations.extend(trans)
    print(f"   -> {len(trans)} transformations effectuées")

    # 2. Verbe "observer"
    print("\n2. Transformation du verbe 'observer'...")
    content, trans = transform_verb_observer(content)
    all_transformations.extend(trans)
    print(f"   -> {len(trans)} transformations effectuées")

    # 3. Verbe "croire"
    print("\n3. Transformation du verbe 'croire'...")
    content, trans = transform_verb_croire(content)
    all_transformations.extend(trans)
    print(f"   -> {len(trans)} transformations effectuées")

    # Écrire le fichier modifié
    write_file(filepath, content)
    new_len = len(content)

    print()
    print("="*80)
    print(f"RÉSULTATS :")
    print("-" * 80)
    print(f"Taille originale : {original_len} caractères")
    print(f"Taille finale    : {new_len} caractères")
    print(f"Différence       : {new_len - original_len:+d} caractères")
    print(f"Total transformations : {len(all_transformations)}")
    print()
    print("Fichier mis à jour avec succès.")
    print("="*80)

    # Afficher quelques exemples
    if all_transformations:
        print("\nExemples de transformations :")
        for i, trans in enumerate(all_transformations[:10], 1):
            if len(trans) == 2:
                old, new = trans
                print(f"\n{i}. {old[:50]}...")
                print(f"   -> {new[:50]}...")
            elif len(trans) == 3:
                old, new, count = trans
                print(f"\n{i}. {old[:50]}... ({count}x)")
                print(f"   -> {new[:50]}...")

if __name__ == '__main__':
    main()
