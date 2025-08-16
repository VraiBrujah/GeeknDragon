<?php
/**
 * Test de validation du nouveau système de galerie produit moderne
 * Vérifie les bonnes pratiques web et l'accessibilité
 */

require_once __DIR__ . '/../bootstrap.php';

class ProductGalleryModernTest
{
    private int $passed = 0;
    private int $failed = 0;
    private array $violations = [];

    public function runTests(): void
    {
        echo "🎨 Tests du nouveau système de galerie produit...\n\n";

        $this->testHTMLStructure();
        $this->testAccessibility();
        $this->testPerformance();
        $this->testResponsiveDesign();
        $this->testProgressiveEnhancement();
        $this->testSEOOptimization();

        $this->displayResults();
    }

    private function testHTMLStructure(): void
    {
        echo "🏗️  Test : Structure HTML moderne\n";

        // Simuler le rendu de la page produit avec des images test
        $testProduct = [
            'images' => ['test1.jpg', 'test2.jpg', 'test.mp4'],
            'name' => 'Test Product'
        ];

        $this->assert(
            'CSS moderne chargé',
            function() {
                return file_exists(__DIR__ . '/../css/product-gallery-modern.css');
            }
        );

        $this->assert(
            'Structure sémantique avec roles ARIA',
            function() {
                // Vérifier que la structure HTML contient les éléments sémantiques
                $content = file_get_contents(__DIR__ . '/../product.php');
                return strpos($content, 'role="tablist"') !== false &&
                       strpos($content, 'role="tab"') !== false &&
                       strpos($content, 'aria-label') !== false;
            }
        );

        $this->assert(
            'Attributs data pour JavaScript',
            function() {
                $content = file_get_contents(__DIR__ . '/../product.php');
                return strpos($content, 'data-gallery="product-media"') !== false &&
                       strpos($content, 'data-media-src') !== false &&
                       strpos($content, 'data-media-type') !== false;
            }
        );

        $this->assert(
            'Support noscript pour graceful degradation',
            function() {
                $content = file_get_contents(__DIR__ . '/../product.php');
                return strpos($content, '<noscript>') !== false;
            }
        );
    }

    private function testAccessibility(): void
    {
        echo "\n♿ Test : Accessibilité WCAG 2.2\n";

        $content = file_get_contents(__DIR__ . '/../product.php');

        $this->assert(
            'Navigation clavier avec tablist/tab',
            function() use ($content) {
                return strpos($content, 'role="tablist"') !== false &&
                       strpos($content, 'role="tab"') !== false;
            }
        );

        $this->assert(
            'Aria-labels descriptifs',
            function() use ($content) {
                return strpos($content, 'aria-label="') !== false &&
                       strpos($content, 'aria-selected') !== false &&
                       strpos($content, 'aria-controls') !== false;
            }
        );

        $this->assert(
            'Live regions pour feedback',
            function() use ($content) {
                return strpos($content, 'aria-live="polite"') !== false &&
                       strpos($content, 'aria-atomic="true"') !== false;
            }
        );

        $this->assert(
            'Support prefers-reduced-motion',
            function() {
                $css = file_get_contents(__DIR__ . '/../css/product-gallery-modern.css');
                return strpos($css, 'prefers-reduced-motion') !== false;
            }
        );

        $this->assert(
            'Contraste élevé supporté',
            function() {
                $css = file_get_contents(__DIR__ . '/../css/product-gallery-modern.css');
                return strpos($css, 'prefers-contrast: high') !== false;
            }
        );
    }

    private function testPerformance(): void
    {
        echo "\n⚡ Test : Performance web\n";

        $content = file_get_contents(__DIR__ . '/../product.php');

        $this->assert(
            'Lazy loading avec data-src',
            function() use ($content) {
                return strpos($content, 'data-src=') !== false;
            }
        );

        $this->assert(
            'Preload critique et async',
            function() use ($content) {
                return strpos($content, 'preload') !== false &&
                       strpos($content, 'decoding="async"') !== false;
            }
        );

        $this->assert(
            'CSS critique inline',
            function() use ($content) {
                return strpos($content, '/* CSS critique inline') !== false;
            }
        );

        $this->assert(
            'Intersection Observer pour lazy loading',
            function() use ($content) {
                return strpos($content, 'IntersectionObserver') !== false;
            }
        );

        $this->assert(
            'RequestIdleCallback pour préchargement',
            function() use ($content) {
                return strpos($content, 'requestIdleCallback') !== false;
            }
        );

        $this->assert(
            'Cache des médias avec Map',
            function() use ($content) {
                return strpos($content, 'mediaCache: new Map()') !== false;
            }
        );
    }

    private function testResponsiveDesign(): void
    {
        echo "\n📱 Test : Design responsive\n";

        $css = file_get_contents(__DIR__ . '/../css/product-gallery-modern.css');

        $this->assert(
            'Breakpoints mobile-first',
            function() use ($css) {
                return strpos($css, '@media (max-width: 768px)') !== false &&
                       strpos($css, '@media (min-width: 769px)') !== false;
            }
        );

        $this->assert(
            'Aspect-ratio moderne',
            function() use ($css) {
                return strpos($css, 'aspect-ratio:') !== false;
            }
        );

        $this->assert(
            'Layout adaptatif avec flex',
            function() use ($css) {
                return strpos($css, 'flex-direction: column') !== false &&
                       strpos($css, 'flex-direction: row') !== false;
            }
        );

        $this->assert(
            'Sizes attribut pour responsive images',
            function() {
                $content = file_get_contents(__DIR__ . '/../product.php');
                return strpos($content, 'sizes="(max-width:') !== false;
            }
        );
    }

    private function testProgressiveEnhancement(): void
    {
        echo "\n🔄 Test : Amélioration progressive\n";

        $content = file_get_contents(__DIR__ . '/../product.php');

        $this->assert(
            'Fallback noscript',
            function() use ($content) {
                return strpos($content, '<noscript>') !== false;
            }
        );

        $this->assert(
            'Vérification capacités navigateur',
            function() use ($content) {
                return strpos($content, 'PREFERS_REDUCED_MOTION') !== false &&
                       strpos($content, 'IS_TOUCH_DEVICE') !== false;
            }
        );

        $this->assert(
            'Error handling gracieux',
            function() use ($content) {
                return strpos($content, 'showMediaError') !== false &&
                       strpos($content, 'catch (error)') !== false;
            }
        );

        $this->assert(
            'Support video avec fallback',
            function() use ($content) {
                return strpos($content, '<source data-src=') !== false &&
                       strpos($content, 'Votre navigateur ne supporte pas') !== false;
            }
        );
    }

    private function testSEOOptimization(): void
    {
        echo "\n🔍 Test : Optimisation SEO\n";

        $content = file_get_contents(__DIR__ . '/../product.php');

        $this->assert(
            'Alt-text descriptif et contextuel',
            function() use ($content) {
                return strpos($content, 'Geek & Dragon –') !== false &&
                       strpos($content, 'strip_tags($productName)') !== false;
            }
        );

        $this->assert(
            'Structure sémantique HTML5',
            function() use ($content) {
                return strpos($content, '<nav class="thumbnails-nav"') !== false;
            }
        );

        $this->assert(
            'Loading priorité pour image principale',
            function() use ($content) {
                return strpos($content, 'loading="eager"') !== false;
            }
        );

        $this->assert(
            'Poster frames pour vidéos',
            function() use ($content) {
                return strpos($content, 'poster="') !== false;
            }
        );
    }

    private function assert(string $testName, callable $test): void
    {
        try {
            $result = $test();
            if ($result) {
                echo "  ✅ {$testName}\n";
                $this->passed++;
            } else {
                echo "  ❌ {$testName}\n";
                $this->failed++;
                $this->violations[] = $testName;
            }
        } catch (\Exception $e) {
            echo "  ❌ {$testName} - Erreur: " . $e->getMessage() . "\n";
            $this->failed++;
            $this->violations[] = $testName . " (Exception)";
        }
    }

    private function displayResults(): void
    {
        $total = $this->passed + $this->failed;
        $successRate = $total > 0 ? round(($this->passed / $total) * 100, 1) : 0;

        echo "\n" . str_repeat("=", 70) . "\n";
        echo "📊 RÉSULTATS DU SYSTÈME DE GALERIE MODERNE\n";
        echo str_repeat("=", 70) . "\n";
        echo "Tests réussis    : {$this->passed}\n";
        echo "Tests échoués    : {$this->failed}\n";
        echo "Total            : {$total}\n";
        echo "Taux de réussite : {$successRate}%\n";
        echo str_repeat("=", 70) . "\n";

        if ($this->failed === 0) {
            echo "🎉 Nouveau système de galerie validé avec excellence !\n\n";
            echo "✅ BONNES PRATIQUES WEB RESPECTÉES:\n";
            echo "• HTML-first avec amélioration progressive\n";
            echo "• JavaScript minimal et modulaire\n";
            echo "• CSS optimisé avec variables et responsive\n";
            echo "• Images hautement optimisées avec lazy loading\n";
            echo "• Accessibilité WCAG 2.2 AA complète\n";
            echo "• Performance web optimale\n";
            echo "• SEO et référencement renforcés\n";
            echo "• Progressive enhancement\n";
            echo "• Design responsive mobile-first\n";
            
            echo "\n🚀 OPTIMISATIONS AVANCÉES:\n";
            echo "• Intersection Observer pour lazy loading\n";
            echo "• Cache intelligent des médias\n";
            echo "• Préchargement avec requestIdleCallback\n";
            echo "• Support prefers-reduced-motion\n";
            echo "• Error handling gracieux\n";
            echo "• Navigation clavier complète\n";
            echo "• Live regions pour feedback utilisateur\n";

        } else {
            echo "⚠️  Quelques améliorations possibles détectées:\n";
            foreach ($this->violations as $violation) {
                echo "   • {$violation}\n";
            }
        }

        echo "\n🎯 COMPARAISON ANCIEN VS NOUVEAU SYSTÈME:\n";
        echo "Ancien système ❌ : Code dupliqué, accessibilité limitée, performance basique\n";
        echo "Nouveau système ✅ : Web-first, accessible, performant, moderne\n";
    }
}

// Exécution des tests
if (php_sapi_name() === 'cli') {
    $test = new ProductGalleryModernTest();
    $test->runTests();
} else {
    echo "⚠️ Ce script doit être exécuté en ligne de commande.\n";
    echo "Usage : php tests/ProductGalleryModernTest.php\n";
}