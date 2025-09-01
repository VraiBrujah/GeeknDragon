"""
Gestionnaire WebSocket pour communication temps réel
Architecture Redis Pub/Sub pour scalabilité multi-instance
"""

import asyncio
import json
import logging
from typing import Dict, Set, List, Any, Optional
from datetime import datetime
from uuid import uuid4

from fastapi import WebSocket, WebSocketDisconnect
import redis.asyncio as redis

logger = logging.getLogger(__name__)


class ConnectionManager:
    """
    Gestionnaire de connexions WebSocket par client
    Isolation multi-tenant des messages
    """
    
    def __init__(self):
        # Connexions actives par client_id
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Métadonnées des connexions
        self.connection_metadata: Dict[WebSocket, Dict[str, Any]] = {}
        # Compteurs de performance
        self.stats = {
            "total_connections": 0,
            "active_connections": 0,
            "messages_sent": 0,
            "messages_received": 0,
            "errors": 0
        }
    
    async def connect(self, websocket: WebSocket, client_id: str, user_id: str = None):
        """
        Ajoute une nouvelle connexion WebSocket
        """
        await websocket.accept()
        
        # Initialiser le set pour ce client si nécessaire
        if client_id not in self.active_connections:
            self.active_connections[client_id] = set()
        
        # Ajouter la connexion
        self.active_connections[client_id].add(websocket)
        
        # Métadonnées
        self.connection_metadata[websocket] = {
            "client_id": client_id,
            "user_id": user_id,
            "connected_at": datetime.utcnow(),
            "last_ping": datetime.utcnow(),
            "message_count": 0
        }
        
        # Statistiques
        self.stats["total_connections"] += 1
        self.stats["active_connections"] = len(self.connection_metadata)
        
        logger.info(f"WebSocket connected: client={client_id}, user={user_id}")
        
        # Message de bienvenue
        await self.send_to_connection(websocket, {
            "type": "connection_established",
            "client_id": client_id,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    def disconnect(self, websocket: WebSocket):
        """
        Supprime une connexion WebSocket
        """
        if websocket not in self.connection_metadata:
            return
        
        metadata = self.connection_metadata[websocket]
        client_id = metadata["client_id"]
        
        # Retirer de la liste des connexions
        if client_id in self.active_connections:
            self.active_connections[client_id].discard(websocket)
            
            # Nettoyer le set vide
            if not self.active_connections[client_id]:
                del self.active_connections[client_id]
        
        # Nettoyer les métadonnées
        del self.connection_metadata[websocket]
        
        # Statistiques
        self.stats["active_connections"] = len(self.connection_metadata)
        
        logger.info(f"WebSocket disconnected: client={client_id}")
    
    async def send_to_connection(self, websocket: WebSocket, message: dict):
        """
        Envoie un message à une connexion spécifique
        """
        try:
            await websocket.send_json(message)
            
            # Statistiques
            if websocket in self.connection_metadata:
                self.connection_metadata[websocket]["message_count"] += 1
            self.stats["messages_sent"] += 1
            
        except Exception as e:
            logger.error(f"Error sending message to WebSocket: {e}")
            self.stats["errors"] += 1
            # La connexion sera nettoyée par le gestionnaire de déconnexion
    
    async def broadcast_to_client(self, client_id: str, message: dict):
        """
        Diffuse un message à toutes les connexions d'un client
        """
        if client_id not in self.active_connections:
            return
        
        # Copie de la liste pour éviter les modifications concurrentes
        connections = list(self.active_connections[client_id])
        
        # Envoi parallèle à toutes les connexions
        tasks = []
        for websocket in connections:
            tasks.append(self.send_to_connection(websocket, message))
        
        # Exécuter toutes les tâches
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
    
    async def broadcast_to_all(self, message: dict):
        """
        Diffuse un message à toutes les connexions actives
        """
        all_connections = []
        for connections in self.active_connections.values():
            all_connections.extend(connections)
        
        tasks = []
        for websocket in all_connections:
            tasks.append(self.send_to_connection(websocket, message))
        
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
    
    def get_client_connections(self, client_id: str) -> int:
        """Nombre de connexions actives pour un client"""
        return len(self.active_connections.get(client_id, set()))
    
    def get_stats(self) -> dict:
        """Statistiques du gestionnaire"""
        return {
            **self.stats,
            "clients_connected": len(self.active_connections),
            "avg_messages_per_connection": (
                self.stats["messages_sent"] / max(self.stats["total_connections"], 1)
            )
        }


class WebSocketManager:
    """
    Gestionnaire principal WebSocket avec Redis Pub/Sub
    Permet la communication entre instances multiples
    """
    
    def __init__(self, redis_client: redis.Redis):
        self.redis_client = redis_client
        self.connection_manager = ConnectionManager()
        self.pubsub = None
        self.subscriber_task = None
        self.is_running = False
    
    async def start(self):
        """
        Démarre le gestionnaire WebSocket et les abonnements Redis
        """
        if self.is_running:
            return
        
        # Configuration Pub/Sub Redis
        self.pubsub = self.redis_client.pubsub()
        
        # Abonnement aux canaux Redis
        await self.pubsub.subscribe(
            "bms_data:*",      # Données BMS temps réel
            "alerts:*",        # Alertes
            "system:*",        # Messages système
            "client:*"         # Messages spécifiques aux clients
        )
        
        # Démarrer la tâche d'écoute Redis
        self.subscriber_task = asyncio.create_task(self._redis_subscriber())
        self.is_running = True
        
        logger.info("WebSocket Manager démarré avec Redis Pub/Sub")
    
    async def stop(self):
        """
        Arrête le gestionnaire WebSocket
        """
        if not self.is_running:
            return
        
        self.is_running = False
        
        # Arrêter l'abonnement Redis
        if self.subscriber_task:
            self.subscriber_task.cancel()
            try:
                await self.subscriber_task
            except asyncio.CancelledError:
                pass
        
        if self.pubsub:
            await self.pubsub.unsubscribe()
            await self.pubsub.aclose()
        
        logger.info("WebSocket Manager arrêté")
    
    async def _redis_subscriber(self):
        """
        Tâche d'écoute des messages Redis Pub/Sub
        """
        try:
            while self.is_running:
                message = await self.pubsub.get_message(ignore_subscribe_messages=True)
                
                if message is None:
                    await asyncio.sleep(0.1)
                    continue
                
                await self._handle_redis_message(message)
                
        except asyncio.CancelledError:
            logger.info("Redis subscriber task cancelled")
        except Exception as e:
            logger.error(f"Error in Redis subscriber: {e}")
    
    async def _handle_redis_message(self, message):
        """
        Traite les messages reçus de Redis et les diffuse via WebSocket
        """
        try:
            channel = message["channel"].decode()
            data = json.loads(message["data"].decode())
            
            # Extraction du client_id depuis le canal ou les données
            client_id = None
            
            if ":" in channel:
                parts = channel.split(":")
                if len(parts) >= 2:
                    client_id = parts[1]
            
            if "client_id" in data:
                client_id = data["client_id"]
            
            # Ajout de métadonnées
            ws_message = {
                **data,
                "channel": channel,
                "timestamp": datetime.utcnow().isoformat(),
                "message_id": str(uuid4())
            }
            
            # Diffusion selon le type de message
            if client_id and client_id != "*":
                # Message pour un client spécifique
                await self.connection_manager.broadcast_to_client(client_id, ws_message)
            else:
                # Message global (système)
                await self.connection_manager.broadcast_to_all(ws_message)
            
        except Exception as e:
            logger.error(f"Error handling Redis message: {e}")
    
    async def publish_bms_data(self, client_id: str, battery_id: str, data: dict):
        """
        Publie des données BMS en temps réel
        """
        message = {
            "type": "bms_data_update",
            "client_id": client_id,
            "battery_id": battery_id,
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        channel = f"bms_data:{client_id}"
        await self.redis_client.publish(channel, json.dumps(message))
    
    async def publish_alert(self, client_id: str, alert_data: dict):
        """
        Publie une alerte
        """
        message = {
            "type": "alert",
            "client_id": client_id,
            "alert": alert_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        channel = f"alerts:{client_id}"
        await self.redis_client.publish(channel, json.dumps(message))
    
    async def publish_system_message(self, message_type: str, data: dict, client_id: str = None):
        """
        Publie un message système
        """
        message = {
            "type": message_type,
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if client_id:
            message["client_id"] = client_id
            channel = f"system:{client_id}"
        else:
            channel = "system:*"
        
        await self.redis_client.publish(channel, json.dumps(message))
    
    async def handle_websocket_connection(
        self,
        websocket: WebSocket,
        client_id: str,
        user_id: str = None
    ):
        """
        Gère une connexion WebSocket complète
        """
        await self.connection_manager.connect(websocket, client_id, user_id)
        
        try:
            while True:
                # Réception des messages du client
                message = await websocket.receive_json()
                await self._handle_client_message(websocket, message)
                
        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected normally: client={client_id}")
        except Exception as e:
            logger.error(f"WebSocket error: {e}")
        finally:
            self.connection_manager.disconnect(websocket)
    
    async def _handle_client_message(self, websocket: WebSocket, message: dict):
        """
        Traite les messages reçus du client WebSocket
        """
        try:
            message_type = message.get("type", "unknown")
            self.connection_manager.stats["messages_received"] += 1
            
            # Métadonnées de connexion
            metadata = self.connection_manager.connection_metadata.get(websocket, {})
            client_id = metadata.get("client_id")
            
            if message_type == "ping":
                # Pong de réponse
                await self.connection_manager.send_to_connection(websocket, {
                    "type": "pong",
                    "timestamp": datetime.utcnow().isoformat()
                })
                
                # Mise à jour du dernier ping
                if websocket in self.connection_manager.connection_metadata:
                    self.connection_manager.connection_metadata[websocket]["last_ping"] = datetime.utcnow()
            
            elif message_type == "subscribe":
                # Abonnement à des canaux spécifiques
                channels = message.get("channels", [])
                await self._handle_subscription(websocket, channels, client_id)
            
            elif message_type == "unsubscribe":
                # Désabonnement
                channels = message.get("channels", [])
                await self._handle_unsubscription(websocket, channels, client_id)
            
            else:
                logger.warning(f"Unknown WebSocket message type: {message_type}")
            
        except Exception as e:
            logger.error(f"Error handling client message: {e}")
    
    async def _handle_subscription(self, websocket: WebSocket, channels: List[str], client_id: str):
        """
        Gère les abonnements à des canaux spécifiques
        """
        # Pour l'instant, simple accusé de réception
        # Dans une version avancée, on pourrait gérer des abonnements granulaires
        await self.connection_manager.send_to_connection(websocket, {
            "type": "subscription_confirmed",
            "channels": channels,
            "client_id": client_id
        })
    
    async def _handle_unsubscription(self, websocket: WebSocket, channels: List[str], client_id: str):
        """
        Gère les désabonnements
        """
        await self.connection_manager.send_to_connection(websocket, {
            "type": "unsubscription_confirmed",
            "channels": channels,
            "client_id": client_id
        })
    
    def get_connection_stats(self) -> dict:
        """
        Statistiques des connexions WebSocket
        """
        return self.connection_manager.get_stats()
    
    async def send_heartbeat(self):
        """
        Envoie un heartbeat à toutes les connexions
        Utilisé pour détecter les connexions fermées
        """
        heartbeat_message = {
            "type": "heartbeat",
            "timestamp": datetime.utcnow().isoformat(),
            "server_time": datetime.utcnow().isoformat()
        }
        
        await self.connection_manager.broadcast_to_all(heartbeat_message)