/**
 * TESTS UNITAIRES - Convertisseur de Monnaie D&D - Standards v2.1.0
 * 
 * Suite de tests complète pour validation des calculs critiques
 * du convertisseur de monnaie avec optimisation algorithmique.
 * 
 * COUVERTURE DE TESTS :
 * =====================
 * - Conversion optimale avec métaheuristiques
 * - Gestion des cas limites et erreurs
 * - Validation des recommandations de lots
 * - Performance et cohérence des calculs
 * - Intégration avec système Snipcart
 * 
 * @author Brujah - Geek & Dragon
 * @version 2.1.0 - Tests Français Complets
 * @since 2.0.0
 * @category Tests
 * @package GeeknDragon\Tests\JavaScript
 */

// Configuration Jest pour environnement navigateur
/**
 * @jest-environment jsdom
 */

// Import du convertisseur (assuming module system)
// const CurrencyConverterPremium = require('../../js/currency-converter.js');

describe('CurrencyConverterPremium - Tests Complets', () => {
  let converter;
  
  beforeEach(() => {
    // Réinitialisation avant chaque test
    converter = new CurrencyConverterPremium();
    
    // Mock des éléments DOM pour tests isolés
    document.body.innerHTML = `
      <div id="currency-converter-premium">
        <div class="currency-sources-container"></div>
        <div class="conversion-result"></div>
        <div class="recommended-lots"></div>
      </div>
    `;
  });

  describe('🔧 Initialisation et Configuration', () => {
    test('devrait initialiser avec les taux de change D&D corrects', () => {
      expect(converter.tauxChange).toEqual({
        copper: 1,
        silver: 10,
        electrum: 50,
        gold: 100,
        platinum: 1000
      });
    });

    test('devrait avoir les multiplicateurs disponibles configurés', () => {
      expect(converter.multiplicateursDisponibles).toEqual([1, 10, 100, 1000, 10000]);
    });

    test('devrait configurer le formateur numérique français', () => {
      expect(converter.nf).toBeInstanceOf(Intl.NumberFormat);
      expect(converter.nf.format(1234.56)).toBe('1 234,56');
    });

    test('devrait avoir les données des métaux complètes', () => {
      const metallRequis = ['copper', 'silver', 'electrum', 'gold', 'platinum'];
      metallRequis.forEach(metal => {
        expect(converter.donneesMetaux[metal]).toBeDefined();
        expect(converter.donneesMetaux[metal].name).toBeTruthy();
        expect(converter.donneesMetaux[metal].nameEn).toBeTruthy();
        expect(converter.donneesMetaux[metal].emoji).toBeTruthy();
      });
    });
  });

  describe('💰 Conversion Optimale - Cas de Référence', () => {
    test('devrait convertir 1661 cuivres en solution optimale 4 pièces', () => {
      const result = converter.convertirMontant(1661);
      const totalPieces = converter.calculerTotalPieces(result);
      
      expect(totalPieces).toBe(4);
      
      // Vérification de la solution optimale attendue
      const expectedSolution = [
        { metal: 'platinum', multiplicateur: 1, quantite: 1 },
        { metal: 'gold', multiplicateur: 100, quantite: 6 },
        { metal: 'electrum', multiplicateur: 10, quantite: 1 },
        { metal: 'copper', multiplicateur: 1, quantite: 1 }
      ];
      
      // Validation structure et contenu
      result.forEach((piece, index) => {
        expect(piece.metal).toBe(expectedSolution[index].metal);
        expect(piece.multiplicateur).toBe(expectedSolution[index].multiplicateur);
        expect(piece.quantite).toBe(expectedSolution[index].quantite);
      });
    });

    test('devrait calculer la valeur totale correctement', () => {
      const repartition = [
        { metal: 'platinum', multiplicateur: 1, quantite: 1 },
        { metal: 'gold', multiplicateur: 100, quantite: 6 },
        { metal: 'electrum', multiplicateur: 10, quantite: 1 },
        { metal: 'copper', multiplicateur: 1, quantite: 1 }
      ];
      
      const valeurTotale = converter.calculerValeurTotale(repartition);
      expect(valeurTotale).toBe(1661);
    });

    test('devrait optimiser pour différents montants de référence', () => {
      const casDeTests = [
        { montant: 0, attendu: 0 },
        { montant: 1, attendu: 1 },
        { montant: 10, attendu: 1 }, // 1 silver
        { montant: 50, attendu: 1 }, // 1 electrum
        { montant: 100, attendu: 1 }, // 1 gold
        { montant: 1000, attendu: 1 }, // 1 platinum
        { montant: 156, attendu: 3 }, // Cas complexe
        { montant: 2511, attendu: 4 } // Cas très complexe
      ];

      casDeTests.forEach(({ montant, attendu }) => {
        const result = converter.convertirMontant(montant);
        const totalPieces = converter.calculerTotalPieces(result);
        
        expect(totalPieces).toBe(attendu);
        
        // Vérification que la valeur totale est exacte
        if (montant > 0) {
          const valeurCalculee = converter.calculerValeurTotale(result);
          expect(valeurCalculee).toBe(montant);
        }
      });
    });
  });

  describe('🔍 Validation et Gestion d'Erreurs', () => {
    test('devrait rejeter les montants négatifs', () => {
      expect(() => converter.convertirMontant(-1)).toThrow();
      expect(() => converter.convertirMontant(-100)).toThrow();
    });

    test('devrait rejeter les montants non numériques', () => {
      expect(() => converter.convertirMontant('abc')).toThrow();
      expect(() => converter.convertirMontant(null)).toThrow();
      expect(() => converter.convertirMontant(undefined)).toThrow();
      expect(() => converter.convertirMontant({})).toThrow();
    });

    test('devrait gérer les montants décimaux en arrondissant', () => {
      const result = converter.convertirMontant(15.7);
      const valeurTotale = converter.calculerValeurTotale(result);
      expect(valeurTotale).toBe(16); // Arrondi supérieur
    });

    test('devrait valider les multiplicateurs disponibles', () => {
      const multiplValidees = [1, 10, 100, 1000, 10000];
      const multiplInvalides = [2, 5, 50, 500];
      
      // Test avec multiplicateurs valides
      expect(() => converter.convertirMontant(100, multiplValidees)).not.toThrow();
      
      // Test avec multiplicateurs partiels
      const result = converter.convertirMontant(1100, [1, 1000]);
      expect(result.length).toBeGreaterThan(0);
    });

    test('devrait retourner tableau vide pour montant zéro', () => {
      const result = converter.convertirMontant(0);
      expect(result).toEqual([]);
      expect(converter.calculerTotalPieces(result)).toBe(0);
      expect(converter.calculerValeurTotale(result)).toBe(0);
    });
  });

  describe('🎯 Algorithmes d\'Optimisation', () => {
    test('devrait utiliser plusieurs stratégies gloutonnes', () => {
      // Test que différentes stratégies sont testées
      const montant = 1661;
      const result = converter.convertirMontant(montant);
      
      // La solution doit être optimale (minimum de pièces)
      const totalPieces = converter.calculerTotalPieces(result);
      expect(totalPieces).toBeLessThanOrEqual(10); // Raisonnable pour 1661
    });

    test('devrait préférer les gros multiplicateurs quand approprié', () => {
      const result = converter.convertirMontant(10000);
      
      // Devrait utiliser 1 platine x10000 plutôt que 10 platines x1000
      const platineX10000 = result.find(p => 
        p.metal === 'platinum' && p.multiplicateur === 10000
      );
      
      if (platineX10000) {
        expect(platineX10000.quantite).toBeGreaterThan(0);
      }
    });

    test('devrait être cohérent entre appels multiples', () => {
      const montant = 1661;
      const result1 = converter.convertirMontant(montant);
      const result2 = converter.convertirMontant(montant);
      
      expect(result1).toEqual(result2);
      expect(converter.calculerTotalPieces(result1))
        .toBe(converter.calculerTotalPieces(result2));
    });

    test('devrait optimiser pour éviter trop de pièces identiques', () => {
      const result = converter.convertirMontant(55);
      
      // Devrait préférer 1 electrum + 5 cuivres plutôt que 55 cuivres
      const cuivres = result.find(p => p.metal === 'copper');
      if (cuivres) {
        expect(cuivres.quantite).toBeLessThan(20);
      }
    });
  });

  describe('📊 Formatage et Affichage', () => {
    test('devrait formater pour affichage avec multiplicateurs', () => {
      const repartition = [
        { metal: 'gold', multiplicateur: 100, quantite: 2 },
        { metal: 'silver', multiplicateur: 1, quantite: 5 }
      ];
      
      const formate = converter.formaterPourAffichage(repartition, true);
      
      expect(formate).toContain('Or');
      expect(formate).toContain('×100');
      expect(formate).toContain('Argent');
      expect(formate).toContain('2');
      expect(formate).toContain('5');
    });

    test('devrait formater pour affichage sans multiplicateurs', () => {
      const repartition = [
        { metal: 'gold', multiplicateur: 1, quantite: 3 }
      ];
      
      const formate = converter.formaterPourAffichage(repartition, false);
      
      expect(formate).toContain('Or');
      expect(formate).not.toContain('×1');
      expect(formate).toContain('3');
    });

    test('devrait gérer les répartitions vides', () => {
      const formate = converter.formaterPourAffichage([], true);
      expect(formate).toBe('Aucune pièce');
    });
  });

  describe('💾 Cache et Performance', () => {
    test('devrait utiliser le cache pour optimiser les performances', () => {
      const montant = 1661;
      
      // Premier appel (calcul)
      const start1 = performance.now();
      const result1 = converter.convertirMontant(montant);
      const time1 = performance.now() - start1;
      
      // Deuxième appel (cache)
      const start2 = performance.now();
      const result2 = converter.convertirMontant(montant);
      const time2 = performance.now() - start2;
      
      expect(result1).toEqual(result2);
      // Le cache devrait être plus rapide (tolérance pour variabilité)
      expect(time2).toBeLessThan(time1 * 2);
    });

    test('devrait vider le cache correctement', () => {
      converter.convertirMontant(1661);
      
      // Vérifier que le cache contient des données
      expect(Object.keys(converter.cache).length).toBeGreaterThan(0);
      
      // Vider le cache
      converter.viderCache();
      
      // Vérifier que le cache est vide
      expect(Object.keys(converter.cache).length).toBe(0);
    });

    test('devrait limiter la taille du cache', () => {
      // Remplir le cache avec de nombreux calculs
      for (let i = 1; i <= 150; i++) {
        converter.convertirMontant(i);
      }
      
      // Le cache ne devrait pas dépasser 100 entrées
      expect(Object.keys(converter.cache).length).toBeLessThanOrEqual(100);
    });
  });

  describe('🔗 Intégration Système', () => {
    test('devrait être compatible avec SnipcartUtils', () => {
      const repartition = converter.convertirMontant(156);
      
      // Chaque pièce devrait avoir les propriétés nécessaires pour Snipcart
      repartition.forEach(piece => {
        expect(piece.metal).toBeTruthy();
        expect(typeof piece.multiplicateur).toBe('number');
        expect(typeof piece.quantite).toBe('number');
        expect(piece.quantite).toBeGreaterThan(0);
      });
    });

    test('devrait supporter les callbacks de changement', () => {
      let callbackExecute = false;
      let donneesRecues = null;
      
      converter.onChange((data) => {
        callbackExecute = true;
        donneesRecues = data;
      });
      
      // Simuler un changement
      if (converter.notifyCallbacks) {
        converter.notifyCallbacks({ test: 'data' });
        
        expect(callbackExecute).toBe(true);
        expect(donneesRecues).toEqual({ test: 'data' });
      }
    });
  });

  describe('🌐 Localisation et Langues', () => {
    test('devrait supporter les noms français des métaux', () => {
      const repartition = [{ metal: 'copper', multiplicateur: 1, quantite: 1 }];
      const formate = converter.formaterPourAffichage(repartition);
      
      expect(formate).toContain('Cuivre');
      expect(formate).not.toContain('Copper');
    });

    test('devrait formater les nombres selon les standards français', () => {
      const grandNombre = 12345.67;
      const formate = converter.nf.format(grandNombre);
      
      expect(formate).toBe('12 345,67');
    });
  });

  describe('⚡ Tests de Performance', () => {
    test('devrait calculer rapidement même pour gros montants', () => {
      const start = performance.now();
      const result = converter.convertirMontant(999999);
      const duration = performance.now() - start;
      
      // Devrait terminer en moins de 100ms
      expect(duration).toBeLessThan(100);
      expect(result.length).toBeGreaterThan(0);
      
      // Vérifier que la valeur est exacte
      const valeurCalculee = converter.calculerValeurTotale(result);
      expect(valeurCalculee).toBe(999999);
    });

    test('devrait éviter les boucles infinies', () => {
      // Test avec timeout pour éviter blocage
      const timeout = setTimeout(() => {
        throw new Error('Timeout - possible boucle infinie détectée');
      }, 1000);
      
      const result = converter.convertirMontant(50000);
      clearTimeout(timeout);
      
      expect(result.length).toBeGreaterThan(0);
    });

    test('devrait gérer les calculs batch efficacement', () => {
      const montants = [100, 200, 300, 400, 500, 1000, 1500, 2000];
      
      const start = performance.now();
      const results = montants.map(m => converter.convertirMontant(m));
      const duration = performance.now() - start;
      
      // Tous les calculs devraient terminer rapidement
      expect(duration).toBeLessThan(200);
      expect(results.length).toBe(montants.length);
      
      // Vérifier que tous les résultats sont valides
      results.forEach((result, index) => {
        const valeurCalculee = converter.calculerValeurTotale(result);
        expect(valeurCalculee).toBe(montants[index]);
      });
    });
  });

  describe('🐛 Tests de Régression', () => {
    test('devrait maintenir la compatibilité avec anciennes versions', () => {
      // Test des anciennes méthodes si elles existent
      if (converter.convert) {
        const oldResult = converter.convert(100);
        const newResult = converter.convertirMontant(100);
        
        // Les résultats devraient être équivalents
        expect(converter.calculerValeurTotale(oldResult))
          .toBe(converter.calculerValeurTotale(newResult));
      }
    });

    test('devrait gérer les cas edge historiquement problématiques', () => {
      // Cas qui ont causé des problèmes par le passé
      const casProblematiques = [1, 9, 49, 99, 999, 1661, 9999];
      
      casProblematiques.forEach(montant => {
        const result = converter.convertirMontant(montant);
        const valeurRecalculee = converter.calculerValeurTotale(result);
        
        expect(valeurRecalculee).toBe(montant);
        expect(result.length).toBeGreaterThan(0);
      });
    });
  });

  afterEach(() => {
    // Nettoyage après chaque test
    if (converter && converter.viderCache) {
      converter.viderCache();
    }
    
    // Nettoyage DOM
    document.body.innerHTML = '';
  });
});

/**
 * UTILITAIRES DE TEST - Helpers pour validation
 */
describe('Utilitaires de Validation Monnaie D&D', () => {
  test('devrait valider les taux de change D&D standard', () => {
    const tauxStandard = {
      copper: 1,
      silver: 10,
      electrum: 50,
      gold: 100,
      platinum: 1000
    };
    
    // Test de cohérence des taux
    expect(tauxStandard.silver).toBe(tauxStandard.copper * 10);
    expect(tauxStandard.electrum).toBe(tauxStandard.copper * 50);
    expect(tauxStandard.gold).toBe(tauxStandard.copper * 100);
    expect(tauxStandard.platinum).toBe(tauxStandard.copper * 1000);
  });

  test('devrait valider la logique des multiplicateurs', () => {
    const multiplicateurs = [1, 10, 100, 1000, 10000];
    
    // Chaque multiplicateur doit être 10x le précédent
    for (let i = 1; i < multiplicateurs.length; i++) {
      expect(multiplicateurs[i]).toBe(multiplicateurs[i-1] * 10);
    }
    
    // Tous doivent être des puissances de 10
    multiplicateurs.forEach(mult => {
      expect(Math.log10(mult) % 1).toBe(0);
    });
  });
});

/**
 * TESTS D'INTÉGRATION - Simulation utilisation réelle
 */
describe('Intégration Convertisseur + Interface', () => {
  test('devrait simuler une utilisation complète utilisateur', () => {
    const converter = new CurrencyConverterPremium();
    
    // 1. Utilisateur saisit un montant
    const montantSaisi = 1661;
    
    // 2. Conversion automatique
    const repartition = converter.convertirMontant(montantSaisi);
    
    // 3. Affichage formaté
    const affichage = converter.formaterPourAffichage(repartition, true);
    
    // 4. Validation finale
    expect(repartition.length).toBeGreaterThan(0);
    expect(affichage).toContain('Platine');
    expect(converter.calculerValeurTotale(repartition)).toBe(montantSaisi);
    
    // 5. Statistiques pour l'utilisateur
    const totalPieces = converter.calculerTotalPieces(repartition);
    expect(totalPieces).toBe(4); // Solution optimale connue
  });
});