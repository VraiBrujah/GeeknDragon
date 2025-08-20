<?php
require __DIR__ . '/bootstrap.php';
$config = require __DIR__ . '/config.php';
require __DIR__ . '/i18n.php';

$active = 'boutique';
$id = preg_replace('/[^a-z0-9_-]/i', '', $_GET['id'] ?? '');
$data = json_decode(file_get_contents(__DIR__ . '/data/products.json'), true) ?? [];
$snipcartSecret = $config['snipcart_secret_api_key'] ?? null;

if (!$id || !isset($data[$id])) {
    http_response_code(404);
    echo 'Produit introuvable';
    exit;
}
$product = $data[$id];

// Langue & champs
$productName = $lang === 'en' ? ($product['name_en'] ?? $product['name']) : $product['name'];
$productDescHtml = $lang === 'en' ? ($product['description_en'] ?? $product['description']) : $product['description'];
$productDescText = trim(strip_tags($productDescHtml));

$title  = $productName . ' | Geek & Dragon';
$metaDescription = $productDescText;
$host = $_SERVER['HTTP_HOST'] ?? 'geekndragon.com';
$metaUrl = 'https://' . $host . '/product.php?id=' . urlencode($id);
$from = preg_replace('/[^a-z0-9_-]/i', '', $_GET['from'] ?? 'pieces');

require_once __DIR__ . '/includes/stock-functions.php';

// Affichage (FR/EN) pour le titre
$displayName   = str_replace(' – ', '<br>', $product['name']);
$displayNameEn = str_replace(' – ', '<br>', $product['name_en'] ?? $product['name']);

$multipliers   = $product['multipliers'] ?? [];
$languages     = $product['languages'] ?? [];
$customOptions = !empty($languages) ? $languages : $multipliers;
$customLabel   = !empty($languages)
    ? ($translations['product']['language'] ?? ($lang === 'en' ? 'Language' : 'Langue'))
    : ($translations['product']['multiplier'] ?? ($lang === 'en' ? 'Multiplier' : 'Multiplicateur'));
$images        = $product['images'] ?? [];

// CSS local pour une description propre
$extraHead = '<link rel="stylesheet" href="/css/product-gallery.css?v=' . filemtime(__DIR__.'/css/product-gallery.css') . '">';
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang) ?>">
<?php include 'head-common.php'; ?>
<body>
<?php include 'header.php'; ?>
<main id="main" class="py-10 pt-[calc(var(--header-height)+2rem)] main-product">
  <section class="max-w-4xl w-full mx-auto px-6">
    <div class="flex justify-center mb-8">
      <a href="boutique.php#<?= htmlspecialchars($from) ?>" class="btn btn-outline">&larr;
        <span data-i18n="product.back">Retour à la boutique</span>
      </a>
    </div>

    <div class="bg-gray-800 p-6 rounded-xl shadow-lg product-panel">
      <?php if (!empty($images)) : ?>
        <!-- Galerie produit simplifiée (utilise universal-image-gallery.js) -->
        <div class="product-gallery-container mb-6">
          <!-- Image principale -->
          <div class="main-image-container">
            <div class="main-image-wrapper">
              <?php $firstImage = $images[0]; $isFirstVideo = preg_match('/\.mp4$/i', $firstImage); ?>
              <?php if ($isFirstVideo) : ?>
                <video src="<?= htmlspecialchars($firstImage) ?>" 
                       class="product-media main-product-media"
                       autoplay muted playsinline
                       data-no-gallery
                       id="main-product-video"
                       disablepictureinpicture
                       controlslist="nodownload nofullscreen noremoteplayback">
                </video>
              <?php else : ?>
                <img src="<?= htmlspecialchars($firstImage) ?>"
                     alt="<?= htmlspecialchars('Geek & Dragon – ' . strip_tags($productName)) ?>"
                     class="product-media main-product-media"
                     data-gallery="product">
              <?php endif; ?>
            </div>
          </div>
          
          <!-- Thumbnails -->
          <?php if (count($images) > 1) : ?>
            <div class="thumbnails-container">
              <div class="thumbnails-wrapper">
                <?php foreach ($images as $index => $img) : ?>
                  <?php $isVideo = preg_match('/\.mp4$/i', $img); ?>
                  <div class="thumbnail <?= $index === 0 ? 'active' : '' ?>" data-index="<?= $index ?>">
                    <?php if ($isVideo) : ?>
                      <video src="<?= htmlspecialchars($img) ?>" 
                             class="thumbnail-media"
                             data-no-gallery
                             muted
                             disablepictureinpicture
                             controlslist="nodownload nofullscreen noremoteplayback"></video>
                      <div class="video-icon">▶</div>
                    <?php else : ?>
                      <img src="<?= htmlspecialchars($img) ?>"
                           alt="<?= htmlspecialchars('Image ' . ($index + 1) . ' - ' . strip_tags($productName)) ?>"
                           class="thumbnail-media">
                    <?php endif; ?>
                  </div>
                <?php endforeach; ?>
              </div>
            </div>
          <?php endif; ?>
        </div>
      <?php endif; ?>
      
      <div class="product-info">
      <!-- En-tête produit -->
      <div class="product-header mb-6">
        <h1 class="text-3xl font-bold mb-2 text-center"
            data-name-fr="<?= $displayName ?>"
            data-name-en="<?= $displayNameEn ?>"><?= ($lang === 'en' ? $displayNameEn : $displayName) ?></h1>
        
        <!-- Prix et disponibilité -->
        <div class="product-pricing text-center mb-4">
          <div class="price-container">
            <span class="current-price"><?= number_format((float)$product['price'], 2) ?> CAD</span>
            <?php if (inStock($id)) : ?>
              <span class="stock-status in-stock">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" class="inline mr-1">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>
                <span data-i18n="product.inStock">En stock</span>
              </span>
            <?php else : ?>
              <span class="stock-status out-of-stock">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" class="inline mr-1">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
                <span data-i18n="product.outOfStock">Rupture de stock</span>
              </span>
            <?php endif; ?>
          </div>
        </div>
        
        <!-- Actions de partage -->
        <div class="product-actions mb-6">
          <div class="social-share">
            <span class="share-label" data-i18n="product.share">Partager :</span>
            <button class="share-btn" data-share="facebook" title="Partager sur Facebook">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
            <button class="share-btn" data-share="twitter" title="Partager sur Twitter">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </button>
            <button class="share-btn" data-share="whatsapp" title="Partager sur WhatsApp">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
              </svg>
            </button>
            <button class="share-btn" data-share="copy" title="Copier le lien">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="product-desc mb-6">
        <?= $productDescHtml ?>
      </div>



      <?php if (inStock($id)) : ?>
        <div class="text-center mb-4 w-full">
          <label class="block mb-2" data-i18n="product.quantity">Quantité</label>
          <div class="flex items-center justify-center gap-4">
<!--
            <?php if (!empty($customOptions)) : ?>
              <select id="multiplier-<?= htmlspecialchars($id) ?>" class="multiplier-select select" data-target="<?= htmlspecialchars($id) ?>">
                <?php foreach ($customOptions as $opt) : ?>
                  <option value="<?= htmlspecialchars((string)$opt) ?>">
                    <?= !empty($languages) ? htmlspecialchars((string)$opt) : 'x' . htmlspecialchars((string)$opt) ?>
                  </option>
                <?php endforeach; ?>
              </select>
            <?php endif; ?>
-->
            <div class="quantity-selector" data-id="<?= htmlspecialchars($id) ?>">
              <button type="button" class="quantity-btn minus" data-target="<?= htmlspecialchars($id) ?>">−</button>
              <span class="qty-value" id="qty-<?= htmlspecialchars($id) ?>">1</span>
              <button type="button" class="quantity-btn plus" data-target="<?= htmlspecialchars($id) ?>">+</button>
            </div>
          </div>
        </div>

        <button class="gd-add-to-cart btn btn-shop"
            data-id="<?= htmlspecialchars($id) ?>"
            data-name="<?= htmlspecialchars(strip_tags($productName)) ?>"
            data-name-fr="<?= htmlspecialchars(strip_tags($product['name'])) ?>"
            data-name-en="<?= htmlspecialchars(strip_tags($product['name_en'] ?? $product['name'])) ?>"
            data-price="<?= htmlspecialchars(number_format((float)$product['price'], 2, '.', '')) ?>"
            data-url="<?= htmlspecialchars($metaUrl) ?>"
            data-quantity="1"
            <?php if (!empty($customOptions)) : ?>
            data-custom1-name="<?= htmlspecialchars($customLabel) ?>"
            data-custom1-options="<?= htmlspecialchars(implode('|', array_map('strval', $customOptions))) ?>"
            data-custom1-value="<?= htmlspecialchars((string)$customOptions[0]) ?>"
          <?php endif; ?>
        >
          <span data-i18n="product.add">Ajouter au sac</span>
        </button>
      <?php else : ?>
        <span class="btn btn-shop opacity-60 cursor-not-allowed" disabled data-i18n="product.outOfStock">Rupture de stock</span>
      <?php endif; ?>

      <p class="mt-4 text-center txt-court">
        <span class="payment-icons">
          <img src="/images/payments/visa.svg" alt="Logo Visa" loading="lazy">
          <img src="/images/payments/mastercard.svg" alt="Logo Mastercard" loading="lazy">
          <img src="/images/payments/american-express.svg" alt="Logo American Express" loading="lazy">
        </span>
      </p>
      </div> <!-- Fermeture product-info -->
    </div> <!-- Fermeture product-panel -->
  </section>

  <?php include __DIR__ . '/partials/testimonials.php'; ?>
</main>

<?php include 'footer.php'; ?>

<script type="application/ld+json">
<?= json_encode([
    '@context' => 'https://schema.org/',
    '@type' => 'Product',
    'name' => $productName,
    'description' => $productDescText,
    'image' => !empty($images) ? ('https://' . $host . '/' . ltrim($images[0], '/')) : null,
    'sku' => $id,
    'offers' => [
        '@type' => 'Offer',
        'price' => (float)$product['price'],
        'priceCurrency' => 'CAD',
        'availability' => inStock($id) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    ],
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) ?>
</script>

<script src="js/app.js"></script>

<!-- Script pour la navigation des thumbnails -->
<script>
document.addEventListener('DOMContentLoaded', function() {
  const thumbnailContainers = document.querySelectorAll('.thumbnail');
  let mainMedia = document.querySelector('.main-product-media');
  let currentIndex = 0;
  const total = thumbnailContainers.length;

  function showImage(index) {
    if (!thumbnailContainers[index]) return;

    const container = thumbnailContainers[index];
    const thumb = container.querySelector('.thumbnail-media');

    // Mettre à jour l'active sur les thumbnails
    thumbnailContainers.forEach(c => c.classList.remove('active'));
    container.classList.add('active');

    // Mettre à jour le média principal
    if (mainMedia.tagName === 'IMG' && thumb.tagName === 'IMG') {
      mainMedia.src = thumb.src;
      mainMedia.alt = thumb.alt;
    } else if (mainMedia.tagName === 'VIDEO' && thumb.tagName === 'VIDEO') {
      mainMedia.src = thumb.src;
    } else if (mainMedia.tagName === 'IMG' && thumb.tagName === 'VIDEO') {
      const newVideo = document.createElement('video');
      newVideo.className = mainMedia.className;
      newVideo.src = thumb.src;
      newVideo.muted = true;
      newVideo.playsInline = true;
      newVideo.dataset.noGallery = true;
      newVideo.disablePictureInPicture = true;
      newVideo.setAttribute('controlslist', 'nodownload nofullscreen noremoteplayback');
      mainMedia.parentNode.replaceChild(newVideo, mainMedia);
      mainMedia = newVideo;
    } else if (mainMedia.tagName === 'VIDEO' && thumb.tagName === 'IMG') {
      const newImg = document.createElement('img');
      newImg.className = mainMedia.className;
      newImg.src = thumb.src;
      newImg.alt = thumb.alt;
      newImg.dataset.gallery = 'product';
      mainMedia.parentNode.replaceChild(newImg, mainMedia);
      mainMedia = newImg;
      if (window.UniversalGallery) {
        window.UniversalGallery.refresh();
      }
    }

    currentIndex = index;
  }

  // Clic sur les miniatures
  if (total && mainMedia) {
    let restartAutoSlide; // Référence à la fonction de redémarrage
    
    thumbnailContainers.forEach((container, index) => {
      container.addEventListener('click', function() {
        showImage(index);
        // Redémarrer le défilement automatique après clic manuel
        if (restartAutoSlide) {
          restartAutoSlide();
        }
      });
    });

    // Défilement automatique avec gestion vidéo
    if (total > 1) {
      let autoSlideInterval;
      let videoEndListener;
      
      function startAutoSlide() {
        // Nettoyer l'ancien interval
        if (autoSlideInterval) {
          clearInterval(autoSlideInterval);
        }
        
        // Vérifier si l'élément actuel est une vidéo
        const currentMedia = mainMedia;
        if (currentMedia && currentMedia.tagName === 'VIDEO') {
          // C'est une vidéo, attendre qu'elle se termine
          
          // Démarrer la vidéo automatiquement
          currentMedia.autoplay = true;
          currentMedia.muted = true;
          currentMedia.play().catch(e => console.log('Autoplay bloqué:', e));
          
          // Nettoyer l'ancien listener
          if (videoEndListener) {
            currentMedia.removeEventListener('ended', videoEndListener);
          }
          
          // Écouter la fin de la vidéo
          videoEndListener = function() {
            console.log('Vidéo terminée, passage à l\'image suivante');
            const next = (currentIndex + 1) % total;
            showImage(next);
            startAutoSlide(); // Redémarrer pour le nouvel élément
          };
          
          currentMedia.addEventListener('ended', videoEndListener);
          
          // Sécurité : si la vidéo ne se termine pas dans 30s, passer quand même
          setTimeout(() => {
            if (currentIndex === getCurrentMediaIndex() && currentMedia.tagName === 'VIDEO') {
              console.log('Timeout vidéo, passage forcé');
              const next = (currentIndex + 1) % total;
              showImage(next);
              startAutoSlide();
            }
          }, 30000);
          
        } else {
          // C'est une image, défilement normal après 5s
          autoSlideInterval = setTimeout(() => {
            const next = (currentIndex + 1) % total;
            showImage(next);
            startAutoSlide(); // Redémarrer pour le nouvel élément
          }, 5000);
        }
      }
      
      function getCurrentMediaIndex() {
        return currentIndex;
      }
      
      // Exposer la fonction pour les clics manuels
      restartAutoSlide = startAutoSlide;
      
      // Démarrer le défilement automatique
      startAutoSlide();
    }
  }
});
</script>

<!-- Patch : mettre à jour quantité & multiplicateur juste avant l'ajout -->
<script>
(function(){
  if (window.__gdQtyPatch) return;
  window.__gdQtyPatch = true;

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.gd-add-to-cart');
    if (!btn) return;

    const id = btn.getAttribute('data-id');
    if (!id) return;

    // Quantité
    const qtyEl = document.getElementById('qty-' + id);
    if (qtyEl) {
      const q = parseInt(qtyEl.textContent, 10);
      if (!isNaN(q) && q > 0) btn.setAttribute('data-quantity', String(q));
    }

    // Multiplicateur (si présent)
    const multEl = document.getElementById('multiplier-' + id);
    if (multEl) {
      const mult = multEl.value;
      btn.setAttribute('data-custom1-value', mult);

      // Mettre à jour le nom affiché dans le panier (optionnel)
      const lang = document.documentElement.lang;
      const baseName = (lang === 'en')
        ? (btn.dataset.nameEn || btn.getAttribute('data-name'))
        : (btn.dataset.nameFr || btn.getAttribute('data-name'));
      btn.setAttribute('data-name', mult !== '1' ? (baseName + ' x' + mult) : baseName);
    }
  }, { passive: true });
})();
</script>

<script>
// Gestion de la vidéo principale - attendre la fin avant navigation
(function() {
  const mainVideo = document.getElementById('main-product-video');
  if (!mainVideo) return;
  
  let videoHasEnded = false;
  
  // Marquer quand la vidéo se termine
  mainVideo.addEventListener('ended', function() {
    videoHasEnded = true;
    console.log('Vidéo terminée, navigation autorisée');
  });
  
  // Intercepter les clics de navigation
  const navigationLinks = document.querySelectorAll('a[href]');
  navigationLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Si la vidéo joue encore et n'est pas terminée
      if (!mainVideo.ended && !mainVideo.paused && !videoHasEnded) {
        e.preventDefault();
        
        // Afficher un message ou attendre
        const confirmNavigation = confirm('La vidéo est en cours de lecture. Voulez-vous vraiment quitter cette page ?');
        if (confirmNavigation) {
          window.location.href = this.href;
        }
      }
    });
  });
  
  // Intercepter la navigation par le navigateur (bouton retour, etc.)
  window.addEventListener('beforeunload', function(e) {
    if (!mainVideo.ended && !mainVideo.paused && !videoHasEnded) {
      e.preventDefault();
      e.returnValue = 'La vidéo est en cours de lecture.';
      return 'La vidéo est en cours de lecture.';
    }
  });
})();
</script>
</body>
</html>
