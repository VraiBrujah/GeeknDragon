#!/bin/bash

echo "=== ANALYSE DES MÉDIAS NON UTILISÉS ==="

# Liste des images webp utilisées
used_webp=(
    "images/webp/avisJoueurFlim2025.webp"
    "images/webp/carte_propriete.webp" 
    "images/webp/cartes_equipement.webp"
    "images/webp/es_tu_game_demo.webp"
    "images/webp/geekndragon_logo_blanc.webp"
    "images/webp/logo.webp"
    "images/webp/Piece/pro/coffre.webp"
    "images/webp/Piece/pro/lot10Piece2-300.webp"
    "images/webp/team_brujah.webp"
    "images/webp/triptyque_fiche.webp"
)

# Liste des vidéos utilisées
used_videos=(
    "videos/compressed/Carte1_compressed.mp4"
    "videos/compressed/cascade_HD_compressed.mp4"
    "videos/compressed/coffreFic_compressed.mp4"
    "videos/compressed/finestugameFLIM2025_compressed.mp4"
    "videos/compressed/fontaine1_compressed.mp4"
    "videos/compressed/fontaine11_compressed.mp4"
    "videos/compressed/fontaine2_compressed.mp4"
    "videos/compressed/fontaine3_compressed.mp4"
    "videos/compressed/fontaine4_compressed.mp4"
    "videos/compressed/leMaireDoneUnePieceDargentFLIM_compressed.mp4"
    "videos/compressed/mage_compressed.mp4"
    "videos/compressed/pileoufaceled2duFLIM2025_compressed.mp4"
)

echo "--- Images webp NON utilisées ---"
find ./images/webp/ -name "*.webp" -type f | while read file; do
    used=false
    for used_file in "${used_webp[@]}"; do
        if [[ "$file" == "./$used_file" ]]; then
            used=true
            break
        fi
    done
    if [[ "$used" == false ]]; then
        echo "$file"
    fi
done

echo ""
echo "--- Vidéos NON utilisées ---"
find ./videos/compressed/ -name "*.mp4" -type f | while read file; do
    used=false
    for used_file in "${used_videos[@]}"; do
        if [[ "$file" == "./$used_file" ]]; then
            used=true
            break
        fi
    done
    if [[ "$used" == false ]]; then
        echo "$file"
    fi
done