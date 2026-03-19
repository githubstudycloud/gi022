"""Async Kafka consumer."""

from __future__ import annotations

import json
import logging
from collections.abc import Callable, Awaitable

from aiokafka import AIOKafkaConsumer

logger = logging.getLogger(__name__)

HandlerFn = Callable[[dict], Awaitable[None]]  # type: ignore[type-arg]


class KafkaConsumer:
    def __init__(self, brokers: str, group_id: str) -> None:
        self._brokers = brokers
        self._group_id = group_id
        self._handlers: dict[str, list[HandlerFn]] = {}
        self._consumer: AIOKafkaConsumer | None = None

    def on(self, topic: str) -> Callable[[HandlerFn], HandlerFn]:
        def decorator(fn: HandlerFn) -> HandlerFn:
            self._handlers.setdefault(topic, []).append(fn)
            return fn
        return decorator

    async def start(self) -> None:
        topics = list(self._handlers.keys())
        self._consumer = AIOKafkaConsumer(
            *topics,
            bootstrap_servers=self._brokers,
            group_id=self._group_id,
            auto_offset_reset="earliest",
            value_deserializer=lambda v: json.loads(v.decode()),
        )
        await self._consumer.start()

    async def run(self) -> None:
        if not self._consumer:
            raise RuntimeError("Consumer not started")
        async for msg in self._consumer:
            topic = msg.topic
            for handler in self._handlers.get(topic, []):
                try:
                    await handler(msg.value)
                except Exception:
                    logger.exception("Error handling message on topic=%s", topic)

    async def stop(self) -> None:
        if self._consumer:
            await self._consumer.stop()
