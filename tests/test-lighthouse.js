#!/usr/bin/env node
/**
 * Test rapide Lighthouse sur serveur local
 *
 * Vérifie que Lighthouse fonctionne correctement
 * avant audit complet sur staging.
 */

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

console.log('🔍 Test Lighthouse simplifié...\n');

(async () => {
    let chrome;

    try {
        // Lancer Chrome headless
        console.log('🚀 Démarrage Chrome...');
        chrome = await chromeLauncher.launch({
            chromeFlags: ['--headless', '--no-sandbox']
        });

        console.log('✓ Chrome démarré\n');

        // Configuration minimale
        const options = {
            logLevel: 'error',
            output: 'json',
            onlyCategories: ['performance'],
            port: chrome.port,
            formFactor: 'mobile',
        };

        const url = process.argv[2] || 'http://localhost:8080';
        console.log(`📍 URL: ${url}`);
        console.log('⏳ Audit en cours (peut prendre 30s)...\n');

        // Exécuter audit
        const runnerResult = await lighthouse(url, options);

        // Extraire score
        const score = runnerResult.lhr.categories.performance.score * 100;
        const fcp = runnerResult.lhr.audits['first-contentful-paint'].displayValue;
        const lcp = runnerResult.lhr.audits['largest-contentful-paint'].displayValue;

        // Afficher résultats
        console.log('=== RÉSULTATS ===');
        console.log(`✓ Performance: ${score.toFixed(0)}/100`);
        console.log(`  - FCP: ${fcp}`);
        console.log(`  - LCP: ${lcp}`);
        console.log('\n✅ Lighthouse fonctionne correctement!');
        console.log('\nPour audit complet:');
        console.log('  npm run audit:lighthouse https://votre-site.com');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    } finally {
        if (chrome) {
            await chrome.kill();
        }
    }
})();
