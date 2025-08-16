<?php
require __DIR__ . '/bootstrap.php';
session_start();
$active = 'contact';
require __DIR__ . '/i18n.php';
$title  = $translations['meta']['contact']['title'] ?? 'Geek & Dragon';
$metaDescription = $translations['meta']['contact']['desc'] ?? '';
$extraHead = '';

if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
$csrfToken = $_SESSION['csrf_token'];

$errors = $_SESSION['errors'] ?? [];
$old = $_SESSION['old'] ?? [];
unset($_SESSION['errors'], $_SESSION['old']);
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang) ?>">
<?php include 'head-common.php'; ?>

<body>

  <?php
  ob_start();
  include 'snipcart-init.php';
  $snipcartInit = ob_get_clean();
  include 'header.php';
  echo $snipcartInit;
  ?>

  <main id="main" class="pt-32 flex items-center justify-center min-h-screen px-4" style="background: var(--site-bg);">

    <div class="premium-card rounded-3xl p-10 md:p-14 w-full max-w-2xl animate-scale-in">
      <h1 class="premium-title text-4xl font-bold text-center mb-6" data-i18n="contact.title">Demande de devis</h1>
        <p class="premium-subtitle text-center mb-8 text-lg" data-i18n="contact.subtitle">Pour recevoir une offre personnalisée, remplis ce formulaire magique.</p>

      <form action="contact-handler.php" method="POST" class="space-y-6">

        <?php if (!empty($errors)) : ?>
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <ul class="list-disc list-inside">
            <?php foreach ($errors as $error) : ?>
              <li><?= $error ?></li>
            <?php endforeach; ?>
          </ul>
        </div>
        <?php endif; ?>

        <div>
          <label for="name" class="font-semibold" style="color: var(--site-text-accent);" data-i18n="contact.form.name">Nom complet</label>
          <input id="name" name="Nom" type="text" required value="<?= htmlspecialchars($old['Nom'] ?? '') ?>" class="w-full mt-1 rounded-md border border-gray-300 p-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600" />
        </div>

        <div>
          <label for="email" class="font-semibold" style="color: var(--site-text-accent);" data-i18n="contact.form.email">Adresse e-mail</label>
          <input id="email" name="Email" type="email" required value="<?= htmlspecialchars($old['Email'] ?? '') ?>" class="w-full mt-1 rounded-md border border-gray-300 p-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600" />
        </div>

        <div>
          <label for="phone" class="font-semibold" style="color: var(--site-text-accent);" data-i18n="contact.form.phone">Téléphone (optionnel)</label>
          <input id="phone" name="Téléphone" type="tel" value="<?= htmlspecialchars($old['Téléphone'] ?? '') ?>" class="w-full mt-1 rounded-md border border-gray-300 p-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600" />
        </div>

        <div>
          <label for="message" class="font-semibold" style="color: var(--site-text-accent);" data-i18n="contact.form.message">Détail de la demande</label>
          <textarea id="message" name="Message" rows="5" required class="w-full mt-1 rounded-md border border-gray-300 p-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"><?= htmlspecialchars($old['Message'] ?? '') ?></textarea>
        </div>

        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrfToken) ?>" />

          <button type="submit" class="btn-premium w-full font-semibold py-3" data-i18n="contact.form.submit">
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
