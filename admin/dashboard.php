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

$title = 'Tableau de bord - Administration Geek&Dragon';
$metaDescription = "Supervision des ventes, commandes et statistiques Snipcart pour l'équipe Geek&Dragon.";
$active = 'dashboard';
$navItems = [
    '/admin/dashboard.php' => [
        'slug' => 'dashboard',
        'label' => 'Tableau de bord',
        'localized' => false,
    ],
    '/admin/reviews.php' => [
        'slug' => 'reviews',
        'label' => 'Gestion des avis',
        'localized' => false,
    ],
];
$headerActions = [
    [
        'type' => 'link',
        'label' => 'Retour au site',
        'href' => '/index.php',
        'icon' => '↩',
        'class' => 'bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/60',
        'attributes' => [
            'target' => '_blank',
            'rel' => 'noopener noreferrer',
        ],
    ],
    [
        'type' => 'form',
        'label' => 'Déconnexion',
        'icon' => '🚪',
        'method' => 'post',
        'action' => '/admin/dashboard.php',
        'hidden' => [
            'csrf_token' => generateCSRFToken(),
            'action' => 'logout',
        ],
        'confirm' => 'Êtes-vous sûr de vouloir vous déconnecter ?',
        'class' => 'bg-red-500/30 hover:bg-red-500/40 border border-red-400/60',
    ],
];
$showLangSwitcher = false;
$showAccountControls = false;
$showCartControls = false;
$showSnipcartWarning = false;
$sessionRemainingSeconds = max(0, SESSION_TIMEOUT - (time() - ($_SESSION['admin_login_time'] ?? time())));

$extraHead = <<<HTML
  <link rel="stylesheet" href="/css/style.css">
  <style>
    body.admin-dashboard {
      background: var(--dark-bg, #0f172a);
      min-height: 100vh;
      color: var(--light-text, #f9fafb);
      font-family: var(--font-body, 'Cinzel', system-ui, sans-serif);
    }

    .admin-main {
      padding: calc(var(--header-height, 96px) + 2rem) 0 2.5rem;
    }

    .admin-main .container {
      max-width: 1200px;
    }

    .admin-page-header {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 2.5rem;
      padding: 1.5rem;
      border-radius: 1rem;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(30, 64, 175, 0.25));
      border: 1px solid rgba(129, 140, 248, 0.35);
      box-shadow: 0 20px 40px rgba(15, 23, 42, 0.45);
    }

    .admin-page-title {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      color: var(--secondary-color, #cbd5ff);
    }

    .admin-page-subtitle {
      margin: 0;
      font-size: 1rem;
      color: var(--medium-text, #cbd5f5);
    }

    .admin-session-chip {
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      background: rgba(30, 64, 175, 0.35);
      border: 1px solid rgba(99, 102, 241, 0.4);
      font-size: 0.875rem;
      color: #e0e7ff;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .admin-dashboard .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .admin-dashboard .dashboard-card {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(129, 140, 248, 0.25);
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.55);
      backdrop-filter: blur(12px);
    }

    .admin-dashboard .dashboard-card h3 {
      color: var(--secondary-color, #cbd5ff);
      margin: 0 0 1rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .admin-dashboard .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: var(--secondary-color, #cbd5ff);
      display: block;
    }

    .admin-dashboard .stat-label {
      color: var(--medium-text, #cbd5f5);
      font-size: 0.9rem;
    }

    .admin-dashboard .status-indicator {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 0.5rem;
    }

    .admin-dashboard .status-connected { background: #4CAF50; }
    .admin-dashboard .status-disconnected { background: #f44336; }

    .admin-dashboard .orders-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }

    .admin-dashboard .orders-table th,
    .admin-dashboard .orders-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid rgba(148, 163, 184, 0.35);
    }

    .admin-dashboard .orders-table th {
      background: rgba(30, 41, 59, 0.75);
      color: var(--secondary-color, #cbd5ff);
    }

    .admin-dashboard .order-status {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .admin-dashboard .status-processed { background: #4CAF50; color: #fff; }
    .admin-dashboard .status-inprogress { background: #FF9800; color: #fff; }
    .admin-dashboard .status-shipped { background: #2196F3; color: #fff; }
    .admin-dashboard .status-cancelled { background: #f44336; color: #fff; }

    .admin-dashboard .error-message {
      background: rgba(220, 38, 38, 0.25);
      border: 1px solid rgba(248, 113, 113, 0.65);
      color: #fecaca;
      padding: 1rem;
      border-radius: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .admin-dashboard .success-message {
      background: rgba(34, 197, 94, 0.2);
      border: 1px solid rgba(74, 222, 128, 0.6);
      color: #bbf7d0;
      padding: 1rem;
      border-radius: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .admin-dashboard .no-data {
      text-align: center;
      color: var(--medium-text, #cbd5f5);
      padding: 2rem;
      font-style: italic;
    }

    .admin-dashboard .product-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .admin-dashboard .product-list li {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(148, 163, 184, 0.25);
    }

    .admin-dashboard .product-list li:last-child {
      border-bottom: none;
    }

    .admin-dashboard .btn-small {
      padding: 0.25rem 0.5rem;
      font-size: 0.8rem;
      border: 1px solid rgba(129, 140, 248, 0.6);
      background: transparent;
      color: #e0e7ff;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s ease, color 0.2s ease;
    }

    .admin-dashboard .btn-small:hover {
      background: rgba(129, 140, 248, 0.25);
      color: #fff;
    }
  </style>
HTML;
?>
<!DOCTYPE html>
<html lang="fr">
<?php include __DIR__ . '/../head-common.php'; ?>
<body class="admin-dashboard">
<?php include __DIR__ . '/../header.php'; ?>

<main id="main" class="admin-main">
  <div class="container">
    <header class="admin-page-header">
      <div>
        <h1 class="admin-page-title">🛡️ Administration Geek&Dragon</h1>
        <p class="admin-page-subtitle">Bienvenue, <?= htmlspecialchars($_SESSION['admin_username']) ?></p>
      </div>
      <span class="admin-session-chip">
        ⏳ Session active — expiration dans <?= max(1, (int) ceil($sessionRemainingSeconds / 60)) ?> min
      </span>
    </header>

    <?php if (isset($error)): ?>
      <div class="error-message"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>

    <?php if (isset($success)): ?>
      <div class="success-message"><?= htmlspecialchars($success) ?></div>
    <?php endif; ?>

    <div class="dashboard-grid">
      <div class="dashboard-card">
        <h3>🔌 Statut API Snipcart</h3>
        <div>
          <span class="status-indicator <?= $apiConnected ? 'status-connected' : 'status-disconnected' ?>"></span>
          <?= $apiConnected ? 'Connecté' : 'Déconnecté' ?>
        </div>
        <?php if (!$apiConnected): ?>
          <p class="admin-page-subtitle" style="margin-top: 0.75rem;">
            Vérifiez la configuration des clés API dans le fichier .env
          </p>
        <?php endif; ?>
      </div>

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
          <p class="admin-page-subtitle">
            <?= isset($salesStats['error']) ? htmlspecialchars($salesStats['error']) : 'API Snipcart non configurée' ?>
          </p>
        </div>
      <?php endif; ?>
    </div>

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

    <div class="dashboard-card">
      <h3>🔧 Informations Système</h3>
      <ul class="product-list">
        <li>
          <span>Session Admin</span>
          <span>Expire dans <?= max(1, (int) ceil($sessionRemainingSeconds / 60)) ?> min</span>
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

<script>
  // Auto-refresh des données toutes les 5 minutes
  setTimeout(() => {
    window.location.reload();
  }, 300000);

  // Confirmation générique pour les actions critiques
  document.querySelectorAll('button[data-confirm]').forEach((button) => {
    button.addEventListener('click', (event) => {
      if (!confirm(button.dataset.confirm || 'Confirmez-vous cette action ?')) {
        event.preventDefault();
      }
    });
  });

  // Affichage du temps de session restant
  const sessionInitialRemaining = <?= (int) $sessionRemainingSeconds ?>;
  const sessionStartEpoch = Math.floor(Date.now() / 1000);
  function updateSessionTimer() {
    const elapsed = Math.floor(Date.now() / 1000) - sessionStartEpoch;
    const remaining = sessionInitialRemaining - elapsed;
    if (remaining <= 0) {
      alert('Session expirée. Vous allez être redirigé vers la page de connexion.');
      window.location.href = 'login.php?timeout=1';
    }
  }

  setInterval(updateSessionTimer, 60000);
</script>
</body>
</html>
