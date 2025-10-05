#!/usr/bin/env node
/**
 * Script d'optimisation automatique des vidéos hero
 * Analyse et optimise les vidéos pour un chargement plus rapide
 * 
 * Utilisation: node scripts/optimize-videos.js [--check|--compress|--report]
 * 
 * @author Geek & Dragon - Développement Québécois
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration des vidéos à analyser
const REPERTOIRE_VIDEOS = 'media/video/hero';
const TAILLE_CIBLE_KB = 200; // Taille cible en KB pour chargement rapide
const QUALITE_COMPRESSION = 23; // Qualité CRF pour FFmpeg (18-28, plus bas = meilleure qualité)

/**
 * Analyse la taille et les propriétés d'une vidéo
 * @param {string} cheminVideo - Chemin vers le fichier vidéo
 * @returns {Object} Informations sur la vidéo
 */
function analyserVideo(cheminVideo) {
    if (!fs.existsSync(cheminVideo)) {
        return null;
    }
    
    const stats = fs.statSync(cheminVideo);
    const tailleKB = Math.round(stats.size / 1024);
    const taillemMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    let duree = null;
    let resolution = null;
    
    try {
        // Utiliser FFprobe pour obtenir les métadonnées
        const commande = `ffprobe -v quiet -show_entries format=duration -show_entries stream=width,height -of csv=p=0 "${cheminVideo}"`;
        const resultat = execSync(commande, { encoding: 'utf8', stdio: 'pipe' });
        const lignes = resultat.trim().split('\n');
        
        for (const ligne of lignes) {
            const valeurs = ligne.split(',');
            if (valeurs.length >= 3) {
                const largeur = parseInt(valeurs[0]);
                const hauteur = parseInt(valeurs[1]);
                duree = parseFloat(valeurs[2]);
                
                if (largeur && hauteur) {
                    resolution = `${largeur}x${hauteur}`;
                }
            }
        }
    } catch (error) {
        console.warn(`⚠️  Impossible d'analyser ${cheminVideo}: FFprobe requis`);
    }
    
    return {
        chemin: cheminVideo,
        nom: path.basename(cheminVideo),
        tailleKB,
        tailleMB: taillemMB,
        duree,
        resolution,
        optimisable: tailleKB > TAILLE_CIBLE_KB
    };
}

/**
 * Scan tous les fichiers vidéo dans le répertoire
 * @returns {Array} Liste des vidéos analysées
 */
function scannerVideos() {
    if (!fs.existsSync(REPERTOIRE_VIDEOS)) {
        console.log(`📁 Répertoire ${REPERTOIRE_VIDEOS} non trouvé`);
        return [];
    }
    
    const extensions = ['.mp4', '.webm', '.mov', '.avi'];
    const fichiers = fs.readdirSync(REPERTOIRE_VIDEOS)
        .filter(f => extensions.some(ext => f.toLowerCase().endsWith(ext)))
        .map(f => path.join(REPERTOIRE_VIDEOS, f));
    
    return fichiers.map(analyserVideo).filter(Boolean);
}

/**
 * Génère un rapport d'optimisation des vidéos
 * @param {Array} videos - Liste des vidéos analysées
 */
function genererRapport(videos) {
    console.log('📊 RAPPORT D\'OPTIMISATION VIDÉOS\n');
    console.log('════════════════════════════════════════');
    
    videos.forEach(video => {
        const statut = video.optimisable ? '🔴 À OPTIMISER' : '✅ OPTIMAL';
        const tempsChargement = Math.round(video.tailleKB / 50); // Estimation 50KB/s connexion lente
        
        console.log(`\n📹 ${video.nom}`);
        console.log(`   Taille: ${video.tailleMB} MB (${video.tailleKB} KB)`);
        console.log(`   Résolution: ${video.resolution || 'Inconnue'}`);
        console.log(`   Durée: ${video.duree ? video.duree.toFixed(1) + 's' : 'Inconnue'}`);
        console.log(`   Temps chargement estimé: ~${tempsChargement}s`);
        console.log(`   Statut: ${statut}`);
        
        if (video.optimisable) {
            const gainPotentiel = video.tailleKB - TAILLE_CIBLE_KB;
            console.log(`   💡 Gain potentiel: ~${gainPotentiel} KB`);
        }
    });
    
    const totaleTaille = videos.reduce((sum, v) => sum + parseFloat(v.tailleMB), 0);
    const videosOptimisables = videos.filter(v => v.optimisable);
    
    console.log('\n════════════════════════════════════════');
    console.log(`📊 RÉSUMÉ:`);
    console.log(`   Total vidéos: ${videos.length}`);
    console.log(`   Taille totale: ${totaleTaille.toFixed(2)} MB`);
    console.log(`   Vidéos optimisables: ${videosOptimisables.length}`);
    
    if (videosOptimisables.length > 0) {
        console.log(`\n💡 RECOMMANDATIONS:`);
        console.log(`   1. Compresser les vidéos > ${TAILLE_CIBLE_KB} KB`);
        console.log(`   2. Utiliser --compress pour optimisation automatique`);
        console.log(`   3. Considérer format WebM pour meilleure compression`);
    }
}

/**
 * Compresse une vidéo avec FFmpeg
 * @param {Object} video - Informations sur la vidéo
 * @returns {boolean} Succès de la compression
 */
function compresserVideo(video) {
    const nomBase = path.basename(video.chemin, path.extname(video.chemin));
    const cheminOptimise = path.join(
        path.dirname(video.chemin), 
        `${nomBase}_optimized${path.extname(video.chemin)}`
    );
    
    try {
        console.log(`🔄 Compression: ${video.nom}`);
        
        // Commande FFmpeg pour compression optimisée web
        const commande = [
            'ffmpeg',
            '-i', `"${video.chemin}"`,
            '-c:v', 'libx264',
            '-crf', QUALITE_COMPRESSION,
            '-preset', 'medium',
            '-c:a', 'aac',
            '-b:a', '128k',
            '-movflags', '+faststart', // Optimisation streaming
            '-pix_fmt', 'yuv420p',
            '-y', // Écraser si existe
            `"${cheminOptimise}"`
        ].join(' ');
        
        execSync(commande, { stdio: 'pipe' });
        
        // Vérifier le gain de compression
        const videoOptimisee = analyserVideo(cheminOptimise);
        if (videoOptimisee) {
            const gainKB = video.tailleKB - videoOptimisee.tailleKB;
            const gainPourcent = Math.round((gainKB / video.tailleKB) * 100);
            
            console.log(`✅ ${video.nom} → ${videoOptimisee.nom}`);
            console.log(`   📊 ${video.tailleKB}KB → ${videoOptimisee.tailleKB}KB (${gainPourcent}% réduction)`);
            
            return true;
        }
    } catch (error) {
        console.error(`❌ Erreur compression ${video.nom}:`, error.message);
    }
    
    return false;
}

/**
 * Vérifie la disponibilité des outils requis
 * @returns {boolean} Outils disponibles
 */
function verifierOutils() {
    const outils = ['ffmpeg', 'ffprobe'];
    
    for (const outil of outils) {
        try {
            execSync(`${outil} -version`, { stdio: 'ignore' });
        } catch {
            console.error(`❌ ${outil} non trouvé. Installer FFmpeg: https://ffmpeg.org/download.html`);
            return false;
        }
    }
    
    console.log('✅ FFmpeg/FFprobe disponibles\n');
    return true;
}

/**
 * Fonction principale
 */
function main() {
    const args = process.argv.slice(2);
    const mode = args[0] || '--report';
    
    console.log('🎬 Optimiseur de Vidéos Hero - Geek & Dragon\n');
    
    if (mode === '--check') {
        if (!verifierOutils()) {
            process.exit(1);
        }
        console.log('🎉 Tous les outils sont disponibles!');
        return;
    }
    
    const videos = scannerVideos();
    
    if (videos.length === 0) {
        console.log('📭 Aucune vidéo trouvée dans', REPERTOIRE_VIDEOS);
        return;
    }
    
    switch (mode) {
        case '--report':
            genererRapport(videos);
            break;
            
        case '--compress':
            if (!verifierOutils()) {
                process.exit(1);
            }
            
            const videosOptimisables = videos.filter(v => v.optimisable);
            if (videosOptimisables.length === 0) {
                console.log('✅ Toutes les vidéos sont déjà optimisées!');
                return;
            }
            
            console.log(`🔄 Compression de ${videosOptimisables.length} vidéos...\n`);
            
            let succes = 0;
            for (const video of videosOptimisables) {
                if (compresserVideo(video)) {
                    succes++;
                }
            }
            
            console.log(`\n🎉 Compression terminée: ${succes}/${videosOptimisables.length} vidéos optimisées`);
            break;
            
        default:
            console.log('Usage: node optimize-videos.js [--check|--compress|--report]');
            console.log('  --check    Vérifier la disponibilité des outils');
            console.log('  --report   Générer un rapport d\'optimisation (défaut)');
            console.log('  --compress Compresser les vidéos optimisables');
            break;
    }
}

// Exécution si script appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { analyserVideo, scannerVideos, genererRapport };