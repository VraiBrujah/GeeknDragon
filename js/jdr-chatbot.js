/**
 * 🎲 CHATBOT ASSISTANCE JDR INTELLIGENT
 * Assistant virtuel spécialisé pour conseils D&D et recommandations produits
 */

class JDRChatbot {
    constructor() {
        this.isOpen = false;
        this.conversationHistory = [];
        this.userProfile = {
            experience: null, // 'debutant', 'intermediaire', 'expert'
            role: null, // 'joueur', 'mj', 'collectionneur'
            interests: [],
            budget_range: null
        };
        
        this.knowledgeBase = this.initializeKnowledgeBase();
        this.responses = this.initializeResponses();
        this.productCatalog = this.initializeProductCatalog();
        
        this.initializeChatbot();
        this.bindEvents();
    }

    initializeKnowledgeBase() {
        return {
            // Questions fréquentes sur les produits
            products: {
                'pieces metalliques': {
                    keywords: ['pièce', 'métal', 'métallique', 'monnaie', 'or', 'argent', 'trésor'],
                    response: 'Nos pièces métalliques transforment complètement l\'expérience de jeu ! Elles ajoutent un réalisme tactile qui immerge vraiment les joueurs. Quelle est votre expérience avec le JDR ?',
                    follow_up: ['experience_level', 'budget_discussion', 'quantity_needed']
                },
                'multiplicateurs': {
                    keywords: ['x10', 'x100', 'x1000', 'x10000', 'multiplicateur', 'dénomination'],
                    response: 'Nos multiplicateurs permettent de gérer facilement toutes les valeurs ! x10 pour les échanges courants, x100 pour les récompenses moyennes, x1000 pour les gros trésors, et x10000 pour les fortunes légendaires. Tous ont une gravure nette et finition mate pour une sensation premium.',
                    follow_up: ['campaign_type', 'player_count', 'budget_discussion']
                },
                'qualite': {
                    keywords: ['qualité', 'finition', 'gravure', 'durabilité', 'fabrication'],
                    response: 'Nos pièces sont fabriquées au Québec avec une gravure nette et finition mate qui résiste à l\'usage intensif. Elles gardent leur beauté même après des centaines de parties ! C\'est un investissement à long terme.',
                    follow_up: ['usage_frequency', 'care_instructions']
                }
            },

            // Conseils JDR par expérience
            jdr_advice: {
                'debutant': {
                    keywords: ['débutant', 'commencer', 'premier', 'nouvelle', 'apprendre'],
                    response: 'Parfait ! Pour débuter, je recommande notre lot x10 - il couvre 80% des situations de jeu et impressionne sans être intimidant. Voulez-vous des conseils pour votre première session avec des pièces métalliques ?',
                    follow_up: ['first_session_tips', 'mj_or_player']
                },
                'intermediaire': {
                    keywords: ['intermédiaire', 'quelques', 'années', 'expérience'],
                    response: 'Avec votre expérience, vous allez adorer l\'impact des pièces ! Le combo x10 + x100 est idéal pour enrichir vos parties existantes. Quel type de campagnes menez-vous généralement ?',
                    follow_up: ['campaign_style', 'current_challenges']
                },
                'expert': {
                    keywords: ['expert', 'vétéran', 'années', 'expérimenté', 'maître'],
                    response: 'En tant qu\'expert, vous comprendrez immédiatement la valeur ajoutée ! Beaucoup de MJ expérimentés optent pour la gamme complète (x10 à x10000) pour une flexibilité totale. Recherchez-vous quelque chose de spécifique ?',
                    follow_up: ['specific_needs', 'advanced_usage']
                }
            },

            // Conseils par rôle
            role_advice: {
                'mj': {
                    keywords: ['mj', 'maître', 'jeu', 'dm', 'master', 'mener'],
                    response: 'En tant que MJ, ces pièces vont révolutionner vos récompenses ! Fini les "vous gagnez 500 pièces d\'or" abstraites - maintenant vous pouvez littéralement verser un trésor sur la table. Quel est votre plus grand défi en tant que MJ ?',
                    follow_up: ['mj_challenges', 'party_size', 'reward_frequency']
                },
                'joueur': {
                    keywords: ['joueur', 'jouer', 'personnage', 'partie'],
                    response: 'Comme joueur, vous allez vivre une expérience totalement différente ! Tenir de vraies pièces métalliques dans vos mains quand vous pillez un trésor... c\'est magique ! Votre MJ utilise-t-il déjà des accessoires ?',
                    follow_up: ['current_accessories', 'convince_mj', 'gift_suggestion']
                },
                'collectionneur': {
                    keywords: ['collection', 'collectionneur', 'accessoire', 'objet'],
                    response: 'Pour un collectionneur, nos pièces représentent l\'excellence artisanale québécoise ! Fabriquées avec soin, elles gardent leur valeur et leur beauté. Cherchez-vous une pièce spécifique ou une collection complète ?',
                    follow_up: ['collection_goals', 'display_options', 'investment_value']
                }
            },

            // Scénarios d'usage
            usage_scenarios: {
                'recompenses': {
                    keywords: ['récompense', 'trésor', 'butin', 'gain', 'loot'],
                    response: 'Pour les récompenses, rien ne vaut l\'effet dramatique ! Versez les pièces directement sur la table pendant que vous décrivez le trésor. Le son métallique ajoute une dimension sensorielle incroyable ! Combien de joueurs avez-vous habituellement ?',
                    follow_up: ['party_size', 'reward_style', 'dramatic_effect']
                },
                'economie': {
                    keywords: ['économie', 'commerce', 'marchand', 'acheter', 'vendre'],
                    response: 'Pour une économie immersive, les multiplicateurs sont essentiels ! x10 pour les achats courants, x100 pour l\'équipement, x1000 pour les biens rares, x10000 pour les propriétés. Votre campagne a-t-elle beaucoup d\'échanges commerciaux ?',
                    follow_up: ['economy_complexity', 'trading_frequency', 'merchant_interactions']
                },
                'atmosphere': {
                    keywords: ['atmosphère', 'immersion', 'ambiance', 'réalisme'],
                    response: 'L\'atmosphère, c\'est notre spécialité ! Nos pièces transforment l\'abstract en concret. Quand vos joueurs entendent le tintement métallique et sentent le poids réel, l\'immersion devient totale. Quel type d\'ambiance recherchez-vous ?',
                    follow_up: ['atmosphere_goals', 'current_methods', 'enhancement_ideas']
                }
            }
        };
    }

    initializeResponses() {
        return {
            greetings: [
                'Salut ! Je suis votre assistant JDR spécialisé. Comment puis-je enrichir vos parties aujourd\'hui ? 🎲',
                'Bonjour ! Prêt à découvrir comment nos pièces métalliques vont transformer vos sessions ? ⚔️',
                'Hey ! Que diriez-vous d\'ajouter plus de magie à vos parties ? Je suis là pour vous guider ! ✨'
            ],

            fallback: [
                'Intéressant ! Pouvez-vous m\'en dire plus ? Je suis là pour vous aider avec tout ce qui concerne le JDR et nos produits 🎯',
                'Je vois ! Pouvez-vous préciser votre question ? Je connais bien nos pièces et leur utilisation en jeu 🤔',
                'Hmm, je n\'ai pas bien saisi. Reformulez-vous pour que je puisse mieux vous aider ? 💭'
            ],

            clarifications: {
                experience_level: 'Dites-moi, quel est votre niveau d\'expérience en JDR ? Débutant, intermédiaire ou expert ?',
                budget_discussion: 'Quel budget avez-vous en tête ? Nos lots vont de 60$ à 950$ selon vos besoins.',
                mj_or_player: 'Êtes-vous plutôt MJ (maître de jeu) ou joueur ?',
                party_size: 'Combien de joueurs avez-vous habituellement dans votre groupe ?',
                campaign_type: 'Quel type de campagnes préférez-vous ? (Fantasy classique, homebrew, one-shots...)'
            },

            recommendations: {
                starter: {
                    product: 'lot10',
                    reason: 'Parfait pour débuter ! Le lot x10 couvre la majorité des situations de jeu et impressionne sans compliquer les calculs.',
                    price: '60$',
                    next_step: 'Une fois que vous aurez vu l\'effet, vous voudrez probablement ajouter le x100 !'
                },
                intermediate: {
                    product: 'lot10+lot100',
                    reason: 'La combinaison idéale ! x10 pour le quotidien, x100 pour les récompenses marquantes.',
                    price: '110$',
                    next_step: 'Cette base couvre 95% des besoins. Vous pourrez toujours ajouter les gros multiplicateurs plus tard.'
                },
                complete: {
                    product: 'collection_complete',
                    reason: 'La collection complète pour une flexibilité totale ! Tous les multiplicateurs de x10 à x10000.',
                    price: '950$',
                    next_step: 'Investissement à long terme qui transformera définitivement vos parties.'
                }
            }
        };
    }

    initializeProductCatalog() {
        return {
            lot10: {
                name: 'Lot de 10 pièces métalliques (x10)',
                price: 60,
                description: '10 pièces métalliques avec gravure nette et finition mate',
                best_for: ['débutants', 'découverte', 'sessions courtes'],
                use_cases: ['achats courants', 'récompenses de base', 'initiation']
            },
            lot100: {
                name: 'Lot de 10 pièces métalliques (x100)', 
                price: 60,
                description: '10 pièces métalliques x100 avec gravure nette et finition mate',
                best_for: ['intermédiaires', 'récompenses moyennes'],
                use_cases: ['équipement', 'services', 'récompenses de quête']
            },
            lot1000: {
                name: 'Lot de 10 pièces métalliques (x1000)',
                price: 60, 
                description: '10 pièces métalliques x1000 avec gravure nette et finition mate',
                best_for: ['experts', 'gros trésors', 'campagnes longues'],
                use_cases: ['trésors importants', 'récompenses majeures', 'commerce de luxe']
            },
            lot10000: {
                name: 'Lot de 10 pièces métalliques (x10000)',
                price: 60,
                description: '10 pièces métalliques x10000 avec gravure nette et finition mate',
                best_for: ['experts', 'fortunes légendaires'],
                use_cases: ['royaumes', 'fortunes dragon', 'propriétés majeures']
            }
        };
    }

    initializeChatbot() {
        this.createChatbotHTML();
        this.injectChatbotStyles();
        this.startAutoGreeting();
    }

    bindEvents() {
        document.addEventListener('DOMContentLoaded', () => {
            this.attachEventListeners();
        });

        // Déclencheurs intelligents
        this.observeUserBehavior();
    }

    createChatbotHTML() {
        const chatbotContainer = document.createElement('div');
        chatbotContainer.className = 'jdr-chatbot-container';
        chatbotContainer.innerHTML = `
            <!-- Bouton d'ouverture flottant -->
            <div class="chatbot-trigger" id="chatbot-trigger">
                <div class="trigger-icon">
                    <i class="fas fa-dice-d20"></i>
                </div>
                <div class="trigger-notification" id="trigger-notification">
                    <span>Une question JDR ?</span>
                </div>
            </div>

            <!-- Interface du chatbot -->
            <div class="chatbot-interface" id="chatbot-interface">
                <div class="chatbot-header">
                    <div class="chatbot-avatar">
                        <i class="fas fa-hat-wizard"></i>
                    </div>
                    <div class="chatbot-info">
                        <h3>Assistant JDR</h3>
                        <p class="chatbot-status">En ligne - Prêt à vous aider !</p>
                    </div>
                    <button class="chatbot-close" id="chatbot-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="chatbot-messages" id="chatbot-messages">
                    <div class="message bot-message welcome-message">
                        <div class="message-avatar">
                            <i class="fas fa-hat-wizard"></i>
                        </div>
                        <div class="message-content">
                            <p>Salut ! Je suis votre assistant JDR spécialisé. Comment puis-je enrichir vos parties aujourd'hui ? 🎲</p>
                            <div class="quick-options">
                                <button class="quick-option" data-action="product_advice">
                                    💰 Conseils produits
                                </button>
                                <button class="quick-option" data-action="jdr_tips">
                                    🎭 Conseils JDR
                                </button>
                                <button class="quick-option" data-action="budget_help">
                                    💎 Aide budget
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="chatbot-input-area">
                    <div class="input-container">
                        <input type="text" 
                               id="chatbot-input" 
                               placeholder="Posez votre question..."
                               maxlength="500">
                        <button id="chatbot-send">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                    <div class="chatbot-typing" id="chatbot-typing">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>

                <div class="chatbot-footer">
                    <p>Propulsé par l'expertise JDR GeeknDragon 🇨🇦</p>
                </div>
            </div>
        `;

        document.body.appendChild(chatbotContainer);
    }

    attachEventListeners() {
        const trigger = document.getElementById('chatbot-trigger');
        const closeBtn = document.getElementById('chatbot-close');
        const sendBtn = document.getElementById('chatbot-send');
        const input = document.getElementById('chatbot-input');

        trigger?.addEventListener('click', () => this.toggleChatbot());
        closeBtn?.addEventListener('click', () => this.closeChatbot());
        sendBtn?.addEventListener('click', () => this.sendMessage());
        
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Quick options
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-option')) {
                this.handleQuickOption(e.target.dataset.action);
            }
        });
    }

    observeUserBehavior() {
        // Déclenchement intelligent basé sur le comportement
        let timeOnSite = 0;
        let productViews = 0;
        let scrollDepth = 0;

        // Timer sur le site
        setInterval(() => {
            timeOnSite += 1;
            if (timeOnSite === 30 && !this.hasInteracted()) {
                this.showAutoPrompt('Besoin d\'aide pour choisir vos pièces ? 💡');
            }
        }, 1000);

        // Détection de vues produits
        const productElements = document.querySelectorAll('.product-card, .product-item');
        if (productElements.length > 0) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        productViews++;
                        if (productViews === 3 && !this.hasInteracted()) {
                            this.showAutoPrompt('Questions sur nos produits ? Je peux vous conseiller ! 🎯');
                        }
                    }
                });
            }, { threshold: 0.5 });

            productElements.forEach(el => observer.observe(el));
        }

        // Détection de scroll profond (confusion potentielle)
        window.addEventListener('scroll', () => {
            const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent > 80 && !this.hasInteracted()) {
                this.showAutoPrompt('Vous cherchez quelque chose de spécifique ? 🔍');
            }
        });
    }

    toggleChatbot() {
        const chatInterface = document.getElementById('chatbot-interface');
        const trigger = document.getElementById('chatbot-trigger');
        
        if (!this.isOpen) {
            this.openChatbot();
        } else {
            this.closeChatbot();
        }
    }

    openChatbot() {
        const chatInterface = document.getElementById('chatbot-interface');
        const trigger = document.getElementById('chatbot-trigger');
        
        chatInterface.classList.add('active');
        trigger.classList.add('hidden');
        this.isOpen = true;
        
        this.focusInput();
        this.trackChatbotOpen();
    }

    closeChatbot() {
        const chatInterface = document.getElementById('chatbot-interface');
        const trigger = document.getElementById('chatbot-trigger');
        
        chatInterface.classList.remove('active');
        trigger.classList.remove('hidden');
        this.isOpen = false;
        
        this.trackChatbotClose();
    }

    sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        
        if (!message) return;

        this.addUserMessage(message);
        input.value = '';
        
        this.showTypingIndicator();
        setTimeout(() => {
            this.processMessage(message);
            this.hideTypingIndicator();
        }, 1000 + Math.random() * 1000); // Délai réaliste
    }

    addUserMessage(message) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${this.escapeHtml(message)}</p>
            </div>
            <div class="message-time">${this.getCurrentTime()}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        this.conversationHistory.push({
            type: 'user',
            content: message,
            timestamp: Date.now()
        });
    }

    addBotMessage(message, options = {}) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        let quickOptionsHtml = '';
        if (options.quickOptions) {
            quickOptionsHtml = `
                <div class="quick-options">
                    ${options.quickOptions.map(option => `
                        <button class="quick-option" data-action="${option.action}">
                            ${option.icon} ${option.text}
                        </button>
                    `).join('')}
                </div>
            `;
        }

        let productRecommendationHtml = '';
        if (options.productRecommendation) {
            const product = options.productRecommendation;
            productRecommendationHtml = `
                <div class="product-recommendation">
                    <h4>💡 Recommandation</h4>
                    <div class="recommended-product">
                        <h5>${product.name}</h5>
                        <p class="product-price">${product.price}$</p>
                        <p class="product-reason">${product.reason}</p>
                        <a href="/boutique.php#${product.product}" class="btn-view-product">
                            Voir le produit <i class="fas fa-external-link-alt"></i>
                        </a>
                    </div>
                </div>
            `;
        }
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-hat-wizard"></i>
            </div>
            <div class="message-content">
                <p>${message}</p>
                ${productRecommendationHtml}
                ${quickOptionsHtml}
            </div>
            <div class="message-time">${this.getCurrentTime()}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        this.conversationHistory.push({
            type: 'bot',
            content: message,
            timestamp: Date.now(),
            options: options
        });
    }

    processMessage(message) {
        const lowerMessage = message.toLowerCase();
        const analysis = this.analyzeMessage(lowerMessage);
        
        // Mise à jour du profil utilisateur
        this.updateUserProfile(analysis);
        
        // Génération de la réponse
        const response = this.generateResponse(analysis, message);
        
        this.addBotMessage(response.message, response.options);
        this.trackUserMessage(message, analysis);
    }

    analyzeMessage(message) {
        const analysis = {
            intent: 'unknown',
            entities: [],
            confidence: 0,
            keywords: [],
            sentiment: 'neutral'
        };

        // Détection d'intent simple
        const intents = {
            'product_inquiry': ['pièce', 'lot', 'produit', 'acheter', 'prix', 'coût'],
            'jdr_advice': ['conseil', 'comment', 'utiliser', 'mj', 'joueur', 'partie', 'session'],
            'experience_level': ['débutant', 'nouveau', 'expert', 'expérience', 'première'],
            'budget_question': ['budget', 'prix', 'coût', 'cher', 'abordable', 'économique'],
            'technical_specs': ['qualité', 'matériau', 'fabrication', 'durabilité', 'finition'],
            'greeting': ['salut', 'bonjour', 'hello', 'bonsoir'],
            'comparison': ['versus', 'vs', 'comparer', 'différence', 'mieux']
        };

        let highestScore = 0;
        Object.entries(intents).forEach(([intent, keywords]) => {
            const matches = keywords.filter(keyword => message.includes(keyword));
            const score = matches.length / keywords.length;
            if (score > highestScore) {
                highestScore = score;
                analysis.intent = intent;
                analysis.confidence = score;
                analysis.keywords = matches;
            }
        });

        // Extraction d'entités (budget, nombres, etc.)
        const budgetMatch = message.match(/(\d+)\s*\$/);
        if (budgetMatch) {
            analysis.entities.push({
                type: 'budget',
                value: parseInt(budgetMatch[1])
            });
        }

        const playerCountMatch = message.match(/(\d+)\s*(joueur|player)/);
        if (playerCountMatch) {
            analysis.entities.push({
                type: 'player_count',
                value: parseInt(playerCountMatch[1])
            });
        }

        return analysis;
    }

    generateResponse(analysis, originalMessage) {
        let response = {
            message: '',
            options: {}
        };

        switch (analysis.intent) {
            case 'greeting':
                response.message = this.getRandomResponse('greetings');
                response.options.quickOptions = [
                    { action: 'product_advice', icon: '💰', text: 'Conseils produits' },
                    { action: 'jdr_tips', icon: '🎭', text: 'Conseils JDR' },
                    { action: 'experience_check', icon: '⭐', text: 'Mon niveau' }
                ];
                break;

            case 'product_inquiry':
                response = this.handleProductInquiry(analysis);
                break;

            case 'jdr_advice':
                response = this.handleJDRAdvice(analysis);
                break;

            case 'budget_question':
                response = this.handleBudgetQuestion(analysis);
                break;

            case 'experience_level':
                response = this.handleExperienceLevel(analysis);
                break;

            case 'technical_specs':
                response.message = 'Nos pièces sont fabriquées au Québec avec une gravure nette et finition mate premium. Elles résistent à l\'usage intensif et gardent leur beauté après des centaines de parties ! Le poids et la texture ajoutent un réalisme tactile incomparable. Avez-vous des questions spécifiques sur la fabrication ?';
                response.options.quickOptions = [
                    { action: 'durability_info', icon: '🛡️', text: 'Durabilité' },
                    { action: 'quebec_made', icon: '🇨🇦', text: 'Fait au Québec' },
                    { action: 'care_instructions', icon: '✨', text: 'Entretien' }
                ];
                break;

            default:
                response = this.handleUnknownQuery(analysis, originalMessage);
        }

        return response;
    }

    handleProductInquiry(analysis) {
        const budgetEntity = analysis.entities.find(e => e.type === 'budget');
        const playerEntity = analysis.entities.find(e => e.type === 'player_count');
        
        if (budgetEntity && budgetEntity.value < 60) {
            return {
                message: `Je comprends votre budget de ${budgetEntity.value}$. Nos pièces commencent à 60$ pour le lot x10. C'est un investissement qui transforme littéralement l'expérience de jeu ! Voulez-vous savoir pourquoi ça vaut chaque dollar ?`,
                options: {
                    quickOptions: [
                        { action: 'value_explanation', icon: '💡', text: 'Pourquoi ça vaut le coup' },
                        { action: 'alternatives', icon: '🔄', text: 'Autres options' },
                        { action: 'payment_plans', icon: '💳', text: 'Plans de paiement' }
                    ]
                }
            };
        }

        if (!this.userProfile.experience) {
            return {
                message: 'Parfait ! Pour bien vous conseiller, quel est votre niveau d\'expérience en JDR ? Cela m\'aidera à recommander le lot idéal pour vos besoins.',
                options: {
                    quickOptions: [
                        { action: 'set_beginner', icon: '🌱', text: 'Débutant' },
                        { action: 'set_intermediate', icon: '⚔️', text: 'Intermédiaire' },
                        { action: 'set_expert', icon: '👑', text: 'Expert' }
                    ]
                }
            };
        }

        return this.getRecommendationBasedOnProfile();
    }

    handleJDRAdvice(analysis) {
        if (analysis.keywords.includes('mj')) {
            return {
                message: 'En tant que MJ, ces pièces vont révolutionner vos récompenses ! Mon conseil : commencez par décrire le trésor de manière épique, puis versez littéralement les pièces sur la table. L\'effet sonore et visuel créé une immersion totale ! Quel est votre plus grand défi en tant que MJ ?',
                options: {
                    quickOptions: [
                        { action: 'reward_techniques', icon: '🏆', text: 'Techniques de récompenses' },
                        { action: 'dramatic_effects', icon: '🎭', text: 'Effets dramatiques' },
                        { action: 'economy_management', icon: '💰', text: 'Gestion économie' }
                    ]
                }
            };
        }

        return {
            message: 'Excellent ! Les pièces métalliques transforment complètement l\'expérience JDR. Elles ajoutent une dimension tactile et auditive qui rend chaque récompense memorable. Êtes-vous plutôt joueur ou MJ ?',
            options: {
                quickOptions: [
                    { action: 'set_player', icon: '🎲', text: 'Je suis joueur' },
                    { action: 'set_mj', icon: '👑', text: 'Je suis MJ' },
                    { action: 'both_roles', icon: '🔄', text: 'Les deux' }
                ]
            }
        };
    }

    handleBudgetQuestion(analysis) {
        const budgetEntity = analysis.entities.find(e => e.type === 'budget');
        
        return {
            message: 'Nos lots sont conçus pour tous les budgets ! Lot x10 (60$) pour débuter, combo x10+x100 (120$) pour une base solide, ou collection complète (950$) pour une flexibilité totale. Quel est votre budget approximatif ?',
            options: {
                quickOptions: [
                    { action: 'budget_60', icon: '🌱', text: '~60$ (Starter)' },
                    { action: 'budget_120', icon: '⚔️', text: '~120$ (Équilibré)' },
                    { action: 'budget_300+', icon: '👑', text: '300$+ (Complet)' }
                ],
                productRecommendation: this.responses.recommendations.starter
            }
        };
    }

    handleExperienceLevel(analysis) {
        if (analysis.keywords.includes('débutant') || analysis.keywords.includes('nouveau')) {
            this.userProfile.experience = 'debutant';
            return {
                message: 'Parfait pour débuter ! Le lot x10 est idéal - il couvre 80% des situations sans compliquer les calculs. L\'impact sur vos joueurs sera immédiat ! Êtes-vous MJ ou joueur ?',
                options: {
                    productRecommendation: this.responses.recommendations.starter,
                    quickOptions: [
                        { action: 'beginner_tips', icon: '💡', text: 'Conseils débutant' },
                        { action: 'first_session', icon: '🎯', text: 'Première session' }
                    ]
                }
            };
        }

        return {
            message: 'Dites-moi votre niveau d\'expérience pour que je puisse vous conseiller au mieux !',
            options: {
                quickOptions: [
                    { action: 'set_beginner', icon: '🌱', text: 'Débutant' },
                    { action: 'set_intermediate', icon: '⚔️', text: 'Intermédiaire' },
                    { action: 'set_expert', icon: '👑', text: 'Expert' }
                ]
            }
        };
    }

    handleUnknownQuery(analysis, originalMessage) {
        // Tentative de correspondance partielle avec la base de connaissances
        const keywords = originalMessage.toLowerCase().split(' ');
        const allKnowledge = { ...this.knowledgeBase.products, ...this.knowledgeBase.jdr_advice };
        
        let bestMatch = null;
        let bestScore = 0;

        Object.entries(allKnowledge).forEach(([key, data]) => {
            const matches = keywords.filter(word => 
                data.keywords.some(keyword => keyword.includes(word) || word.includes(keyword))
            );
            const score = matches.length / keywords.length;
            
            if (score > bestScore && score > 0.2) {
                bestScore = score;
                bestMatch = data;
            }
        });

        if (bestMatch) {
            return {
                message: bestMatch.response,
                options: {
                    quickOptions: bestMatch.follow_up?.map(action => ({
                        action: action,
                        icon: this.getIconForAction(action),
                        text: this.getTextForAction(action)
                    })) || []
                }
            };
        }

        return {
            message: this.getRandomResponse('fallback'),
            options: {
                quickOptions: [
                    { action: 'product_advice', icon: '💰', text: 'Conseils produits' },
                    { action: 'jdr_tips', icon: '🎭', text: 'Conseils JDR' },
                    { action: 'contact_human', icon: '👨‍💼', text: 'Parler à un humain' }
                ]
            }
        };
    }

    handleQuickOption(action) {
        let response = { message: '', options: {} };

        switch (action) {
            case 'product_advice':
                response.message = 'Excellent ! Pour bien vous conseiller, parlez-moi de votre expérience JDR et du type de parties que vous menez.';
                response.options.quickOptions = [
                    { action: 'experience_check', icon: '⭐', text: 'Mon niveau' },
                    { action: 'party_info', icon: '👥', text: 'Mon groupe' },
                    { action: 'budget_help', icon: '💎', text: 'Mon budget' }
                ];
                break;

            case 'set_beginner':
                this.userProfile.experience = 'debutant';
                response.message = 'Parfait ! En tant que débutant, je recommande fortement de commencer par notre lot x10. Il est parfait pour découvrir l\'impact des pièces métalliques sans compliquer vos parties.';
                response.options.productRecommendation = this.responses.recommendations.starter;
                break;

            case 'set_intermediate':
                this.userProfile.experience = 'intermediaire';
                response.message = 'Excellent ! Avec votre expérience, la combinaison x10 + x100 sera parfaite. Vous couvrirez 95% des situations et impressionnerez vos joueurs !';
                response.options.productRecommendation = this.responses.recommendations.intermediate;
                break;

            case 'set_expert':
                this.userProfile.experience = 'expert';
                response.message = 'Fantastique ! En tant qu\'expert, vous apprécierez la flexibilité totale de notre gamme complète. Beaucoup de MJ expérimentés optent pour tous les multiplicateurs.';
                response.options.productRecommendation = this.responses.recommendations.complete;
                break;

            case 'budget_60':
                response.message = 'Parfait ! Avec 60$, le lot x10 est exactement ce qu\'il vous faut. C\'est le choix le plus populaire et il transformera déjà complètement vos parties !';
                response.options.productRecommendation = this.responses.recommendations.starter;
                break;

            case 'contact_human':
                response.message = 'Bien sûr ! Pour une assistance personnalisée, contactez notre équipe à info@geekndragon.com ou appelez-nous. Nous sommes des passionnés de JDR comme vous ! 🇨🇦';
                break;

            default:
                response.message = 'Intéressant ! Pouvez-vous m\'en dire plus sur ce que vous recherchez ?';
        }

        this.addBotMessage(response.message, response.options);
    }

    // Fonctions utilitaires
    updateUserProfile(analysis) {
        // Mise à jour intelligente du profil basée sur l'analyse
        const budgetEntity = analysis.entities.find(e => e.type === 'budget');
        if (budgetEntity) {
            this.userProfile.budget_range = budgetEntity.value;
        }

        const playerEntity = analysis.entities.find(e => e.type === 'player_count');
        if (playerEntity) {
            this.userProfile.party_size = playerEntity.value;
        }

        // Détection du rôle
        if (analysis.keywords.includes('mj')) {
            this.userProfile.role = 'mj';
        } else if (analysis.keywords.includes('joueur')) {
            this.userProfile.role = 'joueur';
        }

        // Sauvegarde locale pour persistance
        localStorage.setItem('jdr_chatbot_profile', JSON.stringify(this.userProfile));
    }

    getRecommendationBasedOnProfile() {
        let recommendation = this.responses.recommendations.starter;

        if (this.userProfile.experience === 'expert') {
            recommendation = this.responses.recommendations.complete;
        } else if (this.userProfile.experience === 'intermediaire') {
            recommendation = this.responses.recommendations.intermediate;
        }

        return {
            message: `Basé sur votre profil, voici ma recommandation : ${recommendation.reason}`,
            options: {
                productRecommendation: recommendation,
                quickOptions: [
                    { action: 'why_this_choice', icon: '❓', text: 'Pourquoi ce choix ?' },
                    { action: 'see_alternatives', icon: '🔄', text: 'Voir alternatives' },
                    { action: 'add_to_cart', icon: '🛒', text: 'Ajouter au panier' }
                ]
            }
        };
    }

    getRandomResponse(category) {
        const responses = this.responses[category];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getIconForAction(action) {
        const icons = {
            'experience_level': '⭐',
            'budget_discussion': '💎',
            'party_size': '👥',
            'campaign_type': '🗺️',
            'mj_or_player': '🎭',
            'first_session_tips': '🎯',
            'value_explanation': '💡',
            'contact_human': '👨‍💼'
        };
        return icons[action] || '💫';
    }

    getTextForAction(action) {
        const texts = {
            'experience_level': 'Mon niveau',
            'budget_discussion': 'Budget',
            'party_size': 'Taille groupe',
            'campaign_type': 'Type campagne',
            'mj_or_player': 'Mon rôle',
            'first_session_tips': 'Premiers conseils',
            'value_explanation': 'Pourquoi investir',
            'contact_human': 'Aide humaine'
        };
        return texts[action] || 'En savoir plus';
    }

    showTypingIndicator() {
        const typing = document.getElementById('chatbot-typing');
        typing.style.display = 'flex';
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typing = document.getElementById('chatbot-typing');
        typing.style.display = 'none';
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbot-messages');
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }

    focusInput() {
        setTimeout(() => {
            const input = document.getElementById('chatbot-input');
            input?.focus();
        }, 300);
    }

    getCurrentTime() {
        return new Date().toLocaleTimeString('fr-CA', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    hasInteracted() {
        return this.conversationHistory.length > 0 || this.isOpen;
    }

    showAutoPrompt(message) {
        const notification = document.getElementById('trigger-notification');
        if (notification && !this.hasInteracted()) {
            notification.querySelector('span').textContent = message;
            notification.classList.add('pulse');
            
            setTimeout(() => {
                notification.classList.remove('pulse');
            }, 3000);
        }
    }

    startAutoGreeting() {
        // Salutation automatique après 5 secondes si pas d'interaction
        setTimeout(() => {
            if (!this.hasInteracted()) {
                this.showAutoPrompt('Bonjour ! Des questions sur nos pièces ? 👋');
            }
        }, 5000);
    }

    // Analytics et tracking
    trackChatbotOpen() {
        if (window.gtag) {
            gtag('event', 'chatbot_open', {
                event_category: 'JDR Chatbot',
                event_label: 'Chatbot Opened',
                value: 1
            });
        }
    }

    trackChatbotClose() {
        const sessionLength = this.conversationHistory.length;
        if (window.gtag) {
            gtag('event', 'chatbot_close', {
                event_category: 'JDR Chatbot',
                event_label: 'Chatbot Closed',
                value: sessionLength
            });
        }
    }

    trackUserMessage(message, analysis) {
        if (window.gtag) {
            gtag('event', 'chatbot_user_message', {
                event_category: 'JDR Chatbot',
                event_label: analysis.intent,
                custom_parameters: {
                    message_length: message.length,
                    confidence: analysis.confidence,
                    user_experience: this.userProfile.experience
                }
            });
        }
    }

    injectChatbotStyles() {
        if (document.querySelector('#jdr-chatbot-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'jdr-chatbot-styles';
        styles.textContent = `
            .jdr-chatbot-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                font-family: 'Cinzel', serif;
            }

            .chatbot-trigger {
                position: relative;
                background: linear-gradient(145deg, #d4af37, #b8941f);
                border-radius: 50%;
                width: 60px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4);
                transition: all 0.3s ease;
                animation: float 3s ease-in-out infinite;
            }

            .chatbot-trigger:hover {
                transform: translateY(-5px) scale(1.05);
                box-shadow: 0 15px 35px rgba(212, 175, 55, 0.6);
            }

            .chatbot-trigger.hidden {
                opacity: 0;
                visibility: hidden;
                transform: scale(0.8);
            }

            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }

            .trigger-icon {
                color: #1a1008;
                font-size: 1.5rem;
                animation: spin 4s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .trigger-notification {
                position: absolute;
                bottom: 70px;
                right: 0;
                background: linear-gradient(145deg, #2a1810, #1a1008);
                border: 2px solid #d4af37;
                border-radius: 15px;
                padding: 0.8rem 1rem;
                white-space: nowrap;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                transform: translateY(10px);
            }

            .trigger-notification.pulse {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
                animation: gentle-pulse 2s ease-in-out infinite;
            }

            @keyframes gentle-pulse {
                0%, 100% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.3); }
                50% { box-shadow: 0 0 30px rgba(212, 175, 55, 0.6); }
            }

            .trigger-notification span {
                color: #d4af37;
                font-size: 0.9rem;
                font-weight: 600;
            }

            .chatbot-interface {
                position: absolute;
                bottom: 0;
                right: 0;
                width: 380px;
                height: 600px;
                background: linear-gradient(145deg, #2a1810, #1a1008);
                border: 2px solid #d4af37;
                border-radius: 20px 20px 0 0;
                display: flex;
                flex-direction: column;
                opacity: 0;
                visibility: hidden;
                transform: translateY(20px) scale(0.95);
                transition: all 0.3s ease;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }

            .chatbot-interface.active {
                opacity: 1;
                visibility: visible;
                transform: translateY(0) scale(1);
            }

            .chatbot-header {
                display: flex;
                align-items: center;
                padding: 1rem;
                border-bottom: 2px solid #8b7355;
                background: linear-gradient(145deg, #3a2420, #2a1810);
                border-radius: 18px 18px 0 0;
            }

            .chatbot-avatar {
                background: linear-gradient(145deg, #d4af37, #b8941f);
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 1rem;
            }

            .chatbot-avatar i {
                color: #1a1008;
                font-size: 1.2rem;
            }

            .chatbot-info h3 {
                color: #d4af37;
                margin: 0 0 0.2rem 0;
                font-size: 1.1rem;
                font-weight: 700;
            }

            .chatbot-status {
                color: #8b7355;
                font-size: 0.8rem;
                margin: 0;
            }

            .chatbot-close {
                margin-left: auto;
                background: none;
                border: none;
                color: #8b7355;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 50%;
                transition: all 0.3s ease;
            }

            .chatbot-close:hover {
                background: #8b7355;
                color: #1a1008;
            }

            .chatbot-messages {
                flex: 1;
                padding: 1rem;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 1rem;
                scrollbar-width: thin;
                scrollbar-color: #8b7355 transparent;
            }

            .chatbot-messages::-webkit-scrollbar {
                width: 6px;
            }

            .chatbot-messages::-webkit-scrollbar-track {
                background: transparent;
            }

            .chatbot-messages::-webkit-scrollbar-thumb {
                background: #8b7355;
                border-radius: 3px;
            }

            .message {
                display: flex;
                align-items: flex-start;
                gap: 0.8rem;
                animation: fadeInUp 0.3s ease;
            }

            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .message.user-message {
                justify-content: flex-end;
            }

            .message.user-message .message-content {
                background: linear-gradient(145deg, #d4af37, #b8941f);
                color: #1a1008;
                margin-left: 2rem;
            }

            .message.bot-message .message-content {
                background: rgba(139, 115, 85, 0.2);
                border: 1px solid #8b7355;
                color: #c9b037;
                margin-right: 2rem;
            }

            .message-content {
                padding: 0.8rem 1rem;
                border-radius: 15px;
                flex: 1;
                word-wrap: break-word;
            }

            .message-content p {
                margin: 0;
                line-height: 1.4;
            }

            .message-avatar {
                background: linear-gradient(145deg, #d4af37, #b8941f);
                border-radius: 50%;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }

            .message-avatar i {
                color: #1a1008;
                font-size: 0.9rem;
            }

            .message-time {
                font-size: 0.7rem;
                color: #8b7355;
                align-self: flex-end;
                margin-top: 0.3rem;
            }

            .quick-options {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                margin-top: 0.8rem;
            }

            .quick-option {
                background: rgba(212, 175, 55, 0.2);
                border: 1px solid #d4af37;
                color: #d4af37;
                padding: 0.4rem 0.8rem;
                border-radius: 20px;
                cursor: pointer;
                font-size: 0.8rem;
                font-weight: 600;
                transition: all 0.3s ease;
                white-space: nowrap;
            }

            .quick-option:hover {
                background: #d4af37;
                color: #1a1008;
                transform: translateY(-1px);
            }

            .product-recommendation {
                margin-top: 1rem;
                padding: 1rem;
                background: rgba(212, 175, 55, 0.1);
                border: 2px solid #d4af37;
                border-radius: 10px;
            }

            .product-recommendation h4 {
                color: #d4af37;
                margin: 0 0 0.8rem 0;
                font-size: 1rem;
            }

            .recommended-product h5 {
                color: #c9b037;
                margin: 0 0 0.5rem 0;
                font-size: 0.9rem;
            }

            .product-price {
                color: #d4af37;
                font-weight: 700;
                font-size: 1.1rem;
                margin: 0 0 0.5rem 0;
            }

            .product-reason {
                color: #8b7355;
                font-size: 0.8rem;
                margin: 0 0 0.8rem 0;
                line-height: 1.3;
            }

            .btn-view-product {
                display: inline-block;
                background: linear-gradient(145deg, #d4af37, #b8941f);
                color: #1a1008;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                text-decoration: none;
                font-size: 0.8rem;
                font-weight: 600;
                transition: all 0.3s ease;
            }

            .btn-view-product:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(212, 175, 55, 0.4);
            }

            .chatbot-input-area {
                padding: 1rem;
                border-top: 2px solid #8b7355;
                background: linear-gradient(145deg, #3a2420, #2a1810);
            }

            .input-container {
                display: flex;
                gap: 0.5rem;
                align-items: center;
            }

            #chatbot-input {
                flex: 1;
                background: rgba(139, 115, 85, 0.2);
                border: 2px solid #8b7355;
                color: #c9b037;
                padding: 0.8rem;
                border-radius: 25px;
                outline: none;
                font-family: inherit;
                font-size: 0.9rem;
                transition: all 0.3s ease;
            }

            #chatbot-input:focus {
                border-color: #d4af37;
                box-shadow: 0 0 15px rgba(212, 175, 55, 0.3);
            }

            #chatbot-input::placeholder {
                color: #8b7355;
            }

            #chatbot-send {
                background: linear-gradient(145deg, #d4af37, #b8941f);
                border: none;
                color: #1a1008;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }

            #chatbot-send:hover {
                transform: scale(1.1);
                box-shadow: 0 5px 15px rgba(212, 175, 55, 0.4);
            }

            .chatbot-typing {
                display: none;
                justify-content: center;
                gap: 0.3rem;
                margin-top: 0.5rem;
                padding: 0.5rem;
            }

            .chatbot-typing span {
                width: 8px;
                height: 8px;
                background: #d4af37;
                border-radius: 50%;
                animation: typing-bounce 1.4s ease-in-out infinite;
            }

            .chatbot-typing span:nth-child(2) {
                animation-delay: 0.2s;
            }

            .chatbot-typing span:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes typing-bounce {
                0%, 60%, 100% {
                    transform: translateY(0);
                    opacity: 0.5;
                }
                30% {
                    transform: translateY(-10px);
                    opacity: 1;
                }
            }

            .chatbot-footer {
                padding: 0.5rem 1rem;
                text-align: center;
                border-top: 1px solid #8b7355;
                background: rgba(139, 115, 85, 0.1);
            }

            .chatbot-footer p {
                color: #8b7355;
                font-size: 0.7rem;
                margin: 0;
            }

            .welcome-message {
                background: rgba(212, 175, 55, 0.1);
                border: 2px solid #d4af37;
                border-radius: 15px;
                padding: 1rem;
                margin-bottom: 1rem;
            }

            /* Responsive */
            @media (max-width: 480px) {
                .chatbot-interface {
                    width: calc(100vw - 40px);
                    height: calc(100vh - 100px);
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                }

                .trigger-notification {
                    display: none;
                }

                .chatbot-trigger {
                    bottom: 80px;
                }
            }
        `;

        document.head.appendChild(styles);
    }
}

// Initialisation globale
window.jdrChatbot = new JDRChatbot();

// Export pour les modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JDRChatbot;
}