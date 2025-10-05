/**
 * SYSTÈME DE BUILD SIMPLE - Geek & Dragon
 * 
 * Version simplifiée du build automatisé pour éviter les problèmes de modules ES6
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function fileExists(filePath) {
    return fs.existsSync(filePath);
}

function getFileSize(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return (stats.size / 1024).toFixed(2);
    } catch {
        return '0';
    }
}

function execCommand(command, description) {
    try {
        log(`  🔨 ${description}...`, 'cyan');
        execSync(command, { stdio: 'pipe' });
        return true;
    } catch (error) {
        log(`  ❌ Erreur: ${description}`, 'red');
        return false;
    }
}

function buildComplete() {
    log('═══════════════════════════════════════════════════════════════', 'blue');
    log('🚀 BUILD AUTOMATISÉ - GEEK & DRAGON', 'blue');
    log('═══════════════════════════════════════════════════════════════', 'blue');
    
    const startTime = Date.now();
    let successCount = 0;
    let errorCount = 0;
    
    // Configuration des fichiers à traiter
    const cssFiles = [
        'css/styles.css',
        'css/snipcart-custom.css',
        'css/shop-grid.css'
    ];
    
    const jsFiles = [
        'js/app.js',
        'js/currency-converter.js',
        'js/coin-lot-optimizer.js',
        'js/snipcart-utils.js',
        'js/async-stock-loader.js',
        'js/dnd-music-player.js',
        'js/header-scroll-animation.js',
        'js/hero-videos.js'
    ];
    
    // Minification CSS
    log('\n📦 MINIFICATION CSS:', 'yellow');
    for (const cssFile of cssFiles) {
        if (fileExists(cssFile)) {
            const originalSize = getFileSize(cssFile);
            const minFile = cssFile.replace('.css', '.min.css');
            
            if (execCommand(`npx clean-css-cli -o "${minFile}" "${cssFile}"`, `Minifier ${cssFile}`)) {
                const minSize = getFileSize(minFile);
                log(`  ✅ ${cssFile} → ${originalSize}KB → ${minSize}KB`, 'green');
                successCount++;
            } else {
                errorCount++;
            }
        } else {
            log(`  ⚠️  Fichier non trouvé: ${cssFile}`, 'yellow');
        }
    }
    
    // Minification JavaScript
    log('\n📦 MINIFICATION JAVASCRIPT:', 'yellow');
    for (const jsFile of jsFiles) {
        if (fileExists(jsFile)) {
            const originalSize = getFileSize(jsFile);
            const minFile = jsFile.replace('.js', '.min.js');
            
            if (execCommand(`npx terser "${jsFile}" -c -m -o "${minFile}"`, `Minifier ${jsFile}`)) {
                const minSize = getFileSize(minFile);
                log(`  ✅ ${jsFile} → ${originalSize}KB → ${minSize}KB`, 'green');
                successCount++;
            } else {
                errorCount++;
            }
        } else {
            log(`  ⚠️  Fichier non trouvé: ${jsFile}`, 'yellow');
        }
    }
    
    // Bundles
    log('\n📦 CRÉATION DES BUNDLES:', 'yellow');
    
    // Bundle CSS vendor
    if (execCommand('npx clean-css-cli -o css/vendor.bundle.min.css css/swiper-bundle.min.css css/fancybox.css', 'Bundle CSS vendor')) {
        const bundleSize = getFileSize('css/vendor.bundle.min.css');
        log(`  ✅ Bundle CSS vendor → ${bundleSize}KB`, 'green');
        successCount++;
    } else {
        errorCount++;
    }
    
    // Bundle JS principal
    const jsMainFiles = ['js/app.js', 'js/currency-converter.js', 'js/coin-lot-optimizer.js', 'js/snipcart-utils.js'];
    const validJsFiles = jsMainFiles.filter(f => fileExists(f));
    
    if (validJsFiles.length > 0) {
        if (execCommand(`npx terser ${validJsFiles.join(' ')} -c -m -o js/app.bundle.min.js`, 'Bundle JS principal')) {
            const bundleSize = getFileSize('js/app.bundle.min.js');
            log(`  ✅ Bundle JS principal → ${bundleSize}KB`, 'green');
            successCount++;
        } else {
            errorCount++;
        }
    }
    
    // Compression gzip
    log('\n📦 COMPRESSION GZIP:', 'yellow');
    const filesToCompress = [
        'css/styles.min.css',
        'css/snipcart-custom.min.css',
        'css/vendor.bundle.min.css',
        'js/app.bundle.min.js'
    ];
    
    for (const file of filesToCompress) {
        if (fileExists(file)) {
            if (execCommand(`gzip -k -f "${file}"`, `Compresser ${file}`)) {
                const originalSize = getFileSize(file);
                const compressedSize = getFileSize(`${file}.gz`);
                log(`  ✅ ${file} → ${originalSize}KB → ${compressedSize}KB`, 'cyan');
                successCount++;
            } else {
                errorCount++;
            }
        }
    }
    
    // Rapport final
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log('\n═══════════════════════════════════════════════════════════════', 'blue');
    log('📊 RAPPORT DE BUILD:', 'blue');
    log('═══════════════════════════════════════════════════════════════', 'blue');
    log(`✅ Succès: ${successCount}`, 'green');
    log(`❌ Erreurs: ${errorCount}`, errorCount > 0 ? 'red' : 'green');
    log(`⏱️  Durée: ${duration}s`, 'cyan');
    
    if (errorCount === 0) {
        log('\n🎉 BUILD COMPLET RÉUSSI!', 'green');
        log('💡 Fichiers optimisés prêts pour la production', 'green');
    } else {
        log(`\n⚠️  BUILD TERMINÉ AVEC ${errorCount} ERREUR(S)`, 'yellow');
    }
    
    return errorCount === 0;
}

// Exécution
if (require.main === module) {
    const success = buildComplete();
    process.exit(success ? 0 : 1);
}

module.exports = buildComplete;