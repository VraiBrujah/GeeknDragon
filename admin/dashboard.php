<?php
/**
 * Tableau de Bord Administrateur - Geek&Dragon
 * Interface de gestion avec données réelles Snipcart
 */

session_start();
define('ADMIN_ACCESS', true);
require_once 'config.php';
require_once '../vendor/autoload.php';

use GeeknDragon\Cart\SnipcartClient;

// Vérifier la session admin
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.php');
    exit;
}

// Vérifier le timeout de session
if (time() - $_SESSION['admin_last_activity'] > SESSION_TIMEOUT) {
    session_destroy();
    header('Location: login.php?timeout=1');
    exit;
}

$_SESSION['admin_last_activity'] = time();

// Initialiser le client Snipcart unifié
try {
    $snipcart = new SnipcartClient(
        SNIPCART_API_KEY ?? '',
        SNIPCART_SECRET_KEY ?? '',
        (SNIPCART_MODE ?? 'live') === 'mock'
    );
    
    // Récupérer les données réelles
    $recentOrders = $snipcart->getRecentOrders(10);
    $salesStats = $snipcart->getSalesStats();
    $apiConnected = $snipcart->testConnection();
} catch (\Exception $e) {
    error_log("Erreur initialisation SnipcartClient: " . $e->getMessage());
    $recentOrders = ['error' => 'Configuration API invalide'];
    $salesStats = ['error' => 'Configuration API invalide'];
    $apiConnected = false;
}

// Gestion des actions POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $action = $_POST['action'];
    $csrf_token = $_POST['csrf_token'] ?? '';
    
    if (!verifyCSRFToken($csrf_token)) {
        $error = 'Token de sécurité invalide';
    } else {
        switch ($action) {
            case 'update_order_status':
                $orderId = sanitizeInput($_POST['order_id'] ?? '');
                $newStatus = sanitizeInput($_POST['new_status'] ?? '');
                
                if ($orderId && $newStatus) {
                    $result = $snipcart->updateOrderStatus($orderId, $newStatus);
                    if (isset($result['error'])) {
                        $error = 'Erreur lors de la mise à jour: ' . $result['error'];
                    } else {
                        $success = "Statut de la commande {$orderId} mis à jour vers {$newStatus}";
                        logAdminAction('ORDER_STATUS_UPDATE', "Commande {$orderId} -> {$newStatus}");
                    }
                }
                break;
                
            case 'logout':
                logAdminAction('LOGOUT', $_SESSION['admin_username']);
                session_destroy();
                header('Location: login.php');
                exit;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tableau de Bord - Administration Geek&Dragon</title>
    <link rel="stylesheet" href="../css/style.css">
    <style>
        .admin-dashboard {
            background: var(--dark-bg);
            min-height: 100vh;
            color: var(--light-text);
        }
        
        .admin-header {
            background: var(--darker-bg);
            padding: 1rem 0;
            border-bottom: 2px solid var(--secondary-color);
        }
        
        .admin-header .container {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .admin-title {
            color: var(--secondary-color);
            font-family: var(--font-heading);
            margin: 0;
        }
        
        .admin-nav {
            display: flex;
            gap: 1rem;
            align-items: center;
        }
        
        .admin-nav a, .admin-nav button {
            color: var(--light-text);
            text-decoration: none;
            padding: 0.5rem 1rem;
            border-radius: var(--border-radius);
            transition: var(--transition);
            border: 1px solid var(--border-color);
            background: transparent;
            cursor: pointer;
        }
        
        .admin-nav a:hover, .admin-nav button:hover {
            background: var(--secondary-color);
            color: var(--dark-bg);
        }
        
        .admin-main {
            padding: 2rem 0;
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }
        
        .dashboard-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            padding: 1.5rem;
            box-shadow: var(--shadow-light);
        }
        
        .dashboard-card h3 {
            color: var(--secondary-color);
            margin: 0 0 1rem 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: var(--secondary-color);
            display: block;
        }
        
        .stat-label {
            color: var(--medium-text);
            font-size: 0.9rem;
        }
        
        .status-indicator {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 0.5rem;
        }
        
        .status-connected { background: #4CAF50; }
        .status-disconnected { background: #f44336; }
        
        .orders-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
        }
        
        .orders-table th,
        .orders-table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }
        
        .orders-table th {
            background: var(--darker-bg);
            color: var(--secondary-color);
            font-weight: 600;
        }
        
        .order-status {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .status-processed { background: #4CAF50; color: white; }
        .status-inprogress { background: #FF9800; color: white; }
        .status-shipped { background: #2196F3; color: white; }
        .status-cancelled { background: #f44336; color: white; }
        
        .error-message {
            background: rgba(220, 20, 60, 0.2);
            border: 1px solid var(--dragon-red);
            color: var(--dragon-red);
            padding: 1rem;
            border-radius: var(--border-radius);
            margin-bottom: 1rem;
        }
        
        .success-message {
            background: rgba(76, 175, 80, 0.2);
            border: 1px solid #4CAF50;
            color: #4CAF50;
            padding: 1rem;
            border-radius: var(--border-radius);
            margin-bottom: 1rem;
        }
        
        .no-data {
            text-align: center;
            color: var(--medium-text);
            padding: 2rem;
            font-style: italic;
        }
        
        .product-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .product-list li {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border-color);
        }
        
        .product-list li:last-child {
            border-bottom: none;
        }
        
        .btn-small {
            padding: 0.25rem 0.5rem;
            font-size: 0.8rem;
            border: 1px solid var(--secondary-color);
            background: transparent;
            color: var(--secondary-color);
            border-radius: 4px;
            cursor: pointer;
            transition: var(--transition);
        }
        
        .btn-small:hover {
            background: var(--secondary-color);
            color: var(--dark-bg);
        }
    </style>
</head>
<body>
    <div class="admin-dashboard">
        <!-- Header Admin -->
        <header class="admin-header">
            <div class="container">
                <h1 class="admin-title">🛡️ Administration Geek&Dragon</h1>
                <nav class="admin-nav">
                    <span>Bienvenue, <?= htmlspecialchars($_SESSION['admin_username']) ?></span>
                    <a href="../index.php" target="_blank">Voir le site</a>
                    <form method="POST" style="display: inline;">
                        <input type="hidden" name="csrf_token" value="<?= generateCSRFToken() ?>">
                        <button type="submit" name="action" value="logout">Déconnexion</button>
                    </form>
                </nav>
            </div>
        </header>

        <main class="admin-main">
            <div class="container">
                
                <?php if (isset($error)): ?>
                    <div class="error-message"><?= htmlspecialchars($error) ?></div>
                <?php endif; ?>
                
                <?php if (isset($success)): ?>
                    <div class="success-message"><?= htmlspecialchars($success) ?></div>
                <?php endif; ?>

                <!-- Statistiques Générales -->
                <div class="dashboard-grid">
                    
                    <!-- Statut API Snipcart -->
                    <div class="dashboard-card">
                        <h3>🔌 Statut API Snipcart</h3>
                        <div>
                            <span class="status-indicator <?= $apiConnected ? 'status-connected' : 'status-disconnected' ?>"></span>
                            <?= $apiConnected ? 'Connecté' : 'Déconnecté' ?>
                        </div>
                        <?php if (!$apiConnected): ?>
                            <p style="color: var(--dragon-red); font-size: 0.9rem; margin-top: 0.5rem;">
                                Vérifiez la configuration des clés API dans le fichier .env
                            </p>
                        <?php endif; ?>
                    </div>

                    <!-- Ventes du Mois -->
                    <?php if ($apiConnected && !isset($salesStats['error'])): ?>
                        <div class="dashboard-card">
                            <h3>💰 Ventes du Mois</h3>
                            <span class="stat-number"><?= number_format($salesStats['total_revenue'], 2) ?>$ CAD</span>
                            <span class="stat-label"><?= $salesStats['total_orders'] ?> commandes</span>
                        </div>

                        <div class="dashboard-card">
                            <h3>📊 Panier Moyen</h3>
                            <span class="stat-number"><?= number_format($salesStats['average_order_value'], 2) ?>$ CAD</span>
                            <span class="stat-label">Valeur moyenne par commande</span>
                        </div>

                        <div class="dashboard-card">
                            <h3>🏆 Top Produits</h3>
                            <?php if (!empty($salesStats['top_products'])): ?>
                                <ul class="product-list">
                                    <?php foreach (array_slice($salesStats['top_products'], 0, 3) as $product): ?>
                                        <li>
                                            <span><?= htmlspecialchars($product['name']) ?></span>
                                            <span><?= $product['quantity'] ?> vendus</span>
                                        </li>
                                    <?php endforeach; ?>
                                </ul>
                            <?php else: ?>
                                <div class="no-data">Aucune vente enregistrée</div>
                            <?php endif; ?>
                        </div>
                    <?php else: ?>
                        <div class="dashboard-card">
                            <h3>⚠️ Données Indisponibles</h3>
                            <p style="color: var(--medium-text);">
                                <?= isset($salesStats['error']) ? htmlspecialchars($salesStats['error']) : 'API Snipcart non configurée' ?>
                            </p>
                        </div>
                    <?php endif; ?>
                </div>

                <!-- Commandes Récentes -->
                <div class="dashboard-card">
                    <h3>📦 Commandes Récentes</h3>
                    
                    <?php if ($apiConnected && !isset($recentOrders['error']) && !empty($recentOrders['items'])): ?>
                        <table class="orders-table">
                            <thead>
                                <tr>
                                    <th>N° Commande</th>
                                    <th>Client</th>
                                    <th>Montant</th>
                                    <th>Statut</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach (array_slice($recentOrders['items'], 0, 10) as $order): ?>
                                    <tr>
                                        <td>#<?= htmlspecialchars($order['invoiceNumber'] ?? $order['token'] ?? 'N/A') ?></td>
                                        <td><?= htmlspecialchars($order['email'] ?? 'N/A') ?></td>
                                        <td><?= number_format($order['finalGrandTotal'] ?? 0, 2) ?>$ CAD</td>
                                        <td>
                                            <span class="order-status status-<?= strtolower($order['status'] ?? 'unknown') ?>">
                                                <?= htmlspecialchars($order['status'] ?? 'Inconnu') ?>
                                            </span>
                                        </td>
                                        <td><?= date('d/m/Y H:i', strtotime($order['creationDate'] ?? 'now')) ?></td>
                                        <td>
                                            <form method="POST" style="display: inline;">
                                                <input type="hidden" name="csrf_token" value="<?= generateCSRFToken() ?>">
                                                <input type="hidden" name="action" value="view_order">
                                                <input type="hidden" name="order_id" value="<?= htmlspecialchars($order['token'] ?? '') ?>">
                                                <button type="submit" class="btn-small">Voir</button>
                                            </form>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    <?php elseif (isset($recentOrders['error'])): ?>
                        <div class="no-data">
                            Erreur: <?= htmlspecialchars($recentOrders['error']) ?>
                        </div>
                    <?php else: ?>
                        <div class="no-data">
                            <?= $apiConnected ? 'Aucune commande trouvée' : 'API Snipcart non configurée - Configurez vos clés API dans le fichier .env' ?>
                        </div>
                    <?php endif; ?>
                </div>

                <!-- Informations Système -->
                <div class="dashboard-card">
                    <h3>🔧 Informations Système</h3>
                    <ul class="product-list">
                        <li>
                            <span>Session Admin</span>
                            <span>Expire dans <?= ceil((SESSION_TIMEOUT - (time() - $_SESSION['admin_login_time'])) / 60) ?> min</span>
                        </li>
                        <li>
                            <span>Dernière Activité</span>
                            <span><?= date('d/m/Y H:i:s', $_SESSION['admin_last_activity']) ?></span>
                        </li>
                        <li>
                            <span>Adresse IP</span>
                            <span><?= htmlspecialchars($_SERVER['REMOTE_ADDR'] ?? 'N/A') ?></span>
                        </li>
                        <li>
                            <span>Fichiers Logs</span>
                            <span><?= file_exists(__DIR__ . '/logs/admin_actions.log') ? 'Actifs' : 'Inactifs' ?></span>
                        </li>
                    </ul>
                </div>

            </div>
        </main>
    </div>

    <script>
        // Auto-refresh des données toutes les 5 minutes
        setTimeout(() => {
            window.location.reload();
        }, 300000);

        // Confirmation avant déconnexion
        document.querySelector('button[value="logout"]').addEventListener('click', (e) => {
            if (!confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                e.preventDefault();
            }
        });

        // Affichage du temps de session restant
        function updateSessionTimer() {
            const sessionStart = <?= $_SESSION['admin_login_time'] ?>;
            const sessionTimeout = <?= SESSION_TIMEOUT ?>;
            const now = Math.floor(Date.now() / 1000);
            const remaining = sessionTimeout - (now - sessionStart);
            
            if (remaining <= 0) {
                alert('Session expirée. Vous allez être redirigé vers la page de connexion.');
                window.location.href = 'login.php?timeout=1';
            }
        }

        setInterval(updateSessionTimer, 60000); // Vérifier chaque minute
    </script>
</body>
</html>