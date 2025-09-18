<?php
/**
 * API d'inscription des utilisateurs avec profil D&D
 * Geek&Dragon - Système de comptes aventuriers
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gestion des requêtes OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Vérification de la méthode HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
    exit();
}

try {
    // Récupération et validation des données JSON
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Données JSON invalides');
    }

    // Validation des champs requis
    $requiredFields = [
        'email', 'password', 'nom_aventurier', 'niveau',
        'espece', 'classe', 'historique', 'style_jeu',
        'experience_jeu', 'campagnes_preferees'
    ];

    foreach ($requiredFields as $field) {
        if (!isset($input[$field]) || empty(trim($input[$field]))) {
            throw new Exception("Le champ '$field' est requis");
        }
    }

    // Validation spécifique de l'email
    $email = filter_var(trim($input['email']), FILTER_VALIDATE_EMAIL);
    if (!$email) {
        throw new Exception('Format d\'email invalide');
    }

    // Validation du mot de passe
    $password = $input['password'];
    if (strlen($password) < 8) {
        throw new Exception('Le mot de passe doit contenir au moins 8 caractères');
    }
    if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/', $password)) {
        throw new Exception('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre');
    }

    // Validation du nom d'aventurier
    $nom_aventurier = trim($input['nom_aventurier']);
    if (strlen($nom_aventurier) < 2 || strlen($nom_aventurier) > 50) {
        throw new Exception('Le nom d\'aventurier doit contenir entre 2 et 50 caractères');
    }

    // Validation du niveau
    $niveau = intval($input['niveau']);
    if ($niveau < 1 || $niveau > 20) {
        throw new Exception('Le niveau doit être compris entre 1 et 20');
    }

    // Connexion à la base de données SQLite
    $dbPath = __DIR__ . '/../database/geekndragon.db';
    $dbDir = dirname($dbPath);
    
    // Créer le dossier database s'il n'existe pas
    if (!is_dir($dbDir)) {
        mkdir($dbDir, 0755, true);
    }

    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Initialiser la base de données si elle n'existe pas
    initializeDatabase($pdo);

    // Vérifier si l'email existe déjà
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        throw new Exception('Cet email est déjà utilisé');
    }

    // Vérifier si le nom d'aventurier existe déjà
    $stmt = $pdo->prepare("SELECT id FROM users WHERE nom_aventurier = ?");
    $stmt->execute([$nom_aventurier]);
    if ($stmt->fetch()) {
        throw new Exception('Ce nom d\'aventurier est déjà pris');
    }

    // Validation des choix D&D contre la base
    $validChoices = validateDndChoices($pdo, $input['espece'], $input['classe'], $input['historique']);
    if (!$validChoices['valid']) {
        throw new Exception($validChoices['error']);
    }

    // Hachage du mot de passe
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    // Insertion de l'utilisateur
    $stmt = $pdo->prepare("
        INSERT INTO users (
            email, password_hash, nom_aventurier, niveau, espece, classe, historique,
            style_jeu, experience_jeu, campagnes_preferees, date_creation, email_verifie
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), 0)
    ");

    $stmt->execute([
        $email,
        $passwordHash,
        $nom_aventurier,
        $niveau,
        $input['espece'],
        $input['classe'],
        $input['historique'],
        $input['style_jeu'],
        $input['experience_jeu'],
        $input['campagnes_preferees']
    ]);

    $userId = $pdo->lastInsertId();

    // Génération des recommandations initiales
    generateInitialRecommendations($pdo, $userId, $input);

    // Journalisation de la création de compte
    error_log("Nouveau compte créé: $email (ID: $userId) - Aventurier: $nom_aventurier");

    // Réponse de succès
    echo json_encode([
        'success' => true,
        'message' => 'Compte créé avec succès',
        'user_id' => $userId,
        'adventurer_name' => $nom_aventurier
    ]);

} catch (PDOException $e) {
    error_log("Erreur PDO lors de l'inscription: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur de base de données'
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

/**
 * Initialise la base de données avec le schéma complet
 */
function initializeDatabase($pdo) {
    // Lire et exécuter le schéma depuis le fichier SQL
    $schemaPath = __DIR__ . '/../database-schema.sql';
    if (file_exists($schemaPath)) {
        $schema = file_get_contents($schemaPath);
        $pdo->exec($schema);
    } else {
        // Schéma minimal si le fichier n'existe pas
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                nom_aventurier TEXT NOT NULL UNIQUE,
                niveau INTEGER DEFAULT 1,
                espece TEXT NOT NULL,
                classe TEXT NOT NULL,
                historique TEXT NOT NULL,
                style_jeu TEXT,
                experience_jeu TEXT,
                campagnes_preferees TEXT,
                date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
                derniere_connexion DATETIME,
                email_verifie BOOLEAN DEFAULT 0,
                statut TEXT DEFAULT 'actif'
            )
        ");
    }
}

/**
 * Valide les choix D&D contre la configuration de la base
 */
function validateDndChoices($pdo, $espece, $classe, $historique) {
    try {
        // Vérifier que la table dnd_config existe
        $stmt = $pdo->prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='dnd_config'");
        $stmt->execute();
        if (!$stmt->fetch()) {
            // Si la table n'existe pas, on considère que tous les choix sont valides
            return ['valid' => true];
        }

        // Valider l'espèce
        $stmt = $pdo->prepare("SELECT nom FROM dnd_config WHERE type = 'espece' AND nom = ? AND actif = 1");
        $stmt->execute([$espece]);
        if (!$stmt->fetch()) {
            return ['valid' => false, 'error' => "Espèce '$espece' non valide"];
        }

        // Valider la classe
        $stmt = $pdo->prepare("SELECT nom FROM dnd_config WHERE type = 'classe' AND nom = ? AND actif = 1");
        $stmt->execute([$classe]);
        if (!$stmt->fetch()) {
            return ['valid' => false, 'error' => "Classe '$classe' non valide"];
        }

        // Valider l'historique
        $stmt = $pdo->prepare("SELECT nom FROM dnd_config WHERE type = 'historique' AND nom = ? AND actif = 1");
        $stmt->execute([$historique]);
        if (!$stmt->fetch()) {
            return ['valid' => false, 'error' => "Historique '$historique' non valide"];
        }

        return ['valid' => true];
    } catch (PDOException $e) {
        // En cas d'erreur, on considère que les choix sont valides pour ne pas bloquer l'inscription
        error_log("Erreur lors de la validation des choix D&D: " . $e->getMessage());
        return ['valid' => true];
    }
}

/**
 * Génère les recommandations initiales basées sur le profil D&D
 */
function generateInitialRecommendations($pdo, $userId, $userData) {
    try {
        // Vérifier que la table user_recommendations existe
        $stmt = $pdo->prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='user_recommendations'");
        $stmt->execute();
        if (!$stmt->fetch()) {
            return; // Table n'existe pas, on passe
        }

        // Mapping des produits recommandés
        $productMapping = [
            // Espèces
            'Humain' => ['pieces-offrande', 'cartes-arsenal', 'triptyques-mysteres'],
            'Elfe' => ['pieces-offrande', 'pieces-cinq-royaumes', 'cartes-routes'],
            'Nain' => ['pieces-cinq-royaumes', 'cartes-arsenal', 'pieces-essence'],
            'Halfelin' => ['pieces-offrande', 'cartes-routes', 'triptyques-mysteres'],
            'Drakéide' => ['pieces-essence', 'pieces-tresorerie', 'cartes-arsenal'],
            'Gnome' => ['cartes-butins', 'pieces-offrande', 'triptyques-mysteres'],
            'Demi-Elfe' => ['pieces-offrande', 'cartes-arsenal', 'triptyques-mysteres'],
            'Demi-Orc' => ['cartes-arsenal', 'pieces-cinq-royaumes', 'pieces-tresorerie'],
            'Tieffelin' => ['pieces-essence', 'cartes-butins', 'triptyques-mysteres'],
            
            // Classes
            'Guerrier' => ['cartes-arsenal', 'pieces-cinq-royaumes', 'pieces-tresorerie'],
            'Magicien' => ['cartes-butins', 'pieces-essence', 'triptyques-mysteres'],
            'Roublard' => ['cartes-butins', 'pieces-offrande', 'cartes-routes'],
            'Clerc' => ['pieces-cinq-royaumes', 'cartes-routes', 'triptyques-mysteres'],
            'Rôdeur' => ['cartes-routes', 'pieces-offrande', 'cartes-arsenal'],
            'Paladin' => ['cartes-arsenal', 'pieces-cinq-royaumes', 'pieces-tresorerie'],
            'Sorcier' => ['cartes-butins', 'pieces-essence', 'triptyques-mysteres'],
            'Barde' => ['cartes-routes', 'triptyques-mysteres', 'pieces-offrande'],
            'Barbare' => ['cartes-arsenal', 'pieces-tresorerie', 'pieces-cinq-royaumes'],
            'Moine' => ['pieces-offrande', 'cartes-routes', 'triptyques-mysteres'],
            'Druide' => ['cartes-routes', 'pieces-offrande', 'triptyques-mysteres'],
            'Occultiste' => ['cartes-butins', 'pieces-essence', 'triptyques-mysteres']
        ];

        $recommendations = [];
        $score = 100;

        // Recommandations basées sur l'espèce
        if (isset($productMapping[$userData['espece']])) {
            foreach ($productMapping[$userData['espece']] as $productId) {
                $recommendations[] = [
                    'product_id' => $productId,
                    'type' => 'profil_dnd',
                    'score' => $score / 100,
                    'raison' => "Recommandé pour les {$userData['espece']}s"
                ];
                $score -= 5;
            }
        }

        // Recommandations basées sur la classe
        if (isset($productMapping[$userData['classe']])) {
            foreach ($productMapping[$userData['classe']] as $productId) {
                // Vérifier si déjà recommandé
                $exists = false;
                foreach ($recommendations as &$rec) {
                    if ($rec['product_id'] === $productId) {
                        $rec['score'] = min(1.0, $rec['score'] + 0.1);
                        $rec['raison'] .= " + Idéal pour un {$userData['classe']}";
                        $exists = true;
                        break;
                    }
                }
                
                if (!$exists) {
                    $recommendations[] = [
                        'product_id' => $productId,
                        'type' => 'profil_dnd',
                        'score' => ($score - 10) / 100,
                        'raison' => "Parfait pour un {$userData['classe']}"
                    ];
                    $score -= 5;
                }
            }
        }

        // Insertion des recommandations
        foreach ($recommendations as $rec) {
            $stmt = $pdo->prepare("
                INSERT INTO user_recommendations (
                    user_id, product_id, type_recommandation, score, raison,
                    date_generation, expires_at
                ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now', '+30 days'))
            ");
            
            $stmt->execute([
                $userId,
                $rec['product_id'],
                $rec['type'],
                $rec['score'],
                $rec['raison']
            ]);
        }

        error_log("Recommandations générées pour l'utilisateur $userId: " . count($recommendations) . " produits");

    } catch (PDOException $e) {
        error_log("Erreur lors de la génération des recommandations: " . $e->getMessage());
        // On ne bloque pas l'inscription en cas d'erreur de recommandations
    }
}
?>