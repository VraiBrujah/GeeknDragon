<?php
/**  header.php  —  barre de navigation commune
 *  Usage :  <?php include 'header.php'; ?>
 *  $active (optionnel) = chaîne « produits », « boutique », « actus », « contact »…
 */
$active = $active ?? '';

if (!function_exists('navClass')) {
function navClass($key, $active) {
  // Classe "active" sobre, on laisse le style au CSS
  return $key === $active ? 'is-active' : '';
}
}

$navItems = [
  '/boutique.php' => [
    'slug'  => 'boutique',
    'label' => 'Boutique',
    'i18n'  => 'nav.shop',
    'children' => [
      '/boutique.php#pieces' => [
        'slug'  => 'pieces',
        'label' => 'Pièces',
        'i18n'  => 'nav.pieces'
      ],
      '/boutique.php#cartes' => [
        'slug'  => 'cartes',
        'label' => 'Cartes',
        'i18n'  => 'nav.cards'
      ],
      '/boutique.php#triptyques' => [
        'slug'  => 'triptyques',
        'label' => 'Triptyques',
        'i18n'  => 'nav.triptychs'
      ]
    ]
  ],
  '/index.php#actus' => [
    'slug'  => 'actus',
    'label' => 'Actualités',
    'i18n'  => 'nav.news'
  ],
  '/index.php#contact' => [
    'slug'  => 'contact',
    'label' => 'Contact',
    'i18n'  => 'nav.contact'
  ]
];

$snipcartKey = $snipcartKey
  ?? $_ENV['SNIPCART_API_KEY']
  ?? $_SERVER['SNIPCART_API_KEY'];

// Vérification des clés API en mode production
$apiConfigured = !empty($snipcartKey) && !empty($_ENV['SNIPCART_SECRET_API_KEY'] ?? $_SERVER['SNIPCART_SECRET_API_KEY'] ?? '');

if (!function_exists('renderNav')) {
function renderNav(array $items, string $active, bool $mobile = false): void {
    foreach ($items as $href => $item) {
    // Le menu utilise déjà Cinzel via le CSS, inutile d'ajouter "txt-court"
    $class = 'nav-link font-medium transition-colors duration-200 ' . ($mobile ? 'text-lg' : 'text-sm md:text-base') . ' ' . navClass($item['slug'], $active);
    $link = langUrl($href);
    if (isset($item['children']) && !$mobile) {
      echo '<li class="relative group">';
      echo '<a href="' . $link . '" class="' . $class . ' block px-2 py-1" data-i18n="' . $item['i18n'] . '">' . $item['label'] . '</a>';
      echo '<ul class="absolute left-0 top-full hidden group-hover:flex flex-col bg-gray-900/80 p-2 rounded z-10 space-y-1">';
      renderNav($item['children'], $active, $mobile);
      echo '</ul></li>';
    } else {
      echo '<li>';
      echo '<a href="' . $link . '" class="' . $class . ' block px-2 py-1" data-i18n="' . $item['i18n'] . '">' . $item['label'] . '</a>';
      if (isset($item['children']) && $mobile) {
        echo '<ul class="pl-4 flex flex-col space-y-2 mt-2">';
        renderNav($item['children'], $active, $mobile);
        echo '</ul>';
      }
      echo '</li>';
    }
  }
}
}
?>
<!-- Snipcart div supprimé - utilisation API uniquement -->
<a href="#main" class="sr-only focus:not-sr-only">Passer au contenu</a>

<header class="backdrop-blur bg-gradient-to-r from-gray-900/80 to-gray-800/60 shadow-lg fixed top-0 w-full z-[1200]">
  <div class="max-w-7xl mx-auto relative flex flex-nowrap items-center justify-between px-4 md:px-6 gap-x-4 gap-y-2 overflow-visible">
    <!-- Logo à gauche -->
    <a href="<?= langUrl('/index.php') ?>" class="relative z-10 flex items-center group transition-colors duration-200 flex-shrink-0">
      <img src="/images/optimized-modern/webp/brand-geekndragon-white.webp" alt="Logo Geek &amp; Dragon" class="header-logo logo-lighten transition-transform duration-200 group-hover:scale-105 rounded" style="--rounded-border-color: transparent;" width="80" height="80">
    </a>

    <!-- Titre centré -->
    <div class="flex-1 text-center">
      <a href="<?= langUrl('/index.php') ?>" class="group">
        <span class="site-title flex flex-col items-center text-2xl md:text-3xl font-semibold leading-none text-white group-hover:text-indigo-300 transition-colors duration-200">
          <span>GEEK</span>
          <span>&amp;</span>
          <span>DRAGON</span>
        </span>
      </a>
    </div>

    <!-- Partie droite -->
    <div class="flex items-center gap-4 md:gap-8 flex-shrink-0 flex-nowrap">
      <!-- Bouton hamburger -->
      <button id="menu-btn" class="md:hidden text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded transition-colors duration-200" aria-controls="mobile-menu" aria-expanded="false" aria-label="Menu">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      <!-- Navigation (au centre, revient sur 2 lignes si besoin) -->
      <nav class="hidden md:block order-3 md:order-2 basis-full md:basis-auto uppercase tracking-wide mt-2 md:mt-0 flex-1 text-center text-white" aria-label="Navigation principale">
        <ul class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <?php renderNav($navItems, $active); ?>
        </ul>
      </nav>

      <!-- Sélecteur de langue (drapeaux) -->
        <div id="lang-switcher" class="hidden md:flex items-center gap-2 order-2 md:order-3 ml-2 flex-shrink-0">
        <button type="button" data-lang="fr" class="flag-btn" aria-label="Français" aria-current="false">
          <img src="/images/flags/flag-fr-medieval-rim-on-top.svg" width="32" height="24" alt="">
        </button>
        <button type="button" data-lang="en" class="flag-btn" aria-label="English" aria-current="false">
          <img src="/images/flags/flag-en-us-uk-diagonal-medieval.svg" width="32" height="24" alt="">
        </button>
      </div>

      <!-- Nouveau système e-commerce natif -->
      <div class="flex items-center gap-2 flex-shrink-0 order-2 md:order-3 md:ml-auto">
        <button id="gd-account-toggle" class="gd-header-btn flex items-center justify-center gap-1 w-full text-center md:w-auto text-sm md:text-base uppercase tracking-wide text-white hover:text-indigo-400 transition-colors duration-200" aria-label="Compte" aria-expanded="false" aria-haspopup="dialog">
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
      </div>
    </div>
  </div>

  <!-- Menu mobile (TOUT est ensemble) -->
  <div id="menu-overlay" class="fixed inset-0 bg-black/60 hidden md:hidden z-10 opacity-0 transition-opacity duration-200"></div>
  <nav id="mobile-menu" class="fixed inset-0 z-20 bg-gray-900/95 flex flex-col items-center p-8 text-white hidden md:hidden uppercase tracking-wide transform transition-transform duration-200 translate-x-full overflow-y-auto" aria-hidden="true" aria-label="Navigation mobile">
    <ul class="flex flex-col items-center gap-6">
      <?php renderNav($navItems, $active, true); ?>
    </ul>

    <!-- Langues + actions dans le même panneau -->
    <div class="mt-8 flex flex-col items-center gap-6 w-full">
      <div class="flex items-center gap-2">
        <button type="button" data-lang="fr" class="flag-btn" aria-label="Français" aria-current="false">
          <img src="/images/flags/flag-fr-medieval-rim-on-top.svg" width="32" height="24" alt="">
        </button>
        <button type="button" data-lang="en" class="flag-btn" aria-label="English" aria-current="false">
          <img src="/images/flags/flag-en-us-uk-diagonal-medieval.svg" width="32" height="24" alt="">
        </button>
      </div>

      <!-- Menu mobile e-commerce -->
      <div class="flex flex-col w-full gap-6">
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
      </div>

      <button id="menu-close" aria-label="Fermer le menu" class="mt-8 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded transition-colors duration-200">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  </nav>
</header>

<?php if (!$apiConfigured): ?>
<!-- Avertissement API non configurée -->
<div id="api-warning" style="
  position: fixed; 
  top: var(--header-height, 96px); 
  left: 0; 
  right: 0; 
  background: linear-gradient(45deg, #dc2626, #b91c1c); 
  color: white; 
  text-align: center; 
  padding: 0.75rem; 
  z-index: 1100;
  font-family: 'Cinzel', serif;
  font-size: 0.875rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
">
  ⚠️ <strong>Configuration requise :</strong> Le système de panier nécessite la configuration des clés API.
  <a href="/test-snipcart.php" style="color: #fbbf24; text-decoration: underline; margin-left: 0.5rem;">Tester la configuration</a>
  <button onclick="this.parentElement.style.display='none'" style="
    background: none; 
    border: none; 
    color: white; 
    font-size: 1.25rem; 
    float: right; 
    cursor: pointer;
    line-height: 1;
  ">×</button>
</div>
<?php endif; ?>
