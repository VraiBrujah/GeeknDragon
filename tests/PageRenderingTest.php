<?php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class PageRenderingTest extends TestCase
{
    public function testPageRendering(): void
    {
        ob_start();
        require __DIR__ . '/../bootstrap.php';
        ob_end_clean();
        $this->assertTrue(true, 'Bootstrap se charge sans erreur');

        $config = require __DIR__ . '/../config.php';
        $this->assertIsArray($config, 'La configuration doit retourner un tableau');
        $this->assertArrayHasKey('snipcart_api_key', $config, 'La configuration doit contenir les clés Snipcart');
    }

    public function test404PageRenders(): void
    {
        $_GET['lang'] = 'fr';
        ob_start();
        include __DIR__ . '/../views/pages/404.php';
        $output = ob_get_clean();
        $this->assertStringContainsString('<html', $output);
        $this->assertStringContainsString('Page non trouvée', $output);
    }

    public function test500PageRenders(): void
    {
        $_GET['lang'] = 'fr';
        $exception = new \Exception('Boom');
        $isDev = false;
        ob_start();
        include __DIR__ . '/../views/pages/500.php';
        $output = ob_get_clean();
        $this->assertStringContainsString('Erreur serveur', $output);
    }
}
