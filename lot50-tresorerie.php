<?php
$active = 'boutique';
$title  = "Lot de 50 – La Trésorerie du Seigneur Marchand | Geek & Dragon";
$metaDescription = "La richesse sans limite : 50 pièces, 10 de chaque métal rare, pour une trésorerie digne d’un Seigneur Marchand.";
$metaUrl = 'https://' . ($_SERVER['HTTP_HOST'] ?? 'geekndragon.com') . '/lot50-tresorerie.php';
$snipcartCssVersion = filemtime(__DIR__.'/css/snipcart.css');
$extraHead = <<<HTML
<!-- Snipcart styles -->
<link rel="stylesheet" href="/css/snipcart.css?v=$snipcartCssVersion" />
<style>
  .card{@apply bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col items-center;}
  .snipcart-modal__container{background:#1f2937!important;}
  .snipcart .snipcart-button-primary{background-image:linear-gradient(to right,#4f46e5,#7c3aed)!important;border:none;}
  .snipcart .snipcart-button-primary:hover{background-image:linear-gradient(to right,#6366f1,#8b5cf6)!important;}
</style>
HTML;
$stock    = json_decode(file_get_contents(__DIR__ . '/stock.json'), true) ?? [];
$snipcartKey = getenv('SNIPCART_API_KEY');
$from = preg_replace('/[^a-z0-9_-]/i', '', $_GET['from'] ?? 'pieces');
function inStock(string $id): bool
{
    global $stock;
    return !isset($stock[$id]) || $stock[$id] > 0;
}
?>
<!DOCTYPE html>
<html lang="fr">
<?php include 'head-common.php'; ?>
<body>
<?php include 'header.php'; ?>
<div hidden id="snipcart"
     data-api-key="<?= htmlspecialchars($snipcartKey ?? '') ?>"
     data-config-add-product-behavior="overlay"
     data-config-locales="fr,en"
     data-config-language="fr"></div>
<?php if (!$snipcartKey): ?>
<p class="text-red-500 text-center">SNIPCART_API_KEY missing</p>
<?php endif; ?>
<script>
  const lang = localStorage.getItem('snipcartLanguage') || 'fr';
  document.getElementById('snipcart').setAttribute('data-config-language', lang);
</script>
<script async src="/js/snipcart.js?v=<?= filemtime(__DIR__.'/js/snipcart.js') ?>"></script>

<main class="pt-32 pb-20">
  <section class="max-w-md mx-auto px-6">
    <a href="boutique.php#<?= htmlspecialchars($from) ?>" class="btn btn-outline mb-6 block mx-auto">&larr; Retour à la boutique</a>
    <div class="card">
      <div class="swiper mb-6">
          <div class="swiper-wrapper">
            <div class="swiper-slide">
              <a href="images/Piece/pro/argent/a10000.png" data-fancybox="lot50-tresorerie">
                <img loading="lazy" src="images/Piece/pro/argent/a10000.png" alt="Gros plan sur une pièce en métal rare du lot de 50 Trésorerie" width="1024" height="1024" class="rounded">
              </a>
            </div>
            <div class="swiper-slide">
              <a href="images/Piece/pro/lot100Piece.jpg" data-fancybox="lot50-tresorerie">
                <img loading="lazy" src="images/Piece/pro/lot100Piece.jpg" alt="Vue d’ensemble des 50 pièces de métaux rares" width="1222" height="915" class="rounded">
              </a>
            </div>
          </div>
          <div class="swiper-pagination"></div>
          <div class="swiper-button-prev" role="button" aria-label="Image précédente"></div>
          <div class="swiper-button-next" role="button" aria-label="Image suivante"></div>
          </div>
      <div class="swiper swiper-thumbs mb-6">
          <div class="swiper-wrapper">
            <div class="swiper-slide"><img loading="lazy" src="images/Piece/pro/argent/a10000.png" alt="Pièce en métal rare du lot de 50 Trésorerie" width="100" height="100" class="rounded"></div>
            <div class="swiper-slide"><img loading="lazy" src="images/Piece/pro/lot100Piece.jpg" alt="Vue d’ensemble des 50 pièces rares" width="100" height="100" class="rounded"></div>
          </div>
      </div>
      <h1 class="text-3xl font-bold mb-4 text-center">Lot de 50<br>La Trésorerie du Seigneur Marchand</h1>
      <p class="mb-6 text-gray-300 text-center">Une fortune digne d’un magnat des guildes. Avec dix pièces de chacun des métaux rares, ce lot prestigieux propulse vos campagnes dans une opulence assumée.</p>
      <?php if(inStock('lot50-tresorerie')): ?>
      <div class="quantity-selector justify-center mx-auto mb-4" data-id="lot50-tresorerie">
        <button type="button" class="quantity-btn minus" data-target="lot50-tresorerie">−</button>
        <span class="qty-value" id="qty-lot50-tresorerie">1</span>
        <button type="button" class="quantity-btn plus" data-target="lot50-tresorerie">+</button>
      </div>
      <label for="multiplier-lot50-tresorerie" class="block mb-4 text-center">
        <span class="sr-only">Multiplicateur</span>
        <select id="multiplier-lot50-tresorerie" class="multiplier-select text-black" data-target="lot50-tresorerie">
          <option value="1">unitaire</option>
          <option value="10">x10</option>
          <option value="100">x100</option>
          <option value="1000">x1000</option>
          <option value="10000">x10000</option>
        </select>
      </label>
      <button class="snipcart-add-item btn btn-shop mx-auto block"
              data-item-id="lot50-tresorerie" data-item-name="Lot de 50 – La Trésorerie du Seigneur Marchand"
              data-item-price="275" data-item-url="lot50-tresorerie.php"
              data-item-description="50 pièces (10 de chaque métal rare), la trésorerie ultime pour une opulence assumée."
              data-item-quantity="1"
              data-item-custom1-name="Multiplicateur"
              data-item-custom1-options="1|10|100|1000|10000"
              data-item-custom1-value="1">
        Ajouter — 275 $
      </button>
      <?php else: ?><span class="btn btn-shop" disabled>Rupture de stock</span><?php endif; ?>
      <p class="mt-4 text-center txt-court">Paiement sécurisé via Snipcart
        <span class="payment-icons">
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa">
          <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" alt="Mastercard">
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg" alt="American Express">
        </span>
        &nbsp;|&nbsp; Stocks mis à jour en temps réel.
      </p>
    </div>
  </section>

  <section class="max-w-md mx-auto px-6 mt-12">
    <h2 class="text-2xl font-bold mb-4 text-center">Témoignages</h2>
    <div class="card mb-4">
      <blockquote class="italic mb-2">« Ces pièces ajoutent une immersion incroyable à nos parties de JDR. »</blockquote>
      <p class="text-sm text-gray-300">— Rôliste TV</p>
    </div>
    <div class="card">
      <p class="mb-2">Plus d'avis sur <a href="https://www.trictrac.net/" class="underline" target="_blank" rel="noopener">Tric Trac</a>.</p>
    </div>
  </section>
</main>

<?php include 'footer.php'; ?>
<script type="application/ld+json">
<?= json_encode([
    '@context' => 'https://schema.org/',
    '@type' => 'Product',
    'name' => 'Lot de 50 – La Trésorerie du Seigneur Marchand',
    'description' => 'La richesse sans limite : 50 pièces, 10 de chaque métal rare, pour une trésorerie digne d’un Seigneur Marchand.',
    'image' => 'https://' . ($_SERVER['HTTP_HOST'] ?? 'geekndragon.com') . '/images/Piece/pro/argent/a10000.png',
    'sku' => 'lot50-tresorerie',
    'offers' => [
        '@type' => 'Offer',
        'price' => 275,
        'priceCurrency' => 'CAD',
        'availability' => inStock('lot50-tresorerie') ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    ],
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>
</script>
<script src="js/app.js"></script>
</body>
</html>
