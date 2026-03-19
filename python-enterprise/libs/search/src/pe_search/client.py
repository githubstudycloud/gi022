"""Async Elasticsearch client wrapper."""

from __future__ import annotations

from typing import Any

from elasticsearch import AsyncElasticsearch


class SearchClient:
    def __init__(self, url: str, index_prefix: str = "pe") -> None:
        self._es = AsyncElasticsearch(url)
        self._prefix = index_prefix

    def _index(self, name: str) -> str:
        return f"{self._prefix}-{name}"

    async def index(self, index: str, doc_id: str, body: dict[str, Any]) -> None:
        await self._es.index(index=self._index(index), id=doc_id, body=body)

    async def search(
        self,
        index: str,
        query: dict[str, Any],
        size: int = 20,
        from_: int = 0,
    ) -> list[dict[str, Any]]:
        resp = await self._es.search(
            index=self._index(index),
            body={"query": query, "size": size, "from": from_},
        )
        return [hit["_source"] for hit in resp["hits"]["hits"]]

    async def delete(self, index: str, doc_id: str) -> None:
        await self._es.delete(index=self._index(index), id=doc_id, ignore=[404])

    async def close(self) -> None:
        await self._es.close()
