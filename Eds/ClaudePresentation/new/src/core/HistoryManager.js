/**
 * Gestionnaire d'historique pour système undo/redo
 * 
 * Rôle : Gestion des états antérieurs pour permettre annulation/restauration
 * Type : Classe de gestion d'historique avec pile LIFO
 * Responsabilité : Sauvegarde, restauration et navigation dans l'historique
 */
class HistoryManager {
    constructor() {
        // Rôle : Pile des états précédents pour undo
        // Type : Array<Object> (pile LIFO des états)
        // Unité : Sans unité (nombre d'états)
        // Domaine : 0 ≤ length ≤ maxHistorySize
        // Formule : Pile LIFO avec limitation de taille
        // Exemple : [{état1}, {état2}, {état3}] où état3 = plus récent
        this.undoStack = [];

        // Rôle : Pile des états pour redo après undo
        // Type : Array<Object> (pile LIFO des états annulés)
        // Unité : Sans unité (nombre d'états)
        // Domaine : 0 ≤ length ≤ maxHistorySize
        // Formule : Se remplit lors d'undo, se vide lors de nouvelles actions
        // Exemple : [{étatAnnulé1}, {étatAnnulé2}]
        this.redoStack = [];

        // Rôle : Taille maximum de l'historique pour éviter surcharge mémoire
        // Type : Number (limite d'états stockés)
        // Unité : Sans unité (nombre d'états)
        // Domaine : 1 ≤ maxHistorySize ≤ 1000
        // Formule : Constante définie selon usage et mémoire disponible
        // Exemple : 50 → max 50 états undo + 50 états redo
        this.maxHistorySize = 50;

        // Rôle : Indicateur de modification en cours pour éviter boucles infinies
        // Type : Boolean (flag d'état)
        // Unité : Sans unité
        // Domaine : true | false
        // Formule : true pendant undo/redo, false sinon
        // Exemple : true → ignore les saveState() automatiques
        this.isPerformingHistoryAction = false;

        console.log('📚 HistoryManager initialisé avec limite de', this.maxHistorySize, 'états');
    }

    /**
     * Sauvegarde un état dans l'historique
     * 
     * @param {Object} state - État à sauvegarder (présentation complète)
     * @param {string} actionDescription - Description de l'action (optionnelle)
     */
    saveState(state, actionDescription = 'Modification') {
        // Ignorer si on est en train de faire undo/redo
        if (this.isPerformingHistoryAction) {
            return;
        }

        try {
            // Rôle : Copie profonde de l'état pour éviter les références partagées
            // Type : Object (clone indépendant de l'état)
            // Unité : Sans unité
            // Domaine : Object complet cloné récursivement
            // Formule : JSON.parse(JSON.stringify(state)) → clonage profond
            // Exemple : État original modifié n'affecte pas l'historique
            const stateCopy = JSON.parse(JSON.stringify(state));

            // Ajout des métadonnées d'historique
            const historyEntry = {
                state: stateCopy,
                timestamp: new Date().toISOString(),
                action: actionDescription,
                id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
            };

            // Ajout à la pile undo
            this.undoStack.push(historyEntry);

            // Rôle : Limitation de la taille de pile pour éviter surcharge mémoire
            // Type : Array avec taille contrôlée
            // Unité : Sans unité (nombre d'éléments)
            // Domaine : length ≤ maxHistorySize
            // Formule : Si length > max → supprimer les plus anciens (shift())
            // Exemple : maxSize=3, pile=[A,B,C,D] → pile=[B,C,D]
            if (this.undoStack.length > this.maxHistorySize) {
                this.undoStack.shift(); // Supprimer le plus ancien
            }

            // Rôle : Vidage de la pile redo car nouvelle action annule les redo possibles
            // Type : Array reset
            // Unité : Sans unité
            // Domaine : length = 0 après nouvelle action
            // Formule : Nouvelle action → impossible de redo les actions annulées
            // Exemple : [undo1, undo2] + nouvelle action → redo impossible
            this.redoStack = [];

            console.log(`💾 État sauvegardé: ${actionDescription} (historique: ${this.undoStack.length} états)`);
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde d\'état:', error);
        }
    }

    /**
     * Annule la dernière action (undo)
     * 
     * @returns {Object|null} État restauré ou null si rien à annuler
     */
    undo() {
        if (this.undoStack.length === 0) {
            console.warn('⚠️ Aucune action à annuler');
            return null;
        }

        try {
            // Flag pour éviter la sauvegarde recursive
            this.isPerformingHistoryAction = true;

            // Rôle : Récupération de l'état à restaurer (avant-dernier)
            // Type : Object (état précédent)
            // Unité : Sans unité
            // Domaine : État valide de présentation
            // Formule : undoStack[length-2] si existe, sinon état initial
            // Exemple : [état1, état2, état3] → restaurer état2, sauver état3 pour redo
            const currentEntry = this.undoStack.pop(); // État actuel
            const previousEntry = this.undoStack.length > 0 ? this.undoStack[this.undoStack.length - 1] : null;

            if (currentEntry) {
                // Ajouter l'état actuel à la pile redo
                this.redoStack.push(currentEntry);
                
                // Limiter la taille de la pile redo
                if (this.redoStack.length > this.maxHistorySize) {
                    this.redoStack.shift();
                }
            }

            // Restaurer l'état précédent
            const stateToRestore = previousEntry ? previousEntry.state : null;

            console.log(`↶ Undo effectué: ${currentEntry ? currentEntry.action : 'Action inconnue'}`);
            
            return stateToRestore;
        } catch (error) {
            console.error('❌ Erreur lors de l\'undo:', error);
            return null;
        } finally {
            // Rétablir le flag
            this.isPerformingHistoryAction = false;
        }
    }

    /**
     * Restaure une action annulée (redo)
     * 
     * @returns {Object|null} État restauré ou null si rien à restaurer
     */
    redo() {
        if (this.redoStack.length === 0) {
            console.warn('⚠️ Aucune action à restaurer');
            return null;
        }

        try {
            // Flag pour éviter la sauvegarde recursive
            this.isPerformingHistoryAction = true;

            // Rôle : Récupération de l'état à restaurer depuis la pile redo
            // Type : Object (état annulé à restaurer)
            // Unité : Sans unité
            // Domaine : État valide de présentation
            // Formule : redoStack.pop() → dernier état annulé
            // Exemple : Restoration de l'action qui avait été undoée
            const entryToRedo = this.redoStack.pop();

            if (entryToRedo) {
                // Remettre dans la pile undo
                this.undoStack.push(entryToRedo);

                console.log(`↷ Redo effectué: ${entryToRedo.action}`);
                return entryToRedo.state;
            }

            return null;
        } catch (error) {
            console.error('❌ Erreur lors du redo:', error);
            return null;
        } finally {
            // Rétablir le flag
            this.isPerformingHistoryAction = false;
        }
    }

    /**
     * Vérifie si undo est possible
     * 
     * @returns {boolean} true si undo possible
     */
    canUndo() {
        return this.undoStack.length > 1; // On garde toujours l'état initial
    }

    /**
     * Vérifie si redo est possible
     * 
     * @returns {boolean} true si redo possible
     */
    canRedo() {
        return this.redoStack.length > 0;
    }

    /**
     * Retourne l'historique complet pour debug/affichage
     * 
     * @returns {Object} Historique complet avec métadonnées
     */
    getHistory() {
        return {
            undoStack: this.undoStack.map(entry => ({
                id: entry.id,
                action: entry.action,
                timestamp: entry.timestamp
            })),
            redoStack: this.redoStack.map(entry => ({
                id: entry.id,
                action: entry.action,
                timestamp: entry.timestamp
            })),
            canUndo: this.canUndo(),
            canRedo: this.canRedo(),
            totalStates: this.undoStack.length + this.redoStack.length
        };
    }

    /**
     * Vide complètement l'historique
     * 
     * Attention: Action irréversible, à utiliser avec précaution
     */
    clearHistory() {
        this.undoStack = [];
        this.redoStack = [];
        console.log('🗑️ Historique vidé complètement');
    }

    /**
     * Configure la taille maximum de l'historique
     * 
     * @param {number} maxSize - Nouvelle taille maximum
     */
    setMaxHistorySize(maxSize) {
        if (maxSize < 1 || maxSize > 1000) {
            throw new Error('La taille d\'historique doit être entre 1 et 1000');
        }

        this.maxHistorySize = maxSize;

        // Rôle : Ajustement des piles existantes à la nouvelle taille
        // Type : Array trimming (réduction de taille)
        // Unité : Sans unité (nombre d'éléments)
        // Domaine : length ≤ nouveauMaxSize
        // Formule : Si length > nouveauMax → garder les plus récents
        // Exemple : maxSize=10, pile de 15 → garder les 10 plus récents
        while (this.undoStack.length > maxSize) {
            this.undoStack.shift();
        }
        while (this.redoStack.length > maxSize) {
            this.redoStack.shift();
        }

        console.log(`⚙️ Taille maximum d'historique définie à ${maxSize}`);
    }

    /**
     * Exporte l'historique vers JSON pour sauvegarde persistante
     * 
     * @returns {string} Historique au format JSON
     */
    exportHistory() {
        const exportData = {
            undoStack: this.undoStack,
            redoStack: this.redoStack,
            maxHistorySize: this.maxHistorySize,
            exportTimestamp: new Date().toISOString(),
            version: '1.0.0'
        };

        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Importe un historique depuis JSON
     * 
     * @param {string} jsonData - Données JSON d'historique
     * @returns {boolean} Succès de l'importation
     */
    importHistory(jsonData) {
        try {
            const importData = JSON.parse(jsonData);

            // Validation de la structure
            if (!Array.isArray(importData.undoStack) || !Array.isArray(importData.redoStack)) {
                throw new Error('Structure d\'historique invalide');
            }

            this.undoStack = importData.undoStack;
            this.redoStack = importData.redoStack;
            
            if (importData.maxHistorySize) {
                this.maxHistorySize = importData.maxHistorySize;
            }

            console.log(`📥 Historique importé: ${this.undoStack.length} undo, ${this.redoStack.length} redo`);
            return true;
        } catch (error) {
            console.error('❌ Erreur lors de l\'importation d\'historique:', error);
            return false;
        }
    }
}

// Export de la classe pour utilisation dans d'autres modules
window.HistoryManager = HistoryManager;