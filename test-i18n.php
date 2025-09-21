<?php
/**
 * Script de test pour le système d'internationalisation
 * 
 * Teste les nouvelles fonctions de traduction et vérifie
 * que toutes les clés nécessaires sont présentes dans les deux langues
 */

// Bootstrap du système
require_once __DIR__ . '/i18n.php';

echo "=== Test du système d'internationalisation ===\n\n";

// Test des fonctions de base
echo "1. Test des fonctions de base :\n";
echo "- Langue courante : " . $lang . "\n";
echo "- t('nav.shop') : " . t('nav.shop') . "\n";
echo "- __('product.add') : " . __('product.add') . "\n";
echo "- t('inexistant', null, 'fallback') : " . t('inexistant', null, 'fallback') . "\n\n";

// Test des nouvelles traductions
echo "2. Test des nouvelles traductions :\n";
$testKeys = [
    'ui.noImageAvailable',
    'ui.previousImage', 
    'ui.nextImage',
    'shop.converter.title',
    'shop.converter.sourcesLabel',
    'shop.converter.multiplierLabel',
    'shop.converter.equivalences',
    'shop.converter.recommendations',
    'shop.converter.currency.copper',
    'shop.converter.currency.silver',
    'shop.converter.currency.electrum',
    'shop.converter.currency.gold',
    'shop.converter.currency.platinum',
    'shop.cards.description',
    'shop.triptychs.description',
    'shop.converter.enterAmounts',
    'shop.converter.optimalConversion',
    'shop.converter.minimalCoins',
    'shop.converter.totalCoins',
    'shop.converter.remainder',
    'shop.converter.units',
    'shop.converter.lots',
    'shop.converter.coins',
    'shop.converter.and'
];

foreach ($testKeys as $key) {
    $value = t($key);
    echo "- $key : " . ($value ? $value : "[MANQUANT]") . "\n";
}

echo "\n3. Test avec les deux langues :\n";

// Test avec chargement direct des fichiers JSON
$frTranslationsTest = json_decode(file_get_contents(__DIR__ . '/translations/fr.json'), true);
$enTranslationsTest = json_decode(file_get_contents(__DIR__ . '/translations/en.json'), true);

echo "FR - nav.shop : " . t('nav.shop', $frTranslationsTest) . "\n";
echo "FR - ui.noImageAvailable : " . t('ui.noImageAvailable', $frTranslationsTest) . "\n";
echo "EN - nav.shop : " . t('nav.shop', $enTranslationsTest) . "\n";
echo "EN - ui.noImageAvailable : " . t('ui.noImageAvailable', $enTranslationsTest) . "\n";

echo "\n4. Test du helper dataI18n :\n";
echo dataI18n('product.add', 'Ajouter') . "\n";
echo ariaLabel('ui.close', 'Fermer') . "\n";

echo "\n=== Tests terminés ===\n";

// Vérification de cohérence
echo "\n5. Vérification de cohérence entre FR et EN :\n";
$frTranslations = json_decode(file_get_contents(__DIR__ . '/translations/fr.json'), true);
$enTranslations = json_decode(file_get_contents(__DIR__ . '/translations/en.json'), true);

function checkKeysRecursive($fr, $en, $path = '') {
    $missing = [];
    foreach ($fr as $key => $value) {
        $currentPath = $path ? "$path.$key" : $key;
        if (!isset($en[$key])) {
            $missing[] = "EN manque : $currentPath";
        } elseif (is_array($value) && is_array($en[$key])) {
            $missing = array_merge($missing, checkKeysRecursive($value, $en[$key], $currentPath));
        }
    }
    return $missing;
}

$missingEn = checkKeysRecursive($frTranslations, $enTranslations);
$missingFr = checkKeysRecursive($enTranslations, $frTranslations);

if (empty($missingEn) && empty($missingFr)) {
    echo "✅ Toutes les clés sont cohérentes entre FR et EN\n";
} else {
    echo "❌ Clés manquantes détectées :\n";
    foreach ($missingEn as $missing) {
        echo "  $missing\n";
    }
    foreach ($missingFr as $missing) {
        echo "  $missing\n";
    }
}

echo "\n=== Rapport de test terminé ===\n";
?>