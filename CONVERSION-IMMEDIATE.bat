@echo off
title CONVERSION CSV vers JSON
cls

echo.
echo  ████████████████████████████████████████████████
echo  █                                              █
echo  █        CONVERSION CSV vers JSON              █
echo  █              GeeknDragon                     █
echo  █                                              █
echo  ████████████████████████████████████████████████
echo.

echo [ETAPE 1] Lecture du CSV...
php -r "echo 'Prix dans CSV: '; $f=fopen('data/products.csv','r'); $h=fgetcsv($f,0,';'); $r=fgetcsv($f,0,';'); echo $r[3].'euros'; fclose($f);"
echo.

echo [ETAPE 2] Conversion...
php -r "require 'includes/csv-products-manager.php'; $m=new CsvProductsManager(); $r=$m->convertCsvToJson('data/products.csv','data/products.json'); echo $r['message'];"
echo.

echo [ETAPE 3] Verification...
php -r "$d=json_decode(file_get_contents('data/products.json'),true); echo 'Prix dans JSON: '.$d['piece-personnalisee']['price'].'euros';"
echo.

echo.
echo ████████████████████████████████████████████████
echo █               TERMINE !                      █
echo █  Le JSON est maintenant mis a jour          █
echo █  Rechargez votre site web (CTRL+F5)         █
echo ████████████████████████████████████████████████
echo.
echo Appuyez sur une touche pour fermer...
pause >nul