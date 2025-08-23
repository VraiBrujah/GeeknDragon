<?php
/**
 * PRESENTA-AGENT - Configuration PHP
 * Li-CUBE PRO™ LFP - EDS Québec
 * Configuration globale pour le rendu dynamique
 */

// =====================================
// SÉCURITÉ ET CONFIGURATION GÉNÉRALE
// =====================================

// Désactiver les erreurs en production
error_reporting(0);
ini_set('display_errors', 0);

// Activer les erreurs en développement (décommenter si nécessaire)
// error_reporting(E_ALL);
// ini_set('display_errors', 1);

// Configuration de la session
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.cookie_samesite', 'Strict');

// Headers de sécurité
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');

// CSP basique (à adapter selon les besoins)
header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:;");

// =====================================
// CONFIGURATION PRESENTA-AGENT
// =====================================

define('PRESENTA_AGENT_VERSION', '1.0.0');
define('PRESENTA_AGENT_DEBUG', false);

// Chemins et répertoires
define('BASE_DIR', __DIR__);
define('MANIFEST_FILE', BASE_DIR . '/04_manifest.json');
define('ASSETS_DIR', BASE_DIR . '/assets');
define('CACHE_DIR', BASE_DIR . '/cache');

// Configuration des formats supportés
$PRESENTA_FORMATS = [
    'onepage' => [
        'name' => 'Page unique',
        'template' => '06_onepage.html',
        'description' => 'Présentation complète sur une page'
    ],
    'slides' => [
        'name' => 'Slides Reveal.js',
        'template' => '12_slides_reveal.html',
        'description' => 'Présentation slides interactives'
    ],
    'deck' => [
        'name' => 'Deck autonome',
        'template' => '13_deck.html',
        'description' => 'Présentation deck avec navigation'
    ],
    'interactive' => [
        'name' => 'Interface interactive',
        'template' => '18_interactive.html',
        'description' => 'Interface avec calculateur TCO'
    ],
    'a3' => [
        'name' => 'Fiche A3',
        'template' => '08_fiche_A3.html',
        'description' => 'Fiche technique A3 print-ready'
    ],
    'a2' => [
        'name' => 'Fiche A2',
        'template' => '09_fiche_A2.html',
        'description' => 'Fiche marketing A2 grand format'
    ]
];

// Thèmes disponibles
$PRESENTA_THEMES = [
    'default' => [
        'name' => 'Défaut EDS',
        'primary' => '#2E86AB',
        'secondary' => '#A23B72',
        'accent' => '#F18F01'
    ],
    'dark' => [
        'name' => 'Sombre',
        'primary' => '#1a2332',
        'secondary' => '#2E86AB',
        'accent' => '#F18F01'
    ],
    'corporate' => [
        'name' => 'Corporate',
        'primary' => '#003366',
        'secondary' => '#0066CC',
        'accent' => '#FF6600'
    ],
    'print' => [
        'name' => 'Impression',
        'primary' => '#000000',
        'secondary' => '#333333',
        'accent' => '#666666'
    ]
];

// Langues supportées
$PRESENTA_LANGUAGES = [
    'fr' => [
        'name' => 'Français',
        'locale' => 'fr_CA.UTF-8',
        'currency' => 'CAD',
        'date_format' => 'd/m/Y'
    ],
    'en' => [
        'name' => 'English',
        'locale' => 'en_CA.UTF-8',
        'currency' => 'CAD',
        'date_format' => 'Y/m/d'
    ]
];

// =====================================
// FONCTIONS UTILITAIRES
// =====================================

/**
 * Chargement sécurisé du manifest
 */
function loadManifest() {
    static $manifest = null;
    
    if ($manifest === null) {
        if (!file_exists(MANIFEST_FILE)) {
            throw new Exception('Fichier manifest non trouvé: ' . MANIFEST_FILE);
        }
        
        $content = file_get_contents(MANIFEST_FILE);
        if ($content === false) {
            throw new Exception('Impossible de lire le fichier manifest');
        }
        
        $manifest = json_decode($content, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Erreur JSON dans le manifest: ' . json_last_error_msg());
        }
    }
    
    return $manifest;
}

/**
 * Échappement sécurisé des données
 */
function escape($data, $context = 'html') {
    switch ($context) {
        case 'html':
            return htmlspecialchars($data, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        case 'url':
            return urlencode($data);
        case 'js':
            return json_encode($data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
        case 'css':
            return preg_replace('/[^a-zA-Z0-9\-_]/', '', $data);
        default:
            return $data;
    }
}

/**
 * Validation des paramètres d'entrée
 */
function validateInput($input, $type, $default = null) {
    switch ($type) {
        case 'format':
            global $PRESENTA_FORMATS;
            return array_key_exists($input, $PRESENTA_FORMATS) ? $input : $default;
        
        case 'theme':
            global $PRESENTA_THEMES;
            return array_key_exists($input, $PRESENTA_THEMES) ? $input : $default;
        
        case 'lang':
            global $PRESENTA_LANGUAGES;
            return array_key_exists($input, $PRESENTA_LANGUAGES) ? $input : $default;
        
        case 'int':
            return filter_var($input, FILTER_VALIDATE_INT) !== false ? (int)$input : $default;
        
        case 'float':
            return filter_var($input, FILTER_VALIDATE_FLOAT) !== false ? (float)$input : $default;
        
        case 'email':
            return filter_var($input, FILTER_VALIDATE_EMAIL) !== false ? $input : $default;
        
        case 'url':
            return filter_var($input, FILTER_VALIDATE_URL) !== false ? $input : $default;
        
        case 'string':
            return is_string($input) ? trim($input) : $default;
        
        default:
            return $input;
    }
}

/**
 * Formatage des nombres selon la locale
 */
function formatNumber($number, $decimals = 0, $currency = false, $locale = 'fr_CA') {
    if ($currency) {
        $formatter = new NumberFormatter($locale, NumberFormatter::CURRENCY);
        return $formatter->formatCurrency($number, 'CAD');
    } else {
        $formatter = new NumberFormatter($locale, NumberFormatter::DECIMAL);
        $formatter->setAttribute(NumberFormatter::FRACTION_DIGITS, $decimals);
        return $formatter->format($number);
    }
}

/**
 * Génération d'un token CSRF
 */
function generateCSRFToken() {
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
    
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    
    return $_SESSION['csrf_token'];
}

/**
 * Validation du token CSRF
 */
function validateCSRFToken($token) {
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
    
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Logging sécurisé
 */
function logMessage($message, $level = 'INFO', $context = []) {
    if (!PRESENTA_AGENT_DEBUG) {
        return;
    }
    
    $timestamp = date('Y-m-d H:i:s');
    $contextStr = !empty($context) ? ' ' . json_encode($context) : '';
    $logEntry = "[{$timestamp}] {$level}: {$message}{$contextStr}" . PHP_EOL;
    
    $logFile = BASE_DIR . '/logs/presenta-agent.log';
    $logDir = dirname($logFile);
    
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
}

/**
 * Cache simple pour les données
 */
class SimpleCache {
    private $cacheDir;
    
    public function __construct($cacheDir = null) {
        $this->cacheDir = $cacheDir ?: CACHE_DIR;
        if (!is_dir($this->cacheDir)) {
            mkdir($this->cacheDir, 0755, true);
        }
    }
    
    public function get($key, $default = null) {
        $file = $this->getCacheFile($key);
        
        if (!file_exists($file)) {
            return $default;
        }
        
        $data = unserialize(file_get_contents($file));
        
        if ($data['expires'] < time()) {
            unlink($file);
            return $default;
        }
        
        return $data['value'];
    }
    
    public function set($key, $value, $ttl = 3600) {
        $file = $this->getCacheFile($key);
        $data = [
            'value' => $value,
            'expires' => time() + $ttl
        ];
        
        file_put_contents($file, serialize($data), LOCK_EX);
    }
    
    public function delete($key) {
        $file = $this->getCacheFile($key);
        if (file_exists($file)) {
            unlink($file);
        }
    }
    
    private function getCacheFile($key) {
        $filename = md5($key) . '.cache';
        return $this->cacheDir . '/' . $filename;
    }
}

/**
 * Gestionnaire de configuration
 */
class ConfigManager {
    private static $instance = null;
    private $config = [];
    
    private function __construct() {
        $this->loadConfig();
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function loadConfig() {
        // Configuration par défaut
        $this->config = [
            'app' => [
                'name' => 'PRESENTA-AGENT',
                'version' => PRESENTA_AGENT_VERSION,
                'debug' => PRESENTA_AGENT_DEBUG
            ],
            'cache' => [
                'enabled' => true,
                'ttl' => 3600
            ],
            'security' => [
                'csrf_protection' => true,
                'rate_limiting' => true
            ]
        ];
        
        // Chargement depuis fichier si existe
        $configFile = BASE_DIR . '/config.json';
        if (file_exists($configFile)) {
            $fileConfig = json_decode(file_get_contents($configFile), true);
            if ($fileConfig) {
                $this->config = array_merge_recursive($this->config, $fileConfig);
            }
        }
    }
    
    public function get($key, $default = null) {
        $keys = explode('.', $key);
        $value = $this->config;
        
        foreach ($keys as $k) {
            if (isset($value[$k])) {
                $value = $value[$k];
            } else {
                return $default;
            }
        }
        
        return $value;
    }
    
    public function set($key, $value) {
        $keys = explode('.', $key);
        $config = &$this->config;
        
        foreach ($keys as $k) {
            if (!isset($config[$k])) {
                $config[$k] = [];
            }
            $config = &$config[$k];
        }
        
        $config = $value;
    }
}

/**
 * Rate limiting simple
 */
class RateLimiter {
    private $cache;
    private $maxRequests;
    private $window;
    
    public function __construct($maxRequests = 60, $window = 3600) {
        $this->cache = new SimpleCache();
        $this->maxRequests = $maxRequests;
        $this->window = $window;
    }
    
    public function isAllowed($identifier) {
        $key = "rate_limit_{$identifier}";
        $requests = $this->cache->get($key, []);
        
        // Nettoyer les anciennes requêtes
        $now = time();
        $requests = array_filter($requests, function($timestamp) use ($now) {
            return ($now - $timestamp) < $this->window;
        });
        
        // Vérifier la limite
        if (count($requests) >= $this->maxRequests) {
            return false;
        }
        
        // Ajouter la nouvelle requête
        $requests[] = $now;
        $this->cache->set($key, $requests, $this->window);
        
        return true;
    }
}

// =====================================
// INITIALISATION
// =====================================

// Initialisation du gestionnaire de configuration
$config = ConfigManager::getInstance();

// Initialisation du cache si activé
if ($config->get('cache.enabled', true)) {
    $cache = new SimpleCache();
}

// Initialisation du rate limiter si activé
if ($config->get('security.rate_limiting', true)) {
    $rateLimiter = new RateLimiter();
    $clientIP = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    
    if (!$rateLimiter->isAllowed($clientIP)) {
        http_response_code(429);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Trop de requêtes']);
        exit;
    }
}

// Log de l'initialisation
logMessage('Configuration PRESENTA-AGENT initialisée', 'INFO', [
    'version' => PRESENTA_AGENT_VERSION,
    'debug' => PRESENTA_AGENT_DEBUG,
    'formats' => count($PRESENTA_FORMATS),
    'themes' => count($PRESENTA_THEMES)
]);

// Export des variables globales pour utilisation
$GLOBALS['PRESENTA_FORMATS'] = $PRESENTA_FORMATS;
$GLOBALS['PRESENTA_THEMES'] = $PRESENTA_THEMES;
$GLOBALS['PRESENTA_LANGUAGES'] = $PRESENTA_LANGUAGES;

?>