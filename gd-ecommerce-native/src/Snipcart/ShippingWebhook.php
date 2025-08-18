<?php

declare(strict_types=1);

namespace App\Snipcart;

/**
 * Webhook d'expédition Snipcart
 * Calcule et retourne les tarifs d'expédition selon l'adresse et le contenu du panier
 */
final class ShippingWebhook
{
    public static function handle(): void
    {
        try {
            self::validate();
            
            $payload = json_decode(file_get_contents('php://input'), true) ?: [];
            $content = $payload['content'] ?? [];
            
            // Informations du panier
            $subtotal = (float)($content['subtotal'] ?? 0);
            $itemsCount = (int)($content['itemsCount'] ?? 0);
            $totalWeight = (float)($content['totalWeight'] ?? 0);
            
            // Adresse de livraison
            $country = $content['shippingAddressCountry'] ?? 'CA';
            $province = $content['shippingAddressProvince'] ?? '';
            $postalCode = $content['shippingAddressPostalCode'] ?? '';
            
            $config = include __DIR__ . '/../../config/snipcart.php';
            $rates = [];
            
            // Livraison gratuite au Québec pour commandes ≥ 75$
            if ($country === 'CA' && $province === 'QC' && $subtotal >= $config['shipping']['free_shipping_threshold']) {
                $rates[] = [
                    'cost' => 0,
                    'description' => 'Livraison gratuite au Québec (≥ 75 $)',
                    'guaranteedDaysToDelivery' => 3
                ];
            }
            
            // Tarifs par défaut
            foreach ($config['shipping']['default_rates'] as $rate) {
                $cost = $rate['cost'];
                
                // Ajustement selon le poids/nombre d'articles
                if ($itemsCount > 10) {
                    $cost += 5.00; // Supplément pour gros volumes
                }
                
                if ($totalWeight > 2.0) {
                    $cost += ($totalWeight - 2.0) * 2.50; // Supplément poids
                }
                
                // Supplément international
                if ($country !== 'CA') {
                    $cost += 15.00;
                    $rate['guaranteedDaysToDelivery'] = ($rate['guaranteedDaysToDelivery'] ?? 5) + 5;
                    $rate['description'] .= ' (International)';
                }
                
                $rates[] = [
                    'cost' => round($cost * 100), // Snipcart attend les prix en cents
                    'description' => $rate['description'],
                    'guaranteedDaysToDelivery' => $rate['guaranteedDaysToDelivery'] ?? null
                ];
            }
            
            // Logging pour diagnostic
            error_log('Snipcart Shipping: ' . json_encode([
                'subtotal' => $subtotal,
                'country' => $country,
                'province' => $province,
                'rates_count' => count($rates)
            ]));
            
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['rates' => $rates], JSON_UNESCAPED_UNICODE);
            
        } catch (\Exception $e) {
            error_log('Erreur webhook expédition: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Erreur de calcul d\'expédition']);
        }
    }
    
    private static function validate(): void
    {
        SnipcartValidator::validateIncoming();
    }
}