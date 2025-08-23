/**
 * Scanner de fichiers musicaux pour Geek&Dragon
 * Version améliorer avec détection automatique réelle des MP3
 */

class MusicFileScanner {
    constructor() {
        this.supportedExtensions = ['.mp3', '.ogg', '.wav', '.m4a'];
        this.commonMusicNames = [
            // Fichiers de démarrage rapide par page
            'hero-intro.mp3',
            
            // Musiques thématiques médiévales
            'medieval-tavern.mp3',
            'dragon-lair.mp3',
            'forest-mystery.mp3',
            'castle-halls.mp3',
            'epic-adventure.mp3',
            'magic-spells.mp3',
            'battle-drums.mp3',
            'ancient-ruins.mp3',
            'mystical-forest.mp3',
            'royal-court.mp3',
            'dungeon-depths.mp3',
            'village-peaceful.mp3',
            'storm-approaching.mp3',
            'final-boss.mp3',
            
            // Variantes numérotées
            'ambient01.mp3', 'ambient02.mp3', 'ambient03.mp3',
            'music1.mp3', 'music2.mp3', 'music3.mp3', 'music4.mp3', 'music5.mp3',
            'track1.mp3', 'track2.mp3', 'track3.mp3',
            'song1.mp3', 'song2.mp3', 'song3.mp3',
            'bgm1.mp3', 'bgm2.mp3', 'bgm3.mp3',
            
            // Noms génériques courants
            'background.mp3',
            'ambient.mp3',
            'theme.mp3',
            'main.mp3',
            'intro.mp3',
            'menu.mp3',
            'gameplay.mp3'
        ];
    }
    
    /**
     * Scanner principal - essaie plusieurs méthodes
     */
    async scanDirectory(directory) {
        console.log(`🔍 Scan du répertoire: ${directory}`);
        
        let foundFiles = [];
        
        // Méthode 1: Tester les noms courants
        foundFiles = await this.scanCommonFiles(directory);
        
        // Méthode 2: Essayer l'API File System Access (Chrome/Edge moderne)
        if (foundFiles.length === 0 && 'showDirectoryPicker' in window) {
            try {
                foundFiles = await this.scanWithFileSystemAPI(directory);
            } catch (e) {
                console.log('File System API non disponible ou refusée');
            }
        }
        
        // Méthode 3: Endpoint serveur si disponible
        if (foundFiles.length === 0) {
            foundFiles = await this.scanWithServerEndpoint(directory);
        }
        
        console.log(`✅ ${foundFiles.length} fichiers trouvés dans ${directory}`);
        return foundFiles;
    }
    
    /**
     * Méthode 1: Tester les noms de fichiers courants
     */
    async scanCommonFiles(directory) {
        const foundFiles = [];
        
        for (const fileName of this.commonMusicNames) {
            const filePath = `${directory}/${fileName}`;
            
            try {
                const response = await fetch(filePath, { method: 'HEAD' });
                if (response.ok) {
                    foundFiles.push(filePath);
                }
            } catch (e) {
                // Fichier non trouvé, continuer silencieusement
            }
        }
        
        return foundFiles;
    }
    
    /**
     * Méthode 2: API File System Access (navigateurs modernes)
     */
    async scanWithFileSystemAPI(directory) {
        try {
            const dirHandle = await window.showDirectoryPicker({
                mode: 'read',
                startIn: 'documents'
            });
            
            const foundFiles = [];
            
            for await (const [name, fileHandle] of dirHandle.entries()) {
                if (fileHandle.kind === 'file' && this.isMusicFile(name)) {
                    const file = await fileHandle.getFile();
                    const url = URL.createObjectURL(file);
                    foundFiles.push(url);
                }
            }
            
            return foundFiles;
        } catch (error) {
            console.log('Erreur File System API:', error);
            return [];
        }
    }
    
    /**
     * Méthode 3: Endpoint serveur (PHP ou autre)
     */
    async scanWithServerEndpoint(directory) {
        try {
            const response = await fetch(`api/list-music.php?dir=${encodeURIComponent(directory)}`);
            if (response.ok) {
                const data = await response.json();
                return data.files || [];
            }
        } catch (e) {
            console.log('Endpoint serveur non disponible');
        }
        
        return [];
    }
    
    /**
     * Vérifier si un fichier est un fichier audio
     */
    isMusicFile(filename) {
        const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        return this.supportedExtensions.includes(extension);
    }
    
    /**
     * Générer des suggestions de noms de fichiers pour l'utilisateur
     */
    getSuggestedFilenames(page = 'index') {
        const suggestions = {
            index: [
                'hero-intro.mp3 (fichier de démarrage rapide)',
                'medieval-tavern.mp3',
                'epic-adventure.mp3',
                'castle-halls.mp3'
            ],
            boutique: [
                'hero-intro.mp3 (fichier de démarrage rapide)',
                'royal-court.mp3',
                'magic-spells.mp3',
                'ancient-ruins.mp3'
            ]
        };
        
        return suggestions[page] || suggestions.index;
    }
}

// Export pour utilisation
window.MusicFileScanner = MusicFileScanner;