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
  .card{@apply bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col; position: relative;}
  .oos{@apply bg-gray-700 text-gray-400 cursor-not-allowed;}

  /* États de chargement stock asynchrone */
  [data-stock-status="loading"] .stock-loading-indicator { display: block !important; }
  [data-stock-status="loading"] { opacity: 0.9; }

  .stock-unavailable-overlay {
    backdrop-filter: blur(2px);
    z-index: 10;
  }

  /* CSS pour animations produits (simplifié) */
  .shop-grid {
    opacity: 1;
    transition: opacity 0.3s ease;
  }
</style>

<!-- Preconnections pour ressources externes uniquement -->
<link rel="preconnect" href="https://app.snipcart.com">
<link rel="dns-prefetch" href="https://app.snipcart.com">
HTML;

/* ───── STOCK ───── */
$snipcartSecret = $config['snipcart_secret_api_key'] ?? null;
$stockData = []; // Plus de stock.json local - géré par Snipcart
$snipcartSyncRaw = $_ENV['SNIPCART_SYNC'] ?? null;
$forceOfflineStock = false;
if ($snipcartSyncRaw !== null) {
    $syncFlag = filter_var($snipcartSyncRaw, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
    if ($syncFlag === false) {
        $forceOfflineStock = true;
    }
}
/**
 * Récupère le stock d'un produit via Snipcart lorsque disponible,
 * sinon utilise la valeur locale issue de stock.json.
 */
function getStock(string $id): ?int
{
    global $snipcartSecret, $stockData, $forceOfflineStock;
    static $cache = [];
    if (isset($cache[$id])) {
        return $cache[$id];
    }

    $shouldUseApi = !$forceOfflineStock && $snipcartSecret;

    if ($shouldUseApi) {
        $ch = curl_init('https://app.snipcart.com/api/inventory/' . urlencode($id));
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_USERPWD => $snipcartSecret . ':',
            CURLOPT_TIMEOUT => 2,
        ]);
        $res = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);

        if ($res !== false && $status < 400) {
            $inv = json_decode($res, true);
            return $cache[$id] = $inv['stock'] ?? $inv['available'] ?? null;
        }
    }

    // Repli local sur stock.json si l'API est indisponible ou désactivée
    return $cache[$id] = $stockData[$id] ?? null;
}
function inStock(string $id): bool
{
    $stock = getStock($id);
    return $stock === null || $stock > 0;      // true si illimité ou quantité > 0
}

// CHARGEMENT ASYNCHRONE: Plus de traitement PHP bloquant !
// Les produits seront chargés via /api/products-async.php pour affichage instantané

// Variables vides pour compatibilité avec le reste du code
$pieces = [];
$cards = [];
$triptychs = [];
$products = [];
// SUPPRIMÉ: Stock chargé en AJAX pour performance optimale
// $stock = [];
// foreach ($products as $p) {
//     $stock[$p['id']] = getStock($p['id']);
// }
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang) ?>">
<?php include 'head-common.php'; ?>

<body>
<?php
$snipcartLanguage = $lang;
$snipcartLocales = 'fr,en';
$snipcartAddProductBehavior = 'overlay';
// Snipcart réactivé avec chargement optimisé mais fonctionnel
ob_start();
include 'snipcart-init.php';
$snipcartInit = ob_get_clean();
include 'header.php';
echo $snipcartInit;
?>

<main id="main" class="pt-[var(--header-height)]">

  <!-- ===== HERO ===== -->
  <section class="min-h-screen flex items-center justify-center text-center relative text-white">
    <div class="hero-videos absolute inset-0 w-full h-full" style="z-index:-1" data-main="/media/videos/backgrounds/coffreFic_compressed.mp4" data-videos='["/media/videos/backgrounds/cascade_HD_compressed.mp4","/media/videos/backgrounds/fontaine11_compressed.mp4","/media/videos/backgrounds/Carte1_compressed.mp4","/media/videos/backgrounds/fontaine4_compressed.mp4","/media/videos/backgrounds/fontaine3_compressed.mp4","/media/videos/backgrounds/fontaine2_compressed.mp4","/media/videos/backgrounds/fontaine1_compressed.mp4","/media/videos/backgrounds/trip2_compressed.mp4"]'></div>
    <div class="absolute inset-0 bg-black/60"></div>
      <div class="relative z-10 max-w-3xl p-6 hero-text">
        <h1 class="text-5xl font-extrabold mb-6" data-i18n="shop.hero.title">Boutique Geek & Dragon</h1>
        <p class="text-xl mb-8 txt-court" data-i18n="shop.hero.description">Offrez à vos parties l’élégance et la durabilité de pièces et cartes d’équipement conçues au Québec, plus précieuses qu’une figurine de dragon à 300 $, laquelle ne sert qu’exceptionnellement, nos pièces sont présentes à chaque session pour des années d’aventures.</p>
        <a href="#pieces" class="btn btn-primary" data-i18n="shop.hero.button">Choisir mes trésors</a>
        <nav
          class="shop-quick-links mt-8 flex flex-wrap items-center justify-center gap-3"
          aria-label="<?= __('shop.hero.quickLinks.ariaLabel', 'Navigation rapide vers les catégories de la boutique') ?>"
        >
          <a href="#pieces" class="shop-quick-link btn btn-secondary" data-i18n="shop.hero.quickLinks.pieces">Pièces métalliques</a>
          <a href="#cartes" class="shop-quick-link btn btn-secondary" data-i18n="shop.hero.quickLinks.cartes">Cartes d'équipement</a>
          <a href="#triptyques" class="shop-quick-link btn btn-secondary" data-i18n="shop.hero.quickLinks.triptyques">Triptyques mystères</a>
        </nav>
      </div>
  </section>

  <!-- ░░░ PIÈCES MÉTALLIQUES ░░░ -->
    <section id="pieces" class="py-24 bg-gray-900/80 scroll-mt-24">
      <div class="max-w-6xl mx-auto px-6">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-8" data-i18n="shop.pieces.title">Pièces métalliques</h2>

        <!-- Texte explicatif du système de pièces -->
        <div class="max-w-4xl mx-auto mb-12 bg-gradient-to-br from-amber-900/30 to-yellow-900/20 rounded-xl p-8 border border-amber-600/30">
          <div class="text-gray-200 space-y-4">
            <p class="text-lg leading-relaxed" data-i18n="shop.pieces.intro.paragraph1">
              Dans D&D, la monnaie utilise <strong class="text-amber-300">5 métaux différents</strong> : cuivre (pc), argent (pa), électrum (pe), or (po) et platine (pp). Les conversions de base sont : 10 pc = 1 pa, 2 pa = 1 pe, 5 pa = 1 po, et 10 po = 1 pp.
            </p>

            <p class="text-lg leading-relaxed" data-i18n="shop.pieces.intro.paragraph2">
              Nos pièces physiques ajoutent une dimension immersive : chaque pièce peut avoir un <strong class="text-yellow-300">multiplicateur gravé</strong> (×1, ×10, ×100, ×1000, ×10000). Une pièce d'or ×100 vaut 100 po — parfait pour gérer de gros trésors sans manipuler des centaines de pièces !
            </p>

            <p class="text-base leading-relaxed text-gray-300 mb-4" data-i18n="shop.pieces.intro.paragraph3">
              Selon les règles officielles D&D, <strong class="text-amber-300">50 pièces = 500g/1 lb</strong>. Nos multiplicateurs représentent fidèlement ces valeurs et leur poids pour une immersion totale :
            </p>

            <!-- Tableau des poids -->
            <div class="bg-gray-800/50 rounded-lg p-6 border border-amber-500/20 mb-4">
              <h3 class="text-lg font-bold text-amber-400 mb-4" data-i18n="shop.pieces.intro.weightTableTitle">⚖️ Tableau des poids par multiplicateur</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                  <thead class="text-amber-300 border-b border-amber-500/30">
                    <tr>
                      <th class="py-2 px-3 font-semibold">Multiplicateur</th>
                      <th class="py-2 px-3 font-semibold">Poids (g)</th>
                      <th class="py-2 px-3 font-semibold">Poids (lb)</th>
                      <th class="py-2 px-3 font-semibold">Équivalent</th>
                    </tr>
                  </thead>
                  <tbody class="text-gray-300">
                    <tr class="border-b border-gray-700/50">
                      <td class="py-2 px-3">×1</td>
                      <td class="py-2 px-3">10 g</td>
                      <td class="py-2 px-3">0.02 lb</td>
                      <td class="py-2 px-3 text-gray-400">1 pièce standard</td>
                    </tr>
                    <tr class="border-b border-gray-700/50">
                      <td class="py-2 px-3">×10</td>
                      <td class="py-2 px-3">100 g</td>
                      <td class="py-2 px-3">0.22 lb</td>
                      <td class="py-2 px-3 text-gray-400">10 pièces</td>
                    </tr>
                    <tr class="border-b border-gray-700/50 bg-amber-900/10">
                      <td class="py-2 px-3 font-semibold text-yellow-300">×100</td>
                      <td class="py-2 px-3 font-semibold text-yellow-300">1 kg</td>
                      <td class="py-2 px-3 font-semibold text-yellow-300">2.2 lb</td>
                      <td class="py-2 px-3 text-gray-400">100 pièces</td>
                    </tr>
                    <tr class="border-b border-gray-700/50 bg-amber-900/10">
                      <td class="py-2 px-3 font-semibold text-yellow-400">×1000</td>
                      <td class="py-2 px-3 font-semibold text-yellow-400">10 kg</td>
                      <td class="py-2 px-3 font-semibold text-yellow-400">22 lb</td>
                      <td class="py-2 px-3 text-gray-400">1000 pièces</td>
                    </tr>
                    <tr>
                      <td class="py-2 px-3">×10000</td>
                      <td class="py-2 px-3">100 kg</td>
                      <td class="py-2 px-3">220 lb</td>
                      <td class="py-2 px-3 text-gray-400">10000 pièces</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p class="text-sm text-gray-400 mt-3 italic text-center" data-i18n="shop.pieces.intro.weightNote">
                Ressentez le poids croissant du trésor entre vos mains !
              </p>
            </div>

            <!-- Exemple concret -->
            <div class="bg-gray-800/50 rounded-lg p-6 border border-amber-500/20">
              <h3 class="text-xl font-bold text-amber-400 mb-4" data-i18n="shop.pieces.intro.exampleTitle">💡 Exemple concret : trésor de 1 500 po</h3>
              <p class="text-base leading-relaxed mb-3" data-i18n="shop.pieces.intro.exampleText">
                Plutôt que d'empiler <strong class="text-red-400">1 500 pièces unitaires</strong> (15 kg / 33 lb), utilisez :
              </p>
              <ul class="list-none space-y-2 text-base">
                <li class="flex items-start">
                  <span class="text-yellow-400 mr-3 text-xl">→</span>
                  <span data-i18n="shop.pieces.intro.exampleItem1"><strong class="text-yellow-400">1 pièce d'or ×1000</strong> → 1000 po (10 kg / 22 lb)</span>
                </li>
                <li class="flex items-start">
                  <span class="text-yellow-300 mr-3 text-xl">→</span>
                  <span data-i18n="shop.pieces.intro.exampleItem2"><strong class="text-yellow-300">5 pièces d'or ×100</strong> → 500 po (5 kg / 11 lb)</span>
                </li>
              </ul>
              <p class="text-sm text-gray-300 mt-4 p-3 bg-green-900/20 border border-green-600/30 rounded" data-i18n="shop.pieces.intro.exampleNote">
                <strong class="text-green-400">Résultat : 6 pièces physiques</strong> au lieu de 1 500 !
              </p>
            </div>

            <p class="text-base text-center text-gray-300 mt-6" data-i18n="shop.pieces.intro.footer">
              Choisissez parmi nos collections prêtes à l'emploi ou créez votre trésor sur mesure avec les pièces personnalisables.
            </p>
          </div>
        </div>

        <!-- Grille produits (chargement instantané) -->
        <div class="shop-grid"></div>

        <p class="text-center mt-8 italic max-w-3xl mx-auto text-gray-300">
          <span data-i18n="shop.pieces.description">Un jeu de rôle sans pièces physiques, c'est comme un Monopoly sans billets. Offrez‑vous le poids authentique du trésor.</span><br>
          <a href="https://www.youtube.com/watch?v=y96eAFtC4xE&t=624s" target="_blank" class="underline text-indigo-400 hover:text-indigo-300" data-i18n="shop.pieces.video">Voir les Conseils Jeux de Rôle sur L'Économie de D&D en vidéo&nbsp;></a>
        </p>

        <!-- Le convertisseur de monnaie a été déplacé vers la page d'aide -->
        <div class="mt-12 text-center">
          <div class="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-6 max-w-2xl mx-auto">
            <h4 class="text-xl font-bold text-indigo-400 mb-4">🧮 Convertisseur de Monnaie</h4>
            <p class="text-gray-300 mb-4">
              Notre convertisseur de monnaie interactif a été déplacé vers la page d'aide des jeux 
              pour une meilleure organisation et une expérience utilisateur optimisée.
            </p>
            <a href="<?= langUrl('aide-jeux.php#guide-monnaie') ?>" class="btn btn-primary">
              Utiliser le Convertisseur
            </a>
          </div>
        </div>
      </div>
    </section>

  <!-- ░░░ COFFRES SUR MESURE ░░░ -->
    <section class="py-24">
      <div class="max-w-3xl mx-auto px-6 text-center">
        <h3 class="text-4xl font-bold mb-6" data-i18n="shop.chest.title">Coffres sur mesure</h3>
        <a href="<?= langUrl('index.php#contact') ?>"><img src="/media/products/bundles/coffre.webp" alt="Coffre de pièces personnalisable" class="rounded mb-4 w-full h-124 object-cover" loading="lazy"></a>
        <p class="mb-6 text-gray-300" data-i18n="shop.chest.description">Besoin de plus de 50 pièces ? Des coffres personnalisés sont disponibles sur demande.</p>
        <a href="<?= langUrl('index.php#contact') ?>" class="btn btn-primary" data-i18n="shop.chest.button">Demander un devis</a>
      </div>
    </section>
	
  <!-- ░░░ CARTES D'ÉQUIPEMENT ░░░ -->
    <section id="cartes" class="py-24 bg-gray-900/80 scroll-mt-24">
      <div class="max-w-6xl mx-auto px-6">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-8" data-i18n="shop.cards.title">Cartes d'équipement</h2>
        <!-- Grille produits (chargement instantané) -->
        <div class="shop-grid"></div>

        <p class="text-center mt-8 italic max-w-3xl mx-auto text-gray-300">
          <span data-i18n="shop.cards.description"><?= __('shop.cards.description', 'Paquets thématiques de cartes illustrées pour gérer l\'inventaire visuellement.') ?></span>
        </p>
        <div class="text-center mt-6">
          <a
            href="<?= langUrl('aide-jeux.php#guide-cartes') ?>"
            class="inline-flex items-center gap-2 text-amber-300 underline decoration-2 underline-offset-4 hover:text-amber-100 transition"
            data-i18n="shop.cards.faqLink"
          >
            <?= __('shop.cards.faqLink', "Questions fréquentes / Guide des cartes") ?>
          </a>
        </div>
      </div>
    </section>

  <!-- ░░░ TRIPTYQUES MYSTÈRES ░░░ -->
    <section id="triptyques" class="py-24 scroll-mt-24">
      <div class="max-w-6xl mx-auto px-6">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-8" data-i18n="shop.triptychs.title">Triptyques de personnage</h2>
        <!-- Grille produits (chargement instantané) -->
        <div class="shop-grid"></div>

        <p class="text-center mt-8 italic max-w-3xl mx-auto text-gray-300">
          <span data-i18n="shop.triptychs.description"><?= __('shop.triptychs.description', 'Héros clé en main pour des parties improvisées.') ?></span>
        </p>
        <div class="text-center mt-6">
          <a href="<?= langUrl('aide-jeux.php#guide-triptyques') ?>" class="btn btn-outline" data-i18n="shop.triptychs.guideCta">
            <?= __('shop.triptychs.guideCta', 'Comment utiliser vos triptyques') ?>
          </a>
        </div>
      </div>
    </section>


  
  <!-- ===== Investissement collectif & Carte de propriété ===== -->
  <section class="py-16 bg-gray-900/80">
    <div class="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10">
      <div class="md:w-1/3">
        <img src="/media/content/carte_propriete.webp" alt="Carte de propriété à remplir" class="rounded-xl shadow-lg w-full object-cover" loading="lazy">
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
            <img src="/media/ui/payments/visa.svg" alt="Logo Visa" loading="lazy">
            <img src="/media/ui/payments/mastercard.svg" alt="Logo Mastercard" loading="lazy">
            <img src="/media/ui/payments/american-express.svg" alt="Logo American Express" loading="lazy">
        </p>
    </section>

</main>

<?php include 'footer.php'; ?>
<!-- Schema.org sera généré via JavaScript après chargement des produits -->
<script type="application/ld+json" id="product-schema">
{
  "@context": "https://schema.org/",
  "@type": "CollectionPage",
  "name": "Boutique Geek & Dragon",
  "description": "Accessoires immersifs pour jeux de rôle D&D",
  "url": "https://geekndragon.com/boutique.php"
}
</script>
  <!-- Scripts chargés automatiquement via footer.php -->
  <!-- Pas besoin de charger manuellement ici, footer.php s'en occupe -->

  <!-- Snipcart fonctionne nativement avec les attributs data-item-* selon la documentation officielle -->
</body>


</html>
