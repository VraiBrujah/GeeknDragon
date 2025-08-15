<?php
/**
 * Système de logging centralisé pour Geek & Dragon
 */

class Logger {
    private static $logPath;
    private static $maxFileSize = 10485760; // 10MB
    
    public static function init($logPath = null) {
        self::$logPath = $logPath ?? __DIR__ . '/../logs/app.log';
        
        // Créer le dossier de logs s'il n'existe pas
        $logDir = dirname(self::$logPath);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
    }
    
    public static function log($level, $message, $context = []) {
        if (!self::$logPath) {
            self::init();
        }
        
        // Rotation des logs si nécessaire
        self::rotateLogIfNeeded();
        
        $timestamp = date('Y-m-d H:i:s');
        $contextStr = !empty($context) ? ' ' . json_encode($context) : '';
        $logEntry = "[$timestamp] [$level] $message$contextStr" . PHP_EOL;
        
        file_put_contents(self::$logPath, $logEntry, FILE_APPEND | LOCK_EX);
    }
    
    public static function error($message, $context = []) {
        self::log('ERROR', $message, $context);
    }
    
    public static function warning($message, $context = []) {
        self::log('WARNING', $message, $context);
    }
    
    public static function info($message, $context = []) {
        self::log('INFO', $message, $context);
    }
    
    public static function debug($message, $context = []) {
        // Ne log les debug qu'en développement
        if (self::isDevelopment()) {
            self::log('DEBUG', $message, $context);
        }
    }
    
    private static function isDevelopment() {
        return in_array($_SERVER['HTTP_HOST'] ?? '', ['localhost', '127.0.0.1']) || 
               strpos($_SERVER['HTTP_HOST'] ?? '', '.local') !== false;
    }
    
    private static function rotateLogIfNeeded() {
        if (!file_exists(self::$logPath)) {
            return;
        }
        
        if (filesize(self::$logPath) > self::$maxFileSize) {
            $backupPath = self::$logPath . '.' . date('Y-m-d-H-i-s');
            rename(self::$logPath, $backupPath);
            
            // Garder seulement les 5 derniers backups
            $logDir = dirname(self::$logPath);
            $backups = glob($logDir . '/app.log.*');
            if (count($backups) > 5) {
                sort($backups);
                for ($i = 0; $i < count($backups) - 5; $i++) {
                    unlink($backups[$i]);
                }
            }
        }
    }
}