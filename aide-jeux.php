<?php
require __DIR__ . '/bootstrap.php';
$config = require __DIR__ . '/config.php';
$active = 'aide-jeux';
require __DIR__ . '/i18n.php';

$title = 'Aide de Jeux - ' . ($translations['meta']['home']['title'] ?? 'Geek & Dragon');
$metaDescription = 'Guide complet pour comprendre et utiliser vos triptyques Geek & Dragon : Espèce, Classe et Historique. Découvrez tous les secrets de vos fiches de personnage cartonnées.';
$metaUrl = 'https://' . ($_SERVER['HTTP_HOST'] ?? 'geekndragon.com') . '/aide-jeux.php';

// Ajouter les traductions spécifiques pour cette page
$gameHelpTranslations = [
    'fr' => [
        'gameHelp' => [
            'hero' => [
                'title' => 'Guide des Triptyques',
                'subtitle' => 'Maîtrisez vos fiches de personnage Geek & Dragon'
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
                'title' => 'Triptych Guide',
                'subtitle' => 'Master your Geek & Dragon character sheets'
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

<main id="main" class="pt-[var(--header-height)]">

  <!-- ===== HERO ===== -->
  <section class="min-h-screen flex items-center justify-center text-center relative text-white">
    <div class="hero-videos absolute inset-0 w-full h-full" style="z-index:-1" data-main="/media/videos/backgrounds/Carte1_compressed.mp4" data-videos='["/media/videos/backgrounds/cascade_HD_compressed.mp4","/media/videos/backgrounds/fontaine11_compressed.mp4","/media/videos/backgrounds/mage_compressed.mp4","/media/videos/backgrounds/fontaine4_compressed.mp4","/media/videos/backgrounds/fontaine3_compressed.mp4","/media/videos/backgrounds/fontaine2_compressed.mp4","/media/videos/backgrounds/fontaine1_compressed.mp4"]'></div>
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
        <a href="<?= langUrl('boutique.php#triptyques') ?>" class="btn btn-outline">Acheter mes Triptyques</a>
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
            <li>• <strong>Objets magiques :</strong> Pouvoirs et malédictions</li>
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
                <strong>Notes :</strong> Annotez au crayon les modifications temporaires
              </p>
            </div>
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
          <p class="text-gray-300 text-lg">
            Gardez vos triptyques ouverts pendant toute la session. 
            Ils remplacent efficacement la feuille de personnage traditionnelle et accélèrent considérablement le jeu !
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== CALL TO ACTION ===== -->
  <section class="py-16 bg-gray-900/80">
    <div class="max-w-4xl mx-auto px-6 text-center">
      <h2 class="text-3xl font-bold mb-6 text-indigo-400">Prêt à révolutionner vos parties ?</h2>
      <p class="text-xl text-gray-300 mb-8 txt-court">
        Découvrez notre collection complète de triptyques et transformez votre expérience de jeu de rôle.
      </p>
      
      <div class="flex flex-col md:flex-row gap-6 justify-center">
        <a href="<?= langUrl('boutique.php#triptyques') ?>" class="btn btn-primary text-lg px-8 py-4">
          🛒 Acheter mes Triptyques
        </a>
        <a href="<?= langUrl('boutique.php') ?>" class="btn btn-outline text-lg px-8 py-4">
          🎲 Voir tous les produits
        </a>
      </div>
    </div>
  </section>

</main>

<?php include 'footer.php'; ?>

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
</script>

</body>
</html>