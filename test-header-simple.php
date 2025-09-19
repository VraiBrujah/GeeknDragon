<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Header Simple</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white">

<header class="backdrop-blur bg-gradient-to-r from-gray-900/80 to-gray-800/60 shadow-lg fixed top-0 w-full z-[1200]">
  <div class="nav-container w-full relative flex flex-wrap md:flex-nowrap items-center justify-between px-4 md:px-6 gap-4 overflow-visible">
    
    <!-- Logo -->
    <a href="/index.php" class="relative z-10 flex items-center group transition-colors duration-200 flex-shrink-0">
      <img src="/images/optimized-modern/webp/brand-geekndragon-white.webp" alt="Logo Geek &amp; Dragon" class="header-logo logo-lighten transition-transform duration-200 group-hover:scale-105 rounded" width="80" height="80">
    </a>

    <!-- Titre -->
    <div class="flex-1 px-3 sm:px-4 text-center min-w-0">
      <a href="/index.php" class="group">
        <span class="site-title inline-block text-base sm:text-2xl md:text-3xl font-semibold leading-none text-white uppercase sm:whitespace-nowrap sm:overflow-hidden sm:text-ellipsis group-hover:text-indigo-300 transition-colors duration-200">GEEK &amp; DRAGON</span>
      </a>
    </div>

    <div class="flex items-center gap-4 md:gap-8 flex-shrink-0 flex-nowrap">
      <!-- Bouton menu mobile -->
      <button id="menu-btn" class="md:hidden text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded transition-colors duration-200">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      <!-- Navigation desktop - FORCER L'AFFICHAGE -->
      <nav class="flex order-3 md:order-2 flex-1 uppercase tracking-wide text-center text-white overflow-x-auto">
        <ul class="flex flex-nowrap items-center justify-center gap-6 whitespace-nowrap">
          <li><a href="/boutique.php" class="nav-link font-medium transition-colors duration-200 whitespace-nowrap text-sm md:text-base block px-2 py-1 is-active">Boutique</a></li>
          <li><a href="/index.php#actualites" class="nav-link font-medium transition-colors duration-200 whitespace-nowrap text-sm md:text-base block px-2 py-1">Actualités</a></li>
          <li><a href="/devis.php" class="nav-link font-medium transition-colors duration-200 whitespace-nowrap text-sm md:text-base block px-2 py-1">Devis</a></li>
        </ul>
      </nav>

      <!-- Drapeaux - FORCER L'AFFICHAGE -->
      <div id="lang-switcher" class="flex items-center gap-2 order-2 md:order-3 ml-2 flex-shrink-0">
        <button type="button" data-lang="fr" class="flag-btn">
          <img src="/images/flags/flag-fr-medieval-rim-on-top.svg" width="32" height="24" alt="">
        </button>
        <button type="button" data-lang="en" class="flag-btn">
          <img src="/images/flags/flag-en-us-uk-diagonal-medieval.svg" width="32" height="24" alt="">
        </button>
      </div>

      <!-- Actions header - FORCER L'AFFICHAGE -->
      <div class="flex items-center gap-4 flex-shrink-0 order-2 md:order-3 md:ml-auto">
        <button class="flex items-center justify-center text-white hover:text-indigo-400 transition-colors duration-200">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </button>

        <button class="flex items-center justify-center gap-1 text-white hover:text-indigo-400 transition-colors duration-200">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
          </svg>
          <span class="gd-cart-badge">0</span>
        </button>
      </div>
    </div>
  </div>
</header>

<main class="pt-32 p-8">
  <h1 class="text-3xl">Test Header Simple</h1>
  <p>Ce header devrait afficher tous les éléments même sur mobile.</p>
  <p>Si tu ne vois que le logo et le titre, le problème vient des classes Tailwind CSS.</p>
</main>

</body>
</html>