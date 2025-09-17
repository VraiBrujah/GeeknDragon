<?php
declare(strict_types=1);

$id = preg_replace('/[^a-z0-9_-]/i', '', $_GET['id'] ?? '');
$dataPath = __DIR__ . '/data/products.json';
if (!$id || !is_file($dataPath)) {
  http_response_code(404);
  echo 'Produit introuvable';
  exit;
}
$all = json_decode(file_get_contents($dataPath), true) ?? [];
if (!isset($all[$id])) {
  http_response_code(404);
  echo 'Produit introuvable';
  exit;
}
$p = $all[$id];

$name = $p['name'] ?? $id;
$name_en = $p['name_en'] ?? $name;
$descHtml = $p['description'] ?? '';
$price = isset($p['price']) ? (float)$p['price'] : 0.0;
$images = $p['images'] ?? [];
$firstImage = $images[0] ?? '/images/brand-geekndragon-main.webp';
$title = $name . ' | Geek&Dragon';
$metaDescription = strip_tags($descHtml);
$active = 'boutique';
include __DIR__ . '/header.php';
?>
<main class="product-main">
  <section class="breadcrumb">
    <div class="container">
      <nav class="breadcrumb-nav">
        <a href="index.php">Accueil</a>
        <span>›</span>
        <a href="boutique.php">Boutique</a>
        <span>›</span>
        <span class="current"><?= htmlspecialchars($name) ?></span>
      </nav>
    </div>
  </section>

  <section class="product-hero">
    <div class="container">
      <div class="product-hero-content">
        <div class="product-gallery">
          <div class="main-image">
            <img src="<?= htmlspecialchars($firstImage) ?>" alt="<?= htmlspecialchars($name) ?>" id="mainProductImage">
          </div>
          <?php if (count($images) > 1): ?>
          <div class="thumbnail-gallery">
            <?php foreach ($images as $idx => $img): ?>
            <img src="<?= htmlspecialchars($img) ?>" alt="<?= htmlspecialchars($name) ?> image <?= $idx+1 ?>" class="thumbnail<?= $idx===0?' active':'' ?>" onclick="changeMainImage(this)">
            <?php endforeach; ?>
          </div>
          <?php endif; ?>
        </div>

        <div class="product-info">
          <div class="product-category">
            <span class="category-tag">Produit</span>
            <span class="product-id">#<?= htmlspecialchars(strtoupper($id)) ?></span>
          </div>

          <h1 class="product-title"><?= htmlspecialchars($name) ?></h1>
          <div class="product-pricing">
            <div class="price-main">
              <span class="price"><?= number_format($price, 2, '.', '') ?>$ <small>CAD</small></span>
            </div>
          </div>

          <div class="product-actions">
            <button class="snipcart-add-item btn-primary"
              data-item-id="<?= htmlspecialchars($id) ?>"
              data-item-price="<?= number_format($price, 2, '.', '') ?>"
              data-item-url="/api/products/<?= htmlspecialchars($id) ?>"
              data-item-name="<?= htmlspecialchars($name) ?>"
              data-item-description="<?= htmlspecialchars(strip_tags($descHtml)) ?>"
              data-item-image="<?= htmlspecialchars($firstImage) ?>"
              data-item-currency="CAD">
              Ajouter à l'inventaire
            </button>
            <button class="btn-wishlist" title="Ajouter aux favoris">❤</button>
          </div>

          <div class="product-tabs">
            <div class="tab-buttons">
              <button class="tab-btn active" onclick="switchTab('description')">Description</button>
              <button class="tab-btn" onclick="switchTab('reviews')">Avis</button>
            </div>
            <div class="tab-content active" id="description">
              <?= $descHtml ?>
            </div>
            <div class="tab-content" id="reviews">
              <p>Aucun avis pour le moment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>
<script src="js/product.js"></script>
<?php include __DIR__ . '/footer.php'; ?>

