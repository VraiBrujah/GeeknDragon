<?php

declare(strict_types=1);

namespace App\Snipcart;

use GeeknDragon\Cart\SnipcartClient;

/**
 * Webhook des commandes Snipcart
 * Traite les événements de commande (création, mise à jour, etc.)
 */
final class OrderWebhook
{
    public static function handle(): void
    {
        try {
            SnipcartValidator::validateWebhookRequest();
            
            $payload = json_decode(file_get_contents('php://input'), true) ?: [];
            $eventType = $payload['eventName'] ?? '';
            $content = $payload['content'] ?? [];
            
            // Traitement selon le type d'événement
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
            echo json_encode(['status' => 'processed'], JSON_UNESCAPED_UNICODE);
            
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
        $shippingAddress = $order['shippingAddress'] ?? [];
        
        // Logging détaillé de la commande
        error_log('Commande complétée: ' . json_encode([
            'order_id' => $orderId,
            'email' => $email,
            'total' => $total,
            'items_count' => count($items),
            'shipping_country' => $shippingAddress['country'] ?? '',
            'shipping_province' => $shippingAddress['province'] ?? '',
            'timestamp' => date('c')
        ]));
        
        // Actions post-commande
        self::sendOrderConfirmation($order);
        self::updateInventory($items);
        self::notifyAdmins($order);
        
        // Intégration possible avec systèmes tiers
        // self::syncWithCRM($order);
        // self::triggerFulfillment($order);
    }
    
    /**
     * Traite un changement de statut de commande
     */
    private static function handleOrderStatusChanged(array $order): void
    {
        $orderId = $order['id'] ?? '';
        $status = $order['status'] ?? '';
        $previousStatus = $order['previousStatus'] ?? '';
        
        error_log("Statut commande changé: $orderId -> $previousStatus => $status");
        
        // Actions selon le nouveau statut
        switch ($status) {
            case 'Processed':
                // Commande traitée, prête à expédier
                self::prepareForShipping($order);
                break;
                
            case 'Shipped':
                // Commande expédiée
                self::handleOrderShipped($order);
                break;
                
            case 'Delivered':
                // Commande livrée
                self::handleOrderDelivered($order);
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
        $previousPaymentStatus = $order['previousPaymentStatus'] ?? '';
        
        error_log("Statut paiement changé: $orderId -> $previousPaymentStatus => $paymentStatus");
        
        switch ($paymentStatus) {
            case 'Paid':
                // Paiement confirmé
                self::handlePaymentConfirmed($order);
                break;
                
            case 'Refunded':
                // Paiement remboursé
                self::handlePaymentRefunded($order);
                break;
                
            case 'ChargedBack':
                // Litige/chargeback
                self::handleChargeback($order);
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
        
        if ($trackingNumber) {
            self::sendTrackingNotification($order);
        }
    }
    
    /**
     * Envoie un email de confirmation de commande personnalisé
     */
    private static function sendOrderConfirmation(array $order): void
    {
        $to = $order['email'] ?? '';
        $orderId = $order['id'] ?? '';
        
        if (!$to) {
            return;
        }
        
        // Template d'email personnalisé pour GeekNDragon
        $subject = "🏰 Confirmation de commande #{$orderId} - Geek & Dragon";
        $message = self::buildOrderConfirmationEmail($order);
        
        // Headers avec thème medieval fantasy
        $headers = [
            'From: Geek & Dragon <' . ($_ENV['SMTP_USERNAME'] ?? 'noreply@geekndragon.com') . '>',
            'Reply-To: ' . ($_ENV['QUOTE_EMAIL'] ?? 'contact@geekndragon.com'),
            'Content-Type: text/html; charset=UTF-8',
            'X-Mailer: GeeknDragon-Snipcart/1.0'
        ];
        
        // Envoi via mail() ou service externe (SendGrid, etc.)
        if (function_exists('mail')) {
            mail($to, $subject, $message, implode("\r\n", $headers));
        }
        
        error_log("Email de confirmation envoyé à: $to pour commande: $orderId");
    }
    
    /**
     * Met à jour l'inventaire après une commande
     */
    private static function updateInventory(array $items): void
    {
        $client = self::createSnipcartClient();

        foreach ($items as $item) {
            $productId = $item['id'] ?? '';
            $quantity = (int)($item['quantity'] ?? 0);

            if (!$productId || $quantity <= 0) {
                continue;
            }

            try {
                $inventory = $client->getInventory($productId);
                $stock = (int)($inventory['stock'] ?? $inventory['available'] ?? 0);
                $client->updateInventory($productId, max(0, $stock - $quantity));
            } catch (\Throwable $e) {
                error_log('Erreur mise à jour inventaire: ' . $e->getMessage());
            }
        }
    }

    /**
     * Crée une instance sécurisée du client Snipcart
     */
    private static function createSnipcartClient(): SnipcartClient
    {
        $apiKey = $_ENV['SNIPCART_API_KEY'] ?? ($_SERVER['SNIPCART_API_KEY'] ?? '');
        $secret = $_ENV['SNIPCART_SECRET_API_KEY'] ?? ($_SERVER['SNIPCART_SECRET_API_KEY'] ?? '');
        $mock = (($_ENV['APP_ENV'] ?? $_SERVER['APP_ENV'] ?? 'production') === 'development');

        return new SnipcartClient($apiKey, $secret, $mock);
    }
    
    /**
     * Notification aux administrateurs
     */
    private static function notifyAdmins(array $order): void
    {
        $adminEmail = $_ENV['QUOTE_EMAIL'] ?? 'admin@geekndragon.com';
        $orderId = $order['id'] ?? '';
        $total = $order['total'] ?? 0;
        
        $subject = "🛒 Nouvelle commande #{$orderId} - {$total}$";
        $message = "Nouvelle commande reçue:\n\nCommande: #{$orderId}\nTotal: {$total}$\n\nConsulter le dashboard Snipcart pour plus de détails.";
        
        if (function_exists('mail')) {
            mail($adminEmail, $subject, $message);
        }
    }
    
    /**
     * Prépare la commande pour expédition
     */
    private static function prepareForShipping(array $order): void
    {
        $orderId = $order['id'] ?? '';
        error_log("Préparation expédition pour commande: $orderId");
        
        // Ici vous pourriez:
        // - Générer des étiquettes d'expédition
        // - Notifier l'équipe de fulfillment
        // - Créer des tâches dans un système de gestion
    }
    
    /**
     * Traite une commande expédiée
     */
    private static function handleOrderShipped(array $order): void
    {
        $orderId = $order['id'] ?? '';
        error_log("Commande expédiée: $orderId");
        
        // Notification client automatique déjà gérée par Snipcart
        // Mais vous pourriez ajouter des actions supplémentaires
    }
    
    /**
     * Traite une commande livrée
     */
    private static function handleOrderDelivered(array $order): void
    {
        $orderId = $order['id'] ?? '';
        error_log("Commande livrée: $orderId");
        
        // Démarrer un suivi post-livraison
        // Envoyer une demande d'avis client
    }
    
    /**
     * Traite une commande annulée
     */
    private static function handleOrderCancelled(array $order): void
    {
        $orderId = $order['id'] ?? '';
        $items = $order['items'] ?? [];

        $client = self::createSnipcartClient();

        foreach ($items as $item) {
            $productId = $item['id'] ?? '';
            $quantity = (int)($item['quantity'] ?? 0);

            if (!$productId || $quantity <= 0) {
                continue;
            }

            try {
                $inventory = $client->getInventory($productId);
                $stock = (int)($inventory['stock'] ?? $inventory['available'] ?? 0);
                $client->updateInventory($productId, $stock + $quantity);
            } catch (\Throwable $e) {
                error_log('Erreur remise inventaire: ' . $e->getMessage());
            }
        }
    }
    
    /**
     * Traite la confirmation de paiement
     */
    private static function handlePaymentConfirmed(array $order): void
    {
        $orderId = $order['id'] ?? '';
        error_log("Paiement confirmé pour commande: $orderId");
    }
    
    /**
     * Traite un remboursement
     */
    private static function handlePaymentRefunded(array $order): void
    {
        $orderId = $order['id'] ?? '';
        $refundedAmount = $order['refundedAmount'] ?? 0;
        error_log("Remboursement traité: $orderId - {$refundedAmount}$");
    }
    
    /**
     * Traite un chargeback
     */
    private static function handleChargeback(array $order): void
    {
        $orderId = $order['id'] ?? '';
        error_log("Chargeback détecté: $orderId - ATTENTION REQUISE");
        
        // Notifier immédiatement les administrateurs
        $adminEmail = $_ENV['QUOTE_EMAIL'] ?? 'admin@geekndragon.com';
        if (function_exists('mail')) {
            mail($adminEmail, "🚨 CHARGEBACK - Commande #{$orderId}", "Un chargeback a été détecté sur la commande #{$orderId}. Action immédiate requise.");
        }
    }
    
    /**
     * Envoie une notification de suivi
     */
    private static function sendTrackingNotification(array $order): void
    {
        $to = $order['email'] ?? '';
        $orderId = $order['id'] ?? '';
        $trackingNumber = $order['trackingNumber'] ?? '';
        $trackingUrl = $order['trackingUrl'] ?? '';
        
        if (!$to || !$trackingNumber) {
            return;
        }
        
        $subject = "📦 Votre commande #{$orderId} est en route !";
        $message = self::buildTrackingNotificationEmail($order);
        
        $headers = [
            'From: Geek & Dragon <' . ($_ENV['SMTP_USERNAME'] ?? 'noreply@geekndragon.com') . '>',
            'Content-Type: text/html; charset=UTF-8'
        ];
        
        if (function_exists('mail')) {
            mail($to, $subject, $message, implode("\r\n", $headers));
        }
        
        error_log("Notification de suivi envoyée à: $to (tracking: $trackingNumber)");
    }
    
    /**
     * Construit l'email de confirmation HTML avec thème DnD
     */
    private static function buildOrderConfirmationEmail(array $order): string
    {
        $orderId = $order['id'] ?? '';
        $items = $order['items'] ?? [];
        $total = $order['total'] ?? 0;
        $subtotal = $order['subtotal'] ?? 0;
        $shippingFees = $order['shippingFees'] ?? 0;
        $taxesTotal = $order['taxesTotal'] ?? 0;
        $shippingAddress = $order['shippingAddress'] ?? [];
        
        $itemsHtml = '';
        foreach ($items as $item) {
            $name = htmlspecialchars($item['name'] ?? '', ENT_QUOTES, 'UTF-8');
            $quantity = (int)($item['quantity'] ?? 1);
            $price = (float)($item['price'] ?? 0);
            $variants = '';
            
            // Afficher les variantes (multiplicateurs, langues, etc.)
            if (!empty($item['customFields'])) {
                $variantsList = [];
                foreach ($item['customFields'] as $field) {
                    $variantsList[] = htmlspecialchars($field['name'] ?? '', ENT_QUOTES, 'UTF-8') . ': ' . htmlspecialchars($field['value'] ?? '', ENT_QUOTES, 'UTF-8');
                }
                if (!empty($variantsList)) {
                    $variants = '<small style="color: #666;">(' . implode(', ', $variantsList) . ')</small>';
                }
            }
            
            $itemsHtml .= "
                <tr>
                    <td style='padding: 10px; border-bottom: 1px solid #eee;'>
                        <strong>{$name}</strong><br>
                        {$variants}
                    </td>
                    <td style='padding: 10px; border-bottom: 1px solid #eee; text-align: center;'>{$quantity}</td>
                    <td style='padding: 10px; border-bottom: 1px solid #eee; text-align: right;'>" . number_format($price, 2) . " $</td>
                </tr>";
        }
        
        $shippingHtml = '';
        if (!empty($shippingAddress)) {
            $shippingHtml = "
                <h3>📍 Adresse de livraison</h3>
                <p>
                    " . htmlspecialchars($shippingAddress['fullName'] ?? '', ENT_QUOTES, 'UTF-8') . "<br>
                    " . htmlspecialchars($shippingAddress['address1'] ?? '', ENT_QUOTES, 'UTF-8') . "<br>
                    " . htmlspecialchars($shippingAddress['city'] ?? '', ENT_QUOTES, 'UTF-8') . ", " . htmlspecialchars($shippingAddress['province'] ?? '', ENT_QUOTES, 'UTF-8') . " " . htmlspecialchars($shippingAddress['postalCode'] ?? '', ENT_QUOTES, 'UTF-8') . "<br>
                    " . htmlspecialchars($shippingAddress['country'] ?? '', ENT_QUOTES, 'UTF-8') . "
                </p>";
        }
        
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <title>Confirmation de commande - Geek & Dragon</title>
        </head>
        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>
            <div style='text-align: center; margin-bottom: 30px;'>
                <h1 style='color: #8B4513;'>🏰 Geek & Dragon</h1>
                <h2 style='color: #2E7D32;'>Merci pour votre commande !</h2>
            </div>
            
            <div style='background: #f9f9f9; padding: 20px; margin-bottom: 20px; border-radius: 5px;'>
                <h3>📋 Commande #{$orderId}</h3>
                <p>Votre commande a été confirmée et sera traitée dans les plus brefs délais.</p>
            </div>
            
            <h3>🛒 Articles commandés</h3>
            <table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>
                <thead>
                    <tr style='background: #f5f5f5;'>
                        <th style='padding: 10px; text-align: left; border-bottom: 2px solid #ddd;'>Article</th>
                        <th style='padding: 10px; text-align: center; border-bottom: 2px solid #ddd;'>Qté</th>
                        <th style='padding: 10px; text-align: right; border-bottom: 2px solid #ddd;'>Prix</th>
                    </tr>
                </thead>
                <tbody>
                    {$itemsHtml}
                </tbody>
            </table>
            
            <div style='text-align: right; margin-bottom: 20px;'>
                <p><strong>Sous-total: " . number_format($subtotal, 2) . " $</strong></p>
                " . ($shippingFees > 0 ? "<p>Expédition: " . number_format($shippingFees, 2) . " $</p>" : "<p style='color: #2E7D32;'>Expédition: Gratuite</p>") . "
                " . ($taxesTotal > 0 ? "<p>Taxes: " . number_format($taxesTotal, 2) . " $</p>" : "") . "
                <p style='font-size: 1.2em; color: #8B4513;'><strong>Total: " . number_format($total, 2) . " $</strong></p>
            </div>
            
            {$shippingHtml}
            
            <div style='background: #e8f5e8; padding: 15px; margin: 20px 0; border-radius: 5px;'>
                <h3>📦 Prochaines étapes</h3>
                <p>• Nous préparons votre commande<br>
                • Vous recevrez un email avec le numéro de suivi<br>
                • Livraison estimée selon la méthode choisie</p>
            </div>
            
            <div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;'>
                <p>Des questions ? Contactez-nous à <a href='mailto:" . ($_ENV['QUOTE_EMAIL'] ?? 'contact@geekndragon.com') . "'>" . ($_ENV['QUOTE_EMAIL'] ?? 'contact@geekndragon.com') . "</a></p>
                <p style='color: #666; font-size: 0.9em;'>⚔️ L'équipe Geek & Dragon vous souhaite d'excellentes aventures ! 🐉</p>
            </div>
        </body>
        </html>";
    }
    
    /**
     * Construit l'email de notification de suivi
     */
    private static function buildTrackingNotificationEmail(array $order): string
    {
        $orderId = $order['id'] ?? '';
        $trackingNumber = $order['trackingNumber'] ?? '';
        $trackingUrl = $order['trackingUrl'] ?? '';
        
        $trackingLink = $trackingUrl ? 
            "<a href='{$trackingUrl}' style='background: #2E7D32; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Suivre ma commande</a>" :
            "<strong>Numéro de suivi: {$trackingNumber}</strong>";
        
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <title>Suivi de commande - Geek & Dragon</title>
        </head>
        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>
            <div style='text-align: center; margin-bottom: 30px;'>
                <h1 style='color: #8B4513;'>🏰 Geek & Dragon</h1>
                <h2 style='color: #2E7D32;'>📦 Votre commande est en route !</h2>
            </div>
            
            <div style='background: #f9f9f9; padding: 20px; margin-bottom: 20px; border-radius: 5px; text-align: center;'>
                <h3>Commande #{$orderId}</h3>
                <p>Votre commande a été expédiée et est maintenant en transit.</p>
                <p style='margin: 20px 0;'>{$trackingLink}</p>
            </div>
            
            <div style='background: #e8f5e8; padding: 15px; margin: 20px 0; border-radius: 5px;'>
                <p><strong>💡 Conseil :</strong> Gardez ce numéro de suivi précieusement. Il vous permettra de suivre votre commande jusqu'à la livraison.</p>
            </div>
            
            <div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;'>
                <p>Des questions ? Contactez-nous à <a href='mailto:" . ($_ENV['QUOTE_EMAIL'] ?? 'contact@geekndragon.com') . "'>" . ($_ENV['QUOTE_EMAIL'] ?? 'contact@geekndragon.com') . "</a></p>
                <p style='color: #666; font-size: 0.9em;'>⚔️ L'équipe Geek & Dragon</p>
            </div>
        </body>
        </html>";
    }
}