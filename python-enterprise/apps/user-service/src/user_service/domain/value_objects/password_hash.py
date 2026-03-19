"""PasswordHash value object."""

from __future__ import annotations

from dataclasses import dataclass

from pe_core.domain.value_object import ValueObject


@dataclass(frozen=True)
class PasswordHash(ValueObject):
    value: str
