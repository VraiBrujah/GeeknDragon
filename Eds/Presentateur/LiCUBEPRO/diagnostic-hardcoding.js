/**
 * =================================================================
 * DIAGNOSTIC HARDCODING - ANALYSEUR DE VALEURS HARDCODÉES
 * =================================================================
 * 
 * Script pour identifier systématiquement tous les hardcodings
 * numériques dans les 25 pages principales du site Li-CUBE PRO™
 * 
 * @author Claude Code - EDS Québec
 * @version 1.0.0
 */

// Patterns de recherche pour identifier les hardcodings
const HARDCODING_PATTERNS = {
    // Prix en dollars canadiens
    prix: {
        pattern: /\b(5000|5500|12000|12\s*000|150|200|250|275|300)\s*\$?\s*(CAD|cad|dollars?)?\b/gi,
        variables: {
            '5000': 'licube.price_cad_min',
            '5500': 'licube.price_cad_max', 
            '12000': 'nicd.price_cad',
            '12 000': 'nicd.price_cad',
            '150': 'modes.location.licube.monthly_min',
            '200': 'modes.location.licube.monthly_max',
            '250': 'modes.location.nicd.equivalent_monthly_cost',
            '275': 'modes.location.licube.monthly_premium', // Si applicable
            '300': 'nicd.maintenance_cost_per_visit_max'
        }
    },
    
    // Poids en kilogrammes
    poids: {
        pattern: /\b(23|80|100)\s*kg\b/gi,
        variables: {
            '23': 'licube.weight_kg',
            '80': 'nicd.weight_kg',
            '100': 'nicd.weight_kg_max' // Variante haute
        }
    },
    
    // Cycles de batterie
    cycles: {
        pattern: /\b(1500|2000|2500|3000|8000|8\s*000)\s*(cycles?|cycle)\b/gi,
        variables: {
            '1500': 'nicd.cycle_life_min',
            '2000': 'nicd.cycle_life_min',
            '2500': 'nicd.cycle_life_typical',
            '3000': 'nicd.cycle_life_max',
            '8000': 'licube.cycle_life_at_80dod',
            '8 000': 'licube.cycle_life_at_80dod'
        }
    },
    
    // Énergie en Wh
    energie: {
        pattern: /\b(2520|2688|2400)\s*(Wh|wh)\b/gi,
        variables: {
            '2520': 'licube.energy_total_wh',
            '2688': 'licube.energy_total_wh_theoretical', // Si différent
            '2400': 'nicd.energy_total_wh'
        }
    },
    
    // Densité énergétique
    densite: {
        pattern: /\b(110|117|30)\s*(Wh\/kg|wh\/kg)\b/gi,
        variables: {
            '110': 'licube.energy_density_wh_per_kg',
            '117': 'licube.energy_density_wh_per_kg_theoretical',
            '30': 'nicd.energy_density_wh_per_kg'
        }
    },
    
    // Dimensions
    dimensions: {
        pattern: /\b(420|240|155|600|500|300)\s*(mm|×)\b/gi,
        variables: {
            '420': 'licube.dimensions_mm[0]',
            '240': 'licube.dimensions_mm[1]', 
            '155': 'licube.dimensions_mm[2]',
            '600': 'nicd.dimensions_mm[0]',
            '500': 'nicd.dimensions_mm[1]',
            '300': 'nicd.dimensions_mm[2]'
        }
    },
    
    // Temps de charge
    temps_charge: {
        pattern: /\b(1-2|8-12)\s*(h|heures?|hours?)\b/gi,
        variables: {
            '1-2': 'licube.charge_time_hours',
            '8-12': 'nicd.charge_time_hours'
        }
    },
    
    // Pourcentages d'économies
    economies: {
        pattern: /\b(71|74|89|94)\s*%\b/gi,
        variables: {
            '71': 'battery_specs.weight_reduction_percentage',
            '74': 'calculations.tco_vente.savings.percentage_typical',
            '89': 'calculations.tco_vente.savings.percentage_min',
            '94': 'calculations.tco_vente.savings.percentage_max'
        }
    }
};

// Liste des 25 pages à analyser
const PAGES_TO_ANALYZE = [
    // Pages principales (2)
    'edsquebec.html',
    'licubepro.html',
    
    // Presentations vente (11)
    'presentations-vente/presentations-vendeurs/presentation-complete.html',
    'presentations-vente/presentations-vendeurs/calculateur-tco.html',
    'presentations-vente/presentations-vendeurs/calculateur-tco-ancien.html', 
    'presentations-vente/presentations-vendeurs/comparaison-detaillee.html',
    'presentations-vente/images-onepage/comparaison-visuelle.html',
    'presentations-vente/images-onepage/infographie-tco.html',
    'presentations-vente/images-onepage/specifications-techniques.html',
    'presentations-vente/supports-print/brochures/brochure-technique-depliant.html',
    'presentations-vente/supports-print/flyers/flyer-client-standard.html',
    'presentations-vente/supports-print/flyers/flyer-tco-focus.html',
    'presentations-vente/supports-print/posters/poster-convention-a1.html',
    'presentations-vente/versions-pdf/comparatif-tco.html',
    'presentations-vente/versions-pdf/fiche-technique.html',
    'presentations-vente/versions-pdf/presentation-executive.html',
    
    // Presentations location (11) 
    'presentations-location/presentations-vendeurs/presentation-complete.html',
    'presentations-location/presentations-vendeurs/calculateur-tco.html',
    'presentations-location/presentations-vendeurs/calculateur-tco-ancien.html',
    'presentations-location/presentations-vendeurs/comparaison-detaillee.html', 
    'presentations-location/images-onepage/comparaison-visuelle.html',
    'presentations-location/images-onepage/infographie-tco.html',
    'presentations-location/images-onepage/specifications-techniques.html',
    'presentations-location/supports-print/brochures/brochure-technique-depliant.html',
    'presentations-location/supports-print/flyers/flyer-client-standard.html',
    'presentations-location/supports-print/flyers/flyer-tco-focus.html', 
    'presentations-location/supports-print/posters/poster-convention-a1.html',
    'presentations-location/versions-pdf/comparatif-tco.html',
    'presentations-location/versions-pdf/fiche-technique.html',
    'presentations-location/versions-pdf/presentation-executive.html'
];

/**
 * Structure pour stocker les résultats du diagnostic
 */
class DiagnosticResults {
    constructor() {
        this.totalPages = 0;
        this.pagesWithHardcoding = 0;
        this.totalHardcodings = 0;
        this.hardcodingsByType = {};
        this.hardcodingsByPage = {};
        this.recommendedReplacements = [];
    }
    
    addHardcoding(page, type, value, line, context, suggestedVariable) {
        if (!this.hardcodingsByPage[page]) {
            this.hardcodingsByPage[page] = [];
        }
        
        if (!this.hardcodingsByType[type]) {
            this.hardcodingsByType[type] = [];
        }
        
        const hardcoding = {
            page,
            type,
            value,
            line,
            context,
            suggestedVariable
        };
        
        this.hardcodingsByPage[page].push(hardcoding);
        this.hardcodingsByType[type].push(hardcoding);
        this.totalHardcodings++;
        
        this.recommendedReplacements.push({
            file: page,
            search: context.trim(),
            replace: this.generateReplacement(value, suggestedVariable),
            variable: suggestedVariable
        });
    }
    
    generateReplacement(value, variable) {
        return `<span data-pricing-value="${variable}" data-pricing-format="auto">${value}</span>`;
    }
    
    generateReport() {
        this.pagesWithHardcoding = Object.keys(this.hardcodingsByPage).length;
        
        return {
            summary: {
                totalPages: this.totalPages,
                pagesAnalyzed: PAGES_TO_ANALYZE.length,
                pagesWithHardcoding: this.pagesWithHardcoding,
                totalHardcodings: this.totalHardcodings,
                hardcodingPercentage: Math.round((this.pagesWithHardcoding / PAGES_TO_ANALYZE.length) * 100)
            },
            byType: this.hardcodingsByType,
            byPage: this.hardcodingsByPage,
            replacements: this.recommendedReplacements
        };
    }
}

/**
 * Fonction utilitaire pour exporter le rapport
 */
function exportDiagnosticReport(results) {
    const report = results.generateReport();
    
    console.log('='.repeat(80));
    console.log('📋 RAPPORT DE DIAGNOSTIC HARDCODING - Li-CUBE PRO™');
    console.log('='.repeat(80));
    
    console.log('\n🎯 RÉSUMÉ EXÉCUTIF:');
    console.log(`   Pages analysées: ${report.summary.pagesAnalyzed}`);
    console.log(`   Pages avec hardcoding: ${report.summary.pagesWithHardcoding}`);
    console.log(`   Total hardcodings trouvés: ${report.summary.totalHardcodings}`);
    console.log(`   Pourcentage de pages impactées: ${report.summary.hardcodingPercentage}%`);
    
    console.log('\n📊 RÉPARTITION PAR TYPE:');
    Object.entries(report.byType).forEach(([type, hardcodings]) => {
        console.log(`   ${type}: ${hardcodings.length} occurrences`);
    });
    
    console.log('\n📄 RÉPARTITION PAR PAGE:');
    Object.entries(report.byPage).forEach(([page, hardcodings]) => {
        console.log(`   ${page}: ${hardcodings.length} hardcodings`);
    });
    
    console.log('\n🔧 CORRECTIONS RECOMMANDÉES:');
    report.replacements.slice(0, 10).forEach((replacement, index) => {
        console.log(`   ${index + 1}. ${replacement.file}`);
        console.log(`      Rechercher: "${replacement.search}"`);
        console.log(`      Remplacer: "${replacement.replace}"`);
        console.log(`      Variable: ${replacement.variable}\n`);
    });
    
    if (report.replacements.length > 10) {
        console.log(`   ... et ${report.replacements.length - 10} autres corrections`);
    }
    
    return report;
}

// Export pour utilisation dans Node.js ou navigateur
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        HARDCODING_PATTERNS,
        PAGES_TO_ANALYZE,
        DiagnosticResults,
        exportDiagnosticReport
    };
}

// Fonction de test pour valider les patterns
function testPatterns() {
    const testTexts = [
        "Prix de 5000$ pour Li-CUBE PRO™",
        "Batterie Ni-Cd 12 000$ l'unité",
        "Poids de 23 kg seulement",  
        "8000 cycles garantis",
        "Location à 150$/mois",
        "Densité de 110 Wh/kg"
    ];
    
    console.log('🧪 TEST DES PATTERNS:');
    
    Object.entries(HARDCODING_PATTERNS).forEach(([type, config]) => {
        console.log(`\n${type}:`);
        testTexts.forEach(text => {
            const matches = text.match(config.pattern);
            if (matches) {
                console.log(`   ✅ "${text}" → ${matches}`);
            }
        });
    });
}

console.log('✅ Diagnostic Hardcoding configuré - Prêt pour analyse des 25 pages');