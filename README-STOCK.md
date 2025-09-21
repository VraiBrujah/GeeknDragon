# Gestion du Stock Snipcart

## Fonctionnement

### Mode Développement (Par défaut)
- Utilise `data/stock.json` pour les vérifications de stock
- **Rapide** : Pas d'appels API
- **Parfait** pour le développement et les tests

### Mode Production avec Synchronisation
Pour activer la synchronisation temps réel avec Snipcart :

```bash
# Linux/Mac
export SNIPCART_SYNC=true

# Windows
set SNIPCART_SYNC=true
```

### Synchronisation Périodique (Recommandé)
Exécutez `sync-stock.php` régulièrement via cron :

```bash
# Mise à jour du stock toutes les heures
0 * * * * cd /path/to/site && php sync-stock.php

# Ou manuellement
php sync-stock.php
```

## Ajout de Nouveaux Produits

### 1. Ajouter dans products.json
```json
{
  "nouveau-produit": {
    "name": "Nom du produit",
    "price": 29.99,
    "description": "Description...",
    ...
  }
}
```

### 2. Ajouter le stock dans stock.json
```json
{
  "nouveau-produit": 100
}
```

### 3. Synchroniser (optionnel)
```bash
php sync-stock.php
```

## Valeurs de Stock

- `null` ou omis : Stock illimité
- `0` : Rupture de stock (produit masqué)
- `> 0` : Quantité disponible

## Avantages de ce Système

✅ **Performance** : Chargement rapide de la boutique  
✅ **Fiabilité** : Fallback local en cas de panne API  
✅ **Flexibilité** : Mode dev/prod configurables  
✅ **Snipcart Compatible** : Synchronisation bidirectionnelle  
✅ **Cache intelligent** : Évite les appels répétés