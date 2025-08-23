<?php
declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

use GeeknDragon\Reviews\ReviewManager;

// Vérification d'authentification admin (simplifiée)
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    // Rediriger vers login admin ou afficher erreur
    http_response_code(401);
    die('Accès non autorisé - Connexion admin requise');
}

$reviewManager = new ReviewManager();
$action = $_GET['action'] ?? 'list';
$message = '';
$messageType = 'info';

// Traitement des actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $reviewId = $_POST['review_id'] ?? '';
    $moderatorData = [
        'moderator_id' => $_SESSION['admin_user_id'] ?? 'admin',
        'notes' => $_POST['moderator_notes'] ?? '',
        'notify_user' => isset($_POST['notify_user'])
    ];
    
    switch ($_POST['action']) {
        case 'approve':
            $result = $reviewManager->approveReview($reviewId, $moderatorData);
            $message = $result['success'] ? 'Review approuvée avec succès' : $result['error'];
            $messageType = $result['success'] ? 'success' : 'error';
            break;
            
        case 'reject':
            $moderatorData['reason'] = $_POST['rejection_reason'] ?? 'Non spécifié';
            $result = $reviewManager->rejectReview($reviewId, $moderatorData);
            $message = $result['success'] ? 'Review rejetée' : $result['error'];
            $messageType = $result['success'] ? 'success' : 'error';
            break;
    }
    
    // Redirection pour éviter resubmission
    header('Location: reviews-moderation.php?message=' . urlencode($message) . '&type=' . $messageType);
    exit;
}

// Affichage du message si présent
if (isset($_GET['message'])) {
    $message = $_GET['message'];
    $messageType = $_GET['type'] ?? 'info';
}

// Récupération des données pour affichage
$filters = [
    'status' => $_GET['status'] ?? 'pending',
    'limit' => 20,
    'offset' => ((int)($_GET['page'] ?? 1) - 1) * 20
];

$moderationData = $reviewManager->getModerationQueue($filters);
$statistics = $reviewManager->getReviewStatistics();
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modération des Reviews - GeeknDragon Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        .review-card { transition: all 0.3s ease; }
        .review-card:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
        .sentiment-positive { background: linear-gradient(90deg, #10b981, #34d399); }
        .sentiment-negative { background: linear-gradient(90deg, #ef4444, #f87171); }
        .sentiment-neutral { background: linear-gradient(90deg, #6b7280, #9ca3af); }
    </style>
</head>
<body class="bg-gray-50">

    <!-- Header Admin -->
    <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <i class="fas fa-shield-alt text-purple-600 text-2xl"></i>
                    <h1 class="text-2xl font-bold text-gray-800">Modération des Reviews</h1>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="text-sm text-gray-600">Admin: <?= htmlspecialchars($_SESSION['admin_username'] ?? 'Admin') ?></span>
                    <a href="/admin/dashboard.php" class="text-purple-600 hover:text-purple-800">
                        <i class="fas fa-tachometer-alt mr-1"></i> Dashboard
                    </a>
                </div>
            </div>
        </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 py-8">
        
        <!-- Messages -->
        <?php if ($message): ?>
        <div class="mb-6 p-4 rounded-lg <?= $messageType === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : ($messageType === 'error' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-blue-100 text-blue-800 border border-blue-200') ?>">
            <i class="fas <?= $messageType === 'success' ? 'fa-check-circle' : ($messageType === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle') ?> mr-2"></i>
            <?= htmlspecialchars($message) ?>
        </div>
        <?php endif; ?>

        <!-- Statistiques rapides -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
                        <i class="fas fa-clock text-xl"></i>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm text-gray-600">En attente</p>
                        <p class="text-2xl font-semibold text-gray-900">
                            <?= $statistics['reviews_by_status']['pending'] ?? 0 ?>
                        </p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="p-3 rounded-full bg-red-100 text-red-600">
                        <i class="fas fa-flag text-xl"></i>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm text-gray-600">Signalées</p>
                        <p class="text-2xl font-semibold text-gray-900">
                            <?= $statistics['reviews_by_status']['flagged'] ?? 0 ?>
                        </p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="p-3 rounded-full bg-green-100 text-green-600">
                        <i class="fas fa-check-circle text-xl"></i>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm text-gray-600">Approuvées</p>
                        <p class="text-2xl font-semibold text-gray-900">
                            <?= $statistics['reviews_by_status']['approved'] ?? 0 ?>
                        </p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="p-3 rounded-full bg-blue-100 text-blue-600">
                        <i class="fas fa-star text-xl"></i>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm text-gray-600">Note moyenne</p>
                        <p class="text-2xl font-semibold text-gray-900">
                            <?= number_format($statistics['average_rating'], 1) ?>/5
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filtres -->
        <div class="bg-white rounded-lg shadow mb-6 p-6">
            <div class="flex flex-wrap items-center gap-4">
                <h3 class="text-lg font-semibold text-gray-800">Filtres</h3>
                
                <div class="flex space-x-2">
                    <a href="?status=pending" 
                       class="px-4 py-2 rounded-lg text-sm font-medium transition-colors <?= $filters['status'] === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200' ?>">
                        En attente
                    </a>
                    <a href="?status=flagged" 
                       class="px-4 py-2 rounded-lg text-sm font-medium transition-colors <?= $filters['status'] === 'flagged' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200' ?>">
                        Signalées
                    </a>
                    <a href="?status=approved" 
                       class="px-4 py-2 rounded-lg text-sm font-medium transition-colors <?= $filters['status'] === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200' ?>">
                        Approuvées
                    </a>
                    <a href="?status=rejected" 
                       class="px-4 py-2 rounded-lg text-sm font-medium transition-colors <?= $filters['status'] === 'rejected' ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200' ?>">
                        Rejetées
                    </a>
                </div>

                <div class="ml-auto">
                    <span class="text-sm text-gray-600">
                        <?= $moderationData['total_count'] ?> review(s) • 
                        Page <?= $moderationData['pagination']['current_page'] ?> sur <?= $moderationData['pagination']['total_pages'] ?>
                    </span>
                </div>
            </div>
        </div>

        <!-- Liste des reviews -->
        <div class="space-y-6">
            <?php foreach ($moderationData['reviews'] as $review): ?>
            <div class="review-card bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div class="p-6">
                    <!-- Header de la review -->
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex items-center space-x-4">
                            <div class="flex items-center space-x-2">
                                <!-- Status Badge -->
                                <?php
                                $statusColors = [
                                    'pending' => 'bg-yellow-100 text-yellow-800',
                                    'flagged' => 'bg-red-100 text-red-800',
                                    'approved' => 'bg-green-100 text-green-800',
                                    'rejected' => 'bg-gray-100 text-gray-800'
                                ];
                                $statusIcons = [
                                    'pending' => 'fa-clock',
                                    'flagged' => 'fa-flag',
                                    'approved' => 'fa-check-circle',
                                    'rejected' => 'fa-times-circle'
                                ];
                                ?>
                                <span class="px-3 py-1 rounded-full text-sm font-medium <?= $statusColors[$review['status']] ?>">
                                    <i class="fas <?= $statusIcons[$review['status']] ?> mr-1"></i>
                                    <?= ucfirst($review['status']) ?>
                                </span>

                                <!-- Priorité -->
                                <?php if ($review['moderation_priority'] === 'high'): ?>
                                <span class="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                                    <i class="fas fa-exclamation mr-1"></i>
                                    Priorité élevée
                                </span>
                                <?php endif; ?>
                            </div>
                        </div>

                        <div class="text-sm text-gray-500">
                            ID: <?= htmlspecialchars(substr($review['review_id'], -8)) ?> • 
                            <?= date('d/m/Y H:i', $review['submitted_at']) ?>
                        </div>
                    </div>

                    <!-- Informations produit et auteur -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p class="text-sm font-medium text-gray-900">Produit</p>
                            <p class="text-sm text-gray-600"><?= htmlspecialchars($review['product_id']) ?></p>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900">Auteur</p>
                            <p class="text-sm text-gray-600">
                                <?= htmlspecialchars($review['author_name']) ?>
                                <?php if ($review['is_verified']): ?>
                                <i class="fas fa-check-circle text-green-500 ml-1" title="Acheteur vérifié"></i>
                                <?php endif; ?>
                            </p>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900">Note</p>
                            <div class="flex items-center">
                                <?php if (isset($review['rating'])): ?>
                                    <?php for ($i = 1; $i <= 5; $i++): ?>
                                        <i class="fas fa-star <?= $i <= $review['rating'] ? 'text-yellow-400' : 'text-gray-300' ?>"></i>
                                    <?php endfor; ?>
                                    <span class="ml-2 text-sm text-gray-600"><?= $review['rating'] ?>/5</span>
                                <?php else: ?>
                                    <span class="text-sm text-gray-400">Pas de note</span>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>

                    <!-- Contenu de la review -->
                    <div class="mb-4">
                        <p class="text-gray-800 leading-relaxed">
                            <?= nl2br(htmlspecialchars($review['content'])) ?>
                        </p>
                    </div>

                    <!-- Analyse de sentiment -->
                    <?php if (isset($review['sentiment_summary'])): ?>
                    <div class="mb-4 p-3 rounded-lg sentiment-<?= $review['sentiment_summary']['sentiment'] ?> text-white">
                        <div class="flex items-center justify-between">
                            <span class="font-medium">
                                <i class="fas fa-brain mr-2"></i>
                                Sentiment: <?= ucfirst($review['sentiment_summary']['sentiment']) ?>
                            </span>
                            <span class="text-sm opacity-90">
                                Confiance: <?= round($review['sentiment_summary']['confidence'] * 100) ?>%
                            </span>
                        </div>
                    </div>
                    <?php endif; ?>

                    <!-- Flags automatiques -->
                    <?php if (!empty($review['auto_flags'])): ?>
                    <div class="mb-4">
                        <p class="text-sm font-medium text-gray-700 mb-2">Signalements automatiques:</p>
                        <div class="flex flex-wrap gap-2">
                            <?php foreach ($review['auto_flags'] as $flag): ?>
                            <span class="px-2 py-1 rounded text-xs bg-orange-100 text-orange-800">
                                <?= htmlspecialchars($flag) ?>
                            </span>
                            <?php endforeach; ?>
                        </div>
                    </div>
                    <?php endif; ?>

                    <!-- Métadonnées techniques -->
                    <div class="mb-6 p-3 bg-gray-100 rounded-lg">
                        <details class="group">
                            <summary class="cursor-pointer text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                <i class="fas fa-info-circle mr-1"></i>
                                Détails techniques
                                <i class="fas fa-chevron-down ml-1 group-open:rotate-180 transition-transform"></i>
                            </summary>
                            <div class="mt-3 text-xs text-gray-600 space-y-1">
                                <p><strong>IP:</strong> <?= htmlspecialchars($review['ip_address']) ?></p>
                                <p><strong>User Agent:</strong> <?= htmlspecialchars(substr($review['user_agent'], 0, 80)) ?>...</p>
                                <p><strong>Temps estimé de modération:</strong> <?= $review['estimated_review_time'] ?></p>
                                <?php if ($review['flag_count'] > 0): ?>
                                <p><strong>Signalements utilisateurs:</strong> <?= $review['flag_count'] ?></p>
                                <?php endif; ?>
                            </div>
                        </details>
                    </div>

                    <!-- Actions de modération -->
                    <?php if (in_array($review['status'], ['pending', 'flagged'])): ?>
                    <div class="border-t pt-4">
                        <div class="flex flex-wrap gap-4">
                            <!-- Formulaire d'approbation -->
                            <form method="POST" class="flex-1">
                                <input type="hidden" name="review_id" value="<?= $review['review_id'] ?>">
                                <input type="hidden" name="action" value="approve">
                                
                                <div class="flex items-center space-x-3">
                                    <button type="submit" 
                                            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                                        <i class="fas fa-check mr-2"></i>
                                        Approuver
                                    </button>
                                    
                                    <label class="flex items-center">
                                        <input type="checkbox" name="notify_user" checked class="mr-2">
                                        <span class="text-sm text-gray-600">Notifier l'utilisateur</span>
                                    </label>
                                </div>

                                <textarea name="moderator_notes" 
                                          placeholder="Notes du modérateur (optionnel)"
                                          class="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                                          rows="2"></textarea>
                            </form>

                            <!-- Formulaire de rejet -->
                            <form method="POST" class="flex-1">
                                <input type="hidden" name="review_id" value="<?= $review['review_id'] ?>">
                                <input type="hidden" name="action" value="reject">
                                
                                <div class="flex items-center space-x-3">
                                    <button type="submit" 
                                            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                                        <i class="fas fa-times mr-2"></i>
                                        Rejeter
                                    </button>
                                    
                                    <select name="rejection_reason" class="border border-gray-300 rounded px-3 py-2 text-sm">
                                        <option value="inappropriate_content">Contenu inapproprié</option>
                                        <option value="spam">Spam</option>
                                        <option value="fake_review">Faux avis</option>
                                        <option value="off_topic">Hors sujet</option>
                                        <option value="other">Autre</option>
                                    </select>
                                </div>

                                <textarea name="moderator_notes" 
                                          placeholder="Raison du rejet (recommandé)"
                                          class="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                                          rows="2"></textarea>
                            </form>
                        </div>
                    </div>
                    <?php elseif ($review['status'] === 'approved'): ?>
                    <div class="border-t pt-4 text-center text-green-600">
                        <i class="fas fa-check-circle mr-2"></i>
                        Review approuvée le <?= date('d/m/Y à H:i', $review['approved_at']) ?>
                        <?php if (!empty($review['approved_by'])): ?>
                        par <?= htmlspecialchars($review['approved_by']) ?>
                        <?php endif; ?>
                    </div>
                    <?php elseif ($review['status'] === 'rejected'): ?>
                    <div class="border-t pt-4 text-center text-red-600">
                        <i class="fas fa-times-circle mr-2"></i>
                        Review rejetée le <?= date('d/m/Y à H:i', $review['rejected_at']) ?>
                        <?php if (!empty($review['rejection_reason'])): ?>
                        <br><span class="text-sm">Raison: <?= htmlspecialchars($review['rejection_reason']) ?></span>
                        <?php endif; ?>
                    </div>
                    <?php endif; ?>
                </div>
            </div>
            <?php endforeach; ?>
        </div>

        <!-- Pagination -->
        <?php if ($moderationData['pagination']['total_pages'] > 1): ?>
        <div class="mt-8 flex justify-center">
            <nav class="flex items-center space-x-2">
                <?php if ($moderationData['pagination']['has_previous']): ?>
                <a href="?status=<?= $filters['status'] ?>&page=<?= $moderationData['pagination']['current_page'] - 1 ?>" 
                   class="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-gray-50">
                    <i class="fas fa-chevron-left"></i>
                </a>
                <?php endif; ?>

                <?php for ($i = 1; $i <= $moderationData['pagination']['total_pages']; $i++): ?>
                <a href="?status=<?= $filters['status'] ?>&page=<?= $i ?>" 
                   class="px-3 py-2 rounded-lg <?= $i === $moderationData['pagination']['current_page'] ? 'bg-purple-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50' ?>">
                    <?= $i ?>
                </a>
                <?php endfor; ?>

                <?php if ($moderationData['pagination']['has_next']): ?>
                <a href="?status=<?= $filters['status'] ?>&page=<?= $moderationData['pagination']['current_page'] + 1 ?>" 
                   class="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-gray-50">
                    <i class="fas fa-chevron-right"></i>
                </a>
                <?php endif; ?>
            </nav>
        </div>
        <?php endif; ?>

        <!-- Actions en lot (si nécessaire) -->
        <div class="mt-8 bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Actions rapides</h3>
            <div class="flex flex-wrap gap-4">
                <button onclick="approveAllPositive()" 
                        class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    <i class="fas fa-magic mr-2"></i>
                    Approuver tous les avis positifs
                </button>
                <button onclick="showModerationStats()" 
                        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    <i class="fas fa-chart-bar mr-2"></i>
                    Statistiques détaillées
                </button>
                <a href="/admin/reviews-export.php" 
                   class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    <i class="fas fa-download mr-2"></i>
                    Exporter les données
                </a>
            </div>
        </div>
    </div>

    <script>
        function approveAllPositive() {
            if (confirm('Êtes-vous sûr de vouloir approuver automatiquement tous les avis avec sentiment positif ?')) {
                // Implémentation AJAX pour actions en lot
                alert('Fonctionnalité à implémenter');
            }
        }

        function showModerationStats() {
            // Modal ou page dédiée aux statistiques
            alert('Statistiques détaillées - À implémenter');
        }

        // Auto-refresh toutes les 5 minutes pour les nouvelles reviews
        setTimeout(() => {
            window.location.reload();
        }, 300000);
    </script>

</body>
</html>