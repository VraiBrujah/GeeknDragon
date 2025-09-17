<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mon Compte | Geek&Dragon</title>
    <meta name="description" content="Gérez votre compte Geek&Dragon - Connexion, création de compte et gestion de vos favoris.">
    <link rel="stylesheet" href="css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
</head>
<body>
    <header class="header">
        <nav class="nav-container">
            <div class="logo">
                <a href="index.php">
                    <span class="logo-text">Geek&Dragon</span>
                </a>
            </div>
            <ul class="nav-menu">
                <li><a href="index.php" class="nav-link">Accueil</a></li>
                <li><a href="boutique.php" class="nav-link">Boutique</a></li>
                <li><a href="index.php#contact" class="nav-link">Contact</a></li>
                <li><a href="compte.php" class="nav-link account-link active" title="Mon compte">👤</a></li>
            </ul>
            <div class="nav-toggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </nav>
    </header>

    <main style="margin-top: 80px;">
        <section class="account-hero" style="background: var(--dark-bg); padding: 4rem 0;">
            <div class="container">
                <h1 style="color: var(--secondary-color); text-align: center; margin-bottom: 1rem;">👤 Mon Compte</h1>
                <p style="text-align: center; color: var(--medium-text); font-size: 1.1rem;">
                    Gérez votre compte et vos favoris
                </p>
            </div>
        </section>

        <section style="padding: 4rem 0; background: var(--darker-bg);">
            <div class="container">
                <div style="max-width: 600px; margin: 0 auto;">
                    
                    <!-- Message temporaire -->
                    <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); padding: 2rem; border-radius: var(--border-radius); text-align: center; margin-bottom: 3rem;">
                        <h2 style="color: var(--secondary-color); margin-bottom: 1rem;">🚧 Fonctionnalité en Développement</h2>
                        <p style="color: var(--light-text); line-height: 1.6; margin-bottom: 1.5rem;">
                            Le système de comptes utilisateur est actuellement en cours de développement. 
                            Cette page sera bientôt fonctionnelle avec :
                        </p>
                        <ul style="color: var(--medium-text); text-align: left; max-width: 400px; margin: 0 auto 2rem; line-height: 1.8;">
                            <li>Création et gestion de compte</li>
                            <li>Connexion sécurisée</li>
                            <li>Gestion des favoris</li>
                            <li>Historique des commandes</li>
                            <li>Profil utilisateur</li>
                        </ul>
                        <p style="color: var(--light-text); font-size: 0.9rem;">
                            En attendant, vous pouvez continuer à explorer notre boutique et passer des commandes via Snipcart.
                        </p>
                    </div>

                    <!-- Formulaire temporaire de contact pour être notifié -->
                    <div style="background: var(--dark-bg); padding: 2rem; border-radius: var(--border-radius); border: 1px solid var(--border-color);">
                        <h3 style="color: var(--secondary-color); margin-bottom: 1.5rem; text-align: center;">
                            📧 Être Notifié du Lancement
                        </h3>
                        <form style="display: flex; flex-direction: column; gap: 1rem;">
                            <input type="email" placeholder="Votre adresse email" required style="
                                padding: 1rem;
                                background: var(--darker-bg);
                                border: 1px solid var(--border-color);
                                border-radius: var(--border-radius);
                                color: var(--light-text);
                                font-size: 1rem;
                            ">
                            <button type="submit" onclick="alert('Merci ! Nous vous notifierons dès que les comptes seront disponibles.'); return false;" style="
                                background: var(--secondary-color);
                                color: var(--dark-bg);
                                padding: 1rem 2rem;
                                border: none;
                                border-radius: var(--border-radius);
                                font-weight: 600;
                                cursor: pointer;
                                transition: var(--transition);
                            ">
                                Me Notifier
                            </button>
                        </form>
                    </div>

                    <!-- Liens utiles -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 3rem;">
                        <a href="boutique.php" style="
                            display: block;
                            background: var(--dark-bg);
                            padding: 1.5rem;
                            border-radius: var(--border-radius);
                            border: 1px solid var(--border-color);
                            text-decoration: none;
                            text-align: center;
                            transition: var(--transition);
                        " onmouseover="this.style.borderColor='var(--secondary-color)'" onmouseout="this.style.borderColor='var(--border-color)'">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🛒</div>
                            <h4 style="color: var(--secondary-color); margin-bottom: 0.5rem;">Boutique</h4>
                            <p style="color: var(--medium-text); font-size: 0.9rem;">Découvrir nos produits</p>
                        </a>

                        <a href="retours.php" style="
                            display: block;
                            background: var(--dark-bg);
                            padding: 1.5rem;
                            border-radius: var(--border-radius);
                            border: 1px solid var(--border-color);
                            text-decoration: none;
                            text-align: center;
                            transition: var(--transition);
                        " onmouseover="this.style.borderColor='var(--secondary-color)'" onmouseout="this.style.borderColor='var(--border-color)'">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">↩️</div>
                            <h4 style="color: var(--secondary-color); margin-bottom: 0.5rem;">Retours</h4>
                            <p style="color: var(--medium-text); font-size: 0.9rem;">Politique de retours</p>
                        </a>

                        <a href="mailto:support@geekndragon.com" style="
                            display: block;
                            background: var(--dark-bg);
                            padding: 1.5rem;
                            border-radius: var(--border-radius);
                            border: 1px solid var(--border-color);
                            text-decoration: none;
                            text-align: center;
                            transition: var(--transition);
                        " onmouseover="this.style.borderColor='var(--secondary-color)'" onmouseout="this.style.borderColor='var(--border-color)'">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📞</div>
                            <h4 style="color: var(--secondary-color); margin-bottom: 0.5rem;">Support</h4>
                            <p style="color: var(--medium-text); font-size: 0.9rem;">Nous contacter</p>
                        </a>
                    </div>

                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>Geek&Dragon</h3>
                    <p>Votre spécialiste en accessoires immersifs pour jeux de rôle depuis 2024.</p>
                </div>
                <div class="footer-section">
                    <h4>Boutique</h4>
                    <ul>
                        <li><a href="boutique.php#coins">Pièces Métalliques</a></li>
                        <li><a href="boutique.php#cards">Cartes d'Équipement</a></li>
                        <li><a href="boutique.php#triptych">Triptyques Mystères</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Support</h4>
                    <ul>
                        <li><a href="mailto:support@geekndragon.com">Support Client</a></li>
                        <li><a href="retours.php">Retours</a></li>
                        <li><a href="#">Livraison</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 Geek&Dragon. Tous droits réservés.</p>
            </div>
        </div>
    </footer>

    <script src="js/script.js"></script>
</body>
</html>