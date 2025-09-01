"""
Module modEdsDatabase - API FastAPI pour gestion multi-tenant des données BMS
Architecture: PostgreSQL + pgBouncer + Row-Level Security
Auteur: EDS Québec - TrackingBMS v1.0
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Optional

import uvicorn
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
import redis.asyncio as redis

from config import get_settings
from database import DatabaseManager, get_db_manager
from models import init_database
from routers import health, auth, clients, batteries, bms_data
from middleware import TenantMiddleware, RateLimitMiddleware
from websocket_manager import WebSocketManager

# Configuration des logs
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Variables globales
redis_client: Optional[redis.Redis] = None
websocket_manager: Optional[WebSocketManager] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestionnaire du cycle de vie de l'application"""
    global redis_client, websocket_manager
    
    settings = get_settings()
    
    # Initialisation Redis
    try:
        redis_client = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=5,
            socket_keepalive=True,
            socket_keepalive_options={},
            health_check_interval=30
        )
        await redis_client.ping()
        logger.info("✅ Connexion Redis établie")
    except Exception as e:
        logger.error(f"❌ Erreur connexion Redis: {e}")
        raise
    
    # Initialisation WebSocket Manager
    websocket_manager = WebSocketManager(redis_client)
    
    # Initialisation base de données
    try:
        db_manager = get_db_manager()
        await init_database(db_manager.engine)
        logger.info("✅ Base de données initialisée")
    except Exception as e:
        logger.error(f"❌ Erreur initialisation BDD: {e}")
        raise
    
    # Tâche background pour monitoring
    monitoring_task = asyncio.create_task(background_monitoring())
    
    logger.info("🚀 modEdsDatabase démarré avec succès")
    
    yield
    
    # Nettoyage lors de l'arrêt
    monitoring_task.cancel()
    try:
        await monitoring_task
    except asyncio.CancelledError:
        pass
    
    if redis_client:
        await redis_client.aclose()
    
    logger.info("🛑 modEdsDatabase arrêté proprement")


async def background_monitoring():
    """Tâche de monitoring en arrière-plan"""
    while True:
        try:
            # Health check PostgreSQL
            db_manager = get_db_manager()
            await db_manager.health_check()
            
            # Health check Redis
            if redis_client:
                await redis_client.ping()
            
            # Statistiques de connexion
            stats = await db_manager.get_connection_stats()
            logger.debug(f"Pool stats: {stats}")
            
            await asyncio.sleep(30)  # Check toutes les 30s
            
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Erreur monitoring: {e}")
            await asyncio.sleep(60)  # Attente plus longue en cas d'erreur


def create_app() -> FastAPI:
    """Factory pour créer l'application FastAPI"""
    
    app = FastAPI(
        title="modEdsDatabase - TrackingBMS",
        description="API de gestion multi-tenant des données BMS",
        version="1.0.0",
        docs_url="/api/v1/docs",
        redoc_url="/api/v1/redoc",
        openapi_url="/api/v1/openapi.json",
        lifespan=lifespan
    )
    
    # Configuration CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # À restreindre en production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Compression Gzip
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    
    # Middleware custom
    app.add_middleware(TenantMiddleware)
    app.add_middleware(RateLimitMiddleware)
    
    # Routes
    app.include_router(health.router, prefix="/api/v1", tags=["health"])
    app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
    app.include_router(clients.router, prefix="/api/v1/clients", tags=["clients"])
    app.include_router(batteries.router, prefix="/api/v1/batteries", tags=["batteries"])
    app.include_router(bms_data.router, prefix="/api/v1/bms", tags=["bms-data"])
    
    # Injection du WebSocket manager dans bms_data
    from routers.bms_data import set_websocket_manager
    if websocket_manager:
        set_websocket_manager(websocket_manager)
    
    # Gestionnaire d'erreurs global
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.detail,
                "path": str(request.url.path),
                "method": request.method,
                "timestamp": str(asyncio.get_event_loop().time())
            }
        )
    
    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        logger.error(f"Erreur non gérée: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "error": "Erreur interne du serveur",
                "path": str(request.url.path),
                "method": request.method,
                "timestamp": str(asyncio.get_event_loop().time())
            }
        )
    
    return app


# Point d'entrée principal
app = create_app()


@app.get("/")
async def root():
    """Point d'entrée racine"""
    return {
        "service": "modEdsDatabase",
        "version": "1.0.0",
        "status": "running",
        "docs": "/api/v1/docs"
    }


if __name__ == "__main__":
    settings = get_settings()
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info" if settings.DEBUG else "warning",
        access_log=True,
        server_header=False,
        date_header=False
    )