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
<?php
// Utiliser shop-grid.css externe au lieu de CSS inline dupliqué
$extraHead = '<link rel="stylesheet" href="/css/shop-grid.css?v=' . filemtime(__DIR__.'/css/shop-grid.css') . '">';
include 'head-common.php';
?>

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
      <link rel="preload" as="video" href="/media/videos/backgrounds/mage_compressed.mp4" type="video/mp4">
      <div class="hero-videos absolute inset-0 w-full h-full" style="z-index:-1" data-main="/media/videos/backgrounds/mage_compressed.mp4" data-videos='["/media/videos/backgrounds/cascade_HD_compressed.mp4","/media/videos/backgrounds/fontaine11_compressed.mp4","/media/videos/backgrounds/Carte1_compressed.mp4","/media/videos/backgrounds/fontaine4_compressed.mp4","/media/videos/backgrounds/fontaine3_compressed.mp4","/media/videos/backgrounds/fontaine2_compressed.mp4","/media/videos/backgrounds/fontaine1_compressed.mp4","/media/videos/backgrounds/trip2_compressed.mp4"]'></div>
      <div class="absolute inset-0 bg-black/60"></div>
      <div class="relative z-10 max-w-3xl p-6 hero-text">
        <h1 class="text-5xl font-extrabold mb-6" data-i18n="hero.title">Vos trésors D&D méritent d'exister</h1>
          <p class="text-xl mb-4" data-i18n="hero.subtitle1">Pièces gravées, cartes illustrées, fiches robustes. Touchez votre aventure.</p>
          <p class="text-lg mb-8 text-gray-300" data-i18n="hero.subtitle2">Fabriqué au Québec • Utilisable 10+ ans • Livraison rapide</p>
        <div class="flex flex-col md:flex-row gap-4 justify-center">
          <a href="#featured-products"
             class="btn btn-primary btn-boutique"
             data-hide-price="1"
             aria-label="<?= __('hero.discoverCreations', 'Découvrir nos créations') ?>"
             title="<?= __('hero.discoverCreations', 'Découvrir nos créations') ?>">
            <span class="btn-text-overlay">
              <span class="hidden md:inline"><?= __('btnOverlay.discover.desktop', 'Découvrir') ?></span>
              <span class="md:hidden"><?= __('btnOverlay.discover.mobile', 'Voir') ?></span>
            </span>
          </a>
          <a href="<?= langUrl('boutique.php') ?>"
             class="btn btn-primary btn-contact"
             aria-label="<?= __('hero.shopNow', 'Voir toute la collection') ?>"
             title="<?= __('hero.shopNow', 'Voir toute la collection') ?>">
            <span class="btn-text-overlay">
              <span class="hidden md:inline"><?= __('btnOverlay.shop.desktop', 'L\'Échoppe') ?></span>
              <span class="md:hidden"><?= __('btnOverlay.shop.mobile', 'Échoppe') ?></span>
            </span>
          </a>
        </div>
      </div>
    </section>

    <!-- ===== PRODUITS PHARES ===== -->
    <section id="featured-products" class="py-24 bg-gray-900/80 scroll-mt-24">
      <div class="max-w-6xl mx-auto px-6">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-4" data-i18n="home.featured.title">Commencez par l'essentiel</h2>
        <p class="text-center text-gray-300 mb-12 max-w-2xl mx-auto" data-i18n="home.featured.subtitle">
          Nos produits les plus populaires pour transformer votre première session
        </p>

        <!-- Grille produits (chargement instantané comme dans boutique) -->
        <div class="shop-grid"></div>

        <!-- CTA vers boutique complète -->
        <div class="text-center mt-12">
          <a href="<?= langUrl('boutique.php') ?>"
             class="btn btn-primary btn-boutique"
             data-hide-price="1"
             aria-label="<?= __('home.featured.seeAll', 'Voir toute la collection') ?>"
             title="<?= __('home.featured.seeAll', 'Voir toute la collection') ?>">
            <span class="btn-text-overlay">
              <span class="hidden md:inline"><?= __('btnOverlay.collection.desktop', 'Toute la collection') ?></span>
              <span class="md:hidden"><?= __('btnOverlay.collection.mobile', 'Tout voir') ?></span>
            </span>
          </a>
        </div>
      </div>
    </section>

    <!-- ===== POURQUOI PHYSIQUE ===== -->
    <section id="why-physical" class="py-20 bg-gray-800/90">
      <div class="max-w-6xl mx-auto px-6">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-4" data-i18n="home.why.title">Pourquoi du physique en 2025 ?</h2>
        <p class="text-center text-gray-300 mb-16 max-w-2xl mx-auto" data-i18n="home.why.subtitle">
          Parce que les meilleurs souvenirs ne s'effacent pas au prochain patch
        </p>

        <div class="grid md:grid-cols-3 gap-8">
          <!-- Bénéfice 1 -->
          <div class="text-center p-6 bg-gray-900/50 rounded-xl">
            <div class="text-5xl mb-4">🎲</div>
            <h3 class="text-xl font-bold mb-3" data-i18n="home.why.benefit1.title">Souvenirs tactiles</h3>
            <p class="text-gray-300" data-i18n="home.why.benefit1.desc">
              Toucher vos trésors crée des émotions que les chiffres sur fiche ne peuvent jamais offrir
            </p>
          </div>

          <!-- Bénéfice 2 -->
          <div class="text-center p-6 bg-gray-900/50 rounded-xl">
            <div class="text-5xl mb-4">⚔️</div>
            <h3 class="text-xl font-bold mb-3" data-i18n="home.why.benefit2.title">Durabilité légendaire</h3>
            <p class="text-gray-300" data-i18n="home.why.benefit2.desc">
              10+ ans d'aventures garanties. Pas de mise à jour, pas d'abonnement, juste du solide
            </p>
          </div>

          <!-- Bénéfice 3 -->
          <div class="text-center p-6 bg-gray-900/50 rounded-xl">
            <div class="flex items-center justify-center">
              <div class="flex flex-col items-center">
                <img src="/media/branding/logos/logo_fabrique_qc.png" alt="Fabriqué au Québec" class="h-16 mb-3" loading="lazy">
                <h3 class="text-xl font-bold mb-3" data-i18n="home.why.benefit3.title">Artisanat québécois</h3>
				<p class="text-gray-300" data-i18n="home.why.benefit3.desc">
				  Conçu et fabriqué au Québec. Chaque achat soutient la création locale
				</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>





    <!-- ===== ACTUALITÉS ===== -->
    <section id="actus" class="py-16 bg-gray-900/80 scroll-mt-24">
      <div class="max-w-5xl mx-auto px-6">
    
        <h3 class="text-4xl font-bold text-center mb-12" data-i18n="news.flim2025.heading">Actualité – FLIM 2025</h3>
    
        <!-- Résumé d'article - dupliquer ce bloc pour chaque actualité -->
        <article class="bg-gray-800 p-6 rounded-xl shadow-lg mb-12">
            <img src="/media/content/es_tu_game_demo.webp" class="rounded mb-6 w-full" alt="One‑shot niveau 20 avec pièces" loading="lazy" decoding="async">
          <h4 class="text-3xl font-semibold mb-4" data-i18n="news.flim2025.title">Des héros niveau 20, un raton trop tenace, et… nos pièces</h4>
          <p class="text-lg text-gray-200 mb-4" data-i18n="news.flim2025.summary">
            Notre première démonstration de pièces au FLIM 2025 a pris la forme d’un one-shot légendaire animé par Es‑tu Game ?.
          </p>
          <div class="text-center">
            <a href="<?= langUrl('actualites/es-tu-game.php') ?>"
               class="btn btn-primary btn-actualite"
               aria-label="<?= __('news.flim2025.read', 'Lire l\'article') ?>"
               title="<?= __('news.flim2025.read', 'Lire l\'article') ?>"
  ">
              <span class="btn-text-overlay">
                <span class="hidden md:inline"><?= __('btnOverlay.news.desktop', 'Chroniques') ?></span>
                <span class="md:hidden"><?= __('btnOverlay.news.mobile', 'Actus') ?></span>
              </span>
            </a>
          </div>
        </article>
    
        <!-- Bloc témoignage -->
        <article class="bg-gray-800 p-6 mt-12 rounded-xl shadow-lg">
          <img src="/media/content/avisJoueurFlim2025.webp" class="rounded mb-4 w-full" alt="Avis joueurs sur pièces" loading="lazy" decoding="async">
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
        <img src="/media/content/team_brujah.webp" alt="Brujah" class="mx-auto h-32 w-32 rounded-full mb-4" loading="lazy" decoding="async">
          <p class="mb-2 txt-court"><strong>Brujah</strong> — <span data-i18n="contact.info.roleCommunity">Responsable produit & communauté</span></p>
          <p class="mb-2 txt-court"><a href="mailto:contact@geekndragon.com" class="text-indigo-400 hover:underline">contact@geekndragon.com</a></p>
          <p class="mb-4 txt-court"><a href="mailto:commande@geekndragon.com" class="text-indigo-400 hover:underline">commande@geekndragon.com</a></p>

          <div class="mt-6">
            <a href="<?= langUrl('index.php#contact') ?>"
               class="btn btn-primary btn-contact"
               aria-label="<?= __('contact.requestQuote', 'Demander un devis') ?>"
               title="<?= __('contact.requestQuote', 'Demander un devis') ?>">
              <span class="btn-text-overlay">
                <span class="hidden md:inline"><?= __('btnOverlay.contact.desktop', 'Message') ?></span>
                <span class="md:hidden"><?= __('btnOverlay.contact.mobile', 'Contact') ?></span>
              </span>
            </a>
          </div>
      </div>
    </section>

  </main>



  <?php include 'footer.php'; ?>

</body>
</html>
