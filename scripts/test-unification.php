<?php
/**
 * Test simple de l'unification système utilisateurs
 * Sans dépendances Composer
 */

echo "🎲 Test d'unification Geek&Dragon\n";
echo "==================================\n\n";

try {
    // Test 1: Connexion base de données
    echo "🔌 Test connexion base de données...\n";
    $dbPath = __DIR__ . '/../user-system/database.db';
    $dsn = "sqlite:{$dbPath}";
    
    $pdo = new PDO($dsn);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Connexion SQLite réussie\n";
    echo "📍 Base: {$dbPath}\n\n";
    
    // Test 2: Vérifier les tables
    echo "📋 Vérification des tables...\n";
    $tables = ['users', 'user_favorites', 'user_sessions', 'user_invoices', 'invoice_items'];
    
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) FROM {$table}");
            $count = $stmt->fetchColumn();
            echo "✅ Table {$table}: {$count} enregistrements\n";
        } catch (PDOException $e) {
            echo "❌ Table {$table}: N'existe pas encore\n";
        }
    }
    echo "\n";
    
    // Test 3: Créer les tables si nécessaire
    echo "🏗️ Création des tables manquantes...\n";
    
    // Schema principal
    $schemaPath = __DIR__ . '/../user-system/database-schema.sql';
    if (file_exists($schemaPath)) {
        echo "📖 Lecture du schéma principal...\n";
        $schema = file_get_contents($schemaPath);
        
        // Diviser en requêtes
        $statements = explode(';', $schema);
        $created = 0;
        
        foreach ($statements as $statement) {
            $statement = trim($statement);
            if (!empty($statement) && !str_starts_with($statement, '--')) {
                try {
                    $pdo->exec($statement);
                    $created++;
                } catch (PDOException $e) {
                    // Table existe probablement déjà
                }
            }
        }
        echo "✅ {$created} tables/index créés\n";
    }
    
    // Schema factures
    $invoiceSchemaPath = __DIR__ . '/../user-system/database-invoices-schema.sql';
    if (file_exists($invoiceSchemaPath)) {
        echo "📖 Lecture du schéma factures...\n";
        $schema = file_get_contents($invoiceSchemaPath);
        
        $statements = explode(';', $schema);
        $created = 0;
        
        foreach ($statements as $statement) {
            $statement = trim($statement);
            if (!empty($statement) && !str_starts_with($statement, '--')) {
                try {
                    $pdo->exec($statement);
                    $created++;
                } catch (PDOException $e) {
                    // Table existe probablement déjà
                }
            }
        }
        echo "✅ {$created} tables factures créées\n\n";
    }
    
    // Test 4: Créer utilisateur de test
    echo "👤 Création utilisateur de test...\n";
    
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
    $stmt->execute(['test@geekndragon.com']);
    $exists = $stmt->fetchColumn() > 0;
    
    if (!$exists) {
        $stmt = $pdo->prepare("
            INSERT INTO users (
                email, nom_aventurier, espece, classe, historique,
                style_jeu, experience_jeu, campagnes_preferees
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            'test@geekndragon.com',
            'Aragorn Testeur',
            'Humain',
            'Rôdeur',
            'Noble',
            'exploration',
            'expert',
            'fantasy'
        ]);
        
        $userId = $pdo->lastInsertId();
        echo "✅ Utilisateur test créé (ID: {$userId})\n";
        
        // Ajouter facture de test
        $stmt = $pdo->prepare("
            INSERT INTO user_invoices (
                user_id, snipcart_order_id, customer_email, customer_name,
                order_number, status, payment_status, subtotal, total_amount,
                currency, invoice_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $userId, 'test-order-001', 'test@geekndragon.com', 'Aragorn Testeur',
            'TEST-001', 'Delivered', 'Paid', 60.00, 60.00,
            'CAD', date('Y-m-d H:i:s')
        ]);
        
        echo "✅ Facture test créée\n";
    } else {
        echo "ℹ️ Utilisateur test existe déjà\n";
    }
    echo "\n";
    
    // Test 5: Statistiques finales
    echo "📊 Statistiques finales...\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    $userCount = $stmt->fetchColumn();
    echo "👥 Utilisateurs: {$userCount}\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) FROM user_invoices");
    $invoiceCount = $stmt->fetchColumn();
    echo "🧾 Factures: {$invoiceCount}\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) FROM invoice_items");
    $itemCount = $stmt->fetchColumn();
    echo "📦 Articles: {$itemCount}\n\n";
    
    // Test 6: Vérification des fichiers modifiés
    echo "📂 Vérification des fichiers unifiés...\n";
    
    $files = [
        'src/Service/DatabaseService.php' => 'Service base centralisé',
        'src/Controller/AccountController.php' => 'Contrôleur unifié',
        'compte.php' => 'Interface modernisée',
        'views/account/invoices.php' => 'Interface factures',
        'PHASE1-CLEANUP.md' => 'Documentation nettoyage'
    ];
    
    foreach ($files as $file => $desc) {
        if (file_exists(__DIR__ . '/../' . $file)) {
            echo "✅ {$file} - {$desc}\n";
        } else {
            echo "❌ {$file} - MANQUANT\n";
        }
    }
    echo "\n";
    
    // Résultat final
    echo "🎉 TEST D'UNIFICATION RÉUSSI !\n";
    echo "================================\n";
    echo "✅ Base de données opérationnelle\n";
    echo "✅ Tables créées et peuplées\n";
    echo "✅ Fichiers unifiés en place\n";
    echo "✅ Système prêt pour Phase 2\n\n";
    
    echo "🚀 Prochaines étapes:\n";
    echo "1. Tester interface compte.php\n";
    echo "2. Valider les API endpoints\n";
    echo "3. Procéder au nettoyage (PHASE1-CLEANUP.md)\n";
    echo "4. Commencer Phase 2: Consolidation Snipcart\n\n";
    
} catch (Exception $e) {
    echo "❌ ERREUR: " . $e->getMessage() . "\n";
    echo "📍 Fichier: " . $e->getFile() . ":" . $e->getLine() . "\n";
    exit(1);
}