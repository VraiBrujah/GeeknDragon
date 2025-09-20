/* ========================================================================
   Geek & Dragon — Internationalization
   Gestion des langues et traductions
   ===================================================================== */

import { qs, qsa, getLang, setLang, whenSnipcart } from './utils.js';

/**
 * Initialise le système i18n
 */
export const initI18n = () => {
  const switcher = document.getElementById('lang-switcher');
  const defaultLang = 'fr';
  const available = ['fr', 'en'];

  let lang = getLang();
  if (!available.includes(lang)) lang = defaultLang;
  lang = setLang(lang);

  const setCurrent = (cur) => {
    qsa('.flag-btn[data-lang]').forEach((btn) => {
      if (btn.dataset.lang === cur) btn.setAttribute('aria-current', 'true');
      else btn.removeAttribute('aria-current');
    });
  };
  
  setCurrent(lang);
  whenSnipcart(() => window.Snipcart.api.session.setLanguage(lang));

  qsa('.flag-btn[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const picked = btn.dataset.lang;
      setLang(picked);
      setCurrent(picked);
      whenSnipcart(() => window.Snipcart.api.session.setLanguage(picked));
      loadTranslations(picked);
    });
  });

  loadTranslations(lang);
};

/**
 * Charge les traductions pour une langue
 */
function loadTranslations(current) {
  fetch(`/translations/${current}.json`)
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (!data) return;
      window.i18n = data;

      // Traductions générales
      qsa('[data-i18n]').forEach((el) => {
        const keys = el.dataset.i18n.split('.');
        let text = data;
        keys.forEach((k) => {
          if (text) text = text[k];
        });
        if (text != null) el.innerHTML = text;
      });

      // Champs produits (nom/desc/alt)
      qsa('[data-name-fr]').forEach((el) => {
        const target = current === 'en' ? el.dataset.nameEn : el.dataset.nameFr;
        if (target) el.innerHTML = target;
      });
      
      qsa('[data-alt-fr]').forEach((el) => {
        const target = current === 'en' ? el.dataset.altEn : el.dataset.altFr;
        if (target) el.setAttribute('alt', target);
      });

      // Boutons Snipcart
      qsa('.snipcart-add-item').forEach((btn) => {
        if (current === 'en') {
          if (btn.dataset.itemNameEn) btn.setAttribute('data-item-name', btn.dataset.itemNameEn);
          if (btn.dataset.itemDescriptionEn) btn.setAttribute('data-item-description', btn.dataset.itemDescriptionEn);
        } else {
          if (btn.dataset.itemNameFr) btn.setAttribute('data-item-name', btn.dataset.itemNameFr);
          if (btn.dataset.itemDescriptionFr) btn.setAttribute('data-item-description', btn.dataset.itemDescriptionFr);
        }
        
        const hasCustom = btn.hasAttribute('data-item-custom1-name') && data?.product?.multiplier;
        if (hasCustom) btn.setAttribute('data-item-custom1-name', data.product.multiplier);
      });

      // Sélecteurs de multiplicateur
      qsa('[data-role^="multiplier-"]').forEach((sel) => {
        const { role } = sel.dataset;
        const isFor = role?.split('-')[1];
        if (!isFor) return;
        sel.closest('.multiplier-wrapper')?.classList.toggle('hidden', isFor !== current);
      });

      // Mise à jour des boutons boutique
      if (typeof window.updatePlus === 'function') {
        qsa('.btn-shop[data-item-id]').forEach((btn) => {
          window.updatePlus(btn.dataset.itemId);
        });
      }
    })
    .catch(() => {
      const switcher = document.getElementById('lang-switcher');
      if (switcher) switcher.classList.add('hidden');
    });
}