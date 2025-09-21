<?php
/**
 * Gestionnaire de streaming vidéo optimisé
 * Gère les requêtes de plage (Range Requests) pour éviter les erreurs HTTP/2
 */

class VideoStreamer {
    private $filePath;
    private $fileSize;
    private $start = 0;
    private $end = 0;
    private $length = 0;
    
    public function __construct($filePath) {
        $this->filePath = $filePath;
        
        if (!file_exists($filePath)) {
            http_response_code(404);
            exit('Fichier vidéo non trouvé');
        }
        
        $this->fileSize = filesize($filePath);
    }
    
    /**
     * Analyse les headers Range et configure la plage de streaming
     */
    private function parseRange() {
        $this->start = 0;
        $this->end = $this->fileSize - 1;
        $this->length = $this->fileSize;
        
        if (isset($_SERVER['HTTP_RANGE'])) {
            $range = $_SERVER['HTTP_RANGE'];
            
            if (preg_match('/bytes=(\d+)-(\d+)?/', $range, $matches)) {
                $this->start = intval($matches[1]);
                
                if (isset($matches[2]) && $matches[2] !== '') {
                    $this->end = intval($matches[2]);
                }
                
                // Limite la taille du chunk pour éviter les timeouts
                $maxChunkSize = 1024 * 1024; // 1MB chunks
                if (($this->end - $this->start) > $maxChunkSize) {
                    $this->end = $this->start + $maxChunkSize - 1;
                }
                
                $this->length = $this->end - $this->start + 1;
                
                // Validation des plages
                if ($this->start >= $this->fileSize || $this->end >= $this->fileSize) {
                    http_response_code(416);
                    header("Content-Range: bytes */{$this->fileSize}");
                    exit('Plage de requête invalide');
                }
            }
        }
    }
    
    /**
     * Envoie les headers HTTP appropriés
     */
    private function sendHeaders() {
        $mimeType = $this->getMimeType();
        
        // Headers de base
        header('Content-Type: ' . $mimeType);
        header('Accept-Ranges: bytes');
        header('Content-Length: ' . $this->length);
        
        // Cache optimisé pour les vidéos
        header('Cache-Control: public, max-age=2592000'); // 30 jours
        header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 2592000) . ' GMT');
        
        // Headers de sécurité
        header('X-Content-Type-Options: nosniff');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        
        // Gestion des requêtes de plage
        if (isset($_SERVER['HTTP_RANGE'])) {
            http_response_code(206); // Partial Content
            header("Content-Range: bytes {$this->start}-{$this->end}/{$this->fileSize}");
        } else {
            http_response_code(200);
        }
        
        // Optimisation pour éviter les erreurs HTTP/2
        header('Connection: Keep-Alive');
        header('Keep-Alive: timeout=5, max=100');
    }
    
    /**
     * Détermine le type MIME du fichier vidéo
     */
    private function getMimeType() {
        $extension = strtolower(pathinfo($this->filePath, PATHINFO_EXTENSION));
        
        switch ($extension) {
            case 'mp4':
                return 'video/mp4';
            case 'webm':
                return 'video/webm';
            case 'mov':
                return 'video/quicktime';
            case 'avi':
                return 'video/x-msvideo';
            default:
                return 'application/octet-stream';
        }
    }
    
    /**
     * Stream le fichier vidéo par chunks
     */
    private function streamFile() {
        $chunkSize = 8192; // 8KB chunks pour un streaming fluide
        $handle = fopen($this->filePath, 'rb');
        
        if (!$handle) {
            http_response_code(500);
            exit('Erreur lors de l\'ouverture du fichier');
        }
        
        // Se positionner au début de la plage demandée
        fseek($handle, $this->start);
        
        $bytesRemaining = $this->length;
        
        while ($bytesRemaining > 0 && !feof($handle)) {
            $bytesToRead = min($chunkSize, $bytesRemaining);
            $data = fread($handle, $bytesToRead);
            
            if ($data === false) {
                break;
            }
            
            echo $data;
            flush();
            
            $bytesRemaining -= strlen($data);
            
            // Vérification de la connexion client
            if (connection_aborted()) {
                break;
            }
        }
        
        fclose($handle);
    }
    
    /**
     * Méthode principale pour streamer la vidéo
     */
    public function stream() {
        $this->parseRange();
        $this->sendHeaders();
        $this->streamFile();
    }
}

// Traitement de la requête
if (isset($_GET['file'])) {
    $requestedFile = $_GET['file'];
    
    // Sécurité : validation du chemin
    $requestedFile = str_replace(['../', '.\\', '..\\'], '', $requestedFile);
    
    // Nettoyer le chemin : retirer les / du début
    $requestedFile = ltrim($requestedFile, '/\\');
    
    // Mappage des anciens chemins vers les nouveaux
    $pathMapping = [
        'videos/compressed/' => 'media/videos/backgrounds/',
        'videos/' => 'media/videos/backgrounds/'
    ];
    
    foreach ($pathMapping as $oldPath => $newPath) {
        if (strpos($requestedFile, $oldPath) === 0) {
            $requestedFile = str_replace($oldPath, $newPath, $requestedFile);
            break;
        }
    }
    
    // Construire le chemin complet
    $fullPath = __DIR__ . DIRECTORY_SEPARATOR . $requestedFile;
    
    // Debug : afficher les chemins (à supprimer en production)
    error_log("Chemin demandé: " . $_GET['file']);
    error_log("Chemin nettoyé: " . $requestedFile);
    error_log("Chemin complet: " . $fullPath);
    error_log("Fichier existe: " . (file_exists($fullPath) ? 'OUI' : 'NON'));
    
    // Vérification que le fichier est dans un dossier autorisé
    $allowedDirs = ['media/videos/', 'assets-a-venir/organise/multimedia/video/'];
    $isAllowed = false;
    
    foreach ($allowedDirs as $allowedDir) {
        if (strpos($requestedFile, $allowedDir) === 0) {
            $isAllowed = true;
            break;
        }
    }
    
    if (!$isAllowed) {
        http_response_code(403);
        error_log("Accès interdit pour: " . $requestedFile);
        exit('Accès interdit - Dossier non autorisé');
    }
    
    // Vérifier que le fichier existe
    if (!file_exists($fullPath)) {
        http_response_code(404);
        error_log("Fichier non trouvé: " . $fullPath);
        exit('Fichier vidéo non trouvé: ' . basename($fullPath));
    }
    
    $streamer = new VideoStreamer($fullPath);
    $streamer->stream();
} else {
    http_response_code(400);
    exit('Paramètre file manquant');
}
?>