<?php
/**
 * Gestionnaire de conversion CSV <-> JSON pour les produits GeeknDragon
 *
 * Permet la gestion complète des produits via CSV avec zéro hardcodage.
 * Toutes les données (images, variations, options) sont externalisées dans le CSV.
 *
 * Version 2.0 : Intégration TranslationSync pour uniformisation système multilingue
 */

// Inclusion du système de synchronisation des traductions
require_once __DIR__ . '/translation-sync.php';

class CsvProductsManager
{
    private $csvHeaders = []; // Détection dynamique depuis CSV
    private $translationSync;

    /**
     * Constructeur : Initialise le système de synchronisation des traductions
     */
    public function __construct()
    {
        $this->translationSync = new TranslationSync();
    }

    /**
     * Détecte dynamiquement les headers depuis un fichier CSV
     */
    private function detectCsvHeaders(string $csvPath): array
    {
        if (!file_exists($csvPath)) {
            return [];
        }

        $file = fopen($csvPath, 'r');
        $headers = fgetcsv($file, 0, ';');

        // Essayer avec virgule si pas assez de colonnes
        if (!$headers || count($headers) <= 1) {
            rewind($file);
            $headers = fgetcsv($file, 0, ',');
        }

        fclose($file);

        // Nettoyage BOM UTF-8
        if (!empty($headers[0])) {
            $headers[0] = ltrim($headers[0], "\xEF\xBB\xBF");
        }

        return $headers ?: [];
    }

    /**
     * Extrait dynamiquement tous les champs multilingues d'un produit
     */
    private function extractMultilingualFields(array $data, array $headers): array
    {
        $product = [];

        // Traitement des champs de base (non multilingues)
        $baseFields = ['id', 'price', 'images', 'multipliers', 'coin_lots',
                      'languages', 'customizable', 'triptych_options', 'triptych_type', 'category'];

        foreach ($baseFields as $field) {
            if (isset($data[$field])) {
                $product[$field] = $data[$field];
            }
        }

        // Détection et traitement dynamique des champs multilingues
        $translatableFields = [];
        $languages = [];

        foreach ($headers as $header) {
            if (preg_match('/^(\w+)_([a-zA-Z]{2})$/', $header, $matches)) {
                $fieldName = $matches[1];
                $langCode = strtolower($matches[2]); // Normaliser

                $translatableFields[$fieldName] = true;
                $languages[$langCode] = true;

                // Traitement du champ multilingue (y compris champs vides)
                if (isset($data[$header])) {
                    $value = trim($data[$header]);

                    if ($langCode === 'fr') {
                        // Langue principale (compatibilité avec l'ancien format)
                        if (strpos($value, '|') !== false) {
                            $product[$fieldName] = array_filter(array_map('trim', explode('|', $value)));
                        } else {
                            $product[$fieldName] = $fieldName === 'description' ? $this->preserveNewlines($value) : $value;
                        }
                    }

                    // Toutes les langues avec suffixe
                    if (strpos($value, '|') !== false) {
                        $product[$fieldName . '_' . $langCode] = array_filter(array_map('trim', explode('|', $value)));
                    } else {
                        $product[$fieldName . '_' . $langCode] = $fieldName === 'description' ? $this->preserveNewlines($value) : $value;
                    }
                }
            }
        }

        return $product;
    }

    /**
     * Convertit un fichier CSV en JSON produits (méthode classique)
     *
     * @param string $csvPath Chemin vers le fichier CSV
     * @param string $jsonPath Chemin de sortie JSON
     * @return array Résultat avec success et message
     */
    public function convertCsvToJson(string $csvPath, string $jsonPath): array
    {
        try {
            if (!file_exists($csvPath)) {
                return ['success' => false, 'message' => 'Fichier CSV introuvable'];
            }

            // Backup du JSON existant
            if (file_exists($jsonPath)) {
                copy($jsonPath, $jsonPath . '.backup.' . date('Y-m-d_H-i-s'));
            }

            $products = [];
            $csvFile = fopen($csvPath, 'r');
            
            // Lecture des en-têtes (support point-virgule ET virgule)
            $headers = fgetcsv($csvFile, 0, ';');
            if (!$headers || count($headers) <= 1) {
                // Essayer avec des virgules si point-virgule ne fonctionne pas
                rewind($csvFile);
                $headers = fgetcsv($csvFile, 0, ',');
            }
            
            // Nettoyer le BOM UTF-8 du premier en-tête si présent
            if (!empty($headers[0])) {
                $headers[0] = ltrim($headers[0], "\xEF\xBB\xBF");
            }
            if (!$headers || !$this->validateHeaders($headers)) {
                fclose($csvFile);
                return ['success' => false, 'message' => 'En-têtes CSV invalides'];
            }

            // Détecter le séparateur utilisé
            $separator = (count($headers) > 1) ? ';' : ',';

            // Lecture des données
            $lineNumber = 1;
            while (($row = fgetcsv($csvFile, 0, $separator)) !== false) {
                $lineNumber++;
                
                if (empty(array_filter($row))) continue; // Ignorer les lignes vides
                
                $product = $this->parseProductRow($headers, $row, $lineNumber);
                if ($product['success']) {
                    $products[$product['data']['id']] = $product['data'];
                    unset($products[$product['data']['id']]['id']); // Retirer l'ID du contenu
                } else {
                    fclose($csvFile);
                    return ['success' => false, 'message' => $product['message']];
                }
            }
            
            fclose($csvFile);

            // Écriture du JSON
            $jsonContent = json_encode($products, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            if (file_put_contents($jsonPath, $jsonContent) === false) {
                return ['success' => false, 'message' => 'Impossible d\'écrire le fichier JSON'];
            }

            return [
                'success' => true, 
                'message' => sprintf('Conversion réussie : %d produits importés', count($products))
            ];

        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Erreur : ' . $e->getMessage()];
        }
    }

    /**
     * Convertit un JSON produits en CSV
     * 
     * @param string $jsonPath Chemin vers le fichier JSON
     * @param string $csvPath Chemin de sortie CSV
     * @return array Résultat avec success et message
     */
    public function convertJsonToCsv(string $jsonPath, string $csvPath): array
    {
        try {
            if (!file_exists($jsonPath)) {
                return ['success' => false, 'message' => 'Fichier JSON introuvable'];
            }

            $productsData = json_decode(file_get_contents($jsonPath), true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                return ['success' => false, 'message' => 'JSON invalide : ' . json_last_error_msg()];
            }

            // Génération dynamique des headers depuis tous les produits
            $headers = $this->generateHeadersFromJson($productsData);

            $csvFile = fopen($csvPath, 'w');

            // Écriture des en-têtes avec point-virgule
            fputcsv($csvFile, $headers, ';');

            // Écriture des données
            foreach ($productsData as $id => $product) {
                $row = $this->productToRow($id, $product, $headers);
                fputcsv($csvFile, $row, ';');
            }

            fclose($csvFile);

            return [
                'success' => true, 
                'message' => sprintf('Export réussi : %d produits exportés', count($productsData))
            ];

        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Erreur : ' . $e->getMessage()];
        }
    }

    /**
     * Valide les en-têtes CSV
     */
    private function validateHeaders(array $headers): bool
    {
        // Champs obligatoires pour le fonctionnement de base
        $required = ['id', 'price'];

        foreach ($required as $field) {
            if (!in_array($field, $headers)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Parse une ligne de produit CSV
     */
    private function parseProductRow(array $headers, array $row, int $lineNumber): array
    {
        try {
            // S'assurer que la ligne a le bon nombre de colonnes
            if (count($row) !== count($headers)) {
                // Ajouter des colonnes vides si nécessaire
                while (count($row) < count($headers)) {
                    $row[] = '';
                }
                // Ou supprimer les colonnes en trop
                if (count($row) > count($headers)) {
                    $row = array_slice($row, 0, count($headers));
                }
            }
            
            $data = array_combine($headers, $row);

            if (empty($data['id'])) {
                return ['success' => false, 'message' => "Ligne $lineNumber : ID produit manquant"];
            }

            // Utilisation de la nouvelle méthode dynamique
            $product = $this->extractMultilingualFields($data, $headers);

            // Prix (obligatoire)
            $product['price'] = floatval($data['price'] ?? 0);

            // Traitement spécialisé des champs non multilingues

            // Images (séparées par |)
            if (!empty($data['images'])) {
                $product['images'] = array_filter(array_map('trim', explode('|', $data['images'])));
            }

            // Multiplicateurs (séparées par |)
            if (!empty($data['multipliers'])) {
                $product['multipliers'] = array_map('intval', array_filter(explode('|', $data['multipliers'])));
            } else {
                $product['multipliers'] = [];
            }

            // Langues (séparées par |)
            if (!empty($data['languages'])) {
                $product['languages'] = array_filter(array_map('trim', explode('|', $data['languages'])));
            }

            // Coin lots (JSON)
            if (!empty($data['coin_lots'])) {
                $coinLots = json_decode($data['coin_lots'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $product['coin_lots'] = $coinLots;
                }
            }

            // Options triptyque (séparées par |)
            if (!empty($data['triptych_options'])) {
                $product['triptych_options'] = array_filter(array_map('trim', explode('|', $data['triptych_options'])));
            }

            // Type triptyque
            if (!empty($data['triptych_type'])) {
                $product['triptych_type'] = trim($data['triptych_type']);
            }

            // Customizable (boolean) - support français et anglais
            if (!empty($data['customizable'])) {
                $customizable = strtolower(trim($data['customizable']));
                $product['customizable'] = in_array($customizable, ['true', 'vrai', '1', 'oui', 'yes']);
            }

            // Catégorie (pieces, cards, triptychs)
            if (!empty($data['category'])) {
                $category = strtolower(trim($data['category']));
                if (in_array($category, ['pieces', 'cards', 'triptychs'])) {
                    $product['category'] = $category;
                } else {
                    $product['category'] = 'cards'; // Par défaut
                }
            } else {
                $product['category'] = 'cards'; // Par défaut si vide
            }

            return ['success' => true, 'data' => $product];

        } catch (Exception $e) {
            return ['success' => false, 'message' => "Ligne $lineNumber : " . $e->getMessage()];
        }
    }

    /**
     * Convertit un produit en ligne CSV de manière dynamique
     */
    private function productToRow(string $id, array $product, array $headers): array
    {
        $row = [];

        foreach ($headers as $header) {
            if ($header === 'id') {
                $row[] = $id;
            } else {
                $value = $product[$header] ?? '';

                // Traitement spécialisé selon le type de champ
                if (is_array($value)) {
                    if ($header === 'coin_lots') {
                        // JSON pour coin_lots
                        $row[] = json_encode($value);
                    } else {
                        // Implode avec | pour les autres arrays
                        $row[] = implode('|', $value);
                    }
                } elseif (is_bool($value)) {
                    // Booléens en français
                    $row[] = $value ? 'VRAI' : 'FAUX';
                } else {
                    // Valeur simple
                    $row[] = (string)$value;
                }
            }
        }

        return $row;
    }

    /**
     * Génère dynamiquement la liste des headers depuis le contenu JSON
     */
    private function generateHeadersFromJson(array $productsData): array
    {
        $allFields = [];

        foreach ($productsData as $id => $product) {
            foreach (array_keys($product) as $field) {
                $allFields[$field] = true;
            }
        }

        // Assurer l'ordre logique : id d'abord, price ensuite, puis le reste
        $orderedHeaders = ['id'];

        // Ajouter price s'il existe
        if (isset($allFields['price'])) {
            $orderedHeaders[] = 'price';
            unset($allFields['price']);
        }

        // Ajouter tous les autres champs triés
        $remainingFields = array_keys($allFields);
        sort($remainingFields);
        $orderedHeaders = array_merge($orderedHeaders, $remainingFields);

        return $orderedHeaders;
    }

    /**
     * Valide un fichier CSV avant conversion
     */
    public function validateCsv(string $csvPath): array
    {
        try {
            if (!file_exists($csvPath)) {
                return ['success' => false, 'message' => 'Fichier CSV introuvable'];
            }

            $csvFile = fopen($csvPath, 'r');
            
            // Lecture des en-têtes (support point-virgule ET virgule)
            $headers = fgetcsv($csvFile, 0, ';');
            if (!$headers || count($headers) <= 1) {
                rewind($csvFile);
                $headers = fgetcsv($csvFile, 0, ',');
            }
            
            // Nettoyer le BOM UTF-8 du premier en-tête si présent
            if (!empty($headers[0])) {
                $headers[0] = ltrim($headers[0], "\xEF\xBB\xBF");
            }
            
            if (!$this->validateHeaders($headers)) {
                fclose($csvFile);
                return ['success' => false, 'message' => 'En-têtes CSV invalides. Champs obligatoires requis : id, price'];
            }

            // Détecter le séparateur utilisé
            $separator = (count($headers) > 1) ? ';' : ',';

            $errors = [];
            $lineNumber = 1;
            $productCount = 0;

            while (($row = fgetcsv($csvFile, 0, $separator)) !== false) {
                $lineNumber++;
                
                if (empty(array_filter($row))) continue;
                
                $product = $this->parseProductRow($headers, $row, $lineNumber);
                if (!$product['success']) {
                    $errors[] = $product['message'];
                } else {
                    $productCount++;
                }

                // Limiter les erreurs affichées
                if (count($errors) >= 10) {
                    $errors[] = "... et possiblement d'autres erreurs";
                    break;
                }
            }

            fclose($csvFile);

            if (!empty($errors)) {
                return ['success' => false, 'message' => 'Erreurs détectées :', 'errors' => $errors];
            }

            return ['success' => true, 'message' => "Validation réussie : $productCount produits valides"];

        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Erreur de validation : ' . $e->getMessage()];
        }
    }

    /**
     * Préserve les retours à la ligne dans les descriptions tout en supprimant les espaces en début/fin
     */
    private function preserveNewlines(string $text): string
    {
        if (empty($text)) {
            return '';
        }

        // Séparer les lignes, trim chaque ligne individuellement, puis rejoindre
        $lines = explode("\n", $text);
        $trimmedLines = array_map('trim', $lines);

        // Supprimer les lignes vides au début et à la fin, mais conserver celles du milieu
        while (!empty($trimmedLines) && $trimmedLines[0] === '') {
            array_shift($trimmedLines);
        }
        while (!empty($trimmedLines) && $trimmedLines[count($trimmedLines) - 1] === '') {
            array_pop($trimmedLines);
        }

        return implode("\n", $trimmedLines);
    }

    // ========================================================================
    // NOUVELLES MÉTHODES - SYSTÈME UNIFIÉ DE TRADUCTION
    // ========================================================================

    /**
     * Convertit CSV en JSON avec synchronisation automatique des traductions
     *
     * Version améliorée qui synchronise automatiquement les traductions produits
     * vers le système I18N principal (lang/fr.json, lang/en.json, etc.)
     *
     * @param string $csvPath Chemin vers le fichier CSV
     * @param string $jsonPath Chemin de sortie JSON
     * @return array Résultat avec success, message et détails synchronisation
     */
    public function convertCsvToJsonWithSync(string $csvPath, string $jsonPath): array
    {
        // 1. Conversion classique CSV -> JSON
        $result = $this->convertCsvToJson($csvPath, $jsonPath);

        if ($result['success']) {
            // 2. Synchronisation automatique vers système I18N
            $syncResult = $this->translationSync->syncProductTranslations($csvPath);

            // 3. Merge des résultats
            $result['translation_sync'] = $syncResult;

            if ($syncResult['success']) {
                $result['message'] .= ' + Traductions synchronisées vers système I18N';
            } else {
                $result['message'] .= ' (Avertissement: Synchronisation traductions échouée)';
            }
        }

        return $result;
    }

    /**
     * Ajoute support pour une nouvelle langue
     *
     * Crée automatiquement :
     * - Fichier JSON de traductions (lang/XX.json)
     * - Mise à jour configuration i18n.php
     * - Instructions pour extension CSV
     *
     * @param string $langCode Code langue ISO 639-1 (ex: 'es', 'de', 'it')
     * @return array Résultat de l'opération
     */
    public function addLanguageSupport(string $langCode): array
    {
        return $this->translationSync->addLanguageSupport($langCode);
    }

    /**
     * Valide la cohérence des traductions synchronisées
     *
     * @return array Rapport de validation
     */
    public function validateTranslationConsistency(): array
    {
        return $this->translationSync->validateTranslationConsistency();
    }

    /**
     * Détecte les langues supportées par le CSV
     *
     * Analyse les en-têtes CSV pour identifier toutes les langues présentes
     * via les colonnes *_XX (ex: name_fr, description_en, summary_es)
     *
     * @param string $csvPath Chemin vers le fichier CSV
     * @return array Langues détectées et statistiques
     */
    public function detectCsvLanguages(string $csvPath): array
    {
        try {
            if (!file_exists($csvPath)) {
                return ['success' => false, 'message' => 'Fichier CSV introuvable'];
            }

            $csvFile = fopen($csvPath, 'r');

            // Lecture en-têtes avec support séparateurs multiples
            $headers = fgetcsv($csvFile, 0, ';');
            if (!$headers || count($headers) <= 1) {
                rewind($csvFile);
                $headers = fgetcsv($csvFile, 0, ',');
            }

            fclose($csvFile);

            // Nettoyage BOM UTF-8
            if (!empty($headers[0])) {
                $headers[0] = ltrim($headers[0], "\xEF\xBB\xBF");
            }

            // Détection langues
            $detectedLanguages = [];
            $fieldsByLanguage = [];

            foreach ($headers as $header) {
                if (preg_match('/^(\w+)_([a-zA-Z]{2})$/', $header, $matches)) {
                    $field = $matches[1];
                    $lang = strtolower($matches[2]); // Normaliser en minuscules

                    $detectedLanguages[] = $lang;
                    if (!isset($fieldsByLanguage[$lang])) {
                        $fieldsByLanguage[$lang] = [];
                    }
                    $fieldsByLanguage[$lang][] = $field;
                }
            }

            $detectedLanguages = array_unique($detectedLanguages);

            return [
                'success' => true,
                'languages_detected' => $detectedLanguages,
                'fields_by_language' => $fieldsByLanguage,
                'total_languages' => count($detectedLanguages),
                'total_multilingual_fields' => count(array_filter($headers, fn($h) => preg_match('/_[a-zA-Z]{2}$/i', $h)))
            ];

        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Erreur détection langues : ' . $e->getMessage()];
        }
    }

    /**
     * Génère un rapport complet du système multilingue
     *
     * @param string $csvPath Chemin vers le fichier CSV
     * @return array Rapport détaillé
     */
    public function generateMultilingualReport(string $csvPath): array
    {
        $report = [
            'success' => true,
            'timestamp' => date('Y-m-d H:i:s'),
            'csv_analysis' => $this->detectCsvLanguages($csvPath),
            'i18n_consistency' => $this->validateTranslationConsistency()
        ];

        // Analyse détaillée des correspondances
        if ($report['csv_analysis']['success'] && $report['i18n_consistency']['success']) {
            $csvLangs = $report['csv_analysis']['languages_detected'];
            $i18nLangs = array_keys($report['i18n_consistency']['languages']);

            $report['system_alignment'] = [
                'csv_languages' => $csvLangs,
                'i18n_languages' => $i18nLangs,
                'synchronized_languages' => array_intersect($csvLangs, $i18nLangs),
                'csv_only_languages' => array_diff($csvLangs, $i18nLangs),
                'i18n_only_languages' => array_diff($i18nLangs, $csvLangs),
                'fully_aligned' => empty(array_diff($csvLangs, $i18nLangs)) && empty(array_diff($i18nLangs, $csvLangs))
            ];
        }

        return $report;
    }

    /**
     * Extension automatique du CSV pour nouvelle langue
     *
     * Ajoute les colonnes nécessaires pour une nouvelle langue
     * ATTENTION: Cette méthode nécessite une validation manuelle du CSV résultant
     *
     * @param string $csvPath Chemin vers le fichier CSV source
     * @param string $langCode Code de la nouvelle langue
     * @param string $outputPath Chemin de sortie (optionnel)
     * @return array Résultat de l'extension
     */
    public function extendCsvForLanguage(string $csvPath, string $langCode, string $outputPath = null): array
    {
        try {
            if (!file_exists($csvPath)) {
                return ['success' => false, 'message' => 'Fichier CSV source introuvable'];
            }

            $outputPath = $outputPath ?? str_replace('.csv', "_extended_{$langCode}.csv", $csvPath);

            // Analyse CSV actuel
            $detection = $this->detectCsvLanguages($csvPath);
            if (!$detection['success']) {
                return $detection;
            }

            // Vérification langue pas déjà présente
            if (in_array($langCode, $detection['languages_detected'])) {
                return ['success' => false, 'message' => "Langue {$langCode} déjà présente dans le CSV"];
            }

            // Lecture et extension du CSV
            $csvFile = fopen($csvPath, 'r');
            $outputFile = fopen($outputPath, 'w');

            // En-têtes avec nouvelles colonnes
            $headers = fgetcsv($csvFile, 0, ';');
            if (!$headers || count($headers) <= 1) {
                rewind($csvFile);
                $headers = fgetcsv($csvFile, 0, ',');
            }

            // Nettoyage BOM
            if (!empty($headers[0])) {
                $headers[0] = ltrim($headers[0], "\xEF\xBB\xBF");
            }

            // Ajout nouvelles colonnes pour la langue
            $newHeaders = $headers;
            $translationFields = ['name', 'description', 'summary', 'metals'];

            foreach ($translationFields as $field) {
                $newHeaders[] = $field . '_' . $langCode;
            }

            fputcsv($outputFile, $newHeaders, ';');

            // Copie des données avec colonnes vides pour nouvelle langue
            $separator = (count($headers) > 1) ? ';' : ',';
            while (($row = fgetcsv($csvFile, 0, $separator)) !== false) {
                // Ajout colonnes vides pour chaque nouveau champ
                foreach ($translationFields as $field) {
                    $row[] = ''; // Valeur vide à remplir manuellement
                }
                fputcsv($outputFile, $row, ';');
            }

            fclose($csvFile);
            fclose($outputFile);

            return [
                'success' => true,
                'message' => "CSV étendu pour la langue {$langCode}",
                'output_file' => $outputPath,
                'new_columns_added' => array_map(fn($f) => $f . '_' . $langCode, $translationFields),
                'next_steps' => [
                    '1. Vérifiez le fichier généré : ' . basename($outputPath),
                    '2. Remplissez manuellement les colonnes de traduction',
                    '3. Utilisez convertCsvToJsonWithSync() pour synchroniser',
                    '4. Testez avec generateMultilingualReport()'
                ]
            ];

        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Erreur extension CSV : ' . $e->getMessage()];
        }
    }
}
?>