<?php
declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

$config = require __DIR__ . '/../config.php';
$translator = require __DIR__ . '/../i18n.php';

$lang = $translator->getCurrentLanguage();
$title = __('news.es_tu_game.title', 'Actualités – FLIM 2025 | Geek & Dragon');
$metaDescription = __('news.es_tu_game.description', 'Revivez notre démonstration Es-tu Game ? au FLIM 2025 avec vidéos et anecdotes immersives.');
$ogImage = '/images/optimized-modern/webp/es-tu-game-demo.webp';
$active = 'actus';
$extraHead = $extraHead ?? '';
$disableAudioPlayer = true; // Pas de lecteur audio sur cette page
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang, ENT_QUOTES, 'UTF-8'); ?>">
<?php include __DIR__ . '/../head-common.php'; ?>
<body>
<?php include __DIR__ . '/../header.php'; ?>
<main id="main" class="pt-[var(--header-height)]">
  <section id="actus" class="py-24 bg-gray-900/80">
    <div class="max-w-5xl mx-auto px-6">
      <h2 class="text-4xl font-bold text-center mb-12 text-white" data-i18n="news.flim2025.heading">
        <?= __("news.flim2025.heading", "Actualité – FLIM 2025"); ?>
      </h2>

      <article class="bg-gray-800 p-6 md:p-10 rounded-xl shadow-lg">
        <img
          loading="lazy"
          src="/images/optimized-modern/webp/es-tu-game-demo.webp"
          class="rounded mb-6 w-full"
          alt="One‑shot niveau 20 avec pièces"
        >

        <h1 class="text-3xl font-semibold mb-4" data-i18n="news.flim2025.title">
          <?= __("news.flim2025.title", "Des héros niveau 20, un raton trop tenace, et… nos pièces"); ?>
        </h1>

        <div class="space-y-8 text-lg leading-relaxed text-gray-200">
          <p data-i18n="news.flim2025.p1">
            <?= __("news.flim2025.p1", "Lors du premier jour du <strong>Festival Ludique International de Montréal</strong>, notre toute première démonstration publique de monnaies a pris la forme d'un <strong>one-shot légendaire</strong>. Nos pièces furent lancées comme autant de dés du destin. Elles virevoltaient dans l'air, retombaient dans un tintement métallique profond, déclenchant aussitôt une vague d'émerveillement. Les regards s'élargissaient. Les voix s'élevaient, entre rires et émerveillement. La matière même du jeu de rôle venait de changer."); ?>
          </p>

          <p data-i18n="news.flim2025.p2">
            <?= __("news.flim2025.p2", "Rien de tout cela n'aurait été possible sans notre allié dans cette aventure : <strong>Es-tu Game ?</strong>, la référence québécoise des parties endiablées sur YouTube, Et surtout, l'incontournable, le fabuleux <strong>Pierre‑Louis Renaud</strong>. Conteur de plan, forgeron d'univers, il est ce MJ légendaire qu'aucun archidiable n'ose défier. Même à Sigil, les doyens du multivers murmurent son nom avec respect… et un brin de jalousie. Car s'il existe un Plan où l'on croise un meilleur maître du jeu, c'est sans doute que Pierre‑Louis y a lancé ses dés. Et pour notre plus grand plaisir, il a invoqué l'un de ses one-shots les plus déjantés : une aventure de niveau 20 d'une absurdi... intensité épique jamais vue."); ?>
          </p>

          <p data-i18n="news.flim2025.p3">
            <?= __("news.flim2025.p3", "Un véritable feu d'artifice de chaos contrôlé, mettant en scène trois figures cultes de ses campagnes passées :"); ?>
          </p>

          <ul class="list-disc list-inside space-y-4">
            <li data-i18n="news.flim2025.li1">
              <?= __("news.flim2025.li1", "<strong>Gratis</strong>, incarné par Dave Belisle (Les Appendices) : un gnome artificier aussi exalté qu'incontrôlable, alchimiste des sauces aux effets souvent explosifs… et toujours inconnus. Pour lui, offrir une goutte de sa dernière mixture est une marque d'affection – que le destinataire survive ou non. Ses sauces, instables au possible, ont tendance à déclencher des effets imprévisibles : inversion de gravité, torrent de larmes noires comme de l'encre fraîche, ou valse murale verticale. Même les ennemis ne sont pas à l'abri de sa générosité épicée."); ?>
            </li>

            <li data-i18n="news.flim2025.li2">
              <?= __("news.flim2025.li2", "<strong>Marlin</strong>, brillamment interprété par Jean‑François Provençal (Les Appendices), voleur illusionniste aussi insaisissable qu'improbable. Stratège à la logique alternative, d'un courage sélectif mais d'un charme désarmant, il s'illustre par sa propension à fuir avec élégance, à voler avec panache, et à se retrouver, sans jamais l'avoir cherché, au cœur des situations les plus absurdes. À croire que l'univers entier conspire pour faire de lui le pivot du chaos."); ?>
            </li>

            <li data-i18n="news.flim2025.li3">
              <?= __("news.flim2025.li3", "<strong>Tana</strong>, l'inoubliable barbare à la hache bien affûtée, incarnée par Rosanne Berry. Redoutée pour sa devise immuable : frapper d'abord, réfléchir ensuite, poser des questions... rarement. Elle est aussi célèbre pour ses charges fracassantes que pour ses larmes sincères. Une colosse au cœur tendre, véritable raz-de-marée émotionnel et tranchant, qui ne s'attendait certainement pas à se heurter à un raton laveur… résistant à ses attaques pourtant capables de fendre la trame de l'espace-temps."); ?>
            </li>
          </ul>

          <p data-i18n="news.flim2025.p4">
            <?= __("news.flim2025.p4", "Ce trio improbable pensait savourer une retraite paisible dans un village endormi… jusqu'à ce qu'il ne puisse résister à l'envie de subtiliser quelques pièces aux badauds émerveillés."); ?>
          </p>

          <p data-i18n="news.flim2025.p5">
            <?= __("news.flim2025.p5", "Marlin et Tana, toujours en quête d'un brin d'adrénaline, s'amusaient à dérober la petite bourse des voyageurs conquis par leur légende, avant même que l'idée de « vol » ne leur effleure l'esprit. Gratis, un brin coupable, suivait presque à contre-cœur, cantonnant ses larcins à des actes de bravoure bon enfant."); ?>
          </p>

          <p data-i18n="news.flim2025.p6">
            <?= __("news.flim2025.p6", "Mais la tentative de cambriolage de la demeure du maire tourna court. Un bruissement dans les poubelles, un raton laveur trop curieux et un compost mal ordonné plongèrent l'opération dans le chaos, stoppant net les exploits de nos trois héros-voyous."); ?>
          </p>

          <p class="text-indigo-300 font-medium" data-i18n="news.flim2025.p7">
            <?= __("news.flim2025.p7", "Le point culminant ? Un raton laveur cosmique aspiré dans les étoiles, emporté par une gravité inversée, tandis que le maire, en larmes, vidait son coffre dans un tourbillon de pièces de cuivre et d'argent en hommage à ses fils disparus, et que le public et la table éclatait de rire dans une immersion totale."); ?>
          </p>

          <p class="mt-4 italic text-sm text-gray-400">
            <span data-i18n="news.flim2025.youtube">
              <?= __("news.flim2025.youtube", "Retrouvez la table complète sur la chaîne YouTube officielle :"); ?>
            </span>
            <a
              href="https://www.youtube.com/@estugameofficieljdr"
              class="underline text-indigo-400"
              target="_blank"
              rel="noopener"
              data-i18n="news.flim2025.youtubeLink"
            >
              <?= __("news.flim2025.youtubeLink", "Es‑tu Game ? — Jeux de rôle"); ?>
            </a>
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div>
            <video
              src="/videos/leMaireDoneUnePieceDargentFLIM.mp4"
              class="rounded shadow-lg w-full aspect-video"
              controls
              playsinline
              preload="metadata"
            ></video>
            <p class="text-center text-sm mt-2 text-gray-300" data-i18n="news.flim2025.video1">
              <?= __("news.flim2025.video1", "Le maire rend hommage aux trois héros en argent véritable"); ?>
            </p>
          </div>

          <div>
            <video
              src="/videos/pileoufaceled2duFLIM2025.mp4"
              class="rounded shadow-lg w-full aspect-video"
              controls
              playsinline
              preload="metadata"
            ></video>
            <p class="text-center text-sm mt-2 text-gray-300" data-i18n="news.flim2025.video2">
              <?= __("news.flim2025.video2", "Quand tout se joue sur une pièce… dragon ou étoile ?"); ?>
            </p>
          </div>

          <div>
            <video
              src="/videos/finestugameFLIM2025.mp4"
              class="rounded shadow-lg w-full aspect-video"
              controls
              playsinline
              preload="metadata"
            ></video>
            <p class="text-center text-sm mt-2 text-gray-300" data-i18n="news.flim2025.video3">
              <?= __("news.flim2025.video3", "Final de la game : Le raton, les étoiles… et le chaos"); ?>
            </p>
          </div>
        </div>
      </article>
    </div>
  </section>
</main>
<?php include __DIR__ . '/../footer.php'; ?>
</body>
</html>