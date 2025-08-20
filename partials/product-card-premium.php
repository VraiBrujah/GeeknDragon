<?php
// Variables attendues dans le scope : $product (array), $lang (fr|en), $translations (array)

require_once __DIR__ . '/../includes/video-utils.php';

if (!isset($product['id'])) {
    return;
}
$id = (string)$product['id'];

$name        = $lang === 'en' ? ($product['name_en'] ?? $product['name']) : $product['name'];
$summary     = $lang === 'en'
    ? ($product['summary_en'] ?? $product['summary'] ?? null)
    : ($product['summary'] ?? $product['summary_en'] ?? null);
$desc        = $summary ?? ($lang === 'en'
    ? ($product['description_en'] ?? $product['description'])
    : $product['description']);
$img         = $product['img'] ?? ($product['images'][0] ?? '');
$isVideo     = preg_match('/\.mp4$/i', $img);
$posterPath  = $isVideo ? generateVideoPoster($img) : null;
$url         = $product['url'] ?? ('/product.php?id=' . urlencode($id));
$price       = number_format((float)$product['price'], 2, '.', '');

static $parsedown;
$parsedown = $parsedown ?? new Parsedown();
$htmlDesc  = $parsedown->text($desc);
$isInStock = inStock($id);
?>

<div class="product-card animate-scale-in <?= $isInStock ? '' : 'loading' ?>">
  <!-- Badge de stock -->
  <?php if ($isInStock) : ?>
    <div class="stock-badge in-stock">
      <svg class="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
      </svg>
      <span data-i18n="product.inStock">En stock</span>
    </div>
  <?php else : ?>
    <div class="stock-badge out-of-stock">
      <svg class="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
      </svg>
      <span data-i18n="product.outOfStock">Rupture de stock</span>
    </div>
  <?php endif; ?>

  <!-- Média du produit -->
  <a href="<?= htmlspecialchars($url) ?>" class="product-media-container">
    <?php if ($isVideo) : ?>
      <video data-src="/<?= ltrim(htmlspecialchars($img), '/') ?>"
             <?php if ($posterPath) : ?>poster="<?= htmlspecialchars($posterPath) ?>"<?php endif; ?>
             class="product-media lazy-video" muted loop playsinline preload="metadata"></video>
    <?php else : ?>
      <img src="/<?= ltrim(htmlspecialchars($img), '/') ?>"
           alt="<?= htmlspecialchars($desc) ?>"
           data-alt-fr="<?= htmlspecialchars($product['summary'] ?? $product['description'] ?? $desc) ?>"
           data-alt-en="<?= htmlspecialchars($product['summary_en'] ?? $product['summary'] ?? $product['description_en'] ?? $product['description'] ?? $desc) ?>"
           class="product-media" loading="lazy">
    <?php endif; ?>
  </a>

  <!-- Contenu de la carte -->
  <div class="product-content">
    <a href="<?= htmlspecialchars($url) ?>">
      <h4 class="product-title"
          data-name-fr="<?= htmlspecialchars($product['name']) ?>"
          data-name-en="<?= htmlspecialchars($product['name_en'] ?? $product['name']) ?>">
        <?= htmlspecialchars($name) ?>
      </h4>
    </a>

    <div class="product-description"
         data-desc-fr="<?= htmlspecialchars($product['summary'] ?? $product['description'] ?? $desc) ?>"
         data-desc-en="<?= htmlspecialchars($product['summary_en'] ?? $product['summary'] ?? $product['description_en'] ?? $product['description'] ?? $desc) ?>">
      <?= strip_tags($htmlDesc) ?>
    </div>

    <div class="product-price">
      <?= $price ?> $CA
    </div>

    <?php if ($isInStock) : ?>
      <!-- Contrôles de quantité -->
      <div class="quantity-controls">
        <div class="quantity-selector" data-id="<?= htmlspecialchars($id) ?>">
          <button type="button" class="quantity-btn minus" data-target="<?= htmlspecialchars($id) ?>">−</button>
          <span class="qty-value" id="qty-<?= htmlspecialchars($id) ?>">1</span>
          <button type="button" class="quantity-btn plus" data-target="<?= htmlspecialchars($id) ?>">+</button>
        </div>
        
      </div>

      <!-- Bouton d'achat -->
      <button class="gd-add-to-cart add-to-cart-btn"
              data-id="<?= htmlspecialchars($id) ?>"
              data-name="<?= htmlspecialchars(strip_tags($name)) ?>"
              data-name-fr="<?= htmlspecialchars(strip_tags($product['name'])) ?>"
              data-name-en="<?= htmlspecialchars(strip_tags($product['name_en'] ?? $product['name'])) ?>"
              data-price="<?= htmlspecialchars($price) ?>"
              data-url="<?= htmlspecialchars($url) ?>"
              data-quantity="1">
        <svg class="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 3h2l.4 2m0 0L8 17h8l3-8H5.4z"/>
          <circle cx="9" cy="20" r="1"/>
          <circle cx="20" cy="20" r="1"/>
        </svg>
        <span data-i18n="product.add">Ajouter au sac</span>
      </button>
    <?php else : ?>
      <button class="add-to-cart-btn" disabled>
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd"/>
        </svg>
        <span data-i18n="product.outOfStock">Rupture de stock</span>
      </button>
    <?php endif; ?>
  </div>
</div>

<!-- Script pour la gestion des quantités et lazy-loading -->
<script>
(function(){
  if (window.__premiumCardPatch) return;
  window.__premiumCardPatch = true;

  // Gestion des boutons quantité
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('quantity-btn')) {
      const target = e.target.getAttribute('data-target');
      const qtyEl = document.getElementById('qty-' + target);
      let qty = parseInt(qtyEl.textContent, 10);
      
      if (e.target.classList.contains('plus')) {
        qty = Math.min(qty + 1, 99);
      } else if (e.target.classList.contains('minus')) {
        qty = Math.max(qty - 1, 1);
      }
      
      qtyEl.textContent = qty;
      
      // Effet visuel
      qtyEl.style.transform = 'scale(1.2)';
      setTimeout(() => {
        qtyEl.style.transform = 'scale(1)';
      }, 150);
    }
    
    // Gestion du bouton d'achat
    const btn = e.target.closest('.gd-add-to-cart');
    if (!btn) return;

    const id = btn.getAttribute('data-id');
    if (!id) return;

    // Mise à jour de la quantité
    const qtyEl = document.getElementById('qty-' + id);
    if (qtyEl) {
      const q = parseInt(qtyEl.textContent, 10);
      if (!isNaN(q) && q > 0) btn.setAttribute('data-quantity', String(q));
    }
  }, { passive: true });

  // Lazy-loading des vidéos avec IntersectionObserver
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const video = entry.target;
        const src = video.getAttribute('data-src');
        if (src) {
          video.src = src;
          video.autoplay = true;
          video.removeAttribute('data-src');
          video.classList.remove('lazy-video');
          videoObserver.unobserve(video);
        }
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.1
  });

  // Observer toutes les vidéos lazy
  document.querySelectorAll('.lazy-video').forEach(video => {
    videoObserver.observe(video);
  });

  // Animation d'apparition au scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationDelay = Math.random() * 0.3 + 's';
        entry.target.classList.add('animate-fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.product-card').forEach(card => {
    observer.observe(card);
  });
})();
</script>