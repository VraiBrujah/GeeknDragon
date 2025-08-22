<?php
declare(strict_types=1);

namespace GeeknDragon\Performance;

/**
 * 📊 API MONITORING PERFORMANCE SERVEUR - GEEKNDRAGON
 * Réception et traitement des métriques de performance temps réel
 */
class PerformanceMonitorAPI
{
    private string $logDirectory;
    private string $alertsDirectory;
    
    public function __construct()
    {
        $this->logDirectory = __DIR__ . '/../../storage/performance_logs';
        $this->alertsDirectory = __DIR__ . '/../../storage/performance_alerts';
        
        $this->ensureDirectoriesExist();
    }
    
    /**
     * Point d'entrée principal pour les métriques
     */
    public function handleRequest(): void
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
        
        // CORS headers
        $this->setCORSHeaders();
        
        try {
            match($path) {
                '/api/performance-metrics' => $this->handleMetrics($method),
                '/api/performance-session-end' => $this->handleSessionEnd($method),
                '/api/performance-alert' => $this->handleAlert($method),
                '/api/error-log' => $this->handleErrorLog($method),
                '/api/performance-dashboard' => $this->handleDashboard($method),
                '/api/performance-stats' => $this->handleStats($method),
                default => $this->respond(404, ['error' => 'Endpoint not found'])
            };
        } catch (\Exception $e) {
            error_log("Performance API Error: " . $e->getMessage());
            $this->respond(500, ['error' => 'Internal server error']);
        }
    }
    
    /**
     * Traitement des métriques temps réel
     */
    private function handleMetrics(string $method): void
    {
        if ($method !== 'POST') {
            $this->respond(405, ['error' => 'Method not allowed']);
            return;
        }
        
        $data = $this->getJsonInput();
        if (!$data) {
            $this->respond(400, ['error' => 'Invalid JSON']);
            return;
        }
        
        // Validation des données
        if (!$this->validateMetricsData($data)) {
            $this->respond(400, ['error' => 'Invalid metrics data']);
            return;
        }
        
        // Enrichissement des données
        $enrichedData = $this->enrichMetricsData($data);
        
        // Stockage
        $this->storeMetrics($enrichedData);
        
        // Analyse en temps réel
        $this->analyzeMetrics($enrichedData);
        
        $this->respond(200, ['status' => 'metrics_recorded', 'timestamp' => time()]);
    }
    
    /**
     * Traitement fin de session
     */
    private function handleSessionEnd(string $method): void
    {
        if ($method !== 'POST') {
            $this->respond(405, ['error' => 'Method not allowed']);
            return;
        }
        
        $data = $this->getJsonInput();
        if (!$data) {
            $this->respond(400, ['error' => 'Invalid JSON']);
            return;
        }
        
        $this->storeSessionReport($data);
        $this->updateSessionStatistics($data);
        
        $this->respond(200, ['status' => 'session_recorded']);
    }
    
    /**
     * Traitement des alertes
     */
    private function handleAlert(string $method): void
    {
        if ($method !== 'POST') {
            $this->respond(405, ['error' => 'Method not allowed']);
            return;
        }
        
        $data = $this->getJsonInput();
        if (!$data) {
            $this->respond(400, ['error' => 'Invalid JSON']);
            return;
        }
        
        $this->processAlert($data);
        
        $this->respond(200, ['status' => 'alert_processed']);
    }
    
    /**
     * Traitement des erreurs
     */
    private function handleErrorLog(string $method): void
    {
        if ($method !== 'POST') {
            $this->respond(405, ['error' => 'Method not allowed']);
            return;
        }
        
        $data = $this->getJsonInput();
        if (!$data) {
            $this->respond(400, ['error' => 'Invalid JSON']);
            return;
        }
        
        $this->logError($data);
        
        $this->respond(200, ['status' => 'error_logged']);
    }
    
    /**
     * Dashboard de monitoring (GET)
     */
    private function handleDashboard(string $method): void
    {
        if ($method !== 'GET') {
            $this->respond(405, ['error' => 'Method not allowed']);
            return;
        }
        
        $dashboard = $this->generateDashboard();
        $this->respond(200, $dashboard);
    }
    
    /**
     * Statistiques globales (GET)
     */
    private function handleStats(string $method): void
    {
        if ($method !== 'GET') {
            $this->respond(405, ['error' => 'Method not allowed']);
            return;
        }
        
        $period = $_GET['period'] ?? '24h';
        $stats = $this->getPerformanceStats($period);
        
        $this->respond(200, $stats);
    }
    
    /**
     * Validation des données de métriques
     */
    private function validateMetricsData(array $data): bool
    {
        $required = ['timestamp', 'page_url', 'metrics'];
        
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                return false;
            }
        }
        
        // Validation de la structure des métriques
        if (!is_array($data['metrics'])) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Enrichissement des métriques avec données serveur
     */
    private function enrichMetricsData(array $data): array
    {
        $data['server_timestamp'] = time();
        $data['ip_address'] = $this->getClientIP();
        $data['session_id'] = $this->getSessionId();
        $data['user_agent_parsed'] = $this->parseUserAgent($data['user_agent'] ?? '');
        
        // Géolocalisation approximative basée sur IP (optionnel)
        $data['geo_data'] = $this->getGeoData($data['ip_address']);
        
        // Classification automatique
        $data['device_category'] = $this->classifyDevice($data['viewport'] ?? '', $data['user_agent'] ?? '');
        $data['performance_tier'] = $this->calculatePerformanceTier($data['metrics']);
        
        return $data;
    }
    
    /**
     * Stockage des métriques
     */
    private function storeMetrics(array $data): void
    {
        $date = date('Y-m-d');
        $hour = date('H');
        
        // Fichier par heure pour éviter des fichiers trop volumineux
        $filename = $this->logDirectory . "/metrics_{$date}_{$hour}.jsonl";
        
        $logEntry = json_encode($data) . "\n";
        
        file_put_contents($filename, $logEntry, FILE_APPEND | LOCK_EX);
        
        // Rotation des logs (supprimer les fichiers > 7 jours)
        $this->rotateLogFiles();
    }
    
    /**
     * Analyse temps réel des métriques
     */
    private function analyzeMetrics(array $data): void
    {
        $metrics = $data['metrics'];
        
        // Analyse Web Vitals
        if (isset($metrics['webVitals'])) {
            $this->analyzeWebVitals($metrics['webVitals'], $data);
        }
        
        // Analyse métriques business
        if (isset($metrics['business'])) {
            $this->analyzeBusinessMetrics($metrics['business'], $data);
        }
        
        // Détection d'anomalies
        $this->detectAnomalies($data);
        
        // Mise à jour des moyennes en temps réel
        $this->updateRealTimeAverages($data);
    }
    
    /**
     * Analyse des Core Web Vitals
     */
    private function analyzeWebVitals(array $webVitals, array $context): void
    {
        foreach ($webVitals as $metric => $data) {
            if (!isset($data['rating']) || $data['rating'] !== 'poor') {
                continue;
            }
            
            // Alerte automatique pour métriques critiques
            $this->createAlert([
                'type' => 'web_vitals_poor',
                'metric' => $metric,
                'value' => $data['value'],
                'threshold_exceeded' => $this->getThreshold($metric),
                'page_url' => $context['page_url'],
                'user_agent' => $context['user_agent'] ?? '',
                'timestamp' => time(),
                'severity' => $this->getMetricSeverity($metric, $data['value'])
            ]);
        }
    }
    
    /**
     * Analyse des métriques business
     */
    private function analyzeBusinessMetrics(array $business, array $context): void
    {
        // Performance Snipcart
        if (isset($business['snipcart_api']) && !$business['snipcart_api']['success']) {
            $this->createAlert([
                'type' => 'snipcart_api_failure',
                'url' => $business['snipcart_api']['url'],
                'error' => $business['snipcart_api']['error'] ?? 'Unknown error',
                'page_url' => $context['page_url'],
                'timestamp' => time(),
                'severity' => 'high'
            ]);
        }
        
        // Performance images produits
        if (isset($business['product_images'])) {
            $slowImages = array_filter($business['product_images'], 
                fn($img) => $img['loadTime'] > 3000);
            
            if (count($slowImages) > 0) {
                $this->createAlert([
                    'type' => 'slow_product_images',
                    'slow_images_count' => count($slowImages),
                    'slowest_image' => $this->findSlowestImage($slowImages),
                    'page_url' => $context['page_url'],
                    'timestamp' => time(),
                    'severity' => 'medium'
                ]);
            }
        }
    }
    
    /**
     * Détection d'anomalies
     */
    private function detectAnomalies(array $data): void
    {
        $historical = $this->getHistoricalAverages($data['page_url']);
        
        if (!$historical) {
            return; // Pas assez de données historiques
        }
        
        // Comparer avec les moyennes historiques
        if (isset($data['metrics']['webVitals']['LCP']['value'])) {
            $currentLCP = $data['metrics']['webVitals']['LCP']['value'];
            $avgLCP = $historical['avg_lcp'] ?? 0;
            
            // Anomalie si 50% plus lent que la moyenne
            if ($avgLCP > 0 && $currentLCP > ($avgLCP * 1.5)) {
                $this->createAlert([
                    'type' => 'performance_anomaly',
                    'metric' => 'LCP',
                    'current_value' => $currentLCP,
                    'historical_average' => $avgLCP,
                    'deviation_percentage' => (($currentLCP - $avgLCP) / $avgLCP) * 100,
                    'page_url' => $data['page_url'],
                    'timestamp' => time(),
                    'severity' => 'medium'
                ]);
            }
        }
    }
    
    /**
     * Stockage du rapport de session
     */
    private function storeSessionReport(array $data): void
    {
        $date = date('Y-m-d');
        $filename = $this->logDirectory . "/sessions_{$date}.jsonl";
        
        $logEntry = json_encode($data) . "\n";
        file_put_contents($filename, $logEntry, FILE_APPEND | LOCK_EX);
    }
    
    /**
     * Traitement des alertes
     */
    private function processAlert(array $data): void
    {
        // Enrichir l'alerte
        $alert = array_merge($data, [
            'server_timestamp' => time(),
            'ip_address' => $this->getClientIP(),
            'alert_id' => $this->generateAlertId()
        ]);
        
        // Stockage
        $this->storeAlert($alert);
        
        // Traitement selon la sévérité
        $this->processAlertBySeverity($alert);
    }
    
    /**
     * Stockage des alertes
     */
    private function storeAlert(array $alert): void
    {
        $date = date('Y-m-d');
        $filename = $this->alertsDirectory . "/alerts_{$date}.jsonl";
        
        $logEntry = json_encode($alert) . "\n";
        file_put_contents($filename, $logEntry, FILE_APPEND | LOCK_EX);
    }
    
    /**
     * Traitement selon sévérité
     */
    private function processAlertBySeverity(array $alert): void
    {
        $severity = $alert['severity'] ?? 'low';
        
        switch ($severity) {
            case 'critical':
                $this->sendCriticalAlert($alert);
                break;
            case 'high':
                $this->sendHighPriorityAlert($alert);
                break;
            case 'medium':
                $this->logMediumPriorityAlert($alert);
                break;
            default:
                // Log seulement
                break;
        }
    }
    
    /**
     * Génération du dashboard
     */
    private function generateDashboard(): array
    {
        return [
            'overview' => $this->getDashboardOverview(),
            'web_vitals' => $this->getWebVitalsSummary(),
            'business_metrics' => $this->getBusinessMetricsSummary(),
            'alerts' => $this->getRecentAlerts(),
            'top_issues' => $this->getTopIssues(),
            'performance_trends' => $this->getPerformanceTrends(),
            'generated_at' => time()
        ];
    }
    
    /**
     * Vue d'ensemble du dashboard
     */
    private function getDashboardOverview(): array
    {
        $last24h = $this->getMetricsInPeriod('24h');
        
        return [
            'total_sessions' => $this->countSessions($last24h),
            'total_page_views' => $this->countPageViews($last24h),
            'average_session_duration' => $this->getAverageSessionDuration($last24h),
            'bounce_rate' => $this->calculateBounceRate($last24h),
            'error_rate' => $this->calculateErrorRate($last24h),
            'overall_performance_score' => $this->calculateOverallScore($last24h),
            'period' => '24h'
        ];
    }
    
    /**
     * Résumé Web Vitals
     */
    private function getWebVitalsSummary(): array
    {
        $vitals = $this->getWebVitalsData('24h');
        
        return [
            'LCP' => [
                'average' => $this->calculateAverageVital($vitals, 'LCP'),
                'p75' => $this->calculateP75Vital($vitals, 'LCP'),
                'good_percentage' => $this->calculateGoodPercentage($vitals, 'LCP'),
                'trend' => $this->calculateVitalTrend($vitals, 'LCP')
            ],
            'FID' => [
                'average' => $this->calculateAverageVital($vitals, 'FID'),
                'p75' => $this->calculateP75Vital($vitals, 'FID'),
                'good_percentage' => $this->calculateGoodPercentage($vitals, 'FID'),
                'trend' => $this->calculateVitalTrend($vitals, 'FID')
            ],
            'CLS' => [
                'average' => $this->calculateAverageVital($vitals, 'CLS'),
                'p75' => $this->calculateP75Vital($vitals, 'CLS'),
                'good_percentage' => $this->calculateGoodPercentage($vitals, 'CLS'),
                'trend' => $this->calculateVitalTrend($vitals, 'CLS')
            ]
        ];
    }
    
    /**
     * Statistiques de performance globales
     */
    public function getPerformanceStats(string $period): array
    {
        $metrics = $this->getMetricsInPeriod($period);
        
        return [
            'period' => $period,
            'total_samples' => count($metrics),
            'unique_sessions' => $this->countUniqueSessions($metrics),
            'pages_analyzed' => $this->countUniquePages($metrics),
            'web_vitals_distribution' => $this->getWebVitalsDistribution($metrics),
            'device_breakdown' => $this->getDeviceBreakdown($metrics),
            'top_slow_pages' => $this->getTopSlowPages($metrics),
            'error_summary' => $this->getErrorSummary($metrics),
            'recommendations' => $this->generateRecommendations($metrics)
        ];
    }
    
    /**
     * Utilitaires privés
     */
    private function setCORSHeaders(): void
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
        
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
    
    private function getJsonInput(): ?array
    {
        $input = file_get_contents('php://input');
        if (!$input) return null;
        
        $data = json_decode($input, true);
        return json_last_error() === JSON_ERROR_NONE ? $data : null;
    }
    
    private function respond(int $code, array $data): void
    {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
    
    private function ensureDirectoriesExist(): void
    {
        foreach ([$this->logDirectory, $this->alertsDirectory] as $dir) {
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }
        }
    }
    
    private function getClientIP(): string
    {
        return $_SERVER['HTTP_X_FORWARDED_FOR'] ?? 
               $_SERVER['HTTP_X_REAL_IP'] ?? 
               $_SERVER['REMOTE_ADDR'] ?? 
               'unknown';
    }
    
    private function getSessionId(): string
    {
        return session_id() ?: 'no_session';
    }
    
    private function parseUserAgent(string $userAgent): array
    {
        // Parsage simplifié de user agent
        $mobile = preg_match('/Mobile|Android|iPhone|iPad/', $userAgent) ? true : false;
        $browser = 'unknown';
        
        if (strpos($userAgent, 'Chrome') !== false) $browser = 'chrome';
        elseif (strpos($userAgent, 'Firefox') !== false) $browser = 'firefox';
        elseif (strpos($userAgent, 'Safari') !== false) $browser = 'safari';
        elseif (strpos($userAgent, 'Edge') !== false) $browser = 'edge';
        
        return [
            'is_mobile' => $mobile,
            'browser' => $browser,
            'raw' => $userAgent
        ];
    }
    
    private function getGeoData(string $ip): array
    {
        // Géolocalisation simplifiée (vous pourriez intégrer MaxMind GeoIP)
        if ($ip === '127.0.0.1' || strpos($ip, '192.168.') === 0) {
            return ['country' => 'Local', 'region' => 'Development'];
        }
        
        // Pour la production, intégrer une vraie API de géolocalisation
        return ['country' => 'Unknown', 'region' => 'Unknown'];
    }
    
    private function classifyDevice(string $viewport, string $userAgent): string
    {
        if (preg_match('/Mobile|Android|iPhone/', $userAgent)) {
            return 'mobile';
        }
        
        if (preg_match('/iPad|Tablet/', $userAgent)) {
            return 'tablet';
        }
        
        // Basé sur viewport si disponible
        if ($viewport && strpos($viewport, 'x') !== false) {
            [$width] = explode('x', $viewport);
            $width = (int)$width;
            
            if ($width < 768) return 'mobile';
            if ($width < 1024) return 'tablet';
        }
        
        return 'desktop';
    }
    
    private function calculatePerformanceTier(array $metrics): string
    {
        // Classification automatique basée sur les métriques
        $score = 0;
        $total = 0;
        
        if (isset($metrics['webVitals'])) {
            foreach ($metrics['webVitals'] as $vital) {
                if (isset($vital['rating'])) {
                    $total++;
                    if ($vital['rating'] === 'good') $score += 2;
                    elseif ($vital['rating'] === 'needs-improvement') $score += 1;
                }
            }
        }
        
        if ($total === 0) return 'unknown';
        
        $ratio = $score / ($total * 2);
        
        if ($ratio >= 0.8) return 'high';
        if ($ratio >= 0.5) return 'medium';
        return 'low';
    }
    
    private function createAlert(array $alertData): void
    {
        $alert = array_merge($alertData, [
            'alert_id' => $this->generateAlertId(),
            'created_at' => time()
        ]);
        
        $this->storeAlert($alert);
        $this->processAlertBySeverity($alert);
    }
    
    private function generateAlertId(): string
    {
        return 'alert_' . time() . '_' . bin2hex(random_bytes(4));
    }
    
    private function rotateLogFiles(): void
    {
        // Probabilité de 1% de déclencher le nettoyage
        if (random_int(1, 100) > 1) return;
        
        $cutoff = time() - (7 * 24 * 3600); // 7 jours
        
        $files = glob($this->logDirectory . '/*.jsonl');
        foreach ($files as $file) {
            if (filemtime($file) < $cutoff) {
                unlink($file);
            }
        }
    }
    
    // Méthodes de calcul simplifiées (à implémenter selon besoins)
    private function getHistoricalAverages(string $pageUrl): ?array
    {
        // Retourner null pour l'instant - à implémenter avec vraie base de données
        return null;
    }
    
    private function getThreshold(string $metric): float
    {
        $thresholds = [
            'LCP' => 4000,
            'FID' => 300,
            'CLS' => 0.25,
            'FCP' => 3000,
            'TTFB' => 1800
        ];
        
        return $thresholds[$metric] ?? 0;
    }
    
    private function getMetricSeverity(string $metric, float $value): string
    {
        $threshold = $this->getThreshold($metric);
        
        if ($value > $threshold * 2) return 'critical';
        if ($value > $threshold * 1.5) return 'high';
        return 'medium';
    }
    
    private function findSlowestImage(array $images): array
    {
        return array_reduce($images, function($slowest, $current) {
            return ($current['loadTime'] > ($slowest['loadTime'] ?? 0)) ? $current : $slowest;
        }, []);
    }
    
    private function sendCriticalAlert(array $alert): void
    {
        // Notification immédiate (email, Slack, etc.)
        error_log("CRITICAL PERFORMANCE ALERT: " . json_encode($alert));
    }
    
    private function sendHighPriorityAlert(array $alert): void
    {
        // Notification rapide
        error_log("HIGH PRIORITY PERFORMANCE ALERT: " . json_encode($alert));
    }
    
    private function logMediumPriorityAlert(array $alert): void
    {
        // Log pour revue quotidienne
        error_log("MEDIUM PRIORITY PERFORMANCE ALERT: " . json_encode($alert));
    }
    
    private function logError(array $errorData): void
    {
        $date = date('Y-m-d');
        $filename = $this->logDirectory . "/errors_{$date}.jsonl";
        
        $logEntry = json_encode($errorData) . "\n";
        file_put_contents($filename, $logEntry, FILE_APPEND | LOCK_EX);
    }
    
    // Méthodes d'analyse simplifiées (à étendre selon besoins)
    private function getMetricsInPeriod(string $period): array { return []; }
    private function countSessions(array $metrics): int { return 0; }
    private function countPageViews(array $metrics): int { return 0; }
    private function getAverageSessionDuration(array $metrics): float { return 0.0; }
    private function calculateBounceRate(array $metrics): float { return 0.0; }
    private function calculateErrorRate(array $metrics): float { return 0.0; }
    private function calculateOverallScore(array $metrics): int { return 85; }
    private function getWebVitalsData(string $period): array { return []; }
    private function calculateAverageVital(array $data, string $vital): float { return 0.0; }
    private function calculateP75Vital(array $data, string $vital): float { return 0.0; }
    private function calculateGoodPercentage(array $data, string $vital): float { return 0.0; }
    private function calculateVitalTrend(array $data, string $vital): string { return 'stable'; }
    private function getBusinessMetricsSummary(): array { return []; }
    private function getRecentAlerts(): array { return []; }
    private function getTopIssues(): array { return []; }
    private function getPerformanceTrends(): array { return []; }
    private function countUniqueSessions(array $metrics): int { return 0; }
    private function countUniquePages(array $metrics): int { return 0; }
    private function getWebVitalsDistribution(array $metrics): array { return []; }
    private function getDeviceBreakdown(array $metrics): array { return []; }
    private function getTopSlowPages(array $metrics): array { return []; }
    private function getErrorSummary(array $metrics): array { return []; }
    private function generateRecommendations(array $metrics): array { return []; }
    private function updateRealTimeAverages(array $data): void {}
    private function updateSessionStatistics(array $data): void {}
}