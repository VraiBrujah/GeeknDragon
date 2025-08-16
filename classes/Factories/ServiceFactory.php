<?php

namespace GeeknDragon\Factories;

use GeeknDragon\Services\MediaService;
use GeeknDragon\Services\ProductService;
use GeeknDragon\Services\CacheService;

/**
 * Factory pour la création des services
 * Implémente le patron Factory Method pour l'injection de dépendances
 */
class ServiceFactory
{
    private static array $instances = [];

    /**
     * Crée ou récupère une instance de service
     */
    public static function create(string $serviceName): object
    {
        if (isset(self::$instances[$serviceName])) {
            return self::$instances[$serviceName];
        }

        $service = match($serviceName) {
            'media' => new MediaService(),
            'product' => new ProductService(),
            'cache' => new CacheService(),
            default => throw new \InvalidArgumentException("Service inconnu : {$serviceName}")
        };

        return self::$instances[$serviceName] = $service;
    }

    /**
     * Réinitialise toutes les instances (utile pour les tests)
     */
    public static function reset(): void
    {
        self::$instances = [];
    }

    /**
     * Vérifie si un service existe
     */
    public static function exists(string $serviceName): bool
    {
        return in_array($serviceName, ['media', 'product', 'cache']);
    }

    /**
     * Liste tous les services disponibles
     */
    public static function getAvailableServices(): array
    {
        return ['media', 'product', 'cache'];
    }
}