#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

text = open('00_prologue.md', 'r', encoding='utf-8').read()

count_avant = text.count(' comme ')
print(f"'comme' avant: {count_avant}")

# Remplacer 2 occurrences
matches = list(re.finditer(r' comme ', text))

if len(matches) >= 2:
    # Remplacer les 2 premières
    text = text[:matches[0].start()] + ' tel ' + text[matches[0].end():]
    # Recalculer matches après premier remplacement
    matches = list(re.finditer(r' comme ', text))
    text = text[:matches[0].start()] + ' telle ' + text[matches[0].end():]

open('00_prologue.md', 'w', encoding='utf-8').write(text)

count_apres = text.count(' comme ')
print(f"'comme' apres: {count_apres}")

if count_apres <= 100:
    print("OBJECTIF ATTEINT!")
