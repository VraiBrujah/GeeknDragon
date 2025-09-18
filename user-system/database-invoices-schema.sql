-- Extension Base de Données GeeknDragon - Système de Factures
-- Table dédiée aux factures Snipcart avec détails complets

-- Table principale des factures
CREATE TABLE user_invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Liaison utilisateur
    user_id INTEGER,
    
    -- Données Snipcart
    snipcart_order_id TEXT UNIQUE NOT NULL,
    snipcart_token TEXT,
    
    -- Informations client
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    
    -- Détails de la commande
    order_number TEXT,
    status TEXT NOT NULL, -- 'InProgress', 'Processed', 'Shipped', 'Delivered', 'Cancelled'
    payment_status TEXT, -- 'Paid', 'Pending', 'Failed', 'Refunded'
    
    -- Montants
    subtotal DECIMAL(10,2) NOT NULL,
    taxes DECIMAL(10,2) DEFAULT 0,
    shipping_fees DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'CAD',
    
    -- Adresse de livraison
    shipping_name TEXT,
    shipping_address TEXT,
    shipping_city TEXT,
    shipping_province TEXT,
    shipping_postal_code TEXT,
    shipping_country TEXT DEFAULT 'CA',
    
    -- Adresse de facturation (si différente)
    billing_name TEXT,
    billing_address TEXT,
    billing_city TEXT,
    billing_province TEXT,
    billing_postal_code TEXT,
    billing_country TEXT DEFAULT 'CA',
    
    -- Métadonnées
    invoice_date DATETIME NOT NULL,
    shipped_date DATETIME,
    delivered_date DATETIME,
    
    -- Données brutes pour référence
    snipcart_data JSON, -- Données complètes de Snipcart pour audit
    
    -- Gestion
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table des articles de facture
CREATE TABLE invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    
    -- Détails produit
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_category TEXT,
    
    -- Détails de l'achat
    unit_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Variations/Options (pour les pièces avec multiplicateurs)
    product_variant TEXT, -- ex: "x10", "x100", "Français", "Anglais"
    custom_fields JSON, -- Données personnalisées du produit
    
    -- Métadonnées
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (invoice_id) REFERENCES user_invoices(id) ON DELETE CASCADE
);

-- Index pour optimisation des requêtes
CREATE INDEX idx_user_invoices_user_id ON user_invoices(user_id);
CREATE INDEX idx_user_invoices_email ON user_invoices(customer_email);
CREATE INDEX idx_user_invoices_snipcart_id ON user_invoices(snipcart_order_id);
CREATE INDEX idx_user_invoices_date ON user_invoices(invoice_date);
CREATE INDEX idx_user_invoices_status ON user_invoices(status);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_user_invoices_timestamp 
    AFTER UPDATE ON user_invoices
BEGIN
    UPDATE user_invoices SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Vue pour les factures avec totaux calculés
CREATE VIEW invoice_summary AS
SELECT 
    ui.id,
    ui.user_id,
    ui.snipcart_order_id,
    ui.customer_email,
    ui.customer_name,
    ui.order_number,
    ui.status,
    ui.payment_status,
    ui.total_amount,
    ui.currency,
    ui.invoice_date,
    ui.shipped_date,
    ui.delivered_date,
    COUNT(ii.id) as item_count,
    GROUP_CONCAT(ii.product_name, ', ') as products_summary
FROM user_invoices ui
LEFT JOIN invoice_items ii ON ui.id = ii.invoice_id
GROUP BY ui.id;