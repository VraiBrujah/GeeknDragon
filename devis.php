<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

use GeeknDragon\Core\SessionHelper;
use GeeknDragon\Security\CsrfProtection;

SessionHelper::ensureSession();
$active = 'contact';
require __DIR__ . '/i18n.php';
$title = $translations['meta']['quote']['title'] ?? 'Geek & Dragon';
$metaDescription = $translations['meta']['quote']['desc'] ?? '';
$extraHead = '';

$errors = $_SESSION['errors'] ?? [];
$old = $_SESSION['old'] ?? [];
unset($_SESSION['errors'], $_SESSION['old']);
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang) ?>">
<?php include 'head-common.php'; ?>
<body>
  <?php include 'header.php'; ?>
  <main id="main" class="pt-32 flex items-center justify-center min-h-screen px-4">
    <div class="surface rounded-3xl p-10 md:p-14 w-full max-w-2xl text-gray-900">
      <h1 class="text-4xl font-bold text-center mb-6" data-i18n="quote.title">Demande de devis</h1>
      <p class="text-center mb-8 text-lg txt-court" data-i18n="quote.subtitle">Pour recevoir une offre personnalisée, remplis ce formulaire magique.</p>
      <form action="devis-handler.php" method="POST" class="space-y-6" novalidate>
        <?php if (!empty($errors)) : ?>
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <ul class="list-disc list-inside">
            <?php foreach ($errors as $error) : ?>
              <li><?= htmlspecialchars($error) ?></li>
            <?php endforeach; ?>
          </ul>
        </div>
        <?php endif; ?>

        <?= CsrfProtection::getHiddenField() ?>
        <input type="text" name="company" class="hidden" tabindex="-1" autocomplete="off" />

        <div>
          <label for="name" class="block font-semibold mb-2" data-i18n="quote.form.name">Nom complet *</label>
          <input id="name" name="name" type="text" required maxlength="120" value="<?= htmlspecialchars($old['name'] ?? '') ?>" class="gd-field w-full rounded-md border border-gray-300 p-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600" />
        </div>

        <div>
          <label for="email" class="block font-semibold mb-2" data-i18n="quote.form.email">Adresse e-mail *</label>
          <input id="email" name="email" type="email" required maxlength="160" value="<?= htmlspecialchars($old['email'] ?? '') ?>" class="gd-field w-full rounded-md border border-gray-300 p-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600" />
        </div>

        <div>
          <label for="phone" class="block font-semibold mb-2" data-i18n="quote.form.phone">Téléphone</label>
          <input id="phone" name="phone" type="tel" maxlength="40" value="<?= htmlspecialchars($old['phone'] ?? '') ?>" class="gd-field w-full rounded-md border border-gray-300 p-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600" />
        </div>

        <div>
          <label for="service" class="block font-semibold mb-2" data-i18n="quote.form.service">Sujet / Service</label>
          <select id="service" name="service" class="gd-field w-full rounded-md border border-gray-300 p-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600">
            <option value="Boutique" <?= ($old['service'] ?? '') === 'Boutique' ? 'selected' : '' ?>>Boutique</option>
            <option value="Site vitrine" <?= ($old['service'] ?? '') === 'Site vitrine' ? 'selected' : '' ?>>Site vitrine</option>
            <option value="Maintenance" <?= ($old['service'] ?? '') === 'Maintenance' ? 'selected' : '' ?>>Maintenance</option>
            <option value="Autre" <?= ($old['service'] ?? '') === 'Autre' ? 'selected' : '' ?>>Autre</option>
          </select>
        </div>

        <div>
          <label for="message" class="block font-semibold mb-2" data-i18n="quote.form.message">Votre demande *</label>
          <textarea id="message" name="message" rows="6" required maxlength="3000" class="gd-field w-full rounded-md border border-gray-300 p-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"><?= htmlspecialchars($old['message'] ?? '') ?></textarea>
        </div>

        <button type="submit" class="btn btn-primary w-full bg-indigo-700 hover:bg-indigo-600 text-white font-semibold py-3 rounded-full transition" data-i18n="quote.form.submit">Envoyer ma demande</button>
      </form>
    </div>
  </main>
  <?php include 'footer.php'; ?>
  <script src="/js/app.js"></script>
</body>
</html>
