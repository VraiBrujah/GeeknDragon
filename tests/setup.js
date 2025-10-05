/**
 * Configuration Setup Jest - Geek & Dragon
 * 
 * Configuration globale pour environnement de test
 * avec mocks et utilitaires communs.
 */

// Configuration globale pour tests DOM
import 'jest-environment-jsdom';

// Mock de l'API Snipcart
global.Snipcart = {
  api: {
    items: {
      add: jest.fn().mockResolvedValue({ success: true }),
      remove: jest.fn().mockResolvedValue({ success: true }),
      clear: jest.fn().mockResolvedValue({ success: true })
    },
    cart: {
      items: {
        count: jest.fn().mockReturnValue(0),
        total: jest.fn().mockReturnValue(0)
      }
    }
  }
};

// Mock de l'objet window pour fonctions globales
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now())
  },
  writable: true
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
});

// Mock de fetch pour tests API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve('')
  })
);

// Configuration console pour tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Restaurer les mocks avant chaque test
  jest.clearAllMocks();
  
  // Réinitialiser localStorage
  localStorageMock.clear();
  
  // Nettoyer DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});

afterEach(() => {
  // Nettoyage après chaque test
  jest.restoreAllMocks();
});

// Utilitaires de test globaux
global.testUtils = {
  /**
   * Crée un élément DOM de test
   */
  createElement: (tag, attributes = {}, children = []) => {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'class') {
        element.className = value;
      } else {
        element.setAttribute(key, value);
      }
    });
    
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
    
    return element;
  },
  
  /**
   * Simule un délai pour tests async
   */
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  /**
   * Mock d'un produit D&D pour tests
   */
  mockProduct: {
    id: 'test-product',
    name: 'Produit de Test',
    price: 25.99,
    description: 'Description de test',
    images: ['/test-image.jpg'],
    coin_lots: {
      type: 'customizable',
      multipliers: [1, 10, 100, 1000, 10000]
    }
  },
  
  /**
   * Mock de données de conversion pour tests
   */
  mockConversionData: {
    amount: 1661,
    expected: [
      { metal: 'platinum', multiplicateur: 1, quantite: 1 },
      { metal: 'gold', multiplicateur: 100, quantite: 6 },
      { metal: 'electrum', multiplicateur: 10, quantite: 1 },
      { metal: 'copper', multiplicateur: 1, quantite: 11 }
    ]
  }
};