#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

# Lire le fichier
with open('00_prologue.md', 'r', encoding='utf-8') as f:
    text = f.read()

print("="*80)
print("IDENTIFICATION: ZONES HAUTE DENSITE 'ELLE'")
print("="*80)
print()

# Diviser en paragraphes
paragraphes = text.split('\n\n')

print(f"Total paragraphes: {len(paragraphes)}")
print()

# Analyser densité "elle" par paragraphe
densite_paragraphes = []

for i, para in enumerate(paragraphes):
    if len(para.strip()) < 50:  # Ignorer paragraphes très courts
        continue

    mots = para.split()
    nb_mots = len(mots)
    nb_elle = len(re.findall(r'\belle\b', para, re.IGNORECASE))

    if nb_elle > 0:
        densite = (nb_elle / nb_mots) * 100
        densite_paragraphes.append((i, nb_elle, nb_mots, densite, para[:200]))

# Trier par nombre absolu de "elle"
densite_paragraphes.sort(key=lambda x: x[1], reverse=True)

print("TOP 20 PARAGRAPHES PAR NOMBRE ABSOLU DE 'ELLE':")
print()
print(f"{'#':<5} {'Elle':<6} {'Mots':<6} {'Densité':<8} {'Début...'}")
print("-"*80)

for i, (idx, nb_elle, nb_mots, densite, debut) in enumerate(densite_paragraphes[:20], 1):
    debut_clean = debut.replace('\n', ' ').strip()[:60]
    print(f"{i:<5} {nb_elle:<6} {nb_mots:<6} {densite:6.1f}%  {debut_clean}...")

print()
print("="*80)
print("RECOMMANDATIONS:")
print("="*80)
print()
print("Les 20 paragraphes ci-dessus contiennent le plus de 'elle'.")
print("Reformuler ces paragraphes avec:")
print("  1. Fusion de phrases (éliminer sujets répétés)")
print("  2. Constructions participiales sans sujet explicite")
print("  3. Alternance avec désignations (vampire, immortelle, Morwen)")
print()
print(f"Objectif: Reduire de 655 à 220 (-435 'elle')")
print(f"Strategie: Cibler les zones haute densite = impact maximum")
