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
INSERT INTO dnd_config (type, nom, description, traits, recommandations_produits, ordre_affichage) VALUES

-- ESPÈCES
('espece', 'Aasimar', 'Descendants célestes, porteurs d''une lumière protectrice', '{"bonus": "Charisme +2", "trait": "Lueur divine"}', '["triptyque-aleatoire", "pack-182-routes-services"]', 1),
('espece', 'Drakéide', 'Descendants de dragons, fiers et puissants', '{"bonus": "Force +2", "trait": "Souffle draconique"}', '["lot50-essence", "pack-182-arsenal-aventurier"]', 2),
('espece', 'Elfe', 'Gracieux et connectés aux arcanes et à la nature', '{"bonus": "Dextérité +2", "trait": "Vision dans le noir"}', '["pack-182-routes-services", "pack-182-butins-ingenieries"]', 3),
('espece', 'Demi-Elfe', 'Entre deux mondes, charismatiques et adaptables', '{"bonus": "Charisme +2", "trait": "Polyvalence elfique"}', '["pack-182-butins-ingenieries", "triptyque-aleatoire"]', 4),
('espece', 'Demi-Orc', 'Robustes et tenaces, forgés par l''adversité', '{"bonus": "Force +2", "trait": "Endurance implacable"}', '["pack-182-arsenal-aventurier", "lot25"]', 5),
('espece', 'Gnome', 'Inventifs, curieux et animés par la magie', '{"bonus": "Intelligence +2", "trait": "Ruse gnome"}', '["pack-182-butins-ingenieries", "triptyque-aleatoire"]', 6),
('espece', 'Halfelin', 'Petits mais courageux, chanceux et débrouillards', '{"bonus": "Dextérité +2", "trait": "Chanceux"}', '["lot10", "triptyque-aleatoire"]', 7),
('espece', 'Humain', 'Polyvalents et ambitieux, experts dans tous les domaines', '{"bonus": "Polyvalence", "trait": "Adaptation rapide"}', '["lot10", "triptyque-aleatoire"]', 8),
('espece', 'Nain', 'Robustes et déterminés, maîtres artisans et guerriers', '{"bonus": "Constitution +2", "trait": "Résistance au poison"}', '["lot25", "pack-182-arsenal-aventurier"]', 9),
('espece', 'Tieffelin', 'Héritiers infernaux, mystérieux et charismatiques', '{"bonus": "Charisme +2", "trait": "Héritage infernal"}', '["pack-182-butins-ingenieries", "triptyque-aleatoire"]', 10),

-- CLASSES
('classe', 'Barbare', 'Guerrier sauvage porté par une rage primale', '{"role": "DPS/Tank", "HD": "d12"}', '["pack-182-arsenal-aventurier", "lot50-essence"]', 1),
('classe', 'Barde', 'Artiste inspirant mêlant magie et musique', '{"role": "Support/Contrôle", "HD": "d8"}', '["pack-182-butins-ingenieries", "triptyque-aleatoire"]', 2),
('classe', 'Clerc', 'Serviteur divin, guérisseur et protecteur', '{"role": "Soutien/Guérison", "HD": "d8"}', '["pack-182-routes-services", "triptyque-aleatoire"]', 3),
('classe', 'Druide', 'Gardien de la nature capable de métamorphose', '{"role": "Soutien/Nature", "HD": "d8"}', '["pack-182-routes-services", "triptyque-aleatoire"]', 4),
('classe', 'Ensorceleur', 'Canalise une magie innée et dévastatrice', '{"role": "DPS/Contrôleur", "HD": "d6"}', '["pack-182-butins-ingenieries", "triptyque-aleatoire"]', 5),
('classe', 'Guerrier', 'Maître des armes et des tactiques martiales', '{"role": "Tank/DPS", "HD": "d10"}', '["pack-182-arsenal-aventurier", "lot25"]', 6),
('classe', 'Magicien', 'Érudit des arcanes et stratège de la magie', '{"role": "Contrôleur/DPS", "HD": "d6"}', '["pack-182-butins-ingenieries", "triptyque-aleatoire"]', 7),
('classe', 'Moine', 'Artiste martial en quête de perfection intérieure', '{"role": "DPS/Utilitaire", "HD": "d8"}', '["pack-182-arsenal-aventurier", "pack-182-routes-services"]', 8),
('classe', 'Occultiste', 'Tisse des pactes mystérieux pour puiser sa magie', '{"role": "DPS/Support", "HD": "d8"}', '["triptyque-aleatoire", "pack-182-butins-ingenieries"]', 9),
('classe', 'Paladin', 'Champion sacré alliant foi et épée', '{"role": "Tank/Soutien", "HD": "d10"}', '["lot50-essence", "pack-182-routes-services"]', 10),
('classe', 'Rôdeur', 'Protecteur des contrées sauvages et pisteur expert', '{"role": "DPS/Explorateur", "HD": "d10"}', '["pack-182-routes-services", "lot10"]', 11),
('classe', 'Roublard', 'Spécialiste de la discrétion et des attaques précises', '{"role": "DPS/Subtilité", "HD": "d8"}', '["pack-182-butins-ingenieries", "lot10"]', 12),

-- HISTORIQUES
('historique', 'Acolyte', 'Serviteur d''un temple, proche du divin', '{"competences": "Religion, Perspicacité"}', '["pack-182-routes-services", "triptyque-aleatoire"]', 1),
('historique', 'Artisan', 'Maître d''un atelier ou membre d''une confrérie artisanale', '{"competences": "Perspicacité, Artisanat"}', '["lot25", "pack-182-butins-ingenieries"]', 2),
('historique', 'Charlatan', 'Escroc charmeur toujours prêt à une nouvelle combine', '{"competences": "Tromperie, Escamotage"}', '["pack-182-butins-ingenieries", "triptyque-aleatoire"]', 3),
('historique', 'Criminel', 'Vécu dans l''ombre entre filouteries et opérations clandestines', '{"competences": "Discrétion, Intimidation"}', '["pack-182-butins-ingenieries", "lot10"]', 4),
('historique', 'Ermite', 'Retiré du monde pour méditer et étudier en solitude', '{"competences": "Médecine, Religion"}', '["triptyque-aleatoire", "pack-182-routes-services"]', 5),
('historique', 'Explorateur', 'A parcouru territoires sauvages et ruines oubliées', '{"competences": "Survie, Athlétisme"}', '["pack-182-routes-services", "lot10"]', 6),
('historique', 'Héros du Peuple', 'Protecteur des communautés et symbole d''espoir', '{"competences": "Dressage, Survie"}', '["lot10", "triptyque-aleatoire"]', 7),
('historique', 'Marin', 'Vie passée en mer entre cordages et embruns', '{"competences": "Athlétisme, Perception"}', '["pack-182-routes-services", "lot10"]', 8),
('historique', 'Noble', 'Élevé dans le luxe et rompu aux intrigues politiques', '{"competences": "Histoire, Persuasion"}', '["lot50-essence", "triptyque-aleatoire"]', 9),
('historique', 'Sage', 'Chercheur infatigable avide de connaissances', '{"competences": "Arcanes, Histoire"}', '["pack-182-butins-ingenieries", "triptyque-aleatoire"]', 10),
('historique', 'Soldat', 'Combattant discipliné formé à la guerre et aux tactiques', '{"competences": "Athlétisme, Intimidation"}', '["pack-182-arsenal-aventurier", "lot25"]', 11),
('historique', 'Vagabond', 'A grandi dans les rues en développant débrouillardise et survie', '{"competences": "Discrétion, Survie"}', '["lot10", "pack-182-routes-services"]', 12);

-- Index pour optimisation
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_visits_user_id ON user_visits(user_id);
CREATE INDEX idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX idx_user_recommendations_user_id ON user_recommendations(user_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);