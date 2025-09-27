# 🔍 Système de Monitoring et Logs Centralisés - Geek & Dragon

## 📋 Vue d'Ensemble

Le système de monitoring Geek & Dragon est une solution autonome de surveillance et logging qui respecte nos directives fondamentales :
- **100% local** - Aucune dépendance externe ou fuite de données
- **Extensible** - Architecture modulaire facilement extensible
- **Documentation française** - Tout commenté et documenté en français
- **Orienté objet** - Design patterns et clean code appliqués

## 🏗️ Architecture du Système

### Composants Principaux

```
monitoring-system/
├── 📁 includes/
│   └── logging-system.php          # Système de logs PHP centralisé
├── 📁 js/
│   └── monitoring-system.js        # Monitoring JavaScript côté client
├── 📁 api/monitoring/
│   └── sync.php                    # API de synchronisation des métriques
├── 📁 admin/
│   └── monitoring-dashboard.php    # Interface de visualisation
├── 📁 scripts/
│   ├── maintenance-logs.php        # Script de maintenance automatisée
│   └── test-monitoring.php         # Tests automatisés du système
└── 📁 logs/                        # Stockage des logs (auto-créé)
    ├── app.log                     # Logs applicatifs
    ├── erreurs.log                 # Logs d'erreurs
    ├── metriques.log               # Métriques de performance
    └── archives/                   # Archives compressées
```

## 🚀 Installation et Configuration

### 1. Activation Automatique

Le système est **automatiquement activé** lors du chargement de `bootstrap.php`. Aucune configuration manuelle requise pour un usage basique.

### 2. Configuration Avancée (Variables d'Environnement)

```bash
# Niveau de log minimum (DEBUG, INFO, WARN, ERROR, CRITICAL)
LOG_LEVEL=INFO

# Taille maximale d'un fichier de log (en octets)
LOG_MAX_SIZE=10485760

# Nombre de fichiers de rotation à conserver
LOG_ROTATIONS=5

# Mode debug détaillé
LOG_DEBUG=false

# Environnement de l'application
APP_ENV=production
```

### 3. Permissions Système

Assurez-vous que le serveur web peut écrire dans le répertoire `logs/` :

```bash
# Créer le répertoire si nécessaire
mkdir -p logs/archives

# Définir les permissions appropriées
chmod 755 logs/
chmod 644 logs/*.log
```

## 📝 Utilisation du Système de Logs PHP

### Fonctions Globales (Recommandées)

```php
// Messages d'information généraux
log_info('Utilisateur connecté', ['user_id' => 123, 'ip' => '192.168.1.1']);

// Avertissements non critiques
log_warn('Requête lente détectée', ['duree_ms' => 2500, 'endpoint' => '/api/data']);

// Erreurs nécessitant une attention
log_error('Échec de connexion base de données', ['serveur' => 'db.local', 'tentative' => 3]);

// Métriques de performance
log_metric('temps_reponse_api', 150.5, 'ms', ['endpoint' => '/api/products']);
```

### API Complète du Système

```php
// Obtenir l'instance du système de logs
$logger = log_gd();

// Tous les niveaux de logs
$logger->debug('Information de débogage', ['contexte' => 'dev']);
$logger->info('Information générale', ['action' => 'user_login']);
$logger->warn('Avertissement', ['ressource' => 'memory_high']);
$logger->error('Erreur récupérable', ['module' => 'payment']);
$logger->critical('Erreur critique', ['système' => 'database_down']);

// Enregistrement d'exceptions avec stack trace
try {
    // Code pouvant lever une exception
} catch (Exception $e) {
    $logger->exception($e, ['contexte_additionnel' => 'valeur']);
}

// Métriques personnalisées
$logger->metrique('ventes_journalieres', 1250.75, 'CAD', [
    'date' => '2025-09-27',
    'region' => 'Quebec'
]);

// Métriques de requête (automatique via bootstrap.php)
$logger->requete($tempsExecution, $memoireUtilisee);

// Statistiques système
$stats = $logger->obtenirStatistiques();
print_r($stats);

// Export des logs
$logsJSON = $logger->exporterLogs('json');
$logsCSV = $logger->exporterLogs('csv');
$logsTXT = $logger->exporterLogs('txt');

// Nettoyage manuel
$fichiersSupprimes = $logger->nettoyerAnciennesLogs();
```

## 📊 Monitoring JavaScript Côté Client

### Initialisation Automatique

Le monitoring JavaScript est **automatiquement initialisé** sur toutes les pages via `head-common.php`. Il s'adapte automatiquement à l'environnement (développement vs production).

### Fonctions Globales Disponibles

```javascript
// Enregistrer une métrique personnalisée
window.gdMetric('temps_calcul_convertisseur', 45.2, 'ms', {
    type: 'conversion',
    monnaie_source: 'copper'
});

// Signaler une erreur
window.gdError(new Error('Calcul impossible'), {
    contexte: 'convertisseur_monnaie',
    valeur_entrée: '1661'
});

// Mesurer la performance d'une opération
await window.gdMeasure('chargement_produits', async () => {
    const response = await fetch('/api/products');
    return response.json();
});
```

### Métriques Automatiquement Collectées

#### Performance Web
- **First Contentful Paint (FCP)** - Temps d'affichage du premier contenu
- **Largest Contentful Paint (LCP)** - Temps d'affichage du contenu principal
- **Cumulative Layout Shift (CLS)** - Stabilité visuelle de la page
- **Temps de chargement DOM** - Performance globale
- **Temps de réponse serveur** - Latence réseau

#### Interactions Utilisateur
- **Clics sur éléments trackés** - Boutons, liens importants
- **Temps passé sur page** - Engagement utilisateur
- **Scroll maximum atteint** - Profondeur de lecture
- **Abandon de session** - Taux de rebond

#### E-commerce Spécifique
- **Ajouts au panier Snipcart** - Tentatives et succès
- **Conversions e-commerce** - Commandes complétées
- **Revenus** - Montants des transactions
- **Performance convertisseur D&D** - Temps de calcul des optimisations

#### Erreurs et Problèmes
- **Erreurs JavaScript** - Exceptions non gérées
- **Erreurs de ressources** - Images, scripts non chargés
- **Promesses rejetées** - Appels API échoués

## 🎛️ Interface de Visualisation

### Accès au Dashboard

L'interface de monitoring est accessible aux administrateurs via :
```
https://votre-domaine.com/admin/monitoring-dashboard.php
```

**Authentification requise** : Mot de passe administrateur configuré via `ADMIN_PASSWORD_HASH`.

### Fonctionnalités du Dashboard

#### Vue d'Ensemble Temps Réel
- **Statistiques système** - PHP, mémoire, uptime
- **Métriques des logs** - Taille, nombre de fichiers, niveau
- **Auto-rafraîchissement** - Mise à jour toutes les 10 secondes

#### Journal des Événements
- **Filtrage par niveau** - DEBUG, INFO, WARN, ERROR, CRITICAL
- **Limitation configurable** - 50 à 500 dernières entrées
- **Recherche en temps réel** - Filtrage instantané
- **Contexte enrichi** - Informations détaillées pour chaque log

#### Actions Administratives
- **Nettoyage automatique** - Suppression des anciens logs
- **Export multi-format** - JSON, CSV pour analyse externe
- **Rafraîchissement manuel** - Mise à jour à la demande

## 🔧 Maintenance et Scripts d'Administration

### Script de Maintenance Automatisée

```bash
# Maintenance complète (rotation, nettoyage, compression, rapport)
php scripts/maintenance-logs.php

# Actions spécifiques
php scripts/maintenance-logs.php --rotation --nettoyage
php scripts/maintenance-logs.php --rapport --verbeux
php scripts/maintenance-logs.php --compression

# Mode simulation (aucune modification)
php scripts/maintenance-logs.php --dry-run --verbeux

# Configuration personnalisée
php scripts/maintenance-logs.php --retention=15 --taille-max=50
```

#### Options Disponibles
- `--rotation` - Rotation des logs volumineux
- `--nettoyage` - Suppression des fichiers expirés
- `--compression` - Compression des archives (format gzip)
- `--rapport` - Génération de rapport de synthèse
- `--optimisation` - Optimisation des performances
- `--dry-run` - Mode simulation sans modifications
- `--verbeux` - Affichage détaillé des opérations
- `--retention=X` - Jours de rétention (défaut: 30)
- `--taille-max=X` - Taille max répertoire en MB (défaut: 100)

### Script de Tests Automatisés

```bash
# Tests complets du système
php scripts/test-monitoring.php --verbeux --rapport

# Tests rapides (essentiels uniquement)
php scripts/test-monitoring.php --quick

# Tests silencieux pour intégration CI
php scripts/test-monitoring.php
```

Les tests valident :
1. ✅ Initialisation du système de logs
2. ✅ Écriture et lecture des logs
3. ✅ Niveaux de logs différents
4. ✅ Métriques de performance
5. ✅ Rotation des logs
6. ✅ Statistiques système
7. ✅ Export multi-format
8. ✅ Gestion des exceptions
9. ✅ API de synchronisation
10. ✅ Interface de visualisation

## 📈 Intégration avec les Composants Existants

### Convertisseur de Monnaie D&D

Le monitoring s'intègre automatiquement avec `CurrencyConverterPremium` :

```javascript
// Les calculs d'optimisation sont automatiquement mesurés
converter.updateCalculations(); // → Métrique 'convertisseur_calcul' générée

// Erreurs de conversion trackées
converter.onChange((data) => {
    if (data.error) {
        window.gdError(data.error, { contexte: 'convertisseur_dnd' });
    }
});
```

### Système E-commerce Snipcart

Événements automatiquement trackés :
- **Ajout au panier** - `ajout_panier_tentative` et `ajout_panier_succes`
- **Commandes** - `commande_completee` avec détails financiers
- **Erreurs de paiement** - Échecs de transaction

### Optimiseur de Lots

Le `CoinLotOptimizer` génère automatiquement :
- **Métriques de performance** - Temps d'exécution des algorithmes
- **Logs d'optimisation** - Résultats et recommandations
- **Erreurs d'analyse** - Problèmes de parsing des produits

## 🔒 Sécurité et Confidentialité

### Protection des Données

- **Aucune fuite externe** - Toutes les données restent locales
- **IP anonymisée** - Hash partiel pour l'identification sans tracking
- **Pas de PII** - Aucune donnée personnelle identifiable stockée
- **Sessions courtes** - IDs de session temporaires uniquement

### Authentification Administrative

- **Hachage bcrypt** - Mots de passe admin sécurisés
- **Tokens CSRF** - Protection contre les attaques cross-site
- **Sessions sécurisées** - Configuration PHP renforcée
- **Timeouts automatiques** - Déconnexion auto après inactivité

### Validation d'Entrée

- **Sanitisation systématique** - Toutes les entrées nettoyées
- **Limitation de taille** - Payloads limités (1MB max)
- **Validation de format** - JSON, structures de données vérifiées
- **Échappement XSS** - Protection dans l'interface web

## 📊 Métriques et KPIs Disponibles

### Performance Système
- `temps_reponse_api` - Latence des endpoints API
- `memoire_utilisee` - Consommation RAM par requête
- `temps_chargement_dom` - Performance frontend
- `nombre_requetes_concurrent` - Charge serveur

### Business E-commerce
- `revenus` - Montant des ventes (CAD)
- `conversions` - Taux de conversion panier→commande
- `valeur_panier_moyenne` - AOV (Average Order Value)
- `produits_populaires` - Top des ventes par ID

### Expérience Utilisateur
- `temps_session` - Durée d'engagement moyen
- `taux_rebond` - Abandons rapides
- `interactions_par_page` - Engagement par contenu
- `erreurs_utilisateur` - Problèmes rencontrés

### Système D&D Spécifique
- `conversions_monnaie` - Utilisation du convertisseur
- `optimisations_lots` - Recommandations générées
- `precision_algorithme` - Qualité des calculs
- `erreurs_calcul` - Échecs d'optimisation

## 🎯 Alertes et Seuils Recommandés

### Alertes Critiques (Action Immédiate)
- **Erreur 500+/min** - Problème système majeur
- **Mémoire >90%** - Risque de crash serveur
- **Disque logs >95%** - Espace stockage critique
- **Temps réponse >5s** - Performance dégradée

### Alertes Avertissement (Surveillance)
- **Erreur 50+/min** - Problème récurrent
- **Mémoire >70%** - Surveillance renforcée
- **Temps réponse >2s** - Performance sous-optimale
- **Conversion <2%** - Problème UX potentiel

### Configuration des Seuils

```php
// Dans bootstrap.php ou config spécifique
$alertes = [
    'temps_reponse_max_ms' => 2000,
    'memoire_max_mb' => 128,
    'erreurs_max_par_minute' => 10,
    'taille_logs_max_mb' => 100
];
```

## 🔄 Maintenance Périodique Recommandée

### Quotidienne (Automatisée)
```bash
# Cron job recommandé (2h du matin)
0 2 * * * cd /path/to/project && php scripts/maintenance-logs.php --rotation --nettoyage
```

### Hebdomadaire (Automatisée)
```bash
# Compression et optimisation (dimanche 3h)
0 3 * * 0 cd /path/to/project && php scripts/maintenance-logs.php --compression --optimisation --rapport
```

### Mensuelle (Manuelle)
- ✅ Analyse des rapports de synthèse
- ✅ Ajustement des seuils d'alerte
- ✅ Validation des métriques business
- ✅ Tests de performance complète
- ✅ Mise à jour de la documentation

## 🆘 Dépannage et Problèmes Courants

### Logs Non Générés

**Problème** : Aucun fichier de log créé

**Solutions** :
1. Vérifier les permissions du répertoire `logs/`
2. Confirmer l'inclusion de `bootstrap.php`
3. Tester manuellement : `log_info('test');`
4. Vérifier la configuration `LOG_LEVEL`

### Performance Dégradée

**Problème** : Dashboard lent ou indisponible

**Solutions** :
1. Réduire la rétention des logs (`--retention=7`)
2. Augmenter la compression (`--compression`)
3. Optimiser la base : `--optimisation`
4. Vérifier l'espace disque disponible

### Erreurs de Synchronisation JavaScript

**Problème** : Métriques client non reçues

**Solutions** :
1. Vérifier l'API `/api/monitoring/sync.php`
2. Contrôler les erreurs CORS
3. Valider les permissions du répertoire
4. Tester en mode debug : `?debug=1`

### Authentification Dashboard

**Problème** : Impossible d'accéder au dashboard

**Solutions** :
1. Vérifier `ADMIN_PASSWORD_HASH` configuré
2. Régénérer le hash : `password_hash('motdepasse', PASSWORD_DEFAULT)`
3. Contrôler les sessions PHP activées
4. Vérifier les logs d'authentification

## 📚 API Reference Complète

### SystemeLogsGeekDragon (PHP)

```php
class SystemeLogsGeekDragon {
    // Constructeur avec configuration
    public function __construct(array $configuration = []);

    // Méthodes de logging par niveau
    public function debug(string $message, array $contexte = []): void;
    public function info(string $message, array $contexte = []): void;
    public function warn(string $message, array $contexte = []): void;
    public function error(string $message, array $contexte = []): void;
    public function critical(string $message, array $contexte = []): void;

    // Gestion des métriques
    public function metrique(string $nom, float $valeur, string $unite = '', array $tags = []): void;
    public function requete(float $tempsExecution, int $memoireUtilisee): void;

    // Gestion des exceptions
    public function exception(Throwable $exception, array $contexte = []): void;

    // Utilitaires et maintenance
    public function obtenirStatistiques(): array;
    public function nettoyerAnciennesLogs(): int;
    public function exporterLogs(string $format = 'json', array $filtres = []): string;
}
```

### MonitoringSystemeGeekDragon (JavaScript)

```javascript
class MonitoringSystemeGeekDragon {
    // Constructeur avec configuration
    constructor(configuration = {});

    // Enregistrement de métriques
    enregistrerMetrique(nom, valeur, unite = '', tags = {});
    enregistrerErreur(erreur, contexte = {});

    // Mesure de performance
    async mesurerPerformance(nom, operation);

    // Synchronisation
    async synchroniserAvecServeur();
    async synchroniserImmediatement();

    // Utilitaires
    obtenirStatistiques();
    setModeDebug(actif);
}
```

## 🎉 Conclusion

Le système de monitoring Geek & Dragon offre une solution complète, autonome et sécurisée pour surveiller votre application e-commerce D&D. Avec ses composants PHP et JavaScript intégrés, son interface d'administration intuitive et ses scripts de maintenance automatisés, il garantit une visibilité optimale sur les performances et la santé de votre système.

**Avantages clés** :
- ✅ **100% autonome** - Aucune dépendance externe
- ✅ **Performance optimisée** - Overhead minimal
- ✅ **Sécurité renforcée** - Données privées locales
- ✅ **Facilité d'usage** - Configuration automatique
- ✅ **Extensibilité** - Architecture modulaire
- ✅ **Documentation française** - Support complet

Pour toute question ou problème, consultez les logs de debug ou utilisez les scripts de test automatisés pour diagnostiquer les problèmes.

---

**Geek & Dragon Monitoring System v1.0.0** - Conçu et développé avec ❤️ pour la communauté D&D québécoise.