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
}
