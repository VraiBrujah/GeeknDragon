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
    <a href="index.php" class="flex items-center gap-3 group">
      <img src="images/logo.png" alt="Logo Geek & Dragon" class="h-12 logo-lighten transition-transform group-hover:scale-105">
      <h1 class="text-2xl font-bold text-white group-hover:text-indigo-300 transition">Geek & Dragon</h1>
    </a>

    <!-- Navigation -->
    <nav class="hidden md:flex gap-6 uppercase tracking-wide">
      <a href="index.php#produits"  class="<?= navClass('index',$active)  ?>">Produits</a>
      <a href="index.php#actus"     class="<?= navClass('index',$active)  ?>">Actualités</a>
      <a href="boutique.php"        class="<?= navClass('boutique',$active)?>">Boutique</a>
      <a href="index.php#contact"   class="<?= navClass('index',$active)  ?>">Contact</a>
    </nav>
  </div>
</header>
