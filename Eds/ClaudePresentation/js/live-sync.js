/**
 * Système de synchronisation en temps réel Li-CUBE PRO™
 * 
 * Rôle : Synchroniser automatiquement les modifications entre l'éditeur et la présentation
 * Type : Module JavaScript autonome
 * Unité : Gestion en temps réel des données
 * Domaine : Communication bidirectionnelle entre pages
 * Formule : sync = éditeur ↔ présentation via localStorage + événements
 * Exemple : modification dans éditeur → mise à jour immédiate présentation
 */

(function() {
    'use strict';

    /**
     * Configuration du système de synchronisation
     * 
     * Rôle : Paramètres centralisés pour la synchronisation temps réel
     * Type : Object de configuration
     * Unité : Millisecondes pour les délais, booléens pour les options
     * Domaine : 100ms ≤ pollInterval ≤ 5000ms pour performance optimale
     * Formule : performance = 1 / pollInterval (inversement proportionnel)
     * Exemple : pollInterval=500ms donne 2 vérifications/seconde
     */
    const CONFIG = {
        storageKey: 'licubepro-content',           // Clé de stockage localStorage
        pollInterval: 500,                         // Intervalle de vérification (ms)
        enableDebug: true,                         // Activer les logs de debug
        autoSave: true,                           // Sauvegarde automatique activée
        syncDelay: 100                            // Délai avant synchronisation (ms)
    };

    /**
     * État global du système de synchronisation
     * 
     * Rôle : Stockage de l'état actuel et des données de synchronisation
     * Type : Object mutable
     * Unité : Timestamps en millisecondes, hash en string
     * Domaine : lastSync ≥ 0, contentHash peut être null
     * Formule : isOutdated = (currentHash !== lastKnownHash)
     * Exemple : lastSync=1640995200000, contentHash="a1b2c3d4"
     */
    let syncState = {
        isActive: false,                          // État d'activation de la sync
        lastSync: 0,                             // Timestamp de dernière synchronisation
        contentHash: null,                       // Hash du contenu pour détecter changements
        pollTimer: null,                         // Timer pour le polling
        isEditor: false                          // Page courante est-elle l'éditeur?
    };

    /**
     * Détection automatique du type de page (éditeur vs présentation)
     * 
     * Rôle : Identifier si la page courante est l'éditeur ou la présentation
     * Type : Boolean
     * Unité : Sans unité (booléen)
     * Domaine : true (éditeur) | false (présentation)
     * Formule : isEditor = présence d'éléments d'édition OU URL contenant "edit"
     * Exemple : edit.html → true, index.html → false
     */
    function detectPageType() {
        const hasEditFields = document.querySelectorAll('.field-input').length > 0;
        const urlContainsEdit = window.location.pathname.includes('edit');
        const hasEditableElements = document.querySelectorAll('.editable').length > 0;
        
        syncState.isEditor = hasEditFields || urlContainsEdit;
        
        if (CONFIG.enableDebug) {
            console.log(`🔍 Type de page détecté: ${syncState.isEditor ? 'ÉDITEUR' : 'PRÉSENTATION'}`);
            console.log(`   - Champs d'édition: ${hasEditFields}`);
            console.log(`   - URL contient 'edit': ${urlContainsEdit}`);
            console.log(`   - Éléments éditables: ${hasEditableElements}`);
        }
        
        return syncState.isEditor;
    }

    /**
     * Génération d'un hash pour détecter les changements de contenu
     * 
     * Rôle : Créer une empreinte unique du contenu pour détecter modifications
     * Type : String (hash)
     * Unité : Caractères hexadécimaux
     * Domaine : Hash de 8 caractères (exemple: "a1b2c3d4")
     * Formule : hash = simple_hash(JSON.stringify(content))
     * Exemple : {title:"Li-CUBE"} → "f4a3b2c1"
     */
    function generateContentHash(content) {
        if (!content || typeof content !== 'object') {
            return '00000000';
        }
        
        const str = JSON.stringify(content, Object.keys(content).sort());
        let hash = 0;
        
        // Algorithme de hash simple mais efficace
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Conversion en 32bit
        }
        
        // Conversion en hexadécimal positif
        const hexHash = Math.abs(hash).toString(16).substring(0, 8).padStart(8, '0');
        
        if (CONFIG.enableDebug) {
            console.log(`📊 Hash généré: ${hexHash} pour ${Object.keys(content).length} champs`);
        }
        
        return hexHash;
    }

    /**
     * Récupération du contenu depuis le localStorage
     * 
     * Rôle : Charger et parser le contenu sauvegardé
     * Type : Object | null
     * Unité : Object avec clés string et valeurs string
     * Domaine : null si aucune donnée | Object avec données valides
     * Formule : content = JSON.parse(localStorage.getItem(key)) || null
     * Exemple : {"hero-title": "Li-CUBE PRO™", "stat-cycles": "8000+"}
     */
    function getStoredContent() {
        try {
            const stored = localStorage.getItem(CONFIG.storageKey);
            if (!stored) {
                return null;
            }
            
            const content = JSON.parse(stored);
            const fieldCount = Object.keys(content).length;
            
            if (CONFIG.enableDebug && fieldCount > 0) {
                console.log(`📥 Contenu récupéré: ${fieldCount} champs depuis localStorage`);
            }
            
            return content;
            
        } catch (error) {
            console.error('❌ Erreur lors de la récupération du contenu:', error);
            return null;
        }
    }

    /**
     * Sauvegarde du contenu dans le localStorage
     * 
     * Rôle : Persister le contenu modifié dans le navigateur
     * Type : Boolean (succès/échec)
     * Unité : Sans unité (booléen)
     * Domaine : true (succès) | false (échec)
     * Formule : success = localStorage.setItem(key, JSON.stringify(content))
     * Exemple : saveContent({title: "nouveau"}) → true
     */
    function saveContent(content) {
        try {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(content));
            syncState.lastSync = Date.now();
            syncState.contentHash = generateContentHash(content);
            
            if (CONFIG.enableDebug) {
                console.log(`💾 Contenu sauvegardé: ${Object.keys(content).length} champs, hash: ${syncState.contentHash}`);
            }
            
            // Déclencher événement personnalisé pour notifier autres pages
            window.dispatchEvent(new CustomEvent('licubeContentUpdated', {
                detail: { content, hash: syncState.contentHash, timestamp: syncState.lastSync }
            }));
            
            return true;
            
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde:', error);
            return false;
        }
    }

    /**
     * Collecte du contenu depuis les champs d'édition (page éditeur)
     * 
     * Rôle : Extraire toutes les valeurs des champs modifiables
     * Type : Object
     * Unité : Object avec champs data-field comme clés
     * Domaine : Object vide si aucun champ | Object avec toutes les valeurs
     * Formule : content[field.data-field] = field.value pour tous les champs
     * Exemple : <input data-field="title" value="test"> → {title: "test"}
     */
    function collectContentFromEditor() {
        const content = {};
        const fields = document.querySelectorAll('[data-field]');
        
        fields.forEach(field => {
            const fieldName = field.getAttribute('data-field');
            const fieldValue = field.value || field.textContent || field.innerText || '';
            
            if (fieldName) {
                content[fieldName] = fieldValue.trim();
            }
        });
        
        if (CONFIG.enableDebug && Object.keys(content).length > 0) {
            console.log(`📝 Contenu collecté depuis éditeur: ${Object.keys(content).length} champs`);
        }
        
        return content;
    }

    /**
     * Application du contenu aux éléments éditables (page présentation)
     * 
     * Rôle : Mettre à jour les éléments de présentation avec nouveau contenu
     * Type : Number (nombre d'éléments mis à jour)
     * Unité : Nombre d'éléments
     * Domaine : 0 ≤ updatedCount ≤ nombre total d'éléments éditables
     * Formule : pour chaque élément.data-field, élément.textContent = content[field]
     * Exemple : content.title="nouveau" → <span data-field="title">nouveau</span>
     */
    function applyContentToPresentation(content) {
        if (!content || typeof content !== 'object') {
            return 0;
        }
        
        let updatedCount = 0;
        
        Object.entries(content).forEach(([fieldName, value]) => {
            const elements = document.querySelectorAll(`[data-field="${fieldName}"]`);
            
            elements.forEach(element => {
                const currentValue = element.textContent || element.innerText || '';
                
                if (currentValue !== value) {
                    // Animation subtile lors du changement
                    element.style.transition = 'all 0.3s ease';
                    element.style.backgroundColor = 'rgba(96, 165, 250, 0.1)';
                    
                    // Appliquer la nouvelle valeur
                    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                        element.value = value;
                    } else {
                        element.textContent = value;
                    }
                    
                    updatedCount++;
                    
                    // Enlever l'animation après un délai
                    setTimeout(() => {
                        element.style.backgroundColor = '';
                    }, 600);
                }
            });
        });
        
        if (CONFIG.enableDebug && updatedCount > 0) {
            console.log(`🔄 Présentation mise à jour: ${updatedCount} éléments modifiés`);
        }
        
        return updatedCount;
    }

    /**
     * Synchronisation depuis l'éditeur vers le stockage
     * 
     * Rôle : Collecter et sauvegarder les modifications de l'éditeur
     * Type : Boolean (synchronisation effectuée ou non)
     * Unité : Sans unité (booléen)
     * Domaine : true si sync effectuée | false si pas nécessaire
     * Formule : needsSync = (newHash !== currentHash)
     * Exemple : modification dans éditeur → collecte → sauvegarde → true
     */
    function syncFromEditor() {
        const currentContent = collectContentFromEditor();
        const newHash = generateContentHash(currentContent);
        
        // Vérifier si synchronisation nécessaire
        if (newHash === syncState.contentHash) {
            return false; // Pas de changement
        }
        
        const success = saveContent(currentContent);
        
        if (success && CONFIG.enableDebug) {
            console.log(`⬆️ Sync éditeur → stockage: ${Object.keys(currentContent).length} champs`);
        }
        
        return success;
    }

    /**
     * Synchronisation depuis le stockage vers la présentation
     * 
     * Rôle : Charger et appliquer les modifications à la présentation
     * Type : Boolean (synchronisation effectuée ou non)
     * Unité : Sans unité (booléen)
     * Domaine : true si sync effectuée | false si pas nécessaire
     * Formule : needsSync = (storedHash !== currentHash)
     * Exemple : changement détecté → chargement → application → true
     */
    function syncToPresentation() {
        const storedContent = getStoredContent();
        if (!storedContent) {
            return false;
        }
        
        const storedHash = generateContentHash(storedContent);
        
        // Vérifier si synchronisation nécessaire
        if (storedHash === syncState.contentHash) {
            return false; // Pas de changement
        }
        
        const updatedCount = applyContentToPresentation(storedContent);
        syncState.contentHash = storedHash;
        
        if (updatedCount > 0 && CONFIG.enableDebug) {
            console.log(`⬇️ Sync stockage → présentation: ${updatedCount} éléments mis à jour`);
        }
        
        return updatedCount > 0;
    }

    /**
     * Cycle de synchronisation principal
     * 
     * Rôle : Exécuter un cycle complet de synchronisation selon le type de page
     * Type : Void (procédure)
     * Unité : Sans unité (action)
     * Domaine : Éditeur OU présentation
     * Formule : cycle = (isEditor ? syncFromEditor : syncToPresentation)()
     * Exemple : page éditeur → collecte + sauvegarde, présentation → chargement + affichage
     */
    function performSyncCycle() {
        try {
            let syncPerformed = false;
            
            if (syncState.isEditor) {
                // Synchroniser depuis l'éditeur vers le stockage
                syncPerformed = syncFromEditor();
            } else {
                // Synchroniser depuis le stockage vers la présentation
                syncPerformed = syncToPresentation();
            }
            
            if (syncPerformed) {
                syncState.lastSync = Date.now();
            }
            
        } catch (error) {
            console.error('❌ Erreur durant le cycle de synchronisation:', error);
        }
    }

    /**
     * Démarrage du système de synchronisation automatique
     * 
     * Rôle : Initialiser et lancer le polling automatique
     * Type : Void (procédure d'initialisation)
     * Unité : Timer en millisecondes
     * Domaine : CONFIG.pollInterval comme fréquence de vérification
     * Formule : timer = setInterval(performSyncCycle, pollInterval)
     * Exemple : démarrage → cycle toutes les 500ms → sync automatique
     */
    function startSync() {
        if (syncState.isActive) {
            console.warn('⚠️ Synchronisation déjà active');
            return;
        }
        
        detectPageType();
        
        // Synchronisation initiale
        const initialContent = getStoredContent();
        if (initialContent) {
            syncState.contentHash = generateContentHash(initialContent);
            
            if (!syncState.isEditor) {
                applyContentToPresentation(initialContent);
            }
        }
        
        // Démarrer le polling automatique
        syncState.pollTimer = setInterval(performSyncCycle, CONFIG.pollInterval);
        syncState.isActive = true;
        
        if (CONFIG.enableDebug) {
            console.log(`🚀 Synchronisation démarrée (${syncState.isEditor ? 'ÉDITEUR' : 'PRÉSENTATION'})`);
            console.log(`   - Intervalle: ${CONFIG.pollInterval}ms`);
            console.log(`   - Hash initial: ${syncState.contentHash || 'aucun'}`);
        }
        
        // Écouter les événements de stockage (changements depuis autres onglets)
        window.addEventListener('storage', function(event) {
            if (event.key === CONFIG.storageKey && !syncState.isEditor) {
                if (CONFIG.enableDebug) {
                    console.log('📻 Changement détecté depuis autre onglet');
                }
                performSyncCycle();
            }
        });
    }

    /**
     * Arrêt du système de synchronisation
     * 
     * Rôle : Nettoyer et arrêter tous les timers et écouteurs
     * Type : Void (procédure de nettoyage)
     * Unité : Sans unité (nettoyage)
     * Domaine : Système actif → système inactif
     * Formule : cleanup = clearInterval(timer) + removeEventListeners()
     * Exemple : arrêt → nettoyage timer → désactivation écouteurs
     */
    function stopSync() {
        if (!syncState.isActive) {
            return;
        }
        
        if (syncState.pollTimer) {
            clearInterval(syncState.pollTimer);
            syncState.pollTimer = null;
        }
        
        syncState.isActive = false;
        
        if (CONFIG.enableDebug) {
            console.log('⏹️ Synchronisation arrêtée');
        }
    }

    /**
     * Configuration d'événements spéciaux pour l'éditeur
     * 
     * Rôle : Ajouter des écouteurs pour synchronisation immédiate sur modifications
     * Type : Void (configuration d'événements)
     * Unité : Sans unité (configuration)
     * Domaine : Page éditeur seulement
     * Formule : addEventListener(input/change, immediateSyncWithDelay)
     * Exemple : utilisateur tape → délai 100ms → sync immédiate
     */
    function setupEditorEvents() {
        if (!syncState.isEditor) {
            return;
        }
        
        const fields = document.querySelectorAll('[data-field]');
        let syncTimeout = null;
        
        // Synchronisation immédiate avec délai anti-rebond
        function triggerImmediateSync() {
            if (syncTimeout) {
                clearTimeout(syncTimeout);
            }
            
            syncTimeout = setTimeout(() => {
                performSyncCycle();
                
                if (CONFIG.enableDebug) {
                    console.log('⚡ Synchronisation immédiate déclenchée');
                }
            }, CONFIG.syncDelay);
        }
        
        // Attacher les écouteurs à tous les champs
        fields.forEach(field => {
            field.addEventListener('input', triggerImmediateSync);
            field.addEventListener('change', triggerImmediateSync);
            field.addEventListener('blur', triggerImmediateSync);
        });
        
        if (CONFIG.enableDebug) {
            console.log(`🎯 Événements configurés pour ${fields.length} champs d'édition`);
        }
    }

    /**
     * API publique du module de synchronisation
     * 
     * Rôle : Exposer les fonctions principales pour utilisation externe
     * Type : Object avec méthodes publiques
     * Unité : Interface programmatique
     * Domaine : start, stop, forceSync, getState
     * Formule : API = {fonctions_publiques_principales}
     * Exemple : window.LiveSync.start() → démarre la synchronisation
     */
    const LiveSyncAPI = {
        // Démarrer la synchronisation
        start: startSync,
        
        // Arrêter la synchronisation
        stop: stopSync,
        
        // Forcer une synchronisation immédiate
        forceSync: performSyncCycle,
        
        // Obtenir l'état actuel
        getState: () => ({ ...syncState }),
        
        // Changer la configuration
        configure: (newConfig) => {
            Object.assign(CONFIG, newConfig);
            if (CONFIG.enableDebug) {
                console.log('⚙️ Configuration mise à jour:', newConfig);
            }
        },
        
        // Obtenir la configuration actuelle
        getConfig: () => ({ ...CONFIG })
    };

    /**
     * Initialisation automatique du système
     * 
     * Rôle : Démarrer automatiquement la synchronisation au chargement
     * Type : Void (initialisation automatique)
     * Unité : Sans unité (événement DOM)
     * Domaine : DOMContentLoaded → initialisation
     * Formule : init = detectPage() + setupEvents() + startSync()
     * Exemple : page chargée → détection type → démarrage auto
     */
    function autoInit() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setupEditorEvents();
                startSync();
            });
        } else {
            setupEditorEvents();
            startSync();
        }
    }

    // Exposer l'API globalement
    window.LiveSync = LiveSyncAPI;
    
    // Initialisation automatique
    autoInit();
    
    if (CONFIG.enableDebug) {
        console.log('🔗 Système de synchronisation Li-CUBE PRO™ chargé');
        console.log('   - API disponible : window.LiveSync');
        console.log('   - Configuration :', CONFIG);
    }

})();