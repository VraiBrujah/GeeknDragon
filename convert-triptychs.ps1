# Conversion des triptyques PNG vers WEBP
$ffmpeg = "C:\Users\Brujah\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0-full_build\bin\ffmpeg.exe"

# Dossier source des triptyques
$sourceDir = "media\game\triptychs\examples"

# Obtenir toutes les images PNG des triptyques
$pngFiles = Get-ChildItem -Path $sourceDir -Filter "*.png"

Write-Host "Conversion de $($pngFiles.Count) triptyques PNG vers WEBP (qualite 90%)"
Write-Host "=" * 60

$converted = 0
$totalOriginal = 0
$totalNew = 0

foreach ($file in $pngFiles) {
    # Créer le nom de fichier de sortie (même dossier, extension .webp)
    $outputPath = $file.FullName -replace "\.png$", ".webp"
    
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
Write-Host "Triptyques convertis: $converted" -ForegroundColor Green
Write-Host "Taille originale: $([math]::Round($totalOriginal / 1MB, 2)) MB"
Write-Host "Nouvelle taille: $([math]::Round($totalNew / 1MB, 2)) MB"
Write-Host "Réduction totale: $([math]::Round((1 - ($totalNew / $totalOriginal)) * 100, 1))%" -ForegroundColor Magenta
Write-Host "Espace économisé: $([math]::Round(($totalOriginal - $totalNew) / 1MB, 2)) MB" -ForegroundColor Yellow