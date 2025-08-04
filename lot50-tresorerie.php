<?php
$active = 'boutique';
$title  = "Lot de 50 – La Trésorerie du Seigneur Marchand | Geek & Dragon";
$metaDescription = "10 pièces de chaque métal, multiplicateur au choix.";
$extraHead = <<<HTML
<!-- Snipcart styles -->
<link rel="stylesheet" href="https://cdn.snipcart.com/themes/v3.4.0/default/snipcart.css" />
<style>
  body{background:url('images/bg_texture.jpg') center/cover fixed;color:#e5e7eb;}
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
     data-config-add-product-behavior="overlay"></div>
<?php if (!$snipcartKey): ?>
<p class="text-red-500 text-center">SNIPCART_API_KEY missing</p>
<?php endif; ?>
<script async src="https://cdn.snipcart.com/themes/v3.4.0/default/snipcart.js"></script>

<main class="pt-32 pb-20">
  <section class="max-w-md mx-auto px-6">
    <a href="boutique.php#<?= htmlspecialchars($from) ?>" class="btn btn-outline mb-6 block mx-auto">&larr; Retour à la boutique</a>
    <div class="card">
      <div class="swiper mb-6">
          <div class="swiper-wrapper">
            <div class="swiper-slide">
              <a href="images/Piece/pro/argent/a10000.png" data-fancybox="lot50-tresorerie">
                <img loading="lazy" src="images/Piece/pro/argent/a10000.png" alt="Vue rapprochée d’une pièce du lot de 50 Trésorerie" width="1024" height="1024" class="rounded">
              </a>
            </div>
            <div class="swiper-slide">
              <a href="images/Piece/pro/lot100Piece.jpg" data-fancybox="lot50-tresorerie">
                <img loading="lazy" src="images/Piece/pro/lot100Piece.jpg" alt="Vue d’ensemble du lot de 50 pièces Trésorerie" width="1222" height="915" class="rounded">
              </a>
            </div>
          </div>
          <div class="swiper-pagination"></div>
          <div class="swiper-button-prev" role="button" aria-label="Image précédente"></div>
          <div class="swiper-button-next" role="button" aria-label="Image suivante"></div>
          </div>
      <div class="swiper swiper-thumbs mb-6">
          <div class="swiper-wrapper">
            <div class="swiper-slide"><img loading="lazy" src="images/Piece/pro/argent/a10000.png" alt="Vue rapprochée d’une pièce du lot de 50 Trésorerie" width="100" height="100" class="rounded"></div>
            <div class="swiper-slide"><img loading="lazy" src="images/Piece/pro/lot100Piece.jpg" alt="Vue d’ensemble du lot de 50 pièces Trésorerie" width="100" height="100" class="rounded"></div>
          </div>
      </div>
      <h1 class="text-3xl font-bold mb-4 text-center">Lot de 50<br>La Trésorerie du Seigneur Marchand</h1>
      <p class="mb-6 text-gray-300 text-center">10 pièces de chaque métal, multiplicateur au choix.</p>
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
              data-item-description="10 pièces de chaque métal, multiplicateur au choix"
              data-item-quantity="1"
              data-item-custom1-name="Multiplicateur"
              data-item-custom1-options="1|10|100|1000|10000"
              data-item-custom1-value="1">
        Ajouter — 275 $
      </button>
      <?php else: ?><span class="btn btn-shop" disabled>Rupture de stock</span><?php endif; ?>
    </div>
  </section>
</main>

<?php include 'footer.php'; ?>
<script src="js/app.js"></script>
</body>
</html>
