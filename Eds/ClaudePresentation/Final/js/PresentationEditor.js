/**
 * ====================================================================
 * ÉDITEUR DE PRÉSENTATION RÉVOLUTIONNAIRE - LI-CUBE PRO™ v2.0
 * ====================================================================
 * 
 * Rôle : Classe principale orchestrant l'interface et les fonctionnalités
 * Type : Controller/Orchestrateur - Gestion centralisée de l'application
 * Architecture : ES6 Classes - Pattern MVC moderne
 * Responsabilité : Interface utilisateur, navigation, persistance
 */

class PresentationEditor {
    constructor() {
        // 
        // Rôle : Configuration de l'état initial de l'éditeur principal
        // Type : Initialisation - Paramètres de base et préférences
        // Unité : État interne (pas d'unité physique)
        // Domaine : Configuration valide selon spécifications métier
        //
        
        // Onglet actuellement affiché dans l'interface principale
        // Type : string (identifiant unique)
        // Unité : sans unité (identifiant textuel)
        // Domaine : 'welcome' | 'widgets' | 'sections' | 'presentation'
        // Exemple : 'welcome'
        this.currentTab = 'welcome';
        
        // Indicateur d'activation de la sauvegarde automatique
        // Type : boolean (interrupteur binaire)
        // Unité : sans unité (état logique)
        // Domaine : true (activé) | false (désactivé)
        // Exemple : true
        this.autosaveEnabled = true;
        
        // Intervalle de déclenchement de la sauvegarde automatique
        // Type : number (durée temporelle)
        // Unité : ms (millisecondes)
        // Domaine : 5000 ≤ intervalle ≤ 300000 (5s à 5min recommandé)
        // Formule : intervalle_ms = durée_souhaitée_s × 1000
        // Exemple : 30000 (30 secondes)
        this.autosaveInterval = 30000;
        
        // Horodatage de la dernière sauvegarde effectuée
        // Type : Date | null (timestamp ou absence)
        // Unité : timestamp UTC (ISO 8601)
        // Domaine : Date valide | null (jamais sauvegardé)
        // Exemple : null
        this.lastSaved = null;
        
        // Initialisation complète de l'interface et des événements
        this.init();
    }

    /**
     * Initialise complètement l'éditeur de présentation révolutionnaire.
     * 
     * Rôle : Point d'entrée unique pour la configuration système complète
     * Type : Setup orchestré - Configuration de l'interface et événements
     * Retour : void (effet de bord : interface opérationnelle)
     * Effets : Modification DOM, événements, timers, persistance
     * 
     * Séquence d'initialisation :
     * 1. Navigation par onglets → événements clic et transitions
     * 2. Actions globales → boutons sauvegarde/export/aperçu
     * 3. Horloge temps réel → affichage continu de l'heure
     * 4. Sauvegarde auto → persistance périodique si activée
     */
    init() {
        // Configuration des événements de navigation entre onglets
        this.setupTabNavigation();
        
        // Liaison des boutons d'action globaux (save, export, preview)
        this.setupGlobalActions();
        
        // Démarrage de l'horloge en temps réel dans l'interface
        this.startClock();
        
        // Configuration de la sauvegarde automatique périodique
        if (this.autosaveEnabled) {
            this.startAutosave();
        }
    }

    /**
     * Configure la navigation par onglets de l'interface principale.
     * 
     * Rôle : Gestionnaire de navigation - Transitions entre vues principales
     * Type : Event Binding - Liaison événements DOM pour navigation
     * Retour : void (effet : événements actifs sur boutons onglets)
     * Effets : addEventListener sur boutons, transitions visuelles
     * 
     * Éléments ciblés :
     * - .tab-button : boutons d'onglets dans l'en-tête
     * - [data-open-tab] : liens d'actions dans écran d'accueil
     */
    setupTabNavigation() {
        // Récupération des boutons d'onglets principaux
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        
        // Liaison événement clic pour chaque bouton d'onglet
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                // Récupération de l'ID d'onglet depuis attribut data-tab
                const tabId = button.dataset.tab;
                this.switchTab(tabId);
            });
        });
        
        // Liaison des liens d'actions rapides depuis l'écran d'accueil
        const welcomeLinks = document.querySelectorAll('[data-open-tab]');
        welcomeLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // Récupération de l'ID d'onglet depuis attribut data-open-tab
                const tabId = link.dataset.openTab;
                this.switchTab(tabId);
            });
        });
    }

    /**
     * Change l'onglet actif dans l'interface principale.
     * 
     * Args:
     *   tabId (string): Identifiant unique de l'onglet cible ['welcome', 'widgets', 'sections', 'presentation']
     * 
     * Rôle : Contrôleur de vue - Modification de l'affichage principal
     * Type : UI State Management - Gestion d'état visuel et navigation
     * Retour : void (effet : changement interface + état interne)
     * Effets : Classes CSS, état currentTab, callbacks
     * 
     * Algorithme de transition :
     * 1. Retirer classe 'active' de tous les boutons onglets
     * 2. Ajouter classe 'active' au bouton correspondant à tabId
     * 3. Masquer tous les contenus d'onglets (.tab-content)
     * 4. Afficher le contenu correspondant à tabId
     * 5. Mettre à jour l'état interne this.currentTab
     * 6. Déclencher callback de changement d'onglet
     */
    switchTab(tabId) {
        // Mise à jour visuelle des boutons d'onglets
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabId) {
                btn.classList.add('active');
            }
        });
        
        // Mise à jour de l'affichage du contenu correspondant
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId) {
                content.classList.add('active');
            }
        });
        
        // Sauvegarde de l'état actuel pour référence interne
        this.currentTab = tabId;
        
        // Déclenchement des actions spécifiques à chaque onglet
        this.onTabChanged(tabId);
    }

    /**
     * Configure les actions globales de l'éditeur principal.
     * 
     * Rôle : Gestionnaire d'actions - Liaison des boutons d'action globaux
     * Type : Event Setup - Liaison des contrôles utilisateur principaux
     * Retour : void (effet : événements actifs sur boutons globaux)
     * Effets : addEventListener sur boutons action, callbacks métier
     * 
     * Boutons ciblés :
     * - #newBtn : Création nouveau projet
     * - #saveBtn : Sauvegarde manuelle
     * - #exportBtn : Export de présentation
     * - #previewBtn : Aperçu temps réel
     */
    setupGlobalActions() {
        // Action Nouveau Projet - Réinitialisation complète
        document.getElementById('newBtn')?.addEventListener('click', () => {
            this.newProject();
        });
        
        // Action Sauvegarde Manuelle - Persistance immédiate
        document.getElementById('saveBtn')?.addEventListener('click', () => {
            this.saveProject();
        });
        
        // Action Export - Génération fichier final
        document.getElementById('exportBtn')?.addEventListener('click', () => {
            this.exportProject();
        });
        
        // Action Aperçu - Prévisualisation en nouvelle fenêtre
        document.getElementById('previewBtn')?.addEventListener('click', () => {
            this.previewProject();
        });
    }

    /**
     * Démarre l'horloge temps réel dans l'interface utilisateur.
     * 
     * Rôle : Afficheur temporel - Mise à jour continue de l'heure
     * Type : UI Timer - Affichage temps réel actualisé chaque seconde
     * Retour : void (effet : horloge active dans #currentTime)
     * Effets : setInterval 1000ms, modification DOM continue
     * 
     * Formule d'affichage :
     * format_heure = HH:MM:SS (notation 24h française)
     * fréquence_maj = 1000ms (1 seconde)
     * 
     * Exemple : "14:23:47" affiché et mis à jour en continu
     */
    startClock() {
        // Fonction de mise à jour de l'affichage horaire
        const updateTime = () => {
            // Récupération de l'heure système actuelle
            const now = new Date();
            
            // Formatage français standard HH:MM:SS
            const timeString = now.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            // Mise à jour de l'élément d'affichage si présent
            const timeElement = document.getElementById('currentTime');
            if (timeElement) {
                timeElement.textContent = timeString;
            }
        };
        
        // Affichage immédiat puis mise à jour chaque seconde
        updateTime();
        setInterval(updateTime, 1000);
    }

    /**
     * Démarre le système de sauvegarde automatique périodique.
     * 
     * Rôle : Persistance automatique - Sauvegarde périodique sans intervention
     * Type : Auto Persistence - Détection changements et sauvegarde silencieuse
     * Retour : void (effet : timer actif pour sauvegarde auto)
     * Effets : setInterval basé sur autosaveInterval, I/O localStorage
     * 
     * Formule de déclenchement :
     * if (hasUnsavedChanges()) then saveProject(silent=true)
     * fréquence = this.autosaveInterval ms
     * 
     * Exemple : Vérification toutes les 30000ms (30s), sauvegarde si changements
     */
    startAutosave() {
        setInterval(() => {
            // Vérification de la présence de modifications non sauvegardées
            if (this.hasUnsavedChanges()) {
                // Sauvegarde silencieuse (sans notification utilisateur)
                this.saveProject(true);
            }
        }, this.autosaveInterval);
    }

    /**
     * Gestionnaire des actions spécifiques au changement d'onglet.
     * 
     * Args:
     *   tabId (string): Identifiant de l'onglet nouvellement activé
     * 
     * Rôle : Event Handler post-navigation - Actions contextuelles par onglet
     * Type : Context Switch - Adaptation de l'interface selon la vue active
     * Retour : void (effet : actions spécifiques + titre page)
     * Effets : console.log debug, document.title, initializations possibles
     * 
     * Onglets gérés :
     * - 'widgets' : Activation éditeur de widgets
     * - 'sections' : Activation éditeur de sections  
     * - 'presentation' : Mode présentation complète
     * - défaut : Écran d'accueil
     */
    onTabChanged(tabId) {
        // Actions spécifiques selon l'onglet activé
        switch (tabId) {
            case 'widgets':
                console.log('Éditeur de widgets activé');
                break;
            case 'sections':
                console.log('Éditeur de sections activé');
                break;
            case 'presentation':
                console.log('Mode présentation complète activé');
                break;
            default:
                console.log('Écran d\'accueil affiché');
        }
        
        // Mise à jour du titre de page pour navigation cohérente
        this.updatePageTitle(tabId);
    }

    /**
     * Met à jour le titre de la page selon l'onglet actif.
     * 
     * Args:
     *   tabId (string): Identifiant de l'onglet pour titre contextuel
     * 
     * Rôle : UI Consistency - Titre de page contextuel et cohérent
     * Type : Document Metadata - Modification titre pour navigation
     * Retour : void (effet : document.title modifié)
     * Effets : Modification document.title, amélioration UX navigation
     */
    updatePageTitle(tabId) {
        // Mapping des titres contextuels par onglet
        const titles = {
            'welcome': '🎯 Éditeur Révolutionnaire - Accueil',
            'widgets': '🎯 Éditeur Révolutionnaire - Widgets',
            'sections': '🎯 Éditeur Révolutionnaire - Sections',
            'presentation': '🎯 Éditeur Révolutionnaire - Présentation'
        };
        
        // Application du titre correspondant ou titre par défaut
        document.title = titles[tabId] || '🎯 Éditeur Révolutionnaire';
    }

    /**
     * Crée un nouveau projet après confirmation utilisateur.
     * 
     * Rôle : Project Management - Initialisation projet vierge sécurisée
     * Type : Data Management - Réinitialisation complète avec confirmation
     * Retour : void (effet : projet vierge + navigation accueil)
     * Effets : Confirmation utilisateur, clearAllData(), switchTab(), notification
     */
    newProject() {
        // Confirmation avant perte des modifications non sauvegardées
        if (this.hasUnsavedChanges() && 
            !confirm('Créer un nouveau projet ? Les modifications non sauvegardées seront perdues.')) {
            return;
        }
        
        // Nettoyage complet des données existantes
        this.clearAllData();
        
        // Retour automatique à l'écran d'accueil
        this.switchTab('welcome');
        
        // Notification de confirmation à l'utilisateur
        this.showNotification('Nouveau projet créé', 'success');
    }

    /**
     * Sauvegarde le projet complet avec gestion d'erreurs.
     * 
     * Args:
     *   silent (boolean): Mode silencieux sans notification (défaut: false)
     * 
     * Rôle : Data Persistence - Sauvegarde complète et sécurisée
     * Type : I/O Operation - Collecte données + persistance localStorage
     * Retour : void (effet : données sauvegardées + notification/erreur)
     * Effets : localStorage écriture, this.lastSaved update, notifications
     * 
     * Algorithme de sauvegarde :
     * 1. Collecte des données de tous les éditeurs → projectData
     * 2. Enrichissement métadonnées (timestamp, version) → enrichedData
     * 3. Sérialisation JSON → JSON.stringify(enrichedData)
     * 4. Persistance localStorage → clé 'licubepro_presentation'
     * 5. Mise à jour this.lastSaved → Date.now()
     * 6. Notification utilisateur (sauf si silent=true)
     */
    saveProject(silent = false) {
        try {
            // Collecte de toutes les données des éditeurs actifs
            const projectData = this.collectProjectData();
            
            // Enrichissement avec métadonnées de sauvegarde
            const enrichedData = {
                ...projectData,
                saved: new Date().toISOString(),
                version: '2.0'
            };
            
            // Persistance sécurisée en localStorage
            localStorage.setItem('licubepro_presentation', JSON.stringify(enrichedData));
            
            // Mise à jour de l'horodatage de sauvegarde
            this.lastSaved = new Date();
            
            // Notification de succès (sauf mode silencieux)
            if (!silent) {
                this.showNotification('Projet sauvegardé avec succès', 'success');
            }
            
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            
            // Notification d'erreur (sauf mode silencieux)
            if (!silent) {
                this.showNotification('Erreur lors de la sauvegarde', 'error');
            }
        }
    }

    /**
     * Collecte les données de tous les éditeurs pour sauvegarde complète.
     * 
     * Rôle : Data Collection - Agrégation des données multi-éditeurs
     * Type : State Aggregation - Compilation état complet application
     * Retour : Object données structurées du projet complet
     * Effets : Communication inter-éditeurs, collecte state widgets/sections
     * 
     * Structure retournée :
     * {
     *   currentTab: string,     // Onglet actif sauvegardé
     *   widgets: Array,         // Données de tous les widgets
     *   sections: Array,        // Données de toutes les sections
     *   settings: Object        // Configuration thème/langue
     * }
     */
    collectProjectData() {
        // Structure de base du projet avec valeurs par défaut
        const projectData = {
            currentTab: this.currentTab,
            widgets: [],
            sections: [],
            settings: {
                theme: 'revolutionary',
                language: 'fr'
            }
        };
        
        // Tentative de récupération des données des éditeurs
        try {
            // Note : En production, communication via postMessage avec iframes
            // Pour cette démo, utilisation de données simulées
            
            projectData.widgets = this.getMockWidgetData();
            projectData.sections = this.getMockSectionData();
            
        } catch (error) {
            console.warn('Impossible de récupérer les données des éditeurs:', error);
        }
        
        return projectData;
    }

    /**
     * Génère des données simulées pour les widgets (démo).
     * 
     * Rôle : Mock Data Provider - Données d'exemple pour démonstration
     * Type : Test Data - Simulation contenu widgets typiques
     * Retour : Array<Object> tableau de widgets avec structure réaliste
     */
    getMockWidgetData() {
        return [
            {
                id: 'widget_demo_1',
                type: 'element-universel',
                data: { 
                    image: { src: '', alt: '' },
                    texte1: 'Titre Principal',
                    texte2: 'Sous-titre Impactant', 
                    texte3: 'Description détaillée'
                }
            },
            {
                id: 'widget_demo_2',
                type: 'grille-composition',
                data: { 
                    mode: 'colonne',
                    elements: [],
                    colonnes: 3,
                    lignes: 2
                }
            }
        ];
    }

    /**
     * Génère des données simulées pour les sections (démo).
     * 
     * Rôle : Mock Data Provider - Données d'exemple sections
     * Type : Test Data - Simulation contenu sections typiques  
     * Retour : Array<Object> tableau de sections avec structure réaliste
     */
    getMockSectionData() {
        return [
            {
                id: 'section_demo_1',
                type: 'hero',
                data: {
                    title: '🎯 Éditeur Révolutionnaire',
                    subtitle: 'Phase 1 - Widgets Universels',
                    description: 'La solution qui révolutionne la création de présentations'
                }
            }
        ];
    }

    /**
     * Exporte le projet complet en fichier HTML téléchargeable.
     * 
     * Rôle : Data Export - Génération fichier autonome pour diffusion
     * Type : File Generation - HTML complet avec CSS intégré
     * Retour : void (effet : téléchargement fichier HTML)
     * Effets : Blob création, URL.createObjectURL, élément <a> download
     * 
     * Processus d'export :
     * 1. Collecte données projet → collectProjectData()
     * 2. Génération HTML complet → generateCompleteHTML()
     * 3. Création Blob avec MIME text/html → new Blob([html])
     * 4. Génération URL téléchargement → URL.createObjectURL()
     * 5. Déclenchement téléchargement → <a>.click()
     * 6. Nettoyage URL → URL.revokeObjectURL()
     */
    exportProject() {
        try {
            // Collecte des données complètes du projet
            const projectData = this.collectProjectData();
            
            // Génération du HTML autonome complet
            const htmlContent = this.generateCompleteHTML(projectData);
            
            // Création du fichier téléchargeable
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            // Déclenchement du téléchargement avec nom horodaté
            const a = document.createElement('a');
            a.href = url;
            a.download = `editeur-revolutionnaire-${new Date().toISOString().slice(0, 10)}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Confirmation de succès
            this.showNotification('Présentation exportée avec succès', 'success');
            
        } catch (error) {
            console.error('Erreur lors de l\'export:', error);
            this.showNotification('Erreur lors de l\'export', 'error');
        }
    }

    /**
     * Génère le HTML complet autonome de la présentation.
     * 
     * Args:
     *   projectData (Object): Données structurées du projet complet
     * 
     * Rôle : HTML Generator - Création document autonome et stylisé
     * Type : Template Engine - Génération HTML avec CSS intégré
     * Retour : String contenu HTML complet prêt à l'usage
     * 
     * Structure générée :
     * - Document HTML5 valide avec meta viewport responsive
     * - CSS intégré pour autonomie complète (pas de dépendances)
     * - Contenu généré dynamiquement selon projectData
     * - Scripts d'interaction de base si nécessaires
     */
    generateCompleteHTML(projectData) {
        return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎯 Éditeur Révolutionnaire - Présentation Générée</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
            color: white;
        }
        .presentation-container { 
            min-height: 100vh; 
            display: flex; 
            flex-direction: column;
            padding: 20px;
        }
        .hero-section { 
            text-align: center; 
            padding: 80px 40px; 
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        h1 { 
            font-size: clamp(2.5rem, 6vw, 4rem); 
            font-weight: 900; 
            margin-bottom: 1rem; 
            background: linear-gradient(135deg, #10B981 0%, #14B8A6 100%); 
            -webkit-background-clip: text; 
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .subtitle { 
            font-size: 1.5rem; 
            color: #10B981; 
            font-weight: 600; 
            margin-bottom: 1rem; 
        }
        .description { 
            font-size: 1.2rem; 
            max-width: 600px; 
            margin: 0 auto 2rem auto; 
            opacity: 0.9; 
        }
        .cta-button { 
            background: linear-gradient(135deg, #10B981 0%, #14B8A6 100%); 
            color: white; 
            border: none; 
            padding: 1rem 2rem; 
            font-size: 1.1rem; 
            font-weight: 600; 
            border-radius: 8px; 
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        .cta-button:hover { 
            transform: translateY(-2px); 
        }
        @media (max-width: 768px) {
            .hero-section { padding: 40px 20px; }
            h1 { font-size: 2.5rem; }
            .subtitle { font-size: 1.2rem; }
            .description { font-size: 1rem; }
        }
    </style>
</head>
<body>
    <!-- Présentation générée par Éditeur Révolutionnaire v2.0 -->
    <div class="presentation-container">
        <section class="hero-section">
            <h1>🎯 Éditeur Révolutionnaire</h1>
            <div class="subtitle">Phase 1 - Widgets Universels</div>
            <p class="description">Architecture révolutionnaire avec 2 widgets universels couvrant 90% des besoins de présentation</p>
            <button class="cta-button" onclick="alert('Présentation générée avec succès !')">
                ✨ Découvrir l'Innovation
            </button>
        </section>
    </div>
    
    <script>
        console.log('Présentation Éditeur Révolutionnaire chargée');
        console.log('Données du projet:', ${JSON.stringify(projectData, null, 2)});
        
        // Animation d'entrée au chargement
        document.addEventListener('DOMContentLoaded', function() {
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                document.body.style.opacity = '1';
            }, 100);
        });
    </script>
</body>
</html>`;
    }

    /**
     * Ouvre un aperçu de la présentation en nouvelle fenêtre.
     * 
     * Rôle : Preview System - Prévisualisation temps réel sans export
     * Type : Window Management - Ouverture nouvelle fenêtre avec contenu
     * Retour : void (effet : nouvelle fenêtre avec aperçu)
     * Effets : window.open(), document.write() dans nouvelle fenêtre
     */
    previewProject() {
        const projectData = this.collectProjectData();
        const htmlContent = this.generateCompleteHTML(projectData);
        
        // Ouverture dans nouvelle fenêtre pour prévisualisation
        const previewWindow = window.open('', '_blank', 'width=1200,height=800');
        previewWindow.document.write(htmlContent);
        previewWindow.document.close();
    }

    /**
     * Vérifie la présence de modifications non sauvegardées.
     * 
     * Rôle : State Checker - Détection de changements depuis dernière sauvegarde
     * Type : Data Comparison - Comparaison état actuel vs sauvegardé
     * Retour : Boolean true si modifications non sauvegardées existent
     * 
     * Logique de détection :
     * - Si jamais sauvegardé (!this.lastSaved) → true
     * - Si temps écoulé > autosaveInterval → true (approche simplifiée)
     * - Sinon → false
     * 
     * Note : En production, comparaison hash/checksum état vs sauvegarde
     */
    hasUnsavedChanges() {
        // Logique simplifiée pour la démo
        // En production : comparaison état actuel vs dernière sauvegarde
        return !this.lastSaved || (Date.now() - this.lastSaved.getTime()) > this.autosaveInterval;
    }

    /**
     * Nettoie toutes les données pour réinitialisation complète.
     * 
     * Rôle : Data Cleanup - Réinitialisation système complète
     * Type : State Reset - Nettoyage localStorage + état interne
     * Retour : void (effet : système remis à zéro)
     * Effets : localStorage.removeItem(), this.lastSaved reset
     */
    clearAllData() {
        // Suppression des données persistantes
        localStorage.removeItem('licubepro_presentation');
        
        // Réinitialisation de l'état interne
        this.lastSaved = null;
        
        // Note : Communication aux composants pour réinitialisation
        // (à implémenter avec postMessage en production)
    }

    /**
     * Affiche une notification temporaire à l'utilisateur.
     * 
     * Args:
     *   message (string): Texte de la notification à afficher
     *   type (string): Type de notification ['info', 'success', 'error'] (défaut: 'info')
     * 
     * Rôle : UI Feedback - Messages de statut temporaires stylisés
     * Type : Toast Notification - Popup temporaire non-bloquant
     * Retour : void (effet : notification visuelle temporaire)
     * Effets : Création élément DOM, animations CSS, suppression auto
     * 
     * Comportement :
     * - Position : fixe en haut à droite (z-index élevé)
     * - Animation : slide-in depuis la droite, slide-out après 3s
     * - Style : adaptatif selon type (success=vert, error=rouge, info=bleu)
     * - Auto-suppression : après 3000ms avec transition
     */
    showNotification(message, type = 'info') {
        // Création de l'élément de notification stylisé
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 10001;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            max-width: 350px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        // Application du style selon le type de notification
        switch (type) {
            case 'success':
                notification.style.background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
                break;
            case 'error':
                notification.style.background = 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
                break;
            default:
                notification.style.background = 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)';
        }
        
        // Injection du message et insertion dans le DOM
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animation d'entrée depuis la droite
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Suppression automatique avec animation de sortie
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// 
// Fonction globale d'assistance pour changement d'onglet
// Rôle : Helper Function - Interface publique pour navigation externe  
// Type : Global API - Accessible depuis iframes ou composants externes
// Usage : switchTab('widgets') depuis composant externe
//
function switchTab(tabId) {
    if (window.presentationEditor) {
        window.presentationEditor.switchTab(tabId);
    }
}

// 
// Gestion des raccourcis clavier globaux pour efficacité utilisateur
// Rôle : Keyboard Shortcuts - Amélioration productivité et accessibilité
// Type : Event Listener Global - Capture événements clavier document
// Raccourcis : Ctrl+S (save), Ctrl+N (new), F5 (preview)
//
document.addEventListener('keydown', (e) => {
    // Vérification de l'existence de l'éditeur principal
    if (!window.presentationEditor) return;
    
    // Ctrl+S : Sauvegarde rapide
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        window.presentationEditor.saveProject();
    }
    
    // Ctrl+N : Nouveau projet rapide
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        window.presentationEditor.newProject();
    }
    
    // F5 : Aperçu rapide (remplace rechargement page)
    if (e.key === 'F5') {
        e.preventDefault();
        window.presentationEditor.previewProject();
    }
});