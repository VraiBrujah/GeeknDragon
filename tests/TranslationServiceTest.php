<?php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use GeeknDragon\I18n\TranslationService;

final class TranslationServiceTest extends TestCase
{
    public function testTranslationService(): void
    {
        $service = TranslationService::getInstance();

        $this->assertSame('fr', $service->getCurrentLanguage(), 'La langue par défaut doit être le français');

        $service->setLanguage('en');
        $this->assertSame('en', $service->getCurrentLanguage(), 'Le changement de langue doit fonctionner');

        $service->setLanguage('fr');
        $translation = $service->get('nav.shop');
        $this->assertNotEmpty($translation, 'Les traductions doivent être disponibles');

        $metaTitle = $service->get('meta.home.title');
        $this->assertNotEmpty($metaTitle, 'Les traductions imbriquées doivent fonctionner');

        $nonExistent = $service->get('cle.inexistante', 'default');
        $this->assertSame('default', $nonExistent, 'Une clé inexistante doit retourner la valeur par défaut');

        $_GET['lang'] = 'en';
        $detected = $service->detectLanguage();
        $this->assertSame('en', $detected, 'La détection de langue depuis URL doit fonctionner');
        unset($_GET['lang']);
    }
}
