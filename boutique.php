<?php
require __DIR__ . '/bootstrap.php';
$config = require __DIR__ . '/config.php';
$active = 'boutique';
require __DIR__ . '/i18n.php';

// Inclusion des fonctions unifiées
require_once __DIR__ . '/includes/stock-functions.php';

$title = $translations['meta']['shop']['title'] ?? 'Boutique Geek & Dragon - Pièces et Équipements D&D';
$metaDescription = $translations['meta']['shop']['desc'] ?? 'Découvrez notre collection de pièces métalliques, cartes d\'équipement et triptyques pour vos parties de Donjons & Dragons. Fabriqué au Québec avec des matériaux premium.';
$metaUrl = 'https://' . ($_SERVER['HTTP_HOST'] ?? 'geekndragon.com') . '/boutique.php';

// Design system unifié
$extraHead = <<<HTML
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap" as="style">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="/css/design-system.css?v=<?= filemtime(__DIR__.'/css/design-system.css') ?>">
<link rel="stylesheet" href="/css/components.css?v=<?= filemtime(__DIR__.'/css/components.css') ?>">
<meta name="theme-color" content="#8b5cf6">
<meta name="format-detection" content="telephone=no">
HTML;

/* ───── DONNÉES PRODUITS ───── */
$snipcartSecret = $config['snipcart_secret_api_key'] ?? null;

// Chargement et formatage des produits avec les nouvelles fonctions
$data = json_decode(file_get_contents(__DIR__ . '/data/products.json'), true) ?? [];
$pieces = [];
$cards = [];
$triptychs = [];

foreach ($data as $id => $p) {
    $category = $p['category'] ?? 'pieces';
    $p['id'] = $id; // S'assurer que l'ID est présent
    $formattedProduct = formatProduct($p, $lang, $category);
    
    switch ($category) {
        case 'cards':
            $cards[] = $formattedProduct;
            break;
        case 'triptychs':
            $triptychs[] = $formattedProduct;
            break;
        default:
            $pieces[] = $formattedProduct;
            break;
    }
}

$allProducts = array_merge($pieces, $cards, $triptychs);
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

<main id="main" class="pt-[calc(var(--header-height))]">
  <!-- Ligne de séparation premium -->
  <div class="w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
  
  <!-- ===== HERO SECTION MODERNISÉ ===== -->
  <section class="gd-hero" itemscope itemtype="https://schema.org/Store">
    <!-- Fallback visuel pendant chargement vidéos -->
    <div class="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" style="z-index:-1"></div>
    
    <!-- Vidéos d'arrière-plan -->
    <div class="hero-videos absolute inset-0 w-full h-full" 
         style="z-index:0" 
         data-main="videos/Fontaine12.mp4" 
         data-videos='["videos/Carte1.mp4","videos/fontaine6.mp4","videos/trip2.mp4","videos/fontaine7.mp4","videos/cartearme.mp4","videos/fontaine8.mp4","videos/fontaine9.mp4","videos/fontaine4.mp4"]'>
    </div>
    
    <!-- Overlay d'assombrissement -->
    <div class="absolute inset-0 bg-black/60" style="z-index:1"></div>
    
    <!-- Contenu principal du hero -->
    <div class="gd-hero__content gd-animate-fade-up" style="z-index:2">
      <h1 class="gd-hero__title" 
          data-i18n="shop.hero.title" 
          itemprop="name">
        Boutique Geek & Dragon
      </h1>
      
      <p class="gd-hero__subtitle" 
         data-i18n="shop.hero.description" 
         itemprop="description">
        Offrez à vos parties l'élégance et la durabilité de pièces et cartes d'équipement conçues au Québec, plus précieuses qu'une figurine de dragon à 300 $, laquelle ne sert qu'exceptionnellement, nos pièces sont présentes à chaque session pour des années d'aventures.
      </p>
      
      <a href="#pieces" 
         class="gd-btn gd-btn--primary gd-btn--lg"
         aria-label="Découvrir la collection de pièces métalliques">
        <svg class="gd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 3h2l.4 2m0 0L8 17h8l3-8H5.4z"/>
          <circle cx="9" cy="20" r="1"/>
          <circle cx="20" cy="20" r="1"/>
        </svg>
        <span data-i18n="shop.hero.button">Choisir mes trésors</span>
      </a>
      
      <!-- Badges de confiance en hero -->
      <div class="flex justify-center mt-8 gap-6 text-sm text-gray-300">
        <div class="flex items-center gap-2">
          <span>🍁</span>
          <span>Fabriqué au Québec</span>
        </div>
        <div class="flex items-center gap-2">
          <span>⭐</span>
          <span>Qualité Premium</span>
        </div>
        <div class="flex items-center gap-2">
          <span>🚚</span>
          <span>Livraison 48h</span>
        </div>
      </div>
    </div>
    
    <!-- Métadonnées Schema.org -->
    <meta itemprop="telephone" content="+1-XXX-XXX-XXXX">
    <meta itemprop="address" content="Québec, Canada">
  </section>

  <!-- ===== SECTION PIÈCES MÉTALLIQUES ===== -->
  <section id="pieces" class="gd-shop-section scroll-mt-24" itemscope itemtype="https://schema.org/CollectionPage">
    <div class="gd-container">
      <header class="text-center mb-16">
        <h2 class="gd-shop-section__title" 
            data-i18n="shop.pieces.title" 
            itemprop="name">
          Pièces Métalliques
        </h2>
        <p class="gd-text gd-text--muted gd-text--lg max-w-3xl mx-auto" 
           data-i18n="shop.pieces.subtitle"
           itemprop="description">
          Le poids authentique du trésor pour vos campagnes de D&D. Fabriquées au Québec avec des alliages premium.
        </p>
      </header>

      <!-- Grille de produits modernisée -->
      <div class="gd-product-grid" itemscope itemtype="https://schema.org/ItemList">
        <meta itemprop="numberOfItems" content="<?= count($pieces) ?>">
        <?php foreach ($pieces as $index => $product) : ?>
          <div itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <meta itemprop="position" content="<?= $index + 1 ?>">
            <div itemprop="item" itemscope itemtype="https://schema.org/Product">
              <?php include __DIR__ . '/partials/product-card-unified.php'; ?>
            </div>
          </div>
        <?php endforeach; ?>
      </div>

      <!-- Section explicative avec vidéo -->
      <section class="gd-card mt-16 max-w-5xl mx-auto p-8 lg:p-12 text-center">
        <header class="mb-12">
          <h3 class="gd-heading gd-heading--3 mb-6">
            Pourquoi des pièces physiques ?
          </h3>
          <div class="w-20 h-1 bg-gradient-to-r from-purple-500 to-emerald-500 mx-auto mb-8 rounded-full"></div>
        </header>
        
        <div class="prose prose-lg prose-invert max-w-4xl mx-auto text-left">
          <blockquote class="gd-text--xl text-center italic text-purple-300 border-l-4 border-purple-500 pl-6 mb-8">
            "Un jeu de rôle sans pièces physiques, c'est comme un Monopoly sans billets : ça fonctionne, mais ça perd toute sa saveur."
          </blockquote>
          
          <div class="grid md:grid-cols-2 gap-8 text-gray-300">
            <div class="space-y-4">
              <h4 class="gd-text--lg font-semibold text-purple-300">🏰 Le problème</h4>
              <p>Le trésor est au cœur de presque toutes les campagnes de D&D… et pourtant, quand il se réduit à des chiffres qu'on inscrit puis efface cent fois, il perd toute magie et tout impact.</p>
              <p>Par souci de simplicité, on se limite presque toujours à la pièce d'or, oubliant la richesse des autres monnaies.</p>
            </div>
            
            <div class="space-y-4">
              <h4 class="gd-text--lg font-semibold text-emerald-300">⚔️ Notre solution</h4>
              <p>Avec nos pièces physiques, les calculs restent simples, mais chaque butin devient tangible, mémorable — digne des plus grandes quêtes.</p>
              <p>Chaque pièce raconte une histoire, chaque échange prend du poids, littéralement et figurativement.</p>
            </div>
          </div>
        </div>

        <!-- Vidéo de démonstration -->
        <div class="mt-12 flex justify-center">
          <button type="button"
                  class="gd-btn gd-btn--outline gd-btn--lg group relative overflow-hidden"
                  aria-controls="video-modal"
                  aria-label="Voir la démonstration vidéo par Pierre-Louis (Es-Tu Game ?)"
                  data-video-open>
            
            <!-- Thumbnail de la vidéo -->
            <div class="absolute inset-0 rounded-lg overflow-hidden opacity-20 group-hover:opacity-30 transition-opacity">
              <img src="https://img.youtube.com/vi/y96eAFtC4xE/hqdefault.jpg"
                   alt="Miniature de démonstration vidéo"
                   class="w-full h-full object-cover"
                   loading="lazy" 
                   decoding="async">
            </div>
            
            <!-- Contenu du bouton -->
            <div class="relative z-10 flex items-center gap-3">
              <svg class="gd-icon gd-icon--lg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <div class="text-left">
                <div class="font-semibold">Voir la démonstration</div>
                <div class="text-sm opacity-80">par Pierre-Louis (Es-Tu Game ?)</div>
              </div>
            </div>
          </button>
        </div>

        <!-- Modal vidéo -->
        <div id="video-modal"
             class="fixed inset-0 z-50 hidden bg-black/75 flex items-center justify-center"
             role="dialog" aria-modal="true"
             aria-label="Lire la vidéo « L’Économie de D&D 💰 Conseils Jeux de Rôle »"
             tabindex="-1">
          <div class="relative w-[90vw] max-w-4xl">
            <button type="button"
                    class="absolute top-4 right-4 z-10 text-white text-4xl leading-none focus:outline-none"
                    aria-label="Fermer la vidéo"
                    data-video-close>&times;</button>
            <div class="w-full aspect-video max-h-[90vh]">
              <iframe class="w-full h-full" src="https://www.youtube.com/embed/y96eAFtC4xE?start=624&rel=0&modestbranding=1"
                      title="L’Économie de D&D 💰 Conseils Jeux de Rôle" allowfullscreen tabindex="-1"></iframe>
            </div>
          </div>
        </div>

        <!-- Convertisseur de monnaie -->
        <div class="mt-12 text-center" id="currency-converter">
          <h4 class="text-gray-200 mb-4" data-i18n="shop.converter.title">Convertisseur de monnaie</h4>
          <div class="mx-auto">
            <p class="text-gray-200 mb-2" data-i18n="shop.converter.sourcesLabel">Monnaies sources</p>
            <table id="currency-sources" class="w-full text-gray-200">
              <thead>
                <tr>
                  <th data-i18n="shop.converter.copper">pièce de cuivre</th>
                  <th data-i18n="shop.converter.silver">pièce d’argent</th>
                  <th data-i18n="shop.converter.electrum">pièce d’électrum</th>
                  <th data-i18n="shop.converter.gold">pièce d’or</th>
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
          <div id="currency-equivalences" class="mt-4 bg-gray-900 rounded-lg p-4 text-gray-200 hidden">
            <h5 class="mb-2" data-i18n="shop.converter.equivTitle">Équivalences totales par métal</h5>
            <table id="currency-equivalences-list" class="w-full text-left text-sm">
              <thead class="bg-gray-800 text-gray-100">
                <tr>
                  <th class="font-semibold" data-i18n="shop.converter.equivMetal">Métal</th>
                  <th class="font-semibold" data-i18n="shop.converter.equivEquivalent">Équivalence</th>
                  <th class="font-semibold" data-i18n="shop.converter.remainder">Reste</th>
                  <th class="font-semibold" data-i18n="shop.converter.equivTotalPieces">Nombre total de pièces</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
          <div id="currency-best" class="mt-1 bg-gray-900 rounded-lg p-4 text-gray-200 hidden" data-i18n="shop.converter.bestLabel"></div>
        </div>
      </section>

    </div>
  </section>

  <section class="features-section">
    <div class="max-w-6xl mx-auto px-6 space-y-8">
      <!-- 1) Bloc Coffres sur mesure : ligne dédiée et centré -->
      <div class="flex justify-center">
        <div class="feature-card w-full md:max-w-2xl">
          <span class="feature-icon">📦</span>
          <h3 class="feature-title" data-i18n="shop.chest.title">Coffres sur mesure</h3>
          <p class="feature-description" data-i18n="shop.chest.description">
            Besoin de plus de 50 pièces ? Des coffres personnalisés sont disponibles sur demande.
          </p>
          <a href="index.php#contact" class="hero-cta mt-6" data-i18n="shop.chest.button">Demander un devis</a>
        </div>
      </div>

    </div>
  </section>

  <!-- ===== SECTION CARTES D'ÉQUIPEMENT ===== -->
  <section id="cartes" class="gd-shop-section scroll-mt-24">
    <div class="gd-container">
      <header class="text-center mb-16">
        <h2 class="gd-shop-section__title" data-i18n="shop.cards.title">Cartes d'Équipement</h2>
        <p class="gd-text gd-text--muted gd-text--lg max-w-3xl mx-auto" data-i18n="shop.cards.subtitle">
          Paquets thématiques de cartes illustrées pour gérer l'inventaire de vos aventuriers avec style.
        </p>
      </header>

      <div class="gd-product-grid">
        <?php foreach ($cards as $index => $product) : ?>
          <div itemscope itemtype="https://schema.org/Product">
            <?php include __DIR__ . '/partials/product-card-unified.php'; ?>
          </div>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- ===== SECTION TRIPTYQUES ===== -->
  <section id="triptyques" class="gd-shop-section">
    <div class="gd-container">
      <header class="text-center mb-16">
        <h2 class="gd-shop-section__title" data-i18n="shop.triptychs.title">Triptyques de Personnage</h2>
        <p class="gd-text gd-text--muted gd-text--lg max-w-3xl mx-auto" data-i18n="shop.triptychs.subtitle">
          Fiches rigides en trois volets pour classes, espèces et historiques. Organisation parfaite pour vos personnages.
        </p>
      </header>

      <div class="gd-product-grid">
        <?php foreach ($triptychs as $index => $product) : ?>
          <div itemscope itemtype="https://schema.org/Product">
            <?php include __DIR__ . '/partials/product-card-unified.php'; ?>
          </div>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- ░░░ INVESTISSEMENT COLLECTIF PREMIUM ░░░ -->
  <section id="collective" class="shop-section">
    <div class="max-w-6xl mx-auto px-6">
      <h2 class="shop-section-title" data-i18n="shop.collective.title">Investissez ensemble, partagez l'aventure</h2>

      <div class="flex flex-col items-center gap-12">
        <div class="features-grid">
          <div class="feature-card">
            <span class="feature-icon">💰</span>
            <h4 class="feature-title">Investissement partagé</h4>
            <p class="feature-description" data-i18n="shop.collective.description1">Ne laissez pas le maître de jeu se ruiner pour votre plaisir : chaque joueur peut contribuer en achetant son matériel.</p>
          </div>

          <div class="feature-card">
            <span class="feature-icon"><img src="images/carte_propriete.png" alt="Carte de propriété" class="property-image" loading="lazy" decoding="async"></span>
            <h4 class="feature-title">Carte de propriété</h4>
            <p class="feature-description">Système de traçabilité pour récupérer facilement vos trésors en fin de campagne.</p>
          </div>

          <div class="feature-card">
            <span class="feature-icon">⚖️</span>
            <h4 class="feature-title">Rapport qualité-prix</h4>
            <p class="feature-description" data-i18n="shop.collective.description2">Contrairement aux figurines à 300$ utilisées une fois, nos pièces servent à chaque session pour des années de campagne.</p>
          </div>

          <div class="feature-card">
            <span class="feature-icon">🚚</span>
            <h4 class="feature-title">Livraison rapide</h4>
            <p class="feature-description">Expédition sous 48h partout au Canada avec suivi en temps réel de votre commande.</p>
          </div>

          <div class="feature-card">
            <span class="feature-icon">🔒</span>
            <h4 class="feature-title">Paiement sécurisé</h4>
            <p class="feature-description">Transactions cryptées via Snipcart. Visa, Mastercard et American Express acceptés.</p>
          </div>

          <div class="feature-card">
            <span class="feature-icon">🎯</span>
            <h4 class="feature-title">Qualité artisanale</h4>
            <p class="feature-description">Fabriqué au Québec avec des matériaux premium pour des années d'aventures.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== SECTION FINALE - CONFIANCE ===== -->
  <section class="gd-section">
    <div class="gd-container text-center">
      <header class="mb-16">
        <h2 class="gd-heading gd-heading--2 mb-6" data-i18n="shop.intro.title">
          Trésors Artisanaux
        </h2>
        <p class="gd-text gd-text--muted gd-text--xl max-w-3xl mx-auto" data-i18n="shop.intro.description">
          Objets de collection et aides de jeu artisanaux, fabriqués au Québec avec passion et expertise.
        </p>
      </header>

      <!-- Trust indicators modernisés -->
      <?php include __DIR__ . '/partials/trust-indicators.php'; ?>
      
      <!-- Call-to-action final -->
      <div class="mt-16">
        <a href="#pieces" class="gd-btn gd-btn--primary gd-btn--lg">
          <svg class="gd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3h2l.4 2m0 0L8 17h8l3-8H5.4z"/>
            <circle cx="9" cy="20" r="1"/>
            <circle cx="20" cy="20" r="1"/>
          </svg>
          Commencer mes achats
        </a>
      </div>
    </div>
  </section>

</main>

<?php include 'footer.php'; ?>
<script type="application/ld+json">
<?= json_encode([
    '@context' => 'https://schema.org/',
    '@type' => 'WebPage',
    'name' => 'Boutique Geek & Dragon - Pièces et Équipements D&D',
    'description' => 'Découvrez notre collection de pièces métalliques, cartes d\'équipement et triptyques pour vos parties de Donjons & Dragons.',
    'url' => $metaUrl,
    'mainEntity' => [
        '@type' => 'Store',
        'name' => 'Geek & Dragon',
        'description' => 'Boutique spécialisée en matériel de jeu de rôle artisanal',
        'address' => [
            '@type' => 'PostalAddress',
            'addressCountry' => 'CA',
            'addressRegion' => 'Quebec'
        ]
    ],
    'hasOfferCatalog' => [
        '@type' => 'OfferCatalog',
        'name' => 'Catalogue Geek & Dragon',
        'itemListElement' => array_map(function ($p) use ($host) {
            return generateProductJsonLd($p, $host);
        }, $allProducts)
    ]
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>
</script>
  <!-- Scripts modernisés et optimisés -->
  <script src="/optimize-performance.js" defer></script>
  <script src="js/app.js" defer></script>
  <script src="/js/hero-videos.js" defer></script>
  <script src="/js/image-optimization.js" defer></script>
  <script src="/js/currency-converter.js" defer></script>
  <script>
  document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.querySelector('[data-video-open]');
    const modal = document.getElementById('video-modal');
    if (!openBtn || !modal) return;
    const closeBtn = modal.querySelector('[data-video-close]');
    const iframe = modal.querySelector('iframe');

    const escListener = (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        e.preventDefault();
        closeModal();
      }
    };

    const openModal = () => {
      modal.classList.remove('hidden');
      openBtn.classList.add('invisible');
      document.addEventListener('keydown', escListener, true);
      modal.focus();
    };

    const closeModal = () => {
      if (document.fullscreenElement) {
        try { document.exitFullscreen(); } catch (_) {}
      }
      modal.classList.add('hidden');
      iframe.src = iframe.src;
      document.removeEventListener('keydown', escListener, true);
      openBtn.classList.remove('invisible');
      openBtn.focus();
    };

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement && !modal.classList.contains('hidden')) closeModal();
    });

    const propertyImg = document.querySelector('.property-image');
    if (propertyImg) {
      propertyImg.addEventListener('click', () => {
        propertyImg.classList.toggle('expanded');
      });
    }
  });
  </script>
</body>
</html>
