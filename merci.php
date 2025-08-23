<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';
$config = require __DIR__ . '/config.php';
$active = 'contact';
require __DIR__ . '/i18n.php';
$title = $translations['meta']['thankyou']['title'] ?? 'Geek & Dragon';
$metaDescription = $translations['meta']['thankyou']['desc'] ?? '';
$extraHead = '';
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang) ?>">
<?php include 'head-common.php'; ?>
<body>
  <?php include 'header.php'; ?>

  <main id="main" class="pt-32 flex items-center justify-center min-h-screen">
    <div class="text-center max-w-xl bg-gray-900/70 backdrop-blur p-10 rounded-3xl border border-yellow-500 shadow-2xl">
      <h1 class="text-4xl font-bold mb-4 text-yellow-400" data-i18n="thankyou.title">Merci !</h1>
      <p class="text-lg mb-6 txt-court" data-i18n="thankyou.message">Votre demande a bien été transmise à notre équipe.</p>
      <a href="index.php" class="inline-block bg-yellow-600 hover:bg-yellow-500 text-white font-bold px-6 py-3 rounded-full transition" data-i18n="thankyou.backHome">Retour à l'accueil</a>
    </div>
  </main>

  <?php include 'footer.php'; ?>
  <script src="/js/app.js"></script>
</body>
</html>
