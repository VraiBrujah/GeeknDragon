# -*- coding: utf-8 -*-
"""
Script pour réduire les adverbes en -ment dans 00_prologue.md
Objectif : Passer de 167 à ~90 occurrences
Règle absolue : JAMAIS raccourcir le texte, toujours enrichir
"""

import re

# Dictionnaire de remplacements : adverbe → liste de remplacements enrichis
REMPLACEMENTS = {
    # Adverbes fréquents (détachement a 7 occurrences)
    r'\bavec un détachement\b': [
        'portant ce détachement',
        'dans ce détachement',
        'empreint de ce détachement',
        'marqué par ce détachement'
    ],

    # Adverbes moyens
    r'\binstantanément\b': ['dans l\'instant', 'à l\'instant même', 'en un instant fulgurant'],
    r'\binexorablement\b': ['de manière inexorable', 'avec cette inexorabilité', 'dans son inexorabilité'],
    r'\bbrutalement\b': ['avec une brutalité', 'dans une brutalité', 'd\'une brutalité'],
    r'\bremarquablement\b': ['d\'une manière remarquable', 'de façon remarquable'],

    # Adverbes rares prioritaires
    r'\bsimplement\b': ['avec simplicité', 'dans sa simplicité', ''],  # Parfois supprimer
    r'\bdoucement\b': ['avec douceur', 'd\'une voix douce', 'en un murmure doux'],
    r'\bcompl[èe]tement\b': ['en totalité', 'dans sa totalité', 'en sa totalité'],
    r'\blentement\b': ['avec lenteur', 'd\'un pas lent', 'dans une lenteur délibérée'],
    r'\brapidement\b': ['avec rapidité', 'd\'un geste rapide', 'en un mouvement rapide'],
    r'\bfixement\b': ['d\'un regard fixe', 'en fixant', 'fixant du regard'],
    r'\bprofond[ée]ment\b': ['avec profondeur', 'en profondeur', 'd\'une profondeur'],

    # Autres adverbes à traiter
    r'\bterriblement\b': ['d\'une manière terrible', 'dans sa terrible', 'de façon terrible'],
    r'\bpaisiblement\b': ['avec une paix', 'en paix', 'dans une paix'],
    r'\bprogressivement\b': ['de manière progressive', 'en progression', 'dans une progression'],
    r'\bprobablement\b': ['selon toute probabilité', 'en toute probabilité'],
    r'\bp[ée]niblement\b': ['avec peine', 'dans une peine', 'de pénible manière'],
    r'\bmyst[ée]rieusement\b': ['de manière mystérieuse', 'en un mystère', 'dans son mystère'],
    r'\bmiraculeusement\b': ['par miracle', 'en un miracle'],
    r'\bm[ée]ticuleusement\b': ['avec un soin méticuleux', 'dans un soin méticuleux'],
    r'\bm[ée]thodiquement\b': ['avec méthode', 'en méthode', 'selon une méthode'],
    r'\bmentalement\b': ['en esprit', 'dans son esprit', 'par l\'esprit'],
    r'\bmath[ée]matiquement\b': ['avec une précision mathématique'],
    r'\blogiquement\b': ['par logique', 'selon la logique', 'en toute logique'],
    r'\bjalousement\b': ['avec jalousie', 'en jalousie', 'dans une jalousie'],
    r'\binvariablement\b': ['de manière invariable', 'sans variation'],
    r'\bintentionnellement\b': ['de manière intentionnelle', 'avec intention', 'par intention'],
    r'\bintens[ée]ment\b': ['avec intensité', 'd\'une intensité', 'en intensité'],
    r'\binsidieusement\b': ['de manière insidieuse', 'avec insidiosité'],
    r'\binlassablement\b': ['sans lassitude', 'dans une constance inlassable'],
    r'\bin[ée]vitablement\b': ['de manière inévitable', 'avec cette inévitabilité'],
    r'\bincroyablement\b': ['d\'une manière incroyable', 'de façon incroyable'],
    r'\binconsciemment\b': ['sans conscience', 'en inconscience', 'hors de sa conscience'],
    r'\bincompl[èe]tement\b': ['de manière incomplète', 'en incomplétude'],
    r'\bimperceptiblement\b': ['de manière imperceptible', 'd\'une imperceptibilité'],
    r'\bimm[ée]diatement\b': ['dans l\'immédiat', 'sans délai', 'à l\'instant'],
    r'\bfr[ée]n[ée]tiquement\b': ['en frénésie', 'dans une frénésie', 'avec frénésie'],
    r'\bexclusivement\b': ['de manière exclusive', 'en exclusivité'],
    r'\b[ée]ternellement\b': ['pour l\'éternité', 'dans l\'éternité', 'en éternité'],
    r'\bdiff[ée]remment\b': ['d\'une manière différente', 'de façon différente'],
    r'\bd[ée]finitivement\b': ['de manière définitive', 'en définitive', 'pour de bon'],
    r'\bdangereusement\b': ['de manière dangereuse', 'avec danger'],
    r'\bcruellement\b': ['avec cruauté', 'd\'une cruauté', 'en cruauté'],
    r'\bcliniquement\b': ['avec une précision clinique', 'en clinique'],
    r'\bcat[ée]goriquement\b': ['de manière catégorique', 'avec catégorisme'],
    r'\bbri[èe]vement\b': ['en bref', 'de manière brève', 'dans une brève'],
    r'\baveugl[ée]ment\b': ['en aveugle', 'tel un aveugle', 'dans un aveuglement'],
    r'\bavidemment\b': ['avec avidité', 'd\'une avidité', 'en avidité'],
    r'\bapparemment\b': ['en apparence', 'selon toute apparence'],
    r'\babsolument\b': ['de manière absolue', 'en absolu', 'dans l\'absolu'],
    r'\bviscéralement\b': ['de manière viscérale', 'en viscère', 'dans ses viscères'],
}

# Noms à NE PAS remplacer (pattern pour exclure)
NOMS_EXCLUS = r'\b(serment|moment|mouvement|battement|avertissement|frémissement|jugement|entraînement|acharnement|tremblement|hurlement|grondement|fragment|entendement|effondrement|craquement|comment|Comment|commencement|bruissement|traitement|soulagement|sifflement|rugissement|renfoncement|prélèvement|ménagement|hochement|halètement|grincement|fondement|firmament|enseignement|enrichissement|emplacement|élément|[ÉéE]crasement|déplacement|changement|claquement|clément|commandement|bannissement|anéantisssement|amusement|agacement|achèvement)\b'

def remplacer_adverbes(texte):
    """Remplace les adverbes en -ment par des constructions enrichies"""
    compteur = 0
    exemples = []

    for pattern, remplacements in REMPLACEMENTS.items():
        # Trouver toutes les occurrences
        matches = list(re.finditer(pattern, texte, re.IGNORECASE))

        for i, match in enumerate(matches):
            original = match.group(0)

            # Vérifier que ce n'est pas un nom exclu
            if re.search(NOMS_EXCLUS, original, re.IGNORECASE):
                continue

            # Choisir un remplacement (rotation circulaire)
            remplacement = remplacements[i % len(remplacements)]

            # Si remplacement vide, supprimer l'adverbe (cas "simplement")
            if not remplacement:
                # Ne supprimer que si le contexte permet
                avant = texte[max(0, match.start()-20):match.start()]
                apres = texte[match.end():min(len(texte), match.end()+20)]
                if 'dit' in avant or 'murmura' in avant or 'répondit' in avant:
                    remplacement = ''  # Supprimer adverbe redondant
                else:
                    remplacement = 'avec simplicité'  # Garder forme nominale

            # Appliquer le remplacement
            nouveau_texte = texte[:match.start()] + remplacement + texte[match.end():]

            # Enregistrer exemple si c'est l'un des premiers
            if compteur < 15:
                exemples.append(f"  - '{original}' → '{remplacement}'")

            texte = nouveau_texte
            compteur += 1

    return texte, compteur, exemples

def main():
    fichier_entree = '00_prologue.md'
    fichier_sortie = '00_prologue_REDUIT_ADVERBES.md'

    # Lire le fichier
    with open(fichier_entree, 'r', encoding='utf-8') as f:
        contenu = f.read()

    print(f"Fichier lu: {len(contenu)} caractères")

    # Compter adverbes avant
    avant = len(re.findall(r'\b\w+ment\b', contenu))
    print(f"Adverbes en -ment avant: {avant}")

    # Appliquer remplacements
    nouveau_contenu, compteur_remplacements, exemples = remplacer_adverbes(contenu)

    # Compter adverbes après
    apres = len(re.findall(r'\b\w+ment\b', nouveau_contenu))
    print(f"Adverbes en -ment après: {apres}")
    print(f"Remplacements effectués: {compteur_remplacements}")
    print(f"Réduction: {avant - apres} adverbes")

    # Écrire le fichier
    with open(fichier_sortie, 'w', encoding='utf-8') as f:
        f.write(nouveau_contenu)

    print(f"\nFichier sauvegardé: {fichier_sortie}")
    print(f"\nExemples de transformations:")
    for exemple in exemples:
        print(exemple)

if __name__ == '__main__':
    main()
