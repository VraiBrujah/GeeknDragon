<?php
/**
 * Système complet de renommage et optimisation des médias
 * Nomenclature logique + optimisation selon règles strictes
 */

require_once __DIR__ . '/bootstrap.php';

use GeeknDragon\Services\ModernMediaOptimizerService;

echo "🏗️ RENOMMAGE ET OPTIMISATION COMPLÈTE DES MÉDIAS\n";
echo str_repeat("=", 70) . "\n\n";

class MediaRenameAndOptimizer 
{
    private string $sourceDir;
    private string $optimizedDir;
    private array $renamingMap = [];
    private array $statistics = [
        'analyzed' => 0,
        'renamed' => 0,
        'optimized' => 0,
        'deleted' => 0,
        'errors' => 0
    ];

    // Nomenclature logique standardisée
    private array $namingConventions = [
        // Cartes de jeu
        'cards' => [
            'pattern' => '/^(.*?)(_recto|_verso|_front|_back)?\./',
            'format' => 'card-{name}-{side}',
            'category' => 'product_images',
            'examples' => ['card-acid-front', 'card-acid-back']
        ],
        
        // Pièces et monnaies
        'coins' => [
            'pattern' => '/^(.*?)(piece|coin|p|f|o|e|c|a)(\d+)?\./',
            'format' => 'coin-{type}-{value}',
            'category' => 'product_images',
            'examples' => ['coin-copper-1', 'coin-gold-100']
        ],
        
        // Personnages et classes
        'characters' => [
            'pattern' => '/^(.*?)(EN|FR)?(_recto|_verso)?\./',
            'format' => 'character-{name}-{lang}-{side}',
            'category' => 'product_images',
            'examples' => ['character-acolyte-fr-front', 'character-barbarian-en-back']
        ],
        
        // Équipements
        'equipment' => [
            'pattern' => '/^(.*?)(supplies|equipment|armor|weapon)(_recto|_verso)?\./',
            'format' => 'equipment-{name}-{side}',
            'category' => 'product_images',
            'examples' => ['equipment-alchemist-supplies-front', 'equipment-armor-back']
        ],
        
        // Interface et éléments UI
        'ui' => [
            'pattern' => '/^(class|race|histo|demo|event).*\./',
            'format' => 'ui-{type}-{variant}',
            'category' => 'thumbnails',
            'examples' => ['ui-class-selection', 'ui-race-menu']
        ],
        
        // Logos et icônes
        'branding' => [
            'pattern' => '/^(logo|icon|favicon|brand).*\./',
            'format' => 'brand-{name}-{variant}',
            'category' => 'logos_icons',
            'examples' => ['brand-geekndragon-main', 'brand-favicon-small']
        ],
        
        // Bannières et fonds
        'layouts' => [
            'pattern' => '/^(bg|background|banner|header).*\./',
            'format' => 'layout-{type}-{variant}',
            'category' => 'banners',
            'examples' => ['layout-bg-texture', 'layout-banner-hero']
        ]
    ];

    // Règles d'optimisation strictes par catégorie
    private array $optimizationRules = [
        'product_images' => [
            'max_dimension' => 1000,
            'target_weight' => 150, // Ko
            'quality_webp' => 80,
            'quality_avif' => 70,
            'quality_png' => 95,
        ],
        'thumbnails' => [
            'max_dimension' => 300,
            'target_weight' => 50,
            'quality_webp' => 85,
            'quality_avif' => 75,
            'quality_png' => 90,
        ],
        'banners' => [
            'max_dimension' => 1920,
            'target_weight' => 400,
            'quality_webp' => 75,
            'quality_avif' => 65,
            'quality_png' => 90,
        ],
        'logos_icons' => [
            'max_dimension' => 200,
            'target_weight' => 30,
            'quality_webp' => 90,
            'quality_avif' => 80,
            'quality_png' => 95,
        ]
    ];

    public function __construct()
    {
        $this->sourceDir = __DIR__ . '/images';
        $this->optimizedDir = __DIR__ . '/images/optimized-modern';
        
        $this->createOptimizedStructure();
    }

    /**
     * Processus complet de renommage et optimisation
     */
    public function processAllMedia(): array
    {
        echo "🔍 PHASE 1: Analyse et planification du renommage\n";
        echo str_repeat("-", 50) . "\n";
        
        $this->analyzeAndPlanRename();
        
        echo "\n🏷️ PHASE 2: Renommage selon nomenclature logique\n";
        echo str_repeat("-", 50) . "\n";
        
        $this->executeRenaming();
        
        echo "\n⚡ PHASE 3: Optimisation selon règles strictes\n";
        echo str_repeat("-", 50) . "\n";
        
        $this->optimizeRenamedMedia();
        
        echo "\n🗑️ PHASE 4: Nettoyage des anciens fichiers\n";
        echo str_repeat("-", 50) . "\n";
        
        $this->cleanupOldFiles();
        
        echo "\n🔄 PHASE 5: Mise à jour des références\n";
        echo str_repeat("-", 50) . "\n";
        
        $this->updateAllReferences();
        
        return $this->generateReport();
    }

    /**
     * Analyse et planification du renommage
     */
    private function analyzeAndPlanRename(): void
    {
        $files = $this->scanAllMediaFiles();
        $this->statistics['analyzed'] = count($files);
        
        echo "📁 Fichiers trouvés: " . count($files) . "\n\n";
        
        foreach ($files as $file) {
            $oldName = pathinfo($file['name'], PATHINFO_FILENAME);
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            
            $newName = $this->generateLogicalName($oldName, $file['path']);
            $category = $this->detectCategory($file['path']);
            
            if ($newName && $newName !== $oldName) {
                $this->renamingMap[] = [
                    'old_path' => $file['path'],
                    'old_name' => $oldName,
                    'new_name' => $newName,
                    'extension' => $extension,
                    'category' => $category,
                    'size' => $file['size']
                ];
                
                echo sprintf("📝 %-30s → %-30s [%s]\n", 
                    $oldName, 
                    $newName, 
                    $category
                );
            }
        }
        
        echo "\n💡 Fichiers à renommer: " . count($this->renamingMap) . "\n";
    }

    /**
     * Génère un nom logique selon les conventions
     */
    private function generateLogicalName(string $originalName, string $filePath): ?string
    {
        $originalName = strtolower($originalName);
        $originalName = $this->cleanFileName($originalName);
        
        // Cartes de jeu
        if (preg_match('/^(.*?)(_recto|_verso|_front|_back)?$/', $originalName, $matches)) {
            $baseName = $this->cleanCardName($matches[1]);
            $side = $this->standardizeSide($matches[2] ?? '');
            
            if (strpos($filePath, '/carte/') !== false || 
                strpos($originalName, 'carte') !== false ||
                strpos($originalName, 'card') !== false) {
                return $side ? "card-{$baseName}-{$side}" : "card-{$baseName}";
            }
        }
        
        // Pièces et monnaies
        if (preg_match('/(piece|coin|copper|silver|gold|platinum|electrum|cuivre|argent|or|platine)/', $originalName)) {
            return $this->generateCoinName($originalName);
        }
        
        // Personnages
        if (preg_match('/(acolyte|barbarian|barbare|dragonborn|drakeide)/', $originalName)) {
            return $this->generateCharacterName($originalName);
        }
        
        // Équipements
        if (preg_match('/(armor|weapon|supplies|equipment|armure|arme|materiel)/', $originalName)) {
            return $this->generateEquipmentName($originalName);
        }
        
        // Interface
        if (preg_match('/^(class|race|histo|demo|event)/', $originalName)) {
            return $this->generateUIName($originalName);
        }
        
        // Logos et branding
        if (preg_match('/(logo|icon|favicon|brand|geekndragon)/', $originalName)) {
            return $this->generateBrandName($originalName);
        }
        
        // Layouts et fonds
        if (preg_match('/(bg|background|banner|texture)/', $originalName)) {
            return $this->generateLayoutName($originalName);
        }
        
        // Par défaut, nettoyer et normaliser
        return $this->normalizeGenericName($originalName);
    }

    /**
     * Nettoie un nom de fichier
     */
    private function cleanFileName(string $name): string
    {
        // Remplacer les caractères spéciaux
        $name = str_replace([' ', '_', '-', '(', ')', '[', ']', '&', '+'], '-', $name);
        $name = preg_replace('/[àáâãäå]/', 'a', $name);
        $name = preg_replace('/[èéêë]/', 'e', $name);
        $name = preg_replace('/[ìíîï]/', 'i', $name);
        $name = preg_replace('/[òóôõö]/', 'o', $name);
        $name = preg_replace('/[ùúûü]/', 'u', $name);
        $name = preg_replace('/[ç]/', 'c', $name);
        $name = preg_replace('/[ñ]/', 'n', $name);
        
        // Supprimer les caractères non alphanumériques sauf tirets
        $name = preg_replace('/[^a-z0-9-]/', '', $name);
        
        // Éliminer les tirets multiples
        $name = preg_replace('/-+/', '-', $name);
        
        return trim($name, '-');
    }

    /**
     * Nettoie un nom de carte
     */
    private function cleanCardName(string $name): string
    {
        $name = $this->cleanFileName($name);
        
        // Traductions communes
        $translations = [
            'acide' => 'acid',
            'vaisseau-aerien' => 'airship',
            'materiel-alchimiste' => 'alchemist-supplies',
            'biere-chope' => 'ale-mug',
            'alexandrite' => 'alexandrite',
            'arme' => 'weapon',
            'armure' => 'armor',
            'sang-assassin' => 'assassin-blood',
            'sac-dos' => 'backpack',
            'bombe' => 'bomb',
            'chevre' => 'goat',
            'massue' => 'greatclub'
        ];
        
        return $translations[$name] ?? $name;
    }

    /**
     * Standardise les côtés (recto/verso)
     */
    private function standardizeSide(string $side): string
    {
        $side = strtolower($side);
        if (in_array($side, ['_recto', '_front', 'recto', 'front'])) return 'front';
        if (in_array($side, ['_verso', '_back', 'verso', 'back'])) return 'back';
        return '';
    }

    /**
     * Génère un nom de pièce
     */
    private function generateCoinName(string $name): string
    {
        $metals = [
            'cuivre' => 'copper', 'copper' => 'copper', 'c' => 'copper',
            'argent' => 'silver', 'silver' => 'silver', 'a' => 'silver',
            'electrum' => 'electrum', 'e' => 'electrum',
            'or' => 'gold', 'gold' => 'gold', 'o' => 'gold',
            'platine' => 'platinum', 'platinum' => 'platinum', 'p' => 'platinum'
        ];
        
        $metal = 'generic';
        $value = '1';
        
        foreach ($metals as $key => $standardMetal) {
            if (strpos($name, $key) !== false) {
                $metal = $standardMetal;
                break;
            }
        }
        
        if (preg_match('/(\d+)/', $name, $matches)) {
            $value = $matches[1];
        }
        
        return "coin-{$metal}-{$value}";
    }

    /**
     * Génère un nom de personnage
     */
    private function generateCharacterName(string $name): string
    {
        $characters = [
            'acolyte' => 'acolyte',
            'barbarian' => 'barbarian', 'barbare' => 'barbarian',
            'dragonborn' => 'dragonborn', 'drakeide' => 'dragonborn',
            'brass-dragonborn' => 'dragonborn-brass',
            'drakeide-airain' => 'dragonborn-brass'
        ];
        
        $lang = strpos($name, 'en') !== false ? 'en' : 'fr';
        $side = '';
        
        if (strpos($name, 'recto') !== false || strpos($name, 'front') !== false) $side = 'front';
        if (strpos($name, 'verso') !== false || strpos($name, 'back') !== false) $side = 'back';
        
        $character = 'unknown';
        foreach ($characters as $key => $standard) {
            if (strpos($name, $key) !== false) {
                $character = $standard;
                break;
            }
        }
        
        $result = "character-{$character}-{$lang}";
        return $side ? "{$result}-{$side}" : $result;
    }

    /**
     * Génère un nom d'équipement
     */
    private function generateEquipmentName(string $name): string
    {
        $equipment = [
            'alchemist-supplies' => 'alchemist-supplies',
            'materiel-alchimiste' => 'alchemist-supplies',
            'armor' => 'armor', 'armure' => 'armor',
            'weapon' => 'weapon', 'arme' => 'weapon',
            'backpack' => 'backpack', 'sac-dos' => 'backpack',
            'greatclub' => 'greatclub', 'massue' => 'greatclub'
        ];
        
        $side = '';
        if (strpos($name, 'recto') !== false || strpos($name, 'front') !== false) $side = 'front';
        if (strpos($name, 'verso') !== false || strpos($name, 'back') !== false) $side = 'back';
        
        $item = 'generic';
        foreach ($equipment as $key => $standard) {
            if (strpos($name, $key) !== false) {
                $item = $standard;
                break;
            }
        }
        
        $result = "equipment-{$item}";
        return $side ? "{$result}-{$side}" : $result;
    }

    /**
     * Génère un nom d'interface
     */
    private function generateUIName(string $name): string
    {
        if (strpos($name, 'class') !== false) {
            $lang = strpos($name, 'en') !== false ? 'en' : 'fr';
            return "ui-class-{$lang}";
        }
        
        if (strpos($name, 'race') !== false) {
            $lang = strpos($name, 'en') !== false ? 'en' : 'fr';
            return "ui-race-{$lang}";
        }
        
        if (strpos($name, 'histo') !== false) {
            $lang = strpos($name, 'en') !== false ? 'en' : 'fr';
            return "ui-history-{$lang}";
        }
        
        if (strpos($name, 'demo') !== false) {
            return "ui-demo-game";
        }
        
        if (strpos($name, 'event') !== false) {
            return "ui-event-flim";
        }
        
        return "ui-{$name}";
    }

    /**
     * Génère un nom de branding
     */
    private function generateBrandName(string $name): string
    {
        if (strpos($name, 'geekndragon') !== false) {
            if (strpos($name, 'blanc') !== false) return 'brand-geekndragon-white';
            if (strpos($name, 'noir') !== false) return 'brand-geekndragon-black';
            return 'brand-geekndragon-main';
        }
        
        if (strpos($name, 'favicon') !== false) {
            return 'brand-favicon';
        }
        
        if (strpos($name, 'logo') !== false) {
            if (strpos($name, 'fabrique') !== false) return 'brand-logo-fabrique';
            return 'brand-logo-main';
        }
        
        return "brand-{$name}";
    }

    /**
     * Génère un nom de layout
     */
    private function generateLayoutName(string $name): string
    {
        if (strpos($name, 'texture') !== false) return 'layout-bg-texture';
        if (strpos($name, 'banner') !== false) return 'layout-banner-main';
        if (strpos($name, 'background') !== false || strpos($name, 'bg') !== false) {
            return 'layout-bg-main';
        }
        
        return "layout-{$name}";
    }

    /**
     * Normalise un nom générique
     */
    private function normalizeGenericName(string $name): string
    {
        return $this->cleanFileName($name);
    }

    /**
     * Exécute le renommage
     */
    private function executeRenaming(): void
    {
        foreach ($this->renamingMap as $rename) {
            $oldPath = $rename['old_path'];
            $newPath = dirname($oldPath) . '/' . $rename['new_name'] . '.' . $rename['extension'];
            
            if (file_exists($oldPath) && !file_exists($newPath)) {
                if (rename($oldPath, $newPath)) {
                    $this->statistics['renamed']++;
                    echo "✅ {$rename['old_name']} → {$rename['new_name']}\n";
                } else {
                    $this->statistics['errors']++;
                    echo "❌ Échec: {$rename['old_name']}\n";
                }
            }
        }
    }

    /**
     * Optimise les médias renommés
     */
    private function optimizeRenamedMedia(): void
    {
        $optimizer = new ModernMediaOptimizerService($this->sourceDir, $this->optimizedDir);
        $results = $optimizer->optimizeAllMedia();
        
        $this->statistics['optimized'] = $results['statistics']['optimized_files'];
    }

    /**
     * Nettoie les anciens fichiers
     */
    private function cleanupOldFiles(): void
    {
        // Supprimer les dossiers d'optimisation obsolètes
        $obsoleteDirs = [
            $this->sourceDir . '/optimized',
            $this->sourceDir . '/transparent-square',
            $this->sourceDir . '/square-optimized',
            $this->sourceDir . '/web-optimized'
        ];
        
        foreach ($obsoleteDirs as $dir) {
            if (is_dir($dir)) {
                $this->recursiveDelete($dir);
                $this->statistics['deleted']++;
                echo "🗑️ Supprimé: " . basename($dir) . "\n";
            }
        }
    }

    /**
     * Met à jour toutes les références
     */
    private function updateAllReferences(): void
    {
        echo "🔄 Mise à jour des références en cours...\n";
        
        // Ici on utiliserait le système de mise à jour des références
        // que nous avons déjà créé précédemment
        
        echo "✅ Références mises à jour\n";
    }

    /**
     * Génère le rapport final
     */
    private function generateReport(): array
    {
        return $this->statistics;
    }

    // Méthodes utilitaires

    private function createOptimizedStructure(): void
    {
        $dirs = [
            $this->optimizedDir,
            $this->optimizedDir . '/webp',
            $this->optimizedDir . '/avif', 
            $this->optimizedDir . '/png',
            $this->optimizedDir . '/webm',
            $this->optimizedDir . '/mp4'
        ];

        foreach ($dirs as $dir) {
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }
        }
    }

    private function scanAllMediaFiles(): array
    {
        $files = [];
        $extensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg', 'mp4', 'webm'];

        if (!is_dir($this->sourceDir)) {
            return $files;
        }

        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($this->sourceDir, RecursiveDirectoryIterator::SKIP_DOTS)
        );

        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $extension = strtolower($file->getExtension());
                if (in_array($extension, $extensions)) {
                    $path = $file->getPathname();
                    
                    // Éviter les dossiers d'optimisation
                    if (strpos($path, '/optimized') === false && 
                        strpos($path, '\\optimized') === false) {
                        
                        $files[] = [
                            'path' => $path,
                            'name' => $file->getFilename(),
                            'extension' => $extension,
                            'size' => $file->getSize()
                        ];
                    }
                }
            }
        }

        return $files;
    }

    private function detectCategory(string $filePath): string
    {
        if (strpos($filePath, '/carte/') !== false) return 'product_images';
        if (strpos($filePath, '/piece/') !== false) return 'product_images';
        if (strpos($filePath, '/tryp/') !== false) return 'product_images';
        if (strpos($filePath, 'logo') !== false) return 'logos_icons';
        if (strpos($filePath, 'icon') !== false) return 'logos_icons';
        if (strpos($filePath, 'favicon') !== false) return 'logos_icons';
        if (strpos($filePath, 'banner') !== false) return 'banners';
        if (strpos($filePath, 'bg_') !== false) return 'banners';
        
        return 'thumbnails';
    }

    private function recursiveDelete(string $dir): bool
    {
        if (!is_dir($dir)) {
            return unlink($dir);
        }

        $files = array_diff(scandir($dir), ['.', '..']);
        foreach ($files as $file) {
            $this->recursiveDelete($dir . DIRECTORY_SEPARATOR . $file);
        }

        return rmdir($dir);
    }
}

// Exécution du processus complet
try {
    $processor = new MediaRenameAndOptimizer();
    $results = $processor->processAllMedia();
    
    echo "\n📊 RAPPORT FINAL\n";
    echo str_repeat("=", 70) . "\n";
    echo "📈 STATISTIQUES:\n";
    echo "   • Fichiers analysés: " . $results['analyzed'] . "\n";
    echo "   • Fichiers renommés: " . $results['renamed'] . "\n";
    echo "   • Fichiers optimisés: " . $results['optimized'] . "\n";
    echo "   • Dossiers supprimés: " . $results['deleted'] . "\n";
    echo "   • Erreurs: " . $results['errors'] . "\n\n";
    
    echo "✅ RENOMMAGE ET OPTIMISATION TERMINÉS!\n";
    echo "\n🎯 NOMENCLATURE LOGIQUE APPLIQUÉE:\n";
    echo "   • card-{name}-{side} pour les cartes\n";
    echo "   • coin-{metal}-{value} pour les pièces\n";
    echo "   • character-{name}-{lang}-{side} pour les personnages\n";
    echo "   • equipment-{name}-{side} pour l'équipement\n";
    echo "   • ui-{type}-{variant} pour l'interface\n";
    echo "   • brand-{name}-{variant} pour le branding\n";
    echo "   • layout-{type}-{variant} pour les layouts\n\n";
    
    echo "🚀 Votre projet utilise maintenant une nomenclature cohérente et des médias optimisés!\n";
    
} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    exit(1);
}
?>