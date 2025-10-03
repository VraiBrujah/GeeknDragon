/**
 * Module réutilisable pour le scroll horizontal des grilles de produits
 * Utilisable sur boutique.php, index.php, ou toute autre page
 *
 * Fonctionnalités:
 * - Détection automatique mobile vs desktop
 * - Scroll horizontal avec molette (PC, délai 1s)
 * - Scroll tactile natif (mobile, immédiat)
 * - Position initiale à gauche garantie
 *
 * @author Brujah - Geek & Dragon
 */

class ShopGridScroll {
  constructor() {
    this.grids = [];
    this.init();
  }

  /**
   * Initialise le scroll horizontal sur toutes les grilles .shop-grid
   */
  init() {
    const gridElements = document.querySelectorAll('.shop-grid');

    gridElements.forEach(grid => {
      this.initGridScroll(grid);
      this.grids.push(grid);
    });
  }

  /**
   * Initialise le scroll horizontal sur une grille spécifique
   * @param {HTMLElement} grid - Élément .shop-grid
   */
  initGridScroll(grid) {
    // Vérifier si le scroll horizontal est nécessaire
    const checkScrollNeed = () => {
      // Largeur du contenu scrollable vs largeur visible
      const hasOverflow = grid.scrollWidth > grid.clientWidth;

      if (!hasOverflow) {
        // Pas de débordement : désactiver le scroll horizontal
        grid.style.overflowX = 'visible';
        grid.style.gridAutoFlow = 'row';
        grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(320px, 1fr))';
        return false;
      } else {
        // Débordement : activer le scroll horizontal
        grid.style.overflowX = 'auto';
        grid.style.gridAutoFlow = 'column';
        grid.style.gridTemplateColumns = '';
        return true;
      }
    };

    // Vérification initiale après un court délai (pour laisser le DOM se stabiliser)
    setTimeout(() => {
      const needsScroll = checkScrollNeed();

      if (!needsScroll) {
        return; // Pas besoin de scroll, on arrête ici
      }

      // Position initiale à gauche
      grid.scrollLeft = 0;

      // Détection du type d'appareil
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      if (isTouchDevice) {
        // Mobile/Tablette : scroll natif tactile (pas d'intervention JS)
        return;
      }

      // Desktop uniquement : scroll horizontal avec molette après délai
      let scrollEnabled = false;
      let hoverTimeout = null;

      // Activer le scroll horizontal après 1 seconde de survol (PC seulement)
      grid.addEventListener('mouseenter', () => {
        // Re-vérifier si le scroll est toujours nécessaire (fenêtre redimensionnée)
        if (grid.scrollWidth > grid.clientWidth) {
          hoverTimeout = setTimeout(() => {
            scrollEnabled = true;
          }, 1000);
        }
      });

      // Désactiver immédiatement quand on quitte la zone
      grid.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimeout);
        scrollEnabled = false;
      });

      // Gérer le scroll avec la molette
      grid.addEventListener('wheel', (e) => {
        // Vérifier que le scroll est toujours nécessaire
        const hasOverflow = grid.scrollWidth > grid.clientWidth;

        if (scrollEnabled && hasOverflow && Math.abs(e.deltaY) > 0) {
          e.preventDefault();

          // Scroll direct sans animation pour éviter les saccades
          grid.scrollBy({
            left: e.deltaY,
            behavior: 'auto' // Pas de smooth, c'est plus fluide
          });
        }
      }, { passive: false });

      // Re-vérifier au redimensionnement de la fenêtre
      window.addEventListener('resize', () => {
        checkScrollNeed();
      });
    }, 100);
  }

  /**
   * Réinitialise toutes les grilles à la position 0
   */
  resetAllGrids() {
    this.grids.forEach(grid => {
      grid.scrollLeft = 0;
    });
  }

  /**
   * Ajoute une nouvelle grille après l'initialisation
   * @param {HTMLElement|string} gridElementOrSelector - Élément ou sélecteur CSS
   */
  addGrid(gridElementOrSelector) {
    const grid = typeof gridElementOrSelector === 'string'
      ? document.querySelector(gridElementOrSelector)
      : gridElementOrSelector;

    if (grid && !this.grids.includes(grid)) {
      this.initGridScroll(grid);
      this.grids.push(grid);
    }
  }
}

// Export pour utilisation globale
window.ShopGridScroll = ShopGridScroll;

// Auto-initialisation au chargement de la page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.shopGridScroll = new ShopGridScroll();
  });
} else {
  window.shopGridScroll = new ShopGridScroll();
}
