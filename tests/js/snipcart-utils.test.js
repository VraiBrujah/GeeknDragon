/**
 * TESTS UNITAIRES - Utilitaires Snipcart - Standards v2.1.0
 * 
 * Suite de tests pour validation des fonctionnalités e-commerce
 * critiques avec intégration Snipcart et gestion des produits D&D.
 * 
 * COUVERTURE DE TESTS :
 * =====================
 * - Création cohérente des boutons d'ajout au panier
 * - Gestion des champs personnalisés (métal, multiplicateur)
 * - Validation des attributs Snipcart requis
 * - Ajout multiple avec gestion d'erreurs
 * - Intégration avec système de traductions
 * 
 * @author Brujah - Geek & Dragon
 * @version 2.1.0 - Tests E-commerce Français
 * @since 2.0.0
 * @category Tests
 * @package GeeknDragon\Tests\JavaScript
 */

/**
 * @jest-environment jsdom
 */

// Mock global pour Snipcart (simulé en environnement de test)
global.Snipcart = {
  api: {
    items: {
      add: jest.fn().mockResolvedValue({ success: true })
    }
  }
};

describe('SnipcartUtils - Tests Complets E-commerce', () => {
  
  beforeEach(() => {
    // Nettoyage DOM avant chaque test
    document.body.innerHTML = '';