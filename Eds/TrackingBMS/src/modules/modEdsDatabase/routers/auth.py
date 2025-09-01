"""
Endpoints d'authentification et gestion des utilisateurs
JWT, sessions, et autorisation multi-client
"""

import logging
from datetime import datetime, timedelta
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import JWTError, jwt
from passlib.context import CryptContext

from database import get_db_session
from models.auth import User, Role, Permission
from models.clients import Client, ClientUser
from config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter()

# Configuration sécurité
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


# Modèles Pydantic

class UserLogin(BaseModel):
    """Données de connexion utilisateur"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=100)
    remember_me: bool = False


class UserRegister(BaseModel):
    """Données d'inscription utilisateur"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    first_name: str = Field(..., min_length=2, max_length=50)
    last_name: str = Field(..., min_length=2, max_length=50)
    password: str = Field(..., min_length=8, max_length=100)
    phone: Optional[str] = None
    language: str = Field(default="fr", pattern="^(fr|en)$")


class TokenResponse(BaseModel):
    """Réponse avec token JWT"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict
    clients: List[dict] = []


class UserProfile(BaseModel):
    """Profil utilisateur"""
    id: str
    username: str
    email: str
    first_name: str
    last_name: str
    phone: Optional[str]
    language: str
    timezone: str
    is_active: bool
    is_verified: bool
    last_login: Optional[datetime]
    clients: List[dict] = []


class PasswordChange(BaseModel):
    """Changement de mot de passe"""
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)


class PasswordReset(BaseModel):
    """Reset de mot de passe"""
    email: EmailStr


# Utilitaires d'authentification

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Crée un token JWT"""
    settings = get_settings()
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifie un mot de passe"""
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    """Hash un mot de passe"""
    return pwd_context.hash(password)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db_session)
) -> User:
    """
    Dépendance pour obtenir l'utilisateur authentifié
    """
    settings = get_settings()
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Décoder le token JWT
        payload = jwt.decode(
            credentials.credentials, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # Récupérer l'utilisateur de la DB
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
    
    # Vérifier que le compte est actif et non verrouillé
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user account"
        )
    
    if user.is_locked:
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail="Account temporarily locked"
        )
    
    return user


async def get_user_clients(user_id: str, db: AsyncSession) -> List[dict]:
    """Récupère la liste des clients accessibles à un utilisateur"""
    result = await db.execute(
        select(Client, ClientUser)
        .join(ClientUser, Client.id == ClientUser.client_id)
        .where(ClientUser.user_id == user_id, ClientUser.is_active == True)
    )
    
    clients = []
    for client, client_user in result.all():
        clients.append({
            "id": str(client.id),
            "name": client.name,
            "slug": client.slug,
            "role": client_user.role,
            "permissions": client_user.permissions
        })
    
    return clients


# Endpoints

@router.post("/login", response_model=TokenResponse)
async def login(
    user_data: UserLogin,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Authentification utilisateur avec JWT
    """
    settings = get_settings()
    
    # Recherche utilisateur
    result = await db.execute(
        select(User).where(User.username == user_data.username)
    )
    user = result.scalar_one_or_none()
    
    # Vérifications
    if not user or not verify_password(user_data.password, user.password_hash):
        # Incrémenter les tentatives échouées
        if user:
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= 5:
                user.lock_account(30)  # Verrouiller 30 minutes
            await db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Vérifier statut du compte
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account disabled"
        )
    
    if user.is_locked:
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail="Account temporarily locked due to failed login attempts"
        )
    
    # Réinitialiser les tentatives échouées et mettre à jour dernière connexion
    user.failed_login_attempts = 0
    user.last_login = datetime.utcnow()
    await db.commit()
    
    # Récupérer les clients accessibles
    clients = await get_user_clients(str(user.id), db)
    
    # Créer token JWT
    expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
    if user_data.remember_me:
        expire_minutes = 60 * 24 * 30  # 30 jours si "remember me"
    
    access_token_expires = timedelta(minutes=expire_minutes)
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "username": user.username,
            "email": user.email,
            "clients": [c["id"] for c in clients]
        },
        expires_delta=access_token_expires
    )
    
    return TokenResponse(
        access_token=access_token,
        expires_in=expire_minutes * 60,
        user={
            "id": str(user.id),
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "language": user.language,
            "is_superuser": user.is_superuser
        },
        clients=clients
    )


@router.post("/register", response_model=dict)
async def register(
    user_data: UserRegister,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Inscription nouvel utilisateur
    """
    # Vérifier unicité username et email
    result = await db.execute(
        select(User).where(
            (User.username == user_data.username) | 
            (User.email == user_data.email)
        )
    )
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        if existing_user.username == user_data.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Créer nouvel utilisateur
    user = User(
        username=user_data.username,
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone=user_data.phone,
        language=user_data.language,
        password_hash=hash_password(user_data.password)
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    logger.info(f"New user registered: {user.username} ({user.email})")
    
    return {
        "message": "User registered successfully",
        "user_id": str(user.id),
        "username": user.username
    }


@router.get("/profile", response_model=UserProfile)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Récupère le profil de l'utilisateur authentifié
    """
    clients = await get_user_clients(str(current_user.id), db)
    
    return UserProfile(
        id=str(current_user.id),
        username=current_user.username,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        phone=current_user.phone,
        language=current_user.language,
        timezone=current_user.timezone,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        last_login=current_user.last_login,
        clients=clients
    )


@router.put("/profile")
async def update_profile(
    profile_data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Met à jour le profil utilisateur
    """
    # Champs modifiables
    updateable_fields = [
        "first_name", "last_name", "phone", 
        "language", "timezone"
    ]
    
    for field in updateable_fields:
        if field in profile_data:
            setattr(current_user, field, profile_data[field])
    
    await db.commit()
    
    return {"message": "Profile updated successfully"}


@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Change le mot de passe de l'utilisateur
    """
    # Vérifier mot de passe actuel
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Définir nouveau mot de passe
    current_user.set_password(password_data.new_password)
    await db.commit()
    
    logger.info(f"Password changed for user: {current_user.username}")
    
    return {"message": "Password changed successfully"}


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """
    Déconnexion utilisateur (invalidation côté client)
    """
    # Avec JWT, la déconnexion est principalement côté client
    # En production, on pourrait maintenir une blacklist de tokens
    
    logger.info(f"User logged out: {current_user.username}")
    
    return {"message": "Logged out successfully"}


@router.get("/verify-token")
async def verify_token(current_user: User = Depends(get_current_user)):
    """
    Vérifie la validité d'un token JWT
    """
    return {
        "valid": True,
        "user": {
            "id": str(current_user.id),
            "username": current_user.username,
            "email": current_user.email
        }
    }


@router.post("/refresh-token")
async def refresh_token(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Renouvelle un token JWT
    """
    settings = get_settings()
    
    # Récupérer les clients accessibles
    clients = await get_user_clients(str(current_user.id), db)
    
    # Créer nouveau token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": str(current_user.id),
            "username": current_user.username,
            "email": current_user.email,
            "clients": [c["id"] for c in clients]
        },
        expires_delta=access_token_expires
    )
    
    return TokenResponse(
        access_token=access_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user={
            "id": str(current_user.id),
            "username": current_user.username,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "language": current_user.language
        },
        clients=clients
    )