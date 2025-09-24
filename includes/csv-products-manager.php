<?php
/**
 * Gestionnaire de conversion CSV <-> JSON pour les produits GeeknDragon
 * 
 * Permet la gestion complète des produits via CSV avec zéro hardcodage.
 * Toutes les données (images, variations, options) sont externalisées dans le CSV.
 */

class CsvProductsManager
{
    private $csvHeaders = [
        'id', 'name_fr', 'name_en', 'price', 'description_fr', 'description_en', 
        'summary_fr', 'summary_en', 'images', 'multipliers', 'metals_fr', 
        'metals_en', 'coin_lots', 'languages', 'customizable', 'triptych_options', 'triptych_type', 'category'
    ];

    /**
     * Convertit un fichier CSV en JSON produits
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

            $csvFile = fopen($csvPath, 'w');
            
            // Écriture des en-têtes avec point-virgule
            fputcsv($csvFile, $this->csvHeaders, ';');

            // Écriture des données
            foreach ($productsData as $id => $product) {
                $row = $this->productToRow($id, $product);
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
        return count(array_intersect($this->csvHeaders, $headers)) === count($this->csvHeaders);
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

            $product = [
                'id' => trim($data['id']),
                'name' => trim($data['name_fr']) ?: '',
                'name_en' => trim($data['name_en']) ?: '',
                'price' => floatval($data['price']),
                'description' => $this->preserveNewlines($data['description_fr']) ?: '',
                'description_en' => $this->preserveNewlines($data['description_en']) ?: '',
                'summary' => trim($data['summary_fr']) ?: '',
                'summary_en' => trim($data['summary_en']) ?: ''
            ];

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

            // Métaux FR (séparées par |)
            if (!empty($data['metals_fr'])) {
                $product['metals'] = array_filter(array_map('trim', explode('|', $data['metals_fr'])));
            }

            // Métaux EN (séparées par |)
            if (!empty($data['metals_en'])) {
                $product['metals_en'] = array_filter(array_map('trim', explode('|', $data['metals_en'])));
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
     * Convertit un produit en ligne CSV
     */
    private function productToRow(string $id, array $product): array
    {
        return [
            $id,
            $product['name'] ?? '',
            $product['name_en'] ?? '',
            $product['price'] ?? 0,
            $product['description'] ?? '',
            $product['description_en'] ?? '',
            $product['summary'] ?? '',
            $product['summary_en'] ?? '',
            isset($product['images']) ? implode('|', $product['images']) : '',
            isset($product['multipliers']) ? implode('|', $product['multipliers']) : '',
            isset($product['metals']) ? implode('|', $product['metals']) : '',
            isset($product['metals_en']) ? implode('|', $product['metals_en']) : '',
            isset($product['coin_lots']) ? json_encode($product['coin_lots']) : '',
            isset($product['languages']) ? implode('|', $product['languages']) : '',
            isset($product['customizable']) ? ($product['customizable'] ? 'VRAI' : 'FAUX') : 'FAUX',
            isset($product['triptych_options']) ? implode('|', $product['triptych_options']) : '',
            $product['triptych_type'] ?? '',
            $product['category'] ?? 'cards'
        ];
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
                return ['success' => false, 'message' => 'En-têtes CSV invalides. Attendus : ' . implode(', ', $this->csvHeaders)];
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
}
?>