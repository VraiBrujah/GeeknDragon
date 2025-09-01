"""
Endpoints de gestion des clients multi-tenant
CRUD clients, configuration, et utilisateurs associés
"""

import logging
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload

from database import get_db_session
from models.clients import Client, ClientUser, ClientConfig
from models.auth import User
from routers.auth import get_current_user
from middleware import require_client_id

logger = logging.getLogger(__name__)
router = APIRouter()


# Modèles Pydantic

class ClientBase(BaseModel):
    """Données de base d'un client"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state_province: Optional[str] = None
    postal_code: Optional[str] = None
    country: str = Field(default="CA", max_length=2)
    timezone: str = Field(default="America/Toronto")
    locale: str = Field(default="fr_CA")


class ClientCreate(ClientBase):
    """Création d'un client"""
    slug: str = Field(..., min_length=3, max_length=50, pattern="^[a-z0-9-]+$")
    subscription_plan: str = Field(default="basic")
    max_batteries: int = Field(default=100, ge=1)
    max_users: int = Field(default=10, ge=1)


class ClientUpdate(BaseModel):
    """Mise à jour d'un client"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state_province: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    timezone: Optional[str] = None
    locale: Optional[str] = None
    subscription_plan: Optional[str] = None
    max_batteries: Optional[int] = None
    max_users: Optional[int] = None
    is_active: Optional[bool] = None


class ClientResponse(ClientBase):
    """Réponse avec données client"""
    id: str
    slug: str
    subscription_plan: str
    max_batteries: int
    max_users: int
    is_active: bool
    full_address: Optional[str]
    created_at: str
    updated_at: str
    
    # Statistiques (optionnelles)
    stats: Optional[dict] = None


class ClientConfigModel(BaseModel):
    """Configuration client"""
    theme: str = Field(default="light", pattern="^(light|dark|auto)$")
    logo_url: Optional[str] = None
    brand_color: str = Field(default="#0066CC", pattern="^#[0-9A-Fa-f]{6}$")
    
    # Configuration BMS
    default_collection_interval: int = Field(default=5, ge=1, le=300)
    retention_days: int = Field(default=365, ge=30, le=2555)  # Max ~7 ans
    
    # Alertes
    email_notifications: bool = True
    sms_notifications: bool = False
    alert_email: Optional[EmailStr] = None
    alert_phone: Optional[str] = None
    
    # Seuils par défaut
    default_voltage_min: int = Field(default=3200, ge=1000, le=5000)
    default_voltage_max: int = Field(default=4200, ge=3000, le=6000)
    default_current_max: int = Field(default=10000, ge=100, le=100000)
    default_temp_min: int = Field(default=-10, ge=-40, le=40)
    default_temp_max: int = Field(default=60, ge=30, le=100)
    default_soc_min: int = Field(default=10, ge=0, le=50)
    default_soh_min: int = Field(default=80, ge=50, le=95)
    
    # Configuration export/rapport
    default_export_format: str = Field(default="csv", pattern="^(csv|xlsx|pdf)$")
    report_frequency: str = Field(default="weekly", pattern="^(daily|weekly|monthly|none)$")
    
    # Paramètres avancés
    enable_predictive_analytics: bool = False
    api_rate_limit: int = Field(default=1000, ge=10, le=10000)


class ClientUserModel(BaseModel):
    """Utilisateur associé à un client"""
    user_id: str
    role: str = Field(default="viewer", pattern="^(admin|manager|operator|viewer)$")
    is_active: bool = True
    
    # Permissions spécifiques
    can_create_batteries: bool = False
    can_edit_batteries: bool = False
    can_delete_batteries: bool = False
    can_view_all_batteries: bool = True
    can_export_data: bool = False
    can_manage_users: bool = False
    can_configure_alerts: bool = False


class ClientStatsResponse(BaseModel):
    """Statistiques détaillées d'un client"""
    client_id: str
    total_batteries: int
    active_batteries: int
    total_users: int
    active_users: int
    total_alerts: int
    critical_alerts: int
    data_points_today: int
    last_data_update: Optional[str]


# Fonctions utilitaires

async def check_client_access(client_id: str, user: User, db: AsyncSession) -> ClientUser:
    """
    Vérifie l'accès d'un utilisateur à un client
    Retourne le ClientUser ou lève une exception
    """
    if user.is_superuser:
        # Super-utilisateur a accès à tous les clients
        return None
    
    result = await db.execute(
        select(ClientUser)
        .where(
            and_(
                ClientUser.client_id == client_id,
                ClientUser.user_id == user.id,
                ClientUser.is_active == True
            )
        )
    )
    
    client_user = result.scalar_one_or_none()
    if not client_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this client"
        )
    
    return client_user


async def get_client_stats(client_id: str, db: AsyncSession) -> dict:
    """Calcule les statistiques d'un client"""
    from models.batteries import Battery
    from models.bms_data import Alert, BMSData
    
    # Statistiques batteries
    battery_stats = await db.execute(
        select(
            func.count(Battery.id).label("total"),
            func.sum(func.cast(~Battery.is_deleted, Integer)).label("active")
        ).where(Battery.client_id == client_id)
    )
    battery_result = battery_stats.first()
    
    # Statistiques utilisateurs
    user_stats = await db.execute(
        select(
            func.count(ClientUser.id).label("total"),
            func.sum(func.cast(ClientUser.is_active, Integer)).label("active")
        ).where(ClientUser.client_id == client_id)
    )
    user_result = user_stats.first()
    
    # Statistiques alertes
    alert_stats = await db.execute(
        select(
            func.count(Alert.id).label("total"),
            func.sum(func.case([(Alert.severity == "critical", 1)], else_=0)).label("critical")
        ).where(
            and_(
                Alert.client_id == client_id,
                Alert.status == "active"
            )
        )
    )
    alert_result = alert_stats.first()
    
    # Données récentes (aujourd'hui)
    from datetime import date
    today = date.today()
    data_stats = await db.execute(
        select(func.count(BMSData.id))
        .where(
            and_(
                BMSData.client_id == client_id,
                func.date(BMSData.measurement_timestamp) == today
            )
        )
    )
    data_today = data_stats.scalar() or 0
    
    return {
        "total_batteries": battery_result.total or 0,
        "active_batteries": battery_result.active or 0,
        "total_users": user_result.total or 0,
        "active_users": user_result.active or 0,
        "total_alerts": alert_result.total or 0,
        "critical_alerts": alert_result.critical or 0,
        "data_points_today": data_today
    }


# Endpoints

@router.get("/", response_model=List[ClientResponse])
async def list_clients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None, min_length=2),
    active_only: bool = Query(True),
    include_stats: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Liste des clients accessibles à l'utilisateur
    """
    query = select(Client)
    
    # Filtrage par utilisateur (sauf super-utilisateur)
    if not current_user.is_superuser:
        # Utilisateur normal : seulement ses clients
        query = query.join(ClientUser).where(
            and_(
                ClientUser.user_id == current_user.id,
                ClientUser.is_active == True
            )
        )
    
    # Filtres
    if active_only:
        query = query.where(Client.is_active == True)
    
    if search:
        search_filter = f"%{search}%"
        query = query.where(
            Client.name.ilike(search_filter) |
            Client.email.ilike(search_filter) |
            Client.slug.ilike(search_filter)
        )
    
    # Pagination
    query = query.offset(skip).limit(limit)
    
    # Exécution
    result = await db.execute(query)
    clients = result.scalars().all()
    
    # Conversion en modèles Pydantic
    response = []
    for client in clients:
        client_data = ClientResponse(
            id=str(client.id),
            slug=client.slug,
            name=client.name,
            email=client.email,
            phone=client.phone,
            address_line1=client.address_line1,
            address_line2=client.address_line2,
            city=client.city,
            state_province=client.state_province,
            postal_code=client.postal_code,
            country=client.country,
            timezone=client.timezone,
            locale=client.locale,
            subscription_plan=client.subscription_plan,
            max_batteries=client.max_batteries,
            max_users=client.max_users,
            is_active=client.is_active,
            full_address=client.full_address,
            created_at=client.created_at.isoformat(),
            updated_at=client.updated_at.isoformat()
        )
        
        # Ajouter statistiques si demandées
        if include_stats:
            client_data.stats = await get_client_stats(str(client.id), db)
        
        response.append(client_data)
    
    return response


@router.post("/", response_model=ClientResponse)
async def create_client(
    client_data: ClientCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Crée un nouveau client (super-utilisateur seulement)
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superusers can create clients"
        )
    
    # Vérifier unicité du slug
    result = await db.execute(select(Client).where(Client.slug == client_data.slug))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Client slug already exists"
        )
    
    # Créer le client
    client = Client(**client_data.dict())
    client.created_by = current_user.id
    
    db.add(client)
    await db.commit()
    await db.refresh(client)
    
    # Créer configuration par défaut
    config = ClientConfig(client_id=client.id)
    db.add(config)
    await db.commit()
    
    logger.info(f"Client created: {client.name} ({client.slug}) by {current_user.username}")
    
    return ClientResponse(
        id=str(client.id),
        slug=client.slug,
        name=client.name,
        email=client.email,
        phone=client.phone,
        address_line1=client.address_line1,
        address_line2=client.address_line2,
        city=client.city,
        state_province=client.state_province,
        postal_code=client.postal_code,
        country=client.country,
        timezone=client.timezone,
        locale=client.locale,
        subscription_plan=client.subscription_plan,
        max_batteries=client.max_batteries,
        max_users=client.max_users,
        is_active=client.is_active,
        full_address=client.full_address,
        created_at=client.created_at.isoformat(),
        updated_at=client.updated_at.isoformat()
    )


@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: str,
    include_stats: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Récupère les détails d'un client
    """
    # Vérifier l'accès
    await check_client_access(client_id, current_user, db)
    
    # Récupérer le client
    result = await db.execute(
        select(Client)
        .options(selectinload(Client.config))
        .where(Client.id == client_id)
    )
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    response = ClientResponse(
        id=str(client.id),
        slug=client.slug,
        name=client.name,
        email=client.email,
        phone=client.phone,
        address_line1=client.address_line1,
        address_line2=client.address_line2,
        city=client.city,
        state_province=client.state_province,
        postal_code=client.postal_code,
        country=client.country,
        timezone=client.timezone,
        locale=client.locale,
        subscription_plan=client.subscription_plan,
        max_batteries=client.max_batteries,
        max_users=client.max_users,
        is_active=client.is_active,
        full_address=client.full_address,
        created_at=client.created_at.isoformat(),
        updated_at=client.updated_at.isoformat()
    )
    
    if include_stats:
        response.stats = await get_client_stats(client_id, db)
    
    return response


@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: str,
    update_data: ClientUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Met à jour un client
    """
    # Vérifier l'accès (admin du client ou super-utilisateur)
    client_user = await check_client_access(client_id, current_user, db)
    if not current_user.is_superuser and (not client_user or client_user.role != "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin rights required to update client"
        )
    
    # Récupérer le client
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Mettre à jour les champs
    update_dict = update_data.dict(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(client, field, value)
    
    client.updated_by = current_user.id
    
    await db.commit()
    await db.refresh(client)
    
    logger.info(f"Client updated: {client.name} by {current_user.username}")
    
    return ClientResponse(
        id=str(client.id),
        slug=client.slug,
        name=client.name,
        email=client.email,
        phone=client.phone,
        address_line1=client.address_line1,
        address_line2=client.address_line2,
        city=client.city,
        state_province=client.state_province,
        postal_code=client.postal_code,
        country=client.country,
        timezone=client.timezone,
        locale=client.locale,
        subscription_plan=client.subscription_plan,
        max_batteries=client.max_batteries,
        max_users=client.max_users,
        is_active=client.is_active,
        full_address=client.full_address,
        created_at=client.created_at.isoformat(),
        updated_at=client.updated_at.isoformat()
    )


@router.get("/{client_id}/stats", response_model=ClientStatsResponse)
async def get_client_statistics(
    client_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Statistiques détaillées d'un client
    """
    # Vérifier l'accès
    await check_client_access(client_id, current_user, db)
    
    stats = await get_client_stats(client_id, db)
    
    return ClientStatsResponse(
        client_id=client_id,
        **stats,
        last_data_update=None  # À implémenter
    )


@router.get("/{client_id}/config", response_model=ClientConfigModel)
async def get_client_config(
    client_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Configuration d'un client
    """
    # Vérifier l'accès
    await check_client_access(client_id, current_user, db)
    
    result = await db.execute(
        select(ClientConfig).where(ClientConfig.client_id == client_id)
    )
    config = result.scalar_one_or_none()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client configuration not found"
        )
    
    return ClientConfigModel(**config.to_dict())


@router.put("/{client_id}/config")
async def update_client_config(
    client_id: str,
    config_data: ClientConfigModel,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Met à jour la configuration d'un client
    """
    # Vérifier l'accès (admin requis)
    client_user = await check_client_access(client_id, current_user, db)
    if not current_user.is_superuser and (not client_user or client_user.role != "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin rights required to update configuration"
        )
    
    # Récupérer la configuration
    result = await db.execute(
        select(ClientConfig).where(ClientConfig.client_id == client_id)
    )
    config = result.scalar_one_or_none()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client configuration not found"
        )
    
    # Mettre à jour
    config_dict = config_data.dict()
    for field, value in config_dict.items():
        setattr(config, field, value)
    
    config.updated_by = current_user.id
    
    await db.commit()
    
    logger.info(f"Client config updated: {client_id} by {current_user.username}")
    
    return {"message": "Configuration updated successfully"}