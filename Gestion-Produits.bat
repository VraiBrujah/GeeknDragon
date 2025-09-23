@echo off
chcp 65001 >nul

:: Script de lancement simple pour la gestion des produits
cd /d "%~dp0"

echo.
echo 🚀 Lancement de la gestion des produits GeeknDragon
echo.
echo Choisissez votre outil préféré :
echo.
echo   1. 📋 Script Batch simple (update-products.bat)
echo   2. 💻 Script PowerShell avancé (Update-Products.ps1)
echo   3. 🌐 Interface web d'administration
echo.
set /p choice="Votre choix (1-3) : "

if "%choice%"=="1" (
    call update-products.bat
) else if "%choice%"=="2" (
    powershell -ExecutionPolicy Bypass -File "Update-Products.ps1"
) else if "%choice%"=="3" (
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