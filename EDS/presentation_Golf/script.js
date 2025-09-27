// Données centralisées - architecture optimisée
let data = {};
let variables = {};
let formulas = {};
let currentLanguage = 'fr'; // Langue par défaut

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
        // Parser pour data_clean.csv (section,key,value)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line && !line.startsWith('#')) {
                const parts = line.split(',');
                if (parts.length >= 3) {
                    const section = parts[0].trim();
                    const key = parts[1].trim();
                    let value = parts.slice(2).join(',').trim();

                    if (value.startsWith('"') && value.endsWith('"')) {
                        value = value.slice(1, -1);
                    }

                    if (section && key) {
                        if (!result[section]) {
                            result[section] = {};
                        }
                        result[section][key] = value;
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


// Fonction utilitaire pour mettre à jour un élément de façon sécurisée
function safeUpdateElement(id, value) {
    const element = document.getElementById(id);
    if (element && value !== undefined && value !== null) {
        element.textContent = value;
    } else if (!element) {
        console.warn(`Élément non trouvé: ${id}`);
    }
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
    safeUpdateElement('problem-details-section-1-title', data.problem_details?.section_1_title);
    safeUpdateElement('problem-details-section-1-subtitle', data.problem_details?.section_1_subtitle);
    safeUpdateElement('problem-details-section-1-point-1', data.problem_details?.section_1_point_1);
    safeUpdateElement('problem-details-section-1-point-2', replaceTemplates(data.problem_details?.section_1_point_2));
    safeUpdateElement('problem-details-section-1-point-3', replaceTemplates(data.problem_details?.section_1_point_3));
    safeUpdateElement('problem-details-section-1-point-4', data.problem_details?.section_1_point_4);
    safeUpdateElement('problem-details-section-1-calculation', replaceTemplates(data.problem_details?.section_1_calculation));

    // Section 2 - Maintenance Spécialisée Coûteuse (avec templates dynamiques)
    safeUpdateElement('problem-details-section-2-title', data.problem_details?.section_2_title);
    safeUpdateElement('problem-details-section-2-subtitle', data.problem_details?.section_2_subtitle);
    safeUpdateElement('problem-details-section-2-point-1', data.problem_details?.section_2_point_1);
    safeUpdateElement('problem-details-section-2-point-2', replaceTemplates(data.problem_details?.section_2_point_2));
    safeUpdateElement('problem-details-section-2-point-3', data.problem_details?.section_2_point_3);
    safeUpdateElement('problem-details-section-2-point-4', data.problem_details?.section_2_point_4);
    safeUpdateElement('problem-details-section-2-calculation', replaceTemplates(data.problem_details?.section_2_calculation));

    // Section 3 - Risques et Pertes Opérationnelles (avec templates dynamiques)
    safeUpdateElement('problem-details-section-3-title', data.problem_details?.section_3_title);
    safeUpdateElement('problem-details-section-3-subtitle', data.problem_details?.section_3_subtitle);
    safeUpdateElement('problem-details-section-3-point-1', data.problem_details?.section_3_point_1);
    safeUpdateElement('problem-details-section-3-point-2', data.problem_details?.section_3_point_2);
    safeUpdateElement('problem-details-section-3-point-3', data.problem_details?.section_3_point_3);
    safeUpdateElement('problem-details-section-3-point-4', data.problem_details?.section_3_point_4);
    safeUpdateElement('problem-details-section-3-calculation', replaceTemplates(data.problem_details?.section_3_calculation));

    // Section 4 - TOTAL des Coûts Cachés Réels (avec templates dynamiques)
    safeUpdateElement('problem-details-section-4-title', data.problem_details?.section_4_title);
    safeUpdateElement('problem-details-section-4-subtitle', data.problem_details?.section_4_subtitle);
    safeUpdateElement('problem-details-section-4-point-1', data.problem_details?.section_4_point_1);
    safeUpdateElement('problem-details-section-4-point-2', replaceTemplates(data.problem_details?.section_4_point_2));
    safeUpdateElement('problem-details-section-4-point-3', replaceTemplates(data.problem_details?.section_4_point_3));
    safeUpdateElement('problem-details-section-4-point-4', data.problem_details?.section_4_point_4);
    safeUpdateElement('problem-details-section-4-calculation', replaceTemplates(data.problem_details?.section_4_calculation));
}

// Fonction pour peupler la section VS Batteries (statique)
function populateVsBatteriesSection() {
    if (!data.vs_batteries) return;

    // En-tête de section
    safeUpdateElement('vs-section-title', data.vs_batteries?.section_title);
    safeUpdateElement('vs-section-subtitle', data.vs_batteries?.section_subtitle);

    // Titres des cartes
    safeUpdateElement('vs-lead-title', data.vs_batteries?.lead_title);
    safeUpdateElement('vs-lead-subtitle', data.vs_batteries?.lead_subtitle);
    safeUpdateElement('vs-lifepo4-title', data.vs_batteries?.lifepo4_title);
    safeUpdateElement('vs-lifepo4-subtitle', data.vs_batteries?.lifepo4_subtitle);

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
    safeUpdateElement('vs-cost-total-label', data.vs_batteries?.cost_total_label);
    safeUpdateElement('vs-cost-total-label-2', data.vs_batteries?.cost_total_label);
    safeUpdateElement('vs-cost-total-lead', replaceTemplates(data.vs_batteries?.cost_total_lead));
    safeUpdateElement('vs-cost-total-lifepo4', replaceTemplates(data.vs_batteries?.cost_total_lifepo4));

    // Avantages/Inconvénients
    safeUpdateElement('vs-advantages-label', data.vs_batteries?.advantages_label);
    safeUpdateElement('vs-advantages-label-2', data.vs_batteries?.advantages_label);
    safeUpdateElement('vs-disadvantages-label', data.vs_batteries?.disadvantages_label);
    safeUpdateElement('vs-disadvantages-label-2', data.vs_batteries?.disadvantages_label);

    // Avantages batteries plomb
    safeUpdateElement('vs-lead-advantage-1', data.vs_batteries?.lead_advantage_1);
    safeUpdateElement('vs-lead-advantage-2', data.vs_batteries?.lead_advantage_2);

    // Inconvénients batteries plomb
    safeUpdateElement('vs-lead-disadvantage-1', data.vs_batteries?.lead_disadvantage_1);
    safeUpdateElement('vs-lead-disadvantage-2', data.vs_batteries?.lead_disadvantage_2);
    safeUpdateElement('vs-lead-disadvantage-3', data.vs_batteries?.lead_disadvantage_3);
    safeUpdateElement('vs-lead-disadvantage-4', data.vs_batteries?.lead_disadvantage_4);
    safeUpdateElement('vs-lead-disadvantage-5', data.vs_batteries?.lead_disadvantage_5);

    // Avantages LiFePO4
    safeUpdateElement('vs-lifepo4-advantage-1', replaceTemplates(data.vs_batteries?.lifepo4_advantage_1));
    safeUpdateElement('vs-lifepo4-advantage-2', data.vs_batteries?.lifepo4_advantage_2);
    safeUpdateElement('vs-lifepo4-advantage-3', data.vs_batteries?.lifepo4_advantage_3);
    safeUpdateElement('vs-lifepo4-advantage-4', data.vs_batteries?.lifepo4_advantage_4);
    safeUpdateElement('vs-lifepo4-advantage-5', data.vs_batteries?.lifepo4_advantage_5);
    safeUpdateElement('vs-lifepo4-advantage-6', data.vs_batteries?.lifepo4_advantage_6);

    // Inconvénients LiFePO4
    safeUpdateElement('vs-lifepo4-disadvantage-1', data.vs_batteries?.lifepo4_disadvantage_1);
    safeUpdateElement('vs-lifepo4-disadvantage-2', data.vs_batteries?.lifepo4_disadvantage_2);

    // Call to Action
    safeUpdateElement('vs-cta-title', data.vs_batteries?.cta_title);
    safeUpdateElement('vs-cta-subtitle', data.vs_batteries?.cta_subtitle);
    safeUpdateElement('vs-cta-savings-prefix', replaceTemplates(data.vs_batteries?.cta_savings_prefix));
    // Le montant et suffix sont déjà inclus dans le prefix via le template
    safeUpdateElement('vs-cta-savings-amount', ''); // Vide pour éviter doublon
    safeUpdateElement('vs-cta-savings-suffix', ''); // Vide pour éviter doublon
    safeUpdateElement('vs-cta-button-text', data.vs_batteries?.cta_button_text);
}

// Mettre à jour le contenu de la page
function updateContent() {
    // Header
    safeUpdateElement('company-name', data.header?.company_name);
    safeUpdateElement('company-tagline', data.header?.company_tagline);
    safeUpdateElement('company-subtitle', data.header?.company_subtitle);

    // Hero
    safeUpdateElement('hero-title', data.hero?.main_title);
    safeUpdateElement('hero-subtitle', data.hero?.subtitle);

    // Problem
    safeUpdateElement('problem-title', data.problem?.title);
    // cost-replacement et cost-10-years seront mis à jour par updateCartCalculation()
    // safeUpdateElement('cost-replacement', data.problem?.cost_replacement);
    // safeUpdateElement('cost-10-years', data.problem?.cost_10_years);
    // maintenance-hours et maintenance-cost seront aussi mis à jour par updateCartCalculation()
    // safeUpdateElement('maintenance-hours', data.problem?.maintenance_hours);
    // safeUpdateElement('maintenance-cost', data.problem?.maintenance_cost);
    safeUpdateElement('performance-issue', data.problem?.performance_issue);
    // charging-time sera mis à jour par updateCartCalculation()
    safeUpdateElement('weight-old', data.problem?.weight);
    safeUpdateElement('extra-consumption', data.problem?.extra_consumption);
    safeUpdateElement('environmental-risk', data.problem?.environmental_risk);
    safeUpdateElement('safety-concerns', data.problem?.safety_concerns);

    // Problem UI elements
    safeUpdateElement('problem-card-1-title', data.ui?.problem_card_1_title);
    safeUpdateElement('problem-card-1-suffix', data.ui?.problem_card_1_suffix);
    safeUpdateElement('problem-card-1-total-prefix', data.ui?.problem_card_1_total_prefix);
    safeUpdateElement('problem-card-2-title', data.ui?.problem_card_2_title);
    safeUpdateElement('problem-card-2-suffix', data.ui?.problem_card_2_suffix);
    safeUpdateElement('problem-card-2-cost-prefix', data.ui?.problem_card_2_cost_prefix);
    safeUpdateElement('problem-card-3-title', data.ui?.problem_card_3_title);
    safeUpdateElement('problem-card-3-charging-prefix', data.ui?.problem_card_3_charging_prefix);
    safeUpdateElement('problem-card-4-title', data.ui?.problem_card_4_title);
    safeUpdateElement('problem-card-4-weight-prefix', data.ui?.problem_card_4_weight_prefix);
    safeUpdateElement('problem-card-4-consumption-prefix', data.ui?.problem_card_4_consumption_prefix);
    safeUpdateElement('problem-card-5-title', data.ui?.problem_card_5_title);
    // CORRECTION: Appliquer replaceTemplates pour les cartes avec templates
    safeUpdateElement('problem-card-5-training', replaceTemplates(data.ui?.problem_card_5_training));
    safeUpdateElement('problem-card-6-title', data.ui?.problem_card_6_title);
    safeUpdateElement('problem-card-6-risks', replaceTemplates(data.ui?.problem_card_6_risks));

    // Problem Details Sections (par voiturette - ne changent PAS avec le slider)
    populateProblemDetailsSections();

    // VS Batteries Section (statique)
    populateVsBatteriesSection();

    // Solution
    safeUpdateElement('solution-title', data.solution?.title);
    safeUpdateElement('autonomy', data.solution?.autonomy);
    safeUpdateElement('autonomy-hours', data.solution?.autonomy_hours);
    safeUpdateElement('cycles', data.solution?.cycles);
    safeUpdateElement('lifespan', data.solution?.lifespan);
    safeUpdateElement('charge-time', data.solution?.charge_time);
    safeUpdateElement('maintenance', data.solution?.maintenance);
    safeUpdateElement('weight', data.solution?.weight);

    // Autonomy comparison data
    safeUpdateElement('autonomy-new', data.problem?.autonomy_new);
    safeUpdateElement('autonomy-degraded', data.problem?.autonomy_degraded);
    safeUpdateElement('autonomy-loss', data.problem?.autonomy_loss);

    // Solution UI elements
    safeUpdateElement('solution-card-1-title', data.ui?.solution_card_1_title);
    safeUpdateElement('solution-card-2-title', data.ui?.solution_card_2_title);
    safeUpdateElement('solution-card-2-lifespan-separator', data.ui?.solution_card_2_lifespan_separator);
    safeUpdateElement('solution-card-3-title', data.ui?.solution_card_3_title);
    safeUpdateElement('solution-card-3-charge-prefix', data.ui?.solution_card_3_charge_prefix);
    safeUpdateElement('solution-card-4-title', data.ui?.solution_card_4_title);
    safeUpdateElement('solution-card-4-weight-prefix', data.ui?.solution_card_4_weight_prefix);

    // Comparison
    safeUpdateElement('comparison-title', data.ui?.comparison_title);
    safeUpdateElement('comparison-criterion', data.ui?.comparison_criterion);
    safeUpdateElement('comparison-lead-batteries', data.ui?.comparison_lead_batteries);
    safeUpdateElement('comparison-eds-solution', data.ui?.comparison_eds_solution);
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
    safeUpdateElement('pricing-title', data.ui?.pricing_title);
    safeUpdateElement('contract-10-title', data.pricing?.contract_10_title);
    safeUpdateElement('contract-20-title', data.pricing?.contract_20_title);
    safeUpdateElement('contract-20-fleet-title', data.pricing?.contract_20_fleet_title);
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
    safeUpdateElement('benefits-title', data.ui?.benefits_title);
    safeUpdateElement('benefits-reliability', data.ui?.benefits_reliability);
    safeUpdateElement('benefits-simplicity', data.ui?.benefits_simplicity);
    safeUpdateElement('benefits-performance', data.ui?.benefits_performance);
    safeUpdateElement('benefits-economy', data.ui?.benefits_economy);
    safeUpdateElement('benefits-partnership', data.ui?.benefits_partnership);
    safeUpdateElement('benefits-ecology', data.ui?.benefits_ecology);
    safeUpdateElement('benefit-1', data.benefits?.benefit_1);
    safeUpdateElement('benefit-2', data.benefits?.benefit_2);
    safeUpdateElement('benefit-3', data.benefits?.benefit_3);
    safeUpdateElement('benefit-4', data.benefits?.benefit_4);
    safeUpdateElement('benefit-5', data.benefits?.benefit_5);
    safeUpdateElement('benefit-6', data.benefits?.benefit_6);

    // Testimonial
    safeUpdateElement('testimonial-quote', data.testimonial?.quote);
    safeUpdateElement('testimonial-author', data.testimonial?.author);
    safeUpdateElement('testimonial-title', data.testimonial?.title);
    safeUpdateElement('testimonial-company', data.testimonial?.company);

    // Contact
    safeUpdateElement('contact-title', data.ui?.contact_title);
    safeUpdateElement('contact-subtitle', data.ui?.contact_subtitle);
    safeUpdateElement('specialist-name', data.contact?.specialist_name);
    safeUpdateElement('specialist-title', data.contact?.specialist_title);
    safeUpdateElement('specialist-phone', data.contact?.specialist_phone);
    safeUpdateElement('specialist-email', data.contact?.specialist_email);
    safeUpdateElement('website', data.contact?.website);
    safeUpdateElement('contact-phone-label', data.ui?.contact_phone_label);
    safeUpdateElement('contact-email-label', data.ui?.contact_email_label);
    safeUpdateElement('contact-website-label', data.ui?.contact_website_label);

    // Cart Calculator
    safeUpdateElement('cart-calculator-title', data.ui?.cart_calculator_title);
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