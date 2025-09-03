import { gsap } from 'gsap';

/**
 * AnimationService centralise l'utilisation de GSAP.
 * Il permet d'attacher des animations à des événements simples
 * comme le clic, le survol ou l'apparition au défilement.
 */
export default class AnimationService {
  /**
   * Récupère un élément DOM à partir d'un sélecteur ou renvoie l'élément fourni.
   * @param {string|Element} target - Sélecteur CSS ou élément DOM.
   * @returns {Element|null} L'élément correspondant ou null.
   */
  static getElement(target) {
    return typeof target === 'string' ? document.querySelector(target) : target;
  }

  /**
   * Associe une animation GSAP à un déclencheur.
   * @param {string|Element} target - Élément à animer.
   * @param {gsap.TweenVars} vars - Propriétés GSAP (durée, transformation...).
   * @param {'click'|'hover'|'scroll'} trigger - Type de déclencheur.
   */
  static animate(target, vars, trigger = 'click') {
    const el = AnimationService.getElement(target);
    if (!el) return;
    const play = () => gsap.to(el, vars);
    AnimationService.attachTrigger(el, trigger, play);
  }

  /**
   * Crée et optionnellement déclenche une timeline GSAP.
   * @param {Array<{target: string|Element, vars: gsap.TweenVars}>} steps - Étapes de la timeline.
   * @param {'click'|'hover'|'scroll'|null} trigger - Type de déclencheur ou null pour lecture immédiate.
   * @param {string|Element} triggerTarget - Élément déclencheur (défaut: premier élément de la timeline).
   * @returns {gsap.core.Timeline} La timeline créée.
   */
  static timeline(steps = [], trigger = null, triggerTarget = null) {
    const tl = gsap.timeline({ paused: true });
    steps.forEach((s) => {
      tl.to(AnimationService.getElement(s.target), s.vars);
    });

    const target = triggerTarget || (steps[0] && steps[0].target);
    if (trigger && target) {
      const el = AnimationService.getElement(target);
      AnimationService.attachTrigger(el, trigger, () => tl.play());
    } else {
      tl.play();
    }

    return tl;
  }

  /**
   * Ajoute l'écouteur d'événement correspondant au déclencheur.
   * @param {Element} el - Élément cible.
   * @param {'click'|'hover'|'scroll'} trigger - Type de déclencheur.
   * @param {Function} callback - Fonction exécutée lors du déclenchement.
   */
  static attachTrigger(el, trigger, callback) {
    if (trigger === 'click') {
      el.addEventListener('click', callback);
    } else if (trigger === 'hover') {
      el.addEventListener('mouseenter', callback);
    } else if (trigger === 'scroll') {
      const onScroll = () => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight) {
          window.removeEventListener('scroll', onScroll);
          callback();
        }
      };
      window.addEventListener('scroll', onScroll);
    }
  }
}

