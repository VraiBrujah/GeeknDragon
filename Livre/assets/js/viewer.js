/**
 * Visualiseur de manuscrits autonome
 *
 * Fonctionnalités :
 * - Détection dynamique des livres et chapitres
 * - Navigation par onglets entre livres
 * - Ancres de navigation pour les chapitres
 * - Mémorisation TEMPS RÉEL de la position de lecture (sauvegarde à chaque scroll)
 * - Restauration instantanée pixel-perfect sans animation
 * - Parsing markdown avec marked.js
 * - Optimisation performance avec cache intelligent
 *
 * @author Brujah - Geek & Dragon
 * @version 1.3.0
 */

class ManuscritsViewer {
  /**
   * Constructeur du visualiseur
   */
  constructor() {
    this.books = [];
    this.currentBook = null;
    this.currentChapter = null;
    this.scrollTimeout = null;
    this.lastSavedScrollY = 0; // Cache pour éviter écritures localStorage inutiles

    // Éléments DOM
    this.tabsContainer = document.getElementById('bookTabs');
    this.chaptersNav = document.getElementById('chaptersNav');
    this.chaptersList = document.getElementById('chaptersList');
    this.contentContainer = document.getElementById('manuscritContent');
    this.scrollToTopBtn = document.getElementById('scrollToTop');

    this.init();
  }

  /**
   * Initialisation du visualiseur
   */
  async init() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🚀 DÉMARRAGE VISUALISEUR MANUSCRITS v1.3.0');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');

    try {
      // Configuration de marked.js pour un rendu optimal
      console.log('[DEBUG] Configuration marked.js...');
      if (typeof marked !== 'undefined') {
        marked.setOptions({
          breaks: true,
          gfm: true,
          headerIds: true,
          mangle: false
        });
        console.log('[DEBUG] ✅ marked.js configuré');
      } else {
        console.warn('[DEBUG] ⚠️ marked.js non disponible');
      }

      // Chargement des livres disponibles
      console.log('[DEBUG] Chargement liste des livres...');
      await this.loadBooks();
      console.log(`[DEBUG] ✅ ${this.books.length} livre(s) chargé(s)`);

      // Déterminer quel livre charger (dernière lecture ou premier)
      console.log('[DEBUG] Détermination livre à charger...');
      await this.loadInitialBook();

      // Initialisation des écouteurs d'événements
      console.log('[DEBUG] Initialisation listeners...');
      this.setupEventListeners();

      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('✅ VISUALISEUR PRÊT');
      console.log('═══════════════════════════════════════════════════════');
      console.log('');

    } catch (error) {
      console.error('❌ [ERREUR CRITIQUE] Initialisation:', error);
      this.showError('Impossible de charger les manuscrits');
    }
  }

  /**
   * Charge le livre initial (dernière lecture ou premier disponible)
   */
  async loadInitialBook() {
    console.log('[DEBUG] ========== CHARGEMENT LIVRE INITIAL ==========');
    try {
      const saved = localStorage.getItem('manuscrits_reading_position');
      console.log('[DEBUG] Position sauvegardée trouvée:', saved ? 'Oui' : 'Non');

      if (saved) {
        const position = JSON.parse(saved);
        console.log('[DEBUG] Recherche livre:', position.bookSlug);
        const book = this.books.find(b => b.slug === position.bookSlug);

        if (book) {
          console.log(`[DEBUG] Livre trouvé: "${book.name}", chargement...`);
          // Charger le livre sauvegardé
          await this.switchBook(book.slug);
          console.log('[DEBUG] Livre chargé avec succès');
          return;
        } else {
          console.warn(`[DEBUG] Livre "${position.bookSlug}" introuvable dans la liste`);
        }
      }

      // Fallback : charger le premier livre
      if (this.books.length > 0) {
        console.log(`[DEBUG] Fallback : chargement premier livre "${this.books[0].name}"`);
        await this.switchBook(this.books[0].slug);
      }

      console.log('[DEBUG] ========== FIN CHARGEMENT LIVRE ==========');

    } catch (error) {
      console.error('❌ [ERREUR] Chargement livre initial:', error);
      if (this.books.length > 0) {
        await this.switchBook(this.books[0].slug);
      }
    }
  }

  /**
   * Charge la liste des livres disponibles dynamiquement
   */
  async loadBooks() {
    try {
      const response = await fetch('api.php?action=list');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur chargement livres');
      }

      this.books = data.data;

      if (this.books.length === 0) {
        this.showError('Aucun manuscrit disponible');
        return;
      }

      this.renderBookTabs();

    } catch (error) {
      console.error('Erreur chargement livres:', error);
      throw error;
    }
  }

  /**
   * Génère les onglets de navigation entre livres
   */
  renderBookTabs() {
    this.tabsContainer.innerHTML = '';

    this.books.forEach((book, index) => {
      const button = document.createElement('button');
      button.className = 'tab-button';
      button.textContent = book.name;
      button.dataset.bookSlug = book.slug;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', 'false');

      button.addEventListener('click', () => this.switchBook(book.slug));

      this.tabsContainer.appendChild(button);
    });
  }

  /**
   * Change le livre affiché
   *
   * @param {string} bookSlug Slug du livre à afficher
   */
  async switchBook(bookSlug) {
    const book = this.books.find(b => b.slug === bookSlug);

    if (!book) {
      console.error('Livre introuvable:', bookSlug);
      return;
    }

    this.currentBook = book;

    // Mise à jour des onglets
    document.querySelectorAll('.tab-button').forEach(btn => {
      const isActive = btn.dataset.bookSlug === bookSlug;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive.toString());
    });

    // Chargement des chapitres
    await this.loadBookChapters(book);

    // Sauvegarde du livre actuel
    this.saveReadingPosition();
  }

  /**
   * Charge tous les chapitres d'un livre
   *
   * @param {Object} book Objet livre avec métadonnées
   */
  async loadBookChapters(book) {
    try {
      this.showLoading();

      const response = await fetch(`api.php?action=book&name=${encodeURIComponent(book.name)}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur chargement chapitres');
      }

      const chapters = data.data.chapters;

      // Génération de la navigation des chapitres
      this.renderChaptersNav(chapters);

      // Chargement du contenu de tous les chapitres
      await this.loadAllChapters(book.name, chapters);

      // Restauration de la position de scroll après chargement complet
      // Utiliser requestAnimationFrame pour s'assurer que le DOM est rendu
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.restoreScrollPosition();
        });
      });

    } catch (error) {
      console.error('Erreur chargement chapitres:', error);
      this.showError('Impossible de charger les chapitres');
    }
  }

  /**
   * Génère la navigation des chapitres (ancres)
   *
   * @param {Array} chapters Liste des chapitres
   */
  renderChaptersNav(chapters) {
    this.chaptersList.innerHTML = '';

    chapters.forEach(chapter => {
      const li = document.createElement('li');
      const link = document.createElement('a');

      link.href = `#${chapter.slug}`;
      link.className = 'chapter-link';
      link.dataset.chapterSlug = chapter.slug;

      link.innerHTML = `
        <span class="chapter-number">${String(chapter.order).padStart(2, '0')}</span>
        <span class="chapter-title">${chapter.title}</span>
      `;

      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.scrollToChapter(chapter.slug);
      });

      li.appendChild(link);
      this.chaptersList.appendChild(li);
    });
  }

  /**
   * Charge le contenu de tous les chapitres d'un livre
   *
   * @param {string} bookName Nom du livre
   * @param {Array} chapters Liste des chapitres
   */
  async loadAllChapters(bookName, chapters) {
    this.contentContainer.innerHTML = '';

    for (const chapter of chapters) {
      try {
        const response = await fetch(
          `api.php?action=chapter&book=${encodeURIComponent(bookName)}&file=${encodeURIComponent(chapter.file)}`
        );
        const data = await response.json();

        if (data.success) {
          this.renderChapter(chapter, data.data.content);
        }

      } catch (error) {
        console.error(`Erreur chargement chapitre ${chapter.file}:`, error);
      }
    }
  }

  /**
   * Affiche le contenu d'un chapitre avec parsing markdown
   *
   * @param {Object} chapter Métadonnées du chapitre
   * @param {string} markdownContent Contenu brut markdown
   */
  renderChapter(chapter, markdownContent) {
    const section = document.createElement('section');
    section.className = 'manuscrit-chapter';
    section.id = chapter.slug;
    section.dataset.chapterOrder = chapter.order;

    // Parsing markdown
    if (typeof marked !== 'undefined') {
      section.innerHTML = marked.parse(markdownContent);
    } else {
      // Fallback si marked.js non disponible
      section.innerHTML = `<pre>${this.escapeHtml(markdownContent)}</pre>`;
    }

    this.contentContainer.appendChild(section);
  }

  /**
   * Scroll vers un chapitre spécifique
   *
   * @param {string} chapterSlug Slug du chapitre
   */
  scrollToChapter(chapterSlug) {
    const element = document.getElementById(chapterSlug);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Mise à jour de la navigation active
      this.updateActiveChapter(chapterSlug);

      // Sauvegarde de la position
      this.currentChapter = chapterSlug;
      this.saveReadingPosition();
    }
  }

  /**
   * Met à jour le chapitre actif dans la navigation
   *
   * @param {string} chapterSlug Slug du chapitre actif
   */
  updateActiveChapter(chapterSlug) {
    document.querySelectorAll('.chapter-link').forEach(link => {
      const isActive = link.dataset.chapterSlug === chapterSlug;
      link.classList.toggle('active', isActive);
    });
  }

  /**
   * Sauvegarde la position de lecture en localStorage
   * Optimisé : n'écrit que si position a changé significativement (>10px)
   */
  saveReadingPosition() {
    console.log('[DEBUG] saveReadingPosition() appelée');

    if (!this.currentBook) {
      console.warn('[DEBUG] Sauvegarde annulée : currentBook est null');
      return;
    }

    const currentScrollY = Math.round(window.scrollY);
    console.log(`[DEBUG] Position actuelle: ${currentScrollY}px, Dernière sauvegardée: ${this.lastSavedScrollY}px`);

    // Optimisation : éviter écritures localStorage inutiles
    // N'écrit que si changement significatif (>10px)
    const delta = Math.abs(currentScrollY - this.lastSavedScrollY);
    if (delta < 10) {
      console.log(`[DEBUG] Sauvegarde annulée : delta ${delta}px < 10px`);
      return;
    }

    this.lastSavedScrollY = currentScrollY;

    const position = {
      bookSlug: this.currentBook.slug,
      chapterSlug: this.currentChapter,
      scrollY: currentScrollY,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem('manuscrits_reading_position', JSON.stringify(position));
      console.log(`✅ [SAUVEGARDE] Position ${currentScrollY}px sauvegardée pour livre "${this.currentBook.slug}"`);
      console.log('[DEBUG] Contenu localStorage:', JSON.parse(localStorage.getItem('manuscrits_reading_position')));
    } catch (error) {
      console.error('[Manuscrits] Erreur sauvegarde position:', error);
    }
  }

  /**
   * Restaure la dernière position de lecture
   */
  restoreReadingPosition() {
    try {
      const saved = localStorage.getItem('manuscrits_reading_position');

      if (!saved) {
        // Par défaut, premier livre disponible
        if (this.books.length > 0) {
          this.switchBook(this.books[0].slug);
        }
        return;
      }

      const position = JSON.parse(saved);

      // Vérification que le livre existe toujours
      const book = this.books.find(b => b.slug === position.bookSlug);

      if (book) {
        this.switchBook(position.bookSlug);
        this.currentChapter = position.chapterSlug;
      } else {
        // Livre introuvable, charger le premier
        if (this.books.length > 0) {
          this.switchBook(this.books[0].slug);
        }
      }

    } catch (error) {
      console.error('Erreur restauration position:', error);
      if (this.books.length > 0) {
        this.switchBook(this.books[0].slug);
      }
    }
  }

  /**
   * Restaure la position de scroll exacte
   */
  restoreScrollPosition() {
    console.log('[DEBUG] ========== RESTAURATION POSITION ==========');
    try {
      const saved = localStorage.getItem('manuscrits_reading_position');
      console.log('[DEBUG] Contenu localStorage brut:', saved);

      if (!saved) {
        console.warn('[DEBUG] Aucune position sauvegardée trouvée');
        return;
      }

      const position = JSON.parse(saved);
      console.log('[DEBUG] Position parsée:', position);
      console.log(`[DEBUG] Livre actuel: "${this.currentBook?.slug}", Livre sauvegardé: "${position.bookSlug}"`);

      // Vérifier que c'est bien le même livre
      if (position.bookSlug !== this.currentBook?.slug) {
        console.warn(`[DEBUG] Livres différents : actuel="${this.currentBook?.slug}" vs sauvegardé="${position.bookSlug}"`);
        return;
      }

      // Restaurer la position de scroll EXACTE sans animation
      if (position.scrollY && position.scrollY > 0) {
        console.log(`[DEBUG] Tentative scroll vers ${position.scrollY}px...`);

        // Scroll instantané vers la position sauvegardée
        window.scrollTo({
          top: position.scrollY,
          behavior: 'instant'
        });

        // Initialiser le cache pour éviter sauvegarde immédiate
        this.lastSavedScrollY = position.scrollY;

        // Vérifier position après scroll
        setTimeout(() => {
          const actualScrollY = window.scrollY;
          console.log(`✅ [RESTAURATION] Position cible: ${position.scrollY}px, Position réelle: ${actualScrollY}px`);
          if (Math.abs(actualScrollY - position.scrollY) > 5) {
            console.error(`⚠️ ÉCART DÉTECTÉ: ${Math.abs(actualScrollY - position.scrollY)}px de différence!`);
          }
        }, 100);

        // Mettre à jour le chapitre actif visuellement
        if (position.chapterSlug) {
          this.currentChapter = position.chapterSlug;
          this.updateActiveChapter(position.chapterSlug);
          console.log(`[DEBUG] Chapitre actif mis à jour: "${position.chapterSlug}"`);
        }
      } else if (position.chapterSlug) {
        console.log(`[DEBUG] Scroll vers chapitre "${position.chapterSlug}" (fallback)`);
        // Fallback: scroll vers le chapitre (sans animation)
        const element = document.getElementById(position.chapterSlug);
        if (element) {
          element.scrollIntoView({ behavior: 'instant', block: 'start' });
          this.lastSavedScrollY = element.offsetTop;
          this.currentChapter = position.chapterSlug;
          this.updateActiveChapter(position.chapterSlug);
          console.log(`✅ [RESTAURATION] Chapitre "${position.chapterSlug}" à ${element.offsetTop}px`);
        } else {
          console.error(`[DEBUG] Élément chapitre "${position.chapterSlug}" introuvable!`);
        }
      }

      console.log('[DEBUG] ========== FIN RESTAURATION ==========');

    } catch (error) {
      console.error('❌ [ERREUR] Restauration scroll:', error);
    }
  }

  /**
   * Initialise les écouteurs d'événements
   */
  setupEventListeners() {
    console.log('[DEBUG] ========== INITIALISATION LISTENERS ==========');

    // ⚡ SAUVEGARDE TEMPS RÉEL à chaque scroll (AUCUN debounce)
    window.addEventListener('scroll', () => {
      this.saveReadingPosition(); // Immédiat pour capture position exacte
    }, { passive: true });
    console.log('[DEBUG] ✅ Listener scroll TEMPS RÉEL activé');

    // Détection du scroll pour mise à jour UI (debounced pour performance)
    window.addEventListener('scroll', () => {
      this.handleScrollUI();
    }, { passive: true });
    console.log('[DEBUG] ✅ Listener scroll UI (debounced) activé');

    // Bouton retour en haut
    if (this.scrollToTopBtn) {
      this.scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      console.log('[DEBUG] ✅ Bouton retour haut configuré');
    }

    // Sauvegarde périodique de sécurité
    setInterval(() => {
      if (this.currentBook) {
        console.log('[DEBUG] 🔄 Sauvegarde périodique (1s)');
        this.saveReadingPosition();
      }
    }, 1000); // Réduit à 1 seconde pour plus de réactivité
    console.log('[DEBUG] ✅ Intervalle périodique 1s activé');

    // Sauvegarde avant fermeture
    window.addEventListener('beforeunload', () => {
      console.log('[DEBUG] 🔒 beforeunload détecté, sauvegarde...');
      this.saveReadingPosition();
    });
    console.log('[DEBUG] ✅ Listener beforeunload activé');

    // Sauvegarde lors du changement de visibilité (onglet caché)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('[DEBUG] 👁️ Onglet caché détecté, sauvegarde...');
        this.saveReadingPosition();
      }
    });
    console.log('[DEBUG] ✅ Listener visibilitychange activé');

    console.log('[DEBUG] ========== LISTENERS PRÊTS ==========');
  }

  /**
   * Gestion du scroll UI (mise à jour chapitre actif + bouton retour haut)
   * Debounced pour optimiser les performances
   */
  handleScrollUI() {
    // Débounce pour performance (détection chapitre + UI)
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = setTimeout(() => {
      // Détection du chapitre visible
      this.detectVisibleChapter();

      // Affichage/masquage bouton retour en haut
      if (this.scrollToTopBtn) {
        if (window.scrollY > 300) {
          this.scrollToTopBtn.classList.add('visible');
        } else {
          this.scrollToTopBtn.classList.remove('visible');
        }
      }
    }, 150); // Débounce uniquement pour l'UI
  }

  /**
   * Détecte le chapitre actuellement visible à l'écran
   */
  detectVisibleChapter() {
    const chapters = document.querySelectorAll('.manuscrit-chapter');
    const scrollPosition = window.scrollY + 200;

    let activeChapter = null;

    chapters.forEach(chapter => {
      if (chapter.offsetTop <= scrollPosition) {
        activeChapter = chapter.id;
      }
    });

    if (activeChapter && activeChapter !== this.currentChapter) {
      this.currentChapter = activeChapter;
      this.updateActiveChapter(activeChapter);
    }
  }

  /**
   * Affiche un état de chargement
   */
  showLoading() {
    this.contentContainer.innerHTML = `
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Chargement du manuscrit...</p>
      </div>
    `;
  }

  /**
   * Affiche un message d'erreur
   *
   * @param {string} message Message d'erreur
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
   * Échappe les caractères HTML pour éviter les injections XSS
   *
   * @param {string} text Texte à échapper
   * @return {string} Texte échappé
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  window.manuscritsViewer = new ManuscritsViewer();
});
