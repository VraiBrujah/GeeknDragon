<?php
/**
 * Interface d'administration pour la gestion des avis
 * Permet de valider, rejeter et gérer les avis en attente
 */

session_start();

if (isset($_POST['action']) && $_POST['action'] === 'logout') {
    session_destroy();
    header('Location: reviews.php');
    exit;
}

$adminPassword = 'GeeknDragon2024!'; // À externaliser en production
$loggedIn = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
$loginError = '';

if (!$loggedIn) {
    if (isset($_POST['password'])) {
        $submittedPassword = (string) $_POST['password'];
        if (hash_equals($adminPassword, $submittedPassword)) {
            $_SESSION['admin_logged_in'] = true;
            $loggedIn = true;

            if (!isset($_SESSION['admin_username'])) {
                $_SESSION['admin_username'] = 'Administrateur';
            }
        } else {
            $loginError = 'Mot de passe incorrect.';
        }
    }

    if (!$loggedIn) {
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
                .login-error { margin-bottom: 1rem; padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(244, 67, 54, 0.6); background: rgba(244, 67, 54, 0.15); color: #f28b82; text-align: center; font-weight: 600; }
            </style>
        </head>
        <body>
            <div class="login-form">
                <h2>Connexion Admin</h2>
                <?php if ($loginError !== ''): ?>
                    <div class="login-error"><?= htmlspecialchars($loginError, ENT_QUOTES, 'UTF-8'); ?></div>
                <?php endif; ?>
                <form method="POST">
                    <input type="password" name="password" placeholder="Mot de passe admin" required autocomplete="current-password">
                    <button type="submit">Se connecter</button>
                </form>
            </div>
        </body>
        </html>
        <?php
        exit;
    }
}

if (!isset($_SESSION['admin_username'])) {
    $_SESSION['admin_username'] = 'Administrateur';
}

// Gestion des actions admin
$reviewsPendingFile = __DIR__ . '/../data/reviews_pending.json';
$reviewsApprovedFile = __DIR__ . '/../data/reviews_approved.json';

/**
 * Charge un fichier d'avis JSON et garantit un tableau en sortie.
 */
$loadReviews = static function (string $filePath): array {
    if (!file_exists($filePath)) {
        return [];
    }

    $decoded = json_decode((string) file_get_contents($filePath), true);

    return is_array($decoded) ? $decoded : [];
};

if (isset($_POST['action']) && in_array($_POST['action'], ['approve', 'reject', 'delete_approved'], true)) {
    $pendingReviews = $loadReviews($reviewsPendingFile);
    $approvedReviews = $loadReviews($reviewsApprovedFile);

    switch ($_POST['action']) {
        case 'approve':
            $reviewId = (string) ($_POST['review_id'] ?? '');
            foreach ($pendingReviews as $key => $review) {
                if (($review['id'] ?? '') === $reviewId) {
                    $review['approved_at'] = date('Y-m-d H:i:s');
                    $review['approved_by'] = 'admin';
                    $approvedReviews[] = $review;
                    unset($pendingReviews[$key]);
                    break;
                }
            }
            file_put_contents($reviewsPendingFile, json_encode(array_values($pendingReviews), JSON_PRETTY_PRINT));
            file_put_contents($reviewsApprovedFile, json_encode($approvedReviews, JSON_PRETTY_PRINT));
            break;

        case 'reject':
            $reviewId = (string) ($_POST['review_id'] ?? '');
            foreach ($pendingReviews as $key => $review) {
                if (($review['id'] ?? '') === $reviewId) {
                    unset($pendingReviews[$key]);
                    break;
                }
            }
            file_put_contents($reviewsPendingFile, json_encode(array_values($pendingReviews), JSON_PRETTY_PRINT));
            break;

        case 'delete_approved':
            $reviewId = (string) ($_POST['review_id'] ?? '');
            foreach ($approvedReviews as $key => $review) {
                if (($review['id'] ?? '') === $reviewId) {
                    unset($approvedReviews[$key]);
                    break;
                }
            }
            file_put_contents($reviewsApprovedFile, json_encode(array_values($approvedReviews), JSON_PRETTY_PRINT));
            break;
    }

    header('Location: reviews.php');
    exit;
}

$pending_reviews = $loadReviews($reviewsPendingFile);
$approved_reviews = $loadReviews($reviewsApprovedFile);

if (!function_exists('gdAdminFormatReviewDate')) {
    /**
     * Formate une date d'avis pour l'affichage administrateur.
     */
    function gdAdminFormatReviewDate(string $dateString): string
    {
        $timestamp = strtotime($dateString);

        if ($timestamp === false) {
            return $dateString;
        }

        return date('d/m/Y H:i', $timestamp);
    }
}

if (!function_exists('gdAdminRenderStars')) {
    /**
     * Génère la représentation textuelle d'une note sous forme d'étoiles.
     *
     * @param mixed $rating Note brute à normaliser.
     */
    function gdAdminRenderStars($rating): string
    {
        $value = max(0, min(5, (int) $rating));

        return str_repeat('★', $value) . str_repeat('☆', 5 - $value);
    }
}

$translator = require __DIR__ . '/../i18n.php';
$lang = $translator->getCurrentLanguage();

$title = 'Gestion des avis - Administration Geek&Dragon';
$active = 'admin-reviews';
$navItems = [
    '/admin/dashboard.php' => [
        'href' => '/admin/dashboard.php',
        'use_lang' => false,
        'slug' => 'admin-dashboard',
        'label' => 'Tableau de bord',
        'icon' => '📊',
    ],
    '/admin/reviews.php' => [
        'href' => '/admin/reviews.php',
        'use_lang' => false,
        'slug' => 'admin-reviews',
        'label' => 'Avis clients',
        'icon' => '⭐',
    ],
];

$adminUsername = $_SESSION['admin_username'] ?? 'Administrateur';

/**
 * Construit le bloc d'actions du bandeau partagé pour la zone admin.
 */
$buildAdminHeaderActions = static function (string $context) use ($adminUsername): string {
    $isMobile = $context === 'mobile';
    $welcomeClass = $isMobile ? 'admin-header-welcome admin-header-welcome--mobile' : 'admin-header-welcome';
    $backClass = $isMobile ? 'admin-header-back admin-header-back--mobile' : 'admin-header-back';
    $formClass = $isMobile ? 'admin-header-logout-form admin-header-logout-form--mobile' : 'admin-header-logout-form';
    $buttonClass = $isMobile ? 'admin-header-logout admin-header-logout--mobile' : 'admin-header-logout';

    ob_start();
    ?>
    <span class="<?= htmlspecialchars($welcomeClass, ENT_QUOTES, 'UTF-8'); ?>">
        <span aria-hidden="true">🛡️</span>
        <span>Bienvenue, <strong><?= htmlspecialchars($adminUsername, ENT_QUOTES, 'UTF-8'); ?></strong></span>
    </span>
    <a href="/index.php" class="<?= htmlspecialchars($backClass, ENT_QUOTES, 'UTF-8'); ?>">Retour au site</a>
    <form method="POST" class="<?= htmlspecialchars($formClass, ENT_QUOTES, 'UTF-8'); ?> js-confirm-form" data-message="Confirmez-vous la déconnexion ?">
        <input type="hidden" name="action" value="logout">
        <button type="submit" class="<?= htmlspecialchars($buttonClass, ENT_QUOTES, 'UTF-8'); ?>">
            Déconnexion
        </button>
    </form>
    <?php

    return (string) ob_get_clean();
};

$headerActions = static fn (): string => $buildAdminHeaderActions('desktop');
$headerActionsMobile = static fn (): string => $buildAdminHeaderActions('mobile');
?>

<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang, ENT_QUOTES, 'UTF-8'); ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8'); ?></title>
    <link rel="stylesheet" href="/css/styles.css">
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
<?php include __DIR__ . '/../header.php'; ?>

    <div class="admin-dashboard">
        <main id="main" class="admin-main">
            <div class="container admin-reviews">
                <header class="admin-page-header">
                    <h1 class="admin-page-title">Gestion des avis clients</h1>
                    <p class="admin-page-subtitle">Modérez et publiez les retours envoyés par la communauté Geek&amp;Dragon.</p>
                </header>

                <section class="admin-section" aria-labelledby="admin-reviews-overview">
                    <h2 id="admin-reviews-overview" class="admin-section-title">
                        Synthèse des avis
                    </h2>
                    <div class="dashboard-grid">
                        <div class="dashboard-card">
                            <span class="stat-number"><?= count($pending_reviews); ?></span>
                            <span class="stat-label">Avis en attente</span>
                        </div>
                        <div class="dashboard-card">
                            <span class="stat-number"><?= count($approved_reviews); ?></span>
                            <span class="stat-label">Avis approuvés</span>
                        </div>
                        <div class="dashboard-card">
                            <span class="stat-number"><?= count($pending_reviews) + count($approved_reviews); ?></span>
                            <span class="stat-label">Total des avis</span>
                        </div>
                    </div>
                </section>

                <section class="admin-section" aria-labelledby="admin-reviews-pending">
                    <h2 id="admin-reviews-pending" class="admin-section-title">
                        Avis en attente
                        <span class="admin-section-count">(<?= count($pending_reviews); ?>)</span>
                    </h2>

                    <?php if ($pending_reviews === []): ?>
                        <p class="admin-empty-state">Aucun avis en attente de validation.</p>
                    <?php else: ?>
                        <div class="admin-reviews-list">
                            <?php foreach ($pending_reviews as $review): ?>
                                <article class="admin-review-card">
                                    <div class="admin-review-header">
                                        <div class="admin-review-author">
                                            <span class="admin-review-name"><?= htmlspecialchars($review['name'] ?? 'Auteur inconnu', ENT_QUOTES, 'UTF-8'); ?></span>
                                            <span class="admin-review-email"><?= htmlspecialchars($review['email'] ?? 'Adresse inconnue', ENT_QUOTES, 'UTF-8'); ?></span>
                                            <span class="admin-review-product">Produit : <?= htmlspecialchars($review['product_id'] ?? 'Non spécifié', ENT_QUOTES, 'UTF-8'); ?></span>
                                            <span class="admin-review-date">Soumis le <?= htmlspecialchars(gdAdminFormatReviewDate((string) ($review['submitted_at'] ?? '')), ENT_QUOTES, 'UTF-8'); ?></span>
                                            <span class="admin-review-ip">IP : <?= htmlspecialchars($review['ip_address'] ?? 'Inconnue', ENT_QUOTES, 'UTF-8'); ?></span>
                                        </div>
                                        <span class="admin-review-rating" aria-label="Note de <?= (int) ($review['rating'] ?? 0); ?> sur 5">
                                            <?= gdAdminRenderStars($review['rating'] ?? 0); ?>
                                        </span>
                                    </div>

                                    <div class="admin-review-comment">
                                        <?= nl2br(htmlspecialchars($review['comment'] ?? '', ENT_QUOTES, 'UTF-8')); ?>
                                    </div>

                                    <div class="admin-review-actions">
                                        <form method="POST" class="admin-review-form">
                                            <input type="hidden" name="action" value="approve">
                                            <input type="hidden" name="review_id" value="<?= htmlspecialchars($review['id'] ?? '', ENT_QUOTES, 'UTF-8'); ?>">
                                            <button type="submit" class="admin-review-btn admin-review-btn--approve">
                                                <span aria-hidden="true">✓</span>
                                                <span>Approuver</span>
                                            </button>
                                        </form>

                                        <form method="POST" class="admin-review-form js-confirm-form" data-message="Rejeter définitivement cet avis ?">
                                            <input type="hidden" name="action" value="reject">
                                            <input type="hidden" name="review_id" value="<?= htmlspecialchars($review['id'] ?? '', ENT_QUOTES, 'UTF-8'); ?>">
                                            <button type="submit" class="admin-review-btn admin-review-btn--reject">
                                                <span aria-hidden="true">✗</span>
                                                <span>Rejeter</span>
                                            </button>
                                        </form>
                                    </div>
                                </article>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </section>

                <section class="admin-section" aria-labelledby="admin-reviews-approved">
                    <h2 id="admin-reviews-approved" class="admin-section-title">
                        Avis approuvés
                        <span class="admin-section-count">(<?= count($approved_reviews); ?>)</span>
                    </h2>

                    <?php if ($approved_reviews === []): ?>
                        <p class="admin-empty-state">Aucun avis approuvé pour le moment.</p>
                    <?php else: ?>
                        <div class="admin-reviews-list">
                            <?php foreach (array_reverse($approved_reviews) as $review): ?>
                                <article class="admin-review-card">
                                    <div class="admin-review-header">
                                        <div class="admin-review-author">
                                            <span class="admin-review-name"><?= htmlspecialchars($review['name'] ?? 'Auteur inconnu', ENT_QUOTES, 'UTF-8'); ?></span>
                                            <span class="admin-review-product">Produit : <?= htmlspecialchars($review['product_id'] ?? 'Non spécifié', ENT_QUOTES, 'UTF-8'); ?></span>
                                            <span class="admin-review-date">Approuvé le <?= htmlspecialchars(gdAdminFormatReviewDate((string) ($review['approved_at'] ?? $review['submitted_at'] ?? '')), ENT_QUOTES, 'UTF-8'); ?></span>
                                        </div>
                                        <span class="admin-review-rating" aria-label="Note de <?= (int) ($review['rating'] ?? 0); ?> sur 5">
                                            <?= gdAdminRenderStars($review['rating'] ?? 0); ?>
                                        </span>
                                    </div>

                                    <div class="admin-review-comment">
                                        <?= nl2br(htmlspecialchars($review['comment'] ?? '', ENT_QUOTES, 'UTF-8')); ?>
                                    </div>

                                    <div class="admin-review-actions">
                                        <form method="POST" class="admin-review-form js-confirm-form" data-message="Supprimer cet avis approuvé ?">
                                            <input type="hidden" name="action" value="delete_approved">
                                            <input type="hidden" name="review_id" value="<?= htmlspecialchars($review['id'] ?? '', ENT_QUOTES, 'UTF-8'); ?>">
                                            <button type="submit" class="admin-review-btn admin-review-btn--delete">
                                                <span aria-hidden="true">🗑</span>
                                                <span>Supprimer</span>
                                            </button>
                                        </form>
                                    </div>
                                </article>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </section>
            </div>
        </main>
    </div>

    <script>
        document.querySelectorAll('.js-confirm-form').forEach((form) => {
            form.addEventListener('submit', (event) => {
                const message = form.getAttribute('data-message') || 'Confirmez-vous cette action ?';

                if (!confirm(message)) {
                    event.preventDefault();
                }
            });
        });
    </script>
</body>
</html>