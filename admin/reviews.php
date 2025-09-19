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

$title = 'Gestion des avis - Administration Geek&Dragon';
$metaDescription = 'Validation, publication et suivi des témoignages clients Geek&Dragon.';
$active = 'reviews';
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
        'action' => '/admin/reviews.php',
        'hidden' => [
            'action' => 'logout',
        ],
        'confirm' => 'Déconnexion ?',
        'class' => 'bg-red-500/30 hover:bg-red-500/40 border border-red-400/60',
    ],
];
$showLangSwitcher = false;
$showAccountControls = false;
$showCartControls = false;
$showSnipcartWarning = false;

$extraHead = <<<HTML
  <link rel="stylesheet" href="/css/style.css">
  <style>
    body.admin-reviews {
      background: var(--dark-bg, #0f172a);
      color: var(--light-text, #f9fafb);
      min-height: 100vh;
      font-family: var(--font-body, 'Cinzel', system-ui, sans-serif);
    }

    .admin-main {
      padding: calc(var(--header-height, 96px) + 2rem) 0 2.5rem;
    }

    .admin-main .container {
      max-width: 1100px;
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
      background: linear-gradient(135deg, rgba(180, 83, 9, 0.18), rgba(124, 45, 18, 0.3));
      border: 1px solid rgba(217, 119, 6, 0.4);
      box-shadow: 0 18px 36px rgba(15, 23, 42, 0.45);
    }

    .admin-page-title {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      color: #fbbf24;
    }

    .admin-page-subtitle {
      margin: 0;
      font-size: 1rem;
      color: rgba(252, 211, 77, 0.85);
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2.5rem;
    }

    .stat-card {
      background: rgba(30, 41, 59, 0.8);
      border-radius: 1rem;
      padding: 1.5rem;
      text-align: center;
      border: 1px solid rgba(217, 119, 6, 0.35);
      box-shadow: 0 12px 28px rgba(15, 23, 42, 0.5);
    }

    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: #fbbf24;
    }

    .stat-label {
      color: rgba(252, 211, 77, 0.75);
      margin-top: 0.5rem;
    }

    .section {
      margin-bottom: 3rem;
    }

    .section h2 {
      color: #fbbf24;
      margin-bottom: 1rem;
      border-bottom: 1px solid rgba(148, 163, 184, 0.35);
      padding-bottom: 0.5rem;
      font-size: 1.2rem;
      letter-spacing: 0.03em;
    }

    .review-card {
      background: rgba(30, 41, 59, 0.85);
      border-radius: 1rem;
      padding: 1.5rem;
      margin-bottom: 1.25rem;
      border-left: 4px solid #fbbf24;
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.45);
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      gap: 1rem;
    }

    .review-meta {
      font-size: 0.9rem;
      color: rgba(226, 232, 240, 0.8);
    }

    .review-meta strong {
      color: #fff;
    }

    .product-info {
      color: #fbbf24;
      font-weight: 600;
    }

    .review-comment {
      background: rgba(15, 23, 42, 0.75);
      padding: 1rem;
      border-radius: 0.75rem;
      border-left: 3px solid rgba(148, 163, 184, 0.4);
    }

    .review-actions {
      margin-top: 1rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.65rem;
      cursor: pointer;
      font-weight: 600;
      letter-spacing: 0.02em;
      transition: transform 0.2s ease, opacity 0.2s ease;
    }

    .btn:hover {
      opacity: 0.85;
      transform: translateY(-1px);
    }

    .btn-approve { background: rgba(34, 197, 94, 0.85); color: #f0fff4; }
    .btn-reject { background: rgba(239, 68, 68, 0.85); color: #fee2e2; }
    .btn-delete { background: rgba(249, 115, 22, 0.85); color: #fff7ed; }

    .rating { color: #fbbf24; font-size: 1.2rem; }

    .empty {
      text-align: center;
      color: rgba(226, 232, 240, 0.75);
      padding: 2rem;
      font-style: italic;
      background: rgba(30, 41, 59, 0.6);
      border-radius: 1rem;
    }
  </style>
HTML;
?>
<!DOCTYPE html>
<html lang="fr">
<?php include __DIR__ . '/../head-common.php'; ?>
<body class="admin-dashboard admin-reviews">
<?php include __DIR__ . '/../header.php'; ?>

<main id="main" class="admin-main">
  <div class="container">
    <header class="admin-page-header">
      <div>
        <h1 class="admin-page-title">⭐ Gestion des Avis</h1>
        <p class="admin-page-subtitle">Bienvenue, <?= htmlspecialchars($_SESSION['admin_username'] ?? 'admin') ?></p>
      </div>
    </header>

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
                  (<?= htmlspecialchars($review['email']) ?>)<br>
                  <span class="product-info">Produit: <?= htmlspecialchars($review['product_id']) ?></span><br>
                  Soumis le <?= formatDate($review['submitted_at']) ?><br>
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
              <form method="POST">
                <input type="hidden" name="action" value="approve">
                <input type="hidden" name="review_id" value="<?= htmlspecialchars($review['id']) ?>">
                <button type="submit" class="btn btn-approve">✓ Approuver</button>
              </form>

              <form method="POST">
                <input type="hidden" name="action" value="reject">
                <input type="hidden" name="review_id" value="<?= htmlspecialchars($review['id']) ?>">
                <button type="submit" class="btn btn-reject" data-confirm="Rejeter cet avis définitivement ?">✗ Rejeter</button>
              </form>
            </div>
          </div>
        <?php endforeach; ?>
      <?php endif; ?>
    </div>

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
                  <strong><?= htmlspecialchars($review['name']) ?></strong><br>
                  <span class="product-info">Produit: <?= htmlspecialchars($review['product_id']) ?></span><br>
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
              <form method="POST">
                <input type="hidden" name="action" value="delete_approved">
                <input type="hidden" name="review_id" value="<?= htmlspecialchars($review['id']) ?>">
                <button type="submit" class="btn btn-delete" data-confirm="Supprimer cet avis approuvé ?">🗑 Supprimer</button>
              </form>
            </div>
          </div>
        <?php endforeach; ?>
      <?php endif; ?>
    </div>
  </div>
</main>

<script>
  document.querySelectorAll('button[data-confirm]').forEach((button) => {
    button.addEventListener('click', (event) => {
      if (!confirm(button.dataset.confirm || 'Confirmez-vous cette action ?')) {
        event.preventDefault();
      }
    });
  });
</script>
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
