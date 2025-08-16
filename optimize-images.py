#!/usr/bin/env python3
"""
Script d'optimisation des images pour Geek & Dragon
Utilise Pillow pour compresser les images sans perte de qualité perceptible
"""

import os
import sys
from pathlib import Path
from PIL import Image
import concurrent.futures

def optimize_image(input_path, output_path, quality=85, max_width=1920):
    """
    Optimise une image en préservant la qualité visuelle
    
    Args:
        input_path: Chemin de l'image source
        output_path: Chemin de l'image optimisée
        quality: Qualité JPEG/WebP (85 = haute qualité sans perte perceptible)
        max_width: Largeur maximale (redimensionne si nécessaire)
    """
    try:
        # Ouvrir l'image
        img = Image.open(input_path)
        
        # Convertir RGBA en RGB si nécessaire (pour JPEG)
        if img.mode in ('RGBA', 'LA', 'P'):
            # Créer un fond blanc
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        
        # Redimensionner si trop large
        if img.width > max_width:
            ratio = max_width / img.width
            new_height = int(img.height * ratio)
            img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
        
        # Sauvegarder avec optimisation
        output_format = 'JPEG'
        save_kwargs = {
            'quality': quality,
            'optimize': True,
            'progressive': True
        }
        
        # Pour les PNG, garder le format si transparence nécessaire
        if input_path.suffix.lower() == '.png' and 'tryp' in str(input_path):
            # Garder PNG pour les triptyques (transparence importante)
            output_path = output_path.with_suffix('.png')
            img.save(output_path, 'PNG', optimize=True)
        else:
            # Convertir en JPEG pour les autres
            output_path = output_path.with_suffix('.jpg')
            img.save(output_path, output_format, **save_kwargs)
        
        # Calculer la réduction
        original_size = os.path.getsize(input_path)
        new_size = os.path.getsize(output_path)
        reduction = (1 - new_size/original_size) * 100
        
        print(f"OK {input_path.name}: {original_size/1024/1024:.1f}MB -> {new_size/1024/1024:.1f}MB (-{reduction:.0f}%)")
        return output_path, reduction
        
    except Exception as e:
        print(f"ERR {input_path.name}: {e}")
        return None, 0

def main():
    # Dossiers
    images_dir = Path('images')
    output_dir = Path('images/optimized')
    output_dir.mkdir(exist_ok=True)
    
    # Images à optimiser (les plus volumineuses)
    priority_images = [
        'images/tryp/*.png',
        'images/carte/*.png',
        'images/*.png',
        'images/*.jpg',
        'images/Piece/pro/*.png'
    ]
    
    # Collecter tous les fichiers
    all_files = []
    for pattern in priority_images:
        all_files.extend(Path('.').glob(pattern))
    
    # Filtrer les fichiers > 500KB
    large_files = [f for f in all_files if f.stat().st_size > 500*1024]
    large_files.sort(key=lambda x: x.stat().st_size, reverse=True)
    
    print(f"Optimisation de {len(large_files)} images volumineuses...")
    print("-" * 50)
    
    # Traiter les images
    total_before = 0
    total_after = 0
    
    for img_path in large_files[:30]:  # Limiter aux 30 plus grosses
        # Créer le chemin de sortie
        relative_path = img_path.relative_to(images_dir)
        output_path = output_dir / relative_path.parent / relative_path.stem
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Sauvegarder l'original
        backup_path = Path('images/backup') / relative_path
        backup_path.parent.mkdir(parents=True, exist_ok=True)
        if not backup_path.exists():
            import shutil
            shutil.copy2(img_path, backup_path)
        
        # Optimiser
        total_before += img_path.stat().st_size
        new_path, reduction = optimize_image(img_path, output_path)
        if new_path:
            total_after += new_path.stat().st_size
    
    # Résumé
    print("-" * 50)
    print(f"Total avant: {total_before/1024/1024:.1f} MB")
    print(f"Total après: {total_after/1024/1024:.1f} MB")
    print(f"Économie: {(total_before-total_after)/1024/1024:.1f} MB (-{(1-total_after/total_before)*100:.0f}%)")

if __name__ == '__main__':
    # Vérifier que Pillow est installé
    try:
        from PIL import Image
    except ImportError:
        print("Installation de Pillow...")
        os.system('pip install Pillow')
        from PIL import Image
    
    main()