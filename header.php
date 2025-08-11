<?php
/**  header.php  —  barre de navigation commune
 *  Usage :  <?php include 'header.php'; ?>
 *  $active (optionnel) = chaîne « index », « boutique », « contact »…
 */
$active = $active ?? '';
function navClass($key, $active) {
  return $key === $active ? 'text-indigo-400 underline' : 'hover:text-indigo-400';
}
$navItems = [
  '/index.php#produits' => [
    'slug'  => 'index',
    'label' => 'Produits',
    'i18n'  => 'nav.products'
  ],
  '/index.php#actus' => [
    'slug'  => 'index',
    'label' => 'Actualités',
    'i18n'  => 'nav.news'
  ],
  '/boutique.php' => [
    'slug'  => 'boutique',
    'label' => 'Boutique',
    'i18n'  => 'nav.shop',
    'children' => [
      '/boutique.php#pieces' => [
        'slug'  => 'boutique',
        'label' => 'Pièces',
        'i18n'  => 'nav.pieces'
      ],
      '/boutique.php#cartes' => [
        'slug'  => 'boutique',
        'label' => 'Cartes',
        'i18n'  => 'nav.cards'
      ],
      '/boutique.php#triptyques' => [
        'slug'  => 'boutique',
        'label' => 'Triptyques',
        'i18n'  => 'nav.triptychs'
      ]
    ]
  ],
  '/index.php#contact' => [
    'slug'  => 'index',
    'label' => 'Contact',
    'i18n'  => 'nav.contact'
  ]
];

$snipcartKey = $snipcartKey ?? getenv('SNIPCART_API_KEY');

function renderNav(array $items, string $active, bool $mobile = false): void {
  foreach ($items as $href => $item) {
    $class = 'txt-court font-medium transition-colors duration-200 ' . ($mobile ? 'text-lg' : 'text-sm md:text-base') . ' ' . navClass($item['slug'], $active);
    if (isset($item['children']) && !$mobile) {
      echo '<li class="relative group">';
      echo '<a href="' . $href . '" class="' . $class . ' block px-2 py-1" data-i18n="' . $item['i18n'] . '">' . $item['label'] . '</a>';
      echo '<ul class="absolute left-0 top-full hidden group-hover:flex flex-col bg-gray-900/80 p-2 rounded z-10 space-y-2">';
      renderNav($item['children'], $active, $mobile);
      echo '</ul></li>';
    } else {
      echo '<li>';
      echo '<a href="' . $href . '" class="' . $class . ' block px-2 py-1" data-i18n="' . $item['i18n'] . '">' . $item['label'] . '</a>';
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
  <div class="max-w-7xl mx-auto flex justify-between items-center p-4 md:px-6">
    <!-- Logo + Titre cliquables ensemble -->
    <a href="/index.php" class="flex items-center space-x-3 group transition-colors duration-200">
      <img src="/images/logo.png" alt="Logo Geek & Dragon" class="h-12 logo-lighten transition-transform duration-200 group-hover:scale-105">
      <h1 class="text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors duration-200">Geek & Dragon</h1>
    </a>

    <div class="flex items-center gap-6 md:gap-8">
      <!-- Bouton hamburger -->
      <button id="menu-btn" class="md:hidden text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded transition-colors duration-200" aria-controls="mobile-menu" aria-expanded="false" aria-label="Menu">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      <!-- Navigation -->
      <nav class="hidden md:block uppercase tracking-wide" aria-label="Navigation principale">
        <ul class="flex gap-8">
          <?php renderNav($navItems, $active); ?>
        </ul>
      </nav>

      <!-- Sélecteur de langue -->
      <div id="lang-switcher" class="hidden md:flex gap-2 text-xl">
        <button data-lang="fr" class="opacity-50 hover:opacity-100 transition-colors duration-200" aria-label="Français">🇫🇷</button>
        <button data-lang="en" class="opacity-50 hover:opacity-100 transition-colors duration-200" aria-label="English">🇬🇧</button>
      </div>

      <?php if ($snipcartKey): ?>
      <!-- Snipcart -->
      <button class="snipcart-checkout txt-court text-sm md:text-base uppercase tracking-wide hover:text-indigo-400 transition-colors duration-200" data-i18n="nav.cart">
        Panier
        <span class="snipcart-items-count"></span>
      </button>
      <?php endif; ?>
    </div>
  </div>
  <!-- Menu mobile -->
  <div id="menu-overlay" class="fixed inset-0 bg-black/60 hidden md:hidden z-10 opacity-0 transition-opacity duration-200"></div>
  <nav id="mobile-menu" class="fixed inset-0 z-20 bg-gray-900/95 flex flex-col items-center p-8 text-white hidden md:hidden uppercase tracking-wide transform transition-transform duration-200 translate-x-full overflow-y-auto" aria-hidden="true" aria-label="Navigation mobile">
    <button id="menu-close" aria-label="Fermer le menu" class="self-end mb-8 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded transition-colors duration-200">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
    <ul class="flex flex-col items-center gap-6">
      <?php renderNav($navItems, $active, true); ?>
    </ul>
  </nav>
</header>
