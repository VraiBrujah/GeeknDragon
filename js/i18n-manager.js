/**
 * Gestionnaire de traduction I18N - Standards v1.0.0
 *
 * Module unifié pour la gestion multilingue côté client avec :
 * - Lazy loading des traductions JSON
 * - Cache intelligent avec invalidation
 * - Support notation pointée (ex: "shop.hero.title")
 * - Fallback automatique vers langue par défaut
 * - Intégration transparente avec le système PHP
 *
 * @author Brujah - Geek & Dragon
 * @version 1.0.0
 * @category Internationalisation
 * @package GeeknDragon\JavaScript
 */

/* eslint-disable no-console */

class I18nManager {
  /**
   * Constructeur du gestionnaire de traduction
   *
   * @param {Object} options Options de configuration
   * @param {string} options.defaultLang Langue par défaut ('fr')
   * @param {string[]} options.availableLangs Langues disponibles
   * @param {string} options.translationsPath Chemin vers les fichiers JSON
   * @param {boolean} options.debug Mode debug pour logs détaillés
   * @param {number} options.cacheExpiry Durée de validité du cache en ms (24h par défaut)
   */
  constructor(options = {}) {
    this.defaultLang = options.defaultLang || 'fr';
    this.availableLangs = options.availableLangs || ['fr', 'en', 'es', 'de'];
    this.translationsPath = options.translationsPath || '/lang/';
    this.debug = options.debug || false;
    this.cacheExpiry = options.cacheExpiry || 24 * 60 * 60 * 1000; // 24 heures

    this.currentLang = this.defaultLang;
    this.translations = {};
    this.loadPromises = {};

    // Initialisation depuis HTML ou cookies
    this._initializeLanguage();

    // Binding des méthodes pour utilisation externe
    this.t = this.t.bind(this);
    this.translate = this.translate.bind(this);
  }

  /**
   * Initialise la langue courante depuis le cookie PHP (source de vérité)
   *
   * IMPORTANT: Le cookie PHP a la priorité ABSOLUE. Si localStorage contient
   * une valeur différente, elle est ÉCRASÉE pour maintenir la synchronisation.
   * Cela évite les problèmes de cache où l'utilisateur reste bloqué dans une langue.
   *
   * @private
   * @returns {string} Code langue détecté
   */
  _initializeLanguage() {
    // 1. Cookie PHP = source de vérité ABSOLUE (priorité 1)
    const cookieLang = this._getCookie('lang');
    if (cookieLang && this.availableLangs.includes(cookieLang)) {
      this.currentLang = cookieLang;

      // Synchroniser localStorage avec le cookie pour cohérence
      const storedLang = localStorage.getItem('lang');
      if (storedLang !== cookieLang) {
        localStorage.setItem('lang', cookieLang);
      }

      return this.currentLang;
    }

    // 2. Essayer localStorage (si pas de cookie)
    const storedLang = localStorage.getItem('lang');
    if (storedLang && this.availableLangs.includes(storedLang)) {
      this.currentLang = storedLang;
      return this.currentLang;
    }

    // 3. Essayer attribut HTML
    const htmlLang = document.documentElement.lang;
    if (htmlLang && this.availableLangs.includes(htmlLang.toLowerCase())) {
      this.currentLang = htmlLang.toLowerCase();
      return this.currentLang;
    }

    // 4. Fallback langue par défaut
    this.currentLang = this.defaultLang;
    return this.currentLang;
  }

  /**
   * Récupère un cookie par son nom
   *
   * @private
   * @param {string} name Nom du cookie
   * @returns {string|null} Valeur du cookie ou null
   */
  _getCookie(name) {
    try {
      const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
      return match ? match[1] : null;
    } catch (error) {
      if (this.debug) console.warn(`[I18n] Erreur lecture cookie "${name}":`, error);
      return null;
    }
  }

  /**
   * Génère une clé de cache pour localStorage
   *
   * @private
   * @param {string} lang Code langue
   * @returns {string} Clé de cache
   */
  _getCacheKey(lang) {
    return `i18n_${lang}_v6`;
  }

  /**
   * Charge les traductions depuis le cache ou le serveur
   *
   * @param {string} lang Code langue à charger
   * @returns {Promise<Object>} Promesse résolue avec les traductions
   */
  async loadTranslations(lang) {
    // Éviter les chargements multiples simultanés
    if (this.loadPromises[lang]) {
      return this.loadPromises[lang];
    }

    // Vérifier si déjà chargé en mémoire
    if (this.translations[lang]) {
      return this.translations[lang];
    }

    // Essayer le cache localStorage
    const cacheKey = this._getCacheKey(lang);
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsedCache = JSON.parse(cached);
        const now = Date.now();

        // Vérifier validité du cache
        if (parsedCache.timestamp && (now - parsedCache.timestamp < this.cacheExpiry)) {
          this.translations[lang] = parsedCache.data;
          if (this.debug) console.log(`[I18n] Traductions "${lang}" chargées depuis cache`);
          return parsedCache.data;
        } else {
          // Cache expiré, le supprimer
          localStorage.removeItem(cacheKey);
          if (this.debug) console.log(`[I18n] Cache expiré pour "${lang}", rechargement...`);
        }
      }
    } catch (error) {
      if (this.debug) console.warn(`[I18n] Erreur lecture cache pour "${lang}":`, error);
    }

    // Charger depuis le serveur
    const loadPromise = this._fetchTranslations(lang);
    this.loadPromises[lang] = loadPromise;

    try {
      const data = await loadPromise;
      this.translations[lang] = data;

      // Mettre en cache
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          timestamp: Date.now(),
          data: data
        }));
      } catch (error) {
        if (this.debug) console.warn(`[I18n] Impossible de mettre en cache "${lang}":`, error);
      }

      delete this.loadPromises[lang];
      return data;
    } catch (error) {
      delete this.loadPromises[lang];
      throw error;
    }
  }

  /**
   * Récupère les traductions depuis le serveur
   *
   * @private
   * @param {string} lang Code langue
   * @returns {Promise<Object>} Traductions JSON
   * @throws {Error} Si le chargement échoue
   */
  async _fetchTranslations(lang) {
    const url = `${this.translationsPath}${lang}.json`;

    try {
      if (this.debug) console.log(`[I18n] Chargement traductions depuis ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'max-age=3600'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (this.debug) console.log(`[I18n] Traductions "${lang}" chargées avec succès`);
      return data;
    } catch (error) {
      console.error(`[I18n] Erreur chargement traductions "${lang}":`, error);
      throw error;
    }
  }

  /**
   * Change la langue courante et charge les traductions
   *
   * @param {string} lang Code langue cible
   * @returns {Promise<boolean>} Succès du changement
   */
  async changeLanguage(lang) {
    if (!this.availableLangs.includes(lang)) {
      console.warn(`[I18n] Langue "${lang}" non disponible, fallback vers "${this.defaultLang}"`);
      lang = this.defaultLang;
    }

    try {
      // Charger les nouvelles traductions
      await this.loadTranslations(lang);
      this.currentLang = lang;

      // Persister le choix dans localStorage et cookie
      localStorage.setItem('lang', lang);
      localStorage.setItem('snipcartLanguage', lang);

      // Mettre à jour le cookie PHP pour synchronisation
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      document.cookie = `lang=${lang}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;

      // Mettre à jour l'attribut HTML
      document.documentElement.lang = lang;

      if (this.debug) console.log(`[I18n] Langue changée vers "${lang}"`);
      return true;
    } catch (error) {
      console.error(`[I18n] Échec changement langue vers "${lang}":`, error);
      return false;
    }
  }

  /**
   * Récupère une traduction par clé avec support notation pointée
   *
   * Supporte les clés imbriquées comme "shop.hero.title" et retourne
   * automatiquement le fallback si la traduction n'existe pas.
   *
   * @param {string} key Clé de traduction (notation pointée supportée)
   * @param {string} fallback Texte de fallback si traduction non trouvée
   * @param {Object} replacements Remplacements de variables {var: valeur}
   * @param {string} lang Langue spécifique (optionnel, utilise courante par défaut)
   * @returns {string} Texte traduit ou fallback
   *
   * @example
   * // Traduction simple
   * i18n.t('nav.home', 'Accueil') // => "Accueil" ou traduction
   *
   * @example
   * // Avec remplacements
   * i18n.t('product.price', 'Prix: {amount}', {amount: '25$'}) // => "Prix: 25$"
   */
  t(key, fallback = '', replacements = {}, lang = null) {
    const targetLang = lang || this.currentLang;
    const translations = this.translations[targetLang];

    if (!translations) {
      if (this.debug) console.warn(`[I18n] Traductions non chargées pour "${targetLang}"`);
      return this._applyReplacements(fallback, replacements);
    }

    // Navigation dans l'objet avec notation pointée
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        if (this.debug) console.warn(`[I18n] Clé "${key}" introuvable, utilisation fallback`);
        return this._applyReplacements(fallback, replacements);
      }
    }

    if (typeof value !== 'string') {
      if (this.debug) console.warn(`[I18n] Valeur pour "${key}" n'est pas une chaîne, utilisation fallback`);
      return this._applyReplacements(fallback, replacements);
    }

    return this._applyReplacements(value, replacements);
  }

  /**
   * Applique les remplacements de variables dans une chaîne
   *
   * @private
   * @param {string} text Texte avec variables {var}
   * @param {Object} replacements Remplacements {var: valeur}
   * @returns {string} Texte avec variables remplacées
   */
  _applyReplacements(text, replacements) {
    if (!replacements || typeof replacements !== 'object' || Object.keys(replacements).length === 0) {
      return text;
    }

    let result = text;
    for (const [key, value] of Object.entries(replacements)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, String(value));
    }

    return result;
  }

  /**
   * Alias pour t() - compatibilité avec conventions communes
   *
   * @param {string} key Clé de traduction
   * @param {string} fallback Texte de fallback
   * @param {Object} replacements Remplacements de variables
   * @returns {string} Texte traduit
   */
  translate(key, fallback = '', replacements = {}) {
    return this.t(key, fallback, replacements);
  }

  /**
   * Met à jour tous les éléments HTML avec attribut data-i18n
   *
   * Parcourt le DOM et traduit automatiquement tous les éléments
   * ayant l'attribut data-i18n="cle.de.traduction".
   * Supporte aussi les attributs data-i18n-{attr}="cle" pour traduire
   * les attributs HTML (title, aria-label, alt, placeholder, etc.)
   *
   * @param {HTMLElement} root Élément racine (document par défaut)
   * @returns {number} Nombre d'éléments traduits
   */
  updateDOM(root = document) {
    let count = 0;

    // 1. Traduire textContent avec data-i18n
    const elements = root.querySelectorAll('[data-i18n]');

    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const fallback = element.innerHTML || '';
      const translated = this.t(key, fallback);

      if (translated && translated !== fallback) {
        element.innerHTML = translated;
        count++;
      }
    });

    // 2. Traduire attributs HTML avec data-i18n-{attr}
    const attributeElements = root.querySelectorAll('[data-i18n-title], [data-i18n-aria-label], [data-i18n-alt], [data-i18n-placeholder]');
    attributeElements.forEach(element => {
      // title
      if (element.hasAttribute('data-i18n-title')) {
        const key = element.getAttribute('data-i18n-title');
        const translated = this.t(key, '');
        if (translated) {
          element.setAttribute('title', translated);
          count++;
        }
      }

      // aria-label
      if (element.hasAttribute('data-i18n-aria-label')) {
        const key = element.getAttribute('data-i18n-aria-label');
        const translated = this.t(key, '');
        if (translated) {
          element.setAttribute('aria-label', translated);
          count++;
        }
      }

      // alt
      if (element.hasAttribute('data-i18n-alt')) {
        const key = element.getAttribute('data-i18n-alt');
        const translated = this.t(key, '');
        if (translated) {
          element.setAttribute('alt', translated);
          count++;
        }
      }

      // placeholder
      if (element.hasAttribute('data-i18n-placeholder')) {
        const key = element.getAttribute('data-i18n-placeholder');
        const translated = this.t(key, '');
        if (translated) {
          element.setAttribute('placeholder', translated);
          count++;
        }
      }
    });

    return count;
  }

  /**
   * Invalide le cache des traductions
   *
   * @param {string|null} lang Langue spécifique ou toutes si null
   */
  clearCache(lang = null) {
    if (lang) {
      localStorage.removeItem(this._getCacheKey(lang));
      delete this.translations[lang];
      if (this.debug) console.log(`[I18n] Cache invalidé pour "${lang}"`);
    } else {
      // Invalider toutes les langues
      this.availableLangs.forEach(l => {
        localStorage.removeItem(this._getCacheKey(l));
        delete this.translations[l];
      });
      if (this.debug) console.log('[I18n] Cache complet invalidé');
    }
  }

  /**
   * Retourne la langue courante
   *
   * @returns {string} Code langue courante
   */
  getCurrentLanguage() {
    return this.currentLang;
  }

  /**
   * Retourne toutes les traductions chargées
   *
   * @param {string} lang Langue spécifique (optionnel)
   * @returns {Object} Traductions
   */
  getTranslations(lang = null) {
    return lang ? this.translations[lang] : this.translations[this.currentLang];
  }
}

// Export global pour compatibilité
if (typeof window !== 'undefined') {
  window.I18nManager = I18nManager;
}

// Export module ES6
export default I18nManager;
