<?php
/**
 * Système de Logs Centralisé - Geek & Dragon
 *
 * Système autonome de monitoring et logging sans dépendances externes.
 * Conforme aux directives : offline, français, extensible, configurable.
 *
 * @author Brujah
 * @version 1.0.0
 * @since 2025-09-27
 */

/**
 * Gestionnaire principal des logs avec rotation automatique et métriques
 *
 * Fonctionnalités :
 * - Logs structurés avec niveaux (DEBUG, INFO, WARN, ERROR, CRITICAL)
 * - Rotation automatique par taille et date
 * - Contexte enrichi (utilisateur, IP, page, performance)
 * - Format JSON pour parsing facile
 * - Pas de dépendances externes (100% autonome)
 */
class SystemeLogsGeekDragon
{
    /** @var string Répertoire de stockage des logs */
    private string $repertoireLogs;

    /** @var string Niveau de log minimum */
    private string $niveauMinimum;

    /** @var int Taille maximale d'un fichier de log en octets */
    private int $tailleMaximale;

    /** @var int Nombre maximum de fichiers de rotation */
    private int $nombreRotations;

    /** @var array Cache des métriques en mémoire */
    private array $cacheMetriques = [];

    /** @var bool Mode debug activé */
    private bool $modeDebug;

    /** @var array Niveaux de log disponibles avec priorités */
    private const NIVEAUX = [
        'DEBUG' => 0,
        'INFO' => 1,
        'WARN' => 2,
        'ERROR' => 3,
        'CRITICAL' => 4
    ];

    /**
     * Constructeur du système de logs
     *
     * @param array $configuration Configuration du système
     * @throws RuntimeException Si la configuration est invalide
     */
    public function __construct(array $configuration = [])
    {
        $this->repertoireLogs = $configuration['repertoire'] ?? __DIR__ . '/../logs';
        $this->niveauMinimum = strtoupper($configuration['niveau_minimum'] ?? 'INFO');
        $this->tailleMaximale = $configuration['taille_maximale'] ?? 10 * 1024 * 1024; // 10MB
        $this->nombreRotations = $configuration['nombre_rotations'] ?? 5;
        $this->modeDebug = $configuration['debug'] ?? false;

        $this->validerConfiguration();
        $this->initialiserRepertoire();
    }

    /**
     * Enregistre un message de debug (niveau le plus bas)
     *
     * @param string $message Message à enregistrer
     * @param array $contexte Contexte additionnel
     * @return void
     */
    public function debug(string $message, array $contexte = []): void
    {
        $this->enregistrer('DEBUG', $message, $contexte);
    }

    /**
     * Enregistre un message d'information
     *
     * @param string $message Message à enregistrer
     * @param array $contexte Contexte additionnel
     * @return void
     */
    public function info(string $message, array $contexte = []): void
    {
        $this->enregistrer('INFO', $message, $contexte);
    }

    /**
     * Enregistre un avertissement
     *
     * @param string $message Message à enregistrer
     * @param array $contexte Contexte additionnel
     * @return void
     */
    public function warn(string $message, array $contexte = []): void
    {
        $this->enregistrer('WARN', $message, $contexte);
    }

    /**
     * Enregistre une erreur
     *
     * @param string $message Message à enregistrer
     * @param array $contexte Contexte additionnel
     * @return void
     */
    public function error(string $message, array $contexte = []): void
    {
        $this->enregistrer('ERROR', $message, $contexte);
    }

    /**
     * Enregistre une erreur critique
     *
     * @param string $message Message à enregistrer
     * @param array $contexte Contexte additionnel
     * @return void
     */
    public function critical(string $message, array $contexte = []): void
    {
        $this->enregistrer('CRITICAL', $message, $contexte);
    }

    /**
     * Enregistre une métrique de performance
     *
     * @param string $nom Nom de la métrique
     * @param float $valeur Valeur mesurée
     * @param string $unite Unité de mesure (ms, bytes, etc.)
     * @param array $tags Tags pour filtrage
     * @return void
     */
    public function metrique(string $nom, float $valeur, string $unite = '', array $tags = []): void
    {
        $metrique = [
            'nom' => $nom,
            'valeur' => $valeur,
            'unite' => $unite,
            'tags' => $tags,
            'timestamp' => microtime(true),
            'date_iso' => date('c')
        ];

        // Stocker en mémoire pour agrégation
        if (!isset($this->cacheMetriques[$nom])) {
            $this->cacheMetriques[$nom] = [];
        }
        $this->cacheMetriques[$nom][] = $metrique;

        // Écrire dans le fichier de métriques
        $this->ecrireFichier('metriques', json_encode($metrique) . "\n", FILE_APPEND);

        if ($this->modeDebug) {
            $this->debug("Métrique enregistrée : {$nom} = {$valeur} {$unite}", $metrique);
        }
    }

    /**
     * Enregistre les détails d'une requête HTTP
     *
     * @param float $tempsExecution Temps d'exécution en secondes
     * @param int $memoireUtilisee Mémoire utilisée en octets
     * @return void
     */
    public function requete(float $tempsExecution, int $memoireUtilisee): void
    {
        $contexte = [
            'methode' => $_SERVER['REQUEST_METHOD'] ?? 'CLI',
            'uri' => $_SERVER['REQUEST_URI'] ?? 'N/A',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'N/A',
            'ip_client' => $this->obtenirIpClient(),
            'temps_execution_ms' => round($tempsExecution * 1000, 2),
            'memoire_utilisee_mb' => round($memoireUtilisee / 1024 / 1024, 2),
            'memoire_pic_mb' => round(memory_get_peak_usage(true) / 1024 / 1024, 2)
        ];

        $niveau = $tempsExecution > 2.0 ? 'WARN' : 'INFO';
        $this->enregistrer($niveau, "Requête HTTP traitée", $contexte);

        // Métriques de performance
        $this->metrique('temps_reponse', $tempsExecution * 1000, 'ms', ['endpoint' => $contexte['uri']]);
        $this->metrique('memoire_utilisee', $memoireUtilisee, 'bytes', ['endpoint' => $contexte['uri']]);
    }

    /**
     * Enregistre une erreur avec sa stack trace
     *
     * @param Throwable $exception Exception à enregistrer
     * @param array $contexte Contexte additionnel
     * @return void
     */
    public function exception(Throwable $exception, array $contexte = []): void
    {
        $contexteException = [
            'exception_class' => get_class($exception),
            'message' => $exception->getMessage(),
            'code' => $exception->getCode(),
            'fichier' => $exception->getFile(),
            'ligne' => $exception->getLine(),
            'stack_trace' => $exception->getTraceAsString()
        ];

        $contexteComplet = array_merge($contexte, $contexteException);
        $this->critical("Exception non gérée : " . $exception->getMessage(), $contexteComplet);
    }

    /**
     * Obtient les statistiques d'utilisation du système
     *
     * @return array Statistiques détaillées
     */
    public function obtenirStatistiques(): array
    {
        $statistiques = [
            'systeme' => [
                'php_version' => PHP_VERSION,
                'memoire_limite' => ini_get('memory_limit'),
                'memoire_utilisee_mb' => round(memory_get_usage(true) / 1024 / 1024, 2),
                'memoire_pic_mb' => round(memory_get_peak_usage(true) / 1024 / 1024, 2),
                'uptime_processus' => $this->obtenirUptimeProcessus()
            ],
            'logs' => [
                'repertoire' => $this->repertoireLogs,
                'niveau_minimum' => $this->niveauMinimum,
                'taille_totale' => $this->calculerTailleLogs(),
                'nombre_fichiers' => count(glob($this->repertoireLogs . '/*.log'))
            ],
            'metriques_cache' => [
                'nombre_metriques' => array_sum(array_map('count', $this->cacheMetriques)),
                'types_metriques' => array_keys($this->cacheMetriques)
            ]
        ];

        return $statistiques;
    }

    /**
     * Nettoie les anciens logs selon la politique de rotation
     *
     * @return int Nombre de fichiers supprimés
     */
    public function nettoyerAnciennesLogs(): int
    {
        $fichiersSupprimes = 0;
        $motifs = ['app*.log', 'erreurs*.log', 'metriques*.log'];

        foreach ($motifs as $motif) {
            $fichiers = glob($this->repertoireLogs . '/' . $motif);

            // Trier par date de modification (plus ancien en premier)
            usort($fichiers, function($a, $b) {
                return filemtime($a) - filemtime($b);
            });

            // Supprimer les fichiers excédentaires
            $nombreFichiers = count($fichiers);
            if ($nombreFichiers > $this->nombreRotations) {
                $aSupprimer = array_slice($fichiers, 0, $nombreFichiers - $this->nombreRotations);
                foreach ($aSupprimer as $fichier) {
                    if (unlink($fichier)) {
                        $fichiersSupprimes++;
                    }
                }
            }
        }

        if ($fichiersSupprimes > 0) {
            $this->info("Nettoyage logs : {$fichiersSupprimes} fichiers supprimés");
        }

        return $fichiersSupprimes;
    }

    /**
     * Exporte les logs dans un format donné
     *
     * @param string $format Format d'export (json, csv, txt)
     * @param array $filtres Filtres à appliquer
     * @return string Contenu exporté
     */
    public function exporterLogs(string $format = 'json', array $filtres = []): string
    {
        $logs = $this->lireLogsAvecFiltres($filtres);

        switch (strtolower($format)) {
            case 'csv':
                return $this->convertirEnCSV($logs);
            case 'txt':
                return $this->convertirEnTexte($logs);
            case 'json':
            default:
                return json_encode($logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        }
    }

    // === MÉTHODES PRIVÉES ===

    /**
     * Enregistre un message avec le niveau spécifié
     *
     * @param string $niveau Niveau du message
     * @param string $message Message à enregistrer
     * @param array $contexte Contexte additionnel
     * @return void
     */
    public function enregistrer(string $niveau, string $message, array $contexte = []): void
    {
        // Vérifier si le niveau est suffisant
        if (self::NIVEAUX[$niveau] < self::NIVEAUX[$this->niveauMinimum]) {
            return;
        }

        $entree = [
            'timestamp' => microtime(true),
            'date_iso' => date('c'),
            'niveau' => $niveau,
            'message' => $message,
            'contexte' => $this->enrichirContexte($contexte),
            'processus_id' => getmypid(),
            'memoire_mb' => round(memory_get_usage(true) / 1024 / 1024, 2)
        ];

        $ligne = json_encode($entree, JSON_UNESCAPED_UNICODE) . "\n";

        // Écriture dans le fichier approprié
        $nomFichier = $niveau === 'ERROR' || $niveau === 'CRITICAL' ? 'erreurs' : 'app';
        $this->ecrireFichier($nomFichier, $ligne, FILE_APPEND);

        // En mode debug, afficher aussi en console
        if ($this->modeDebug && php_sapi_name() === 'cli') {
            echo "[{$niveau}] {$message}\n";
        }
    }

    /**
     * Enrichit le contexte avec des informations système
     *
     * @param array $contexte Contexte de base
     * @return array Contexte enrichi
     */
    private function enrichirContexte(array $contexte): array
    {
        $contexteEnrichi = $contexte;

        // Informations de session si disponibles
        if (session_status() === PHP_SESSION_ACTIVE) {
            $contexteEnrichi['session_id'] = session_id();
            $contexteEnrichi['utilisateur'] = $_SESSION['admin_logged_in'] ?? 'anonyme';
        }

        // Informations de requête HTTP
        if (isset($_SERVER['REQUEST_URI'])) {
            $contexteEnrichi['page'] = $_SERVER['REQUEST_URI'];
            $contexteEnrichi['referer'] = $_SERVER['HTTP_REFERER'] ?? null;
        }

        // Informations de performance
        $contexteEnrichi['temps_execution'] = round(microtime(true) - ($_SERVER['REQUEST_TIME_FLOAT'] ?? microtime(true)), 4);

        return $contexteEnrichi;
    }

    /**
     * Écrit dans un fichier de log avec rotation automatique
     *
     * @param string $typeFichier Type de fichier (app, erreurs, metriques)
     * @param string $contenu Contenu à écrire
     * @param int $drapeaux Drapeaux file_put_contents
     * @return void
     */
    private function ecrireFichier(string $typeFichier, string $contenu, int $drapeaux = 0): void
    {
        $cheminFichier = $this->repertoireLogs . "/{$typeFichier}.log";

        // Vérifier la rotation avant écriture
        if (file_exists($cheminFichier) && filesize($cheminFichier) >= $this->tailleMaximale) {
            $this->effectuerRotation($typeFichier);
        }

        file_put_contents($cheminFichier, $contenu, $drapeaux | LOCK_EX);
    }

    /**
     * Effectue la rotation d'un fichier de log
     *
     * @param string $typeFichier Type de fichier à faire tourner
     * @return void
     */
    private function effectuerRotation(string $typeFichier): void
    {
        $cheminBase = $this->repertoireLogs . "/{$typeFichier}";
        $cheminActuel = $cheminBase . '.log';

        // Déplacer les fichiers existants
        for ($i = $this->nombreRotations - 1; $i > 0; $i--) {
            $source = $cheminBase . '.' . ($i - 1 === 0 ? 'log' : ($i - 1));
            $destination = $cheminBase . '.' . $i;

            if (file_exists($source)) {
                rename($source, $destination);
            }
        }

        // Archiver le fichier actuel
        if (file_exists($cheminActuel)) {
            rename($cheminActuel, $cheminBase . '.1');
        }
    }

    /**
     * Valide la configuration fournie
     *
     * @throws RuntimeException Si la configuration est invalide
     * @return void
     */
    private function validerConfiguration(): void
    {
        if (!isset(self::NIVEAUX[$this->niveauMinimum])) {
            throw new RuntimeException("Niveau de log invalide : {$this->niveauMinimum}");
        }

        if ($this->tailleMaximale < 1024) {
            throw new RuntimeException("Taille maximale trop petite : {$this->tailleMaximale}");
        }

        if ($this->nombreRotations < 1) {
            throw new RuntimeException("Nombre de rotations doit être positif : {$this->nombreRotations}");
        }
    }

    /**
     * Initialise le répertoire de logs
     *
     * @throws RuntimeException Si le répertoire ne peut être créé
     * @return void
     */
    private function initialiserRepertoire(): void
    {
        if (!is_dir($this->repertoireLogs)) {
            if (!mkdir($this->repertoireLogs, 0755, true)) {
                throw new RuntimeException("Impossible de créer le répertoire de logs : {$this->repertoireLogs}");
            }
        }

        if (!is_writable($this->repertoireLogs)) {
            throw new RuntimeException("Répertoire de logs non accessible en écriture : {$this->repertoireLogs}");
        }
    }

    /**
     * Obtient l'adresse IP du client en gérant les proxies
     *
     * @return string Adresse IP du client
     */
    private function obtenirIpClient(): string
    {
        $headers = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP'];

        foreach ($headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ips = explode(',', $_SERVER[$header]);
                return trim($ips[0]);
            }
        }

        return $_SERVER['REMOTE_ADDR'] ?? 'inconnu';
    }

    /**
     * Calcule l'uptime du processus PHP actuel
     *
     * @return string Uptime formaté
     */
    private function obtenirUptimeProcessus(): string
    {
        $debut = $_SERVER['REQUEST_TIME_FLOAT'] ?? microtime(true);
        $duree = microtime(true) - $debut;

        return number_format($duree, 2) . 's';
    }

    /**
     * Calcule la taille totale des fichiers de logs
     *
     * @return string Taille formatée
     */
    private function calculerTailleLogs(): string
    {
        $taille = 0;
        $fichiers = glob($this->repertoireLogs . '/*.log');

        foreach ($fichiers as $fichier) {
            $taille += filesize($fichier);
        }

        return $this->formaterTaille($taille);
    }

    /**
     * Formate une taille en octets de manière lisible
     *
     * @param int $octets Nombre d'octets
     * @return string Taille formatée
     */
    private function formaterTaille(int $octets): string
    {
        $unites = ['B', 'KB', 'MB', 'GB'];
        $index = 0;

        while ($octets >= 1024 && $index < count($unites) - 1) {
            $octets /= 1024;
            $index++;
        }

        return round($octets, 2) . ' ' . $unites[$index];
    }

    /**
     * Lit les logs avec des filtres appliqués
     *
     * @param array $filtres Filtres à appliquer
     * @return array Logs filtrés
     */
    private function lireLogsAvecFiltres(array $filtres): array
    {
        $logs = [];
        $fichiers = glob($this->repertoireLogs . '/*.log');

        foreach ($fichiers as $fichier) {
            $lignes = file($fichier, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

            foreach ($lignes as $ligne) {
                $entree = json_decode($ligne, true);
                if ($entree && $this->correspondAuxFiltres($entree, $filtres)) {
                    $logs[] = $entree;
                }
            }
        }

        // Trier par timestamp
        usort($logs, function($a, $b) {
            return $b['timestamp'] <=> $a['timestamp'];
        });

        return $logs;
    }

    /**
     * Vérifie si une entrée correspond aux filtres
     *
     * @param array $entree Entrée de log
     * @param array $filtres Filtres à vérifier
     * @return bool True si correspond
     */
    private function correspondAuxFiltres(array $entree, array $filtres): bool
    {
        foreach ($filtres as $cle => $valeur) {
            if (!isset($entree[$cle]) || $entree[$cle] !== $valeur) {
                return false;
            }
        }
        return true;
    }

    /**
     * Convertit les logs en format CSV
     *
     * @param array $logs Logs à convertir
     * @return string CSV formaté
     */
    private function convertirEnCSV(array $logs): string
    {
        if (empty($logs)) {
            return '';
        }

        $csv = "Timestamp,Date,Niveau,Message,Contexte\n";

        foreach ($logs as $log) {
            $csv .= sprintf(
                "%s,%s,%s,%s,%s\n",
                $log['timestamp'] ?? '',
                $log['date_iso'] ?? '',
                $log['niveau'] ?? '',
                str_replace('"', '""', $log['message'] ?? ''),
                str_replace('"', '""', json_encode($log['contexte'] ?? []))
            );
        }

        return $csv;
    }

    /**
     * Convertit les logs en format texte lisible
     *
     * @param array $logs Logs à convertir
     * @return string Texte formaté
     */
    private function convertirEnTexte(array $logs): string
    {
        $texte = '';

        foreach ($logs as $log) {
            $texte .= sprintf(
                "[%s] %s: %s\n",
                $log['date_iso'] ?? '',
                $log['niveau'] ?? '',
                $log['message'] ?? ''
            );

            if (!empty($log['contexte'])) {
                $texte .= "  Contexte: " . json_encode($log['contexte'], JSON_UNESCAPED_UNICODE) . "\n";
            }

            $texte .= "\n";
        }

        return $texte;
    }
}

/**
 * Instance singleton du système de logs
 * Utilisée dans tout le projet via la fonction globale log_gd()
 */
class LogManager
{
    /** @var SystemeLogsGeekDragon|null Instance singleton */
    private static ?SystemeLogsGeekDragon $instance = null;

    /**
     * Obtient l'instance singleton du système de logs
     *
     * @param array $configuration Configuration optionnelle pour l'initialisation
     * @return SystemeLogsGeekDragon Instance du système de logs
     */
    public static function getInstance(array $configuration = []): SystemeLogsGeekDragon
    {
        if (self::$instance === null) {
            self::$instance = new SystemeLogsGeekDragon($configuration);
        }

        return self::$instance;
    }

    /**
     * Réinitialise l'instance (utile pour les tests)
     *
     * @return void
     */
    public static function resetInstance(): void
    {
        self::$instance = null;
    }
}

// === FONCTIONS GLOBALES DE COMMODITÉ ===

/**
 * Fonction globale d'accès au système de logs
 *
 * @return SystemeLogsGeekDragon Instance du système de logs
 */
function log_gd(): SystemeLogsGeekDragon
{
    return LogManager::getInstance();
}

/**
 * Enregistrement rapide d'un message d'information
 *
 * @param string $message Message à enregistrer
 * @param array $contexte Contexte optionnel
 * @return void
 */
function log_info(string $message, array $contexte = []): void
{
    log_gd()->info($message, $contexte);
}

/**
 * Enregistrement rapide d'une erreur
 *
 * @param string $message Message d'erreur
 * @param array $contexte Contexte optionnel
 * @return void
 */
function log_error(string $message, array $contexte = []): void
{
    log_gd()->error($message, $contexte);
}

/**
 * Enregistrement rapide d'un avertissement
 *
 * @param string $message Message d'avertissement
 * @param array $contexte Contexte optionnel
 * @return void
 */
function log_warn(string $message, array $contexte = []): void
{
    log_gd()->warn($message, $contexte);
}

/**
 * Enregistrement rapide d'une métrique
 *
 * @param string $nom Nom de la métrique
 * @param float $valeur Valeur
 * @param string $unite Unité
 * @param array $tags Tags
 * @return void
 */
function log_metric(string $nom, float $valeur, string $unite = '', array $tags = []): void
{
    log_gd()->metrique($nom, $valeur, $unite, $tags);
}