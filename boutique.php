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
        'url' => '/product.php?id=' . urlencode($id) . '&from=' . urlencode($category),
        'multipliers' => $p['multipliers'] ?? [],
        'languages' => $p['languages'] ?? [],
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
      <h2 class="shop-section-title" data-i18n="shop.pieces.title">Pièces métalliques</h2>
      <div class="products-grid">
        <?php foreach ($pieces as $product) : ?>
          <?php include __DIR__ . '/partials/product-card-premium.php'; ?>
        <?php endforeach; ?>
      </div>
      
      <div class="text-center mt-12 max-w-4xl mx-auto px-6">
        <p class="text-lg text-gray-300 mb-6">
          <span data-i18n="shop.pieces.description">Un jeu de rôle sans pièces physiques, c'est comme un Monopoly sans billets. Offrez‑vous le poids authentique du trésor.</span>
        </p>
		<h4 style=\"text-align:center\">Échelle & abréviations (5e)</h4>\n<table style=\"width:100%;border-collapse:collapse;margin:0 auto\"><thead><tr><th style=\"text-align:center\">Abrév.</th><th style=\"text-align:center\">Nom</th><th style=\"text-align:center\">Conversion</th></tr></thead><tbody><tr><td style=\"text-align:center\">pc</td><td style=\"text-align:center\">pièce de cuivre</td><td style=\"text-align:center\">10&nbsp;pc = 1&nbsp;pa</td></tr><tr><td style=\"text-align:center\">pa</td><td style=\"text-align:center\">pièce d’argent</td><td style=\"text-align:center\">10&nbsp;pa = 1&nbsp;po</td></tr><tr><td style=\"text-align:center\">pe</td><td style=\"text-align:center\">pièce d’électrum</td><td style=\"text-align:center\">1&nbsp;po = 2&nbsp;pe</td></tr><tr><td style=\"text-align:center\">po</td><td style=\"text-align:center\">pièce d’or</td><td style=\"text-align:center\">—</td></tr><tr><td style=\"text-align:center\">pp</td><td style=\"text-align:center\">pièce de platine</td><td style=\"text-align:center\">10&nbsp;po = 1&nbsp;pp</td></tr></tbody></table>
        <a href="https://www.youtube.com/watch?v=y96eAFtC4xE&t=624s" target="_blank" 
           class="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors underline decoration-2 underline-offset-4">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <span data-i18n="shop.pieces.video">Voir la démonstration en vidéo</span>
        </a>
      </div>
    </div>
  </section>

  <!-- ░░░ COFFRES SUR MESURE PREMIUM ░░░ -->
  <section class="features-section">
    <div class="max-w-6xl mx-auto px-6">
      <div class="features-grid">
        <div class="feature-card">
          <span class="feature-icon">📦</span>
          <h3 class="feature-title" data-i18n="shop.chest.title">Coffres sur mesure</h3>
          <p class="feature-description" data-i18n="shop.chest.description">Besoin de plus de 50 pièces ? Des coffres personnalisés sont disponibles sur demande.</p>
          <a href="index.php#contact" class="hero-cta mt-6" data-i18n="shop.chest.button">Demander un devis</a>
        </div>
        
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
</body>


</html>
