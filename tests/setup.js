/**
 * Configuration globale des tests Jest
 * @author Brujah
 */

global.window = global.window || {};
global.window.products = {
  'coin-custom-single': {
    price: 10,
    category: 'pieces',
    customizable: true,
    metals_en: ['copper', 'silver', 'electrum', 'gold', 'platinum'],
    multipliers: [1, 10, 100, 1000, 10000],
    coin_lots: { copper: 1, silver: 1, electrum: 1, gold: 1, platinum: 1 }
  },
  'coin-quintessence-metals': {
    price: 35,
    category: 'pieces',
    customizable: true,
    multipliers: [1, 10, 100, 1000, 10000],
    metals_en: ['copper', 'silver', 'electrum', 'gold', 'platinum'],
    coin_lots: { copper: 1, silver: 1, electrum: 1, gold: 1, platinum: 1 }
  }
};

global.document = global.document || {
  documentElement: { lang: 'fr' },
  createElement: () => ({
    setAttribute: () => {},
    getAttribute: () => null,
    appendChild: () => {},
    click: () => {},
    attributes: []
  }),
  body: {
    appendChild: () => {},
    removeChild: () => {}
  }
};

global.console = {
  ...console,
  log: () => {},
  debug: () => {},
  info: () => {}
};
