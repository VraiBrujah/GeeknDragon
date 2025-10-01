<?php
/**
 * Vérification de compatibilité navigateur
 *
 * Détecte les navigateurs trop anciens qui ne supportent pas la syntaxe JavaScript moderne
 * (optional chaining, nullish coalescing, etc.) et affiche un avertissement.
 *
 * Ce script s'exécute immédiatement après le chargement du body pour maximiser
 * la visibilité de l'avertissement en cas de navigateur incompatible.
 */
?>

<!-- Détection de navigateur incompatible -->
<noscript>
  <div style="background:#dc2626;color:white;padding:20px;text-align:center;font-size:16px;position:fixed;top:0;left:0;right:0;z-index:99999;">
    <strong>⚠️ JavaScript est requis</strong><br>
    Ce site nécessite JavaScript pour fonctionner correctement.
  </div>
</noscript>

<script>
/**
 * Détection de compatibilité navigateur
 *
 * Teste la disponibilité des fonctionnalités JavaScript modernes critiques :
 * - Optional chaining (?.)
 * - Nullish coalescing (??)
 * - Template literals
 * - Arrow functions
 *
 * Si le navigateur ne supporte pas ces fonctionnalités, affiche un avertissement
 * et recommande de mettre à jour vers un navigateur moderne.
 */
(function() {
  'use strict';

  let isCompatible = true;
  const incompatibleReasons = [];

  try {
    // Test 1: Optional chaining (?.)
    eval('const test = {}?.test');
  } catch(e) {
    isCompatible = false;
    incompatibleReasons.push('Optional chaining non supporté');
  }

  try {
    // Test 2: Nullish coalescing (??)
    eval('const test = null ?? "default"');
  } catch(e) {
    isCompatible = false;
    incompatibleReasons.push('Nullish coalescing non supporté');
  }

  try {
    // Test 3: Template literals
    eval('const test = `template ${1}`');
  } catch(e) {
    isCompatible = false;
    incompatibleReasons.push('Template literals non supportés');
  }

  try {
    // Test 4: Arrow functions
    eval('const test = () => {}');
  } catch(e) {
    isCompatible = false;
    incompatibleReasons.push('Arrow functions non supportées');
  }

  try {
    // Test 5: const/let
    eval('const test = 1; let test2 = 2;');
  } catch(e) {
    isCompatible = false;
    incompatibleReasons.push('const/let non supportés');
  }

  // Si navigateur incompatible, afficher avertissement
  if (!isCompatible) {
    const currentLang = document.documentElement.lang || 'fr';

    const messages = {
      fr: {
        title: '⚠️ Navigateur Non Compatible',
        intro: 'Votre navigateur est trop ancien pour afficher ce site correctement.',
        recommendation: 'Veuillez utiliser une version récente de :',
        browsers: [
          'Chrome 80 ou plus récent',
          'Firefox 72 ou plus récent',
          'Safari 13.1 ou plus récent',
          'Edge 80 ou plus récent'
        ],
        technical: 'Détails techniques',
        reasons: incompatibleReasons,
        footer: 'Nous nous excusons pour le désagrément.'
      },
      en: {
        title: '⚠️ Incompatible Browser',
        intro: 'Your browser is too old to display this site correctly.',
        recommendation: 'Please use a recent version of:',
        browsers: [
          'Chrome 80 or newer',
          'Firefox 72 or newer',
          'Safari 13.1 or newer',
          'Edge 80 or newer'
        ],
        technical: 'Technical details',
        reasons: incompatibleReasons,
        footer: 'We apologize for the inconvenience.'
      }
    };

    const msg = messages[currentLang] || messages.fr;

    // Construction du message HTML
    let html = '<div style="background:#1f2937;color:white;padding:40px 20px;text-align:center;font-family:system-ui,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;">';
    html += '<div style="max-width:600px;">';
    html += '<h1 style="color:#dc2626;font-size:28px;margin-bottom:20px;">' + msg.title + '</h1>';
    html += '<p style="font-size:18px;line-height:1.6;margin-bottom:30px;">' + msg.intro + '</p>';
    html += '<div style="background:#374151;padding:20px;border-radius:8px;margin-bottom:20px;">';
    html += '<p style="font-weight:bold;margin-bottom:15px;font-size:16px;">' + msg.recommendation + '</p>';
    html += '<ul style="list-style:none;padding:0;margin:0;">';
    msg.browsers.forEach(function(browser) {
      html += '<li style="padding:8px 0;font-size:15px;">✓ ' + browser + '</li>';
    });
    html += '</ul></div>';

    // Détails techniques (masqués par défaut)
    if (incompatibleReasons.length > 0) {
      html += '<details style="text-align:left;background:#374151;padding:15px;border-radius:8px;margin-bottom:20px;cursor:pointer;">';
      html += '<summary style="font-weight:bold;font-size:14px;cursor:pointer;">' + msg.technical + '</summary>';
      html += '<ul style="margin-top:10px;padding-left:20px;font-size:13px;color:#d1d5db;">';
      incompatibleReasons.forEach(function(reason) {
        html += '<li style="padding:4px 0;">' + reason + '</li>';
      });
      html += '</ul></details>';
    }

    html += '<p style="font-size:14px;color:#9ca3af;margin-top:30px;">' + msg.footer + '</p>';
    html += '</div></div>';

    // Remplacer le contenu de la page
    document.body.innerHTML = html;

    // Empêcher l'exécution des scripts suivants
    throw new Error('Browser incompatible - stopping execution');
  }
})();
</script>
