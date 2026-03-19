"""Generic repository interface."""

from __future__ import annotations

import uuid
from abc import ABC, abstractmethod
from typing import Generic, TypeVar

from pe_core.domain.aggregate import AggregateRoot

T = TypeVar("T", bound=AggregateRoot)


class Repository(ABC, Generic[T]):
    """Abstract base repository."""

    @abstractmethod
    async def get(self, entity_id: uuid.UUID) -> T | None:
        ...

    @abstractmethod
    async def save(self, entity: T) -> None:
        ...

    @abstractmethod
    async def delete(self, entity_id: uuid.UUID) -> None:
        ...
