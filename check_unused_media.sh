#!/bin/bash

echo "=== MÉDIAS UTILISÉS ==="

# Images utilisées dans les PHP/HTML/JS
echo "--- Images webp utilisées ---"
grep -rho "images/webp/[^\"']*\.webp" --include="*.php" --include="*.html" --include="*.js" --include="*.css" . | sort | uniq
echo ""

echo "--- Images optimized-modern utilisées ---"
grep -rho "images/optimized-modern/webp/[^\"']*\.webp" --include="*.php" --include="*.html" --include="*.js" --include="*.json" . | sort | uniq
echo ""

echo "--- Autres images utilisées ---"
grep -rho "images/[^\"']*\.(png|jpg|jpeg|svg|gif)" --include="*.php" --include="*.html" --include="*.js" --include="*.css" . | sort | uniq
echo ""

echo "--- Vidéos utilisées ---"
grep -rho "videos/compressed/[^\"']*\.mp4" --include="*.php" --include="*.html" --include="*.js" --include="*.css" . | sort | uniq