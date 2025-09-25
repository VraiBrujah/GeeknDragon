<?php
/**
 * Script de vérification finale des traductions de aide-jeux.php
 * Simule l'ouverture de la page dans les deux langues et vérifie chaque élément
 */

// Inclure le système de traduction
require_once __DIR__ . '/i18n.php';

echo "<h1>Vérification finale des traductions de aide-jeux.php</h1>\n";
echo "<h2>Répertoire de travail : E:\\GitHub\\GeeknDragon</h2>\n";

// Fonction pour simuler la page dans une langue donnée
function simulatePageInLanguage($lang) {
    // Simuler les paramètres de langue
    $_GET['lang'] = $lang;
    $_COOKIE['lang'] = $lang;
    
    // Recharger le système de traduction avec la nouvelle langue
    global $translations;
    $translations = json_decode(file_get_contents(__DIR__ . "/lang/$lang.json"), true) ?: [];
    $GLOBALS['lang'] = $lang;
    $GLOBALS['translations'] = $translations;
    
    return $translations;
}

// Fonction pour tester une clé de traduction
function testTranslationKey($key, $fallback = '') {
    global $translations;
    $result = t($key, $translations, $fallback);
    return $result !== $fallback ? $result : null;
}

// Liste complète des clés de traduction utilisées dans aide-jeux.php
$keysToVerify = [
    // Section Hero
    'gameHelp.hero.title',
    'gameHelp.hero.subtitle',
    
    // Navigation
    'gameHelp.navigation.home',
    'gameHelp.navigation.shop',
    'gameHelp.navigation.contact',
    
    // Lanceur de dés
    'gameHelp.diceRoller.title',
    'gameHelp.diceRoller.selectDice',
    'gameHelp.diceRoller.rollButton',
    'gameHelp.diceRoller.result',
    'gameHelp.diceRoller.history',
    'gameHelp.diceRoller.clearHistory',
    
    // Convertisseur de monnaie (racine)
    'money.converter.title',
    'money.converter.sourcesLabel',
    'money.converter.multiplierLabel',
    'money.converter.equivalences',
    'money.converter.recommendations',
    'money.currency.copper',
    'money.currency.silver',
    'money.currency.electrum',
    'money.currency.gold',
    'money.currency.platinum',
    
    // Images et alt text
    'gameHelp.images.diceAlt',
    'gameHelp.images.converterAlt',
    'gameHelp.images.heroAlt',
    
    // Nouvelles clés ajoutées
    'gameHelp.classTriptych.title',
    'gameHelp.classTriptych.description',
    'gameHelp.backgroundTriptych.title',
    'gameHelp.backgroundTriptych.description',
    'gameHelp.musicPlayer.title',
    'gameHelp.musicPlayer.description'
];

echo "<h2>🔍 Vérification systématique par langue</h2>\n";

$languages = ['fr', 'en'];
$results = [];

foreach ($languages as $lang) {
    echo "<h3>📍 Langue : " . strtoupper($lang) . "</h3>\n";
    
    // Simuler la page dans cette langue
    $translations = simulatePageInLanguage($lang);
    $results[$lang] = [];
    
    echo "<table border='1' style='border-collapse: collapse; width: 100%;'>\n";
    echo "<tr><th>Clé</th><th>Traduction</th><th>Status</th></tr>\n";
    
    foreach ($keysToVerify as $key) {
        $translation = testTranslationKey($key);
        $status = $translation ? "✅ OK" : "❌ MANQUANT";
        $displayText = $translation ?: "AUCUNE TRADUCTION";
        
        $results[$lang][$key] = [
            'translation' => $translation,
            'status' => $translation ? 'ok' : 'missing'
        ];
        
        $rowStyle = $translation ? '' : 'style="background-color: #ffcccc;"';
        echo "<tr $rowStyle><td>$key</td><td>" . htmlspecialchars($displayText) . "</td><td>$status</td></tr>\n";
    }
    
    echo "</table>\n";
}

// Comparaison entre langues
echo "<h2>🔄 Comparaison entre français et anglais</h2>\n";
echo "<table border='1' style='border-collapse: collapse; width: 100%;'>\n";
echo "<tr><th>Clé</th><th>Français</th><th>Anglais</th><th>Status</th></tr>\n";

$inconsistencies = 0;
foreach ($keysToVerify as $key) {
    $frStatus = $results['fr'][$key]['status'];
    $enStatus = $results['en'][$key]['status'];
    $frText = $results['fr'][$key]['translation'] ?: 'MANQUANT';
    $enText = $results['en'][$key]['translation'] ?: 'MANQUANT';
    
    $overallStatus = '✅ OK';
    $rowStyle = '';
    
    if ($frStatus === 'missing' || $enStatus === 'missing') {
        $overallStatus = '❌ TRADUCTION MANQUANTE';
        $rowStyle = 'style="background-color: #ffcccc;"';
        $inconsistencies++;
    } elseif ($frStatus === 'ok' && $enStatus === 'ok') {
        $overallStatus = '✅ COMPLET';
        $rowStyle = 'style="background-color: #ccffcc;"';
    }
    
    echo "<tr $rowStyle>";
    echo "<td>$key</td>";
    echo "<td>" . htmlspecialchars($frText) . "</td>";
    echo "<td>" . htmlspecialchars($enText) . "</td>";
    echo "<td>$overallStatus</td>";
    echo "</tr>\n";
}

echo "</table>\n";

echo "<h2>📊 Résumé final</h2>\n";
echo "<p><strong>Total des clés vérifiées :</strong> " . count($keysToVerify) . "</p>\n";
echo "<p><strong>Incohérences détectées :</strong> $inconsistencies</p>\n";

if ($inconsistencies === 0) {
    echo "<div style='background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px;'>\n";
    echo "<strong>🎉 SUCCÈS : Toutes les traductions sont fonctionnelles !</strong><br>\n";
    echo "Aide-jeux.php est entièrement traduit et cohérent entre le français et l'anglais.\n";
    echo "</div>\n";
} else {
    echo "<div style='background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px;'>\n";
    echo "<strong>⚠️ ATTENTION : $inconsistencies traductions à corriger</strong><br>\n";
    echo "Certaines clés nécessitent une attention particulière.\n";
    echo "</div>\n";
}

// Test de fonctionnement du convertisseur de monnaie
echo "<h2>🧪 Test spécifique du convertisseur de monnaie</h2>\n";

foreach ($languages as $lang) {
    echo "<h3>Test en " . strtoupper($lang) . "</h3>\n";
    simulatePageInLanguage($lang);
    
    $converterKeys = [
        'money.converter.title',
        'money.converter.sourcesLabel',
        'money.converter.multiplierLabel',
        'money.converter.equivalences',
        'money.converter.recommendations'
    ];
    
    echo "<ul>\n";
    foreach ($converterKeys as $key) {
        $translation = testTranslationKey($key);
        $status = $translation ? "✅" : "❌";
        echo "<li>$status <strong>$key</strong>: " . htmlspecialchars($translation ?: 'MANQUANT') . "</li>\n";
    }
    echo "</ul>\n";
}

?>