"""factory_boy base factory for SQLAlchemy async models."""

from __future__ import annotations

import factory
from factory.alchemy import SQLAlchemyModelFactory


class BaseFactory(SQLAlchemyModelFactory):
    """Base factory with async session support."""

    class Meta:
        abstract = True
        sqlalchemy_session_persistence = "commit"
