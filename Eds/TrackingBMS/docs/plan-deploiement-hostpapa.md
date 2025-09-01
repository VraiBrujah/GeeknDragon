# Plan de Déploiement HostPapa - TrackingBMS

**Version :** 1.0  
**Date :** 2025-09-01  
**Répertoire de Travail :** `C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\TrackingBMS`

## 1. Analyse de l'Environnement HostPapa

### 1.1 Spécifications Techniques HostPapa

#### Caractéristiques Confirmées
- **PHP** : Versions 7.4, 8.0, 8.1, 8.2 disponibles
- **MySQL** : Version 8.0 avec bases multiples
- **Apache** : Avec mod_rewrite activé
- **SSL** : Let's Encrypt gratuit inclus
- **Cron Jobs** : Disponibles via cPanel
- **Storage** : SSD avec quotas par plan

#### Limitations Identifiées
- **Ressources** : CPU et RAM limitées selon plan
- **Connexions simultanées** : Limitées (max 25-100 selon plan)  
- **Timeout** : Scripts limités à 120-300 secondes
- **File Upload** : Limitée à 64MB par défaut
- **Email** : Limites d'envoi quotidien (200-500 selon plan)

### 1.2 Plan Recommandé HostPapa

**Plan Business Pro Recommandé :**
- **Storage** : 100 GB SSD
- **Bandwidth** : Illimité
- **Domaines** : Illimités
- **Bases MySQL** : Illimitées
- **Email** : 500/jour
- **SSL** : Inclus
- **cPanel** : Accès complet
- **Prix** : ~15$/mois CAD

## 2. Architecture de Déploiement

### 2.1 Structure des Répertoires

```
/public_html/
├── trackingbms/                    # Application principale
│   ├── public/                     # Dossier web accessible
│   │   ├── index.php              # Point d'entrée unique
│   │   ├── api/                   # API endpoints
│   │   ├── assets/                # CSS, JS, images
│   │   │   ├── css/
│   │   │   │   ├── trackingbms.min.css
│   │   │   │   └── charts.css
│   │   │   ├── js/
│   │   │   │   ├── trackingbms.min.js
│   │   │   │   ├── chart.umd.js
│   │   │   │   └── modules/
│   │   │   └── images/
│   │   ├── uploads/               # Fichiers uploadés
│   │   └── docs/                  # Documentation API
│   │
│   ├── app/                       # Code source sécurisé
│   │   ├── modules/               # Modules applicatifs
│   │   │   ├── core/
│   │   │   ├── auth/
│   │   │   ├── gateway/
│   │   │   ├── bms-connector/
│   │   │   ├── data-processor/
│   │   │   ├── database/
│   │   │   └── web-interface/
│   │   ├── config/                # Configuration
│   │   ├── bootstrap/             # Initialisation
│   │   └── vendor/                # Dépendances Composer
│   │
│   ├── storage/                   # Stockage application
│   │   ├── logs/                  # Logs système
│   │   ├── cache/                 # Cache fichiers
│   │   ├── sessions/              # Sessions PHP
│   │   └── temp/                  # Fichiers temporaires
│   │
│   └── database/                  # Scripts et sauvegardes
│       ├── migrations/            # Scripts migration
│       ├── seeds/                 # Données test
│       ├── backups/               # Sauvegardes auto
│       └── scripts/               # Scripts maintenance
│
├── ssl/                           # Certificats SSL
├── logs/                          # Logs serveur
└── backups/                       # Sauvegardes complètes
```

### 2.2 Configuration Apache (.htaccess)

```apache
# /public_html/trackingbms/public/.htaccess
# Configuration Apache pour TrackingBMS

# Performance et sécurité
<IfModule mod_headers.c>
    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' ws: wss:;"
    
    # CORS pour API
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
</IfModule>

# Compression Gzip
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache navigateur
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 6 months"
    ExpiresByType image/jpg "access plus 6 months"
    ExpiresByType image/jpeg "access plus 6 months"
    ExpiresByType image/gif "access plus 6 months"
    ExpiresByType image/webp "access plus 6 months"
    ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# Réécriture URL
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Redirection HTTPS forcée
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    
    # Point d'entrée unique pour l'application
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ index.php [QSA,L]
    
    # API routing
    RewriteRule ^api/(.*)$ api/index.php [QSA,L]
</IfModule>

# Sécurité fichiers
<Files "*.env">
    Order Allow,Deny
    Deny from all
</Files>

<Files "composer.json">
    Order Allow,Deny
    Deny from all
</Files>

<Files "composer.lock">
    Order Allow,Deny
    Deny from all
</Files>

# Bloquage extensions dangereuses
<FilesMatch "\.(inc|conf|sql|bak|tmp)$">
    Order Allow,Deny
    Deny from all
</FilesMatch>

# Limitation upload
LimitRequestBody 67108864  # 64MB max
```

### 2.3 Configuration PHP (php.ini personnalisé)

```ini
# /public_html/trackingbms/app/config/php.ini
# Configuration PHP optimisée pour HostPapa

[PHP]
; Ressources optimisées pour hébergement partagé
memory_limit = 256M
max_execution_time = 120
max_input_time = 60
post_max_size = 64M
upload_max_filesize = 64M

; Sessions
session.gc_probability = 1
session.gc_divisor = 1000
session.gc_maxlifetime = 3600
session.cookie_secure = 1
session.cookie_httponly = 1
session.cookie_samesite = "Strict"
session.use_strict_mode = 1

; Sécurité
expose_php = Off
allow_url_fopen = Off
allow_url_include = Off
enable_dl = Off
file_uploads = On
max_file_uploads = 10

; Logs et erreurs
log_errors = On
error_log = /home/user/public_html/trackingbms/storage/logs/php-error.log
display_errors = Off
display_startup_errors = Off

; Optimisations
opcache.enable = 1
opcache.enable_cli = 0
opcache.memory_consumption = 128
opcache.interned_strings_buffer = 8
opcache.max_accelerated_files = 4000
opcache.revalidate_freq = 2
opcache.save_comments = 1
opcache.enable_file_override = 0

; Configuration pour WebSocket (ReactPHP)
; Note: WebSocket via port alternatif nécessaire sur hébergement partagé
```

## 3. Processus de Déploiement

### 3.1 Script d'Installation Automatique

```bash
#!/bin/bash
# /scripts/deploy-hostpapa.sh
# Script de déploiement automatique pour HostPapa

set -e  # Arrêt en cas d'erreur

# Configuration
DOMAIN="trackingbms.geekndragon.com"
DB_PREFIX="trackbms_"
APP_ENV="production"

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

log "=== Déploiement TrackingBMS sur HostPapa ==="

# Étape 1: Vérification environnement
log "Vérification de l'environnement HostPapa..."

if ! command -v php &> /dev/null; then
    error "PHP n'est pas disponible"
fi

PHP_VERSION=$(php -v | head -n1 | grep -oP '\d+\.\d+')
if [[ $(echo "$PHP_VERSION < 8.1" | bc) -eq 1 ]]; then
    error "PHP 8.1+ requis. Version détectée: $PHP_VERSION"
fi

log "PHP $PHP_VERSION détecté ✓"

# Étape 2: Création structure répertoires
log "Création de la structure de répertoires..."

mkdir -p /home/user/public_html/trackingbms/{public,app,storage,database}
mkdir -p /home/user/public_html/trackingbms/storage/{logs,cache,sessions,temp}
mkdir -p /home/user/public_html/trackingbms/database/{migrations,seeds,backups,scripts}
mkdir -p /home/user/public_html/trackingbms/public/{assets,uploads,docs}
mkdir -p /home/user/public_html/trackingbms/public/assets/{css,js,images}

# Permissions sécurisées
find /home/user/public_html/trackingbms -type d -exec chmod 755 {} \;
find /home/user/public_html/trackingbms -type f -exec chmod 644 {} \;
chmod 755 /home/user/public_html/trackingbms/public
chmod -R 777 /home/user/public_html/trackingbms/storage
chmod -R 777 /home/user/public_html/trackingbms/database/backups

log "Structure créée ✓"

# Étape 3: Installation Composer
log "Installation des dépendances Composer..."

cd /home/user/public_html/trackingbms/app
if [ ! -f composer.phar ]; then
    curl -sS https://getcomposer.org/installer | php
fi

./composer.phar install --no-dev --optimize-autoloader
log "Dépendances installées ✓"

# Étape 4: Configuration environnement
log "Configuration de l'environnement..."

cat > /home/user/public_html/trackingbms/app/.env << EOF
# Configuration TrackingBMS Production HostPapa
APP_NAME="TrackingBMS"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://${DOMAIN}

# Base de données
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=${DB_PREFIX}core
DB_USERNAME=\${DB_USER}
DB_PASSWORD=\${DB_PASS}

# Cache et sessions
CACHE_DRIVER=file
SESSION_DRIVER=file
SESSION_LIFETIME=120

# Mail
MAIL_DRIVER=smtp
MAIL_HOST=mail.${DOMAIN}
MAIL_PORT=587
MAIL_USERNAME=\${MAIL_USER}
MAIL_PASSWORD=\${MAIL_PASS}
MAIL_ENCRYPTION=tls

# Sécurité
APP_KEY=\$(openssl rand -base64 32)
JWT_SECRET=\$(openssl rand -base64 64)
ENCRYPTION_KEY=\$(openssl rand -base64 32)

# WebSocket (port alternatif pour HostPapa)
WEBSOCKET_HOST=0.0.0.0
WEBSOCKET_PORT=8080
WEBSOCKET_SSL=false

# Logs
LOG_CHANNEL=daily
LOG_LEVEL=info
LOG_DAYS=14

# Performance
OPCACHE_ENABLED=true
CACHE_ENABLED=true
MINIFY_ENABLED=true
EOF

chmod 600 /home/user/public_html/trackingbms/app/.env
log "Configuration environnement créée ✓"

# Étape 5: Installation base de données
log "Création des bases de données..."

# Script SQL d'installation
mysql -h localhost -u $DB_USER -p$DB_PASS << EOF
-- Création base core
CREATE DATABASE IF NOT EXISTS ${DB_PREFIX}core
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

-- Base client exemple
CREATE DATABASE IF NOT EXISTS ${DB_PREFIX}client_1_batteries
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

-- Utilisateur application
CREATE USER IF NOT EXISTS '${DB_PREFIX}app'@'localhost' IDENTIFIED BY '\$DB_APP_PASS';
GRANT ALL PRIVILEGES ON ${DB_PREFIX}*.* TO '${DB_PREFIX}app'@'localhost';
FLUSH PRIVILEGES;

-- Installation schémas
USE ${DB_PREFIX}core;
SOURCE /home/user/public_html/trackingbms/database/schemas/001_create_core.sql;

USE ${DB_PREFIX}client_1_batteries;
SOURCE /home/user/public_html/trackingbms/database/templates/client_batteries_template.sql;
EOF

log "Bases de données créées ✓"

# Étape 6: Configuration Apache
log "Configuration Apache (.htaccess)..."

cp /home/user/public_html/trackingbms/app/config/htaccess.conf /home/user/public_html/trackingbms/public/.htaccess

# Configuration domaine principal
cat > /home/user/public_html/.htaccess << EOF
# Redirection vers TrackingBMS
RewriteEngine On
RewriteCond %{HTTP_HOST} ^(www\.)?${DOMAIN}$ [NC]
RewriteCond %{REQUEST_URI} !^/trackingbms/public/
RewriteRule ^(.*)$ /trackingbms/public/\$1 [L,QSA]
EOF

log "Configuration Apache terminée ✓"

# Étape 7: Configuration cron jobs
log "Configuration des tâches cron..."

# Script pour ajouter via cPanel API ou manuellement
cat > /home/user/public_html/trackingbms/database/scripts/cron-setup.txt << EOF
# Tâches cron à ajouter via cPanel:

# Sauvegarde quotidienne (02:00)
0 2 * * * /usr/bin/php /home/user/public_html/trackingbms/app/console.php backup:create

# Nettoyage logs hebdomadaire (dimanche 03:00)  
0 3 * * 0 /usr/bin/php /home/user/public_html/trackingbms/app/console.php logs:cleanup

# Agrégation données horaires (chaque heure)
0 * * * * /usr/bin/php /home/user/public_html/trackingbms/app/console.php data:aggregate-hourly

# Vérification santé système (toutes les 5 minutes)
*/5 * * * * /usr/bin/php /home/user/public_html/trackingbms/app/console.php system:health-check

# Nettoyage cache (quotidien 04:00)
0 4 * * * /usr/bin/php /home/user/public_html/trackingbms/app/console.php cache:clear
EOF

log "Configuration cron préparée ✓"

# Étape 8: Tests de connectivité
log "Tests de connectivité et validation..."

# Test base de données
php -r "
try {
    \$pdo = new PDO('mysql:host=localhost;dbname=${DB_PREFIX}core', '${DB_USER}', '${DB_PASS}');
    echo 'Connexion DB: OK\n';
} catch(Exception \$e) {
    echo 'Erreur DB: ' . \$e->getMessage() . '\n';
    exit(1);
}
"

# Test écriture fichiers
touch /home/user/public_html/trackingbms/storage/test.txt
if [ -f /home/user/public_html/trackingbms/storage/test.txt ]; then
    rm /home/user/public_html/trackingbms/storage/test.txt
    log "Permissions écriture: OK ✓"
else
    error "Problème permissions écriture"
fi

# Test PHP modules
php -m | grep -E "(pdo_mysql|json|curl|mbstring|openssl)" > /tmp/php_modules.txt
if [ $(wc -l < /tmp/php_modules.txt) -eq 5 ]; then
    log "Modules PHP requis: OK ✓"
else
    warn "Certains modules PHP peuvent manquer"
fi

rm -f /tmp/php_modules.txt

log "=== Déploiement terminé avec succès ! ==="
log "URL d'accès: https://${DOMAIN}"
log "Prochaines étapes:"
log "1. Configurer SSL via cPanel"
log "2. Ajouter les tâches cron via cPanel"  
log "3. Configurer les DNS si nécessaire"
log "4. Tester l'application complète"

exit 0
```

### 3.2 Scripts de Maintenance

```php
<?php
// /database/scripts/maintenance.php
// Scripts de maintenance HostPapa

class MaintenanceManager {
    
    private $config;
    private $pdo;
    
    public function __construct() {
        $this->loadConfig();
        $this->connectDatabase();
    }
    
    /**
     * Sauvegarde complète système
     */
    public function createBackup(): bool {
        try {
            $timestamp = date('Y-m-d_H-i-s');
            $backupDir = "/home/user/public_html/trackingbms/database/backups/{$timestamp}";
            
            if (!mkdir($backupDir, 0755, true)) {
                throw new Exception("Impossible de créer le répertoire de sauvegarde");
            }
            
            // Sauvegarde des bases de données
            $this->backupDatabases($backupDir);
            
            // Sauvegarde des fichiers uploadés
            $this->backupFiles($backupDir);
            
            // Compression
            $this->compressBackup($backupDir);
            
            // Nettoyage anciennes sauvegardes (garder 30 jours)
            $this->cleanupOldBackups();
            
            $this->log("Sauvegarde créée: {$timestamp}");
            return true;
            
        } catch (Exception $e) {
            $this->log("Erreur sauvegarde: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Sauvegarde bases de données
     */
    private function backupDatabases(string $backupDir): void {
        $databases = $this->getDatabases();
        
        foreach ($databases as $database) {
            $filename = "{$backupDir}/{$database}.sql";
            $command = "mysqldump -h localhost -u {$this->config['db_user']} -p{$this->config['db_pass']} {$database} > {$filename}";
            
            exec($command, $output, $returnCode);
            
            if ($returnCode !== 0) {
                throw new Exception("Erreur sauvegarde base {$database}");
            }
            
            // Compression individuelle
            exec("gzip {$filename}");
        }
    }
    
    /**
     * Nettoyage automatique
     */
    public function cleanup(): bool {
        try {
            // Nettoyage logs
            $this->cleanupLogs();
            
            // Nettoyage cache
            $this->cleanupCache();
            
            // Nettoyage sessions expirées
            $this->cleanupSessions();
            
            // Nettoyage fichiers temporaires
            $this->cleanupTempFiles();
            
            $this->log("Nettoyage terminé");
            return true;
            
        } catch (Exception $e) {
            $this->log("Erreur nettoyage: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Vérification santé système
     */
    public function healthCheck(): array {
        $status = [
            'timestamp' => date('Y-m-d H:i:s'),
            'overall' => 'healthy',
            'checks' => []
        ];
        
        try {
            // Vérification base de données
            $status['checks']['database'] = $this->checkDatabase();
            
            // Vérification espace disque
            $status['checks']['disk_space'] = $this->checkDiskSpace();
            
            // Vérification mémoire PHP
            $status['checks']['memory'] = $this->checkMemoryUsage();
            
            // Vérification permissions fichiers
            $status['checks']['permissions'] = $this->checkFilePermissions();
            
            // Vérification connectivité BMS
            $status['checks']['bms_connectivity'] = $this->checkBMSConnectivity();
            
            // Déterminer statut global
            foreach ($status['checks'] as $check) {
                if ($check['status'] === 'error') {
                    $status['overall'] = 'error';
                    break;
                } elseif ($check['status'] === 'warning' && $status['overall'] === 'healthy') {
                    $status['overall'] = 'warning';
                }
            }
            
        } catch (Exception $e) {
            $status['overall'] = 'error';
            $status['error'] = $e->getMessage();
        }
        
        // Enregistrer résultat
        $this->saveHealthCheck($status);
        
        return $status;
    }
    
    /**
     * Optimisation base de données
     */
    public function optimizeDatabase(): bool {
        try {
            $databases = $this->getDatabases();
            
            foreach ($databases as $database) {
                $this->pdo->exec("USE {$database}");
                
                // Obtenir toutes les tables
                $stmt = $this->pdo->query("SHOW TABLES");
                $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
                
                foreach ($tables as $table) {
                    // Optimiser table
                    $this->pdo->exec("OPTIMIZE TABLE {$table}");
                    
                    // Analyser table
                    $this->pdo->exec("ANALYZE TABLE {$table}");
                }
            }
            
            $this->log("Optimisation base de données terminée");
            return true;
            
        } catch (Exception $e) {
            $this->log("Erreur optimisation DB: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Surveillance utilisation ressources
     */
    public function monitorResources(): array {
        $metrics = [
            'timestamp' => date('Y-m-d H:i:s'),
            'memory' => [
                'used' => memory_get_usage(true),
                'peak' => memory_get_peak_usage(true),
                'limit' => $this->parseSize(ini_get('memory_limit'))
            ],
            'disk' => [
                'free' => disk_free_space('/home/user'),
                'total' => disk_total_space('/home/user')
            ],
            'php' => [
                'version' => PHP_VERSION,
                'max_execution_time' => ini_get('max_execution_time'),
                'upload_max_filesize' => ini_get('upload_max_filesize')
            ]
        ];
        
        // Calculer pourcentages
        $metrics['memory']['usage_percent'] = ($metrics['memory']['used'] / $metrics['memory']['limit']) * 100;
        $metrics['disk']['usage_percent'] = (($metrics['disk']['total'] - $metrics['disk']['free']) / $metrics['disk']['total']) * 100;
        
        // Sauvegarder métriques
        $this->saveResourceMetrics($metrics);
        
        return $metrics;
    }
    
    private function checkDatabase(): array {
        try {
            $start = microtime(true);
            $stmt = $this->pdo->query("SELECT 1");
            $duration = (microtime(true) - $start) * 1000;
            
            return [
                'status' => 'healthy',
                'response_time' => round($duration, 2) . 'ms',
                'message' => 'Base de données accessible'
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Erreur connexion DB: ' . $e->getMessage()
            ];
        }
    }
    
    private function checkDiskSpace(): array {
        $free = disk_free_space('/home/user');
        $total = disk_total_space('/home/user');
        $used_percent = (($total - $free) / $total) * 100;
        
        $status = 'healthy';
        if ($used_percent > 90) {
            $status = 'error';
        } elseif ($used_percent > 80) {
            $status = 'warning';
        }
        
        return [
            'status' => $status,
            'used_percent' => round($used_percent, 2),
            'free_space' => $this->formatBytes($free),
            'message' => "Espace utilisé: {$used_percent}%"
        ];
    }
    
    private function log(string $message): void {
        $timestamp = date('Y-m-d H:i:s');
        $logFile = '/home/user/public_html/trackingbms/storage/logs/maintenance.log';
        file_put_contents($logFile, "[{$timestamp}] {$message}\n", FILE_APPEND | LOCK_EX);
    }
    
    private function formatBytes(int $bytes): string {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }
}

// Utilisation CLI
if (php_sapi_name() === 'cli') {
    $action = $argv[1] ?? 'help';
    $maintenance = new MaintenanceManager();
    
    switch ($action) {
        case 'backup':
            echo $maintenance->createBackup() ? "Sauvegarde créée\n" : "Erreur sauvegarde\n";
            break;
        case 'cleanup':
            echo $maintenance->cleanup() ? "Nettoyage terminé\n" : "Erreur nettoyage\n";
            break;
        case 'health':
            $status = $maintenance->healthCheck();
            echo json_encode($status, JSON_PRETTY_PRINT) . "\n";
            break;
        case 'optimize':
            echo $maintenance->optimizeDatabase() ? "Optimisation terminée\n" : "Erreur optimisation\n";
            break;
        case 'monitor':
            $metrics = $maintenance->monitorResources();
            echo json_encode($metrics, JSON_PRETTY_PRINT) . "\n";
            break;
        default:
            echo "Usage: php maintenance.php [backup|cleanup|health|optimize|monitor]\n";
    }
}
?>
```

## 4. Configuration SSL et Sécurité

### 4.1 Configuration SSL Let's Encrypt

```bash
# Configuration SSL automatique via cPanel
# HostPapa fournit Let's Encrypt gratuitement

# 1. Via cPanel > SSL/TLS > Let's Encrypt
# 2. Sélectionner domaine trackingbms.geekndragon.com
# 3. Activer "Force HTTPS Redirect"
# 4. Vérifier certificat actif

# Configuration manuelle si nécessaire:
# Redirection HTTPS dans .htaccess (déjà inclus)

# Vérification SSL
curl -I https://trackingbms.geekndragon.com
# Doit retourner 200 avec headers SSL
```

### 4.2 Sécurisation Avancée

```php
<?php
// /app/config/security.php
// Configuration sécurité avancée

return [
    
    // Protection CSRF
    'csrf' => [
        'enabled' => true,
        'expire_time' => 3600,
        'token_name' => '_token',
        'header_name' => 'X-CSRF-Token'
    ],
    
    // Rate Limiting
    'rate_limiting' => [
        'enabled' => true,
        'requests_per_minute' => 60,
        'requests_per_hour' => 1000,
        'ban_duration' => 900, // 15 minutes
        'whitelist_ips' => [
            // IPs de confiance
        ]
    ],
    
    // Validation entrées
    'input_validation' => [
        'max_input_length' => 10000,
        'allowed_tags' => '<p><br><strong><em><ul><ol><li>',
        'forbidden_patterns' => [
            '/(<script[^>]*>.*?<\/script>)/is',
            '/(javascript:|vbscript:|onload=|onerror=)/i',
            '/(<iframe[^>]*>.*?<\/iframe>)/is'
        ]
    ],
    
    // Sécurité sessions
    'session' => [
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Strict',
        'regenerate_interval' => 300 // 5 minutes
    ],
    
    // Audit et logging
    'audit' => [
        'log_all_requests' => false,
        'log_failed_auth' => true,
        'log_admin_actions' => true,
        'retention_days' => 90
    ]
];
?>
```

## 5. Monitoring et Alertes

### 5.1 Système de Monitoring

```php
<?php
// /app/modules/monitoring/HostPapaMonitor.php
// Monitoring spécifique HostPapa

class HostPapaMonitor {
    
    public function checkResourceLimits(): array {
        $status = [
            'cpu_usage' => $this->getCpuUsage(),
            'memory_usage' => $this->getMemoryUsage(),
            'database_connections' => $this->getDatabaseConnections(),
            'concurrent_users' => $this->getConcurrentUsers(),
            'email_quota' => $this->getEmailQuota()
        ];
        
        // Alertes si dépassement seuils
        foreach ($status as $metric => $value) {
            if ($this->isOverThreshold($metric, $value)) {
                $this->sendAlert($metric, $value);
            }
        }
        
        return $status;
    }
    
    private function getCpuUsage(): float {
        // Approximation via sys_getloadavg()
        $load = sys_getloadavg();
        return $load[0]; // 1 minute average
    }
    
    private function getMemoryUsage(): array {
        return [
            'current' => memory_get_usage(true),
            'peak' => memory_get_peak_usage(true),
            'limit' => $this->parseSize(ini_get('memory_limit')),
            'percentage' => (memory_get_usage(true) / $this->parseSize(ini_get('memory_limit'))) * 100
        ];
    }
    
    private function getDatabaseConnections(): int {
        try {
            $stmt = $this->pdo->query("SHOW STATUS WHERE Variable_name = 'Threads_connected'");
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return (int) $result['Value'];
        } catch (Exception $e) {
            return -1;
        }
    }
    
    private function sendAlert(string $metric, $value): void {
        $message = "ALERTE TrackingBMS: Seuil dépassé pour {$metric}: {$value}";
        
        // Email d'alerte
        mail(
            'admin@edsquebec.com',
            'TrackingBMS - Alerte Ressources',
            $message,
            'From: noreply@trackingbms.geekndragon.com'
        );
        
        // Log alerte
        error_log("[ALERT] {$message}");
    }
}
?>
```

## 6. Plan de Mise en Production

### 6.1 Checklist Pré-Déploiement

```markdown
# Checklist Déploiement TrackingBMS

## Préparation (J-7)
- [ ] Backup complet site existant
- [ ] Vérification compatibilité HostPapa
- [ ] Test déploiement sur environnement staging
- [ ] Validation performance avec données réelles
- [ ] Préparation documentation utilisateur

## Infrastructure (J-3)
- [ ] Configuration domaine/sous-domaine
- [ ] Installation certificat SSL
- [ ] Configuration base de données
- [ ] Test connectivité BMS
- [ ] Configuration email SMTP

## Déploiement (J-0)
- [ ] Upload fichiers application
- [ ] Installation dépendances Composer
- [ ] Migration base de données
- [ ] Configuration variables environnement
- [ ] Test fonctionnel complet
- [ ] Configuration monitoring

## Post-Déploiement (J+1)
- [ ] Monitoring ressources 24h
- [ ] Vérification logs erreurs
- [ ] Test charge utilisateurs
- [ ] Formation utilisateurs finaux
- [ ] Documentation maintenance

## Suivi (J+7)
- [ ] Analyse performance première semaine
- [ ] Ajustements configuration
- [ ] Optimisations identifiées
- [ ] Plan montée de version
```

### 6.2 Procédure de Rollback

```bash
#!/bin/bash
# /scripts/rollback.sh
# Procédure de rollback d'urgence

BACKUP_DATE="2025-09-01_14-30-00"
DOMAIN="trackingbms.geekndragon.com"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "=== DÉBUT ROLLBACK D'URGENCE ==="

# 1. Désactiver application (page maintenance)
cp /home/user/public_html/trackingbms/app/templates/maintenance.html /home/user/public_html/trackingbms/public/index.html

# 2. Restaurer base de données
log "Restauration base de données..."
cd /home/user/public_html/trackingbms/database/backups/${BACKUP_DATE}
for db_backup in *.sql.gz; do
    db_name=$(basename "$db_backup" .sql.gz)
    log "Restauration $db_name..."
    gunzip -c "$db_backup" | mysql -h localhost -u $DB_USER -p$DB_PASS $db_name
done

# 3. Restaurer fichiers
log "Restauration fichiers..."
if [ -f "files_backup.tar.gz" ]; then
    cd /home/user/public_html/trackingbms
    tar -xzf database/backups/${BACKUP_DATE}/files_backup.tar.gz
fi

# 4. Réactiver application
rm /home/user/public_html/trackingbms/public/index.html

# 5. Test rapide
if curl -f https://${DOMAIN} > /dev/null 2>&1; then
    log "Rollback réussi - Application accessible"
else
    log "ERREUR: Application non accessible après rollback"
fi

log "=== FIN ROLLBACK ==="
```

## 7. Coûts et Timeline

### 7.1 Estimation des Coûts

```
COÛTS HÉBERGEMENT HOSTPAPA:

Plan Business Pro (recommandé):
- 15$ CAD/mois
- 180$ CAD/année (avec réduction)

Domaine (.com):
- 15$ CAD/année

SSL Let's Encrypt:
- 0$ (inclus)

TOTAL ANNUEL: ~195$ CAD

COÛTS SUPPLÉMENTAIRES:

Backup externe (optionnel):
- Service cloud: 5-10$ CAD/mois

Monitoring externe (optionnel):
- Service tiers: 10-20$ CAD/mois

TOTAL AVEC OPTIONS: ~315$ CAD/année
```

### 7.2 Timeline de Déploiement

```
PHASE 1: PRÉPARATION (Semaine 1)
- Jour 1-2: Configuration environnement HostPapa
- Jour 3-4: Tests compatibilité et performance  
- Jour 5-7: Ajustements et optimisations

PHASE 2: DÉPLOIEMENT (Semaine 2)
- Jour 8-9: Upload et installation application
- Jour 10-11: Configuration base de données
- Jour 12-13: Tests fonctionnels complets
- Jour 14: Mise en production

PHASE 3: STABILISATION (Semaine 3)
- Jour 15-17: Monitoring intensif
- Jour 18-19: Corrections bugs identifiés
- Jour 20-21: Optimisations performance

PHASE 4: LIVRAISON (Semaine 4)
- Jour 22-24: Formation utilisateurs
- Jour 25-26: Documentation finale
- Jour 27-28: Handover et support
```

Ce plan de déploiement HostPapa garantit une mise en production sécurisée et optimisée du système TrackingBMS avec toutes les contraintes d'hébergement partagé prises en compte.