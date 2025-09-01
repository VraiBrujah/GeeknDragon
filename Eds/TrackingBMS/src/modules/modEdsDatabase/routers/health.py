"""
Endpoints de monitoring et santé du système
Health checks, métriques, et status
"""

import asyncio
import logging
import psutil
from datetime import datetime
from typing import Dict, Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel
import redis.asyncio as redis

from database import get_db_manager
from config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter()


class HealthResponse(BaseModel):
    """Réponse standard pour health check"""
    status: str
    timestamp: datetime
    version: str
    uptime_seconds: float
    components: Dict[str, Dict[str, Any]]


class SystemMetrics(BaseModel):
    """Métriques système"""
    cpu_percent: float
    memory_percent: float
    memory_used_mb: float
    memory_available_mb: float
    disk_percent: float
    disk_free_gb: float


# Variables globales pour tracking
_start_time = datetime.utcnow()
_health_cache = {}
_cache_ttl = 30  # Cache pendant 30 secondes


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Endpoint principal de health check
    Vérifie tous les composants critiques
    """
    current_time = datetime.utcnow()
    uptime = (current_time - _start_time).total_seconds()
    settings = get_settings()
    
    # Cache simple pour éviter de surcharger les vérifications
    cache_key = "health_check"
    if (cache_key in _health_cache and 
        (current_time.timestamp() - _health_cache[cache_key]["timestamp"]) < _cache_ttl):
        cached_response = _health_cache[cache_key]["data"]
        cached_response.uptime_seconds = uptime
        return cached_response
    
    components = {}
    overall_status = "healthy"
    
    # 1. PostgreSQL Health
    try:
        db_manager = get_db_manager()
        db_health = await db_manager.health_check()
        components["postgresql"] = db_health
        
        if db_health["status"] != "healthy":
            overall_status = "degraded"
            
    except Exception as e:
        components["postgresql"] = {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": current_time.isoformat()
        }
        overall_status = "unhealthy"
    
    # 2. Redis Health
    try:
        redis_client = redis.from_url(settings.REDIS_URL, socket_connect_timeout=5)
        await redis_client.ping()
        redis_info = await redis_client.info()
        
        components["redis"] = {
            "status": "healthy",
            "version": redis_info.get("redis_version", "unknown"),
            "memory_used_mb": round(redis_info.get("used_memory", 0) / 1024 / 1024, 2),
            "connected_clients": redis_info.get("connected_clients", 0),
            "uptime_seconds": redis_info.get("uptime_in_seconds", 0)
        }
        
        await redis_client.aclose()
        
    except Exception as e:
        components["redis"] = {
            "status": "unhealthy",
            "error": str(e)
        }
        overall_status = "degraded" if overall_status == "healthy" else overall_status
    
    # 3. System Resources
    try:
        components["system"] = await get_system_metrics()
        
        # Alertes si ressources critiques
        sys_metrics = components["system"]
        if (sys_metrics["cpu_percent"] > 90 or 
            sys_metrics["memory_percent"] > 90 or
            sys_metrics["disk_percent"] > 95):
            overall_status = "degraded" if overall_status == "healthy" else overall_status
            
    except Exception as e:
        components["system"] = {
            "status": "unknown",
            "error": str(e)
        }
    
    # Construction de la réponse
    response = HealthResponse(
        status=overall_status,
        timestamp=current_time,
        version=settings.VERSION,
        uptime_seconds=uptime,
        components=components
    )
    
    # Cache de la réponse
    _health_cache[cache_key] = {
        "data": response,
        "timestamp": current_time.timestamp()
    }
    
    return response


@router.get("/health/quick")
async def quick_health():
    """
    Health check rapide sans vérifications approfondies
    Pour load balancers avec timeout court
    """
    return {
        "status": "ok",
        "timestamp": datetime.utcnow(),
        "uptime_seconds": (datetime.utcnow() - _start_time).total_seconds()
    }


@router.get("/health/database")
async def database_health():
    """
    Health check spécifique à la base de données
    Détails sur les connexions et performances
    """
    try:
        db_manager = get_db_manager()
        
        # Health check détaillé
        health = await db_manager.health_check()
        
        # Statistiques de connexion
        conn_stats = await db_manager.get_connection_stats()
        health.update(conn_stats)
        
        return health
        
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/health/redis")
async def redis_health():
    """
    Health check spécifique à Redis
    Informations détaillées sur le cache
    """
    settings = get_settings()
    
    try:
        redis_client = redis.from_url(settings.REDIS_URL, socket_connect_timeout=5)
        
        # Test de connectivité
        await redis_client.ping()
        
        # Informations détaillées
        info = await redis_client.info()
        
        # Test d'écriture/lecture
        test_key = "health_check_test"
        await redis_client.set(test_key, "ok", ex=10)
        test_result = await redis_client.get(test_key)
        await redis_client.delete(test_key)
        
        await redis_client.aclose()
        
        return {
            "status": "healthy",
            "version": info.get("redis_version"),
            "mode": info.get("redis_mode", "standalone"),
            "memory_used_mb": round(info.get("used_memory", 0) / 1024 / 1024, 2),
            "memory_max_mb": round(info.get("maxmemory", 0) / 1024 / 1024, 2),
            "connected_clients": info.get("connected_clients", 0),
            "operations_per_sec": info.get("instantaneous_ops_per_sec", 0),
            "keyspace_hits": info.get("keyspace_hits", 0),
            "keyspace_misses": info.get("keyspace_misses", 0),
            "uptime_seconds": info.get("uptime_in_seconds", 0),
            "test_write_read": "ok" if test_result == "ok" else "failed"
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }


@router.get("/metrics", response_model=SystemMetrics)
async def system_metrics():
    """
    Métriques système détaillées
    Pour monitoring externe (Prometheus, etc.)
    """
    return await get_system_metrics()


@router.get("/status")
async def service_status():
    """
    Status général du service
    Version, configuration, et informations de base
    """
    settings = get_settings()
    
    return {
        "service": "modEdsDatabase",
        "version": settings.VERSION,
        "environment": "production" if settings.is_production else "development",
        "debug_mode": settings.DEBUG,
        "uptime_seconds": (datetime.utcnow() - _start_time).total_seconds(),
        "start_time": _start_time.isoformat(),
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
        "host": settings.HOST,
        "port": settings.PORT,
        "database_pool_size": settings.DB_POOL_SIZE,
        "redis_cache_ttl": settings.REDIS_CACHE_TTL,
        "rate_limit": {
            "requests": settings.RATE_LIMIT_REQUESTS,
            "window_seconds": settings.RATE_LIMIT_WINDOW
        }
    }


# Fonctions utilitaires

async def get_system_metrics() -> Dict[str, Any]:
    """
    Collecte les métriques système
    """
    try:
        # CPU
        cpu_percent = psutil.cpu_percent(interval=1)
        
        # Mémoire
        memory = psutil.virtual_memory()
        memory_used_mb = round(memory.used / 1024 / 1024, 2)
        memory_available_mb = round(memory.available / 1024 / 1024, 2)
        
        # Disque
        disk = psutil.disk_usage('/')
        disk_free_gb = round(disk.free / 1024 / 1024 / 1024, 2)
        
        return {
            "status": "healthy",
            "cpu_percent": round(cpu_percent, 2),
            "memory_percent": round(memory.percent, 2),
            "memory_used_mb": memory_used_mb,
            "memory_available_mb": memory_available_mb,
            "disk_percent": round(disk.percent, 2),
            "disk_free_gb": disk_free_gb,
            "load_average": list(psutil.getloadavg()) if hasattr(psutil, 'getloadavg') else None,
            "boot_time": datetime.fromtimestamp(psutil.boot_time()).isoformat()
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }


import sys