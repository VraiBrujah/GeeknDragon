<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mes Factures - Geek&Dragon</title>
    <link rel="stylesheet" href="/assets/css/account.css">
    <style>
        .invoice-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            font-family: 'Cinzel', serif;
        }
        
        .page-header {
            background: linear-gradient(135deg, #2c1810 0%, #1a0f08 100%);
            color: #d4af37;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        
        .page-header h1 {
            margin: 0;
            font-size: 2.5rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        
        .invoice-filters {
            background: #f8f5f0;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 2px solid #d4af37;
        }
        
        .filter-row {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            align-items: center;
        }
        
        .filter-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .filter-group label {
            font-weight: bold;
            color: #2c1810;
            font-size: 0.9rem;
        }
        
        .filter-group select,
        .filter-group input {
            padding: 8px 12px;
            border: 1px solid #d4af37;
            border-radius: 4px;
            font-family: inherit;
        }
        
        .invoices-grid {
            display: grid;
            gap: 20px;
        }
        
        .invoice-card {
            background: white;
            border: 2px solid #d4af37;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.2s ease;
        }
        
        .invoice-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        
        .invoice-header {
            display: flex;
            justify-content: between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .invoice-number {
            font-size: 1.2rem;
            font-weight: bold;
            color: #2c1810;
        }
        
        .invoice-status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .status-processed { background: #d4edda; color: #155724; }
        .status-shipped { background: #cce7ff; color: #004085; }
        .status-delivered { background: #d1ecf1; color: #0c5460; }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-cancelled { background: #f8d7da; color: #721c24; }
        
        .invoice-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .detail-group h4 {
            margin: 0 0 8px 0;
            color: #666;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .detail-group p {
            margin: 0;
            color: #2c1810;
            font-weight: 500;
        }
        
        .invoice-items {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 15px;
        }
        
        .items-summary {
            font-size: 0.9rem;
            color: #666;
            line-height: 1.4;
        }
        
        .invoice-total {
            text-align: right;
            font-size: 1.3rem;
            font-weight: bold;
            color: #d4af37;
            margin-bottom: 15px;
        }
        
        .invoice-actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
        
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-family: inherit;
            font-size: 0.9rem;
            text-decoration: none;
            display: inline-block;
            transition: all 0.2s ease;
        }
        
        .btn-primary {
            background: #d4af37;
            color: white;
        }
        
        .btn-primary:hover {
            background: #b8941f;
        }
        
        .btn-secondary {
            background: #6c757d;
            color: white;
        }
        
        .btn-secondary:hover {
            background: #545b62;
        }
        
        .loading {
            text-align: center;
            padding: 40px;
            color: #666;
        }
        
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #666;
        }
        
        .empty-state h3 {
            color: #2c1810;
            margin-bottom: 10px;
        }
        
        .pagination {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 30px;
        }
        
        .page-link {
            padding: 8px 12px;
            border: 1px solid #d4af37;
            background: white;
            color: #d4af37;
            text-decoration: none;
            border-radius: 4px;
        }
        
        .page-link:hover,
        .page-link.active {
            background: #d4af37;
            color: white;
        }
        
        .sync-section {
            background: #e8f4fd;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #007bff;
        }
        
        .sync-section h3 {
            color: #004085;
            margin-top: 0;
        }
        
        .sync-section p {
            color: #666;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- En-tête de page -->
        <div class="page-header">
            <h1>🧾 Mes Factures d'Aventurier</h1>
            <p>Consultez l'historique de vos achats et téléchargez vos factures</p>
        </div>
        
        <!-- Section de synchronisation -->
        <div class="sync-section" id="syncSection" style="display: none;">
            <h3>Synchronisation des commandes existantes</h3>
            <p>Nous pouvons importer vos commandes Snipcart existantes pour les afficher ici.</p>
            <button type="button" class="btn btn-primary" onclick="syncExistingOrders()">
                Synchroniser mes commandes passées
            </button>
            <div id="syncStatus"></div>
        </div>
        
        <!-- Filtres -->
        <div class="invoice-filters">
            <div class="filter-row">
                <div class="filter-group">
                    <label for="statusFilter">Statut</label>
                    <select id="statusFilter" onchange="applyFilters()">
                        <option value="">Tous les statuts</option>
                        <option value="Processed">Traité</option>
                        <option value="Shipped">Expédié</option>
                        <option value="Delivered">Livré</option>
                        <option value="Pending">En attente</option>
                        <option value="Cancelled">Annulé</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="dateFrom">Du</label>
                    <input type="date" id="dateFrom" onchange="applyFilters()">
                </div>
                
                <div class="filter-group">
                    <label for="dateTo">Au</label>
                    <input type="date" id="dateTo" onchange="applyFilters()">
                </div>
                
                <div class="filter-group">
                    <label for="searchTerms">Recherche</label>
                    <input type="text" id="searchTerms" placeholder="Nom de produit..." onkeyup="applyFilters()">
                </div>
            </div>
        </div>
        
        <!-- Liste des factures -->
        <div id="invoicesContainer">
            <div class="loading">
                <p>⏳ Chargement de vos factures...</p>
            </div>
        </div>
        
        <!-- Pagination -->
        <div class="pagination" id="pagination" style="display: none;">
        </div>
    </div>

    <script>
        let currentPage = 0;
        let totalInvoices = 0;
        let allInvoices = [];
        let filteredInvoices = [];
        const itemsPerPage = 10;
        
        // Chargement initial
        document.addEventListener('DOMContentLoaded', function() {
            loadInvoices();
        });
        
        // Charger les factures
        async function loadInvoices() {
            try {
                const response = await fetch('/api/account/invoices');
                const data = await response.json();
                
                if (data.success) {
                    allInvoices = data.invoices.items || data.invoices || [];
                    
                    // Afficher option de sync si source est Snipcart
                    if (data.source === 'snipcart') {
                        document.getElementById('syncSection').style.display = 'block';
                    }
                    
                    applyFilters();
                } else {
                    showError('Erreur lors du chargement des factures: ' + data.message);
                }
            } catch (error) {
                console.error('Erreur:', error);
                showError('Erreur de connexion');
            }
        }
        
        // Appliquer les filtres
        function applyFilters() {
            const statusFilter = document.getElementById('statusFilter').value;
            const dateFrom = document.getElementById('dateFrom').value;
            const dateTo = document.getElementById('dateTo').value;
            const searchTerms = document.getElementById('searchTerms').value.toLowerCase();
            
            filteredInvoices = allInvoices.filter(invoice => {
                // Filtre par statut
                if (statusFilter && invoice.status !== statusFilter) return false;
                
                // Filtre par date
                const invoiceDate = new Date(invoice.invoice_date || invoice.creationDate);
                if (dateFrom && invoiceDate < new Date(dateFrom)) return false;
                if (dateTo && invoiceDate > new Date(dateTo)) return false;
                
                // Filtre par recherche
                if (searchTerms) {
                    const searchText = (
                        (invoice.products_summary || '') + ' ' +
                        (invoice.customer_name || '') + ' ' +
                        (invoice.order_number || '')
                    ).toLowerCase();
                    if (!searchText.includes(searchTerms)) return false;
                }
                
                return true;
            });
            
            currentPage = 0;
            displayInvoices();
            updatePagination();
        }
        
        // Afficher les factures
        function displayInvoices() {
            const container = document.getElementById('invoicesContainer');
            const start = currentPage * itemsPerPage;
            const end = start + itemsPerPage;
            const pageInvoices = filteredInvoices.slice(start, end);
            
            if (pageInvoices.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>Aucune facture trouvée</h3>
                        <p>Aucune facture ne correspond à vos critères de recherche.</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = `
                <div class="invoices-grid">
                    ${pageInvoices.map(invoice => renderInvoiceCard(invoice)).join('')}
                </div>
            `;
        }
        
        // Rendu d'une carte facture
        function renderInvoiceCard(invoice) {
            const status = invoice.status || 'Pending';
            const total = invoice.total_amount || invoice.total || 0;
            const currency = invoice.currency || 'CAD';
            const date = new Date(invoice.invoice_date || invoice.creationDate).toLocaleDateString('fr-FR');
            const products = invoice.products_summary || 'Produits non spécifiés';
            
            return `
                <div class="invoice-card">
                    <div class="invoice-header">
                        <div class="invoice-number">
                            Facture #${invoice.order_number || invoice.token || invoice.id}
                        </div>
                        <div class="invoice-status status-${status.toLowerCase()}">
                            ${getStatusLabel(status)}
                        </div>
                    </div>
                    
                    <div class="invoice-details">
                        <div class="detail-group">
                            <h4>Date</h4>
                            <p>${date}</p>
                        </div>
                        <div class="detail-group">
                            <h4>Montant</h4>
                            <p>${total.toFixed(2)} ${currency}</p>
                        </div>
                    </div>
                    
                    <div class="invoice-items">
                        <div class="items-summary">
                            <strong>Produits:</strong> ${products}
                        </div>
                    </div>
                    
                    <div class="invoice-total">
                        Total: ${total.toFixed(2)} ${currency}
                    </div>
                    
                    <div class="invoice-actions">
                        <button class="btn btn-primary" onclick="viewInvoiceDetails(${invoice.id || 'null'})">
                            Voir détails
                        </button>
                        <button class="btn btn-secondary" onclick="downloadPDF(${invoice.id || 'null'})">
                            Télécharger PDF
                        </button>
                    </div>
                </div>
            `;
        }
        
        // Libellés de statut
        function getStatusLabel(status) {
            const labels = {
                'Processed': 'Traité',
                'Shipped': 'Expédié', 
                'Delivered': 'Livré',
                'Pending': 'En attente',
                'Cancelled': 'Annulé',
                'InProgress': 'En cours'
            };
            return labels[status] || status;
        }
        
        // Mise à jour de la pagination
        function updatePagination() {
            const pagination = document.getElementById('pagination');
            const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
            
            if (totalPages <= 1) {
                pagination.style.display = 'none';
                return;
            }
            
            pagination.style.display = 'flex';
            
            let html = '';
            
            // Page précédente
            if (currentPage > 0) {
                html += `<a href="#" class="page-link" onclick="changePage(${currentPage - 1})">« Précédent</a>`;
            }
            
            // Pages numériques
            for (let i = 0; i < totalPages; i++) {
                const active = i === currentPage ? 'active' : '';
                html += `<a href="#" class="page-link ${active}" onclick="changePage(${i})">${i + 1}</a>`;
            }
            
            // Page suivante
            if (currentPage < totalPages - 1) {
                html += `<a href="#" class="page-link" onclick="changePage(${currentPage + 1})">Suivant »</a>`;
            }
            
            pagination.innerHTML = html;
        }
        
        // Changer de page
        function changePage(page) {
            currentPage = page;
            displayInvoices();
            updatePagination();
        }
        
        // Synchroniser les commandes existantes
        async function syncExistingOrders() {
            const statusDiv = document.getElementById('syncStatus');
            statusDiv.innerHTML = '<p>⏳ Synchronisation en cours...</p>';
            
            try {
                const response = await fetch('/api/account/link-orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    statusDiv.innerHTML = `
                        <p style="color: green;">
                            ✅ ${data.synced_count} commandes synchronisées sur ${data.total_orders}
                        </p>
                    `;
                    
                    // Recharger les factures
                    setTimeout(() => {
                        loadInvoices();
                        document.getElementById('syncSection').style.display = 'none';
                    }, 2000);
                } else {
                    statusDiv.innerHTML = `<p style="color: red;">❌ Erreur: ${data.message}</p>`;
                }
            } catch (error) {
                statusDiv.innerHTML = '<p style="color: red;">❌ Erreur de connexion</p>';
            }
        }
        
        // Voir les détails d'une facture
        function viewInvoiceDetails(invoiceId) {
            if (!invoiceId) {
                alert('ID de facture non disponible');
                return;
            }
            
            // Rediriger vers la page de détails ou ouvrir un modal
            window.location.href = `/account/invoice/${invoiceId}`;
        }
        
        // Télécharger le PDF
        function downloadPDF(invoiceId) {
            if (!invoiceId) {
                alert('ID de facture non disponible');
                return;
            }
            
            // À implémenter: génération PDF
            alert('Génération PDF en cours de développement');
        }
        
        // Afficher une erreur
        function showError(message) {
            document.getElementById('invoicesContainer').innerHTML = `
                <div class="empty-state">
                    <h3>Erreur</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="loadInvoices()">Réessayer</button>
                </div>
            `;
        }
    </script>
</body>
</html>