"""
Test simple pour vérifier les imports de base
"""

import sys
import os
from pathlib import Path

# Fix encoding pour Windows
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Ajouter le répertoire src au path
sys.path.insert(0, str(Path(__file__).parent))

def test_basic_imports():
    """Test des imports de base"""
    try:
        print("🧪 Test imports SQLAlchemy...")
        from sqlalchemy import Column, Integer, String, DateTime, Boolean
        from sqlalchemy.ext.declarative import declarative_base
        print("✅ SQLAlchemy imports OK")
        
        print("🧪 Test imports Pydantic...")
        from pydantic import BaseModel, Field
        from pydantic_settings import BaseSettings
        print("✅ Pydantic imports OK")
        
        print("🧪 Test imports FastAPI...")
        from fastapi import FastAPI, HTTPException
        print("✅ FastAPI imports OK")
        
        print("🧪 Test config...")
        from config import Settings, get_settings
        settings = get_settings()
        print(f"✅ Config OK - App: {settings.APP_NAME}")
        
        print("🧪 Test models base...")
        from models.base import Base, BaseEntity
        print("✅ Base models OK")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_simple_sqlite():
    """Test avec SQLite simple"""
    try:
        print("🧪 Test SQLite simple...")
        
        from sqlalchemy import create_engine, Column, Integer, String
        from sqlalchemy.ext.declarative import declarative_base
        from sqlalchemy.orm import sessionmaker
        
        # Créer une base simple
        Base = declarative_base()
        
        class TestTable(Base):
            __tablename__ = 'test'
            id = Column(Integer, primary_key=True)
            name = Column(String(50))
        
        # Créer engine SQLite en mémoire
        engine = create_engine("sqlite:///:memory:", echo=False)
        Base.metadata.create_all(engine)
        
        # Test session
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # Insérer un test
        test_item = TestTable(name="test_item")
        session.add(test_item)
        session.commit()
        
        # Récupérer
        result = session.query(TestTable).first()
        if result and result.name == "test_item":
            print("✅ SQLite test OK")
            return True
        else:
            print("❌ SQLite test failed")
            return False
            
    except Exception as e:
        print(f"❌ Erreur SQLite: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 Tests simples module EDS Database")
    print("=" * 50)
    
    success1 = test_basic_imports()
    print("-" * 30)
    success2 = test_simple_sqlite()
    
    print("=" * 50)
    if success1 and success2:
        print("🎉 Tous les tests simples réussis!")
        sys.exit(0)
    else:
        print("⚠️ Certains tests ont échoué")
        sys.exit(1)