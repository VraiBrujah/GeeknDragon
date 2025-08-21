/**
 * Panier custom GeeknDragon
 * Gestion 100% personnalisée du panier sans dépendance externe
 */

class GeeknDragonCart {
    constructor() {
        this.isOpen = false;
        this.items = new Map();
        this.apiEndpoint = '/api/cart';
        this.csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

        this.init();
    }
    
    /**
     * Initialise le panier et les event listeners
     */
    init() {
        // Elements DOM
        this.cartToggle = document.getElementById('gd-cart-toggle-widget');
        this.cartPanel = document.getElementById('gd-cart-panel');
        this.cartOverlay = document.getElementById('gd-cart-overlay');
        this.cartClose = document.getElementById('gd-cart-close');
        this.cartContent = document.getElementById('gd-cart-content');
        this.cartCount = document.getElementById('gd-cart-count-widget');
        this.cartTotal = document.getElementById('gd-cart-total');
        
        if (!this.cartToggle || !this.cartPanel) {
            console.warn('GeeknDragon Cart: Elements required not found');
            return;
        }
        
        // Event listeners
        this.setupEventListeners();
        
        // Charger le panier depuis la session
        this.loadCart();
        
        // Initialiser les boutons d'ajout au panier sur la page
        this.initAddToCartButtons();
    }
    
    /**
     * Configure les event listeners
     */
    setupEventListeners() {
        // Toggle panier
        this.cartToggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggle();
        });
        
        // Fermer panier
        if (this.cartClose) {
            this.cartClose.addEventListener('click', () => this.close());
        }
        
        if (this.cartOverlay) {
            this.cartOverlay.addEventListener('click', () => this.close());
        }
        
        // Échapper pour fermer
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        
        // Event listeners délégués pour les boutons du panier
        if (this.cartContent) {
            this.cartContent.addEventListener('click', (e) => {
                const target = e.target.closest('button');
                if (!target) return;
                
                e.preventDefault();
                
                if (target.classList.contains('gd-qty-btn')) {
                    this.handleQuantityChange(target);
                } else if (target.classList.contains('gd-remove-btn')) {
                    this.handleRemoveItem(target);
                }
            });
        }
        
        // Boutons d'action du panier
        const checkoutBtn = document.getElementById('gd-cart-checkout');
        const clearBtn = document.getElementById('gd-cart-clear');
        
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.checkout());
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clear());
        }
    }
    
    /**
     * Initialise les boutons d'ajout au panier sur la page
     */
    initAddToCartButtons() {
        // Boutons d'ajout au panier
        const addToCartBtns = document.querySelectorAll('[data-product-id]');
        
        addToCartBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addFromButton(btn);
            });
        });
    }
    
    /**
     * Ajoute un produit depuis un bouton de la page
     */
    async addFromButton(button) {
        const productId = button.dataset.productId;
        const quantity = parseInt(button.dataset.quantity) || 1;
        
        // Récupérer les options du produit (multiplicateurs, langue, etc.)
        const options = {};

        // Collect options from a surrounding form (new cart behaviour)
        const form = button.closest('form');
        if (form) {
            const formData = new FormData(form);
            for (const [key, value] of formData.entries()) {
                if (key !== '_token' && key !== 'quantity') {
                    options[key] = value;
                }
            }
        }


        let productData;
        try {
            const res = await fetch(`/api/products/${encodeURIComponent(productId)}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (!data.success) throw new Error(data.message || 'Produit introuvable');
            productData = data.product;
        } catch (err) {
            console.error('Erreur récupération produit:', err);
            this.showError('Produit introuvable');
            return;
        }

        try {
            await this.addItem({
                id: productData.id,
                name: productData.name,
                price: productData.price,
                image: productData.image || '',
                quantity: quantity,
                options: options
            });
            
            // Feedback visuel
            this.showAddedFeedback(button);
            
        } catch (error) {
            console.error('Erreur ajout panier:', error);
            this.showError('Erreur lors de l\'ajout au panier');
        }
    }
    
    /**
     * Ajoute un produit au panier
     */
    async addItem(item) {
        try {
            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-Token': this.csrfToken
                },
                body: JSON.stringify(item)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                this.updateCartDisplay(result.cart);
                this.open(); // Ouvrir le panier après ajout
            } else {
                this.showError((result.message || 'Erreur lors de l\'ajout au panier') + '. Veuillez réessayer plus tard.');
            }

        } catch (error) {
            // Fallback mode hors ligne - gestion côté client
            console.warn('Mode hors ligne, gestion locale du panier');
            this.addItemLocally(item);
        }
    }
    
    /**
     * Ajoute un item localement (mode hors ligne)
     */
    addItemLocally(item) {
        const itemKey = this.generateItemKey(item.id, item.options || {});
        
        if (this.items.has(itemKey)) {
            const existingItem = this.items.get(itemKey);
            existingItem.quantity += item.quantity;
        } else {
            this.items.set(itemKey, { ...item });
        }
        
        this.saveToSession();
        this.renderCart();
        this.open();
    }
    
    /**
     * Gère le changement de quantité
     */
    async handleQuantityChange(button) {
        const action = button.dataset.action;
        const itemKey = button.dataset.itemKey;
        
        if (!itemKey) return;
        
        try {
            const response = await fetch('/api/cart/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-Token': this.csrfToken
                },
                body: JSON.stringify({
                    itemKey: itemKey,
                    action: action
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.updateCartDisplay(result.cart);
                } else {
                    this.showError((result.message || 'Impossible de mettre à jour le panier') + '. Veuillez réessayer plus tard.');
                }
            }

        } catch (error) {
            // Fallback local
            this.updateQuantityLocally(itemKey, action);
        }
    }
    
    /**
     * Met à jour la quantité localement
     */
    updateQuantityLocally(itemKey, action) {
        if (!this.items.has(itemKey)) return;
        
        const item = this.items.get(itemKey);
        
        if (action === 'increase') {
            item.quantity += 1;
        } else if (action === 'decrease') {
            item.quantity -= 1;
            if (item.quantity <= 0) {
                this.items.delete(itemKey);
            }
        }
        
        this.saveToSession();
        this.renderCart();
    }
    
    /**
     * Supprime un article
     */
    async handleRemoveItem(button) {
        const itemKey = button.dataset.itemKey;
        
        if (!itemKey) return;
        
        try {
            const response = await fetch('/api/cart/remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-Token': this.csrfToken
                },
                body: JSON.stringify({ itemKey: itemKey })
            });
            
            if (response.ok) {
                const result = await response.json();
                this.updateCartDisplay(result.cart);
            }
            
        } catch (error) {
            // Fallback local
            this.items.delete(itemKey);
            this.saveToSession();
            this.renderCart();
        }
    }
    
    /**
     * Vide le panier
     */
    async clear() {
        if (!confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
            return;
        }
        
        try {
            const response = await fetch('/api/cart/clear', {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-Token': this.csrfToken
                }
            });
            
            if (response.ok) {
                this.items.clear();
                this.renderCart();
            }
            
        } catch (error) {
            // Fallback local
            this.items.clear();
            this.saveToSession();
            this.renderCart();
        }
    }
    
    /**
     * Procède au checkout
     */
    checkout() {
        if (this.items.size === 0) {
            this.showError('Votre panier est vide');
            return;
        }
        
        // Rediriger vers la page de checkout
        window.location.href = '/checkout.php';
    }
    
    /**
     * Ouvre le panier
     */
    open() {
        this.isOpen = true;
        this.cartPanel.classList.remove('hidden');
        this.cartPanel.setAttribute('aria-hidden', 'false');
        this.cartToggle.setAttribute('aria-expanded', 'true');
        
        if (this.cartOverlay) {
            this.cartOverlay.classList.remove('hidden');
        }
        
        // Focus management
        this.cartClose?.focus();
    }
    
    /**
     * Ferme le panier
     */
    close() {
        this.isOpen = false;
        this.cartPanel.classList.add('hidden');
        this.cartPanel.setAttribute('aria-hidden', 'true');
        this.cartToggle.setAttribute('aria-expanded', 'false');
        
        if (this.cartOverlay) {
            this.cartOverlay.classList.add('hidden');
        }
        
        // Retour focus
        this.cartToggle.focus();
    }
    
    /**
     * Toggle l'état du panier
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    /**
     * Met à jour l'affichage du panier
     */
    updateCartDisplay(cartData) {
        if (cartData.items) {
            this.items.clear();
            Object.entries(cartData.items).forEach(([key, item]) => {
                this.items.set(key, item);
            });
        }
        
        this.renderCart();
    }
    
    /**
     * Rend le panier
     */
    renderCart() {
        this.updateCartCount();
        this.updateCartTotal();
        this.renderCartItems();
    }
    
    /**
     * Met à jour le compteur du panier
     */
    updateCartCount() {
        const totalItems = Array.from(this.items.values())
            .reduce((sum, item) => sum + item.quantity, 0);
        
        if (this.cartCount) {
            this.cartCount.textContent = totalItems.toString();
        }
    }
    
    /**
     * Met à jour le total du panier
     */
    updateCartTotal() {
        const total = Array.from(this.items.values())
            .reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (this.cartTotal) {
            this.cartTotal.textContent = this.formatPrice(total);
        }
    }
    
    /**
     * Rend les articles du panier
     */
    renderCartItems() {
        if (!this.cartContent) return;
        
        if (this.items.size === 0) {
            this.cartContent.innerHTML = `
                <div class="p-6 text-center text-gray-500">
                    <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0h9"/>
                    </svg>
                    <p class="text-sm">Votre panier est vide</p>
                </div>
            `;
        } else {
            // Réutiliser le template côté serveur ou régénérer
            this.reloadCartContent();
        }
    }
    
    /**
     * Recharge le contenu du panier via AJAX
     */
    async reloadCartContent() {
        try {
            const response = await fetch('/api/cart/render', {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            if (response.ok) {
                const html = await response.text();
                this.cartContent.innerHTML = html;
            }
        } catch (error) {
            console.warn('Impossible de recharger le contenu du panier');
        }
    }
    
    /**
     * Charge le panier depuis la session
     */
    async loadCart() {
        try {
            const response = await fetch('/api/cart', {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            if (response.ok) {
                const cartData = await response.json();
                this.updateCartDisplay(cartData);
            }
        } catch (error) {
            // Charger depuis le localStorage en fallback
            this.loadFromSession();
        }
    }
    
    /**
     * Sauvegarde en session (localStorage)
     */
    saveToSession() {
        try {
            const cartData = {
                items: Object.fromEntries(this.items),
                timestamp: Date.now()
            };
            localStorage.setItem('gd_cart', JSON.stringify(cartData));
        } catch (error) {
            console.warn('Impossible de sauvegarder le panier');
        }
    }
    
    /**
     * Charge depuis le localStorage
     */
    loadFromSession() {
        try {
            const cartData = localStorage.getItem('gd_cart');
            if (cartData) {
                const parsed = JSON.parse(cartData);
                if (parsed.items) {
                    this.items.clear();
                    Object.entries(parsed.items).forEach(([key, item]) => {
                        this.items.set(key, item);
                    });
                    this.renderCart();
                }
            }
        } catch (error) {
            console.warn('Impossible de charger le panier depuis la session');
        }
    }
    
    /**
     * Génère une clé unique pour un item
     */
    generateItemKey(productId, options) {
        const optionsStr = Object.keys(options).sort()
            .map(key => `${key}:${options[key]}`)
            .join('|');
        return `${productId}_${btoa(optionsStr)}`;
    }
    
    /**
     * Formate un prix
     */
    formatPrice(price) {
        return new Intl.NumberFormat('fr-CA', {
            style: 'currency',
            currency: 'CAD'
        }).format(price);
    }
    
    /**
     * Affiche un feedback d'ajout
     */
    showAddedFeedback(button) {
        const originalText = button.textContent;
        button.textContent = '✓ Ajouté';
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 1500);
    }
    
    /**
     * Affiche une erreur
     */
    showError(message) {
        // Simple alert pour le moment, peut être amélioré avec un toast
        alert(message);
    }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
    window.gdCart = new GeeknDragonCart();
});

// Export pour utilisation externe
window.GeeknDragonCart = GeeknDragonCart;