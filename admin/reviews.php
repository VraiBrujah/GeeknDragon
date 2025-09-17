<?php
/**
 * Interface d'administration pour la gestion des avis
 * Permet de valider, rejeter et gérer les avis en attente
 */

// Sécurité basique (à améliorer en production)
session_start();
$admin_password = 'GeeknDragon2024!'; // À changer et stocker de manière sécurisée

if (!isset($_SESSION['admin_logged_in'])) {
    if (isset($_POST['password']) && $_POST['password'] === $admin_password) {
        $_SESSION['admin_logged_in'] = true;
    } else {
        // Afficher le formulaire de connexion
        ?>
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Administration - Gestion des Avis</title>
            <style>
                body { font-family: Arial, sans-serif; background: #1a1a1a; color: #fff; padding: 2rem; }
                .login-form { max-width: 400px; margin: 2rem auto; background: #2a2a2a; padding: 2rem; border-radius: 8px; }
                input[type="password"] { width: 100%; padding: 0.8rem; margin: 1rem 0; border: 1px solid #444; background: #1a1a1a; color: #fff; border-radius: 4px; }
                button { background: #d4af37; color: #1a1a1a; padding: 0.8rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
                button:hover { background: #9a7c0a; }
            </style>
        </head>
        <body>
            <div class="login-form">
                <h2>Connexion Admin</h2>
                <form method="POST">
                    <input type="password" name="password" placeholder="Mot de passe admin" required>
                    <button type="submit">Se connecter</button>
                </form>
            </div>
        </body>
        </html>
        <?php
        exit;
    }
}

// Gestion des actions admin
if (isset($_POST['action'])) {
    $reviews_pending_file = __DIR__ . '/../data/reviews_pending.json';
    $reviews_approved_file = __DIR__ . '/../data/reviews_approved.json';
    
    $pending_reviews = file_exists($reviews_pending_file) ? json_decode(file_get_contents($reviews_pending_file), true) : [];
    $approved_reviews = file_exists($reviews_approved_file) ? json_decode(file_get_contents($reviews_approved_file), true) : [];
    
    switch ($_POST['action']) {
        case 'approve':
            $review_id = $_POST['review_id'];
            foreach ($pending_reviews as $key => $review) {
                if ($review['id'] === $review_id) {
                    $review['approved_at'] = date('Y-m-d H:i:s');
                    $review['approved_by'] = 'admin';
                    $approved_reviews[] = $review;
                    unset($pending_reviews[$key]);
                    break;
                }
            }
            file_put_contents($reviews_pending_file, json_encode(array_values($pending_reviews), JSON_PRETTY_PRINT));
            file_put_contents($reviews_approved_file, json_encode($approved_reviews, JSON_PRETTY_PRINT));
            break;
            
        case 'reject':
            $review_id = $_POST['review_id'];
            foreach ($pending_reviews as $key => $review) {
                if ($review['id'] === $review_id) {
                    unset($pending_reviews[$key]);
                    break;
                }
            }
            file_put_contents($reviews_pending_file, json_encode(array_values($pending_reviews), JSON_PRETTY_PRINT));
            break;
            
        case 'delete_approved':
            $review_id = $_POST['review_id'];
            foreach ($approved_reviews as $key => $review) {
                if ($review['id'] === $review_id) {
                    unset($approved_reviews[$key]);
                    break;
                }
            }
            file_put_contents($reviews_approved_file, json_encode(array_values($approved_reviews), JSON_PRETTY_PRINT));
            break;
    }
    
    header('Location: reviews.php');
    exit;
}

// Charger les avis
$reviews_pending_file = __DIR__ . '/../data/reviews_pending.json';
$reviews_approved_file = __DIR__ . '/../data/reviews_approved.json';

$pending_reviews = file_exists($reviews_pending_file) ? json_decode(file_get_contents($reviews_pending_file), true) : [];
$approved_reviews = file_exists($reviews_approved_file) ? json_decode(file_get_contents($reviews_approved_file), true) : [];

function formatDate($dateString) {
    return date('d/m/Y H:i', strtotime($dateString));
}

function getStars($rating) {
    return str_repeat('★', $rating) . str_repeat('☆', 5 - $rating);
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Administration - Gestion des Avis | Geek&Dragon</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #1a1a1a; color: #fff; line-height: 1.6; }
        .header { background: #2a2a2a; padding: 1rem 2rem; border-bottom: 2px solid #d4af37; }
        .header h1 { color: #d4af37; }
        .nav { margin-top: 0.5rem; }
        .nav a { color: #fff; text-decoration: none; margin-right: 2rem; padding: 0.5rem 1rem; border-radius: 4px; }
        .nav a:hover { background: #444; }
        .nav a.active { background: #d4af37; color: #1a1a1a; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .section { margin-bottom: 3rem; }
        .section h2 { color: #d4af37; margin-bottom: 1rem; border-bottom: 1px solid #444; padding-bottom: 0.5rem; }
        .review-card { background: #2a2a2a; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; border-left: 4px solid #d4af37; }
        .review-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
        .review-meta { font-size: 0.9rem; color: #bbb; }
        .review-meta strong { color: #fff; }
        .review-content { margin: 1rem 0; }
        .review-comment { background: #1a1a1a; padding: 1rem; border-radius: 4px; border-left: 3px solid #444; }
        .review-actions { margin-top: 1rem; }
        .btn { padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; margin-right: 0.5rem; font-weight: bold; }
        .btn-approve { background: #4CAF50; color: white; }
        .btn-reject { background: #f44336; color: white; }
        .btn-delete { background: #ff9800; color: white; }
        .btn:hover { opacity: 0.8; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: #2a2a2a; padding: 1.5rem; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 2rem; font-weight: bold; color: #d4af37; }
        .stat-label { color: #bbb; margin-top: 0.5rem; }
        .product-info { color: #d4af37; font-weight: bold; }
        .rating { color: #d4af37; font-size: 1.2rem; }
        .empty { text-align: center; color: #bbb; padding: 2rem; font-style: italic; }
        .logout { float: right; background: #f44336; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Administration Geek&Dragon</h1>
        <div class="nav">
            <a href="#" class="active">Gestion des Avis</a>
            <a href="../index.php">Retour au site</a>
            <form method="POST" style="display: inline;">
                <input type="hidden" name="action" value="logout">
                <button type="submit" class="logout" onclick="return confirm('Déconnexion?')">Déconnexion</button>
            </form>
        </div>
    </div>

    <div class="container">
        <!-- Statistiques -->
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number"><?= count($pending_reviews) ?></div>
                <div class="stat-label">Avis en attente</div>
            </div>
            <div class="stat-card">
                <div class="stat-number"><?= count($approved_reviews) ?></div>
                <div class="stat-label">Avis approuvés</div>
            </div>
            <div class="stat-card">
                <div class="stat-number"><?= count($pending_reviews) + count($approved_reviews) ?></div>
                <div class="stat-label">Total des avis</div>
            </div>
        </div>

        <!-- Avis en attente -->
        <div class="section">
            <h2>Avis en attente de validation (<?= count($pending_reviews) ?>)</h2>
            
            <?php if (empty($pending_reviews)): ?>
                <div class="empty">Aucun avis en attente de validation</div>
            <?php else: ?>
                <?php foreach ($pending_reviews as $review): ?>
                    <div class="review-card">
                        <div class="review-header">
                            <div>
                                <div class="review-meta">
                                    <strong><?= htmlspecialchars($review['name']) ?></strong> 
                                    (<?= htmlspecialchars($review['email']) ?>)
                                    <br>
                                    <span class="product-info">Produit: <?= htmlspecialchars($review['product_id']) ?></span>
                                    <br>
                                    Soumis le <?= formatDate($review['submitted_at']) ?>
                                    <br>
                                    IP: <?= htmlspecialchars($review['ip_address'] ?? 'unknown') ?>
                                </div>
                            </div>
                            <div class="rating"><?= getStars($review['rating']) ?></div>
                        </div>
                        
                        <div class="review-content">
                            <div class="review-comment">
                                <?= nl2br(htmlspecialchars($review['comment'])) ?>
                            </div>
                        </div>
                        
                        <div class="review-actions">
                            <form method="POST" style="display: inline;">
                                <input type="hidden" name="action" value="approve">
                                <input type="hidden" name="review_id" value="<?= $review['id'] ?>">
                                <button type="submit" class="btn btn-approve">✓ Approuver</button>
                            </form>
                            
                            <form method="POST" style="display: inline;">
                                <input type="hidden" name="action" value="reject">
                                <input type="hidden" name="review_id" value="<?= $review['id'] ?>">
                                <button type="submit" class="btn btn-reject" onclick="return confirm('Rejeter cet avis définitivement?')">✗ Rejeter</button>
                            </form>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>

        <!-- Avis approuvés -->
        <div class="section">
            <h2>Avis approuvés (<?= count($approved_reviews) ?>)</h2>
            
            <?php if (empty($approved_reviews)): ?>
                <div class="empty">Aucun avis approuvé pour le moment</div>
            <?php else: ?>
                <?php foreach (array_reverse($approved_reviews) as $review): ?>
                    <div class="review-card">
                        <div class="review-header">
                            <div>
                                <div class="review-meta">
                                    <strong><?= htmlspecialchars($review['name']) ?></strong>
                                    <br>
                                    <span class="product-info">Produit: <?= htmlspecialchars($review['product_id']) ?></span>
                                    <br>
                                    Approuvé le <?= formatDate($review['approved_at'] ?? $review['submitted_at']) ?>
                                </div>
                            </div>
                            <div class="rating"><?= getStars($review['rating']) ?></div>
                        </div>
                        
                        <div class="review-content">
                            <div class="review-comment">
                                <?= nl2br(htmlspecialchars($review['comment'])) ?>
                            </div>
                        </div>
                        
                        <div class="review-actions">
                            <form method="POST" style="display: inline;">
                                <input type="hidden" name="action" value="delete_approved">
                                <input type="hidden" name="review_id" value="<?= $review['id'] ?>">
                                <button type="submit" class="btn btn-delete" onclick="return confirm('Supprimer cet avis approuvé?')">🗑 Supprimer</button>
                            </form>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>

<?php
// Gestion de la déconnexion
if (isset($_POST['action']) && $_POST['action'] === 'logout') {
    session_destroy();
    header('Location: reviews.php');
    exit;
}
?>