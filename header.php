<?php
/**  header.php  —  barre de navigation commune
 *  Usage :  <?php include 'header.php'; ?>
 *  $active (optionnel) = chaîne « produits », « boutique », « actus », « contact »…
 */
$active = $active ?? '';

function navClass($key, $active) {
  // Classe "active" sobre, on laisse le style au CSS
  return $key === $active ? 'is-active' : '';
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
  '/aide-jeux.php' => [
    'slug'  => 'aide-jeux',
    'label' => 'Aide de Jeux',
    'i18n'  => 'nav.gameHelp'
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

function renderNav(array $items, string $active, bool $mobile = false): void {
    foreach ($items as $href => $item) {
    // Le menu utilise déjà Cinzel via le CSS, inutile d'ajouter "txt-court"
    $class = 'nav-link font-medium transition-colors duration-200 ' . ($mobile ? 'text-lg' : 'text-sm md:text-base') . ' ' . navClass($item['slug'], $active);
    $link = langUrl($href);
    if (isset($item['children']) && !$mobile) {
      echo '<li class="relative group">';
      echo '<a href="' . $link . '" class="' . $class . ' block px-2 py-1" data-i18n="' . $item['i18n'] . '">' . __($item['i18n'], $item['label']) . '</a>';
      echo '<ul class="absolute left-0 top-full hidden group-hover:flex flex-col bg-gray-900/80 p-2 rounded z-10 space-y-2">';
      renderNav($item['children'], $active, $mobile);
      echo '</ul></li>';
    } else {
      echo '<li>';
      echo '<a href="' . $link . '" class="' . $class . ' block px-2 py-1" data-i18n="' . $item['i18n'] . '">' . __($item['i18n'], $item['label']) . '</a>';
      if (isset($item['children']) && $mobile) {
        echo '<ul class="pl-4 flex flex-col space-y-2 mt-2">';
        renderNav($item['children'], $active, $mobile);
        echo '</ul>';
      }
      echo '</li>';
    }
  }
}
?>
<a href="#main" class="sr-only focus:not-sr-only">Passer au contenu</a>

<header class="backdrop-blur bg-gradient-to-r from-gray-900/80 to-gray-800/60 shadow-lg fixed top-0 w-full z-[1200]">
  <div class="max-w-7xl mx-auto relative flex items-center justify-between md:justify-between p-4 md:px-6 gap-x-4 gap-y-2 overflow-visible">
    <!-- Logo + Titre cliquables ensemble -->
    <a href="<?= langUrl('/index.php') ?>" class="relative z-10 flex flex-col md:flex-row items-center group transition-colors duration-200 flex-shrink-0 space-y-1 md:space-y-0 md:space-x-3 text-center md:text-left">
      <!-- Nouveau SVG très grand : on le bride via la classe header-logo -->
      <img src="/media/branding/logos/geekndragon_logo_blanc.webp" alt="Logo Geek &amp; Dragon" class="header-logo logo-lighten transition-transform duration-200 group-hover:scale-105" width="160" height="160">
      <span class="site-title text-2xl md:text-3xl font-semibold text-white group-hover:text-indigo-300 transition-colors duration-200">
        <span class="sm:hidden leading-snug">Geek<br>&amp;<br>Dragon</span>
        <span class="hidden sm:inline">Geek &amp; Dragon</span>
      </span>
    </a>

    <div class="flex items-center gap-6 md:gap-8">
      <!-- Bouton hamburger -->
      <button id="menu-btn" class="md:hidden text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded transition-colors duration-200" aria-controls="mobile-menu" aria-expanded="false" aria-label="Menu">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      <!-- Navigation (au centre, revient sur 2 lignes si besoin) -->
      <nav class="hidden md:block order-3 md:order-2 basis-full md:basis-auto uppercase tracking-wide mt-2 md:mt-0 flex-1 text-center" aria-label="Navigation principale">
        <ul class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <?php renderNav($navItems, $active); ?>
        </ul>
      </nav>

      <!-- Sélecteur de langue (drapeaux) -->
      <div id="lang-switcher" class="hidden md:flex items-center gap-2 order-2 md:order-3 ml-2">
        <button type="button" data-lang="fr" class="flag-btn" aria-label="Français" aria-current="false">
          <img src="/media/ui/flags/flag-fr-medieval-rim-on-top.svg" width="32" height="24" alt="">
        </button>
        <button type="button" data-lang="en" class="flag-btn" aria-label="English" aria-current="false">
          <img src="/media/ui/flags/flag-en-us-uk-diagonal-medieval.svg" width="32" height="24" alt="">
        </button>
      </div>

      <?php if ($snipcartKey): ?>
      <!-- Snipcart : icônes personnalisées WebP -->
      <div class="flex flex-row md:flex-col items-center gap-2 flex-shrink-0 order-2 md:order-3 md:ml-auto">
        <button class="snipcart-customer-signin snipcart-btn flex items-center justify-center gap-1 w-auto text-center text-sm md:text-base uppercase tracking-wide hover:opacity-80 transition-opacity duration-200 group" aria-label="Compte" title="Se connecter">
          <img src="/media/branding/icons/compte_non_connecter.webp" alt="" class="w-6 h-6 account-icon-disconnected transition-all duration-300" width="24" height="24">
          <img src="/media/branding/icons/compte_connecter.webp" alt="" class="w-6 h-6 account-icon-connected hidden transition-all duration-300" width="24" height="24">
          <span class="sr-only account-label" data-i18n="nav.account">Compte</span>
        </button>

        <button class="snipcart-checkout snipcart-btn flex items-center justify-center gap-1 w-auto text-center text-sm md:text-base uppercase tracking-wide hover:opacity-80 transition-opacity duration-200 relative" aria-label="Panier" title="Mon panier">
          <img src="/media/branding/icons/panier.webp" alt="" class="w-6 h-6 transition-transform duration-200 hover:scale-110" width="24" height="24">
          <span class="snipcart-items-count absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"></span>
          <span class="sr-only" data-i18n="nav.cart">Panier</span>
        </button>
      </div>
      <?php endif; ?>
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
          <img src="/media/ui/flags/flag-fr-medieval-rim-on-top.svg" width="32" height="24" alt="">
        </button>
        <button type="button" data-lang="en" class="flag-btn" aria-label="English" aria-current="false">
          <img src="/media/ui/flags/flag-en-us-uk-diagonal-medieval.svg" width="32" height="24" alt="">
        </button>
      </div>

      <?php if ($snipcartKey): ?>
      <div class="flex flex-col w-full gap-6">
        <button class="snipcart-customer-signin snipcart-btn w-full text-center text-lg uppercase tracking-wide hover:opacity-80 transition-opacity duration-200 flex flex-col items-center gap-2" aria-label="Compte" title="Se connecter">
          <img src="/media/branding/icons/compte_non_connecter.webp" alt="" class="w-8 h-8 account-icon-disconnected transition-all duration-300" width="32" height="32">
          <img src="/media/branding/icons/compte_connecter.webp" alt="" class="w-8 h-8 account-icon-connected hidden transition-all duration-300" width="32" height="32">
          <span class="account-label text-sm" data-i18n="nav.account">Se connecter</span>
        </button>

        <button class="snipcart-checkout snipcart-btn w-full text-center text-lg uppercase tracking-wide hover:opacity-80 transition-opacity duration-200 flex flex-col items-center gap-2 relative" aria-label="Panier" title="Mon panier">
          <div class="relative">
            <img src="/media/branding/icons/panier.webp" alt="" class="w-8 h-8 transition-transform duration-200 hover:scale-110" width="32" height="32">
            <span class="snipcart-items-count absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"></span>
          </div>
          <span class="text-sm" data-i18n="nav.cart">Panier</span>
        </button>
      </div>
      <?php endif; ?>

      <button id="menu-close" aria-label="Fermer le menu" class="mt-8 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded transition-colors duration-200">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  </nav>
</header>
