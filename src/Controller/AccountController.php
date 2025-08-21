<?php
declare(strict_types=1);

namespace GeeknDragon\Controller;

use GeeknDragon\Cart\SnipcartClient;
use GeeknDragon\Cart\SnipcartException;
use GeeknDragon\Core\SessionHelper;

/**
 * Contrôleur pour la gestion du compte client
 */
class AccountController extends BaseController
{
    private SnipcartClient $client;

    public function __construct(array $config)
    {
        parent::__construct($config);
        SessionHelper::ensureSession();

        $mockMode = ($config['APP_ENV'] ?? 'production') === 'development';
        $this->client = new SnipcartClient(
            $config['snipcart_api_key'] ?? '',
            $config['snipcart_secret_api_key'] ?? '',
            $mockMode
        );
    }

    /**
     * POST /api/account/login - Authentifie un client par email
     */
    public function login(): void
    {
        if (!$this->validateCsrfToken()) {
            $this->json(['success' => false, 'message' => 'Token CSRF invalide'], 403);
            return;
        }

        try {
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                $this->json(['success' => false, 'message' => 'Données invalides'], 400);
                return;
            }

            $errors = $this->validate($input, [
                'email' => 'required|email'
            ]);

            if (!empty($errors)) {
                $this->json(['success' => false, 'errors' => $errors], 400);
                return;
            }

            $customer = $this->client->getCustomerByEmail($input['email']);

            if (!$customer) {
                $this->json(['success' => false, 'message' => 'Client introuvable'], 404);
                return;
            }

            $_SESSION['customer'] = $customer;

            $this->json(['success' => true, 'customer' => $customer]);
        } catch (SnipcartException $e) {
            $this->json(['success' => false, 'message' => 'Configuration Snipcart invalide'], 500);
        } catch (\Exception $e) {
            $this->handleError($e, 'AccountController::login');
        }
    }

    /**
     * GET /api/account/profile - Retourne le profil du client connecté
     */
    public function profile(): void
    {
        if (empty($_SESSION['customer']['id'])) {
            $this->json(['success' => false, 'message' => 'Non authentifié'], 401);
            return;
        }

        try {
            $customer = $this->client->getCustomer($_SESSION['customer']['id']);
            $this->json(['success' => true, 'customer' => $customer]);
        } catch (\Exception $e) {
            $this->handleError($e, 'AccountController::profile');
        }
    }

    /**
     * GET /api/account/orders - Retourne les commandes du client connecté
     */
    public function orders(): void
    {
        if (empty($_SESSION['customer']['id'])) {
            $this->json(['success' => false, 'message' => 'Non authentifié'], 401);
            return;
        }

        try {
            $orders = $this->client->getOrders(['customerId' => $_SESSION['customer']['id']]);
            $this->json(['success' => true, 'orders' => $orders]);
        } catch (\Exception $e) {
            $this->handleError($e, 'AccountController::orders');
        }
    }
}
