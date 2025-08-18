# 🏰 GeekNDragon - Backend Snipcart

Système backend transparent pour l'intégration Snipcart avec interface custom DnD.

## ⚔️ Architecture

Le système conserve votre interface utilisateur personnalisée tout en utilisant Snipcart comme orchestrateur backend pour :
- Calculs d'expédition (gratuite au Québec ≥ 75$)
- Calculs de taxes canadiennes (TPS, TVQ, TVH par province)
- Passerelle de paiement Stripe avec PaymentIntents
- Gestion des commandes via webhooks

## 🛠️ Installation

1. **Dépendances Composer**
```bash
cd gd-ecommerce-native
composer install
```

2. **Configuration**
```bash
cp .env.example .env
# Éditer .env avec vos clés Snipcart et Stripe
```

3. **Configuration serveur web**
- Pointer un sous-domaine vers `public/index.php`
- Exemple: `https://api.geekndragon.com/snipcart/*`

## 🔗 Endpoints

### Webhooks Snipcart
- `POST /snipcart/shipping` - Calculs d'expédition
- `POST /snipcart/taxes` - Calculs de taxes
- `POST /snipcart/order/completed` - Traitement des commandes

### Passerelle de paiement Stripe
- `POST /snipcart/payment/methods` - Méthodes de paiement
- `POST /snipcart/payment/authorize` - Autorisation
- `POST /snipcart/payment/capture` - Capture
- `POST /snipcart/payment/refund` - Remboursement

## ⚙️ Configuration Snipcart Dashboard

1. **Webhooks** (Settings > Webhooks)
   - Shipping rates: `https://api.geekndragon.com/snipcart/shipping`
   - Taxes: `https://api.geekndragon.com/snipcart/taxes`
   - Order completed: `https://api.geekndragon.com/snipcart/order/completed`

2. **Payment Gateway** (Settings > Payment)
   - Gateway URL: `https://api.geekndragon.com/snipcart/payment`
   - Type: Custom gateway

## 🧪 Test

1. Vérifier les endpoints avec logs :
```bash
tail -f /var/log/apache2/error.log
```

2. Tester avec curl :
```bash
curl -X POST https://api.geekndragon.com/snipcart/shipping \
  -H "Content-Type: application/json" \
  -d '{"content": {"shippingAddress": {"province": "QC"}, "items": []}}'
```

## 🔐 Sécurité

- Validation HMAC des webhooks Snipcart
- Headers de sécurité
- Validation des domaines CORS
- Logs de toutes les transactions

## 📁 Structure

```
gd-ecommerce-native/
├── config/           # Configuration Snipcart/Stripe
├── src/Snipcart/     # Classes métier
├── routes/           # Routage des endpoints
├── public/           # Point d'entrée web
└── vendor/           # Dépendances Composer
```