<?php
// FICHIER OBSOLÈTE - Les IDs ont été refactorisés
// Ce script utilisait les anciens IDs hardcodés
die('ERREUR: Ce script est obsolète suite au refactoring des IDs. Utilisez les nouveaux IDs.');
?>

<?php
echo "=== CRÉATION DE PAQUETS PLUS PETITS QUE 182 CARTES ===" . PHP_EOL;

// Données réelles des fichiers analysés
$realData = [
    'Armes' => 44,
    'Armures' => 13, 
    'Équipement' => 141,
    'Butins' => 204,
    'Marchandises' => 27,
    'Explosifs' => 20,
    'Outils' => 37,
    'Paquetages' => 65,
    'Services' => 63,
    'Véhicules' => 54,
    'Poisons' => 13
];

$pricePerCard = 0.35;

echo "=== COMBINAISONS LOGIQUES PLUS PETITES ===" . PHP_EOL;

$smallerPacks = [
    'Armes + Armures' => $realData['Armes'] + $realData['Armures'],
    'Paquetages d\'Aventure' => $realData['Paquetages'],
    'Services + Véhicules' => $realData['Services'] + $realData['Véhicules'],
    'Explosifs + Outils + Poisons' => $realData['Explosifs'] + $realData['Outils'] + $realData['Poisons'],
    'Marchandises seules' => $realData['Marchandises'],
    'Équipement seul' => $realData['Équipement']
];

foreach ($smallerPacks as $name => $cards) {
    $price = round($cards * $pricePerCard, 2);
    $status = $cards < 182 ? "✓ PLUS PETIT" : "✗ TROP GROS";
    echo sprintf("%-30s : %3d cartes = %6.2f€ %s", $name, $cards, $price, $status) . PHP_EOL;
}

echo PHP_EOL . "=== 4 MEILLEURS PAQUETS PLUS PETITS ===" . PHP_EOL;

$selectedPacks = [
    [
        'id' => 'pack-57-armes-armures',
        'name' => 'Armes & Armures',
        'name_en' => 'Weapons & Armor', 
        'cards' => 57,
        'price' => 19.95,
        'description' => 'Collection complète des **44 armes** et **13 armures** : tout pour équiper et protéger votre groupe au combat.',
        'content' => '- **44 armes complètes** : mêlée, distance, exotiques\n- **13 armures** : légères, intermédiaires, lourdes\n- **Protection totale** pour tous les styles de combat'
    ],
    [
        'id' => 'pack-65-paquetages',
        'name' => 'Paquetages d\'Aventure', 
        'name_en' => 'Adventure Packs',
        'cards' => 65,
        'price' => 22.75,
        'description' => 'Collection des **65 paquetages** spécialisés selon les backgrounds : artiste, cambrioleur, diplomate, érudit, explorateur.',
        'content' => '- **7 paquetages complets** pour tous les backgrounds\n- **Équipement spécialisé** selon le profil\n- **Matériel de survie** adapté aux missions'
    ],
    [
        'id' => 'pack-70-explosifs-outils', 
        'name' => 'Explosifs & Outils',
        'name_en' => 'Explosives & Tools',
        'cards' => 70,
        'price' => 24.50,
        'description' => 'Arsenal spécialisé de **70 cartes** : explosifs modernes, outils d\'artisan et poisons pour campagnes audacieuses.',
        'content' => '- **20 explosifs** : grenades, bombes, charges\n- **37 outils** : artisanat, crochetage, alchimie\n- **13 poisons** : effets variés et dangereux'
    ],
    [
        'id' => 'pack-117-services-vehicules',
        'name' => 'Services & Véhicules', 
        'name_en' => 'Services & Vehicles',
        'cards' => 117,
        'price' => 40.95,
        'description' => 'Collection de **117 cartes** pour voyager : services d\'auberge, transport, mercenaires et tous types de véhicules.',
        'content' => '- **63 services** : auberges, soins, mercenaires\n- **54 véhicules** : terrestres, marins, aériens\n- **Voyage complet** avec logistique'
    ]
];

foreach ($selectedPacks as $pack) {
    echo sprintf("%-25s : %3d cartes = %6.2f€", $pack['name'], $pack['cards'], $pack['price']) . PHP_EOL;
}

echo PHP_EOL . "Tous les paquets sont plus petits que 182 cartes !" . PHP_EOL;
echo "Prix total des 4 paquets : " . array_sum(array_column($selectedPacks, 'price')) . "€" . PHP_EOL;
?>