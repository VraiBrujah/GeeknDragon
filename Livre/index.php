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

  <!-- Parser Markdown (CDN avec fallback local) -->
  <script>
    // Tentative de chargement depuis CDN
    window.markedLoaded = false;
  </script>
  <script src="https://cdn.jsdelivr.net/npm/marked@11.0.0/marked.min.js"
          onload="window.markedLoaded = true"
          onerror="console.warn('CDN marked.js échoué, chargement fallback...')"></script>
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

  <!-- Fallback si marked.js CDN échoue -->
  <script>
    setTimeout(() => {
      if (!window.markedLoaded && typeof marked === 'undefined') {
        console.error('Marked.js non chargé. Le parsing markdown peut échouer.');
        // Affichage d'un avertissement à l'utilisateur
        const warning = document.createElement('div');
        warning.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);background:#8B0000;color:#fff;padding:1rem 2rem;border-radius:8px;z-index:9999;';
        warning.textContent = '⚠️ Erreur chargement parser markdown (CDN inaccessible)';
        document.body.appendChild(warning);

        setTimeout(() => warning.remove(), 5000);
      }
    }, 3000);
  </script>
</body>
</html>
