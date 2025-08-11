<?php
require __DIR__ . '/bootstrap.php';
$config = require __DIR__ . '/config.php';
$active = 'boutique';
require __DIR__ . '/i18n.php';
$title  = $translations['meta']['shop']['title'] ?? 'Geek & Dragon';
$metaDescription = $translations['meta']['shop']['desc'] ?? '';
$metaUrl = 'https://' . ($_SERVER['HTTP_HOST'] ?? 'geekndragon.com') . '/boutique.php';
$extraHead = <<<HTML
<style>
  .card{@apply bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col;}
  .oos{@apply bg-gray-700 text-gray-400 cursor-not-allowed;}
</style>
HTML;

/* ───── STOCK ───── */
$snipcartSecret = $config['snipcart_secret_api_key'] ?? null;
$stockData = json_decode(file_get_contents(__DIR__ . '/data/stock.json'), true) ?? [];
function getStock(string $id): ?int
{
    global $snipcartSecret, $stockData;
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
    return $cache[$id] = $stockData[$id] ?? null;
}
function inStock(string $id): bool
{
    $stock = getStock($id);
    return $stock === null || $stock > 0;      // true si illimité ou quantité > 0
}

// Liste des produits
$data = json_decode(file_get_contents(__DIR__ . '/data/products.json'), true) ?? [];
$products = [];
foreach ($data as $id => $p) {
    $products[] = [
        'id' => $id,
        'name' => str_replace(' – ', '<br>', $p['name']),
        'name_en' => str_replace(' – ', '<br>', $p['name_en'] ?? $p['name']),
        'price' => $p['price'],
        'img' => $p['images'][0] ?? '',
        'desc' => $p['description'],
        'desc_en' => $p['description_en'] ?? $p['description'],
        'url' => 'product.php?id=' . urlencode($id) . '&from=pieces',
        'multipliers' => $p['multipliers'] ?? [],
    ];
}
$stock = [];
foreach ($products as $p) {
    $stock[$p['id']] = getStock($p['id']);
}
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang) ?>">
<?php include 'head-common.php'; ?>

<body>
<?php include 'header.php'; ?>
<?php
$snipcartLanguage = 'fr';
$snipcartLocales = 'fr,en';
$snipcartAddProductBehavior = 'overlay';
include 'snipcart-init.php';
?>

<main id="main" class="pt-[var(--header-height)]">

  <!-- ===== HERO ===== -->
  <section class="min-h-screen flex items-center justify-center text-center relative text-white">
    <video
      class="absolute inset-0 w-full h-full object-cover hero-fade hero-video"
      style="z-index:-1"
      poster="images/hero_mage.jpg"
      preload="metadata"
      muted
      playsinline
      autoplay
      data-playlist='["videos/coins_cascadeCoffre.mp4","videos/coins_cascadeMage.mp4"]'
    >
      <img src="images/hero_mage.jpg" alt="" role="presentation" class="w-full h-full object-cover hero-fade">
    </video>
    <div class="absolute inset-0 bg-black/60"></div>
      <div class="relative z-10 max-w-3xl p-6">
        <h1 class="text-5xl font-extrabold mb-6" data-i18n="shop.hero.title">Boutique Geek & Dragon</h1>
        <p class="text-xl mb-8 txt-court" data-i18n="shop.hero.description">Offrez à vos parties l’élégance et la durabilité de pièces et cartes d’équipement conçues au Québec, plus précieuses qu’une figurine de dragon à 300 $, laquelle ne sert qu’exceptionnellement, nos pièces sont présentes à chaque session pour des années d’aventures.</p>
        <a href="#pieces" class="btn btn-primary" data-i18n="shop.hero.button">Choisir mes trésors</a>
      </div>
  </section>


  <!-- ░░░ EN-TÊTE ░░░ -->
    <section class="text-center max-w-4xl mx-auto px-6 my-16">
      <h2 class="text-4xl md:text-5xl font-extrabold mb-4" data-i18n="shop.intro.title">Boutique officielle</h2>
        <p class="text-lg md:text-xl txt-court" data-i18n="shop.intro.description">Objets de collection et aides de jeu artisanaux, fabriqués au&nbsp;Québec.</p>
        <p class="mt-4 txt-court">
          <span data-i18n="shop.intro.payment">Paiement sécurisé via Snipcart</span>
          <span class="payment-icons">
            <img src="/images/payments/visa.svg" alt="Logo Visa" loading="lazy">
            <img src="/images/payments/mastercard.svg" alt="Logo Mastercard" loading="lazy">
            <img src="/images/payments/american-express.svg" alt="Logo American Express" loading="lazy">
          </span>
          &nbsp;|&nbsp;
          <span data-i18n="shop.intro.stock">Stocks mis à jour en temps réel.</span>
        </p>
    </section>


  <!-- ░░░ PIÈCES ░░░ -->
    <section class="py-24 bg-gray-900/80" id="pieces">
      <div class="max-w-6xl mx-auto px-6">
        <h3 class="text-4xl font-bold text-center mb-12" data-i18n="shop.pieces.title">Pièces métalliques</h3>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          <?php foreach ($products as $product) : ?>
              <?php include __DIR__ . '/partials/product-card.php'; ?>
          <?php endforeach; ?>
        </div>

        <p class="text-center mt-8 italic max-w-3xl mx-auto text-gray-300">
          <span data-i18n="shop.pieces.description">Un jeu de rôle sans pièces physiques, c’est comme un Monopoly sans billets. Offrez‑vous le poids authentique du trésor.</span><br>
          <a href="https://www.youtube.com/watch?v=y96eAFtC4xE&t=624s" target="_blank" class="underline text-indigo-400 hover:text-indigo-300" data-i18n="shop.pieces.video">Voir la démonstration en vidéo&nbsp;></a>
        </p>
      </div>
    </section>

  <!-- ░░░ COFFRES SUR MESURE ░░░ -->
    <section class="py-16">
      <div class="max-w-3xl mx-auto px-6 text-center">
        <h3 class="text-4xl font-bold mb-6" data-i18n="shop.chest.title">Coffres sur mesure</h3>
        <a href="contact.php"><img src="images/Piece/pro/coffre.png" alt="Coffre de pièces personnalisable" class="rounded mb-4 w-full h-124 object-cover" loading="lazy"></a>
        <p class="mb-6 text-gray-300" data-i18n="shop.chest.description">Besoin de plus de 50 pièces ? Des coffres personnalisés sont disponibles sur demande.</p>
        <a href="contact.php" class="btn btn-primary" data-i18n="shop.chest.button">Demander un devis</a>
      </div>
    </section>

  <!-- ░░░ CARTES ░░░ -->
    <section id="cartes" class="py-16">
      <div class="max-w-6xl mx-auto px-6">
        <h3 class="text-4xl font-bold text-center mb-12" data-i18n="shop.cards.title">Cartes d’équipement</h3>
        <div class="flex justify-center">
          <div class="card text-center max-w-md">
            <h4 class="text-2xl font-semibold mb-2" data-i18n="shop.cards.coming">À venir</h4>
            <p class="text-gray-300"><span data-i18n="shop.cards.description1">Nos scribes enchantent encore ces parchemins d’aventure.</span><br><span data-i18n="shop.cards.description2">Les cartes d’équipement forgeront leur entrée lors de la prochaine lune.</span></p>
          </div>
        </div>
      </div>
    </section>



  <!-- ░░░ TRIPTYQUES ░░░ -->
    <section id="triptyques" class="py-16 bg-gray-900/80">
      <div class="max-w-6xl mx-auto px-6">
        <h3 class="text-4xl font-bold text-center mb-12" data-i18n="shop.triptychs.title">Triptyques de personnage</h3>
        <div class="flex justify-center">
          <div class="card text-center max-w-md">
            <h4 class="text-2xl font-semibold mb-2" data-i18n="shop.triptychs.coming">À venir</h4>
            <p class="text-gray-300"><span data-i18n="shop.triptychs.description1">Les artisans façonnent encore ces grimoires de héros.</span><br><span data-i18n="shop.triptychs.description2">Les triptyques rejoindront la boutique sous peu.</span></p>
          </div>
        </div>
      </div>
    </section>
  
  <!-- ===== Investissement collectif & Carte de propriété ===== -->
  <section class="py-16 bg-gray-900/80">
    <div class="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10">
      <div class="md:w-1/3">
        <img src="images/carte_propriete.png" alt="Carte de propriété à remplir" class="rounded-xl shadow-lg w-full object-cover" loading="lazy">
      </div>
      <div class="md:w-2/3 text-gray-200 space-y-4">
        <h3 class="text-3xl font-bold" data-i18n="shop.collective.title">Investissez ensemble, partagez l’aventure</h3>
        <p data-i18n="shop.collective.description1">Ne laissez pas le maître de jeu se ruiner pour votre plaisir&nbsp;: chaque joueur pourra bientôt contribuer en achetant son triptyque, ses cartes et ses pièces.</p>
        <p data-i18n="shop.collective.description2">À titre de comparaison, certaines figurines de dragon se vendent plus de <strong>300&nbsp;$</strong> l'unité et ne sont généralement utilisées qu’une seule fois dans toute une campagne — et encore, seulement lorsque le scénario le permet, car ce n’est pas systématique. Nos pièces, elles, servent à chaque session et pour des années de campagne.</p>
        <p data-i18n="shop.collective.description3">Complétez la <em>carte de propriété</em> ci‑contre en indiquant votre nom et le nombre de pièces achetées, signez-la et remettez vos trésors au maître de jeu. À la fin de la campagne, il vous les restituera sans difficulté.</p>
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
            'description' => $p['desc'],
            'image' => 'https://' . ($_SERVER['HTTP_HOST'] ?? 'geekndragon.com') . '/' . $p['img'],
            'sku' => $p['id'],
            'offers' => [
                '@type' => 'Offer',
                'price' => $p['price'],
                'priceCurrency' => 'CAD',
                'availability' => inStock($p['id']) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            ],
        ];
    }, $products),
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>
</script>
  <script>window.stock = <?= json_encode($stock) ?>;</script>
  <script src="js/app.js"></script>
  <script src="js/hero-videos.js"></script>
</body>
</html>
