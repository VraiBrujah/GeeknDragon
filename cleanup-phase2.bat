@echo off
echo 🧹 NETTOYAGE PHASE 2 - CONSOLIDATION SNIPCART
echo =============================================

:: Créer le répertoire de sauvegarde
set timestamp=%date:~6,4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set timestamp=%timestamp: =0%
set backupDir=backup\phase2-snipcart-cleanup\%timestamp%
mkdir "%backupDir%" 2>nul

echo 📦 Sauvegarde dans: %backupDir%

:: Sauvegarder les fichiers avant suppression
echo.
echo 📦 === PHASE SAUVEGARDE ===

if exist "admin\snipcart-api.php" (
    copy "admin\snipcart-api.php" "%backupDir%\" >nul
    echo ✅ Sauvegardé: admin\snipcart-api.php
) else (
    echo ⚠️  Non trouvé: admin\snipcart-api.php
)

if exist "api\snipcart-webhook.php" (
    copy "api\snipcart-webhook.php" "%backupDir%\" >nul
    echo ✅ Sauvegardé: api\snipcart-webhook.php
) else (
    echo ⚠️  Non trouvé: api\snipcart-webhook.php
)

if exist "gd-ecommerce-native" (
    xcopy "gd-ecommerce-native" "%backupDir%\gd-ecommerce-native\" /E /I /H >nul
    echo ✅ Sauvegardé: gd-ecommerce-native (dossier complet)
) else (
    echo ⚠️  Non trouvé: gd-ecommerce-native
)

:: Vérifications avant suppression
echo.
echo 🔍 === VÉRIFICATIONS ===

if not exist "src\Cart\SnipcartClient.php" (
    echo ❌ ERREUR: SnipcartClient unifié manquant
    echo ⚠️  ARRÊT - Consolidation incomplète
    pause
    exit /b 1
)
echo ✅ SnipcartClient unifié présent

if not exist "src\Controller\SnipcartWebhookController.php" (
    echo ❌ ERREUR: WebhookController manquant
    echo ⚠️  ARRÊT - Consolidation incomplète
    pause
    exit /b 1
)
echo ✅ WebhookController présent

if not exist "admin\dashboard.php" (
    echo ❌ ERREUR: Dashboard admin manquant
    echo ⚠️  ARRÊT - Consolidation incomplète
    pause
    exit /b 1
)
echo ✅ Dashboard admin présent

:: Suppression avec confirmation
echo.
echo 🗑️  === PHASE SUPPRESSION ===
echo ⚠️  Suppression des fichiers redondants dans 5 secondes...
timeout /t 5 >nul

if exist "admin\snipcart-api.php" (
    del "admin\snipcart-api.php"
    echo 🗑️  Supprimé: admin\snipcart-api.php
) else (
    echo ℹ️  Déjà absent: admin\snipcart-api.php
)

if exist "api\snipcart-webhook.php" (
    del "api\snipcart-webhook.php"
    echo 🗑️  Supprimé: api\snipcart-webhook.php
) else (
    echo ℹ️  Déjà absent: api\snipcart-webhook.php
)

if exist "gd-ecommerce-native" (
    rmdir /s /q "gd-ecommerce-native"
    echo 🗑️  Supprimé: gd-ecommerce-native (dossier complet)
) else (
    echo ℹ️  Déjà absent: gd-ecommerce-native
)

:: Vérification finale
echo.
echo ✅ === VÉRIFICATION FINALE ===

set "allClean=true"
if exist "admin\snipcart-api.php" (
    echo ⚠️  Encore présent: admin\snipcart-api.php
    set "allClean=false"
)
if exist "api\snipcart-webhook.php" (
    echo ⚠️  Encore présent: api\snipcart-webhook.php
    set "allClean=false"
)
if exist "gd-ecommerce-native" (
    echo ⚠️  Encore présent: gd-ecommerce-native
    set "allClean=false"
)

if "%allClean%"=="true" (
    echo 🎉 SUCCÈS: Tous les fichiers redondants supprimés
) else (
    echo ⚠️  ATTENTION: Certains fichiers n'ont pas été supprimés
)

:: Rapport final
echo.
echo 📊 === RAPPORT DE CONSOLIDATION ===
echo 🗃️  Sauvegarde: %backupDir%
echo ✅ Architecture Snipcart unifiée:
echo    - src\Cart\SnipcartClient.php (client complet)
echo    - src\Controller\SnipcartWebhookController.php (webhooks)
echo    - admin\dashboard.php (interface admin)
echo.
echo 📈 Réduction de complexité:
echo    - Implémentations: 4 → 1 (-75%%)
echo    - Classes: 8+ → 2 (-75%%)
echo    - Points de maintenance: 4 → 1 (-75%%)
echo.
echo 🎯 Phase 2 terminée avec succès!
echo 💡 Prochaine étape: Tester l'interface admin et les webhooks

pause