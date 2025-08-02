<?php
$active = 'boutique';
$title  = "Lot de 10 – L’Offrande du Vagabond | Geek & Dragon";
$metaDescription = "2 pièces de chaque métal, multiplicateur au choix.";
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
    <div class="card">
      <div class="gallery flex mb-6">
        <div class="thumbnails flex flex-col">
          <img class="thumb active" loading="lazy"
               src="images/Piece/pro/lot10Piece-300.jpg"
               srcset="images/Piece/pro/lot10Piece-300.jpg 300w, images/Piece/pro/lot10Piece.jpg 1452w"
               sizes="(max-width: 640px) 48px, 64px"
               data-full="images/Piece/pro/lot10Piece.jpg"
               alt="Lot de 10 – L’Offrande du Vagabond">
        </div>
        <div class="main-image flex-1"><img id="main-img-lot10" loading="lazy"
             src="images/Piece/pro/p10.png"
             srcset="images/Piece/pro/p10-200.png 200w, images/Piece/pro/p10.png 400w"
             sizes="(max-width: 640px) 200px, 400px"
             alt="Lot de 10 – L’Offrande du Vagabond" class="rounded w-full"></div>
      </div>
      <h1 class="text-3xl font-bold mb-4 text-center">Lot de 10&nbsp;– L’Offrande du Vagabond</h1>
      <p class="mb-6 text-gray-300 text-center">2 pièces de chaque métal, multiplicateur au choix.</p>
      <?php if(inStock('lot10')): ?>
      <div class="quantity-selector justify-center mb-4" data-id="lot10">
        <button type="button" class="quantity-btn minus" data-target="lot10">−</button>
        <span class="qty-value" id="qty-lot10">1</span>
        <button type="button" class="quantity-btn plus" data-target="lot10">+</button>
      </div>
      <label for="multiplier-lot10" class="block mb-4">
        <span class="sr-only">Multiplicateur</span>
        <select id="multiplier-lot10" class="multiplier-select text-black" data-target="lot10">
          <option value="1">unitaire</option>
          <option value="10">x10</option>
          <option value="100">x100</option>
          <option value="1000">x1000</option>
          <option value="10000">x10000</option>
        </select>
      </label>
      <button class="snipcart-add-item btn btn-shop mx-auto block"
              data-item-id="lot10" data-item-name="Lot de 10 – L’Offrande du Vagabond"
              data-item-price="60" data-item-url="lot10.php"
              data-item-description="2 pièces de chaque métal, multiplicateur au choix"
              data-item-quantity="1"
              data-item-custom1-name="Multiplicateur"
              data-item-custom1-options="1|10|100|1000|10000"
              data-item-custom1-value="1">
        Ajouter — 60 $
      </button>
      <?php else: ?><span class="btn btn-shop" disabled>Rupture de stock</span><?php endif; ?>
    </div>
  </section>
</main>

<?php include 'footer.php'; ?>
</body>
</html>
