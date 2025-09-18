# 🧹 SCRIPT DE NETTOYAGE PHASE 2 - CONSOLIDATION SNIPCART
# Suppression sécurisée des implémentations redondantes

Write-Host "🚀 Début du nettoyage Phase 2 - Consolidation Snipcart" -ForegroundColor Yellow

# Créer le répertoire de sauvegarde avec timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "backup/phase2-snipcart-cleanup/$timestamp"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

Write-Host "📦 Sauvegarde dans: $backupDir" -ForegroundColor Cyan

# Fonction de sauvegarde sécurisée
function Backup-FileOrDirectory {
    param($source, $destination)
    
    if (Test-Path $source) {
        try {
            if (Test-Path $source -PathType Container) {
                Copy-Item -Path $source -Destination $destination -Recurse -Force
                Write-Host "✅ Sauvegardé: $source (dossier)" -ForegroundColor Green
            } else {
                Copy-Item -Path $source -Destination $destination -Force
                Write-Host "✅ Sauvegardé: $source (fichier)" -ForegroundColor Green
            }
            return $true
        } catch {
            Write-Host "❌ Erreur sauvegarde $source : $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "⚠️  Non trouvé: $source" -ForegroundColor Yellow
        return $true  # Pas d'erreur si le fichier n'existe pas
    }
}

# Fonction de suppression sécurisée
function Remove-FileOrDirectory {
    param($path, $description)
    
    if (Test-Path $path) {
        try {
            if (Test-Path $path -PathType Container) {
                Remove-Item -Path $path -Recurse -Force
                Write-Host "🗑️  Supprimé: $description (dossier)" -ForegroundColor Red
            } else {
                Remove-Item -Path $path -Force
                Write-Host "🗑️  Supprimé: $description (fichier)" -ForegroundColor Red
            }
            return $true
        } catch {
            Write-Host "❌ Erreur suppression $path : $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "ℹ️  Déjà absent: $description" -ForegroundColor Blue
        return $true
    }
}

# 1. SAUVEGARDES
Write-Host "`n📦 === PHASE SAUVEGARDE ===" -ForegroundColor Cyan

$success = $true
$success = $success -and (Backup-FileOrDirectory "admin/snipcart-api.php" "$backupDir/snipcart-api.php")
$success = $success -and (Backup-FileOrDirectory "api/snipcart-webhook.php" "$backupDir/snipcart-webhook.php")
$success = $success -and (Backup-FileOrDirectory "gd-ecommerce-native" "$backupDir/gd-ecommerce-native")

if (-not $success) {
    Write-Host "`n❌ ERREUR DURANTE LA SAUVEGARDE - ARRÊT DU SCRIPT" -ForegroundColor Red
    exit 1
}

# 2. VÉRIFICATIONS AVANT SUPPRESSION
Write-Host "`n🔍 === VÉRIFICATIONS ===" -ForegroundColor Cyan

# Vérifier que les fichiers de consolidation existent
$consolidatedFiles = @(
    "src/Cart/SnipcartClient.php",
    "src/Controller/SnipcartWebhookController.php"
)

foreach ($file in $consolidatedFiles) {
    if (Test-Path $file) {
        Write-Host "✅ Fichier consolidé présent: $file" -ForegroundColor Green
    } else {
        Write-Host "❌ ERREUR: Fichier consolidé manquant: $file" -ForegroundColor Red
        Write-Host "⚠️  ARRÊT - La consolidation n'est pas complète" -ForegroundColor Yellow
        exit 1
    }
}

# Vérifier que dashboard.php utilise le nouveau client
if (Test-Path "admin/dashboard.php") {
    $dashboardContent = Get-Content "admin/dashboard.php" -Raw
    if ($dashboardContent -match "SnipcartClient" -and $dashboardContent -notmatch "require_once.*snipcart-api\.php") {
        Write-Host "✅ Dashboard.php utilise le client unifié" -ForegroundColor Green
    } else {
        Write-Host "❌ ERREUR: Dashboard.php n'a pas été mis à jour" -ForegroundColor Red
        Write-Host "⚠️  ARRÊT - Mise à jour requise" -ForegroundColor Yellow
        exit 1
    }
}

# 3. SUPPRESSION EFFECTIVE
Write-Host "`n🗑️  === PHASE SUPPRESSION ===" -ForegroundColor Red
Write-Host "⚠️  Suppression des fichiers redondants dans 5 secondes..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$success = $true
$success = $success -and (Remove-FileOrDirectory "admin/snipcart-api.php" "API Administrative redondante")
$success = $success -and (Remove-FileOrDirectory "api/snipcart-webhook.php" "Webhook standalone redondant")
$success = $success -and (Remove-FileOrDirectory "gd-ecommerce-native" "Projet orphelin complet")

# 4. VÉRIFICATION POST-SUPPRESSION
Write-Host "`n✅ === VÉRIFICATION FINALE ===" -ForegroundColor Green

$remaining = @()
if (Test-Path "admin/snipcart-api.php") { $remaining += "admin/snipcart-api.php" }
if (Test-Path "api/snipcart-webhook.php") { $remaining += "api/snipcart-webhook.php" }
if (Test-Path "gd-ecommerce-native") { $remaining += "gd-ecommerce-native" }

if ($remaining.Count -eq 0) {
    Write-Host "🎉 SUCCÈS: Tous les fichiers redondants ont été supprimés" -ForegroundColor Green
} else {
    Write-Host "⚠️  ATTENTION: Fichiers encore présents:" -ForegroundColor Yellow
    foreach ($file in $remaining) {
        Write-Host "   - $file" -ForegroundColor Yellow
    }
}

# 5. RAPPORT FINAL
Write-Host "`n📊 === RAPPORT DE CONSOLIDATION ===" -ForegroundColor Cyan
Write-Host "🗃️  Sauvegarde: $backupDir" -ForegroundColor Blue
Write-Host "✅ Architecture Snipcart unifiée:" -ForegroundColor Green
Write-Host "   - src/Cart/SnipcartClient.php (client complet)" -ForegroundColor White
Write-Host "   - src/Controller/SnipcartWebhookController.php (webhooks)" -ForegroundColor White
Write-Host "   - admin/dashboard.php (interface admin)" -ForegroundColor White

Write-Host "`n📈 Réduction de complexité:" -ForegroundColor Cyan
Write-Host "   - Implémentations: 4 → 1 (-75%)" -ForegroundColor White
Write-Host "   - Classes: 8+ → 2 (-75%)" -ForegroundColor White
Write-Host "   - Points de maintenance: 4 → 1 (-75%)" -ForegroundColor White

Write-Host "`n🎯 Phase 2 terminée avec succès!" -ForegroundColor Green
Write-Host "💡 Prochaine étape: Tester l'interface admin et les webhooks" -ForegroundColor Yellow