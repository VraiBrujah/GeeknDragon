/* ==============================================
   Li-CUBE PRO™ - Scripts Utilitaires
   JavaScript pour présentations vendeurs
   ============================================== */

// Configuration globale
const LiCubePro = {
    config: {
        animationDuration: 500,
        scrollOffset: 80,
        debounceDelay: 300,
        apiEndpoint: 'https://api.eds-quebec.com',
        version: '2.0.0'
    },
    
    // Données de base du produit
    data: {
        lfp: {
            name: 'Li-CUBE PRO™',
            voltage: 25.6,
            capacity: 105,
            cycles: 8000,
            weight: 23,
            price: 5500,  // 5000$ + taxes + 500$ installation
            chargingTime: 1.5,
            maintenance: 0
        },
        nicd: {
            name: 'Ni-Cd',
            voltage: 24,
            capacity: 100,
            cycles: 1500,  // Corrigé de 2500 à 1500
            weight: 80,
            price: 12000,
            chargingTime: 10,
            maintenance: 452
        },
    },
    
    // Fonctions utilitaires
    utils: {},
    
    // Composants
    components: {},
    
    // Événements
    events: {}
};

/* ==============================================
   Utilitaires généraux
   ============================================== */

LiCubePro.utils = {
    // Formatage des devises
    formatCurrency: function(amount, currency = 'CAD') {
        return new Intl.NumberFormat('fr-CA', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },
    
    // Formatage des nombres
    formatNumber: function(number, decimals = 0) {
        return new Intl.NumberFormat('fr-CA', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    },
    
    // Formatage des pourcentages
    formatPercentage: function(value, decimals = 0) {
        return new Intl.NumberFormat('fr-CA', {
            style: 'percent',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value / 100);
    },
    
    // Debounce pour les événements
    debounce: function(func, wait = LiCubePro.config.debounceDelay) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle pour les événements
    throttle: function(func, limit = 100) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    },
    
    // Animation smooth scroll
    smoothScrollTo: function(target, duration = LiCubePro.config.animationDuration) {
        const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
        if (!targetElement) return;
        
        const targetPosition = targetElement.offsetTop - LiCubePro.config.scrollOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }
        
        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }
        
        requestAnimationFrame(animation);
    },
    
    // Détection d'éléments visibles
    isElementVisible: function(element) {
        const rect = element.getBoundingClientRect();
        return rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
    },
    
    // Génération d'ID unique
    generateId: function() {
        return 'licube_' + Math.random().toString(36).substr(2, 9);
    },
    
    // Validation d'email
    isValidEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Stockage local sécurisé
    storage: {
        set: function(key, value) {
            try {
                localStorage.setItem('licube_' + key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.warn('Erreur stockage local:', e);
                return false;
            }
        },
        
        get: function(key) {
            try {
                const item = localStorage.getItem('licube_' + key);
                return item ? JSON.parse(item) : null;
            } catch (e) {
                console.warn('Erreur lecture stockage local:', e);
                return null;
            }
        },
        
        remove: function(key) {
            try {
                localStorage.removeItem('licube_' + key);
                return true;
            } catch (e) {
                console.warn('Erreur suppression stockage local:', e);
                return false;
            }
        }
    }
};

/* ==============================================
   Calculateur TCO
   ============================================== */

LiCubePro.components.TCOCalculator = class {
    constructor(container) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.data = {
            period: 20,
            units: 1,
            maintenanceCost: 452,
            replacementCycle: 6
        };
        this.results = {};
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.calculate();
    }
    
    bindEvents() {
        if (!this.container) return;
        
        const inputs = this.container.querySelectorAll('input[type="range"], input[type="number"]');
        inputs.forEach(input => {
            input.addEventListener('input', LiCubePro.utils.debounce(() => {
                this.updateData();
                this.calculate();
            }, 100));
        });
    }
    
    updateData() {
        const periodSlider = this.container.querySelector('#period');
        const unitsSlider = this.container.querySelector('#units');
        const maintenanceInput = this.container.querySelector('#maintenanceCost');
        const replacementInput = this.container.querySelector('#replacementCycle');
        
        if (periodSlider) this.data.period = parseInt(periodSlider.value);
        if (unitsSlider) this.data.units = parseInt(unitsSlider.value);
        if (maintenanceInput) this.data.maintenanceCost = parseInt(maintenanceInput.value);
        if (replacementInput) this.data.replacementCycle = parseInt(replacementInput.value);
    }
    
    calculate() {
        const { period, units, maintenanceCost, replacementCycle } = this.data;
        
        // Calculs Li-CUBE PRO™ LFP
        const lfpInitialCost = LiCubePro.data.lfp.price * units;  // 5500$ inclus taxes + installation
        const lfpMonitoringCost = 240 * units * period;  // 20$/mois optionnel
        const lfpTotalCost = lfpInitialCost; // Sans monitoring par défaut
        
        // Calculs Ni-Cd
        const nicdInitialCost = LiCubePro.data.nicd.price * units;
        const nicdMaintenanceTotal = maintenanceCost * units * period;
        const replacements = Math.floor(period / replacementCycle);
        const nicdReplacementCost = replacements * LiCubePro.data.nicd.price * units;
        const nicdTotalCost = nicdInitialCost + nicdMaintenanceTotal + nicdReplacementCost;
        
        // Économies
        const totalSavings = nicdTotalCost - lfpTotalCost;
        const savingsPercentage = Math.round((totalSavings / nicdTotalCost) * 100);
        const roiAnnual = Math.round((totalSavings / lfpTotalCost) * 100 / period);
        const paybackMonths = Math.round((lfpTotalCost / (nicdTotalCost / period)) * 12);
        
        this.results = {
            lfp: {
                initial: lfpInitialCost,
                monitoring: lfpMonitoringCost,
                total: lfpTotalCost
            },
            nicd: {
                initial: nicdInitialCost,
                maintenance: nicdMaintenanceTotal,
                replacements: nicdReplacementCost,
                total: nicdTotalCost
            },
            savings: {
                absolute: totalSavings,
                percentage: savingsPercentage,
                roi: roiAnnual,
                payback: paybackMonths
            }
        };
        
        this.updateDisplay();
        this.triggerEvent('calculate', this.results);
    }
    
    updateDisplay() {
        if (!this.container) return;
        
        // Mise à jour des valeurs
        const elements = {
            periodValue: this.container.querySelector('#periodValue'),
            unitsValue: this.container.querySelector('#unitsValue'),
            lfpTotal: this.container.querySelector('#lfpTotal'),
            nicdTotal: this.container.querySelector('#nicdTotal'),
            totalSavings: this.container.querySelector('#totalSavings'),
            savingsPercentage: this.container.querySelector('#savingsPercentage'),
            lfpInitial: this.container.querySelector('#lfpInitial'),
            lfpMonitoring: this.container.querySelector('#lfpMonitoring'),
            nicdInitial: this.container.querySelector('#nicdInitial'),
            nicdMaintenance: this.container.querySelector('#nicdMaintenance'),
            nicdReplacements: this.container.querySelector('#nicdReplacements'),
            roi: this.container.querySelector('#roi')
        };
        
        if (elements.periodValue) elements.periodValue.textContent = `${this.data.period} ans`;
        if (elements.unitsValue) elements.unitsValue.textContent = `${this.data.units} unité${this.data.units > 1 ? 's' : ''}`;
        if (elements.lfpTotal) elements.lfpTotal.textContent = LiCubePro.utils.formatCurrency(this.results.lfp.total);
        if (elements.nicdTotal) elements.nicdTotal.textContent = LiCubePro.utils.formatCurrency(this.results.nicd.total);
        if (elements.totalSavings) elements.totalSavings.textContent = LiCubePro.utils.formatCurrency(this.results.savings.absolute);
        if (elements.savingsPercentage) elements.savingsPercentage.textContent = `${this.results.savings.percentage}% d'économies`;
        if (elements.lfpInitial) elements.lfpInitial.textContent = LiCubePro.utils.formatCurrency(this.results.lfp.initial);
        if (elements.lfpMonitoring) elements.lfpMonitoring.textContent = LiCubePro.utils.formatCurrency(this.results.lfp.monitoring);
        if (elements.nicdInitial) elements.nicdInitial.textContent = LiCubePro.utils.formatCurrency(this.results.nicd.initial);
        if (elements.nicdMaintenance) elements.nicdMaintenance.textContent = LiCubePro.utils.formatCurrency(this.results.nicd.maintenance);
        if (elements.nicdReplacements) elements.nicdReplacements.textContent = LiCubePro.utils.formatCurrency(this.results.nicd.replacements);
        if (elements.roi) elements.roi.textContent = `${this.results.savings.roi}%/an`;
        
        // Mise à jour des graphiques
        this.updateChart();
    }
    
    updateChart() {
        const lfpBar = this.container.querySelector('#lfpBar');
        const nicdBar = this.container.querySelector('#nicdBar');
        const lfpBarValue = this.container.querySelector('#lfpBarValue');
        const nicdBarValue = this.container.querySelector('#nicdBarValue');
        
        if (lfpBar && nicdBar) {
            const maxCost = Math.max(this.results.lfp.total, this.results.nicd.total);
            const lfpHeight = (this.results.lfp.total / maxCost) * 250;
            const nicdHeight = (this.results.nicd.total / maxCost) * 250;
            
            lfpBar.style.height = `${lfpHeight}px`;
            nicdBar.style.height = `${nicdHeight}px`;
            
            if (lfpBarValue) lfpBarValue.textContent = LiCubePro.utils.formatCurrency(this.results.lfp.total);
            if (nicdBarValue) nicdBarValue.textContent = LiCubePro.utils.formatCurrency(this.results.nicd.total);
        }
    }
    
    exportResults() {
        const exportData = {
            parameters: this.data,
            results: this.results,
            timestamp: new Date().toISOString(),
            version: LiCubePro.config.version
        };
        
        // Sauvegarde locale
        LiCubePro.utils.storage.set('lastCalculation', exportData);
        
        // Génération du rapport
        const report = this.generateReport();
        
        // Affichage du rapport
        alert(report);
        
        return exportData;
    }
    
    generateReport() {
        return `📊 Rapport Calculateur TCO Li-CUBE PRO™

📋 Paramètres:
• Période d'analyse: ${this.data.period} ans
• Nombre d'unités: ${this.data.units}
• Maintenance Ni-Cd: ${LiCubePro.utils.formatCurrency(this.data.maintenanceCost)}/an/unité

💰 Résultats financiers:
• Li-CUBE PRO™ LFP: ${LiCubePro.utils.formatCurrency(this.results.lfp.total)}
• Batteries Ni-Cd: ${LiCubePro.utils.formatCurrency(this.results.nicd.total)}
• Économies totales: ${LiCubePro.utils.formatCurrency(this.results.savings.absolute)}
• Pourcentage d'économies: ${this.results.savings.percentage}%
• ROI annuel: ${this.results.savings.roi}%
• Retour sur investissement: ${this.results.savings.payback} mois

📞 Contact EDS Québec:
📧 contact@edsquebec.com
🌐 www.eds-quebec.com
📍 Québec, Canada

Généré le ${new Date().toLocaleDateString('fr-CA')} avec Li-CUBE PRO™ Calculator v${LiCubePro.config.version}`;
    }
    
    triggerEvent(eventName, data) {
        if (this.container) {
            const event = new CustomEvent(`licube:${eventName}`, {
                detail: data,
                bubbles: true
            });
            this.container.dispatchEvent(event);
        }
    }
};

/* ==============================================
   Gestionnaire d'onglets
   ============================================== */

LiCubePro.components.TabManager = class {
    constructor(container) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.activeTab = null;
        this.init();
    }
    
    init() {
        if (!this.container) return;
        
        const tabs = this.container.querySelectorAll('.tab');
        const contents = this.container.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = tab.getAttribute('data-target') || tab.textContent.toLowerCase().replace(/\s+/g, '');
                this.showTab(targetId, tab);
            });
        });
        
        // Activer le premier onglet par défaut
        if (tabs.length > 0) {
            tabs[0].click();
        }
    }
    
    showTab(tabId, tabElement) {
        // Désactiver tous les onglets et contenus
        const tabs = this.container.querySelectorAll('.tab');
        const contents = this.container.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => tab.classList.remove('active'));
        contents.forEach(content => content.classList.remove('active'));
        
        // Activer l'onglet sélectionné
        if (tabElement) {
            tabElement.classList.add('active');
            this.activeTab = tabElement;
        }
        
        // Activer le contenu correspondant
        const targetContent = this.container.querySelector(`#${tabId}`) || 
                             this.container.querySelector(`[data-tab="${tabId}"]`);
        
        if (targetContent) {
            targetContent.classList.add('active');
            
            // Animation d'entrée
            targetContent.style.opacity = '0';
            targetContent.style.transform = 'translateY(20px)';
            
            requestAnimationFrame(() => {
                targetContent.style.transition = 'all 0.3s ease';
                targetContent.style.opacity = '1';
                targetContent.style.transform = 'translateY(0)';
            });
        }
        
        // Déclencher l'événement
        this.triggerEvent('tabChange', { tabId, tabElement });
    }
    
    triggerEvent(eventName, data) {
        if (this.container) {
            const event = new CustomEvent(`licube:${eventName}`, {
                detail: data,
                bubbles: true
            });
            this.container.dispatchEvent(event);
        }
    }
};

/* ==============================================
   Observateur d'intersection (animations scroll)
   ============================================== */

LiCubePro.components.ScrollAnimations = class {
    constructor() {
        this.observer = null;
        this.init();
    }
    
    init() {
        if (!('IntersectionObserver' in window)) {
            console.warn('IntersectionObserver non supporté');
            return;
        }
        
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );
        
        this.observeElements();
    }
    
    observeElements() {
        const elements = document.querySelectorAll('[data-animate]');
        elements.forEach(element => {
            this.observer.observe(element);
        });
    }
    
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const animationType = entry.target.getAttribute('data-animate');
                const delay = entry.target.getAttribute('data-delay') || 0;
                
                setTimeout(() => {
                    this.animateElement(entry.target, animationType);
                }, delay);
                
                this.observer.unobserve(entry.target);
            }
        });
    }
    
    animateElement(element, animationType) {
        element.classList.add('animate-' + animationType);
        
        // Animation personnalisée pour les barres de progression
        if (animationType === 'progress') {
            const progressBars = element.querySelectorAll('.progress-bar');
            progressBars.forEach(bar => {
                const width = bar.getAttribute('data-width') || bar.style.width;
                bar.style.width = '0%';
                
                requestAnimationFrame(() => {
                    bar.style.transition = 'width 1.5s ease-out';
                    bar.style.width = width;
                });
            });
        }
        
        // Animation pour les compteurs
        if (animationType === 'counter') {
            this.animateCounter(element);
        }
    }
    
    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target')) || 0;
        const duration = parseInt(element.getAttribute('data-duration')) || 2000;
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }
};

/* ==============================================
   Gestionnaire de formulaires
   ============================================== */

LiCubePro.components.FormHandler = class {
    constructor(form) {
        this.form = typeof form === 'string' ? document.querySelector(form) : form;
        this.init();
    }
    
    init() {
        if (!this.form) return;
        
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Validation en temps réel
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', LiCubePro.utils.debounce(() => this.validateField(input), 300));
        });
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        if (this.validateForm()) {
            const formData = this.getFormData();
            this.submitForm(formData);
        }
    }
    
    validateForm() {
        const inputs = this.form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        const required = field.hasAttribute('required');
        let isValid = true;
        let message = '';
        
        // Validation requise
        if (required && !value) {
            isValid = false;
            message = 'Ce champ est obligatoire';
        }
        
        // Validation email
        if (type === 'email' && value && !LiCubePro.utils.isValidEmail(value)) {
            isValid = false;
            message = 'Adresse email invalide';
        }
        
        // Validation téléphone
        if (type === 'tel' && value && !/^[\d\s\-\+\(\)]+$/.test(value)) {
            isValid = false;
            message = 'Numéro de téléphone invalide';
        }
        
        // Mise à jour de l'affichage
        this.updateFieldStatus(field, isValid, message);
        
        return isValid;
    }
    
    updateFieldStatus(field, isValid, message) {
        const wrapper = field.closest('.form-group') || field.parentElement;
        const errorElement = wrapper.querySelector('.field-error') || this.createErrorElement();
        
        if (isValid) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
            errorElement.style.display = 'none';
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            if (!wrapper.contains(errorElement)) {
                wrapper.appendChild(errorElement);
            }
        }
    }
    
    createErrorElement() {
        const element = document.createElement('div');
        element.className = 'field-error text-danger text-sm mt-1';
        element.style.display = 'none';
        return element;
    }
    
    getFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }
    
    async submitForm(data) {
        try {
            // Afficher le loading
            this.setLoadingState(true);
            
            // Simulation d'envoi (à remplacer par vrai appel API)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Succès
            this.showSuccess('Votre demande a été envoyée avec succès!');
            this.form.reset();
            
            // Sauvegarde locale pour suivi
            LiCubePro.utils.storage.set('lastLead', {
                ...data,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            this.showError('Erreur lors de l\'envoi. Veuillez réessayer.');
            console.error('Erreur soumission formulaire:', error);
        } finally {
            this.setLoadingState(false);
        }
    }
    
    setLoadingState(loading) {
        const submitButton = this.form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = loading;
            submitButton.textContent = loading ? '⏳ Envoi en cours...' : '📤 Envoyer';
        }
    }
    
    showSuccess(message) {
        this.showMessage(message, 'success');
    }
    
    showError(message) {
        this.showMessage(message, 'error');
    }
    
    showMessage(message, type) {
        // Créer ou utiliser un élément de message existant
        let messageElement = this.form.querySelector('.form-message');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.className = 'form-message';
            this.form.insertBefore(messageElement, this.form.firstChild);
        }
        
        messageElement.className = `form-message alert alert-${type === 'success' ? 'success' : 'danger'}`;
        messageElement.textContent = message;
        messageElement.style.display = 'block';
        
        // Masquer après 5 secondes
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);
    }
};

/* ==============================================
   Initialisation automatique
   ============================================== */

LiCubePro.init = function() {
    // Attendre que le DOM soit chargé
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.initComponents());
    } else {
        this.initComponents();
    }
};

LiCubePro.initComponents = function() {
    // Initialiser les calculateurs TCO
    const calculators = document.querySelectorAll('.tco-calculator');
    calculators.forEach(calc => {
        new LiCubePro.components.TCOCalculator(calc);
    });
    
    // Initialiser les gestionnaires d'onglets
    const tabContainers = document.querySelectorAll('.tabs-container');
    tabContainers.forEach(container => {
        new LiCubePro.components.TabManager(container);
    });
    
    // Initialiser les animations de scroll
    new LiCubePro.components.ScrollAnimations();
    
    // Initialiser les formulaires
    const forms = document.querySelectorAll('.contact-form');
    forms.forEach(form => {
        new LiCubePro.components.FormHandler(form);
    });
    
    // Smooth scroll pour les liens internes
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    scrollLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                LiCubePro.utils.smoothScrollTo(target);
            }
        });
    });
    
    console.log('Li-CUBE PRO™ Scripts initialisés v' + LiCubePro.config.version);
};

// Fonctions globales pour compatibilité
window.showTab = function(tabName) {
    const tab = document.querySelector(`[data-target="${tabName}"]`) || 
                document.querySelector(`.tab[onclick*="${tabName}"]`);
    if (tab && tab.click) {
        tab.click();
    }
};

window.calculateTCO = function() {
    const calculator = document.querySelector('.tco-calculator');
    if (calculator && calculator.calculate) {
        calculator.calculate();
    }
};

window.exportResults = function() {
    const calculator = document.querySelector('.tco-calculator');
    if (calculator && calculator.exportResults) {
        calculator.exportResults();
    }
};

window.resetCalculator = function() {
    const form = document.querySelector('.tco-calculator');
    if (form) {
        const inputs = form.querySelectorAll('input[type="range"], input[type="number"]');
        inputs.forEach(input => {
            input.value = input.getAttribute('data-default') || input.defaultValue;
        });
        
        if (window.calculateTCO) {
            window.calculateTCO();
        }
    }
};

window.printComparison = function() {
    window.print();
};

// Auto-initialisation
LiCubePro.init();

// Export global
window.LiCubePro = LiCubePro;