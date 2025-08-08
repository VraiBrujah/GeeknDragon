<?php
$active = 'boutique';
$title  = 'Boutique | Geek & Dragon';
$metaDescription = "Achetez nos cartes et accessoires immersifs pour D&D.";
$snipcartCssVersion = filemtime(__DIR__.'/css/snipcart.css');
$extraHead = <<<HTML
<!-- Snipcart styles -->
<link rel="stylesheet" href="/css/snipcart.css?v=$snipcartCssVersion" />
<!-- Snipcart script is loaded asynchronously below in the body to avoid blocking the page -->
<style>
  .card{@apply bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col;}
  .oos{@apply bg-gray-700 text-gray-400 cursor-not-allowed;}
  .snipcart-modal__container{background:#1f2937!important;}
  .snipcart .snipcart-button-primary{background-image:linear-gradient(to right,#4f46e5,#7c3aed)!important;border:none;}
  .snipcart .snipcart-button-primary:hover{background-image:linear-gradient(to right,#6366f1,#8b5cf6)!important;}
</style>
HTML;

/* ───── STOCK ───── */
$stock    = json_decode(file_get_contents(__DIR__ . '/stock.json'), true) ?? [];
$snipcartKey = getenv('SNIPCART_API_KEY');
function inStock(string $id): bool
{
    global $stock;
    return !isset($stock[$id]) || $stock[$id] > 0;      // true si illimité ou quantité > 0
}

// Liste des produits
$products = [
    [
        'id' => 'lot10',
        'name' => 'Lot de 10<br>L’Offrande du Vagabond',
        'price' => 60,
        'img' => 'images/Piece/pro/p10.png',
        'desc' => '10 pièces gravées (2 de chaque métal), parfaites pour vos premières quêtes.',
        'url' => 'lot10.php?from=pieces',
        'multiplier' => true,
    ],
    [
        'id' => 'lot25',
        'name' => 'Lot de 25<br>La Monnaie des Royaumes',
        'price' => 145,
        'img' => 'images/Piece/pro/p25.png',
        'desc' => '25 pièces uniques du cuivre à l’or, la bourse complète du marchand.',
        'url' => 'lot25.php?from=pieces',
        'multiplier' => false,
    ],
    [
        'id' => 'lot50-essence',
        'name' => 'Lot de 50<br>L’Essence des Royaumes',
        'price' => 275,
        'img' => 'images/Piece/pro/p50.png',
        'desc' => '50 pièces, deux de chaque type, pour ressentir la richesse royale.',
        'url' => 'lot50-essence.php?from=pieces',
        'multiplier' => false,
    ],
    [
        'id' => 'lot50-tresorerie',
        'name' => 'Lot de 50<br>La Trésorerie du Seigneur Marchand',
        'price' => 275,
        'img' => 'images/Piece/pro/p50.png',
        'desc' => '50 pièces, dix de chaque métal rare, la trésorerie du Seigneur Marchand.',
        'url' => 'lot50-tresorerie.php?from=pieces',
        'multiplier' => true,
    ],
];
?>
<!DOCTYPE html>
<html lang="fr">
<?php include 'head-common.php'; ?>

<body>
<?php include 'header.php'; ?>

<!-- Snipcart: placer le conteneur dans le body pour éviter des comportements inattendus -->
<div hidden id="snipcart"
     data-api-key="<?= htmlspecialchars($snipcartKey ?? '') ?>"
     data-config-add-product-behavior="overlay"
     data-config-locales="fr,en"
     data-config-language="fr">
</div>
<?php if (!$snipcartKey): ?>
<p class="text-red-500 text-center">SNIPCART_API_KEY missing</p>
<?php endif; ?>
<script>
  const lang = localStorage.getItem('snipcartLanguage') || 'fr';
  document.getElementById('snipcart').setAttribute('data-config-language', lang);
</script>
<script async src="/js/snipcart.js?v=<?= filemtime(__DIR__.'/js/snipcart.js') ?>"></script>

<main class="pt-24 md:pt-32">

  <!-- ===== Bannière d'ouverture ===== -->
  <section class="relative min-h-[24rem] md:min-h-[32rem]">
    <img src="images/banner_luxe_coins.jpg" alt="" class="absolute inset-0 w-full h-full object-cover" loading="eager">
    <div class="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center px-4">
      <h2 class="text-center text-4xl md:text-5xl font-extrabold mb-4">Entrez dans la légende</h2>
        <p class="text-lg md:text-xl max-w-2xl mx-auto mb-6 txt-court">Des pièces et cartes d'équipement plus luxueuses qu'une figurine de dragon à 300 $ : utilisées à chaque session et conçues au&nbsp;Québec.</p>
      <a href="#pieces" class="btn btn-primary">Choisir mes trésors</a>
    </div>
  </section>

  <!-- ░░░ EN-TÊTE ░░░ -->
  <section class="text-center max-w-4xl mx-auto px-6 my-16" id="pieces">
    <h2 class="text-4xl md:text-5xl font-extrabold mb-4">Boutique officielle</h2>
      <p class="text-lg md:text-xl txt-court">Objets de collection et aides de jeu artisanaux, fabriqués au&nbsp;Québec.</p>
      <p class="mt-4 txt-court">Paiement sécurisé via Snipcart
        <span class="payment-icons">
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" loading="lazy">
          <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" alt="Mastercard" loading="lazy">
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg" alt="American Express" loading="lazy">
        </span>
        &nbsp;|&nbsp; Stocks mis à jour en temps réel.
      </p>
  </section>

  <!-- ░░░ PIÈCES ░░░ -->
  <section class="py-16 bg-gray-900/80">
    <div class="max-w-6xl mx-auto px-6">
      <h3 class="text-4xl font-bold text-center mb-12">Pièces métalliques</h3>
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
        <?php foreach ($products as $product): ?>
          <?php include __DIR__ . '/partials/product-card.php'; ?>
        <?php endforeach; ?>
      </div>

      <p class="text-center mt-8 italic max-w-3xl mx-auto text-gray-300">
        Un jeu de rôle sans pièces physiques, c’est comme un Monopoly sans billets. Offrez‑vous le poids authentique du trésor.<br>
        <a href="https://www.youtube.com/watch?v=y96eAFtC4xE&t=624s" target="_blank" class="underline text-indigo-400 hover:text-indigo-300">
          Voir la démonstration en vidéo&nbsp;>
        </a>
      </p>
    </div>
  </section>

  <!-- ░░░ COFFRES SUR MESURE ░░░ -->
  <section class="py-16">
    <div class="max-w-3xl mx-auto px-6 text-center">
      <h3 class="text-4xl font-bold mb-6">Coffres sur mesure</h3>
      <a href="contact.php"><img src="images/Piece/pro/coffre.png" alt="Le coffre du mage dément" class="rounded mb-4 w-full h-124 object-cover" loading="lazy"></a>
      <p class="mb-6 text-gray-300">Besoin de plus de 50 pièces ? Des coffres personnalisés sont disponibles sur demande.</p>
      <a href="contact.php" class="btn btn-primary">Demander un devis</a>	  
    </div>
  </section>

  <!-- ░░░ CARTES ░░░ -->
  <section id="cartes" class="py-16">
    <div class="max-w-6xl mx-auto px-6">
      <h3 class="text-4xl font-bold text-center mb-12">Cartes d’équipement</h3>
      <div class="flex justify-center">
        <div class="card text-center max-w-md">
          <h4 class="text-2xl font-semibold mb-2">À venir</h4>
          <p class="text-gray-300">Nos scribes enchantent encore ces parchemins d’aventure.<br>Les cartes d’équipement forgeront leur entrée lors de la prochaine lune.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== Investissement collectif & Carte de propriété ===== -->
  <section class="py-16 bg-gray-900/80">
    <div class="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10">
      <div class="md:w-1/3">
        <img src="images/carte_propriete.png" alt="Carte de propriété" class="rounded-xl shadow-lg w-full object-cover" loading="lazy">
      </div>
      <div class="md:w-2/3 text-gray-200 space-y-4">
        <h3 class="text-3xl font-bold">Investissez ensemble, partagez l’aventure</h3>
        <p>Ne laissez pas le maître de jeu se ruiner pour votre plaisir&nbsp;: chaque joueur pourra bientôt contribuer en achetant son triptyque, ses cartes et ses pièces.</p>
        <p>À titre de comparaison, certaines figurines de dragon se vendent plus de <strong>300&nbsp;$</strong> et ne sont utilisées qu’une seule fois… nos pièces, elles, servent à chaque session et pour des années de campagne.</p>
        <p>Complétez la <em>carte de propriété</em> ci‑contre en indiquant votre nom et le nombre de pièces achetées, signez-la et remettez vos trésors au maître de jeu. À la fin de la campagne, il vous les restituera sans difficulté.</p>
      </div>
    </div>
  </section>

  <!-- ░░░ TRIPTYQUES ░░░ -->
  <section id="triptyques" class="py-16 bg-gray-900/80">
    <div class="max-w-6xl mx-auto px-6">
      <h3 class="text-4xl font-bold text-center mb-12">Triptyques de personnage</h3>
      <div class="flex justify-center">
        <div class="card text-center max-w-md">
          <h4 class="text-2xl font-semibold mb-2">À venir</h4>
          <p class="text-gray-300">Les artisans façonnent encore ces grimoires de héros.<br>Les triptyques rejoindront la boutique sous peu.</p>
        </div>
      </div>
    </div>
  </section>

</main>

<?php include 'footer.php'; ?>
  <script>window.stock = <?= json_encode($stock) ?>;</script>
  <script src="js/app.js"></script>
</body>
</html>
