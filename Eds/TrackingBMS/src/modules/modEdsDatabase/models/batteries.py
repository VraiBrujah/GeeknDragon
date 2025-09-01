"""
Modèles pour la gestion hiérarchique des batteries
Structure: Types → Lieux → Batteries → Champs personnalisés
"""

from sqlalchemy import Column, String, Boolean, Text, Integer, Float, ForeignKey, UniqueConstraint, Index, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.hybrid import hybrid_property
import enum

from .base import BaseEntity


class BatteryChemistry(enum.Enum):
    """Types de chimie de batterie supportés"""
    LITHIUM_ION = "Li-ion"
    LITHIUM_IRON_PHOSPHATE = "LiFePO4" 
    LITHIUM_POLYMER = "Li-Po"
    NICKEL_METAL_HYDRIDE = "NiMH"
    LEAD_ACID = "Lead-Acid"
    SODIUM_ION = "Na-ion"
    OTHER = "Other"


class BatteryStatus(enum.Enum):
    """Statuts possibles d'une batterie"""
    ACTIVE = "active"
    MAINTENANCE = "maintenance"
    FAULTY = "faulty"
    DECOMMISSIONED = "decommissioned"
    UNKNOWN = "unknown"


class BatteryType(BaseEntity):
    """
    Types de batteries configurables par client
    Définit les caractéristiques techniques communes
    """
    __tablename__ = "battery_types"
    
    # Informations de base
    name = Column(
        String(100), 
        nullable=False,
        doc="Nom du type de batterie"
    )
    
    slug = Column(
        String(50), 
        nullable=False,
        doc="Identifiant URL-friendly"
    )
    
    chemistry = Column(
        Enum(BatteryChemistry), 
        nullable=False,
        doc="Chimie de la batterie"
    )
    
    manufacturer = Column(
        String(100), 
        nullable=True,
        doc="Fabricant"
    )
    
    model = Column(
        String(100), 
        nullable=True,
        doc="Modèle"
    )
    
    # Spécifications électriques
    nominal_voltage = Column(
        Float, 
        nullable=False,
        doc="Tension nominale (V)"
    )
    
    nominal_capacity = Column(
        Float, 
        nullable=False,
        doc="Capacité nominale (Ah)"
    )
    
    max_charge_current = Column(
        Float, 
        nullable=True,
        doc="Courant de charge max (A)"
    )
    
    max_discharge_current = Column(
        Float, 
        nullable=True,
        doc="Courant de décharge max (A)"
    )
    
    # Spécifications physiques
    cell_count = Column(
        Integer, 
        nullable=True,
        doc="Nombre de cellules"
    )
    
    weight_kg = Column(
        Float, 
        nullable=True,
        doc="Poids (kg)"
    )
    
    # Limites opérationnelles
    temp_min = Column(
        Integer, 
        default=-10,
        nullable=False,
        doc="Température minimum (°C)"
    )
    
    temp_max = Column(
        Integer, 
        default=60,
        nullable=False,
        doc="Température maximum (°C)"
    )
    
    voltage_min = Column(
        Integer, 
        nullable=False,
        doc="Tension minimum (mV)"
    )
    
    voltage_max = Column(
        Integer, 
        nullable=False,
        doc="Tension maximum (mV)"
    )
    
    soc_critical = Column(
        Integer, 
        default=10,
        nullable=False,
        doc="Seuil SOC critique (%)"
    )
    
    soh_critical = Column(
        Integer, 
        default=70,
        nullable=False,
        doc="Seuil SOH critique (%)"
    )
    
    # Configuration BMS
    bms_protocol = Column(
        String(50), 
        nullable=True,
        doc="Protocole BMS (ModBus, CAN, ThingSet, etc.)"
    )
    
    bms_config = Column(
        JSONB, 
        nullable=True,
        doc="Configuration BMS spécifique"
    )
    
    # Cycle de vie
    expected_cycles = Column(
        Integer, 
        nullable=True,
        doc="Cycles de vie attendus"
    )
    
    warranty_months = Column(
        Integer, 
        nullable=True,
        doc="Garantie (mois)"
    )
    
    # Relations
    locations = relationship("Location", back_populates="battery_type")
    batteries = relationship("Battery", back_populates="battery_type")
    
    __table_args__ = (
        UniqueConstraint("client_id", "slug", name="unique_client_battery_type_slug"),
        Index("idx_battery_type_chemistry", "chemistry"),
        Index("idx_battery_type_active", "client_id", "is_deleted"),
    )
    
    @hybrid_property
    def energy_capacity(self):
        """Capacité énergétique (Wh)"""
        return self.nominal_voltage * self.nominal_capacity
    
    @hybrid_property
    def power_rating(self):
        """Puissance nominale (W) - basée sur décharge"""
        if self.max_discharge_current:
            return self.nominal_voltage * self.max_discharge_current
        return None
    
    def get_bms_config(self) -> dict:
        """Récupère la configuration BMS"""
        return self.bms_config or {}
    
    def __repr__(self):
        return f"<BatteryType(name='{self.name}', chemistry='{self.chemistry.value}')>"


class Location(BaseEntity):
    """
    Lieux d'installation des batteries
    Hiérarchie géographique par client
    """
    __tablename__ = "locations"
    
    # Informations de base
    name = Column(
        String(100), 
        nullable=False,
        doc="Nom du lieu"
    )
    
    slug = Column(
        String(50), 
        nullable=False,
        doc="Identifiant URL-friendly"
    )
    
    # Relation type de batterie
    battery_type_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("battery_types.id"), 
        nullable=False,
        index=True
    )
    
    # Informations géographiques
    address_line1 = Column(String(255), nullable=True)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state_province = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    country = Column(String(2), default="CA", nullable=False)
    
    # Coordonnées GPS
    latitude = Column(
        Float, 
        nullable=True,
        doc="Latitude GPS"
    )
    
    longitude = Column(
        Float, 
        nullable=True,
        doc="Longitude GPS"
    )
    
    altitude = Column(
        Float, 
        nullable=True,
        doc="Altitude (m)"
    )
    
    # Informations environnementales
    indoor = Column(
        Boolean, 
        default=True, 
        nullable=False,
        doc="Installation intérieure"
    )
    
    climate_controlled = Column(
        Boolean, 
        default=False, 
        nullable=False,
        doc="Climat contrôlé"
    )
    
    # Contact et maintenance
    contact_person = Column(
        String(100), 
        nullable=True,
        doc="Personne de contact sur site"
    )
    
    contact_phone = Column(
        String(20), 
        nullable=True,
        doc="Téléphone contact"
    )
    
    contact_email = Column(
        String(255), 
        nullable=True,
        doc="Email contact"
    )
    
    # Configuration technique
    timezone = Column(
        String(50), 
        nullable=True,
        doc="Fuseau horaire local (optionnel, sinon client.timezone)"
    )
    
    power_grid_connection = Column(
        Boolean, 
        default=True, 
        nullable=False,
        doc="Connexion réseau électrique"
    )
    
    backup_power = Column(
        Boolean, 
        default=False, 
        nullable=False,
        doc="Alimentation de secours disponible"
    )
    
    # Relations
    battery_type = relationship("BatteryType", back_populates="locations")
    batteries = relationship("Battery", back_populates="location")
    
    __table_args__ = (
        UniqueConstraint("client_id", "battery_type_id", "slug", name="unique_client_location_slug"),
        Index("idx_location_coords", "latitude", "longitude"),
        Index("idx_location_active", "client_id", "is_deleted"),
    )
    
    @hybrid_property
    def full_address(self):
        """Adresse complète formatée"""
        parts = [
            self.address_line1,
            self.address_line2, 
            self.city,
            self.state_province,
            self.postal_code
        ]
        return ", ".join(part for part in parts if part)
    
    @hybrid_property
    def has_coordinates(self):
        """Vérifie si les coordonnées GPS sont définies"""
        return self.latitude is not None and self.longitude is not None
    
    def __repr__(self):
        return f"<Location(name='{self.name}', battery_type='{self.battery_type.name if self.battery_type else 'Unknown'}')>"


class Battery(BaseEntity):
    """
    Batterie individuelle avec données BMS
    Entité principale pour collecte de données
    """
    __tablename__ = "batteries"
    
    # Informations de base
    name = Column(
        String(100), 
        nullable=False,
        doc="Nom de la batterie"
    )
    
    serial_number = Column(
        String(50), 
        nullable=True,
        doc="Numéro de série fabricant"
    )
    
    # Relations hiérarchiques
    location_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("locations.id"), 
        nullable=False,
        index=True
    )
    
    battery_type_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("battery_types.id"), 
        nullable=False,
        index=True
    )
    
    # Statut et configuration
    status = Column(
        Enum(BatteryStatus), 
        default=BatteryStatus.ACTIVE,
        nullable=False,
        doc="Statut opérationnel"
    )
    
    is_monitored = Column(
        Boolean, 
        default=True, 
        nullable=False,
        doc="Monitoring BMS actif"
    )
    
    # Informations d'installation
    installation_date = Column(
        String(10), 
        nullable=True,
        doc="Date d'installation (YYYY-MM-DD)"
    )
    
    commissioning_date = Column(
        String(10), 
        nullable=True,
        doc="Date de mise en service (YYYY-MM-DD)"
    )
    
    warranty_expiry = Column(
        String(10), 
        nullable=True,
        doc="Fin de garantie (YYYY-MM-DD)"
    )
    
    # Configuration BMS spécifique
    bms_address = Column(
        String(50), 
        nullable=True,
        doc="Adresse BMS (IP, Modbus ID, etc.)"
    )
    
    bms_port = Column(
        Integer, 
        nullable=True,
        doc="Port de communication BMS"
    )
    
    collection_interval = Column(
        Integer, 
        nullable=True,
        doc="Intervalle collecte spécifique (secondes, NULL = défaut client)"
    )
    
    # Seuils d'alerte personnalisés (NULL = utiliser type)
    voltage_min_custom = Column(Integer, nullable=True)
    voltage_max_custom = Column(Integer, nullable=True)
    current_max_custom = Column(Integer, nullable=True)
    temp_min_custom = Column(Integer, nullable=True)
    temp_max_custom = Column(Integer, nullable=True)
    soc_critical_custom = Column(Integer, nullable=True)
    soh_critical_custom = Column(Integer, nullable=True)
    
    # Configuration avancée
    bms_config_override = Column(
        JSONB, 
        nullable=True,
        doc="Configuration BMS spécifique à cette batterie"
    )
    
    # Relations
    location = relationship("Location", back_populates="batteries")
    battery_type = relationship("BatteryType", back_populates="batteries")
    custom_fields = relationship("CustomField", back_populates="battery")
    bms_data = relationship("BMSData", back_populates="battery")
    alerts = relationship("Alert", back_populates="battery")
    maintenance_logs = relationship("MaintenanceLog", back_populates="battery")
    
    __table_args__ = (
        UniqueConstraint("client_id", "serial_number", name="unique_client_battery_serial"),
        Index("idx_battery_status", "status"),
        Index("idx_battery_monitored", "is_monitored"),
        Index("idx_battery_location", "location_id"),
        Index("idx_battery_type", "battery_type_id"),
        Index("idx_battery_active", "client_id", "is_deleted"),
    )
    
    @hybrid_property
    def effective_voltage_min(self):
        """Tension min effective (custom ou type)"""
        return self.voltage_min_custom or self.battery_type.voltage_min
    
    @hybrid_property
    def effective_voltage_max(self):
        """Tension max effective (custom ou type)"""
        return self.voltage_max_custom or self.battery_type.voltage_max
    
    @hybrid_property
    def effective_collection_interval(self):
        """Intervalle de collecte effectif"""
        if self.collection_interval:
            return self.collection_interval
        # Fallback sur config client (à implémenter via relation)
        return 5  # Défaut 5 secondes
    
    def get_effective_thresholds(self) -> dict:
        """Récupère tous les seuils effectifs"""
        return {
            "voltage_min": self.voltage_min_custom or self.battery_type.voltage_min,
            "voltage_max": self.voltage_max_custom or self.battery_type.voltage_max,
            "current_max": self.current_max_custom or self.battery_type.max_discharge_current,
            "temp_min": self.temp_min_custom or self.battery_type.temp_min,
            "temp_max": self.temp_max_custom or self.battery_type.temp_max,
            "soc_critical": self.soc_critical_custom or self.battery_type.soc_critical,
            "soh_critical": self.soh_critical_custom or self.battery_type.soh_critical,
        }
    
    def get_bms_config(self) -> dict:
        """Configuration BMS effective (override + type)"""
        base_config = self.battery_type.get_bms_config()
        if self.bms_config_override:
            base_config.update(self.bms_config_override)
        return base_config
    
    def __repr__(self):
        return f"<Battery(name='{self.name}', serial='{self.serial_number}', status='{self.status.value}')>"


class CustomField(BaseEntity):
    """
    Champs personnalisés configurables par batterie
    Permet l'extension des données selon les besoins client
    """
    __tablename__ = "custom_fields"
    
    # Relation batterie
    battery_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("batteries.id"), 
        nullable=False,
        index=True
    )
    
    # Définition du champ
    field_name = Column(
        String(100), 
        nullable=False,
        doc="Nom du champ personnalisé"
    )
    
    field_type = Column(
        String(20), 
        nullable=False,
        doc="Type de données (text, number, boolean, date, select)"
    )
    
    field_value = Column(
        Text, 
        nullable=True,
        doc="Valeur du champ"
    )
    
    # Options pour champs select
    field_options = Column(
        Text, 
        nullable=True,
        doc="Options possibles (JSON array pour select)"
    )
    
    # Métadonnées
    display_order = Column(
        Integer, 
        default=0,
        nullable=False,
        doc="Ordre d'affichage"
    )
    
    is_required = Column(
        Boolean, 
        default=False,
        nullable=False,
        doc="Champ obligatoire"
    )
    
    is_searchable = Column(
        Boolean, 
        default=True,
        nullable=False,
        doc="Champ recherchable"
    )
    
    # Relation
    battery = relationship("Battery", back_populates="custom_fields")
    
    __table_args__ = (
        UniqueConstraint("battery_id", "field_name", name="unique_battery_custom_field"),
        Index("idx_custom_field_searchable", "field_name", "is_searchable"),
    )
    
    def get_typed_value(self):
        """Récupère la valeur avec le bon type Python"""
        if not self.field_value:
            return None
            
        if self.field_type == "number":
            try:
                return float(self.field_value) if "." in self.field_value else int(self.field_value)
            except ValueError:
                return None
        elif self.field_type == "boolean":
            return self.field_value.lower() in ("true", "1", "yes", "on")
        elif self.field_type == "date":
            # Retourner comme string ISO, parsing côté client
            return self.field_value
        else:
            return self.field_value
    
    def get_options(self) -> list:
        """Récupère les options pour champs select"""
        if not self.field_options:
            return []
        
        try:
            import json
            return json.loads(self.field_options)
        except (json.JSONDecodeError, TypeError):
            return []
    
    def set_options(self, options: list):
        """Définit les options pour champs select"""
        import json
        self.field_options = json.dumps(options)
    
    def __repr__(self):
        return f"<CustomField(battery_id={self.battery_id}, name='{self.field_name}', type='{self.field_type}')>"