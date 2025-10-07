<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Manuscrits — Visualiseur</title>
  <meta name="description" content="Visualiseur de manuscrits littéraires">

  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="../media/branding/logos/logo.webp">

  <!-- Styles autonomes -->
  <link rel="stylesheet" href="assets/css/viewer.css?v=<?= time() ?>">

  <!-- Parser Markdown (version locale pour compatibilité CSP) -->
  <script src="assets/js/marked.min.js?v=<?= filemtime(__DIR__.'/assets/js/marked.min.js') ?>"></script>
</head>
<body>
  <div class="manuscrits-viewer">
    <!-- Header -->
    <header class="manuscrits-header">
      <h1 class="manuscrits-title">
        <span class="title-ornament">✦</span>
        Manuscrits
        <span class="title-ornament">✦</span>
      </h1>
      <p class="manuscrits-subtitle">Collections d'histoires fantastiques</p>
    </header>

    <!-- Navigation onglets (livres) -->
    <div class="manuscrits-tabs" id="bookTabs" role="tablist" aria-label="Navigation entre les livres">
      <!-- Généré dynamiquement par JavaScript -->
    </div>

    <!-- Layout principal -->
    <div class="manuscrits-layout">
      <!-- Navigation chapitres (sidebar) -->
      <nav class="manuscrits-chapters-nav" id="chaptersNav" aria-label="Navigation des chapitres">
        <div class="chapters-nav-header">
          <h2 class="chapters-nav-title">Chapitres</h2>
          <button class="chapters-nav-toggle" id="chaptersNavToggle" aria-label="Afficher/Masquer navigation" aria-expanded="true">
            <span class="icon-collapse">◀</span>
            <span class="icon-expand">▶</span>
          </button>
        </div>
        <ul class="chapters-list" id="chaptersList">
          <!-- Généré dynamiquement -->
        </ul>
      </nav>

      <!-- Contenu principal -->
      <main class="manuscrits-content" id="manuscritContent">
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>Chargement des manuscrits...</p>
        </div>
      </main>
    </div>

    <!-- Bouton retour en haut -->
    <button class="scroll-to-top" id="scrollToTop" aria-label="Retour en haut de page">
      <span class="arrow-up">↑</span>
    </button>
  </div>

  <!-- Script principal -->
  <script src="assets/js/viewer.js?v=<?= time() ?>"></script>
</body>
</html>
