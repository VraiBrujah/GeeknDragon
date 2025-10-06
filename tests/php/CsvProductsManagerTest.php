<?php

use PHPUnit\Framework\TestCase;
use GeeknDragon\Includes\CsvProductsManager;

final class CsvProductsManagerTest extends TestCase
{
    private string $tmpCsv;
    private string $tmpJson;

    protected function setUp(): void
    {
        $this->tmpCsv = __DIR__ . '/../../cache/test-products.csv';
        $this->tmpJson = __DIR__ . '/../../cache/test-products.json';
        if (!is_dir(dirname($this->tmpCsv))) {
            mkdir(dirname($this->tmpCsv), 0755, true);
        }
        @unlink($this->tmpCsv);
        @unlink($this->tmpJson);
    }

    protected function tearDown(): void
    {
        @unlink($this->tmpCsv);
        @unlink($this->tmpJson);
    }

    public function testValidateAndConvertCsv(): void
    {
        $csv = "id;price;name_fr;description_fr;images\n" .
               "test-1;12.5;Nom;Description;\/media\/img1.webp" . "\n";
        file_put_contents($this->tmpCsv, $csv);

        $manager = new CsvProductsManager();
        $validation = $manager->validateCsv($this->tmpCsv);
        $this->assertTrue($validation['success'] ?? false, 'CSV should validate');

        $result = $manager->convertCsvToJson($this->tmpCsv, $this->tmpJson);
        $this->assertTrue($result['success'] ?? false, 'Conversion should succeed');
        $this->assertFileExists($this->tmpJson);

        $data = json_decode(file_get_contents($this->tmpJson), true);
        $this->assertIsArray($data);
        $this->assertArrayHasKey('test-1', $data);
        $this->assertSame(12.5, (float)($data['test-1']['price'] ?? 0));
    }
}
