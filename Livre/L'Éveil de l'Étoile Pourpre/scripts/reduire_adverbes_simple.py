# -*- coding: utf-8 -*-
"""
Script SIMPLE pour réduire les adverbes dans 00_prologue.md
État : 82 adverbes réels → Objectif : ~45 adverbes
"""

import re

# Noms à EXCLURE
NOMS = {
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

# Remplacements simples (chaînes complètes)
REMPLACEMENTS = [
    # Profondément (3 occurrences)
    ('profondément', 'avec profondeur'),
    ('Profondément', 'Avec profondeur'),

    # Inexorablement (3)
    ('inexorablement', 'de manière inexorable'),
    ('Inexorablement', 'De manière inexorable'),

    # Détachement (7 occurrences - cibler 5)
    ('avec un détachement', 'portant ce détachement'),
    ("d'un détachement", "empreint d'un détachement"),

    # Émerveillement (5 occurrences - cibler 3)
    ("d'émerveillement", "d'une merveille émerveillée"),
    ('avec émerveillement', 'empreint de merveille'),

    # Particulièrement (2)
    ('particulièrement', 'de manière particulière'),
    ('Particulièrement', 'De manière particulière'),

    # Remarquablement (2)
    ('remarquablement', 'de manière remarquable'),
    ('Remarquablement', 'De manière remarquable'),

    # Exceptionnellement (2)
    ('exceptionnellement', 'de manière exceptionnelle'),
    ('Exceptionnellement', 'De manière exceptionnelle'),

    # Instantanément (2)
    ('instantanément', "dans l'instant"),
    ('Instantanément', "Dans l'instant"),

    # Brutalement (2)
    ('brutalement', 'avec brutalité'),
    ('Brutalement', 'Avec brutalité'),

    # Adverbes uniques
    ('différemment', 'de manière différente'),
    ('complètement', 'en totalité'),
    ('nouvellement', 'dans sa nouveauté'),
    ('aveuglément', 'en aveugle'),
    ('intensément', 'avec intensité'),
    ('jalousement', 'avec jalousie'),
    ('incroyablement', 'de manière incroyable'),
    ('incomplètement', 'de manière incomplète'),
    ('brièvement', 'en bref'),
    ('viscéralement', 'de manière viscérale'),
    ('terriblement', 'de manière terrible'),
    ('paisiblement', 'en paix'),
    ('progressivement', 'de manière progressive'),
    ('probablement', 'en toute probabilité'),
    ('péniblement', 'avec peine'),
    ('mystérieusement', 'de manière mystérieuse'),
    ('miraculeusement', 'par miracle'),
    ('méticuleusement', 'avec un soin méticuleux'),
    ('méthodiquement', 'avec méthode'),
    ('mentalement', 'en esprit'),
    ('mathématiquement', 'avec une précision mathématique'),
    ('logiquement', 'par logique'),
    ('invariablement', 'de manière invariable'),
    ('intentionnellement', 'avec intention'),
    ('insidieusement', 'de manière insidieuse'),
    ('inlassablement', 'sans lassitude'),
    ('inévitablement', 'de manière inévitable'),
    ('inconsciemment', 'sans conscience'),
    ('imperceptiblement', 'de manière imperceptible'),
    ('immédiatement', "dans l'immédiat"),
    ('frénétiquement', 'en frénésie'),
    ('exclusivement', 'de manière exclusive'),
    ('éternellement', "pour l'éternité"),
    ('définitivement', 'de manière définitive'),
    ('dangereusement', 'de manière dangereuse'),
    ('cruellement', 'avec cruauté'),
    ('cliniquement', 'avec une précision clinique'),
    ('catégoriquement', 'de manière catégorique'),
    ('apparemment', 'en apparence'),
    ('absolument', 'de manière absolue'),
]

def compter_adverbes(texte):
    matches = re.findall(r'\b(\w+ment)\b', texte, re.IGNORECASE)
    return len([m for m in matches if m.lower() not in NOMS])

def main():
    # Lire
    with open('00_prologue.md', 'r', encoding='utf-8') as f:
        texte = f.read()

    avant = compter_adverbes(texte)
    print(f"Adverbes AVANT : {avant}")

    # Remplacer
    exemples = []
    count = 0
    for ancien, nouveau in REMPLACEMENTS:
        n = texte.count(ancien)
        if n > 0:
            texte = texte.replace(ancien, nouveau, 1)  # Une seule occurrence
            exemples.append(f"  - '{ancien}' → '{nouveau}'")
            count += 1
            if count >= 15:
                break

    apres = compter_adverbes(texte)
    reduction = avant - apres

    print(f"Adverbes APRÈS : {apres}")
    print(f"Réduction : {reduction} adverbes")
    print(f"\nExemples:")
    for ex in exemples[:15]:
        print(ex)

    # Écrire
    with open('00_prologue.md', 'w', encoding='utf-8') as f:
        f.write(texte)

    print(f"\n✓ Fichier sauvegardé")

if __name__ == '__main__':
    main()
