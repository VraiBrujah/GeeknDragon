<?php
/**
 * Carte produit unifiée - Version moderne avec design system
 * Variables attendues : $product (array), $lang (fr|en), $translations (array)
 */

if (!isset($product['id'])) return;

// Inclusion des fonctions de stock si pas déjà fait
if (!function_exists('formatProduct')) {
    require_once __DIR__ . '/../includes/stock-functions.php';
}

// Formatage du produit avec les nouvelles fonctions
$formattedProduct = formatProduct($product, $lang, $product['category'] ?? 'pieces');
$id = $formattedProduct['id'];
$stockBadge = $formattedProduct['stockBadge'];

// Options personnalisées
$customOptions = $formattedProduct['languages'] ?: $formattedProduct['multipliers'];
$customLabel = !empty($formattedProduct['languages'])
    ? ($translations['product']['language'] ?? ($lang === 'en' ? 'Language' : 'Langue'))
    : ($translations['product']['multiplier'] ?? ($lang === 'en' ? 'Multiplier' : 'Multiplicateur'));

// Détection du type de média
$isVideo = !empty($formattedProduct['img']) && preg_match('/\.mp4$/i', $formattedProduct['img']);
?>

<article class="gd-product-card gd-animate-scale-in <?= $formattedProduct['isInStock'] ? '' : 'gd-product-card--out-of-stock' ?>"
         itemscope itemtype="https://schema.org/Product">
  
  <!-- Badge de stock -->
  <div class="gd-stock-badge gd-stock-badge--<?= $stockBadge['class'] === 'gd-badge--success' ? 'in-stock' : 'out-of-stock' ?>">
    <?= $stockBadge['icon'] ?>
    <span data-i18n="product.<?= $formattedProduct['isInStock'] ? 'inStock' : 'outOfStock' ?>">
      <?= $stockBadge['text'] ?>
    </span>
  </div>

  <!-- Média du produit -->
  <a href="<?= htmlspecialchars($formattedProduct['url']) ?>" 
     class="gd-product-media"
     aria-label="Voir le détail de <?= htmlspecialchars($formattedProduct['name']) ?>">
    
    <?php if ($isVideo) : ?>
      <video src="/<?= ltrim(htmlspecialchars($formattedProduct['img']), '/') ?>"
             class="gd-product-media__video" 
             autoplay muted loop playsinline
             preload="metadata"
             loading="lazy"
             aria-label="Vidéo de présentation du produit">
      </video>
    <?php else : ?>
      <img src="/<?= ltrim(htmlspecialchars($formattedProduct['img']), '/') ?>"
           alt="<?= htmlspecialchars($formattedProduct['summary']) ?>"
           class="gd-product-media__image" 
           loading="lazy" 
           decoding="async"
           fetchpriority="low"
           itemprop="image">
    <?php endif; ?>
    
    <!-- Overlay d'interaction -->
    <div class="gd-product-media__overlay">
      <svg class="gd-icon gd-icon--eye" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
      </svg>
      <span class="gd-sr-only">Voir les détails</span>
    </div>
  </a>

  <!-- Contenu de la carte -->
  <div class="gd-product-card__content">
    
    <!-- Titre du produit -->
    <h3 class="gd-product-title" itemprop="name">
      <a href="<?= htmlspecialchars($formattedProduct['url']) ?>"
         data-name-fr="<?= htmlspecialchars($product['name']) ?>"
         data-name-en="<?= htmlspecialchars($product['name_en'] ?? $product['name']) ?>">
        <?= $formattedProduct['name_display'] ?>
      </a>
    </h3>

    <!-- Description -->
    <div class="gd-product-description gd-line-clamp-3" 
         itemprop="description"
         data-desc-fr="<?= htmlspecialchars($product['summary'] ?? $product['description']) ?>"
         data-desc-en="<?= htmlspecialchars($product['summary_en'] ?? $product['summary'] ?? $product['description_en'] ?? $product['description']) ?>">
      <?= htmlspecialchars($formattedProduct['summary']) ?>
    </div>

    <!-- Prix -->
    <div class="gd-product-price" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
      <span class="gd-price-value" itemprop="price" content="<?= $formattedProduct['price'] ?>">
        <?= $formattedProduct['price'] ?>
      </span>
      <span class="gd-price-currency" itemprop="priceCurrency" content="CAD">$CA</span>
      <meta itemprop="availability" content="<?= $formattedProduct['isInStock'] ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' ?>">
    </div>

    <?php if ($formattedProduct['isInStock']) : ?>
      <!-- Contrôles de quantité et options -->
      <div class="gd-product-controls">
        <?php 
        include __DIR__ . '/quantity-controls.php';
        ?>
      </div>

      <!-- Bouton d'ajout au panier -->
      <button class="snipcart-add-item gd-btn gd-btn--primary gd-product-add-btn"
              data-item-id="<?= htmlspecialchars($id) ?>"
              data-item-name="<?= htmlspecialchars(strip_tags($formattedProduct['name'])) ?>"
              data-item-name-fr="<?= htmlspecialchars(strip_tags($product['name'])) ?>"
              data-item-name-en="<?= htmlspecialchars(strip_tags($product['name_en'] ?? $product['name'])) ?>"
              data-item-price="<?= htmlspecialchars($formattedProduct['price']) ?>"
              data-item-url="<?= htmlspecialchars($formattedProduct['url']) ?>"
              data-item-quantity="1"
              <?php if (!empty($customOptions)) : ?>
              data-item-custom1-name="<?= htmlspecialchars($customLabel) ?>"
              data-item-custom1-options="<?= htmlspecialchars(implode('|', array_map('strval', $customOptions))) ?>"
              data-item-custom1-value="<?= htmlspecialchars((string)$customOptions[0]) ?>"
              <?php endif; ?>
              aria-describedby="product-<?= htmlspecialchars($id) ?>-description">
        
        <svg class="gd-icon gd-icon--cart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 3h2l.4 2m0 0L8 17h8l3-8H5.4z"/>
          <circle cx="9" cy="20" r="1"/>
          <circle cx="20" cy="20" r="1"/>
        </svg>
        <span data-i18n="product.add">Ajouter au panier</span>
      </button>
      
    <?php else : ?>
      <!-- Bouton désactivé pour rupture de stock -->
      <button class="gd-btn gd-btn--disabled gd-product-add-btn" disabled>
        <svg class="gd-icon gd-icon--unavailable" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd"/>
        </svg>
        <span data-i18n="product.outOfStock">Rupture de stock</span>
      </button>
    <?php endif; ?>

  </div>
</article>

<script>
/**
 * Gestion des contrôles de produit
 * Version unifiée et optimisée
 */
(function() {
  const productId = '<?= htmlspecialchars($id) ?>';
  
  // Éviter la duplication des listeners
  if (window.productHandlers && window.productHandlers[productId]) {
    return;
  }
  
  if (!window.productHandlers) {
    window.productHandlers = {};
  }
  
  const productCard = document.querySelector(`[data-id="${productId}"]`).closest('.gd-product-card');
  if (!productCard) return;
  
  // Gestion des boutons de quantité
  const handleQuantityChange = (e) => {
    if (!e.target.classList.contains('gd-quantity-btn')) return;
    
    const target = e.target.getAttribute('data-target');
    const qtyEl = document.getElementById(`qty-${target}`);
    let qty = parseInt(qtyEl.textContent, 10);
    
    if (e.target.classList.contains('gd-quantity-btn--plus')) {
      qty = Math.min(qty + 1, 99);
    } else if (e.target.classList.contains('gd-quantity-btn--minus')) {
      qty = Math.max(qty - 1, 1);
    }
    
    qtyEl.textContent = qty;
    
    // Animation micro-interaction
    qtyEl.style.transform = 'scale(1.1)';
    setTimeout(() => {
      qtyEl.style.transform = 'scale(1)';
    }, 150);
  };
  
  // Gestion de l'ajout au panier
  const handleAddToCart = (e) => {
    const btn = e.target.closest('.snipcart-add-item');
    if (!btn) return;
    
    const id = btn.getAttribute('data-item-id');
    
    // Mise à jour de la quantité
    const qtyEl = document.getElementById(`qty-${id}`);
    if (qtyEl) {
      const qty = parseInt(qtyEl.textContent, 10);
      if (!isNaN(qty) && qty > 0) {
        btn.setAttribute('data-item-quantity', String(qty));
      }
    }
    
    // Mise à jour des options personnalisées
    const customEl = document.getElementById(`custom-${id}`);
    if (customEl) {
      const customValue = customEl.value;
      btn.setAttribute('data-item-custom1-value', customValue);
      
      // Mise à jour du nom avec multiplicateur/langue
      const lang = document.documentElement.lang;
      const baseName = lang === 'en'
        ? (btn.dataset.itemNameEn || btn.getAttribute('data-item-name'))
        : (btn.dataset.itemNameFr || btn.getAttribute('data-item-name'));
      
      const finalName = customValue !== '1' ? `${baseName} × ${customValue}` : baseName;
      btn.setAttribute('data-item-name', finalName);
    }
    
    // Effet visuel d'ajout
    btn.classList.add('gd-btn--loading');
    setTimeout(() => {
      btn.classList.remove('gd-btn--loading');
    }, 1000);
  };
  
  // Attacher les listeners
  productCard.addEventListener('click', handleQuantityChange);
  productCard.addEventListener('click', handleAddToCart);
  
  // Observer d'apparition pour l'animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationDelay = Math.random() * 0.2 + 's';
        entry.target.classList.add('gd-animate-fade-up');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  observer.observe(productCard);
  
  // Marquer comme initialisé
  window.productHandlers[productId] = true;
})();
</script>