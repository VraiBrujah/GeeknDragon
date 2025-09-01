"""
Fonction d'initialisation de la base de données
Import des modèles pour SQLAlchemy
"""

import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncEngine

# Import de tous les modèles pour que SQLAlchemy les connaisse
from .base import Base
from .clients import Client, ClientUser, ClientConfig
from .batteries import BatteryType, Location, Battery, CustomField
from .bms_data import BMSData, BMSDataHistory, Alert, MaintenanceLog
from .auth import User, Role, Permission

logger = logging.getLogger(__name__)


async def init_database(engine: AsyncEngine):
    """
    Initialise la base de données avec tous les modèles
    """
    from ..database import (
        create_database_schema,
        enable_row_level_security,
        create_indexes,
        create_initial_data
    )
    
    logger.info("🚀 Initialisation base de données avec tous les modèles")
    
    try:
        # 1. Création des tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        logger.info("✅ Tables créées avec succès")
        
        # Les autres étapes sont gérées par database.py
        
    except Exception as e:
        logger.error(f"❌ Erreur lors de l'initialisation: {e}")
        raise