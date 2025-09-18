<?php
declare(strict_types=1);

namespace GeeknDragon\Controller;

use GeeknDragon\Cart\SnipcartClient;
use GeeknDragon\Cart\SnipcartException;
use GeeknDragon\Core\SessionHelper;
use GeeknDragon\Service\InvoiceService;
use GeeknDragon\Service\DatabaseService;

/**
 * Contrôleur pour la gestion du compte client
 */
class AccountController extends BaseController
{
    private SnipcartClient $client;
    private InvoiceService $invoiceService;

    public function __construct(array $config)
    {
        parent::__construct($config);
        SessionHelper::ensureSession();

        $mockMode = ($config['APP_ENV'] ?? 'production') === 'development';
        $this->client = new SnipcartClient(
            $config['snipcart_api_key'] ?? '',
            $config['snipcart_secret_api_key'] ?? '',
            $mockMode
        );
        
        // Initialiser le service de factures avec base centralisée
        $this->invoiceService = new InvoiceService(DatabaseService::getInstance());
    }

    /**
     * POST /api/account/login - Authentifie un client par email
     */
    public function login(): void
    {
        if (!$this->validateCsrfToken()) {
            $this->json(['success' => false, 'message' => 'Token CSRF invalide'], 403);
            return;
        }

        try {
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                $this->json(['success' => false, 'message' => 'Données invalides'], 400);
                return;
            }

            $errors = $this->validate($input, [
                'email' => 'required|email'
            ]);

            if (!empty($errors)) {
                $this->json(['success' => false, 'errors' => $errors], 400);
                return;
            }

            $customer = $this->client->getCustomerByEmail($input['email']);

            if (!$customer) {
                $this->json(['success' => false, 'message' => 'Client introuvable'], 404);
                return;
            }

            session_regenerate_id(true);
            $_SESSION['customer'] = $customer;

            $this->json(['success' => true, 'customer' => $customer]);
        } catch (SnipcartException $e) {
            $this->json(['success' => false, 'message' => 'Configuration Snipcart invalide'], 500);
        } catch (\Exception $e) {
            $this->handleError($e, 'AccountController::login');
        }
    }

    /**
     * GET /api/account/profile - Retourne le profil du client connecté
     */
    public function profile(): void
    {
        if (empty($_SESSION['customer']['id'])) {
            $this->json(['success' => false, 'message' => 'Non authentifié'], 401);
            return;
        }

        try {
            $customer = $this->client->getCustomer($_SESSION['customer']['id']);
            $this->json(['success' => true, 'customer' => $customer]);
        } catch (\Exception $e) {
            $this->handleError($e, 'AccountController::profile');
        }
    }

    /**
     * GET /api/account/orders - Retourne les commandes du client connecté
     */
    public function orders(): void
    {
        if (empty($_SESSION['customer']['id'])) {
            $this->json(['success' => false, 'message' => 'Non authentifié'], 401);
            return;
        }

        try {
            $orders = $this->client->getOrders(['customerId' => $_SESSION['customer']['id']]);
            $this->json(['success' => true, 'orders' => $orders]);
        } catch (\Exception $e) {
            $this->handleError($e, 'AccountController::orders');
        }
    }

    /**
     * GET /api/account/status - Retourne l'état de connexion de la session
     */
    public function status(): void
    {
        $authenticated = !empty($_SESSION['customer']);
        $this->json(['authenticated' => $authenticated]);
    }
    
    /**
     * GET /api/account/invoices - Retourne les factures du client connecté
     */
    public function invoices(): void
    {
        if (empty($_SESSION['customer']['id'])) {
            $this->json(['success' => false, 'message' => 'Non authentifié'], 401);
            return;
        }
        
        try {
            // Récupérer l'ID utilisateur depuis la base locale si possible
            $userId = $this->getUserIdByEmail($_SESSION['customer']['email'] ?? '');
            
            if ($userId) {
                // Utiliser les factures locales synchronisées
                $limit = (int) ($_GET['limit'] ?? 20);
                $offset = (int) ($_GET['offset'] ?? 0);
                
                $invoices = $this->invoiceService->getUserInvoices($userId, $limit, $offset);
                $this->json(['success' => true, 'invoices' => $invoices, 'source' => 'local']);
            } else {
                // Fallback sur Snipcart si pas d'utilisateur local
                $orders = $this->client->getOrders(['customerId' => $_SESSION['customer']['id']]);
                $this->json(['success' => true, 'invoices' => $orders, 'source' => 'snipcart']);
            }
        } catch (\Exception $e) {
            $this->handleError($e, 'AccountController::invoices');
        }
    }
    
    /**
     * GET /api/account/invoice/{id} - Retourne le détail d'une facture
     */
    public function invoiceDetails(): void
    {
        if (empty($_SESSION['customer']['id'])) {
            $this->json(['success' => false, 'message' => 'Non authentifié'], 401);
            return;
        }
        
        $invoiceId = (int) ($_GET['id'] ?? 0);
        if (!$invoiceId) {
            $this->json(['success' => false, 'message' => 'ID facture manquant'], 400);
            return;
        }
        
        try {
            $userId = $this->getUserIdByEmail($_SESSION['customer']['email'] ?? '');
            
            if ($userId) {
                $invoice = $this->invoiceService->getInvoiceDetails($invoiceId, $userId);
                
                if ($invoice) {
                    $this->json(['success' => true, 'invoice' => $invoice]);
                } else {
                    $this->json(['success' => false, 'message' => 'Facture non trouvée'], 404);
                }
            } else {
                $this->json(['success' => false, 'message' => 'Utilisateur non lié'], 404);
            }
        } catch (\Exception $e) {
            $this->handleError($e, 'AccountController::invoiceDetails');
        }
    }
    
    /**
     * POST /api/account/link-orders - Lie les commandes Snipcart existantes au compte
     */
    public function linkExistingOrders(): void
    {
        if (empty($_SESSION['customer']['id'])) {
            $this->json(['success' => false, 'message' => 'Non authentifié'], 401);
            return;
        }
        
        try {
            $customerId = $_SESSION['customer']['id'];
            $email = $_SESSION['customer']['email'] ?? '';
            
            if (empty($email)) {
                $this->json(['success' => false, 'message' => 'Email manquant'], 400);
                return;
            }
            
            // Récupérer toutes les commandes Snipcart de ce client
            $orders = $this->client->getOrders(['customerId' => $customerId]);
            $syncedCount = 0;
            $errors = [];
            
            foreach ($orders['items'] ?? [] as $order) {
                try {
                    $result = $this->invoiceService->syncSnipcartOrder($order);
                    if ($result['success']) {
                        $syncedCount++;
                    } else {
                        $errors[] = "Commande {$order['token']}: {$result['error']}";
                    }
                } catch (\Exception $e) {
                    $errors[] = "Commande {$order['token']}: " . $e->getMessage();
                }
            }
            
            $this->json([
                'success' => true,
                'synced_count' => $syncedCount,
                'total_orders' => count($orders['items'] ?? []),
                'errors' => $errors
            ]);
            
        } catch (\Exception $e) {
            $this->handleError($e, 'AccountController::linkExistingOrders');
        }
    }
    
    /**
     * Récupère l'ID utilisateur local par email
     */
    private function getUserIdByEmail(string $email): ?int
    {
        if (empty($email)) return null;
        
        try {
            $pdo = $this->getDatabase();
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            return $user ? (int) $user['id'] : null;
        } catch (\Exception $e) {
            error_log("Erreur getUserIdByEmail: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * GET /api/account/session-check - Vérification de session unifiée
     */
    public function sessionCheck(): void
    {
        try {
            // Vérifier d'abord Snipcart
            if (!empty($_SESSION['customer'])) {
                $customer = $_SESSION['customer'];
                
                // Essayer de lier avec utilisateur local
                $userId = $this->getUserIdByEmail($customer['email'] ?? '');
                
                $this->json([
                    'success' => true,
                    'authenticated' => true,
                    'user_type' => 'snipcart',
                    'customer' => $customer,
                    'local_user_id' => $userId
                ]);
                return;
            }
            
            // Vérifier ensuite le système local D&D
            if (!empty($_SESSION['user_id'])) {
                $pdo = DatabaseService::getInstance();
                $stmt = $pdo->prepare("
                    SELECT id, email, nom_aventurier, niveau, espece, classe, historique,
                           style_jeu, experience_jeu, campagnes_preferees, email_verifie,
                           date_creation, derniere_connexion
                    FROM users 
                    WHERE id = ? AND statut = 'actif'
                ");
                $stmt->execute([$_SESSION['user_id']]);
                $user = $stmt->fetch(\PDO::FETCH_ASSOC);
                
                if ($user) {
                    $this->json([
                        'success' => true,
                        'authenticated' => true,
                        'user_type' => 'local',
                        'user' => $user
                    ]);
                    return;
                }
            }
            
            // Aucune session valide
            $this->json([
                'success' => true,
                'authenticated' => false
            ]);
            
        } catch (\Exception $e) {
            $this->handleError($e, 'AccountController::sessionCheck');
        }
    }
    
    /**
     * POST /api/account/register - Inscription utilisateur D&D
     */
    public function register(): void
    {
        if (!$this->validateCsrfToken()) {
            $this->json(['success' => false, 'message' => 'Token CSRF invalide'], 403);
            return;
        }
        
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                $this->json(['success' => false, 'message' => 'Données invalides'], 400);
                return;
            }
            
            $errors = $this->validate($input, [
                'email' => 'required|email',
                'nom_aventurier' => 'required|min:2|max:50',
                'espece' => 'required',
                'classe' => 'required',
                'historique' => 'required'
            ]);
            
            if (!empty($errors)) {
                $this->json(['success' => false, 'errors' => $errors], 400);
                return;
            }
            
            $pdo = DatabaseService::getInstance();
            
            // Vérifier si l'email existe déjà
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$input['email']]);
            if ($stmt->fetch()) {
                $this->json(['success' => false, 'message' => 'Email déjà utilisé'], 409);
                return;
            }
            
            // Insérer le nouvel utilisateur
            $stmt = $pdo->prepare("
                INSERT INTO users (
                    email, nom_aventurier, espece, classe, historique,
                    style_jeu, experience_jeu, campagnes_preferees,
                    force, dexterite, constitution, intelligence, sagesse, charisme
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $input['email'],
                $input['nom_aventurier'],
                $input['espece'],
                $input['classe'],
                $input['historique'],
                $input['style_jeu'] ?? 'roleplay',
                $input['experience_jeu'] ?? 'debutant',
                $input['campagnes_preferees'] ?? 'classique',
                $input['force'] ?? 10,
                $input['dexterite'] ?? 10,
                $input['constitution'] ?? 10,
                $input['intelligence'] ?? 10,
                $input['sagesse'] ?? 10,
                $input['charisme'] ?? 10
            ]);
            
            $userId = $pdo->lastInsertId();
            
            // Créer une session
            $this->createUserSession($userId);
            
            // Récupérer l'utilisateur créé
            $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            $this->json([
                'success' => true,
                'message' => 'Aventurier créé avec succès',
                'user' => $user
            ]);
            
        } catch (\Exception $e) {
            $this->handleError($e, 'AccountController::register');
        }
    }
    
    /**
     * POST /api/account/login-local - Connexion utilisateur D&D par email seulement
     */
    public function loginLocal(): void
    {
        if (!$this->validateCsrfToken()) {
            $this->json(['success' => false, 'message' => 'Token CSRF invalide'], 403);
            return;
        }
        
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                $this->json(['success' => false, 'message' => 'Données invalides'], 400);
                return;
            }
            
            $errors = $this->validate($input, [
                'email' => 'required|email'
            ]);
            
            if (!empty($errors)) {
                $this->json(['success' => false, 'errors' => $errors], 400);
                return;
            }
            
            $pdo = DatabaseService::getInstance();
            $stmt = $pdo->prepare("
                SELECT * FROM users 
                WHERE email = ? AND statut = 'actif'
            ");
            $stmt->execute([$input['email']]);
            $user = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if (!$user) {
                $this->json(['success' => false, 'message' => 'Aventurier introuvable'], 404);
                return;
            }
            
            // Créer une session
            $this->createUserSession((int)$user['id']);
            
            // Mettre à jour la dernière connexion
            $stmt = $pdo->prepare("UPDATE users SET derniere_connexion = datetime('now') WHERE id = ?");
            $stmt->execute([$user['id']]);
            
            $this->json([
                'success' => true,
                'message' => 'Connexion réussie',
                'user' => $user
            ]);
            
        } catch (\Exception $e) {
            $this->handleError($e, 'AccountController::loginLocal');
        }
    }
    
    /**
     * POST /api/account/logout - Déconnexion unifiée
     */
    public function logout(): void
    {
        try {
            // Nettoyer la session Snipcart
            if (!empty($_SESSION['customer'])) {
                unset($_SESSION['customer']);
            }
            
            // Nettoyer la session locale
            if (!empty($_SESSION['user_id'])) {
                $pdo = DatabaseService::getInstance();
                $stmt = $pdo->prepare("DELETE FROM user_sessions WHERE id = ?");
                $stmt->execute([session_id()]);
                
                unset($_SESSION['user_id']);
                unset($_SESSION['session_token']);
            }
            
            // Détruire complètement la session
            session_destroy();
            
            $this->json(['success' => true, 'message' => 'Déconnexion réussie']);
            
        } catch (\Exception $e) {
            $this->handleError($e, 'AccountController::logout');
        }
    }
    
    /**
     * GET /api/account/user-profile - Profil utilisateur local complet
     */
    public function userProfile(): void
    {
        if (empty($_SESSION['user_id'])) {
            $this->json(['success' => false, 'message' => 'Non authentifié'], 401);
            return;
        }
        
        try {
            $pdo = DatabaseService::getInstance();
            $stmt = $pdo->prepare("
                SELECT * FROM users 
                WHERE id = ? AND statut = 'actif'
            ");
            $stmt->execute([$_SESSION['user_id']]);
            $user = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if (!$user) {
                $this->json(['success' => false, 'message' => 'Utilisateur introuvable'], 404);
                return;
            }
            
            // Obtenir les statistiques utilisateur
            $stats = $this->getUserStats((int)$user['id']);
            
            $this->json([
                'success' => true,
                'user' => $user,
                'stats' => $stats
            ]);
            
        } catch (\Exception $e) {
            $this->handleError($e, 'AccountController::userProfile');
        }
    }
    
    /**
     * GET /api/account/favorites - Favoris utilisateur
     */
    public function favorites(): void
    {
        if (empty($_SESSION['user_id'])) {
            $this->json(['success' => false, 'message' => 'Non authentifié'], 401);
            return;
        }
        
        try {
            $pdo = DatabaseService::getInstance();
            $stmt = $pdo->prepare("
                SELECT product_id, product_name, product_category, note_perso, date_ajout
                FROM user_favorites 
                WHERE user_id = ?
                ORDER BY date_ajout DESC
            ");
            $stmt->execute([$_SESSION['user_id']]);
            $favorites = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
            $this->json([
                'success' => true,
                'favorites' => $favorites
            ]);
            
        } catch (\Exception $e) {
            $this->handleError($e, 'AccountController::favorites');
        }
    }
    
    /**
     * GET /api/account/recommendations - Recommandations personnalisées
     */
    public function recommendations(): void
    {
        if (empty($_SESSION['user_id'])) {
            $this->json(['success' => false, 'message' => 'Non authentifié'], 401);
            return;
        }
        
        try {
            $pdo = DatabaseService::getInstance();
            
            // Récupérer le profil utilisateur
            $stmt = $pdo->prepare("SELECT espece, classe, historique, style_jeu FROM users WHERE id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            $user = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if (!$user) {
                $this->json(['success' => false, 'message' => 'Utilisateur introuvable'], 404);
                return;
            }
            
            // Générer des recommandations basées sur le profil
            $recommendations = $this->generateRecommendations($user);
            
            $this->json([
                'success' => true,
                'recommendations' => $recommendations
            ]);
            
        } catch (\Exception $e) {
            $this->handleError($e, 'AccountController::recommendations');
        }
    }
    
    /**
     * Crée une session utilisateur locale
     */
    private function createUserSession(int $userId): void
    {
        session_regenerate_id(true);
        
        $_SESSION['user_id'] = $userId;
        $_SESSION['session_token'] = bin2hex(random_bytes(32));
        
        // Enregistrer en base
        $pdo = DatabaseService::getInstance();
        $stmt = $pdo->prepare("
            INSERT OR REPLACE INTO user_sessions (
                id, user_id, ip_address, user_agent, expires_at
            ) VALUES (?, ?, ?, ?, datetime('now', '+30 days'))
        ");
        
        $stmt->execute([
            session_id(),
            $userId,
            $_SERVER['REMOTE_ADDR'] ?? '',
            $_SERVER['HTTP_USER_AGENT'] ?? ''
        ]);
    }
    
    /**
     * Génère des recommandations basées sur le profil D&D
     */
    private function generateRecommendations(array $user): array
    {
        $recommendations = [];
        
        // Recommandations par espèce
        $especeRecs = [
            'Humain' => [
                ['product_id' => 'lot10', 'title' => 'L\'Offrande du Voyageur', 'reason' => 'Starter pack parfait pour les humains polyvalents', 'score' => 85],
            ],
            'Elfe' => [
                ['product_id' => 'routes-services', 'title' => 'Routes & Services', 'reason' => 'Idéal pour les elfes voyageurs et mystiques', 'score' => 90],
            ],
            'Nain' => [
                ['product_id' => 'lot25', 'title' => 'La Monnaie des Cinq Royaumes', 'reason' => 'Collection complète pour les nains amateurs de richesse', 'score' => 88],
            ],
            'Halfelin' => [
                ['product_id' => 'lot10', 'title' => 'L\'Offrande du Voyageur', 'reason' => 'Parfait pour débuter l\'aventure halfeline', 'score' => 82],
            ],
            'Drakéide' => [
                ['product_id' => 'lot50-essence', 'title' => 'L\'Essence du Marchand', 'reason' => 'Opulence digne des descendants de dragons', 'score' => 92],
            ]
        ];
        
        // Recommandations par classe
        $classeRecs = [
            'Guerrier' => [
                ['product_id' => 'arsenal-aventurier', 'title' => 'Arsenal de l\'Aventurier', 'reason' => 'Équipement de combat pour guerriers', 'score' => 95],
            ],
            'Magicien' => [
                ['product_id' => 'butins-ingenieries', 'title' => 'Butins & Ingénieries', 'reason' => 'Objets magiques et merveilles arcanes', 'score' => 93],
            ],
            'Roublard' => [
                ['product_id' => 'butins-ingenieries', 'title' => 'Butins & Ingénieries', 'reason' => 'Outils spécialisés et équipement discret', 'score' => 87],
            ],
            'Clerc' => [
                ['product_id' => 'routes-services', 'title' => 'Routes & Services', 'reason' => 'Services divins et équipement ecclésiastique', 'score' => 85],
            ]
        ];
        
        // Ajouter les recommandations
        if (isset($especeRecs[$user['espece']])) {
            $recommendations = array_merge($recommendations, $especeRecs[$user['espece']]);
        }
        
        if (isset($classeRecs[$user['classe']])) {
            $recommendations = array_merge($recommendations, $classeRecs[$user['classe']]);
        }
        
        // Recommandation universelle
        $recommendations[] = [
            'product_id' => 'triptyques-mysteres',
            'title' => 'Triptyques Mystères - Origines Complètes',
            'reason' => 'Explorez de nouveaux personnages et combinaisons',
            'score' => 75
        ];
        
        // Dédupliquer et trier par score
        $uniqueRecs = [];
        foreach ($recommendations as $rec) {
            $key = $rec['product_id'];
            if (!isset($uniqueRecs[$key]) || $rec['score'] > $uniqueRecs[$key]['score']) {
                $uniqueRecs[$key] = $rec;
            }
        }
        
        usort($uniqueRecs, fn($a, $b) => $b['score'] <=> $a['score']);
        
        return array_slice($uniqueRecs, 0, 3);
    }
    
    /**
     * Obtient les statistiques utilisateur
     */
    private function getUserStats(int $userId): array
    {
        $pdo = DatabaseService::getInstance();
        
        // Compter les favoris
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM user_favorites WHERE user_id = ?");
        $stmt->execute([$userId]);
        $favoritesCount = $stmt->fetchColumn();
        
        // Compter les factures
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM user_invoices WHERE user_id = ?");
        $stmt->execute([$userId]);
        $invoicesCount = $stmt->fetchColumn();
        
        // Calcul du total dépensé
        $stmt = $pdo->prepare("SELECT SUM(total_amount) FROM user_invoices WHERE user_id = ? AND status != 'Cancelled'");
        $stmt->execute([$userId]);
        $totalSpent = $stmt->fetchColumn() ?: 0;
        
        return [
            'favorites_count' => $favoritesCount,
            'invoices_count' => $invoicesCount,
            'total_spent' => $totalSpent,
            'member_since' => null // À calculer depuis date_creation
        ];
    }
    
    /**
     * Récupère l'ID utilisateur local par email
     */
    private function getUserIdByEmail(string $email): ?int
    {
        if (empty($email)) return null;
        
        try {
            $pdo = DatabaseService::getInstance();
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            return $user ? (int) $user['id'] : null;
        } catch (\Exception $e) {
            error_log("Erreur getUserIdByEmail: " . $e->getMessage());
            return null;
        }
    }
}
