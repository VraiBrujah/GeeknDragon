"""
Modèles pour les données BMS en temps réel et historiques
Gestion des alertes et logs de maintenance
"""

from sqlalchemy import Column, String, Boolean, Text, Integer, Float, ForeignKey, Index, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.ext.hybrid import hybrid_property
import enum
from datetime import datetime

from .base import BaseEntity, TimestampMixin, TenantMixin, UUIDMixin


class AlertSeverity(enum.Enum):
    """Niveaux de sévérité des alertes"""
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"
    EMERGENCY = "emergency"


class AlertStatus(enum.Enum):
    """Statuts des alertes"""
    ACTIVE = "active"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
    SUPPRESSED = "suppressed"


class MaintenanceType(enum.Enum):
    """Types de maintenance"""
    PREVENTIVE = "preventive"
    CORRECTIVE = "corrective"
    EMERGENCY = "emergency"
    CALIBRATION = "calibration"
    REPLACEMENT = "replacement"


class BMSData(BaseEntity):
    """
    Données BMS en temps réel
    Optimisé pour les insertions rapides et requêtes récentes
    """
    __tablename__ = "bms_data"
    
    # Relation batterie
    battery_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("batteries.id"), 
        nullable=False,
        index=True
    )
    
    # Horodatage de la mesure (peut différer de created_at)
    measurement_timestamp = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        index=True,
        doc="Horodatage de la mesure BMS"
    )
    
    # === Données électriques principales ===
    
    # Tensions (mV pour précision)
    pack_voltage = Column(
        Integer, 
        nullable=True,
        doc="Tension du pack (mV)"
    )
    
    cell_voltage_min = Column(
        Integer, 
        nullable=True,
        doc="Tension cellule minimum (mV)"
    )
    
    cell_voltage_max = Column(
        Integer, 
        nullable=True,
        doc="Tension cellule maximum (mV)"
    )
    
    cell_voltage_avg = Column(
        Integer, 
        nullable=True,
        doc="Tension cellule moyenne (mV)"
    )
    
    # Courants (mA pour précision)
    pack_current = Column(
        Integer, 
        nullable=True,
        doc="Courant du pack (mA, positif = charge)"
    )
    
    charge_current = Column(
        Integer, 
        nullable=True,
        doc="Courant de charge (mA)"
    )
    
    discharge_current = Column(
        Integer, 
        nullable=True,
        doc="Courant de décharge (mA)"
    )
    
    # États de charge
    soc = Column(
        Integer, 
        nullable=True,
        doc="État de charge (%)"
    )
    
    soh = Column(
        Integer, 
        nullable=True,
        doc="État de santé (%)"
    )
    
    remaining_capacity = Column(
        Float, 
        nullable=True,
        doc="Capacité restante (Ah)"
    )
    
    full_capacity = Column(
        Float, 
        nullable=True,
        doc="Capacité totale actuelle (Ah)"
    )
    
    # === Températures (°C x10 pour 1 décimale) ===
    
    temp_pack = Column(
        Integer, 
        nullable=True,
        doc="Température pack (°C x10)"
    )
    
    temp_cell_min = Column(
        Integer, 
        nullable=True,
        doc="Température cellule minimum (°C x10)"
    )
    
    temp_cell_max = Column(
        Integer, 
        nullable=True,
        doc="Température cellule maximum (°C x10)"
    )
    
    temp_cell_avg = Column(
        Integer, 
        nullable=True,
        doc="Température cellule moyenne (°C x10)"
    )
    
    temp_ambient = Column(
        Integer, 
        nullable=True,
        doc="Température ambiante (°C x10)"
    )
    
    # === Puissance et énergie ===
    
    pack_power = Column(
        Float, 
        nullable=True,
        doc="Puissance instantanée (W, positif = charge)"
    )
    
    energy_charged = Column(
        Float, 
        nullable=True,
        doc="Énergie chargée cumulée (Wh)"
    )
    
    energy_discharged = Column(
        Float, 
        nullable=True,
        doc="Énergie déchargée cumulée (Wh)"
    )
    
    # === Cycles et durée de vie ===
    
    cycle_count = Column(
        Integer, 
        nullable=True,
        doc="Nombre de cycles total"
    )
    
    operating_time = Column(
        Integer, 
        nullable=True,
        doc="Temps de fonctionnement total (heures)"
    )
    
    # === États et statuts BMS ===
    
    is_charging = Column(Boolean, nullable=True, doc="En charge")
    is_discharging = Column(Boolean, nullable=True, doc="En décharge")
    is_balancing = Column(Boolean, nullable=True, doc="Équilibrage actif")
    
    protection_status = Column(
        Integer, 
        nullable=True,
        doc="Statut protections (bitfield)"
    )
    
    fault_codes = Column(
        String(100), 
        nullable=True,
        doc="Codes d'erreur BMS"
    )
    
    # === Données détaillées (JSON) ===
    
    cell_voltages = Column(
        JSONB, 
        nullable=True,
        doc="Tensions individuelles des cellules (mV)"
    )
    
    cell_temperatures = Column(
        JSONB, 
        nullable=True,
        doc="Températures individuelles des cellules (°C x10)"
    )
    
    balancer_status = Column(
        JSONB, 
        nullable=True,
        doc="État des équilibreurs par cellule"
    )
    
    # === Métadonnées collecte ===
    
    collection_quality = Column(
        Integer, 
        default=100,
        nullable=False,
        doc="Qualité de la collecte (%)"
    )
    
    collection_latency_ms = Column(
        Integer, 
        nullable=True,
        doc="Latence de collecte (ms)"
    )
    
    bms_firmware_version = Column(
        String(20), 
        nullable=True,
        doc="Version firmware BMS"
    )
    
    # Relations
    battery = relationship("Battery", back_populates="bms_data")
    
    __table_args__ = (
        # Index pour requêtes temps réel (batterie + timestamp récent)
        Index("idx_bms_data_battery_recent", "battery_id", "measurement_timestamp"),
        # Index pour queries de plage temporelle
        Index("idx_bms_data_timestamp", "measurement_timestamp"),
        # Index composite pour alertes
        Index("idx_bms_data_alerts", "battery_id", "pack_voltage", "soc", "temp_pack"),
        # Partition par client pour performance
        Index("idx_bms_data_client_time", "client_id", "measurement_timestamp"),
    )
    
    # === Propriétés calculées ===
    
    @hybrid_property
    def pack_voltage_v(self):
        """Tension pack en volts"""
        return self.pack_voltage / 1000.0 if self.pack_voltage else None
    
    @hybrid_property
    def pack_current_a(self):
        """Courant pack en ampères"""
        return self.pack_current / 1000.0 if self.pack_current else None
    
    @hybrid_property
    def temp_pack_c(self):
        """Température pack en °C"""
        return self.temp_pack / 10.0 if self.temp_pack else None
    
    @hybrid_property
    def cell_voltage_delta_mv(self):
        """Delta de tension entre cellules (mV)"""
        if self.cell_voltage_max and self.cell_voltage_min:
            return self.cell_voltage_max - self.cell_voltage_min
        return None
    
    @hybrid_property
    def is_healthy(self):
        """Évaluation rapide de l'état de santé"""
        # Critères de base pour considérer la batterie saine
        if self.fault_codes:
            return False
        if self.soc is not None and self.soc < 5:
            return False
        if self.soh is not None and self.soh < 70:
            return False
        return True
    
    def get_cell_voltages(self) -> list:
        """Récupère les tensions cellules individuelles"""
        return self.cell_voltages or []
    
    def get_cell_temperatures(self) -> list:
        """Récupère les températures cellules individuelles"""
        return self.cell_temperatures or []
    
    def get_protection_flags(self) -> list:
        """Décode les flags de protection"""
        if not self.protection_status:
            return []
        
        flags = []
        status = self.protection_status
        
        # Définition des bits (exemple générique)
        protection_bits = {
            0: "Overvoltage",
            1: "Undervoltage", 
            2: "Overcurrent_Charge",
            3: "Overcurrent_Discharge",
            4: "Overtemperature",
            5: "Undertemperature",
            6: "Cell_Imbalance",
            7: "Communication_Error"
        }
        
        for bit, description in protection_bits.items():
            if status & (1 << bit):
                flags.append(description)
        
        return flags
    
    def __repr__(self):
        return f"<BMSData(battery_id={self.battery_id}, timestamp={self.measurement_timestamp}, soc={self.soc}%)>"


class BMSDataHistory(TimestampMixin, TenantMixin, UUIDMixin):
    """
    Données BMS historiques agrégées
    Pour requêtes statistiques et rapports
    """
    __tablename__ = "bms_data_history"
    
    # Relation batterie
    battery_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("batteries.id"), 
        nullable=False,
        index=True
    )
    
    # Période d'agrégation
    period_start = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        index=True,
        doc="Début de période"
    )
    
    period_end = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        index=True,
        doc="Fin de période"
    )
    
    aggregation_level = Column(
        String(10),
        nullable=False,
        doc="Niveau agrégation (hour, day, week, month)"
    )
    
    # Statistiques agrégées
    soc_min = Column(Integer, nullable=True)
    soc_max = Column(Integer, nullable=True)
    soc_avg = Column(Float, nullable=True)
    
    soh_min = Column(Integer, nullable=True)
    soh_max = Column(Integer, nullable=True)
    soh_avg = Column(Float, nullable=True)
    
    voltage_min = Column(Integer, nullable=True)
    voltage_max = Column(Integer, nullable=True)
    voltage_avg = Column(Float, nullable=True)
    
    current_min = Column(Integer, nullable=True)
    current_max = Column(Integer, nullable=True)
    current_avg = Column(Float, nullable=True)
    
    temp_min = Column(Integer, nullable=True)
    temp_max = Column(Integer, nullable=True)
    temp_avg = Column(Float, nullable=True)
    
    # Totaux cumulés sur la période
    energy_charged_total = Column(Float, nullable=True)
    energy_discharged_total = Column(Float, nullable=True)
    cycles_completed = Column(Integer, nullable=True)
    
    # Compteurs d'événements
    alert_count = Column(Integer, default=0)
    critical_alert_count = Column(Integer, default=0)
    data_points = Column(Integer, nullable=False, doc="Nombre de mesures agrégées")
    
    __table_args__ = (
        Index("idx_history_battery_period", "battery_id", "aggregation_level", "period_start"),
        Index("idx_history_client_period", "client_id", "period_start"),
    )


class Alert(BaseEntity):
    """
    Alertes générées automatiquement ou manuellement
    Système de notification et suivi
    """
    __tablename__ = "alerts"
    
    # Relation batterie
    battery_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("batteries.id"), 
        nullable=False,
        index=True
    )
    
    # Classification
    alert_type = Column(
        String(50), 
        nullable=False,
        doc="Type d'alerte (voltage, temperature, soc, soh, fault, etc.)"
    )
    
    severity = Column(
        Enum(AlertSeverity), 
        nullable=False,
        doc="Niveau de sévérité"
    )
    
    status = Column(
        Enum(AlertStatus), 
        default=AlertStatus.ACTIVE,
        nullable=False,
        doc="Statut de l'alerte"
    )
    
    # Contenu
    title = Column(
        String(200), 
        nullable=False,
        doc="Titre de l'alerte"
    )
    
    message = Column(
        Text, 
        nullable=False,
        doc="Description détaillée"
    )
    
    # Horodatages
    triggered_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        index=True,
        doc="Moment du déclenchement"
    )
    
    acknowledged_at = Column(
        TIMESTAMP(timezone=True),
        nullable=True,
        doc="Moment de l'accusé réception"
    )
    
    resolved_at = Column(
        TIMESTAMP(timezone=True),
        nullable=True,
        doc="Moment de la résolution"
    )
    
    # Données contextuelles
    trigger_value = Column(
        Float, 
        nullable=True,
        doc="Valeur ayant déclenché l'alerte"
    )
    
    threshold_value = Column(
        Float, 
        nullable=True,
        doc="Seuil configuré"
    )
    
    bms_data_snapshot = Column(
        JSONB, 
        nullable=True,
        doc="Snapshot des données BMS au moment de l'alerte"
    )
    
    # Gestion
    acknowledged_by = Column(
        UUID(as_uuid=True),
        nullable=True,
        doc="Utilisateur ayant accusé réception"
    )
    
    resolved_by = Column(
        UUID(as_uuid=True),
        nullable=True,
        doc="Utilisateur ayant résolu"
    )
    
    auto_resolved = Column(
        Boolean, 
        default=False,
        nullable=False,
        doc="Résolution automatique"
    )
    
    # Notifications
    email_sent = Column(
        Boolean, 
        default=False,
        nullable=False,
        doc="Email de notification envoyé"
    )
    
    sms_sent = Column(
        Boolean, 
        default=False,
        nullable=False,
        doc="SMS envoyé"
    )
    
    notification_count = Column(
        Integer, 
        default=0,
        nullable=False,
        doc="Nombre de notifications envoyées"
    )
    
    # Relations
    battery = relationship("Battery", back_populates="alerts")
    
    __table_args__ = (
        Index("idx_alerts_battery_active", "battery_id", "status"),
        Index("idx_alerts_severity_time", "severity", "triggered_at"),
        Index("idx_alerts_client_active", "client_id", "status"),
        Index("idx_alerts_type", "alert_type"),
    )
    
    @hybrid_property
    def is_active(self):
        """Alerte encore active"""
        return self.status == AlertStatus.ACTIVE
    
    @hybrid_property
    def duration_minutes(self):
        """Durée de l'alerte en minutes"""
        end_time = self.resolved_at or datetime.utcnow()
        delta = end_time - self.triggered_at
        return int(delta.total_seconds() / 60)
    
    def acknowledge(self, user_id: str = None):
        """Accuse réception de l'alerte"""
        self.status = AlertStatus.ACKNOWLEDGED
        self.acknowledged_at = func.now()
        if user_id:
            self.acknowledged_by = user_id
    
    def resolve(self, user_id: str = None, auto: bool = False):
        """Résout l'alerte"""
        self.status = AlertStatus.RESOLVED
        self.resolved_at = func.now()
        self.auto_resolved = auto
        if user_id:
            self.resolved_by = user_id
    
    def __repr__(self):
        return f"<Alert(type='{self.alert_type}', severity='{self.severity.value}', status='{self.status.value}')>"


class MaintenanceLog(BaseEntity):
    """
    Journal de maintenance des batteries
    Suivi des interventions et historique
    """
    __tablename__ = "maintenance_logs"
    
    # Relation batterie
    battery_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("batteries.id"), 
        nullable=False,
        index=True
    )
    
    # Classification
    maintenance_type = Column(
        Enum(MaintenanceType), 
        nullable=False,
        doc="Type de maintenance"
    )
    
    # Planification
    scheduled_date = Column(
        TIMESTAMP(timezone=True),
        nullable=True,
        doc="Date planifiée"
    )
    
    performed_date = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        index=True,
        doc="Date d'exécution"
    )
    
    # Personnel
    technician_name = Column(
        String(100), 
        nullable=True,
        doc="Nom du technicien"
    )
    
    technician_company = Column(
        String(100), 
        nullable=True,
        doc="Entreprise du technicien"
    )
    
    performed_by_user = Column(
        UUID(as_uuid=True),
        nullable=True,
        doc="Utilisateur système ayant saisi l'intervention"
    )
    
    # Intervention
    title = Column(
        String(200), 
        nullable=False,
        doc="Titre de l'intervention"
    )
    
    description = Column(
        Text, 
        nullable=False,
        doc="Description détaillée des travaux"
    )
    
    parts_replaced = Column(
        Text, 
        nullable=True,
        doc="Pièces remplacées"
    )
    
    # Durée et coût
    duration_hours = Column(
        Float, 
        nullable=True,
        doc="Durée en heures"
    )
    
    cost = Column(
        Float, 
        nullable=True,
        doc="Coût total (CAD)"
    )
    
    # État avant/après
    condition_before = Column(
        String(20), 
        nullable=True,
        doc="État avant (excellent, good, fair, poor, critical)"
    )
    
    condition_after = Column(
        String(20), 
        nullable=True,
        doc="État après maintenance"
    )
    
    # Métriques avant/après
    soh_before = Column(Integer, nullable=True, doc="SOH avant (%)")
    soh_after = Column(Integer, nullable=True, doc="SOH après (%)")
    
    capacity_before = Column(Float, nullable=True, doc="Capacité avant (Ah)")
    capacity_after = Column(Float, nullable=True, doc="Capacité après (Ah)")
    
    # Suivi
    next_maintenance_date = Column(
        TIMESTAMP(timezone=True),
        nullable=True,
        doc="Prochaine maintenance recommandée"
    )
    
    warranty_impact = Column(
        Boolean, 
        default=False,
        nullable=False,
        doc="Impact sur la garantie"
    )
    
    # Documents
    photos = Column(
        JSONB, 
        nullable=True,
        doc="URLs des photos"
    )
    
    documents = Column(
        JSONB, 
        nullable=True,
        doc="URLs des documents"
    )
    
    # Relations
    battery = relationship("Battery", back_populates="maintenance_logs")
    
    __table_args__ = (
        Index("idx_maintenance_battery_date", "battery_id", "performed_date"),
        Index("idx_maintenance_type", "maintenance_type"),
        Index("idx_maintenance_technician", "technician_name"),
        Index("idx_maintenance_client_date", "client_id", "performed_date"),
    )
    
    @hybrid_property
    def soh_improvement(self):
        """Amélioration du SOH suite à la maintenance"""
        if self.soh_before and self.soh_after:
            return self.soh_after - self.soh_before
        return None
    
    @hybrid_property
    def capacity_recovery(self):
        """Récupération de capacité suite à la maintenance"""
        if self.capacity_before and self.capacity_after:
            return self.capacity_after - self.capacity_before
        return None
    
    def get_photos(self) -> list:
        """Récupère la liste des photos"""
        return self.photos or []
    
    def get_documents(self) -> list:
        """Récupère la liste des documents"""
        return self.documents or []
    
    def __repr__(self):
        return f"<MaintenanceLog(battery_id={self.battery_id}, type='{self.maintenance_type.value}', date='{self.performed_date}')>"