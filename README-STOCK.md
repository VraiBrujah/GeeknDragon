# Gestion du Stock Snipcart

## Fonctionnement

### Priorité des sources de stock
- **API Snipcart** : utilisée automatiquement dès qu'une clé secrète (`snipcart_secret_api_key`) est configurée.
- **Cache local (`data/stock.json`)** : sert de repli si l'appel API échoue ou si le mode hors ligne est forcé.

### Mode Développement (Par défaut)
- Aucune variable d'environnement n'est requise.
- L'API est appelée dès qu'une clé secrète est disponible pour reproduire le comportement de production.
- Pour travailler hors ligne, forcez l'utilisation du cache local :

```bash
# Linux/Mac
export SNIPCART_SYNC=false

# Windows (PowerShell)
$env:SNIPCART_SYNC="false"

# Windows (Invite de commandes)
set SNIPCART_SYNC=false
```

> Toute valeur évaluée à `false` (`0`, `false`, `off`, etc.) désactive l'appel API.

### Production
- Aucun drapeau supplémentaire n'est nécessaire : la clé secrète suffit.
- `SNIPCART_SYNC` peut être omise en production.

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
