<?php
declare(strict_types=1);

/**
 * Prépare la configuration Snipcart exposée à la boutique.
 */
$config = require __DIR__ . '/config.php';
$snipcartApiKey = is_string($config['snipcart_api_key'] ?? null) ? $config['snipcart_api_key'] : '';
?>
require __DIR__ . '/bootstrap.php';

$translator = require __DIR__ . '/i18n.php';
$lang = $translator->getCurrentLanguage();

if (!function_exists('gdLocalAssetVersion')) {
    /**
     * Retourne le timestamp de dernière modification pour versionner les assets.
     */
    function gdLocalAssetVersion(string $relativePath): string
    {
        $absolute = __DIR__ . '/' . ltrim($relativePath, '/');
        return is_file($absolute) ? (string) filemtime($absolute) : '0';
    }
}

$title = __('meta.shop.title', 'Boutique - Geek & Dragon | Accessoires de jeux de rôle premium');
$metaDescription = __('meta.shop.desc', "Découvrez notre collection complète : pièces métalliques authentiques, cartes d'équipement illustrées et triptyques mystères pour D&D. Livraison rapide au Canada.");
$active = 'boutique';
$styleVersion = gdLocalAssetVersion('css/style.css');
$boutiqueVersion = gdLocalAssetVersion('css/boutique.css');
$extraHead = <<<HTML
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css?v={$styleVersion}">
  <link rel="stylesheet" href="/css/boutique.css?v={$boutiqueVersion}">
HTML;
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang, ENT_QUOTES, 'UTF-8'); ?>">
<?php include __DIR__ . '/head-common.php'; ?>
<body>
<?php include __DIR__ . '/header.php'; ?>

    <main id="main" class="shop-main pt-32">
        <section class="shop-hero">
            <div class="hero-videos" data-main="/videos/Fontaine12.mp4" data-videos='["/videos/Carte1.mp4","/videos/fontaine6.mp4","/videos/trip2.mp4","/videos/fontaine7.mp4","/videos/cartearme.mp4","/videos/fontaine8.mp4","/videos/fontaine9.mp4","/videos/fontaine4.mp4"]'></div>
            <div class="hero-overlay"></div>
            <div class="container">
                <div class="shop-hero-content">
                    <h1 class="hero-title animated-text">Transformez vos aventures en <span class="highlight">épopées légendaires</span></h1>
                    <p class="hero-subtitle">Découvrez notre collection d'accessoires immersifs pour vos parties de jeux de rôle : pièces métalliques authentiques, cartes d'équipement illustrées et triptyques mystères.</p>
                    <div class="shop-stats">
                        <div class="stat">
                            <strong>8</strong>
                            <span>Produits Uniques</span>
                        </div>
                        <div class="stat">
                            <strong>100%</strong>
                            <span>Qualité Premium</span>
                        </div>
                        <div class="stat">
                            <img src="/images/logo-fabriqueQC.webp" alt="Fabriqué au Québec" class="quebec-logo">
                            <span>Fabriqué au Québec</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- SECTION PIÈCES MÉTALLIQUES -->
        <section class="product-section" id="coins">
            <div class="container">
                <header class="section-header">
                    <h2 class="section-title">💰 Pièces Métalliques</h2>
                    <p class="section-subtitle">Collections authentiques en métaux nobles pour une immersion tactile inégalée</p>
                </header>

                <div class="products-grid">
                    <!-- L'Offrande du Voyageur -->
                    <article class="product-card fade-in" data-category="coins" data-price="60" data-language="both">
                        <div class="product-image">
                            <img src="/images/optimized-modern/webp/Vagabon.webp" alt="L'Offrande du Voyageur - Starter pack de pièces métalliques" loading="lazy">
                            <div class="product-badge starter">Starter Pack</div>
                            <div class="product-overlay">
                                <a href="<?= htmlspecialchars(langUrl('/product.php?id=lot10'), ENT_QUOTES, 'UTF-8'); ?>" class="product-quick-view">Voir Détails</a>
                            </div>
                        </div>
                        <div class="product-content">
                            <h3 class="product-title">L'Offrande du Voyageur</h3>
                            <p class="product-description">Starter pack immersif avec 10 pièces métalliques (2 de chaque métal : cuivre, argent, électrum, or, platine)</p>
                            <div class="product-features">
                                <span class="feature-tag">5 multiplicateurs au choix</span>
                                <span class="feature-tag">Finitions variables</span>
                            </div>
                            <div class="product-pricing">
                                <span class="price">60$ <small>CAD</small></span>
                                <span class="price-note">Point d'entrée idéal</span>
                            </div>
                            <div class="product-actions">
                                <button class="gd-add-to-cart btn-primary"
                                        data-product-id="lot10"
                                        data-product-name="L'Offrande du Voyageur"
                                        data-product-price="60.00"
                                        data-product-url="/product.php?id=lot10"
                                        data-product-image="/images/optimized-modern/webp/Vagabon.webp"
                                        data-product-description="Starter pack immersif avec 10 pièces métalliques authentiques"
                                        data-quantity="1">
                                    <span class="cart-icon">🎒</span>
                                    <span>Ajouter à l'inventaire</span>
                                </button>
                                <a href="<?= htmlspecialchars(langUrl('/product.php?id=lot10'), ENT_QUOTES, 'UTF-8'); ?>" class="btn-secondary-small">Détails</a>
                            </div>
                        </div>
                    </article>

                    <!-- La Monnaie des Cinq Royaumes -->
                    <article class="product-card fade-in" data-category="coins" data-price="145" data-language="both">
                        <div class="product-image">
                            <img src="/images/optimized-modern/webp/Royaume.webp" alt="La Monnaie des Cinq Royaumes - Collection complète" loading="lazy">
                            <div class="product-badge popular">Plus Populaire</div>
                            <div class="product-overlay">
                                <a href="<?= htmlspecialchars(langUrl('/product.php?id=lot25'), ENT_QUOTES, 'UTF-8'); ?>" class="product-quick-view">Voir Détails</a>
                            </div>
                        </div>
                        <div class="product-content">
                            <h3 class="product-title">La Monnaie des Cinq Royaumes</h3>
                            <p class="product-description">Collection complète de 25 pièces uniques (5 métaux × 5 multiplicateurs) sans aucun doublon</p>
                            <div class="product-features">
                                <span class="feature-tag">25 pièces uniques</span>
                                <span class="feature-tag">Tout inclus</span>
                            </div>
                            <div class="product-pricing">
                                <span class="price">145$ <small>CAD</small></span>
                                <span class="price-note">Solution complète</span>
                            </div>
                            <div class="product-actions">
                                <button class="gd-add-to-cart btn-primary"
                                        data-product-id="lot25"
                                        data-product-name="La Monnaie des Cinq Royaumes"
                                        data-product-price="145.00"
                                        data-product-url="/product.php?id=lot25"
                                        data-product-image="/images/optimized-modern/webp/Royaume.webp"
                                        data-product-description="Collection complète de 25 pièces uniques sans aucun doublon"
                                        data-quantity="1">
                                    <span class="cart-icon">🎒</span>
                                    <span>Ajouter à l'inventaire</span>
                                </button>
                                <a href="<?= htmlspecialchars(langUrl('/product.php?id=lot25'), ENT_QUOTES, 'UTF-8'); ?>" class="btn-secondary-small">Détails</a>
                            </div>
                        </div>
                    </article>

                    <!-- L'Essence du Marchand -->
                    <article class="product-card fade-in" data-category="coins" data-price="275" data-language="both">
                        <div class="product-image">
                            <img src="/images/optimized-modern/webp/Essence.webp" alt="L'Essence du Marchand - Double variété" loading="lazy">
                            <div class="product-badge premium">Premium</div>
                            <div class="product-overlay">
                                <a href="<?= htmlspecialchars(langUrl('/product.php?id=lot50-essence'), ENT_QUOTES, 'UTF-8'); ?>" class="product-quick-view">Voir Détails</a>
                            </div>
                        </div>
                        <div class="product-content">
                            <h3 class="product-title">L'Essence du Marchand</h3>
                            <p class="product-description">Double variété pour richesse : 50 pièces (2 exemplaires de chacun des 25 modèles)</p>
                            <div class="product-features">
                                <span class="feature-tag">50 pièces totales</span>
                                <span class="feature-tag">Double de tout</span>
                            </div>
                            <div class="product-pricing">
                                <span class="price">275$ <small>CAD</small></span>
                                <span class="price-note">Groupes nombreux</span>
                            </div>
                            <div class="product-actions">
                                <button class="gd-add-to-cart btn-primary"
                                        data-product-id="lot50-essence"
                                        data-product-name="L'Essence du Marchand"
                                        data-product-price="275.00"
                                        data-product-url="/product.php?id=lot50-essence"
                                        data-product-image="/images/optimized-modern/webp/Essence.webp"
                                        data-product-description="Double variété pour richesse : 50 pièces (2 exemplaires de chacun des 25 modèles)"
                                        data-quantity="1">
                                    <span class="cart-icon">🎒</span>
                                    <span>Ajouter à l'inventaire</span>
                                </button>
                                <a href="<?= htmlspecialchars(langUrl('/product.php?id=lot50-essence'), ENT_QUOTES, 'UTF-8'); ?>" class="btn-secondary-small">Détails</a>
                            </div>
                        </div>
                    </article>

                    <!-- La Trésorerie du Seigneur -->
                    <article class="product-card fade-in" data-category="coins" data-price="275" data-language="both">
                        <div class="product-image">
                            <img src="/images/optimized-modern/webp/Seignieur.webp" alt="La Trésorerie du Seigneur - Opulence uniforme" loading="lazy">
                            <div class="product-badge luxury">Luxe</div>
                            <div class="product-overlay">
                                <a href="<?= htmlspecialchars(langUrl('/product.php?id=lot50-tresorerie'), ENT_QUOTES, 'UTF-8'); ?>" class="product-quick-view">Voir Détails</a>
                            </div>
                        </div>
                        <div class="product-content">
                            <h3 class="product-title">La Trésorerie du Seigneur</h3>
                            <p class="product-description">Opulence uniforme : 50 pièces (10 de chaque métal) avec un multiplicateur unique pour tout le lot</p>
                            <div class="product-features">
                                <span class="feature-tag">Multiplicateur uniforme</span>
                                <span class="feature-tag">Calculs simplifiés</span>
                            </div>
                            <div class="product-pricing">
                                <span class="price">275$ <small>CAD</small></span>
                                <span class="price-note">Trésor somptueux</span>
                            </div>
                            <div class="product-actions">
                                <button class="gd-add-to-cart btn-primary"
                                        data-product-id="lot50-tresorerie"
                                        data-product-name="La Trésorerie du Seigneur"
                                        data-product-price="275.00"
                                        data-product-url="/product.php?id=lot50-tresorerie"
                                        data-product-image="/images/optimized-modern/webp/Seignieur.webp"
                                        data-product-description="Opulence uniforme : 50 pièces (10 de chaque métal) avec un multiplicateur unique"
                                        data-quantity="1">
                                    <span class="cart-icon">🎒</span>
                                    <span>Ajouter à l'inventaire</span>
                                </button>
                                <a href="<?= htmlspecialchars(langUrl('/product.php?id=lot50-tresorerie'), ENT_QUOTES, 'UTF-8'); ?>" class="btn-secondary-small">Détails</a>
                            </div>
                        </div>
                    </article>
                </div>
                <!-- Vidéo de présentation -->
                <div class="video-section">
                    <button type="button" class="video-thumbnail" aria-controls="video-modal" aria-label="Lire la vidéo de Pierre-Louis (Es-Tu Game ?) — L'Économie de D&D 💰 Conseils Jeux de Rôle" data-video-open>
                        <img src="https://img.youtube.com/vi/y96eAFtC4xE/hqdefault.jpg" alt="Miniature de la vidéo « L’Économie de D&D 💰 Conseils Jeux de Rôle »">
                    </button>
                </div>

                <!-- Modal vidéo -->
                <div id="video-modal" class="video-modal hidden" role="dialog" aria-modal="true" aria-label="Lire la vidéo « L’Économie de D&D 💰 Conseils Jeux de Rôle »" tabindex="-1">
                    <div class="video-container">
                        <button type="button" class="close-btn" aria-label="Fermer la vidéo" data-video-close>&times;</button>
                        <iframe src="https://www.youtube.com/embed/y96eAFtC4xE?start=624&rel=0&modestbranding=1" title="L’Économie de D&D 💰 Conseils Jeux de Rôle" allowfullscreen tabindex="-1"></iframe>
                    </div>
                </div>

                <!-- Convertisseur de monnaie -->
                <div id="currency-converter">
                    <h4 data-i18n="shop.converter.title">Convertisseur de monnaie</h4>
                    <div class="converter-inputs">
                        <p data-i18n="shop.converter.sourcesLabel">Monnaies sources</p>
                        <table id="currency-sources">
                            <thead>
                                <tr>
                                    <th data-i18n="shop.converter.copper">pièce de cuivre</th>
                                    <th data-i18n="shop.converter.silver">pièce d’argent</th>
                                    <th data-i18n="shop.converter.electrum">pièce d’électrum</th>
                                    <th data-i18n="shop.converter.gold">pièce d’or</th>
                                    <th data-i18n="shop.converter.platinum">pièce de platine</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="copper">
                                        <div class="advanced-group hidden">
                                            <label><span data-i18n="shop.converter.multiplier10000">x10 000</span><input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="copper" data-multiplier="10000"></label>
                                            <label><span data-i18n="shop.converter.multiplier1000">x1 000</span><input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="copper" data-multiplier="1000"></label>
                                            <label><span data-i18n="shop.converter.multiplier100">x100</span><input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="copper" data-multiplier="100"></label>
                                            <label><span data-i18n="shop.converter.multiplier10">x10</span><input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="copper" data-multiplier="10"></label>
                                            <label><span data-i18n="shop.converter.multiplier1">x1</span><input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="copper" data-multiplier="1"></label>
                                        </div>
                                    </td>
                                    <td>
                                        <input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="silver">
                                        <div class="advanced-group hidden">
                                            <label><span data-i18n="shop.converter.multiplier10000">x10 000</span><input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="silver" data-multiplier="10000"></label>
                                            <label><span data-i18n="shop.converter.multiplier1000">x1 000</span><input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="silver" data-multiplier="1000"></label>
                                            <label><span data-i18n="shop.converter.multiplier100">x100</span><input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="silver" data-multiplier="100"></label>
                                            <label><span data-i18n="shop.converter.multiplier10">x10</span><input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="silver" data-multiplier="10"></label>
                                            <label><span data-i18n="shop.converter.multiplier1">x1</span><input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="silver" data-multiplier="1"></label>
                                        </div>
                                    </td>
                                    <td>
                                        <input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="electrum">
                                        <div class="advanced-group hidden">
                                            <label><span data-i18n="shop.converter.multiplier10000">x10 000</span><input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="electrum" data-multiplier="10000"></label>
                                            <label><span data-i18n="shop.converter.multiplier1000">x1 000</span><input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="electrum" data-multiplier="1000"></label>
                                            <label><span data-i18n="shop.converter.multiplier100">x100</span><input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="electrum" data-multiplier="100"></label>
                                            <label><span data-i18n="shop.converter.multiplier10">x10</span><input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="electrum" data-multiplier="10"></label>
                                            <label><span data-i18n="shop.converter.multiplier1">x1</span><input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="electrum" data-multiplier="1"></label>
                                        </div>
                                    </td>
                                    <td>
                                        <input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="gold">
                                        <div class="advanced-group hidden">
                                            <label><span data-i18n="shop.converter.multiplier10000">x10 000</span><input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="gold" data-multiplier="10000"></label>
                                            <label><span data-i18n="shop.converter.multiplier1000">x1 000</span><input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="gold" data-multiplier="1000"></label>
                                            <label><span data-i18n="shop.converter.multiplier100">x100</span><input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="gold" data-multiplier="100"></label>
                                            <label><span data-i18n="shop.converter.multiplier10">x10</span><input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="gold" data-multiplier="10"></label>
                                            <label><span data-i18n="shop.converter.multiplier1">x1</span><input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="gold" data-multiplier="1"></label>
                                        </div>
                                    </td>
                                    <td>
                                        <input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="platinum">
                                        <div class="advanced-group hidden">
                                            <label><span data-i18n="shop.converter.multiplier10000">x10 000</span><input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="platinum" data-multiplier="10000"></label>
                                            <label><span data-i18n="shop.converter.multiplier1000">x1 000</span><input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="platinum" data-multiplier="1000"></label>
                                            <label><span data-i18n="shop.converter.multiplier100">x100</span><input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="platinum" data-multiplier="100"></label>
                                            <label><span data-i18n="shop.converter.multiplier10">x10</span><input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="platinum" data-multiplier="10"></label>
                                            <label><span data-i18n="shop.converter.multiplier1">x1</span><input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="platinum" data-multiplier="1"></label>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <button id="currency-advanced-toggle" data-i18n="shop.converter.advancedToggle">Détails</button>
                    </div>
                    <div id="currency-equivalences" class="hidden">
                        <h5 data-i18n="shop.converter.equivTitle">Équivalences totales par métal</h5>
                        <table id="currency-equivalences-list">
                            <thead>
                                <tr>
                                    <th data-i18n="shop.converter.equivMetal">Métal</th>
                                    <th data-i18n="shop.converter.equivEquivalent">Équivalence</th>
                                    <th data-i18n="shop.converter.remainder">Reste</th>
                                    <th data-i18n="shop.converter.equivTotalPieces">Nombre total de pièces</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                            <tfoot>
                                <tr class="totals-header">
                                    <th></th>
                                    <th data-i18n="shop.converter.totalBreakdown">Total :</th>
                                    <th data-i18n="shop.converter.totalGold">Total en or</th>
                                    <th data-i18n="shop.converter.totalPieces">Nombre total de pièces :</th>
                                </tr>
                                <tr class="totals-values">
                                    <td></td>
                                    <td id="currency-total-breakdown"></td>
                                    <td id="currency-total-gold"></td>
                                    <td id="currency-total-pieces"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    
                    <!-- Section Recommandations GeeknDragon -->
                    <div id="gd-recommendations" class="hidden">
                        <h3>🎒 Lots Geek&Dragon Recommandés</h3>
                        <div class="gd-recommendations-content">
                            <!-- Contenu généré dynamiquement par JavaScript -->
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- SECTION CARTES D'ÉQUIPEMENT -->
        <section class="product-section" id="cards">
            <div class="container">
                <header class="section-header">
                    <h2 class="section-title">🃏 Cartes d'Équipement</h2>
                    <p class="section-subtitle">182 cartes illustrées par pack pour équiper vos aventuriers sans fouiller dans les manuels</p>
                </header>

                <div class="products-grid">
                    <!-- Arsenal de l'Aventurier -->
                    <article class="product-card fade-in" data-category="cards" data-price="49.99" data-language="fr en">
                        <div class="product-image">
                            <img src="/images/optimized-modern/webp/arme-recto.webp" alt="Arsenal de l'Aventurier - Équipement de base" loading="lazy">
                            <div class="product-badge essential">Essentiel</div>
                            <div class="product-overlay">
                                <a href="<?= htmlspecialchars(langUrl('/product.php?id=pack-182-arsenal-aventurier'), ENT_QUOTES, 'UTF-8'); ?>" class="product-quick-view">Voir Détails</a>
                            </div>
                        </div>
                        <div class="product-content">
                            <h3 class="product-title">Arsenal de l'Aventurier</h3>
                            <p class="product-description">Équipement de base complet : armes, armures, boucliers et équipement de terrain pour tous vos aventuriers</p>
                            <div class="product-features">
                                <span class="feature-tag">182 cartes</span>
                                <span class="feature-tag">Français OU Anglais</span>
                                <span class="feature-tag">Équipement classique</span>
                            </div>
                            <div class="product-pricing">
                                <span class="price">49.99$ <small>CAD</small></span>
                                <span class="price-note">Parfait pour débuter</span>
                            </div>
                            <div class="product-actions">
                                <button class="gd-add-to-cart btn-primary"
                                        data-product-id="arsenal-aventurier"
                                        data-product-name="Arsenal de l'Aventurier"
                                        data-product-price="49.99"
                                        data-product-url="/product.php?id=pack-182-arsenal-aventurier"
                                        data-product-image="/images/optimized-modern/webp/arme-recto.webp"
                                        data-product-description="Équipement de base complet : armes, armures et équipement de terrain"
                                        data-quantity="1">
                                    <span class="cart-icon">🎒</span>
                                    <span>Ajouter à l'inventaire</span>
                                </button>
                                <a href="<?= htmlspecialchars(langUrl('/product.php?id=pack-182-arsenal-aventurier'), ENT_QUOTES, 'UTF-8'); ?>" class="btn-secondary-small">Détails</a>
                            </div>
                        </div>
                    </article>

                    <!-- Butins & Ingénieries -->
                    <article class="product-card fade-in" data-category="cards" data-price="36.99" data-language="fr en">
                        <div class="product-image">
                            <img src="/images/optimized-modern/webp/bomb-recto.webp" alt="Butins & Ingénieries - Contenu avancé" loading="lazy">
                            <div class="product-badge advanced">Avancé</div>
                            <div class="product-overlay">
                                <a href="<?= htmlspecialchars(langUrl('/product.php?id=pack-182-butins-ingenieries'), ENT_QUOTES, 'UTF-8'); ?>" class="product-quick-view">Voir Détails</a>
                            </div>
                        </div>
                        <div class="product-content">
                            <h3 class="product-title">Butins & Ingénieries</h3>
                            <p class="product-description">Contenu avancé et moderne : gemmes, explosifs, armes futuristes et outils spécialisés pour campagnes innovantes</p>
                            <div class="product-features">
                                <span class="feature-tag">182 cartes</span>
                                <span class="feature-tag">Français OU Anglais</span>
                                <span class="feature-tag">Contenu moderne</span>
                            </div>
                            <div class="product-pricing">
                                <span class="price">36.99$ <small>CAD</small></span>
                                <span class="price-note">Sortir du médiéval</span>
                            </div>
                            <div class="product-actions">
                                <button class="gd-add-to-cart btn-primary"
                                        data-product-id="butins-ingenieries"
                                        data-product-name="Butins & Ingénieries"
                                        data-product-price="36.99"
                                        data-product-url="/product.php?id=pack-182-butins-ingenieries"
                                        data-product-image="/images/optimized-modern/webp/bomb-recto.webp"
                                        data-product-description="Contenu avancé et moderne : gemmes, explosifs et outils spécialisés"
                                        data-quantity="1">
                                    <span class="cart-icon">🎒</span>
                                    <span>Ajouter à l'inventaire</span>
                                </button>
                                <a href="<?= htmlspecialchars(langUrl('/product.php?id=pack-182-butins-ingenieries'), ENT_QUOTES, 'UTF-8'); ?>" class="btn-secondary-small">Détails</a>
                            </div>
                        </div>
                    </article>

                    <!-- Routes & Services -->
                    <article class="product-card fade-in" data-category="cards" data-price="34.99" data-language="fr en">
                        <div class="product-image">
                            <img src="/images/optimized-modern/webp/backpack-recto.webp" alt="Routes & Services - Monde vivant" loading="lazy">
                            <div class="product-badge exploration">Exploration</div>
                            <div class="product-overlay">
                                <a href="<?= htmlspecialchars(langUrl('/product.php?id=pack-182-routes-services'), ENT_QUOTES, 'UTF-8'); ?>" class="product-quick-view">Voir Détails</a>
                            </div>
                        </div>
                        <div class="product-content">
                            <h3 class="product-title">Routes & Services</h3>
                            <p class="product-description">Monde vivant et voyages : paquetages spécialisés, services urbains, véhicules et poisons pour l'exploration</p>
                            <div class="product-features">
                                <span class="feature-tag">182 cartes</span>
                                <span class="feature-tag">Français OU Anglais</span>
                                <span class="feature-tag">Exploration & intrigue</span>
                            </div>
                            <div class="product-pricing">
                                <span class="price">34.99$ <small>CAD</small></span>
                                <span class="price-note">Campagnes d'exploration</span>
                            </div>
                            <div class="product-actions">
                                <button class="gd-add-to-cart btn-primary"
                                        data-product-id="routes-services"
                                        data-product-name="Routes & Services"
                                        data-product-price="34.99"
                                        data-product-url="/product.php?id=pack-182-routes-services"
                                        data-product-image="/images/optimized-modern/webp/backpack-recto.webp"
                                        data-product-description="Monde vivant et voyages : paquetages spécialisés et services urbains"
                                        data-quantity="1">
                                    <span class="cart-icon">🎒</span>
                                    <span>Ajouter à l'inventaire</span>
                                </button>
                                <a href="<?= htmlspecialchars(langUrl('/product.php?id=pack-182-routes-services'), ENT_QUOTES, 'UTF-8'); ?>" class="btn-secondary-small">Détails</a>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </section>

        <!-- SECTION TRIPTYQUES -->
        <section class="product-section" id="triptych">
            <span id="triptyques"></span>
            <div class="container">
                <header class="section-header">
                    <h2 class="section-title">📋 Triptyques Mystères</h2>
                    <p class="section-subtitle">Héros complets générés aléatoirement, prêts à jouer immédiatement</p>
                </header>

                <div class="products-grid single-product">
                    <!-- Triptyques Mystères -->
                    <article class="product-card fade-in featured-product" data-category="triptych" data-price="59.99" data-language="fr en">
                        <div class="product-image">
                            <img src="/images/triptyque-fiche.webp" alt="Triptyques Mystères - Origines Complètes" loading="lazy">
                            <div class="product-badge mystery">Mystère</div>
                            <div class="product-overlay">
                                <a href="<?= htmlspecialchars(langUrl('/product.php?id=triptyque-aleatoire'), ENT_QUOTES, 'UTF-8'); ?>" class="product-quick-view">Voir Détails</a>
                            </div>
                        </div>
                        <div class="product-content">
                            <h3 class="product-title">Triptyques Mystères - Origines Complètes</h3>
                            <p class="product-description">Héros aléatoire clé en main : 3 triptyques tirés au sort (Classe, Espèce, Historique) + équipement et pièces incluses</p>
                            <div class="product-features">
                                <span class="feature-tag">3 triptyques aléatoires</span>
                                <span class="feature-tag">Équipement inclus</span>
                                <span class="feature-tag">Pièces de départ</span>
                                <span class="feature-tag">Compatible D&D 5e 2024</span>
                            </div>
                            <div class="product-highlights">
                                <div class="highlight-item">
                                    <strong>🎲</strong>
                                    <span>Parfait pour les one-shots</span>
                                </div>
                                <div class="highlight-item">
                                    <strong>⚡</strong>
                                    <span>Immédiatement jouable</span>
                                </div>
                                <div class="highlight-item">
                                    <strong>🎁</strong>
                                    <span>Surprise garantie</span>
                                </div>
                            </div>
                            <div class="product-pricing">
                                <span class="price">59.99$ <small>CAD</small></span>
                                <span class="price-note">Héros surprise complet</span>
                            </div>
                            <div class="product-actions">
                                <button class="gd-add-to-cart btn-primary"
                                        data-product-id="triptyques-mysteres"
                                        data-product-name="Triptyques Mystères - Origines Complètes"
                                        data-product-price="59.99"
                                        data-product-url="/product.php?id=triptyque-aleatoire"
                                        data-product-image="/images/triptyque-fiche.webp"
                                        data-product-description="Héros aléatoire clé en main : 3 triptyques tirés au sort + équipement"
                                        data-quantity="1">
                                    <span class="cart-icon">🎒</span>
                                    <span>Découvrir le Mystère</span>
                                </button>
                                <a href="<?= htmlspecialchars(langUrl('/product.php?id=triptyque-aleatoire'), ENT_QUOTES, 'UTF-8'); ?>" class="btn-secondary-small">Détails</a>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </section>

        <!-- SECTION INFORMATIONS -->
        <section class="shop-info">
            <div class="container">
                <div class="info-grid">
                    <div class="info-card">
                        <div class="info-icon">🚚</div>
                        <h3>Livraison Rapide</h3>
                        <p>Expédition sous 2-3 jours ouvrables partout au Canada. Suivi inclus pour tous les envois.</p>
                    </div>
                    <div class="info-card">
                        <div class="info-icon">🛡️</div>
                        <h3>Qualité Garantie</h3>
                        <p>Matériaux premium et contrôle qualité rigoureux. Garantie satisfait ou remboursé 30 jours.</p>
                    </div>
                    <div class="info-card">
                        <div class="info-icon">🎲</div>
                        <h3>Compatible D&D 5e (Édition 2024)</h3>
                        <p>Tous nos produits respectent les règles officielles de Donjons & Dragons 5e, édition 2024.</p>
                    </div>
                    <div class="info-card">
                        <div class="info-icon">💬</div>
                        <h3>Support Expert</h3>
                        <p>Équipe de passionnés de jeux de rôle disponible pour répondre à toutes vos questions.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- SECTION CTA -->
        <section class="shop-cta">
            <div class="container">
                <div class="cta-content">
                    <h2>Prêt à transformer vos parties ?</h2>
                    <p>Choisissez vos accessoires et vivez l'immersion ultime dès votre prochaine session de jeu.</p>
                    <div class="cta-actions">
                        <a href="#coins" class="cta-primary">Voir les Pièces</a>
                        <a href="#cards" class="cta-secondary">Voir les Cartes</a>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>Geek&Dragon</h3>
                    <p>Votre spécialiste en accessoires immersifs pour jeux de rôle depuis 2024.</p>
                </div>
                <div class="footer-section">
                    <h4>Boutique</h4>
                    <ul>
                        <li><a href="#coins">Pièces Métalliques</a></li>
                        <li><a href="#cards">Cartes d'Équipement</a></li>
                        <li><a href="#triptych">Triptyques Mystères</a></li>
                        <li><a href="#">Guide d'Achat</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Support</h4>
                    <ul>
                        <li><a href="mailto:support@geekndragon.com">Support Client</a></li>
                        <li><a href="#">Livraison & Retours</a></li>
                        <li><a href="#">Guide de Compatibilité</a></li>
                        <li><a href="#">FAQ</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 Geek&Dragon. Tous droits réservés. | Boutique spécialisée en accessoires D&D au Canada</p>
            </div>
        </div>
    </footer>

    <!-- Scripts existants -->
    <script src="/js/app.js"></script>
    <script src="/js/script.js"></script>
    <script src="/js/hero-videos.js"></script>
    <script src="/js/boutique.js"></script>
    <script src="/js/currency-converter.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js"></script>
    <script src="/js/audio-player-engine.js"></script>
    <script src="/js/audio-player-scanner.js"></script>
    <script src="/js/audio-player-ui.js"></script>
    <script src="/js/audio-player.js"></script>
    <script src="/api/public-config.js.php"></script>

    <!-- Intégration Snipcart avec thème D&D -->
    <script src="/js/snipcart-products.js"></script>
    <script src="/js/snipcart-integration.js"></script>

    <!-- Container Snipcart (hidden) -->
    <div id="snipcart"
         data-api-key="<?= htmlspecialchars($snipcartApiKey, ENT_QUOTES, 'UTF-8') ?>"
         data-config-modal-style="side"
         data-config-add-product-behavior="none"
         data-templates-url="/templates/snipcart-templates.php"
         style="display: none;">
    </div>
</body>
</html>



