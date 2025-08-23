<?php
declare(strict_types=1);

/** @var Throwable $exception */
/** @var bool $isDev */

require __DIR__ . '/../../bootstrap.php';
require __DIR__ . '/../../i18n.php';

$title = $translations['errors']['500']['title'] ?? 'Geek & Dragon';
$metaDescription = $translations['errors']['500']['message'] ?? '';
$apiConfigured = true;
$active = '';
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang) ?>">
<?php include __DIR__ . '/../../head-common.php'; ?>
<body>
  <?php include __DIR__ . '/../../header.php'; ?>

  <main id="main" class="pt-32 flex items-center justify-center min-h-screen">
    <div class="text-center max-w-xl bg-gray-900/70 backdrop-blur p-10 rounded-3xl border border-yellow-500 shadow-2xl">
      <h1 class="text-4xl font-bold mb-4 text-yellow-400" data-i18n="errors.500.title">
        <?= htmlspecialchars($translations['errors']['500']['title'] ?? 'Erreur serveur') ?>
      </h1>
      <?php if (($isDev ?? false) && isset($exception)): ?>
        <pre class="text-left overflow-auto bg-gray-800 p-4 rounded mb-4"><?= htmlspecialchars($exception->getMessage()) ?></pre>
        <pre class="text-left overflow-auto bg-gray-800 p-4 rounded"><?= htmlspecialchars($exception->getTraceAsString()) ?></pre>
      <?php else: ?>
        <p class="text-lg mb-6 txt-court" data-i18n="errors.500.message">
          <?= htmlspecialchars($translations['errors']['500']['message'] ?? 'Une erreur est survenue. Veuillez réessayer plus tard.') ?>
        </p>
        <a href="<?= langUrl('index.php') ?>" class="inline-block bg-yellow-600 hover:bg-yellow-500 text-white font-bold px-6 py-3 rounded-full transition" data-i18n="errors.backHome">
          <?= htmlspecialchars($translations['errors']['backHome'] ?? 'Retour à l\'accueil') ?>
        </a>
      <?php endif; ?>
    </div>
  </main>

  <?php include __DIR__ . '/../../footer.php'; ?>
  <script src="/js/app.js"></script>
</body>
</html>

