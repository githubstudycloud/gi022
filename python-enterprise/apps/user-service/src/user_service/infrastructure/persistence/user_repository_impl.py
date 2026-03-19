"""SQLAlchemy implementation of UserRepository."""

from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from user_service.domain.entities.user import User, UserStatus
from user_service.domain.repositories.user_repository import UserRepository
from user_service.domain.value_objects.email import Email
from user_service.domain.value_objects.password_hash import PasswordHash
from user_service.infrastructure.persistence.user_model import UserModel


class SQLUserRepository(UserRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _to_domain(self, model: UserModel) -> User:
        user = User.__new__(User)
        user.id = model.id
        user.email = Email(model.email)
        user.password_hash = PasswordHash(model.password_hash)
        user.full_name = model.full_name
        user.roles = list(model.roles)
        user.status = UserStatus(model.status)
        user.created_at = model.created_at
        user.updated_at = model.updated_at
        user._domain_events = []
        return user

    def _to_model(self, user: User) -> UserModel:
        return UserModel(
            id=user.id,
            email=str(user.email),
            password_hash=user.password_hash.value,
            full_name=user.full_name,
            roles=user.roles,
            status=user.status,
        )

    async def get(self, entity_id: uuid.UUID) -> User | None:
        result = await self._session.get(UserModel, entity_id)
        return self._to_domain(result) if result else None

    async def find_by_email(self, email: str) -> User | None:
        stmt = select(UserModel).where(UserModel.email == email.lower().strip())
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_domain(model) if model else None

    async def save(self, user: User) -> None:
        existing = await self._session.get(UserModel, user.id)
        if existing:
            existing.email = str(user.email)
            existing.full_name = user.full_name
            existing.roles = user.roles
            existing.status = user.status
        else:
            self._session.add(self._to_model(user))

    async def delete(self, entity_id: uuid.UUID) -> None:
        model = await self._session.get(UserModel, entity_id)
        if model:
            await self._session.delete(model)

    async def list_users(
        self, offset: int = 0, limit: int = 20
    ) -> tuple[list[User], int]:
        count_stmt = select(func.count()).select_from(UserModel)
        total = (await self._session.execute(count_stmt)).scalar_one()

        stmt = select(UserModel).offset(offset).limit(limit).order_by(UserModel.created_at.desc())
        result = await self._session.execute(stmt)
        models = result.scalars().all()
        return [self._to_domain(m) for m in models], total
