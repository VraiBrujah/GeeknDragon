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

// CSS moderne optimisé pour la galerie
$extraHead = '
<link rel="stylesheet" href="/css/product-gallery-modern.css?v=' . filemtime(__DIR__.'/css/product-gallery-modern.css') . '">
<link rel="preload" href="/css/product-gallery-modern.css" as="style">
<style>
  /* CSS critique inline pour above-the-fold */
  .product-gallery { 
    display: flex; 
    flex-direction: column; 
    gap: 1rem; 
    margin-bottom: 1.5rem; 
  }
  .main-media-container { 
    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); 
    border-radius: 0.75rem; 
    overflow: hidden; 
  }
  .media-viewport { 
    aspect-ratio: 4 / 3; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
  }
  .main-media { 
    width: 100%; 
    height: 100%; 
    object-fit: contain; 
  }
</style>';
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang) ?>">
<?php include 'head-common.php'; ?>
<body>
<?php
$snipcartLanguage = $lang;
$snipcartLocales = 'fr,en';
$snipcartAddProductBehavior = 'overlay';
ob_start();
include 'snipcart-init.php';
$snipcartInit = ob_get_clean();
include 'header.php';
echo $snipcartInit;
?>
<main id="main" class="py-10 pt-[calc(var(--header-height)+2rem)] main-product">
  <section class="max-w-4xl w-full mx-auto px-6">
    <div class="flex justify-center mb-8">
      <a href="boutique.php#<?= htmlspecialchars($from) ?>" class="btn btn-outline">&larr;
        <span data-i18n="product.back">Retour à la boutique</span>
      </a>
    </div>

    <div class="bg-gray-800 p-6 rounded-xl shadow-lg product-panel">
      <?php if (!empty($images)) : ?>
        <!-- Galerie produit optimisée avec lazy loading et progressive enhancement -->
        <div class="product-gallery" data-gallery="product-media">
          <!-- Conteneur média principal avec amélioration progressive -->
          <div class="main-media-container">
            <?php 
            $firstImage = $images[0]; 
            $isFirstVideo = preg_match('/\.(mp4|webm|mov)$/i', $firstImage);
            ?>
            <div class="media-viewport" role="img" aria-label="<?= htmlspecialchars('Média principal : ' . strip_tags($productName)) ?>">
              <?php if ($isFirstVideo) : ?>
                <video 
                  id="main-video"
                  class="main-media" 
                  data-src="<?= htmlspecialchars($firstImage) ?>"
                  muted 
                  playsinline 
                  preload="metadata"
                  poster="<?= htmlspecialchars(str_replace(['.mp4', '.webm', '.mov'], '.jpg', $firstImage)) ?>"
                  aria-label="<?= htmlspecialchars('Vidéo : ' . strip_tags($productName)) ?>">
                  <source data-src="<?= htmlspecialchars($firstImage) ?>" type="video/<?= pathinfo($firstImage, PATHINFO_EXTENSION) ?>">
                  <p>Votre navigateur ne supporte pas la lecture vidéo. <a href="<?= htmlspecialchars($firstImage) ?>">Télécharger la vidéo</a></p>
                </video>
              <?php else : ?>
                <img 
                  id="main-image"
                  class="main-media" 
                  data-src="<?= htmlspecialchars($firstImage) ?>"
                  alt="<?= htmlspecialchars('Geek & Dragon – ' . strip_tags($productName)) ?>"
                  loading="eager"
                  decoding="async"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw">
                <noscript>
                  <img src="<?= htmlspecialchars($firstImage) ?>" alt="<?= htmlspecialchars('Geek & Dragon – ' . strip_tags($productName)) ?>">
                </noscript>
              <?php endif; ?>
            </div>
          </div>
          
          <!-- Navigation thumbnails avec clavier -->
          <?php if (count($images) > 1) : ?>
            <nav class="thumbnails-nav" role="tablist" aria-label="Galerie de médias">
              <div class="thumbnails-track">
                <?php foreach ($images as $index => $img) : ?>
                  <?php 
                  $isVideo = preg_match('/\.(mp4|webm|mov)$/i', $img);
                  $mediaType = $isVideo ? 'video' : 'image';
                  ?>
                  <button 
                    type="button"
                    class="thumbnail-btn <?= $index === 0 ? 'active' : '' ?>"
                    data-index="<?= $index ?>"
                    data-media-src="<?= htmlspecialchars($img) ?>"
                    data-media-type="<?= $mediaType ?>"
                    role="tab"
                    aria-selected="<?= $index === 0 ? 'true' : 'false' ?>"
                    aria-controls="main-media"
                    aria-label="<?= htmlspecialchars(($isVideo ? 'Vidéo' : 'Image') . ' ' . ($index + 1) . ' de ' . count($images)) ?>">
                    
                    <?php if ($isVideo) : ?>
                      <video 
                        class="thumbnail-media" 
                        data-src="<?= htmlspecialchars($img) ?>"
                        muted 
                        preload="none"
                        poster="<?= htmlspecialchars(str_replace(['.mp4', '.webm', '.mov'], '.jpg', $img)) ?>">
                      </video>
                      <span class="media-type-icon" aria-hidden="true">▶</span>
                    <?php else : ?>
                      <img 
                        class="thumbnail-media" 
                        data-src="<?= htmlspecialchars($img) ?>"
                        alt="<?= htmlspecialchars('Miniature ' . ($index + 1) . ' - ' . strip_tags($productName)) ?>"
                        loading="lazy"
                        decoding="async">
                    <?php endif; ?>
                  </button>
                <?php endforeach; ?>
              </div>
              
              <!-- Indicateur de position -->
              <div class="gallery-indicator" aria-live="polite" aria-atomic="true">
                <span class="current-index">1</span> / <span class="total-count"><?= count($images) ?></span>
              </div>
            </nav>
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

        <button class="snipcart-add-item btn btn-shop"
            data-item-id="<?= htmlspecialchars($id) ?>"
            data-item-name="<?= htmlspecialchars(strip_tags($productName)) ?>"
            data-item-name-fr="<?= htmlspecialchars(strip_tags($product['name'])) ?>"
            data-item-name-en="<?= htmlspecialchars(strip_tags($product['name_en'] ?? $product['name'])) ?>"
            data-item-price="<?= htmlspecialchars(number_format((float)$product['price'], 2, '.', '')) ?>"
            data-item-url="<?= htmlspecialchars($metaUrl) ?>"
            data-item-quantity="1"
            <?php if (!empty($customOptions)) : ?>
            data-item-custom1-name="<?= htmlspecialchars($customLabel) ?>"
            data-item-custom1-options="<?= htmlspecialchars(implode('|', array_map('strval', $customOptions))) ?>"
            data-item-custom1-value="<?= htmlspecialchars((string)$customOptions[0]) ?>"
          <?php endif; ?>
        >
          <span data-i18n="product.add">Ajouter</span>
        </button>
      <?php else : ?>
        <span class="btn btn-shop opacity-60 cursor-not-allowed" disabled data-i18n="product.outOfStock">Rupture de stock</span>
      <?php endif; ?>

      <p class="mt-4 text-center txt-court">
        <span data-i18n="product.securePayment">Paiement sécurisé via Snipcart</span>
        <span class="payment-icons inline-flex gap-2 align-middle ml-2">
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

<!-- Gestionnaire de galerie produit moderne -->
<script>
/**
 * Gestionnaire de galerie produit optimisé
 * Inspiré de initVideoManager avec amélioration progressive et accessibilité
 */
(() => {
  'use strict';
  
  // Utilitaires légers
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  
  // Configuration responsive et accessibilité
  const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IS_TOUCH_DEVICE = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  /**
   * Gestionnaire de galerie produit
   */
  function initProductGallery() {
    const gallery = qs('.product-gallery[data-gallery="product-media"]');
    if (!gallery) return;
    
    const mainMediaContainer = qs('.media-viewport', gallery);
    const thumbnailButtons = qsa('.thumbnail-btn', gallery);
    const indicator = qs('.gallery-indicator', gallery);
    
    if (!mainMediaContainer || thumbnailButtons.length === 0) return;
    
    let currentIndex = 0;
    let isLoading = false;
    
    // État de la galerie
    const state = {
      currentMedia: null,
      mediaCache: new Map(),
      intersectionObserver: null,
      keyboardEnabled: true
    };
    
    /**
     * Initialisation avec lazy loading intelligent
     */
    function init() {
      // Charger le média principal immédiatement
      loadMainMedia(currentIndex);
      
      // Configurer les événements
      setupEventListeners();
      
      // Initialiser l'observation intersection pour les thumbnails
      setupIntersectionObserver();
      
      // Précharger le média suivant
      if (thumbnailButtons.length > 1) {
        requestIdleCallback(() => preloadNextMedia(currentIndex + 1));
      }
    }
    
    /**
     * Configuration des événements
     */
    function setupEventListeners() {
      // Navigation par thumbnails
      thumbnailButtons.forEach((btn, index) => {
        // Click/Touch
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          if (!isLoading) switchToMedia(index);
        });
        
        // Clavier (accessibilité)
        btn.addEventListener('keydown', (e) => {
          handleKeyboardNavigation(e, index);
        });
        
        // Focus management
        btn.addEventListener('focus', () => {
          if (!PREFERS_REDUCED_MOTION) {
            btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        });
      });
      
      // Navigation clavier globale
      gallery.addEventListener('keydown', handleGlobalKeyboard);
      
      // Gestion du redimensionnement
      const resizeObserver = new ResizeObserver(debounce(handleResize, 150));
      resizeObserver.observe(mainMediaContainer);
    }
    
    /**
     * Navigation clavier
     */
    function handleKeyboardNavigation(e, index) {
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (!isLoading) switchToMedia(index);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigateToIndex(Math.max(0, currentIndex - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateToIndex(Math.min(thumbnailButtons.length - 1, currentIndex + 1));
          break;
        case 'Home':
          e.preventDefault();
          navigateToIndex(0);
          break;
        case 'End':
          e.preventDefault();
          navigateToIndex(thumbnailButtons.length - 1);
          break;
      }
    }
    
    /**
     * Navigation clavier globale
     */
    function handleGlobalKeyboard(e) {
      if (!state.keyboardEnabled) return;
      
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const direction = e.key === 'ArrowLeft' ? -1 : 1;
        const newIndex = Math.max(0, Math.min(thumbnailButtons.length - 1, currentIndex + direction));
        if (newIndex !== currentIndex) {
          e.preventDefault();
          navigateToIndex(newIndex);
        }
      }
    }
    
    /**
     * Navigation vers un index spécifique
     */
    function navigateToIndex(index) {
      if (index >= 0 && index < thumbnailButtons.length && index !== currentIndex) {
        switchToMedia(index);
        thumbnailButtons[index].focus();
      }
    }
    
    /**
     * Basculer vers un média
     */
    async function switchToMedia(index) {
      if (isLoading || index === currentIndex) return;
      
      isLoading = true;
      const button = thumbnailButtons[index];
      const mediaSrc = button.dataset.mediaSrc;
      const mediaType = button.dataset.mediaType;
      
      try {
        // Mise à jour de l'état visuel
        updateActiveStates(index);
        
        // Chargement du nouveau média
        await loadMainMedia(index);
        
        // Mise à jour de l'indicateur
        updateIndicator(index);
        
        // Préchargement du suivant
        preloadNextMedia(index + 1);
        
        currentIndex = index;
        
      } catch (error) {
        console.warn('Erreur lors du changement de média:', error);
        // Fallback gracieux
        showMediaError();
      } finally {
        isLoading = false;
      }
    }
    
    /**
     * Chargement du média principal
     */
    function loadMainMedia(index) {
      return new Promise((resolve, reject) => {
        const button = thumbnailButtons[index];
        const mediaSrc = button.dataset.mediaSrc;
        const mediaType = button.dataset.mediaType;
        
        // Vérifier le cache
        if (state.mediaCache.has(mediaSrc)) {
          const cachedElement = state.mediaCache.get(mediaSrc);
          replaceMainMedia(cachedElement.cloneNode(true));
          resolve();
          return;
        }
        
        if (mediaType === 'video') {
          loadVideo(mediaSrc).then(resolve).catch(reject);
        } else {
          loadImage(mediaSrc).then(resolve).catch(reject);
        }
      });
    }
    
    /**
     * Chargement d'image avec optimisations
     */
    function loadImage(src) {
      return new Promise((resolve, reject) => {
        const img = document.createElement('img');
        img.className = 'main-media';
        img.alt = `Geek & Dragon – ${document.querySelector('h1')?.textContent || 'Produit'}`;
        img.loading = 'eager';
        img.decoding = 'async';
        img.sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
        
        img.onload = () => {
          state.mediaCache.set(src, img);
          replaceMainMedia(img);
          resolve();
        };
        
        img.onerror = () => {
          reject(new Error(`Impossible de charger l'image: ${src}`));
        };
        
        img.src = src;
      });
    }
    
    /**
     * Chargement de vidéo avec optimisations
     */
    function loadVideo(src) {
      return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.className = 'main-media';
        video.muted = true;
        video.playsInline = true;
        video.controls = true;
        video.preload = 'metadata';
        video.setAttribute('aria-label', `Vidéo : ${document.querySelector('h1')?.textContent || 'Produit'}`);
        
        // Poster si disponible
        const posterSrc = src.replace(/\.(mp4|webm|mov)$/i, '.jpg');
        video.poster = posterSrc;
        
        video.onloadedmetadata = () => {
          state.mediaCache.set(src, video);
          replaceMainMedia(video);
          resolve();
        };
        
        video.onerror = () => {
          reject(new Error(`Impossible de charger la vidéo: ${src}`));
        };
        
        video.src = src;
      });
    }
    
    /**
     * Remplacement du média principal
     */
    function replaceMainMedia(newElement) {
      const currentMedia = qs('.main-media', mainMediaContainer);
      
      if (!PREFERS_REDUCED_MOTION) {
        // Animation de transition fluide
        newElement.style.opacity = '0';
        newElement.style.transform = 'scale(0.95)';
      }
      
      if (currentMedia) {
        mainMediaContainer.replaceChild(newElement, currentMedia);
      } else {
        mainMediaContainer.appendChild(newElement);
      }
      
      if (!PREFERS_REDUCED_MOTION) {
        // Animation d'entrée
        requestAnimationFrame(() => {
          newElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          newElement.style.opacity = '1';
          newElement.style.transform = 'scale(1)';
        });
      }
      
      state.currentMedia = newElement;
    }
    
    /**
     * Mise à jour des états actifs
     */
    function updateActiveStates(index) {
      thumbnailButtons.forEach((btn, i) => {
        const isActive = i === index;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive.toString());
      });
    }
    
    /**
     * Mise à jour de l'indicateur
     */
    function updateIndicator(index) {
      if (indicator) {
        const currentSpan = qs('.current-index', indicator);
        if (currentSpan) {
          currentSpan.textContent = (index + 1).toString();
        }
      }
    }
    
    /**
     * Préchargement du média suivant
     */
    function preloadNextMedia(index) {
      if (index >= thumbnailButtons.length || state.mediaCache.size >= 3) return;
      
      requestIdleCallback(() => {
        const button = thumbnailButtons[index];
        if (!button) return;
        
        const mediaSrc = button.dataset.mediaSrc;
        const mediaType = button.dataset.mediaType;
        
        if (state.mediaCache.has(mediaSrc)) return;
        
        if (mediaType === 'image') {
          const img = new Image();
          img.src = mediaSrc;
          img.onload = () => state.mediaCache.set(mediaSrc, img);
        }
      });
    }
    
    /**
     * Configuration de l'intersection observer pour les thumbnails
     */
    function setupIntersectionObserver() {
      const thumbnailsTrack = qs('.thumbnails-track', gallery);
      if (!thumbnailsTrack) return;
      
      state.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const thumbnail = qs('.thumbnail-media', entry.target);
          if (entry.isIntersecting && thumbnail && !thumbnail.src && thumbnail.dataset.src) {
            thumbnail.src = thumbnail.dataset.src;
          }
        });
      }, { 
        rootMargin: '50px',
        threshold: 0.1 
      });
      
      thumbnailButtons.forEach(btn => {
        state.intersectionObserver.observe(btn);
      });
    }
    
    /**
     * Gestion du redimensionnement
     */
    function handleResize() {
      // Réajustement responsive si nécessaire
      if (state.currentMedia && state.currentMedia.tagName === 'IMG') {
        state.currentMedia.sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
      }
    }
    
    /**
     * Affichage d'erreur
     */
    function showMediaError() {
      const errorElement = document.createElement('div');
      errorElement.className = 'media-error';
      errorElement.innerHTML = `
        <p>Impossible de charger ce média.</p>
        <button onclick="location.reload()">Réessayer</button>
      `;
      replaceMainMedia(errorElement);
    }
    
    /**
     * Fonction utilitaire debounce
     */
    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
    
    // Initialisation
    init();
    
    // Cleanup au déchargement
    window.addEventListener('beforeunload', () => {
      if (state.intersectionObserver) {
        state.intersectionObserver.disconnect();
      }
    });
  }
  
  // Initialisation when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductGallery);
  } else {
    initProductGallery();
  }
})();
</script>

<!-- Patch : mettre à jour quantité & multiplicateur juste avant l'ajout -->
<script>
(function(){
  if (window.__snipcartQtyPatch) return;
  window.__snipcartQtyPatch = true;

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.snipcart-add-item');
    if (!btn) return;

    const id = btn.getAttribute('data-item-id');
    if (!id) return;

    // Quantité
    const qtyEl = document.getElementById('qty-' + id);
    if (qtyEl) {
      const q = parseInt(qtyEl.textContent, 10);
      if (!isNaN(q) && q > 0) btn.setAttribute('data-item-quantity', String(q));
    }

    // Multiplicateur (si présent)
    const multEl = document.getElementById('multiplier-' + id);
    if (multEl) {
      const mult = multEl.value;
      btn.setAttribute('data-item-custom1-value', mult);

      // Mettre à jour le nom affiché dans le panier (optionnel)
      const lang = document.documentElement.lang;
      const baseName = (lang === 'en')
        ? (btn.dataset.itemNameEn || btn.getAttribute('data-item-name'))
        : (btn.dataset.itemNameFr || btn.getAttribute('data-item-name'));
      btn.setAttribute('data-item-name', mult !== '1' ? (baseName + ' x' + mult) : baseName);
    }
  }, { passive: true });
})();
</script>
</body>
</html>
