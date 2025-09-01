# Module EDS Database - TrackingBMS

**Version :** 1.0.0  
**Type :** Module Database avec API intégrée  
**Licence :** MIT  
**Répertoire :** `src/modules/modEdsDatabase`

## 🎯 Objectif

Module database autonome pour TrackingBMS utilisant une approche API-first avec sécurité multi-tenant intégrée.

## 🏗️ Architecture Choisie

### Option Recommandée: Supabase Local
- **Runtime :** 100% local via Docker
- **API :** REST auto-générée + SDK Python
- **Database :** PostgreSQL 15+ avec Row-Level Security
- **Auth :** JWT multi-tenant intégré
- **Real-time :** WebSocket subscriptions
- **Admin UI :** Interface web d'administration

### Alternative: PostgREST
- **Runtime :** Binary unique ultra-léger
- **API :** REST auto-générée depuis schéma PostgreSQL
- **Performance :** Excellente, minimal overhead

## 📋 Fonctionnalités

### Core Features
- ✅ CRUD complet batteries/utilisateurs/lieux
- ✅ Multi-tenant avec isolation stricte (RLS)
- ✅ API REST auto-documentée (OpenAPI)
- ✅ Real-time subscriptions WebSocket
- ✅ Migrations automatiques
- ✅ Backup/restore intégré
- ✅ Health checks et monitoring
- ✅ Pool connexions optimisé

### Sécurité
- 🔒 Row-Level Security (RLS) PostgreSQL
- 🔒 JWT authentication avec refresh tokens
- 🔒 Audit logs complets
- 🔒 Encryption at rest
- 🔒 Rate limiting intégré
- 🔒 Input validation automatique

### Performance
- ⚡ Connection pooling (pgBouncer)
- ⚡ Indexes optimisés
- ⚡ Query caching
- ⚡ Async operations
- ⚡ Bulk operations support

## 🚀 Installation & Setup

### Prérequis
```bash
Docker 24+
Docker Compose 2.20+
Python 3.11+
PostgreSQL 15+ (via Docker)
Redis 7+ (pour cache/sessions)
```

### Setup Supabase Local
```bash
# 1. Cloner et configurer Supabase
git clone https://github.com/supabase/supabase
cd supabase/docker
cp .env.example .env

# 2. Démarrer l'infrastructure
docker-compose up -d

# 3. Accès
API: http://localhost:54321
Admin UI: http://localhost:54323
Database: postgresql://postgres:postgres@localhost:54322/postgres
```

### Setup Module
```bash
# 1. Installer dépendances
cd src/modules/modEdsDatabase
pip install -r requirements.txt

# 2. Configuration
cp .env.example .env
# Éditer .env avec vos paramètres

# 3. Initialiser la base
python src/setup/init_database.py

# 4. Lancer les tests
pytest tests/ -v

# 5. Démarrer le service
python src/main.py
```

## 📁 Structure du Module

```
src/modules/modEdsDatabase/
├── src/
│   ├── api/                    # API Endpoints
│   │   ├── __init__.py
│   │   ├── batteries.py        # CRUD batteries
│   │   ├── users.py           # Gestion utilisateurs
│   │   ├── locations.py       # Gestion lieux
│   │   ├── realtime.py        # Données temps réel
│   │   └── health.py          # Health checks
│   │
│   ├── models/                 # Modèles de données
│   │   ├── __init__.py
│   │   ├── base.py            # Modèle base
│   │   ├── battery.py         # Modèles batteries
│   │   ├── user.py            # Modèles utilisateurs
│   │   ├── location.py        # Modèles lieux
│   │   └── bms_data.py        # Données BMS
│   │
│   ├── services/               # Services métier
│   │   ├── __init__.py
│   │   ├── supabase_client.py # Client Supabase
│   │   ├── auth_service.py    # Service authentification
│   │   ├── battery_service.py # Service batteries
│   │   └── realtime_service.py # Service temps réel
│   │
│   ├── repositories/           # Couche d'accès données
│   │   ├── __init__.py
│   │   ├── base_repository.py # Repository base
│   │   ├── battery_repository.py
│   │   └── user_repository.py
│   │
│   ├── schemas/                # Schémas Pydantic
│   │   ├── __init__.py
│   │   ├── battery_schemas.py
│   │   ├── user_schemas.py
│   │   └── response_schemas.py
│   │
│   ├── middleware/             # Middleware personnalisés
│   │   ├── __init__.py
│   │   ├── auth_middleware.py
│   │   ├── tenant_middleware.py
│   │   └── logging_middleware.py
│   │
│   ├── utils/                  # Utilitaires
│   │   ├── __init__.py
│   │   ├── database.py        # Utilitaires DB
│   │   ├── security.py        # Utilitaires sécurité
│   │   └── validation.py      # Validation
│   │
│   ├── setup/                  # Scripts d'initialisation
│   │   ├── __init__.py
│   │   ├── init_database.py   # Init base de données
│   │   ├── create_admin.py    # Créer admin
│   │   └── seed_data.py       # Données de test
│   │
│   ├── config/                 # Configuration
│   │   ├── __init__.py
│   │   ├── settings.py        # Paramètres
│   │   ├── database.py        # Config DB
│   │   └── security.py        # Config sécurité
│   │
│   └── main.py                # Point d'entrée
│
├── tests/                     # Tests
│   ├── __init__.py
│   ├── conftest.py           # Configuration tests
│   ├── unit/                 # Tests unitaires
│   │   ├── test_models.py
│   │   ├── test_services.py
│   │   └── test_repositories.py
│   ├── integration/          # Tests intégration
│   │   ├── test_api.py
│   │   ├── test_auth.py
│   │   └── test_realtime.py
│   ├── fixtures/             # Données test
│   │   ├── batteries.json
│   │   └── users.json
│   └── performance/          # Tests performance
│       ├── test_load.py
│       └── test_concurrent.py
│
├── docs/                     # Documentation
│   ├── api.md               # Documentation API
│   ├── database.md          # Schéma base de données
│   ├── security.md          # Sécurité
│   └── deployment.md        # Déploiement
│
├── scripts/                 # Scripts utilitaires
│   ├── backup.py           # Backup automatique
│   ├── restore.py          # Restauration
│   └── migrate.py          # Migrations
│
├── docker/                 # Configuration Docker
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── requirements.txt        # Dépendances Python
├── requirements-dev.txt    # Dépendances développement
├── pytest.ini            # Configuration tests
├── .env.example           # Variables environnement
├── .dockerignore
├── .gitignore
└── README.md
```

## 🔌 API Endpoints

### Base URL
```
Local: http://localhost:8001/api/v1
```

### Authentication
```bash
POST /auth/login          # Connexion
POST /auth/refresh        # Refresh token
POST /auth/logout         # Déconnexion
```

### Batteries
```bash
GET    /batteries         # Liste batteries
POST   /batteries         # Créer batterie
GET    /batteries/{id}    # Détail batterie
PUT    /batteries/{id}    # Modifier batterie
DELETE /batteries/{id}    # Supprimer batterie
```

### Real-time Data
```bash
GET    /batteries/{id}/realtime    # Données temps réel
POST   /batteries/{id}/data        # Ajouter données
GET    /batteries/{id}/history     # Historique
```

### WebSocket
```bash
WS /ws/realtime/{battery_id}    # Souscription temps réel
WS /ws/alerts                   # Souscription alertes
```

## 🧪 Tests

### Lancer tous les tests
```bash
pytest tests/ -v --cov=src --cov-report=html
```

### Tests par catégorie
```bash
# Tests unitaires seulement
pytest tests/unit/ -v

# Tests d'intégration
pytest tests/integration/ -v

# Tests de performance
pytest tests/performance/ -v
```

### Coverage
```bash
# Rapport coverage
coverage run -m pytest
coverage report -m
coverage html
```

## 📊 Monitoring

### Health Check
```bash
GET /health
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "uptime": 3600
}
```

### Métriques
- Connexions actives
- Requêtes par seconde
- Temps de réponse moyen
- Erreurs par minute
- Cache hit ratio

## 🚀 Déploiement

### Local Development
```bash
docker-compose up -d
python src/main.py
```

### Production
```bash
# Build image
docker build -t eds-database .

# Deploy
docker run -d \
  --name eds-database \
  -p 8001:8001 \
  -e DATABASE_URL=postgresql://... \
  eds-database
```

## 🔧 Configuration

### Variables d'Environnement
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/trackingbms
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=30

# Supabase
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Security
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Redis
REDIS_URL=redis://localhost:6379

# API
API_HOST=0.0.0.0
API_PORT=8001
API_WORKERS=1
```

## 📝 Changelog

### v1.0.0 (2025-09-01)
- ✅ Initial release
- ✅ Supabase integration
- ✅ Multi-tenant support
- ✅ Real-time subscriptions
- ✅ Complete test suite
- ✅ Docker setup
- ✅ API documentation