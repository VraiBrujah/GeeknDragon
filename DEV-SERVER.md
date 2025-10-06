# Serveur de Développement - Geek & Dragon

## Répertoire de Travail Actuel
`E:\GitHub\GeeknDragon`

## Lancement du Serveur PHP Intégré

### Méthode Recommandée (avec routeur personnalisé)
```bash
php -S 192.168.2.33:8000 router.php
```

### Méthode Alternative (sans routeur)
```bash
php -S 192.168.2.33:8000
```

## Configuration CORS pour Développement

Le fichier `.env` est déjà configuré pour autoriser les origines de développement :
```env
CORS_ALLOWED_ORIGINS=https://geekndragon.com,http://192.168.2.33:8000,http://localhost:8000,http://127.0.0.1:8000
```

## Endpoints API Testés

### Test de l'API Products
```bash
# Test direct PHP
php api/test-products.php

# Test via navigateur
http://192.168.2.33:8000/api/products-async.php?category=all&lang=fr
```

### Résultats Attendus
- ✅ JSON valide avec clés : `pieces`, `cards`, `triptychs`, `counts`, `performance`
- ✅ Temps d'exécution : ~30-40ms
- ✅ Mémoire : ~2MB
- ✅ Total produits : 20 (8 pièces + 8 cartes + 4 triptyques)

## Build Automatique

**⚠️ OBLIGATOIRE après chaque modification CSS/JS :**
```bash
npm run build:complete
```

### Commandes Build Disponibles
- `npm run build:css` - Minification CSS uniquement
- `npm run build:js` - Minification JavaScript uniquement
- `npm run build:complete` - Build complet (recommandé)
- `npm run production:build` - Build optimisé pour production

## Résolution des Problèmes

### Erreur 500 sur `/api/products-async.php`
1. **Vérifier CORS** : Assurer que votre IP est dans `CORS_ALLOWED_ORIGINS`
2. **Relancer serveur** : Redémarrer le serveur PHP après modification du `.env`
3. **Tester directement** : `php api/test-products.php` pour diagnostiquer

### Avertissements PHP 8.2+
Les avertissements de dépréciation de la librairie `Parsedown` (vendor) sont normaux et n'affectent pas le fonctionnement.

### Fichiers Manquants
Si vous voyez des erreurs de classe manquante :
```bash
composer install
```

## Checklist Pré-Commit
- [ ] `npm run build:complete` exécuté
- [ ] Aucune erreur PHP : `php -l api/products-async.php`
- [ ] Tests fonctionnels : `php api/test-products.php`
- [ ] CORS configuré pour production dans `.env`
