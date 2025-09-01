"""
Endpoints de gestion hiérarchique des batteries
Types → Lieux → Batteries → Données personnalisées
"""

import logging
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload

from database import get_db_session
from models.batteries import BatteryType, Location, Battery, CustomField, BatteryChemistry, BatteryStatus
from routers.auth import get_current_user
from routers.clients import check_client_access
from middleware import require_client_id

logger = logging.getLogger(__name__)
router = APIRouter()


# Modèles Pydantic pour Battery Types

class BatteryTypeCreate(BaseModel):
    """Création d'un type de batterie"""
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=50, pattern="^[a-z0-9-]+$")
    chemistry: BatteryChemistry
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    
    # Spécifications électriques
    nominal_voltage: float = Field(..., gt=0)
    nominal_capacity: float = Field(..., gt=0)
    max_charge_current: Optional[float] = None
    max_discharge_current: Optional[float] = None
    
    # Spécifications physiques
    cell_count: Optional[int] = None
    weight_kg: Optional[float] = None
    
    # Limites opérationnelles
    temp_min: int = Field(default=-10, ge=-40, le=40)
    temp_max: int = Field(default=60, ge=30, le=100)
    voltage_min: int = Field(..., gt=0)
    voltage_max: int = Field(..., gt=0)
    soc_critical: int = Field(default=10, ge=0, le=50)
    soh_critical: int = Field(default=70, ge=50, le=95)
    
    # Informations cycle de vie
    expected_cycles: Optional[int] = None
    warranty_months: Optional[int] = None
    
    # Configuration BMS
    bms_protocol: Optional[str] = None


class LocationCreate(BaseModel):
    """Création d'un lieu"""
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=50, pattern="^[a-z0-9-]+$")
    battery_type_id: str
    
    # Adresse
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state_province: Optional[str] = None
    postal_code: Optional[str] = None
    country: str = Field(default="CA", max_length=2)
    
    # Coordonnées GPS
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    altitude: Optional[float] = None
    
    # Caractéristiques
    indoor: bool = True
    climate_controlled: bool = False
    power_grid_connection: bool = True
    backup_power: bool = False
    
    # Contact
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None


class BatteryCreate(BaseModel):
    """Création d'une batterie"""
    name: str = Field(..., min_length=2, max_length=100)
    location_id: str
    battery_type_id: str
    
    serial_number: Optional[str] = None
    installation_date: Optional[str] = None  # YYYY-MM-DD
    commissioning_date: Optional[str] = None
    warranty_expiry: Optional[str] = None
    
    # Configuration BMS
    bms_address: Optional[str] = None
    bms_port: Optional[int] = None
    collection_interval: Optional[int] = None
    
    # Seuils personnalisés (NULL = utiliser le type)
    voltage_min_custom: Optional[int] = None
    voltage_max_custom: Optional[int] = None
    current_max_custom: Optional[int] = None
    temp_min_custom: Optional[int] = None
    temp_max_custom: Optional[int] = None
    soc_critical_custom: Optional[int] = None
    soh_critical_custom: Optional[int] = None


# Endpoints Battery Types

@router.get("/types", response_model=List[dict])
async def list_battery_types(
    client_id: str = Depends(require_client_id),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None,
    chemistry: Optional[BatteryChemistry] = None,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Liste les types de batteries d'un client"""
    await check_client_access(client_id, current_user, db)
    
    query = select(BatteryType).where(
        and_(
            BatteryType.client_id == client_id,
            BatteryType.is_deleted == False
        )
    )
    
    # Filtres
    if search:
        search_filter = f"%{search}%"
        query = query.where(
            or_(
                BatteryType.name.ilike(search_filter),
                BatteryType.manufacturer.ilike(search_filter),
                BatteryType.model.ilike(search_filter)
            )
        )
    
    if chemistry:
        query = query.where(BatteryType.chemistry == chemistry)
    
    # Pagination
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    battery_types = result.scalars().all()
    
    return [bt.to_dict() for bt in battery_types]


@router.post("/types", response_model=dict)
async def create_battery_type(
    battery_type_data: BatteryTypeCreate,
    client_id: str = Depends(require_client_id),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Crée un nouveau type de batterie"""
    await check_client_access(client_id, current_user, db)
    
    # Vérifier unicité du slug
    result = await db.execute(
        select(BatteryType).where(
            and_(
                BatteryType.client_id == client_id,
                BatteryType.slug == battery_type_data.slug,
                BatteryType.is_deleted == False
            )
        )
    )
    
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Battery type slug already exists"
        )
    
    # Créer le type
    battery_type = BatteryType(
        **battery_type_data.dict(),
        client_id=client_id,
        created_by=current_user.id
    )
    
    db.add(battery_type)
    await db.commit()
    await db.refresh(battery_type)
    
    logger.info(f"Battery type created: {battery_type.name} for client {client_id}")
    
    return battery_type.to_dict()


# Endpoints Locations

@router.get("/types/{type_id}/locations", response_model=List[dict])
async def list_locations(
    type_id: str,
    client_id: str = Depends(require_client_id),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Liste les lieux d'un type de batterie"""
    await check_client_access(client_id, current_user, db)
    
    query = select(Location).where(
        and_(
            Location.client_id == client_id,
            Location.battery_type_id == type_id,
            Location.is_deleted == False
        )
    ).offset(skip).limit(limit)
    
    result = await db.execute(query)
    locations = result.scalars().all()
    
    return [loc.to_dict() for loc in locations]


@router.post("/types/{type_id}/locations", response_model=dict)
async def create_location(
    type_id: str,
    location_data: LocationCreate,
    client_id: str = Depends(require_client_id),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Crée un nouveau lieu"""
    await check_client_access(client_id, current_user, db)
    
    # Vérifier que le type de batterie existe
    result = await db.execute(
        select(BatteryType).where(
            and_(
                BatteryType.id == type_id,
                BatteryType.client_id == client_id,
                BatteryType.is_deleted == False
            )
        )
    )
    
    if not result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Battery type not found"
        )
    
    # Vérifier unicité du slug pour ce type
    result = await db.execute(
        select(Location).where(
            and_(
                Location.client_id == client_id,
                Location.battery_type_id == type_id,
                Location.slug == location_data.slug,
                Location.is_deleted == False
            )
        )
    )
    
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Location slug already exists for this battery type"
        )
    
    # Créer le lieu
    location = Location(
        **location_data.dict(),
        client_id=client_id,
        created_by=current_user.id
    )
    
    db.add(location)
    await db.commit()
    await db.refresh(location)
    
    logger.info(f"Location created: {location.name} for type {type_id}")
    
    return location.to_dict()


# Endpoints Batteries

@router.get("/locations/{location_id}/batteries", response_model=List[dict])
async def list_batteries(
    location_id: str,
    client_id: str = Depends(require_client_id),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status_filter: Optional[BatteryStatus] = None,
    monitored_only: bool = Query(False),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Liste les batteries d'un lieu"""
    await check_client_access(client_id, current_user, db)
    
    query = select(Battery).options(
        selectinload(Battery.custom_fields)
    ).where(
        and_(
            Battery.client_id == client_id,
            Battery.location_id == location_id,
            Battery.is_deleted == False
        )
    )
    
    # Filtres
    if status_filter:
        query = query.where(Battery.status == status_filter)
    
    if monitored_only:
        query = query.where(Battery.is_monitored == True)
    
    # Pagination
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    batteries = result.scalars().all()
    
    # Convertir avec champs personnalisés
    response = []
    for battery in batteries:
        battery_dict = battery.to_dict()
        battery_dict["custom_fields"] = [cf.to_dict() for cf in battery.custom_fields]
        response.append(battery_dict)
    
    return response


@router.post("/locations/{location_id}/batteries", response_model=dict)
async def create_battery(
    location_id: str,
    battery_data: BatteryCreate,
    client_id: str = Depends(require_client_id),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Crée une nouvelle batterie"""
    await check_client_access(client_id, current_user, db)
    
    # Vérifier que le lieu existe
    result = await db.execute(
        select(Location).where(
            and_(
                Location.id == location_id,
                Location.client_id == client_id,
                Location.is_deleted == False
            )
        )
    )
    
    location = result.scalar_one_or_none()
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    # Vérifier que le type de batterie correspond
    if str(location.battery_type_id) != battery_data.battery_type_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Battery type must match location's battery type"
        )
    
    # Vérifier unicité du numéro de série si fourni
    if battery_data.serial_number:
        result = await db.execute(
            select(Battery).where(
                and_(
                    Battery.client_id == client_id,
                    Battery.serial_number == battery_data.serial_number,
                    Battery.is_deleted == False
                )
            )
        )
        
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Serial number already exists"
            )
    
    # Créer la batterie
    battery = Battery(
        **battery_data.dict(),
        client_id=client_id,
        created_by=current_user.id
    )
    
    db.add(battery)
    await db.commit()
    await db.refresh(battery)
    
    logger.info(f"Battery created: {battery.name} in location {location_id}")
    
    return battery.to_dict()


@router.get("/batteries/{battery_id}", response_model=dict)
async def get_battery(
    battery_id: str,
    client_id: str = Depends(require_client_id),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Récupère une batterie avec tous ses détails"""
    await check_client_access(client_id, current_user, db)
    
    result = await db.execute(
        select(Battery).options(
            selectinload(Battery.custom_fields),
            selectinload(Battery.location),
            selectinload(Battery.battery_type)
        ).where(
            and_(
                Battery.id == battery_id,
                Battery.client_id == client_id,
                Battery.is_deleted == False
            )
        )
    )
    
    battery = result.scalar_one_or_none()
    if not battery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Battery not found"
        )
    
    # Réponse complète avec relations
    battery_dict = battery.to_dict()
    battery_dict["custom_fields"] = [cf.to_dict() for cf in battery.custom_fields]
    battery_dict["location"] = battery.location.to_dict() if battery.location else None
    battery_dict["battery_type"] = battery.battery_type.to_dict() if battery.battery_type else None
    
    return battery_dict


@router.put("/batteries/{battery_id}/status")
async def update_battery_status(
    battery_id: str,
    status_data: dict,
    client_id: str = Depends(require_client_id),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Met à jour le statut d'une batterie"""
    await check_client_access(client_id, current_user, db)
    
    result = await db.execute(
        select(Battery).where(
            and_(
                Battery.id == battery_id,
                Battery.client_id == client_id,
                Battery.is_deleted == False
            )
        )
    )
    
    battery = result.scalar_one_or_none()
    if not battery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Battery not found"
        )
    
    # Mise à jour des champs autorisés
    allowed_fields = ["status", "is_monitored", "notes"]
    for field, value in status_data.items():
        if field in allowed_fields:
            setattr(battery, field, value)
    
    battery.updated_by = current_user.id
    
    await db.commit()
    
    logger.info(f"Battery status updated: {battery_id} by {current_user.username}")
    
    return {"message": "Battery status updated successfully"}


# Endpoints Custom Fields

@router.post("/batteries/{battery_id}/custom-fields", response_model=dict)
async def add_custom_field(
    battery_id: str,
    field_data: dict,
    client_id: str = Depends(require_client_id),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Ajoute un champ personnalisé à une batterie"""
    await check_client_access(client_id, current_user, db)
    
    # Vérifier que la batterie existe
    result = await db.execute(
        select(Battery).where(
            and_(
                Battery.id == battery_id,
                Battery.client_id == client_id,
                Battery.is_deleted == False
            )
        )
    )
    
    if not result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Battery not found"
        )
    
    # Créer le champ personnalisé
    custom_field = CustomField(
        battery_id=battery_id,
        client_id=client_id,
        field_name=field_data["field_name"],
        field_type=field_data["field_type"],
        field_value=field_data.get("field_value"),
        field_options=field_data.get("field_options"),
        is_required=field_data.get("is_required", False),
        is_searchable=field_data.get("is_searchable", True),
        display_order=field_data.get("display_order", 0),
        created_by=current_user.id
    )
    
    db.add(custom_field)
    await db.commit()
    await db.refresh(custom_field)
    
    return custom_field.to_dict()


@router.get("/search", response_model=dict)
async def search_batteries(
    q: str = Query(..., min_length=2),
    client_id: str = Depends(require_client_id),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Recherche globale dans les batteries d'un client"""
    await check_client_access(client_id, current_user, db)
    
    search_filter = f"%{q}%"
    
    # Recherche dans batteries
    battery_query = select(Battery).options(
        selectinload(Battery.location),
        selectinload(Battery.battery_type)
    ).where(
        and_(
            Battery.client_id == client_id,
            Battery.is_deleted == False,
            or_(
                Battery.name.ilike(search_filter),
                Battery.serial_number.ilike(search_filter)
            )
        )
    ).offset(skip).limit(limit)
    
    battery_result = await db.execute(battery_query)
    batteries = battery_result.scalars().all()
    
    # Recherche dans champs personnalisés
    custom_field_query = select(CustomField).join(Battery).where(
        and_(
            Battery.client_id == client_id,
            Battery.is_deleted == False,
            CustomField.is_searchable == True,
            CustomField.field_value.ilike(search_filter)
        )
    ).offset(skip).limit(limit)
    
    cf_result = await db.execute(custom_field_query)
    custom_fields = cf_result.scalars().all()
    
    return {
        "query": q,
        "batteries": [
            {
                **battery.to_dict(),
                "location": battery.location.to_dict() if battery.location else None,
                "battery_type": battery.battery_type.to_dict() if battery.battery_type else None
            }
            for battery in batteries
        ],
        "custom_fields": [cf.to_dict() for cf in custom_fields],
        "total": len(batteries) + len(custom_fields)
    }