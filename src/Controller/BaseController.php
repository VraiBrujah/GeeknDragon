<?php
declare(strict_types=1);

namespace GeeknDragon\Controller;

use GeeknDragon\View\ViewHelper;
use GeeknDragon\I18n\TranslationService;

/**
 * Contrôleur de base avec fonctionnalités communes
 */
abstract class BaseController
{
    protected ViewHelper $helper;
    protected TranslationService $translator;
    protected array $config;
    
    public function __construct(array $config)
    {
        $this->config = $config;
        $this->translator = TranslationService::getInstance();
        $this->helper = new ViewHelper($this->translator);
        
        // Détecter et définir la langue
        $lang = $this->translator->detectLanguage();
        $this->translator->setLanguage($lang);
    }
    
    /**
     * Rend une vue avec les variables fournies
     */
    protected function render(string $view, array $viewData = []): void
    {
        $viewPath = __DIR__ . '/../../views/' . $view . '.php';

        if (!file_exists($viewPath)) {
            throw new \RuntimeException("Vue non trouvée : $view");
        }

        // Rendre les helpers disponibles
        $helper = $this->helper;
        $translator = $this->translator;
        $config = $this->config;

        include $viewPath;
    }

    /**
     * Rend un partial avec variables
     */
    protected function renderPartial(string $partial, array $viewData = []): void
    {
        $this->helper->partial($partial, $viewData);
    }
    
    /**
     * Retourne une réponse JSON
     */
    protected function json(array $data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data, JSON_THROW_ON_ERROR);
        exit;
    }
    
    /**
     * Redirection HTTP
     */
    protected function redirect(string $url, int $status = 302): void
    {
        http_response_code($status);
        header("Location: $url");
        exit;
    }
    
    /**
     * Vérifie le token CSRF pour les requêtes POST
     */
    protected function validateCsrfToken(): bool
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return true; // Pas de validation pour GET
        }
        
        $token = $_POST['_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        $sessionToken = $_SESSION['csrf_token'] ?? '';
        
        return hash_equals($sessionToken, $token);
    }
    
    /**
     * Vérifie si la requête est AJAX
     */
    protected function isAjax(): bool
    {
        return isset($_SERVER['HTTP_X_REQUESTED_WITH']) 
            && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
    }
    
    /**
     * Gère les erreurs avec logging
     */
    protected function handleError(\Throwable $e, string $context = ''): void
    {
        $message = "Error in $context: " . $e->getMessage();
        $file = $e->getFile() . ':' . $e->getLine();
        
        error_log("[$context] $message in $file");
        
        if ($this->isAjax()) {
            $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue'
            ], 500);
        } else {
            // Afficher une page d'erreur
            $this->render('pages/error', [
                'title' => 'Erreur',
                'message' => 'Une erreur est survenue. Veuillez réessayer.'
            ]);
        }
    }
    
    /**
     * Valide les données d'entrée
     */
    protected function validate(array $data, array $rules): array
    {
        $errors = [];
        
        foreach ($rules as $field => $rule) {
            $value = $data[$field] ?? null;
            
            if (str_contains($rule, 'required') && empty($value)) {
                $errors[$field] = "Le champ $field est requis";
                continue;
            }
            
            if (str_contains($rule, 'email') && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                $errors[$field] = "Le champ $field doit être un email valide";
            }
            
            if (str_contains($rule, 'numeric') && !is_numeric($value)) {
                $errors[$field] = "Le champ $field doit être numérique";
            }
            
            if (preg_match('/max:(\d+)/', $rule, $matches)) {
                $max = (int)$matches[1];
                if (strlen($value) > $max) {
                    $errors[$field] = "Le champ $field ne doit pas dépasser $max caractères";
                }
            }
        }
        
        return $errors;
    }
}