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

// Liste des produits séparés par catégorie
$data = json_decode(file_get_contents(__DIR__ . '/data/products.json'), true) ?? [];
$pieces = [];
$cards = [];
$triptychs = [];

foreach ($data as $id => $p) {
    $summaryFr = (string) ($p['summary'] ?? ($p['description'] ?? ''));
    $summaryEn = (string) ($p['summary_en'] ?? ($p['description_en'] ?? ''));
    if ($summaryFr === '' && $summaryEn !== '') {
        $summaryFr = $summaryEn;
    }
    if ($summaryEn === '' && $summaryFr !== '') {
        $summaryEn = $summaryFr;
    }

    $product = [
        'id' => $id,
        'name' => str_replace(' – ', '<br>', $p['name']),
        'name_en' => str_replace(' – ', '<br>', $p['name_en'] ?? $p['name']),
        'price' => $p['price'],
        'img' => $p['images'][0] ?? '',
        'description' => $p['description'] ?? '',
        'description_en' => $p['description_en'] ?? ($p['description'] ?? ''),
        'summary' => $summaryFr,
        'summary_en' => $summaryEn,
        'multipliers' => $p['multipliers'] ?? [],
    ];
    
    // Catégorisation des produits
    if (str_starts_with($id, 'lot') || str_contains($id, 'essence') || str_contains($id, 'tresorerie')) {
        $product['url'] = 'product.php?id=' . urlencode($id) . '&from=pieces';
        $pieces[] = $product;
    } elseif (str_starts_with($id, 'triptyque')) {
        $product['url'] = 'product.php?id=' . urlencode($id) . '&from=triptychs';
        $triptychs[] = $product;
    } else {
        $product['url'] = 'product.php?id=' . urlencode($id) . '&from=cards';
        $cards[] = $product;
    }
}

// Pour compatibilité (si du code utilise encore $products)
$products = array_merge($pieces, $cards, $triptychs);
$stock = [];
foreach ($products as $p) {
    $stock[$p['id']] = getStock($p['id']);
}
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

<main id="main" class="pt-[var(--header-height)]">

  <!-- ===== HERO ===== -->
  <section class="min-h-screen flex items-center justify-center text-center relative text-white">
    <div class="hero-videos absolute inset-0 w-full h-full" style="z-index:-1" data-main="videos/Fontaine12.mp4" data-videos='["videos/Carte1.mp4","videos/fontaine6.mp4","videos/trip2.mp4","videos/fontaine7.mp4","videos/cartearme.mp4","videos/fontaine8.mp4","videos/fontaine9.mp4","videos/fontaine4.mp4"]'></div>
    <div class="absolute inset-0 bg-black/60"></div>
      <div class="relative z-10 max-w-3xl p-6 hero-text">
        <h1 class="text-5xl font-extrabold mb-6" data-i18n="shop.hero.title">Boutique Geek & Dragon</h1>
        <p class="text-xl mb-8 txt-court" data-i18n="shop.hero.description">Offrez à vos parties l’élégance et la durabilité de pièces et cartes d’équipement conçues au Québec, plus précieuses qu’une figurine de dragon à 300 $, laquelle ne sert qu’exceptionnellement, nos pièces sont présentes à chaque session pour des années d’aventures.</p>
        <a href="#pieces" class="btn btn-primary" data-i18n="shop.hero.button">Choisir mes trésors</a>
      </div>
  </section>

  <!-- ░░░ PIÈCES MÉTALLIQUES ░░░ -->
    <section id="pieces" class="py-24 bg-gray-900/80 scroll-mt-24">
      <div class="max-w-6xl mx-auto px-6">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-8" data-i18n="shop.pieces.title">Pièces métalliques</h2>
        <div class="shop-grid">
          <?php foreach ($pieces as $product) : ?>
              <?php include __DIR__ . '/partials/product-card.php'; ?>
          <?php endforeach; ?>
        </div>

        <p class="text-center mt-8 italic max-w-3xl mx-auto text-gray-300">
          <span data-i18n="shop.pieces.description">Un jeu de rôle sans pièces physiques, c'est comme un Monopoly sans billets. Offrez‑vous le poids authentique du trésor.</span><br>
          <a href="https://www.youtube.com/watch?v=y96eAFtC4xE&t=624s" target="_blank" class="underline text-indigo-400 hover:text-indigo-300" data-i18n="shop.pieces.video">Voir la démonstration en vidéo&nbsp;></a>
        </p>

        <!-- Convertisseur de monnaie Premium -->
        <div class="mt-12" id="currency-converter-premium">
          <h4 class="text-2xl font-bold text-center text-gray-200 mb-8" data-i18n="shop.converter.title">Convertisseur de monnaie</h4>
          
          <!-- Section 1: Monnaies sources avec design premium -->
          <div class="mb-8">
            <h5 class="text-lg font-semibold text-gray-200 mb-4 text-center" data-i18n="shop.converter.sourcesLabel">💰 Monnaies sources</h5>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-6xl mx-auto">
              <div class="currency-input-card bg-gradient-to-br from-amber-900/20 to-orange-800/20 p-4 rounded-xl border border-amber-700/30">
                <label class="block text-amber-300 font-medium mb-2">🪙 Cuivre</label>
                <input type="number" min="0" step="1" value="0" data-currency="copper" 
                       class="w-full bg-gray-800/80 text-amber-300 border border-amber-700/50 rounded-lg p-3 text-center font-bold focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
              </div>
              <div class="currency-input-card bg-gradient-to-br from-gray-600/20 to-gray-500/20 p-4 rounded-xl border border-gray-500/30">
                <label class="block text-gray-300 font-medium mb-2">🥈 Argent</label>
                <input type="number" min="0" step="1" value="0" data-currency="silver" 
                       class="w-full bg-gray-800/80 text-gray-300 border border-gray-500/50 rounded-lg p-3 text-center font-bold focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all" />
              </div>
              <div class="currency-input-card bg-gradient-to-br from-yellow-600/20 to-green-600/20 p-4 rounded-xl border border-yellow-500/30">
                <label class="block text-yellow-300 font-medium mb-2">⚡ Électrum</label>
                <input type="number" min="0" step="1" value="0" data-currency="electrum" 
                       class="w-full bg-gray-800/80 text-yellow-300 border border-yellow-500/50 rounded-lg p-3 text-center font-bold focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all" />
              </div>
              <div class="currency-input-card bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 p-4 rounded-xl border border-yellow-400/30">
                <label class="block text-yellow-300 font-medium mb-2">🥇 Or</label>
                <input type="number" min="0" step="1" value="0" data-currency="gold" 
                       class="w-full bg-gray-800/80 text-yellow-300 border border-yellow-400/50 rounded-lg p-3 text-center font-bold focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all" />
              </div>
              <div class="currency-input-card bg-gradient-to-br from-cyan-500/20 to-blue-600/20 p-4 rounded-xl border border-cyan-400/30">
                <label class="block text-cyan-300 font-medium mb-2">💎 Platine</label>
                <input type="number" min="0" step="1" value="0" data-currency="platinum" 
                       class="w-full bg-gray-800/80 text-cyan-300 border border-cyan-400/50 rounded-lg p-3 text-center font-bold focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all" />
              </div>
            </div>
          </div>

          <!-- Section 2: Tableau multiplicateur interactif toujours visible -->
          <div class="mb-8">
            <h5 class="text-lg font-semibold text-gray-200 mb-4 text-center" data-i18n="shop.converter.multiplierLabel">⚖️ Tableau multiplicateur (éditable)</h5>
            <div class="bg-gray-800/50 rounded-xl p-6 max-w-6xl mx-auto border border-gray-700/30">
              <div class="overflow-x-auto">
                <table class="w-full text-gray-200" id="multiplier-table">
                  <thead>
                    <tr class="border-b border-gray-600/50">
                      <th class="text-left p-3 text-gray-300">Monnaie</th>
                      <th class="text-center p-3 text-gray-300">×1</th>
                      <th class="text-center p-3 text-gray-300">×10</th>
                      <th class="text-center p-3 text-gray-300">×100</th>
                      <th class="text-center p-3 text-gray-300">×1000</th>
                      <th class="text-center p-3 text-gray-300">×10000</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="border-b border-gray-700/30" data-currency="platinum">
                      <td class="p-3 text-cyan-300 font-medium">💎 Platine</td>
                      <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-cyan-300 border border-cyan-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1"></td>
                      <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-cyan-300 border border-cyan-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10"></td>
                      <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-cyan-300 border border-cyan-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="100"></td>
                      <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-cyan-300 border border-cyan-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1000"></td>
                      <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-cyan-300 border border-cyan-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10000"></td>
                    </tr>
                    <tr class="border-b border-gray-700/30" data-currency="gold">
                      <td class="p-3 text-yellow-300 font-medium">🥇 Or</td>
                      <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-400/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1"></td>
                      <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-400/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10"></td>
                      <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-400/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="100"></td>
                      <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-400/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1000"></td>
                      <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-400/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10000"></td>
                    </tr>
                    <tr class="border-b border-gray-700/30" data-currency="electrum">
                      <td class="p-3 text-yellow-300 font-medium">⚡ Électrum</td>
                      <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1"></td>
                      <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10"></td>
                      <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="100"></td>
                      <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1000"></td>
                      <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10000"></td>
                    </tr>
                    <tr class="border-b border-gray-700/30" data-currency="silver">
                      <td class="p-3 text-gray-300 font-medium">🥈 Argent</td>
                      <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-gray-300 border border-gray-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1"></td>
                      <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-gray-300 border border-gray-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10"></td>
                      <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-gray-300 border border-gray-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="100"></td>
                      <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-gray-300 border border-gray-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1000"></td>
                      <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-gray-300 border border-gray-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10000"></td>
                    </tr>
                    <tr data-currency="copper">
                      <td class="p-3 text-amber-300 font-medium">🪙 Cuivre</td>
                      <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-amber-300 border border-amber-700/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1"></td>
                      <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-amber-300 border border-amber-700/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10"></td>
                      <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-amber-300 border border-amber-700/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="100"></td>
                      <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-amber-300 border border-amber-700/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1000"></td>
                      <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-amber-300 border border-amber-700/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10000"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Section 3: Équivalences totales par métal avec recommandations optimales -->
          <div class="mb-8" id="metal-totals-section">
            <h5 class="text-lg font-semibold text-gray-200 mb-4 text-center" data-i18n="shop.converter.equivalences">💼 Équivalences totales par métal</h5>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
              <!-- Première ligne: Cuivre, Argent, Électrum -->
              <div id="copper-card"></div>
              <div id="silver-card"></div>
              <div id="electrum-card"></div>
              
              <!-- Deuxième ligne: Or, Platine, Recommandations optimales -->
              <div id="gold-card"></div>
              <div id="platinum-card"></div>
              <div id="optimal-recommendations" class="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-xl p-6 border border-indigo-500/30">
                <h6 class="text-indigo-300 font-bold text-lg mb-4">✨ Recommandations optimales</h6>
                <div id="currency-best" class="text-gray-200"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

  <!-- ░░░ COFFRES SUR MESURE ░░░ -->
    <section class="py-24">
      <div class="max-w-3xl mx-auto px-6 text-center">
        <h3 class="text-4xl font-bold mb-6" data-i18n="shop.chest.title">Coffres sur mesure</h3>
        <a href="contact.php"><img src="images/Piece/pro/coffre.png" alt="Coffre de pièces personnalisable" class="rounded mb-4 w-full h-124 object-cover" loading="lazy"></a>
        <p class="mb-6 text-gray-300" data-i18n="shop.chest.description">Besoin de plus de 50 pièces ? Des coffres personnalisés sont disponibles sur demande.</p>
        <a href="contact.php" class="btn btn-primary" data-i18n="shop.chest.button">Demander un devis</a>
      </div>
    </section>
	
  <!-- ░░░ CARTES D'ÉQUIPEMENT ░░░ -->
    <section id="cartes" class="py-24 bg-gray-900/80 scroll-mt-24">
      <div class="max-w-6xl mx-auto px-6">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-8" data-i18n="shop.cards.title">Cartes d'équipement</h2>
        <div class="shop-grid">
          <?php foreach ($cards as $product) : ?>
              <?php include __DIR__ . '/partials/product-card.php'; ?>
          <?php endforeach; ?>
        </div>

        <p class="text-center mt-8 italic max-w-3xl mx-auto text-gray-300">
          <span data-i18n="shop.cards.description">Paquets thématiques de cartes illustrées pour gérer l'inventaire visuellement.</span>
        </p>
      </div>
    </section>

  <!-- ░░░ TRIPTYQUES MYSTÈRES ░░░ -->
    <section id="triptyques" class="py-24 scroll-mt-24">
      <div class="max-w-6xl mx-auto px-6">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-8" data-i18n="shop.triptychs.title">Triptyques de personnage</h2>
        <div class="shop-grid">
          <?php foreach ($triptychs as $product) : ?>
              <?php include __DIR__ . '/partials/product-card.php'; ?>
          <?php endforeach; ?>
        </div>

        <p class="text-center mt-8 italic max-w-3xl mx-auto text-gray-300">
          <span data-i18n="shop.triptychs.description">Héros clé en main pour des parties improvisées.</span>
        </p>
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
  
  <!-- ░░░ EN-TÊTE ░░░ -->
    <section class="text-center max-w-4xl mx-auto px-6 my-16">
      <h2 class="text-4xl md:text-5xl font-extrabold mb-4" data-i18n="shop.intro.title">Trésors artisanaux</h2>
        <p class="text-lg md:text-xl txt-court" data-i18n="shop.intro.description">Objets de collection et aides de jeu artisanaux, fabriqués au&nbsp;Québec.</p>
        <p class="mt-4 txt-court">
          <span data-i18n="shop.intro.payment">Paiement sécurisé via Snipcart</span>
          <span class="payment-icons">
            <img src="/images/payments/visa.svg" alt="Logo Visa" loading="lazy">
            <img src="/images/payments/mastercard.svg" alt="Logo Mastercard" loading="lazy">
            <img src="/images/payments/american-express.svg" alt="Logo American Express" loading="lazy">
        </p>
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
    }, $products),
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>
</script>
  <script>window.stock = <?= json_encode($stock) ?>;</script>
  <script src="js/app.js"></script>
  <script src="/js/hero-videos.js"></script>
  <script src="js/boutique-premium.js"></script>
  
  <script>
    // Convertisseur de monnaie Premium avec synchronisation temps réel
    class CurrencyConverterPremium {
      constructor() {
        this.rates = {copper: 1, silver: 10, electrum: 50, gold: 100, platinum: 1000};
        this.multipliers = [1, 10, 100, 1000, 10000];
        this.nf = new Intl.NumberFormat('fr-FR');
        this.editMode = true; // Édition activée par défaut
        
        this.sourceInputs = document.querySelectorAll('#currency-converter-premium input[data-currency]');
        this.multiplierInputs = document.querySelectorAll('.multiplier-input');
        this.bestDisplay = document.getElementById('currency-best');
        
        // Références vers les cartes positionnées
        this.metalCards = {
          copper: document.getElementById('copper-card'),
          silver: document.getElementById('silver-card'),
          electrum: document.getElementById('electrum-card'),
          gold: document.getElementById('gold-card'),
          platinum: document.getElementById('platinum-card')
        };
        
        this.currencyData = {
          copper: { name: 'Cuivre', emoji: '🪙', color: 'amber' },
          silver: { name: 'Argent', emoji: '🥈', color: 'gray' },
          electrum: { name: 'Électrum', emoji: '⚡', color: 'yellow' },
          gold: { name: 'Or', emoji: '🥇', color: 'yellow' },
          platinum: { name: 'Platine', emoji: '💎', color: 'cyan' }
        };
        
        this.init();
      }
      
      init() {
        this.setupEventListeners();
        this.updateDisplay();
      }
      
      setupEventListeners() {
        // Événements pour les inputs sources
        this.sourceInputs.forEach(input => {
          input.addEventListener('focus', () => {
            if (input.value === '0') input.value = '';
          });
          
          input.addEventListener('input', () => {
            input.value = input.value.replace(/[^0-9]/g, '');
            this.updateFromSources();
          });
        });
        
        // Événements pour les inputs multiplicateur (édition activée par défaut)
        this.multiplierInputs.forEach(input => {
          input.addEventListener('input', () => {
            input.value = input.value.replace(/[^0-9]/g, '');
            this.updateFromMultipliers();
          });
        });
      }
      
      getTotalBaseValue() {
        return Array.from(this.sourceInputs).reduce((sum, input) => {
          const currency = input.dataset.currency;
          const amount = Math.max(0, parseInt(input.value) || 0);
          return sum + amount * this.rates[currency];
        }, 0);
      }
      
      updateFromSources() {
        const baseValue = this.getTotalBaseValue();
        
        // Mettre à jour le tableau multiplicateur
        this.multiplierInputs.forEach(input => {
          const currency = input.closest('tr').dataset.currency;
          const multiplier = parseInt(input.dataset.multiplier);
          const value = Math.floor(baseValue / (this.rates[currency] * multiplier));
          input.value = value > 0 ? this.nf.format(value) : '';
        });
        
        this.updateMetalCards(baseValue);
        this.updateOptimalRecommendations(baseValue);
      }
      
      updateFromMultipliers() {
        // Calculer la valeur totale depuis les inputs multiplicateur
        let totalValue = 0;
        this.multiplierInputs.forEach(input => {
          const currency = input.closest('tr').dataset.currency;
          const multiplier = parseInt(input.dataset.multiplier);
          const quantity = parseInt(input.value.replace(/\s/g, '')) || 0;
          totalValue += quantity * this.rates[currency] * multiplier;
        });
        
        // Mettre à jour les sources
        this.sourceInputs.forEach(input => {
          input.value = '0';
        });
        
        // Distribuer la valeur de manière optimale dans les sources
        this.distributeOptimally(totalValue);
        this.updateMetalCards(totalValue);
        this.updateOptimalRecommendations(totalValue);
      }
      
      distributeOptimally(totalValue) {
        let remaining = totalValue;
        const currencies = ['platinum', 'gold', 'electrum', 'silver', 'copper'];
        
        currencies.forEach(currency => {
          const input = document.querySelector(`input[data-currency="${currency}"]`);
          const rate = this.rates[currency];
          const count = Math.floor(remaining / rate);
          if (count > 0) {
            input.value = count.toString();
            remaining -= count * rate;
          }
        });
      }
      
      updateMetalCards(baseValue) {
        if (baseValue === 0) {
          Object.keys(this.metalCards).forEach(currency => {
            this.metalCards[currency].innerHTML = '';
          });
          return;
        }
        
        Object.keys(this.rates).forEach(currency => {
          const data = this.currencyData[currency];
          const rate = this.rates[currency];
          const totalUnits = Math.floor(baseValue / rate);
          
          if (totalUnits === 0) {
            this.metalCards[currency].innerHTML = '';
            return;
          }
          
          // Calcul du nombre minimal de pièces avec multiplicateurs
          const minimalCoins = this.getMinimalCoinsBreakdown(totalUnits);
          const remainderValue = baseValue % rate;
          let remainderText = '';
          if (remainderValue > 0) {
            remainderText = this.getOptimalBreakdown(remainderValue);
          }
          
          this.metalCards[currency].innerHTML = `
            <div class="currency-total-card bg-gradient-to-br from-${data.color}-900/20 to-${data.color}-800/20 rounded-xl p-6 border border-${data.color}-700/30">
              <div class="flex items-center justify-between mb-4">
                <h6 class="text-${data.color}-300 font-bold text-lg">${data.emoji} ${data.name}</h6>
                <span class="text-2xl font-bold text-${data.color}-300">${this.nf.format(totalUnits)}</span>
              </div>
              
              <div class="space-y-2 mb-4">
                <div class="text-sm">
                  <span class="text-gray-300">Nombre minimal de pièces:</span>
                </div>
                ${minimalCoins.map(item => `
                  <div class="flex justify-between text-sm pl-2">
                    <span class="text-gray-300">${item.multiplier === 1 ? 'Unités' : `Lots ×${this.nf.format(item.multiplier)}`}:</span>
                    <span class="text-${data.color}-300 font-medium">${this.nf.format(item.quantity)}</span>
                  </div>
                `).join('')}
                <div class="border-t border-${data.color}-700/30 pt-2 mt-3">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-300">Total pièces:</span>
                    <span class="text-${data.color}-300 font-bold">${this.nf.format(minimalCoins.reduce((sum, item) => sum + item.quantity, 0))}</span>
                  </div>
                </div>
              </div>
              
              ${remainderText ? `
                <div class="border-t border-${data.color}-700/30 pt-3">
                  <p class="text-xs text-gray-400">Reste: ${remainderText}</p>
                </div>
              ` : ''}
            </div>
          `;
        });
      }
      
      getMinimalCoinsBreakdown(totalUnits) {
        const breakdown = [];
        let remaining = totalUnits;
        
        // Calcul de la répartition optimale par multiplicateur (du plus grand au plus petit)
        this.multipliers.slice().reverse().forEach(mult => {
          const qty = Math.floor(remaining / mult);
          if (qty > 0) {
            breakdown.push({
              multiplier: mult,
              quantity: qty
            });
            remaining -= qty * mult;
          }
        });
        
        return breakdown;
      }
      
      getOptimalBreakdown(value) {
        if (value <= 0) return '';
        
        const breakdown = [];
        let remaining = value;
        const currencies = ['platinum', 'gold', 'electrum', 'silver'];
        
        // Traiter les métaux de valeur élevée d'abord (sans le cuivre)
        currencies.forEach(currency => {
          const rate = this.rates[currency];
          const count = Math.floor(remaining / rate);
          if (count > 0) {
            const data = this.currencyData[currency];
            breakdown.push(`${count} ${data.emoji} ${data.name.toLowerCase()}`);
            remaining -= count * rate;
          }
        });
        
        // Ajouter le cuivre restant (il devrait toujours y en avoir car remaining >= 0)
        if (remaining > 0) {
          const copperCount = remaining; // remaining est déjà en cuivre
          const copperData = this.currencyData.copper;
          breakdown.push(`${copperCount} ${copperData.emoji} ${copperData.name.toLowerCase()}`);
        }
        
        // Ajouter le connecteur "et" avant le dernier élément si il y en a plusieurs
        if (breakdown.length > 1) {
          const last = breakdown.pop();
          return breakdown.join(', ') + ' et ' + last;
        }
        
        return breakdown.join('');
      }
      
      updateOptimalRecommendations(baseValue) {
        if (baseValue === 0) {
          this.bestDisplay.innerHTML = 'Entrez des montants pour voir les recommandations optimales';
          return;
        }
        
        const optimal = this.getOptimalBreakdown(baseValue);
        const totalPieces = this.calculateTotalPieces(baseValue);
        
        // Calcul de la valeur en or avec reste
        const goldValue = Math.floor(baseValue / this.rates.gold);
        const goldRemainder = baseValue % this.rates.gold;
        
        let goldValueDisplay = '';
        if (goldValue > 0) {
          goldValueDisplay = `${this.nf.format(goldValue)} 🥇 or`;
          if (goldRemainder > 0) {
            const remainderBreakdown = this.getOptimalBreakdown(goldRemainder);
            goldValueDisplay += ` et ${remainderBreakdown}`;
          }
        } else {
          goldValueDisplay = this.getOptimalBreakdown(baseValue);
        }
        
        this.bestDisplay.innerHTML = `
          <div class="text-center">
            <p class="text-lg mb-2"><strong>Conversion optimale:</strong></p>
            <p class="text-indigo-300 font-medium mb-2">${optimal}</p>
            <p class="text-sm text-gray-400">Total: ${this.nf.format(totalPieces)} pièces</p>
            <p class="text-sm text-gray-400"><br>Valeur: ${goldValueDisplay}</p>
          </div>
        `;
      }
      
      calculateTotalPieces(baseValue) {
        let total = 0;
        let remaining = baseValue;
        const currencies = ['platinum', 'gold', 'electrum', 'silver', 'copper'];
        
        currencies.forEach(currency => {
          const rate = this.rates[currency];
          const count = Math.floor(remaining / rate);
          total += count;
          remaining -= count * rate;
        });
        
        return total;
      }
      
      updateDisplay() {
        this.updateFromSources();
      }
    }
    
    // Initialiser le convertisseur quand le DOM est prêt
    document.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('currency-converter-premium')) {
        new CurrencyConverterPremium();
      }
    });
  </script>
</body>


</html>
