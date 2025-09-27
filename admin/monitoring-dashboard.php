<?php
/**
 * Tableau de bord de monitoring - Geek & Dragon
 *
 * Interface de visualisation des logs et métriques du système.
 * Accès admin uniquement, fonctionnement 100% local.
 *
 * @author Brujah
 * @version 1.0.0
 * @since 2025-09-27
 */

// Vérification de l'authentification admin
session_start();

$adminPasswordHash = $_ENV['ADMIN_PASSWORD_HASH'] ?? $_SERVER['ADMIN_PASSWORD_HASH'] ?? null;

if (!is_string($adminPasswordHash) || $adminPasswordHash === '') {
    error_log('Variable ADMIN_PASSWORD_HASH manquante pour le monitoring.');
    http_response_code(500);
    exit('Configuration d\'authentification manquante.');
}

// Gestion de l'authentification
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
        if (password_verify($_POST['password'], $adminPasswordHash)) {
            $_SESSION['admin_logged_in'] = true;
            header('Location: ' . $_SERVER['REQUEST_URI']);
            exit;
        } else {
            $erreurAuth = 'Mot de passe incorrect.';
        }
    }

    // Affichage du formulaire de connexion
    include_once __DIR__ . '/../includes/logging-system.php';
    log_warn('Tentative d\'accès au dashboard monitoring sans authentification', [
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'inconnue',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'inconnu'
    ]);
    ?>
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Authentification - Monitoring Geek &amp; Dragon</title>
        <style>
            body { font-family: Arial, sans-serif; background: #1a1a1a; color: #fff; margin: 0; padding: 50px; }
            .login-form { max-width: 400px; margin: 0 auto; background: #2d2d2d; padding: 30px; border-radius: 8px; }
            .login-form h1 { color: #4f46e5; margin-bottom: 20px; }
            .login-form input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #555; background: #333; color: #fff; border-radius: 4px; }
            .login-form button { width: 100%; padding: 12px; background: #4f46e5; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
            .login-form button:hover { background: #3730a3; }
            .error { color: #ef4444; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="login-form">
            <h1>🔍 Monitoring Geek &amp; Dragon</h1>
            <p>Accès administrateur requis</p>

            <?php if (isset($erreurAuth)): ?>
                <div class="error"><?= htmlspecialchars($erreurAuth) ?></div>
            <?php endif; ?>

            <form method="POST">
                <input type="password" name="password" placeholder="Mot de passe administrateur" required>
                <button type="submit">Se connecter</button>
            </form>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// Chargement du système de logs
require_once __DIR__ . '/../includes/logging-system.php';

// Configuration du système de logs
$configLogs = [
    'repertoire' => __DIR__ . '/../logs',
    'niveau_minimum' => 'DEBUG',
    'debug' => true
];

$systemeLog = LogManager::getInstance($configLogs);

// Enregistrement de l'accès au dashboard
log_info('Accès au dashboard de monitoring', [
    'admin_ip' => $_SERVER['REMOTE_ADDR'] ?? 'inconnue',
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'inconnu'
]);

// Gestion des actions AJAX
if (isset($_GET['action'])) {
    header('Content-Type: application/json');

    try {
        switch ($_GET['action']) {
            case 'stats':
                echo json_encode($systemeLog->obtenirStatistiques());
                break;

            case 'logs':
                $filtres = [];
                if (isset($_GET['niveau'])) {
                    $filtres['niveau'] = $_GET['niveau'];
                }

                $limite = (int)($_GET['limite'] ?? 100);
                $logs = $systemeLog->exporterLogs('json', $filtres);
                $logsArray = json_decode($logs, true);

                // Limiter et trier
                $logsArray = array_slice($logsArray, 0, $limite);

                echo json_encode([
                    'logs' => $logsArray,
                    'total' => count($logsArray)
                ]);
                break;

            case 'nettoyage':
                $supprimes = $systemeLog->nettoyerAnciennesLogs();
                echo json_encode([
                    'succes' => true,
                    'fichiers_supprimes' => $supprimes,
                    'message' => "{$supprimes} anciens fichiers supprimés"
                ]);
                break;

            case 'export':
                $format = $_GET['format'] ?? 'json';
                $contenu = $systemeLog->exporterLogs($format);

                $nomFichier = 'logs_geekndragon_' . date('Y-m-d_H-i-s') . '.' . $format;

                switch ($format) {
                    case 'csv':
                        header('Content-Type: text/csv');
                        break;
                    case 'txt':
                        header('Content-Type: text/plain');
                        break;
                    default:
                        header('Content-Type: application/json');
                }

                header('Content-Disposition: attachment; filename="' . $nomFichier . '"');
                echo $contenu;
                break;

            default:
                throw new RuntimeException('Action non reconnue');
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'erreur' => true,
            'message' => $e->getMessage()
        ]);
    }
    exit;
}

// Interface principale
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Monitoring - Geek &amp; Dragon</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
            color: #e2e8f0;
            min-height: 100vh;
        }

        .header {
            background: rgba(15, 23, 42, 0.9);
            backdrop-filter: blur(10px);
            padding: 1rem 2rem;
            border-bottom: 1px solid #334155;
            position: sticky;
            top: 0;
            z-index: 1000;
        }

        .header h1 {
            color: #60a5fa;
            font-size: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .header .status {
            font-size: 0.875rem;
            color: #94a3b8;
            margin-top: 0.25rem;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .card {
            background: rgba(30, 41, 59, 0.8);
            backdrop-filter: blur(10px);
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }

        .card h3 {
            color: #f8fafc;
            margin-bottom: 1rem;
            font-size: 1.125rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .stat-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }

        .stat {
            text-align: center;
            padding: 1rem;
            background: rgba(51, 65, 85, 0.5);
            border-radius: 8px;
            border: 1px solid #475569;
        }

        .stat-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: #60a5fa;
            margin-bottom: 0.25rem;
        }

        .stat-label {
            font-size: 0.875rem;
            color: #94a3b8;
        }

        .logs-container {
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid #334155;
            border-radius: 12px;
            margin-top: 2rem;
        }

        .logs-header {
            padding: 1.5rem;
            border-bottom: 1px solid #334155;
            display: flex;
            justify-content: between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .logs-controls {
            display: flex;
            gap: 1rem;
            align-items: center;
            flex-wrap: wrap;
        }

        .logs-controls select,
        .logs-controls button {
            padding: 0.5rem 1rem;
            background: #374151;
            border: 1px solid #4b5563;
            border-radius: 6px;
            color: #e2e8f0;
            font-size: 0.875rem;
        }

        .logs-controls button {
            background: #4f46e5;
            cursor: pointer;
            transition: background 0.2s;
        }

        .logs-controls button:hover {
            background: #3730a3;
        }

        .logs-list {
            max-height: 600px;
            overflow-y: auto;
        }

        .log-entry {
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #334155;
            font-family: 'JetBrains Mono', 'Fira Code', monospace;
            font-size: 0.875rem;
        }

        .log-entry:last-child {
            border-bottom: none;
        }

        .log-entry.DEBUG { border-left: 3px solid #6b7280; }
        .log-entry.INFO { border-left: 3px solid #3b82f6; }
        .log-entry.WARN { border-left: 3px solid #f59e0b; }
        .log-entry.ERROR { border-left: 3px solid #ef4444; }
        .log-entry.CRITICAL { border-left: 3px solid #dc2626; }

        .log-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }

        .log-level {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-weight: bold;
            font-size: 0.75rem;
        }

        .log-level.DEBUG { background: #374151; color: #9ca3af; }
        .log-level.INFO { background: #1e40af; color: #dbeafe; }
        .log-level.WARN { background: #d97706; color: #fef3c7; }
        .log-level.ERROR { background: #dc2626; color: #fecaca; }
        .log-level.CRITICAL { background: #991b1b; color: #fecaca; }

        .log-timestamp {
            color: #94a3b8;
            font-size: 0.75rem;
        }

        .log-message {
            margin-bottom: 0.5rem;
            color: #f1f5f9;
        }

        .log-context {
            background: rgba(51, 65, 85, 0.3);
            border-radius: 4px;
            padding: 0.5rem;
            font-size: 0.75rem;
            color: #cbd5e1;
            overflow-x: auto;
        }

        .loader {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 2px solid #334155;
            border-top: 2px solid #60a5fa;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .error-message {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid #ef4444;
            border-radius: 6px;
            padding: 1rem;
            color: #fecaca;
            margin: 1rem 0;
        }

        .success-message {
            background: rgba(34, 197, 94, 0.1);
            border: 1px solid #22c55e;
            border-radius: 6px;
            padding: 1rem;
            color: #bbf7d0;
            margin: 1rem 0;
        }

        .auto-refresh {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
        }

        .auto-refresh input[type="checkbox"] {
            margin: 0;
        }

        @media (max-width: 768px) {
            .container { padding: 1rem; }
            .grid { grid-template-columns: 1fr; }
            .logs-header { flex-direction: column; align-items: stretch; }
            .logs-controls { justify-content: center; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>
            🔍 Dashboard Monitoring Geek &amp; Dragon
        </h1>
        <div class="status" id="status">
            <span class="loader"></span> Chargement des données...
        </div>
    </div>

    <div class="container">
        <div class="grid">
            <!-- Statistiques système -->
            <div class="card">
                <h3>📊 Statistiques Système</h3>
                <div class="stat-grid" id="system-stats">
                    <div class="stat">
                        <div class="stat-value" id="php-version">-</div>
                        <div class="stat-label">Version PHP</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value" id="memory-used">-</div>
                        <div class="stat-label">Mémoire Utilisée</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value" id="memory-peak">-</div>
                        <div class="stat-label">Pic Mémoire</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value" id="uptime">-</div>
                        <div class="stat-label">Uptime Processus</div>
                    </div>
                </div>
            </div>

            <!-- Statistiques logs -->
            <div class="card">
                <h3>📝 Statistiques Logs</h3>
                <div class="stat-grid" id="logs-stats">
                    <div class="stat">
                        <div class="stat-value" id="logs-total-size">-</div>
                        <div class="stat-label">Taille Totale</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value" id="logs-files-count">-</div>
                        <div class="stat-label">Nombre Fichiers</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value" id="logs-level">-</div>
                        <div class="stat-label">Niveau Minimum</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value" id="metrics-count">-</div>
                        <div class="stat-label">Métriques Cache</div>
                    </div>
                </div>
            </div>

            <!-- Actions rapides -->
            <div class="card">
                <h3>⚡ Actions Rapides</h3>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <button onclick="nettoyerLogs()" class="logs-controls button">
                        🗑️ Nettoyer Anciens Logs
                    </button>
                    <button onclick="exporterLogs('json')" class="logs-controls button">
                        📥 Exporter JSON
                    </button>
                    <button onclick="exporterLogs('csv')" class="logs-controls button">
                        📊 Exporter CSV
                    </button>
                    <button onclick="rafraichirDonnees()" class="logs-controls button">
                        🔄 Rafraîchir
                    </button>
                </div>
            </div>
        </div>

        <!-- Interface des logs -->
        <div class="logs-container">
            <div class="logs-header">
                <h3>📋 Journal des Événements</h3>
                <div class="logs-controls">
                    <select id="log-level-filter" onchange="filtrerLogs()">
                        <option value="">Tous les niveaux</option>
                        <option value="DEBUG">DEBUG</option>
                        <option value="INFO">INFO</option>
                        <option value="WARN">WARN</option>
                        <option value="ERROR">ERROR</option>
                        <option value="CRITICAL">CRITICAL</option>
                    </select>

                    <select id="log-limit" onchange="filtrerLogs()">
                        <option value="50">50 derniers</option>
                        <option value="100" selected>100 derniers</option>
                        <option value="250">250 derniers</option>
                        <option value="500">500 derniers</option>
                    </select>

                    <div class="auto-refresh">
                        <input type="checkbox" id="auto-refresh" onchange="basculerAutoRefresh()" checked>
                        <label for="auto-refresh">Auto-rafraîchir</label>
                    </div>
                </div>
            </div>

            <div class="logs-list" id="logs-list">
                <div style="text-align: center; padding: 2rem; color: #94a3b8;">
                    <div class="loader"></div>
                    <p>Chargement des logs...</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Variables globales
        let autoRefreshInterval = null;
        let lastUpdate = Date.now();

        // Initialisation
        document.addEventListener('DOMContentLoaded', function() {
            rafraichirDonnees();
            demarrerAutoRefresh();
        });

        /**
         * Rafraîchit toutes les données du dashboard
         */
        async function rafraichirDonnees() {
            try {
                updateStatus('Mise à jour des données...');

                // Charger les statistiques
                await chargerStatistiques();

                // Charger les logs
                await filtrerLogs();

                lastUpdate = Date.now();
                updateStatus(`Dernière mise à jour : ${new Date().toLocaleTimeString()}`);

            } catch (error) {
                console.error('Erreur lors du rafraîchissement:', error);
                updateStatus('❌ Erreur lors de la mise à jour');
                afficherMessage('Erreur lors du rafraîchissement des données', 'error');
            }
        }

        /**
         * Charge les statistiques du système
         */
        async function chargerStatistiques() {
            const response = await fetch('?action=stats');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors du chargement des statistiques');
            }

            // Statistiques système
            document.getElementById('php-version').textContent = data.systeme.php_version;
            document.getElementById('memory-used').textContent = data.systeme.memoire_utilisee_mb + ' MB';
            document.getElementById('memory-peak').textContent = data.systeme.memoire_pic_mb + ' MB';
            document.getElementById('uptime').textContent = data.systeme.uptime_processus;

            // Statistiques logs
            document.getElementById('logs-total-size').textContent = data.logs.taille_totale;
            document.getElementById('logs-files-count').textContent = data.logs.nombre_fichiers;
            document.getElementById('logs-level').textContent = data.logs.niveau_minimum;
            document.getElementById('metrics-count').textContent = data.metriques_cache.nombre_metriques;
        }

        /**
         * Filtre et affiche les logs selon les critères sélectionnés
         */
        async function filtrerLogs() {
            const niveau = document.getElementById('log-level-filter').value;
            const limite = document.getElementById('log-limit').value;

            let url = '?action=logs&limite=' + limite;
            if (niveau) {
                url += '&niveau=' + niveau;
            }

            try {
                const response = await fetch(url);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Erreur lors du chargement des logs');
                }

                afficherLogs(data.logs);

            } catch (error) {
                console.error('Erreur lors du filtrage des logs:', error);
                document.getElementById('logs-list').innerHTML = `
                    <div class="error-message">
                        Erreur lors du chargement des logs : ${error.message}
                    </div>
                `;
            }
        }

        /**
         * Affiche la liste des logs dans l'interface
         */
        function afficherLogs(logs) {
            const container = document.getElementById('logs-list');

            if (!logs || logs.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: #94a3b8;">
                        Aucun log trouvé avec les critères sélectionnés.
                    </div>
                `;
                return;
            }

            const html = logs.map(log => {
                const date = new Date(log.date_iso || log.timestamp * 1000);
                const contexte = log.contexte && Object.keys(log.contexte).length > 0
                    ? JSON.stringify(log.contexte, null, 2)
                    : null;

                return `
                    <div class="log-entry ${log.niveau}">
                        <div class="log-meta">
                            <span class="log-level ${log.niveau}">${log.niveau}</span>
                            <span class="log-timestamp">${date.toLocaleString()}</span>
                        </div>
                        <div class="log-message">${escapeHtml(log.message)}</div>
                        ${contexte ? `<div class="log-context">${escapeHtml(contexte)}</div>` : ''}
                    </div>
                `;
            }).join('');

            container.innerHTML = html;
        }

        /**
         * Nettoie les anciens fichiers de logs
         */
        async function nettoyerLogs() {
            if (!confirm('Êtes-vous sûr de vouloir supprimer les anciens fichiers de logs ?')) {
                return;
            }

            try {
                const response = await fetch('?action=nettoyage');
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Erreur lors du nettoyage');
                }

                afficherMessage(data.message, 'success');
                rafraichirDonnees();

            } catch (error) {
                console.error('Erreur lors du nettoyage:', error);
                afficherMessage('Erreur lors du nettoyage : ' + error.message, 'error');
            }
        }

        /**
         * Exporte les logs dans le format spécifié
         */
        function exporterLogs(format) {
            const niveau = document.getElementById('log-level-filter').value;

            let url = `?action=export&format=${format}`;
            if (niveau) {
                url += '&niveau=' + niveau;
            }

            // Ouvrir le téléchargement dans une nouvelle fenêtre
            window.open(url);
        }

        /**
         * Active/désactive le rafraîchissement automatique
         */
        function basculerAutoRefresh() {
            const checkbox = document.getElementById('auto-refresh');

            if (checkbox.checked) {
                demarrerAutoRefresh();
            } else {
                arreterAutoRefresh();
            }
        }

        /**
         * Démarre le rafraîchissement automatique
         */
        function demarrerAutoRefresh() {
            if (autoRefreshInterval) {
                clearInterval(autoRefreshInterval);
            }

            autoRefreshInterval = setInterval(() => {
                rafraichirDonnees();
            }, 10000); // Toutes les 10 secondes
        }

        /**
         * Arrête le rafraîchissement automatique
         */
        function arreterAutoRefresh() {
            if (autoRefreshInterval) {
                clearInterval(autoRefreshInterval);
                autoRefreshInterval = null;
            }
        }

        /**
         * Met à jour le message de statut
         */
        function updateStatus(message) {
            document.getElementById('status').innerHTML = message;
        }

        /**
         * Affiche un message de notification
         */
        function afficherMessage(message, type = 'info') {
            const className = type === 'error' ? 'error-message' : 'success-message';
            const messageElement = document.createElement('div');
            messageElement.className = className;
            messageElement.textContent = message;

            // Insérer avant le container principal
            const container = document.querySelector('.container');
            container.insertBefore(messageElement, container.firstChild);

            // Supprimer après 5 secondes
            setTimeout(() => {
                messageElement.remove();
            }, 5000);
        }

        /**
         * Échappe le HTML pour éviter les injections XSS
         */
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Nettoyage lors de la fermeture de la page
        window.addEventListener('beforeunload', function() {
            arreterAutoRefresh();
        });
    </script>
</body>
</html>