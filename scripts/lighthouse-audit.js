#!/usr/bin/env node
/**
 * Script d'audit Lighthouse automatisé
 *
 * Génère des rapports de performance baseline pour:
 * - Page d'accueil (desktop + mobile)
 * - Page boutique
 * - Page produit
 *
 * Usage:
 *   npm install -g lighthouse
 *   node scripts/lighthouse-audit.js [url]
 *
 * Exemple:
 *   node scripts/lighthouse-audit.js https://staging.geekndragon.com
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.argv[2] || 'http://localhost:8000';
const OUTPUT_DIR = path.join(__dirname, '../tests/lighthouse-reports');

// Créer dossier de sortie
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Pages à auditer
const PAGES = [
    { name: 'home', path: '/', device: 'desktop' },
    { name: 'home', path: '/', device: 'mobile' },
    { name: 'boutique', path: '/boutique.php', device: 'desktop' },
    { name: 'boutique', path: '/boutique.php', device: 'mobile' },
    { name: 'product', path: '/product.php?id=coin-traveler-offering', device: 'mobile' },
];

// Configuration Lighthouse
const lighthouseOptions = {
    logLevel: 'info',
    output: ['html', 'json'],
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
};

// Configurations device
const deviceConfigs = {
    desktop: {
        formFactor: 'desktop',
        screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1 },
        throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 },
    },
    mobile: {
        formFactor: 'mobile',
        screenEmulation: { mobile: true, width: 375, height: 667, deviceScaleFactor: 2 },
        throttling: { rttMs: 150, throughputKbps: 1638.4, cpuSlowdownMultiplier: 4 },
    },
};

/**
 * Lance un audit Lighthouse pour une page
 */
async function auditPage(chrome, page) {
    const url = `${BASE_URL}${page.path}`;
    const config = deviceConfigs[page.device];

    console.log(`\n🔍 Audit: ${page.name} (${page.device}) - ${url}`);

    const options = {
        ...lighthouseOptions,
        port: chrome.port,
        formFactor: config.formFactor,
        screenEmulation: config.screenEmulation,
        throttling: config.throttling,
    };

    const runnerResult = await lighthouse(url, options);

    // Sauvegarder les rapports
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${timestamp}_${page.name}_${page.device}`;

    // HTML
    const htmlPath = path.join(OUTPUT_DIR, `${filename}.html`);
    fs.writeFileSync(htmlPath, runnerResult.report[0]);

    // JSON
    const jsonPath = path.join(OUTPUT_DIR, `${filename}.json`);
    fs.writeFileSync(jsonPath, runnerResult.report[1]);

    // Extraire métriques clés
    const lhr = runnerResult.lhr;
    const metrics = {
        performance: lhr.categories.performance.score * 100,
        accessibility: lhr.categories.accessibility.score * 100,
        bestPractices: lhr.categories['best-practices'].score * 100,
        seo: lhr.categories.seo.score * 100,
        fcp: lhr.audits['first-contentful-paint'].displayValue,
        lcp: lhr.audits['largest-contentful-paint'].displayValue,
        tti: lhr.audits['interactive'].displayValue,
        cls: lhr.audits['cumulative-layout-shift'].displayValue,
        si: lhr.audits['speed-index'].displayValue,
    };

    console.log(`✓ Performance: ${metrics.performance.toFixed(0)}/100`);
    console.log(`  - FCP: ${metrics.fcp}`);
    console.log(`  - LCP: ${metrics.lcp}`);
    console.log(`  - CLS: ${metrics.cls}`);
    console.log(`  - SI: ${metrics.si}`);
    console.log(`✓ Accessibility: ${metrics.accessibility.toFixed(0)}/100`);
    console.log(`✓ Best Practices: ${metrics.bestPractices.toFixed(0)}/100`);
    console.log(`✓ SEO: ${metrics.seo.toFixed(0)}/100`);
    console.log(`📄 Rapports: ${htmlPath}`);

    return { page, metrics };
}

/**
 * Génère un rapport comparatif
 */
function generateSummary(results) {
    const summaryPath = path.join(OUTPUT_DIR, 'summary.md');
    const timestamp = new Date().toISOString();

    let markdown = `# Rapport Lighthouse - ${timestamp}\n\n`;
    markdown += `**URL de base**: ${BASE_URL}\n\n`;
    markdown += `## Résultats par Page\n\n`;

    results.forEach(({ page, metrics }) => {
        markdown += `### ${page.name} (${page.device})\n\n`;
        markdown += `| Catégorie | Score |\n`;
        markdown += `|-----------|-------|\n`;
        markdown += `| Performance | ${metrics.performance.toFixed(0)}/100 |\n`;
        markdown += `| Accessibility | ${metrics.accessibility.toFixed(0)}/100 |\n`;
        markdown += `| Best Practices | ${metrics.bestPractices.toFixed(0)}/100 |\n`;
        markdown += `| SEO | ${metrics.seo.toFixed(0)}/100 |\n\n`;
        markdown += `**Core Web Vitals**:\n`;
        markdown += `- FCP: ${metrics.fcp}\n`;
        markdown += `- LCP: ${metrics.lcp}\n`;
        markdown += `- CLS: ${metrics.cls}\n`;
        markdown += `- Speed Index: ${metrics.si}\n\n`;
    });

    markdown += `## Recommandations Prioritaires\n\n`;
    markdown += `### Performance\n`;
    markdown += `- [ ] Optimiser images (WebP, lazy-loading)\n`;
    markdown += `- [ ] Réduire JavaScript non utilisé\n`;
    markdown += `- [ ] Implémenter service worker pour cache\n`;
    markdown += `- [ ] Minifier CSS/JS si pas déjà fait\n\n`;

    markdown += `### Accessibilité\n`;
    markdown += `- [ ] Vérifier contrastes couleurs (WCAG AA)\n`;
    markdown += `- [ ] Ajouter alt textes manquants\n`;
    markdown += `- [ ] Tester navigation clavier complète\n\n`;

    markdown += `### SEO\n`;
    markdown += `- [ ] Vérifier meta descriptions uniques\n`;
    markdown += `- [ ] Valider données structurées (schema.org)\n`;
    markdown += `- [ ] Optimiser crawlabilité (sitemap, robots.txt)\n\n`;

    fs.writeFileSync(summaryPath, markdown);
    console.log(`\n📊 Rapport comparatif: ${summaryPath}`);
}

/**
 * Main
 */
(async () => {
    console.log('🚀 Démarrage audits Lighthouse...');
    console.log(`📍 URL de base: ${BASE_URL}`);
    console.log(`📁 Rapports: ${OUTPUT_DIR}`);

    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });

    try {
        const results = [];

        for (const page of PAGES) {
            const result = await auditPage(chrome, page);
            results.push(result);
        }

        generateSummary(results);

        console.log('\n✅ Tous les audits terminés!');
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    } finally {
        await chrome.kill();
    }
})();
