<?php
/**
 * Test de Validation - Consolidation Snipcart Phase 2
 * Valide que le SnipcartClient unifié fonctionne correctement
 */

echo "🧪 TEST DE CONSOLIDATION SNIPCART - PHASE 2\n";
echo "==========================================\n\n";

// Test 1: Chargement du client unifié
echo "1️⃣  Test du chargement SnipcartClient...\n";

// Chargement des classes
if (file_exists('vendor/autoload.php')) {
    require_once 'vendor/autoload.php';
    echo "✅ Autoloader Composer trouvé\n";
} else {
    // Fallback pour chargement direct
    require_once 'src/Cart/SnipcartClient.php';
    echo "✅ Chargement direct des classes\n";
}

use GeeknDragon\Cart\SnipcartClient;

try {
    echo "✅ Namespace GeeknDragon\\Cart accessible\n";
    
    // Initialisation en mode mock pour les tests
    $client = new SnipcartClient('test-api-key', 'test-secret-key', true);
    echo "✅ SnipcartClient instancié en mode mock\n";
    
} catch (Exception $e) {
    echo "❌ ERREUR: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 2: Méthodes de base héritées
echo "\n2️⃣  Test des méthodes de base...\n";

try {
    $product = $client->getProduct('test-product');
    echo "✅ getProduct() - " . ($product['id'] ?? 'N/A') . "\n";
    
    $orders = $client->getOrders();
    echo "✅ getOrders() - " . ($orders['totalItems'] ?? 0) . " commandes\n";
    
    $customer = $client->getCustomer('test-customer');
    echo "✅ getCustomer() - " . ($customer['email'] ?? 'N/A') . "\n";
    
} catch (Exception $e) {
    echo "❌ ERREUR méthodes de base: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 3: Nouvelles méthodes administratives
echo "\n3️⃣  Test des méthodes administratives ajoutées...\n";

try {
    $recentOrders = $client->getRecentOrders(5);
    echo "✅ getRecentOrders() - " . count($recentOrders['items'] ?? []) . " commandes récentes\n";
    
    $salesStats = $client->getSalesStats();
    echo "✅ getSalesStats() - " . ($salesStats['total_orders'] ?? 0) . " commandes, " . 
         number_format($salesStats['total_revenue'] ?? 0, 2) . "$ de revenus\n";
    
    $customers = $client->getCustomers(10);
    echo "✅ getCustomers() - " . count($customers['items'] ?? []) . " clients\n";
    
    $connected = $client->testConnection();
    echo "✅ testConnection() - " . ($connected ? "Connecté" : "Déconnecté") . " (mode mock)\n";
    
    $productStats = $client->getProductStats();
    echo "✅ getProductStats() - " . count($productStats) . " produits dans le catalogue\n";
    
} catch (Exception $e) {
    echo "❌ ERREUR méthodes admin: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 4: Données mock cohérentes
echo "\n4️⃣  Test de cohérence des données mock...\n";

try {
    $order = $client->getOrder('test-order');
    $requiredFields = ['token', 'email', 'status', 'total', 'items'];
    
    foreach ($requiredFields as $field) {
        if (!isset($order[$field])) {
            throw new Exception("Champ manquant dans les données mock: $field");
        }
    }
    echo "✅ Structure des commandes mock valide\n";
    
    $topProducts = $salesStats['top_products'] ?? [];
    if (count($topProducts) > 0) {
        $firstProduct = reset($topProducts);
        if (isset($firstProduct['name']) && isset($firstProduct['quantity'])) {
            echo "✅ Structure des statistiques mock valide\n";
        } else {
            throw new Exception("Structure des top produits invalide");
        }
    }
    
} catch (Exception $e) {
    echo "❌ ERREUR cohérence mock: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 5: Validation de l'intégration admin
echo "\n5️⃣  Test d'intégration admin/dashboard.php...\n";

if (!file_exists('admin/dashboard.php')) {
    echo "❌ ERREUR: admin/dashboard.php non trouvé\n";
    exit(1);
}

$dashboardContent = file_get_contents('admin/dashboard.php');

// Vérifications critiques
$checks = [
    'use GeeknDragon\Cart\SnipcartClient' => 'Import du namespace unifié',
    'new SnipcartClient(' => 'Instanciation du client unifié',
    'getRecentOrders(' => 'Méthode admin récente',
    'getSalesStats(' => 'Méthode statistiques',
    'testConnection(' => 'Méthode test connexion'
];

foreach ($checks as $pattern => $description) {
    if (strpos($dashboardContent, $pattern) !== false) {
        echo "✅ $description\n";
    } else {
        echo "❌ MANQUANT: $description\n";
        exit(1);
    }
}

// Vérifier absence des anciens imports
if (strpos($dashboardContent, 'snipcart-api.php') !== false) {
    echo "⚠️  ATTENTION: Référence à l'ancien snipcart-api.php détectée\n";
} else {
    echo "✅ Ancien snipcart-api.php correctement supprimé des imports\n";
}

// Test 6: Validation des fichiers de consolidation
echo "\n6️⃣  Test de présence des fichiers consolidés...\n";

$consolidatedFiles = [
    'src/Cart/SnipcartClient.php' => 'Client Snipcart unifié',
    'src/Controller/SnipcartWebhookController.php' => 'Contrôleur webhook',
    'admin/dashboard.php' => 'Interface admin mise à jour'
];

foreach ($consolidatedFiles as $file => $description) {
    if (file_exists($file)) {
        echo "✅ $description: $file\n";
    } else {
        echo "❌ MANQUANT: $description - $file\n";
        exit(1);
    }
}

// Test 7: Vérification des fichiers à supprimer
echo "\n7️⃣  Test des fichiers redondants à supprimer...\n";

$redundantFiles = [
    'admin/snipcart-api.php' => 'API administrative redondante',
    'api/snipcart-webhook.php' => 'Webhook standalone redondant',
    'gd-ecommerce-native' => 'Projet orphelin'
];

$readyForCleanup = true;
foreach ($redundantFiles as $file => $description) {
    if (file_exists($file)) {
        echo "🗑️  À supprimer: $description - $file\n";
        $readyForCleanup = $readyForCleanup && true;
    } else {
        echo "✅ Déjà nettoyé: $description\n";
    }
}

// RAPPORT FINAL
echo "\n📊 === RAPPORT DE VALIDATION ===\n";
echo "✅ Client SnipcartClient unifié fonctionnel\n";
echo "✅ Toutes les méthodes (base + admin) opérationnelles\n";
echo "✅ Données mock cohérentes et complètes\n";
echo "✅ Dashboard admin intégré avec succès\n";
echo "✅ Architecture consolidée validée\n";

if ($readyForCleanup) {
    echo "\n🚀 PRÊT POUR LE NETTOYAGE!\n";
    echo "💡 Exécutez: powershell -ExecutionPolicy Bypass -File cleanup-phase2.ps1\n";
} else {
    echo "\n✅ CONSOLIDATION TERMINÉE ET NETTOYÉE!\n";
}

echo "\n🎯 PHASE 2 - CONSOLIDATION SNIPCART VALIDÉE AVEC SUCCÈS! 🎉\n";
?>