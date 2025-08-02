<?php
$active = 'index';
$title  = 'Geek & Dragon | Aides de jeu immersives';
$metaDescription = "Cartes, pièces et fiches pour enrichir vos parties de D&D.";
?>
<!DOCTYPE html>
<html lang="fr">
<?php include 'head-common.php'; ?>

<body class="bg-[url('images/bg_texture.jpg')] bg-cover bg-fixed text-gray-100">

  <?php include 'header.php'; ?>

  <main class="pt-0">

    <!-- ===== HERO ===== -->
    <section class="min-h-screen flex items-center justify-center text-center relative">
      <img src="images/hero_flbg.jpg" class="absolute inset-0 w-full h-full object-cover opacity-50" alt="">
      <div class="relative z-10 max-w-3xl p-6">
        <h2 class="text-5xl font-extrabold mb-6">L'immersion au cœur du jeu</h2>
          <p class="text-xl mb-2 txt-court">Cartes, pièces et fiches prêtes à jouer pour vos parties D&D</p>
          <p class="text-xl mb-8 txt-court">Conçues au Québec</p>
<a href="boutique.php" class="btn-primary">
            Visiter la boutique
          </a>
      </div>
    </section>

    <!-- ===== PRODUITS ===== -->
    <section id="produits" class="py-16 bg-gray-900/80 scroll-mt-32">
      <div class="max-w-6xl mx-auto px-6">
        <h3 class="text-4xl font-bold text-center mb-12">Nos Incontournables</h3>
        <div class="grid md:grid-cols-3 gap-10">
          <div class="card-product">
            <h4 class="text-2xl font-semibold mb-2">Cartes d’équipement</h4>
            <p>560 cartes illustrées pour remplacer la lecture fastidieuse du manuel.</p>
            <img src="images/cartes_equipement.jpg" alt="Cartes d'équipement" class="rounded mb-4">
          </div>
          <div class="card-product">
            <h4 class="text-2xl font-semibold mb-2">Pièces métalliques</h4>
            <p>Monnaie physique pour ressentir chaque trésor et influencer la chance à la table.</p>
            <img src="images/pieces_metalliques.png" alt="Pièces métalliques" class="rounded mb-4">
          </div>
          <div class="card-product">
            <h4 class="text-2xl font-semibold mb-2">Fiche Triptyque</h4>
            <p>Créez et gérez votre perso sans ouvrir le moindre livre, sur trois volets robustes.</p>
            <img src="images/triptyque_fiche.jpg" alt="Triptyque" class="rounded mb-4">
          </div>
        </div>
      </div>
    </section>


<!-- ===== BOUTIQUE ===== -->
    <section id="boutique" class="py-16 bg-gray-900/80 scroll-mt-32">
      <div class="max-w-6xl mx-auto px-6 text-center">
        <h3 class="text-4xl font-bold mb-12">Boutique</h3>
          <p class="mb-8 txt-court">Paiement sécurisé &nbsp;|&nbsp; Stocks mis à jour en temps réel.</p>
        <div class="flex flex-col md:flex-row gap-6 justify-center">
          <a href="boutique.php" class="btn-primary">
            Visiter la boutique
          </a>
          <a href="contact.php" class="btn-outline">
            Demander un devis
          </a>
        </div>
      </div>
    </section>

 

    
    <!-- ===== ACTUALITÉS ===== -->
    <section id="actus" class="py-16 bg-gray-900/80 scroll-mt-24">
      <div class="max-w-5xl mx-auto px-6">
    
        <h3 class="text-4xl font-bold text-center mb-12">Actualité – FLIM 2025</h3>
    
        <!-- Bloc principal : Es-tu Game ? -->
        <article class="bg-gray-800 p-6 rounded-xl shadow-lg">
          <img src="images/es_tu_game_demo.jpg" class="rounded mb-6 w-full" alt="One‑shot niveau 20 avec pièces">
    
          <h4 class="text-3xl font-semibold mb-4">Des héros niveau 20, un raton trop tenace, et… nos pièces</h4>
    
            <div class="space-y-8 text-lg leading-relaxed text-gray-200">
            
              <p>
                Lors du premier jour du <strong>Festival Ludique International de Montréal</strong>, notre toute première démonstration publique de monnaies a pris la forme d’un <strong>one-shot légendaire</strong>. Nos pièces furent lancées comme autant de dés du destin. Elles virevoltaient dans l’air, retombaient dans un tintement métallique profond, déclenchant aussitôt une vague d’émerveillement. Les regards s’élargissaient. Les voix s’élevaient, entre rires et émerveillement. La matière même du jeu de rôle venait de changer.
              </p>
            
              <p>
                Rien de tout cela n’aurait été possible sans notre allié dans cette aventure : <strong>Es-tu Game ?</strong>, la référence québécoise des parties endiablées sur YouTube, Et surtout, l’incontournable, le fabuleux <strong>Pierre‑Louis Renaud</strong>. Conteur de plan, forgeron d’univers, il est ce MJ légendaire qu’aucun archidiable n’ose défier. Même à Sigil, les doyens du multivers murmurent son nom avec respect… et un brin de jalousie. Car s’il existe un Plan où l’on croise un meilleur maître du jeu, c’est sans doute que Pierre‑Louis y a lancé ses dés. Et pour notre plus grand plaisir, il a invoqué l’un de ses one-shots les plus déjantés : une aventure de niveau 20 d’une absurdi... intensité épique jamais vue. 
              </p>
            
              <p>
                Un véritable feu d’artifice de chaos contrôlé, mettant en scène trois figures cultes de ses campagnes passées :
              </p>
            
              <ul class="list-disc list-inside space-y-4">
                <li>
                  <strong>Gratis</strong>, incarné par Dave Belisle (Les Appendices) : un gnome artificier aussi exalté qu’incontrôlable, alchimiste des sauces aux effets souvent explosifs… et toujours inconnus. Pour lui, offrir une goutte de sa dernière mixture est une marque d’affection – que le destinataire survive ou non. Ses sauces, instables au possible, ont tendance à déclencher des effets imprévisibles : inversion de gravité, torrent de larmes noires comme de l’encre fraîche, ou valse murale verticale. Même les ennemis ne sont pas à l’abri de sa générosité épicée.
                </li>
            
                <li>
                  <strong>Marlin</strong>, brillamment interprété par Jean‑François Provençal (Les Appendices), voleur illusionniste aussi insaisissable qu’improbable. Stratège à la logique alternative, d’un courage sélectif mais d’un charme désarmant, il s’illustre par sa propension à fuir avec élégance, à voler avec panache, et à se retrouver, sans jamais l’avoir cherché, au cœur des situations les plus absurdes. À croire que l’univers entier conspire pour faire de lui le pivot du chaos.
                </li>
            
                <li>
                  <strong>Tana</strong>, l’inoubliable barbare à la hache bien affûtée, incarnée par Rosanne Berry. Redoutée pour sa devise immuable : frapper d’abord, réfléchir ensuite, poser des questions... rarement. Elle est aussi célèbre pour ses charges fracassantes que pour ses larmes sincères. Une colosse au cœur tendre, véritable raz-de-marée émotionnel et tranchant, qui ne s’attendait certainement pas à se heurter à un raton laveur… résistant à ses attaques pourtant capables de fendre la trame de l’espace-temps.
                </li>
              </ul>
            
              <p>
                Ce trio improbable pensait savourer une retraite paisible dans un village endormi… jusqu’à ce qu’il ne puisse résister à l’envie de subtiliser quelques pièces aux badauds émerveillés.
              </p>
            
              <p>
                Marlin et Tana, toujours en quête d’un brin d’adrénaline, s’amusaient à dérober la petite bourse des voyageurs conquis par leur légende, avant même que l’idée de « vol » ne leur effleure l’esprit. Gratis, un brin coupable, suivait presque à contre-cœur, cantonnant ses larcins à des actes de bravoure bon enfant.
              </p>
            
              <p>
                Mais la tentative de cambriolage de la demeure du maire tourna court. Un bruissement dans les poubelles, un raton laveur trop curieux et un compost mal ordonné plongèrent l’opération dans le chaos, stoppant net les exploits de nos trois héros-voyous.
              </p>
            
              <p class="text-indigo-300 font-medium">
                Le point culminant ? Un raton laveur cosmique aspiré dans les étoiles, emporté par une gravité inversée, tandis que le maire, en larmes, vidait son coffre dans un tourbillon de pièces de cuivre et d’argent en hommage à ses fils disparus, et que le public et la table éclatait de rire dans une immersion totale.
              </p>
            
              <p class="mt-4 italic text-sm text-gray-400">
                Retrouvez la table complète sur la chaîne YouTube officielle :
                <a href="https://www.youtube.com/@estugameofficieljdr" class="underline text-indigo-400" target="_blank">
                  Es‑tu Game ? — Jeux de rôle
                </a>
              </p>
            
            </div>

    
<!-- Intégration élégante des vidéos -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
    
  <div class="relative group">
    <video id="video2" src="videos/leMaireDoneUnePieceDargentFLIM.mp4"
           class="rounded shadow-lg w-full aspect-video" playsinline preload="metadata"></video>
    <button class="mute-btn hidden group-hover:block absolute top-2 right-2 z-10
                   bg-black/60 text-white text-sm px-2 py-1 rounded"
            data-video="video2">🔊</button>
      <p class="text-center text-sm mt-2 text-gray-300 txt-court">
        Le maire rend hommage aux trois héros en argent véritable
      </p>
  </div>

  <div class="relative group">
    <video id="video1" src="videos/pileoufaceled2duFLIM2025.mp4"
           class="rounded shadow-lg w-full aspect-video" playsinline preload="metadata"></video>
    <button class="mute-btn hidden group-hover:block
                   absolute top-2 right-2 z-10 bg-black/60 text-white text-sm px-2 py-1 rounded"
            data-video="video1">🔊</button>
      <p class="text-center text-sm mt-2 text-gray-300 txt-court">
        Quand tout se joue sur une pièce… dragon ou étoile ?
      </p>
  </div>

  <div class="relative group">
    <video id="video3" src="videos/finestugameFLIM2025.mp4"
           class="rounded shadow-lg w-full aspect-video" playsinline preload="metadata"></video>
    <button class="mute-btn hidden group-hover:block absolute top-2 right-2 z-10
                   bg-black/60 text-white text-sm px-2 py-1 rounded"
            data-video="video3">🔊</button>
      <p class="text-center text-sm mt-2 text-gray-300 txt-court">
        Final de la game : Le raton, les étoiles… et le chaos
      </p>
  </div>

</div>


        </article>
    
        <!-- Bloc témoignage -->
        <article class="bg-gray-800 p-6 mt-12 rounded-xl shadow-lg">
          <img src="images/avisJoueurFlim2025.jpg" class="rounded mb-4 w-full" alt="Avis joueurs sur pièces">
          <h4 class="text-2xl font-semibold mb-4">« Finis les combats contre nos feuilles de personnage ! »</h4>
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
        <img src="images/team_brujah.jpg" alt="Brujah" class="mx-auto h-32 w-32 rounded-full mb-4">
          <p class="mb-2 txt-court"><strong>Brujah</strong> — Responsable produit & communauté</p>
          <p class="mb-2 txt-court"><a href="mailto:contact@geekndragon.com" class="text-indigo-400 hover:underline">contact@geekndragon.com</a></p>
          <p class="txt-court"><a href="tel:+14387642612" class="text-indigo-400 hover:underline">+1 438 764-2612</a></p>
      </div>
    </section>

  </main>
 

   
  <?php include 'footer.php'; ?>
  <script src="js/app.js"></script>
</body>
</html>
