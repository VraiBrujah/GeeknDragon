@echo off
chcp 65001 >nul

echo.
echo ================================================
echo   🔄 CONVERSION CSV vers JSON - GeeknDragon
echo ================================================
echo.

:: Vérification de PHP
php --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERREUR: PHP n'est pas installé ou pas dans le PATH
    echo    Installez PHP et ajoutez-le au PATH système
    pause
    exit /b 1
)

:: Vérification du fichier CSV
if not exist "data\products.csv" (
    echo ❌ ERREUR: Le fichier data\products.csv n'existe pas
    echo    Générez-le d'abord avec l'interface web admin-products.php
    pause
    exit /b 1
)

echo ✅ PHP détecté
echo ✅ Fichier CSV trouvé
echo.

:: VALIDATION DU CSV
echo 🔍 ÉTAPE 1: Validation du CSV...
php -r "require 'includes/csv-products-manager.php'; $m = new CsvProductsManager(); $r = $m->validateCsv('data/products.csv'); echo $r['success'] ? 'VALIDE' : 'ERREUR: ' . $r['message']; if(isset($r['errors'])) foreach($r['errors'] as $e) echo PHP_EOL . '   - ' . $e;"
if errorlevel 1 (
    echo.
    echo ❌ VALIDATION ÉCHOUÉE - Corrigez le CSV avant de continuer
    pause
    exit /b 1
)
echo ✅ CSV VALIDE

echo.
echo ⚠️  ATTENTION: Cette opération va remplacer data\products.json
echo    Une sauvegarde sera créée automatiquement
echo.
set /p confirm="Confirmer la conversion ? (tapez OUI en majuscules) : "
if not "%confirm%"=="OUI" (
    echo Conversion annulée.
    pause
    exit /b 0
)

echo.
echo 🔄 ÉTAPE 2: Conversion CSV vers JSON...
php -r "require 'includes/csv-products-manager.php'; $m = new CsvProductsManager(); $r = $m->convertCsvToJson('data/products.csv', 'data/products.json'); echo $r['success'] ? 'SUCCÈS: ' . $r['message'] : 'ERREUR: ' . $r['message']; exit($r['success'] ? 0 : 1);"
if errorlevel 1 (
    echo.
    echo ❌ CONVERSION ÉCHOUÉE
    pause
    exit /b 1
)

echo.
echo 🎉 CONVERSION RÉUSSIE !
echo.

:: VÉRIFICATION IMMÉDIATE
echo 🔍 ÉTAPE 3: Vérification des données...
php -r "$d = json_decode(file_get_contents('data/products.json'), true); echo 'Prix piece-personnalisee: ' . $d['piece-personnalisee']['price'] . '€' . PHP_EOL; echo 'Modifié le: ' . date('H:i:s', filemtime('data/products.json')) . PHP_EOL; echo 'Total produits: ' . count($d);"

echo.
echo 💡 POUR VOIR LES CHANGEMENTS SUR LE SITE:
echo    1. Ouvrez votre navigateur en NAVIGATION PRIVÉE
echo    2. Allez sur http://localhost/boutique.php
echo    3. Si ça ne marche pas: redémarrez votre serveur web
echo.
echo ✅ TERMINÉ - Appuyez sur une touche pour fermer
pause
exit /b 0