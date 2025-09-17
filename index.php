<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Geek&Dragon - Accessoires Immersifs pour Jeux de Rôle</title>
    <meta name="description" content="Découvrez notre collection exclusive de pièces métalliques, cartes d'équipement et triptyques pour transformer vos parties de D&D en aventures inoubliables.">
    <link rel="stylesheet" href="css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Uncial+Antiqua&family=MedievalSharp&display=swap" rel="stylesheet">
</head>
<body>
    <header class="header">
        <nav class="nav-container">
            <div class="logo">
                <a href="index.html">
                    <img src="images/brand-geekndragon-white.webp" alt="Geek&Dragon" class="logo-image">
                    <span class="logo-text">Geek&Dragon</span>
                </a>
            </div>
            <ul class="nav-menu">
                <li><a href="boutique.html" class="nav-link">Boutique</a></li>
                <li><a href="#catalogue" class="nav-link">Catalogue</a></li>
                <li><a href="#actualites" class="nav-link">Actualités</a></li>
                <li><a href="#about" class="nav-link">À Propos</a></li>
                <li><a href="#contact" class="nav-link">Contact</a></li>
            </ul>
            
            <!-- Widget Panier D&D -->
            <div class="nav-cart">
                <button id="gd-cart-toggle-widget" class="cart-toggle" aria-label="Ouvrir le sac d'aventurier">
                    <span class="cart-icon">🎒</span>
                    <span class="cart-text">Sac</span>
                    <span id="gd-cart-count-widget" class="cart-count">0</span>
                </button>
            </div>
            
            <div class="nav-toggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </nav>
    </header>

    <main>
        <section class="hero">
            <div class="hero-background">
                <div class="hero-videos" data-main="videos/video-mage-hero.mp4" data-videos='["videos/cascade_HD.mp4","videos/fontaine11.mp4","videos/Carte1.mp4","videos/fontaine4.mp4","videos/fontaine3.mp4","videos/fontaine2.mp4","videos/fontaine1.mp4"]'></div>
                <div class="hero-overlay"></div>
            </div>
            <div class="hero-content">
                <h1 class="hero-title animated-text"><strong>Transformez vos aventures en <span class="highlight">épopées légendaires</span></strong></h1>
                <p class="hero-subtitle"><strong>Découvrez notre collection d'accessoires immersifs pour vos parties de jeux de rôle : pièces métalliques authentiques, cartes d'équipement illustrées et triptyques mystères.</strong></p>
                <div class="hero-cta">
                    <a href="boutique.html" class="cta-primary">Découvrir la Boutique</a>
                    <a href="#catalogue" class="cta-secondary">Voir le Catalogue</a>
                </div>
            </div>
            <div class="hero-scroll-indicator">
                <div class="scroll-arrow"></div>
            </div>
        </section>


        <section id="boutique" class="boutique-section">
            <div class="container">
                <header class="section-header">
                    <h3 class="section-title">Boutique</h3>
                    <p class="section-subtitle">Paiement sécurisé via Snipcart</p>
                    <div class="payment-icons">
                        <img src="images/payments/visa.svg" alt="Logo Visa" loading="lazy">
                        <img src="images/payments/mastercard.svg" alt="Logo Mastercard" loading="lazy">
                        <img src="images/payments/american-express.svg" alt="Logo American Express" loading="lazy">
                    </div>
                </header>
                
                <!-- Grid de produits phares -->
                <div class="boutique-products-grid">
                    <a href="boutique.php#coins" class="product-highlight-link">
                        <div class="product-highlight">
                            <div class="product-image">
                                <img src="images/Piece/pro/coin-copper-10.png" alt="Pièces métalliques" loading="lazy">
                            </div>
                            <div class="product-info">
                                <h4>💰 Pièces Métalliques</h4>
                                <p class="product-count">4 collections disponibles</p>
                                <p class="product-desc">De l'Offrande du Voyageur (60$ CAD) à la Trésorerie du Seigneur (275$ CAD). Chaque pièce apporte le poids réel du trésor à votre table.</p>
                                <div class="product-features">
                                    <span class="feature-tag">✨ 5 métaux nobles</span>
                                    <span class="feature-tag">⚖️ Poids authentique</span>
                                    <span class="feature-tag">🔢 Multiplicateurs gravés</span>
                                </div>
                            </div>
                        </div>
                    </a>
                    
                    <a href="boutique.php#cards" class="product-highlight-link">
                        <div class="product-highlight">
                            <div class="product-image">
                                <img src="images/cartes-equipement.webp" alt="Cartes d'équipement" loading="lazy">
                            </div>
                            <div class="product-info">
                                <h4>🃏 Cartes d'Équipement</h4>
                                <p class="product-count">560 cartes illustrées</p>
                                <p class="product-desc">3 packs thématiques : Arsenal de l'Aventurier, Butins & Ingénieries, Routes & Services. Fini la recherche dans les manuels !</p>
                                <div class="product-features">
                                    <span class="feature-tag">🎨 Illustrations uniques</span>
                                    <span class="feature-tag">🇫🇷 Français/Anglais</span>
                                    <span class="feature-tag">⚡ Parties plus fluides</span>
                                </div>
                            </div>
                        </div>
                    </a>
                    
                    <a href="boutique.php#triptych" class="product-highlight-link">
                        <div class="product-highlight">
                            <div class="product-image">
                                <img src="images/triptyque-fiche.webp" alt="Triptyques Mystères" loading="lazy">
                            </div>
                            <div class="product-info">
                                <h4>📋 Triptyques Mystères</h4>
                                <p class="product-count">Héros prêt à jouer</p>
                                <p class="product-desc">3 triptyques tirés au sort + équipement + pièces de départ. Votre aventurier est immédiatement opérationnel !</p>
                                <div class="product-features">
                                    <span class="feature-tag">🎲 Surprise garantie</span>
                                    <span class="feature-tag">🛡️ Tout inclus</span>
                                    <span class="feature-tag">🚀 Prêt à jouer</span>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>
                
                <div class="boutique-cta">
                    <a href="boutique.php" class="cta-primary">Visiter la boutique</a>
                    <a href="#contact" class="cta-secondary">Demander un devis</a>
                </div>
            </div>
        </section>

        <section class="features" id="features">
            <div class="container">
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">⚔️</div>
                        <h3>Immersion Totale</h3>
                        <p>Des accessoires physiques qui transforment chaque partie en aventure mémorable</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🏆</div>
                        <h3>Qualité Premium</h3>
                        <p>Matériaux nobles et finitions soignées pour des produits durables</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🎲</div>
                        <h3>Compatible D&D 2024</h3>
                        <p>Tous nos produits sont conçus pour les règles officielles de Donjons & Dragons 2024</p>
                    </div>
                </div>
            </div>
        </section>


        <section class="testimonials">
            <div class="container">
                <header class="section-header">
                    <h2 class="section-title">Ce que disent nos aventuriers</h2>
                </header>
                <div class="testimonials-grid">
                    <div class="testimonial-card">
                        <div class="testimonial-content">
                            <p>"Ma grande découverte au FLIM, mes enfants sont tombés en amours avec les pièces et depuis font pleins de tâches pour pouvoir échanger leur point contre une chasse au trésor qui pourront avoir leur propre coffre au trésor. Merci à Mathieu pour offrir ce super ajout pour l'initiation des enfants aux jeux de rôles."</p>
                        </div>
                        <div class="testimonial-author">
                            <strong>Gabrielle</strong>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="news" id="actualites">
            <div class="container">
                <header class="section-header">
                    <h2 class="section-title">Actualité – FLIM 2025</h2>
                </header>
                <article class="news-item">
                    <img src="images/es-tu-game-demo.png" alt="One‑shot niveau 20 avec pièces" loading="lazy">
                    <h3>Des héros niveau 20, un raton trop tenace, et… nos pièces</h3>
                    <p>Notre première démonstration de pièces au FLIM 2025 a pris la forme d’un one-shot légendaire animé par Es‑tu Game ?.</p>
                    <div class="text-center">
                        <a href="actualites/es-tu-game.html" class="cta-primary">Lire l'article complet</a>
                    </div>
                </article>
                <article class="testimonial-card">
                    <img src="images/optimized-modern/webp/avisJoueurFlim2025.webp" alt="Avis joueurs sur pièces" loading="lazy">
                    <h4>« Finis les combats contre nos feuilles de personnage ! »</h4>
                    <p>De nombreux joueurs présents l'affirment : les pièces physiques changent tout.</p>
                    <p><strong>Fini les combats contre les feuilles de perso</strong>, les recherches interminables dans les livres pendant que les autres décrochent, ou les longues sessions 0 / 0.1 / 0.2 / 0.3... de création de personnages qui découragent avant même que le jeu commence. Avec Geek &amp; Dragon, tout commence quand la pièce tombe sur la table.</p>
                </article>
            </div>
        </section>

        <section id="about" class="about-section">
            <div class="container">
                <header class="section-header">
                    <h2 class="section-title">À Propos</h2>
                </header>
                <div class="about-content">
                    <img src="images/team-brujah.png" alt="Équipe Geek&Dragon" class="about-photo" loading="lazy">
                    <p>Geek&Dragon est né de la passion du jeu de rôle. Conçu au Québec, notre collectif crée des accessoires immersifs — pièces métalliques, cartes d'équipement et fiches triptyques — pour mettre l'aventure au cœur de la table.</p>
                </div>
            </div>
        </section>

        <section class="contact-section" id="contact">
            <div class="container">
                <header class="section-header">
                    <h2 class="section-title">Contact</h2>
                </header>
                <div class="contact-content">
                    <img src="images/team-brujah.png" alt="Brujah" class="contact-photo" loading="lazy">
                    <p><a href="mailto:contact@geekndragon.com">contact@geekndragon.com</a></p>
                    <p><a href="tel:+14387642612">+1&nbsp;438&nbsp;764‑2612</a></p>
                </div>
            </div>
        </section>

        <section class="cta-section">
            <div class="container">
                <div class="cta-content">
                    <h2>Prêt à vivre l'aventure ?</h2>
                    <p>Rejoignez des milliers d'aventuriers qui ont déjà transformé leurs parties avec nos accessoires immersifs.</p>
                    <a href="boutique.html" class="cta-primary large">Commencer mon Aventure</a>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer" id="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>Geek&Dragon</h3>
                    <p>Votre spécialiste en accessoires immersifs pour jeux de rôle depuis 2024.</p>
                </div>
                <div class="footer-section">
                    <h4>Navigation</h4>
                    <ul>
                        <li><a href="boutique.html">Boutique</a></li>
                        <li><a href="#catalogue">Catalogue</a></li>
                        <li><a href="#actualites">Actualités</a></li>
                        <li><a href="#about">À Propos</a></li>
                        <li><a href="#contact">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Support</h4>
                    <ul>
                        <li><a href="mailto:support@geekndragon.com">Support Client</a></li>
                        <li><a href="#">Livraison</a></li>
                        <li><a href="#">Retours</a></li>
                        <li><a href="#">FAQ</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 Geek&Dragon. Tous droits réservés.</p>
            </div>
        </div>
    </footer>

    <!-- Variables d'environnement pour Snipcart -->
    <script>
        window.SNIPCART_API_KEY = 'YmFhMjM0ZDEtM2VhNy00YTVlLWI0NGYtM2ZiOWI2Y2IzYmU1NjM4ODkxMjUzMDE3NzIzMjc1'; // À remplacer par votre vraie clé
    </script>
    
    <!-- Scripts existants -->
    <script src="js/script.js"></script>
    <script src="js/hero-videos.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js"></script>
    <script src="js/audio-player.js"></script>
    <script src="js/audio-player-override.js"></script>
    <script src="js/music-scanner-override.js"></script>
    <script src="js/audio-header-ui.js"></script>
    <!-- Map ESM bare imports used by modules (e.g., gsap) -->
    <script type="importmap">
    {
      "imports": {
        "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.13.0/index.js"
      }
    }
    </script>
    <script type="module" src="js/init-animations.js"></script>
    
    <!-- Intégration Snipcart avec thème D&D -->
    <script src="js/snipcart-products.js"></script>
    <script src="js/snipcart-integration.js"></script>
    
    <!-- Container Snipcart (hidden) -->
    <div id="snipcart" 
         data-api-key="YmFhMjM0ZDEtM2VhNy00YTVlLWI0NGYtM2ZiOWI2Y2IzYmU1NjM4ODkxMjUzMDE3NzIzMjc1"
         data-config-modal-style="side"
         data-config-add-product-behavior="none"
         data-templates-url="/templates/snipcart-templates.html"
         style="display: none;">
    </div>
</body>
</html>


