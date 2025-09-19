<?php

use GeeknDragon\View\ViewHelper;

/**
 * Affiche une section de témoignages configurable.
 *
 * Paramètres attendus dans $viewData :
 * - 'variant' (string) : "home" pour la mise en page de la page d'accueil ou "compact" (par défaut).
 * - 'titleKey' (string) : clé de traduction pour le titre de la section.
 * - 'title' (string) : texte à afficher pour le titre (facultatif, sinon dérivé de la clé).
 * - 'titleFallback' (string) : texte de secours si la traduction est absente.
 * - 'classes' (array<string, string>) : permet de surcharger les classes CSS (section, container, header,
 *   title, grid, card, contentWrapper, content, authorWrapper, author, itemTitle).
 * - 'wrapContainer' (bool) : force l'affichage du conteneur intermédiaire.
 * - 'sectionAttributes' (array<string, scalar|bool|null>) : attributs HTML supplémentaires pour la balise section
 *   (hors classe pour éviter les collisions).
 * - 'testimonials' (array<array<string, mixed>>) : liste des témoignages. Chaque entrée accepte :
 *   • 'text' ou 'content' (string) : texte du témoignage ;
 *   • 'textKey' ou 'contentKey' (string) : clé de traduction du texte ;
 *   • 'textFallback' ou 'contentFallback' (string) : valeur de repli pour le texte ;
 *   • 'textHtml' ou 'contentHtml' (bool) : indique si le texte est déjà formaté en HTML ;
 *   • 'author' (string), 'authorKey' (string), 'authorFallback' (string), 'authorHtml' (bool) ;
 *   • 'title' (string), 'titleKey' (string), 'titleFallback' (string), 'titleHtml' (bool).
 */

/** @var ViewHelper|null $helper */
$viewHelper = isset($helper) && $helper instanceof ViewHelper ? $helper : null;
$data = isset($viewData) && is_array($viewData) ? $viewData : [];

$escape = static function (?string $value) use ($viewHelper): string {
    $value = $value ?? '';

    if ($viewHelper instanceof ViewHelper) {
        return $viewHelper->escape($value);
    }

    return htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
};

$dataI18nAttr = static function (?string $key) use ($viewHelper, $escape): string {
    if ($key === null || $key === '') {
        return '';
    }

    if ($viewHelper instanceof ViewHelper) {
        return $viewHelper->dataI18n($key);
    }

    return 'data-i18n="' . $escape($key) . '"';
};

$translate = static function (?string $key, ?string $fallback = ''): string {
    if ($key === null || $key === '') {
        return $fallback ?? '';
    }

    if (function_exists('__')) {
        return __($key, $fallback ?? '');
    }

    return $fallback ?? '';
};

$variant = isset($data['variant']) && is_string($data['variant']) && $data['variant'] !== ''
    ? $data['variant']
    : 'compact';

$defaultClassMap = [
    'compact' => [
        'section' => 'max-w-md mx-auto px-6 mt-12',
        'container' => '',
        'header' => '',
        'title' => 'text-2xl font-bold mb-4 text-center',
        'grid' => '',
        'card' => 'bg-gray-800 p-6 rounded-xl shadow-lg',
        'contentWrapper' => '',
        'content' => 'text-lg leading-relaxed text-gray-200',
        'authorWrapper' => 'mt-4 text-right text-gray-200',
        'author' => '',
        'itemTitle' => '',
    ],
    'home' => [
        'section' => 'testimonials',
        'container' => 'container',
        'header' => 'section-header',
        'title' => 'section-title',
        'grid' => 'testimonials-grid',
        'card' => 'testimonial-card',
        'contentWrapper' => 'testimonial-content',
        'content' => '',
        'authorWrapper' => 'testimonial-author',
        'author' => '',
        'itemTitle' => 'testimonial-title',
    ],
];

$classOverrides = [];
if (isset($data['classes']) && is_array($data['classes'])) {
    foreach ($data['classes'] as $key => $value) {
        if (is_string($key) && is_string($value)) {
            $classOverrides[$key] = trim($value);
        }
    }
}

$classMap = $defaultClassMap[$variant] ?? $defaultClassMap['compact'];
$classMap = array_merge($classMap, $classOverrides);

$sectionAttributes = '';
if (!empty($data['sectionAttributes']) && is_array($data['sectionAttributes'])) {
    foreach ($data['sectionAttributes'] as $attribute => $value) {
        if (!is_string($attribute) || $attribute === '' || strtolower($attribute) === 'class') {
            continue;
        }

        if (is_bool($value)) {
            if ($value) {
                $sectionAttributes .= ' ' . $attribute;
            }
            continue;
        }

        if ($value === null) {
            continue;
        }

        $sectionAttributes .= ' ' . $attribute . '="' . $escape((string) $value) . '"';
    }
}

$sectionClassName = isset($classMap['section']) ? trim((string) $classMap['section']) : '';
$sectionClassAttr = $sectionClassName === '' ? '' : ' class="' . $escape($sectionClassName) . '"';

$containerClassName = isset($classMap['container']) ? trim((string) $classMap['container']) : '';
$containerClassAttr = $containerClassName === '' ? '' : ' class="' . $escape($containerClassName) . '"';
$wrapContainer = isset($data['wrapContainer'])
    ? (bool) $data['wrapContainer']
    : ($variant === 'home' || $containerClassName !== '');

$headerClassName = isset($classMap['header']) ? trim((string) $classMap['header']) : '';
$headerClassAttr = $headerClassName === '' ? '' : ' class="' . $escape($headerClassName) . '"';

$titleClassName = isset($classMap['title']) ? trim((string) $classMap['title']) : '';
$titleClassAttr = $titleClassName === '' ? '' : ' class="' . $escape($titleClassName) . '"';

$gridClassName = isset($classMap['grid']) ? trim((string) $classMap['grid']) : '';
$gridClassAttr = $gridClassName === '' ? '' : ' class="' . $escape($gridClassName) . '"';

$cardClassName = isset($classMap['card']) ? trim((string) $classMap['card']) : '';
$cardClassAttr = $cardClassName === '' ? '' : ' class="' . $escape($cardClassName) . '"';

$contentWrapperClassName = isset($classMap['contentWrapper']) ? trim((string) $classMap['contentWrapper']) : '';
$contentWrapperClassAttr = $contentWrapperClassName === '' ? '' : ' class="' . $escape($contentWrapperClassName) . '"';

$contentClassName = isset($classMap['content']) ? trim((string) $classMap['content']) : '';
$contentClassAttr = $contentClassName === '' ? '' : ' class="' . $escape($contentClassName) . '"';

$authorWrapperClassName = isset($classMap['authorWrapper']) ? trim((string) $classMap['authorWrapper']) : '';
$authorWrapperClassAttr = $authorWrapperClassName === '' ? '' : ' class="' . $escape($authorWrapperClassName) . '"';

$authorClassName = isset($classMap['author']) ? trim((string) $classMap['author']) : '';
$authorClassAttr = $authorClassName === '' ? '' : ' class="' . $escape($authorClassName) . '"';

$itemTitleClassName = isset($classMap['itemTitle']) ? trim((string) $classMap['itemTitle']) : '';
$itemTitleClassAttr = $itemTitleClassName === '' ? '' : ' class="' . $escape($itemTitleClassName) . '"';

$defaultTitleKey = $variant === 'home' ? 'home.testimonials.title' : 'testimonials.title';
$titleKey = isset($data['titleKey']) && is_string($data['titleKey']) && $data['titleKey'] !== ''
    ? $data['titleKey']
    : $defaultTitleKey;
$titleFallback = isset($data['titleFallback']) && is_string($data['titleFallback']) ? $data['titleFallback'] : null;
$sectionTitle = isset($data['title']) && is_string($data['title'])
    ? $data['title']
    : $translate($titleKey, $titleFallback);

$testimonialsInput = [];
if (isset($data['testimonials']) && is_array($data['testimonials'])) {
    $testimonialsInput = $data['testimonials'];
}

if ($testimonialsInput === []) {
    $testimonialsInput = [
        [
            'textKey' => 'testimonials.quote2.text',
            'authorKey' => 'testimonials.quote2.author',
        ],
    ];
}

$normalizedTestimonials = [];
foreach ($testimonialsInput as $entry) {
    if (!is_array($entry)) {
        continue;
    }

    $textKey = null;
    if (isset($entry['textKey']) && is_string($entry['textKey']) && $entry['textKey'] !== '') {
        $textKey = $entry['textKey'];
    } elseif (isset($entry['contentKey']) && is_string($entry['contentKey']) && $entry['contentKey'] !== '') {
        $textKey = $entry['contentKey'];
    }

    $textFallback = null;
    if (isset($entry['textFallback']) && is_string($entry['textFallback'])) {
        $textFallback = $entry['textFallback'];
    } elseif (isset($entry['contentFallback']) && is_string($entry['contentFallback'])) {
        $textFallback = $entry['contentFallback'];
    }

    if (isset($entry['text']) && is_string($entry['text'])) {
        $text = $entry['text'];
    } elseif (isset($entry['content']) && is_string($entry['content'])) {
        $text = $entry['content'];
    } else {
        $text = $translate($textKey, $textFallback);
    }

    $textHtml = !empty($entry['textHtml']) || !empty($entry['contentHtml']);

    $itemTitleKey = isset($entry['titleKey']) && is_string($entry['titleKey']) && $entry['titleKey'] !== ''
        ? $entry['titleKey']
        : null;
    $itemTitleFallback = isset($entry['titleFallback']) && is_string($entry['titleFallback'])
        ? $entry['titleFallback']
        : null;
    $itemTitle = isset($entry['title']) && is_string($entry['title'])
        ? $entry['title']
        : $translate($itemTitleKey, $itemTitleFallback);
    $itemTitleHtml = !empty($entry['titleHtml']);

    $authorKey = isset($entry['authorKey']) && is_string($entry['authorKey']) && $entry['authorKey'] !== ''
        ? $entry['authorKey']
        : null;
    $authorFallback = isset($entry['authorFallback']) && is_string($entry['authorFallback'])
        ? $entry['authorFallback']
        : null;
    $author = isset($entry['author']) && is_string($entry['author'])
        ? $entry['author']
        : $translate($authorKey, $authorFallback);
    $authorHtml = !empty($entry['authorHtml']);

    if ($text === '' && $itemTitle === '' && $author === '') {
        continue;
    }

    $normalizedTestimonials[] = [
        'text' => $text,
        'textKey' => $textKey,
        'textHtml' => $textHtml,
        'title' => $itemTitle,
        'titleKey' => $itemTitleKey,
        'titleHtml' => $itemTitleHtml,
        'author' => $author,
        'authorKey' => $authorKey,
        'authorHtml' => $authorHtml,
    ];
}

if ($normalizedTestimonials === []) {
    return;
}

$titleDataAttr = $titleKey !== null ? $dataI18nAttr($titleKey) : '';

if ($variant === 'home') {
    ?>
<section<?= $sectionClassAttr ?><?= $sectionAttributes ?>>
    <?php if ($wrapContainer) { ?>
    <div<?= $containerClassAttr ?>>
    <?php }
        if ($sectionTitle !== '') { ?>
        <header<?= $headerClassAttr ?>>
            <h2<?= $titleClassAttr ?><?= $titleDataAttr !== '' ? ' ' . $titleDataAttr : '' ?>><?= $escape($sectionTitle) ?></h2>
        </header>
    <?php }
        ?>
        <div<?= $gridClassAttr ?>>
            <?php foreach ($normalizedTestimonials as $testimonial) {
                $itemTitleDataAttr = $testimonial['titleKey'] !== null ? $dataI18nAttr($testimonial['titleKey']) : '';
                $textDataAttr = $testimonial['textKey'] !== null ? $dataI18nAttr($testimonial['textKey']) : '';
                $authorDataAttr = $testimonial['authorKey'] !== null ? $dataI18nAttr($testimonial['authorKey']) : '';
                ?>
            <div<?= $cardClassAttr ?>>
                <?php if ($testimonial['title'] !== '') { ?>
                <h3<?= $itemTitleClassAttr ?><?= $itemTitleDataAttr !== '' ? ' ' . $itemTitleDataAttr : '' ?>>
                    <?= $testimonial['titleHtml'] ? $testimonial['title'] : $escape($testimonial['title']) ?>
                </h3>
                <?php } ?>
                <div<?= $contentWrapperClassAttr ?>>
                    <p<?= $contentClassAttr ?><?= $textDataAttr !== '' ? ' ' . $textDataAttr : '' ?>>
                        <?= $testimonial['textHtml'] ? $testimonial['text'] : $escape($testimonial['text']) ?>
                    </p>
                </div>
                <?php if ($testimonial['author'] !== '') { ?>
                <div<?= $authorWrapperClassAttr ?>>
                    <strong<?= $authorClassAttr ?><?= $authorDataAttr !== '' ? ' ' . $authorDataAttr : '' ?>>
                        <?= $testimonial['authorHtml'] ? $testimonial['author'] : $escape($testimonial['author']) ?>
                    </strong>
                </div>
                <?php } ?>
            </div>
            <?php } ?>
        </div>
    <?php if ($wrapContainer) { ?>
    </div>
    <?php } ?>
</section>
<?php
    return;
}

?>
<section<?= $sectionClassAttr ?><?= $sectionAttributes ?>>
    <?php if ($sectionTitle !== '') { ?>
    <h2<?= $titleClassAttr ?><?= $titleDataAttr !== '' ? ' ' . $titleDataAttr : '' ?>><?= $escape($sectionTitle) ?></h2>
    <?php }
    foreach ($normalizedTestimonials as $testimonial) {
        $itemTitleDataAttr = $testimonial['titleKey'] !== null ? $dataI18nAttr($testimonial['titleKey']) : '';
        $textDataAttr = $testimonial['textKey'] !== null ? $dataI18nAttr($testimonial['textKey']) : '';
        $authorDataAttr = $testimonial['authorKey'] !== null ? $dataI18nAttr($testimonial['authorKey']) : '';
        ?>
    <article<?= $cardClassAttr ?>>
        <?php if ($testimonial['title'] !== '') { ?>
        <h3<?= $itemTitleClassAttr ?><?= $itemTitleDataAttr !== '' ? ' ' . $itemTitleDataAttr : '' ?>>
            <?= $testimonial['titleHtml'] ? $testimonial['title'] : $escape($testimonial['title']) ?>
        </h3>
        <?php } ?>
        <p<?= $contentClassAttr ?><?= $textDataAttr !== '' ? ' ' . $textDataAttr : '' ?>>
            <?= $testimonial['textHtml'] ? $testimonial['text'] : $escape($testimonial['text']) ?>
        </p>
        <?php if ($testimonial['author'] !== '') { ?>
        <p<?= $authorWrapperClassAttr ?><?= $authorDataAttr !== '' ? ' ' . $authorDataAttr : '' ?>>
            <?= $testimonial['authorHtml'] ? $testimonial['author'] : $escape($testimonial['author']) ?>
        </p>
        <?php } ?>
    </article>
    <?php } ?>
</section>
