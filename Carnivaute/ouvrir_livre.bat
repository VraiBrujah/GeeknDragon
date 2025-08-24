@echo off
chcp 65001 > nul

if exist "output_final\CARNIVAUTE_livre_complet.html" (
    start output_final\CARNIVAUTE_livre_complet.html
) else (
    echo Livre HTML non trouvé - Exécutez generer_livre_complet.bat
    pause
)