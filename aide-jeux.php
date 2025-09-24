<?php
require __DIR__ . '/bootstrap.php';
$config = require __DIR__ . '/config.php';
$active = 'aide-jeux';
require __DIR__ . '/i18n.php';

// Charger les données des produits pour le système de recommandation
$products_data = json_decode(file_get_contents(__DIR__ . '/data/products.json'), true) ?? [];

$title = 'Aide de Jeux - ' . ($translations['meta']['home']['title'] ?? 'Geek & Dragon');
$metaDescription = 'Guide complet pour vos accessoires D&D Geek & Dragon : triptyques de personnage, cartes d\'équipement, monnaie physique et convertisseur. Tout pour enrichir vos parties de jeu de rôle.';
$metaUrl = 'https://' . ($_SERVER['HTTP_HOST'] ?? 'geekndragon.com') . '/aide-jeux.php';

// Ajouter les traductions spécifiques pour cette page
$gameHelpTranslations = [
    'fr' => [
        'gameHelp' => [
            'hero' => [
                'title' => 'Guides d\'Aide aux Jeux',
                'subtitle' => 'Maîtrisez tous vos accessoires Geek & Dragon : triptyques, cartes et monnaie'
            ],
            'triptychGuide' => [
                'title' => 'Les 3 Triptyques de votre Personnage',
                'description' => 'Chaque personnage D&D nécessite 3 triptyques cartonnés : Espèce, Classe et Historique.',
                'species' => 'Triptyque d\'Espèce',
                'class' => 'Triptyque de Classe', 
                'background' => 'Triptyque d\'Historique'
            ],
            'howToUse' => [
                'title' => 'Comment utiliser vos triptyques',
                'fold' => 'Pliez en 3 volets',
                'organize' => 'Organisez sur votre table',
                'reference' => 'Consultez pendant le jeu'
            ],
            'comingSoon' => 'Bientôt disponible'
        ]
    ],
    'en' => [
        'gameHelp' => [
            'hero' => [
                'title' => 'Game Help Guides',
                'subtitle' => 'Master all your Geek & Dragon accessories: triptychs, cards and currency'
            ],
            'triptychGuide' => [
                'title' => 'Your Character\'s 3 Triptychs',
                'description' => 'Each D&D character requires 3 cardboard triptychs: Species, Class and Background.',
                'species' => 'Species Triptych',
                'class' => 'Class Triptych',
                'background' => 'Background Triptych'
            ],
            'howToUse' => [
                'title' => 'How to use your triptychs',
                'fold' => 'Fold into 3 panels',
                'organize' => 'Organize on your table', 
                'reference' => 'Reference during play'
            ],
            'comingSoon' => 'Coming soon'
        ]
    ]
];

$translations = array_merge_recursive($translations, $gameHelpTranslations[$lang]);

$extraHead = <<<HTML
<style>
.tool-content { display: none; }
.tool-content.active { display: block; }
.tool-nav-btn.active { background: linear-gradient(135deg, #4f46e5, #7c3aed); }
.triptych-preview {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
  cursor: pointer;
}
.triptych-preview:hover {
  transform: scale(1.02);
  box-shadow: 0 15px 35px rgba(0,0,0,0.4);
}
.triptych-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}
.flip-container {
  perspective: 1000px;
  width: 100%;
  height: 600px;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}
.flipper {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.8s;
  transform-style: preserve-3d;
}
.flip-container.flipped .flipper {
  transform: rotateY(180deg);
}
.front, .back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  overflow: hidden;
}
.back {
  transform: rotateY(180deg);
}
.triptych-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #1f2937;
}
.dice-roller {
  background: linear-gradient(135deg, #1f2937, #374151);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 2rem 0;
  border: 2px solid #4f46e5;
}
.dice-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
  margin: 1rem 0;
}
.stat-dice {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}
.stat-dice:hover {
  background: #7c3aed;
  transform: scale(1.05);
}
.dice-result {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  margin: 0.5rem 0;
  min-height: 2rem;
}
.roll-all-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}
.roll-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}
.usage-step {
  background: linear-gradient(135deg, #1f2937, #374151);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: transform 0.3s ease;
}
.usage-step:hover {
  transform: translateY(-5px);
}
.step-number {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin: 0 auto 1rem;
}
.flip-container-card {
  perspective: 1000px;
  width: 280px;
  height: 400px;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  margin: 0 auto;
}
.flipper-card {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.8s;
  transform-style: preserve-3d;
}
.flip-container-card.flipped .flipper-card {
  transform: rotateY(180deg);
}
.front-card, .back-card {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  overflow: hidden;
}
.back-card {
  transform: rotateY(180deg);
}
.card-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #1f2937;
}
</style>
HTML;
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang) ?>">
<?php include 'head-common.php'; ?>

<body data-page="aide-jeux">
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

<main id="main" class="pt-[var(--header-height)]">

  <!-- ===== HERO ===== -->
  <section class="min-h-screen flex items-center justify-center text-center relative text-white">
    <div class="hero-videos absolute inset-0 w-full h-full" style="z-index:-1" data-main="/media/videos/backgrounds/trip2_compressed.mp4" data-videos='["/media/videos/backgrounds/Carte1_compressed.mp4","/media/videos/backgrounds/cascade_HD_compressed.mp4","/media/videos/backgrounds/fontaine1_compressed.mp4","/media/videos/backgrounds/fontaine2_compressed.mp4","/media/videos/backgrounds/fontaine3_compressed.mp4","/media/videos/backgrounds/fontaine4_compressed.mp4","/media/videos/backgrounds/fontaine11_compressed.mp4"]'></div>
    <div class="absolute inset-0 bg-black/60"></div>
    <div class="relative z-10 max-w-4xl p-6 hero-text">
      <h1 class="text-5xl font-extrabold mb-6" data-i18n="gameHelp.hero.title">
        <?= $translations['gameHelp']['hero']['title'] ?? 'Guide des Triptyques' ?>
      </h1>
      <p class="text-xl mb-8 txt-court" data-i18n="gameHelp.hero.subtitle">
        <?= $translations['gameHelp']['hero']['subtitle'] ?? 'Maîtrisez vos fiches de personnage Geek & Dragon' ?>
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <a href="#guide-triptyques" class="btn btn-primary">Découvrir les Triptyques</a>
        <a href="#guide-cartes" class="btn btn-primary">Guide des Cartes</a>
        <a href="#guide-monnaie" class="btn btn-primary">Guide de la Monnaie</a>
        <a href="<?= langUrl('boutique.php#triptyques') ?>" class="btn btn-outline">Acheter mes Triptyques</a>
      </div>
    </div>
  </section>

  <!-- ===== NAVIGATION RAPIDE ===== -->
  <section class="py-12 bg-gray-800/50">
    <div class="max-w-6xl mx-auto px-6">
      <h2 class="text-2xl font-bold text-center mb-8 text-white">Navigation Rapide</h2>
      <div class="grid md:grid-cols-3 gap-6">
        <a href="#guide-triptyques" class="group bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl p-6 border border-indigo-500/30 hover:border-indigo-400/50 transition-all">
          <div class="text-center">
            <div class="text-4xl mb-3">📜</div>
            <h3 class="text-xl font-bold text-indigo-400 mb-2">Guide des Triptyques</h3>
            <p class="text-gray-300 text-sm">Espèce, Classe, Historique - D&D 2024</p>
          </div>
        </a>
        
        <a href="#guide-cartes" class="group bg-gradient-to-br from-emerald-900/50 to-teal-900/50 rounded-xl p-6 border border-emerald-500/30 hover:border-emerald-400/50 transition-all">
          <div class="text-center">
            <div class="text-4xl mb-3">🃏</div>
            <h3 class="text-xl font-bold text-emerald-400 mb-2">Guide des Cartes</h3>
            <p class="text-gray-300 text-sm">Armes, Équipements, Sorts</p>
          </div>
        </a>
        
        <a href="#guide-monnaie" class="group bg-gradient-to-br from-amber-900/50 to-yellow-900/50 rounded-xl p-6 border border-amber-500/30 hover:border-amber-400/50 transition-all">
          <div class="text-center">
            <div class="text-4xl mb-3">💰</div>
            <h3 class="text-xl font-bold text-amber-400 mb-2">Guide de la Monnaie</h3>
            <p class="text-gray-300 text-sm">Système monétaire + Convertisseur</p>
          </div>
        </a>
      </div>
    </div>
  </section>

  <!-- ===== INTRODUCTION AUX TRIPTYQUES ===== -->
  <section class="py-16 bg-gray-900/80">
    <div class="max-w-6xl mx-auto px-6 text-center">
      <h2 class="text-3xl md:text-4xl font-bold mb-8 text-indigo-400">
        Qu'est-ce qu'un triptyque Geek & Dragon ?
      </h2>
      <div class="max-w-4xl mx-auto">
        <p class="text-xl text-gray-300 mb-8 txt-court">
          Un triptyque est une fiche de personnage cartonnée pliable en 3 volets, conçue pour remplacer les fastidieuses recherches dans les manuels. 
          Chaque personnage D&D nécessite <strong>3 triptyques différents</strong> qui se complètent parfaitement.
        </p>
        
        <div class="grid md:grid-cols-3 gap-8 mt-12">
          <div class="bg-gradient-to-b from-emerald-900/30 to-emerald-800/20 p-6 rounded-xl border border-emerald-700/50">
            <div class="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">1</div>
            <h3 class="text-xl font-semibold mb-3 text-emerald-400">Triptyque d'Espèce</h3>
            <p class="text-gray-300">Toutes les capacités raciales, traits et bonus de votre espèce (Elfe, Nain, Humain...)</p>
          </div>
          
          <div class="bg-gradient-to-b from-blue-900/30 to-blue-800/20 p-6 rounded-xl border border-blue-700/50">
            <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">2</div>
            <h3 class="text-xl font-semibold mb-3 text-blue-400">Triptyque de Classe</h3>
            <p class="text-gray-300">Compétences, sorts, aptitudes et progression de votre classe (Guerrier, Magicien, Rôdeur...)</p>
          </div>
          
          <div class="bg-gradient-to-b from-purple-900/30 to-purple-800/20 p-6 rounded-xl border border-purple-700/50">
            <div class="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">3</div>
            <h3 class="text-xl font-semibold mb-3 text-purple-400">Triptyque d'Historique</h3>
            <p class="text-gray-300">Compétences sociales, équipements de départ et background de votre personnage</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== GALERIE DES TRIPTYQUES ===== -->
  <section id="guide-triptyques" class="py-24 bg-gray-900/80 scroll-mt-24">
    <div class="max-w-7xl mx-auto px-6">
      
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold mb-8" data-i18n="gameHelp.triptychGuide.title">
          Les 3 Triptyques de votre Personnage
        </h2>
        <p class="text-xl text-gray-300 max-w-4xl mx-auto txt-court">
          Découvrez en détail chaque type de triptyque. Cliquez sur les images pour voir le verso de chaque fiche.
        </p>
      </div>

      <!-- ===== LANCEUR DE DÉS POUR CARACTÉRISTIQUES ===== -->
      <div class="dice-roller">
        <h3 class="text-2xl font-bold mb-4 text-center text-yellow-400">🎲 Lanceur de Caractéristiques</h3>
        <p class="text-gray-300 text-center mb-4">
          <strong>D&D 2024 :</strong> Lancez 4d6 et gardez les 3 meilleurs résultats. 
          Vous ajouterez ensuite les bonus d'<strong>Historique</strong> (+2 et +1) dans le triptyque d'Historique.
        </p>
        
        <div class="dice-grid">
          <div class="text-center">
            <h4 class="font-semibold text-red-400 mb-2">Force</h4>
            <button class="stat-dice" onclick="rollStat('str')">Lancer</button>
            <div class="dice-result text-red-300" id="str-result">--</div>
          </div>
          <div class="text-center">
            <h4 class="font-semibold text-green-400 mb-2">Dextérité</h4>
            <button class="stat-dice" onclick="rollStat('dex')">Lancer</button>
            <div class="dice-result text-green-300" id="dex-result">--</div>
          </div>
          <div class="text-center">
            <h4 class="font-semibold text-orange-400 mb-2">Constitution</h4>
            <button class="stat-dice" onclick="rollStat('con')">Lancer</button>
            <div class="dice-result text-orange-300" id="con-result">--</div>
          </div>
          <div class="text-center">
            <h4 class="font-semibold text-blue-400 mb-2">Intelligence</h4>
            <button class="stat-dice" onclick="rollStat('int')">Lancer</button>
            <div class="dice-result text-blue-300" id="int-result">--</div>
          </div>
          <div class="text-center">
            <h4 class="font-semibold text-purple-400 mb-2">Sagesse</h4>
            <button class="stat-dice" onclick="rollStat('wis')">Lancer</button>
            <div class="dice-result text-purple-300" id="wis-result">--</div>
          </div>
          <div class="text-center">
            <h4 class="font-semibold text-pink-400 mb-2">Charisme</h4>
            <button class="stat-dice" onclick="rollStat('cha')">Lancer</button>
            <div class="dice-result text-pink-300" id="cha-result">--</div>
          </div>
        </div>
        
        <div class="text-center mt-4">
          <button class="roll-all-btn" onclick="rollAllStats()">🎲 Lancer toutes les caractéristiques</button>
        </div>
      </div>

      <div class="triptych-grid mb-16">
        
        <!-- Triptyque d'Espèce -->
        <div class="card-product">
          <div class="h-[6rem] mb-6 flex items-center justify-center">
            <h3 class="text-2xl font-bold text-center text-emerald-400 leading-tight">🧝 Espèce</h3>
          </div>
          
          <div class="flip-container" id="species-flip" onclick="flipCard('species-flip')">
            <div class="flipper">
              <div class="front">
                <img src="/media/game/triptychs/examples/race-aasimar-recto.webp" alt="Triptyque Espèce Aasimar - Recto" class="triptych-preview">
              </div>
              <div class="back">
                <img src="/media/game/triptychs/examples/race-aasimar-verso.webp" alt="Triptyque Espèce Aasimar - Verso" class="triptych-preview">
              </div>
            </div>
          </div>
          
          <div class="text-center h-[180px] flex flex-col justify-start">
            <h4 class="font-semibold mb-3 text-emerald-300">Exemple : Aasimar</h4>
            <p class="text-gray-300 text-sm mb-4">
              Traits raciaux, capacités innées, résistances et aptitudes d'espèce. 
              Le recto présente les statistiques principales, le verso détaille les capacités spéciales.
            </p>
            <ul class="text-gray-400 text-sm space-y-1">
              <li>• Traits et résistances raciaux</li>
              <li>• Sorts et capacités d'espèce</li>
              <li>• Langues et sens spéciaux</li>
              <li>• Aptitudes héréditaires</li>
            </ul>
          </div>
        </div>

        <!-- Triptyque de Classe -->
        <div class="card-product">
          <div class="h-[6rem] mb-6 flex items-center justify-center">
            <h3 class="text-2xl font-bold text-center text-blue-400 leading-tight">⚔️ Classe</h3>
          </div>
          
          <div class="flip-container" id="class-flip" onclick="flipCard('class-flip')">
            <div class="flipper">
              <div class="front">
                <img src="/media/game/triptychs/examples/classe-barbare-recto.webp" alt="Triptyque Classe Barbare - Recto" class="triptych-preview">
              </div>
              <div class="back">
                <img src="/media/game/triptychs/examples/classe-barbare-verso.webp" alt="Triptyque Classe Barbare - Verso" class="triptych-preview">
              </div>
            </div>
          </div>
          
          <div class="text-center h-[180px] flex flex-col justify-start">
            <h4 class="font-semibold mb-3 text-blue-300">Exemple : Barbare - Voie de l'Arbre-Monde</h4>
            <p class="text-gray-300 text-sm mb-4">
              Aptitudes de classe, progression de niveau et sous-classe. 
              Suivi des statistiques vitales et progression de personnage.
            </p>
            <ul class="text-gray-400 text-sm space-y-1">
              <li>• Initiative et jets contre la mort</li>
              <li>• Points de vie (max, actuels, temporaires)</li>
              <li>• Classe d'armure (avec/sans bouclier)</li>
              <li>• Rage et aptitudes de classe</li>
            </ul>
          </div>
        </div>

        <!-- Triptyque d'Historique -->
        <div class="card-product">
          <div class="h-[6rem] mb-6 flex items-center justify-center">
            <h3 class="text-2xl font-bold text-center text-purple-400 leading-tight">📜 Historique</h3>
          </div>
          
          <div class="flip-container" id="background-flip" onclick="flipCard('background-flip')">
            <div class="flipper">
              <div class="front">
                <img src="/media/game/triptychs/examples/historique-acolyte-recto.webp" alt="Triptyque Historique Acolyte - Recto" class="triptych-preview">
              </div>
              <div class="back">
                <img src="/media/game/triptychs/examples/historique-acolyte-verso.webp" alt="Triptyque Historique Acolyte - Verso" class="triptych-preview">
              </div>
            </div>
          </div>
          
          <div class="text-center h-[180px] flex flex-col justify-start">
            <h4 class="font-semibold mb-3 text-purple-300">Exemple : Acolyte</h4>
            <p class="text-gray-300 text-sm mb-4">
              <strong>Nouveau D&D 2024 :</strong> Les bonus de caractéristiques sont maintenant dans l'historique ! 
              Plus les compétences sociales, équipement et aptitudes spéciales.
            </p>
            <ul class="text-gray-400 text-sm space-y-1">
              <li>• <strong>Bonus de caractéristiques (2024)</strong></li>
              <li>• Compétences d'historique</li>
              <li>• Aptitude d'historique spéciale</li>
              <li>• Personnalité et roleplay</li>
            </ul>
          </div>
        </div>

      </div>

      <!-- ===== GUIDE DÉTAILLÉ DE REMPLISSAGE D&D 2024 ===== -->
      <div class="bg-gradient-to-r from-emerald-900/30 to-blue-900/30 rounded-xl p-8 border border-emerald-700/50 mt-16">
        <h3 class="text-3xl font-bold mb-8 text-center text-emerald-400">📝 Guide Détaillé de Remplissage (D&D 2024)</h3>
        
        <div class="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 mb-8">
          <h4 class="text-xl font-bold text-yellow-400 mb-2">⚠️ Nouveau dans D&D 2024 !</h4>
          <p class="text-gray-300">
            <strong>Important :</strong> Les bonus de caractéristiques sont maintenant assignés par l'<strong>Historique</strong>, 
            plus par l'Espèce ! C'est dans le triptyque d'Historique que vous noterez vos caractéristiques finales.
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 gap-8">

          <!-- Triptyque d'Historique - PREMIER car c'est là qu'on note les caractéristiques -->
          <div class="bg-purple-900/20 p-6 rounded-lg border border-purple-500/50">
            <h4 class="text-xl font-bold mb-4 text-purple-400">📜 1. Triptyque d'Historique (PRIORITÉ)</h4>
            
            <div class="space-y-4">
              <div class="border-l-4 border-purple-500 pl-4">
                <h5 class="font-semibold text-purple-300">1. Bonus de caractéristiques (NOUVEAU 2024)</h5>
                <p class="text-gray-300 text-sm">
                  <strong>C'est ICI que vous notez vos caractéristiques finales !</strong><br>
                  • Lancez 4d6 (gardez les 3 meilleurs) avec le lanceur ci-dessus<br>
                  • Ajoutez les bonus d'historique (+2 dans une carac, +1 dans une autre)<br>
                  • Notez le total final et le modificateur (ex: 16 = +3)<br>
                  • <em>Les espèces n'ont plus de bonus de caractéristiques fixes</em>
                </p>
              </div>
              
              <div class="border-l-4 border-purple-500 pl-4">
                <h5 class="font-semibold text-purple-300">2. Compétences et maîtrises (toutes sources)</h5>
                <p class="text-gray-300 text-sm">
                  <strong>Triptyque d'Historique = CENTRALISATION de toutes les compétences !</strong><br>
                  • Les 2 compétences d'historique<br>
                  • Compétences de classe (reportées depuis le triptyque de Classe)<br>
                  • Compétences raciales (reportées depuis le triptyque d'Espèce)<br>
                  • Maîtrises d'outils spécifiques<br>
                  • Aptitude d'historique unique (ex: Initié à la magie)
                </p>
              </div>
              
              <div class="border-l-4 border-purple-500 pl-4">
                <h5 class="font-semibold text-purple-300">3. Équipement et Personnalité</h5>
                <p class="text-gray-300 text-sm">
                  • Cartes d'équipement de départ fournies avec le triptyque<br>
                  • Remplissez les traits de personnalité (Coûts, Idéaux, Liens, Défauts)<br>
                  • Développez votre background narratif
                </p>
              </div>
            </div>
          </div>
          
          <!-- Triptyque d'Espèce - Remplissage -->
          <div class="bg-gray-800/50 p-6 rounded-lg">
            <h4 class="text-xl font-bold mb-4 text-emerald-400">🧝 2. Triptyque d'Espèce</h4>
            
            <div class="space-y-4">
              <div class="border-l-4 border-emerald-500 pl-4">
                <h5 class="font-semibold text-emerald-300">1. Langues et traits raciaux</h5>
                <p class="text-gray-300 text-sm">
                  <strong>Langues :</strong> C'est ICI que vous notez les langues !<br>
                  • Langue commune + langue raciale (ex: Céleste, Draconique)<br>
                  • Une troisième langue au choix<br>
                  • Cochez les résistances aux dégâts<br>
                  • Notez les sens spéciaux (vision dans le noir, etc.)
                </p>
              </div>
              
              <div class="border-l-4 border-emerald-500 pl-4">
                <h5 class="font-semibold text-emerald-300">2. Capacités et sorts d'espèce</h5>
                <p class="text-gray-300 text-sm">
                  • Détaillez les sorts raciaux (niveau, utilisations/repos)<br>
                  • Notez les aptitudes héréditaires uniques<br>
                  • Cochez les immunités et résistances spéciales<br>
                  • Taille, vitesse de déplacement, durée de vie
                </p>
                <div class="mt-3 p-2 bg-yellow-900/30 rounded border-l-2 border-yellow-500">
                  <p class="text-yellow-300 text-xs italic">
                    📝 <strong>Note importante :</strong> Les compétences et maîtrises d'espèce doivent être reportées sur le triptyque d'Historique !
                  </p>
                </div>
              </div>
              
              <div class="border-l-4 border-emerald-500 pl-4">
                <h5 class="font-semibold text-emerald-300">3. Champs "Entraînements" (vides au départ)</h5>
                <p class="text-gray-300 text-sm">
                  <strong>Important :</strong> Ces 5 champs sont pour les acquisitions EN JEU<br>
                  • Nouvelles langues apprises durant l'aventure<br>
                  • Maîtrises d'outils acquises<br>
                  • Compétences spéciales gagnées<br>
                  • Ne les remplissez que si votre personnage apprend quelque chose
                </p>
              </div>
            </div>
          </div>

          <!-- Triptyque de Classe - Remplissage -->
          <div class="bg-gray-800/50 p-6 rounded-lg">
            <h4 class="text-xl font-bold mb-4 text-blue-400">⚔️ 3. Triptyque de Classe</h4>
            
            <div class="space-y-4">
              <div class="border-l-4 border-blue-500 pl-4">
                <h5 class="font-semibold text-blue-300">1. Statistiques vitales et combat</h5>
                <p class="text-gray-300 text-sm">
                  • <strong>Points de vie :</strong> Maximum, actuels, temporaires<br>
                  • <strong>Classe d'armure :</strong> Avec et sans bouclier<br>
                  • <strong>Initiative :</strong> Modificateur et résultat de jet<br>
                  • <strong>Jets contre la mort :</strong> Suivi des réussites/échecs<br>
                  • Niveau actuel et bonus de maîtrise
                </p>
              </div>
              
              <div class="border-l-4 border-blue-500 pl-4">
                <h5 class="font-semibold text-blue-300">2. Compétences et maîtrises de classe</h5>
                <p class="text-gray-300 text-sm">
                  • Cochez les compétences de classe maîtrisées<br>
                  • Notez les maîtrises d'armes et armures<br>
                  • Jets de sauvegarde maîtrisés
                </p>
                <div class="mt-3 p-2 bg-yellow-900/30 rounded border-l-2 border-yellow-500">
                  <p class="text-yellow-300 text-xs italic">
                    📝 <strong>Note importante :</strong> Les compétences et maîtrises de classe doivent être reportées sur le triptyque d'Historique !
                  </p>
                </div>
              </div>
              
              <div class="border-l-4 border-blue-500 pl-4">
                <h5 class="font-semibold text-blue-300">3. Aptitudes et ressources</h5>
                <p class="text-gray-300 text-sm">
                  • Aptitudes acquises par niveau (cochez au fur et à mesure)<br>
                  • Ressources de classe (Rage, Inspiration, Emplacements de sorts...)<br>
                  • Capacités de sous-classe spécifiques
                </p>
              </div>
            </div>
          </div>

          <!-- Ordre de remplissage -->
          <div class="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 p-6 rounded-lg border border-yellow-600/50">
            <h4 class="text-xl font-bold mb-4 text-yellow-400">📋 Ordre de Remplissage Recommandé</h4>
            
            <div class="space-y-3">
              <div class="flex items-start space-x-3">
                <span class="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                <p class="text-gray-300 text-sm">
                  <strong>Historique FIRST :</strong> Lancez les dés et notez les caractéristiques avec bonus d'historique
                </p>
              </div>
              
              <div class="flex items-start space-x-3">
                <span class="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                <p class="text-gray-300 text-sm">
                  <strong>Espèce :</strong> Traits raciaux, langues, capacités. <em>Reportez les compétences sur l'Historique</em>
                </p>
              </div>
              
              <div class="flex items-start space-x-3">
                <span class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                <p class="text-gray-300 text-sm">
                  <strong>Classe :</strong> PV, aptitudes, ressources. <em>Reportez les compétences sur l'Historique</em>
                </p>
              </div>
              
              <div class="flex items-start space-x-3">
                <span class="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                <p class="text-gray-300 text-sm">
                  <strong>Historique FINAL :</strong> Centralisez toutes les compétences et maîtrises des 3 triptyques
                </p>
              </div>
            </div>
          </div>

          <!-- Conseils généraux -->
          <div class="bg-gray-800/50 p-6 rounded-lg">
            <h4 class="text-xl font-bold mb-4 text-yellow-400">💡 Conseils de Remplissage</h4>
            
            <div class="space-y-3">
              <div class="flex items-start space-x-3">
                <span class="text-yellow-400 font-bold">✏️</span>
                <p class="text-gray-300 text-sm">
                  <strong>Crayon obligatoire :</strong> Les valeurs évoluent constamment
                </p>
              </div>
              
              <div class="flex items-start space-x-3">
                <span class="text-yellow-400 font-bold">📸</span>
                <p class="text-gray-300 text-sm">
                  <strong>Photo de sauvegarde :</strong> Sécurisez vos triptyques remplis
                </p>
              </div>
              
              <div class="flex items-start space-x-3">
                <span class="text-yellow-400 font-bold">🎯</span>
                <p class="text-gray-300 text-sm">
                  <strong>Organisation :</strong> Historique à gauche (caracs), Espèce au centre, Classe à droite
                </p>
              </div>
              
              <div class="flex items-start space-x-3">
                <span class="text-yellow-400 font-bold">⚡</span>
                <p class="text-gray-300 text-sm">
                  <strong>Mémo 2024 :</strong> Les bonus de caracs viennent de l'HISTORIQUE maintenant !
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== PERSONNALISATION SUR MESURE ===== -->
      <div class="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-xl p-8 border border-indigo-700/50 mt-16">
        <h3 class="text-3xl font-bold mb-6 text-center text-indigo-400">✨ Triptyques Personnalisés</h3>
        
        <div class="max-w-4xl mx-auto text-center">
          <p class="text-xl text-gray-300 mb-6 txt-court">
            Vous voulez un triptyque totalement adapté à votre personnage unique ? 
            Nous créons des triptyques sur mesure avec vos choix spécifiques !
          </p>
          
          <div class="grid md:grid-cols-2 gap-8 mt-8">
            <div class="bg-gray-800/50 p-6 rounded-lg">
              <h4 class="text-xl font-bold mb-4 text-indigo-300">🎯 Triptyques Standards</h4>
              <ul class="text-gray-300 text-left space-y-2">
                <li>• Cartes d'équipement aléatoires incluses</li>
                <li>• Choix standards pour les options variables</li>
                <li>• Livraison rapide depuis notre stock</li>
                <li>• Prix catalogue de la boutique</li>
              </ul>
            </div>
            
            <div class="bg-gray-800/50 p-6 rounded-lg border border-indigo-500/50">
              <h4 class="text-xl font-bold mb-4 text-indigo-300">⭐ Triptyques Personnalisés</h4>
              <ul class="text-gray-300 text-left space-y-2">
                <li>• Choix précis de tous les équipements</li>
                <li>• Sélection manuelle des cartes incluses</li>
                <li>• Adaptation à votre background spécifique</li>
                <li>• Création sur commande (délai supplémentaire)</li>
              </ul>
            </div>
          </div>
          
          <div class="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg p-6 mt-8 border border-yellow-700/50">
            <h4 class="text-xl font-bold mb-4 text-yellow-400">📧 Comment Commander</h4>
            <p class="text-gray-300 mb-4">
              Pour un triptyque entièrement personnalisé, contactez-nous par email avec les détails de votre personnage :
            </p>
            <div class="flex flex-col md:flex-row items-center justify-center gap-4">
              <a href="mailto:commande@geekndragon.com?subject=Triptyque Personnalisé" 
                 class="btn btn-primary text-lg px-6 py-3">
                📧 commande@geekndragon.com
              </a>
              <span class="text-gray-400">Sujet : "Triptyque Personnalisé"</span>
            </div>
          </div>
          
          <div class="mt-6 text-sm text-gray-400">
            <p>💡 <strong>Astuce :</strong> Précisez votre classe, espèce, historique et vos préférences d'équipement dans votre email</p>
          </div>
        </div>
      </div>

    </div>
  </section>

  <!-- ===== COMMENT UTILISER VOS TRIPTYQUES ===== -->
  <section class="py-16 bg-gradient-to-r from-indigo-900/30 to-purple-900/30">
    <div class="max-w-6xl mx-auto px-6">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold mb-6 text-indigo-400">
          Comment utiliser vos triptyques
        </h2>
        <p class="text-xl text-gray-300 txt-court">
          Vos triptyques cartonnés sont conçus pour être pliés et organisés sur votre table de jeu
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        <div class="usage-step">
          <div class="step-number">1</div>
          <h3 class="text-xl font-semibold mb-4 text-indigo-400">📁 Pliez en 3 volets</h3>
          <p class="text-gray-300">
            Chaque triptyque se plie facilement en 3 sections. Le carton robuste maintient la forme 
            et permet une consultation rapide des informations sur les 3 volets.
          </p>
        </div>

        <div class="usage-step">
          <div class="step-number">2</div>
          <h3 class="text-xl font-semibold mb-4 text-blue-400">🎯 Organisez sur votre table</h3>
          <p class="text-gray-300">
            Disposez vos 3 triptyques devant vous : Espèce à gauche, Classe au centre, Historique à droite. 
            Accès instantané à toutes vos capacités.
          </p>
        </div>

        <div class="usage-step">
          <div class="step-number">3</div>
          <h3 class="text-xl font-semibold mb-4 text-purple-400">⚡ Consultez pendant le jeu</h3>
          <p class="text-gray-300">
            Plus besoin d'ouvrir les manuels ! Toutes vos aptitudes sont visibles d'un coup d'œil. 
            Le MJ et les autres joueurs restent concentrés sur l'action.
          </p>
        </div>
      </div>

      <div class="text-center mt-12">
        <div class="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
          <h3 class="text-2xl font-bold mb-4 text-yellow-400">💡 Conseil Pro</h3>
          <p class="text-gray-300 text-lg mb-6">
            Gardez vos triptyques ouverts pendant toute la session.
            Ils remplacent efficacement la feuille de personnage traditionnelle et accélèrent considérablement le jeu !
          </p>

          <div class="bg-gray-700/30 rounded-lg p-6 border border-yellow-500/30">
            <h4 class="text-xl font-bold mb-4 text-yellow-300">✏️ Astuce d'Écriture & Effacement</h4>
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h5 class="font-semibold text-yellow-200 mb-2">Pour les Triptyques :</h5>
                <p class="text-gray-300 text-sm mb-3">
                  <strong>Marqueurs permanents Sharpie + gomme Staedtler</strong> = combinaison parfaite !
                  Vous pouvez effacer complètement le marqueur sur les triptyques, même sur les zones colorées.
                  N'hésitez pas à gommer énergiquement, le carton résiste parfaitement.
                </p>
              </div>
              <div>
                <h5 class="font-semibold text-yellow-200 mb-2">Pour les Cartes :</h5>
                <p class="text-gray-300 text-sm mb-3">
                  La technique fonctionne aussi sur les cartes, mais <strong>limitez le gommage aux zones blanches</strong>
                  idéalement car elles sont plus fines. Les cartes devraient être personnalisées à chaque personnage
                  pour une expérience optimale !
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Bouton de retour au hero -->
      <div class="text-center mt-16">
        <a href="#main" class="btn btn-outline">
          ⬆️ Retour aux guides principaux
        </a>
      </div>
    </div>
  </section>

  <!-- ===== GUIDE DES CARTES À JOUER ===== -->
  <section class="py-24 bg-gradient-to-r from-gray-900/80 to-slate-900/80 scroll-mt-24" id="guide-cartes">
    <div class="max-w-7xl mx-auto px-6">
      
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold mb-8 text-yellow-400">
          🃏 Guide des Cartes à Jouer Geek & Dragon
        </h2>
        <p class="text-xl text-gray-300 max-w-4xl mx-auto txt-court">
          Complétez vos triptyques avec nos cartes détaillées : Armes, Armures, Équipements, Sorts, Monstres et bien plus !
          Chaque carte contient toutes les informations nécessaires pour accélérer vos parties.
        </p>
      </div>

      <!-- ===== TYPES DE CARTES ===== -->
      <div class="grid md:grid-cols-3 gap-8 mb-16">
        
        <!-- Cartes d'Équipement -->
        <div class="bg-gradient-to-b from-amber-900/30 to-orange-900/20 p-6 rounded-xl border border-amber-700/50">
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">⚔️</div>
            <h3 class="text-xl font-bold text-amber-400">Cartes d'Équipement</h3>
          </div>
          <ul class="text-gray-300 text-sm space-y-2">
            <li>• <strong>Armes :</strong> Statistiques complètes, propriétés spéciales</li>
            <li>• <strong>Armures :</strong> CA, poids, restrictions de classe</li>
            <li>• <strong>Équipement :</strong> Objets d'aventure et outils</li>
            <li>• <strong>Objets magiques :</strong> Pouvoirs et malédictions <span class="text-amber-300 text-xs italic">(en cours de création par nos gobelins dans nos forges...)</span></li>
          </ul>
        </div>
        
        <!-- Cartes de Règles -->
        <div class="bg-gradient-to-b from-blue-900/30 to-indigo-900/20 p-6 rounded-xl border border-blue-700/50">
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">📜</div>
            <h3 class="text-xl font-bold text-blue-400">Cartes de Règles</h3>
          </div>
          <ul class="text-gray-300 text-sm space-y-2">
            <li>• <strong>Règles spéciales :</strong> Maladies, création d'objets</li>
            <li>• <strong>Services :</strong> Marchands, artisans, guides</li>
            <li>• <strong>Véhicules :</strong> Montres, navires, véhicules</li>
            <li>• <strong>Poisons :</strong> Effets et antidotes</li>
          </ul>
        </div>
        
        <!-- Cartes de Gameplay -->
        <div class="bg-gradient-to-b from-purple-900/30 to-violet-900/20 p-6 rounded-xl border border-purple-700/50">
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">🎭</div>
            <h3 class="text-xl font-bold text-purple-400">Cartes de Gameplay</h3>
          </div>
          <ul class="text-gray-300 text-sm space-y-2">
            <li>• <strong>Sorts :</strong> Descriptions complètes, composantes</li>
            <li>• <strong>Monstres :</strong> Statistiques, tactiques, butin</li>
            <li>• <strong>Paquetages :</strong> Kits d'équipement thématiques</li>
            <li>• <strong>Marchandises :</strong> Commerce et économie</li>
          </ul>
        </div>
      </div>

      <!-- Note disponibilité cartes -->
      <div class="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-700/50 mb-16 text-center">
        <h4 class="text-xl font-bold mb-3 text-green-400">📦 Disponibilité des Cartes</h4>
        <p class="text-gray-300 mb-2">
          <strong>Toutes les cartes d'objets sont disponibles</strong> dans notre boutique !
          Personnalisez vos decks selon vos besoins et votre personnage.
        </p>
        <p class="text-green-300 text-sm italic">
          ✨ Les cartes d'objets magiques arrivent bientôt, nos gobelins travaillent dur dans nos forges pour vous créer des merveilles !
        </p>
      </div>

      <!-- ===== EXEMPLES DE CARTES ===== -->
      <div class="bg-gradient-to-r from-slate-900/30 to-gray-900/30 rounded-xl p-8 border border-slate-700/50 mb-16">
        <h3 class="text-3xl font-bold mb-8 text-center text-slate-400">🎴 Exemples de Cartes</h3>
        
        <div class="grid md:grid-cols-2 gap-8">
          
          <!-- Exemple Arme -->
          <div class="text-center">
            <h4 class="text-xl font-bold mb-4 text-amber-400">Carte d'Arme : Pistolet à Silex</h4>
            <div class="flip-container-card" onclick="flipCardExample('weapon-card')">
              <div class="flipper-card" id="weapon-card">
                <div class="front-card">
                  <img src="/media/products/cards/arme-recto.webp" alt="Carte Arme - Recto" class="card-preview">
                </div>
                <div class="back-card">
                  <img src="/media/products/cards/arme-verso.webp" alt="Carte Arme - Verso" class="card-preview">
                </div>
              </div>
            </div>
            <p class="text-gray-300 text-sm mt-4">
              <strong>Recto :</strong> Illustration, prix, poids, bonus d'attaque<br>
              <strong>Verso :</strong> Règles détaillées, propriétés spéciales
            </p>
          </div>
          
          <!-- Exemple Armure -->
          <div class="text-center">
            <h4 class="text-xl font-bold mb-4 text-orange-400">Carte d'Armure : Armure de Cuir</h4>
            <div class="flip-container-card" onclick="flipCardExample('armor-card')">
              <div class="flipper-card" id="armor-card">
                <div class="front-card">
                  <img src="/media/products/cards/armure-recto.webp" alt="Carte Armure - Recto" class="card-preview">
                </div>
                <div class="back-card">
                  <img src="/media/products/cards/armure-verso.webp" alt="Carte Armure - Verso" class="card-preview">
                </div>
              </div>
            </div>
            <p class="text-gray-300 text-sm mt-4">
              <strong>Recto :</strong> Illustration, prix, poids, CA de base<br>
              <strong>Verso :</strong> Modificateurs, restrictions, descriptions
            </p>
          </div>
        </div>
        
        <div class="text-center mt-8">
          <p class="text-yellow-300 italic">
            💡 <strong>Astuce :</strong> Cliquez sur les cartes pour voir le recto et le verso !
          </p>
        </div>
      </div>

      <!-- ===== COMMENT UTILISER LES CARTES ===== -->
      <div class="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 rounded-xl p-8 border border-emerald-700/50">
        <h3 class="text-3xl font-bold mb-8 text-center text-emerald-400">📋 Comment Utiliser vos Cartes</h3>
        
        <div class="grid md:grid-cols-2 gap-8">
          
          <!-- Pendant le Jeu -->
          <div class="bg-gray-800/50 p-6 rounded-lg">
            <h4 class="text-xl font-bold mb-4 text-emerald-400">🎮 Pendant le Jeu</h4>
            
            <div class="space-y-4">
              <div class="border-l-4 border-emerald-500 pl-4">
                <h5 class="font-semibold text-emerald-300">1. Accès Rapide</h5>
                <p class="text-gray-300 text-sm">
                  • Gardez vos cartes d'équipement à portée de main<br>
                  • Consultez les propriétés spéciales sans ralentir le jeu<br>
                  • Plus besoin d'ouvrir les manuels pendant l'action
                </p>
              </div>
              
              <div class="border-l-4 border-emerald-500 pl-4">
                <h5 class="font-semibold text-emerald-300">2. Partage avec le MJ</h5>
                <p class="text-gray-300 text-sm">
                  • Montrez directement vos cartes au MJ<br>
                  • Validation immédiate des règles et effets<br>
                  • Clarification rapide en cas de doute
                </p>
              </div>
            </div>
          </div>

          <!-- Organisation -->
          <div class="bg-gray-800/50 p-6 rounded-lg">
            <h4 class="text-xl font-bold mb-4 text-teal-400">🗂️ Organisation</h4>
            
            <div class="space-y-4">
              <div class="border-l-4 border-teal-500 pl-4">
                <h5 class="font-semibold text-teal-300">1. Tri par Catégorie</h5>
                <p class="text-gray-300 text-sm">
                  • Séparez : Armes, Armures, Équipement, Sorts<br>
                  • Utilisez des intercalaires ou pochettes<br>
                  • Gardez les cartes actuelles sur le dessus
                </p>
              </div>
              
              <div class="border-l-4 border-teal-500 pl-4">
                <h5 class="font-semibold text-teal-300">2. Inventaire Visuel</h5>
                <p class="text-gray-300 text-sm">
                  • Étalez vos cartes d'équipement actuel<br>
                  • Ajoutez/retirez selon vos acquisitions<br>
                  • Inventaire physique = inventaire de personnage
                </p>
              </div>
            </div>
          </div>
          
        </div>

        <!-- Conseils Pro -->
        <div class="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg p-6 mt-8 border border-yellow-700/50">
          <h4 class="text-xl font-bold mb-4 text-yellow-400">⭐ Conseils de Pro</h4>
          <div class="grid md:grid-cols-3 gap-4">
            <div class="text-center">
              <div class="text-2xl mb-2">🔄</div>
              <p class="text-gray-300 text-sm">
                <strong>Rotation :</strong> Changez vos cartes selon vos aventures
              </p>
            </div>
            <div class="text-center">
              <div class="text-2xl mb-2">🛡️</div>
              <p class="text-gray-300 text-sm">
                <strong>Protection :</strong> Utilisez des protège-cartes transparents
              </p>
            </div>
            <div class="text-center">
              <div class="text-2xl mb-2">📝</div>
              <p class="text-gray-300 text-sm">
                <strong>Notes :</strong> Annotez au crayon les modifications temporaires<br>
                <em>Conseil pro : Utilisez des crayons Staedtler 8B ou 9B pour un marquage optimal</em>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Bouton de retour au hero -->
      <div class="text-center mt-16">
        <a href="#main" class="btn btn-outline">
          ⬆️ Retour aux guides principaux
        </a>
      </div>

    </div>
  </section>

  <!-- ===== GUIDE DE LA MONNAIE D&D ===== -->
  <section class="py-24 bg-gradient-to-r from-yellow-900/80 to-amber-900/80 scroll-mt-24" id="guide-monnaie">
    <div class="max-w-7xl mx-auto px-6">
      
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold mb-8 text-yellow-400">
          💰 Guide de la Monnaie D&D
        </h2>
        <p class="text-xl text-gray-300 max-w-4xl mx-auto txt-court">
          Découvrez le système monétaire de D&D, nos pièces physiques Geek & Dragon, 
          et utilisez notre convertisseur pour gérer facilement vos finances d'aventurier !
        </p>
      </div>

      <!-- ===== SYSTÈME MONÉTAIRE D&D ===== -->
      <div class="grid md:grid-cols-2 gap-8 mb-16">
        
        <!-- Types de Pièces -->
        <div class="bg-gradient-to-b from-amber-900/30 to-yellow-900/20 p-8 rounded-xl border border-amber-700/50">
          <h3 class="text-2xl font-bold mb-6 text-center text-amber-400">💎 Types de Pièces</h3>
          
          <div class="space-y-4">
            <div class="flex items-center space-x-4 p-3 bg-gray-800/50 rounded-lg">
              <div class="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold">PP</div>
              <div>
                <h4 class="font-semibold text-yellow-400">&nbsp;&nbsp;&nbsp;&nbsp;Pièce de Platine (pp)</h4>
                <p class="text-gray-300 text-sm">&nbsp;&nbsp;&nbsp;&nbsp;La plus précieuse • 1 pp = 10 po</p>
              </div>
            </div>
            
            <div class="flex items-center space-x-4 p-3 bg-gray-800/50 rounded-lg">
              <div class="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold">PO</div>
              <div>
                <h4 class="font-semibold text-yellow-400">&nbsp;&nbsp;&nbsp;&nbsp;Pièce d'Or (po)</h4>
                <p class="text-gray-300 text-sm">&nbsp;&nbsp;&nbsp;&nbsp;Monnaie de référence • 1 po = 10 pa</p>
              </div>
            </div>
            
            <div class="flex items-center space-x-4 p-3 bg-gray-800/50 rounded-lg">
              <div class="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-black font-bold">PA</div>
              <div>
                <h4 class="font-semibold text-gray-400">&nbsp;&nbsp;&nbsp;&nbsp;Pièce d'Argent (pa)</h4>
                <p class="text-gray-300 text-sm">&nbsp;&nbsp;&nbsp;&nbsp;Monnaie courante • 1 pa = 10 pe</p>
              </div>
            </div>
            
            <div class="flex items-center space-x-4 p-3 bg-gray-800/50 rounded-lg">
              <div class="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">PE</div>
              <div>
                <h4 class="font-semibold text-orange-400">&nbsp;&nbsp;&nbsp;&nbsp;Pièce d'Électrum (pe)</h4>
                <p class="text-gray-300 text-sm">&nbsp;&nbsp;&nbsp;&nbsp;Alliage or-argent • 1 pe = 5 pc</p>
              </div>
            </div>
            
            <div class="flex items-center space-x-4 p-3 bg-gray-800/50 rounded-lg">
              <div class="w-12 h-12 bg-orange-800 rounded-full flex items-center justify-center text-white font-bold">PC</div>
              <div>
                <h4 class="font-semibold text-orange-400">&nbsp;&nbsp;&nbsp;&nbsp;Pièce de Cuivre (pc)</h4>
                <p class="text-gray-300 text-sm">&nbsp;&nbsp;&nbsp;&nbsp;Menue monnaie • La plus commune</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tableau de Conversion -->
        <div class="bg-gradient-to-b from-gray-900/30 to-slate-900/20 p-8 rounded-xl border border-slate-700/50">
          <h3 class="text-2xl font-bold mb-6 text-center text-slate-400">🔄 Tableau de Conversion</h3>
          
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-600">
                  <th class="text-left py-2 text-gray-300">Pièce</th>
                  <th class="text-center py-2 text-yellow-400">PP</th>
                  <th class="text-center py-2 text-yellow-400">PO</th>
                  <th class="text-center py-2 text-gray-400">PA</th>
                  <th class="text-center py-2 text-orange-400">PE</th>
                  <th class="text-center py-2 text-orange-400">PC</th>
                </tr>
              </thead>
              <tbody class="text-gray-300">
                <tr class="border-b border-gray-700">
                  <td class="py-2 font-semibold text-yellow-400">Platine (pp)</td>
                  <td class="text-center">1</td>
                  <td class="text-center">10</td>
                  <td class="text-center">100</td>
                  <td class="text-center">200</td>
                  <td class="text-center">1000</td>
                </tr>
                <tr class="border-b border-gray-700">
                  <td class="py-2 font-semibold text-yellow-400">Or (po)</td>
                  <td class="text-center">1/10</td>
                  <td class="text-center">1</td>
                  <td class="text-center">10</td>
                  <td class="text-center">20</td>
                  <td class="text-center">100</td>
                </tr>
                <tr class="border-b border-gray-700">
                  <td class="py-2 font-semibold text-gray-400">Argent (pa)</td>
                  <td class="text-center">1/100</td>
                  <td class="text-center">1/10</td>
                  <td class="text-center">1</td>
                  <td class="text-center">2</td>
                  <td class="text-center">10</td>
                </tr>
                <tr class="border-b border-gray-700">
                  <td class="py-2 font-semibold text-orange-400">Électrum (pe)</td>
                  <td class="text-center">1/200</td>
                  <td class="text-center">1/20</td>
                  <td class="text-center">1/2</td>
                  <td class="text-center">1</td>
                  <td class="text-center">5</td>
                </tr>
                <tr>
                  <td class="py-2 font-semibold text-orange-400">Cuivre (pc)</td>
                  <td class="text-center">1/1000</td>
                  <td class="text-center">1/100</td>
                  <td class="text-center">1/10</td>
                  <td class="text-center">1/5</td>
                  <td class="text-center">1</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ===== CONVERTISSEUR INTERACTIF ===== -->
      <!-- Convertisseur de monnaie Premium (identique à celui de boutique.php) -->
      <div class="mt-12" id="currency-converter-premium">
        <h4 class="text-2xl font-bold text-center text-gray-200 mb-8" data-i18n="shop.converter.title">🧮 Convertisseur de monnaie</h4>
        
        <!-- Section 1: Monnaies sources avec design premium -->
        <div class="mb-8">
          <h5 class="text-lg font-semibold text-gray-200 mb-4 text-center" data-i18n="shop.converter.sourcesLabel">💰 Monnaies sources</h5>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-6xl mx-auto">
            <div class="currency-input-card bg-gradient-to-br from-amber-900/20 to-orange-800/20 p-4 rounded-xl border border-amber-700/30">
              <label class="block text-amber-300 font-medium mb-2">🪙 Cuivre</label>
              <input type="number" min="0" step="1" value="0" data-currency="copper" 
                     class="w-full bg-gray-800/80 text-amber-300 border border-amber-700/50 rounded-lg p-3 text-center font-bold focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
            </div>
            <div class="currency-input-card bg-gradient-to-br from-gray-600/20 to-gray-500/20 p-4 rounded-xl border border-gray-500/30">
              <label class="block text-gray-300 font-medium mb-2">🥈 Argent</label>
              <input type="number" min="0" step="1" value="0" data-currency="silver" 
                     class="w-full bg-gray-800/80 text-gray-300 border border-gray-500/50 rounded-lg p-3 text-center font-bold focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all" />
            </div>
            <div class="currency-input-card bg-gradient-to-br from-yellow-600/20 to-green-600/20 p-4 rounded-xl border border-yellow-500/30">
              <label class="block text-yellow-300 font-medium mb-2">⚡ Électrum</label>
              <input type="number" min="0" step="1" value="0" data-currency="electrum" 
                     class="w-full bg-gray-800/80 text-yellow-300 border border-yellow-500/50 rounded-lg p-3 text-center font-bold focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all" />
            </div>
            <div class="currency-input-card bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 p-4 rounded-xl border border-yellow-400/30">
              <label class="block text-yellow-300 font-medium mb-2">🥇 Or</label>
              <input type="number" min="0" step="1" value="0" data-currency="gold" 
                     class="w-full bg-gray-800/80 text-yellow-300 border border-yellow-400/50 rounded-lg p-3 text-center font-bold focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all" />
            </div>
            <div class="currency-input-card bg-gradient-to-br from-cyan-500/20 to-blue-600/20 p-4 rounded-xl border border-cyan-400/30">
              <label class="block text-cyan-300 font-medium mb-2">💎 Platine</label>
              <input type="number" min="0" step="1" value="0" data-currency="platinum" 
                     class="w-full bg-gray-800/80 text-cyan-300 border border-cyan-400/50 rounded-lg p-3 text-center font-bold focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all" />
            </div>
          </div>
        </div>

        <!-- Section 2: Tableau multiplicateur interactif toujours visible -->
        <div class="mb-8">
          <h5 class="text-lg font-semibold text-gray-200 mb-4 text-center" data-i18n="shop.converter.multiplierLabel">⚖️ Tableau multiplicateur (éditable)</h5>
          <div class="bg-gray-800/50 rounded-xl p-6 max-w-6xl mx-auto border border-gray-700/30">
            <div class="overflow-x-auto">
              <table class="w-full text-gray-200" id="multiplier-table">
                <thead>
                  <tr class="border-b border-gray-600/50">
                    <th class="text-left p-3 text-gray-300">Monnaie</th>
                    <th class="text-center p-3 text-gray-300">×1</th>
                    <th class="text-center p-3 text-gray-300">×10</th>
                    <th class="text-center p-3 text-gray-300">×100</th>
                    <th class="text-center p-3 text-gray-300">×1000</th>
                    <th class="text-center p-3 text-gray-300">×10000</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-gray-700/30" data-currency="platinum">
                    <td class="p-3 text-cyan-300 font-medium">💎 Platine</td>
                    <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-cyan-300 border border-cyan-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1"></td>
                    <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-cyan-300 border border-cyan-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10"></td>
                    <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-cyan-300 border border-cyan-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="100"></td>
                    <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-cyan-300 border border-cyan-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1000"></td>
                    <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-cyan-300 border border-cyan-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10000"></td>
                  </tr>
                  <tr class="border-b border-gray-700/30" data-currency="gold">
                    <td class="p-3 text-yellow-300 font-medium">🥇 Or</td>
                    <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-400/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1"></td>
                    <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-400/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10"></td>
                    <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-400/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="100"></td>
                    <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-400/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1000"></td>
                    <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-400/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10000"></td>
                  </tr>
                  <tr class="border-b border-gray-700/30" data-currency="electrum">
                    <td class="p-3 text-yellow-300 font-medium">⚡ Électrum</td>
                    <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1"></td>
                    <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10"></td>
                    <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="100"></td>
                    <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1000"></td>
                    <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-yellow-300 border border-yellow-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10000"></td>
                  </tr>
                  <tr class="border-b border-gray-700/30" data-currency="silver">
                    <td class="p-3 text-gray-300 font-medium">🥈 Argent</td>
                    <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-gray-300 border border-gray-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1"></td>
                    <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-gray-300 border border-gray-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10"></td>
                    <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-gray-300 border border-gray-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="100"></td>
                    <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-gray-300 border border-gray-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1000"></td>
                    <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-gray-300 border border-gray-500/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10000"></td>
                  </tr>
                  <tr data-currency="copper">
                    <td class="p-3 text-amber-300 font-medium">🪙 Cuivre</td>
                    <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-amber-300 border border-amber-700/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1"></td>
                    <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-amber-300 border border-amber-700/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10"></td>
                    <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-amber-300 border border-amber-700/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="100"></td>
                    <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-amber-300 border border-amber-700/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="1000"></td>
                    <td class="p-2"><input type="number" min="0" class="multiplier-input bg-gray-700/50 text-amber-300 border border-amber-700/30 rounded p-2 w-full text-center cursor-pointer" data-multiplier="10000"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Section 3: Équivalences totales par métal avec recommandations optimales -->
        <div class="mb-8" id="metal-totals-section">
          <h5 class="text-lg font-semibold text-gray-200 mb-4 text-center" data-i18n="shop.converter.equivalences">💼 Équivalences totales par métal</h5>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            <!-- Première ligne: Cuivre, Argent, Électrum -->
            <div id="copper-card"></div>
            <div id="silver-card"></div>
            <div id="electrum-card"></div>
            
            <!-- Deuxième ligne: Or, Platine, Recommandations optimales -->
            <div id="gold-card"></div>
            <div id="platinum-card"></div>
            <div id="optimal-recommendations" class="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-xl p-6 border border-indigo-500/30">
              <h6 class="text-indigo-300 font-bold text-lg mb-4">✨ Recommandations optimales</h6>
              <div id="currency-best" class="text-gray-200"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== RECOMMANDATIONS DE LOTS DE PIÈCES ===== -->
      <div id="coin-lots-recommendations" class="mt-12 mb-16" style="display: block;">
        <div class="bg-gradient-to-r from-green-900/30 to-emerald-900/20 rounded-xl p-8 border border-green-700/50">
          <h4 class="text-2xl font-bold text-center text-gray-200 mb-8">
            🛒 Lots de pièces recommandés
          </h4>
          
          <div class="max-w-4xl mx-auto">
            <div class="text-center mb-6">
              <p class="text-gray-300 mb-4">
                Voici les lots minimaux recommandés pour couvrir exactement vos besoins en pièces physiques :
              </p>
            </div>
            
            <!-- Contenu des recommandations -->
            <div id="coin-lots-content" class="mb-8">
              <!-- Le contenu sera injecté dynamiquement par JavaScript -->
            </div>
            
            <!-- Bouton d'ajout au panier global -->
            <div class="text-center">
              <button id="add-all-lots-to-cart"
                      class="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                      style="display: none;">

                Ajouter tous les lots au panier
              </button>
              
              <p class="text-sm text-gray-400 mt-4">
                Ces recommandations optimisent le nombre de lots nécessaires pour le prix le plus avantageux.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== TESTS SYSTÈME CONVERTISSEUR (DEBUG) ===== -->
      <div class="bg-gradient-to-r from-blue-900/30 to-indigo-900/20 rounded-xl p-8 border border-blue-700/50 mb-16" id="debug-section" style="display: none;">
        <h3 class="text-3xl font-bold mb-6 text-center text-blue-400">🔬 Tests du Système de Conversion</h3>
        
        <div class="max-w-4xl mx-auto">
          <p class="text-center text-gray-300 mb-6">
            Section de débogage pour valider les algorithmes métaheuristiques de conversion et recommandations de lots.
          </p>
          
          <div class="grid md:grid-cols-2 gap-6 mb-6">
            <button id="run-basic-tests" class="btn btn-primary">
              🧪 Tests de Base
            </button>
            <button id="run-advanced-tests" class="btn btn-secondary">
              🔬 Tests Avancés
            </button>
          </div>
          
          <div class="bg-gray-800/50 rounded-lg p-6">
            <div class="flex justify-between items-center mb-4">
              <h4 class="text-xl font-semibold text-blue-300">Résultats des Tests</h4>
              <button id="clear-test-results" class="text-sm text-gray-400 hover:text-white">
                🗑️ Effacer
              </button>
            </div>
            <div id="test-results" class="text-sm font-mono">
              <div class="text-gray-400">Aucun test exécuté...</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== L'IMPORTANCE DU TRÉSOR PHYSIQUE ===== -->
      <div class="bg-gradient-to-r from-amber-900/30 to-yellow-900/20 rounded-xl p-8 border border-amber-700/50 mb-16">
        <div class="grid md:grid-cols-2 gap-16 items-start">
          
          <!-- Image carte de propriété cliquable -->
          <div class="order-2 md:order-1 flex flex-col">
            <div class="bg-gray-800/30 rounded-xl p-6 border border-amber-600/20">
              <div class="relative group cursor-pointer" onclick="downloadMoneySheet()">
                <img src="/media/content/carte_propriete.webp" alt="Carte de propriété des pièces Geek & Dragon" 
                     class="rounded-lg shadow-lg w-full object-cover border border-amber-600/30 transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105" loading="lazy">
                
                <!-- Overlay de téléchargement au survol -->
                <div class="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div class="text-center text-white">
                    <div class="text-3xl mb-2">📥</div>
                    <div class="font-bold text-lg">Télécharger</div>
                    <div class="text-sm text-amber-300">Fiche à imprimer</div>
                  </div>
                </div>
              </div>
              
              <div class="mt-4 text-center">
                <p class="text-amber-300 font-medium mb-2">📄 Fiche de Monnaie officielle</p>
                <p class="text-xs text-gray-400 mb-3">Cliquez sur l'image pour télécharger la fiche à imprimer</p>
                
                <button onclick="downloadMoneySheet()" 
                        class="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                  📥 Télécharger la fiche
                </button>
              </div>
            </div>
          </div>
          
          <!-- Texte explicatif avec plus d'espacement -->
          <div class="order-1 md:order-2 space-y-8 flex flex-col justify-center px-4 md:px-8">
            <h3 class="text-3xl font-bold text-amber-400">🏆 Pourquoi le Trésor Physique ?</h3>
            
            <div class="space-y-6 text-gray-300">
              <blockquote class="text-lg font-medium text-amber-300 italic border-l-4 border-amber-500 pl-6 bg-amber-900/10 py-4 rounded-r-lg">
                "S'il n'y avait plus de billets dans le Monopoly, le jeu perdrait tout son intérêt..."
              </blockquote>
              
              <div class="space-y-4">
                <p class="text-base leading-relaxed">
                  Dans Donjons & Dragons, les <strong class="text-amber-400">deux objectifs principaux</strong> sont l'expérience et le trésor. 
                  Devoir écrire le trésor sur papier puis le gommer ne lui rend pas hommage. 
                  Le trésor mérite d'être <strong class="text-yellow-400">tangible, pesé, manipulé</strong>.
                </p>
                
                <p class="text-base leading-relaxed">
                  Nos pièces physiques transforment chaque récompense en moment mémorable. 
                  Quand le MJ fait <em class="text-amber-300">tinter les pièces d'or</em> dans sa main avant de les distribuer, 
                  c'est toute l'immersion qui s'intensifie.
                </p>
              </div>
              
              <div class="bg-amber-900/20 p-6 rounded-lg border border-amber-600/30 mt-8">
                <h4 class="text-lg font-bold text-amber-400 mb-4 flex items-center justify-between">
                  <span>📋 Système de Propriété</span>
                  <button onclick="downloadMoneySheet()" class="text-xs bg-amber-600 hover:bg-amber-700 px-3 py-1 rounded-full transition-colors">
                    📥 Télécharger
                  </button>
                </h4>
                <p class="text-sm leading-relaxed">
                  Utilisez notre <strong>fiche de monnaie</strong> pour répertorier vos trésors. 
                  Inscrivez votre nom, comptez vos pièces, signez et remettez au MJ. 
                  En fin de campagne, récupérez facilement votre investissement !
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== PIÈCES PHYSIQUES GEEK & DRAGON ===== -->
      <div class="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-xl p-8 border border-purple-700/50">
        <h3 class="text-3xl font-bold mb-8 text-center text-purple-400">🪙 Pièces Physiques Geek & Dragon</h3>
        
        <div class="grid md:grid-cols-2 gap-8">
          
          <!-- Description -->
          <div class="space-y-6">
            <div>
              <h4 class="text-xl font-bold mb-4 text-purple-400">✨ Des Pièces Authentiques</h4>
              <p class="text-gray-300 mb-4">
                Nos pièces métalliques reproduisent fidèlement le système monétaire de D&D. 
                Chaque type de pièce a son propre design et sa finition unique.
              </p>
              <ul class="text-gray-300 space-y-2">
                <li>• <strong>Métal véritable</strong> avec finitions spécifiques</li>
                <li>• <strong>Gravures détaillées</strong> inspirées de l'univers D&D</li>
                <li>• <strong>Poids authentique</strong> pour une expérience immersive</li>
                <li>• <strong>Sets complets</strong> ou pièces individuelles</li>
              </ul>
            </div>
            
            <div>
              <h4 class="text-xl font-bold mb-4 text-purple-400">🎯 Utilisation en Jeu</h4>
              <ul class="text-gray-300 space-y-2">
                <li>• <strong>Immersion totale</strong> lors des transactions</li>
                <li>• <strong>Gestion tactile</strong> de votre trésor</li>
                <li>• <strong>Récompenses physiques</strong> pour les joueurs</li>
                <li>• <strong>Ambiance medievale-fantastique</strong> renforcée</li>
              </ul>
            </div>
          </div>

          <!-- Call to Action -->
          <div class="flex flex-col justify-center">
            <div class="bg-gradient-to-r from-yellow-900/30 to-amber-900/30 rounded-lg p-6 border border-yellow-600/50 text-center">
              <h4 class="text-xl font-bold mb-4 text-yellow-400">💰 Commandez vos Pièces</h4>
              <p class="text-gray-300 mb-6">
                Découvrez notre collection complète de pièces métalliques 
                et donnez vie à l'économie de vos parties !
              </p>
              <div class="space-y-4">
                <a href="<?= langUrl('boutique.php#pieces') ?>" class="btn btn-primary w-full">
                  🛒 Voir les Pièces en Boutique
                </a>
                <a href="<?= langUrl('product.php?id=coin-lord-treasury-uniform&from=pieces') ?>" class="btn btn-outline w-full">
                  ⭐ Set Complet de Trésorerie
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Bouton de retour au hero -->
      <div class="text-center mt-16">
        <a href="#main" class="btn btn-outline">
          ⬆️ Retour aux guides principaux
        </a>
      </div>

    </div>
  </section>

  <!-- ===== CALL TO ACTION ===== -->
  <section class="py-16 bg-gray-900/80">
    <div class="max-w-4xl mx-auto px-6 text-center">
      <h2 class="text-3xl font-bold mb-6 text-indigo-400">Prêt à révolutionner vos parties ?</h2>
      <p class="text-xl text-gray-300 mb-8 txt-court">
        Découvrez notre collection complète : triptyques, cartes d'équipement et pièces métalliques. 
        Transformez votre expérience de jeu de rôle avec nos accessoires artisanaux conçus au Québec.
      </p>
      
      <div class="flex flex-col md:flex-row gap-4 justify-center">
        <a href="<?= langUrl('boutique.php#triptyques') ?>" class="btn btn-primary text-lg px-6 py-4">
          📁 Triptyques
        </a>
        <a href="<?= langUrl('boutique.php#cartes') ?>" class="btn btn-primary text-lg px-6 py-4">
          🃏 Cartes d'Équipement
        </a>
        <a href="<?= langUrl('boutique.php#pieces') ?>" class="btn btn-primary text-lg px-6 py-4">
          🪙 Pièces Métalliques
        </a>
        <a href="<?= langUrl('boutique.php') ?>" class="btn btn-outline text-lg px-6 py-4">
          🛒 Voir toute la boutique
        </a>
      </div>
    </div>
  </section>

</main>

<?php include 'footer.php'; ?>

<script>
  // Exposer les données des produits pour le système de recommandation
  window.products = <?= json_encode($products_data) ?>;
</script>
<script src="/js/app.js"></script>
<script>
// Fonction pour retourner les cartes (triptyques)
function flipCard(cardId) {
    const container = document.getElementById(cardId);
    container.classList.toggle('flipped');
}

// Fonction pour retourner les cartes à jouer
function flipCardExample(cardId) {
    const container = document.getElementById(cardId).parentElement;
    container.classList.toggle('flipped');
}

// Convertisseur de monnaie D&D
const currencyRates = {
    pp: 1000,    // 1 pp = 1000 pc
    po: 100,     // 1 po = 100 pc
    pa: 10,      // 1 pa = 10 pc
    pe: 5,       // 1 pe = 5 pc
    pc: 1        // 1 pc = 1 pc
};

function convertCurrency(fromCurrency) {
    // Récupérer la valeur saisie
    const inputValue = parseFloat(document.getElementById(`input-${fromCurrency}`).value) || 0;
    
    // Convertir tout en pièces de cuivre (base)
    const totalCopper = inputValue * currencyRates[fromCurrency];
    
    // Calculer les équivalences
    const pp = Math.floor(totalCopper / currencyRates.pp);
    const po = Math.floor(totalCopper / currencyRates.po);
    const pa = Math.floor(totalCopper / currencyRates.pa);
    const pe = Math.floor(totalCopper / currencyRates.pe);
    const pc = totalCopper;
    
    // Calculer la valeur en or pour l'affichage principal
    const totalGold = totalCopper / currencyRates.po;
    
    // Mettre à jour l'affichage
    document.getElementById('total-po').textContent = `${totalGold.toLocaleString('fr-FR', {maximumFractionDigits: 2})} po`;
    document.getElementById('result-pp').textContent = `${pp.toLocaleString('fr-FR')} pp`;
    document.getElementById('result-po').textContent = `${po.toLocaleString('fr-FR')} po`;
    document.getElementById('result-pa').textContent = `${pa.toLocaleString('fr-FR')} pa`;
    document.getElementById('result-pe').textContent = `${pe.toLocaleString('fr-FR')} pe`;
    document.getElementById('result-pc').textContent = `${pc.toLocaleString('fr-FR')} pc`;
    
    // Effacer les autres champs (éviter la confusion)
    Object.keys(currencyRates).forEach(currency => {
        if (currency !== fromCurrency) {
            const input = document.getElementById(`input-${currency}`);
            if (input.value !== '') {
                input.value = '';
            }
        }
    });
}

function clearConverter() {
    // Effacer tous les champs
    Object.keys(currencyRates).forEach(currency => {
        document.getElementById(`input-${currency}`).value = '';
    });
    
    // Remettre à zéro l'affichage
    document.getElementById('total-po').textContent = '0 po';
    document.getElementById('result-pp').textContent = '0 pp';
    document.getElementById('result-po').textContent = '0 po';
    document.getElementById('result-pa').textContent = '0 pa';
    document.getElementById('result-pe').textContent = '0 pe';
    document.getElementById('result-pc').textContent = '0 pc';
}

// Fonctions pour le lanceur de dés
function rollStat(statName) {
    // Lancer 4d6 et garder les 3 meilleurs
    const rolls = [];
    for (let i = 0; i < 4; i++) {
        rolls.push(Math.floor(Math.random() * 6) + 1);
    }
    
    // Trier en ordre décroissant et garder les 3 premiers
    rolls.sort((a, b) => b - a);
    const total = rolls[0] + rolls[1] + rolls[2];
    
    // Animation de lancement
    const resultElement = document.getElementById(statName + '-result');
    let animationCount = 0;
    
    const animationInterval = setInterval(() => {
        resultElement.textContent = Math.floor(Math.random() * 18) + 3;
        animationCount++;
        
        if (animationCount > 10) {
            clearInterval(animationInterval);
            resultElement.textContent = total;
            
            // Colorer selon la qualité du résultat
            resultElement.classList.remove('text-red-500', 'text-yellow-500', 'text-green-500');
            if (total >= 15) {
                resultElement.classList.add('text-green-400');
            } else if (total >= 12) {
                resultElement.classList.add('text-yellow-400');
            } else {
                resultElement.classList.add('text-red-400');
            }
            
            // Effet de mise en évidence
            resultElement.style.transform = 'scale(1.2)';
            setTimeout(() => {
                resultElement.style.transform = 'scale(1)';
            }, 300);
        }
    }, 80);
}

function rollAllStats() {
    const stats = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    
    // Lancer chaque caractéristique avec un petit délai
    stats.forEach((stat, index) => {
        setTimeout(() => {
            rollStat(stat);
        }, index * 200);
    });
}

// Smooth scroll pour les ancres
document.addEventListener('DOMContentLoaded', function() {
    // Gestion des liens avec smooth scroll
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Animation d'apparition des éléments au scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observer les éléments à animer
    const elementsToAnimate = document.querySelectorAll('.usage-step, .card-product');
    elementsToAnimate.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Fonction simple de téléchargement des fiches de monnaie
function downloadMoneySheet() {
    // Créer un popup de confirmation dans le style du site
    const popup = document.createElement('div');
    popup.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center';
    popup.innerHTML = `
        <div class="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-amber-600/30">
            <div class="text-center mb-6">
                <div class="text-4xl mb-3">📥</div>
                <h3 class="text-xl font-bold text-amber-400 mb-2">Télécharger la Fiche de Monnaie</h3>
                <p class="text-gray-300 text-sm">
                    Téléchargez l'image de la fiche de monnaie pour l'imprimer chez vous
                </p>
            </div>
            
            <div class="bg-amber-900/20 p-4 rounded-lg border border-amber-600/30 mb-4">
                <h4 class="font-bold text-amber-400 mb-2">💡 Conseil d'impression :</h4>
                <p class="text-sm text-gray-300">
                    Imprimez sur du papier cartonné (200-250g) pour une meilleure durabilité. 
                    Vous pouvez plastifier la fiche pour une utilisation répétée.
                </p>
            </div>
            
            <div class="flex gap-3">
                <button onclick="confirmDownload()" class="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    📥 Télécharger
                </button>
                <button onclick="closeDownloadPopup()" class="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Annuler
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    document.body.style.overflow = 'hidden';
    window.currentDownloadPopup = popup;
}

function closeDownloadPopup() {
    if (window.currentDownloadPopup) {
        document.body.removeChild(window.currentDownloadPopup);
        document.body.style.overflow = 'auto';
        window.currentDownloadPopup = null;
    }
}

function confirmDownload() {
    // Lancer le téléchargement
    const link = document.createElement('a');
    link.href = '/media/content/carte_propriete.webp';
    link.download = 'fiche-monnaie-geek-dragon.webp';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Fermer le popup
    closeDownloadPopup();
}
</script>
<script src="/js/hero-videos.js"></script>
<script src="/js/boutique-premium.js"></script>
<script src="/js/snipcart-utils.js"></script>
<script src="/js/coin-lot-optimizer.js"></script>
<script src="/js/currency-converter.js"></script>
<script src="/js/currency-converter-tests.js"></script>

<script>
// Gestionnaire pour le bouton d'ajout au panier (utilise les utilitaires réutilisables)
document.addEventListener('DOMContentLoaded', function() {
  const addToCartButton = document.getElementById('add-all-lots-to-cart');
  
  if (addToCartButton) {
    addToCartButton.addEventListener('click', function() {
      const lotsData = JSON.parse(this.dataset.lotsData || '[]');
      
      if (lotsData.length === 0) {
        const lang = document.documentElement.lang || 'fr';
        const message = lang === 'en' ? 'No lots to add to cart.' : 'Aucun lot à ajouter au panier.';
        alert(message);
        return;
      }
      
      // Convertir les données en format SnipcartUtils
      const productsToAdd = lotsData.map(lot => {
        const product = window.products?.[lot.productId];
        
        // Fonction de traduction des métaux anglais -> français
        const translateMetal = (englishMetal) => {
          const metalTranslations = {
            'copper': 'cuivre',
            'silver': 'argent', 
            'electrum': 'électrum',
            'gold': 'or',
            'platinum': 'platine'
          };
          return metalTranslations[englishMetal] || englishMetal;
        };
        
        // Convertir customFields du format CoinLotOptimizer vers format SnipcartUtils
        const convertedCustomFields = {};
        let customIndex = 1;
        
        if (lot.customFields) {
          Object.entries(lot.customFields).forEach(([fieldKey, fieldData]) => {
            if (fieldData.role === 'metal') {
              convertedCustomFields[`custom${customIndex}`] = {
                name: 'Métal',
                type: 'dropdown', 
                options: 'cuivre|argent|électrum|or|platine',
                value: translateMetal(fieldData.value) // TRADUCTION AJOUTÉE
              };
              customIndex++;
            } else if (fieldData.role === 'multiplier') {
              convertedCustomFields[`custom${customIndex}`] = {
                name: 'Multiplicateur',
                type: 'dropdown',
                options: '1|10|100|1000|10000', 
                value: fieldData.value.toString()
              };
              customIndex++;
            }
          });
        }
        
        return {
          product: {
            id: lot.productId,
            name: product?.name || lot.productId, // Utiliser le nom de base du produit
            summary: product?.summary || `Lot de pièces D&D - ${product?.name || lot.productId}`,
            price: lot.price,
            url: lot.url || `product.php?id=${encodeURIComponent(lot.productId)}`
          },
          quantity: lot.quantity,
          customFields: convertedCustomFields
        };
      });
      
      // Utiliser les utilitaires Snipcart pour ajouter au panier
      if (window.SnipcartUtils) {
        window.SnipcartUtils.addMultipleToCart(productsToAdd, (added, total) => {
          if (added === total) {
            const lang = document.documentElement.lang || 'fr';
            const message = lang === 'en' ? 
              `${total} product(s) added to cart successfully!` : 
              `${total} produit(s) ajouté(s) au panier avec succès !`;
            
            // Afficher un message de succès plus élégant
            const successDiv = document.createElement('div');
            successDiv.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
            successDiv.innerHTML = `
              <div class="flex items-center gap-2">
                <span class="text-xl">✅</span>
                <span>${message}</span>
              </div>
            `;
            
            document.body.appendChild(successDiv);
            
            // Animation d'entrée
            setTimeout(() => {
              successDiv.style.transform = 'translateX(0)';
            }, 100);
            
            // Animation de sortie et suppression
            setTimeout(() => {
              successDiv.style.transform = 'translateX(full)';
              setTimeout(() => {
                if (successDiv.parentNode) {
                  successDiv.parentNode.removeChild(successDiv);
                }
              }, 300);
            }, 3000);
          }
        });
      } else {
        console.error('SnipcartUtils non disponible');
        alert('Erreur : impossible d\'ajouter au panier');
      }
    });
  }

  // ===== INTÉGRATION DES TESTS SYSTÈME =====
  
  // Afficher/masquer la section de tests avec raccourci clavier
  let debugSectionVisible = false;
  
  // Raccourci clavier Ctrl+Shift+T pour afficher les tests
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'T') {
      e.preventDefault();
      debugSectionVisible = !debugSectionVisible;
      const debugSection = document.getElementById('debug-section');
      if (debugSection) {
        debugSection.style.display = debugSectionVisible ? 'block' : 'none';
        if (debugSectionVisible) {
          debugSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  });

  // Gestionnaires des boutons de test
  const runBasicTestsBtn = document.getElementById('run-basic-tests');
  const runAdvancedTestsBtn = document.getElementById('run-advanced-tests');
  const clearResultsBtn = document.getElementById('clear-test-results');
  const testResults = document.getElementById('test-results');

  if (runBasicTestsBtn) {
    runBasicTestsBtn.addEventListener('click', function() {
      if (window.CurrencyConverterTests) {
        testResults.innerHTML = '<div class="text-yellow-400">Exécution des tests de base...</div>';
        
        setTimeout(() => {
          const results = window.CurrencyConverterTests.runBasicTests();
          displayTestResults(results, 'Tests de Base');
        }, 100);
      } else {
        testResults.innerHTML = '<div class="text-red-400">❌ CurrencyConverterTests non disponible</div>';
      }
    });
  }

  if (runAdvancedTestsBtn) {
    runAdvancedTestsBtn.addEventListener('click', function() {
      if (window.CurrencyConverterTests) {
        testResults.innerHTML = '<div class="text-yellow-400">Exécution des tests avancés...</div>';
        
        setTimeout(() => {
          const results = window.CurrencyConverterTests.runAdvancedTests();
          displayTestResults(results, 'Tests Avancés');
        }, 100);
      } else {
        testResults.innerHTML = '<div class="text-red-400">❌ CurrencyConverterTests non disponible</div>';
      }
    });
  }

  if (clearResultsBtn) {
    clearResultsBtn.addEventListener('click', function() {
      testResults.innerHTML = '<div class="text-gray-400">Aucun test exécuté...</div>';
    });
  }

  function displayTestResults(results, testType) {
    if (!results) {
      testResults.innerHTML = '<div class="text-red-400">❌ Erreur lors de l\'exécution des tests</div>';
      return;
    }

    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    const success = passed === total;

    let html = `<div class="mb-4">
      <div class="text-lg font-semibold ${success ? 'text-green-400' : 'text-red-400'}">
        ${testType}: ${passed}/${total} tests réussis ${success ? '✅' : '❌'}
      </div>
    </div>`;

    results.forEach((result, index) => {
      const statusClass = result.passed ? 'text-green-400' : 'text-red-400';
      const statusIcon = result.passed ? '✅' : '❌';
      
      html += `<div class="mb-3 p-3 bg-gray-700/50 rounded">
        <div class="${statusClass} font-semibold">
          ${statusIcon} Test ${index + 1}: ${result.name}
        </div>`;
      
      if (result.details) {
        html += `<div class="text-gray-300 text-xs mt-1 pl-4">${result.details}</div>`;
      }
      
      if (!result.passed && result.error) {
        html += `<div class="text-red-300 text-xs mt-1 pl-4">Erreur: ${result.error}</div>`;
      }
      
      html += '</div>';
    });

    // Ajouter un résumé de performance si disponible
    const timeData = results.find(r => r.timing);
    if (timeData && timeData.timing) {
      html += `<div class="mt-4 p-3 bg-blue-900/30 rounded text-blue-300">
        <div class="font-semibold">⏱️ Performance</div>
        <div class="text-xs">Temps total: ${timeData.timing}ms</div>
      </div>`;
    }

    testResults.innerHTML = html;
  }

  // Auto-run tests basiques au chargement si en mode debug
  if (window.location.hash === '#debug' || window.location.search.includes('debug=1')) {
    debugSectionVisible = true;
    const debugSection = document.getElementById('debug-section');
    if (debugSection) {
      debugSection.style.display = 'block';
      
      // Attendre que tous les scripts soient chargés
      setTimeout(() => {
        if (runBasicTestsBtn) runBasicTestsBtn.click();
      }, 1000);
    }
  }
});
</script>

</body>
</html>
