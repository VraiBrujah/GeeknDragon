/**
 * =====================================================
 * NAVIGATION RETOUR - BOUTON RETOUR HUB LiCUBEPRO™
 * =====================================================
 * 
 * Ajoute un bouton de retour vers licubepro.html sur toutes 
 * les pages des dossiers presentations-vente et presentations-location
 */

// ========================================
// CRÉATION BOUTON RETOUR
// ========================================

/**
 * Crée et injecte le bouton de retour vers le hub LiCUBEPRO™
 * Rôle      : Navigation facile vers la page principale
 * Type      : fonction d'initialisation
 * Position  : Haut gauche, fixe
 */
function creerBoutonRetour() {
    // Détecter si nous sommes dans un dossier presentations-*
    const path = window.location.pathname;
    
    if (!path.includes('presentations-vente') && !path.includes('presentations-location')) {
        console.log('📍 Navigation retour: Page non concernée');
        return;
    }
    
    console.log('📍 Ajout bouton retour vers hub LiCUBEPRO™...');
    
    // Calculer le chemin relatif vers licubepro.html
    const cheminRetour = calculerCheminRetour();
    
    // Créer le conteneur du bouton
    const conteneurBouton = document.createElement('div');
    conteneurBouton.id = 'navigation-retour-container';
    conteneurBouton.innerHTML = genererHTMLBoutonRetour(cheminRetour);
    
    // Injecter dans le DOM
    document.body.appendChild(conteneurBouton);
    
    // Configurer les événements
    configurerEvenementsBoutonRetour();
    
    // Injecter les styles
    injecterStylesBoutonRetour();
    
    console.log('✅ Bouton retour hub LiCUBEPRO™ ajouté');
}

/**
 * Calcule le chemin relatif correct vers licubepro.html
 * Rôle      : Détermination du chemin selon la profondeur
 * Type      : fonction utilitaire
 * Retour    : string chemin relatif
 */
function calculerCheminRetour() {
    const path = window.location.pathname;
    const segments = path.split('/');
    
    // Trouver l'index de LiCUBEPRO
    const licubeIndex = segments.findIndex(segment => segment === 'LiCUBEPRO');
    
    if (licubeIndex === -1) return '../licubepro.html'; // Fallback
    
    // Calculer la profondeur depuis LiCUBEPRO
    const profondeur = segments.length - licubeIndex - 2; // -2 pour LiCUBEPRO et le fichier.html
    
    // Construire le chemin relatif
    const prefixe = '../'.repeat(profondeur);
    return `${prefixe}licubepro.html`;
}

/**
 * Génère le HTML du bouton de retour
 * Rôle      : Template HTML du bouton
 * Type      : fonction de templating
 * Paramètre : cheminRetour (string)
 * Retour    : string HTML
 */
function genererHTMLBoutonRetour(cheminRetour) {
    return `
        <a href="${cheminRetour}" id="btn-retour-hub" class="btn-retour-hub" title="Retour au Hub LiCUBEPRO™">
            <div class="btn-retour-icone">
                🏠
            </div>
            <div class="btn-retour-texte">
                Hub LiCUBEPRO™
            </div>
        </a>
    `;
}

/**
 * Configure les événements du bouton de retour
 * Rôle    : Gestion des interactions bouton
 * Type    : fonction de configuration
 */
function configurerEvenementsBoutonRetour() {
    const boutonRetour = document.getElementById('btn-retour-hub');
    
    if (boutonRetour) {
        boutonRetour.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        boutonRetour.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
        
        boutonRetour.addEventListener('click', function(e) {
            // Animation de clic
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            console.log('🏠 Navigation vers hub LiCUBEPRO™');
        });
    }
}

/**
 * Injecte les styles CSS pour le bouton de retour
 * Rôle    : Styling du bouton navigation
 * Type    : fonction de styling
 */
function injecterStylesBoutonRetour() {
    const style = document.createElement('style');
    style.textContent = `
        /* ========================================
           BOUTON RETOUR HUB LiCUBEPRO™
           ======================================== */
        
        .btn-retour-hub {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 9998;
            
            display: flex;
            align-items: center;
            gap: 8px;
            
            background: linear-gradient(135deg, #003F7F 0%, #4A90B8 100%);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 15px;
            
            padding: 8px 12px;
            min-width: 120px;
            
            color: white;
            text-decoration: none;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 600;
            font-size: 13px;
            
            box-shadow: 0 6px 20px rgba(0, 63, 127, 0.3);
            backdrop-filter: blur(10px);
            
            transition: all 0.3s ease;
            cursor: pointer;
            
            user-select: none;
        }
        
        .btn-retour-hub:hover {
            background: linear-gradient(135deg, #0056B3 0%, #6BADD6 100%);
            box-shadow: 0 8px 25px rgba(0, 63, 127, 0.4);
            transform: translateY(-2px);
            border-color: rgba(255, 255, 255, 0.5);
        }
        
        .btn-retour-hub:active {
            transform: translateY(0px) scale(0.98);
            box-shadow: 0 4px 15px rgba(0, 63, 127, 0.3);
        }
        
        .btn-retour-icone {
            font-size: 18px;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .btn-retour-texte {
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.5px;
            white-space: nowrap;
        }
        
        /* Responsive pour mobile */
        @media (max-width: 500px) {
            .btn-retour-hub {
                top: 15px;
                left: 15px;
                padding: 6px 10px;
                min-width: 100px;
                border-radius: 12px;
            }
            
            .btn-retour-icone {
                font-size: 16px;
            }
            
            .btn-retour-texte {
                font-size: 11px;
            }
        }
        
        @media (max-width: 320px) {
            .btn-retour-hub {
                top: 10px;
                left: 10px;
                padding: 5px 8px;
                min-width: 80px;
                gap: 6px;
            }
            
            .btn-retour-icone {
                font-size: 14px;
            }
            
            .btn-retour-texte {
                font-size: 10px;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// ========================================
// GESTION MODULE MUSIQUE
// ========================================

/**
 * Configure le module musique pour être en pause par défaut
 * Rôle      : Éviter la lecture automatique et les doublons
 * Type      : fonction de configuration audio
 */
function configurerModuleMusique() {
    console.log('🎵 Configuration module musique...');
    
    // Attendre que le DOM soit complètement chargé
    const configurer = () => {
        // Rechercher tous les éléments audio
        const elementsAudio = document.querySelectorAll('audio');
        const videosAvecAudio = document.querySelectorAll('video');
        
        // Configurer les éléments audio
        elementsAudio.forEach((audio, index) => {
            audio.pause();
            audio.currentTime = 0;
            audio.preload = 'metadata'; // Charger seulement les métadonnées
            audio.autoplay = false;
            audio.muted = false; // Garder le son activé mais en pause
            
            console.log(`🔇 Audio ${index + 1}: Configuré en pause`);
        });
        
        // Configurer les vidéos avec audio
        videosAvecAudio.forEach((video, index) => {
            video.pause();
            video.currentTime = 0;
            video.autoplay = false;
            video.muted = false;
            
            console.log(`🔇 Vidéo ${index + 1}: Configurée en pause`);
        });
        
        // Rechercher des lecteurs musicaux custom (par classe ou ID)
        const lecteursCustom = document.querySelectorAll('[class*="music"], [class*="audio"], [id*="music"], [id*="audio"]');
        
        lecteursCustom.forEach((lecteur, index) => {
            // Essayer de mettre en pause via méthodes communes
            if (typeof lecteur.pause === 'function') {
                lecteur.pause();
            }
            
            // Désactiver autoplay si présent
            if (lecteur.hasAttribute('autoplay')) {
                lecteur.removeAttribute('autoplay');
            }
            
            console.log(`🎼 Lecteur custom ${index + 1}: Configuration appliquée`);
        });
        
        console.log('✅ Module musique configuré: Pause par défaut');
    };
    
    // Exécuter immédiatement si le DOM est prêt, sinon attendre
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', configurer);
    } else {
        configurer();
    }
    
    // Configuration supplémentaire après un délai pour les lecteurs chargés dynamiquement
    setTimeout(configurer, 1000);
    setTimeout(configurer, 3000);
}

// ========================================
// INITIALISATION AUTOMATIQUE
// ========================================

/**
 * Initialisation automatique de la navigation et de la musique
 * Rôle    : Point d'entrée automatique
 * Type    : event listener
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 === INITIALISATION NAVIGATION RETOUR ===');
    
    // Ajouter le bouton de retour si nécessaire
    creerBoutonRetour();
    
    // Configurer le module musique
    configurerModuleMusique();
    
    console.log('✅ Navigation retour et musique configurés');
});

// Export pour utilisation externe si nécessaire
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { creerBoutonRetour, configurerModuleMusique };
}