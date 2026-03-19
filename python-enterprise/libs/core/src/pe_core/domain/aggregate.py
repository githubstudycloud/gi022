"""Aggregate Root — holds domain events."""

from __future__ import annotations

from pe_core.domain.entity import Entity
from pe_core.domain.event import DomainEvent


class AggregateRoot(Entity):
    """Aggregate root that collects domain events."""

    def __init_subclass__(cls, **kwargs: object) -> None:
        super().__init_subclass__(**kwargs)

    def __post_init__(self) -> None:
        self._domain_events: list[DomainEvent] = []

    def add_event(self, event: DomainEvent) -> None:
        self._domain_events.append(event)

    def pull_events(self) -> list[DomainEvent]:
        """Return and clear all pending domain events."""
        events = list(self._domain_events)
        self._domain_events.clear()
        return events
