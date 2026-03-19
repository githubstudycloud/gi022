"""pe-core: Base domain building blocks for DDD."""

from pe_core.domain.aggregate import AggregateRoot
from pe_core.domain.entity import Entity
from pe_core.domain.event import DomainEvent
from pe_core.domain.value_object import ValueObject
from pe_core.exceptions import (
    ApplicationError,
    ConflictError,
    DomainError,
    NotFoundError,
    UnauthorizedError,
    ValidationError,
)

__all__ = [
    "AggregateRoot",
    "Entity",
    "DomainEvent",
    "ValueObject",
    "ApplicationError",
    "ConflictError",
    "DomainError",
    "NotFoundError",
    "UnauthorizedError",
    "ValidationError",
]
