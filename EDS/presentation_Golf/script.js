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
    const variable = variables[variableId];
    if (!variable) {
        console.warn(`Variable non trouvée: ${variableId}`);
        return 0;
    }
    return parseFloat(variable.value) || 0;
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

        updateContent();

    } catch (error) {
        console.error('❌ Erreur lors du chargement:', error);
        // En cas d'erreur, essayer de charger le français par défaut
        if (currentLanguage !== 'fr') {
            currentLanguage = 'fr';
            loadAllData();
        }
    }
}


// Fonction utilitaire pour mettre à jour un élément de façon sécurisée
function safeUpdateElement(id, value) {
    const element = document.getElementById(id);
    if (element && value) {
        element.textContent = value;
    } else if (!element) {
        console.warn(`Élément non trouvé: ${id}`);
    }
}

// Fonction pour peupler les sections de détails des problèmes (statiques par voiturette)
function populateProblemDetailsSections() {
    if (!data.problem_details) return;

    // Section 1 - Coûts de Remplacement Explosifs
    safeUpdateElement('problem-details-section-1-title', data.problem_details?.section_1_title);
    safeUpdateElement('problem-details-section-1-subtitle', data.problem_details?.section_1_subtitle);
    safeUpdateElement('problem-details-section-1-point-1', data.problem_details?.section_1_point_1);
    safeUpdateElement('problem-details-section-1-point-2', data.problem_details?.section_1_point_2);
    safeUpdateElement('problem-details-section-1-point-3', data.problem_details?.section_1_point_3);
    safeUpdateElement('problem-details-section-1-point-4', data.problem_details?.section_1_point_4);
    safeUpdateElement('problem-details-section-1-calculation', data.problem_details?.section_1_calculation);

    // Section 2 - Maintenance Spécialisée Coûteuse
    safeUpdateElement('problem-details-section-2-title', data.problem_details?.section_2_title);
    safeUpdateElement('problem-details-section-2-subtitle', data.problem_details?.section_2_subtitle);
    safeUpdateElement('problem-details-section-2-point-1', data.problem_details?.section_2_point_1);
    safeUpdateElement('problem-details-section-2-point-2', data.problem_details?.section_2_point_2);
    safeUpdateElement('problem-details-section-2-point-3', data.problem_details?.section_2_point_3);
    safeUpdateElement('problem-details-section-2-point-4', data.problem_details?.section_2_point_4);
    safeUpdateElement('problem-details-section-2-calculation', data.problem_details?.section_2_calculation);

    // Section 3 - Risques et Pertes Opérationnelles
    safeUpdateElement('problem-details-section-3-title', data.problem_details?.section_3_title);
    safeUpdateElement('problem-details-section-3-subtitle', data.problem_details?.section_3_subtitle);
    safeUpdateElement('problem-details-section-3-point-1', data.problem_details?.section_3_point_1);
    safeUpdateElement('problem-details-section-3-point-2', data.problem_details?.section_3_point_2);
    safeUpdateElement('problem-details-section-3-point-3', data.problem_details?.section_3_point_3);
    safeUpdateElement('problem-details-section-3-point-4', data.problem_details?.section_3_point_4);
    safeUpdateElement('problem-details-section-3-calculation', data.problem_details?.section_3_calculation);

    // Section 4 - TOTAL des Coûts Cachés Réels
    safeUpdateElement('problem-details-section-4-title', data.problem_details?.section_4_title);
    safeUpdateElement('problem-details-section-4-subtitle', data.problem_details?.section_4_subtitle);
    safeUpdateElement('problem-details-section-4-point-1', data.problem_details?.section_4_point_1);
    safeUpdateElement('problem-details-section-4-point-2', data.problem_details?.section_4_point_2);
    safeUpdateElement('problem-details-section-4-point-3', data.problem_details?.section_4_point_3);
    safeUpdateElement('problem-details-section-4-point-4', data.problem_details?.section_4_point_4);
    safeUpdateElement('problem-details-section-4-calculation', data.problem_details?.section_4_calculation);
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
    safeUpdateElement('vs-cost-total-lead', data.vs_batteries?.cost_total_lead);
    safeUpdateElement('vs-cost-total-lifepo4', data.vs_batteries?.cost_total_lifepo4);

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
    safeUpdateElement('vs-lifepo4-advantage-1', data.vs_batteries?.lifepo4_advantage_1);
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
    safeUpdateElement('vs-cta-savings-prefix', data.vs_batteries?.cta_savings_prefix);
    safeUpdateElement('vs-cta-savings-suffix', data.vs_batteries?.cta_savings_suffix);
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
    safeUpdateElement('problem-card-5-training', data.ui?.problem_card_5_training);
    safeUpdateElement('problem-card-6-title', data.ui?.problem_card_6_title);
    safeUpdateElement('problem-card-6-risks', data.ui?.problem_card_6_risks);

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

// Fonction pour formater les nombres avec espaces comme séparateurs de milliers
function formatNumber(num) {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Fonction pour mettre à jour les calculs basés sur le nombre de voiturettes
function updateCartCalculation() {
    if (!data.pricing || !data.problem || !data.comparison) return;

    const currency = ' $';

    // SECTION PROBLÈMES - Coûts explosifs réels du plomb (variables centralisées)
    const costReplacement = getVariable('lead_cost_replacement_unit') * currentCartCount;
    const maintenanceHours = getVariable('lead_maintenance_hours_unit') * currentCartCount;
    const maintenanceCost = getVariable('lead_maintenance_cost_unit') * currentCartCount;
    const maintenance10Years = getVariable('lead_maintenance_10y_unit') * currentCartCount;

    // Coût total réel selon l'architecture centralisée
    const totalRealCost10YearsPerUnit = getVariable('lead_total_cost_10y_unit');
    const cost10YearsReal = totalRealCost10YearsPerUnit * currentCartCount;

    safeUpdateElement('cost-replacement', formatNumber(costReplacement) + currency + ' (par voiturette)');
    safeUpdateElement('cost-10-years', formatNumber(cost10YearsReal) + currency + ' (coût total réel)');
    safeUpdateElement('maintenance-hours', maintenanceHours + ' heures/an');
    safeUpdateElement('maintenance-cost', formatNumber(maintenanceCost) + currency + ' (par voiturette/an)');

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
    const savings10 = getVariable('savings_10y_unit') * currentCartCount;

    const monthly20 = getVariable('lifepo4_monthly_20y') * currentCartCount;
    const savings20 = getVariable('savings_20y_unit') * currentCartCount;

    // Calcul pour l'offre flotte (variables centralisées)
    const monthlyFleet = getVariable('lifepo4_monthly_fleet') * currentCartCount;
    const savingsFleet = getVariable('savings_20y_unit') * currentCartCount;

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

    // SECTION COMPARAISON - Totaux flotte (variables centralisées)
    const leadBatteries10 = getVariable('lead_total_cost_10y_unit') * currentCartCount;
    const lithium10 = getVariable('lifepo4_total_10y_unit') * currentCartCount;

    safeUpdateElement('lead-batteries-10-years', formatNumber(leadBatteries10) + currency);
    safeUpdateElement('contract-10-total', formatNumber(lithium10) + currency);

    // Mettre à jour les heures de maintenance dans la comparaison (variables centralisées)
    const leadMaintenanceHours = getVariable('lead_maintenance_hours_unit') * currentCartCount;
    safeUpdateElement('lead-maintenance', leadMaintenanceHours + (currentLanguage === 'fr' ? ' heures/an' : ' hours/year'));

    // Mettre à jour l'affichage du nombre de voiturettes
    safeUpdateElement('cart-count', currentCartCount.toString());

    // SECTION DÉTAILS DES CALCULS
    updateCalculationDetails();

    // Calculs mis à jour
}

// Mettre à jour les détails des calculs (focus 20 ans - COÛTS RÉELS PLOMB)
function updateCalculationDetails() {
    if (!data.comparison || !data.pricing || !data.problem) return;

    const currency = ' $';

    // Données de base - COÛTS RÉELS selon document de proposition (par voiturette)
    const leadReplacementCost = parseFloat(data.problem.cost_replacement_unit) || 2000; // 2000$ par voiturette par remplacement
    const leadMaintenanceCost = parseFloat(data.problem.maintenance_cost_unit) || 360; // 360$/an par voiturette
    const prematureFailureRisk = parseFloat(data.problem.premature_failure_risk) || 1200; // 12,000$ ÷ 10 = 1200$ par voiturette
    const recyclingCost = parseFloat(data.problem.recycling_disposal_cost) || 30; // 300$ ÷ 10 = 30$ par voiturette
    const revenueLossYearly = parseFloat(data.problem.revenue_loss_yearly) || 80; // 800$ ÷ 10 = 80$ par voiturette/an
    const overconsumptionYearly = parseFloat(data.problem.overconsumption_cost_yearly) || 24; // 240$ ÷ 10 = 24$ par voiturette/an
    const insuranceIncreaseYearly = parseFloat(data.problem.insurance_increase_yearly) || 50; // Estimation par voiturette/an

    const lithiumMonthly10 = parseFloat(data.pricing.contract_10_monthly_unit) || 97.64;
    const lithiumMonthly20 = parseFloat(data.pricing.contract_20_monthly_unit) || 84.36;
    const lithiumFleetMonthly = parseFloat(data.pricing.contract_20_fleet_monthly_unit) || 76.73;

    // Calculs remplacements batterie plomb (cycle 2-5 ans, moyenne 3.5 ans)
    const replacementCycle = 3.5;
    const replacements20Years = Math.ceil(20 / replacementCycle); // 6 remplacements

    // COÛTS TOTAUX RÉELS BATTERIES PLOMB sur 20 ans (par voiturette)
    const leadBatteryCost20 = leadReplacementCost * replacements20Years; // 2000$ × 6 = 12,000$ par voiturette
    const leadMaintenanceCost20 = leadMaintenanceCost * 20; // 360$ × 20 = 7,200$ par voiturette
    const leadRecyclingCost20 = recyclingCost * replacements20Years; // 30$ × 6 = 180$ par voiturette
    const leadRevenueLoss20 = revenueLossYearly * 20; // 80$ × 20 = 1,600$ par voiturette
    const leadOverconsumption20 = overconsumptionYearly * 20; // 24$ × 20 = 480$ par voiturette
    const leadInsuranceIncrease20 = insuranceIncreaseYearly * 20; // 50$ × 20 = 1,000$ par voiturette
    const leadPrematureFailure20 = prematureFailureRisk * 2; // 1200$ × 2 = 2,400$ par voiturette sur 20 ans

    // COÛT TOTAL RÉEL PLOMB par voiturette sur 20 ans
    const leadTotalPerCart20 = leadBatteryCost20 + leadMaintenanceCost20 + leadRecyclingCost20 +
                             leadRevenueLoss20 + leadOverconsumption20 + leadInsuranceIncrease20 + leadPrematureFailure20;
    // = 12,000 + 7,200 + 180 + 1,600 + 480 + 1,000 + 2,400 = 24,860$ par voiturette sur 20 ans

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

    // Fourchette intelligente (variation selon cycle 2-5 ans au lieu de 3.5)
    const minReplacements20 = Math.ceil(20 / 5); // 4 remplacements (batterie dure 5 ans)
    const maxReplacements20 = Math.ceil(20 / 2); // 10 remplacements (batterie dure 2 ans)

    const minLeadCostPerCart20 = leadReplacementCost * minReplacements20 + leadMaintenanceCost * 20 +
                               leadRecyclingCost20 + leadRevenueLoss20 + leadOverconsumption20 + leadInsuranceIncrease20;
    const maxLeadCostPerCart20 = leadReplacementCost * maxReplacements20 + leadMaintenanceCost * 20 +
                               leadRecyclingCost20 + leadRevenueLoss20 + leadOverconsumption20 + leadInsuranceIncrease20;

    const minSavings20 = (minLeadCostPerCart20 * currentCartCount) - lithium20;
    const maxSavings20 = (maxLeadCostPerCart20 * currentCartCount) - lithium20;

    // Calculs ROI (lithium vs coûts explosifs plomb)
    const roiPercentage = ((totalSavings20 / lithium20) * 100).toFixed(1);
    const monthlySavingsAverage = totalSavings20 / (20 * 12);
    const perCartMonthlySavings = monthlySavingsAverage / currentCartCount;
    const annualSavingsPerCart = perCartMonthlySavings * 12;

    // === 1. SECTION BATTERIES PLOMB (COÛTS RÉELS selon document) ===
    safeUpdateElement('lead-replacement-schedule', data.calculs?.lead_replacement_schedule || 'Remplacement nécessaire tous les 2-5 ans');
    safeUpdateElement('lead-replacements-20y', `${replacements20Years} remplacements à 2 000$ par voiturette`);

    // Détail complet des coûts cachés du plomb (par voiturette)
    const leadBreakdownText = currentLanguage === 'fr'
        ? `${formatNumber(leadBatteryCost20)}${currency} (batteries) + ${formatNumber(leadMaintenanceCost20)}${currency} (maintenance) + ${formatNumber(leadRecyclingCost20 + leadRevenueLoss20 + leadOverconsumption20 + leadInsuranceIncrease20 + leadPrematureFailure20)}${currency} (coûts cachés) par voiturette`
        : `${formatNumber(leadBatteryCost20)}${currency} (batteries) + ${formatNumber(leadMaintenanceCost20)}${currency} (maintenance) + ${formatNumber(leadRecyclingCost20 + leadRevenueLoss20 + leadOverconsumption20 + leadInsuranceIncrease20 + leadPrematureFailure20)}${currency} (hidden costs) per cart`;

    safeUpdateElement('lead-cost-breakdown-20y', leadBreakdownText);
    safeUpdateElement('lead-total-calc-20y', formatNumber(leadTotal20) + currency);

    const maintenanceDetailText = currentLanguage === 'fr'
        ? `${formatNumber(leadMaintenanceCost20 * currentCartCount)}${currency} (120h/an × 30$/h ÷ 10 voiturettes × 20 ans)`
        : `${formatNumber(leadMaintenanceCost20 * currentCartCount)}${currency} (120h/year × 30$/h ÷ 10 carts × 20 years)`;
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

    // Mise à jour autres données comparaison
    safeUpdateElement('lead-replacements', `${Math.ceil(10 / replacementCycle)} remplacements sur 10 ans`);
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
}

// Mettre à jour le calculateur flottant
function updateFloatingCalculator() {
    if (!data.pricing) return;

    const currency = ' $';

    // Calculs
    const monthly10 = parseFloat(data.pricing.contract_10_monthly_unit) * currentCartCount;
    const monthly20 = parseFloat(data.pricing.contract_20_monthly_unit) * currentCartCount;
    const monthlyFleet = parseFloat(data.pricing.contract_20_fleet_monthly_unit) * currentCartCount;

    // Mise à jour des affichages
    safeUpdateElement('cart-count-floating', currentCartCount.toString());
    safeUpdateElement('price-10-floating', formatNumber(monthly10) + currency);
    safeUpdateElement('price-20-floating', formatNumber(monthly20) + currency);
    safeUpdateElement('price-fleet-floating', formatNumber(monthlyFleet) + currency);

    // Synchroniser le slider flottant
    const floatingSlider = document.getElementById('cartSliderFloating');
    if (floatingSlider) {
        floatingSlider.value = currentCartCount;
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