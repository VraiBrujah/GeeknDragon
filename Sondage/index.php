<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Sondages OrIA - Système Multi-Utilisateur</title>
  <meta name="description" content="Système de sondages interactifs multi-utilisateur pour sélection de requis MVP">

  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="../media/branding/logos/logo.webp">

  <!-- Styles autonomes -->
  <link rel="stylesheet" href="assets/css/survey.css?v=<?= time() ?>">

  <!-- Parser Markdown -->
  <script src="assets/js/marked.min.js?v=<?= filemtime(__DIR__.'/assets/js/marked.min.js') ?>"></script>
</head>
<body>
  <div class="survey-viewer">
    <!-- Header -->
    <header class="survey-header">
      <h1 class="survey-title">
        <span class="title-ornament">📋</span>
        Sondages OrIA
        <span class="title-ornament">📋</span>
      </h1>
      <p class="survey-subtitle">Système multi-utilisateur de sélection des requis MVP</p>

      <!-- Gestion Utilisateurs -->
      <div class="user-manager" id="userManager">
        <!-- Affichage utilisateur actuel -->
        <div class="current-user-display" id="currentUserDisplay">
          <span class="current-user-icon">🔒</span>
          <span class="current-user-name">Aucun utilisateur</span>
          <span class="current-user-status">Lecture seule</span>
        </div>

        <!-- Boutons d'action -->
        <div class="user-actions">
          <button class="btn-select-user" id="btnSelectUser">
            <span class="icon">👥</span>
            Sélectionner
          </button>
          <button class="btn-create-user" id="btnCreateUser">
            <span class="icon">➕</span>
            Créer
          </button>
          <button class="btn-export" id="btnExport" disabled>
            <span class="icon">📥</span>
            Exporter
          </button>
        </div>
      </div>
    </header>

    <!-- Navigation onglets (sondages) -->
    <div class="survey-tabs" id="surveyTabs" role="tablist" aria-label="Navigation entre les sondages">
      <!-- Généré dynamiquement par JavaScript -->
    </div>

    <!-- Layout principal -->
    <div class="survey-layout">
      <!-- Navigation sections (sidebar) -->
      <nav class="survey-sections-nav" id="sectionsNav" aria-label="Navigation des sections">
        <div class="sections-nav-header">
          <h2 class="sections-nav-title">Sections</h2>
          <button class="sections-nav-toggle" id="sectionsNavToggle" aria-label="Afficher/Masquer navigation" aria-expanded="true">
            <span class="icon-collapse">◀</span>
            <span class="icon-expand">▶</span>
          </button>
        </div>
        <ul class="sections-list" id="sectionsList">
          <!-- Généré dynamiquement -->
        </ul>
      </nav>

      <!-- Contenu principal -->
      <main class="survey-content" id="surveyContent">
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>Chargement des sondages...</p>
        </div>
      </main>
    </div>

    <!-- Bouton retour en haut -->
    <button class="scroll-to-top" id="scrollToTop" aria-label="Retour en haut de page">
      <span class="arrow-up">↑</span>
    </button>
  </div>

  <!-- Modal Sélection Utilisateur -->
  <div class="modal" id="modalSelectUser">
    <div class="modal-overlay" id="modalSelectUserOverlay"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">👥 Sélectionner un Utilisateur</h2>
        <button class="modal-close" id="modalSelectUserClose">&times;</button>
      </div>
      <div class="modal-body">
        <p class="modal-description">Choisissez un utilisateur existant pour charger ses réponses et continuer son travail</p>

        <div class="users-list" id="usersList">
          <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Chargement des utilisateurs...</p>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" id="btnCancelSelectUser">Annuler</button>
      </div>
    </div>
  </div>

  <!-- Modal Création Utilisateur -->
  <div class="modal" id="modalCreateUser">
    <div class="modal-overlay" id="modalCreateUserOverlay"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">➕ Créer un Utilisateur</h2>
        <button class="modal-close" id="modalCreateUserClose">&times;</button>
      </div>
      <div class="modal-body">
        <p class="modal-description">Entrez votre nom pour créer un nouvel espace de travail vierge. Vous pourrez ensuite sélectionner les requis qui vous intéressent.</p>

        <div class="form-group">
          <label for="newUsername" class="form-label">Nom d'utilisateur</label>
          <input type="text" id="newUsername" class="form-input" placeholder="Ex: Mathieu" autocomplete="name" required>
          <small class="form-hint">Lettres, chiffres et tirets uniquement</small>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" id="btnCancelCreateUser">Annuler</button>
        <button class="btn-confirm" id="btnConfirmCreateUser">Créer</button>
      </div>
    </div>
  </div>

  <!-- Modal Comparaison -->
  <div class="modal modal-large" id="modalCompare">
    <div class="modal-overlay" id="modalCompareOverlay"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">🔄 Comparer les Utilisateurs</h2>
        <button class="modal-close" id="modalCompareClose">&times;</button>
      </div>
      <div class="modal-body">
        <p class="modal-description">Sélectionnez au moins 2 utilisateurs pour comparer leurs réponses côte à côte</p>

        <div class="compare-users-selection">
          <h3>Utilisateurs disponibles</h3>
          <div id="compareUsersList">
            <!-- Généré dynamiquement -->
          </div>
        </div>

        <div class="compare-results" id="compareResults">
          <!-- Résultats de comparaison affichés ici -->
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" id="btnCancelCompare">Fermer</button>
        <button class="btn-confirm" id="btnConfirmCompare">Comparer</button>
      </div>
    </div>
  </div>

  <!-- Modal Exportation -->
  <div class="modal" id="modalExport">
    <div class="modal-overlay" id="modalExportOverlay"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">📥 Exporter les Données</h2>
        <button class="modal-close" id="modalExportClose">&times;</button>
      </div>
      <div class="modal-body">
        <p class="modal-description">Exportez vos réponses au format JSON ou CSV pour analyse externe</p>

        <div class="export-options">
          <div class="export-option">
            <div class="export-option-icon">📄</div>
            <div class="export-option-info">
              <h3>Format JSON</h3>
              <p>Format structuré incluant toutes les métadonnées et réponses personnalisées</p>
            </div>
            <button class="btn-export-format" id="btnExportJSON">
              Exporter JSON
            </button>
          </div>

          <div class="export-option">
            <div class="export-option-icon">📊</div>
            <div class="export-option-info">
              <h3>Format CSV</h3>
              <p>Format tabulaire compatible Excel/LibreOffice pour analyse dans tableur</p>
            </div>
            <button class="btn-export-format" id="btnExportCSV">
              Exporter CSV
            </button>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" id="btnCancelExport">Annuler</button>
      </div>
    </div>
  </div>

  <!-- Script principal -->
  <script src="assets/js/survey.js?v=<?= time() ?>"></script>
</body>
</html>
