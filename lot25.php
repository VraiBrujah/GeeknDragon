<?php
$active = 'boutique';
$title  = "Lot de 25 – La Monnaie des Royaumes | Geek & Dragon";
$metaDescription = "1 pièce de chaque métal pour chaque multiplicateur.";
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
      <div class="slider mb-6">
        <button class="slide-prev">❮</button>
        <div class="slide-frame">
          <img loading="lazy" src="images/Piece/pro/argent/a100.png" alt="Lot de 25 – La Monnaie des Royaumes" class="slide rounded">
          <img loading="lazy" src="images/Piece/pro/lot250Piece.jpg" alt="Lot de 25 – La Monnaie des Royaumes" class="slide rounded">
        </div>
        <button class="slide-next">❯</button>
      </div>
      <h1 class="text-3xl font-bold mb-4 text-center">Lot de 25<br>La Monnaie des Royaumes</h1>
      <p class="mb-6 text-gray-300 text-center">1 pièce de chaque métal pour chaque multiplicateur.</p>
      <?php if(inStock('lot25')): ?>
      <div class="quantity-selector justify-center mx-auto mb-4" data-id="lot25">
        <button type="button" class="quantity-btn minus" data-target="lot25">−</button>
        <span class="qty-value" id="qty-lot25">1</span>
        <button type="button" class="quantity-btn plus" data-target="lot25">+</button>
      </div>
      <button class="snipcart-add-item btn btn-shop mx-auto block"
              data-item-id="lot25" data-item-name="Lot de 25 – La Monnaie des Royaumes"
              data-item-price="145" data-item-url="lot25.php"
              data-item-description="1 pièce de chaque métal pour chaque multiplicateur"
              data-item-quantity="1">
        Ajouter — 145 $
      </button>
      <?php else: ?><span class="btn btn-shop" disabled>Rupture de stock</span><?php endif; ?>
    </div>
  </section>
</main>

<?php include 'footer.php'; ?>
<script src="js/app.js"></script>
</body>
</html>
