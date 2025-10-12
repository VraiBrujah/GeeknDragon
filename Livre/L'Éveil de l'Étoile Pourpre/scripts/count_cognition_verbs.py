#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re
from collections import defaultdict

# Définition des verbes de cognition et leurs formes conjuguées
COGNITION_VERBS = {
    'savoir': r'\b(savait|savais|savaient|savoir|savons|savez|sache|saches|sachent|sachons|sachez|su|sus|sut|surent|sachant)\b',
    'réaliser': r'\b(réalisait|réalisa|réalisaient|réalisais|réalisant|réaliser|réalise|réalises|réalisons|réalisez|réalisent)\b',
    'imaginer': r'\b(imaginait|imagina|imaginaient|imaginais|imaginant|imaginer|imagine|imagines|imaginons|imaginez|imaginent)\b',
    'penser': r'\b(pensait|pensa|pensaient|pensais|pensant|penser|pense|penses|pensons|pensez|pensent|pensée|pensées)\b',
    'comprendre': r'\b(comprenait|comprend|comprends|comprenaient|comprenais|comprenant|comprendre|comprennent|comprenons|comprenez|compris|comprise|comprises)\b',
    'reconnaître': r'\b(reconnaissait|reconnut|reconnaissaient|reconnaissais|reconnaissant|reconnaître|reconnaît|reconnais|reconnaissons|reconnaissez|reconnaissent|reconnu|reconnue|reconnus|reconnues)\b',
    'deviner': r'\b(devinait|devina|devinaient|devinais|devinant|deviner|devine|devines|devinons|devinez|devinent)\b',
    'sentir': r'\b(sentait|senti|sentis|sentit|sentaient|sentais|sentant|sentir|sens|sent|sentons|sentez|sentent|sentie|senties)\b',
    'croire': r'\b(croyait|crut|croyaient|croyais|croyant|croire|croit|crois|croyons|croyez|croient|cru|crue|crus|crues)\b',
    'observer': r'\b(observait|observa|observaient|observais|observant|observer|observe|observes|observons|observez|observent|observé|observée|observés|observées)\b',
    'remarquer': r'\b(remarquait|remarqua|remarquaient|remarquais|remarquant|remarquer|remarque|remarques|remarquons|remarquez|remarquent|remarqué|remarquée|remarqués|remarquées)\b',
    'noter': r'\b(notait|nota|notaient|notais|notant|noter|note|notes|notons|notez|notent|noté|notée|notés|notées)\b',
    'percevoir': r'\b(percevait|perçut|percevaient|percevais|percevant|percevoir|perçoit|perçois|percevons|percevez|perçoivent|perçu|perçue|perçus|perçues)\b',
    'constater': r'\b(constatait|constata|constataient|constatais|constatant|constater|constate|constates|constatons|constatez|constatent|constaté|constatée|constatés|constatées)\b',
    'découvrir': r'\b(découvrait|découvrit|découvraient|découvrais|découvrant|découvrir|découvre|découvres|découvrons|découvrez|découvrent|découvert|découverte|découverts|découvertes)\b',
    'apprendre': r'\b(apprenait|apprit|apprenaient|apprenais|apprenant|apprendre|apprend|apprends|apprenons|apprenez|apprennent|appris|apprise|apprises)\b',
    'se_souvenir': r'\b(souvenait|souvint|souvenaient|souvenais|souvenant|souvenir|souviens|souvient|souvenons|souvenez|souviennent|souvenu|souvenue|souvenus|souvenues)\b',
    'se_rappeler': r'\b(rappelait|rappela|rappelaient|rappelais|rappelant|rappeler|rappelle|rappelles|rappelons|rappelez|rappellent|rappelé|rappelée|rappelés|rappelées)\b',
    'oublier': r'\b(oubliait|oublia|oubliaient|oubliais|oubliant|oublier|oublie|oublies|oublions|oubliez|oublient|oublié|oubliée|oubliés|oubliées)\b',
    'espérer': r'\b(espérait|espéra|espéraient|espérais|espérant|espérer|espère|espères|espérons|espérez|espèrent|espéré|espérée|espérés|espérées)\b',
    'craindre': r'\b(craignait|craignit|craignaient|craignais|craignant|craindre|craint|crains|craignons|craignez|craignent|craintiez)\b',
    'ressentir': r'\b(ressentait|ressentit|ressentaient|ressentais|ressentant|ressentir|ressens|ressent|ressentons|ressentez|ressentent|ressenti|ressentie|ressentis|ressenties)\b',
}

def count_cognition_verbs(filepath):
    """Compte les occurrences de chaque verbe de cognition dans le fichier."""

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    counts = defaultdict(list)
    total = 0

    for verb, pattern in COGNITION_VERBS.items():
        matches = re.finditer(pattern, content, re.IGNORECASE)
        for match in matches:
            line_num = content[:match.start()].count('\n') + 1
            matched_text = match.group()
            counts[verb].append((line_num, matched_text))
            total += 1

    return counts, total

def main():
    import os
    # Utiliser le chemin du script pour trouver le fichier
    script_dir = os.path.dirname(os.path.abspath(__file__))
    filepath = os.path.join(script_dir, '00_prologue.md')

    counts, total = count_cognition_verbs(filepath)

    print("="*80)
    print("DÉCOMPTE DES VERBES DE COGNITION - PROLOGUE")
    print("="*80)
    print()

    for verb in sorted(counts.keys(), key=lambda v: len(counts[v]), reverse=True):
        occurrences = counts[verb]
        print(f"\n{verb.upper()} : {len(occurrences)} occurrences")
        print("-" * 40)
        for line_num, matched_text in occurrences[:5]:  # Affiche les 5 premières
            print(f"  Ligne {line_num}: {matched_text}")
        if len(occurrences) > 5:
            print(f"  ... et {len(occurrences) - 5} autres occurrences")

    print()
    print("="*80)
    print(f"TOTAL : {total} occurrences de verbes de cognition")
    print("="*80)

    # Détail par catégorie
    print("\n\nRÉSUMÉ PAR CATÉGORIE (triés par fréquence) :")
    print("-" * 60)
    sorted_verbs = sorted(counts.items(), key=lambda x: len(x[1]), reverse=True)
    for verb, occurrences in sorted_verbs:
        print(f"{verb:20s} : {len(occurrences):3d} occurrences")

    # Verbes non trouvés
    missing = [v for v in COGNITION_VERBS.keys() if v not in counts or len(counts[v]) == 0]
    if missing:
        print("\n\nVerbes non trouvés : " + ", ".join(missing))

    return total

if __name__ == '__main__':
    total = main()
