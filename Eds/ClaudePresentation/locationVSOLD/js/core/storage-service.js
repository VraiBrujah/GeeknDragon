/**
 * Service de Stockage Unifié Li-CUBE PRO™
 * 
 * Rôle : Abstraction unifiée pour toutes les opérations de stockage
 * Responsabilité : localStorage, sessionStorage, cache en mémoire avec fallbacks
 * Extensibilité : Support de nouveaux backends de stockage
 * Répertoire de Travail : C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\ClaudePresentation
 */

class StorageService {
    constructor(config = {}) {
        // Rôle : Configuration du service de stockage
        // Type : Object - Paramètres personnalisables du service
        this.config = {
            prefix: config.prefix || 'licubepro',
            useCompression: config.useCompression || false,
            fallbackToMemory: config.fallbackToMemory !== false,
            maxMemorySize: config.maxMemorySize || 50, // MB
            enableEncryption: config.enableEncryption || false,
            ...config
        };
        
        // Rôle : Cache en mémoire pour fallback
        // Type : Map - Stockage haute performance en mémoire
        this.memoryCache = new Map();
        
        // Rôle : Statistiques d'utilisation
        // Type : Object - Métriques de performance et utilisation
        this.stats = {
            reads: 0,
            writes: 0,
            errors: 0,
            memoryUsage: 0,
            lastOperation: null
        };
        
        // Rôle : Observateurs pour événements de stockage
        // Type : Set - Collection des callbacks d'événements
        this.observers = new Set();
        
        this.init();
    }
    
    /**
     * Initialisation : vérification des capacités et configuration
     */
    init() {
        // Vérification : disponibilité de localStorage
        this.hasLocalStorage = this.testStorageAvailability('localStorage');
        this.hasSessionStorage = this.testStorageAvailability('sessionStorage');
        
        // Configuration : fallback approprié
        if (!this.hasLocalStorage && !this.hasSessionStorage) {
            console.warn('⚠️ Aucun stockage persistant disponible, utilisation mémoire uniquement');
            this.config.fallbackToMemory = true;
        }
        
        // Initialisation : nettoyage automatique
        this.startCleanupTimer();
        
        console.log(`✅ StorageService initialisé (localStorage: ${this.hasLocalStorage}, sessionStorage: ${this.hasSessionStorage})`);
    }
    
    /**
     * Test : disponibilité d'un type de stockage
     * @param {string} storageType - Type de stockage à tester
     * @return {boolean} - true si disponible et fonctionnel
     */
    testStorageAvailability(storageType) {
        try {
            const storage = window[storageType];
            const testKey = '__storage_test__';
            storage.setItem(testKey, 'test');
            storage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Stockage : sauvegarde d'une valeur avec clé
     * @param {string} key - Clé de stockage
     * @param {any} value - Valeur à stocker
     * @param {Object} options - Options de stockage
     * @return {Promise<boolean>} - true si succès
     */
    async set(key, value, options = {}) {
        // Rôle : Stockage unifié avec options flexibles
        // Options : temporary, compress, encrypt, ttl
        const fullKey = this.generateKey(key);
        const storageOptions = { ...this.config, ...options };
        
        try {
            // Préparation : données avec métadonnées
            const dataToStore = {
                value: value,
                timestamp: Date.now(),
                ttl: storageOptions.ttl || null,
                compressed: storageOptions.useCompression,
                encrypted: storageOptions.enableEncryption
            };
            
            // Traitement : compression si activée
            if (storageOptions.useCompression) {
                dataToStore.value = await this.compress(value);
            }
            
            // Traitement : chiffrement si activé
            if (storageOptions.enableEncryption) {
                dataToStore.value = await this.encrypt(dataToStore.value);
            }
            
            const serializedData = JSON.stringify(dataToStore);
            
            // Tentative : stockage localStorage prioritaire
            if (this.hasLocalStorage && !storageOptions.temporary) {
                localStorage.setItem(fullKey, serializedData);
            }
            // Fallback : sessionStorage
            else if (this.hasSessionStorage && !storageOptions.temporary) {
                sessionStorage.setItem(fullKey, serializedData);
            }
            // Fallback : cache mémoire
            else if (this.config.fallbackToMemory) {
                this.memoryCache.set(fullKey, dataToStore);
                this.updateMemoryUsage();
            } else {
                throw new Error('Aucun backend de stockage disponible');
            }
            
            // Statistiques : mise à jour
            this.stats.writes++;
            this.stats.lastOperation = { type: 'set', key: fullKey, timestamp: Date.now() };
            
            // Notification : observateurs
            this.notifyObservers('set', { key: fullKey, value, options: storageOptions });
            
            return true;
            
        } catch (error) {
            this.stats.errors++;
            console.error(`❌ Erreur stockage ${fullKey}:`, error);
            this.notifyObservers('error', { operation: 'set', key: fullKey, error });
            return false;
        }
    }
    
    /**
     * Récupération : lecture d'une valeur par clé
     * @param {string} key - Clé de stockage
     * @param {any} defaultValue - Valeur par défaut si non trouvée
     * @return {any} - Valeur stockée ou valeur par défaut
     */
    async get(key, defaultValue = null) {
        // Rôle : Récupération unifiée avec gestion TTL et décompression
        const fullKey = this.generateKey(key);
        
        try {
            let rawData = null;
            let source = null;
            
            // Tentative : localStorage prioritaire
            if (this.hasLocalStorage) {
                rawData = localStorage.getItem(fullKey);
                source = 'localStorage';
            }
            // Fallback : sessionStorage
            else if (this.hasSessionStorage) {
                rawData = sessionStorage.getItem(fullKey);
                source = 'sessionStorage';
            }
            // Fallback : cache mémoire
            else if (this.config.fallbackToMemory && this.memoryCache.has(fullKey)) {
                const memoryData = this.memoryCache.get(fullKey);
                rawData = JSON.stringify(memoryData);
                source = 'memory';
            }
            
            // Vérification : données trouvées
            if (!rawData) {
                return defaultValue;
            }
            
            const dataObj = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
            
            // Vérification : expiration TTL
            if (dataObj.ttl && Date.now() > dataObj.timestamp + dataObj.ttl) {
                await this.remove(key); // Nettoyage automatique
                return defaultValue;
            }
            
            let value = dataObj.value;
            
            // Traitement : déchiffrement si nécessaire
            if (dataObj.encrypted) {
                value = await this.decrypt(value);
            }
            
            // Traitement : décompression si nécessaire  
            if (dataObj.compressed) {
                value = await this.decompress(value);
            }
            
            // Statistiques : mise à jour
            this.stats.reads++;
            this.stats.lastOperation = { type: 'get', key: fullKey, source, timestamp: Date.now() };
            
            // Notification : observateurs
            this.notifyObservers('get', { key: fullKey, value, source });
            
            return value;
            
        } catch (error) {
            this.stats.errors++;
            console.error(`❌ Erreur lecture ${fullKey}:`, error);
            this.notifyObservers('error', { operation: 'get', key: fullKey, error });
            return defaultValue;
        }
    }
    
    /**
     * Suppression : retrait d'une clé du stockage
     * @param {string} key - Clé à supprimer
     * @return {boolean} - true si supprimée avec succès
     */
    async remove(key) {
        const fullKey = this.generateKey(key);
        
        try {
            // Suppression : tous les backends
            if (this.hasLocalStorage) {
                localStorage.removeItem(fullKey);
            }
            if (this.hasSessionStorage) {
                sessionStorage.removeItem(fullKey);
            }
            if (this.memoryCache.has(fullKey)) {
                this.memoryCache.delete(fullKey);
                this.updateMemoryUsage();
            }
            
            // Notification : observateurs
            this.notifyObservers('remove', { key: fullKey });
            
            return true;
            
        } catch (error) {
            this.stats.errors++;
            console.error(`❌ Erreur suppression ${fullKey}:`, error);
            return false;
        }
    }
    
    /**
     * Vérification : existence d'une clé
     * @param {string} key - Clé à vérifier
     * @return {boolean} - true si la clé existe
     */
    async has(key) {
        const value = await this.get(key, Symbol('NOT_FOUND'));
        return value !== Symbol('NOT_FOUND');
    }
    
    /**
     * Liste : toutes les clés avec préfixe optionnel
     * @param {string} prefix - Préfixe optionnel pour filtrer
     * @return {Array<string>} - Liste des clés
     */
    keys(prefix = '') {
        const fullPrefix = this.generateKey(prefix);
        const allKeys = [];
        
        // Collection : clés localStorage
        if (this.hasLocalStorage) {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(fullPrefix)) {
                    allKeys.push(this.stripPrefix(key));
                }
            }
        }
        
        // Collection : clés sessionStorage  
        if (this.hasSessionStorage) {
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && key.startsWith(fullPrefix) && !allKeys.includes(this.stripPrefix(key))) {
                    allKeys.push(this.stripPrefix(key));
                }
            }
        }
        
        // Collection : clés cache mémoire
        for (const key of this.memoryCache.keys()) {
            if (key.startsWith(fullPrefix)) {
                const strippedKey = this.stripPrefix(key);
                if (!allKeys.includes(strippedKey)) {
                    allKeys.push(strippedKey);
                }
            }
        }
        
        return allKeys;
    }
    
    /**
     * Nettoyage : suppression des données expirées
     * @return {number} - Nombre d'éléments supprimés
     */
    async cleanup() {
        let removedCount = 0;
        const now = Date.now();
        
        // Nettoyage : localStorage
        if (this.hasLocalStorage) {
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.config.prefix)) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        if (data.ttl && now > data.timestamp + data.ttl) {
                            localStorage.removeItem(key);
                            removedCount++;
                        }
                    } catch (e) {
                        // Suppression des données corrompues
                        localStorage.removeItem(key);
                        removedCount++;
                    }
                }
            }
        }
        
        // Nettoyage : cache mémoire
        for (const [key, data] of this.memoryCache.entries()) {
            if (data.ttl && now > data.timestamp + data.ttl) {
                this.memoryCache.delete(key);
                removedCount++;
            }
        }
        
        if (removedCount > 0) {
            console.log(`🧹 Nettoyage: ${removedCount} éléments expirés supprimés`);
            this.updateMemoryUsage();
        }
        
        return removedCount;
    }
    
    /**
     * Génération : clé complète avec préfixe
     * @param {string} key - Clé de base
     * @return {string} - Clé avec préfixe
     */
    generateKey(key) {
        return `${this.config.prefix}-${key}`;
    }
    
    /**
     * Suppression : préfixe d'une clé complète
     * @param {string} fullKey - Clé avec préfixe
     * @return {string} - Clé sans préfixe
     */
    stripPrefix(fullKey) {
        return fullKey.replace(`${this.config.prefix}-`, '');
    }
    
    /**
     * Compression : données pour réduire la taille
     * @param {any} data - Données à comprimer
     * @return {string} - Données comprimées
     */
    async compress(data) {
        // Implémentation basique : JSON minifié
        // TODO: Implémenter vraie compression (LZ-string, gzip)
        return JSON.stringify(data);
    }
    
    /**
     * Décompression : restauration des données comprimées
     * @param {string} compressedData - Données comprimées
     * @return {any} - Données décomprimées
     */
    async decompress(compressedData) {
        try {
            return JSON.parse(compressedData);
        } catch (error) {
            console.warn('⚠️ Erreur décompression, retour données brutes');
            return compressedData;
        }
    }
    
    /**
     * Chiffrement : sécurisation des données sensibles
     * @param {any} data - Données à chiffrer
     * @return {string} - Données chiffrées
     */
    async encrypt(data) {
        // TODO: Implémenter vraie encryption (WebCrypto API)
        // Implémentation basique pour l'instant
        return btoa(JSON.stringify(data));
    }
    
    /**
     * Déchiffrement : restauration des données chiffrées
     * @param {string} encryptedData - Données chiffrées
     * @return {any} - Données déchiffrées
     */
    async decrypt(encryptedData) {
        try {
            return JSON.parse(atob(encryptedData));
        } catch (error) {
            console.warn('⚠️ Erreur déchiffrement, retour données brutes');
            return encryptedData;
        }
    }
    
    /**
     * Mise à jour : calcul de l'utilisation mémoire
     */
    updateMemoryUsage() {
        let totalSize = 0;
        
        for (const [key, value] of this.memoryCache.entries()) {
            totalSize += JSON.stringify(value).length * 2; // Approximation UTF-16
        }
        
        this.stats.memoryUsage = Math.round(totalSize / 1024 / 1024 * 100) / 100; // MB
        
        // Vérification : limite mémoire
        if (this.stats.memoryUsage > this.config.maxMemorySize) {
            this.evictOldestEntries();
        }
    }
    
    /**
     * Éviction : suppression des entrées les plus anciennes
     */
    evictOldestEntries() {
        // Tri : par timestamp (plus ancien en premier)
        const entries = Array.from(this.memoryCache.entries())
            .sort(([,a], [,b]) => a.timestamp - b.timestamp);
        
        // Suppression : 25% des entrées les plus anciennes
        const toRemove = Math.ceil(entries.length * 0.25);
        
        for (let i = 0; i < toRemove; i++) {
            const [key] = entries[i];
            this.memoryCache.delete(key);
        }
        
        this.updateMemoryUsage();
        console.log(`🧹 Éviction mémoire: ${toRemove} entrées supprimées`);
    }
    
    /**
     * Timer : nettoyage automatique périodique
     */
    startCleanupTimer() {
        // Nettoyage : toutes les 5 minutes
        setInterval(async () => {
            await this.cleanup();
        }, 5 * 60 * 1000);
    }
    
    /**
     * Observer : ajout d'un observateur d'événements
     * @param {Function} callback - Fonction callback
     */
    addObserver(callback) {
        this.observers.add(callback);
    }
    
    /**
     * Observer : suppression d'un observateur
     * @param {Function} callback - Fonction callback à supprimer
     */
    removeObserver(callback) {
        this.observers.delete(callback);
    }
    
    /**
     * Notification : envoi d'événement aux observateurs
     * @param {string} event - Type d'événement
     * @param {any} data - Données de l'événement
     */
    notifyObservers(event, data) {
        this.observers.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Erreur observateur StorageService:', error);
            }
        });
    }
    
    /**
     * Statistiques : informations sur l'utilisation du service
     * @return {Object} - Statistiques détaillées
     */
    getStats() {
        return {
            ...this.stats,
            cacheSize: this.memoryCache.size,
            hasLocalStorage: this.hasLocalStorage,
            hasSessionStorage: this.hasSessionStorage,
            config: this.config
        };
    }
}

// Instance globale singleton
window.StorageService = window.StorageService || new StorageService();

// Export ES6
export default window.StorageService;

// Export CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageService;
}