# Test simple de conversion
$ffmpeg = "C:\Users\Brujah\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0-full_build\bin\ffmpeg.exe"

# Test avec une seule image
$testImage = "images\Nlogo.png"
$outputImage = "images\webp\Nlogo.webp"

# Créer le dossier
New-Item -ItemType Directory -Path "images\webp" -Force

Write-Host "Test de conversion: $testImage"
& $ffmpeg -i $testImage -c:v libwebp -quality 90 -y $outputImage

if (Test-Path $outputImage) {
    $originalSize = (Get-Item $testImage).Length
    $newSize = (Get-Item $outputImage).Length
    $reduction = [math]::Round((1 - ($newSize / $originalSize)) * 100, 1)
    Write-Host "SUCCESS: Reduction de $reduction%"
} else {
    Write-Host "FAILED: Pas de fichier de sortie"
}