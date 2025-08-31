@echo off
echo ====================================
echo Migration des fichiers musicaux
echo Le Coffre-fort oublie
echo ====================================

set SOURCE=C:\Users\Brujah\Documents\GitHub\GeeknDragon\musique
set DEST=%SOURCE%\campagne\le_coffre_fort_oublie

echo.
echo Creation de la structure de dossiers...
mkdir "%DEST%" 2>nul
mkdir "%DEST%\acte1" 2>nul
mkdir "%DEST%\acte2" 2>nul
mkdir "%DEST%\acte2\combat" 2>nul
mkdir "%DEST%\acte3" 2>nul
mkdir "%DEST%\acte3\dragon_boss" 2>nul

echo.
echo Copie des fichiers generaux...
if exist "%SOURCE%\01 - L'Aurore Céleste.mp3" (
    copy "%SOURCE%\01 - L'Aurore Céleste.mp3" "%DEST%\" >nul
    echo ✓ 01 - L'Aurore Céleste.mp3
)
if exist "%SOURCE%\08 - Héros de Verdure.mp3" (
    copy "%SOURCE%\08 - Héros de Verdure.mp3" "%DEST%\" >nul
    echo ✓ 08 - Héros de Verdure.mp3
)
if exist "%SOURCE%\L'Écho des Donjons.mp3" (
    copy "%SOURCE%\L'Écho des Donjons.mp3" "%DEST%\" >nul
    echo ✓ L'Écho des Donjons.mp3
)
if exist "%SOURCE%\Agdon.mp3" (
    copy "%SOURCE%\Agdon.mp3" "%DEST%\" >nul
    echo ✓ Agdon.mp3
)

echo.
echo Copie vers Acte 1...
if exist "%SOURCE%\L'Écho des Donjons.mp3" (
    copy "%SOURCE%\L'Écho des Donjons.mp3" "%DEST%\acte1\" >nul
    echo ✓ L'Écho des Donjons.mp3 → acte1
)
if exist "%SOURCE%\boutique\L'Épopée du Donjon.mp3" (
    copy "%SOURCE%\boutique\L'Épopée du Donjon.mp3" "%DEST%\acte1\" >nul
    echo ✓ L'Épopée du Donjon.mp3 → acte1
)
if exist "%SOURCE%\boutique\La Ballade du Donjon Perdu.mp3" (
    copy "%SOURCE%\boutique\La Ballade du Donjon Perdu.mp3" "%DEST%\acte1\" >nul
    echo ✓ La Ballade du Donjon Perdu.mp3 → acte1
)
if exist "%SOURCE%\boutique\La Légende du Donjon Perdu.mp3" (
    copy "%SOURCE%\boutique\La Légende du Donjon Perdu.mp3" "%DEST%\acte1\" >nul
    echo ✓ La Légende du Donjon Perdu.mp3 → acte1
)

echo.
echo Copie vers Acte 2...
if exist "%SOURCE%\guerre\Eywa's Whisper.mp3" (
    copy "%SOURCE%\guerre\Eywa's Whisper.mp3" "%DEST%\acte2\" >nul
    echo ✓ Eywa's Whisper.mp3 → acte2
)
if exist "%SOURCE%\guerre\Eywa's Whisper (1).mp3" (
    copy "%SOURCE%\guerre\Eywa's Whisper (1).mp3" "%DEST%\acte2\" >nul
    echo ✓ Eywa's Whisper (1).mp3 → acte2
)
if exist "%SOURCE%\boutique\danse des pieces.mp3" (
    copy "%SOURCE%\boutique\danse des pieces.mp3" "%DEST%\acte2\" >nul
    echo ✓ danse des pieces.mp3 → acte2
)
if exist "%SOURCE%\08 - Héros de Verdure.mp3" (
    copy "%SOURCE%\08 - Héros de Verdure.mp3" "%DEST%\acte2\" >nul
    echo ✓ 08 - Héros de Verdure.mp3 → acte2
)

echo.
echo Copie vers Combat spécialisé...
if exist "%SOURCE%\guerre\Eywa's Whisper.mp3" (
    copy "%SOURCE%\guerre\Eywa's Whisper.mp3" "%DEST%\acte2\combat\" >nul
    echo ✓ Eywa's Whisper.mp3 → combat
)
if exist "%SOURCE%\guerre\Eywa's Whisper (1).mp3" (
    copy "%SOURCE%\guerre\Eywa's Whisper (1).mp3" "%DEST%\acte2\combat\" >nul
    echo ✓ Eywa's Whisper (1).mp3 → combat
)

echo.
echo Copie vers Acte 3...
if exist "%SOURCE%\Agdon.mp3" (
    copy "%SOURCE%\Agdon.mp3" "%DEST%\acte3\" >nul
    echo ✓ Agdon.mp3 → acte3
)
if exist "%SOURCE%\01 - L'Aurore Céleste.mp3" (
    copy "%SOURCE%\01 - L'Aurore Céleste.mp3" "%DEST%\acte3\" >nul
    echo ✓ 01 - L'Aurore Céleste.mp3 → acte3
)

echo.
echo Copie vers Boss final...
if exist "%SOURCE%\Agdon.mp3" (
    copy "%SOURCE%\Agdon.mp3" "%DEST%\acte3\dragon_boss\" >nul
    echo ✓ Agdon.mp3 → dragon_boss
)

echo.
echo ====================================
echo Migration terminée avec succès !
echo ====================================
echo Structure créée dans :
echo %DEST%
echo.
echo Le gestionnaire de campagne peut maintenant utiliser
echo la musique contextuelle automatiquement.
echo.
pause