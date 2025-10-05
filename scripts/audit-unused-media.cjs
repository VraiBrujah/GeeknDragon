#!/usr/bin/env node

/**
 * Script d'audit des médias non-utilisés
 *
 * Analyse tous les fichiers PHP/HTML/CSS/JS pour identifier les médias référencés
 * et compare avec les fichiers réellement présents dans media/
 *
 * @author Brujah - Geek & Dragon
 * @usage node scripts/audit-unused-media.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '..');
const MEDIA_DIR = path.join(PROJECT_ROOT, 'media');

// Extensions à scanner
const CODE_EXTENSIONS = ['.php', '.html', '.css', '.js', '.json'];
const MEDIA_EXTENSIONS = ['.webp', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.mp4', '.mp3', '.wav', '.pdf'];

// Dossiers à ignorer lors du scan de code
const IGNORE_DIRS = ['node_modules', 'vendor', '.git', 'EDS'];

/**
 * Récupère tous les fichiers médias présents
 */
function getAllMediaFiles() {
  const files = [];

  function scan(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scan(fullPath);
      } else {
        const ext = path.extname(item).toLowerCase();
        if (MEDIA_EXTENSIONS.includes(ext)) {
          // Chemin relatif depuis PROJECT_ROOT
          const relativePath = path.relative(PROJECT_ROOT, fullPath).replace(/\\/g, '/');
          files.push(relativePath);
        }
      }
    }
  }

  scan(MEDIA_DIR);
  return files;
}

/**
 * Scan tous les fichiers de code pour trouver les références à media/
 */
function getAllMediaReferences() {
  const references = new Set();

  // Utiliser grep pour rechercher toutes les références à "media/"
  try {
    const grepCommand = process.platform === 'win32'
      ? 'findstr /s /i /r "media/" *.php *.html *.css *.js *.json 2>nul'
      : 'grep -r -i "media/" --include="*.php" --include="*.html" --include="*.css" --include="*.js" --include="*.json" .';

    const output = execSync(grepCommand, {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      maxBuffer: 50 * 1024 * 1024 // 50 MB buffer
    });

    // Extraire tous les chemins media/* depuis l'output
    const mediaRegex = /["'(/]media\/([^"'\s)]+)/gi;
    let match;

    while ((match = mediaRegex.exec(output)) !== null) {
      const mediaPath = `media/${match[1].replace(/['"\\]/g, '')}`;
      references.add(mediaPath);
    }

  } catch (error) {
    // Grep peut retourner exit code 1 si aucun match
    if (error.status !== 1) {
      console.error('Erreur lors du scan:', error.message);
    }
  }

  return references;
}

/**
 * Formate la taille en format lisible
 */
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

/**
 * Calcule la taille d'un fichier
 */
function getFileSize(filePath) {
  try {
    const fullPath = path.join(PROJECT_ROOT, filePath);
    const stats = fs.statSync(fullPath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

// ==================== MAIN ====================

console.log('🔍 AUDIT DES MÉDIAS NON-UTILISÉS - Geek & Dragon\n');
console.log('📁 Scanning des médias...');

const allMediaFiles = getAllMediaFiles();
console.log(`   Trouvé: ${allMediaFiles.length} fichiers médias\n`);

console.log('🔎 Scanning des références dans le code...');
const allReferences = getAllMediaReferences();
console.log(`   Trouvé: ${allReferences.size} références uniques\n`);

// Identifier les fichiers non-utilisés
const unusedFiles = [];
let totalUnusedSize = 0;

for (const mediaFile of allMediaFiles) {
  let isReferenced = false;

  // Vérifier si le fichier est référencé (exact ou dans un chemin)
  for (const ref of allReferences) {
    if (ref.includes(mediaFile) || mediaFile.includes(ref)) {
      isReferenced = true;
      break;
    }
  }

  if (!isReferenced) {
    const fileSize = getFileSize(mediaFile);
    unusedFiles.push({ path: mediaFile, size: fileSize });
    totalUnusedSize += fileSize;
  }
}

// Afficher les résultats
console.log('═'.repeat(80));
console.log('📊 RÉSULTATS DE L\'AUDIT');
console.log('═'.repeat(80));

console.log(`\n📈 Statistiques:`);
console.log(`   Total médias:        ${allMediaFiles.length} fichiers`);
console.log(`   Médias utilisés:     ${allMediaFiles.length - unusedFiles.length} fichiers`);
console.log(`   Médias non-utilisés: ${unusedFiles.length} fichiers`);
console.log(`   Espace récupérable:  ${formatSize(totalUnusedSize)}`);

if (unusedFiles.length > 0) {
  console.log(`\n🗑️  FICHIERS NON-UTILISÉS (Top 20 par taille):\n`);

  // Trier par taille décroissante
  unusedFiles.sort((a, b) => b.size - a.size);

  const top20 = unusedFiles.slice(0, 20);
  for (const file of top20) {
    console.log(`   ${formatSize(file.size).padEnd(10)} - ${file.path}`);
  }

  if (unusedFiles.length > 20) {
    console.log(`   ... et ${unusedFiles.length - 20} fichiers supplémentaires`);
  }

  // Sauvegarder la liste complète
  const outputFile = path.join(PROJECT_ROOT, 'scripts', 'unused-media.json');
  fs.writeFileSync(outputFile, JSON.stringify(unusedFiles, null, 2));
  console.log(`\n💾 Liste complète sauvegardée: scripts/unused-media.json`);

  console.log(`\n⚠️  RECOMMANDATION:`);
  console.log(`   Vérifier manuellement avant suppression !`);
  console.log(`   Certains fichiers peuvent être utilisés dynamiquement.`);

} else {
  console.log(`\n✅ Aucun fichier média non-utilisé détecté!`);
}

console.log('\n' + '═'.repeat(80));
console.log('✅ Audit terminé\n');
