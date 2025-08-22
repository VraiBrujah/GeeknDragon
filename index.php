<?php
declare(strict_types=1);
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

  <?php include 'header.php'; ?>

  <main id="main" class="pt-[calc(var(--header-height))]">
  

    <!-- ===== HERO ===== -->
    <section class="min-h-screen flex items-center justify-center text-center relative text-white">
      <div class="hero-videos absolute inset-0 w-full h-full" style="z-index:-1" data-main="videos/video-mage-hero.mp4" data-videos='["videos/video-cascade-hd.mp4","videos/video-fountain-11.mp4","videos/video-card-preview.mp4","videos/video-fountain-4.mp4","videos/video-fountain-3.mp4","videos/video-fountain-2.mp4","videos/video-fountain-1.mp4"]'></div>
      <div class="absolute inset-0 bg-black/60"></div>
      <div class="relative z-10 max-w-3xl p-6 hero-text">
        <h1 class="text-5xl font-extrabold mb-6" data-i18n="hero.title">Transformez vos parties D&D avec des trésors réels</h1>
          <p class="text-xl mb-2 txt-court" data-i18n="hero.subtitle1">Pièces métalliques, cartes illustrées et triptyques pour une immersion totale</p>
          <div class="flex items-center justify-center gap-2 mb-8 quebec-badge" data-quebec="true">
            <span class="text-xl txt-court font-semibold" data-i18n="hero.subtitle2">🍁 FABRIQUÉ AU QUÉBEC</span>
            <img src="/images/logo-fabrique-BqFMdtDT.png" alt="Logo Fabriqué au Québec" class="h-6 w-auto" loading="lazy">
            <span class="text-sm opacity-90">• QUALITÉ ARTISANALE</span>
          </div>
<a href="<?= langUrl('boutique.php') ?>" class="btn btn-primary" data-hide-price="1" data-i18n="hero.visitShop">
            Transformer mes parties maintenant
          </a>
      </div>
    </section>

    <!-- ===== BOUTIQUE & PRODUITS ===== -->
    <section id="produits" class="section-spacing bg-gray-900/80 scroll-mt-24" aria-labelledby="products-heading">
    <span id="boutique"></span>
      <div class="max-w-6xl mx-auto px-6">
        <h2 id="products-heading" class="text-center mb-4" data-i18n="nav.shop">Boutique</h2>
        <p class="text-xl text-center mb-12 text-secondary" data-i18n="home.mustHave.heading">Nos Incontournables</p>
        
        <div class="grid md:grid-cols-3 gap-8 mb-12">
          <a href="<?= langUrl('boutique.php#cartes') ?>" class="block group" aria-label="Voir les cartes d'équipement">
            <article class="bg-gray-800 p-6 rounded-xl shadow-lg transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl cursor-pointer">
              <img src="/images/optimized-modern/webp/cartes-equipement.webp" alt="560 cartes d'équipement illustrées" class="rounded mb-4 w-full" loading="lazy">
              <h3 class="text-center mb-3" data-i18n="home.mustHave.equipment.title">Cartes d'équipement</h3>
              <p class="text-center text-secondary mb-4" data-i18n="home.mustHave.equipment.desc">560 cartes d'équipement illustrées pour remplacer la lecture fastidieuse du manuel</p>
              <div class="btn btn-outline w-full group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-colors">
                Voir les trésors en action
              </div>
            </article>
          </a>
          
          <a href="<?= langUrl('boutique.php#pieces') ?>" class="block group" aria-label="Voir les pièces métalliques">
            <article class="bg-gray-800 p-6 rounded-xl shadow-lg transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl cursor-pointer">
              <img src="/images/optimized-modern/webp/coin-copper-10.webp" alt="Pièces métalliques gravées pour JDR" class="rounded mb-4 w-full" loading="lazy">
              <h3 class="text-center mb-3" data-i18n="home.mustHave.coins.title">Pièces métalliques</h3>
              <p class="text-center text-secondary mb-4" data-i18n="home.mustHave.coins.desc">Monnaie physique pour ressentir chaque trésor et influencer la chance à la table</p>
              <div class="btn btn-outline w-full group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-colors">
                Voir les trésors en action
              </div>
            </article>
          </a>
          
          <a href="<?= langUrl('boutique.php#triptyques') ?>" class="block group" aria-label="Voir les fiches triptyques">
            <article class="bg-gray-800 p-6 rounded-xl shadow-lg transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl cursor-pointer">
              <img src="/images/optimized-modern/webp/triptyque-fiche.webp" alt="Fiche de personnage triptyque rigide" class="rounded mb-4 w-full" loading="lazy">
              <h3 class="text-center mb-3" data-i18n="home.mustHave.triptych.title">Fiche Triptyque</h3>
              <p class="text-center text-secondary mb-4" data-i18n="home.mustHave.triptych.desc">Créez et gérez votre perso sans ouvrir le moindre livre, sur trois volets robustes</p>
              <div class="btn btn-outline w-full group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-colors">
                Voir les trésors en action
              </div>
            </article>
          </a>
        </div>

        <!-- Trust Signals Renforcés -->
        <div class="text-center mb-12">
          <div class="grid md:grid-cols-3 gap-6 mb-8">
            <div class="trust-badge bg-gray-800 p-4 rounded-xl">
              <div class="text-2xl mb-2">🏆</div>
              <div class="font-semibold text-indigo-300">Vu au FLIM 2025</div>
              <div class="text-sm text-gray-400">Démonstration officielle</div>
            </div>
            <div class="trust-badge bg-gray-800 p-4 rounded-xl">
              <div class="text-2xl mb-2">🇨🇦</div>
              <div class="font-semibold text-indigo-300">100% Québécois</div>
              <div class="text-sm text-gray-400">Conception & fabrication locale</div>
            </div>
            <div class="trust-badge bg-gray-800 p-4 rounded-xl">
              <div class="text-2xl mb-2">⚡</div>
              <div class="font-semibold text-indigo-300">Livraison 48h</div>
              <div class="text-sm text-gray-400">Partout au Canada</div>
            </div>
          </div>
        </div>

        <div class="text-center">
          <a href="<?= langUrl('boutique.php') ?>" class="btn btn-primary" data-hide-price="1" data-i18n="hero.visitShop">
            Visiter la boutique complète
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
            <img src="/images/optimized-modern/webp/es-tu-game-demo.webp" class="rounded mb-6 w-full" alt="One‑shot niveau 20 avec pièces" loading="lazy">
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
          <img src="/images/optimized-modern/webp/avisJoueurFlim2025.webp" class="rounded mb-4 w-full" alt="Avis joueurs sur pièces" loading="lazy">
          <h4 class="text-center text-2xl font-semibold mb-4" data-i18n="testimonials.quote1.title">« Finis les combats contre nos feuilles de personnage ! »</h4>
          <p class="text-lg leading-relaxed text-gray-200" data-i18n="testimonials.quote1.intro">
            De nombreux joueurs le confirment : les pièces physiques changent tout.
          </p>

          <p class="text-lg leading-relaxed text-gray-200" data-i18n="testimonials.quote1.p1">
    Terminées les colonnes de chiffres gribouillées à la hâte sur une fiche froissée. Désormais, chaque joueur sent le poids réel du butin, glissant entre ses doigts comme un héritage oublié. Un trésor devenu palpable. À chaque échange, tout le corps réagit : la main hésite, l’œil soupèse, la gorge se serre. Le trésor prend chair. Il devient enjeu dramatique, émotion viscérale, souvenir marquant.
  </p>

          <p class="text-lg mt-4 leading-relaxed text-gray-200">
            <strong data-i18n="testimonials.quote1.p2strong">Finies aussi les batailles contre les feuilles de personnage</strong>, <span data-i18n="testimonials.quote1.p2rest">les recherches interminables dans les manuels pendant que les autres décrochent… ou encore les sessions 0 qui s’étirent. La « session 0 », c’est ce moment censé préparer le jeu : on crée les personnages, on définit les règles, on équipe les héros. Mais souvent, elle s’allonge en « 0.1 », « 0.2 », « 0.3 »… plusieurs soirées passées à remplir des cases plutôt qu’à vivre des aventures.<br><br>Avec Geek & Dragon, tout change : plus besoin d’administratif à rallonge. L’aventure commence au premier cling quand la pièce tombe sur la table.</span>
          </p>
        </article>

        <!-- Bloc témoignage 2 -->
        <article class="bg-gray-800 p-6 mt-12 rounded-xl shadow-lg">
          <p class="text-lg leading-relaxed text-gray-200" data-i18n="testimonials.quote2.text">
            Ma grande découverte au FLIM, mes enfants sont tombés en amours avec les pièces et depuis font pleins de tâches pour pouvoir échanger leur point contre une chasse au trésor qui pourront avoir leur propre coffre au trésor. Merci à Mathieu pour offrir ce super ajout pour l'initiation des enfants aux jeux de rôles.
          </p>
          <p class="mt-4 text-right text-gray-200" data-i18n="testimonials.quote2.author">— Gabrielle</p>
        </article>

      </div>
    </section>


<!-- ===== CONTACT ===== -->
    <section id="contact" class="py-32 scroll-mt-40" style="background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%); position: relative; overflow: hidden; padding-top: 10rem;">
      <!-- Effet de fond animé -->
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%); z-index: 1;"></div>
      
      <div class="max-w-3xl mx-auto text-center px-6" style="position: relative; z-index: 2;">
        <!-- Titre avec style premium -->
        <h3 class="text-5xl font-bold mb-4" style="font-family: 'Cinzel', serif; background: linear-gradient(135deg, #f1f5f9 0%, #c7d2fe 50%, #8b5cf6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;" data-i18n="nav.contact">Contact</h3>
        
        <!-- Ligne décorative -->
        <div style="width: 100px; height: 3px; background: linear-gradient(90deg, transparent, #8b5cf6, transparent); margin: 0 auto 2rem;"></div>
        
        <!-- Carte de contact avec effet premium -->
        <div style="background: linear-gradient(145deg, #1e293b 0%, #334155 100%); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 20px; padding: 3rem; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 40px rgba(139, 92, 246, 0.1); margin: 2rem auto; max-width: 600px;">
          
		  
          <!-- Photo avec bordure lumineuse -->
          <div style="position: relative; display: inline-block; margin-bottom: 2rem;">
            <img src="/images/optimized-modern/webp/team-brujah.webp" alt="Brujah" class="rounded h-48 w-48" loading="lazy" style="--rounded-border-color: transparent;">
            <!-- Badge de statut -->
            <div style="position: absolute; bottom: 10px; right: 10px; background: #10b981; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #1e293b;"></div>
          </div>
          
          <!-- Informations avec style amélioré -->
          <h4 class="text-2xl font-bold mb-3" style="color: #f1f5f9; font-family: 'Cinzel', serif;">Brujah</h4>
          <p class="text-lg mb-4" style="color: #c7d2fe;"><span data-i18n="contact.info.roleCommunity">Responsable produit & communauté</span></p>
          
          <!-- Séparateur -->
          <div style="width: 60px; height: 2px; background: #8b5cf6; margin: 1.5rem auto;"></div>
          
          <!-- Contacts avec icônes -->
          <div class="space-y-3">
            <p class="text-lg flex items-center justify-center gap-3">
              <svg class="w-5 h-5" style="color: #8b5cf6;" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
              </svg>
              <a href="mailto:contact@geekndragon.com" class="hover:underline" style="color: #a855f7; font-weight: 600; transition: all 0.3s;">contact@geekndragon.com</a>
            </p>
            
            <p class="text-lg flex items-center justify-center gap-3">
              <svg class="w-5 h-5" style="color: #8b5cf6;" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
              </svg>
              <a href="tel:+14387642612" class="hover:underline" style="color: #a855f7; font-weight: 600; transition: all 0.3s;">+1 438 764-2612</a>
            </p>
          </div>
          
          <!-- Boutons d'action -->
          <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <!-- Bouton demander un devis temporairement désactivé (emails perdus 70% du temps) -->
            <!--
            <a href="<?= langUrl('index.php#contact') ?>" class="btn btn-primary px-8 py-3" style="background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%); font-weight: 600;">
              <svg class="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"></path>
              </svg>
              <span data-i18n="contact.requestQuote">Demander un devis</span>
            </a>
            -->
            <a href="https://discord.gg/VaPZtZFC" class="btn btn-outline px-8 py-3" style="border: 2px solid #8b5cf6; color: #c7d2fe; font-weight: 600;" target="_blank">
              <svg class="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Rejoindre Discord
            </a>
          </div>
        </div>
        
        <!-- Message d'encouragement -->
        <p class="text-lg mt-8" style="color: #94a3b8; font-style: italic;">
          "N'hésitez pas à nous contacter pour toute question ou demande spéciale !"
        </p>
      </div>
    </section>

  </main>
 

   
  <?php include 'footer.php'; ?>
  <script src="/js/app.js"></script>
  <script src="/js/hero-videos.js"></script>
</body>
</html>
