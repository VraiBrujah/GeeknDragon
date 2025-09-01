"""
Modèles SQLAlchemy pour modEdsDatabase
Architecture multi-tenant avec Row-Level Security
"""

from .base import Base, TimestampMixin
from .clients import Client, ClientUser, ClientConfig
from .batteries import BatteryType, Location, Battery, CustomField
from .bms_data import BMSData, BMSDataHistory, Alert, MaintenanceLog
from .auth import User, Role, Permission

# Import pour initialisation
from .database import init_database

__all__ = [
    "Base",
    "TimestampMixin",
    "Client",
    "ClientUser", 
    "ClientConfig",
    "BatteryType",
    "Location",
    "Battery",
    "CustomField",
    "BMSData",
    "BMSDataHistory",
    "Alert",
    "MaintenanceLog",
    "User",
    "Role",
    "Permission",
    "init_database"
]