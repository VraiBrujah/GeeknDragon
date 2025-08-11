<?php
  // Optionnel : $active peut être défini côté serveur si tu veux marquer une page serveur
  $active = $active ?? '';
?>
<header class="bg-gray-900/80 backdrop-blur-md text-white">
  <a href="#main" class="skip-link">Aller au contenu</a>

  <div class="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap p-4 md:px-6">
    <!-- Logo / Titre -->
    <a href="/" class="flex items-center gap-3 site-title text-xl font-semibold">
      <img src="/images/geekndragon_logo_vector.svg" alt="Geek & Dragon" class="h-8 w-8 logo-lighten"/>
      <span>Geek & Dragon</span>
    </a>

    <!-- Navigation principale -->
    <nav class="order-3 md:order-2 basis-full md:basis-auto uppercase tracking-wide" aria-label="Navigation principale">
      <ul class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <li><a href="/#hero" class="hover:underline" <?php if($active==='home') echo 'aria-current="page"';?>>Accueil</a></li>
        <li><a href="/#produits" class="hover:underline">Produits</a></li>
        <li><a href="/#a-propos" class="hover:underline">À propos</a></li>
        <li><a href="/#contact" class="hover:underline">Contact</a></li>
      </ul>
    </nav>

    <!-- Sélecteur de langue (FR / EN combiné USA/UK) -->
    <div id="lang-switcher" class="order-2 md:order-3 flex items-center gap-2 ml-2">
      <button type="button" data-lang="fr" class="flag-btn" aria-label="Français" aria-current="false">
        <img src="/images/flags/flag-fr-medieval-rim-on-top.svg" width="32" height="24" alt="">
      </button>
      <button type="button" data-lang="en" class="flag-btn" aria-label="English" aria-current="false">
        <img src="/images/flags/flag-en-us-uk-diagonal-medieval.svg" width="32" height="24" alt="">
      </button>
    </div>

    <!-- Compte & Panier empilés verticalement (desktop & mobile) -->
    <div class="snipcart-stack flex flex-col items-center gap-2 order-2 md:order-3 md:ml-auto">
      <!-- Compte -->
      <button class="snipcart-btn snipcart-customer-signin" type="button" aria-label="Compte">
        <!-- icône utilisateur -->
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" role="img" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5.33 0-8 2.667-8 6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1c0-3.333-2.67-6-8-6Z"/>
        </svg>
      </button>

      <!-- Panier -->
      <button class="snipcart-btn snipcart-checkout relative" type="button" aria-label="Panier">
        <!-- icône panier -->
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" role="img" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 4h-2a1 1 0 1 0 0 2h1l1.6 8.2A2 2 0 0 0 9.56 16H17a1 1 0 0 0 0-2H9.56l-.2-1H17a2 2 0 0 0 1.96-1.6l1-5A2 2 0 0 0 18 4H7Zm11 2-1 5H9.16L8.38 6H18ZM9 18a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm8 0a2 2 0 1 0 2 2 2 2 0 0 0-2-2Z"/>
        </svg>
        <span class="snipcart-items-count" aria-hidden="true">0</span>
      </button>
    </div>
  </div>
</header>
