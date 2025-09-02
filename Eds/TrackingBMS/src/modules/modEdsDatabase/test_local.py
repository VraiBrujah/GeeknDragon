"""
Script de test local pour module EDS Database
Test sans Docker avec SQLite
"""

import asyncio
import sys
import os
import logging
from pathlib import Path

# Ajouter le répertoire src au path
sys.path.insert(0, str(Path(__file__).parent))

# Configuration environnement de test
os.environ['ENV_FILE'] = '.env.test'

from config import get_settings
from database import get_db_manager, create_database_schema

# Configuration logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_database_connection():
    """Test de connexion basique à la base de données"""
    logger.info("🧪 Test 1: Connexion base de données")
    
    try:
        settings = get_settings()
        logger.info(f"📊 Database URL: {settings.DATABASE_URL}")
        
        db_manager = get_db_manager()
        await db_manager.initialize()
        
        # Test health check
        health = await db_manager.health_check()
        logger.info(f"✅ Health check: {health['status']}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Erreur connexion DB: {e}")
        return False

async def test_database_schema():
    """Test de création du schéma"""
    logger.info("🧪 Test 2: Création schéma base de données")
    
    try:
        await create_database_schema()
        logger.info("✅ Schéma créé avec succès")
        return True
        
    except Exception as e:
        logger.error(f"❌ Erreur création schéma: {e}")
        return False

async def test_basic_operations():
    """Test des opérations CRUD basiques"""
    logger.info("🧪 Test 3: Opérations CRUD basiques")
    
    try:
        db_manager = get_db_manager()
        
        # Test requête simple
        async with db_manager.get_session() as session:
            from sqlalchemy.sql import text
            result = await session.execute(text("SELECT 1 as test"))
            test_value = result.scalar()
            
            if test_value == 1:
                logger.info("✅ Requête SQL basique réussie")
                return True
            else:
                logger.error("❌ Résultat inattendu")
                return False
                
    except Exception as e:
        logger.error(f"❌ Erreur opérations CRUD: {e}")
        return False

async def test_api_startup():
    """Test de démarrage de l'API FastAPI"""
    logger.info("🧪 Test 4: Démarrage API FastAPI")
    
    try:
        from main import app
        logger.info("✅ Application FastAPI importée")
        
        # Test configuration basique
        if app:
            logger.info("✅ Instance FastAPI créée")
            return True
        else:
            logger.error("❌ Échec création instance FastAPI")
            return False
            
    except Exception as e:
        logger.error(f"❌ Erreur démarrage API: {e}")
        return False

async def test_imports():
    """Test des imports principaux"""
    logger.info("🧪 Test 5: Imports modules principaux")
    
    try:
        # Test imports modèles
        from models.base import Base
        from models.clients import Client
        from models.batteries import Battery
        from models.bms_data import BMSData
        from models.auth import User
        logger.info("✅ Modèles importés")
        
        # Test imports routers
        from routers.health import router as health_router
        from routers.auth import router as auth_router
        logger.info("✅ Routers importés")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Erreur imports: {e}")
        return False

async def run_all_tests():
    """Exécute tous les tests"""
    logger.info("🚀 Démarrage tests locaux module EDS Database")
    logger.info("=" * 60)
    
    tests = [
        ("Imports modules", test_imports),
        ("Connexion DB", test_database_connection),
        ("Schéma DB", test_database_schema),
        ("Opérations CRUD", test_basic_operations),
        ("API FastAPI", test_api_startup),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = await test_func()
            results.append((test_name, result))
            logger.info("-" * 40)
        except Exception as e:
            logger.error(f"❌ Erreur test {test_name}: {e}")
            results.append((test_name, False))
    
    # Résultats finaux
    logger.info("=" * 60)
    logger.info("📊 Résultats des tests:")
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        logger.info(f"  {status} - {test_name}")
        if result:
            passed += 1
    
    logger.info(f"📈 Score: {passed}/{total} tests réussis")
    
    if passed == total:
        logger.info("🎉 Tous les tests sont passés !")
        return True
    else:
        logger.warning(f"⚠️  {total - passed} test(s) échoué(s)")
        return False

if __name__ == "__main__":
    success = asyncio.run(run_all_tests())
    sys.exit(0 if success else 1)