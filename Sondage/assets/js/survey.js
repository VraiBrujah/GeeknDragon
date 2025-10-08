/**
 * Système de sondages interactifs multi-utilisateur avec QCM
 *
 * Version 2.0.0 - Multi-utilisateur complet
 *
 * Fonctionnalités :
 * - Gestion multi-utilisateur complète
 * - Mode lecture seule sans utilisateur sélectionné
 * - Mode édition avec utilisateur actif
 * - Sauvegarde automatique par utilisateur
 * - Comparaison côte à côte de plusieurs utilisateurs
 * - Exportation JSON/CSV
 * - Ajout de critères personnalisés
 *
 * @author Brujah - Geek & Dragon
 * @version 2.0.0
 */

class SurveyViewer {
  /**
   * Constructeur du visualiseur de sondages multi-utilisateur
   */
  constructor() {
    this.surveys = [];
    this.currentSurvey = null;
    this.currentUser = null; // null = mode lecture seule
    this.users = []; // Liste des utilisateurs du sondage actuel
    this.responses = {}; // Réponses de l'utilisateur actuel
    this.customRequirements = []; // Critères ajoutés par l'utilisateur
    this.unsavedChanges = false;
    this.isReadOnly = true; // true tant qu'aucun utilisateur n'est sélectionné
    this.autoSaveTimer = null; // Timer pour debounce auto-save

    // Variables pour la gestion du header au scroll
    this.lastScrollTop = 0;
    this.scrollThreshold = 5;
    this.headerHeight = 0;

    // Éléments DOM
    this.tabsContainer = document.getElementById('surveyTabs');
    this.sectionsNav = document.getElementById('sectionsNav');
    this.sectionsList = document.getElementById('sectionsList');
    this.contentContainer = document.getElementById('surveyContent');
    this.scrollToTopBtn = document.getElementById('scrollToTop');
    this.header = document.querySelector('.survey-header');

    // Éléments gestion utilisateurs
    this.userManagerEl = document.getElementById('userManager');
    this.currentUserDisplay = document.getElementById('currentUserDisplay');
    this.btnSelectUser = document.getElementById('btnSelectUser');
    this.btnCreateUser = document.getElementById('btnCreateUser');
    this.btnCompare = document.getElementById('btnCompare');
    this.btnExport = document.getElementById('btnExport');

    // Modals
    this.modalSelectUser = document.getElementById('modalSelectUser');
    this.modalCreateUser = document.getElementById('modalCreateUser');
    this.modalCompare = document.getElementById('modalCompare');
    this.modalExport = document.getElementById('modalExport');

    this.init();
  }

  /**
   * Initialisation du système
   */
  async init() {
    try {
      // Configuration de marked.js
      if (typeof marked !== 'undefined') {
        marked.setOptions({
          breaks: true,
          gfm: true,
          headerIds: true,
          mangle: false,
          tables: true
        });
      }

      // Chargement des sondages disponibles
      await this.loadSurveys();

      // NE PAS charger automatiquement - trop lent (395KB)
      // L'utilisateur cliquera sur l'onglet pour charger
      // if (this.surveys.length > 0) {
      //   await this.switchSurvey(this.surveys[0].slug);
      // }

      // Restaurer la session utilisateur si elle existe (chargera sondage si session)
      this.restoreUserSession();

      // Initialisation des écouteurs d'événements
      this.setupEventListeners();

      // Ajuster padding pour header sticky
      this.adjustContentPaddingForHeader();

      // Recalculer au resize
      window.addEventListener('resize', () => this.adjustContentPaddingForHeader());

    } catch (error) {
      console.error('Erreur initialisation:', error);
      this.showError('Impossible de charger les sondages');
    }
  }

  /**
   * Charge la liste des sondages disponibles
   */
  async loadSurveys() {
    try {
      const response = await fetch('api.php?action=list');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur chargement sondages');
      }

      this.surveys = data.data;

      if (this.surveys.length === 0) {
        this.showError('Aucun sondage disponible');
        return;
      }

      this.renderSurveyTabs();

    } catch (error) {
      console.error('Erreur chargement sondages:', error);
      throw error;
    }
  }

  /**
   * Génère les onglets de navigation entre sondages
   */
  renderSurveyTabs() {
    this.tabsContainer.innerHTML = '';

    this.surveys.forEach(survey => {
      const button = document.createElement('button');
      button.className = 'tab-button';
      button.textContent = survey.name;
      button.dataset.surveySlug = survey.slug;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', 'false');

      button.addEventListener('click', () => this.switchSurvey(survey.slug));

      this.tabsContainer.appendChild(button);
    });
  }

  /**
   * Change le sondage affiché
   */
  async switchSurvey(surveySlug) {
    const survey = this.surveys.find(s => s.slug === surveySlug);

    if (!survey) {
      console.error('Sondage introuvable:', surveySlug);
      return;
    }

    // Vérifier changements non sauvegardés
    if (this.unsavedChanges && this.currentUser) {
      const confirm = window.confirm('Vous avez des modifications non sauvegardées. Continuer ?');
      if (!confirm) return;
    }

    this.currentSurvey = survey;
    this.currentUser = null; // Réinitialiser utilisateur
    this.users = [];
    this.responses = {};
    this.customRequirements = [];
    this.unsavedChanges = false;
    this.isReadOnly = true; // Retour en mode lecture seule

    // Mise à jour des onglets
    document.querySelectorAll('.tab-button').forEach(btn => {
      const isActive = btn.dataset.surveySlug === surveySlug;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive.toString());
    });

    // Charger les utilisateurs du sondage
    await this.loadSurveyUsers();

    // Chargement du contenu du sondage (vierge)
    await this.loadSurveyContent(survey);

    // Mettre à jour l'affichage utilisateur
    this.updateUserDisplay();
    this.updateUIState();
  }

  /**
   * Charge la liste des utilisateurs du sondage actuel
   */
  async loadSurveyUsers() {
    if (!this.currentSurvey) return;

    try {
      const response = await fetch(`api.php?action=list-users&survey=${encodeURIComponent(this.currentSurvey.name)}`);
      const data = await response.json();

      if (data.success) {
        this.users = data.data;
      } else {
        this.users = [];
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      this.users = [];
    }
  }

  /**
   * Charge le contenu d'un sondage vierge
   */
  async loadSurveyContent(survey) {
    try {
      // Afficher indicateur léger (non-bloquant)
      this.showLightLoadingIndicator();

      const fetchStart = performance.now();

      // Utiliser cache navigateur (ETag + 304)
      const response = await fetch(`api.php?action=survey&name=${encodeURIComponent(survey.name)}`, {
        cache: 'default', // Utilise cache HTTP (ETag)
        headers: {
          'Cache-Control': 'max-age=3600' // 1h cache
        }
      });

      const fetchTime = (performance.now() - fetchStart).toFixed(0);
      console.log(`📡 Fetch sondage: ${fetchTime}ms (${response.status === 304 ? 'Cache HTTP' : response.status})`);

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur chargement sondage');
      }

      const content = data.data.content;

      // Parser et afficher le contenu (ATTENDRE car async)
      await this.renderSurvey(content);

      // Générer navigation sections APRÈS rendu complet
      this.generateSectionsNav();

      // Activer lazy loading pour les tableaux
      this.setupLazyLoadingSections();

      // Masquer indicateur
      this.hideLightLoadingIndicator();

    } catch (error) {
      console.error('Erreur chargement sondage:', error);
      this.hideLightLoadingIndicator();
      this.showError('Impossible de charger le sondage');
    }
  }

  /**
   * Affiche le contenu du sondage avec parsing Markdown (VERSION ULTRA-RAPIDE)
   */
  async renderSurvey(markdownContent) {
    console.time('⏱️ Total Rendering');
    const startTime = performance.now();

    // ÉTAPE 1: Vérifier cache d'abord
    const cacheKey = `survey_${this.currentSurvey.slug}_${this.currentSurvey.modified}`;
    const cached = await this.loadFromCache(cacheKey);

    let html;
    if (cached) {
      console.log('✅ Cache HIT - Chargement instantané');
      html = cached;
    } else {
      console.time('⏱️ Parse Markdown');
      html = marked.parse(markdownContent);
      console.timeEnd('⏱️ Parse Markdown');

      // Sauvegarder en cache pour prochaine fois
      this.saveToCache(cacheKey, html);
    }

    // ÉTAPE 2: Afficher HTML brut IMMÉDIATEMENT (sans conversion)
    console.time('⏱️ Render DOM Initial');
    this.contentContainer.innerHTML = html;
    console.timeEnd('⏱️ Render DOM Initial');

    console.log(`🚀 Contenu visible en ${(performance.now() - startTime).toFixed(0)}ms`);
    console.timeEnd('⏱️ Total Rendering');

    // ÉTAPE 3: Convertir tableaux IMMÉDIATEMENT (pas de requestAnimationFrame qui lag)
    // requestAnimationFrame(() => { ← SUPPRIMÉ (cause 4s lag avec extensions Chrome)
    this.convertTablesAsync();
    // });

    // Afficher message si mode lecture seule
    if (this.isReadOnly) {
      this.showReadOnlyBanner();
    }
  }

  /**
   * Conversion asynchrone des tableaux (non-bloquante)
   */
  async convertTablesAsync() {
    console.log('🔄 Début conversion asynchrone...');
    const tables = this.contentContainer.querySelectorAll('table');
    const tablesArray = Array.from(tables);

    // Filtrer tableaux avec colonne MVP
    const requirementTables = tablesArray.filter(table => {
      const firstRow = table.querySelector('tbody tr');
      if (!firstRow) return false;

      const hasMVPColumn = Array.from(table.querySelectorAll('thead th')).some(th =>
        th.textContent.includes('MVP')
      );

      return hasMVPColumn;
    });

    console.log(`📊 ${requirementTables.length} tableaux de requis détectés`);

    // Convertir SEULEMENT le premier tableau immédiatement
    if (requirementTables.length > 0) {
      console.time('⏱️ Conversion tableau #0');
      requirementTables[0].classList.add('requirements-table');
      this.convertSingleTable(requirementTables[0]);
      console.timeEnd('⏱️ Conversion tableau #0');
      console.log('✅ Premier tableau prêt');
    }

    // Tous les autres en lazy loading
    for (let i = 1; i < requirementTables.length; i++) {
      const table = requirementTables[i];
      table.classList.add('requirements-table', 'lazy-table-pending');
      table.dataset.lazyIndex = i;

      // Placeholder
      const placeholder = document.createElement('div');
      placeholder.className = 'lazy-table-placeholder';
      placeholder.innerHTML = `
        <div class="lazy-spinner"></div>
        <p>Tableau ${i + 1}/${requirementTables.length} - Chargement au scroll...</p>
      `;
      table.style.position = 'relative';
      table.insertBefore(placeholder, table.firstChild);
    }

    // Setup IntersectionObserver
    this.setupLazyTableConversion();
  }

  /**
   * Affiche une bannière indiquant le mode lecture seule
   */
  showReadOnlyBanner() {
    // Ne plus afficher la bannière redondante
    // Les boutons sont déjà dans le header
  }

  /**
   * Charge HTML depuis le cache (LocalStorage pour l'instant, IndexedDB plus tard)
   */
  async loadFromCache(key) {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        console.log(`💾 Cache hit: ${key}`);
        return cached;
      }
    } catch (e) {
      console.warn('Cache read error:', e);
    }
    return null;
  }

  /**
   * Sauvegarde HTML en cache
   */
  async saveToCache(key, html) {
    try {
      localStorage.setItem(key, html);
      console.log(`💾 Cache saved: ${key} (${(html.length / 1024).toFixed(1)}KB)`);
    } catch (e) {
      console.warn('Cache write error (quota exceeded?):', e);
      // Si quota dépassé, nettoyer vieux caches
      this.cleanOldCaches();
    }
  }

  /**
   * Nettoie les vieux caches pour libérer de l'espace
   */
  cleanOldCaches() {
    try {
      const keys = Object.keys(localStorage);
      const surveyKeys = keys.filter(k => k.startsWith('survey_'));

      // Garder seulement les 3 plus récents
      if (surveyKeys.length > 3) {
        surveyKeys.slice(0, -3).forEach(k => localStorage.removeItem(k));
        console.log(`🗑️ Nettoyé ${surveyKeys.length - 3} anciens caches`);
      }
    } catch (e) {
      console.warn('Cache cleanup error:', e);
    }
  }

  /**
   * Convertit un seul tableau en QCM (appelé immédiatement ou en lazy)
   */
  convertSingleTable(table) {
    const rows = table.querySelectorAll('tbody tr');

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 3) return;

      const reqID = cells[0].textContent.trim();

      // Cellule MVP
      if (cells[2]) {
        cells[2].innerHTML = this.createCheckbox(reqID, 'mvp');
      }

      // Cellules rôles (3 à 8)
      for (let i = 3; i <= 8 && i < cells.length - 3; i++) {
        const roleCell = cells[i];
        const roleIndex = i - 3;
        const roleName = this.getRoleName(roleIndex);

        const actions = ['C', 'L', 'E', 'S', 'X', 'V'];
        let checkboxesHTML = '';

        actions.forEach(action => {
          checkboxesHTML += this.createCheckbox(reqID, `role_${roleName}_${action}`, action);
        });

        roleCell.innerHTML = checkboxesHTML;
      }

      // Cellule Priorité (9)
      const priorityCell = cells[9];
      if (priorityCell) {
        priorityCell.innerHTML = this.createPriorityField(reqID);
      }

      // Cellule Notes (dernière)
      const notesCell = cells[cells.length - 1];
      if (notesCell) {
        notesCell.innerHTML = this.createNotesField(reqID);
      }
    });

    // Marquer comme converti
    table.classList.remove('lazy-table-pending');
    table.classList.add('lazy-table-converted');

    // Retirer le placeholder si présent
    const placeholder = table.querySelector('.lazy-table-placeholder');
    if (placeholder) {
      placeholder.remove();
    }

    // Attacher les listeners pour CE tableau uniquement
    this.attachCheckboxListenersForTable(table);

    // Si un utilisateur est chargé, appliquer ses réponses sur ce tableau
    if (this.currentUser && Object.keys(this.responses).length > 0) {
      this.applyResponsesToTable(table);
    }
  }

  /**
   * Applique les réponses sur un tableau spécifique (pour lazy loading)
   */
  applyResponsesToTable(table) {
    let appliedInTable = 0;

    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 3) return;

      const reqID = cells[0].textContent.trim();
      const reqResponses = this.responses[reqID];

      if (!reqResponses) return;

      Object.keys(reqResponses).forEach(field => {
        const value = reqResponses[field];
        const elementId = `${reqID}_${field}`;
        const element = document.getElementById(elementId);

        if (element) {
          if (element.type === 'checkbox') {
            element.checked = value;
          } else if (element.type === 'number' || element.tagName === 'INPUT') {
            element.value = value;
          } else if (element.tagName === 'TEXTAREA') {
            element.value = value;
          }
          appliedInTable++;
        }
      });
    });

    if (appliedInTable > 0) {
      console.log(`📝 ${appliedInTable} réponses appliquées sur tableau lazy converti`);
    }
  }

  /**
   * Attache les listeners pour un tableau spécifique (optimisation lazy)
   */
  attachCheckboxListenersForTable(table) {
    // Gérer les checkboxes
    const checkboxes = table.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        if (this.isReadOnly) {
          e.preventDefault();
          return;
        }

        const reqID = e.target.dataset.req;
        const field = e.target.dataset.field;
        const checked = e.target.checked;

        if (!this.responses[reqID]) {
          this.responses[reqID] = {};
        }

        this.responses[reqID][field] = checked;
        this.unsavedChanges = true;
        this.debouncedAutoSave();

        // Mettre à jour stats MVP si c'est une checkbox MVP
        if (field === 'mvp') {
          this.updateMVPStats();
        }
      });
    });

    // Gérer les champs de priorité
    const priorityFields = table.querySelectorAll('input.priority-field');

    priorityFields.forEach(field => {
      field.addEventListener('input', (e) => {
        if (this.isReadOnly) {
          e.preventDefault();
          return;
        }

        const reqID = e.target.dataset.req;
        const fieldName = e.target.dataset.field;
        let value = parseInt(e.target.value, 10);

        if (value < 1) value = 1;
        if (value > 10) value = 10;
        if (isNaN(value)) value = '';

        if (value !== '' && e.target.value !== value.toString()) {
          e.target.value = value;
        }

        if (!this.responses[reqID]) {
          this.responses[reqID] = {};
        }

        this.responses[reqID][fieldName] = value;
        this.unsavedChanges = true;
        this.debouncedAutoSave();
      });
    });

    // Gérer les champs de notes
    const notesFields = table.querySelectorAll('textarea.notes-field');

    notesFields.forEach(field => {
      field.addEventListener('input', (e) => {
        if (this.isReadOnly) {
          e.preventDefault();
          return;
        }

        const reqID = e.target.dataset.req;
        const fieldName = e.target.dataset.field;
        const value = e.target.value;

        if (!this.responses[reqID]) {
          this.responses[reqID] = {};
        }

        this.responses[reqID][fieldName] = value;
        this.unsavedChanges = true;
        this.debouncedAutoSave();
      });
    });
  }

  /**
   * Crée une case à cocher interactive
   */
  createCheckbox(reqID, field, label = '') {
    const id = `${reqID}_${field}`;
    const checked = this.responses[reqID]?.[field] ? 'checked' : '';
    const disabled = this.isReadOnly ? 'disabled' : '';

    return `
      <label class="qcm-checkbox ${this.isReadOnly ? 'readonly' : ''}">
        <input
          type="checkbox"
          id="${id}"
          data-req="${reqID}"
          data-field="${field}"
          ${checked}
          ${disabled}
        >
        <span class="checkbox-label">${label}</span>
      </label>
    `;
  }

  /**
   * Crée un champ de priorité (input number)
   */
  createPriorityField(reqID) {
    const id = `${reqID}_priority`;
    const value = this.responses[reqID]?.priority || '';
    const disabled = this.isReadOnly ? 'disabled' : '';

    return `
      <input
        type="number"
        id="${id}"
        class="priority-field ${this.isReadOnly ? 'readonly' : ''}"
        data-req="${reqID}"
        data-field="priority"
        min="1"
        max="10"
        placeholder="1-10"
        value="${this.escapeHtml(value)}"
        ${disabled}
      >
    `;
  }

  /**
   * Crée un champ de notes (textarea)
   */
  createNotesField(reqID) {
    const id = `${reqID}_notes`;
    const value = this.responses[reqID]?.notes || '';
    const disabled = this.isReadOnly ? 'disabled' : '';

    return `
      <textarea
        id="${id}"
        class="notes-field ${this.isReadOnly ? 'readonly' : ''}"
        data-req="${reqID}"
        data-field="notes"
        placeholder="Notes personnelles..."
        rows="2"
        ${disabled}
      >${this.escapeHtml(value)}</textarea>
    `;
  }

  /**
   * Récupère le nom du rôle par index
   */
  getRoleName(index) {
    const roles = ['Admin', 'Gestionnaire', 'Superviseur', 'Employe', 'Patient', 'Famille'];
    return roles[index] || 'Unknown';
  }

  /**
   * Attache les événements aux cases à cocher et champs de notes
   */
  attachCheckboxListeners() {
    // Gérer les checkboxes
    const checkboxes = this.contentContainer.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        // Ne rien faire en mode lecture seule
        if (this.isReadOnly) {
          e.preventDefault();
          return;
        }

        const reqID = e.target.dataset.req;
        const field = e.target.dataset.field;
        const checked = e.target.checked;

        // Mettre à jour les réponses
        if (!this.responses[reqID]) {
          this.responses[reqID] = {};
        }

        this.responses[reqID][field] = checked;

        // Marquer comme non sauvegardé et déclencher auto-save
        this.unsavedChanges = true;
        this.debouncedAutoSave();
      });
    });

    // Gérer les champs de priorité (input number)
    const priorityFields = this.contentContainer.querySelectorAll('input.priority-field');

    priorityFields.forEach(field => {
      field.addEventListener('input', (e) => {
        if (this.isReadOnly) {
          e.preventDefault();
          return;
        }

        const reqID = e.target.dataset.req;
        const fieldName = e.target.dataset.field;
        let value = parseInt(e.target.value, 10);

        // Valider la plage 1-10
        if (value < 1) value = 1;
        if (value > 10) value = 10;
        if (isNaN(value)) value = '';

        // Mettre à jour le champ si nécessaire
        if (value !== '' && e.target.value !== value.toString()) {
          e.target.value = value;
        }

        // Mettre à jour les réponses
        if (!this.responses[reqID]) {
          this.responses[reqID] = {};
        }

        this.responses[reqID][fieldName] = value;

        // Marquer comme non sauvegardé et déclencher auto-save
        this.unsavedChanges = true;
        this.debouncedAutoSave();
      });
    });

    // Gérer les champs de notes (textarea)
    const notesFields = this.contentContainer.querySelectorAll('textarea.notes-field');

    notesFields.forEach(field => {
      field.addEventListener('input', (e) => {
        if (this.isReadOnly) {
          e.preventDefault();
          return;
        }

        const reqID = e.target.dataset.req;
        const fieldName = e.target.dataset.field;
        const value = e.target.value;

        // Mettre à jour les réponses
        if (!this.responses[reqID]) {
          this.responses[reqID] = {};
        }

        this.responses[reqID][fieldName] = value;

        // Marquer comme non sauvegardé et déclencher auto-save
        this.unsavedChanges = true;
        this.debouncedAutoSave();
      });
    });
  }

  /**
   * Auto-save avec debounce (2 secondes)
   */
  debouncedAutoSave() {
    clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => {
      if (this.currentUser && this.unsavedChanges) {
        this.autoSaveUserData();
      }
    }, 2000); // 2 secondes délai
  }

  /**
   * Sauvegarde automatique silencieuse
   */
  async autoSaveUserData() {
    if (!this.currentUser || !this.currentSurvey) return;

    try {
      // Forcer la conversion en objet simple
      const responsesClean = {};
      Object.keys(this.responses).forEach(key => {
        responsesClean[key] = {...this.responses[key]};
      });

      const payload = {
        survey: this.currentSurvey.name,
        user: this.currentUser,
        responses: responsesClean,
        custom_requirements: this.customRequirements
      };

      const response = await fetch('api.php?action=save-user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        this.unsavedChanges = false;
        this.showAutoSaveIndicator('Sauvegardé automatiquement');
      }
    } catch (error) {
      console.error('Erreur auto-save:', error);
      this.showAutoSaveIndicator('Erreur sauvegarde', true);
    }
  }

  /**
   * Affiche indicateur auto-save temporaire (masqué par défaut)
   */
  showAutoSaveIndicator(message, isError = false) {
    // Ne rien faire - indicateurs désactivés
    return;
  }

  /**
   * Affiche overlay de chargement plein écran
   */
  showLoadingOverlay(message = 'Chargement...') {
    // Créer overlay s'il n'existe pas
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'loadingOverlay';
      overlay.className = 'loading-overlay';
      overlay.innerHTML = `
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p class="loading-message">${message}</p>
        </div>
      `;
      document.body.appendChild(overlay);
    } else {
      overlay.querySelector('.loading-message').textContent = message;
    }

    // Afficher avec animation
    setTimeout(() => overlay.classList.add('visible'), 10);
  }

  /**
   * Masque overlay de chargement
   */
  hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 300);
    }
  }

  /**
   * Génère la navigation des sections
   */
  generateSectionsNav() {
    const headers = this.contentContainer.querySelectorAll('h2, h3');
    this.sectionsList.innerHTML = '';

    headers.forEach((header, index) => {
      if (!header.id) {
        header.id = `section-${index}`;
      }

      const li = document.createElement('li');
      const link = document.createElement('a');

      link.href = `#${header.id}`;
      link.className = 'section-link';
      link.dataset.sectionId = header.id;

      if (header.tagName === 'H3') {
        link.classList.add('subsection');
      }

      link.textContent = header.textContent;

      link.addEventListener('click', (e) => {
        e.preventDefault();
        header.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      li.appendChild(link);
      this.sectionsList.appendChild(li);
    });
  }

  /**
   * Ouvre le modal de sélection d'utilisateur
   */
  async openSelectUserModal() {
    if (!this.currentSurvey) {
      alert('Aucun sondage sélectionné');
      return;
    }

    // Recharger la liste des utilisateurs
    await this.loadSurveyUsers();

    // Afficher le modal
    this.modalSelectUser.classList.add('active');

    // Remplir la liste
    const listContainer = document.getElementById('usersList');
    listContainer.innerHTML = '';

    if (this.users.length === 0) {
      listContainer.innerHTML = '<p class="no-data">Aucun utilisateur pour ce sondage. Créez-en un !</p>';
      return;
    }

    const ul = document.createElement('ul');
    ul.className = 'users-list-items';

    this.users.forEach(user => {
      const li = document.createElement('li');
      li.className = 'user-list-item';

      // Gérer les deux formats possibles: timestamp ou date ISO
      let date;
      if (typeof user.modified_at === 'number') {
        date = new Date(user.modified_at * 1000);
      } else {
        date = new Date(user.modified_at);
      }

      const dateStr = date.toLocaleString('fr-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      li.innerHTML = `
        <div class="user-info">
          <strong class="user-name">👤 ${this.escapeHtml(user.username)}</strong>
          <span class="user-stats">📊 ${user.response_count} réponses</span>
          <span class="user-date">🕐 ${dateStr}</span>
        </div>
        <div class="user-actions">
          <button class="btn-select-this-user" data-username="${this.escapeHtml(user.username)}">
            ✓ Sélectionner
          </button>
          <button class="btn-delete-user" data-username="${this.escapeHtml(user.username)}">
            🗑️
          </button>
        </div>
      `;

      ul.appendChild(li);
    });

    listContainer.appendChild(ul);

    // Attacher événements
    this.attachUserListListeners();
  }

  /**
   * Attache les événements de la liste d'utilisateurs
   */
  attachUserListListeners() {
    // Boutons Sélectionner
    document.querySelectorAll('.btn-select-this-user').forEach(btn => {
      btn.addEventListener('click', async () => {
        const username = btn.dataset.username;
        await this.selectUser(username);
      });
    });

    // Boutons Supprimer
    document.querySelectorAll('.btn-delete-user').forEach(btn => {
      btn.addEventListener('click', async () => {
        const username = btn.dataset.username;
        if (confirm(`Supprimer l'utilisateur "${username}" et toutes ses réponses ?`)) {
          await this.deleteUser(username);
        }
      });
    });
  }

  /**
   * Ferme le modal de sélection d'utilisateur
   */
  closeSelectUserModal() {
    this.modalSelectUser.classList.remove('active');
  }

  /**
   * Sélectionne un utilisateur et charge ses données
   */
  async selectUser(username) {
    if (!this.currentSurvey) return;

    // NE PAS afficher overlay - bloque UI inutilement
    // this.showLoadingOverlay('Chargement de l\'utilisateur...'); ← SUPPRIMÉ

    const startTime = performance.now();

    try {
      const response = await fetch(`api.php?action=user-data&survey=${encodeURIComponent(this.currentSurvey.name)}&user=${encodeURIComponent(username)}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur chargement utilisateur');
      }

      const userData = data.data;

      // Mettre à jour l'état
      this.currentUser = userData.username;

      // Forcer la conversion en objet (car PHP peut retourner un array)
      if (Array.isArray(userData.responses)) {
        this.responses = {};
        Object.keys(userData.responses).forEach(key => {
          this.responses[key] = userData.responses[key];
        });
      } else {
        this.responses = userData.responses || {};
      }

      this.customRequirements = userData.custom_requirements || [];
      this.unsavedChanges = false;
      this.isReadOnly = false; // Passer en mode édition

      // Sauvegarder la session utilisateur
      this.saveUserSession();

      // Vérifier si le contenu du sondage est déjà chargé
      const contentExists = this.contentContainer.querySelector('table.requirements-table') !== null;

      if (!contentExists) {
        // Première fois ou pas de contenu - charger le sondage
        console.log('🔄 Chargement initial du sondage pour nouvel utilisateur');
        await this.loadSurveyContent(this.currentSurvey);
      } else {
        // Contenu déjà chargé - juste appliquer les réponses (rapide)
        this.applyResponsesToUI();
      }

      // Mettre à jour l'affichage
      this.updateUserDisplay();
      this.updateUIState();

      // Mettre à jour les statistiques MVP
      this.updateMVPStats();

      // Fermer le modal
      this.closeSelectUserModal();

      const totalTime = (performance.now() - startTime).toFixed(0);
      console.log(`⚡ Utilisateur "${username}" sélectionné en ${totalTime}ms - ${Object.keys(this.responses).length} requis chargés`);

    } catch (error) {
      console.error('Erreur sélection utilisateur:', error);
      alert('❌ Erreur : ' + error.message);
    }
  }

  /**
   * Applique les réponses chargées à l'interface
   */
  applyResponsesToUI() {
    let appliedCount = 0;
    let notFoundCount = 0;

    Object.keys(this.responses).forEach(reqID => {
      const reqResponses = this.responses[reqID];

      Object.keys(reqResponses).forEach(field => {
        const value = reqResponses[field];
        const elementId = `${reqID}_${field}`;
        const element = document.getElementById(elementId);

        if (element) {
          if (element.type === 'checkbox') {
            element.checked = value;
            element.disabled = false;
          } else if (element.type === 'number' || element.tagName === 'INPUT') {
            element.value = value;
            element.disabled = false;
          } else if (element.tagName === 'TEXTAREA') {
            element.value = value;
            element.disabled = false;
          }
          appliedCount++;
        } else {
          notFoundCount++;
        }
      });
    });

    console.log(`📝 Réponses appliquées: ${appliedCount} trouvés, ${notFoundCount} en attente (tableaux lazy)`);
  }

  /**
   * Sauvegarde la session utilisateur dans sessionStorage
   */
  saveUserSession() {
    if (this.currentUser && this.currentSurvey) {
      sessionStorage.setItem('oria_current_survey', this.currentSurvey.name);
      sessionStorage.setItem('oria_current_user', this.currentUser);
    }
  }

  /**
   * Restaure la session utilisateur depuis sessionStorage
   */
  async restoreUserSession() {
    const savedSurvey = sessionStorage.getItem('oria_current_survey');
    const savedUser = sessionStorage.getItem('oria_current_user');

    if (savedSurvey && savedUser) {
      // Session existe - charger le sondage automatiquement
      const survey = this.surveys.find(s => s.name === savedSurvey);

      if (survey) {
        await this.switchSurvey(survey.slug);
        try {
          await this.selectUser(savedUser);
        } catch (error) {
          console.error('Erreur restauration session:', error);
          this.clearUserSession();
        }
      }
    } else if (this.surveys.length > 0) {
      // Pas de session - afficher message de bienvenue
      this.showWelcomeMessage();
    }
  }

  /**
   * Affiche message de bienvenue (pas de sondage chargé)
   */
  showWelcomeMessage() {
    this.contentContainer.innerHTML = `
      <div style="text-align: center; padding: 4rem 2rem; max-width: 600px; margin: 0 auto;">
        <h2 style="font-size: 2rem; color: var(--color-primary); margin-bottom: 1.5rem;">
          👋 Bienvenue
        </h2>
        <p style="font-size: 1.125rem; color: var(--color-text); margin-bottom: 2rem; line-height: 1.6;">
          Cliquez sur un onglet ci-dessus pour charger un sondage
        </p>
        <div style="background: var(--color-bg-alt); border-radius: 0.75rem; padding: 1.5rem; border-left: 4px solid var(--color-primary);">
          <p style="font-size: 0.9375rem; color: var(--color-text-light); margin: 0;">
            💡 <strong>Astuce:</strong> Vos réponses sont sauvegardées automatiquement toutes les 2 secondes
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Affiche indicateur de chargement léger (non-bloquant)
   */
  showLightLoadingIndicator() {
    this.contentContainer.innerHTML = `
      <div style="text-align: center; padding: 3rem 2rem;">
        <div style="display: inline-block; width: 48px; height: 48px; border: 4px solid #e5e7eb; border-top-color: var(--color-primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <p style="margin-top: 1.5rem; font-size: 1.125rem; color: var(--color-text);">
          Chargement du sondage...
        </p>
      </div>
    `;
  }

  /**
   * Masque indicateur de chargement léger
   */
  hideLightLoadingIndicator() {
    // Ne rien faire - le contenu sera remplacé par renderSurvey()
  }

  /**
   * Efface la session utilisateur
   */
  clearUserSession() {
    sessionStorage.removeItem('oria_current_survey');
    sessionStorage.removeItem('oria_current_user');
  }

  /**
   * Déconnecte l'utilisateur actuel
   */
  logoutUser() {
    if (this.unsavedChanges) {
      const confirm = window.confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment vous déconnecter ?');
      if (!confirm) return;
    }

    this.currentUser = null;
    this.responses = {};
    this.customRequirements = [];
    this.unsavedChanges = false;
    this.isReadOnly = true;

    this.clearUserSession();

    // Recharger le sondage en mode lecture seule
    this.loadSurveyContent(this.currentSurvey);
    this.updateUserDisplay();
    this.updateUIState();

    alert('✓ Déconnexion réussie');
  }

  /**
   * Ouvre le modal de création d'utilisateur
   */
  openCreateUserModal() {
    if (!this.currentSurvey) {
      alert('Aucun sondage sélectionné');
      return;
    }

    this.modalCreateUser.classList.add('active');
    document.getElementById('newUsername').value = '';
    document.getElementById('newUsername').focus();
  }

  /**
   * Ferme le modal de création d'utilisateur
   */
  closeCreateUserModal() {
    this.modalCreateUser.classList.remove('active');
  }

  /**
   * Crée un nouvel utilisateur
   */
  async createUser() {
    const username = document.getElementById('newUsername').value.trim();

    if (!username) {
      alert('Veuillez entrer un nom d\'utilisateur');
      return;
    }

    if (!this.currentSurvey) {
      alert('Aucun sondage sélectionné');
      return;
    }

    try {
      const response = await fetch('api.php?action=create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          survey: this.currentSurvey.name,
          username: username
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur création utilisateur');
      }

      // Fermer le modal
      this.closeCreateUserModal();

      // Sélectionner automatiquement le nouvel utilisateur
      await this.selectUser(username);

    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      alert('❌ Erreur : ' + error.message);
    }
  }

  /**
   * Supprime un utilisateur
   */
  async deleteUser(username) {
    if (!this.currentSurvey) return;

    try {
      const response = await fetch(`api.php?action=delete-user&survey=${encodeURIComponent(this.currentSurvey.name)}&user=${encodeURIComponent(username)}`, {
        method: 'POST'
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur suppression');
      }

      alert('✓ Utilisateur supprimé');

      // Si l'utilisateur supprimé est l'utilisateur actuel, recharger la page
      if (this.currentUser === username) {
        location.reload();
      } else {
        // Sinon, juste recharger la liste
        await this.loadSurveyUsers();
        await this.openSelectUserModal();
      }

    } catch (error) {
      console.error('Erreur suppression utilisateur:', error);
      alert('❌ Erreur : ' + error.message);
    }
  }

  /**
   * Sauvegarde les données de l'utilisateur actuel
   */
  async saveUserData() {
    console.log('=== [SAVE] Début sauvegarde ===');
    console.log('[SAVE] Utilisateur:', this.currentUser);
    console.log('[SAVE] Sondage:', this.currentSurvey?.name);
    console.log('[SAVE] Nombre de réponses:', Object.keys(this.responses).length);
    console.log('[SAVE] Contenu réponses:', this.responses);
    console.log('[SAVE] Type de this.responses:', typeof this.responses);
    console.log('[SAVE] Is Array?:', Array.isArray(this.responses));
    console.log('[SAVE] Constructor:', this.responses?.constructor?.name);
    console.log('[SAVE] Keys:', Object.keys(this.responses));
    console.log('[SAVE] JSON stringified direct:', JSON.stringify(this.responses));

    if (!this.currentUser || !this.currentSurvey) {
      console.error('[SAVE] Aucun utilisateur ou sondage sélectionné');
      alert('Aucun utilisateur sélectionné');
      return;
    }

    try {
      // Forcer la conversion en objet simple
      const responsesClean = {};
      Object.keys(this.responses).forEach(key => {
        responsesClean[key] = {...this.responses[key]};
      });

      const payload = {
        survey: this.currentSurvey.name,
        user: this.currentUser,
        responses: responsesClean,
        custom_requirements: this.customRequirements
      };

      const response = await fetch('api.php?action=save-user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur sauvegarde');
      }

      this.unsavedChanges = false;

      alert('✓ Données sauvegardées');

    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('❌ Erreur : ' + error.message);
    }
  }

  /**
   * Met à jour l'affichage de l'utilisateur actuel
   */
  updateUserDisplay() {
    if (this.currentUser) {
      this.currentUserDisplay.innerHTML = `
        <span class="current-user-icon">👤</span>
        <span class="current-user-name">${this.escapeHtml(this.currentUser)}</span>
        <span class="current-user-status">✓ Actif</span>
        <button class="btn-logout" id="btnLogout" title="Déconnexion">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Déconnexion
        </button>
      `;
      this.currentUserDisplay.classList.add('active');

      // Attacher événement déconnexion
      document.getElementById('btnLogout')?.addEventListener('click', () => this.logoutUser());
    } else {
      this.currentUserDisplay.innerHTML = `
        <span class="current-user-icon">🔒</span>
        <span class="current-user-name">Aucun utilisateur</span>
        <span class="current-user-status">Lecture seule</span>
      `;
      this.currentUserDisplay.classList.remove('active');
    }
  }

  /**
   * Met à jour l'état de l'interface selon le mode
   */
  updateUIState() {
    // Activer/désactiver les boutons
    if (this.btnCompare) {
      this.btnCompare.disabled = this.users.length < 2;
    }
    this.btnExport.disabled = this.isReadOnly;

    // Ajouter/retirer classe au conteneur
    if (this.isReadOnly) {
      this.contentContainer.classList.add('readonly-mode');
    } else {
      this.contentContainer.classList.remove('readonly-mode');
    }
  }

  /**
   * Ouvre le modal de comparaison
   */
  async openCompareModal() {
    if (!this.currentSurvey || this.users.length < 2) {
      alert('Il faut au moins 2 utilisateurs pour comparer');
      return;
    }

    this.modalCompare.classList.add('active');

    // Afficher liste de sélection
    const listContainer = document.getElementById('compareUsersList');
    listContainer.innerHTML = '';

    const form = document.createElement('form');
    form.id = 'compareUsersForm';

    this.users.forEach(user => {
      const label = document.createElement('label');
      label.className = 'compare-user-item';
      label.innerHTML = `
        <input type="checkbox" name="compareUsers" value="${this.escapeHtml(user.username)}">
        <span>${this.escapeHtml(user.username)} (${user.response_count} réponses)</span>
      `;
      form.appendChild(label);
    });

    listContainer.appendChild(form);
  }

  /**
   * Ferme le modal de comparaison
   */
  closeCompareModal() {
    this.modalCompare.classList.remove('active');
  }

  /**
   * Lance la comparaison des utilisateurs sélectionnés
   */
  async performComparison() {
    const form = document.getElementById('compareUsersForm');
    const selected = Array.from(form.querySelectorAll('input[name="compareUsers"]:checked')).map(cb => cb.value);

    if (selected.length < 2) {
      alert('Sélectionnez au moins 2 utilisateurs');
      return;
    }

    try {
      const params = new URLSearchParams({
        survey: this.currentSurvey.name
      });
      selected.forEach(u => params.append('users[]', u));

      const response = await fetch(`api.php?action=compare&${params.toString()}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur comparaison');
      }

      // Afficher les résultats
      this.displayComparisonResults(data.data);

    } catch (error) {
      console.error('Erreur comparaison:', error);
      alert('❌ Erreur : ' + error.message);
    }
  }

  /**
   * Affiche les résultats de comparaison
   */
  displayComparisonResults(comparison) {
    const resultsContainer = document.getElementById('compareResults');
    resultsContainer.innerHTML = '';

    // Construire tableau de comparaison
    let html = '<div class="comparison-table-wrapper"><table class="comparison-table"><thead><tr>';
    html += '<th>ID Requis</th>';
    comparison.forEach(user => {
      html += `<th>${this.escapeHtml(user.username)}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Collecter tous les requis
    const allReqIds = new Set();
    comparison.forEach(user => {
      Object.keys(user.responses).forEach(reqId => allReqIds.add(reqId));
    });

    // Pour chaque requis
    Array.from(allReqIds).sort().forEach(reqId => {
      html += `<tr><td class="req-id">${reqId}</td>`;

      comparison.forEach(user => {
        const response = user.responses[reqId];
        const mvp = response?.mvp ? '✓ MVP' : '';
        const responseCount = response ? Object.values(response).filter(v => v === true).length : 0;

        html += `<td class="comparison-cell ${response?.mvp ? 'has-mvp' : ''}">`;
        if (response) {
          html += `<span class="response-count">${responseCount} coches</span>`;
          if (mvp) html += `<span class="mvp-badge">${mvp}</span>`;
        } else {
          html += '<span class="no-response">-</span>';
        }
        html += '</td>';
      });

      html += '</tr>';
    });

    html += '</tbody></table></div>';

    resultsContainer.innerHTML = html;
  }

  /**
   * Ouvre le modal d'exportation
   */
  openExportModal() {
    if (!this.currentUser || !this.currentSurvey) {
      alert('Aucun utilisateur sélectionné');
      return;
    }

    this.modalExport.classList.add('active');
  }

  /**
   * Ferme le modal d'exportation
   */
  closeExportModal() {
    this.modalExport.classList.remove('active');
  }

  /**
   * Exporte les données au format sélectionné
   */
  exportData(format) {
    if (!this.currentUser || !this.currentSurvey) {
      alert('Aucun utilisateur sélectionné');
      return;
    }

    const url = `api.php?action=export&survey=${encodeURIComponent(this.currentSurvey.name)}&user=${encodeURIComponent(this.currentUser)}&format=${format}`;
    window.location.href = url;

    this.closeExportModal();
  }

  /**
   * Initialise les écouteurs d'événements
   */
  setupEventListeners() {
    // Initialiser le comportement du header au scroll
    this.initHeaderScroll();

    // Boutons principaux
    this.btnSelectUser?.addEventListener('click', () => this.openSelectUserModal());
    this.btnCreateUser?.addEventListener('click', () => this.openCreateUserModal());
    this.btnCompare?.addEventListener('click', () => this.openCompareModal());
    this.btnExport?.addEventListener('click', () => this.openExportModal());

    // Modal Sélection Utilisateur
    document.getElementById('modalSelectUserClose')?.addEventListener('click', () => this.closeSelectUserModal());
    document.getElementById('modalSelectUserOverlay')?.addEventListener('click', () => this.closeSelectUserModal());
    document.getElementById('btnCancelSelectUser')?.addEventListener('click', () => this.closeSelectUserModal());

    // Modal Création Utilisateur
    document.getElementById('modalCreateUserClose')?.addEventListener('click', () => this.closeCreateUserModal());
    document.getElementById('modalCreateUserOverlay')?.addEventListener('click', () => this.closeCreateUserModal());
    document.getElementById('btnCancelCreateUser')?.addEventListener('click', () => this.closeCreateUserModal());
    document.getElementById('btnConfirmCreateUser')?.addEventListener('click', () => this.createUser());

    // Enter dans input nouveau nom
    document.getElementById('newUsername')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.createUser();
      }
    });

    // Modal Comparaison
    document.getElementById('modalCompareClose')?.addEventListener('click', () => this.closeCompareModal());
    document.getElementById('modalCompareOverlay')?.addEventListener('click', () => this.closeCompareModal());
    document.getElementById('btnCancelCompare')?.addEventListener('click', () => this.closeCompareModal());
    document.getElementById('btnConfirmCompare')?.addEventListener('click', () => this.performComparison());

    // Modal Exportation
    document.getElementById('modalExportClose')?.addEventListener('click', () => this.closeExportModal());
    document.getElementById('modalExportOverlay')?.addEventListener('click', () => this.closeExportModal());
    document.getElementById('btnCancelExport')?.addEventListener('click', () => this.closeExportModal());
    document.getElementById('btnExportJSON')?.addEventListener('click', () => this.exportData('json'));
    document.getElementById('btnExportCSV')?.addEventListener('click', () => this.exportData('csv'));

    // Bouton retour en haut
    if (this.scrollToTopBtn) {
      this.scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Gestion du scroll
    window.addEventListener('scroll', () => {
      if (this.scrollToTopBtn) {
        if (window.scrollY > 300) {
          this.scrollToTopBtn.classList.add('visible');
        } else {
          this.scrollToTopBtn.classList.remove('visible');
        }
      }
    }, { passive: true });

    // Sauvegarde avant fermeture
    window.addEventListener('beforeunload', (e) => {
      if (this.unsavedChanges && this.currentUser) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    });
  }

  /**
   * Affiche un état de chargement
   */
  showLoading() {
    this.contentContainer.innerHTML = `
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Chargement du sondage...</p>
      </div>
    `;
  }

  /**
   * Affiche un message d'erreur
   */
  showError(message) {
    this.contentContainer.innerHTML = `
      <div class="error-state">
        <h2>⚠️ Erreur</h2>
        <p>${this.escapeHtml(message)}</p>
      </div>
    `;
  }

  /**
   * Initialise le comportement du header au scroll
   */
  initHeaderScroll() {
    if (!this.header) return;

    // Calculer la hauteur initiale du header
    this.headerHeight = this.header.offsetHeight;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.updateHeaderOnScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Écouter le scroll
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Gérer le redimensionnement
    window.addEventListener('resize', () => {
      this.headerHeight = this.header.offsetHeight;
    });
  }

  /**
   * Met à jour l'état du header basé sur le scroll
   */
  updateHeaderOnScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollDiff = scrollTop - this.lastScrollTop;

    // Toujours ajouter la classe compact après 50px de scroll
    if (scrollTop > 50) {
      this.header.classList.add('header-compact');
    } else {
      this.header.classList.remove('header-compact');
    }

    // Ignorer les petits mouvements de scroll
    if (Math.abs(scrollDiff) < this.scrollThreshold) {
      return;
    }

    // Masquer/afficher le header basé sur la direction du scroll
    if (scrollDiff > 0 && scrollTop > this.headerHeight) {
      // Scroll vers le bas - masquer le header
      this.header.classList.add('header-hidden');
    } else {
      // Scroll vers le haut - afficher le header
      this.header.classList.remove('header-hidden');
    }

    this.lastScrollTop = scrollTop;
  }

  /**
   * Ajuste padding content pour header sticky
   */
  adjustContentPaddingForHeader() {
    if (!this.header) return;

    const headerHeight = this.header.offsetHeight;

    // Appliquer padding aux onglets
    const tabs = document.querySelector('.survey-tabs');
    if (tabs) {
      tabs.style.marginTop = `${headerHeight + 16}px`;
    }

    // Appliquer aussi à la navigation sections
    if (this.sectionsNav) {
      this.sectionsNav.style.top = `${headerHeight}px`;
    }
  }

  /**
   * Implémente lazy loading des tableaux non convertis (IntersectionObserver)
   */
  setupLazyTableConversion() {
    const pendingTables = this.contentContainer.querySelectorAll('table.lazy-table-pending');

    console.log(`🔍 Tableaux en attente de conversion lazy: ${pendingTables.length}`);

    if ('IntersectionObserver' in window && pendingTables.length > 0) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const table = entry.target;
            const tableIndex = table.dataset.lazyIndex;

            console.log(`⚡ Conversion lazy tableau #${tableIndex}`);
            console.time(`⏱️ Tableau #${tableIndex}`);

            // Convertir le tableau maintenant
            this.convertSingleTable(table);

            console.timeEnd(`⏱️ Tableau #${tableIndex}`);

            // Arrêter d'observer ce tableau
            observer.unobserve(table);
          }
        });
      }, {
        rootMargin: '500px' // Charger 500px AVANT que l'utilisateur n'y arrive
      });

      pendingTables.forEach(table => {
        observer.observe(table);
      });
    } else if (!('IntersectionObserver' in window)) {
      // Fallback pour vieux navigateurs - convertir tout immédiatement
      console.warn('⚠️ IntersectionObserver non supporté - conversion complète');
      pendingTables.forEach(table => this.convertSingleTable(table));
    }
  }

  /**
   * Implémente lazy loading des sections de tableau (ancienne méthode - pour CSS uniquement)
   */
  setupLazyLoadingSections() {
    const tables = this.contentContainer.querySelectorAll('table.requirements-table');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('loaded');
            observer.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '200px' // Charger 200px avant visible
      });

      tables.forEach(table => {
        table.classList.add('lazy-table');
        observer.observe(table);
      });
    }
  }

  /**
   * Met à jour les statistiques MVP en temps réel
   */
  updateMVPStats() {
    // Vérifier si le sondage a des colonnes MVP et Estimation
    const hasMVP = this.contentContainer.querySelector('[data-field="mvp"]');
    if (!hasMVP) return;

    // Compter les requis MVP cochés et calculer temps total
    let mvpCount = 0;
    let totalMinHours = 0;
    let totalMaxHours = 0;

    // Parcourir tous les tableaux de requis
    const tables = this.contentContainer.querySelectorAll('table.requirements-table');

    tables.forEach(table => {
      const rows = table.querySelectorAll('tbody tr');

      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 3) return;

        const reqID = cells[0].textContent.trim();
        const description = cells[1].textContent.trim();

        // Trouver la checkbox MVP
        const mvpCheckbox = row.querySelector('[data-field="mvp"]');
        if (!mvpCheckbox || !mvpCheckbox.checked) return;

        mvpCount++;

        // Extraire l'estimation (format: "8-16h", "80-120h", etc.)
        const estimationCell = Array.from(cells).find(cell => {
          const text = cell.textContent.trim();
          return /^\d+-\d+h$/.test(text);
        });

        if (estimationCell) {
          const estimation = estimationCell.textContent.trim();
          const match = estimation.match(/^(\d+)-(\d+)h$/);
          if (match) {
            totalMinHours += parseInt(match[1], 10);
            totalMaxHours += parseInt(match[2], 10);
          }
        }
      });
    });

    // Afficher ou masquer le panneau de stats
    if (mvpCount === 0) {
      this.hideMVPStatsPanel();
    } else {
      this.showMVPStatsPanel(mvpCount, totalMinHours, totalMaxHours);
    }
  }

  /**
   * Affiche le panneau de statistiques MVP
   */
  showMVPStatsPanel(count, minHours, maxHours) {
    let panel = document.getElementById('mvp-stats-panel');

    if (!panel) {
      // Créer le panneau
      panel = document.createElement('div');
      panel.id = 'mvp-stats-panel';
      panel.className = 'mvp-stats-panel';
      document.body.appendChild(panel);
    }

    // Convertir en jours/semaines si nécessaire
    const minDays = (minHours / 8).toFixed(1);
    const maxDays = (maxHours / 8).toFixed(1);
    const minWeeks = (minHours / 40).toFixed(1);
    const maxWeeks = (maxHours / 40).toFixed(1);

    panel.innerHTML = `
      <div class="mvp-stats-header">
        <h3>📊 Statistiques MVP</h3>
        <button class="mvp-stats-close" onclick="document.getElementById('mvp-stats-panel').classList.toggle('collapsed')">
          <span class="icon-collapse">▼</span>
          <span class="icon-expand">▲</span>
        </button>
      </div>
      <div class="mvp-stats-content">
        <div class="mvp-stat-item">
          <span class="mvp-stat-label">Requis sélectionnés :</span>
          <span class="mvp-stat-value">${count}</span>
        </div>
        <div class="mvp-stat-item highlight">
          <span class="mvp-stat-label">Estimation totale :</span>
          <span class="mvp-stat-value">${minHours}-${maxHours}h</span>
        </div>
        <div class="mvp-stat-item">
          <span class="mvp-stat-label">En jours (8h/jour) :</span>
          <span class="mvp-stat-value">${minDays}-${maxDays} jours</span>
        </div>
        <div class="mvp-stat-item">
          <span class="mvp-stat-label">En semaines (40h/sem) :</span>
          <span class="mvp-stat-value">${minWeeks}-${maxWeeks} semaines</span>
        </div>
        <div class="mvp-stat-note">
          💡 Estimation pour 1 développeur seul
        </div>
      </div>
    `;

    panel.classList.add('visible');
  }

  /**
   * Masque le panneau de statistiques MVP
   */
  hideMVPStatsPanel() {
    const panel = document.getElementById('mvp-stats-panel');
    if (panel) {
      panel.classList.remove('visible');
    }
  }

  /**
   * Échappe les caractères HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  window.surveyViewer = new SurveyViewer();
});
