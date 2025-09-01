"""
Modèles pour la gestion des clients multi-tenant
Architecture avec isolation par Row-Level Security
"""

from sqlalchemy import Column, String, Boolean, Text, Integer, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.hybrid import hybrid_property

from .base import BaseConfig, BaseEntity


class Client(BaseConfig):
    """
    Client principal du système multi-tenant
    Chaque client a ses propres données isolées par RLS
    """
    __tablename__ = "clients"
    
    # Informations de base
    name = Column(
        String(100), 
        nullable=False, 
        doc="Nom du client"
    )
    
    slug = Column(
        String(50), 
        nullable=False, 
        unique=True, 
        index=True,
        doc="Identifiant URL-friendly unique"
    )
    
    email = Column(
        String(255), 
        nullable=False,
        doc="Email de contact principal"
    )
    
    phone = Column(
        String(20), 
        nullable=True,
        doc="Téléphone"
    )
    
    # Statut et configuration
    is_active = Column(
        Boolean, 
        default=True, 
        nullable=False,
        doc="Client actif"
    )
    
    subscription_plan = Column(
        String(50), 
        default="basic", 
        nullable=False,
        doc="Plan d'abonnement (basic, pro, enterprise)"
    )
    
    max_batteries = Column(
        Integer, 
        default=100, 
        nullable=False,
        doc="Limite nombre de batteries"
    )
    
    max_users = Column(
        Integer, 
        default=10, 
        nullable=False,
        doc="Limite nombre d'utilisateurs"
    )
    
    # Adresse
    address_line1 = Column(String(255), nullable=True)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state_province = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    country = Column(String(2), default="CA", nullable=False)  # ISO 3166-1
    
    # Configuration technique
    timezone = Column(
        String(50), 
        default="America/Toronto", 
        nullable=False,
        doc="Fuseau horaire du client"
    )
    
    locale = Column(
        String(10), 
        default="fr_CA", 
        nullable=False,
        doc="Langue et région"
    )
    
    # Relations
    users = relationship("ClientUser", back_populates="client")
    config = relationship("ClientConfig", back_populates="client", uselist=False)
    
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
    
    def __repr__(self):
        return f"<Client(slug='{self.slug}', name='{self.name}')>"


class ClientUser(BaseConfig):
    """
    Utilisateurs liés à un client spécifique
    Gestion des rôles et permissions par client
    """
    __tablename__ = "client_users"
    
    # Relations
    client_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("clients.id"), 
        nullable=False,
        index=True
    )
    
    user_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("users.id"), 
        nullable=False,
        index=True
    )
    
    # Informations utilisateur
    role = Column(
        String(50), 
        default="viewer", 
        nullable=False,
        doc="Rôle dans ce client (admin, manager, operator, viewer)"
    )
    
    is_active = Column(
        Boolean, 
        default=True, 
        nullable=False,
        doc="Utilisateur actif pour ce client"
    )
    
    # Permissions spécifiques
    can_create_batteries = Column(Boolean, default=False)
    can_edit_batteries = Column(Boolean, default=False)
    can_delete_batteries = Column(Boolean, default=False)
    can_view_all_batteries = Column(Boolean, default=True)
    can_export_data = Column(Boolean, default=False)
    can_manage_users = Column(Boolean, default=False)
    can_configure_alerts = Column(Boolean, default=False)
    
    # Restrictions
    allowed_battery_types = Column(
        Text, 
        nullable=True,
        doc="Types de batteries autorisés (JSON array)"
    )
    
    allowed_locations = Column(
        Text, 
        nullable=True,
        doc="Lieux autorisés (JSON array)"
    )
    
    # Relations
    client = relationship("Client", back_populates="users")
    user = relationship("User")
    
    __table_args__ = (
        UniqueConstraint("client_id", "user_id", name="unique_client_user"),
        Index("idx_client_user_active", "client_id", "is_active"),
    )
    
    @hybrid_property
    def permissions(self):
        """Liste des permissions actives"""
        perms = []
        if self.can_create_batteries:
            perms.append("create_batteries")
        if self.can_edit_batteries:
            perms.append("edit_batteries")
        if self.can_delete_batteries:
            perms.append("delete_batteries")
        if self.can_view_all_batteries:
            perms.append("view_all_batteries")
        if self.can_export_data:
            perms.append("export_data")
        if self.can_manage_users:
            perms.append("manage_users")
        if self.can_configure_alerts:
            perms.append("configure_alerts")
        return perms
    
    def has_permission(self, permission: str) -> bool:
        """Vérifie si l'utilisateur a une permission"""
        return permission in self.permissions


class ClientConfig(BaseConfig):
    """
    Configuration personnalisée par client
    Paramètres et préférences spécifiques
    """
    __tablename__ = "client_configs"
    
    # Relation client (1:1)
    client_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("clients.id"), 
        nullable=False,
        unique=True,
        index=True
    )
    
    # Configuration interface
    theme = Column(
        String(20), 
        default="light", 
        nullable=False,
        doc="Thème interface (light, dark, auto)"
    )
    
    logo_url = Column(
        String(500), 
        nullable=True,
        doc="URL du logo client"
    )
    
    brand_color = Column(
        String(7), 
        default="#0066CC", 
        nullable=False,
        doc="Couleur de marque (hex)"
    )
    
    # Configuration BMS
    default_collection_interval = Column(
        Integer, 
        default=5, 
        nullable=False,
        doc="Intervalle collecte données BMS (secondes)"
    )
    
    retention_days = Column(
        Integer, 
        default=365, 
        nullable=False,
        doc="Rétention données historiques (jours)"
    )
    
    # Alertes et notifications
    email_notifications = Column(
        Boolean, 
        default=True, 
        nullable=False,
        doc="Notifications par email activées"
    )
    
    sms_notifications = Column(
        Boolean, 
        default=False, 
        nullable=False,
        doc="Notifications SMS activées"
    )
    
    alert_email = Column(
        String(255), 
        nullable=True,
        doc="Email pour les alertes (par défaut = client.email)"
    )
    
    alert_phone = Column(
        String(20), 
        nullable=True,
        doc="Téléphone pour SMS alertes"
    )
    
    # Seuils d'alerte par défaut
    default_voltage_min = Column(Integer, default=3200)  # mV
    default_voltage_max = Column(Integer, default=4200)  # mV
    default_current_max = Column(Integer, default=10000)  # mA
    default_temp_min = Column(Integer, default=-10)  # °C
    default_temp_max = Column(Integer, default=60)   # °C
    default_soc_min = Column(Integer, default=10)    # %
    default_soh_min = Column(Integer, default=80)    # %
    
    # Configuration export/rapport
    default_export_format = Column(
        String(10), 
        default="csv", 
        nullable=False,
        doc="Format d'export par défaut (csv, xlsx, pdf)"
    )
    
    report_frequency = Column(
        String(20), 
        default="weekly", 
        nullable=False,
        doc="Fréquence rapports automatiques (daily, weekly, monthly, none)"
    )
    
    # Champs personnalisés globaux
    custom_fields_config = Column(
        JSONB, 
        nullable=True,
        doc="Configuration des champs personnalisés"
    )
    
    # Paramètres avancés
    enable_predictive_analytics = Column(
        Boolean, 
        default=False, 
        nullable=False,
        doc="Analytics prédictives activées"
    )
    
    api_rate_limit = Column(
        Integer, 
        default=1000, 
        nullable=False,
        doc="Limite requêtes API par heure"
    )
    
    # Relation
    client = relationship("Client", back_populates="config")
    
    @hybrid_property 
    def effective_alert_email(self):
        """Email d'alerte effectif (config ou client)"""
        return self.alert_email or self.client.email
    
    def get_custom_fields_config(self) -> dict:
        """Récupère la configuration des champs personnalisés"""
        return self.custom_fields_config or {}
    
    def set_custom_fields_config(self, config: dict):
        """Définit la configuration des champs personnalisés"""
        self.custom_fields_config = config
    
    def __repr__(self):
        return f"<ClientConfig(client_id={self.client_id})>"