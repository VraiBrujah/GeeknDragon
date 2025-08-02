<?php
$active = 'boutique';
$title  = 'Boutique | Geek & Dragon';
$metaDescription = "Achetez nos cartes et accessoires immersifs pour D&D.";
$extraHead = <<<HTML
<!-- Snipcart styles -->
<link rel="stylesheet" href="https://cdn.snipcart.com/themes/v3.4.0/default/snipcart.css" />
<!-- Snipcart script is loaded asynchronously below in the body to avoid blocking the page -->
<style>
  body{background:url('images/bg_texture.jpg') center/cover fixed;color:#e5e7eb;}
  .card{@apply bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col;}
  .oos{@apply bg-gray-700 text-gray-400 cursor-not-allowed;}
  .snipcart-modal__container{background:#1f2937!important;}
  .snipcart .snipcart-button-primary{background-image:linear-gradient(to right,#4f46e5,#7c3aed)!important;border:none;}
  .snipcart .snipcart-button-primary:hover{background-image:linear-gradient(to right,#6366f1,#8b5cf6)!important;}
</style>
HTML;

/* ───── STOCK ───── */
$stock    = json_decode(file_get_contents(__DIR__ . '/stock.json'), true) ?? [];
$snipcartKey = getenv('SNIPCART_API_KEY');
function inStock(string $id): bool
{
    global $stock;
    return !isset($stock[$id]) || $stock[$id] > 0;      // true si illimité ou quantité > 0
}
?>
<!DOCTYPE html>
<html lang="fr">
<?php include 'head-common.php'; ?>

<body>
<?php include 'header.php'; ?>

<!-- Snipcart: placer le conteneur dans le body pour éviter des comportements inattendus -->
<div hidden id="snipcart"
     data-api-key="<?= htmlspecialchars($snipcartKey ?? '') ?>"
     data-config-add-product-behavior="overlay">
</div>
<?php if (!$snipcartKey): ?>
<p class="text-red-500 text-center">SNIPCART_API_KEY missing</p>
<?php endif; ?>
<script async src="https://cdn.snipcart.com/themes/v3.4.0/default/snipcart.js"></script>

<main class="pt-24 md:pt-32">

  <!-- ===== Bannière d'ouverture ===== -->
  <section class="relative min-h-[24rem] md:min-h-[32rem]">
    <img src="images/banner_luxe_coins.jpg" alt="Pluie de pièces luxueuses" class="absolute inset-0 w-full h-full object-cover" loading="lazy">
    <div class="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center px-4">
      <h2 class="text-4xl md:text-5xl font-extrabold mb-4">Entrez dans la légende</h2>
        <p class="text-lg md:text-xl max-w-2xl mx-auto mb-6 txt-court">Des pièces et cartes d'équipement plus luxueuses qu'une figurine de dragon à 300 $ : utilisées à chaque session et conçues au&nbsp;Québec.</p>
      <a href="#pieces" class="btn btn-primary">Choisir mes trésors</a>
    </div>
  </section>

  <!-- ░░░ EN-TÊTE ░░░ -->
  <section class="text-center max-w-4xl mx-auto px-6 my-16" id="pieces">
    <h2 class="text-4xl md:text-5xl font-extrabold mb-4">Boutique officielle</h2>
      <p class="text-lg md:text-xl txt-court">Objets de collection et aides de jeu artisanaux, fabriqués au&nbsp;Québec.</p>
  </section>

  <!-- ░░░ PIÈCES ░░░ -->
  <section class="py-16 bg-gray-900/80">
    <div class="max-w-6xl mx-auto px-6">
      <h3 class="text-4xl font-bold text-center mb-12">Pièces métalliques</h3>
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
        <!-- Lot de 10 – L’Offrande du Vagabond -->
        <?php if(inStock('lot10-vagabond')): ?>
        <div class="card flex flex-col">
          <a href="lot10.php">
            <img src="images/Piece/pro/p10.png" alt="Lot de 10<br>L’Offrande du Vagabond" class="rounded mb-4 w-full h-48 object-cover">
          </a>
          <h4 class="text-2xl font-semibold mb-2">Lot de 10<br>L’Offrande du Vagabond</h4>
          <p class="mb-4 text-gray-300">2 pièces de chaque métal, multiplicateur au choix.</p>
          <div class="quantity-selector" data-id="lot10-vagabond">
            <button type="button" class="quantity-btn minus" data-target="lot10-vagabond">−</button>
            <span class="qty-value" id="qty-lot10-vagabond">1</span>
            <button type="button" class="quantity-btn plus" data-target="lot10-vagabond">+</button>
          </div>
          <button class="snipcart-add-item btn btn-shop"
                  data-item-id="lot10-vagabond" data-item-name="Lot de 10–L’Offrande du Vagabond"
                  data-item-price="60" data-item-url="boutique.php"
                  data-item-description="2 pièces de chaque métal, multiplicateur au choix"
                  data-item-quantity="1"
                  data-item-custom1-name="Multiplicateur"
                  data-item-custom1-options="1|10|100|1000|10000">
            Ajouter — 60 $
          </button>
        </div>
        <?php endif; ?>

        <!-- Lot de 25 – La Monnaie des Royaumes -->
        <?php if(inStock('lot25-royaumes')): ?>
        <div class="card flex flex-col">
          <a href="lot25.php">
            <img src="images/Piece/pro/p25.png" alt="Lot de 25–La Monnaie des Royaumes" class="rounded mb-4 w-full h-48 object-cover">
          </a>
          <h4 class="text-2xl font-semibold mb-2">Lot de 25<br>La Monnaie des Royaumes</h4>
          <p class="mb-4 text-gray-300">1 pièce de chaque métal pour chaque multiplicateur.</p>
          <div class="quantity-selector" data-id="lot25-royaumes">
            <button type="button" class="quantity-btn minus" data-target="lot25-royaumes">−</button>
            <span class="qty-value" id="qty-lot25-royaumes">1</span>
            <button type="button" class="quantity-btn plus" data-target="lot25-royaumes">+</button>
          </div>
          <button class="snipcart-add-item btn btn-shop"
                  data-item-id="lot25-royaumes" data-item-name="Lot de 25–La Monnaie des Royaumes"
                  data-item-price="145" data-item-url="boutique.php"
                  data-item-description="1 pièce de chaque métal pour chaque multiplicateur"
                  data-item-quantity="1">
            Ajouter — 145 $
          </button>
        </div>
        <?php endif; ?>

        <!-- Lot de 50 – L’Essence des Royaumes -->
        <?php if(inStock('lot50-essence')): ?>
        <div class="card flex flex-col">
          <a href="lot50-essence.php">
            <img src="images/Piece/pro/p50.png" alt="Lot de 50–L’Essence des Royaumes" class="rounded mb-4 w-full h-48 object-cover">
          </a>
          <h4 class="text-2xl font-semibold mb-2">Lot de 50<br>L’Essence des Royaumes</h4>
          <p class="mb-4 text-gray-300">2 pièces de chaque métal pour chaque multiplicateur.</p>
          <div class="quantity-selector" data-id="lot50-essence">
            <button type="button" class="quantity-btn minus" data-target="lot50-essence">−</button>
            <span class="qty-value" id="qty-lot50-essence">1</span>
            <button type="button" class="quantity-btn plus" data-target="lot50-essence">+</button>
          </div>
          <button class="snipcart-add-item btn btn-shop"
                  data-item-id="lot50-essence" data-item-name="Lot de 50–L’Essence des Royaumes"
                  data-item-price="275" data-item-url="boutique.php"
                  data-item-description="2 pièces de chaque métal pour chaque multiplicateur"
                  data-item-quantity="1">
            Ajouter — 275 $
          </button>
        </div>
        <?php endif; ?>

        <!-- Lot de 50 – La Trésorerie du Seigneur Marchand -->
        <?php if(inStock('lot50-tresorerie')): ?>
        <div class="card flex flex-col">
          <a href="lot50-tresorerie.php">
            <img src="images/Piece/pro/p50.png" alt="Lot de 50–La Trésorerie du Seigneur Marchand" class="rounded mb-4 w-full h-48 object-cover">
          </a>
          <h4 class="text-2xl font-semibold mb-2">Lot de 50<br>La Trésorerie du Seigneur Marchand</h4>
          <p class="mb-4 text-gray-300">10 pièces de chaque métal, multiplicateur au choix.</p>
          <div class="quantity-selector" data-id="lot50-tresorerie">
            <button type="button" class="quantity-btn minus" data-target="lot50-tresorerie">−</button>
            <span class="qty-value" id="qty-lot50-tresorerie">1</span>
            <button type="button" class="quantity-btn plus" data-target="lot50-tresorerie">+</button>
          </div>
          <button class="snipcart-add-item btn btn-shop"
                  data-item-id="lot50-tresorerie" data-item-name="Lot de 50–La Trésorerie du Seigneur Marchand"
                  data-item-price="275" data-item-url="boutique.php"
                  data-item-description="10 pièces de chaque métal, multiplicateur au choix"
                  data-item-quantity="1"
                  data-item-custom1-name="Multiplicateur"
                  data-item-custom1-options="1|10|100|1000|10000">
            Ajouter — 275 $
          </button>
        </div>
        <?php endif; ?>
      </div>

      <p class="text-center mt-8 italic max-w-3xl mx-auto text-gray-300">
        Un jeu de rôle sans pièces physiques, c’est comme un Monopoly sans billets. Offrez‑vous le poids authentique du trésor.<br>
        <a href="https://www.youtube.com/watch?v=y96eAFtC4xE&t=624s" target="_blank" class="underline text-indigo-400 hover:text-indigo-300">
          Voir la démonstration en vidéo&nbsp;>
        </a>
      </p>
    </div>
  </section>

  <!-- ░░░ COFFRES SUR MESURE ░░░ -->
  <section class="py-16">
    <div class="max-w-3xl mx-auto px-6 text-center">
      <h3 class="text-4xl font-bold mb-6">Coffres sur mesure</h3>
	  <a href="contact.php"><img src="images/Piece/pro/coffre.png" alt="Le coffre du mage dément" class="rounded mb-4 w-full h-124 object-cover"></a>
      <p class="mb-6 text-gray-300">Besoin de plus de 50 pièces ? Des coffres personnalisés sont disponibles sur demande.</p>
      <a href="contact.php" class="btn btn-primary">Demander un devis</a>	  
    </div>
  </section>

  <!-- ░░░ CARTES ░░░ -->
  <section class="py-16">
    <div class="max-w-6xl mx-auto px-6">
      <h3 class="text-4xl font-bold text-center mb-12">Cartes d’équipement</h3>
      <div class="grid md:grid-cols-3 gap-10">

        <!-- Booster 15 -->
        <div class="card flex flex-col">
          <img src="images/cartes_booster.jpg" alt="Booster 15 cartes" class="rounded mb-4 w-full h-48 object-cover">
          <h4 class="text-2xl font-semibold mb-2">Booster 15 cartes</h4>
          <p class="mb-4 text-gray-300">15 cartes ciblées façon TCG&nbsp;: armes, vivres, potions… un booster pour enrichir immédiatement vos sessions.</p>
          <?php if(inStock('booster15')): ?>
            <div class="quantity-selector" data-id="booster15">
              <button type="button" class="quantity-btn minus" data-target="booster15">−</button>
              <span class="qty-value" id="qty-booster15">1</span>
              <button type="button" class="quantity-btn plus" data-target="booster15">+</button>
            </div>
            <button class="snipcart-add-item btn btn-shop"
                    data-item-id="booster15" data-item-name="Booster 15 cartes"
                    data-item-price="15" data-item-weight="100" data-item-url="boutique.php"
                    data-item-description="15 cartes illustrées thématiques" data-item-quantity="1">
              Ajouter — 15&nbsp;$
            </button>
          <?php else: ?><span class="btn btn-shop" disabled>Rupture de stock</span><?php endif; ?>
        </div>

        <!-- Pack 60 -->
        <div class="card flex flex-col">
          <img src="images/cartes_pack60.jpg" alt="Pile marchande 60 cartes" class="rounded mb-4 w-full h-48 object-cover">
          <h4 class="text-2xl font-semibold mb-2">Pile marchande 60&nbsp;cartes</h4>
          <p class="mb-4 text-gray-300">Une pile marchande de 60&nbsp;cartes idéale pour simuler une échoppe itinérante et surprendre vos joueurs.</p>
          <?php if(inStock('pack60')): ?>
            <div class="quantity-selector" data-id="pack60">
              <button type="button" class="quantity-btn minus" data-target="pack60">−</button>
              <span class="qty-value" id="qty-pack60">1</span>
              <button type="button" class="quantity-btn plus" data-target="pack60">+</button>
            </div>
            <button class="snipcart-add-item btn btn-shop"
                    data-item-id="pack60" data-item-name="Pack 60 cartes"
                    data-item-price="45" data-item-weight="350" data-item-url="boutique.php"
                    data-item-description="60 cartes d’équipement variées" data-item-quantity="1">
              Ajouter — 45&nbsp;$
            </button>
          <?php else: ?><span class="btn btn-shop" disabled>Rupture de stock</span><?php endif; ?>
        </div>

        <!-- Mystère 100 -->
        <div class="card flex flex-col">
          <img src="images/cartes_mystere100.jpg" alt="Mystère 100 cartes" class="rounded mb-4 w-full h-48 object-cover">
          <h4 class="text-2xl font-semibold mb-2">Mystère 100 cartes</h4>
          <p class="mb-4 text-gray-300">Le coffre ultime&nbsp;: 100&nbsp;cartes dont de rares exemplaires, en tirage limité. Osez l’inconnu&nbsp;!</p>
          <?php if(inStock('mystere100')): ?>
            <div class="quantity-selector" data-id="mystere100">
              <button type="button" class="quantity-btn minus" data-target="mystere100">−</button>
              <span class="qty-value" id="qty-mystere100">1</span>
              <button type="button" class="quantity-btn plus" data-target="mystere100">+</button>
            </div>
            <button class="snipcart-add-item btn btn-shop"
                    data-item-id="mystere100" data-item-name="Mystère 100 cartes"
                    data-item-price="65" data-item-weight="550" data-item-url="boutique.php"
                    data-item-description="100 cartes d’équipement (rares incluses)" data-item-quantity="1">
              Ajouter — 65&nbsp;$
            </button>
          <?php else: ?><span class="btn btn-shop" disabled>Rupture de stock</span><?php endif; ?>
        </div>

      </div>
    </div>
  </section>

  <!-- ===== Investissement collectif & Carte de propriété ===== -->
  <section class="py-16 bg-gray-900/80">
    <div class="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10">
      <div class="md:w-1/3">
        <img src="images/carte_propriete.png" alt="Carte de propriété" class="rounded-xl shadow-lg w-full object-cover" loading="lazy">
      </div>
      <div class="md:w-2/3 text-gray-200 space-y-4">
        <h3 class="text-3xl font-bold">Investissez ensemble, partagez l’aventure</h3>
        <p>Ne laissez pas le maître de jeu se ruiner pour votre plaisir&nbsp;: chaque joueur peut contribuer en achetant son propre triptyque, ses cartes et ses pièces.</p>
        <p>À titre de comparaison, certaines figurines de dragon se vendent plus de <strong>300&nbsp;$</strong> et ne sont utilisées qu’une seule fois… nos pièces, elles, servent à chaque session et pour des années de campagne.</p>
        <p>Complétez la <em>carte de propriété</em> ci‑contre en indiquant votre nom et le nombre de pièces achetées, signez-la et remettez vos trésors au maître de jeu. À la fin de la campagne, il vous les restituera sans difficulté.</p>
      </div>
    </div>
  </section>

  <!-- ░░░ TRIPTYQUES ░░░ -->
  <section class="py-16 bg-gray-900/80">
    <div class="max-w-6xl mx-auto px-6">
      <h3 class="text-4xl font-bold text-center mb-12">Triptyques de personnage</h3>
      <div class="grid md:grid-cols-3 gap-10">

        <!-- Triptyque unitaire -->
        <div class="card flex flex-col">
          <img src="images/triptyque_unitaire.jpg" alt="Triptyque unitaire" class="rounded mb-4 w-full h-48 object-cover">
          <h4 class="text-2xl font-semibold mb-2">Triptyque unitaire</h4>
          <p class="mb-4 text-gray-300">Classe de base, équipement et pièces de départ inclus. Tout pour créer un personnage instantanément.</p>
          <?php if(inStock('triptyque-unit')): ?>
            <div class="quantity-selector" data-id="triptyque-unit">
              <button type="button" class="quantity-btn minus" data-target="triptyque-unit">−</button>
              <span class="qty-value" id="qty-triptyque-unit">1</span>
              <button type="button" class="quantity-btn plus" data-target="triptyque-unit">+</button>
            </div>
            <button class="snipcart-add-item btn btn-shop"
                    data-item-id="triptyque-unit" data-item-name="Triptyque unitaire"
                    data-item-price="30" data-item-weight="120" data-item-url="boutique.php"
                    data-item-description="Triptyque rigide classe au choix" data-item-quantity="1">
              Ajouter — 30&nbsp;$
            </button>
          <?php else: ?><span class="btn btn-shop" disabled>Rupture de stock</span><?php endif; ?>
        </div>

        <!-- Triptyque spécialisé -->
        <div class="card flex flex-col">
          <img src="images/triptyque_spec.jpg" alt="Triptyque spécialisé" class="rounded mb-4 w-full h-48 object-cover">
          <h4 class="text-2xl font-semibold mb-2">Triptyque spécialisé</h4>
          <p class="mb-4 text-gray-300">Sous‑classe, espèce ou historique précis&nbsp;: personnalisez votre héros avec style.</p>
          <?php if(inStock('triptyque-spec')): ?>
            <div class="quantity-selector" data-id="triptyque-spec">
              <button type="button" class="quantity-btn minus" data-target="triptyque-spec">−</button>
              <span class="qty-value" id="qty-triptyque-spec">1</span>
              <button type="button" class="quantity-btn plus" data-target="triptyque-spec">+</button>
            </div>
            <button class="snipcart-add-item btn btn-shop"
                    data-item-id="triptyque-spec" data-item-name="Triptyque spécialisé"
                    data-item-price="40" data-item-weight="120" data-item-url="boutique.php"
                    data-item-description="Triptyque spécialisé + équipement" data-item-quantity="1">
              Ajouter — 40&nbsp;$
            </button>
          <?php else: ?><span class="btn btn-shop" disabled>Rupture de stock</span><?php endif; ?>
        </div>

        <!-- Pack étoiles -->
        <div class="card flex flex-col">
          <img src="images/triptyque_pack_etoile.jpg" alt="Pack étoiles" class="rounded mb-4 w-full h-48 object-cover">
          <h4 class="text-2xl font-semibold mb-2">Pack “Guidé par les étoiles”</h4>
          <p class="mb-4 text-gray-300">3&nbsp;triptyques aléatoires et une aide cartonnée dans une pochette opaque&nbsp;: l’option parfaite pour des cadeaux surprises.</p>
          <?php if(inStock('pack-etoile')): ?>
            <div class="quantity-selector" data-id="pack-etoile">
              <button type="button" class="quantity-btn minus" data-target="pack-etoile">−</button>
              <span class="qty-value" id="qty-pack-etoile">1</span>
              <button type="button" class="quantity-btn plus" data-target="pack-etoile">+</button>
            </div>
            <button class="snipcart-add-item btn btn-shop"
                    data-item-id="pack-etoile" data-item-name="Pack triptyques & aide"
                    data-item-price="110" data-item-weight="420" data-item-url="boutique.php"
                    data-item-description="3 triptyques aléatoires + cheat-sheet classe" data-item-quantity="1">
              Ajouter — 110&nbsp;$
            </button>
          <?php else: ?><span class="btn btn-shop" disabled>Rupture de stock</span><?php endif; ?>
        </div>

      </div>
    </div>
  </section>

</main>

<?php include 'footer.php'; ?>
  <script src="js/app.js"></script>
</body>
</html>
