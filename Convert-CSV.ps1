# Script PowerShell simple pour convertir CSV vers JSON
# Usage: Double-clic ou .\Convert-CSV.ps1

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   🔄 CONVERSION CSV vers JSON - GeeknDragon" -ForegroundColor Cyan  
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Vérification PHP
try {
    $null = php --version 2>$null
    Write-Host "✅ PHP détecté" -ForegroundColor Green
} catch {
    Write-Host "❌ ERREUR: PHP non trouvé dans le PATH" -ForegroundColor Red
    Write-Host "   Installez PHP et ajoutez-le au PATH système" -ForegroundColor Yellow
    Read-Host "Appuyez sur Entrée pour fermer"
    exit 1
}

# Vérification fichier CSV
if (!(Test-Path "data\products.csv")) {
    Write-Host "❌ ERREUR: Fichier data\products.csv introuvable" -ForegroundColor Red
    Write-Host "   Générez-le d'abord avec admin-products.php" -ForegroundColor Yellow
    Read-Host "Appuyez sur Entrée pour fermer"
    exit 1
}

Write-Host "✅ Fichier CSV trouvé" -ForegroundColor Green
Write-Host ""

# VALIDATION
Write-Host "🔍 ÉTAPE 1: Validation du CSV..." -ForegroundColor Yellow
try {
    $output = php -r "require 'includes/csv-products-manager.php'; `$m = new CsvProductsManager(); `$r = `$m->validateCsv('data/products.csv'); echo `$r['success'] ? 'VALIDE' : 'ERREUR';"
    if ($output -eq "VALIDE") {
        Write-Host "✅ CSV VALIDE" -ForegroundColor Green
    } else {
        Write-Host "❌ CSV INVALIDE" -ForegroundColor Red
        Read-Host "Corrigez le CSV avant de continuer. Appuyez sur Entrée"
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors de la validation" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour fermer"
    exit 1
}

# CONFIRMATION
Write-Host ""
Write-Host "⚠️  ATTENTION: Cette opération remplace data\products.json" -ForegroundColor Yellow
Write-Host "   Une sauvegarde sera créée automatiquement" -ForegroundColor Gray
Write-Host ""
$confirm = Read-Host "Confirmer la conversion ? (tapez OUI en majuscules)"
if ($confirm -ne "OUI") {
    Write-Host "Conversion annulée." -ForegroundColor Yellow
    Read-Host "Appuyez sur Entrée pour fermer"
    exit 0
}

# CONVERSION
Write-Host ""
Write-Host "🔄 ÉTAPE 2: Conversion CSV vers JSON..." -ForegroundColor Yellow
try {
    $output = php -r "require 'includes/csv-products-manager.php'; `$m = new CsvProductsManager(); `$r = `$m->convertCsvToJson('data/products.csv', 'data/products.json'); echo `$r['success'] ? 'SUCCÈS' : 'ERREUR'; exit(`$r['success'] ? 0 : 1);"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ CONVERSION RÉUSSIE !" -ForegroundColor Green
    } else {
        Write-Host "❌ CONVERSION ÉCHOUÉE" -ForegroundColor Red
        Read-Host "Appuyez sur Entrée pour fermer"
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors de la conversion" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour fermer"
    exit 1
}

# VÉRIFICATION
Write-Host ""
Write-Host "🔍 ÉTAPE 3: Vérification des données..." -ForegroundColor Yellow
try {
    $result = php -r "`$d = json_decode(file_get_contents('data/products.json'), true); echo `$d['piece-personnalisee']['price'] . '|' . date('H:i:s', filemtime('data/products.json')) . '|' . count(`$d);"
    $parts = $result -split '\|'
    Write-Host "   Prix piece-personnalisee: $($parts[0])€" -ForegroundColor White
    Write-Host "   Modifié à: $($parts[1])" -ForegroundColor White  
    Write-Host "   Total produits: $($parts[2])" -ForegroundColor White
} catch {
    Write-Host "❌ Erreur lors de la vérification" -ForegroundColor Red
}

Write-Host ""
Write-Host "💡 POUR VOIR LES CHANGEMENTS SUR LE SITE:" -ForegroundColor Cyan
Write-Host "   1. Ouvrez une NAVIGATION PRIVÉE" -ForegroundColor Gray
Write-Host "   2. Allez sur http://localhost/boutique.php" -ForegroundColor Gray
Write-Host "   3. Si ça ne marche pas: redémarrez votre serveur web" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 TERMINÉ !" -ForegroundColor Green

Read-Host "Appuyez sur Entrée pour fermer"