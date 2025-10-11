# -*- coding: utf-8 -*-
"""
ORCHESTRATEUR - Corrections finales du prologue
Exécute séquentiellement les 3 corrections automatiques + validation

CORRECTIONS:
1. "comme" : 157 → 150 (7 corrections)
2. Adverbes -ment : 242 → 145 (97 corrections)
3. "mille ans" : 50 → 30 (20 corrections)
4. Purple prose : Manuel (après automatiques)

RÈGLE ABSOLUE : Texte corrigé >= texte original
"""

import sys
import os
import re
from collections import Counter

# Ajouter le répertoire scripts au path
script_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, script_dir)

def load_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def save_file(filepath, content):
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def count_words(text):
    return len(text.split())

def count_pattern(text, pattern):
    return len(re.findall(pattern, text, re.IGNORECASE))

def create_backup(filepath):
    """Créer backup avant modifications"""
    import shutil
    from datetime import datetime

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = filepath.replace('.md', f'_BACKUP_{timestamp}.md')

    shutil.copy2(filepath, backup_path)
    print(f"✅ Backup créé : {backup_path}\n")

    return backup_path

def validate_metrics(text, correction_name):
    """Valider métriques après chaque correction"""
    words = count_words(text)
    comme = count_pattern(text, r'\bcomme\b')
    adverbs = count_pattern(text, r'\b\w+ment\b') - count_pattern(text, r'\b(moment|testament|élément|fragment|document|ornement|sentiment|jugement|événement|mouvement)\b')
    mille_ans = count_pattern(text, r'mille ans')

    print(f"\n{'='*60}")
    print(f"VALIDATION APRÈS {correction_name}")
    print(f"{'='*60}")
    print(f"Mots totaux    : {words:,}")
    print(f"'comme'        : {comme}")
    print(f"Adverbes -ment : {adverbs}")
    print(f"'mille ans'    : {mille_ans}")
    print(f"{'='*60}\n")

    return {
        'words': words,
        'comme': comme,
        'adverbs': adverbs,
        'mille_ans': mille_ans
    }

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    filepath = os.path.join(os.path.dirname(script_dir), '00_prologue.md')

    print("\n" + "="*70)
    print(" ORCHESTRATEUR - CORRECTIONS FINALES PROLOGUE")
    print("="*70)

    # État initial
    print("\n📊 ÉTAT INITIAL")
    text = load_file(filepath)
    initial_metrics = validate_metrics(text, "ÉTAT INITIAL")

    # Créer backup
    backup_path = create_backup(filepath)

    # CORRECTION 1 : COMME
    print("\n" + "🔧 "*20)
    print("CORRECTION 1/3 : RÉDUCTION 'COMME'")
    print("🔧 "*20)

    from correction_1_comme_smart import apply_smart_replacements
    text = apply_smart_replacements(text, target_reductions=7)
    save_file(filepath, text)

    metrics_1 = validate_metrics(text, "CORRECTION 1 (COMME)")

    # Vérifier règle longueur
    if metrics_1['words'] < initial_metrics['words']:
        print("❌ ERREUR : Règle de longueur violée !")
        print(f"   Mots réduits de {initial_metrics['words']:,} à {metrics_1['words']:,}")
        print(f"   Restauration du backup...")
        import shutil
        shutil.copy2(backup_path, filepath)
        sys.exit(1)

    # CORRECTION 2 : ADVERBES
    print("\n" + "🔧 "*20)
    print("CORRECTION 2/3 : RÉDUCTION ADVERBES -MENT")
    print("🔧 "*20)

    from correction_2_adverbes import apply_smart_adverb_replacements
    text = apply_smart_adverb_replacements(text, target_reductions=97)
    save_file(filepath, text)

    metrics_2 = validate_metrics(text, "CORRECTION 2 (ADVERBES)")

    # Vérifier règle longueur
    if metrics_2['words'] < metrics_1['words']:
        print("❌ ERREUR : Règle de longueur violée !")
        print(f"   Mots réduits de {metrics_1['words']:,} à {metrics_2['words']:,}")
        print(f"   Restauration du backup...")
        import shutil
        shutil.copy2(backup_path, filepath)
        sys.exit(1)

    # CORRECTION 3 : MILLE ANS
    print("\n" + "🔧 "*20)
    print("CORRECTION 3/3 : RÉDUCTION 'MILLE ANS'")
    print("🔧 "*20)

    from correction_3_mille_ans import apply_smart_mille_ans_replacements
    text = apply_smart_mille_ans_replacements(text, target_reductions=20)
    save_file(filepath, text)

    metrics_3 = validate_metrics(text, "CORRECTION 3 (MILLE ANS)")

    # Vérifier règle longueur
    if metrics_3['words'] < metrics_2['words']:
        print("❌ ERREUR : Règle de longueur violée !")
        print(f"   Mots réduits de {metrics_2['words']:,} à {metrics_3['words']:,}")
        print(f"   Restauration du backup...")
        import shutil
        shutil.copy2(backup_path, filepath)
        sys.exit(1)

    # RAPPORT FINAL
    print("\n" + "="*70)
    print(" RAPPORT FINAL - CORRECTIONS AUTOMATIQUES COMPLÉTÉES")
    print("="*70)

    total_words_added = metrics_3['words'] - initial_metrics['words']
    comme_reduced = initial_metrics['comme'] - metrics_3['comme']
    adverbs_reduced = initial_metrics['adverbs'] - metrics_3['adverbs']
    mille_ans_reduced = initial_metrics['mille_ans'] - metrics_3['mille_ans']

    print(f"\n📈 ÉVOLUTION DES MÉTRIQUES")
    print(f"{'─'*70}")
    print(f"{'Métrique':<20} {'Initial':>10} {'Final':>10} {'Objectif':>10} {'Statut':>15}")
    print(f"{'─'*70}")
    print(f"{'Mots totaux':<20} {initial_metrics['words']:>10,} {metrics_3['words']:>10,} {'→ +:>10} {'✅ +' + str(total_words_added):>15}")
    print(f"{'comme':<20} {initial_metrics['comme']:>10} {metrics_3['comme']:>10} {'≤ 150':>10} {('✅ ATTEINT' if metrics_3['comme'] <= 150 else '❌ NON'):>15}")
    print(f"{'Adverbes -ment':<20} {initial_metrics['adverbs']:>10} {metrics_3['adverbs']:>10} {'≤ 145':>10} {('✅ ATTEINT' if metrics_3['adverbs'] <= 145 else '❌ NON'):>15}")
    print(f"{'mille ans':<20} {initial_metrics['mille_ans']:>10} {metrics_3['mille_ans']:>10} {'≤ 30':>10} {('✅ ATTEINT' if metrics_3['mille_ans'] <= 30 else '❌ NON'):>15}")
    print(f"{'─'*70}")

    # Vérifier tous objectifs
    all_targets_met = (
        metrics_3['comme'] <= 150 and
        metrics_3['adverbs'] <= 145 and
        metrics_3['mille_ans'] <= 30 and
        metrics_3['words'] >= initial_metrics['words']
    )

    if all_targets_met:
        print(f"\n🎯 TOUS LES OBJECTIFS ATTEINTS !")
        print(f"✅ Règle de longueur respectée : +{total_words_added} mots")
        print(f"✅ 'comme' réduit de {comme_reduced} ({initial_metrics['comme']} → {metrics_3['comme']})")
        print(f"✅ Adverbes -ment réduits de {adverbs_reduced} ({initial_metrics['adverbs']} → {metrics_3['adverbs']})")
        print(f"✅ 'mille ans' réduit de {mille_ans_reduced} ({initial_metrics['mille_ans']} → {metrics_3['mille_ans']})")

        print(f"\n📝 ÉTAPE SUIVANTE : CORRECTION 4 (PURPLE PROSE)")
        print(f"   → Correction manuelle de 10-15 passages avec métaphores empilées")
        print(f"   → Objectif : Espacer métaphores SANS réduire longueur")
        print(f"   → Gain estimé : +150-250 mots")

        print(f"\n🎯 OBJECTIF FINAL PRÉVU")
        print(f"   Mots totaux : ~{metrics_3['words'] + 200:,} (après correction 4)")
        print(f"   Note estimée : 95-97/100")

    else:
        print(f"\n⚠️ CERTAINS OBJECTIFS NON ATTEINTS")

        if metrics_3['comme'] > 150:
            print(f"❌ 'comme' : {metrics_3['comme']} (objectif ≤ 150, manque {metrics_3['comme'] - 150})")

        if metrics_3['adverbs'] > 145:
            print(f"❌ Adverbes : {metrics_3['adverbs']} (objectif ≤ 145, manque {metrics_3['adverbs'] - 145})")

        if metrics_3['mille_ans'] > 30:
            print(f"❌ 'mille ans' : {metrics_3['mille_ans']} (objectif ≤ 30, manque {metrics_3['mille_ans'] - 30})")

    print(f"\n💾 Backup disponible : {backup_path}")
    print(f"✅ Fichier final sauvegardé : {filepath}")
    print(f"\n{'='*70}\n")

if __name__ == '__main__':
    main()
