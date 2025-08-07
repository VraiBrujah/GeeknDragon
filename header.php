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
      <!-- Navigation -->
      <nav class="hidden md:flex gap-6 uppercase tracking-wide">
        <a href="/index.php#produits"  class="txt-court <?= navClass('index',$active)  ?>">Produits</a>
        <a href="/index.php#actus"     class="txt-court <?= navClass('index',$active)  ?>">Actualités</a>
        <div class="relative group">
          <a href="/boutique.php" class="txt-court <?= navClass('boutique',$active)?>">Boutique</a>
          <div class="absolute left-0 mt-2 hidden group-hover:flex flex-col bg-gray-900/80 p-2 rounded">
            <a href="/boutique.php#cartes" class="txt-court <?= navClass('boutique',$active)?>">Cartes</a>
            <a href="/boutique.php#triptyques" class="txt-court <?= navClass('boutique',$active)?>">Triptyques</a>
          </div>
        </div>
        <a href="/index.php#contact"   class="txt-court <?= navClass('index',$active)  ?>">Contact</a>
      </nav>

      <!-- Sélecteur de langue -->
      <select id="lang-switcher" class="bg-gray-800 text-white rounded px-2 py-1">
        <option value="fr">FR</option>
        <option value="en">EN</option>
      </select>

      <!-- Panier Snipcart -->
      <button class="snipcart-checkout txt-court uppercase tracking-wide">
        Panier
        <span class="snipcart-items-count"></span>
      </button>
    </div>
  </div>
</header>
