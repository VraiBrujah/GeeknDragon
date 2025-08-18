<?php

declare(strict_types=1);

namespace App\Snipcart;

/**
 * Webhook de calcul des taxes Snipcart
 * Calcule les taxes canadiennes (TPS/TVQ/TVH) selon la province
 */
final class TaxesWebhook
{
    public static function handle(): void
    {
        try {
            SnipcartValidator::validateWebhookRequest();
            
            $payload = json_decode(file_get_contents('php://input'), true) ?: [];
            $content = $payload['content'] ?? [];
            
            // Adresse de facturation/livraison
            $shippingAddress = $content['shippingAddress'] ?? [];
            $billingAddress = $content['billingAddress'] ?? $shippingAddress;
            
            $country = strtoupper($billingAddress['country'] ?? 'CA');
            $province = strtoupper($billingAddress['province'] ?? '');
            
            // Calcul des taxes
            $taxes = self::calculateTaxes($country, $province);
            
            // Logging pour diagnostic
            error_log('Snipcart Taxes Webhook: ' . json_encode([
                'country' => $country,
                'province' => $province,
                'taxes_count' => count($taxes)
            ]));
            
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['taxes' => $taxes], JSON_UNESCAPED_UNICODE);
            
        } catch (\Exception $e) {
            error_log('Erreur webhook taxes: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Erreur lors du calcul des taxes']);
        }
    }
    
    /**
     * Calcule les taxes selon le pays et la province
     */
    private static function calculateTaxes(string $country, string $province): array
    {
        $taxes = [];
        
        if ($country === 'CA') {
            // Canada - Système de taxes par province
            $taxes = self::getCanadianTaxes($province);
        } else {
            // Autres pays - pas de taxes (à adapter selon vos besoins)
            $taxes = [];
        }
        
        return $taxes;
    }
    
    /**
     * Retourne les taxes canadiennes selon la province
     */
    private static function getCanadianTaxes(string $province): array
    {
        $taxes = [];
        
        switch ($province) {
            case 'QC': // Québec
                $taxes[] = [
                    'name' => 'TPS',
                    'rate' => 0.05, // 5%
                    'includedInPrice' => false,
                    'appliesOnShipping' => true
                ];
                $taxes[] = [
                    'name' => 'TVQ',
                    'rate' => 0.09975, // 9.975%
                    'includedInPrice' => false,
                    'appliesOnShipping' => true
                ];
                break;
                
            case 'ON': // Ontario
                $taxes[] = [
                    'name' => 'TVH',
                    'rate' => 0.13, // 13%
                    'includedInPrice' => false,
                    'appliesOnShipping' => true
                ];
                break;
                
            case 'BC': // Colombie-Britannique
                $taxes[] = [
                    'name' => 'TPS',
                    'rate' => 0.05, // 5%
                    'includedInPrice' => false,
                    'appliesOnShipping' => true
                ];
                $taxes[] = [
                    'name' => 'TVP C.-B.',
                    'rate' => 0.07, // 7%
                    'includedInPrice' => false,
                    'appliesOnShipping' => false // PST ne s'applique pas sur l'expédition en C.-B.
                ];
                break;
                
            case 'AB': // Alberta
                $taxes[] = [
                    'name' => 'TPS',
                    'rate' => 0.05, // 5%
                    'includedInPrice' => false,
                    'appliesOnShipping' => true
                ];
                // Pas de taxe provinciale en Alberta
                break;
                
            case 'SK': // Saskatchewan
                $taxes[] = [
                    'name' => 'TPS',
                    'rate' => 0.05, // 5%
                    'includedInPrice' => false,
                    'appliesOnShipping' => true
                ];
                $taxes[] = [
                    'name' => 'TVP Sask.',
                    'rate' => 0.06, // 6%
                    'includedInPrice' => false,
                    'appliesOnShipping' => true
                ];
                break;
                
            case 'MB': // Manitoba
                $taxes[] = [
                    'name' => 'TPS',
                    'rate' => 0.05, // 5%
                    'includedInPrice' => false,
                    'appliesOnShipping' => true
                ];
                $taxes[] = [
                    'name' => 'TVP Man.',
                    'rate' => 0.07, // 7%
                    'includedInPrice' => false,
                    'appliesOnShipping' => true
                ];
                break;
                
            case 'NB': // Nouveau-Brunswick
            case 'NL': // Terre-Neuve-et-Labrador
            case 'NS': // Nouvelle-Écosse
            case 'PE': // Île-du-Prince-Édouard
                $taxes[] = [
                    'name' => 'TVH',
                    'rate' => 0.15, // 15%
                    'includedInPrice' => false,
                    'appliesOnShipping' => true
                ];
                break;
                
            case 'YT': // Yukon
            case 'NT': // Territoires du Nord-Ouest
            case 'NU': // Nunavut
                $taxes[] = [
                    'name' => 'TPS',
                    'rate' => 0.05, // 5%
                    'includedInPrice' => false,
                    'appliesOnShipping' => true
                ];
                // Pas de taxe territoriale
                break;
                
            default:
                // Province non reconnue - TPS par défaut
                $taxes[] = [
                    'name' => 'TPS',
                    'rate' => 0.05, // 5%
                    'includedInPrice' => false,
                    'appliesOnShipping' => true
                ];
                break;
        }
        
        return $taxes;
    }
}