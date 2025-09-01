"""
Endpoints de gestion des données BMS temps réel
Collecte, historisation, et alertes
"""

import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.orm import selectinload

from database import get_db_session
from models.bms_data import BMSData, BMSDataHistory, Alert, MaintenanceLog, AlertSeverity, AlertStatus
from models.batteries import Battery
from routers.auth import get_current_user
from routers.clients import check_client_access
from middleware import require_client_id
from websocket_manager import WebSocketManager

logger = logging.getLogger(__name__)
router = APIRouter()

# Variable globale pour le gestionnaire WebSocket (sera injectée)
websocket_manager: Optional[WebSocketManager] = None


# Modèles Pydantic

class BMSDataCreate(BaseModel):
    """Données BMS à insérer"""
    battery_id: str
    measurement_timestamp: datetime
    
    # Données électriques (mV/mA pour précision)
    pack_voltage: Optional[int] = None
    cell_voltage_min: Optional[int] = None
    cell_voltage_max: Optional[int] = None
    cell_voltage_avg: Optional[int] = None
    pack_current: Optional[int] = None
    charge_current: Optional[int] = None
    discharge_current: Optional[int] = None
    
    # États
    soc: Optional[int] = Field(None, ge=0, le=100)
    soh: Optional[int] = Field(None, ge=0, le=100)
    remaining_capacity: Optional[float] = None
    full_capacity: Optional[float] = None
    
    # Températures (°C x10 pour 1 décimale)
    temp_pack: Optional[int] = None
    temp_cell_min: Optional[int] = None
    temp_cell_max: Optional[int] = None
    temp_cell_avg: Optional[int] = None
    temp_ambient: Optional[int] = None
    
    # Puissance et énergie
    pack_power: Optional[float] = None
    energy_charged: Optional[float] = None
    energy_discharged: Optional[float] = None
    
    # Cycles et durée de vie
    cycle_count: Optional[int] = None
    operating_time: Optional[int] = None
    
    # États BMS
    is_charging: Optional[bool] = None
    is_discharging: Optional[bool] = None
    is_balancing: Optional[bool] = None
    protection_status: Optional[int] = None
    fault_codes: Optional[str] = None
    
    # Données détaillées JSON
    cell_voltages: Optional[List[int]] = None
    cell_temperatures: Optional[List[int]] = None
    balancer_status: Optional[List[bool]] = None
    
    # Qualité collecte
    collection_quality: int = Field(default=100, ge=0, le=100)
    collection_latency_ms: Optional[int] = None


class BMSDataResponse(BaseModel):
    """Réponse avec données BMS"""
    id: str
    battery_id: str
    measurement_timestamp: datetime
    created_at: datetime
    
    # Toutes les données converties en format lisible
    pack_voltage_v: Optional[float] = None
    pack_current_a: Optional[float] = None
    temp_pack_c: Optional[float] = None
    soc: Optional[int] = None
    soh: Optional[int] = None
    
    # État général
    is_healthy: bool
    fault_codes: Optional[str] = None
    protection_flags: List[str] = []


class AlertCreate(BaseModel):
    """Création d'une alerte"""
    battery_id: str
    alert_type: str
    severity: AlertSeverity
    title: str = Field(..., min_length=5, max_length=200)
    message: str = Field(..., min_length=10)
    trigger_value: Optional[float] = None
    threshold_value: Optional[float] = None


class MaintenanceCreate(BaseModel):
    """Création d'un log de maintenance"""
    battery_id: str
    maintenance_type: str
    performed_date: datetime
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10)
    
    technician_name: Optional[str] = None
    technician_company: Optional[str] = None
    duration_hours: Optional[float] = None
    cost: Optional[float] = None
    
    condition_before: Optional[str] = None
    condition_after: Optional[str] = None
    soh_before: Optional[int] = None
    soh_after: Optional[int] = None
    capacity_before: Optional[float] = None
    capacity_after: Optional[float] = None
    
    parts_replaced: Optional[str] = None
    next_maintenance_date: Optional[datetime] = None


# Endpoints données BMS temps réel

@router.get("/batteries/{battery_id}/data/latest", response_model=BMSDataResponse)
async def get_latest_bms_data(
    battery_id: str,
    client_id: str = Depends(require_client_id),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Récupère la dernière mesure BMS d'une batterie"""
    await check_client_access(client_id, current_user, db)
    
    # Vérifier que la batterie existe et appartient au client
    battery_result = await db.execute(
        select(Battery).where(
            and_(
                Battery.id == battery_id,
                Battery.client_id == client_id,
                Battery.is_deleted == False
            )
        )
    )
    
    if not battery_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Battery not found"
        )
    
    # Dernière donnée BMS
    result = await db.execute(
        select(BMSData)
        .where(BMSData.battery_id == battery_id)
        .order_by(desc(BMSData.measurement_timestamp))
        .limit(1)
    )
    
    bms_data = result.scalar_one_or_none()
    if not bms_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No BMS data found for this battery"
        )
    
    return BMSDataResponse(
        id=str(bms_data.id),
        battery_id=str(bms_data.battery_id),
        measurement_timestamp=bms_data.measurement_timestamp,
        created_at=bms_data.created_at,
        pack_voltage_v=bms_data.pack_voltage_v,
        pack_current_a=bms_data.pack_current_a,
        temp_pack_c=bms_data.temp_pack_c,
        soc=bms_data.soc,
        soh=bms_data.soh,
        is_healthy=bms_data.is_healthy,
        fault_codes=bms_data.fault_codes,
        protection_flags=bms_data.get_protection_flags()
    )


@router.get("/batteries/{battery_id}/data/history", response_model=List[BMSDataResponse])
async def get_bms_data_history(
    battery_id: str,
    client_id: str = Depends(require_client_id),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    limit: int = Query(1000, ge=1, le=10000),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Récupère l'historique des données BMS"""
    await check_client_access(client_id, current_user, db)
    
    # Vérifier la batterie
    battery_result = await db.execute(
        select(Battery).where(
            and_(
                Battery.id == battery_id,
                Battery.client_id == client_id,
                Battery.is_deleted == False
            )
        )
    )
    
    if not battery_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Battery not found"
        )
    
    # Construction de la requête
    query = select(BMSData).where(BMSData.battery_id == battery_id)
    
    # Filtres temporels
    if start_date:
        query = query.where(BMSData.measurement_timestamp >= start_date)
    if end_date:
        query = query.where(BMSData.measurement_timestamp <= end_date)
    else:
        # Par défaut, dernières 24h
        yesterday = datetime.utcnow() - timedelta(days=1)
        query = query.where(BMSData.measurement_timestamp >= yesterday)
    
    # Ordre et limite
    query = query.order_by(desc(BMSData.measurement_timestamp)).limit(limit)
    
    result = await db.execute(query)
    bms_data_list = result.scalars().all()
    
    return [
        BMSDataResponse(
            id=str(data.id),
            battery_id=str(data.battery_id),
            measurement_timestamp=data.measurement_timestamp,
            created_at=data.created_at,
            pack_voltage_v=data.pack_voltage_v,
            pack_current_a=data.pack_current_a,
            temp_pack_c=data.temp_pack_c,
            soc=data.soc,
            soh=data.soh,
            is_healthy=data.is_healthy,
            fault_codes=data.fault_codes,
            protection_flags=data.get_protection_flags()
        )
        for data in bms_data_list
    ]


@router.post("/batteries/{battery_id}/data", response_model=dict)
async def create_bms_data(
    battery_id: str,
    bms_data: BMSDataCreate,
    client_id: str = Depends(require_client_id),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Insère de nouvelles données BMS (collecte temps réel)"""
    await check_client_access(client_id, current_user, db)
    
    # Vérifier la batterie
    battery_result = await db.execute(
        select(Battery).where(
            and_(
                Battery.id == battery_id,
                Battery.client_id == client_id,
                Battery.is_deleted == False,
                Battery.is_monitored == True  # Seulement les batteries monitorées
            )
        )
    )
    
    battery = battery_result.scalar_one_or_none()
    if not battery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Battery not found or not monitored"
        )
    
    # Vérifier cohérence battery_id
    if str(battery.id) != bms_data.battery_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Battery ID mismatch"
        )
    
    # Créer l'enregistrement BMS
    data_record = BMSData(
        **bms_data.dict(),
        client_id=client_id,
        created_by=current_user.id
    )
    
    db.add(data_record)
    await db.commit()
    await db.refresh(data_record)
    
    # Diffusion temps réel via WebSocket
    if websocket_manager:
        await websocket_manager.publish_bms_data(
            client_id=client_id,
            battery_id=battery_id,
            data=data_record.to_dict()
        )
    
    # Vérification automatique d'alertes
    await check_and_create_alerts(battery, data_record, db)
    
    logger.info(f"BMS data recorded for battery {battery_id}")
    
    return {
        "id": str(data_record.id),
        "message": "BMS data recorded successfully",
        "timestamp": data_record.measurement_timestamp.isoformat()
    }


@router.get("/batteries/{battery_id}/data/stats", response_model=dict)
async def get_battery_stats(
    battery_id: str,
    client_id: str = Depends(require_client_id),
    period: str = Query("24h", pattern="^(1h|6h|24h|7d|30d)$"),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Statistiques agrégées d'une batterie"""
    await check_client_access(client_id, current_user, db)
    
    # Calcul de la période
    period_hours = {
        "1h": 1, "6h": 6, "24h": 24,
        "7d": 24 * 7, "30d": 24 * 30
    }
    
    start_time = datetime.utcnow() - timedelta(hours=period_hours[period])
    
    # Requête statistiques
    stats_query = select(
        func.count(BMSData.id).label("data_points"),
        func.min(BMSData.soc).label("soc_min"),
        func.max(BMSData.soc).label("soc_max"),
        func.avg(BMSData.soc).label("soc_avg"),
        func.min(BMSData.pack_voltage).label("voltage_min"),
        func.max(BMSData.pack_voltage).label("voltage_max"),
        func.avg(BMSData.pack_voltage).label("voltage_avg"),
        func.min(BMSData.temp_pack).label("temp_min"),
        func.max(BMSData.temp_pack).label("temp_max"),
        func.avg(BMSData.temp_pack).label("temp_avg"),
        func.sum(BMSData.energy_charged).label("energy_charged_total"),
        func.sum(BMSData.energy_discharged).label("energy_discharged_total")
    ).where(
        and_(
            BMSData.battery_id == battery_id,
            BMSData.measurement_timestamp >= start_time
        )
    )
    
    result = await db.execute(stats_query)
    stats = result.first()
    
    return {
        "battery_id": battery_id,
        "period": period,
        "start_time": start_time.isoformat(),
        "data_points": stats.data_points or 0,
        "soc": {
            "min": stats.soc_min,
            "max": stats.soc_max,
            "avg": round(float(stats.soc_avg), 1) if stats.soc_avg else None
        },
        "voltage": {
            "min_mv": stats.voltage_min,
            "max_mv": stats.voltage_max,
            "avg_mv": round(float(stats.voltage_avg), 0) if stats.voltage_avg else None
        },
        "temperature": {
            "min_c": round(stats.temp_min / 10.0, 1) if stats.temp_min else None,
            "max_c": round(stats.temp_max / 10.0, 1) if stats.temp_max else None,
            "avg_c": round(float(stats.temp_avg) / 10.0, 1) if stats.temp_avg else None
        },
        "energy": {
            "charged_wh": stats.energy_charged_total,
            "discharged_wh": stats.energy_discharged_total,
            "net_wh": (stats.energy_charged_total or 0) - (stats.energy_discharged_total or 0)
        }
    }


# Endpoints alertes

@router.get("/alerts", response_model=List[dict])
async def list_alerts(
    client_id: str = Depends(require_client_id),
    battery_id: Optional[str] = Query(None),
    severity: Optional[AlertSeverity] = Query(None),
    status_filter: Optional[AlertStatus] = Query(None),
    active_only: bool = Query(True),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Liste des alertes d'un client"""
    await check_client_access(client_id, current_user, db)
    
    query = select(Alert).options(
        selectinload(Alert.battery)
    ).where(Alert.client_id == client_id)
    
    # Filtres
    if battery_id:
        query = query.where(Alert.battery_id == battery_id)
    
    if severity:
        query = query.where(Alert.severity == severity)
    
    if status_filter:
        query = query.where(Alert.status == status_filter)
    elif active_only:
        query = query.where(Alert.status == AlertStatus.ACTIVE)
    
    # Ordre par sévérité puis date
    query = query.order_by(
        desc(Alert.severity),
        desc(Alert.triggered_at)
    ).offset(skip).limit(limit)
    
    result = await db.execute(query)
    alerts = result.scalars().all()
    
    return [
        {
            **alert.to_dict(),
            "battery_name": alert.battery.name if alert.battery else None
        }
        for alert in alerts
    ]


@router.post("/alerts", response_model=dict)
async def create_alert(
    alert_data: AlertCreate,
    client_id: str = Depends(require_client_id),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Crée une alerte manuelle"""
    await check_client_access(client_id, current_user, db)
    
    # Vérifier la batterie
    battery_result = await db.execute(
        select(Battery).where(
            and_(
                Battery.id == alert_data.battery_id,
                Battery.client_id == client_id,
                Battery.is_deleted == False
            )
        )
    )
    
    if not battery_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Battery not found"
        )
    
    # Créer l'alerte
    alert = Alert(
        **alert_data.dict(),
        client_id=client_id,
        triggered_at=datetime.utcnow(),
        created_by=current_user.id
    )
    
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    
    # Diffusion via WebSocket
    if websocket_manager:
        await websocket_manager.publish_alert(
            client_id=client_id,
            alert_data=alert.to_dict()
        )
    
    logger.info(f"Manual alert created: {alert.title} for battery {alert_data.battery_id}")
    
    return alert.to_dict()


@router.put("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: str,
    client_id: str = Depends(require_client_id),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Accuse réception d'une alerte"""
    await check_client_access(client_id, current_user, db)
    
    result = await db.execute(
        select(Alert).where(
            and_(
                Alert.id == alert_id,
                Alert.client_id == client_id
            )
        )
    )
    
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    alert.acknowledge(str(current_user.id))
    await db.commit()
    
    logger.info(f"Alert acknowledged: {alert_id} by {current_user.username}")
    
    return {"message": "Alert acknowledged successfully"}


# WebSocket endpoint

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    client_id: str,
    token: Optional[str] = Query(None)
):
    """
    Endpoint WebSocket pour données temps réel
    """
    # TODO: Valider le token JWT ici
    # Pour l'instant, accepter toutes les connexions
    
    if not websocket_manager:
        await websocket.close(code=1011, reason="WebSocket service unavailable")
        return
    
    # Gestion de la connexion
    await websocket_manager.handle_websocket_connection(
        websocket=websocket,
        client_id=client_id,
        user_id=None  # À récupérer du token
    )


# Fonction utilitaire pour vérifications automatiques d'alertes

async def check_and_create_alerts(battery: Battery, bms_data: BMSData, db: AsyncSession):
    """
    Vérifie les seuils et crée des alertes automatiques si nécessaire
    """
    thresholds = battery.get_effective_thresholds()
    alerts_to_create = []
    
    # Vérification tension
    if bms_data.pack_voltage and bms_data.pack_voltage < thresholds["voltage_min"]:
        alerts_to_create.append({
            "alert_type": "voltage_low",
            "severity": AlertSeverity.CRITICAL,
            "title": f"Tension batterie faible: {bms_data.pack_voltage_v}V",
            "message": f"Tension pack ({bms_data.pack_voltage_v}V) sous le seuil minimum ({thresholds['voltage_min']/1000}V)",
            "trigger_value": bms_data.pack_voltage_v,
            "threshold_value": thresholds["voltage_min"] / 1000
        })
    
    elif bms_data.pack_voltage and bms_data.pack_voltage > thresholds["voltage_max"]:
        alerts_to_create.append({
            "alert_type": "voltage_high",
            "severity": AlertSeverity.CRITICAL,
            "title": f"Tension batterie élevée: {bms_data.pack_voltage_v}V",
            "message": f"Tension pack ({bms_data.pack_voltage_v}V) au-dessus du seuil maximum ({thresholds['voltage_max']/1000}V)",
            "trigger_value": bms_data.pack_voltage_v,
            "threshold_value": thresholds["voltage_max"] / 1000
        })
    
    # Vérification SOC
    if bms_data.soc and bms_data.soc < thresholds["soc_critical"]:
        alerts_to_create.append({
            "alert_type": "soc_low",
            "severity": AlertSeverity.WARNING,
            "title": f"État de charge faible: {bms_data.soc}%",
            "message": f"SOC ({bms_data.soc}%) sous le seuil critique ({thresholds['soc_critical']}%)",
            "trigger_value": bms_data.soc,
            "threshold_value": thresholds["soc_critical"]
        })
    
    # Vérification température
    if bms_data.temp_pack and bms_data.temp_pack_c:
        if bms_data.temp_pack_c < thresholds["temp_min"]:
            alerts_to_create.append({
                "alert_type": "temperature_low",
                "severity": AlertSeverity.WARNING,
                "title": f"Température batterie faible: {bms_data.temp_pack_c}°C",
                "message": f"Température ({bms_data.temp_pack_c}°C) sous le seuil minimum ({thresholds['temp_min']}°C)",
                "trigger_value": bms_data.temp_pack_c,
                "threshold_value": thresholds["temp_min"]
            })
        
        elif bms_data.temp_pack_c > thresholds["temp_max"]:
            alerts_to_create.append({
                "alert_type": "temperature_high",
                "severity": AlertSeverity.CRITICAL,
                "title": f"Température batterie élevée: {bms_data.temp_pack_c}°C",
                "message": f"Température ({bms_data.temp_pack_c}°C) au-dessus du seuil maximum ({thresholds['temp_max']}°C)",
                "trigger_value": bms_data.temp_pack_c,
                "threshold_value": thresholds["temp_max"]
            })
    
    # Créer les alertes
    for alert_data in alerts_to_create:
        # Vérifier qu'une alerte similaire n'existe pas déjà (dernière heure)
        recent_alert = await db.execute(
            select(Alert).where(
                and_(
                    Alert.battery_id == battery.id,
                    Alert.alert_type == alert_data["alert_type"],
                    Alert.status == AlertStatus.ACTIVE,
                    Alert.triggered_at >= datetime.utcnow() - timedelta(hours=1)
                )
            )
        )
        
        if recent_alert.scalar_one_or_none():
            continue  # Éviter les doublons
        
        # Créer l'alerte
        alert = Alert(
            battery_id=battery.id,
            client_id=battery.client_id,
            triggered_at=datetime.utcnow(),
            bms_data_snapshot=bms_data.to_dict(),
            auto_resolved=False,
            **alert_data
        )
        
        db.add(alert)
        
        # Diffusion temps réel
        if websocket_manager:
            await websocket_manager.publish_alert(
                client_id=str(battery.client_id),
                alert_data=alert.to_dict()
            )
    
    if alerts_to_create:
        await db.commit()
        logger.info(f"Created {len(alerts_to_create)} automatic alerts for battery {battery.id}")


def set_websocket_manager(manager: WebSocketManager):
    """Injection du gestionnaire WebSocket"""
    global websocket_manager
    websocket_manager = manager