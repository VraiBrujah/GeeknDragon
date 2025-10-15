/**
 * Tests unitaires - Optimiseur de Lots D&D
 * Validation algorithme sac à dos et recommandations
 *
 * @author Brujah
 * @version 1.0.0
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger le module à tester
const optimizerCode = readFileSync(join(__dirname, '../../js/coin-lot-optimizer.js'), 'utf-8');
eval(optimizerCode);

describe('CoinLotOptimizer - Optimiseur Lots D&D', () => {
  let optimizer;

  beforeEach(() => {
    optimizer = new CoinLotOptimizer();
  });

  describe('Initialisation', () => {
    test('doit créer instance avec taux D&D standards', () => {
      expect(optimizer.tauxChange).toBeDefined();
      expect(optimizer.tauxChange.copper).toBe(1);
      expect(optimizer.tauxChange.platinum).toBe(1000);
    });

    test('doit avoir 5 multiplicateurs disponibles', () => {
      expect(optimizer.multiplicateursDisponibles).toHaveLength(5);
      expect(optimizer.multiplicateursDisponibles).toContain(1);
      expect(optimizer.multiplicateursDisponibles).toContain(10000);
    });
  });

  describe('Génération variations produits', () => {
    test('doit générer variations pour coin-custom-single', () => {
      const variations = optimizer.generateAllProductVariations();
      
      // Doit contenir pièces personnalisées
      const customCoins = variations.filter(v => v.productId === 'coin-custom-single');
      
      // 5 métaux × 5 multiplicateurs = 25 variations
      expect(customCoins.length).toBe(25);
    });

    test('doit générer variations pour coin-quintessence', () => {
      const variations = optimizer.generateAllProductVariations();
      
      const quintessence = variations.filter(v => v.productId === 'coin-quintessence-metals');
      
      // 5 variations (1 par multiplicateur)
      expect(quintessence.length).toBe(5);
      
      // Chaque variation doit avoir 5 métaux
      quintessence.forEach(v => {
        const metalCount = Object.keys(v.capacity).length;
        expect(metalCount).toBe(5);
      });
    });

    test('chaque variation doit avoir price et capacity', () => {
      const variations = optimizer.generateAllProductVariations();
      
      variations.forEach(v => {
        expect(v.price).toBeGreaterThan(0);
        expect(v.capacity).toBeDefined();
        expect(Object.keys(v.capacity).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Optimisation basique', () => {
    test('doit trouver solution pour besoins simples', () => {
      const needs = { 'copper_1': 1 };
      const result = optimizer.findOptimalProductCombination(needs);
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      
      // Vérifier prix total
      const totalCost = result.reduce((sum, item) => sum + item.totalCost, 0);
      expect(totalCost).toBeGreaterThan(0);
    });

    test('doit optimiser pour besoins multiples', () => {
      const needs = {
        'copper_1': 5,
        'silver_1': 3,
        'gold_1': 1
      };
      
      const result = optimizer.findOptimalProductCombination(needs);
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Validation solution', () => {
    test('doit interdire déficit (besoins non couverts)', () => {
      const needs = { 'copper_1': 10 };
      const result = optimizer.findOptimalProductCombination(needs);
      
      // Calculer couverture
      let totalProvided = 0;
      result.forEach(item => {
        if (item.customFields && item.customFields['metal-coin-custom-single']) {
          totalProvided += item.quantity;
        }
      });
      
      // Doit couvrir au minimum les besoins
      expect(totalProvided).toBeGreaterThanOrEqual(10);
    });

    test('doit autoriser surplus', () => {
      const needs = { 'gold_100': 1 };
      const result = optimizer.findOptimalProductCombination(needs);
      
      // Solution peut avoir surplus (ex: Quintessence)
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    test('doit traiter en moins de 500ms', () => {
      const needs = {
        'copper_1': 10,
        'silver_10': 5,
        'gold_100': 2,
        'platinum_1000': 1
      };
      
      const start = Date.now();
      optimizer.findOptimalProductCombination(needs);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(500);
    });
  });

  describe('Cas limites', () => {
    test('doit gérer besoins vides', () => {
      const result = optimizer.findOptimalProductCombination({});
      expect(result).toEqual([]);
    });

    test('doit gérer besoins null', () => {
      const result = optimizer.findOptimalProductCombination(null);
      expect(result).toEqual([]);
    });

    test('doit gérer très gros besoins', () => {
      const needs = { 'platinum_10000': 100 };
      const result = optimizer.findOptimalProductCombination(needs);
      
      expect(result).toBeDefined();
    });
  });

  describe('Format sortie Snipcart', () => {
    test('doit retourner format compatible panier', () => {
      const needs = { 'gold_1': 1 };
      const result = optimizer.findOptimalProductCombination(needs);
      
      expect(result.length).toBeGreaterThan(0);
      
      // Vérifier structure
      result.forEach(item => {
        expect(item.productId).toBeDefined();
        expect(item.displayName).toBeDefined();
        expect(item.price).toBeDefined();
        expect(item.quantity).toBeDefined();
        expect(item.totalCost).toBeDefined();
      });
    });
  });
});
