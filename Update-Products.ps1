# ==============================================================================
# 🔄 Script PowerShell pour la gestion des produits GeeknDragon via CSV
# ==============================================================================

param(
    [string]$Action = "",
    [switch]$Force,
    [switch]$Quiet
)

# Configuration
$ErrorActionPreference = "Stop"
$OutputEncoding = [System.Text.Encoding]::UTF8

# Fonctions utilitaires
function Write-ColorText {
    param([string]$Text, [string]$Color = "White")
    if (!$Quiet) {
        Write-Host $Text -ForegroundColor $Color
    }
}

function Write-Success { param([string]$Text) Write-ColorText "✅ $Text" "Green" }
function Write-Error { param([string]$Text) Write-ColorText "❌ $Text" "Red" }
function Write-Warning { param([string]$Text) Write-ColorText "⚠️  $Text" "Yellow" }
function Write-Info { param([string]$Text) Write-ColorText "ℹ️  $Text" "Cyan" }

function Test-Prerequisites {
    Write-Info "Vérification des prérequis..."
    
    # Vérifier PHP
    try {
        $phpVersion = php --version 2>$null
        if ($LASTEXITCODE -ne 0) { throw }
        Write-Success "PHP détecté"
    }
    catch {
        Write-Error "PHP n'est pas installé ou pas dans le PATH"
        Write-Host "   Veuillez installer PHP et l'ajouter au PATH système" -ForegroundColor Gray
        exit 1
    }
    
    # Vérifier les fichiers requis
    $requiredFiles = @(
        "includes\csv-products-manager.php",
        "scripts\generate-initial-csv.php",
        "data\products.json"
    )
    
    foreach ($file in $requiredFiles) {
        if (!(Test-Path $file)) {
            Write-Error "Fichier requis manquant : $file"
            exit 1
        }
    }
    
    Write-Success "Tous les prérequis sont satisfaits"
}

function Invoke-PhpScript {
    param([string]$Script)
    
    try {
        $output = php -r $Script 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Erreur PHP : $output"
            return $false
        }
        Write-Host $output
        return $true
    }
    catch {
        Write-Error "Erreur lors de l'exécution du script PHP : $_"
        return $false
    }
}

function Show-Menu {
    Write-Host ""
    Write-ColorText "============================================" "Magenta"
    Write-ColorText "   🔄 Gestion des produits GeeknDragon" "Magenta"
    Write-ColorText "============================================" "Magenta"
    Write-Host ""
    
    Write-Host "📋 Actions disponibles :" -ForegroundColor White
    Write-Host ""
    Write-Host "   1. 🔍 Valider le fichier CSV" -ForegroundColor Gray
    Write-Host "   2. 🔄 Convertir CSV vers JSON (REMPLACE products.json)" -ForegroundColor Gray
    Write-Host "   3. 📤 Exporter JSON vers CSV (pour édition)" -ForegroundColor Gray
    Write-Host "   4. 🧪 Tester la conversion bidirectionnelle" -ForegroundColor Gray
    Write-Host "   5. 📝 Ouvrir products.csv pour édition" -ForegroundColor Gray
    Write-Host "   6. 📊 Afficher les statistiques" -ForegroundColor Gray
    Write-Host "   7. 🔙 Restaurer une sauvegarde" -ForegroundColor Gray
    Write-Host ""
    
    do {
        $choice = Read-Host "Choisissez une option (1-7)"
    } while ($choice -notmatch '^[1-7]$')
    
    return $choice
}

function Validate-Csv {
    Write-Info "Validation du fichier CSV..."
    
    if (!(Test-Path "data\products.csv")) {
        Write-Warning "Le fichier data\products.csv n'existe pas"
        Write-Info "Génération du fichier CSV initial..."
        Export-JsonToCsv
        return
    }
    
    $script = @"
require 'includes/csv-products-manager.php';
`$manager = new CsvProductsManager();
`$result = `$manager->validateCsv('data/products.csv');
echo (`$result['success'] ? '✅ ' : '❌ ') . `$result['message'] . PHP_EOL;
if (isset(`$result['errors'])) {
    foreach (`$result['errors'] as `$error) {
        echo '   - ' . `$error . PHP_EOL;
    }
}
exit(`$result['success'] ? 0 : 1);
"@

    return Invoke-PhpScript $script
}

function Convert-CsvToJson {
    if (!(Test-Path "data\products.csv")) {
        Write-Error "Le fichier data\products.csv n'existe pas"
        return $false
    }
    
    if (!$Force) {
        Write-Warning "Cette opération va remplacer data\products.json"
        Write-Host "   Une sauvegarde sera créée automatiquement" -ForegroundColor Gray
        $confirm = Read-Host "Confirmer la conversion ? (o/N)"
        if ($confirm -ne "o" -and $confirm -ne "O") {
            Write-Info "Opération annulée"
            return $false
        }
    }
    
    Write-Info "Conversion CSV vers JSON..."
    
    $script = @"
require 'includes/csv-products-manager.php';
`$manager = new CsvProductsManager();
`$result = `$manager->convertCsvToJson('data/products.csv', 'data/products.json');
echo (`$result['success'] ? '✅ ' : '❌ ') . `$result['message'] . PHP_EOL;
exit(`$result['success'] ? 0 : 1);
"@

    if (Invoke-PhpScript $script) {
        Write-Success "Conversion réussie ! Les produits ont été mis à jour."
        return $true
    }
    return $false
}

function Export-JsonToCsv {
    Write-Info "Export JSON vers CSV..."
    
    try {
        $output = php "scripts\generate-initial-csv.php" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host $output
            return $true
        } else {
            Write-Error "Erreur lors de l'export : $output"
            return $false
        }
    }
    catch {
        Write-Error "Erreur lors de l'export : $_"
        return $false
    }
}

function Test-Conversion {
    Write-Info "Test de conversion bidirectionnelle..."
    
    try {
        $output = php "scripts\test-csv-conversion.php" 2>&1
        Write-Host $output
        return ($LASTEXITCODE -eq 0)
    }
    catch {
        Write-Error "Erreur lors du test : $_"
        return $false
    }
}

function Open-CsvForEdit {
    Write-Info "Ouverture de data\products.csv..."
    
    if (!(Test-Path "data\products.csv")) {
        Write-Warning "Le fichier data\products.csv n'existe pas"
        Write-Info "Génération du fichier CSV initial..."
        if (!(Export-JsonToCsv)) { return }
    }
    
    try {
        Start-Process "data\products.csv"
        Write-Success "Fichier ouvert dans l'éditeur par défaut"
        Write-Host ""
        Write-ColorText "💡 Après modification :" "Yellow"
        Write-Host "   1. Sauvegardez le fichier au format CSV" -ForegroundColor Gray
        Write-Host "   2. Relancez ce script avec l'option 2 pour convertir" -ForegroundColor Gray
    }
    catch {
        Write-Error "Impossible d'ouvrir le fichier : $_"
    }
}

function Show-Statistics {
    Write-Info "Calcul des statistiques..."
    
    $script = @"
`$data = json_decode(file_get_contents('data/products.json'), true) ?? [];
`$stats = [
    'total' => count(`$data),
    'with_multipliers' => count(array_filter(`$data, fn(`$p) => !empty(`$p['multipliers']))),
    'customizable' => count(array_filter(`$data, fn(`$p) => !empty(`$p['customizable']))),
    'with_images' => count(array_filter(`$data, fn(`$p) => !empty(`$p['images']))),
    'with_coin_lots' => count(array_filter(`$data, fn(`$p) => !empty(`$p['coin_lots'])))
];
echo json_encode(`$stats);
"@

    try {
        $statsJson = php -r $script
        $stats = $statsJson | ConvertFrom-Json
        
        Write-Host ""
        Write-ColorText "📊 Statistiques des produits" "Cyan"
        Write-Host "================================" -ForegroundColor Cyan
        Write-Host "   Total de produits : $($stats.total)" -ForegroundColor White
        Write-Host "   Avec multiplicateurs : $($stats.with_multipliers)" -ForegroundColor Green
        Write-Host "   Personnalisables : $($stats.customizable)" -ForegroundColor Yellow
        Write-Host "   Avec images : $($stats.with_images)" -ForegroundColor Blue
        Write-Host "   Avec lots de pièces : $($stats.with_coin_lots)" -ForegroundColor Magenta
        Write-Host ""
    }
    catch {
        Write-Error "Erreur lors du calcul des statistiques : $_"
    }
}

function Show-Backups {
    Write-Info "Recherche des sauvegardes..."
    
    $backups = Get-ChildItem "data\products.json.backup.*" -ErrorAction SilentlyContinue | Sort-Object Name -Descending
    
    if ($backups.Count -eq 0) {
        Write-Warning "Aucune sauvegarde trouvée"
        return
    }
    
    Write-Host ""
    Write-ColorText "🔙 Sauvegardes disponibles :" "Cyan"
    Write-Host ""
    
    for ($i = 0; $i -lt $backups.Count; $i++) {
        $backup = $backups[$i]
        $date = $backup.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
        $size = [math]::Round($backup.Length / 1KB, 2)
        Write-Host "   $($i + 1). $($backup.Name) ($date, ${size}KB)" -ForegroundColor Gray
    }
    
    Write-Host ""
    $choice = Read-Host "Choisissez une sauvegarde à restaurer (1-$($backups.Count)) ou appuyez sur Entrée pour annuler"
    
    if ($choice -match '^\d+$' -and [int]$choice -ge 1 -and [int]$choice -le $backups.Count) {
        $selectedBackup = $backups[[int]$choice - 1]
        
        if (!$Force) {
            $confirm = Read-Host "Confirmer la restauration de $($selectedBackup.Name) ? (o/N)"
            if ($confirm -ne "o" -and $confirm -ne "O") {
                Write-Info "Restauration annulée"
                return
            }
        }
        
        try {
            Copy-Item $selectedBackup.FullName "data\products.json" -Force
            Write-Success "Sauvegarde restaurée avec succès"
        }
        catch {
            Write-Error "Erreur lors de la restauration : $_"
        }
    } else {
        Write-Info "Restauration annulée"
    }
}

# ==============================================================================
# Script principal
# ==============================================================================

# Vérification du répertoire de travail
if (!(Test-Path "includes\csv-products-manager.php")) {
    Write-Error "Ce script doit être exécuté depuis le répertoire racine de GeeknDragon"
    exit 1
}

Test-Prerequisites

# Gestion des paramètres en ligne de commande
switch ($Action.ToLower()) {
    "validate" { Validate-Csv; exit }
    "convert" { Convert-CsvToJson; exit }
    "export" { Export-JsonToCsv; exit }
    "test" { Test-Conversion; exit }
    "open" { Open-CsvForEdit; exit }
    "stats" { Show-Statistics; exit }
    "backups" { Show-Backups; exit }
    "" { 
        # Mode interactif
        do {
            $choice = Show-Menu
            
            switch ($choice) {
                "1" { Validate-Csv }
                "2" { Convert-CsvToJson }
                "3" { Export-JsonToCsv }
                "4" { Test-Conversion }
                "5" { Open-CsvForEdit }
                "6" { Show-Statistics }
                "7" { Show-Backups }
            }
            
            if (!$Quiet) {
                Write-Host ""
                Read-Host "Appuyez sur Entrée pour continuer"
            }
        } while (!$Quiet)
    }
    default {
        Write-Error "Action inconnue : $Action"
        Write-Host "Actions disponibles : validate, convert, export, test, open, stats, backups"
        exit 1
    }
}