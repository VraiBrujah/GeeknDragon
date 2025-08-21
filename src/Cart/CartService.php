<?php
declare(strict_types=1);

namespace GeeknDragon\Cart;

use GeeknDragon\Core\SessionHelper;

/**
 * Service de gestion du panier
 * Logique métier pour le panier, les commandes et l'authentification
 */
class CartService
{
    private SnipcartClient $snipcartClient;
    private array $cartItems = [];
    
    public function __construct(SnipcartClient $snipcartClient)
    {
        $this->snipcartClient = $snipcartClient;
        $this->loadCartFromSession();
    }
    
    /**
     * Ajoute un produit au panier
     */
    public function addItem(string $productId, int $quantity = 1, array $options = []): bool
    {
        try {
            // Vérifier que le produit existe via l'API
            $product = $this->snipcartClient->getProduct($productId);
            
            // Vérifier le stock disponible
            $inventory = $this->snipcartClient->getInventory($productId);
            if (isset($inventory['stock']) && $inventory['stock'] < $quantity) {
                throw new \RuntimeException("Stock insuffisant pour {$productId}");
            }
            
            // Ajouter ou mettre à jour l'item dans le panier
            $itemKey = $this->generateItemKey($productId, $options);
            
            if (isset($this->cartItems[$itemKey])) {
                $this->cartItems[$itemKey]['quantity'] += $quantity;
            } else {
                $this->cartItems[$itemKey] = [
                    'productId' => $productId,
                    'name' => $product['name'] ?? $productId,
                    'price' => $product['price'] ?? 0,
                    'quantity' => $quantity,
                    'options' => $options,
                    'image' => $product['image'] ?? '',
                    'url' => $product['url'] ?? ''
                ];
            }
            
            $this->saveCartToSession();
            return true;
            
        } catch (SnipcartException $e) {
            throw $e;
        } catch (\Exception $e) {
            error_log("Erreur ajout panier : " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Supprime un produit du panier
     */
    public function removeItem(string $itemKey): bool
    {
        if (isset($this->cartItems[$itemKey])) {
            unset($this->cartItems[$itemKey]);
            $this->saveCartToSession();
            return true;
        }
        return false;
    }
    
    /**
     * Met à jour la quantité d'un produit
     */
    public function updateQuantity(string $itemKey, int $quantity): bool
    {
        if (!isset($this->cartItems[$itemKey])) {
            return false;
        }
        
        if ($quantity <= 0) {
            return $this->removeItem($itemKey);
        }
        
        try {
            // Vérifier le stock disponible
            $productId = $this->cartItems[$itemKey]['productId'];
            $inventory = $this->snipcartClient->getInventory($productId);
            
            if (isset($inventory['stock']) && $inventory['stock'] < $quantity) {
                throw new \RuntimeException("Stock insuffisant");
            }
            
            $this->cartItems[$itemKey]['quantity'] = $quantity;
            $this->saveCartToSession();
            return true;
            
        } catch (SnipcartException $e) {
            throw $e;
        } catch (\Exception $e) {
            error_log("Erreur mise à jour quantité : " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Vide le panier
     */
    public function clearCart(): void
    {
        $this->cartItems = [];
        $this->saveCartToSession();
    }
    
    /**
     * Retourne tous les items du panier
     */
    public function getItems(): array
    {
        return $this->cartItems;
    }
    
    /**
     * Retourne le nombre total d'articles
     */
    public function getItemCount(): int
    {
        return array_sum(array_column($this->cartItems, 'quantity'));
    }
    
    /**
     * Calcule le total du panier
     */
    public function getTotal(): float
    {
        $total = 0;
        foreach ($this->cartItems as $item) {
            $total += $item['price'] * $item['quantity'];
        }
        return $total;
    }
    
    /**
     * Vérifie si le panier est vide
     */
    public function isEmpty(): bool
    {
        return empty($this->cartItems);
    }
    
    /**
     * Récupère les commandes d'un utilisateur
     */
    public function getUserOrders(string $email): array
    {
        try {
            return $this->snipcartClient->getOrders(['email' => $email]);
        } catch (SnipcartException $e) {
            throw $e;
        } catch (\Exception $e) {
            error_log("Erreur récupération commandes : " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Récupère une commande spécifique
     */
    public function getOrder(string $orderId): ?array
    {
        try {
            return $this->snipcartClient->getOrder($orderId);
        } catch (SnipcartException $e) {
            throw $e;
        } catch (\Exception $e) {
            error_log("Erreur récupération commande : " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Génère une clé unique pour un item du panier
     */
    private function generateItemKey(string $productId, array $options): string
    {
        ksort($options); // Assurer un ordre consistant
        return $productId . '_' . md5(serialize($options));
    }
    
    /**
     * Charge le panier depuis la session
     */
    private function loadCartFromSession(): void
    {
        SessionHelper::ensureSession();
        $this->cartItems = $_SESSION['gd_cart'] ?? [];
    }
    
    /**
     * Sauvegarde le panier en session
     */
    private function saveCartToSession(): void
    {
        SessionHelper::ensureSession();
        $_SESSION['gd_cart'] = $this->cartItems;
    }
    
    // Session handling is delegated to SessionHelper
}
