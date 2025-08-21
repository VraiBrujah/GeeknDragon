<?php
require __DIR__ . '/bootstrap.php';

use GeeknDragon\Core\SessionHelper;
use GeeknDragon\Security\CsrfProtection;

SessionHelper::ensureSession();
$active = 'contact';
require __DIR__ . '/i18n.php';
$title  = $translations['meta']['contact']['title'] ?? 'Geek & Dragon';
$metaDescription = $translations['meta']['contact']['desc'] ?? '';
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

    <div class="parchment rounded-3xl p-10 md:p-14 w-full max-w-2xl text-gray-900">
      <h1 class="text-4xl font-bold text-center mb-6" data-i18n="contact.title">Demande de devis</h1>
        <p class="text-center mb-8 text-lg txt-court" data-i18n="contact.subtitle">Pour recevoir une offre personnalisée, remplis ce formulaire magique.</p>

      <form action="contact-handler.php" method="POST" class="space-y-6" novalidate>

        <!-- Messages d'erreur -->
        <?php if (!empty($errors)) : ?>
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <ul class="list-disc list-inside">
            <?php foreach ($errors as $error) : ?>
              <li><?= htmlspecialchars($error) ?></li>
            <?php endforeach; ?>
          </ul>
        </div>
        <?php endif; ?>

        <!-- Message de succès -->
        <?php if (isset($_GET['s']) && $_GET['s'] === 'ok') : ?>
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p><strong>Merci !</strong> Votre demande a été envoyée avec succès. Nous vous répondrons rapidement.</p>
        </div>
        <?php endif; ?>

        <!-- CSRF Token -->
        <?= CsrfProtection::getHiddenField() ?>
        
        <!-- Honeypot anti-spam (ne pas retirer) -->
        <input type="text" name="company" class="hidden" tabindex="-1" autocomplete="off" />

        <div>
          <label for="name" class="block text-[#4b3e2c] font-semibold mb-2" data-i18n="contact.form.name">Nom complet *</label>
          <input 
            id="name" 
            name="name" 
            type="text" 
            required 
            minlength="2" 
            maxlength="120" 
            value="<?= htmlspecialchars($old['name'] ?? '') ?>" 
            placeholder="Ex. Jean Dupont"
            class="w-full rounded-md border border-gray-300 p-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600" 
          />
        </div>

        <div>
          <label for="email" class="block text-[#4b3e2c] font-semibold mb-2" data-i18n="contact.form.email">Adresse e-mail *</label>
          <input 
            id="email" 
            name="email" 
            type="email" 
            required 
            maxlength="160" 
            value="<?= htmlspecialchars($old['email'] ?? '') ?>" 
            placeholder="vous@exemple.com"
            class="w-full rounded-md border border-gray-300 p-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600" 
          />
        </div>

        <div>
          <label for="phone" class="block text-[#4b3e2c] font-semibold mb-2" data-i18n="contact.form.phone">Téléphone</label>
          <input 
            id="phone" 
            name="phone" 
            type="tel" 
            maxlength="40" 
            value="<?= htmlspecialchars($old['phone'] ?? '') ?>" 
            placeholder="Optionnel"
            class="w-full rounded-md border border-gray-300 p-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600" 
          />
        </div>

        <div>
          <label for="service" class="block text-[#4b3e2c] font-semibold mb-2">Sujet / Service</label>
          <select 
            id="service" 
            name="service" 
            class="w-full rounded-md border border-gray-300 p-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="Devis boutique en ligne" <?= ($old['service'] ?? '') === 'Devis boutique en ligne' ? 'selected' : '' ?>>Devis boutique en ligne</option>
            <option value="Site vitrine" <?= ($old['service'] ?? '') === 'Site vitrine' ? 'selected' : '' ?>>Site vitrine</option>
            <option value="Maintenance / Support" <?= ($old['service'] ?? '') === 'Maintenance / Support' ? 'selected' : '' ?>>Maintenance / Support</option>
            <option value="Autre" <?= ($old['service'] ?? '') === 'Autre' ? 'selected' : '' ?>>Autre</option>
          </select>
        </div>

        <div>
          <label for="message" class="block text-[#4b3e2c] font-semibold mb-2" data-i18n="contact.form.message">Votre demande *</label>
          <textarea 
            id="message" 
            name="message" 
            rows="6" 
            required 
            maxlength="3000" 
            placeholder="Dites-nous tout..."
            class="w-full rounded-md border border-gray-300 p-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          ><?= htmlspecialchars($old['message'] ?? '') ?></textarea>
          <div class="text-sm text-gray-500 mt-1">
            <span id="char-count">0</span> / 3000 caractères
          </div>
        </div>

        <!-- Consentement RGPD -->
        <div class="text-sm text-gray-600 bg-gray-50 p-4 rounded">
          <p><strong>Protection des données :</strong> En envoyant ce formulaire, vous acceptez que nous utilisions vos informations pour vous répondre par email. Vos données ne seront pas transmises à des tiers.</p>
        </div>

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
  
  <script nonce="<?= htmlspecialchars($cspNonce, ENT_QUOTES, 'UTF-8'); ?>">
  document.addEventListener('DOMContentLoaded', function() {
    const messageTextarea = document.getElementById('message');
    const charCount = document.getElementById('char-count');
    
    function updateCharCount() {
      const count = messageTextarea.value.length;
      charCount.textContent = count;
      
      if (count > 3000) {
        charCount.classList.add('text-red-500');
        charCount.classList.remove('text-gray-500');
      } else {
        charCount.classList.add('text-gray-500');
        charCount.classList.remove('text-red-500');
      }
    }
    
    messageTextarea.addEventListener('input', updateCharCount);
    updateCharCount(); // Initial count
  });
  </script>
</body>
</html>
