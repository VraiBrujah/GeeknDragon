<?php
/**
 * PRESENTA-AGENT - Générateur Dynamique
 * Li-CUBE PRO™ LFP - Rendu PHP depuis manifest.json
 * EDS Québec - 2025
 */

// Configuration
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/html; charset=UTF-8');

// Sécurité : vérification du répertoire
$allowedDir = __DIR__;
if (!file_exists($allowedDir . '/04_manifest.json')) {
    die('Erreur : Fichier manifest.json non trouvé');
}

// Chargement du manifest
$manifestPath = $allowedDir . '/04_manifest.json';
$manifestContent = file_get_contents($manifestPath);

if ($manifestContent === false) {
    die('Erreur : Impossible de lire le fichier manifest.json');
}

$manifest = json_decode($manifestContent, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    die('Erreur JSON : ' . json_last_error_msg());
}

// Paramètres URL
$format = $_GET['format'] ?? 'onepage';
$theme = $_GET['theme'] ?? 'default';
$lang = $_GET['lang'] ?? 'fr';

// Fonction de sécurité pour échapper les données
function escape($data) {
    return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
}

// Fonction pour formater les nombres
function formatNumber($number, $currency = false) {
    if ($currency) {
        return number_format($number, 0, ',', ' ') . ' CAD';
    }
    return number_format($number, 0, ',', ' ');
}

// Fonction pour générer les métadonnées
function generateMeta($manifest) {
    $product = $manifest['product'];
    $meta = $manifest['meta'];
    
    echo '<meta name="description" content="' . escape($meta['description']) . '">' . "\n";
    echo '<meta name="keywords" content="' . escape(implode(', ', $meta['keywords'])) . '">' . "\n";
    echo '<meta property="og:title" content="' . escape($product['name'] . ' ' . $product['model']) . '">' . "\n";
    echo '<meta property="og:description" content="' . escape($meta['description']) . '">' . "\n";
    echo '<meta property="og:type" content="' . escape($meta['schema_type']) . '">' . "\n";
}

// Fonction pour générer le CSS dynamique
function generateCSS($theme) {
    $themes = [
        'default' => [
            'primary' => '#2E86AB',
            'secondary' => '#A23B72',
            'accent' => '#F18F01'
        ],
        'dark' => [
            'primary' => '#1a2332',
            'secondary' => '#2E86AB',
            'accent' => '#F18F01'
        ],
        'corporate' => [
            'primary' => '#003366',
            'secondary' => '#0066CC',
            'accent' => '#FF6600'
        ]
    ];
    
    $colors = $themes[$theme] ?? $themes['default'];
    
    echo "<style>\n";
    echo ":root {\n";
    echo "  --primary-color: {$colors['primary']};\n";
    echo "  --secondary-color: {$colors['secondary']};\n";
    echo "  --accent-color: {$colors['accent']};\n";
    echo "}\n";
    echo "</style>\n";
}

// Fonction pour générer les spécifications
function generateSpecs($specs) {
    echo '<div class="specs-grid">' . "\n";
    
    foreach ($specs as $category => $values) {
        echo '<div class="spec-category">' . "\n";
        echo '<h3>' . escape(ucfirst(str_replace('_', ' ', $category))) . '</h3>' . "\n";
        
        foreach ($values as $key => $value) {
            if (is_array($value)) {
                $value = implode(', ', $value);
            }
            echo '<div class="spec-item">' . "\n";
            echo '<span class="spec-label">' . escape(ucfirst(str_replace('_', ' ', $key))) . '</span>' . "\n";
            echo '<span class="spec-value">' . escape($value) . '</span>' . "\n";
            echo '</div>' . "\n";
        }
        
        echo '</div>' . "\n";
    }
    
    echo '</div>' . "\n";
}

// Fonction pour générer la comparaison
function generateComparison($comparison) {
    echo '<div class="comparison-table">' . "\n";
    echo '<table>' . "\n";
    echo '<thead>' . "\n";
    echo '<tr>' . "\n";
    echo '<th>Critère</th>' . "\n";
    echo '<th>Li-CUBE PRO™ LFP</th>' . "\n";
    echo '<th>Ni-Cd Traditionnel</th>' . "\n";
    echo '<th>Amélioration</th>' . "\n";
    echo '</tr>' . "\n";
    echo '</thead>' . "\n";
    echo '<tbody>' . "\n";
    
    foreach ($comparison['advantages'] as $advantage) {
        echo '<tr>' . "\n";
        echo '<td>' . escape($advantage['metric']) . '</td>' . "\n";
        echo '<td class="lfp-value">' . escape($advantage['lfp']) . '</td>' . "\n";
        echo '<td class="nicd-value">' . escape($advantage['nicd']) . '</td>' . "\n";
        echo '<td class="improvement">' . escape($advantage['improvement']) . '</td>' . "\n";
        echo '</tr>' . "\n";
    }
    
    echo '</tbody>' . "\n";
    echo '</table>' . "\n";
    echo '</div>' . "\n";
}

// Fonction pour générer l'analyse TCO
function generateTCO($tco) {
    echo '<div class="tco-analysis">' . "\n";
    echo '<div class="tco-comparison">' . "\n";
    
    echo '<div class="tco-card lfp-card">' . "\n";
    echo '<h3>Li-CUBE PRO™ LFP</h3>' . "\n";
    echo '<div class="tco-amount">' . formatNumber($tco['lfp']['total_20_years'], true) . '</div>' . "\n";
    echo '<div class="tco-period">Total sur ' . $tco['period_years'] . ' ans</div>' . "\n";
    echo '</div>' . "\n";
    
    echo '<div class="tco-vs">' . "\n";
    echo '<div class="vs-label">VS</div>' . "\n";
    echo '<div class="savings-highlight">' . "\n";
    echo '<div class="savings-amount">' . formatNumber($tco['savings']['absolute'], true) . '</div>' . "\n";
    echo '<div class="savings-label">d\'économies (-' . $tco['savings']['percentage'] . '%)</div>' . "\n";
    echo '</div>' . "\n";
    echo '</div>' . "\n";
    
    echo '<div class="tco-card nicd-card">' . "\n";
    echo '<h3>Batteries Ni-Cd</h3>' . "\n";
    echo '<div class="tco-amount">' . formatNumber($tco['nicd']['total_20_years'], true) . '</div>' . "\n";
    echo '<div class="tco-period">Total sur ' . $tco['period_years'] . ' ans</div>' . "\n";
    echo '</div>' . "\n";
    
    echo '</div>' . "\n";
    echo '</div>' . "\n";
}

// Fonction pour générer les cas d'usage
function generateUseCases($useCases) {
    echo '<div class="use-cases-grid">' . "\n";
    
    foreach ($useCases as $useCase) {
        echo '<div class="use-case-card">' . "\n";
        echo '<h3>' . escape($useCase['title']) . '</h3>' . "\n";
        echo '<p>' . escape($useCase['description']) . '</p>' . "\n";
        echo '<ul>' . "\n";
        
        foreach ($useCase['benefits'] as $benefit) {
            echo '<li>' . escape($benefit) . '</li>' . "\n";
        }
        
        echo '</ul>' . "\n";
        echo '</div>' . "\n";
    }
    
    echo '</div>' . "\n";
}

// Fonction pour générer les fonctionnalités
function generateFeatures($features) {
    echo '<div class="features-grid">' . "\n";
    
    foreach ($features as $feature) {
        echo '<div class="feature-card">' . "\n";
        echo '<div class="feature-icon">' . escape($feature['icon']) . '</div>' . "\n";
        echo '<h3>' . escape($feature['title']) . '</h3>' . "\n";
        echo '<p>' . escape($feature['description']) . '</p>' . "\n";
        echo '</div>' . "\n";
    }
    
    echo '</div>' . "\n";
}

// Fonction pour générer les informations de contact
function generateContact($contact) {
    echo '<div class="contact-info">' . "\n";
    echo '<div class="contact-item">' . "\n";
    echo '<span class="contact-label">Entreprise</span>' . "\n";
    echo '<span class="contact-value">' . escape($contact['company']) . '</span>' . "\n";
    echo '</div>' . "\n";
    
    echo '<div class="contact-item">' . "\n";
    echo '<span class="contact-label">Téléphone</span>' . "\n";
    echo '<span class="contact-value">' . escape($contact['phone']) . '</span>' . "\n";
    echo '</div>' . "\n";
    
    echo '<div class="contact-item">' . "\n";
    echo '<span class="contact-label">Email</span>' . "\n";
    echo '<span class="contact-value">' . escape($contact['email']) . '</span>' . "\n";
    echo '</div>' . "\n";
    
    echo '<div class="contact-item">' . "\n";
    echo '<span class="contact-label">Site web</span>' . "\n";
    echo '<span class="contact-value">' . escape($contact['website']) . '</span>' . "\n";
    echo '</div>' . "\n";
    
    echo '<div class="contact-item">' . "\n";
    echo '<span class="contact-label">Adresse</span>' . "\n";
    echo '<span class="contact-value">' . escape($contact['address']) . '</span>' . "\n";
    echo '</div>' . "\n";
    echo '</div>' . "\n";
}

?>
<!DOCTYPE html>
<html lang="<?php echo escape($lang); ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo escape($manifest['product']['name'] . ' ' . $manifest['product']['model']); ?> - Rendu Dynamique | <?php echo escape($manifest['project']['client']); ?></title>
    
    <?php generateMeta($manifest); ?>
    <?php generateCSS($theme); ?>
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
    
    <style>
        /* CSS de base pour le rendu dynamique */
        body {
            font-family: 'Open Sans', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background: #f8f9fa;
            color: #212529;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: 2rem;
            border-radius: 10px;
            margin-bottom: 2rem;
            text-align: center;
        }
        
        .header h1 {
            font-family: 'Montserrat', sans-serif;
            font-size: 2.5rem;
            font-weight: 800;
            margin: 0 0 1rem 0;
        }
        
        .header .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .section {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            margin-bottom: 2rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .section h2 {
            font-family: 'Montserrat', sans-serif;
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary-color);
            margin: 0 0 1.5rem 0;
            border-bottom: 2px solid var(--accent-color);
            padding-bottom: 0.5rem;
        }
        
        .specs-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }
        
        .spec-category h3 {
            font-family: 'Montserrat', sans-serif;
            color: var(--secondary-color);
            margin-bottom: 1rem;
        }
        
        .spec-item {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid #e9ecef;
        }
        
        .spec-label {
            font-weight: 600;
            color: #6c757d;
        }
        
        .spec-value {
            font-weight: 700;
            color: var(--primary-color);
        }
        
        .comparison-table table {
            width: 100%;
            border-collapse: collapse;
            font-size: 1rem;
        }
        
        .comparison-table th,
        .comparison-table td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid #e9ecef;
        }
        
        .comparison-table th {
            background: var(--primary-color);
            color: white;
            font-weight: 600;
        }
        
        .lfp-value {
            color: #28a745;
            font-weight: 700;
        }
        
        .nicd-value {
            color: #dc3545;
            font-weight: 700;
        }
        
        .improvement {
            color: var(--accent-color);
            font-weight: 700;
        }
        
        .tco-comparison {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            gap: 2rem;
            align-items: center;
        }
        
        .tco-card {
            background: linear-gradient(135deg, #f8f9fa, rgba(46, 134, 171, 0.05));
            padding: 2rem;
            border-radius: 15px;
            text-align: center;
            border: 2px solid var(--primary-color);
        }
        
        .tco-amount {
            font-family: 'Montserrat', sans-serif;
            font-size: 2.5rem;
            font-weight: 800;
            color: var(--primary-color);
            margin: 1rem 0;
        }
        
        .tco-vs {
            text-align: center;
            padding: 2rem;
            background: linear-gradient(135deg, var(--accent-color), #28a745);
            border-radius: 50%;
            color: white;
            min-width: 150px;
            min-height: 150px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        
        .vs-label {
            font-size: 1.5rem;
            font-weight: 800;
            margin-bottom: 1rem;
        }
        
        .savings-amount {
            font-family: 'Montserrat', sans-serif;
            font-size: 1.2rem;
            font-weight: 700;
        }
        
        .use-cases-grid,
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }
        
        .use-case-card,
        .feature-card {
            background: linear-gradient(135deg, #f8f9fa, rgba(46, 134, 171, 0.05));
            padding: 2rem;
            border-radius: 10px;
            border-left: 4px solid var(--accent-color);
        }
        
        .feature-icon {
            font-size: 2rem;
            margin-bottom: 1rem;
        }
        
        .contact-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
        }
        
        .contact-item {
            display: flex;
            flex-direction: column;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
        }
        
        .contact-label {
            font-size: 0.9rem;
            color: #6c757d;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 0.5rem;
        }
        
        .contact-value {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--primary-color);
        }
        
        .footer {
            background: var(--primary-color);
            color: white;
            text-align: center;
            padding: 2rem;
            border-radius: 10px;
            margin-top: 2rem;
        }
        
        @media (max-width: 768px) {
            .tco-comparison {
                grid-template-columns: 1fr;
            }
            
            .tco-vs {
                order: -1;
                min-width: 120px;
                min-height: 120px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <header class="header">
            <h1><?php echo escape($manifest['product']['name'] . ' ' . $manifest['product']['model']); ?></h1>
            <div class="subtitle"><?php echo escape($manifest['product']['technology'] . ' - ' . $manifest['product']['application']); ?></div>
            <div style="margin-top: 1rem; font-size: 0.9rem; opacity: 0.8;">
                Généré le <?php echo date('d/m/Y à H:i'); ?> | Format: <?php echo escape($format); ?> | Thème: <?php echo escape($theme); ?>
            </div>
        </header>

        <!-- Spécifications Techniques -->
        <section class="section">
            <h2>📋 Spécifications Techniques</h2>
            <?php generateSpecs($manifest['specifications']); ?>
        </section>

        <!-- Comparaison vs Ni-Cd -->
        <section class="section">
            <h2>📊 Comparaison vs Batteries Ni-Cd</h2>
            <?php generateComparison($manifest['comparison']); ?>
        </section>

        <!-- Analyse TCO -->
        <section class="section">
            <h2>💰 Analyse TCO sur <?php echo $manifest['tco_analysis']['period_years']; ?> ans</h2>
            <?php generateTCO($manifest['tco_analysis']); ?>
        </section>

        <!-- Fonctionnalités -->
        <section class="section">
            <h2>🌟 Fonctionnalités Clés</h2>
            <?php generateFeatures($manifest['features']); ?>
        </section>

        <!-- Cas d'Usage -->
        <section class="section">
            <h2>🚊 Applications Ferroviaires</h2>
            <?php generateUseCases($manifest['use_cases']); ?>
        </section>

        <!-- Informations de Contact -->
        <section class="section">
            <h2>📞 Informations de Contact</h2>
            <?php generateContact($manifest['contact']); ?>
        </section>

        <!-- Footer -->
        <footer class="footer">
            <p>&copy; <?php echo date('Y'); ?> <?php echo escape($manifest['project']['client']); ?> | <?php echo escape($manifest['product']['name']); ?>™ est une marque déposée</p>
            <p style="font-size: 0.9rem; margin-top: 1rem; opacity: 0.8;">
                Document généré automatiquement par PRESENTA-AGENT | Version <?php echo escape($manifest['project']['version']); ?>
            </p>
        </footer>
    </div>

    <script>
        // Chargement des données dynamiques
        const manifestData = <?php echo json_encode($manifest, JSON_PRETTY_PRINT); ?>;
        
        console.log('Manifest chargé:', manifestData);
        
        // Fonctions utilitaires pour l'interactivité
        document.addEventListener('DOMContentLoaded', function() {
            // Animation d'entrée pour les sections
            const sections = document.querySelectorAll('.section');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            });
            
            sections.forEach(section => {
                section.style.opacity = '0';
                section.style.transform = 'translateY(30px)';
                section.style.transition = 'all 0.6s ease';
                observer.observe(section);
            });
            
            // Gestion des paramètres URL
            const urlParams = new URLSearchParams(window.location.search);
            console.log('Paramètres URL:', {
                format: urlParams.get('format') || 'onepage',
                theme: urlParams.get('theme') || 'default',
                lang: urlParams.get('lang') || 'fr'
            });
        });
    </script>
</body>
</html>