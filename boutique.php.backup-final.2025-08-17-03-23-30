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
require_once __DIR__ . '/includes/stock-functions.php';

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
  <div class="w-full" style="height:1px; background-color: var(--boutique-primary); margin-top:-1px;"></div>
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
          <div class="relative group rounded-lg overflow-hidden" style="width: 420px;">
            <video id="video4" 
                   src="videos/es-tu-game-demo.mp4" 
                   class="rounded shadow-lg w-full aspect-video transition-transform duration-300"
                   playsinline 
                   preload="metadata">
              Votre navigateur ne supporte pas la lecture vidéo.
            </video>
            <button class="mute-btn hidden group-hover:block absolute top-2 right-2 z-10
                           bg-black/60 text-white text-sm px-2 py-1 rounded"
                    data-video="video4">🔊</button>
            <a href="https://www.youtube.com/watch?v=y96eAFtC4xE&ab_channel=Es-TuGame%3F-JeuxDeR%C3%B4le" 
               target="_blank" 
               rel="noopener noreferrer"
               class="block text-center text-sm mt-2 text-gray-300 txt-court hover:text-indigo-400 transition-colors duration-300">
              L'Économie de D&D 💰 Conseils Jeux de Rôle
              <svg class="inline-block w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                <path d="M5 5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-2a1 1 0 10-2 0v2H5V7h2a1 1 0 000-2H5z"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Convertisseur de monnaie -->
        <div class="mt-12 text-center" id="currency-converter">
          <h4 class="text-gray-200 mb-4" data-i18n="shop.converter.title">Convertisseur de monnaie</h4>
          <div class="mx-auto">
            <p class="text-gray-200 mb-2" data-i18n="shop.converter.sourcesLabel">Monnaies sources</p>
            <table id="currency-sources" class="w-full text-gray-200">
              <thead>
                <tr>
                  <th data-i18n="shop.converter.copper">pièce de cuivre</th>
                  <th data-i18n="shop.converter.silver">pièce d’argent</th>
                  <th data-i18n="shop.converter.electrum">pièce d’électrum</th>
                  <th data-i18n="shop.converter.gold">pièce d’or</th>
                  <th data-i18n="shop.converter.platinum">pièce de platine</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="copper" class="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded p-2" />
                  </td>
                  <td>
                    <input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="silver" class="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded p-2" />
                  </td>
                  <td>
                    <input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="electrum" class="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded p-2" />
                  </td>
                  <td>
                    <input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="gold" class="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded p-2" />
                  </td>
                  <td>
                    <input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" value="0" data-currency="platinum" class="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded p-2" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div id="currency-equivalences" class="mt-4 bg-gray-900 rounded-lg p-4 text-gray-200 hidden">
            <h5 class="mb-2" data-i18n="shop.converter.equivTitle">Équivalences totales par métal</h5>
            <table id="currency-equivalences-list" class="w-full text-left text-sm">
              <thead class="bg-gray-800 text-gray-100">
                <tr>
                  <th class="font-semibold" data-i18n="shop.converter.equivMetal">Métal</th>
                  <th class="font-semibold" data-i18n="shop.converter.equivEquivalent">Équivalence</th>
                  <th class="font-semibold" data-i18n="shop.converter.remainder">Reste</th>
                  <th class="font-semibold" data-i18n="shop.converter.equivTotalPieces">Nombre total de pièces</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
          <div id="currency-best" class="mt-1 bg-gray-900 rounded-lg p-4 text-gray-200 hidden" data-i18n="shop.converter.bestLabel"></div>
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

  <!-- ░░░ INVESTISSEMENT COLLECTIF PREMIUM ░░░ -->
  <section id="collective" class="shop-section">
    <div class="max-w-6xl mx-auto px-6">
      <h2 class="shop-section-title" data-i18n="shop.collective.title">Investissez ensemble, partagez l'aventure</h2>

      <div class="flex flex-col items-center gap-12">
        <div class="features-grid">
          <div class="feature-card">
            <span class="feature-icon">💰</span>
            <h4 class="feature-title">Investissement partagé</h4>
            <p class="feature-description" data-i18n="shop.collective.description1">Ne laissez pas le maître de jeu se ruiner pour votre plaisir : chaque joueur peut contribuer en achetant son matériel.</p>
          </div>

          <div class="feature-card">
            <img src="images/carte_propriete.png" 
                 alt="Carte de propriété - Système de traçabilité" 
                 class="property-image"
                 data-gallery="features"
                 style="width: 100%; height: auto; margin: 0 auto 1rem auto; display: block;">
            <h4 class="feature-title">Carte de propriété</h4>
            <p class="feature-description">Système de traçabilité pour récupérer facilement vos trésors en fin de campagne.</p>
          </div>

          <div class="feature-card">
            <span class="feature-icon">⚖️</span>
            <h4 class="feature-title">Rapport qualité-prix</h4>
            <p class="feature-description" data-i18n="shop.collective.description2">Contrairement aux figurines à 300$ utilisées une fois, nos pièces servent à chaque session pour des années de campagne.</p>
          </div>

          <div class="feature-card">
            <span class="feature-icon">🚚</span>
            <h4 class="feature-title">Livraison rapide</h4>
            <p class="feature-description">Expédition sous 48h partout au Canada avec suivi en temps réel de votre commande.</p>
          </div>

          <div class="feature-card">
            <span class="feature-icon">🔒</span>
            <h4 class="feature-title">Paiement sécurisé</h4>
            <p class="feature-description">Transactions cryptées via Snipcart. Visa, Mastercard et American Express acceptés.</p>
          </div>

          <div class="feature-card">
            <span class="feature-icon">
              <img src="/images/logo-fabrique-BqFMdtDT.png" 
                   alt="Logo Fabriqué au Québec" 
                   class="h-8 w-auto mx-auto" 
                   loading="lazy">
            </span>
            <h4 class="feature-title">Qualité artisanale</h4>
            <p class="feature-description">Fabriqué au Québec avec des matériaux premium pour des années d'aventures.</p>
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
          <img src="/images/logo-fabrique-BqFMdtDT.png" alt="Logo Fabriqué au Québec" class="h-6 w-auto" loading="lazy">
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
</body>
</html>
