<?php
$active = 'boutique';
$title  = "Lot de 25 – La Monnaie des Royaumes | Geek & Dragon";
$metaDescription = "La monnaie universelle de votre univers : 25 pièces uniques du cuivre le plus humble à l’or ancestral.";
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
              <a href="images/Piece/pro/argent/a100.png" data-fancybox="lot25">
                <img loading="lazy" src="images/Piece/pro/argent/a100.png" alt="Vue rapprochée d’une pièce du lot de 25" width="1024" height="1024" class="rounded">
              </a>
            </div>
            <div class="swiper-slide">
              <a href="images/Piece/pro/lot250Piece.jpg" data-fancybox="lot25">
                <img loading="lazy" src="images/Piece/pro/lot250Piece.jpg" alt="Vue d’ensemble du lot de 25 pièces" width="1189" height="857" class="rounded">
              </a>
            </div>
          </div>
          <div class="swiper-pagination"></div>
          <div class="swiper-button-prev" role="button" aria-label="Image précédente"></div>
          <div class="swiper-button-next" role="button" aria-label="Image suivante"></div>
          </div>
      <div class="swiper swiper-thumbs mb-6">
          <div class="swiper-wrapper">
            <div class="swiper-slide"><img loading="lazy" src="images/Piece/pro/argent/a100.png" alt="Vue rapprochée d’une pièce du lot de 25" width="100" height="100" class="rounded"></div>
            <div class="swiper-slide"><img loading="lazy" src="images/Piece/pro/lot250Piece.jpg" alt="Vue d’ensemble du lot de 25 pièces" width="100" height="100" class="rounded"></div>
          </div>
      </div>
      <h1 class="text-3xl font-bold mb-4 text-center">Lot de 25<br>La Monnaie des Royaumes</h1>
      <p class="mb-6 text-gray-300 text-center">Votre univers prend vie entre vos doigts. Ce coffret rassemble vingt‑cinq pièces toutes différentes, du cuivre le plus humble à l’or ancestral. Offrez à vos joueurs l’expérience d’une bourse complète digne d’un marchand itinérant.</p>
      <?php if(inStock('lot25')): ?>
      <div class="quantity-selector justify-center mx-auto mb-4" data-id="lot25">
        <button type="button" class="quantity-btn minus" data-target="lot25">−</button>
        <span class="qty-value" id="qty-lot25">1</span>
        <button type="button" class="quantity-btn plus" data-target="lot25">+</button>
      </div>
      <button class="snipcart-add-item btn btn-shop mx-auto block"
              data-item-id="lot25" data-item-name="Lot de 25 – La Monnaie des Royaumes"
              data-item-price="145" data-item-url="lot25.php"
              data-item-description="Coffret de 25 pièces différentes, pour ressentir la monnaie des royaumes entre vos doigts."
              data-item-quantity="1">
        Ajouter — 145 $
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
<script src="js/app.js"></script>
</body>
</html>
