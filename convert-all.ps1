# Conversion de toutes les images PNG vers WEBP
$ffmpeg = "C:\Users\Brujah\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0-full_build\bin\ffmpeg.exe"

# Créer le dossier de sortie
New-Item -ItemType Directory -Path "images\webp" -Force | Out-Null

# Obtenir toutes les images PNG (exclure old-image et webp)
$pngFiles = Get-ChildItem -Path "images" -Filter "*.png" -Recurse | Where-Object { 
    $_.FullName -notlike "*old-image*" -and $_.FullName -notlike "*webp*" 
}

Write-Host "Conversion de $($pngFiles.Count) images PNG vers WEBP (qualite 90%)"
Write-Host "=" * 60

$converted = 0
$totalOriginal = 0
$totalNew = 0

foreach ($file in $pngFiles) {
    # Créer le nom de fichier de sortie
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
    $outputPath = $relativePath -replace "\.png$", ".webp" -replace "^images\\", "images\webp\"
    
    # Créer le dossier parent si nécessaire
    $outputDir = Split-Path $outputPath -Parent
    if (-not (Test-Path $outputDir)) {
        New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
    }
    
    Write-Host "Converting: $($file.Name)" -NoNewline
    
    # Conversion avec FFmpeg
    $process = Start-Process -FilePath $ffmpeg -ArgumentList @(
        "-i", $file.FullName,
        "-c:v", "libwebp", 
        "-quality", "90",
        "-y", $outputPath
    ) -NoNewWindow -Wait -PassThru
    
    if ($process.ExitCode -eq 0 -and (Test-Path $outputPath)) {
        $originalSize = $file.Length
        $newSize = (Get-Item $outputPath).Length
        $reduction = [math]::Round((1 - ($newSize / $originalSize)) * 100, 1)
        
        Write-Host " -> $reduction% reduction" -ForegroundColor Green
        
        $converted++
        $totalOriginal += $originalSize
        $totalNew += $newSize
    } else {
        Write-Host " -> FAILED" -ForegroundColor Red
    }
}

Write-Host "`n" + "=" * 60
Write-Host "RÉSULTATS:" -ForegroundColor Cyan
Write-Host "Images converties: $converted" -ForegroundColor Green
Write-Host "Taille originale: $([math]::Round($totalOriginal / 1MB, 2)) MB"
Write-Host "Nouvelle taille: $([math]::Round($totalNew / 1MB, 2)) MB"
Write-Host "Réduction totale: $([math]::Round((1 - ($totalNew / $totalOriginal)) * 100, 1))%" -ForegroundColor Magenta
Write-Host "Espace économisé: $([math]::Round(($totalOriginal - $totalNew) / 1MB, 2)) MB" -ForegroundColor Yellow