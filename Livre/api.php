<?php
/**
 * API REST autonome pour les manuscrits
 *
 * Endpoints :
 * - GET ?action=list : Liste tous les livres disponibles
 * - GET ?action=book&name=NomLivre : Récupère tous les chapitres d'un livre
 * - GET ?action=chapter&book=NomLivre&file=fichier.md : Récupère un chapitre spécifique
 *
 * Sécurité :
 * - Validation stricte des entrées
 * - Protection contre path traversal
 * - Échappement des sorties JSON
 *
 * @author Brujah - Geek & Dragon
 * @version 1.0.0
 */

declare(strict_types=1);

// Headers sécurisés
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Cache-Control: no-cache, must-revalidate');

// Chemin de base (dossier contenant les livres)
$baseDir = __DIR__;

/**
 * Retourne une réponse JSON standardisée
 *
 * @param bool $success Succès de l'opération
 * @param mixed $data Données à retourner
 * @param string|null $error Message d'erreur optionnel
 * @param int $statusCode Code HTTP
 * @return never
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
 * Valide et nettoie un nom de fichier/dossier
 *
 * @param string $name Nom à valider
 * @return string|null Nom nettoyé ou null si invalide
 */
function sanitizeName(string $name): ?string
{
    // Protection contre path traversal
    if (str_contains($name, '..') || str_contains($name, '/') || str_contains($name, '\\')) {
        return null;
    }

    // Suppression caractères dangereux
    $clean = preg_replace('/[^a-zA-Z0-9_\-\s.éèêëàâäôöùûüçÉÈÊËÀÂÄÔÖÙÛÜÇ]/u', '', $name);

    if (empty($clean)) {
        return null;
    }

    return $clean;
}

/**
 * Liste tous les livres (sous-dossiers) disponibles
 *
 * @param string $baseDir Dossier racine
 * @return array Liste des livres avec métadonnées
 */
function listBooks(string $baseDir): array
{
    $books = [];
    $excludedDirs = ['assets', '.git', '.', '..'];

    if (!is_dir($baseDir)) {
        return [];
    }

    $dirs = scandir($baseDir);

    if ($dirs === false) {
        return [];
    }

    foreach ($dirs as $dir) {
        if (in_array($dir, $excludedDirs, true)) {
            continue;
        }

        $fullPath = $baseDir . '/' . $dir;

        if (!is_dir($fullPath)) {
            continue;
        }

        $chapters = listChapters($fullPath);

        if (empty($chapters)) {
            continue; // Ignorer dossiers sans fichiers .md
        }

        $books[] = [
            'name' => $dir,
            'slug' => generateSlug($dir),
            'chaptersCount' => count($chapters),
            'chapters' => $chapters
        ];
    }

    // Tri alphabétique
    usort($books, fn($a, $b) => strcmp($a['name'], $b['name']));

    return $books;
}

/**
 * Liste tous les chapitres d'un livre (fichiers .md)
 *
 * @param string $bookPath Chemin complet vers le livre
 * @return array Liste des chapitres triés par ordre numérique
 */
function listChapters(string $bookPath): array
{
    $chapters = [];

    if (!is_dir($bookPath)) {
        return [];
    }

    $files = scandir($bookPath);

    if ($files === false) {
        return [];
    }

    foreach ($files as $file) {
        if (pathinfo($file, PATHINFO_EXTENSION) !== 'md') {
            continue;
        }

        // Extraction numéro d'ordre (format: 00_prologue.md, 01_chapitre1.md, etc.)
        if (preg_match('/^(\d+)_(.+)\.md$/u', $file, $matches)) {
            $order = (int)$matches[1];
            $namePart = $matches[2];

            // Formatage titre lisible
            $title = ucfirst(str_replace('_', ' ', $namePart));

            $filePath = $bookPath . '/' . $file;

            $chapters[] = [
                'file' => $file,
                'order' => $order,
                'title' => $title,
                'slug' => 'chapitre-' . $order,
                'size' => file_exists($filePath) ? filesize($filePath) : 0
            ];
        }
    }

    // Tri numérique par ordre
    usort($chapters, fn($a, $b) => $a['order'] <=> $b['order']);

    return $chapters;
}

/**
 * Récupère le contenu brut d'un chapitre
 *
 * @param string $bookPath Chemin vers le livre
 * @param string $fileName Nom du fichier .md
 * @return string|null Contenu ou null si erreur
 */
function getChapterContent(string $bookPath, string $fileName): ?string
{
    $filePath = $bookPath . '/' . $fileName;

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
 * Génère un slug URL-friendly à partir d'un nom
 *
 * @param string $text Texte source
 * @return string Slug généré
 */
function generateSlug(string $text): string
{
    $slug = strtolower(trim($text));
    $slug = preg_replace('/[^a-z0-9\s\-]/u', '', $slug);
    $slug = preg_replace('/[\s\-]+/', '-', $slug);
    return trim($slug, '-');
}

// === Routage des actions ===

try {
    $action = $_GET['action'] ?? 'list';

    switch ($action) {
        case 'list':
            // Liste tous les livres disponibles
            $books = listBooks($baseDir);
            jsonResponse(true, $books);
            break;

        case 'book':
            // Récupère les chapitres d'un livre
            $bookName = $_GET['name'] ?? '';
            $cleanName = sanitizeName($bookName);

            if (!$cleanName) {
                jsonResponse(false, null, 'Nom de livre invalide', 400);
            }

            $bookPath = $baseDir . '/' . $cleanName;

            if (!is_dir($bookPath)) {
                jsonResponse(false, null, 'Livre introuvable : ' . $cleanName, 404);
            }

            $chapters = listChapters($bookPath);

            jsonResponse(true, [
                'name' => $cleanName,
                'chapters' => $chapters
            ]);
            break;

        case 'chapter':
            // Récupère le contenu d'un chapitre
            $bookName = $_GET['book'] ?? '';
            $fileName = $_GET['file'] ?? '';

            $cleanBook = sanitizeName($bookName);
            $cleanFile = sanitizeName($fileName);

            if (!$cleanBook || !$cleanFile) {
                jsonResponse(false, null, 'Paramètres invalides', 400);
            }

            // Force extension .md si absente
            if (!str_ends_with($cleanFile, '.md')) {
                $cleanFile .= '.md';
            }

            $bookPath = $baseDir . '/' . $cleanBook;

            if (!is_dir($bookPath)) {
                jsonResponse(false, null, 'Livre introuvable', 404);
            }

            $content = getChapterContent($bookPath, $cleanFile);

            if ($content === null) {
                jsonResponse(false, null, 'Chapitre introuvable : ' . $cleanFile, 404);
            }

            jsonResponse(true, [
                'book' => $cleanBook,
                'file' => $cleanFile,
                'content' => $content,
                'size' => strlen($content)
            ]);
            break;

        default:
            jsonResponse(false, null, 'Action inconnue : ' . htmlspecialchars($action), 400);
    }

} catch (JsonException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur encodage JSON',
        'timestamp' => date('c')
    ]);
} catch (Exception $e) {
    jsonResponse(false, null, 'Erreur serveur : ' . $e->getMessage(), 500);
}
