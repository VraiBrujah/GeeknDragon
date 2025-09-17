/**
 * Système de favoris avec gestion de compte utilisateur
 */

// Vérifier si l'utilisateur est connecté
function isUserLoggedIn() {
    // Ici, vous devrez implémenter la vérification réelle avec votre système d'auth
    // Pour l'instant, on vérifie s'il y a un token ou une session
    return localStorage.getItem('user_token') || sessionStorage.getItem('user_session');
}

// Gérer l'ajout/suppression des favoris
function handleWishlist(productId) {
    if (!isUserLoggedIn()) {
        // Rediriger vers la page de connexion
        showLoginPrompt();
        return;
    }
    
    toggleWishlist(productId);
}

// Afficher une invitation à se connecter
function showLoginPrompt() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="
            background: var(--dark-bg, #2a1810);
            border: 1px solid var(--border-color, #4a3728);
            border-radius: 12px;
            padding: 2rem;
            max-width: 400px;
            text-align: center;
            color: var(--light-text, #f5f5f5);
        ">
            <h3 style="color: var(--secondary-color, #d4af37); margin-bottom: 1rem;">
                🔒 Connexion Requise
            </h3>
            <p style="margin-bottom: 2rem; line-height: 1.6;">
                Pour ajouter des produits à vos favoris, vous devez être connecté à votre compte.
            </p>
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <a href="compte.php" style="
                    background: var(--secondary-color, #d4af37);
                    color: var(--dark-bg, #1a0f08);
                    padding: 0.75rem 1.5rem;
                    border-radius: 6px;
                    text-decoration: none;
                    font-weight: 600;
                ">Se Connecter</a>
                <button onclick="this.closest('[style*=fixed]').remove()" style="
                    background: transparent;
                    border: 1px solid var(--border-color, #4a3728);
                    color: var(--light-text, #f5f5f5);
                    padding: 0.75rem 1.5rem;
                    border-radius: 6px;
                    cursor: pointer;
                ">Annuler</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Fermer avec Échap
    const closeModal = (e) => {
        if (e.key === 'Escape' || e.target === modal) {
            modal.remove();
            document.removeEventListener('keydown', closeModal);
        }
    };
    document.addEventListener('keydown', closeModal);
    modal.addEventListener('click', closeModal);
}

// Gérer les favoris pour utilisateur connecté
function toggleWishlist(productId) {
    const wishlistBtn = document.querySelector('.btn-wishlist');
    const icon = wishlistBtn.querySelector('.wishlist-icon');
    const text = wishlistBtn.querySelector('.wishlist-text');
    
    // Récupérer la liste des favoris
    let wishlist = JSON.parse(localStorage.getItem('user_wishlist') || '[]');
    
    const isInWishlist = wishlist.includes(productId);
    
    if (isInWishlist) {
        // Retirer des favoris
        wishlist = wishlist.filter(id => id !== productId);
        icon.textContent = '🤍';
        text.textContent = 'Favoris';
        showToast('Retiré des favoris', 'info');
    } else {
        // Ajouter aux favoris
        wishlist.push(productId);
        icon.textContent = '❤️';
        text.textContent = 'Favori';
        showToast('Ajouté aux favoris', 'success');
    }
    
    // Sauvegarder
    localStorage.setItem('user_wishlist', JSON.stringify(wishlist));
    
    // Animation du bouton
    wishlistBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        wishlistBtn.style.transform = 'scale(1)';
    }, 150);
}

// Afficher un toast de confirmation
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'var(--secondary-color, #d4af37)' : 'var(--dark-bg, #2a1810)'};
        color: ${type === 'success' ? 'var(--dark-bg, #1a0f08)' : 'var(--light-text, #f5f5f5)'};
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        border: 1px solid var(--border-color, #4a3728);
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animation d'entrée
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Retirer après 3 secondes
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialiser l'état des favoris au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    if (!isUserLoggedIn()) return;
    
    const wishlistBtn = document.querySelector('.btn-wishlist');
    if (!wishlistBtn) return;
    
    const productId = wishlistBtn.getAttribute('onclick').match(/'([^']+)'/)[1];
    const wishlist = JSON.parse(localStorage.getItem('user_wishlist') || '[]');
    
    if (wishlist.includes(productId)) {
        const icon = wishlistBtn.querySelector('.wishlist-icon');
        const text = wishlistBtn.querySelector('.wishlist-text');
        icon.textContent = '❤️';
        text.textContent = 'Favori';
    }
});

// Gestion du dropdown custom
function toggleDropdown() {
    const dropdown = document.querySelector('#custom-dropdown');
    const options = document.querySelector('#dropdown-options');
    const selected = dropdown.querySelector('.dropdown-selected');
    
    dropdown.classList.toggle('active');
    selected.classList.toggle('active');
    options.classList.toggle('show');
    
    // Fermer en cliquant ailleurs
    if (options.classList.contains('show')) {
        document.addEventListener('click', closeDropdownOutside);
    } else {
        document.removeEventListener('click', closeDropdownOutside);
    }
}

function closeDropdownOutside(event) {
    const dropdown = document.querySelector('#custom-dropdown');
    if (!dropdown.contains(event.target)) {
        closeDropdown();
    }
}

function closeDropdown() {
    const dropdown = document.querySelector('#custom-dropdown');
    const options = document.querySelector('#dropdown-options');
    const selected = dropdown.querySelector('.dropdown-selected');
    
    dropdown.classList.remove('active');
    selected.classList.remove('active');
    options.classList.remove('show');
    document.removeEventListener('click', closeDropdownOutside);
}

function selectOption(optionElement) {
    // Retirer l'ancienne sélection
    document.querySelectorAll('.dropdown-option').forEach(opt => opt.classList.remove('active'));
    
    // Marquer la nouvelle option comme active
    optionElement.classList.add('active');
    
    // Mettre à jour le texte sélectionné
    const selectedText = document.querySelector('.selected-text');
    const value = optionElement.getAttribute('data-value');
    const price = optionElement.getAttribute('data-price');
    selectedText.textContent = `${value} - ${price}$ CAD`;
    
    // Mettre à jour la description et le prix
    updatePrice(optionElement);
    
    // Fermer le dropdown
    closeDropdown();
}

// Fonction pour mettre à jour le prix lors du changement de variante
function updatePrice(selectedOption = null) {
    if (!selectedOption) {
        selectedOption = document.querySelector('.dropdown-option.active');
    }
    
    if (!selectedOption) return;
    
    const newPrice = selectedOption.getAttribute('data-price');
    const newDescription = selectedOption.getAttribute('data-description');
    const newValue = selectedOption.getAttribute('data-value');
    
    const priceElement = document.querySelector('.price');
    const snipcartBtn = document.querySelector('.snipcart-add-item');
    const descriptionElement = document.querySelector('#config-description');
    
    if (priceElement && newPrice) {
        priceElement.innerHTML = `${newPrice}$ <small>CAD</small>`;
    }
    
    if (snipcartBtn && newPrice) {
        snipcartBtn.setAttribute('data-item-price', newPrice);
        // Mettre à jour aussi la variante dans les données Snipcart si nécessaire
        const currentName = snipcartBtn.getAttribute('data-item-name');
        if (newValue && newValue !== 'x1') {
            snipcartBtn.setAttribute('data-item-name', `${currentName} (${newValue})`);
        }
    }
    
    if (descriptionElement && newDescription) {
        descriptionElement.textContent = newDescription;
    }
}

// Fermer le dropdown avec Échap
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeDropdown();
    }
});