/**
 * Music Scanner dummy pour la page actualites
 * Évite les erreurs 404 sans complexité
 */

// Fournir la classe MusicFileScanner attendue par le système
class MusicFileScanner {
    constructor() {
        this.files = [];
    }

    async scanDirectory() {
        // Retourne une liste vide pour les actualités
        return [];
    }

    async scanAll() {
        return [];
    }
}

// Export global pour compatibilité
if (typeof window !== 'undefined') {
    window.MusicFileScanner = MusicFileScanner;
}

console.log('🎵 Music scanner dummy chargé pour actualités');