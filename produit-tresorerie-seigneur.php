<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>La Trésorerie du Seigneur | Geek&Dragon</title>
  <meta name="description" content="50 pièces d'un même multiplicateur pour une opulence immédiate. Idéal pour les trésors de haut niveau.">
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/product.css">
</head>
<body>
  <header class="header">
    <nav class="nav-container">
      <div class="logo"><a href="index.php"><span class="logo-text">Geek&Dragon</span></a></div>
      <ul class="nav-menu">
        <li><a href="index.php" class="nav-link">Accueil</a></li>
        <li><a href="boutique.php" class="nav-link">Boutique</a></li>
        <li><a href="boutique.php#coins" class="nav-link">Pièces</a></li>
        <li><a href="index.php#contact" class="nav-link">Contact</a></li>
      </ul>
      <div class="nav-toggle"><span></span><span></span><span></span></div>
    </nav>
  </header>

  <main class="product-main">
    <section class="breadcrumb">
      <div class="container">
        <nav class="breadcrumb-nav">
          <a href="index.php">Accueil</a><span>›</span>
          <a href="boutique.php">Boutique</a><span>›</span>
          <a href="boutique.php#coins">Pièces Métalliques</a><span>›</span>
          <span class="current">La Trésorerie du Seigneur</span>
        </nav>
      </div>
    </section>

    <section class="product-hero">
      <div class="container">
        <div class="product-hero-content">
          <div class="product-gallery">
            <div class="main-image">
              <img src="images/optimized-modern/webp/Seignieur.webp" alt="La Trésorerie du Seigneur" id="mainProductImage">
              <div class="image-badges"><span class="badge premium">Premium</span></div>
            </div>
            <div class="thumbnail-gallery">
              <img src="images/optimized-modern/webp/Seignieur.webp" alt="Vue principale" class="thumbnail active" onclick="changeMainImage(this)">
              <img src="images/optimized-modern/webp/Seignieurplast.webp" alt="Détails du coffret" class="thumbnail" onclick="changeMainImage(this)">
              <img src="images/optimized-modern/webp/coffre.webp" alt="Coffre" class="thumbnail" onclick="changeMainImage(this)">
            </div>
          </div>

          <div class="product-info">
            <div class="product-category"><span class="category-tag">Pièces Métalliques</span><span class="product-id">#GD-L50T-001</span></div>
            <h1 class="product-title">La Trésorerie du Seigneur</h1>
            <p class="product-subtitle">50 pièces — un même multiplicateur choisi</p>

            <div class="product-pricing">
              <div class="price-main"><span class="price">275$ <small>CAD</small></span><span class="price-note">Opulence immédiate</span></div>
              <div class="payment-options"><span>Paiement sécurisé</span><span>Livraison gratuite CA</span></div>
            </div>

            <div class="product-actions">
              <button class="snipcart-add-item btn-primary"
                data-item-id="lot50-tresorerie"
                data-item-price="275.00"
                data-item-url="/api/products/lot50-tresorerie"
                data-item-name="La Trésorerie du Seigneur"
                data-item-description="50 pièces d'un même multiplicateur choisi."
                data-item-image="/images/optimized-modern/webp/Seignieur.webp"
                data-item-currency="CAD"
                data-item-categories="coins">
                Ajouter à l'inventaire
              </button>
              <button class="btn-wishlist" title="Ajouter aux favoris">❤</button>
            </div>

            <div class="product-tabs">
              <div class="tab-buttons">
                <button class="tab-btn active" data-tab="description">Description</button>
                <button class="tab-btn" data-tab="specifications">Spécifications</button>
                <button class="tab-btn" data-tab="usage">Guide d'Usage</button>
                <button class="tab-btn" data-tab="reviews">Avis (0)</button>
              </div>
              <div class="tab-content active" id="description">
                <p>Choisissez un multiplicateur pour toutes les pièces : parfait pour créer une monnaie cohérente et percutante en jeu.</p>
              </div>
              <div class="tab-content" id="specifications"><ul><li>50 pièces — 10 de chaque métal</li></ul></div>
              <div class="tab-content" id="usage"><ul><li>Idéal pour trésors de boss et coffres royaux</li></ul></div>
              <div class="tab-content" id="reviews"><p>Aucun avis pour le moment</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section"><h3>Geek&Dragon</h3><p>Accessoires immersifs pour jeux de rôle.</p></div>
        <div class="footer-section"><h4>Boutique</h4><ul><li><a href="boutique.php#coins">Pièces</a></li></ul></div>
        <div class="footer-section"><h4>Support</h4><ul><li><a href="mailto:support@geekndragon.com">Support</a></li></ul></div>
      </div>
      <div class="footer-bottom"><p>&copy; 2024 Geek&Dragon. Tous droits réservés.</p></div>
    </div>
  </footer>

  <script src="js/script.js"></script>`n    <script src="api/public-config.js.php"></script>
  <script src="js/product.js"></script>
  <script src="js/snipcart-products.js"></script>
  <script src="js/snipcart-integration.js"></script>
  <div id="snipcart"  data-config-modal-style="side" data-config-add-product-behavior="none" data-templates-url="/templates/snipcart-templates.php" style="display:none;"></div>
</body>
</html>


