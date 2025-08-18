<?php

declare(strict_types=1);

namespace App\Snipcart;

/**
 * Webhook des commandes Snipcart
 * Traite les événements de commande (création, mise à jour, etc.)
 */
final class OrderWebhook
{
    public static function handle(): void
    {
        try {
            self::validate();
            
            $payload = json_decode(file_get_contents('php://input'), true) ?: [];
            $eventType = $payload['eventName'] ?? '';
            $content = $payload['content'] ?? [];
            
            switch ($eventType) {
                case 'order.completed':
                    self::handleOrderCompleted($content);
                    break;
                    
                case 'order.status.changed':
                    self::handleOrderStatusChanged($content);
                    break;
                    
                case 'order.paymentStatus.changed':
                    self::handlePaymentStatusChanged($content);
                    break;
                    
                case 'order.trackingNumber.changed':
                    self::handleTrackingNumberChanged($content);
                    break;
                    
                default:
                    error_log("Événement Snipcart non géré: $eventType");
            }
            
            // Réponse de succès
            http_response_code(200);
            echo json_encode(['status' => 'processed']);
            
        } catch (\Exception $e) {
            error_log('Erreur webhook commande: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Erreur de traitement']);
        }
    }
    
    /**
     * Traite une commande complétée
     */
    private static function handleOrderCompleted(array $order): void
    {
        $orderId = $order['id'] ?? '';
        $email = $order['email'] ?? '';
        $total = $order['total'] ?? 0;
        $items = $order['items'] ?? [];
        
        // Logging de la commande
        error_log('Commande complétée: ' . json_encode([
            'order_id' => $orderId,
            'email' => $email,
            'total' => $total,
            'items_count' => count($items)
        ]));
        
        // Ici vous pouvez :
        // - Envoyer un email de confirmation personnalisé
        // - Mettre à jour votre système de gestion des stocks
        // - Déclencher des processus de fulfillment
        // - Intégrer avec des systèmes tiers (CRM, ERP, etc.)
        
        self::sendOrderConfirmation($order);
        self::updateInventory($items);
    }
    
    /**
     * Traite un changement de statut de commande
     */
    private static function handleOrderStatusChanged(array $order): void
    {
        $orderId = $order['id'] ?? '';
        $status = $order['status'] ?? '';
        
        error_log("Statut commande changé: $orderId -> $status");
        
        // Traitement selon le nouveau statut
        switch ($status) {
            case 'Processed':
                // Commande traitée, prête à expédier
                break;
                
            case 'Shipped':
                // Commande expédiée
                self::handleOrderShipped($order);
                break;
                
            case 'Delivered':
                // Commande livrée
                break;
                
            case 'Cancelled':
                // Commande annulée
                self::handleOrderCancelled($order);
                break;
        }
    }
    
    /**
     * Traite un changement de statut de paiement
     */
    private static function handlePaymentStatusChanged(array $order): void
    {
        $orderId = $order['id'] ?? '';
        $paymentStatus = $order['paymentStatus'] ?? '';
        
        error_log("Statut paiement changé: $orderId -> $paymentStatus");
        
        switch ($paymentStatus) {
            case 'Paid':
                // Paiement confirmé
                break;
                
            case 'Refunded':
                // Paiement remboursé
                break;
                
            case 'ChargedBack':
                // Litige/chargeback
                break;
        }
    }
    
    /**
     * Traite l'ajout d'un numéro de suivi
     */
    private static function handleTrackingNumberChanged(array $order): void
    {
        $orderId = $order['id'] ?? '';
        $trackingNumber = $order['trackingNumber'] ?? '';
        $trackingUrl = $order['trackingUrl'] ?? '';
        
        error_log("Numéro de suivi ajouté: $orderId -> $trackingNumber");
        
        // Envoyer email avec info de suivi
        if ($trackingNumber) {
            self::sendTrackingNotification($order);
        }
    }
    
    /**
     * Envoie un email de confirmation de commande personnalisé
     */
    private static function sendOrderConfirmation(array $order): void
    {
        // Implémentation de l'envoi d'email personnalisé
        // Vous pouvez utiliser SendGrid, PHPMailer, ou votre service préféré
        
        $to = $order['email'] ?? '';
        $orderId = $order['id'] ?? '';
        
        if ($to) {
            // Exemple avec mail() - remplacez par votre service d'email préféré
            $subject = "Confirmation de commande #$orderId - Geek & Dragon";
            $message = self::buildOrderConfirmationEmail($order);
            $headers = [
                'From: Geek & Dragon <noreply@geekndragon.com>',
                'Content-Type: text/html; charset=UTF-8'
            ];
            
            // mail($to, $subject, $message, implode("\r\n", $headers));
            error_log("Email de confirmation envoyé à: $to");
        }
    }
    
    /**
     * Met à jour l'inventaire après une commande
     */
    private static function updateInventory(array $items): void
    {
        foreach ($items as $item) {
            $productId = $item['id'] ?? '';
            $quantity = $item['quantity'] ?? 0;
            
            // Ici vous pourriez mettre à jour votre système d'inventaire
            error_log("Inventaire à décrémenter: $productId (-$quantity)");
        }
    }
    
    /**
     * Traite une commande expédiée
     */
    private static function handleOrderShipped(array $order): void
    {
        // Logique pour commande expédiée
        error_log('Commande expédiée: ' . ($order['id'] ?? ''));
    }
    
    /**
     * Traite une commande annulée
     */
    private static function handleOrderCancelled(array $order): void
    {
        // Logique pour commande annulée (remettre en stock, etc.)
        $items = $order['items'] ?? [];
        foreach ($items as $item) {
            $productId = $item['id'] ?? '';
            $quantity = $item['quantity'] ?? 0;
            error_log("Inventaire à remettre: $productId (+$quantity)");
        }
    }
    
    /**
     * Envoie une notification de suivi
     */
    private static function sendTrackingNotification(array $order): void
    {
        $to = $order['email'] ?? '';
        $trackingNumber = $order['trackingNumber'] ?? '';
        
        if ($to && $trackingNumber) {
            error_log("Notification de suivi envoyée à: $to (tracking: $trackingNumber)");
        }
    }
    
    /**
     * Construit l'email de confirmation HTML
     */
    private static function buildOrderConfirmationEmail(array $order): string
    {
        $orderId = $order['id'] ?? '';
        $items = $order['items'] ?? [];
        $total = $order['total'] ?? 0;
        
        $itemsHtml = '';
        foreach ($items as $item) {
            $name = htmlspecialchars($item['name'] ?? '');
            $quantity = $item['quantity'] ?? 1;
            $price = $item['price'] ?? 0;
            
            $itemsHtml .= "<tr>
                <td>$name</td>
                <td>$quantity</td>
                <td>$price $</td>
            </tr>";
        }
        
        return "
        <html>
        <body>
            <h1>🏰 Merci pour votre commande !</h1>
            <p>Votre commande #$orderId a été confirmée.</p>
            
            <h2>Articles commandés:</h2>
            <table border='1'>
                <tr><th>Article</th><th>Quantité</th><th>Prix</th></tr>
                $itemsHtml
            </table>
            
            <p><strong>Total: $total $</strong></p>
            
            <p>Nous vous tiendrons informé de l'avancement de votre commande.</p>
            
            <p>⚔️ L'équipe Geek & Dragon</p>
        </body>
        </html>";
    }
    
    private static function validate(): void
    {
        SnipcartValidator::validateIncoming();
    }
}