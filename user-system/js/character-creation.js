/**
 * Système de Création de Personnage D&D - Geek&Dragon
 * Interface interactive pour la création de compte avec profil D&D
 */

class CharacterCreation {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 6;
        this.characterData = {
            email: '',
            password: '',
            nom_aventurier: '',
            niveau: 1,
            espece: '',
            classe: '',
            historique: '',
            style_jeu: '',
            experience_jeu: '',
            campagnes_preferees: ''
        };
        this.dndData = null;
        this.productCatalog = {
            'lot10': {
                title: "L'Offrande du Voyageur",
                baseReason: 'Kit de pièces polyvalent pour démarrer vos quêtes',
                score: 82
            },
            'lot25': {
                title: 'La Monnaie des Cinq Royaumes',
                baseReason: 'Trésor conséquent pour aventuriers accomplis',
                score: 84
            },
            'lot50-essence': {
                title: "L'Essence du Marchand",
                baseReason: 'Coffret prestigieux inspiré des marchés draconiques',
                score: 90
            },
            'pack-182-arsenal-aventurier': {
                title: "Arsenal de l'Aventurier",
                baseReason: "Cartes d'équipement offensif et défensif",
                score: 92
            },
            'pack-182-butins-ingenieries': {
                title: 'Butins & Ingénieries',
                baseReason: 'Sélection arcanique et gadgets ingénieux',
                score: 88
            },
            'pack-182-routes-services': {
                title: 'Routes & Services',
                baseReason: 'Services et cartes utilitaires pour explorateurs',
                score: 86
            },
            'triptyque-aleatoire': {
                title: 'Triptyques Mystères - Origines Complètes',
                baseReason: 'Tirages thématiques pour forger de nouvelles origines',
                score: 75
            }
        };

        this.init();
    }

    /**
     * Initialisation du système
     */
    async init() {
        await this.loadDndData();
        this.setupEventListeners();
        this.updateStepDisplay();
        this.updateNavigationButtons();
    }

    /**
     * Chargement des données D&D depuis la base
     */
    async loadDndData() {
        try {
            const response = await fetch('/api/account/dnd-config');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const payload = await response.json();
            if (payload?.success && payload.data) {
                this.dndData = payload.data;
            } else {
                throw new Error('Réponse de configuration invalide');
            }
        } catch (error) {
            console.warn('Impossible de charger la configuration D&D depuis l\'API:', error);
            this.dndData = this.getFallbackDndData();
        }

        this.populateSelections();
    }

    getFallbackDndData() {
        return {
            especes: [
                {
                    nom: 'Aasimar',
                    description: "Descendants célestes, porteurs d'une lumière protectrice",
                    traits: { bonus: 'Charisme +2', trait: 'Lueur divine' },
                    recommandations: ['triptyque-aleatoire', 'pack-182-routes-services']
                },
                {
                    nom: 'Drakéide',
                    description: 'Descendants de dragons, fiers et puissants',
                    traits: { bonus: 'Force +2', trait: 'Souffle draconique' },
                    recommandations: ['lot50-essence', 'pack-182-arsenal-aventurier']
                },
                {
                    nom: 'Elfe',
                    description: 'Gracieux et connectés aux arcanes et à la nature',
                    traits: { bonus: 'Dextérité +2', trait: 'Vision dans le noir' },
                    recommandations: ['pack-182-routes-services', 'pack-182-butins-ingenieries']
                },
                {
                    nom: 'Demi-Elfe',
                    description: 'Entre deux mondes, charismatiques et adaptables',
                    traits: { bonus: 'Charisme +2', trait: 'Polyvalence elfique' },
                    recommandations: ['pack-182-butins-ingenieries', 'triptyque-aleatoire']
                },
                {
                    nom: 'Demi-Orc',
                    description: "Robustes et tenaces, forgés par l'adversité",
                    traits: { bonus: 'Force +2', trait: 'Endurance implacable' },
                    recommandations: ['pack-182-arsenal-aventurier', 'lot25']
                },
                {
                    nom: 'Gnome',
                    description: 'Inventifs, curieux et animés par la magie',
                    traits: { bonus: 'Intelligence +2', trait: 'Ruse gnome' },
                    recommandations: ['pack-182-butins-ingenieries', 'triptyque-aleatoire']
                },
                {
                    nom: 'Halfelin',
                    description: 'Petits mais courageux, chanceux et débrouillards',
                    traits: { bonus: 'Dextérité +2', trait: 'Chanceux' },
                    recommandations: ['lot10', 'triptyque-aleatoire']
                },
                {
                    nom: 'Humain',
                    description: 'Polyvalents et ambitieux, experts dans tous les domaines',
                    traits: { bonus: 'Polyvalence', trait: 'Adaptation rapide' },
                    recommandations: ['lot10', 'triptyque-aleatoire']
                },
                {
                    nom: 'Nain',
                    description: 'Robustes et déterminés, maîtres artisans et guerriers',
                    traits: { bonus: 'Constitution +2', trait: 'Résistance au poison' },
                    recommandations: ['lot25', 'pack-182-arsenal-aventurier']
                },
                {
                    nom: 'Tieffelin',
                    description: 'Héritiers infernaux, mystérieux et charismatiques',
                    traits: { bonus: 'Charisme +2', trait: 'Héritage infernal' },
                    recommandations: ['pack-182-butins-ingenieries', 'triptyque-aleatoire']
                }
            ],
            classes: [
                {
                    nom: 'Barbare',
                    description: 'Guerrier sauvage porté par une rage primale',
                    traits: { role: 'DPS/Tank', HD: 'd12' },
                    recommandations: ['pack-182-arsenal-aventurier', 'lot50-essence']
                },
                {
                    nom: 'Barde',
                    description: 'Artiste inspirant mêlant magie et musique',
                    traits: { role: 'Support/Contrôle', HD: 'd8' },
                    recommandations: ['pack-182-butins-ingenieries', 'triptyque-aleatoire']
                },
                {
                    nom: 'Clerc',
                    description: 'Serviteur divin, guérisseur et protecteur',
                    traits: { role: 'Soutien/Guérison', HD: 'd8' },
                    recommandations: ['pack-182-routes-services', 'triptyque-aleatoire']
                },
                {
                    nom: 'Druide',
                    description: 'Gardien de la nature capable de métamorphose',
                    traits: { role: 'Soutien/Nature', HD: 'd8' },
                    recommandations: ['pack-182-routes-services', 'triptyque-aleatoire']
                },
                {
                    nom: 'Ensorceleur',
                    description: 'Canalise une magie innée et dévastatrice',
                    traits: { role: 'DPS/Contrôleur', HD: 'd6' },
                    recommandations: ['pack-182-butins-ingenieries', 'triptyque-aleatoire']
                },
                {
                    nom: 'Guerrier',
                    description: 'Maître des armes et des tactiques martiales',
                    traits: { role: 'Tank/DPS', HD: 'd10' },
                    recommandations: ['pack-182-arsenal-aventurier', 'lot25']
                },
                {
                    nom: 'Magicien',
                    description: 'Érudit des arcanes et stratège de la magie',
                    traits: { role: 'Contrôleur/DPS', HD: 'd6' },
                    recommandations: ['pack-182-butins-ingenieries', 'triptyque-aleatoire']
                },
                {
                    nom: 'Moine',
                    description: 'Artiste martial en quête de perfection intérieure',
                    traits: { role: 'DPS/Utilitaire', HD: 'd8' },
                    recommandations: ['pack-182-arsenal-aventurier', 'pack-182-routes-services']
                },
                {
                    nom: 'Occultiste',
                    description: 'Tisse des pactes mystérieux pour puiser sa magie',
                    traits: { role: 'DPS/Support', HD: 'd8' },
                    recommandations: ['triptyque-aleatoire', 'pack-182-butins-ingenieries']
                },
                {
                    nom: 'Paladin',
                    description: 'Champion sacré alliant foi et épée',
                    traits: { role: 'Tank/Soutien', HD: 'd10' },
                    recommandations: ['lot50-essence', 'pack-182-routes-services']
                },
                {
                    nom: 'Rôdeur',
                    description: 'Protecteur des contrées sauvages et pisteur expert',
                    traits: { role: 'DPS/Explorateur', HD: 'd10' },
                    recommandations: ['pack-182-routes-services', 'lot10']
                },
                {
                    nom: 'Roublard',
                    description: 'Spécialiste de la discrétion et des attaques précises',
                    traits: { role: 'DPS/Subtilité', HD: 'd8' },
                    recommandations: ['pack-182-butins-ingenieries', 'lot10']
                }
            ],
            historiques: [
                {
                    nom: 'Acolyte',
                    description: "Serviteur d'un temple, proche du divin",
                    traits: { competences: 'Religion, Perspicacité' },
                    recommandations: ['pack-182-routes-services', 'triptyque-aleatoire']
                },
                {
                    nom: 'Artisan',
                    description: "Maître d'un atelier ou membre d'une confrérie artisanale",
                    traits: { competences: 'Perspicacité, Artisanat' },
                    recommandations: ['lot25', 'pack-182-butins-ingenieries']
                },
                {
                    nom: 'Charlatan',
                    description: 'Escroc charmeur toujours prêt à une nouvelle combine',
                    traits: { competences: 'Tromperie, Escamotage' },
                    recommandations: ['pack-182-butins-ingenieries', 'triptyque-aleatoire']
                },
                {
                    nom: 'Criminel',
                    description: "Vécu dans l'ombre entre filouteries et opérations clandestines",
                    traits: { competences: 'Discrétion, Intimidation' },
                    recommandations: ['pack-182-butins-ingenieries', 'lot10']
                },
                {
                    nom: 'Ermite',
                    description: 'Retiré du monde pour méditer et étudier en solitude',
                    traits: { competences: 'Médecine, Religion' },
                    recommandations: ['triptyque-aleatoire', 'pack-182-routes-services']
                },
                {
                    nom: 'Explorateur',
                    description: 'A parcouru territoires sauvages et ruines oubliées',
                    traits: { competences: 'Survie, Athlétisme' },
                    recommandations: ['pack-182-routes-services', 'lot10']
                },
                {
                    nom: 'Héros du Peuple',
                    description: 'Protecteur des communautés et symbole d\'espoir',
                    traits: { competences: 'Dressage, Survie' },
                    recommandations: ['lot10', 'triptyque-aleatoire']
                },
                {
                    nom: 'Marin',
                    description: 'Vie passée en mer entre cordages et embruns',
                    traits: { competences: 'Athlétisme, Perception' },
                    recommandations: ['pack-182-routes-services', 'lot10']
                },
                {
                    nom: 'Noble',
                    description: 'Élevé dans le luxe et rompu aux intrigues politiques',
                    traits: { competences: 'Histoire, Persuasion' },
                    recommandations: ['lot50-essence', 'triptyque-aleatoire']
                },
                {
                    nom: 'Sage',
                    description: 'Chercheur infatigable avide de connaissances',
                    traits: { competences: 'Arcanes, Histoire' },
                    recommandations: ['pack-182-butins-ingenieries', 'triptyque-aleatoire']
                },
                {
                    nom: 'Soldat',
                    description: 'Combattant discipliné formé à la guerre et aux tactiques',
                    traits: { competences: 'Athlétisme, Intimidation' },
                    recommandations: ['pack-182-arsenal-aventurier', 'lot25']
                },
                {
                    nom: 'Vagabond',
                    description: 'A grandi dans les rues en développant débrouillardise et survie',
                    traits: { competences: 'Discrétion, Survie' },
                    recommandations: ['lot10', 'pack-182-routes-services']
                }
            ]
        };
    }

    /**
     * Récupère le titre lisible d'un produit à partir de son identifiant
     */
    resolveProductTitle(productId) {
        const product = this.productCatalog?.[productId];
        return product?.title ?? productId;
    }

    /**
     * Formate la liste des recommandations produit pour les fiches descriptives
     */
    formatRecommendationList(recommandations) {
        if (!Array.isArray(recommandations) || recommandations.length === 0) {
            return '—';
        }

        return recommandations
            .map(code => this.resolveProductTitle(code))
            .join(', ');
    }

    /**
     * Remplissage des sélections avec les données D&D
     */
    populateSelections() {
        // Espèces
        const especeContainer = document.querySelector('.espece-options');
        if (especeContainer && this.dndData?.especes) {
            especeContainer.innerHTML = this.dndData.especes.map(espece => `
                <div class="dnd-option" data-value="${espece.nom}">
                    <div class="option-header">
                        <h4>${espece.nom}</h4>
                        <span class="option-traits">${espece.traits.bonus}</span>
                    </div>
                    <p class="option-description">${espece.description}</p>
                    <div class="option-recommendations">
                        <small>Recommandé : ${this.formatRecommendationList(espece.recommandations)}</small>
                    </div>
                </div>
            `).join('');
        }

        // Classes
        const classeContainer = document.querySelector('.classe-options');
        if (classeContainer && this.dndData?.classes) {
            classeContainer.innerHTML = this.dndData.classes.map(classe => `
                <div class="dnd-option" data-value="${classe.nom}">
                    <div class="option-header">
                        <h4>${classe.nom}</h4>
                        <span class="option-traits">${classe.traits.role}</span>
                    </div>
                    <p class="option-description">${classe.description}</p>
                    <div class="option-recommendations">
                        <small>Recommandé : ${this.formatRecommendationList(classe.recommandations)}</small>
                    </div>
                </div>
            `).join('');
        }

        // Historiques
        const historique = document.querySelector('.historique-options');
        if (historique && this.dndData?.historiques) {
            historique.innerHTML = this.dndData.historiques.map(historique => `
                <div class="dnd-option" data-value="${historique.nom}">
                    <div class="option-header">
                        <h4>${historique.nom}</h4>
                        <span class="option-traits">${historique.traits.competences}</span>
                    </div>
                    <p class="option-description">${historique.description}</p>
                    <div class="option-recommendations">
                        <small>Recommandé : ${this.formatRecommendationList(historique.recommandations)}</small>
                    </div>
                </div>
            `).join('');
        }

        // Ajout des event listeners pour les sélections
        this.setupSelectionListeners();
    }

    /**
     * Configuration des event listeners
     */
    setupEventListeners() {
        // Boutons de navigation
        const nextBtn = document.getElementById('next-step');
        const prevBtn = document.getElementById('prev-step');
        const submitBtn = document.getElementById('submit-character');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevStep());
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => this.submitCharacter(e));
        }

        // Validation en temps réel
        this.setupFormValidation();
    }

    /**
     * Configuration des listeners pour les sélections D&D
     */
    setupSelectionListeners() {
        // Sélection d'espèce
        document.querySelectorAll('.espece-options .dnd-option').forEach(option => {
            option.addEventListener('click', () => {
                this.selectOption('espece', option);
            });
        });

        // Sélection de classe
        document.querySelectorAll('.classe-options .dnd-option').forEach(option => {
            option.addEventListener('click', () => {
                this.selectOption('classe', option);
            });
        });

        // Sélection d'historique
        document.querySelectorAll('.historique-options .dnd-option').forEach(option => {
            option.addEventListener('click', () => {
                this.selectOption('historique', option);
            });
        });
    }

    /**
     * Gestion de la sélection d'une option D&D
     */
    selectOption(type, optionElement) {
        // Retirer la sélection précédente
        const container = optionElement.closest('.step-content').querySelector(`.${type}-options`);
        container.querySelectorAll('.dnd-option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // Ajouter la nouvelle sélection
        optionElement.classList.add('selected');
        this.characterData[type] = optionElement.dataset.value;

        // Mettre à jour l'aperçu si on est à l'étape finale
        if (this.currentStep === 6) {
            this.updatePreview();
        }

        // Valider l'étape actuelle
        this.validateCurrentStep();
    }

    /**
     * Validation du formulaire en temps réel
     */
    setupFormValidation() {
        // Email
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('input', (e) => {
                const emailValue = e.target.value.trim();
                this.characterData.email = emailValue;
                this.validateEmail(emailValue);
            });
        }

        // Mot de passe
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                this.characterData.password = e.target.value;
                this.validatePassword(e.target.value);
            });
        }

        // Nom d'aventurier
        const nameInput = document.getElementById('nom_aventurier');
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                const nameValue = e.target.value.trim();
                this.characterData.nom_aventurier = nameValue;
                this.validateName(nameValue);
            });
        }

        // Niveau
        const levelInput = document.getElementById('niveau');
        if (levelInput) {
            levelInput.addEventListener('input', (e) => {
                this.characterData.niveau = parseInt(e.target.value) || 1;
            });
        }

        // Préférences de jeu
        const styleInputs = document.querySelectorAll('input[name="style_jeu"]');
        styleInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.characterData.style_jeu = e.target.value;
                }
            });
        });

        const experienceInputs = document.querySelectorAll('input[name="experience_jeu"]');
        experienceInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.characterData.experience_jeu = e.target.value;
                }
            });
        });

        const campagnesInputs = document.querySelectorAll('input[name="campagnes_preferees"]');
        campagnesInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.characterData.campagnes_preferees = e.target.value;
                }
            });
        });
    }

    /**
     * Validation de l'email
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);
        
        const input = document.getElementById('email');
        const feedback = input.parentNode.querySelector('.validation-feedback');
        
        if (feedback) {
            if (isValid) {
                feedback.textContent = '✓ Email valide';
                feedback.className = 'validation-feedback valid';
                input.classList.remove('invalid');
                input.classList.add('valid');
            } else {
                feedback.textContent = '✗ Format d\'email invalide';
                feedback.className = 'validation-feedback invalid';
                input.classList.remove('valid');
                input.classList.add('invalid');
            }
        }
        
        return isValid;
    }

    /**
     * Validation du mot de passe
     */
    validatePassword(password) {
        const minLength = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        
        const isValid = minLength && hasUpper && hasLower && hasNumber;
        
        const input = document.getElementById('password');
        const feedback = input.parentNode.querySelector('.validation-feedback');
        
        if (feedback) {
            if (isValid) {
                feedback.textContent = '✓ Mot de passe sécurisé';
                feedback.className = 'validation-feedback valid';
                input.classList.remove('invalid');
                input.classList.add('valid');
            } else {
                feedback.textContent = '✗ 8+ caractères, majuscule, minuscule, chiffre requis';
                feedback.className = 'validation-feedback invalid';
                input.classList.remove('valid');
                input.classList.add('invalid');
            }
        }
        
        return isValid;
    }

    /**
     * Validation du nom d'aventurier
     */
    validateName(name) {
        const isValid = name.length >= 2 && name.length <= 50;
        
        const input = document.getElementById('nom_aventurier');
        const feedback = input.parentNode.querySelector('.validation-feedback');
        
        if (feedback) {
            if (isValid) {
                feedback.textContent = '✓ Nom valide';
                feedback.className = 'validation-feedback valid';
                input.classList.remove('invalid');
                input.classList.add('valid');
            } else {
                feedback.textContent = '✗ Entre 2 et 50 caractères requis';
                feedback.className = 'validation-feedback invalid';
                input.classList.remove('valid');
                input.classList.add('invalid');
            }
        }
        
        return isValid;
    }

    /**
     * Validation de l'étape actuelle
     */
    validateCurrentStep() {
        let isValid = false;

        switch (this.currentStep) {
            case 1: // Informations de base
                isValid = this.validateEmail(this.characterData.email) && 
                         this.validatePassword(this.characterData.password) && 
                         this.validateName(this.characterData.nom_aventurier);
                break;
            case 2: // Espèce
                isValid = this.characterData.espece !== '';
                break;
            case 3: // Classe
                isValid = this.characterData.classe !== '';
                break;
            case 4: // Historique
                isValid = this.characterData.historique !== '';
                break;
            case 5: // Préférences
                isValid = this.characterData.style_jeu !== '' && 
                         this.characterData.experience_jeu !== '' && 
                         this.characterData.campagnes_preferees !== '';
                break;
            case 6: // Aperçu
                isValid = true; // Toujours valide à cette étape
                break;
        }

        this.updateNavigationButtons(isValid);
        return isValid;
    }

    /**
     * Passage à l'étape suivante
     */
    nextStep() {
        if (this.validateCurrentStep() && this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateStepDisplay();
            this.updateNavigationButtons();
            
            if (this.currentStep === 6) {
                this.updatePreview();
            }
        }
    }

    /**
     * Retour à l'étape précédente
     */
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
            this.updateNavigationButtons();
        }
    }

    /**
     * Mise à jour de l'affichage des étapes
     */
    updateStepDisplay() {
        // Masquer toutes les étapes
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });

        // Afficher l'étape actuelle
        const currentStepElement = document.querySelector(`.step[data-step="${this.currentStep}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }

        // Mettre à jour l'indicateur de progression
        document.querySelectorAll('.step-indicator .step-dot').forEach((dot, index) => {
            dot.classList.remove('active', 'completed');
            if (index + 1 < this.currentStep) {
                dot.classList.add('completed');
            } else if (index + 1 === this.currentStep) {
                dot.classList.add('active');
            }
        });

        // Mettre à jour le titre de l'étape
        const stepTitles = [
            'Informations de Base',
            'Choix de votre Espèce',
            'Sélection de votre Classe',
            'Définition de votre Historique',
            'Préférences de Jeu',
            'Aperçu de votre Aventurier'
        ];
        
        const titleElement = document.querySelector('.step-title');
        if (titleElement) {
            titleElement.textContent = stepTitles[this.currentStep - 1];
        }
    }

    /**
     * Mise à jour des boutons de navigation
     */
    updateNavigationButtons(stepValid = null) {
        const nextBtn = document.getElementById('next-step');
        const prevBtn = document.getElementById('prev-step');
        const submitBtn = document.getElementById('submit-character');

        // Valider l'étape si pas déjà fait
        if (stepValid === null) {
            stepValid = this.validateCurrentStep();
        }

        // Bouton précédent
        if (prevBtn) {
            prevBtn.style.display = this.currentStep > 1 ? 'inline-block' : 'none';
        }

        // Bouton suivant
        if (nextBtn) {
            if (this.currentStep < this.totalSteps) {
                nextBtn.style.display = 'inline-block';
                nextBtn.disabled = !stepValid;
                nextBtn.classList.toggle('disabled', !stepValid);
            } else {
                nextBtn.style.display = 'none';
            }
        }

        // Bouton de soumission
        if (submitBtn) {
            if (this.currentStep === this.totalSteps) {
                submitBtn.style.display = 'inline-block';
                submitBtn.disabled = !stepValid;
                submitBtn.classList.toggle('disabled', !stepValid);
            } else {
                submitBtn.style.display = 'none';
            }
        }
    }

    /**
     * Mise à jour de l'aperçu du personnage
     */
    updatePreview() {
        const preview = document.getElementById('character-preview');
        if (!preview) return;

        // Données du personnage
        const caracterData = this.getSelectedCharacterTraits();
        
        // Génération des recommandations
        const recommendations = this.generateRecommendations();

        preview.innerHTML = `
            <div class="character-summary">
                <h3>🧙‍♂️ ${this.characterData.nom_aventurier}</h3>
                <div class="character-details">
                    <div class="detail-row">
                        <span class="label">Espèce :</span>
                        <span class="value">${this.characterData.espece}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Classe :</span>
                        <span class="value">${this.characterData.classe}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Historique :</span>
                        <span class="value">${this.characterData.historique}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Niveau :</span>
                        <span class="value">${this.characterData.niveau}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Style de jeu :</span>
                        <span class="value">${this.characterData.style_jeu}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Expérience :</span>
                        <span class="value">${this.characterData.experience_jeu}</span>
                    </div>
                </div>
            </div>

            <div class="character-traits">
                <h4>✨ Traits Combinés</h4>
                <div class="traits-grid">
                    ${caracterData.traits.map(trait => `
                        <div class="trait-item">
                            <strong>${trait.type} :</strong> ${trait.valeur}
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="recommendations-preview">
                <h4>🎯 Recommandations Personnalisées</h4>
                <div class="recommendations-grid">
                    ${recommendations.map(rec => `
                        <div class="recommendation-item">
                            <h5>${rec.titre}</h5>
                            <p class="rec-reason">${rec.raison}</p>
                            <span class="rec-score">Compatibilité : ${rec.score}%</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Récupération des traits combinés du personnage
     */
    getSelectedCharacterTraits() {
        const traits = [];
        
        if (this.dndData) {
            // Traits d'espèce
            const espece = this.dndData.especes.find(e => e.nom === this.characterData.espece);
            if (espece) {
                traits.push({ type: 'Espèce - Bonus', valeur: espece.traits.bonus });
                traits.push({ type: 'Espèce - Trait', valeur: espece.traits.trait });
            }

            // Traits de classe
            const classe = this.dndData.classes.find(c => c.nom === this.characterData.classe);
            if (classe) {
                traits.push({ type: 'Classe - Rôle', valeur: classe.traits.role });
                traits.push({ type: 'Classe - Dé de Vie', valeur: classe.traits.HD });
            }

            // Traits d'historique
            const historique = this.dndData.historiques.find(h => h.nom === this.characterData.historique);
            if (historique) {
                traits.push({ type: 'Historique - Compétences', valeur: historique.traits.competences });
            }
        }

        return { traits };
    }

    /**
     * Génération des recommandations basées sur le profil
     */
    buildContextReason(type, nom) {
        switch (type) {
            case 'espece':
                return `Harmonisé avec votre espèce ${nom}`;
            case 'classe':
                return `Optimisé pour votre classe de ${nom}`;
            case 'historique':
                return `Adapté à votre historique ${nom}`;
            default:
                return 'Suggestion thématique';
        }
    }

    /**
     * Génère des recommandations harmonisées entre front et back-office
     */
    generateRecommendations() {
        if (!this.dndData) {
            return [];
        }

        const selections = {
            espece: this.dndData.especes.find(e => e.nom === this.characterData.espece),
            classe: this.dndData.classes.find(c => c.nom === this.characterData.classe),
            historique: this.dndData.historiques.find(h => h.nom === this.characterData.historique)
        };

        const aggregated = {};
        const contexts = [
            { type: 'espece', selection: selections.espece },
            { type: 'classe', selection: selections.classe },
            { type: 'historique', selection: selections.historique }
        ];

        contexts.forEach(({ type, selection }) => {
            if (!selection) {
                return;
            }

            const recommandations = Array.isArray(selection.recommandations) ? selection.recommandations : [];
            recommandations.forEach((code, index) => {
                const product = this.productCatalog?.[code];
                if (!product) {
                    return;
                }

                const contextReason = this.buildContextReason(type, selection.nom);
                const reasonBase = product.baseReason ?? '';
                const reason = reasonBase ? `${reasonBase} — ${contextReason}` : contextReason;
                const baseScore = Number.isFinite(product.score) ? product.score : 75;
                const scoreBoost = Math.max(0, 10 - index * 3);
                const computedScore = Math.min(100, Math.round(baseScore + scoreBoost));

                if (!aggregated[code]) {
                    aggregated[code] = {
                        titre: product.title,
                        raison: reason,
                        score: computedScore
                    };
                } else {
                    aggregated[code].score = Math.min(100, aggregated[code].score + 5);
                    aggregated[code].raison += ` + ${contextReason.toLowerCase()}`;
                }
            });
        });

        if (!aggregated['triptyque-aleatoire'] && this.productCatalog?.['triptyque-aleatoire']) {
            const fallback = this.productCatalog['triptyque-aleatoire'];
            aggregated['triptyque-aleatoire'] = {
                titre: fallback.title,
                raison: `${fallback.baseReason} — compatible avec toutes les combinaisons`,
                score: Math.min(100, Math.round(fallback.score ?? 75))
            };
        }

        return Object.values(aggregated)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
    }

    /**
     * Soumission du formulaire de création de personnage
     */
    async submitCharacter(e) {
        e.preventDefault();
        
        if (!this.validateCurrentStep()) {
            return;
        }

        try {
            // Affichage du loading
            const submitBtn = document.getElementById('submit-character');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Création en cours...';
            submitBtn.disabled = true;

            // Préparation des données pour l'envoi
            const formData = {
                ...this.characterData,
                email: this.characterData.email.trim(),
                nom_aventurier: this.characterData.nom_aventurier.trim(),
                password: this.characterData.password
            };
            
            // Appel API d'inscription
            const response = await fetch('api/register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Erreur lors de la création du compte');
            }

            // Succès - afficher un message et rediriger
            this.showSuccessMessage(result);
            
            // Redirection après un délai
            setTimeout(() => {
                window.location.href = '../compte.php';
            }, 3000);

        } catch (error) {
            console.error('Erreur lors de la création du compte:', error);
            this.showErrorMessage(error.message);
            
            // Restaurer le bouton
            const submitBtn = document.getElementById('submit-character');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    /**
     * Affiche un message de succès
     */
    showSuccessMessage(result) {
        const container = document.querySelector('.creation-form');
        const successDiv = document.createElement('div');
        successDiv.className = 'alert alert-success';
        successDiv.style.cssText = `
            background: rgba(34, 197, 94, 0.1);
            border: 2px solid rgba(34, 197, 94, 0.3);
            color: #22c55e;
            padding: 1.5rem;
            border-radius: var(--border-radius);
            margin-bottom: 2rem;
            text-align: center;
            animation: fadeIn 0.5s ease-in-out;
        `;
        
        successDiv.innerHTML = `
            <h3 style="margin: 0 0 1rem 0; color: #22c55e;">🎉 Aventurier créé avec succès !</h3>
            <p style="margin: 0 0 1rem 0;">Bienvenue dans l'univers Geek&Dragon, <strong>${result.adventurer_name}</strong> !</p>
            <p style="margin: 0; font-size: 0.9rem; opacity: 0.8;">Redirection en cours vers votre espace personnel...</p>
        `;
        
        container.insertBefore(successDiv, container.firstChild);
        
        // Masquer le formulaire
        document.querySelector('form').style.display = 'none';
    }

    /**
     * Affiche un message d'erreur
     */
    showErrorMessage(message) {
        const container = document.querySelector('.creation-form');
        
        // Supprimer l'ancien message d'erreur s'il existe
        const existingError = container.querySelector('.alert-error');
        if (existingError) {
            existingError.remove();
        }
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-error';
        errorDiv.style.cssText = `
            background: rgba(239, 68, 68, 0.1);
            border: 2px solid rgba(239, 68, 68, 0.3);
            color: #ef4444;
            padding: 1.5rem;
            border-radius: var(--border-radius);
            margin-bottom: 2rem;
            text-align: center;
            animation: fadeIn 0.5s ease-in-out;
        `;
        
        errorDiv.innerHTML = `
            <h4 style="margin: 0 0 0.5rem 0; color: #ef4444;">❌ Erreur</h4>
            <p style="margin: 0;">${message}</p>
        `;
        
        container.insertBefore(errorDiv, container.firstChild);
        
        // Auto-suppression après 5 secondes
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }
}

// Initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new CharacterCreation();
});

// Gestion de la navigation clavier
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Retour à l'étape précédente avec Escape
        const characterCreation = window.characterCreation;
        if (characterCreation && characterCreation.currentStep > 1) {
            characterCreation.prevStep();
        }
    }
});

// Export pour usage global si nécessaire
window.CharacterCreation = CharacterCreation;