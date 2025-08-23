<?php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use GeeknDragon\Security\CsrfProtection;

final class CsrfProtectionTest extends TestCase
{
    public function testCsrfProtection(): void
    {
        if (session_status() !== PHP_SESSION_NONE) {
            session_unset();
            session_destroy();
        }

        $token1 = CsrfProtection::generateToken();
        $time1 = $_SESSION['csrf_token_time'] ?? null;
        $this->assertNotEmpty($time1, 'Horodatage initial défini');

        $token2 = CsrfProtection::getToken();
        $time2 = $_SESSION['csrf_token_time'] ?? null;
        $this->assertSame($token1, $token2, 'getToken retourne le même token');
        $this->assertSame($time1, $time2, 'getToken conserve l\'horodatage');

        $time2 = $_SESSION['csrf_token_time'] = time() - 10;
        $token3 = CsrfProtection::regenerateToken();
        $time3 = $_SESSION['csrf_token_time'] ?? null;
        $this->assertNotSame($token1, $token3, 'regenerateToken génère un nouveau token');
        $this->assertGreaterThan($time2, $time3, 'regenerateToken met à jour l\'horodatage');

        $_SESSION['csrf_token'] = 'old';
        $_SESSION['csrf_token_time'] = time() - 3601;
        CsrfProtection::cleanup();
        $this->assertNotSame('old', $_SESSION['csrf_token'], 'cleanup régénère un token expiré');

        $currentToken = $_SESSION['csrf_token'];
        $_SESSION['csrf_token_time'] = time();
        CsrfProtection::cleanup();
        $this->assertSame($currentToken, $_SESSION['csrf_token'], 'cleanup ne régénère pas un token valide');

        session_unset();
        session_destroy();
    }
}
