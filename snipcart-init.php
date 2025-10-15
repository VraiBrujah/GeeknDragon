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
  // Configuration Snipcart simplifiée et robuste
  (function() {
    const fallbackLang = '<?= htmlspecialchars($snipcartLanguage) ?>';
    let lang = fallbackLang;

    // Récupération sécurisée de la langue depuis localStorage
    try {
      const storedLang = localStorage.getItem('snipcartLanguage');
      if (storedLang) {
        lang = storedLang;
      } else {
        localStorage.setItem('snipcartLanguage', lang);
      }
    } catch (error) {
    }

    const rootStyles = window.getComputedStyle(document.documentElement);
    const readCssVariable = (variableName) => {
      if (typeof variableName !== 'string' || variableName.trim() === '') {
        return '';
      }

      return rootStyles.getPropertyValue(variableName).trim();
    };

    const palette = {
      backgroundPrimary: readCssVariable('--gd-bg-primary'),
      backgroundSecondary: readCssVariable('--gd-bg-secondary'),
      backgroundTertiary: readCssVariable('--gd-bg-tertiary'),
      textPrimary: readCssVariable('--gd-text-primary'),
      textSecondary: readCssVariable('--gd-text-secondary'),
      textMuted: readCssVariable('--gd-text-muted'),
      border: readCssVariable('--gd-border'),
      accent: readCssVariable('--gd-accent'),
      focus: readCssVariable('--gd-focus'),
      danger: readCssVariable('--gd-error'),
      success: readCssVariable('--gd-success'),
    };

    // Configuration Snipcart avec thème sombre
    window.SnipcartSettings = {
      publicApiKey: '<?= htmlspecialchars($snipcartKey) ?>',
      loadStrategy: 'onload', // Chargement automatique
      version: '3.4.0',
      config: {
        addProductBehavior: '<?= htmlspecialchars($snipcartAddProductBehavior) ?>',
        locale: lang,
        customerAccount: { enabled: true },
        logger: { enabled: false }, // Désactiver les logs en production
        analytics: { enabled: false }, // Désactiver les analytics pour performance
        debug: false, // Mode production strict
        silent: true, // Supprimer tous les logs console
        payment: {
          stripeElementsOptions: {
            appearance: {
              theme: 'night', // Thème sombre pour Stripe
              variables: {
                colorPrimary: palette.accent,
                colorBackground: palette.backgroundSecondary,
                colorText: palette.textPrimary,
                colorTextSecondary: palette.textSecondary,
                colorTextPlaceholder: palette.textMuted,
                colorDanger: palette.danger,
                colorSuccess: palette.success,
                colorBorder: palette.border,
                colorFocus: palette.focus,
                borderRadius: '8px',
                spacingUnit: '12px'
              },
              rules: {
                '.Input': {
                  backgroundColor: palette.backgroundSecondary || palette.backgroundPrimary,
                  color: palette.textPrimary,
                  caretColor: palette.textPrimary,
                  iconColor: palette.textPrimary,
                  borderColor: palette.border,
                  boxShadow: `0 0 0 1px ${palette.border}`
                },
                '.Input::placeholder': {
                  color: palette.textMuted
                },
                '.Label': {
                  color: palette.textSecondary
                },
                '.Input:focus': {
                  boxShadow: `0 0 0 1px ${palette.focus}`,
                  borderColor: palette.focus
                },
                '.Error': {
                  color: palette.danger
                }
              }
            }
          }
        }
      },
    };

  })();
  
  // Fix permissions policy pour les paiements
  document.addEventListener('DOMContentLoaded', function() {
    const meta = document.createElement('meta');
    meta.setAttribute('http-equiv', 'Permissions-Policy');
    meta.setAttribute('content', 'payment=*, publickey-credentials-get=*');
    document.head.appendChild(meta);
  });
</script>
<!-- Chargement Snipcart -->
<script>
(function() {

  // Chargement avec exemption CMP
  const snipcartScript = document.createElement('script');
  snipcartScript.async = true;
  snipcartScript.src = 'https://cdn.snipcart.com/themes/v3.4.0/default/snipcart.js';
  snipcartScript.setAttribute('data-cmp-ab', '1'); // Exempt du blocage CMP

  snipcartScript.onload = function() {
    // Script chargé avec succès
  };

  snipcartScript.onerror = function(event) {
    console.error('Échec chargement script Snipcart');
  };

  document.head.appendChild(snipcartScript);

  // Vérification silencieuse du chargement Snipcart (production)
  // setTimeout(() => {
  //   if (!window.Snipcart || !window.Snipcart.events) {
  //     console.error('Snipcart non chargé');
  //   }
  // }, 3000);

  // Filtrage conditionnel des logs Snipcart selon DEBUG_MODE
  <?php echo get_console_filter_script(); ?>

})();
</script>
<!-- Script de personnalisation -->
<script defer src="/js/snipcart.js?v=<?= filemtime(__DIR__.'/js/snipcart.js') ?>"></script>
