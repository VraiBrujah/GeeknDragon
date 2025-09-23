@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:start
cls
echo.
echo ============================================
echo   🔄 Mise à jour des produits GeeknDragon
echo ============================================
echo.

:: Vérification de PHP
php --version >nul 2>&1
if errorlevel 1 (
    echo ❌ PHP n'est pas installé ou pas dans le PATH
    echo    Veuillez installer PHP et l'ajouter au PATH système
    echo.
    pause
    exit /b 1
)

:: Vérification des fichiers requis
if not exist "data\products.csv" (
    echo ⚠️  Le fichier data\products.csv n'existe pas
    echo    Génération du fichier CSV initial depuis le JSON...
    echo.
    php scripts\generate-initial-csv.php
    if errorlevel 1 (
        echo ❌ Erreur lors de la génération du CSV initial
        pause
        exit /b 1
    )
    echo.
    echo ✅ Fichier CSV créé avec succès
    echo    Vous pouvez maintenant l'éditer avec Excel/LibreOffice
    echo.
    pause
    goto start
)

echo 📋 Actions disponibles :
echo.
echo   1. 🔍 Valider le fichier CSV
echo   2. 🔄 Convertir CSV vers JSON (REMPLACE products.json)
echo   3. 📤 Exporter JSON vers CSV (pour édition)
echo   4. 🧪 Tester la conversion bidirectionnelle
echo   5. 📝 Ouvrir data\products.csv avec l'éditeur par défaut
echo   6. 🌐 Ouvrir l'interface web d'administration
echo   7. 🔍 Diagnostic du site (vérifier que les changements sont pris en compte)
echo   8. 👋 Quitter
echo.
set /p choice="Choisissez une option (1-8) : "

if "%choice%"=="1" goto validate
if "%choice%"=="2" goto convert
if "%choice%"=="3" goto export
if "%choice%"=="4" goto test
if "%choice%"=="5" goto open
if "%choice%"=="6" goto web
if "%choice%"=="7" goto diagnostic
if "%choice%"=="8" goto exit
echo ❌ Option invalide
pause
goto start

:validate
echo.
echo 🔍 Validation du fichier CSV...
echo.
php -r "
require 'includes/csv-products-manager.php';
$manager = new CsvProductsManager();
$result = $manager->validateCsv('data/products.csv');
echo $result['success'] ? '✅ ' : '❌ ';
echo $result['message'] . PHP_EOL;
if (isset($result['errors'])) {
    foreach ($result['errors'] as $error) {
        echo '   - ' . $error . PHP_EOL;
    }
}
"
echo.
pause
goto start

:convert
echo.
echo ⚠️  ATTENTION : Cette opération va remplacer data\products.json
echo    Une sauvegarde sera créée automatiquement
echo.
set /p confirm="Confirmer la conversion ? (o/N) : "
if /i not "%confirm%"=="o" (
    echo Opération annulée
    echo.
    pause
    goto start
)

echo.
echo 🔄 Conversion CSV vers JSON...
echo.
php -r "
require 'includes/csv-products-manager.php';
$manager = new CsvProductsManager();
$result = $manager->convertCsvToJson('data/products.csv', 'data/products.json');
echo $result['success'] ? '✅ ' : '❌ ';
echo $result['message'] . PHP_EOL;
exit($result['success'] ? 0 : 1);
"
if errorlevel 1 (
    echo.
    echo ❌ Échec de la conversion
    echo.
    pause
    goto start
)

echo.
echo 🎉 Conversion réussie ! Les produits ont été mis à jour.
echo.
echo 💡 Pour voir les changements sur le site :
echo    1. Rechargez les pages du site (Ctrl+F5)
echo    2. Videz le cache du navigateur si nécessaire
echo    3. Redémarrez votre serveur web local si utilisé
echo.
echo 🔗 Testez sur : http://localhost/boutique.php
echo.
pause
goto start

:export
echo.
echo 📤 Export JSON vers CSV...
echo.
php scripts\generate-initial-csv.php
echo.
pause
goto start

:test
echo.
echo 🧪 Test de conversion bidirectionnelle...
echo.
php scripts\test-csv-conversion.php
echo.
pause
goto start

:open
echo.
echo 📝 Ouverture de data\products.csv...
start "" "data\products.csv"
echo.
echo 💡 Après modification :
echo    1. Sauvegardez le fichier au format CSV (avec point-virgule)
echo    2. Relancez ce script et choisissez l'option 2 pour convertir
echo.
pause
goto start

:web
echo.
echo 🌐 Ouverture de l'interface d'administration...
echo    URL : http://localhost/admin-products.php
echo    Mot de passe : geekndragon2024
echo.
start "" "http://localhost/admin-products.php"
echo.
pause
goto start

:diagnostic
echo.
echo 🔍 Diagnostic du site...
echo.
php -r "
echo '🔍 Test des données du site GeeknDragon' . PHP_EOL;
echo '=====================================' . PHP_EOL . PHP_EOL;

echo '1️⃣ Lecture directe de products.json:' . PHP_EOL;
\$data = json_decode(file_get_contents('data/products.json'), true) ?? [];
if (isset(\$data['piece-personnalisee'])) {
    echo '   ✅ Prix de piece-personnalisee: ' . \$data['piece-personnalisee']['price'] . '€' . PHP_EOL;
    echo '   ✅ Customizable: ' . (\$data['piece-personnalisee']['customizable'] ? 'VRAI' : 'FAUX') . PHP_EOL;
} else {
    echo '   ❌ Produit piece-personnalisee introuvable' . PHP_EOL;
}

echo PHP_EOL . '2️⃣ Informations fichier:' . PHP_EOL;
\$jsonPath = 'data/products.json';
\$size = filesize(\$jsonPath);
\$date = date('Y-m-d H:i:s', filemtime(\$jsonPath));
echo '   ✅ Taille: ' . round(\$size / 1024, 2) . ' KB' . PHP_EOL;
echo '   ✅ Dernière modification: ' . \$date . PHP_EOL;

echo PHP_EOL . '3️⃣ Nombre total de produits: ' . count(\$data) . PHP_EOL;
"
echo.
echo 🌐 Si les données sont correctes mais le site n'affiche pas les changements :
echo    1. Videz complètement le cache de votre navigateur
echo    2. Redémarrez votre serveur web local (XAMPP, WAMP, etc.)
echo    3. Vérifiez que vous êtes sur le bon localhost/port
echo    4. Testez en navigation privée
echo.
pause
goto start

:exit
echo.
echo 👋 Au revoir !
echo.
pause
exit /b 0