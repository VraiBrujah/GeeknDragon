# Compression de toutes les vidéos vers H.264 optimisé
$ffmpeg = "C:\Users\Brujah\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0-full_build\bin\ffmpeg.exe"

# Créer le dossier de sortie
New-Item -ItemType Directory -Path "videos\compressed" -Force | Out-Null

# Obtenir tous les fichiers vidéo
$videoFiles = Get-ChildItem -Path "videos" -File | Where-Object { 
    $_.Extension -match '\.(mp4|avi|mov|mkv|webm|m4v)$' 
}

Write-Host "Compression de $($videoFiles.Count) vidéos vers H.264 (CRF 24)" -ForegroundColor Cyan
Write-Host "=" * 60

$converted = 0
$totalOriginal = 0
$totalNew = 0

foreach ($file in $videoFiles) {
    $outputPath = "videos\compressed\$($file.BaseName)_compressed.mp4"
    
    Write-Host "Converting: $($file.Name)" -NoNewline
    
    # Compression H.264 optimisée
    $process = Start-Process -FilePath $ffmpeg -ArgumentList @(
        "-i", $file.FullName,
        "-c:v", "libx264", 
        "-crf", "24",
        "-preset", "medium",
        "-profile:v", "baseline",
        "-level", "3.1",
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
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
Write-Host "Vidéos converties: $converted" -ForegroundColor Green
Write-Host "Taille originale: $([math]::Round($totalOriginal / 1MB, 2)) MB"
Write-Host "Nouvelle taille: $([math]::Round($totalNew / 1MB, 2)) MB"
Write-Host "Réduction totale: $([math]::Round((1 - ($totalNew / $totalOriginal)) * 100, 1))%" -ForegroundColor Magenta
Write-Host "Espace économisé: $([math]::Round(($totalOriginal - $totalNew) / 1MB, 2)) MB" -ForegroundColor Yellow