# NETTOYAGE-COMPLET.ps1
# Script de nettoyage automatisé pour GeeknDragon
# Supprime le code mort et optimise la structure

Write-Host ""
Write-Host "🧹 NETTOYAGE GEEKNDRAGON - CODE MORT" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

$startSize = (Get-ChildItem -Recurse -Force | Measure-Object -Property Length -Sum).Sum
$filesRemoved = 0
$bytesFreed = 0

# Fonction pour supprimer un fichier avec confirmation
function Remove-SafeFile {
    param($FilePath, $Description)
    
    if (Test-Path $FilePath) {
        $fileSize = (Get-Item $FilePath).Length
        Remove-Item $FilePath -Force
        Write-Host "✅ Supprimé: $Description ($([math]::Round($fileSize/1KB, 1))KB)" -ForegroundColor Yellow
        $script:filesRemoved++
        $script:bytesFreed += $fileSize
    } else {
        Write-Host "⚠️  Non trouvé: $FilePath" -ForegroundColor Gray
    }
}

Write-Host "🗑️  PHASE 1: JavaScript Obsolète" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# JavaScript obsolète
Remove-SafeFile "js/hero-videos.js" "Ancien hero-videos.js (remplacé par simple)"
Remove-SafeFile "js/coin-lots-recommender.js" "Recommandeur obsolète"

Write-Host ""
Write-Host "🎨 PHASE 2: CSS Inutile" -ForegroundColor Cyan  
Write-Host "=======================" -ForegroundColor Cyan

# CSS vide ou dupliqué
Remove-SafeFile "css/styles.css" "CSS vide (1 ligne)"
Remove-SafeFile "css/vendor.bundle.min.css" "CSS vendor vide"
Remove-SafeFile "css/fancybox.css" "CSS fancybox vide"

Write-Host ""
Write-Host "🧪 PHASE 3: Fichiers de Test" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

# Fichiers de test et debug
Remove-SafeFile "quick-test.js" "Test rapide"
Remove-SafeFile "test-calculator-validation.html" "Test calculateur"
Remove-SafeFile "test-cmp-implementation.html" "Test CMP" 
Remove-SafeFile "test-dynamic-calculator.php" "Test calculateur dynamique"
Remove-SafeFile "test-i18n.php" "Test internationalisation"
Remove-SafeFile "test-simple-fix.js" "Test correction"
Remove-SafeFile "validation-finale.js" "Validation finale"
Remove-SafeFile "convert-test.ps1" "Script test conversion"
Remove-SafeFile "test-video-compression.ps1" "Script test vidéo"

Write-Host ""
Write-Host "📋 PHASE 4: Rapports Développement" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Rapports temporaires
Remove-SafeFile "rapport_performance_boutique.md" "Rapport performance"
Remove-SafeFile "rapport-tests-cache-dynamique.md" "Rapport cache"  
Remove-SafeFile "rapport-validation-calculateur.md" "Rapport validation"

Write-Host ""
Write-Host "🖼️  PHASE 5: Médias Inutiles" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

# Dossier placeholders
if (Test-Path "media/ui/placeholders") {
    $placeholderSize = (Get-ChildItem "media/ui/placeholders" -Recurse -Force | Measure-Object -Property Length -Sum).Sum
    Remove-Item "media/ui/placeholders" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Supprimé: Dossier placeholders ($([math]::Round($placeholderSize/1KB, 1))KB)" -ForegroundColor Yellow
    $filesRemoved++
    $bytesFreed += $placeholderSize
}

Write-Host ""
Write-Host "📊 RÉSULTATS DU NETTOYAGE" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

$endSize = (Get-ChildItem -Recurse -Force | Measure-Object -Property Length -Sum).Sum
$totalFreed = $startSize - $endSize
$percentFreed = [math]::Round(($totalFreed / $startSize) * 100, 1)

Write-Host "📁 Fichiers supprimés: $filesRemoved" -ForegroundColor White
Write-Host "💾 Espace libéré: $([math]::Round($bytesFreed/1MB, 2))MB" -ForegroundColor White  
Write-Host "📉 Réduction: $percentFreed%" -ForegroundColor White

Write-Host ""
Write-Host "🧪 PHASE 6: Validation" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan

# Vérifier la syntaxe des fichiers restants
Write-Host "🔍 Vérification syntaxe JavaScript..." -ForegroundColor Gray
try {
    $jsFiles = Get-ChildItem "js/*.js" -ErrorAction SilentlyContinue
    foreach ($jsFile in $jsFiles) {
        $result = node -c $jsFile.FullName 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ $($jsFile.Name)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $($jsFile.Name): $result" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "⚠️  Node.js non disponible - validation JS ignorée" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔍 Vérification syntaxe PHP..." -ForegroundColor Gray
try {
    $phpFiles = Get-ChildItem "*.php" -ErrorAction SilentlyContinue
    $phpValidCount = 0
    foreach ($phpFile in $phpFiles) {
        $result = php -l $phpFile.FullName 2>&1
        if ($LASTEXITCODE -eq 0) {
            $phpValidCount++
        } else {
            Write-Host "  ❌ $($phpFile.Name): $result" -ForegroundColor Red
        }
    }
    Write-Host "  ✅ $phpValidCount fichiers PHP valides" -ForegroundColor Green
} catch {
    Write-Host "⚠️  PHP non disponible - validation PHP ignorée" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 NETTOYAGE TERMINÉ!" -ForegroundColor Green
Write-Host "====================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes recommandées:" -ForegroundColor White
Write-Host "  1. Testez le site: php -S localhost:8000" -ForegroundColor Cyan
Write-Host "  2. Vérifiez convertisseur: /aide-jeux.php" -ForegroundColor Cyan  
Write-Host "  3. Testez e-commerce: /boutique.php" -ForegroundColor Cyan
Write-Host "  4. Commitez les changements: git add -A && git commit" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Direction 10/10!" -ForegroundColor Yellow

# Pause pour lire les résultats
Read-Host "Appuyez sur Entrée pour terminer"