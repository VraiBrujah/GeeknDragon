"""
Middleware personnalisés pour FastAPI
Gestion multi-tenant, rate limiting, et sécurité
"""

import time
import logging
from typing import Callable, Dict, Any
from uuid import UUID

from fastapi import Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import redis.asyncio as redis

from config import get_settings

logger = logging.getLogger(__name__)


class TenantMiddleware(BaseHTTPMiddleware):
    """
    Middleware pour extraction et validation du tenant (client)
    Injecte le client_id dans le contexte de la requête
    """
    
    async def dispatch(self, request: Request, call_next: Callable):
        # Récupération du client_id depuis différentes sources
        client_id = None
        
        # 1. Header X-Client-ID (API calls)
        if "x-client-id" in request.headers:
            try:
                client_id = str(UUID(request.headers["x-client-id"]))
            except ValueError:
                return JSONResponse(
                    status_code=400,
                    content={"error": "Invalid client ID format"}
                )
        
        # 2. Query parameter client_id
        elif "client_id" in request.query_params:
            try:
                client_id = str(UUID(request.query_params["client_id"]))
            except ValueError:
                return JSONResponse(
                    status_code=400,
                    content={"error": "Invalid client ID format"}
                )
        
        # 3. JWT token (à implémenter avec l'auth)
        # elif "authorization" in request.headers:
        #     client_id = extract_client_from_token(request.headers["authorization"])
        
        # Injection dans le state de la requête
        request.state.client_id = client_id
        
        # Log pour debug
        if client_id:
            logger.debug(f"🏢 Request pour client: {client_id}")
        
        response = await call_next(request)
        
        # Ajout du client_id dans les headers de réponse pour traçabilité
        if client_id:
            response.headers["x-processed-client"] = client_id
        
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Middleware de limitation du taux de requêtes
    Utilise Redis pour le comptage distribué
    """
    
    def __init__(self, app):
        super().__init__(app)
        self.settings = get_settings()
        self.redis_client = None
    
    async def get_redis(self):
        """Obtient une connexion Redis lazy"""
        if not self.redis_client:
            self.redis_client = redis.from_url(
                self.settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True
            )
        return self.redis_client
    
    async def dispatch(self, request: Request, call_next: Callable):
        # Skip rate limiting pour certains endpoints
        if request.url.path in ["/", "/health", "/api/v1/health"]:
            return await call_next(request)
        
        # Identifier l'utilisateur/client pour rate limiting
        identifier = self._get_rate_limit_identifier(request)
        
        # Vérifier les limites
        try:
            if not await self._check_rate_limit(identifier):
                return JSONResponse(
                    status_code=429,
                    content={
                        "error": "Rate limit exceeded",
                        "retry_after": self.settings.RATE_LIMIT_WINDOW
                    },
                    headers={"Retry-After": str(self.settings.RATE_LIMIT_WINDOW)}
                )
        except Exception as e:
            # En cas d'erreur Redis, on laisse passer (fail open)
            logger.warning(f"Rate limiting error: {e}")
        
        response = await call_next(request)
        return response
    
    def _get_rate_limit_identifier(self, request: Request) -> str:
        """Détermine l'identifiant pour le rate limiting"""
        # Priorité 1: Client ID si disponible
        if hasattr(request.state, "client_id") and request.state.client_id:
            return f"client:{request.state.client_id}"
        
        # Priorité 2: IP address
        client_ip = request.client.host if request.client else "unknown"
        return f"ip:{client_ip}"
    
    async def _check_rate_limit(self, identifier: str) -> bool:
        """
        Vérifie et met à jour le rate limit
        Utilise l'algorithme sliding window
        """
        redis_client = await self.get_redis()
        
        key = f"rate_limit:{identifier}"
        window = self.settings.RATE_LIMIT_WINDOW
        limit = self.settings.RATE_LIMIT_REQUESTS
        now = int(time.time())
        
        # Pipeline Redis pour atomicité
        pipe = redis_client.pipeline()
        
        # Supprimer les entrées expirées
        pipe.zremrangebyscore(key, 0, now - window)
        
        # Compter les requêtes dans la fenêtre
        pipe.zcard(key)
        
        # Ajouter la requête actuelle
        pipe.zadd(key, {str(now): now})
        
        # Définir l'expiration
        pipe.expire(key, window)
        
        results = await pipe.execute()
        current_requests = results[1]
        
        return current_requests < limit


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware pour ajouter les headers de sécurité
    """
    
    async def dispatch(self, request: Request, call_next: Callable):
        response = await call_next(request)
        
        # Headers de sécurité standards
        security_headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
        }
        
        for header, value in security_headers.items():
            response.headers[header] = value
        
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware pour logger les requêtes
    """
    
    async def dispatch(self, request: Request, call_next: Callable):
        start_time = time.time()
        
        # Informations de la requête
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        
        response = await call_next(request)
        
        # Calcul du temps de traitement
        process_time = time.time() - start_time
        
        # Log de la requête
        log_data = {
            "method": request.method,
            "url": str(request.url),
            "status_code": response.status_code,
            "process_time": round(process_time, 3),
            "client_ip": client_ip,
            "user_agent": user_agent[:100],  # Limiter la taille
        }
        
        # Ajouter client_id si disponible
        if hasattr(request.state, "client_id") and request.state.client_id:
            log_data["client_id"] = request.state.client_id
        
        # Log selon le niveau approprié
        if response.status_code >= 500:
            logger.error(f"Request error: {log_data}")
        elif response.status_code >= 400:
            logger.warning(f"Request warning: {log_data}")
        else:
            logger.info(f"Request: {request.method} {request.url.path} -> {response.status_code} ({process_time:.3f}s)")
        
        # Ajouter headers de performance
        response.headers["X-Process-Time"] = str(process_time)
        
        return response


class DatabaseHealthMiddleware(BaseHTTPMiddleware):
    """
    Middleware pour vérifier la santé de la base de données
    Rejette les requêtes si la DB n'est pas disponible
    """
    
    def __init__(self, app):
        super().__init__(app)
        self._db_healthy = True
        self._last_check = 0
        self._check_interval = 30  # Vérifier toutes les 30 secondes
    
    async def dispatch(self, request: Request, call_next: Callable):
        # Skip health check pour l'endpoint de santé
        if request.url.path in ["/", "/health", "/api/v1/health"]:
            return await call_next(request)
        
        # Vérification périodique de la DB
        current_time = time.time()
        if current_time - self._last_check > self._check_interval:
            await self._check_database_health()
            self._last_check = current_time
        
        # Rejeter si DB non saine
        if not self._db_healthy:
            return JSONResponse(
                status_code=503,
                content={
                    "error": "Database unavailable",
                    "retry_after": 60
                },
                headers={"Retry-After": "60"}
            )
        
        return await call_next(request)
    
    async def _check_database_health(self):
        """Vérifie rapidement la santé de la base de données"""
        try:
            from database import get_db_manager
            
            db_manager = get_db_manager()
            if db_manager.engine:
                # Test de connexion simple et rapide
                async with db_manager.get_session() as session:
                    await session.execute(text("SELECT 1"))
                
                self._db_healthy = True
                logger.debug("✅ Database health check passed")
            else:
                self._db_healthy = False
                
        except Exception as e:
            self._db_healthy = False
            logger.error(f"❌ Database health check failed: {e}")


# Fonction d'aide pour obtenir le client_id depuis la requête
def get_client_id_from_request(request: Request) -> str | None:
    """
    Utilitaire pour récupérer le client_id depuis une requête
    Utilisé dans les dépendances FastAPI
    """
    return getattr(request.state, "client_id", None)


# Dépendance FastAPI pour injection du client_id
async def get_current_client_id(request: Request) -> str | None:
    """
    Dépendance FastAPI pour obtenir le client_id actuel
    """
    return get_client_id_from_request(request)


# Dépendance FastAPI pour exiger un client_id
async def require_client_id(request: Request) -> str:
    """
    Dépendance FastAPI qui exige un client_id valide
    """
    client_id = get_client_id_from_request(request)
    
    if not client_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Client ID required"
        )
    
    return client_id