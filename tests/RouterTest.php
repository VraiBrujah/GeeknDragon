<?php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use GeeknDragon\Core\Router;
use Psr\Log\NullLogger;

final class RouterTest extends TestCase
{
    public function testRouter(): void
    {
        $router = new Router(new NullLogger());

        $testExecuted = false;
        $router->get('/test', function() use (&$testExecuted) {
            $testExecuted = true;
        });

        $_SERVER['REQUEST_METHOD'] = 'GET';
        $_SERVER['REQUEST_URI'] = '/test';

        ob_start();
        $router->resolve();
        ob_end_clean();

        $this->assertTrue($testExecuted, 'Le routeur doit exécuter la route correspondante');

        $paramValue = null;
        $router->get('/user/{id}', function($id) use (&$paramValue) {
            $paramValue = $id;
        });

        $_SERVER['REQUEST_URI'] = '/user/42';

        ob_start();
        $router->resolve();
        ob_end_clean();

        $this->assertSame('42', $paramValue, 'Le routeur doit extraire les paramètres dynamiques');

        $router->redirect('/old-path', '/new-path');
        $this->assertTrue(true, 'Test des redirections passé');
    }

    public function testMiddlewareTransformsUri(): void
    {
        $router = new Router(new NullLogger());

        $executed = false;
        $router->get('/after', function () use (&$executed) {
            $executed = true;
        });

        $router->middleware(function (string $uri) {
            return '/after';
        });

        $_SERVER['REQUEST_METHOD'] = 'GET';
        $_SERVER['REQUEST_URI'] = '/before';

        ob_start();
        $router->resolve();
        ob_end_clean();

        $this->assertTrue($executed, "Le middleware doit permettre de r\u00e9\u00e9crire l'URI");
    }

    public function testHandle404DisplaysPage(): void
    {
        $router = new Router(new NullLogger());

        $_SERVER['REQUEST_METHOD'] = 'GET';
        $_SERVER['REQUEST_URI'] = '/does-not-exist';

        ob_start();
        $router->resolve();
        $output = ob_get_clean();

        $this->assertStringContainsString('Page non trouvée', $output);
    }
}
