<?php
declare(strict_types=1);

require __DIR__ . '/../../bootstrap.php';

$translator = require __DIR__ . '/../../i18n.php';
$lang = $translator->getCurrentLanguage();

$title = __('account.invoices.title', 'Mes Factures | Geek & Dragon');
$metaDescription = __('account.invoices.desc', "Consultez l'historique de vos achats et téléchargez vos factures d'aventurier.");
$active = 'compte';
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang, ENT_QUOTES, 'UTF-8'); ?>">
<?php include __DIR__ . '/../../head-common.php'; ?>
<body class="account-invoices-page">
<?php include __DIR__ . '/../../header.php'; ?>

<main id="main" class="pt-[var(--header-height)]">
  <div class="invoice-wrapper">
    <section class="invoice-hero">
      <h1>🧾 Mes Factures d'Aventurier</h1>
      <p>Consultez l'historique de vos achats et téléchargez vos factures</p>
    </section>

    <section class="invoice-sync is-hidden" id="syncSection">
      <h2>Synchronisation des commandes existantes</h2>
      <p>Nous pouvons importer vos commandes Snipcart existantes pour les afficher ici.</p>
      <button type="button" class="invoice-btn invoice-btn--primary" id="syncButton">
        Synchroniser mes commandes passées
      </button>
      <div id="syncStatus" class="invoice-sync-status" aria-live="polite"></div>
    </section>

    <section class="invoice-filters" aria-label="Filtres des factures">
      <div class="invoice-filters-row">
        <div class="invoice-filter">
          <label for="statusFilter">Statut</label>
          <select id="statusFilter" class="invoice-filter-field">
            <option value="">Tous les statuts</option>
            <option value="Processed">Traité</option>
            <option value="Shipped">Expédié</option>
            <option value="Delivered">Livré</option>
            <option value="Pending">En attente</option>
            <option value="Cancelled">Annulé</option>
          </select>
        </div>

        <div class="invoice-filter">
          <label for="dateFrom">Du</label>
          <input type="date" id="dateFrom" class="invoice-filter-field">
        </div>

        <div class="invoice-filter">
          <label for="dateTo">Au</label>
          <input type="date" id="dateTo" class="invoice-filter-field">
        </div>

        <div class="invoice-filter">
          <label for="searchTerms">Recherche</label>
          <input type="search" id="searchTerms" class="invoice-filter-field" placeholder="Nom de produit..." autocomplete="off">
        </div>
      </div>
    </section>

    <div id="invoicesContainer" class="invoice-results">
      <div class="invoice-loading" role="status">
        <p>⏳ Chargement de vos factures...</p>
      </div>
    </div>

    <nav class="invoice-pagination is-hidden" id="pagination" aria-label="Pagination des factures"></nav>
  </div>
</main>
<?php
$footerSections = [
    [
        'title' => 'Geek&Dragon',
        'description' => 'Votre spécialiste en accessoires immersifs pour jeux de rôle depuis 2024.',
    ],
    [
        'title' => 'Boutique',
        'links' => [
            ['label' => 'Pièces Métalliques', 'href' => langUrl('/boutique.php#coins')],
            ['label' => "Cartes d'Équipement", 'href' => langUrl('/boutique.php#cards')],
            ['label' => 'Triptyques Mystères', 'href' => langUrl('/boutique.php#triptych')],
        ],
    ],
    [
        'title' => 'Support',
        'links' => [
            ['label' => 'Support Client', 'href' => 'mailto:support@geekndragon.com'],
            ['label' => 'Retours', 'href' => langUrl('/retours.php')],
            ['label' => 'Livraison', 'href' => '#'],
        ],
    ],
];
include __DIR__ . '/../../footer.php';
?>
<script src="/js/app.js"></script>
<script src="/js/script.js"></script>
<script>
  const invoiceState = {
    currentPage: 0,
    all: [],
    filtered: [],
    itemsPerPage: 10
  };

  const invoiceElements = {
    syncSection: document.getElementById('syncSection'),
    syncStatus: document.getElementById('syncStatus'),
    syncButton: document.getElementById('syncButton'),
    invoicesContainer: document.getElementById('invoicesContainer'),
    pagination: document.getElementById('pagination'),
    statusFilter: document.getElementById('statusFilter'),
    dateFrom: document.getElementById('dateFrom'),
    dateTo: document.getElementById('dateTo'),
    searchTerms: document.getElementById('searchTerms')
  };

  document.addEventListener('DOMContentLoaded', function () {
    loadInvoices();

    if (invoiceElements.invoicesContainer) {
      invoiceElements.invoicesContainer.addEventListener('click', function (event) {
        const target = event.target.closest('[data-invoice-action]');
        if (!target) {
          return;
        }

        const action = target.getAttribute('data-invoice-action');
        const invoiceId = target.getAttribute('data-invoice-id');
        if (action === 'view' && invoiceId) {
          viewInvoiceDetails(invoiceId);
        } else if (action === 'download' && invoiceId) {
          downloadPDF(invoiceId);
        } else if (action === 'reload') {
          loadInvoices();
        }
      });
    }

    if (invoiceElements.statusFilter) {
      invoiceElements.statusFilter.addEventListener('change', applyFilters);
    }

    if (invoiceElements.dateFrom) {
      invoiceElements.dateFrom.addEventListener('change', applyFilters);
    }

    if (invoiceElements.dateTo) {
      invoiceElements.dateTo.addEventListener('change', applyFilters);
    }

    if (invoiceElements.searchTerms) {
      invoiceElements.searchTerms.addEventListener('input', applyFilters);
    }

    if (invoiceElements.syncButton) {
      invoiceElements.syncButton.addEventListener('click', syncExistingOrders);
    }

    if (invoiceElements.pagination) {
      invoiceElements.pagination.addEventListener('click', function (event) {
        const target = event.target.closest('.invoice-page-link');
        if (!target) {
          return;
        }

        const pageValue = Number(target.getAttribute('data-page'));
        if (Number.isNaN(pageValue)) {
          return;
        }

        changePage(pageValue);
      });
    }
  });

  /**
   * Applique ou retire la classe utilitaire permettant de masquer un bloc.
   */
  function setHidden(element, hidden) {
    if (!element) {
      return;
    }
    element.classList.toggle('is-hidden', Boolean(hidden));
  }

  /**
   * Normalise une chaîne pour une utilisation dans un attribut ou une classe CSS.
   */
  function normalizeStatus(status) {
    return String(status || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
  }

  /**
   * Échappe les caractères spéciaux pour une injection HTML sûre.
   */
  function escapeHtml(value) {
    if (value === null || value === undefined) {
      return '';
    }

    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Charge les factures de l'utilisateur connecté via l'API dédiée.
   */
  async function loadInvoices() {
    try {
      const response = await fetch('/api/account/invoices');
      const data = await response.json();

      if (data.success) {
        invoiceState.all = Array.isArray(data.invoices?.items)
          ? data.invoices.items
          : Array.isArray(data.invoices)
            ? data.invoices
            : [];

        const source = data.source || '';
        setHidden(invoiceElements.syncSection, source !== 'snipcart');

        applyFilters();
      } else {
        showError('Erreur lors du chargement des factures : ' + (data.message || '')); 
      }
    } catch (error) {
      console.error('Erreur lors du chargement des factures', error);
      showError('Erreur de connexion');
    }
  }

  /**
   * Filtre les factures en fonction des critères sélectionnés.
   */
  function applyFilters() {
    const statusFilter = invoiceElements.statusFilter ? invoiceElements.statusFilter.value : '';
    const dateFrom = invoiceElements.dateFrom ? invoiceElements.dateFrom.value : '';
    const dateTo = invoiceElements.dateTo ? invoiceElements.dateTo.value : '';
    const searchTerms = invoiceElements.searchTerms ? invoiceElements.searchTerms.value.toLowerCase() : '';

    invoiceState.filtered = invoiceState.all.filter(function (invoice) {
      if (statusFilter && invoice.status !== statusFilter) {
        return false;
      }

      const invoiceDate = invoice.invoice_date || invoice.creationDate || '';
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        const compareDate = new Date(invoiceDate);
        if (!Number.isNaN(fromDate.getTime()) && !Number.isNaN(compareDate.getTime()) && compareDate < fromDate) {
          return false;
        }
      }

      if (dateTo) {
        const toDate = new Date(dateTo);
        const compareDate = new Date(invoiceDate);
        if (!Number.isNaN(toDate.getTime()) && !Number.isNaN(compareDate.getTime()) && compareDate > toDate) {
          return false;
        }
      }

      if (searchTerms) {
        const searchText = [
          invoice.products_summary || '',
          invoice.customer_name || '',
          invoice.order_number || '',
        ].join(' ').toLowerCase();

        if (!searchText.includes(searchTerms)) {
          return false;
        }
      }

      return true;
    });

    invoiceState.currentPage = 0;
    displayInvoices();
    updatePagination();
  }

  /**
   * Construit le HTML d'une carte de facture avec les informations principales.
   */
  function renderInvoiceCard(invoice) {
    const status = invoice.status || 'Pending';
    const totalValue = Number(invoice.total_amount ?? invoice.total ?? 0);
    const formattedTotal = Number.isFinite(totalValue) ? totalValue.toFixed(2) : '0.00';
    const currency = escapeHtml(invoice.currency || 'CAD');
    const dateValue = invoice.invoice_date || invoice.creationDate || '';
    const parsedDate = new Date(dateValue);
    const displayDate = Number.isNaN(parsedDate.getTime()) ? '--' : parsedDate.toLocaleDateString('fr-FR');
    const products = escapeHtml(invoice.products_summary || 'Produits non spécifiés');
    const rawId = invoice.order_number || invoice.token || invoice.id || '';
    const invoiceIdText = rawId ? 'Facture #' + escapeHtml(rawId) : 'Facture';
    const invoiceIdAttr = escapeHtml(rawId);
    const statusClass = normalizeStatus(status);
    const statusLabel = escapeHtml(getStatusLabel(status));

    return `
      <article class="invoice-card">
        <header class="invoice-card-header">
          <div class="invoice-number">${invoiceIdText}</div>
          <span class="invoice-status status-${statusClass}">${statusLabel}</span>
        </header>
        <div class="invoice-details">
          <div class="invoice-detail">
            <h4>Date</h4>
            <p>${escapeHtml(displayDate)}</p>
          </div>
          <div class="invoice-detail">
            <h4>Montant</h4>
            <p>${escapeHtml(formattedTotal)} ${currency}</p>
          </div>
        </div>
        <div class="invoice-items">
          <p><strong>Produits :</strong> ${products}</p>
        </div>
        <div class="invoice-total">Total : ${escapeHtml(formattedTotal)} ${currency}</div>
        <div class="invoice-actions">
          <button type="button" class="invoice-btn invoice-btn--primary" data-invoice-action="view" data-invoice-id="${invoiceIdAttr}">
            Voir les détails
          </button>
          <button type="button" class="invoice-btn invoice-btn--secondary" data-invoice-action="download" data-invoice-id="${invoiceIdAttr}">
            Télécharger le PDF
          </button>
        </div>
      </article>
    `;
  }

  /**
   * Affiche la liste de factures pour la page courante.
   */
  function displayInvoices() {
    if (!invoiceElements.invoicesContainer) {
      return;
    }

    const start = invoiceState.currentPage * invoiceState.itemsPerPage;
    const end = start + invoiceState.itemsPerPage;
    const pageInvoices = invoiceState.filtered.slice(start, end);

    if (pageInvoices.length === 0) {
      invoiceElements.invoicesContainer.innerHTML = `
        <div class="invoice-empty">
          <h3>Aucune facture trouvée</h3>
          <p>Aucune facture ne correspond à vos critères de recherche.</p>
        </div>
      `;
      return;
    }

    invoiceElements.invoicesContainer.innerHTML = `
      <div class="invoice-grid">
        ${pageInvoices.map(renderInvoiceCard).join('')}
      </div>
    `;
  }

  /**
   * Retourne le libellé lisible d'un statut de facture.
   */
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

  /**
   * Met à jour la zone de pagination en fonction du nombre de résultats.
   */
  function updatePagination() {
    if (!invoiceElements.pagination) {
      return;
    }

    const totalPages = Math.ceil(invoiceState.filtered.length / invoiceState.itemsPerPage);

    if (totalPages <= 1) {
      invoiceElements.pagination.innerHTML = '';
      setHidden(invoiceElements.pagination, true);
      return;
    }

    let html = '';

    if (invoiceState.currentPage > 0) {
      const previousPage = invoiceState.currentPage - 1;
      html += `<button type="button" class="invoice-page-link" data-page="${previousPage}" aria-label="Page précédente">« Précédent</button>`;
    }

    for (let i = 0; i < totalPages; i += 1) {
      const activeClass = i === invoiceState.currentPage ? ' is-active' : '';
      const pageNumber = i + 1;
      html += `<button type="button" class="invoice-page-link${activeClass}" data-page="${i}" aria-label="Page ${pageNumber}">${pageNumber}</button>`;
    }

    if (invoiceState.currentPage < totalPages - 1) {
      const nextPage = invoiceState.currentPage + 1;
      html += `<button type="button" class="invoice-page-link" data-page="${nextPage}" aria-label="Page suivante">Suivant »</button>`;
    }

    invoiceElements.pagination.innerHTML = html;
    setHidden(invoiceElements.pagination, false);
  }

  /**
   * Met à jour l'index de page courant et rafraîchit l'affichage.
   */
  function changePage(page) {
    invoiceState.currentPage = page;
    displayInvoices();
    updatePagination();
  }

  /**
   * Lance la synchronisation des commandes existantes via l'API dédiée.
   */
  async function syncExistingOrders() {
    if (!invoiceElements.syncStatus) {
      return;
    }

    invoiceElements.syncStatus.innerHTML = '<p class="invoice-sync-message">⏳ Synchronisation en cours...</p>';

    try {
      const response = await fetch('/api/account/link-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        invoiceElements.syncStatus.innerHTML = `
          <p class="invoice-sync-message invoice-sync-message--success">
            ✅ ${escapeHtml(data.synced_count ?? 0)} commandes synchronisées sur ${escapeHtml(data.total_orders ?? 0)}
          </p>
        `;

        setTimeout(function () {
          loadInvoices();
          setHidden(invoiceElements.syncSection, true);
        }, 2000);
      } else {
        invoiceElements.syncStatus.innerHTML = `
          <p class="invoice-sync-message invoice-sync-message--error">
            ❌ Erreur : ${escapeHtml(data.message || 'Opération impossible')}
          </p>
        `;
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation des commandes', error);
      invoiceElements.syncStatus.innerHTML = `
        <p class="invoice-sync-message invoice-sync-message--error">
          ❌ Erreur de connexion
        </p>
      `;
    }
  }

  /**
   * Redirige l'utilisateur vers la page de détails de la facture sélectionnée.
   */
  function viewInvoiceDetails(invoiceId) {
    const safeId = String(invoiceId || '').trim();
    if (!safeId) {
      alert('ID de facture non disponible');
      return;
    }

    window.location.href = `/account/invoice/${encodeURIComponent(safeId)}`;
  }

  /**
   * Prépare le téléchargement du PDF (fonctionnalité à implémenter).
   */
  function downloadPDF(invoiceId) {
    const safeId = String(invoiceId || '').trim();
    if (!safeId) {
      alert('ID de facture non disponible');
      return;
    }

    alert('Génération PDF en cours de développement');
  }

  /**
   * Affiche un message d'erreur utilisateur dans la zone de contenu principale.
   */
  function showError(message) {
    if (!invoiceElements.invoicesContainer) {
      return;
    }

    invoiceElements.invoicesContainer.innerHTML = `
      <div class="invoice-empty invoice-empty--error">
        <h3>Erreur</h3>
        <p>${escapeHtml(message)}</p>
        <button type="button" class="invoice-btn invoice-btn--primary" data-invoice-action="reload">Réessayer</button>
      </div>
    `;
    setHidden(invoiceElements.pagination, true);
  }
</script>
</body>
</html>
