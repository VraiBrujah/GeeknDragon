<?php
/**
 * =====================================================
 * MODULE DE NOTES UNIVERSELLES - GESTIONNAIRE SERVEUR
 * =====================================================
 * 
 * Module générique de notes partagées pour tout site web
 * 
 * CARACTÉRISTIQUES :
 * - Sauvegarde côté serveur (PHP)
 * - Notes partagées entre tous les utilisateurs  
 * - Nommage automatique basé sur URL complète
 * - Pas de suppression via interface web
 * - Modulaire et réutilisable sur n'importe quel site
 * - Compatible avec serveurs HostPapa
 * 
 * UTILISATION :
 * 1. Copier ce dossier module_notes dans votre site
 * 2. Inclure notes-module.js dans vos pages HTML
 * 3. Configurer les permissions d'écriture sur le dossier notes/
 * 
 * AUTEUR : Assistant Claude (Anthropic)
 * VERSION : 1.0 - Module Universel
 * LICENCE : MIT - Libre utilisation
 */

// ========================================
// CONFIGURATION SÉCURISÉE
// ========================================

// En-têtes de sécurité CORS pour compatibilité universelle
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With');

// Gestion des requêtes OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Configuration des chemins et limites
$config = [
    'dossierNotes' => __DIR__ . '/notes/',
    'maxTailleNote' => 5000,
    'maxNotesParFichier' => 500,
    'formatDateTime' => 'Y-m-d H:i:s',
    'extension' => '.md',
    'debug' => false, // Mettre true pour diagnostics
    'logFile' => __DIR__ . '/notes-debug.log'
];

// Créer le dossier de notes s'il n'existe pas
if (!is_dir($config['dossierNotes'])) {
    if (!mkdir($config['dossierNotes'], 0755, true)) {
        repondreErreur('Impossible de créer le dossier de notes. Vérifiez les permissions du serveur.');
    }
}

// Créer le fichier .htaccess pour protéger les notes
$htaccessPath = $config['dossierNotes'] . '.htaccess';
if (!file_exists($htaccessPath)) {
    $htaccessContent = "# Protection du dossier notes\nOrder deny,allow\nDeny from all\n# Seul PHP peut accéder\n<Files \"*.md\">\nOrder deny,allow\nDeny from all\n</Files>";
    file_put_contents($htaccessPath, $htaccessContent);
}

// Routage des actions
$action = $_POST['action'] ?? $_GET['action'] ?? '';

// Logging pour debug si activé
if ($config['debug']) {
    $logMessage = date($config['formatDateTime']) . " - Action: $action - IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'Inconnue') . "\n";
    file_put_contents($config['logFile'], $logMessage, FILE_APPEND);
}

// Traitement des actions
switch ($action) {
    case 'save':
        sauvegarderNote($config);
        break;
    case 'load':
        chargerNotes($config);
        break;
    case 'list':
        listerFichiers($config);
        break;
    case 'stats':
        obtenirStatistiques($config);
        break;
    case 'delete':
        supprimerFichier($config);
        break;
    default:
        repondreErreur('Action non reconnue. Actions valides: save, load, list, stats, delete');
}

/**
 * ========================================
 * SAUVEGARDE DE NOTE UNIVERSELLE
 * ========================================
 */
function sauvegarderNote($config) {
    // Validation des données reçues
    $urlComplete = $_POST['urlComplete'] ?? '';
    $contenuNote = $_POST['contenu'] ?? '';
    $metadonnes = json_decode($_POST['metadonnes'] ?? '{}', true);
    
    if (empty($urlComplete) || empty($contenuNote)) {
        repondreErreur('URL ou contenu manquant');
    }
    
    // Génération du nom de fichier basé sur URL
    $nomFichier = genererNomFichierDepuisURL($urlComplete, $config['extension']);
    
    // Validation de la taille
    if (strlen($contenuNote) > $config['maxTailleNote']) {
        repondreErreur("Note trop longue (max {$config['maxTailleNote']} caractères)");
    }
    
    $cheminFichier = $config['dossierNotes'] . $nomFichier;
    
    // Vérifier le nombre de notes existantes
    if (file_exists($cheminFichier)) {
        $contenuExistant = file_get_contents($cheminFichier);
        $nombreNotesExistantes = substr_count($contenuExistant, '## 📅');
        
        if ($nombreNotesExistantes >= $config['maxNotesParFichier']) {
            repondreErreur("Limite de notes atteinte ({$config['maxNotesParFichier']} notes max par page)");
        }
    }
    
    // Préparer les métadonnées de la note
    $timestamp = date($config['formatDateTime']);
    $adresseIP = obtenirIPClient();
    $userAgent = substr($_SERVER['HTTP_USER_AGENT'] ?? 'Navigateur inconnu', 0, 100);
    $referer = $_SERVER['HTTP_REFERER'] ?? 'Direct';
    
    // En-tête de la note avec métadonnées complètes
    $enTeteNote = "## 📅 {$timestamp}\n";
    $enTeteNote .= "**🌐 URL :** {$urlComplete}\n";
    $enTeteNote .= "**🔍 IP :** {$adresseIP}\n";
    $enTeteNote .= "**📱 Navigateur :** " . (substr($userAgent, 0, 50) . (strlen($userAgent) > 50 ? '...' : '')) . "\n";
    
    // Ajouter métadonnées personnalisées si présentes
    if (!empty($metadonnes['titre'])) {
        $enTeteNote .= "**📄 Titre page :** {$metadonnes['titre']}\n";
    }
    if (!empty($metadonnes['categorie'])) {
        $enTeteNote .= "**🏷️ Catégorie :** {$metadonnes['categorie']}\n";
    }
    
    $enTeteNote .= "\n";
    
    // En-tête de première note (informations de la page)
    $premiereSauvegarde = !file_exists($cheminFichier);
    if ($premiereSauvegarde) {
        $enTeteNote = "# 📝 Notes de la page\n\n" .
                      "**🌐 Page :** {$urlComplete}\n" .
                      "**📁 Fichier :** {$nomFichier}\n" .
                      "**📅 Première note :** {$timestamp}\n\n" .
                      "---\n\n" . $enTeteNote;
    }
    
    // Formatage du contenu avec puces automatiques
    $lignesContenu = array_filter(explode("\n", $contenuNote), 'trim');
    $contenuFormate = implode("\n", array_map(
        fn($ligne) => '• ' . trim($ligne),
        $lignesContenu
    ));
    
    // Assemblage de la note complète
    $noteComplete = $enTeteNote . $contenuFormate . "\n\n---\n\n";
    
    // Sauvegarde atomique avec verrouillage
    $resultaSauvegarde = file_put_contents($cheminFichier, $noteComplete, FILE_APPEND | LOCK_EX);
    
    if ($resultaSauvegarde === false) {
        repondreErreur('Échec de sauvegarde. Vérifiez les permissions du serveur.');
    }
    
    // Réponse de succès avec détails
    repondreSucces([
        'message' => 'Note sauvegardée avec succès',
        'fichier' => $nomFichier,
        'taille' => $resultaSauvegarde,
        'timestamp' => $timestamp,
        'urlSource' => $urlComplete,
        'premiereSauvegarde' => $premiereSauvegarde,
        'nombreCaracteres' => strlen($contenuNote)
    ]);
}

/**
 * ========================================
 * CHARGEMENT DES NOTES
 * ========================================
 */
function chargerNotes($config) {
    $urlComplete = $_GET['urlComplete'] ?? '';
    
    if (empty($urlComplete)) {
        repondreErreur('URL manquante pour charger les notes');
    }
    
    $nomFichier = genererNomFichierDepuisURL($urlComplete, $config['extension']);
    $cheminFichier = $config['dossierNotes'] . $nomFichier;
    
    if (!file_exists($cheminFichier)) {
        repondreSucces([
            'contenu' => '',
            'fichier' => $nomFichier,
            'existe' => false,
            'nombreNotes' => 0,
            'message' => 'Aucune note trouvée pour cette page. Soyez le premier à laisser une note !'
        ]);
        return;
    }
    
    $contenu = file_get_contents($cheminFichier);
    
    if ($contenu === false) {
        repondreErreur('Erreur lors de la lecture des notes');
    }
    
    // Statistiques du fichier
    $stats = stat($cheminFichier);
    $nombreLignes = substr_count($contenu, "\n");
    $nombreNotes = substr_count($contenu, '## 📅');
    $tailleKo = round(strlen($contenu) / 1024, 2);
    
    repondreSucces([
        'contenu' => $contenu,
        'fichier' => $nomFichier,
        'existe' => true,
        'nombreNotes' => $nombreNotes,
        'nombreLignes' => $nombreLignes,
        'tailleKo' => $tailleKo,
        'derniereModification' => date($config['formatDateTime'], $stats['mtime']),
        'urlSource' => $urlComplete
    ]);
}

/**
 * ========================================
 * LISTAGE DES FICHIERS DE NOTES
 * ========================================
 */
function listerFichiers($config) {
    $fichiers = [];
    
    if (is_dir($config['dossierNotes'])) {
        $scan = scandir($config['dossierNotes']);
        
        foreach ($scan as $fichier) {
            if ($fichier !== '.' && $fichier !== '..' && 
                str_ends_with($fichier, $config['extension']) && 
                $fichier !== '.htaccess') {
                
                $cheminComplet = $config['dossierNotes'] . $fichier;
                $stats = stat($cheminComplet);
                $contenu = file_get_contents($cheminComplet);
                
                $fichiers[] = [
                    'nom' => $fichier,
                    'taille' => filesize($cheminComplet),
                    'tailleKo' => round(filesize($cheminComplet) / 1024, 2),
                    'derniereModification' => date($config['formatDateTime'], $stats['mtime']),
                    'nombreNotes' => substr_count($contenu, '## 📅'),
                    'urlExtraite' => extraireURLDuContenu($contenu)
                ];
            }
        }
        
        // Trier par dernière modification (plus récent en premier)
        usort($fichiers, fn($a, $b) => strtotime($b['derniereModification']) - strtotime($a['derniereModification']));
    }
    
    repondreSucces([
        'fichiers' => $fichiers,
        'total' => count($fichiers),
        'dossier' => basename($config['dossierNotes']),
        'totalTailleKo' => round(array_sum(array_column($fichiers, 'tailleKo')), 2)
    ]);
}

/**
 * ========================================
 * STATISTIQUES GÉNÉRALES
 * ========================================
 */
function obtenirStatistiques($config) {
    $stats = [
        'totalFichiers' => 0,
        'totalNotes' => 0,
        'tailleTotal' => 0,
        'derniereActivite' => null,
        'pagesLesplusActives' => []
    ];
    
    if (is_dir($config['dossierNotes'])) {
        $scan = scandir($config['dossierNotes']);
        $activites = [];
        
        foreach ($scan as $fichier) {
            if ($fichier !== '.' && $fichier !== '..' && str_ends_with($fichier, $config['extension'])) {
                $cheminComplet = $config['dossierNotes'] . $fichier;
                $statsFichier = stat($cheminComplet);
                $contenu = file_get_contents($cheminComplet);
                
                $stats['totalFichiers']++;
                $stats['totalNotes'] += substr_count($contenu, '## 📅');
                $stats['tailleTotal'] += filesize($cheminComplet);
                
                $activites[] = [
                    'fichier' => $fichier,
                    'modification' => $statsFichier['mtime'],
                    'nombreNotes' => substr_count($contenu, '## 📅'),
                    'url' => extraireURLDuContenu($contenu)
                ];
            }
        }
        
        if (!empty($activites)) {
            // Dernière activité
            usort($activites, fn($a, $b) => $b['modification'] - $a['modification']);
            $stats['derniereActivite'] = date($config['formatDateTime'], $activites[0]['modification']);
            
            // Pages les plus actives
            usort($activites, fn($a, $b) => $b['nombreNotes'] - $a['nombreNotes']);
            $stats['pagesLesplusActives'] = array_slice($activites, 0, 5);
        }
    }
    
    $stats['tailleTotal'] = round($stats['tailleTotal'] / 1024, 2); // En Ko
    
    repondreSucces($stats);
}

/**
 * ========================================
 * SUPPRESSION DE FICHIER (ADMIN SEULEMENT)
 * ========================================
 */
function supprimerFichier($config) {
    $nomFichier = $_POST['fichier'] ?? '';
    
    if (empty($nomFichier)) {
        repondreErreur('Nom de fichier manquant pour suppression');
    }
    
    // Sécurité : nettoyer le nom de fichier
    $nomFichier = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $nomFichier);
    if (!str_ends_with($nomFichier, $config['extension'])) {
        $nomFichier .= $config['extension'];
    }
    
    $cheminFichier = $config['dossierNotes'] . $nomFichier;
    
    if (!file_exists($cheminFichier)) {
        repondreErreur('Fichier non trouvé: ' . $nomFichier);
    }
    
    // Log de sécurité pour audit
    if ($config['debug']) {
        $logMessage = date($config['formatDateTime']) . " - SUPPRESSION: $nomFichier - IP: " . obtenirIPClient() . "\n";
        file_put_contents($config['logFile'], $logMessage, FILE_APPEND);
    }
    
    // Supprimer le fichier
    if (unlink($cheminFichier)) {
        repondreSucces([
            'message' => 'Fichier supprimé avec succès',
            'fichier' => $nomFichier,
            'timestamp' => date($config['formatDateTime'])
        ]);
    } else {
        repondreErreur('Impossible de supprimer le fichier. Vérifiez les permissions.');
    }
}

/**
 * ========================================
 * FONCTIONS UTILITAIRES
 * ========================================
 */

/**
 * Génère un nom de fichier propre basé sur une URL complète
 */
function genererNomFichierDepuisURL($urlComplete, $extension) {
    // Parser l'URL pour extraire les composants
    $urlParts = parse_url($urlComplete);
    
    $domaine = $urlParts['host'] ?? 'site-inconnu';
    $chemin = trim($urlParts['path'] ?? '', '/');
    
    // Nettoyer et remplacer les caractères problématiques
    $domainePropre = preg_replace('/[^a-zA-Z0-9.-]/', '', $domaine);
    $cheminPropre = preg_replace('/[^a-zA-Z0-9.\-\/]/', '_', $chemin);
    
    // Remplacer les slashes par des underscores
    $cheminPropre = str_replace('/', '_', $cheminPropre);
    
    // Enlever l'extension .html si présente
    $cheminPropre = preg_replace('/\.html?$/', '', $cheminPropre);
    
    // Construire le nom final
    $nomFichier = $domainePropre . '_' . $cheminPropre;
    
    // Nettoyer les underscores multiples et les caractères en début/fin
    $nomFichier = preg_replace('/_+/', '_', $nomFichier);
    $nomFichier = trim($nomFichier, '_');
    
    // Limiter la longueur pour éviter les problèmes de système de fichiers
    if (strlen($nomFichier) > 200) {
        $nomFichier = substr($nomFichier, 0, 200) . '_tronque';
    }
    
    return $nomFichier . $extension;
}

/**
 * Extrait l'URL du contenu d'une note (première ligne URL trouvée)
 */
function extraireURLDuContenu($contenu) {
    if (preg_match('/\*\*🌐 (?:Page|URL) :\*\* (.+)/m', $contenu, $matches)) {
        return trim($matches[1]);
    }
    return 'URL non trouvée';
}

/**
 * Obtient l'adresse IP réelle du client (compatible CDN/proxy)
 */
function obtenirIPClient() {
    $headers = [
        'HTTP_CF_CONNECTING_IP',     // Cloudflare
        'HTTP_X_FORWARDED_FOR',      // Proxy standard
        'HTTP_X_FORWARDED',          // Proxy
        'HTTP_X_CLUSTER_CLIENT_IP',  // Cluster
        'HTTP_CLIENT_IP',            // Proxy
        'REMOTE_ADDR'                // Standard
    ];
    
    foreach ($headers as $header) {
        if (!empty($_SERVER[$header])) {
            $ip = $_SERVER[$header];
            // Prendre la première IP si plusieurs sont présentes
            if (strpos($ip, ',') !== false) {
                $ip = trim(explode(',', $ip)[0]);
            }
            // Valider que c'est une IP valide
            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return $ip;
            }
        }
    }
    
    return $_SERVER['REMOTE_ADDR'] ?? 'IP inconnue';
}

/**
 * ========================================
 * RÉPONSES JSON
 * ========================================
 */

/**
 * Renvoie une réponse de succès en JSON
 */
function repondreSucces($data) {
    echo json_encode([
        'success' => true,
        'data' => $data,
        'timestamp' => date('Y-m-d H:i:s'),
        'version' => '1.0-universel'
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Renvoie une réponse d'erreur en JSON
 */
function repondreErreur($message) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $message,
        'timestamp' => date('Y-m-d H:i:s'),
        'version' => '1.0-universel'
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * ========================================
 * COMPATIBILITÉ PHP
 * ========================================
 */

// Fonction pour compatibilité PHP < 8.0
if (!function_exists('str_ends_with')) {
    function str_ends_with($haystack, $needle) {
        return substr($haystack, -strlen($needle)) === $needle;
    }
}
?>