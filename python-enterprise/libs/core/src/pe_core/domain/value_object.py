"""Value Object base class."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ValueObject:
    """Immutable value object — equality based on attributes."""

    def __eq__(self, other: object) -> bool:
        if type(self) is not type(other):
            return False
        return self.__dict__ == other.__dict__  # type: ignore[union-attr]

    def __hash__(self) -> int:
        return hash(tuple(self.__dict__.values()))
