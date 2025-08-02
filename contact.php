<?php
$active = 'contact';
$title  = 'Demande de devis | Geek & Dragon';
$metaDescription = "Demande de devis et informations pour vos projets immersifs.";
$extraHead = <<<HTML
<style>
    body {
      background: url('images/bg_texture.jpg') center/cover fixed;
      color: #1e1b16;
    }
    .parchment {
      background: #fdf8e4 url('images/parchment_fibers.png') repeat;
      box-shadow: 0 15px 40px -10px rgba(0,0,0,.7);
      border: 3px solid #c4a36d;
    }
    label {
      color: #4b3e2c;
      font-weight: 600;
    }
  </style>
HTML;
?>
<!DOCTYPE html>
<html lang="fr">
<?php include 'head-common.php'; ?>

<body class="bg-[url('images/bg_texture.jpg')] bg-cover bg-fixed text-gray-100">

  <?php include 'header.php'; ?>

  <main class="pt-32 flex items-center justify-center min-h-screen px-4">

    <div class="parchment rounded-3xl p-10 md:p-14 w-full max-w-2xl text-gray-900">
      <h1 class="text-4xl font-bold text-center mb-6">Demande de devis</h1>
        <p class="text-center mb-8 text-lg txt-court">Pour recevoir une offre personnalisée, remplis ce formulaire magique.</p>

      <form action="https://formsubmit.co/contact@geekndragon.com" method="POST" class="space-y-6">

        <div>
          <label for="name">Nom complet</label>
          <input id="name" name="Nom" type="text" required class="w-full mt-1 rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-600" />
        </div>

        <div>
          <label for="email">Adresse e-mail</label>
          <input id="email" name="Email" type="email" required class="w-full mt-1 rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-600" />
        </div>

        <div>
          <label for="phone">Téléphone (optionnel)</label>
          <input id="phone" name="Téléphone" type="tel" class="w-full mt-1 rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-600" />
        </div>

        <div>
          <label for="message">Détail de la demande</label>
          <textarea id="message" name="Message" rows="5" required class="w-full mt-1 rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-600"></textarea>
        </div>

        <!-- Options de FormSubmit -->
        <input type="hidden" name="_captcha" value="false" />
        <input type="hidden" name="_next" value="https://geekndragon.com/merci.php" />

          <button type="submit" class="btn w-full bg-indigo-700 hover:bg-indigo-600 text-white font-semibold py-3 rounded-full transition">
            Envoyer ma demande
          </button>
      </form>

        <div class="text-center mt-10 text-sm">
          <p class="txt-court"><strong>Brujah</strong> — Responsable produit</p>
          <p class="txt-court"><a href="mailto:contact@geekndragon.com" class="text-indigo-700 hover:underline">contact@geekndragon.com</a></p>
          <p class="txt-court"><a href="tel:+14387642612" class="text-indigo-700 hover:underline">+1 438 764-2612</a></p>
        </div>
    </div>

  </main>

  <?php include 'footer.php'; ?>
</body>
</html>
