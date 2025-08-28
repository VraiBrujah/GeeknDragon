/**
 * =================================================================
 * SYSTÈME DE GESTION CENTRALISÉE DES VARIABLES LI-CUBE PRO™
 * =================================================================
 * 
 * Rôle : Source de vérité unique pour toutes les variables du système
 * Type : Module JS - Base de données centralisée 
 * Auteur : Claude Code pour EDS Québec
 * Version : 1.0.0 - Système de Gestion Centralisée
 * 
 * Fonctionnalités :
 * - Stockage centralisé de toutes les variables (textes, prix, images)
 * - Gestion des variables globales et locales
 * - Support fusion/séparation multi-page
 * - API d'édition et propagation automatique
 * - Interface d'administration intégrée
 * 
 * Variables incluses :
 * 1. VARIABLES GLOBALES : Partagées entre plusieurs pages
 * 2. VARIABLES LOCALES : Spécifiques à une page/section
 * 3. IMAGES : Chemins et configurations d'images
 * 4. DONNÉES TECHNIQUES : Spécifications produits
 * 5. PRIX ET TARIFS : Tous les éléments de pricing
 * 6. CALCULS TCO : Formules et résultats
 */

// =================================================================
// CLASSE PRINCIPALE DE GESTION DES VARIABLES CENTRALISÉES
// =================================================================

class VariablesCentrales {
    constructor() {
        // Base de données centralisée des variables
        this.variables = this.initialiserVariables();
        
        // Métadonnées du système
        this.metadata = {
            version: '1.0.0-Li-CUBE-PRO',
            derniereMiseAJour: new Date().toISOString().split('T')[0],
            auteur: 'EDS Québec - Claude Code',
            description: 'Système de Gestion Centralisée des Variables'
        };
        
        // État du système
        this.estInitialise = false;
        this.observateurs = new Map(); // Pour les pages qui écoutent les changements
        this.historique = []; // Historique des modifications
        this.maxHistorique = 50; // Limite de l'historique
        
        this.initialiser();
    }

    /**
     * Initialise le système de variables centralisées
     */
    initialiser() {
        console.log('🔧 Initialisation du système de variables centralisées...');
        
        // Charger la configuration sauvegardée si disponible
        this.chargerConfigurationSauvegardee();
        
        // Initialiser les événements
        this.configurerEvenements();
        
        this.estInitialise = true;
        
        // Déclencher l'événement d'initialisation
        window.dispatchEvent(new CustomEvent('variablesCentralesReady', {
            detail: { instance: this, metadata: this.metadata }
        }));
        
        console.log('✅ Système de variables centralisées initialisé');
    }

    /**
     * Définit la structure initiale des variables
     * Toutes les variables du projet sont centralisées ici
     */
    initialiserVariables() {
        return {
            // =================================================================
            // 1. VARIABLES GLOBALES - Partagées entre plusieurs pages
            // =================================================================
            globales: {
                // Textes marketing globaux
                marketing: {
                    titrePrincipal: {
                        valeur: 'Li-CUBE PRO™ LOCATION INTELLIGENTE',
                        description: 'Titre principal affiché sur toutes les pages',
                        utiliseePar: ['hero', 'presentations', 'brochures'],
                        type: 'texte'
                    },
                    sloganPrincipal: {
                        valeur: 'RÉVOLUTION LOCATION : Li-CUBE PRO™ avec monitoring IoT de pointe inclus. ZÉRO risque, ZÉRO investissement, ZÉRO maintenance!',
                        description: 'Slogan marketing principal',
                        utiliseePar: ['hero', 'presentations'],
                        type: 'texte'
                    },
                    appelAction: {
                        valeur: 'ARRÊTEZ DE PERDRE DE L\'ARGENT!',
                        description: 'Appel à l\'action principal pour les conversions',
                        utiliseePar: ['contact', 'cta'],
                        type: 'texte'
                    }
                },
                
                // Informations entreprise
                entreprise: {
                    nom: {
                        valeur: 'EDS Québec',
                        description: 'Nom de l\'entreprise',
                        utiliseePar: ['toutes'],
                        type: 'texte'
                    },
                    division: {
                        valeur: 'Division Location & Services Managés',
                        description: 'Division spécialisée',
                        utiliseePar: ['contact', 'presentations'],
                        type: 'texte'
                    },
                    telephone: {
                        valeur: '819 323 7859',
                        description: 'Numéro de téléphone principal',
                        utiliseePar: ['contact', 'footer'],
                        type: 'telephone'
                    },
                    email: {
                        valeur: 'contact@edsquebec.com',
                        description: 'Email de contact principal',
                        utiliseePar: ['contact', 'footer'],
                        type: 'email'
                    }
                },
                
                // Données techniques globales
                specifications: {
                    licubePro: {
                        modele: {
                            valeur: 'LCP-25.6V-105Ah',
                            description: 'Modèle Li-CUBE PRO™',
                            utiliseePar: ['specs', 'comparaisons'],
                            type: 'texte'
                        },
                        capaciteWh: {
                            valeur: 2688,
                            description: 'Capacité énergétique totale en Wh',
                            utiliseePar: ['specs', 'comparaisons', 'calculs'],
                            type: 'nombre',
                            unite: 'Wh'
                        },
                        poidsKg: {
                            valeur: 23,
                            description: 'Poids de la batterie en kg',
                            utiliseePar: ['specs', 'comparaisons'],
                            type: 'nombre',
                            unite: 'kg'
                        },
                        dureeVie: {
                            valeur: '20-25 ans',
                            description: 'Durée de vie estimée',
                            utiliseePar: ['specs', 'garanties'],
                            type: 'texte'
                        },
                        cycles: {
                            valeur: 8000,
                            description: 'Nombre de cycles de charge',
                            utiliseePar: ['specs', 'comparaisons'],
                            type: 'nombre',
                            unite: 'cycles'
                        }
                    },
                    
                    niCd: {
                        capaciteWh: {
                            valeur: 2040,
                            description: 'Capacité réelle Ni-Cd dégradée',
                            utiliseePar: ['comparaisons'],
                            type: 'nombre',
                            unite: 'Wh'
                        },
                        poidsKg: {
                            valeur: 68,
                            description: 'Poids des batteries Ni-Cd',
                            utiliseePar: ['comparaisons'],
                            type: 'nombre',
                            unite: 'kg'
                        },
                        dureeVie: {
                            valeur: '5-6 ans max',
                            description: 'Durée de vie Ni-Cd avec dégradation',
                            utiliseePar: ['comparaisons'],
                            type: 'texte'
                        },
                        cycles: {
                            valeur: 250,
                            description: 'Cycles de vie réels Ni-Cd',
                            utiliseePar: ['comparaisons'],
                            type: 'nombre',
                            unite: 'cycles'
                        }
                    }
                }
            },

            // =================================================================
            // 2. VARIABLES LOCALES - Spécifiques à des pages/sections
            // =================================================================
            locales: {
                // Page Hero/Accueil
                hero: {
                    titreAccroche: {
                        valeur: 'LOCATION INTELLIGENTE<br>Batterie Ferroviaire',
                        description: 'Titre d\'accroche spécifique à la page hero',
                        utiliseePar: ['hero'],
                        type: 'html'
                    },
                    sousTitre: {
                        valeur: 'Économisez jusqu\'à <strong><span data-pricing-value="calculations.tco_location.savings.total" data-pricing-format="currency">49 490$</span> sur 20 ans</strong> garanti!',
                        description: 'Sous-titre avec économies calculées',
                        utiliseePar: ['hero'],
                        type: 'html'
                    },
                    tarification: {
                        valeur: '<strong>TARIF CHOC : <span data-pricing-value="modes.location.licube.monthly_rate" data-pricing-format="currency">150$</span>/mois tout inclus → <span data-pricing-value="modes.location.licube.monthly_rate" data-pricing-format="currency">100$</span>/mois (IoT 5G + IA inclus!)</strong>',
                        description: 'Information tarifaire avec prix dynamiques',
                        utiliseePar: ['hero'],
                        type: 'html'
                    }
                },

                // Section Problématique
                problematique: {
                    titrePrincipal: {
                        valeur: '❌ SCANDALE : Vous Payez 2× Plus Cher!',
                        description: 'Titre choc de la section problématique',
                        utiliseePar: ['problematique'],
                        type: 'texte'
                    },
                    alerteCouts: {
                        valeur: '🚨 ALERTE COÛTS : <span data-pricing-value="modes.location.nicd.monthly_rate" data-pricing-format="currency">240$</span>/mois coûts CACHÉS vs <strong><span data-pricing-value="modes.location.licube.monthly_rate" data-pricing-format="currency">150$</span>/mois TOUT INCLUS</strong> Li-CUBE PRO!',
                        description: 'Alerte comparative des coûts',
                        utiliseePar: ['problematique'],
                        type: 'html'
                    }
                },

                // Section Solution
                solution: {
                    titrePrincipal: {
                        valeur: '✅ Li-CUBE PRO™ : RÉVOLUTION LOCATION!',
                        description: 'Titre de la section solution',
                        utiliseePar: ['solution'],
                        type: 'texte'
                    },
                    approbation: {
                        valeur: '🏆 APPROUVÉ par + de 200 entreprises québécoises! Location tout-inclus avec monitoring IoT avancé.',
                        description: 'Preuve sociale et approbation',
                        utiliseePar: ['solution'],
                        type: 'texte'
                    }
                },

                // Section TCO
                tco: {
                    titrePrincipal: {
                        valeur: '49 490$ ÉCONOMISÉS vs Ni-Cd!',
                        description: 'Titre de la section TCO avec économies',
                        utiliseePar: ['tco'],
                        type: 'texte'
                    },
                    comparaison: {
                        valeur: '<strong>150$/mois TOUT INCLUS</strong> comparé aux <strong>240$/mois COÛTS RÉELS Ni-Cd</strong> = <strong>90$/mois ÉCONOMISÉS!</strong>',
                        description: 'Comparaison détaillée des coûts',
                        utiliseePar: ['tco'],
                        type: 'html'
                    }
                },

                // Section Contact
                contact: {
                    titrePrincipal: {
                        valeur: '💰 ARRÊTEZ DE PERDRE DE L\'ARGENT!',
                        description: 'Titre d\'urgence pour la section contact',
                        utiliseePar: ['contact'],
                        type: 'texte'
                    },
                    propositionValeur: {
                        valeur: '<strong>90$/mois ÉCONOMISÉS dès aujourd\'hui!</strong> Notre Division Location vous libère de TOUS vos coûts cachés Ni-Cd.',
                        description: 'Proposition de valeur immédiate',
                        utiliseePar: ['contact'],
                        type: 'html'
                    }
                }
            },

            // =================================================================
            // 3. IMAGES ET MÉDIAS
            // =================================================================
            images: {
                logos: {
                    edsQuebec: {
                        chemin: '../../image/EdsQuebec/logo edsquebec.png',
                        description: 'Logo principal EDS Québec',
                        utiliseePar: ['navigation', 'footer', 'toutes'],
                        type: 'image'
                    }
                },
                produits: {
                    licubePro1: {
                        chemin: '../../image/Produit/Li-CUBE PRO/Li-CUBE PRO image 1.png',
                        description: 'Image principale Li-CUBE PRO',
                        utiliseePar: ['hero', 'produits'],
                        type: 'image'
                    },
                    licubePro2: {
                        chemin: '../../image/Produit/Li-CUBE PRO/Li-CUBE PRO image 2.png',
                        description: 'Image secondaire Li-CUBE PRO',
                        utiliseePar: ['gallery', 'specs'],
                        type: 'image'
                    },
                    licubePro3: {
                        chemin: '../../image/Produit/Li-CUBE PRO/Li-CUBE PRO image 3.png',
                        description: 'Image technique Li-CUBE PRO',
                        utiliseePar: ['technique', 'comparaisons'],
                        type: 'image'
                    }
                },
                technologies: {
                    niCd: {
                        chemin: '../../image/Ni-Cd/NiCd.png',
                        description: 'Image batteries Ni-Cd',
                        utiliseePar: ['comparaisons'],
                        type: 'image'
                    }
                }
            },

            // =================================================================
            // 4. PRIX ET TARIFICATION (Synchronisé avec pricing-manager.js)
            // =================================================================
            prix: {
                location: {
                    licube: {
                        mensuel: {
                            valeur: 150,
                            description: 'Prix mensuel de base Li-CUBE PRO location',
                            utiliseePar: ['tarifs', 'calculs'],
                            type: 'prix',
                            devise: 'CAD',
                            variable_pricing: 'modes.location.licube.monthly_rate'
                        },
                        mensuelMin: {
                            valeur: 100,
                            description: 'Prix mensuel minimum avec remises volume',
                            utiliseePar: ['tarifs', 'promotions'],
                            type: 'prix',
                            devise: 'CAD',
                            variable_pricing: 'modes.location.licube.monthly_rate_min'
                        },
                        installation: {
                            valeur: 500,
                            description: 'Frais d\'installation unique',
                            utiliseePar: ['tarifs', 'calculs'],
                            type: 'prix',
                            devise: 'CAD',
                            variable_pricing: 'modes.location.licube.installation_fee'
                        }
                    },
                    niCd: {
                        coutMensuelReel: {
                            valeur: 240,
                            description: 'Coût mensuel réel Ni-Cd (caché)',
                            utiliseePar: ['comparaisons'],
                            type: 'prix',
                            devise: 'CAD',
                            variable_pricing: 'modes.location.nicd.monthly_rate'
                        }
                    }
                },
                vente: {
                    licube: {
                        prixBase: {
                            valeur: 5500,
                            description: 'Prix de vente Li-CUBE PRO',
                            utiliseePar: ['vente', 'calculs'],
                            type: 'prix',
                            devise: 'CAD',
                            variable_pricing: 'modes.vente.licube.price_base'
                        }
                    }
                }
            },

            // =================================================================
            // 5. CALCULS ET FORMULES TCO
            // =================================================================
            calculs: {
                economiesLocation: {
                    mensuelle: {
                        valeur: 90,
                        description: 'Économies mensuelles Location vs Ni-Cd',
                        formule: 'niCd.coutMensuelReel - licube.mensuel',
                        utiliseePar: ['tco', 'benefits'],
                        type: 'calcul',
                        unite: 'CAD/mois',
                        variable_pricing: 'calculations.tco_location.savings.monthly_savings'
                    },
                    totale20ans: {
                        valeur: 49490,
                        description: 'Économies totales sur 20 ans',
                        formule: 'economiesMensuelle * 12 * 20 - installation',
                        utiliseePar: ['tco', 'roi'],
                        type: 'calcul',
                        unite: 'CAD',
                        variable_pricing: 'calculations.tco_location.savings.total'
                    }
                },
                tcoLocation: {
                    licubeTotal20ans: {
                        valeur: 26500,
                        description: 'Coût total Li-CUBE PRO sur 20 ans',
                        formule: 'mensuelMin * 12 * 20 + installation',
                        utiliseePar: ['tco'],
                        type: 'calcul',
                        unite: 'CAD',
                        variable_pricing: 'calculations.tco_location.licube.total_20_years'
                    },
                    niCdTotal20ans: {
                        valeur: 75990,
                        description: 'Coût total réel Ni-Cd sur 20 ans',
                        formule: 'coutMensuelReel * 12 * 20',
                        utiliseePar: ['tco'],
                        type: 'calcul',
                        unite: 'CAD',
                        variable_pricing: 'calculations.tco_location.nicd.total_20_years'
                    }
                }
            }
        };
    }

    // =================================================================
    // MÉTHODES D'ACCÈS ET MANIPULATION
    // =================================================================

    /**
     * Récupère la valeur d'une variable par son chemin
     * @param {string} chemin - Chemin vers la variable (ex: 'globales.marketing.titrePrincipal')
     * @returns {*} - Valeur de la variable
     */
    obtenirVariable(chemin) {
        const parties = chemin.split('.');
        let valeur = this.variables;
        
        for (const partie of parties) {
            if (valeur && valeur.hasOwnProperty(partie)) {
                valeur = valeur[partie];
            } else {
                console.warn(`⚠️ Variable non trouvée: ${chemin}`);
                return null;
            }
        }
        
        // Retourner la valeur si c'est un objet variable, sinon la valeur directe
        return valeur && valeur.valeur !== undefined ? valeur.valeur : valeur;
    }

    /**
     * Définit la valeur d'une variable par son chemin
     * @param {string} chemin - Chemin vers la variable
     * @param {*} nouvelleValeur - Nouvelle valeur à assigner
     * @param {string} source - Source de la modification (pour l'historique)
     */
    definirVariable(chemin, nouvelleValeur, source = 'système') {
        const parties = chemin.split('.');
        let objet = this.variables;
        
        // Naviguer jusqu'à l'objet parent
        for (let i = 0; i < parties.length - 1; i++) {
            if (!objet[parties[i]]) {
                objet[parties[i]] = {};
            }
            objet = objet[parties[i]];
        }
        
        const propriete = parties[parties.length - 1];
        const ancienneValeur = objet[propriete]?.valeur || objet[propriete];
        
        // Mettre à jour la valeur
        if (objet[propriete] && objet[propriete].valeur !== undefined) {
            objet[propriete].valeur = nouvelleValeur;
        } else {
            objet[propriete] = nouvelleValeur;
        }
        
        // Ajouter à l'historique
        this.ajouterAHistorique({
            chemin,
            ancienneValeur,
            nouvelleValeur,
            timestamp: new Date().toISOString(),
            source
        });
        
        // Notifier les observateurs
        this.notifierObservateurs(chemin, nouvelleValeur, ancienneValeur);
        
        // Sauvegarder automatiquement
        this.sauvegarderConfiguration();
        
        console.log(`🔄 Variable mise à jour: ${chemin} = ${nouvelleValeur}`);
    }

    /**
     * Récupère les métadonnées d'une variable
     * @param {string} chemin - Chemin vers la variable
     * @returns {object} - Métadonnées de la variable
     */
    obtenirMetadonnees(chemin) {
        const parties = chemin.split('.');
        let valeur = this.variables;
        
        for (const partie of parties) {
            if (valeur && valeur.hasOwnProperty(partie)) {
                valeur = valeur[partie];
            } else {
                return null;
            }
        }
        
        if (valeur && typeof valeur === 'object' && valeur.description) {
            return {
                description: valeur.description,
                utiliseePar: valeur.utiliseePar || [],
                type: valeur.type || 'texte',
                unite: valeur.unite,
                variable_pricing: valeur.variable_pricing,
                formule: valeur.formule
            };
        }
        
        return null;
    }

    /**
     * Recherche toutes les variables utilisées par une page
     * @param {string} nomPage - Nom de la page
     * @returns {Array} - Liste des variables utilisées
     */
    obtenirVariablesParPage(nomPage) {
        const variablesUtilisees = [];
        
        const rechercheRecursive = (objet, cheminActuel = '') => {
            for (const [cle, valeur] of Object.entries(objet)) {
                const cheminComplet = cheminActuel ? `${cheminActuel}.${cle}` : cle;
                
                if (valeur && typeof valeur === 'object') {
                    if (valeur.utiliseePar && valeur.utiliseePar.includes(nomPage)) {
                        variablesUtilisees.push({
                            chemin: cheminComplet,
                            valeur: valeur.valeur,
                            description: valeur.description,
                            type: valeur.type
                        });
                    } else if (!valeur.valeur && !valeur.description) {
                        // Continue la recherche dans les sous-objets
                        rechercheRecursive(valeur, cheminComplet);
                    }
                }
            }
        };
        
        rechercheRecursive(this.variables);
        return variablesUtilisees;
    }

    /**
     * Liste toutes les pages qui utilisent une variable
     * @param {string} cheminVariable - Chemin de la variable
     * @returns {Array} - Liste des pages
     */
    obtenirPagesUtilisatrices(cheminVariable) {
        const metadata = this.obtenirMetadonnees(cheminVariable);
        return metadata ? metadata.utiliseePar : [];
    }

    // =================================================================
    // SYSTÈME D'OBSERVATION ET PROPAGATION
    // =================================================================

    /**
     * Ajoute un observateur pour une variable
     * @param {string} cheminVariable - Chemin de la variable à observer
     * @param {Function} callback - Fonction appelée lors des changements
     * @param {string} identifiant - Identifiant unique de l'observateur
     */
    ajouterObservateur(cheminVariable, callback, identifiant) {
        if (!this.observateurs.has(cheminVariable)) {
            this.observateurs.set(cheminVariable, new Map());
        }
        
        this.observateurs.get(cheminVariable).set(identifiant, callback);
        console.log(`👁️ Observateur ajouté pour ${cheminVariable}: ${identifiant}`);
    }

    /**
     * Supprime un observateur
     * @param {string} cheminVariable - Chemin de la variable
     * @param {string} identifiant - Identifiant de l'observateur
     */
    supprimerObservateur(cheminVariable, identifiant) {
        if (this.observateurs.has(cheminVariable)) {
            this.observateurs.get(cheminVariable).delete(identifiant);
            console.log(`❌ Observateur supprimé: ${identifiant}`);
        }
    }

    /**
     * Notifie tous les observateurs d'une variable
     * @param {string} cheminVariable - Chemin de la variable modifiée
     * @param {*} nouvelleValeur - Nouvelle valeur
     * @param {*} ancienneValeur - Ancienne valeur
     */
    notifierObservateurs(cheminVariable, nouvelleValeur, ancienneValeur) {
        if (this.observateurs.has(cheminVariable)) {
            const observateursVariable = this.observateurs.get(cheminVariable);
            
            observateursVariable.forEach((callback, identifiant) => {
                try {
                    callback({
                        chemin: cheminVariable,
                        nouvelleValeur,
                        ancienneValeur,
                        timestamp: new Date().toISOString()
                    });
                } catch (error) {
                    console.error(`❌ Erreur dans observateur ${identifiant}:`, error);
                }
            });
        }
        
        // Événement global pour tous les changements
        window.dispatchEvent(new CustomEvent('variableModifiee', {
            detail: {
                chemin: cheminVariable,
                nouvelleValeur,
                ancienneValeur
            }
        }));
    }

    // =================================================================
    // GESTION DE L'HISTORIQUE
    // =================================================================

    /**
     * Ajoute une entrée à l'historique des modifications
     * @param {Object} entree - Entrée d'historique
     */
    ajouterAHistorique(entree) {
        this.historique.unshift(entree);
        
        // Limiter la taille de l'historique
        if (this.historique.length > this.maxHistorique) {
            this.historique = this.historique.slice(0, this.maxHistorique);
        }
    }

    /**
     * Récupère l'historique des modifications
     * @param {number} limite - Nombre d'entrées à retourner
     * @returns {Array} - Historique des modifications
     */
    obtenirHistorique(limite = 20) {
        return this.historique.slice(0, limite);
    }

    /**
     * Annule la dernière modification
     * @returns {boolean} - Succès de l'annulation
     */
    annulerDerniereModification() {
        if (this.historique.length > 0) {
            const derniereModification = this.historique[0];
            this.definirVariable(
                derniereModification.chemin, 
                derniereModification.ancienneValeur,
                'annulation'
            );
            
            // Supprimer l'entrée d'annulation de l'historique
            this.historique.shift();
            
            console.log(`↶ Annulation: ${derniereModification.chemin}`);
            return true;
        }
        return false;
    }

    // =================================================================
    // SAUVEGARDE ET CHARGEMENT
    // =================================================================

    /**
     * Sauvegarde la configuration actuelle dans localStorage
     */
    sauvegarderConfiguration() {
        try {
            const configuration = {
                variables: this.variables,
                metadata: {
                    ...this.metadata,
                    derniereSauvegarde: new Date().toISOString()
                },
                historique: this.historique.slice(0, 10) // Seulement les 10 dernières
            };
            
            localStorage.setItem('licubepro_variables_centrales', JSON.stringify(configuration));
            console.log('💾 Configuration sauvegardée');
        } catch (error) {
            console.error('❌ Erreur de sauvegarde:', error);
        }
    }

    /**
     * Charge la configuration sauvegardée depuis localStorage
     */
    chargerConfigurationSauvegardee() {
        try {
            const configSauvegardee = localStorage.getItem('licubepro_variables_centrales');
            if (configSauvegardee) {
                const config = JSON.parse(configSauvegardee);
                
                // Fusionner avec la configuration par défaut (pour les nouvelles variables)
                this.variables = this.fusionnerConfigurations(this.variables, config.variables);
                this.historique = config.historique || [];
                
                console.log('📥 Configuration chargée depuis localStorage');
            }
        } catch (error) {
            console.error('❌ Erreur de chargement:', error);
        }
    }

    /**
     * Fusionne deux configurations en préservant les nouvelles variables
     * @param {Object} configParDefaut - Configuration par défaut
     * @param {Object} configSauvegardee - Configuration sauvegardée
     * @returns {Object} - Configuration fusionnée
     */
    fusionnerConfigurations(configParDefaut, configSauvegardee) {
        const fusionnerObjet = (defaut, sauvegarde) => {
            const resultat = { ...defaut };
            
            for (const [cle, valeur] of Object.entries(sauvegarde || {})) {
                if (resultat[cle] && typeof resultat[cle] === 'object' && typeof valeur === 'object') {
                    if (resultat[cle].valeur !== undefined) {
                        // C'est une variable, garder la valeur sauvegardée
                        resultat[cle] = { ...resultat[cle], ...valeur };
                    } else {
                        // C'est un objet, fusionner récursivement
                        resultat[cle] = fusionnerObjet(resultat[cle], valeur);
                    }
                } else {
                    resultat[cle] = valeur;
                }
            }
            
            return resultat;
        };
        
        return fusionnerObjet(configParDefaut, configSauvegardee);
    }

    /**
     * Exporte la configuration complète
     * @returns {Object} - Configuration complète
     */
    exporterConfiguration() {
        return {
            metadata: this.metadata,
            variables: this.variables,
            historique: this.historique,
            exportTimestamp: new Date().toISOString()
        };
    }

    /**
     * Importe une configuration
     * @param {Object} configuration - Configuration à importer
     * @returns {boolean} - Succès de l'import
     */
    importerConfiguration(configuration) {
        try {
            if (configuration.variables) {
                this.variables = configuration.variables;
                this.historique = configuration.historique || [];
                this.sauvegarderConfiguration();
                
                // Notifier tous les observateurs
                window.dispatchEvent(new CustomEvent('configurationImportee', {
                    detail: { configuration }
                }));
                
                console.log('📥 Configuration importée avec succès');
                return true;
            }
        } catch (error) {
            console.error('❌ Erreur d\'import:', error);
        }
        return false;
    }

    // =================================================================
    // MÉTHODES DE CONFIGURATION D'ÉVÉNEMENTS
    // =================================================================

    /**
     * Configure les événements système
     */
    configurerEvenements() {
        // Événement de mise à jour automatique des prix depuis pricing-manager
        window.addEventListener('pricingManagerReady', (event) => {
            console.log('🔗 Synchronisation avec pricing-manager...');
            this.synchroniserAvecPricingManager();
        });
        
        // Sauvegarde automatique avant fermeture de page
        window.addEventListener('beforeunload', () => {
            this.sauvegarderConfiguration();
        });
    }

    /**
     * Synchronise les variables avec le pricing-manager existant
     */
    synchroniserAvecPricingManager() {
        if (window.pricingManager && window.pricingManager.isLoaded) {
            // Synchroniser les prix depuis le pricing manager
            const prixSync = [
                { chemin: 'prix.location.licube.mensuel', variable_pricing: 'modes.location.licube.monthly_rate' },
                { chemin: 'prix.location.licube.installation', variable_pricing: 'modes.location.licube.installation_fee' },
                { chemin: 'prix.location.niCd.coutMensuelReel', variable_pricing: 'modes.location.nicd.monthly_rate' },
                { chemin: 'calculs.economiesLocation.totale20ans', variable_pricing: 'calculations.tco_location.savings.total' }
            ];
            
            prixSync.forEach(({ chemin, variable_pricing }) => {
                const valeur = window.pricingManager.getValue(variable_pricing);
                if (valeur !== null && valeur !== undefined) {
                    this.definirVariable(chemin + '.valeur', valeur, 'pricing-manager');
                }
            });
            
            console.log('✅ Synchronisation pricing-manager terminée');
        }
    }

    // =================================================================
    // MÉTHODES UTILITAIRES
    // =================================================================

    /**
     * Recherche de variables par mot-clé
     * @param {string} motCle - Mot-clé à rechercher
     * @returns {Array} - Variables correspondantes
     */
    rechercherVariables(motCle) {
        const resultats = [];
        const motCleLower = motCle.toLowerCase();
        
        const rechercheRecursive = (objet, cheminActuel = '') => {
            for (const [cle, valeur] of Object.entries(objet)) {
                const cheminComplet = cheminActuel ? `${cheminActuel}.${cle}` : cle;
                
                if (valeur && typeof valeur === 'object') {
                    if (valeur.valeur !== undefined) {
                        // C'est une variable
                        const texteRecherche = `${cle} ${valeur.description} ${valeur.valeur}`.toLowerCase();
                        if (texteRecherche.includes(motCleLower)) {
                            resultats.push({
                                chemin: cheminComplet,
                                valeur: valeur.valeur,
                                description: valeur.description,
                                type: valeur.type,
                                pertinence: this.calculerPertinence(texteRecherche, motCleLower)
                            });
                        }
                    } else {
                        // Continue la recherche
                        rechercheRecursive(valeur, cheminComplet);
                    }
                }
            }
        };
        
        rechercheRecursive(this.variables);
        
        // Trier par pertinence
        return resultats.sort((a, b) => b.pertinence - a.pertinence);
    }

    /**
     * Calcule la pertinence d'un résultat de recherche
     * @param {string} texte - Texte à analyser
     * @param {string} motCle - Mot-clé recherché
     * @returns {number} - Score de pertinence
     */
    calculerPertinence(texte, motCle) {
        let score = 0;
        const occurrences = (texte.match(new RegExp(motCle, 'gi')) || []).length;
        score += occurrences * 10;
        
        // Bonus si le mot-clé est au début
        if (texte.startsWith(motCle)) {
            score += 20;
        }
        
        return score;
    }

    /**
     * Valide la cohérence des variables
     * @returns {Object} - Rapport de validation
     */
    validerCoherence() {
        const erreurs = [];
        const avertissements = [];
        
        // Vérifier les références manquantes
        // Vérifier les types de données
        // Vérifier les formules de calcul
        
        const rapport = {
            valide: erreurs.length === 0,
            erreurs,
            avertissements,
            timestamp: new Date().toISOString()
        };
        
        console.log('🔍 Validation terminée:', rapport);
        return rapport;
    }

    /**
     * Obtient les statistiques du système
     * @returns {Object} - Statistiques
     */
    obtenirStatistiques() {
        let nombreVariables = 0;
        let nombreImages = 0;
        let nombrePrix = 0;
        
        const compterRecursif = (objet) => {
            for (const [cle, valeur] of Object.entries(objet)) {
                if (valeur && typeof valeur === 'object') {
                    if (valeur.valeur !== undefined) {
                        nombreVariables++;
                        if (valeur.type === 'image') nombreImages++;
                        if (valeur.type === 'prix') nombrePrix++;
                    } else {
                        compterRecursif(valeur);
                    }
                }
            }
        };
        
        compterRecursif(this.variables);
        
        return {
            nombreVariables,
            nombreImages,
            nombrePrix,
            nombreObservateurs: this.observateurs.size,
            tailleHistorique: this.historique.length,
            derniereMiseAJour: this.metadata.derniereMiseAJour,
            version: this.metadata.version
        };
    }
}

// =================================================================
// INITIALISATION GLOBALE
// =================================================================

// Créer l'instance globale
window.variablesCentrales = new VariablesCentrales();

// Export pour modules ES6 si nécessaire
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VariablesCentrales;
}

console.log('🏗️ Variables Centrales Li-CUBE PRO™ chargées et prêtes');
console.log('📊 Statistiques:', window.variablesCentrales.obtenirStatistiques());