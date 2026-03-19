"""Pytest fixtures for database and settings."""

from __future__ import annotations

import pytest_asyncio
import pytest
from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from pe_database.base import Base


TEST_DATABASE_URL = "postgresql+asyncpg://pe:pe@localhost:5432/test_db"


@pytest_asyncio.fixture(scope="session")
async def engine():
    eng = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield eng
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await eng.dispose()


@pytest_asyncio.fixture
async def async_session(engine) -> AsyncGenerator[AsyncSession, None]:
    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with factory() as session:
        yield session
        await session.rollback()


@pytest.fixture
def override_settings(monkeypatch):
    """Helper to override environment settings in tests."""
    def _set(**kwargs):
        for k, v in kwargs.items():
            monkeypatch.setenv(k.upper(), str(v))
    return _set
