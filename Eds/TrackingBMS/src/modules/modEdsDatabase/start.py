#!/usr/bin/env python3
"""
Script de démarrage du module modEdsDatabase
Initialisation complète avec vérifications de santé
"""

import asyncio
import logging
import sys
import os

# Ajouter le répertoire du module au PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import get_settings
from database import get_db_manager
from main import create_app
import uvicorn

# Configuration des logs
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("modEdsDatabase.log")
    ]
)

logger = logging.getLogger(__name__)


async def check_dependencies():
    """
    Vérifications pré-démarrage des dépendances
    """
    logger.info("🔍 Vérification des dépendances...")
    
    settings = get_settings()
    errors = []
    
    # 1. Test Redis
    try:
        import redis.asyncio as redis
        redis_client = redis.from_url(settings.REDIS_URL, socket_connect_timeout=5)
        await redis_client.ping()
        await redis_client.aclose()
        logger.info("✅ Redis: OK")
    except Exception as e:
        errors.append(f"❌ Redis non accessible: {e}")
    
    # 2. Test PostgreSQL
    try:
        db_manager = get_db_manager()
        await db_manager.initialize()
        health = await db_manager.health_check()
        if health["status"] == "healthy":
            logger.info("✅ PostgreSQL: OK")
        else:
            errors.append(f"❌ PostgreSQL non sain: {health}")
    except Exception as e:
        errors.append(f"❌ PostgreSQL non accessible: {e}")
    
    # 3. Vérifications configuration
    if len(settings.SECRET_KEY) < 32:
        errors.append("❌ SECRET_KEY trop courte (< 32 caractères)")
    
    if settings.DATABASE_URL == "postgresql+asyncpg://trackingbms:password@localhost:6432/trackingbms_core":
        logger.warning("⚠️ DATABASE_URL utilise les valeurs par défaut")
    
    if errors:
        logger.error("💥 Erreurs de dépendances détectées:")
        for error in errors:
            logger.error(f"   {error}")
        return False
    
    logger.info("✅ Toutes les dépendances sont OK")
    return True


async def initialize_database():
    """
    Initialise la base de données si nécessaire
    """
    logger.info("🔧 Initialisation de la base de données...")
    
    try:
        db_manager = get_db_manager()
        if not db_manager.engine:
            await db_manager.initialize()
        
        # Import pour déclencher la création des tables
        from models import init_database
        await init_database(db_manager.engine)
        
        logger.info("✅ Base de données initialisée")
        return True
        
    except Exception as e:
        logger.error(f"❌ Erreur initialisation DB: {e}")
        return False


def main():
    """
    Point d'entrée principal
    """
    settings = get_settings()
    
    logger.info("🚀 Démarrage modEdsDatabase")
    logger.info(f"   Version: {settings.VERSION}")
    logger.info(f"   Environment: {'Production' if settings.is_production else 'Development'}")
    logger.info(f"   Host: {settings.HOST}:{settings.PORT}")
    logger.info(f"   Debug: {settings.DEBUG}")
    
    async def startup_checks():
        # Vérifications pré-démarrage
        if not await check_dependencies():
            logger.error("💥 Impossible de démarrer - dépendances manquantes")
            sys.exit(1)
        
        # Initialisation DB
        if not await initialize_database():
            logger.error("💥 Impossible d'initialiser la base de données")
            sys.exit(1)
        
        logger.info("🎉 Prêt pour le démarrage!")
    
    # Exécuter les vérifications
    try:
        asyncio.run(startup_checks())
    except KeyboardInterrupt:
        logger.info("⏹️ Arrêt demandé par l'utilisateur")
        sys.exit(0)
    except Exception as e:
        logger.error(f"💥 Erreur lors du démarrage: {e}")
        sys.exit(1)
    
    # Démarrage du serveur
    try:
        uvicorn.run(
            "main:app",
            host=settings.HOST,
            port=settings.PORT,
            reload=settings.DEBUG,
            log_level="info" if settings.DEBUG else "warning",
            access_log=True,
            server_header=False,
            date_header=False,
            workers=1 if settings.DEBUG else 4  # Multi-worker en production
        )
    except KeyboardInterrupt:
        logger.info("⏹️ Arrêt propre du serveur")
    except Exception as e:
        logger.error(f"💥 Erreur serveur: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()