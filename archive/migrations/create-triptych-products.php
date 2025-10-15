<?php
/**
 * Script pour créer les 3 nouveaux produits triptyques et les ajouter au CSV
 */

echo "=== CRÉATION DES NOUVEAUX PRODUITS TRIPTYQUES ===" . PHP_EOL . PHP_EOL;

// Fonction pour extraire les noms depuis les fichiers de données
function extractNames($filePath, $pattern = '/^nom:\s*(.+)$/m') {
    if (!file_exists($filePath)) {
        echo "Fichier non trouvé: $filePath" . PHP_EOL;
        return [];
    }
    
    $content = file_get_contents($filePath);
    preg_match_all($pattern, $content, $matches);
    
    // Nettoyer et dédupliquer les noms
    $names = array_unique(array_map('trim', $matches[1]));
    return array_values($names);
}

// Extraction des options depuis les fichiers de données
$classNames = extractNames('data/DataCarteTryptique/zTryp-Classe.txt');
$speciesNames = extractNames('data/DataCarteTryptique/zTryp-Espece.txt');
$backgroundNames = extractNames('data/DataCarteTryptique/zTryp-Historique.txt');

echo "Classes trouvées: " . count($classNames) . PHP_EOL;
echo "Espèces trouvées: " . count($speciesNames) . PHP_EOL;
echo "Historiques trouvés: " . count($backgroundNames) . PHP_EOL . PHP_EOL;

// Nouveau produits à ajouter
$newProducts = [
    [
        'id' => 'triptych-species-collection',
        'name_fr' => 'Triptyques Especes',
        'name_en' => 'Species Triptychs',
        'price' => 45,
        'description_fr' => '### Collection complète des triptyques d\'espèces Découvrez toutes les espèces jouables de D&D 5e avec des triptyques détaillés et illustrés. Chaque triptyque présente les caractéristiques, capacités spéciales et traits culturels de l\'espèce. **Contenu :** Parfait pour créer des personnages variés ou enrichir vos campagnes !',
        'description_en' => '### Complete collection of species triptychs Discover all playable D&D 5e species with detailed and illustrated triptychs. Each triptych presents the characteristics, special abilities, and cultural traits of the species. **Contents:** Perfect for creating varied characters or enriching your campaigns!',
        'summary_fr' => 'Collection de triptyques présentant toutes les espèces jouables avec leurs caractéristiques et capacités.',
        'summary_en' => 'Collection of triptychs featuring all playable species with their characteristics and abilities.',
        'images' => '/media/game/triptychs/examples/race-aasimar-recto.webp|/media/game/triptychs/examples/race-aasimar-verso.webp',
        'multipliers' => '',
        'metals_fr' => '',
        'metals_en' => '',
        'coin_lots' => '',
        'languages' => 'FR|EN',
        'customizable' => 'VRAI',
        'triptych_options' => implode('|', $speciesNames),
        'triptych_type' => 'species',
        'category' => 'triptychs'
    ],
    [
        'id' => 'triptych-class-collection',
        'name_fr' => 'Triptyques Classes',
        'name_en' => 'Class Triptychs',
        'price' => 55,
        'description_fr' => '### Collection complète des triptyques de classes Explorez toutes les classes et sous-classes de D&D 5e avec des triptyques complets. Chaque triptyque détaille les capacités, sorts, et progressions de classe avec des exemples visuels. **Contenu :** Idéal pour comprendre les mécaniques de classe ou préparer des PNJ !',
        'description_en' => '### Complete collection of class triptychs Explore all D&D 5e classes and subclasses with complete triptychs. Each triptych details class abilities, spells, and progressions with visual examples. **Contents:** Ideal for understanding class mechanics or preparing NPCs!',
        'summary_fr' => 'Collection de triptyques couvrant toutes les classes et sous-classes avec leurs capacités et progressions.',
        'summary_en' => 'Collection of triptychs covering all classes and subclasses with their abilities and progressions.',
        'images' => '/media/game/triptychs/examples/classe-barbare-recto.webp|/media/game/triptychs/examples/classe-barbare-verso.webp',
        'multipliers' => '',
        'metals_fr' => '',
        'metals_en' => '',
        'coin_lots' => '',
        'languages' => 'FR|EN',
        'customizable' => 'VRAI',
        'triptych_options' => implode('|', $classNames),
        'triptych_type' => 'class',
        'category' => 'triptychs'
    ],
    [
        'id' => 'triptych-background-collection',
        'name_fr' => 'Triptyques Historiques',
        'name_en' => 'Background Triptychs', 
        'price' => 35,
        'description_fr' => '### Collection complète des triptyques d\'historiques Enrichissez vos personnages avec tous les historiques disponibles en D&D 5e. Chaque triptyque présente l\'origine, les compétences, équipements et contacts de l\'historique. **Contenu :** Parfait pour donner de la profondeur à vos personnages !',
        'description_en' => '### Complete collection of background triptychs Enrich your characters with all available D&D 5e backgrounds. Each triptych presents the origin, skills, equipment, and contacts of the background. **Contents:** Perfect for adding depth to your characters!',
        'summary_fr' => 'Collection de triptyques présentant tous les historiques avec leurs compétences et équipements.',
        'summary_en' => 'Collection of triptychs featuring all backgrounds with their skills and equipment.',
        'images' => '/media/game/triptychs/examples/historique-acolyte-recto.webp|/media/game/triptychs/examples/historique-acolyte-verso.webp',
        'multipliers' => '',
        'metals_fr' => '',
        'metals_en' => '',
        'coin_lots' => '',
        'languages' => 'FR|EN',
        'customizable' => 'VRAI',
        'triptych_options' => implode('|', $backgroundNames),
        'triptych_type' => 'background',
        'category' => 'triptychs'
    ]
];

// Lecture du CSV actuel
$csvFile = fopen('data/products.csv', 'r');
$headers = fgetcsv($csvFile, 0, ';');
$existingRows = [];

while (($row = fgetcsv($csvFile, 0, ';')) !== false) {
    if (!empty($row[0])) {
        $existingRows[] = $row;
    }
}
fclose($csvFile);

// Sauvegarde du CSV
copy('data/products.csv', 'data/products.csv.backup.' . date('Y-m-d_H-i-s'));

// Ajout des nouveaux produits
$newCsvFile = fopen('data/products.csv', 'w');

// Header
fputcsv($newCsvFile, $headers, ';');

// Lignes existantes
foreach ($existingRows as $row) {
    fputcsv($newCsvFile, $row, ';');
}

// Nouveaux produits
foreach ($newProducts as $product) {
    $row = [
        $product['id'],
        $product['name_fr'],
        $product['name_en'],
        $product['price'],
        $product['description_fr'],
        $product['description_en'],
        $product['summary_fr'],
        $product['summary_en'],
        $product['images'],
        $product['multipliers'],
        $product['metals_fr'],
        $product['metals_en'],
        $product['coin_lots'],
        $product['languages'],
        $product['customizable'],
        $product['triptych_options'],
        $product['triptych_type'],
        $product['category']
    ];
    
    fputcsv($newCsvFile, $row, ';');
    echo "✓ Ajouté: {$product['id']} - {$product['name_fr']}" . PHP_EOL;
    echo "  Options: " . count(explode('|', $product['triptych_options'])) . " " . $product['triptych_type'] . "s" . PHP_EOL . PHP_EOL;
}

fclose($newCsvFile);

echo "=== RÉSUMÉ ===" . PHP_EOL;
echo "Nouveaux produits ajoutés: " . count($newProducts) . PHP_EOL;
echo "CSV mis à jour avec succès !" . PHP_EOL;
echo "Prochaine étape: Lancez 'php convert-products.php' pour convertir en JSON" . PHP_EOL;
?>