<?php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use GeeknDragon\Core\SessionHelper;

final class SessionHelperTest extends TestCase
{
    public function testSessionHelper(): void
    {
        if (session_status() !== PHP_SESSION_NONE) {
            session_unset();
            session_destroy();
        }

        unset($_SERVER['HTTPS']);
        SessionHelper::ensureSession();
        $params = session_get_cookie_params();
        $this->assertTrue($params['httponly'], 'HttpOnly doit être activé');
        $this->assertSame('Strict', $params['samesite'], 'SameSite doit être Strict');
        $this->assertFalse($params['secure'], 'Secure doit être désactivé sans HTTPS');
        session_unset();
        session_destroy();

        $_SERVER['HTTPS'] = 'on';
        SessionHelper::ensureSession();
        $params = session_get_cookie_params();
        $this->assertTrue($params['secure'], 'Secure doit être activé avec HTTPS');
        $this->assertTrue($params['httponly'], 'HttpOnly doit être activé avec HTTPS');
        $this->assertSame('Strict', $params['samesite'], 'SameSite doit être Strict avec HTTPS');
        session_unset();
        session_destroy();
        unset($_SERVER['HTTPS']);
    }
}
