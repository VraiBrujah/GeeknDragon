<?php
require __DIR__ . '/bootstrap.php';
$config = require __DIR__ . '/config.php';
$active = 'boutique';
require __DIR__ . '/i18n.php';
$title  = $translations['meta']['shop']['title'] ?? 'Geek & Dragon';
$metaDescription = $translations['meta']['shop']['desc'] ?? '';
$metaUrl = 'https://' . ($_SERVER['HTTP_HOST'] ?? 'geekndragon.com') . '/boutique.php';
$extraHead = <<<HTML
<link rel="stylesheet" href="/css/boutique-premium.css?v=<?= filemtime(__DIR__.'/css/boutique-premium.css') ?>">
<style>
  .card{@apply bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col;}
  .oos{@apply bg-gray-700 text-gray-400 cursor-not-allowed;}

</style>
HTML;

/* ───── STOCK ───── */
$snipcartSecret = $config['snipcart_secret_api_key'] ?? null;
function getStock(string $id): ?int
{
    global $snipcartSecret;
    static $cache = [];
    if (isset($cache[$id])) {
        return $cache[$id];
    }
    if ($snipcartSecret) {
        $ch = curl_init('https://app.snipcart.com/api/inventory/' . urlencode($id));
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_USERPWD => $snipcartSecret . ':',
        ]);
        $res = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);
        if ($res === false || $status >= 400) {
            return $cache[$id] = null;
        }
        $inv = json_decode($res, true);
        return $cache[$id] = $inv['stock'] ?? $inv['available'] ?? null;
    }
    return $cache[$id] = null;
}
function inStock(string $id): bool
{
    $stock = getStock($id);
    return $stock === null || $stock > 0;      // true si illimité ou quantité > 0
}

// Liste des produits
$data = json_decode(file_get_contents(__DIR__ . '/data/products.json'), true) ?? [];
$pieces = [];
$cards = [];
$triptychs = [];
foreach ($data as $id => $p) {
    $category = $p['category'] ?? 'pieces';
    $prod = [
        'id' => $id,
        'name' => str_replace(' – ', '<br>', $p['name']),
        'name_en' => str_replace(' – ', '<br>', $p['name_en'] ?? $p['name']),
        'price' => $p['price'],
        'img' => $p['images'][0] ?? '',
        'description' => $p['description'],
        'description_en' => $p['description_en'] ?? $p['description'],
        'summary' => $p['summary'] ?? ($p['description'] ?? ''),
        'summary_en' => $p['summary_en'] ?? ($p['summary'] ?? ($p['description_en'] ?? $p['description'] ?? '')),
        'url' => '/product.php?id=' . urlencode($id) . '&from=' . urlencode($category),
    ];
    switch ($category) {
        case 'cards':
            $cards[] = $prod;
            break;
        case 'triptychs':
            $triptychs[] = $prod;
            break;
        default:
            $pieces[] = $prod;
            break;
    }
}
$products = array_merge($pieces, $cards, $triptychs);
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

<main id="main" class="pt-[calc(var(--header-height))]">

  <!-- ===== HERO PREMIUM ===== -->
  <section class="hero-boutique">
    <div class="hero-videos absolute inset-0 w-full h-full" style="z-index:0" data-main="videos/Fontaine12.mp4" data-videos='["videos/Carte1.mp4","videos/fontaine6.mp4","videos/trip2.mp4","videos/fontaine7.mp4","videos/cartearme.mp4","videos/fontaine8.mp4","videos/fontaine9.mp4","videos/fontaine4.mp4"]'></div>
    <div class="absolute inset-0 bg-black/60" style="z-index:1"></div>
    <div class="hero-content animate-fade-in-up" style="z-index:2">
      <h1 class="hero-title" data-i18n="shop.hero.title">Boutique Geek & Dragon</h1>
      <p class="hero-subtitle" data-i18n="shop.hero.description">Offrez à vos parties l'élégance et la durabilité de pièces et cartes d'équipement conçues au Québec, plus précieuses qu'une figurine de dragon à 300 $, laquelle ne sert qu'exceptionnellement, nos pièces sont présentes à chaque session pour des années d'aventures.</p>
      <a href="#pieces" class="hero-cta">
        <svg class="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 3h2l.4 2m0 0L8 17h8l3-8H5.4z"/>
          <circle cx="9" cy="20" r="1"/>
          <circle cx="20" cy="20" r="1"/>
        </svg>
        <span data-i18n="shop.hero.button">Choisir mes trésors</span>
      </a>
    </div>
  </section>

  <!-- ░░░ PIÈCES PREMIUM ░░░ -->
	<section id="pieces" class="shop-section scroll-mt-24">
	  <div class="max-w-7xl mx-auto">
		<h2 class="shop-section-title" data-i18n="shop.pieces.title">
		  Pièces métalliques
		</h2>


      <!-- Grille de produits -->
      <div class="products-grid">
        <?php foreach ($pieces as $product) : ?>
          <?php include __DIR__ . '/partials/product-card-premium.php'; ?>
        <?php endforeach; ?>
      </div>

      <!-- Description & appel à la vidéo -->
      <section class="mt-20 md:mt-28 max-w-4xl mx-auto px-6 py-16 text-center space-y-10 leading-relaxed bg-gradient-to-b from-gray-900 via-indigo-900 to-gray-900">
        <h2 class="text-3xl font-bold text-gray-200">Pourquoi des pièces physiques&nbsp;?</h2>
        <div class="h-0.5 w-20 bg-indigo-400 mx-auto"></div>
        <p class="text-gray-400 text-xl md:text-2xl tracking-wide">
          <span data-i18n="shop.pieces.description">
            <span class="block font-semibold text-gray-200">
              Un jeu de rôle sans pièces physiques, c’est comme un Monopoly sans billets :
              <span class="font-normal text-gray-400">ça fonctionne, mais ça perd toute sa saveur.</span>
            </span>

            <span class="block mt-6">
              Le trésor est au cœur de presque toutes les campagnes de D&D… et pourtant,
              quand il se réduit à des chiffres qu’on inscrit puis efface cent fois,
              il perd toute magie et tout impact.
            </span>

            <span class="block mt-6">
              Par souci de simplicité, on se limite presque toujours à la pièce d’or,
              oubliant la richesse des autres monnaies.
            </span>

            <span class="block mt-6">
              Avec nos pièces physiques, les calculs restent simples, mais chaque butin devient
              tangible, mémorable — digne des plus grandes quêtes.
            </span>
          </span>
        </p>

        <!-- Vidéo de présentation -->
        <div class="mt-8 flex justify-center">
          <button type="button"
                  class="group relative rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  aria-controls="video-modal"
                  aria-label="Lire la vidéo de Pierre-Louis (Es-Tu Game ?) — L'Économie de D&D 💰 Conseils Jeux de Rôle"
                  data-video-open>
            <img src="https://img.youtube.com/vi/y96eAFtC4xE/hqdefault.jpg"
                 alt="Miniature de la vidéo « L’Économie de D&D 💰 Conseils Jeux de Rôle »"
                 class="block w-full h-auto transition-transform duration-200 group-hover:scale-105 group-hover:shadow-lg">
          </button>
        </div>

        <!-- Modal vidéo -->
        <div id="video-modal"
             class="fixed inset-0 z-50 hidden bg-black/75 flex items-center justify-center"
             role="dialog" aria-modal="true"
             aria-label="Lire la vidéo « L’Économie de D&D 💰 Conseils Jeux de Rôle »">
          <div class="relative w-full max-w-screen-lg">
            <button type="button"
                    class="absolute -top-10 right-0 text-white text-4xl leading-none focus:outline-none"
                    aria-label="Fermer la vidéo"
                    data-video-close>&times;</button>
            <div class="w-full aspect-video">
              <iframe class="w-full h-full" src="https://www.youtube.com/embed/y96eAFtC4xE?start=624"
                      title="L’Économie de D&D 💰 Conseils Jeux de Rôle" allowfullscreen></iframe>
            </div>
          </div>
        </div>

        <!-- Convertisseur de monnaie -->
        <div class="mt-12 text-center" id="currency-converter">
          <h4 class="text-gray-200 mb-4" data-i18n="shop.converter.title">Convertisseur de monnaie</h4>
          <div class="max-w-md mx-auto space-y-4">
            <div>
              <label for="currency-source" class="block text-gray-200 mb-2" data-i18n="shop.converter.sourceLabel">Monnaie source</label>
              <select id="currency-source" class="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded p-2">
                <option value="copper" data-i18n="shop.converter.copper">pièce de cuivre</option>
                <option value="silver" data-i18n="shop.converter.silver">pièce d’argent</option>
                <option value="electrum" data-i18n="shop.converter.electrum">pièce d’électrum</option>
                <option value="gold" data-i18n="shop.converter.gold">pièce d’or</option>
                <option value="platinum" data-i18n="shop.converter.platinum">pièce de platine</option>
              </select>
            </div>
            <div>
              <label for="currency-amount" class="block text-gray-200 mb-2" data-i18n="shop.converter.amountLabel">Quantité</label>
              <input id="currency-amount" type="number" min="0" value="0" class="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded p-2" />
            </div>
          </div>
          <ul id="currency-results" class="mt-4 text-gray-200 space-y-1" aria-live="polite"></ul>
        </div>
      </section>

    </div>
  </section>

  <section class="features-section">
    <div class="max-w-6xl mx-auto px-6 space-y-8">
      <!-- 1) Bloc Coffres sur mesure : ligne dédiée et centré -->
      <div class="flex justify-center">
        <div class="feature-card w-full md:max-w-2xl">
          <span class="feature-icon">📦</span>
          <h3 class="feature-title" data-i18n="shop.chest.title">Coffres sur mesure</h3>
          <p class="feature-description" data-i18n="shop.chest.description">
            Besoin de plus de 50 pièces ? Des coffres personnalisés sont disponibles sur demande.
          </p>
          <a href="index.php#contact" class="hero-cta mt-6" data-i18n="shop.chest.button">Demander un devis</a>
        </div>
      </div>

      <!-- 2) Les 3 autres cartes : côte à côte -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="feature-card">
          <span class="feature-icon">🚚</span>
          <h3 class="feature-title">Livraison rapide</h3>
          <p class="feature-description">Expédition sous 48h partout au Canada avec suivi en temps réel de votre commande.</p>
        </div>

        <div class="feature-card">
          <span class="feature-icon">🔒</span>
          <h3 class="feature-title">Paiement sécurisé</h3>
          <p class="feature-description">Transactions cryptées via Snipcart. Visa, Mastercard et American Express acceptés.</p>
        </div>

        <div class="feature-card">
          <span class="feature-icon">🎯</span>
          <h3 class="feature-title">Qualité artisanale</h3>
          <p class="feature-description">Fabriqué au Québec avec des matériaux premium pour des années d'aventures.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ░░░ CARTES PREMIUM ░░░ -->
  <section id="cartes" class="shop-section scroll-mt-24">
    <div class="max-w-7xl mx-auto">
      <h2 class="shop-section-title" data-i18n="shop.cards.title">Cartes d'équipement</h2>
      <div class="products-grid">
        <?php foreach ($cards as $product) : ?>
          <?php include __DIR__ . '/partials/product-card-premium.php'; ?>
        <?php endforeach; ?>
      </div>

      <div class="text-center mt-12 max-w-4xl mx-auto px-6">
        <p class="text-lg text-gray-300">
          <span data-i18n="shop.cards.description">Paquets thématiques de cartes illustrées pour gérer l'inventaire.</span>
        </p>
      </div>
    </div>
  </section>

  <!-- ░░░ TRIPTYQUES PREMIUM ░░░ -->
  <section id="triptyques" class="shop-section">
    <div class="max-w-7xl mx-auto">
      <h2 class="shop-section-title" data-i18n="shop.triptychs.title">Triptyques de personnage</h2>
      <div class="products-grid">
        <?php foreach ($triptychs as $product) : ?>
          <?php include __DIR__ . '/partials/product-card-premium.php'; ?>
        <?php endforeach; ?>
      </div>

      <div class="text-center mt-12 max-w-4xl mx-auto px-6">
        <p class="text-lg text-gray-300">
          <span data-i18n="shop.triptychs.description">Fiches rigides en trois volets pour classes, espèces et historiques.</span>
        </p>
      </div>
    </div>
  </section>

  <!-- ===== INVESTISSEMENT COLLECTIF PREMIUM ===== -->
  <section class="features-section">
    <div class="max-w-6xl mx-auto px-6">
      <div class="flex flex-col lg:flex-row items-center gap-12">
        <div class="lg:w-1/2">
          <div class="product-card">
            <div class="product-media-container">
              <img src="images/carte_propriete.png" alt="Carte de propriété à remplir" class="product-media" loading="lazy">
            </div>
            <div class="product-content text-center">
              <h3 class="product-title" data-i18n="shop.collective.title">Investissez ensemble, partagez l'aventure</h3>
              <p class="product-description" data-i18n="shop.collective.description3">Complétez la carte de propriété en indiquant votre nom et le nombre de pièces achetées.</p>
            </div>
          </div>
        </div>

        <div class="lg:w-1/2 space-y-6">
          <div class="feature-card">
            <span class="feature-icon">💰</span>
            <h4 class="feature-title">Investissement partagé</h4>
            <p class="feature-description" data-i18n="shop.collective.description1">Ne laissez pas le maître de jeu se ruiner pour votre plaisir : chaque joueur peut contribuer en achetant son matériel.</p>
          </div>

          <div class="feature-card">
            <span class="feature-icon">⚖️</span>
            <h4 class="feature-title">Rapport qualité-prix</h4>
            <p class="feature-description" data-i18n="shop.collective.description2">Contrairement aux figurines à 300$ utilisées une fois, nos pièces servent à chaque session pour des années de campagne.</p>
          </div>

          <div class="feature-card">
            <span class="feature-icon">📋</span>
            <h4 class="feature-title">Carte de propriété</h4>
            <p class="feature-description">Système de traçabilité pour récupérer facilement vos trésors en fin de campagne.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ░░░ TRUST SECTION PREMIUM ░░░ -->
  <section class="trust-section">
    <div class="max-w-6xl mx-auto px-6">
      <h2 class="shop-section-title" data-i18n="shop.intro.title">Trésors artisanaux</h2>
      <p class="text-xl text-center mb-12 max-w-3xl mx-auto" data-i18n="shop.intro.description">Objets de collection et aides de jeu artisanaux, fabriqués au Québec.</p>

      <div class="trust-badges">
        <div class="trust-badge">
          <span class="trust-icon">🔒</span>
          <span data-i18n="shop.intro.payment">Paiement sécurisé via Snipcart</span>
        </div>

        <div class="trust-badge">
          <img src="/images/payments/visa.svg" alt="Logo Visa" class="w-8 h-6" loading="lazy">
          <img src="/images/payments/mastercard.svg" alt="Logo Mastercard" class="w-8 h-6" loading="lazy">
          <img src="/images/payments/american-express.svg" alt="Logo American Express" class="w-8 h-6" loading="lazy">
        </div>

        <div class="trust-badge">
          <span class="trust-icon">🍁</span>
          <span>Fabriqué au Québec</span>
        </div>

        <div class="trust-badge">
          <span class="trust-icon">⭐</span>
          <span>Qualité premium</span>
        </div>
      </div>
    </div>
  </section>

</main>

<?php include 'footer.php'; ?>
<script type="application/ld+json">
<?= json_encode([
    '@context' => 'https://schema.org/',
    '@graph' => array_map(function ($p) {
        return [
            '@type' => 'Product',
            'name' => strip_tags($p['name']),
            'description' => $p['description'],
            'image' => 'https://' . ($_SERVER['HTTP_HOST'] ?? 'geekndragon.com') . '/' . $p['img'],
            'sku' => $p['id'],
            'offers' => [
                '@type' => 'Offer',
                'price' => $p['price'],
                'priceCurrency' => 'CAD',
                'availability' => inStock($p['id']) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            ],
        ];
    }, $products /* merged products */),
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>
</script>
  <script src="js/app.js"></script>
  <script src="/js/hero-videos.js"></script>
  <script src="/js/boutique-premium.js?v=<?= filemtime(__DIR__.'/js/boutique-premium.js') ?>"></script>
  <script src="/js/currency-converter.js"></script>
  <script>
  document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.querySelector('[data-video-open]');
    const modal = document.getElementById('video-modal');
    if (!openBtn || !modal) return;
    const closeBtn = modal.querySelector('[data-video-close]');
    const iframe = modal.querySelector('iframe');

    const openModal = () => {
      modal.classList.remove('hidden');
      openBtn.classList.add('invisible');
      iframe.focus();
    };

    const closeModal = () => {
      modal.classList.add('hidden');
      iframe.src = iframe.src;
      openBtn.classList.remove('invisible');
      openBtn.focus();
    };

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
    });
  });
  </script>
</body>
</html>
