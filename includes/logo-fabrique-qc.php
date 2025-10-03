<?php
/**
 * Composant réutilisable : Logo "Fabriqué au Québec"
 *
 * Affiche le logo avec un style cohérent dans une section de bas de page.
 * Peut être inclus dans n'importe quelle page PHP.
 *
 * @param string $containerClass Classes CSS additionnelles pour le conteneur (optionnel)
 * @param bool $withBorder Afficher une bordure supérieure (défaut: true)
 */

$containerClass = $containerClass ?? '';
$withBorder = $withBorder ?? true;
$borderClass = $withBorder ? 'border-t border-gray-700 pt-8' : '';
?>

<!-- Logo Fabriqué au Québec -->
<div class="text-center <?= $borderClass ?> <?= $containerClass ?>">
  <div class="inline-flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
    <img src="/media/branding/logos/logo_fabrique_qc.png" alt="Fabriqué au Québec" class="h-auto" loading="lazy" title="Fabriqué au Québec">
  </div>
</div>
