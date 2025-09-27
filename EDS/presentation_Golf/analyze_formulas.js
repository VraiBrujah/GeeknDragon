// Analyse de cohérence des formules
const fs = require('fs');

// Charger les variables
const variablesData = fs.readFileSync('variables.csv', 'utf8');

// Parser les variables
const variables = {};
variablesData.split('\n').forEach(line => {
    if (line.startsWith('#') || !line.trim()) return;
    const [id, value, unit] = line.split(',');
    if (id && value && !isNaN(parseFloat(value))) {
        variables[id] = parseFloat(value);
    }
});

console.log('=== VARIABLES CLÉS ===');
console.log('lead_cost_replacement_unit:', variables.lead_cost_replacement_unit);
console.log('lead_replacement_cycle_years:', variables.lead_replacement_cycle_years);
console.log('lead_lifespan_max:', variables.lead_lifespan_max);
console.log('premature_failure_percent:', variables.premature_failure_percent);
console.log('lead_maintenance_hours_unit:', variables.lead_maintenance_hours_unit);
console.log('lead_technician_hourly_rate:', variables.lead_technician_hourly_rate);

console.log('\n=== CALCULS MANUELS ===');
// Remplacements sur 20 ans
const replacements20 = Math.floor(20 / variables.lead_replacement_cycle_years);
console.log('Remplacements nécessaires sur 20 ans:', replacements20);

// Remplacements payants (après garantie)
const freeReplacements = Math.floor(variables.lead_lifespan_max / variables.lead_replacement_cycle_years);
const paidReplacements = Math.max(0, replacements20 - freeReplacements);
console.log('Remplacements gratuits (garantie 5 ans):', freeReplacements);
console.log('Remplacements payants sur 20 ans:', paidReplacements);

// Coût remplacements avec risque
const replacementCostWithRisk = variables.lead_cost_replacement_unit * paidReplacements * (1 + variables.premature_failure_percent / 100);
console.log('Coût remplacements avec risque 20 ans:', replacementCostWithRisk);

// Maintenance 20 ans
const maintenanceCost20 = variables.lead_maintenance_hours_unit * 20 * variables.lead_technician_hourly_rate;
console.log('Coût maintenance 20 ans:', maintenanceCost20);

// Coûts opérationnels annuels
const operationalCostYearly = variables.revenue_loss_yearly + variables.overconsumption_cost_yearly + variables.insurance_increase_yearly;
console.log('Coûts opérationnels par an:', operationalCostYearly);
console.log('Coûts opérationnels 20 ans:', operationalCostYearly * 20);

// Recyclage
const recyclingCost20 = variables.recycling_disposal_cost * replacements20;
console.log('Coût recyclage 20 ans:', recyclingCost20);

// Total plomb 20 ans
const leadTotal20 = replacementCostWithRisk + maintenanceCost20 + (operationalCostYearly * 20) + recyclingCost20;
console.log('\nTOTAL PLOMB 20 ans:', leadTotal20);

// Prix mensuels lithium
console.log('\n=== LITHIUM ===');
console.log('lifepo4_monthly_10y:', variables.lifepo4_monthly_10y);
console.log('lifepo4_monthly_20y:', variables.lifepo4_monthly_20y);
console.log('lifepo4_monthly_fleet:', variables.lifepo4_monthly_fleet);

// Coûts totaux lithium
const lithium10Total = variables.lifepo4_monthly_10y * 12 * 10;
const lithium20Total = variables.lifepo4_monthly_20y * 12 * 20;
const lithiumFleetTotal = variables.lifepo4_monthly_fleet * 12 * 20;

console.log('Coût total lithium 10 ans:', lithium10Total);
console.log('Coût total lithium 20 ans:', lithium20Total);
console.log('Coût total lithium flotte 20 ans:', lithiumFleetTotal);

// Économies
console.log('\n=== ÉCONOMIES ===');
const savings10 = (variables.lead_cost_replacement_unit * 2 + variables.lead_maintenance_hours_unit * 10 * variables.lead_technician_hourly_rate + operationalCostYearly * 10) - lithium10Total;
const savings20 = leadTotal20 - lithium20Total;
const savingsFleet = leadTotal20 - lithiumFleetTotal;

console.log('Économies 10 ans (approximatif):', Math.round(savings10));
console.log('Économies 20 ans:', Math.round(savings20));
console.log('Économies flotte 20 ans:', Math.round(savingsFleet));

console.log('\nPourcentages d\'économies:');
console.log('20 ans:', Math.round((savings20 / leadTotal20) * 100) + '%');
console.log('Flotte 20 ans:', Math.round((savingsFleet / leadTotal20) * 100) + '%');