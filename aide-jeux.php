<?php
require __DIR__ . '/bootstrap.php';
$config = require __DIR__ . '/config.php';
$active = 'aide-jeux';
require __DIR__ . '/i18n.php';

// Charger les données des produits pour le système de recommandation
$products_data = json_decode(file_get_contents(__DIR__ . '/data/products.json'), true) ?? [];

$title = __('meta.home.title', 'Geek & Dragon') . ' | Aide de Jeux';
$metaDescription = __('meta.gameHelp.description', 'Guide complet pour vos accessoires D&D Geek & Dragon : triptyques de personnage, cartes d\'équipement, monnaie physique et convertisseur. Tout pour enrichir vos parties de jeu de rôle.');
$metaUrl = 'https://' . ($_SERVER['HTTP_HOST'] ?? 'geekndragon.com') . '/aide-jeux.php';

// Les traductions sont maintenant dans le système centralisé lang/{fr,en}.json
// Plus besoin de traductions hardcodées !

$extraHead = <<<HTML
<style>
.tool-content { 
  display: none;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}
.tool-content.active { 
  display: block;
  opacity: 1;
  animation: fadeInUp 0.5s ease-out;
}

/* CORRECTION MOBILE: Sections toujours visibles sur mobile */
@media (max-width: 768px) {
  #currency-converter-premium,
  #coin-lots-recommendations,
  #coin-lots-content {
    display: block !important;
    opacity: 1 !important;
    visibility: visible !important;
  }
  
  /* Assurer que les grids fonctionnent sur mobile */
  .currency-input-grid {
    grid-template-columns: 1fr !important;
    gap: 1rem !important;
  }
  
  .grid-cols-1.sm\\:grid-cols-2.md\\:grid-cols-5 {
    grid-template-columns: 1fr !important;
  }
  
  /* Forcer tous les éléments de conversion à être visibles */
  .currency-input-card,
  .conversion-result,
  .recommended-lots {
    display: block !important;
    opacity: 1 !important;
  }
  
  /* Améliorer la taille des inputs sur mobile */
  .currency-input-card input,
  .multiplier-input {
    min-height: 44px !important;
    font-size: 16px !important;
    padding: 12px !important;
  }
  
  /* Assurer que les boutons sont assez grands pour le touch */
  .btn,
  button:not(.music-btn):not(#music-mute):not(#music-prev):not(#music-next):not(#music-play-pause) {
    min-height: 44px !important;
    padding: 12px 16px !important;
    touch-action: manipulation !important;
  }
}

.tool-nav-btn {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}
.tool-nav-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  transition: left 0.5s ease;
}
.tool-nav-btn:hover::before {
  left: 100%;
}
.tool-nav-btn.active { 
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
  transform: translateY(-1px);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.triptych-preview {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.triptych-preview::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(79, 70, 229, 0.1), rgba(124, 58, 237, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
.triptych-preview:hover {
  transform: scale(1.03) rotateX(2deg);
  box-shadow: 0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(79, 70, 229, 0.3);
}
.triptych-preview:hover::before {
  opacity: 1;
}
.triptych-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
}
.flip-container {
  perspective: 1000px;
  width: 100%;
  height: 600px;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1.5rem;
  position: relative;
}
.flip-container::after {
  content: '🔄';
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0,0,0,0.7);
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  font-size: 18px;
  opacity: 0.7;
  transition: all 0.3s ease;
}
.flip-container:hover::after {
  opacity: 1;
  transform: scale(1.1);
}
.flipper {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.8s;
  transform-style: preserve-3d;
}
.flip-container.flipped .flipper {
  transform: rotateY(180deg);
}
.front, .back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  overflow: hidden;
}
.back {
  transform: rotateY(180deg);
}
.triptych-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #1f2937;
}
.dice-roller {
  background: linear-gradient(135deg, #1f2937, #374151);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 2rem 0;
  border: 2px solid #4f46e5;
  position: relative;
  overflow: hidden;
}
.dice-roller::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(79, 70, 229, 0.1), transparent);
  transform: rotate(45deg);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}
.dice-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
  margin: 1rem 0;
}
.stat-dice {
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
}
.stat-dice::before {
  content: '🎲';
  position: absolute;
  top: 50%;
  left: -30px;
  transform: translateY(-50%);
  font-size: 14px;
  transition: left 0.3s ease;
}
.stat-dice:hover {
  background: linear-gradient(135deg, #7c3aed, #8b5cf6);
  transform: scale(1.08) rotate(2deg);
  box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);
}
.stat-dice:hover::before {
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
}
.stat-dice:active {
  transform: scale(0.95);
  animation: diceRoll 0.6s ease;
}

@keyframes diceRoll {
  0%, 100% { transform: scale(0.95) rotate(0deg); }
  25% { transform: scale(1.1) rotate(90deg); }
  50% { transform: scale(1.05) rotate(180deg); }
  75% { transform: scale(1.1) rotate(270deg); }
}
}
.dice-result {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  margin: 0.5rem 0;
  min-height: 2rem;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
}

.dice-result.rolling {
  animation: rollAnimation 0.6s ease;
}

@keyframes rollAnimation {
  0% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.2) rotate(90deg); color: #fbbf24; }
  50% { transform: scale(1.1) rotate(180deg); color: #f59e0b; }
  75% { transform: scale(1.15) rotate(270deg); color: #d97706; }
  100% { transform: scale(1) rotate(360deg); color: #fff; }
}

/* Animations globales améliorées */
@keyframes glow {
  0%, 100% { box-shadow: 0 0 10px rgba(79, 70, 229, 0.3); }
  50% { box-shadow: 0 0 20px rgba(79, 70, 229, 0.6), 0 0 30px rgba(124, 58, 237, 0.4); }
}

@keyframes floatUp {
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* Animation de hover pour les sections */
.section-hover {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.section-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.15);
}
.roll-all-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.roll-all-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}

.roll-all-btn:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.roll-all-btn:hover::before {
  left: 100%;
}

.roll-all-btn:active {
  transform: scale(0.98);
}

/* Ajustements responsives généraux pour une lecture mobile confortable */
@media (max-width: 1024px) {
  .flip-container {
    height: 500px;
  }
}

@media (max-width: 768px) {
  .hero-text {
    padding: 3rem 1.5rem;
    max-width: 100%;
  }
  .hero-text h1 {
    font-size: clamp(2.25rem, 7vw, 3rem);
    line-height: 1.2;
  }
  .hero-text .txt-court {
    font-size: clamp(1rem, 4.8vw, 1.3rem);
  }
  .hero-cta {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  .hero-cta .btn {
    width: 100%;
  }
  .dice-roller {
    padding: 1.25rem;
  }
  .dice-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
  }
  .dice-result {
    font-size: 1.25rem;
  }
  .roll-all-btn {
    width: 100%;
  }
  .flip-container {
    height: 420px;
  }
  .card-product .h-\[6rem\],
  .card-product .h-\[180px\] {
    height: auto;
  }
}

@media (max-width: 640px) {
  .hero-text {
    padding: 2.5rem 1.25rem;
  }
  .hero-cta .btn {
    font-size: 1rem;
  }
  .dice-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .flip-container {
    height: 360px;
  }
  /* Suppression du conflit avec Tailwind - laisser grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gérer */
}

@media (max-width: 480px) {
  .dice-grid {
    grid-template-columns: 1fr;
  }
  
  /* Améliorer la taille tactile des éléments interactifs sur mobile */
  input[type="number"], 
  .multiplier-input,
  button,
  .btn {
    min-height: 44px; /* Taille tactile recommandée */
    touch-action: manipulation; /* Éviter le double-tap zoom */
  }
  
  .currency-input-card input {
    font-size: 16px; /* Éviter le zoom automatique sur iOS */
    padding: 12px; /* Augmenter la zone tactile */
  }
  
  .roll-all-btn {
    font-size: 1rem;
    padding: 0.875rem 1.5rem;
  }
  .dice-result {
    font-size: 1.1rem;
  }
}
.usage-step {
  background: linear-gradient(135deg, #1f2937, #374151);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: transform 0.3s ease;
}
.usage-step:hover {
  transform: translateY(-5px);
}
.step-number {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin: 0 auto 1rem;
}
.flip-container-card {
  perspective: 1000px;
  width: 280px;
  height: 400px;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  margin: 0 auto;
}
.flipper-card {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.8s;
  transform-style: preserve-3d;
}
.flip-container-card.flipped .flipper-card {
  transform: rotateY(180deg);
}
.front-card, .back-card {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  overflow: hidden;
}
.back-card {
  transform: rotateY(180deg);
}
.card-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #1f2937;
}

/* === WIDGET AUDIO D&D === */
.music-player-container {
  position: fixed;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 20px);
  left: env(safe-area-inset-left, 10px);
  right: env(safe-area-inset-right, 10px);
  z-index: 100;
  display: flex;
  justify-content: center;
  padding: 0;
  margin: 0;
}

.music-player {
  background: linear-gradient(135deg,
    rgba(15, 23, 42, 0.98) 0%,
    rgba(30, 41, 59, 0.98) 50%,
    rgba(15, 23, 42, 0.98) 100%);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(139, 92, 246, 0.4);
  border-radius: 25px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(139, 92, 246, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  width: min(280px, calc(100vw - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px) - 20px));
  max-width: 100%;
  margin: 0 auto;
}

.music-player:hover {
  border-color: rgba(139, 92, 246, 0.6);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(139, 92, 246, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  transform: scale(1.02);
}

.music-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.music-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.8), rgba(139, 92, 246, 0.8));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 12px rgba(139, 92, 246, 0.2);
  backdrop-filter: blur(10px);
}

.music-btn:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
}

.music-btn:active {
  transform: scale(0.9);
}

.play-pause-btn {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.9), rgba(217, 119, 6, 0.9));
  box-shadow: 0 3px 15px rgba(245, 158, 11, 0.3);
}

.play-pause-btn:hover {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 5px 25px rgba(245, 158, 11, 0.5);
}

.music-btn svg {
  width: 16px;
  height: 16px;
}

.play-pause-btn svg {
  width: 18px;
  height: 18px;
}

/* Règle .hidden spécifique pour les outils uniquement (ne pas affecter le header) */
.tool-card .hidden,
#debug-section.hidden,
.music-player-container .hidden {
  display: none !important;
}

.music-volume-container {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  justify-content: center;
  flex-shrink: 0;
  padding: 6px 0 2px;
}

.volume-slider {
  flex: 1;
  width: 100%;
  height: 6px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.15);
  appearance: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.volume-slider:hover {
  background: rgba(255, 255, 255, 0.25);
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.3);
  box-shadow: 0 3px 15px rgba(245, 158, 11, 0.5);
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  cursor: pointer;
  transition: all 0.3s ease;
}

/* Status indicator - petit point lumineux */
.music-status-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
  animation: musicPulse 2s ease-in-out infinite;
  flex-shrink: 0;
}

.music-status-indicator.paused {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  box-shadow: 0 0 4px rgba(107, 114, 128, 0.3);
  animation: none;
}

@keyframes musicPulse {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1);
  }
  50% { 
    opacity: 0.7; 
    transform: scale(1.2);
  }
}

/* === RESPONSIVE MOBILE === */
@media (max-width: 768px) {
  .music-player-container {
    bottom: calc(env(safe-area-inset-bottom, 0px) + 16px);
    left: env(safe-area-inset-left, 10px);
    right: env(safe-area-inset-right, 10px);
    top: auto;
    transform: none;
    z-index: 1000;
    justify-content: center;
  }

  .music-player {
    width: min(100%, calc(100vw - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px) - 24px));
    padding: 12px 14px;
    gap: 8px;
    border-radius: 20px;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
  }

  .music-controls {
    gap: 4px;
  }

  .music-volume-container {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1 1 60%;
    min-width: 0;
    max-width: 60%;
    padding: 0;
  }

  .music-btn {
    width: 28px;
    height: 28px;
  }

  .play-pause-btn {
    width: 34px;
    height: 34px;
  }

  .music-btn svg {
    width: 14px;
    height: 14px;
  }

  .play-pause-btn svg {
    width: 16px;
    height: 16px;
  }

  .volume-slider {
    flex: 1;
    width: auto;
  }
}

@media (max-width: 480px) {
  .music-player-container {
    bottom: calc(env(safe-area-inset-bottom, 0px) + 12px);
    left: env(safe-area-inset-left, 10px);
    right: env(safe-area-inset-right, 10px);
  }

  .music-player {
    width: min(100%, calc(100vw - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px) - 20px));
    padding: 10px 12px;
    gap: 6px;
  }

  .music-controls {
    gap: 3px;
  }

  .music-btn {
    width: 26px;
    height: 26px;
  }

  .play-pause-btn {
    width: 32px;
    height: 32px;
  }

  .volume-slider {
    flex: 1;
    width: auto;
  }

  .music-volume-container {
    gap: 4px;
    flex: 1 1 60%;
    min-width: 0;
    max-width: 60%;
  }

  .music-volume-container .volume-label,
  .music-volume-container .volume-text,
  .music-volume-container .volume-btn span {
    display: none !important;
  }
}

/* Animations fluides */
@keyframes musicPlayerFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.music-player-container {
  animation: musicPlayerFadeIn 0.6s ease-out;
}

/* Améliorer la responsivité des tableaux existants */
@media (max-width: 768px) {
  .table-responsive {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border-radius: 8px;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .table-responsive table {
    min-width: 600px;
    font-size: 0.875rem;
  }

  .table-responsive th,
  .table-responsive td {
    padding: 0.5rem 0.75rem;
    white-space: nowrap;
  }

  .currency-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .currency-card {
    min-height: auto;
  }

  .currency-input-group {
    flex-direction: column;
    gap: 0.5rem;
  }

  .currency-input {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .table-responsive table {
    font-size: 0.75rem;
  }

  .table-responsive th,
  .table-responsive td {
    padding: 0.375rem 0.5rem;
  }
}

/* === FIX NAVIGATION HEADER === */
/* Force l'affichage de la navigation qui était masquée */
@media (min-width: 768px) {
  /* Forcer l'affichage de la navigation desktop */
  header nav[aria-label="Navigation principale"] {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    position: static !important;
    transform: none !important;
  }
  
  /* Forcer l'affichage des liens de navigation */
  header nav[aria-label="Navigation principale"] > ul {
    display: flex !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  
  header nav[aria-label="Navigation principale"] > ul > li {
    display: list-item !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  
  /* Masquer les sous-menus par défaut */
  header nav[aria-label="Navigation principale"] li ul {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
  }
  
  /* Afficher les sous-menus seulement au hover */
  header nav[aria-label="Navigation principale"] li:hover > ul {
    display: flex !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  
  /* Plus spécifique : uniquement les liens DANS la navigation */
  header nav[aria-label="Navigation principale"] ul a {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    color: white !important;
  }
  
  header #lang-switcher {
    display: flex !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
}

/* Fix navigation mobile */
@media (max-width: 767px) {
  header nav[aria-label="Navigation principale"] {
    display: none !important;
  }
  
  header #mobile-menu {
    display: none !important;
  }
  
  header #menu-btn {
    display: block !important;
  }
}

/* Assurer que UNIQUEMENT les liens de navigation sont visibles - pas le titre */
header nav[aria-label="Navigation principale"] .nav-link {
  opacity: 1 !important;
  visibility: visible !important;
  color: white !important;
}

/* Assurer que les boutons langue sont visibles */
header .flag-btn {
  opacity: 1 !important;
  visibility: visible !important;
}

/* S'assurer que le titre reste intact et visible */
.site-title {
  opacity: 1 !important;
  visibility: visible !important;
  color: white !important;
}
</style>
HTML;

// Script d'urgence mobile pour affichage immédiat des sections
$extraHead .= <<<'SCRIPT'
<script>
// CORRECTIF MOBILE IMMÉDIAT - s'exécute avant même le DOMContentLoaded
(function() {
  'use strict';
  
  // Fonction pour forcer l'affichage mobile
  function forceDisplayMobile() {
    if (window.innerWidth <= 768) {
      console.log('📱 [MOBILE-FIX] Application du correctif d\'affichage mobile immédiat');
      
      // CSS d'urgence injecté directement
      const emergencyCSS = `
        @media (max-width: 768px) {
          #currency-converter-premium,
          #coin-lots-recommendations,
          #coin-lots-content {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
          }
          .currency-input-grid {
            display: grid !important;
            grid-template-columns: 1fr !important;
          }
        }
      `;
      
      const style = document.createElement('style');
      style.textContent = emergencyCSS;
      document.head.appendChild(style);
    }
  }
  
  // Appliquer immédiatement
  forceDisplayMobile();
  
  // Réappliquer au redimensionnement
  window.addEventListener('resize', forceDisplayMobile);
  
  // Réappliquer quand le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceDisplayMobile);
  } else {
    forceDisplayMobile();
  }
})();
</script>
SCRIPT;
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang) ?>">
<?php include 'head-common.php'; ?>

<body data-page="aide-jeux">
<?php
$snipcartLanguage = $lang;
$snipcartLocales = 'fr,en';
$snipcartAddProductBehavior = 'overlay';
ob_start();
include 'snipcart-init.php';
$snipcartInit = ob_get_clean();
include 'header.php';
echo $snipcartInit;
?>

<main id="main" class="pt-[var(--header-height)]">

  <!-- ===== HERO ===== -->
  <section class="min-h-screen flex items-center justify-center text-center relative text-white">
    <div class="hero-videos absolute inset-0 w-full h-full" style="z-index:-1" data-main="/media/videos/backgrounds/trip2_compressed.mp4" data-videos='["/media/videos/backgrounds/Carte1_compressed.mp4","/media/videos/backgrounds/cascade_HD_compressed.mp4","/media/videos/backgrounds/fontaine1_compressed.mp4","/media/videos/backgrounds/fontaine2_compressed.mp4","/media/videos/backgrounds/fontaine3_compressed.mp4","/media/videos/backgrounds/fontaine4_compressed.mp4","/media/videos/backgrounds/fontaine11_compressed.mp4"]'></div>
    <div class="absolute inset-0 bg-black/60"></div>
    <div class="relative z-10 max-w-4xl p-6 hero-text">
      <h1 class="text-5xl font-extrabold mb-6" data-i18n="gameHelp.hero.title">
        <?= __('gameHelp.hero.title', 'Guide des Triptyques') ?>
      </h1>
      <p class="text-xl mb-8 txt-court" data-i18n="gameHelp.hero.subtitle">
        <?= __('gameHelp.hero.subtitle', 'Maîtrisez vos fiches de personnage Geek & Dragon') ?>
      </p>
      <div class="hero-cta flex flex-wrap justify-center gap-4">
        <a href="#guide-triptyques" class="btn btn-primary"><?= __('gameHelp.buttons.discover', 'Découvrir les Triptyques') ?></a>
        <a href="#guide-cartes" class="btn btn-primary"><?= __('gameHelp.buttons.cardsGuide', 'Guide des Cartes') ?></a>
        <a href="#guide-monnaie" class="btn btn-primary"><?= __('gameHelp.buttons.moneyGuide', 'Guide de la Monnaie') ?></a>
        <a href="<?= langUrl('boutique.php') ?>" class="btn btn-outline"><?= __('gameHelp.buttons.goToShop', 'Visiter la Boutique') ?></a>
      </div>
    </div>
  </section>

  <!-- ===== NAVIGATION RAPIDE ===== -->
  <section id="menu-guides" class="py-12 bg-gray-800/50 scroll-mt-24">
    <div class="max-w-6xl mx-auto px-6">
      <h2 class="text-2xl font-bold text-center mb-8 text-white"><?= __('gameHelp.navigation.quickNav', 'Navigation Rapide') ?></h2>
      <div class="grid md:grid-cols-3 gap-6">
        <a href="#guide-triptyques" class="group bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl p-6 border border-indigo-500/30 hover:border-indigo-400/50 transition-all">
          <div class="text-center">
            <div class="text-4xl mb-3">📜</div>
            <h3 class="text-xl font-bold text-indigo-400 mb-2"><?= __('gameHelp.navigation.triptychsGuide', 'Guide des Triptyques') ?></h3>
            <p class="text-gray-300 text-sm"><?= __('gameHelp.navigation.triptychsSubtitle', 'Espèce, Classe, Historique - D&D 2024') ?></p>
          </div>
        </a>
        
        <a href="#guide-cartes" class="group bg-gradient-to-br from-emerald-900/50 to-teal-900/50 rounded-xl p-6 border border-emerald-500/30 hover:border-emerald-400/50 transition-all">
          <div class="text-center">
            <div class="text-4xl mb-3">🃏</div>
            <h3 class="text-xl font-bold text-emerald-400 mb-2"><?= __('gameHelp.navigation.cardsGuide', 'Guide des Cartes') ?></h3>
            <p class="text-gray-300 text-sm"><?= __('gameHelp.navigation.cardsSubtitle', 'Armes, Équipements, Sorts') ?></p>
          </div>
        </a>
        
        <a href="#guide-monnaie" class="group bg-gradient-to-br from-amber-900/50 to-yellow-900/50 rounded-xl p-6 border border-amber-500/30 hover:border-amber-400/50 transition-all">
          <div class="text-center">
            <div class="text-4xl mb-3">💰</div>
            <h3 class="text-xl font-bold text-amber-400 mb-2"><?= __('gameHelp.navigation.coinGuide', 'Guide de la Monnaie') ?></h3>
            <p class="text-gray-300 text-sm"><?= __('gameHelp.navigation.coinSubtitle', 'Système monétaire + Convertisseur') ?></p>
          </div>
        </a>
      </div>
    </div>
  </section>

  <!-- ===== INTRODUCTION AUX TRIPTYQUES ===== -->
  <section class="py-16 bg-gray-900/80">
    <div class="max-w-6xl mx-auto px-6 text-center">
      <h2 class="text-3xl md:text-4xl font-bold mb-8 text-indigo-400">
        <?= __('gameHelp.sections.whatIsTriptyque', 'Qu\'est-ce qu\'un triptyque Geek & Dragon ?') ?>
      </h2>
      <div class="max-w-4xl mx-auto">
        <p class="text-xl text-gray-300 mb-8 txt-court">
          <?= __('gameHelp.sections.triptychDescription', 'Un triptyque est une fiche de personnage cartonnée pliable en 3 volets, conçue pour remplacer les fastidieuses recherches dans les manuels.') ?> 
          <?= __('gameHelp.sections.threeRequired', 'Chaque personnage D&D nécessite <strong>3 triptyques différents</strong> qui se complètent parfaitement.') ?>
        </p>
        
        <div class="grid md:grid-cols-3 gap-8 mt-12">
          <div class="bg-gradient-to-b from-emerald-900/30 to-emerald-800/20 p-6 rounded-xl border border-emerald-700/50">
            <div class="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">1</div>
            <h3 class="text-xl font-semibold mb-3 text-emerald-400"><?= __('gameHelp.species.title', 'Triptyque d\'Espèce') ?></h3>
            <p class="text-gray-300"><?= __('gameHelp.species.description', 'Toutes les capacités raciales, traits et bonus de votre espèce (Elfe, Nain, Humain...)') ?></p>
          </div>
          
          <div class="bg-gradient-to-b from-blue-900/30 to-blue-800/20 p-6 rounded-xl border border-blue-700/50">
            <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">2</div>
            <h3 class="text-xl font-semibold mb-3 text-blue-400"><?= __('gameHelp.sections.classTriptych', 'Triptyque de Classe') ?></h3>
            <p class="text-gray-300"><?= __('gameHelp.class.description', 'Compétences, sorts, aptitudes et progression de votre classe (Guerrier, Magicien, Rôdeur...)') ?></p>
          </div>
          
          <div class="bg-gradient-to-b from-purple-900/30 to-purple-800/20 p-6 rounded-xl border border-purple-700/50">
            <div class="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">3</div>
            <h3 class="text-xl font-semibold mb-3 text-purple-400"><?= __('gameHelp.sections.backgroundTriptych', 'Triptyque d\'Historique') ?></h3>
            <p class="text-gray-300"><?= __('gameHelp.background.description', 'Compétences sociales, équipements de départ et background de votre personnage') ?></p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== GALERIE DES TRIPTYQUES ===== -->
  <section id="guide-triptyques" class="py-24 bg-gray-900/80 scroll-mt-24">
    <div class="max-w-7xl mx-auto px-6">

      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold mb-8" data-i18n="gameHelp.triptychGuide.title">
          <?= __('gameHelp.triptychGuide.title', 'Les 3 Triptyques de votre Personnage') ?>
        </h2>

        <!-- Encadré explicatif -->
        <div class="max-w-4xl mx-auto mb-8 bg-gradient-to-br from-purple-900/30 to-pink-900/20 rounded-xl p-6 border border-purple-600/30">
          <p class="text-lg leading-relaxed text-gray-200">
            <?= __('gameHelp.triptychGuide.intro', 'Nos triptyques sont des <strong class="text-purple-300">fiches de personnage robustes</strong> imprimées sur <strong class="text-pink-300">carton rigide</strong>. Trois volets articulés (Espèce, Classe, Historique) organisent toutes les informations de votre héros. <strong class="text-green-400">Plus besoin de feuilles volantes</strong> qui se déchirent ou se perdent !') ?>
          </p>
        </div>

        <p class="text-xl text-gray-300 max-w-4xl mx-auto txt-court">
          <?= __('gameHelp.sections.detailsText', 'Découvrez en détail chaque type de triptyque. Cliquez sur les images pour voir le verso de chaque fiche.') ?>
        </p>
      </div>

      <!-- ===== LANCEUR DE DÉS POUR CARACTÉRISTIQUES ===== -->
      <div class="dice-roller">
        <h3 class="text-2xl font-bold mb-4 text-center text-yellow-400"><?= __('gameHelp.diceRoller.title', '🎲 Lanceur de Caractéristiques') ?></h3>
        <p class="text-gray-300 text-center mb-4">
          <?= __('gameHelp.diceRoller.description', '<strong>D&D 2024 :</strong> Lancez 4d6 et gardez les 3 meilleurs résultats.') ?> 
          <?= __('gameHelp.diceRoller.backgroundNote', 'Vous ajouterez ensuite les bonus d\'<strong>Historique</strong> (+2 et +1) dans le triptyque d\'Historique.') ?>
        </p>
        
        <div class="dice-grid">
          <div class="text-center">
            <h4 class="font-semibold text-red-400 mb-2"><?= __('gameHelp.diceRoller.strength', 'Force') ?></h4>
            <button class="stat-dice" onclick="rollStat('str')"><?= __('gameHelp.diceRoller.rollButton', 'Lancer') ?></button>
            <div class="dice-result text-red-300" id="str-result">--</div>
          </div>
          <div class="text-center">
            <h4 class="font-semibold text-green-400 mb-2"><?= __('gameHelp.diceRoller.dexterity', 'Dextérité') ?></h4>
            <button class="stat-dice" onclick="rollStat('dex')"><?= __('gameHelp.diceRoller.rollButton', 'Lancer') ?></button>
            <div class="dice-result text-green-300" id="dex-result">--</div>
          </div>
          <div class="text-center">
            <h4 class="font-semibold text-orange-400 mb-2"><?= __('gameHelp.diceRoller.constitution', 'Constitution') ?></h4>
            <button class="stat-dice" onclick="rollStat('con')"><?= __('gameHelp.diceRoller.rollButton', 'Lancer') ?></button>
            <div class="dice-result text-orange-300" id="con-result">--</div>
          </div>
          <div class="text-center">
            <h4 class="font-semibold text-blue-400 mb-2"><?= __('gameHelp.diceRoller.intelligence', 'Intelligence') ?></h4>
            <button class="stat-dice" onclick="rollStat('int')"><?= __('gameHelp.diceRoller.rollButton', 'Lancer') ?></button>
            <div class="dice-result text-blue-300" id="int-result">--</div>
          </div>
          <div class="text-center">
            <h4 class="font-semibold text-purple-400 mb-2"><?= __('gameHelp.diceRoller.wisdom', 'Sagesse') ?></h4>
            <button class="stat-dice" onclick="rollStat('wis')"><?= __('gameHelp.diceRoller.rollButton', 'Lancer') ?></button>
            <div class="dice-result text-purple-300" id="wis-result">--</div>
          </div>
          <div class="text-center">
            <h4 class="font-semibold text-pink-400 mb-2"><?= __('gameHelp.diceRoller.charisma', 'Charisme') ?></h4>
            <button class="stat-dice" onclick="rollStat('cha')"><?= __('gameHelp.diceRoller.rollButton', 'Lancer') ?></button>
            <div class="dice-result text-pink-300" id="cha-result">--</div>
          </div>
        </div>
        
        <div class="text-center mt-4">
          <button class="roll-all-btn" onclick="rollAllStats()"><?= __('gameHelp.diceRoller.rollAllButton', '🎲 Lancer toutes les caractéristiques') ?></button>
        </div>
      </div>

      <div class="triptych-grid mb-16">
        
        <!-- Triptyque d'Espèce -->
        <div class="card-product">
          <div class="h-[6rem] mb-6 flex items-center justify-center">
            <h3 class="text-2xl font-bold text-center text-emerald-400 leading-tight"><?= __('gameHelp.examples.species', '🧝 Espèce') ?></h3>
          </div>
          
          <div class="flip-container" id="species-flip" onclick="flipCard('species-flip')">
            <div class="flipper">
              <div class="front">
                <img src="/media/game/triptychs/examples/race-aasimar-recto.webp" alt="<?= __('gameHelp.images.speciesAssimarFront', 'Triptyque Espèce Aasimar - Recto') ?>" class="triptych-preview">
              </div>
              <div class="back">
                <img src="/media/game/triptychs/examples/race-aasimar-verso.webp" alt="<?= __('gameHelp.images.speciesAssimarBack', 'Triptyque Espèce Aasimar - Verso') ?>" class="triptych-preview">
              </div>
            </div>
          </div>
          
          <div class="text-center h-[180px] flex flex-col justify-start">
            <h4 class="font-semibold mb-2 text-emerald-300"><?= __('gameHelp.species.example', 'Exemple : Aasimar') ?></h4>
            <p class="text-gray-300 text-sm mb-3">
              <?= __('gameHelp.species.exampleDesc', 'Traits raciaux et aptitudes d\'espèce avec statistiques détaillées.') ?>
            </p>
            <ul class="text-gray-400 text-xs space-y-0.5">
              <li><?= __('gameHelp.species.trait1', '• Traits et résistances') ?></li>
              <li><?= __('gameHelp.species.trait2', '• Sorts d\'espèce') ?></li>
              <li><?= __('gameHelp.species.trait3', '• Langues spéciales') ?></li>
            </ul>
          </div>
        </div>

        <!-- Triptyque de Classe -->
        <div class="card-product">
          <div class="h-[6rem] mb-6 flex items-center justify-center">
            <h3 class="text-2xl font-bold text-center text-blue-400 leading-tight"><?= __('gameHelp.examples.class', '⚔️ Classe') ?></h3>
          </div>
          
          <div class="flip-container" id="class-flip" onclick="flipCard('class-flip')">
            <div class="flipper">
              <div class="front">
                <img src="/media/game/triptychs/examples/classe-barbare-recto.webp" alt="<?= __('gameHelp.images.classBarbarianFront', 'Triptyque Classe Barbare - Recto') ?>" class="triptych-preview">
              </div>
              <div class="back">
                <img src="/media/game/triptychs/examples/classe-barbare-verso.webp" alt="<?= __('gameHelp.images.classBarbarianBack', 'Triptyque Classe Barbare - Verso') ?>" class="triptych-preview">
              </div>
            </div>
          </div>
          
          <div class="text-center h-[180px] flex flex-col justify-start">
            <h4 class="font-semibold mb-2 text-blue-300"><?= __('gameHelp.class.example', 'Exemple : Barbare') ?></h4>
            <p class="text-gray-300 text-sm mb-3">
              <?= __('gameHelp.class.exampleDesc', 'Aptitudes de classe et progression avec statistiques vitales.') ?>
            </p>
            <ul class="text-gray-400 text-xs space-y-0.5">
              <li><?= __('gameHelp.class.trait1', '• Initiative et jets de mort') ?></li>
              <li><?= __('gameHelp.class.trait2', '• Points de vie complets') ?></li>
              <li><?= __('gameHelp.class.trait3', '• Classe d\'armure') ?></li>
              <li><?= __('gameHelp.class.trait4', '• Rage et aptitudes') ?></li>
            </ul>
          </div>
        </div>

        <!-- Triptyque d'Historique -->
        <div class="card-product">
          <div class="h-[6rem] mb-6 flex items-center justify-center">
            <h3 class="text-2xl font-bold text-center text-purple-400 leading-tight"><?= __('gameHelp.examples.background', '📜 Historique') ?></h3>
          </div>
          
          <div class="flip-container" id="background-flip" onclick="flipCard('background-flip')">
            <div class="flipper">
              <div class="front">
                <img src="/media/game/triptychs/examples/historique-acolyte-recto.webp" alt="<?= __('gameHelp.images.backgroundAcolyteFront', 'Triptyque Historique Acolyte - Recto') ?>" class="triptych-preview">
              </div>
              <div class="back">
                <img src="/media/game/triptychs/examples/historique-acolyte-verso.webp" alt="<?= __('gameHelp.images.backgroundAcolyteBack', 'Triptyque Historique Acolyte - Verso') ?>" class="triptych-preview">
              </div>
            </div>
          </div>
          
          <div class="text-center h-[180px] flex flex-col justify-start">
            <h4 class="font-semibold mb-2 text-purple-300"><?= __('gameHelp.background.example', 'Exemple : Acolyte') ?></h4>
            <p class="text-gray-300 text-sm mb-3">
              <?= __('gameHelp.background.exampleDesc', '<strong>D&D 2024 :</strong> Bonus de caractéristiques maintenant dans l\'historique.') ?>
            </p>
            <ul class="text-gray-400 text-xs space-y-0.5">
              <li><?= __('gameHelp.background.trait1', '• <strong>Bonus caractéristiques</strong>') ?></li>
              <li><?= __('gameHelp.background.trait2', '• Compétences sociales') ?></li>
              <li><?= __('gameHelp.background.trait3', '• Aptitude spéciale') ?></li>
              <li><?= __('gameHelp.background.trait4', '• Personnalité') ?></li>
            </ul>
          </div>
        </div>

      </div>

      <!-- ===== GUIDE DÉTAILLÉ DE REMPLISSAGE D&D 2024 ===== -->
      <div class="bg-gradient-to-r from-emerald-900/30 to-blue-900/30 rounded-xl p-8 border border-emerald-700/50 mt-16">
        <h3 class="text-3xl font-bold mb-8 text-center text-emerald-400"><?= __('gameHelp.detailedGuide.title', '📝 Guide Détaillé de Remplissage (D&D 2024)') ?></h3>
        
        <div class="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 mb-8">
          <h4 class="text-xl font-bold text-yellow-400 mb-2"><?= __('gameHelp.fillingGuide.newIn2024', '⚠️ Nouveau dans D&D 2024 !') ?></h4>
          <p class="text-gray-300">
            <?= __('gameHelp.detailedGuide.important', '<strong>Important :</strong>') ?> <?= __('gameHelp.detailedGuide.importantText', 'Les bonus de caractéristiques sont maintenant assignés par l\'<strong>Historique</strong>, plus par l\'Espèce ! C\'est dans le triptyque d\'Historique que vous noterez vos caractéristiques finales.') ?>
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 gap-8">

          <!-- Triptyque d'Historique - PREMIER car c'est là qu'on note les caractéristiques -->
          <div class="bg-purple-900/20 p-6 rounded-lg border border-purple-500/50">
            <h4 class="text-xl font-bold mb-4 text-purple-400"><?= __('gameHelp.detailedGuide.backgroundPriority.title', '📜 1. Triptyque d\'Historique (PRIORITÉ)') ?></h4>
            
            <div class="space-y-4">
              <div class="border-l-4 border-purple-500 pl-4">
                <h5 class="font-semibold text-purple-300"><?= __('gameHelp.detailedGuide.backgroundPriority.characteristics.title', '1. Bonus de caractéristiques (NOUVEAU 2024)') ?></h5>
                <p class="text-gray-300 text-sm">
                  <?= __('gameHelp.detailedGuide.backgroundPriority.characteristics.important', '<strong>C\'est ICI que vous notez vos caractéristiques finales !</strong>') ?><br>
                  <?= __('gameHelp.detailedGuide.backgroundPriority.characteristics.rules.rule1', '• Lancez 4d6 (gardez les 3 meilleurs) avec le lanceur ci-dessus') ?><br>
                  <?= __('gameHelp.detailedGuide.backgroundPriority.characteristics.rules.rule2', '• Ajoutez les bonus d\'historique (+2 dans une carac, +1 dans une autre)') ?><br>
                  <?= __('gameHelp.detailedGuide.backgroundPriority.characteristics.rules.rule3', '• Notez le total final et le modificateur (ex: 16 = +3)') ?><br>
                  <?= __('gameHelp.detailedGuide.backgroundPriority.characteristics.rules.rule4', '• <em>Les espèces n\'ont plus de bonus de caractéristiques fixes</em>') ?>
                </p>
              </div>
              
              <div class="border-l-4 border-purple-500 pl-4">
                <h5 class="font-semibold text-purple-300"><?= __('gameHelp.detailedGuide.backgroundPriority.skills.title', '2. Compétences et maîtrises (toutes sources)') ?></h5>
                <p class="text-gray-300 text-sm">
                  <?= __('gameHelp.detailedGuide.backgroundPriority.skills.important', '<strong>Triptyque d\'Historique = CENTRALISATION de toutes les compétences !</strong>') ?><br>
                  <?= __('gameHelp.detailedGuide.backgroundPriority.skills.list.item1', '• Les 2 compétences d\'historique') ?><br>
                  <?= __('gameHelp.detailedGuide.backgroundPriority.skills.list.item2', '• Compétences de classe (reportées depuis le triptyque de Classe)') ?><br>
                  <?= __('gameHelp.detailedGuide.backgroundPriority.skills.list.item3', '• Compétences raciales (reportées depuis le triptyque d\'Espèce)') ?><br>
                  <?= __('gameHelp.detailedGuide.backgroundPriority.skills.list.item4', '• Maîtrises d\'outils spécifiques') ?><br>
                  <?= __('gameHelp.detailedGuide.backgroundPriority.skills.list.item5', '• Aptitude d\'historique unique (ex: Initié à la magie)') ?>
                </p>
              </div>
              
              <div class="border-l-4 border-purple-500 pl-4">
                <h5 class="font-semibold text-purple-300"><?= __('gameHelp.detailedGuide.backgroundPriority.equipment.title', '3. Équipement et Personnalité') ?></h5>
                <p class="text-gray-300 text-sm">
                  <?= __('gameHelp.detailedGuide.backgroundPriority.equipment.list.item1', '• Cartes d\\équipement de départ fournies avec le triptyque') ?><br>
                  <?= __('gameHelp.detailedGuide.backgroundPriority.equipment.list.item2', '• Remplissez les traits de personnalité (Coûts, Idéaux, Liens, Défauts)') ?><br>
                  <?= __('gameHelp.detailedGuide.backgroundPriority.equipment.list.item3', '• Développez votre background narratif') ?>
                </p>
              </div>
            </div>
          </div>
          
          <!-- Triptyque d'Espèce - Remplissage -->
          <div class="bg-gray-800/50 p-6 rounded-lg">
            <h4 class="text-xl font-bold mb-4 text-emerald-400"><?= __('gameHelp.detailedGuide.speciesGuide.title', '🧝 2. Triptyque d\'Espèce') ?></h4>
            
            <div class="space-y-4">
              <div class="border-l-4 border-emerald-500 pl-4">
                <h5 class="font-semibold text-emerald-300"><?= __('gameHelp.detailedGuide.speciesGuide.traits.title', '1. Langues et traits raciaux') ?></h5>
                <p class="text-gray-300 text-sm">
                  <?= __('gameHelp.detailedGuide.speciesGuide.traits.languages', '<strong>Langues :</strong> C\'est ICI que vous notez les langues !') ?><br>
                  <?= __('gameHelp.detailedGuide.speciesGuide.traits.list.item1', '• Langue commune + langue raciale (ex: Céleste, Draconique)') ?><br>
                  <?= __('gameHelp.detailedGuide.speciesGuide.traits.list.item2', '• Une troisième langue au choix') ?><br>
                  <?= __('gameHelp.detailedGuide.speciesGuide.traits.list.item3', '• Cochez les résistances aux dégâts') ?><br>
                  <?= __('gameHelp.detailedGuide.speciesGuide.traits.list.item4', '• Notez les sens spéciaux (vision dans le noir, etc.)') ?>
                </p>
              </div>
              
              <div class="border-l-4 border-emerald-500 pl-4">
                <h5 class="font-semibold text-emerald-300"><?= __('gameHelp.detailedGuide.speciesGuide.abilities.title', '2. Capacités et sorts d\'espèce') ?></h5>
                <p class="text-gray-300 text-sm">
                  <?= __('gameHelp.detailedGuide.speciesGuide.abilities.list.item1', '• Détaillez les sorts raciaux (niveau, utilisations/repos)') ?><br>
                  <?= __('gameHelp.detailedGuide.speciesGuide.abilities.list.item2', '• Notez les aptitudes héréditaires uniques') ?><br>
                  <?= __('gameHelp.detailedGuide.speciesGuide.abilities.list.item3', '• Cochez les immunités et résistances spéciales') ?><br>
                  <?= __('gameHelp.detailedGuide.speciesGuide.abilities.list.item4', '• Taille, vitesse de déplacement, durée de vie') ?>
                </p>
                <div class="mt-3 p-2 bg-yellow-900/30 rounded border-l-2 border-yellow-500">
                  <p class="text-yellow-300 text-xs italic">
                    <?= __('gameHelp.detailedGuide.speciesGuide.note', '📝 <strong>Note importante :</strong> Les compétences et maîtrises d\'espèce doivent être reportées sur le triptyque d\'Historique !') ?>
                  </p>
                </div>
              </div>
              
              <div class="border-l-4 border-emerald-500 pl-4">
                <h5 class="font-semibold text-emerald-300"><?= __('gameHelp.detailedGuide.speciesGuide.training.title', '3. Champs "Entraînements" (vides au départ)') ?></h5>
                <p class="text-gray-300 text-sm">
                  <?= __('gameHelp.detailedGuide.speciesGuide.training.important', '<strong>Important :</strong> Ces 5 champs sont pour les acquisitions EN JEU') ?><br>
                  <?= __('gameHelp.detailedGuide.speciesGuide.training.list.item1', '• Nouvelles langues apprises durant l\'aventure') ?><br>
                  <?= __('gameHelp.detailedGuide.speciesGuide.training.list.item2', '• Maîtrises d\'outils acquises') ?><br>
                  <?= __('gameHelp.detailedGuide.speciesGuide.training.list.item3', '• Compétences spéciales gagnées') ?><br>
                  <?= __('gameHelp.detailedGuide.speciesGuide.training.list.item4', '• Ne les remplissez que si votre personnage apprend quelque chose') ?>
                </p>
              </div>
            </div>
          </div>

          <!-- Triptyque de Classe - Remplissage -->
          <div class="bg-gray-800/50 p-6 rounded-lg">
            <h4 class="text-xl font-bold mb-4 text-blue-400"><?= __('gameHelp.detailedGuide.classGuide.title', '⚔️ 3. Triptyque de Classe') ?></h4>
            
            <div class="space-y-4">
              <div class="border-l-4 border-blue-500 pl-4">
                <h5 class="font-semibold text-blue-300"><?= __('gameHelp.detailedGuide.classGuide.combat.title', '1. Statistiques vitales et combat') ?></h5>
                <p class="text-gray-300 text-sm">
                  <?= __('gameHelp.detailedGuide.classGuide.combat.list.item1', '• <strong>Points de vie :</strong> Maximum, actuels, temporaires') ?><br>
                  <?= __('gameHelp.detailedGuide.classGuide.combat.list.item2', '• <strong>Classe d\'armure :</strong> Avec et sans bouclier') ?><br>
                  <?= __('gameHelp.detailedGuide.classGuide.combat.list.item3', '• <strong>Initiative :</strong> Modificateur et résultat de jet') ?><br>
                  <?= __('gameHelp.detailedGuide.classGuide.combat.list.item4', '• <strong>Jets contre la mort :</strong> Suivi des réussites/échecs') ?><br>
                  <?= __('gameHelp.detailedGuide.classGuide.combat.list.item5', '• Niveau actuel et bonus de maîtrise') ?>
                </p>
              </div>
              
              <div class="border-l-4 border-blue-500 pl-4">
                <h5 class="font-semibold text-blue-300"><?= __('gameHelp.detailedGuide.classGuide.skills.title', '2. Compétences et maîtrises de classe') ?></h5>
                <p class="text-gray-300 text-sm">
                  <?= __('gameHelp.detailedGuide.classGuide.skills.list.item1', '• Cochez les compétences de classe maîtrisées') ?><br>
                  <?= __('gameHelp.detailedGuide.classGuide.skills.list.item2', '• Notez les maîtrises d\'armes et armures') ?><br>
                  <?= __('gameHelp.detailedGuide.classGuide.skills.list.item3', '• Jets de sauvegarde maîtrisés') ?>
                </p>
                <div class="mt-3 p-2 bg-yellow-900/30 rounded border-l-2 border-yellow-500">
                  <p class="text-yellow-300 text-xs italic">
                    <?= __('gameHelp.detailedGuide.classGuide.note', '📝 <strong>Note importante :</strong> Les compétences et maîtrises de classe doivent être reportées sur le triptyque d\'Historique !') ?>
                  </p>
                </div>
              </div>
              
              <div class="border-l-4 border-blue-500 pl-4">
                <h5 class="font-semibold text-blue-300"><?= __('gameHelp.detailedGuide.classGuide.abilities.title', '3. Aptitudes et ressources') ?></h5>
                <p class="text-gray-300 text-sm">
                  <?= __('gameHelp.detailedGuide.classGuide.abilities.list.item1', '• Aptitudes acquises par niveau (cochez au fur et à mesure)') ?><br>
                  <?= __('gameHelp.detailedGuide.classGuide.abilities.list.item2', '• Ressources de classe (Rage, Inspiration, Emplacements de sorts...)') ?><br>
                  <?= __('gameHelp.detailedGuide.classGuide.abilities.list.item3', '• Capacités de sous-classe spécifiques') ?>
                </p>
              </div>
            </div>
          </div>

          <!-- Ordre de remplissage -->
          <div class="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 p-6 rounded-lg border border-yellow-600/50">
            <h4 class="text-xl font-bold mb-4 text-yellow-400"><?= __('gameHelp.detailedGuide.order.title', '📋 Ordre de Remplissage Recommandé') ?></h4>
            
            <div class="space-y-3">
              <div class="flex items-start space-x-3">
                <span class="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                <p class="text-gray-300 text-sm">
                  <?= __('gameHelp.detailedGuide.order.step1.text', '<strong>Historique FIRST :</strong> Lancez les dés et notez les caractéristiques avec bonus d\'historique') ?>
                </p>
              </div>
              
              <div class="flex items-start space-x-3">
                <span class="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                <p class="text-gray-300 text-sm">
                  <?= __('gameHelp.detailedGuide.order.step2.text', '<strong>Espèce :</strong> Traits raciaux, langues, capacités. <em>Reportez les compétences sur l\'Historique</em>') ?>
                </p>
              </div>
              
              <div class="flex items-start space-x-3">
                <span class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                <p class="text-gray-300 text-sm">
                  <?= __('gameHelp.detailedGuide.order.step3.text', '<strong>Classe :</strong> PV, aptitudes, ressources. <em>Reportez les compétences sur l\'Historique</em>') ?>
                </p>
              </div>
              
              <div class="flex items-start space-x-3">
                <span class="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                <p class="text-gray-300 text-sm">
                  <?= __('gameHelp.detailedGuide.order.step4.text', '<strong>Historique FINAL :</strong> Centralisez toutes les compétences et maîtrises des 3 triptyques') ?>
                </p>
              </div>
            </div>
          </div>

          <!-- Conseils généraux -->
          <div class="bg-gray-800/50 p-6 rounded-lg">
            <h4 class="text-xl font-bold mb-4 text-yellow-400"><?= __('gameHelp.detailedGuide.tips.title', '💡 Conseils de Remplissage') ?></h4>
            
            <div class="space-y-3">
              <div class="flex items-start space-x-3">
                <span class="text-yellow-400 font-bold">✏️</span>
                <p class="text-gray-300 text-sm">
                  <?= __('gameHelp.detailedGuide.tips.tip1.text', '<strong>Crayon obligatoire :</strong> Les valeurs évoluent constamment') ?>
                </p>
              </div>
              
              <div class="flex items-start space-x-3">
                <span class="text-yellow-400 font-bold">📸</span>
                <p class="text-gray-300 text-sm">
                  <?= __('gameHelp.detailedGuide.tips.tip2.text', '<strong>Photo de sauvegarde :</strong> Sécurisez vos triptyques remplis') ?>
                </p>
              </div>
              
              <div class="flex items-start space-x-3">
                <span class="text-yellow-400 font-bold">🎯</span>
                <p class="text-gray-300 text-sm">
                  <?= __('gameHelp.detailedGuide.tips.tip3.text', '<strong>Organisation :</strong> Historique à gauche (caracs), Espèce au centre, Classe à droite') ?>
                </p>
              </div>
              
              <div class="flex items-start space-x-3">
                <span class="text-yellow-400 font-bold">⚡</span>
                <p class="text-gray-300 text-sm">
                  <?= __('gameHelp.detailedGuide.tips.tip4.text', '<strong>Mémo 2024 :</strong> Les bonus de caracs viennent de l\'HISTORIQUE maintenant !') ?>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== PERSONNALISATION SUR MESURE ===== -->
      <div class="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-xl p-8 border border-indigo-700/50 mt-16">
        <h3 class="text-3xl font-bold mb-6 text-center text-indigo-400"><?= __('gameHelp.customTriptychs.title', '✨ Triptyques Personnalisés') ?></h3>
        
        <div class="max-w-4xl mx-auto text-center">
          <p class="text-xl text-gray-300 mb-6 txt-court">
            <?= __('gameHelp.customTriptychs.description', 'Vous voulez un triptyque totalement adapté à votre personnage unique ? Nous créons des triptyques sur mesure avec vos choix spécifiques !') ?>
          </p>
          
          <div class="grid md:grid-cols-2 gap-8 mt-8">
            <div class="bg-gray-800/50 p-6 rounded-lg">
              <h4 class="text-xl font-bold mb-4 text-indigo-300"><?= __('gameHelp.customTriptychs.standard.title', '🎯 Triptyques Standards') ?></h4>
              <ul class="text-gray-300 text-left space-y-2">
                <li><?= __('gameHelp.customTriptychs.standard.list.item1', '• Cartes d\\équipement aléatoires incluses') ?></li>
                <li><?= __('gameHelp.customTriptychs.standard.list.item2', '• Choix standards pour les options variables') ?></li>
                <li><?= __('gameHelp.customTriptychs.standard.list.item3', '• Livraison rapide depuis notre stock') ?></li>
                <li><?= __('gameHelp.customTriptychs.standard.list.item4', '• Prix catalogue de la boutique') ?></li>
              </ul>
            </div>
            
            <div class="bg-gray-800/50 p-6 rounded-lg border border-indigo-500/50">
              <h4 class="text-xl font-bold mb-4 text-indigo-300"><?= __('gameHelp.customTriptychs.custom.title', '⭐ Triptyques Personnalisés') ?></h4>
              <ul class="text-gray-300 text-left space-y-2">
                <li><?= __('gameHelp.customTriptychs.custom.list.item1', '• Choix précis de tous les équipements') ?></li>
                <li><?= __('gameHelp.customTriptychs.custom.list.item2', '• Sélection manuelle des cartes incluses') ?></li>
                <li><?= __('gameHelp.customTriptychs.custom.list.item3', '• Adaptation à votre background spécifique') ?></li>
                <li><?= __('gameHelp.customTriptychs.custom.list.item4', '• Création sur commande (délai supplémentaire)') ?></li>
              </ul>
            </div>
          </div>
          
          <div class="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg p-6 mt-8 border border-yellow-700/50">
            <h4 class="text-xl font-bold mb-4 text-yellow-400"><?= __('gameHelp.customTriptychs.contact.title', '📧 Comment Commander') ?></h4>
            <p class="text-gray-300 mb-4">
              <?= __('gameHelp.customTriptychs.contact.description', 'Pour un triptyque entièrement personnalisé, contactez-nous par email avec les détails de votre personnage :') ?>
            </p>
            <div class="flex flex-col md:flex-row items-center justify-center gap-4">
              <a href="mailto:<?= __('gameHelp.customTriptychs.contact.email', 'commande@geekndragon.com') ?>?subject=<?= __('gameHelp.customTriptychs.contact.subject', 'Triptyque Personnalisé') ?>" 
                 class="btn btn-primary text-lg px-6 py-3">
                📧 <?= __('gameHelp.customTriptychs.contact.email', 'commande@geekndragon.com') ?>
              </a>
              <span class="text-gray-400"><?= __('gameHelp.customTriptychs.contact.subjectLabel', 'Sujet : "Triptyque Personnalisé"') ?></span>
            </div>
          </div>
          
          <div class="mt-6 text-sm text-gray-400">
            <p><?= __('gameHelp.customTriptychs.contact.tip', '💡 <strong>Astuce :</strong> Précisez votre classe, espèce, historique et vos préférences d\'équipement dans votre email') ?></p>
          </div>
        </div>
      </div>

    </div>
  </section>

  <!-- ===== COMMENT UTILISER VOS TRIPTYQUES ===== -->
  <section class="py-16 bg-gradient-to-r from-indigo-900/30 to-purple-900/30">
    <div class="max-w-6xl mx-auto px-6">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold mb-6 text-indigo-400">
          <?= __('gameHelp.customTriptychs.usage.title', 'Comment utiliser vos triptyques') ?>
        </h2>
        <p class="text-xl text-gray-300 txt-court">
          <?= __('gameHelp.customTriptychs.usage.description', 'Vos triptyques cartonnés sont conçus pour être pliés et organisés sur votre table de jeu') ?>
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        <div class="usage-step">
          <div class="step-number">1</div>
          <h3 class="text-xl font-semibold mb-4 text-indigo-400"><?= __('gameHelp.customTriptychs.usage.step1.title', '📁 Pliez en 3 volets') ?></h3>
          <p class="text-gray-300">
            <?= __('gameHelp.customTriptychs.usage.step1.text', 'Chaque triptyque se plie facilement en 3 sections. Le carton robuste maintient la forme et permet une consultation rapide des informations sur les 3 volets.') ?>
          </p>
        </div>

        <div class="usage-step">
          <div class="step-number">2</div>
          <h3 class="text-xl font-semibold mb-4 text-blue-400"><?= __('gameHelp.customTriptychs.usage.step2.title', '🎯 Organisez sur votre table') ?></h3>
          <p class="text-gray-300">
            <?= __('gameHelp.customTriptychs.usage.step2.text', 'Disposez vos 3 triptyques devant vous : Espèce à gauche, Classe au centre, Historique à droite. Accès instantané à toutes vos capacités.') ?>
          </p>
        </div>

        <div class="usage-step">
          <div class="step-number">3</div>
          <h3 class="text-xl font-semibold mb-4 text-purple-400"><?= __('gameHelp.customTriptychs.usage.step3.title', '⚡ Consultez pendant le jeu') ?></h3>
          <p class="text-gray-300">
            <?= __('gameHelp.customTriptychs.usage.step3.text', 'Plus besoin d\'ouvrir les manuels ! Toutes vos aptitudes sont visibles d\'un coup d\'œil. Le MJ et les autres joueurs restent concentrés sur l\'action.') ?>
          </p>
        </div>
      </div>

      <div class="text-center mt-12">
        <div class="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
          <h3 class="text-2xl font-bold mb-4 text-yellow-400"><?= __('gameHelp.customTriptychs.usage.proTip.title', '💡 Conseil Pro') ?></h3>
          <p class="text-gray-300 text-lg mb-6">
            <?= __('gameHelp.customTriptychs.usage.proTip.text', 'Gardez vos triptyques ouverts pendant toute la session. Ils remplacent efficacement la feuille de personnage traditionnelle et accélèrent considérablement le jeu !') ?>
          </p>

          <div class="bg-gray-700/30 rounded-lg p-6 border border-yellow-500/30">
            <h4 class="text-xl font-bold mb-4 text-yellow-300"><?= __('gameHelp.customTriptychs.usage.proTip.writingAdvice.title', '✏️ Astuce d\'Écriture & Effacement') ?></h4>
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h5 class="font-semibold text-yellow-200 mb-2"><?= __('gameHelp.customTriptychs.usage.proTip.writingAdvice.triptychs.title', 'Pour les Triptyques :') ?></h5>
                <p class="text-gray-300 text-sm mb-3">
                  <?= __('gameHelp.customTriptychs.usage.proTip.writingAdvice.triptychs.text', '<strong>Marqueurs permanents Sharpie + gomme Staedtler</strong> = combinaison parfaite ! Vous pouvez effacer complètement le marqueur sur les triptyques, même sur les zones colorées. N\'hésitez pas à gommer énergiquement, le carton résiste parfaitement.') ?>
                </p>
              </div>
              <div>
                <h5 class="font-semibold text-yellow-200 mb-2"><?= __('gameHelp.customTriptychs.usage.proTip.writingAdvice.cards.title', 'Pour les Cartes :') ?></h5>
                <p class="text-gray-300 text-sm mb-3">
                  <?= __('gameHelp.customTriptychs.usage.proTip.writingAdvice.cards.text', 'La technique fonctionne aussi sur les cartes, mais <strong>limitez le gommage aux zones blanches</strong> idéalement car elles sont plus fines. Les cartes devraient être personnalisées à chaque personnage pour une expérience optimale !') ?>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Bouton de retour au hero -->
      <div class="text-center mt-16">
        <a href="#menu-guides" class="btn btn-outline">
          <?= __('gameHelp.backToMain', '⬆️ Retour aux guides principaux') ?>
        </a>
      </div>
    </div>
  </section>

  <!-- ===== GUIDE DES CARTES À JOUER ===== -->
  <section class="py-24 bg-gradient-to-r from-gray-900/80 to-slate-900/80 scroll-mt-24" id="guide-cartes">
    <div class="max-w-7xl mx-auto px-6">

      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold mb-8 text-yellow-400">
          <?= __('gameHelp.cards.mainTitle', '🃏 Guide des Cartes à Jouer Geek & Dragon') ?>
        </h2>

        <!-- Encadré explicatif -->
        <div class="max-w-4xl mx-auto mb-8 bg-gradient-to-br from-indigo-900/30 to-purple-900/20 rounded-xl p-6 border border-indigo-600/30">
          <p class="text-lg leading-relaxed text-gray-200">
            <?= __('gameHelp.cards.intro', '<strong class="text-indigo-300">560 cartes illustrées</strong> couvrant armes, armures, équipements, sorts et plus. Chaque carte présente <strong class="text-purple-300">visuellement</strong> toutes les statistiques et règles nécessaires. <strong class="text-green-400">Fini la lecture fastidieuse</strong> des manuels pendant les parties !') ?>
          </p>
        </div>

        <h3 class="text-2xl font-semibold text-yellow-200 mb-4">
          <?= __('gameHelp.cards.faqSubtitle', 'FAQ Cartes') ?>
        </h3>
        <p class="text-xl text-gray-300 max-w-4xl mx-auto txt-court">
          <?= __('gameHelp.cards.mainDescription', 'Complétez vos triptyques avec nos cartes détaillées : Armes, Armures, Équipements, Sorts, Monstres et bien plus ! Chaque carte contient toutes les informations nécessaires pour accélérer vos parties.') ?>
        </p>
      </div>

      <!-- ===== TYPES DE CARTES ===== -->
      <div class="grid md:grid-cols-3 gap-8 mb-16">
        
        <!-- Cartes d'Équipement -->
        <div class="bg-gradient-to-b from-amber-900/30 to-orange-900/20 p-6 rounded-xl border border-amber-700/50">
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">⚔️</div>
            <h3 class="text-xl font-bold text-amber-400"><?= __('gameHelp.cards.types.equipment.title', 'Cartes d\'Équipement') ?></h3>
          </div>
          <ul class="text-gray-300 text-sm space-y-2">
            <li><?= __('gameHelp.cards.types.equipment.weapons', '• <strong>Armes :</strong> Statistiques complètes, propriétés spéciales') ?></li>
            <li><?= __('gameHelp.cards.types.equipment.armor', '• <strong>Armures :</strong> CA, poids, restrictions de classe') ?></li>
            <li><?= __('gameHelp.cards.types.equipment.equipment', '• <strong>Équipement :</strong> Objets d\'aventure et outils') ?></li>
            <li><?= __('gameHelp.cards.types.equipment.magicItems', '• <strong>Objets magiques :</strong> Pouvoirs et malédictions <span class="text-amber-300 text-xs italic">(en cours de création par nos gobelins dans nos forges...)</span>') ?></li>
          </ul>
        </div>
        
        <!-- Cartes de Règles -->
        <div class="bg-gradient-to-b from-blue-900/30 to-indigo-900/20 p-6 rounded-xl border border-blue-700/50">
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">📜</div>
            <h3 class="text-xl font-bold text-blue-400"><?= __('gameHelp.cards.types.rules.title', 'Cartes de Règles') ?></h3>
          </div>
          <ul class="text-gray-300 text-sm space-y-2">
            <li><?= __('gameHelp.cards.types.rules.special', '• <strong>Règles spéciales :</strong> Maladies, création d\'objets') ?></li>
            <li><?= __('gameHelp.cards.types.rules.services', '• <strong>Services :</strong> Marchands, artisans, guides') ?></li>
            <li><?= __('gameHelp.cards.types.rules.vehicles', '• <strong>Véhicules :</strong> Montres, navires, véhicules') ?></li>
            <li><?= __('gameHelp.cards.types.rules.poisons', '• <strong>Poisons :</strong> Effets et antidotes') ?></li>
          </ul>
        </div>
        
        <!-- Cartes de Gameplay -->
        <div class="bg-gradient-to-b from-purple-900/30 to-violet-900/20 p-6 rounded-xl border border-purple-700/50">
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">🎭</div>
            <h3 class="text-xl font-bold text-purple-400"><?= __('gameHelp.cards.types.gameplay.title', 'Cartes de Gameplay') ?></h3>
          </div>
          <ul class="text-gray-300 text-sm space-y-2">
            <li><?= __('gameHelp.cards.types.gameplay.spells', '• <strong>Sorts :</strong> Descriptions complètes, composantes') ?></li>
            <li><?= __('gameHelp.cards.types.gameplay.monsters', '• <strong>Monstres :</strong> Statistiques, tactiques, butin') ?></li>
            <li><?= __('gameHelp.cards.types.gameplay.packages', '• <strong>Paquetages :</strong> Kits d\'équipement thématiques') ?></li>
            <li><?= __('gameHelp.cards.types.gameplay.goods', '• <strong>Marchandises :</strong> Commerce et économie') ?></li>
          </ul>
        </div>
      </div>

      <!-- Note disponibilité cartes -->
      <div class="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-700/50 mb-16 text-center">
        <h4 class="text-xl font-bold mb-3 text-green-400"><?= __('gameHelp.cards.availability.title', '📦 Disponibilité des Cartes') ?></h4>
        <p class="text-gray-300 mb-2">
          <?= __('gameHelp.cards.availability.available', '<strong>Toutes les cartes d\'objets sont disponibles</strong> dans notre boutique ! Personnalisez vos decks selon vos besoins et votre personnage.') ?>
        </p>
        <p class="text-green-300 text-sm italic">
          <?= __('gameHelp.cards.availability.comingSoon', '✨ Les cartes d\'objets magiques arrivent bientôt, nos gobelins travaillent dur dans nos forges pour vous créer des merveilles !') ?>
        </p>
      </div>

      <!-- ===== EXEMPLES DE CARTES ===== -->
      <div class="bg-gradient-to-r from-slate-900/30 to-gray-900/30 rounded-xl p-8 border border-slate-700/50 mb-16">
        <h3 class="text-3xl font-bold mb-8 text-center text-slate-400"><?= __('gameHelp.cards.examples.title', '🎴 Exemples de Cartes') ?></h3>
        
        <div class="grid md:grid-cols-2 gap-8">
          
          <!-- Exemple Arme -->
          <div class="text-center">
            <h4 class="text-xl font-bold mb-4 text-amber-400"><?= __('gameHelp.cards.examples.weapon.title', 'Carte d\'Arme : Pistolet à Silex') ?></h4>
            <div class="flip-container-card" onclick="flipCardExample('weapon-card')">
              <div class="flipper-card" id="weapon-card">
                <div class="front-card">
                  <img src="/media/products/cards/arme-recto.webp" alt="<?= __('gameHelp.images.weaponCardFront', 'Carte Arme - Recto') ?>" class="card-preview">
                </div>
                <div class="back-card">
                  <img src="/media/products/cards/arme-verso.webp" alt="<?= __('gameHelp.images.weaponCardBack', 'Carte Arme - Verso') ?>" class="card-preview">
                </div>
              </div>
            </div>
            <p class="text-gray-300 text-sm mt-4">
              <?= __('gameHelp.cards.examples.weapon.front', '<strong>Recto :</strong> Illustration, prix, poids, bonus d\'attaque') ?><br>
              <?= __('gameHelp.cards.examples.weapon.back', '<strong>Verso :</strong> Règles détaillées, propriétés spéciales') ?>
            </p>
          </div>
          
          <!-- Exemple Armure -->
          <div class="text-center">
            <h4 class="text-xl font-bold mb-4 text-orange-400"><?= __('gameHelp.cards.examples.armor.title', 'Carte d\'Armure : Armure de Cuir') ?></h4>
            <div class="flip-container-card" onclick="flipCardExample('armor-card')">
              <div class="flipper-card" id="armor-card">
                <div class="front-card">
                  <img src="/media/products/cards/armure-recto.webp" alt="<?= __('gameHelp.images.armorCardFront', 'Carte Armure - Recto') ?>" class="card-preview">
                </div>
                <div class="back-card">
                  <img src="/media/products/cards/armure-verso.webp" alt="<?= __('gameHelp.images.armorCardBack', 'Carte Armure - Verso') ?>" class="card-preview">
                </div>
              </div>
            </div>
            <p class="text-gray-300 text-sm mt-4">
              <?= __('gameHelp.cards.examples.armor.front', '<strong>Recto :</strong> Illustration, prix, poids, CA de base') ?><br>
              <?= __('gameHelp.cards.examples.armor.back', '<strong>Verso :</strong> Modificateurs, restrictions, descriptions') ?>
            </p>
          </div>
        </div>
        
        <div class="text-center mt-8">
          <p class="text-yellow-300 italic">
            <?= __('gameHelp.cards.examples.tip', '💡 <strong>Astuce :</strong> Cliquez sur les cartes pour voir le recto et le verso !') ?>
          </p>
        </div>
      </div>

      <!-- ===== COMMENT UTILISER LES CARTES ===== -->
      <div class="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 rounded-xl p-8 border border-emerald-700/50">
        <h3 class="text-3xl font-bold mb-8 text-center text-emerald-400"><?= __('gameHelp.cards.usage.title', '📋 Comment Utiliser vos Cartes') ?></h3>
        
        <div class="grid md:grid-cols-2 gap-8">
          
          <!-- Pendant le Jeu -->
          <div class="bg-gray-800/50 p-6 rounded-lg">
            <h4 class="text-xl font-bold mb-4 text-emerald-400"><?= __('gameHelp.cards.usage.inGame.title', '🎮 Pendant le Jeu') ?></h4>
            
            <div class="space-y-4">
              <div class="border-l-4 border-emerald-500 pl-4">
                <h5 class="font-semibold text-emerald-300"><?= __('gameHelp.cards.usage.inGame.quickAccess.title', '1. Accès Rapide') ?></h5>
                <p class="text-gray-300 text-sm">
                  <?= __('gameHelp.cards.usage.inGame.quickAccess.list.item1', '• Gardez vos cartes d\'équipement à portée de main') ?><br>
                  <?= __('gameHelp.cards.usage.inGame.quickAccess.list.item2', '• Consultez les propriétés spéciales sans ralentir le jeu') ?><br>
                  <?= __('gameHelp.cards.usage.inGame.quickAccess.list.item3', '• Plus besoin d\'ouvrir les manuels pendant l\'action') ?>
                </p>
              </div>
              
              <div class="border-l-4 border-emerald-500 pl-4">
                <h5 class="font-semibold text-emerald-300"><?= __('gameHelp.cards.usage.inGame.dmShare.title', '2. Partage avec le MJ') ?></h5>
                <p class="text-gray-300 text-sm">
                  <?= __('gameHelp.cards.usage.inGame.dmShare.list.item1', '• Montrez directement vos cartes au MJ') ?><br>
                  <?= __('gameHelp.cards.usage.inGame.dmShare.list.item2', '• Validation immédiate des règles et effets') ?><br>
                  <?= __('gameHelp.cards.usage.inGame.dmShare.list.item3', '• Clarification rapide en cas de doute') ?>
                </p>
              </div>
            </div>
          </div>

          <!-- Organisation -->
          <div class="bg-gray-800/50 p-6 rounded-lg">
            <h4 class="text-xl font-bold mb-4 text-teal-400"><?= __('gameHelp.cards.usage.organization.title', '🗂️ Organisation') ?></h4>
            
            <div class="space-y-4">
              <div class="border-l-4 border-teal-500 pl-4">
                <h5 class="font-semibold text-teal-300"><?= __('gameHelp.cards.usage.organization.categorySort.title', '1. Tri par Catégorie') ?></h5>
                <p class="text-gray-300 text-sm">
                  <?= __('gameHelp.cards.usage.organization.categorySort.list.item1', '• Séparez : Armes, Armures, Équipement, Sorts') ?><br>
                  <?= __('gameHelp.cards.usage.organization.categorySort.list.item2', '• Utilisez des intercalaires ou pochettes') ?><br>
                  <?= __('gameHelp.cards.usage.organization.categorySort.list.item3', '• Gardez les cartes actuelles sur le dessus') ?>
                </p>
              </div>
              
              <div class="border-l-4 border-teal-500 pl-4">
                <h5 class="font-semibold text-teal-300"><?= __('gameHelp.cards.usage.organization.visualInventory.title', '2. Inventaire Visuel') ?></h5>
                <p class="text-gray-300 text-sm">
                  <?= __('gameHelp.cards.usage.organization.visualInventory.list.item1', '• Étalez vos cartes d\'équipement actuel') ?><br>
                  <?= __('gameHelp.cards.usage.organization.visualInventory.list.item2', '• Ajoutez/retirez selon vos acquisitions') ?><br>
                  <?= __('gameHelp.cards.usage.organization.visualInventory.list.item3', '• Inventaire physique = inventaire de personnage') ?>
                </p>
              </div>
            </div>
          </div>
          
        </div>

        <!-- Conseils Pro -->
        <div class="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg p-6 mt-8 border border-yellow-700/50">
          <h4 class="text-xl font-bold mb-4 text-yellow-400"><?= __('gameHelp.cards.usage.proTips.title', '⭐ Conseils de Pro') ?></h4>
          <div class="grid md:grid-cols-3 gap-4">
            <div class="text-center">
              <div class="text-2xl mb-2">🔄</div>
              <p class="text-gray-300 text-sm">
                <?= __('gameHelp.cards.usage.proTips.rotation', '<strong>Rotation :</strong> Changez vos cartes selon vos aventures') ?>
              </p>
            </div>
            <div class="text-center">
              <div class="text-2xl mb-2">🛡️</div>
              <p class="text-gray-300 text-sm">
                <?= __('gameHelp.cards.usage.proTips.protection', '<strong>Protection :</strong> Utilisez des protège-cartes transparents') ?>
              </p>
            </div>
            <div class="text-center">
              <div class="text-2xl mb-2">📝</div>
              <p class="text-gray-300 text-sm">
                <?= __('gameHelp.cards.usage.proTips.notes.main', '<strong>Notes :</strong> Annotez au crayon les modifications temporaires') ?><br>
                <em><?= __('gameHelp.cards.usage.proTips.notes.tip', 'Conseil pro : Utilisez des crayons Staedtler 8B ou 9B pour un marquage optimal') ?></em>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Bouton de retour au hero -->
      <div class="text-center mt-16">
        <a href="#menu-guides" class="btn btn-outline">
          <?= __('gameHelp.cards.backToMain', '⬆️ Retour aux guides principaux') ?>
        </a>
      </div>

    </div>
  </section>

  <!-- ===== GUIDE DE LA MONNAIE D&D ===== -->
  <section class="py-24 bg-gradient-to-r from-yellow-900/80 to-amber-900/80 scroll-mt-24" id="guide-monnaie">
    <div class="max-w-7xl mx-auto px-6">
      
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold mb-8 text-yellow-400">
          <?= __('money.title', '💰 Guide de la Monnaie D&D') ?>
        </h2>
        <p class="text-xl text-gray-300 max-w-4xl mx-auto txt-court">
          <?= __('money.description', 'Découvrez le système monétaire de D&D, nos pièces physiques Geek & Dragon, et utilisez notre convertisseur pour gérer facilement vos finances d\'aventurier !') ?>
        </p>
      </div>

      <!-- ===== SYSTÈME MONÉTAIRE D&D ===== -->
      <div class="grid md:grid-cols-2 gap-8 mb-16">
        
        <!-- Types de Pièces -->
        <div class="bg-gradient-to-b from-amber-900/30 to-yellow-900/20 p-8 rounded-xl border border-amber-700/50">
          <h3 class="text-2xl font-bold mb-6 text-center text-amber-400"><?= __('money.coinTypes.title', '💎 Types de Pièces') ?></h3>
          
          <div class="space-y-4">
            <div class="flex items-center space-x-4 p-3 bg-gray-800/50 rounded-lg">
              <div class="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold">PP</div>
              <div>
                <h4 class="font-semibold text-yellow-400"><?= __('money.coinTypes.platinum.name', '&nbsp;&nbsp;&nbsp;&nbsp;Pièce de Platine (pp)') ?></h4>
                <p class="text-gray-300 text-sm"><?= __('money.coinTypes.platinum.description', '&nbsp;&nbsp;&nbsp;&nbsp;La plus précieuse • 1 pp = 10 po') ?></p>
              </div>
            </div>
            
            <div class="flex items-center space-x-4 p-3 bg-gray-800/50 rounded-lg">
              <div class="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold">PO</div>
              <div>
                <h4 class="font-semibold text-yellow-400"><?= __('money.coinTypes.gold.name', '&nbsp;&nbsp;&nbsp;&nbsp;Pièce d\'Or (po)') ?></h4>
                <p class="text-gray-300 text-sm"><?= __('money.coinTypes.gold.description', '&nbsp;&nbsp;&nbsp;&nbsp;Monnaie de référence • 1 po = 10 pa') ?></p>
              </div>
            </div>
            
            <div class="flex items-center space-x-4 p-3 bg-gray-800/50 rounded-lg">
              <div class="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-black font-bold">PA</div>
              <div>
                <h4 class="font-semibold text-gray-400"><?= __('money.coinTypes.silver.name', '&nbsp;&nbsp;&nbsp;&nbsp;Pièce d\'Argent (pa)') ?></h4>
                <p class="text-gray-300 text-sm"><?= __('money.coinTypes.silver.description', '&nbsp;&nbsp;&nbsp;&nbsp;Monnaie courante • 1 pa = 10 pe') ?></p>
              </div>
            </div>
            
            <div class="flex items-center space-x-4 p-3 bg-gray-800/50 rounded-lg">
              <div class="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">PE</div>
              <div>
                <h4 class="font-semibold text-orange-400"><?= __('money.coinTypes.electrum.name', '&nbsp;&nbsp;&nbsp;&nbsp;Pièce d\'Électrum (pe)') ?></h4>
                <p class="text-gray-300 text-sm"><?= __('money.coinTypes.electrum.description', '&nbsp;&nbsp;&nbsp;&nbsp;Alliage or-argent • 1 pe = 5 pc') ?></p>
              </div>
            </div>
            
            <div class="flex items-center space-x-4 p-3 bg-gray-800/50 rounded-lg">
              <div class="w-12 h-12 bg-orange-800 rounded-full flex items-center justify-center text-white font-bold">PC</div>
              <div>
                <h4 class="font-semibold text-orange-400"><?= __('money.coinTypes.copper.name', '&nbsp;&nbsp;&nbsp;&nbsp;Pièce de Cuivre (pc)') ?></h4>
                <p class="text-gray-300 text-sm"><?= __('money.coinTypes.copper.description', '&nbsp;&nbsp;&nbsp;&nbsp;Menue monnaie • La plus commune') ?></p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tableau de Conversion -->
        <div class="bg-gradient-to-b from-gray-900/30 to-slate-900/20 p-8 rounded-xl border border-slate-700/50">
          <h3 class="text-2xl font-bold mb-6 text-center text-slate-400"><?= __('money.conversionTable.title', '🔄 Tableau de Conversion') ?></h3>
          
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-600">
                  <th class="text-left py-2 text-gray-300"><?= __('money.conversionTable.headers.coin', 'Pièce') ?></th>
                  <th class="text-center py-2 text-yellow-400">PP</th>
                  <th class="text-center py-2 text-yellow-400">PO</th>
                  <th class="text-center py-2 text-gray-400">PA</th>
                  <th class="text-center py-2 text-orange-400">PE</th>
                  <th class="text-center py-2 text-orange-400">PC</th>
                </tr>
              </thead>
              <tbody class="text-gray-300">
                <tr class="border-b border-gray-700">
                  <td class="py-2 font-semibold text-yellow-400"><?= __('money.conversionTable.rows.platinum', 'Platine (pp)') ?></td>
                  <td class="text-center">1</td>
                  <td class="text-center">10</td>
                  <td class="text-center">100</td>
                  <td class="text-center">200</td>
                  <td class="text-center">1000</td>
                </tr>
                <tr class="border-b border-gray-700">
                  <td class="py-2 font-semibold text-yellow-400"><?= __('money.conversionTable.rows.gold', 'Or (po)') ?></td>
                  <td class="text-center">1/10</td>
                  <td class="text-center">1</td>
                  <td class="text-center">10</td>
                  <td class="text-center">20</td>
                  <td class="text-center">100</td>
                </tr>
                <tr class="border-b border-gray-700">
                  <td class="py-2 font-semibold text-gray-400"><?= __('money.conversionTable.rows.silver', 'Argent (pa)') ?></td>
                  <td class="text-center">1/100</td>
                  <td class="text-center">1/10</td>
                  <td class="text-center">1</td>
                  <td class="text-center">2</td>
                  <td class="text-center">10</td>
                </tr>
                <tr class="border-b border-gray-700">
                  <td class="py-2 font-semibold text-orange-400"><?= __('money.conversionTable.rows.electrum', 'Électrum (pe)') ?></td>
                  <td class="text-center">1/200</td>
                  <td class="text-center">1/20</td>
                  <td class="text-center">1/2</td>
                  <td class="text-center">1</td>
                  <td class="text-center">5</td>
                </tr>
                <tr>
                  <td class="py-2 font-semibold text-orange-400"><?= __('money.conversionTable.rows.copper', 'Cuivre (pc)') ?></td>
                  <td class="text-center">1/1000</td>
                  <td class="text-center">1/100</td>
                  <td class="text-center">1/10</td>
                  <td class="text-center">1/5</td>
                  <td class="text-center">1</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ===== CONVERTISSEUR INTERACTIF ===== -->
      <!-- Convertisseur de monnaie Premium (identique à celui de boutique.php) -->
      <div class="mt-12" id="currency-converter-premium">
        <h4 class="text-2xl font-bold text-center text-gray-200 mb-8" data-i18n="shop.converter.title"><?= __('shop.converter.title', '🧮 Convertisseur de monnaie') ?></h4>
        
        <!-- Section 1: Monnaies sources avec design premium -->
        <div class="mb-8">
          <h5 class="text-lg font-semibold text-gray-200 mb-4 text-center" data-i18n="shop.converter.sourcesLabel"><?= __('shop.converter.sourcesLabel', '💰 Monnaies sources') ?></h5>
          <div class="currency-input-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 max-w-6xl mx-auto">
            <div class="currency-input-card bg-gradient-to-br from-amber-900/20 to-orange-800/20 p-4 rounded-xl border border-amber-700/30">
              <label class="block text-amber-300 font-medium mb-2"><?= __('money.converter.labels.copper', '🪙 Cuivre') ?></label>
              <input type="number" min="0" step="1" value="0" data-currency="copper" 
                     class="w-full bg-gray-800/80 text-amber-300 border border-amber-700/50 rounded-lg p-3 text-center font-bold focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
            </div>
            <div class="currency-input-card bg-gradient-to-br from-gray-600/20 to-gray-500/20 p-4 rounded-xl border border-gray-500/30">
              <label class="block text-gray-300 font-medium mb-2"><?= __('money.converter.labels.silver', '🥈 Argent') ?></label>
              <input type="number" min="0" step="1" value="0" data-currency="silver" 
                     class="w-full bg-gray-800/80 text-gray-300 border border-gray-500/50 rounded-lg p-3 text-center font-bold focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all" />
            </div>
            <div class="currency-input-card bg-gradient-to-br from-yellow-600/20 to-green-600/20 p-4 rounded-xl border border-yellow-500/30">
              <label class="block text-yellow-300 font-medium mb-2"><?= __('money.converter.labels.electrum', '⚡ Électrum') ?></label>
              <input type="number" min="0" step="1" value="0" data-currency="electrum" 
                     class="w-full bg-gray-800/80 text-yellow-300 border border-yellow-500/50 rounded-lg p-3 text-center font-bold focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all" />
            </div>
            <div class="currency-input-card bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 p-4 rounded-xl border border-yellow-400/30">
              <label class="block text-yellow-300 font-medium mb-2"><?= __('money.converter.labels.gold', '🥇 Or') ?></label>
              <input type="number" min="0" step="1" value="0" data-currency="gold" 
                     class="w-full bg-gray-800/80 text-yellow-300 border border-yellow-400/50 rounded-lg p-3 text-center font-bold focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all" />
            </div>
            <div class="currency-input-card bg-gradient-to-br from-cyan-500/20 to-blue-600/20 p-4 rounded-xl border border-cyan-400/30">
              <label class="block text-cyan-300 font-medium mb-2"><?= __('money.converter.labels.platinum', '💎 Platine') ?></label>
              <input type="number" min="0" step="1" value="0" data-currency="platinum" 
                     class="w-full bg-gray-800/80 text-cyan-300 border border-cyan-400/50 rounded-lg p-3 text-center font-bold focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all" />
            </div>
          </div>
        </div>

        <!-- Section 2: Tableau multiplicateur interactif toujours visible -->
        <div class="mb-8">
          <h5 class="text-lg font-semibold text-gray-200 mb-4 text-center" data-i18n="shop.converter.multiplierLabel"><?= __('shop.converter.multiplierLabel', '⚖️ Tableau multiplicateur (éditable)') ?></h5>
          <div class="bg-gray-800/50 rounded-xl p-6 max-w-6xl mx-auto border border-gray-700/30">
            <div class="overflow-x-auto">
              <table class="w-full text-gray-200" id="multiplier-table">
                <thead>
                  <tr class="border-b border-gray-600/50">
                    <th class="text-left p-3 text-gray-300"><?= __('shop.converter.currencyLabel', 'Monnaie') ?></th>
                    <th class="text-center p-3 text-gray-300">×1</th>
                    <th class="text-center p-3 text-gray-300">×10</th>
                    <th class="text-center p-3 text-gray-300">×100</th>
                    <th class="text-center p-3 text-gray-300">×1000</th>
                    <th class="text-center p-3 text-gray-300">×10000</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-gray-700/30" data-currency="platinum">
                    <td class="p-3 text-cyan-300 font-medium"><?= __('money.converter.multiplierTable.platinum', '💎 Platine') ?></td>
                    <td class="p-2" data-label="×1"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-cyan-300 border border-cyan-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1"></td>
                    <td class="p-2" data-label="×10"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-cyan-300 border border-cyan-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10"></td>
                    <td class="p-2" data-label="×100"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-cyan-300 border border-cyan-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="100"></td>
                    <td class="p-2" data-label="×1000"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-cyan-300 border border-cyan-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1000"></td>
                    <td class="p-2" data-label="×10000"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-cyan-300 border border-cyan-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10000"></td>
                  </tr>
                  <tr class="border-b border-gray-700/30" data-currency="gold">
                    <td class="p-3 text-yellow-300 font-medium"><?= __('money.converter.multiplierTable.gold', '🥇 Or') ?></td>
                    <td class="p-2" data-label="×1"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-400/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1"></td>
                    <td class="p-2" data-label="×10"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-400/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10"></td>
                    <td class="p-2" data-label="×100"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-400/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="100"></td>
                    <td class="p-2" data-label="×1000"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-400/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1000"></td>
                    <td class="p-2" data-label="×10000"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-400/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10000"></td>
                  </tr>
                  <tr class="border-b border-gray-700/30" data-currency="electrum">
                    <td class="p-3 text-yellow-300 font-medium"><?= __('money.converter.multiplierTable.electrum', '⚡ Électrum') ?></td>
                    <td class="p-2" data-label="×1"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1"></td>
                    <td class="p-2" data-label="×10"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10"></td>
                    <td class="p-2" data-label="×100"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="100"></td>
                    <td class="p-2" data-label="×1000"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1000"></td>
                    <td class="p-2" data-label="×10000"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10000"></td>
                  </tr>
                  <tr class="border-b border-gray-700/30" data-currency="silver">
                    <td class="p-3 text-gray-300 font-medium"><?= __('money.converter.multiplierTable.silver', '🥈 Argent') ?></td>
                    <td class="p-2" data-label="×1"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-gray-300 border border-gray-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1"></td>
                    <td class="p-2" data-label="×10"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-gray-300 border border-gray-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10"></td>
                    <td class="p-2" data-label="×100"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-gray-300 border border-gray-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="100"></td>
                    <td class="p-2" data-label="×1000"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-gray-300 border border-gray-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1000"></td>
                    <td class="p-2" data-label="×10000"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-gray-300 border border-gray-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10000"></td>
                  </tr>
                  <tr data-currency="copper">
                    <td class="p-3 text-amber-300 font-medium"><?= __('money.converter.multiplierTable.copper', '🪙 Cuivre') ?></td>
                    <td class="p-2" data-label="×1"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-amber-300 border border-amber-700/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1"></td>
                    <td class="p-2" data-label="×10"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-amber-300 border border-amber-700/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10"></td>
                    <td class="p-2" data-label="×100"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-amber-300 border border-amber-700/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="100"></td>
                    <td class="p-2" data-label="×1000"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-amber-300 border border-amber-700/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1000"></td>
                    <td class="p-2" data-label="×10000"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-amber-300 border border-amber-700/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10000"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Section 3: Équivalences totales par métal avec recommandations optimales -->
        <div class="mb-8" id="metal-totals-section">
          <h5 class="text-lg font-semibold text-gray-200 mb-4 text-center" data-i18n="shop.converter.equivalences"><?= __('shop.converter.equivalences', '💼 Équivalences totales par métal') ?></h5>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-6xl mx-auto">
            <!-- Première ligne: Cuivre, Argent, Électrum -->
            <div id="copper-card"></div>
            <div id="silver-card"></div>
            <div id="electrum-card"></div>
            
            <!-- Deuxième ligne: Or, Platine, Recommandations optimales -->
            <div id="gold-card"></div>
            <div id="platinum-card"></div>
            <div id="optimal-recommendations" class="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-xl p-6 border border-indigo-500/30">
              <h6 class="text-indigo-300 font-bold text-lg mb-4"><?= __('money.converter.recommendations.title', '✨ Recommandations optimales') ?></h6>
              <div id="currency-best" class="text-gray-200"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== RECOMMANDATIONS DE LOTS DE PIÈCES ===== -->
      <div id="coin-lots-recommendations" class="mt-12 mb-16" style="display: block;">
        <div class="bg-gradient-to-r from-green-900/30 to-emerald-900/20 rounded-xl p-8 border border-green-700/50">
          <h4 class="text-2xl font-bold text-center text-gray-200 mb-8">
            <?= __('money.converter.lotsRecommendedTitle', '🛒 Lots de pièces recommandés') ?>
          </h4>
          
          <div class="max-w-4xl mx-auto">
            <div class="text-center mb-6">
              <p class="text-gray-300 mb-4">
                <?= __('money.converter.lotsRecommendations.description', 'Voici les lots minimaux recommandés pour couvrir exactement vos besoins en pièces physiques :') ?>
              </p>
            </div>
            
            <!-- Contenu des recommandations -->
            <div id="coin-lots-content" class="mb-8">
              <!-- Le contenu sera injecté dynamiquement par JavaScript -->
            </div>
            
            <!-- Bouton d'ajout au panier global -->
            <div class="text-center">
              <button id="add-all-lots-to-cart"
                      class="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                      style="display: none;">

                <?= __('money.converter.lotsRecommendations.addAllButton', 'Ajouter tous les lots au panier') ?>
              </button>
              
              <p class="text-sm text-gray-400 mt-4">
                <?= __('money.converter.lotsRecommendations.optimizationNote', 'Ces recommandations optimisent le nombre de lots nécessaires pour le prix le plus avantageux.') ?>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== TESTS SYSTÈME CONVERTISSEUR (DEBUG) ===== -->
      <div class="bg-gradient-to-r from-blue-900/30 to-indigo-900/20 rounded-xl p-8 border border-blue-700/50 mb-16" id="debug-section" style="display: none;">
        <h3 class="text-3xl font-bold mb-6 text-center text-blue-400"><?= __('money.tests.title', '🔬 Tests du Système de Conversion') ?></h3>
        
        <div class="max-w-4xl mx-auto">
          <p class="text-center text-gray-300 mb-6">
            <?= __('money.converter.debugSection.title', 'Section de débogage pour valider les algorithmes métaheuristiques de conversion et recommandations de lots.') ?>
          </p>
          
          <div class="grid md:grid-cols-2 gap-6 mb-6">
            <button id="run-basic-tests" class="btn btn-primary">
              <?= __('money.tests.basicButton', '🧪 Tests de Base') ?>
            </button>
            <button id="run-advanced-tests" class="btn btn-secondary">
              <?= __('money.tests.advancedButton', '🔬 Tests Avancés') ?>
            </button>
          </div>
          
          <div class="bg-gray-800/50 rounded-lg p-6">
            <div class="flex justify-between items-center mb-4">
              <h4 class="text-xl font-semibold text-blue-300"><?= __('money.tests.results', 'Résultats des Tests') ?></h4>
              <button id="clear-test-results" class="text-sm text-gray-400 hover:text-white">
                🗑️ Effacer
              </button>
            </div>
            <div id="test-results" class="text-sm font-mono">
              <div class="text-gray-400"><?= __('money.tests.noTests', 'Aucun test exécuté...') ?></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== L'IMPORTANCE DU TRÉSOR PHYSIQUE ===== -->
      <div class="bg-gradient-to-r from-amber-900/30 to-yellow-900/20 rounded-xl p-8 border border-amber-700/50 mb-16">
        <div class="grid md:grid-cols-2 gap-16 items-start">
          
          <!-- Image carte de propriété cliquable -->
          <div class="order-2 md:order-1 flex flex-col">
            <div class="bg-gray-800/30 rounded-xl p-6 border border-amber-600/20">
              <div class="relative group cursor-pointer" onclick="downloadMoneySheet()">
                <img src="/media/content/carte_propriete.webp" alt="<?= __('gameHelp.images.propertyCard', 'Carte de propriété des pièces Geek & Dragon') ?>" 
                     class="rounded-lg shadow-lg w-full object-cover border border-amber-600/30 transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105" loading="lazy">
                
                <!-- Overlay de téléchargement au survol -->
                <div class="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div class="text-center text-white">
                    <div class="text-3xl mb-2">📥</div>
                    <div class="font-bold text-lg"><?= __('money.download.button', 'Télécharger') ?></div>
                    <div class="text-sm text-amber-300"><?= __('money.download.subtitle', 'Fiche à imprimer') ?></div>
                  </div>
                </div>
              </div>
              
              <div class="mt-4 text-center">
                <p class="text-amber-300 font-medium mb-2"><?= __('money.download.subtitle', '📄 Fiche de Monnaie officielle') ?></p>
                <p class="text-xs text-gray-400 mb-3"><?= __('money.download.instruction', 'Cliquez sur l\'image pour télécharger la fiche à imprimer') ?></p>
                
                <button onclick="downloadMoneySheet()" 
                        class="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                  <?= __('money.download.downloadSheet', '📥 Télécharger la fiche') ?>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Texte explicatif avec plus d'espacement -->
          <div class="order-1 md:order-2 space-y-8 flex flex-col justify-center px-4 md:px-8">
            <h3 class="text-3xl font-bold text-amber-400"><?= __('money.physicalTreasure.title', '🏆 Pourquoi le Trésor Physique ?') ?></h3>
            
            <div class="space-y-6 text-gray-300">
              <blockquote class="text-lg font-medium text-amber-300 italic border-l-4 border-amber-500 pl-6 bg-amber-900/10 py-4 rounded-r-lg">
                "<?= __('gameHelp.quotes.monopoly', 'S\'il n\'y avait plus de billets dans le Monopoly, le jeu perdrait tout son intérêt...') ?>"
              </blockquote>
              
              <div class="space-y-4">
                <p class="text-base leading-relaxed">
                  <?= __('money.physicalTreasure.paragraph1', 'Dans Donjons & Dragons, les <strong class="text-amber-400">deux objectifs principaux</strong> sont l\'expérience et le trésor. Devoir écrire le trésor sur papier puis le gommer ne lui rend pas hommage. Le trésor mérite d\'être <strong class="text-yellow-400">tangible, pesé, manipulé</strong>.') ?>
                </p>
                
                <p class="text-base leading-relaxed">
                  <?= __('money.physicalTreasure.paragraph2', 'Nos pièces physiques transforment chaque récompense en moment mémorable. Quand le MJ fait <em class="text-amber-300">tinter les pièces d\'or</em> dans sa main avant de les distribuer, c\'est toute l\'immersion qui s\'intensifie.') ?>
                </p>
              </div>
              
              <div class="bg-amber-900/20 p-6 rounded-lg border border-amber-600/30 mt-8">
                <h4 class="text-lg font-bold text-amber-400 mb-4 flex items-center justify-between">
                  <span><?= __('money.physicalTreasure.property', '📋 Système de Propriété') ?></span>
                  <button onclick="downloadMoneySheet()" class="text-xs bg-amber-600 hover:bg-amber-700 px-3 py-1 rounded-full transition-colors">
                    <?= __('money.download.button', '📥 Télécharger') ?>
                  </button>
                </h4>
                <p class="text-sm leading-relaxed">
                  <?= __('money.physicalTreasure.sheetInstructions', 'Utilisez notre <strong>fiche de monnaie</strong> pour répertorier vos trésors. Inscrivez votre nom, comptez vos pièces, signez et remettez au MJ. En fin de campagne, récupérez facilement votre investissement !') ?>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== PIÈCES PHYSIQUES GEEK & DRAGON ===== -->
      <div id="pieces-physiques" class="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-xl p-8 border border-purple-700/50 scroll-mt-24">
        <h3 class="text-3xl font-bold mb-8 text-center text-purple-400"><?= __('money.physicalCoins.title', '🪙 Pièces Physiques Geek & Dragon') ?></h3>

        <!-- Section explicative complète du système -->
        <div class="bg-gradient-to-br from-amber-900/30 to-yellow-900/20 rounded-xl p-8 border border-amber-600/30 mb-8">
          <div class="text-gray-200 space-y-6">
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h4 class="text-xl font-bold text-amber-400 mb-4"><?= __('money.physicalCoins.system.title', '💰 Le Système Monétaire D&D') ?></h4>
                <p class="text-base leading-relaxed mb-4">
                  <?= __('money.physicalCoins.system.paragraph1', 'Dans D&D, la monnaie utilise <strong class="text-amber-300">5 métaux différents</strong> : cuivre (pc), argent (pa), électrum (pe), or (po) et platine (pp). Les conversions de base sont : 10 pc = 1 pa, 2 pa = 1 pe, 5 pa = 1 po, et 10 po = 1 pp.') ?>
                </p>
                <p class="text-base leading-relaxed">
                  <?= __('money.physicalCoins.system.paragraph2', 'Nos pièces physiques ajoutent une dimension immersive : chaque pièce peut avoir un <strong class="text-yellow-300">multiplicateur gravé</strong> (×1, ×10, ×100, ×1000, ×10000). Une pièce d\'or ×100 vaut 100 po — parfait pour gérer de gros trésors sans manipuler des centaines de pièces !') ?>
                </p>
              </div>

              <div>
                <h4 class="text-xl font-bold text-amber-400 mb-4"><?= __('money.physicalCoins.weight.title', '⚖️ Poids Authentiques') ?></h4>
                <p class="text-base leading-relaxed mb-4">
                  <?= __('money.physicalCoins.weight.paragraph', 'Selon les règles officielles D&D, <strong class="text-amber-300">50 pièces = 500g/1 lb</strong>. Nos multiplicateurs représentent fidèlement ces valeurs et leur poids pour une immersion totale :') ?>
                </p>
              </div>
            </div>

            <!-- Tableau des poids -->
            <div class="bg-gray-800/50 rounded-lg p-6 border border-amber-500/20">
              <h4 class="text-lg font-bold text-amber-400 mb-4 text-center"><?= __('money.physicalCoins.weightTable.title', '📊 Tableau des poids par multiplicateur') ?></h4>
              <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                  <thead class="text-amber-300 border-b border-amber-500/30">
                    <tr>
                      <th class="py-2 px-3 font-semibold">Multiplicateur</th>
                      <th class="py-2 px-3 font-semibold">Poids (g)</th>
                      <th class="py-2 px-3 font-semibold">Poids (lb)</th>
                      <th class="py-2 px-3 font-semibold">Équivalent</th>
                    </tr>
                  </thead>
                  <tbody class="text-gray-300">
                    <tr class="border-b border-gray-700/50">
                      <td class="py-2 px-3">×1</td>
                      <td class="py-2 px-3">10 g</td>
                      <td class="py-2 px-3">0.02 lb</td>
                      <td class="py-2 px-3 text-gray-400">1 pièce standard</td>
                    </tr>
                    <tr class="border-b border-gray-700/50">
                      <td class="py-2 px-3">×10</td>
                      <td class="py-2 px-3">100 g</td>
                      <td class="py-2 px-3">0.22 lb</td>
                      <td class="py-2 px-3 text-gray-400">10 pièces</td>
                    </tr>
                    <tr class="border-b border-gray-700/50 bg-amber-900/10">
                      <td class="py-2 px-3 font-semibold text-yellow-300">×100</td>
                      <td class="py-2 px-3 font-semibold text-yellow-300">1 kg</td>
                      <td class="py-2 px-3 font-semibold text-yellow-300">2.2 lb</td>
                      <td class="py-2 px-3 text-gray-400">100 pièces</td>
                    </tr>
                    <tr class="border-b border-gray-700/50 bg-amber-900/10">
                      <td class="py-2 px-3 font-semibold text-yellow-400">×1000</td>
                      <td class="py-2 px-3 font-semibold text-yellow-400">10 kg</td>
                      <td class="py-2 px-3 font-semibold text-yellow-400">22 lb</td>
                      <td class="py-2 px-3 text-gray-400">1000 pièces</td>
                    </tr>
                    <tr>
                      <td class="py-2 px-3">×10000</td>
                      <td class="py-2 px-3">100 kg</td>
                      <td class="py-2 px-3">220 lb</td>
                      <td class="py-2 px-3 text-gray-400">10000 pièces</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p class="text-sm text-gray-400 mt-3 italic text-center">
                <?= __('money.physicalCoins.weightTable.note', 'Ressentez le poids croissant du trésor entre vos mains !') ?>
              </p>
              <div class="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded text-center">
                <p class="text-sm text-blue-300">
                  <?= __('money.physicalCoins.weightTable.notice', '📌 Ces multiplicateurs s\'appliquent à <strong>n\'importe quel métal</strong> (cuivre, argent, électrum, or, platine)') ?>
                </p>
              </div>
            </div>

            <!-- Exemple concret -->
            <div class="bg-gray-800/50 rounded-lg p-6 border border-amber-500/20">
              <h4 class="text-xl font-bold text-amber-400 mb-4"><?= __('money.physicalCoins.example.title', '💡 Exemple concret avec de l\'or : trésor de 1 500 po') ?></h4>
              <p class="text-base leading-relaxed mb-3">
                <?= __('money.physicalCoins.example.text', 'Plutôt que d\'empiler <strong class="text-red-400">1 500 pièces unitaires</strong> (15 kg / 33 lb), utilisez :') ?>
              </p>
              <ul class="list-none space-y-2 text-base">
                <li class="flex items-start">
                  <span class="text-yellow-400 mr-3 text-xl">→</span>
                  <span><?= __('money.physicalCoins.example.item1', '<strong class="text-yellow-400">1 pièce d\'or ×1000</strong> → 1000 po (10 kg / 22 lb)') ?></span>
                </li>
                <li class="flex items-start">
                  <span class="text-yellow-300 mr-3 text-xl">→</span>
                  <span><?= __('money.physicalCoins.example.item2', '<strong class="text-yellow-300">5 pièces d\'or ×100</strong> → 500 po (5 kg / 11 lb)') ?></span>
                </li>
              </ul>
              <p class="text-sm text-gray-300 mt-4 p-3 bg-green-900/20 border border-green-600/30 rounded">
                <?= __('money.physicalCoins.example.result', '<strong class="text-green-400">Résultat : 6 pièces physiques</strong> au lieu de 1 500 !') ?>
              </p>
            </div>
          </div>
        </div>

        <!-- Grille originale -->
        <div class="grid md:grid-cols-2 gap-8">

          <!-- Description -->
          <div class="space-y-6">
            <div>
              <h4 class="text-xl font-bold mb-4 text-purple-400"><?= __('money.physicalCoins.authentic.title', '✨ Des Pièces Authentiques') ?></h4>
              <p class="text-gray-300 mb-4">
                <?= __('money.converter.coinDescription.faithfulReproduction', 'Nos pièces métalliques reproduisent fidèlement le système monétaire de D&D. Chaque type de pièce a son propre design et sa finition unique.') ?>
              </p>
              <ul class="text-gray-300 space-y-2">
                <li><?= __('money.physicalCoins.authentic.feature1', '• <strong>Métal véritable</strong> avec finitions spécifiques') ?></li>
                <li><?= __('money.physicalCoins.authentic.feature2', '• <strong>Gravures détaillées</strong> inspirées de l\'univers D&D') ?></li>
                <li><?= __('money.physicalCoins.authentic.feature3', '• <strong>Poids authentique</strong> pour une expérience immersive') ?></li>
                <li><?= __('money.physicalCoins.authentic.feature4', '• <strong>Sets complets</strong> ou pièces individuelles') ?></li>
              </ul>
            </div>

            <div>
              <h4 class="text-xl font-bold mb-4 text-purple-400"><?= __('money.physicalCoins.gameUse.title', '🎯 Utilisation en Jeu') ?></h4>
              <ul class="text-gray-300 space-y-2">
                <li><?= __('money.physicalCoins.gameUse.feature2', '• <strong>Immersion totale</strong> lors des transactions') ?></li>
                <li><?= __('money.physicalCoins.uses.feature5', '• <strong>Gestion tactile</strong> de votre trésor') ?></li>
                <li><?= __('money.physicalCoins.gameUse.feature1', '• <strong>Récompenses physiques</strong> pour les joueurs') ?></li>
                <li><?= __('money.physicalCoins.gameUse.feature3', '• <strong>Ambiance médiévale-fantastique</strong> renforcée') ?></li>
              </ul>
            </div>
          </div>

          <!-- Call to Action -->
          <div class="flex flex-col justify-center">
            <div class="bg-gradient-to-r from-yellow-900/30 to-amber-900/30 rounded-lg p-6 border border-yellow-600/50 text-center">
              <h4 class="text-xl font-bold mb-4 text-yellow-400"><?= __('money.physicalCoins.order.title', '💰 Commandez vos Pièces') ?></h4>
              <p class="text-gray-300 mb-6">
                <?= __('money.physicalCoins.order.description', 'Découvrez notre collection complète de pièces métalliques et donnez vie à l\'économie de vos parties !') ?>
              </p>
              <div class="space-y-4">
                <a href="<?= langUrl('boutique.php#pieces') ?>" class="btn btn-primary w-full">
                  <?= __('money.physicalCoins.order.shopButton', '🛒 Voir les Pièces en Boutique') ?>
                </a>
                <a href="<?= langUrl('product.php?id=coin-lord-treasury-uniform&from=pieces') ?>" class="btn btn-outline w-full">
                  <?= __('money.physicalCoins.order.treasuryButton', '⭐ Set Complet de Trésorerie') ?>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Bouton de retour au hero -->
      <div class="text-center mt-16">
        <a href="#menu-guides" class="btn btn-outline">
          <?= __('money.backToMain', '⬆️ Retour aux guides principaux') ?>
        </a>
      </div>

    </div>
  </section>

  <!-- ===== CALL TO ACTION ===== -->
  <section class="py-16 bg-gray-900/80">
    <div class="max-w-4xl mx-auto px-6 text-center">
      <h2 class="text-3xl font-bold mb-6 text-indigo-400"><?= __('callToAction.title', 'Prêt à révolutionner vos parties ?') ?></h2>
      <p class="text-xl text-gray-300 mb-8 txt-court">
        <?= __('callToAction.description', 'Découvrez notre collection complète : triptyques, cartes d\'équipement et pièces métalliques. Transformez votre expérience de jeu de rôle avec nos accessoires artisanaux conçus au Québec.') ?>
      </p>
      
      <div class="flex flex-col md:flex-row gap-4 justify-center">
        <a href="<?= langUrl('boutique.php#triptyques') ?>" class="btn btn-primary text-lg px-6 py-4">
          <?= __('callToAction.buttons.triptychs', '📁 Triptyques') ?>
        </a>
        <a href="<?= langUrl('boutique.php#cartes') ?>" class="btn btn-primary text-lg px-6 py-4">
          <?= __('callToAction.buttons.cards', '🃏 Cartes d\'Équipement') ?>
        </a>
        <a href="<?= langUrl('boutique.php#pieces') ?>" class="btn btn-primary text-lg px-6 py-4">
          <?= __('callToAction.buttons.coins', '🪙 Pièces Métalliques') ?>
        </a>
        <a href="<?= langUrl('boutique.php') ?>" class="btn btn-outline text-lg px-6 py-4">
          <?= __('callToAction.buttons.shop', '🛒 Voir toute la boutique') ?>
        </a>
      </div>
    </div>
  </section>

</main>

<?php include 'footer.php'; ?>

<script>
  // Exposer les données des produits pour le système de recommandation
  window.products = <?= json_encode($products_data) ?>;
</script>
<!-- Scripts chargés automatiquement via footer.php -->
<script>
// Fonction pour retourner les cartes (triptyques)
function flipCard(cardId) {
    const container = document.getElementById(cardId);
    container.classList.toggle('flipped');
}

// Fonction pour retourner les cartes à jouer
function flipCardExample(cardId) {
    const container = document.getElementById(cardId).parentElement;
    container.classList.toggle('flipped');
}

// Convertisseur de monnaie D&D
const currencyRates = {
    pp: 1000,    // 1 pp = 1000 pc
    po: 100,     // 1 po = 100 pc
    pa: 10,      // 1 pa = 10 pc
    pe: 5,       // 1 pe = 5 pc
    pc: 1        // 1 pc = 1 pc
};

function convertCurrency(fromCurrency) {
    // Récupérer la valeur saisie
    const inputValue = parseFloat(document.getElementById(`input-${fromCurrency}`).value) || 0;
    
    // Convertir tout en pièces de cuivre (base)
    const totalCopper = inputValue * currencyRates[fromCurrency];
    
    // Calculer les équivalences
    const pp = Math.floor(totalCopper / currencyRates.pp);
    const po = Math.floor(totalCopper / currencyRates.po);
    const pa = Math.floor(totalCopper / currencyRates.pa);
    const pe = Math.floor(totalCopper / currencyRates.pe);
    const pc = totalCopper;
    
    // Calculer la valeur en or pour l'affichage principal
    const totalGold = totalCopper / currencyRates.po;
    
    // Mettre à jour l'affichage
    const lang = document.documentElement.lang || 'fr';
    const locale = lang === 'en' ? 'en-US' : 'fr-FR';
    
    // Obtenir les abréviations de monnaie selon la langue
    const abbrevs = {
      fr: { platinum: 'pp', gold: 'po', silver: 'pa', electrum: 'pe', copper: 'pc' },
      en: { platinum: 'pp', gold: 'gp', silver: 'sp', electrum: 'ep', copper: 'cp' }
    }[lang] || { platinum: 'pp', gold: 'po', silver: 'pa', electrum: 'pe', copper: 'pc' };
    
    document.getElementById('total-po').textContent = `${totalGold.toLocaleString(locale, {maximumFractionDigits: 2})} ${abbrevs.gold}`;
    document.getElementById('result-pp').textContent = `${pp.toLocaleString(locale)} ${abbrevs.platinum}`;
    document.getElementById('result-po').textContent = `${po.toLocaleString(locale)} ${abbrevs.gold}`;
    document.getElementById('result-pa').textContent = `${pa.toLocaleString(locale)} ${abbrevs.silver}`;
    document.getElementById('result-pe').textContent = `${pe.toLocaleString(locale)} ${abbrevs.electrum}`;
    document.getElementById('result-pc').textContent = `${pc.toLocaleString(locale)} ${abbrevs.copper}`;
    
    // Effacer les autres champs (éviter la confusion)
    Object.keys(currencyRates).forEach(currency => {
        if (currency !== fromCurrency) {
            const input = document.getElementById(`input-${currency}`);
            if (input.value !== '') {
                input.value = '';
            }
        }
    });
}

function clearConverter() {
    // Effacer tous les champs
    Object.keys(currencyRates).forEach(currency => {
        document.getElementById(`input-${currency}`).value = '';
    });
    
    // Remettre à zéro l'affichage
    const lang = document.documentElement.lang || 'fr';
    const abbrevs = {
      fr: { platinum: 'pp', gold: 'po', silver: 'pa', electrum: 'pe', copper: 'pc' },
      en: { platinum: 'pp', gold: 'gp', silver: 'sp', electrum: 'ep', copper: 'cp' }
    }[lang] || { platinum: 'pp', gold: 'po', silver: 'pa', electrum: 'pe', copper: 'pc' };
    
    document.getElementById('total-po').textContent = `0 ${abbrevs.gold}`;
    document.getElementById('result-pp').textContent = `0 ${abbrevs.platinum}`;
    document.getElementById('result-po').textContent = `0 ${abbrevs.gold}`;
    document.getElementById('result-pa').textContent = `0 ${abbrevs.silver}`;
    document.getElementById('result-pe').textContent = `0 ${abbrevs.electrum}`;
    document.getElementById('result-pc').textContent = `0 ${abbrevs.copper}`;
}

// Fonctions pour le lanceur de dés
function rollStat(statName) {
    // Lancer 4d6 et garder les 3 meilleurs
    const rolls = [];
    for (let i = 0; i < 4; i++) {
        rolls.push(Math.floor(Math.random() * 6) + 1);
    }
    
    // Trier en ordre décroissant et garder les 3 premiers
    rolls.sort((a, b) => b - a);
    const total = rolls[0] + rolls[1] + rolls[2];
    
    // Animation de lancement
    const resultElement = document.getElementById(statName + '-result');
    let animationCount = 0;
    
    const animationInterval = setInterval(() => {
        resultElement.textContent = Math.floor(Math.random() * 18) + 3;
        animationCount++;
        
        if (animationCount > 10) {
            clearInterval(animationInterval);
            resultElement.textContent = total;
            
            // Colorer selon la qualité du résultat
            resultElement.classList.remove('text-red-500', 'text-yellow-500', 'text-green-500');
            if (total >= 15) {
                resultElement.classList.add('text-green-400');
            } else if (total >= 12) {
                resultElement.classList.add('text-yellow-400');
            } else {
                resultElement.classList.add('text-red-400');
            }
            
            // Effet de mise en évidence
            resultElement.style.transform = 'scale(1.2)';
            setTimeout(() => {
                resultElement.style.transform = 'scale(1)';
            }, 300);
        }
    }, 80);
}

function rollAllStats() {
    const stats = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

    // Lancer chaque caractéristique avec un petit délai
    stats.forEach((stat, index) => {
        setTimeout(() => {
            rollStat(stat);
        }, index * 200);
    });
}

function setupIntersectionAnimation(elements, {
    observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    datasetKey = 'revealed',
    onEnter = () => {},
    onPrepare,
    onSetup,
    fallbackDelay = 1500
} = {}) {
    if (!elements || elements.length === 0) {
        return;
    }

    const datasetProperty = datasetKey;
    const isMobileView = typeof window.matchMedia === 'function'
        ? window.matchMedia('(max-width: 768px)').matches
        : false;

    const context = { isMobileView };

    elements.forEach(el => {
        if (typeof onSetup === 'function') {
            onSetup(el, context);
        }
    });

    const markAsRevealed = (el) => {
        if (el.dataset[datasetProperty] === 'true') {
            return;
        }
        el.dataset[datasetProperty] = 'true';
        onEnter(el, context);
    };

    if (!('IntersectionObserver' in window) || isMobileView) {
        elements.forEach(markAsRevealed);
        return;
    }

    let fallbackTimer = null;

    const checkAllRevealed = () => {
        if (fallbackTimer && elements.every(el => el.dataset[datasetProperty] === 'true')) {
            clearTimeout(fallbackTimer);
            fallbackTimer = null;
        }
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                markAsRevealed(entry.target);
                obs.unobserve(entry.target);
            }
        });
        checkAllRevealed();
    }, observerOptions);

    elements.forEach(el => {
        if (typeof onPrepare === 'function') {
            onPrepare(el, context);
        }
        observer.observe(el);
    });

    fallbackTimer = window.setTimeout(() => {
        elements.forEach(markAsRevealed);
        checkAllRevealed();
    }, fallbackDelay);
}

// Smooth scroll pour les ancres
document.addEventListener('DOMContentLoaded', function() {
    // Gestion des liens avec smooth scroll
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Animation d'apparition des éléments au scroll
    const elementsToAnimate = document.querySelectorAll('.usage-step, .card-product');

    setupIntersectionAnimation(elementsToAnimate, {
        datasetKey: 'usageAnimationVisible',
        onSetup: (el) => {
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        },
        onPrepare: (el) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
        },
        onEnter: (el) => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        },
        fallbackDelay: 2000
    });
});

// Fonction simple de téléchargement des fiches de monnaie
function downloadMoneySheet() {
    // Créer un popup de confirmation dans le style du site
    const popup = document.createElement('div');
    popup.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center';
    popup.innerHTML = `
        <div class="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-amber-600/30">
            <div class="text-center mb-6">
                <div class="text-4xl mb-3">📥</div>
                <h3 class="text-xl font-bold text-amber-400 mb-2"><?= __('money.download.title', 'Télécharger la Fiche de Monnaie') ?></h3>
                <p class="text-gray-300 text-sm">
                    <?= __('money.download.description', 'Téléchargez l\'image de la fiche de monnaie pour l\'imprimer chez vous') ?>
                </p>
            </div>
            
            <div class="bg-amber-900/20 p-4 rounded-lg border border-amber-600/30 mb-4">
                <h4 class="font-bold text-amber-400 mb-2"><?= __('money.download.printTip', '💡 Conseil d\'impression :') ?></h4>
                <p class="text-sm text-gray-300">
                    <?= __('money.download.instructions', 'Imprimez sur du papier cartonné (200-250g) pour une meilleure durabilité. Vous pouvez plastifier la fiche pour une utilisation répétée.') ?>
                </p>
            </div>
            
            <div class="flex gap-3">
                <button onclick="confirmDownload()" class="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    <?= __('money.download.confirmButton', '📥 Télécharger') ?>
                </button>
                <button onclick="closeDownloadPopup()" class="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    <?= __('money.download.cancelButton', 'Annuler') ?>
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    document.body.style.overflow = 'hidden';
    window.currentDownloadPopup = popup;
}

function closeDownloadPopup() {
    if (window.currentDownloadPopup) {
        document.body.removeChild(window.currentDownloadPopup);
        document.body.style.overflow = 'auto';
        window.currentDownloadPopup = null;
    }
}

function confirmDownload() {
    // Lancer le téléchargement
    const link = document.createElement('a');
    link.href = '/media/content/carte_propriete.webp';
    link.download = 'fiche-monnaie-geek-dragon.webp';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Fermer le popup
    closeDownloadPopup();
}
</script>

<script>
// Gestionnaire pour le bouton d'ajout au panier (utilise les utilitaires réutilisables)
document.addEventListener('DOMContentLoaded', function() {
  const addToCartButton = document.getElementById('add-all-lots-to-cart');
  
  if (addToCartButton) {
    addToCartButton.addEventListener('click', function() {
      const lotsData = JSON.parse(this.dataset.lotsData || '[]');
      
      if (lotsData.length === 0) {
        const lang = document.documentElement.lang || 'fr';
        const message = lang === 'en' ? 
          '<?= __('money.converter.lotsRecommendations.noLotsMessage', 'Aucun lot à ajouter au panier.') ?>' :
          '<?= __('money.converter.lotsRecommendations.noLotsMessage', 'Aucun lot à ajouter au panier.') ?>';
        alert(message);
        return;
      }
      
      // Convertir les données en format SnipcartUtils
      const productsToAdd = lotsData.map(lot => {
        const product = window.products?.[lot.productId];
        
        // Fonction de traduction des métaux anglais -> français
        const translateMetal = (englishMetal) => {
          const metalTranslations = {
            'copper': 'cuivre',
            'silver': 'argent', 
            'electrum': 'électrum',
            'gold': 'or',
            'platinum': 'platine'
          };
          return metalTranslations[englishMetal] || englishMetal;
        };
        
        // Convertir customFields du format CoinLotOptimizer vers format SnipcartUtils
        const convertedCustomFields = {};
        let customIndex = 1;
        
        if (lot.customFields) {
          Object.entries(lot.customFields).forEach(([fieldKey, fieldData]) => {
            if (fieldData.role === 'metal') {
              convertedCustomFields[`custom${customIndex}`] = {
                name: 'Métal',
                type: 'dropdown', 
                options: 'cuivre|argent|électrum|or|platine',
                value: translateMetal(fieldData.value) // TRADUCTION AJOUTÉE
              };
              customIndex++;
            } else if (fieldData.role === 'multiplier') {
              convertedCustomFields[`custom${customIndex}`] = {
                name: 'Multiplicateur',
                type: 'dropdown',
                options: '1|10|100|1000|10000', 
                value: fieldData.value.toString()
              };
              customIndex++;
            }
          });
        }
        
        return {
          product: {
            id: lot.productId,
            name: product?.name || lot.productId, // Utiliser le nom de base du produit
            summary: product?.summary || `<?= __('money.converter.productSummary', 'Lot de pièces D&D') ?> - ${product?.name || lot.productId}`,
            price: lot.price,
            url: lot.url || `product.php?id=${encodeURIComponent(lot.productId)}`
          },
          quantity: lot.quantity,
          customFields: convertedCustomFields
        };
      });
      
      // Utiliser les utilitaires Snipcart pour ajouter au panier
      if (window.SnipcartUtils) {
        window.SnipcartUtils.addMultipleToCart(productsToAdd, (added, total) => {
          if (added === total) {
            const lang = document.documentElement.lang || 'fr';
            const message = lang === 'en' ? 
              `${total} product(s) added to cart successfully!` : 
              `${total} produit(s) ajouté(s) au panier avec succès !`;
            
            // Afficher un message de succès plus élégant
            const successDiv = document.createElement('div');
            successDiv.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
            successDiv.innerHTML = `
              <div class="flex items-center gap-2">
                <span class="text-xl">✅</span>
                <span>${message}</span>
              </div>
            `;
            
            document.body.appendChild(successDiv);
            
            // Animation d'entrée
            setTimeout(() => {
              successDiv.style.transform = 'translateX(0)';
            }, 100);
            
            // Animation de sortie et suppression
            setTimeout(() => {
              successDiv.style.transform = 'translateX(full)';
              setTimeout(() => {
                if (successDiv.parentNode) {
                  successDiv.parentNode.removeChild(successDiv);
                }
              }, 300);
            }, 3000);
          }
        });
      } else {
        console.error('SnipcartUtils non disponible');
        alert("Erreur : impossible d'ajouter au panier");
      }
    });
  }

  // ===== INTÉGRATION DES TESTS SYSTÈME =====
  
  // Afficher/masquer la section de tests avec raccourci clavier
  let debugSectionVisible = false;
  
  // Raccourci clavier Ctrl+Shift+T pour afficher les tests
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'T') {
      e.preventDefault();
      debugSectionVisible = !debugSectionVisible;
      const debugSection = document.getElementById('debug-section');
      if (debugSection) {
        debugSection.style.display = debugSectionVisible ? 'block' : 'none';
        if (debugSectionVisible) {
          debugSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  });

  // Gestionnaires des boutons de test
  const runBasicTestsBtn = document.getElementById('run-basic-tests');
  const runAdvancedTestsBtn = document.getElementById('run-advanced-tests');
  const clearResultsBtn = document.getElementById('clear-test-results');
  const testResults = document.getElementById('test-results');

  if (runBasicTestsBtn) {
    runBasicTestsBtn.addEventListener('click', function() {
      if (window.CurrencyConverterTests) {
        testResults.innerHTML = "<div class=\"text-yellow-400\"><?= __('money.tests.runningBasic', 'Exécution des tests de base...') ?></div>";
        
        setTimeout(() => {
          const results = window.CurrencyConverterTests.runBasicTests();
          displayTestResults(results, '<?= __('money.tests.basic', 'Tests de Base') ?>');
        }, 100);
      } else {
        testResults.innerHTML = "<div class=\"text-red-400\"><?= __('money.tests.notAvailable', '❌ CurrencyConverterTests non disponible') ?></div>";
      }
    });
  }

  if (runAdvancedTestsBtn) {
    runAdvancedTestsBtn.addEventListener('click', function() {
      if (window.CurrencyConverterTests) {
        testResults.innerHTML = "<div class=\"text-yellow-400\"><?= __('money.tests.runningAdvanced', 'Exécution des tests avancés...') ?></div>";
        
        setTimeout(() => {
          const results = window.CurrencyConverterTests.runAdvancedTests();
          displayTestResults(results, '<?= __('money.tests.advanced', 'Tests Avancés') ?>');
        }, 100);
      } else {
        testResults.innerHTML = "<div class=\"text-red-400\"><?= __('money.tests.notAvailable', '❌ CurrencyConverterTests non disponible') ?></div>";
      }
    });
  }

  if (clearResultsBtn) {
    clearResultsBtn.addEventListener('click', function() {
      testResults.innerHTML = "<div class=\"text-gray-400\"><?= __('money.tests.noTests', 'Aucun test exécuté...') ?></div>";
    });
  }

  function displayTestResults(results, testType) {
    if (!results) {
      testResults.innerHTML = "<div class=\"text-red-400\"><?= __('money.tests.error', '❌ Erreur lors de l\'exécution des tests') ?></div>";
      return;
    }

    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    const success = passed === total;

    let html = `<div class="mb-4">
      <div class="text-lg font-semibold ${success ? 'text-green-400' : 'text-red-400'}">
        ${testType}: ${passed}/${total} <?= __('money.tests.successText', 'tests réussis') ?> ${success ? '✅' : '❌'}
      </div>
    </div>`;

    results.forEach((result, index) => {
      const statusClass = result.passed ? 'text-green-400' : 'text-red-400';
      const statusIcon = result.passed ? '✅' : '❌';
      
      html += `<div class="mb-3 p-3 bg-gray-700/50 rounded">
        <div class="${statusClass} font-semibold">
          ${statusIcon} Test ${index + 1}: ${result.name}
        </div>`;
      
      if (result.details) {
        html += `<div class="text-gray-300 text-xs mt-1 pl-4">${result.details}</div>`;
      }
      
      if (!result.passed && result.error) {
        html += `<div class="text-red-300 text-xs mt-1 pl-4"><?= __('money.tests.errorLabel', 'Erreur') ?>: ${result.error}</div>`;
      }
      
      html += '</div>';
    });

    // Ajouter un résumé de performance si disponible
    const timeData = results.find(r => r.timing);
    if (timeData && timeData.timing) {
      html += `<div class="mt-4 p-3 bg-blue-900/30 rounded text-blue-300">
        <div class="font-semibold">⏱️ <?= __('money.tests.performance', 'Performance') ?></div>
        <div class="text-xs"><?= __('money.tests.totalTime', 'Temps total') ?>: ${timeData.timing}ms</div>
      </div>`;
    }

    testResults.innerHTML = html;
  }

  // Auto-run tests basiques au chargement si en mode debug
  if (window.location.hash === '#debug' || window.location.search.includes('debug=1')) {
    debugSectionVisible = true;
    const debugSection = document.getElementById('debug-section');
    if (debugSection) {
      debugSection.style.display = 'block';
      
      // Attendre que tous les scripts soient chargés
      setTimeout(() => {
        if (runBasicTestsBtn) runBasicTestsBtn.click();
      }, 1000);
    }
  }
  
  // Ajouter des animations de scroll et d'apparition
  const sectionsToAnimate = document.querySelectorAll('section, .card-product, .navigation-rapide a');

  setupIntersectionAnimation(sectionsToAnimate, {
    datasetKey: 'sectionAnimationVisible',
    onPrepare: (el) => {
      el.style.opacity = '0';
    },
    onEnter: (el) => {
      el.style.animation = 'floatUp 0.6s ease-out';
      el.style.opacity = '1';
    },
    fallbackDelay: 2000
  });
  
  // Améliorer les effets hover sur les cartes de navigation
  document.querySelectorAll('.navigation-rapide a').forEach(card => {
    card.classList.add('section-hover');
  });
});

// Fonction pour créer un effet de particules
function createParticleEffect(element, color) {
  const rect = element.getBoundingClientRect();
  
  for (let i = 0; i < 6; i++) {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.left = rect.left + rect.width / 2 + 'px';
    particle.style.top = rect.top + rect.height / 2 + 'px';
    particle.style.width = '4px';
    particle.style.height = '4px';
    particle.style.background = color;
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '9999';
    
    document.body.appendChild(particle);
    
    const angle = (i / 6) * Math.PI * 2;
    const distance = 30;
    
    particle.animate([
      {
        transform: 'translate(0, 0) scale(1)',
        opacity: 1
      },
      {
        transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`,
        opacity: 0
      }
    ], {
      duration: 600,
      easing: 'ease-out'
    }).onfinish = () => {
      document.body.removeChild(particle);
    };
  }
}

// Fonction pour créer un effet de confettis
function createConfettiEffect() {
  const colors = ['#f59e0b', '#10b981', '#6366f1', '#ef4444', '#8b5cf6'];
  
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.left = Math.random() * window.innerWidth + 'px';
      confetti.style.top = '-10px';
      confetti.style.width = '8px';
      confetti.style.height = '8px';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.borderRadius = '50%';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '9999';
      
      document.body.appendChild(confetti);
      
      confetti.animate([
        {
          transform: 'translateY(0) rotate(0deg)',
          opacity: 1
        },
        {
          transform: `translateY(${window.innerHeight + 20}px) rotate(720deg)`,
          opacity: 0
        }
      ], {
        duration: 2000 + Math.random() * 1000,
        easing: 'ease-in'
      }).onfinish = () => {
        document.body.removeChild(confetti);
      };
    }, i * 100);
  }
}

// Améliorer la fonction rollStat existante
if (typeof rollStat !== 'undefined') {
  const originalRollStat = rollStat;
  rollStat = function(statName) {
    const resultElement = document.getElementById(statName + '-result');
    const buttonElement = document.querySelector(`[onclick="rollStat('${statName}')"]`);
    
    if (resultElement) {
      resultElement.classList.add('rolling');
      if (buttonElement) {
        buttonElement.style.pointerEvents = 'none';
        setTimeout(() => {
          buttonElement.style.pointerEvents = 'auto';
        }, 1200);
      }
    }
    
    originalRollStat(statName);
    
    // Ajouter l'effet de particules pour les excellents résultats
    setTimeout(() => {
      const total = parseInt(resultElement.textContent) || 0;
      if (total >= 15) {
        createParticleEffect(resultElement, '#10b981');
      }
    }, 1000);
  };
}

// Améliorer la fonction rollAllStats existante
if (typeof rollAllStats !== 'undefined') {
  const originalRollAllStats = rollAllStats;
  rollAllStats = function() {
    const button = document.querySelector('[onclick="rollAllStats()"]');
    
    if (button) {
      button.style.pointerEvents = 'none';
      button.style.opacity = '0.7';
      
      setTimeout(() => {
        button.style.pointerEvents = 'auto';
        button.style.opacity = '1';
        
        // Vérifier le résultat global
        const stats = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        const results = stats.map(stat => {
          const element = document.getElementById(stat + '-result');
          return parseInt(element.textContent) || 0;
        });
        
        const average = results.reduce((a, b) => a + b, 0) / results.length;
        if (average >= 13) {
          createConfettiEffect();
        }
      }, 2500);
    }
    
    originalRollAllStats();
  };
}
</script>

<script>
// Ajouter un indicateur de performance pour les animations
function addPerformanceOptimizations() {
  // Réduire les animations sur les appareils moins performants
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    document.documentElement.style.setProperty('--animation-duration', '0.2s');
  }
  
  // Désactiver les animations si l'utilisateur préfère les mouvements réduits
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    `;
    document.head.appendChild(style);
  }
}

// Exécuter les optimisations au chargement
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addPerformanceOptimizations);
} else {
  addPerformanceOptimizations();
}
</script>

<script>
// 🔧 INITIALISATION FORCÉE DU CONVERTISSEUR DE MONNAIE + DEBUG MOBILE
// Ce script garantit que le convertisseur s'initialise même si l'IntersectionObserver ne se déclenche pas
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 [DEBUG] Initialisation forcée du convertisseur...');
  
  // DEBUG MOBILE SPÉCIFIQUE
  const isMobile = window.innerWidth <= 768;
  console.log(`📱 [DEBUG] Mode mobile détecté: ${isMobile} (largeur: ${window.innerWidth}px)`);
  
  // Vérifier la visibilité des sections principales
  const sectionsToCheck = [
    'currency-converter-premium',
    'coin-lots-recommendations',
    'coin-lots-content'
  ];
  
  sectionsToCheck.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (section) {
      const computedStyle = window.getComputedStyle(section);
      const isVisible = computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden';
      console.log(`📊 [DEBUG] Section ${sectionId}: présente=${!!section}, visible=${isVisible}, display=${computedStyle.display}`);
      
      // Forcer la visibilité sur mobile
      if (isMobile && !isVisible) {
        section.style.display = 'block';
        section.style.opacity = '1';
        console.log(`🔧 [CORRECTION] Section ${sectionId} forcée visible sur mobile`);
      }
    } else {
      console.warn(`❌ [DEBUG] Section ${sectionId} non trouvée dans le DOM`);
    }
  });
  
  // Vérifier la présence du container
  const converterContainer = document.getElementById('currency-converter-premium');
  if (!converterContainer) {
    console.warn('❌ [DEBUG] Container currency-converter-premium non trouvé');
    return;
  }
  
  // Vérifier la présence des classes
  if (typeof CurrencyConverterPremium === 'undefined') {
    console.error('❌ [DEBUG] CurrencyConverterPremium non disponible');
    return;
  }
  
  // Attendre un peu pour s'assurer que tous les scripts sont chargés
  setTimeout(() => {
    try {
      // Forcer l'initialisation même si l'instance existe déjà
      if (!window.converterInstance || typeof window.converterInstance.getCurrentValues !== 'function') {
        console.log('✅ [DEBUG] Création nouvelle instance du convertisseur...');
        window.converterInstance = new CurrencyConverterPremium();
        window.currencyConverter = window.converterInstance;
        
        console.log('✅ [DEBUG] Convertisseur initialisé avec succès');
        
        // Test de base
        const testValue = window.converterInstance.getTotalBaseValue();
        console.log(`✅ [DEBUG] Test de base réussi: ${testValue} cuivres`);

      } else {
        console.log('ℹ️ [DEBUG] Convertisseur déjà initialisé');
      }
      
    } catch (error) {
      console.error('❌ [DEBUG] Erreur initialisation convertisseur:', error);
      
      // Ajouter un indicateur d'erreur
      const errorIndicator = document.createElement('div');
      errorIndicator.style.cssText = 'position: fixed; top: 10px; right: 10px; background: #dc3545; color: white; padding: 8px 12px; border-radius: 4px; font-size: 12px; z-index: 9999;';
      errorIndicator.textContent = '❌ Erreur Convertisseur: ' + error.message;
      document.body.appendChild(errorIndicator);
      
      // Retirer l'indicateur d'erreur après 5 secondes
      setTimeout(() => {
        if (errorIndicator.parentNode) {
          errorIndicator.parentNode.removeChild(errorIndicator);
        }
      }, 5000);
    }
  }, 1000); // Attendre 1 seconde pour s'assurer que tout est chargé
  
});

// Détection spécifique mobile pour améliorer l'initialisation
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);
}

// Initialisation spéciale pour mobile
if (isMobileDevice()) {
  console.log('📱 [DEBUG] Appareil mobile détecté, initialisation adaptée...');
  
  // Attendre que l'appareil soit stable
  window.addEventListener('load', function() {
    setTimeout(() => {
      if (!window.converterInstance && document.getElementById('currency-converter-premium')) {
        console.log('📱 [DEBUG] Initialisation mobile forcée...');
        try {
          window.converterInstance = new CurrencyConverterPremium();
          console.log('✅ [DEBUG] Initialisation mobile réussie');
        } catch (error) {
          console.error('❌ [DEBUG] Erreur initialisation mobile:', error);
        }
      }
    }, 2000); // Délai plus long pour mobile
  });
}

// Debug supplémentaire pour les événements - support mobile et desktop
['click', 'touchend'].forEach(eventType => {
  document.addEventListener(eventType, function(e) {
    if (e.target.closest('#currency-converter-premium')) {
      console.log('🖱️ [DEBUG] Interaction détectée sur le convertisseur:', eventType);
      
      // Forcer la ré-initialisation si nécessaire
      if (!window.converterInstance) {
        console.log('🔄 [DEBUG] Ré-initialisation suite à l\'interaction...');
        try {
          window.converterInstance = new CurrencyConverterPremium();
          console.log('✅ [DEBUG] Ré-initialisation réussie');
        } catch (error) {
          console.error('❌ [DEBUG] Erreur ré-initialisation:', error);
        }
      }
    }
  }, { passive: false }); // Retirer passive pour permettre preventDefault si nécessaire
});
</script>

</body>
</html>
