<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$translator = require __DIR__ . '/i18n.php';
$lang = $translator->getCurrentLanguage();

if (!function_exists('gdLocalAssetVersion')) {
    /**
     * Retourne le timestamp de dernière modification pour versionner les assets.
     */
    function gdLocalAssetVersion(string $relativePath): string
    {
        $absolute = __DIR__ . '/' . ltrim($relativePath, '/');
        return is_file($absolute) ? (string) filemtime($absolute) : '0';
    }
}

$title = __('meta.returns.title', 'Politique de retours | Geek & Dragon');
$metaDescription = __('meta.returns.desc', 'Politique de retours Geek & Dragon - 30 jours pour retourner vos produits.');
$active = 'contact';
$styleVersion = gdLocalAssetVersion('css/style.css');
$extraHead = <<<HTML
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css?v={$styleVersion}">
HTML;
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang, ENT_QUOTES, 'UTF-8'); ?>">
<?php include __DIR__ . '/head-common.php'; ?>
<body>
<?php include __DIR__ . '/header.php'; ?>

    <main id="main" class="pt-32">
        <section class="policy-hero" style="background: var(--dark-bg); padding: 4rem 0;">
            <div class="container">
                <h1 style="color: var(--secondary-color); text-align: center; margin-bottom: 1rem;">Politique de Retours</h1>
                <p style="text-align: center; color: var(--medium-text); font-size: 1.1rem;">
                    Votre satisfaction est notre priorité. Découvrez nos conditions de retour.
                </p>
            </div>
        </section>

        <section style="padding: 4rem 0; background: var(--darker-bg);">
            <div class="container">
                <div style="max-width: 800px; margin: 0 auto;">
                    
                    <div class="policy-section" style="background: var(--dark-bg); padding: 2rem; border-radius: var(--border-radius); margin-bottom: 2rem; border: 1px solid var(--border-color);">
                        <h2 style="color: var(--secondary-color); margin-bottom: 1.5rem;">📅 Délai de Retour</h2>
                        <p style="color: var(--light-text); line-height: 1.6; margin-bottom: 1rem;">
                            Vous disposez de <strong>30 jours</strong> à compter de la réception de votre commande pour effectuer un retour.
                        </p>
                        <p style="color: var(--medium-text); font-size: 0.9rem;">
                            Le délai est calculé à partir de la date de livraison confirmée par le transporteur.
                        </p>
                    </div>

                    <div class="policy-section" style="background: var(--dark-bg); padding: 2rem; border-radius: var(--border-radius); margin-bottom: 2rem; border: 1px solid var(--border-color);">
                        <h2 style="color: var(--secondary-color); margin-bottom: 1.5rem;">✅ Conditions de Retour</h2>
                        <ul style="color: var(--light-text); line-height: 1.8; padding-left: 1.5rem;">
                            <li>Les produits doivent être dans leur <strong>état d'origine</strong></li>
                            <li>Emballage d'origine <strong>non endommagé</strong></li>
                            <li>Accessoires et documentation <strong>complets</strong></li>
                            <li>Aucune trace d'utilisation excessive</li>
                            <li>Étiquettes et autocollants <strong>non retirés</strong></li>
                        </ul>
                    </div>

                    <div class="policy-section" style="background: var(--dark-bg); padding: 2rem; border-radius: var(--border-radius); margin-bottom: 2rem; border: 1px solid var(--border-color);">
                        <h2 style="color: var(--secondary-color); margin-bottom: 1.5rem;">📦 Procédure de Retour</h2>
                        <ol style="color: var(--light-text); line-height: 1.8; padding-left: 1.5rem;">
                            <li><strong>Contactez-nous</strong> à <a href="mailto:support@geekndragon.com" style="color: var(--secondary-color);">support@geekndragon.com</a></li>
                            <li>Indiquez votre <strong>numéro de commande</strong> et le motif du retour</li>
                            <li>Nous vous fournirons une <strong>étiquette de retour prépayée</strong></li>
                            <li>Emballez soigneusement les produits</li>
                            <li>Expédiez avec l'étiquette fournie</li>
                        </ol>
                    </div>

                    <div class="policy-section" style="background: var(--dark-bg); padding: 2rem; border-radius: var(--border-radius); margin-bottom: 2rem; border: 1px solid var(--border-color);">
                        <h2 style="color: var(--secondary-color); margin-bottom: 1.5rem;">💰 Remboursement</h2>
                        <p style="color: var(--light-text); line-height: 1.6; margin-bottom: 1rem;">
                            Le remboursement sera effectué dans un délai de <strong>5 à 10 jours ouvrables</strong> après réception et vérification des produits.
                        </p>
                        <p style="color: var(--medium-text); font-size: 0.9rem;">
                            Le remboursement s'effectue sur le même moyen de paiement utilisé lors de l'achat.
                        </p>
                    </div>

                    <div class="policy-section" style="background: var(--dark-bg); padding: 2rem; border-radius: var(--border-radius); margin-bottom: 2rem; border: 1px solid var(--border-color);">
                        <h2 style="color: var(--secondary-color); margin-bottom: 1.5rem;">❌ Exclusions</h2>
                        <p style="color: var(--light-text); line-height: 1.6; margin-bottom: 1rem;">
                            Certains produits ne peuvent être retournés :
                        </p>
                        <ul style="color: var(--medium-text); line-height: 1.6; padding-left: 1.5rem;">
                            <li>Produits personnalisés ou gravés sur demande</li>
                            <li>Produits endommagés par l'utilisateur</li>
                            <li>Produits sans emballage d'origine</li>
                        </ul>
                    </div>

                    <div class="contact-section" style="background: rgba(212, 175, 55, 0.1); padding: 2rem; border-radius: var(--border-radius); border: 1px solid rgba(212, 175, 55, 0.3); text-align: center;">
                        <h3 style="color: var(--secondary-color); margin-bottom: 1rem;">📞 Besoin d'Aide ?</h3>
                        <p style="color: var(--light-text); margin-bottom: 1.5rem;">
                            Notre équipe est là pour vous accompagner dans votre démarche de retour.
                        </p>
                        <a href="mailto:support@geekndragon.com" style="display: inline-block; background: var(--secondary-color); color: var(--dark-bg); padding: 1rem 2rem; border-radius: var(--border-radius); text-decoration: none; font-weight: 600; transition: var(--transition);">
                            Contacter le Support
                        </a>
                    </div>

                </div>
            </div>
        </section>
    </main>

<?php
$footerSections = [
    [
        'title' => 'Geek&Dragon',
        'description' => 'Votre spécialiste en accessoires immersifs pour jeux de rôle depuis 2024.',
    ],
    [
        'title' => 'Boutique',
        'links' => [
            ['label' => 'Pièces Métalliques', 'href' => langUrl('/boutique.php#coins')],
            ['label' => "Cartes d'Équipement", 'href' => langUrl('/boutique.php#cards')],
            ['label' => 'Triptyques Mystères', 'href' => langUrl('/boutique.php#triptych')],
        ],
    ],
    [
        'title' => 'Support',
        'links' => [
            ['label' => 'Support Client', 'href' => 'mailto:support@geekndragon.com'],
            ['label' => 'Retours', 'href' => langUrl('/retours.php')],
            ['label' => 'Livraison', 'href' => '#'],
        ],
    ],
];
include __DIR__ . '/footer.php';
?>

    <script src="/js/app.js"></script>
    <script src="/js/script.js"></script>
</body>
</html>
