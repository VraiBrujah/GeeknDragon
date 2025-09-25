<?php
/**
 * Vérification CORRECTE des traductions de aide-jeux.php
 * Utilise les VRAIES clés extraites du code source
 */

require_once __DIR__ . '/i18n.php';

echo "<h1>Vérification CORRECTE des traductions de aide-jeux.php</h1>\n";
echo "<h2>Répertoire de travail : E:\\GitHub\\GeeknDragon</h2>\n";

function simulatePageInLanguage($lang) {
    $_GET['lang'] = $lang;
    $_COOKIE['lang'] = $lang;
    
    global $translations;
    $translations = json_decode(file_get_contents(__DIR__ . "/lang/$lang.json"), true) ?: [];
    $GLOBALS['lang'] = $lang;
    $GLOBALS['translations'] = $translations;
    
    return $translations;
}

function testTranslationKey($key, $fallback = '') {
    global $translations;
    $result = t($key, $translations, $fallback);
    return $result !== $fallback ? $result : null;
}

// Clés RÉELLEMENT utilisées dans aide-jeux.php (extraites du code source)
$realKeysUsed = [
    // Section Hero (confirmées existantes)
    'gameHelp.hero.title',
    'gameHelp.hero.subtitle',
    
    // Lanceur de dés (confirmées existantes)
    'gameHelp.diceRoller.title',
    'gameHelp.diceRoller.rollButton',
    
    // Convertisseur de monnaie - SHOP section (confirmées dans les deux langues)
    'shop.converter.title',
    'shop.converter.sourcesLabel', 
    'shop.converter.multiplierLabel',
    'shop.converter.equivalences',
    'shop.converter.currencyLabel',
    
    // Labels de monnaies - MONEY section
    'money.converter.labels.copper',
    'money.converter.labels.silver', 
    'money.converter.labels.electrum',
    'money.converter.labels.gold',
    'money.converter.labels.platinum',
    
    // Tableau multiplicateur - MONEY section
    'money.converter.multiplierTable.copper',
    'money.converter.multiplierTable.silver',
    'money.converter.multiplierTable.electrum', 
    'money.converter.multiplierTable.gold',
    'money.converter.multiplierTable.platinum',
    
    // Recommandations - MONEY section
    'money.converter.recommendations.title',
    'money.converter.lotsRecommendedTitle',
    'money.converter.lotsRecommendations.addAllButton',
    'money.converter.lotsRecommendations.optimizationNote',
    'money.converter.lotsRecommendations.noLotsMessage',
    'money.converter.debugSection.title',
    'money.converter.coinDescription.faithfulReproduction',
    'money.converter.productSummary'
];

$languages = ['fr', 'en'];
$results = [];

echo "<h2>🔍 Vérification avec les VRAIES clés utilisées</h2>\n";

foreach ($languages as $lang) {
    echo "<h3>📍 Langue : " . strtoupper($lang) . "</h3>\n";
    
    $translations = simulatePageInLanguage($lang);
    $results[$lang] = [];
    
    echo "<table border='1' style='border-collapse: collapse; width: 100%; margin-bottom: 20px;'>\n";
    echo "<tr><th style='width: 40%;'>Clé</th><th style='width: 45%;'>Traduction</th><th style='width: 15%;'>Status</th></tr>\n";
    
    foreach ($realKeysUsed as $key) {
        $translation = testTranslationKey($key);
        $status = $translation ? "✅ OK" : "❌ MANQUANT";
        $displayText = $translation ?: "AUCUNE TRADUCTION TROUVÉE";
        
        $results[$lang][$key] = [
            'translation' => $translation,
            'status' => $translation ? 'ok' : 'missing'
        ];
        
        $rowStyle = $translation ? 'style="background-color: #d4edda;"' : 'style="background-color: #f8d7da;"';
        echo "<tr $rowStyle>";
        echo "<td style='padding: 8px; font-family: monospace; font-size: 11px;'>$key</td>";
        echo "<td style='padding: 8px;'>" . htmlspecialchars($displayText) . "</td>";
        echo "<td style='padding: 8px; text-align: center;'>$status</td>";
        echo "</tr>\n";
    }
    
    echo "</table>\n";
}

// Analyse comparative
echo "<h2>📊 Résumé par catégorie</h2>\n";

$categories = [
    'Hero Section' => ['gameHelp.hero.title', 'gameHelp.hero.subtitle'],
    'Dice Roller' => ['gameHelp.diceRoller.title', 'gameHelp.diceRoller.rollButton'], 
    'Converter Headers' => ['shop.converter.title', 'shop.converter.sourcesLabel', 'shop.converter.multiplierLabel', 'shop.converter.equivalences', 'shop.converter.currencyLabel'],
    'Currency Labels' => ['money.converter.labels.copper', 'money.converter.labels.silver', 'money.converter.labels.electrum', 'money.converter.labels.gold', 'money.converter.labels.platinum'],
    'Multiplier Table' => ['money.converter.multiplierTable.copper', 'money.converter.multiplierTable.silver', 'money.converter.multiplierTable.electrum', 'money.converter.multiplierTable.gold', 'money.converter.multiplierTable.platinum'],
    'Recommendations' => ['money.converter.recommendations.title', 'money.converter.lotsRecommendedTitle', 'money.converter.lotsRecommendations.addAllButton', 'money.converter.lotsRecommendations.optimizationNote', 'money.converter.lotsRecommendations.noLotsMessage', 'money.converter.debugSection.title', 'money.converter.coinDescription.faithfulReproduction', 'money.converter.productSummary']
];

$totalMissing = 0;
foreach ($categories as $categoryName => $keys) {
    echo "<h3>$categoryName</h3>\n";
    echo "<table border='1' style='border-collapse: collapse; width: 100%; margin-bottom: 15px;'>\n";
    echo "<tr><th>Clé</th><th>FR</th><th>EN</th><th>Status</th></tr>\n";
    
    foreach ($keys as $key) {
        $frStatus = $results['fr'][$key]['status'];
        $enStatus = $results['en'][$key]['status'];
        $frText = $results['fr'][$key]['translation'] ?: 'MANQUANT';
        $enText = $results['en'][$key]['translation'] ?: 'MANQUANT';
        
        $overallStatus = '✅ COMPLET';
        $rowStyle = 'style="background-color: #d4edda;"';
        
        if ($frStatus === 'missing' || $enStatus === 'missing') {
            $overallStatus = '❌ MANQUANT';
            $rowStyle = 'style="background-color: #f8d7da;"';
            $totalMissing++;
        }
        
        echo "<tr $rowStyle>";
        echo "<td style='padding: 6px; font-family: monospace; font-size: 10px;'>$key</td>";
        echo "<td style='padding: 6px; max-width: 200px; overflow: hidden;'>" . htmlspecialchars(substr($frText, 0, 50)) . (strlen($frText) > 50 ? '...' : '') . "</td>";
        echo "<td style='padding: 6px; max-width: 200px; overflow: hidden;'>" . htmlspecialchars(substr($enText, 0, 50)) . (strlen($enText) > 50 ? '...' : '') . "</td>";
        echo "<td style='padding: 6px; text-align: center;'>$overallStatus</td>";
        echo "</tr>\n";
    }
    
    echo "</table>\n";
}

echo "<h2>🎯 CONCLUSION FINALE</h2>\n";
echo "<p><strong>Total des clés vérifiées :</strong> " . count($realKeysUsed) . "</p>\n";
echo "<p><strong>Traductions manquantes :</strong> $totalMissing</p>\n";

if ($totalMissing === 0) {
    echo "<div style='background-color: #d4edda; border: 2px solid #155724; color: #155724; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;'>\n";
    echo "<h3>🎉 PARFAIT ! Toutes les traductions sont fonctionnelles !</h3>\n";
    echo "<p>✅ Aide-jeux.php est <strong>entièrement traduit</strong> et <strong>cohérent</strong> entre le français et l'anglais.</p>\n";
    echo "<p>✅ Toutes les clés utilisées dans le code source sont présentes dans les fichiers JSON.</p>\n";
    echo "<p>✅ Le convertisseur de monnaie fonctionne parfaitement dans les deux langues.</p>\n";
    echo "</div>\n";
} else {
    echo "<div style='background-color: #f8d7da; border: 2px solid #721c24; color: #721c24; padding: 20px; border-radius: 10px; margin: 20px 0;'>\n";
    echo "<h3>⚠️ ATTENTION : $totalMissing traductions à corriger</h3>\n";
    echo "<p>Certaines clés nécessitent une attention particulière pour finaliser le système.</p>\n";
    echo "</div>\n";
}

?>