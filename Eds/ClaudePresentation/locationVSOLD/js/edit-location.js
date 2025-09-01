// Interface Éditeur LOCATION - Synchronisation Instantanée
const { sanitizeHTML } = typeof require !== 'undefined'
  ? require('./utils/sanitizer')
  : window;

document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ Éditeur LOCATION avec Synchronisation Instantanée activé');

  /**
     * Attente : initialisation complète d'InstantSync.
     *
     * @param {Function} callback - Fonction exécutée lorsque le module est prêt.
     */
  function waitForInstantSync(callback) {
    if (window.instantSync && window.instantSync.isInitialized) {
      callback();
    } else {
      console.log('⏳ Attente initialisation InstantSync...');
      setTimeout(() => waitForInstantSync(callback), 100);
    }
  }

  /**
     * Synchronisation manuelle puis ouverture de la page de présentation.
     *
     * @returns {void}
     */
  window.togglePreview = function () {
    console.log('🔄 Prévisualisation LOCATION - Déclenchement synchronisation manuelle...');

    waitForInstantSync(() => {
      // Déclenchement : synchronisation manuelle immédiate
      if (window.instantSync) {
        // Force : synchronisation complète avant prévisualisation
        window.instantSync.executeInstantSync(true); // true = forcer sync complète
        console.log('✅ Synchronisation manuelle LOCATION terminée');

        // Ouverture : page de présentation après synchronisation
        setTimeout(() => {
          window.open('location.html', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
          console.log('👁️ Page de présentation LOCATION ouverte');
        }, 200); // Délai pour assurer la synchronisation
      } else {
        console.error('❌ InstantSync non disponible pour synchronisation manuelle');
        // Ouverture sans sync en cas d'échec
        window.open('location.html', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
      }
    });
  };

  /**
   * Fonction : activation de l'interface d'administration EDS Framework
   *
   * Rôle : Point d'entrée principal pour accéder au panneau admin universel
   * Responsabilité : Initialiser et afficher l'interface d'administration EDS
   * Fallback : Création d'interface simple si module admin non disponible
   * Intégration : Connecte le bouton HTML avec le système EDSAdminInterface
   */
  window.toggleAdminInterface = function () {
    console.log('🔧 Activation Interface Admin EDS Framework...');

    try {
      // Priorité 1 : EDS Framework (nouveau système universel)
      if (window.EDSFramework && window.EDSFramework.admin && typeof window.EDSFramework.admin.toggle === 'function') {
        console.log('✅ EDS Framework Admin détectée');
        window.EDSFramework.admin.toggle();
        return;
      }

      // Priorité 2 : Li-CUBE PRO™ Core (ancien système, compatibilité)
      if (window.LiCubeAdmin && typeof window.LiCubeAdmin.toggle === 'function') {
        console.log('✅ Li-CUBE PRO™ Core Admin détectée (mode compatibilité)');
        window.LiCubeAdmin.toggle();
        return;
      }

      // Priorité 3 : Framework Li-CUBE complet (ancien système complexe)
      if (window.LiCube && window.LiCube.framework && window.LiCube.framework.admin) {
        console.log('✅ Interface Admin framework Li-CUBE détectée (mode compatibilité)');
        window.LiCube.framework.admin.toggle();
        return;
      }

      // Priorité 4 : Instance AdminInterface globale standalone
      if (window.adminInterface && typeof window.adminInterface.toggle === 'function') {
        console.log('✅ Instance AdminInterface globale trouvée (mode compatibilité)');
        window.adminInterface.toggle();
        return;
      }

      // Diagnostic : état des modules pour debug
      console.warn('🔍 Diagnostic modules EDS Framework:');
      console.warn('- window.EDSFramework:', !!window.EDSFramework);
      console.warn('- window.EDSProductTemplates:', !!window.EDSProductTemplates);
      console.warn('- window.LiCubeCore:', !!window.LiCubeCore);
      console.warn('- window.LiCubeAdmin:', !!window.LiCubeAdmin);
      console.warn('- window.adminInterface:', !!window.adminInterface);
      console.warn('- window.instantSync:', !!window.instantSync);
      console.warn('- Classes EDS détectées:', Object.keys(window).filter((k) => k.includes('EDS')));

      // Fallback : interface de diagnostic améliorée
      console.warn('⚠️ Interface admin avancée non disponible, création interface de diagnostic...');
      createFallbackAdminInterface();
    } catch (error) {
      console.error('❌ Erreur activation interface admin:', error);
      alert('Interface d\'administration temporairement indisponible.\nVeuillez actualiser la page.');
    }
  };

  // Validation : formats email et téléphone
  setupFieldValidation();

  /**
     * Importation : gestion du fichier sélectionné via le champ caché.
     *
     * @param {Event} event - Événement `change` du champ de fichier.
     */
  window.handleImport = function (event) {
    const file = event.target.files[0];
    if (file && window.instantSync) {
      window.instantSync.importContent(file);
    }
  };

  // Raccourcis clavier : Prévisualiser (Ctrl+P), Exporter (Ctrl+E), Importer (Ctrl+I)
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'p') {
      event.preventDefault();
      togglePreview();
    } else if (event.ctrlKey && event.key === 'e') {
      event.preventDefault();
      if (window.instantSync) {
        window.instantSync.exportContent();
      }
    } else if (event.ctrlKey && event.key === 'i') {
      event.preventDefault();
      document.getElementById('import-file').click();
    }
  });

  console.log('🎯 Éditeur LOCATION - Prêt pour synchronisation instantanée');
});

/**
 * Validation : contrôles de format pour les champs spéciaux.
 *
 * @returns {void}
 */
function setupFieldValidation() {
  const emailFields = document.querySelectorAll('input[type="email"]');
  const telFields = document.querySelectorAll('input[type="tel"]');

  emailFields.forEach((field) => {
    field.addEventListener('blur', function () {
      if (this.value && !isValidEmail(this.value)) {
        this.style.borderColor = '#EF4444';
        this.title = 'Format d\'email invalide';
      } else {
        this.style.borderColor = '';
        this.title = '';
      }
    });
  });

  telFields.forEach((field) => {
    field.addEventListener('blur', function () {
      if (this.value && !isValidPhone(this.value)) {
        this.style.borderColor = '#EF4444';
        this.title = 'Format de téléphone invalide';
      } else {
        this.style.borderColor = '';
        this.title = '';
      }
    });
  });
}

/**
 * Fonction : création d'interface d'administration fallback
 *
 * Rôle : Interface admin simplifiée si le module principal n'est pas disponible
 * Type : Fallback function - Solution de repli fonctionnelle
 * Fonctionnalités : Affichage modal avec informations système de base
 * Utilisation : Automatique si AdminInterface avancé non chargé
 */
function createFallbackAdminInterface() {
  // Rôle : Prévention des doublons d'interface
  if (document.getElementById('fallback-admin-modal')) {
    document.getElementById('fallback-admin-modal').remove();
  }

  // Rôle : Structure HTML de l'interface fallback
  const modal = document.createElement('div');
  modal.id = 'fallback-admin-modal';
  modal.innerHTML = sanitizeHTML(`
    <div class="fallback-admin-overlay" onclick="this.parentElement.remove()">
      <div class="fallback-admin-content" onclick="event.stopPropagation()">
        <div class="fallback-admin-header">
          <h2><i class="fas fa-cogs"></i> Interface Admin - Mode Fallback</h2>
          <button class="fallback-close" onclick="this.closest('.fallback-admin-overlay').parentElement.remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="fallback-admin-body">
          <div class="fallback-info-card">
            <h3><i class="fas fa-info-circle"></i> État du Système</h3>
            <ul>
              <li>Li-CUBE PRO™ Core: ${window.LiCubeCore ? `✅ Chargé v${window.LiCubeCore.version}` : '❌ Non disponible'}</li>
              <li>Interface Admin Core: ${window.LiCubeAdmin ? '✅ Disponible' : '❌ Non chargée'}</li>
              <li>Configuration Core: ${window.LiCubeConfig ? '✅ Opérationnelle' : '❌ Non chargée'}</li>
              <li>InstantSync: ${window.instantSync ? '✅ Opérationnel' : '❌ Non chargé'}</li>
              <li>Modules détectés:</li>
              <ul style="margin-left: 20px; margin-top: 10px;">
                ${Object.keys(window).filter((k) => k.startsWith('LiCube')).map((k) => `<li>${k}: ✅</li>`).join('') || '<li>Aucun module Li-CUBE détecté</li>'}
              </ul>
            </ul>
          </div>
          <div class="fallback-actions">
            <button onclick="location.reload()" class="fallback-btn-primary">
              <i class="fas fa-sync-alt"></i> Actualiser la page
            </button>
            <button onclick="console.log('Debug info:', {LiCube: window.LiCube, instantSync: window.instantSync})" class="fallback-btn-secondary">
              <i class="fas fa-bug"></i> Infos Debug Console
            </button>
          </div>
        </div>
      </div>
    </div>
  `);

  // Rôle : Styles CSS intégrés pour l'interface fallback
  const style = document.createElement('style');
  style.textContent = `
    .fallback-admin-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
      background: rgba(0,0,0,0.8); z-index: 10000;
      display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(5px);
    }
    .fallback-admin-content {
      background: var(--primary-dark, #0F172A); border-radius: 16px;
      min-width: 500px; max-width: 90vw; box-shadow: 0 20px 40px rgba(0,0,0,0.5);
      border: 1px solid var(--accent-green, #10B981);
    }
    .fallback-admin-header {
      padding: 1.5rem; border-bottom: 1px solid var(--accent-green, #10B981);
      display: flex; justify-content: space-between; align-items: center;
    }
    .fallback-admin-header h2 {
      color: var(--accent-green, #10B981); margin: 0; font-size: 1.4rem;
    }
    .fallback-close {
      background: none; border: none; color: var(--text-white, white);
      font-size: 1.2rem; cursor: pointer; padding: 0.5rem;
      border-radius: 4px; transition: background 0.3s;
    }
    .fallback-close:hover { background: rgba(239,68,68,0.2); }
    .fallback-admin-body { padding: 1.5rem; }
    .fallback-info-card {
      background: rgba(16,185,129,0.1); border: 1px solid var(--accent-green, #10B981);
      border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;
    }
    .fallback-info-card h3 { color: var(--accent-green, #10B981); margin-top: 0; }
    .fallback-info-card ul { color: var(--text-white, white); }
    .fallback-actions { display: flex; gap: 1rem; justify-content: center; }
    .fallback-btn-primary, .fallback-btn-secondary {
      padding: 0.75rem 1.5rem; border: none; border-radius: 8px;
      cursor: pointer; font-weight: 600; transition: all 0.3s;
      display: flex; align-items: center; gap: 0.5rem;
    }
    .fallback-btn-primary {
      background: var(--accent-green, #10B981); color: white;
    }
    .fallback-btn-secondary {
      background: var(--accent-blue, #3B82F6); color: white;
    }
    .fallback-btn-primary:hover, .fallback-btn-secondary:hover {
      transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
  `;

  // Injection : ajout du modal et styles au DOM
  document.head.appendChild(style);
  document.body.appendChild(modal);

  console.log('✅ Interface Admin fallback créée et affichée');
}

// Utilitaires : validation des formats
/**
 * Rôle : Vérifie qu'une chaîne respecte le format d'une adresse email.
 * Type : Fonction utilitaire – entrée {string} sans unité, sortie {boolean}.
 * Domaine de valeurs : Chaîne contenant une partie locale, un '@' et un domaine.
 * Exemple : "contact@example.com".
 * Logique : expression régulière vérifiant du texte avant et après '@' ainsi qu'un point dans le domaine.
 *
 * @param {string} email - Adresse email à valider.
 * @returns {boolean} Retourne `true` si le format est valide.
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Rôle : Vérifie qu'une chaîne correspond à un numéro de téléphone nord-américain standard.
 * Type : Fonction utilitaire – entrée {string} sans unité, sortie {boolean}.
 * Domaine de valeurs : Autorise le préfixe +1, les parenthèses, espaces, tirets ou points comme séparateurs.
 * Exemple : "+1 (123) 456-7890".
 * Logique : expression régulière acceptant optionnellement +1 et formée de groupes de chiffres séparés.
 *
 * @param {string} phone - Numéro de téléphone à valider.
 * @returns {boolean} Retourne `true` si le format est valide.
 */
function isValidPhone(phone) {
  const phoneRegex = /^(\+1[-.\s]?)?(\(?[0-9]{3}\)?[-.\s]?)?[0-9]{3}[-.\s]?[0-9]{4}$/;
  return phoneRegex.test(phone);
}

// Chargement des valeurs par défaut depuis un fichier JSON centralisé
let defaultValues = {};
const defaultsLoaded = fetch('location-defaults.json')
  .then((resp) => resp.json())
  .then((data) => {
    defaultValues = data;
  })
  .catch((err) => console.error('Erreur de chargement des valeurs par défaut:', err));

/**
 * Bascule l'affichage du panneau d'édition CSS.
 *
 * @returns {void}
 */
function toggleCSSEditor() {
  const editor = document.getElementById('cssEditor');
  const toggle = document.querySelector('.css-toggle i');

  if (editor.classList.contains('collapsed')) {
    editor.classList.remove('collapsed');
    toggle.className = 'fas fa-chevron-up';
  } else {
    editor.classList.add('collapsed');
    toggle.className = 'fas fa-chevron-down';
  }
}

/**
 * Applique les styles saisis en temps réel aux vues d'édition et de présentation.
 *
 * @returns {void}
 */
function applyStyles() {
  // Collecte de tous les styles actuels
  const currentStyles = {};
  Object.keys(defaultValues).forEach((key) => {
    const element = document.getElementById(key);
    if (element) currentStyles[key] = element.value;
  });

  // Application des styles à la page d'édition elle-même
  if (typeof applyDynamicCSSToEditPage === 'function') {
    applyDynamicCSSToEditPage(currentStyles);
  }

  console.log('🎨 Styles appliqués à la page d\'édition en temps réel');
}

/**
 * Met à jour les affichages de valeurs numériques liés aux contrôles.
 *
 * @returns {void}
 */
function updateValueDisplays() {
  // Navigation
  if (document.getElementById('navTitleSizeValue')) {
    document.getElementById('navTitleSizeValue').textContent = `${document.getElementById('navTitleSize').value}px`;
  }
  if (document.getElementById('navItemSizeValue')) {
    document.getElementById('navItemSizeValue').textContent = `${document.getElementById('navItemSize').value}px`;
  }
  if (document.getElementById('navPaddingValue')) {
    document.getElementById('navPaddingValue').textContent = `${document.getElementById('navPadding').value}px`;
  }

  // Hero Section
  if (document.getElementById('heroTitleSizeValue')) {
    document.getElementById('heroTitleSizeValue').textContent = `${document.getElementById('heroTitleSize').value}px`;
  }
  if (document.getElementById('heroHighlightSizeValue')) {
    document.getElementById('heroHighlightSizeValue').textContent = `${document.getElementById('heroHighlightSize').value}px`;
  }
  if (document.getElementById('heroSubtitleSizeValue')) {
    document.getElementById('heroSubtitleSizeValue').textContent = `${document.getElementById('heroSubtitleSize').value}px`;
  }

  // Prix Banner
  if (document.getElementById('priceMainSizeValue')) {
    document.getElementById('priceMainSizeValue').textContent = `${document.getElementById('priceMainSize').value}px`;
  }
  if (document.getElementById('priceSubSizeValue')) {
    document.getElementById('priceSubSizeValue').textContent = `${document.getElementById('priceSubSize').value}px`;
  }
  if (document.getElementById('pricePaddingValue')) {
    document.getElementById('pricePaddingValue').textContent = `${document.getElementById('pricePadding').value}px`;
  }

  // Section Titles
  if (document.getElementById('sectionTitleSizeValue')) {
    document.getElementById('sectionTitleSizeValue').textContent = `${document.getElementById('sectionTitleSize').value}px`;
  }

  // Rôle : Mise à jour des affichages de valeurs pour l'élément VS
  // Responsabilité : Synchronisation visuelle des contrôles avec leurs valeurs
  // Élément VS (Comparaison)
  if (document.getElementById('vsFontSizeValue')) {
    document.getElementById('vsFontSizeValue').textContent = `${document.getElementById('vsFontSize').value}rem`;
  }
  if (document.getElementById('vsLetterSpacingValue')) {
    document.getElementById('vsLetterSpacingValue').textContent = `${document.getElementById('vsLetterSpacing').value}em`;
  }

  // Cards et Benefits
  if (document.getElementById('cardPaddingValue')) {
    document.getElementById('cardPaddingValue').textContent = `${document.getElementById('cardPadding').value}px`;
  }
  if (document.getElementById('cardBorderRadiusValue')) {
    document.getElementById('cardBorderRadiusValue').textContent = `${document.getElementById('cardBorderRadius').value}px`;
  }
  if (document.getElementById('benefitIconSizeValue')) {
    document.getElementById('benefitIconSizeValue').textContent = `${document.getElementById('benefitIconSize').value}px`;
  }
  if (document.getElementById('benefitTitleSizeValue')) {
    document.getElementById('benefitTitleSizeValue').textContent = `${document.getElementById('benefitTitleSize').value}px`;
  }
  if (document.getElementById('benefitTextSizeValue')) {
    document.getElementById('benefitTextSizeValue').textContent = `${document.getElementById('benefitTextSize').value}px`;
  }

  // Pricing Cards
  if (document.getElementById('pricingCardPaddingValue')) {
    document.getElementById('pricingCardPaddingValue').textContent = `${document.getElementById('pricingCardPadding').value}px`;
  }
  if (document.getElementById('pricingValueSizeValue')) {
    document.getElementById('pricingValueSizeValue').textContent = `${document.getElementById('pricingValueSize').value}px`;
  }
  if (document.getElementById('pricingDurationSizeValue')) {
    document.getElementById('pricingDurationSizeValue').textContent = `${document.getElementById('pricingDurationSize').value}px`;
  }

  // CTA Buttons
  if (document.getElementById('ctaFontSizeValue')) {
    document.getElementById('ctaFontSizeValue').textContent = `${document.getElementById('ctaFontSize').value}px`;
  }
  if (document.getElementById('ctaPaddingValue')) {
    document.getElementById('ctaPaddingValue').textContent = `${document.getElementById('ctaPadding').value}px`;
  }

  // Spacing Global
  if (document.getElementById('sectionPaddingValue')) {
    document.getElementById('sectionPaddingValue').textContent = `${document.getElementById('sectionPadding').value}px`;
  }
  if (document.getElementById('containerMaxWidthValue')) {
    document.getElementById('containerMaxWidthValue').textContent = `${document.getElementById('containerMaxWidth').value}px`;
  }
  if (document.getElementById('gridGapValue')) {
    document.getElementById('gridGapValue').textContent = `${document.getElementById('gridGap').value}px`;
  }
}

/**
 * Réinitialise les styles à partir du backup ou d'un fichier JSON.
 *
 * @returns {Promise<void>}
 */
async function resetCSS() {
  const backup = localStorage.getItem('locationVSOLD-css-backup');
  let stylesToReset;
  if (backup) {
    stylesToReset = JSON.parse(backup);
  } else {
    try {
      const resp = await fetch('location-defaults.json');
      stylesToReset = await resp.json();
      defaultValues = stylesToReset;
    } catch (err) {
      console.error('Erreur lors du chargement des valeurs par défaut:', err);
      stylesToReset = defaultValues;
    }
  }

  Object.entries(stylesToReset).forEach(([key, value]) => {
    const element = document.getElementById(key);
    if (element) element.value = value;
  });
  updateValueDisplays();
  applyStyles();

  // ✅ AJOUT : Synchronisation temps réel vers location.html
  syncToPresentation();

  // Notification
  showNotification('Styles réinitialisés avec effet temps réel !', 'warning');
}

/**
 * Sauvegarde les styles courants après confirmation.
 *
 * @returns {void}
 */
function saveCSS() {
  // Popup de validation moderne
  showSaveConfirmation(async () => {
    const styles = {};
    Object.keys(defaultValues).forEach((key) => {
      const element = document.getElementById(key);
      if (element) styles[key] = element.value;
    });

    // Écrasement du backup de réinitialisation
    localStorage.setItem('locationVSOLD-css-backup', JSON.stringify(styles));

    try {
      await fetch('location-defaults.json', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(styles, null, 2),
      });
    } catch (err) {
      console.error('Erreur lors de la sauvegarde des valeurs par défaut:', err);
    }

    showNotification('Nouveau point de sauvegarde créé !', 'success');
  });
}

/**
 * Affiche une popup de confirmation avant la sauvegarde.
 *
 * @param {Function} onConfirm - Callback exécuté en cas de confirmation.
 * @returns {void}
 */
function showSaveConfirmation(onConfirm) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0, 0, 0, 0.7); z-index: 10000;
                display: flex; align-items: center; justify-content: center;
                opacity: 0; transition: opacity 0.3s ease;
            `;

  const popup = document.createElement('div');
  popup.style.cssText = `
                background: linear-gradient(135deg, #1e293b, #334155);
                padding: 2rem; border-radius: 12px; text-align: center;
                max-width: 400px; width: 90%; box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                border: 1px solid rgba(255,255,255,0.1); transform: scale(0.8);
                transition: transform 0.3s ease;
            `;

  popup.innerHTML = sanitizeHTML(`
                <div style="margin-bottom: 1.5rem;">
                    <i class="fas fa-save" style="font-size: 3rem; color: #28a745; margin-bottom: 1rem;"></i>
                    <h3 style="color: white; margin: 0 0 0.5rem 0; font-size: 1.3rem;">Créer un nouveau point de sauvegarde</h3>
                    <p style="color: #cbd5e1; margin: 0; font-size: 0.9rem;">Cette action remplacera votre point de restauration actuel. Êtes-vous sûr ?</p>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button class="popup-btn cancel" style="
                        padding: 0.8rem 1.5rem; border: none; border-radius: 6px;
                        background: #6b7280; color: white; cursor: pointer;
                        font-weight: 600; transition: all 0.3s ease;
                    ">Annuler</button>
                    <button class="popup-btn confirm" style="
                        padding: 0.8rem 1.5rem; border: none; border-radius: 6px;
                        background: #28a745; color: white; cursor: pointer;
                        font-weight: 600; transition: all 0.3s ease;
                    ">Confirmer</button>
                </div>
            `);

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // Animation d'entrée
  setTimeout(() => {
    overlay.style.opacity = '1';
    popup.style.transform = 'scale(1)';
  }, 10);

  // Gestion des clics
  popup.querySelector('.cancel').onclick = () => closePopup(overlay);
  popup.querySelector('.confirm').onclick = () => {
    onConfirm();
    closePopup(overlay);
  };

  // Fermeture par clic extérieur
  overlay.onclick = (e) => {
    if (e.target === overlay) closePopup(overlay);
  };

  // Hover effects
  popup.querySelectorAll('.popup-btn').forEach((btn) => {
    btn.onmouseenter = () => btn.style.transform = 'translateY(-2px)';
    btn.onmouseleave = () => btn.style.transform = 'translateY(0)';
  });
}

/**
 * Ferme la popup de confirmation.
 *
 * @param {HTMLElement} overlay - Élément d'arrière-plan à retirer.
 * @returns {void}
 */
function closePopup(overlay) {
  overlay.style.opacity = '0';
  overlay.querySelector('div').style.transform = 'scale(0.8)';
  setTimeout(() => overlay.remove(), 300);
}

// Import CSS
/**
 * Importe des styles depuis un fichier JSON local et les applique.
 *
 * @returns {void}
 */
function importCSS() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,.css';

  input.onchange = function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        let styles;

        // Tentative de lecture JSON
        if (file.name.endsWith('.json')) {
          styles = JSON.parse(e.target.result);
        } else {
          // Pour les fichiers CSS, extraction basique des valeurs
          showNotification('Import CSS direct non supporté, utilisez JSON', 'error');
          return;
        }

        // Application des styles importés
        Object.entries(styles).forEach(([key, value]) => {
          const element = document.getElementById(key);
          if (element && defaultValues.hasOwnProperty(key)) {
            element.value = value;
          }
        });

        updateValueDisplays();
        applyStyles();
        showNotification('Styles importés avec succès', 'success');
      } catch (error) {
        showNotification(`Erreur lors de l'import: ${error.message}`, 'error');
      }
    };
    reader.readAsText(file);
  };

  input.click();
}

// Export CSS
/**
 * Exporte les styles actuels dans un fichier JSON téléchargeable.
 *
 * @returns {void}
 */
function exportCSS() {
  const styles = {};
  Object.keys(defaultValues).forEach((key) => {
    const element = document.getElementById(key);
    if (element) styles[key] = element.value;
  });

  // Export JSON pour réimport facile
  const jsonBlob = new Blob([JSON.stringify(styles, null, 2)], { type: 'application/json' });
  const jsonUrl = URL.createObjectURL(jsonBlob);
  const jsonLink = document.createElement('a');
  jsonLink.href = jsonUrl;
  jsonLink.download = 'locationVSOLD-custom-styles.json';
  jsonLink.click();
  URL.revokeObjectURL(jsonUrl);

  showNotification('Styles exportés (JSON)', 'success');
}

// Notification simple
/**
 * Affiche une notification temporaire à l'utilisateur.
 *
 * @param {string} message - Texte de la notification.
 * @param {string} type - Type visuel (success, warning, error).
 * @returns {void}
 */
function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.style.cssText = `
                position: fixed; top: 20px; right: 20px; z-index: 9999;
                background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#dc3545'};
                color: white; padding: 12px 20px; border-radius: 6px;
                font-weight: 600; transform: translateX(100%);
                transition: transform 0.3s ease;
            `;
  notification.textContent = message;

  document.body.appendChild(notification);
  setTimeout(() => notification.style.transform = 'translateX(0)', 100);
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Chargement des styles sauvegardés
/**
 * Charge les styles personnalisés sauvegardés localement.
 *
 * @returns {void}
 */
function loadSavedStyles() {
  const saved = localStorage.getItem('locationVSOLD-custom-css');
  if (saved) {
    const styles = JSON.parse(saved);
    Object.entries(styles).forEach(([key, value]) => {
      const element = document.getElementById(key);
      if (element) element.value = value;
    });
    updateValueDisplays();
    applyStyles();
  }
}

// Création du backup automatique initial
/**
 * Crée une sauvegarde initiale des valeurs par défaut si aucune n'existe.
 *
 * @returns {void}
 */
function createInitialBackup() {
  const existingBackup = localStorage.getItem('locationVSOLD-css-backup');
  if (!existingBackup) {
    // Premier lancement : créer backup avec valeurs par défaut
    localStorage.setItem('locationVSOLD-css-backup', JSON.stringify(defaultValues));
    console.log('🔄 Backup automatique initial créé');
  }
}

// Synchronisation temps réel avec location.html
/**
 * Synchronise les styles en cours vers la page de présentation.
 *
 * @returns {void}
 */
function syncToPresentation() {
  // Collecte de tous les styles actuels pour location.html
  const currentStyles = {};
  Object.keys(defaultValues).forEach((key) => {
    const element = document.getElementById(key);
    if (element) currentStyles[key] = element.value;
  });

  // Création du CSS dynamique pour location.html
  const locationCSS = generateLocationCSS(currentStyles);

  // Sauvegarde temporaire pour sync temps réel
  localStorage.setItem('locationVSOLD-live-styles', JSON.stringify(currentStyles));
  localStorage.setItem('locationVSOLD-dynamic-css', locationCSS);

  // Si InstantSync est disponible, l'utiliser pour sync immédiate
  if (window.instantSync) {
    try {
      window.instantSync.executeInstantSync(false); // sync non forcée
      console.log('🔄 Styles synchronisés avec location.html');
    } catch (error) {
      console.warn('⚠️ Synchronisation InstantSync échouée:', error);
    }
  }

  // Tentative de communication direct avec onglets ouverts (location.html)
  try {
    const message = {
      type: 'LOCATION_CSS_UPDATE',
      styles: currentStyles,
      css: locationCSS,
      timestamp: Date.now(),
    };

    // Broadcast vers tous les onglets via localStorage event
    localStorage.setItem('locationVSOLD-css-broadcast', JSON.stringify(message));
    setTimeout(() => localStorage.removeItem('locationVSOLD-css-broadcast'), 100);

    // Application immédiate des styles à la page d'édition elle-même
    if (typeof applyDynamicCSSToEditPage === 'function') {
      applyDynamicCSSToEditPage(currentStyles);
    }

    console.log('📡 Styles diffusés vers location.html et appliqués à la page d\'édition');
  } catch (error) {
    console.warn('⚠️ Diffusion échouée:', error);
  }
}

// Génération du CSS dynamique pour location.html
/**
 * Génère une feuille de style CSS à partir d'un objet de valeurs.
 *
 * @param {Object} styles - Ensemble de variables CSS.
 * @returns {string} CSS généré.
 */
function generateLocationCSS(styles) {
  return `
                /* CSS Dynamique pour location.html généré depuis edit-location.html */
                :root {
                    --primary-dark: ${styles.primaryDark};
                    --secondary-dark: ${styles.secondaryDark};
                    --accent-green: ${styles.accentGreen};
                    --accent-blue: ${styles.accentBlue};
                    --accent-teal: ${styles.accentTeal};
                    --success-green: ${styles.successGreen};
                    --warning-orange: ${styles.warningOrange};
                    --text-white: ${styles.textWhite};
                    --text-gray: ${styles.textGray};
                    --warning-red: ${styles.warningRed};
                    --info-blue: ${styles.infoBlue};
                    --neutral-gray: ${styles.neutralGray};
                }
                
                /* Navigation */
                .nav-title {
                    font-size: ${styles.navTitleSize}px !important;
                    font-weight: ${styles.navTitleWeight} !important;
                }
                .nav-item {
                    font-size: ${styles.navItemSize}px !important;
                    padding: ${styles.navPadding}px ${styles.navPadding * 1.5}px !important;
                }
                
                /* Espacements entre Sections - Logique restaurée fonctionnelle */
                .header-spacer[data-field="heroSpacerHeight"] {
                    height: ${styles.heroSpacerHeight}px !important;
                }
                .section-spacer[data-field="hero-pricing-spacer"] {
                    height: ${styles['hero-pricing-spacer']}px !important;
                }
                .section-spacer[data-field="pricing-advantages-spacer"] {
                    height: ${styles['pricing-advantages-spacer']}px !important;
                }
                .section-spacer[data-field="advantages-comparison-spacer"] {
                    height: ${styles['advantages-comparison-spacer']}px !important;
                }
                .section-spacer[data-field="contact-conclusionAction-spacer"] {
                    height: ${styles['contact-conclusionAction-spacer']}px !important;
                }
                .section-spacer[data-field="conclusionAction-conclusionComparative-spacer"] {
                    height: ${styles['conclusionAction-conclusionComparative-spacer']}px !important;
                }
                .section-spacer[data-field="conclusionComparative-contact-spacer"] {
                    height: ${styles['conclusionComparative-contact-spacer']}px !important;
                }
                
                /* Hero Section */
                .hero-text h1 {
                    font-size: ${styles.heroTitleSize}px !important;
                    font-weight: ${styles.heroTitleWeight} !important;
                }
                .hero-highlight {
                    font-size: ${styles.heroHighlightSize}px !important;
                }
                .hero-subtitle {
                    font-size: ${styles.heroSubtitleSize}px !important;
                }
                
                /* Prix Banner */
                .price-main {
                    font-size: ${styles.priceMainSize}px !important;
                }
                .price-sub {
                    font-size: ${styles.priceSubSize}px !important;
                }
                .price-banner {
                    padding: ${styles.pricePadding}px ${styles.pricePadding * 1.5}px !important;
                }
                
                /* Section Titles */
                .section-title {
                    font-size: ${styles.sectionTitleSize}px !important;
                    font-weight: ${styles.sectionTitleWeight} !important;
                }
                
                /* Cards et Benefits */
                .benefit-card, .pricing-card {
                    padding: ${styles.cardPadding}px ${styles.cardPadding * 0.8}px !important;
                    border-radius: ${styles.cardBorderRadius}px !important;
                }
                .benefit-icon {
                    font-size: ${styles.benefitIconSize}px !important;
                }
                .benefit-title, .advantage-title {
                    font-size: ${styles.benefitTitleSize}px !important;
                }
                .benefit-text, .advantage-text {
                    font-size: ${styles.benefitTextSize}px !important;
                }
                
                /* Pricing Cards */
                .pricing-card {
                    padding: ${styles.pricingCardPadding}px ${styles.pricingCardPadding * 0.8}px !important;
                }
                .pricing-value {
                    font-size: ${styles.pricingValueSize}px !important;
                }
                .pricing-duration {
                    font-size: ${styles.pricingDurationSize}px !important;
                }
                
                /* CTA Buttons */
                .cta-rental, .cta-btn {
                    font-size: ${styles.ctaFontSize}px !important;
                    font-weight: ${styles.ctaFontWeight} !important;
                    padding: ${styles.ctaPadding}px ${styles.ctaPadding * 1.8}px !important;
                }
                
                /* Spacing Global */
                .section {
                    padding: ${styles.sectionPadding}px 2rem 4rem !important;
                }
                .container {
                    max-width: ${styles.containerMaxWidth}px !important;
                }
                .pricing-grid, .rental-benefits {
                    gap: ${styles.gridGap}px !important;
                }
                
                /* Rôle : Images dynamiques pour la comparaison produits */
                /* Synchronisation : Chemins d'images modifiables depuis l'éditeur */
                /* Responsabilité : Mise à jour en temps réel des background-image */
                .product-showcase {
                    background-image: url('${styles['product-image-path'] || './images/Li-CUBE PRO.png'}') !important;
                }
                .competitor-showcase {
                    background-image: url('${styles['competitor-image-path'] || './images/concurrent.png'}') !important;
                }
                
                /* Rôle : Styles personnalisés pour l'élément VS */
                /* Synchronisation : Variables CSS mises à jour depuis l'éditeur */
                /* Responsabilité : Apparence distinctive du texte VS comparatif */
                :root {
                    --vs-font-size: ${styles.vsFontSize}rem !important;
                    --vs-font-weight: ${styles.vsFontWeight} !important;
                    --vs-text-color: ${styles.vsTextColor} !important;
                    --vs-font-family: ${styles.vsFontFamily} !important;
                    --vs-text-transform: ${styles.vsTextTransform} !important;
                    --vs-letter-spacing: ${styles.vsLetterSpacing}em !important;
                }
                
                /* Rôle : Gestion du logo dynamique (déjà existant mais maintenu pour cohérence) */
                .nav-logo {
                    background-image: url('${styles['logo-path'] || './images/logo edsquebec.png'}') !important;
                }
            `;
}

// ==========================================
// SYSTÈME DE RÉORGANISATION DES SECTIONS
// ==========================================

// Obtient l'ordre actuel de TOUTES les sections (éditeur) depuis localStorage
/**
 * Récupère l'ordre de toutes les sections depuis le stockage local.
 *
 * @returns {Object} Association section/position.
 */
function getAllSectionOrder() {
  const savedOrder = localStorage.getItem('locationVSOLD-allSectionOrder');
  return savedOrder ? JSON.parse(savedOrder) : {
    hero: 1,
    'hero-arguments': 2,
    pricing: 3,
    advantages: 4,
    technical: 5,
    contact: 6,
    'conclusion-action': 7,
    'conclusion-comparative': 8,
  };
}

// Obtient l'ordre des sections pour la présentation (sections existantes dans location.html)
/**
 * Obtient l'ordre actuel des sections sur la page de présentation.
 *
 * @returns {Object} Ordre des sections.
 */
function getPresentationSectionOrder() {
  const allOrder = getAllSectionOrder();
  // Filtre uniquement les sections qui existent dans location.html
  return {
    hero: allOrder.hero || 1,
    pricing: allOrder.pricing || 2,
    advantages: allOrder.advantages || 3,
    technical: allOrder.technical || 4,
    contact: allOrder.contact || 5,
  };
}

// Sauvegarde l'ordre de TOUTES les sections (éditeur)
/**
 * Enregistre l'ordre de toutes les sections dans le stockage local.
 *
 * @param {Object} allOrder - Association section/position.
 * @returns {void}
 */
function saveAllSectionOrder(allOrder) {
  localStorage.setItem('locationVSOLD-allSectionOrder', JSON.stringify(allOrder));

  // Génère l'ordre pour la présentation (sections filtrées)
  const presentationOrder = getPresentationSectionOrder();
  localStorage.setItem('locationVSOLD-sectionOrder', JSON.stringify(presentationOrder));

  // Synchronisation immédiate avec la page de présentation
  window.dispatchEvent(new CustomEvent('sectionOrderChange', {
    detail: { key: 'locationVSOLD-sectionOrder', newValue: JSON.stringify(presentationOrder) },
  }));
}

// Applique l'ordre des sections dans l'éditeur
/**
 * Applique l'ordre des sections enregistré à l'interface de l'éditeur.
 *
 * @returns {void}
 */
function applySectionOrder() {
  const order = getAllSectionOrder();
  const container = document.querySelector('.container');
  const sections = Array.from(container.querySelectorAll('.reorganizable-section'));

  // Trie les sections par ordre
  sections.sort((a, b) => {
    const aOrder = order[a.dataset.sectionId] || 999;
    const bOrder = order[b.dataset.sectionId] || 999;
    return aOrder - bOrder;
  });

  // Trouve la position d'insertion (après la section d'édition de style)
  const styleSection = container.querySelector('.css-editor');
  let insertAfter = styleSection;

  // Réinsère les sections dans le bon ordre
  sections.forEach((section) => {
    container.insertBefore(section, insertAfter.nextSibling);
    insertAfter = section;
  });

  // Met à jour les attributs data-section-order
  sections.forEach((section) => {
    section.dataset.sectionOrder = order[section.dataset.sectionId];
  });

  console.log('📋 Ordre des sections appliqué dans l\'éditeur:', order);
}

// Fonction pour monter une section
/**
 * Déplace une section d'un rang vers le haut.
 *
 * @param {string} sectionId - Identifiant de la section à déplacer.
 * @returns {void}
 */
function moveSectionUp(sectionId) {
  const order = getAllSectionOrder();
  const currentOrder = order[sectionId];

  if (!currentOrder || currentOrder <= 1) return; // Déjà en première position ou section non trouvée

  // Trouve la section qui est juste au-dessus
  const targetOrder = currentOrder - 1;
  const targetSectionId = Object.keys(order).find((id) => order[id] === targetOrder);

  if (targetSectionId) {
    // Échange les positions
    order[sectionId] = targetOrder;
    order[targetSectionId] = currentOrder;

    saveAllSectionOrder(order);
    applySectionOrder();

    console.log(`📈 Section ${sectionId} montée en position ${targetOrder}`);
  }
}

// Fonction pour descendre une section
/**
 * Déplace une section d'un rang vers le bas.
 *
 * @param {string} sectionId - Identifiant de la section à déplacer.
 * @returns {void}
 */
function moveSectionDown(sectionId) {
  const order = getAllSectionOrder();
  const currentOrder = order[sectionId];
  const maxOrder = Math.max(...Object.values(order));

  if (!currentOrder || currentOrder >= maxOrder) return; // Déjà en dernière position ou section non trouvée

  // Trouve la section qui est juste en dessous
  const targetOrder = currentOrder + 1;
  const targetSectionId = Object.keys(order).find((id) => order[id] === targetOrder);

  if (targetSectionId) {
    // Échange les positions
    order[sectionId] = targetOrder;
    order[targetSectionId] = currentOrder;

    saveAllSectionOrder(order);
    applySectionOrder();

    console.log(`📉 Section ${sectionId} descendue en position ${targetOrder}`);
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  defaultsLoaded.then(() => {
    // Création du backup automatique
    createInitialBackup();

    // Écouteurs d'événements pour tous les contrôles avec application temps réel
    Object.keys(defaultValues).forEach((key) => {
      const element = document.getElementById(key);
      if (element) {
        element.addEventListener('input', () => {
          updateValueDisplays();
          applyStyles();
          // Application temps réel sur page présentation
          syncToPresentation();
        });
        element.addEventListener('change', () => {
          updateValueDisplays();
          applyStyles();
          // Application temps réel sur page présentation
          syncToPresentation();
        });
      }
    });

    // Initialisation de l'ordre des sections
    applySectionOrder();

    // Chargement initial
    updateValueDisplays();
    loadSavedStyles();

    console.log('🎨 Éditeur CSS complet initialisé avec sync temps réel et réorganisation des sections');
  });
});
let weaknessIndex = 0;
let strengthIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
  weaknessIndex = document.querySelectorAll('#weaknesses-container .content-block').length;
  strengthIndex = document.querySelectorAll('#strengths-container .content-block').length;
});

/**
 * Ajoute un nouveau bloc de faiblesse et enregistre les champs pour la synchronisation.
 *
 * @returns {void}
 */
window.addWeakness = function () {
  console.log(`➕ Ajout d'une nouvelle faiblesse: weakness${weaknessIndex + 1}`);
  
  weaknessIndex += 1;
  const template = document.getElementById('weakness-template').content.cloneNode(true);
  
  // Configuration : nouveaux champs avec data-field appropriés
  template.querySelectorAll('[data-field]').forEach((el) => {
    const fieldType = el.dataset.field.endsWith('-title') ? 'title' : 'desc';
    const newFieldName = `weakness${weaknessIndex}-${fieldType}`;
    
    el.id = `weakness${weaknessIndex}-${fieldType}`;
    el.dataset.field = newFieldName;
    
    // Enregistrement : champ pour synchronisation instantanée
    if (window.instantSync && typeof window.instantSync.setupInstantListeners === 'function') {
      // Re-configuration des listeners pour le nouveau champ
      setTimeout(() => {
        window.instantSync.setupInstantListeners();
        console.log(`📝 Nouveau champ enregistré: ${newFieldName}`);
      }, 100);
    }
  });
  
  // Mise à jour : labels pour cohérence visuelle
  template.querySelectorAll('label').forEach((label) => {
    const currentFor = label.getAttribute('for');
    const currentText = label.textContent;
    
    if (currentFor) {
      label.setAttribute('for', currentFor.replace('X', weaknessIndex));
    }
    if (currentText) {
      label.textContent = currentText.replace('X', weaknessIndex);
    }
  });
  
  // Ajout : nouveau bloc au conteneur
  document.getElementById('weaknesses-container').appendChild(template);
  
  // Synchronisation : notification temps réel vers présentation
  if (window.instantSync) {
    window.instantSync.executeInstantSync(true); // Force full sync
    console.log(`✅ Faiblesse ajoutée et synchronisée: weakness${weaknessIndex}`);
  }
  
  // Animation : scroll vers le nouveau champ
  setTimeout(() => {
    const newField = document.getElementById(`weakness${weaknessIndex}-title`);
    if (newField) {
      newField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      newField.focus();
    }
  }, 200);
};

/**
 * Supprime le dernier bloc de faiblesse.
 *
 * @returns {void}
 */
window.removeWeakness = function () {
  const container = document.getElementById('weaknesses-container');
  const blocks = container.querySelectorAll('.content-block');
  
  if (blocks.length > 0) {
    const blockToRemove = blocks[blocks.length - 1];
    const fieldName = `weakness${weaknessIndex}`;
    
    console.log(`🗑️ Suppression de la faiblesse: ${fieldName}`);
    
    // Animation : fade out avant suppression
    blockToRemove.style.transition = 'all 0.3s ease';
    blockToRemove.style.opacity = '0';
    blockToRemove.style.transform = 'translateX(100px)';
    
    setTimeout(() => {
      // Suppression : du DOM
      container.removeChild(blockToRemove);
      weaknessIndex -= 1;
      
      // Synchronisation : notification temps réel vers présentation  
      if (window.instantSync) {
        window.instantSync.executeInstantSync(true); // Force full sync
        console.log(`✅ Faiblesse supprimée et synchronisée: ${fieldName}`);
      }
      
      console.log(`📊 Nouvelles faiblesses actives: ${weaknessIndex}`);
    }, 300);
  } else {
    console.warn('⚠️ Aucune faiblesse à supprimer');
  }
};

/**
 * Ajoute un nouveau bloc de force et enregistre les champs pour la synchronisation.
 *
 * @returns {void}
 */
window.addStrength = function () {
  console.log(`➕ Ajout d'un nouvel avantage: strength${strengthIndex + 1}`);
  
  strengthIndex += 1;
  const template = document.getElementById('strength-template').content.cloneNode(true);
  
  // Configuration : nouveaux champs avec data-field appropriés
  template.querySelectorAll('[data-field]').forEach((el) => {
    const fieldType = el.dataset.field.endsWith('-title') ? 'title' : 'desc';
    const newFieldName = `strength${strengthIndex}-${fieldType}`;
    
    el.id = `strength${strengthIndex}-${fieldType}`;
    el.dataset.field = newFieldName;
    
    // Enregistrement : champ pour synchronisation instantanée
    if (window.instantSync && typeof window.instantSync.setupInstantListeners === 'function') {
      // Re-configuration des listeners pour le nouveau champ
      setTimeout(() => {
        window.instantSync.setupInstantListeners();
        console.log(`📝 Nouveau champ enregistré: ${newFieldName}`);
      }, 100);
    }
  });
  
  // Mise à jour : labels pour cohérence visuelle
  template.querySelectorAll('label').forEach((label) => {
    const currentFor = label.getAttribute('for');
    const currentText = label.textContent;
    
    if (currentFor) {
      label.setAttribute('for', currentFor.replace('X', strengthIndex));
    }
    if (currentText) {
      label.textContent = currentText.replace('X', strengthIndex);
    }
  });
  
  // Ajout : nouveau bloc au conteneur
  document.getElementById('strengths-container').appendChild(template);
  
  // Synchronisation : notification temps réel vers présentation
  if (window.instantSync) {
    window.instantSync.executeInstantSync(true); // Force full sync
    console.log(`✅ Avantage ajouté et synchronisé: strength${strengthIndex}`);
  }
  
  // Animation : scroll vers le nouveau champ
  setTimeout(() => {
    const newField = document.getElementById(`strength${strengthIndex}-title`);
    if (newField) {
      newField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      newField.focus();
    }
  }, 200);
};

/**
 * Supprime le dernier bloc de force.
 *
 * @returns {void}
 */
window.removeStrength = function () {
  const container = document.getElementById('strengths-container');
  const blocks = container.querySelectorAll('.content-block');
  
  if (blocks.length > 0) {
    const blockToRemove = blocks[blocks.length - 1];
    const fieldName = `strength${strengthIndex}`;
    
    console.log(`🗑️ Suppression de l'avantage: ${fieldName}`);
    
    // Animation : fade out avant suppression
    blockToRemove.style.transition = 'all 0.3s ease';
    blockToRemove.style.opacity = '0';
    blockToRemove.style.transform = 'translateX(100px)';
    
    setTimeout(() => {
      // Suppression : du DOM
      container.removeChild(blockToRemove);
      strengthIndex -= 1;
      
      // Synchronisation : notification temps réel vers présentation  
      if (window.instantSync) {
        window.instantSync.executeInstantSync(true); // Force full sync
        console.log(`✅ Avantage supprimé et synchronisé: ${fieldName}`);
      }
      
      console.log(`📊 Nouveaux avantages actifs: ${strengthIndex}`);
    }, 300);
  } else {
    console.warn('⚠️ Aucun avantage à supprimer');
  }
};

/**
 * NOUVEAU SYSTÈME : Gestion individuelle des sections de faiblesses/avantages
 * Rôle : Ajouter/Supprimer des sections spécifiques avec boutons + et - sur chaque bloc
 */

/**
 * Ajoute une nouvelle faiblesse après l'index spécifié
 * @param {number} afterIndex - Index de la faiblesse après laquelle ajouter
 */
window.addWeaknessAfter = function(afterIndex) {
  console.log(`➕ Ajout faiblesse après index ${afterIndex}`);
  
  // Recherche : conteneur et élément de référence
  const container = document.getElementById('weaknesses-container');
  const refBlock = container.querySelector(`.weakness-block[data-index="${afterIndex}"]`);
  
  if (!refBlock) {
    console.error(`❌ Élément de référence non trouvé: weakness-block[data-index="${afterIndex}"]`);
    return;
  }
  
  // Calcul : nouvel index = toujours à la fin (plus simple pour synchronisation)
  const existingIndexes = Array.from(container.querySelectorAll('.weakness-block'))
    .map(el => parseInt(el.dataset.index))
    .sort((a, b) => a - b);
  
  const newIndex = Math.max(...existingIndexes) + 1;
  console.log(`🔢 Nouvel index assigné: ${newIndex} (ajout à la fin pour simplicité)`);
  
  // Création : nouveau bloc à partir du template
  const template = document.getElementById('weakness-template');
  if (!template) {
    console.error('❌ Template weakness-template non trouvé');
    return;
  }
  
  const newBlock = template.content.cloneNode(true);
  const blockDiv = newBlock.querySelector('.content-block');
  
  // Configuration : attributs et IDs pour le nouveau bloc
  blockDiv.classList.add('weakness-block');
  blockDiv.dataset.index = newIndex;
  blockDiv.style.cssText = "background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; position: relative;";
  
  // Ajout : boutons de contrôle
  const controlsHtml = `
    <div class="section-controls-individual">
      <button class="btn-control btn-add-after" onclick="addWeaknessAfter(${newIndex})" title="Ajouter une faiblesse après celle-ci">
        <i class="fas fa-plus"></i>
      </button>
      <button class="btn-control btn-remove-this" onclick="removeWeaknessAt(${newIndex})" title="Supprimer cette faiblesse">
        <i class="fas fa-minus"></i>
      </button>
    </div>
  `;
  blockDiv.insertAdjacentHTML('afterbegin', controlsHtml);
  
  // Configuration : champs data-field avec nouvel index
  newBlock.querySelectorAll('[data-field]').forEach(element => {
    const oldField = element.dataset.field;
    const fieldType = oldField.includes('-emoji') ? 'emoji' : (oldField.includes('-title') ? 'title' : 'desc');
    const newFieldName = `weakness${newIndex}-${fieldType}`;
    
    element.dataset.field = newFieldName;
    if (element.id) {
      element.id = `weakness${newIndex}-${fieldType}`;
    }
    
    // Valeurs par défaut
    if (fieldType === 'emoji') {
      element.value = '❓';
      element.placeholder = '❓';
    } else if (fieldType === 'title') {
      element.value = `Nouvelle Faiblesse ${newIndex}`;
      element.placeholder = `Titre faiblesse ${newIndex}`;
    } else {
      element.textContent = `Description de la faiblesse ${newIndex}`;
    }
  });
  
  // Configuration : labels
  newBlock.querySelectorAll('label').forEach(label => {
    const forAttr = label.getAttribute('for');
    if (forAttr) {
      const fieldType = forAttr.includes('title') ? 'title' : (forAttr.includes('desc') ? 'desc' : 'emoji');
      label.setAttribute('for', `weakness${newIndex}-${fieldType}`);
    }
    if (label.textContent.includes('X')) {
      label.textContent = label.textContent.replace('X', newIndex);
    }
  });
  
  // Insertion : toujours à la fin du conteneur avec animation
  blockDiv.style.opacity = '0';
  blockDiv.style.transform = 'translateY(-20px)';
  container.appendChild(blockDiv);
  
  // Animation : apparition
  setTimeout(() => {
    blockDiv.style.transition = 'all 0.5s ease';
    blockDiv.style.opacity = '1';
    blockDiv.style.transform = 'translateY(0)';
  }, 100);
  
  // Synchronisation : temps réel COMPLÈTE
  if (window.instantSync) {
    // 1. Re-setup listeners pour nouveaux éléments (délai plus long)
    setTimeout(() => {
      window.instantSync.setupInstantListeners();
      console.log('🔄 Listeners reconfigurés pour nouveaux éléments');
    }, 200);
    
    // 2. Sauvegarde immédiate des nouveaux champs
    setTimeout(() => {
      const newFields = {
        [`weakness${newIndex}-emoji`]: document.querySelector(`[data-field="weakness${newIndex}-emoji"]`)?.value || '❓',
        [`weakness${newIndex}-title`]: document.querySelector(`[data-field="weakness${newIndex}-title"]`)?.value || `Nouvelle Faiblesse ${newIndex}`,
        [`weakness${newIndex}-desc`]: document.querySelector(`[data-field="weakness${newIndex}-desc"]`)?.textContent || `Description de la faiblesse ${newIndex}`
      };
      
      // Force l'enregistrement de chaque nouveau champ (méthode correcte)
      Object.entries(newFields).forEach(([fieldName, value]) => {
        window.instantSync.executeInstantSync(fieldName, value);
      });
      
      // Force sync globale pour s'assurer que tout est sauvé
      setTimeout(() => {
        window.instantSync.executeInstantSync(true);
      }, 100);
      console.log('💾 Sauvegarde forcée des nouveaux champs:', newFields);
    }, 300);
  }
  
  // Focus : sur le nouveau titre
  setTimeout(() => {
    const newTitleField = document.getElementById(`weakness${newIndex}-title`);
    if (newTitleField) {
      newTitleField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      newTitleField.focus();
      newTitleField.select();
    }
  }, 600);
  
  console.log(`✅ Nouvelle faiblesse ajoutée: weakness${newIndex}`);
  
  // SYNCHRONISATION IMMÉDIATE comme pour les champs de texte
  if (window.instantSync) {
    window.instantSync.executeInstantSync(true); // Force sync complète immédiate
  }
  
  // SAUVEGARDE IMMÉDIATE des 2 pages HTML complètes  
  setTimeout(() => {
    saveCompleteHtmlPages('Ajout faiblesse');
  }, 200); // Délai réduit après sync
};

/**
 * Supprime la faiblesse à l'index spécifié avec renéumérotation automatique
 * @param {number} index - Index de la faiblesse à supprimer
 */
window.removeWeaknessAt = function(index) {
  console.log(`🗑️ Suppression faiblesse à l'index ${index}`);
  
  const container = document.getElementById('weaknesses-container');
  const blockToRemove = container.querySelector(`.weakness-block[data-index="${index}"]`);
  
  if (!blockToRemove) {
    console.warn(`⚠️ Faiblesse non trouvée à l'index ${index}`);
    return;
  }
  
  // Vérification : au moins une faiblesse doit rester
  const remainingBlocks = container.querySelectorAll('.weakness-block').length;
  if (remainingBlocks <= 1) {
    alert('⚠️ Impossible de supprimer la dernière faiblesse. Il doit en rester au moins une.');
    return;
  }
  
  // Animation : fade out
  blockToRemove.classList.add('removing');
  
  setTimeout(() => {
    // Suppression : du DOM
    blockToRemove.remove();
    
    // Renéumérotation : automatique de toutes les faiblesses
    renumberWeaknesses();
    
    // Synchronisation : temps réel
    if (window.instantSync) {
      window.instantSync.executeInstantSync(true); // Force full sync
    }
    
    console.log(`✅ Faiblesse supprimée: weakness${index} et renéumérotation effectuée`);
    
    // SAUVEGARDE IMMÉDIATE des 2 pages HTML complètes
    setTimeout(() => {
      saveCompleteHtmlPages('Suppression faiblesse');
    }, 200); // Délai réduit pour plus de réactivité
  }, 400);
};

/**
 * Renéumérotation automatique de toutes les faiblesses
 * Rôle : Réorganise les index pour éviter les trous de numérotation
 */
function renumberWeaknesses() {
  console.log('🔢 Début renéumérotation des faiblesses');
  
  const container = document.getElementById('weaknesses-container');
  const blocks = Array.from(container.querySelectorAll('.weakness-block')).sort((a, b) => {
    return parseInt(a.dataset.index) - parseInt(b.dataset.index);
  });
  
  blocks.forEach((block, index) => {
    const newIndex = index + 1;
    const oldIndex = block.dataset.index;
    
    if (oldIndex != newIndex) {
      console.log(`📝 Renéumérotation faiblesse ${oldIndex} → ${newIndex}`);
      
      // Mise à jour : attributs du bloc
      block.dataset.index = newIndex;
      
      // Mise à jour : tous les champs data-field
      block.querySelectorAll('[data-field]').forEach(element => {
        const oldField = element.dataset.field;
        const fieldType = oldField.includes('-emoji') ? 'emoji' : (oldField.includes('-title') ? 'title' : 'desc');
        const newField = `weakness${newIndex}-${fieldType}`;
        
        element.dataset.field = newField;
        if (element.id) {
          element.id = `weakness${newIndex}-${fieldType}`;
        }
      });
      
      // Mise à jour : labels
      block.querySelectorAll('label').forEach(label => {
        const forAttr = label.getAttribute('for');
        if (forAttr) {
          const fieldType = forAttr.includes('title') ? 'title' : (forAttr.includes('desc') ? 'desc' : 'emoji');
          label.setAttribute('for', `weakness${newIndex}-${fieldType}`);
        }
      });
      
      // Mise à jour : texte des labels
      const smallLabel = block.querySelector('.emoji-header small');
      if (smallLabel) {
        smallLabel.textContent = `Faiblesse ${newIndex}`;
      }
      
      // Mise à jour : boutons onclick
      const addButton = block.querySelector('.btn-add-after');
      const removeButton = block.querySelector('.btn-remove-this');
      
      if (addButton) {
        addButton.setAttribute('onclick', `addWeaknessAfter(${newIndex})`);
      }
      if (removeButton) {
        removeButton.setAttribute('onclick', `removeWeaknessAt(${newIndex})`);
      }
    }
  });
  
  console.log(`✅ Renéumérotation terminée: ${blocks.length} faiblesses`);
}

/**
 * Renéumérotation automatique de tous les avantages
 * Rôle : Réorganise les index pour éviter les trous de numérotation
 */
function renumberStrengths() {
  console.log('🔢 Début renéumérotation des avantages');
  
  const container = document.getElementById('strengths-container');
  const blocks = Array.from(container.querySelectorAll('.strength-block')).sort((a, b) => {
    return parseInt(a.dataset.index) - parseInt(b.dataset.index);
  });
  
  blocks.forEach((block, index) => {
    const newIndex = index + 1;
    const oldIndex = block.dataset.index;
    
    if (oldIndex != newIndex) {
      console.log(`📝 Renéumérotation avantage ${oldIndex} → ${newIndex}`);
      
      // Mise à jour : attributs du bloc
      block.dataset.index = newIndex;
      
      // Mise à jour : tous les champs data-field
      block.querySelectorAll('[data-field]').forEach(element => {
        const oldField = element.dataset.field;
        const fieldType = oldField.includes('-emoji') ? 'emoji' : (oldField.includes('-title') ? 'title' : 'desc');
        const newField = `strength${newIndex}-${fieldType}`;
        
        element.dataset.field = newField;
        if (element.id) {
          element.id = `strength${newIndex}-${fieldType}`;
        }
      });
      
      // Mise à jour : labels
      block.querySelectorAll('label').forEach(label => {
        const forAttr = label.getAttribute('for');
        if (forAttr) {
          const fieldType = forAttr.includes('title') ? 'title' : (forAttr.includes('desc') ? 'desc' : 'emoji');
          label.setAttribute('for', `strength${newIndex}-${fieldType}`);
        }
      });
      
      // Mise à jour : texte des labels
      const smallLabel = block.querySelector('.emoji-header small');
      if (smallLabel) {
        smallLabel.textContent = `Avantage ${newIndex}`;
      }
      
      // Mise à jour : boutons onclick
      const addButton = block.querySelector('.btn-add-after');
      const removeButton = block.querySelector('.btn-remove-this');
      
      if (addButton) {
        addButton.setAttribute('onclick', `addStrengthAfter(${newIndex})`);
      }
      if (removeButton) {
        removeButton.setAttribute('onclick', `removeStrengthAt(${newIndex})`);
      }
    }
  });
  
  console.log(`✅ Renéumérotation terminée: ${blocks.length} avantages`);
}

/**
 * Ajoute un nouvel avantage après l'index spécifié
 * @param {number} afterIndex - Index de l'avantage après lequel ajouter
 */
window.addStrengthAfter = function(afterIndex) {
  console.log(`➕ Ajout avantage après index ${afterIndex}`);
  
  // Recherche : conteneur et élément de référence
  const container = document.getElementById('strengths-container');
  const refBlock = container.querySelector(`.strength-block[data-index="${afterIndex}"]`);
  
  if (!refBlock) {
    console.error(`❌ Élément de référence non trouvé: strength-block[data-index="${afterIndex}"]`);
    return;
  }
  
  // Calcul : nouvel index = toujours à la fin (plus simple pour synchronisation)
  const existingIndexes = Array.from(container.querySelectorAll('.strength-block'))
    .map(el => parseInt(el.dataset.index))
    .sort((a, b) => a - b);
  
  const newIndex = Math.max(...existingIndexes) + 1;
  console.log(`🔢 Nouvel index assigné: ${newIndex} (ajout à la fin pour simplicité)`);
  
  // Création : nouveau bloc à partir du template
  const template = document.getElementById('strength-template');
  if (!template) {
    console.error('❌ Template strength-template non trouvé');
    return;
  }
  
  const newBlock = template.content.cloneNode(true);
  const blockDiv = newBlock.querySelector('.content-block');
  
  // Configuration : attributs et IDs pour le nouveau bloc
  blockDiv.classList.add('strength-block');
  blockDiv.dataset.index = newIndex;
  blockDiv.style.cssText = "background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; position: relative;";
  
  // Ajout : boutons de contrôle
  const controlsHtml = `
    <div class="section-controls-individual">
      <button class="btn-control btn-add-after" onclick="addStrengthAfter(${newIndex})" title="Ajouter un avantage après celui-ci">
        <i class="fas fa-plus"></i>
      </button>
      <button class="btn-control btn-remove-this" onclick="removeStrengthAt(${newIndex})" title="Supprimer cet avantage">
        <i class="fas fa-minus"></i>
      </button>
    </div>
  `;
  blockDiv.insertAdjacentHTML('afterbegin', controlsHtml);
  
  // Configuration : champs data-field avec nouvel index
  newBlock.querySelectorAll('[data-field]').forEach(element => {
    const oldField = element.dataset.field;
    const fieldType = oldField.includes('-emoji') ? 'emoji' : (oldField.includes('-title') ? 'title' : 'desc');
    const newFieldName = `strength${newIndex}-${fieldType}`;
    
    element.dataset.field = newFieldName;
    if (element.id) {
      element.id = `strength${newIndex}-${fieldType}`;
    }
    
    // Valeurs par défaut
    if (fieldType === 'emoji') {
      element.value = '⭐';
      element.placeholder = '⭐';
    } else if (fieldType === 'title') {
      element.value = `Nouvel Avantage ${newIndex}`;
      element.placeholder = `Titre avantage ${newIndex}`;
    } else {
      element.textContent = `Description de l'avantage ${newIndex}`;
    }
  });
  
  // Configuration : labels
  newBlock.querySelectorAll('label').forEach(label => {
    const forAttr = label.getAttribute('for');
    if (forAttr) {
      const fieldType = forAttr.includes('title') ? 'title' : (forAttr.includes('desc') ? 'desc' : 'emoji');
      label.setAttribute('for', `strength${newIndex}-${fieldType}`);
    }
    if (label.textContent.includes('X')) {
      label.textContent = label.textContent.replace('X', newIndex);
    }
  });
  
  // Insertion : toujours à la fin du conteneur avec animation
  blockDiv.style.opacity = '0';
  blockDiv.style.transform = 'translateY(-20px)';
  container.appendChild(blockDiv);
  
  // Animation : apparition
  setTimeout(() => {
    blockDiv.style.transition = 'all 0.5s ease';
    blockDiv.style.opacity = '1';
    blockDiv.style.transform = 'translateY(0)';
  }, 100);
  
  // Synchronisation : temps réel COMPLÈTE
  if (window.instantSync) {
    // 1. Re-setup listeners pour nouveaux éléments (délai plus long)
    setTimeout(() => {
      window.instantSync.setupInstantListeners();
      console.log('🔄 Listeners reconfigurés pour nouveaux éléments');
    }, 200);
    
    // 2. Sauvegarde immédiate des nouveaux champs
    setTimeout(() => {
      const newFields = {
        [`strength${newIndex}-emoji`]: document.querySelector(`[data-field="strength${newIndex}-emoji"]`)?.value || '⭐',
        [`strength${newIndex}-title`]: document.querySelector(`[data-field="strength${newIndex}-title"]`)?.value || `Nouvel Avantage ${newIndex}`,
        [`strength${newIndex}-desc`]: document.querySelector(`[data-field="strength${newIndex}-desc"]`)?.textContent || `Description de l'avantage ${newIndex}`
      };
      
      // Force l'enregistrement de chaque nouveau champ (méthode correcte)
      Object.entries(newFields).forEach(([fieldName, value]) => {
        window.instantSync.executeInstantSync(fieldName, value);
      });
      
      // Force sync globale pour s'assurer que tout est sauvé
      setTimeout(() => {
        window.instantSync.executeInstantSync(true);
      }, 100);
      console.log('💾 Sauvegarde forcée des nouveaux champs:', newFields);
    }, 300);
  }
  
  // Focus : sur le nouveau titre
  setTimeout(() => {
    const newTitleField = document.getElementById(`strength${newIndex}-title`);
    if (newTitleField) {
      newTitleField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      newTitleField.focus();
      newTitleField.select();
    }
  }, 600);
  
  console.log(`✅ Nouvel avantage ajouté: strength${newIndex}`);
  
  // SYNCHRONISATION IMMÉDIATE comme pour les champs de texte
  if (window.instantSync) {
    window.instantSync.executeInstantSync(true); // Force sync complète immédiate
  }
  
  // SAUVEGARDE IMMÉDIATE des 2 pages HTML complètes
  setTimeout(() => {
    saveCompleteHtmlPages('Ajout avantage');
  }, 200); // Délai réduit après sync
};

/**
 * Supprime l'avantage à l'index spécifié avec renéumérotation automatique
 * @param {number} index - Index de l'avantage à supprimer
 */
window.removeStrengthAt = function(index) {
  console.log(`🗑️ Suppression avantage à l'index ${index}`);
  
  const container = document.getElementById('strengths-container');
  const blockToRemove = container.querySelector(`.strength-block[data-index="${index}"]`);
  
  if (!blockToRemove) {
    console.warn(`⚠️ Avantage non trouvé à l'index ${index}`);
    return;
  }
  
  // Vérification : au moins un avantage doit rester
  const remainingBlocks = container.querySelectorAll('.strength-block').length;
  if (remainingBlocks <= 1) {
    alert('⚠️ Impossible de supprimer le dernier avantage. Il doit en rester au moins un.');
    return;
  }
  
  // Animation : fade out
  blockToRemove.classList.add('removing');
  
  setTimeout(() => {
    // Suppression : du DOM
    blockToRemove.remove();
    
    // Renéumérotation : automatique de tous les avantages
    renumberStrengths();
    
    // Synchronisation : temps réel
    if (window.instantSync) {
      window.instantSync.executeInstantSync(true); // Force full sync
    }
    
    console.log(`✅ Avantage supprimé: strength${index} et renéumérotation effectuée`);
    
    // SAUVEGARDE IMMÉDIATE des 2 pages HTML complètes
    setTimeout(() => {
      saveCompleteHtmlPages('Suppression avantage');
    }, 200); // Délai réduit pour plus de réactivité
  }, 400);
};

/**
 * Sauvegarde directe des 2 pages HTML dans localStorage (simulation écrasement fichiers)
 * @param {string} action - Description de l'action qui a déclenché la sauvegarde
 */
function saveCompleteHtmlPages(action) {
    console.log(`💾 Sauvegarde directe des 2 pages: ${action}`);
    
    try {
        // 1. CAPTURE des valeurs actuelles de tous les champs éditables
        const fieldValues = {};
        const editableFields = document.querySelectorAll('[data-field]');
        
        editableFields.forEach(field => {
            const fieldName = field.dataset.field;
            // Rôle : Valeur actuelle du champ (input, textarea, ou textContent)
            // Type : String
            // Unité : Sans unité
            // Domaine : Texte saisi par l'utilisateur
            // Formule : field.value || field.textContent || field.innerText
            // Exemple : "Remplacements Fréquents de la batterie"
            const currentValue = field.value || field.textContent || field.innerText || '';
            fieldValues[fieldName] = currentValue;
        });
        
        console.log(`📊 ${Object.keys(fieldValues).length} valeurs de champs capturées`);
        
        // 2. Sauvegarde des valeurs des champs séparément
        localStorage.setItem('licubepro-field-values', JSON.stringify(fieldValues));
        
        // 3. Mise à jour des attributs value dans le DOM avant sauvegarde HTML
        editableFields.forEach(field => {
            if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
                field.setAttribute('value', field.value);
            }
        });
        
        // 4. Sauvegarde DIRECTE de edit-location.html (page actuelle) avec valeurs à jour
        const editPageHtml = document.documentElement.outerHTML;
        localStorage.setItem('licubepro-edit-location-html-complete', editPageHtml);
        
        console.log('✅ edit-location.html et valeurs champs sauvegardés directement');
        
        // 2. Sauvegarde DIRECTE de location.html avec modifications appliquées
        const currentData = window.instantSync ? window.instantSync.loadContent() : {};
        
        // Fetch et sauvegarde de location.html modifiée
        fetch('location.html')
            .then(response => response.text())
            .then(locationHtml => {
                const locationWithUpdates = applyUpdatesToLocationHtml(locationHtml, currentData);
                localStorage.setItem('licubepro-location-html-complete', locationWithUpdates);
                
                console.log('✅ location.html sauvegardé directement avec modifications');
            })
            .catch(error => {
                console.warn('⚠️ Impossible de récupérer location.html:', error);
            });
        
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde directe:', error);
    }
}

/**
 * Applique les modifications du localStorage sur le HTML de location.html
 * @param {string} locationHtml - HTML original de location.html
 * @param {Object} content - Données à appliquer (optionnel)
 * @return {string} - HTML avec les modifications appliquées
 */
function applyUpdatesToLocationHtml(locationHtml, content = null) {
    try {
        const data = content || (window.instantSync ? window.instantSync.loadContent() : {});
        if (!data || Object.keys(data).length === 0) {
            return locationHtml;
        }
        
        // Parser le HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(locationHtml, 'text/html');
        
        // Appliquer chaque modification
        Object.entries(data).forEach(([fieldName, value]) => {
            if (['lastModified', 'modifiedField', 'timestamp'].includes(fieldName)) {
                return;
            }
            
            const elements = doc.querySelectorAll(`[data-field="${fieldName}"]`);
            elements.forEach(element => {
                if (element.tagName.toLowerCase() === 'input' || element.tagName.toLowerCase() === 'textarea') {
                    element.value = value;
                } else {
                    element.textContent = value;
                }
            });
        });
        
        return doc.documentElement.outerHTML;
    } catch (error) {
        console.warn('⚠️ Erreur lors de l\'application des modifications:', error);
        return locationHtml;
    }
}

// Listener pour synchroniser les variables CSS de la page d'édition avec location.html
let editPageStyleElement = null;

// Application des variables CSS dynamiques à la page d'édition
/**
 * Applique les variables CSS dynamiques à la page d'édition.
 *
 * @param {Object} styles - Variables CSS à injecter.
 * @returns {void}
 */
function applyDynamicCSSToEditPage(styles) {
  // Suppression de l'ancien style dynamique
  if (editPageStyleElement) {
    editPageStyleElement.remove();
  }

  // Création du nouveau style avec les variables mises à jour
  editPageStyleElement = document.createElement('style');
  editPageStyleElement.id = 'dynamic-edit-page-styles';
  editPageStyleElement.textContent = `
                /* Variables CSS Dynamiques synchronisées avec location.html */
                :root {
                    --primary-dark: ${styles.primaryDark || '#0F172A'};
                    --secondary-dark: ${styles.secondaryDark || '#1E293B'};
                    --accent-green: ${styles.accentGreen || '#10B981'};
                    --accent-blue: ${styles.accentBlue || '#3B82F6'};
                    --accent-teal: ${styles.accentTeal || '#14B8A6'};
                    --success-green: ${styles.successGreen || '#059669'};
                    --warning-orange: ${styles.warningOrange || '#F59E0B'};
                    --warning-red: ${styles.warningRed || '#EF4444'};
                    --text-white: ${styles.textWhite || '#F8FAFC'};
                    --text-gray: ${styles.textGray || '#CBD5E1'};
                    --info-blue: ${styles.infoBlue || '#3B82F6'};
                    --neutral-gray: ${styles.neutralGray || '#6B7280'};
                    
                    --gradient-primary: linear-gradient(135deg, var(--primary-dark) 0%, var(--secondary-dark) 100%);
                    --gradient-green: linear-gradient(135deg, var(--accent-green) 0%, var(--accent-teal) 100%);
                    --gradient-blue: linear-gradient(135deg, var(--accent-blue) 0%, #60A5FA 100%);
                    --shadow-md: 0 4px 6px rgba(0,0,0,0.4);
                    --shadow-lg: 0 10px 15px rgba(0,0,0,0.5);
                    --shadow-glow: 0 0 30px rgba(16, 185, 129, 0.4);
                }
                
                /* Mise à jour du thème de la page d'édition en temps réel */
                body {
                    background: var(--gradient-primary);
                    color: var(--text-white);
                }
                
                .editor-header {
                    background: rgba(15, 23, 42, 0.95);
                    border-bottom: 1px solid var(--accent-green);
                }
                
                .edit-section {
                    background: rgba(16, 185, 129, 0.05);
                    border: 1px solid rgba(16, 185, 129, 0.1);
                }
                
                .section-title {
                    color: var(--accent-green);
                }
                
                .field-label {
                    color: var(--text-white);
                }
                
                .field-description {
                    color: var(--text-gray);
                }
                
                .field-input {
                    background: rgba(16, 185, 129, 0.1);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    color: var(--text-white);
                }
                
                .field-input:focus {
                    border-color: var(--accent-green);
                    background: rgba(16, 185, 129, 0.15);
                    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
                }
                
                .btn-back {
                    background: rgba(16, 185, 129, 0.1);
                    color: var(--accent-green);
                    border: 1px solid var(--accent-green);
                }
                
                .btn-save {
                    background: var(--success-green);
                }
                
                .btn-preview {
                    background: var(--accent-teal);
                }
                
                .css-title {
                    background: var(--accent-green);
                }
                
                .css-group h3 {
                    color: var(--accent-green);
                }
                
                .pricing-edit-card {
                    background: rgba(16, 185, 129, 0.08);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                }
                
                .pricing-edit-card.featured {
                    border-color: var(--accent-green);
                    background: rgba(16, 185, 129, 0.12);
                }
                
                .range-value {
                    color: var(--accent-green);
                }
                
                .status-message.success {
                    background: rgba(16, 185, 129, 0.1);
                    border-color: var(--success-green);
                    color: var(--success-green);
                }
                
                .status-message.error {
                    background: rgba(239, 68, 68, 0.1);
                    border-color: var(--warning-red);
                    color: var(--warning-red);
                }
            `;

  document.head.appendChild(editPageStyleElement);
  console.log('🎨 Variables CSS de la page d\'édition synchronisées avec location.html');
}

// Extraction des styles depuis le CSS généré pour location.html
/**
 * Extrait les variables CSS d'un texte CSS généré.
 *
 * @param {string} css - Contenu CSS contenant les variables.
 * @returns {Object} Ensemble des variables extraites.
 */
function extractStylesFromLocationCSS(css) {
  const styles = {};

  // Extraction des variables CSS du CSS généré
  const rootMatch = css.match(/:root\s*{([^}]+)}/);
  if (rootMatch) {
    const rootContent = rootMatch[1];
    const variableMatches = rootContent.matchAll(/--([^:]+):\s*([^;]+);/g);
    for (const match of variableMatches) {
      const varName = match[1].trim();
      const varValue = match[2].trim();
      styles[varName] = varValue;
    }
  }

  return styles;
}

// Écoute des changements de styles depuis location.html
window.addEventListener('storage', (e) => {
  if (e.key === 'locationVSOLD-css-broadcast' && e.newValue) {
    try {
      const message = JSON.parse(e.newValue);
      if (message.type === 'LOCATION_CSS_UPDATE' && message.css) {
        const extractedStyles = extractStylesFromLocationCSS(message.css);
        applyDynamicCSSToEditPage(extractedStyles);
        console.log('📡 Styles reçus depuis location.html et appliqués à la page d\'édition');
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors de la réception des styles:', error);
    }
  }
});

// Écoute locale (même onglet) des changements de styles
/**
 * Gère l'application locale des styles lors de modifications de contrôle.
 *
 * @returns {void}
 */
function handleLocalStyleChanges() {
  if (typeof window.getCurrentStyles === 'function') {
    const currentStyles = window.getCurrentStyles();
    applyDynamicCSSToEditPage(currentStyles);
  }
}

// Application initiale des styles au chargement
document.addEventListener('DOMContentLoaded', () => {
  // Application des styles par défaut
  const defaultStyles = {
    primaryDark: '#0F172A',
    secondaryDark: '#1E293B',
    accentGreen: '#10B981',
    accentBlue: '#3B82F6',
    accentTeal: '#14B8A6',
    successGreen: '#059669',
    warningOrange: '#F59E0B',
    warningRed: '#EF4444',
    textWhite: '#F8FAFC',
    textGray: '#CBD5E1',
    infoBlue: '#3B82F6',
    neutralGray: '#6B7280',
  };

  applyDynamicCSSToEditPage(defaultStyles);

  // Écoute locale des changements de contrôles de style
  defaultsLoaded.then(() => {
    Object.keys(defaultValues).forEach((key) => {
      const element = document.getElementById(key);
      if (element) {
        element.addEventListener('input', handleLocalStyleChanges);
        element.addEventListener('change', handleLocalStyleChanges);
      }
    });
  });

  console.log('🎭 Système de synchronisation des styles de la page d\'édition initialisé');
});
