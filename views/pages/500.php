<?php
declare(strict_types=1);
/** @var Throwable $exception */
/** @var bool $isDev */
?>
<h1>Erreur serveur</h1>
<?php if ($isDev ?? false): ?>
<pre><?= htmlspecialchars($exception->getMessage()) ?></pre>
<pre><?= htmlspecialchars($exception->getTraceAsString()) ?></pre>
<?php else: ?>
<p>Une erreur est survenue. Veuillez réessayer plus tard.</p>
<?php endif; ?>
