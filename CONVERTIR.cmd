@echo off
echo === CONVERSION CSV vers JSON ===
echo.
powershell -Command "php convert-products.php"
echo.
echo Conversion terminee !
pause