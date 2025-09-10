<?php
// Variables attendues dans $viewData : 'product' (array), 'lang' (fr|en), 'translations' (array), 'inventoryService'

require_once __DIR__ . '/../includes/video-utils.php';

if (!isset($viewData['product']['id'])) {
    return;
}
$id = (string)$viewData['product']['id'];

$name        = $viewData['lang'] === 'en'
    ? ($viewData['product']['name_en'] ?? $viewData['product']['name'])
    : $viewData['product']['name'];
$desc        = $viewData['lang'] === 'en'
    ? ($viewData['product']['description_en'] ?? $viewData['product']['description'])
    : $viewData['product']['description'];
$img         = $viewData['product']['img'] ?? ($viewData['product']['images'][0] ?? '');
$isVideo     = preg_match('/\.mp4$/i', $img);
$posterPath  = $isVideo ? generateVideoPoster($img) : null;
$url         = $viewData['product']['url'] ?? ('/product.php?id=' . urlencode($id));
$price       = number_format((float)$viewData['product']['price'], 2, '.', '');
$multipliers = $viewData['product']['multipliers'] ?? [];
$languages   = $viewData['product']['languages'] ?? [];
$customOptions = !empty($languages) ? $languages : $multipliers;
$customLabel = !empty($languages)
    ? ($viewData['translations']['product']['language'] ?? ($viewData['lang'] === 'en' ? 'Language' : 'Langue'))
    : ($viewData['translations']['product']['multiplier'] ?? ($viewData['lang'] === 'en' ? 'Multiplier' : 'Multiplicateur'));

static $parsedown;
$parsedown = $parsedown ?? new Parsedown();
$htmlDesc  = $parsedown->text($desc);
$isInStock = $viewData['inventoryService']->isInStock($id);
?>

<div class="card h-full flex flex-col bg-gray-800 p-4 rounded-xl shadow
            min-w-[21rem] sm:min-w-[22rem] md:min-w-[23rem] <?= $isInStock ? '' : 'oos' ?>">
  <a href="<?= htmlspecialchars($url) ?>" class="block">
    <div class="product-media-wrapper mb-4">
      <?php if ($isVideo) : ?>
        <video data-src="/<?= ltrim(htmlspecialchars($img), '/') ?>"
               <?php if ($posterPath) : ?>poster="<?= htmlspecialchars($posterPath) ?>"<?php endif; ?>
               class="product-media lazy-video" muted loop playsinline preload="metadata"></video>
      <?php else : ?>
        <img src="/<?= ltrim(htmlspecialchars($img), '/') ?>"
             alt="<?= htmlspecialchars($desc) ?>"
             data-alt-fr="<?= htmlspecialchars($viewData['product']['description'] ?? $desc) ?>"
             data-alt-en="<?= htmlspecialchars($viewData['product']['description_en'] ?? $desc) ?>"
             class="product-media" loading="lazy">
      <?php endif; ?>
    </div>
  </a>

  <a href="<?= htmlspecialchars($url) ?>" class="block">
    <h4 class="text-center text-2xl font-semibold mb-2"
        data-name-fr="<?= htmlspecialchars($viewData['product']['name']) ?>"
        data-name-en="<?= htmlspecialchars($viewData['product']['name_en'] ?? $viewData['product']['name']) ?>">
      <?= htmlspecialchars($name) ?>
    </h4>
  </a>

  <div class="text-center mb-4 text-gray-300 flex-grow"
     data-desc-fr="<?= htmlspecialchars($viewData['product']['description'] ?? $desc) ?>"
     data-desc-en="<?= htmlspecialchars($viewData['product']['description_en'] ?? $desc) ?>">
    <?= $htmlDesc ?>
  </div>




  <div class="mt-auto w-full flex flex-col items-center gap-4">
    <?php if ($isInStock) : ?>
      <!-- Bloc quantité -->
      <div class="flex flex-col items-center">
        <label class="mb-2 text-center" data-i18n="product.quantity">Quantité</label>
        <div class="quantity-selector mx-auto text-center" data-id="<?= htmlspecialchars($id) ?>">
          <button type="button" class="quantity-btn minus" data-target="<?= htmlspecialchars($id) ?>">−</button>
          <span class="qty-value" id="qty-<?= htmlspecialchars($id) ?>">1</span>
          <button type="button" class="quantity-btn plus" data-target="<?= htmlspecialchars($id) ?>">+</button>
        </div>
      </div>

      <!-- Bouton ajouter -->
      <button class="gd-add-to-cart btn btn-shop px-6 whitespace-nowrap"
              data-product-id="<?= htmlspecialchars($id) ?>"
              data-quantity="1">
        <span data-i18n="product.add">Ajouter au sac</span>
      </button>
    <?php else : ?>
      <span class="btn btn-shop opacity-60 cursor-not-allowed" data-i18n="product.outOfStock">Rupture de stock</span>
    <?php endif; ?>
  </div>
</div>

<!-- Patch local pour quantités et lazy-loading vidéos -->
<script>
(function(){
  if (window.__gdQtyPatch) return;
  window.__gdQtyPatch = true;

  // Gestion des clics pour les quantités
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.gd-add-to-cart');
    if (!btn) return;
    const id = btn.getAttribute('data-product-id');
    if (!id) return;

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
})();
</script>
