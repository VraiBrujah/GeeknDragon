<?php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class ProjectFilesTest extends TestCase
{
    public function testFileIncludes(): void
    {
        $criticalFiles = [
            'bootstrap.php',
            'config.php',
            'i18n.php',
            'header.php',
            'footer.php'
        ];

        foreach ($criticalFiles as $file) {
            $path = __DIR__ . '/../' . $file;
            $this->assertFileExists($path, "Le fichier $file doit exister");

            if (file_exists($path)) {
                $output = [];
                $return = 0;
                exec("php -l \"$path\" 2>&1", $output, $return);
                $this->assertSame(0, $return, "Le fichier $file doit avoir une syntaxe PHP valide");
            }
        }
    }

    public function testConfigurationFiles(): void
    {
        $composerPath = __DIR__ . '/../composer.json';
        $this->assertFileExists($composerPath, 'composer.json doit exister');
        if (file_exists($composerPath)) {
            $composer = json_decode(file_get_contents($composerPath), true);
            $this->assertNotNull($composer, 'composer.json doit être un JSON valide');
            $this->assertArrayHasKey('psr-4', $composer['autoload'] ?? [], "L'autoload PSR-4 doit être configuré");
        }

        $packagePath = __DIR__ . '/../package.json';
        $this->assertFileExists($packagePath, 'package.json doit exister');
        if (file_exists($packagePath)) {
            $package = json_decode(file_get_contents($packagePath), true);
            $this->assertNotNull($package, 'package.json doit être un JSON valide');
        }

        $productsPath = __DIR__ . '/../data/products.json';
        $this->assertFileExists($productsPath, 'products.json doit exister');
        if (file_exists($productsPath)) {
            $products = json_decode(file_get_contents($productsPath), true);
            $this->assertNotNull($products, 'products.json doit être un JSON valide');
            $this->assertNotEmpty($products, 'products.json ne doit pas être vide');
        }
    }

    public function testAssetFiles(): void
    {
        $criticalAssets = [
            'css/styles.css',
            'js/app.js'
        ];

        foreach ($criticalAssets as $asset) {
            $path = __DIR__ . '/../' . $asset;
            $this->assertFileExists($path, "L'asset $asset doit exister");

            if (file_exists($path)) {
                $size = filesize($path);
                $this->assertGreaterThan(0, $size, "L'asset $asset ne doit pas être vide");
            }
        }
    }
}
