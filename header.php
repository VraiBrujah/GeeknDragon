<?php
/**  header.php  —  barre de navigation commune
 *  Usage :  <?php include 'header.php'; ?>
 *  $active (optionnel) = chaîne « index », « boutique », « contact »…
 */
$active = $active ?? '';
function navClass($key, $active) {
  return $key === $active ? 'text-indigo-400 underline' : 'hover:text-indigo-400';
}
?>
<header class="backdrop-blur bg-gray-900/70 fixed top-0 w-full z-50">
  <div class="max-w-7xl mx-auto flex justify-between items-center p-4">
    <!-- Logo + Titre cliquables ensemble -->
    <a href="/index.php" class="flex items-center gap-3 group">
      <img loading="lazy" src="/images/logo.png" alt="Logo Geek & Dragon" class="h-12 logo-lighten transition-transform group-hover:scale-105">
      <h1 class="text-2xl font-bold text-white group-hover:text-indigo-300 transition">Geek & Dragon</h1>
    </a>

    <div class="flex items-center gap-6">
      <!-- Bouton hamburger -->
      <button id="menu-btn" class="md:hidden text-white focus:outline-none" aria-controls="mobile-menu" aria-expanded="false">
        <span class="sr-only">Menu</span>
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      <!-- Navigation -->
      <nav class="hidden md:flex gap-6 uppercase tracking-wide">
        <a href="/index.php#produits"  class="txt-court <?= navClass('index',$active)  ?>" data-i18n="nav.products">Produits</a>
        <a href="/index.php#actus"     class="txt-court <?= navClass('index',$active)  ?>" data-i18n="nav.news">Actualités</a>
        <div class="relative group">
          <a href="/boutique.php" class="txt-court <?= navClass('boutique',$active)?>" data-i18n="nav.shop">Boutique</a>
          <div class="absolute left-0 mt-2 hidden group-hover:flex flex-col bg-gray-900/80 p-2 rounded">
            <a href="/boutique.php#cartes" class="txt-court <?= navClass('boutique',$active)?>" data-i18n="nav.cards">Cartes</a>
            <a href="/boutique.php#triptyques" class="txt-court <?= navClass('boutique',$active)?>" data-i18n="nav.triptychs">Triptyques</a>
          </div>
        </div>
        <a href="/index.php#contact"   class="txt-court <?= navClass('index',$active)  ?>" data-i18n="nav.contact">Contact</a>
      </nav>

      <!-- Sélecteur de langue (masqué tant que les traductions ne sont pas finalisées) -->
      <select id="lang-switcher" class="bg-gray-800 text-white rounded px-2 py-1">
        <option value="fr">FR</option>
        <option value="en">EN</option>
      </select>

      <!-- Panier Snipcart -->
      <button class="snipcart-checkout txt-court uppercase tracking-wide" data-i18n="nav.cart">
        Panier
        <span class="snipcart-items-count"></span>
      </button>
    </div>
  </div>
  <!-- Menu mobile -->
  <nav id="mobile-menu" class="fixed inset-0 bg-gray-900/95 flex flex-col items-center gap-6 p-8 text-white hidden md:hidden uppercase tracking-wide" aria-hidden="true">
    <a href="/index.php#produits"  class="txt-court <?= navClass('index',$active)  ?>" data-i18n="nav.products">Produits</a>
    <a href="/index.php#actus"     class="txt-court <?= navClass('index',$active)  ?>" data-i18n="nav.news">Actualités</a>
    <a href="/boutique.php"        class="txt-court <?= navClass('boutique',$active)?>" data-i18n="nav.shop">Boutique</a>
    <a href="/boutique.php#cartes" class="txt-court <?= navClass('boutique',$active)?>" data-i18n="nav.cards">Cartes</a>
    <a href="/boutique.php#triptyques" class="txt-court <?= navClass('boutique',$active)?>" data-i18n="nav.triptychs">Triptyques</a>
    <a href="/index.php#contact"   class="txt-court <?= navClass('index',$active)  ?>" data-i18n="nav.contact">Contact</a>
  </nav>
</header>
