"""Login command + handler."""

from __future__ import annotations

from dataclasses import dataclass

from pe_auth.jwt import JWTService
from pe_auth.password import PasswordHasher
from pe_core.exceptions import UnauthorizedError
from user_service.domain.entities.user import UserStatus
from user_service.domain.repositories.user_repository import UserRepository


@dataclass(frozen=True)
class LoginCommand:
    email: str
    password: str


@dataclass(frozen=True)
class TokenPair:
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


@dataclass
class LoginHandler:
    user_repo: UserRepository
    hasher: PasswordHasher
    jwt_service: JWTService

    async def handle(self, cmd: LoginCommand) -> TokenPair:
        user = await self.user_repo.find_by_email(cmd.email)
        if not user or not user.verify_password(cmd.password, self.hasher):
            raise UnauthorizedError("Invalid email or password")

        if user.status != UserStatus.ACTIVE:
            raise UnauthorizedError("Account is not active")

        access_token = self.jwt_service.create_access_token(
            user_id=str(user.id), roles=user.roles
        )
        refresh_token = self.jwt_service.create_refresh_token(user_id=str(user.id))
        return TokenPair(access_token=access_token, refresh_token=refresh_token)
