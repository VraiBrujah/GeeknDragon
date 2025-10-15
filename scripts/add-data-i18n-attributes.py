#!/usr/bin/env python3
"""
Script d'ajout automatique des attributs data-i18n dans aide-jeux.php

Parcourt le fichier et ajoute data-i18n="cle" sur tous les éléments HTML
qui contiennent <?= __('cle', 'fallback') ?>

@author Brujah
@version 1.0.0
"""

import re
import sys
from pathlib import Path

def add_data_i18n_attributes(content):
    """
    Ajoute les attributs data-i18n sur les éléments HTML contenant __()

    Utilise regex multilignes pour gérer les cas complexes où la balise
    et le __() sont sur plusieurs lignes différentes.
    """

    stats = {
        'total': 0,
        'added': 0,
        'skipped_has_attr': 0,
        'skipped_in_attribute': 0
    }

    # Pattern pour trouver: <tag ...>...<?= __('key', 'fallback') ?>...
    # Sur une ou plusieurs lignes, mais PAS dans les attributs HTML
    # Pattern: balise ouvrante + contenu + __('key') + reste jusqu'à balise fermante

    # Stratégie: Trouver tous les __('key', 'fallback') et remonter pour trouver
    # la balise ouvrante la plus proche

    # 1. Trouver toutes les occurrences de __('key', ...)
    translation_pattern = r"<\?=\s*__\(['\"]([^'\"]+)['\"]"

    def process_match(match):
        """Traite chaque occurrence de __() trouvée"""
        stats['total'] += 1
        translation_key = match.group(1)

        # Position de __() dans le contenu
        match_pos = match.start()

        # Chercher la balise ouvrante la plus proche AVANT cette position
        # Pattern: <tagname ...> avant le __()
        before_content = content[:match_pos]

        # Trouver la dernière balise ouvrante avant __()
        opening_tags = list(re.finditer(r'<(\w+)([^>]*)>', before_content))

        if not opening_tags:
            return match.group(0)  # Pas de balise trouvée, ne rien changer

        last_opening = opening_tags[-1]
        tag_name = last_opening.group(1)
        tag_attrs = last_opening.group(2)

        # Ignorer certaines balises (script, style, meta, link)
        if tag_name.lower() in ['script', 'style', 'meta', 'link', 'input']:
            stats['skipped_in_attribute'] += 1
            return match.group(0)

        # Vérifier si __() est dans un attribut HTML de cette balise
        # Si la balise se termine par = ou =" ou =' avant le __(), c'est un attribut
        tag_end_to_match = content[last_opening.end():match_pos]
        if re.search(r'(aria-label|alt|placeholder|title|value|data-[\w-]+)\s*=\s*["\']?\s*$', tag_end_to_match):
            stats['skipped_in_attribute'] += 1
            return match.group(0)

        # Vérifier si data-i18n existe déjà dans cette balise
        if 'data-i18n' in tag_attrs:
            stats['skipped_has_attr'] += 1
            return match.group(0)

        # Ajouter data-i18n à la balise ouvrante
        # On ne retourne rien ici, on va modifier directement dans le contenu global
        return None  # Signal pour modification globale

    # Comme on ne peut pas modifier le contenu pendant l'itération,
    # on va utiliser une approche différente: parcourir ligne par ligne

    lines = content.split('\n')
    modified_lines = []

    for i, line in enumerate(lines):
        # Chercher __() sur cette ligne
        translation_matches = list(re.finditer(r"__\(['\"]([^'\"]+)['\"]", line))

        if not translation_matches:
            modified_lines.append(line)
            continue

        # Pour chaque __() sur cette ligne
        for trans_match in translation_matches:
            stats['total'] += 1
            translation_key = trans_match.group(1)

            # Vérifier si c'est dans un attribut HTML
            line_before_match = line[:trans_match.start()]
            if re.search(r'(aria-label|alt|placeholder|title|value|data-[\w-]+)\s*=\s*["\'].*?$', line_before_match):
                stats['skipped_in_attribute'] += 1
                continue

            # Chercher la balise ouvrante sur cette ligne ou les lignes précédentes
            opening_tag = None
            target_line_idx = i

            # D'abord sur la ligne courante
            opening_matches = list(re.finditer(r'<(\w+)([^>]*)>', line[:trans_match.start()]))
            if opening_matches:
                opening_tag = opening_matches[-1]
            else:
                # Remonter jusqu'à 5 lignes
                for back in range(1, min(6, i + 1)):
                    prev_line = lines[i - back]
                    opening_matches = list(re.finditer(r'<(\w+)([^>]*)>', prev_line))
                    if opening_matches:
                        opening_tag = opening_matches[-1]
                        target_line_idx = i - back
                        break

            if not opening_tag:
                continue

            # Vérifier si data-i18n existe déjà
            if 'data-i18n' in opening_tag.group(2):
                stats['skipped_has_attr'] += 1
                continue

            # Construire la nouvelle balise
            tag_name = opening_tag.group(1)
            tag_attrs = opening_tag.group(2).rstrip()

            # Ignorer certaines balises
            if tag_name.lower() in ['script', 'style', 'meta', 'link']:
                stats['skipped_in_attribute'] += 1
                continue

            new_opening = f'<{tag_name}{tag_attrs} data-i18n="{translation_key}">'

            # Modifier la ligne cible
            if target_line_idx == i:
                line = line.replace(opening_tag.group(0), new_opening, 1)
            else:
                modified_lines[target_line_idx] = modified_lines[target_line_idx].replace(
                    opening_tag.group(0), new_opening, 1
                )

            stats['added'] += 1

        modified_lines.append(line)

    return '\n'.join(modified_lines), stats


def main():
    """Point d'entrée principal"""

    # Chemin du fichier
    file_path = Path(__file__).parent.parent / 'aide-jeux.php'

    if not file_path.exists():
        print(f"[ERROR] Fichier introuvable: {file_path}")
        sys.exit(1)

    print(f"[*] Lecture de {file_path.name}...")

    # Lire le fichier
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    print("[*] Ajout des attributs data-i18n...")

    # Traiter le contenu
    modified_content, stats = add_data_i18n_attributes(content)

    # Créer une sauvegarde
    backup_path = file_path.with_suffix('.php.backup')
    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"[BACKUP] Sauvegarde creee: {backup_path.name}")

    # Écrire le fichier modifié
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(modified_content)

    # Afficher les statistiques
    print("\n[STATS] Resultats:")
    print(f"  - Traductions trouvees: {stats['total']}")
    print(f"  - Attributs data-i18n ajoutes: {stats['added']}")
    print(f"  - Ignores (deja presents): {stats['skipped_has_attr']}")
    print(f"  - Ignores (dans attributs HTML): {stats['skipped_in_attribute']}")

    if stats['added'] > 0:
        print(f"\n[SUCCESS] {stats['added']} attributs data-i18n ajoutes avec succes!")
    else:
        print("\n[WARNING] Aucun attribut ajoute. Verifiez le fichier manuellement.")

    print(f"\n[INFO] Testez les traductions et restaurez depuis {backup_path.name} si necessaire.")


if __name__ == '__main__':
    main()
