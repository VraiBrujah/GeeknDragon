<?php
// FICHIER OBSOLÈTE - Les IDs ont été refactorisés
// Ce script utilisait les anciens IDs hardcodés
die('ERREUR: Ce script est obsolète suite au refactoring des IDs. Utilisez les nouveaux IDs.');
?>

<?php
echo "=== MISE À JOUR CSV AVEC VRAIES DONNÉES ===" . PHP_EOL;

// Lit le CSV actuel
$csvContent = file_get_contents('data/products.csv');
$csvContent = ltrim($csvContent, "\xEF\xBB\xBF");
$lines = explode("\n", $csvContent);

// Supprime la ligne parasite Excel si présente
if (isset($lines[0]) && strpos($lines[0], 'Column1') !== false) {
    array_shift($lines);
    echo "✓ Ligne parasite supprimée" . PHP_EOL;
}

$newLines = [];
$foundInsertPoint = false;

foreach ($lines as $index => $line) {
    // Correction du titre Arsenal (enlever apostrophe) et ajouter 198 cartes
    if (strpos($line, 'pack-182-arsenal-aventurier') !== false) {
        $line = str_replace('pack-182-arsenal-aventurier', 'pack-198-arsenal-aventurier', $line);
        $line = str_replace('Arsenal de l\'Aventurier', 'Arsenal de l Aventurier', $line);
        $line = str_replace('Arsenal de l Aventurier', 'Arsenal de l Aventurier', $line);
        $line = str_replace('"### Armes • Armures • Équipement - 182 cartes', '"### Armes • Armures • Équipement - 198 cartes', $line);
        $line = str_replace('"### Armes • Armures • Équipement', '"### Armes • Armures • Équipement - 198 cartes', $line);
        echo "✓ Arsenal mis à jour (198 cartes)" . PHP_EOL;
    }
    
    // Correction Butins & Ingénieries : 288 cartes
    if (strpos($line, 'pack-182-butins-ingenieries') !== false) {
        $line = str_replace('pack-182-butins-ingenieries', 'pack-288-butins-ingenieries', $line);
        $line = str_replace('"### Butin • Explosifs & armes modernes/futuristes • Marchandises • Outils - 182 cartes', '"### Butin • Explosifs & armes modernes/futuristes • Marchandises • Outils - 288 cartes', $line);
        $line = str_replace('"### Butin • Explosifs & armes modernes/futuristes • Marchandises • Outils', '"### Butin • Explosifs & armes modernes/futuristes • Marchandises • Outils - 288 cartes', $line);
        echo "✓ Butins & Ingénieries mis à jour (288 cartes)" . PHP_EOL;
    }
    
    // Correction Routes & Services : 195 cartes
    if (strpos($line, 'pack-182-routes-services') !== false) {
        $line = str_replace('pack-182-routes-services', 'pack-195-routes-services', $line);
        $line = str_replace('"### Paquetages • Services • Véhicules • Poisons - 182 cartes', '"### Paquetages • Services • Véhicules • Poisons - 195 cartes', $line);
        $line = str_replace('"### Paquetages • Services • Véhicules • Poisons', '"### Paquetages • Services • Véhicules • Poisons - 195 cartes', $line);
        echo "✓ Routes & Services mis à jour (195 cartes)" . PHP_EOL;
    }
    
    $newLines[] = $line;
    
    // Trouve le point d'insertion après pack-10-cartes-aleatoires
    if (strpos($line, 'pack-10-cartes-aleatoires') !== false && !$foundInsertPoint) {
        $foundInsertPoint = true;
        
        // Insère les 4 nouveaux produits avec les vraies données
        $newProducts = [
            'pack-44-armes;Sélection d\'Armes;Weapon Selection;15.40;"### Armes essentielles - 44 cartes
Collection complète des **44 armes** disponibles : épées, arcs, dagues, masses et armes exotiques pour équiper efficacement votre groupe.

**Contenu :**
- **Armes de mêlée** : épées, haches, masses, fléaux
- **Armes à distance** : arcs, arbalètes, frondes  
- **Armes exotiques** : katana, chakram, nunchaku
- **Toutes les armes** du jeu de base

*Collection complète pour tous les styles de combat !*";"### Essential weapons - 44 cards
Complete collection of all **44 available weapons**: swords, bows, daggers, maces, and exotic weapons to efficiently equip your party.

**Contents:**
- **Melee weapons**: swords, axes, maces, flails
- **Ranged weapons**: bows, crossbows, slings
- **Exotic weapons**: katana, chakram, nunchaku  
- **All weapons** from the core game

*Complete collection for every fighting style!*";Collection complète de 44 cartes d\'armes pour tous les styles de combat.;Complete collection of 44 weapon cards for every fighting style.;/media/products/cards/arme-recto.webp|/media/products/cards/arme-verso.webp|/media/products/cards/greatclub-recto.webp;;;;;FR|EN;FAUX;;',

            'pack-65-paquetages;Paquetages d\'Aventure;Adventure Packs;22.75;"### Paquetages d\'aventuriers - 65 cartes
Collection complète des **65 paquetages** spécialisés : artiste, cambrioleur, diplomate, ecclésiastique, érudit, explorateur et exploration souterraine.

**Contenu :**
- **Paquetage d\'artiste** : instruments, costumes
- **Paquetage de cambrioleur** : outils de crochetage, cordes
- **Paquetage de diplomate** : vêtements fins, sceaux
- **Paquetages d\'érudit** : livres, matériel d\'écriture
- **Paquetages d\'exploration** : matériel de survie spécialisé
- **7 paquetages complets** pour tous les profils

*Équipez votre personnage selon son background !*";"### Adventurer packs - 65 cards
Complete collection of **65 specialized packs**: artist, burglar, diplomat, acolyte, scholar, explorer, and underdark exploration.

**Contents:**
- **Artist pack**: instruments, costumes
- **Burglar pack**: lockpicks, ropes
- **Diplomat pack**: fine clothes, seals
- **Scholar packs**: books, writing materials
- **Exploration packs**: specialized survival gear
- **7 complete packs** for every profile

*Equip your character according to their background!*";Collection de 65 cartes de paquetages spécialisés pour équiper selon le background.;Collection of 65 specialized pack cards to equip according to background.;/media/products/cards/sac-aa-dos-recto.webp;;;;;FR|EN;FAUX;;',

            'pack-154-armures-equipement;Armures & Équipement;Armor & Equipment;53.90;"### Protection et équipement - 154 cartes
Collection massive de **154 cartes** couvrant toutes les armures et l\'équipement d\'aventure pour une survie optimale.

**Contenu :**
- **13 armures complètes** : légères, intermédiaires, lourdes
- **141 équipements d\'aventure** : cordes, torches, rations, outils
- **Matériel de survie** : tentes, sacs de couchage, provisions
- **Outils spécialisés** : matériel d\'escalade, de navigation

*Tout l\'équipement nécessaire pour survivre en territoire hostile !*";"### Protection and equipment - 154 cards
Massive collection of **154 cards** covering all armor and adventure equipment for optimal survival.

**Contents:**
- **13 complete armors**: light, medium, heavy
- **141 adventure equipment**: ropes, torches, rations, tools
- **Survival gear**: tents, sleeping bags, provisions
- **Specialized tools**: climbing gear, navigation equipment

*All the equipment needed to survive in hostile territory!*";Collection massive de 154 cartes d\'armures et équipement pour la survie.;Massive collection of 154 armor and equipment cards for survival.;/media/products/cards/armure-recto.webp|/media/products/cards/sac-aa-dos-recto.webp;;;;;FR|EN;FAUX;;',

            'pack-231-butins-marchandises;Trésors & Marchandises;Treasures & Goods;80.85;"### Butins et richesses - 231 cartes
Collection énorme de **231 cartes** de trésors, gemmes, artefacts et marchandises pour enrichir considérablement vos aventures.

**Contenu :**
- **204 butins variés** : gemmes, bijoux, objets précieux, artefacts
- **27 marchandises** : soies, épices, minerais rares, denrées
- **Objets mystérieux** : reliques, curiosités, antiquités
- **Richesses du monde** : de la pièce de cuivre au trésor royal

*Pour des aventures riches en découvertes et récompenses !*";"### Loot and riches - 231 cards
Enormous collection of **231 cards** of treasures, gems, artifacts, and trade goods to considerably enrich your adventures.

**Contents:**
- **204 varied loot**: gems, jewelry, precious objects, artifacts
- **27 trade goods**: silks, spices, rare ores, foodstuffs
- **Mysterious objects**: relics, curiosities, antiquities
- **Riches of the world**: from copper coins to royal treasures

*For adventures rich in discoveries and rewards!*";Collection énorme de 231 cartes de trésors et marchandises pour enrichir les aventures.;Enormous collection of 231 treasure and trade good cards to enrich adventures.;/media/products/cards/alexandrite-recto.webp|/media/products/cards/chaevre-recto.webp;;;;;FR|EN;FAUX;;'
        ];
        
        foreach ($newProducts as $product) {
            $newLines[] = $product;
        }
        
        echo "✓ 4 nouveaux produits ajoutés avec les vraies quantités" . PHP_EOL;
    }
}

// Nettoie les lignes orphelines restantes (issues de la conversion précédente)
$cleanedLines = [];
foreach ($newLines as $line) {
    // Skip les lignes qui commencent par du texte orphelin
    if (strpos($line, '**10 cartes tirées au sort**') !== false ||
        strpos($line, '**Catégories disponibles') !== false ||
        strpos($line, '- **Totalement aléatoire**') !== false ||
        (strpos($line, '- **') !== false && !preg_match('/^[a-z0-9-]+;/', $line))) {
        continue;
    }
    $cleanedLines[] = $line;
}

// Sauvegarde
$finalContent = implode("\n", $cleanedLines);
if (file_put_contents('data/products.csv', $finalContent)) {
    echo "✓ CSV mis à jour avec les vraies quantités de cartes !" . PHP_EOL;
} else {
    echo "✗ Erreur lors de la sauvegarde" . PHP_EOL;
}
?>