<?php
declare(strict_types=1);

namespace GeeknDragon\AI;

/**
 * 🤖 MOTEUR DE RECOMMANDATIONS PRODUITS IA - GEEKNDRAGON
 * Système intelligent pour maximiser la valeur panier et conversions
 */
class ProductRecommendationEngine
{
    private array $productCatalog;
    private array $userBehaviorData;
    private array $purchaseHistory;
    private array $mlWeights;
    
    // Catalogue produits avec métadonnées enrichies
    private const PRODUCT_CATALOG = [
        'lot10' => [
            'id' => 'lot10',
            'name' => 'Lot de 10 pièces métalliques',
            'price' => 60.00,
            'category' => 'pieces_metalliques',
            'tags' => ['starter', 'populaire', 'économique'],
            'complexity_level' => 'débutant',
            'session_type' => ['courte', 'moyenne'],
            'player_count' => [2, 3, 4, 5],
            'themes' => ['aventure', 'exploration', 'combat'],
            'value_score' => 8.5,
            'conversion_rate' => 0.12,
            'avg_cart_value_increase' => 45.00,
            'complementary_products' => ['pack-182-arsenal-aventurier', 'triptyque-aleatoire'],
            'upsell_products' => ['lot25'],
            'cross_sell_products' => ['pack-182-butins-ingenieries']
        ],
        
        'lot25' => [
            'id' => 'lot25',
            'name' => 'Lot de 25 pièces métalliques',
            'price' => 130.00,
            'category' => 'pieces_metalliques',
            'tags' => ['collection', 'premium', 'valeur'],
            'complexity_level' => 'intermédiaire',
            'session_type' => ['moyenne', 'longue'],
            'player_count' => [3, 4, 5, 6],
            'themes' => ['aventure', 'exploration', 'combat', 'économie'],
            'value_score' => 9.2,
            'conversion_rate' => 0.08,
            'avg_cart_value_increase' => 85.00,
            'complementary_products' => ['pack-182-routes-services', 'triptyque-aleatoire'],
            'upsell_products' => ['lot50-essence', 'lot50-tresorerie'],
            'cross_sell_products' => ['pack-182-arsenal-aventurier']
        ],
        
        'lot50-essence' => [
            'id' => 'lot50-essence',
            'name' => 'Lot de 50 pièces - Essence Double',
            'price' => 240.00,
            'category' => 'pieces_metalliques',
            'tags' => ['premium', 'essence', 'gravure_nette'],
            'complexity_level' => 'avancé',
            'session_type' => ['longue', 'campagne'],
            'player_count' => [4, 5, 6, 7, 8],
            'themes' => ['aventure', 'exploration', 'combat', 'économie', 'magie'],
            'value_score' => 9.8,
            'conversion_rate' => 0.05,
            'avg_cart_value_increase' => 120.00,
            'complementary_products' => ['pack-182-butins-ingenieries', 'triptyque-aleatoire'],
            'upsell_products' => [],
            'cross_sell_products' => ['lot50-tresorerie']
        ],
        
        'lot50-tresorerie' => [
            'id' => 'lot50-tresorerie',
            'name' => 'Lot de 50 pièces - Trésorerie Uniforme',
            'price' => 240.00,
            'category' => 'pieces_metalliques',
            'tags' => ['premium', 'tresorerie', 'gravure_nette'],
            'complexity_level' => 'avancé',
            'session_type' => ['longue', 'campagne'],
            'player_count' => [4, 5, 6, 7, 8],
            'themes' => ['économie', 'commerce', 'politique', 'aventure'],
            'value_score' => 9.8,
            'conversion_rate' => 0.05,
            'avg_cart_value_increase' => 120.00,
            'complementary_products' => ['pack-182-routes-services', 'triptyque-aleatoire'],
            'upsell_products' => [],
            'cross_sell_products' => ['lot50-essence']
        ],
        
        'pack-182-arsenal-aventurier' => [
            'id' => 'pack-182-arsenal-aventurier',
            'name' => 'Pack 182 cartes - Arsenal de l\'Aventurier',
            'price' => 70.00,
            'category' => 'cartes_equipement',
            'tags' => ['cartes', 'équipement', 'aventure'],
            'complexity_level' => 'débutant',
            'session_type' => ['courte', 'moyenne', 'longue'],
            'player_count' => [2, 3, 4, 5, 6],
            'themes' => ['aventure', 'combat', 'exploration'],
            'value_score' => 8.8,
            'conversion_rate' => 0.10,
            'avg_cart_value_increase' => 55.00,
            'complementary_products' => ['lot10', 'lot25'],
            'upsell_products' => ['pack-182-butins-ingenieries'],
            'cross_sell_products' => ['triptyque-aleatoire']
        ],
        
        'pack-182-butins-ingenieries' => [
            'id' => 'pack-182-butins-ingenieries',
            'name' => 'Pack 182 cartes - Butins & Ingénieries',
            'price' => 70.00,
            'category' => 'cartes_equipement',
            'tags' => ['cartes', 'butins', 'ingénierie', 'avancé'],
            'complexity_level' => 'intermédiaire',
            'session_type' => ['moyenne', 'longue'],
            'player_count' => [3, 4, 5, 6],
            'themes' => ['exploration', 'magie', 'technologie'],
            'value_score' => 9.0,
            'conversion_rate' => 0.07,
            'avg_cart_value_increase' => 60.00,
            'complementary_products' => ['lot25', 'lot50-essence'],
            'upsell_products' => ['pack-182-routes-services'],
            'cross_sell_products' => ['pack-182-arsenal-aventurier']
        ],
        
        'pack-182-routes-services' => [
            'id' => 'pack-182-routes-services',
            'name' => 'Pack 182 cartes - Routes & Services',
            'price' => 70.00,
            'category' => 'cartes_equipement',
            'tags' => ['cartes', 'voyage', 'services', 'social'],
            'complexity_level' => 'intermédiaire',
            'session_type' => ['moyenne', 'longue', 'campagne'],
            'player_count' => [3, 4, 5, 6, 7],
            'themes' => ['exploration', 'commerce', 'social', 'aventure'],
            'value_score' => 8.9,
            'conversion_rate' => 0.06,
            'avg_cart_value_increase' => 58.00,
            'complementary_products' => ['lot25', 'lot50-tresorerie'],
            'upsell_products' => [],
            'cross_sell_products' => ['pack-182-butins-ingenieries']
        ],
        
        'triptyque-aleatoire' => [
            'id' => 'triptyque-aleatoire',
            'name' => 'Triptyque Héros Aléatoire',
            'price' => 25.00,
            'category' => 'triptyques',
            'tags' => ['triptyque', 'héros', 'mystère', 'surprise'],
            'complexity_level' => 'tout_niveau',
            'session_type' => ['courte', 'moyenne', 'longue'],
            'player_count' => [1, 2, 3, 4, 5, 6],
            'themes' => ['héros', 'mystère', 'collection'],
            'value_score' => 8.0,
            'conversion_rate' => 0.15,
            'avg_cart_value_increase' => 20.00,
            'complementary_products' => ['lot10', 'lot25', 'pack-182-arsenal-aventurier'],
            'upsell_products' => [],
            'cross_sell_products' => []
        ]
    ];
    
    // Poids ML pour algorithme de recommandation
    private const ML_WEIGHTS = [
        'behavioral_similarity' => 0.25,
        'collaborative_filtering' => 0.20,
        'content_based' => 0.20,
        'conversion_probability' => 0.15,
        'value_optimization' => 0.10,
        'seasonal_trends' => 0.05,
        'inventory_priority' => 0.05
    ];
    
    // Profils types de joueurs JDR
    private const PLAYER_PROFILES = [
        'nouveau_joueur' => [
            'characteristics' => ['prix_conscient', 'simplicité', 'débutant'],
            'preferred_products' => ['lot10', 'pack-182-arsenal-aventurier', 'triptyque-aleatoire'],
            'budget_range' => [50, 150],
            'decision_factors' => ['prix', 'facilité_utilisation', 'reviews']
        ],
        
        'joueur_régulier' => [
            'characteristics' => ['valeur_quality', 'expérimenté', 'social'],
            'preferred_products' => ['lot25', 'pack-182-butins-ingenieries', 'pack-182-routes-services'],
            'budget_range' => [100, 300],
            'decision_factors' => ['qualité', 'variété', 'compatibilité']
        ],
        
        'maître_de_jeu' => [
            'characteristics' => ['premium_seeker', 'collection', 'expert'],
            'preferred_products' => ['lot50-essence', 'lot50-tresorerie', 'pack-182-routes-services'],
            'budget_range' => [200, 500],
            'decision_factors' => ['exhaustivité', 'qualité_premium', 'durabilité']
        ],
        
        'collectionneur' => [
            'characteristics' => ['completionist', 'qualité_premium', 'patient'],
            'preferred_products' => ['lot50-essence', 'lot50-tresorerie', 'triptyque-aleatoire'],
            'budget_range' => [300, 800],
            'decision_factors' => ['rareté', 'qualité', 'valeur_collection']
        ]
    ];
    
    public function __construct()
    {
        $this->productCatalog = self::PRODUCT_CATALOG;
        $this->mlWeights = self::ML_WEIGHTS;
        $this->userBehaviorData = $this->loadUserBehaviorData();
        $this->purchaseHistory = $this->loadPurchaseHistory();
    }
    
    /**
     * Recommandations principales basées sur contexte utilisateur
     */
    public function getRecommendations(array $context = []): array
    {
        $userId = $context['user_id'] ?? $this->getAnonymousUserId();
        $currentProducts = $context['cart_products'] ?? [];
        $pageContext = $context['page_context'] ?? 'general';
        $userProfile = $context['user_profile'] ?? $this->detectUserProfile($context);
        
        // Différents types de recommandations
        $recommendations = [];
        
        switch ($pageContext) {
            case 'homepage':
                $recommendations = $this->getHomepageRecommendations($userProfile);
                break;
            case 'product_page':
                $recommendations = $this->getProductPageRecommendations($context['current_product'], $userProfile);
                break;
            case 'cart':
                $recommendations = $this->getCartRecommendations($currentProducts, $userProfile);
                break;
            case 'checkout':
                $recommendations = $this->getCheckoutRecommendations($currentProducts, $userProfile);
                break;
            default:
                $recommendations = $this->getGeneralRecommendations($userProfile);
        }
        
        // Appliquer ML scoring et filtrage
        $scoredRecommendations = $this->applyMLScoring($recommendations, $context);
        
        // Retourner top 6 recommandations
        return array_slice($scoredRecommendations, 0, 6);
    }
    
    /**
     * Recommandations pour homepage
     */
    private function getHomepageRecommendations(string $userProfile): array
    {
        $profile = self::PLAYER_PROFILES[$userProfile] ?? self::PLAYER_PROFILES['nouveau_joueur'];
        $baseRecommendations = [];
        
        // Produits préférés pour ce profil
        foreach ($profile['preferred_products'] as $productId) {
            if (isset($this->productCatalog[$productId])) {
                $baseRecommendations[] = [
                    'product' => $this->productCatalog[$productId],
                    'reason' => 'Adapté à votre profil de joueur',
                    'confidence' => 0.8,
                    'recommendation_type' => 'profile_match'
                ];
            }
        }
        
        // Ajouter produits populaires
        $popularProducts = $this->getPopularProducts(3);
        foreach ($popularProducts as $product) {
            $baseRecommendations[] = [
                'product' => $product,
                'reason' => 'Choix populaire des joueurs',
                'confidence' => 0.7,
                'recommendation_type' => 'popular'
            ];
        }
        
        return $baseRecommendations;
    }
    
    /**
     * Recommandations sur page produit
     */
    private function getProductPageRecommendations(string $currentProductId, string $userProfile): array
    {
        if (!isset($this->productCatalog[$currentProductId])) {
            return $this->getGeneralRecommendations($userProfile);
        }
        
        $currentProduct = $this->productCatalog[$currentProductId];
        $recommendations = [];
        
        // 1. Upselling - Produits supérieurs
        foreach ($currentProduct['upsell_products'] as $upsellId) {
            if (isset($this->productCatalog[$upsellId])) {
                $upsellProduct = $this->productCatalog[$upsellId];
                $recommendations[] = [
                    'product' => $upsellProduct,
                    'reason' => sprintf('Upgrade vers %s pour plus de variété', $upsellProduct['name']),
                    'confidence' => 0.9,
                    'recommendation_type' => 'upsell',
                    'value_increase' => $upsellProduct['price'] - $currentProduct['price']
                ];
            }
        }
        
        // 2. Cross-selling - Produits complémentaires
        foreach ($currentProduct['cross_sell_products'] as $crossSellId) {
            if (isset($this->productCatalog[$crossSellId])) {
                $crossSellProduct = $this->productCatalog[$crossSellId];
                $recommendations[] = [
                    'product' => $crossSellProduct,
                    'reason' => 'Parfait complément pour vos sessions JDR',
                    'confidence' => 0.85,
                    'recommendation_type' => 'cross_sell'
                ];
            }
        }
        
        // 3. Produits complémentaires thématiques
        foreach ($currentProduct['complementary_products'] as $compId) {
            if (isset($this->productCatalog[$compId])) {
                $compProduct = $this->productCatalog[$compId];
                $recommendations[] = [
                    'product' => $compProduct,
                    'reason' => 'Les joueurs achètent souvent ensemble',
                    'confidence' => 0.75,
                    'recommendation_type' => 'complementary'
                ];
            }
        }
        
        // 4. Alternatives même catégorie
        $alternatives = $this->findAlternatives($currentProduct, 2);
        foreach ($alternatives as $alt) {
            $recommendations[] = [
                'product' => $alt,
                'reason' => 'Alternative intéressante dans la même catégorie',
                'confidence' => 0.6,
                'recommendation_type' => 'alternative'
            ];
        }
        
        return $recommendations;
    }
    
    /**
     * Recommandations pour panier
     */
    private function getCartRecommendations(array $cartProducts, string $userProfile): array
    {
        $recommendations = [];
        $cartValue = array_sum(array_map(fn($p) => $this->productCatalog[$p]['price'] ?? 0, $cartProducts));
        $cartCategories = $this->analyzeCartCategories($cartProducts);
        
        // 1. Compléter les catégories manquantes
        $missingCategories = $this->findMissingCategories($cartCategories);
        foreach ($missingCategories as $category) {
            $categoryProducts = $this->getProductsByCategory($category, 1);
            foreach ($categoryProducts as $product) {
                $recommendations[] = [
                    'product' => $product,
                    'reason' => 'Complétez votre collection avec ' . $this->getCategoryDisplayName($category),
                    'confidence' => 0.8,
                    'recommendation_type' => 'category_completion'
                ];
            }
        }
        
        // 2. Recommendations basées sur seuils de valeur
        if ($cartValue > 150 && $cartValue < 250) {
            // Encourager vers lot premium
            $premiumProducts = $this->getProductsByTag(['premium'], 2);
            foreach ($premiumProducts as $product) {
                $recommendations[] = [
                    'product' => $product,
                    'reason' => 'Profitez de la livraison gratuite avec un produit premium',
                    'confidence' => 0.7,
                    'recommendation_type' => 'value_threshold'
                ];
            }
        }
        
        // 3. Last-chance impulse buys
        $impulseProducts = $this->getImpulseProducts($cartProducts);
        foreach ($impulseProducts as $product) {
            $recommendations[] = [
                'product' => $product,
                'reason' => 'Ajout parfait pour compléter votre commande',
                'confidence' => 0.6,
                'recommendation_type' => 'impulse'
            ];
        }
        
        return $recommendations;
    }
    
    /**
     * Recommandations checkout (dernière chance)
     */
    private function getCheckoutRecommendations(array $cartProducts, string $userProfile): array
    {
        $recommendations = [];
        
        // Produits rapides à ajouter (triptyques, accessoires)
        $quickAddProducts = $this->getQuickAddProducts($cartProducts);
        foreach ($quickAddProducts as $product) {
            $recommendations[] = [
                'product' => $product,
                'reason' => 'Ajout rapide - parfait pour vos sessions',
                'confidence' => 0.8,
                'recommendation_type' => 'checkout_quick_add',
                'urgency' => true
            ];
        }
        
        return array_slice($recommendations, 0, 3); // Max 3 au checkout
    }
    
    /**
     * Appliquer le scoring ML aux recommandations
     */
    private function applyMLScoring(array $recommendations, array $context): array
    {
        $scoredRecommendations = [];
        
        foreach ($recommendations as $rec) {
            $product = $rec['product'];
            $baseScore = $rec['confidence'] ?? 0.5;
            
            // Facteurs ML
            $behavioralScore = $this->calculateBehavioralSimilarity($product, $context);
            $collaborativeScore = $this->calculateCollaborativeFiltering($product, $context);
            $contentScore = $this->calculateContentBasedScore($product, $context);
            $conversionScore = $product['conversion_rate'];
            $valueScore = $this->calculateValueOptimization($product, $context);
            $seasonalScore = $this->calculateSeasonalTrends($product);
            $inventoryScore = $this->calculateInventoryPriority($product);
            
            // Score final pondéré
            $finalScore = (
                $behavioralScore * $this->mlWeights['behavioral_similarity'] +
                $collaborativeScore * $this->mlWeights['collaborative_filtering'] +
                $contentScore * $this->mlWeights['content_based'] +
                $conversionScore * $this->mlWeights['conversion_probability'] +
                $valueScore * $this->mlWeights['value_optimization'] +
                $seasonalScore * $this->mlWeights['seasonal_trends'] +
                $inventoryScore * $this->mlWeights['inventory_priority']
            ) * $baseScore;
            
            $rec['ml_score'] = $finalScore;
            $rec['scoring_details'] = [
                'behavioral' => $behavioralScore,
                'collaborative' => $collaborativeScore,
                'content' => $contentScore,
                'conversion' => $conversionScore,
                'value' => $valueScore,
                'seasonal' => $seasonalScore,
                'inventory' => $inventoryScore
            ];
            
            $scoredRecommendations[] = $rec;
        }
        
        // Trier par score décroissant
        usort($scoredRecommendations, fn($a, $b) => $b['ml_score'] <=> $a['ml_score']);
        
        return $scoredRecommendations;
    }
    
    /**
     * Détection automatique du profil utilisateur
     */
    private function detectUserProfile(array $context): string
    {
        $indicators = [
            'page_views' => $context['page_views'] ?? 0,
            'time_on_site' => $context['time_on_site'] ?? 0,
            'cart_value' => $context['cart_value'] ?? 0,
            'previous_purchases' => $context['previous_purchases'] ?? 0,
            'viewed_products' => $context['viewed_products'] ?? []
        ];
        
        // Nouveau joueur
        if ($indicators['previous_purchases'] === 0 && $indicators['page_views'] < 5) {
            return 'nouveau_joueur';
        }
        
        // Collectionneur
        if ($indicators['cart_value'] > 300 || 
            (count($indicators['viewed_products']) > 10 && $indicators['time_on_site'] > 300)) {
            return 'collectionneur';
        }
        
        // Maître de jeu
        if ($indicators['cart_value'] > 200 || $indicators['previous_purchases'] > 2) {
            return 'maître_de_jeu';
        }
        
        // Par défaut: joueur régulier
        return 'joueur_régulier';
    }
    
    /**
     * Calculs des scores ML (versions simplifiées)
     */
    private function calculateBehavioralSimilarity(array $product, array $context): float
    {
        // Analyse des patterns comportementaux similaires
        $userBehavior = $context['user_behavior'] ?? [];
        $productMetrics = $this->getProductBehaviorMetrics($product['id']);
        
        // Similarité basée sur temps passé, interactions, etc.
        $similarity = 0.5; // Base
        
        if (isset($userBehavior['preferred_themes'])) {
            $commonThemes = array_intersect($userBehavior['preferred_themes'], $product['themes']);
            $similarity += (count($commonThemes) / count($product['themes'])) * 0.3;
        }
        
        return min(1.0, $similarity);
    }
    
    private function calculateCollaborativeFiltering(array $product, array $context): float
    {
        // "Les utilisateurs qui ont acheté X ont aussi acheté Y"
        $userSegment = $context['user_segment'] ?? 'general';
        $segmentPreferences = $this->getSegmentPreferences($userSegment);
        
        return $segmentPreferences[$product['id']] ?? 0.5;
    }
    
    private function calculateContentBasedScore(array $product, array $context): float
    {
        $userPreferences = $context['user_preferences'] ?? [];
        $score = 0.5;
        
        // Matching des attributs produit avec préférences utilisateur
        if (isset($userPreferences['price_range'])) {
            $priceMatch = $this->isPriceInRange($product['price'], $userPreferences['price_range']);
            $score += $priceMatch ? 0.2 : -0.1;
        }
        
        if (isset($userPreferences['complexity_level'])) {
            if ($product['complexity_level'] === $userPreferences['complexity_level']) {
                $score += 0.2;
            }
        }
        
        return max(0.0, min(1.0, $score));
    }
    
    private function calculateValueOptimization(array $product, array $context): float
    {
        // Optimiser pour la valeur panier et marge
        $cartValue = $context['cart_value'] ?? 0;
        $targetIncrease = $product['avg_cart_value_increase'];
        
        // Score basé sur l'augmentation potentielle de valeur
        return min(1.0, $targetIncrease / 100.0);
    }
    
    private function calculateSeasonalTrends(array $product): float
    {
        // Tendances saisonnières (Noël, été, rentrée scolaire)
        $month = (int)date('n');
        $seasonalBonus = 0.5;
        
        // Boost de Noël pour tous les produits
        if ($month === 12 || $month === 1) {
            $seasonalBonus = 0.8;
        }
        
        // Boost rentrée/automne pour produits premium
        if (($month === 9 || $month === 10) && in_array('premium', $product['tags'])) {
            $seasonalBonus = 0.7;
        }
        
        return $seasonalBonus;
    }
    
    private function calculateInventoryPriority(array $product): float
    {
        // Priorité basée sur stock (simulé - à connecter avec vrai inventaire)
        $stockLevels = [
            'lot10' => 0.9,
            'lot25' => 0.8,
            'triptyque-aleatoire' => 1.0,
            'pack-182-arsenal-aventurier' => 0.7
        ];
        
        return $stockLevels[$product['id']] ?? 0.5;
    }
    
    /**
     * Utilitaires de recommandation
     */
    private function getPopularProducts(int $limit = 5): array
    {
        $products = $this->productCatalog;
        
        // Trier par taux de conversion * score de valeur
        uasort($products, function($a, $b) {
            $scoreA = $a['conversion_rate'] * $a['value_score'];
            $scoreB = $b['conversion_rate'] * $b['value_score'];
            return $scoreB <=> $scoreA;
        });
        
        return array_slice($products, 0, $limit);
    }
    
    private function findAlternatives(array $currentProduct, int $limit): array
    {
        $alternatives = [];
        $currentCategory = $currentProduct['category'];
        $currentPrice = $currentProduct['price'];
        
        foreach ($this->productCatalog as $product) {
            if ($product['id'] === $currentProduct['id']) continue;
            
            // Même catégorie, prix similaire (+/- 30%)
            if ($product['category'] === $currentCategory) {
                $priceDiff = abs($product['price'] - $currentPrice) / $currentPrice;
                if ($priceDiff <= 0.3) {
                    $alternatives[] = $product;
                }
            }
        }
        
        return array_slice($alternatives, 0, $limit);
    }
    
    private function analyzeCartCategories(array $cartProducts): array
    {
        $categories = [];
        
        foreach ($cartProducts as $productId) {
            if (isset($this->productCatalog[$productId])) {
                $category = $this->productCatalog[$productId]['category'];
                $categories[$category] = ($categories[$category] ?? 0) + 1;
            }
        }
        
        return $categories;
    }
    
    private function findMissingCategories(array $cartCategories): array
    {
        $allCategories = ['pieces_metalliques', 'cartes_equipement', 'triptyques'];
        return array_diff($allCategories, array_keys($cartCategories));
    }
    
    private function getProductsByCategory(string $category, int $limit = 3): array
    {
        $products = array_filter($this->productCatalog, 
            fn($p) => $p['category'] === $category);
        
        // Trier par value_score
        uasort($products, fn($a, $b) => $b['value_score'] <=> $a['value_score']);
        
        return array_slice($products, 0, $limit);
    }
    
    private function getProductsByTag(array $tags, int $limit = 3): array
    {
        $products = array_filter($this->productCatalog, function($product) use ($tags) {
            return !empty(array_intersect($product['tags'], $tags));
        });
        
        return array_slice($products, 0, $limit);
    }
    
    private function getImpulseProducts(array $cartProducts): array
    {
        // Produits impulse: prix bas, complémentaires
        $impulseProducts = array_filter($this->productCatalog, 
            fn($p) => $p['price'] < 50 && !in_array($p['id'], $cartProducts));
        
        return array_slice($impulseProducts, 0, 2);
    }
    
    private function getQuickAddProducts(array $cartProducts): array
    {
        // Produits rapides à ajouter au checkout
        return array_filter($this->productCatalog, function($product) use ($cartProducts) {
            return $product['price'] < 30 && 
                   !in_array($product['id'], $cartProducts) &&
                   in_array('mystère', $product['tags']);
        });
    }
    
    private function getCategoryDisplayName(string $category): string
    {
        $names = [
            'pieces_metalliques' => 'des pièces métalliques',
            'cartes_equipement' => 'des cartes d\'équipement', 
            'triptyques' => 'un triptyque héros'
        ];
        
        return $names[$category] ?? $category;
    }
    
    /**
     * Chargement des données (à connecter avec vraie DB)
     */
    private function loadUserBehaviorData(): array
    {
        // Simuler des données comportementales
        return [
            'popular_themes' => ['aventure', 'exploration', 'combat'],
            'avg_session_duration' => 180, // secondes
            'preferred_price_range' => [50, 200],
            'conversion_patterns' => []
        ];
    }
    
    private function loadPurchaseHistory(): array
    {
        // Simuler historique d'achats
        return [
            'frequent_combinations' => [
                ['lot10', 'pack-182-arsenal-aventurier'],
                ['lot25', 'triptyque-aleatoire'],
                ['lot50-essence', 'pack-182-butins-ingenieries']
            ],
            'user_segments' => [
                'nouveau_joueur' => ['lot10', 'triptyque-aleatoire'],
                'joueur_régulier' => ['lot25', 'pack-182-arsenal-aventurier'],
                'collectionneur' => ['lot50-essence', 'lot50-tresorerie']
            ]
        ];
    }
    
    private function getAnonymousUserId(): string
    {
        return session_id() ?: 'anonymous_' . time();
    }
    
    private function getProductBehaviorMetrics(string $productId): array
    {
        // Métriques comportementales par produit (simulées)
        return [
            'avg_time_viewed' => 45,
            'bounce_rate' => 0.3,
            'add_to_cart_rate' => 0.12,
            'common_next_pages' => ['/checkout', '/boutique.php']
        ];
    }
    
    private function getSegmentPreferences(string $segment): array
    {
        // Préférences par segment d'utilisateurs
        $preferences = [
            'nouveau_joueur' => [
                'lot10' => 0.9,
                'triptyque-aleatoire' => 0.8,
                'pack-182-arsenal-aventurier' => 0.7
            ],
            'joueur_régulier' => [
                'lot25' => 0.9,
                'pack-182-butins-ingenieries' => 0.8,
                'pack-182-routes-services' => 0.7
            ]
        ];
        
        return $preferences[$segment] ?? [];
    }
    
    private function isPriceInRange(float $price, array $range): bool
    {
        return $price >= $range[0] && $price <= $range[1];
    }
    
    /**
     * API publique pour obtenir des recommandations spécifiques
     */
    public function getHomepageRecommendationsPublic(array $userContext = []): array
    {
        return $this->getRecommendations([
            ...$userContext,
            'page_context' => 'homepage'
        ]);
    }
    
    public function getProductPageRecommendationsPublic(string $productId, array $userContext = []): array
    {
        return $this->getRecommendations([
            ...$userContext,
            'page_context' => 'product_page',
            'current_product' => $productId
        ]);
    }
    
    public function getCartRecommendationsPublic(array $cartProducts, array $userContext = []): array
    {
        return $this->getRecommendations([
            ...$userContext,
            'page_context' => 'cart',
            'cart_products' => $cartProducts
        ]);
    }
    
    /**
     * Analytics et insights
     */
    public function getRecommendationStats(): array
    {
        return [
            'total_products' => count($this->productCatalog),
            'categories' => array_unique(array_column($this->productCatalog, 'category')),
            'avg_conversion_rate' => array_sum(array_column($this->productCatalog, 'conversion_rate')) / count($this->productCatalog),
            'price_range' => [
                'min' => min(array_column($this->productCatalog, 'price')),
                'max' => max(array_column($this->productCatalog, 'price'))
            ],
            'ml_weights' => $this->mlWeights
        ];
    }
}