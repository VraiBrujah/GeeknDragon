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
    $product = [
        'id' => $id,
        'name' => str_replace(' – ', '<br>', $p['name']),
        'name_en' => str_replace(' – ', '<br>', $p['name_en'] ?? $p['name']),
        'price' => $p['price'],
        'img' => $p['images'][0] ?? '',
        'description' => $p['description'] ?? '',
        'description_en' => $p['description_en'] ?? ($p['description'] ?? ''),
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

        <!-- Convertisseur de monnaie -->
        <div class="mt-12 text-center" id="currency-converter">
          <h4 class="text-gray-200 mb-4" data-i18n="shop.converter.title">Convertisseur de monnaie</h4>
          <div class="mx-auto">
            <p class="text-gray-200 mb-2" data-i18n="shop.converter.sourcesLabel">Monnaies sources</p>
            <table id="currency-sources" class="w-full text-gray-200">
              <thead>
                <tr>
                  <th data-i18n="shop.converter.copper">pièce de cuivre</th>
                  <th data-i18n="shop.converter.silver">pièce d'argent</th>
                  <th data-i18n="shop.converter.electrum">pièce d'électrum</th>
                  <th data-i18n="shop.converter.gold">pièce d'or</th>
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
          <div class="mt-4 bg-gray-800 rounded-lg p-4 overflow-x-auto">
            <table id="currency-results" class="w-full text-gray-200" aria-live="polite">
              <thead>
                <tr>
                  <th class="text-left" data-i18n="shop.converter.multiplier">Multiplicateur</th>
                  <th>×1</th>
                  <th>×10</th>
                  <th>×100</th>
                  <th>×1000</th>
                  <th>×10000</th>
                </tr>
              </thead>
              <tbody>
                <tr data-currency="copper">
                  <th class="text-left" data-i18n="shop.converter.copper">pièce de cuivre</th>
                  <td></td><td></td><td></td><td></td><td></td>
                </tr>
                <tr data-currency="silver">
                  <th class="text-left" data-i18n="shop.converter.silver">pièce d'argent</th>
                  <td></td><td></td><td></td><td></td><td></td>
                </tr>
                <tr data-currency="electrum">
                  <th class="text-left" data-i18n="shop.converter.electrum">pièce d'électrum</th>
                  <td></td><td></td><td></td><td></td><td></td>
                </tr>
                <tr data-currency="gold">
                  <th class="text-left" data-i18n="shop.converter.gold">pièce d'or</th>
                  <td></td><td></td><td></td><td></td><td></td>
                </tr>
                <tr data-currency="platinum">
                  <th class="text-left" data-i18n="shop.converter.platinum">pièce de platine</th>
                  <td></td><td></td><td></td><td></td><td></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div id="currency-equivalences" class="mt-4 bg-gray-800 rounded-lg p-4 text-gray-200 hidden">
            <h5 class="mb-2" data-i18n="shop.converter.equivTitle">Équivalences totales par métal</h5>
            <table class="w-full text-left text-sm">
              <tbody id="currency-equivalences-list"></tbody>
            </table>
          </div>
          <p id="currency-best" class="mt-4"></p>
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
        <div class="shop-grid <?= count($triptychs) <= 2 ? 'single-item' : '' ?>">
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
    // Convertisseur de monnaie complet (réutilisation code existant)
    (() => {
      const rates = {copper: 1, silver: 10, electrum: 50, gold: 100, platinum: 1000};
      const sources = document.querySelectorAll('#currency-sources input');
      const results = document.getElementById('currency-results');
      const best = document.getElementById('currency-best');
      const equivContainer = document.getElementById('currency-equivalences');
      const equivList = document.getElementById('currency-equivalences-list');

      if (!sources.length || !results || !best || !equivContainer || !equivList) return;

      const multipliers = [1, 10, 100, 1000, 10000];
      const coins = Object.keys(rates).sort((a, b) => rates[b] - rates[a]);
      const nf = new Intl.NumberFormat('fr-FR');

      const getCurrencyNames = () => Array.from(results.querySelectorAll('tbody tr')).reduce(
        (acc, row) => ({
          ...acc,
          [row.dataset.currency]: row.querySelector('th').textContent,
        }),
        {},
      );

      const denominations = multipliers
        .flatMap((multiplier) => coins.map((coin) => ({
          coin,
          multiplier,
          value: rates[coin] * multiplier,
        })))
        .sort((a, b) => b.value - a.value);

      const minimalParts = (value, currencyNames, andText) => {
        let remaining = value;
        const items = [];
        denominations.forEach(({ coin, multiplier, value: val }) => {
          if (remaining <= 0) return;
          const qty = Math.floor(remaining / val);
          if (qty > 0) {
            remaining -= qty * val;
            items.push({ coin, multiplier, qty });
          }
        });
        const parts = items.map(({ coin, multiplier, qty }) => {
          const label = currencyNames[coin].replace(/^pièce/, qty > 1 ? 'pièces' : 'pièce');
          return multiplier === 1
            ? `${nf.format(qty)} ${label}`
            : `${nf.format(qty)} ${label} x${nf.format(multiplier)}`;
        });
        const text = parts.length > 1
          ? `${parts.slice(0, -1).join(', ')} et ${parts[parts.length - 1]}`
          : (parts[0] || '');
        const total = items.reduce((sum, { qty }) => sum + qty, 0);
        return { text, remaining, items, total };
      };

      const render = () => {
        const currencyNames = getCurrencyNames();
        const baseValue = Array.from(sources).reduce((sum, input) => {
          const { currency } = input.dataset;
          const amount = Math.max(0, Math.floor(parseFloat(input.value) || 0));
          return sum + amount * rates[currency];
        }, 0);
        
        results.querySelectorAll('tbody tr').forEach((row) => {
          const { currency } = row.dataset;
          const cells = row.querySelectorAll('td');
          multipliers.forEach((multiplier, idx) => {
            const converted = Math.floor(baseValue / (rates[currency] * multiplier));
            cells[idx].textContent = converted ? nf.format(converted) : '';
          });
        });

        const minimal = minimalParts(baseValue, currencyNames, 'et');
        best.innerHTML = minimal.text
          ? `<strong>Conversion optimale:</strong> ${minimal.text}<br><small>Total pièces: ${nf.format(minimal.total)}</small>`
          : '';

        equivList.innerHTML = '';
        let hasEquiv = false;
        coins.forEach((coin) => {
          const base = rates[coin];
          const units = Math.floor(baseValue / base);
          if (!units) return;
          let rest = units;
          const parts = [];
          multipliers.slice().reverse().forEach((mult) => {
            const qty = Math.floor(rest / mult);
            if (qty > 0) {
              const label = currencyNames[coin].replace(/^pièce/, qty > 1 ? 'pièces' : 'pièce');
              parts.push(mult === 1
                ? `${nf.format(qty)} ${label}`
                : `${nf.format(qty)} ${label} x${nf.format(mult)}`);
              rest -= qty * mult;
            }
          });
          if (!parts.length) return;
          const summary = parts.length > 1
            ? `${parts.slice(0, -1).join(', ')} et ${parts[parts.length - 1]}`
            : parts[0];
          const remainder = baseValue % base;
          let remainderSummary = '';
          if (remainder > 0) {
            const rem = minimalParts(remainder, currencyNames, 'et');
            if (rem.text) remainderSummary = `Reste: ${rem.text}`;
          }
          const row = document.createElement('tr');
          const coinTitle = currencyNames[coin]
            .replace(/^pièces?\s+(?:de|d[''])\s*/i, '')
            .replace(/^./, (ch) => ch.toUpperCase());
          row.innerHTML = `<td><strong>${coinTitle}</strong></td><td>${summary}</td><td>${remainderSummary}</td>`;
          equivList.appendChild(row);
          hasEquiv = true;
        });
        equivContainer.classList.toggle('hidden', !hasEquiv);
      };

      sources.forEach((inputEl) => {
        inputEl.addEventListener('focus', () => {
          if (inputEl.value === '0') inputEl.value = '';
        });
        inputEl.addEventListener('input', () => {
          inputEl.value = inputEl.value.replace(/[^0-9.-]/g, '');
          render();
        });
      });

      render();
    })();
  </script>
</body>


</html>
