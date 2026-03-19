"""User domain events."""

from __future__ import annotations

from dataclasses import dataclass

from pe_core.domain.event import DomainEvent


@dataclass(frozen=True)
class UserCreated(DomainEvent):
    user_id: str
    email: str
    full_name: str
    roles: list[str]


@dataclass(frozen=True)
class UserDeactivated(DomainEvent):
    user_id: str


@dataclass(frozen=True)
class UserRoleAssigned(DomainEvent):
    user_id: str
    role: str


@dataclass(frozen=True)
class UserPasswordChanged(DomainEvent):
    user_id: str
