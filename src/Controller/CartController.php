<?php
declare(strict_types=1);

namespace GeeknDragon\Controller;

use GeeknDragon\Cart\CartService;
use GeeknDragon\Cart\SnipcartClient;
use GeeknDragon\Cart\SnipcartException;

/**
 * Contrôleur pour l'API du panier custom
 */
class CartController extends BaseController
{
    private CartService $cartService;
    
    public function __construct(array $config)
    {
        parent::__construct($config);
        
        // Initialiser le service panier avec mode mock si nécessaire
        $mockMode = ($config['APP_ENV'] ?? 'production') === 'development';
        $snipcartClient = new SnipcartClient(
            $config['snipcart_api_key'] ?? '',
            $config['snipcart_secret_api_key'] ?? '',
            $mockMode
        );
        
        $this->cartService = new CartService($snipcartClient);
    }
    
    /**
     * GET /api/cart - Retourne l'état du panier
     */
    public function getCart(): void
    {
        try {
            $this->json([
                'success' => true,
                'cart' => [
                    'items' => $this->cartService->getItems(),
                    'count' => $this->cartService->getItemCount(),
                    'total' => $this->cartService->getTotal(),
                    'isEmpty' => $this->cartService->isEmpty()
                ]
            ]);
        } catch (\Exception $e) {
            $this->handleError($e, 'CartController::getCart');
        }
    }
    
    /**
     * POST /api/cart/add - Ajoute un produit au panier
     */
    public function addItem(): void
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

            // Validation des données
            $errors = $this->validate($input, [
                'id' => 'required',
                'name' => 'required',
                'price' => 'required|numeric',
                'quantity' => 'numeric'
            ]);

            if (!empty($errors)) {
                $this->json(['success' => false, 'errors' => $errors], 400);
                return;
            }

            // Ajouter au panier
            $success = $this->cartService->addItem(
                $input['id'],
                (int)($input['quantity'] ?? 1),
                $input['options'] ?? []
            );

            if ($success) {
                $this->json([
                    'success' => true,
                    'message' => 'Produit ajouté au panier',
                    'cart' => [
                        'items' => $this->cartService->getItems(),
                        'count' => $this->cartService->getItemCount(),
                        'total' => $this->cartService->getTotal()
                    ]
                ]);
            } else {
                $this->json(['success' => false, 'message' => 'Impossible d\'ajouter le produit'], 500);
            }

        } catch (SnipcartException $e) {
            $this->json(['success' => false, 'message' => 'Configuration Snipcart invalide'], 500);
        } catch (\Exception $e) {
            $this->handleError($e, 'CartController::addItem');
        }
    }
    
    /**
     * POST /api/cart/update - Met à jour la quantité d'un produit
     */
    public function updateItem(): void
    {
        if (!$this->validateCsrfToken()) {
            $this->json(['success' => false, 'message' => 'Token CSRF invalide'], 403);
            return;
        }
        
        try {
            $input = json_decode(file_get_contents('php://input'), true);

            $itemKey = $input['itemKey'] ?? '';
            $action = $input['action'] ?? '';

            if (!$itemKey || !in_array($action, ['increase', 'decrease'])) {
                $this->json(['success' => false, 'message' => 'Paramètres invalides'], 400);
                return;
            }

            // Récupérer l'item actuel
            $items = $this->cartService->getItems();
            if (!isset($items[$itemKey])) {
                $this->json(['success' => false, 'message' => 'Article non trouvé'], 404);
                return;
            }

            $currentQuantity = $items[$itemKey]['quantity'];
            $newQuantity = $action === 'increase' ? $currentQuantity + 1 : $currentQuantity - 1;

            $success = $this->cartService->updateQuantity($itemKey, $newQuantity);

            if ($success) {
                $this->json([
                    'success' => true,
                    'cart' => [
                        'items' => $this->cartService->getItems(),
                        'count' => $this->cartService->getItemCount(),
                        'total' => $this->cartService->getTotal()
                    ]
                ]);
            } else {
                $this->json(['success' => false, 'message' => 'Impossible de mettre à jour'], 500);
            }

        } catch (SnipcartException $e) {
            $this->json(['success' => false, 'message' => 'Configuration Snipcart invalide'], 500);
        } catch (\Exception $e) {
            $this->handleError($e, 'CartController::updateItem');
        }
    }
    
    /**
     * POST /api/cart/remove - Supprime un produit du panier
     */
    public function removeItem(): void
    {
        if (!$this->validateCsrfToken()) {
            $this->json(['success' => false, 'message' => 'Token CSRF invalide'], 403);
            return;
        }
        
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $itemKey = $input['itemKey'] ?? '';
            
            if (!$itemKey) {
                $this->json(['success' => false, 'message' => 'Clé d\'article manquante'], 400);
                return;
            }
            
            $success = $this->cartService->removeItem($itemKey);
            
            if ($success) {
                $this->json([
                    'success' => true,
                    'cart' => [
                        'items' => $this->cartService->getItems(),
                        'count' => $this->cartService->getItemCount(),
                        'total' => $this->cartService->getTotal()
                    ]
                ]);
            } else {
                $this->json(['success' => false, 'message' => 'Article non trouvé'], 404);
            }
            
        } catch (\Exception $e) {
            $this->handleError($e, 'CartController::removeItem');
        }
    }
    
    /**
     * POST /api/cart/clear - Vide le panier
     */
    public function clearCart(): void
    {
        if (!$this->validateCsrfToken()) {
            $this->json(['success' => false, 'message' => 'Token CSRF invalide'], 403);
            return;
        }
        
        try {
            $this->cartService->clearCart();
            
            $this->json([
                'success' => true,
                'message' => 'Panier vidé',
                'cart' => [
                    'items' => [],
                    'count' => 0,
                    'total' => 0
                ]
            ]);
            
        } catch (\Exception $e) {
            $this->handleError($e, 'CartController::clearCart');
        }
    }
    
    /**
     * GET /api/cart/render - Retourne le HTML du contenu du panier
     */
    public function renderCart(): void
    {
        try {
            if (!$this->isAjax()) {
                $this->json(['success' => false, 'message' => 'Requête AJAX requise'], 400);
                return;
            }
            
            ob_start();
            $this->renderPartial('cart/cart-items', [
                'cartService' => $this->cartService
            ]);
            $html = ob_get_clean();
            
            header('Content-Type: text/html');
            echo $html;
            
        } catch (\Exception $e) {
            $this->handleError($e, 'CartController::renderCart');
        }
    }
}