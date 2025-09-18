<?php
declare(strict_types=1);

namespace GeeknDragon\Service;

use PDO;
use Exception;

/**
 * Service de gestion des factures - Synchronisation avec Snipcart
 * Gère la création, mise à jour et récupération des factures utilisateurs
 */
class InvoiceService
{
    private PDO $db;
    
    public function __construct(PDO $database)
    {
        $this->db = $database;
    }
    
    /**
     * Synchronise une commande Snipcart avec la base locale
     * Appelé depuis le webhook order.completed
     */
    public function syncSnipcartOrder(array $orderData): array
    {
        try {
            $this->db->beginTransaction();
            
            // Vérifier si la facture existe déjà
            $existingInvoice = $this->getInvoiceByOrderId($orderData['token'] ?? '');
            
            if ($existingInvoice) {
                // Mise à jour de la facture existante
                $invoiceId = $this->updateInvoice($existingInvoice['id'], $orderData);
            } else {
                // Création d'une nouvelle facture
                $invoiceId = $this->createInvoice($orderData);
            }
            
            // Synchroniser les articles
            $this->syncInvoiceItems($invoiceId, $orderData['items'] ?? []);
            
            // Tenter de lier avec un utilisateur existant
            $this->linkToUser($invoiceId, $orderData['email'] ?? '');
            
            $this->db->commit();
            
            return [
                'success' => true,
                'invoice_id' => $invoiceId,
                'message' => 'Facture synchronisée avec succès'
            ];
            
        } catch (Exception $e) {
            $this->db->rollBack();
            error_log("Erreur synchronisation facture: " . $e->getMessage());
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Crée une nouvelle facture à partir des données Snipcart
     */
    private function createInvoice(array $orderData): int
    {
        $sql = "INSERT INTO user_invoices (
            snipcart_order_id, snipcart_token, customer_email, customer_name,
            order_number, status, payment_status,
            subtotal, taxes, shipping_fees, total_amount, currency,
            shipping_name, shipping_address, shipping_city, shipping_province, 
            shipping_postal_code, shipping_country,
            billing_name, billing_address, billing_city, billing_province,
            billing_postal_code, billing_country,
            invoice_date, shipped_date, delivered_date, snipcart_data
        ) VALUES (
            :snipcart_order_id, :snipcart_token, :customer_email, :customer_name,
            :order_number, :status, :payment_status,
            :subtotal, :taxes, :shipping_fees, :total_amount, :currency,
            :shipping_name, :shipping_address, :shipping_city, :shipping_province,
            :shipping_postal_code, :shipping_country,
            :billing_name, :billing_address, :billing_city, :billing_province,
            :billing_postal_code, :billing_country,
            :invoice_date, :shipped_date, :delivered_date, :snipcart_data
        )";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($this->extractInvoiceData($orderData));
        
        return (int) $this->db->lastInsertId();
    }
    
    /**
     * Met à jour une facture existante
     */
    private function updateInvoice(int $invoiceId, array $orderData): int
    {
        $sql = "UPDATE user_invoices SET
            status = :status,
            payment_status = :payment_status,
            subtotal = :subtotal,
            taxes = :taxes,
            shipping_fees = :shipping_fees,
            total_amount = :total_amount,
            shipped_date = :shipped_date,
            delivered_date = :delivered_date,
            snipcart_data = :snipcart_data,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = :invoice_id";
        
        $data = $this->extractInvoiceData($orderData);
        $data['invoice_id'] = $invoiceId;
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($data);
        
        return $invoiceId;
    }
    
    /**
     * Synchronise les articles d'une facture
     */
    private function syncInvoiceItems(int $invoiceId, array $items): void
    {
        // Supprimer les anciens articles pour éviter les doublons
        $this->db->prepare("DELETE FROM invoice_items WHERE invoice_id = ?")
                 ->execute([$invoiceId]);
        
        foreach ($items as $item) {
            $this->createInvoiceItem($invoiceId, $item);
        }
    }
    
    /**
     * Crée un article de facture
     */
    private function createInvoiceItem(int $invoiceId, array $itemData): void
    {
        $sql = "INSERT INTO invoice_items (
            invoice_id, product_id, product_name, product_category,
            unit_price, quantity, total_price, product_variant, custom_fields
        ) VALUES (
            :invoice_id, :product_id, :product_name, :product_category,
            :unit_price, :quantity, :total_price, :product_variant, :custom_fields
        )";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'invoice_id' => $invoiceId,
            'product_id' => $itemData['id'] ?? '',
            'product_name' => $itemData['name'] ?? 'Produit inconnu',
            'product_category' => $this->categorizeProduct($itemData['id'] ?? ''),
            'unit_price' => $itemData['price'] ?? 0,
            'quantity' => $itemData['quantity'] ?? 1,
            'total_price' => $itemData['totalPrice'] ?? $itemData['price'] ?? 0,
            'product_variant' => $this->extractVariant($itemData),
            'custom_fields' => json_encode($itemData['customFields'] ?? [])
        ]);
    }
    
    /**
     * Lie une facture à un utilisateur par email
     */
    private function linkToUser(int $invoiceId, string $email): void
    {
        if (empty($email)) return;
        
        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            $this->db->prepare("UPDATE user_invoices SET user_id = ? WHERE id = ?")
                     ->execute([$user['id'], $invoiceId]);
        }
    }
    
    /**
     * Récupère les factures d'un utilisateur
     */
    public function getUserInvoices(int $userId, int $limit = 50, int $offset = 0): array
    {
        $sql = "SELECT ui.*, 
                GROUP_CONCAT(ii.product_name, ', ') as products_summary,
                COUNT(ii.id) as item_count
            FROM user_invoices ui
            LEFT JOIN invoice_items ii ON ui.id = ii.invoice_id
            WHERE ui.user_id = ?
            GROUP BY ui.id
            ORDER BY ui.invoice_date DESC
            LIMIT ? OFFSET ?";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId, $limit, $offset]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Récupère une facture par son ID Snipcart
     */
    public function getInvoiceByOrderId(string $orderId): ?array
    {
        if (empty($orderId)) return null;
        
        $stmt = $this->db->prepare("SELECT * FROM user_invoices WHERE snipcart_order_id = ?");
        $stmt->execute([$orderId]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }
    
    /**
     * Récupère une facture complète avec ses articles
     */
    public function getInvoiceDetails(int $invoiceId, ?int $userId = null): ?array
    {
        $sql = "SELECT * FROM user_invoices WHERE id = ?";
        $params = [$invoiceId];
        
        if ($userId !== null) {
            $sql .= " AND user_id = ?";
            $params[] = $userId;
        }
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $invoice = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$invoice) return null;
        
        // Récupérer les articles
        $stmt = $this->db->prepare("SELECT * FROM invoice_items WHERE invoice_id = ?");
        $stmt->execute([$invoiceId]);
        $invoice['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return $invoice;
    }
    
    /**
     * Extrait les données de facture depuis Snipcart
     */
    private function extractInvoiceData(array $orderData): array
    {
        $shipping = $orderData['shippingInformation'] ?? [];
        $billing = $orderData['billingInformation'] ?? $shipping;
        
        return [
            'snipcart_order_id' => $orderData['token'] ?? '',
            'snipcart_token' => $orderData['token'] ?? '',
            'customer_email' => $orderData['email'] ?? '',
            'customer_name' => trim(($orderData['user']['billingFirstName'] ?? '') . ' ' . 
                                   ($orderData['user']['billingLastName'] ?? '')),
            'order_number' => $orderData['invoiceNumber'] ?? $orderData['token'] ?? '',
            'status' => $orderData['status'] ?? 'InProgress',
            'payment_status' => $orderData['paymentStatus'] ?? 'Pending',
            
            'subtotal' => $orderData['subtotal'] ?? 0,
            'taxes' => $orderData['taxes'] ?? 0,
            'shipping_fees' => $orderData['shippingFees'] ?? 0,
            'total_amount' => $orderData['total'] ?? 0,
            'currency' => $orderData['currency'] ?? 'CAD',
            
            'shipping_name' => $shipping['fullName'] ?? '',
            'shipping_address' => ($shipping['address1'] ?? '') . ' ' . ($shipping['address2'] ?? ''),
            'shipping_city' => $shipping['city'] ?? '',
            'shipping_province' => $shipping['province'] ?? '',
            'shipping_postal_code' => $shipping['postalCode'] ?? '',
            'shipping_country' => $shipping['country'] ?? 'CA',
            
            'billing_name' => $billing['fullName'] ?? '',
            'billing_address' => ($billing['address1'] ?? '') . ' ' . ($billing['address2'] ?? ''),
            'billing_city' => $billing['city'] ?? '',
            'billing_province' => $billing['province'] ?? '',
            'billing_postal_code' => $billing['postalCode'] ?? '',
            'billing_country' => $billing['country'] ?? 'CA',
            
            'invoice_date' => $orderData['creationDate'] ?? date('Y-m-d H:i:s'),
            'shipped_date' => $this->parseDateOrNull($orderData['shippedOn'] ?? null),
            'delivered_date' => $this->parseDateOrNull($orderData['deliveredOn'] ?? null),
            'snipcart_data' => json_encode($orderData)
        ];
    }
    
    /**
     * Catégorise un produit selon son ID
     */
    private function categorizeProduct(string $productId): string
    {
        if (str_contains($productId, 'lot')) return 'pieces';
        if (str_contains($productId, 'arsenal') || str_contains($productId, 'butins') || str_contains($productId, 'routes')) return 'cartes';
        if (str_contains($productId, 'triptyque')) return 'triptyques';
        
        return 'autre';
    }
    
    /**
     * Extrait la variante du produit (multiplicateur, langue)
     */
    private function extractVariant(array $itemData): ?string
    {
        $customFields = $itemData['customFields'] ?? [];
        $variants = [];
        
        if (isset($customFields['multiplicateur'])) {
            $variants[] = $customFields['multiplicateur'];
        }
        if (isset($customFields['langue'])) {
            $variants[] = $customFields['langue'];
        }
        
        return !empty($variants) ? implode(', ', $variants) : null;
    }
    
    /**
     * Parse une date ou retourne null
     */
    private function parseDateOrNull(?string $date): ?string
    {
        if (!$date) return null;
        
        $timestamp = strtotime($date);
        return $timestamp ? date('Y-m-d H:i:s', $timestamp) : null;
    }
}