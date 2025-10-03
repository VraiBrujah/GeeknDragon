<?php
/**
 * Partial réutilisable : Bouton de retour unifié avec image
 *
 * @param string $href - URL de destination (ex: '#hero-guides', 'boutique.php#main')
 * @param string $ariaLabel - Label pour accessibilité (optionnel, défaut: 'Retour')
 * @param string $classes - Classes CSS additionnelles (optionnel)
 * @param string $btnImage - Classe d'image du bouton (optionnel, défaut: 'btn-aidejeux')
 *                          Options: btn-boutique, btn-aidejeux, btn-contact, etc.
 */

$href = $href ?? '#';
$ariaLabel = $ariaLabel ?? __('common.back', 'Retour');
$classes = $classes ?? '';
$btnImage = $btnImage ?? 'btn-aidejeux';
?>

<div class="text-center mt-16">
  <a href="<?= htmlspecialchars($href) ?>"
     class="btn btn-primary <?= htmlspecialchars($btnImage) ?> <?= htmlspecialchars($classes) ?>"
     aria-label="<?= htmlspecialchars($ariaLabel) ?>"
     title="<?= htmlspecialchars($ariaLabel) ?>">
    <span class="sr-only"><?= htmlspecialchars($ariaLabel) ?></span>
  </a>
</div>
