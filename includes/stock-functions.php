<?php
/**
 * Fonctions partagées pour la gestion du stock Snipcart
 * Évite la duplication de code entre boutique.php et product.php
 */

/**
 * Récupère le stock d'un produit depuis l'API Snipcart de manière sécurisée
 * @param string $id ID du produit
 * @return int|null Stock disponible ou null si non limité/erreur
 */
function getStock(string $id): ?int
{
    global $snipcartSecret;
    static $cache = [];
    
    // Validation de l'ID produit
    if (!$id || !preg_match('/^[a-zA-Z0-9_\-]+$/', $id)) {
        error_log("Invalid product ID: $id");
        return null;
    }
    
    if (isset($cache[$id])) {
        return $cache[$id];
    }
    
    if ($snipcartSecret && strlen($snipcartSecret) > 10) {
        $url = 'https://app.snipcart.com/api/inventory/' . urlencode($id);
        
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_USERPWD => $snipcartSecret . ':',
            // Sécurité SSL
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            // Timeouts pour éviter les blocages
            CURLOPT_TIMEOUT => 10,
            CURLOPT_CONNECTTIMEOUT => 5,
            // Headers sécurisés
            CURLOPT_HTTPHEADER => [
                'User-Agent: GeeknDragon/1.0',
                'Accept: application/json',
            ],
            // Limite de taille de réponse
            CURLOPT_MAXREDIRS => 3,
            CURLOPT_FOLLOWLOCATION => true,
        ]);
        
        $res = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        // Gestion d'erreurs détaillée
        if ($res === false) {
            error_log("Snipcart API error for $id: $error");
            return $cache[$id] = null;
        }
        
        if ($status >= 400) {
            error_log("Snipcart API HTTP error for $id: $status");
            return $cache[$id] = null;
        }
        
        // Validation JSON
        $inv = json_decode($res, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("Snipcart API JSON error for $id: " . json_last_error_msg());
            return $cache[$id] = null;
        }
        
        $stock = $inv['stock'] ?? $inv['available'] ?? null;
        return $cache[$id] = is_numeric($stock) ? (int)$stock : null;
    }
    
    return $cache[$id] = null;
}

/**
 * Vérifie si un produit est en stock
 * @param string $id ID du produit
 * @return bool true si en stock ou stock illimité
 */
function inStock(string $id): bool
{
    $stock = getStock($id);
    return $stock === null || $stock > 0;
}