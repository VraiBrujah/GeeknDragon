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

$headerNavLinks = [
  '/index.php' => [
    'slug' => 'accueil',
    'label' => 'Accueil',
    'i18n' => 'nav.home',
    'image' => '/media/ui/button/accueil.webp',
    'class' => 'header-nav-icon'
  ],
  '/boutique.php' => [
    'slug' => 'boutique',
    'label' => 'Boutique',
    'i18n' => 'nav.shop',
    'image' => '/media/ui/button/boutique.webp',
    'class' => 'header-nav-icon'
  ],
  '/boutique.php#pieces' => [
    'slug' => 'pieces',
    'label' => 'Monnaie',
    'i18n' => 'shop.hero.quickLinks.pieces',
    'image' => '/media/ui/button/piece.webp',
    'class' => 'header-nav-icon'
  ],
  '/boutique.php#cartes' => [
    'slug' => 'cartes',
    'label' => 'Cartes',
    'i18n' => 'shop.hero.quickLinks.cards',
    'image' => '/media/ui/button/carte.webp',
    'class' => 'header-nav-icon'
  ],
  '/boutique.php#triptyques' => [
    'slug' => 'triptyques',
    'label' => 'Triptyques',
    'i18n' => 'shop.hero.quickLinks.triptychs',
    'image' => '/media/ui/button/triptyque.webp',
    'class' => 'header-nav-icon'
  ],
  '/boutique.php#bundle-deluxe' => [
    'slug' => 'bundle',
    'label' => 'Coffre du Dragon',
    'i18n' => 'shop.hero.quickLinks.bundle',
    'image' => '/media/ui/button/dragon.webp',
    'class' => 'header-nav-icon'
  ],
  '/index.php#actus' => [
    'slug' => 'actus',
    'label' => 'Actualités',
    'i18n' => 'nav.news',
    'image' => '/media/ui/button/actualite.webp',
    'class' => 'header-nav-icon'
  ],
  '/aide-jeux.php' => [
    'slug' => 'aide-jeux',
    'label' => 'Aide de Jeux',
    'i18n' => 'nav.gameHelp',
    'image' => '/media/ui/button/aidejeux.webp',
    'class' => 'header-nav-icon'
  ],
  '/index.php#contact' => [
    'slug' => 'contact',
    'label' => 'Contact',
    'i18n' => 'nav.contact',
    'image' => '/media/ui/button/contact.webp',
    'class' => 'header-nav-icon'
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

<header class="header-modern backdrop-blur bg-gradient-to-r from-gray-900/80 to-gray-800/60 shadow-lg fixed top-0 w-full z-[1200] transition-all duration-300">
  <!-- LIGNE 1 : Logo + Titre | Langue + Compte + Panier -->
  <div class="header-top max-w-7xl mx-auto flex items-center justify-between p-4 md:px-6">
    <!-- Logo + Titre -->
    <a href="<?= langUrl('/index.php') ?>" class="flex items-center gap-3 group transition-all duration-200">
      <img src="/media/branding/logos/geekndragon_logo_blanc.webp" alt="Logo Geek & Dragon" class="header-logo w-12 h-12 transition-transform duration-200 group-hover:scale-105" width="48" height="48">
      <span class="site-title text-xl md:text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors duration-200">
        Geek &amp; Dragon
      </span>
    </a>

    <!-- Bouton hamburger mobile -->
    <button id="menu-btn" class="md:hidden text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded p-2" aria-controls="mobile-menu" aria-expanded="false" aria-label="Menu">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
      </svg>
    </button>

    <!-- Actions : Langue + Compte + Panier -->
    <div class="hidden md:flex items-center gap-4">
      <!-- Langue -->
      <div id="lang-switcher" class="flex items-center gap-2">
        <button type="button" data-lang="fr" class="flag-btn" aria-label="Français">
          <img src="/media/ui/flags/flag-fr-medieval-rim-on-top.svg" width="32" height="24" alt="">
        </button>
        <button type="button" data-lang="en" class="flag-btn" aria-label="English">
          <img src="/media/ui/flags/flag-en-us-uk-diagonal-medieval.svg" width="32" height="24" alt="">
        </button>
      </div>

      <?php if ($snipcartKey): ?>
      <!-- Compte + Panier côte à côte, alignés verticalement -->
      <div class="flex items-center gap-3 h-12">
        <button class="snipcart-customer-signin snipcart-btn flex items-center gap-2 hover:opacity-80 transition-opacity h-full" aria-label="Compte">
          <img src="/media/branding/icons/compte_non_connecter.webp" alt="" class="w-6 h-6 account-icon-disconnected" width="24" height="24">
          <img src="/media/branding/icons/compte_connecter.webp" alt="" class="w-6 h-6 account-icon-connected hidden" width="24" height="24">
          <span class="text-white text-sm font-medium account-label" data-i18n="nav.account">Compte</span>
        </button>

        <button class="snipcart-checkout snipcart-btn flex items-center gap-2 hover:opacity-80 transition-opacity relative h-full" aria-label="Panier">
          <img src="/media/branding/icons/panier.webp" alt="" class="w-6 h-6" width="24" height="24">
          <span class="snipcart-items-count absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"></span>
          <span class="text-white text-sm font-medium" data-i18n="nav.cart">Panier</span>
        </button>
      </div>
      <?php endif; ?>
    </div>
  </div>

  <!-- LIGNE 2 : Navigation icônes -->
  <div class="header-icon-nav border-t border-white/10 transition-all duration-300 overflow-x-auto scrollbar-thin" id="icon-nav">
    <div class="max-w-7xl mx-auto px-4 md:px-6 py-2">
      <nav class="flex items-center justify-start md:justify-center gap-2 md:gap-3 flex-nowrap" aria-label="Navigation principale">
        <?php foreach ($headerNavLinks as $href => $item): ?>
          <a href="<?= langUrl($href) ?>"
             class="header-nav-icon-btn flex-shrink-0 aspect-square w-16 md:w-20 lg:w-24 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/50"
             title="<?= __($item['i18n'], $item['label']) ?>"
             aria-label="<?= __($item['i18n'], $item['label']) ?>">
            <img src="<?= $item['image'] ?>"
                 alt="<?= __($item['i18n'], $item['label']) ?>"
                 class="w-full h-full object-cover rounded-xl"
                 loading="lazy">
          </a>
        <?php endforeach; ?>
      </nav>
    </div>
  </div>

  <!-- Menu mobile (TOUT est ensemble) -->
  <div id="menu-overlay" class="fixed inset-0 bg-black/60 hidden md:hidden z-10 opacity-0 transition-opacity duration-200"></div>
  <nav id="mobile-menu" class="fixed inset-0 z-20 bg-gray-900/95 flex flex-col items-center justify-start p-8 text-white hidden md:hidden uppercase tracking-wide transform transition-transform duration-200 translate-x-full overflow-y-auto" aria-hidden="true" aria-label="Navigation mobile">

    <!-- Langues + actions -->
    <div class="flex flex-col items-center w-full max-w-xs gap-8">
      <div class="w-full flex flex-col items-center gap-3">
        <div class="flex items-center justify-center gap-3">
        <button type="button" data-lang="fr" class="flag-btn" aria-label="Français" aria-current="false">
          <img src="/media/ui/flags/flag-fr-medieval-rim-on-top.svg" width="32" height="24" alt="">
        </button>
        <button type="button" data-lang="en" class="flag-btn" aria-label="English" aria-current="false">
          <img src="/media/ui/flags/flag-en-us-uk-diagonal-medieval.svg" width="32" height="24" alt="">
        </button>
        </div>
      </div>

      <?php if ($snipcartKey): ?>
      <div class="flex flex-col w-full gap-6 pt-2">
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
