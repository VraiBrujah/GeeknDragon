<?php
// FICHIER OBSOLÈTE - Les IDs ont été refactorisés
// Ce script utilisait les anciens IDs hardcodés
die('ERREUR: Ce script est obsolète suite au refactoring des IDs. Utilisez les nouveaux IDs.');
?>

<?php
echo "=== MISE À JOUR CSV AVEC PAQUETS PLUS PETITS ===" . PHP_EOL;

// Lit le CSV et nettoie
$csvContent = file_get_contents('data/products.csv');
$csvContent = ltrim($csvContent, "\xEF\xBB\xBF");
$lines = explode("\n", $csvContent);

// Supprime ligne parasite si présente
if (isset($lines[0]) && strpos($lines[0], 'Column1') !== false) {
    array_shift($lines);
}

$newLines = [];
$foundInsertPoint = false;

foreach ($lines as $line) {
    if (empty(trim($line))) continue;
    
    // Supprime tous les anciens nouveaux produits incorrects
    if (strpos($line, 'pack-44-armes') !== false ||
        strpos($line, 'pack-65-paquetages') !== false ||
        strpos($line, 'pack-154-armures') !== false ||
        strpos($line, 'pack-231-butins') !== false ||
        strpos($line, 'pack-35-armes') !== false ||
        strpos($line, 'pack-40-armures') !== false ||
        strpos($line, 'pack-50-butins') !== false ||
        strpos($line, 'pack-57-services') !== false) {
        continue;
    }
    
    // Supprime les lignes orphelines
    if (strpos($line, '**10 cartes tirées au sort**') !== false ||
        strpos($line, '**Catégories disponibles') !== false ||
        strpos($line, '*Parfait pour découvrir') !== false ||
        (strpos($line, '- **') !== false && !preg_match('/^[a-z0-9-]+;/', $line))) {
        continue;
    }
    
    // Corrige les doublons dans les descriptions
    $line = str_replace(' - 198 cartes - 198 cartes', ' - 198 cartes', $line);
    $line = str_replace(' - 288 cartes - 288 cartes', ' - 288 cartes', $line);
    $line = str_replace(' - 195 cartes - 195 cartes', ' - 195 cartes', $line);
    
    // Répare pack-10-cartes-aleatoires si cassé
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
    
    $newLines[] = $line;
    
    // Point d'insertion après pack-10-cartes-aleatoires
    if (strpos($line, 'pack-10-cartes-aleatoires') !== false && !$foundInsertPoint) {
        $foundInsertPoint = true;
        
        // 4 nouveaux paquets PLUS PETITS que 182 cartes
        $smallerPacks = [
            'pack-57-armes-armures;Armes & Armures;Weapons & Armor;19.95;"### Combat complet - 57 cartes
Collection parfaite des **44 armes** et **13 armures** : tout l\'équipement nécessaire pour équiper et protéger votre groupe au combat.

**Contenu :**
- **44 armes complètes** : mêlée, distance, exotiques
- **13 armures** : légères, intermédiaires, lourdes
- **Protection totale** pour tous les styles de combat
- **Arsenal complet** sans superflu

*L\'essentiel du combat en un seul paquet !*";"### Complete combat - 57 cards
Perfect collection of **44 weapons** and **13 armors**: all the equipment needed to arm and protect your party in combat.

**Contents:**
- **44 complete weapons**: melee, ranged, exotic
- **13 armors**: light, medium, heavy
- **Total protection** for every fighting style
- **Complete arsenal** without excess

*Combat essentials in one package!*";Collection de 57 cartes d\'armes et armures pour équiper complètement un groupe.;Collection of 57 weapon and armor cards to fully equip a party.;/media/products/cards/arme-recto.webp|/media/products/cards/armure-recto.webp;;;;;FR|EN;FAUX;;',

            'pack-65-paquetages;Paquetages d\'Aventure;Adventure Packs;22.75;"### Équipement par background - 65 cartes
Collection complète des **65 paquetages** spécialisés selon les backgrounds : artiste, cambrioleur, diplomate, érudit, explorateur et plus.

**Contenu :**
- **7 paquetages complets** pour tous les backgrounds
- **Équipement spécialisé** selon le profil du personnage
- **Matériel de survie** adapté aux missions spécifiques
- **Immersion totale** dans le rôle choisi

*Équipez votre personnage selon son histoire !*";"### Equipment by background - 65 cards
Complete collection of **65 specialized packs** according to backgrounds: artist, burglar, diplomat, scholar, explorer, and more.

**Contents:**
- **7 complete packs** for every background
- **Specialized equipment** according to character profile
- **Survival gear** adapted to specific missions
- **Total immersion** in the chosen role

*Equip your character according to their story!*";Collection de 65 cartes de paquetages spécialisés pour équiper selon le background.;Collection of 65 specialized pack cards to equip according to background.;/media/products/cards/sac-aa-dos-recto.webp;;;;;FR|EN;FAUX;;',

            'pack-70-explosifs-outils;Explosifs & Outils;Explosives & Tools;24.50;"### Arsenal spécialisé - 70 cartes
Collection tactique de **70 cartes** : explosifs modernes, outils d\'artisan et poisons pour campagnes qui sortent de l\'ordinaire.

**Contenu :**
- **20 explosifs** : grenades, bombes, charges explosives
- **37 outils spécialisés** : artisanat, crochetage, alchimie
- **13 poisons** : effets variés et substances dangereuses
- **Matériel moderne** pour campagnes avancées

*Pour des aventures qui repoussent les limites !*";"### Specialized arsenal - 70 cards
Tactical collection of **70 cards**: modern explosives, craftsman tools, and poisons for campaigns that break the mold.

**Contents:**
- **20 explosives**: grenades, bombs, explosive charges
- **37 specialized tools**: crafting, lockpicking, alchemy
- **13 poisons**: varied effects and dangerous substances
- **Modern equipment** for advanced campaigns

*For adventures that push the boundaries!*";Collection de 70 cartes d\'explosifs, outils et poisons pour campagnes avancées.;Collection of 70 explosive, tool, and poison cards for advanced campaigns.;/media/products/cards/bombe-recto.webp|/media/products/cards/mataerield-alchimiste-recto.webp|/media/products/cards/sang-d-assassin-recto.webp;;;;;FR|EN;FAUX;;',

            'pack-117-services-vehicules;Services & Véhicules;Services & Vehicles;40.95;"### Voyage et logistique - 117 cartes
Collection étendue de **117 cartes** pour organiser voyages et missions : services d\'auberge, transport et tous types de véhicules.

**Contenu :**
- **63 services** : auberges, soins, mercenaires, passeurs
- **54 véhicules** : terrestres, marins, aériens
- **Logistique complète** pour tous vos déplacements
- **Support d\'aventure** : hébergement, transport, aide

*Tout pour voyager et s\'organiser en campagne !*";"### Travel and logistics - 117 cards
Extended collection of **117 cards** to organize travels and missions: inn services, transport, and all types of vehicles.

**Contents:**
- **63 services**: inns, healing, mercenaries, smugglers
- **54 vehicles**: land, sea, air
- **Complete logistics** for all your travels
- **Adventure support**: lodging, transport, assistance

*Everything to travel and organize in campaigns!*";Collection de 117 cartes de services et véhicules pour organiser voyages et missions.;Collection of 117 service and vehicle cards to organize travels and missions.;/media/products/cards/biaere-chope-recto.webp|/media/products/cards/vaisseau-aaerien-recto.webp;;;;;FR|EN;FAUX;;'
        ];
        
        foreach ($smallerPacks as $pack) {
            $newLines[] = $pack;
        }
        
        echo "✓ 4 nouveaux paquets plus petits ajoutés" . PHP_EOL;
    }
}

// Sauvegarde
$finalContent = implode("\n", $newLines);
if (file_put_contents('data/products.csv', $finalContent)) {
    echo "✓ CSV mis à jour avec paquets plus petits que 182 cartes !" . PHP_EOL;
} else {
    echo "✗ Erreur de sauvegarde" . PHP_EOL;
}
?>