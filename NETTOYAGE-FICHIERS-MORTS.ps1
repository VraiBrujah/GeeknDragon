# NETTOYAGE-FICHIERS-MORTS.ps1
# Script de suppression sécurisée des fichiers morts - GeeknDragon
# Exécution par phases avec validation

param(
    [switch]$DryRun = $false,
    [switch]$Force = $false,
    [string]$Phase = "all"
)

Write-Host ""
Write-Host "🗑️  NETTOYAGE FICHIERS MORTS - GEEKNDRAGON" -ForegroundColor Red
Write-Host "==========================================" -ForegroundColor Red
Write-Host ""
Write-Host "📍 Répertoire: $(Get-Location)" -ForegroundColor Gray
Write-Host "🎛️  Mode: $(if($DryRun){'SIMULATION'}else{'RÉEL'})" -ForegroundColor Yellow
Write-Host ""

$filesRemoved = 0
$totalSize = 0
$errors = @()

function Remove-SafeFile {
    param(
        [string]$FilePath,
        [string]$Description,
        [string]$Category
    )
    
    if (Test-Path $FilePath) {
        $item = Get-Item $FilePath
        $size = if ($item.PSIsContainer) { 
            (Get-ChildItem $FilePath -Recurse -Force | Measure-Object -Property Length -Sum).Sum 
        } else { 
            $item.Length 
        }
        
        $sizeKB = [math]::Round($size / 1KB, 1)
        
        if ($DryRun) {
            Write-Host "  📁 $Description ($sizeKB KB)" -ForegroundColor Yellow
        } else {
            try {
                if ($item.PSIsContainer) {
                    Remove-Item $FilePath -Recurse -Force
                } else {
                    Remove-Item $FilePath -Force
                }
                Write-Host "  ✅ Supprimé: $Description ($sizeKB KB)" -ForegroundColor Green
                $script:filesRemoved++
                $script:totalSize += $size
            } catch {
                $script:errors += "❌ Erreur sur $FilePath : $($_.Exception.Message)"
                Write-Host "  ❌ Erreur: $Description" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "  ⚪ Non trouvé: $FilePath" -ForegroundColor Gray
    }
}

function Confirm-Phase {
    param([string]$PhaseName)
    
    if ($Force) { return $true }
    
    $response = Read-Host "Continuer avec la phase $PhaseName ? (o/N)"
    return ($response -eq 'o' -or $response -eq 'O' -or $response -eq 'oui')
}

# PHASE 1 : JavaScript Obsolète
if ($Phase -eq "all" -or $Phase -eq "js") {
    Write-Host "🟥 PHASE 1 : JavaScript Obsolète" -ForegroundColor Red
    Write-Host "===============================" -ForegroundColor Red
    
    if (Confirm-Phase "JavaScript Obsolète") {
        Remove-SafeFile "js/coin-lots-recommender.js" "JavaScript obsolète déclaré" "js"
        
        # Vérification des fichiers UMD redondants
        if (-not $DryRun) {
            Write-Host "⚠️  Vérification des dépendances vendor..." -ForegroundColor Yellow
            
            if (Test-Path "js/vendor.bundle.min.js") {
                $vendorContent = Get-Content "js/vendor.bundle.min.js" -Raw
                
                if ($vendorContent -match "Fancybox" -and $vendorContent -match "Swiper") {
                    Write-Host "  ✅ Fancybox et Swiper détectés dans vendor.bundle" -ForegroundColor Green
                    Remove-SafeFile "js/fancybox.umd.js" "Fancybox UMD redondant" "js"
                    Remove-SafeFile "js/swiper-bundle.min.js" "Swiper bundle redondant" "js"
                } else {
                    Write-Host "  ⚠️  ATTENTION: Dépendances manquantes dans vendor.bundle" -ForegroundColor Red
                    Write-Host "     → Conservation des fichiers UMD par sécurité" -ForegroundColor Yellow
                }
            }
        } else {
            Write-Host "  📁 js/fancybox.umd.js (142 KB) - À vérifier" -ForegroundColor Yellow
            Write-Host "  📁 js/swiper-bundle.min.js (140 KB) - À vérifier" -ForegroundColor Yellow
        }
    }
    Write-Host ""
}

# PHASE 2 : Tests & Debug
if ($Phase -eq "all" -or $Phase -eq "test") {
    Write-Host "🟠 PHASE 2 : Tests & Debug" -ForegroundColor DarkYellow
    Write-Host "==========================" -ForegroundColor DarkYellow
    
    if (Confirm-Phase "Tests & Debug") {
        # Tests HTML/PHP
        Remove-SafeFile "test-calculator-validation.html" "Test calculateur HTML" "test"
        Remove-SafeFile "test-cmp-implementation.html" "Test CMP HTML" "test"  
        Remove-SafeFile "test-dynamic-calculator.php" "Test calculateur PHP" "test"
        Remove-SafeFile "test-i18n.php" "Test internationalisation" "test"
        
        # Tests JavaScript
        Remove-SafeFile "test-simple-fix.js" "Test correction JS" "test"
        Remove-SafeFile "test-coin-lot-optimizer-analysis.js" "Test analyse optimizer" "test"
        Remove-SafeFile "validation-finale.js" "Validation finale" "test"
        Remove-SafeFile "quick-test.js" "Test rapide" "test"
        
        # Debug
        Remove-SafeFile "debug-json-structure.php" "Debug structure JSON" "debug"
        Remove-SafeFile "debug_key.php" "Debug clés" "debug"
        Remove-SafeFile "extreme-test.json" "Test extrême JSON" "debug"
        
        # Scripts PowerShell
        Remove-SafeFile "convert-test.ps1" "Script test conversion" "test"
        Remove-SafeFile "test-video-compression.ps1" "Script test vidéo" "test"
    }
    Write-Host ""
}

# PHASE 3 : Backups
if ($Phase -eq "all" -or $Phase -eq "backup") {
    Write-Host "🟡 PHASE 3 : Fichiers Backup" -ForegroundColor Yellow
    Write-Host "============================" -ForegroundColor Yellow
    
    Write-Host "⚠️  ATTENTION: Cette phase supprime les backups automatiques" -ForegroundColor Red
    Write-Host "   Assurez-vous d'avoir vos propres sauvegardes !" -ForegroundColor Red
    
    if (Confirm-Phase "Backups (DESTRUCTEUR)") {
        # Backups data
        Get-ChildItem "data/*.backup.*" -ErrorAction SilentlyContinue | ForEach-Object {
            Remove-SafeFile $_.FullName "Backup data $(Split-Path $_.Name -Leaf)" "backup"
        }
        
        # Backups lang
        Get-ChildItem "lang/*.backup*" -ErrorAction SilentlyContinue | ForEach-Object {
            Remove-SafeFile $_.FullName "Backup lang $(Split-Path $_.Name -Leaf)" "backup"
        }
        
        # Backups divers
        Get-ChildItem "*.backup*" -ErrorAction SilentlyContinue | ForEach-Object {
            Remove-SafeFile $_.FullName "Backup $(Split-Path $_.Name -Leaf)" "backup"
        }
        
        # Dossiers d'archives
        Remove-SafeFile "assets-a-venir/organise/archives" "Archives développement" "backup"
    }
    Write-Host ""
}

# PHASE 4 : Divers & Legacy
if ($Phase -eq "all" -or $Phase -eq "legacy") {
    Write-Host "🟢 PHASE 4 : Legacy & Divers" -ForegroundColor Green
    Write-Host "============================" -ForegroundColor Green
    
    if (Confirm-Phase "Legacy & Divers") {
        Remove-SafeFile "partials/testimonials-old.php" "Témoignages anciens" "legacy"
        Remove-SafeFile "media/ui/placeholders" "Dossier placeholders" "legacy"
        
        # Templates vides
        if (Test-Path "templates" -PathType Container) {
            $templateCount = (Get-ChildItem "templates" -Force).Count
            if ($templateCount -eq 0) {
                Remove-SafeFile "templates" "Dossier templates vide" "legacy"
            } else {
                Write-Host "  ⚠️  templates/ contient $templateCount éléments - Conservation" -ForegroundColor Yellow
            }
        }
    }
    Write-Host ""
}

# RÉSULTATS
Write-Host "📊 RÉSULTATS DU NETTOYAGE" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

if ($DryRun) {
    Write-Host "🔍 Mode SIMULATION - Aucun fichier supprimé" -ForegroundColor Cyan
    Write-Host "   Pour exécution réelle: .\NETTOYAGE-FICHIERS-MORTS.ps1"
} else {
    Write-Host "📁 Fichiers supprimés: $filesRemoved" -ForegroundColor White
    $totalSizeMB = [math]::Round($totalSize / 1MB, 2)
    Write-Host "💾 Espace libéré: $totalSizeMB MB" -ForegroundColor White
    
    if ($errors.Count -gt 0) {
        Write-Host ""
        Write-Host "⚠️  ERREURS RENCONTRÉES:" -ForegroundColor Red
        $errors | ForEach-Object { Write-Host "   $_" -ForegroundColor Red }
    }
}

Write-Host ""
Write-Host "🧪 VALIDATION POST-NETTOYAGE RECOMMANDÉE" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "1. Tester le serveur: php -S localhost:8000" -ForegroundColor Gray
Write-Host "2. Vérifier les pages principales" -ForegroundColor Gray  
Write-Host "3. Tester le convertisseur de monnaie" -ForegroundColor Gray
Write-Host "4. Valider Snipcart et l'e-commerce" -ForegroundColor Gray
Write-Host "5. Commit si tout fonctionne" -ForegroundColor Gray

Write-Host ""
if ($DryRun) {
    Write-Host "▶️  PROCHAINE ÉTAPE: .\NETTOYAGE-FICHIERS-MORTS.ps1 -Phase js" -ForegroundColor Yellow
} else {
    Write-Host "✅ Nettoyage terminé ! Testez votre site maintenant." -ForegroundColor Green
}

# Pause pour lecture
Read-Host "Appuyez sur Entrée pour fermer"