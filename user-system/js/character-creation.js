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
            // Simulation des données D&D - à remplacer par un appel API réel
            this.dndData = {
                especes: [
                    {
                        nom: 'Humain',
                        description: 'Polyvalents et ambitieux, les humains excellent dans tous les domaines',
                        traits: { bonus: 'Polyvalence', trait: 'Adaptation' },
                        recommandations: ['pieces', 'cartes', 'triptyques']
                    },
                    {
                        nom: 'Elfe',
                        description: 'Gracieux et magiques, connectés à la nature et aux arcanes',
                        traits: { bonus: 'Dextérité +2', trait: 'Vision dans le noir' },
                        recommandations: ['pieces', 'bijoux_elfiques', 'cartes_nature']
                    },
                    {
                        nom: 'Nain',
                        description: 'Robustes et déterminés, maîtres de la forge et de la guerre',
                        traits: { bonus: 'Constitution +2', trait: 'Résistance poison' },
                        recommandations: ['pieces_metal', 'armes', 'cartes_combat']
                    },
                    {
                        nom: 'Halfelin',
                        description: 'Petits mais courageux, chanceux et pleins de ressources',
                        traits: { bonus: 'Dextérité +2', trait: 'Chanceux' },
                        recommandations: ['pieces', 'cartes_voyage', 'equipement_discret']
                    },
                    {
                        nom: 'Drakéide',
                        description: 'Descendants de dragons, fiers et puissants',
                        traits: { bonus: 'Force +2', trait: 'Souffle de dragon' },
                        recommandations: ['pieces_precieuses', 'bijoux_dragon', 'cartes_combat']
                    }
                ],
                classes: [
                    {
                        nom: 'Guerrier',
                        description: 'Maître des armes et du combat, protecteur redoutable',
                        traits: { role: 'Tank/DPS', HD: 'd10' },
                        recommandations: ['cartes_armes', 'cartes_armures', 'pieces_metal']
                    },
                    {
                        nom: 'Magicien',
                        description: 'Érudit des arcanes, manipulateur de la magie pure',
                        traits: { role: 'Contrôleur/DPS', HD: 'd6' },
                        recommandations: ['cartes_magie', 'bijoux_arcanes', 'pieces_rares']
                    },
                    {
                        nom: 'Roublard',
                        description: 'Expert en discrétion et en techniques sournoises',
                        traits: { role: 'DPS/Utilitaire', HD: 'd8' },
                        recommandations: ['cartes_outils', 'equipement_discret', 'pieces']
                    },
                    {
                        nom: 'Clerc',
                        description: 'Serviteur divin, guérisseur et protecteur',
                        traits: { role: 'Heal/Support', HD: 'd8' },
                        recommandations: ['bijoux_divins', 'cartes_sacrees', 'pieces_benedites']
                    },
                    {
                        nom: 'Rôdeur',
                        description: 'Gardien des contrées sauvages, traqueur expert',
                        traits: { role: 'DPS/Utilitaire', HD: 'd10' },
                        recommandations: ['cartes_nature', 'equipement_voyage', 'pieces']
                    }
                ],
                historiques: [
                    {
                        nom: 'Noble',
                        description: 'Né dans les privilèges, habitué au commandement',
                        traits: { competences: 'Histoire, Persuasion' },
                        recommandations: ['bijoux_nobles', 'pieces_precieuses']
                    },
                    {
                        nom: 'Criminel',
                        description: 'Passé dans l\'illégalité, expert en subterfuge',
                        traits: { competences: 'Discrétion, Tromperie' },
                        recommandations: ['cartes_outils_voleur', 'equipement_discret']
                    },
                    {
                        nom: 'Artisan de Guilde',
                        description: 'Membre d\'une guilde marchande ou artisanale',
                        traits: { competences: 'Perspicacité, Persuasion' },
                        recommandations: ['cartes_artisanat', 'pieces_commerce']
                    },
                    {
                        nom: 'Héros du Peuple',
                        description: 'Champion des opprimés, proche du peuple',
                        traits: { competences: 'Dressage, Survie' },
                        recommandations: ['cartes_peuple', 'equipement_simple']
                    },
                    {
                        nom: 'Sage',
                        description: 'Érudit et chercheur, assoiffé de connaissance',
                        traits: { competences: 'Arcanes, Histoire' },
                        recommandations: ['cartes_savoir', 'bijoux_erudition']
                    }
                ]
            };
            
            this.populateSelections();
        } catch (error) {
            console.error('Erreur lors du chargement des données D&D:', error);
        }
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
                        <small>Recommandé : ${espece.recommandations.join(', ')}</small>
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
                        <small>Recommandé : ${classe.recommandations.join(', ')}</small>
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
                        <small>Recommandé : ${historique.recommandations.join(', ')}</small>
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
    generateRecommendations() {
        const recommendations = [];
        
        if (!this.dndData) return recommendations;

        // Récupération des données sélectionnées
        const espece = this.dndData.especes.find(e => e.nom === this.characterData.espece);
        const classe = this.dndData.classes.find(c => c.nom === this.characterData.classe);
        const historique = this.dndData.historiques.find(h => h.nom === this.characterData.historique);

        // Mapping des produits disponibles
        const produits = {
            'pieces': 'Pièces Métalliques - L\'Offrande du Voyageur',
            'pieces_metal': 'Pièces Métalliques - La Monnaie des Cinq Royaumes',
            'pieces_precieuses': 'Pièces Métalliques - L\'Essence du Marchand',
            'cartes_armes': 'Cartes d\'Équipement - Arsenal de l\'Aventurier',
            'cartes_magie': 'Cartes d\'Équipement - Butins & Ingénieries',
            'cartes_nature': 'Cartes d\'Équipement - Routes & Services',
            'triptyques': 'Triptyques Mystères - Origines Complètes'
        };

        // Score basé sur l'espèce
        if (espece) {
            espece.recommandations.forEach(rec => {
                if (produits[rec]) {
                    recommendations.push({
                        titre: produits[rec],
                        raison: `Recommandé pour les ${espece.nom}s - ${espece.traits.bonus}`,
                        score: 85
                    });
                }
            });
        }

        // Score basé sur la classe
        if (classe) {
            classe.recommandations.forEach(rec => {
                if (produits[rec]) {
                    const existing = recommendations.find(r => r.titre === produits[rec]);
                    if (existing) {
                        existing.score = Math.min(100, existing.score + 10);
                        existing.raison += ` + Parfait pour un ${classe.nom} (${classe.traits.role})`;
                    } else {
                        recommendations.push({
                            titre: produits[rec],
                            raison: `Idéal pour un ${classe.nom} - ${classe.traits.role}`,
                            score: 80
                        });
                    }
                }
            });
        }

        // Score basé sur l'historique
        if (historique) {
            historique.recommandations.forEach(rec => {
                if (produits[rec]) {
                    const existing = recommendations.find(r => r.titre === produits[rec]);
                    if (existing) {
                        existing.score = Math.min(100, existing.score + 5);
                        existing.raison += ` + Adapté à votre passé de ${historique.nom}`;
                    } else {
                        recommendations.push({
                            titre: produits[rec],
                            raison: `Correspond à votre historique de ${historique.nom}`,
                            score: 75
                        });
                    }
                }
            });
        }

        // Recommandation spéciale pour les triptyques
        if (!recommendations.find(r => r.titre.includes('Triptyques'))) {
            recommendations.push({
                titre: 'Triptyques Mystères - Origines Complètes',
                raison: 'Idéal pour explorer de nouveaux personnages et découvrir d\'autres combinaisons',
                score: 70
            });
        }

        // Trier par score décroissant et limiter à 3
        return recommendations
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