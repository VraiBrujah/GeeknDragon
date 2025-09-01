#!/usr/bin/env python3
"""
Script de test de l'installation modEdsDatabase
Valide la configuration et les connexions
"""

import asyncio
import logging
import sys
import os
from datetime import datetime

# Ajouter le répertoire du module au PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Configuration des logs pour les tests
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def test_configuration():
    """Test de la configuration"""
    print("🧪 Test 1: Configuration")
    
    try:
        from config import get_settings
        settings = get_settings()
        
        print(f"   ✅ Version: {settings.VERSION}")
        print(f"   ✅ Mode debug: {settings.DEBUG}")
        print(f"   ✅ Host/Port: {settings.HOST}:{settings.PORT}")
        print(f"   ✅ Database URL: {settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else 'URL cachée'}")
        print(f"   ✅ Redis URL: {settings.REDIS_URL}")
        
        if len(settings.SECRET_KEY) < 32:
            print("   ⚠️ SECRET_KEY trop courte - À changer en production!")
        else:
            print("   ✅ SECRET_KEY OK")
            
        return True
        
    except Exception as e:
        print(f"   ❌ Erreur configuration: {e}")
        return False


async def test_redis_connection():
    """Test de connexion Redis"""
    print("\n🧪 Test 2: Connexion Redis")
    
    try:
        from config import get_settings
        import redis.asyncio as redis
        
        settings = get_settings()
        redis_client = redis.from_url(settings.REDIS_URL, socket_connect_timeout=5)
        
        # Test ping
        await redis_client.ping()
        print("   ✅ Ping Redis OK")
        
        # Test écriture/lecture
        test_key = "test_installation"
        await redis_client.set(test_key, "ok", ex=10)
        result = await redis_client.get(test_key)
        
        if result == "ok":
            print("   ✅ Écriture/Lecture Redis OK")
        else:
            print("   ❌ Problème écriture/lecture Redis")
            
        await redis_client.delete(test_key)
        await redis_client.aclose()
        
        return True
        
    except Exception as e:
        print(f"   ❌ Erreur Redis: {e}")
        return False


async def test_database_connection():
    """Test de connexion PostgreSQL"""
    print("\n🧪 Test 3: Connexion PostgreSQL")
    
    try:
        from database import get_db_manager
        from sqlalchemy.sql import text
        
        db_manager = get_db_manager()
        await db_manager.initialize()
        
        # Health check
        health = await db_manager.health_check()
        if health["status"] == "healthy":
            print("   ✅ Health check PostgreSQL OK")
            print(f"   ✅ Version: {health['version'][:50]}...")
        else:
            print(f"   ❌ Health check failed: {health}")
            return False
        
        # Test requête simple
        async with db_manager.get_session() as session:
            result = await session.execute(text("SELECT NOW() as current_time"))
            db_time = result.scalar()
            print(f"   ✅ Requête test OK - Heure DB: {db_time}")
        
        # Statistiques de connexion
        stats = await db_manager.get_connection_stats()
        print(f"   ✅ Statistiques connexion: {stats}")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Erreur PostgreSQL: {e}")
        return False


async def test_models():
    """Test des modèles SQLAlchemy"""
    print("\n🧪 Test 4: Modèles SQLAlchemy")
    
    try:
        # Import de tous les modèles
        from models import (
            Client, ClientUser, ClientConfig,
            BatteryType, Location, Battery, CustomField,
            BMSData, BMSDataHistory, Alert, MaintenanceLog,
            User, Role, Permission
        )
        
        print("   ✅ Import des modèles OK")
        
        # Test création des tables
        from database import get_db_manager
        from models import Base
        
        db_manager = get_db_manager()
        if not db_manager.engine:
            await db_manager.initialize()
        
        # Création des tables (si elles n'existent pas)
        async with db_manager.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        print("   ✅ Création/vérification tables OK")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Erreur modèles: {e}")
        return False


async def test_api_startup():
    """Test de démarrage de l'API"""
    print("\n🧪 Test 5: Démarrage API FastAPI")
    
    try:
        from main import create_app
        
        app = create_app()
        print("   ✅ Création application FastAPI OK")
        
        # Test des routes
        routes = [str(route.path) for route in app.routes]
        expected_routes = ["/", "/api/v1/health", "/api/v1/auth/login"]
        
        for expected in expected_routes:
            if any(expected in route for route in routes):
                print(f"   ✅ Route {expected} trouvée")
            else:
                print(f"   ⚠️ Route {expected} non trouvée")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Erreur API: {e}")
        return False


async def test_websocket_manager():
    """Test du gestionnaire WebSocket"""
    print("\n🧪 Test 6: WebSocket Manager")
    
    try:
        from websocket_manager import WebSocketManager, ConnectionManager
        import redis.asyncio as redis
        from config import get_settings
        
        settings = get_settings()
        redis_client = redis.from_url(settings.REDIS_URL)
        
        # Test création gestionnaire
        ws_manager = WebSocketManager(redis_client)
        print("   ✅ Création WebSocketManager OK")
        
        # Test connection manager
        conn_manager = ConnectionManager()
        stats = conn_manager.get_stats()
        print(f"   ✅ ConnectionManager stats: {stats}")
        
        await redis_client.aclose()
        return True
        
    except Exception as e:
        print(f"   ❌ Erreur WebSocket: {e}")
        return False


async def run_all_tests():
    """Exécute tous les tests"""
    print("🔬 TESTS D'INSTALLATION - modEdsDatabase")
    print("=" * 50)
    
    tests = [
        test_configuration,
        test_redis_connection,
        test_database_connection,
        test_models,
        test_api_startup,
        test_websocket_manager
    ]
    
    results = []
    
    for test in tests:
        try:
            result = await test()
            results.append(result)
        except Exception as e:
            print(f"   💥 Exception dans {test.__name__}: {e}")
            results.append(False)
    
    # Résumé
    print("\n" + "=" * 50)
    print("📊 RÉSUMÉ DES TESTS")
    
    passed = sum(results)
    total = len(results)
    
    print(f"✅ Tests passés: {passed}/{total}")
    
    if passed == total:
        print("🎉 TOUS LES TESTS SONT PASSÉS!")
        print("🚀 modEdsDatabase est prêt à être utilisé!")
        return True
    else:
        print(f"⚠️ {total - passed} tests ont échoué")
        print("🔧 Vérifiez la configuration et les dépendances")
        return False


def main():
    """Point d'entrée principal"""
    print(f"🕐 Démarrage des tests - {datetime.now()}")
    
    try:
        success = asyncio.run(run_all_tests())
        sys.exit(0 if success else 1)
        
    except KeyboardInterrupt:
        print("\n⏹️ Tests interrompus par l'utilisateur")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Erreur fatale: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()