"""User aggregate root."""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import StrEnum

from pe_core.domain.aggregate import AggregateRoot
from pe_core.exceptions import DomainError
from user_service.domain.events.user_events import (
    UserCreated,
    UserDeactivated,
    UserRoleAssigned,
)
from user_service.domain.value_objects.email import Email
from user_service.domain.value_objects.password_hash import PasswordHash


class UserStatus(StrEnum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"


@dataclass(eq=False)
class User(AggregateRoot):
    """User aggregate root."""

    email: Email
    password_hash: PasswordHash
    full_name: str
    roles: list[str] = field(default_factory=lambda: ["user"])
    status: UserStatus = UserStatus.ACTIVE

    def __post_init__(self) -> None:
        super().__post_init__()

    @classmethod
    def create(
        cls,
        email: str,
        hashed_password: str,
        full_name: str,
        roles: list[str] | None = None,
    ) -> "User":
        user = cls(
            email=Email(email),
            password_hash=PasswordHash(hashed_password),
            full_name=full_name,
            roles=roles or ["user"],
        )
        user.add_event(
            UserCreated(
                user_id=str(user.id),
                email=email,
                full_name=full_name,
                roles=user.roles,
            )
        )
        return user

    def assign_role(self, role: str) -> None:
        if role in self.roles:
            raise DomainError(f"User already has role '{role}'")
        self.roles.append(role)
        self.touch()
        self.add_event(UserRoleAssigned(user_id=str(self.id), role=role))

    def deactivate(self) -> None:
        if self.status == UserStatus.INACTIVE:
            raise DomainError("User is already inactive")
        self.status = UserStatus.INACTIVE
        self.touch()
        self.add_event(UserDeactivated(user_id=str(self.id)))

    def verify_password(self, plain: str, hasher) -> bool:  # type: ignore[no-untyped-def]
        return hasher.verify(plain, self.password_hash.value)
