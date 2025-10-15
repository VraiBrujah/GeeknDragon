#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script de nettoyage du projet Geek & Dragon

.DESCRIPTION
    Supprime les fichiers temporaires, backups et autres fichiers inutiles
    créés pendant le développement et les corrections de bugs.

.AUTHOR
    Brujah

.VERSION
    1.0.0
#>

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🧹 NETTOYAGE PROJET - GEEK & DRAGON" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$itemsToClean = @()
$totalSize = 0

# Fonction pour ajouter un élément à nettoyer
function Add-CleanItem {
    param(
        [string]$Path,
        [string]$Description
    )

    if (Test-Path $Path) {
        $item = Get-Item $Path
        $size = if ($item.PSIsContainer) {
            (Get-ChildItem $Path -Recurse | Measure-Object -Property Length -Sum).Sum
        } else {
            $item.Length
        }

        $script:itemsToClean += [PSCustomObject]@{
            Path = $Path
            Description = $Description
            Size = $size
            SizeFormatted = "{0:N2} KB" -f ($size / 1KB)
        }

        $script:totalSize += $size
    }
}

Write-Host "📋 Analyse des fichiers à nettoyer..." -ForegroundColor Yellow
Write-Host ""

# 1. Fichiers backup aide-jeux.php
Add-CleanItem "aide-jeux.php.backup" "Backup initial aide-jeux.php"
Add-CleanItem "aide-jeux.php.backup2" "Backup secondaire aide-jeux.php"

# 2. Scripts Python temporaires de correction
Add-CleanItem "scripts/add-data-i18n-attributes.py" "Script ajout data-i18n (déjà appliqué)"
Add-CleanItem "scripts/fix-hardcoded-french-texts.py" "Script correction textes français (déjà appliqué)"

# 3. Fichiers de couverture de tests (si présents)
Add-CleanItem "coverage" "Dossier couverture tests"

# 4. Cache npm (optionnel, décommenter si nécessaire)
# Add-CleanItem "node_modules/.cache" "Cache npm"

# 5. Logs temporaires
Add-CleanItem "npm-debug.log" "Log debug npm"
Add-CleanItem "yarn-debug.log" "Log debug yarn"
Add-CleanItem "yarn-error.log" "Log erreur yarn"

# Afficher résumé
if ($itemsToClean.Count -eq 0) {
    Write-Host "✅ Aucun fichier à nettoyer - Projet déjà propre!" -ForegroundColor Green
    Write-Host ""
    exit 0
}

Write-Host "Éléments trouvés:" -ForegroundColor White
Write-Host ""

foreach ($item in $itemsToClean) {
    Write-Host "  📁 $($item.Description)" -ForegroundColor Gray
    Write-Host "     $($item.Path) ($($item.SizeFormatted))" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "Taille totale à libérer: " -NoNewline -ForegroundColor White
Write-Host ("{0:N2} MB" -f ($totalSize / 1MB)) -ForegroundColor Yellow
Write-Host ""

# Demander confirmation
$confirmation = Read-Host "Voulez-vous supprimer ces fichiers? (O/N)"

if ($confirmation -ne 'O' -and $confirmation -ne 'o') {
    Write-Host ""
    Write-Host "❌ Nettoyage annulé par l'utilisateur" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "🗑️  Suppression en cours..." -ForegroundColor Yellow
Write-Host ""

$deletedCount = 0
$deletedSize = 0

foreach ($item in $itemsToClean) {
    try {
        if (Test-Path $item.Path) {
            Remove-Item $item.Path -Recurse -Force -ErrorAction Stop
            Write-Host "  ✅ Supprimé: $($item.Path)" -ForegroundColor Green
            $deletedCount++
            $deletedSize += $item.Size
        }
    }
    catch {
        Write-Host "  ❌ Erreur: $($item.Path) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "📊 RÉSUMÉ DU NETTOYAGE" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Fichiers supprimés: " -NoNewline -ForegroundColor White
Write-Host "$deletedCount / $($itemsToClean.Count)" -ForegroundColor Green
Write-Host "Espace libéré: " -NoNewline -ForegroundColor White
Write-Host ("{0:N2} MB" -f ($deletedSize / 1MB)) -ForegroundColor Green
Write-Host ""
Write-Host "✅ Nettoyage terminé avec succès!" -ForegroundColor Green
Write-Host ""
