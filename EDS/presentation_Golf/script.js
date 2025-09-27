// Données centralisées - architecture optimisée
let data = {};
let variables = {};
let formulas = {};
let currentLanguage = 'fr'; // Langue par défaut

// Fonction helper pour générer un gradient CSS depuis les couleurs CSV
function generateGradientCSS(key, section) {
    if (!section._colors || !section._colors[key]) {
        return null;
    }

    const colorInfo = section._colors[key];

    // Si on a 2 couleurs de gradient, créer un linear-gradient
    if (colorInfo.gradientColor1 && colorInfo.gradientColor2) {
        return `linear-gradient(135deg, ${colorInfo.gradientColor1}, ${colorInfo.gradientColor2})`;
    }

    // Sinon utiliser la couleur simple si présente
    if (colorInfo.color) {
        return colorInfo.color;
    }

    return null;
}

// Fonction pour changer de langue
function switchLanguage(lang) {
    currentLanguage = lang;

    // Mettre à jour les boutons actifs
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });

    // Recharger les données dans la nouvelle langue
    loadAllData();
}

// Fonction pour charger un fichier CSV (helper)
async function loadCSV(filename) {
    const response = await fetch(filename + '?t=' + Date.now()); // Cache busting
    if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} pour ${filename}`);
    }
    const csvText = await response.text();
    const lines = csvText.split('\n');
    const result = {};

    // Déterminer si c'est un fichier structuré (variables/formulas) ou un fichier de données texte
    const firstLine = lines[0];
    const isStructuredFile = firstLine.includes('variable_id') || firstLine.includes('formula_id');

    if (isStructuredFile) {
        // Parser pour variables.csv et formulas.csv
        const headers = firstLine.split(',').map(h => h.trim());

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line && !line.startsWith('#')) {
                const parts = line.split(',');
                if (parts.length >= headers.length) {
                    const row = {};
                    headers.forEach((header, index) => {
                        let value = parts[index] ? parts[index].trim() : '';
                        if (value.startsWith('"') && value.endsWith('"')) {
                            value = value.slice(1, -1);
                        }
                        row[header] = value;
                    });

                    if (row.variable_id || row.formula_id) {
                        result[row.variable_id || row.formula_id] = row;
                    }
                }
            }
        }
    } else {
        // Parser pour data_clean.csv (section,key,value,color,gradient_color_1,gradient_color_2)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line && !line.startsWith('#')) {
                const parts = line.split(',');
                if (parts.length >= 3) {
                    const section = parts[0].trim();
                    const key = parts[1].trim();

                    // Parser les 6 colonnes: section,key,value,color,gradient_color_1,gradient_color_2
                    let value = parts[2] ? parts[2].trim() : '';
                    let color = parts[3] ? parts[3].trim() : '';
                    let gradientColor1 = parts[4] ? parts[4].trim() : '';
                    let gradientColor2 = parts[5] ? parts[5].trim() : '';

                    // Nettoyer les guillemets
                    if (value.startsWith('"') && value.endsWith('"')) {
                        value = value.slice(1, -1);
                    }

                    if (section && key) {
                        if (!result[section]) {
                            result[section] = {};
                        }

                        // Stocker la valeur
                        result[section][key] = value;

                        // Stocker les informations de couleur si présentes
                        if (color || gradientColor1 || gradientColor2) {
                            if (!result[section]._colors) {
                                result[section]._colors = {};
                            }
                            result[section]._colors[key] = {
                                color: color || null,
                                gradientColor1: gradientColor1 || null,
                                gradientColor2: gradientColor2 || null
                            };
                        }

                        // Stocker la couleur si présente
                        if (color && color.startsWith('#')) {
                            if (!result[section + '_colors']) {
                                result[section + '_colors'] = {};
                            }
                            result[section + '_colors'][key] = color;
                        }
                    }
                }
            }
        }
    }

    return result;
}

// Fonction pour récupérer une variable numérique centralisée
function getVariable(variableId) {
    // Override dynamique pour le taux horaire du technicien
    if (variableId === 'lead_technician_hourly_rate') {
        return currentTechnicianRate;
    }

    const variable = variables[variableId];
    if (!variable) {
        console.warn(`Variable non trouvée: ${variableId}`);
        return 0;
    }
    return parseFloat(variable.value) || 0;
}

// Fonction pour calculer une formule depuis formulas.csv avec les variables actuelles
function calculateFormula(formulaId) {
    // Formules calculées dynamiquement pour éviter hardcodage
    switch (formulaId) {
        // FORMULE UNIVERSELLE pour coût remplacements avec risque
        case 'lead_replacement_cost_with_risk_10y':
            const leadCost = getVariable('lead_cost_replacement_unit');
            const cycle = getVariable('lead_replacement_cycle_years');
            const warrantyFree = getVariable('warranty_replacements');
            const riskPercent = getVariable('premature_failure_percent');

            // UTILISE LA FORMULE DU CSV : FLOOR(10 / cycle) pour cohérence
            const totalReplacements = Math.floor(10 / cycle); // Formule CSV existante
            const paidReplacements = Math.max(0, totalReplacements - warrantyFree); // Moins 1 gratuit garantie
            const baseCost = paidReplacements * leadCost;
            const riskCost = baseCost * (riskPercent / 100); // +20% risque bris prématuré

            return baseCost + riskCost;

        case 'lead_replacement_cost_with_risk_20y':
            const leadCost20 = getVariable('lead_cost_replacement_unit');
            const cycle20 = getVariable('lead_replacement_cycle_years');
            const warrantyFree20 = getVariable('warranty_replacements');
            const riskPercent20 = getVariable('premature_failure_percent');

            // UTILISE LA FORMULE DU CSV : FLOOR(20 / cycle) pour cohérence
            const totalReplacements20 = Math.floor(20 / cycle20); // Formule CSV existante
            const paidReplacements20 = Math.max(0, totalReplacements20 - warrantyFree20); // Moins 1 gratuit
            const baseCost20 = paidReplacements20 * leadCost20;
            const riskCost20 = baseCost20 * (riskPercent20 / 100); // +20% risque bris prématuré

            return baseCost20 + riskCost20;
        // ===== COÛTS TOTAUX UTILISANT LA FORMULE UNIVERSELLE =====
        case 'lead_total_10y_per_cart':
            // Utilise la formule universelle avec risque pour les remplacements
            return calculateFormula('lead_replacement_cost_with_risk_10y') +
                   calculateFormula('lead_maintenance_total_10y') +
                   getVariable('recycling_disposal_cost') +
                   ((getVariable('revenue_loss_yearly') + getVariable('overconsumption_cost_yearly') + getVariable('insurance_increase_yearly')) * 10);

        case 'lead_total_20y_per_cart':
            // Utilise la formule universelle avec risque pour les remplacements
            const totalReplacements20Years = Math.floor(20 / getVariable('lead_replacement_cycle_years')); // Formule CSV
            return calculateFormula('lead_replacement_cost_with_risk_20y') +
                   calculateFormula('lead_maintenance_total_20y') +
                   (getVariable('recycling_disposal_cost') * totalReplacements20Years) +
                   ((getVariable('revenue_loss_yearly') + getVariable('overconsumption_cost_yearly') + getVariable('insurance_increase_yearly')) * 20);

        case 'lead_replacements_20y':
            return Math.floor(20 / getVariable('lead_replacement_cycle_years')); // Formule CSV

        case 'lead_replacements_paid_20y':
            return Math.max(0, Math.floor(20 / getVariable('lead_replacement_cycle_years')) - 1); // Formule CSV

        case 'lifepo4_total_10y_per_cart':
            return getVariable('lifepo4_monthly_10y') * 12 * 10;

        case 'lifepo4_total_20y_per_cart':
            return getVariable('lifepo4_monthly_20y') * 12 * 20;

        case 'lifepo4_total_fleet_per_cart':
            return getVariable('lifepo4_monthly_fleet') * 12 * 20;

        case 'savings_10y_per_cart':
            return calculateFormula('lead_total_10y_per_cart') - calculateFormula('lifepo4_total_10y_per_cart');

        case 'savings_20y_per_cart':
            return calculateFormula('lead_total_20y_per_cart') - calculateFormula('lifepo4_total_20y_per_cart');

        case 'savings_fleet_per_cart':
            return calculateFormula('lead_total_20y_per_cart') - calculateFormula('lifepo4_total_fleet_per_cart');

        // FORMULES DE TEXTE - Section TOTAL des Coûts Cachés Réels
        case 'operational_risks_breakdown':
            const revenueLoss = getVariable('revenue_loss_yearly');
            const overconsumption = getVariable('overconsumption_cost_yearly');
            const insurance = getVariable('insurance_increase_yearly');
            const recycling = getVariable('recycling_disposal_cost');
            const total = revenueLoss + overconsumption + insurance + recycling;
            return `${Math.round(revenueLoss)}$ + ${Math.round(overconsumption)}$ + ${Math.round(insurance)}$ + ${Math.round(recycling)}$ = ${Math.round(total)}$ par voiturette par an`;

        case 'total_breakdown_calculation_10y':
            const replacementCost = calculateFormula('lead_replacement_cost_with_risk_10y');
            const maintenanceCost = calculateFormula('lead_maintenance_total_10y');
            const operationalRisks = calculateFormula('operational_risks_calculation_yearly') * 10;
            const recyclingCost = getVariable('recycling_disposal_cost');
            return `Remplacements avec risque: ${Math.round(replacementCost)}$ + Maintenance: ${Math.round(maintenanceCost)}$ + Risques opérationnels: ${Math.round(operationalRisks)}$ + Recyclage: ${Math.round(recyclingCost)}$`;

        case 'total_cost_simplified_10y':
            const replacementCost10 = calculateFormula('lead_replacement_cost_with_risk_10y');
            const maintenanceCost10 = calculateFormula('lead_maintenance_total_10y');
            const operationalRisks10 = calculateFormula('operational_risks_calculation_yearly') * 10;
            const recyclingCost10 = getVariable('recycling_disposal_cost');
            return replacementCost10 + maintenanceCost10 + operationalRisks10 + recyclingCost10;

        case 'total_cost_final_calculation_10y':
            // CHANGEMENT: Utiliser 20 ans pour les calculs principaux
            const totalCost = calculateFormula('lead_total_20y_per_cart');
            return `TOTAL RÉEL avec risque de bris prématuré : ${Math.round(totalCost)}$ par voiturette sur 20 ans`;

        case 'operational_risks_calculation_yearly':
            return getVariable('revenue_loss_yearly') + getVariable('overconsumption_cost_yearly') + getVariable('insurance_increase_yearly');

        case 'lead_maintenance_total_10y':
            return getVariable('lead_maintenance_hours_unit') * 10 * getVariable('lead_technician_hourly_rate');

        case 'lead_maintenance_total_20y':
            return getVariable('lead_maintenance_hours_unit') * 20 * getVariable('lead_technician_hourly_rate');

        default:
            console.warn(`Formule '${formulaId}' non trouvée`);
            return 0;
    }
}

// Fonction principale pour charger toutes les données
async function loadAllData() {
    try {
        console.log('🚀 Chargement architecture centralisée...');

        // Charger en parallèle les 3 fichiers
        const [textData, variablesData, formulasData] = await Promise.all([
            loadCSV(currentLanguage === 'fr' ? 'data_clean.csv' : 'data_en_clean.csv'),
            loadCSV('variables.csv'),
            loadCSV('formulas.csv')
        ]);

        // Stocker les données
        data = textData;
        variables = variablesData;
        formulas = formulasData;

        console.log('✅ Architecture chargée:', {
            textSections: Object.keys(textData).length,
            variables: Object.keys(variables).length,
            formulas: Object.keys(formulas).length
        });

        console.log('📝 Données sample:', {
            textSample: Object.keys(data).slice(0, 3),
            variablesSample: Object.keys(variables).slice(0, 3),
            formulasSample: Object.keys(formulas).slice(0, 3)
        });

        // Test rapide pour vérifier si les données sont accessibles
        console.log('🧪 Test accès données:', {
            headerExists: !!data.header,
            heroExists: !!data.hero,
            companyName: data.header?.company_name,
            heroTitle: data.hero?.main_title
        });

        updateContent();
        console.log('🎉 updateContent() terminé');

        // Appliquer les couleurs du CSV au CSS
        applyColorsFromCSV();
        console.log('🎨 Couleurs appliquées depuis le CSV');

        // Appliquer les arrière-plans depuis le CSV
        applyBackgroundColors();
        console.log('🎨 Arrière-plans appliqués depuis le CSV');

    } catch (error) {
        console.error('❌ Erreur lors du chargement:', error);
        console.error('Stack trace:', error.stack);

        // En cas d'erreur, essayer de charger le français par défaut
        if (currentLanguage !== 'fr') {
            console.log('⚠️ Tentative de fallback vers français...');
            currentLanguage = 'fr';
            await loadAllData();
        } else {
            console.error('💥 Échec définitif du chargement');
            // Afficher un message d'erreur à l'utilisateur
            document.body.innerHTML = '<h1 style="color: red;">Erreur de chargement des données</h1><p>' + error.message + '</p>';
        }
    }
}


// Fonction pour parser le Markdown et HTML basique dans les textes
function parseMarkdownAndHTML(text) {
    if (!text) return text;

    // Support Markdown basique
    // Gras **texte** ou __texte__
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Italique *texte* ou _texte_
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/_(.*?)_/g, '<em>$1</em>');

    // Support retours à la ligne
    // <br> reste tel quel (déjà du HTML)
    // \n devient <br>
    text = text.replace(/\\n/g, '<br>');
    // Doubles retours à la ligne pour nouveaux paragraphes
    text = text.replace(/\n\n/g, '</p><p>');
    text = text.replace(/\n/g, '<br>');

    // Support listes simples
    // - item devient <li>item</li> (dans des <ul>)
    text = text.replace(/^- (.+)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Support code inline `code`
    text = text.replace(/`(.*?)`/g, '<code>$1</code>');

    return text;
}

// Fonction pour appliquer les couleurs du CSV au CSS
function applyColorsFromCSV() {
    if (!data.colors) return;

    // Obtenir ou créer l'élément style pour les couleurs dynamiques
    let styleElement = document.getElementById('dynamic-colors');
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'dynamic-colors';
        document.head.appendChild(styleElement);
    }

    // Construire le CSS avec les couleurs du CSV
    let cssRules = ':root {\n';

    // Couleurs principales des sections
    if (data.colors.cost_replacement) cssRules += `    --cost-replacement: ${data.colors.cost_replacement};\n`;
    if (data.colors.cost_maintenance) cssRules += `    --cost-maintenance: ${data.colors.cost_maintenance};\n`;
    if (data.colors.cost_operational) cssRules += `    --cost-operational: ${data.colors.cost_operational};\n`;
    if (data.colors.cost_recycling) cssRules += `    --cost-recycling: ${data.colors.cost_recycling};\n`;
    if (data.colors.cost_total) cssRules += `    --cost-total: ${data.colors.cost_total};\n`;

    // Arrière-plans des sections
    if (data.colors.bg_replacement) cssRules += `    --bg-replacement: ${data.colors.bg_replacement};\n`;
    if (data.colors.bg_maintenance) cssRules += `    --bg-maintenance: ${data.colors.bg_maintenance};\n`;
    if (data.colors.bg_operational) cssRules += `    --bg-operational: ${data.colors.bg_operational};\n`;
    if (data.colors.bg_recycling) cssRules += `    --bg-recycling: ${data.colors.bg_recycling};\n`;
    if (data.colors.bg_total) cssRules += `    --bg-total: ${data.colors.bg_total};\n`;

    cssRules += '}';

    // Appliquer le CSS
    styleElement.textContent = cssRules;

    console.log('Couleurs appliquées depuis le CSV:', cssRules);
}

// Fonction pour appliquer les arrière-plans des sections depuis les CSV
function applyBackgroundColors() {
    if (!data.backgrounds) return;

    console.log('Application des arrière-plans depuis les CSV...');

    // Mappage des clés CSV vers les IDs/sélecteurs HTML
    const backgroundMapping = {
        'hero_section': '.hero-section, #hero',
        'problem_section': '.problem-section, #problem',
        'vs_batteries_section': '.vs-batteries-section, #vs-batteries',
        'solution_section': '.solution-section, #solution',
        'pricing_section': '.pricing-section, #pricing',
        'benefits_section': '.benefits-section, #benefits',
        'testimonial_section': '.testimonial-section, #testimonial',
        'contact_section': '.contact-section, #contact',
        'calculator_section': '.calculator-section, #calculator',
        'problem_details_section_1': '.problem-details-1, #problem-details-section-1',
        'problem_details_section_2': '.problem-details-2, #problem-details-section-2',
        'problem_details_section_3': '.problem-details-3, #problem-details-section-3',
        'problem_details_section_4': '.problem-details-4, #problem-details-section-4',
        'vs_lead_card': '.vs-lead-card, .lead-battery-card',
        'vs_lifepo4_card': '.vs-lifepo4-card, .lifepo4-battery-card',
        'comparison_table': '.comparison-table, #comparison',
        'pricing_card_10': '.pricing-card-10',
        'pricing_card_20': '.pricing-card-20',
        'pricing_card_fleet': '.pricing-card-fleet'
    };

    // Créer ou mettre à jour l'élément style pour les arrière-plans
    let bgStyleElement = document.getElementById('dynamic-backgrounds');
    if (!bgStyleElement) {
        bgStyleElement = document.createElement('style');
        bgStyleElement.id = 'dynamic-backgrounds';
        document.head.appendChild(bgStyleElement);
    }

    let cssRules = '';

    // Appliquer chaque arrière-plan
    Object.keys(backgroundMapping).forEach(bgKey => {
        const color = data.backgrounds[bgKey];
        const selectors = backgroundMapping[bgKey];

        if (color && selectors) {
            cssRules += `${selectors} { background-color: ${color} !important; }\n`;
            console.log(`Arrière-plan appliqué: ${selectors} -> ${color}`);
        }
    });

    // Ajouter les couleurs des tableaux (règles ultra-spécifiques)
    if (data.table_colors) {
        cssRules += `
        /* Structure tableau de base */
        .comparison-table {
            width: 100% !important;
            border-collapse: collapse !important;
            border-radius: 10px !important;
            overflow: hidden !important;
            margin: 2rem 0 !important;
        }

        /* En-têtes tableau - FORCÉ */
        .comparison-table thead th,
        .comparison-table th {
            background: ${data.table_colors.header_bg} !important;
            color: ${data.table_colors.header_text} !important;
            padding: 20px 15px !important;
            font-weight: bold !important;
            font-size: 1.1rem !important;
            text-align: center !important;
            border: none !important;
        }

        /* Lignes alternées - FORCÉ avec spécificité max */
        .comparison-table tbody tr:nth-child(1) td {
            background-color: ${data.table_colors.cell_bg_primary} !important;
            color: ${data.table_colors.cell_text} !important;
        }
        .comparison-table tbody tr:nth-child(2) td {
            background-color: ${data.table_colors.cell_bg_secondary} !important;
            color: ${data.table_colors.cell_text} !important;
        }
        .comparison-table tbody tr:nth-child(3) td {
            background-color: ${data.table_colors.cell_bg_primary} !important;
            color: ${data.table_colors.cell_text} !important;
        }
        .comparison-table tbody tr:nth-child(4) td {
            background-color: ${data.table_colors.cell_bg_secondary} !important;
            color: ${data.table_colors.cell_text} !important;
        }

        /* Toutes les cellules - style de base */
        .comparison-table td {
            padding: 15px !important;
            text-align: center !important;
            border: 1px solid ${data.table_colors.cell_border} !important;
            color: ${data.table_colors.cell_text} !important;
        }

        /* Première colonne (critères) */
        .comparison-table td:first-child,
        .comparison-table td:nth-child(1) {
            text-align: left !important;
            font-weight: bold !important;
            color: #ffffff !important;
            background-color: rgba(30, 64, 175, 0.9) !important;
        }

        /* Valeurs technologie ancienne (rouge) */
        .comparison-table .old-tech,
        .comparison-table td.old-tech {
            color: ${data.table_colors.old_tech} !important;
            font-weight: bold !important;
            background-color: rgba(239, 68, 68, 0.1) !important;
        }

        /* Valeurs nouvelle technologie (cyan) */
        .comparison-table .new-tech,
        .comparison-table td.new-tech {
            color: ${data.table_colors.new_tech} !important;
            font-weight: bold !important;
            background-color: rgba(34, 211, 238, 0.1) !important;
        }

        /* Titre de la comparaison */
        .comparison-title {
            color: ${data.table_colors.comparison_title} !important;
            font-size: 2rem !important;
            margin-bottom: 2rem !important;
            text-align: center !important;
        }
        `;
    }

    // Ajouter les couleurs des sections pricing
    if (data.pricing_colors) {
        cssRules += `
        .pricing-section { background-color: ${data.pricing_colors.section_bg} !important; }
        .pricing-card {
            background: linear-gradient(135deg, #1e293b, #374151) !important;
            color: ${data.pricing_colors.card_text} !important;
            border: 2px solid rgba(59, 130, 246, 0.3) !important;
        }
        .pricing-card.premium {
            background: linear-gradient(135deg, #065f46, #059669) !important;
            color: ${data.pricing_colors.card_text} !important;
            border: 2px solid rgba(5, 150, 105, 0.5) !important;
        }
        .pricing-card.fleet {
            background: linear-gradient(135deg, #581c87, #7c3aed) !important;
            color: ${data.pricing_colors.card_text} !important;
            border: 2px solid rgba(124, 58, 237, 0.5) !important;
        }
        .pricing-card h3 { color: ${data.pricing_colors.card_title} !important; }
        .pricing-card .price { color: ${data.pricing_colors.price_text} !important; }
        .pricing-card .savings { color: ${data.pricing_colors.savings_text} !important; }
        `;
    }

    // Ajouter les nouvelles couleurs optimisées pour toutes les sections (visuels 3-8)
    if (data.defis_section) {
        cssRules += `
        .defis-section, #defis, .challenges-section {
            background: ${data.defis_section.background_gradient} !important;
        }
        .defis-section h2, .challenges-section h2 {
            color: ${data.defis_section.title_color} !important;
        }
        .defis-section h3, .challenges-section h3 {
            color: ${data.defis_section.subtitle_color} !important;
        }
        .defis-section .card, .challenges-section .card {
            background-color: ${data.defis_section.card_background} !important;
            border: 2px solid ${data.defis_section.card_border} !important;
            color: ${data.defis_section.problem_text} !important;
        }
        .defis-section .cost-highlight, .challenges-section .cost-highlight {
            color: ${data.defis_section.cost_highlight} !important;
        }
        `;
    }

    if (data.solutions_section) {
        cssRules += `
        .solutions-section, #solutions {
            background: ${data.solutions_section.background_gradient} !important;
        }
        .solutions-section h2 {
            color: ${data.solutions_section.title_color} !important;
        }
        .solutions-section h3 {
            color: ${data.solutions_section.subtitle_color} !important;
        }
        .solutions-section .card {
            background-color: ${data.solutions_section.card_background} !important;
            border: 2px solid ${data.solutions_section.card_border} !important;
            color: ${data.solutions_section.advantage_text} !important;
        }
        .solutions-section .advantage-icon {
            color: ${data.solutions_section.advantage_icon} !important;
        }
        `;
    }

    if (data.comparison_section) {
        cssRules += `
        /* SECTION COMPARISON - RENFORCEMENT */
        .comparison-section, #comparison {
            background: ${data.comparison_section.background_gradient} !important;
            padding: 3rem 0 !important;
        }
        .comparison-section h2 {
            color: ${data.comparison_section.title_color} !important;
            text-align: center !important;
            margin-bottom: 2rem !important;
        }
        .comparison-section h3 {
            color: ${data.comparison_section.subtitle_color} !important;
        }

        /* TABLEAU COMPARISON - ULTRA SPÉCIFIQUE */
        .comparison-section .comparison-table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin: 2rem auto !important;
            max-width: 1200px !important;
        }

        /* EN-TÊTES - GRADIENT FORCÉ */
        .comparison-section .comparison-table thead th,
        .comparison-section .comparison-table th {
            background: ${data.comparison_section.table_header_bg} !important;
            color: ${data.comparison_section.table_header_text} !important;
            padding: 20px 15px !important;
            font-weight: bold !important;
            font-size: 1.2rem !important;
            text-align: center !important;
            border: none !important;
        }

        /* LIGNES SPÉCIFIQUES - ALTERNANCE FORCÉE */
        .comparison-section .comparison-table tbody tr:nth-child(1) td {
            background-color: ${data.comparison_section.table_cell_bg_primary} !important;
            color: ${data.comparison_section.table_cell_text} !important;
        }
        .comparison-section .comparison-table tbody tr:nth-child(2) td {
            background-color: ${data.comparison_section.table_cell_bg_secondary} !important;
            color: ${data.comparison_section.table_cell_text} !important;
        }
        .comparison-section .comparison-table tbody tr:nth-child(3) td {
            background-color: ${data.comparison_section.table_cell_bg_primary} !important;
            color: ${data.comparison_section.table_cell_text} !important;
        }
        .comparison-section .comparison-table tbody tr:nth-child(4) td {
            background-color: ${data.comparison_section.table_cell_bg_secondary} !important;
            color: ${data.comparison_section.table_cell_text} !important;
        }

        /* CELLULES GÉNÉRALES */
        .comparison-section .comparison-table td {
            padding: 15px !important;
            text-align: center !important;
            border: 1px solid ${data.comparison_section.table_border} !important;
            color: ${data.comparison_section.table_cell_text} !important;
        }

        /* PREMIÈRE COLONNE */
        .comparison-section .comparison-table td:first-child {
            text-align: left !important;
            font-weight: bold !important;
            color: #ffffff !important;
            background-color: rgba(30, 64, 175, 0.9) !important;
        }

        /* VALEURS COLORÉES */
        .comparison-section .comparison-table .lead-values,
        .comparison-section .comparison-table .old-tech {
            color: ${data.comparison_section.lead_values} !important;
            font-weight: bold !important;
            background-color: rgba(239, 68, 68, 0.15) !important;
        }

        .comparison-section .comparison-table .lithium-values,
        .comparison-section .comparison-table .new-tech {
            color: ${data.comparison_section.lithium_values} !important;
            font-weight: bold !important;
            background-color: rgba(34, 211, 238, 0.15) !important;
        }
        `;
    }

    if (data.offres_section) {
        cssRules += `
        .offres-section, .pricing-section, #pricing {
            background: ${data.offres_section.background_gradient} !important;
        }
        .offres-section h2, .pricing-section h2 {
            color: ${data.offres_section.title_color} !important;
        }
        .offres-section h3, .pricing-section h3 {
            color: ${data.offres_section.subtitle_color} !important;
        }
        .pricing-card.premium {
            background-color: ${data.offres_section.card_background_premium} !important;
            border: 2px solid ${data.offres_section.card_border_premium} !important;
        }
        .pricing-card.premium h3 {
            color: ${data.offres_section.card_title_premium} !important;
        }
        .pricing-card.premium .price {
            color: ${data.offres_section.price_premium} !important;
        }
        .pricing-card.optimise {
            background-color: ${data.offres_section.card_background_optimise} !important;
            border: 2px solid ${data.offres_section.card_border_optimise} !important;
        }
        .pricing-card.optimise h3 {
            color: ${data.offres_section.card_title_optimise} !important;
        }
        .pricing-card.optimise .price {
            color: ${data.offres_section.price_optimise} !important;
        }
        .pricing-card.fleet {
            background-color: ${data.offres_section.card_background_flotte} !important;
            border: 2px solid ${data.offres_section.card_border_flotte} !important;
        }
        .pricing-card.fleet h3 {
            color: ${data.offres_section.card_title_flotte} !important;
        }
        .pricing-card.fleet .price {
            color: ${data.offres_section.price_flotte} !important;
        }
        .offer-badge {
            background-color: ${data.offres_section.offer_badge} !important;
            color: ${data.offres_section.offer_badge_text} !important;
        }
        `;
    }

    if (data.details_section) {
        cssRules += `
        .details-section, #details {
            background: ${data.details_section.background_gradient} !important;
        }
        .details-section h2 {
            color: ${data.details_section.title_color} !important;
        }
        .details-section .icon-ampoule {
            color: ${data.details_section.icon_ampoule} !important;
        }
        .details-section .card.plomb {
            background-color: ${data.details_section.card_plomb_background} !important;
            border: 2px solid ${data.details_section.card_plomb_border} !important;
            color: ${data.details_section.card_plomb_text} !important;
        }
        .details-section .card.plomb h3 {
            color: ${data.details_section.card_plomb_title} !important;
        }
        .details-section .card.lithium {
            background-color: ${data.details_section.card_lithium_background} !important;
            border: 2px solid ${data.details_section.card_lithium_border} !important;
            color: ${data.details_section.card_lithium_text} !important;
        }
        .details-section .card.lithium h3 {
            color: ${data.details_section.card_lithium_title} !important;
        }
        .details-section .card.comparison {
            background-color: ${data.details_section.card_comparison_background} !important;
            border: 2px solid ${data.details_section.card_comparison_border} !important;
            color: ${data.details_section.card_comparison_text} !important;
        }
        .details-section .card.roi {
            background-color: ${data.details_section.card_roi_background} !important;
            border: 2px solid ${data.details_section.card_roi_border} !important;
            color: ${data.details_section.card_roi_text} !important;
        }
        `;
    }

    if (data.temoignage_section) {
        cssRules += `
        .temoignage-section, .testimonial-section, #testimonial {
            background: ${data.temoignage_section.background_gradient} !important;
        }
        .temoignage-section h2, .testimonial-section h2 {
            color: ${data.temoignage_section.title_color} !important;
        }
        .temoignage-section h3, .testimonial-section h3 {
            color: ${data.temoignage_section.subtitle_color} !important;
        }
        .temoignage-section .advantage-card, .testimonial-section .advantage-card {
            background-color: ${data.temoignage_section.card_background} !important;
            border: 2px solid ${data.temoignage_section.card_border} !important;
            color: ${data.temoignage_section.card_text} !important;
        }
        .temoignage-section .advantage-card h4, .testimonial-section .advantage-card h4 {
            color: ${data.temoignage_section.card_title} !important;
        }
        .testimonial-quote {
            background-color: ${data.temoignage_section.testimonial_background} !important;
            border: 2px solid ${data.temoignage_section.testimonial_border} !important;
            color: ${data.temoignage_section.testimonial_text} !important;
        }
        .testimonial-author {
            color: ${data.temoignage_section.author_name} !important;
        }
        .testimonial-title {
            color: ${data.temoignage_section.author_title} !important;
        }
        .icon-fiabilite { color: ${data.temoignage_section.icon_fiabilite} !important; }
        .icon-simplicite { color: ${data.temoignage_section.icon_simplicite} !important; }
        .icon-performance { color: ${data.temoignage_section.icon_performance} !important; }
        .icon-economie { color: ${data.temoignage_section.icon_economie} !important; }
        .icon-partenariat { color: ${data.temoignage_section.icon_partenariat} !important; }
        .icon-ecologie { color: ${data.temoignage_section.icon_ecologie} !important; }
        `;
    }

    // Ajouter les couleurs complémentaires commerciales
    if (data.commercial_colors) {
        cssRules += `
        .success-primary { color: ${data.commercial_colors.success_primary} !important; }
        .success-secondary { color: ${data.commercial_colors.success_secondary} !important; }
        .warning-primary { color: ${data.commercial_colors.warning_primary} !important; }
        .warning-secondary { color: ${data.commercial_colors.warning_secondary} !important; }
        .error-primary { color: ${data.commercial_colors.error_primary} !important; }
        .error-secondary { color: ${data.commercial_colors.error_secondary} !important; }
        .info-primary { color: ${data.commercial_colors.info_primary} !important; }
        .info-secondary { color: ${data.commercial_colors.info_secondary} !important; }
        `;
    }

    // Ajouter les couleurs de contraste
    if (data.contrast_colors) {
        cssRules += `
        .text-on-dark { color: ${data.contrast_colors.text_on_dark} !important; }
        .text-on-light { color: ${data.contrast_colors.text_on_light} !important; }
        .text-muted-dark { color: ${data.contrast_colors.text_muted_dark} !important; }
        .text-muted-light { color: ${data.contrast_colors.text_muted_light} !important; }
        .border-subtle { border-color: ${data.contrast_colors.border_subtle} !important; }
        .border-prominent { border-color: ${data.contrast_colors.border_prominent} !important; }
        `;
    }

    // Ajouter les couleurs d'interaction
    if (data.interaction_colors) {
        cssRules += `
        .focus-ring:focus { outline: 2px solid ${data.interaction_colors.focus_ring} !important; }
        .hover-overlay:hover { background-color: ${data.interaction_colors.hover_overlay} !important; }
        .active-state:active { background-color: ${data.interaction_colors.active_state} !important; }
        .disabled-state:disabled { color: ${data.interaction_colors.disabled_state} !important; }
        `;
    }

    // Ajouter des règles générales pour corriger la visibilité
    cssRules += `
    /* Correction générale du contraste texte sur fond sombre */
    body, html {
        background-color: #0f172a !important;
        color: #ffffff !important;
    }

    /* Tous les textes gris deviennent blancs */
    .text-gray-400, .text-gray-500, .text-gray-600, .text-gray-700 {
        color: #e5e7eb !important;
    }

    /* Titre principal toujours visible */
    h1, h2, h3, h4, h5, h6 {
        color: #ffffff !important;
    }

    /* Paragraphes et textes par défaut */
    p, span, div {
        color: #e5e7eb !important;
    }

    /* Améliorer tous les éléments du tableau */
    table, .table {
        border-collapse: collapse !important;
    }

    table th, table td, .table th, .table td {
        border: 1px solid rgba(59, 130, 246, 0.3) !important;
        padding: 12px !important;
    }

    /* Assurer que tous les tableaux ont un contraste visible */
    .comparison-table tbody tr td {
        color: #ffffff !important;
        min-height: 50px !important;
    }

    /* Valeurs importantes en couleur */
    .old-tech, .lead-values {
        color: #ef4444 !important;
        font-weight: bold !important;
    }

    .new-tech, .lithium-values {
        color: #22d3ee !important;
        font-weight: bold !important;
    }
    `;

    // Appliquer le CSS
    bgStyleElement.textContent = cssRules;

    console.log('Couleurs optimisées e-commerce appliquées avec correction de visibilité complète');

    // Appliquer les couleurs des sections avec gradients depuis CSV
    let sectionStyles = '';

    // Section problem (VOTRE DÉFI ACTUEL)
    if (data.problem_section) {
        const bgGradient = generateGradientCSS('background_gradient', data.problem_section);
        if (bgGradient) {
            sectionStyles += `.problem-section { background: ${bgGradient} !important; }\n`;
        }
    }

    // Section solution (NOTRE SOLUTION RÉVOLUTIONNAIRE)
    if (data.solution_section) {
        const bgGradient = generateGradientCSS('background_gradient', data.solution_section);
        if (bgGradient) {
            sectionStyles += `.solution-section { background: ${bgGradient} !important; }\n`;
        }
    }

    // Section benefits (Pourquoi Choisir EDS Québec)
    if (data.benefits_section) {
        const bgGradient = generateGradientCSS('background_gradient', data.benefits_section);
        if (bgGradient) {
            sectionStyles += `.benefits-section { background: ${bgGradient} !important; }\n`;
        }
    }

    // Section comparison avec tableau - COULEURS DEPUIS CSV
    if (data.comparison_section) {
        const bgGradient = generateGradientCSS('background_gradient', data.comparison_section);
        const tableHeaderGradient = generateGradientCSS('table_header_bg_gradient', data.comparison_section);

        if (bgGradient) {
            sectionStyles += `.comparison-section { background: ${bgGradient} !important; }\n`;
        }

        if (tableHeaderGradient) {
            sectionStyles += `
            .comparison-table thead th, .comparison-table th {
                background: ${tableHeaderGradient} !important;
                color: #ffffff !important;
                padding: 20px !important;
                font-weight: bold !important;
                border: none !important;
            }\n`;
        }

        // Couleurs alternées du tableau depuis CSV
        if (data.comparison_section.table_cell_bg_primary) {
            sectionStyles += `
            .comparison-table tbody tr:nth-child(odd) td {
                background-color: ${data.comparison_section.table_cell_bg_primary} !important;
                color: #ffffff !important;
                padding: 15px !important;
                border: 1px solid rgba(59, 130, 246, 0.3) !important;
            }\n`;
        }

        if (data.comparison_section.table_cell_bg_secondary) {
            sectionStyles += `
            .comparison-table tbody tr:nth-child(even) td {
                background-color: ${data.comparison_section.table_cell_bg_secondary} !important;
                color: #ffffff !important;
                padding: 15px !important;
                border: 1px solid rgba(59, 130, 246, 0.3) !important;
            }\n`;
        }

        // Première colonne (critères)
        sectionStyles += `
        .comparison-table td:first-child {
            background-color: rgba(30, 64, 175, 0.9) !important;
            color: #ffffff !important;
            font-weight: bold !important;
            text-align: left !important;
        }\n`;

        // Colonnes old-tech et new-tech avec couleurs CSV
        if (data.comparison_section.lead_values) {
            sectionStyles += `
            .comparison-table .old-tech {
                color: ${data.comparison_section.lead_values} !important;
                font-weight: bold !important;
                background-color: rgba(239, 68, 68, 0.1) !important;
            }\n`;
        }

        if (data.comparison_section.lithium_values) {
            sectionStyles += `
            .comparison-table .new-tech {
                color: ${data.comparison_section.lithium_values} !important;
                font-weight: bold !important;
                background-color: rgba(34, 211, 238, 0.1) !important;
            }\n`;
        }
    }

    // Ajouter les styles des sections
    if (sectionStyles) {
        cssRules += sectionStyles;
    }

    console.log('✅ Couleurs et gradients appliqués depuis CSV (fini l\'injection hardcodée)');

    // INJECTION CSS D'URGENCE - Couleurs maintenant éditables via CSV
    // Récupérer les couleurs depuis CSV ou utiliser des valeurs par défaut
    const headerGrad1 = (data.comparison_section && data.comparison_section._colors && data.comparison_section._colors.table_header_bg_gradient) ?
        data.comparison_section._colors.table_header_bg_gradient.gradientColor1 || '#1e40af' : '#1e40af';
    const headerGrad2 = (data.comparison_section && data.comparison_section._colors && data.comparison_section._colors.table_header_bg_gradient) ?
        data.comparison_section._colors.table_header_bg_gradient.gradientColor2 || '#BFF2EB' : '#BFF2EB';

    const cellPrimary = data.comparison_section?.table_cell_bg_primary || '#1e293b';
    const cellSecondary = data.comparison_section?.table_cell_bg_secondary || '#374151';
    const leadColor = data.comparison_section?.lead_values || '#ef4444';
    const lithiumColor = data.comparison_section?.lithium_values || '#22d3ee';

    const emergencyTableCSS = `
    <style id="force-table-colors" type="text/css">
    /* FORCE TABLEAU - COULEURS CSV-ÉDITABLES */
    .comparison-table thead th, .comparison-table th {
        background: linear-gradient(135deg, ${headerGrad1}, ${headerGrad2}) !important;
        padding: 20px !important;
        font-weight: bold !important;
        border: none !important;
    }

    /* Les couleurs de texte viennent du CSV via JavaScript, pas CSS */

    .comparison-table tbody tr:nth-child(1) td {
        background-color: ${cellPrimary} !important;
        color: #ffffff !important;
        padding: 15px !important;
        border: 1px solid rgba(59, 130, 246, 0.3) !important;
    }

    .comparison-table tbody tr:nth-child(2) td {
        background-color: ${cellSecondary} !important;
        color: #ffffff !important;
        padding: 15px !important;
        border: 1px solid rgba(59, 130, 246, 0.3) !important;
    }

    .comparison-table tbody tr:nth-child(3) td {
        background-color: ${cellPrimary} !important;
        color: #ffffff !important;
        padding: 15px !important;
        border: 1px solid rgba(59, 130, 246, 0.3) !important;
    }

    .comparison-table tbody tr:nth-child(4) td {
        background-color: ${cellSecondary} !important;
        color: #ffffff !important;
        padding: 15px !important;
        border: 1px solid rgba(59, 130, 246, 0.3) !important;
    }

    .comparison-table td:first-child {
        background-color: rgba(30, 64, 175, 0.9) !important;
        color: #ffffff !important;
        font-weight: bold !important;
        text-align: left !important;
    }

    .comparison-table .old-tech {
        color: ${leadColor} !important;
        font-weight: bold !important;
        background-color: rgba(239, 68, 68, 0.1) !important;
    }

    .comparison-table .new-tech {
        color: ${lithiumColor} !important;
        font-weight: bold !important;
        background-color: rgba(34, 211, 238, 0.1) !important;
    }
    </style>
    `;

    // Injecter le CSS d'urgence dans le head
    if (!document.getElementById('force-table-colors')) {
        document.head.insertAdjacentHTML('beforeend', emergencyTableCSS);
        console.log('🔧 CSS d\'urgence RE-injecté pour forcer les couleurs du tableau');
    }
}

// Fonction helper pour récupérer la couleur d'un élément depuis les données CSV
function getElementColor(section, key) {
    const colorsSection = section + '_colors';
    return data[colorsSection] && data[colorsSection][key] || null;
}

// Fonction utilitaire pour mettre à jour un élément de façon sécurisée
function safeUpdateElement(id, value, color = null) {
    const element = document.getElementById(id);
    if (element && value !== undefined && value !== null) {
        // Applique le parsing Markdown/HTML puis met à jour avec innerHTML
        const parsedValue = parseMarkdownAndHTML(value.toString());
        element.innerHTML = parsedValue;

        // Appliquer la couleur si spécifiée
        if (color && color.startsWith('#')) {
            element.style.color = color;
            console.log(`Couleur appliquée à ${id}: ${color}`);
        }
    } else if (!element) {
        console.warn(`Élément non trouvé: ${id}`);
    }
}

// Fonction utilitaire avancée qui récupère automatiquement la couleur du CSV
function safeUpdateElementWithColor(id, section, key, value) {
    const color = getElementColor(section, key);
    safeUpdateElement(id, value, color);
}

// Fonction pour remplacer les templates {{variable}} par les valeurs calculées
function replaceTemplates(text) {
    if (!text) return text;

    // Remplace {{lead_cost_replacement_unit}} par la valeur actuelle
    text = text.replace(/\{\{lead_cost_replacement_unit\}\}/g, formatNumber(getVariable('lead_cost_replacement_unit')));

    // Remplace {{lead_technician_hourly_rate}} par la valeur actuelle
    text = text.replace(/\{\{lead_technician_hourly_rate\}\}/g, formatNumber(getVariable('lead_technician_hourly_rate')));

    // Templates pour les nouvelles variables
    text = text.replace(/\{\{lead_maintenance_hours_unit\}\}/g, formatNumber(getVariable('lead_maintenance_hours_unit')));
    text = text.replace(/\{\{recycling_disposal_cost\}\}/g, formatNumber(getVariable('recycling_disposal_cost')));
    text = text.replace(/\{\{revenue_loss_yearly\}\}/g, formatNumber(getVariable('revenue_loss_yearly')));
    text = text.replace(/\{\{overconsumption_cost_yearly\}\}/g, formatNumber(getVariable('overconsumption_cost_yearly')));
    text = text.replace(/\{\{insurance_increase_yearly\}\}/g, formatNumber(getVariable('insurance_increase_yearly')));
    text = text.replace(/\{\{premature_failure_percent\}\}/g, formatNumber(getVariable('premature_failure_percent')));
    text = text.replace(/\{\{lead_replacement_cycle_years\}\}/g, formatNumber(getVariable('lead_replacement_cycle_years')));

    // Templates formules 10 ans (legacy)
    text = text.replace(/\{\{lead_replacement_cost_with_risk_10y\}\}/g, formatNumber(calculateFormula('lead_replacement_cost_with_risk_10y')));
    text = text.replace(/\{\{lead_maintenance_total_10y\}\}/g, formatNumber(calculateFormula('lead_maintenance_total_10y')));
    text = text.replace(/\{\{lead_total_10y_per_cart\}\}/g, formatNumber(calculateFormula('lead_total_10y_per_cart')));
    text = text.replace(/\{\{lifepo4_total_10y_per_cart\}\}/g, formatNumber(calculateFormula('lifepo4_total_10y_per_cart')));
    text = text.replace(/\{\{savings_10y_per_cart\}\}/g, formatNumber(calculateFormula('savings_10y_per_cart')));
    text = text.replace(/\{\{savings_percentage_10y\}\}/g, ((calculateFormula('savings_10y_per_cart') / calculateFormula('lead_total_10y_per_cart')) * 100).toFixed(1));

    // AJOUT: Templates formules 20 ans
    text = text.replace(/\{\{lead_replacements_20y\}\}/g, formatNumber(calculateFormula('lead_replacements_20y')));
    text = text.replace(/\{\{lead_replacements_paid_20y\}\}/g, formatNumber(calculateFormula('lead_replacements_paid_20y')));
    text = text.replace(/\{\{lead_replacement_cost_with_risk_20y\}\}/g, formatNumber(calculateFormula('lead_replacement_cost_with_risk_20y')));
    text = text.replace(/\{\{lead_maintenance_total_20y\}\}/g, formatNumber(calculateFormula('lead_maintenance_total_20y')));
    text = text.replace(/\{\{lead_total_20y_per_cart\}\}/g, formatNumber(calculateFormula('lead_total_20y_per_cart')));
    text = text.replace(/\{\{lifepo4_total_20y_per_cart\}\}/g, formatNumber(calculateFormula('lifepo4_total_20y_per_cart')));
    text = text.replace(/\{\{savings_20y_per_cart\}\}/g, formatNumber(calculateFormula('savings_20y_per_cart')));
    text = text.replace(/\{\{savings_percentage_20y\}\}/g, ((calculateFormula('savings_20y_per_cart') / calculateFormula('lead_total_20y_per_cart')) * 100).toFixed(1));
    text = text.replace(/\{\{operational_risks_calculation_yearly\}\}/g, formatNumber(calculateFormula('operational_risks_calculation_yearly')));

    // Templates avec calculs multiples (expressions)
    text = text.replace(/\{\{operational_risks_calculation_yearly \* 20\}\}/g, formatNumber(calculateFormula('operational_risks_calculation_yearly') * 20));
    text = text.replace(/\{\{recycling_disposal_cost \* lead_replacements_20y\}\}/g, formatNumber(getVariable('recycling_disposal_cost') * calculateFormula('lead_replacements_20y')));

    // Remplace {{lead_replacement_calculation_10y}} par le calcul correct
    if (text.includes('{{lead_replacement_calculation_10y}}')) {
        // UTILISE LA FORMULE UNIVERSELLE AVEC RISQUE ET GARANTIE
        const totalCost = calculateFormula('lead_replacement_cost_with_risk_10y');
        const leadCost = getVariable('lead_cost_replacement_unit');
        const cycle = getVariable('lead_replacement_cycle_years');
        const warrantyFree = getVariable('warranty_replacements');
        const riskPercent = getVariable('premature_failure_percent');

        const totalReplacements = Math.floor(10 / cycle); // Formule CSV cohérente
        const paidReplacements = Math.max(0, totalReplacements - warrantyFree);

        const calculationText = currentLanguage === 'fr'
            ? `${totalReplacements} remplacements nécessaires - ${warrantyFree} gratuit (garantie) = ${paidReplacements} payants × ${formatNumber(leadCost)}$ + ${riskPercent}% risque bris prématuré = ${formatNumber(totalCost)}$ par voiturette`
            : `${totalReplacements} replacements needed - ${warrantyFree} free (warranty) = ${paidReplacements} paid × ${formatNumber(leadCost)}$ + ${riskPercent}% premature failure risk = ${formatNumber(totalCost)}$ per cart`;

        text = text.replace(/\{\{lead_replacement_calculation_10y\}\}/g, calculationText);
    }

    // Remplace {{lead_maintenance_calculation_10y}} par le calcul correct sur 20 ans
    if (text.includes('{{lead_maintenance_calculation_10y}}')) {
        const hours = getVariable('lead_maintenance_hours_unit');
        const rate = getVariable('lead_technician_hourly_rate');
        const costPerYear = hours * rate;
        const cost20Y = costPerYear * 20; // CHANGEMENT: 20 ans au lieu de 10

        const calculationText = currentLanguage === 'fr'
            ? `${hours}h × ${formatNumber(rate)}$ × 20 ans = ${formatNumber(cost20Y)}$ par voiturette sur 20 ans`
            : `${hours}h × ${formatNumber(rate)}$ × 20 years = ${formatNumber(cost20Y)}$ per cart over 20 years`;

        text = text.replace(/\{\{lead_maintenance_calculation_10y\}\}/g, calculationText);
    }

    // Note: operational_risks_calculation_yearly est maintenant géré dans les templates principaux

    // Section 4 - Calculs totaux consolidés sur 20 ans
    if (text.includes('{{total_breakdown_calculation_10y}}')) {
        // CHANGEMENT: UTILISE LES FORMULES 20 ANS POUR TOTAL BREAKDOWN
        const costReplacements = calculateFormula('lead_replacement_cost_with_risk_20y');
        const costMaintenance = calculateFormula('lead_maintenance_total_20y');
        const costRecycling = getVariable('recycling_disposal_cost') * calculateFormula('lead_replacements_20y');
        const costRisksYearly = getVariable('revenue_loss_yearly') + getVariable('overconsumption_cost_yearly') + getVariable('insurance_increase_yearly');
        const costRisks20 = costRisksYearly * 20; // 20 ans au lieu de 10

        const calculationText = currentLanguage === 'fr'
            ? `Remplacements avec risque: ${formatNumber(costReplacements)}$ + Maintenance: ${formatNumber(costMaintenance)}$ + Risques opérationnels: ${formatNumber(costRisks20)}$ + Recyclage: ${formatNumber(costRecycling)}$`
            : `Replacements with risk: ${formatNumber(costReplacements)}$ + Maintenance: ${formatNumber(costMaintenance)}$ + Operational risks: ${formatNumber(costRisks20)}$ + Recycling: ${formatNumber(costRecycling)}$`;

        text = text.replace(/\{\{total_breakdown_calculation_10y\}\}/g, calculationText);
    }

    if (text.includes('{{total_cost_simplified_10y}}')) {
        // CHANGEMENT: UTILISE LA FORMULE 20 ANS POUR TOTAL SIMPLIFIÉ
        const total = calculateFormula('lead_total_20y_per_cart');

        // Arrondi à la centaine supérieure pour "Plus de X$"
        const roundedTotal = Math.ceil(total / 100) * 100;
        text = text.replace(/\{\{total_cost_simplified_10y\}\}/g, formatNumber(roundedTotal));
    }

    if (text.includes('{{total_cost_final_calculation_10y}}')) {
        // CHANGEMENT: UTILISE LA FORMULE 20 ANS POUR CALCUL FINAL
        const total = calculateFormula('lead_total_20y_per_cart');

        const calculationText = currentLanguage === 'fr'
            ? `TOTAL RÉEL avec risque de bris prématuré : ${formatNumber(total)}$ par voiturette sur 20 ans`
            : `REAL TOTAL with premature failure risk: ${formatNumber(total)}$ per cart over 20 years`;

        text = text.replace(/\{\{total_cost_final_calculation_10y\}\}/g, calculationText);
    }

    // Support pour les nouvelles formules de breakdown
    if (text.includes('{{operational_risks_breakdown}}')) {
        text = text.replace(/\{\{operational_risks_breakdown\}\}/g, calculateFormula('operational_risks_breakdown'));
    }

    return text;
}

// Fonction pour peupler les sections de détails des problèmes (statiques par voiturette)
function populateProblemDetailsSections() {
    if (!data.problem_details) return;

    // Section 1 - Coûts de Remplacement Explosifs
    safeUpdateElementWithColor('problem-details-section-1-title', 'problem_details', 'section_1_title', data.problem_details?.section_1_title);
    safeUpdateElementWithColor('problem-details-section-1-subtitle', 'problem_details', 'section_1_subtitle', data.problem_details?.section_1_subtitle);
    safeUpdateElement('problem-details-section-1-point-1', data.problem_details?.section_1_point_1);
    safeUpdateElement('problem-details-section-1-point-2', replaceTemplates(data.problem_details?.section_1_point_2));
    safeUpdateElement('problem-details-section-1-point-3', replaceTemplates(data.problem_details?.section_1_point_3));
    safeUpdateElement('problem-details-section-1-point-4', data.problem_details?.section_1_point_4);
    safeUpdateElementWithColor('problem-details-section-1-calculation', 'problem_details', 'section_1_calculation', replaceTemplates(data.problem_details?.section_1_calculation));

    // Section 2 - Maintenance Spécialisée Coûteuse (avec templates dynamiques)
    safeUpdateElementWithColor('problem-details-section-2-title', 'problem_details', 'section_2_title', data.problem_details?.section_2_title);
    safeUpdateElementWithColor('problem-details-section-2-subtitle', 'problem_details', 'section_2_subtitle', data.problem_details?.section_2_subtitle);
    safeUpdateElement('problem-details-section-2-point-1', data.problem_details?.section_2_point_1);
    safeUpdateElement('problem-details-section-2-point-2', replaceTemplates(data.problem_details?.section_2_point_2));
    safeUpdateElement('problem-details-section-2-point-3', data.problem_details?.section_2_point_3);
    safeUpdateElement('problem-details-section-2-point-4', data.problem_details?.section_2_point_4);
    safeUpdateElementWithColor('problem-details-section-2-calculation', 'problem_details', 'section_2_calculation', replaceTemplates(data.problem_details?.section_2_calculation));

    // Section 3 - Risques et Pertes Opérationnelles (avec templates dynamiques)
    safeUpdateElementWithColor('problem-details-section-3-title', 'problem_details', 'section_3_title', data.problem_details?.section_3_title);
    safeUpdateElementWithColor('problem-details-section-3-subtitle', 'problem_details', 'section_3_subtitle', data.problem_details?.section_3_subtitle);
    safeUpdateElement('problem-details-section-3-point-1', data.problem_details?.section_3_point_1);
    safeUpdateElement('problem-details-section-3-point-2', data.problem_details?.section_3_point_2);
    safeUpdateElement('problem-details-section-3-point-3', data.problem_details?.section_3_point_3);
    safeUpdateElement('problem-details-section-3-point-4', data.problem_details?.section_3_point_4);
    safeUpdateElementWithColor('problem-details-section-3-calculation', 'problem_details', 'section_3_calculation', replaceTemplates(data.problem_details?.section_3_calculation));

    // Section 4 - TOTAL des Coûts Cachés Réels (avec templates dynamiques)
    safeUpdateElementWithColor('problem-details-section-4-title', 'problem_details', 'section_4_title', data.problem_details?.section_4_title);
    safeUpdateElementWithColor('problem-details-section-4-subtitle', 'problem_details', 'section_4_subtitle', data.problem_details?.section_4_subtitle);
    safeUpdateElement('problem-details-section-4-point-1', data.problem_details?.section_4_point_1);
    safeUpdateElement('problem-details-section-4-point-2', replaceTemplates(data.problem_details?.section_4_point_2));
    safeUpdateElement('problem-details-section-4-point-3', replaceTemplates(data.problem_details?.section_4_point_3));
    safeUpdateElement('problem-details-section-4-point-4', data.problem_details?.section_4_point_4);
    safeUpdateElementWithColor('problem-details-section-4-calculation', 'problem_details', 'section_4_calculation', replaceTemplates(data.problem_details?.section_4_calculation));
}

// Fonction pour peupler la section VS Batteries (statique)
function populateVsBatteriesSection() {
    if (!data.vs_batteries) return;

    // En-tête de section
    safeUpdateElementWithColor('vs-section-title', 'vs_batteries', 'section_title', data.vs_batteries?.section_title);
    safeUpdateElementWithColor('vs-section-subtitle', 'vs_batteries', 'section_subtitle', data.vs_batteries?.section_subtitle);

    // Titres des cartes
    safeUpdateElementWithColor('vs-lead-title', 'vs_batteries', 'lead_title', data.vs_batteries?.lead_title);
    safeUpdateElementWithColor('vs-lead-subtitle', 'vs_batteries', 'lead_subtitle', data.vs_batteries?.lead_subtitle);
    safeUpdateElementWithColor('vs-lifepo4-title', 'vs_batteries', 'lifepo4_title', data.vs_batteries?.lifepo4_title);
    safeUpdateElementWithColor('vs-lifepo4-subtitle', 'vs_batteries', 'lifepo4_subtitle', data.vs_batteries?.lifepo4_subtitle);

    // Spécifications techniques (labels et valeurs)
    safeUpdateElement('vs-tech-lifespan-label', data.vs_batteries?.tech_lifespan_label);
    safeUpdateElement('vs-tech-lifespan-label-2', data.vs_batteries?.tech_lifespan_label);
    safeUpdateElement('vs-tech-lifespan-lead', data.vs_batteries?.tech_lifespan_lead);
    safeUpdateElement('vs-tech-lifespan-lifepo4', data.vs_batteries?.tech_lifespan_lifepo4);

    safeUpdateElement('vs-tech-cycles-label', data.vs_batteries?.tech_cycles_label);
    safeUpdateElement('vs-tech-cycles-label-2', data.vs_batteries?.tech_cycles_label);
    safeUpdateElement('vs-tech-cycles-lead', data.vs_batteries?.tech_cycles_lead);
    safeUpdateElement('vs-tech-cycles-lifepo4', data.vs_batteries?.tech_cycles_lifepo4);

    safeUpdateElement('vs-tech-charge-label', data.vs_batteries?.tech_charge_label);
    safeUpdateElement('vs-tech-charge-label-2', data.vs_batteries?.tech_charge_label);
    safeUpdateElement('vs-tech-charge-lead', data.vs_batteries?.tech_charge_lead);
    safeUpdateElement('vs-tech-charge-lifepo4', data.vs_batteries?.tech_charge_lifepo4);

    safeUpdateElement('vs-tech-weight-label', data.vs_batteries?.tech_weight_label);
    safeUpdateElement('vs-tech-weight-label-2', data.vs_batteries?.tech_weight_label);
    safeUpdateElement('vs-tech-weight-lead', data.vs_batteries?.tech_weight_lead);
    safeUpdateElement('vs-tech-weight-lifepo4', data.vs_batteries?.tech_weight_lifepo4);

    safeUpdateElement('vs-tech-maintenance-label', data.vs_batteries?.tech_maintenance_label);
    safeUpdateElement('vs-tech-maintenance-label-2', data.vs_batteries?.tech_maintenance_label);
    safeUpdateElement('vs-tech-maintenance-lead', data.vs_batteries?.tech_maintenance_lead);
    safeUpdateElement('vs-tech-maintenance-lifepo4', data.vs_batteries?.tech_maintenance_lifepo4);

    safeUpdateElement('vs-tech-performance-label', data.vs_batteries?.tech_performance_label);
    safeUpdateElement('vs-tech-performance-label-2', data.vs_batteries?.tech_performance_label);
    safeUpdateElement('vs-tech-performance-lead', data.vs_batteries?.tech_performance_lead);
    safeUpdateElement('vs-tech-performance-lifepo4', data.vs_batteries?.tech_performance_lifepo4);

    // Coûts totaux
    safeUpdateElementWithColor('vs-cost-total-label', 'vs_batteries', 'cost_total_label', data.vs_batteries?.cost_total_label);
    safeUpdateElementWithColor('vs-cost-total-label-2', 'vs_batteries', 'cost_total_label', data.vs_batteries?.cost_total_label);
    safeUpdateElementWithColor('vs-cost-total-lead', 'vs_batteries', 'cost_total_lead', replaceTemplates(data.vs_batteries?.cost_total_lead));
    safeUpdateElementWithColor('vs-cost-total-lifepo4', 'vs_batteries', 'cost_total_lifepo4', replaceTemplates(data.vs_batteries?.cost_total_lifepo4));

    // Avantages/Inconvénients
    safeUpdateElementWithColor('vs-advantages-label', 'vs_batteries', 'advantages_label', data.vs_batteries?.advantages_label);
    safeUpdateElementWithColor('vs-advantages-label-2', 'vs_batteries', 'advantages_label', data.vs_batteries?.advantages_label);
    safeUpdateElementWithColor('vs-disadvantages-label', 'vs_batteries', 'disadvantages_label', data.vs_batteries?.disadvantages_label);
    safeUpdateElementWithColor('vs-disadvantages-label-2', 'vs_batteries', 'disadvantages_label', data.vs_batteries?.disadvantages_label);

    // Avantages batteries plomb
    safeUpdateElement('vs-lead-advantage-1', data.vs_batteries?.lead_advantage_1);
    safeUpdateElement('vs-lead-advantage-2', data.vs_batteries?.lead_advantage_2);
    safeUpdateElement('vs-lead-advantage-3', data.vs_batteries?.lead_advantage_3);

    // Inconvénients batteries plomb
    safeUpdateElement('vs-lead-disadvantage-1', data.vs_batteries?.lead_disadvantage_1);
    safeUpdateElement('vs-lead-disadvantage-2', data.vs_batteries?.lead_disadvantage_2);
    safeUpdateElement('vs-lead-disadvantage-3', data.vs_batteries?.lead_disadvantage_3);
    safeUpdateElement('vs-lead-disadvantage-4', data.vs_batteries?.lead_disadvantage_4);
    safeUpdateElement('vs-lead-disadvantage-5', data.vs_batteries?.lead_disadvantage_5);

    // Avantages LiFePO4
    safeUpdateElementWithColor('vs-lifepo4-advantage-1', 'vs_batteries', 'lifepo4_advantage_1', replaceTemplates(data.vs_batteries?.lifepo4_advantage_1));
    safeUpdateElementWithColor('vs-lifepo4-advantage-2', 'vs_batteries', 'lifepo4_advantage_2', data.vs_batteries?.lifepo4_advantage_2);
    safeUpdateElement('vs-lifepo4-advantage-3', data.vs_batteries?.lifepo4_advantage_3);
    safeUpdateElement('vs-lifepo4-advantage-4', data.vs_batteries?.lifepo4_advantage_4);
    safeUpdateElement('vs-lifepo4-advantage-5', data.vs_batteries?.lifepo4_advantage_5);
    safeUpdateElement('vs-lifepo4-advantage-6', data.vs_batteries?.lifepo4_advantage_6);
    safeUpdateElement('vs-lifepo4-advantage-7', data.vs_batteries?.lifepo4_advantage_7);
    safeUpdateElement('vs-lifepo4-advantage-8', data.vs_batteries?.lifepo4_advantage_8);

    // Inconvénients LiFePO4
    safeUpdateElement('vs-lifepo4-disadvantage-1', data.vs_batteries?.lifepo4_disadvantage_1);
    safeUpdateElement('vs-lifepo4-disadvantage-2', data.vs_batteries?.lifepo4_disadvantage_2);

    // Call to Action
    safeUpdateElementWithColor('vs-cta-title', 'vs_batteries', 'cta_title', data.vs_batteries?.cta_title);
    safeUpdateElementWithColor('vs-cta-subtitle', 'vs_batteries', 'cta_subtitle', data.vs_batteries?.cta_subtitle);
    safeUpdateElementWithColor('vs-cta-savings-prefix', 'vs_batteries', 'cta_savings_prefix', replaceTemplates(data.vs_batteries?.cta_savings_prefix));
    // Le montant et suffix sont déjà inclus dans le prefix via le template
    safeUpdateElement('vs-cta-savings-amount', ''); // Vide pour éviter doublon
    safeUpdateElement('vs-cta-savings-suffix', ''); // Vide pour éviter doublon
    safeUpdateElementWithColor('vs-cta-button-text', 'vs_batteries', 'cta_button_text', data.vs_batteries?.cta_button_text);
}

// Mettre à jour le contenu de la page
function updateContent() {
    // Header
    safeUpdateElement('company-name', data.header?.company_name);
    safeUpdateElement('company-tagline', data.header?.company_tagline);
    safeUpdateElement('company-subtitle', data.header?.company_subtitle);

    // Hero
    safeUpdateElementWithColor('hero-title', 'hero', 'main_title', data.hero?.main_title);
    safeUpdateElementWithColor('hero-subtitle', 'hero', 'subtitle', data.hero?.subtitle);

    // Problem
    safeUpdateElementWithColor('problem-title', 'problem', 'title', data.problem?.title);
    // cost-replacement et cost-10-years seront mis à jour par updateCartCalculation()
    // safeUpdateElement('cost-replacement', data.problem?.cost_replacement);
    // safeUpdateElement('cost-10-years', data.problem?.cost_10_years);
    // maintenance-hours et maintenance-cost seront aussi mis à jour par updateCartCalculation()
    // safeUpdateElement('maintenance-hours', data.problem?.maintenance_hours);
    // safeUpdateElement('maintenance-cost', data.problem?.maintenance_cost);
    safeUpdateElementWithColor('performance-issue', 'problem', 'performance_issue', data.problem?.performance_issue);
    // charging-time sera mis à jour par updateCartCalculation()
    safeUpdateElementWithColor('weight-old', 'problem', 'weight', data.problem?.weight);
    safeUpdateElementWithColor('extra-consumption', 'problem', 'extra_consumption', data.problem?.extra_consumption);
    safeUpdateElementWithColor('environmental-risk', 'problem', 'environmental_risk', data.problem?.environmental_risk);
    safeUpdateElementWithColor('safety-concerns', 'problem', 'safety_concerns', data.problem?.safety_concerns);

    // Problem UI elements
    safeUpdateElementWithColor('problem-card-1-title', 'ui', 'problem_card_1_title', data.ui?.problem_card_1_title);
    safeUpdateElement('problem-card-1-suffix', data.ui?.problem_card_1_suffix);
    safeUpdateElement('problem-card-1-total-prefix', data.ui?.problem_card_1_total_prefix);
    safeUpdateElementWithColor('problem-card-2-title', 'ui', 'problem_card_2_title', data.ui?.problem_card_2_title);
    safeUpdateElement('problem-card-2-suffix', data.ui?.problem_card_2_suffix);
    safeUpdateElement('problem-card-2-cost-prefix', data.ui?.problem_card_2_cost_prefix);
    safeUpdateElementWithColor('problem-card-3-title', 'ui', 'problem_card_3_title', data.ui?.problem_card_3_title);
    safeUpdateElement('problem-card-3-charging-prefix', data.ui?.problem_card_3_charging_prefix);
    safeUpdateElementWithColor('problem-card-4-title', 'ui', 'problem_card_4_title', data.ui?.problem_card_4_title);
    safeUpdateElement('problem-card-4-weight-prefix', data.ui?.problem_card_4_weight_prefix);
    safeUpdateElement('problem-card-4-consumption-prefix', data.ui?.problem_card_4_consumption_prefix);
    safeUpdateElementWithColor('problem-card-5-title', 'ui', 'problem_card_5_title', data.ui?.problem_card_5_title);
    // CORRECTION: Appliquer replaceTemplates pour les cartes avec templates
    safeUpdateElement('problem-card-5-training', replaceTemplates(data.ui?.problem_card_5_training));
    safeUpdateElementWithColor('problem-card-6-title', 'ui', 'problem_card_6_title', data.ui?.problem_card_6_title);
    safeUpdateElement('problem-card-6-risks', replaceTemplates(data.ui?.problem_card_6_risks));

    // Problem Details Sections (par voiturette - ne changent PAS avec le slider)
    populateProblemDetailsSections();

    // VS Batteries Section (statique)
    populateVsBatteriesSection();

    // Solution
    safeUpdateElementWithColor('solution-title', 'solution', 'title', data.solution?.title);
    safeUpdateElementWithColor('autonomy', 'solution', 'autonomy', data.solution?.autonomy);
    safeUpdateElementWithColor('autonomy-hours', 'solution', 'autonomy_hours', data.solution?.autonomy_hours);
    safeUpdateElementWithColor('cycles', 'solution', 'cycles', data.solution?.cycles);
    safeUpdateElementWithColor('lifespan', 'solution', 'lifespan', data.solution?.lifespan);
    safeUpdateElementWithColor('charge-time', 'solution', 'charge_time', data.solution?.charge_time);
    safeUpdateElementWithColor('maintenance', 'solution', 'maintenance', data.solution?.maintenance);
    safeUpdateElementWithColor('weight', 'solution', 'weight', data.solution?.weight);

    // Autonomy comparison data
    safeUpdateElementWithColor('autonomy-new', 'problem', 'autonomy_new', data.problem?.autonomy_new);
    safeUpdateElementWithColor('autonomy-degraded', 'problem', 'autonomy_degraded', data.problem?.autonomy_degraded);
    safeUpdateElementWithColor('autonomy-loss', 'problem', 'autonomy_loss', data.problem?.autonomy_loss);

    // Solution UI elements
    safeUpdateElementWithColor('solution-card-1-title', 'ui', 'solution_card_1_title', data.ui?.solution_card_1_title);
    safeUpdateElementWithColor('solution-card-2-title', 'ui', 'solution_card_2_title', data.ui?.solution_card_2_title);
    safeUpdateElement('solution-card-2-lifespan-separator', data.ui?.solution_card_2_lifespan_separator);
    safeUpdateElementWithColor('solution-card-3-title', 'ui', 'solution_card_3_title', data.ui?.solution_card_3_title);
    safeUpdateElement('solution-card-3-charge-prefix', data.ui?.solution_card_3_charge_prefix);
    safeUpdateElementWithColor('solution-card-4-title', 'ui', 'solution_card_4_title', data.ui?.solution_card_4_title);
    safeUpdateElement('solution-card-4-weight-prefix', data.ui?.solution_card_4_weight_prefix);

    // Comparison
    safeUpdateElementWithColor('comparison-title', 'ui', 'comparison_title', data.ui?.comparison_title);
    safeUpdateElementWithColor('comparison-criterion', 'ui', 'comparison_criterion', data.ui?.comparison_criterion);
    safeUpdateElementWithColor('comparison-lead-batteries', 'ui', 'comparison_lead_batteries', data.ui?.comparison_lead_batteries);
    safeUpdateElementWithColor('comparison-eds-solution', 'ui', 'comparison_eds_solution', data.ui?.comparison_eds_solution);
    safeUpdateElement('comparison-cost-10-years', data.ui?.comparison_cost_10_years);
    safeUpdateElement('comparison-replacements', data.ui?.comparison_replacements);
    safeUpdateElement('comparison-maintenance', data.ui?.comparison_maintenance);
    safeUpdateElement('comparison-charging-time', data.ui?.comparison_charging_time);
    safeUpdateElement('lead-batteries-10-years', data.comparison?.lead_batteries_10_years);
    safeUpdateElement('lead-replacements', data.comparison?.lead_replacements);
    safeUpdateElement('lead-maintenance', data.comparison?.lead_maintenance);
    safeUpdateElement('lead-charging', data.comparison?.lead_charging);
    safeUpdateElement('lithium-replacements', data.comparison?.lithium_replacements);
    safeUpdateElement('lithium-maintenance', data.comparison?.lithium_maintenance);
    safeUpdateElement('lithium-charging', data.comparison?.lithium_charging);

    // Calculation details (lead-replacement-schedule mis à jour par updateCalculationDetails)
    safeUpdateElement('lithium-lifespan', data.comparison?.lithium_lifespan);
    safeUpdateElement('lithium-advantage', data.calculs?.lithium_advantage);

    // Pricing
    safeUpdateElementWithColor('pricing-title', 'ui', 'pricing_title', data.ui?.pricing_title);
    safeUpdateElementWithColor('contract-10-title', 'pricing', 'contract_10_title', data.pricing?.contract_10_title);
    safeUpdateElementWithColor('contract-20-title', 'pricing', 'contract_20_title', data.pricing?.contract_20_title);
    safeUpdateElementWithColor('contract-20-fleet-title', 'pricing', 'contract_20_fleet_title', data.pricing?.contract_20_fleet_title);
    safeUpdateElement('pricing-total-suffix', data.ui?.pricing_total_suffix);
    safeUpdateElement('pricing-total-suffix-2', data.ui?.pricing_total_suffix);
    safeUpdateElement('pricing-total-suffix-3', data.ui?.pricing_total_suffix);
    safeUpdateElement('pricing-savings-prefix', data.ui?.pricing_savings_prefix);
    safeUpdateElement('pricing-savings-10-suffix', data.ui?.pricing_savings_10_suffix);
    safeUpdateElement('pricing-savings-20-prefix', data.ui?.pricing_savings_20_prefix);
    safeUpdateElement('pricing-savings-20-suffix', data.ui?.pricing_savings_20_suffix);
    safeUpdateElement('pricing-savings-fleet-prefix', data.ui?.pricing_savings_fleet_prefix);
    safeUpdateElement('pricing-savings-fleet-suffix', data.ui?.pricing_savings_fleet_suffix);
    safeUpdateElement('fleet-minimum-text', data.ui?.fleet_minimum_text);

    // Benefits
    safeUpdateElementWithColor('benefits-title', 'ui', 'benefits_title', data.ui?.benefits_title);
    safeUpdateElementWithColor('benefits-reliability', 'ui', 'benefits_reliability', data.ui?.benefits_reliability);
    safeUpdateElementWithColor('benefits-simplicity', 'ui', 'benefits_simplicity', data.ui?.benefits_simplicity);
    safeUpdateElementWithColor('benefits-performance', 'ui', 'benefits_performance', data.ui?.benefits_performance);
    safeUpdateElementWithColor('benefits-economy', 'ui', 'benefits_economy', data.ui?.benefits_economy);
    safeUpdateElementWithColor('benefits-partnership', 'ui', 'benefits_partnership', data.ui?.benefits_partnership);
    safeUpdateElementWithColor('benefits-ecology', 'ui', 'benefits_ecology', data.ui?.benefits_ecology);
    safeUpdateElementWithColor('benefit-1', 'benefits', 'benefit_1', data.benefits?.benefit_1);
    safeUpdateElementWithColor('benefit-2', 'benefits', 'benefit_2', data.benefits?.benefit_2);
    safeUpdateElementWithColor('benefit-3', 'benefits', 'benefit_3', data.benefits?.benefit_3);
    safeUpdateElementWithColor('benefit-4', 'benefits', 'benefit_4', data.benefits?.benefit_4);
    safeUpdateElementWithColor('benefit-5', 'benefits', 'benefit_5', data.benefits?.benefit_5);
    safeUpdateElementWithColor('benefit-6', 'benefits', 'benefit_6', data.benefits?.benefit_6);

    // Testimonial
    safeUpdateElementWithColor('testimonial-quote', 'testimonial', 'quote', data.testimonial?.quote);
    safeUpdateElementWithColor('testimonial-author', 'testimonial', 'author', data.testimonial?.author);
    safeUpdateElementWithColor('testimonial-title', 'testimonial', 'title', data.testimonial?.title);
    safeUpdateElementWithColor('testimonial-company', 'testimonial', 'company', data.testimonial?.company);

    // Contact
    safeUpdateElementWithColor('contact-title', 'ui', 'contact_title', data.ui?.contact_title);
    safeUpdateElementWithColor('contact-subtitle', 'ui', 'contact_subtitle', data.ui?.contact_subtitle);
    safeUpdateElementWithColor('specialist-name', 'contact', 'specialist_name', data.contact?.specialist_name);
    safeUpdateElementWithColor('specialist-title', 'contact', 'specialist_title', data.contact?.specialist_title);
    safeUpdateElement('specialist-phone', data.contact?.specialist_phone);
    safeUpdateElement('specialist-email', data.contact?.specialist_email);
    safeUpdateElement('website', data.contact?.website);
    safeUpdateElement('contact-phone-label', data.ui?.contact_phone_label);
    safeUpdateElement('contact-email-label', data.ui?.contact_email_label);
    safeUpdateElement('contact-website-label', data.ui?.contact_website_label);

    // Cart Calculator
    safeUpdateElementWithColor('cart-calculator-title', 'ui', 'cart_calculator_title', data.ui?.cart_calculator_title);
    safeUpdateElement('cart-calculator-subtitle', data.ui?.cart_calculator_subtitle);
    safeUpdateElement('cart-count-label', data.ui?.cart_count_label);
    safeUpdateElement('cart-unit-suffix', data.ui?.cart_unit_suffix);

    // Initialize cart calculation
    updateCartCalculation();
    updateFloatingCalculator();

    // Contenu mis à jour
}

// Afficher les détails de prix dans une modal
function showPricingDetails(contractType) {
    const modal = document.getElementById('pricingModal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');

    if (contractType === '10') {
        modalTitle.textContent = data.pricing?.contract_10_title || 'Contrat 10 ans';
        modalContent.innerHTML = `
            <h3>Détails du Contrat 10 ans</h3>
            <p><strong>Tarif mensuel :</strong> 97,64 $ par voiturette</p>
            <p><strong>Économies vs batteries plomb :</strong> Importantes sur 10 ans</p>
            <br>
            <h4>Ce qui est inclus :</h4>
            <ul>
                <li>Kits lithium LiFePO₄ 48V 105Ah complets</li>
                <li>Installation professionnelle sur site</li>
                <li>Monitoring proactif 24/7</li>
                <li>Maintenance préventive et corrective</li>
                <li>Remplacement immédiat en cas de défaillance</li>
                <li>Support technique prioritaire</li>
            </ul>
        `;
    } else if (contractType === '20') {
        modalTitle.textContent = data.pricing?.contract_20_title || 'Contrat 20 ans';
        modalContent.innerHTML = `
            <h3>Détails du Contrat 20 ans - RECOMMANDÉ</h3>
            <p><strong>Tarif mensuel :</strong> 84,36 $ par voiturette</p>
            <p><strong>Économies MASSIVES :</strong> Très importantes sur 20 ans</p>
            <br>
            <h4>Avantages exclusifs du contrat 20 ans :</h4>
            <ul>
                <li><strong>Réduction significative</strong> pour engagement long terme</li>
                <li>Stabilité tarifaire garantie sur 2 décennies</li>
                <li>Partenariat à long terme avec support prioritaire</li>
                <li>Amortissement optimal de l'investissement</li>
            </ul>
            <br>
            <div style="background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                <h4>💰 ROI Exceptionnel vs batteries plomb</h4>
                <p>Économies substantielles garanties !</p>
            </div>
        `;
    } else if (contractType === 'fleet') {
        modalTitle.textContent = data.pricing?.contract_20_fleet_title || 'Contrat Flotte 20 ans';
        modalContent.innerHTML = `
            <h3>Détails du Contrat Flotte 20 ans - MEILLEUR PRIX</h3>
            <p><strong>Tarif mensuel :</strong> 76,73 $ par voiturette (minimum 30)</p>
            <p><strong>Économies PREMIUM :</strong> Maximales pour grandes flottes</p>
            <br>
            <h4>Avantages exclusifs de l'offre flotte :</h4>
            <ul>
                <li><strong>🏆 MEILLEUR PRIX</strong> pour flottes 30+ voiturettes</li>
                <li><strong>Réduction premium</strong> de 9% vs contrat standard</li>
                <li>Support dédié avec gestionnaire de compte</li>
                <li>Priorité absolue pour interventions</li>
                <li>Formation personnalisée de votre équipe</li>
                <li>Rapport de performance mensuel</li>
            </ul>
            <br>
            <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                <h4>🚀 ROI PREMIUM : Économies maximales</h4>
                <p>L'offre la plus avantageuse pour les grandes flottes !</p>
            </div>
        `;
    }

    modal.style.display = 'block';
}

// Fermer la modal
function closeModal() {
    document.getElementById('pricingModal').style.display = 'none';
}

// Fermer la modal en cliquant en dehors
window.onclick = function(event) {
    const modal = document.getElementById('pricingModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Variables globales pour le calculateur
let currentCartCount = 10;
let currentTechnicianRate = 100; // Taux horaire par défaut du technicien spécialisé

// Fonction pour formater les nombres avec espaces comme séparateurs de milliers
function formatNumber(num) {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Fonction pour mettre à jour les calculs basés sur le nombre de voiturettes
function updateCartCalculation() {
    if (!data.pricing || !data.problem || !data.comparison) return;

    const currency = ' $';

    // SECTION PROBLÈMES - Affichage cohérent par voiturette vs total flotte
    const costReplacementPerUnit = getVariable('lead_cost_replacement_unit');
    const costReplacementTotal = costReplacementPerUnit * currentCartCount;
    const maintenanceHoursPerUnit = getVariable('lead_maintenance_hours_unit');
    const maintenanceHoursTotal = maintenanceHoursPerUnit * currentCartCount;
    const maintenanceCostPerUnit = getVariable('lead_maintenance_hours_unit') * getVariable('lead_technician_hourly_rate');
    const maintenanceCostTotal = maintenanceCostPerUnit * currentCartCount;

    // CHANGEMENT: Coût total réel selon l'architecture centralisée sur 20 ans
    const totalRealCost20YearsPerUnit = calculateFormula('lead_total_20y_per_cart');
    const cost20YearsTotal = totalRealCost20YearsPerUnit * currentCartCount;

    // CORRECTION: Affichage du coût total réel (pas seulement remplacement initial)
    safeUpdateElement('cost-replacement', formatNumber(cost20YearsTotal) + currency + ` pour ${currentCartCount} voiturette${currentCartCount > 1 ? 's' : ''} (coût total réel)`);
    safeUpdateElement('cost-10-years', formatNumber(cost20YearsTotal) + currency + ` pour ${currentCartCount} voiturette${currentCartCount > 1 ? 's' : ''} sur 20 ans`);
    safeUpdateElement('maintenance-hours', maintenanceHoursTotal + ` heures/an pour ${currentCartCount} voiturette${currentCartCount > 1 ? 's' : ''}`);
    safeUpdateElement('maintenance-cost', formatNumber(maintenanceCostTotal) + currency + ` /an pour ${currentCartCount} voiturette${currentCartCount > 1 ? 's' : ''}`);

    // Mise à jour dynamique de l'impact temps de charge (variables centralisées)
    const baseChargingTime = data.problem?.charging_time || `${getVariable('lead_charging_hours')} heures`;
    const fleetOverhead = getVariable('fleet_overhead_percent');
    const extraCostPerCart = getVariable('extra_fleet_cost_per_cart');
    const fleetImpact = Math.round(currentCartCount * fleetOverhead / 100);
    const totalExtraCost = fleetImpact * extraCostPerCart;

    const chargingImpactText = `${baseChargingTime} = +${fleetImpact} voiturettes (${formatNumber(totalExtraCost)}$)`;
    safeUpdateElement('charging-time', chargingImpactText);

    // SECTION TARIFICATION - Calculs dynamiques (variables centralisées)
    const monthly10 = getVariable('lifepo4_monthly_10y') * currentCartCount;
    const savings10 = calculateFormula('savings_10y_per_cart') * currentCartCount;

    const monthly20 = getVariable('lifepo4_monthly_20y') * currentCartCount;
    const savings20 = calculateFormula('savings_20y_per_cart') * currentCartCount;

    // Calcul pour l'offre flotte (variables centralisées)
    const monthlyFleet = getVariable('lifepo4_monthly_fleet') * currentCartCount;
    // Économies flotte calculées depuis formules (pas de variables hardcodées)
    const savingsFleet = calculateFormula('savings_fleet_per_cart') * currentCartCount;

    safeUpdateElement('contract-10-monthly', formatNumber(monthly10) + currency);
    safeUpdateElement('savings-10-years', formatNumber(savings10) + currency);
    safeUpdateElement('contract-20-monthly', formatNumber(monthly20) + currency);
    safeUpdateElement('savings-20-years', formatNumber(savings20) + currency);
    safeUpdateElement('contract-20-fleet-monthly', formatNumber(monthlyFleet) + currency);
    safeUpdateElement('savings-20-fleet', formatNumber(savingsFleet) + currency);

    // Gestion de l'affichage de l'offre flotte (30+ voiturettes)
    const fleetCard = document.querySelector('.pricing-card.fleet');
    const premiumCard = document.querySelector('.pricing-card.premium');
    const fleetMinimumElement = document.getElementById('fleet-minimum-text');

    if (currentCartCount >= getVariable('fleet_minimum_carts')) {
        // Activer l'offre flotte
        if (fleetCard) {
            fleetCard.style.opacity = '1';
            fleetCard.style.transform = 'scale(1)';
        }

        // Désactiver l'offre 20 ans (solution optimisée)
        if (premiumCard) {
            premiumCard.style.opacity = '0.6';
            premiumCard.style.transform = 'scale(0.95)';
            premiumCard.style.filter = 'grayscale(0.3)';
        }

        if (fleetMinimumElement) {
            fleetMinimumElement.style.color = '#10b981';
            fleetMinimumElement.style.background = 'rgba(16, 185, 129, 0.2)';
            fleetMinimumElement.style.padding = '5px 10px';
            fleetMinimumElement.style.borderRadius = '8px';
            fleetMinimumElement.innerHTML = '✅ Offre flotte activée !';
        }
    } else {
        // Désactiver l'offre flotte
        if (fleetCard) {
            fleetCard.style.opacity = '0.7';
            fleetCard.style.transform = 'scale(0.95)';
        }

        // Réactiver l'offre 20 ans
        if (premiumCard) {
            premiumCard.style.opacity = '1';
            premiumCard.style.transform = 'scale(1)';
            premiumCard.style.filter = 'none';
        }

        if (fleetMinimumElement) {
            fleetMinimumElement.style.color = '#ffffff';
            fleetMinimumElement.style.background = 'rgba(220, 38, 38, 0.8)';
            fleetMinimumElement.style.padding = '5px 10px';
            fleetMinimumElement.style.borderRadius = '8px';
            fleetMinimumElement.innerHTML = `❌ Minimum 30 voiturettes (actuellement: ${currentCartCount})`;
        }
    }

    // SECTION COMPARAISON - Totaux flotte (variables centralisées) sur 20 ans
    const leadBatteries20 = calculateFormula('lead_total_20y_per_cart') * currentCartCount;
    const lithium20 = calculateFormula('lifepo4_total_20y_per_cart') * currentCartCount;

    // Debug: vérifier les valeurs calculées
    console.log('Valeurs comparaison:', {
        leadBatteries20: leadBatteries20,
        lithium20: lithium20,
        currentCartCount: currentCartCount,
        leadFormula: calculateFormula('lead_total_20y_per_cart'),
        lithiumFormula: calculateFormula('lifepo4_total_20y_per_cart')
    });

    // CHANGEMENT: Utiliser les valeurs 20 ans pour la comparaison principale
    safeUpdateElement('lead-batteries-10-years', formatNumber(leadBatteries20) + currency);
    safeUpdateElement('contract-10-total', formatNumber(lithium20) + currency);

    // Mettre à jour les heures de maintenance dans la comparaison (variables centralisées)
    const leadMaintenanceHours = getVariable('lead_maintenance_hours_unit') * currentCartCount;
    safeUpdateElement('lead-maintenance', leadMaintenanceHours + (currentLanguage === 'fr' ? ' heures/an' : ' hours/year'));

    // Mettre à jour l'affichage du nombre de voiturettes
    safeUpdateElement('cart-count', currentCartCount.toString());

    // SECTION DÉTAILS DES CALCULS
    updateCalculationDetails();

    // Calculs mis à jour
}

// Mettre à jour les détails des calculs (source unique : variables.csv)
function updateCalculationDetails() {
    if (!variables || Object.keys(variables).length === 0) return;

    const currency = ' $';

    // Données de base - Toutes depuis variables.csv (source unique de vérité)
    const leadReplacementCost = getVariable('lead_cost_replacement_unit');
    const leadMaintenanceCostAnnual = getVariable('lead_maintenance_hours_unit') * getVariable('lead_technician_hourly_rate');
    const prematureFailureRisk = getVariable('premature_failure_risk');
    const recyclingCost = getVariable('recycling_disposal_cost');
    const revenueLossYearly = getVariable('revenue_loss_yearly');
    const overconsumptionYearly = getVariable('overconsumption_cost_yearly');
    const insuranceIncreaseYearly = getVariable('insurance_increase_yearly');
    const replacementCycle = getVariable('lead_replacement_cycle_years');

    const lithiumMonthly10 = getVariable('lifepo4_monthly_10y');
    const lithiumMonthly20 = getVariable('lifepo4_monthly_20y');
    const lithiumFleetMonthly = getVariable('lifepo4_monthly_fleet');

    // Calculs remplacements batterie plomb (directement depuis formules)
    const replacements20Years = calculateFormula('lead_replacements_20y');

    // COÛTS TOTAUX RÉELS BATTERIES PLOMB sur 20 ans (directement depuis formules 20y)
    const leadTotalCost20 = calculateFormula('lead_total_20y_per_cart');

    // COÛT TOTAL RÉEL PLOMB par voiturette sur 20 ans (depuis variables.csv)
    const leadTotalPerCart20 = leadTotalCost20;

    // Variables calculées manquantes pour les détails (calculées depuis formules)
    const leadMaintenanceCost20 = leadMaintenanceCostAnnual * 20;
    const leadBatteryCost20 = leadReplacementCost * calculateFormula('lead_replacements_paid_20y');
    const leadRecyclingCost20 = recyclingCost * replacements20Years;
    const leadRevenueLoss20 = revenueLossYearly * 20;
    const leadOverconsumption20 = overconsumptionYearly * 20;
    const leadInsuranceIncrease20 = insuranceIncreaseYearly * 20;
    const leadPrematureFailure20 = prematureFailureRisk * 2; // Risque sur 20 ans

    // COÛT TOTAL PLOMB pour la flotte
    const leadTotal20 = leadTotalPerCart20 * currentCartCount;

    // Coûts lithium selon la flotte sur 20 ans
    let lithium20, selectedMonthlyRate;
    if (currentCartCount >= getVariable('fleet_minimum_carts')) {
        selectedMonthlyRate = lithiumFleetMonthly;
        lithium20 = selectedMonthlyRate * 12 * 20 * currentCartCount;
    } else {
        lithium20 = lithiumMonthly20 * 12 * 20 * currentCartCount;
        selectedMonthlyRate = lithiumMonthly20;
    }

    // ÉCONOMIES RÉELLES sur 20 ans (plomb coûte BEAUCOUP plus cher que lithium)
    const totalSavings20 = leadTotal20 - lithium20;
    const savingsPercentage20 = ((totalSavings20 / leadTotal20) * 100).toFixed(1);

    // Fourchette intelligente (variation selon cycle min/max des batteries plomb)
    const minLifespan = 5; // Années (meilleur cas)
    const maxLifespan = 3; // Années (cas dégradé)
    const minReplacements20 = Math.floor(20 / minLifespan); // 20/5 = 4 remplacements minimum
    const maxReplacements20 = Math.floor(20 / maxLifespan); // 20/3 = 6.67 → 7 remplacements maximum

    const minLeadCostPerCart20 = leadReplacementCost * minReplacements20 + leadMaintenanceCost20 +
                               (recyclingCost * minReplacements20) + leadRevenueLoss20 + leadOverconsumption20 + leadInsuranceIncrease20;
    const maxLeadCostPerCart20 = leadReplacementCost * maxReplacements20 + leadMaintenanceCost20 +
                               (recyclingCost * maxReplacements20) + leadRevenueLoss20 + leadOverconsumption20 + leadInsuranceIncrease20;

    const minSavings20 = (minLeadCostPerCart20 * currentCartCount) - lithium20;
    const maxSavings20 = (maxLeadCostPerCart20 * currentCartCount) - lithium20;

    // Calculs ROI (lithium vs coûts explosifs plomb)
    const roiPercentage = ((totalSavings20 / lithium20) * 100).toFixed(1);
    const monthlySavingsAverage = totalSavings20 / (20 * 12);
    const perCartMonthlySavings = monthlySavingsAverage / currentCartCount;
    const annualSavingsPerCart = perCartMonthlySavings * 12;

    // === 1. SECTION BATTERIES PLOMB (COÛTS RÉELS selon document) ===
    safeUpdateElement('lead-replacement-schedule', data.calculs?.lead_replacement_schedule || 'Remplacement nécessaire tous les 2-5 ans');
    safeUpdateElement('lead-replacements-20y', `${replacements20Years} remplacements à ${formatNumber(leadReplacementCost)}$ par voiturette`);

    // Détail complet des coûts cachés du plomb (par voiturette) - Basé sur variables.csv
    const hiddenCosts20 = leadRecyclingCost20 + leadRevenueLoss20 + leadOverconsumption20 + leadInsuranceIncrease20 + leadPrematureFailure20;
    const leadBreakdownText = currentLanguage === 'fr'
        ? `${formatNumber(leadBatteryCost20)}${currency} (batteries) + ${formatNumber(leadMaintenanceCost20)}${currency} (maintenance) + ${formatNumber(hiddenCosts20)}${currency} (coûts cachés) par voiturette`
        : `${formatNumber(leadBatteryCost20)}${currency} (batteries) + ${formatNumber(leadMaintenanceCost20)}${currency} (maintenance) + ${formatNumber(hiddenCosts20)}${currency} (hidden costs) per cart`;

    safeUpdateElement('lead-cost-breakdown-20y', leadBreakdownText);
    safeUpdateElement('lead-total-calc-20y', formatNumber(leadTotal20) + currency);

    const maintenanceHours = getVariable('lead_maintenance_hours_unit');
    const technicianRate = getVariable('lead_technician_hourly_rate');
    const maintenanceDetailText = currentLanguage === 'fr'
        ? `${formatNumber(leadMaintenanceCost20 * currentCartCount)}${currency} (${maintenanceHours}h/an × ${technicianRate}$/h × ${currentCartCount} voiturettes × 20 ans)`
        : `${formatNumber(leadMaintenanceCost20 * currentCartCount)}${currency} (${maintenanceHours}h/year × ${technicianRate}$/h × ${currentCartCount} carts × 20 years)`;
    safeUpdateElement('lead-maintenance-total-20y', maintenanceDetailText);

    // === 2. SECTION LITHIUM (SOLUTION ÉCONOMIQUE) ===
    safeUpdateElement('lithium-replacements-20y',
        currentLanguage === 'fr' ? '0 remplacement nécessaire - 15-20 ans de durée de vie' : '0 replacement needed - 15-20 years lifespan');

    const lithiumBreakdownText = currentLanguage === 'fr'
        ? `${formatNumber(lithium20)}${currency} (location ${selectedMonthlyRate}${currency}/mois) + 0${currency} (maintenance) + 0${currency} (recyclage) + 0${currency} (pertes revenus)`
        : `${formatNumber(lithium20)}${currency} (rental ${selectedMonthlyRate}${currency}/month) + 0${currency} (maintenance) + 0${currency} (recycling) + 0${currency} (revenue loss)`;

    safeUpdateElement('lithium-cost-breakdown-20y', lithiumBreakdownText);
    safeUpdateElement('lithium-total-calc-20y', formatNumber(lithium20) + currency);

    // === 3. SECTION ÉCONOMIES (LITHIUM FAIT ÉCONOMISER) ===
    safeUpdateElement('detailed-savings-calc-20y',
        `${formatNumber(leadTotal20)}${currency} (plomb) - ${formatNumber(lithium20)}${currency} (lithium)`);
    safeUpdateElement('total-savings-display-20y', formatNumber(totalSavings20) + currency);

    const rangeText20 = currentLanguage === 'fr'
        ? `Entre ${formatNumber(minSavings20)}${currency} et ${formatNumber(maxSavings20)}${currency} selon fréquence remplacement plomb`
        : `Between ${formatNumber(minSavings20)}${currency} and ${formatNumber(maxSavings20)}${currency} depending on lead replacement frequency`;
    safeUpdateElement('savings-range-20y', rangeText20);

    const savingsText = currentLanguage === 'fr'
        ? `${savingsPercentage20}% d'économie avec lithium vs plomb`
        : `${savingsPercentage20}% savings with lithium vs lead`;
    safeUpdateElement('savings-percentage-20y', savingsText);

    // === 4. SECTION ROI (RETOUR SUR INVESTISSEMENT LITHIUM) ===
    const roiText = currentLanguage === 'fr'
        ? `${roiPercentage}% ROI - Lithium se paie par ses économies`
        : `${roiPercentage}% ROI - Lithium pays for itself through savings`;
    safeUpdateElement('roi-calculation', roiText);

    safeUpdateElement('break-even-point',
        currentLanguage === 'fr' ? 'Rentabilité immédiate vs coûts plomb' : 'Immediate profitability vs lead costs');
    safeUpdateElement('monthly-savings-average',
        `${formatNumber(monthlySavingsAverage)}${currency}/mois économisés`);
    safeUpdateElement('per-cart-monthly-savings',
        `${formatNumber(perCartMonthlySavings)}${currency}/voiturette/mois économisés`);

    // NOTE: Tableau comparaison maintenant géré par l'architecture centralisée dans populateVsBatteriesSection()

    // CHANGEMENT: Mise à jour autres données comparaison pour 20 ans
    safeUpdateElement('lead-replacements', `${Math.ceil(20 / replacementCycle)} remplacements sur 20 ans`);
    safeUpdateElement('lithium-replacements', data.comparison.lithium_replacements || '0 remplacement');
    safeUpdateElement('lead-maintenance', data.comparison.lead_maintenance || '12 heures/an');
    safeUpdateElement('lithium-maintenance', data.comparison.lithium_maintenance || '0 heure');
    safeUpdateElement('lead-charging', data.comparison.lead_charging || '8-10 heures');
    safeUpdateElement('lithium-charging', data.comparison.lithium_charging || '2 heures');
}

// Event listener pour le slider
function setupCartSlider() {
    const slider = document.getElementById('cartSlider');
    if (slider) {
        slider.addEventListener('input', function() {
            currentCartCount = parseInt(this.value);
            updateCartCalculation();
            updateFloatingCalculator();
        });
    }
}

// Setup du calculateur flottant
function setupFloatingCalculator() {
    // Gestion du slider du nombre de voiturettes
    const floatingSlider = document.getElementById('cartSliderFloating');
    if (floatingSlider) {
        floatingSlider.addEventListener('input', function() {
            currentCartCount = parseInt(this.value);

            // Synchroniser avec le slider principal
            const mainSlider = document.getElementById('cartSlider');
            if (mainSlider) {
                mainSlider.value = currentCartCount;
            }

            updateCartCalculation();
            updateFloatingCalculator();
        });
    }

    // Gestion du slider du taux horaire du technicien
    const technicianSlider = document.getElementById('technicianRateSlider');
    const technicianDisplay = document.getElementById('technician-rate-display');

    if (technicianSlider && technicianDisplay) {
        technicianSlider.addEventListener('input', function() {
            currentTechnicianRate = parseInt(this.value);
            technicianDisplay.textContent = currentTechnicianRate;

            // Mettre à jour TOUS les calculs qui dépendent du taux horaire
            updateCartCalculation();
            updateFloatingCalculator();
            populateProblemDetailsSections(); // Mettre à jour les sections de détails
            populateVsBatteriesSection(); // Mettre à jour la section de comparaison
        });
    }
}

// Mettre à jour le calculateur flottant
function updateFloatingCalculator() {
    if (!data.pricing) return;

    const currency = ' $';

    // CORRECTION: Calculs utilisant les variables CSV correctes
    const monthly10 = getVariable('lifepo4_monthly_10y') * currentCartCount;
    const monthly20 = getVariable('lifepo4_monthly_20y') * currentCartCount;
    const monthlyFleet = getVariable('lifepo4_monthly_fleet') * currentCartCount;

    // Mise à jour des affichages
    safeUpdateElement('cart-count-floating', currentCartCount.toString());
    safeUpdateElement('price-10-floating', formatNumber(monthly10) + currency);
    safeUpdateElement('price-20-floating', formatNumber(monthly20) + currency);
    safeUpdateElement('price-fleet-floating', formatNumber(monthlyFleet) + currency);

    // Synchroniser les sliders flottants
    const floatingSlider = document.getElementById('cartSliderFloating');
    if (floatingSlider) {
        floatingSlider.value = currentCartCount;
    }

    const technicianSlider = document.getElementById('technicianRateSlider');
    const technicianDisplay = document.getElementById('technician-rate-display');
    if (technicianSlider && technicianDisplay) {
        technicianSlider.value = currentTechnicianRate;
        technicianDisplay.textContent = currentTechnicianRate;
    }

    // Gestion visuelle de l'offre flotte dans le calculateur flottant
    const fleetCard = document.getElementById('price-fleet-card');
    const premiumFloatingCard = document.querySelector('.floating-calculator .pricing-mini:nth-child(2)');

    if (fleetCard) {
        if (currentCartCount >= getVariable('fleet_minimum_carts')) {
            // Activer flotte, désactiver 20 ans
            fleetCard.classList.remove('fleet-inactive');
            fleetCard.classList.remove('disabled');
            fleetCard.title = 'Offre flotte activée !';

            if (premiumFloatingCard) {
                premiumFloatingCard.classList.add('disabled');
                premiumFloatingCard.title = 'Offre remplacée par la flotte';
            }
        } else {
            // Désactiver flotte, réactiver 20 ans
            fleetCard.classList.add('fleet-inactive');
            fleetCard.classList.remove('disabled');
            fleetCard.title = `Minimum 30 voiturettes (actuellement: ${currentCartCount})`;

            if (premiumFloatingCard) {
                premiumFloatingCard.classList.remove('disabled');
                premiumFloatingCard.title = 'Contrat 20 ans - Solution optimisée';
            }
        }
    }

    // Mettre à jour les textes selon la langue
    if (data.ui) {
        safeUpdateElement('cart-unit-floating', currentCartCount > 1 ?
            (currentLanguage === 'fr' ? 'voiturettes' : 'carts') :
            (currentLanguage === 'fr' ? 'voiturette' : 'cart'));

        safeUpdateElement('floating-calc-title', data.ui.cart_calculator_title || 'Calculateur de Flotte');
        safeUpdateElement('technician-cost-label', data.ui.technician_cost_label || 'Coût technicien :');
        safeUpdateElement('technician-rate-unit', data.ui.technician_rate_unit || '$/heure');
    }
}

// Système de lecteur audio
class AudioPlayer {
    constructor() {
        this.musicFolder = 'musique/';
        this.tracks = [];
        this.currentTrackIndex = 0;
        this.currentAudio = null;
        this.nextAudio = null;
        this.isPlaying = false;
        this.userInteracted = false;
        this.volume = 0.15; // 15% par défaut

        this.playBtn = document.getElementById('playPauseBtn');
        this.playIcon = document.getElementById('playIcon');
        this.pauseIcon = document.getElementById('pauseIcon');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.trackInfo = document.getElementById('trackInfo');

        // Nettoyer le cache audio au démarrage pour éviter les anciens noms
        this.clearAudioCache();

        this.init();
    }

    // Nettoyer le cache audio pour éviter les anciens noms de fichiers
    clearAudioCache() {
        try {
            // Forcer le nettoyage des objets Audio existants
            if (window.audioCache) {
                window.audioCache.clear();
            }

            // Créer une liste propre pour le cache
            window.audioCache = new Map();

            console.log('🧹 Cache audio nettoyé - nouveaux noms de fichiers');
        } catch (error) {
            console.warn('⚠️ Impossible de nettoyer le cache audio:', error);
        }
    }

    async init() {
        // Charger la liste des musiques de façon non-bloquante
        setTimeout(() => this.loadTrackList(), 100);

        // Setup des contrôles
        this.setupControls();

        // Écouter les interactions utilisateur pour démarrer la musique
        this.setupUserInteractionListener();
    }

    async loadTrackList() {
        try {
            this.tracks = await this.scanMusicFolder();

            // Debug: afficher les fichiers détectés
            console.log('🎵 Liste des fichiers audio détectés:', this.tracks);

            if (this.tracks.length > 0) {
                this.shuffleTracks();
                setTimeout(() => {
                    this.updateTrackInfo();
                }, 100);
            } else {
                console.warn('⚠️ Aucun fichier audio détecté');
                setTimeout(() => {
                    if (this.trackInfo) {
                        this.trackInfo.textContent = '♪';
                    }
                }, 100);
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement des tracks:', error);
            if (this.trackInfo) {
                this.trackInfo.textContent = '♪';
            }
        }
    }

    async scanMusicFolder() {
        try {
            // Liste de fichiers en dur comme fallback principal
            const fallbackFiles = [
                'ethereal-drift-1.mp3',
                'ethereal-drift.mp3',
                'ethereal-glow-1.mp3',
                'ethereal-glow.mp3',
                'whispered-horizons-1.mp3',
                'whispered-horizons.mp3',
                'whispering-horizon-1.mp3',
                'whispering-horizon.mp3'
            ];

            // Essayer de charger l'index JSON d'abord
            try {
                const indexResponse = await fetch(this.musicFolder + 'index.json');
                if (indexResponse.ok) {
                    const contentType = indexResponse.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const indexData = await indexResponse.json();
                        if (indexData.files && indexData.files.length > 0) {
                            console.log('🎵 Fichiers audio chargés depuis index.json:', indexData.files);
                            return indexData.files;
                        }
                    }
                }
            } catch (fetchError) {
                console.warn('⚠️ Impossible de charger index.json, utilisation du fallback');
            }

            // Vérifier si les fichiers fallback existent en testant le premier
            try {
                const testResponse = await fetch(this.musicFolder + fallbackFiles[0]);
                if (testResponse.ok) {
                    console.log('🎵 Utilisation de la liste de fichiers intégrée:', fallbackFiles);
                    return fallbackFiles;
                }
            } catch (testError) {
                console.warn('⚠️ Fichiers fallback non accessibles');
            }

            // En dernier recours, scanner le listing HTML du serveur
            try {
                const response = await fetch(this.musicFolder);
                const html = await response.text();

                // Parser le HTML pour extraire les liens vers les fichiers .mp3
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const links = Array.from(doc.querySelectorAll('a[href]'));

                const mp3Files = links
                    .map(link => link.getAttribute('href'))
                    .filter(href => href && href.toLowerCase().endsWith('.mp3'))
                    .map(href => {
                        // Nettoyer le nom du fichier
                        const decoded = decodeURIComponent(href);
                        return decoded.split('/').pop();
                    })
                    .filter(filename => !filename.includes('..') && filename !== '' && filename.endsWith('.mp3'))
                    .sort(); // Trier alphabétiquement

                if (mp3Files.length > 0) {
                    console.log('🎵 Fichiers trouvés via scan HTML:', mp3Files);
                    return mp3Files;
                }
            } catch (scanError) {
                console.warn('⚠️ Scan HTML échoué');
            }

            // Si tout échoue, retourner le fallback
            console.log('🎵 Retour au fallback intégré');
            return fallbackFiles;

        } catch (error) {
            console.error('❌ Erreur complète dans scanMusicFolder:', error);
            // Fallback final en cas d'erreur totale
            return [
                'ethereal-drift-1.mp3',
                'ethereal-drift.mp3',
                'ethereal-glow-1.mp3',
                'ethereal-glow.mp3',
                'whispered-horizons-1.mp3',
                'whispered-horizons.mp3',
                'whispering-horizon-1.mp3',
                'whispering-horizon.mp3'
            ];
        }
    }


    shuffleTracks() {
        for (let i = this.tracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.tracks[i], this.tracks[j]] = [this.tracks[j], this.tracks[i]];
        }
        this.currentTrackIndex = 0;
    }

    setupUserInteractionListener() {
        const startMusic = () => {
            if (!this.userInteracted && this.tracks.length > 0) {
                this.userInteracted = true;
                this.preloadCurrentAndNext();
                this.startPlayback();

                document.removeEventListener('click', startMusic, true);
                document.removeEventListener('keydown', startMusic, true);
                document.removeEventListener('touchstart', startMusic, true);
            }
        };

        document.addEventListener('click', startMusic, true);
        document.addEventListener('keydown', startMusic, true);
        document.addEventListener('touchstart', startMusic, true);
    }

    setupControls() {
        this.playBtn.addEventListener('click', () => this.togglePlayPause());

        this.volumeSlider.addEventListener('input', (e) => {
            this.volume = e.target.value / 100;
            if (this.currentAudio) {
                this.currentAudio.volume = this.volume;
            }
        });
    }

    preloadCurrentAndNext() {
        if (this.tracks.length === 0) return;

        // Nettoyer les objets audio existants
        this.cleanupAudio();

        // Précharger la musique actuelle
        this.loadTrack(this.currentTrackIndex, true);

        // Précharger la suivante seulement s'il y a plus d'une piste
        if (this.tracks.length > 1) {
            const nextIndex = (this.currentTrackIndex + 1) % this.tracks.length;
            setTimeout(() => this.loadTrack(nextIndex, false), 500);
        }
    }

    cleanupAudio() {
        // Nettoyer l'audio actuel
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.src = '';
            this.currentAudio.load();
            this.currentAudio = null;
        }

        // Nettoyer l'audio suivant
        if (this.nextAudio) {
            this.nextAudio.src = '';
            this.nextAudio.load();
            this.nextAudio = null;
        }
    }

    loadTrack(index, isCurrent = true) {
        if (!this.tracks[index]) return null;

        const audio = new Audio();
        // Ajouter un paramètre cache-busting pour forcer le rechargement
        const timestamp = Date.now();
        audio.src = this.musicFolder + this.tracks[index] + '?v=' + timestamp;
        audio.volume = this.volume;
        audio.preload = isCurrent ? 'auto' : 'metadata';

        // Debug: logger le fichier qu'on essaie de charger
        console.log('🎵 Chargement:', this.tracks[index], 'URL complète:', audio.src);

        if (isCurrent) {
            this.currentAudio = audio;
            this.setupCurrentTrackEvents();
        } else {
            this.nextAudio = audio;
        }

        return audio;
    }

    setupCurrentTrackEvents() {
        if (!this.currentAudio) return;

        this.currentAudio.addEventListener('ended', () => {
            this.nextTrack();
        });

        this.currentAudio.addEventListener('error', () => {
            // Erreur de chargement, passer au suivant
            this.nextTrack();
        });

        this.updateTrackInfo();
    }

    async startPlayback() {
        if (!this.currentAudio || this.isPlaying) return;

        try {
            await this.currentAudio.play();
            this.isPlaying = true;
            this.updatePlayButton();
        } catch (error) {
            // Échec silencieux
        }
    }

    async togglePlayPause() {
        if (!this.userInteracted) {
            this.userInteracted = true;
            this.preloadCurrentAndNext();
        }

        if (!this.currentAudio) return;

        if (this.isPlaying) {
            this.currentAudio.pause();
            this.isPlaying = false;
        } else {
            try {
                await this.currentAudio.play();
                this.isPlaying = true;
            } catch (error) {
                // Échec silencieux
            }
        }

        this.updatePlayButton();
    }

    nextTrack() {
        // Passer à la musique suivante
        this.currentAudio = this.nextAudio;
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;

        // Mettre à jour l'affichage
        this.updateTrackInfo();

        // Précharger la nouvelle musique suivante
        const nextIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        this.nextAudio = this.loadTrack(nextIndex, false);

        this.setupCurrentTrackEvents();

        if (this.isPlaying && this.currentAudio) {
            this.currentAudio.play().catch(() => {});
        }
    }

    updatePlayButton() {
        if (this.isPlaying) {
            this.playIcon.style.display = 'none';
            this.pauseIcon.style.display = 'inline';
        } else {
            this.playIcon.style.display = 'inline';
            this.pauseIcon.style.display = 'none';
        }
    }

    updateTrackInfo() {
        // Toujours afficher juste le symbole musical
        if (!this.trackInfo) {
            this.trackInfo = document.getElementById('trackInfo');
        }

        if (this.trackInfo) {
            this.trackInfo.textContent = '♪';
            this.trackInfo.title = 'Lecteur audio';
        }
    }
}

// Initialiser le lecteur audio
let audioPlayer;

// Gestionnaire global d'erreurs pour ignorer les erreurs d'extensions
window.addEventListener('error', function(event) {
    // Ignorer les erreurs d'extensions de navigateur
    if (event.message && (
        event.message.includes('message channel closed') ||
        event.message.includes('Extension context invalidated') ||
        event.filename && event.filename.startsWith('chrome-extension://') ||
        event.filename && event.filename.startsWith('moz-extension://')
    )) {
        console.warn('🔇 Erreur d\'extension ignorée:', event.message);
        event.preventDefault();
        return true;
    }
});

// Gestionnaire pour les promesses rejetées
window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.message && (
        event.reason.message.includes('message channel closed') ||
        event.reason.message.includes('Extension context invalidated')
    )) {
        console.warn('🔇 Promesse rejetée d\'extension ignorée:', event.reason.message);
        event.preventDefault();
        return true;
    }
});

// Chargement automatique des données CSV au démarrage de la page
document.addEventListener('DOMContentLoaded', function() {
    // Page chargée, initialisation du chargement CSV avec architecture centralisée
    loadAllData();

    // Setup des sliders après un petit délai pour s'assurer que le DOM est prêt
    setTimeout(() => {
        setupCartSlider();
        setupFloatingCalculator();
        updateFloatingCalculator();
    }, 100);

    // Initialiser le lecteur audio
    audioPlayer = new AudioPlayer();
});