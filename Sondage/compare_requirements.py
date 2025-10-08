#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de comparaison de requis entre deux fichiers de sondage ORIA
Compare UNIQUEMENT par description textuelle (colonne Description)
"""

import re
from difflib import SequenceMatcher

def normalize_description(text):
    """Normalise une description pour comparaison"""
    # Supprimer espaces multiples, trim, lowercase
    normalized = ' '.join(text.strip().lower().split())
    # Supprimer ponctuation finale
    normalized = normalized.rstrip('.,;:')
    return normalized

def similarity_ratio(a, b):
    """Calcule le ratio de similarité entre deux chaînes"""
    return SequenceMatcher(None, a, b).ratio()

def extract_requirements(file_path):
    """Extrait tous les requis d'un fichier de sondage"""
    requirements = []
    current_module = None
    current_section = None

    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    for line in lines:
        # Détecter les modules (## MODULE X : NOM)
        module_match = re.match(r'^##\s+MODULE\s+(\d+)\s*:\s*(.+)$', line.strip())
        if module_match:
            current_module = f"MODULE {module_match.group(1)}: {module_match.group(2).strip()}"
            continue

        # Détecter les sections (### X.Y Nom Section)
        section_match = re.match(r'^###\s+([\d.]+)\s+(.+)$', line.strip())
        if section_match:
            current_section = f"{section_match.group(1)} {section_match.group(2).strip()}"
            continue

        # Détecter les lignes de requis (commence par | et contient au moins 5 |)
        if line.strip().startswith('|') and line.count('|') >= 5:
            # Ignorer les lignes d'en-tête et de séparation
            if '---' in line or 'Requis' in line or 'Description' in line:
                continue

            # Parser la ligne de tableau
            parts = [p.strip() for p in line.split('|')]
            if len(parts) >= 3:
                req_id = parts[1]
                description = parts[2]

                # Vérifier que ce n'est pas une ligne vide ou d'en-tête
                if req_id and description and not req_id.startswith('-'):
                    # Extraire les métadonnées si disponibles
                    metadata = {
                        'req_id': req_id,
                        'description': description,
                        'normalized_desc': normalize_description(description),
                        'module': current_module,
                        'section': current_section,
                        'complexite': parts[len(parts)-4] if len(parts) >= 4 else '',
                        'estimation': parts[len(parts)-3] if len(parts) >= 3 else '',
                        'raw_line': line.strip()
                    }
                    requirements.append(metadata)

    return requirements

def find_missing_requirements(source_reqs, target_reqs, similarity_threshold=0.90):
    """Trouve les requis présents dans source mais absents de target"""
    missing = []

    # Créer un set des descriptions normalisées de target pour recherche rapide
    target_descriptions = {req['normalized_desc'] for req in target_reqs}

    for source_req in source_reqs:
        source_desc = source_req['normalized_desc']

        # Vérifier correspondance exacte
        if source_desc in target_descriptions:
            continue

        # Vérifier correspondance par similarité
        found_similar = False
        for target_req in target_reqs:
            ratio = similarity_ratio(source_desc, target_req['normalized_desc'])
            if ratio >= similarity_threshold:
                found_similar = True
                break

        if not found_similar:
            missing.append(source_req)

    return missing

def generate_report(source_file, target_file, missing_reqs):
    """Génère le rapport de comparaison"""
    print("\n" + "="*80)
    print("=== RAPPORT COMPARAISON DES REQUIS ===")
    print("="*80)
    print(f"\nFichier source (FINAL_VALIDE): {source_file}")
    print(f"Fichier cible (4_MODULES): {target_file}")
    print(f"\nTotal requis manquants trouves: {len(missing_reqs)}")
    print("="*80)

    if not missing_reqs:
        print("\nAUCUN REQUIS MANQUANT")
        print("Tous les requis de FINAL_VALIDE sont presents dans 4_MODULES")
        return

    # Regrouper par module
    by_module = {}
    for req in missing_reqs:
        module = req['module'] or 'MODULE INCONNU'
        if module not in by_module:
            by_module[module] = []
        by_module[module].append(req)

    # Afficher les requis manquants par module
    for module, reqs in sorted(by_module.items()):
        print(f"\n{'='*80}")
        print(f"MODULE: {module}")
        print(f"Requis manquants: {len(reqs)}")
        print(f"{'='*80}\n")

        for req in reqs:
            print(f"ID SOURCE: {req['req_id']}")
            print(f"SECTION: {req['section']}")
            print(f"DESCRIPTION: {req['description']}")
            print(f"COMPLEXITE: {req['complexite']}")
            print(f"ESTIMATION: {req['estimation']}")
            print("-" * 80)
            print()

def main():
    import sys
    import io

    # Forcer l'encodage UTF-8 pour stdout
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    source_file = r"E:\GitHub\GeeknDragon\Sondage\archives\SONDAGE_ORIA_MVP_FINAL_VALIDE.md"
    target_file = r"E:\GitHub\GeeknDragon\Sondage\sondages\SONDAGE_ORIA_MVP_4_MODULES.md"

    print("Extraction des requis du fichier FINAL_VALIDE...")
    source_reqs = extract_requirements(source_file)
    print(f"  -> {len(source_reqs)} requis trouves")

    print("\nExtraction des requis du fichier 4_MODULES...")
    target_reqs = extract_requirements(target_file)
    print(f"  -> {len(target_reqs)} requis trouves")

    print("\nComparaison des descriptions (seuil similarite: 90%)...")
    missing_reqs = find_missing_requirements(source_reqs, target_reqs)

    generate_report(source_file, target_file, missing_reqs)

    # Sauvegarder le rapport dans un fichier
    output_file = r"E:\GitHub\GeeknDragon\Sondage\rapport_requis_manquants.txt"
    with open(output_file, 'w', encoding='utf-8') as f:
        original_stdout = sys.stdout
        sys.stdout = f
        generate_report(source_file, target_file, missing_reqs)
        sys.stdout = original_stdout

    print(f"\n\nRapport sauvegarde dans: {output_file}")

if __name__ == "__main__":
    main()
