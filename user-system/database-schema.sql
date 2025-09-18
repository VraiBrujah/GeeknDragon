-- Base de Données GeeknDragon - Système de Comptes Aventuriers
-- SQLite Compatible HostPapa

-- Table Utilisateurs Aventuriers
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    
    -- Profil Aventurier D&D
    nom_aventurier TEXT NOT NULL,
    niveau INTEGER DEFAULT 1,
    espece TEXT NOT NULL,
    classe TEXT NOT NULL,
    historique TEXT NOT NULL,
    
    -- Statistiques D&D (optionnel, pour fun)
    force INTEGER DEFAULT 10,
    dexterite INTEGER DEFAULT 10,
    constitution INTEGER DEFAULT 10,
    intelligence INTEGER DEFAULT 10,
    sagesse INTEGER DEFAULT 10,
    charisme INTEGER DEFAULT 10,
    
    -- Préférences de Jeu (pour recommandations)
    style_jeu TEXT, -- 'roleplay', 'combat', 'exploration', 'social'
    experience_jeu TEXT, -- 'debutant', 'intermediaire', 'expert', 'maitre'
    campagnes_preferees TEXT, -- 'classique', 'moderne', 'fantasy', 'science-fiction'
    
    -- Données Système
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    derniere_connexion DATETIME,
    email_verifie BOOLEAN DEFAULT 0,
    statut TEXT DEFAULT 'actif' -- 'actif', 'inactif', 'banni'
);

-- Table Favoris (Équipement de l'Aventurier)
CREATE TABLE user_favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_category TEXT NOT NULL, -- 'pieces', 'cartes', 'triptyques', 'bijoux'
    date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
    note_perso TEXT, -- Note personnelle du joueur
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, product_id)
);

-- Table Historique de Navigation (Quêtes Explorées)
CREATE TABLE user_visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    duree_visite INTEGER, -- en secondes
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table Achats (Trésor Acquis) - Synchronisé avec Snipcart
CREATE TABLE user_purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    snipcart_order_id TEXT,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_category TEXT NOT NULL,
    prix_paye DECIMAL(10,2),
    quantite INTEGER DEFAULT 1,
    date_achat DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table Recommandations (Prophéties Personnalisées)
CREATE TABLE user_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id TEXT NOT NULL,
    type_recommandation TEXT NOT NULL, -- 'profil_dnd', 'historique_achats', 'saisonnier', 'complementaire'
    score DECIMAL(3,2), -- 0.00 à 1.00
    raison TEXT, -- Explication de la recommandation
    date_generation DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table Sessions (Campagnes Actives)
CREATE TABLE user_sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table Configuration D&D (Données de Référence)
CREATE TABLE dnd_config (
    type TEXT NOT NULL, -- 'espece', 'classe', 'historique'
    nom TEXT NOT NULL,
    description TEXT,
    traits TEXT, -- JSON des traits/bonus
    recommandations_produits TEXT, -- JSON des catégories recommandées
    image_url TEXT,
    ordre_affichage INTEGER DEFAULT 0,
    actif BOOLEAN DEFAULT 1,
    PRIMARY KEY (type, nom)
);

-- Insertion des Données D&D de Base
INSERT INTO dnd_config (type, nom, description, traits, recommandations_produits) VALUES

-- ESPÈCES
('espece', 'Humain', 'Polyvalents et ambitieux, les humains excellent dans tous les domaines', '{"bonus": "Polyvalence", "trait": "Adaptation"}', '["pieces", "cartes", "triptyques"]'),
('espece', 'Elfe', 'Gracieux et magiques, connectés à la nature et aux arcanes', '{"bonus": "Dextérité +2", "trait": "Vision dans le noir"}', '["pieces", "bijoux_elfiques", "cartes_nature"]'),
('espece', 'Nain', 'Robustes et déterminés, maîtres de la forge et de la guerre', '{"bonus": "Constitution +2", "trait": "Résistance poison"}', '["pieces_metal", "armes", "cartes_combat"]'),
('espece', 'Halfelin', 'Petits mais courageux, chanceux et pleins de ressources', '{"bonus": "Dextérité +2", "trait": "Chanceux"}', '["pieces", "cartes_voyage", "equipement_discret"]'),
('espece', 'Drakéide', 'Descendants de dragons, fiers et puissants', '{"bonus": "Force +2", "trait": "Souffle de dragon"}', '["pieces_precieuses", "bijoux_dragon", "cartes_combat"]'),
('espece', 'Gnome', 'Petits et intelligents, passionnés de magie et de bricolage', '{"bonus": "Intelligence +2", "trait": "Ruse gnome"}', '["cartes_ingenierie", "pieces", "gadgets"]'),
('espece', 'Demi-Elfe', 'Entre deux mondes, charismatiques et adaptables', '{"bonus": "Charisme +2", "trait": "Héritage elfique"}', '["pieces", "cartes", "bijoux", "triptyques"]'),
('espece', 'Demi-Orc', 'Sauvages et forts, luttant pour leur place dans le monde', '{"bonus": "Force +2", "trait": "Endurance implacable"}', '["armes", "cartes_combat", "pieces_metal"]'),
('espece', 'Tieffelin', 'Héritage infernal, mystérieux et charismatiques', '{"bonus": "Charisme +2", "trait": "Héritage infernal"}', '["bijoux_sombres", "cartes_mystiques", "pieces_rares"]'),

-- CLASSES
('classe', 'Guerrier', 'Maître des armes et du combat, protecteur redoutable', '{"role": "Tank/DPS", "HD": "d10"}', '["cartes_armes", "cartes_armures", "pieces_metal"]'),
('classe', 'Magicien', 'Érudit des arcanes, manipulateur de la magie pure', '{"role": "Contrôleur/DPS", "HD": "d6"}', '["cartes_magie", "bijoux_arcanes", "pieces_rares"]'),
('classe', 'Roublard', 'Expert en discrétion et en techniques sournoises', '{"role": "DPS/Utilitaire", "HD": "d8"}', '["cartes_outils", "equipement_discret", "pieces"]'),
('classe', 'Clerc', 'Serviteur divin, guérisseur et protecteur', '{"role": "Heal/Support", "HD": "d8"}', '["bijoux_divins", "cartes_sacrees", "pieces_benedites"]'),
('classe', 'Rôdeur', 'Gardien des contrées sauvages, traqueur expert', '{"role": "DPS/Utilitaire", "HD": "d10"}', '["cartes_nature", "equipement_voyage", "pieces"]'),
('classe', 'Paladin', 'Champion divin, alliant foi et épée', '{"role": "Tank/Heal", "HD": "d10"}', '["cartes_divines", "armes_benedites", "pieces_sacrees"]'),
('classe', 'Sorcier', 'Magie innée, pouvoir brut et instinctif', '{"role": "DPS/Contrôleur", "HD": "d6"}', '["bijoux_pouvoir", "cartes_elementaires", "pieces_magiques"]'),
('classe', 'Barde', 'Artiste-aventurier, inspirateur et polyvalent', '{"role": "Support/Utilitaire", "HD": "d8"}', '["instruments", "bijoux_charme", "cartes_sociales"]'),
('classe', 'Barbare', 'Guerrier sauvage, force brute et rage primitive', '{"role": "DPS/Tank", "HD": "d12"}', '["armes_primitives", "cartes_combat", "pieces_tribales"]'),
('classe', 'Moine', 'Artiste martial, équilibre entre corps et esprit', '{"role": "DPS/Utilitaire", "HD": "d8"}', '["equipement_monastique", "bijoux_zen", "cartes_arts_martiaux"]'),
('classe', 'Druide', 'Gardien de la nature, métamorphe et sagesse', '{"role": "Heal/Support", "HD": "d8"}', '["cartes_nature", "bijoux_naturels", "pieces_organiques"]'),
('classe', 'Occultiste', 'Lié à une entité mystérieuse, magie étrange', '{"role": "DPS/Utilitaire", "HD": "d8"}', '["bijoux_mystiques", "cartes_pactes", "pieces_etranges"]'),

-- HISTORIQUES
('historique', 'Acolyte', 'Serviteur dans un temple, connecté au divin', '{"competences": "Religion, Perspicacité"}', '["cartes_divines", "bijoux_religieux"]'),
('historique', 'Criminel', 'Passé dans l''illégalité, expert en subterfuge', '{"competences": "Discrétion, Tromperie"}', '["cartes_outils_voleur", "equipement_discret"]'),
('historique', 'Artisan de Guilde', 'Membre d''une guilde marchande ou artisanale', '{"competences": "Perspicacité, Persuasion"}', '["cartes_artisanat", "pieces_commerce"]'),
('historique', 'Noble', 'Né dans les privilèges, habitué au commandement', '{"competences": "Histoire, Persuasion"}', '["bijoux_nobles", "pieces_precieuses"]'),
('historique', 'Héros du Peuple', 'Champion des opprimés, proche du peuple', '{"competences": "Dressage, Survie"}', '["cartes_peuple", "equipement_simple"]'),
('historique', 'Ermite', 'Vie en réclusion, sagesse et contemplation', '{"competences": "Médecine, Religion"}', '["cartes_sagesse", "bijoux_meditation"]'),
('historique', 'Artiste', 'Performeur professionnel, talent reconnu', '{"competences": "Acrobaties, Représentation"}', '["instruments", "bijoux_artistiques"]'),
('historique', 'Marin', 'Vie en mer, voyageur des océans', '{"competences": "Athlétisme, Perception"}', '["cartes_voyage", "equipement_naval"]'),
('historique', 'Soldat', 'Militaire expérimenté, discipliné et loyal', '{"competences": "Athlétisme, Intimidation"}', '["cartes_militaires", "armes_reglementaires"]'),
('historique', 'Vagabond', 'Survivant des rues, débrouillard et rusé', '{"competences": "Escamotage, Discrétion"}', '["cartes_survie", "equipement_improvise"]'),
('historique', 'Sage', 'Érudit et chercheur, assoiffé de connaissance', '{"competences": "Arcanes, Histoire"}', '["cartes_savoir", "bijoux_erudition"]'),
('historique', 'Explorateur', 'Découvreur de terres inconnues', '{"competences": "Nature, Survie"}', '["cartes_exploration", "equipement_aventure"]');

-- Index pour optimisation
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_visits_user_id ON user_visits(user_id);
CREATE INDEX idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX idx_user_recommendations_user_id ON user_recommendations(user_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);