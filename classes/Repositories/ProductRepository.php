<?php

namespace GeeknDragon\Repositories;

/**
 * Repository pour la gestion des données produits
 * Implémente le patron Repository pour séparer la logique d'accès aux données
 */
class ProductRepository
{
    private string $dataFile;
    private ?array $cachedData = null;

    public function __construct(string $dataFile = null)
    {
        $this->dataFile = $dataFile ?? __DIR__ . '/../../data/products.json';
    }

    /**
     * Récupère tous les produits bruts
     */
    public function findAll(): array
    {
        return $this->loadData();
    }

    /**
     * Trouve un produit par ID
     */
    public function findById(string $id): ?array
    {
        $data = $this->loadData();
        return $data[$id] ?? null;
    }

    /**
     * Trouve les produits par catégorie
     */
    public function findByCategory(string $category): array
    {
        $data = $this->loadData();
        return array_filter($data, fn($product) => ($product['category'] ?? 'pieces') === $category);
    }

    /**
     * Recherche de produits par critères
     */
    public function search(array $criteria): array
    {
        $data = $this->loadData();
        
        return array_filter($data, function($product) use ($criteria) {
            foreach ($criteria as $field => $value) {
                if (!$this->matchesCriteria($product, $field, $value)) {
                    return false;
                }
            }
            return true;
        });
    }

    /**
     * Sauvegarde les données (si nécessaire pour l'admin)
     */
    public function save(array $data): bool
    {
        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \RuntimeException('Erreur encodage JSON : ' . json_last_error_msg());
        }

        $success = file_put_contents($this->dataFile, $json) !== false;
        
        if ($success) {
            $this->cachedData = null; // Invalider le cache
        }
        
        return $success;
    }

    /**
     * Ajoute un nouveau produit
     */
    public function add(string $id, array $productData): bool
    {
        $data = $this->loadData();
        
        if (isset($data[$id])) {
            throw new \InvalidArgumentException("Le produit {$id} existe déjà");
        }
        
        $data[$id] = $productData;
        return $this->save($data);
    }

    /**
     * Met à jour un produit existant
     */
    public function update(string $id, array $productData): bool
    {
        $data = $this->loadData();
        
        if (!isset($data[$id])) {
            throw new \InvalidArgumentException("Le produit {$id} n'existe pas");
        }
        
        $data[$id] = array_merge($data[$id], $productData);
        return $this->save($data);
    }

    /**
     * Supprime un produit
     */
    public function delete(string $id): bool
    {
        $data = $this->loadData();
        
        if (!isset($data[$id])) {
            return false;
        }
        
        unset($data[$id]);
        return $this->save($data);
    }

    /**
     * Vérifie si le fichier de données a été modifié
     */
    public function getLastModified(): int
    {
        return file_exists($this->dataFile) ? filemtime($this->dataFile) : 0;
    }

    /**
     * Invalide le cache des données
     */
    public function clearCache(): void
    {
        $this->cachedData = null;
    }

    private function loadData(): array
    {
        if ($this->cachedData !== null) {
            return $this->cachedData;
        }

        if (!file_exists($this->dataFile)) {
            throw new \RuntimeException("Fichier de données non trouvé : {$this->dataFile}");
        }

        $content = file_get_contents($this->dataFile);
        if ($content === false) {
            throw new \RuntimeException("Impossible de lire le fichier : {$this->dataFile}");
        }

        $data = json_decode($content, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \RuntimeException("Erreur JSON : " . json_last_error_msg());
        }

        return $this->cachedData = $data ?? [];
    }

    private function matchesCriteria(array $product, string $field, $value): bool
    {
        switch ($field) {
            case 'text':
                // Recherche textuelle dans nom, description
                $searchIn = implode(' ', [
                    $product['name'] ?? '',
                    $product['name_en'] ?? '',
                    strip_tags($product['description'] ?? ''),
                    strip_tags($product['description_en'] ?? '')
                ]);
                return stripos($searchIn, $value) !== false;
                
            case 'price_min':
                return ($product['price'] ?? 0) >= $value;
                
            case 'price_max':
                return ($product['price'] ?? 0) <= $value;
                
            case 'category':
                return ($product['category'] ?? 'pieces') === $value;
                
            default:
                return isset($product[$field]) && $product[$field] === $value;
        }
    }
}