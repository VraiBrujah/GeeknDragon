"""
Gestionnaire de connexion PostgreSQL avec pgBouncer
Architecture multi-tenant avec Row-Level Security
"""

import logging
from typing import AsyncGenerator, Optional, Dict, Any
from contextlib import asynccontextmanager
from functools import lru_cache

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, AsyncEngine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from sqlalchemy.sql import text
from sqlalchemy import event

from config import get_settings, get_database_config

logger = logging.getLogger(__name__)


class DatabaseManager:
    """
    Gestionnaire centralisé des connexions PostgreSQL
    Support multi-tenant avec pgBouncer
    """
    
    def __init__(self):
        self.engine: Optional[AsyncEngine] = None
        self.session_factory: Optional[sessionmaker] = None
        self._connection_stats = {
            "total_connections": 0,
            "active_connections": 0,
            "failed_connections": 0,
        }
    
    async def initialize(self):
        """Initialise le gestionnaire de base de données"""
        settings = get_settings()
        db_config = get_database_config()
        
        logger.info(f"🔧 Initialisation PostgreSQL: {settings.DATABASE_URL.split('@')[1]}")
        
        # Configuration moteur avec pgBouncer
        engine_config = {
            "url": settings.DATABASE_URL,
            "echo": settings.DEBUG,  # Log SQL en mode debug
            "echo_pool": settings.DEBUG,
            "future": True,  # SQLAlchemy 2.0 style
            **db_config
        }
        
        # Optimisations pour pgBouncer (session pooling)
        if "pgbouncer" in settings.DATABASE_URL.lower():
            logger.info("📡 Configuration pgBouncer détectée")
            engine_config.update({
                "poolclass": NullPool,  # Pas de pool côté client avec pgBouncer
                "pool_pre_ping": False,  # pgBouncer gère les connexions mortes
                "connect_args": {
                    "command_timeout": 60,
                    "server_settings": {
                        "application_name": "TrackingBMS_modEdsDatabase",
                        "jit": "off"  # Optimisation pour pgBouncer
                    }
                }
            })
        
        # Création moteur
        self.engine = create_async_engine(**engine_config)
        
        # Factory de sessions
        self.session_factory = sessionmaker(
            bind=self.engine,
            class_=AsyncSession,
            expire_on_commit=False,  # Éviter les requêtes après commit
            autoflush=False,  # Contrôle manuel du flush
        )
        
        # Événements de monitoring
        self._setup_engine_events()
        
        # Test de connexion
        await self.health_check()
        
        logger.info("✅ DatabaseManager initialisé avec succès")
    
    def _setup_engine_events(self):
        """Configure les événements de monitoring du moteur"""
        
        @event.listens_for(self.engine.sync_engine, "connect")
        def on_connect(dbapi_connection, connection_record):
            self._connection_stats["total_connections"] += 1
            self._connection_stats["active_connections"] += 1
            logger.debug(f"📊 Nouvelle connexion PostgreSQL (total: {self._connection_stats['total_connections']})")
        
        @event.listens_for(self.engine.sync_engine, "close")
        def on_close(dbapi_connection, connection_record):
            self._connection_stats["active_connections"] -= 1
            logger.debug(f"📊 Connexion PostgreSQL fermée (actives: {self._connection_stats['active_connections']})")
        
        @event.listens_for(self.engine.sync_engine, "handle_error")
        def on_error(exception_context):
            self._connection_stats["failed_connections"] += 1
            logger.error(f"❌ Erreur connexion PostgreSQL: {exception_context.original_exception}")
    
    @asynccontextmanager
    async def get_session(self, client_id: Optional[str] = None) -> AsyncGenerator[AsyncSession, None]:
        """
        Context manager pour obtenir une session avec support RLS
        
        Args:
            client_id: ID du client pour Row-Level Security (optionnel)
        """
        if not self.session_factory:
            raise RuntimeError("DatabaseManager non initialisé")
        
        session = self.session_factory()
        
        try:
            # Configuration Row-Level Security si client_id fourni
            if client_id:
                await session.execute(
                    text("SELECT set_config('app.current_client_id', :client_id, true)"),
                    {"client_id": client_id}
                )
                logger.debug(f"🔒 RLS activé pour client: {client_id}")
            
            yield session
            
            # Commit automatique si pas d'erreur
            await session.commit()
            
        except Exception as e:
            # Rollback en cas d'erreur
            await session.rollback()
            logger.error(f"❌ Erreur session DB: {e}")
            raise
        
        finally:
            await session.close()
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Vérification de santé de la base de données
        
        Returns:
            Dictionnaire avec les informations de santé
        """
        try:
            async with self.get_session() as session:
                # Test de connexion simple
                result = await session.execute(text("SELECT 1 as health_check"))
                health_check = result.scalar()
                
                # Informations de version
                result = await session.execute(text("SELECT version()"))
                version = result.scalar()
                
                # Statistiques de connexion pgBouncer (si disponible)
                pgbouncer_stats = await self._get_pgbouncer_stats(session)
                
                return {
                    "status": "healthy" if health_check == 1 else "unhealthy",
                    "version": version,
                    "connection_stats": self._connection_stats,
                    "pgbouncer_stats": pgbouncer_stats,
                    "timestamp": str(asyncio.get_event_loop().time())
                }
                
        except Exception as e:
            logger.error(f"❌ Health check failed: {e}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "connection_stats": self._connection_stats,
                "timestamp": str(asyncio.get_event_loop().time())
            }
    
    async def _get_pgbouncer_stats(self, session: AsyncSession) -> Optional[Dict[str, Any]]:
        """
        Récupère les statistiques pgBouncer si disponible
        """
        try:
            # Tentative de récupération des stats pgBouncer
            result = await session.execute(text("SHOW STATS"))
            stats = result.fetchall()
            
            if stats:
                return {
                    "database_count": len(stats),
                    "total_requests": sum(row[2] for row in stats if len(row) > 2),
                    "active_clients": sum(row[3] for row in stats if len(row) > 3),
                }
                
        except Exception:
            # pgBouncer stats non disponibles (connexion directe PostgreSQL)
            pass
        
        return None
    
    async def get_connection_stats(self) -> Dict[str, Any]:
        """Retourne les statistiques de connexion"""
        pool_status = {}
        
        if self.engine and hasattr(self.engine.pool, 'status'):
            pool = self.engine.pool
            pool_status = {
                "pool_size": getattr(pool, 'size', 0),
                "checked_in": getattr(pool, 'checkedin', 0),
                "checked_out": getattr(pool, 'checkedout', 0),
                "overflow": getattr(pool, 'overflow', 0),
                "invalid": getattr(pool, 'invalid', 0),
            }
        
        return {
            **self._connection_stats,
            "pool_status": pool_status
        }
    
    async def execute_raw_sql(self, query: str, params: Optional[Dict] = None) -> Any:
        """
        Exécute une requête SQL brute
        Utilisé pour les opérations d'administration
        """
        async with self.get_session() as session:
            result = await session.execute(text(query), params or {})
            return result.fetchall()
    
    async def close(self):
        """Ferme toutes les connexions"""
        if self.engine:
            await self.engine.dispose()
            logger.info("🔌 Connexions PostgreSQL fermées")


# Singleton global
_db_manager: Optional[DatabaseManager] = None


@lru_cache()
def get_db_manager() -> DatabaseManager:
    """
    Récupère l'instance singleton du gestionnaire de base de données
    """
    global _db_manager
    if _db_manager is None:
        _db_manager = DatabaseManager()
    return _db_manager


async def get_db_session(client_id: Optional[str] = None) -> AsyncGenerator[AsyncSession, None]:
    """
    Dépendance FastAPI pour obtenir une session de base de données
    
    Args:
        client_id: ID du client pour RLS (sera injecté par middleware)
    """
    db_manager = get_db_manager()
    
    if not db_manager.engine:
        await db_manager.initialize()
    
    async with db_manager.get_session(client_id) as session:
        yield session


# Utilitaires pour les migrations et l'initialisation

async def create_database_schema():
    """
    Crée le schéma de base de données complet
    Utilisé lors de l'initialisation
    """
    from models import Base
    
    db_manager = get_db_manager()
    
    if not db_manager.engine:
        await db_manager.initialize()
    
    # Création des tables
    async with db_manager.engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    logger.info("✅ Schéma de base de données créé")


async def enable_row_level_security():
    """
    Active Row-Level Security sur les tables multi-tenant
    """
    db_manager = get_db_manager()
    
    # Tables nécessitant RLS
    rls_tables = [
        "battery_types", "locations", "batteries", "custom_fields",
        "bms_data", "bms_data_history", "alerts", "maintenance_logs"
    ]
    
    rls_policies = []
    
    for table in rls_tables:
        # Politique RLS pour isolation par client_id
        policy_sql = f"""
        ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS tenant_isolation ON {table};
        
        CREATE POLICY tenant_isolation ON {table}
        FOR ALL
        TO public
        USING (client_id = current_setting('app.current_client_id')::uuid);
        """
        rls_policies.append(policy_sql)
    
    # Application des politiques
    async with db_manager.get_session() as session:
        for policy_sql in rls_policies:
            await session.execute(text(policy_sql))
    
    logger.info("✅ Row-Level Security activé")


async def create_indexes():
    """
    Crée les index de performance supplémentaires
    """
    db_manager = get_db_manager()
    
    performance_indexes = [
        # Index partiels pour données actives seulement
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_batteries_active ON batteries (client_id, location_id) WHERE is_deleted = false;",
        
        # Index pour données BMS récentes (30 derniers jours)
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bms_data_recent ON bms_data (battery_id, measurement_timestamp) WHERE measurement_timestamp > (CURRENT_DATE - INTERVAL '30 days');",
        
        # Index pour alertes actives
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_alerts_active ON alerts (client_id, battery_id, severity) WHERE status = 'active';",
        
        # Index de recherche textuelle
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_batteries_search ON batteries USING gin(to_tsvector('french', name || ' ' || COALESCE(serial_number, '')));",
    ]
    
    async with db_manager.get_session() as session:
        for index_sql in performance_indexes:
            try:
                await session.execute(text(index_sql))
                logger.info(f"✅ Index créé: {index_sql.split()[5]}")
            except Exception as e:
                logger.warning(f"⚠️ Index déjà existant ou erreur: {e}")
    
    logger.info("✅ Index de performance créés")


# Fonction d'initialisation complète
async def init_database(engine: AsyncEngine):
    """
    Initialisation complète de la base de données
    Appelée au démarrage de l'application
    """
    logger.info("🚀 Initialisation complète de la base de données")
    
    # 1. Création du schéma
    await create_database_schema()
    
    # 2. Activation RLS
    await enable_row_level_security()
    
    # 3. Création des index de performance
    await create_indexes()
    
    # 4. Données initiales (rôles, permissions)
    await create_initial_data()
    
    logger.info("✅ Base de données complètement initialisée")


async def create_initial_data():
    """
    Crée les données initiales (permissions, rôles)
    """
    from models.auth import Permission, Role, DEFAULT_PERMISSIONS, DEFAULT_ROLES
    
    db_manager = get_db_manager()
    
    async with db_manager.get_session() as session:
        # Création des permissions
        for perm_data in DEFAULT_PERMISSIONS:
            # Vérifier si la permission existe déjà
            result = await session.execute(
                text("SELECT id FROM permissions WHERE slug = :slug"),
                {"slug": perm_data["slug"]}
            )
            
            if not result.scalar():
                permission = Permission(**perm_data)
                session.add(permission)
        
        # Création des rôles
        for role_data in DEFAULT_ROLES:
            # Vérifier si le rôle existe déjà
            result = await session.execute(
                text("SELECT id FROM roles WHERE slug = :slug"),
                {"slug": role_data["slug"]}
            )
            
            if not result.scalar():
                role_dict = {k: v for k, v in role_data.items() if k != "permissions"}
                role = Role(**role_dict)
                session.add(role)
        
        await session.commit()
    
    logger.info("✅ Données initiales créées")