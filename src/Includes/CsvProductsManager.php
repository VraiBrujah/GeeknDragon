<?php
namespace GeeknDragon\Includes;

class CsvProductsManager
{
    private $csvHeaders = [];
    private $translationSync;

    public function __construct()
    {
        $this->translationSync = new TranslationSync();
    }

    private function detectCsvHeaders(string $csvPath): array
    {
        if (!file_exists($csvPath)) {
            return [];
        }
        $file = fopen($csvPath, 'r');
        $headers = fgetcsv($file, 0, ';');
        if (!$headers || count($headers) <= 1) {
            rewind($file);
            $headers = fgetcsv($file, 0, ',');
        }
        fclose($file);
        if (!empty($headers[0])) {
            $headers[0] = ltrim($headers[0], "\xEF\xBB\xBF");
        }
        return $headers ?: [];
    }

    private function extractMultilingualFields(array $data, array $headers): array
    {
        $product = [];
        $baseFields = ['id', 'price', 'images', 'multipliers', 'coin_lots',
            'languages', 'customizable', 'triptych_options', 'triptych_type', 'category'];
        foreach ($baseFields as $field) {
            if (isset($data[$field])) {
                $product[$field] = $data[$field];
            }
        }
        $translatableFields = [];
        $languages = [];
        foreach ($headers as $header) {
            if (preg_match('/^(\w+)_([a-zA-Z]{2})$/', $header, $matches)) {
                $fieldName = $matches[1];
                $langCode = strtolower($matches[2]);
                $translatableFields[$fieldName] = true;
                $languages[$langCode] = true;
                if (isset($data[$header])) {
                    $value = trim($data[$header]);
                    if ($langCode === 'fr') {
                        if (strpos($value, '|') !== false) {
                            $product[$fieldName] = array_filter(array_map('trim', explode('|', $value)));
                        } else {
                            $product[$fieldName] = $fieldName === 'description' ? $this->preserveNewlines($value) : $value;
                        }
                    }
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

    public function convertCsvToJson(string $csvPath, string $jsonPath): array
    {
        try {
            if (!file_exists($csvPath)) {
                return ['success' => false, 'message' => 'Fichier CSV introuvable'];
            }
            if (file_exists($jsonPath)) {
                copy($jsonPath, $jsonPath . '.backup.' . date('Y-m-d_H-i-s'));
            }
            $products = [];
            $csvFile = fopen($csvPath, 'r');
            $headers = fgetcsv($csvFile, 0, ';');
            if (!$headers || count($headers) <= 1) {
                rewind($csvFile);
                $headers = fgetcsv($csvFile, 0, ',');
            }
            if (!empty($headers[0])) {
                $headers[0] = ltrim($headers[0], "\xEF\xBB\xBF");
            }
            if (!$headers || !$this->validateHeaders($headers)) {
                fclose($csvFile);
                return ['success' => false, 'message' => 'En-têtes CSV invalides'];
            }
            $separator = (count($headers) > 1) ? ';' : ',';
            $lineNumber = 1;
            while (($row = fgetcsv($csvFile, 0, $separator)) !== false) {
                $lineNumber++;
                if (empty(array_filter($row))) continue;
                $product = $this->parseProductRow($headers, $row, $lineNumber);
                if ($product['success']) {
                    $products[$product['data']['id']] = $product['data'];
                    unset($products[$product['data']['id']]['id']);
                } else {
                    fclose($csvFile);
                    return ['success' => false, 'message' => $product['message']];
                }
            }
            fclose($csvFile);
            $jsonContent = json_encode($products, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            if (file_put_contents($jsonPath, $jsonContent) === false) {
                return ['success' => false, 'message' => "Impossible d'écrire le fichier JSON"];
            }
            return [
                'success' => true,
                'message' => sprintf('Conversion réussie : %d produits importés', count($products))
            ];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Erreur : ' . $e->getMessage()];
        }
    }

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
            $headers = $this->generateHeadersFromJson($productsData);
            $csvFile = fopen($csvPath, 'w');
            fputcsv($csvFile, $headers, ';');
            foreach ($productsData as $id => $product) {
                $row = $this->productToRow($id, $product, $headers);
                fputcsv($csvFile, $row, ';');
            }
            fclose($csvFile);
            return [
                'success' => true,
                'message' => sprintf('Export réussi : %d produits exportés', count($productsData))
            ];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Erreur : ' . $e->getMessage()];
        }
    }

    private function validateHeaders(array $headers): bool
    {
        $required = ['id', 'price'];
        foreach ($required as $field) {
            if (!in_array($field, $headers)) {
                return false;
            }
        }
        return true;
    }

    private function parseProductRow(array $headers, array $row, int $lineNumber): array
    {
        try {
            if (count($row) !== count($headers)) {
                while (count($row) < count($headers)) {
                    $row[] = '';
                }
                if (count($row) > count($headers)) {
                    $row = array_slice($row, 0, count($headers));
                }
            }
            $data = array_combine($headers, $row);
            if (empty($data['id'])) {
                return ['success' => false, 'message' => "Ligne $lineNumber : ID produit manquant"];
            }
            $product = $this->extractMultilingualFields($data, $headers);
            $product['price'] = (float)($data['price'] ?? 0);
            if (!empty($data['images'])) {
                $product['images'] = array_filter(array_map('trim', explode('|', $data['images'])));
            }
            if (!empty($data['multipliers'])) {
                $product['multipliers'] = array_map('intval', array_filter(explode('|', $data['multipliers'])));
            } else {
                $product['multipliers'] = [];
            }
            if (!empty($data['languages'])) {
                $product['languages'] = array_filter(array_map('trim', explode('|', $data['languages'])));
            }
            if (!empty($data['coin_lots'])) {
                $coinLots = json_decode($data['coin_lots'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $product['coin_lots'] = $coinLots;
                }
            }
            if (!empty($data['triptych_options'])) {
                $product['triptych_options'] = array_filter(array_map('trim', explode('|', $data['triptych_options'])));
            }
            if (!empty($data['triptych_type'])) {
                $product['triptych_type'] = trim($data['triptych_type']);
            }
            if (!empty($data['customizable'])) {
                $customizable = strtolower(trim($data['customizable']));
                $product['customizable'] = in_array($customizable, ['true', 'vrai', '1', 'oui', 'yes']);
            }
            if (!empty($data['category'])) {
                $category = strtolower(trim($data['category']));
                if (in_array($category, ['pieces', 'cards', 'triptychs'])) {
                    $product['category'] = $category;
                } else {
                    $product['category'] = 'cards';
                }
            }
            return ['success' => true, 'data' => $product];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => "Ligne $lineNumber : " . $e->getMessage()];
        }
    }

    private function productToRow(string $id, array $product, array $headers): array
    {
        $row = [];
        foreach ($headers as $header) {
            if ($header === 'id') {
                $row[] = $id;
            } else {
                $value = $product[$header] ?? '';
                if (is_array($value)) {
                    if ($header === 'coin_lots') {
                        $row[] = json_encode($value);
                    } else {
                        $row[] = implode('|', $value);
                    }
                } elseif (is_bool($value)) {
                    $row[] = $value ? 'VRAI' : 'FAUX';
                } else {
                    $row[] = (string)$value;
                }
            }
        }
        return $row;
    }

    private function generateHeadersFromJson(array $productsData): array
    {
        $allFields = [];
        foreach ($productsData as $id => $product) {
            foreach (array_keys($product) as $field) {
                $allFields[$field] = true;
            }
        }
        $orderedHeaders = ['id'];
        if (isset($allFields['price'])) {
            $orderedHeaders[] = 'price';
            unset($allFields['price']);
        }
        $remainingFields = array_keys($allFields);
        sort($remainingFields);
        $orderedHeaders = array_merge($orderedHeaders, $remainingFields);
        return $orderedHeaders;
    }

    public function validateCsv(string $csvPath): array
    {
        try {
            if (!file_exists($csvPath)) {
                return ['success' => false, 'message' => 'Fichier CSV introuvable'];
            }
            $csvFile = fopen($csvPath, 'r');
            $headers = fgetcsv($csvFile, 0, ';');
            if (!$headers || count($headers) <= 1) {
                rewind($csvFile);
                $headers = fgetcsv($csvFile, 0, ',');
            }
            if (!empty($headers[0])) {
                $headers[0] = ltrim($headers[0], "\xEF\xBB\xBF");
            }
            if (!$this->validateHeaders($headers)) {
                fclose($csvFile);
                return ['success' => false, 'message' => 'En-têtes CSV invalides. Champs obligatoires requis : id, price'];
            }
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
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Erreur de validation : ' . $e->getMessage()];
        }
    }

    public function convertCsvToJsonWithSync(string $csvPath, string $jsonPath): array
    {
        $result = $this->convertCsvToJson($csvPath, $jsonPath);
        if ($result['success']) {
            $syncResult = $this->translationSync->syncProductTranslations($csvPath);
            $result['translation_sync'] = $syncResult;
            if ($syncResult['success']) {
                $result['message'] .= ' + Traductions synchronisées vers système I18N';
            } else {
                $result['message'] .= ' (Avertissement: Synchronisation traductions échouée)';
            }
        }
        return $result;
    }

    public function addLanguageSupport(string $langCode): array
    {
        return $this->translationSync->addLanguageSupport($langCode);
    }

    public function validateTranslationConsistency(): array
    {
        return $this->translationSync->validateTranslationConsistency();
    }

    public function detectCsvLanguages(string $csvPath): array
    {
        try {
            if (!file_exists($csvPath)) {
                return ['success' => false, 'message' => 'Fichier CSV introuvable'];
            }
            $csvFile = fopen($csvPath, 'r');
            $headers = fgetcsv($csvFile, 0, ';');
            if (!$headers || count($headers) <= 1) {
                rewind($csvFile);
                $headers = fgetcsv($csvFile, 0, ',');
            }
            fclose($csvFile);
            if (!empty($headers[0])) {
                $headers[0] = ltrim($headers[0], "\xEF\xBB\xBF");
            }
            $detectedLanguages = [];
            $fieldsByLanguage = [];
            foreach ($headers as $header) {
                if (preg_match('/^(\w+)_([a-zA-Z]{2})$/', $header, $matches)) {
                    $field = $matches[1];
                    $lang = strtolower($matches[2]);
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
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Erreur détection langues : ' . $e->getMessage()];
        }
    }

    public function generateMultilingualReport(string $csvPath): array
    {
        $report = [
            'success' => true,
            'timestamp' => date('Y-m-d H:i:s'),
            'csv_analysis' => $this->detectCsvLanguages($csvPath),
            'i18n_consistency' => $this->validateTranslationConsistency()
        ];
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

    private function preserveNewlines(string $text): string
    {
        if ($text === '') {
            return '';
        }
        $lines = explode("\n", $text);
        $trimmedLines = array_map('trim', $lines);
        while (!empty($trimmedLines) && $trimmedLines[0] === '') {
            array_shift($trimmedLines);
        }
        while (!empty($trimmedLines) && $trimmedLines[count($trimmedLines) - 1] === '') {
            array_pop($trimmedLines);
        }
        return implode("\n", $trimmedLines);
    }
}

