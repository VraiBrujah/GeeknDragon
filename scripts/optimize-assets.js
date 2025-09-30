#!/usr/bin/env node

/**
 * Script d'optimisation automatique des assets
 * Compresse les fichiers JS/CSS et génère les versions gzip
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const zlib = require('zlib');

class AssetOptimizer {
    constructor() {
        this.projectRoot = path.join(__dirname, '..');
        this.jsDir = path.join(this.projectRoot, 'js');
        this.cssDir = path.join(this.projectRoot, 'css');
        
        this.stats = {
            filesProcessed: 0,
            originalSize: 0,
            compressedSize: 0,
            gzipSize: 0
        };
    }

    /**
     * Lance l'optimisation complète
     */
    async optimize() {
        console.log('🚀 Démarrage de l\'optimisation des assets...\n');
        
        try {
            // 1. Optimiser les bundles JavaScript
            await this.optimizeJavaScript();
            
            // 2. Optimiser les CSS
            await this.optimizeCSS();
            
            // 3. Créer les versions compressées
            await this.createCompressedVersions();
            
            // 4. Afficher les statistiques
            this.displayStats();
            
            console.log('✅ Optimisation terminée avec succès !');
        } catch (error) {
            console.error('❌ Erreur pendant l\'optimisation:', error.message);
            process.exit(1);
        }
    }

    /**
     * Optimise les fichiers JavaScript
     */
    async optimizeJavaScript() {
        console.log('📦 Optimisation JavaScript...');
        
        // Créer le bundle principal
        try {
            execSync('npm run optimize:js', { 
                stdio: 'inherit', 
                cwd: this.projectRoot 
            });
            console.log('   ✅ Bundle app.bundle.min.js créé');
        } catch (error) {
            console.warn('   ⚠️  Erreur bundle JS:', error.message);
        }

        // Optimiser les autres fichiers JS volumineux
        const jsFiles = [
            'hero-videos.js',
            'dnd-music-player.js',
            'snipcart-utils.js',
            'boutique-premium.js'
        ];

        for (const file of jsFiles) {
            await this.minifyJSFile(file);
        }
    }

    /**
     * Minifie un fichier JavaScript individuel
     */
    async minifyJSFile(filename) {
        const inputPath = path.join(this.jsDir, filename);
        const outputPath = path.join(this.jsDir, filename.replace('.js', '.min.js'));
        
        if (!fs.existsSync(inputPath)) {
            return;
        }

        try {
            execSync(`npx terser "${inputPath}" -c -m -o "${outputPath}"`, {
                stdio: 'pipe',
                cwd: this.projectRoot
            });
            
            const originalSize = fs.statSync(inputPath).size;
            const minifiedSize = fs.statSync(outputPath).size;
            const reduction = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
            
            console.log(`   ✅ ${filename} → ${filename.replace('.js', '.min.js')} (-${reduction}%)`);
            
            this.stats.filesProcessed++;
            this.stats.originalSize += originalSize;
            this.stats.compressedSize += minifiedSize;
        } catch (error) {
            console.warn(`   ⚠️  Erreur minification ${filename}:`, error.message);
        }
    }

    /**
     * Optimise les fichiers CSS
     */
    async optimizeCSS() {
        console.log('🎨 Optimisation CSS...');
        
        try {
            execSync('npm run build', { 
                stdio: 'inherit', 
                cwd: this.projectRoot 
            });
            console.log('   ✅ Tailwind CSS compilé et minifié');
        } catch (error) {
            console.warn('   ⚠️  Erreur compilation CSS:', error.message);
        }

        try {
            execSync('npm run bundle:css', { 
                stdio: 'inherit', 
                cwd: this.projectRoot 
            });
            console.log('   ✅ Bundle CSS vendor créé');
        } catch (error) {
            console.warn('   ⚠️  Erreur bundle CSS:', error.message);
        }
    }

    /**
     * Crée les versions compressées gzip de tous les assets
     */
    async createCompressedVersions() {
        console.log('🗜️  Création des versions compressées...');
        
        // Fichiers à comprimer
        const filesToCompress = [
            // JS files
            path.join(this.jsDir, 'app.bundle.min.js'),
            path.join(this.jsDir, 'vendor.bundle.min.js'),
            path.join(this.jsDir, 'app.js'),
            path.join(this.jsDir, 'currency-converter.js'),
            path.join(this.jsDir, 'coin-lot-optimizer.js'),
            
            // CSS files
            path.join(this.cssDir, 'styles.css'),
            path.join(this.cssDir, 'vendor.bundle.min.css'),
            path.join(this.cssDir, 'snipcart-custom.css')
        ];

        for (const filePath of filesToCompress) {
            await this.compressFile(filePath);
        }
    }

    /**
     * Compresse un fichier avec gzip
     */
    async compressFile(filePath) {
        if (!fs.existsSync(filePath)) {
            return;
        }

        try {
            const input = fs.readFileSync(filePath);
            const compressed = zlib.gzipSync(input, { level: 9 });
            
            const gzipPath = filePath + '.gz';
            fs.writeFileSync(gzipPath, compressed);
            
            const originalSize = input.length;
            const gzipSize = compressed.length;
            const reduction = ((originalSize - gzipSize) / originalSize * 100).toFixed(1);
            
            console.log(`   ✅ ${path.basename(filePath)} → ${path.basename(gzipPath)} (-${reduction}%)`);
            
            this.stats.gzipSize += gzipSize;
        } catch (error) {
            console.warn(`   ⚠️  Erreur compression ${path.basename(filePath)}:`, error.message);
        }
    }

    /**
     * Affiche les statistiques finales
     */
    displayStats() {
        console.log('\n📊 STATISTIQUES D\'OPTIMISATION');
        console.log('═══════════════════════════════');
        
        console.log(`📁 Fichiers traités: ${this.stats.filesProcessed}`);
        
        if (this.stats.originalSize > 0) {
            console.log(`📏 Taille originale: ${this.formatBytes(this.stats.originalSize)}`);
            console.log(`🗜️  Taille compressée: ${this.formatBytes(this.stats.compressedSize)}`);
            
            const minifyReduction = ((this.stats.originalSize - this.stats.compressedSize) / this.stats.originalSize * 100).toFixed(1);
            console.log(`💾 Gain minification: ${minifyReduction}%`);
        }
        
        if (this.stats.gzipSize > 0) {
            console.log(`📦 Taille gzip: ${this.formatBytes(this.stats.gzipSize)}`);
            
            if (this.stats.compressedSize > 0) {
                const gzipReduction = ((this.stats.compressedSize - this.stats.gzipSize) / this.stats.compressedSize * 100).toFixed(1);
                console.log(`🚀 Gain gzip additionnel: ${gzipReduction}%`);
            }
        }
        
        if (this.stats.originalSize > 0 && this.stats.gzipSize > 0) {
            const totalReduction = ((this.stats.originalSize - this.stats.gzipSize) / this.stats.originalSize * 100).toFixed(1);
            console.log(`🎯 Réduction totale: ${totalReduction}%`);
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
    const optimizer = new AssetOptimizer();
    optimizer.optimize().catch(console.error);
}

module.exports = AssetOptimizer;