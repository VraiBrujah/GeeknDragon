<?php
declare(strict_types=1);

namespace GeeknDragon\Service;

use PDO;
use PDOException;

/**
 * Service centralisé de base de données SQLite
 * Gère la connexion unique à la base user-system
 */
class DatabaseService
{
    private static ?PDO $instance = null;
    private static string $dbPath = '';
    
    /**
     * Initialise le chemin de la base de données
     */
    public static function init(string $dbPath): void
    {
        self::$dbPath = $dbPath;
    }
    
    /**
     * Retourne l'instance PDO unique (Singleton)
     */
    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            if (empty(self::$dbPath)) {
                // Chemin par défaut si non initialisé
                self::$dbPath = __DIR__ . '/../../user-system/database.db';
            }
            
            try {
                // Créer le dossier si nécessaire
                $dbDir = dirname(self::$dbPath);
                if (!is_dir($dbDir)) {
                    mkdir($dbDir, 0755, true);
                }
                
                $dsn = "sqlite:" . self::$dbPath;
                self::$instance = new PDO($dsn);
                self::$instance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                
                // Activer les clés étrangères dans SQLite
                self::$instance->exec('PRAGMA foreign_keys = ON');
                
                // Initialiser les tables si la base est vide
                self::initializeTables();
                
            } catch (PDOException $e) {
                throw new \RuntimeException("Erreur connexion base de données: " . $e->getMessage());
            }
        }
        
        return self::$instance;
    }
    
    /**
     * Initialise les tables si elles n'existent pas
     */
    private static function initializeTables(): void
    {
        try {
            $pdo = self::$instance;
            
            // Vérifier si les tables existent
            $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
            $usersExists = $stmt->fetch() !== false;
            
            $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='user_invoices'");
            $invoicesExists = $stmt->fetch() !== false;
            
            // Créer les tables principales si nécessaire
            if (!$usersExists) {
                self::createMainTables();
            }
            
            // Créer les tables de factures si nécessaire
            if (!$invoicesExists) {
                self::createInvoiceTables();
            }
            
        } catch (PDOException $e) {
            error_log("Erreur initialisation tables: " . $e->getMessage());
        }
    }
    
    /**
     * Crée les tables principales du système utilisateur
     */
    private static function createMainTables(): void
    {
        $schemaPath = __DIR__ . '/../../user-system/database-schema.sql';
        
        if (file_exists($schemaPath)) {
            $schema = file_get_contents($schemaPath);
            
            // Diviser le schéma en requêtes individuelles
            $statements = array_filter(
                array_map('trim', explode(';', $schema)),
                fn($stmt) => !empty($stmt) && !str_starts_with($stmt, '--')
            );
            
            foreach ($statements as $statement) {
                if (!empty($statement)) {
                    self::$instance->exec($statement);
                }
            }
        }
    }
    
    /**
     * Crée les tables de factures
     */
    private static function createInvoiceTables(): void
    {
        $schemaPath = __DIR__ . '/../../user-system/database-invoices-schema.sql';
        
        if (file_exists($schemaPath)) {
            $schema = file_get_contents($schemaPath);
            
            // Diviser le schéma en requêtes individuelles
            $statements = array_filter(
                array_map('trim', explode(';', $schema)),
                fn($stmt) => !empty($stmt) && !str_starts_with($stmt, '--')
            );
            
            foreach ($statements as $statement) {
                if (!empty($statement)) {
                    self::$instance->exec($statement);
                }
            }
        }
    }
    
    /**
     * Réinitialise la connexion (pour les tests)
     */
    public static function reset(): void
    {
        self::$instance = null;
    }
    
    /**
     * Vérifie l'état de la base et la répare si nécessaire
     */
    public static function healthCheck(): array
    {
        try {
            $pdo = self::getInstance();
            
            // Vérifier l'intégrité
            $stmt = $pdo->query("PRAGMA integrity_check");
            $integrity = $stmt->fetchColumn();
            
            // Compter les tables
            $stmt = $pdo->query("SELECT COUNT(*) FROM sqlite_master WHERE type='table'");
            $tableCount = $stmt->fetchColumn();
            
            // Compter les utilisateurs
            $stmt = $pdo->query("SELECT COUNT(*) FROM users");
            $userCount = $stmt->fetchColumn();
            
            return [
                'status' => 'ok',
                'integrity' => $integrity,
                'tables' => $tableCount,
                'users' => $userCount,
                'database_path' => self::$dbPath
            ];
            
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'error' => $e->getMessage(),
                'database_path' => self::$dbPath
            ];
        }
    }
    
    /**
     * Exécute une migration de données
     */
    public static function migrate(string $migrationScript): bool
    {
        try {
            $pdo = self::getInstance();
            $pdo->exec($migrationScript);
            return true;
        } catch (PDOException $e) {
            error_log("Erreur migration: " . $e->getMessage());
            return false;
        }
    }
}