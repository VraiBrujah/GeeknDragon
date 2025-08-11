<?php
require __DIR__ . '/bootstrap.php';
$config = require __DIR__ . '/config.php';
$active = 'index';
$title  = 'Geek & Dragon | Aides de jeu immersives';
$metaDescription = "Cartes, pièces et fiches pour enrichir vos parties de D&D.";
?>
<!DOCTYPE html>
<html lang="fr">
<?php include 'head-common.php'; ?>

<body>

  <?php include 'header.php'; ?>
  <?php include 'snipcart-init.php'; ?>

  <main class="pt-12">

    <!-- ===== HERO ===== -->
    <section class="min-h-screen flex items-center justify-center text-center relative text-white">
      <video id="hero-video" class="absolute inset-0 w-full h-full object-cover hero-fade" style="z-index:-1" poster="images/hero_mage.jpg" preload="metadata" muted playsinline autoplay loop>
        <source data-src="videos/coins_cascadeMage.mp4" type="video/mp4">
        <source data-src="videos/coins_cascadey.webm" type="video/webm">
        <img src="images/hero_mage.jpg" alt="" role="presentation" class="w-full h-full object-cover hero-fade">
      </video>
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div class="relative z-10 max-w-3xl p-6">
        <h2 class="text-5xl font-extrabold mb-6" data-i18n="hero.title">L'immersion au cœur du jeu</h2>
          <p class="text-xl mb-2 txt-court" data-i18n="hero.subtitle1">Cartes, pièces et fiches prêtes à jouer pour vos parties D&D</p>
          <p class="text-xl mb-8 txt-court" data-i18n="hero.subtitle2">Conçues au Québec</p>
<a href="boutique.php" class="btn btn-primary" data-hide-price="1" data-i18n="hero.visitShop">
            Visiter la boutique
          </a>
      </div>
    </section>

    <!-- ===== PRODUITS ===== -->
    <section id="produits" class="py-16 bg-gray-900/80 scroll-mt-24">
      <div class="max-w-6xl mx-auto px-6">
        <h3 class="text-4xl font-bold text-center mb-12">Nos Incontournables</h3>
        <div class="grid md:grid-cols-3 gap-10">
          <a href="boutique.php#cartes" class="card-product block no-underline hover:no-underline text-gray-100">
            <h4 class="text-center text-2xl font-semibold mb-2">Cartes d’équipement</h4>
            <p class="text-center">560 cartes d’équipement illustrées pour remplacer la lecture fastidieuse du manuel</p>
              <img src="images/cartes_equipement.jpg" alt="560 cartes d’équipement illustrées" class="rounded mb-4" loading="lazy">
          </a>
          <a href="boutique.php#pieces" class="card-product block no-underline hover:no-underline text-gray-100">
            <h4 class="text-center text-2xl font-semibold mb-2">Pièces métalliques</h4>
            <p class="text-center">Monnaie physique pour ressentir chaque trésor et influencer la chance à la table</p>
              <img src="images/Piece/pro/lot10Piece2-300.png" alt="Pièces métalliques gravées pour JDR" class="rounded mb-4" loading="lazy">
          </a>
          <a href="boutique.php#triptyques" class="card-product block no-underline hover:no-underline text-gray-100">
            <h4 class="text-center text-2xl font-semibold mb-2">Fiche Triptyque</h4>
            <p class="text-center">Créez et gérez votre perso sans ouvrir le moindre livre, sur trois volets robustes</p>
              <img src="images/triptyque_fiche.jpg" alt="Fiche de personnage triptyque rigide" class="rounded mb-4" loading="lazy">
          </a>
        </div>
      </div>
    </section>


<!-- ===== BOUTIQUE ===== -->
    <section id="boutique" class="py-16 bg-gray-900/80 scroll-mt-24">
      <div class="max-w-6xl mx-auto px-6 text-center">
        <h3 class="text-4xl font-bold mb-12">Boutique</h3>
          <p class="mb-8 txt-court">Paiement sécurisé via Snipcart
            <span class="payment-icons">
              <img src="/images/payments/visa.svg" alt="Logo Visa" loading="lazy">
              <img src="/images/payments/mastercard.svg" alt="Logo Mastercard" loading="lazy">
              <img src="/images/payments/american-express.svg" alt="Logo American Express" loading="lazy">
            </span>
            &nbsp;|&nbsp; Stocks mis à jour en temps réel.
          </p>
        <div class="flex flex-col md:flex-row gap-6 justify-center">
          <a href="boutique.php" class="btn btn-primary" data-hide-price="1">
            Visiter la boutique
          </a>
          <a href="contact.php" class="btn btn-outline">
            Demander un devis
          </a>
        </div>
      </div>
    </section>

 

    
    <!-- ===== ACTUALITÉS ===== -->
    <section id="actus" class="py-16 bg-gray-900/80 scroll-mt-24">
      <div class="max-w-5xl mx-auto px-6">
    
        <h3 class="text-4xl font-bold text-center mb-12">Actualité – FLIM 2025</h3>
    
        <!-- Résumé d'article - dupliquer ce bloc pour chaque actualité -->
        <article class="bg-gray-800 p-6 rounded-xl shadow-lg mb-12">
            <img src="/images/es_tu_game_demo.jpg" class="rounded mb-6 w-full" alt="One‑shot niveau 20 avec pièces" loading="lazy">
          <h4 class="text-3xl font-semibold mb-4">Des héros niveau 20, un raton trop tenace, et… nos pièces</h4>
          <p class="text-lg text-gray-200 mb-4">
            Notre première démonstration de pièces au FLIM 2025 a pris la forme d’un one-shot légendaire animé par Es‑tu Game ?.
          </p>
          <div class="text-center">
            <a href="actualites/es-tu-game.php" class="btn btn-primary">Lire l’article</a>
          </div>
        </article>
    
        <!-- Bloc témoignage -->
        <article class="bg-gray-800 p-6 mt-12 rounded-xl shadow-lg">
          <img src="images/avisJoueurFlim2025.jpg" class="rounded mb-4 w-full" alt="Avis joueurs sur pièces" loading="lazy">
          <h4 class="text-center text-2xl font-semibold mb-4">« Finis les combats contre nos feuilles de personnage ! »</h4>
          <p class="text-lg leading-relaxed text-gray-200">
            De nombreux joueurs présents l’affirment : les pièces physiques changent tout.
          </p>

<p class="text-lg leading-relaxed text-gray-200">
    Terminées les colonnes de chiffres gribouillées à la hâte sur une fiche froissée. Désormais, chaque joueur sentait le poids réel du butin, glissant entre ses doigts comme un héritage oublié. Un trésor devenu palpable. À chaque échange, c’était tout le corps qui réagissait : la main qui hésite, l’œil qui soupèse, la gorge qui sèche. Le trésor prenait chair. Il devenait enjeu dramatique, émotion viscérale, c’est un événement, un souvenir marquant...
  </p>

          <p class="text-lg mt-4 leading-relaxed text-gray-200">
            <strong>Fini les combats contre les feuilles de perso</strong>, les recherches interminables dans les livres pendant que les autres décrochent, ou les longues sessions 0 / 0.1 / 0.2 / 0.3... de création de personnages qui découragent avant même que le jeu commence. Avec Geek & Dragon, tout commence quand la pièce tombe sur la table.
          </p>
        </article>
    
      </div>
    </section>


<!-- ===== CONTACT ===== -->
    <section id="contact" class="py-16 bg-gray-900/80 scroll-mt-32">
      <div class="max-w-xl mx-auto text-center">
        <h3 class="text-4xl font-bold mb-6">Contact</h3>
        <img src="images/team_brujah.jpg" alt="Brujah" class="mx-auto h-32 w-32 rounded-full mb-4" loading="lazy">
          <p class="mb-2 txt-court"><strong>Brujah</strong> — Responsable produit & communauté</p>
          <p class="mb-2 txt-court"><a href="mailto:contact@geekndragon.com" class="text-indigo-400 hover:underline">contact@geekndragon.com</a></p>
          <p class="txt-court"><a href="tel:+14387642612" class="text-indigo-400 hover:underline">+1 438 764-2612</a></p>
      </div>
    </section>

  </main>
 

   
  <?php include 'footer.php'; ?>
  <script src="/js/app.js"></script>
  <script>
      document.addEventListener('DOMContentLoaded', () => {
        const video = document.getElementById('hero-video');
        if (!video) return;
        const sources = video.querySelectorAll('source[data-src]');
        const loadAndPlay = () => {
          sources.forEach((source) => {
            source.src = source.dataset.src;
          });
          video.load();
          video.play();
        };
        if ('IntersectionObserver' in window) {
          const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                loadAndPlay();
                observer.unobserve(video);
              }
            });
          }, { threshold: 0.5 });
          observer.observe(video);
        } else {
          loadAndPlay();
        }
      });
  </script>
</body>
</html>
