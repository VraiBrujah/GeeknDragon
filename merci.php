<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$translator = require __DIR__ . '/i18n.php';
$lang = $translator->getCurrentLanguage();

if (!function_exists('gdLocalAssetVersion')) {
    /**
     * Retourne le timestamp de dernière modification pour versionner les assets.
     */
    function gdLocalAssetVersion(string $relativePath): string
    {
        $absolute = __DIR__ . '/' . ltrim($relativePath, '/');
        return is_file($absolute) ? (string) filemtime($absolute) : '0';
    }
}

$title = __('meta.thanks.title', 'Merci - Geek & Dragon');
$metaDescription = __('meta.thanks.desc', 'Merci pour votre message. Nous revenons vers vous rapidement.');
$active = 'contact';
$styleVersion = gdLocalAssetVersion('css/style.css');
$extraHead = <<<HTML
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css?v={$styleVersion}">
HTML;
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang, ENT_QUOTES, 'UTF-8'); ?>">
<?php include __DIR__ . '/head-common.php'; ?>
<body>
<?php include __DIR__ . '/header.php'; ?>

  <main id="main" class="pt-32 flex items-center justify-center min-h-screen">
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
