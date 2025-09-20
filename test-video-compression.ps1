# Test de compression d'une seule vidéo
$ffmpeg = "C:\Users\Brujah\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0-full_build\bin\ffmpeg.exe"

# Créer le dossier de sortie
New-Item -ItemType Directory -Path "videos\compressed" -Force | Out-Null

# Test avec une vidéo
$testVideo = "videos\Carte1.mp4"
$outputVideo = "videos\compressed\Carte1_compressed.mp4"

Write-Host "Test de compression: $testVideo"

if (Test-Path $testVideo) {
    & $ffmpeg -i $testVideo -c:v libx264 -crf 24 -preset medium -profile:v baseline -level 3.1 -c:a aac -b:a 128k -movflags +faststart -y $outputVideo
    
    if (Test-Path $outputVideo) {
        $originalSize = [math]::Round((Get-Item $testVideo).Length / 1MB, 2)
        $newSize = [math]::Round((Get-Item $outputVideo).Length / 1MB, 2)
        $reduction = [math]::Round((1 - ($newSize / $originalSize)) * 100, 1)
        Write-Host "SUCCESS: $originalSize MB -> $newSize MB (réduction: $reduction%)"
    } else {
        Write-Host "FAILED: Pas de fichier de sortie"
    }
} else {
    Write-Host "FAILED: Fichier source non trouvé"
}