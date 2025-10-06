<?php
/**
 * Interface d'administration pour la gestion des produits via CSV
 *
 * Sécurisé par authentification basique
 */

require __DIR__ . '/bootstrap.php';
// Sécuriser les cookies de session (avant session_start)
$https = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] && strtolower((string) $_SERVER['HTTPS']) !== 'off')
    || (isset($_SERVER['REQUEST_SCHEME']) && strtolower((string) $_SERVER['REQUEST_SCHEME']) === 'https')
    || (isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443);
if (PHP_VERSION_ID >= 70300) {
    session_set_cookie_params([
        'secure' => $https,
        'httponly' => true,
        'samesite' => 'Strict',
        'path' => '/',
    ]);
} else {
    ini_set('session.cookie_secure', $https ? '1' : '0');
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_samesite', 'Strict');
}
session_start();
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Récupération du mot de passe administrateur haché depuis l'environnement
$adminPasswordHash = $_ENV['ADMIN_PASSWORD_HASH'] ?? $_SERVER['ADMIN_PASSWORD_HASH'] ?? null;

if (!is_string($adminPasswordHash) || $adminPasswordHash === '') {
    http_response_code(500);
    error_log('Variable ADMIN_PASSWORD_HASH manquante ou vide.');
    echo 'Configuration de sécurité manquante. Merci de contacter l\'équipe technique.';
    exit;
}

// Vérification de l'authentification
if (!isset($_SESSION['admin_authenticated'])) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
        if (!isset($_POST['csrf_token']) || !hash_equals($_SESSION['csrf_token'] ?? '', (string)$_POST['csrf_token'])) {
            $loginError = 'Requête invalide (CSRF).';
        } elseif (password_verify($_POST['password'], $adminPasswordHash)) {
            session_regenerate_id(true);
            $_SESSION['admin_authenticated'] = true;
            header('Location: ' . $_SERVER['PHP_SELF']);
            exit;
        } else {
            $loginError = 'Mot de passe incorrect';
        }
    }
    
    // Affichage du formulaire de connexion
    ?>
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Administration Produits - GeeknDragon</title>
        <link rel="stylesheet" href="/css/style.css">
    </head>
    <body class="bg-gray-900 text-gray-100">
        <div class="min-h-screen flex items-center justify-center">
            <div class="bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
                <h1 class="text-2xl font-bold text-center mb-6">🔐 Administration Produits</h1>
                
                <?php if (isset($loginError)): ?>
                    <div class="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
                        <?= htmlspecialchars($loginError) ?>
                    </div>
                <?php endif; ?>
                
                <form method="POST" class="space-y-4">
                    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($_SESSION['csrf_token'] ?? '') ?>">
                    <div>
                        <label for="password" class="block text-sm font-medium mb-2">Mot de passe :</label>
                        <input type="password" id="password" name="password" required
                               class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    </div>
                    <button type="submit" 
                            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors">
                        Se connecter
                    </button>
                </form>
            </div>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// Déconnexion
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: ' . $_SERVER['PHP_SELF']);
    exit;
}



$manager = new \\GeeknDragon\\Includes\\CsvProductsManager();
$message = '';
$messageType = '';

// Traitement des actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Protection CSRF pour toutes les actions
    if (!isset($_POST['csrf_token']) || !hash_equals($_SESSION['csrf_token'] ?? '', (string)$_POST['csrf_token'])) {
        $message = 'Requête invalide (CSRF).';
        $messageType = 'error';
    } elseif (isset($_POST['action'])) {
        
        switch ($_POST['action']) {
            case 'upload_csv':
                if (isset($_FILES['csv_file']) && $_FILES['csv_file']['error'] === UPLOAD_ERR_OK) {
                    $uploadPath = __DIR__ . '/data/products_upload.csv';
                    
                    // Validation taille (<= 5 Mo) et type MIME
                    if (($_FILES['csv_file']['size'] ?? 0) > 5 * 1024 * 1024) {
                        $message = 'Fichier trop volumineux (max 5 Mo).';
                        $messageType = 'error';
                        break;
                    }
                    $finfo = new finfo(FILEINFO_MIME_TYPE);
                    $mime = $finfo->file($_FILES['csv_file']['tmp_name']);
                    $allowed = ['text/plain','text/csv','application/vnd.ms-excel','application/csv'];
                    if (!in_array($mime, $allowed, true)) {
                        $message = 'Type de fichier invalide (' . htmlspecialchars((string)$mime) . ').';
                        $messageType = 'error';
                        break;
                    }

                    if (move_uploaded_file($_FILES['csv_file']['tmp_name'], $uploadPath)) {
                        // Validation du CSV
                        $validation = $manager->validateCsv($uploadPath);
                        
                        if ($validation['success']) {
                            // Conversion CSV vers JSON
                            $conversion = $manager->convertCsvToJson($uploadPath, __DIR__ . '/data/products.json');
                            
                            if ($conversion['success']) {
                                $message = '✅ ' . $conversion['message'];
                                $messageType = 'success';
                                unlink($uploadPath); // Supprimer le fichier temporaire
                            } else {
                                $message = '❌ ' . $conversion['message'];
                                $messageType = 'error';
                            }
                        } else {
                            $message = '❌ ' . $validation['message'];
                            if (isset($validation['errors'])) {
                                $message .= '<br>' . implode('<br>', $validation['errors']);
                            }
                            $messageType = 'error';
                        }
                    } else {
                        $message = '❌ Erreur lors de l\'upload du fichier';
                        $messageType = 'error';
                    }
                } else {
                    $message = '❌ Aucun fichier sélectionné ou erreur d\'upload';
                    $messageType = 'error';
                }
                break;
                
            case 'download_csv':
                $csvPath = __DIR__ . '/data/products_export.csv';
                $result = $manager->convertJsonToCsv(__DIR__ . '/data/products.json', $csvPath);
                
                if ($result['success']) {
                    header('Content-Type: text/csv');
                    header('Content-Disposition: attachment; filename="geekndragon_products_' . date('Y-m-d_H-i-s') . '.csv"');
                    header('X-Content-Type-Options: nosniff');
                    header('Content-Length: ' . filesize($csvPath));
                    readfile($csvPath);
                    unlink($csvPath); // Supprimer le fichier temporaire
                    exit;
                } else {
                    $message = '❌ ' . $result['message'];
                    $messageType = 'error';
                }
                break;
        }
    }
}

// Statistiques
$productsData = json_decode(file_get_contents(__DIR__ . '/data/products.json'), true) ?? [];
$stats = [
    'total_products' => count($productsData),
    'with_multipliers' => count(array_filter($productsData, fn($p) => !empty($p['multipliers']))),
    'customizable' => count(array_filter($productsData, fn($p) => !empty($p['customizable']))),
    'with_images' => count(array_filter($productsData, fn($p) => !empty($p['images'])))
];
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Administration Produits - GeeknDragon</title>
    <link rel="stylesheet" href="/css/style.css">
    <style>
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }
        .file-drop-zone {
            border: 2px dashed #4B5563;
            border-radius: 0.5rem;
            padding: 2rem;
            text-align: center;
            transition: all 0.3s;
            cursor: pointer;
        }
        .file-drop-zone:hover {
            border-color: #6366F1;
            background-color: rgba(99, 102, 241, 0.1);
        }
        .file-drop-zone.dragover {
            border-color: #6366F1;
            background-color: rgba(99, 102, 241, 0.2);
        }
    </style>
</head>
<body class="bg-gray-900 text-gray-100 min-h-screen">
    
    <div class="container mx-auto px-4 py-8 max-w-6xl">
        
        <!-- En-tête -->
        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-3xl font-bold">🛠️ Administration Produits</h1>
                <p class="text-gray-400 mt-2">Gestion des produits via fichier CSV</p>
            </div>
            <div class="flex gap-4">
                <a href="/" class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors">
                    🏠 Retour au site
                </a>
                <a href="?logout" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors">
                    🚪 Déconnexion
                </a>
            </div>
        </div>

        <!-- Messages -->
        <?php if ($message): ?>
            <div class="mb-6 p-4 rounded-lg <?= $messageType === 'success' ? 'bg-green-900 border border-green-700 text-green-200' : 'bg-red-900 border border-red-700 text-red-200' ?>">
                <?= $message ?>
            </div>
        <?php endif; ?>

        <!-- Statistiques -->
        <div class="bg-gray-800 rounded-xl p-6 mb-8">
            <h2 class="text-xl font-semibold mb-4">📊 Statistiques</h2>
            <div class="stats-grid">
                <div class="bg-gray-700 p-4 rounded-lg text-center">
                    <div class="text-2xl font-bold text-indigo-400"><?= $stats['total_products'] ?></div>
                    <div class="text-sm text-gray-300">Produits total</div>
                </div>
                <div class="bg-gray-700 p-4 rounded-lg text-center">
                    <div class="text-2xl font-bold text-green-400"><?= $stats['with_multipliers'] ?></div>
                    <div class="text-sm text-gray-300">Avec multiplicateurs</div>
                </div>
                <div class="bg-gray-700 p-4 rounded-lg text-center">
                    <div class="text-2xl font-bold text-yellow-400"><?= $stats['customizable'] ?></div>
                    <div class="text-sm text-gray-300">Personnalisables</div>
                </div>
                <div class="bg-gray-700 p-4 rounded-lg text-center">
                    <div class="text-2xl font-bold text-blue-400"><?= $stats['with_images'] ?></div>
                    <div class="text-sm text-gray-300">Avec images</div>
                </div>
            </div>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
            
            <!-- Upload CSV -->
            <div class="bg-gray-800 rounded-xl p-6">
                <h2 class="text-xl font-semibold mb-4">📤 Importer un CSV</h2>
                <p class="text-gray-400 mb-4">
                    Sélectionnez un fichier CSV pour mettre à jour les produits.
                    Le fichier existant sera sauvegardé automatiquement.
                </p>
                
                <form method="POST" enctype="multipart/form-data" id="uploadForm">
                    <input type="hidden" name="action" value="upload_csv">
                    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($_SESSION['csrf_token'] ?? '') ?>">
                    
                    <div class="file-drop-zone mb-4" id="dropZone">
                        <div class="mb-4">
                            <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </div>
                        <p class="text-lg mb-2">Glissez votre fichier CSV ici</p>
                        <p class="text-sm text-gray-400 mb-4">ou cliquez pour sélectionner</p>
                        <input type="file" name="csv_file" accept=".csv" required id="fileInput" class="hidden">
                        <span id="fileName" class="text-sm text-indigo-400"></span>
                    </div>
                    
                    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded transition-colors">
                        🚀 Importer et appliquer
                    </button>
                </form>
            </div>

            <!-- Download CSV -->
            <div class="bg-gray-800 rounded-xl p-6">
                <h2 class="text-xl font-semibold mb-4">📥 Exporter en CSV</h2>
                <p class="text-gray-400 mb-4">
                    Téléchargez le fichier CSV actuel pour le modifier avec Excel ou LibreOffice.
                    Toutes les données (images, variations, options) sont incluses.
                </p>
                
                <form method="POST">
                    <input type="hidden" name="action" value="download_csv">
                    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($_SESSION['csrf_token'] ?? '') ?>">
                    <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition-colors">
                        💾 Télécharger le CSV
                    </button>
                </form>
                
                <div class="mt-6 p-4 bg-gray-700 rounded-lg">
                    <h3 class="font-semibold mb-2">🔧 Colonnes CSV disponibles :</h3>
                    <div class="text-xs text-gray-300 space-y-1">
                        <div><strong>Base :</strong> id, name_fr, name_en, price</div>
                        <div><strong>Contenu :</strong> description_fr/en, summary_fr/en</div>
                        <div><strong>Média :</strong> images (séparées par |)</div>
                        <div><strong>Variations :</strong> multipliers, metals_fr/en, languages</div>
                        <div><strong>Options :</strong> coin_lots (JSON), triptych_options, customizable</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Instructions -->
        <div class="bg-gray-800 rounded-xl p-6 mt-8">
            <h2 class="text-xl font-semibold mb-4">📋 Instructions</h2>
            <div class="grid md:grid-cols-2 gap-6">
                <div>
                    <h3 class="font-semibold text-indigo-400 mb-2">1. Modification des produits</h3>
                    <ul class="text-sm text-gray-300 space-y-1">
                        <li>• Téléchargez le CSV actuel</li>
                        <li>• Ouvrez avec Excel/LibreOffice Calc</li>
                        <li>• Modifiez les prix, descriptions, images</li>
                        <li>• Sauvegardez au format CSV</li>
                        <li>• Importez le fichier modifié</li>
                    </ul>
                </div>
                <div>
                    <h3 class="font-semibold text-indigo-400 mb-2">2. Format des données</h3>
                    <ul class="text-sm text-gray-300 space-y-1">
                        <li>• <strong>Images :</strong> /chemin/img1.webp|/chemin/img2.webp</li>
                        <li>• <strong>Multiplicateurs :</strong> 1|10|100|1000|10000</li>
                        <li>• <strong>Métaux :</strong> cuivre|argent|électrum|or|platine</li>
                        <li>• <strong>Coin lots :</strong> {"copper":1,"silver":2}</li>
                        <li>• <strong>Boolean :</strong> true/false</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Gestion du drag & drop
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const fileName = document.getElementById('fileName');

        dropZone.addEventListener('click', () => fileInput.click());

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                updateFileName();
            }
        });

        fileInput.addEventListener('change', updateFileName);

        function updateFileName() {
            if (fileInput.files.length > 0) {
                fileName.textContent = `📄 ${fileInput.files[0].name}`;
            }
        }

        // Confirmation avant upload
        document.getElementById('uploadForm').addEventListener('submit', (e) => {
            if (!confirm('Êtes-vous sûr de vouloir importer ce fichier ? Les produits actuels seront remplacés (une sauvegarde sera créée).')) {
                e.preventDefault();
            }
        });
    </script>
</body>
</html>
