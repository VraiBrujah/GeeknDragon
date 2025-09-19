<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/i18n.php';

/**
 * Détermine si le lecteur audio doit être injecté automatiquement.
 *
 * Les pages peuvent définir :
 * - $enableAudioPlayer = false pour désactiver explicitement le lecteur.
 * - $disableAudioPlayer = true pour conserver la compatibilité descendante.
 */
$shouldLoadAudioPlayer = true;

if (array_key_exists('enableAudioPlayer', $GLOBALS)) {
    $shouldLoadAudioPlayer = (bool) $GLOBALS['enableAudioPlayer'];
} elseif (array_key_exists('disableAudioPlayer', $GLOBALS)) {
    $shouldLoadAudioPlayer = !(bool) $GLOBALS['disableAudioPlayer'];
}

if (!function_exists('gdRenderAudioPlayerScripts')) {
    /**
     * Affiche les balises <script> nécessaires au lecteur audio global.
     */
    function gdRenderAudioPlayerScripts(): void
    {
        echo <<<'HTML'
    <!-- Lecteur audio partagé -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js"></script>
    <script src="/js/audio-player-engine.js"></script>
    <script src="/js/audio-player-scanner.js"></script>
    <script src="/js/audio-player-ui.js"></script>
    <script src="/js/audio-player.js"></script>
HTML;
    }
}

/**
 * Gère le rendu du pied de page.
 *
 * @var array<int, array<string, mixed>> $footerSections Sections contextuelles (titre, description, liens).
 * @var string|null $footerBottomText    Texte optionnel pour la ligne de bas de page.
 */

$normalizedSections = [];

if (isset($footerSections) && is_array($footerSections)) {
    foreach ($footerSections as $section) {
        if (!is_array($section)) {
            continue;
        }

        $title = isset($section['title']) ? trim((string) $section['title']) : '';
        $description = isset($section['description']) ? trim((string) $section['description']) : '';
        $links = [];

        if (isset($section['links']) && is_array($section['links'])) {
            foreach ($section['links'] as $link) {
                if (!is_array($link)) {
                    continue;
                }

                $label = isset($link['label']) ? trim((string) $link['label']) : '';
                $href = isset($link['href']) ? trim((string) $link['href']) : '';

                if ($label === '' || $href === '') {
                    continue;
                }

                $attributes = [];

                if (isset($link['attributes']) && is_array($link['attributes'])) {
                    foreach ($link['attributes'] as $attrKey => $attrValue) {
                        if (!is_string($attrKey)) {
                            continue;
                        }

                        $isSupported = $attrKey === 'target'
                            || $attrKey === 'rel'
                            || strncmp($attrKey, 'aria-', 5) === 0
                            || strncmp($attrKey, 'data-', 5) === 0;

                        if (!$isSupported) {
                            continue;
                        }

                        $attributes[$attrKey] = (string) $attrValue;
                    }
                }

                $links[] = [
                    'label' => $label,
                    'href' => $href,
                    'attributes' => $attributes,
                ];
            }
        }

        if ($title === '' && $description === '' && $links === []) {
            continue;
        }

        $normalizedSections[] = [
            'title' => $title,
            'description' => $description,
            'links' => $links,
        ];
    }
}

$hasSections = $normalizedSections !== [];

if (!$hasSections) {
    ?>
<footer class="bg-gray-800 py-6 text-center text-gray-400 txt-court">
  © <?= date('Y'); ?> Geek &amp; Dragon — <span data-i18n="footer.made">Conçu au Québec.</span>
</footer>

<?php
    if ($shouldLoadAudioPlayer) {
        gdRenderAudioPlayerScripts();
    }
    return;
}

$footerBottomText = isset($footerBottomText) ? trim((string) $footerBottomText) : '';

if ($footerBottomText === '') {
    $footerBottomText = sprintf('© %s Geek&Dragon. Tous droits réservés.', date('Y'));
}
?>
<footer class="footer" id="footer">
    <div class="container">
        <div class="footer-content">
            <?php foreach ($normalizedSections as $index => $section): ?>
                <?php
                $headingTag = 'h4';
                if ($index === 0) {
                    $headingTag = 'h3';
                }
                ?>
                <div class="footer-section">
                    <?php if ($section['title'] !== ''): ?>
                        <<?= $headingTag ?>><?= htmlspecialchars($section['title'], ENT_QUOTES, 'UTF-8'); ?></<?= $headingTag ?>>
                    <?php endif; ?>

                    <?php if ($section['description'] !== ''): ?>
                        <p><?= htmlspecialchars($section['description'], ENT_QUOTES, 'UTF-8'); ?></p>
                    <?php endif; ?>

                    <?php if ($section['links'] !== []): ?>
                        <ul>
                            <?php foreach ($section['links'] as $link): ?>
                                <?php
                                $attributes = '';
                                foreach ($link['attributes'] as $attrKey => $attrValue) {
                                    $attributes .= ' ' . htmlspecialchars($attrKey, ENT_QUOTES, 'UTF-8')
                                        . '="' . htmlspecialchars($attrValue, ENT_QUOTES, 'UTF-8') . '"';
                                }
                                ?>
                                <li><a href="<?= htmlspecialchars($link['href'], ENT_QUOTES, 'UTF-8'); ?>"<?= $attributes ?>><?= htmlspecialchars($link['label'], ENT_QUOTES, 'UTF-8'); ?></a></li>
                            <?php endforeach; ?>
                        </ul>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>
        <div class="footer-bottom">
            <p><?= htmlspecialchars($footerBottomText, ENT_QUOTES, 'UTF-8'); ?></p>
        </div>
    </div>
</footer>

<?php
if ($shouldLoadAudioPlayer) {
    gdRenderAudioPlayerScripts();
}
?>
