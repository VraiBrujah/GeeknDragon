<?php
declare(strict_types=1);

namespace GeeknDragon\I18n;

/**
 * Service de gestion des traductions
 * Centralise la logique d'internationalisation
 */
class TranslationService
{
    private array $translations = [];
    private string $currentLang = 'fr';
    private static ?self $instance = null;
    
    private function __construct()
    {
        // Chargement initial avec la langue par défaut
        $this->loadTranslations('fr');
    }
    
    /**
     * Singleton pour éviter de recharger les traductions
     */
    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Définit la langue courante et charge les traductions
     */
    public function setLanguage(string $lang): void
    {
        if ($lang !== $this->currentLang) {
            $this->currentLang = $lang;
            $this->loadTranslations($lang);
        }
    }
    
    /**
     * Retourne la langue courante
     */
    public function getCurrentLanguage(): string
    {
        return $this->currentLang;
    }
    
    /**
     * Charge les traductions pour une langue donnée
     */
    private function loadTranslations(string $lang): void
    {
        $filePath = __DIR__ . "/../../translations/{$lang}.json";
        
        if (!file_exists($filePath)) {
            // Fallback vers le français si la langue n'existe pas
            if ($lang !== 'fr') {
                $filePath = __DIR__ . '/../../translations/fr.json';
            } else {
                throw new \RuntimeException("Fichier de traduction non trouvé : $filePath");
            }
        }
        
        $content = file_get_contents($filePath);
        if ($content === false) {
            throw new \RuntimeException("Impossible de lire le fichier de traduction");
        }
        
        $translations = json_decode($content, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \RuntimeException("Erreur JSON dans les traductions : " . json_last_error_msg());
        }
        
        $this->translations = $translations;
    }
    
    /**
     * Retourne toutes les traductions
     */
    public function getAllTranslations(): array
    {
        return $this->translations;
    }
    
    /**
     * Retourne une traduction par clé avec support des clés imbriquées
     * Ex: get('nav.shop') ou get('meta.home.title')
     */
    public function get(string $key, string $default = ''): string
    {
        $keys = explode('.', $key);
        $value = $this->translations;
        
        foreach ($keys as $k) {
            if (!isset($value[$k])) {
                return $default;
            }
            $value = $value[$k];
        }
        
        return is_string($value) ? $value : $default;
    }
    
    /**
     * Détecte la langue depuis les paramètres URL, cookies ou headers
     */
    public function detectLanguage(): string
    {
        // 1. Paramètre URL
        if (isset($_GET['lang']) && in_array($_GET['lang'], ['fr', 'en'])) {
            return $_GET['lang'];
        }
        
        // 2. Cookie
        if (isset($_COOKIE['lang']) && in_array($_COOKIE['lang'], ['fr', 'en'])) {
            return $_COOKIE['lang'];
        }
        
        // 3. Header Accept-Language
        $acceptLang = $_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '';
        if ($acceptLang !== '') {
            $locales = $this->parseAcceptLanguage($acceptLang);
            foreach ($locales as $locale) {
                $lang = substr($locale, 0, 2);
                if (in_array($lang, ['fr', 'en'], true)) {
                    return $lang;
                }
            }
        }

        // 4. Fallback français
        return 'fr';
    }

    /**
     * Parse l'en-tête Accept-Language et retourne les locales triées par facteur de qualité
     *
     * @return string[] Liste des locales ordonnées
     */
    private function parseAcceptLanguage(string $header): array
    {
        $languages = array_map('trim', explode(',', $header));
        $weighted = [];

        foreach ($languages as $lang) {
            $parts = explode(';', $lang);
            $locale = strtolower(trim($parts[0]));
            $q = 1.0;

            foreach (array_slice($parts, 1) as $part) {
                $part = trim($part);
                if (str_starts_with($part, 'q=')) {
                    $quality = (float) substr($part, 2);
                    if ($quality >= 0 && $quality <= 1) {
                        $q = $quality;
                    }
                }
            }

            $weighted[$locale] = $q;
        }

        arsort($weighted, SORT_NUMERIC);

        return array_keys($weighted);
    }

    /**
     * Génère une URL avec la langue courante
     */
    public function langUrl(string $path): string
    {
        // Préserver la logique existante si elle existe
        if (function_exists('langUrl')) {
            return langUrl($path);
        }

        // Fallback simple
        $lang = $this->currentLang;
        if ($lang === 'fr') {
            return $path; // Français par défaut, pas de préfixe
        }

        return "/{$lang}{$path}";
    }
}