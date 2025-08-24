@echo off
chcp 65001 > nul
echo ==========================================
echo   EXPORTATEUR COMPLET CARNIVAUTE
echo ==========================================
echo.

:: Verification source
if not exist "output_final\CARNIVAUTE_livre_complet.md" (
    echo ERREUR: Livre non genere
    echo    Executez d'abord: generer_livre_complet.bat
    pause
    exit /b 1
)

echo Source trouvee
for %%f in (output_final\CARNIVAUTE_livre_complet.md) do echo    Taille: %%~zf octets

echo.
echo ETAPE 1: Export Markdown optimise
echo    - Correction des caracteres Unicode
echo    - Reparation des tableaux
echo    - Structure optimisee pour ToC
echo.

:: Export Markdown propre
python exportateur_markdown_propre.py

echo.
echo ETAPE 2: Export HTML professionnel
echo    - Design livre de cuisine adapte
echo    - CSS optimise pour impression
echo    - Table des matieres interactive
echo.

:: Export HTML professionnel
python exportateur_html_professionnel.py

if %errorlevel% equ 0 (
    echo.
    echo EXPORTS TERMINES AVEC SUCCES!
    echo.
    
    echo FICHIERS GENERES:
    if exist "output_final\CARNIVAUTE_export_propre.md" (
        echo    Markdown optimise cree
        for %%f in (output_final\CARNIVAUTE_export_propre.md) do echo       Taille: %%~zf octets
    )
    if exist "output_final\CARNIVAUTE_export_professionnel.html" (
        echo    HTML professionnel cree
        for %%f in (output_final\CARNIVAUTE_export_professionnel.html) do echo       Taille: %%~zf octets
    )
    
    echo.
    echo ACTIONS DISPONIBLES:
    echo    [1] Ouvrir dossier de sortie
    echo    [2] Ouvrir HTML dans navigateur
    echo    [3] Ouvrir Markdown avec Typora
    echo    [4] Ouvrir Markdown avec MarkText  
    echo    [5] Copier Markdown pour conversion en ligne
    echo    [6] Imprimer HTML en PDF (via navigateur)
    echo    [0] Quitter
    echo.
    
    set /p choix="Votre choix [0-6]: "
    
    if "%choix%"=="1" (
        start output_final\
    ) else if "%choix%"=="2" (
        start output_final\CARNIVAUTE_export_professionnel.html 2>nul || echo HTML non trouve
    ) else if "%choix%"=="3" (
        start typora "output_final\CARNIVAUTE_export_propre.md" 2>nul || echo Typora non trouve - installez depuis typora.io
    ) else if "%choix%"=="4" (
        start marktext "output_final\CARNIVAUTE_export_propre.md" 2>nul || echo MarkText non trouve - installez depuis github.com/marktext/marktext
    ) else if "%choix%"=="5" (
        type "output_final\CARNIVAUTE_export_propre.md" | clip
        echo Markdown copie dans le presse-papiers
        echo Collez sur: markdowntopdf.com ou dillinger.io
        pause
    ) else if "%choix%"=="6" (
        echo Ouverture pour impression PDF...
        echo    1. Le HTML va s'ouvrir dans votre navigateur
        echo    2. Utilisez Ctrl+P pour imprimer
        echo    3. Choisissez "Enregistrer au format PDF"
        echo    4. IMPORTANT: Cochez "Graphiques d'arriere-plan"
        echo    5. Enregistrez avec le nom "CARNIVAUTE.pdf"
        echo.
        pause
        start output_final\CARNIVAUTE_export_professionnel.html
    )
)
) else (
    echo ERREUR lors de l'export
)

echo.
pause