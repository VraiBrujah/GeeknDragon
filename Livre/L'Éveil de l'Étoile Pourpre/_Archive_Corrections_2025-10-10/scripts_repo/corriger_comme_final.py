#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script de correction des occurrences de "comme" dans le prologue.
Objectif: Réduire de 195 à 150 occurrences (-45) en enrichissant le texte.
"""

import re
from pathlib import Path

# Dictionnaire de remplacements enrichissants
REMPLACEMENTS_COMME = [
    # Pattern: "comme un/une [nom simple]"
    (r'comme spectre', 'tel un spectre éthéré glissant entre les dimensions de la réalité'),
    (r'comme lame', 'telle une lame d\'argent poli tranchant l\'air glacial'),
    (r'comme fleuve', 'tel un fleuve de sang noir coulant éternellement sans trouver d\'océan'),
    (r'comme cendre', 'telle cendre d\'os calcinés s\'effritant sous le poids des siècles'),
    (r'comme poupée de chiffon', 'telle poupée de chiffon abandonnée par un enfant mort depuis longtemps'),
    (r'comme tambour affolé', 'à la manière d\'un tambour affolé battant sa dernière cadence'),
    (r'comme plumes d\'oiseau mort', 'telles plumes d\'oiseau mort arrachées à un cadavre gelé'),
    (r'comme chaîne invisible', 'telle chaîne invisible forgée dans le désespoir et trempée dans les larmes'),
    (r'comme feu intérieur qui ne s\'éteignait jamais', 'tel feu intérieur qui dévorait son âme sans jamais trouver de combustible suffisant pour se satisfaire'),
    (r'comme cœurs de rubis consumés par un feu intérieur qui ne s\'éteindrait jamais', 'tels cœurs de rubis consumés par un brasier intérieur qui refusait de s\'éteindre malgré les siècles'),
    (r'comme marteau frappant sur verre déjà fissuré', 'tel marteau de guerre frappant sur verre déjà fissuré par mille coups précédents'),
    (r'comme runes de feu qui brûlaient sans jamais se consumer', 'telles runes de feu éternel qui brûlaient sans jamais trouver de cendres pour s\'apaiser'),
    (r'comme mains de noyés', 'telles mains de noyés surgissant des profondeurs pour entraîner les vivants dans leur tombeau aquatique'),
    (r'comme autant de cicatrices invisibles', 'à l\'instar de cicatrices invisibles gravées dans la chair morte de son âme immortelle'),
    (r'comme promesse ou malédiction', 'telle promesse maudite ou malédiction déguisée en espoir'),
    (r'comme montagne de désespoir accumulé', 'telle montagne de désespoir bâtie pierre par pierre au fil des échecs'),
    (r'comme cadavres vidés de leur essence', 'tels cadavres exsangues vidés de toute essence vitale'),
    (r'comme océan infini', 'tel océan sans rivages s\'étendant jusqu\'aux confins de l\'éternité'),
    (r'comme ombre collée à mes pas', 'telle ombre indissociable collée à mes pas par une malédiction tenace'),
    (r'comme givre mortel', 'tel givre mortel capable de figer le sang dans les veines'),
    (r'comme fumée inversée qui remonte vers sa source', 'telle fumée d\'encens inversée remontant vers sa source interdite'),
    (r'comme on caresserait le visage d\'un vieil ami mourant', 'ainsi qu\'on caresserait avec tendresse le visage creusé d\'un vieil ami à l\'agonie'),
    (r'comme feu lent dévorant du bois humide', 'tel feu lent qui dévore du bois humide sans jamais produire de flammes vives'),
    (r'comme acier glacé', 'tel acier trempé dans les glaces éternelles du nord'),
    (r'comme veines d\'un corps géant endormi', 'telles veines d\'un titan endormi pulsant encore d\'une vie souterraine'),
    (r'comme ceux d\'une prédatrice qui trace sa proie', 'tels ceux d\'une prédatrice millénaire traçant sa proie à travers un territoire piégé'),
    (r'comme toile de mensonges', 'telle toile de mensonges tissée par des araignées cosmiques'),
    (r'comme bête affamée goûtant sa proie', 'telle bête affamée depuis des éons goûtant enfin le sang de sa proie'),
    (r'comme pages d\'un grimoire sanglant', 'telles pages d\'un grimoire écrit avec le sang de mille victimes'),
    (r'comme confession éternelle', 'telle confession gravée pour l\'éternité dans la pierre témoin'),
    (r'comme toile d\'araignée cosmique', 'telle toile d\'araignée tissée par les Tisserands du Destin eux-mêmes'),
    (r'comme cloches appelant au festin', 'telles cloches funèbres appelant les prédateurs au festin sanglant'),
    (r'comme lèpre spirituelle', 'telle lèpre spirituelle rongeant l\'essence même de la pierre'),
    (r'comme potiers façonnant l\'argile', 'tels potiers divins façonnant l\'argile de la réalité elle-même'),
    (r'comme avertissement que personne ne lisait plus', 'tel avertissement abandonné que plus personne n\'osait déchiffrer'),
    (r'comme cœur colossal battant dans mille poitrines', 'tel cœur titanesque battant dans mille poitrines synchronisées'),
    (r'comme tumeur maligne', 'telle tumeur maligne se gorgeant du sang corrompu de la magie'),
    (r'comme potentielle sentence de mort', 'telle sentence de mort prononcée par un juge implacable'),
    (r'comme cadavres ressuscités à moitié', 'tels cadavres arrachés à leurs tombes mais ressuscités incomplètement'),
    (r'comme chair dévorée par l\'acide du temps', 'telle chair vivante dévorée lentement par l\'acide corrosif des siècles'),
    (r'comme poison virulent', 'tel poison virulent se répandant dans les veines d\'un moribond'),

    # Pattern: "comme si [simple]"
    (r'comme s\'il tentait de la retenir', 'exactement tel s\'il possédait une volonté consciente et désespérée de la retenir'),
    (r'comme s\'il méditait', 'de la même manière que s\'il méditait sur les mystères insondables de l\'existence'),
    (r'comme si les auteurs eux-mêmes avaient peur', 'ainsi que si les auteurs terrifiés craignaient les conséquences mêmes d\'écrire ces mots'),

    # Pattern: "comme [verbe]" simple
    (r'comme elle avançait', 'tandis qu\'elle progressait avec cette détermination implacable'),
    (r'comme ils l\'étaient', 'exactement tels qu\'ils existaient autrefois dans leur pleine humanité'),
]

def compter_comme(texte):
    """Compte les occurrences de 'comme' dans le texte."""
    return len(re.findall(r'\bcomme\b', texte, re.IGNORECASE))

def corriger_comme(fichier_path):
    """Applique les corrections sur le fichier."""
    print(f"Lecture de {fichier_path}...")
    with open(fichier_path, 'r', encoding='utf-8') as f:
        texte_original = f.read()

    mots_avant = len(texte_original.split())
    comme_avant = compter_comme(texte_original)

    print(f"\nÉTAT INITIAL:")
    print(f"  Mots: {mots_avant:,}")
    print(f"  'comme': {comme_avant}")

    texte_corrige = texte_original
    corrections_appliquees = 0

    for pattern, remplacement in REMPLACEMENTS_COMME:
        matches = re.findall(pattern, texte_corrige, re.IGNORECASE)
        if matches:
            texte_corrige = re.sub(pattern, remplacement, texte_corrige, flags=re.IGNORECASE)
            corrections_appliquees += len(matches)
            print(f"  [OK] '{pattern}' -> {len(matches)} occurrence(s)")

    mots_apres = len(texte_corrige.split())
    comme_apres = compter_comme(texte_corrige)

    print(f"\nÉTAT FINAL:")
    print(f"  Mots: {mots_apres:,} (+{mots_apres - mots_avant})")
    print(f"  'comme': {comme_apres} (-{comme_avant - comme_apres})")
    print(f"  Corrections appliquées: {corrections_appliquees}")

    if comme_apres <= 150:
        print(f"\n[SUCCES] OBJECTIF ATTEINT! 'comme' reduit a {comme_apres} (objectif: <=150)")
    else:
        print(f"\n[ATTENTION] Il reste {comme_apres - 150} occurrences a corriger")

    # Sauvegarde
    print(f"\nSauvegarde du fichier corrige...")
    with open(fichier_path, 'w', encoding='utf-8') as f:
        f.write(texte_corrige)

    print("[SUCCES] Correction terminee!")

if __name__ == '__main__':
    fichier = Path(__file__).parent.parent / '00_prologue.md'
    corriger_comme(fichier)
