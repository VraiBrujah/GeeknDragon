<?php
/**
 * Fonctions partagées pour la gestion du stock Snipcart
 * Évite la duplication de code entre boutique.php et product.php
 */

/**
 * Récupère le stock d'un produit depuis l'API Snipcart
 * @param string $id ID du produit
 * @return int|null Stock disponible ou null si non limité/erreur
 */
function getStock(string $id): ?int
{
    global $snipcartSecret;
    static $cache = [];
    
    if (isset($cache[$id])) {
        return $cache[$id];
    }
    
    if ($snipcartSecret) {
        $ch = curl_init('https://app.snipcart.com/api/inventory/' . urlencode($id));
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_USERPWD => $snipcartSecret . ':',
        ]);
        $res = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);
        
        if ($res === false || $status >= 400) {
            return $cache[$id] = null;
        }
        
        $inv = json_decode($res, true);
        return $cache[$id] = $inv['stock'] ?? $inv['available'] ?? null;
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