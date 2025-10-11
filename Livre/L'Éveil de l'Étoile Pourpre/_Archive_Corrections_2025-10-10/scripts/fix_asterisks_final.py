#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de correction FINALE des astérisques manquants
Corrige toutes les lignes se terminant par * sans astérisque d'ouverture
"""

from pathlib import Path

def fix_all_asterisks(file_path):
    """Corrige tous les astérisques manquants dans un fichier."""
    file_path = Path(file_path)

    if not file_path.exists():
        return {"error": f"Fichier non trouvé: {file_path}"}

    # Lire le fichier
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    corrections = []

    # Traiter TOUTES les lignes
    for i, line in enumerate(lines):
        line_num = i + 1
        stripped = line.rstrip('\n\r')

        # Ignorer lignes vides, séparateurs, et lignes avec juste *
        if stripped.strip() in ['', '*', '---', '***']:
            continue

        # Vérifier si la ligne se termine par * mais ne commence pas par *
        if stripped.endswith('*') and not stripped.startswith('*'):
            # Ajouter astérisque d'ouverture
            lines[i] = '*' + line
            corrections.append({
                'line': line_num,
                'before': stripped[:80],
                'after': lines[i].rstrip()[:80]
            })

    # Écrire le fichier corrigé
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)

    # Rapport dans fichier log
    log_path = file_path.parent / f'{file_path.stem}_corrections.log'
    with open(log_path, 'w', encoding='utf-8') as log:
        log.write(f"RAPPORT DE CORRECTION: {file_path.name}\n")
        log.write("="*70 + "\n\n")
        log.write(f"Total corrections: {len(corrections)}\n\n")

        if corrections:
            log.write("Détails des corrections:\n")
            log.write("-"*70 + "\n\n")
            for corr in corrections:
                log.write(f"Ligne {corr['line']}:\n")
                log.write(f"  AVANT: {corr['before']}\n")
                log.write(f"  APRES: {corr['after']}\n")
                log.write("\n")

    return {
        'file': str(file_path),
        'corrections': len(corrections),
        'log': str(log_path)
    }

def validate_file(file_path):
    """Valide qu'il ne reste plus de problèmes."""
    file_path = Path(file_path)

    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    issues = []
    for i, line in enumerate(lines, 1):
        stripped = line.rstrip()
        if stripped.strip() not in ['', '*', '---', '***']:
            if stripped.endswith('*') and not stripped.startswith('*'):
                issues.append({'line': i, 'content': stripped[:60]})

    return {
        'file': str(file_path),
        'valid': len(issues) == 0,
        'issues': len(issues)
    }

def main():
    """Fonction principale."""
    files = [
        r"E:\GitHub\GeeknDragon\Livre\L'Éveil de l'Étoile Pourpre\00_prologue.md",
        r"E:\GitHub\GeeknDragon\Livre\L'Éveil de l'Étoile Pourpre\Livre\00_prologue_V15_SECTIONS_1-9_TRANSFORMEES.md"
    ]

    rapport_path = Path(files[0]).parent / 'RAPPORT_CORRECTIONS_ASTERISQUES.txt'

    with open(rapport_path, 'w', encoding='utf-8') as rapport:
        rapport.write("="*70 + "\n")
        rapport.write("RAPPORT FINAL DE CORRECTION DES ASTERISQUES\n")
        rapport.write("="*70 + "\n\n")

        total_corrections = 0

        for file_path in files:
            file_path = Path(file_path)
            if not file_path.exists():
                rapport.write(f"\nERREUR: Fichier non trouvé: {file_path}\n")
                continue

            rapport.write(f"\n{'='*70}\n")
            rapport.write(f"Fichier: {file_path.name}\n")
            rapport.write(f"{'='*70}\n\n")

            # Appliquer corrections
            result = fix_all_asterisks(file_path)

            if 'error' in result:
                rapport.write(f"ERREUR: {result['error']}\n")
                continue

            rapport.write(f"Corrections appliquees: {result['corrections']}\n")
            rapport.write(f"Log detaille: {Path(result['log']).name}\n\n")

            total_corrections += result['corrections']

            # Valider
            validation = validate_file(file_path)
            if validation['valid']:
                rapport.write("VALIDATION: OK - Aucun probleme restant\n")
            else:
                rapport.write(f"VALIDATION: ATTENTION - {validation['issues']} problemes restants\n")

        rapport.write(f"\n{'='*70}\n")
        rapport.write(f"TOTAL GENERAL: {total_corrections} corrections effectuees\n")
        rapport.write(f"{'='*70}\n")

    print(f"Corrections terminees!")
    print(f"Total: {total_corrections} corrections")
    print(f"Rapport: {rapport_path}")

if __name__ == '__main__':
    main()
