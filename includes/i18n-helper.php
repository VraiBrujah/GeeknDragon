<?php
/**
 * Helper pour le système de traduction I18N
 * 
 * Simplifie l'utilisation des traductions et fournit des fonctions utilitaires
 * pour le système multilingue de Geek & Dragon
 */

/**
 * Récupère une traduction par clé avec support des clés imbriquées
 * 
 * @param string $key Clé de traduction (ex: "product.add" ou "shop.hero.title")
 * @param array|null $translations Tableau de traductions (optionnel, utilise $GLOBALS['translations'] par défaut)
 * @param string $fallback Texte de fallback si la traduction n'existe pas
 * @return string Texte traduit ou fallback
 */
function t(string $key, ?array $translations = null, string $fallback = ''): string
{
    $translations = $translations ?? ($GLOBALS['translations'] ?? []);
    
    if (empty($key) || empty($translations)) {
        return $fallback;
    }
    
    $keys = explode('.', $key);
    $value = $translations;
    
    foreach ($keys as $k) {
        if (!is_array($value) || !isset($value[$k])) {
            return $fallback;
        }
        $value = $value[$k];
    }
    
    return is_string($value) ? $value : $fallback;
}

/**
 * Génère un attribut data-i18n avec le texte traduit en fallback
 * 
 * @param string $key Clé de traduction
 * @param string $fallback Texte de fallback
 * @param array|null $translations Tableau de traductions
 * @return string Attribut data-i18n complet avec le texte
 */
function dataI18n(string $key, string $fallback = '', ?array $translations = null): string
{
    $translatedText = t($key, $translations, $fallback);
    return sprintf('data-i18n="%s">%s', htmlspecialchars($key), htmlspecialchars($translatedText));
}

/**
 * Génère un attribut aria-label traduit
 * 
 * @param string $key Clé de traduction
 * @param string $fallback Texte de fallback
 * @param array|null $translations Tableau de traductions
 * @return string Attribut aria-label complet
 */
function ariaLabel(string $key, string $fallback = '', ?array $translations = null): string
{
    $translatedText = t($key, $translations, $fallback);
    return sprintf('aria-label="%s"', htmlspecialchars($translatedText));
}

/**
 * Ajoute des traductions manquantes au système existant
 * 
 * @param string $lang Code de langue ('fr' ou 'en')
 * @return array Traductions mises à jour
 */
function addMissingTranslations(string $lang): array
{
    $missingTranslations = [
        'fr' => [
            'ui' => [
                'noImageAvailable' => 'Aucune image disponible',
                'previousImage' => 'Image précédente',
                'nextImage' => 'Image suivante',
                'loading' => 'Chargement...',
                'error' => 'Erreur',
                'close' => 'Fermer'
            ],
            'shop' => [
                'converter' => [
                    'title' => 'Convertisseur de monnaie',
                    'sourcesLabel' => '💰 Monnaies sources',
                    'multiplierLabel' => '⚖️ Tableau multiplicateur (éditable)',
                    'equivalences' => '💼 Équivalences totales par métal',
                    'recommendations' => '✨ Recommandations optimales',
                    'currency' => [
                        'copper' => 'Cuivre',
                        'silver' => 'Argent',
                        'electrum' => 'Électrum',
                        'gold' => 'Or',
                        'platinum' => 'Platine'
                    ]
                ],
                'cards' => [
                    'description' => 'Paquets thématiques de cartes illustrées pour gérer l\'inventaire visuellement.'
                ],
                'triptychs' => [
                    'description' => 'Héros clé en main pour des parties improvisées.'
                ]
            ]
        ],
        'en' => [
            'ui' => [
                'noImageAvailable' => 'No image available',
                'previousImage' => 'Previous image',
                'nextImage' => 'Next image',
                'loading' => 'Loading...',
                'error' => 'Error',
                'close' => 'Close'
            ],
            'shop' => [
                'converter' => [
                    'title' => 'Currency converter',
                    'sourcesLabel' => '💰 Source currencies',
                    'multiplierLabel' => '⚖️ Multiplier table (editable)',
                    'equivalences' => '💼 Total equivalences by metal',
                    'recommendations' => '✨ Optimal recommendations',
                    'currency' => [
                        'copper' => 'Copper',
                        'silver' => 'Silver',
                        'electrum' => 'Electrum',
                        'gold' => 'Gold',
                        'platinum' => 'Platinum'
                    ]
                ],
                'cards' => [
                    'description' => 'Themed packs of illustrated cards to manage inventory visually.'
                ],
                'triptychs' => [
                    'description' => 'Ready-to-play heroes for improvised sessions.'
                ]
            ]
        ]
    ];
    
    return $missingTranslations[$lang] ?? [];
}
?>