<?php
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
  <?php
  ob_start();
  include 'snipcart-init.php';
  $snipcartInit = ob_get_clean();
  include 'header.php';
  echo $snipcartInit;
  ?>

  <main id="main" class="pt-32 flex items-center justify-center min-h-screen" style="background: var(--site-bg);">
    <div class="premium-card text-center max-w-xl p-10 animate-scale-in" style="border: 2px solid var(--site-accent);">
      <h1 class="premium-title text-4xl font-bold mb-4" style="color: var(--site-accent);" data-i18n="thankyou.title">Merci !</h1>
      <p class="premium-subtitle text-lg mb-6" data-i18n="thankyou.message">Votre demande a bien été transmise à notre équipe.</p>
      <a href="index.php" class="btn-premium inline-block font-bold px-6 py-3" data-i18n="thankyou.backHome">Retour à l'accueil</a>
    </div>
  </main>

  <?php include 'footer.php'; ?>
  <script src="/js/app.js"></script>
</body>
</html>
