<?php
// FICHIER OBSOLÈTE - Les IDs ont été refactorisés
// Ce script utilisait les anciens IDs hardcodés
die('ERREUR: Ce script est obsolète suite au refactoring des IDs. Utilisez les nouveaux IDs.');
?>

<?php
echo "=== ANALYSE DES CARTES RÉELLES ===" . PHP_EOL;

$dataPath = 'data/DataCarteTryptique/';
$categories = [
    // Arsenal de l'Aventurier
    'arsenal' => [
        'Armes.txt' => 0,
        'Armure.txt' => 0, 
        'Equipement.txt' => 0
    ],
    
    // Butins & Ingénieries  
    'butins' => [
        'Butin.txt' => 0,
        'Explo-Fire.txt' => 0,
        'Marchandise.txt' => 0,
        'Outils.txt' => 0
    ],
    
    // Routes & Services
    'routes' => [
        'Paquetage d\'artiste.txt' => 0,
        'Paquetage de cambrioleur.txt' => 0,
        'Paquetage de diplomate.txt' => 0,
        'Paquetage d\'ecclésiastique.txt' => 0,
        'Paquetage d\'érudit.txt' => 0,
        'Paquetage d\'explorateur.txt' => 0,
        'Paquetage d\'exploration souterraine.txt' => 0,
        'Services.txt' => 0,
        'Véhicules.txt' => 0,
        'Poison.txt' => 0
    ]
];

// Fonction pour compter les cartes dans un fichier
function countCards($filepath) {
    if (!file_exists($filepath)) return 0;
    
    $content = file_get_contents($filepath);
    $lines = explode("\n", $content);
    $cardCount = 0;
    
    foreach ($lines as $line) {
        $line = trim($line);
        // Compte les lignes non vides qui ne sont pas des commentaires
        if (!empty($line) && !str_starts_with($line, '#') && !str_starts_with($line, '//')) {
            // Vérifie si c'est une ligne de carte (contient généralement des données séparées)
            if (str_contains($line, '|') || str_contains($line, ';') || str_contains($line, ',')) {
                $cardCount++;
            }
        }
    }
    
    return $cardCount;
}

$totals = [];

foreach ($categories as $categoryName => $files) {
    echo PHP_EOL . "=== " . strtoupper($categoryName) . " ===" . PHP_EOL;
    $categoryTotal = 0;
    
    foreach ($files as $filename => $count) {
        $filepath = $dataPath . $filename;
        $cardCount = countCards($filepath);
        $categories[$categoryName][$filename] = $cardCount;
        $categoryTotal += $cardCount;
        
        echo sprintf("%-40s : %4d cartes", $filename, $cardCount) . PHP_EOL;
    }
    
    $totals[$categoryName] = $categoryTotal;
    echo sprintf("TOTAL %-32s : %4d cartes", strtoupper($categoryName), $categoryTotal) . PHP_EOL;
}

echo PHP_EOL . "=== RÉCAPITULATIF POUR NOUVEAUX PRODUITS ===" . PHP_EOL;

// Calcul pour les nouveaux produits à 0.35€/carte
$pricePerCard = 0.35;

echo "Prix par carte : " . $pricePerCard . "€" . PHP_EOL . PHP_EOL;

// Suggestions de divisions logiques
$suggestions = [
    'Armes seules' => $categories['arsenal']['Armes.txt'],
    'Armures + Équipement' => $categories['arsenal']['Armure.txt'] + $categories['arsenal']['Equipement.txt'],
    'Butins + Marchandises' => $categories['butins']['Butin.txt'] + $categories['butins']['Marchandise.txt'],
    'Explosifs + Outils' => $categories['butins']['Explo-Fire.txt'] + $categories['butins']['Outils.txt'],
    'Services complets' => $totals['routes'],
    'Paquetages seulement' => 
        $categories['routes']['Paquetage d\'artiste.txt'] +
        $categories['routes']['Paquetage de cambrioleur.txt'] +
        $categories['routes']['Paquetage de diplomate.txt'] +
        $categories['routes']['Paquetage d\'ecclésiastique.txt'] +
        $categories['routes']['Paquetage d\'érudit.txt'] +
        $categories['routes']['Paquetage d\'explorateur.txt'] +
        $categories['routes']['Paquetage d\'exploration souterraine.txt']
];

foreach ($suggestions as $name => $count) {
    $price = round($count * $pricePerCard, 2);
    echo sprintf("%-25s : %3d cartes = %6.2f€", $name, $count, $price) . PHP_EOL;
}

echo PHP_EOL . "=== VÉRIFICATION TOTAUX ACTUELS ===" . PHP_EOL;
echo "Arsenal total    : " . $totals['arsenal'] . " cartes" . PHP_EOL;
echo "Butins total     : " . $totals['butins'] . " cartes" . PHP_EOL;  
echo "Routes total     : " . $totals['routes'] . " cartes" . PHP_EOL;
echo "GRAND TOTAL      : " . array_sum($totals) . " cartes" . PHP_EOL;
?>