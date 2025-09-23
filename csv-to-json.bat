@echo off
echo CONVERSION CSV vers JSON
echo ========================
echo.

php -r "require 'includes/csv-products-manager.php'; $m = new CsvProductsManager(); $r = $m->convertCsvToJson('data/products.csv', 'data/products.json'); echo $r['message']; echo PHP_EOL;"

echo.
echo Verification:
php -r "$d = json_decode(file_get_contents('data/products.json'), true); echo 'Prix: ' . $d['piece-personnalisee']['price'] . chr(8364) . PHP_EOL;"

echo.
echo TERMINE! Appuyez sur une touche...
pause >nul