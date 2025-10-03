<?php
require __DIR__ . '/bootstrap.php';
$config = require __DIR__ . '/config.php';
// No active nav item on homepage
require __DIR__ . '/i18n.php';
$title  = $translations['meta']['home']['title'] ?? 'Geek & Dragon';
$metaDescription = $translations['meta']['home']['desc'] ?? '';
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
  ob_start();
  include 'snipcart-init.php';
  $snipcartInit = ob_get_clean();
  include 'header.php';
  echo $snipcartInit;
  ?>

  <main id="main" class="pt-[var(--header-height)]">
  

    <!-- ===== HERO ===== -->
    <section class="min-h-screen flex items-center justify-center text-center relative text-white">
      <div class="hero-videos absolute inset-0 w-full h-full" style="z-index:-1" data-main="/media/videos/backgrounds/mage_compressed.mp4" data-videos='["/media/videos/backgrounds/cascade_HD_compressed.mp4","/media/videos/backgrounds/fontaine11_compressed.mp4","/media/videos/backgrounds/Carte1_compressed.mp4","/media/videos/backgrounds/fontaine4_compressed.mp4","/media/videos/backgrounds/fontaine3_compressed.mp4","/media/videos/backgrounds/fontaine2_compressed.mp4","/media/videos/backgrounds/fontaine1_compressed.mp4","/media/videos/backgrounds/trip2_compressed.mp4"]'></div>
      <div class="absolute inset-0 bg-black/60"></div>
      <div class="relative z-10 max-w-3xl p-6 hero-text">
        <h1 class="text-5xl font-extrabold mb-6" data-i18n="hero.title">L'immersion au cœur du jeu</h1>
          <p class="text-xl mb-2 txt-court" data-i18n="hero.subtitle1">Cartes, pièces et fiches prêtes à jouer pour vos parties D&D</p>
          <p class="text-xl mb-8 txt-court" data-i18n="hero.subtitle2">Conçues au Québec</p>
<a href="<?= langUrl('boutique.php') ?>" class="btn btn-primary btn-boutique" data-hide-price="1" data-i18n="hero.visitShop">
            Visiter la boutique
          </a>
      </div>
    </section>

    <!-- ===== PRODUITS PHARES ===== -->
    <?php
    // Chargement des produits
    $products = json_decode(file_get_contents(__DIR__ . '/data/products.json'), true);

    // Configuration de la section produits phares
    $sectionId = 'featured-home';
    $sectionTitle = __('home.featured.title', 'Produits Phares');
    $productIds = [
      'coin-merchant-essence-double',      // Essence du Marchand (pièces)
      'cards-adventurer-arsenal-190',      // Arsenal de l'Aventurier (cartes)
      'triptych-mystery-hero'              // Triptyques Mystères
    ];

    // Inclusion du partial réutilisable
    include __DIR__ . '/partials/products-grid-section.php';
    ?>

    <!-- ===== PRODUITS ===== -->
    <section id="produits" class="py-24 bg-gray-900/80 scroll-mt-24">
      <div class="max-w-6xl mx-auto px-6">
        <h3 class="text-4xl font-bold text-center mb-12" data-i18n="home.mustHave.heading">Nos Incontournables</h3>
        <div class="grid md:grid-cols-3 gap-10">
          <a href="<?= langUrl('boutique.php#cartes') ?>" class="card-product block no-underline hover:no-underline text-gray-100">
            <h4 class="text-center text-2xl font-semibold mb-2" data-i18n="home.mustHave.equipment.title">Cartes d’équipement</h4>
            <p class="text-center" data-i18n="home.mustHave.equipment.desc">560 cartes d’équipement illustrées pour remplacer la lecture fastidieuse du manuel</p>
              <img src="/media/content/cartes_equipement.webp" alt="560 cartes d'équipement illustrées" class="rounded mb-4" loading="lazy">
          </a>
          <a href="<?= langUrl('boutique.php#pieces') ?>" class="card-product block no-underline hover:no-underline text-gray-100">
            <h4 class="text-center text-2xl font-semibold mb-2" data-i18n="home.mustHave.coins.title">Pièces métalliques</h4>
            <p class="text-center" data-i18n="home.mustHave.coins.desc">Monnaie physique pour ressentir chaque trésor et influencer la chance à la table</p>
              <?php
    // Récupération dynamique du premier produit de pièces
    $products = json_decode(file_get_contents("data/products.json"), true);
    $coinProduct = null;
    foreach ($products as $id => $product) {
        if (str_starts_with($id, "coin-")) {
            $coinProduct = $product;
            break;
        }
    }
    $defaultImage = $coinProduct["images"][0] ?? "/media/products/bundles/default-coins.webp";
    ?>
    <img src="<?= $defaultImage ?>" alt="Pièces métalliques gravées pour JDR" class="rounded mb-4" loading="lazy">
          </a>
          <a href="<?= langUrl('boutique.php#triptyques') ?>" class="card-product block no-underline hover:no-underline text-gray-100">
            <h4 class="text-center text-2xl font-semibold mb-2" data-i18n="home.mustHave.triptych.title">Fiche Triptyque</h4>
            <p class="text-center" data-i18n="home.mustHave.triptych.desc">Créez et gérez votre perso sans ouvrir le moindre livre, sur trois volets robustes</p>
              <img src="/media/content/triptyque_fiche.webp" alt="Fiche de personnage triptyque rigide" class="rounded mb-4" loading="lazy">
          </a>
        </div>
      </div>
    </section>


<!-- ===== BOUTIQUE ===== -->
    <section id="boutique" class="py-16 bg-gray-900/80 scroll-mt-24">
      <div class="max-w-6xl mx-auto px-6 text-center">
        <h3 class="text-4xl font-bold mb-12" data-i18n="nav.shop">Boutique</h3>
          <p class="mb-8 txt-court"><span data-i18n="product.securePayment">Paiement sécurisé via Snipcart</span>
            <span class="payment-icons">
              <img src="/media/ui/payments/visa.svg" alt="Logo Visa" loading="lazy">
              <img src="/media/ui/payments/mastercard.svg" alt="Logo Mastercard" loading="lazy">
              <img src="/media/ui/payments/american-express.svg" alt="Logo American Express" loading="lazy">
          </p>
        <div class="flex flex-col md:flex-row gap-6 justify-center">
          <a href="<?= langUrl('boutique.php') ?>" class="btn btn-primary btn-boutique" data-hide-price="1" data-i18n="hero.visitShop">
            Visiter la boutique
          </a>
          <a href="<?= langUrl('index.php#contact') ?>" class="btn btn-outline" data-i18n="contact.requestQuote">
            Demander un devis
          </a>
        </div>
      </div>
    </section>

 

    
    <!-- ===== ACTUALITÉS ===== -->
    <section id="actus" class="py-16 bg-gray-900/80 scroll-mt-24">
      <div class="max-w-5xl mx-auto px-6">
    
        <h3 class="text-4xl font-bold text-center mb-12" data-i18n="news.flim2025.heading">Actualité – FLIM 2025</h3>
    
        <!-- Résumé d'article - dupliquer ce bloc pour chaque actualité -->
        <article class="bg-gray-800 p-6 rounded-xl shadow-lg mb-12">
            <img src="/media/content/es_tu_game_demo.webp" class="rounded mb-6 w-full" alt="One‑shot niveau 20 avec pièces" loading="lazy">
          <h4 class="text-3xl font-semibold mb-4" data-i18n="news.flim2025.title">Des héros niveau 20, un raton trop tenace, et… nos pièces</h4>
          <p class="text-lg text-gray-200 mb-4" data-i18n="news.flim2025.summary">
            Notre première démonstration de pièces au FLIM 2025 a pris la forme d’un one-shot légendaire animé par Es‑tu Game ?.
          </p>
          <div class="text-center">
            <a href="<?= langUrl('actualites/es-tu-game.php') ?>" class="btn btn-primary" data-i18n="news.flim2025.read">Lire l’article</a>
          </div>
        </article>
    
        <!-- Bloc témoignage -->
        <article class="bg-gray-800 p-6 mt-12 rounded-xl shadow-lg">
          <img src="/media/content/avisJoueurFlim2025.webp" class="rounded mb-4 w-full" alt="Avis joueurs sur pièces" loading="lazy">
          <h4 class="text-center text-2xl font-semibold mb-4" data-i18n="testimonials.quote1.title">« Finis les combats contre nos feuilles de personnage ! »</h4>
          <p class="text-lg leading-relaxed text-gray-200" data-i18n="testimonials.quote1.intro">
            De nombreux joueurs présents l’affirment : les pièces physiques changent tout.
          </p>

          <p class="text-lg leading-relaxed text-gray-200" data-i18n="testimonials.quote1.p1">
    Terminées les colonnes de chiffres gribouillées à la hâte sur une fiche froissée. Désormais, chaque joueur sentait le poids réel du butin, glissant entre ses doigts comme un héritage oublié. Un trésor devenu palpable. À chaque échange, c’était tout le corps qui réagissait : la main qui hésite, l’œil qui soupèse, la gorge qui sèche. Le trésor prenait chair. Il devenait enjeu dramatique, émotion viscérale, c’est un événement, un souvenir marquant...
  </p>

          <p class="text-lg mt-4 leading-relaxed text-gray-200">
            <strong data-i18n="testimonials.quote1.p2strong">Fini les combats contre les feuilles de perso</strong>, <span data-i18n="testimonials.quote1.p2rest">les recherches interminables dans les livres pendant que les autres décrochent, ou les longues sessions 0 de création de personnages qui découragent avant même que le jeu commence. Avec Geek & Dragon, tout commence quand la première pièce tombe sur la table.</span>
          </p>
        </article>
    
      </div>
    </section>


<!-- ===== CONTACT ===== -->
    <section id="contact" class="py-16 bg-gray-900/80 scroll-mt-32">
      <div class="max-w-xl mx-auto text-center">
        <h3 class="text-4xl font-bold mb-6" data-i18n="nav.contact">Contact</h3>
        <img src="/media/content/team_brujah.webp" alt="Brujah" class="mx-auto h-32 w-32 rounded-full mb-4" loading="lazy">
          <p class="mb-2 txt-court"><strong>Brujah</strong> — <span data-i18n="contact.info.roleCommunity">Responsable produit & communauté</span></p>
          <p class="mb-2 txt-court"><a href="mailto:contact@geekndragon.com" class="text-indigo-400 hover:underline">contact@geekndragon.com</a></p>
          <p class="mb-4 txt-court"><a href="mailto:commande@geekndragon.com" class="text-indigo-400 hover:underline">commande@geekndragon.com</a></p>

          <!-- Logo Fabriqué au Québec -->
          <div class="inline-flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-xl px-8 py-4 my-6">
            <img src="/media/branding/logos/logo_fabrique_qc.png" alt="Fabriqué au Québec" class="h-20 w-auto" loading="lazy">
          </div>

          <div class="mt-6">
            <a href="<?= langUrl('index.php#contact') ?>" class="btn btn-primary" data-i18n="contact.requestQuote">
              Demander un devis
            </a>
          </div>
      </div>
    </section>

  </main>
 


  <?php include 'footer.php'; ?>
</body>
</html>
