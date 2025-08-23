<?php
declare(strict_types=1);

/**
 * 🎯 EXTRACTEUR DE CSS CRITIQUE - GEEKNDRAGON
 * Extraction automatique du CSS critique pour optimiser le First Paint
 */

class CriticalCSSExtractor
{
    private string $rootDir;
    private string $cssDir;
    private array $criticalSelectors;
    
    public function __construct(string $rootDir = null)
    {
        $this->rootDir = $rootDir ?? dirname(__DIR__);
        $this->cssDir = $this->rootDir . '/css';
        
        // Sélecteurs CSS critiques identifiés pour l'Above-the-Fold
        $this->criticalSelectors = [
            // Layout principal
            'html', 'body', 'main', 'header', 'nav',
            
            // Hero section
            '.hero-videos', '.hero-text', '.min-h-screen',
            
            // Typography critique
            'h1', 'h2', 'h3', '.text-5xl', '.text-xl', '.text-center',
            
            // Boutons et éléments interactifs visibles
            '.btn', '.btn-primary', '.btn-outline',
            
            // Layout Flexbox/Grid critique
            '.flex', '.items-center', '.justify-center', '.grid',
            
            // Couleurs et backgrounds critiques
            '.bg-gray-900', '.bg-black', '.text-white', '.bg-gray-800',
            
            // Spacing critique
            '.p-6', '.px-6', '.py-16', '.mb-6', '.mt-6',
            
            // Navigation mobile (visible immédiatement)
            '.md\\:hidden', '.md\\:block', '.md\\:flex',
            
            // Variables CSS et utilitaires de base
            ':root', '*', '*::before', '*::after', '.sr-only',
            
            // Responsive critique
            '@media (min-width: 768px)', '@media (min-width: 1024px)',
            
            // Headers de performance
            '.section-spacing', '.max-w-6xl', '.mx-auto'
        ];
    }

    /**
     * Extraire le CSS critique depuis le fichier principal
     */
    public function extractCriticalCSS(): string
    {
        $cssFiles = [
            $this->cssDir . '/styles.css',
            $this->cssDir . '/site-enhancements.css'
        ];
        
        $criticalCSS = '';
        
        foreach ($cssFiles as $file) {
            if (file_exists($file)) {
                $content = file_get_contents($file);
                $criticalCSS .= $this->extractCriticalRules($content);
            }
        }
        
        // Ajouter les variables CSS essentielles en priorité
        $criticalCSS = $this->getCSSVariables() . $criticalCSS;
        
        return $this->minifyCriticalCSS($criticalCSS);
    }

    /**
     * Extraire les règles CSS correspondant aux sélecteurs critiques
     */
    private function extractCriticalRules(string $css): string
    {
        $criticalRules = '';
        
        // Nettoyer le CSS et diviser en règles
        $css = $this->cleanCSS($css);
        $rules = $this->splitCSSRules($css);
        
        foreach ($rules as $rule) {
            if ($this->isCriticalRule($rule)) {
                $criticalRules .= $rule . "\n";
            }
        }
        
        return $criticalRules;
    }

    /**
     * Vérifier si une règle CSS est critique
     */
    private function isCriticalRule(string $rule): bool
    {
        foreach ($this->criticalSelectors as $selector) {
            // Recherche flexible qui gère les sélecteurs composés
            if (str_contains($rule, $selector) || 
                preg_match('/^' . preg_quote($selector, '/') . '[\s\.\#\:\[\,\>]/', trim($rule))) {
                return true;
            }
        }
        
        // Règles spéciales toujours critiques
        if (str_starts_with(trim($rule), '@font-face') ||
            str_starts_with(trim($rule), ':root') ||
            str_contains($rule, '@media') && $this->isCriticalMediaQuery($rule)) {
            return true;
        }
        
        return false;
    }

    /**
     * Vérifier si une media query est critique
     */
    private function isCriticalMediaQuery(string $rule): bool
    {
        $criticalBreakpoints = ['768px', '1024px'];
        
        foreach ($criticalBreakpoints as $breakpoint) {
            if (str_contains($rule, $breakpoint)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Obtenir les variables CSS critiques
     */
    private function getCSSVariables(): string
    {
        return ':root{
            --font-heading: "Cinzel", serif;
            --color-primary: #4f46e5;
            --color-primary-hover: #4338ca;
            --color-text-primary: #f9fafb;
            --color-text-secondary: #d1d5db;
            --color-bg-primary: #111827;
            --color-bg-secondary: #1f2937;
            --header-height: 80px;
        }' . "\n";
    }

    /**
     * Nettoyer le CSS des commentaires et espaces inutiles
     */
    private function cleanCSS(string $css): string
    {
        // Supprimer les commentaires
        $css = preg_replace('/\/\*.*?\*\//s', '', $css);
        
        // Normaliser les espaces
        $css = preg_replace('/\s+/', ' ', $css);
        
        return trim($css);
    }

    /**
     * Diviser le CSS en règles individuelles
     */
    private function splitCSSRules(string $css): array
    {
        $rules = [];
        $braceLevel = 0;
        $currentRule = '';
        
        for ($i = 0; $i < strlen($css); $i++) {
            $char = $css[$i];
            $currentRule .= $char;
            
            if ($char === '{') {
                $braceLevel++;
            } elseif ($char === '}') {
                $braceLevel--;
                
                if ($braceLevel === 0) {
                    $rules[] = trim($currentRule);
                    $currentRule = '';
                }
            }
        }
        
        return array_filter($rules);
    }

    /**
     * Minifier le CSS critique
     */
    private function minifyCriticalCSS(string $css): string
    {
        // Supprimer les espaces inutiles
        $css = preg_replace('/\s+/', ' ', $css);
        
        // Optimiser les accolades et points-virgules
        $css = str_replace([' {', '{ ', ' }', '} ', ' ;', '; ', ' :', ': ', ' ,', ', '], 
                          ['{', '{', '}', '}', ';', ';', ':', ':', ',', ','], $css);
        
        // Optimiser les valeurs
        $css = preg_replace('/\b0+(px|em|rem|%|vh|vw)\b/', '0', $css);
        
        return trim($css);
    }

    /**
     * Générer le CSS critique et l'injecter dans le template
     */
    public function generateCriticalCSS(): array
    {
        $criticalCSS = $this->extractCriticalCSS();
        $outputFile = $this->cssDir . '/critical.min.css';
        
        // Sauvegarder le fichier
        file_put_contents($outputFile, $criticalCSS);
        
        return [
            'file' => $outputFile,
            'size' => strlen($criticalCSS),
            'content' => $criticalCSS
        ];
    }
}

// Exécution du script
if (php_sapi_name() === 'cli') {
    echo "🎯 Extraction du CSS critique...\n\n";
    
    $extractor = new CriticalCSSExtractor();
    $result = $extractor->generateCriticalCSS();
    
    echo "✅ CSS critique généré !\n";
    echo "   Fichier : " . basename($result['file']) . "\n";
    echo "   Taille : " . number_format($result['size'] / 1024, 2) . " KB\n\n";
    
    echo "💡 Le CSS critique peut maintenant être inliné dans <head> pour optimiser le First Paint.\n";
    
    // Prévisualisation du contenu
    echo "\n📋 Aperçu du CSS critique généré :\n";
    echo substr($result['content'], 0, 200) . "...\n";
}