<?php
declare(strict_types=1);

namespace GeeknDragon\View;

use GeeknDragon\Core\SessionHelper;
use GeeknDragon\I18n\TranslationService;

/**
 * Helper pour les vues - fonctions utilitaires de rendu
 */
class ViewHelper
{
    private TranslationService $translator;
    
    public function __construct(TranslationService $translator)
    {
        $this->translator = $translator;
    }
    
    /**
     * Échappe une chaîne pour éviter les XSS
     */
    public function escape(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
    
    /**
     * Retourne une traduction avec échappement automatique
     */
    public function t(string $key, string $default = ''): string
    {
        return $this->escape($this->translator->get($key, $default));
    }
    
    /**
     * Retourne une traduction brute (pour HTML)
     */
    public function tRaw(string $key, string $default = ''): string
    {
        return $this->translator->get($key, $default);
    }
    
    /**
     * Génère une URL avec gestion de la langue
     */
    public function url(string $path): string
    {
        return $this->escape($this->translator->langUrl($path));
    }
    
    /**
     * Génère un token CSRF
     */
    public function csrfToken(): string
    {
        SessionHelper::ensureSession();
        
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        
        return $_SESSION['csrf_token'];
    }
    
    /**
     * Génère un champ CSRF caché
     */
    public function csrfField(): string
    {
        return '<input type="hidden" name="_token" value="' . $this->escape($this->csrfToken()) . '">';
    }
    
    /**
     * Vérifie si une route est active
     */
    public function isActive(string $route): bool
    {
        $currentPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        return str_contains($currentPath, $route);
    }
    
    /**
     * Retourne la classe CSS pour une navigation active
     */
    public function activeClass(string $route, string $activeClass = 'active'): string
    {
        return $this->isActive($route) ? $activeClass : '';
    }
    
    /**
     * Formate un prix selon la locale
     */
    public function formatPrice(float $price, string $currency = 'CAD'): string
    {
        return number_format($price, 2) . ' ' . $currency;
    }
    
    /**
     * Génère un attribut data-i18n pour JavaScript
     */
    public function dataI18n(string $key): string
    {
        return 'data-i18n="' . $this->escape($key) . '"';
    }
    
    /**
     * Inclut un partial avec variables
     */
    public function partial(string $name, array $vars = []): void
    {
        $partialPath = __DIR__ . '/../../views/partials/' . $name . '.php';
        
        if (!file_exists($partialPath)) {
            throw new \RuntimeException("Partial non trouvé : $name");
        }
        
        // Extraire les variables dans le scope local
        extract($vars);
        
        // Rendre le helper disponible dans le partial
        $helper = $this;
        
        include $partialPath;
    }
    
    /**
     * Génère des meta tags SEO
     */
    public function metaTags(array $meta): string
    {
        $html = '';
        
        if (isset($meta['title'])) {
            $html .= '<title>' . $this->escape($meta['title']) . '</title>' . "\n";
        }
        
        if (isset($meta['description'])) {
            $html .= '<meta name="description" content="' . $this->escape($meta['description']) . '">' . "\n";
        }
        
        if (isset($meta['canonical'])) {
            $html .= '<link rel="canonical" href="' . $this->escape($meta['canonical']) . '">' . "\n";
        }
        
        return $html;
    }
}