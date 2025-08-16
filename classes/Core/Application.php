<?php

namespace GeeknDragon\Core;

/**
 * Classe principale de l'application - Point d'entrée centralisé
 * Implémente le patron Singleton pour garantir une instance unique
 */
class Application
{
    private static ?Application $instance = null;
    private array $config;
    private array $services = [];

    private function __construct()
    {
        $this->loadConfiguration();
        $this->initializeServices();
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function loadConfiguration(): void
    {
        $this->config = require __DIR__ . '/../../config.php';
    }

    private function initializeServices(): void
    {
        // Utilisation du ServiceFactory pour créer les services
        $this->services['media'] = \GeeknDragon\Factories\ServiceFactory::create('media');
        $this->services['product'] = \GeeknDragon\Factories\ServiceFactory::create('product');
        $this->services['cache'] = \GeeknDragon\Factories\ServiceFactory::create('cache');
    }

    public function getService(string $name): object
    {
        if (!isset($this->services[$name])) {
            // Tentative de création à la demande via la factory
            if (\GeeknDragon\Factories\ServiceFactory::exists($name)) {
                $this->services[$name] = \GeeknDragon\Factories\ServiceFactory::create($name);
            } else {
                throw new \InvalidArgumentException("Service '$name' non trouvé");
            }
        }
        return $this->services[$name];
    }

    public function getConfig(string $key = null)
    {
        if ($key === null) {
            return $this->config;
        }
        return $this->config[$key] ?? null;
    }

    private function __clone() {}
    public function __wakeup() {}
}