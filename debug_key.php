<?php
$translations = json_decode(file_get_contents('./lang/en.json'), true);

function getTranslationDebug($key, $translations, $fallback = '') {
    if (empty($key) || empty($translations)) return $fallback;
    $keys = explode('.', $key);
    $value = $translations;
    
    echo "Searching for key: $key\n";
    echo "Path breakdown: " . implode(' -> ', $keys) . "\n";
    
    foreach ($keys as $i => $k) {
        if (!is_array($value) || !isset($value[$k])) {
            echo "❌ Key '$k' NOT FOUND at position $i\n";
            echo "Available keys at this level: " . implode(', ', array_keys($value)) . "\n";
            return $fallback;
        }
        echo "✅ Found '$k'\n";
        $value = $value[$k];
    }
    return is_string($value) ? $value : $fallback;
}

echo "=== DEBUG EN ANGLAIS ===\n";
echo "Result: " . getTranslationDebug('money.tests.basicButton', $translations, '[MISSING]') . "\n\n";

echo "=== DEBUG EN FRANÇAIS ===\n";
$translations_fr = json_decode(file_get_contents('./lang/fr.json'), true);
echo "Result: " . getTranslationDebug('money.tests.basicButton', $translations_fr, '[MISSING]') . "\n";
?>