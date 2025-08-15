<?php
/**
 * Utilitaires de validation pour Geek & Dragon
 */

class Validator {
    
    /**
     * Valide une adresse email
     */
    public static function email($email) {
        if (!is_string($email)) {
            return false;
        }
        
        $email = trim($email);
        if (empty($email) || strlen($email) > 254) {
            return false;
        }
        
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    /**
     * Valide un nom (autorise lettres, espaces, tirets, apostrophes)
     */
    public static function name($name, $minLength = 2, $maxLength = 100) {
        if (!is_string($name)) {
            return false;
        }
        
        $name = trim($name);
        $length = mb_strlen($name, 'UTF-8');
        
        if ($length < $minLength || $length > $maxLength) {
            return false;
        }
        
        // Permet lettres unicode, espaces, tirets et apostrophes
        return preg_match('/^[\p{L}\s\-\'\.]+$/u', $name);
    }
    
    /**
     * Valide un message/texte libre
     */
    public static function message($message, $minLength = 10, $maxLength = 5000) {
        if (!is_string($message)) {
            return false;
        }
        
        $message = trim($message);
        $length = mb_strlen($message, 'UTF-8');
        
        return $length >= $minLength && $length <= $maxLength;
    }
    
    /**
     * Nettoie et valide un paramètre URL
     */
    public static function urlParam($param, $allowedChars = '/^[a-zA-Z0-9_-]+$/', $maxLength = 50) {
        if (!is_string($param)) {
            return null;
        }
        
        $param = trim($param);
        
        if (empty($param) || strlen($param) > $maxLength) {
            return null;
        }
        
        return preg_match($allowedChars, $param) ? $param : null;
    }
    
    /**
     * Valide un token CSRF
     */
    public static function csrfToken($token, $sessionToken) {
        if (!is_string($token) || !is_string($sessionToken)) {
            return false;
        }
        
        return hash_equals($sessionToken, $token);
    }
    
    /**
     * Nettoie et valide une langue
     */
    public static function language($lang, $allowedLangs = ['fr', 'en']) {
        if (!is_string($lang)) {
            return null;
        }
        
        $lang = trim(strtolower($lang));
        
        return in_array($lang, $allowedLangs, true) ? $lang : null;
    }
    
    /**
     * Valide un numéro de téléphone (format international basique)
     */
    public static function phone($phone) {
        if (!is_string($phone)) {
            return false;
        }
        
        $phone = trim($phone);
        // Retire espaces, tirets, parenthèses, points
        $cleanPhone = preg_replace('/[\s\-\(\)\.]+/', '', $phone);
        
        // Format international basique : + suivi de 7-15 chiffres
        return preg_match('/^\+[1-9]\d{6,14}$/', $cleanPhone);
    }
    
    /**
     * Sanitise du HTML (garde seulement les balises sûres)
     */
    public static function sanitizeHtml($html) {
        if (!is_string($html)) {
            return '';
        }
        
        // Balises autorisées pour du contenu basique
        $allowedTags = '<p><br><strong><em><u><a><ul><ol><li>';
        
        return strip_tags($html, $allowedTags);
    }
}