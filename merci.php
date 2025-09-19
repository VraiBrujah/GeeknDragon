<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$translator = require __DIR__ . '/i18n.php';
$lang = $translator->getCurrentLanguage();

$title = __('meta.thanks.title', 'Merci - Geek & Dragon');
$metaDescription = __('meta.thanks.desc', 'Merci pour votre message. Nous revenons vers vous rapidement.');
$active = 'contact';
$styleVersion = gdLocalAssetVersion('css/style.css');
$extraHead = <<<HTML
  <link rel="stylesheet" href="/css/style.css?v={$styleVersion}">
HTML;
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang, ENT_QUOTES, 'UTF-8'); ?>">
<?php include __DIR__ . '/head-common.php'; ?>
<body>
<?php include __DIR__ . '/header.php'; ?>

  <main id="main" class="pt-[var(--header-height)] flex items-center justify-center min-h-screen">
    <div class="text-center max-w-xl bg-gray-900/70 backdrop-blur p-10 rounded-3xl border border-yellow-500 shadow-2xl">
      <h1 class="text-4xl font-bold mb-4 text-yellow-400">Merci !</h1>
      <p class="text-lg mb-6 txt-court">Votre demande a bien été transmise à notre équipe.</p>
      <a href="<?= htmlspecialchars(langUrl('/index.php'), ENT_QUOTES, 'UTF-8'); ?>" class="inline-block bg-yellow-600 hover:bg-yellow-500 text-white font-bold px-6 py-3 rounded-full transition">Retour à l'accueil</a>
    </div>
  </main>

  <script src="/js/app.js"></script>
  <script src="/js/script.js"></script>
</body>
</html>
