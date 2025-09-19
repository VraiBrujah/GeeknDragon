/**
 * Music Scanner pour la page actualites
 * Scan minimal pour éviter les erreurs 404
 */

class ActualitesMusicScanner {
    constructor() {
        this.musicFiles = [];
        console.log('🎵 Actualites Music Scanner initialisé');
    }

    /**
     * Scan les fichiers musicaux disponibles pour cette page
     */
    async scanAvailableFiles() {
        // Pour la page actualites, pas de musique spécifique
        // Retourne une liste vide pour éviter les erreurs
        return [];
    }

    /**
     * Initialise le scanner pour la page actualites
     */
    init() {
        // Scan minimal - pas de musique sur cette page
        this.scanAvailableFiles().then(files => {
            this.musicFiles = files;
            console.log('🎵 Scan actualites terminé:', files.length, 'fichiers trouvés');
        }).catch(error => {
            console.warn('⚠️ Erreur scan actualites:', error);
        });
    }
}

// Export pour compatibilité
if (typeof window !== 'undefined') {
    window.ActualitesMusicScanner = ActualitesMusicScanner;
}

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    const scanner = new ActualitesMusicScanner();
    scanner.init();
});