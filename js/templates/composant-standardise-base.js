/**
 * Classe de base standardisée v2.1.0 pour tous les composants Geek & Dragon
 * 
 * Cette classe fournit l'architecture commune que tous les composants doivent étendre.
 * Elle garantit la cohérence de l'API, la gestion d'erreurs unifiée, et la performance
 * optimisée à travers tout le site.
 * 
 * @abstract
 * @version 2.1.0
 * @author Brujah - Geek & Dragon
 * @since 2024-12
 */
class ComposantStandardiseBase {
    /**
     * Initialise le composant avec la configuration standardisée
     * 
     * @param {Object} options - Options de configuration du composant
     * @param {string} [options.identifiant] - Identifiant unique (auto-généré si absent)
     * @param {string} [options.langue='fr'] - Langue du composant
     * @param {Object} [options.parametres={}] - Paramètres spécifiques au composant
     * @param {Array<Function>} [options.callbacks=[]] - Callbacks d'événements initiaux
     * @param {boolean} [options.debug=false] - Mode debug activé
     */
    constructor(options = {}) {
        // === IDENTIFICATION ET MÉTADONNÉES ===
        this.identifiantComposant = options.identifiant || this._genererIdentifiant();
        this.versionAPI = '2.1.0';
        this.nomClasse = this.constructor.name;
        this.langueActive = options.langue || document.documentElement.lang || 'fr';
        this.modeDebug = options.debug || false;
        
        // === CONFIGURATION CENTRALISÉE ===
        this.parametresConfiguration = this._chargerConfiguration(options.parametres || {});
        
        // === GESTION D'ÉTAT RÉACTIVE ===
        this.etatActuel = 'initialisation';
        this.donneesPrecedentes = null;
        this.callbacksChangement = [...(options.callbacks || [])];
        this.derniereMiseAJour = null;
        
        // === PERFORMANCE ET CACHE ===
        this.cacheResultats = new Map();
        this.indicateursPerformance = this._initialiserMetriques();
        this.timeoutCache = this.parametresConfiguration.timeoutCacheMS || 300000; // 5 minutes par défaut
        
        // === GESTION D'ERREURS ===
        this.journalErreurs = [];
        this.limiteJournalErreurs = 50;
        
        // === INITIALISATION SÉQUENTIELLE ===
        try {
            this._validerConfiguration();
            this._initialiserComposant();
            this._configurerEvenements();
            this._demarrerComposant();
            
            this.etatActuel = 'operationnel';
            this._journaliser('info', `Composant ${this.nomClasse} initialisé avec succès`);
        } catch (erreur) {
            this.etatActuel = 'erreur';
            this._gererErreur('Échec initialisation composant', erreur);
            throw erreur;
        }
    }
    
    // ===============================================================
    // API PUBLIQUE STANDARDISÉE - MÉTHODES OBLIGATOIRES
    // ===============================================================
    
    /**
     * Obtient la version de l'API du composant
     * 
     * @returns {string} Version au format semver (ex: "2.1.0")
     */
    obtenirVersionAPI() {
        return this.versionAPI;
    }
    
    /**
     * Obtient les informations complètes du composant
     * 
     * @returns {Object} Métadonnées du composant
     */
    obtenirInformationsComposant() {
        return {
            identifiant: this.identifiantComposant,
            nomClasse: this.nomClasse,
            version: this.versionAPI,
            langue: this.langueActive,
            etat: this.etatActuel,
            parametres: { ...this.parametresConfiguration }
        };
    }
    
    /**
     * Obtient les statistiques de performance et d'utilisation
     * 
     * @returns {Object} Métriques détaillées de performance
     */
    obtenirStatistiques() {
        const maintenant = Date.now();
        return {
            ...this.obtenirInformationsComposant(),
            performance: {
                ...this.indicateursPerformance,
                tempsFonctionnement: maintenant - (this.indicateursPerformance.heureInitialisation || maintenant),
                tauxUtilisationCache: this._calculerTauxCache(),
                derniereActivite: this.derniereMiseAJour
            },
            cache: {
                tailleActuelle: this.cacheResultats.size,
                timeoutConfigureMS: this.timeoutCache
            },
            erreurs: {
                nombreTotal: this.indicateursPerformance.erreursRencontrees,
                dernieresErreurs: this.journalErreurs.slice(-5) // 5 dernières erreurs
            }
        };
    }
    
    /**
     * Met à jour la configuration du composant de façon sécurisée
     * 
     * @param {Object} nouveauxParametres - Nouveaux paramètres à appliquer
     * @param {boolean} [fusionner=true] - Fusionner avec config existante ou remplacer
     * @returns {boolean} Succès de la mise à jour
     */
    mettreAJourConfiguration(nouveauxParametres, fusionner = true) {
        try {
            this._validerParametres(nouveauxParametres);
            
            const ancienneConfiguration = { ...this.parametresConfiguration };
            
            if (fusionner) {
                Object.assign(this.parametresConfiguration, nouveauxParametres);
            } else {
                this.parametresConfiguration = { ...nouveauxParametres };
            }
            
            // Réinitialisation si nécessaire
            this._appliquerNouvellesconfiguration(ancienneConfiguration, this.parametresConfiguration);
            
            this._notifierChangements('configuration', { 
                ancienne: ancienneConfiguration, 
                nouvelle: this.parametresConfiguration 
            });
            
            this._journaliser('info', 'Configuration mise à jour avec succès');
            return true;
            
        } catch (erreur) {
            this._gererErreur('Échec mise à jour configuration', erreur);
            return false;
        }
    }
    
    /**
     * Ajoute un écouteur de changements avec validation
     * 
     * @param {Function} callback - Fonction appelée lors des changements
     * @param {Object} [options={}] - Options du callback
     * @param {string} [options.type] - Type d'événement à écouter spécifiquement
     * @param {boolean} [options.uneFois=false] - Exécuter le callback une seule fois
     * @returns {Function} Fonction pour désinscrire le callback
     */
    ajouterEcouteurChangement(callback, options = {}) {
        if (typeof callback !== 'function') {
            throw new Error('Le callback doit être une fonction');
        }
        
        const callbackInterne = {
            fonction: callback,
            type: options.type || 'tous',
            uneFois: options.uneFois || false,
            identifiant: `callback_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
        };
        
        this.callbacksChangement.push(callbackInterne);
        
        // Retourne fonction de désinscription
        return () => {
            const index = this.callbacksChangement.findIndex(cb => cb.identifiant === callbackInterne.identifiant);
            if (index !== -1) {
                this.callbacksChangement.splice(index, 1);
            }
        };
    }
    
    /**
     * Vide le cache et remet à zéro les métriques de performance
     */
    reinitialiserCache() {
        this.cacheResultats.clear();
        this.indicateursPerformance.hitCache = 0;
        this.indicateursPerformance.missCache = 0;
        this._journaliser('info', 'Cache réinitialisé');
    }
    
    /**
     * Redémarre le composant après réinitialisation
     * 
     * @param {Object} [nouvellesOptions] - Nouvelles options de configuration
     * @returns {Promise<boolean>} Succès du redémarrage
     */
    async redemarrer(nouvellesOptions = {}) {
        try {
            this._journaliser('info', 'Début redémarrage composant');
            
            // Sauvegarder l'état actuel
            const etatSauvegarde = this._sauvegarderEtat();
            
            // Arrêter proprement
            await this.arreter();
            
            // Réinitialiser avec nouvelles options
            Object.assign(this.parametresConfiguration, nouvellesOptions);
            
            // Redémarrer
            this._initialiserComposant();
            this._configurerEvenements();
            this._demarrerComposant();
            
            this.etatActuel = 'operationnel';
            this._journaliser('info', 'Redémarrage réussi');
            
            return true;
            
        } catch (erreur) {
            this.etatActuel = 'erreur';
            this._gererErreur('Échec redémarrage', erreur);
            return false;
        }
    }
    
    /**
     * Arrête proprement le composant et libère les ressources
     * 
     * @returns {Promise<void>}
     */
    async arreter() {
        this._journaliser('info', 'Début arrêt composant');
        
        try {
            // Nettoyer les événements spécifiques du composant
            await this._nettoyerEvenements();
            
            // Vider les callbacks
            this.callbacksChangement.length = 0;
            
            // Vider le cache
            this.cacheResultats.clear();
            
            // Notifier l'arrêt
            this._notifierChangements('arret', { composant: this.identifiantComposant });
            
            this.etatActuel = 'arrete';
            this._journaliser('info', 'Composant arrêté proprement');
            
        } catch (erreur) {
            this._gererErreur('Erreur lors de l\'arrêt', erreur);
        }
    }
    
    /**
     * Détruit définitivement le composant (irréversible)
     */
    detruire() {
        this._journaliser('info', 'Destruction définitive du composant');
        
        // Arrêt en mode forcé
        this.callbacksChangement.length = 0;
        this.cacheResultats.clear();
        this.journalErreurs.length = 0;
        
        // Marquer comme détruit
        this.etatActuel = 'detruit';
        
        // Supprimer les références
        Object.keys(this).forEach(cle => {
            if (cle !== 'etatActuel' && cle !== 'identifiantComposant') {
                delete this[cle];
            }
        });
    }
    
    // ===============================================================
    // MÉTHODES UTILITAIRES PUBLIQUES
    // ===============================================================
    
    /**
     * Vérifie si le composant est dans un état opérationnel
     * 
     * @returns {boolean} True si le composant est prêt à fonctionner
     */
    estOperationnel() {
        return this.etatActuel === 'operationnel';
    }
    
    /**
     * Obtient une valeur depuis le cache ou l'exécute si absente
     * 
     * @param {string} cle - Clé de cache
     * @param {Function} calculatrice - Fonction pour générer la valeur si absente
     * @param {number} [timeoutPersonnalise] - Timeout spécifique pour cette entrée
     * @returns {*} Valeur mise en cache ou calculée
     */
    obtenirAvecCache(cle, calculatrice, timeoutPersonnalise) {
        const maintenant = Date.now();
        const entreeCache = this.cacheResultats.get(cle);
        
        // Vérifier si l'entrée existe et n'est pas expirée
        if (entreeCache) {
            const timeout = timeoutPersonnalise || this.timeoutCache;
            if (maintenant - entreeCache.horodatage < timeout) {
                this.indicateursPerformance.hitCache++;
                return entreeCache.valeur;
            } else {
                // Entrée expirée
                this.cacheResultats.delete(cle);
            }
        }
        
        // Calculer et mettre en cache
        this.indicateursPerformance.missCache++;
        const valeur = calculatrice();
        this.cacheResultats.set(cle, {
            valeur,
            horodatage: maintenant
        });
        
        return valeur;
    }
    
    // ===============================================================
    // MÉTHODES PRIVÉES - INFRASTRUCTURE STANDARDISÉE
    // ===============================================================
    
    /**
     * Génère un identifiant unique pour le composant
     * @private
     * @returns {string} Identifiant unique
     */
    _genererIdentifiant() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 8);
        return `${this.constructor.name}_${timestamp}_${random}`;
    }
    
    /**
     * Charge la configuration par défaut avec fusion des paramètres
     * @private
     * @param {Object} parametresPersonnalises - Paramètres fournis par l'utilisateur
     * @returns {Object} Configuration complète
     */
    _chargerConfiguration(parametresPersonnalises) {
        const configurationParDefaut = {
            debug: false,
            cache: true,
            timeoutCacheMS: 300000, // 5 minutes
            timeoutOperationMS: 5000, // 5 secondes
            maxTentativesErreur: 3,
            journalisationActivee: true
        };
        
        return { ...configurationParDefaut, ...parametresPersonnalises };
    }
    
    /**
     * Initialise les métriques de performance
     * @private
     * @returns {Object} Métriques initiales
     */
    _initialiserMetriques() {
        return {
            heureInitialisation: Date.now(),
            nombreAppels: 0,
            tempsExecutionTotal: 0,
            erreursRencontrees: 0,
            hitCache: 0,
            missCache: 0,
            derniereActivite: Date.now()
        };
    }
    
    /**
     * Calcule le taux d'utilisation du cache
     * @private
     * @returns {number} Pourcentage entre 0 et 1
     */
    _calculerTauxCache() {
        const totalAcces = this.indicateursPerformance.hitCache + this.indicateursPerformance.missCache;
        return totalAcces > 0 ? this.indicateursPerformance.hitCache / totalAcces : 0;
    }
    
    /**
     * Notifie tous les callbacks des changements
     * @private
     * @param {string} type - Type de changement
     * @param {*} donnees - Données associées au changement
     */
    _notifierChangements(type, donnees) {
        this.derniereMiseAJour = Date.now();
        this.indicateursPerformance.derniereActivite = this.derniereMiseAJour;
        
        // Filtrer et exécuter les callbacks appropriés
        this.callbacksChangement.forEach((callbackInfo, index) => {
            if (callbackInfo.type === 'tous' || callbackInfo.type === type) {
                try {
                    callbackInfo.fonction({
                        type,
                        donnees,
                        composant: this.identifiantComposant,
                        horodatage: this.derniereMiseAJour
                    });
                    
                    // Supprimer si callback à usage unique
                    if (callbackInfo.uneFois) {
                        this.callbacksChangement.splice(index, 1);
                    }
                    
                } catch (erreur) {
                    this._gererErreur(`Erreur callback ${callbackInfo.identifiant}`, erreur);
                }
            }
        });
    }
    
    /**
     * Gère les erreurs de façon unifiée
     * @private
     * @param {string} message - Message descriptif de l'erreur
     * @param {Error} erreur - Objet erreur
     */
    _gererErreur(message, erreur) {
        this.indicateursPerformance.erreursRencontrees++;
        
        const entreeErreur = {
            horodatage: Date.now(),
            message,
            erreur: {
                name: erreur.name,
                message: erreur.message,
                stack: erreur.stack
            },
            composant: this.identifiantComposant
        };
        
        // Limiter la taille du journal d'erreurs
        this.journalErreurs.push(entreeErreur);
        if (this.journalErreurs.length > this.limiteJournalErreurs) {
            this.journalErreurs.shift();
        }
        
        // Logger dans la console si debug activé
        if (this.modeDebug || this.parametresConfiguration.debug) {
            console.error(`[${this.identifiantComposant}] ${message}:`, erreur);
        }
        
        // Notifier les callbacks d'erreur
        this._notifierChangements('erreur', entreeErreur);
    }
    
    /**
     * Journalise les événements importants
     * @private
     * @param {string} niveau - Niveau de log ('info', 'warn', 'error')
     * @param {string} message - Message à journaliser
     */
    _journaliser(niveau, message) {
        if (!this.parametresConfiguration.journalisationActivee) return;
        
        const entreeJournal = {
            horodatage: Date.now(),
            niveau,
            message,
            composant: this.identifiantComposant
        };
        
        if (this.modeDebug) {
            console[niveau](`[${this.identifiantComposant}] ${message}`);
        }
        
        this._notifierChangements('log', entreeJournal);
    }
    
    /**
     * Sauvegarde l'état actuel du composant
     * @private
     * @returns {Object} État sérialisable
     */
    _sauvegarderEtat() {
        return {
            identifiant: this.identifiantComposant,
            configuration: { ...this.parametresConfiguration },
            etat: this.etatActuel,
            metriques: { ...this.indicateursPerformance },
            horodatageSauvegarde: Date.now()
        };
    }
    
    // ===============================================================
    // MÉTHODES ABSTRAITES - À IMPLÉMENTER DANS LES CLASSES ENFANTS
    // ===============================================================
    
    /**
     * Valide la configuration spécifique au composant
     * @abstract
     * @private
     * @throws {Error} Si la configuration est invalide
     */
    _validerConfiguration() {
        throw new Error(`Méthode _validerConfiguration doit être implémentée dans ${this.constructor.name}`);
    }
    
    /**
     * Valide les paramètres lors des mises à jour
     * @abstract
     * @private
     * @param {Object} parametres - Paramètres à valider
     * @throws {Error} Si les paramètres sont invalides
     */
    _validerParametres(parametres) {
        throw new Error(`Méthode _validerParametres doit être implémentée dans ${this.constructor.name}`);
    }
    
    /**
     * Initialise les données et l'état interne du composant
     * @abstract
     * @private
     */
    _initialiserComposant() {
        throw new Error(`Méthode _initialiserComposant doit être implémentée dans ${this.constructor.name}`);
    }
    
    /**
     * Configure les écouteurs d'événements du composant
     * @abstract
     * @private
     */
    _configurerEvenements() {
        throw new Error(`Méthode _configurerEvenements doit être implémentée dans ${this.constructor.name}`);
    }
    
    /**
     * Démarre le fonctionnement du composant (appelé après initialisation)
     * @abstract
     * @private
     */
    _demarrerComposant() {
        throw new Error(`Méthode _demarrerComposant doit être implémentée dans ${this.constructor.name}`);
    }
    
    /**
     * Applique les changements de configuration
     * @abstract
     * @private
     * @param {Object} ancienneConfig - Configuration précédente
     * @param {Object} nouvelleConfig - Nouvelle configuration
     */
    _appliquerNouvellesconfiguration(ancienneConfig, nouvelleConfig) {
        // Implémentation optionnelle dans les classes enfants
        // Par défaut, ne fait rien
    }
    
    /**
     * Nettoie les événements spécifiques du composant
     * @abstract
     * @private
     * @returns {Promise<void>}
     */
    async _nettoyerEvenements() {
        // Implémentation optionnelle dans les classes enfants
        // Par défaut, ne fait rien
    }
}

// Export pour utilisation globale
if (typeof window !== 'undefined') {
    window.ComposantStandardiseBase = ComposantStandardiseBase;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComposantStandardiseBase;
}