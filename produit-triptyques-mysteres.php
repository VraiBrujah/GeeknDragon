<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Triptyques Mystères | Geek&Dragon</title>
    <meta name="description" content="3 triptyques tirés au sort + équipement + pièces de départ. Votre aventurier est immédiatement opérationnel !">
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
                <li><a href="boutique.php#triptych" class="nav-link">📋 Triptyques Mystères</a></li>
                <li><a href="index.php#contact" class="nav-link">Contact</a></li>
                <li><a href="compte.php" class="nav-link account-link" title="Mon compte">👤</a></li>
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
                    <a href="boutique.php#triptych">📋 Triptyques Mystères</a>
                    <span>›</span>
                    <span class="current">Triptyques Mystères</span>
                </nav>
            </div>
        </section>

        <!-- Product Hero -->
        <section class="product-hero">
            <div class="container">
                <div class="product-hero-content">
                    <div class="product-gallery">
                        <div class="main-image">
                            <img src="/images/optimized-modern/webp/triptyque-fiche.webp" alt="Triptyques Mystères - Vue principale" id="mainProductImage">
                            <div class="image-badges">
                                <span class="badge mystery">Mystère</span>
                                <span class="badge complete">Complet</span>
                            </div>
                        </div>
                        <div class="thumbnail-gallery">
                            <img src="/images/optimized-modern/webp/triptyque-fiche.webp" alt="Vue 1" class="thumbnail active" onclick="changeMainImage(this)">
                            <img src="/images/optimized-modern/webp/drakaeide-airain-recto.webp" alt="Vue 2" class="thumbnail" onclick="changeMainImage(this)">
                            <img src="/images/optimized-modern/webp/Barbare-Voie-du-Berserker_recto.webp" alt="Vue 3" class="thumbnail" onclick="changeMainImage(this)">
                            <img src="/images/optimized-modern/webp/character-acolyte-fr-front.webp" alt="Vue 4" class="thumbnail" onclick="changeMainImage(this)">
                        </div>
                    </div>

                    <div class="product-info">
                        <div class="product-category">
                            <span class="category-tag">📋 Triptyques Mystères</span>
                            <span class="product-id">#GD-TM-001</span>
                        </div>
                        
                        <h1 class="product-title">Triptyques Mystères</h1>
                        <p class="product-subtitle">Héros prêt à jouer</p>

                        <div class="product-rating">
                            <div class="stars">★★★★★</div>
                            <span class="rating-text">(0/5 - 0 avis)</span>
                        </div>

                        <div class="product-pricing">
                            <div class="price-main">
                                <span class="price">59.99$ <small>CAD</small></span>
                                <span class="price-note">+ taxes</span>
                            </div>
                            <div class="payment-options">
                                <span>💳 Paiement sécurisé</span>
                                <span>🚚 Livraison gratuite dès 250$ CAD</span>
                            </div>
                        </div>

                        <div class="product-highlights">
                            <h3>Points Forts</h3>
                            <ul>
                                <li>🎲 3 triptyques tirés au sort (Classe, Espèce, Historique)</li>
                                <li>🛡️ Équipement correspondant au paquetage</li>
                                <li>💰 Pièces de départ incluses</li>
                                <li>🚀 Prêt à jouer immédiatement</li>
                                <li>🎯 Parfait pour one-shots et découverte</li>
                            </ul>
                        </div>

                        
                        <div class="product-configuration">
                            <h3>Choisissez votre langue :</h3>
                            <div class="custom-dropdown" id="custom-dropdown">
                                <div class="dropdown-selected" onclick="toggleDropdown()">
                                    <span class="selected-text">fr - 59.99$ CAD</span>
                                    <span class="dropdown-arrow">▼</span>
                                </div>
                                <div class="dropdown-options" id="dropdown-options">
                                    <div class="dropdown-option active" data-value="fr" data-price="59.99" data-description="Version française complète avec triptyques." onclick="selectOption(this)">
                                        <span class="option-title">fr</span>
                                        <span class="option-price">59.99$ CAD</span>
                                    </div>
                                    <div class="dropdown-option" data-value="en" data-price="59.99" data-description="Complete English version with triptychs." onclick="selectOption(this)">
                                        <span class="option-title">en</span>
                                        <span class="option-price">59.99$ CAD</span>
                                    </div>
                                </div>
                            </div>
                            <div class="config-description" id="config-description">
                                Version française complète avec triptyques.
                            </div>
                        </div>

                        <div class="product-actions">
                            <button class="snipcart-add-item btn-primary"
                                data-item-id="triptyque-aleatoire"
                                data-item-price="59.99"
                                data-item-url="/api/products/triptyque-aleatoire"
                                data-item-name="Triptyques Mystères"
                                data-item-description="3 triptyques tirés au sort + équipement + pièces de départ. Votre aventurier est immédiatement opérationnel !"
                                data-item-image="/images/optimized-modern/webp/triptyque-fiche.webp"
                                data-item-currency="CAD"
                                data-item-categories="triptychs">
                                Ajouter à l'inventaire
                            </button>
                            <button class="btn-wishlist" onclick="handleWishlist('triptyque-aleatoire')" title="Ajouter aux favoris">
                                <span class="wishlist-icon">🤍</span>
                                <span class="wishlist-text">Favoris</span>
                            </button>
                        </div>

                        <div class="shipping-info">
                            <div class="shipping-item">
                                <strong>🚚 Expédition :</strong> 2-3 jours ouvrables
                            </div>
                            <div class="shipping-item">
                                <strong>📦 Livraison gratuite :</strong> Dès 250$ CAD au Canada
                            </div>
                            <div class="shipping-item">
                                <strong>↩️ Retours :</strong> <a href="retours.php" style="color: var(--secondary-color);">Politique de retours</a>
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
                        <button class="tab-btn" onclick="switchTab('reviews')">Avis (0)</button>
                    </div>

                    <div class="tab-content active" id="description">
                        <h3>Trois triptyques, un héros clé en main</h3><p>Tire au sort <strong>1 Classe</strong>, <strong>1 Espèce</strong> et <strong>1 Historique</strong> pour forger une origine unique, puis joue immédiatement avec :</p><ul><li><strong>Cartes d'équipement assorties</strong> correspondant au paquetage.</li><li><strong>Pièces de départ</strong>.</li><li><strong>Compatibilité 5e 2024</strong></li></ul><p>Un bundle idéal pour des <em>one-shots</em>, des tables débutantes ou pour surprendre des joueurs vétérans.</p>
                    </div>

                    <div class="tab-content" id="specifications">
                        <h3>Spécifications techniques</h3>
                        <ul>
                            <li><strong>Contenu</strong>: 3 triptyques + équipement + pièces</li>
                            <li><strong>Tirage</strong>: Aléatoire garanti</li>
                            <li><strong>Compatibilité</strong>: D&D 5e 2024</li>
                            <li><strong>Usage</strong>: One-shots, découverte, surprise</li>
                        </ul>
                    </div>

                    <div class="tab-content" id="usage">
                        <h3>Guide d'usage</h3>
                        <ul>
                            <li>Parfait pour initier de nouveaux joueurs</li>
                            <li>Idéal pour des parties improvisées</li>
                            <li>Excellent pour découvrir de nouvelles combinaisons</li>
                            <li>Simplifie la création de personnage</li>
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
                                <div class="rating-score">0.0</div>
                                <div class="rating-bars">
                                    <div class="rating-bar" data-rating="5">
                                        <span>5★</span>
                                        <div class="bar"><div class="fill" style="width: 0%"></div></div>
                                        <span class="count">0</span>
                                    </div>
                                    <div class="rating-bar" data-rating="4">
                                        <span>4★</span>
                                        <div class="bar"><div class="fill" style="width: 0%"></div></div>
                                        <span class="count">0</span>
                                    </div>
                                    <div class="rating-bar" data-rating="3">
                                        <span>3★</span>
                                        <div class="bar"><div class="fill" style="width: 0%"></div></div>
                                        <span class="count">0</span>
                                    </div>
                                    <div class="rating-bar" data-rating="2">
                                        <span>2★</span>
                                        <div class="bar"><div class="fill" style="width: 0%"></div></div>
                                        <span class="count">0</span>
                                    </div>
                                    <div class="rating-bar" data-rating="1">
                                        <span>1★</span>
                                        <div class="bar"><div class="fill" style="width: 0%"></div></div>
                                        <span class="count">0</span>
                                    </div>
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
                    
                    <div class="product-card">
                        <div class="product-image">
                            <img src="/images/optimized-modern/webp/arme-recto.webp" alt="Arsenal de l'Aventurier">
                        </div>
                        <div class="product-content">
                            <h3>Arsenal de l'Aventurier</h3>
                            <p>182 cartes d'équipement illustrées</p>
                            <div class="price">49.99$ <small>CAD</small></div>
                            <a href="produit-arsenal-aventurier.php" class="btn-secondary">Découvrir</a>
                        </div>
                    </div>
                    <div class="product-card">
                        <div class="product-image">
                            <img src="/images/optimized-modern/webp/Vagabon.webp" alt="L'Offrande du Voyageur">
                        </div>
                        <div class="product-content">
                            <h3>L'Offrande du Voyageur</h3>
                            <p>Starter pack immersif pour débuter votre aventure tactile</p>
                            <div class="price">60$ <small>CAD</small></div>
                            <a href="produit-offrande-voyageur.php" class="btn-secondary">Découvrir</a>
                        </div>
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
    <script src="js/wishlist.js"></script>
    <script src="js/snipcart-products.js"></script>
    <script src="js/snipcart-integration.js"></script>
    <div id="snipcart" data-api-key="YmFhMjM0ZDEtM2VhNy00YTVlLWI0NGYtM2ZiOWI2Y2IzYmU1NjM4ODkxMjUzMDE3NzIzMjc1" data-config-modal-style="side" data-config-add-product-behavior="none" style="display:none;"></div>
</body>
</html>