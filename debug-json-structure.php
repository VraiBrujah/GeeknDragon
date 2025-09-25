<?php
$fr = json_decode(file_get_contents('lang/fr.json'), true);
$en = json_decode(file_get_contents('lang/en.json'), true);

echo "=== STRUCTURE FR ===\n";
if (isset($fr['money'])) {
    echo "✅ Section 'money' existe dans FR\n";
    if (isset($fr['money']['converter'])) {
        echo "  ✅ money.converter existe\n";
        echo "    - title: " . ($fr['money']['converter']['title'] ?? 'MANQUANT') . "\n";
        echo "    - sourcesLabel: " . ($fr['money']['converter']['sourcesLabel'] ?? 'MANQUANT') . "\n";
    } else {
        echo "  ❌ money.converter manquant\n";
    }
} else {
    echo "❌ Pas de section 'money' dans FR\n";
    echo "Clés principales FR: " . implode(', ', array_keys($fr)) . "\n";
}

echo "\n=== STRUCTURE EN ===\n";
if (isset($en['money'])) {
    echo "✅ Section 'money' existe dans EN\n";
    if (isset($en['money']['converter'])) {
        echo "  ✅ money.converter existe\n";
        echo "    - title: " . ($en['money']['converter']['title'] ?? 'MANQUANT') . "\n";
        echo "    - sourcesLabel: " . ($en['money']['converter']['sourcesLabel'] ?? 'MANQUANT') . "\n";
    } else {
        echo "  ❌ money.converter manquant\n";
    }
} else {
    echo "❌ Pas de section 'money' dans EN\n";
    echo "Clés principales EN: " . implode(', ', array_keys($en)) . "\n";
}

// Vérification spécifique gameHelp
echo "\n=== VÉRIFICATION gameHelp ===\n";
if (isset($fr['gameHelp'])) {
    echo "✅ gameHelp existe en FR\n";
    if (isset($fr['gameHelp']['cards'])) {
        echo "  ✅ gameHelp.cards existe\n";
        if (isset($fr['gameHelp']['cards']['money'])) {
            echo "    ⚠️ ATTENTION: money est dans gameHelp.cards !\n";
        }
    }
}

if (isset($en['gameHelp'])) {
    echo "✅ gameHelp existe en EN\n";
    if (isset($en['gameHelp']['cards'])) {
        echo "  ✅ gameHelp.cards existe\n";
        if (isset($en['gameHelp']['cards']['money'])) {
            echo "    ⚠️ ATTENTION: money est dans gameHelp.cards !\n";
        }
    }
}
?>