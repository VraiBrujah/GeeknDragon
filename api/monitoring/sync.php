<?php
/**
 * API de Synchronisation Monitoring - Geek & Dragon
 *
 * Endpoint pour recevoir les métriques du monitoring JavaScript côté client.
 * Traitement sécurisé et stockage local des données de performance.
 *
 * @author Brujah
 * @version 1.0.0
 * @since 2025-09-27
 */

// Headers de sécurité et CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . ($_SERVER['HTTP_HOST'] ?? '*'));
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Gestion des requêtes OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Seules les requêtes POST sont autorisées
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'erreur' => true,
        'message' => 'Méthode non autorisée. Utilisez POST.'
    ]);
    exit;
}

// Initialisation du système de logs
require_once __DIR__ . '/../../includes/logging-system.php';

try {
    // Configuration du système de logs pour l'API
    $configLogs = [
        'repertoire' => __DIR__ . '/../../logs',
        'niveau_minimum' => 'INFO',
        'debug' => false // Production mode pour l'API
    ];

    $systemeLog = LogManager::getInstance($configLogs);

    // Validation de la requête
    $input = file_get_contents('php://input');
    if (empty($input)) {
        throw new InvalidArgumentException('Corps de requête vide');
    }

    $donnees = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new InvalidArgumentException('JSON invalide : ' . json_last_error_msg());
    }

    // Validation des champs requis
    $champsRequis = ['session_id', 'metriques', 'timestamp'];
    foreach ($champsRequis as $champ) {
        if (!isset($donnees[$champ])) {
            throw new InvalidArgumentException("Champ requis manquant : {$champ}");
        }
    }

    $sessionId = $donnees['session_id'];
    $metriques = $donnees['metriques'];
    $timestampClient = $donnees['timestamp'];

    // Validation de la session ID
    if (!is_string($sessionId) || !preg_match('/^gd_\d+_[a-z0-9]+$/', $sessionId)) {
        throw new InvalidArgumentException('ID de session invalide');
    }

    // Validation des métriques
    if (!is_array($metriques)) {
        throw new InvalidArgumentException('Les métriques doivent être un tableau');
    }

    // Limitation du nombre de métriques par requête
    $limiteMetriques = 100;
    if (count($metriques) > $limiteMetriques) {
        throw new InvalidArgumentException("Trop de métriques ({count($metriques)}), maximum {$limiteMetriques}");
    }

    // Contexte enrichi pour les logs
    $contexteRequete = [
        'session_id' => $sessionId,
        'ip_client' => obtenirIpClient(),
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'inconnu',
        'timestamp_client' => $timestampClient,
        'nombre_metriques' => count($metriques),
        'taille_payload' => strlen($input)
    ];

    // Traitement et stockage des métriques
    $metriquesTraitees = 0;
    $metriquesErreur = 0;

    foreach ($metriques as $index => $metrique) {
        try {
            // Validation de la structure de la métrique
            if (!validerStructureMetrique($metrique)) {
                $metriquesErreur++;
                continue;
            }

            // Enrichissement de la métrique avec contexte serveur
            $metriqueEnrichie = enrichirMetrique($metrique, $contexteRequete);

            // Enregistrement via le système de logs
            $systemeLog->metrique(
                $metriqueEnrichie['nom'],
                $metriqueEnrichie['valeur'],
                $metriqueEnrichie['unite'],
                $metriqueEnrichie['tags']
            );

            $metriquesTraitees++;

            // Gestion spéciale pour certaines métriques critiques
            gererMetriquesCritiques($metriqueEnrichie, $systemeLog);

        } catch (Exception $e) {
            $metriquesErreur++;
            $systemeLog->warn("Erreur traitement métrique index {$index}", [
                'erreur' => $e->getMessage(),
                'metrique' => $metrique,
                'session_id' => $sessionId
            ]);
        }
    }

    // Log de la synchronisation
    $systemeLog->info('Synchronisation métriques client', [
        'session_id' => $sessionId,
        'metriques_traitees' => $metriquesTraitees,
        'metriques_erreur' => $metriquesErreur,
        'duree_traitement_ms' => round((microtime(true) - $_SERVER['REQUEST_TIME_FLOAT']) * 1000, 2)
    ]);

    // Réponse de succès
    http_response_code(200);
    echo json_encode([
        'succes' => true,
        'metriques_traitees' => $metriquesTraitees,
        'metriques_erreur' => $metriquesErreur,
        'timestamp_serveur' => time(),
        'session_id' => $sessionId
    ]);

} catch (InvalidArgumentException $e) {
    // Erreurs de validation (400 Bad Request)
    http_response_code(400);
    log_warn('Requête monitoring invalide', [
        'erreur' => $e->getMessage(),
        'ip' => obtenirIpClient(),
        'payload_size' => strlen($input ?? ''),
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'inconnu'
    ]);

    echo json_encode([
        'erreur' => true,
        'message' => $e->getMessage(),
        'code' => 'validation_error'
    ]);

} catch (Exception $e) {
    // Erreurs serveur (500 Internal Server Error)
    http_response_code(500);
    log_error('Erreur interne API monitoring', [
        'erreur' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'ip' => obtenirIpClient()
    ]);

    echo json_encode([
        'erreur' => true,
        'message' => 'Erreur interne du serveur',
        'code' => 'internal_error'
    ]);
}

// === FONCTIONS UTILITAIRES ===

/**
 * Valide la structure d'une métrique reçue du client
 *
 * @param mixed $metrique Métrique à valider
 * @return bool True si la structure est valide
 */
function validerStructureMetrique($metrique): bool
{
    // Doit être un tableau associatif
    if (!is_array($metrique)) {
        return false;
    }

    // Champs obligatoires
    $champsObligatoires = ['nom', 'valeur', 'tags'];
    foreach ($champsObligatoires as $champ) {
        if (!isset($metrique[$champ])) {
            return false;
        }
    }

    // Validation des types
    if (!is_string($metrique['nom']) || empty($metrique['nom'])) {
        return false;
    }

    if (!is_numeric($metrique['valeur'])) {
        return false;
    }

    if (!is_array($metrique['tags'])) {
        return false;
    }

    // Validation de la longueur du nom
    if (strlen($metrique['nom']) > 100) {
        return false;
    }

    // Validation de la valeur (ne doit pas être infinie ou NaN)
    $valeur = (float) $metrique['valeur'];
    if (!is_finite($valeur)) {
        return false;
    }

    // Validation du nombre de tags
    if (count($metrique['tags']) > 20) {
        return false;
    }

    return true;
}

/**
 * Enrichit une métrique avec le contexte serveur
 *
 * @param array $metrique Métrique de base
 * @param array $contexte Contexte de la requête
 * @return array Métrique enrichie
 */
function enrichirMetrique(array $metrique, array $contexte): array
{
    // Nettoyer et valider les tags
    $tagsNettoyes = [];
    foreach ($metrique['tags'] as $cle => $valeur) {
        // Convertir en string et limiter la taille
        $cleStr = substr((string) $cle, 0, 50);
        $valeurStr = substr((string) $valeur, 0, 200);

        // Supprimer les caractères potentiellement dangereux
        $cleStr = preg_replace('/[^\w\-_.]/', '_', $cleStr);
        $valeurStr = htmlspecialchars($valeurStr, ENT_QUOTES, 'UTF-8');

        if (!empty($cleStr)) {
            $tagsNettoyes[$cleStr] = $valeurStr;
        }
    }

    // Ajouter des tags système
    $tagsNettoyes['source'] = 'client_monitoring';
    $tagsNettoyes['ip_hash'] = substr(hash('sha256', $contexte['ip_client']), 0, 8); // IP hachée pour privacy
    $tagsNettoyes['session_short'] = substr($contexte['session_id'], -8); // Partie courte de la session
    $tagsNettoyes['timestamp_sync'] = time();

    return [
        'nom' => filter_var($metrique['nom'], FILTER_SANITIZE_STRING),
        'valeur' => (float) $metrique['valeur'],
        'unite' => isset($metrique['unite']) ? substr((string) $metrique['unite'], 0, 20) : '',
        'tags' => $tagsNettoyes
    ];
}

/**
 * Gère les métriques critiques nécessitant un traitement spécial
 *
 * @param array $metrique Métrique enrichie
 * @param SystemeLogsGeekDragon $systemeLog Instance du système de logs
 * @return void
 */
function gererMetriquesCritiques(array $metrique, SystemeLogsGeekDragon $systemeLog): void
{
    $nom = $metrique['nom'];
    $valeur = $metrique['valeur'];
    $tags = $metrique['tags'];

    // Erreurs JavaScript critiques
    if ($nom === 'erreur_javascript' && isset($tags['erreur_type'])) {
        $systemeLog->error('Erreur JavaScript côté client', [
            'type_erreur' => $tags['erreur_type'],
            'message_erreur' => $tags['erreur_message'] ?? 'Non spécifié',
            'page' => $tags['page'] ?? 'Inconnue',
            'session_id' => $tags['session_short'] ?? 'Inconnue'
        ]);
    }

    // Performance dégradée
    if (in_array($nom, ['lcp', 'fcp']) && $valeur > 4000) { // Plus de 4 secondes
        $systemeLog->warn('Performance dégradée détectée', [
            'metrique' => $nom,
            'valeur_ms' => $valeur,
            'page' => $tags['page'] ?? 'Inconnue',
            'navigateur' => $tags['navigateur'] ?? 'Inconnu'
        ]);
    }

    // Échec de chargement de ressources
    if ($nom === 'erreur_ressource') {
        $systemeLog->warn('Échec de chargement de ressource côté client', [
            'type_ressource' => $tags['type_ressource'] ?? 'Inconnu',
            'source' => $tags['source'] ?? 'Non spécifiée',
            'page' => $tags['page'] ?? 'Inconnue'
        ]);
    }

    // Conversions e-commerce importantes
    if ($nom === 'commande_completee') {
        $systemeLog->info('Commande e-commerce complétée', [
            'total' => $tags['total'] ?? 'Non spécifié',
            'nombre_articles' => $tags['nombre_articles'] ?? 'Non spécifié',
            'methode_paiement' => $tags['methode_paiement'] ?? 'Non spécifié',
            'session_id' => $tags['session_short'] ?? 'Inconnue'
        ]);
    }
}

/**
 * Obtient l'adresse IP du client en gérant les proxies
 *
 * @return string Adresse IP du client
 */
function obtenirIpClient(): string
{
    $headers = [
        'HTTP_CF_CONNECTING_IP',     // Cloudflare
        'HTTP_X_FORWARDED_FOR',      // Proxy standard
        'HTTP_X_REAL_IP',            // Nginx
        'HTTP_CLIENT_IP',            // Proxy
        'REMOTE_ADDR'                // Direct
    ];

    foreach ($headers as $header) {
        if (!empty($_SERVER[$header])) {
            $ips = explode(',', $_SERVER[$header]);
            $ip = trim($ips[0]);

            // Validation basique de l'IP
            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return $ip;
            }
        }
    }

    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}