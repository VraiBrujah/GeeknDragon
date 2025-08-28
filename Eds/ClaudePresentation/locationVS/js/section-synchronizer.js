/**
 * Synchronisateur Sections LocationVS
 * Répertoire de Travail : C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\ClaudePresentation\locationVS
 * 
 * Rôle      : Synchronise l'ordre des sections entre éditeur et présentation
 * Type      : Module JavaScript pour synchronisation sections
 * Unité     : ordre numérique (1, 2, 3, etc.)
 * Domaine   : sections existantes uniquement
 * Formule   : ordre_éditeur = ordre_présentation
 * Exemple   : hero=1, pricing=2, advantages=3, technical=4, contact=5
 */

class SectionSynchronizer {
    constructor() {
        // Configuration : ordre correct des sections selon location.html
        this.correctSectionOrder = [
            'hero',        // Section héro (ordre 1)
            'pricing',     // Section tarification (ordre 2) 
            'advantages',  // Section avantages (ordre 3)
            'technical',   // Section technique (ordre 4)
            'contact'      // Section contact (ordre 5)
        ];
        
        // Configuration : sections présentes uniquement dans l'éditeur (à masquer/ignorer)
        this.editorOnlySections = [
            'hero-arguments',      // Arguments héro (n'existe pas dans présentation)
            'conclusion-action',   // Conclusion action (n'existe pas dans présentation)
            'conclusion-comparative' // Conclusion comparative (n'existe pas dans présentation)
        ];
        
        // État : sections actuelles trouvées dans l'éditeur
        this.currentSections = new Map();
        
        // Configuration : sélecteur pour les sections réorganisables
        this.sectionSelector = '.reorganizable-section[data-section-id]';
        
        this.isInitialized = false;
    }
    
    /**
     * Initialisation : mise en place du synchronisateur
     */
    init() {
        // Analyse : sections actuelles dans l'éditeur
        this.analyzeSections();
        
        // Vérification : ordre des sections
        const isOrdered = this.verifySectionOrder();
        
        if (!isOrdered) {
            // Correction : réorganisation nécessaire
            this.reorganizeSections();
        }
        
        // Application : masquage des sections éditeur uniquement
        this.hideEditorOnlySections();
        
        // Écoute : changements futurs (si nécessaire)
        this.setupOrderWatcher();
        
        this.isInitialized = true;
        console.log('🔄 SectionSynchronizer initialisé - Sections synchronisées');
    }
    
    /**
     * Analyse : identification des sections présentes dans l'éditeur
     */
    analyzeSections() {
        // Recherche : toutes les sections réorganisables
        const sectionElements = document.querySelectorAll(this.sectionSelector);
        
        // Rôle      : Réinitialiser la carte des sections courantes
        // Type      : Map<string, Element>
        // Unité     : sans unité (collection de paires clé-valeur)
        // Domaine   : sections existantes dans le DOM
        // Formule   : currentSections = nouvelle Map vide
        // Exemple   : Map vide → prête pour nouvelle analyse
        this.currentSections.clear();
        
        sectionElements.forEach(element => {
            // Rôle      : Identifiant de section depuis attribut data
            // Type      : string
            // Unité     : sans unité (nom de section)
            // Domaine   : ['hero', 'pricing', 'advantages', 'technical', 'contact', ...]
            // Formule   : sectionId = element.dataset.sectionId
            // Exemple   : 'hero'
            const sectionId = element.dataset.sectionId;
            
            if (sectionId) {
                // Stockage : section trouvée dans la carte
                this.currentSections.set(sectionId, element);
            }
        });
        
        console.log(`📊 Sections trouvées: ${this.currentSections.size} (${Array.from(this.currentSections.keys()).join(', ')})`);
    }
    
    /**
     * Vérification : ordre actuel des sections
     * @return {boolean} - true si ordre correct, false si réorganisation nécessaire
     */
    verifySectionOrder() {
        // Rôle      : Conteneur parent des sections
        // Type      : HTMLElement
        // Unité     : sans unité (élément DOM)
        // Domaine   : conteneur existant dans le DOM
        // Formule   : container = premier élément avec classe editor-container
        // Exemple   : <div class="editor-container">
        const container = document.querySelector('.editor-container');
        
        if (!container) {
            console.warn('⚠️ Conteneur sections non trouvé');
            return false;
        }
        
        // Rôle      : Sections actuelles dans l'ordre DOM
        // Type      : NodeList
        // Unité     : sans unité (collection d'éléments)
        // Domaine   : sections présentes dans le conteneur
        // Formule   : sectionsInDOM = querySelectorAll(sectionSelector)
        // Exemple   : NodeList[section#hero, section#pricing, ...]
        const sectionsInDOM = container.querySelectorAll(this.sectionSelector);
        
        // Vérification : ordre des sections présentation uniquement
        let expectedIndex = 0;
        
        for (const section of sectionsInDOM) {
            // Rôle      : ID de la section courante
            // Type      : string
            // Unité     : sans unité (identifiant)
            // Domaine   : sections définies dans correctSectionOrder ou editorOnlySections
            // Formule   : sectionId = section.dataset.sectionId
            // Exemple   : 'hero'
            const sectionId = section.dataset.sectionId;
            
            // Ignorer : sections éditeur uniquement
            if (this.editorOnlySections.includes(sectionId)) {
                continue;
            }
            
            // Vérification : section attendue à cette position
            if (this.correctSectionOrder[expectedIndex] !== sectionId) {
                console.warn(`⚠️ Section désynchronisée: attendu "${this.correctSectionOrder[expectedIndex]}" mais trouvé "${sectionId}" à l'index ${expectedIndex}`);
                return false;
            }
            
            expectedIndex++;
        }
        
        console.log('✅ Ordre des sections vérifié - Synchronisation correcte');
        return true;
    }
    
    /**
     * Réorganisation : sections dans l'ordre correct
     */
    reorganizeSections() {
        console.log('🔄 Début réorganisation des sections...');
        
        // Rôle      : Conteneur parent des sections
        // Type      : HTMLElement 
        // Unité     : sans unité (élément DOM)
        // Domaine   : conteneur existant dans le DOM
        // Formule   : container = querySelector('.editor-container')
        // Exemple   : <div class="editor-container">
        const container = document.querySelector('.editor-container');
        
        if (!container) {
            console.error('❌ Impossible de réorganiser: conteneur non trouvé');
            return;
        }
        
        // Collecte : toutes les sections actuelles
        const allSections = Array.from(container.querySelectorAll(this.sectionSelector));
        
        // Rôle      : Fragment pour reconstruction ordre
        // Type      : DocumentFragment
        // Unité     : sans unité (conteneur temporaire DOM)
        // Domaine   : fragment vide prêt à recevoir éléments
        // Formule   : fragment = createDocumentFragment()
        // Exemple   : DocumentFragment vide
        const fragment = document.createDocumentFragment();
        
        // Étape 1: Ajouter sections présentation dans l'ordre correct
        this.correctSectionOrder.forEach(sectionId => {
            // Recherche : section correspondante dans les éléments actuels
            const sectionElement = allSections.find(el => el.dataset.sectionId === sectionId);
            
            if (sectionElement) {
                // Déplacement : section vers fragment dans bon ordre
                fragment.appendChild(sectionElement);
                console.log(`📍 Section "${sectionId}" repositionnée`);
            }
        });
        
        // Étape 2: Ajouter sections éditeur uniquement (à la fin)
        this.editorOnlySections.forEach(sectionId => {
            // Recherche : section éditeur uniquement
            const sectionElement = allSections.find(el => el.dataset.sectionId === sectionId);
            
            if (sectionElement) {
                // Ajout : section éditeur à la fin
                fragment.appendChild(sectionElement);
                console.log(`📌 Section éditeur-only "${sectionId}" ajoutée`);
            }
        });
        
        // Étape 3: Réinsertion dans le conteneur
        // Rôle      : Point d'insertion pour les sections réorganisées
        // Type      : HTMLElement
        // Unité     : sans unité (élément DOM)
        // Domaine   : éléments existants dans le conteneur
        // Formule   : insertPoint = container.querySelector('.status-message')?.nextSibling || container.firstChild
        // Exemple   : élément après status-message ou premier enfant
        const insertPoint = container.querySelector('.status-message')?.nextSibling || container.firstChild;
        
        // Insertion : toutes les sections réorganisées
        container.insertBefore(fragment, insertPoint);
        
        console.log('✅ Réorganisation terminée - Sections dans l\'ordre correct');
        
        // Notification : utilisateur de la correction
        this.showSynchronizationNotification();
    }
    
    /**
     * Masquage : sections présentes uniquement dans l'éditeur
     */
    hideEditorOnlySections() {
        this.editorOnlySections.forEach(sectionId => {
            // Recherche : section éditeur uniquement
            const section = this.currentSections.get(sectionId);
            
            if (section) {
                // Application : style de masquage visuel
                section.style.opacity = '0.5';
                section.style.border = '2px dashed rgba(239, 68, 68, 0.3)';
                
                // Ajout : indicateur visuel
                let indicator = section.querySelector('.editor-only-indicator');
                if (!indicator) {
                    // Rôle      : Indicateur visuel pour section éditeur uniquement
                    // Type      : HTMLElement
                    // Unité     : sans unité (élément DOM)
                    // Domaine   : div avec classes et contenu spécifiques
                    // Formule   : indicator = createElement('div') + classes + innerHTML
                    // Exemple   : <div class="editor-only-indicator">⚠️ Section éditeur uniquement</div>
                    indicator = document.createElement('div');
                    indicator.className = 'editor-only-indicator';
                    indicator.style.cssText = `
                        background: rgba(239, 68, 68, 0.1);
                        color: #EF4444;
                        padding: 0.5rem;
                        border-radius: 6px;
                        font-size: 0.85rem;
                        font-weight: 500;
                        text-align: center;
                        margin-bottom: 1rem;
                    `;
                    indicator.innerHTML = '⚠️ Section éditeur uniquement (non visible dans la présentation)';
                    
                    // Insertion : au début de la section
                    section.insertBefore(indicator, section.firstChild);
                }
                
                console.log(`👁️ Section "${sectionId}" marquée comme éditeur-only`);
            }
        });
    }
    
    /**
     * Notification : synchronisation effectuée
     */
    showSynchronizationNotification() {
        // Rôle      : Message de statut pour notification utilisateur
        // Type      : HTMLElement
        // Unité     : sans unité (élément DOM)
        // Domaine   : élément existant avec classe status-message
        // Formule   : statusElement = querySelector('.status-message')
        // Exemple   : <div class="status-message">
        const statusElement = document.querySelector('.status-message');
        
        if (statusElement) {
            // Configuration : message de synchronisation
            statusElement.className = 'status-message success';
            statusElement.innerHTML = `
                <i class="fas fa-sync-alt"></i>
                <strong>Synchronisation effectuée</strong> - 
                L'ordre des sections a été corrigé pour correspondre à la page de présentation
            `;
            
            // Masquage : automatique après délai
            setTimeout(() => {
                statusElement.style.display = 'none';
            }, 5000);
        }
    }
    
    /**
     * Surveillance : changements futurs d'ordre (si nécessaire)
     */
    setupOrderWatcher() {
        // Écoute : modification DOM pour détecter changements d'ordre
        const observer = new MutationObserver((mutations) => {
            // Rôle      : Indicateur de changement d'ordre détecté
            // Type      : boolean
            // Unité     : sans unité (état vrai/faux)
            // Domaine   : true si changement détecté, false sinon
            // Formule   : orderChanged = mutations.some(mutation => mutation affects order)
            // Exemple   : true
            let orderChanged = false;
            
            mutations.forEach(mutation => {
                // Vérification : type de changement affectant l'ordre
                if (mutation.type === 'childList' && mutation.target.classList?.contains('editor-container')) {
                    orderChanged = true;
                }
            });
            
            // Re-vérification : si changement détecté
            if (orderChanged && this.isInitialized) {
                setTimeout(() => {
                    // Nouvelle vérification : ordre après changement
                    if (!this.verifySectionOrder()) {
                        this.reorganizeSections();
                    }
                }, 100); // Délai pour stabilisation DOM
            }
        });
        
        // Configuration : surveillance du conteneur sections
        const container = document.querySelector('.editor-container');
        if (container) {
            observer.observe(container, {
                childList: true,
                subtree: true
            });
        }
    }
    
    /**
     * Diagnostic : état actuel de synchronisation
     * @return {Object} - Informations diagnostic
     */
    getDiagnostic() {
        return {
            correctOrder: [...this.correctSectionOrder],
            editorOnlySections: [...this.editorOnlySections],
            currentSections: Array.from(this.currentSections.keys()),
            isInitialized: this.isInitialized,
            isOrderCorrect: this.verifySectionOrder()
        };
    }
    
    /**
     * Reset : forcer nouvelle synchronisation
     */
    forceSynchronization() {
        console.log('🔄 Synchronisation forcée demandée...');
        this.analyzeSections();
        this.reorganizeSections();
        this.hideEditorOnlySections();
    }
}

// Auto-initialisation : au chargement DOM (pour page éditeur uniquement)
document.addEventListener('DOMContentLoaded', () => {
    // Vérification : page éditeur (présence d'éléments spécifiques)
    if (document.querySelector('.edit-section, .editor-container')) {
        // Instance globale : accessible depuis console et autres scripts
        window.sectionSynchronizer = new SectionSynchronizer();
        window.sectionSynchronizer.init();
        
        // Debug : exposition fonction diagnostic
        window.getSectionDiagnostic = () => window.sectionSynchronizer.getDiagnostic();
        window.forceSectionSync = () => window.sectionSynchronizer.forceSynchronization();
    }
});

// Export : pour utilisation en module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SectionSynchronizer;
}