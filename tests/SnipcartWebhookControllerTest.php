<?php
declare(strict_types=1);

namespace {
    require_once __DIR__ . '/../bootstrap.php';
}

namespace GeeknDragon\Controller {
    use SnipcartWebhookTestGlobals;

    if (!function_exists(__NAMESPACE__ . '\\header')) {
        function header(string $header, bool $replace = true, int $response_code = 0): void {
            SnipcartWebhookTestGlobals::$headers[] = $header;
            \header($header, $replace, $response_code);
        }
    }
    if (!function_exists(__NAMESPACE__ . '\\http_response_code')) {
        function http_response_code(int $code = 0): int {
            if ($code !== 0) {
                SnipcartWebhookTestGlobals::$responseCode = $code;
            }
            return \http_response_code($code);
        }
    }
    if (!function_exists(__NAMESPACE__ . '\\curl_init')) {
        function curl_init(string $url) { return $url; }
    }
    if (!function_exists(__NAMESPACE__ . '\\curl_setopt_array')) {
        function curl_setopt_array(&$ch, array $options): void { SnipcartWebhookTestGlobals::$curlOpts[] = $options; }
    }
    if (!function_exists(__NAMESPACE__ . '\\curl_exec')) {
        function curl_exec($ch) {
            return SnipcartWebhookTestGlobals::$curlResponses[SnipcartWebhookTestGlobals::$curlCall] ?? false;
        }
    }
    if (!function_exists(__NAMESPACE__ . '\\curl_error')) {
        function curl_error($ch): string {
            return SnipcartWebhookTestGlobals::$curlErrors[SnipcartWebhookTestGlobals::$curlCall] ?? '';
        }
    }
    if (!function_exists(__NAMESPACE__ . '\\curl_getinfo')) {
        function curl_getinfo($ch, int $opt) {
            $code = SnipcartWebhookTestGlobals::$curlCodes[SnipcartWebhookTestGlobals::$curlCall] ?? 0;
            return $opt === CURLINFO_HTTP_CODE ? $code : null;
        }
    }
    if (!function_exists(__NAMESPACE__ . '\\curl_close')) {
        function curl_close($ch): void { SnipcartWebhookTestGlobals::$curlCall++; }
    }
    if (!function_exists(__NAMESPACE__ . '\\error_log')) {
        function error_log(string $message): void { SnipcartWebhookTestGlobals::$errors[] = $message; }
    }
}

namespace {
    use GeeknDragon\Controller\SnipcartWebhookController;
    use PHPUnit\Framework\TestCase;

    class SnipcartWebhookTestGlobals
    {
        public static array $headers = [];
        public static int $responseCode = 0;
        public static array $curlResponses = [];
        public static array $curlErrors = [];
        public static array $curlCodes = [];
        public static int $curlCall = 0;
        public static array $errors = [];
        public static array $curlOpts = [];
    }

    class TestSnipcartWebhookController extends SnipcartWebhookController
    {
        public array $jsonData = [];
        public int $jsonStatus = 0;
        public bool $validToken = true;

        protected function json(array $data, int $status = 200): void
        {
            $this->jsonData = $data;
            $this->jsonStatus = $status;
            SnipcartWebhookTestGlobals::$responseCode = $status;
            throw new \RuntimeException('json');
        }

        protected function validateToken(string $token): bool
        {
            return $this->validToken;
        }
    }

    final class SnipcartWebhookControllerTest extends TestCase
    {
        protected function setUp(): void
        {
            SnipcartWebhookTestGlobals::$headers = [];
            SnipcartWebhookTestGlobals::$responseCode = 0;
            SnipcartWebhookTestGlobals::$curlResponses = [];
            SnipcartWebhookTestGlobals::$curlErrors = [];
            SnipcartWebhookTestGlobals::$curlCodes = [];
            SnipcartWebhookTestGlobals::$curlCall = 0;
            SnipcartWebhookTestGlobals::$errors = [];
            SnipcartWebhookTestGlobals::$curlOpts = [];
            unset($_SERVER['HTTP_X_SNIPCART_REQUESTTOKEN']);
            unset($GLOBALS['__TEST_PHP_INPUT__']);
        }

        public function testOrderCompleted(): void
        {
            $GLOBALS['__TEST_PHP_INPUT__'] = json_encode([
                'eventName' => 'order.completed',
                'content' => []
            ]);
            $_SERVER['HTTP_X_SNIPCART_REQUESTTOKEN'] = 'valid';
            SnipcartWebhookTestGlobals::$curlCodes = [200];
            SnipcartWebhookTestGlobals::$curlResponses = ['{}'];
            SnipcartWebhookTestGlobals::$curlErrors = [''];

            $controller = new TestSnipcartWebhookController(['snipcart_secret_api_key' => 'secret']);
            try { $controller->handle(); } catch (\RuntimeException $e) {}

            $this->assertSame(200, $controller->jsonStatus);
            $this->assertSame(['status' => 'ok'], $controller->jsonData);
        }

        public function testInvalidToken(): void
        {
            $GLOBALS['__TEST_PHP_INPUT__'] = json_encode([
                'eventName' => 'order.completed',
                'content' => []
            ]);
            $_SERVER['HTTP_X_SNIPCART_REQUESTTOKEN'] = 'invalid';
            SnipcartWebhookTestGlobals::$curlCodes = [401];
            SnipcartWebhookTestGlobals::$curlResponses = [''];
            SnipcartWebhookTestGlobals::$curlErrors = [''];
            $controller = new TestSnipcartWebhookController(['snipcart_secret_api_key' => 'secret']);

            try { $controller->handle(); } catch (\RuntimeException $e) {}

            $this->assertSame(401, $controller->jsonStatus);
            $this->assertSame('invalid-token', $controller->jsonData['errors'][0]['key'] ?? '');
        }

        public function testShippingratesFetchLogsError(): void
        {
            $GLOBALS['__TEST_PHP_INPUT__'] = json_encode([
                'eventName' => 'shippingrates.fetch',
                'content' => ['foo' => 'bar']
            ]);
            $_SERVER['HTTP_X_SNIPCART_REQUESTTOKEN'] = 'valid';
            SnipcartWebhookTestGlobals::$curlCodes = [200, 500];
            SnipcartWebhookTestGlobals::$curlResponses = ['{}', ''];
            SnipcartWebhookTestGlobals::$curlErrors = ['', 'boom'];

            $controller = new TestSnipcartWebhookController(['snipcart_secret_api_key' => 'secret']);
            try { $controller->handle(); } catch (\RuntimeException $e) {}

            $this->assertSame(500, $controller->jsonStatus);
            $this->assertSame('shipping-api', $controller->jsonData['errors'][0]['key'] ?? '');
            $this->assertNotEmpty(SnipcartWebhookTestGlobals::$errors, 'Error log should contain entries');
        }
    }
}
