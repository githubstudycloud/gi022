"""User repository interface."""

from __future__ import annotations

import uuid
from abc import abstractmethod

from pe_core.repository import Repository
from user_service.domain.entities.user import User


class UserRepository(Repository[User]):
    @abstractmethod
    async def find_by_email(self, email: str) -> User | None:
        ...

    @abstractmethod
    async def list_users(
        self, offset: int = 0, limit: int = 20
    ) -> tuple[list[User], int]:
        ...
