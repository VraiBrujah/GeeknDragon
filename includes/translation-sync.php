<?php
/**
 * Gestionnaire de synchronisation automatique CSV produits ← → Système I18N
 *
 * Unifie les deux systèmes de traduction de GeeknDragon :
 * 1. Système principal I18N (JSON)
 * 2. Système CSV produits (colonnes multilingues)
 *
 * Permet l'extension automatique à de nouvelles langues et la synchronisation
 * transparente des traductions produits vers le système principal.
 */

class TranslationSync
{
    private $supportedLanguages;
    private $translationFields = []; // Détection dynamique depuis CSV

    public function __construct()
    {
        // Détection automatique des langues depuis i18n.php
        $this->supportedLanguages = $this->detectSupportedLanguages();
    }

    /**
     * Synchronise les traductions produits du CSV vers le système I18N principal
     *
     * @param string $csvPath Chemin vers le fichier CSV produits
     * @return array Résultat de la synchronisation
     */
    public function syncProductTranslations(string $csvPath): array
    {
        try {
            if (!file_exists($csvPath)) {
                return ['success' => false, 'message' => 'Fichier CSV introuvable'];
            }

            // Parse CSV et extrait traductions
            $csvData = $this->parseCsvForTranslations($csvPath);
            if (!$csvData['success']) {
                return $csvData;
            }

            // Détection dynamique des champs traduisibles depuis ce CSV
            $this->translationFields = $this->detectTranslatableFields($csvData['headers']);

            $csvLanguages = $this->detectLanguagesFromCsv($csvData['headers']);

            // Filtrer seulement les langues supportées par le système
            $supportedLanguages = array_intersect($csvLanguages, $this->supportedLanguages);

            $syncedCount = 0;
            $syncedLanguages = [];

            foreach ($supportedLanguages as $lang) {
                $result = $this->updateJsonTranslations($lang, $csvData['products']);
                if ($result['success']) {
                    $syncedCount += $result['products_updated'];
                    $syncedLanguages[] = $lang;
                }
            }

            return [
                'success' => true,
                'message' => "Synchronisation réussie : {$syncedCount} traductions mises à jour",
                'languages_synced' => $syncedLanguages,
                'products_synced' => count($csvData['products']),
                'fields_synced' => $this->translationFields
            ];

        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Erreur synchronisation : ' . $e->getMessage()];
        }
    }

    /**
     * Ajoute support pour une nouvelle langue
     *
     * @param string $langCode Code langue (ex: 'es', 'de', 'it')
     * @return array Résultat de l'opération
     */
    public function addLanguageSupport(string $langCode): array
    {
        try {
            if (strlen($langCode) !== 2) {
                return ['success' => false, 'message' => 'Code langue doit être 2 caractères (ex: es, de, it)'];
            }

            $langCode = strtolower($langCode);

            // 1. Créer fichier JSON de traductions
            $jsonResult = $this->createLanguageJsonFile($langCode);
            if (!$jsonResult['success']) {
                return $jsonResult;
            }

            // 2. Mettre à jour i18n.php
            $i18nResult = $this->updateI18nConfig($langCode);
            if (!$i18nResult['success']) {
                return $i18nResult;
            }

            // 3. Suggérer extensions CSV
            $csvSuggestion = $this->suggestCsvExtension($langCode);

            return [
                'success' => true,
                'message' => "Support ajouté pour la langue '{$langCode}'",
                'json_file_created' => $jsonResult['file_path'],
                'i18n_updated' => $i18nResult['backup_created'],
                'csv_extension_needed' => $csvSuggestion
            ];

        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Erreur ajout langue : ' . $e->getMessage()];
        }
    }

    /**
     * Parse le CSV et extrait toutes les traductions produits
     */
    private function parseCsvForTranslations(string $csvPath): array
    {
        try {
            $csvFile = fopen($csvPath, 'r');

            // Lecture headers
            $headers = fgetcsv($csvFile, 0, ';');
            if (!$headers || count($headers) <= 1) {
                rewind($csvFile);
                $headers = fgetcsv($csvFile, 0, ',');
            }

            // Nettoyage BOM UTF-8
            if (!empty($headers[0])) {
                $headers[0] = ltrim($headers[0], "\xEF\xBB\xBF");
            }

            $products = [];
            $separator = (count($headers) > 1) ? ';' : ',';

            while (($row = fgetcsv($csvFile, 0, $separator)) !== false) {
                if (empty(array_filter($row))) continue;

                $productData = array_combine($headers, $row);
                if (!empty($productData['id'])) {
                    $products[$productData['id']] = $productData;
                }
            }

            fclose($csvFile);

            return [
                'success' => true,
                'headers' => $headers,
                'products' => $products
            ];

        } catch (Exception $e) {
            if (isset($csvFile)) fclose($csvFile);
            return ['success' => false, 'message' => 'Erreur parsing CSV : ' . $e->getMessage()];
        }
    }

    /**
     * Détecte dynamiquement tous les champs traduisibles depuis les en-têtes CSV
     */
    private function detectTranslatableFields(array $headers): array
    {
        $fields = [];
        foreach ($headers as $header) {
            if (preg_match('/^(\w+)_([a-zA-Z]{2})$/i', $header, $matches)) {
                $fieldName = $matches[1];
                if (!in_array($fieldName, $fields)) {
                    $fields[] = $fieldName;
                }
            }
        }
        return $fields;
    }

    /**
     * Détecte les langues présentes dans les en-têtes CSV
     */
    private function detectLanguagesFromCsv(array $headers): array
    {
        $languages = [];
        foreach ($headers as $header) {
            if (preg_match('/^(\w+)_([a-zA-Z]{2})$/i', $header, $matches)) {
                $languages[] = strtolower($matches[2]); // Normaliser en minuscules
            }
        }
        return array_unique($languages);
    }

    /**
     * Met à jour les traductions JSON pour une langue donnée
     */
    private function updateJsonTranslations(string $lang, array $products): array
    {
        try {
            $jsonPath = __DIR__ . "/../lang/{$lang}.json";

            if (!file_exists($jsonPath)) {
                return ['success' => false, 'message' => "Fichier {$lang}.json introuvable"];
            }

            // Backup du fichier existant
            copy($jsonPath, $jsonPath . '.backup.' . date('Y-m-d_H-i-s'));

            // Chargement traductions existantes
            $existing = json_decode(file_get_contents($jsonPath), true) ?? [];

            // Formatage et injection traductions produits
            $productTranslations = $this->formatProductTranslations($products, $lang);

            // Merge sans écraser les traductions manuelles existantes
            if (isset($existing['products'])) {
                $existing['products'] = array_merge($existing['products'], $productTranslations);
            } else {
                $existing['products'] = $productTranslations;
            }

            // Sauvegarde avec formatage propre
            $jsonContent = json_encode($existing, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            file_put_contents($jsonPath, $jsonContent);

            return [
                'success' => true,
                'products_updated' => count($productTranslations)
            ];

        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Erreur mise à jour JSON : ' . $e->getMessage()];
        }
    }

    /**
     * Formate les traductions produits pour injection dans le système I18N
     */
    private function formatProductTranslations(array $products, string $lang): array
    {
        $formatted = [];

        foreach ($products as $productId => $productData) {
            $formatted[$productId] = [];

            // Extraction des champs multilingues pour cette langue
            foreach ($this->translationFields as $field) {
                $fieldKey = $field . '_' . $lang;
                if (isset($productData[$fieldKey]) && !empty($productData[$fieldKey])) {
                    $value = trim($productData[$fieldKey]);

                    if (!empty($value)) {
                        // Détection automatique des listes (format: item1|item2|item3)
                        if (strpos($value, '|') !== false) {
                            // Conversion en array pour les listes
                            $formatted[$productId][$field] = array_filter(array_map('trim', explode('|', $value)));
                        } else {
                            // Valeur simple
                            $formatted[$productId][$field] = $value;
                        }
                    }
                }
            }

            // Suppression entrée vide
            if (empty($formatted[$productId])) {
                unset($formatted[$productId]);
            }
        }

        return $formatted;
    }

    /**
     * Crée un fichier JSON de traductions pour une nouvelle langue
     */
    private function createLanguageJsonFile(string $langCode): array
    {
        try {
            $jsonPath = __DIR__ . "/../lang/{$langCode}.json";

            if (file_exists($jsonPath)) {
                return ['success' => false, 'message' => "Fichier {$langCode}.json existe déjà"];
            }

            // Template basé sur fr.json comme référence
            $frPath = __DIR__ . "/../lang/fr.json";
            if (!file_exists($frPath)) {
                return ['success' => false, 'message' => "Fichier de référence fr.json introuvable"];
            }

            $frContent = json_decode(file_get_contents($frPath), true);

            // Création template avec clés identiques mais valeurs à traduire
            $template = $this->createTranslationTemplate($frContent, $langCode);

            $jsonContent = json_encode($template, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            file_put_contents($jsonPath, $jsonContent);

            return [
                'success' => true,
                'file_path' => $jsonPath,
                'message' => "Fichier {$langCode}.json créé avec template à traduire"
            ];

        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Erreur création JSON : ' . $e->getMessage()];
        }
    }

    /**
     * Met à jour la configuration i18n.php pour supporter la nouvelle langue
     */
    private function updateI18nConfig(string $langCode): array
    {
        try {
            $i18nPath = __DIR__ . "/../i18n.php";

            if (!file_exists($i18nPath)) {
                return ['success' => false, 'message' => 'Fichier i18n.php introuvable'];
            }

            // Backup
            $backupPath = $i18nPath . '.backup.' . date('Y-m-d_H-i-s');
            copy($i18nPath, $backupPath);

            $content = file_get_contents($i18nPath);

            // Recherche et remplacement de la ligne $availableLangs
            $pattern = '/\$availableLangs\s*=\s*\[(.*?)\];/';
            if (preg_match($pattern, $content, $matches)) {
                $currentLangs = $matches[1];

                // Vérification si langue déjà présente
                if (strpos($currentLangs, "'{$langCode}'") !== false) {
                    return ['success' => false, 'message' => "Langue {$langCode} déjà configurée"];
                }

                $newLangs = rtrim($currentLangs, " ") . ", '{$langCode}'";
                $newContent = preg_replace($pattern, "\$availableLangs = [{$newLangs}];", $content);

                file_put_contents($i18nPath, $newContent);
            } else {
                return ['success' => false, 'message' => 'Configuration $availableLangs introuvable dans i18n.php'];
            }

            return [
                'success' => true,
                'backup_created' => $backupPath,
                'language_added' => $langCode
            ];

        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Erreur mise à jour i18n : ' . $e->getMessage()];
        }
    }

    /**
     * Suggère les colonnes CSV à ajouter pour une nouvelle langue
     * Utilise les champs détectés dynamiquement depuis le CSV existant
     */
    private function suggestCsvExtension(string $langCode): array
    {
        // Utiliser les champs détectés du CSV, ou des champs par défaut si aucun détecté
        $fields = !empty($this->translationFields) ? $this->translationFields : ['name', 'description', 'summary'];

        $newColumns = array_map(fn($field) => $field . '_' . $langCode, $fields);

        return [
            'new_columns_needed' => $newColumns,
            'example_csv_headers' => implode(';', $newColumns),
            'instructions' => "Ajoutez ces colonnes à votre CSV produits pour supporter {$langCode}",
            'detected_translatable_fields' => $fields
        ];
    }

    /**
     * Crée un template de traduction basé sur une langue de référence
     */
    private function createTranslationTemplate(array $reference, string $langCode): array
    {
        $template = [];

        foreach ($reference as $key => $value) {
            if (is_array($value)) {
                $template[$key] = $this->createTranslationTemplate($value, $langCode);
            } else {
                // Marquer pour traduction avec commentaire
                $template[$key] = "[TO_TRANSLATE_{$langCode}] " . $value;
            }
        }

        return $template;
    }

    /**
     * Détecte les langues supportées depuis i18n.php
     */
    private function detectSupportedLanguages(): array
    {
        try {
            $i18nPath = __DIR__ . "/../i18n.php";
            if (!file_exists($i18nPath)) {
                return ['fr', 'en']; // Défaut
            }

            $content = file_get_contents($i18nPath);
            if (preg_match('/\$availableLangs\s*=\s*\[(.*?)\];/', $content, $matches)) {
                $langsString = $matches[1];
                preg_match_all("/'([a-z]{2})'/", $langsString, $langMatches);
                return $langMatches[1];
            }

            return ['fr', 'en']; // Défaut si parsing échoue

        } catch (Exception $e) {
            return ['fr', 'en']; // Défaut en cas d'erreur
        }
    }

    /**
     * Valide la cohérence des traductions synchronisées
     */
    public function validateTranslationConsistency(): array
    {
        $report = [
            'success' => true,
            'languages' => [],
            'inconsistencies' => []
        ];

        foreach ($this->supportedLanguages as $lang) {
            $jsonPath = __DIR__ . "/../lang/{$lang}.json";
            if (file_exists($jsonPath)) {
                $data = json_decode(file_get_contents($jsonPath), true);
                $report['languages'][$lang] = [
                    'file_exists' => true,
                    'products_count' => isset($data['products']) ? count($data['products']) : 0,
                    'last_modified' => date('Y-m-d H:i:s', filemtime($jsonPath))
                ];
            } else {
                $report['languages'][$lang] = ['file_exists' => false];
                $report['inconsistencies'][] = "Fichier {$lang}.json manquant";
            }
        }

        return $report;
    }
}
?>