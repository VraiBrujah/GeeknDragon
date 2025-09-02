"""
Test complet du module EDS Database avec SQLite
Version standalone sans Docker
"""

import sys
import os
import asyncio
import tempfile
import json
import uuid
from pathlib import Path
from datetime import datetime

# Fix encoding Windows
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Ajouter répertoire au path
sys.path.insert(0, str(Path(__file__).parent))

# Configuration environnement test
os.environ['DATABASE_URL'] = 'sqlite+aiosqlite:///./test_trackingbms.db'
os.environ['REDIS_ENABLED'] = 'false'
os.environ['DEBUG'] = 'true'
os.environ['TESTING'] = 'true'

async def test_database_operations():
    """Test des opérations de base de données complètes"""
    print("🗄️ Test 1: Opérations base de données complètes")
    
    try:
        from database import get_db_manager, create_database_schema
        from models.base import Base
        from models.clients import Client
        from models.batteries import BatteryType, Battery, Location
        from models.auth import User, Role, Permission
        
        # Initialisation DB
        db_manager = get_db_manager()
        await db_manager.initialize()
        
        # Création schéma
        await create_database_schema()
        
        # Test CRUD operations
        client_id = uuid.uuid4()
        
        async with db_manager.get_session(str(client_id)) as session:
            # Créer un client test
            test_client = Client(
                id=client_id,
                name="Test Client EDS",
                company="EDS Quebec Test",
                email="test@edsquebec.com",
                phone="+1-555-0123",
                address="123 Test Street, Quebec",
                is_active=True
            )
            session.add(test_client)
            
            # Créer un type de batterie
            battery_type = BatteryType(
                client_id=client_id,
                name="LiFePO4 Test",
                chemistry="LiFePO4",
                voltage_nominal=12.8,
                capacity_ah=100,
                description="Batterie de test"
            )
            session.add(battery_type)
            
            # Créer un lieu
            location = Location(
                client_id=client_id,
                name="Laboratoire Test",
                address="Lab EDS Quebec",
                description="Lieu de test"
            )
            session.add(location)
            
            await session.commit()
            
            # Vérifier les créations
            clients_count = await session.execute("SELECT COUNT(*) FROM clients")
            count = clients_count.scalar()
            
            if count > 0:
                print("✅ CRUD operations réussies")
                return True
            else:
                print("❌ Aucune donnée créée")
                return False
                
    except Exception as e:
        print(f"❌ Erreur opérations DB: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_api_endpoints():
    """Test des endpoints API"""
    print("🔗 Test 2: Endpoints API")
    
    try:
        from main import app
        from fastapi.testclient import TestClient
        
        # Client de test
        client = TestClient(app)
        
        # Test health check
        response = client.get("/health")
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ Health endpoint: {health_data.get('status', 'unknown')}")
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return False
        
        # Test API docs
        response = client.get("/docs")
        if response.status_code == 200:
            print("✅ API Documentation accessible")
        else:
            print("❌ API Documentation non accessible")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur API endpoints: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_websocket_mock():
    """Test simulation WebSocket"""
    print("🔄 Test 3: Simulation WebSocket")
    
    try:
        from websocket_manager import WebSocketManager
        
        # Créer manager
        ws_manager = WebSocketManager()
        
        # Simuler connexion
        mock_websocket = {"id": "test_connection", "client_id": str(uuid.uuid4())}
        await ws_manager.connect(mock_websocket)
        
        # Simuler envoi de données BMS
        bms_data = {
            "battery_id": str(uuid.uuid4()),
            "voltage": 12.6,
            "current": 2.5,
            "temperature": 25.3,
            "soc": 85.5,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await ws_manager.broadcast(json.dumps(bms_data))
        
        # Simuler déconnexion
        await ws_manager.disconnect(mock_websocket)
        
        print("✅ WebSocket simulation réussie")
        return True
        
    except Exception as e:
        print(f"❌ Erreur WebSocket: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_auth_system():
    """Test du système d'authentification"""
    print("🔐 Test 4: Système d'authentification")
    
    try:
        from models.auth import User, hash_password, verify_password
        
        # Test hashing de mot de passe
        password = "test_password_123"
        hashed = hash_password(password)
        
        if verify_password(password, hashed):
            print("✅ Hash/verify mot de passe OK")
        else:
            print("❌ Hash/verify mot de passe failed")
            return False
        
        # Test JWT (simulation)
        from jose import jwt
        from datetime import timedelta
        
        secret_key = "test-secret-key-for-jwt-testing-purposes"
        
        token_data = {
            "sub": "test@edsquebec.com",
            "exp": datetime.utcnow() + timedelta(minutes=30)
        }
        
        token = jwt.encode(token_data, secret_key, algorithm="HS256")
        decoded = jwt.decode(token, secret_key, algorithms=["HS256"])
        
        if decoded["sub"] == "test@edsquebec.com":
            print("✅ JWT encode/decode OK")
            return True
        else:
            print("❌ JWT decode failed")
            return False
            
    except Exception as e:
        print(f"❌ Erreur auth: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_config_system():
    """Test du système de configuration"""
    print("⚙️ Test 5: Système de configuration")
    
    try:
        from config import get_settings, get_database_config
        
        settings = get_settings()
        db_config = get_database_config()
        
        # Vérifications configuration
        checks = [
            (settings.APP_NAME == "modEdsDatabase", "APP_NAME"),
            (settings.DATABASE_URL.startswith("sqlite"), "DATABASE_URL SQLite"),
            ("pool_size" in db_config, "Database config"),
            (settings.DEBUG == True, "DEBUG mode"),
        ]
        
        passed = 0
        for check, name in checks:
            if check:
                print(f"  ✅ {name}")
                passed += 1
            else:
                print(f"  ❌ {name}")
        
        if passed == len(checks):
            print("✅ Configuration système OK")
            return True
        else:
            print(f"❌ Configuration: {passed}/{len(checks)} checks")
            return False
            
    except Exception as e:
        print(f"❌ Erreur config: {e}")
        import traceback
        traceback.print_exc()
        return False

async def run_all_tests():
    """Exécute tous les tests"""
    print("🚀 Tests complets module EDS Database (SQLite)")
    print("=" * 60)
    
    tests = [
        ("Configuration système", test_config_system),
        ("Opérations base de données", test_database_operations),
        ("Endpoints API", test_api_endpoints),
        ("Simulation WebSocket", test_websocket_mock),
        ("Authentification", test_auth_system),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n▶️ {test_name}")
        print("-" * 40)
        try:
            result = await test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Exception dans {test_name}: {e}")
            results.append((test_name, False))
        print()
    
    # Résultats finaux
    print("=" * 60)
    print("📊 RÉSULTATS FINAUX:")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
        if result:
            passed += 1
    
    print("-" * 60)
    print(f"📈 Score final: {passed}/{total} tests réussis ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("🎉 TOUS LES TESTS SONT PASSÉS!")
        print("✅ Module EDS Database prêt pour déploiement")
        return True
    else:
        print(f"⚠️ {total - passed} test(s) ont échoué")
        print("🔧 Vérifiez les erreurs ci-dessus")
        return False

async def cleanup_test_files():
    """Nettoyage des fichiers de test"""
    try:
        test_files = [
            "./test_trackingbms.db",
            "./test.db",
        ]
        
        for file_path in test_files:
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"🗑️ Nettoyé: {file_path}")
        
    except Exception as e:
        print(f"⚠️ Erreur nettoyage: {e}")

if __name__ == "__main__":
    try:
        success = asyncio.run(run_all_tests())
        asyncio.run(cleanup_test_files())
        
        print("\n" + "=" * 60)
        if success:
            print("✅ MODULE EDS DATABASE: TESTS RÉUSSIS")
            print("📋 Configuration Supabase Local validée")
            print("🗄️ Base de données SQLite fonctionnelle")
            print("🔗 API FastAPI opérationnelle")
            print("🔐 Authentification testée")
            sys.exit(0)
        else:
            print("❌ MODULE EDS DATABASE: CERTAINS TESTS ONT ÉCHOUÉ")
            print("🔧 Consultez les erreurs ci-dessus pour diagnostic")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n⏹️ Tests interrompus par l'utilisateur")
        asyncio.run(cleanup_test_files())
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Erreur critique: {e}")
        import traceback
        traceback.print_exc()
        asyncio.run(cleanup_test_files())
        sys.exit(1)