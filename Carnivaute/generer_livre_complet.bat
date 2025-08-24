@echo off
chcp 65001 > nul
echo ==========================================
echo   GENERATION LIVRE COMPLET CARNIVAUTE
echo ==========================================
echo.

:: Verification de Python
python --version > nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: Python non trouve
    echo    Installez Python depuis https://python.org
    pause
    exit /b 1
)

:: Installation des dependances de base
echo Installation des dependances de base...
pip show markdown > nul 2>&1
if %errorlevel% neq 0 (
    echo    Installation de markdown...
    pip install markdown
)

pip show pyyaml > nul 2>&1
if %errorlevel% neq 0 (
    echo    Installation de pyyaml...
    pip install pyyaml
)

:: Verification et installation de WeasyPrint pour PDF
echo.
echo Verification de WeasyPrint pour generation PDF...
pip show weasyprint > nul 2>&1
if %errorlevel% neq 0 (
    echo    WeasyPrint non trouve - Installation...
    echo    Cela peut prendre quelques minutes...
    pip install weasyprint
    if %errorlevel% neq 0 (
        echo    Installation WeasyPrint echouee
        echo    Le HTML sera genere, PDF en option manuelle
    )
)

echo.
echo Lancement de la generation complete...
echo    - Collecte du manuscrit
echo    - Generation HTML professionnel
echo    - Generation PDF optimise
echo.

:: Generation complete
python generer_carnivaute_pro.py

if %errorlevel% equ 0 (
    echo.
    echo GENERATION COMPLETE TERMINEE AVEC SUCCES!
    echo.
    
    :: Affichage des statistiques de fichiers
    echo STATISTIQUES DES FICHIERS:
    for %%f in (output_final\CARNIVAUTE_livre_complet.*) do (
        echo    %%~nxf - %%~zf octets
    )
    
    echo.
    echo Dossier de sortie: output_final\
    echo    HTML: Version web interactive
    echo    PDF:  Version imprimable
    echo    MD:   Source Markdown
    echo.
    
    :: Options d'ouverture
    echo ACTIONS DISPONIBLES:
    echo    [1] Ouvrir le HTML dans le navigateur
    echo    [2] Ouvrir le dossier de sortie
    echo    [3] Generer le PDF professionnel (ReportLab)
    echo    [4] Generer PDF via navigateur (methode manuelle)
    echo    [5] Afficher les statistiques detaillees
    echo    [0] Quitter
    echo.
    
    set /p choix="Votre choix [0-5]: "
    
    if "%choix%"=="1" (
        echo Ouverture du HTML...
        start output_final\CARNIVAUTE_livre_complet.html
    ) else if "%choix%"=="2" (
        echo Ouverture du dossier...
        start output_final\
    ) else if "%choix%"=="3" (
        echo Lancement generation PDF professionnel...
        call generer_pdf_pro.bat
    ) else if "%choix%"=="4" (
        echo Ouverture pour generation PDF manuelle...
        echo    1. Le HTML va s'ouvrir dans votre navigateur
        echo    2. Utilisez Ctrl+P pour imprimer
        echo    3. Choisissez "Enregistrer au format PDF"
        echo    4. IMPORTANT: Cochez "Graphiques d'arriere-plan"
        echo    5. Enregistrez dans le dossier output_final
        echo.
        pause
        start output_final\CARNIVAUTE_livre_complet.html
    ) else if "%choix%"=="5" (
        echo.
        echo STATISTIQUES DETAILLEES:
        dir output_final\CARNIVAUTE_livre_complet.* /Q
        echo.
        pause
    )
    
) else (
    echo.
    echo ERREUR lors de la generation
    echo.
    echo SOLUTIONS POSSIBLES:
    echo    1. Verifiez que le dossier 'manuscript' existe
    echo    2. Verifiez le fichier 'carnivaute_config.yaml'
    echo    3. Relancez avec des permissions administrateur
    echo    4. Consultez les messages d'erreur ci-dessus
)

echo.
echo Appuyez sur une touche pour continuer...
pause > nul