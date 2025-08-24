/**
 * =====================================================
 * SYSTÈME DE NOTES TESTEUR - VERSION SIMPLIFIÉE
 * =====================================================
 * 
 * Version sans dialogue fichier - sauvegarde automatique uniquement
 * dans localStorage avec possibilité d'export manuel.
 */

// ========================================
// CONFIGURATION SYSTÈME NOTES
// ========================================

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

function creerFenetreNotes() {
    console.log('📝 Initialisation système notes testeur simplifié...');
    
    detecterContextePage();
    
    const conteneurNotes = document.createElement('div');
    conteneurNotes.id = 'notes-testeur-container';
    conteneurNotes.innerHTML = genererHTMLNotes();
    
    document.body.appendChild(conteneurNotes);
    configurerEvenementsNotes();
    injecterStylesNotes();
    
    console.log('✅ Fenêtre notes testeur opérationnelle');
}

function genererHTMLNotes() {
    return `
        <!-- Bouton flottant pour ouvrir/fermer les notes -->
        <div id="notes-toggle-btn" class="notes-toggle-btn" title="Notes Testeur (Phase Alpha)">
            📝
            <span class="notes-badge">ALPHA</span>
        </div>
        
        <!-- Fenêtre de notes (fermée par défaut) -->
        <div id="notes-window" class="notes-window notes-hidden">
            <!-- En-tête -->
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

Sauvegarde automatique sans dialogue fichier."
                    rows="6"
                ></textarea>
            </div>
            
            <!-- Actions -->
            <div class="notes-actions">
                <button id="notes-save-btn" class="notes-save-btn">
                    💾 Sauvegarder
                </button>
                <button id="notes-view-btn" class="notes-view-btn">
                    👁️ Voir Notes
                </button>
                <button id="notes-export-btn" class="notes-export-btn">
                    📤 Exporter .md
                </button>
                <button id="notes-clear-btn" class="notes-clear-btn">
                    🗑️ Effacer
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

function injecterStylesNotes() {
    const style = document.createElement('style');
    style.textContent = `
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
            min-width: 80px;
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
        
        .notes-export-btn {
            background: linear-gradient(135deg, #6F42C1 0%, #563D7C 100%);
            color: white;
        }
        
        .notes-export-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(111, 66, 193, 0.4);
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

function detecterContextePage() {
    const path = window.location.pathname;
    
    const segments = path.split('/');
    const fileName = segments[segments.length - 1];
    const pageName = fileName.replace('.html', '').replace(/[^a-zA-Z0-9-_]/g, '-');
    
    let mode = 'general';
    if (path.includes('presentations-vente')) {
        mode = 'vente';
    } else if (path.includes('presentations-location')) {
        mode = 'location';
    } else if (path.includes('admin')) {
        mode = 'admin';
    }
    
    configNotes.pageInfo = {
        name: pageName || 'page-inconnue',
        mode: mode,
        path: path
    };
    
    console.log('📍 Contexte détecté:', configNotes.pageInfo);
}

function genererNomFichier() {
    const path = window.location.pathname;
    
    const segments = path.split('/');
    const licubeIndex = segments.findIndex(segment => segment === 'LiCUBEPRO');
    
    if (licubeIndex !== -1) {
        const pathSegments = segments.slice(licubeIndex);
        const lastIndex = pathSegments.length - 1;
        pathSegments[lastIndex] = pathSegments[lastIndex].replace('.html', '');
        return pathSegments.join('_') + '.md';
    }
    
    return `${configNotes.pageInfo.name}_${configNotes.pageInfo.mode}.md`;
}

// ========================================
// GESTION ÉVÉNEMENTS
// ========================================

function configurerEvenementsNotes() {
    document.getElementById('notes-toggle-btn').addEventListener('click', togglerFenetreNotes);
    document.getElementById('notes-close-btn').addEventListener('click', fermerFenetreNotes);
    
    document.getElementById('notes-save-btn').addEventListener('click', sauvegarderNote);
    document.getElementById('notes-view-btn').addEventListener('click', afficherNotesExistantes);
    document.getElementById('notes-export-btn').addEventListener('click', exporterNotesVersfichier);
    document.getElementById('notes-clear-btn').addEventListener('click', effacerSaisie);
    document.getElementById('notes-hide-display-btn').addEventListener('click', masquerAffichageNotes);
    
    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.shiftKey && event.key === 'N') {
            event.preventDefault();
            togglerFenetreNotes();
        }
        
        if (event.key === 'Escape' && configNotes.isOpen) {
            fermerFenetreNotes();
        }
    });
}

function togglerFenetreNotes() {
    if (configNotes.isOpen) {
        fermerFenetreNotes();
    } else {
        ouvrirFenetreNotes();
    }
}

function ouvrirFenetreNotes() {
    const fenetreNotes = document.getElementById('notes-window');
    fenetreNotes.classList.remove('notes-hidden');
    configNotes.isOpen = true;
    
    setTimeout(() => {
        document.getElementById('notes-textarea').focus();
    }, 300);
    
    console.log('📝 Fenêtre notes ouverte');
}

function fermerFenetreNotes() {
    const fenetreNotes = document.getElementById('notes-window');
    fenetreNotes.classList.add('notes-hidden');
    configNotes.isOpen = false;
    
    document.getElementById('notes-display').classList.add('notes-hidden');
    
    console.log('📝 Fenêtre notes fermée');
}

// ========================================
// SAUVEGARDE NOTES (SIMPLIFIÉ)
// ========================================

function sauvegarderNote() {
    const textarea = document.getElementById('notes-textarea');
    const contenuNote = textarea.value.trim();
    
    if (!contenuNote) {
        alert('⚠️ Veuillez écrire une note avant de sauvegarder.');
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
    
    const nomFichier = genererNomFichier();
    
    // Formatage markdown simple
    const contenuAvecBullets = contenuNote
        .split('\n')
        .filter(ligne => ligne.trim() !== '')
        .map(ligne => `• ${ligne.trim()}`)
        .join('\n');
    
    const noteFormatee = `## 📅 ${timestamp}\n\n${contenuAvecBullets}\n\n---\n\n`;
    
    // Sauvegarde UNIQUEMENT locale
    sauvegarderDansNavigateur(nomFichier, noteFormatee);
    
    textarea.value = '';
    afficherConfirmationSauvegarde();
    
    console.log('💾 Note sauvegardée automatiquement:', nomFichier);
}

function sauvegarderDansNavigateur(nomFichier, contenu) {
    try {
        const cleStorage = `notes_testeur_${nomFichier}`;
        let contenuExistant = localStorage.getItem(cleStorage) || '';
        
        const contenuFinal = contenuExistant + contenu;
        
        localStorage.setItem(cleStorage, contenuFinal);
        console.log('💾 Note ajoutée automatiquement:', nomFichier);
        
    } catch (error) {
        console.error('❌ Erreur sauvegarde localStorage:', error);
    }
}

function afficherConfirmationSauvegarde() {
    const boutonSave = document.getElementById('notes-save-btn');
    const texteOriginal = boutonSave.textContent;
    
    boutonSave.textContent = '✅ Sauvegardé!';
    boutonSave.style.background = 'linear-gradient(135deg, #28A745 0%, #20B2AA 100%)';
    
    setTimeout(() => {
        boutonSave.textContent = texteOriginal;
        boutonSave.style.background = '';
    }, 2000);
}

// ========================================
// AFFICHAGE ET EXPORT NOTES
// ========================================

function afficherNotesExistantes() {
    const displayZone = document.getElementById('notes-display');
    const contentZone = document.getElementById('notes-content');
    
    if (displayZone.classList.contains('notes-hidden')) {
        displayZone.classList.remove('notes-hidden');
        
        const contenuNotes = recupererNotesExistantes();
        contentZone.textContent = contenuNotes;
        
    } else {
        displayZone.classList.add('notes-hidden');
    }
}

function masquerAffichageNotes() {
    document.getElementById('notes-display').classList.add('notes-hidden');
}

function recupererNotesExistantes() {
    const nomFichier = genererNomFichier();
    const cleStorage = `notes_testeur_${nomFichier}`;
    const contenu = localStorage.getItem(cleStorage);
    
    if (contenu) {
        return contenu;
    }
    
    return `Aucune note sauvegardée pour cette page.

📁 Fichier: ${nomFichier}
💾 Sauvegarde: Automatique dans le navigateur

ℹ️ Instructions:
• Chaque note est sauvegardée automatiquement
• Format markdown (.md) simplifié
• Pas de dialogue fichier
• Export manuel avec bouton "Exporter .md"

⚠️ Phase Alpha:
Cette fonctionnalité sera retirée en production.
Destinée uniquement aux testeurs internes.`;
}

function exporterNotesVersfichier() {
    const nomFichier = genererNomFichier();
    const cleStorage = `notes_testeur_${nomFichier}`;
    const contenuNotes = localStorage.getItem(cleStorage);
    
    if (!contenuNotes) {
        alert('⚠️ Aucune note à exporter pour cette page.');
        return;
    }
    
    const contenuExport = `# 📄 Notes Alpha Testeur

**Page :** ${configNotes.pageInfo.name}
**Mode :** ${configNotes.pageInfo.mode}
**Fichier :** ${nomFichier}

---

${contenuNotes}`;
    
    try {
        const blob = new Blob([contenuExport], { type: 'text/markdown;charset=utf-8' });
        const lien = document.createElement('a');
        lien.href = URL.createObjectURL(blob);
        lien.download = nomFichier;
        
        document.body.appendChild(lien);
        lien.click();
        document.body.removeChild(lien);
        
        URL.revokeObjectURL(lien.href);
        
        console.log('📤 Fichier exporté:', nomFichier);
        
        // Confirmation visuelle
        const boutonExport = document.getElementById('notes-export-btn');
        const texteOriginal = boutonExport.textContent;
        
        boutonExport.textContent = '✅ Exporté!';
        setTimeout(() => {
            boutonExport.textContent = texteOriginal;
        }, 2000);
        
    } catch (error) {
        console.error('❌ Erreur export fichier:', error);
        alert('❌ Erreur lors de l\'export.');
    }
}

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

document.addEventListener('DOMContentLoaded', function() {
    console.log('🧪 === INITIALISATION NOTES TESTEUR SIMPLIFIÉ ===');
    
    setTimeout(() => {
        creerFenetreNotes();
        
        console.log(`
🧪 SYSTÈME NOTES TESTEUR - VERSION SIMPLE
========================================
• Bouton flottant en haut à droite: 📝
• Raccourci: Ctrl+Shift+N
• Fichier: ${genererNomFichier()}
• Sauvegarde: Automatique sans dialogue
• Export: Bouton "Exporter .md" quand souhaité
• Destiné aux testeurs internes uniquement
========================================
        `);
    }, 500);
});

// Export pour utilisation externe si nécessaire
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { creerFenetreNotes, configNotes };
}