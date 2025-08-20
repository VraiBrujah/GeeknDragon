<?php
// Variables attendues dans le scope : $product (array), $lang (fr|en), $translations (array)

require_once __DIR__ . '/../includes/video-utils.php';

if (!isset($product['id'])) {
    return;
}
$id = (string)$product['id'];

$name        = $lang === 'en' ? ($product['name_en'] ?? $product['name']) : $product['name'];
$desc        = $lang === 'en' ? ($product['description_en'] ?? $product['description']) : $product['description'];
$img         = $product['img'] ?? ($product['images'][0] ?? '');
$isVideo     = preg_match('/\.mp4$/i', $img);
$posterPath  = $isVideo ? generateVideoPoster($img) : null;
$url         = $product['url'] ?? ('/product.php?id=' . urlencode($id));
$price       = number_format((float)$product['price'], 2, '.', '');
$multipliers = $product['multipliers'] ?? [];
$languages   = $product['languages'] ?? [];
$customOptions = !empty($languages) ? $languages : $multipliers;
$customLabel = !empty($languages)
    ? ($translations['product']['language'] ?? ($lang === 'en' ? 'Language' : 'Langue'))
    : ($translations['product']['multiplier'] ?? ($lang === 'en' ? 'Multiplier' : 'Multiplicateur'));

static $parsedown;
$parsedown = $parsedown ?? new Parsedown();
$htmlDesc  = $parsedown->text($desc);
$isInStock = inStock($id);
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
             data-alt-fr="<?= htmlspecialchars($product['description'] ?? $desc) ?>"
             data-alt-en="<?= htmlspecialchars($product['description_en'] ?? $desc) ?>"
             class="product-media" loading="lazy">
      <?php endif; ?>
    </div>
  </a>

  <a href="<?= htmlspecialchars($url) ?>" class="block">
    <h4 class="text-center text-2xl font-semibold mb-2"
        data-name-fr="<?= htmlspecialchars($product['name']) ?>"
        data-name-en="<?= htmlspecialchars($product['name_en'] ?? $product['name']) ?>">
      <?= htmlspecialchars($name) ?>
    </h4>
  </a>

  <div class="text-center mb-4 text-gray-300 flex-grow"
     data-desc-fr="<?= htmlspecialchars($product['description'] ?? $desc) ?>"
     data-desc-en="<?= htmlspecialchars($product['description_en'] ?? $desc) ?>">
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
              data-id="<?= htmlspecialchars($id) ?>"
              data-name="<?= htmlspecialchars(strip_tags($name)) ?>"
              data-name-fr="<?= htmlspecialchars(strip_tags($product['name'])) ?>"
              data-name-en="<?= htmlspecialchars(strip_tags($product['name_en'] ?? $product['name'])) ?>"
              data-price="<?= htmlspecialchars($price) ?>"
              data-url="<?= htmlspecialchars($url) ?>"
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

    const id = btn.getAttribute('data-id');
    if (!id) return;

    const qtyEl = document.getElementById('qty-' + id);
    if (qtyEl) {
      const q = parseInt(qtyEl.textContent, 10);
      if (!isNaN(q) && q > 0) btn.setAttribute('data-quantity', String(q));
    }

    const multEl = document.getElementById('multiplier-' + id);
    if (multEl) {
      const mult = multEl.value;
      btn.setAttribute('data-custom1-value', mult);
      const lang = document.documentElement.lang;
      const baseName = lang === 'en'
        ? (btn.dataset.nameEn || btn.getAttribute('data-name'))
        : (btn.dataset.nameFr || btn.getAttribute('data-name'));
      btn.setAttribute('data-name', mult !== '1' ? baseName + ' x' + mult : baseName);
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
