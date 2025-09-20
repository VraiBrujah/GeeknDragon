<?php
/**
 * Administration du cache - Geek & Dragon
 * Interface simple pour gérer le cache
 */

require_once __DIR__ . '/CacheHelper.php';

// Authentification simple (à améliorer en production)
$adminKey = $_GET['key'] ?? '';
$expectedKey = hash('sha256', 'geekndragon_cache_admin_2024');

if ($adminKey !== $expectedKey) {
    http_response_code(403);
    die('Accès refusé. Clé d\'administration requise.');
}

// Actions
$action = $_GET['action'] ?? 'stats';

switch ($action) {
    case 'cleanup':
        $cleaned = CacheHelper::cleanup();
        $message = "✅ Nettoyage terminé. $cleaned entrées supprimées.";
        break;
        
    case 'clear_products':
        CacheHelper::invalidateProducts();
        $message = "✅ Cache des produits vidé.";
        break;
        
    case 'clear_stock':
        CacheHelper::invalidateStock();
        $message = "✅ Cache du stock vidé.";
        break;
        
    case 'clear_all':
        CacheHelper::getInstance()->clear();
        $message = "✅ Tout le cache a été vidé.";
        break;
        
    default:
        $message = '';
}

$stats = CacheHelper::getStats();
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Administration Cache - Geek & Dragon</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 2rem; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1rem 0; }
        .stat-card { padding: 1rem; background: #f8f9fa; border-radius: 6px; text-align: center; }
        .stat-value { font-size: 2rem; font-weight: bold; color: #495057; }
        .stat-label { color: #6c757d; font-size: 0.9rem; }
        .actions { display: flex; gap: 1rem; margin: 2rem 0; flex-wrap: wrap; }
        .btn { padding: 0.75rem 1.5rem; border: none; border-radius: 6px; cursor: pointer; text-decoration: none; font-weight: 500; transition: all 0.2s; }
        .btn-primary { background: #007bff; color: white; }
        .btn-warning { background: #ffc107; color: #212529; }
        .btn-danger { background: #dc3545; color: white; }
        .btn:hover { transform: translateY(-1px); box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
        .message { padding: 1rem; margin: 1rem 0; border-radius: 6px; background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .code { background: #f8f9fa; padding: 0.5rem; border-radius: 4px; font-family: 'Courier New', monospace; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🗄️ Administration du Cache</h1>
        <p>Interface d'administration pour le système de cache de Geek & Dragon.</p>
        
        <?php if ($message): ?>
            <div class="message"><?= htmlspecialchars($message) ?></div>
        <?php endif; ?>
        
        <h2>📊 Statistiques</h2>
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value"><?= $stats['total_files'] ?></div>
                <div class="stat-label">Fichiers total</div>
            </div>
            <div class="stat-card">
                <div class="stat-value"><?= $stats['valid_files'] ?></div>
                <div class="stat-label">Fichiers valides</div>
            </div>
            <div class="stat-card">
                <div class="stat-value"><?= $stats['expired_files'] ?></div>
                <div class="stat-label">Fichiers expirés</div>
            </div>
            <div class="stat-card">
                <div class="stat-value"><?= $stats['size_mb'] ?> MB</div>
                <div class="stat-label">Taille totale</div>
            </div>
        </div>
        
        <h2>⚡ Actions</h2>
        <div class="actions">
            <a href="?key=<?= $adminKey ?>&action=cleanup" class="btn btn-primary">
                🧹 Nettoyer les expirés
            </a>
            <a href="?key=<?= $adminKey ?>&action=clear_products" class="btn btn-warning">
                📦 Vider cache produits
            </a>
            <a href="?key=<?= $adminKey ?>&action=clear_stock" class="btn btn-warning">
                📊 Vider cache stock
            </a>
            <a href="?key=<?= $adminKey ?>&action=clear_all" class="btn btn-danger" onclick="return confirm('Êtes-vous sûr de vouloir vider tout le cache ?')">
                🗑️ Vider tout le cache
            </a>
        </div>
        
        <h2>🔧 Utilisation</h2>
        <p>Pour accéder à cette interface, utilisez l'URL :</p>
        <div class="code">
            /cache/admin.php?key=<?= $expectedKey ?>
        </div>
        
        <h2>📝 APIs de Cache</h2>
        <p>Exemples d'utilisation dans le code :</p>
        <div class="code">
// Cache simple<br>
CacheHelper::remember('ma_cle', function() {<br>
&nbsp;&nbsp;&nbsp;&nbsp;return $donneesLourdes;<br>
}, 3600);<br><br>

// Cache conditionnel<br>
$data = CacheHelper::conditionalCache('produits', $callback);<br><br>

// Invalidation<br>
CacheHelper::invalidateProducts();
        </div>
        
        <div style="margin-top: 2rem; text-align: center; color: #6c757d; font-size: 0.9rem;">
            Geek & Dragon - Système de Cache v1.0
        </div>
    </div>
</body>
</html>