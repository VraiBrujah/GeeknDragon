@echo off
echo 🎬 Création automatique des posters pour toutes les vidéos hero...

cd /d "E:\GitHub\GeeknDragon"

REM Vidéos utilisées dans la rotation hero (basé sur index.php ligne 65)
set videos=cascade_HD_compressed fontaine11_compressed Carte1_compressed fontaine3_compressed fontaine2_compressed fontaine1_compressed trip2_compressed

for %%v in (%videos%) do (
    echo.
    echo 📹 Traitement de %%v.mp4...
    
    REM Vérifier si le poster existe déjà
    if exist "media\videos\backgrounds\poster-%%v.webp" (
        echo   ✅ Poster déjà existant : poster-%%v.webp
    ) else (
        echo   🔄 Création du poster : poster-%%v.webp
        ffmpeg -i "media\videos\backgrounds\%%v.mp4" -ss 00:00:01 -vframes 1 -f image2 -update 1 "media\videos\backgrounds\poster-%%v.webp" -y -loglevel quiet
        if exist "media\videos\backgrounds\poster-%%v.webp" (
            echo   ✅ Poster créé avec succès
        ) else (
            echo   ❌ Erreur lors de la création
        )
    )
)

echo.
echo 📊 Résumé des posters créés :
dir "media\videos\backgrounds\poster-*.webp" /b 2>nul
if errorlevel 1 (
    echo ❌ Aucun poster trouvé
) else (
    echo ✅ Posters disponibles listés ci-dessus
)

echo.
echo 🎯 Système de poster hero terminé !
pause