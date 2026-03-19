"""Create user command + handler."""

from __future__ import annotations

from dataclasses import dataclass

from pe_auth.password import PasswordHasher
from pe_core.exceptions import ConflictError
from pe_messaging.producer import KafkaProducer
from user_service.domain.entities.user import User
from user_service.domain.repositories.user_repository import UserRepository

TOPIC_USER_EVENTS = "user.events"


@dataclass(frozen=True)
class CreateUserCommand:
    email: str
    password: str
    full_name: str
    roles: list[str] | None = None


@dataclass
class CreateUserHandler:
    user_repo: UserRepository
    hasher: PasswordHasher
    producer: KafkaProducer

    async def handle(self, cmd: CreateUserCommand) -> User:
        existing = await self.user_repo.find_by_email(cmd.email)
        if existing:
            raise ConflictError(f"Email '{cmd.email}' already registered")

        hashed = self.hasher.hash(cmd.password)
        user = User.create(
            email=cmd.email,
            hashed_password=hashed,
            full_name=cmd.full_name,
            roles=cmd.roles,
        )
        await self.user_repo.save(user)

        for event in user.pull_events():
            await self.producer.publish(TOPIC_USER_EVENTS, event)

        return user
