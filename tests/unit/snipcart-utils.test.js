/**
 * Tests unitaires - Utilitaires Snipcart
 * Validation création boutons et ajout panier
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
const utilsCode = readFileSync(join(__dirname, '../../js/snipcart-utils.js'), 'utf-8');
eval(utilsCode);

describe('SnipcartUtils - Utilitaires Panier', () => {
  describe('createAddToCartButton', () => {
    test('doit créer bouton avec attributs Snipcart basiques', () => {
      const productData = {
        id: 'test-product',
        name: 'Produit Test',
        price: 10.00,
        description: 'Description test'
      };
      
      const button = SnipcartUtils.createAddToCartButton(productData);
      
      expect(button).toBeDefined();
      expect(button.getAttribute('data-item-id')).toBe('test-product');
      expect(button.getAttribute('data-item-name')).toBe('Produit Test');
      expect(button.getAttribute('data-item-price')).toBe('10');
    });

    test('doit gérer champs personnalisés métal/multiplicateur', () => {
      const productData = {
        id: 'coin-custom-single',
        name: 'Pièce Personnalisée',
        price: 10
      };
      
      const options = {
        customFields: {
          custom1: {
            name: 'Métal',
            type: 'dropdown',
            options: 'copper[+0.00]|silver[+0.00]|gold[+0.00]',
            value: 'gold',
            role: 'metal'
          },
          custom2: {
            name: 'Multiplicateur',
            type: 'dropdown',
            options: '1|10|100',
            value: '100',
            role: 'multiplier'
          }
        }
      };
      
      const button = SnipcartUtils.createAddToCartButton(productData, options);
      
      expect(button.getAttribute('data-item-custom1-name')).toBe('Métal');
      expect(button.getAttribute('data-item-custom1-value')).toBe('gold');
      expect(button.getAttribute('data-item-custom2-value')).toBe('100');
    });

    test('doit supporter multilingue FR/EN', () => {
      const productData = {
        id: 'test',
        name: 'Produit FR',
        name_en: 'Product EN',
        price: 15,
        summary: 'Résumé FR',
        summary_en: 'Summary EN'
      };
      
      const button = SnipcartUtils.createAddToCartButton(productData);
      
      expect(button.getAttribute('data-item-name')).toBe('Produit FR');
      expect(button.getAttribute('data-item-name-en')).toBe('Product EN');
      expect(button.getAttribute('data-item-description-en')).toBe('Summary EN');
    });
  });

  describe('normalizeCustomFields', () => {
    test('doit normaliser format optimizer vers format boutique', () => {
      const optimizerFormat = {
        'metal-coin-custom-single': { role: 'metal', value: 'platinum' },
        'multiplier-coin-custom-single': { role: 'multiplier', value: '1000' }
      };
      
      const normalized = SnipcartUtils.normalizeCustomFields(optimizerFormat);
      
      expect(normalized.custom1).toBeDefined();
      expect(normalized.custom1.name).toContain('Métal');
      expect(normalized.custom1.value).toBe('platinum');
    });

    test('doit conserver format boutique déjà normalisé', () => {
      const boutiqueFormat = {
        custom1: { name: 'Test', value: 'value1' },
        custom2: { name: 'Test2', value: 'value2' }
      };
      
      const normalized = SnipcartUtils.normalizeCustomFields(boutiqueFormat);
      
      expect(normalized).toEqual(boutiqueFormat);
    });
  });

  describe('translateMetal', () => {
    test('doit traduire métaux en français', () => {
      expect(SnipcartUtils.translateMetal('copper', 'fr')).toBe('cuivre');
      expect(SnipcartUtils.translateMetal('silver', 'fr')).toBe('argent');
      expect(SnipcartUtils.translateMetal('platinum', 'fr')).toBe('platine');
    });

    test('doit garder anglais pour langue EN', () => {
      expect(SnipcartUtils.translateMetal('copper', 'en')).toBe('copper');
      expect(SnipcartUtils.translateMetal('gold', 'en')).toBe('gold');
    });
  });

  describe('extractProductDataFromButton', () => {
    test('doit extraire données depuis bouton HTML', () => {
      const mockButton = {
        getAttribute: (attr) => {
          const attrs = {
            'data-item-id': 'test-id',
            'data-item-name': 'Test Product',
            'data-item-price': '25.50',
            'data-item-quantity': '2'
          };
          return attrs[attr] || null;
        },
        attributes: []
      };

      const data = SnipcartUtils.extractProductDataFromButton(mockButton);

      expect(data.id).toBe('test-id');
      expect(data.name).toBe('Test Product');
      expect(data.price).toBe(25.50);
      expect(data.quantity).toBe(2);
    });
  });
});
