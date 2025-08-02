<?php
$active = 'boutique';
$title  = "Lot de 50 – L’Essence des Royaumes | Geek & Dragon";
$metaDescription = "2 pièces de chaque métal pour chaque multiplicateur.";
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
  <section class="max-w-4xl mx-auto px-6">
    <div class="card">
      <div class="gallery flex mb-6">
        <div class="thumbnails flex flex-col">
          <img class="thumb" src="images/Piece/pro/a1000.png" data-full="images/Piece/pro/a1000.png" alt="Lot de 50 – L’Essence des Royaumes">
          <img class="thumb" src="images/Piece/pro/lot50Piece.jpg" data-full="images/Piece/pro/lot50Piece.jpg" alt="Lot de 50 – L’Essence des Royaumes">
        </div>
        <div class="main-image flex-1"><img id="main-img-lot50-essence" src="images/Piece/pro/a1000.png" alt="Lot de 50 – L’Essence des Royaumes" class="rounded w-full h-64 object-cover"></div>
      </div>
      <h1 class="text-3xl font-bold mb-4 text-center">Lot de 50&nbsp;– L’Essence des Royaumes</h1>
      <p class="mb-6 text-gray-300 text-center">2 pièces de chaque métal pour chaque multiplicateur.</p>
      <?php if(inStock('lot50-essence')): ?>
      <div class="quantity-selector justify-center mb-4" data-id="lot50-essence">
        <button type="button" class="quantity-btn minus" data-target="lot50-essence">−</button>
        <span class="qty-value" id="qty-lot50-essence">1</span>
        <button type="button" class="quantity-btn plus" data-target="lot50-essence">+</button>
      </div>
      <button class="snipcart-add-item btn btn-shop mx-auto block"
              data-item-id="lot50-essence" data-item-name="Lot de 50 – L’Essence des Royaumes"
              data-item-price="275" data-item-url="lot50-essence.php"
              data-item-description="2 pièces de chaque métal pour chaque multiplicateur"
              data-item-quantity="1">
        Ajouter — 275 $
      </button>
      <?php else: ?><span class="btn btn-shop" disabled>Rupture de stock</span><?php endif; ?>
    </div>
  </section>
</main>

<?php include 'footer.php'; ?>
</body>
</html>
