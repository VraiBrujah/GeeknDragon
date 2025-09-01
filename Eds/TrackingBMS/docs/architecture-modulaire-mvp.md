# Architecture Modulaire MVP - TrackingBMS

**Version :** 2.0  
**Date :** 2025-09-01  
**Répertoire de Travail :** `C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\TrackingBMS`

## 1. Vue d'Ensemble Architecture

### 1.1 Principe Architectural

TrackingBMS MVP adopte une **architecture modulaire autonome** avec les principes suivants :

- **Modules Indépendants** : Chaque module est autonome avec sa propre architecture
- **Communication Standard** : Message Bus + Service Discovery + API Contracts
- **Tests Isolés** : Tests unitaires par module + tests d'intégration orchestrateur
- **Déploiement Modulaire** : Chaque module peut être déployé indépendamment
- **Extensibilité** : Ajout de nouveaux modules sans impact sur l'existant

### 1.2 Architecture Globale

```
TrackingBMS-MVP/
├── orchestrator/                    # 🧠 Meta-module Orchestrateur
│   ├── src/
│   │   ├── api_gateway/            # Point d'entrée unique (FastAPI)
│   │   ├── service_discovery/      # Découverte services (Redis)
│   │   ├── message_bus/            # Bus de communication (Redis Pub/Sub)
│   │   ├── health_monitor/         # Surveillance modules
│   │   ├── load_balancer/          # Load balancing services
│   │   └── web_server/            # Serveur web principal
│   ├── tests/
│   │   ├── unit/                  # Tests unitaires orchestrateur
│   │   ├── integration/           # Tests inter-modules
│   │   └── e2e/                   # Tests end-to-end complets
│   ├── docker-compose.yml         # Infrastructure complète
│   ├── requirements.txt
│   ├── pytest.ini
│   └── README.md
│
├── modules/
│   ├── database/                   # 🗄️ Module Database (PostgreSQL)
│   │   ├── src/
│   │   │   ├── models/            # SQLAlchemy models
│   │   │   ├── migrations/        # Alembic migrations
│   │   │   ├── repositories/      # Data access layer
│   │   │   ├── connection_manager.py
│   │   │   └── health_check.py
│   │   ├── tests/
│   │   │   ├── unit/              # Tests unitaires DB
│   │   │   ├── integration/       # Tests avec vraie DB
│   │   │   └── fixtures/          # Données test
│   │   ├── docker-compose.yml     # PostgreSQL + pgBouncer
│   │   ├── alembic.ini
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── auth/                      # 🔒 Module Authentication
│   │   ├── src/
│   │   │   ├── jwt_handler.py     # JWT tokens
│   │   │   ├── user_service.py    # CRUD utilisateurs
│   │   │   ├── permissions.py     # ACL granulaire
│   │   │   ├── multi_tenant.py    # Isolation clients
│   │   │   ├── middleware.py      # Auth middleware
│   │   │   └── password_utils.py  # Hashing/validation
│   │   ├── tests/
│   │   │   ├── unit/              # Tests unitaires auth
│   │   │   └── integration/       # Tests avec DB
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── bms_connector/             # 🔋 Module BMS Connectivity
│   │   ├── src/
│   │   │   ├── daly_bms/         # DalyBMS principal
│   │   │   │   ├── uart_handler.py
│   │   │   │   ├── bluetooth_handler.py
│   │   │   │   ├── protocol_parser.py
│   │   │   │   └── command_builder.py
│   │   │   ├── legacy/           # Support BMS legacy
│   │   │   │   ├── foxbms_adapter.py
│   │   │   │   └── libre_solar_adapter.py
│   │   │   ├── abstract_bms.py   # Interface commune
│   │   │   ├── device_manager.py # Gestionnaire devices
│   │   │   └── connection_pool.py
│   │   ├── tests/
│   │   │   ├── unit/             # Tests unitaires
│   │   │   ├── mocks/            # Mock devices BMS
│   │   │   └── hardware/         # Tests matériel réel
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── data_processor/            # ⚙️ Module Traitement Données
│   │   ├── src/
│   │   │   ├── realtime_processor.py    # Traitement temps réel
│   │   │   ├── aggregation_engine.py    # Agrégation données
│   │   │   ├── alert_engine.py          # Génération alertes
│   │   │   ├── statistics_calculator.py # Calculs statistiques
│   │   │   ├── data_validator.py        # Validation données
│   │   │   └── anomaly_detector.py      # Détection anomalies
│   │   ├── tests/
│   │   │   ├── unit/                    # Tests unitaires
│   │   │   ├── performance/             # Tests performance
│   │   │   └── fixtures/                # Données test
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── alerts/                    # 🚨 Module Alertes
│   │   ├── src/
│   │   │   ├── alert_manager.py   # Gestion alertes
│   │   │   ├── notification_sender.py
│   │   │   ├── escalation_engine.py
│   │   │   └── templates/         # Templates notifications
│   │   ├── tests/
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   └── web_interface/             # 💻 Module Interface Web
│       ├── frontend/              # Vue 3 Frontend
│       │   ├── src/
│       │   │   ├── components/    # Composants Vue
│       │   │   │   ├── dashboard/
│       │   │   │   ├── batteries/
│       │   │   │   ├── charts/
│       │   │   │   └── ui/        # Composants UI réutilisables
│       │   │   ├── stores/        # Pinia stores
│       │   │   ├── router/        # Vue router
│       │   │   ├── assets/        # CSS/images
│       │   │   │   ├── css/
│       │   │   │   │   ├── tailwind.css
│       │   │   │   │   ├── glassmorphism.css
│       │   │   │   │   └── dark-theme.css
│       │   │   │   └── images/
│       │   │   ├── utils/         # Utilitaires frontend
│       │   │   ├── types/         # TypeScript types
│       │   │   └── composables/   # Vue composables
│       │   ├── public/
│       │   ├── tests/
│       │   │   ├── unit/          # Tests composants
│       │   │   └── e2e/           # Tests Cypress
│       │   ├── package.json
│       │   ├── vite.config.js
│       │   ├── tailwind.config.js
│       │   └── tsconfig.json
│       │
│       ├── backend/               # FastAPI Backend Interface
│       │   ├── src/
│       │   │   ├── api/           # Endpoints FastAPI
│       │   │   │   ├── dashboard.py
│       │   │   │   ├── batteries.py
│       │   │   │   └── realtime.py
│       │   │   ├── websocket/     # WebSocket handlers
│       │   │   │   ├── realtime_handler.py
│       │   │   │   └── alerts_handler.py
│       │   │   ├── static/        # Fichiers statiques
│       │   │   └── templates/     # Templates Jinja2
│       │   ├── tests/
│       │   │   ├── unit/          # Tests API
│       │   │   └── integration/   # Tests WebSocket
│       │   └── requirements.txt
│       │
│       └── README.md
│
├── shared/                        # 📚 Code Partagé
│   ├── contracts/                 # Contrats API (OpenAPI 3.1)
│   │   ├── database.yaml
│   │   ├── auth.yaml
│   │   ├── bms_connector.yaml
│   │   ├── data_processor.yaml
│   │   └── web_interface.yaml
│   │
│   ├── events/                    # Définitions événements
│   │   ├── bms_events.py
│   │   ├── alert_events.py
│   │   └── system_events.py
│   │
│   ├── schemas/                   # Schémas données partagés
│   │   ├── battery_schemas.py
│   │   ├── user_schemas.py
│   │   └── api_responses.py
│   │
│   ├── utils/                     # Utilitaires communs
│   │   ├── logging_config.py
│   │   ├── validation.py
│   │   ├── encryption.py
│   │   └── date_utils.py
│   │
│   ├── communication/             # Communication inter-modules
│   │   ├── message_bus.py         # Bus de messages Redis
│   │   ├── service_registry.py    # Registre services
│   │   ├── api_client.py         # Client API générique
│   │   └── event_dispatcher.py    # Dispatching événements
│   │
│   └── testing/                   # Utilitaires de test
│       ├── fixtures/              # Fixtures communes
│       ├── mocks/                 # Mocks partagés
│       └── test_utils.py         # Utilitaires tests
│
├── docs/                          # 📖 Documentation
│   ├── architecture/
│   │   ├── overview.md
│   │   ├── modules.md
│   │   ├── communication.md
│   │   └── database.md
│   ├── api/
│   │   ├── openapi_specs/         # Spécifications complètes
│   │   └── examples/              # Exemples d'usage
│   ├── deployment/
│   │   ├── local_setup.md
│   │   ├── production.md
│   │   └── monitoring.md
│   └── user_guide/
│       ├── installation.md
│       └── usage.md
│
├── scripts/                       # 🔧 Scripts Utilitaires
│   ├── setup/
│   │   ├── init_database.py
│   │   ├── create_admin_user.py
│   │   └── setup_environment.py
│   ├── deployment/
│   │   ├── deploy_local.sh
│   │   └── health_check.py
│   └── testing/
│       ├── run_all_tests.py
│       └── generate_test_data.py
│
├── docker-compose.yml             # Infrastructure complète
├── docker-compose.dev.yml         # Environnement dev
├── .env.example                   # Variables environnement
├── requirements.txt               # Dépendances globales
├── pytest.ini                    # Configuration tests
└── README.md                      # Documentation principale
```

## 2. Communication Inter-Modules

### 2.1 Message Bus (Event-Driven)

**Architecture :** Redis Pub/Sub pour communication asynchrone

```python
# shared/communication/message_bus.py
import asyncio
import json
from typing import Dict, Callable, Any
from uuid import uuid4
from datetime import datetime
import redis.asyncio as redis

class MessageBus:
    """Bus de communication asynchrone inter-modules"""
    
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis = redis.from_url(redis_url)
        self.pubsub = self.redis.pubsub()
        self.handlers: Dict[str, Callable] = {}
        self.running = False
    
    async def publish(self, event_type: str, data: Dict[str, Any], 
                     module_id: str, priority: str = "normal"):
        """Publier un événement sur le bus"""
        event = {
            "id": str(uuid4()),
            "type": event_type,
            "data": data,
            "module_id": module_id,
            "priority": priority,
            "timestamp": datetime.utcnow().isoformat(),
            "retry_count": 0
        }
        
        channel = f"trackingbms.{event_type}"
        await self.redis.publish(channel, json.dumps(event))
        
        # Log pour debug
        print(f"📡 Event published: {event_type} from {module_id}")
    
    async def subscribe(self, event_pattern: str, handler: Callable):
        """S'abonner à un pattern d'événements"""
        pattern = f"trackingbms.{event_pattern}"
        self.handlers[pattern] = handler
        await self.pubsub.psubscribe(pattern)
        print(f"🔔 Subscribed to pattern: {event_pattern}")
    
    async def start_listening(self):
        """Démarrer l'écoute des événements"""
        self.running = True
        while self.running:
            try:
                message = await self.pubsub.get_message(ignore_subscribe_messages=True)
                if message:
                    await self._handle_message(message)
                await asyncio.sleep(0.01)  # Éviter 100% CPU
            except Exception as e:
                print(f"❌ Error in message bus: {e}")
                await asyncio.sleep(1)
    
    async def _handle_message(self, message):
        """Traiter un message reçu"""
        try:
            event_data = json.loads(message['data'])
            pattern = message['pattern'].decode()
            
            if pattern in self.handlers:
                handler = self.handlers[pattern]
                await handler(event_data)
                
        except Exception as e:
            print(f"❌ Error handling message: {e}")
    
    async def stop(self):
        """Arrêter le bus de messages"""
        self.running = False
        await self.pubsub.close()
        await self.redis.close()
```

### 2.2 Service Registry & Discovery

```python
# shared/communication/service_registry.py
from typing import List, Dict, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import redis.asyncio as redis
import json

@dataclass
class ServiceInfo:
    name: str
    version: str
    host: str
    port: int
    status: str = "healthy"
    capabilities: List[str] = None
    metadata: Dict[str, str] = None
    registered_at: str = None
    
    def __post_init__(self):
        if self.capabilities is None:
            self.capabilities = []
        if self.metadata is None:
            self.metadata = {}
        if self.registered_at is None:
            self.registered_at = datetime.utcnow().isoformat()

class ServiceRegistry:
    """Registre des services pour découverte automatique"""
    
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis = redis.from_url(redis_url)
        self.heartbeat_interval = 30  # secondes
        
    async def register_service(self, service_info: ServiceInfo):
        """Enregistrer un service dans le registre"""
        key = f"services:{service_info.name}:{service_info.version}"
        service_data = {
            "name": service_info.name,
            "version": service_info.version,
            "host": service_info.host,
            "port": service_info.port,
            "status": service_info.status,
            "capabilities": json.dumps(service_info.capabilities),
            "metadata": json.dumps(service_info.metadata),
            "registered_at": service_info.registered_at,
            "last_heartbeat": datetime.utcnow().isoformat()
        }
        
        await self.redis.hset(key, mapping=service_data)
        await self.redis.expire(key, self.heartbeat_interval * 2)  # TTL double du heartbeat
        
        print(f"✅ Service registered: {service_info.name}:{service_info.version}")
    
    async def discover_services(self, service_name: str) -> List[ServiceInfo]:
        """Découvrir les instances d'un service"""
        pattern = f"services:{service_name}:*"
        keys = []
        
        async for key in self.redis.scan_iter(match=pattern):
            keys.append(key.decode())
        
        services = []
        for key in keys:
            service_data = await self.redis.hgetall(key)
            if service_data:
                # Convertir bytes en strings
                service_dict = {k.decode(): v.decode() for k, v in service_data.items()}
                
                service = ServiceInfo(
                    name=service_dict["name"],
                    version=service_dict["version"],
                    host=service_dict["host"],
                    port=int(service_dict["port"]),
                    status=service_dict["status"],
                    capabilities=json.loads(service_dict.get("capabilities", "[]")),
                    metadata=json.loads(service_dict.get("metadata", "{}")),
                    registered_at=service_dict["registered_at"]
                )
                services.append(service)
        
        return services
    
    async def heartbeat(self, service_name: str, service_version: str):
        """Envoyer un heartbeat pour maintenir l'enregistrement"""
        key = f"services:{service_name}:{service_version}"
        await self.redis.hset(key, "last_heartbeat", datetime.utcnow().isoformat())
        await self.redis.expire(key, self.heartbeat_interval * 2)
    
    async def unregister_service(self, service_name: str, service_version: str):
        """Désenregistrer un service"""
        key = f"services:{service_name}:{service_version}"
        await self.redis.delete(key)
        print(f"🗑️ Service unregistered: {service_name}:{service_version}")
```

### 2.3 API Contracts (OpenAPI 3.1)

**Structure des contrats standardisés :**

```yaml
# shared/contracts/bms_connector.yaml
openapi: 3.1.0
info:
  title: BMS Connector Service
  description: Service de connexion et communication avec les systèmes BMS
  version: 1.0.0
  contact:
    name: TrackingBMS Team
    email: dev@trackingbms.com

servers:
  - url: http://localhost:8001/api/v1
    description: BMS Connector Service

paths:
  /health:
    get:
      summary: Health check du service BMS
      operationId: getHealth
      responses:
        '200':
          description: Service opérationnel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HealthResponse'
  
  /bms/connect:
    post:
      summary: Connecter un nouveau BMS
      operationId: connectBMS
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BMSConnectionRequest'
      responses:
        '201':
          description: BMS connecté avec succès
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BMSConnection'
        '400':
          $ref: '#/components/responses/BadRequest'
        '409':
          description: BMS déjà connecté
  
  /bms/data/{bms_id}:
    get:
      summary: Données temps réel d'un BMS
      operationId: getBMSData
      parameters:
        - name: bms_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
          description: Identifiant unique du BMS
      responses:
        '200':
          description: Données BMS
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BMSRealtimeData'
        '404':
          description: BMS non trouvé

components:
  schemas:
    HealthResponse:
      type: object
      properties:
        status:
          type: string
          enum: [healthy, degraded, unhealthy]
        timestamp:
          type: string
          format: date-time
        version:
          type: string
        connected_devices:
          type: integer
          minimum: 0
    
    BMSConnectionRequest:
      type: object
      required: [bms_type, connection_config]
      properties:
        bms_type:
          type: string
          enum: [daly_bms, foxbms, libre_solar, green_bms]
        name:
          type: string
          maxLength: 255
        connection_config:
          type: object
          properties:
            protocol:
              type: string
              enum: [uart, bluetooth, can, modbus]
            device_path:
              type: string
              description: "Chemin du device (ex: /dev/ttyUSB0)"
            mac_address:
              type: string
              pattern: '^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$'
              description: "Adresse MAC pour Bluetooth"
            baud_rate:
              type: integer
              default: 9600
              enum: [9600, 19200, 38400, 57600, 115200]
            timeout:
              type: number
              minimum: 0.1
              maximum: 10.0
              default: 1.0
    
    BMSConnection:
      type: object
      properties:
        id:
          type: string
          format: uuid
        bms_type:
          type: string
        name:
          type: string
        status:
          type: string
          enum: [connected, disconnected, error, testing]
        connection_config:
          $ref: '#/components/schemas/BMSConnectionRequest/properties/connection_config'
        created_at:
          type: string
          format: date-time
        last_data_received:
          type: string
          format: date-time
        connection_quality:
          type: number
          minimum: 0
          maximum: 100
          description: "Qualité de connexion en pourcentage"
    
    BMSRealtimeData:
      type: object
      properties:
        bms_id:
          type: string
          format: uuid
        timestamp:
          type: string
          format: date-time
        pack_voltage:
          type: number
          minimum: 0
          description: "Tension du pack en Volts"
        pack_current:
          type: number
          description: "Courant du pack en Ampères (+ = charge, - = décharge)"
        pack_power:
          type: number
          description: "Puissance du pack en Watts"
        soc_percent:
          type: number
          minimum: 0
          maximum: 100
          description: "État de charge en pourcentage"
        soh_percent:
          type: number
          minimum: 0
          maximum: 100
          description: "État de santé en pourcentage"
        temperatures:
          type: array
          items:
            type: number
          description: "Températures des sondes en Celsius"
        cell_voltages:
          type: array
          items:
            type: number
            minimum: 0
          description: "Tensions des cellules en Volts"
        balancing_status:
          type: object
          properties:
            active:
              type: boolean
            cells_balancing:
              type: array
              items:
                type: integer
                minimum: 1
        protection_status:
          type: object
          properties:
            overvoltage:
              type: boolean
            undervoltage:
              type: boolean
            overcurrent_charge:
              type: boolean
            overcurrent_discharge:
              type: boolean
            overtemperature:
              type: boolean
            undertemperature:
              type: boolean
        fault_codes:
          type: array
          items:
            type: string
        warning_codes:
          type: array
          items:
            type: string
  
  responses:
    BadRequest:
      description: Requête invalide
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: string
              message:
                type: string
              details:
                type: object
```

## 3. Stack Technologique Détaillée

### 3.1 Backend Modules

```yaml
Orchestrator:
  Framework: FastAPI 0.104+
  Server: Uvicorn
  Reverse Proxy: FastAPI + httpx
  Load Balancer: Custom FastAPI middleware
  
Database Module:
  ORM: SQLAlchemy 2.0+
  Migrations: Alembic
  Database: PostgreSQL 15+
  Connection Pool: asyncpg + SQLAlchemy async
  Connection Pool Manager: pgBouncer (production)

Auth Module:
  JWT: PyJWT
  Password Hashing: Passlib + bcrypt
  Session Storage: Redis
  Multi-tenant: PostgreSQL Row Level Security (RLS)

BMS Connector:
  Serial Communication: pySerial
  Bluetooth: bleak (asyncio-based)
  Protocol Parsing: struct + custom parsers
  Device Management: asyncio + concurrent.futures

Data Processor:
  Data Processing: Pandas + NumPy
  Background Tasks: Celery + Redis broker
  Statistics: SciPy
  Time Series: InfluxDB (future) ou PostgreSQL TimescaleDB

Web Interface Backend:
  API: FastAPI
  WebSocket: FastAPI WebSocket support
  Static Files: FastAPI StaticFiles
  Templates: Jinja2 (si nécessaire)

Communication:
  Message Bus: Redis Pub/Sub
  Service Discovery: Redis + custom registry
  API Clients: httpx (async HTTP client)
  Event Serialization: Pydantic models
```

### 3.2 Frontend Stack

```yaml
Framework: Vue 3.3+ with Composition API
Language: TypeScript 5.0+
Build Tool: Vite 5.0+
Package Manager: pnpm (recommandé) ou npm

UI Framework:
  CSS Framework: Tailwind CSS 3.3+
  Component Library: HeadlessUI
  Icons: Heroicons ou Lucide
  
State Management:
  Global State: Pinia
  Local State: Vue 3 Composition API (ref, reactive)
  
Routing:
  Router: Vue Router 4
  Route Guards: Custom auth guards
  
Charts & Visualisation:
  Charts: Chart.js 4+ avec vue-chartjs
  Real-time Updates: Native WebSocket API
  Data Tables: Custom components (Tailwind based)
  
Development Tools:
  Code Quality: ESLint + Prettier
  Type Checking: TypeScript + Vue Tsc
  Testing: Vitest + Vue Test Utils
  E2E Testing: Cypress (recommandé) ou Playwright
  
Build & Deployment:
  Build: Vite build
  Preview: Vite preview
  Static Analysis: TypeScript compiler
```

### 3.3 Infrastructure & DevOps

```yaml
Database:
  Primary: PostgreSQL 15+
  Connection Pool: pgBouncer
  Backup: pg_dump + automated scripts
  Monitoring: pg_stat_statements

Cache & Message Bus:
  Cache: Redis 7+
  Persistence: RDB + AOF
  Monitoring: Redis INFO

Development Environment:
  Containerization: Docker + Docker Compose
  Local Development: Docker Compose avec hot reload
  Database Migrations: Alembic (automatic)
  
Process Management:
  Development: uvicorn --reload
  Production: Gunicorn + Uvicorn workers ou PM2
  
Reverse Proxy (Production):
  Server: Nginx
  SSL: Let's Encrypt (Certbot)
  Compression: gzip + brotli
  Static Files: Nginx direct serving
  
Monitoring:
  Health Checks: Custom FastAPI endpoints
  Metrics: Prometheus (future) ou custom metrics
  Logging: Python logging + structured logs
  
Security:
  HTTPS: Required in production
  CORS: Configured per environment
  Authentication: JWT avec rotation
  Rate Limiting: Custom FastAPI middleware
```

## 4. Modules Détaillés

### 4.1 Module Database (Priorité 1)

**Responsabilités principales :**
- Modèles de données PostgreSQL avec SQLAlchemy 2.0
- Migrations automatiques avec Alembic
- Multi-tenant avec Row-Level Security (RLS)
- Pool de connexions optimisé
- Repositories pattern pour abstraction données
- Health checks et monitoring DB

**Structure interne :**
```python
# modules/database/src/models/base.py
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, DateTime, String, Integer
from datetime import datetime

Base = declarative_base()

class BaseModel(Base):
    __abstract__ = True
    
    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String(255), nullable=True)
    
    # Multi-tenant support
    tenant_id = Column(String(255), nullable=False, index=True)
```

**Multi-tenant avec RLS :**
```sql
-- Enable RLS on all tenant tables
ALTER TABLE batteries ENABLE ROW LEVEL SECURITY;

-- Create policy for tenant isolation
CREATE POLICY tenant_isolation ON batteries
    USING (tenant_id = current_setting('app.current_tenant'));

-- Function to set tenant context
CREATE OR REPLACE FUNCTION set_current_tenant(tenant_id TEXT)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_tenant', tenant_id, false);
END;
$$ LANGUAGE plpgsql;
```

### 4.2 Module Auth (Priorité 2)

**Responsabilités principales :**
- Authentification JWT avec refresh tokens
- Multi-tenant avec isolation stricte
- Permissions granulaires (RBAC)
- Gestion utilisateurs et rôles
- Sessions distribuées avec Redis
- Middleware d'authentification

**Structure interne :**
```python
# modules/auth/src/jwt_handler.py
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import jwt
from passlib.context import CryptContext

class JWTHandler:
    def __init__(self, secret_key: str, algorithm: str = "HS256"):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    def create_access_token(self, data: Dict[str, Any], 
                          expires_delta: Optional[timedelta] = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(hours=1)
        
        to_encode.update({"exp": expire, "type": "access"})
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    def create_refresh_token(self, data: Dict[str, Any]) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=7)
        to_encode.update({"exp": expire, "type": "refresh"})
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
```

### 4.3 Module BMS Connector (Priorité 3)

**Responsabilités principales :**
- Communication avec DalyBMS (UART/Bluetooth)
- Support legacy (foxBMS, Libre Solar, Green-BMS)
- Auto-discovery et gestion devices
- Parsing protocoles BMS
- Gestion erreurs et reconnexion automatique
- Interface abstraite pour nouveaux BMS

**Structure interne :**
```python
# modules/bms_connector/src/abstract_bms.py
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from dataclasses import dataclass

@dataclass
class BMSData:
    """Structure standardisée des données BMS"""
    voltage: float
    current: float
    soc: float
    temperatures: list[float]
    cell_voltages: list[float]
    timestamp: str
    status: str
    alerts: list[str]

class AbstractBMS(ABC):
    """Interface abstraite pour tous les BMS"""
    
    @abstractmethod
    async def connect(self) -> bool:
        """Se connecter au BMS"""
        pass
    
    @abstractmethod
    async def disconnect(self):
        """Se déconnecter du BMS"""
        pass
    
    @abstractmethod
    async def get_realtime_data(self) -> Optional[BMSData]:
        """Récupérer données temps réel"""
        pass
    
    @abstractmethod
    async def is_connected(self) -> bool:
        """Vérifier la connexion"""
        pass
    
    @abstractmethod
    def get_capabilities(self) -> list[str]:
        """Retourner les capacités du BMS"""
        pass
```

### 4.4 Module Data Processor (Priorité 4)

**Responsabilités principales :**
- Traitement données BMS en temps réel
- Calculs SOC/SOH/cycles/efficacité
- Génération d'alertes intelligentes
- Agrégation données historiques
- Validation et nettoyage données
- Détection d'anomalies

### 4.5 Module Web Interface (Priorité 5)

**Responsabilités principales :**
- Interface utilisateur Vue 3 moderne
- Dashboard temps réel avec WebSocket
- Mode sombre glassmorphism premium
- Graphiques interactifs Chart.js
- Responsive design complet
- PWA capabilities (future)

## 5. Ordre de Développement (6 semaines)

### Semaine 1: Infrastructure & Database
- **Module Database** complet
- **Orchestrator base** (service registry, message bus)
- PostgreSQL + Redis configurés
- Tests unitaires database (>90% coverage)

### Semaine 2: Communication & Auth  
- **Module Auth** complet avec multi-tenant
- **API Gateway** fonctionnel
- **Health monitoring** basique
- Tests d'intégration auth + database

### Semaine 3: BMS Connectivity
- **Module BMS Connector** avec DalyBMS
- **Device discovery** et gestion
- **Mock BMS** pour tests
- Tests unitaires + tests hardware

### Semaine 4: Data Processing
- **Module Data Processor** complet
- **Alert engine** basique
- **Pipeline temps réel** fonctionnel
- Tests performance et validation

### Semaine 5: Interface Web
- **Frontend Vue 3** avec mode sombre
- **Dashboard** principal fonctionnel
- **WebSocket** temps réel
- **Pages CRUD** batteries

### Semaine 6: Integration & Polish
- **Tests E2E** complets
- **Documentation** utilisateur
- **Optimisations** performance
- **Déploiement** local automatisé

## 6. Commencer le Développement

### 6.1 Prérequis Techniques

```bash
# Versions requises
Python: 3.11+
Node.js: 18+
PostgreSQL: 15+
Redis: 7+
Docker: 24+
Docker Compose: 2.20+
```

### 6.2 Setup Initial Recommandé

```bash
# 1. Créer la structure de base
mkdir TrackingBMS-MVP
cd TrackingBMS-MVP

# 2. Initialiser l'orchestrator
mkdir -p orchestrator/src orchestrator/tests
cd orchestrator
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install fastapi uvicorn redis sqlalchemy alembic

# 3. Setup infrastructure
docker-compose up -d postgres redis

# 4. Créer le premier module (Database)
mkdir -p modules/database/src modules/database/tests
cd modules/database
python -m venv venv
source venv/bin/activate
pip install sqlalchemy alembic psycopg2-binary
```

**Veux-tu que je commence par créer la structure complète du projet et implémenter le Module Database en premier ?**

Cette architecture modulaire garantit:
✅ **Indépendance** des modules  
✅ **Tests isolés** et intégration  
✅ **Communication standardisée**  
✅ **Extensibilité maximale**  
✅ **MVP fonctionnel** en 6 semaines  
✅ **PostgreSQL** optimisé pour production  