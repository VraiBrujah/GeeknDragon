"""
Classes de base pour les modèles SQLAlchemy
Mixins et utilitaires communs
"""

from datetime import datetime
from typing import Any, Dict, Optional
from sqlalchemy import Column, Integer, DateTime, String, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base, declared_attr
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import uuid


# Base pour tous les modèles
Base = declarative_base()


class TimestampMixin:
    """Mixin pour ajouter des timestamps automatiques"""
    
    created_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(),
        nullable=False,
        doc="Date de création"
    )
    
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        doc="Date de dernière modification"
    )


class TenantMixin:
    """Mixin pour support multi-tenant avec RLS"""
    
    @declared_attr
    def client_id(cls):
        return Column(
            UUID(as_uuid=True),
            nullable=False,
            index=True,
            doc="ID du client propriétaire (pour RLS)"
        )
    
    @declared_attr
    def __table_args__(cls):
        """Arguments de table pour RLS"""
        return (
            {'postgresql_partition_by': 'HASH (client_id)'},
        )


class SoftDeleteMixin:
    """Mixin pour suppression logique"""
    
    deleted_at = Column(
        DateTime(timezone=True),
        nullable=True,
        doc="Date de suppression (NULL = actif)"
    )
    
    is_deleted = Column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
        doc="Indicateur de suppression"
    )
    
    def soft_delete(self):
        """Marque l'enregistrement comme supprimé"""
        self.deleted_at = datetime.utcnow()
        self.is_deleted = True
    
    def restore(self):
        """Restaure l'enregistrement"""
        self.deleted_at = None
        self.is_deleted = False


class UUIDMixin:
    """Mixin pour clé primaire UUID"""
    
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
        doc="Identifiant unique UUID"
    )


class MetadataMixin:
    """Mixin pour métadonnées JSON"""
    
    metadata_ = Column(
        "metadata",  # Éviter conflit avec SQLAlchemy metadata
        Text,
        nullable=True,
        doc="Métadonnées JSON personnalisées"
    )
    
    notes = Column(
        Text,
        nullable=True,
        doc="Notes libres"
    )
    
    tags = Column(
        String(500),
        nullable=True,
        doc="Tags séparés par virgules"
    )
    
    def get_metadata(self) -> Dict[str, Any]:
        """Récupère les métadonnées sous forme de dict"""
        if not self.metadata_:
            return {}
        
        try:
            import json
            return json.loads(self.metadata_)
        except (json.JSONDecodeError, TypeError):
            return {}
    
    def set_metadata(self, data: Dict[str, Any]):
        """Définit les métadonnées"""
        import json
        self.metadata_ = json.dumps(data, ensure_ascii=False)
    
    def get_tags_list(self) -> list:
        """Récupère les tags sous forme de liste"""
        if not self.tags:
            return []
        return [tag.strip() for tag in self.tags.split(",") if tag.strip()]
    
    def set_tags_list(self, tag_list: list):
        """Définit les tags depuis une liste"""
        self.tags = ", ".join(str(tag).strip() for tag in tag_list if str(tag).strip())


class AuditMixin:
    """Mixin pour audit trail"""
    
    created_by = Column(
        UUID(as_uuid=True),
        nullable=True,
        doc="ID utilisateur créateur"
    )
    
    updated_by = Column(
        UUID(as_uuid=True),
        nullable=True,
        doc="ID utilisateur dernière modification"
    )
    
    version = Column(
        Integer,
        default=1,
        nullable=False,
        doc="Version pour contrôle concurrence optimiste"
    )
    
    def increment_version(self):
        """Incrémente la version"""
        self.version = (self.version or 0) + 1


# Classe de base complète pour les entités principales
class BaseEntity(Base, UUIDMixin, TimestampMixin, TenantMixin, SoftDeleteMixin, MetadataMixin, AuditMixin):
    """Classe de base pour les entités principales avec tous les mixins"""
    __abstract__ = True
    
    def to_dict(self, include_relations: bool = False) -> Dict[str, Any]:
        """Conversion en dictionnaire"""
        result = {}
        
        for column in self.__table__.columns:
            value = getattr(self, column.name)
            
            # Conversion des types spéciaux
            if isinstance(value, datetime):
                result[column.name] = value.isoformat()
            elif isinstance(value, uuid.UUID):
                result[column.name] = str(value)
            else:
                result[column.name] = value
        
        # Inclure métadonnées parsées
        result["parsed_metadata"] = self.get_metadata()
        result["parsed_tags"] = self.get_tags_list()
        
        return result
    
    def __repr__(self):
        return f"<{self.__class__.__name__}(id={self.id})>"


# Classe simplifiée pour les tables de configuration
class BaseConfig(Base, UUIDMixin, TimestampMixin, AuditMixin):
    """Classe de base pour les tables de configuration"""
    __abstract__ = True
    
    def to_dict(self) -> Dict[str, Any]:
        """Conversion en dictionnaire"""
        result = {}
        
        for column in self.__table__.columns:
            value = getattr(self, column.name)
            
            if isinstance(value, datetime):
                result[column.name] = value.isoformat()
            elif isinstance(value, uuid.UUID):
                result[column.name] = str(value)
            else:
                result[column.name] = value
        
        return result