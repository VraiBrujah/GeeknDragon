#!/usr/bin/env node
/**
 * Script d'optimisation des images PNG/JPG → WebP
 *
 * Convertit automatiquement toutes les images PNG et JPG volumineuses
 * (>100KB) en format WebP pour réduire la taille des fichiers.
 *
 * @author Brujah - Geek & Dragon
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const MEDIA_DIR = path.join(__dirname, '..', 'media');
const MIN_SIZE_KB = 100; // Convertir uniquement les fichiers >100KB
const QUALITY = 85; // Qualité WebP (0-100)

/**
 * Vérifie si ImageMagick est installé
 * @returns {boolean}
 */
function checkImageMagick() {
  try {
    execSync('magick --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Récupère tous les fichiers PNG/JPG récursivement
 * @param {string} dir Répertoire à scanner
 * @param {string[]} fileList Accumulation des fichiers
 * @returns {string[]} Liste des chemins absolus
 */
function getAllImages(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllImages(filePath, fileList);
    } else if (/\.(png|jpg|jpeg)$/i.test(file)) {
      const sizeKB = stat.size / 1024;
      if (sizeKB > MIN_SIZE_KB) {
        fileList.push({ path: filePath, size: sizeKB });
      }
    }
  });

  return fileList;
}

/**
 * Convertit une image en WebP
 * @param {string} inputPath Chemin source
 * @returns {Object} Résultat de la conversion
 */
function convertToWebP(inputPath) {
  const outputPath = inputPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');

  // Ne pas reconvertir si WebP existe déjà et est plus récent
  if (fs.existsSync(outputPath)) {
    const inputStat = fs.statSync(inputPath);
    const outputStat = fs.statSync(outputPath);
    if (outputStat.mtime > inputStat.mtime) {
      return { skipped: true, path: outputPath };
    }
  }

  try {
    // Conversion avec ImageMagick (compatible Windows)
    execSync(
      `magick "${inputPath}" -quality ${QUALITY} "${outputPath}"`,
      { stdio: 'ignore' }
    );

    const inputSize = fs.statSync(inputPath).size;
    const outputSize = fs.statSync(outputPath).size;
    const saved = ((inputSize - outputSize) / inputSize * 100).toFixed(1);

    return {
      success: true,
      path: outputPath,
      savedPercent: saved,
      inputSize: (inputSize / 1024).toFixed(2),
      outputSize: (outputSize / 1024).toFixed(2)
    };
  } catch (error) {
    return {
      error: true,
      path: inputPath,
      message: error.message
    };
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🖼️  OPTIMISATION DES IMAGES - CONVERSION WebP');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Vérifier ImageMagick
  if (!checkImageMagick()) {
    console.error('❌ ImageMagick n\'est pas installé ou non accessible.');
    console.error('📥 Télécharger: https://imagemagick.org/script/download.php');
    console.error('💡 Après installation, redémarrer le terminal.\n');
    process.exit(1);
  }

  console.log('✅ ImageMagick détecté\n');
  console.log(`📂 Scan du répertoire: ${MEDIA_DIR}`);
  console.log(`🔍 Taille minimale: ${MIN_SIZE_KB}KB\n`);

  const images = getAllImages(MEDIA_DIR);
  console.log(`📊 ${images.length} images trouvées (>${MIN_SIZE_KB}KB)\n`);

  if (images.length === 0) {
    console.log('✅ Aucune image à optimiser.\n');
    return;
  }

  let converted = 0;
  let skipped = 0;
  let errors = 0;
  let totalSaved = 0;

  for (const img of images) {
    const relativePath = path.relative(MEDIA_DIR, img.path);
    process.stdout.write(`🔨 ${relativePath} (${img.size.toFixed(0)}KB)... `);

    const result = convertToWebP(img.path);

    if (result.skipped) {
      console.log('⏭️  Déjà converti');
      skipped++;
    } else if (result.error) {
      console.log(`❌ Erreur: ${result.message}`);
      errors++;
    } else if (result.success) {
      console.log(`✅ ${result.outputSize}KB (-${result.savedPercent}%)`);
      converted++;
      totalSaved += parseFloat(result.inputSize) - parseFloat(result.outputSize);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 RAPPORT D\'OPTIMISATION:');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`✅ Converties: ${converted}`);
  console.log(`⏭️  Ignorées: ${skipped}`);
  console.log(`❌ Erreurs: ${errors}`);
  console.log(`💾 Espace économisé: ${totalSaved.toFixed(2)}KB\n`);

  if (converted > 0) {
    console.log('💡 N\'oubliez pas de mettre à jour les références aux images dans le code.');
    console.log('💡 Les fichiers PNG/JPG originaux ont été conservés.\n');
  }
}

main().catch(console.error);
