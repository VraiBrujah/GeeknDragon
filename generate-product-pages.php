<?php
/**
 * Script de génération automatique des pages produits
 * Génère toutes les pages depuis products-complete.json
 */

// Charger les données des produits
$productsData = json_decode(file_get_contents(__DIR__ . '/data/products-complete.json'), true);

if (!$productsData) {
    die("Erreur : Impossible de charger les données des produits\n");
}

// Template de base pour les pages produits
function generateProductPage($product) {
    $template = <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{$product['name']} | Geek&Dragon</title>
    <meta name="description" content="{$product['description']['short']}">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/product.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
</head>
<body>
    <header class="header">
        <nav class="nav-container">
            <div class="logo">
                <a href="index.php">
                    <span class="logo-text">Geek&Dragon</span>
                </a>
            </div>
            <ul class="nav-menu">
                <li><a href="index.php" class="nav-link">Accueil</a></li>
                <li><a href="boutique.php" class="nav-link">Boutique</a></li>
                <li><a href="boutique.php#{$product['category']}" class="nav-link">{$product['category_name']}</a></li>
                <li><a href="index.php#contact" class="nav-link">Contact</a></li>
            </ul>
            <div class="nav-toggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </nav>
    </header>

    <main class="product-main">
        <!-- Breadcrumb -->
        <section class="breadcrumb">
            <div class="container">
                <nav class="breadcrumb-nav">
                    <a href="index.php">Accueil</a>
                    <span>›</span>
                    <a href="boutique.php">Boutique</a>
                    <span>›</span>
                    <a href="boutique.php#{$product['category']}">{$product['category_name']}</a>
                    <span>›</span>
                    <span class="current">{$product['name']}</span>
                </nav>
            </div>
        </section>

        <!-- Product Hero -->
        <section class="product-hero">
            <div class="container">
                <div class="product-hero-content">
                    <div class="product-gallery">
                        <div class="main-image">
                            <img src="{$product['images']['main']}" alt="{$product['name']} - Vue principale" id="mainProductImage">
                            <div class="image-badges">
HTML;

    // Ajouter les badges
    foreach ($product['badges'] as $badge) {
        $badgeText = match($badge) {
            'premium' => 'Premium',
            'starter' => 'Starter',
            'ready-to-play' => 'Prêt à jouer',
            'advanced' => 'Avancé',
            'exploration' => 'Exploration',
            'mystery' => 'Mystère',
            'complete' => 'Complet',
            default => ucfirst($badge)
        };
        $template .= "\n                                <span class=\"badge {$badge}\">{$badgeText}</span>";
    }

    $template .= <<<HTML

                            </div>
                        </div>
                        <div class="thumbnail-gallery">
HTML;

    // Ajouter les thumbnails
    foreach ($product['images']['gallery'] as $index => $image) {
        $activeClass = $index === 0 ? ' active' : '';
        $altText = "Vue " . ($index + 1);
        $template .= "\n                            <img src=\"{$image}\" alt=\"{$altText}\" class=\"thumbnail{$activeClass}\" onclick=\"changeMainImage(this)\">";
    }

    $template .= <<<HTML

                        </div>
                    </div>

                    <div class="product-info">
                        <div class="product-category">
                            <span class="category-tag">{$product['category_name']}</span>
                            <span class="product-id">{$product['product_id']}</span>
                        </div>
                        
                        <h1 class="product-title">{$product['name']}</h1>
                        <p class="product-subtitle">{$product['subtitle']}</p>

                        <div class="product-rating">
                            <div class="stars">★★★★★</div>
                            <span class="rating-text">({$product['rating']['average']}/5 - {$product['rating']['total']} avis)</span>
                        </div>

                        <div class="product-pricing">
                            <div class="price-main">
                                <span class="price">{$product['price']}$ <small>{$product['currency']}</small></span>
                                <span class="price-note">Tout inclus</span>
                            </div>
                            <div class="payment-options">
                                <span>💳 Paiement sécurisé</span>
                                <span>🚚 Livraison gratuite au Canada</span>
                            </div>
                        </div>

                        <div class="product-highlights">
                            <h3>Points Forts</h3>
                            <ul>
HTML;

    // Ajouter les points forts
    foreach ($product['highlights'] as $highlight) {
        $template .= "\n                                <li>{$highlight}</li>";
    }

    $template .= <<<HTML

                            </ul>
                        </div>

                        
HTML;

    // Ajouter la configuration si elle existe
    if (isset($product['configuration'])) {
        $template .= <<<HTML

                        <div class="product-configuration">
                            <h3>{$product['configuration']['label']}</h3>
                            <select id="product-variant" onchange="updatePrice()">
HTML;
        foreach ($product['configuration']['options'] as $option) {
            $template .= "\n                                <option value=\"{$option['value']}\" data-price=\"{$option['price']}\">{$option['label']}</option>";
        }
        $template .= <<<HTML

                            </select>
                        </div>
HTML;
    }

    $template .= <<<HTML


                        <div class="product-actions">
                            <button class="snipcart-add-item btn-primary"
                                data-item-id="{$product['id']}"
                                data-item-price="{$product['price']}"
                                data-item-url="/api/products/{$product['id']}"
                                data-item-name="{$product['name']}"
                                data-item-description="{$product['description']['short']}"
                                data-item-image="{$product['images']['main']}"
                                data-item-currency="{$product['currency']}"
                                data-item-categories="{$product['category']}">
                                Ajouter à l'inventaire
                            </button>
                            <button class="btn-wishlist" onclick="toggleWishlist()" title="Ajouter aux favoris">
                                ❤️
                            </button>
                        </div>

                        <div class="shipping-info">
                            <div class="shipping-item">
                                <strong>🚚 Expédition :</strong> {$product['shipping']['time']}
                            </div>
                            <div class="shipping-item">
                                <strong>📦 Livraison gratuite :</strong> Partout au Canada
                            </div>
                            <div class="shipping-item">
                                <strong>↩️ Retours :</strong> {$product['shipping']['returns']}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Product Details Tabs -->
        <section class="product-details">
            <div class="container">
                <div class="details-tabs">
                    <div class="tabs-nav">
                        <button class="tab-btn active" onclick="switchTab('description')">Description</button>
                        <button class="tab-btn" onclick="switchTab('specifications')">Spécifications</button>
                        <button class="tab-btn" onclick="switchTab('usage')">Guide d'Usage</button>
                        <button class="tab-btn" onclick="switchTab('reviews')">Avis ({$product['rating']['total']})</button>
                    </div>

                    <div class="tab-content active" id="description">
                        {$product['description']['full']}
                    </div>

                    <div class="tab-content" id="specifications">
                        <h3>Spécifications techniques</h3>
                        <ul>
HTML;

    // Ajouter les spécifications
    foreach ($product['specifications'] as $spec) {
        $template .= "\n                            <li><strong>{$spec['label']}</strong>: {$spec['value']}</li>";
    }

    $template .= <<<HTML

                        </ul>
                    </div>

                    <div class="tab-content" id="usage">
                        <h3>Guide d'usage</h3>
                        <ul>
HTML;

    // Ajouter les conseils d'usage
    foreach ($product['usage_tips'] as $tip) {
        $template .= "\n                            <li>{$tip}</li>";
    }

    $template .= <<<HTML

                        </ul>
                    </div>

                    <div class="tab-content" id="reviews">
                        <h3>Avis des aventuriers</h3>
                        
                        <!-- Bouton pour laisser un avis -->
                        <div class="review-cta" style="text-align: center; margin-bottom: 2rem;">
                            <button onclick="document.getElementById('reviewForm').scrollIntoView({behavior: 'smooth'}); document.getElementById('reviewName').focus();" class="btn-submit-review">
                                ✍️ Laisser un avis
                            </button>
                        </div>
                        
                        <!-- Statistiques des avis -->
                        <div class="reviews-summary">
                            <div class="rating-overview">
                                <div class="rating-score">{$product['rating']['average']}.0</div>
                                <div class="rating-bars">
HTML;

    // Générer les barres de notation
    for ($i = 5; $i >= 1; $i--) {
        $count = $product['rating']['distribution'][$i] ?? 0;
        $percentage = $product['rating']['total'] > 0 ? ($count / $product['rating']['total']) * 100 : 0;
        $template .= <<<HTML

                                    <div class="rating-bar" data-rating="{$i}">
                                        <span>{$i}★</span>
                                        <div class="bar"><div class="fill" style="width: {$percentage}%"></div></div>
                                        <span class="count">{$count}</span>
                                    </div>
HTML;
    }

    $template .= <<<HTML

                                </div>
                            </div>
                        </div>

                        <!-- Formulaire d'avis -->
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
                                            <input type="radio" id="star5" name="rating" value="5">
                                            <label for="star5">★</label>
                                            <input type="radio" id="star4" name="rating" value="4">
                                            <label for="star4">★</label>
                                            <input type="radio" id="star3" name="rating" value="3">
                                            <label for="star3">★</label>
                                            <input type="radio" id="star2" name="rating" value="2">
                                            <label for="star2">★</label>
                                            <input type="radio" id="star1" name="rating" value="1">
                                            <label for="star1">★</label>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="reviewComment">Votre avis *</label>
                                    <textarea id="reviewComment" name="comment" required 
                                        placeholder="Partagez votre expérience avec ce produit..."></textarea>
                                </div>
                                
                                <button type="submit" class="btn-submit-review">Soumettre mon avis</button>
                            </form>
                        </div>

                        <!-- Liste des avis -->
                        <div class="reviews-list">
                            <p class="no-reviews">Aucun avis pour le moment. Soyez le premier à laisser votre avis !</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Related Products -->
        <section class="related-products">
            <div class="container">
                <h2>Produits Complémentaires</h2>
                <div class="products-grid">
                    
HTML;

    // Ajouter les produits liés
    if (isset($product['related_products'])) {
        global $productsData;
        foreach ($product['related_products'] as $relatedId) {
            if (isset($productsData[$relatedId])) {
                $related = $productsData[$relatedId];
                $template .= <<<HTML

                    <div class="product-card">
                        <div class="product-image">
                            <img src="{$related['images']['main']}" alt="{$related['name']}">
                        </div>
                        <div class="product-content">
                            <h3>{$related['name']}</h3>
                            <p>{$related['subtitle']}</p>
                            <div class="price">{$related['price']}$ <small>{$related['currency']}</small></div>
                            <a href="produit-{$related['slug']}.php" class="btn-secondary">Découvrir</a>
                        </div>
                    </div>
HTML;
            }
        }
    }

    $template .= <<<HTML

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
                        <li><a href="boutique.php#coins">Pièces Métalliques</a></li>
                        <li><a href="boutique.php#cards">Cartes d'Équipement</a></li>
                        <li><a href="boutique.php#triptych">Triptyques Mystères</a></li>
                        <li><a href="#">Guide d'Achat</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Support</h4>
                    <ul>
                        <li><a href="mailto:support@geekndragon.com">Support Client</a></li>
                        <li><a href="#">Livraison & Retours</a></li>
                        <li><a href="#">Garantie Qualité</a></li>
                        <li><a href="#">FAQ</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 Geek&Dragon. Tous droits réservés.</p>
            </div>
        </div>
    </footer>

    <script src="js/script.js"></script>
    <script src="api/public-config.js.php"></script>
    <script src="js/product.js"></script>
    <script src="js/reviews.js"></script>
    <script src="js/snipcart-products.js"></script>
    <script src="js/snipcart-integration.js"></script>
    <div id="snipcart" data-api-key="YmFhMjM0ZDEtM2VhNy00YTVlLWI0NGYtM2ZiOWI2Y2IzYmU1NjM4ODkxMjUzMDE3NzIzMjc1" data-config-modal-style="side" data-config-add-product-behavior="none" style="display:none;"></div>
</body>
</html>
HTML;

    return $template;
}

// Générer toutes les pages
foreach ($productsData as $productId => $product) {
    $filename = "produit-{$product['slug']}.php";
    $content = generateProductPage($product);
    
    file_put_contents(__DIR__ . '/' . $filename, $content);
    echo "✅ Généré : {$filename}\n";
}

echo "\n🎉 Toutes les pages produits ont été générées avec les bonnes images !\n";
?>