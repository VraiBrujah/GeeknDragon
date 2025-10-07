#!/bin/bash

echo "=== ANALYSE DÉTAILLÉE DES 20 MODULES ==="
echo ""

# Extraire sections de chaque module
echo "MODULE 1 - MOTEUR DE RÈGLES:"
grep "^### " SONDAGE_REQUIS_ORIA_MVP_V3.md | head -20 | grep -A5 "^### 1\."

echo ""
echo "MODULE 7 - COMMUNICATION:"
grep "^### " SONDAGE_REQUIS_ORIA_MVP_V3.md | grep "^### 7\."

echo ""
echo "MODULE 9 - GESTION DES TÂCHES:"
grep "^### " SONDAGE_REQUIS_ORIA_MVP_V3.md | grep "^### 9\."

echo ""
echo "MODULE 11 - CONGÉS ET ABSENCES:"
grep "^### " SONDAGE_REQUIS_ORIA_MVP_V3.md | grep "^### 11\."

echo ""
echo "MODULE 17 - RECONNAISSANCE (BRAVO):"
grep "^### " SONDAGE_REQUIS_ORIA_MVP_V3.md | grep "^### 17\."

