import { gsap } from 'gsap';
import AnimationService from './animation-service.js';

// Initialisation des animations après chargement du DOM
// Exemple : rotation au clic sur le logo, zoom au survol du texte
// et apparition progressive du pied de page lors du scroll.
document.addEventListener('DOMContentLoaded', () => {
  AnimationService.animate('.logo-image', { rotation: 360, duration: 1 }, 'click');
  AnimationService.animate('.logo-text', { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1 }, 'hover');
  gsap.set('#footer', { opacity: 0, y: 40 });
  AnimationService.animate('#footer', { opacity: 1, y: 0, duration: 0.6 }, 'scroll');
});

