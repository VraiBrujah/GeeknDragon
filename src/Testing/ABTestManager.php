<?php
declare(strict_types=1);

namespace GeeknDragon\Testing;

/**
 * 🧪 SYSTÈME A/B TESTING INTÉGRÉ - GEEKNDRAGON
 * Tests multivariés pour optimisation conversions
 */
class ABTestManager
{
    private string $userId;
    private array $activeTests = [];
    private array $testResults = [];
    
    // Tests actifs avec leurs variations
    private const ACTIVE_TESTS = [
        'hero_headline' => [
            'control' => 'Transformez vos parties D&D avec des trésors réels',
            'variant_a' => 'Révolutionnez vos sessions JDR avec nos pièces métalliques',
            'variant_b' => 'Fini les feuilles froissées : découvrez l\'immersion totale',
            'traffic_split' => [40, 30, 30] // control, A, B
        ],
        
        'cta_button' => [
            'control' => 'Débloquer l\'immersion',
            'variant_a' => 'Transformer mes parties',
            'variant_b' => 'Obtenir mes trésors maintenant',
            'traffic_split' => [34, 33, 33]
        ],
        
        'product_description' => [
            'control' => 'social_proof_focus', // Focus sur témoignages FLIM
            'variant_a' => 'technical_focus',   // Focus sur système multiplicateurs
            'variant_b' => 'emotional_focus',   // Focus sur immersion émotionnelle
            'traffic_split' => [34, 33, 33]
        ],
        
        'pricing_display' => [
            'control' => 'cad_standard',       // "60$ CAD"
            'variant_a' => 'cad_emphasis',     // "60 $CA" avec style
            'variant_b' => 'value_emphasis',   // "60$ (vs 300$ figurines)"
            'traffic_split' => [40, 30, 30]
        ],
        
        'trust_signals' => [
            'control' => 'quebec_prominent',   // Badge Québec mis en avant
            'variant_a' => 'flim_prominent',   // Badge FLIM 2025 mis en avant
            'variant_b' => 'balanced',         // Équilibre entre les deux
            'traffic_split' => [34, 33, 33]
        ]
    ];
    
    public function __construct(?string $userId = null)
    {
        $this->userId = $userId ?? $this->generateUserId();
        $this->initializeUserTests();
    }
    
    /**
     * Obtenir la variation pour un test donné
     */
    public function getVariation(string $testName): string
    {
        if (!isset(self::ACTIVE_TESTS[$testName])) {
            return 'control';
        }
        
        if (!isset($this->activeTests[$testName])) {
            $this->activeTests[$testName] = $this->assignVariation($testName);
            $this->saveUserTestData();
        }
        
        return $this->activeTests[$testName];
    }
    
    /**
     * Enregistrer une conversion pour un test
     */
    public function recordConversion(string $testName, string $conversionType = 'purchase', float $value = 0): void
    {
        $variation = $this->getVariation($testName);
        
        $conversion = [
            'test_name' => $testName,
            'variation' => $variation,
            'conversion_type' => $conversionType,
            'value' => $value,
            'timestamp' => time(),
            'user_id' => $this->userId,
            'session_id' => session_id() ?: 'no_session',
            'page_url' => $_SERVER['REQUEST_URI'] ?? 'unknown'
        ];
        
        $this->logConversion($conversion);
        
        // Envoyer à Analytics si disponible
        if (function_exists('gtag')) {
            gtag('event', 'ab_test_conversion', [
                'test_name' => $testName,
                'variation' => $variation,
                'conversion_type' => $conversionType,
                'value' => $value,
                'currency' => 'CAD'
            ]);
        }
    }
    
    /**
     * Obtenir le contenu pour un test de headline
     */
    public function getHeadlineContent(string $testName = 'hero_headline'): string
    {
        $variation = $this->getVariation($testName);
        $test = self::ACTIVE_TESTS[$testName];
        
        return $test[$variation] ?? $test['control'];
    }
    
    /**
     * Obtenir le contenu pour un test de CTA
     */
    public function getCTAContent(string $testName = 'cta_button'): string
    {
        $variation = $this->getVariation($testName);
        $test = self::ACTIVE_TESTS[$testName];
        
        return $test[$variation] ?? $test['control'];
    }
    
    /**
     * Obtenir la stratégie d'affichage des descriptions produits
     */
    public function getProductDescriptionStrategy(string $testName = 'product_description'): string
    {
        return $this->getVariation($testName);
    }
    
    /**
     * Obtenir le style d'affichage des prix
     */
    public function getPricingDisplayStyle(string $testName = 'pricing_display'): string
    {
        return $this->getVariation($testName);
    }
    
    /**
     * Formatter un prix selon la variation A/B
     */
    public function formatPrice(float $price, string $testName = 'pricing_display'): string
    {
        $variation = $this->getVariation($testName);
        
        return match($variation) {
            'cad_emphasis' => number_format($price, 0) . ' $CA',
            'value_emphasis' => number_format($price, 0) . '$ <span class="text-sm opacity-75">(vs 300$ figurines)</span>',
            default => number_format($price, 0) . '$ CAD'
        };
    }
    
    /**
     * Obtenir la stratégie d'affichage des trust signals
     */
    public function getTrustSignalsStrategy(string $testName = 'trust_signals'): string
    {
        return $this->getVariation($testName);
    }
    
    /**
     * Obtenir les classes CSS pour les trust signals selon la variation
     */
    public function getTrustSignalsClasses(string $testName = 'trust_signals'): array
    {
        $variation = $this->getVariation($testName);
        
        return match($variation) {
            'flim_prominent' => [
                'quebec' => 'opacity-75 scale-90',
                'flim' => 'ring-2 ring-yellow-400 scale-110',
                'delivery' => ''
            ],
            'balanced' => [
                'quebec' => 'scale-105',
                'flim' => 'scale-105',
                'delivery' => 'scale-105'
            ],
            default => [ // quebec_prominent
                'quebec' => 'ring-2 ring-blue-400 scale-110',
                'flim' => 'opacity-75 scale-90',
                'delivery' => ''
            ]
        };
    }
    
    /**
     * Statistiques des tests en cours
     */
    public function getTestStats(): array
    {
        $stats = [];
        
        foreach (self::ACTIVE_TESTS as $testName => $config) {
            $stats[$testName] = [
                'variations' => array_keys($config),
                'traffic_split' => $config['traffic_split'],
                'active_variation' => $this->getVariation($testName),
                'user_participation' => true
            ];
        }
        
        return $stats;
    }
    
    /**
     * Middleware pour injection automatique des variations dans les vues
     */
    public function injectTestVariations(string $content): string
    {
        // Remplacements automatiques selon les tests actifs
        $replacements = [
            // Headlines
            '{{ab_hero_headline}}' => $this->getHeadlineContent('hero_headline'),
            
            // CTAs
            '{{ab_cta_button}}' => $this->getCTAContent('cta_button'),
            
            // Classes CSS conditionnelles
            '{{ab_quebec_classes}}' => $this->getTrustSignalsClasses()['quebec'],
            '{{ab_flim_classes}}' => $this->getTrustSignalsClasses()['flim'],
        ];
        
        return str_replace(array_keys($replacements), array_values($replacements), $content);
    }
    
    /**
     * Génération d'un ID utilisateur persistant
     */
    private function generateUserId(): string
    {
        // Utiliser la session si disponible
        if (session_status() === PHP_SESSION_ACTIVE) {
            if (!isset($_SESSION['ab_user_id'])) {
                $_SESSION['ab_user_id'] = 'user_' . bin2hex(random_bytes(8));
            }
            return $_SESSION['ab_user_id'];
        }
        
        // Fallback sur cookie ou génération temporaire
        $cookieName = 'gd_ab_user';
        if (isset($_COOKIE[$cookieName])) {
            return $_COOKIE[$cookieName];
        }
        
        $userId = 'user_' . bin2hex(random_bytes(8));
        setcookie($cookieName, $userId, time() + (86400 * 30), '/', '', true, true); // 30 jours
        
        return $userId;
    }
    
    /**
     * Assigner une variation à un utilisateur selon la répartition du trafic
     */
    private function assignVariation(string $testName): string
    {
        $test = self::ACTIVE_TESTS[$testName];
        $splits = $test['traffic_split'];
        $variations = array_filter(array_keys($test), fn($k) => $k !== 'traffic_split');
        
        // Hash déterministe basé sur user_id + test_name
        $hash = crc32($this->userId . $testName);
        $bucket = abs($hash) % 100;
        
        $cumulative = 0;
        foreach ($variations as $i => $variation) {
            $cumulative += $splits[$i];
            if ($bucket < $cumulative) {
                return $variation;
            }
        }
        
        return 'control'; // Fallback
    }
    
    /**
     * Charger les tests de l'utilisateur depuis le stockage
     */
    private function initializeUserTests(): void
    {
        $storageFile = $this->getUserTestFile();
        
        if (file_exists($storageFile)) {
            $data = json_decode(file_get_contents($storageFile), true);
            $this->activeTests = $data['tests'] ?? [];
        }
    }
    
    /**
     * Sauvegarder les assignations de tests
     */
    private function saveUserTestData(): void
    {
        $storageFile = $this->getUserTestFile();
        $storageDir = dirname($storageFile);
        
        if (!is_dir($storageDir)) {
            mkdir($storageDir, 0755, true);
        }
        
        $data = [
            'user_id' => $this->userId,
            'tests' => $this->activeTests,
            'created' => time(),
            'updated' => time()
        ];
        
        file_put_contents($storageFile, json_encode($data), LOCK_EX);
    }
    
    /**
     * Logger les conversions pour analyse
     */
    private function logConversion(array $conversion): void
    {
        $logDir = __DIR__ . '/../../storage/ab_tests';
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        $logFile = $logDir . '/conversions_' . date('Y-m') . '.log';
        $logEntry = json_encode($conversion) . "\n";
        
        file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
    }
    
    /**
     * Chemin du fichier de stockage utilisateur
     */
    private function getUserTestFile(): string
    {
        $hash = md5($this->userId);
        $subdir = substr($hash, 0, 2); // Distribution en sous-dossiers
        
        return __DIR__ . "/../../storage/ab_tests/users/{$subdir}/{$hash}.json";
    }
    
    /**
     * Analyser les résultats des tests (méthode admin)
     */
    public static function analyzeTestResults(string $testName, int $days = 30): array
    {
        $logFiles = glob(__DIR__ . '/../../storage/ab_tests/conversions_*.log');
        $cutoff = time() - ($days * 86400);
        
        $results = [];
        
        foreach ($logFiles as $logFile) {
            $lines = file($logFile, FILE_IGNORE_NEW_LINES);
            
            foreach ($lines as $line) {
                $conversion = json_decode($line, true);
                
                if ($conversion['test_name'] === $testName && $conversion['timestamp'] >= $cutoff) {
                    $variation = $conversion['variation'];
                    
                    if (!isset($results[$variation])) {
                        $results[$variation] = [
                            'conversions' => 0,
                            'total_value' => 0,
                            'conversion_types' => []
                        ];
                    }
                    
                    $results[$variation]['conversions']++;
                    $results[$variation]['total_value'] += $conversion['value'];
                    $results[$variation]['conversion_types'][] = $conversion['conversion_type'];
                }
            }
        }
        
        return $results;
    }
}