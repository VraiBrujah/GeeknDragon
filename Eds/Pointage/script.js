// ===================================
// Système de Suivi Construction Maison Québec
// Version 1.0.0
// ===================================

// ===================================
// 1. CONFIGURATION ET INITIALISATION
// ===================================

const APP_CONFIG = {
    version: '1.0.0',
    locale: 'fr-CA',
    currency: 'CAD',
    taxes: {
        tps: 0.05,      // 5%
        tvq: 0.09975,   // 9.975%
        total: 0.14975  // 14.975% total
    },
    storage: {
        prefix: 'maison_qc_',
        keys: {
            config: 'config-maison',
            artisans: 'artisans',
            pointages: 'pointages',
            factures: 'factures-materiaux',
            paiements: 'paiements',
            etapes: 'etapes-construction',
            photos: 'photos'
        }
    }
};

// ===================================
// 2. SERVICE DE STOCKAGE
// ===================================

class StorageService {
    constructor() {
        this.prefix = APP_CONFIG.storage.prefix;
        this.isInitializing = false;
        this.initializeStorage();
    }

    initializeStorage() {
        // Initialiser IndexedDB pour les photos
        this.initIndexedDB();
        
        // Charger les données initiales si vides
        this.isInitializing = true;
        Object.keys(APP_CONFIG.storage.keys).forEach(key => {
            const storageKey = this.prefix + APP_CONFIG.storage.keys[key];
            if (!localStorage.getItem(storageKey)) {
                this._loadInitialData(key);
            }
        });
        this.isInitializing = false;
    }

    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('MaisonQuebecDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                if (!db.objectStoreNames.contains('photos')) {
                    const photoStore = db.createObjectStore('photos', { keyPath: 'id' });
                    photoStore.createIndex('type', 'type', { unique: false });
                    photoStore.createIndex('date', 'date', { unique: false });
                }
            };
        });
    }

    _loadInitialData(key) {
        console.log(`Initializing ${key}`);
        
        // Mode production - Aucune donnée de test
        // Initialiser uniquement les structures vides
        const initialData = {
            config: {
                id: "config_maison",
                nom_projet: "",
                adresse_complete: "",
                type_construction: "Maison unifamiliale neuve",
                superficie_carree: 0,
                budget_total_estime: 0.00,
                budget_main_oeuvre: 0.00,
                budget_materiaux: 0.00,
                date_debut_prevue: "",
                date_fin_prevue: "",
                permis_construction: "",
                licence_rbq: ""
            },
            artisans: [],
            pointages: [],
            'factures-materiaux': [],
            paiements: [],
            'etapes-construction': []
        };
        
        const data = initialData[key] || (key === 'config' ? {} : []);
        this.save(key, data);
    }

    save(key, data) {
        try {
            const storageKey = this.prefix + APP_CONFIG.storage.keys[key];
            localStorage.setItem(storageKey, JSON.stringify(data));
            this.dispatchStorageEvent(key, data);
        } catch (error) {
            console.error('Erreur de sauvegarde localStorage:', error);
            if (error.name === 'QuotaExceededError') {
                alert('Espace de stockage local plein. Veuillez exporter vos données et libérer de l\'espace.');
            }
        }
    }

    get(key) {
        try {
            const storageKey = this.prefix + APP_CONFIG.storage.keys[key];
            const data = localStorage.getItem(storageKey);
            // Retourner un objet vide pour les configurations, un tableau vide pour les autres
            const defaultValue = (key === 'config' || key === 'config_maison') ? {} : [];
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Erreur de lecture localStorage:', error);
            return (key === 'config' || key === 'config_maison') ? {} : [];
        }
    }

    async savePhoto(photoData, type = 'progression') {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['photos'], 'readwrite');
            const store = transaction.objectStore('photos');
            
            const photo = {
                id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: type,
                date: new Date().toISOString(),
                data: photoData
            };
            
            const request = store.add(photo);
            request.onsuccess = () => resolve(photo.id);
            request.onerror = () => reject(request.error);
        });
    }

    async getPhotos(type = null) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['photos'], 'readonly');
            const store = transaction.objectStore('photos');
            
            let request;
            if (type) {
                const index = store.index('type');
                request = index.getAll(type);
            } else {
                request = store.getAll();
            }
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getPhoto(photoId) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve(null);
                return;
            }
            
            const transaction = this.db.transaction(['photos'], 'readonly');
            const store = transaction.objectStore('photos');
            const request = store.get(photoId);
            
            request.onsuccess = () => {
                resolve(request.result || null);
            };
            request.onerror = () => {
                console.error('Erreur lors de la récupération de la photo:', request.error);
                resolve(null);
            };
        });
    }

    dispatchStorageEvent(key, data) {
        // Ne pas déclencher l'événement pendant l'initialisation pour éviter la récursion
        if (!this.isInitializing) {
            window.dispatchEvent(new CustomEvent('storageUpdate', {
                detail: { key, data }
            }));
        }
    }

    exportAllData() {
        const data = {};
        Object.keys(APP_CONFIG.storage.keys).forEach(key => {
            data[key] = this.get(key);
        });
        return data;
    }

    importData(data) {
        Object.keys(data).forEach(key => {
            if (APP_CONFIG.storage.keys[key]) {
                this.save(key, data[key]);
            }
        });
    }
}

// ===================================
// 3. SERVICE DE TAXES QUÉBEC
// ===================================

class TaxesQuebecService {
    static calculerTPS(montantHT) {
        return montantHT * APP_CONFIG.taxes.tps;
    }

    static calculerTVQ(montantHT) {
        return montantHT * APP_CONFIG.taxes.tvq;
    }

    static calculerTaxesTotales(montantHT) {
        return this.calculerTPS(montantHT) + this.calculerTVQ(montantHT);
    }

    static calculerMontantTTC(montantHT) {
        return montantHT + this.calculerTaxesTotales(montantHT);
    }

    static extraireMontantHT(montantTTC) {
        return montantTTC / (1 + APP_CONFIG.taxes.total);
    }
}

// ===================================
// 4. SERVICE DE CALCULS FINANCIERS
// ===================================

class CalculsFinanciersService {
    constructor(storage) {
        this.storage = storage;
    }

    // Main-d'œuvre
    calculerCoutMainOeuvre(pointage, artisan) {
        if (artisan.calcul_taxes_actif) {
            const coutHT = pointage.heures_travaillees * artisan.taux_horaire_ht;
            return TaxesQuebecService.calculerMontantTTC(coutHT);
        } else {
            return pointage.heures_travaillees * artisan.taux_horaire_ttc;
        }
    }

    calculerSoldeArtisan(artisanId) {
        const pointages = this.storage.get('pointages').filter(p => p.artisan_id === artisanId);
        const paiements = this.storage.get('paiements').filter(p => 
            p.artisan_id === artisanId && p.type === 'acompte_main_oeuvre'
        );

        const totalDu = pointages.reduce((sum, p) => sum + p.cout_main_oeuvre_ttc, 0);
        const totalPaye = paiements.reduce((sum, p) => sum + p.montant_ttc, 0);

        return totalDu - totalPaye;
    }

    // Matériaux
    calculerTotalFactures(categorie = null) {
        let factures = this.storage.get('factures');
        if (categorie) {
            factures = factures.filter(f => f.categorie === categorie);
        }
        return factures.reduce((sum, f) => sum + f.montant_total, 0);
    }

    calculerSoldeMateriaux() {
        const factures = this.storage.get('factures');
        const paiements = this.storage.get('paiements').filter(p => 
            p.type === 'paiement_materiaux'
        );

        const totalFactures = factures.reduce((sum, f) => sum + f.montant_total, 0);
        const totalPaye = paiements.reduce((sum, p) => sum + p.montant, 0);

        return totalFactures - totalPaye;
    }

    // Global
    calculerCoutTotalMaison() {
        const pointages = this.storage.get('pointages');
        const factures = this.storage.get('factures');

        const totalMainOeuvre = pointages.reduce((sum, p) => sum + p.cout_main_oeuvre_ttc, 0);
        const totalMateriaux = factures.reduce((sum, f) => sum + f.montant_total, 0);

        return {
            main_oeuvre: totalMainOeuvre,
            materiaux: totalMateriaux,
            total: totalMainOeuvre + totalMateriaux
        };
    }

    calculerEcartBudget() {
        const config = this.storage.get('config');
        const couts = this.calculerCoutTotalMaison();
        
        return {
            ecart_total: couts.total - config.budget_total_estime,
            ecart_main_oeuvre: couts.main_oeuvre - config.budget_main_oeuvre,
            ecart_materiaux: couts.materiaux - config.budget_materiaux,
            pourcentage_utilise: (couts.total / config.budget_total_estime) * 100
        };
    }

    calculerAvancementGlobal() {
        const etapes = this.storage.get('etapes');
        if (!etapes || etapes.length === 0) return 0;
        
        const totalEtapes = etapes.length;
        const sommeAvancement = etapes.reduce((sum, e) => sum + (e.pourcent_complete || 0), 0);
        return totalEtapes > 0 ? Math.min(100, Math.max(0, sommeAvancement / totalEtapes)) : 0;
    }
}

// ===================================
// 5. APPLICATION PRINCIPALE
// ===================================

class MaisonQuebecApp {
    constructor() {
        this.storage = new StorageService();
        this.calculs = new CalculsFinanciersService(this.storage);
        this.currentPage = 'dashboard';
        this.charts = {};
        
        this.init();
    }

    async init() {
        // Attendre l'initialisation d'IndexedDB
        await this.storage.initIndexedDB();
        
        // Initialiser la navigation
        this.setupNavigation();
        
        // Initialiser le calendrier
        this.initFlatpickr();
        
        // Configurer les événements
        this.setupEventListeners();
        
        // Charger la page initiale
        this.loadPage('dashboard');
        
        // Écouter les mises à jour du storage
        window.addEventListener('storageUpdate', (e) => {
            const { key } = e.detail;
            console.log('Storage update reçu:', key, 'current page:', this.currentPage);
            
            // Recharger TOUJOURS les sections affectées, peu importe la page actuelle
            if (key === 'artisans') {
                console.log('Rechargement automatique des artisans...');
                if (this.currentPage === 'artisans') {
                    this.loadArtisans();
                }
                // Toujours recharger la liste des artisans dans les selects
                this.refreshArtisansList();
            } else if (key === 'pointages') {
                console.log('Rechargement automatique des pointages...');
                if (this.currentPage === 'pointage') {
                    this.loadPointagesRecents();
                    this.chargerPointagesMois();
                }
            } else if (key === 'paiements') {
                console.log('Rechargement automatique des paiements...');
                if (this.currentPage === 'paiements') {
                    this.loadPaiements();
                }
            }
            
            // Dashboard dépend de toutes les données - toujours le recharger
            if (this.currentPage === 'dashboard') {
                console.log('Rechargement dashboard...');
                this.loadDashboard();
            }
        });
    }

    setupNavigation() {
        // Mobile menu toggle
        const burger = document.querySelector('.navbar-burger');
        const menu = document.querySelector('#navbarMenu');
        
        if (burger) {
            burger.addEventListener('click', () => {
                burger.classList.toggle('is-active');
                menu.classList.toggle('is-active');
            });
        }

        // Navigation items
        document.querySelectorAll('[data-page]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                this.loadPage(page);
                
                // Update active state
                document.querySelectorAll('[data-page]').forEach(i => i.classList.remove('is-active'));
                e.currentTarget.classList.add('is-active');
                
                // Close mobile menu
                burger?.classList.remove('is-active');
                menu?.classList.remove('is-active');
            });
        });
    }

    initFlatpickr() {
        // Configuration française
        flatpickr.localize(flatpickr.l10ns.fr);
        
        // Calendrier pour pointage
        const pointageDate = document.querySelector('#pointageDate');
        if (pointageDate) {
            flatpickr(pointageDate, {
                dateFormat: "Y-m-d",
                maxDate: "today",
                locale: "fr"
            });
        }
    }

    setupEventListeners() {
        // Backup/Restore
        document.getElementById('btnBackup')?.addEventListener('click', () => this.backup());
        document.getElementById('btnRestore')?.addEventListener('click', () => this.restore());
        
        // Artisans
        document.getElementById('btnAddArtisan')?.addEventListener('click', () => this.showArtisanModal());
        
        // Pointage
        document.getElementById('formPointage')?.addEventListener('submit', (e) => this.savePointage(e));
        
        // Matériaux
        document.getElementById('btnAddFacture')?.addEventListener('click', () => this.showFactureModal());
        
        // Paiements
        document.getElementById('btnAddPaiementMainOeuvre')?.addEventListener('click', () => this.showPaiementModal('main_oeuvre'));
        document.getElementById('btnAddPaiementMateriaux')?.addEventListener('click', () => this.showPaiementModal('materiaux'));
        
        // Rapports
        document.getElementById('btnRapportBanque')?.addEventListener('click', () => this.genererRapportBanque());
        document.getElementById('btnRapportAssurance')?.addEventListener('click', () => this.genererRapportAssurance());
        document.getElementById('btnRapportCompta')?.addEventListener('click', () => this.genererRapportCompta());
        document.getElementById('btnExportCSV')?.addEventListener('click', () => this.exportCSV());
        
        // File input for restore
        const restoreInput = document.getElementById('restoreFileInput');
        restoreInput?.addEventListener('change', (e) => this.handleRestore(e));
        
        // Configuration - boutons de configuration
        document.getElementById('btnEditConfigMaison')?.addEventListener('click', () => {
            console.log('Bouton Configuration cliqué');
            this.editConfigMaison();
        });
        document.getElementById('btnEditEtapesConstruction')?.addEventListener('click', () => {
            console.log('Bouton Étapes cliqué');
            this.editEtapesConstruction();
        });
    }

    loadPage(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
        
        // Show selected page
        const pageElement = document.getElementById(page);
        if (pageElement) {
            pageElement.style.display = 'block';
            this.currentPage = page;
            
            // Load page specific content
            switch(page) {
                case 'dashboard':
                    this.loadDashboard();
                    break;
                case 'artisans':
                    this.loadArtisans();
                    break;
                case 'pointage':
                    this.loadPointage();
                    break;
                case 'materiaux':
                    this.loadMateriaux();
                    break;
                case 'paiements':
                    this.loadPaiements();
                    break;
                case 'rapports':
                    this.loadRapports();
                    break;
                case 'configuration':
                    this.loadConfiguration();
                    break;
            }
        }
    }

    refreshCurrentPage() {
        this.loadPage(this.currentPage);
    }

    // ===================================
    // 6. DASHBOARD
    // ===================================

    loadDashboard() {
        // Calculer les KPIs
        const couts = this.calculs.calculerCoutTotalMaison();
        const paiements = this.storage.get('paiements');
        const totalPaye = paiements.reduce((sum, p) => {
            return sum + (p.type === 'acompte_main_oeuvre' ? p.montant_ttc : p.montant);
        }, 0);
        const soldeDu = couts.total - totalPaye;

        // Mettre à jour les KPIs
        const kpiCoutTotal = document.getElementById('kpiCoutTotal');
        const kpiMainOeuvre = document.getElementById('kpiMainOeuvre');
        const kpiMateriaux = document.getElementById('kpiMateriaux');
        const kpiSoldeDu = document.getElementById('kpiSoldeDu');
        
        if (kpiCoutTotal) kpiCoutTotal.textContent = this.formatCurrency(couts.total);
        if (kpiMainOeuvre) kpiMainOeuvre.textContent = this.formatCurrency(couts.main_oeuvre);
        if (kpiMateriaux) kpiMateriaux.textContent = this.formatCurrency(couts.materiaux);
        if (kpiSoldeDu) kpiSoldeDu.textContent = this.formatCurrency(soldeDu);

        // Progress bar
        const avancement = this.calculs.calculerAvancementGlobal();
        const progressBar = document.getElementById('progressGlobal');
        const progressText = document.getElementById('progressText');
        if (progressBar && progressText) {
            progressBar.value = avancement;
            progressText.textContent = `${Math.round(avancement)}%`;
        }

        // Graphiques
        this.loadCharts();

        // Activités récentes
        this.loadRecentActivities();
    }

    loadCharts() {
        // Graphique de répartition des coûts
        const ctxRepartition = document.getElementById('chartRepartition');
        if (ctxRepartition) {
            const couts = this.calculs.calculerCoutTotalMaison();
            
            if (this.charts.repartition) {
                this.charts.repartition.destroy();
            }
            
            this.charts.repartition = new Chart(ctxRepartition, {
                type: 'doughnut',
                data: {
                    labels: ['Main-d\'œuvre', 'Matériaux'],
                    datasets: [{
                        data: [couts.main_oeuvre, couts.materiaux],
                        backgroundColor: ['#17a2b8', '#28a745'],
                        borderColor: '#2d2d2d',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 1,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#e0e0e0',
                                padding: 20
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    const label = context.label || '';
                                    const value = this.formatCurrency(context.raw);
                                    const percentage = Math.round((context.raw / couts.total) * 100);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }

        // Graphique Budget vs Réel
        const ctxBudget = document.getElementById('chartBudget');
        if (ctxBudget) {
            const config = this.storage.get('config');
            const couts = this.calculs.calculerCoutTotalMaison();
            
            if (this.charts.budget) {
                this.charts.budget.destroy();
            }
            
            this.charts.budget = new Chart(ctxBudget, {
                type: 'bar',
                data: {
                    labels: ['Main-d\'œuvre', 'Matériaux', 'Total'],
                    datasets: [
                        {
                            label: 'Budget',
                            data: [
                                config.budget_main_oeuvre || 0,
                                config.budget_materiaux || 0,
                                config.budget_total_estime || 0
                            ],
                            backgroundColor: 'rgba(255, 193, 7, 0.5)',
                            borderColor: '#ffc107',
                            borderWidth: 2
                        },
                        {
                            label: 'Réel',
                            data: [couts.main_oeuvre, couts.materiaux, couts.total],
                            backgroundColor: 'rgba(0, 123, 255, 0.5)',
                            borderColor: '#007bff',
                            borderWidth: 2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 1.5,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#e0e0e0',
                                callback: (value) => this.formatCurrency(value)
                            },
                            grid: {
                                color: '#3a3a3a'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#e0e0e0'
                            },
                            grid: {
                                color: '#3a3a3a'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: '#e0e0e0'
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    return `${context.dataset.label}: ${this.formatCurrency(context.raw)}`;
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    loadRecentActivities() {
        const container = document.getElementById('recentActivities');
        if (!container) return;

        const activities = [];
        
        // Récupérer les derniers pointages
        const pointages = this.storage.get('pointages').slice(-3);
        pointages.forEach(p => {
            const artisan = this.storage.get('artisans').find(a => a.id === p.artisan_id);
            if (artisan) {
                activities.push({
                    date: p.date,
                    type: 'pointage',
                    text: `${artisan.prenom} ${artisan.nom} - ${p.heures_travaillees}h - ${p.type_travaux}`,
                    amount: p.cout_main_oeuvre_ttc
                });
            }
        });

        // Récupérer les dernières factures
        const factures = this.storage.get('factures').slice(-2);
        factures.forEach(f => {
            activities.push({
                date: f.date_achat,
                type: 'facture',
                text: `${f.fournisseur} - ${f.categorie}`,
                amount: f.montant_total
            });
        });

        // Trier par date
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Afficher
        container.innerHTML = activities.slice(0, 5).map(a => `
            <div class="box has-background-dark mb-2">
                <div class="level">
                    <div class="level-left">
                        <div>
                            <p class="has-text-grey-light is-size-7">${this.formatDate(a.date)}</p>
                            <p class="has-text-white">${a.text}</p>
                        </div>
                    </div>
                    <div class="level-right">
                        <span class="tag is-${a.type === 'pointage' ? 'info' : 'success'} is-medium">
                            ${this.formatCurrency(a.amount)}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // ===================================
    // 7. GESTION DES ARTISANS
    // ===================================

    loadArtisans() {
        const artisans = this.storage.get('artisans');
        const tbody = document.getElementById('artisansTableBody');
        
        if (!tbody) return;

        if (artisans.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="has-text-centered has-text-grey-light">
                        Aucun artisan enregistré
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = artisans.map(artisan => `
            <tr>
                <td>${artisan.prenom} ${artisan.nom}</td>
                <td>
                    <span class="tag is-info">${artisan.specialite}</span>
                </td>
                <td>
                    ${this.formatCurrency(artisan.taux_horaire_ttc)}/h
                    ${artisan.calcul_taxes_actif ? '<br><small class="has-text-grey">HT + taxes</small>' : ''}
                </td>
                <td>
                    <span class="tag is-${artisan.statut === 'actif' ? 'success' : 'warning'}">
                        ${artisan.statut}
                    </span>
                </td>
                <td>${artisan.telephone || '-'}</td>
                <td>
                    <button class="button is-small is-info" onclick="app.editArtisan('${artisan.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="button is-small is-warning" onclick="app.viewArtisanSolde('${artisan.id}')">
                        <i class="fas fa-dollar-sign"></i>
                    </button>
                    <button class="button is-small is-danger" onclick="app.deleteArtisan('${artisan.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    showArtisanModal(artisanId = null) {
        const artisan = artisanId ? this.storage.get('artisans').find(a => a.id == artisanId) : null;
        const title = artisan ? 'Modifier l\'artisan' : 'Ajouter un artisan';
        
        const modalHTML = `
            <div class="modal is-active" id="artisanModal">
                <div class="modal-background" onclick="app.closeModal('artisanModal')"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">${title}</p>
                        <button class="delete" onclick="app.closeModal('artisanModal')"></button>
                    </header>
                    <section class="modal-card-body">
                        <form id="formArtisan">
                            <div class="columns">
                                <div class="column">
                                    <div class="field">
                                        <label class="label has-text-white">Prénom</label>
                                        <div class="control">
                                            <input type="text" class="input" name="prenom" required 
                                                value="${artisan?.prenom || ''}">
                                        </div>
                                    </div>
                                </div>
                                <div class="column">
                                    <div class="field">
                                        <label class="label has-text-white">Nom</label>
                                        <div class="control">
                                            <input type="text" class="input" name="nom" required 
                                                value="${artisan?.nom || ''}">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="columns">
                                <div class="column">
                                    <div class="field">
                                        <label class="label has-text-white">Spécialité</label>
                                        <div class="control">
                                            <div class="select is-fullwidth">
                                                <select name="specialite" required>
                                                    <option value="">Sélectionner une spécialité</option>
                                                    <option value="Charpentier-menuisier" ${artisan?.specialite === 'Charpentier-menuisier' ? 'selected' : ''}>Charpentier-menuisier</option>
                                                    <option value="Électricien" ${artisan?.specialite === 'Électricien' ? 'selected' : ''}>Électricien</option>
                                                    <option value="Plombier" ${artisan?.specialite === 'Plombier' ? 'selected' : ''}>Plombier</option>
                                                    <option value="Maçon" ${artisan?.specialite === 'Maçon' ? 'selected' : ''}>Maçon</option>
                                                    <option value="Couvreur" ${artisan?.specialite === 'Couvreur' ? 'selected' : ''}>Couvreur</option>
                                                    <option value="Plâtrier" ${artisan?.specialite === 'Plâtrier' ? 'selected' : ''}>Plâtrier</option>
                                                    <option value="Peintre" ${artisan?.specialite === 'Peintre' ? 'selected' : ''}>Peintre</option>
                                                    <option value="Manœuvre" ${artisan?.specialite === 'Manœuvre' ? 'selected' : ''}>Manœuvre</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="column">
                                    <div class="field">
                                        <label class="label has-text-white">Téléphone</label>
                                        <div class="control">
                                            <input type="tel" class="input" name="telephone" 
                                                placeholder="514-555-1234"
                                                value="${artisan?.telephone || ''}">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="columns">
                                <div class="column">
                                    <div class="field">
                                        <label class="label has-text-white">Taux horaire ($/h)</label>
                                        <div class="control">
                                            <input type="number" class="input" name="taux_horaire_ttc" 
                                                step="0.01" min="0" required
                                                value="${artisan?.taux_horaire_ttc || ''}">
                                        </div>
                                    </div>
                                </div>
                                <div class="column">
                                    <div class="field">
                                        <label class="label has-text-white">Statut</label>
                                        <div class="control">
                                            <div class="select is-fullwidth">
                                                <select name="statut" required>
                                                    <option value="actif" ${artisan?.statut === 'actif' ? 'selected' : ''}>Actif</option>
                                                    <option value="termine" ${artisan?.statut === 'termine' ? 'selected' : ''}>Terminé</option>
                                                    <option value="en_attente" ${artisan?.statut === 'en_attente' ? 'selected' : ''}>En attente</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="field">
                                <div class="control">
                                    <label class="checkbox">
                                        <input type="checkbox" name="calcul_taxes_actif" 
                                            ${artisan?.calcul_taxes_actif ? 'checked' : ''}
                                            onchange="app.toggleTaxesFields(this.checked)">
                                        <span class="has-text-white ml-2">
                                            L'artisan facture HT + taxes séparément
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div id="taxesFields" style="display: ${artisan?.calcul_taxes_actif ? 'block' : 'none'}">
                                <div class="columns">
                                    <div class="column">
                                        <div class="field">
                                            <label class="label has-text-white">Taux horaire HT ($/h)</label>
                                            <div class="control">
                                                <input type="number" class="input" name="taux_horaire_ht" 
                                                    step="0.01" min="0"
                                                    value="${artisan?.taux_horaire_ht || ''}">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="columns">
                                    <div class="column">
                                        <label class="checkbox">
                                            <input type="checkbox" name="tps_applicable" 
                                                ${artisan?.tps_applicable ? 'checked' : ''}>
                                            <span class="has-text-grey-light ml-2">TPS applicable (5%)</span>
                                        </label>
                                    </div>
                                    <div class="column">
                                        <label class="checkbox">
                                            <input type="checkbox" name="tvq_applicable" 
                                                ${artisan?.tvq_applicable ? 'checked' : ''}>
                                            <span class="has-text-grey-light ml-2">TVQ applicable (9.975%)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div class="columns">
                                <div class="column">
                                    <div class="field">
                                        <label class="label has-text-white">Date début contrat</label>
                                        <div class="control">
                                            <input type="date" class="input" name="debut_contrat" 
                                                value="${artisan?.debut_contrat || ''}">
                                        </div>
                                    </div>
                                </div>
                                <div class="column">
                                    <div class="field">
                                        <label class="label has-text-white">Date fin prévue</label>
                                        <div class="control">
                                            <input type="date" class="input" name="fin_prevue" 
                                                value="${artisan?.fin_prevue || ''}">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="field">
                                <label class="label has-text-white">Notes facturation</label>
                                <div class="control">
                                    <textarea class="textarea" name="notes_facturation" rows="2"
                                        placeholder="Ex: Taux négocié tout compris">${artisan?.notes_facturation || ''}</textarea>
                                </div>
                            </div>
                        </form>
                    </section>
                    <footer class="modal-card-foot">
                        <button class="button is-success" onclick="app.saveArtisan('${artisanId || ''}')">
                            <i class="fas fa-save mr-2"></i> Enregistrer
                        </button>
                        <button class="button" onclick="app.closeModal('artisanModal')">Annuler</button>
                    </footer>
                </div>
            </div>
        `;
        
        document.getElementById('modals').innerHTML = modalHTML;
    }

    toggleTaxesFields(show) {
        document.getElementById('taxesFields').style.display = show ? 'block' : 'none';
    }

    saveArtisan(artisanId) {
        console.log('saveArtisan appelé avec ID:', artisanId);
        const form = document.getElementById('formArtisan');
        const formData = new FormData(form);
        
        // Convertir l'ID en nombre si fourni
        let numericId = null;
        if (artisanId) {
            numericId = parseInt(artisanId);
            if (isNaN(numericId)) numericId = artisanId;
        }
        
        // Générer un ID numérique séquentiel pour nouveau
        let newId = numericId;
        if (!newId) {
            const existingArtisans = this.storage.get('artisans');
            newId = existingArtisans.length > 0 ? Math.max(...existingArtisans.map(a => a.id || 0)) + 1 : 1;
        }
        
        console.log('ID final utilisé:', newId);
        
        const artisanData = {
            id: newId,
            nom: formData.get('nom'),
            prenom: formData.get('prenom'),
            specialite: formData.get('specialite'),
            taux_horaire_ttc: parseFloat(formData.get('taux_horaire_ttc')),
            taxes_incluses: true,
            calcul_taxes_actif: formData.get('calcul_taxes_actif') === 'on',
            taux_horaire_ht: parseFloat(formData.get('taux_horaire_ht')) || 0,
            tps_applicable: formData.get('tps_applicable') === 'on',
            tvq_applicable: formData.get('tvq_applicable') === 'on',
            statut: formData.get('statut'),
            telephone: formData.get('telephone'),
            debut_contrat: formData.get('debut_contrat'),
            fin_prevue: formData.get('fin_prevue'),
            type_travailleur: 'autonome',
            notes_facturation: formData.get('notes_facturation')
        };
        
        console.log('Données artisan à sauvegarder:', artisanData);

        let artisans = this.storage.get('artisans');
        console.log('Artisans existants:', artisans);
        
        if (numericId) {
            // Modification d'un artisan existant - utiliser comparaison flexible
            const index = artisans.findIndex(a => a.id == numericId);
            console.log('Index trouvé pour modification:', index);
            if (index !== -1) {
                artisans[index] = artisanData;
                console.log('Artisan modifié à l\'index', index);
            } else {
                console.error('Artisan à modifier non trouvé!');
                this.showNotification('Erreur: Artisan à modifier non trouvé', 'danger');
                return;
            }
        } else {
            // Nouvel artisan
            artisans.push(artisanData);
            console.log('Nouvel artisan ajouté');
        }
        
        console.log('Liste finale artisans:', artisans);
        this.storage.save('artisans', artisans);
        this.closeModal('artisanModal');
        
        // Forcer le rechargement immédiat
        this.loadArtisans();
        this.refreshArtisansList();
        
        const message = numericId ? 'Artisan modifié avec succès' : 'Artisan créé avec succès';
        this.showNotification(message, 'success');
    }

    editArtisan(artisanId) {
        console.log('editArtisan appelé avec ID:', artisanId);
        let id = parseInt(artisanId);
        if (isNaN(id)) id = artisanId; // Garder comme string si ce n'est pas un nombre
        console.log('ID converti:', id);
        this.showArtisanModal(id);
    }

    viewArtisanSolde(artisanId) {
        const id = parseInt(artisanId);
        const artisan = this.storage.get('artisans').find(a => a.id === id);
        
        if (!artisan) {
            this.showNotification('Artisan non trouvé', 'error');
            return;
        }
        
        const solde = this.calculs.calculerSoldeArtisan(id);
        
        const modalHTML = `
            <div class="modal is-active" id="soldeModal">
                <div class="modal-background" onclick="app.closeModal('soldeModal')"></div>
                <div class="modal-content">
                    <div class="box has-background-dark">
                        <h3 class="title is-4 has-text-white">
                            Solde - ${artisan.prenom} ${artisan.nom}
                        </h3>
                        <div class="content">
                            <p class="has-text-grey-light">Spécialité: ${artisan.specialite}</p>
                            <p class="has-text-grey-light">Taux horaire: ${this.formatCurrency(artisan.taux_horaire_ttc)}/h</p>
                            <hr>
                            <p class="title is-3 has-text-${solde > 0 ? 'danger' : 'success'}">
                                Solde dû: ${this.formatCurrency(Math.abs(solde))}
                            </p>
                            ${solde < 0 ? '<p class="has-text-success">L\'artisan a un crédit</p>' : ''}
                        </div>
                    </div>
                </div>
                <button class="modal-close is-large" onclick="app.closeModal('soldeModal')"></button>
            </div>
        `;
        
        document.getElementById('modals').innerHTML = modalHTML;
    }

    deleteArtisan(artisanId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet artisan ?')) {
            // Gérer les IDs numériques et string pour compatibilité
            let id = parseInt(artisanId);
            if (isNaN(id)) {
                id = artisanId; // Garder comme string
            }
            
            let artisans = this.storage.get('artisans');
            console.log('Suppression - ID recherché:', id); // Debug
            console.log('Artisans avant suppression:', artisans.map(a => ({id: a.id, nom: a.nom}))); // Debug
            
            artisans = artisans.filter(a => a.id != id); // Utiliser != pour comparaison flexible
            
            console.log('Artisans après suppression:', artisans.map(a => ({id: a.id, nom: a.nom}))); // Debug
            this.storage.save('artisans', artisans);
            
            // L'événement storageUpdate se chargera du rechargement automatique
            this.refreshArtisansList(); // Pour le formulaire de pointage
            this.showNotification('Artisan supprimé', 'warning');
        }
    }

    // ===================================
    // 8. POINTAGE
    // ===================================

    loadPointage() {
        // Les données sont déjà chargées en localStorage, pas besoin de recharger
        
        // Charger la liste des artisans dans le select
        const artisans = this.storage.get('artisans').filter(a => a.statut === 'actif');
        const select = document.getElementById('pointageArtisan');
        
        if (select) {
            select.innerHTML = '<option value="">Sélectionner un artisan</option>' +
                artisans.map(a => `
                    <option value="${a.id}">${a.prenom} ${a.nom} - ${a.specialite}</option>
                `).join('');
        }

        // Ajouter listener pour les photos multiples
        const photosInput = document.getElementById('pointagePhotos');
        if (photosInput) {
            photosInput.addEventListener('change', (e) => {
                const fileCount = e.target.files.length;
                const helpText = document.querySelector('#pointagePhotos').nextElementSibling;
                if (helpText && helpText.classList.contains('help')) {
                    if (fileCount === 0) {
                        helpText.innerHTML = '<i class="fas fa-info-circle mr-1"></i>Vous pouvez sélectionner plusieurs images (Ctrl+clic ou Cmd+clic)';
                        helpText.className = 'help has-text-grey-light';
                    } else if (fileCount === 1) {
                        helpText.innerHTML = '<i class="fas fa-check mr-1"></i>1 image sélectionnée';
                        helpText.className = 'help has-text-success';
                    } else {
                        helpText.innerHTML = `<i class="fas fa-check mr-1"></i>${fileCount} images sélectionnées`;
                        helpText.className = 'help has-text-success';
                    }
                }
            });
        }

        // Charger les pointages récents
        this.loadPointagesRecents();
        
        // Initialiser le calendrier avec le mois actuel
        this.chargerPointagesMois();
    }

    refreshArtisansList() {
        // Les données sont déjà dans localStorage, pas besoin de recharger depuis JSON
        
        // Recharger la liste des artisans dans le select
        const artisans = this.storage.get('artisans').filter(a => a.statut === 'actif');
        const select = document.getElementById('pointageArtisan');
        
        if (select) {
            const currentValue = select.value;
            select.innerHTML = '<option value="">Sélectionner un artisan</option>' +
                artisans.map(a => `
                    <option value="${a.id}">${a.prenom} ${a.nom} - ${a.specialite}</option>
                `).join('');
            
            // Rétablir la sélection si elle est toujours valide
            if (currentValue && artisans.find(a => a.id == currentValue)) {
                select.value = currentValue;
            }
        }
        
        this.showNotification('Liste des artisans actualisée', 'success');
    }

    loadPointagesRecents() {
        const container = document.getElementById('pointagesRecents');
        if (!container) return;

        const pointages = this.storage.get('pointages').slice(-10).reverse();
        const artisans = this.storage.get('artisans');

        if (pointages.length === 0) {
            container.innerHTML = `
                <div class="notification is-dark">
                    <p class="has-text-grey-light">Aucun pointage enregistré</p>
                </div>
            `;
            return;
        }

        container.innerHTML = pointages.map(p => {
            const artisan = artisans.find(a => a.id == p.artisan_id);
            const hasPhotos = p.photos && p.photos.length > 0;
            const hasNotes = p.notes && p.notes.trim() !== '';
            
            return `
                <div class="box has-background-dark mb-3 is-clickable" onclick="app.showPointageDetail('${p.id}')" style="cursor: pointer; transition: all 0.3s;" onmouseover="this.style.backgroundColor='#363636'" onmouseout="this.style.backgroundColor='#363636'">
                    <div class="level">
                        <div class="level-left">
                            <div>
                                <p class="has-text-weight-bold has-text-white">
                                    ${artisan ? `${artisan.prenom} ${artisan.nom}` : 'Artisan inconnu'}
                                    <span class="ml-2">
                                        ${hasPhotos ? '<i class="fas fa-camera has-text-info" title="Photos disponibles"></i>' : ''}
                                        ${hasNotes ? '<i class="fas fa-sticky-note has-text-warning ml-1" title="Notes disponibles"></i>' : ''}
                                    </span>
                                </p>
                                <p class="has-text-grey-light">
                                    ${this.formatDate(p.date)} | ${p.heure_debut} - ${p.heure_fin}
                                </p>
                                <p class="has-text-grey-light">
                                    ${p.type_travaux} | ${p.etape_maison}
                                </p>
                                ${hasNotes ? `<p class="has-text-grey mt-2"><i>"${p.notes.substring(0, 50)}${p.notes.length > 50 ? '...' : ''}"</i></p>` : ''}
                            </div>
                        </div>
                        <div class="level-right">
                            <div class="has-text-right">
                                <p class="has-text-grey-light">${p.heures_travaillees}h travaillées</p>
                                <p class="title is-5 has-text-warning">
                                    ${this.formatCurrency(p.cout_main_oeuvre_ttc)}
                                </p>
                                <div class="buttons is-small">
                                    <button class="button is-small is-info" 
                                        onclick="event.stopPropagation(); app.showPointageDetail('${p.id}')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="button is-small is-danger" 
                                        onclick="event.stopPropagation(); app.deletePointage('${p.id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async savePointage(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const artisanIdValue = formData.get('pointageArtisan');
        console.log('Artisan ID récupéré:', artisanIdValue); // Debug
        console.log('Tous les artisans disponibles:', this.storage.get('artisans')); // Debug
        
        if (!artisanIdValue || artisanIdValue === '') {
            this.showNotification('Veuillez sélectionner un artisan', 'danger');
            return;
        }
        
        // Gérer les IDs numériques et string (pour compatibilité)
        let artisanId = parseInt(artisanIdValue);
        if (isNaN(artisanId)) {
            artisanId = artisanIdValue; // Garder comme string si ce n'est pas un nombre
        }
        console.log('Artisan ID traité:', artisanId); // Debug
        
        const artisan = this.storage.get('artisans').find(a => a.id == artisanId); // Utiliser == pour comparaison flexible
        console.log('Artisan trouvé:', artisan); // Debug
        
        if (!artisan) {
            this.showNotification('Artisan introuvable. Veuillez sélectionner un artisan valide.', 'danger');
            return;
        }

        // Calculer les heures travaillées
        const debut = formData.get('pointageDebut');
        const fin = formData.get('pointageFin');
        const pause = parseInt(formData.get('pointagePause')) || 0;
        
        const heuresDebut = parseInt(debut.split(':')[0]) + parseInt(debut.split(':')[1]) / 60;
        const heuresFin = parseInt(fin.split(':')[0]) + parseInt(fin.split(':')[1]) / 60;
        let heuresTravaillees = (heuresFin - heuresDebut) - (pause / 60);
        
        // Validation : éviter les heures négatives
        if (heuresTravaillees < 0) {
            this.showNotification('Erreur: L\'heure de fin doit être après l\'heure de début', 'danger');
            return;
        }

        // Calculer le coût
        let coutMainOeuvre;
        let tps = 0, tvq = 0;
        
        if (artisan.calcul_taxes_actif && artisan.taux_horaire_ht > 0) {
            const coutHT = heuresTravaillees * artisan.taux_horaire_ht;
            if (artisan.tps_applicable) tps = TaxesQuebecService.calculerTPS(coutHT);
            if (artisan.tvq_applicable) tvq = TaxesQuebecService.calculerTVQ(coutHT);
            coutMainOeuvre = coutHT + tps + tvq;
        } else {
            coutMainOeuvre = heuresTravaillees * artisan.taux_horaire_ttc;
        }

        // Gérer les photos
        const photosInput = document.getElementById('pointagePhotos');
        const photoIds = [];
        
        if (photosInput.files.length > 0) {
            for (let file of photosInput.files) {
                const photoData = await this.fileToBase64(file);
                const photoId = await this.storage.savePhoto(photoData, 'progression');
                photoIds.push(photoId);
            }
        }

        const pointageData = {
            id: `pointage_${Date.now()}`,
            artisan_id: artisanId,
            date: formData.get('pointageDate'),
            heure_debut: debut,
            heure_fin: fin,
            temps_pause_minutes: pause,
            heures_travaillees: heuresTravaillees,
            taux_horaire_ttc: artisan.taux_horaire_ttc,
            taxes_incluses: !artisan.calcul_taxes_actif,
            calcul_taxes_actif: artisan.calcul_taxes_actif,
            taux_horaire_ht: artisan.taux_horaire_ht || 0,
            tps_5_pct: tps,
            tvq_9975_pct: tvq,
            taxes_totales: tps + tvq,
            cout_main_oeuvre_ttc: coutMainOeuvre,
            type_travaux: formData.get('pointageTypeTravaux'),
            etape_maison: formData.get('pointageEtape'),
            notes: formData.get('pointageNotes'),
            photos: photoIds,
            termine: true
        };

        let pointages = this.storage.get('pointages');
        pointages.push(pointageData);
        this.storage.save('pointages', pointages);

        // Message de succès avec détails
        let successMsg = `Pointage enregistré avec succès pour ${artisan.prenom} ${artisan.nom}`;
        if (photoIds.length > 0) {
            successMsg += ` (${photoIds.length} photo${photoIds.length > 1 ? 's' : ''} ajoutée${photoIds.length > 1 ? 's' : ''})`;
        }

        // Réinitialiser le formulaire
        e.target.reset();
        
        // Réinitialiser le message d'aide des photos
        const helpText = document.querySelector('#pointagePhotos').nextElementSibling;
        if (helpText && helpText.classList.contains('help')) {
            helpText.innerHTML = '<i class="fas fa-info-circle mr-1"></i>Vous pouvez sélectionner plusieurs images (Ctrl+clic ou Cmd+clic)';
            helpText.className = 'help has-text-grey-light';
        }
        
        this.loadPointagesRecents();
        this.showNotification(successMsg, 'success');
    }

    deletePointage(pointageId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce pointage ?')) {
            let pointages = this.storage.get('pointages');
            pointages = pointages.filter(p => p.id !== pointageId);
            this.storage.save('pointages', pointages);
            this.loadPointagesRecents();
            this.showNotification('Pointage supprimé', 'warning');
        }
    }

    async showPointageDetail(pointageId) {
        const pointages = this.storage.get('pointages');
        const artisans = this.storage.get('artisans');
        
        const pointage = pointages.find(p => p.id == pointageId);
        if (!pointage) {
            this.showNotification('Pointage non trouvé', 'error');
            return;
        }
        
        const artisan = artisans.find(a => a.id == pointage.artisan_id);
        const tempsPause = pointage.temps_pause_minutes || 0;
        const photosHtml = await this.generatePhotosHtml(pointage.photos || []);
        
        const modalHTML = `
            <div class="modal is-active" id="pointageDetailModal">
                <div class="modal-background" onclick="app.closeModal('pointageDetailModal')"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">
                            <i class="fas fa-clock mr-2"></i>
                            Détail du pointage - ${this.formatDate(pointage.date)}
                        </p>
                        <button class="delete" onclick="app.closeModal('pointageDetailModal')"></button>
                    </header>
                    <section class="modal-card-body">
                        <!-- Informations de l'artisan -->
                        <div class="box has-background-grey-darker">
                            <div class="level">
                                <div class="level-left">
                                    <div>
                                        <p class="title is-4 has-text-white">
                                            ${artisan ? `${artisan.prenom} ${artisan.nom}` : 'Artisan inconnu'}
                                        </p>
                                        <p class="subtitle is-6 has-text-grey-light">
                                            ${artisan ? artisan.specialite : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div class="level-right">
                                    <div class="has-text-right">
                                        <p class="has-text-grey-light">Taux horaire</p>
                                        <p class="title is-5 has-text-info">
                                            ${this.formatCurrency(pointage.taux_horaire_ttc || artisan?.taux_horaire_ttc || 0)}/h
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Détails du travail -->
                        <div class="columns">
                            <div class="column is-6">
                                <div class="box has-background-dark">
                                    <h3 class="subtitle is-5 has-text-white mb-3">
                                        <i class="fas fa-briefcase mr-2"></i>Détails du travail
                                    </h3>
                                    <div class="content has-text-grey-light">
                                        <p><strong class="has-text-white">Date :</strong> ${this.formatDate(pointage.date)}</p>
                                        <p><strong class="has-text-white">Type de travaux :</strong> ${pointage.type_travaux}</p>
                                        <p><strong class="has-text-white">Étape :</strong> ${pointage.etape_maison}</p>
                                        <p><strong class="has-text-white">Statut :</strong> 
                                            <span class="tag ${pointage.termine ? 'is-success' : 'is-warning'}">
                                                ${pointage.termine ? 'Terminé' : 'En cours'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div class="column is-6">
                                <div class="box has-background-dark">
                                    <h3 class="subtitle is-5 has-text-white mb-3">
                                        <i class="fas fa-clock mr-2"></i>Temps et coûts
                                    </h3>
                                    <div class="content has-text-grey-light">
                                        <p><strong class="has-text-white">Heure début :</strong> ${pointage.heure_debut}</p>
                                        <p><strong class="has-text-white">Heure fin :</strong> ${pointage.heure_fin}</p>
                                        <p><strong class="has-text-white">Pause :</strong> ${tempsPause} minutes</p>
                                        <hr>
                                        <p><strong class="has-text-white">Heures travaillées :</strong> 
                                            <span class="has-text-info">${pointage.heures_travaillees}h</span>
                                        </p>
                                        <p><strong class="has-text-white">Coût total :</strong> 
                                            <span class="title is-4 has-text-warning">${this.formatCurrency(pointage.cout_main_oeuvre_ttc)}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Notes -->
                        ${pointage.notes ? `
                            <div class="box has-background-dark">
                                <h3 class="subtitle is-5 has-text-white mb-3">
                                    <i class="fas fa-sticky-note mr-2"></i>Notes
                                </h3>
                                <div class="content has-text-grey-light">
                                    <p style="white-space: pre-wrap;">${pointage.notes}</p>
                                </div>
                            </div>
                        ` : ''}

                        <!-- Photos -->
                        ${photosHtml ? `
                            <div class="box has-background-dark">
                                <h3 class="subtitle is-5 has-text-white mb-3">
                                    <i class="fas fa-camera mr-2"></i>Photos de progression (${(pointage.photos || []).length})
                                </h3>
                                <div class="content">
                                    ${photosHtml}
                                </div>
                            </div>
                        ` : `
                            <div class="box has-background-grey-dark">
                                <p class="has-text-grey-light has-text-centered">
                                    <i class="fas fa-camera fa-2x mb-3"></i><br>
                                    Aucune photo disponible pour ce pointage
                                </p>
                            </div>
                        `}
                    </section>
                    <footer class="modal-card-foot">
                        <button class="button" onclick="app.closeModal('pointageDetailModal')">Fermer</button>
                        <button class="button is-danger" onclick="app.closeModal('pointageDetailModal'); app.deletePointage('${pointage.id}')">
                            <i class="fas fa-trash mr-2"></i>Supprimer ce pointage
                        </button>
                    </footer>
                </div>
            </div>
        `;
        
        document.getElementById('modals').innerHTML = modalHTML;
    }

    async generatePhotosHtml(photoIds) {
        if (!photoIds || photoIds.length === 0) {
            return '';
        }
        
        let photosHtml = '';
        for (let i = 0; i < photoIds.length; i++) {
            const photoId = photoIds[i];
            const photo = await this.storage.getPhoto(photoId);
            
            if (photo && photo.data) {
                photosHtml += `
                    <div class="column is-4">
                        <div class="card has-background-grey-darker">
                            <div class="card-image">
                                <figure class="image is-3by2">
                                    <img src="${photo.data}" 
                                         alt="Photo ${i + 1}" 
                                         class="is-clickable"
                                         onclick="app.showPhotoModal('${photo.data}', ${i + 1})"
                                         style="object-fit: cover; cursor: pointer; border-radius: 4px;">
                                </figure>
                            </div>
                            <div class="card-content has-text-centered p-2">
                                <p class="has-text-grey-light is-size-7">Photo ${i + 1}</p>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        
        return photosHtml ? `<div class="columns is-multiline">${photosHtml}</div>` : '';
    }

    showPhotoModal(photoUrl, photoNumber) {
        const modalHTML = `
            <div class="modal is-active" id="photoViewModal">
                <div class="modal-background" onclick="app.closeModal('photoViewModal')"></div>
                <div class="modal-content">
                    <div class="box has-background-dark">
                        <h3 class="title is-4 has-text-white has-text-centered mb-4">
                            Photo ${photoNumber}
                        </h3>
                        <figure class="image">
                            <img src="${photoUrl}" alt="Photo ${photoNumber}" style="max-width: 100%; height: auto;">
                        </figure>
                    </div>
                </div>
                <button class="modal-close is-large" onclick="app.closeModal('photoViewModal')"></button>
            </div>
        `;
        
        document.getElementById('modals').innerHTML = modalHTML;
    }

    chargerPointagesMois(moisAnnee) {
        if (!moisAnnee) {
            // Par défaut, mois actuel
            const maintenant = new Date();
            moisAnnee = `${maintenant.getFullYear()}-${(maintenant.getMonth() + 1).toString().padStart(2, '0')}`;
            const inputMois = document.getElementById('calendrierMois');
            if (inputMois) inputMois.value = moisAnnee;
        }
        
        const [annee, mois] = moisAnnee.split('-');
        const pointages = this.storage.get('pointages') || [];
        const artisans = this.storage.get('artisans') || [];
        
        // Filtrer les pointages du mois sélectionné
        const pointagesMois = pointages.filter(p => {
            const datePointage = new Date(p.date);
            return datePointage.getFullYear() == annee && 
                   (datePointage.getMonth() + 1) == parseInt(mois);
        });
        
        this.afficherCalendrierPointages(parseInt(annee), parseInt(mois), pointagesMois, artisans);
    }

    afficherCalendrierPointages(annee, mois, pointages, artisans) {
        const container = document.getElementById('calendrierPointages');
        if (!container) return;
        
        if (pointages.length === 0) {
            container.innerHTML = `
                <div class="notification is-dark">
                    <p class="has-text-grey-light has-text-centered">
                        <i class="fas fa-calendar-times fa-2x mb-3"></i><br>
                        Aucun pointage trouvé pour ${this.getMonthName(mois)} ${annee}
                    </p>
                </div>
            `;
            return;
        }
        
        // Générer le calendrier
        const premierJour = new Date(annee, mois - 1, 1);
        const dernierJour = new Date(annee, mois, 0);
        const premierJourSemaine = premierJour.getDay(); // 0 = dimanche
        const joursEnMois = dernierJour.getDate();
        
        // Grouper les pointages par jour ET par date complète
        const pointagesParJour = {};
        const pointagesParDateComplete = {};
        pointages.forEach(p => {
            const jour = new Date(p.date).getDate();
            if (!pointagesParJour[jour]) pointagesParJour[jour] = [];
            pointagesParJour[jour].push(p);
            
            // Aussi grouper par date complète pour le clic
            if (!pointagesParDateComplete[p.date]) pointagesParDateComplete[p.date] = [];
            pointagesParDateComplete[p.date].push(p);
        });
        
        let calendrierHtml = `
            <div class="has-text-centered mb-4">
                <h3 class="title is-4 has-text-white">${this.getMonthName(mois)} ${annee}</h3>
                <p class="has-text-grey-light">${pointages.length} pointage(s) trouvé(s)</p>
            </div>
            
            <div class="table-container">
                <table class="table is-fullwidth has-background-dark">
                    <thead>
                        <tr>
                            <th class="has-text-grey-light">Dim</th>
                            <th class="has-text-grey-light">Lun</th>
                            <th class="has-text-grey-light">Mar</th>
                            <th class="has-text-grey-light">Mer</th>
                            <th class="has-text-grey-light">Jeu</th>
                            <th class="has-text-grey-light">Ven</th>
                            <th class="has-text-grey-light">Sam</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        let jour = 1;
        let finMois = false;
        
        // Générer les semaines
        while (!finMois) {
            calendrierHtml += '<tr>';
            
            // Générer les 7 jours de la semaine
            for (let jourSemaine = 0; jourSemaine < 7; jourSemaine++) {
                if ((jour === 1 && jourSemaine < premierJourSemaine) || jour > joursEnMois) {
                    // Cellule vide
                    calendrierHtml += '<td class="has-background-grey-darker"></td>';
                } else {
                    const pointagesJour = pointagesParJour[jour] || [];
                    const aDesPointages = pointagesJour.length > 0;
                    
                    // Si on a des pointages, utiliser la vraie date du premier pointage
                    let dateReelle = `${annee}-${mois.toString().padStart(2, '0')}-${jour.toString().padStart(2, '0')}`;
                    if (aDesPointages && pointagesJour.length > 0) {
                        dateReelle = pointagesJour[0].date; // Utiliser la vraie date du pointage
                    }
                    
                    calendrierHtml += `
                        <td class="has-background-grey-dark ${aDesPointages ? 'is-clickable' : ''}" 
                            ${aDesPointages ? `onclick="app.afficherPointagesJour('${dateReelle}')" style="cursor: pointer;"` : ''}>
                            <div class="p-2">
                                <div class="has-text-white has-text-weight-bold mb-1">${jour}</div>
                                ${pointagesJour.map(p => {
                                    const artisan = artisans.find(a => a.id == p.artisan_id);
                                    return `
                                        <div class="tag is-small is-info mb-1" style="font-size: 0.65rem;">
                                            ${artisan ? artisan.prenom : 'N/A'} - ${p.heures_travaillees}h
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </td>
                    `;
                    jour++;
                }
            }
            
            calendrierHtml += '</tr>';
            
            if (jour > joursEnMois) {
                finMois = true;
            }
        }
        
        calendrierHtml += `
                    </tbody>
                </table>
            </div>
            
            <div class="has-text-centered mt-4">
                <p class="has-text-grey-light">
                    <i class="fas fa-info-circle mr-1"></i>
                    Cliquez sur une date pour voir le détail des pointages
                </p>
            </div>
        `;
        
        container.innerHTML = calendrierHtml;
    }

    afficherPointagesJour(dateStr) {
        const pointages = this.storage.get('pointages') || [];
        const artisans = this.storage.get('artisans') || [];
        
        const pointagesJour = pointages.filter(p => p.date === dateStr);
        
        if (pointagesJour.length === 0) {
            this.showNotification(`Aucun pointage trouvé pour le ${dateStr}`, 'info');
            return;
        }
        
        const modalHTML = `
            <div class="modal is-active" id="pointagesJourModal">
                <div class="modal-background" onclick="app.closeModal('pointagesJourModal')"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">
                            <i class="fas fa-calendar-day mr-2"></i>
                            Pointages du ${this.formatDate(dateStr)}
                        </p>
                        <button class="delete" onclick="app.closeModal('pointagesJourModal')"></button>
                    </header>
                    <section class="modal-card-body">
                        ${pointagesJour.map(p => {
                            const artisan = artisans.find(a => a.id == p.artisan_id);
                            const hasPhotos = p.photos && p.photos.length > 0;
                            const hasNotes = p.notes && p.notes.trim() !== '';
                            
                            return `
                                <div class="box has-background-grey-darker mb-4 is-clickable" 
                                     onclick="app.closeModal('pointagesJourModal'); app.showPointageDetail('${p.id}')"
                                     style="cursor: pointer;">
                                    <div class="level">
                                        <div class="level-left">
                                            <div>
                                                <p class="has-text-weight-bold has-text-white">
                                                    ${artisan ? `${artisan.prenom} ${artisan.nom}` : 'Artisan inconnu'}
                                                    <span class="ml-2">
                                                        ${hasPhotos ? '<i class="fas fa-camera has-text-info" title="Photos"></i>' : ''}
                                                        ${hasNotes ? '<i class="fas fa-sticky-note has-text-warning ml-1" title="Notes"></i>' : ''}
                                                    </span>
                                                </p>
                                                <p class="has-text-grey-light">
                                                    ${p.heure_debut} - ${p.heure_fin} | ${p.type_travaux}
                                                </p>
                                                <p class="has-text-grey-light">${p.etape_maison}</p>
                                            </div>
                                        </div>
                                        <div class="level-right">
                                            <div class="has-text-right">
                                                <p class="has-text-grey-light">${p.heures_travaillees}h</p>
                                                <p class="title is-5 has-text-warning">
                                                    ${this.formatCurrency(p.cout_main_oeuvre_ttc)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                        
                        <div class="box has-background-dark">
                            <div class="level">
                                <div class="level-left">
                                    <p class="has-text-white has-text-weight-bold">Total de la journée</p>
                                </div>
                                <div class="level-right">
                                    <div class="has-text-right">
                                        <p class="has-text-grey-light">
                                            ${pointagesJour.reduce((sum, p) => sum + p.heures_travaillees, 0)}h totales
                                        </p>
                                        <p class="title is-4 has-text-success">
                                            ${this.formatCurrency(pointagesJour.reduce((sum, p) => sum + p.cout_main_oeuvre_ttc, 0))}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <footer class="modal-card-foot">
                        <button class="button" onclick="app.closeModal('pointagesJourModal')">Fermer</button>
                    </footer>
                </div>
            </div>
        `;
        
        document.getElementById('modals').innerHTML = modalHTML;
    }

    getMonthName(mois) {
        const moisNoms = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        return moisNoms[mois - 1];
    }

    // ===================================
    // 9. MATÉRIAUX
    // ===================================

    loadMateriaux() {
        const factures = this.storage.get('factures');
        const tbody = document.getElementById('facturesTableBody');
        
        if (!tbody) return;

        if (factures.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="has-text-centered has-text-grey-light">
                        Aucune facture enregistrée
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = factures.map(facture => `
            <tr>
                <td>${this.formatDate(facture.date_achat)}</td>
                <td>${facture.fournisseur}</td>
                <td>
                    <span class="tag is-primary">${facture.categorie}</span>
                </td>
                <td>${this.formatCurrency(facture.montant_ht)}</td>
                <td>${this.formatCurrency(facture.tps_5_pct)}</td>
                <td>${this.formatCurrency(facture.tvq_9975_pct)}</td>
                <td class="has-text-weight-bold">${this.formatCurrency(facture.montant_total)}</td>
                <td>
                    <span class="tag is-${facture.payee ? 'success' : 'warning'}">
                        ${facture.payee ? 'Payée' : 'En attente'}
                    </span>
                </td>
                <td>
                    <button class="button is-small is-info" onclick="app.viewFacture('${facture.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="button is-small is-danger" onclick="app.deleteFacture('${facture.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    showFactureModal(factureId = null) {
        const facture = factureId ? this.storage.get('factures').find(f => f.id === factureId) : null;
        const title = facture ? 'Modifier la facture' : 'Ajouter une facture';
        
        const modalHTML = `
            <div class="modal is-active" id="factureModal">
                <div class="modal-background" onclick="app.closeModal('factureModal')"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">${title}</p>
                        <button class="delete" onclick="app.closeModal('factureModal')"></button>
                    </header>
                    <section class="modal-card-body">
                        <form id="formFacture">
                            <div class="columns">
                                <div class="column">
                                    <div class="field">
                                        <label class="label has-text-white">Date d'achat</label>
                                        <div class="control">
                                            <input type="date" class="input" name="date_achat" required 
                                                value="${facture?.date_achat || ''}">
                                        </div>
                                    </div>
                                </div>
                                <div class="column">
                                    <div class="field">
                                        <label class="label has-text-white">Numéro de facture</label>
                                        <div class="control">
                                            <input type="text" class="input" name="numero_facture" 
                                                value="${facture?.numero_facture || ''}">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="field">
                                <label class="label has-text-white">Fournisseur</label>
                                <div class="control">
                                    <div class="select is-fullwidth">
                                        <select name="fournisseur" required>
                                            <option value="">Sélectionner un fournisseur</option>
                                            <option value="Réno-Dépôt">Réno-Dépôt</option>
                                            <option value="Home Depot">Home Depot</option>
                                            <option value="Rona">Rona</option>
                                            <option value="BMR">BMR</option>
                                            <option value="Canac">Canac</option>
                                            <option value="Patrick Morin">Patrick Morin</option>
                                            <option value="Autre">Autre</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="field">
                                <label class="label has-text-white">Catégorie</label>
                                <div class="control">
                                    <div class="select is-fullwidth">
                                        <select name="categorie" required>
                                            <option value="">Sélectionner une catégorie</option>
                                            <option value="Bois d'œuvre">Bois d'œuvre</option>
                                            <option value="Électricité">Électricité</option>
                                            <option value="Plomberie">Plomberie</option>
                                            <option value="Isolation">Isolation</option>
                                            <option value="Toiture">Toiture</option>
                                            <option value="Revêtement">Revêtement</option>
                                            <option value="Gypse">Gypse</option>
                                            <option value="Quincaillerie">Quincaillerie</option>
                                            <option value="Outils">Outils</option>
                                            <option value="Autre">Autre</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="field">
                                <label class="label has-text-white">Montant HT ($)</label>
                                <div class="control">
                                    <input type="number" class="input" name="montant_ht" 
                                        step="0.01" min="0" required
                                        onchange="app.calculerTaxesFacture(this.value)"
                                        value="${facture?.montant_ht || ''}">
                                </div>
                            </div>

                            <div class="columns">
                                <div class="column">
                                    <div class="field">
                                        <label class="label has-text-white">TPS (5%)</label>
                                        <div class="control">
                                            <input type="number" class="input" id="factureTPS" 
                                                step="0.01" readonly
                                                value="${facture?.tps_5_pct || ''}">
                                        </div>
                                    </div>
                                </div>
                                <div class="column">
                                    <div class="field">
                                        <label class="label has-text-white">TVQ (9.975%)</label>
                                        <div class="control">
                                            <input type="number" class="input" id="factureTVQ" 
                                                step="0.01" readonly
                                                value="${facture?.tvq_9975_pct || ''}">
                                        </div>
                                    </div>
                                </div>
                                <div class="column">
                                    <div class="field">
                                        <label class="label has-text-white">Total TTC</label>
                                        <div class="control">
                                            <input type="number" class="input" id="factureTotal" 
                                                step="0.01" readonly
                                                value="${facture?.montant_total || ''}">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="field">
                                <label class="label has-text-white">Description</label>
                                <div class="control">
                                    <textarea class="textarea" name="description" rows="2">${facture?.description || ''}</textarea>
                                </div>
                            </div>

                            <div class="field">
                                <label class="label has-text-white">Photo de la facture</label>
                                <div class="control">
                                    <input type="file" class="input" name="photo_facture" accept="image/*">
                                </div>
                            </div>

                            <div class="field">
                                <div class="control">
                                    <label class="checkbox">
                                        <input type="checkbox" name="payee" ${facture?.payee ? 'checked' : ''}>
                                        <span class="has-text-white ml-2">Facture payée</span>
                                    </label>
                                </div>
                            </div>
                        </form>
                    </section>
                    <footer class="modal-card-foot">
                        <button class="button is-success" onclick="app.saveFacture('${factureId || ''}')">
                            <i class="fas fa-save mr-2"></i> Enregistrer
                        </button>
                        <button class="button" onclick="app.closeModal('factureModal')">Annuler</button>
                    </footer>
                </div>
            </div>
        `;
        
        document.getElementById('modals').innerHTML = modalHTML;
        
        // Si modification, calculer les taxes
        if (facture) {
            this.calculerTaxesFacture(facture.montant_ht);
        }
    }

    calculerTaxesFacture(montantHT) {
        const montant = Math.max(0, parseFloat(montantHT) || 0);
        const tps = TaxesQuebecService.calculerTPS(montant);
        const tvq = TaxesQuebecService.calculerTVQ(montant);
        const total = montant + tps + tvq;

        document.getElementById('factureTPS').value = tps.toFixed(2);
        document.getElementById('factureTVQ').value = tvq.toFixed(2);
        document.getElementById('factureTotal').value = total.toFixed(2);
    }

    async saveFacture(factureId) {
        const form = document.getElementById('formFacture');
        const formData = new FormData(form);
        
        const montantHT = parseFloat(formData.get('montant_ht')) || 0;
        const tps = TaxesQuebecService.calculerTPS(montantHT);
        const tvq = TaxesQuebecService.calculerTVQ(montantHT);
        
        // Gérer la photo
        let photoId = null;
        const photoInput = form.querySelector('input[name="photo_facture"]');
        if (photoInput.files.length > 0) {
            const photoData = await this.fileToBase64(photoInput.files[0]);
            photoId = await this.storage.savePhoto(photoData, 'facture');
        }

        const factureData = {
            id: factureId || `facture_${Date.now()}`,
            date_achat: formData.get('date_achat'),
            fournisseur: formData.get('fournisseur'),
            numero_facture: formData.get('numero_facture'),
            montant_ht: montantHT,
            tps_5_pct: tps,
            tvq_9975_pct: tvq,
            taxes_totales: tps + tvq,
            montant_total: montantHT + tps + tvq,
            categorie: formData.get('categorie'),
            description: formData.get('description'),
            photo_facture: photoId,
            payee: formData.get('payee') === 'on'
        };

        let factures = this.storage.get('factures');
        
        if (factureId) {
            const index = factures.findIndex(f => f.id === factureId);
            if (index !== -1) {
                factures[index] = factureData;
            }
        } else {
            factures.push(factureData);
        }
        
        this.storage.save('factures', factures);
        this.closeModal('factureModal');
        this.loadMateriaux();
        this.showNotification('Facture enregistrée avec succès', 'success');
    }

    viewFacture(factureId) {
        const facture = this.storage.get('factures').find(f => f.id === factureId);
        
        const modalHTML = `
            <div class="modal is-active" id="viewFactureModal">
                <div class="modal-background" onclick="app.closeModal('viewFactureModal')"></div>
                <div class="modal-content">
                    <div class="box has-background-dark">
                        <h3 class="title is-4 has-text-white">Détails de la facture</h3>
                        <div class="content has-text-grey-light">
                            <p><strong>Date:</strong> ${this.formatDate(facture.date_achat)}</p>
                            <p><strong>Fournisseur:</strong> ${facture.fournisseur}</p>
                            <p><strong>Numéro:</strong> ${facture.numero_facture || '-'}</p>
                            <p><strong>Catégorie:</strong> ${facture.categorie}</p>
                            <hr>
                            <p><strong>Montant HT:</strong> ${this.formatCurrency(facture.montant_ht)}</p>
                            <p><strong>TPS (5%):</strong> ${this.formatCurrency(facture.tps_5_pct)}</p>
                            <p><strong>TVQ (9.975%):</strong> ${this.formatCurrency(facture.tvq_9975_pct)}</p>
                            <p class="title is-4 has-text-warning">
                                <strong>Total TTC:</strong> ${this.formatCurrency(facture.montant_total)}
                            </p>
                            ${facture.description ? `<p><strong>Description:</strong> ${facture.description}</p>` : ''}
                        </div>
                    </div>
                </div>
                <button class="modal-close is-large" onclick="app.closeModal('viewFactureModal')"></button>
            </div>
        `;
        
        document.getElementById('modals').innerHTML = modalHTML;
    }

    deleteFacture(factureId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
            let factures = this.storage.get('factures');
            factures = factures.filter(f => f.id !== factureId);
            this.storage.save('factures', factures);
            this.loadMateriaux();
            this.showNotification('Facture supprimée', 'warning');
        }
    }

    // ===================================
    // 10. PAIEMENTS
    // ===================================

    loadPaiements() {
        this.loadSoldesDusArtisans();
        this.loadPaiementsMainOeuvre();
        this.loadPaiementsMateriaux();
    }

    loadSoldesDusArtisans() {
        const container = document.getElementById('soldesDusArtisans');
        if (!container) return;

        const artisans = this.storage.get('artisans').filter(a => a.statut === 'actif');
        
        if (artisans.length === 0) {
            container.innerHTML = `
                <div class="notification is-dark">
                    <p class="has-text-grey-light">Aucun artisan actif</p>
                </div>
            `;
            return;
        }

        // Calculer les soldes pour chaque artisan
        const artisansAvecSoldes = artisans.map(artisan => {
            const solde = this.calculs.calculerSoldeArtisan(artisan.id);
            return { ...artisan, solde };
        }).filter(artisan => artisan.solde > 0); // Afficher seulement ceux qui ont un solde positif

        if (artisansAvecSoldes.length === 0) {
            container.innerHTML = `
                <div class="notification is-success">
                    <p class="has-text-white">🎉 Tous les artisans sont payés à jour !</p>
                </div>
            `;
            return;
        }

        container.innerHTML = artisansAvecSoldes.map(artisan => `
            <div class="box has-background-grey-darker mb-3">
                <div class="level">
                    <div class="level-left">
                        <div>
                            <p class="has-text-weight-bold has-text-white">
                                ${artisan.prenom} ${artisan.nom}
                            </p>
                            <p class="has-text-grey-light">${artisan.specialite}</p>
                            <p class="has-text-grey-light">Taux: ${this.formatCurrency(artisan.taux_horaire_ttc)}/h</p>
                        </div>
                    </div>
                    <div class="level-right">
                        <div class="has-text-right">
                            <p class="title is-4 has-text-danger">
                                ${this.formatCurrency(artisan.solde)}
                            </p>
                            <p class="has-text-grey-light">Solde dû</p>
                            <div class="buttons">
                                <button class="button is-success is-small" onclick="app.payerArtisanComplet(${artisan.id})">
                                    <i class="fas fa-money-bill"></i>
                                    <span class="ml-1">Payer tout</span>
                                </button>
                                <button class="button is-warning is-small" onclick="app.payerArtisanPartiel(${artisan.id})">
                                    <i class="fas fa-hand-holding-usd"></i>
                                    <span class="ml-1">Paiement partiel</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    loadPaiementsMainOeuvre() {
        const container = document.getElementById('paiementsMainOeuvre');
        if (!container) return;

        const paiements = this.storage.get('paiements').filter(p => p.type === 'acompte_main_oeuvre');
        const artisans = this.storage.get('artisans');

        if (paiements.length === 0) {
            container.innerHTML = `
                <div class="notification is-dark">
                    <p class="has-text-grey-light">Aucun paiement enregistré</p>
                </div>
            `;
            return;
        }

        container.innerHTML = paiements.slice(-10).reverse().map(p => {
            const artisan = artisans.find(a => a.id === p.artisan_id);
            return `
                <div class="box has-background-dark mb-2">
                    <div class="level">
                        <div class="level-left">
                            <div>
                                <p class="has-text-weight-bold">
                                    ${artisan ? `${artisan.prenom} ${artisan.nom}` : 'Artisan inconnu'}
                                </p>
                                <p class="has-text-grey-light is-size-7">
                                    ${this.formatDate(p.date_paiement)} | ${p.mode_paiement}
                                </p>
                            </div>
                        </div>
                        <div class="level-right">
                            <span class="tag is-warning is-medium">
                                ${this.formatCurrency(p.montant_ttc)}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    loadPaiementsMateriaux() {
        const container = document.getElementById('paiementsMateriaux');
        if (!container) return;

        const paiements = this.storage.get('paiements').filter(p => p.type === 'paiement_materiaux');
        
        if (paiements.length === 0) {
            container.innerHTML = `
                <div class="notification is-dark">
                    <p class="has-text-grey-light">Aucun paiement enregistré</p>
                </div>
            `;
            return;
        }

        container.innerHTML = paiements.slice(-10).reverse().map(p => `
            <div class="box has-background-dark mb-2">
                <div class="level">
                    <div class="level-left">
                        <div>
                            <p class="has-text-weight-bold">${p.note || 'Paiement matériaux'}</p>
                            <p class="has-text-grey-light is-size-7">
                                ${this.formatDate(p.date_paiement)} | ${p.mode_paiement}
                            </p>
                        </div>
                    </div>
                    <div class="level-right">
                        <span class="tag is-success is-medium">
                            ${this.formatCurrency(p.montant)}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    showPaiementModal(type) {
        const isMainOeuvre = type === 'main_oeuvre';
        const title = isMainOeuvre ? 'Paiement Main-d\'œuvre' : 'Paiement Matériaux';
        
        let selectOptions = '';
        if (isMainOeuvre) {
            const artisans = this.storage.get('artisans').filter(a => a.statut === 'actif');
            selectOptions = artisans.map(a => 
                `<option value="${a.id}">${a.prenom} ${a.nom} - Solde: ${this.formatCurrency(this.calculs.calculerSoldeArtisan(a.id))}</option>`
            ).join('');
        }

        const modalHTML = `
            <div class="modal is-active" id="paiementModal">
                <div class="modal-background" onclick="app.closeModal('paiementModal')"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">${title}</p>
                        <button class="delete" onclick="app.closeModal('paiementModal')"></button>
                    </header>
                    <section class="modal-card-body">
                        <form id="formPaiement">
                            ${isMainOeuvre ? `
                                <div class="field">
                                    <label class="label has-text-white">Artisan</label>
                                    <div class="control">
                                        <div class="select is-fullwidth">
                                            <select name="artisan_id" required>
                                                <option value="">Sélectionner un artisan</option>
                                                ${selectOptions}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div class="field">
                                <label class="label has-text-white">Montant ($)</label>
                                <div class="control">
                                    <input type="number" class="input" name="montant" 
                                        step="0.01" min="0" required>
                                </div>
                            </div>

                            <div class="field">
                                <label class="label has-text-white">Date de paiement</label>
                                <div class="control">
                                    <input type="date" class="input" name="date_paiement" 
                                        value="${new Date().toISOString().split('T')[0]}" required>
                                </div>
                            </div>

                            <div class="field">
                                <label class="label has-text-white">Mode de paiement</label>
                                <div class="control">
                                    <div class="select is-fullwidth">
                                        <select name="mode_paiement" required>
                                            <option value="Chèque">Chèque</option>
                                            <option value="Virement">Virement</option>
                                            <option value="Espèces">Espèces</option>
                                            <option value="Carte crédit">Carte crédit</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="field">
                                <label class="label has-text-white">Note</label>
                                <div class="control">
                                    <input type="text" class="input" name="note" 
                                        placeholder="Ex: Acompte semaine 1">
                                </div>
                            </div>

                            <input type="hidden" name="type" value="${type}">
                        </form>
                    </section>
                    <footer class="modal-card-foot">
                        <button class="button is-success" onclick="app.savePaiement()">
                            <i class="fas fa-save mr-2"></i> Enregistrer
                        </button>
                        <button class="button" onclick="app.closeModal('paiementModal')">Annuler</button>
                    </footer>
                </div>
            </div>
        `;
        
        document.getElementById('modals').innerHTML = modalHTML;
    }

    savePaiement() {
        const form = document.getElementById('formPaiement');
        const formData = new FormData(form);
        
        const type = formData.get('type');
        const montant = parseFloat(formData.get('montant'));
        
        const paiementData = {
            id: `paiement_${Date.now()}`,
            type: type === 'main_oeuvre' ? 'acompte_main_oeuvre' : 'paiement_materiaux',
            montant: type === 'materiaux' ? montant : 0,
            montant_ttc: type === 'main_oeuvre' ? montant : 0,
            date_paiement: formData.get('date_paiement'),
            mode_paiement: formData.get('mode_paiement'),
            note: formData.get('note'),
            taxes_incluses: true
        };

        if (type === 'main_oeuvre') {
            paiementData.artisan_id = formData.get('artisan_id');
        }

        let paiements = this.storage.get('paiements');
        paiements.push(paiementData);
        this.storage.save('paiements', paiements);
        
        this.closeModal('paiementModal');
        this.loadPaiements();
        this.showNotification('Paiement enregistré avec succès', 'success');
    }

    payerArtisanComplet(artisanId) {
        const artisan = this.storage.get('artisans').find(a => a.id === artisanId);
        const solde = this.calculs.calculerSoldeArtisan(artisanId);
        
        if (!artisan || solde <= 0) {
            this.showNotification('Aucun montant à payer pour cet artisan', 'info');
            return;
        }

        this.showPaiementModal(artisanId, solde, 'complet');
    }

    payerArtisanPartiel(artisanId) {
        const artisan = this.storage.get('artisans').find(a => a.id === artisanId);
        const solde = this.calculs.calculerSoldeArtisan(artisanId);
        
        if (!artisan || solde <= 0) {
            this.showNotification('Aucun montant à payer pour cet artisan', 'info');
            return;
        }

        this.showPaiementModal(artisanId, solde, 'partiel');
    }

    showPaiementModal(artisanId, soldeDu, typePaiement) {
        const artisan = this.storage.get('artisans').find(a => a.id === artisanId);
        const montantDefaut = typePaiement === 'complet' ? soldeDu : '';
        const titre = typePaiement === 'complet' ? 'Paiement complet' : 'Paiement partiel';
        
        const modalHTML = `
            <div class="modal is-active" id="paiementArtisanModal">
                <div class="modal-background" onclick="app.closeModal('paiementArtisanModal')"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">${titre} - ${artisan.prenom} ${artisan.nom}</p>
                        <button class="delete" onclick="app.closeModal('paiementArtisanModal')"></button>
                    </header>
                    <section class="modal-card-body">
                        <div class="notification is-info">
                            <p><strong>Spécialité:</strong> ${artisan.specialite}</p>
                            <p><strong>Solde dû total:</strong> ${this.formatCurrency(soldeDu)}</p>
                        </div>
                        
                        <form id="formPaiementArtisan" data-artisan-id="${artisanId}">
                            <div class="field">
                                <label class="label has-text-white">Montant à payer</label>
                                <div class="control">
                                    <input type="number" 
                                           name="montant" 
                                           class="input" 
                                           step="0.01" 
                                           min="0.01" 
                                           max="${soldeDu}" 
                                           value="${montantDefaut}"
                                           placeholder="Montant en CAD$" 
                                           required>
                                </div>
                                ${typePaiement === 'partiel' ? `<p class="help has-text-warning">Maximum: ${this.formatCurrency(soldeDu)}</p>` : ''}
                            </div>
                            
                            <div class="field">
                                <label class="label has-text-white">Date de paiement</label>
                                <div class="control">
                                    <input type="date" 
                                           name="date" 
                                           class="input" 
                                           value="${new Date().toISOString().split('T')[0]}" 
                                           required>
                                </div>
                            </div>
                            
                            <div class="field">
                                <label class="label has-text-white">Méthode de paiement</label>
                                <div class="control">
                                    <div class="select is-fullwidth">
                                        <select name="methode_paiement" required>
                                            <option value="virement">Virement bancaire</option>
                                            <option value="cheque">Chèque</option>
                                            <option value="especes">Espèces</option>
                                            <option value="carte_credit">Carte de crédit</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="field">
                                <label class="label has-text-white">Référence de paiement</label>
                                <div class="control">
                                    <input type="text" 
                                           name="reference" 
                                           class="input" 
                                           placeholder="Ex: VIRE-2025-001, Chèque #1234">
                                </div>
                            </div>
                            
                            <div class="field">
                                <label class="label has-text-white">Notes</label>
                                <div class="control">
                                    <textarea name="notes" 
                                             class="textarea" 
                                             placeholder="Notes optionnelles..."></textarea>
                                </div>
                            </div>
                        </form>
                    </section>
                    <footer class="modal-card-foot">
                        <button class="button is-success" onclick="app.savePaiementArtisan()">
                            <i class="fas fa-save"></i>
                            <span class="ml-2">Enregistrer le paiement</span>
                        </button>
                        <button class="button" onclick="app.closeModal('paiementArtisanModal')">Annuler</button>
                    </footer>
                </div>
            </div>
        `;
        
        document.getElementById('modals').innerHTML = modalHTML;
    }

    savePaiementArtisan() {
        const form = document.getElementById('formPaiementArtisan');
        const formData = new FormData(form);
        const artisanId = parseInt(form.dataset.artisanId);
        
        const montant = parseFloat(formData.get('montant'));
        const soldeDu = this.calculs.calculerSoldeArtisan(artisanId);
        
        if (montant > soldeDu) {
            this.showNotification(`Le montant ne peut pas dépasser le solde dû de ${this.formatCurrency(soldeDu)}`, 'danger');
            return;
        }
        
        // Générer un ID unique pour le paiement
        const paiements = this.storage.get('paiements');
        const newId = paiements.length > 0 ? Math.max(...paiements.map(p => p.id)) + 1 : 1;
        
        const paiementData = {
            id: newId,
            type: 'acompte_main_oeuvre',
            artisan_id: artisanId,
            date: formData.get('date'),
            montant: montant,
            montant_ttc: montant, // Pour la main d'œuvre, les taxes sont généralement incluses
            methode_paiement: formData.get('methode_paiement'),
            reference: formData.get('reference') || '',
            notes: formData.get('notes') || `Paiement ${montant === soldeDu ? 'complet' : 'partiel'} de salaire`
        };
        
        paiements.push(paiementData);
        this.storage.save('paiements', paiements);
        
        this.closeModal('paiementArtisanModal');
        this.loadPaiements();
        
        const artisan = this.storage.get('artisans').find(a => a.id === artisanId);
        const nouveauSolde = this.calculs.calculerSoldeArtisan(artisanId);
        
        if (nouveauSolde <= 0) {
            this.showNotification(`✅ ${artisan.prenom} ${artisan.nom} est maintenant payé intégralement !`, 'success');
        } else {
            this.showNotification(`💰 Paiement de ${this.formatCurrency(montant)} enregistré. Solde restant: ${this.formatCurrency(nouveauSolde)}`, 'success');
        }
    }

    // ===================================
    // 11. CONFIGURATION
    // ===================================

    loadConfiguration() {
        this.loadConfigMaisonDetails();
        this.loadEtapesConstructionDetails();
    }

    loadConfigMaisonDetails() {
        let config = this.storage.get('config_maison');
        const container = document.getElementById('configMaisonDetails');
        
        if (!container) return;
        
        // Utiliser configuration par défaut si vide
        if (!config || Object.keys(config).length === 0) {
            config = {
                nom_projet: 'Configuration non définie',
                adresse_complete: 'Non définie',
                type_construction: 'Non défini',
                superficie_carree: 0,
                budget_total_estime: 0,
                budget_main_oeuvre: 0,
                budget_materiaux: 0,
                date_debut_prevue: 'Non définie',
                date_fin_prevue: 'Non définie',
                permis_construction: 'Non défini',
                licence_rbq: 'Non définie'
            };
        }
        
        container.innerHTML = `
            <div class="content has-text-white">
                <p><strong>Nom du projet:</strong> ${config.nom_projet || 'Non défini'}</p>
                <p><strong>Adresse:</strong> ${config.adresse_complete || 'Non définie'}</p>
                <p><strong>Type:</strong> ${config.type_construction || 'Non défini'}</p>
                <p><strong>Superficie:</strong> ${config.superficie_carree || 0} pi²</p>
                <p><strong>Dates:</strong> ${config.date_debut_prevue || 'Non définie'} à ${config.date_fin_prevue || 'Non définie'}</p>
                <p><strong>Budget total:</strong> ${this.formatCurrency(config.budget_total_estime || 0)}</p>
                <p><strong>Budget main-d'œuvre:</strong> ${this.formatCurrency(config.budget_main_oeuvre || 0)}</p>
                <p><strong>Budget matériaux:</strong> ${this.formatCurrency(config.budget_materiaux || 0)}</p>
                <hr>
                <p><strong>Permis construction:</strong> ${config.permis_construction || 'Non défini'}</p>
                <p><strong>Licence RBQ:</strong> ${config.licence_rbq || 'Non définie'}</p>
            </div>
        `;
    }

    loadEtapesConstructionDetails() {
        const etapes = this.storage.get('etapes_construction');
        const container = document.getElementById('etapesConstructionDetails');
        
        if (!container) return;
        
        let html = '<div class="content has-text-white"><ul>';
        etapes.forEach(etape => {
            html += `
                <li>
                    <strong>${etape.nom}</strong><br>
                    Durée: ${etape.duree_estimee_jours} jours | 
                    Statut: ${etape.statut} | 
                    ${etape.pourcent_complete}% complété
                </li>
            `;
        });
        html += '</ul></div>';
        
        container.innerHTML = html;
    }

    editConfigMaison() {
        console.log('editConfigMaison appelée');
        let config = this.storage.get('config_maison');
        console.log('Configuration chargée:', config);
        
        // Initialiser une configuration par défaut si elle est vide
        if (!config || Object.keys(config).length === 0) {
            config = {
                nom_projet: 'Ma Maison - Québec',
                adresse_complete: '',
                type_construction: 'Maison unifamiliale neuve',
                superficie_carree: 1850,
                budget_total_estime: 450000.00,
                budget_main_oeuvre: 180000.00,
                budget_materiaux: 270000.00,
                date_debut_prevue: '',
                date_fin_prevue: '',
                permis_construction: '',
                licence_rbq: '',
                proprietaire: {
                    nom: '',
                    telephone: '',
                    email: ''
                },
                entrepreneur_general: {
                    nom: '',
                    licence_rbq: '',
                    telephone: ''
                }
            };
            console.log('Configuration par défaut créée:', config);
        }
        
        // S'assurer que les sous-objets existent même si la config existe déjà
        if (!config.proprietaire) {
            config.proprietaire = { nom: '', telephone: '', email: '' };
        }
        if (!config.entrepreneur_general) {
            config.entrepreneur_general = { nom: '', licence_rbq: '', telephone: '' };
        }
        
        const modalHTML = `
            <div class="modal is-active" id="configMaisonModal">
                <div class="modal-background" onclick="app.closeModal('configMaisonModal')"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">Modifier la Configuration de la Maison</p>
                        <button class="delete" onclick="app.closeModal('configMaisonModal')"></button>
                    </header>
                    <section class="modal-card-body">
                        <form id="formConfigMaison">
                            <div class="field">
                                <label class="label has-text-white">Nom du projet</label>
                                <div class="control">
                                    <input type="text" class="input" name="nom_projet" 
                                        value="${config.nom_projet}" required>
                                </div>
                            </div>
                            
                            <div class="field">
                                <label class="label has-text-white">Adresse complète</label>
                                <div class="control">
                                    <input type="text" class="input" name="adresse_complete" 
                                        value="${config.adresse_complete}" required>
                                </div>
                            </div>
                            
                            <div class="field">
                                <label class="label has-text-white">Type de construction</label>
                                <div class="control">
                                    <input type="text" class="input" name="type_construction" 
                                        value="${config.type_construction}" required>
                                </div>
                            </div>
                            
                            <div class="columns">
                                <div class="column">
                                    <div class="field">
                                        <label class="label has-text-white">Superficie (pi²)</label>
                                        <div class="control">
                                            <input type="number" class="input" name="superficie_carree" 
                                                value="${config.superficie_carree}" min="0" required>
                                        </div>
                                    </div>
                                </div>
                                <div class="column">
                                    <div class="field">
                                        <label class="label has-text-white">Étages</label>
                                        <div class="control">
                                            <input type="number" class="input" name="etages" 
                                                value="${config.etages}" min="1" max="5" required>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="columns">
                                <div class="column">
                                    <div class="field">
                                        <label class="label has-text-white">Date début prévue</label>
                                        <div class="control">
                                            <input type="date" class="input" name="date_debut_prevue" 
                                                value="${config.date_debut_prevue}" required>
                                        </div>
                                    </div>
                                </div>
                                <div class="column">
                                    <div class="field">
                                        <label class="label has-text-white">Date fin prévue</label>
                                        <div class="control">
                                            <input type="date" class="input" name="date_fin_prevue" 
                                                value="${config.date_fin_prevue}" required>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="field">
                                <label class="label has-text-white">Budget total estimé ($)</label>
                                <div class="control">
                                    <input type="number" class="input" name="budget_total_estime" 
                                        value="${config.budget_total_estime}" step="0.01" min="0" required>
                                </div>
                            </div>
                            
                            <div class="columns">
                                <div class="column">
                                    <div class="field">
                                        <label class="label has-text-white">Budget main-d'œuvre ($)</label>
                                        <div class="control">
                                            <input type="number" class="input" name="budget_main_oeuvre" 
                                                value="${config.budget_main_oeuvre}" step="0.01" min="0" required>
                                        </div>
                                    </div>
                                </div>
                                <div class="column">
                                    <div class="field">
                                        <label class="label has-text-white">Budget matériaux ($)</label>
                                        <div class="control">
                                            <input type="number" class="input" name="budget_materiaux" 
                                                value="${config.budget_materiaux}" step="0.01" min="0" required>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <hr>
                            <h3 class="subtitle has-text-white">Propriétaire</h3>
                            
                            <div class="field">
                                <label class="label has-text-white">Nom</label>
                                <div class="control">
                                    <input type="text" class="input" name="proprietaire_nom" 
                                        value="${config.proprietaire.nom}" required>
                                </div>
                            </div>
                            
                            <div class="columns">
                                <div class="column">
                                    <div class="field">
                                        <label class="label has-text-white">Téléphone</label>
                                        <div class="control">
                                            <input type="tel" class="input" name="proprietaire_telephone" 
                                                value="${config.proprietaire.telephone}">
                                        </div>
                                    </div>
                                </div>
                                <div class="column">
                                    <div class="field">
                                        <label class="label has-text-white">Email</label>
                                        <div class="control">
                                            <input type="email" class="input" name="proprietaire_email" 
                                                value="${config.proprietaire.email}">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <hr>
                            <h3 class="subtitle has-text-white">Entrepreneur général</h3>
                            
                            <div class="field">
                                <label class="label has-text-white">Nom</label>
                                <div class="control">
                                    <input type="text" class="input" name="entrepreneur_nom" 
                                        value="${config.entrepreneur_general.nom}" required>
                                </div>
                            </div>
                            
                            <div class="columns">
                                <div class="column">
                                    <div class="field">
                                        <label class="label has-text-white">Licence RBQ</label>
                                        <div class="control">
                                            <input type="text" class="input" name="licence_rbq" 
                                                value="${config.entrepreneur_general.licence_rbq}">
                                        </div>
                                    </div>
                                </div>
                                <div class="column">
                                    <div class="field">
                                        <label class="label has-text-white">Téléphone</label>
                                        <div class="control">
                                            <input type="tel" class="input" name="entrepreneur_telephone" 
                                                value="${config.entrepreneur_general.telephone}">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="field">
                                <label class="label has-text-white">Permis construction</label>
                                <div class="control">
                                    <input type="text" class="input" name="permis_construction" 
                                        value="${config.permis_construction}">
                                </div>
                            </div>
                            
                            <div class="field">
                                <label class="label has-text-white">Assurance chantier</label>
                                <div class="control">
                                    <input type="text" class="input" name="assurance_chantier" 
                                        value="${config.assurance_chantier}">
                                </div>
                            </div>
                        </form>
                    </section>
                    <footer class="modal-card-foot">
                        <button class="button is-success" onclick="app.saveConfigMaison()">
                            <i class="fas fa-save mr-2"></i> Enregistrer
                        </button>
                        <button class="button" onclick="app.closeModal('configMaisonModal')">Annuler</button>
                    </footer>
                </div>
            </div>
        `;
        
        document.getElementById('modals').innerHTML = modalHTML;
    }

    saveConfigMaison() {
        console.log('saveConfigMaison appelée');
        const form = document.getElementById('formConfigMaison');
        const formData = new FormData(form);
        
        let config = this.storage.get('config_maison');
        console.log('Configuration récupérée pour sauvegarde:', config);
        
        // S'assurer que la config est un objet valide avec toutes les propriétés
        if (!config || Object.keys(config).length === 0) {
            config = {};
        }
        
        // S'assurer que les sous-objets existent
        if (!config.proprietaire) {
            config.proprietaire = {};
        }
        if (!config.entrepreneur_general) {
            config.entrepreneur_general = {};
        }
        
        // Mettre à jour la configuration avec protection pour les valeurs numériques
        config.nom_projet = formData.get('nom_projet') || '';
        config.adresse_complete = formData.get('adresse_complete') || '';
        config.type_construction = formData.get('type_construction') || '';
        config.superficie_carree = parseInt(formData.get('superficie_carree')) || 0;
        config.date_debut_prevue = formData.get('date_debut_prevue') || '';
        config.date_fin_prevue = formData.get('date_fin_prevue') || '';
        config.budget_total_estime = parseFloat(formData.get('budget_total_estime')) || 0;
        config.budget_main_oeuvre = parseFloat(formData.get('budget_main_oeuvre')) || 0;
        config.budget_materiaux = parseFloat(formData.get('budget_materiaux')) || 0;
        config.permis_construction = formData.get('permis_construction') || '';
        config.licence_rbq = formData.get('licence_rbq') || '';
        
        // Propriétaire
        config.proprietaire.nom = formData.get('proprietaire_nom') || '';
        config.proprietaire.telephone = formData.get('proprietaire_telephone') || '';
        config.proprietaire.email = formData.get('proprietaire_email') || '';
        
        // Entrepreneur
        config.entrepreneur_general.nom = formData.get('entrepreneur_nom') || '';
        config.entrepreneur_general.licence_rbq = formData.get('licence_rbq') || '';
        config.entrepreneur_general.telephone = formData.get('entrepreneur_telephone') || '';
        
        console.log('Configuration finale à sauvegarder:', config);
        
        this.storage.save('config_maison', config);
        
        this.closeModal('configMaisonModal');
        this.loadConfigMaisonDetails();
        this.showNotification('Configuration mise à jour avec succès', 'success');
    }

    editEtapesConstruction() {
        console.log('editEtapesConstruction appelée');
        const etapes = this.storage.get('etapes_construction');
        console.log('Étapes chargées:', etapes);
        
        let etapesHTML = '';
        etapes.forEach((etape, index) => {
            etapesHTML += `
                <div class="box has-background-grey-dark mb-4">
                    <h4 class="subtitle has-text-white">${etape.nom}</h4>
                    <div class="columns">
                        <div class="column">
                            <div class="field">
                                <label class="label has-text-white">Durée (jours)</label>
                                <div class="control">
                                    <input type="number" class="input" id="etape_duree_${index}" 
                                        value="${etape.duree_estimee_jours}" min="1">
                                </div>
                            </div>
                        </div>
                        <div class="column">
                            <div class="field">
                                <label class="label has-text-white">Statut</label>
                                <div class="control">
                                    <div class="select is-fullwidth">
                                        <select id="etape_statut_${index}">
                                            <option value="planifie" ${etape.statut === 'planifie' ? 'selected' : ''}>Planifié</option>
                                            <option value="en_cours" ${etape.statut === 'en_cours' ? 'selected' : ''}>En cours</option>
                                            <option value="termine" ${etape.statut === 'termine' ? 'selected' : ''}>Terminé</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="column">
                            <div class="field">
                                <label class="label has-text-white">% Complété</label>
                                <div class="control">
                                    <input type="number" class="input" id="etape_pourcent_${index}" 
                                        value="${etape.pourcent_complete}" min="0" max="100">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="columns">
                        <div class="column">
                            <div class="field">
                                <label class="label has-text-white">Budget main-d'œuvre ($)</label>
                                <div class="control">
                                    <input type="number" class="input" id="etape_budget_mo_${index}" 
                                        value="${etape.budget_main_oeuvre}" step="0.01" min="0">
                                </div>
                            </div>
                        </div>
                        <div class="column">
                            <div class="field">
                                <label class="label has-text-white">Budget matériaux ($)</label>
                                <div class="control">
                                    <input type="number" class="input" id="etape_budget_mat_${index}" 
                                        value="${etape.budget_materiaux}" step="0.01" min="0">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        const modalHTML = `
            <div class="modal is-active" id="etapesModal">
                <div class="modal-background" onclick="app.closeModal('etapesModal')"></div>
                <div class="modal-card" style="width: 90%;">
                    <header class="modal-card-head">
                        <p class="modal-card-title">Modifier les Étapes de Construction</p>
                        <button class="delete" onclick="app.closeModal('etapesModal')"></button>
                    </header>
                    <section class="modal-card-body">
                        ${etapesHTML}
                    </section>
                    <footer class="modal-card-foot">
                        <button class="button is-success" onclick="app.saveEtapesConstruction()">
                            <i class="fas fa-save mr-2"></i> Enregistrer
                        </button>
                        <button class="button" onclick="app.closeModal('etapesModal')">Annuler</button>
                    </footer>
                </div>
            </div>
        `;
        
        document.getElementById('modals').innerHTML = modalHTML;
    }

    saveEtapesConstruction() {
        const etapes = this.storage.get('etapes_construction');
        
        etapes.forEach((etape, index) => {
            etape.duree_estimee_jours = parseInt(document.getElementById(`etape_duree_${index}`).value);
            etape.statut = document.getElementById(`etape_statut_${index}`).value;
            etape.pourcent_complete = parseInt(document.getElementById(`etape_pourcent_${index}`).value);
            etape.budget_main_oeuvre = parseFloat(document.getElementById(`etape_budget_mo_${index}`).value);
            etape.budget_materiaux = parseFloat(document.getElementById(`etape_budget_mat_${index}`).value);
        });
        
        this.storage.save('etapes_construction', etapes);
        
        this.closeModal('etapesModal');
        this.loadEtapesConstructionDetails();
        this.showNotification('Étapes mises à jour avec succès', 'success');
    }

    resetAllData() {
        if (!confirm('ATTENTION: Cette action va réinitialiser TOUTES les données. Êtes-vous sûr?')) {
            return;
        }
        
        if (!confirm('Dernière confirmation: Toutes vos données seront perdues. Continuer?')) {
            return;
        }
        
        // Supprimer toutes les données - Mode production propre
        localStorage.clear();
        
        // Supprimer aussi IndexedDB (photos)
        if (this.storage.db) {
            try {
                const transaction = this.storage.db.transaction(['photos'], 'readwrite');
                const store = transaction.objectStore('photos');
                store.clear();
            } catch (error) {
                console.log('Aucune photo à supprimer');
            }
        }
        
        // Réinitialiser le storage avec des données vides
        this.storage.initializeStorage();
        
        // Recharger la page pour afficher l'état vierge
        window.location.reload();
    }

    // ===================================
    // 11.5 EXPORT/IMPORT BACKUP
    // ===================================

    exportBackupJSON() {
        try {
            // Récupérer toutes les données
            const backup = {
                version: '1.0',
                date_export: new Date().toISOString(),
                data: {
                    config_maison: this.storage.get('config_maison'),
                    etapes_construction: this.storage.get('etapes_construction'),
                    artisans: this.storage.get('artisans'),
                    pointages: this.storage.get('pointages'),
                    factures_materiaux: this.storage.get('factures_materiaux'),
                    paiements: this.storage.get('paiements')
                }
            };

            // Créer le blob et le télécharger
            const dataStr = JSON.stringify(backup, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `backup_maison_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            this.showNotification('Sauvegarde exportée avec succès', 'success');
        } catch (error) {
            console.error('Erreur lors de l\'export:', error);
            this.showNotification('Erreur lors de l\'export de la sauvegarde', 'error');
        }
    }

    importBackupJSON() {
        // Créer un input file invisible
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const backup = JSON.parse(text);
                
                // Vérifier la structure
                if (!backup.version || !backup.data) {
                    throw new Error('Format de sauvegarde invalide');
                }
                
                // Confirmer l'import
                if (!confirm('Cette action va remplacer TOUTES les données actuelles. Continuer?')) {
                    return;
                }
                
                // Importer les données
                if (backup.data.config_maison) {
                    this.storage.save('config_maison', backup.data.config_maison);
                }
                if (backup.data.etapes_construction) {
                    this.storage.save('etapes_construction', backup.data.etapes_construction);
                }
                if (backup.data.artisans) {
                    this.storage.save('artisans', backup.data.artisans);
                }
                if (backup.data.pointages) {
                    this.storage.save('pointages', backup.data.pointages);
                }
                if (backup.data.factures_materiaux) {
                    this.storage.save('factures_materiaux', backup.data.factures_materiaux);
                }
                if (backup.data.paiements) {
                    this.storage.save('paiements', backup.data.paiements);
                }
                
                // Recharger la page
                this.showNotification('Sauvegarde importée avec succès', 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
                
            } catch (error) {
                console.error('Erreur lors de l\'import:', error);
                this.showNotification('Erreur lors de l\'import de la sauvegarde', 'error');
            }
        };
        
        // Déclencher le sélecteur de fichiers
        input.click();
    }

    // ===================================
    // 12. RAPPORTS ET EXPORTS
    // ===================================

    loadRapports() {
        // Les boutons sont déjà configurés dans setupEventListeners
    }

    async genererRapportBanque() {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        
        const config = this.storage.get('config');
        const couts = this.calculs.calculerCoutTotalMaison();
        const ecart = this.calculs.calculerEcartBudget();
        const avancement = this.calculs.calculerAvancementGlobal();
        
        // En-tête
        pdf.setFontSize(20);
        pdf.text('RAPPORT BANCAIRE - CONSTRUCTION MAISON', 20, 20);
        
        pdf.setFontSize(12);
        pdf.text(`Date: ${this.formatDate(new Date())}`, 20, 30);
        
        // Informations projet
        pdf.setFontSize(14);
        pdf.text('INFORMATIONS DU PROJET', 20, 45);
        pdf.setFontSize(10);
        pdf.text(`Adresse: ${config.adresse_complete || 'Non définie'}`, 20, 55);
        pdf.text(`Propriétaire: ${config.proprietaire?.nom || 'Non défini'}`, 20, 62);
        pdf.text(`Superficie: ${config.superficie_carree || 0} pi²`, 20, 69);
        
        // Budget
        pdf.setFontSize(14);
        pdf.text('ANALYSE FINANCIÈRE', 20, 85);
        pdf.setFontSize(10);
        pdf.text(`Budget total estimé: ${this.formatCurrency(config.budget_total_estime || 0)}`, 20, 95);
        pdf.text(`Coût total actuel: ${this.formatCurrency(couts.total)}`, 20, 102);
        pdf.text(`Écart budgétaire: ${this.formatCurrency(ecart.ecart_total)}`, 20, 109);
        pdf.text(`Pourcentage utilisé: ${ecart.pourcentage_utilise.toFixed(1)}%`, 20, 116);
        
        // Répartition
        pdf.text(`Main-d'œuvre: ${this.formatCurrency(couts.main_oeuvre)}`, 20, 130);
        pdf.text(`Matériaux: ${this.formatCurrency(couts.materiaux)}`, 20, 137);
        
        // Avancement
        pdf.setFontSize(14);
        pdf.text('AVANCEMENT DU PROJET', 20, 155);
        pdf.setFontSize(10);
        pdf.text(`Progression globale: ${Math.round(avancement)}%`, 20, 165);
        
        // Sauvegarde
        pdf.save(`rapport_banque_${new Date().toISOString().split('T')[0]}.pdf`);
        this.showNotification('Rapport bancaire généré', 'success');
    }

    async genererRapportAssurance() {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        
        const config = this.storage.get('config');
        const etapes = this.storage.get('etapes');
        
        // En-tête
        pdf.setFontSize(20);
        pdf.text('RAPPORT ASSURANCE HABITATION', 20, 20);
        
        pdf.setFontSize(12);
        pdf.text(`Date: ${this.formatDate(new Date())}`, 20, 30);
        
        // Informations projet
        pdf.setFontSize(14);
        pdf.text('DÉTAILS DE LA CONSTRUCTION', 20, 45);
        pdf.setFontSize(10);
        pdf.text(`Type: ${config.type_construction || 'Maison unifamiliale'}`, 20, 55);
        pdf.text(`Adresse: ${config.adresse_complete || 'Non définie'}`, 20, 62);
        pdf.text(`Superficie: ${config.superficie_carree || 0} pi²`, 20, 69);
        pdf.text(`Nombre d'étages: ${config.etages || 2}`, 20, 76);
        
        // Entrepreneur
        pdf.text(`Entrepreneur: ${config.entrepreneur_general?.nom || 'Non défini'}`, 20, 90);
        pdf.text(`Licence RBQ: ${config.entrepreneur_general?.licence_rbq || 'Non définie'}`, 20, 97);
        
        // Étapes complétées
        pdf.setFontSize(14);
        pdf.text('ÉTAPES DE CONSTRUCTION', 20, 115);
        pdf.setFontSize(10);
        
        let yPosition = 125;
        etapes.forEach(etape => {
            pdf.text(`${etape.nom}: ${etape.pourcent_complete}% complété`, 20, yPosition);
            yPosition += 7;
        });
        
        // Sauvegarde
        pdf.save(`rapport_assurance_${new Date().toISOString().split('T')[0]}.pdf`);
        this.showNotification('Rapport assurance généré', 'success');
    }

    async genererRapportCompta() {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        
        const pointages = this.storage.get('pointages');
        const factures = this.storage.get('factures');
        const paiements = this.storage.get('paiements');
        
        // En-tête
        pdf.setFontSize(20);
        pdf.text('RAPPORT COMPTABILITÉ - QUÉBEC', 20, 20);
        
        pdf.setFontSize(12);
        pdf.text(`Date: ${this.formatDate(new Date())}`, 20, 30);
        pdf.text('Tous les montants sont en dollars canadiens (CAD)', 20, 37);
        
        // Sommaire Main-d'œuvre
        pdf.setFontSize(14);
        pdf.text('MAIN-D\'ŒUVRE (TRAVAILLEURS AUTONOMES)', 20, 50);
        pdf.setFontSize(10);
        
        const totalMainOeuvre = pointages.reduce((sum, p) => sum + p.cout_main_oeuvre_ttc, 0);
        const totalTaxesMainOeuvre = pointages.reduce((sum, p) => sum + p.taxes_totales, 0);
        
        pdf.text(`Total TTC: ${this.formatCurrency(totalMainOeuvre)}`, 20, 60);
        pdf.text(`Dont taxes (si applicable): ${this.formatCurrency(totalTaxesMainOeuvre)}`, 20, 67);
        
        // Sommaire Matériaux
        pdf.setFontSize(14);
        pdf.text('MATÉRIAUX', 20, 85);
        pdf.setFontSize(10);
        
        const totalMateriaux = factures.reduce((sum, f) => sum + f.montant_total, 0);
        const totalTPSMateriaux = factures.reduce((sum, f) => sum + f.tps_5_pct, 0);
        const totalTVQMateriaux = factures.reduce((sum, f) => sum + f.tvq_9975_pct, 0);
        
        pdf.text(`Total TTC: ${this.formatCurrency(totalMateriaux)}`, 20, 95);
        pdf.text(`TPS (5%): ${this.formatCurrency(totalTPSMateriaux)}`, 20, 102);
        pdf.text(`TVQ (9.975%): ${this.formatCurrency(totalTVQMateriaux)}`, 20, 109);
        
        // Totaux
        pdf.setFontSize(14);
        pdf.text('SOMMAIRE FISCAL', 20, 127);
        pdf.setFontSize(10);
        pdf.text(`Total projet TTC: ${this.formatCurrency(totalMainOeuvre + totalMateriaux)}`, 20, 137);
        pdf.text(`TPS à récupérer: ${this.formatCurrency(totalTPSMateriaux)}`, 20, 144);
        pdf.text(`TVQ à récupérer: ${this.formatCurrency(totalTVQMateriaux)}`, 20, 151);
        
        // Sauvegarde
        pdf.save(`rapport_comptabilite_${new Date().toISOString().split('T')[0]}.pdf`);
        this.showNotification('Rapport comptabilité généré', 'success');
    }

    exportCSV() {
        try {
            const pointages = this.storage.get('pointages');
            const artisans = this.storage.get('artisans');
            const factures = this.storage.get('factures_materiaux');
            const paiements = this.storage.get('paiements');
            
            // Export pointages détaillés
            if (pointages && pointages.length > 0) {
                let csvPointages = 'Date,Artisan,Spécialité,Début,Fin,Pause (min),Heures,Taux TTC,Coût TTC,Type travaux,Étape,Notes\n';
                
                pointages.forEach(p => {
                    const artisan = artisans.find(a => a.id === p.artisan_id) || {};
                    const row = [
                        p.date,
                        `${artisan.prenom || ''} ${artisan.nom || ''}`,
                        artisan.specialite || '',
                        p.heure_debut,
                        p.heure_fin,
                        p.temps_pause_minutes,
                        p.heures_travaillees,
                        p.taux_horaire_ttc?.toFixed(2) || '0.00',
                        p.cout_main_oeuvre_ttc?.toFixed(2) || '0.00',
                        p.type_travaux || '',
                        p.etape_maison || '',
                        (p.notes || '').replace(/"/g, '""')
                    ];
                    csvPointages += row.map(v => `"${v}"`).join(',') + '\n';
                });
                
                this.downloadCSV(csvPointages, 'pointages');
            }
            
            // Export factures matériaux
            if (factures && factures.length > 0) {
                let csvFactures = 'Date,Fournisseur,N° Facture,Montant HT,TPS,TVQ,Total TTC,Catégorie,Étape,Description\n';
                
                factures.forEach(f => {
                    const row = [
                        f.date_achat,
                        f.fournisseur,
                        f.numero_facture,
                        f.montant_ht?.toFixed(2) || '0.00',
                        f.tps_5_pct?.toFixed(2) || '0.00',
                        f.tvq_9975_pct?.toFixed(2) || '0.00',
                        f.montant_total?.toFixed(2) || '0.00',
                        f.categorie || '',
                        f.etape_maison || '',
                        (f.description || '').replace(/"/g, '""')
                    ];
                    csvFactures += row.map(v => `"${v}"`).join(',') + '\n';
                });
                
                this.downloadCSV(csvFactures, 'factures_materiaux');
            }
            
            // Export artisans
            if (artisans && artisans.length > 0) {
                let csvArtisans = 'Nom,Prénom,Spécialité,Taux TTC,Statut,Téléphone,Début contrat,Fin prévue\n';
                
                artisans.forEach(a => {
                    const row = [
                        a.nom,
                        a.prenom,
                        a.specialite,
                        a.taux_horaire_ttc?.toFixed(2) || '0.00',
                        a.statut,
                        a.telephone || '',
                        a.debut_contrat || '',
                        a.fin_prevue || ''
                    ];
                    csvArtisans += row.map(v => `"${v}"`).join(',') + '\n';
                });
                
                this.downloadCSV(csvArtisans, 'artisans');
            }
            
            this.showNotification('Export CSV terminé avec succès', 'success');
        } catch (error) {
            console.error('Erreur export CSV:', error);
            this.showNotification('Erreur lors de l\'export CSV', 'error');
        }
    }

    downloadCSV(csvContent, filename) {
        const BOM = '\ufeff'; // Pour Excel
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    arrayToCSV(array) {
        if (!array || array.length === 0) return '';
        
        const headers = Object.keys(array[0]);
        const csvHeaders = headers.join(',');
        
        const csvRows = array.map(row => {
            return headers.map(header => {
                const value = row[header];
                // Escape quotes and wrap in quotes if contains comma
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',');
        });
        
        return [csvHeaders, ...csvRows].join('\n');
    }

    // ===================================
    // 12. BACKUP & RESTORE
    // ===================================

    backup() {
        const data = this.storage.exportAllData();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_maison_quebec_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('Backup créé avec succès', 'success');
    }

    restore() {
        document.getElementById('restoreFileInput').click();
    }

    async handleRestore(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (confirm('Êtes-vous sûr de vouloir restaurer ces données ? Les données actuelles seront remplacées.')) {
                this.storage.importData(data);
                this.refreshCurrentPage();
                this.showNotification('Données restaurées avec succès', 'success');
            }
        } catch (error) {
            this.showNotification('Erreur lors de la restauration', 'danger');
            console.error(error);
        }
        
        // Reset input
        e.target.value = '';
    }

    // ===================================
    // 13. UTILITAIRES
    // ===================================

    formatCurrency(amount) {
        return new Intl.NumberFormat('fr-CA', {
            style: 'currency',
            currency: 'CAD',
            minimumFractionDigits: 2
        }).format(amount || 0);
    }

    formatDate(date) {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('fr-CA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
        }
    }

    showNotification(message, type = 'info') {
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification is-${type}`;
        notification.style.cssText = 'position: fixed; top: 80px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            <button class="delete" onclick="this.parentElement.remove()"></button>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// ===================================
// 14. INITIALISATION
// ===================================

let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new MaisonQuebecApp();
    // Export pour l'utilisation dans le HTML après l'initialisation
    window.app = app;
});