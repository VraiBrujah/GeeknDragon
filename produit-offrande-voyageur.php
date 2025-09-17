<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>L'Offrande du Voyageur - Starter Pack Pièces Métalliques | Geek&Dragon</title>
    <meta name="description" content="Découvrez L'Offrande du Voyageur : starter pack de 10 pièces métalliques authentiques (cuivre, argent, électrum, or, platine) avec 5 options de multiplicateurs. Point d'entrée idéal pour l'immersion D&D.">
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
                <li><a href="boutique.php#coins" class="nav-link">Pièces</a></li>
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
                    <a href="boutique.php#coins">Pièces Métalliques</a>
                    <span>›</span>
                    <span class="current">L'Offrande du Voyageur</span>
                </nav>
            </div>
        </section>

        <!-- Product Hero -->
        <section class="product-hero">
            <div class="container">
                <div class="product-hero-content">
                    <div class="product-gallery">
                        <div class="main-image">
                            <img src="images/optimized-modern/webp/Vagabon.webp" alt="L'Offrande du Voyageur - Vue principale" id="mainProductImage">
                            <div class="image-badges">
                                <span class="badge starter">Starter Pack</span>
                                <span class="badge quality">Premium</span>
                            </div>
                        </div>
                        <div class="thumbnail-gallery">
                            <img src="images/optimized-modern/webp/Vagabon.webp" alt="Vue principale" class="thumbnail active" onclick="changeMainImage(this)">
                            <img src="images/optimized-modern/webp/VagabonPlast.webp" alt="Détail des pièces" class="thumbnail" onclick="changeMainImage(this)">
                            <img src="images/optimized-modern/webp/coin-copper-1.webp" alt="Matériaux nobles" class="thumbnail" onclick="changeMainImage(this)">
                            <img src="images/optimized-modern/webp/coin-silver-1.webp" alt="Échelle de référence" class="thumbnail" onclick="changeMainImage(this)">
                        </div>
                    </div>

                    <div class="product-info">
                        <div class="product-category">
                            <span class="category-tag">💰 Pièces Métalliques</span>
                            <span class="product-id">#GD-OV-001</span>
                        </div>
                        
                        <h1 class="product-title">L'Offrande du Voyageur</h1>
                        <p class="product-subtitle">Starter pack immersif pour débuter votre aventure tactile</p>

                        <div class="product-rating">
                            <div class="stars">★★★★★</div>
                            <span class="rating-text">(4.9/5 - 127 avis)</span>
                        </div>

                        <div class="product-pricing">
                            <div class="price-main">
                                <span class="price">60$ <small>CAD</small></span>
                                <span class="price-note">Prix de base - Options incluses</span>
                            </div>
                            <div class="payment-options">
                                <span>💳 Paiement sécurisé</span>
                                <span>🚚 Livraison gratuite au Canada</span>
                            </div>
                        </div>

                        <div class="product-highlights">
                            <h3>Points Forts</h3>
                            <ul>
                                <li>✨ 10 pièces métalliques authentiques</li>
                                <li>🏆 5 métaux nobles (cuivre, argent, électrum, or, platine)</li>
                                <li>⚖️ 5 multiplicateurs au choix (x1, x10, x100, x1000, x10000)</li>
                                <li>🎯 Point d'entrée idéal pour l'immersion D&D</li>
                                <li>🎁 Finitions variables selon le multiplicateur</li>
                            </ul>
                        </div>

                        <!-- Configuration du Produit -->
                        <div class="product-configuration">
                            <h3>Personnalisez votre Offrande</h3>
                            
                            <div class="config-group">
                                <label for="multiplicateur">Choisissez votre multiplicateur :</label>
                                <select id="multiplicateur" class="config-select" onchange="updateProductConfig()">
                                    <option value="x1" data-price="60">x1 - Finition brillante, sans gravure (60$ CAD)</option>
                                    <option value="x10" data-price="60">x10 - Gravure nette, finition mate (60$ CAD)</option>
                                    <option value="x100" data-price="60">x100 - Gravure nette, finition mate (60$ CAD)</option>
                                    <option value="x1000" data-price="60">x1000 - Gravure nette, finition mate (60$ CAD)</option>
                                    <option value="x10000" data-price="60">x10000 - Gravure nette, finition mate (60$ CAD)</option>
                                </select>
                                <div class="config-description">
                                    <p id="multiplicateurDesc">Finition brillante sans gravure pour un aspect "neuf" authentique.</p>
                                </div>
                            </div>
                        </div>

                        <div class="product-actions">
                            <button class="snipcart-add-item btn-primary"
  data-item-id="lot10"
  data-item-price="60.00"
  data-item-url="/api/products/lot10"
  data-item-name="L&#39;Offrande du Voyageur"
  data-item-description="Starter pack immersif avec 10 pi�ces m�talliques authentiques"
  data-item-image="/images/optimized-modern/webp/Vagabon.webp"
  data-item-currency="CAD"
  data-item-categories="coins">
  Ajouter � l&#39;inventaire
</button>
                            <button class="btn-wishlist" onclick="toggleWishlist()" title="Ajouter aux favoris">
                                ❤️
                            </button>
                        </div>

                        <div class="shipping-info">
                            <div class="shipping-item">
                                <strong>🚚 Expédition :</strong> 2-3 jours ouvrables
                            </div>
                            <div class="shipping-item">
                                <strong>📦 Livraison gratuite :</strong> Partout au Canada
                            </div>
                            <div class="shipping-item">
                                <strong>↩️ Retours :</strong> 30 jours satisfait ou remboursé
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
                        <h3>L'Immersion Tactile Commence Ici</h3>
                        <p>L'Offrande du Voyageur représente votre premier pas vers une immersion totale dans vos parties de Donjons & Dragons. Ce starter pack soigneusement conçu contient tout ce dont vous avez besoin pour découvrir la magie des accessoires physiques.</p>
                        
                        <h4>Contenu de l'Offrande</h4>
                        <ul>
                            <li><strong>2 pièces en cuivre véritable</strong> - L'essence de la monnaie du peuple</li>
                            <li><strong>2 pièces en argent authentique</strong> - La devise des marchands</li>
                            <li><strong>2 pièces en électrum noble</strong> - L'alliage mystérieux des sages</li>
                            <li><strong>2 pièces en or pur</strong> - La richesse des nobles</li>
                            <li><strong>2 pièces en platine rare</strong> - La fortune des rois</li>
                        </ul>

                        <h4>L'Art du Multiplicateur</h4>
                        <p>Choisissez parmi 5 multiplicateurs qui transforment vos pièces selon vos besoins de jeu :</p>
                        <ul>
                            <li><strong>x1 (Brillant)</strong> : Finition miroir sans gravure, aspect "neuf" pour débuter l'aventure</li>
                            <li><strong>x10 à x10000 (Mate gravé)</strong> : Gravure précise du multiplicateur, finition légèrement vieillie pour l'authenticité</li>
                        </ul>

                        <h4>Pourquoi Choisir l'Offrande ?</h4>
                        <p>Ce pack a été spécialement conçu pour les maîtres de jeu et joueurs qui souhaitent découvrir l'impact transformateur des accessoires physiques sans investissement majeur. Chaque pièce est fabriquée selon nos standards les plus élevés, vous garantissant une expérience premium dès votre première utilisation.</p>
                    </div>

                    <div class="tab-content" id="specifications">
                        <h3>Spécifications techniques</h3>
                        <ul>
                            <li>Matériaux : cuivre, argent, électrum, or et platine</li>
                            <li>Dimensions : diamètre 25 mm, épaisseur 2.5 mm</li>
                            <li>Poids total : environ 45 g</li>
                            <li>Emballage : coffret en bois gravé</li>
                        </ul>
                    </div>

                    <div class="tab-content" id="usage">
                        <h3>Guide d'usage</h3>
                        <ul>
                            <li>Récompensez vos joueurs avec de vraies pièces</li>
                            <li>Utilisez-les pour gérer la trésorerie en jeu</li>
                            <li>Ajoutez une touche tactile à vos négociations</li>
                        </ul>
                    </div>

                    <div class="tab-content" id="reviews">
                        <h3>Avis des aventuriers</h3>
                        <p>Aucun avis pour le moment</p>
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
                            <img src="images/optimized-modern/webp/Royaume.webp" alt="La Monnaie des Cinq Royaumes">
                        </div>
                        <div class="product-content">
                            <h3>La Monnaie des Cinq Royaumes</h3>
                            <p>Collection complète sans doublon</p>
                            <div class="price">145$ <small>CAD</small></div>
                            <a href="produit-monnaie-cinq-royaumes.php" class="btn-secondary">Découvrir</a>
                        </div>
                    </div>
                    
                    <div class="product-card">
                        <div class="product-image">
                            <img src="images/optimized-modern/webp/arme-recto.webp" alt="Arsenal de l'Aventurier">
                        </div>
                        <div class="product-content">
                            <h3>Arsenal de l'Aventurier</h3>
                            <p>182 cartes d'équipement illustrées</p>
                            <div class="price">49.99$ <small>CAD</small></div>
                            <a href="#" class="btn-secondary">Découvrir</a>
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

    <script src="js/script.js"></script>`n    <script src="api/public-config.js.php"></script>
    <script src="js/product.js"></script>
  <script src=" js/snipcart-products.js\></script>`n <script src=js/snipcart-integration.js></script>`n <div id=snipcart data-api-key=YmFhMjM0ZDEtM2VhNy00YTVlLWI0NGYtM2ZiOWI2Y2IzYmU1NjM4ODkxMjUzMDE3NzIzMjc1 data-config-modal-style=side data-config-add-product-behavior=none data-templates-url=/templates/snipcart-templates.php style=display:none;></div>`n</body>
</html>


