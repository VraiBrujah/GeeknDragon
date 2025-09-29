<?php
/**
 * cmp-consent.php - Composant CMP (Consent Management Platform)
 * 
 * Implémente le système de gestion des consentements avec les meilleures pratiques e-commerce:
 * - Chargement prioritaire avant analytics et tracking
 * - Configuration adaptée aux besoins RGPD/CCPA
 * - Intégration harmonieuse avec Snipcart et Google Analytics
 * - Support multilingue français/anglais
 */

// Récupération de la langue courante
$currentLang = $lang ?? 'fr';

// Configuration CMP selon les meilleures pratiques e-commerce
$cmpConfig = [
    'id' => 'cbe2fe3762e57', // ID spécifique fourni
    'host' => 'c.delivery.consentmanager.net',
    'cdn' => 'cdn.consentmanager.net',
    'ab_testing' => '1', // A/B testing activé
    'auto_blocking' => false, // Désactiver autoblocking pour e-commerce
    'code_source' => '0', // Source directe CDN
    'language' => $currentLang === 'en' ? 'en' : 'fr' // Support multilingue
];

// Génération des attributs data-cmp
$cmpAttributes = [
    'data-cmp-ab="' . htmlspecialchars($cmpConfig['ab_testing']) . '"',
    'data-cmp-host="' . htmlspecialchars($cmpConfig['host']) . '"',
    'data-cmp-cdn="' . htmlspecialchars($cmpConfig['cdn']) . '"',
    'data-cmp-codesrc="' . htmlspecialchars($cmpConfig['code_source']) . '"'
];

// URL du script CMP SANS autoblocking pour compatibilité e-commerce
$cmpScriptUrl = 'https://' . $cmpConfig['cdn'] . '/delivery/' . $cmpConfig['id'] . '.js';

?>

<!-- Consent Management Platform (CMP) - PRIORITÉ MAXIMALE -->
<!-- Chargé en premier pour bloquer automatiquement les trackers avant consentement -->
<script 
    type="text/javascript" 
    <?= implode(' ', $cmpAttributes) ?>
    src="<?= htmlspecialchars($cmpScriptUrl) ?>"
    async>
</script>

<!-- Configuration avancée CMP pour e-commerce -->
<script>
(function() {
    'use strict';
    
    // Variables globales ConsentManager pour ignorer les domaines e-commerce
    window.cmp_block_ignoredomains = [
        'cdn.snipcart.com',
        'app.snipcart.com', 
        'js.stripe.com',
        'checkout.stripe.com',
        'm.stripe.com',
        'api.stripe.com',
        'hooks.stripe.com',
        'checkout.snipcart.com'
    ];
    
    // Configuration spécifique e-commerce
    window.cmpConfig = window.cmpConfig || {
        // Intégration avec Google Analytics
        integrations: {
            googleAnalytics: true,
            googleTagManager: false, // Désactivé car on utilise gtag directement
            snipcart: true
        },
        
        // Cookies critiques pour e-commerce (toujours autorisés)
        essentialCookies: [
            'snipcart_*', // Cookies panier Snipcart
            'PHPSESSID', // Session PHP
            'lang_preference', // Préférence langue
            'cart_session' // Session panier local
        ],
        
        // Scripts essentiels exempts de blocage CMP
        essentialScripts: [
            'cdn.snipcart.com', // CDN Snipcart toujours autorisé
            'snipcart.js', // Script panier essentiel
            'app.snipcart.com', // API Snipcart
            'js.stripe.com', // Processeur de paiement
            'checkout.stripe.com', // Interface de paiement
            'snipcart' // Mot-clé global pour Snipcart
        ],
        
        // Configuration d'exemptions selon documentation ConsentManager
        exemptions: {
            'data-cmp-ab': '1' // CORRECT: 1 = exempt du blocage automatique
        },
        
        // Configuration des domaines à ignorer
        block_ignoredomains: [
            'cdn.snipcart.com',
            'app.snipcart.com',
            'js.stripe.com',
            'checkout.stripe.com'
        ],
        
        // Configuration multilingue
        language: '<?= $currentLang ?>',
        
        // Callbacks pour intégration avec le site
        callbacks: {
            onConsentGiven: function(purposes) {
                console.log('CMP: Consentements accordés:', purposes);
                
                // Réinitialiser Google Analytics si consentement analytics
                if (purposes.analytics && window.gtag) {
                    window.gtag('consent', 'update', {
                        'analytics_storage': 'granted',
                        'ad_storage': purposes.marketing ? 'granted' : 'denied'
                    });
                }
                
                // Événement personnalisé pour d'autres intégrations
                if (window.CustomEvent) {
                    document.dispatchEvent(new CustomEvent('cmpConsentUpdate', {
                        detail: { purposes: purposes }
                    }));
                }
            },
            
            onConsentWithdrawn: function() {
                console.log('CMP: Consentements retirés');
                
                // Révoquer les consentements Google Analytics
                if (window.gtag) {
                    window.gtag('consent', 'update', {
                        'analytics_storage': 'denied',
                        'ad_storage': 'denied'
                    });
                }
            },
            
            onError: function(error) {
                console.error('CMP: Erreur de chargement:', error);
                
                // Fallback: autoriser les cookies essentiels seulement
                document.documentElement.setAttribute('data-cmp-status', 'error');
            }
        }
    };
    
    // Détection du statut de chargement CMP
    var checkCmpLoaded = function() {
        if (window.__cmp || window.__tcfapi) {
            document.documentElement.setAttribute('data-cmp-status', 'loaded');
            console.log('CMP: Chargé avec succès');
            
            // Forcer l'exemption Snipcart après chargement CMP
            if (window.__cmp && window.__cmp.configure) {
                window.__cmp.configure({
                    whitelist: ['cdn.snipcart.com', 'app.snipcart.com', 'js.stripe.com'],
                    essentialServices: ['snipcart', 'stripe']
                });
            }
        } else {
            setTimeout(checkCmpLoaded, 100);
        }
    };
    
    // Vérifier le chargement après un délai
    setTimeout(checkCmpLoaded, 500);
    
    // Timeout de sécurité (5 secondes)
    setTimeout(function() {
        if (!document.documentElement.getAttribute('data-cmp-status')) {
            console.warn('CMP: Timeout de chargement - Mode dégradé activé');
            document.documentElement.setAttribute('data-cmp-status', 'timeout');
        }
    }, 5000);
    
})();
</script>

<!-- Styles CSS pour la bannière de consentement -->
<style>
/* Personnalisation de la bannière CMP pour Geek & Dragon */
.cmp-banner,
#cmp-banner {
    z-index: 999999 !important;
    font-family: inherit !important;
}

.cmp-banner .cmp-button,
#cmp-banner .cmp-button {
    background: linear-gradient(135deg, #8B5A2B 0%, #D4AF37 100%) !important;
    border: none !important;
    border-radius: 4px !important;
    color: white !important;
    font-weight: 600 !important;
    padding: 12px 24px !important;
    transition: all 0.3s ease !important;
}

.cmp-banner .cmp-button:hover,
#cmp-banner .cmp-button:hover {
    background: linear-gradient(135deg, #A0632F 0%, #E6C547 100%) !important;
    transform: translateY(-1px) !important;
}

.cmp-banner .cmp-text,
#cmp-banner .cmp-text {
    color: #333 !important;
    line-height: 1.5 !important;
}

/* Dark mode pour correspondre au thème du site */
@media (prefers-color-scheme: dark) {
    .cmp-banner,
    #cmp-banner {
        background: rgba(17, 24, 39, 0.95) !important;
        border-top: 2px solid #8B5A2B !important;
    }
    
    .cmp-banner .cmp-text,
    #cmp-banner .cmp-text {
        color: #f3f4f6 !important;
    }
}

/* Animation d'entrée */
.cmp-banner,
#cmp-banner {
    animation: cmpSlideIn 0.5s ease-out !important;
}

@keyframes cmpSlideIn {
    from {
        transform: translateY(100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* Responsive */
@media (max-width: 768px) {
    .cmp-banner,
    #cmp-banner {
        padding: 16px !important;
    }
    
    .cmp-banner .cmp-button,
    #cmp-banner .cmp-button {
        width: 100% !important;
        margin-top: 12px !important;
    }
}
</style>

<?php
/**
 * Documentation d'utilisation:
 * 
 * 1. Inclure ce composant en PREMIER dans head-common.php
 * 2. Le CMP bloquera automatiquement tous les trackers
 * 3. Google Analytics sera initialisé après consentement
 * 4. Snipcart continuera de fonctionner (cookies essentiels)
 * 
 * Événements JavaScript disponibles:
 * - 'cmpConsentUpdate' : déclenché lors des changements de consentement
 * - data-cmp-status : attribut sur <html> indiquant le statut CMP
 * 
 * Classes CSS personnalisables:
 * - .cmp-banner, #cmp-banner : bannière principale
 * - .cmp-button : boutons d'action
 * - .cmp-text : texte de la bannière
 */
?>