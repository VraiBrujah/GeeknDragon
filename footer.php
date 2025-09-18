<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/i18n.php';

/**
 * Pied de page minimaliste commun.
 */
?>
<footer class="bg-gray-800 py-6 text-center text-gray-400 txt-court">
  © <?= date('Y'); ?> Geek &amp; Dragon — <span data-i18n="footer.made">Conçu au Québec.</span>
</footer>
