"""
Configuration centralisée pour modEdsDatabase
Gestion des variables d'environnement et paramètres
"""

import os
from functools import lru_cache
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configuration de l'application"""
    
    # Application
    APP_NAME: str = "modEdsDatabase"
    VERSION: str = "1.0.0"
    DEBUG: bool = Field(default=False, env="DEBUG")
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")
    
    # Base de données PostgreSQL (via pgBouncer)
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://trackingbms:password@localhost:6432/trackingbms_core",
        env="DATABASE_URL"
    )
    DB_POOL_SIZE: int = Field(default=20, env="DB_POOL_SIZE")
    DB_MAX_OVERFLOW: int = Field(default=30, env="DB_MAX_OVERFLOW")
    DB_POOL_TIMEOUT: int = Field(default=30, env="DB_POOL_TIMEOUT")
    DB_POOL_RECYCLE: int = Field(default=3600, env="DB_POOL_RECYCLE")  # 1h
    
    # Redis
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        env="REDIS_URL"
    )
    REDIS_CACHE_TTL: int = Field(default=300, env="REDIS_CACHE_TTL")  # 5min
    
    # Sécurité
    SECRET_KEY: str = Field(
        default="your-super-secret-key-change-in-production",
        env="SECRET_KEY"
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    ALGORITHM: str = "HS256"
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = Field(default=1000, env="RATE_LIMIT_REQUESTS")
    RATE_LIMIT_WINDOW: int = Field(default=3600, env="RATE_LIMIT_WINDOW")  # 1h
    
    # CORS
    ALLOWED_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:8080"],
        env="ALLOWED_ORIGINS"
    )
    
    # WebSocket
    WS_MAX_CONNECTIONS: int = Field(default=1000, env="WS_MAX_CONNECTIONS")
    WS_HEARTBEAT_INTERVAL: int = Field(default=30, env="WS_HEARTBEAT_INTERVAL")
    
    # BMS Data Collection
    BMS_COLLECTION_INTERVAL: int = Field(default=5, env="BMS_COLLECTION_INTERVAL")  # secondes
    BMS_BATCH_SIZE: int = Field(default=100, env="BMS_BATCH_SIZE")
    BMS_RETENTION_DAYS: int = Field(default=365, env="BMS_RETENTION_DAYS")
    
    # Monitoring
    HEALTH_CHECK_INTERVAL: int = Field(default=30, env="HEALTH_CHECK_INTERVAL")
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    
    # HostPapa Production Settings
    HOSTPAPA_MODE: bool = Field(default=False, env="HOSTPAPA_MODE")
    MAX_MEMORY_MB: int = Field(default=512, env="MAX_MEMORY_MB")  # Limite HostPapa
    MAX_CPU_PERCENT: int = Field(default=80, env="MAX_CPU_PERCENT")
    
    @field_validator("ALLOWED_ORIGINS", mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS origins from string or list"""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    @field_validator("DATABASE_URL")
    @classmethod
    def validate_database_url(cls, v):
        """Validation de l'URL de base de données"""
        if not v.startswith(("postgresql://", "postgresql+asyncpg://", "sqlite://", "sqlite+aiosqlite://")):
            raise ValueError("DATABASE_URL doit être PostgreSQL ou SQLite")
        return v
    
    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v):
        """Validation de la clé secrète"""
        if len(v) < 32:
            raise ValueError("SECRET_KEY doit faire au moins 32 caractères")
        return v
    
    @property
    def database_url_sync(self) -> str:
        """URL de base de données pour connexions synchrones (migrations)"""
        return self.DATABASE_URL.replace("+asyncpg", "")
    
    @property
    def is_production(self) -> bool:
        """Détection environnement production"""
        return self.HOSTPAPA_MODE or not self.DEBUG
    
    @property
    def cache_key_prefix(self) -> str:
        """Préfixe pour les clés Redis"""
        return f"{self.APP_NAME}:{self.VERSION}"
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore"
    }


@lru_cache()
def get_settings() -> Settings:
    """
    Singleton pour la configuration
    Cache la configuration pour éviter de la recharger à chaque appel
    """
    return Settings()


def get_database_config() -> dict:
    """Configuration spécifique pour SQLAlchemy"""
    settings = get_settings()
    
    config = {
        "pool_size": settings.DB_POOL_SIZE,
        "max_overflow": settings.DB_MAX_OVERFLOW,
        "pool_timeout": settings.DB_POOL_TIMEOUT,
        "pool_recycle": settings.DB_POOL_RECYCLE,
        "pool_pre_ping": True,  # Vérification santé des connexions
        "echo": settings.DEBUG,  # Log SQL en debug
        "future": True,  # Utiliser SQLAlchemy 2.0 style
    }
    
    # Optimisations pour HostPapa
    if settings.HOSTPAPA_MODE:
        config.update({
            "pool_size": 10,  # Réduit pour HostPapa
            "max_overflow": 15,
            "pool_timeout": 60,
        })
    
    return config


def get_redis_config() -> dict:
    """Configuration spécifique pour Redis"""
    settings = get_settings()
    
    return {
        "socket_connect_timeout": 5,
        "socket_keepalive": True,
        "socket_keepalive_options": {},
        "health_check_interval": 30,
        "retry_on_timeout": True,
        "encoding": "utf-8",
        "decode_responses": True,
    }


# Configuration par environnement
ENVIRONMENT_CONFIGS = {
    "development": {
        "DEBUG": True,
        "LOG_LEVEL": "DEBUG",
        "DB_POOL_SIZE": 5,
        "RATE_LIMIT_REQUESTS": 10000,
    },
    "testing": {
        "DEBUG": False,
        "DATABASE_URL": "postgresql+asyncpg://test:test@localhost:5432/trackingbms_test",
        "REDIS_URL": "redis://localhost:6379/1",
        "LOG_LEVEL": "WARNING",
    },
    "production": {
        "DEBUG": False,
        "LOG_LEVEL": "INFO",
        "HOSTPAPA_MODE": True,
        "DB_POOL_SIZE": 10,
        "MAX_MEMORY_MB": 256,
    }
}