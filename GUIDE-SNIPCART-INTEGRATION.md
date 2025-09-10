# 🛒 Guide d'Intégration Snipcart - GeeknDragon

## 🎯 Vue d'ensemble

Cette intégration transforme GeeknDragon en boutique e-commerce complète avec une personnalisation D&D immersive. Snipcart gère les paiements, l'inventaire et les expéditions, tandis que notre code personnalise entièrement l'expérience utilisateur.

## ⚡ Activation Rapide

### 1. Configuration des Clés API

1. **Créer un compte Snipcart** sur [app.snipcart.com](https://app.snipcart.com)

2. **Récupérer vos clés** dans Dashboard > Account > API Keys

3. **Mettre à jour `.env`** :
   ```bash
   SNIPCART_API_KEY=pk_test_votre_cle_publique_ici
   SNIPCART_SECRET_API_KEY=sk_test_votre_cle_secrete_ici
   ```

4. **Mettre à jour les scripts** dans `boutique.html` :
   ```javascript
   window.SNIPCART_API_KEY = 'pk_test_votre_cle_publique_ici';
   ```

### 2. Configuration du Domaine

Dans votre dashboard Snipcart :
1. Aller à **Settings > Domain & URLs**
2. Ajouter votre domaine : `https://geekndragon.com`
3. Pour les tests locaux : `http://localhost:8000`

### 3. Configuration du Webhook

1. Dans Snipcart Dashboard > **Webhooks**
2. Ajouter l'URL : `https://votre-domaine.com/api/snipcart-webhook.php`
3. Activer les événements :
   - `order.completed`
   - `order.status.changed` 
   - `shippingrates.fetch`
   - `taxes.calculate`

## 🎨 Personnalisations D&D Incluses

### Interface Utilisateur
- **Thème médiéval complet** avec polices Cinzel
- **Couleurs immersives** : or, cuivre, rouge dragon
- **Animations fluides** avec effets de parchemin
- **Terminologie D&D** : "Sac d'Aventurier", "Trésor", etc.

### Fonctionnalités Uniques
- **Frais de port thématiques** : "Transport par Caravane", "Vol de Dragon Express"
- **Confirmations épiques** avec animations personnalisées
- **Emails HTML immersifs** avec design médiéval
- **Progress tracker** de commande en style quête

### Templates Personnalisés
- Panier avec design sombre et accents dorés
- Checkout redesigné avec étapes de "quête"
- Confirmations avec célébrations héroïques
- Notifications avec iconographie D&D

## 📦 Structure des Fichiers

```
/js/
├── snipcart-integration.js     # Intégration principale + thème
├── snipcart-products.js        # Gestion des produits
└── [autres scripts existants]

/templates/
└── snipcart-templates.html     # Templates HTML personnalisés

/api/
└── snipcart-webhook.php        # Webhook + API de validation

/css/
├── checkout-dnd.css           # Styles existants (compatible)
└── [autres styles existants]
```

## 🧪 Tests Complets

### Tests Locaux

1. **Démarrer le serveur** :
   ```bash
   php -S localhost:8000
   ```

2. **Tester les produits** :
   - Ouvrir `http://localhost:8000/boutique.html`
   - Vérifier que les boutons sont transformés en "⚔️ Ajouter à mon Sac"
   - Cliquer sur un bouton → vérifier l'ouverture du panier personnalisé

3. **Tester le checkout** :
   - Utiliser les cartes de test Snipcart : `4242 4242 4242 4242`
   - Vérifier les frais de port calculés dynamiquement
   - Vérifier les taxes canadiennes

### Tests de Production

1. **Changer les clés** pour les clés `pk_live_` et `sk_live_`
2. **Tester une vraie commande** avec une petite valeur
3. **Vérifier les emails** de confirmation
4. **Vérifier les webhooks** dans les logs Snipcart

## 🎛️ Configuration Avancée

### Personnalisation des Frais de Port

Modifier dans `api/snipcart-webhook.php` :

```php
// Livraison gratuite à partir de X$
if ($totalValue >= 150) {
    $shippingRates[] = [
        'cost' => 0,
        'description' => '✨ Portail Magique GRATUIT (3-5 jours)',
        // ...
    ];
}
```

### Ajout de Nouveaux Produits

1. **Mettre à jour** `data/products.json`
2. **Ajouter les images** dans `/images/optimized-modern/webp/`
3. **Le script** détecte automatiquement les nouveaux produits

### Personnalisation des Emails

Modifier le template dans `generateOrderEmailTemplate()` :

```php
$htmlBody = "
<div style='background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);'>
    <!-- Votre HTML personnalisé -->
</div>
";
```

## 🔍 Débogage

### Logs Disponibles

```bash
# Logs des webhooks
tail -f logs/snipcart-2024-XX-XX.log

# Logs PHP (erreurs)
tail -f error.log

# Console navigateur
# Vérifier les erreurs JavaScript
```

### Problèmes Courants

**Panier qui ne s'ouvre pas :**
- Vérifier la clé API dans le code et l'environnement
- Vérifier que le domaine est autorisé dans Snipcart
- Ouvrir la console pour voir les erreurs

**Produits non trouvés :**
- Vérifier que `data/products.json` est accessible
- Vérifier les IDs de produits dans le HTML

**Frais de port incorrects :**
- Vérifier les logs webhook
- Tester l'endpoint `/api/snipcart-webhook.php` manuellement

## 📊 Analytics et Tracking

### Google Analytics 4
Le code inclut le tracking automatique :
- `add_to_cart` lors d'ajout au panier
- `purchase` lors de finalisation
- `cart_opened` lors d'ouverture du panier

### Facebook Pixel
Support intégré si `window.fbq` est disponible.

## 🚀 Déploiement

### 1. Préparation
```bash
# Minifier les assets (optionnel)
npm run build

# Vérifier les permissions
chmod 755 api/
chmod 644 api/snipcart-webhook.php
```

### 2. Upload
- Uploader tous les nouveaux fichiers
- S'assurer que le webhook est accessible en HTTPS
- Tester le webhook avec l'outil Snipcart

### 3. Monitoring
- Surveiller les logs d'erreur
- Vérifier les métriques Snipcart Dashboard
- Tester périodiquement une commande test

## 💡 Extensions Futures

### Fonctionnalités Prêtes à Développer
- **Codes promo thématiques** : "DRAGONSLAYER", "HEROICQUEST"
- **Programme de fidélité** : Points d'expérience client
- **Abonnements** : Livraisons mensuelles de nouveaux produits
- **Personnalisation** : Gravure de noms sur pièces

### Intégrations Possibles
- **Discord** : Notifications de commandes
- **Inventory management** : Stock automatisé
- **Reviews system** : Avis avec étoiles et thème D&D
- **Wishlist** : Liste de souhaits persistante

## ⚠️ Points d'Attention

### Sécurité
- **Jamais exposer** la clé secrète côté client
- **HTTPS obligatoire** en production
- **Valider tous les webhooks** avec le token

### Performance
- **Lazy loading** des scripts Snipcart
- **Minimiser les requêtes** API
- **Cache** les données produits si possible

### SEO
- **Structured data** intégrée automatiquement
- **Meta tags** dynamiques par produit
- **Sitemap** à mettre à jour avec les produits

## 📞 Support

En cas de problème :

1. **Vérifier les logs** (webhook + PHP)
2. **Tester en mode développement** avec clés test
3. **Consulter la doc Snipcart** : [docs.snipcart.com](https://docs.snipcart.com)
4. **Contacter le support Snipcart** si problème de plateforme

---

**🐉 Félicitations ! Votre boutique GeeknDragon est maintenant équipée d'un système e-commerce immersif digne des plus grandes quêtes héroïques !**