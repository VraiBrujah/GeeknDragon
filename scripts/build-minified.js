#!/usr/bin/env node
/**
 * Script de construction automatique des versions minifiées
 * Génère toutes les versions .min.js à partir des fichiers sources
 * 
 * Utilisation: node scripts/build-minified.js
 * 
 * @author Geek & Dragon - Développement Québécois
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration des fichiers à minifier
const FICHIERS_A_MINIFIER = [
    'js/app.js',
    'js/currency-converter.js',
    'js/coin-lot-optimizer.js',
    'js/snipcart-utils.js',
    'js/hero-videos.js',
    'js/dnd-music-player.js',
    'js/header-scroll-animation.js',
    'js/account-icon-switcher.js',
    'js/boutique-async-loader.js',
    'js/async-stock-loader.js',
    'js/shop-grid-scroll.js'
];

/**
 * Vérifie si Terser est installé globalement ou localement
 * @returns {string} Commande Terser à utiliser
 */
function obtenirCommandeTerser() {
    try {
        execSync('npx terser --version', { stdio: 'ignore' });
        return 'npx terser';
    } catch {
        try {
            execSync('terser --version', { stdio: 'ignore' });
            return 'terser';
        } catch {
            throw new Error('Terser non trouvé. Installer avec: npm install -g terser');
        }
    }
}

/**
 * Minifie un fichier JavaScript avec Terser
 * @param {string} cheminSource - Chemin du fichier source
 * @param {string} cheminSortie - Chemin du fichier minifié
 */
function minifierFichier(cheminSource, cheminSortie) {
    const commandeTerser = obtenirCommandeTerser();
    
    const options = [
        '--compress',
        '--mangle',
        '--output', `"${cheminSortie}"`,
        `"${cheminSource}"`
    ].join(' ');
    
    try {
        execSync(`${commandeTerser} ${options}`, { stdio: 'pipe' });
        
        // Statistiques de compression
        const tailleOriginale = fs.statSync(cheminSource).size;
        const tailleMinifiee = fs.statSync(cheminSortie).size;
        const pourcentageReduction = Math.round((1 - tailleMinifiee / tailleOriginale) * 100);
        
        console.log(`✅ ${cheminSource} → ${cheminSortie}`);
        console.log(`   📊 ${tailleOriginale} bytes → ${tailleMinifiee} bytes (${pourcentageReduction}% réduction)`);
        
        return true;
    } catch (error) {
        console.error(`❌ Erreur minification ${cheminSource}:`, error.message);
        return false;
    }
}

/**
 * Génère le bundle vendor minifié (bibliothèques tierces)
 */
function genererBundleVendor() {
    const fichiersVendor = [
        'js/vendor/swiper-bundle.min.js',
        'js/vendor/fancybox.umd.js'
    ].filter(f => fs.existsSync(f));
    
    if (fichiersVendor.length === 0) {
        console.log('⚠️  Aucun fichier vendor trouvé');
        return;
    }
    
    const contenuBundle = fichiersVendor
        .map(fichier => fs.readFileSync(fichier, 'utf8'))
        .join('\n');
    
    fs.writeFileSync('js/vendor.bundle.min.js', contenuBundle);
    console.log(`✅ Bundle vendor créé: js/vendor.bundle.min.js (${fichiersVendor.length} fichiers)`);
}

/**
 * Génère le bundle application principal
 */
function genererBundleApp() {
    const fichiersApp = [
        'js/app.js',
        'js/currency-converter.js',
        'js/coin-lot-optimizer.js'
    ].filter(f => fs.existsSync(f));
    
    if (fichiersApp.length === 0) {
        console.log('⚠️  Fichiers application principaux non trouvés');
        return;
    }
    
    // Concaténation avec séparateurs
    const contenuBundle = fichiersApp
        .map(fichier => {
            const contenu = fs.readFileSync(fichier, 'utf8');
            return `// === ${path.basename(fichier)} ===\n${contenu}`;
        })
        .join('\n\n');
    
    // Écriture du bundle non-minifié
    fs.writeFileSync('js/app.bundle.js', contenuBundle);
    
    // Minification du bundle
    minifierFichier('js/app.bundle.js', 'js/app.bundle.min.js');
    
    console.log(`✅ Bundle application créé: js/app.bundle.min.js`);
}

/**
 * Fonction principale de construction
 */
function main() {
    console.log('🔧 Construction des versions minifiées...\n');
    
    let succes = 0;
    let echecs = 0;
    
    // Vérification de l'environnement
    try {
        obtenirCommandeTerser();
        console.log('✅ Terser disponible\n');
    } catch (error) {
        console.error('❌', error.message);
        process.exit(1);
    }
    
    // Minification des fichiers individuels
    for (const fichier of FICHIERS_A_MINIFIER) {
        if (!fs.existsSync(fichier)) {
            console.log(`⚠️  Fichier non trouvé: ${fichier}`);
            continue;
        }
        
        const nomBase = path.basename(fichier, '.js');
        const repertoire = path.dirname(fichier);
        const cheminMinifie = path.join(repertoire, `${nomBase}.min.js`);
        
        if (minifierFichier(fichier, cheminMinifie)) {
            succes++;
        } else {
            echecs++;
        }
    }
    
    console.log('\n📦 Génération des bundles...');
    genererBundleVendor();
    genererBundleApp();
    
    console.log('\n📊 Résumé:');
    console.log(`✅ Succès: ${succes} fichiers`);
    console.log(`❌ Échecs: ${echecs} fichiers`);
    
    if (echecs > 0) {
        process.exit(1);
    }
    
    console.log('\n🎉 Construction terminée avec succès!');
}

// Exécution si script appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { minifierFichier, genererBundleApp, genererBundleVendor };