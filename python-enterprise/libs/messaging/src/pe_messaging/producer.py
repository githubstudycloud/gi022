"""Async Kafka producer."""

from __future__ import annotations

import json
from dataclasses import asdict

from aiokafka import AIOKafkaProducer

from pe_core.domain.event import DomainEvent


class KafkaProducer:
    def __init__(self, brokers: str) -> None:
        self._brokers = brokers
        self._producer: AIOKafkaProducer | None = None

    async def start(self) -> None:
        self._producer = AIOKafkaProducer(
            bootstrap_servers=self._brokers,
            value_serializer=lambda v: json.dumps(v, default=str).encode(),
        )
        await self._producer.start()

    async def stop(self) -> None:
        if self._producer:
            await self._producer.stop()

    async def publish(self, topic: str, event: DomainEvent) -> None:
        if not self._producer:
            raise RuntimeError("Producer not started")
        payload = {
            "event_type": event.event_type,
            "event_id": str(event.event_id),
            "occurred_at": event.occurred_at.isoformat(),
            **{k: v for k, v in asdict(event).items() if k not in ("event_id", "occurred_at")},
        }
        await self._producer.send_and_wait(topic, value=payload)

    async def publish_raw(self, topic: str, payload: dict) -> None:  # type: ignore[type-arg]
        if not self._producer:
            raise RuntimeError("Producer not started")
        await self._producer.send_and_wait(topic, value=payload)
