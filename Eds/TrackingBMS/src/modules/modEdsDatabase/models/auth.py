"""
Modèles d'authentification et autorisation
Gestion des utilisateurs, rôles et permissions
"""

from sqlalchemy import Column, String, Boolean, ForeignKey, Table, Index, Integer, DateTime, Text, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property

from .base import BaseConfig


# Table d'association pour les permissions des rôles (many-to-many)
role_permissions = Table(
    'role_permissions',
    BaseConfig.metadata,
    Column('role_id', UUID(as_uuid=True), ForeignKey('roles.id'), primary_key=True),
    Column('permission_id', UUID(as_uuid=True), ForeignKey('permissions.id'), primary_key=True)
)


class User(BaseConfig):
    """
    Utilisateur système global
    Peut avoir accès à plusieurs clients
    """
    __tablename__ = "users"
    
    # Informations de base
    username = Column(
        String(50), 
        nullable=False, 
        unique=True, 
        index=True,
        doc="Nom d'utilisateur unique"
    )
    
    email = Column(
        String(255), 
        nullable=False, 
        unique=True, 
        index=True,
        doc="Adresse email"
    )
    
    first_name = Column(
        String(50), 
        nullable=False,
        doc="Prénom"
    )
    
    last_name = Column(
        String(50), 
        nullable=False,
        doc="Nom de famille"
    )
    
    # Authentification
    password_hash = Column(
        String(255), 
        nullable=False,
        doc="Hash du mot de passe"
    )
    
    is_active = Column(
        Boolean, 
        default=True, 
        nullable=False,
        doc="Compte actif"
    )
    
    is_superuser = Column(
        Boolean, 
        default=False, 
        nullable=False,
        doc="Super utilisateur (accès système complet)"
    )
    
    is_verified = Column(
        Boolean, 
        default=False, 
        nullable=False,
        doc="Email vérifié"
    )
    
    # Informations contact
    phone = Column(
        String(20), 
        nullable=True,
        doc="Téléphone"
    )
    
    # Préférences
    language = Column(
        String(5), 
        default="fr", 
        nullable=False,
        doc="Langue préférée (fr, en)"
    )
    
    timezone = Column(
        String(50), 
        default="America/Toronto", 
        nullable=False,
        doc="Fuseau horaire"
    )
    
    # Sécurité
    failed_login_attempts = Column(
        Integer, 
        default=0, 
        nullable=False,
        doc="Tentatives de connexion échouées"
    )
    
    locked_until = Column(
        TIMESTAMP(timezone=True),
        nullable=True,
        doc="Compte verrouillé jusqu'à"
    )
    
    last_login = Column(
        TIMESTAMP(timezone=True),
        nullable=True,
        doc="Dernière connexion"
    )
    
    password_changed_at = Column(
        TIMESTAMP(timezone=True),
        nullable=True,
        doc="Dernier changement de mot de passe"
    )
    
    # Relations
    client_users = relationship("ClientUser", back_populates="user")
    
    @hybrid_property
    def full_name(self):
        """Nom complet"""
        return f"{self.first_name} {self.last_name}"
    
    @hybrid_property
    def is_locked(self):
        """Vérifie si le compte est verrouillé"""
        if not self.locked_until:
            return False
        from datetime import datetime
        return datetime.utcnow() < self.locked_until
    
    def verify_password(self, password: str) -> bool:
        """Vérifie le mot de passe"""
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.verify(password, self.password_hash)
    
    def set_password(self, password: str):
        """Définit un nouveau mot de passe"""
        from passlib.context import CryptContext
        from datetime import datetime
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.password_hash = pwd_context.hash(password)
        self.password_changed_at = datetime.utcnow()
    
    def lock_account(self, duration_minutes: int = 30):
        """Verrouille le compte"""
        from datetime import datetime, timedelta
        self.locked_until = datetime.utcnow() + timedelta(minutes=duration_minutes)
    
    def unlock_account(self):
        """Déverrouille le compte"""
        self.locked_until = None
        self.failed_login_attempts = 0
    
    def __repr__(self):
        return f"<User(username='{self.username}', email='{self.email}')>"


class Role(BaseConfig):
    """
    Rôles système pour gestion des permissions
    Définit les niveaux d'accès standards
    """
    __tablename__ = "roles"
    
    # Informations de base
    name = Column(
        String(50), 
        nullable=False, 
        unique=True, 
        index=True,
        doc="Nom du rôle"
    )
    
    slug = Column(
        String(50), 
        nullable=False, 
        unique=True, 
        index=True,
        doc="Identifiant technique"
    )
    
    description = Column(
        String(255), 
        nullable=True,
        doc="Description du rôle"
    )
    
    # Statut
    is_active = Column(
        Boolean, 
        default=True, 
        nullable=False,
        doc="Rôle actif"
    )
    
    is_system = Column(
        Boolean, 
        default=False, 
        nullable=False,
        doc="Rôle système (non modifiable)"
    )
    
    # Niveau hiérarchique (pour héritage)
    level = Column(
        Integer, 
        default=0, 
        nullable=False,
        doc="Niveau hiérarchique (0 = plus élevé)"
    )
    
    # Relations
    permissions = relationship(
        "Permission", 
        secondary=role_permissions, 
        back_populates="roles"
    )
    
    def has_permission(self, permission_slug: str) -> bool:
        """Vérifie si le rôle a une permission"""
        return any(perm.slug == permission_slug for perm in self.permissions)
    
    def __repr__(self):
        return f"<Role(name='{self.name}', level={self.level})>"


class Permission(BaseConfig):
    """
    Permissions granulaires du système
    Actions spécifiques autorisées ou interdites
    """
    __tablename__ = "permissions"
    
    # Informations de base
    name = Column(
        String(100), 
        nullable=False,
        doc="Nom de la permission"
    )
    
    slug = Column(
        String(100), 
        nullable=False, 
        unique=True, 
        index=True,
        doc="Identifiant technique unique"
    )
    
    category = Column(
        String(50), 
        nullable=False,
        doc="Catégorie (system, client, battery, data, etc.)"
    )
    
    description = Column(
        String(255), 
        nullable=True,
        doc="Description de la permission"
    )
    
    # Statut
    is_active = Column(
        Boolean, 
        default=True, 
        nullable=False,
        doc="Permission active"
    )
    
    is_system = Column(
        Boolean, 
        default=False, 
        nullable=False,
        doc="Permission système (critique)"
    )
    
    # Relations
    roles = relationship(
        "Role", 
        secondary=role_permissions, 
        back_populates="permissions"
    )
    
    __table_args__ = (
        Index("idx_permission_category", "category"),
    )
    
    def __repr__(self):
        return f"<Permission(slug='{self.slug}', category='{self.category}')>"


# Permissions par défaut à créer lors de l'initialisation
DEFAULT_PERMISSIONS = [
    # Système
    {"slug": "system.admin", "name": "Administration Système", "category": "system"},
    {"slug": "system.monitoring", "name": "Monitoring Système", "category": "system"},
    {"slug": "system.backup", "name": "Sauvegarde/Restauration", "category": "system"},
    
    # Clients
    {"slug": "client.create", "name": "Créer Client", "category": "client"},
    {"slug": "client.read", "name": "Voir Clients", "category": "client"},
    {"slug": "client.update", "name": "Modifier Client", "category": "client"},
    {"slug": "client.delete", "name": "Supprimer Client", "category": "client"},
    {"slug": "client.config", "name": "Configuration Client", "category": "client"},
    
    # Utilisateurs
    {"slug": "user.create", "name": "Créer Utilisateur", "category": "user"},
    {"slug": "user.read", "name": "Voir Utilisateurs", "category": "user"},
    {"slug": "user.update", "name": "Modifier Utilisateur", "category": "user"},
    {"slug": "user.delete", "name": "Supprimer Utilisateur", "category": "user"},
    {"slug": "user.permissions", "name": "Gérer Permissions", "category": "user"},
    
    # Types de batteries
    {"slug": "battery_type.create", "name": "Créer Type Batterie", "category": "battery_type"},
    {"slug": "battery_type.read", "name": "Voir Types Batterie", "category": "battery_type"},
    {"slug": "battery_type.update", "name": "Modifier Type Batterie", "category": "battery_type"},
    {"slug": "battery_type.delete", "name": "Supprimer Type Batterie", "category": "battery_type"},
    
    # Lieux
    {"slug": "location.create", "name": "Créer Lieu", "category": "location"},
    {"slug": "location.read", "name": "Voir Lieux", "category": "location"},
    {"slug": "location.update", "name": "Modifier Lieu", "category": "location"},
    {"slug": "location.delete", "name": "Supprimer Lieu", "category": "location"},
    
    # Batteries
    {"slug": "battery.create", "name": "Créer Batterie", "category": "battery"},
    {"slug": "battery.read", "name": "Voir Batteries", "category": "battery"},
    {"slug": "battery.update", "name": "Modifier Batterie", "category": "battery"},
    {"slug": "battery.delete", "name": "Supprimer Batterie", "category": "battery"},
    {"slug": "battery.configure", "name": "Configurer Batterie", "category": "battery"},
    
    # Données BMS
    {"slug": "bms_data.read", "name": "Voir Données BMS", "category": "bms_data"},
    {"slug": "bms_data.export", "name": "Exporter Données BMS", "category": "bms_data"},
    {"slug": "bms_data.historical", "name": "Accès Historiques", "category": "bms_data"},
    
    # Alertes
    {"slug": "alert.read", "name": "Voir Alertes", "category": "alert"},
    {"slug": "alert.acknowledge", "name": "Accuser Réception Alerte", "category": "alert"},
    {"slug": "alert.resolve", "name": "Résoudre Alerte", "category": "alert"},
    {"slug": "alert.configure", "name": "Configurer Alertes", "category": "alert"},
    
    # Maintenance
    {"slug": "maintenance.read", "name": "Voir Maintenance", "category": "maintenance"},
    {"slug": "maintenance.create", "name": "Créer Log Maintenance", "category": "maintenance"},
    {"slug": "maintenance.update", "name": "Modifier Maintenance", "category": "maintenance"},
    
    # Rapports
    {"slug": "report.generate", "name": "Générer Rapports", "category": "report"},
    {"slug": "report.schedule", "name": "Programmer Rapports", "category": "report"},
]


# Rôles par défaut à créer
DEFAULT_ROLES = [
    {
        "name": "Super Administrateur",
        "slug": "superadmin",
        "description": "Accès complet au système",
        "level": 0,
        "is_system": True,
        "permissions": ["system.*"]  # Toutes les permissions système
    },
    {
        "name": "Administrateur Client",
        "slug": "client_admin",
        "description": "Administration complète de son client",
        "level": 1,
        "permissions": [
            "client.read", "client.update", "client.config",
            "user.*", "battery_type.*", "location.*", "battery.*",
            "bms_data.*", "alert.*", "maintenance.*", "report.*"
        ]
    },
    {
        "name": "Gestionnaire",
        "slug": "manager",
        "description": "Gestion des batteries et données",
        "level": 2,
        "permissions": [
            "battery_type.read", "location.*", "battery.*",
            "bms_data.read", "bms_data.export", "alert.read", "alert.acknowledge",
            "maintenance.*", "report.generate"
        ]
    },
    {
        "name": "Opérateur",
        "slug": "operator",
        "description": "Opérations quotidiennes",
        "level": 3,
        "permissions": [
            "battery_type.read", "location.read", "battery.read", "battery.update",
            "bms_data.read", "alert.read", "alert.acknowledge",
            "maintenance.read", "maintenance.create"
        ]
    },
    {
        "name": "Visualisation",
        "slug": "viewer",
        "description": "Consultation seule",
        "level": 4,
        "permissions": [
            "battery_type.read", "location.read", "battery.read",
            "bms_data.read", "alert.read", "maintenance.read"
        ]
    }
]