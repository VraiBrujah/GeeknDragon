<?php

declare(strict_types=1);

namespace App\Snipcart;

/**
 * Webhook d'expédition Snipcart
 * Calcule les tarifs d'expédition selon la destination et le panier
 */
final class ShippingWebhook
{
    public static function handle(): void
    {
        try {
            SnipcartValidator::validateWebhookRequest();
            
            $payload = json_decode(file_get_contents('php://input'), true) ?: [];
            $content = $payload['content'] ?? [];
            
            // Données de la commande
            $shippingAddress = $content['shippingAddress'] ?? [];
            $items = $content['items'] ?? [];
            $subtotal = (float)($content['subtotal'] ?? 0);
            
            // Adresse de livraison
            $province = strtoupper($shippingAddress['province'] ?? '');
            $country = strtoupper($shippingAddress['country'] ?? 'CA');
            $city = $shippingAddress['city'] ?? '';
            
            // Calcul du poids total
            $totalWeight = self::calculateTotalWeight($items);
            
            // Tarifs d'expédition
            $rates = self::calculateShippingRates($country, $province, $city, $subtotal, $totalWeight);
            
            // Logging pour diagnostic
            error_log('Snipcart Shipping Webhook: ' . json_encode([
                'country' => $country,
                'province' => $province,
                'subtotal' => $subtotal,
                'weight' => $totalWeight,
                'rates_count' => count($rates)
            ]));
            
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['rates' => $rates], JSON_UNESCAPED_UNICODE);
            
        } catch (\Exception $e) {
            error_log('Erreur webhook expédition: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Erreur lors du calcul des frais d\'expédition']);
        }
    }
    
    /**
     * Calcule les tarifs d'expédition selon la destination
     */
    private static function calculateShippingRates(string $country, string $province, string $city, float $subtotal, float $weight): array
    {
        $rates = [];
        
        if ($country === 'CA') {
            // Canada
            if ($province === 'QC') {
                // Québec - Livraison gratuite ≥ 75$
                if ($subtotal >= 75.00) {
                    $rates[] = [
                        'cost' => 0,
                        'description' => 'Livraison gratuite au Québec (≥ 75 $)',
                        'guaranteedDaysToDelivery' => 3
                    ];
                } else {
                    $rates[] = [
                        'cost' => 899, // 8.99$ en cents
                        'description' => 'Standard Québec (2-4 jours ouvrables)',
                        'guaranteedDaysToDelivery' => 4
                    ];
                }
                
                $rates[] = [
                    'cost' => 1499, // 14.99$ en cents
                    'description' => 'Express Québec (1-2 jours ouvrables)',
                    'guaranteedDaysToDelivery' => 2
                ];
                
            } else {
                // Autres provinces canadiennes
                $baseCost = self::getCanadianProvincialRate($province, $weight);
                
                $rates[] = [
                    'cost' => $baseCost,
                    'description' => "Standard Canada ({$province}) - 3-7 jours",
                    'guaranteedDaysToDelivery' => 7
                ];
                
                $rates[] = [
                    'cost' => $baseCost + 1000, // +10$ pour express
                    'description' => "Express Canada ({$province}) - 2-4 jours",
                    'guaranteedDaysToDelivery' => 4
                ];
            }
            
        } else if ($country === 'US') {
            // États-Unis
            $baseCost = self::getUSShippingRate($weight);
            
            $rates[] = [
                'cost' => $baseCost,
                'description' => 'Standard USA - 7-14 jours',
                'guaranteedDaysToDelivery' => 14
            ];
            
            $rates[] = [
                'cost' => $baseCost + 2000, // +20$ pour express
                'description' => 'Express USA - 3-7 jours',
                'guaranteedDaysToDelivery' => 7
            ];
            
        } else {
            // International
            $baseCost = self::getInternationalShippingRate($weight);
            
            $rates[] = [
                'cost' => $baseCost,
                'description' => 'Standard International - 14-21 jours',
                'guaranteedDaysToDelivery' => 21
            ];
        }
        
        return $rates;
    }
    
    /**
     * Calcule le poids total du panier
     */
    private static function calculateTotalWeight(array $items): float
    {
        $totalWeight = 0.0;
        
        foreach ($items as $item) {
            $quantity = (int)($item['quantity'] ?? 1);
            $weight = (float)($item['weight'] ?? 0.1); // Poids par défaut: 100g
            $totalWeight += $quantity * $weight;
        }
        
        return max($totalWeight, 0.1); // Minimum 100g
    }
    
    /**
     * Tarifs pour les provinces canadiennes
     */
    private static function getCanadianProvincialRate(string $province, float $weight): int
    {
        $baseRates = [
            'ON' => 1299, // Ontario
            'BC' => 1599, // Colombie-Britannique
            'AB' => 1499, // Alberta
            'SK' => 1699, // Saskatchewan
            'MB' => 1699, // Manitoba
            'NB' => 1599, // Nouveau-Brunswick
            'NS' => 1599, // Nouvelle-Écosse
            'PE' => 1799, // Île-du-Prince-Édouard
            'NL' => 1999, // Terre-Neuve-et-Labrador
            'YT' => 2499, // Yukon
            'NT' => 2499, // Territoires du Nord-Ouest
            'NU' => 2999, // Nunavut
        ];
        
        $baseRate = $baseRates[$province] ?? 1699;
        
        // Supplément pour poids élevé (> 2kg)
        if ($weight > 2.0) {
            $extraWeight = $weight - 2.0;
            $weightSupplement = (int)(ceil($extraWeight) * 200); // 2$ par kg supplémentaire
            $baseRate += $weightSupplement;
        }
        
        return $baseRate;
    }
    
    /**
     * Tarifs pour les États-Unis
     */
    private static function getUSShippingRate(float $weight): int
    {
        $baseRate = 1999; // 19.99$ de base
        
        if ($weight > 1.0) {
            $extraWeight = $weight - 1.0;
            $weightSupplement = (int)(ceil($extraWeight) * 500); // 5$ par kg supplémentaire
            $baseRate += $weightSupplement;
        }
        
        return $baseRate;
    }
    
    /**
     * Tarifs internationaux
     */
    private static function getInternationalShippingRate(float $weight): int
    {
        $baseRate = 2999; // 29.99$ de base
        
        if ($weight > 1.0) {
            $extraWeight = $weight - 1.0;
            $weightSupplement = (int)(ceil($extraWeight) * 800); // 8$ par kg supplémentaire
            $baseRate += $weightSupplement;
        }
        
        return $baseRate;
    }
}