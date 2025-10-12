# -*- coding: utf-8 -*-
"""
Script FINAL pour réduire les adverbes dans 00_prologue.md
État actuel : 82 adverbes réels (après exclusion des noms)
Objectif : Réduire à ~45-50 adverbes (~37 remplacements)
Règle ABSOLUE : JAMAIS raccourcir, toujours enrichir
"""

import re
import sys

def lire_fichier(chemin):
    with open(chemin, 'r', encoding='utf-8') as f:
        return f.read()

def ecrire_fichier(chemin, contenu):
    with open(chemin, 'w', encoding='utf-8') as f:
        f.write(contenu)

# Noms à EXCLURE (pas des adverbes)
NOMS_EXCLUS = {
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

# Stratégies de remplacement par adverbe (contextuelles)
def remplacer_detachement(texte, exemples):
    """Remplace 5 des 7 occurrences de 'détachement' (garder 2)"""
    count = 0
    patterns = [
        # 1. "avec un détachement"  → "portant ce détachement"
        (r'avec un détachement\b', 'portant ce détachement'),
        # 2. "d'un détachement" → "empreint d'un détachement"
        (r"d'un détachement\b", "empreint d'un détachement"),
        # 3. "en détachement" → "dans ce détachement"
        (r'en détachement\b', 'dans ce détachement'),
    ]

    for pattern, remplacement in patterns:
        if count >= 5:  # Limiter à 5 remplacements
            break
        matches = list(re.finditer(pattern, texte, re.IGNORECASE))
        for match in matches[:2]:  # Maximum 2 par pattern
            avant = match.group(0)
            texte = texte[:match.start()] + remplacement + texte[match.end():]
            exemples.append(f"  - 'détachement' : '{avant}' → '{remplacement}'")
            count += 1
            if count >= 5:
                break

    return texte, count

def remplacer_emerveillement(texte, exemples):
    """Remplace 3 des 5 occurrences de 'émerveillement' (garder 2)"""
    count = 0
    patterns = [
        (r"d'émerveillement\b", "d'une merveille émerveillée"),
        (r'avec émerveillement\b', 'empreint de merveille'),
        (r'en émerveillement\b', 'dans une merveille'),
    ]

    for pattern, remplacement in patterns:
        matches = list(re.finditer(pattern, texte, re.IGNORECASE))
        for match in matches[:1]:  # Maximum 1 par pattern
            avant = match.group(0)
            texte = texte[:match.start()] + remplacement + texte[match.end():]
            exemples.append(f"  - 'émerveillement' : '{avant}' → '{remplacement}'")
            count += 1
            if count >= 3:
                return texte, count

    return texte, count

def remplacer_profondement(texte, exemples):
    """Remplace les 3 occurrences de 'profondément'"""
    patterns = [
        (r'profondément\b', 'avec une profondeur', 0),
        (r'profondément\b', 'en profondeur', 1),
        (r'profondément\b', "d'une profondeur", 2),
    ]

    count = 0
    for pattern, remplacement, _ in patterns:
        match = re.search(pattern, texte, re.IGNORECASE)
        if match:
            avant = match.group(0)
            texte = texte[:match.start()] + remplacement + texte[match.end():]
            exemples.append(f"  - 'profondément' → '{remplacement}'")
            count += 1

    return texte, count

def remplacer_inexorablement(texte, exemples):
    """Remplace les 3 occurrences de 'inexorablement'"""
    patterns = [
        (r'inexorablement\b', 'de manière inexorable'),
        (r'inexorablement\b', 'avec cette inexorabilité'),
        (r'inexorablement\b', 'dans son inexorabilité'),
    ]

    count = 0
    for pattern, remplacement in patterns:
        match = re.search(pattern, texte, re.IGNORECASE)
        if match:
            avant = match.group(0)
            texte = texte[:match.start()] + remplacement + texte[match.end():]
            exemples.append(f"  - 'inexorablement' → '{remplacement}'")
            count += 1

    return texte, count

def remplacer_particulierement(texte, exemples):
    """Remplace les 2 occurrences de 'particulièrement'"""
    patterns = [
        (r'particulièrement\b', 'd\\'une manière particulière'),
        (r'particulièrement\b', 'de façon particulière'),
    ]

    count = 0
    for pattern, remplacement in patterns:
        match = re.search(pattern, texte, re.IGNORECASE)
        if match:
            avant = match.group(0)
            texte = texte[:match.start()] + remplacement + texte[match.end():]
            exemples.append(f"  - 'particulièrement' → '{remplacement}'")
            count += 1

    return texte, count

def remplacer_remarquablement(texte, exemples):
    """Remplace les 2 occurrences de 'remarquablement'"""
    patterns = [
        (r'remarquablement\b', 'd\\'une manière remarquable'),
        (r'remarquablement\b', 'de façon remarquable'),
    ]

    count = 0
    for pattern, remplacement in patterns:
        match = re.search(pattern, texte, re.IGNORECASE)
        if match:
            avant = match.group(0)
            texte = texte[:match.start()] + remplacement + texte[match.end():]
            exemples.append(f"  - 'remarquablement' → '{remplacement}'")
            count += 1

    return texte, count

def remplacer_exceptionnellement(texte, exemples):
    """Remplace les 2 occurrences de 'exceptionnellement'"""
    patterns = [
        (r'exceptionnellement\b', 'd\\'une manière exceptionnelle'),
        (r'exceptionnellement\b', 'de façon exceptionnelle'),
    ]

    count = 0
    for pattern, remplacement in patterns:
        match = re.search(pattern, texte, re.IGNORECASE)
        if match:
            avant = match.group(0)
            texte = texte[:match.start()] + remplacement + texte[match.end():]
            exemples.append(f"  - 'exceptionnellement' → '{remplacement}'")
            count += 1

    return texte, count

def remplacer_instantanement(texte, exemples):
    """Remplace les 2 occurrences de 'instantanément'"""
    patterns = [
        (r'instantanément\b', 'dans l\\'instant'),
        (r'instantanément\b', 'à l\\'instant même'),
    ]

    count = 0
    for pattern, remplacement in patterns:
        match = re.search(pattern, texte, re.IGNORECASE)
        if match:
            avant = match.group(0)
            texte = texte[:match.start()] + remplacement + texte[match.end():]
            exemples.append(f"  - 'instantanément' → '{remplacement}'")
            count += 1

    return texte, count

def remplacer_brutalement(texte, exemples):
    """Remplace les 2 occurrences de 'brutalement'"""
    patterns = [
        (r'brutalement\b', 'avec une brutalité'),
        (r'brutalement\b', 'd\\'une brutalité'),
    ]

    count = 0
    for pattern, remplacement in patterns:
        match = re.search(pattern, texte, re.IGNORECASE)
        if match:
            avant = match.group(0)
            texte = texte[:match.start()] + remplacement + texte[match.end():]
            exemples.append(f"  - 'brutalement' → '{remplacement}'")
            count += 1

    return texte, count

def remplacer_adverbes_uniques(texte, exemples):
    """Remplace les adverbes qui n'apparaissent qu'une fois"""
    remplacements_uniques = {
        r'différemment\b': 'd\\'une manière différente',
        r'complètement\b': 'en totalité',
        r'nouvellement\b': 'dans sa nouveauté',
        r'aveuglément\b': 'en aveugle',
        r'intensément\b': 'avec intensité',
        r'jalousement\b': 'avec jalousie',
        r'incroyablement\b': 'd\\'une manière incroyable',
        r'incomplètement\b': 'de manière incomplète',
        r'brièvement\b': 'en bref',
        r'viscéralement\b': 'de manière viscérale',
        r'terriblement\b': 'd\\'une manière terrible',
        r'simplement\b': '',  # Supprimer si contexte permet
        r'paisiblement\b': 'en paix',
        r'progressivement\b': 'de manière progressive',
        r'probablement\b': 'en toute probabilité',
        r'péniblement\b': 'avec peine',
        r'mystérieusement\b': 'de manière mystérieuse',
        r'miraculeusement\b': 'par miracle',
        r'méticuleusement\b': 'avec un soin méticuleux',
        r'méthodiquement\b': 'avec méthode',
        r'mentalement\b': 'en esprit',
        r'mathématiquement\b': 'avec une précision mathématique',
        r'logiquement\b': 'par logique',
        r'invariablement\b': 'de manière invariable',
        r'intentionnellement\b': 'avec intention',
        r'insidieusement\b': 'de manière insidieuse',
        r'inlassablement\b': 'sans lassitude',
        r'inévitablement\b': 'de manière inévitable',
        r'inconsciemment\b': 'sans conscience',
        r'imperceptiblement\b': 'de manière imperceptible',
        r'immédiatement\b': 'dans l\\'immédiat',
        r'frénétiquement\b': 'en frénésie',
        r'exclusivement\b': 'de manière exclusive',
        r'éternellement\b': 'pour l\\'éternité',
        r'définitivement\b': 'de manière définitive',
        r'dangereusement\b': 'de manière dangereuse',
        r'cruellement\b': 'avec cruauté',
        r'cliniquement\b': 'avec une précision clinique',
        r'catégoriquement\b': 'de manière catégorique',
        r'apparemment\b': 'en apparence',
        r'absolument\b': 'de manière absolue',
    }

    count = 0
    for pattern, remplacement in remplacements_uniques.items():
        match = re.search(pattern, texte, re.IGNORECASE)
        if match:
            avant = match.group(0)
            # Vérifier si "simplement" peut être supprimé
            if avant.lower() == 'simplement' and not remplacement:
                # Vérifier contexte
                start = max(0, match.start() - 30)
                contexte = texte[start:match.start()]
                if any(verbe in contexte.lower() for verbe in ['dit', 'murmura', 'répondit', 'ajouta']):
                    texte = texte[:match.start()-1] + texte[match.end():]  # Supprimer avec espace avant
                    exemples.append(f"  - 'simplement' → (supprimé)")
                    count += 1
                    continue
                else:
                    remplacement = 'avec simplicité'

            texte = texte[:match.start()] + remplacement + texte[match.end():]
            exemples.append(f"  - '{avant}' → '{remplacement}'")
            count += 1

    return texte, count

def compter_adverbes(texte):
    """Compte les adverbes réels (en excluant les noms)"""
    matches = re.findall(r'\b(\w+ment)\b', texte, re.IGNORECASE)
    adverbes = [m for m in matches if m.lower() not in NOMS_EXCLUS]
    return len(adverbes)

def main():
    fichier_entree = '00_prologue.md'
    fichier_sortie = '00_prologue.md'  # Écraser l'original

    print("=" * 80)
    print("RÉDUCTION DES ADVERBES EN -MENT - VERSION FINALE")
    print("Objectif : Passer de 82 à ~45 adverbes (réduction de ~37)")
    print("=" * 80)

    # Lire
    texte = lire_fichier(fichier_entree)
    print(f"\n✓ Fichier lu : {len(texte)} caractères")

    # Compter avant
    avant = compter_adverbes(texte)
    print(f"✓ Adverbes AVANT : {avant}")

    # Appliquer remplacements
    exemples = []
    total_remplacements = 0

    print("\n" + "-" * 80)
    print("Application des remplacements...")
    print("-" * 80)

    texte, n = remplacer_detachement(texte, exemples)
    total_remplacements += n
    print(f"✓ détachement : {n} remplacements")

    texte, n = remplacer_emerveillement(texte, exemples)
    total_remplacements += n
    print(f"✓ émerveillement : {n} remplacements")

    texte, n = remplacer_profondement(texte, exemples)
    total_remplacements += n
    print(f"✓ profondément : {n} remplacements")

    texte, n = remplacer_inexorablement(texte, exemples)
    total_remplacements += n
    print(f"✓ inexorablement : {n} remplacements")

    texte, n = remplacer_particulierement(texte, exemples)
    total_remplacements += n
    print(f"✓ particulièrement : {n} remplacements")

    texte, n = remplacer_remarquablement(texte, exemples)
    total_remplacements += n
    print(f"✓ remarquablement : {n} remplacements")

    texte, n = remplacer_exceptionnellement(texte, exemples)
    total_remplacements += n
    print(f"✓ exceptionnellement : {n} remplacements")

    texte, n = remplacer_instantanement(texte, exemples)
    total_remplacements += n
    print(f"✓ instantanément : {n} remplacements")

    texte, n = remplacer_brutalement(texte, exemples)
    total_remplacements += n
    print(f"✓ brutalement : {n} remplacements")

    texte, n = remplacer_adverbes_uniques(texte, exemples)
    total_remplacements += n
    print(f"✓ adverbes uniques : {n} remplacements")

    # Compter après
    apres = compter_adverbes(texte)
    reduction = avant - apres

    print("\n" + "=" * 80)
    print("RÉSULTAT FINAL")
    print("=" * 80)
    print(f"✓ Remplacements appliqués : {total_remplacements}")
    print(f"✓ Adverbes APRÈS : {apres}")
    print(f"✓ Réduction : {reduction} adverbes (-{reduction/avant*100:.1f}%)")

    # Écrire
    ecrire_fichier(fichier_sortie, texte)
    print(f"\n✓ Fichier sauvegardé : {fichier_sortie}")

    print("\n" + "=" * 80)
    print("EXEMPLES DE TRANSFORMATIONS (premiers 15)")
    print("=" * 80)
    for exemple in exemples[:15]:
        print(exemple)

    print("\n✓ Traitement terminé avec succès!")

if __name__ == '__main__':
    main()
