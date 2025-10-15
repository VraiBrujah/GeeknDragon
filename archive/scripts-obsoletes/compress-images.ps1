# Script de compression des images PNG vers WEBP
# Qualité: 90% (quasi-imperceptible)

# Vérifier si FFmpeg est disponible
try {
    $ffmpegPath = (Get-Command ffmpeg -ErrorAction Stop).Source
    Write-Host "✅ FFmpeg trouvé: $ffmpegPath" -ForegroundColor Green
} catch {
    Write-Host "❌ FFmpeg non trouvé dans le PATH" -ForegroundColor Red
    # Essayer les emplacements communs
    # Chercher FFmpeg dans WinGet
    $wingetFFmpeg = Get-ChildItem "$env:USERPROFILE\AppData\Local\Microsoft\WinGet\Packages" -Filter "*FFmpeg*" -Directory | 
                    ForEach-Object { Get-ChildItem $_.FullName -Filter "ffmpeg-*" -Directory } |
                    ForEach-Object { Join-Path $_.FullName "bin\ffmpeg.exe" } |
                    Where-Object { Test-Path $_ } | Select-Object -First 1
    
    $possiblePaths = @(
        $wingetFFmpeg,
        "C:\ffmpeg\bin\ffmpeg.exe",
        "C:\Program Files\ffmpeg\bin\ffmpeg.exe"
    )
    
    foreach ($path in $possiblePaths) {
        if ($path -and (Test-Path $path)) {
            $ffmpegPath = $path
            Write-Host "✅ FFmpeg trouvé: $ffmpegPath" -ForegroundColor Green
            break
        }
    }
    
    if (-not $ffmpegPath) {
        Write-Host "❌ Impossible de trouver FFmpeg" -ForegroundColor Red
        exit 1
    }
}

# Créer le dossier de sortie
$outputDir = "images\webp"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force
    Write-Host "📁 Dossier créé: $outputDir" -ForegroundColor Yellow
}

# Obtenir toutes les images PNG
$pngFiles = Get-ChildItem -Path "images" -Filter "*.png" -Recurse

Write-Host "🔍 Trouvé $($pngFiles.Count) fichiers PNG à convertir" -ForegroundColor Cyan

$converted = 0
$failed = 0

foreach ($file in $pngFiles) {
    # Créer le chemin de sortie en gardant la structure
    $relativePath = $file.FullName.Substring((Get-Location).Path.Length + 1)
    $outputPath = $relativePath -replace "\.png$", ".webp" -replace "^images\\", "$outputDir\"
    
    # Créer le dossier parent si nécessaire
    $outputParent = Split-Path $outputPath -Parent
    if (-not (Test-Path $outputParent)) {
        New-Item -ItemType Directory -Path $outputParent -Force | Out-Null
    }
    
    Write-Host "🔄 Conversion: $($file.Name) -> $outputPath" -ForegroundColor White
    
    try {
        # Conversion avec FFmpeg - qualité 90%
        & $ffmpegPath -i $file.FullName -c:v libwebp -quality 90 -y $outputPath 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            $originalSize = [math]::Round((Get-Item $file.FullName).Length / 1KB, 2)
            $newSize = [math]::Round((Get-Item $outputPath).Length / 1KB, 2)
            $reduction = [math]::Round((1 - ($newSize / $originalSize)) * 100, 1)
            
            Write-Host "   ✅ $originalSize KB -> $newSize KB (réduction: $reduction%)" -ForegroundColor Green
            $converted++
        } else {
            Write-Host "   ❌ Échec de la conversion" -ForegroundColor Red
            $failed++
        }
    } catch {
        Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

Write-Host "`n📊 RÉSUMÉ:" -ForegroundColor Cyan
Write-Host "   ✅ Convertis: $converted" -ForegroundColor Green
Write-Host "   ❌ Échecs: $failed" -ForegroundColor Red

if ($converted -gt 0) {
    $originalTotal = (Get-ChildItem -Path "images" -Filter "*.png" -Recurse | Measure-Object -Property Length -Sum).Sum
    $newTotal = (Get-ChildItem -Path $outputDir -Filter "*.webp" -Recurse | Measure-Object -Property Length -Sum).Sum
    $totalReduction = [math]::Round((1 - ($newTotal / $originalTotal)) * 100, 1)
    
    Write-Host "   📈 Réduction totale: $totalReduction%" -ForegroundColor Magenta
    Write-Host "   💾 Espace économisé: $([math]::Round(($originalTotal - $newTotal) / 1MB, 2)) MB" -ForegroundColor Magenta
}