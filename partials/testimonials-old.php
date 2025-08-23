<?php
$testimonials = $testimonials ?? [
    [
        'quote' => '« Ces pièces ajoutent une immersion incroyable à nos parties de JDR. »',
        'author' => '— Rôliste TV',
    ],
];
?>
<section class="max-w-md mx-auto px-6 mt-12">
  <h2 class="text-2xl font-bold mb-4 text-center" data-i18n="testimonials.title">Témoignages</h2>
  <?php foreach ($testimonials as $t) : ?>
    <div class="card mb-4">
        <?php if (!empty($t['quote'])) : ?>
        <blockquote class="italic mb-2"><?= htmlspecialchars($t['quote'], ENT_QUOTES, 'UTF-8') ?></blockquote>
        <?php endif; ?>
        <?php if (!empty($t['author'])) : ?>
        <p class="text-sm text-gray-300"><?= htmlspecialchars($t['author'], ENT_QUOTES, 'UTF-8') ?></p>
        <?php endif; ?>
    </div>
  <?php endforeach; ?>
  <div class="card">
    <p class="mb-2">
      <span data-i18n="testimonials.moreReviews">Plus d'avis sur</span>
      <a
        href="https://www.trictrac.net/"
        class="underline"
        target="_blank"
        rel="noopener"
        data-i18n="testimonials.trictrac"
      >TricTrac</a>.
    </p>
  </div>
</section>
