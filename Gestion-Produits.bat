@echo off
chcp 65001 >nul

:: Script de lancement simple pour la gestion des produits
cd /d "%~dp0"

echo.
echo 🚀 Lancement de la gestion des produits GeeknDragon
echo.
echo Choisissez votre outil préféré :
echo.
echo   1. 🔄 CONVERSION SIMPLE CSV vers JSON (convert-csv.bat)
echo   2. 💻 Conversion PowerShell (Convert-CSV.ps1)
echo   3. 📋 Script complet avec menu (update-products.bat)
echo   4. 🌐 Interface web d'administration
echo.
set /p choice="Votre choix (1-4) : "

if "%choice%"=="1" (
    call convert-csv.bat
) else if "%choice%"=="2" (
    powershell -ExecutionPolicy Bypass -File "Convert-CSV.ps1"
) else if "%choice%"=="3" (
    call update-products.bat
) else if "%choice%"=="4" (
    echo.
    echo 🌐 Ouverture de l'interface d'administration...
    echo    URL : http://localhost/admin-products.php
    echo    Mot de passe : geekndragon2024
    echo.
    start "" "http://localhost/admin-products.php"
) else (
    echo Choix invalide
    pause
)