"""Get user queries."""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from pe_core.exceptions import NotFoundError
from user_service.domain.entities.user import User
from user_service.domain.repositories.user_repository import UserRepository


@dataclass(frozen=True)
class GetUserByIdQuery:
    user_id: uuid.UUID


@dataclass(frozen=True)
class ListUsersQuery:
    offset: int = 0
    limit: int = 20


@dataclass
class UserQueryHandler:
    user_repo: UserRepository

    async def get_by_id(self, query: GetUserByIdQuery) -> User:
        user = await self.user_repo.get(query.user_id)
        if not user:
            raise NotFoundError("User", query.user_id)
        return user

    async def list_users(self, query: ListUsersQuery) -> tuple[list[User], int]:
        return await self.user_repo.list_users(query.offset, query.limit)
