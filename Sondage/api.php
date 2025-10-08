<?php
/**
 * API REST pour le système de sondages multi-utilisateur
 *
 * Endpoints :
 * - GET ?action=list : Liste tous les sondages disponibles
 * - GET ?action=survey&name=NomSondage : Récupère le contenu d'un sondage vierge
 * - GET ?action=list-users&survey=NomSondage : Liste tous les utilisateurs d'un sondage
 * - POST ?action=create-user : Crée un nouvel utilisateur pour un sondage
 * - GET ?action=user-data&survey=NomSondage&user=NomUtilisateur : Charge les données d'un utilisateur
 * - POST ?action=save-user-data : Sauvegarde les données d'un utilisateur
 * - DELETE ?action=delete-user : Supprime un utilisateur
 * - POST ?action=add-requirement : Ajoute un critère/sous-critère personnalisé
 * - GET ?action=compare&survey=NomSondage&users[]=User1&users[]=User2 : Compare plusieurs utilisateurs
 * - GET ?action=export&survey=NomSondage&user=NomUtilisateur&format=json|csv : Exporte les données
 *
 * @author Brujah - Geek & Dragon
 * @version 2.0.0 - Multi-utilisateur
 */

declare(strict_types=1);

// Headers sécurisés (seront overridés pour export)
$action = $_GET['action'] ?? '';

if ($action !== 'export') {
    header('Content-Type: application/json; charset=utf-8');
}
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

// Cache intelligent pour les sondages (action=survey uniquement)
if ($action === 'survey') {
    $fileName = sanitizeName($_GET['name'] ?? '');
    if ($fileName) {
        $fileNameFull = str_ends_with($fileName, '.md') ? $fileName : $fileName . '.md';
        $filePath = __DIR__ . '/sondages/' . $fileNameFull;

        if (file_exists($filePath)) {
            $etag = md5_file($filePath);
            $lastModified = filemtime($filePath);

            header('Cache-Control: public, max-age=3600'); // 1h
            header('ETag: "' . $etag . '"');
            header('Last-Modified: ' . gmdate('D, d M Y H:i:s', $lastModified) . ' GMT');

            // Vérifier si client a version à jour
            if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && $_SERVER['HTTP_IF_NONE_MATCH'] === '"' . $etag . '"') {
                http_response_code(304);
                exit;
            }
        }
    }
}

// Par défaut, pas de cache pour les autres actions
if ($action !== 'survey') {
    header('Cache-Control: no-cache, must-revalidate');
}

// Chemins
$surveysDir = __DIR__ . '/sondages';
$usersDir = __DIR__ . '/utilisateurs';

// Créer dossier utilisateurs si inexistant
if (!is_dir($usersDir)) {
    mkdir($usersDir, 0755, true);
}

/**
 * Retourne une réponse JSON standardisée
 */
function jsonResponse(bool $success, mixed $data = null, ?string $error = null, int $statusCode = 200): never
{
    http_response_code($statusCode);
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'error' => $error,
        'timestamp' => date('c')
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR);
    exit;
}

/**
 * Valide et nettoie un nom (fichier/utilisateur)
 */
function sanitizeName(string $name): ?string
{
    // Protection contre path traversal
    if (str_contains($name, '..') || str_contains($name, '/') || str_contains($name, '\\')) {
        return null;
    }

    // Lettres, chiffres, tirets, underscores, espaces, apostrophes, accents
    $clean = preg_replace('/[^a-zA-Z0-9_\-\s.\'éèêëàâäôöùûüçÉÈÊËÀÂÄÔÖÙÛÜÇ]/u', '', $name);

    if (empty($clean)) {
        return null;
    }

    return trim($clean);
}

/**
 * Génère un slug URL-friendly
 */
function generateSlug(string $text): string
{
    $slug = strtolower(trim($text));
    $slug = preg_replace('/[^a-z0-9\s\-]/u', '', $slug);
    $slug = preg_replace('/[\s\-]+/', '-', $slug);
    return trim($slug, '-');
}

/**
 * Génère le chemin du dossier utilisateur pour un sondage
 */
function getUserSurveyDir(string $usersDir, string $surveySlug): string
{
    return $usersDir . '/' . $surveySlug;
}

/**
 * Génère le chemin du fichier utilisateur
 */
function getUserFilePath(string $usersDir, string $surveySlug, string $userSlug): string
{
    return getUserSurveyDir($usersDir, $surveySlug) . '/' . $userSlug . '.json';
}

/**
 * Liste tous les sondages disponibles (fichiers .md dans /sondages)
 */
function listSurveys(string $surveysDir): array
{
    $surveys = [];

    if (!is_dir($surveysDir)) {
        return [];
    }

    $files = scandir($surveysDir);

    if ($files === false) {
        return [];
    }

    foreach ($files as $file) {
        if (pathinfo($file, PATHINFO_EXTENSION) !== 'md') {
            continue;
        }

        $filePath = $surveysDir . '/' . $file;
        $name = pathinfo($file, PATHINFO_FILENAME);

        $surveys[] = [
            'name' => $name,
            'file' => $file,
            'slug' => generateSlug($name),
            'size' => filesize($filePath),
            'modified' => filemtime($filePath)
        ];
    }

    // Tri par date de modification (plus récent en premier)
    usort($surveys, fn($a, $b) => $b['modified'] <=> $a['modified']);

    return $surveys;
}

/**
 * Récupère le contenu d'un sondage vierge
 */
function getSurveyContent(string $surveysDir, string $fileName): ?string
{
    $filePath = $surveysDir . '/' . $fileName;

    if (!file_exists($filePath) || !is_file($filePath) || !is_readable($filePath)) {
        return null;
    }

    // Vérification extension .md
    if (pathinfo($filePath, PATHINFO_EXTENSION) !== 'md') {
        return null;
    }

    $content = file_get_contents($filePath);

    return $content !== false ? $content : null;
}

/**
 * Liste tous les utilisateurs d'un sondage
 */
function listSurveyUsers(string $usersDir, string $surveySlug): array
{
    $users = [];
    $surveyDir = getUserSurveyDir($usersDir, $surveySlug);

    if (!is_dir($surveyDir)) {
        return [];
    }

    $files = scandir($surveyDir);

    if ($files === false) {
        return [];
    }

    foreach ($files as $file) {
        if (pathinfo($file, PATHINFO_EXTENSION) !== 'json') {
            continue;
        }

        $filePath = $surveyDir . '/' . $file;
        $userSlug = pathinfo($file, PATHINFO_FILENAME);

        // Charger métadonnées sans tout le contenu
        $content = file_get_contents($filePath);
        if ($content === false) {
            continue;
        }

        try {
            $data = json_decode($content, true, 512, JSON_THROW_ON_ERROR);

            $responseCount = 0;
            if (isset($data['responses']) && is_array($data['responses'])) {
                $responseCount = count($data['responses']);
            }

            $users[] = [
                'username' => $data['username'] ?? $userSlug,
                'slug' => $userSlug,
                'created_at' => $data['created_at'] ?? null,
                'modified_at' => $data['modified_at'] ?? filemtime($filePath),
                'response_count' => $responseCount,
                'has_custom_requirements' => isset($data['custom_requirements']) && !empty($data['custom_requirements'])
            ];
        } catch (JsonException $e) {
            // Ignorer fichiers JSON invalides
            continue;
        }
    }

    // Tri par date de modification (plus récent en premier)
    usort($users, fn($a, $b) => $b['modified_at'] <=> $a['modified_at']);

    return $users;
}

/**
 * Crée un nouvel utilisateur pour un sondage
 */
function createUser(string $usersDir, string $surveySlug, string $username): array
{
    $userSlug = generateSlug($username);

    if (empty($userSlug)) {
        return ['success' => false, 'error' => 'Nom d\'utilisateur invalide'];
    }

    // Créer dossier sondage si inexistant
    $surveyDir = getUserSurveyDir($usersDir, $surveySlug);
    if (!is_dir($surveyDir)) {
        mkdir($surveyDir, 0755, true);
    }

    $filePath = getUserFilePath($usersDir, $surveySlug, $userSlug);

    // Vérifier si l'utilisateur existe déjà
    if (file_exists($filePath)) {
        return ['success' => false, 'error' => 'Un utilisateur avec ce nom existe déjà'];
    }

    // Créer structure de données vierge
    $userData = [
        'username' => $username,
        'slug' => $userSlug,
        'survey_slug' => $surveySlug,
        'created_at' => date('c'),
        'modified_at' => date('c'),
        'responses' => [],
        'custom_requirements' => [],
        'version' => '2.0.0'
    ];

    $json = json_encode($userData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR);

    if (file_put_contents($filePath, $json) === false) {
        return ['success' => false, 'error' => 'Impossible de créer le fichier utilisateur'];
    }

    return [
        'success' => true,
        'user' => [
            'username' => $username,
            'slug' => $userSlug,
            'created_at' => $userData['created_at']
        ]
    ];
}

/**
 * Charge les données d'un utilisateur
 */
function loadUserData(string $usersDir, string $surveySlug, string $userSlug): ?array
{
    $filePath = getUserFilePath($usersDir, $surveySlug, $userSlug);

    if (!file_exists($filePath) || !is_file($filePath) || !is_readable($filePath)) {
        return null;
    }

    $content = file_get_contents($filePath);

    if ($content === false) {
        return null;
    }

    try {
        $data = json_decode($content, true, 512, JSON_THROW_ON_ERROR);
        return $data;
    } catch (JsonException $e) {
        return null;
    }
}

/**
 * Sauvegarde les données d'un utilisateur
 */
function saveUserData(string $usersDir, string $surveySlug, string $userSlug, array $responses, array $customRequirements = []): array
{
    $filePath = getUserFilePath($usersDir, $surveySlug, $userSlug);

    // Charger données existantes ou créer nouvelles
    $userData = loadUserData($usersDir, $surveySlug, $userSlug);

    if ($userData === null) {
        // Utilisateur n'existe pas encore, le créer
        $createResult = createUser($usersDir, $surveySlug, $userSlug);
        if (!$createResult['success']) {
            return $createResult;
        }
        $userData = loadUserData($usersDir, $surveySlug, $userSlug);
    }

    // Mettre à jour les données
    $userData['responses'] = $responses;
    $userData['custom_requirements'] = $customRequirements;
    $userData['modified_at'] = date('c');

    $json = json_encode($userData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR);

    if (file_put_contents($filePath, $json) === false) {
        return ['success' => false, 'error' => 'Impossible de sauvegarder les données'];
    }

    return [
        'success' => true,
        'modified_at' => $userData['modified_at'],
        'size' => strlen($json)
    ];
}

/**
 * Supprime un utilisateur
 */
function deleteUser(string $usersDir, string $surveySlug, string $userSlug): bool
{
    $filePath = getUserFilePath($usersDir, $surveySlug, $userSlug);

    if (!file_exists($filePath)) {
        return false;
    }

    return unlink($filePath);
}

/**
 * Compare les réponses de plusieurs utilisateurs
 */
function compareUsers(string $usersDir, string $surveySlug, array $userSlugs): array
{
    $comparison = [];

    foreach ($userSlugs as $userSlug) {
        $userData = loadUserData($usersDir, $surveySlug, $userSlug);

        if ($userData === null) {
            continue;
        }

        $comparison[] = [
            'username' => $userData['username'],
            'slug' => $userSlug,
            'responses' => $userData['responses'] ?? [],
            'custom_requirements' => $userData['custom_requirements'] ?? [],
            'modified_at' => $userData['modified_at'] ?? null
        ];
    }

    return $comparison;
}

/**
 * Exporte les données d'un utilisateur en CSV
 */
function exportToCSV(array $userData): string
{
    $csv = [];

    // En-tête
    $csv[] = ['ID Requis', 'MVP', 'Admin_C', 'Admin_L', 'Admin_E', 'Admin_S', 'Admin_X', 'Admin_V', 'Gestionnaire_C', 'Gestionnaire_L', 'Gestionnaire_E', 'Gestionnaire_S', 'Gestionnaire_X', 'Gestionnaire_V', 'Superviseur_C', 'Superviseur_L', 'Superviseur_E', 'Superviseur_S', 'Superviseur_X', 'Superviseur_V', 'Employe_C', 'Employe_L', 'Employe_E', 'Employe_S', 'Employe_X', 'Employe_V', 'Patient_C', 'Patient_L', 'Patient_E', 'Patient_S', 'Patient_X', 'Patient_V', 'Famille_C', 'Famille_L', 'Famille_E', 'Famille_S', 'Famille_X', 'Famille_V', 'Spécifique'];

    // Données
    $responses = $userData['responses'] ?? [];

    foreach ($responses as $reqId => $reqData) {
        $row = [$reqId];

        // MVP
        $row[] = ($reqData['mvp'] ?? false) ? '1' : '0';

        // Rôles et actions
        $roles = ['Admin', 'Gestionnaire', 'Superviseur', 'Employe', 'Patient', 'Famille'];
        $actions = ['C', 'L', 'E', 'S', 'X', 'V'];

        foreach ($roles as $role) {
            foreach ($actions as $action) {
                $key = "role_{$role}_{$action}";
                $row[] = ($reqData[$key] ?? false) ? '1' : '0';
            }
        }

        // Spécifique
        $row[] = ($reqData['specific'] ?? false) ? '1' : '0';

        $csv[] = $row;
    }

    // Générer CSV
    $output = fopen('php://temp', 'r+');
    foreach ($csv as $row) {
        fputcsv($output, $row, ';'); // Utiliser ; pour Excel français
    }
    rewind($output);
    $csvContent = stream_get_contents($output);
    fclose($output);

    return $csvContent;
}

// === Routage des actions ===

try {
    $action = $_GET['action'] ?? 'list';
    $method = $_SERVER['REQUEST_METHOD'];

    switch ($action) {
        case 'list':
            // Liste tous les sondages disponibles
            $surveys = listSurveys($surveysDir);
            jsonResponse(true, $surveys);
            break;

        case 'survey':
            // Récupère le contenu d'un sondage vierge
            $surveyName = $_GET['name'] ?? '';
            $cleanName = sanitizeName($surveyName);

            if (!$cleanName) {
                jsonResponse(false, null, 'Nom de sondage invalide', 400);
            }

            // Force extension .md si absente
            $fileName = str_ends_with($cleanName, '.md') ? $cleanName : $cleanName . '.md';

            $content = getSurveyContent($surveysDir, $fileName);

            if ($content === null) {
                jsonResponse(false, null, 'Sondage introuvable : ' . $fileName, 404);
            }

            jsonResponse(true, [
                'name' => $cleanName,
                'file' => $fileName,
                'content' => $content,
                'size' => strlen($content)
            ]);
            break;

        case 'list-users':
            // Liste tous les utilisateurs d'un sondage
            $surveyName = $_GET['survey'] ?? '';
            $surveySlug = generateSlug($surveyName);

            if (!$surveySlug) {
                jsonResponse(false, null, 'Nom de sondage invalide', 400);
            }

            $users = listSurveyUsers($usersDir, $surveySlug);
            jsonResponse(true, $users);
            break;

        case 'create-user':
            // Crée un nouvel utilisateur
            if ($method !== 'POST') {
                jsonResponse(false, null, 'Méthode non autorisée', 405);
            }

            $input = file_get_contents('php://input');
            $data = json_decode($input, true, 512, JSON_THROW_ON_ERROR);

            $surveyName = $data['survey'] ?? '';
            $username = $data['username'] ?? '';

            $surveySlug = generateSlug($surveyName);
            $cleanUsername = sanitizeName($username);

            if (!$surveySlug || !$cleanUsername) {
                jsonResponse(false, null, 'Paramètres invalides', 400);
            }

            $result = createUser($usersDir, $surveySlug, $cleanUsername);

            if (!$result['success']) {
                jsonResponse(false, null, $result['error'], 400);
            }

            jsonResponse(true, $result['user']);
            break;

        case 'user-data':
            // Charge les données d'un utilisateur
            $surveyName = $_GET['survey'] ?? '';
            $username = $_GET['user'] ?? '';

            $surveySlug = generateSlug($surveyName);
            $userSlug = generateSlug($username);

            if (!$surveySlug || !$userSlug) {
                jsonResponse(false, null, 'Paramètres invalides', 400);
            }

            $userData = loadUserData($usersDir, $surveySlug, $userSlug);

            if ($userData === null) {
                jsonResponse(false, null, 'Utilisateur introuvable', 404);
            }

            jsonResponse(true, $userData);
            break;

        case 'save-user-data':
            // Sauvegarde les données d'un utilisateur
            if ($method !== 'POST') {
                jsonResponse(false, null, 'Méthode non autorisée', 405);
            }

            $input = file_get_contents('php://input');
            $data = json_decode($input, true, 512, JSON_THROW_ON_ERROR);

            $surveyName = $data['survey'] ?? '';
            $username = $data['user'] ?? '';
            $responses = $data['responses'] ?? [];
            $customRequirements = $data['custom_requirements'] ?? [];

            $surveySlug = generateSlug($surveyName);
            $userSlug = generateSlug($username);

            if (!$surveySlug || !$userSlug) {
                jsonResponse(false, null, 'Paramètres invalides', 400);
            }

            $result = saveUserData($usersDir, $surveySlug, $userSlug, $responses, $customRequirements);

            if (!$result['success']) {
                jsonResponse(false, null, $result['error'], 500);
            }

            jsonResponse(true, $result);
            break;

        case 'delete-user':
            // Supprime un utilisateur
            if ($method !== 'DELETE' && $method !== 'POST') {
                jsonResponse(false, null, 'Méthode non autorisée', 405);
            }

            $surveyName = $_GET['survey'] ?? '';
            $username = $_GET['user'] ?? '';

            $surveySlug = generateSlug($surveyName);
            $userSlug = generateSlug($username);

            if (!$surveySlug || !$userSlug) {
                jsonResponse(false, null, 'Paramètres invalides', 400);
            }

            $deleted = deleteUser($usersDir, $surveySlug, $userSlug);

            if (!$deleted) {
                jsonResponse(false, null, 'Utilisateur introuvable', 404);
            }

            jsonResponse(true, ['deleted' => $username]);
            break;

        case 'compare':
            // Compare plusieurs utilisateurs
            $surveyName = $_GET['survey'] ?? '';
            $usernames = $_GET['users'] ?? [];

            $surveySlug = generateSlug($surveyName);

            if (!$surveySlug || empty($usernames)) {
                jsonResponse(false, null, 'Paramètres invalides', 400);
            }

            // Convertir usernames en slugs
            $userSlugs = array_map(fn($u) => generateSlug($u), $usernames);
            $userSlugs = array_filter($userSlugs);

            if (empty($userSlugs)) {
                jsonResponse(false, null, 'Aucun utilisateur valide', 400);
            }

            $comparison = compareUsers($usersDir, $surveySlug, $userSlugs);
            jsonResponse(true, $comparison);
            break;

        case 'export':
            // Exporte les données d'un utilisateur
            $surveyName = $_GET['survey'] ?? '';
            $username = $_GET['user'] ?? '';
            $format = $_GET['format'] ?? 'json';

            $surveySlug = generateSlug($surveyName);
            $userSlug = generateSlug($username);

            if (!$surveySlug || !$userSlug) {
                jsonResponse(false, null, 'Paramètres invalides', 400);
            }

            $userData = loadUserData($usersDir, $surveySlug, $userSlug);

            if ($userData === null) {
                jsonResponse(false, null, 'Utilisateur introuvable', 404);
            }

            if ($format === 'csv') {
                // Export CSV
                header('Content-Type: text/csv; charset=utf-8');
                header('Content-Disposition: attachment; filename="' . $surveySlug . '_' . $userSlug . '.csv"');
                echo exportToCSV($userData);
                exit;
            } else {
                // Export JSON (par défaut)
                header('Content-Type: application/json; charset=utf-8');
                header('Content-Disposition: attachment; filename="' . $surveySlug . '_' . $userSlug . '.json"');
                echo json_encode($userData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR);
                exit;
            }
            break;

        default:
            jsonResponse(false, null, 'Action inconnue : ' . htmlspecialchars($action), 400);
    }

} catch (JsonException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur encodage JSON : ' . $e->getMessage(),
        'timestamp' => date('c')
    ]);
} catch (Exception $e) {
    jsonResponse(false, null, 'Erreur serveur : ' . $e->getMessage(), 500);
}
