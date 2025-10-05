/**
 * DÉFINITIONS TYPESCRIPT - Geek & Dragon - Standards v2.1.0
 * 
 * Types et interfaces pour le système e-commerce D&D avec
 * validation statique et IntelliSense amélioré.
 * 
 * COUVERTURE TYPES :
 * ==================
 * - Système monétaire D&D avec métaux et multiplicateurs
 * - Produits e-commerce avec variations personnalisables
 * - Intégration Snipcart avec champs personnalisés
 * - Convertisseur de monnaie avec algorithmes d'optimisation
 * - Système de traductions multilingue français/anglais
 * 
 * @author Brujah - Geek & Dragon
 * @version 2.1.0 - Types Français Complets
 * @since 2.0.0
 * @category Types
 * @package GeeknDragon\Types
 */

declare namespace GeeknDragon {
  
  /* ========================================================================
     SYSTÈME MONÉTAIRE D&D - Types de base
     ===================================================================== */

  /**
   * Métaux précieux disponibles dans l'univers D&D
   * Correspond aux 5 monnaies standard du Player's Handbook
   */
  type MetalType = 'copper' | 'silver' | 'electrum' | 'gold' | 'platinum';

  /**
   * Multiplicateurs physiques disponibles pour les pièces
   * Permet de créer des pièces de différentes valeurs (ex: 1 or = 100 cuivres)
   */
  type MultiplierType = 1 | 10 | 100 | 1000 | 10000;

  /**
   * Langues supportées par l'application
   */
  type LanguageCode = 'fr' | 'en';

  /**
   * Taux de change D&D standard en pièces de cuivre
   * Base de calcul pour toutes les conversions monétaires
   */
  interface ExchangeRates {
    readonly copper: 1;
    readonly silver: 10;
    readonly electrum: 50;
    readonly gold: 100;
    readonly platinum: 1000;
  }

  /**
   * Données d'une pièce avec métal, multiplicateur et quantité
   * Structure de base pour tous les calculs monétaires
   */
  interface CoinData {
    /** Type de métal de la pièce */
    metal: MetalType;
    /** Multiplicateur de valeur (ex: ×100 pour une pièce d'or de 100) */
    multiplicateur: MultiplierType;
    /** Nombre de pièces de ce type */
    quantite: number;
  }

  /**
   * Données étendues d'une pièce avec valeurs calculées
   * Inclut les informations dérivées pour affichage et validation
   */
  interface ExtendedCoinData extends CoinData {
    /** Valeur unitaire en cuivre de cette pièce */
    valeurUnitaire: number;
    /** Valeur totale (valeurUnitaire × quantité) */
    valeurTotale: number;
    /** Type de lot pour recommandations (optionnel) */
    typeLot?: 'single' | 'trio' | 'septuple' | 'quintessence';
  }

  /**
   * Métadonnées d'affichage pour chaque métal
   * Contient les informations visuelles et de localisation
   */
  interface MetalDisplayData {
    /** Nom français du métal */
    name: string;
    /** Nom anglais du métal */
    nameEn: string;
    /** Emoji représentatif */
    emoji: string;
    /** Couleur principale pour l'interface */
    color: string;
    /** Couleur de texte appropriée */
    textColor: string;
    /** Couleur de hover pour interactions */
    hoverColor: string;
  }

  /* ========================================================================
     PRODUITS E-COMMERCE - Structures de données
     ===================================================================== */

  /**
   * Structure d'un lot de pièces dans un produit
   * Définit quelles pièces sont incluses et en quelle quantité
   */
  interface CoinLot {
    /** Répartition des pièces par métal et multiplicateur */
    [key: string]: number; // Format: "metal_multiplier" => quantité
  }

  /**
   * Configuration des lots possibles pour un produit
   * Permet de gérer les produits personnalisables vs fixes
   */
  interface CoinLots {
    /** Type de personnalisation disponible */
    type: 'customizable' | 'fixed_quantity_chosen_multiplier' | 'fixed_complete';
    /** Multiplicateurs disponibles pour ce produit */
    multipliers?: MultiplierType[];
    /** Lots prédéfinis (pour produits fixes) */
    fixed_lots?: CoinLot[];
    /** Quantité totale pour produits semi-fixes */
    total_quantity?: number;
  }

  /**
   * Données complètes d'un produit e-commerce
   * Structure principale pour gestion produits
   */
  interface ProductData {
    /** Identifiant unique du produit */
    id: string;
    /** Nom d'affichage du produit */
    name: string;
    /** Prix en dollars canadiens */
    price: number;
    /** Description détaillée */
    description: string;
    /** Images du produit (chemins relatifs) */
    images: string[];
    /** Configuration des lots de pièces (optionnel) */
    coin_lots?: CoinLots;
    /** Stock disponible */
    stock?: number;
    /** Poids pour expédition */
    weight?: number;
    /** Dimensions pour expédition */
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    /** Métadonnées additionnelles */
    metadata?: Record<string, any>;
  }

  /**
   * Données de stock pour un produit
   * Synchronisé avec l'API Snipcart
   */
  interface StockData {
    /** Quantité disponible */
    stock: number;
    /** Dernière mise à jour */
    lastUpdated: string;
    /** Source de la donnée */
    source: 'local' | 'snipcart' | 'manual';
  }

  /* ========================================================================
     SNIPCART - Intégration e-commerce
     ===================================================================== */

  /**
   * Attributs requis pour bouton Snipcart
   * Configuration minimale pour intégration e-commerce
   */
  interface SnipcartButtonAttributes {
    /** Classe CSS pour identification */
    'class': string;
    /** Identifiant unique du produit */
    'data-item-id': string;
    /** Prix du produit */
    'data-item-price': string;
    /** URL du produit */
    'data-item-url': string;
    /** Nom du produit */
    'data-item-name': string;
    /** Description du produit */
    'data-item-description': string;
    /** Image du produit */
    'data-item-image': string;
    /** Quantité par défaut */
    'data-item-quantity'?: string;
    /** Poids pour expédition */
    'data-item-weight'?: string;
    /** Dimensions pour expédition */
    'data-item-length'?: string;
    'data-item-width'?: string;
    'data-item-height'?: string;
  }

  /**
   * Champs personnalisés Snipcart pour produits D&D
   * Permet la personnalisation métal/multiplicateur
   */
  interface SnipcartCustomFields {
    /** Métal sélectionné */
    'data-item-custom1-name'?: 'Métal' | 'Metal';
    'data-item-custom1-options'?: string;
    'data-item-custom1-value'?: MetalType;
    /** Multiplicateur sélectionné */
    'data-item-custom2-name'?: 'Multiplicateur' | 'Multiplier';
    'data-item-custom2-options'?: string;
    'data-item-custom2-value'?: string;
    /** Langue interface */
    'data-item-custom3-name'?: 'Langue' | 'Language';
    'data-item-custom3-value'?: LanguageCode;
  }

  /**
   * Configuration complète pour bouton Snipcart
   * Combine attributs de base et champs personnalisés
   */
  interface SnipcartConfig extends SnipcartButtonAttributes, SnipcartCustomFields {
    /** Options additionnelles */
    [key: string]: string | undefined;
  }

  /**
   * Options pour création de bouton d'ajout au panier
   * Configuration flexible pour différents contextes
   */
  interface AddToCartOptions {
    /** Quantité par défaut */
    quantity?: number;
    /** Champs personnalisés */
    customFields?: Partial<SnipcartCustomFields>;
    /** Classes CSS additionnelles */
    className?: string;
    /** Texte d'accessibilité */
    text?: string;
    /** Utiliser icône vs texte */
    useIconButton?: boolean;
    /** Attributs HTML additionnels */
    [key: string]: any;
  }

  /* ========================================================================
     CONVERTISSEUR DE MONNAIE - API et algorithmes
     ===================================================================== */

  /**
   * Résultat d'une conversion monétaire
   * Structure retournée par les algorithmes d'optimisation
   */
  interface ConversionResult {
    /** Répartition optimale des pièces */
    repartition: ExtendedCoinData[];
    /** Nombre total de pièces physiques */
    totalPieces: number;
    /** Valeur totale en cuivre */
    valeurTotale: number;
    /** Stratégie utilisée pour l'optimisation */
    strategie: number;
    /** Temps de calcul en millisecondes */
    tempsCalcul: number;
    /** Répartition utilisateur source (optionnel) */
    source?: Record<string, number>;
  }

  /**
   * Options pour algorithme de conversion
   * Paramètres pour personnaliser l'optimisation
   */
  interface ConversionOptions {
    /** Multiplicateurs disponibles */
    multiplicateursDisponibles?: MultiplierType[];
    /** Conserver les métaux source si possible */
    conserverMetaux?: boolean;
    /** Stratégie d'optimisation préférée */
    strategiePreferee?: number;
    /** Limite de timeout en millisecondes */
    timeoutMs?: number;
  }

  /**
   * Callback pour notifications de changement
   * Permet la réactivité de l'interface
   */
  type ChangeCallback = (data: any) => void;

  /**
   * Interface principale du convertisseur de monnaie
   * API publique pour tous les calculs monétaires
   */
  interface CurrencyConverter {
    /** Taux de change D&D */
    readonly tauxChange: ExchangeRates;
    /** Multiplicateurs disponibles */
    readonly multiplicateursDisponibles: MultiplierType[];
    /** Formateur numérique français */
    readonly nf: Intl.NumberFormat;

    /**
     * Convertit un montant en répartition optimale de pièces
     */
    convertirMontant(
      montantCuivre: number,
      multiplicateurs?: MultiplierType[],
      conserverMetaux?: boolean
    ): ExtendedCoinData[];

    /**
     * Calcule le nombre total de pièces physiques
     */
    calculerTotalPieces(repartition: CoinData[]): number;

    /**
     * Calcule la valeur totale en cuivre
     */
    calculerValeurTotale(repartition: CoinData[]): number;

    /**
     * Formate une répartition pour affichage
     */
    formaterPourAffichage(
      repartition: CoinData[],
      afficherMultiplicateurs?: boolean
    ): string;

    /**
     * Obtient la répartition saisie par l'utilisateur
     */
    obtenirRepartitionUtilisateur(): Record<string, number>;

    /**
     * Valide des données de pièce
     */
    validerDonnees(donnees: any, type: string): boolean;

    /**
     * Vide le cache de calculs
     */
    viderCache(): void;

    /**
     * Enregistre un callback de changement
     */
    onChange(callback: ChangeCallback): void;
  }

  /* ========================================================================
     OPTIMISEUR DE LOTS - Recommandations intelligentes
     ===================================================================== */

  /**
   * Résultat d'optimisation de lots
   * Recommandations pour achat optimal
   */
  interface LotOptimizationResult {
    /** Produits recommandés avec quantités */
    products: Array<{
      productId: string;
      name: string;
      quantity: number;
      price: number;
      totalPrice: number;
      coverage: Record<string, number>;
    }>;
    /** Prix total de la solution */
    totalPrice: number;
    /** Couverture exacte des besoins */
    exactCoverage: boolean;
    /** Surplus par rapport aux besoins */
    surplus: Record<string, number>;
    /** Économies par rapport à achat individuel */
    savings: number;
  }

  /**
   * Interface de l'optimiseur de lots
   * Algorithme du sac à dos pour recommandations
   */
  interface CoinLotOptimizer {
    /**
     * Trouve la combinaison optimale de produits
     */
    findOptimalProductCombination(needs: Record<string, number>): LotOptimizationResult;

    /**
     * Analyse les capacités d'un produit
     */
    analyzeLotCapabilities(
      coinLots: CoinLots,
      isCustomizable: boolean,
      multipliers: MultiplierType[]
    ): any[];

    /**
     * Extrait les produits de type pièce
     */
    extractCoinProducts(): Record<string, ProductData>;
  }

  /* ========================================================================
     TRADUCTIONS - Système i18n
     ===================================================================== */

  /**
   * Structure du dictionnaire de traductions
   * Organisation hiérarchique par domaine fonctionnel
   */
  interface TranslationDictionary {
    /** Métadonnées de pages */
    meta: {
      home: { title: string; desc: string };
      shop: { title: string; desc: string };
      contact: { title: string; desc: string };
      [key: string]: any;
    };
    /** Textes communs */
    common: {
      back: string;
      loading: string;
      error: string;
      success: string;
      [key: string]: string;
    };
    /** Interface boutique */
    shop: {
      addToCart: string;
      outOfStock: string;
      price: string;
      quantity: string;
      [key: string]: string;
    };
    /** Convertisseur de monnaie */
    converter: {
      title: string;
      metals: Record<MetalType, string>;
      multipliers: Record<string, string>;
      [key: string]: any;
    };
    /** Messages d'erreur */
    errors: {
      [key: string]: string;
    };
  }

  /**
   * Fonction de traduction
   * Récupère une chaîne traduite avec support de paramètres
   */
  type TranslationFunction = (
    key: string,
    defaultValue?: string,
    params?: Record<string, any>
  ) => string;

  /* ========================================================================
     CONFIGURATION GLOBALE - Variables d'environnement
     ===================================================================== */

  /**
   * Configuration SMTP pour envoi d'emails
   */
  interface SmtpConfig {
    host: string;
    username: string;
    password: string;
    port: number;
  }

  /**
   * Configuration application complète
   * Centralise tous les paramètres sensibles
   */
  interface AppConfig {
    /** Configuration SMTP */
    smtp: SmtpConfig;
    /** Clé API Snipcart publique */
    snipcart_api_key: string;
    /** Clé secrète Snipcart */
    snipcart_secret_api_key: string;
    /** URL de base pour liens absolus */
    base_url?: string;
    /** Mode debug */
    debug?: boolean;
  }

  /* ========================================================================
     ÉVÉNEMENTS ET INTERACTIONS - Types DOM
     ===================================================================== */

  /**
   * Événement personnalisé pour changement de monnaie
   */
  interface CurrencyChangeEvent extends CustomEvent {
    detail: {
      oldValue: Record<string, number>;
      newValue: Record<string, number>;
      totalValue: number;
    };
  }

  /**
   * Événement personnalisé pour ajout au panier
   */
  interface AddToCartEvent extends CustomEvent {
    detail: {
      productId: string;
      quantity: number;
      customFields: Record<string, any>;
      success: boolean;
    };
  }

  /* ========================================================================
     EXTENSIONS DOM - Éléments personnalisés
     ===================================================================== */

  /**
   * Extension de HTMLElement pour composants Geek & Dragon
   */
  interface GeeknDragonElement extends HTMLElement {
    /** Configuration du composant */
    config?: Record<string, any>;
    /** État interne */
    state?: Record<string, any>;
    /** Méthodes de cycle de vie */
    init?(): void;
    destroy?(): void;
    refresh?(): void;
  }

  /* ========================================================================
     UTILITAIRES ET HELPERS - Types génériques
     ===================================================================== */

  /**
   * Fonction de debounce générique
   */
  type DebouncedFunction<T extends (...args: any[]) => any> = T & {
    cancel(): void;
    flush(): void;
  };

  /**
   * Fonction de throttle générique
   */
  type ThrottledFunction<T extends (...args: any[]) => any> = T & {
    cancel(): void;
  };

  /**
   * Type utilitaire pour propriétés optionnelles
   */
  type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

  /**
   * Type utilitaire pour propriétés requises
   */
  type Required<T, K extends keyof T> = T & {
    [P in K]-?: T[P];
  };

  /**
   * Résultat d'une validation avec détails
   */
  interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    data?: any;
  }

  /**
   * Options pour appels API avec retry
   */
  interface ApiCallOptions {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    headers?: Record<string, string>;
  }
}

/* ========================================================================
   DÉCLARATIONS GLOBALES - Variables et fonctions
   ===================================================================== */

/**
 * Variables globales Geek & Dragon
 */
declare global {
  interface Window {
    /** Instance du convertisseur de monnaie */
    currencyConverter?: GeeknDragon.CurrencyConverter;
    /** Instance de l'optimiseur de lots */
    coinLotOptimizer?: GeeknDragon.CoinLotOptimizer;
    /** Données des produits chargées */
    productsData?: Record<string, GeeknDragon.ProductData>;
    /** Configuration de l'application */
    appConfig?: GeeknDragon.AppConfig;
    /** Fonction de traduction globale */
    __?: GeeknDragon.TranslationFunction;
    /** Utilitaires Snipcart */
    SnipcartUtils?: any;
  }

  /**
   * Extensions DOM pour événements personnalisés
   */
  interface HTMLElementEventMap {
    'currency-change': GeeknDragon.CurrencyChangeEvent;
    'add-to-cart': GeeknDragon.AddToCartEvent;
  }

  /**
   * API Snipcart (externe)
   */
  interface Snipcart {
    api: {
      items: {
        add(item: any): Promise<any>;
        remove(itemId: string): Promise<any>;
        clear(): Promise<any>;
      };
      cart: {
        items: {
          count(): number;
          total(): number;
        };
      };
    };
  }

  const Snipcart: Snipcart;
}

export = GeeknDragon;
export as namespace GeeknDragon;