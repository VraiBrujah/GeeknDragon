<?php
/**
 * Helper de gestion du mode debug et des logs
 *
 * Centralise la logique de logging conditionnel selon l'environnement.
 * Respecte la variable DEBUG_MODE documentée dans README.md
 *
 * @package GeeknDragon\Helpers
 */

if (!function_exists('is_debug_mode')) {
    /**
     * Vérifie si le mode debug est activé
     *
     * @return bool True si DEBUG_MODE est activé
     */
    function is_debug_mode(): bool
    {
        static $debug = null;

        if ($debug === null) {
            $debug = filter_var(
                getEnvironmentVariable('DEBUG_MODE', 'false'),
                FILTER_VALIDATE_BOOLEAN
            );
        }

        return $debug;
    }
}

if (!function_exists('debug_log')) {
    /**
     * Log un message uniquement en mode debug
     *
     * @param mixed $message Message à logger
     * @param string $context Contexte optionnel (ex: 'Snipcart', 'I18n')
     * @return void
     */
    function debug_log($message, string $context = ''): void
    {
        if (!is_debug_mode()) {
            return;
        }

        $prefix = $context ? "[{$context}] " : '';

        if (is_array($message) || is_object($message)) {
            $message = print_r($message, true);
        }

        error_log($prefix . $message);
    }
}

if (!function_exists('should_suppress_console_logs')) {
    /**
     * Détermine si les logs console doivent être supprimés
     *
     * En production (!DEBUG_MODE), on peut supprimer certains logs verbeux
     * de bibliothèques tierces (Snipcart, GTag) pour nettoyer la console.
     *
     * @param string $source Source des logs ('snipcart', 'gtag', etc.)
     * @return bool True si les logs doivent être supprimés
     */
    function should_suppress_console_logs(string $source = ''): bool
    {
        // En mode debug, toujours autoriser les logs
        if (is_debug_mode()) {
            return false;
        }

        // En production, supprimer uniquement les logs verbeux connus
        $verboseSources = ['snipcart', 'gtag', 'GTag'];

        if ($source && in_array(strtolower($source), array_map('strtolower', $verboseSources))) {
            return true;
        }

        return false;
    }
}

if (!function_exists('get_console_filter_script')) {
    /**
     * Génère le script de filtrage des logs console selon l'environnement
     *
     * @return string Code JavaScript à injecter
     */
    function get_console_filter_script(): string
    {
        if (is_debug_mode()) {
            return '// Mode DEBUG activé - tous les logs sont affichés';
        }

        return <<<'JS'
// Filtrage des logs verbeux en production
(function() {
  const originalLog = console.log;
  const originalWarn = console.warn;

  console.log = function(...args) {
    const message = args.join(' ').toLowerCase();
    if (message.includes('snipcart') || message.includes('gtag') || message.includes('enabling gtag')) {
      return; // Supprimer logs verbeux en production
    }
    originalLog.apply(console, args);
  };

  console.warn = function(...args) {
    const message = args.join(' ').toLowerCase();
    if (message.includes('snipcart') || message.includes('gtag')) {
      return; // Supprimer warnings verbeux en production
    }
    originalWarn.apply(console, args);
  };

  // Préserver console.error pour diagnostics critiques
})();
JS;
    }
}

if (!function_exists('performance_mark')) {
    /**
     * Marque un point de performance (uniquement en debug)
     *
     * @param string $label Label du marqueur
     * @return void
     */
    function performance_mark(string $label): void
    {
        if (!is_debug_mode()) {
            return;
        }

        $time = microtime(true);
        static $marks = [];

        if (!isset($marks[$label])) {
            $marks[$label] = $time;
            debug_log("Performance mark: {$label}", 'Performance');
        } else {
            $duration = ($time - $marks[$label]) * 1000;
            debug_log(sprintf("Performance measure: %s took %.2fms", $label, $duration), 'Performance');
            unset($marks[$label]);
        }
    }
}
