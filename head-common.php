<?php
/**
 * head-common.php - section d'en-tête mutualisée
 *
 * Cette section récupère l'identifiant de mesure Google Analytics depuis
 * l'environnement (priorité à $_ENV puis repli sur $_SERVER). Lorsqu'un
 * identifiant est fourni, le script gtag est injecté avant Snipcart afin
 * d'activer le suivi e-commerce attendu par Snipcart sans exposer de valeur
 * codée en dur.
 *
 * Le CMP (Consent Management Platform) est chargé en PRIORITÉ ABSOLUE
 * pour bloquer automatiquement les trackers avant consentement utilisateur.
 */

// Charger les helpers communs
require_once __DIR__ . '/includes/asset-helper.php';
require_once __DIR__ . '/includes/debug-helper.php';

$gaMeasurementId = $_ENV['GA_MEASUREMENT_ID']
    ?? $_SERVER['GA_MEASUREMENT_ID']
    ?? null;

if (is_string($gaMeasurementId)) {
    $gaMeasurementId = trim($gaMeasurementId);
}

?>
<head>
  <!-- Performance hints: DNS prefetch et preconnect optimisés -->
  <link rel="dns-prefetch" href="https://cdn.snipcart.com">
  <link rel="dns-prefetch" href="https://js.stripe.com">
  <link rel="preconnect" href="https://cdn.snipcart.com" crossorigin>
  <link rel="preconnect" href="https://js.stripe.com" crossorigin>
  <?php if ($gaMeasurementId): ?>
  <link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>
  <?php endif; ?>
  <link rel="preconnect" href="https://cdn.consentmanager.net" crossorigin>
  <link rel="preconnect" href="https://c.delivery.consentmanager.net" crossorigin>
  <script>
    // Mode debug global - contrôle tous les logs de débogage
    window.DEBUG_MODE = <?php echo is_debug_mode() ? 'true' : 'false'; ?>;
  </script>
  <?php 
  // CMP réactivé avec exemption Snipcart configurée
  include __DIR__ . '/includes/cmp-consent.php'; 
  ?>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <!-- CSP est servie via en-têtes Apache (voir .htaccess) pour supporter frame-ancestors -->
  <meta http-equiv="Permissions-Policy" content="payment=(self), payment-handler=(self)"/>
  <title><?= htmlspecialchars($title ?? 'Geek & Dragon') ?></title>
  <meta name="description" content="<?= htmlspecialchars($metaDescription ?? '') ?>" />
  <meta property="og:title" content="<?= htmlspecialchars($title ?? 'Geek & Dragon') ?>" />
  <meta property="og:description" content="<?= htmlspecialchars($metaDescription ?? '') ?>" />
  <meta property="og:image" content="<?= htmlspecialchars($ogImage ?? '/media/branding/logos/logo.webp') ?>" />
  <?php
    // URL canonique/OG par défaut si non fournie
    $__currentPath = $_SERVER['REQUEST_URI'] ?? '';
    if (!isset($metaUrl) || !$metaUrl) {
        if (function_exists('gd_build_absolute_url')) {
            $metaUrl = gd_build_absolute_url($__currentPath);
        } else {
            $isHttps = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] && strtolower((string) $_SERVER['HTTPS']) !== 'off')
                || (isset($_SERVER['REQUEST_SCHEME']) && strtolower((string) $_SERVER['REQUEST_SCHEME']) === 'https')
                || (isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443);
            $metaUrl = ($isHttps ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? '') . $__currentPath;
        }
    }
  ?>
  <meta property="og:url" content="<?= htmlspecialchars($metaUrl) ?>" />
  <meta property="og:type" content="website" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="<?= htmlspecialchars($title ?? 'Geek & Dragon') ?>" />
  <meta name="twitter:description" content="<?= htmlspecialchars($metaDescription ?? '') ?>" />
  <meta name="twitter:image" content="<?= htmlspecialchars($ogImage ?? '/media/branding/logos/logo.webp') ?>" />
  <link rel="canonical" href="<?= htmlspecialchars($metaUrl) ?>">

  <!-- Preload CSS critique -->
  <?= preload_asset('css/vendor.bundle.min.css', 'style') ?>

  <?= stylesheet_tag('css/vendor.bundle.min.css') ?>


  <!-- Polices auto-hébergées (pas de preload - font-display:swap suffit) -->
  <?php if (file_exists(__DIR__.'/css/fonts-selfhosted.css')): ?>
    <?= stylesheet_tag('css/fonts-selfhosted.css') ?>

  <?php endif; ?>
  <?= stylesheet_tag('css/styles.css') ?>

  <?= stylesheet_tag('css/shop-grid.css') ?>

  <?php if (!empty($gaMeasurementId)): ?>
    <!-- Google Analytics : chargement conditionnel après consentement CMP -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=<?= rawurlencode($gaMeasurementId) ?>"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);} // Fonction de suivi GA4
      
      // Configuration initiale avec consentement refusé par défaut
      gtag('consent', 'default', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
        'wait_for_update': 2000 // Attendre 2s max pour le CMP
      });
      
      gtag('js', new Date());
      gtag('config', '<?= htmlspecialchars($gaMeasurementId) ?>', {
        'anonymize_ip': true, // Anonymisation IP par défaut
        'cookie_flags': 'SameSite=Strict;Secure' // Cookies sécurisés
      });
      
      // Écouter les mises à jour de consentement du CMP
      document.addEventListener('cmpConsentUpdate', function(event) {
        const purposes = event.detail.purposes;
        gtag('consent', 'update', {
          'analytics_storage': purposes.analytics ? 'granted' : 'denied',
          'ad_storage': purposes.marketing ? 'granted' : 'denied'
        });
      });
    </script>
  <?php endif; ?>
  <link rel="stylesheet" href="/css/snipcart.css?v=<?= filemtime(__DIR__.'/css/snipcart.css') ?>">
  <link rel="stylesheet" href="/css/snipcart-custom.css?v=<?= filemtime(__DIR__.'/css/snipcart-custom.css') ?>">

  <!-- Module I18N - Chargement précoce pour traductions immédiates -->
  <script type="module">
    import I18nManager from '/js/i18n-manager.js?v=<?= filemtime(__DIR__.'/js/i18n-manager.js') ?>';

    // Langue définie par PHP (synchronisation PHP ↔ JS)
    const phpLang = '<?= $lang ?? 'fr' ?>';

    // Initialisation globale du gestionnaire I18N
    window.i18nManager = new I18nManager({
      defaultLang: phpLang, // Utiliser la langue PHP pour synchronisation
      availableLangs: ['fr', 'en', 'es', 'de'],
      translationsPath: '/lang/',
      debug: false, // Mode production
      cacheExpiry: 24 * 60 * 60 * 1000 // 24 heures
    });

    // Charger les traductions de la langue courante immédiatement (synchronisée avec PHP)
    (async () => {
      try {
        // La langue est déjà détectée par _initializeLanguage() depuis le cookie
        // Charger les traductions correspondantes
        const currentLang = window.i18nManager.currentLang;
        await window.i18nManager.loadTranslations(currentLang);

        // Mettre à jour le DOM avec les traductions IMMÉDIATEMENT
        window.i18nManager.updateDOM();

        // Si le DOM n'est pas encore complètement chargé, réappliquer après DOMContentLoaded
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
            window.i18nManager.updateDOM();
          });
        }

        // Exposer la fonction t() globalement pour compatibilité
        window.__ = window.i18nManager.t.bind(window.i18nManager);
        window.t = window.i18nManager.t.bind(window.i18nManager);

        // Dispatcher un événement pour notifier que les traductions sont prêtes
        document.dispatchEvent(new CustomEvent('i18nReady', {
          detail: { lang: window.i18nManager.currentLang }
        }));
      } catch (error) {
        console.error('[I18n] Erreur chargement traductions initiales:', error);
      }
    })();
  </script>

  <!-- Schema.org structured data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "Geek & Dragon",
    "description": "Accessoires immersifs pour jeux de rôle - Pièces métalliques, cartes d'équipement et fiches de personnage pour D&D",
    "url": "<?= htmlspecialchars($metaUrl ?? 'https://geekndragon.com') ?>",
    "logo": "https://geekndragon.com/media/branding/logos/logo.webp",
    "image": "<?= htmlspecialchars($ogImage ?? 'https://geekndragon.com/media/branding/logos/logo.webp') ?>",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "CA",
      "addressRegion": "QC"
    },
    "sameAs": [
      "https://facebook.com/geekndragon",
      "https://instagram.com/geekndragon"
    ]
  }
  </script>

  <?php if (!empty($extraHead)) echo $extraHead; ?>
</head>
