#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Corrige les corruptions de texte créées par les remplacements en cascade.
"""

from pathlib import Path

# Liste exhaustive des corrections nécessaires
CORRECTIONS = [
    # Corruption ligne 1767
    (
        "*❖ Les rats, chuchota-t-elle, sa voix à peine audible dans le silence oppressant en tournant la tête vers une fissure pun millénaire de solitude absoluerement sombre avec la précision d'un prédateur.*",
        "*❖ Les rats, chuchota-t-elle, sa voix à peine audible dans le silence oppressant, en tournant la tête vers une fissure de façon marquante et distinctive sombre avec cette précision chirurgicale qui ne laissait aucune place au doute d'un prédateur millénaire.*"
    ),

    # Corruption ligne 1889-1893
    (
        "de manière authentique et vérifiable, dit-elle avec un sourire étrange qui découvrait la pointe de ses crocs.\n\n*❖ Le silence n'esdans son intégralité la plus absolueitablement, dans sa totalité absolue, de façon entière et sans réserve silencieux pour qui sait l'entendre avec attention et patience séculaire. Dans ce vide apparent, dans ce néant creux que perçoivent les mortels avec leurs sens limités et émoussés, il y a une symphonie entière, complexe et riche, qui se joue à chaque instant de l'éternité.*\n\nElle tendit une main pâle, doigts écartés, tel si elle pouvait toucher les sons invisibles, ainsi que le révélait.",
        "❖ Avec cette précision chirurgicale qui ne laissait aucune place au doute, dit-elle avec un sourire étrange qui découvrait la pointe de ses crocs.\n\n*❖ Le silence n'est jamais dans son intégralité, dans sa totalité absolue, de façon entière et sans réserve silencieux pour qui sait l'entendre avec attention et patience séculaire acquise au fil des siècles. Dans ce vide apparent, dans ce néant creux que perçoivent les mortels avec leurs sens limités et émoussés, il y a une symphonie entière, complexe et riche, qui se joue à chaque instant de l'éternité sans fin.*\n\nElle tendit une main pâle, doigts écartés, tel si elle pouvait toucher de façon tangible les sons invisibles qui flottaient dans l'air saturé de magie."
    ),

    # Corruption ligne 3169
    (
        "Sa voix portait une note profonde d'incrédulité tremblante qdans sa totalité absoluerven entier sans réservecomplètement, de manière absolue et totale, sans aucune restriction, malgré tous ses efforts, à masquer derrière son masque habituel de froideur millénaire.",
        "Sa voix portait une note profonde d'incrédulité tremblante qu'elle parvenait avec difficulté, dans sa totalité absolue, en entier et sans réserve, de manière absolue et totale, sans aucune restriction, malgré tous ses efforts acharnés, à masquer derrière son masque habituel de froideur millénaire bien rodée."
    ),

    # Artefacts restants
    ("r éservecompl étement", "de manière absolue et totale, sans aucune restriction"),
    ("millim étr éeuement", "avec cette attention aux détails qui caractérisait les immortels"),
    ("chirurgicaler écis ément", "avec cette précision chirurgicale qui ne laissait aucune place au doute"),
    ("absolue rement", "avec une certitude absolue"),
    ("absolue itement", "avec une certitude absolue"),
    ("profond e ement", "jusqu'au plus profond de son âme immortelle"),
    ("profond e itablement", "jusqu'au plus profond de son âme immortelle"),
]

def corriger_fichier(fichier_path):
    """Corrige toutes les corruptions."""
    print(f"Lecture de {fichier_path}...")
    with open(fichier_path, 'r', encoding='utf-8') as f:
        texte = f.read()

    mots_avant = len(texte.split())
    print(f"\nETAT INITIAL:")
    print(f"  Mots: {mots_avant:,}")

    corrections_appliquees = 0
    print(f"\nCORRECTIONS:")

    for pattern, remplacement in CORRECTIONS:
        if pattern in texte:
            texte = texte.replace(pattern, remplacement)
            corrections_appliquees += 1
            print(f"  [OK] Corruption corrigee ({len(pattern)} -> {len(remplacement)} caracteres)")

    mots_apres = len(texte.split())
    print(f"\nETAT FINAL:")
    print(f"  Mots: {mots_apres:,} (diff: {mots_apres - mots_avant:+d})")
    print(f"  Corrections appliquees: {corrections_appliquees}")

    # Sauvegarde
    print(f"\nSauvegarde du fichier corrige...")
    with open(fichier_path, 'w', encoding='utf-8') as f:
        f.write(texte)

    print("[SUCCES] Corrections terminees!")

if __name__ == '__main__':
    fichier = Path(__file__).parent.parent / '00_prologue.md'
    corriger_fichier(fichier)
