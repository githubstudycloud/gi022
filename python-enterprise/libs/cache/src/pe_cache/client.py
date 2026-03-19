"""Async Redis cache client."""

from __future__ import annotations

import json
from typing import Any

import redis.asyncio as aioredis


class CacheClient:
    """Thin async Redis wrapper."""

    def __init__(self, url: str, pool_size: int = 10) -> None:
        self._redis = aioredis.from_url(
            url,
            max_connections=pool_size,
            decode_responses=True,
        )

    async def get(self, key: str) -> Any | None:
        raw = await self._redis.get(key)
        return json.loads(raw) if raw is not None else None

    async def set(self, key: str, value: Any, ttl: int | None = None) -> None:
        serialized = json.dumps(value, default=str)
        if ttl:
            await self._redis.setex(key, ttl, serialized)
        else:
            await self._redis.set(key, serialized)

    async def delete(self, key: str) -> None:
        await self._redis.delete(key)

    async def exists(self, key: str) -> bool:
        return bool(await self._redis.exists(key))

    async def expire(self, key: str, ttl: int) -> None:
        await self._redis.expire(key, ttl)

    async def close(self) -> None:
        await self._redis.aclose()
