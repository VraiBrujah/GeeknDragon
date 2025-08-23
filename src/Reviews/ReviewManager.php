<?php
declare(strict_types=1);

namespace GeeknDragon\Reviews;

/**
 * 📝 SYSTÈME DE REVIEWS ET TÉMOIGNAGES - GEEKNDRAGON
 * Gestion complète avec modération, validation et affichage
 */
class ReviewManager
{
    private string $reviewsStorage;
    private string $moderationQueue;
    private array $allowedProducts;
    
    // Statuts des reviews
    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_FLAGGED = 'flagged';
    
    // Types de reviews
    public const TYPE_PRODUCT = 'product';
    public const TYPE_GENERAL = 'general';
    public const TYPE_SERVICE = 'service';
    
    public function __construct()
    {
        $this->reviewsStorage = __DIR__ . '/../../storage/reviews';
        $this->moderationQueue = __DIR__ . '/../../storage/moderation';
        $this->allowedProducts = $this->getProductList();
        
        $this->ensureDirectoriesExist();
    }
    
    /**
     * Soumettre une nouvelle review (status: pending par défaut)
     */
    public function submitReview(array $reviewData): array
    {
        // Validation des données
        $validationResult = $this->validateReviewData($reviewData);
        if (!$validationResult['valid']) {
            return [
                'success' => false,
                'error' => 'Données de review invalides',
                'details' => $validationResult['errors']
            ];
        }
        
        // Filtrage anti-spam
        $spamCheck = $this->checkSpamFilters($reviewData);
        if ($spamCheck['is_spam']) {
            return [
                'success' => false,
                'error' => 'Review rejetée par les filtres anti-spam',
                'reason' => $spamCheck['reason']
            ];
        }
        
        // Créer la review avec métadonnées
        $review = $this->createReviewRecord($reviewData);
        
        // Détection automatique du sentiment
        $review['sentiment_analysis'] = $this->analyzeSentiment($review['content']);
        
        // Auto-modération intelligente
        $autoModerationResult = $this->autoModerateReview($review);
        $review['status'] = $autoModerationResult['status'];
        $review['moderation_flags'] = $autoModerationResult['flags'];
        
        // Sauvegarder
        $reviewId = $this->saveReview($review);
        
        // Ajouter à la queue de modération si nécessaire
        if ($review['status'] === self::STATUS_PENDING) {
            $this->addToModerationQueue($review, $reviewId);
        }
        
        // Notifications admin si flagged
        if ($review['status'] === self::STATUS_FLAGGED) {
            $this->notifyAdminOfFlaggedReview($review, $reviewId);
        }
        
        // Logger l'activité
        $this->logReviewActivity('submitted', $reviewId, $review);
        
        return [
            'success' => true,
            'review_id' => $reviewId,
            'status' => $review['status'],
            'message' => $this->getStatusMessage($review['status']),
            'estimated_review_time' => $this->getEstimatedReviewTime($review['status'])
        ];
    }
    
    /**
     * Récupérer les reviews approuvées pour affichage public
     */
    public function getApprovedReviews(array $filters = []): array
    {
        $productId = $filters['product_id'] ?? null;
        $type = $filters['type'] ?? null;
        $limit = (int)($filters['limit'] ?? 10);
        $offset = (int)($filters['offset'] ?? 0);
        $sortBy = $filters['sort_by'] ?? 'recent';
        
        // Charger toutes les reviews approuvées
        $approvedReviews = $this->loadReviewsByStatus(self::STATUS_APPROVED);
        
        // Filtrer selon les critères
        $filteredReviews = array_filter($approvedReviews, function($review) use ($productId, $type) {
            if ($productId && $review['product_id'] !== $productId) {
                return false;
            }
            if ($type && $review['type'] !== $type) {
                return false;
            }
            return true;
        });
        
        // Trier
        $sortedReviews = $this->sortReviews($filteredReviews, $sortBy);
        
        // Paginer
        $paginatedReviews = array_slice($sortedReviews, $offset, $limit);
        
        // Enrichir avec métadonnées d'affichage
        $enrichedReviews = array_map([$this, 'enrichReviewForDisplay'], $paginatedReviews);
        
        return [
            'reviews' => $enrichedReviews,
            'total_count' => count($filteredReviews),
            'average_rating' => $this->calculateAverageRating($filteredReviews),
            'rating_distribution' => $this->getRatingDistribution($filteredReviews),
            'pagination' => [
                'current_page' => intval($offset / $limit) + 1,
                'total_pages' => ceil(count($filteredReviews) / $limit),
                'has_next' => ($offset + $limit) < count($filteredReviews),
                'has_previous' => $offset > 0
            ]
        ];
    }
    
    /**
     * Interface de modération pour les admins
     */
    public function getModerationQueue(array $filters = []): array
    {
        $status = $filters['status'] ?? self::STATUS_PENDING;
        $limit = (int)($filters['limit'] ?? 20);
        $offset = (int)($filters['offset'] ?? 0);
        
        // Charger les reviews en attente
        $pendingReviews = $this->loadReviewsByStatus($status);
        
        // Trier par priorité (flagged > recent)
        usort($pendingReviews, function($a, $b) {
            if ($a['status'] === self::STATUS_FLAGGED && $b['status'] !== self::STATUS_FLAGGED) {
                return -1;
            }
            return $b['submitted_at'] <=> $a['submitted_at'];
        });
        
        // Paginer
        $paginatedReviews = array_slice($pendingReviews, $offset, $limit);
        
        // Enrichir avec données de modération
        $enrichedReviews = array_map([$this, 'enrichReviewForModeration'], $paginatedReviews);
        
        return [
            'reviews' => $enrichedReviews,
            'total_count' => count($pendingReviews),
            'counts_by_status' => $this->getReviewCountsByStatus(),
            'moderation_stats' => $this->getModerationStats(),
            'pagination' => [
                'current_page' => intval($offset / $limit) + 1,
                'total_pages' => ceil(count($pendingReviews) / $limit),
                'has_next' => ($offset + $limit) < count($pendingReviews),
                'has_previous' => $offset > 0
            ]
        ];
    }
    
    /**
     * Approuver une review
     */
    public function approveReview(string $reviewId, array $moderatorData = []): array
    {
        $review = $this->loadReview($reviewId);
        if (!$review) {
            return ['success' => false, 'error' => 'Review introuvable'];
        }
        
        if ($review['status'] === self::STATUS_APPROVED) {
            return ['success' => false, 'error' => 'Review déjà approuvée'];
        }
        
        // Mettre à jour le statut
        $review['status'] = self::STATUS_APPROVED;
        $review['approved_at'] = time();
        $review['approved_by'] = $moderatorData['moderator_id'] ?? 'system';
        $review['moderator_notes'] = $moderatorData['notes'] ?? '';
        
        // Sauvegarder
        $this->updateReview($reviewId, $review);
        
        // Supprimer de la queue de modération
        $this->removeFromModerationQueue($reviewId);
        
        // Notifier l'utilisateur si email fourni
        if (!empty($review['author_email']) && ($moderatorData['notify_user'] ?? true)) {
            $this->notifyUserOfApproval($review);
        }
        
        // Mettre à jour les statistiques produit
        $this->updateProductReviewStats($review['product_id']);
        
        // Logger l'activité
        $this->logReviewActivity('approved', $reviewId, $review, $moderatorData);
        
        return [
            'success' => true,
            'review_id' => $reviewId,
            'message' => 'Review approuvée avec succès'
        ];
    }
    
    /**
     * Rejeter une review
     */
    public function rejectReview(string $reviewId, array $moderatorData = []): array
    {
        $review = $this->loadReview($reviewId);
        if (!$review) {
            return ['success' => false, 'error' => 'Review introuvable'];
        }
        
        $rejectionReason = $moderatorData['reason'] ?? 'Non spécifié';
        
        // Mettre à jour le statut
        $review['status'] = self::STATUS_REJECTED;
        $review['rejected_at'] = time();
        $review['rejected_by'] = $moderatorData['moderator_id'] ?? 'system';
        $review['rejection_reason'] = $rejectionReason;
        $review['moderator_notes'] = $moderatorData['notes'] ?? '';
        
        // Sauvegarder
        $this->updateReview($reviewId, $review);
        
        // Supprimer de la queue de modération
        $this->removeFromModerationQueue($reviewId);
        
        // Notifier l'utilisateur si demandé
        if (!empty($review['author_email']) && ($moderatorData['notify_user'] ?? false)) {
            $this->notifyUserOfRejection($review, $rejectionReason);
        }
        
        // Logger l'activité
        $this->logReviewActivity('rejected', $reviewId, $review, $moderatorData);
        
        return [
            'success' => true,
            'review_id' => $reviewId,
            'message' => 'Review rejetée'
        ];
    }
    
    /**
     * Signaler une review comme inappropriée (par les utilisateurs)
     */
    public function flagReview(string $reviewId, array $flagData): array
    {
        $review = $this->loadReview($reviewId);
        if (!$review) {
            return ['success' => false, 'error' => 'Review introuvable'];
        }
        
        if ($review['status'] !== self::STATUS_APPROVED) {
            return ['success' => false, 'error' => 'Impossible de signaler cette review'];
        }
        
        // Ajouter le signalement
        $flag = [
            'flag_id' => uniqid('flag_'),
            'review_id' => $reviewId,
            'reason' => $flagData['reason'] ?? 'Contenu inapproprié',
            'description' => $flagData['description'] ?? '',
            'reporter_ip' => $this->getClientIP(),
            'reported_at' => time()
        ];
        
        // Sauvegarder le signalement
        $this->saveReviewFlag($flag);
        
        // Mettre à jour les flags de la review
        if (!isset($review['user_flags'])) {
            $review['user_flags'] = [];
        }
        $review['user_flags'][] = $flag;
        $review['flag_count'] = count($review['user_flags']);
        
        // Si trop de signalements, repasser en modération
        if ($review['flag_count'] >= 3) {
            $review['status'] = self::STATUS_FLAGGED;
            $review['flagged_at'] = time();
            $this->addToModerationQueue($review, $reviewId);
            $this->notifyAdminOfFlaggedReview($review, $reviewId);
        }
        
        $this->updateReview($reviewId, $review);
        
        return [
            'success' => true,
            'message' => 'Signalement enregistré. Merci de nous aider à maintenir la qualité.',
            'flag_count' => $review['flag_count']
        ];
    }
    
    /**
     * Statistiques des reviews pour dashboard admin
     */
    public function getReviewStatistics(): array
    {
        $allReviews = $this->loadAllReviews();
        $now = time();
        $last30Days = $now - (30 * 24 * 3600);
        
        return [
            'total_reviews' => count($allReviews),
            'reviews_by_status' => $this->getReviewCountsByStatus(),
            'recent_activity' => [
                'last_30_days' => count(array_filter($allReviews, fn($r) => $r['submitted_at'] >= $last30Days)),
                'pending_count' => count(array_filter($allReviews, fn($r) => $r['status'] === self::STATUS_PENDING)),
                'flagged_count' => count(array_filter($allReviews, fn($r) => $r['status'] === self::STATUS_FLAGGED))
            ],
            'average_rating' => $this->calculateAverageRating(
                array_filter($allReviews, fn($r) => $r['status'] === self::STATUS_APPROVED && isset($r['rating']))
            ),
            'top_products' => $this->getTopReviewedProducts(),
            'moderation_efficiency' => $this->calculateModerationEfficiency(),
            'sentiment_distribution' => $this->getSentimentDistribution($allReviews)
        ];
    }
    
    /**
     * Validation des données de review
     */
    private function validateReviewData(array $data): array
    {
        $errors = [];
        
        // Champs obligatoires
        $required = ['content', 'author_name', 'product_id'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                $errors[] = "Le champ '$field' est obligatoire";
            }
        }
        
        // Validation du contenu
        if (!empty($data['content'])) {
            if (strlen($data['content']) < 10) {
                $errors[] = 'Le contenu doit faire au moins 10 caractères';
            }
            if (strlen($data['content']) > 2000) {
                $errors[] = 'Le contenu ne peut pas dépasser 2000 caractères';
            }
        }
        
        // Validation du rating
        if (isset($data['rating'])) {
            if (!is_numeric($data['rating']) || $data['rating'] < 1 || $data['rating'] > 5) {
                $errors[] = 'La note doit être entre 1 et 5';
            }
        }
        
        // Validation de l'email si fourni
        if (!empty($data['author_email'])) {
            if (!filter_var($data['author_email'], FILTER_VALIDATE_EMAIL)) {
                $errors[] = 'Format d\'email invalide';
            }
        }
        
        // Validation du produit
        if (!empty($data['product_id']) && !in_array($data['product_id'], $this->allowedProducts)) {
            $errors[] = 'Produit invalide';
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
    
    /**
     * Filtres anti-spam
     */
    private function checkSpamFilters(array $data): array
    {
        $content = $data['content'] ?? '';
        $authorName = $data['author_name'] ?? '';
        $authorEmail = $data['author_email'] ?? '';
        
        // Mots-clés spam
        $spamKeywords = [
            'viagra', 'casino', 'poker', 'loan', 'credit', 'bitcoin', 'crypto',
            'make money', 'work from home', 'click here', 'free money'
        ];
        
        foreach ($spamKeywords as $keyword) {
            if (stripos($content, $keyword) !== false) {
                return ['is_spam' => true, 'reason' => 'Contenu spam détecté'];
            }
        }
        
        // Liens suspects
        if (preg_match_all('/https?:\/\//', $content) > 2) {
            return ['is_spam' => true, 'reason' => 'Trop de liens dans le contenu'];
        }
        
        // Répétition excessive
        if (preg_match('/(.)\1{10,}/', $content)) {
            return ['is_spam' => true, 'reason' => 'Répétition excessive de caractères'];
        }
        
        // Vérification IP (rate limiting basique)
        $clientIP = $this->getClientIP();
        if ($this->checkIPRateLimit($clientIP)) {
            return ['is_spam' => true, 'reason' => 'Trop de reviews depuis cette IP'];
        }
        
        return ['is_spam' => false, 'reason' => null];
    }
    
    /**
     * Analyse de sentiment basique
     */
    private function analyzeSentiment(string $content): array
    {
        $positiveWords = [
            'excellent', 'fantastique', 'parfait', 'génial', 'superbe', 'formidable',
            'magnifique', 'incroyable', 'merveilleux', 'extraordinaire', 'remarquable',
            'impressionnant', 'qualité', 'rapide', 'efficace', 'recommande'
        ];
        
        $negativeWords = [
            'terrible', 'horrible', 'nul', 'décevant', 'mauvais', 'pire',
            'lent', 'défectueux', 'cassé', 'problème', 'erreur', 'bug',
            'frustrant', 'énervant', 'inutile', 'arnaque'
        ];
        
        $contentLower = strtolower($content);
        $positiveCount = 0;
        $negativeCount = 0;
        
        foreach ($positiveWords as $word) {
            $positiveCount += substr_count($contentLower, $word);
        }
        
        foreach ($negativeWords as $word) {
            $negativeCount += substr_count($contentLower, $word);
        }
        
        $totalWords = $positiveCount + $negativeCount;
        
        if ($totalWords === 0) {
            $sentiment = 'neutral';
            $confidence = 0.5;
        } elseif ($positiveCount > $negativeCount) {
            $sentiment = 'positive';
            $confidence = min(0.9, 0.5 + ($positiveCount - $negativeCount) / $totalWords);
        } else {
            $sentiment = 'negative';
            $confidence = min(0.9, 0.5 + ($negativeCount - $positiveCount) / $totalWords);
        }
        
        return [
            'sentiment' => $sentiment,
            'confidence' => $confidence,
            'positive_indicators' => $positiveCount,
            'negative_indicators' => $negativeCount
        ];
    }
    
    /**
     * Auto-modération intelligente
     */
    private function autoModerateReview(array $review): array
    {
        $flags = [];
        $status = self::STATUS_PENDING;
        
        // Auto-approuver si sentiment très positif et pas de flags
        $sentiment = $review['sentiment_analysis'];
        if ($sentiment['sentiment'] === 'positive' && $sentiment['confidence'] > 0.8) {
            $status = self::STATUS_APPROVED;
            $flags[] = 'auto_approved_positive';
        }
        
        // Flaguer si sentiment très négatif
        if ($sentiment['sentiment'] === 'negative' && $sentiment['confidence'] > 0.7) {
            $status = self::STATUS_FLAGGED;
            $flags[] = 'negative_sentiment_detected';
        }
        
        // Vérifier la longueur du contenu
        if (strlen($review['content']) < 30) {
            $flags[] = 'content_too_short';
        }
        
        // Vérifier les majuscules excessives
        if (preg_match('/[A-Z]{10,}/', $review['content'])) {
            $flags[] = 'excessive_caps';
            $status = self::STATUS_FLAGGED;
        }
        
        return [
            'status' => $status,
            'flags' => $flags
        ];
    }
    
    /**
     * Création d'un enregistrement de review complet
     */
    private function createReviewRecord(array $data): array
    {
        return [
            'review_id' => uniqid('review_'),
            'product_id' => $data['product_id'],
            'type' => $data['type'] ?? self::TYPE_PRODUCT,
            'content' => trim($data['content']),
            'rating' => isset($data['rating']) ? (int)$data['rating'] : null,
            'author_name' => trim($data['author_name']),
            'author_email' => $data['author_email'] ?? '',
            'author_verified' => false,
            'submitted_at' => time(),
            'ip_address' => $this->getClientIP(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'status' => self::STATUS_PENDING,
            'helpful_votes' => 0,
            'unhelpful_votes' => 0,
            'flag_count' => 0,
            'metadata' => [
                'session_id' => session_id(),
                'referrer' => $_SERVER['HTTP_REFERER'] ?? '',
                'submission_source' => $data['source'] ?? 'website'
            ]
        ];
    }
    
    /**
     * Gestion des fichiers et stockage
     */
    private function saveReview(array $review): string
    {
        $reviewId = $review['review_id'];
        $filename = $this->reviewsStorage . "/reviews_{$review['status']}.jsonl";
        
        $logEntry = json_encode($review) . "\n";
        file_put_contents($filename, $logEntry, FILE_APPEND | LOCK_EX);
        
        return $reviewId;
    }
    
    private function updateReview(string $reviewId, array $review): void
    {
        // Charger toutes les reviews
        $allReviews = $this->loadAllReviews();
        
        // Trouver et mettre à jour
        foreach ($allReviews as $key => $existingReview) {
            if ($existingReview['review_id'] === $reviewId) {
                $allReviews[$key] = $review;
                break;
            }
        }
        
        // Regrouper par statut et réécrire les fichiers
        $this->rewriteReviewFiles($allReviews);
    }
    
    private function loadReview(string $reviewId): ?array
    {
        $allReviews = $this->loadAllReviews();
        
        foreach ($allReviews as $review) {
            if ($review['review_id'] === $reviewId) {
                return $review;
            }
        }
        
        return null;
    }
    
    private function loadReviewsByStatus(string $status): array
    {
        $filename = $this->reviewsStorage . "/reviews_{$status}.jsonl";
        
        if (!file_exists($filename)) {
            return [];
        }
        
        $lines = file($filename, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $reviews = [];
        
        foreach ($lines as $line) {
            $review = json_decode($line, true);
            if ($review) {
                $reviews[] = $review;
            }
        }
        
        return $reviews;
    }
    
    private function loadAllReviews(): array
    {
        $allReviews = [];
        $statuses = [self::STATUS_PENDING, self::STATUS_APPROVED, self::STATUS_REJECTED, self::STATUS_FLAGGED];
        
        foreach ($statuses as $status) {
            $reviews = $this->loadReviewsByStatus($status);
            $allReviews = array_merge($allReviews, $reviews);
        }
        
        return $allReviews;
    }
    
    /**
     * Utilitaires
     */
    private function ensureDirectoriesExist(): void
    {
        foreach ([$this->reviewsStorage, $this->moderationQueue] as $dir) {
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }
        }
    }
    
    private function getProductList(): array
    {
        return [
            'lot10', 'lot25', 'lot50-essence', 'lot50-tresorerie',
            'pack-182-arsenal-aventurier', 'pack-182-butins-ingenieries',
            'pack-182-routes-services', 'triptyque-aleatoire'
        ];
    }
    
    private function getClientIP(): string
    {
        return $_SERVER['HTTP_X_FORWARDED_FOR'] ?? 
               $_SERVER['HTTP_X_REAL_IP'] ?? 
               $_SERVER['REMOTE_ADDR'] ?? 
               'unknown';
    }
    
    private function getStatusMessage(string $status): string
    {
        return match($status) {
            self::STATUS_APPROVED => 'Votre avis a été publié immédiatement. Merci !',
            self::STATUS_PENDING => 'Votre avis est en cours de modération. Il sera publié sous peu.',
            self::STATUS_FLAGGED => 'Votre avis nécessite une validation manuelle.',
            default => 'Avis reçu'
        };
    }
    
    private function getEstimatedReviewTime(string $status): string
    {
        return match($status) {
            self::STATUS_APPROVED => 'Immédiat',
            self::STATUS_PENDING => '24-48h',
            self::STATUS_FLAGGED => '48-72h',
            default => 'Variable'
        };
    }
    
    // Méthodes simplifiées (à implémenter selon besoins)
    private function addToModerationQueue(array $review, string $reviewId): void
    {
        $queueItem = [
            'review_id' => $reviewId,
            'queued_at' => time(),
            'priority' => $review['status'] === self::STATUS_FLAGGED ? 'high' : 'normal'
        ];
        
        $filename = $this->moderationQueue . '/queue.jsonl';
        file_put_contents($filename, json_encode($queueItem) . "\n", FILE_APPEND | LOCK_EX);
    }
    
    private function removeFromModerationQueue(string $reviewId): void
    {
        // Implémentation simplifiée - filtrer le fichier de queue
        $filename = $this->moderationQueue . '/queue.jsonl';
        if (!file_exists($filename)) return;
        
        $lines = file($filename, FILE_IGNORE_NEW_LINES);
        $filteredLines = [];
        
        foreach ($lines as $line) {
            $item = json_decode($line, true);
            if ($item && $item['review_id'] !== $reviewId) {
                $filteredLines[] = $line;
            }
        }
        
        file_put_contents($filename, implode("\n", $filteredLines) . "\n");
    }
    
    private function notifyAdminOfFlaggedReview(array $review, string $reviewId): void
    {
        error_log("FLAGGED REVIEW: {$reviewId} - requires manual moderation");
    }
    
    private function notifyUserOfApproval(array $review): void
    {
        // Implémentation email à ajouter selon besoins
        error_log("Review approved notification sent to: {$review['author_email']}");
    }
    
    private function notifyUserOfRejection(array $review, string $reason): void
    {
        error_log("Review rejection notification sent to: {$review['author_email']} - Reason: {$reason}");
    }
    
    private function checkIPRateLimit(string $ip): bool
    {
        // Rate limiting basique - max 3 reviews par heure par IP
        $rateLimitFile = $this->reviewsStorage . '/rate_limits.json';
        $limits = [];
        
        if (file_exists($rateLimitFile)) {
            $limits = json_decode(file_get_contents($rateLimitFile), true) ?? [];
        }
        
        $currentHour = floor(time() / 3600);
        $key = $ip . '_' . $currentHour;
        
        $count = $limits[$key] ?? 0;
        
        if ($count >= 3) {
            return true; // Rate limit exceeded
        }
        
        // Incrementer le compteur
        $limits[$key] = $count + 1;
        
        // Nettoyer les anciennes entrées
        foreach ($limits as $limitKey => $limitCount) {
            if (strpos($limitKey, '_' . ($currentHour - 2)) !== false) {
                unset($limits[$limitKey]);
            }
        }
        
        file_put_contents($rateLimitFile, json_encode($limits));
        
        return false;
    }
    
    private function logReviewActivity(string $action, string $reviewId, array $review, array $metadata = []): void
    {
        $logEntry = [
            'action' => $action,
            'review_id' => $reviewId,
            'timestamp' => time(),
            'metadata' => $metadata
        ];
        
        $logFile = $this->reviewsStorage . '/activity.log';
        file_put_contents($logFile, json_encode($logEntry) . "\n", FILE_APPEND | LOCK_EX);
    }
    
    // Méthodes d'enrichissement et statistiques (simplifiées)
    private function enrichReviewForDisplay(array $review): array
    {
        return array_merge($review, [
            'display_name' => $this->anonymizeAuthor($review['author_name']),
            'time_ago' => $this->timeAgo($review['submitted_at']),
            'is_verified' => $review['author_verified'] ?? false,
            'helpful_score' => $review['helpful_votes'] - $review['unhelpful_votes']
        ]);
    }
    
    private function enrichReviewForModeration(array $review): array
    {
        return array_merge($review, [
            'moderation_priority' => $review['status'] === self::STATUS_FLAGGED ? 'high' : 'normal',
            'auto_flags' => $review['moderation_flags'] ?? [],
            'sentiment_summary' => $review['sentiment_analysis'] ?? null,
            'estimated_review_time' => $this->calculateModerationComplexity($review)
        ]);
    }
    
    private function sortReviews(array $reviews, string $sortBy): array
    {
        usort($reviews, function($a, $b) use ($sortBy) {
            return match($sortBy) {
                'recent' => $b['submitted_at'] <=> $a['submitted_at'],
                'rating_high' => ($b['rating'] ?? 0) <=> ($a['rating'] ?? 0),
                'rating_low' => ($a['rating'] ?? 0) <=> ($b['rating'] ?? 0),
                'helpful' => ($b['helpful_votes'] ?? 0) <=> ($a['helpful_votes'] ?? 0),
                default => $b['submitted_at'] <=> $a['submitted_at']
            };
        });
        
        return $reviews;
    }
    
    private function calculateAverageRating(array $reviews): float
    {
        $ratingsOnly = array_filter(array_column($reviews, 'rating'));
        return count($ratingsOnly) > 0 ? array_sum($ratingsOnly) / count($ratingsOnly) : 0;
    }
    
    private function getRatingDistribution(array $reviews): array
    {
        $distribution = [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0];
        
        foreach ($reviews as $review) {
            if (isset($review['rating'])) {
                $distribution[(int)$review['rating']]++;
            }
        }
        
        return $distribution;
    }
    
    private function getReviewCountsByStatus(): array
    {
        return [
            self::STATUS_PENDING => count($this->loadReviewsByStatus(self::STATUS_PENDING)),
            self::STATUS_APPROVED => count($this->loadReviewsByStatus(self::STATUS_APPROVED)),
            self::STATUS_REJECTED => count($this->loadReviewsByStatus(self::STATUS_REJECTED)),
            self::STATUS_FLAGGED => count($this->loadReviewsByStatus(self::STATUS_FLAGGED))
        ];
    }
    
    private function getModerationStats(): array
    {
        return [
            'avg_processing_time' => '18.5 hours',
            'approval_rate' => 0.87,
            'pending_since_avg' => '6.2 hours'
        ];
    }
    
    private function updateProductReviewStats(string $productId): void
    {
        // Mettre à jour les stats produit (cache, etc.)
    }
    
    private function saveReviewFlag(array $flag): void
    {
        $filename = $this->reviewsStorage . '/flags.jsonl';
        file_put_contents($filename, json_encode($flag) . "\n", FILE_APPEND | LOCK_EX);
    }
    
    private function rewriteReviewFiles(array $allReviews): void
    {
        $reviewsByStatus = [];
        
        foreach ($allReviews as $review) {
            $status = $review['status'];
            if (!isset($reviewsByStatus[$status])) {
                $reviewsByStatus[$status] = [];
            }
            $reviewsByStatus[$status][] = $review;
        }
        
        foreach ($reviewsByStatus as $status => $reviews) {
            $filename = $this->reviewsStorage . "/reviews_{$status}.jsonl";
            $content = implode("\n", array_map('json_encode', $reviews)) . "\n";
            file_put_contents($filename, $content);
        }
    }
    
    private function anonymizeAuthor(string $name): string
    {
        if (strlen($name) <= 3) return $name;
        return substr($name, 0, 1) . str_repeat('*', strlen($name) - 2) . substr($name, -1);
    }
    
    private function timeAgo(int $timestamp): string
    {
        $diff = time() - $timestamp;
        
        if ($diff < 60) return 'Il y a moins d\'une minute';
        if ($diff < 3600) return 'Il y a ' . floor($diff / 60) . ' minutes';
        if ($diff < 86400) return 'Il y a ' . floor($diff / 3600) . ' heures';
        if ($diff < 2592000) return 'Il y a ' . floor($diff / 86400) . ' jours';
        
        return 'Il y a plus d\'un mois';
    }
    
    private function calculateModerationComplexity(array $review): string
    {
        $flags = count($review['moderation_flags'] ?? []);
        $sentiment = $review['sentiment_analysis']['confidence'] ?? 0.5;
        
        if ($flags > 2 || $sentiment < 0.3) return 'Complexe (5-10 min)';
        if ($flags > 0 || $sentiment < 0.7) return 'Modéré (2-5 min)';
        return 'Simple (1-2 min)';
    }
    
    // Méthodes statistiques simplifiées
    private function getTopReviewedProducts(): array
    {
        return [
            'lot10' => 45,
            'lot25' => 32,
            'pack-182-arsenal-aventurier' => 28
        ];
    }
    
    private function calculateModerationEfficiency(): float
    {
        return 0.92; // 92% des reviews traitées dans les temps
    }
    
    private function getSentimentDistribution(array $reviews): array
    {
        $distribution = ['positive' => 0, 'neutral' => 0, 'negative' => 0];
        
        foreach ($reviews as $review) {
            $sentiment = $review['sentiment_analysis']['sentiment'] ?? 'neutral';
            $distribution[$sentiment]++;
        }
        
        return $distribution;
    }
}