<?php
/**
 * Partial réutilisable : Bouton de retour unifié avec image et texte overlay
 *
 * @param string $href - URL de destination (ex: '#hero-guides', 'boutique.php#main')
 * @param string $ariaLabel - Label pour accessibilité (optionnel, défaut: 'Retour')
 * @param string $classes - Classes CSS additionnelles (optionnel)
 * @param string $btnImage - Classe d'image du bouton (optionnel, défaut: 'btn-aidejeux')
 *                          Options: btn-boutique, btn-aidejeux, btn-contact, etc.
 * @param string $textDesktop - Texte immersif desktop (optionnel, auto-détecté)
 * @param string $textMobile - Texte court mobile (optionnel, auto-détecté)
 */

$href = $href ?? '#';
$ariaLabel = $ariaLabel ?? __('common.back', 'Retour');
$classes = $classes ?? '';
$btnImage = $btnImage ?? 'btn-aidejeux';

// Textes par défaut selon le type de bouton
if (!isset($textDesktop) || !isset($textMobile)) {
  if ($btnImage === 'btn-aidejeux') {
    $textDesktop = $textDesktop ?? __('btnOverlay.gameHelp.desktop', 'Grimoire');
    $textMobile = $textMobile ?? __('btnOverlay.gameHelp.mobile', 'Grimoire');
  } elseif ($btnImage === 'btn-boutique') {
    $textDesktop = $textDesktop ?? __('btnOverlay.shop.desktop', 'L\'Échoppe');
    $textMobile = $textMobile ?? __('btnOverlay.shop.mobile', 'Échoppe');
  } else {
    $textDesktop = $textDesktop ?? __('common.back', 'Retour');
    $textMobile = $textMobile ?? __('common.back', 'Retour');
  }
}
?>

<div class="text-center mt-16">
  <a href="<?= htmlspecialchars($href) ?>"
     class="btn btn-primary <?= htmlspecialchars($btnImage) ?> <?= htmlspecialchars($classes) ?>"
     aria-label="<?= htmlspecialchars($ariaLabel) ?>"
     title="<?= htmlspecialchars($ariaLabel) ?>">
    <span class="btn-text-overlay">
      <span class="hidden md:inline"><?= htmlspecialchars($textDesktop) ?></span>
      <span class="md:hidden"><?= htmlspecialchars($textMobile) ?></span>
    </span>
  </a>
</div>
