<?php
declare(strict_types=1);

namespace {
    require_once __DIR__ . '/../bootstrap.php';
}

namespace {
    use PHPUnit\Framework\TestCase;
    use GeeknDragon\Controller\AccountController;

    class TestAccountController extends AccountController
    {
        public array $jsonData = [];
        protected function json(array $data, int $status = 200): void
        {
            $this->jsonData = $data;
        }
    }

    final class AccountControllerLoginTest extends TestCase
    {
        public function testSessionIdRegeneratedOnLogin(): void
        {
            if (session_status() !== PHP_SESSION_NONE) {
                session_unset();
                session_destroy();
            }

            $_SERVER['REQUEST_METHOD'] = 'POST';

            $config = [
                'APP_ENV' => 'development',
                'snipcart_api_key' => 'key',
                'snipcart_secret_api_key' => 'secret',
            ];
            $controller = new TestAccountController($config);
            $_SESSION['csrf_token'] = 'token';
            $_POST['_token'] = 'token';
            $GLOBALS['__TEST_PHP_INPUT__'] = json_encode(['email' => 'mock@example.com']);
            $originalId = session_id();

            $controller->login();

            $this->assertArrayHasKey('customer', $_SESSION, 'Customer should be stored in session');
            $this->assertNotSame($originalId, session_id(), 'Session ID should regenerate on login');
            $this->assertTrue($controller->jsonData['success'] ?? false, 'Login should succeed');

            session_unset();
            session_destroy();
        }
    }
}
