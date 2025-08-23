/**
 * =================================================================
 * SYSTÈME DE GESTION DYNAMIQUE DES CHEMINS D'IMAGES LI-CUBE PRO™
 * =================================================================
 * 
 * Configuration centralisée permettant de modifier facilement l'emplacement
 * des images Li-CUBE PRO™ sans avoir à éditer chaque fichier HTML individuellement.
 * 
 * Utilisation :
 * 1. Modifier IMAGE_CONFIG.imagePath pour changer l'emplacement des images
 * 2. Utiliser loadLiCubeImage(imageName, depth) dans les scripts HTML
 * 3. Attributs HTML : data-licube-image et data-depth sur les balises <img>
 * 
 * Auteur : EDS Québec - Energy Dream System
 * Version : 1.0.0
 * Date : 2025-01-23
 */

// Configuration globale des chemins d'images Li-CUBE PRO™
const IMAGE_CONFIG = {
    /**
     * Chemin de base vers le dossier des images Li-CUBE PRO™
     * Modifiable selon l'organisation des dossiers
     * 
     * Exemples de configurations :
     * - 'image/Produit/Li-CUBE PRO/'        (pour fichiers racine)
     * - '../image/Produit/Li-CUBE PRO/'     (pour sous-dossiers niveau 1)  
     * - '../../image/Produit/Li-CUBE PRO/'  (pour sous-dossiers niveau 2)
     * - '../../../image/Produit/Li-CUBE PRO/' (pour sous-dossiers niveau 3)
     */
    imagePath: 'image/Produit/Li-CUBE PRO/',
    
    /**
     * Configuration des images disponibles avec leurs descriptions
     * Facilite la maintenance et évite les erreurs de nommage
     */
    availableImages: {
        'Li-CUBE PRO.png': 'Image principale du produit Li-CUBE PRO™',
        'Li-CUBE PRO image 1.png': 'Vue principale du Li-CUBE PRO™ (angle standard)',
        'Li-CUBE PRO image 2.png': 'Vue détaillée du Li-CUBE PRO™ (angle 2)',  
        'Li-CUBE PRO image 3.png': 'Vue complète du Li-CUBE PRO™ (angle 3)'
    },
    
    /**
     * Fonction pour calculer le chemin de base selon la profondeur du fichier
     * 
     * @param {number} depth - Profondeur du fichier HTML par rapport à la racine
     * @returns {string} Chemin relatif vers la racine (ex: '../../')
     * 
     * Exemples de profondeurs :
     * - depth = 0 : fichiers à la racine (edsquebec.html)
     * - depth = 1 : fichiers dans LiCUBEPRO/ (licubepro.html)  
     * - depth = 2 : fichiers dans presentations-vente/images-onepage/
     * - depth = 3 : fichiers dans presentations-vente/supports-print/flyers/
     */
    getBasePath: function(depth = 1) {
        // Validation du paramètre depth
        if (typeof depth !== 'number' || depth < 0) {
            console.warn('IMAGE_CONFIG: depth doit être un nombre positif, utilisation de 1 par défaut');
            depth = 1;
        }
        
        // Générer le chemin relatif basé sur la profondeur
        return '../'.repeat(depth);
    },
    
    /**
     * Fonction principale pour obtenir le chemin complet d'une image Li-CUBE PRO™
     * 
     * @param {string} imageName - Nom du fichier image (avec extension)
     * @param {number} depth - Profondeur du fichier HTML appelant (défaut: 1)
     * @returns {string} Chemin complet vers l'image
     * 
     * Exemple d'utilisation :
     * IMAGE_CONFIG.getImagePath('Li-CUBE PRO image 1.png', 3)
     * // Retourne : '../../../image/Produit/Li-CUBE PRO/Li-CUBE PRO image 1.png'
     */
    getImagePath: function(imageName, depth = 1) {
        // Validation du nom d'image
        if (!imageName || typeof imageName !== 'string') {
            console.error('IMAGE_CONFIG: imageName requis et doit être une chaîne');
            return '';
        }
        
        // Vérification si l'image existe dans la configuration
        if (!this.availableImages.hasOwnProperty(imageName)) {
            console.warn(`IMAGE_CONFIG: Image '${imageName}' non trouvée dans availableImages. Images disponibles:`, Object.keys(this.availableImages));
        }
        
        // Construire le chemin complet
        const basePath = this.getBasePath(depth);
        const fullPath = basePath + this.imagePath + imageName;
        
        // Log pour debug (peut être désactivé en production)
        if (window.DEBUG_IMAGE_PATHS) {
            console.log(`IMAGE_CONFIG: ${imageName} (depth=${depth}) → ${fullPath}`);
        }
        
        return fullPath;
    },
    
    /**
     * Fonction pour mettre à jour le chemin de base des images
     * Utile pour reconfigurer dynamiquement l'emplacement des images
     * 
     * @param {string} newImagePath - Nouveau chemin vers les images
     * 
     * Exemple d'utilisation :
     * IMAGE_CONFIG.updateImagePath('assets/images/products/Li-CUBE PRO/');
     */
    updateImagePath: function(newImagePath) {
        if (typeof newImagePath !== 'string') {
            console.error('IMAGE_CONFIG: newImagePath doit être une chaîne');
            return;
        }
        
        const oldPath = this.imagePath;
        this.imagePath = newImagePath;
        
        console.log(`IMAGE_CONFIG: Chemin des images mis à jour de '${oldPath}' vers '${newImagePath}'`);
        
        // Mettre à jour toutes les images déjà chargées sur la page
        this.updateAllImagePaths();
    },
    
    /**
     * Fonction pour mettre à jour tous les chemins d'images Li-CUBE PRO™ sur la page courante
     * Applique automatiquement les nouveaux chemins à toutes les images avec data-licube-image
     */
    updateAllImagePaths: function() {
        const images = document.querySelectorAll('img[data-licube-image]');
        let updatedCount = 0;
        
        images.forEach(img => {
            const imageName = img.getAttribute('data-licube-image');
            const depth = parseInt(img.getAttribute('data-depth') || '1');
            
            if (imageName) {
                const newPath = this.getImagePath(imageName, depth);
                img.src = newPath;
                updatedCount++;
            }
        });
        
        console.log(`IMAGE_CONFIG: ${updatedCount} image(s) Li-CUBE PRO™ mise(s) à jour`);
        return updatedCount;
    }
};

/**
 * Fonction utilitaire simplifiée pour charger une image Li-CUBE PRO™
 * Raccourci pour IMAGE_CONFIG.getImagePath()
 * 
 * @param {string} imageName - Nom du fichier image
 * @param {number} depth - Profondeur du fichier HTML (défaut: 1)
 * @returns {string} Chemin complet vers l'image
 */
function loadLiCubeImage(imageName, depth = 1) {
    return IMAGE_CONFIG.getImagePath(imageName, depth);
}

/**
 * Fonction pour mettre à jour dynamiquement toutes les images Li-CUBE PRO™
 * Utile pour reconfigurer l'emplacement des images après chargement de la page
 * 
 * @param {string} newBasePath - Nouveau chemin de base vers les images
 * @returns {number} Nombre d'images mises à jour
 */
function updateImagePaths(newBasePath) {
    IMAGE_CONFIG.updateImagePath(newBasePath);
    return IMAGE_CONFIG.updateAllImagePaths();
}

/**
 * Initialisation automatique au chargement du DOM
 * Met à jour toutes les images Li-CUBE PRO™ avec les attributs data-licube-image
 */
function initializeLiCubeImages() {
    // Attendre que le DOM soit prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeLiCubeImages);
        return;
    }
    
    // Rechercher et initialiser toutes les images Li-CUBE PRO™
    const images = document.querySelectorAll('img[data-licube-image]');
    let initializedCount = 0;
    
    images.forEach(img => {
        const imageName = img.getAttribute('data-licube-image');
        const depth = parseInt(img.getAttribute('data-depth') || '1');
        
        if (imageName) {
            // Générer le chemin dynamique
            const dynamicPath = loadLiCubeImage(imageName, depth);
            
            // Appliquer le nouveau chemin
            img.src = dynamicPath;
            
            // Ajouter une classe pour identifier les images initialisées
            img.classList.add('licube-dynamic-image');
            
            // Gestion des erreurs de chargement
            img.onerror = function() {
                console.error(`IMAGE_CONFIG: Erreur de chargement pour ${imageName} à ${dynamicPath}`);
                
                // Tentative avec l'autre emplacement possible
                const alternatePath = depth === 1 
                    ? `../image/Produit/Li-CUBE PRO/${imageName}`
                    : `${'../'.repeat(depth + 1)}image/Produit/Li-CUBE PRO/${imageName}`;
                
                console.log(`IMAGE_CONFIG: Tentative de chargement alternatif: ${alternatePath}`);
                this.src = alternatePath;
                
                // Si ça échoue encore, afficher un placeholder
                this.onerror = function() {
                    console.error(`IMAGE_CONFIG: Impossible de charger ${imageName}`);
                    this.alt = `[Image Li-CUBE PRO™ non trouvée: ${imageName}]`;
                    this.style.border = '2px dashed #ccc';
                    this.style.padding = '10px';
                    this.style.color = '#666';
                    this.style.fontSize = '12px';
                    this.style.textAlign = 'center';
                    this.style.display = 'flex';
                    this.style.alignItems = 'center';
                    this.style.justifyContent = 'center';
                    this.style.minHeight = '100px';
                    this.style.background = '#f8f9fa';
                };
            };
            
            initializedCount++;
        }
    });
    
    console.log(`IMAGE_CONFIG: ${initializedCount} image(s) Li-CUBE PRO™ initialisée(s)`);
    
    // Log des informations de configuration pour debug
    if (window.DEBUG_IMAGE_PATHS) {
        console.log('IMAGE_CONFIG: Configuration actuelle:', {
            imagePath: IMAGE_CONFIG.imagePath,
            availableImages: Object.keys(IMAGE_CONFIG.availableImages),
            imagesOnPage: initializedCount
        });
    }
}

/**
 * Export pour utilisation en module (si supporté)
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        IMAGE_CONFIG,
        loadLiCubeImage,
        updateImagePaths,
        initializeLiCubeImages
    };
}

// Initialisation automatique si le script est chargé dans un navigateur
if (typeof window !== 'undefined') {
    // Activer le debug si nécessaire (à commenter en production)
    // window.DEBUG_IMAGE_PATHS = true;
    
    // Lancer l'initialisation
    initializeLiCubeImages();
}

/**
 * Instructions d'utilisation :
 * 
 * 1. DANS LE HTML, remplacer :
 *    <img src="../../../image/Produit/Li-CUBE PRO/Li-CUBE PRO image 1.png" alt="Li-CUBE PRO™">
 * 
 * 2. PAR :
 *    <img data-licube-image="Li-CUBE PRO image 1.png" data-depth="3" alt="Li-CUBE PRO™" class="licube-product-image">
 * 
 * 3. INCLURE CE SCRIPT :
 *    <script src="chemin/vers/image-config.js"></script>
 * 
 * 4. POUR CHANGER L'EMPLACEMENT DES IMAGES :
 *    Modifier IMAGE_CONFIG.imagePath dans ce fichier
 *    OU appeler updateImagePaths('nouveau/chemin/') depuis le JavaScript
 * 
 * 5. VALEURS DE DEPTH SELON L'EMPLACEMENT DU FICHIER HTML :
 *    - Racine du projet : depth=0
 *    - LiCUBEPRO/ : depth=1  
 *    - presentations-vente/images-onepage/ : depth=2
 *    - presentations-vente/supports-print/flyers/ : depth=3
 */