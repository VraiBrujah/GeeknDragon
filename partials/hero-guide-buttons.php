<?php
/**
 * Boutons hero avec style carte arrondie et overlay de texte uniformisé
 * Réutilisable pour boutique.php et aide-jeux.php
 *
 * Variables attendues:
 * @var array $buttons - Tableau des boutons avec structure:
 *   [
 *     'href' => '#section',
 *     'image' => '/path/to/image.webp',
 *     'alt' => 'Alt text',
 *     'label' => 'Label',
 *     'labelKey' => 'translation.key',
 *     'borderColor' => 'amber-500' // Sans le 'border-'
 *   ]
 */

if (!isset($buttons) || empty($buttons)) {
    return;
}

$gridCols = count($buttons) === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4';
?>

<div class="grid grid-cols-1 <?= $gridCols ?> gap-4 mt-12 max-w-6xl mx-auto">
  <?php foreach ($buttons as $button):
    // Mapping des couleurs de bordure pour classes Tailwind complètes
    $borderClasses = [
      'amber-500' => 'border-amber-500/50 hover:border-amber-500 hover:shadow-amber-500/30',
      'blue-500' => 'border-blue-500/50 hover:border-blue-500 hover:shadow-blue-500/30',
      'purple-500' => 'border-purple-500/50 hover:border-purple-500 hover:shadow-purple-500/30',
      'red-500' => 'border-red-500/50 hover:border-red-500 hover:shadow-red-500/30'
    ];
    $borderClass = $borderClasses[$button['borderColor']] ?? 'border-gray-500/50 hover:border-gray-500';
  ?>
    <a href="<?= htmlspecialchars($button['href']) ?>"
       class="group relative overflow-hidden rounded-xl border-2 <?= $borderClass ?> transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <div class="aspect-square relative">
        <img src="<?= htmlspecialchars($button['image']) ?>"
             alt="<?= htmlspecialchars($button['alt']) ?>"
             class="w-full h-full object-cover">
        <!-- Overlay avec même style que les autres boutons du site -->
        <div style="position: absolute; bottom: 0; left: 0; right: 0; width: 100%; padding: 12px; background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.7) 60%, transparent 100%); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; min-height: 50px;">
          <span style="color: white; font-weight: 600; font-size: 1rem; text-align: center; line-height: 1.2; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);"
                <?php if (isset($button['labelKey'])): ?>data-i18n="<?= htmlspecialchars($button['labelKey']) ?>"<?php endif; ?>>
            <?= htmlspecialchars($button['label']) ?>
          </span>
        </div>
      </div>
    </a>
  <?php endforeach; ?>
</div>
