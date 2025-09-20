# Script de compression des vidéos vers H.264 optimisé
# CRF 23-25: réduction 60-70% avec qualité quasi-imperceptible

# Vérifier si FFmpeg est disponible
try {
    $ffmpegPath = (Get-Command ffmpeg -ErrorAction Stop).Source
    Write-Host "✅ FFmpeg trouvé: $ffmpegPath" -ForegroundColor Green
} catch {
    Write-Host "❌ FFmpeg non trouvé dans le PATH" -ForegroundColor Red
    # Essayer les emplacements communs
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
$outputDir = "videos\compressed"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force
    Write-Host "📁 Dossier créé: $outputDir" -ForegroundColor Yellow
}

# Obtenir tous les fichiers vidéo
$videoFiles = Get-ChildItem -Path "videos" -File | Where-Object {
    $_.Extension -in @(".mp4", ".avi", ".mov", ".mkv", ".webm", ".m4v")
}

Write-Host "🎬 Trouvé $($videoFiles.Count) fichiers vidéo à compresser" -ForegroundColor Cyan
Write-Host "🔧 Paramètres: H.264, CRF 24, preset medium, audio AAC 128k" -ForegroundColor Cyan

$converted = 0
$failed = 0
$totalOriginal = 0
$totalNew = 0

foreach ($file in $videoFiles) {
    # Créer le nom de fichier de sortie (toujours .mp4)
    $outputPath = Join-Path $outputDir ($file.BaseName + "_compressed.mp4")
    
    Write-Host "🎥 Compression: $($file.Name)" -ForegroundColor White
    
    try {
        # Compression H.264 optimisée pour le web
        # CRF 24: excellent compromis qualité/taille
        # preset medium: bon équilibre vitesse/compression
        # profile baseline: compatibilité maximale
        # movflags faststart: optimisation streaming web
        & $ffmpegPath -i $file.FullName `
            -c:v libx264 `
            -crf 24 `
            -preset medium `
            -profile:v baseline `
            -level 3.1 `
            -c:a aac `
            -b:a 128k `
            -movflags +faststart `
            -y $outputPath 2>$null
        
        if ($LASTEXITCODE -eq 0 -and (Test-Path $outputPath)) {
            $originalSize = [math]::Round((Get-Item $file.FullName).Length / 1MB, 2)
            $newSize = [math]::Round((Get-Item $outputPath).Length / 1MB, 2)
            $reduction = [math]::Round((1 - ($newSize / $originalSize)) * 100, 1)
            
            Write-Host "   ✅ $originalSize MB → $newSize MB (réduction: $reduction%)" -ForegroundColor Green
            $converted++
            $totalOriginal += (Get-Item $file.FullName).Length
            $totalNew += (Get-Item $outputPath).Length
        } else {
            Write-Host "   ❌ Échec de la compression" -ForegroundColor Red
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
    $totalReduction = [math]::Round((1 - ($totalNew / $totalOriginal)) * 100, 1)
    
    Write-Host "   📈 Réduction totale: $totalReduction%" -ForegroundColor Magenta
    Write-Host "   💾 Taille originale: $([math]::Round($totalOriginal / 1MB, 2)) MB" -ForegroundColor White
    Write-Host "   💾 Nouvelle taille: $([math]::Round($totalNew / 1MB, 2)) MB" -ForegroundColor White
    Write-Host "   💾 Espace économisé: $([math]::Round(($totalOriginal - $totalNew) / 1MB, 2)) MB" -ForegroundColor Magenta
}

Write-Host "`n🌐 Optimisations appliquées:" -ForegroundColor Yellow
Write-Host "   • H.264 Baseline Profile (compatibilité maximale)" -ForegroundColor White
Write-Host "   • FastStart activé (streaming web optimisé)" -ForegroundColor White
Write-Host "   • Audio AAC 128kbps (qualité/taille optimale)" -ForegroundColor White
Write-Host "   • CRF 24 (qualité quasi-imperceptible)" -ForegroundColor White