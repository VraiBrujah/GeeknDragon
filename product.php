<?php
declare(strict_types=1);

/**
 * Page produit dynamique.
 *
 * Cette page lit le catalogue JSON et restitue la fiche produit complète
 * avec tous les éléments visuels (badges, points forts, livraisons, onglets).
 */

$id = preg_replace('/[^a-z0-9_-]/i', '', $_GET['id'] ?? '');
$dataPath = __DIR__ . '/data/products.json';

if ($id === '' || !is_file($dataPath)) {
    http_response_code(404);
    echo 'Produit introuvable';
    exit;
}

$rawContent = file_get_contents($dataPath);
$products = $rawContent !== false ? json_decode($rawContent, true) : null;

if (!is_array($products)) {
    http_response_code(500);
    echo 'Catalogue indisponible';
    exit;
}

if (!isset($products[$id])) {
    http_response_code(404);
    echo 'Produit introuvable';
    exit;
}

$product = $products[$id];

/**
 * Récupère la clé publique Snipcart pour la rendre au client.
 */
$globalConfig = require __DIR__ . '/config.php';
$snipcartApiKey = is_string($globalConfig['snipcart_api_key'] ?? null) ? $globalConfig['snipcart_api_key'] : '';

if (!function_exists('gd_clean_text')) {
    /**
     * Nettoie un texte riche en conservant uniquement une version plane optionnellement tronquée.
     */
    function gd_clean_text(string $value, ?int $limit = null): string
    {
        $text = trim(preg_replace('/\s+/', ' ', strip_tags($value)) ?? '');
        if ($limit !== null && mb_strlen($text) > $limit) {
            return rtrim(mb_substr($text, 0, $limit - 1)) . '…';
        }
        return $text;
    }
}

if (!function_exists('gd_format_price')) {
    /**
     * Formate un prix en supprimant les décimales inutiles.
     */
    function gd_format_price(float $value): string
    {
        $formatted = number_format($value, 2, '.', '');
        return str_ends_with($formatted, '.00') ? substr($formatted, 0, -3) : $formatted;
    }
}

$gallery = $product['images'] ?? [];
if (!empty($product['main_image'])) {
    array_unshift($gallery, $product['main_image']);
}
if (empty($gallery)) {
    $gallery[] = '/images/brand-geekndragon-main.webp';
}
$gallery = array_values(array_unique($gallery));
$mainImage = $product['main_image'] ?? $gallery[0];

$metaDescription = gd_clean_text($product['meta_description'] ?? ($product['summary'] ?? ($product['description'] ?? '')), 160);
$pageTitle = ($product['name'] ?? $id) . ' | Geek&Dragon';
$categoryLabel = $product['category_label'] ?? 'Produit';
$categoryLink = $product['category_anchor'] ?? 'boutique.php';
$categoryPath = '/' . ltrim($categoryLink, '/');
$subtitle = $product['subtitle'] ?? '';
$productCode = $product['product_code'] ?? ('#' . strtoupper($id));
$currency = $product['currency'] ?? 'CAD';
$price = (float)($product['price'] ?? 0.0);
$priceNote = $product['price_note'] ?? '+ taxes';
$paymentOptions = $product['payment_options'] ?? ['💳 Paiement sécurisé', '🚚 Livraison gratuite dès 250$ CAD'];
$badges = $product['badges'] ?? [];
$highlights = $product['highlights'] ?? [];
$specifications = $product['specifications'] ?? [];
$usageTips = $product['usage_tips'] ?? [];
$configuration = $product['configuration'] ?? null;
$categoryKey = $product['category'] ?? '';

$rating = $product['rating'] ?? [];
$ratingAverage = isset($rating['average']) ? (float)$rating['average'] : 0.0;
$ratingTotal = isset($rating['total']) ? (int)$rating['total'] : 0;
$ratingDistribution = array_replace(
    ['5' => 0, '4' => 0, '3' => 0, '2' => 0, '1' => 0],
    is_array($rating['distribution'] ?? null) ? $rating['distribution'] : []
);

$shipping = $product['shipping'] ?? [];
$shippingItems = $shipping['items'] ?? [];

$tabs = $product['tabs'] ?? [
    ['id' => 'description', 'title' => 'Description', 'type' => 'html', 'content_field' => 'description'],
    ['id' => 'specifications', 'title' => 'Spécifications', 'type' => 'specifications', 'heading' => 'Spécifications techniques'],
    ['id' => 'usage', 'title' => "Guide d'Usage", 'type' => 'list', 'heading' => "Guide d'usage", 'items_field' => 'usage_tips'],
    ['id' => 'reviews', 'title' => 'Avis', 'type' => 'reviews', 'heading' => 'Avis des aventuriers'],
];

$relatedIds = array_values(array_filter(
    array_unique($product['related_products'] ?? []),
    static fn(string $relatedId): bool => $relatedId !== $id && isset($products[$relatedId])
));

$buttonDescription = gd_clean_text($product['summary'] ?? ($product['description'] ?? ($product['name'] ?? '')), 180);
?>
<?php
require __DIR__ . '/bootstrap.php';

$translator = require __DIR__ . '/i18n.php';
$lang = $translator->getCurrentLanguage();
$categoryUrl = langUrl($categoryPath);

$title = $pageTitle;
$metaDescription = $metaDescription;
$ogImage = $mainImage;
$active = 'boutique';
$styleVersion = gdLocalAssetVersion('css/style.css');
$productVersion = gdLocalAssetVersion('css/product.css');
$extraHead = <<<HTML
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css?v={$styleVersion}">
  <link rel="stylesheet" href="/css/product.css?v={$productVersion}">
HTML;
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang, ENT_QUOTES, 'UTF-8'); ?>">
<?php include __DIR__ . '/head-common.php'; ?>
<body>
<?php include __DIR__ . '/header.php'; ?>

    <main id="main" class="product-main pt-32">
        <section class="breadcrumb">
            <div class="container">
                <nav class="breadcrumb-nav">
                    <a href="<?= htmlspecialchars(langUrl('/index.php'), ENT_QUOTES, 'UTF-8'); ?>">Accueil</a>
                    <span>›</span>
                    <a href="<?= htmlspecialchars(langUrl('/boutique.php'), ENT_QUOTES, 'UTF-8'); ?>">Boutique</a>
                    <span>›</span>
                    <a href="<?= htmlspecialchars($categoryUrl, ENT_QUOTES, 'UTF-8'); ?>"><?= htmlspecialchars($categoryLabel, ENT_QUOTES, 'UTF-8') ?></a>
                    <span>›</span>
                    <span class="current"><?= htmlspecialchars($product['name'] ?? $id, ENT_QUOTES, 'UTF-8') ?></span>
                </nav>
            </div>
        </section>

        <section class="product-hero">
            <div class="container">
                <div class="product-hero-content">
                    <div class="product-gallery">
                        <div class="main-image">
                            <img src="<?= htmlspecialchars($mainImage, ENT_QUOTES, 'UTF-8') ?>" alt="<?= htmlspecialchars($product['name'] ?? $id, ENT_QUOTES, 'UTF-8') ?>" id="mainProductImage">
                            <?php if (!empty($badges)): ?>
                            <div class="image-badges">
                                <?php foreach ($badges as $badge): ?>
                                    <?php if (!empty($badge['text'])): ?>
                                    <span class="badge <?= htmlspecialchars((string)($badge['type'] ?? ''), ENT_QUOTES, 'UTF-8') ?>"><?= htmlspecialchars((string)$badge['text'], ENT_QUOTES, 'UTF-8') ?></span>
                                    <?php endif; ?>
                                <?php endforeach; ?>
                            </div>
                            <?php endif; ?>
                        </div>
                        <?php if (count($gallery) > 1): ?>
                        <div class="thumbnail-gallery">
                            <?php foreach ($gallery as $index => $image): ?>
                                <img
                                    src="<?= htmlspecialchars($image, ENT_QUOTES, 'UTF-8') ?>"
                                    alt="Vue <?= $index + 1 ?>"
                                    class="thumbnail<?= $index === 0 ? ' active' : '' ?>"
                                    data-gallery-index="<?= $index ?>"
                                    role="button"
                                    tabindex="0"
                                >
                            <?php endforeach; ?>
                        </div>
                        <?php endif; ?>
                    </div>

                    <div class="product-info">
                        <div class="product-category">
                            <span class="category-tag"><?= htmlspecialchars($categoryLabel, ENT_QUOTES, 'UTF-8') ?></span>
                            <span class="product-id"><?= htmlspecialchars($productCode, ENT_QUOTES, 'UTF-8') ?></span>
                        </div>

                        <h1 class="product-title"><?= htmlspecialchars($product['name'] ?? $id, ENT_QUOTES, 'UTF-8') ?></h1>
                        <?php if ($subtitle !== ''): ?>
                        <p class="product-subtitle"><?= htmlspecialchars($subtitle, ENT_QUOTES, 'UTF-8') ?></p>
                        <?php endif; ?>

                        <div class="product-rating">
                            <div class="stars">★★★★★</div>
                            <span class="rating-text">(<?= htmlspecialchars(number_format($ratingAverage, 1), ENT_QUOTES, 'UTF-8') ?> /5 - <?= htmlspecialchars((string)$ratingTotal, ENT_QUOTES, 'UTF-8') ?> avis)</span>
                        </div>

                        <div class="product-pricing">
                            <div class="price-main">
                                <span class="price"><?= htmlspecialchars(gd_format_price($price), ENT_QUOTES, 'UTF-8') ?>$ <small><?= htmlspecialchars($currency, ENT_QUOTES, 'UTF-8') ?></small></span>
                                <span class="price-note"><?= htmlspecialchars($priceNote, ENT_QUOTES, 'UTF-8') ?></span>
                            </div>
                            <?php if (!empty($paymentOptions)): ?>
                            <div class="payment-options">
                                <?php foreach ($paymentOptions as $option): ?>
                                    <span><?= htmlspecialchars((string)$option, ENT_QUOTES, 'UTF-8') ?></span>
                                <?php endforeach; ?>
                            </div>
                            <?php endif; ?>
                        </div>

                        <?php if (!empty($highlights)): ?>
                        <div class="product-highlights">
                            <h3>Points Forts</h3>
                            <ul>
                                <?php foreach ($highlights as $highlight): ?>
                                    <li><?= htmlspecialchars((string)$highlight, ENT_QUOTES, 'UTF-8') ?></li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                        <?php endif; ?>

                        <?php if (is_array($configuration) && ($configuration['type'] ?? '') === 'dropdown' && !empty($configuration['options'])): ?>
                        <div class="product-configuration">
                            <h3><?= htmlspecialchars($configuration['label'] ?? 'Configuration', ENT_QUOTES, 'UTF-8') ?></h3>
                            <div class="custom-dropdown" id="custom-dropdown" data-dropdown-root>
                                <?php $defaultOption = $configuration['options'][0]; ?>
                                <div class="dropdown-selected" data-dropdown-toggle role="button" tabindex="0" aria-haspopup="listbox" aria-expanded="false">
                                    <span class="selected-text" data-selected-text><?= htmlspecialchars(($defaultOption['label'] ?? $defaultOption['value'] ?? ''), ENT_QUOTES, 'UTF-8') ?> - <?= htmlspecialchars(gd_format_price((float)($defaultOption['price'] ?? $price)), ENT_QUOTES, 'UTF-8') ?>$ <?= htmlspecialchars($currency, ENT_QUOTES, 'UTF-8') ?></span>
                                    <span class="dropdown-arrow" aria-hidden="true">▼</span>
                                </div>
                                <div class="dropdown-options" id="dropdown-options" data-dropdown-options role="listbox">
                                    <?php foreach ($configuration['options'] as $index => $option): ?>
                                        <?php $isActive = $index === 0 ? ' active' : ''; ?>
                                        <div
                                            class="dropdown-option<?= $isActive ?>"
                                            data-dropdown-option
                                            role="option"
                                            tabindex="<?= $isActive !== '' ? '0' : '-1' ?>"
                                            aria-selected="<?= $isActive !== '' ? 'true' : 'false' ?>"
                                            data-value="<?= htmlspecialchars((string)($option['value'] ?? ''), ENT_QUOTES, 'UTF-8') ?>"
                                            data-price="<?= htmlspecialchars((string)($option['price'] ?? $price), ENT_QUOTES, 'UTF-8') ?>"
                                            data-description="<?= htmlspecialchars((string)($option['description'] ?? ''), ENT_QUOTES, 'UTF-8') ?>"
                                        >
                                            <span class="option-title"><?= htmlspecialchars((string)($option['label'] ?? $option['value'] ?? ''), ENT_QUOTES, 'UTF-8') ?></span>
                                            <span class="option-price"><?= htmlspecialchars(gd_format_price((float)($option['price'] ?? $price)), ENT_QUOTES, 'UTF-8') ?>$ <?= htmlspecialchars($currency, ENT_QUOTES, 'UTF-8') ?></span>
                                        </div>
                                    <?php endforeach; ?>
                                </div>
                            </div>
                            <div class="config-description" id="config-description">
                                <?= htmlspecialchars((string)($defaultOption['description'] ?? ''), ENT_QUOTES, 'UTF-8') ?>
                            </div>
                        </div>
                        <?php endif; ?>

                        <div class="product-actions">
                            <button class="snipcart-add-item btn-primary"
                                data-item-id="<?= htmlspecialchars($id, ENT_QUOTES, 'UTF-8') ?>"
                                data-item-price="<?= htmlspecialchars(number_format($price, 2, '.', ''), ENT_QUOTES, 'UTF-8') ?>"
                                data-item-url="/api/products/<?= htmlspecialchars($id, ENT_QUOTES, 'UTF-8') ?>"
                                data-item-name="<?= htmlspecialchars($product['name'] ?? $id, ENT_QUOTES, 'UTF-8') ?>"
                                data-item-description="<?= htmlspecialchars($buttonDescription, ENT_QUOTES, 'UTF-8') ?>"
                                data-item-image="<?= htmlspecialchars($mainImage, ENT_QUOTES, 'UTF-8') ?>"
                                data-item-currency="<?= htmlspecialchars($currency, ENT_QUOTES, 'UTF-8') ?>"
                                data-item-categories="<?= htmlspecialchars($categoryKey, ENT_QUOTES, 'UTF-8') ?>">
                                Ajouter à l'inventaire
                            </button>
                            <button class="btn-wishlist" type="button" data-product-id="<?= htmlspecialchars($id, ENT_QUOTES, 'UTF-8') ?>" title="Ajouter aux favoris">
                                <span class="wishlist-icon">🤍</span>
                                <span class="wishlist-text">Favoris</span>
                            </button>
                        </div>

                        <?php if (!empty($shippingItems)): ?>
                        <div class="shipping-info">
                            <?php foreach ($shippingItems as $item): ?>
                            <div class="shipping-item">
                                <strong><?= htmlspecialchars((string)($item['icon'] ?? ''), ENT_QUOTES, 'UTF-8') ?> <?= htmlspecialchars((string)($item['label'] ?? ''), ENT_QUOTES, 'UTF-8') ?></strong>
                                <?php if (!empty($item['url'])): ?>
                                    <a href="<?= htmlspecialchars((string)$item['url'], ENT_QUOTES, 'UTF-8') ?>" style="color: var(--secondary-color);"<?= !empty($item['details']) ? ' title="' . htmlspecialchars((string)$item['details'], ENT_QUOTES, 'UTF-8') . '"' : '' ?>>
                                        <?= htmlspecialchars((string)$item['text'], ENT_QUOTES, 'UTF-8') ?>
                                    </a>
                                <?php else: ?>
                                    <?= htmlspecialchars((string)$item['text'], ENT_QUOTES, 'UTF-8') ?>
                                <?php endif; ?>
                            </div>
                            <?php endforeach; ?>
                        </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </section>

        <section class="product-details">
            <div class="container">
                <div class="details-tabs">
                    <div class="tabs-nav">
                        <?php foreach ($tabs as $index => $tab): ?>
                            <?php
                                $tabId = preg_replace('/[^a-z0-9_-]/i', '-', (string)($tab['id'] ?? ('tab-' . $index)));
                                $tabTitle = (string)($tab['title'] ?? ('Onglet ' . ($index + 1)));
                                if (($tab['type'] ?? '') === 'reviews') {
                                    $tabTitle .= ' (' . $ratingTotal . ')';
                                }
                            ?>
                            <button class="tab-btn<?= $index === 0 ? ' active' : '' ?>" type="button" data-tab-target="<?= htmlspecialchars($tabId, ENT_QUOTES, 'UTF-8') ?>">
                                <?= htmlspecialchars($tabTitle, ENT_QUOTES, 'UTF-8') ?>
                            </button>
                        <?php endforeach; ?>
                    </div>

                    <?php foreach ($tabs as $index => $tab): ?>
                        <?php
                            $tabId = preg_replace('/[^a-z0-9_-]/i', '-', (string)($tab['id'] ?? ('tab-' . $index)));
                            $tabType = (string)($tab['type'] ?? 'html');
                            $tabHeading = (string)($tab['heading'] ?? '');
                        ?>
                        <div class="tab-content<?= $index === 0 ? ' active' : '' ?>" id="<?= htmlspecialchars($tabId, ENT_QUOTES, 'UTF-8') ?>">
                            <?php if ($tabType === 'html'): ?>
                                <?php
                                    $field = (string)($tab['content_field'] ?? 'description');
                                    $content = $tab['content'] ?? ($product[$field] ?? '');
                                    echo $content;
                                ?>
                            <?php elseif ($tabType === 'specifications'): ?>
                                <?php if ($tabHeading !== ''): ?>
                                    <h3><?= htmlspecialchars($tabHeading, ENT_QUOTES, 'UTF-8') ?></h3>
                                <?php endif; ?>
                                <?php if (!empty($specifications)): ?>
                                    <ul>
                                        <?php foreach ($specifications as $spec): ?>
                                            <li><strong><?= htmlspecialchars((string)($spec['label'] ?? ''), ENT_QUOTES, 'UTF-8') ?></strong>: <?= htmlspecialchars((string)($spec['value'] ?? ''), ENT_QUOTES, 'UTF-8') ?></li>
                                        <?php endforeach; ?>
                                    </ul>
                                <?php else: ?>
                                    <p>Aucune spécification supplémentaire.</p>
                                <?php endif; ?>
                            <?php elseif ($tabType === 'list'): ?>
                                <?php if ($tabHeading !== ''): ?>
                                    <h3><?= htmlspecialchars($tabHeading, ENT_QUOTES, 'UTF-8') ?></h3>
                                <?php endif; ?>
                                <?php
                                    $itemsField = (string)($tab['items_field'] ?? '');
                                    $items = $tab['items'] ?? ($itemsField !== '' ? ($product[$itemsField] ?? []) : []);
                                ?>
                                <?php if (!empty($items)): ?>
                                    <ul>
                                        <?php foreach ($items as $item): ?>
                                            <li><?= htmlspecialchars((string)$item, ENT_QUOTES, 'UTF-8') ?></li>
                                        <?php endforeach; ?>
                                    </ul>
                                <?php else: ?>
                                    <p>Aucune information supplémentaire.</p>
                                <?php endif; ?>
                            <?php elseif ($tabType === 'reviews'): ?>
                                <?php if ($tabHeading !== ''): ?>
                                    <h3><?= htmlspecialchars($tabHeading, ENT_QUOTES, 'UTF-8') ?></h3>
                                <?php endif; ?>
                                <div class="review-cta" style="text-align: center; margin-bottom: 2rem;">
                                    <button class="btn-submit-review" type="button" data-scroll-target="#reviewForm" data-focus-target="#reviewName">
                                        ✍️ Laisser un avis
                                    </button>
                                </div>
                                <div class="reviews-summary">
                                    <div class="rating-overview">
                                        <div class="rating-score"><?= htmlspecialchars(number_format($ratingAverage, 1), ENT_QUOTES, 'UTF-8') ?></div>
                                        <div class="rating-bars">
                                            <?php foreach ($ratingDistribution as $score => $count): ?>
                                                <?php
                                                    $percentage = $ratingTotal > 0 ? ($count / $ratingTotal) * 100 : 0;
                                                    $scoreLabel = (int)$score;
                                                ?>
                                                <div class="rating-bar" data-rating="<?= $scoreLabel ?>">
                                                    <span><?= $scoreLabel ?>★</span>
                                                    <div class="bar"><div class="fill" style="width: <?= number_format($percentage, 2, '.', '') ?>%"></div></div>
                                                    <span class="count"><?= (int)$count ?></span>
                                                </div>
                                            <?php endforeach; ?>
                                        </div>
                                    </div>
                                </div>
                                <div class="review-form">
                                    <h4>Donnez votre avis</h4>
                                    <form id="reviewForm">
                                        <div class="form-group">
                                            <label for="reviewName">Votre nom *</label>
                                            <input type="text" id="reviewName" name="name" required>
                                        </div>
                                        <div class="form-group">
                                            <label for="reviewEmail">Votre email * (ne sera pas affiché)</label>
                                            <input type="email" id="reviewEmail" name="email" required>
                                        </div>
                                        <div class="form-group">
                                            <label>Votre note *</label>
                                            <div class="rating-input">
                                                <div class="star-rating">
                                                    <?php for ($star = 5; $star >= 1; $star--): ?>
                                                        <input type="radio" id="star<?= $star ?>" name="rating" value="<?= $star ?>">
                                                        <label for="star<?= $star ?>">★</label>
                                                    <?php endfor; ?>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label for="reviewComment">Votre avis *</label>
                                            <textarea id="reviewComment" name="comment" required placeholder="Partagez votre expérience avec ce produit..."></textarea>
                                        </div>
                                        <button type="submit" class="btn-submit-review">Soumettre mon avis</button>
                                    </form>
                                </div>
                                <div class="reviews-list">
                                    <p class="no-reviews">Aucun avis pour le moment. Soyez le premier à laisser votre avis !</p>
                                </div>
                            <?php endif; ?>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </section>

        <?php if (!empty($relatedIds)): ?>
        <section class="related-products">
            <div class="container">
                <h2>Produits Complémentaires</h2>
                <div class="products-grid">
                    <?php foreach ($relatedIds as $relatedId): ?>
                        <?php $related = $products[$relatedId]; ?>
                        <?php $relatedImage = $related['main_image'] ?? ($related['images'][0] ?? '/images/brand-geekndragon-main.webp'); ?>
                        <?php $relatedPrice = (float)($related['price'] ?? 0); ?>
                        <div class="product-card">
                            <div class="product-image">
                                <img src="<?= htmlspecialchars($relatedImage, ENT_QUOTES, 'UTF-8') ?>" alt="<?= htmlspecialchars($related['name'] ?? $relatedId, ENT_QUOTES, 'UTF-8') ?>">
                            </div>
                            <div class="product-content">
                                <h3><?= htmlspecialchars($related['name'] ?? $relatedId, ENT_QUOTES, 'UTF-8') ?></h3>
                                <?php if (!empty($related['subtitle'])): ?>
                                    <p><?= htmlspecialchars((string)$related['subtitle'], ENT_QUOTES, 'UTF-8') ?></p>
                                <?php endif; ?>
                                <div class="price"><?= htmlspecialchars(gd_format_price($relatedPrice), ENT_QUOTES, 'UTF-8') ?>$ <small><?= htmlspecialchars($related['currency'] ?? $currency, ENT_QUOTES, 'UTF-8') ?></small></div>
                                <a href="<?= htmlspecialchars(langUrl('/product.php?id=' . urlencode($relatedId)), ENT_QUOTES, 'UTF-8'); ?>" class="btn-secondary">Découvrir</a>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </section>
        <?php endif; ?>
    </main>

<?php
$footerSections = [
    [
        'title' => 'Geek&Dragon',
        'description' => 'Votre spécialiste en accessoires immersifs pour jeux de rôle depuis 2024.',
    ],
    [
        'title' => 'Boutique',
        'links' => [
            ['label' => 'Pièces Métalliques', 'href' => langUrl('/boutique.php#coins')],
            ['label' => "Cartes d'Équipement", 'href' => langUrl('/boutique.php#cards')],
            ['label' => 'Triptyques Mystères', 'href' => langUrl('/boutique.php#triptych')],
            ['label' => "Guide d'Achat", 'href' => '#'],
        ],
    ],
    [
        'title' => 'Support',
        'links' => [
            ['label' => 'Support Client', 'href' => 'mailto:support@geekndragon.com'],
            ['label' => 'Livraison & Retours', 'href' => langUrl('/retours.php')],
            ['label' => 'Garantie Qualité', 'href' => '#'],
            ['label' => 'FAQ', 'href' => '#'],
        ],
    ],
];
include __DIR__ . '/footer.php';
?>

    <script src="/js/app.js"></script>
    <script src="/js/script.js"></script>
    <script src="/api/public-config.js.php"></script>
    <script src="/js/product.js"></script>
    <script src="/js/reviews.js"></script>
    <script src="/js/wishlist.js"></script>
</body>
</html>
