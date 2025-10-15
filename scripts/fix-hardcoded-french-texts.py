#!/usr/bin/env python3
"""
Script pour corriger les textes français en dur dans aide-jeux.php
Remplace les textes directs par des appels __() avec data-i18n

@author Brujah
@version 1.0.0
"""

import re
import json
from pathlib import Path

# Mapping des textes français vers leurs traductions anglaises et clés
TEXTS_TO_FIX = [
    {
        'french': '🧮 Calcul des compétences',
        'english': '🧮 Skill Calculation',
        'key': 'gameHelp.abilityScoreRoller.skillCalc.title'
    },
    {
        'french': 'Bonus = Modificateur + Maîtrise',
        'english': 'Bonus = Modifier + Proficiency',
        'key': 'gameHelp.abilityScoreRoller.skillCalc.formula'
    },
    {
        'french': '<strong>Non maîtrisée :</strong> Modificateur seul',
        'english': '<strong>Not Proficient:</strong> Modifier only',
        'key': 'gameHelp.abilityScoreRoller.skillCalc.notProficient'
    },
    {
        'french': '<strong>Maîtrisée :</strong> Mod + Bonus',
        'english': '<strong>Proficient:</strong> Mod + Bonus',
        'key': 'gameHelp.abilityScoreRoller.skillCalc.proficient'
    },
    {
        'french': '<strong>Expertisée :</strong> Mod + (Bonus×2)',
        'english': '<strong>Expertise:</strong> Mod + (Bonus×2)',
        'key': 'gameHelp.abilityScoreRoller.skillCalc.expertise'
    },
    {
        'french': '<strong>Bonus maîtrise :</strong> Niv 1-4:+2 • 5-8:+3 • 9-12:+4 • 13-16:+5 • 17-20:+6',
        'english': '<strong>Proficiency bonus:</strong> Lvl 1-4:+2 • 5-8:+3 • 9-12:+4 • 13-16:+5 • 17-20:+6',
        'key': 'gameHelp.abilityScoreRoller.skillCalc.proficiencyBonus'
    },
    {
        'french': '💡 Exemple (Dex 16, Niv 5)',
        'english': '💡 Example (Dex 16, Lvl 5)',
        'key': 'gameHelp.abilityScoreRoller.skillCalc.exampleTitle'
    },
    {
        'french': 'Score <strong>16</strong> → Mod <strong>+3</strong> • Bonus maîtrise <strong>+3</strong>',
        'english': 'Score <strong>16</strong> → Mod <strong>+3</strong> • Proficiency bonus <strong>+3</strong>',
        'key': 'gameHelp.abilityScoreRoller.skillCalc.exampleStats'
    },
    {
        'french': '<strong>Acrobaties</strong> : +3 = <strong class="text-yellow-300">+3</strong>',
        'english': '<strong>Acrobatics</strong> : +3 = <strong class="text-yellow-300">+3</strong>',
        'key': 'gameHelp.abilityScoreRoller.skillCalc.exampleAcrobatics'
    },
    {
        'french': '<strong>Discrétion</strong> : +3+3 = <strong class="text-yellow-300">+6</strong>',
        'english': '<strong>Stealth</strong> : +3+3 = <strong class="text-yellow-300">+6</strong>',
        'key': 'gameHelp.abilityScoreRoller.skillCalc.exampleStealth'
    },
    {
        'french': '<strong>Escamotage</strong> : +3+3+3 = <strong class="text-yellow-300">+9</strong>',
        'english': '<strong>Sleight of Hand</strong> : +3+3+3 = <strong class="text-yellow-300">+9</strong>',
        'key': 'gameHelp.abilityScoreRoller.skillCalc.exampleSleight'
    },
    {
        'french': '→ Ces bonus vont sur le triptyque d\'Historique',
        'english': '→ These bonuses go on the Background triptych',
        'key': 'gameHelp.abilityScoreRoller.skillCalc.exampleNote'
    },
    {
        'french': '<strong>Important :</strong> Ajoutez +2 et +1 (bonus Historique) aux caract.',
        'english': '<strong>Important:</strong> Add +2 and +1 (Background bonuses) to abilities.',
        'key': 'gameHelp.abilityScoreRoller.skillCalc.importantNote'
    }
]

def update_aide_jeux():
    """Corrige les textes français en dur dans aide-jeux.php"""
    file_path = Path(__file__).parent.parent / 'aide-jeux.php'

    if not file_path.exists():
        print(f"[ERROR] Fichier introuvable: {file_path}")
        return False

    print(f"[*] Lecture de {file_path.name}...")
    content = file_path.read_text(encoding='utf-8')

    # Créer backup
    backup_path = file_path.with_suffix('.php.backup2')
    backup_path.write_text(content, encoding='utf-8')
    print(f"[BACKUP] Sauvegarde: {backup_path.name}")

    modified_count = 0

    for item in TEXTS_TO_FIX:
        french = item['french']
        key = item['key']
        english = item['english']

        # Chercher le texte français en dur
        if french in content:
            # Remplacer par <?= __('key', 'french') ?> avec data-i18n
            # On doit trouver la balise HTML qui contient ce texte

            # Pattern pour trouver la balise qui contient le texte
            # Ex: <h4 class="...">texte</h4>
            pattern = r'(<[^>]+>)(' + re.escape(french) + r')(</[^>]+>)'

            def replace_func(match):
                opening_tag = match.group(1)
                text = match.group(2)
                closing_tag = match.group(3)

                # Ajouter data-i18n dans la balise ouvrante si pas déjà présent
                if 'data-i18n' not in opening_tag:
                    # Insérer data-i18n avant le >
                    opening_tag = opening_tag[:-1] + f' data-i18n="{key}">'

                # Remplacer le texte par __()
                new_content = f'{opening_tag}<?= __(\'{key}\', \'{text}\') ?>{closing_tag}'
                return new_content

            content_new = re.sub(pattern, replace_func, content)

            if content_new != content:
                content = content_new
                modified_count += 1
                print(f"[OK] Corrigé: {key}")

    # Écrire le fichier modifié
    file_path.write_text(content, encoding='utf-8')
    print(f"\n[SUCCESS] {modified_count} textes corrigés dans {file_path.name}")

    return True

def update_translations():
    """Ajoute les traductions dans fr.json et en.json"""
    base_path = Path(__file__).parent.parent / 'lang'

    # Charger fr.json
    fr_path = base_path / 'fr.json'
    with open(fr_path, 'r', encoding='utf-8') as f:
        fr_data = json.load(f)

    # Charger en.json
    en_path = base_path / 'en.json'
    with open(en_path, 'r', encoding='utf-8') as f:
        en_data = json.load(f)

    # Ajouter les nouvelles clés
    if 'gameHelp' not in fr_data:
        fr_data['gameHelp'] = {}
    if 'abilityScoreRoller' not in fr_data['gameHelp']:
        fr_data['gameHelp']['abilityScoreRoller'] = {}
    if 'skillCalc' not in fr_data['gameHelp']['abilityScoreRoller']:
        fr_data['gameHelp']['abilityScoreRoller']['skillCalc'] = {}

    if 'gameHelp' not in en_data:
        en_data['gameHelp'] = {}
    if 'abilityScoreRoller' not in en_data['gameHelp']:
        en_data['gameHelp']['abilityScoreRoller'] = {}
    if 'skillCalc' not in en_data['gameHelp']['abilityScoreRoller']:
        en_data['gameHelp']['abilityScoreRoller']['skillCalc'] = {}

    for item in TEXTS_TO_FIX:
        key_parts = item['key'].split('.')
        final_key = key_parts[-1]  # Dernière partie de la clé

        fr_data['gameHelp']['abilityScoreRoller']['skillCalc'][final_key] = item['french']
        en_data['gameHelp']['abilityScoreRoller']['skillCalc'][final_key] = item['english']

    # Écrire les fichiers avec indentation
    with open(fr_path, 'w', encoding='utf-8') as f:
        json.dump(fr_data, f, ensure_ascii=False, indent=2)
    print(f"[OK] Mis à jour: {fr_path.name}")

    with open(en_path, 'w', encoding='utf-8') as f:
        json.dump(en_data, f, ensure_ascii=False, indent=2)
    print(f"[OK] Mis à jour: {en_path.name}")

def main():
    """Point d'entrée principal"""
    print("[34m" + "="*60 + "[0m")
    print("[34mCORRECTION TEXTES FRANCAIS EN DUR[0m")
    print("[34m" + "="*60 + "[0m\n")

    # Mise à jour des traductions d'abord
    print("[*] Etape 1/2: Mise a jour des fichiers de traduction...")
    update_translations()

    print("\n[*] Etape 2/2: Correction des textes dans aide-jeux.php...")
    success = update_aide_jeux()

    if success:
        print("\n[32m" + "="*60 + "[0m")
        print("[32mSUCCES! Toutes les corrections appliquees[0m")
        print("[32m" + "="*60 + "[0m")
        print("\n[INFO] Testez maintenant avec ?lang=en")
        print("[INFO] Tous les textes devraient etre en anglais")
    else:
        print("\n[31mERREUR lors de la correction[0m")

if __name__ == '__main__':
    main()
