<?php

declare(strict_types=1);

namespace App\Snipcart;

/**
 * Webhook de taxes Snipcart
 * Calcule les taxes selon l'adresse de livraison
 */
final class TaxesWebhook
{
    public static function handle(): void
    {
        try {
            self::validate();
            
            $payload = json_decode(file_get_contents('php://input'), true) ?: [];
            $content = $payload['content'] ?? [];
            
            $country = $content['shippingAddressCountry'] ?? 'CA';
            $province = $content['shippingAddressProvince'] ?? '';
            
            $config = include __DIR__ . '/../../config/snipcart.php';
            $taxes = [];
            
            // Taxes canadiennes
            if ($country === 'CA') {
                // TPS fédérale (partout au Canada)
                $taxes[] = [
                    'name' => 'TPS',
                    'rate' => $config['taxes']['canada']['tps'],
                    'includedInPrice' => false,
                    'appliesOnShipping' => true
                ];
                
                // Taxes provinciales
                switch ($province) {
                    case 'QC': // Québec
                        $taxes[] = [
                            'name' => 'TVQ',
                            'rate' => $config['taxes']['canada']['tvq'],
                            'includedInPrice' => false,
                            'appliesOnShipping' => true
                        ];
                        break;
                        
                    case 'ON': // Ontario
                        // Remplacer TPS par TVH
                        $taxes = [
                            [
                                'name' => 'TVH',
                                'rate' => 0.13, // 13% TVH
                                'includedInPrice' => false,
                                'appliesOnShipping' => true
                            ]
                        ];
                        break;
                        
                    case 'BC': // Colombie-Britannique
                        $taxes[] = [
                            'name' => 'TVP',
                            'rate' => 0.07,
                            'includedInPrice' => false,
                            'appliesOnShipping' => true
                        ];
                        break;
                        
                    case 'SK': // Saskatchewan
                        $taxes[] = [
                            'name' => 'TVP',
                            'rate' => 0.06,
                            'includedInPrice' => false,
                            'appliesOnShipping' => true
                        ];
                        break;
                        
                    case 'MB': // Manitoba
                        $taxes[] = [
                            'name' => 'TVP',
                            'rate' => 0.07,
                            'includedInPrice' => false,
                            'appliesOnShipping' => true
                        ];
                        break;
                        
                    case 'AB': // Alberta - pas de taxe provinciale
                    case 'NT': // Territoires du Nord-Ouest
                    case 'NU': // Nunavut
                    case 'YT': // Yukon
                        // Seulement TPS fédérale
                        break;
                        
                    case 'NB': // Nouveau-Brunswick
                    case 'NL': // Terre-Neuve-et-Labrador
                    case 'NS': // Nouvelle-Écosse
                    case 'PE': // Île-du-Prince-Édouard
                        // Remplacer TPS par TVH
                        $taxes = [
                            [
                                'name' => 'TVH',
                                'rate' => 0.15, // 15% TVH
                                'includedInPrice' => false,
                                'appliesOnShipping' => true
                            ]
                        ];
                        break;
                }
            }
            
            // Logging pour diagnostic
            error_log('Snipcart Taxes: ' . json_encode([
                'country' => $country,
                'province' => $province,
                'taxes_count' => count($taxes)
            ]));
            
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['taxes' => $taxes], JSON_UNESCAPED_UNICODE);
            
        } catch (\Exception $e) {
            error_log('Erreur webhook taxes: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Erreur de calcul de taxes']);
        }
    }
    
    private static function validate(): void
    {
        SnipcartValidator::validateIncoming();
    }
}