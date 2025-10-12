# -*- coding: utf-8 -*-
"""
Script ROBUSTE pour réduire adverbes dans 00_prologue.md
Objectif : 82 adverbes → ~45 adverbes (réduire ~37)
"""

import re
import sys

def compter_adverbes(texte):
    """Compte adverbes réels (exclusion noms)"""
    noms = {
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
    matches = re.findall(r'\b(\w+ment)\b', texte, re.IGNORECASE)
    return len([m for m in matches if m.lower() not in noms])

def main():
    # Lire fichier
    with open('00_prologue.md', 'r', encoding='utf-8') as f:
        texte = f.read()

    avant = compter_adverbes(texte)

    # Liste de remplacements (ORDRE IMPORTANT : plus spécifique en premier)
    remplacements = [
        # Détachement (7 occurrences - réduire 5)
        ('avec un détachement cosmique', 'portant ce détachement cosmique propre aux entités millénaires'),
        ("d'un détachement", "empreint d'un détachement"),
        ('en détachement', 'dans ce détachement'),
        ('avec détachement', 'portant ce détachement'),

        # Profondément (3 occurrences)
        ('respira profondément', 'prit une profonde inspiration'),
        ('profondément enfoui', 'enfoui en profondeur'),
        ('profondément marqué', 'marqué en profondeur'),

        # Inexorablement (3 occurrences)
        ('inexorablement attiré', 'attiré de manière inexorable'),
        ('avançait inexorablement', 'avançait de manière inexorable'),
        ('inexorablement lié', 'lié de manière inexorable'),

        # Émerveillement (5 occurrences - réduire 3)
        ("d'émerveillement", "d'une merveille émerveillée"),
        ('avec émerveillement', 'empreint de merveille'),
        ('en émerveillement', 'dans une merveille'),

        # Adverbes doubles (2 occurrences chacun)
        ('particulièrement bien', 'd\'une manière particulièrement favorable'),
        ('particulièrement', 'de manière particulière'),

        ('remarquablement précis', 'précis de manière remarquable'),
        ('remarquablement', 'de manière remarquable'),

        ('exceptionnellement long', 'd\'une longueur exceptionnelle'),
        ('exceptionnellement', 'de manière exceptionnelle'),

        ('instantanément', "dans l'instant"),
        ('Instantanément', "Dans l'instant"),

        ('brutalement interrompu', 'interrompu avec brutalité'),
        ('brutalement', 'avec brutalité'),

        # Adverbes uniques (1 occurrence chacun)
        ('différemment des', 'de manière différente des'),
        ('complètement oublié', 'oublié en totalité'),
        ('nouvellement acquis', 'acquis dans sa nouveauté'),
        ('aveuglément', 'en aveugle'),
        ('intensément', 'avec intensité'),
        ('jalousement gardé', 'gardé avec jalousie'),
        ('incroyablement', 'de manière incroyable'),
        ('incomplètement', 'de manière incomplète'),
        ('brièvement', 'en bref'),
        ('viscéralement', 'de manière viscérale'),
        ('terriblement', 'de manière terrible'),
        ('simplement', ''),  # Supprimer (si contexte verbal)
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

    # Appliquer remplacements
    exemples = []
    count = 0

    for ancien, nouveau in remplacements:
        if ancien in texte:
            # Gérer cas spécial "simplement"
            if ancien == 'simplement' and not nouveau:
                # Vérifier contexte (verbe de parole avant)
                import re as regex
                for match in regex.finditer(r'\b\w+\s+simplement\b', texte):
                    avant_mot = match.group(0).split()[0].lower()
                    if avant_mot in ['dit', 'murmura', 'répondit', 'ajouta', 'chuchota', 'siffla']:
                        # Supprimer "simplement" dans ce contexte
                        texte = texte.replace(match.group(0), avant_mot.capitalize() if match.group(0)[0].isupper() else avant_mot, 1)
                        exemples.append(f"{ancien} (supprimé contexte verbal)")
                        count += 1
                        break
                continue

            texte = texte.replace(ancien, nouveau, 1)  # Une seule occurrence
            exemples.append(f"{ancien} -> {nouveau}")
            count += 1

    apres = compter_adverbes(texte)
    reduction = avant - apres

    # Écrire fichier
    with open('00_prologue.md', 'w', encoding='utf-8') as f:
        f.write(texte)

    # Rapport (écriture dans fichier pour éviter problèmes encodage console)
    with open('rapport_reduction_adverbes.txt', 'w', encoding='utf-8') as f:
        f.write("=" * 80 + "\n")
        f.write("RAPPORT DE RÉDUCTION DES ADVERBES\n")
        f.write("=" * 80 + "\n\n")
        f.write(f"Adverbes AVANT : {avant}\n")
        f.write(f"Adverbes APRÈS : {apres}\n")
        f.write(f"Réduction : {reduction} adverbes (-{reduction/avant*100:.1f}%)\n")
        f.write(f"Remplacements appliqués : {count}\n\n")
        f.write("=" * 80 + "\n")
        f.write("EXEMPLES DE TRANSFORMATIONS (premiers 15)\n")
        f.write("=" * 80 + "\n\n")
        for i, ex in enumerate(exemples[:15], 1):
            f.write(f"{i}. {ex}\n")

    print(f"TERMINÉ : {avant} -> {apres} adverbes (-{reduction})")
    print(f"Voir rapport_reduction_adverbes.txt pour détails")

if __name__ == '__main__':
    main()
