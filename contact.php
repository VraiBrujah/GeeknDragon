<?php
$active = 'contact';
$title  = 'Demande de devis | Geek & Dragon';
$metaDescription = "Demande de devis et informations pour vos projets immersifs.";
$extraHead = '';
?>
<!DOCTYPE html>
<html lang="fr">
<?php include 'head-common.php'; ?>

<body>

  <?php include 'header.php'; ?>

  <main class="pt-32 flex items-center justify-center min-h-screen px-4">

    <div class="parchment rounded-3xl p-10 md:p-14 w-full max-w-2xl text-gray-900">
      <h1 class="text-4xl font-bold text-center mb-6" data-i18n="contact.title">Demande de devis</h1>
        <p class="text-center mb-8 text-lg txt-court" data-i18n="contact.subtitle">Pour recevoir une offre personnalisée, remplis ce formulaire magique.</p>

      <form action="https://formsubmit.co/contact@geekndragon.com" method="POST" class="space-y-6">

        <div>
          <label for="name" class="text-[#4b3e2c] font-semibold" data-i18n="contact.form.name">Nom complet</label>
          <input id="name" name="Nom" type="text" required class="w-full mt-1 rounded-md border border-gray-300 p-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600" />
        </div>

        <div>
          <label for="email" class="text-[#4b3e2c] font-semibold" data-i18n="contact.form.email">Adresse e-mail</label>
          <input id="email" name="Email" type="email" required class="w-full mt-1 rounded-md border border-gray-300 p-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600" />
        </div>

        <div>
          <label for="phone" class="text-[#4b3e2c] font-semibold" data-i18n="contact.form.phone">Téléphone (optionnel)</label>
          <input id="phone" name="Téléphone" type="tel" class="w-full mt-1 rounded-md border border-gray-300 p-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600" />
        </div>

        <div>
          <label for="message" class="text-[#4b3e2c] font-semibold" data-i18n="contact.form.message">Détail de la demande</label>
          <textarea id="message" name="Message" rows="5" required class="w-full mt-1 rounded-md border border-gray-300 p-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"></textarea>
        </div>

        <!-- Options de FormSubmit -->
        <input type="hidden" name="_captcha" value="false" />
        <input type="hidden" name="_next" value="https://geekndragon.com/merci.php" />

          <button type="submit" class="btn w-full bg-indigo-700 hover:bg-indigo-600 text-white font-semibold py-3 rounded-full transition" data-i18n="contact.form.submit">
            Envoyer ma demande
          </button>
      </form>

        <div class="text-center mt-10 text-sm">
          <p class="txt-court"><strong>Brujah</strong> — <span data-i18n="contact.info.role">Responsable produit</span></p>
          <p class="txt-court"><a href="mailto:contact@geekndragon.com" class="text-indigo-700 hover:underline">contact@geekndragon.com</a></p>
          <p class="txt-court"><a href="tel:+14387642612" class="text-indigo-700 hover:underline">+1 438 764-2612</a></p>
        </div>
    </div>

  </main>

  <?php include 'footer.php'; ?>
  <script src="/js/app.js"></script>
</body>
</html>
