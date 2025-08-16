#!/usr/bin/env python3
"""
Script pour remplacer les images originales par les versions optimisées
"""

import os
import shutil
from pathlib import Path

def main():
    optimized_dir = Path('images/optimized')
    backup_dir = Path('images/backup')
    
    replaced_count = 0
    saved_size = 0
    
    # Parcourir toutes les images optimisées
    for optimized_img in optimized_dir.rglob('*'):
        if optimized_img.is_file() and optimized_img.suffix.lower() in ['.jpg', '.jpeg', '.png']:
            # Calculer le chemin relatif
            relative_path = optimized_img.relative_to(optimized_dir)
            original_path = Path('images') / relative_path
            
            # Si l'original existe avec la même extension
            if original_path.exists():
                print(f"Remplace {relative_path}")
                original_size = original_path.stat().st_size
                optimized_size = optimized_img.stat().st_size
                saved_size += (original_size - optimized_size)
                
                # Sauvegarder l'original
                backup_path = backup_dir / relative_path
                backup_path.parent.mkdir(parents=True, exist_ok=True)
                shutil.move(str(original_path), str(backup_path))
                
                # Copier la version optimisée
                shutil.move(str(optimized_img), str(original_path))
                replaced_count += 1
            else:
                # Chercher avec d'autres extensions
                original_stem = original_path.stem
                original_parent = original_path.parent
                
                for ext in ['.png', '.jpg', '.jpeg']:
                    alt_path = original_parent / (original_stem + ext)
                    if alt_path.exists():
                        print(f"Remplace {alt_path.name} par {optimized_img.name}")
                        original_size = alt_path.stat().st_size
                        optimized_size = optimized_img.stat().st_size
                        saved_size += (original_size - optimized_size)
                        
                        # Sauvegarder l'original
                        backup_path = backup_dir / alt_path.relative_to(Path('images'))
                        backup_path.parent.mkdir(parents=True, exist_ok=True)
                        shutil.move(str(alt_path), str(backup_path))
                        
                        # Copier la version optimisée avec le bon nom
                        final_path = original_parent / alt_path.name
                        shutil.move(str(optimized_img), str(final_path))
                        replaced_count += 1
                        break
    
    print(f"\n=== RÉSUMÉ ===")
    print(f"Images remplacées: {replaced_count}")
    print(f"Espace économisé: {saved_size/1024/1024:.1f} MB")

if __name__ == '__main__':
    main()