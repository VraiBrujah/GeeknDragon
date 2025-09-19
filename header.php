<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

use GeeknDragon\Core\SessionHelper;

/**
 * Barre de navigation principale.
 *
 * Les pages peuvent définir :
 * - $active : identifiant du menu actif.
 * - $config : tableau de configuration existant.
 * - $navItems : tableau personnalisé d'éléments de navigation.
 *   Chaque élément peut définir :
 *     - 'href' pour forcer l'URL utilisée;
 *     - 'use_lang' (bool) pour activer/désactiver l'ajout du préfixe de langue;
 *     - 'target' et 'rel' pour ajuster les attributs d'ouverture de lien.
 * - $headerActions : actions additionnelles pour l'entête (chaîne échappée,
 *   tableau de chaînes ou callback retournant du HTML sécurisé).
 * - $headerActionsMobile : équivalent mobile pour les actions supplémentaires.
 */
SessionHelper::ensureSession();

$config = $config ?? require __DIR__ . '/config.php';
$translator = require __DIR__ . '/i18n.php';
$lang = $translator->getCurrentLanguage();
$active = $active ?? '';

$snipcartConfigured = $config['snipcart_configured']
    ?? ((bool) ($config['snipcart_api_key'] ?? '') && (bool) ($config['snipcart_secret_api_key'] ?? ''));

if (!function_exists('gdNavClass')) {
    /**
     * Retourne la classe CSS pour un item actif.
     */
    function gdNavClass(string $slug, string $active): string
    {
        return $slug === $active ? 'is-active' : '';
    }
}

if (!isset($navItems)) {
    $navItems = [
        '/boutique.php' => [
            'slug' => 'boutique',
            'label' => 'Boutique',
            'i18n' => 'nav.shop',
            'children' => [
                '/boutique.php#coins' => ['slug' => 'coins', 'label' => 'Pièces', 'i18n' => 'nav.pieces'],
                '/boutique.php#cards' => ['slug' => 'cards', 'label' => 'Cartes', 'i18n' => 'nav.cards'],
                '/boutique.php#triptych' => ['slug' => 'triptych', 'label' => 'Triptyques', 'i18n' => 'nav.triptychs'],
            ],
        ],
        '/index.php#actualites' => [
            'slug' => 'actus',
            'label' => 'Actualités',
            'i18n' => 'nav.news',
        ],
        '/devis.php' => [
            'slug' => 'contact',
            'label' => 'Devis',
            'i18n' => 'nav.contact',
        ],
        '/compte.php' => [
            'slug' => 'compte',
            'label' => 'Compte',
            'i18n' => 'nav.account',
            'icon' => '👤',
            'icon_only' => true,
        ],
    ];
}

if (!function_exists('gdRenderNav')) {
    /**
     * Rend la liste de navigation (desktop ou mobile).
     */
    function gdRenderNav(array $items, string $active, bool $mobile = false): void
    {
        foreach ($items as $href => $item) {
            $rawLink = $item['href'] ?? $href;
            $useLangUrl = $item['use_lang'] ?? !isset($item['href']);
            $link = $rawLink;

            if ($useLangUrl) {
                $link = langUrl($rawLink);
            } elseif (
                !preg_match('#^(?:https?:|mailto:|tel:)#i', (string) $rawLink)
                && strpos((string) $rawLink, '/') !== 0
            ) {
                $link = '/' . ltrim((string) $rawLink, '/');
            }

            $class = 'nav-link font-medium transition-colors duration-200 whitespace-nowrap '
                . ($mobile ? 'text-lg' : 'text-sm md:text-base')
                . ' ' . gdNavClass($item['slug'], $active);
            $isActive = ($item['slug'] ?? '') === $active;
            $ariaCurrent = $isActive ? ' aria-current="page"' : '';

            $targetAttr = '';
            if (!empty($item['target'])) {
                $targetAttr = ' target="' . htmlspecialchars((string) $item['target'], ENT_QUOTES, 'UTF-8') . '"';
            }

            $relAttr = '';
            if (!empty($item['rel'])) {
                $relAttr = ' rel="' . htmlspecialchars((string) $item['rel'], ENT_QUOTES, 'UTF-8') . '"';
            }

            $labelText = htmlspecialchars($item['label'] ?? '', ENT_QUOTES, 'UTF-8');
            $i18nKey = htmlspecialchars($item['i18n'] ?? '', ENT_QUOTES, 'UTF-8');
            // Mode indicateur pour rendre l'icône seule visible tout en conservant le texte pour les lecteurs d'écran.
            $isIconOnly = !empty($item['icon_only']);

            $labelContent = '<span data-i18n="' . $i18nKey . '">' . $labelText . '</span>';
            if ($isIconOnly) {
                $labelContent = '<span class="sr-only" data-i18n="' . $i18nKey . '">' . $labelText . '</span>';
            }

            $label = $labelContent;

            if (!empty($item['icon'])) {
                $icon = htmlspecialchars((string) $item['icon'], ENT_QUOTES, 'UTF-8');
                $iconContainerClasses = 'inline-flex items-center justify-center';
                if (!$isIconOnly) {
                    $iconContainerClasses .= ' gap-2';
                }

                $label = '<span class="' . $iconContainerClasses . '">'
                    . '<span aria-hidden="true">' . $icon . '</span>'
                    . $labelContent
                    . '</span>';
            }

            if (isset($item['children']) && !$mobile) {
                echo '<li class="relative group">';
                echo '<a href="' . htmlspecialchars($link, ENT_QUOTES, 'UTF-8')
                    . '" class="' . $class . ' block px-2 py-1"' . $ariaCurrent . $targetAttr . $relAttr . '>'
                    . $label . '</a>';
                echo '<ul class="absolute left-0 top-full hidden group-hover:flex flex-col bg-gray-900/80 p-2 rounded z-10 space-y-1">';
                gdRenderNav($item['children'], $active, $mobile);
                echo '</ul></li>';
            } else {
                echo '<li>';
                echo '<a href="' . htmlspecialchars($link, ENT_QUOTES, 'UTF-8')
                    . '" class="' . $class . ' block px-2 py-1"' . $ariaCurrent . $targetAttr . $relAttr . '>'
                    . $label . '</a>';
                if (isset($item['children']) && $mobile) {
                    echo '<ul class="pl-4 flex flex-col space-y-2 mt-2">';
                    gdRenderNav($item['children'], $active, $mobile);
                    echo '</ul>';
                }
                echo '</li>';
            }
        }
    }
}

if (!function_exists('gdRenderHeaderActions')) {
    /**
     * Normalise et rend les actions additionnelles de l'entête.
     *
     * @param mixed    $actions          Valeur définie par la page (chaîne, tableau ou callback).
     * @param callable $defaultProvider  Générateur de contenu par défaut.
     */
    function gdRenderHeaderActions($actions, callable $defaultProvider): string
    {
        if ($actions === null) {
            return (string) call_user_func($defaultProvider);
        }

        if (is_callable($actions)) {
            $result = $actions();
            if (is_string($result) || (is_object($result) && method_exists($result, '__toString'))) {
                return (string) $result;
            }

            return (string) call_user_func($defaultProvider);
        }

        if (is_string($actions) || (is_object($actions) && method_exists($actions, '__toString'))) {
            return htmlspecialchars((string) $actions, ENT_QUOTES, 'UTF-8');
        }

        if (is_array($actions)) {
            $htmlParts = [];
            foreach ($actions as $action) {
                if (is_callable($action)) {
                    $value = $action();
                    if (is_string($value) || (is_object($value) && method_exists($value, '__toString'))) {
                        $htmlParts[] = (string) $value;
                    }
                    continue;
                }

                if (is_string($action) || (is_object($action) && method_exists($action, '__toString'))) {
                    $htmlParts[] = htmlspecialchars((string) $action, ENT_QUOTES, 'UTF-8');
                }
            }

            if ($htmlParts !== []) {
                return implode('', $htmlParts);
            }

            return (string) call_user_func($defaultProvider);
        }

        return (string) call_user_func($defaultProvider);
    }
}

if (!function_exists('gdDefaultHeaderActionsDesktop')) {
    /**
     * Fournit les actions par défaut de l'entête (version bureau).
     */
    function gdDefaultHeaderActionsDesktop(): string
    {
        ob_start();
        ?>
        <button id="gd-account-toggle" class="gd-header-btn flex items-center justify-center text-white hover:text-indigo-400 transition-colors duration-200" aria-label="Compte" aria-expanded="false" aria-haspopup="dialog">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          <span class="sr-only" data-i18n="nav.account">Compte</span>
        </button>

        <button id="gd-cart-toggle" class="gd-header-btn flex items-center justify-center gap-1 w-full text-center md:w-auto text-sm md:text-base uppercase tracking-wide text-white hover:text-indigo-400 transition-colors duration-200" aria-label="Panier" aria-expanded="false" aria-haspopup="dialog">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
          </svg>
          <span id="gd-cart-count" class="gd-cart-badge" aria-label="Articles dans le panier">0</span>
          <span class="sr-only" data-i18n="nav.cart">Panier</span>
        </button>
        <?php

        return (string) ob_get_clean();
    }
}

if (!function_exists('gdDefaultHeaderActionsMobile')) {
    /**
     * Fournit les actions par défaut de l'entête (version mobile).
     */
    function gdDefaultHeaderActionsMobile(): string
    {
        ob_start();
        ?>
        <button id="gd-account-toggle-mobile" class="gd-header-btn w-full text-center text-lg uppercase tracking-wide text-white hover:text-indigo-400 transition-colors duration-200" aria-label="Compte">
          <svg class="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          <span class="sr-only" data-i18n="nav.account">Compte</span>
        </button>

        <button id="gd-cart-toggle-mobile" class="gd-header-btn w-full text-center text-lg uppercase tracking-wide text-white hover:text-indigo-400 transition-colors duration-200" aria-label="Panier">
          <svg class="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
          </svg>
          <span class="gd-cart-badge-mobile">0</span>
          <span class="sr-only" data-i18n="nav.cart">Panier</span>
        </button>
        <?php

        return (string) ob_get_clean();
    }
}
?>
<a href="#main" class="sr-only focus:not-sr-only">Passer au contenu</a>

<header class="backdrop-blur bg-gradient-to-r from-gray-900/80 to-gray-800/60 shadow-lg fixed top-0 w-full z-[1200]">
  <div class="nav-container w-full relative flex flex-wrap md:flex-nowrap items-center justify-between px-4 md:px-6 gap-4 overflow-visible">
    <a href="<?= langUrl('/index.php'); ?>" class="relative z-10 flex items-center group transition-colors duration-200 flex-shrink-0">
      <img src="/images/optimized-modern/webp/brand-geekndragon-white.webp" alt="Logo Geek &amp; Dragon" class="header-logo logo-lighten transition-transform duration-200 group-hover:scale-105 rounded" width="80" height="80">
    </a>

    <div class="flex-1 px-3 sm:px-4 text-center min-w-0">
      <a href="<?= langUrl('/index.php'); ?>" class="group">
        <span class="site-title inline-block text-lg sm:text-2xl md:text-3xl font-semibold leading-none text-white uppercase whitespace-nowrap overflow-hidden text-ellipsis group-hover:text-indigo-300 transition-colors duration-200">GEEK &amp; DRAGON</span>
      </a>
    </div>

    <div class="flex items-center gap-4 md:gap-8 flex-shrink-0 flex-nowrap">
      <button id="menu-btn" class="md:hidden text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded transition-colors duration-200" aria-controls="mobile-menu" aria-expanded="false" aria-label="Menu">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      <nav class="hidden md:flex order-3 md:order-2 flex-1 uppercase tracking-wide text-center text-white overflow-x-auto" aria-label="Navigation principale">
        <ul class="flex flex-nowrap items-center justify-center gap-6 whitespace-nowrap">
          <?php gdRenderNav($navItems, $active); ?>
        </ul>
      </nav>

      <div id="lang-switcher" class="hidden md:flex items-center gap-2 order-2 md:order-3 ml-2 flex-shrink-0">
        <button type="button" data-lang="fr" class="flag-btn" aria-label="Français" aria-current="<?= $lang === 'fr' ? 'true' : 'false'; ?>">
          <img src="/images/flags/flag-fr-medieval-rim-on-top.svg" width="32" height="24" alt="">
        </button>
        <button type="button" data-lang="en" class="flag-btn" aria-label="English" aria-current="<?= $lang === 'en' ? 'true' : 'false'; ?>">
          <img src="/images/flags/flag-en-us-uk-diagonal-medieval.svg" width="32" height="24" alt="">
        </button>
      </div>

      <div class="hidden md:flex items-center gap-4 flex-shrink-0 order-2 md:order-3 md:ml-auto" data-gd-header-actions>
        <div id="gd-header-audio-anchor" class="flex items-center gap-2"></div>
        <?= gdRenderHeaderActions($headerActions ?? null, 'gdDefaultHeaderActionsDesktop'); ?>
      </div>
    </div>
  </div>

  <div id="menu-overlay" class="fixed inset-0 bg-black/60 hidden md:hidden z-10 opacity-0 transition-opacity duration-200"></div>
  <nav id="mobile-menu" class="fixed inset-0 z-20 bg-gray-900/95 flex flex-col items-center p-8 text-white hidden md:hidden uppercase tracking-wide transform transition-transform duration-200 translate-x-full overflow-y-auto" aria-hidden="true" aria-label="Navigation mobile">
    <ul class="flex flex-col items-center gap-6">
      <?php gdRenderNav($navItems, $active, true); ?>
    </ul>

    <div class="mt-8 flex flex-col items-center gap-6 w-full">
      <div class="flex items-center gap-2">
        <button type="button" data-lang="fr" class="flag-btn" aria-label="Français" aria-current="<?= $lang === 'fr' ? 'true' : 'false'; ?>">
          <img src="/images/flags/flag-fr-medieval-rim-on-top.svg" width="32" height="24" alt="">
        </button>
        <button type="button" data-lang="en" class="flag-btn" aria-label="English" aria-current="<?= $lang === 'en' ? 'true' : 'false'; ?>">
          <img src="/images/flags/flag-en-us-uk-diagonal-medieval.svg" width="32" height="24" alt="">
        </button>
      </div>

      <div class="flex flex-col w-full gap-6" data-gd-mobile-actions>
        <div id="gd-mobile-audio-anchor" class="w-full"></div>
        <?= gdRenderHeaderActions($headerActionsMobile ?? null, 'gdDefaultHeaderActionsMobile'); ?>
      </div>

      <button id="menu-close" aria-label="Fermer le menu" class="mt-8 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded transition-colors duration-200">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  </nav>
</header>

<?php if (!$snipcartConfigured): ?>
<div id="api-warning" style="position: fixed; top: var(--header-height, 96px); left: 0; right: 0; background: linear-gradient(45deg, #dc2626, #b91c1c); color: white; text-align: center; padding: 0.75rem; z-index: 1100;">
  <strong>Snipcart</strong> n'est pas complètement configuré. Vérifiez vos clés API.
</div>
<?php endif; ?>
