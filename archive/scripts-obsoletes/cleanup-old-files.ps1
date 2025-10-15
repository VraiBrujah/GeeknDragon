# Script de nettoyage des anciens fichiers non optimisés
# Supprime les PNG/JPG originaux après vérification que les WEBP existent

Write-Host "🧹 NETTOYAGE DES ANCIENS FICHIERS NON OPTIMISÉS" -ForegroundColor Cyan
Write-Host "=" * 60

$totalSaved = 0
$filesRemoved = 0

# Fonction pour supprimer en sécurité
function Remove-IfExists {
    param($path, $webpPath)
    
    if (Test-Path $path) {
        if (Test-Path $webpPath) {
            $size = (Get-Item $path).Length
            Remove-Item $path -Force
            Write-Host "✅ Supprimé: $path" -ForegroundColor Green
            return $size
        } else {
            Write-Host "⚠️  WEBP manquant pour: $path" -ForegroundColor Yellow
            return 0
        }
    }
    return 0
}

# Supprimer les PNG originaux (sauf ceux dans webp/)
$pngFiles = Get-ChildItem -Path "images" -Filter "*.png" -Recurse | Where-Object { 
    $_.FullName -notlike "*webp*" 
}

Write-Host "📸 Suppression des fichiers PNG originaux..."
foreach ($file in $pngFiles) {
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
    $webpPath = $relativePath -replace "\.png$", ".webp" -replace "^images\\", "images\webp\"
    
    $saved = Remove-IfExists $file.FullName $webpPath
    if ($saved -gt 0) {
        $totalSaved += $saved
        $filesRemoved++
    }
}

# Supprimer les JPG originaux
$jpgFiles = Get-ChildItem -Path "images" -Filter "*.jpg" -Recurse | Where-Object { 
    $_.FullName -notlike "*webp*" 
}

Write-Host "📸 Suppression des fichiers JPG originaux..."
foreach ($file in $jpgFiles) {
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
    $webpPath = $relativePath -replace "\.jpg$", ".webp" -replace "^images\\", "images\webp\"
    
    $saved = Remove-IfExists $file.FullName $webpPath
    if ($saved -gt 0) {
        $totalSaved += $saved
        $filesRemoved++
    }
}

# Supprimer les vidéos originales (sauf celles dans compressed/)
$videoFiles = Get-ChildItem -Path "videos" -Filter "*.mp4" -File | Where-Object { 
    $_.FullName -notlike "*compressed*" 
}

Write-Host "🎬 Suppression des vidéos originales..."
foreach ($file in $videoFiles) {
    $compressedPath = "videos\compressed\$($file.BaseName)_compressed.mp4"
    
    $saved = Remove-IfExists $file.FullName $compressedPath
    if ($saved -gt 0) {
        $totalSaved += $saved
        $filesRemoved++
    }
}

Write-Host "`n" + "=" * 60
Write-Host "📊 RÉSULTATS DU NETTOYAGE:" -ForegroundColor Cyan
Write-Host "   🗑️  Fichiers supprimés: $filesRemoved" -ForegroundColor Green
Write-Host "   💾 Espace libéré: $([math]::Round($totalSaved / 1MB, 2)) MB" -ForegroundColor Magenta

Write-Host "Nettoyage termine ! Votre site utilise maintenant uniquement les fichiers optimises." -ForegroundColor Green