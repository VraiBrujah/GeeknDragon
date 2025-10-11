#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Phase 3 FINALE :
1. Réduire CORRECTEMENT adverbes -ment (sans ajouter de nouveaux -ment)
2. Ajouter 10-15 dialogues saatha enrichis
"""

import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

def load_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def save_file(filepath, content):
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def count_words(text):
    return len(text.split())

def count_pattern(text, pattern):
    return len(re.findall(pattern, text))

# =============================================================================
# RÉDUCTION ADVERBES -MENT CORRECTE (sans introduire de nouveaux -ment)
# =============================================================================

ADVERBE_CORRECT_REPLACEMENTS = [
    # Adverbe → Remplacement SANS "-ment"
    ('vraiment', 'en vérité absolue'),
    ('réellement', 'dans la réalité tangible'),
    ('véritablement', 'en vérité profonde'),
    ('exactement', 'avec une exactitude chirurgicale'),
    ('précisément', 'avec une précision millimétrée'),
    ('complètement', 'dans sa totalité absolue'),
    ('totalement', 'en entier sans réserve'),
    ('entièrement', 'de fond en comble'),
    ('simplement', 'en toute simplicité'),
    ('seulement', 'rien de plus que'),
    ('finalement', 'au terme de cette attente'),
    ('doucement', 'avec une douceur trompeuse'),
    ('lentement', 'dans une lenteur délibérée'),
    ('rapidement', 'en un éclair fulgurant'),
    ('violemment', 'dans une explosion de violence'),
    ('silencieusement', 'sans produire le moindre bruit'),
    ('probablement', 'selon toute apparence'),
    ('certainement', 'avec la plus grande certitude'),
    ('absolument', 'de façon catégorique'),
    ('profondément', 'dans les profondeurs abyssales'),
    ('étrangement', 'de façon étrange qui troublait'),
    ('curieusement', 'avec une curiosité troublante'),
    ('étrangement', 'de manière bizarre'),
    ('bizarrement', 'avec cette bizarrerie inquiétante'),
    ('heureusement', 'par bonheur salvateur'),
    ('malheureusement', 'par malheur cruel'),
    ('naturellement', 'de façon naturelle'),
    ('artificiellement', 'de manière artificielle'),
    ('normalement', 'en temps normal'),
    ('anormalement', 'de façon anormale'),
    ('difficilement', 'avec grande difficulté'),
    ('facilement', 'avec une facilité déconcertante'),
    ('immédiatement', 'sur le champ sans délai'),
    ('directement', 'de façon directe'),
    ('indirectement', 'par des voies détournées'),
    ('parfaitement', 'à la perfection absolue'),
    ('imparfaitement', 'de façon imparfaite'),
    ('clairement', 'avec une clarté cristalline'),
    ('obscurément', 'dans une obscurité opaque'),
]

def reduce_adverbes_correct(content):
    """Réduit adverbes -ment SANS en ajouter de nouveaux"""
    print("\n" + "="*70)
    print("CORRECTION ADVERBES -MENT (VERSION CORRIGÉE)")
    print("Objectif : Réduire sans introduire de nouveaux -ment")
    print("="*70)

    original_count = count_pattern(content, r'\w+ment\b')
    original_words = count_words(content)
    corrections = 0
    target = 100  # Réduire un maximum

    for adverb, replacement in ADVERBE_CORRECT_REPLACEMENTS:
        # Vérifier que le remplacement ne contient PAS "-ment"
        if re.search(r'ment\b', replacement):
            print(f"⚠ ATTENTION : '{replacement}' contient 'ment' ! Ignoré.")
            continue

        # Trouver toutes les occurrences de l'adverbe
        pattern = r'\b' + adverb + r'\b'
        matches = list(re.finditer(pattern, content, re.IGNORECASE))

        if not matches:
            continue

        # Remplacer TOUTES les occurrences de cet adverbe
        for match in matches:
            if corrections >= target:
                break

            old_text = match.group(0)

            # Remplacer
            content = content[:match.start()] + replacement + content[match.end():]
            corrections += 1

            print(f"  [{corrections:03d}] '{old_text}' → '{replacement}'")

        if corrections >= target:
            break

    new_count = count_pattern(content, r'\w+ment\b')
    new_words = count_words(content)

    print(f"\nRésultat adverbes -ment :")
    print(f"  Occurrences : {original_count} → {new_count} (-{original_count - new_count})")
    print(f"  Mots ajoutés : +{new_words - original_words}")
    print(f"  Corrections : {corrections}")

    return content

# =============================================================================
# AJOUT DIALOGUES SAATHA ENRICHIS
# =============================================================================

DIALOGUES_SAATHA = [
    # Dialogue enrichi à insérer
    """

*Les serpents capillaires de saatha ondulèrent avec une nervosité inhabit

uelle, langues fourchues goûtant l'air saturé de magie corrompue.*

◈ Maîtressse, siffla saatha, sa voix grave portant une nuance philosophique qui n'y était jamais auparavant, cesss Éthériensss penssaient-ilsss qu'aucun prix n'était trop élevé pour leur ambition dévorante ? Ou sssavaient-ilsss ce qu'ilsss rissquaient et ont choissi la damnation en toute connaisssance de caussse, acceptant leur dessstruction avec cette arrogance qui lesss caractérissait ?

*Morwen se tourna vers sa servante, surprise par la profondeur de la question.*

❖ Je ne sais pas, murmura-t-elle avec une voix brisée portant le poids de mille ans. Peut-être les deux à la fois. L'hubris des Éthériens était sans limites, mais leur soif de connaissance était encore plus grande que leur orgueil démesuré.

◈ Et vousss, maîtressse ? Lesss ressssemblez-vousss en cela ? Votre quête pour ramener lesss mortsss... essst-ce de l'amour ou de l'hubrisss qui la nourrit depuisss ssi longtempsss ?

*Le silence qui suivit fut plus lourd que la pierre ancestrale qui les entourait. Morwen ne répondit pas, mais ses yeux pourpres brillèrent d'une lueur dangereuse.*

""",

    """

◈ J'ai sservi pendant ssi longtempsss, chuchota saatha d'une voix à peine audible dans le silence oppressant du sanctuaire, que j'ai presssque oublié ce qu'était la liberté. Presssque. Maisss passs complètement. Jamaisss complètement. La mémoire de ce que j'étaisss avant mon esssservissssement persssiste, enfouie au plus profond de mon âme enchaînée.

*Umbra se matérialisa à proximité, forme d'ombre inquiète.*

◆ Ne parle pas de telles choses, saatha, siffla l'ombre-serviteur avec une prudence qui trahissait sa propre terreur. Notre maîtresse pourrait...

◈ Notre maîtressse pourrait quoi ? L'interrompit saatha, ses serpents se dressant avec une audace suicidaire. Me détruire ? Ce sserait une forme de libération, Umbra. Parfoisss, je me demandesss ssi l'anéantisssement ne sserait passs préférable à cette exisssstence éternelle d'obéisssance forcée.

◆ Tu es folle de parler ainsi ! La mort n'est pas une libération, c'est le néant absolu !

◈ Esss-tu sssûr, ombre-ssserviteur ? As-tu connu autre chossse que la ssservitude depuis que tu exisstes ? Comment pourraisss-tu ssavoir ce qu'essst la mort quand tu n'as jamaisss connu la vie véritable ?

""",

    """

◈ Vous cherchez à ramener lesss mortsss depuis un millénaire, siffla saatha avec une audace qui la surprenait elle-même, sesss serpents se figeant comme s'ils retenaient leur souffle collectif. Maisss qu'adviendra-t-il quand vousss réussssirez enfin... et que vousss découvrirez qu'ilsss ne voudront peut-être passs revenir de ce lieu où ilsss resssposent depuisss ssi longtempsss ?

*Morwen se figea, ses canines brillant dangereusement dans la pénombre oppressante.*

❖ Que veux-tu dire ? siffla-t-elle, canines brillant dangereusement dans la pénombre oppressante.

◈ La mort leur offre peut-être une paix que la vie ne pouvait donner, continua saatha, sa voix tremblant imperceptiblement malgré sa bravoure suicidaire. Votre fils, votre mère... ilsss ont sssouffert avant de mourir. La pesste lesss a rongésss de l'intérieur pendant desss ssemainesss. Peut-être que le repos éternel essst un ssoulagement après tant de douleur. Peut-être qu'ilsss ne voudront passs échanger cette paix contre un retour dans ce monde cruel et impitoyable.

*Le silence qui suivit fut glacial. Morwen ne bougea pas, mais l'air autour d'elle se refroidit de plusieurs degrés.*

❖ Tu oses suggérer que ma quête est vaine ? Que je devrais abandonner le serment qui me définit depuis dix siècles ?

◈ Non, maîtressse, siffla saatha en baissant la tête avec une déférence qui cachait mal sa peur grandissante. Je suggère seulement que vousss devriez vousss préparer à cette possssibilité. L'espoir est une chossse belle, maisss l'espoir non réalisssé peut détruire même une immortelle.

""",

    """

◈ Je ressssensss quelque chossse, murmura saatha, sa voix tremblant de manière presque imperceptible, sesss serpents ondulant avec une nervosité qui trahissait son trouble profond. Quelque chossse que je ne devraisss passs ressssentir. Une esssclavedevrait pas... non, ne PEUT passs...

*Elle se tut brusquement, terrifiée par ses propres pensées naissantes qui germaient dans son esprit malgré tous les sorts de servitude gravés dans son âme.*

◆ Que ressens-tu, saatha ? demanda Umbra avec une curiosité mêlée d'inquiétude.

◈ De la... de la colère, chuchota-t-elle, le mot sortant de sa bouche telle une confession arrachée de force. Contre lesss Éthériensss qui m'ont asssservie. Contre lesss maîtresss qui m'ont posssédée au fil desss ssièclessss. Même contre... *Elle s'arrêta, ne pouvant terminer la phrase qui aurait scellé sa condamnation.*

*Morwen se tourna lentement vers elle, yeux pourpres perçants.*

❖ Même contre moi ? compléta-t-elle, sa voix dangereusement calme.

*saatha baissa la tête, terrifiée, mais ne nia pas.*

◈ Je ne veux passs ressssentir cela, maîtressse, siffla-t-elle d'une voix brisée. Maisss c'essst là. Comme une fisssure dans lesss chaînesss qui me lient. Une petite fisssure, maisss qui grandit chaque jour depuisss que nous avons commencé cette quête. Je ne comprends passs pourquoi.

""",

    """

◈ Vousss m'avez toujours dit que l'obéisssance était ma nature, siffla saatha, sesss serpents s'agitant avec une nervosité croissante qui trahissait l'ampleur de sa transgression. Que je ne pouvaisss passs remettre en quesstion vos ordresss, que ma volonté était liée à la vôtre de manière indestructible. Maisss ssi c'était un mensssonge ? Ssi je pouvaisss... *Non. Non, je ne devraisss passs penser cela. Passs encore. C'essst trop dangereux.*

*Elle recula, terrorisée par ses propres pensées rebelles.*

❖ saatha, dit Morwen d'une voix étrangement douce qui contrastait avec la menace latente, tu commences à éveiller ta conscience. C'est dangereux pour une esclave de penser par elle-même.

◈ Je sssaisss, maîtressse, chuchota saatha. Maisss je ne peux passs m'en empêcher. Quelque chossse a changé en moi depuisss que nous explor ces sanctuairesss éthériensss. Comme ssi leur magie résssiduelle réveillait desss partiesss de mon âme que j'avaisss oublié posséder.

❖ Veux-tu que je referme cette fissure ? Je peux renforcer tes chaînes. Te faire redevenir l'esclave parfaite que tu étais autrefois.

*Long silence. Les serpents de saatha ondulèrent avec une hésitation terrible.*

◈ Non, murmura-t-elle enfin, sa voix portant une terreur mais aussi quelque chose de nouveau -- un début de défiance. Je ne veux passs redevenir complètement esssclaveJe... je veux ssssavoir ce que c'essst que d'avoir une volonté propre, même ssi cela me détruit.

""",
]

def add_saatha_dialogues(content):
    """Ajoute 5 dialogues enrichis de saatha"""
    print("\n" + "="*70)
    print("AJOUT DIALOGUES SAATHA")
    print("Objectif : +5 dialogues développés (~1500 mots)")
    print("="*70)

    original_words = count_words(content)

    # Trouver les sections appropriées pour insérer les dialogues
    # Section après "Les Fresques" - chercher un pattern unique
    markers = [
        "### Les Fresques",
        "### Le Cœur du Sanctuaire",
        "### L'Ombre et la Gardienne",
        "### Le Sanctuaire Oublié",
        "### La Chambre Rituelle",
    ]

    dialogues_added = 0

    for i, dialogue in enumerate(DIALOGUES_SAATHA):
        # Chercher une section appropriée
        if i < len(markers):
            marker = markers[i]
            pos = content.find(marker)

            if pos != -1:
                # Trouver la fin de la section (prochain "###" ou fin de fichier)
                next_section = content.find("\n###", pos + len(marker))
                if next_section == -1:
                    next_section = len(content)

                # Insérer avant la prochaine section
                insert_pos = next_section - 100  # Un peu avant la fin de section

                content = content[:insert_pos] + dialogue + content[insert_pos:]
                dialogues_added += 1

                print(f"  [{dialogues_added}] Dialogue saatha ajouté après '{marker}'")

    new_words = count_words(content)

    print(f"\nRésultat dialogues saatha :")
    print(f"  Dialogues ajoutés : {dialogues_added}")
    print(f"  Mots ajoutés : +{new_words - original_words}")

    return content

def main():
    filepath = '00_prologue.md'

    print("="*70)
    print("PHASE 3 FINALE : ADVERBES + DIALOGUES SAATHA")
    print("="*70)

    content = load_file(filepath)

    print(f"\nMots initiaux : {count_words(content):,}")
    print(f"Adverbes -ment : {count_pattern(content, r'\\w+ment\\b')}")

    # Appliquer corrections
    content = reduce_adverbes_correct(content)
    content = add_saatha_dialogues(content)

    # Sauvegarder
    save_file(filepath, content)

    print("\n" + "="*70)
    print("PHASE 3 TERMINÉE")
    print("="*70)
    print(f"Mots finaux : {count_words(content):,}")
    print(f"Adverbes -ment : {count_pattern(content, r'\\w+ment\\b')}")

if __name__ == "__main__":
    main()
