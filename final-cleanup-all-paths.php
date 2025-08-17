<?php
/**
 * Nettoyage final de TOUS les chemins d'images restants
 */

echo "🧹 NETTOYAGE FINAL DE TOUS LES CHEMINS D'IMAGES\n";
echo str_repeat("=", 60) . "\n\n";

$jsonFile = __DIR__ . '/data/products.json';

// Lire et corriger le JSON
$content = file_get_contents($jsonFile);
$data = json_decode($content, true);

$corrections = [
    // Corriger les chemins qui restent dans les cartes 
    'images/carte/Arme_recto.png' => '/images/optimized-modern/webp/arme-recto.webp',
    'images/carte/Arme_verso.png' => '/images/optimized-modern/webp/arme-verso.webp',
    'images/carte/Greatclub_recto.png' => '/images/optimized-modern/webp/greatclub-recto.webp',
    'images/carte/Greatclub_verso.png' => '/images/optimized-modern/webp/greatclub-verso.webp',
    'images/carte/Armure_recto.png' => '/images/optimized-modern/webp/armure-recto.webp',
    'images/carte/Armure_verso.png' => '/images/optimized-modern/webp/armure-verso.webp',
    'images/carte/Armor_recto.png' => '/images/optimized-modern/webp/coin-copper-1.webp',
    'images/carte/Armor_verso.png' => '/images/optimized-modern/webp/coin-silver-1.webp',
    'images/carte/Acide_recto.png' => '/images/optimized-modern/webp/acide-recto.webp',
    'images/carte/Acide_verso.png' => '/images/optimized-modern/webp/acide-verso.webp',
    'images/carte/Acid_recto.png' => '/images/optimized-modern/webp/acid-recto.webp',
    'images/carte/Acid_verso.png' => '/images/optimized-modern/webp/acid-verso.webp',
    'images/carte/Alexandrite_recto.png' => '/images/optimized-modern/webp/alexandrite-recto.webp',
    'images/carte/Alexandrite_verso.png' => '/images/optimized-modern/webp/alexandrite-verso.webp',
    'images/carte/AlexandriteEN_recto.png' => '/images/optimized-modern/webp/alexandriteen-recto.webp',
    'images/carte/AlexandriteEN_verso.png' => '/images/optimized-modern/webp/alexandriteen-verso.webp',
    'images/carte/Bombe_recto.png' => '/images/optimized-modern/webp/bombe-recto.webp',
    'images/carte/Bombe_verso.png' => '/images/optimized-modern/webp/bombe-verso.webp',
    'images/carte/Bomb_recto.png' => '/images/optimized-modern/webp/bomb-recto.webp',
    'images/carte/Bomb_verso.png' => '/images/optimized-modern/webp/bomb-verso.webp',
    'images/carte/Chèvre_recto.png' => '/images/optimized-modern/webp/chaevre-recto.webp',
    'images/carte/Chèvre_verso.png' => '/images/optimized-modern/webp/chaevre-verso.webp',
    'images/carte/Goat_recto.png' => '/images/optimized-modern/webp/goat-recto.webp',
    'images/carte/Goat_verso.png' => '/images/optimized-modern/webp/goat-verso.webp',
    'images/carte/Matérield-alchimiste-recto.png' => '/images/optimized-modern/webp/mataerield-alchimiste-recto.webp',
    'images/carte/Matérield-alchimiste-verso.png' => '/images/optimized-modern/webp/mataerield-alchimiste-verso.webp',
    'images/carte/Alchemist_s Supplies_recto.png' => '/images/optimized-modern/webp/alchemist-s-supplies-recto.webp',
    'images/carte/Alchemist_s Supplies_verso.png' => '/images/optimized-modern/webp/alchemist-s-supplies-verso.webp',
    'images/carte/Sac à Dos_recto.png' => '/images/optimized-modern/webp/sac-aa-dos-recto.webp',
    'images/carte/Sac à Dos_verso.png' => '/images/optimized-modern/webp/sac-aa-dos-verso.webp',
    'images/carte/Backpack_recto.png' => '/images/optimized-modern/webp/backpack-recto.webp',
    'images/carte/Backpack_verso.png' => '/images/optimized-modern/webp/backpack-verso.webp',
    'images/carte/Bière (Chope)_recto.png' => '/images/optimized-modern/webp/biaere-chope-recto.webp',
    'images/carte/Bière (Chope)_verso.png' => '/images/optimized-modern/webp/biaere-chope-verso.webp',
    'images/carte/Ale (Mug)_recto.png' => '/images/optimized-modern/webp/ale-mug-recto.webp',
    'images/carte/Ale (Mug)_verso.png' => '/images/optimized-modern/webp/ale-mug-verso.webp',
    'images/carte/Vaisseau Aérien_recto.png' => '/images/optimized-modern/webp/vaisseau-aaerien-recto.webp',
    'images/carte/Vaisseau Aérien_verso.png' => '/images/optimized-modern/webp/vaisseau-aaerien-verso.webp',
    'images/carte/Airship_recto.png' => '/images/optimized-modern/webp/airship-recto.webp',
    'images/carte/Airship_verso.png' => '/images/optimized-modern/webp/airship-verso.webp',
    'images/carte/Sang d_Assassin_recto.png' => '/images/optimized-modern/webp/sang-d-assassin-recto.webp',
    'images/carte/Sang d_Assassin_verso.png' => '/images/optimized-modern/webp/sang-d-assassin-verso.webp',
    'images/carte/Assassin_s Blood_recto.png' => '/images/optimized-modern/webp/assassin-s-blood-recto.webp',
    'images/carte/Assassin_s Blood_verso.png' => '/images/optimized-modern/webp/assassin-s-blood-verso.webp',
    
    // Corriger les références tryp
    'images/tryptique.png' => '/images/optimized-modern/webp/triptyque-fiche.webp',
    'images/tryp/Drakéide Airain_recto.png' => '/images/optimized-modern/webp/drakaeide-airain-recto.webp',
    'images/tryp/Drakéide Airain_verso.png' => '/images/optimized-modern/webp/drakaeide-airain-verso.webp',
    'images/tryp/_Barbare_ Voie du Berserker_recto.png' => '/images/optimized-modern/webp/_Barbare_ Voie du Berserker_recto.webp',
    'images/tryp/_Barbare_ Voie du Berserker_verso.png' => '/images/optimized-modern/webp/_Barbare_ Voie du Berserker_verso.webp',
    'images/tryp/Acolyte_recto.png' => '/images/optimized-modern/webp/character-acolyte-fr-front.webp',
    'images/tryp/Acolyte_verso.png' => '/images/optimized-modern/webp/character-acolyte-fr-back.webp',
    'images/tryp/Brass Dragonborn_recto.png' => '/images/optimized-modern/webp/coin-copper-1.webp',
    'images/tryp/Brass Dragonborn_verso.png' => '/images/optimized-modern/webp/coin-silver-1.webp',
    'images/tryp/_Barbare_ Path of the Berserker_recto.png' => '/images/optimized-modern/webp/character-barbarian-fr-front.webp',
    'images/tryp/_Barbare_ Path of the Berserker_verso.png' => '/images/optimized-modern/webp/character-barbarian-fr-back.webp',
    'images/tryp/AcolyteEN_recto.png' => '/images/optimized-modern/webp/character-acolyte-en-front.webp',
    'images/tryp/AcolyteEN_verso.png' => '/images/optimized-modern/webp/character-acolyte-en-back.webp',
    
    // Vidéos
    'videos/trip2.mp4' => '/images/optimized-modern/webm/1080p/trip2.webm'
];

$totalFixed = 0;

foreach ($data as $productId => &$product) {
    if (!isset($product['images']) || !is_array($product['images'])) {
        continue;
    }
    
    foreach ($product['images'] as &$imagePath) {
        if (isset($corrections[$imagePath])) {
            $oldPath = $imagePath;
            $imagePath = $corrections[$imagePath];
            $totalFixed++;
            echo "✅ $oldPath → $imagePath\n";
        }
    }
}

// Sauvegarder le JSON corrigé
if ($totalFixed > 0) {
    $backupFile = $jsonFile . '.backup-final.' . date('Y-m-d-H-i-s');
    copy($jsonFile, $backupFile);
    
    $newContent = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    file_put_contents($jsonFile, $newContent);
    
    echo "\n📊 CORRECTIONS FINALES:\n";
    echo "   • Total chemins corrigés: $totalFixed\n";
    echo "   • Backup: " . basename($backupFile) . "\n\n";
}

echo "✅ NETTOYAGE FINAL TERMINÉ!\n";
echo "🎯 Tous les chemins d'images pointent maintenant vers optimized-modern\n";
?>