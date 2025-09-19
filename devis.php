<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

use GeeknDragon\Core\SessionHelper;
use GeeknDragon\Security\CsrfProtection;

SessionHelper::ensureSession();
$config = require __DIR__ . '/config.php';
$translator = require __DIR__ . '/i18n.php';

$lang = $translator->getCurrentLanguage();
$title = __('meta.quote.title', 'Demande de devis | Geek & Dragon');
$metaDescription = __('meta.quote.desc', 'Demande de devis et informations pour vos projets immersifs.');
$active = 'contact';
$extraHead = '';

$errors = $_SESSION['errors'] ?? [];
$old = $_SESSION['old'] ?? [];
unset($_SESSION['errors'], $_SESSION['old']);

$maxChars = (int) ($config['max_message_chars'] ?? getSecureEnvVar('MAX_MESSAGE_CHARS', 3000));
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang, ENT_QUOTES, 'UTF-8'); ?>">
<?php include __DIR__ . '/head-common.php'; ?>
<body>
<?php include __DIR__ . '/header.php'; ?>
<main id="main" class="pt-32 flex items-center justify-center min-h-screen px-4">
  <div class="parchment rounded-3xl p-10 md:p-14 w-full max-w-2xl text-gray-900">
    <h1 class="text-4xl font-bold text-center mb-6" data-i18n="quote.title">Demande de devis</h1>
    <p class="text-center mb-8 text-lg txt-court" data-i18n="quote.subtitle">Pour recevoir une offre personnalisée, remplis ce formulaire magique.</p>

    <?php if (!empty($errors)) : ?>
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        <ul class="list-disc list-inside">
          <?php foreach ($errors as $error) : ?>
            <li><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8'); ?></li>
          <?php endforeach; ?>
        </ul>
      </div>
    <?php endif; ?>

    <form action="<?= htmlspecialchars(langUrl('/devis'), ENT_QUOTES, 'UTF-8'); ?>" method="POST" class="space-y-6" novalidate>
      <?= CsrfProtection::getHiddenField(); ?>
      <input type="text" name="company" class="hidden" tabindex="-1" autocomplete="off" />

      <div>
        <label for="name" class="block text-[#4b3e2c] font-semibold mb-2" data-i18n="quote.form.name">Nom complet *</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minlength="2"
          maxlength="120"
          value="<?= htmlspecialchars($old['name'] ?? '', ENT_QUOTES, 'UTF-8'); ?>"
          placeholder="Ex. Jean Dupont"
          class="w-full rounded-md border border-gray-300 p-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
      </div>

      <div>
        <label for="email" class="block text-[#4b3e2c] font-semibold mb-2" data-i18n="quote.form.email">Adresse e-mail *</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxlength="160"
          value="<?= htmlspecialchars($old['email'] ?? '', ENT_QUOTES, 'UTF-8'); ?>"
          placeholder="vous@exemple.com"
          class="w-full rounded-md border border-gray-300 p-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
      </div>

      <div>
        <label for="phone" class="block text-[#4b3e2c] font-semibold mb-2" data-i18n="quote.form.phone">Téléphone</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          maxlength="40"
          value="<?= htmlspecialchars($old['phone'] ?? '', ENT_QUOTES, 'UTF-8'); ?>"
          placeholder="Optionnel"
          class="w-full rounded-md border border-gray-300 p-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
      </div>

      <div>
        <label for="service" class="block text-[#4b3e2c] font-semibold mb-2" data-i18n="quote.form.service">Sujet / Service</label>
        <select
          id="service"
          name="service"
          class="w-full rounded-md border border-gray-300 p-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        >
          <option value="Devis boutique en ligne" <?= (($old['service'] ?? '') === 'Devis boutique en ligne') ? 'selected' : ''; ?>>Devis boutique en ligne</option>
          <option value="Site vitrine" <?= (($old['service'] ?? '') === 'Site vitrine') ? 'selected' : ''; ?>>Site vitrine</option>
          <option value="Maintenance / Support" <?= (($old['service'] ?? '') === 'Maintenance / Support') ? 'selected' : ''; ?>>Maintenance / Support</option>
          <option value="Autre" <?= (($old['service'] ?? '') === 'Autre') ? 'selected' : ''; ?>>Autre</option>
        </select>
      </div>

      <div>
        <label for="message" class="block text-[#4b3e2c] font-semibold mb-2" data-i18n="quote.form.message">Votre demande *</label>
        <textarea
          id="message"
          name="message"
          rows="6"
          required
          maxlength="<?= $maxChars; ?>"
          placeholder="Dites-nous tout..."
          class="w-full rounded-md border border-gray-300 p-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        ><?= htmlspecialchars($old['message'] ?? '', ENT_QUOTES, 'UTF-8'); ?></textarea>
        <div class="text-sm text-gray-500 mt-1"><span id="char-count">0</span> / <?= $maxChars; ?> caractères</div>
      </div>

      <div class="text-sm text-gray-600 bg-gray-50 p-4 rounded" data-i18n="quote.form.consent">
        En envoyant ce formulaire, vous acceptez que nous utilisions vos informations pour vous répondre par email.
      </div>

      <button type="submit" class="btn w-full bg-indigo-700 hover:bg-indigo-600 text-white font-semibold py-3 rounded-full transition" data-i18n="quote.form.submit">Envoyer ma demande</button>
    </form>
  </div>
</main>
<?php include __DIR__ . '/footer.php'; ?>
<script src="/js/app.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function () {
    const messageTextarea = document.getElementById('message');
    const charCount = document.getElementById('char-count');

    function updateCharCount() {
      const count = messageTextarea.value.length;
      charCount.textContent = count;

      if (count > <?= $maxChars; ?>) {
        charCount.classList.add('text-red-500');
        charCount.classList.remove('text-gray-500');
      } else {
        charCount.classList.add('text-gray-500');
        charCount.classList.remove('text-red-500');
      }
    }

    messageTextarea.addEventListener('input', updateCharCount);
    updateCharCount();
  });
</script>
</body>
</html>
