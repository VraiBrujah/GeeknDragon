<?php
require __DIR__ . '/../bootstrap.php';
$config = require __DIR__ . '/../config.php';
$active = 'actus';
require __DIR__ . '/../i18n.php';
$title  = $translations['meta']['news']['flim2025']['title'] ?? 'Geek & Dragon';
$metaDescription = $translations['meta']['news']['flim2025']['desc'] ?? '';
$ogImage = '/media/content/es_tu_game_demo.webp';
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang) ?>">
<?php include '../head-common.php'; ?>
<link rel="preload" as="image" href="/media/videos/demos/poster-video1.webp">
<link rel="preload" as="image" href="/media/videos/demos/poster-video2.webp">
<link rel="preload" as="image" href="/media/videos/demos/poster-video3.webp">
<style>
  /* Assurer que le poster et la vidéo ont exactement la même taille */
  .video-container {
    position: relative;
    aspect-ratio: 16/9;
    background-color: #1f2937;
  }
  .video-container video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .video-loader {
    transition: opacity 0.3s ease;
  }
</style>
<body>
  <?php
  ob_start();
  include '../snipcart-init.php';
  $snipcartInit = ob_get_clean();
  include '../header.php';
  echo $snipcartInit;
  ?>

  <main id="main" class="pt-[var(--header-height)]">
    <section id="actus" class="py-16 bg-gray-900/80">
      <div class="max-w-5xl mx-auto px-6">
        <h2 class="text-4xl font-bold text-center mb-12" data-i18n="news.flim2025.heading">Actualité – FLIM 2025</h2>

        <!-- Article complet : Es-tu Game ? -->
        <article class="bg-gray-800 p-6 rounded-xl shadow-lg">
          <img loading="lazy" src="/media/content/es_tu_game_demo.webp" class="rounded mb-6 w-full" alt="One‑shot niveau 20 avec pièces">

          <h1 class="text-3xl font-semibold mb-4" data-i18n="news.flim2025.title">Des héros niveau 20, un raton trop tenace, et… nos pièces</h1>

          <div class="space-y-8 text-lg leading-relaxed text-gray-200">

            <p data-i18n="news.flim2025.p1">
              Lors du premier jour du <strong>Festival Ludique International de Montréal</strong>, notre toute première démonstration publique de monnaies a pris la forme d'un <strong>one-shot légendaire</strong>. Nos pièces furent lancées comme autant de dés du destin. Elles virevoltaient dans l'air, retombaient dans un tintement métallique profond, déclenchant aussitôt une vague d'émerveillement. Les regards s'élargissaient. Les voix s'élevaient, entre rires et émerveillement. La matière même du jeu de rôle venait de changer.
            </p>

            <p data-i18n="news.flim2025.p2">
              Rien de tout cela n'aurait été possible sans notre allié dans cette aventure : <strong>Es-tu Game ?</strong>, la référence québécoise des parties endiablées sur YouTube, Et surtout, l'incontournable, le fabuleux <strong>Pierre‑Louis Renaud</strong>. Conteur de plan, forgeron d'univers, il est ce MJ légendaire qu'aucun archidiable n'ose défier. Même à Sigil, les doyens du multivers murmurent son nom avec respect… et un brin de jalousie. Car s'il existe un Plan où l'on croise un meilleur maître du jeu, c'est sans doute que Pierre‑Louis y a lancé ses dés. Et pour notre plus grand plaisir, il a invoqué l'un de ses one-shots les plus déjantés : une aventure de niveau 20 d'une absurdi... intensité épique jamais vue.
            </p>

            <p data-i18n="news.flim2025.p3">
              Un véritable feu d'artifice de chaos contrôlé, mettant en scène trois figures cultes de ses campagnes passées :
            </p>

            <ul class="list-disc list-inside space-y-4">
              <li data-i18n="news.flim2025.li1">
                <strong>Gratis</strong>, incarné par Dave Belisle (Les Appendices) : un gnome artificier aussi exalté qu'incontrôlable, alchimiste des sauces aux effets souvent explosifs… et toujours inconnus. Pour lui, offrir une goutte de sa dernière mixture est une marque d'affection – que le destinataire survive ou non. Ses sauces, instables au possible, ont tendance à déclencher des effets imprévisibles : inversion de gravité, torrent de larmes noires comme de l'encre fraîche, ou valse murale verticale. Même les ennemis ne sont pas à l'abri de sa générosité épicée.
              </li>

              <li data-i18n="news.flim2025.li2">
                <strong>Marlin</strong>, brillamment interprété par Jean‑François Provençal (Les Appendices), voleur illusionniste aussi insaisissable qu'improbable. Stratège à la logique alternative, d'un courage sélectif mais d'un charme désarmant, il s'illustre par sa propension à fuir avec élégance, à voler avec panache, et à se retrouver, sans jamais l'avoir cherché, au cœur des situations les plus absurdes. À croire que l'univers entier conspire pour faire de lui le pivot du chaos.
              </li>

              <li data-i18n="news.flim2025.li3">
                <strong>Tana</strong>, l'inoubliable barbare à la hache bien affûtée, incarnée par Rosanne Berry. Redoutée pour sa devise immuable : frapper d'abord, réfléchir ensuite, poser des questions... rarement. Elle est aussi célèbre pour ses charges fracassantes que pour ses larmes sincères. Une colosse au cœur tendre, véritable raz-de-marée émotionnel et tranchant, qui ne s'attendait certainement pas à se heurter à un raton laveur… résistant à ses attaques pourtant capables de fendre la trame de l'espace-temps.
              </li>
            </ul>

            <p data-i18n="news.flim2025.p4">
              Ce trio improbable pensait savourer une retraite paisible dans un village endormi… jusqu'à ce qu'il ne puisse résister à l'envie de subtiliser quelques pièces aux badauds émerveillés.
            </p>

            <p data-i18n="news.flim2025.p5">
              Marlin et Tana, toujours en quête d'un brin d'adrénaline, s'amusaient à dérober la petite bourse des voyageurs conquis par leur légende, avant même que l'idée de « vol » ne leur effleure l'esprit. Gratis, un brin coupable, suivait presque à contre-cœur, cantonnant ses larcins à des actes de bravoure bon enfant.
            </p>

            <p data-i18n="news.flim2025.p6">
              Mais la tentative de cambriolage de la demeure du maire tourna court. Un bruissement dans les poubelles, un raton laveur trop curieux et un compost mal ordonné plongèrent l'opération dans le chaos, stoppant net les exploits de nos trois héros-voyous.
            </p>

            <p class="text-indigo-300 font-medium" data-i18n="news.flim2025.p7">
              Le point culminant ? Un raton laveur cosmique aspiré dans les étoiles, emporté par une gravité inversée, tandis que le maire, en larmes, vidait son coffre dans un tourbillon de pièces de cuivre et d'argent en hommage à ses fils disparus, et que le public et la table éclatait de rire dans une immersion totale.
            </p>

            <p class="mt-4 italic text-sm text-gray-400">
              <span data-i18n="news.flim2025.youtube">Retrouvez la table complète sur la chaîne YouTube officielle :</span>
              <a href="https://www.youtube.com/@estugameofficieljdr" class="underline text-indigo-400" target="_blank" data-i18n="news.flim2025.youtubeLink">
                Es‑tu Game ? — Jeux de rôle
              </a>
            </p>

          </div>

          <!-- Intégration élégante des vidéos avec lazy loading -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">

            <div class="relative group video-container">
              <div class="video-loader absolute inset-0 flex items-center justify-center bg-gray-900/90 rounded z-10">
                <img src="/media/ui/roue.webp" alt="Chargement" class="w-16 h-16 animate-spin">
              </div>
              <video id="video1"
                     data-src="/media/videos/demos/leMaireDoneUnePieceDargentFLIM_compressed.mp4"
                     poster="/media/videos/demos/poster-video1.webp"
                     class="rounded shadow-lg transition-transform duration-300 lazy-video"
                     playsinline preload="none"></video>
              <button class="mute-btn hidden group-hover:block absolute top-2 right-2 z-10
                             bg-black/60 text-white text-sm px-2 py-1 rounded"
                      data-video="video2">🔊</button>
                <p class="text-center text-sm mt-2 text-gray-300 txt-court" data-i18n="news.flim2025.video1">
                  Le maire rend hommage aux trois héros en argent véritable
                </p>
            </div>

            <div class="relative group video-container">
              <div class="video-loader absolute inset-0 flex items-center justify-center bg-gray-900/90 rounded z-10">
                <img src="/media/ui/roue.webp" alt="Chargement" class="w-16 h-16 animate-spin">
              </div>
              <video id="video2"
                     data-src="/media/videos/demos/pileoufaceled2duFLIM2025_compressed.mp4"
                     poster="/media/videos/demos/poster-video2.webp"
                     class="rounded shadow-lg transition-transform duration-300 lazy-video"
                     playsinline preload="none"></video>
              <button class="mute-btn hidden group-hover:block
                             absolute top-2 right-2 z-10 bg-black/60 text-white text-sm px-2 py-1 rounded"
                      data-video="video1">🔊</button>
                <p class="text-center text-sm mt-2 text-gray-300 txt-court" data-i18n="news.flim2025.video2">
                  Quand tout se joue sur une pièce… dragon ou étoile ?
                </p>
            </div>

            <div class="relative group video-container">
              <div class="video-loader absolute inset-0 flex items-center justify-center bg-gray-900/90 rounded z-10">
                <img src="/media/ui/roue.webp" alt="Chargement" class="w-16 h-16 animate-spin">
              </div>
              <video id="video3"
                     data-src="/media/videos/demos/finestugameFLIM2025_compressed.mp4"
                     poster="/media/videos/demos/poster-video3.webp"
                     class="rounded shadow-lg transition-transform duration-300 lazy-video"
                     playsinline preload="none"></video>
              <button class="mute-btn hidden group-hover:block absolute top-2 right-2 z-10
                             bg-black/60 text-white text-sm px-2 py-1 rounded"
                      data-video="video3">🔊</button>
                <p class="text-center text-sm mt-2 text-gray-300 txt-court" data-i18n="news.flim2025.video3">
                  Final de la game : Le raton, les étoiles… et le chaos
                </p>
            </div>

          </div>

        </article>

      </div>
    </section>
  </main>

  <?php include '../footer.php'; ?>

  <script>
  // Lazy loading des vidéos avec IntersectionObserver
  document.addEventListener('DOMContentLoaded', () => {
    const lazyVideos = document.querySelectorAll('.lazy-video');

    const videoObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const video = entry.target;
          const container = video.closest('.video-container');
          const loader = container.querySelector('.video-loader');

          // Charger la vidéo
          video.src = video.dataset.src;
          video.load();

          // Cacher le loader une fois chargé
          video.addEventListener('loadeddata', () => {
            if (loader) {
              loader.style.opacity = '0';
              setTimeout(() => loader.remove(), 300);
            }
          });

          // Arrêter d'observer cette vidéo
          observer.unobserve(video);
        }
      });
    }, {
      rootMargin: '50px' // Commencer à charger 50px avant que l'élément soit visible
    });

    lazyVideos.forEach(video => videoObserver.observe(video));
  });
  </script>
  <script src="/js/app.js"></script>
</body>
</html>
