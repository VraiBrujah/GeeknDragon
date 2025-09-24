<?php
/**
 * Initialisation centralisée de Snipcart.
 *
 * Les pages peuvent définir $snipcartKey, $snipcartLanguage ou $snipcartAddProductBehavior
 * avant d'inclure ce fichier. À défaut, les valeurs sont récupérées depuis l'environnement
 * puis normalisées pour garantir un comportement uniforme sur toutes les pages (index, boutique, etc.).
 */

// Liste des langues supportées par Snipcart sur Geek & Dragon.
$snipcartSupportedLocales = ['fr', 'en'];

// Clé publique Snipcart (priorité à la valeur définie par la page).
$snipcartKey = $snipcartKey
    ?? $_ENV['SNIPCART_API_KEY']
    ?? $_SERVER['SNIPCART_API_KEY']
    ?? null;

// Langue souhaitée : valeur fournie par la page, puis environnement, puis langue globale du site.
$snipcartLanguage = $snipcartLanguage
    ?? $_ENV['SNIPCART_LANGUAGE']
    ?? $_SERVER['SNIPCART_LANGUAGE']
    ?? ($lang ?? null);

if (is_string($snipcartLanguage)) {
    $snipcartLanguage = trim($snipcartLanguage);
}

// Normalisation de la langue pour toujours fournir un code compatible Snipcart (fr/en).
$normalizedLanguage = '';
if (is_string($snipcartLanguage) && $snipcartLanguage !== '') {
    $candidate = strtolower(str_replace([' ', '_'], '-', $snipcartLanguage));
    $primary = explode('-', $candidate)[0] ?? '';

    if (in_array($candidate, $snipcartSupportedLocales, true)) {
        $normalizedLanguage = $candidate;
    } elseif (in_array($primary, $snipcartSupportedLocales, true)) {
        $normalizedLanguage = $primary;
    }
}

if ($normalizedLanguage === '') {
    // Dernier recours : bascule sur la première langue supportée pour éviter une initialisation incomplète.
    $normalizedLanguage = $snipcartSupportedLocales[0];
}

$snipcartLanguage = $normalizedLanguage;

// Comportement du bouton « ajouter au panier » (overlay/standard).
$snipcartAddProductBehavior = $snipcartAddProductBehavior
    ?? $_ENV['SNIPCART_ADD_PRODUCT_BEHAVIOR']
    ?? $_SERVER['SNIPCART_ADD_PRODUCT_BEHAVIOR']
    ?? 'standard';

if (!is_string($snipcartAddProductBehavior) || $snipcartAddProductBehavior === '') {
    $snipcartAddProductBehavior = 'standard';
}

if (!$snipcartKey) {
    throw new RuntimeException('SNIPCART_API_KEY doit être définie.');
}
?>
<div hidden id="snipcart" data-api-key="<?= htmlspecialchars($snipcartKey) ?>"></div>
<script>
  const fallbackLang = '<?= htmlspecialchars($snipcartLanguage) ?>';
  const lang = localStorage.getItem('snipcartLanguage') || fallbackLang;

  try {
    if (!localStorage.getItem('snipcartLanguage')) {
      localStorage.setItem('snipcartLanguage', lang);
    }
  } catch (error) {
    // Stockage indisponible (navigation privée, etc.) : on se contente du fallback.
  }

  window.SnipcartSettings = {
    publicApiKey: '<?= htmlspecialchars($snipcartKey) ?>',
    loadStrategy: 'onload',
    version: '3.4.0', // Version CSS fixe pour éviter les breaking changes
    config: {
      addProductBehavior: '<?= htmlspecialchars($snipcartAddProductBehavior) ?>',
      locale: lang,
      customerAccount: { enabled: true },
    },
  };

</script>
<!-- Librairie Snipcart -->
<script async src="https://cdn.snipcart.com/themes/v3.4.0/default/snipcart.js"></script>
<!-- Script de personnalisation -->
<script defer src="/js/snipcart.js?v=<?= filemtime(__DIR__.'/js/snipcart.js') ?>"></script>
