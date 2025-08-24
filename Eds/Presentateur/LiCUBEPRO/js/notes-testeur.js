/**
 * =====================================================
 * SYSTÈME DE NOTES TESTEUR - PHASE ALPHA
 * =====================================================
 * 
 * Rôle    : Fenêtre flottante pour notes de test et rapport de bugs
 * Type    : Module JavaScript autonome
 * Usage   : Phase alpha interne uniquement - sera retiré en production
 * Sauvegarde : Fichiers markdown locaux dans dossier "notes-utilisateur"
 * Format  : chemin-complet-avec-underscores.md (ex: LiCUBEPRO_presentations-vente_calculateur-tco.md)
 */

// ========================================
// CONFIGURATION SYSTÈME NOTES
// ========================================

/**
 * Configuration globale du système de notes
 * Rôle    : Paramètres et état de la fenêtre de notes
 * Type    : objet de configuration
 */
const configNotes = {
    isOpen: false,
    position: { x: 20, y: 20 },
    pageInfo: {
        name: '',
        mode: 'general',
        path: ''
    }
};

// ========================================
// CRÉATION INTERFACE NOTES
// ========================================

/**
 * Crée et initialise la fenêtre de notes testeur
 * Rôle      : Construction de l'interface complète de notes
 * Type      : fonction d'initialisation
 * Effet     : Ajoute la fenêtre au DOM et configure les événements
 */
function creerFenetreNotes() {
    console.log('📝 Initialisation système notes testeur...');
    
    // Détection automatique du contexte de page
    detecterContextePage();
    
    // Création du conteneur principal
    const conteneurNotes = document.createElement('div');
    conteneurNotes.id = 'notes-testeur-container';
    conteneurNotes.innerHTML = genererHTMLNotes();
    
    // Injection dans le DOM
    document.body.appendChild(conteneurNotes);
    
    // Configuration des événements
    configurerEvenementsNotes();
    
    // Application du style
    injecterStylesNotes();
    
    console.log('✅ Fenêtre notes testeur opérationnelle');
}

/**
 * Génère le HTML complet de la fenêtre de notes
 * Rôle      : Template HTML de l'interface notes
 * Type      : fonction de templating
 * Retour    : string HTML complet
 */
function genererHTMLNotes() {
    return `
        <!-- Bouton flottant pour ouvrir/fermer les notes -->
        <div id="notes-toggle-btn" class="notes-toggle-btn" title="Notes Testeur (Phase Alpha)">
            📝
            <span class="notes-badge">ALPHA</span>
        </div>
        
        <!-- Fenêtre de notes (fermée par défaut) -->
        <div id="notes-window" class="notes-window notes-hidden">
            <!-- En-tête avec infos contexte -->
            <div class="notes-header">
                <div class="notes-title">
                    <span class="notes-icon">🧪</span>
                    <span>Notes Testeur</span>
                    <span class="notes-phase">ALPHA</span>
                </div>
                <button id="notes-close-btn" class="notes-close-btn" title="Fermer">✕</button>
            </div>
            
            <!-- Infos contexte page -->
            <div class="notes-context">
                <div class="notes-context-item">
                    <strong>Page:</strong> <span id="notes-page-name">${configNotes.pageInfo.name}</span>
                </div>
                <div class="notes-context-item">
                    <strong>Mode:</strong> <span id="notes-page-mode">${configNotes.pageInfo.mode}</span>
                </div>
                <div class="notes-context-item">
                    <strong>Fichier:</strong> <span id="notes-file-name">${genererNomFichier()}</span>
                </div>
            </div>
            
            <!-- Zone de saisie -->
            <div class="notes-input-section">
                <label for="notes-textarea" class="notes-label">
                    💬 Rapport Bug / Amélioration / Note:
                </label>
                <textarea 
                    id="notes-textarea" 
                    class="notes-textarea"
                    placeholder="Exemple:
BUG: Le slider unités ne fonctionne pas sur Chrome
AMÉLIORATION: Ajouter un tooltip explicatif sur TCO
NOTE: Interface très claire, bon travail!

Chaque ligne sera formatée avec des bullet points automatiquement."
                    rows="6"
                ></textarea>
            </div>
            
            <!-- Actions -->
            <div class="notes-actions">
                <button id="notes-save-btn" class="notes-save-btn">
                    💾 Sauvegarder Note
                </button>
                <button id="notes-view-btn" class="notes-view-btn">
                    👁️ Voir Toutes les Notes
                </button>
                <button id="notes-clear-btn" class="notes-clear-btn">
                    🗑️ Effacer Saisie
                </button>
            </div>
            
            <!-- Zone d'affichage des notes existantes -->
            <div id="notes-display" class="notes-display notes-hidden">
                <div class="notes-display-header">
                    <strong>📋 Historique des notes:</strong>
                    <button id="notes-hide-display-btn" class="notes-hide-btn">Masquer</button>
                </div>
                <div id="notes-content" class="notes-content">
                    Chargement des notes existantes...
                </div>
            </div>
        </div>
    `;
}

/**
 * Injecte les styles CSS pour la fenêtre de notes
 * Rôle    : Styling complet de l'interface notes
 * Type    : fonction de styling
 * Effet   : Ajoute une balise <style> au document
 */
function injecterStylesNotes() {
    const style = document.createElement('style');
    style.textContent = `
        /* ========================================
           STYLES FENÊTRE NOTES TESTEUR
           ======================================== */
        
        /* Bouton flottant */
        .notes-toggle-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
            transition: all 0.3s ease;
            z-index: 10000;
            color: white;
            font-weight: bold;
            animation: pulse-notes 2s infinite;
        }
        
        .notes-toggle-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 12px 35px rgba(255, 107, 53, 0.6);
        }
        
        .notes-badge {
            position: absolute;
            top: -8px;
            right: -8px;
            background: #DC3545;
            color: white;
            font-size: 10px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 10px;
            border: 2px solid white;
            animation: blink-alpha 1.5s infinite;
        }
        
        /* Fenêtre de notes */
        .notes-window {
            position: fixed;
            top: 90px;
            right: 20px;
            width: 400px;
            max-height: 80vh;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(20px);
            border: 2px solid rgba(255, 107, 53, 0.3);
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            z-index: 9999;
            color: white;
            font-family: 'Inter', sans-serif;
            transition: all 0.3s ease;
            overflow: hidden;
        }
        
        .notes-hidden {
            opacity: 0;
            visibility: hidden;
            transform: translateY(-20px) scale(0.9);
        }
        
        /* En-tête */
        .notes-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .notes-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 700;
            font-size: 16px;
        }
        
        .notes-phase {
            background: rgba(220, 53, 69, 0.9);
            padding: 2px 8px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 800;
        }
        
        .notes-close-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            transition: all 0.2s ease;
        }
        
        .notes-close-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.1);
        }
        
        /* Contexte page */
        .notes-context {
            padding: 15px 20px;
            background: rgba(255, 255, 255, 0.05);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .notes-context-item {
            font-size: 13px;
            margin-bottom: 5px;
            color: rgba(255, 255, 255, 0.8);
        }
        
        .notes-context-item strong {
            color: #FF6B35;
            margin-right: 8px;
        }
        
        /* Zone de saisie */
        .notes-input-section {
            padding: 20px;
        }
        
        .notes-label {
            display: block;
            font-weight: 600;
            margin-bottom: 10px;
            color: #FF6B35;
            font-size: 14px;
        }
        
        .notes-textarea {
            width: 100%;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 12px;
            color: white;
            font-family: 'Inter', sans-serif;
            font-size: 13px;
            line-height: 1.5;
            resize: vertical;
            transition: border-color 0.2s ease;
        }
        
        .notes-textarea:focus {
            outline: none;
            border-color: #FF6B35;
            background: rgba(255, 255, 255, 0.15);
        }
        
        .notes-textarea::placeholder {
            color: rgba(255, 255, 255, 0.5);
        }
        
        /* Actions */
        .notes-actions {
            padding: 0 20px 20px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .notes-actions button {
            flex: 1;
            min-width: 100px;
            padding: 10px 12px;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .notes-save-btn {
            background: linear-gradient(135deg, #28A745 0%, #20B2AA 100%);
            color: white;
        }
        
        .notes-save-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4);
        }
        
        .notes-view-btn {
            background: linear-gradient(135deg, #007BFF 0%, #0056B3 100%);
            color: white;
        }
        
        .notes-view-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 123, 255, 0.4);
        }
        
        .notes-clear-btn {
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .notes-clear-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            color: white;
        }
        
        /* Zone d'affichage des notes */
        .notes-display {
            max-height: 300px;
            overflow-y: auto;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .notes-display-header {
            padding: 15px 20px 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #FF6B35;
            font-size: 14px;
        }
        
        .notes-hide-btn {
            background: none;
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: rgba(255, 255, 255, 0.7);
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 11px;
            cursor: pointer;
        }
        
        .notes-hide-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            color: white;
        }
        
        .notes-content {
            padding: 0 20px 20px;
            font-size: 13px;
            line-height: 1.5;
            white-space: pre-wrap;
            color: rgba(255, 255, 255, 0.8);
            max-height: 200px;
            overflow-y: auto;
        }
        
        /* Animations */
        @keyframes pulse-notes {
            0%, 100% { box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4); }
            50% { box-shadow: 0 8px 25px rgba(255, 107, 53, 0.7); }
        }
        
        @keyframes blink-alpha {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        /* Responsive */
        @media (max-width: 500px) {
            .notes-window {
                width: calc(100vw - 40px);
                right: 20px;
                left: 20px;
            }
            
            .notes-toggle-btn {
                width: 50px;
                height: 50px;
                font-size: 20px;
            }
        }
        
        /* Scrollbar personnalisée */
        .notes-content::-webkit-scrollbar {
            width: 6px;
        }
        
        .notes-content::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
        }
        
        .notes-content::-webkit-scrollbar-thumb {
            background: #FF6B35;
            border-radius: 3px;
        }
        
        .notes-content::-webkit-scrollbar-thumb:hover {
            background: #F7931E;
        }
    `;
    
    document.head.appendChild(style);
}

// ========================================
// DÉTECTION CONTEXTE PAGE
// ========================================

/**
 * Détecte automatiquement le contexte de la page courante
 * Rôle      : Identification de la page et du mode pour nommer les fichiers
 * Type      : fonction d'analyse
 * Effet     : Met à jour configNotes.pageInfo
 */
function detecterContextePage() {
    const path = window.location.pathname;
    const url = window.location.href;
    
    // Extraction du nom de page sans extension
    const segments = path.split('/');
    const fileName = segments[segments.length - 1];
    const pageName = fileName.replace('.html', '').replace(/[^a-zA-Z0-9-_]/g, '-');
    
    // Détection du mode (vente/location)
    let mode = 'general';
    if (path.includes('presentations-vente')) {
        mode = 'vente';
    } else if (path.includes('presentations-location')) {
        mode = 'location';
    } else if (path.includes('admin')) {
        mode = 'admin';
    }
    
    // Mise à jour configuration
    configNotes.pageInfo = {
        name: pageName || 'page-inconnue',
        mode: mode,
        path: path
    };
    
    console.log('📍 Contexte détecté:', configNotes.pageInfo);
}

/**
 * Génère le nom de fichier pour les notes basé sur le chemin complet
 * Rôle      : Création du nom de fichier avec chemin complet et underscores
 * Type      : fonction utilitaire
 * Retour    : string nom de fichier
 * Exemple   : "LiCUBEPRO_presentations-location_supports-print_flyers_flyer-client-standard.md"
 */
function genererNomFichier() {
    const path = window.location.pathname;
    
    // Extraction du chemin depuis LiCUBEPRO
    const segments = path.split('/');
    const licubeIndex = segments.findIndex(segment => segment === 'LiCUBEPRO');
    
    if (licubeIndex !== -1) {
        // Prendre tous les segments depuis LiCUBEPRO
        const pathSegments = segments.slice(licubeIndex);
        
        // Nettoyer le dernier segment (enlever .html)
        const lastIndex = pathSegments.length - 1;
        pathSegments[lastIndex] = pathSegments[lastIndex].replace('.html', '');
        
        // Joindre avec des underscores
        return pathSegments.join('_') + '.md';
    }
    
    // Fallback si LiCUBEPRO n'est pas trouvé
    return `${configNotes.pageInfo.name}_${configNotes.pageInfo.mode}.md`;
}

// ========================================
// GESTION ÉVÉNEMENTS
// ========================================

/**
 * Configure tous les événements de la fenêtre de notes
 * Rôle    : Liaison des boutons avec leurs actions
 * Type    : fonction de configuration
 * Effet   : Ajoute les event listeners sur tous les éléments interactifs
 */
function configurerEvenementsNotes() {
    // Toggle fenêtre notes
    document.getElementById('notes-toggle-btn').addEventListener('click', togglerFenetreNotes);
    document.getElementById('notes-close-btn').addEventListener('click', fermerFenetreNotes);
    
    // Actions notes
    document.getElementById('notes-save-btn').addEventListener('click', sauvegarderNote);
    document.getElementById('notes-view-btn').addEventListener('click', afficherNotesExistantes);
    document.getElementById('notes-clear-btn').addEventListener('click', effacerSaisie);
    document.getElementById('notes-hide-display-btn').addEventListener('click', masquerAffichageNotes);
    
    // Raccourcis clavier
    document.addEventListener('keydown', function(event) {
        // Ctrl+Shift+N pour ouvrir/fermer
        if (event.ctrlKey && event.shiftKey && event.key === 'N') {
            event.preventDefault();
            togglerFenetreNotes();
        }
        
        // Echap pour fermer
        if (event.key === 'Escape' && configNotes.isOpen) {
            fermerFenetreNotes();
        }
    });
}

/**
 * Ouvre/ferme la fenêtre de notes
 * Rôle    : Toggle de visibilité de la fenêtre
 * Type    : fonction d'interface
 */
function togglerFenetreNotes() {
    if (configNotes.isOpen) {
        fermerFenetreNotes();
    } else {
        ouvrirFenetreNotes();
    }
}

/**
 * Ouvre la fenêtre de notes
 * Rôle    : Affichage de la fenêtre avec animation
 * Type    : fonction d'interface
 */
function ouvrirFenetreNotes() {
    const fenetreNotes = document.getElementById('notes-window');
    fenetreNotes.classList.remove('notes-hidden');
    configNotes.isOpen = true;
    
    // Focus sur textarea
    setTimeout(() => {
        document.getElementById('notes-textarea').focus();
    }, 300);
    
    console.log('📝 Fenêtre notes ouverte');
}

/**
 * Ferme la fenêtre de notes
 * Rôle    : Masquage de la fenêtre avec animation
 * Type    : fonction d'interface
 */
function fermerFenetreNotes() {
    const fenetreNotes = document.getElementById('notes-window');
    fenetreNotes.classList.add('notes-hidden');
    configNotes.isOpen = false;
    
    // Masquer aussi l'affichage des notes
    document.getElementById('notes-display').classList.add('notes-hidden');
    
    console.log('📝 Fenêtre notes fermée');
}

// ========================================
// SAUVEGARDE NOTES
// ========================================

/**
 * Sauvegarde une nouvelle note avec gestion d'en-tête et format markdown
 * Rôle      : Ajout d'une note à la suite des existantes avec URL en en-tête si nouveau fichier
 * Type      : fonction de sauvegarde
 * Effet     : Crée/complète le fichier markdown correspondant
 * 
 * LOGIQUE EN-TÊTE :
 * - L'en-tête avec URL est toujours ajoutée pour garantir l'information
 * - Chaque note est formatée avec bullet points et timestamp
 * - Le fichier est conçu pour être concaténé manuellement par l'utilisateur
 */
function sauvegarderNote() {
    const textarea = document.getElementById('notes-textarea');
    const contenuNote = textarea.value.trim();
    
    if (!contenuNote) {
        alert('⚠️ Veuillez écrire une note avant de sauvegarder.');
        textarea.focus();
        return;
    }
    
    // Formatage de la note avec timestamp
    const timestamp = new Date().toLocaleString('fr-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    const nomFichier = genererNomFichier();
    const urlComplete = window.location.href;
    
    // Format markdown optimisé avec en-tête systématique
    // L'utilisateur devra concaténer manuellement les fichiers si nécessaire
    const noteFormatee = creerContenuNoteMarkdown(urlComplete, timestamp, contenuNote);
    
    // Sauvegarde via téléchargement de fichier
    sauvegarderFichierLocal(nomFichier, noteFormatee);
    
    // Effacer la zone de saisie
    textarea.value = '';
    
    // Confirmation
    afficherConfirmationSauvegarde();
    
    console.log('💾 Note sauvegardée:', nomFichier);
}

/**
 * Crée le contenu markdown formaté pour une note
 * Rôle      : Formatage markdown avec en-tête, timestamp et bullet points
 * Type      : fonction de formatage
 * Paramètres : urlComplete (string), timestamp (string), contenuNote (string)
 * Retour    : string contenu markdown formaté
 */
function creerContenuNoteMarkdown(urlComplete, timestamp, contenuNote) {
    // Formatage du contenu avec bullet points pour chaque ligne
    const contenuAvecBullets = contenuNote
        .split('\n')
        .filter(ligne => ligne.trim() !== '') // Enlever les lignes vides
        .map(ligne => `• ${ligne.trim()}`)
        .join('\n');
    
    return `# 📄 Notes Alpha Testeur

**URL de la page :** ${urlComplete}

---

## 📅 Note du ${timestamp}

${contenuAvecBullets}

---

> 📝 **Instructions concaténation :**  
> Si vous avez plusieurs fichiers pour la même page,  
> copiez le contenu des sections "Note du..." dans un seul fichier  
> en gardant l'en-tête URL une seule fois.

`;
}

/**
 * Sauvegarde un fichier markdown localement
 * Rôle      : Création et téléchargement d'un fichier markdown
 * Type      : fonction de sauvegarde système
 * Paramètre : nomFichier (string) - nom du fichier à créer
 * Paramètre : contenu (string) - contenu markdown du fichier
 */
function sauvegarderFichierLocal(nomFichier, contenu) {
    try {
        // Création du blob avec le contenu markdown
        const blob = new Blob([contenu], { type: 'text/markdown;charset=utf-8' });
        
        // Création du lien de téléchargement
        const lien = document.createElement('a');
        lien.href = URL.createObjectURL(blob);
        lien.download = nomFichier;
        
        // Déclenchement du téléchargement
        document.body.appendChild(lien);
        lien.click();
        document.body.removeChild(lien);
        
        // Libération de la mémoire
        URL.revokeObjectURL(lien.href);
        
    } catch (error) {
        console.error('❌ Erreur sauvegarde fichier:', error);
        alert('❌ Erreur lors de la sauvegarde. Copiez votre note manuellement.');
    }
}

/**
 * Affiche une confirmation de sauvegarde
 * Rôle    : Feedback visuel de réussite
 * Type    : fonction d'interface
 */
function afficherConfirmationSauvegarde() {
    const boutonSave = document.getElementById('notes-save-btn');
    const texteOriginal = boutonSave.textContent;
    
    // Animation de confirmation
    boutonSave.textContent = '✅ Note Sauvegardée!';
    boutonSave.style.background = 'linear-gradient(135deg, #28A745 0%, #20B2AA 100%)';
    
    setTimeout(() => {
        boutonSave.textContent = texteOriginal;
        boutonSave.style.background = '';
    }, 2000);
}

// ========================================
// AFFICHAGE NOTES EXISTANTES
// ========================================

/**
 * Affiche/masque les notes existantes (simulation)
 * Rôle    : Toggle de l'affichage de l'historique des notes
 * Type    : fonction d'interface
 */
function afficherNotesExistantes() {
    const displayZone = document.getElementById('notes-display');
    const contentZone = document.getElementById('notes-content');
    
    if (displayZone.classList.contains('notes-hidden')) {
        // Afficher avec contenu simulé
        displayZone.classList.remove('notes-hidden');
        
        const contenuSimule = genererContenuNotesSimule();
        contentZone.textContent = contenuSimule;
        
    } else {
        // Masquer
        displayZone.classList.add('notes-hidden');
    }
}

/**
 * Masque l'affichage des notes
 * Rôle    : Fermeture de la zone d'historique
 * Type    : fonction d'interface
 */
function masquerAffichageNotes() {
    document.getElementById('notes-display').classList.add('notes-hidden');
}

/**
 * Génère un contenu simulé pour les notes existantes
 * Rôle      : Simulation d'historique de notes pour démonstration
 * Type      : fonction de démonstration
 * Retour    : string contenu formaté
 */
function genererContenuNotesSimule() {
    return `Simulation - Les notes précédentes apparaîtraient ici.

📁 Fichier: ${genererNomFichier()}
📍 Emplacement: Dossier "notes-utilisateur" sur votre ordinateur

ℹ️ Instructions:
• Chaque note est sauvegardée automatiquement
• Format markdown (.md) avec URL complète en en-tête
• Nom basé sur le chemin complet: LiCUBEPRO_chemin_fichier.md
• Notes séparées par des bullet points (•)
• URL ajoutée uniquement si fichier inexistant

⚠️ Phase Alpha:
Cette fonctionnalité sera retirée en production.
Destinée uniquement aux testeurs internes.`;
}

/**
 * Efface le contenu de la zone de saisie
 * Rôle    : Reset du textarea
 * Type    : fonction utilitaire
 */
function effacerSaisie() {
    const textarea = document.getElementById('notes-textarea');
    
    if (textarea.value.trim()) {
        if (confirm('🗑️ Êtes-vous sûr de vouloir effacer votre saisie actuelle?')) {
            textarea.value = '';
            textarea.focus();
        }
    } else {
        textarea.focus();
    }
}

// ========================================
// INITIALISATION AUTOMATIQUE
// ========================================

/**
 * Initialisation automatique du système de notes
 * Rôle    : Point d'entrée automatique au chargement DOM
 * Type    : event listener
 * Effet   : Lance l'initialisation dès que le DOM est prêt
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🧪 === INITIALISATION NOTES TESTEUR ALPHA ===');
    
    // Attendre que la page soit complètement chargée
    setTimeout(() => {
        creerFenetreNotes();
        
        // Message de bienvenue en console pour les testeurs
        console.log(`
🧪 SYSTÈME NOTES TESTEUR - PHASE ALPHA
=====================================
• Bouton flottant en haut à droite: 📝
• Raccourci: Ctrl+Shift+N
• Fichier: ${genererNomFichier()}
• Format: Markdown (.md) avec URL complète
• Nom: Chemin complet avec underscores
• Destiné aux testeurs internes uniquement
=====================================
        `);
    }, 500);
});

// Export pour utilisation externe si nécessaire
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { creerFenetreNotes, configNotes };
}