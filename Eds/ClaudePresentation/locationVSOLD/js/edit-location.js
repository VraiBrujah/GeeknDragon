// Interface Éditeur LOCATION - Synchronisation Instantanée
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ Éditeur LOCATION avec Synchronisation Instantanée activé');

  // Attente : initialisation complète d'InstantSync
  function waitForInstantSync(callback) {
    if (window.instantSync && window.instantSync.isInitialized) {
      callback();
    } else {
      console.log('⏳ Attente initialisation InstantSync...');
      setTimeout(() => waitForInstantSync(callback), 100);
    }
  }

  // Fonction : synchronisation manuelle + ouverture de la page de présentation
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

  // Validation : formats email et téléphone
  setupFieldValidation();

  // Importation : gestion du fichier sélectionné via le champ caché
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

// Validation : contrôles de format pour les champs spéciaux
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

// Utilitaires : validation des formats
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  const phoneRegex = /^(\+1[-.\s]?)?(\(?[0-9]{3}\)?[-.\s]?)?[0-9]{3}[-.\s]?[0-9]{4}$/;
  return phoneRegex.test(phone);
}
// Variables CSS pour location.html - Extraites du thème de location
const defaultValues = {
  // Couleurs Principales de location.html
  primaryDark: '#0F172A',
  secondaryDark: '#1E293B',
  accentGreen: '#10B981',
  accentBlue: '#3B82F6',
  accentTeal: '#14B8A6',
  successGreen: '#059669',
  warningOrange: '#F59E0B',

  // Couleurs de Texte location.html
  textWhite: '#F8FAFC',
  textGray: '#CBD5E1',

  // Couleurs d'État et Complémentaires
  warningRed: '#EF4444',
  infoBlue: '#60A5FA',
  neutralGray: '#9CA3AF',

  // Navigation
  navTitleSize: 28,
  navTitleWeight: '800',
  navItemSize: 16,
  navPadding: 12,

  // Espacements entre sections
  heroSpacerHeight: 80,
  'hero-pricing-spacer': 0,
  'pricing-advantages-spacer': 0,
  'advantages-comparison-spacer': 0,
  'contact-conclusionAction-spacer': 0,
  'conclusionAction-conclusionComparative-spacer': 0,
  'conclusionComparative-contact-spacer': 0,

  // Hero Section
  heroTitleSize: 72,
  heroHighlightSize: 80,
  heroSubtitleSize: 22,
  heroTitleWeight: '900',

  // Prix Banner
  priceMainSize: 56,
  priceSubSize: 18,
  pricePadding: 24,

  // Section Titles
  sectionTitleSize: 56,
  sectionTitleWeight: '800',

  // Cards et Benefits
  cardPadding: 28,
  cardBorderRadius: 16,
  benefitIconSize: 40,
  benefitTitleSize: 18,
  benefitTextSize: 14,

  // Pricing Cards
  pricingCardPadding: 40,
  pricingValueSize: 48,
  pricingDurationSize: 18,

  // CTA Buttons
  ctaFontSize: 19,
  ctaFontWeight: '700',
  ctaPadding: 19,

  // Spacing Global
  sectionPadding: 64,
  containerMaxWidth: 1400,
  gridGap: 32,

  // Rôle : Chemins d'images pour la comparaison de produits
  // Type : string (chemin relatif vers fichier image)
  // Domaine : chemins valides vers images (.png, .jpg, .jpeg, .webp, .svg)
  // Usage : Synchronisation temps réel des images entre éditeur et présentation
  'product-image-path': './images/Li-CUBE PRO.png',
  'competitor-image-path': './images/concurrent.png',
  'vs-element-text': 'VS',

  // Rôle : Styles personnalisables pour l'élément VS
  // Type : propriétés CSS (taille, couleur, police, espacement)
  // Domaine : valeurs CSS valides pour chaque propriété
  // Usage : Personnalisation visuelle du texte VS distinct des boutons
  vsFontSize: 2.2,
  vsFontWeight: '900',
  vsTextColor: '#1E293B',
  vsFontFamily: "'Playfair Display', serif",
  vsTextTransform: 'uppercase',
  vsLetterSpacing: 0.15,

  // Chemin logo (déjà géré mais ajouté pour cohérence)
  'logo-path': './images/logo edsquebec.png',

  // Rôle : Emojis éditables pour la section comparaison technique
  // Type : string (caractères Unicode emoji)
  // Domaine : emojis valides Unicode (généralement 1-2 caractères)
  // Usage : Personnalisation des icônes de comparaison avec synchronisation temps réel
  'weakness-title-emoji': '❌',
  'strength-title-emoji': '✅',

  // Emojis des faiblesses du concurrent (weakness)
  'weakness1-emoji': '☠️',
  'weakness2-emoji': '🔧',
  'weakness3-emoji': '⏳',
  'weakness4-emoji': '🏋️',
  'weakness5-emoji': '🐌',
  'weakness6-emoji': '📵',
  'weakness7-emoji': '⚖️',
  'weakness8-emoji': '🧠',
  'weakness9-emoji': '📊',
  'weakness10-emoji': '💸',
  'weakness11-emoji': '🔄',

  // Emojis des avantages du produit principal (strength)
  'strength1-emoji': '🔋',
  'strength2-emoji': '🛡️',
  'strength3-emoji': '📡',
  'strength4-emoji': '⚡',
  'strength5-emoji': '🌡️',
  'strength6-emoji': '🍃',
  'strength7-emoji': '🛡️',
  'strength8-emoji': '💰',
  'strength9-emoji': '🇨🇦',
  'strength10-emoji': '📦',
  'strength11-emoji': '🔋',
  'strength12-emoji': '💵',
};

// Fonction de basculement de l'éditeur
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

// Application des styles en temps réel pour location.html ET edit-location.html
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

// Mise à jour des affichages de valeurs pour location.html
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

// Réinitialisation depuis le backup
function resetCSS() {
  const backup = localStorage.getItem('locationVSOLD-css-backup');
  const stylesToReset = backup ? JSON.parse(backup) : defaultValues;

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

// Sauvegarde avec popup de validation
function saveCSS() {
  // Popup de validation moderne
  showSaveConfirmation(() => {
    const styles = {};
    Object.keys(defaultValues).forEach((key) => {
      const element = document.getElementById(key);
      if (element) styles[key] = element.value;
    });

    // Écrasement du backup de réinitialisation
    localStorage.setItem('locationVSOLD-css-backup', JSON.stringify(styles));
    showNotification('Nouveau point de sauvegarde créé !', 'success');
  });
}

// Popup de confirmation moderne
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

  popup.innerHTML = `
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
            `;

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

function closePopup(overlay) {
  overlay.style.opacity = '0';
  overlay.querySelector('div').style.transform = 'scale(0.8)';
  setTimeout(() => overlay.remove(), 300);
}

// Import CSS
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
function createInitialBackup() {
  const existingBackup = localStorage.getItem('locationVSOLD-css-backup');
  if (!existingBackup) {
    // Premier lancement : créer backup avec valeurs par défaut
    localStorage.setItem('locationVSOLD-css-backup', JSON.stringify(defaultValues));
    console.log('🔄 Backup automatique initial créé');
  }
}

// Synchronisation temps réel avec location.html
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
let weaknessIndex = 0;
let strengthIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
  weaknessIndex = document.querySelectorAll('#weaknesses-container .content-block').length;
  strengthIndex = document.querySelectorAll('#strengths-container .content-block').length;
});

window.addWeakness = function () {
  weaknessIndex += 1;
  const template = document.getElementById('weakness-template').content.cloneNode(true);
  template.querySelectorAll('[data-field]').forEach((el) => {
    const type = el.dataset.field.endsWith('-title') ? 'title' : 'desc';
    el.id = `weakness${weaknessIndex}-${type}`;
    el.dataset.field = `weakness${weaknessIndex}-${type}`;
    if (window.instantSync && typeof window.instantSync.registerField === 'function') {
      window.instantSync.registerField(el);
    }
  });
  template.querySelectorAll('label').forEach((label) => {
    label.setAttribute('for', label.getAttribute('for').replace('X', weaknessIndex));
    label.textContent = label.textContent.replace('X', weaknessIndex);
  });
  document.getElementById('weaknesses-container').appendChild(template);
};

window.removeWeakness = function () {
  const container = document.getElementById('weaknesses-container');
  const blocks = container.querySelectorAll('.content-block');
  if (blocks.length > 0) {
    container.removeChild(blocks[blocks.length - 1]);
    weaknessIndex -= 1;
  }
};

window.addStrength = function () {
  strengthIndex += 1;
  const template = document.getElementById('strength-template').content.cloneNode(true);
  template.querySelectorAll('[data-field]').forEach((el) => {
    const type = el.dataset.field.endsWith('-title') ? 'title' : 'desc';
    el.id = `strength${strengthIndex}-${type}`;
    el.dataset.field = `strength${strengthIndex}-${type}`;
    if (window.instantSync && typeof window.instantSync.registerField === 'function') {
      window.instantSync.registerField(el);
    }
  });
  template.querySelectorAll('label').forEach((label) => {
    label.setAttribute('for', label.getAttribute('for').replace('X', strengthIndex));
    label.textContent = label.textContent.replace('X', strengthIndex);
  });
  document.getElementById('strengths-container').appendChild(template);
};

window.removeStrength = function () {
  const container = document.getElementById('strengths-container');
  const blocks = container.querySelectorAll('.content-block');
  if (blocks.length > 0) {
    container.removeChild(blocks[blocks.length - 1]);
    strengthIndex -= 1;
  }
};
// Listener pour synchroniser les variables CSS de la page d'édition avec location.html
let editPageStyleElement = null;

// Application des variables CSS dynamiques à la page d'édition
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
  if (typeof defaultValues !== 'undefined') {
    Object.keys(defaultValues).forEach((key) => {
      const element = document.getElementById(key);
      if (element) {
        element.addEventListener('input', handleLocalStyleChanges);
        element.addEventListener('change', handleLocalStyleChanges);
      }
    });
  }

  console.log('🎭 Système de synchronisation des styles de la page d\'édition initialisé');
});
