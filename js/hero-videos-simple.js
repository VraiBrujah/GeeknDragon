// Version simplifiée pour éviter les problèmes CSP
console.log('🚀 Hero Videos Simple chargé !');

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 DOM chargé, recherche containers...');
    
    const containers = document.querySelectorAll('.hero-videos');
    console.log('📹 Containers trouvés:', containers.length);
    
    containers.forEach(function(container, index) {
        console.log('🎥 Container ' + (index + 1) + ':', container);
        
        // Récupérer la vidéo principale
        const mainSrc = container.getAttribute('data-main');
        console.log('📺 Vidéo principale:', mainSrc);
        
        if (mainSrc) {
            // Créer et ajouter la vidéo
            const video = document.createElement('video');
            video.src = mainSrc;
            video.muted = true;
            video.autoplay = true;
            video.loop = true;
            video.style.position = 'absolute';
            video.style.top = '0';
            video.style.left = '0';
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            video.style.pointerEvents = 'none';
            video.style.zIndex = '1';
            
            video.addEventListener('loadeddata', function() {
                console.log('✅ Vidéo chargée et prête:', mainSrc);
                video.play().catch(function(e) {
                    console.log('⚠️ Lecture automatique bloquée:', e);
                });
            });
            
            video.addEventListener('error', function(e) {
                console.error('❌ Erreur chargement vidéo:', mainSrc, e);
            });
            
            container.appendChild(video);
            console.log('🎞️ Vidéo ajoutée au container');
        } else {
            console.log('❌ Pas de vidéo principale définie');
        }
    });
});