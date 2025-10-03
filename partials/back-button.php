<?php
/**
 * Partial réutilisable : Bouton de retour unifié avec image
 *
 * @param string $href - URL de destination (ex: '#menu-guides', 'boutique.php')
 * @param string $ariaLabel - Label pour accessibilité (optionnel, défaut: 'Retour')
 * @param string $classes - Classes CSS additionnelles (optionnel)
 */

$href = $href ?? '#';
$ariaLabel = $ariaLabel ?? __('common.back', 'Retour');
$classes = $classes ?? '';
?>

<div class="text-center mt-16">
  <a href="<?= htmlspecialchars($href) ?>"
     class="btn btn-primary btn-aidejeux <?= htmlspecialchars($classes) ?>"
     aria-label="<?= htmlspecialchars($ariaLabel) ?>"
     title="<?= htmlspecialchars($ariaLabel) ?>">
    <span class="sr-only"><?= htmlspecialchars($ariaLabel) ?></span>
  </a>
</div>
