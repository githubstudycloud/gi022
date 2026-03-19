"""Async SQLAlchemy session factory."""

from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)


class AsyncSessionFactory:
    """Manages the async engine and session factory."""

    def __init__(self, url: str, pool_size: int = 10, max_overflow: int = 20) -> None:
        self._engine = create_async_engine(
            url,
            pool_size=pool_size,
            max_overflow=max_overflow,
            echo=False,
        )
        self._factory = async_sessionmaker(
            self._engine, expire_on_commit=False, class_=AsyncSession
        )

    @asynccontextmanager
    async def session(self) -> AsyncGenerator[AsyncSession, None]:
        async with self._factory() as s:
            try:
                yield s
                await s.commit()
            except Exception:
                await s.rollback()
                raise

    async def dispose(self) -> None:
        await self._engine.dispose()


# FastAPI dependency
async def get_session(factory: AsyncSessionFactory) -> AsyncGenerator[AsyncSession, None]:
    async with factory.session() as session:
        yield session
