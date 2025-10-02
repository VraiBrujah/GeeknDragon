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
    /* Scroll horizontal moderne avec CSS Grid */
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(320px, 320px);
    gap: 1.5rem;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-behavior: smooth;
    /* Sortir du padding parent (px-6 = 1.5rem) */
    margin-left: -1.5rem;
    margin-right: -1.5rem;
    /* Ajouter du padding interne pour que les produits soient visibles */
    padding: 1.5rem;
    /* Scrollbar moderne */
    scrollbar-width: thin;
    scrollbar-color: #6366f1 #374151;
  }

  .shop-grid::-webkit-scrollbar {
    height: 10px;
  }

  .shop-grid::-webkit-scrollbar-track {
    background: #374151;
    border-radius: 5px;
  }

  .shop-grid::-webkit-scrollbar-thumb {
    background: #6366f1;
    border-radius: 5px;
  }

  .shop-grid::-webkit-scrollbar-thumb:hover {
    background: #818cf8;
  }

  @media (max-width: 640px) {
    .shop-grid {
      grid-auto-columns: minmax(280px, 280px);
      gap: 1rem;
      margin-left: -1.5rem;
      margin-right: -1.5rem;
      padding: 1rem 1.5rem;
    }
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
// Vérification compatibilité navigateur (doit être la première chose après <body>)
include __DIR__ . '/includes/browser-compatibility-check.php';
?>

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
        <p class="text-xl mb-8 txt-court" data-i18n="shop.hero.description">Offrez à vos parties l'élégance et la durabilité de pièces et cartes d'équipement conçues au Québec, plus précieuses qu'une figurine de dragon à 300 $, laquelle ne sert qu'exceptionnellement, nos pièces sont présentes à chaque session pour des années d'aventures.</p>
      </div>
  </section>

  <!-- ░░░ PIÈCES MÉTALLIQUES ░░░ -->
    <section id="pieces" class="py-24 bg-gray-900/80 scroll-mt-24">
      <div class="max-w-6xl mx-auto px-6">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-8" data-i18n="shop.pieces.title">Pièces métalliques</h2>

        <!-- Texte explicatif court du système de pièces -->
        <div class="max-w-4xl mx-auto mb-12 bg-gradient-to-br from-amber-900/30 to-yellow-900/20 rounded-xl p-6 border border-amber-600/30">
          <div class="text-gray-200 space-y-4">
            <p class="text-lg leading-relaxed text-center" data-i18n="shop.pieces.intro.shortDescription">
              Nos pièces métalliques reproduisent fidèlement le système monétaire de D&D (<strong class="text-amber-300">5 métaux</strong>) avec des <strong class="text-yellow-300">multiplicateurs gravés</strong> (×1, ×10, ×100, ×1000, ×10000). <strong class="text-green-400">Ressentez le poids réel du trésor</strong> entre vos mains !
            </p>

            <div class="text-center">
              <a href="<?= langUrl('aide-jeux.php#pieces-physiques') ?>" class="inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 transition-colors font-medium">
                📚 <span data-i18n="shop.pieces.intro.learnMore">En savoir plus sur le système de pièces et leurs poids</span> →
              </a>
            </div>
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

        <!-- Bouton retour au menu -->
        <div class="text-center mt-16">
          <a href="#main" class="btn btn-outline" data-i18n="shop.pieces.backToTop">
            <?= __('shop.pieces.backToTop', '🔝 Retour au menu principal') ?>
          </a>
        </div>
      </div>
    </section>

  <!-- ░░░ BUNDLE DELUXE COLLECTIONNEUR ░░░ -->
    <section id="bundle-deluxe" class="py-24 bg-gradient-to-br from-amber-900/20 via-yellow-900/30 to-orange-900/20 scroll-mt-24">
      <div class="max-w-6xl mx-auto px-6">

        <!-- Badge + Titre -->
        <div class="text-center mb-12">
          <div class="inline-block mb-4 px-6 py-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 rounded-full text-gray-900 font-extrabold text-sm uppercase tracking-wide shadow-xl shadow-amber-500/50 animate-pulse border-2 border-yellow-300">
            <span data-i18n="shop.deluxeBundle.badge">⭐ Édition Limitée Numérotée ⭐</span>
          </div>
          <h2 class="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 mb-4" data-i18n="shop.deluxeBundle.title">
            <?= __('shop.deluxeBundle.title', 'Coffre du Dragon - Édition Collectionneur') ?>
          </h2>
          <p class="text-xl text-amber-200 font-medium mb-4" data-i18n="shop.deluxeBundle.subtitle">
            <?= __('shop.deluxeBundle.subtitle', 'L\'expérience ultime pour collectionneurs et maîtres de jeu exigeants') ?>
          </p>
          <p class="text-lg text-gray-300 max-w-3xl mx-auto" data-i18n="shop.deluxeBundle.description">
            <?= __('shop.deluxeBundle.description', 'Le coffret premium qui transforme chaque partie en légende. Numéroté et certifié, ce trésor contient l\'arsenal complet du maître de jeu passionné.') ?>
          </p>
        </div>

        <!-- Contenu en une seule colonne large -->
        <div class="max-w-5xl mx-auto">

          <!-- Contenu du coffre -->
          <div class="bg-gray-900/80 backdrop-blur rounded-2xl p-8 border border-amber-600/30 shadow-xl mb-8">
            <h3 class="text-2xl font-bold text-amber-300 mb-6 flex items-center gap-3">
              <span class="text-3xl">📦</span>
              <span data-i18n="shop.deluxeBundle.features.title"><?= __('shop.deluxeBundle.features.title', 'Contenu du Coffre') ?></span>
            </h3>

            <!-- Section Pièces de Collection - Mise en avant dans le contenu -->
            <div class="bg-gradient-to-br from-gray-800/60 via-gray-900/60 to-gray-800/60 rounded-xl p-6 border border-amber-500/40 shadow-xl mb-6">
              <div class="flex items-center gap-4 mb-6">
                <span class="text-4xl">👑</span>
                <div>
                  <h4 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400 mb-1" data-i18n="shop.deluxeBundle.features.collectors.title"><?= __('shop.deluxeBundle.features.collectors.title', '<strong class="text-yellow-200">5 Pièces de Collection Plaquées</strong>') ?></h4>
                  <p class="text-base text-amber-300/90 italic" data-i18n="shop.deluxeBundle.features.collectors.subtitle"><?= __('shop.deluxeBundle.features.collectors.subtitle', 'Édition exclusive plaquée dans leur <strong class="text-amber-400">véritable métal rare authentique</strong>') ?></p>
                </div>
              </div>

              <!-- Grille des 5 pièces -->
              <div class="grid md:grid-cols-2 gap-3">
                <!-- Cuivre -->
                <div class="bg-gradient-to-br from-orange-950/50 to-gray-900/50 rounded-lg p-4 border-2 border-orange-500/50 hover:border-orange-400 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 text-center">
                  <div class="flex items-center justify-center gap-2 mb-2">
                    <div class="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50"></div>
                    <h5 class="font-bold text-lg text-orange-400" data-i18n="shop.deluxeBundle.features.collectors.copper.name"><?= __('shop.deluxeBundle.features.collectors.copper.name', 'Pièce Cuivre') ?></h5>
                  </div>
                  <p class="text-gray-300 text-sm leading-relaxed" data-i18n="shop.deluxeBundle.features.collectors.copper.detail"><?= __('shop.deluxeBundle.features.collectors.copper.detail', 'Plaquée cuivre pur - Éclat chaleureux et reflets orangés') ?></p>
                </div>

                <!-- Argent -->
                <div class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-4 border-2 border-gray-400/50 hover:border-gray-300 transition-all duration-300 hover:shadow-lg hover:shadow-gray-400/20 text-center">
                  <div class="flex items-center justify-center gap-2 mb-2">
                    <div class="w-2.5 h-2.5 rounded-full bg-gray-300 shadow-lg shadow-gray-300/50"></div>
                    <h5 class="font-bold text-lg text-gray-200" data-i18n="shop.deluxeBundle.features.collectors.silver.name"><?= __('shop.deluxeBundle.features.collectors.silver.name', 'Pièce Argent') ?></h5>
                  </div>
                  <p class="text-gray-300 text-sm leading-relaxed" data-i18n="shop.deluxeBundle.features.collectors.silver.detail"><?= __('shop.deluxeBundle.features.collectors.silver.detail', 'Plaquée argent sterling 925 - Brillance immaculée et prestige') ?></p>
                </div>

                <!-- Électrum -->
                <div class="bg-gradient-to-br from-teal-950/50 to-gray-900/50 rounded-lg p-4 border-2 border-teal-500/50 hover:border-teal-400 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 text-center">
                  <div class="flex items-center justify-center gap-2 mb-2">
                    <div class="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-lg shadow-teal-400/50"></div>
                    <h5 class="font-bold text-lg text-teal-300" data-i18n="shop.deluxeBundle.features.collectors.electrum.name"><?= __('shop.deluxeBundle.features.collectors.electrum.name', 'Pièce Électrum') ?></h5>
                  </div>
                  <p class="text-gray-300 text-sm leading-relaxed" data-i18n="shop.deluxeBundle.features.collectors.electrum.detail"><?= __('shop.deluxeBundle.features.collectors.electrum.detail', 'Plaquée argent sterling 925 - Éclat argenté pur et intemporel') ?></p>
                </div>

                <!-- Or -->
                <div class="bg-gradient-to-br from-yellow-950/50 to-gray-900/50 rounded-lg p-4 border-2 border-yellow-500/50 hover:border-yellow-400 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20 text-center">
                  <div class="flex items-center justify-center gap-2 mb-2">
                    <div class="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50"></div>
                    <h5 class="font-bold text-lg text-yellow-300" data-i18n="shop.deluxeBundle.features.collectors.gold.name"><?= __('shop.deluxeBundle.features.collectors.gold.name', 'Pièce Or') ?></h5>
                  </div>
                  <p class="text-gray-300 text-sm leading-relaxed" data-i18n="shop.deluxeBundle.features.collectors.gold.detail"><?= __('shop.deluxeBundle.features.collectors.gold.detail', 'Plaquée or 18 carats véritable - Luxe royal et éclat légendaire') ?></p>
                </div>

                <!-- Platine (centré sur 2 colonnes) -->
                <div class="bg-gradient-to-br from-slate-800/50 to-gray-900/50 rounded-lg p-4 border-2 border-slate-500/50 hover:border-slate-400 transition-all duration-300 hover:shadow-lg hover:shadow-slate-500/20 md:col-span-2 md:max-w-md md:mx-auto text-center">
                  <div class="flex items-center justify-center gap-2 mb-2">
                    <div class="w-2.5 h-2.5 rounded-full bg-slate-400 shadow-lg shadow-slate-400/50"></div>
                    <h5 class="font-bold text-lg text-slate-300" data-i18n="shop.deluxeBundle.features.collectors.platinum.name"><?= __('shop.deluxeBundle.features.collectors.platinum.name', 'Pièce Platine') ?></h5>
                  </div>
                  <p class="text-gray-300 text-sm leading-relaxed" data-i18n="shop.deluxeBundle.features.collectors.platinum.detail"><?= __('shop.deluxeBundle.features.collectors.platinum.detail', 'Plaquée platine véritable - Rareté ultime, noblesse absolue') ?></p>
                </div>
              </div>
            </div>

            <!-- Autres items du coffre -->
            <div class="grid md:grid-cols-2 gap-4">
              <div class="flex items-start gap-3 bg-gray-800/50 rounded-lg p-4 border border-yellow-500/20">
                <span class="text-yellow-400 text-2xl flex-shrink-0">💰</span>
                <span class="text-gray-200" data-i18n="shop.deluxeBundle.features.essence"><?= __('shop.deluxeBundle.features.essence', '<strong class="text-yellow-300">2× Essence du Marchand</strong> - Sets complets pour distribution rapide en jeu') ?></span>
              </div>

              <div class="flex items-start gap-3 bg-gray-800/50 rounded-lg p-4 border border-indigo-500/20">
                <span class="text-indigo-400 text-2xl flex-shrink-0">🃏</span>
                <span class="text-gray-200" data-i18n="shop.deluxeBundle.features.cards"><?= __('shop.deluxeBundle.features.cards', '<strong class="text-indigo-300">Set complet 560 cartes d\'équipement</strong> dans boîte premium') ?></span>
              </div>

              <div class="flex items-start gap-3 bg-gray-800/50 rounded-lg p-4 border border-purple-500/20">
                <span class="text-purple-400 text-2xl flex-shrink-0">📜</span>
                <span class="text-gray-200" data-i18n="shop.deluxeBundle.features.triptychs"><?= __('shop.deluxeBundle.features.triptychs', '<strong class="text-purple-300">3 triptyques au choix</strong> (Espèce + Classe + Historique)') ?></span>
              </div>

              <div class="flex items-start gap-3 bg-gray-800/50 rounded-lg p-4 border border-purple-500/20">
                <span class="text-purple-300 text-2xl flex-shrink-0">🎒</span>
                <span class="text-gray-200" data-i18n="shop.deluxeBundle.features.bag"><?= __('shop.deluxeBundle.features.bag', 'Sac en velours brodé "Geek & Dragon"') ?></span>
              </div>

              <div class="flex items-start gap-3 bg-gray-800/50 rounded-lg p-4 border border-blue-500/20">
                <span class="text-blue-400 text-2xl flex-shrink-0">📜</span>
                <span class="text-gray-200" data-i18n="shop.deluxeBundle.features.certificate"><?= __('shop.deluxeBundle.features.certificate', 'Certificat d\'authenticité numéroté à la main') ?></span>
              </div>

              <div class="flex items-start gap-3 bg-gray-800/50 rounded-lg p-4 border border-amber-500/20">
                <span class="text-amber-500 text-2xl flex-shrink-0">🗝️</span>
                <span class="text-gray-200" data-i18n="shop.deluxeBundle.features.chest"><?= __('shop.deluxeBundle.features.chest', 'Coffret deluxe personnalisé') ?></span>
              </div>
            </div>
          </div>

          <!-- Spécifications et CTA -->
          <div class="grid md:grid-cols-2 gap-6">
            <!-- Spécifications -->
            <div class="bg-gray-900/80 backdrop-blur rounded-xl p-6 border border-yellow-600/30 shadow-xl">
              <h3 class="text-xl font-bold text-yellow-300 mb-4 flex items-center gap-2">
                <span class="text-2xl">⚙️</span>
                <span data-i18n="shop.deluxeBundle.specs.title"><?= __('shop.deluxeBundle.specs.title', 'Spécifications Premium') ?></span>
              </h3>

              <div class="space-y-3">
                <div class="flex items-start gap-3 text-gray-200">
                  <span class="text-amber-400 text-xl">🔢</span>
                  <span data-i18n="shop.deluxeBundle.specs.numbered"><?= __('shop.deluxeBundle.specs.numbered', 'Numérotation unique gravée au laser') ?></span>
                </div>
                <div class="flex items-start gap-3 text-gray-200">
                  <span class="text-green-400 text-xl">💎</span>
                  <span data-i18n="shop.deluxeBundle.specs.savings"><?= __('shop.deluxeBundle.specs.savings', 'Économie de 25% vs achat séparé') ?></span>
                </div>
              </div>
            </div>

            <!-- Call to Action -->
            <div class="bg-gradient-to-br from-amber-900/40 via-orange-900/40 to-yellow-900/40 backdrop-blur rounded-xl p-6 border-2 border-amber-500/60 shadow-2xl text-center flex flex-col justify-center">
              <p class="text-red-400 font-bold text-xl mb-4 animate-pulse" data-i18n="shop.deluxeBundle.limited">
                <?= __('shop.deluxeBundle.limited', 'Production limitée à 500 exemplaires') ?>
              </p>

              <a href="<?= langUrl('index.php#contact') ?>" class="btn btn-primary text-lg px-8 py-4 mb-3 inline-block shadow-lg shadow-amber-600/30 hover:shadow-amber-500/50 transition-all" data-i18n="shop.deluxeBundle.cta">
                <?= __('shop.deluxeBundle.cta', 'Réserver Mon Édition') ?>
              </a>

              <p class="text-sm text-gray-300" data-i18n="shop.deluxeBundle.contact">
                <?= __('shop.deluxeBundle.contact', 'Contactez-nous pour disponibilité') ?>
              </p>
            </div>
          </div>

        </div>

        <!-- Bouton retour au menu -->
        <div class="text-center mt-16">
          <a href="#main" class="btn btn-outline" data-i18n="shop.deluxeBundle.backToTop">
            <?= __('shop.deluxeBundle.backToTop', '🔝 Retour au menu principal') ?>
          </a>
        </div>

      </div>
    </section>

  <!-- ░░░ CARTES D'ÉQUIPEMENT ░░░ -->
    <section id="cartes" class="py-24 bg-gray-900/80 scroll-mt-24">
      <div class="max-w-6xl mx-auto px-6">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-8" data-i18n="shop.cards.title">Cartes d'équipement</h2>

        <!-- Texte explicatif court des cartes -->
        <div class="max-w-4xl mx-auto mb-12 bg-gradient-to-br from-indigo-900/30 to-purple-900/20 rounded-xl p-6 border border-indigo-600/30">
          <div class="text-gray-200 space-y-4">
            <p class="text-lg leading-relaxed text-center" data-i18n="shop.cards.intro.shortDescription">
              <strong class="text-indigo-300">560 cartes illustrées</strong> remplaçant la lecture fastidieuse des manuels. Chaque carte présente <strong class="text-purple-300">visuellement</strong> un équipement, une arme ou un objet magique avec ses statistiques complètes. <strong class="text-green-400">Gagnez du temps et de l'immersion</strong> en jeu !
            </p>

            <div class="text-center">
              <a href="<?= langUrl('aide-jeux.php#guide-cartes') ?>" class="inline-flex items-center gap-2 text-indigo-300 hover:text-indigo-200 transition-colors font-medium">
                📚 <span data-i18n="shop.cards.intro.learnMore">En savoir plus sur les cartes d'équipement</span> →
              </a>
            </div>
          </div>
        </div>

        <!-- Grille produits (chargement instantané) -->
        <div class="shop-grid"></div>

        <p class="text-center mt-8 italic max-w-3xl mx-auto text-gray-300">
          <span data-i18n="shop.cards.description"><?= __('shop.cards.description', 'Paquets thématiques de cartes illustrées pour gérer l\'inventaire visuellement.') ?></span>
        </p>

        <!-- Bouton retour au menu -->
        <div class="text-center mt-16">
          <a href="#main" class="btn btn-outline" data-i18n="shop.cards.backToTop">
            <?= __('shop.cards.backToTop', '🔝 Retour au menu principal') ?>
          </a>
        </div>
      </div>
    </section>

  <!-- ░░░ TRIPTYQUES MYSTÈRES ░░░ -->
    <section id="triptyques" class="py-24 scroll-mt-24">
      <div class="max-w-6xl mx-auto px-6">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-8" data-i18n="shop.triptychs.title">Triptyques de personnage</h2>

        <!-- Texte explicatif court des triptyques -->
        <div class="max-w-4xl mx-auto mb-12 bg-gradient-to-br from-purple-900/30 to-pink-900/20 rounded-xl p-6 border border-purple-600/30">
          <div class="text-gray-200 space-y-4">
            <p class="text-lg leading-relaxed text-center" data-i18n="shop.triptychs.intro.shortDescription">
              Fiches de personnage <strong class="text-purple-300">triptyques robustes</strong> imprimées sur <strong class="text-pink-300">carton rigide</strong>. Trois volets articulés pour une gestion complète : caractéristiques, inventaire, sorts et notes. <strong class="text-green-400">Fini les feuilles froissées</strong> qui se déchirent !
            </p>

            <div class="text-center">
              <a href="<?= langUrl('aide-jeux.php#guide-triptyques') ?>" class="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors font-medium">
                📚 <span data-i18n="shop.triptychs.intro.learnMore">En savoir plus sur les triptyques de personnage</span> →
              </a>
            </div>
          </div>
        </div>

        <!-- Grille produits (chargement instantané) -->
        <div class="shop-grid"></div>

        <p class="text-center mt-8 italic max-w-3xl mx-auto text-gray-300">
          <span data-i18n="shop.triptychs.description"><?= __('shop.triptychs.description', 'Héros clé en main pour des parties improvisées.') ?></span>
        </p>

        <!-- Bouton retour au menu -->
        <div class="text-center mt-16">
          <a href="#main" class="btn btn-outline" data-i18n="shop.triptychs.backToTop">
            <?= __('shop.triptychs.backToTop', '🔝 Retour au menu principal') ?>
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
