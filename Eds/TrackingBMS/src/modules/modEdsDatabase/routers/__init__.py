"""
Routers FastAPI pour modEdsDatabase
Organisation modulaire des endpoints API
"""

from .health import router as health_router
from .auth import router as auth_router
from .clients import router as clients_router
from .batteries import router as batteries_router
from .bms_data import router as bms_data_router

__all__ = [
    "health_router",
    "auth_router", 
    "clients_router",
    "batteries_router",
    "bms_data_router"
]