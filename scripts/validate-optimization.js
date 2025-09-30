#!/usr/bin/env node

/**
 * Script de validation de l'optimisation
 * Vérifie que tous les fichiers optimisés existent et fonctionnent
 */

const fs = require('fs');
const path = require('path');

class OptimizationValidator {
    constructor() {
        this.projectRoot = path.join(__dirname, '..');
        this.errors = [];
        this.warnings = [];
        this.successes = [];
    }

    /**
     * Lance la validation complète
     */
    async validate() {
        console.log('🔍 Validation de l\'optimisation...\n');

        this.validateMinifiedFiles();
        this.validateBundles();
        this.validateGzipFiles();
        this.validateScriptLoader();
        this.validatePageUpdates();

        this.displayResults();
        return this.errors.length === 0;
    }

    /**
     * Vérifie l'existence des fichiers minifiés
     */
    validateMinifiedFiles() {
        const expectedMinFiles = [
            'js/app.bundle.min.js',
            'js/hero-videos.min.js',
            'js/dnd-music-player.min.js',
            'js/snipcart-utils.min.js',
            'js/boutique-premium.min.js'
        ];

        expectedMinFiles.forEach(file => {
            const filePath = path.join(this.projectRoot, file);
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                this.successes.push(`✅ ${file} (${this.formatBytes(stats.size)})`);
            } else {
                this.errors.push(`❌ Fichier minifié manquant: ${file}`);
            }
        });
    }

    /**
     * Vérifie les bundles optimisés
     */
    validateBundles() {
        const bundles = [
            { file: 'js/app.bundle.min.js', expectedSources: ['app.js', 'currency-converter.js', 'coin-lot-optimizer.js'] },
            { file: 'js/vendor.bundle.min.js', expectedSources: ['swiper-bundle.min.js', 'fancybox.umd.js'] }
        ];

        bundles.forEach(bundle => {
            const bundlePath = path.join(this.projectRoot, bundle.file);
            if (fs.existsSync(bundlePath)) {
                const stats = fs.statSync(bundlePath);
                
                // Calculer la taille des sources originales
                let totalOriginalSize = 0;
                let missingOriginals = [];
                
                bundle.expectedSources.forEach(source => {
                    const sourcePath = path.join(this.projectRoot, 'js', source);
                    if (fs.existsSync(sourcePath)) {
                        totalOriginalSize += fs.statSync(sourcePath).size;
                    } else {
                        missingOriginals.push(source);
                    }
                });

                if (missingOriginals.length === 0) {
                    const reduction = ((totalOriginalSize - stats.size) / totalOriginalSize * 100).toFixed(1);
                    this.successes.push(`✅ Bundle ${bundle.file}: ${this.formatBytes(stats.size)} (-${reduction}%)`);
                } else {
                    this.warnings.push(`⚠️ Bundle ${bundle.file} existe mais sources manquantes: ${missingOriginals.join(', ')}`);
                }
            } else {
                this.errors.push(`❌ Bundle manquant: ${bundle.file}`);
            }
        });
    }

    /**
     * Vérifie les fichiers compressés gzip
     */
    validateGzipFiles() {
        const expectedGzipFiles = [
            'js/app.bundle.min.js.gz',
            'js/vendor.bundle.min.js.gz',
            'css/styles.css.gz',
            'css/vendor.bundle.min.css.gz'
        ];

        expectedGzipFiles.forEach(file => {
            const filePath = path.join(this.projectRoot, file);
            const originalPath = filePath.replace('.gz', '');
            
            if (fs.existsSync(filePath) && fs.existsSync(originalPath)) {
                const gzipStats = fs.statSync(filePath);
                const originalStats = fs.statSync(originalPath);
                const reduction = ((originalStats.size - gzipStats.size) / originalStats.size * 100).toFixed(1);
                
                this.successes.push(`✅ ${file}: ${this.formatBytes(gzipStats.size)} (-${reduction}%)`);
            } else if (fs.existsSync(originalPath)) {
                this.warnings.push(`⚠️ Fichier gzip manquant: ${file} (original existe)`);
            } else {
                this.errors.push(`❌ Fichier original et gzip manquants: ${file}`);
            }
        });
    }

    /**
     * Vérifie le script-loader
     */
    validateScriptLoader() {
        const scriptLoaderPath = path.join(this.projectRoot, 'includes', 'script-loader.php');
        
        if (fs.existsSync(scriptLoaderPath)) {
            const content = fs.readFileSync(scriptLoaderPath, 'utf8');
            
            // Vérifier les fonctions essentielles
            const requiredFunctions = [
                'class ScriptLoader',
                'loadMainBundle',
                'loadScript',
                'loadGameHelpScripts',
                'function load_optimized_scripts'
            ];

            requiredFunctions.forEach(func => {
                if (content.includes(func)) {
                    this.successes.push(`✅ ScriptLoader: ${func} présent`);
                } else {
                    this.errors.push(`❌ ScriptLoader: ${func} manquant`);
                }
            });
        } else {
            this.errors.push('❌ Script-loader.php manquant');
        }
    }

    /**
     * Vérifie les mises à jour des pages
     */
    validatePageUpdates() {
        const pagesWithScripts = [
            'aide-jeux.php',
            'boutique.php',
            'index.php'
        ];

        pagesWithScripts.forEach(page => {
            const pagePath = path.join(this.projectRoot, page);
            
            if (fs.existsSync(pagePath)) {
                const content = fs.readFileSync(pagePath, 'utf8');
                
                if (content.includes('script-loader.php')) {
                    this.successes.push(`✅ ${page}: utilise script-loader`);
                } else if (content.includes('app.bundle.min.js')) {
                    this.successes.push(`✅ ${page}: utilise bundle optimisé`);
                } else if (content.includes('app.js')) {
                    this.warnings.push(`⚠️ ${page}: utilise encore app.js individuel`);
                } else {
                    this.warnings.push(`⚠️ ${page}: aucun script détecté`);
                }
            } else {
                this.errors.push(`❌ Page manquante: ${page}`);
            }
        });
    }

    /**
     * Affiche les résultats de la validation
     */
    displayResults() {
        console.log('\n📊 RÉSULTATS DE LA VALIDATION');
        console.log('═══════════════════════════════\n');

        if (this.successes.length > 0) {
            console.log('🎉 SUCCÈS:\n');
            this.successes.forEach(success => console.log('  ' + success));
            console.log('');
        }

        if (this.warnings.length > 0) {
            console.log('⚠️  AVERTISSEMENTS:\n');
            this.warnings.forEach(warning => console.log('  ' + warning));
            console.log('');
        }

        if (this.errors.length > 0) {
            console.log('❌ ERREURS:\n');
            this.errors.forEach(error => console.log('  ' + error));
            console.log('');
        }

        // Résumé
        const total = this.successes.length + this.warnings.length + this.errors.length;
        const successRate = ((this.successes.length / total) * 100).toFixed(1);

        console.log('📈 RÉSUMÉ:');
        console.log(`   Succès: ${this.successes.length}`);
        console.log(`   Avertissements: ${this.warnings.length}`);
        console.log(`   Erreurs: ${this.errors.length}`);
        console.log(`   Taux de réussite: ${successRate}%`);

        if (this.errors.length === 0) {
            console.log('\n🎯 ✅ VALIDATION RÉUSSIE ! Optimisation correctement appliquée.');
        } else {
            console.log('\n🎯 ❌ VALIDATION ÉCHOUÉE ! Corriger les erreurs avant déploiement.');
        }
    }

    /**
     * Formate les bytes en unités lisibles
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
    }
}

// Exécution si appelé directement
if (require.main === module) {
    const validator = new OptimizationValidator();
    validator.validate().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Erreur during validation:', error);
        process.exit(1);
    });
}

module.exports = OptimizationValidator;