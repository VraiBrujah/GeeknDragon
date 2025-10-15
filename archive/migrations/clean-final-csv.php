<?php
// FICHIER OBSOLÈTE - Les IDs ont été refactorisés
// Ce script utilisait les anciens IDs hardcodés
die('ERREUR: Ce script est obsolète suite au refactoring des IDs. Utilisez les nouveaux IDs.');
?>

<?php
echo "=== NETTOYAGE FINAL DU CSV ===" . PHP_EOL;

// Supprime d'abord les anciens produits incorrects
$csvContent = file_get_contents('data/products.csv');
$lines = explode("\n", $csvContent);

$cleanedLines = [];
$skipMode = false;

foreach ($lines as $line) {
    $line = trim($line);
    if (empty($line)) continue;
    
    // Skip les anciennes versions des nouveaux produits
    if (strpos($line, 'pack-35-armes') !== false ||
        strpos($line, 'pack-40-armures-equipement') !== false ||
        strpos($line, 'pack-50-butins-marchandises') !== false ||
        strpos($line, 'pack-57-services-explosifs') !== false) {
        continue;
    }
    
    // Skip les lignes orphelines de descriptions
    if (strpos($line, '**10 cartes tirées au sort**') !== false ||
        strpos($line, '**Catégories disponibles') !== false ||
        strpos($line, '*Parfait pour découvrir nos cartes') !== false ||
        strpos($line, '*Perfect for discovering our cards') !== false ||
        (strpos($line, '- **') !== false && !preg_match('/^[a-z0-9-]+;/', $line))) {
        continue;
    }
    
    // Corrige les doublons dans les descriptions
    $line = str_replace(' - 198 cartes - 198 cartes', ' - 198 cartes', $line);
    $line = str_replace(' - 288 cartes - 288 cartes', ' - 288 cartes', $line);
    $line = str_replace(' - 195 cartes - 195 cartes', ' - 195 cartes', $line);
    
    // Répare la ligne pack-10-cartes-aleatoires si elle est cassée
    if (strpos($line, 'pack-10-cartes-aleatoires;10 Cartes Surprise;10 Random Cards;10;"### Découverte aléatoire') !== false) {
        $line = 'pack-10-cartes-aleatoires;10 Cartes Surprise;10 Random Cards;10;"### Découverte aléatoire
**10 cartes tirées au sort** dans nos collections. Choisissez simplement votre catégorie préférée et laissez-vous surprendre !

**Catégories disponibles :**
- **Totalement aléatoire** : mélange de toutes nos cartes
- **Armes** : mêlée & distance
- **Armures** : protection & boucliers
- **Équipement** : outils d\'aventure
- **Butin** : trésors & artefacts
- **Services** : voyages & commerce
- **Explosifs** : matériel moderne
- **Véhicules** : moyens de transport
- **Poisons** : substances dangereuses

*Parfait pour découvrir nos cartes ou compléter une collection !*";"### Random discovery
**10 randomly drawn cards** from our collections. Simply choose your preferred category and let yourself be surprised!

**Available categories:**
- **Totally random**: mix of all our cards
- **Weapons**: melee & ranged
- **Armor**: protection & shields
- **Equipment**: adventure tools
- **Loot**: treasures & artifacts
- **Services**: travel & trade
- **Explosives**: modern gear
- **Vehicles**: means of transport
- **Poisons**: dangerous substances

*Perfect for discovering our cards or completing a collection!*";Paquet de dix cartes surprises selon la catégorie choisie pour découvrir ou compléter la collection.;Pack of ten surprise cards in the chosen category to discover or round out the collection.;/media/products/cards/arme-recto.webp|/media/products/cards/alexandrite-recto.webp|/media/products/cards/sac-aa-dos-recto.webp|/media/products/cards/bombe-recto.webp;;;;;FR|EN;FAUX;;';
        echo "✓ Ligne pack-10-cartes-aleatoires réparée" . PHP_EOL;
    }
    
    $cleanedLines[] = $line;
}

// Sauvegarde le fichier nettoyé
$finalContent = implode("\n", $cleanedLines);
if (file_put_contents('data/products.csv', $finalContent)) {
    echo "✓ CSV final nettoyé et sauvegardé" . PHP_EOL;
} else {
    echo "✗ Erreur de sauvegarde" . PHP_EOL;
}
?>