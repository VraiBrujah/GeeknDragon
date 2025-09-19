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
                    
                    <!-- Zone de contenu principal -->
                    <div id="account-content">
                        <!-- Contenu chargé dynamiquement -->
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
                            <p style="color: var(--medium-text); font-size: 0.9rem;">Retours 30 jours – satisfait ou remboursé</p>
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
    <script>
        /**
         * Gestion de la page compte utilisateur
         */
        class AccountPage {
            constructor() {
                this.contentContainer = document.getElementById('account-content');
                this.user = null;
                
                this.init();
            }

            async init() {
                // Vérifier l'authentification
                const isAuthenticated = await this.checkAuthentication();
                
                if (isAuthenticated) {
                    this.renderUserDashboard();
                } else {
                    this.renderLoginPrompt();
                }
            }

            async checkAuthentication() {
                // Vérifier la session locale
                const userSession = localStorage.getItem('user_session');
                if (userSession) {
                    try {
                        const session = JSON.parse(userSession);
                        if (session.expires > Date.now()) {
                            this.user = session.user;
                            return true;
                        } else {
                            localStorage.removeItem('user_session');
                        }
                    } catch (e) {
                        localStorage.removeItem('user_session');
                    }
                }

                // Vérifier la session serveur unifiée (API moderne)
                try {
                    const response = await fetch('/api/account/session-check');
                    const result = await response.json();
                    
                    if (result.success && result.authenticated) {
                        if (result.user_type === 'local' && result.user) {
                            this.user = result.user;
                            return true;
                        } else if (result.user_type === 'snipcart' && result.customer) {
                            // Convertir le format Snipcart en format local pour compatibilité
                            this.user = {
                                nom_aventurier: result.customer.firstName + ' ' + result.customer.lastName,
                                email: result.customer.email,
                                espece: 'Humain', // Valeur par défaut
                                classe: 'Aventurier',
                                historique: 'Nouveau client',
                                niveau: 1,
                                style_jeu: 'Découverte',
                                experience_jeu: 'Débutant'
                            };
                            return true;
                        }
                    }
                } catch (e) {
                    console.log('Aucune session serveur active');
                }

                return false;
            }

            renderLoginPrompt() {
                this.contentContainer.innerHTML = `
                    <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); padding: 2rem; border-radius: var(--border-radius); text-align: center; margin-bottom: 3rem;">
                        <h2 style="color: var(--secondary-color); margin-bottom: 1rem;">⚔️ Rejoignez la Guilde des Aventuriers</h2>
                        <p style="color: var(--light-text); line-height: 1.6; margin-bottom: 2rem;">
                            Créez votre profil d'aventurier D&D personnalisé et accédez à :
                        </p>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                            <div style="background: var(--dark-bg); padding: 1.5rem; border-radius: var(--border-radius); border: 1px solid var(--border-color);">
                                <div style="font-size: 2rem; margin-bottom: 0.5rem;">📊</div>
                                <h4 style="color: var(--secondary-color); margin-bottom: 0.5rem;">Profil D&D</h4>
                                <p style="color: var(--medium-text); font-size: 0.9rem;">Espèce, classe, historique personnalisés</p>
                            </div>
                            <div style="background: var(--dark-bg); padding: 1.5rem; border-radius: var(--border-radius); border: 1px solid var(--border-color);">
                                <div style="font-size: 2rem; margin-bottom: 0.5rem;">❤️</div>
                                <h4 style="color: var(--secondary-color); margin-bottom: 0.5rem;">Favoris</h4>
                                <p style="color: var(--medium-text); font-size: 0.9rem;">Sauvegardez vos produits préférés</p>
                            </div>
                            <div style="background: var(--dark-bg); padding: 1.5rem; border-radius: var(--border-radius); border: 1px solid var(--border-color);">
                                <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎯</div>
                                <h4 style="color: var(--secondary-color); margin-bottom: 0.5rem;">Recommandations</h4>
                                <p style="color: var(--medium-text); font-size: 0.9rem;">Suggestions basées sur votre profil</p>
                            </div>
                            <div style="background: var(--dark-bg); padding: 1.5rem; border-radius: var(--border-radius); border: 1px solid var(--border-color);">
                                <div style="font-size: 2rem; margin-bottom: 0.5rem;">📜</div>
                                <h4 style="color: var(--secondary-color); margin-bottom: 0.5rem;">Historique</h4>
                                <p style="color: var(--medium-text); font-size: 0.9rem;">Suivez vos commandes et achats</p>
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                            <button onclick="accountPage.showRegisterForm()" style="
                                background: var(--secondary-color);
                                color: var(--dark-bg);
                                padding: 1rem 2rem;
                                border-radius: var(--border-radius);
                                border: none;
                                font-weight: 600;
                                transition: var(--transition);
                                display: inline-flex;
                                align-items: center;
                                gap: 0.5rem;
                                cursor: pointer;
                            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                                ⚔️ Créer un Aventurier
                            </button>
                            <button onclick="accountPage.showLoginForm()" style="
                                background: transparent;
                                color: var(--secondary-color);
                                padding: 1rem 2rem;
                                border: 2px solid var(--secondary-color);
                                border-radius: var(--border-radius);
                                font-weight: 600;
                                transition: var(--transition);
                                display: inline-flex;
                                align-items: center;
                                gap: 0.5rem;
                                cursor: pointer;
                            " onmouseover="this.style.background='rgba(212, 175, 55, 0.1)'" onmouseout="this.style.background='transparent'">
                                🗡️ Se Connecter
                            </button>
                        </div>
                    </div>
                `;
            }

            renderUserDashboard() {
                this.contentContainer.innerHTML = `
                    <div style="background: var(--dark-bg); padding: 2rem; border-radius: var(--border-radius); border: 1px solid var(--border-color); margin-bottom: 2rem;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
                            <div>
                                <h2 style="color: var(--secondary-color); margin: 0 0 0.5rem 0;">
                                    🧙‍♂️ Bienvenue, ${this.user.nom_aventurier} !
                                </h2>
                                <p style="color: var(--medium-text); margin: 0;">
                                    ${this.user.espece} ${this.user.classe} (Niveau ${this.user.niveau}) - ${this.user.historique}
                                </p>
                            </div>
                            <button onclick="accountPage.logout()" style="
                                background: transparent;
                                color: var(--medium-text);
                                border: 1px solid var(--border-color);
                                padding: 0.5rem 1rem;
                                border-radius: var(--border-radius);
                                cursor: pointer;
                                transition: var(--transition);
                            " onmouseover="this.style.color='var(--secondary-color)'; this.style.borderColor='var(--secondary-color)'" 
                               onmouseout="this.style.color='var(--medium-text)'; this.style.borderColor='var(--border-color)'">
                                🚪 Déconnexion
                            </button>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
                            <!-- Profil Aventurier -->
                            <div style="background: var(--darker-bg); padding: 1.5rem; border-radius: var(--border-radius); border: 1px solid var(--border-color);">
                                <h3 style="color: var(--secondary-color); margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                                    📊 Profil Aventurier
                                </h3>
                                <div style="space-y: 0.5rem;">
                                    <div style="margin-bottom: 0.5rem;">
                                        <strong style="color: var(--light-text);">Espèce :</strong>
                                        <span style="color: var(--medium-text);"> ${this.user.espece}</span>
                                    </div>
                                    <div style="margin-bottom: 0.5rem;">
                                        <strong style="color: var(--light-text);">Classe :</strong>
                                        <span style="color: var(--medium-text);"> ${this.user.classe}</span>
                                    </div>
                                    <div style="margin-bottom: 0.5rem;">
                                        <strong style="color: var(--light-text);">Historique :</strong>
                                        <span style="color: var(--medium-text);"> ${this.user.historique}</span>
                                    </div>
                                    <div style="margin-bottom: 0.5rem;">
                                        <strong style="color: var(--light-text);">Style de jeu :</strong>
                                        <span style="color: var(--medium-text);"> ${this.user.style_jeu}</span>
                                    </div>
                                    <div style="margin-bottom: 0.5rem;">
                                        <strong style="color: var(--light-text);">Expérience :</strong>
                                        <span style="color: var(--medium-text);"> ${this.user.experience_jeu}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Favoris -->
                            <div style="background: var(--darker-bg); padding: 1.5rem; border-radius: var(--border-radius); border: 1px solid var(--border-color);">
                                <h3 style="color: var(--secondary-color); margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                                    ❤️ Favoris
                                </h3>
                                <div id="user-favorites">
                                    <p style="color: var(--medium-text); text-align: center;">Chargement...</p>
                                </div>
                            </div>
                            
                            <!-- Recommandations -->
                            <div style="background: var(--darker-bg); padding: 1.5rem; border-radius: var(--border-radius); border: 1px solid var(--border-color);">
                                <h3 style="color: var(--secondary-color); margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                                    🎯 Recommandés pour vous
                                </h3>
                                <div id="user-recommendations">
                                    <p style="color: var(--medium-text); text-align: center;">Chargement...</p>
                                </div>
                            </div>
                            
                            <!-- Historique récent -->
                            <div style="background: var(--darker-bg); padding: 1.5rem; border-radius: var(--border-radius); border: 1px solid var(--border-color);">
                                <h3 style="color: var(--secondary-color); margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                                    📜 Dernières activités
                                </h3>
                                <div id="user-activity">
                                    <p style="color: var(--medium-text); text-align: center;">Chargement...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Charger les données utilisateur
                this.loadUserData();
            }

            async loadUserData() {
                try {
                    // Charger les favoris (simulation)
                    setTimeout(() => {
                        document.getElementById('user-favorites').innerHTML = `
                            <p style="color: var(--medium-text); text-align: center; font-style: italic;">
                                Aucun favori encore.<br>
                                <small>Explorez notre boutique pour ajouter des produits !</small>
                            </p>
                        `;
                    }, 500);

                    // Charger les recommandations basées sur le profil D&D
                    setTimeout(() => {
                        const recommendations = this.generateRecommendations();
                        const recHtml = recommendations.map(rec => `
                            <div style="margin-bottom: 1rem; padding: 1rem; background: var(--dark-bg); border-radius: var(--border-radius); border: 1px solid var(--border-color);">
                                <h4 style="color: var(--light-text); margin: 0 0 0.5rem 0; font-size: 0.9rem;">${rec.title}</h4>
                                <p style="color: var(--medium-text); margin: 0; font-size: 0.8rem;">${rec.reason}</p>
                                <div style="margin-top: 0.5rem;">
                                    <span style="background: rgba(212, 175, 55, 0.2); color: var(--secondary-color); padding: 0.2rem 0.5rem; border-radius: 3px; font-size: 0.7rem;">
                                        ${rec.score}% compatible
                                    </span>
                                </div>
                            </div>
                        `).join('');
                        
                        document.getElementById('user-recommendations').innerHTML = recHtml || '<p style="color: var(--medium-text); text-align: center;">Aucune recommandation disponible</p>';
                    }, 800);

                    // Charger l'activité récente
                    setTimeout(() => {
                        document.getElementById('user-activity').innerHTML = `
                            <div style="color: var(--medium-text); font-size: 0.9rem;">
                                <div style="margin-bottom: 0.5rem;">
                                    <span style="color: var(--secondary-color);">✨</span> Compte créé le ${new Date(this.user.date_creation).toLocaleDateString('fr-FR')}
                                </div>
                                ${this.user.derniere_connexion ? `
                                <div>
                                    <span style="color: var(--secondary-color);">🗡️</span> Dernière connexion : ${new Date(this.user.derniere_connexion).toLocaleDateString('fr-FR')}
                                </div>
                                ` : ''}
                            </div>
                        `;
                    }, 1200);

                } catch (error) {
                    console.error('Erreur lors du chargement des données utilisateur:', error);
                }
            }

            generateRecommendations() {
                const recommendations = [];
                
                // Recommandations basées sur l'espèce
                const especeRecs = {
                    'Humain': [{ title: 'L\'Offrande du Voyageur', reason: 'Starter pack parfait pour les humains polyvalents', score: 85 }],
                    'Elfe': [{ title: 'Routes & Services', reason: 'Idéal pour les elfes voyageurs et mystiques', score: 90 }],
                    'Nain': [{ title: 'La Monnaie des Cinq Royaumes', reason: 'Collection complète pour les nains amateurs de richesse', score: 88 }],
                    'Halfelin': [{ title: 'L\'Offrande du Voyageur', reason: 'Parfait pour débuter l\'aventure halfeline', score: 82 }],
                    'Drakéide': [{ title: 'L\'Essence du Marchand', reason: 'Opulence digne des descendants de dragons', score: 92 }]
                };

                // Recommandations basées sur la classe
                const classeRecs = {
                    'Guerrier': [{ title: 'Arsenal de l\'Aventurier', reason: 'Équipement de combat pour guerriers', score: 95 }],
                    'Magicien': [{ title: 'Butins & Ingénieries', reason: 'Objets magiques et merveilles arcanes', score: 93 }],
                    'Roublard': [{ title: 'Butins & Ingénieries', reason: 'Outils spécialisés et équipement discret', score: 87 }],
                    'Clerc': [{ title: 'Routes & Services', reason: 'Services divins et équipement ecclésiastique', score: 85 }]
                };

                // Ajouter les recommandations
                if (especeRecs[this.user.espece]) {
                    recommendations.push(...especeRecs[this.user.espece]);
                }
                
                if (classeRecs[this.user.classe]) {
                    recommendations.push(...classeRecs[this.user.classe]);
                }

                // Recommandation universelle
                recommendations.push({
                    title: 'Triptyques Mystères - Origines Complètes',
                    reason: 'Explorez de nouveaux personnages et combinaisons',
                    score: 75
                });

                // Retourner les 3 meilleures recommandations uniques
                const uniqueRecs = recommendations.reduce((acc, current) => {
                    const exists = acc.find(item => item.title === current.title);
                    if (!exists) {
                        acc.push(current);
                    } else if (current.score > exists.score) {
                        exists.score = current.score;
                        exists.reason += ` + ${current.reason}`;
                    }
                    return acc;
                }, []);

                return uniqueRecs.sort((a, b) => b.score - a.score).slice(0, 3);
            }

            logout() {
                if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                    // Supprimer la session locale
                    localStorage.removeItem('user_session');
                    
                    // Appeler l'API de déconnexion unifiée
                    fetch('/api/account/logout', { method: 'POST' })
                        .then(() => {
                            // Recharger la page pour afficher le prompt de connexion
                            window.location.reload();
                        })
                        .catch(error => {
                            console.error('Erreur lors de la déconnexion:', error);
                            // Recharger quand même la page
                            window.location.reload();
                        });
                }
            }
            
            showLoginForm() {
                this.contentContainer.innerHTML = `
                    <div style="max-width: 400px; margin: 0 auto; background: var(--dark-bg); padding: 2rem; border-radius: var(--border-radius); border: 1px solid var(--border-color);">
                        <h2 style="color: var(--secondary-color); text-align: center; margin-bottom: 2rem;">🗡️ Connexion Aventurier</h2>
                        
                        <form id="login-form" style="display: flex; flex-direction: column; gap: 1rem;">
                            <div>
                                <label style="color: var(--light-text); margin-bottom: 0.5rem; display: block;">Email de l'aventurier</label>
                                <input type="email" id="login-email" required autocomplete="email"
                                       style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: var(--border-radius); background: var(--darker-bg); color: var(--light-text);">
                            </div>

                            <div>
                                <label style="color: var(--light-text); margin-bottom: 0.5rem; display: block;">Mot de passe</label>
                                <input type="password" id="login-password" autocomplete="current-password"
                                       style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: var(--border-radius); background: var(--darker-bg); color: var(--light-text);">
                                <small style="display: block; margin-top: 0.5rem; color: var(--medium-text);">
                                    Optionnel tant que l'authentification par mot de passe n'est pas activée.
                                </small>
                            </div>

                            <button type="submit" style="
                                background: var(--secondary-color);
                                color: var(--dark-bg);
                                padding: 0.75rem;
                                border: none;
                                border-radius: var(--border-radius);
                                font-weight: 600;
                                cursor: pointer;
                                transition: var(--transition);
                            ">Se connecter</button>
                            
                            <button type="button" onclick="accountPage.renderLoginPrompt()" style="
                                background: transparent;
                                color: var(--medium-text);
                                padding: 0.5rem;
                                border: 1px solid var(--border-color);
                                border-radius: var(--border-radius);
                                cursor: pointer;
                            ">Retour</button>
                        </form>
                        
                        <div id="login-message" style="margin-top: 1rem; text-align: center;"></div>
                    </div>
                `;
                
                document.getElementById('login-form').addEventListener('submit', this.handleLogin.bind(this));
            }
            
            showRegisterForm() {
                this.contentContainer.innerHTML = `
                    <div style="max-width: 500px; margin: 0 auto; background: var(--dark-bg); padding: 2rem; border-radius: var(--border-radius); border: 1px solid var(--border-color);">
                        <h2 style="color: var(--secondary-color); text-align: center; margin-bottom: 2rem;">⚔️ Créer un Aventurier</h2>
                        
                        <form id="register-form" style="display: flex; flex-direction: column; gap: 1rem;">
                            <div>
                                <label style="color: var(--light-text); margin-bottom: 0.5rem; display: block;">Email</label>
                                <input type="email" id="register-email" required autocomplete="email"
                                       style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: var(--border-radius); background: var(--darker-bg); color: var(--light-text);">
                            </div>

                            <div>
                                <label style="color: var(--light-text); margin-bottom: 0.5rem; display: block;">Mot de passe</label>
                                <input type="password" id="register-password" required minlength="8" autocomplete="new-password"
                                       style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: var(--border-radius); background: var(--darker-bg); color: var(--light-text);">
                                <small style="display: block; margin-top: 0.5rem; color: var(--medium-text);">
                                    8 caractères minimum pour protéger votre compte.
                                </small>
                            </div>

                            <div>
                                <label style="color: var(--light-text); margin-bottom: 0.5rem; display: block;">Nom d'aventurier</label>
                                <input type="text" id="register-name" required
                                       style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: var(--border-radius); background: var(--darker-bg); color: var(--light-text);">
                            </div>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div>
                                    <label style="color: var(--light-text); margin-bottom: 0.5rem; display: block;">Espèce</label>
                                    <select id="register-espece" required 
                                            style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: var(--border-radius); background: var(--darker-bg); color: var(--light-text);">
                                        <option value="">Choisir...</option>
                                        <option value="Humain">Humain</option>
                                        <option value="Elfe">Elfe</option>
                                        <option value="Nain">Nain</option>
                                        <option value="Halfelin">Halfelin</option>
                                        <option value="Drakéide">Drakéide</option>
                                        <option value="Gnome">Gnome</option>
                                        <option value="Demi-Elfe">Demi-Elfe</option>
                                        <option value="Demi-Orc">Demi-Orc</option>
                                        <option value="Tieffelin">Tieffelin</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label style="color: var(--light-text); margin-bottom: 0.5rem; display: block;">Classe</label>
                                    <select id="register-classe" required 
                                            style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: var(--border-radius); background: var(--darker-bg); color: var(--light-text);">
                                        <option value="">Choisir...</option>
                                        <option value="Guerrier">Guerrier</option>
                                        <option value="Magicien">Magicien</option>
                                        <option value="Roublard">Roublard</option>
                                        <option value="Clerc">Clerc</option>
                                        <option value="Rôdeur">Rôdeur</option>
                                        <option value="Paladin">Paladin</option>
                                        <option value="Sorcier">Sorcier</option>
                                        <option value="Barde">Barde</option>
                                        <option value="Barbare">Barbare</option>
                                        <option value="Moine">Moine</option>
                                        <option value="Druide">Druide</option>
                                        <option value="Occultiste">Occultiste</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label style="color: var(--light-text); margin-bottom: 0.5rem; display: block;">Historique</label>
                                <select id="register-historique" required 
                                        style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: var(--border-radius); background: var(--darker-bg); color: var(--light-text);">
                                    <option value="">Choisir...</option>
                                    <option value="Acolyte">Acolyte</option>
                                    <option value="Criminel">Criminel</option>
                                    <option value="Artisan de Guilde">Artisan de Guilde</option>
                                    <option value="Noble">Noble</option>
                                    <option value="Héros du Peuple">Héros du Peuple</option>
                                    <option value="Ermite">Ermite</option>
                                    <option value="Artiste">Artiste</option>
                                    <option value="Marin">Marin</option>
                                    <option value="Soldat">Soldat</option>
                                    <option value="Vagabond">Vagabond</option>
                                    <option value="Sage">Sage</option>
                                    <option value="Explorateur">Explorateur</option>
                                </select>
                            </div>
                            
                            <button type="submit" style="
                                background: var(--secondary-color);
                                color: var(--dark-bg);
                                padding: 0.75rem;
                                border: none;
                                border-radius: var(--border-radius);
                                font-weight: 600;
                                cursor: pointer;
                                transition: var(--transition);
                            ">Créer l'aventurier</button>
                            
                            <button type="button" onclick="accountPage.renderLoginPrompt()" style="
                                background: transparent;
                                color: var(--medium-text);
                                padding: 0.5rem;
                                border: 1px solid var(--border-color);
                                border-radius: var(--border-radius);
                                cursor: pointer;
                            ">Retour</button>
                        </form>
                        
                        <div id="register-message" style="margin-top: 1rem; text-align: center;"></div>
                    </div>
                `;
                
                document.getElementById('register-form').addEventListener('submit', this.handleRegister.bind(this));
            }
            
            async handleLogin(event) {
                event.preventDefault();
                
                const email = document.getElementById('login-email').value.trim();
                const passwordField = document.getElementById('login-password');
                const password = passwordField ? passwordField.value : '';
                const messageDiv = document.getElementById('login-message');
                
                try {
                    const response = await fetch('/api/account/login-local', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(password ? { email, password } : { email })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        messageDiv.innerHTML = '<p style="color: var(--secondary-color);">✅ Connexion réussie !</p>';
                        setTimeout(() => {
                            this.user = result.user;
                            this.renderUserDashboard();
                        }, 1000);
                    } else {
                        messageDiv.innerHTML = `<p style="color: #ff6b6b;">❌ ${result.message}</p>`;
                    }
                } catch (error) {
                    messageDiv.innerHTML = '<p style="color: #ff6b6b;">❌ Erreur de connexion</p>';
                }
            }
            
            async handleRegister(event) {
                event.preventDefault();
                
                const formData = {
                    email: document.getElementById('register-email').value.trim(),
                    password: document.getElementById('register-password').value,
                    nom_aventurier: document.getElementById('register-name').value.trim(),
                    espece: document.getElementById('register-espece').value,
                    classe: document.getElementById('register-classe').value,
                    historique: document.getElementById('register-historique').value
                };
                
                const messageDiv = document.getElementById('register-message');
                
                try {
                    const response = await fetch('/api/account/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        messageDiv.innerHTML = '<p style="color: var(--secondary-color);">✅ Aventurier créé avec succès !</p>';
                        setTimeout(() => {
                            this.user = result.user;
                            this.renderUserDashboard();
                        }, 1000);
                    } else {
                        messageDiv.innerHTML = `<p style="color: #ff6b6b;">❌ ${result.message}</p>`;
                    }
                } catch (error) {
                    messageDiv.innerHTML = '<p style="color: #ff6b6b;">❌ Erreur lors de la création du compte</p>';
                }
            }
        }

        // Initialisation
        let accountPage;
        document.addEventListener('DOMContentLoaded', () => {
            accountPage = new AccountPage();
        });
    </script>
</body>
</html>