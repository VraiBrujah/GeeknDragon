/**
 * =====================================================
 * MODULE NOTES UNIVERSEL - VERSION GÉNÉRIQUE
 * =====================================================
 * 
 * Module de notes générique et réutilisable pour n'importe quelle page web.
 * Sauvegarde basée sur l'URL de la page pour éviter les conflits.
 * 
 * UTILISATION :
 * 1. Inclure ce fichier JS dans votre page
 * 2. Inclure le CSS notes-universal.css
 * 3. Appeler NotesUniversel.init() quand la page est chargée
 * 
 * CARACTÉRISTIQUES :
 * - Sauvegarde automatique dans localStorage basée sur l'URL
 * - Interface adaptative (desktop/mobile)
 * - Raccourcis clavier (Ctrl+Shift+N)
 * - Export en fichier Markdown
 * - Styles CSS personnalisables
 */

// ========================================
// MODULE NOTES UNIVERSEL
// ========================================

const NotesUniversel = (function() {
    'use strict';

    // Configuration par défaut du module
    const config = {
        version: '1.0.0',
        isOpen: false,
        position: { x: 20, y: 20 },
        
        // Configuration personnalisable
        styles: {
            // Couleur principale du thème (peut être adaptée au site)
            primaryColor: '#FF6B35',
            secondaryColor: '#F7931E',
            
            // Position du bouton flottant
            buttonPosition: 'right', // 'left' ou 'right'
            buttonVerticalPosition: 'center' // 'top', 'center', 'bottom'
        },
        
        // Textes personnalisables (multilingue)
        texts: {
            title: 'Notes',
            placeholder: 'Tapez vos notes ici...\n\nExemples:\n• Problème trouvé avec le formulaire\n• Amélioration suggérée\n• Note personnelle\n\nSauvegarde automatique.',
            saveButton: '💾 Sauver',
            viewButton: '👁️ Voir',
            exportButton: '📤 Export',
            clearButton: '🗑️ Effacer',
            noNotesFound: '❌ Aucune note trouvée pour cette page.',
            confirmClear: '🗑️ Êtes-vous sûr de vouloir effacer votre saisie?',
            emptyNote: '⚠️ Veuillez écrire une note avant de sauvegarder.',
            saveSuccess: '✅ OK!',
            exportSuccess: '✅ OK!'
        }
    };

    let pageInfo = {};

    // ========================================
    // GÉNÉRATION DU NOM DE FICHIER BASÉ SUR L'URL
    // ========================================

    /**
     * Génère un nom de fichier unique basé sur l'URL de la page
     * Convertit l'URL en nom de fichier valide pour la sauvegarde
     * 
     * @returns {string} Nom de fichier au format .md
     */
    function genererNomFichierDepuisURL() {
        const url = window.location.href;
        
        // Nettoyer et convertir l'URL en nom de fichier sécurisé
        const nomFichier = url
            .replace(/^https?:\/\//, '') // Retirer http(s)://
            .replace(/[\/\\:*?"<>|]/g, '_') // Remplacer caractères interdits par _
            .replace(/[.]/g, '_') // Remplacer points par _
            .replace(/_+/g, '_') // Remplacer multiples _ par un seul
            .replace(/^_|_$/g, '') // Retirer _ en début/fin
            .substring(0, 100); // Limiter la longueur
            
        return `${nomFichier}.md`;
    }

    /**
     * Détecte le contexte de la page pour personnaliser l'interface
     */
    function detecterContextePage() {
        const path = window.location.pathname;
        const hostname = window.location.hostname;
        
        pageInfo = {
            url: window.location.href,
            hostname: hostname,
            path: path,
            title: document.title || 'Page sans titre',
            nomFichier: genererNomFichierDepuisURL()
        };
        
        console.log('📍 Contexte de page détecté:', pageInfo);
    }

    // ========================================
    // GÉNÉRATION DE L'INTERFACE
    // ========================================

    /**
     * Génère le HTML de l'interface des notes
     * 
     * @returns {string} Code HTML de l'interface complète
     */
    function genererHTMLInterface() {
        const buttonClass = config.styles.buttonPosition === 'left' ? 'notes-btn-left' : 'notes-btn-right';
        const verticalClass = `notes-btn-${config.styles.buttonVerticalPosition}`;
        
        return `
            <!-- Bouton flottant pour ouvrir/fermer les notes -->
            <div id="notes-toggle-btn" class="notes-toggle-btn ${buttonClass} ${verticalClass}" 
                 title="Module Notes (Ctrl+Shift+N)">
                📝
            </div>
            
            <!-- Fenêtre des notes (cachée par défaut) -->
            <div id="notes-window" class="notes-window notes-hidden">
                <!-- En-tête de la fenêtre -->
                <div class="notes-header">
                    <div class="notes-title">
                        <span class="notes-icon">📝</span>
                        <span>${config.texts.title}</span>
                    </div>
                    <button id="notes-close-btn" class="notes-close-btn" title="Fermer">✕</button>
                </div>
                
                <!-- Informations de contexte -->
                <div class="notes-context">
                    <div class="notes-context-item">
                        <strong>Page:</strong> <span id="notes-page-title">${pageInfo.title}</span>
                    </div>
                    <div class="notes-context-item">
                        <strong>Fichier:</strong> <span id="notes-file-name">${pageInfo.nomFichier}</span>
                    </div>
                </div>
                
                <!-- Zone de saisie des notes -->
                <div class="notes-input-section">
                    <label for="notes-textarea" class="notes-label">
                        💬 Votre note:
                    </label>
                    <textarea 
                        id="notes-textarea" 
                        class="notes-textarea"
                        placeholder="${config.texts.placeholder}"
                        rows="6"
                    ></textarea>
                </div>
                
                <!-- Boutons d'actions -->
                <div class="notes-actions">
                    <button id="notes-save-btn" class="notes-save-btn">
                        ${config.texts.saveButton}
                    </button>
                    <button id="notes-view-btn" class="notes-view-btn">
                        ${config.texts.viewButton}
                    </button>
                    <button id="notes-export-btn" class="notes-export-btn">
                        ${config.texts.exportButton}
                    </button>
                    <button id="notes-clear-btn" class="notes-clear-btn">
                        ${config.texts.clearButton}
                    </button>
                </div>
                
                <!-- Zone d'affichage des notes existantes -->
                <div id="notes-display" class="notes-display notes-hidden">
                    <div class="notes-display-header">
                        <strong>📋 Notes existantes:</strong>
                        <button id="notes-hide-display-btn" class="notes-hide-btn">Masquer</button>
                    </div>
                    <div id="notes-content" class="notes-content">
                        Chargement...
                    </div>
                </div>
            </div>
        `;
    }

    // ========================================
    // GESTION DES ÉVÉNEMENTS
    // ========================================

    /**
     * Configure tous les gestionnaires d'événements
     */
    function configurerEvenements() {
        // Événements des boutons
        document.getElementById('notes-toggle-btn').addEventListener('click', togglerFenetre);
        document.getElementById('notes-close-btn').addEventListener('click', fermerFenetre);
        
        document.getElementById('notes-save-btn').addEventListener('click', sauvegarderNote);
        document.getElementById('notes-view-btn').addEventListener('click', afficherNotesExistantes);
        document.getElementById('notes-export-btn').addEventListener('click', exporterNotes);
        document.getElementById('notes-clear-btn').addEventListener('click', effacerSaisie);
        document.getElementById('notes-hide-display-btn').addEventListener('click', masquerAffichage);
        
        // Raccourcis clavier
        document.addEventListener('keydown', function(event) {
            // Ctrl+Shift+N pour ouvrir/fermer
            if (event.ctrlKey && event.shiftKey && event.key === 'N') {
                event.preventDefault();
                togglerFenetre();
            }
            
            // Échap pour fermer
            if (event.key === 'Escape' && config.isOpen) {
                fermerFenetre();
            }
        });
        
        console.log('🎮 Gestionnaires d\'événements configurés');
    }

    /**
     * Basculer l'état ouvert/fermé de la fenêtre
     */
    function togglerFenetre() {
        if (config.isOpen) {
            fermerFenetre();
        } else {
            ouvrirFenetre();
        }
    }

    /**
     * Ouvrir la fenêtre des notes
     */
    function ouvrirFenetre() {
        const fenetre = document.getElementById('notes-window');
        fenetre.classList.remove('notes-hidden');
        config.isOpen = true;
        
        // Focus automatique sur le textarea après animation
        setTimeout(() => {
            document.getElementById('notes-textarea').focus();
        }, 300);
        
        console.log('📝 Fenêtre des notes ouverte');
    }

    /**
     * Fermer la fenêtre des notes
     */
    function fermerFenetre() {
        const fenetre = document.getElementById('notes-window');
        fenetre.classList.add('notes-hidden');
        config.isOpen = false;
        
        // Masquer aussi l'affichage des notes
        document.getElementById('notes-display').classList.add('notes-hidden');
        
        console.log('📝 Fenêtre des notes fermée');
    }

    // ========================================
    // SAUVEGARDE ET GESTION DES DONNÉES
    // ========================================

    /**
     * Génère une clé de stockage unique basée sur l'URL
     * 
     * @returns {string} Clé unique pour localStorage
     */
    function genererCleStockage() {
        return `notes_universal_${pageInfo.nomFichier.replace('.md', '')}`;
    }

    /**
     * Sauvegarde une note dans localStorage
     */
    function sauvegarderNote() {
        const textarea = document.getElementById('notes-textarea');
        const contenu = textarea.value.trim();
        
        if (!contenu) {
            alert(config.texts.emptyNote);
            textarea.focus();
            return;
        }
        
        const timestamp = new Date().toLocaleString('fr-CA', {
            year: 'numeric',
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        // Formatage de la note en Markdown
        const lignesNote = contenu
            .split('\n')
            .filter(ligne => ligne.trim() !== '')
            .map(ligne => `• ${ligne.trim()}`)
            .join('\n');
        
        const noteFormatee = `## 📅 ${timestamp}\n\n${lignesNote}\n\n---\n\n`;
        
        // Sauvegarde dans localStorage
        const cleStockage = genererCleStockage();
        
        try {
            let contenuExistant = localStorage.getItem(cleStockage) || '';
            const contenuFinal = contenuExistant + noteFormatee;
            
            localStorage.setItem(cleStockage, contenuFinal);
            
            // Nettoyage de l'interface
            textarea.value = '';
            afficherConfirmationSauvegarde();
            
            console.log('💾 Note sauvegardée avec la clé:', cleStockage);
            
        } catch (error) {
            console.error('❌ Erreur de sauvegarde:', error);
            alert('❌ Erreur lors de la sauvegarde: ' + error.message);
        }
    }

    /**
     * Affiche la confirmation visuelle de sauvegarde
     */
    function afficherConfirmationSauvegarde() {
        const bouton = document.getElementById('notes-save-btn');
        const texteOriginal = bouton.textContent;
        
        bouton.textContent = config.texts.saveSuccess;
        bouton.classList.add('notes-success');
        
        setTimeout(() => {
            bouton.textContent = texteOriginal;
            bouton.classList.remove('notes-success');
        }, 2000);
    }

    // ========================================
    // AFFICHAGE DES NOTES EXISTANTES
    // ========================================

    /**
     * Affiche ou masque les notes existantes
     */
    function afficherNotesExistantes() {
        const zoneAffichage = document.getElementById('notes-display');
        
        if (zoneAffichage.classList.contains('notes-hidden')) {
            const contenu = recupererNotesExistantes();
            document.getElementById('notes-content').textContent = contenu;
            zoneAffichage.classList.remove('notes-hidden');
        } else {
            zoneAffichage.classList.add('notes-hidden');
        }
    }

    /**
     * Masque la zone d'affichage des notes
     */
    function masquerAffichage() {
        document.getElementById('notes-display').classList.add('notes-hidden');
    }

    /**
     * Récupère les notes existantes depuis localStorage
     * 
     * @returns {string} Contenu des notes ou message d'information
     */
    function recupererNotesExistantes() {
        const cleStockage = genererCleStockage();
        const contenu = localStorage.getItem(cleStockage);
        
        if (contenu) {
            return contenu;
        }
        
        return `${config.texts.noNotesFound}

📁 Page: ${pageInfo.title}
🔗 URL: ${pageInfo.url}
💾 Fichier: ${pageInfo.nomFichier}

ℹ️ Pour créer des notes:
1. Tapez votre note dans la zone de texte
2. Cliquez sur "${config.texts.saveButton}"
3. Utilisez "${config.texts.viewButton}" pour les voir
4. Utilisez "${config.texts.exportButton}" pour télécharger`;
    }

    // ========================================
    // EXPORT DES NOTES
    // ========================================

    /**
     * Exporte les notes vers un fichier Markdown téléchargeable
     */
    function exporterNotes() {
        const cleStockage = genererCleStockage();
        const contenuNotes = localStorage.getItem(cleStockage);
        
        if (!contenuNotes) {
            alert('⚠️ Aucune note à exporter pour cette page.');
            return;
        }
        
        const contenuExport = `# 📄 Notes - ${pageInfo.title}

**URL :** ${pageInfo.url}
**Fichier :** ${pageInfo.nomFichier}
**Exporté le :** ${new Date().toLocaleString('fr-CA')}
**Générateur :** Module Notes Universel v${config.version}

---

${contenuNotes}`;
        
        try {
            const blob = new Blob([contenuExport], { type: 'text/markdown;charset=utf-8' });
            const lien = document.createElement('a');
            lien.href = URL.createObjectURL(blob);
            lien.download = pageInfo.nomFichier;
            
            document.body.appendChild(lien);
            lien.click();
            document.body.removeChild(lien);
            
            URL.revokeObjectURL(lien.href);
            
            // Confirmation visuelle
            afficherConfirmationExport();
            
            console.log('📤 Notes exportées:', pageInfo.nomFichier);
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'export:', error);
            alert('❌ Erreur lors de l\'export des notes.');
        }
    }

    /**
     * Affiche la confirmation visuelle d'export
     */
    function afficherConfirmationExport() {
        const bouton = document.getElementById('notes-export-btn');
        const texteOriginal = bouton.textContent;
        
        bouton.textContent = config.texts.exportSuccess;
        bouton.classList.add('notes-success');
        
        setTimeout(() => {
            bouton.textContent = texteOriginal;
            bouton.classList.remove('notes-success');
        }, 2000);
    }

    // ========================================
    // AUTRES ACTIONS
    // ========================================

    /**
     * Efface le contenu de la zone de saisie
     */
    function effacerSaisie() {
        const textarea = document.getElementById('notes-textarea');
        
        if (textarea.value.trim()) {
            if (confirm(config.texts.confirmClear)) {
                textarea.value = '';
                textarea.focus();
            }
        } else {
            textarea.focus();
        }
    }

    // ========================================
    // INITIALISATION PUBLIQUE
    // ========================================

    /**
     * Initialise le module de notes universelles
     * 
     * @param {Object} options - Configuration optionnelle pour personnaliser le module
     */
    function init(options = {}) {
        console.log('🎯 Initialisation du Module Notes Universel v' + config.version);
        
        // Fusion des options personnalisées avec la configuration par défaut
        if (options.styles) {
            Object.assign(config.styles, options.styles);
        }
        if (options.texts) {
            Object.assign(config.texts, options.texts);
        }
        
        // Détection du contexte de la page
        detecterContextePage();
        
        // Création et injection de l'interface
        const conteneur = document.createElement('div');
        conteneur.id = 'notes-universal-container';
        conteneur.innerHTML = genererHTMLInterface();
        
        document.body.appendChild(conteneur);
        
        // Configuration des événements
        configurerEvenements();
        
        console.log(`✅ Module Notes Universel opérationnel
📄 Page: ${pageInfo.title}
💾 Fichier: ${pageInfo.nomFichier}
🎮 Raccourci: Ctrl+Shift+N`);
    }

    /**
     * Met à jour la configuration du module
     * 
     * @param {Object} newConfig - Nouvelle configuration
     */
    function updateConfig(newConfig) {
        Object.assign(config, newConfig);
        console.log('⚙️ Configuration mise à jour:', config);
    }

    /**
     * Obtient les informations de la page courante
     * 
     * @returns {Object} Informations de la page
     */
    function getPageInfo() {
        return { ...pageInfo };
    }

    // ========================================
    // API PUBLIQUE DU MODULE
    // ========================================

    return {
        // Méthodes principales
        init: init,
        updateConfig: updateConfig,
        getPageInfo: getPageInfo,
        
        // Méthodes d'interface
        open: ouvrirFenetre,
        close: fermerFenetre,
        toggle: togglerFenetre,
        
        // Informations du module
        version: config.version
    };

})();

// ========================================
// AUTO-INITIALISATION (OPTIONNELLE)
// ========================================

// Décommenter la ligne suivante pour initialisation automatique
// document.addEventListener('DOMContentLoaded', () => NotesUniversel.init());