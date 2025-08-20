<?php
declare(strict_types=1);

/**
 * LinkChecker CLI pour GeeknDragon
 * Vérifie l'intégrité de tous les liens, assets, includes et dépendances
 */

require_once __DIR__ . '/../bootstrap.php';

class LinkChecker
{
    private array $results = [];
    private array $checked = [];
    private string $baseUrl;
    private string $basePath;
    
    public function __construct(string $baseUrl = 'http://localhost', string $basePath = null)
    {
        $this->baseUrl = rtrim($baseUrl, '/');
        $this->basePath = $basePath ?? __DIR__ . '/..';
    }
    
    /**
     * Lance la vérification complète
     */
    public function check(): array
    {
        echo "🔍 Démarrage du LinkChecker pour GeeknDragon...\n\n";
        
        // 1. Vérifier les fichiers PHP principaux
        $this->checkPhpFiles();
        
        // 2. Vérifier les assets (CSS, JS, images)
        $this->checkAssets();
        
        // 3. Vérifier les includes PHP
        $this->checkPhpIncludes();
        
        // 4. Vérifier les liens internes dans les pages
        $this->checkInternalLinks();
        
        // 5. Vérifier les dépendances
        $this->checkDependencies();
        
        // Résumé final
        $this->printSummary();
        
        return $this->results;
    }
    
    /**
     * Vérifie les fichiers PHP principaux
     */
    private function checkPhpFiles(): void
    {
        echo "📄 Vérification des fichiers PHP...\n";
        
        $phpFiles = [
            'index.php',
            'boutique.php',
            'contact.php',
            'checkout.php',
            'product.php',
            'lot10.php',
            'lot25.php',
            'lot50-essence.php',
            'lot50-tresorerie.php',
            'merci.php',
            'shipping.php',
            'actualites/es-tu-game.php'
        ];
        
        foreach ($phpFiles as $file) {
            $path = $this->basePath . '/' . $file;
            if (file_exists($path)) {
                // Vérifier la syntaxe PHP
                $output = [];
                $return = 0;
                exec("php -l \"$path\" 2>&1", $output, $return);
                
                if ($return === 0) {
                    $this->addResult('php_files', $file, 'OK', 'Syntaxe PHP valide');
                } else {
                    $this->addResult('php_files', $file, 'ERROR', 'Erreur syntaxe PHP: ' . implode(' ', $output));
                }
            } else {
                $this->addResult('php_files', $file, 'ERROR', 'Fichier manquant');
            }
        }
    }
    
    /**
     * Vérifie les assets (CSS, JS, images)
     */
    private function checkAssets(): void
    {
        echo "🎨 Vérification des assets...\n";
        
        // CSS
        $cssFiles = [
            'css/styles.css',
            'css/boutique-premium.css',
            'css/gd-ecommerce-native.css'
        ];
        
        foreach ($cssFiles as $file) {
            $this->checkFileExists('css', $file);
        }
        
        // JavaScript
        $jsFiles = [
            'js/app.js',
            'js/gd-ecommerce-native.js',
            'js/hero-videos.js',
            'js/lazy-load-enhanced.js'
        ];
        
        foreach ($jsFiles as $file) {
            $this->checkFileExists('js', $file);
        }
        
        // Images critiques
        $imageFiles = [
            'images/optimized-modern/webp/brand-geekndragon-white.webp',
            'images/optimized-modern/webp/team-brujah.webp',
            'images/flags/flag-fr-medieval-rim-on-top.svg',
            'images/flags/flag-en-us-uk-diagonal-medieval.svg'
        ];
        
        foreach ($imageFiles as $file) {
            $this->checkFileExists('images', $file);
        }
    }
    
    /**
     * Vérifie les includes PHP
     */
    private function checkPhpIncludes(): void
    {
        echo "🔗 Vérification des includes PHP...\n";
        
        $includeFiles = [
            'bootstrap.php',
            'config.php',
            'i18n.php',
            'header.php',
            'footer.php',
            'head-common.php',
            'includes/stock-functions.php',
            'includes/video-utils.php',
            'partials/product-card.php',
            'partials/product-card-premium.php'
        ];
        
        foreach ($includeFiles as $file) {
            $this->checkFileExists('includes', $file);
        }
        
        // Vérifier les chemins d'include dans les fichiers
        $this->checkIncludePaths();
    }
    
    /**
     * Vérifie les chemins d'include dans les fichiers PHP
     */
    private function checkIncludePaths(): void
    {
        $mainFiles = ['index.php', 'boutique.php', 'contact.php'];
        
        foreach ($mainFiles as $file) {
            $path = $this->basePath . '/' . $file;
            if (!file_exists($path)) continue;
            
            $content = file_get_contents($path);
            
            // Rechercher les patterns d'include/require
            preg_match_all('/(?:include|require)(?:_once)?\s+[\'"]([^\'"]+)[\'"]/', $content, $matches);
            preg_match_all('/(?:include|require)(?:_once)?\s+__DIR__\s*\.\s*[\'"]([^\'"]+)[\'"]/', $content, $matches2);
            
            $allIncludes = array_merge($matches[1] ?? [], $matches2[1] ?? []);
            
            foreach ($allIncludes as $includePath) {
                $fullPath = $this->basePath . '/' . ltrim($includePath, '/');
                
                if (file_exists($fullPath)) {
                    $this->addResult('includes', "$file → $includePath", 'OK', 'Include trouvé');
                } else {
                    $this->addResult('includes', "$file → $includePath", 'ERROR', 'Include manquant');
                }
            }
        }
    }
    
    /**
     * Vérifie les liens internes dans les pages
     */
    private function checkInternalLinks(): void
    {
        echo "🌐 Vérification des liens internes...\n";
        
        // Pour une vérification rapide, analyser le contenu HTML des principales pages
        $pages = ['index.php', 'boutique.php', 'contact.php'];
        
        foreach ($pages as $page) {
            $path = $this->basePath . '/' . $page;
            if (!file_exists($path)) continue;
            
            // Simuler le rendu de la page (capture de sortie)
            ob_start();
            try {
                include $path;
                $content = ob_get_contents();
            } catch (Exception $e) {
                $content = '';
                $this->addResult('links', $page, 'ERROR', 'Erreur de rendu: ' . $e->getMessage());
            }
            ob_end_clean();
            
            if ($content) {
                $this->checkLinksInHtml($content, $page);
            }
        }
    }
    
    /**
     * Analyse les liens dans du contenu HTML
     */
    private function checkLinksInHtml(string $html, string $sourcePage): void
    {
        // Rechercher les liens <a href="">
        preg_match_all('/<a[^>]+href=[\'"]([^\'"]+)[\'"][^>]*>/', $html, $matches);
        
        foreach ($matches[1] as $link) {
            if (str_starts_with($link, 'http')) {
                // Lien externe - juste noter
                $this->addResult('external_links', "$sourcePage → $link", 'INFO', 'Lien externe');
            } elseif (str_starts_with($link, '/')) {
                // Lien interne absolu
                $filePath = $this->basePath . $link;
                if (file_exists($filePath)) {
                    $this->addResult('internal_links', "$sourcePage → $link", 'OK', 'Lien interne valide');
                } else {
                    $this->addResult('internal_links', "$sourcePage → $link", 'WARNING', 'Lien interne introuvable');
                }
            }
        }
        
        // Rechercher les images <img src="">
        preg_match_all('/<img[^>]+src=[\'"]([^\'"]+)[\'"][^>]*>/', $html, $imgMatches);
        
        foreach ($imgMatches[1] as $imgSrc) {
            if (!str_starts_with($imgSrc, 'http')) {
                $imgPath = $this->basePath . '/' . ltrim($imgSrc, '/');
                if (file_exists($imgPath)) {
                    $this->addResult('images', "$sourcePage → $imgSrc", 'OK', 'Image trouvée');
                } else {
                    $this->addResult('images', "$sourcePage → $imgSrc", 'ERROR', 'Image manquante');
                }
            }
        }
    }
    
    /**
     * Vérifie les dépendances
     */
    private function checkDependencies(): void
    {
        echo "📦 Vérification des dépendances...\n";
        
        // Composer
        if (file_exists($this->basePath . '/vendor/autoload.php')) {
            $this->addResult('dependencies', 'composer/autoload', 'OK', 'Autoload Composer disponible');
        } else {
            $this->addResult('dependencies', 'composer/autoload', 'ERROR', 'Autoload Composer manquant');
        }
        
        // Node modules
        if (file_exists($this->basePath . '/node_modules')) {
            $this->addResult('dependencies', 'npm/node_modules', 'OK', 'Dépendances NPM installées');
        } else {
            $this->addResult('dependencies', 'npm/node_modules', 'WARNING', 'Dépendances NPM manquantes');
        }
        
        // Fichiers de configuration
        $configFiles = [
            'composer.json',
            'package.json',
            '.env' => false, // Optionnel
            'tailwind.config.js',
            'postcss.config.js'
        ];
        
        foreach ($configFiles as $file => $required) {
            if (is_numeric($file)) {
                $file = $required;
                $required = true;
            }
            
            if (file_exists($this->basePath . '/' . $file)) {
                $this->addResult('config', $file, 'OK', 'Fichier de configuration présent');
            } else {
                $status = $required ? 'ERROR' : 'WARNING';
                $this->addResult('config', $file, $status, 'Fichier de configuration manquant');
            }
        }
    }
    
    /**
     * Vérifie l'existence d'un fichier
     */
    private function checkFileExists(string $category, string $file): void
    {
        $path = $this->basePath . '/' . $file;
        
        if (file_exists($path)) {
            $this->addResult($category, $file, 'OK', 'Fichier trouvé');
        } else {
            $this->addResult($category, $file, 'ERROR', 'Fichier manquant');
        }
    }
    
    /**
     * Ajoute un résultat à la liste
     */
    private function addResult(string $category, string $item, string $status, string $message): void
    {
        $this->results[$category][] = [
            'item' => $item,
            'status' => $status,
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        // Affichage en temps réel
        $icon = match($status) {
            'OK' => '✅',
            'WARNING' => '⚠️',
            'ERROR' => '❌',
            'INFO' => 'ℹ️',
            default => '🔍'
        };
        
        echo "  $icon $item: $message\n";
    }
    
    /**
     * Affiche le résumé final
     */
    private function printSummary(): void
    {
        echo "\n" . str_repeat('=', 60) . "\n";
        echo "📊 RÉSUMÉ DU LINKCHECKER\n";
        echo str_repeat('=', 60) . "\n";
        
        $totalOK = 0;
        $totalWarnings = 0;
        $totalErrors = 0;
        
        foreach ($this->results as $category => $items) {
            $ok = count(array_filter($items, fn($item) => $item['status'] === 'OK'));
            $warnings = count(array_filter($items, fn($item) => $item['status'] === 'WARNING'));
            $errors = count(array_filter($items, fn($item) => $item['status'] === 'ERROR'));
            
            echo sprintf("%-20s: %d OK, %d WARNING, %d ERROR\n", 
                ucfirst(str_replace('_', ' ', $category)), $ok, $warnings, $errors);
            
            $totalOK += $ok;
            $totalWarnings += $warnings;
            $totalErrors += $errors;
        }
        
        echo str_repeat('-', 60) . "\n";
        echo sprintf("%-20s: %d OK, %d WARNING, %d ERROR\n", 
            'TOTAL', $totalOK, $totalWarnings, $totalErrors);
        
        // Code de sortie
        $exitCode = $totalErrors > 0 ? 1 : 0;
        echo "\n🎯 " . ($exitCode === 0 ? "Vérification RÉUSSIE" : "Vérification ÉCHOUÉE") . "\n";
        
        // Sauvegarde du rapport JSON
        $this->saveJsonReport();
        
        exit($exitCode);
    }
    
    /**
     * Sauvegarde le rapport en JSON pour consommation par le générateur de rapport
     */
    private function saveJsonReport(): void
    {
        $reportPath = $this->basePath . '/linkcheck-report.json';
        
        $report = [
            'timestamp' => date('c'),
            'summary' => [
                'total_ok' => 0,
                'total_warnings' => 0,
                'total_errors' => 0
            ],
            'categories' => $this->results
        ];
        
        // Calculer le résumé
        foreach ($this->results as $items) {
            foreach ($items as $item) {
                switch ($item['status']) {
                    case 'OK':
                        $report['summary']['total_ok']++;
                        break;
                    case 'WARNING':
                        $report['summary']['total_warnings']++;
                        break;
                    case 'ERROR':
                        $report['summary']['total_errors']++;
                        break;
                }
            }
        }
        
        file_put_contents($reportPath, json_encode($report, JSON_PRETTY_PRINT));
        echo "💾 Rapport JSON sauvegardé : $reportPath\n";
    }
}

// Exécution si appelé directement
if (php_sapi_name() === 'cli') {
    $checker = new LinkChecker();
    $checker->check();
}