<?php

// Fonction helper pour traductions
function getTranslation($key, $translations, $fallback = '') {
    if (empty($key) || empty($translations)) return $fallback;
    $keys = explode('.', $key);
    $value = $translations;
    foreach ($keys as $k) {
        if (!is_array($value) || !isset($value[$k])) return $fallback;
        $value = $value[$k];
    }
    return is_string($value) ? $value : $fallback;
}

echo "==========================================\n";
echo "VÉRIFICATION FRANÇAISE\n";
echo "==========================================\n\n";

$translations_fr = json_decode(file_get_contents("./lang/fr.json"), true) ?: [];

echo "=== 1. HEAD SECTION ===\n";
$title = getTranslation('meta.home.title', $translations_fr, 'Geek & Dragon') . ' | Aide de Jeux';
$metaDescription = getTranslation('meta.gameHelp.description', $translations_fr, 'Guide complet...');
echo "Title: $title\n";
echo "Meta Description: " . substr($metaDescription, 0, 80) . "...\n\n";

echo "=== 2. HERO SECTION ===\n";
echo "H1 Title: " . getTranslation('gameHelp.hero.title', $translations_fr, 'Guide des Triptyques') . "\n";
echo "Subtitle: " . getTranslation('gameHelp.hero.subtitle', $translations_fr, 'Maîtrisez vos fiches...') . "\n\n";

echo "Boutons Hero:\n";
echo "- " . getTranslation('gameHelp.buttons.discover', $translations_fr, 'Découvrir les Triptyques') . "\n";
echo "- " . getTranslation('gameHelp.buttons.cardsGuide', $translations_fr, 'Guide des Cartes') . "\n";
echo "- " . getTranslation('gameHelp.buttons.moneyGuide', $translations_fr, 'Guide de la Monnaie') . "\n";
echo "- " . getTranslation('gameHelp.buttons.buyTriptychs', $translations_fr, 'Acheter mes Triptyques') . "\n\n";

echo "=== 3. NAVIGATION RAPIDE ===\n";
echo "Titre: " . getTranslation('gameHelp.navigation.quickNav', $translations_fr, 'Navigation Rapide') . "\n";
echo "Guide Triptyques: " . getTranslation('gameHelp.navigation.triptychsGuide', $translations_fr, 'Guide des Triptyques') . "\n";
echo "Subtitle: " . getTranslation('gameHelp.navigation.triptychsSubtitle', $translations_fr, 'Espèce, Classe, Historique - D&D 2024') . "\n";
echo "Guide Cartes: " . getTranslation('gameHelp.navigation.cardsGuide', $translations_fr, 'Guide des Cartes') . "\n";
echo "Cards Subtitle: " . getTranslation('gameHelp.navigation.cardsSubtitle', $translations_fr, 'Armes, Équipements, Sorts') . "\n";
echo "Guide Monnaie: " . getTranslation('gameHelp.navigation.coinGuide', $translations_fr, 'Guide de la Monnaie') . "\n";
echo "Coin Subtitle: " . getTranslation('gameHelp.navigation.coinSubtitle', $translations_fr, 'Système monétaire + Convertisseur') . "\n\n";

echo "=== 4. TRIPTYQUES ===\n";
echo "Qu'est-ce: " . getTranslation('gameHelp.sections.whatIsTriptyque', $translations_fr, 'Qu\'est-ce qu\'un triptyque...') . "\n";
echo "Description: " . substr(getTranslation('gameHelp.sections.triptychDescription', $translations_fr, 'Un triptyque est...'), 0, 60) . "...\n";
echo "3 Required: " . getTranslation('gameHelp.sections.threeRequired', $translations_fr, 'Chaque personnage...') . "\n\n";

echo "Types:\n";
echo "- Espèce: " . getTranslation('gameHelp.species.title', $translations_fr, 'Triptyque d\'Espèce') . "\n";
echo "- Classe: " . getTranslation('gameHelp.sections.classTriptych', $translations_fr, 'Triptyque de Classe') . "\n";
echo "- Historique: " . getTranslation('gameHelp.sections.backgroundTriptych', $translations_fr, 'Triptyque d\'Historique') . "\n\n";

echo "=== 5. LANCEUR DE DÉS ===\n";
echo "Titre: " . getTranslation('gameHelp.diceRoller.title', $translations_fr, '�� Lanceur de Caractéristiques') . "\n";
echo "Force: " . getTranslation('gameHelp.diceRoller.strength', $translations_fr, 'Force') . "\n";
echo "Dextérité: " . getTranslation('gameHelp.diceRoller.dexterity', $translations_fr, 'Dextérité') . "\n";
echo "Constitution: " . getTranslation('gameHelp.diceRoller.constitution', $translations_fr, 'Constitution') . "\n";
echo "Bouton Lancer: " . getTranslation('gameHelp.diceRoller.rollButton', $translations_fr, 'Lancer') . "\n";
echo "Bouton Tout: " . getTranslation('gameHelp.diceRoller.rollAllButton', $translations_fr, '🎲 Lancer toutes...') . "\n\n";

echo "=== 6. IMAGES ALT ===\n";
echo "Aasimar Front: " . getTranslation('gameHelp.images.speciesAssimarFront', $translations_fr, 'Triptyque Espèce...') . "\n";
echo "Barbarian Back: " . getTranslation('gameHelp.images.classBarbarianBack', $translations_fr, 'Triptyque Classe...') . "\n";
echo "Weapon Front: " . getTranslation('gameHelp.images.weaponCardFront', $translations_fr, 'Carte Arme - Recto') . "\n";
echo "Armor Back: " . getTranslation('gameHelp.images.armorCardBack', $translations_fr, 'Carte Armure - Verso') . "\n\n";

echo "=== 7. SECTION MONNAIE ===\n";
echo "Tests Title: " . getTranslation('money.tests.title', $translations_fr, '🔬 Tests...') . "\n";
echo "Basic Button: " . getTranslation('money.tests.basicButton', $translations_fr, '🧪 Tests de Base') . "\n";
echo "Advanced Button: " . getTranslation('money.tests.advancedButton', $translations_fr, '🔬 Tests Avancés') . "\n";
echo "Add All Button: " . getTranslation('money.converter.lotsRecommendations.addAllButton', $translations_fr, 'Ajouter tous...') . "\n";
echo "Treasury Button: " . getTranslation('money.physicalCoins.order.treasuryButton', $translations_fr, '⭐ Set Complet...') . "\n\n";

echo "==========================================\n";
echo "VÉRIFICATION ANGLAISE\n";
echo "==========================================\n\n";

$translations_en = json_decode(file_get_contents("./lang/en.json"), true) ?: [];

echo "=== 1. HEAD SECTION ===\n";
$title_en = getTranslation('meta.home.title', $translations_en, 'Geek & Dragon') . ' | Game Help';
$metaDescription_en = getTranslation('meta.gameHelp.description', $translations_en, 'Complete guide...');
echo "Title: $title_en\n";
echo "Meta Description: " . substr($metaDescription_en, 0, 80) . "...\n\n";

echo "=== 2. HERO SECTION ===\n";
echo "H1 Title: " . getTranslation('gameHelp.hero.title', $translations_en, 'Triptych Guide') . "\n";
echo "Subtitle: " . getTranslation('gameHelp.hero.subtitle', $translations_en, 'Master your sheets...') . "\n\n";

echo "Boutons Hero:\n";
echo "- " . getTranslation('gameHelp.buttons.discover', $translations_en, 'Discover Triptychs') . "\n";
echo "- " . getTranslation('gameHelp.buttons.cardsGuide', $translations_en, 'Cards Guide') . "\n";
echo "- " . getTranslation('gameHelp.buttons.moneyGuide', $translations_en, 'Money Guide') . "\n";
echo "- " . getTranslation('gameHelp.buttons.buyTriptychs', $translations_en, 'Buy my Triptychs') . "\n\n";

echo "=== 3. NAVIGATION RAPIDE ===\n";
echo "Titre: " . getTranslation('gameHelp.navigation.quickNav', $translations_en, 'Quick Navigation') . "\n";
echo "Guide Triptyques: " . getTranslation('gameHelp.navigation.triptychsGuide', $translations_en, 'Triptychs Guide') . "\n";
echo "Subtitle: " . getTranslation('gameHelp.navigation.triptychsSubtitle', $translations_en, 'Species, Class, Background - D&D 2024') . "\n";
echo "Guide Cartes: " . getTranslation('gameHelp.navigation.cardsGuide', $translations_en, 'Cards Guide') . "\n";
echo "Cards Subtitle: " . getTranslation('gameHelp.navigation.cardsSubtitle', $translations_en, 'Weapons, Equipment, Spells') . "\n";
echo "Guide Monnaie: " . getTranslation('gameHelp.navigation.coinGuide', $translations_en, 'Currency Guide') . "\n";
echo "Coin Subtitle: " . getTranslation('gameHelp.navigation.coinSubtitle', $translations_en, 'Monetary system + Converter') . "\n\n";

echo "=== 4. TRIPTYQUES ===\n";
echo "Qu'est-ce: " . getTranslation('gameHelp.sections.whatIsTriptyque', $translations_en, 'What is a triptych...') . "\n";
echo "Description: " . substr(getTranslation('gameHelp.sections.triptychDescription', $translations_en, 'A triptych is...'), 0, 60) . "...\n";
echo "3 Required: " . getTranslation('gameHelp.sections.threeRequired', $translations_en, 'Each D&D character...') . "\n\n";

echo "Types:\n";
echo "- Espèce: " . getTranslation('gameHelp.species.title', $translations_en, 'Species Triptych') . "\n";
echo "- Classe: " . getTranslation('gameHelp.sections.classTriptych', $translations_en, 'Class Triptych') . "\n";
echo "- Historique: " . getTranslation('gameHelp.sections.backgroundTriptych', $translations_en, 'Background Triptych') . "\n\n";

echo "=== 5. LANCEUR DE DÉS ===\n";
echo "Titre: " . getTranslation('gameHelp.diceRoller.title', $translations_en, '🎲 Ability Score Roller') . "\n";
echo "Force: " . getTranslation('gameHelp.diceRoller.strength', $translations_en, 'Strength') . "\n";
echo "Dextérité: " . getTranslation('gameHelp.diceRoller.dexterity', $translations_en, 'Dexterity') . "\n";
echo "Constitution: " . getTranslation('gameHelp.diceRoller.constitution', $translations_en, 'Constitution') . "\n";
echo "Bouton Lancer: " . getTranslation('gameHelp.diceRoller.rollButton', $translations_en, 'Roll') . "\n";
echo "Bouton Tout: " . getTranslation('gameHelp.diceRoller.rollAllButton', $translations_en, '🎲 Roll all...') . "\n\n";

echo "=== 6. IMAGES ALT ===\n";
echo "Aasimar Front: " . getTranslation('gameHelp.images.speciesAssimarFront', $translations_en, 'Species Triptych...') . "\n";
echo "Barbarian Back: " . getTranslation('gameHelp.images.classBarbarianBack', $translations_en, 'Class Triptych...') . "\n";
echo "Weapon Front: " . getTranslation('gameHelp.images.weaponCardFront', $translations_en, 'Weapon Card - Front') . "\n";
echo "Armor Back: " . getTranslation('gameHelp.images.armorCardBack', $translations_en, 'Armor Card - Back') . "\n\n";

echo "=== 7. SECTION MONNAIE ===\n";
echo "Tests Title: " . getTranslation('money.tests.title', $translations_en, '🔬 Conversion Tests...') . "\n";
echo "Basic Button: " . getTranslation('money.tests.basicButton', $translations_en, '🧪 Basic Tests') . "\n";
echo "Advanced Button: " . getTranslation('money.tests.advancedButton', $translations_en, '🔬 Advanced Tests') . "\n";
echo "Add All Button: " . getTranslation('money.converter.lotsRecommendations.addAllButton', $translations_en, 'Add all lots...') . "\n";
echo "Treasury Button: " . getTranslation('money.physicalCoins.order.treasuryButton', $translations_en, '⭐ Complete Treasury...') . "\n\n";

echo "========================================\n";
echo "ANALYSE COMPARATIVE FINALE\n";
echo "========================================\n";

$keys_to_check = [
    'gameHelp.hero.title',
    'gameHelp.sections.classTriptych', 
    'gameHelp.diceRoller.strength',
    'money.tests.basicButton',
    'gameHelp.images.weaponCardFront'
];

echo "Vérification des traductions distinctes:\n";
foreach ($keys_to_check as $key) {
    $fr_text = getTranslation($key, $translations_fr, '[MISSING FR]');
    $en_text = getTranslation($key, $translations_en, '[MISSING EN]');
    
    $status = ($fr_text !== '[MISSING FR]' && $en_text !== '[MISSING EN]' && $fr_text !== $en_text) ? '✅' : '❌';
    echo "$status $key:\n";
    echo "   FR: $fr_text\n";
    echo "   EN: $en_text\n\n";
}
?>