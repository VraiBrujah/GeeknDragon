/**
 * =====================================================
 * MODULE DE NOTES UNIVERSELLES - VERSION AMÉLIORÉE
 * =====================================================
 * 
 * Module générique avec interface épurée et système de connexion testeur
 * 
 * FONCTIONNALITÉS :
 * - Interface moderne et lisible
 * - Système de connexion testeur (stockage local)
 * - Affichage simplifié des notes
 * - CSS intégré autonome
 * - Compatible mobile optimisé
 * - Sauvegarde serveur temps réel
 * 
 * UTILISATION :
 * <script src="module_notes/notes-improved.js"></script>
 * 
 * AUTEUR : Assistant Claude (Anthropic) 
 * VERSION : 1.1 - Interface Améliorée
 * LICENCE : MIT - Libre utilisation
 */

(function(window, document) {
    'use strict';
    
    // ========================================
    // MODULE PRINCIPAL NOTES AMÉLIORÉES
    // ========================================
    
    const NotesModule = {
        version: '1.1-ameliore',
        initialized: false,
        isOpen: false,
        currentUser: null,
        notesData: [],
        
        // Configuration par défaut
        config: {
            apiPath: 'module_notes/notes-handler.php',
            position: 'center-right',
            theme: 'auto',
            refreshInterval: 30000, // 30 secondes
            maxNoteLength: 5000,
            
            // Textes personnalisables
            labels: {
                title: 'Notes Partagées',
                placeholder: 'Votre note sera partagée...\n\nExemples:\n• Problème trouvé avec X\n• Suggestion d\'amélioration\n• Commentaire général',
                loginPlaceholder: 'Nom du testeur (optionnel)',
                loginButton: 'Se connecter',
                logoutButton: 'Changer',
                saveButton: '💾 Sauvegarder',
                viewButton: '👁️ Voir Notes',
                refreshButton: '🔄 Actualiser',
                clearButton: '🗑️ Effacer'
            }
        }
    };
    
    // ========================================
    // GESTION UTILISATEUR TESTEUR
    // ========================================
    
    /**
     * Charge les informations de connexion depuis le localStorage
     */
    function chargerUtilisateur() {
        const userData = localStorage.getItem('notes_testeur_user');
        if (userData) {
            try {
                NotesModule.currentUser = JSON.parse(userData);
                console.log('👤 Utilisateur chargé:', NotesModule.currentUser.name);
            } catch (e) {
                console.warn('Erreur lors du chargement de l\'utilisateur:', e);
                NotesModule.currentUser = null;
            }
        }
    }
    
    /**
     * Sauvegarde les informations utilisateur dans le localStorage  
     * @param {string} name - Nom du testeur
     */
    function sauvegarderUtilisateur(name) {
        const userData = {
            name: name.trim(),
            loginTime: new Date().toISOString(),
            sessionId: generateSessionId()
        };
        
        localStorage.setItem('notes_testeur_user', JSON.stringify(userData));
        NotesModule.currentUser = userData;
        
        console.log('👤 Utilisateur connecté:', name);
        mettreAJourInterfaceUtilisateur();
    }
    
    /**
     * Déconnecte l'utilisateur
     */
    function deconnecterUtilisateur() {
        localStorage.removeItem('notes_testeur_user');
        NotesModule.currentUser = null;
        
        console.log('👤 Utilisateur déconnecté');
        mettreAJourInterfaceUtilisateur();
    }
    
    /**
     * Génère un ID de session unique
     */
    function generateSessionId() {
        return 'ses_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
    }
    
    /**
     * Met à jour l'interface utilisateur selon l'état de connexion
     */
    function mettreAJourInterfaceUtilisateur() {
        const loginForm = document.querySelector('.notes-login-form');
        const userInfo = document.querySelector('.notes-user-info');
        
        if (!loginForm || !userInfo) return;
        
        if (NotesModule.currentUser) {
            // Utilisateur connecté - afficher les infos
            loginForm.style.display = 'none';
            userInfo.style.display = 'flex';
            
            const userName = userInfo.querySelector('.notes-user-name');
            if (userName) {
                userName.textContent = NotesModule.currentUser.name;
            }
        } else {
            // Utilisateur non connecté - afficher le formulaire
            loginForm.style.display = 'flex';
            userInfo.style.display = 'none';
        }
    }
    
    // ========================================
    // GÉNÉRATION DE L'INTERFACE AMÉLIORÉE
    // ========================================
    
    /**
     * Génère le HTML complet de l'interface moderne
     */
    function genererInterfaceHTML() {
        const nomFichier = genererNomFichier();
        
        return `
            <!-- CSS intégré pour éviter les dépendances externes -->
            <link rel="stylesheet" href="module_notes/notes-style.css">
            
            <!-- Conteneur principal du module -->
            <div class="notes-module">
                <!-- Bouton flottant -->
                <button class="notes-floating-button ${NotesModule.config.position}" 
                        id="notes-floating-btn" 
                        title="Notes partagées (Ctrl+Shift+N)"
                        aria-label="Ouvrir les notes partagées">
                    📝
                </button>
                
                <!-- Panneau principal -->
                <div class="notes-panel" id="notes-panel">
                    <!-- En-tête -->
                    <div class="notes-header">
                        <div class="notes-title">
                            <span class="notes-title-icon">📝</span>
                            <span>${NotesModule.config.labels.title}</span>
                        </div>
                        <button class="notes-close-button" 
                                id="notes-close-btn" 
                                aria-label="Fermer">
                            ✕
                        </button>
                    </div>
                    
                    <!-- Section de connexion testeur -->
                    <div class="notes-login-section">
                        <!-- Formulaire de connexion -->
                        <div class="notes-login-form">
                            <input type="text" 
                                   class="notes-login-input" 
                                   id="notes-login-input"
                                   placeholder="${NotesModule.config.labels.loginPlaceholder}"
                                   maxlength="30">
                            <button class="notes-login-button" id="notes-login-btn">
                                ${NotesModule.config.labels.loginButton}
                            </button>
                        </div>
                        
                        <!-- Informations utilisateur connecté -->
                        <div class="notes-user-info" style="display: none;">
                            <span>👤 Connecté en tant que <span class="notes-user-name"></span></span>
                            <button class="notes-logout-button" id="notes-logout-btn">
                                ${NotesModule.config.labels.logoutButton}
                            </button>
                        </div>
                    </div>
                    
                    <!-- Zone de saisie -->
                    <div class="notes-input-section">
                        <textarea class="notes-textarea" 
                                  id="notes-textarea"
                                  placeholder="${NotesModule.config.labels.placeholder}"
                                  maxlength="${NotesModule.config.maxNoteLength}"
                                  rows="4"></textarea>
                    </div>
                    
                    <!-- Boutons d'action -->
                    <div class="notes-actions">
                        <button class="notes-action-button primary" id="notes-save-btn">
                            ${NotesModule.config.labels.saveButton}
                        </button>
                        <button class="notes-action-button secondary" id="notes-view-btn">
                            ${NotesModule.config.labels.viewButton}
                        </button>
                        <button class="notes-action-button secondary" id="notes-refresh-btn">
                            ${NotesModule.config.labels.refreshButton}
                        </button>
                        <button class="notes-action-button secondary" id="notes-clear-btn">
                            ${NotesModule.config.labels.clearButton}
                        </button>
                    </div>
                    
                    <!-- Zone d'affichage des notes (cachée par défaut) -->
                    <div class="notes-display" id="notes-display" style="display: none;">
                        <div class="notes-display-header">
                            <span>📋 <span class="notes-display-count" id="notes-count">0</span> note(s)</span>
                            <button class="notes-hide-button" id="notes-hide-btn">Masquer</button>
                        </div>
                        <div class="notes-content" id="notes-content">
                            <div class="notes-loading">Chargement des notes...</div>
                        </div>
                    </div>
                    
                    <!-- Statut de connexion -->
                    <div class="notes-status" id="notes-status">
                        <span>🌐 Connecté - ${nomFichier}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Affiche les notes de manière épurée et lisible
     * @param {Array} notes - Tableau des notes
     */
    function afficherNotesEpurees(notes) {
        const content = document.getElementById('notes-content');
        const count = document.getElementById('notes-count');
        
        if (!content || !count) return;
        
        if (!notes || notes.length === 0) {
            content.innerHTML = `
                <div class="notes-empty">
                    <div class="notes-empty-icon">📝</div>
                    <div>Aucune note pour cette page</div>
                </div>
            `;
            count.textContent = '0';
            return;
        }
        
        count.textContent = notes.length;
        
        // Génération des notes épurées
        let notesHTML = '';
        notes.forEach((note, index) => {
            const noteNumber = index + 1;
            const author = note.author || 'Anonyme';
            const time = formatTime(note.timestamp);
            const content = note.content || note.note || '';
            
            notesHTML += `
                <div class="notes-item">
                    <div class="notes-item-header">
                        <span class="notes-item-number">Note ${noteNumber}${author !== 'Anonyme' ? ', ' + author : ''}</span>
                        <span class="notes-item-time">${time}</span>
                    </div>
                    <div class="notes-item-content">${escapeHtml(content)}</div>
                </div>
            `;
        });
        
        content.innerHTML = notesHTML;
    }
    
    /**
     * Formate un timestamp en format lisible
     * @param {string} timestamp - Timestamp ISO
     * @returns {string} - Temps formaté
     */
    function formatTime(timestamp) {
        if (!timestamp) return '';
        
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            
            if (diffMins < 1) return 'À l\'instant';
            if (diffMins < 60) return `Il y a ${diffMins}min`;
            if (diffHours < 24) return `Il y a ${diffHours}h`;
            if (diffDays < 7) return `Il y a ${diffDays}j`;
            
            return date.toLocaleDateString('fr-CA', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return '';
        }
    }
    
    /**
     * Échappe les caractères HTML pour éviter les injections
     * @param {string} text - Texte à échapper
     * @returns {string} - Texte sécurisé
     */
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
    
    // ========================================
    // GESTION DES ÉVÉNEMENTS
    // ========================================
    
    /**
     * Configure tous les gestionnaires d'événements
     */
    function configurerEvenements() {
        // Bouton flottant
        const floatingBtn = document.getElementById('notes-floating-btn');
        if (floatingBtn) {
            floatingBtn.addEventListener('click', togglePanel);
        }
        
        // Bouton fermeture
        const closeBtn = document.getElementById('notes-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', fermerPanel);
        }
        
        // Connexion testeur
        const loginBtn = document.getElementById('notes-login-btn');
        const loginInput = document.getElementById('notes-login-input');
        if (loginBtn && loginInput) {
            loginBtn.addEventListener('click', handleLogin);
            loginInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    handleLogin();
                }
            });
        }
        
        // Déconnexion
        const logoutBtn = document.getElementById('notes-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', deconnecterUtilisateur);
        }
        
        // Actions principales
        const saveBtn = document.getElementById('notes-save-btn');
        const viewBtn = document.getElementById('notes-view-btn');
        const refreshBtn = document.getElementById('notes-refresh-btn');
        const clearBtn = document.getElementById('notes-clear-btn');
        const hideBtn = document.getElementById('notes-hide-btn');
        
        if (saveBtn) saveBtn.addEventListener('click', sauvegarderNote);
        if (viewBtn) viewBtn.addEventListener('click', toggleNotesDisplay);
        if (refreshBtn) refreshBtn.addEventListener('click', actualiserNotes);
        if (clearBtn) clearBtn.addEventListener('click', effacerTexte);
        if (hideBtn) hideBtn.addEventListener('click', masquerNotes);
        
        // Raccourcis clavier
        document.addEventListener('keydown', function(e) {
            // Ctrl+Shift+N : Toggle panel
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
                e.preventDefault();
                togglePanel();
            }
            
            // Ctrl+Enter : Sauvegarder
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                const textarea = document.getElementById('notes-textarea');
                if (textarea && document.activeElement === textarea) {
                    e.preventDefault();
                    sauvegarderNote();
                }
            }
            
            // Échap : Fermer
            if (e.key === 'Escape' && NotesModule.isOpen) {
                fermerPanel();
            }
        });
        
        // Clic en dehors pour fermer (optionnel)
        document.addEventListener('click', function(e) {
            const panel = document.getElementById('notes-panel');
            const floatingBtn = document.getElementById('notes-floating-btn');
            
            if (NotesModule.isOpen && panel && !panel.contains(e.target) && e.target !== floatingBtn) {
                // Décommentez la ligne suivante pour fermer en cliquant à l'extérieur
                // fermerPanel();
            }
        });
        
        console.log('🎮 Gestionnaires d\'événements configurés');
    }
    
    /**
     * Gère la connexion du testeur
     */
    function handleLogin() {
        const input = document.getElementById('notes-login-input');
        if (!input) return;
        
        const name = input.value.trim();
        if (name.length >= 2) {
            sauvegarderUtilisateur(name);
            input.value = '';
        } else {
            alert('⚠️ Veuillez entrer un nom d\'au moins 2 caractères');
            input.focus();
        }
    }
    
    /**
     * Basculer l'état ouvert/fermé du panneau
     */
    function togglePanel() {
        if (NotesModule.isOpen) {
            fermerPanel();
        } else {
            ouvrirPanel();
        }
    }
    
    /**
     * Ouvrir le panneau des notes
     */
    function ouvrirPanel() {
        const panel = document.getElementById('notes-panel');
        const floatingBtn = document.getElementById('notes-floating-btn');
        
        if (panel) {
            panel.classList.add('open');
            NotesModule.isOpen = true;
            
            // Focus sur le textarea après ouverture
            setTimeout(() => {
                const textarea = document.getElementById('notes-textarea');
                if (textarea) {
                    textarea.focus();
                }
            }, 300);
            
            console.log('📝 Panneau ouvert');
        }
    }
    
    /**
     * Fermer le panneau des notes
     */
    function fermerPanel() {
        const panel = document.getElementById('notes-panel');
        
        if (panel) {
            panel.classList.remove('open');
            NotesModule.isOpen = false;
            
            // Masquer aussi l'affichage des notes
            masquerNotes();
            
            console.log('📝 Panneau fermé');
        }
    }
    
    /**
     * Basculer l'affichage des notes
     */
    function toggleNotesDisplay() {
        const display = document.getElementById('notes-display');
        if (!display) return;
        
        if (display.style.display === 'none') {
            // Afficher les notes
            display.style.display = 'block';
            actualiserNotes();
        } else {
            // Masquer les notes
            masquerNotes();
        }
    }
    
    /**
     * Masquer l'affichage des notes
     */
    function masquerNotes() {
        const display = document.getElementById('notes-display');
        if (display) {
            display.style.display = 'none';
        }
    }
    
    // ========================================
    // COMMUNICATION SERVEUR
    // ========================================
    
    /**
     * Génère le nom de fichier basé sur l'URL
     */
    function genererNomFichier() {
        const url = window.location.href;
        return url
            .replace(/^https?:\/\//, '')
            .replace(/[\/\\:*?"<>|]/g, '_')
            .replace(/[.]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '')
            .substring(0, 80) + '.md';
    }
    
    /**
     * Sauvegarde une note sur le serveur
     */
    async function sauvegarderNote() {
        const textarea = document.getElementById('notes-textarea');
        const saveBtn = document.getElementById('notes-save-btn');
        const status = document.getElementById('notes-status');
        
        if (!textarea || !saveBtn) return;
        
        const contenu = textarea.value.trim();
        if (!contenu) {
            alert('⚠️ Veuillez écrire une note avant de sauvegarder');
            textarea.focus();
            return;
        }
        
        // Interface de sauvegarde
        saveBtn.disabled = true;
        saveBtn.textContent = '💾 Sauvegarde...';
        if (status) {
            status.className = 'notes-status saving';
            status.innerHTML = '<span>📤 Sauvegarde en cours...</span>';
        }
        
        try {
            const donnees = new FormData();
            donnees.append('action', 'save');
            donnees.append('note', contenu);
            donnees.append('author', NotesModule.currentUser ? NotesModule.currentUser.name : '');
            donnees.append('page_url', window.location.href);
            donnees.append('page_title', document.title);
            
            const response = await fetch(NotesModule.config.apiPath, {
                method: 'POST',
                body: donnees
            });
            
            if (response.ok) {
                const result = await response.json();
                
                if (result.success) {
                    // Succès
                    textarea.value = '';
                    saveBtn.textContent = '✅ Sauvé!';
                    saveBtn.classList.add('success');
                    
                    if (status) {
                        status.className = 'notes-status connected';
                        status.innerHTML = '<span>✅ Note sauvegardée</span>';
                    }
                    
                    // Actualiser l'affichage si visible
                    const display = document.getElementById('notes-display');
                    if (display && display.style.display !== 'none') {
                        actualiserNotes();
                    }
                    
                    console.log('💾 Note sauvegardée avec succès');
                } else {
                    throw new Error(result.message || 'Erreur de sauvegarde');
                }
            } else {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
        } catch (error) {
            console.error('❌ Erreur sauvegarde:', error);
            
            if (status) {
                status.className = 'notes-status error';
                status.innerHTML = '<span>❌ Erreur de sauvegarde</span>';
            }
            
            alert('❌ Erreur lors de la sauvegarde: ' + error.message);
        }
        
        // Restaurer l'interface
        setTimeout(() => {
            saveBtn.disabled = false;
            saveBtn.textContent = NotesModule.config.labels.saveButton;
            saveBtn.classList.remove('success');
            
            if (status) {
                status.className = 'notes-status connected';
                status.innerHTML = `<span>🌐 Connecté - ${genererNomFichier()}</span>`;
            }
        }, 2000);
    }
    
    /**
     * Actualise la liste des notes depuis le serveur
     */
    async function actualiserNotes() {
        const content = document.getElementById('notes-content');
        const refreshBtn = document.getElementById('notes-refresh-btn');
        
        if (!content) return;
        
        // Interface de chargement
        content.innerHTML = '<div class="notes-loading">Actualisation...</div>';
        if (refreshBtn) {
            refreshBtn.disabled = true;
        }
        
        try {
            const response = await fetch(`${NotesModule.config.apiPath}?action=load&page_url=${encodeURIComponent(window.location.href)}`);
            
            if (response.ok) {
                const result = await response.json();
                
                if (result.success) {
                    NotesModule.notesData = result.data.notes || [];
                    afficherNotesEpurees(NotesModule.notesData);
                    console.log('🔄 Notes actualisées:', NotesModule.notesData.length);
                } else {
                    throw new Error(result.message || 'Erreur de chargement');
                }
            } else {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
        } catch (error) {
            console.error('❌ Erreur actualisation:', error);
            content.innerHTML = `
                <div class="notes-empty">
                    <div class="notes-empty-icon">⚠️</div>
                    <div>Erreur lors du chargement</div>
                    <div style="font-size: 12px; margin-top: 8px; opacity: 0.7;">${error.message}</div>
                </div>
            `;
        }
        
        // Restaurer l'interface
        if (refreshBtn) {
            refreshBtn.disabled = false;
        }
    }
    
    /**
     * Efface le contenu du textarea
     */
    function effacerTexte() {
        const textarea = document.getElementById('notes-textarea');
        if (!textarea) return;
        
        if (textarea.value.trim()) {
            if (confirm('🗑️ Êtes-vous sûr de vouloir effacer le texte en cours?')) {
                textarea.value = '';
                textarea.focus();
            }
        } else {
            textarea.focus();
        }
    }
    
    // ========================================
    // INITIALISATION ET AUTO-REFRESH
    // ========================================
    
    /**
     * Initialise le module complet
     */
    function initialiser() {
        if (NotesModule.initialized) {
            console.warn('⚠️ Module déjà initialisé');
            return;
        }
        
        console.log('🎯 Initialisation du Module Notes Amélioré v' + NotesModule.version);
        
        // Fusionner configuration personnalisée
        if (window.NotesConfig) {
            NotesModule.config = Object.assign({}, NotesModule.config, window.NotesConfig);
            console.log('⚙️ Configuration personnalisée appliquée');
        }
        
        // Charger l'utilisateur depuis le cache
        chargerUtilisateur();
        
        // Injecter l'interface
        const container = document.createElement('div');
        container.innerHTML = genererInterfaceHTML();
        document.body.appendChild(container);
        
        // Configurer les événements
        configurerEvenements();
        
        // Mettre à jour l'interface utilisateur
        setTimeout(() => {
            mettreAJourInterfaceUtilisateur();
        }, 100);
        
        // Auto-refresh périodique (si activé)
        if (NotesModule.config.refreshInterval > 0) {
            setInterval(() => {
                const display = document.getElementById('notes-display');
                if (display && display.style.display !== 'none') {
                    actualiserNotes();
                }
            }, NotesModule.config.refreshInterval);
        }
        
        NotesModule.initialized = true;
        
        console.log(`✅ Module Notes Amélioré opérationnel
📄 Fichier: ${genererNomFichier()}
👤 Utilisateur: ${NotesModule.currentUser ? NotesModule.currentUser.name : 'Anonyme'}
🎮 Raccourcis: Ctrl+Shift+N (ouvrir), Ctrl+Enter (sauver), Échap (fermer)`);
    }
    
    // ========================================
    // API PUBLIQUE
    // ========================================
    
    // Exposition des méthodes publiques
    window.NotesModule = {
        // Informations
        version: NotesModule.version,
        
        // Contrôle du panneau
        open: ouvrirPanel,
        close: fermerPanel,
        toggle: togglePanel,
        
        // Actions
        save: sauvegarderNote,
        refresh: actualiserNotes,
        clear: effacerTexte,
        
        // Gestion utilisateur
        login: function(name) {
            if (name && name.trim().length >= 2) {
                sauvegarderUtilisateur(name.trim());
            }
        },
        logout: deconnecterUtilisateur,
        getCurrentUser: function() {
            return NotesModule.currentUser;
        },
        
        // Configuration
        setConfig: function(newConfig) {
            NotesModule.config = Object.assign({}, NotesModule.config, newConfig);
            console.log('⚙️ Configuration mise à jour');
        },
        
        // État
        isOpen: function() {
            return NotesModule.isOpen;
        },
        
        // Données
        getNotes: function() {
            return [...NotesModule.notesData];
        },
        
        // Réinitialisation
        reinit: function() {
            NotesModule.initialized = false;
            initialiser();
        }
    };
    
    // ========================================
    // AUTO-INITIALISATION
    // ========================================
    
    // Initialisation automatique quand le DOM est prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialiser);
    } else {
        // DOM déjà prêt
        setTimeout(initialiser, 100);
    }
    
})(window, document);