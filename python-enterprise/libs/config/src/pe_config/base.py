"""Base settings with common fields for all services."""

from __future__ import annotations

from pydantic_settings import BaseSettings as _BaseSettings, SettingsConfigDict


class BaseSettings(_BaseSettings):
    """Common configuration base for all services."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Runtime
    environment: str = "development"
    debug: bool = False
    service_name: str = "python-enterprise-service"
    log_level: str = "INFO"

    # Database
    database_url: str = "postgresql+asyncpg://pe:pe@localhost:5432/default_db"
    database_pool_size: int = 10
    database_max_overflow: int = 20

    # Redis
    redis_url: str = "redis://localhost:6379/0"
    redis_pool_size: int = 10

    # Kafka
    kafka_brokers: str = "localhost:9092"
    kafka_group_id: str = "python-enterprise"

    # Security
    secret_key: str = "change-this-in-production"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # Observability
    otlp_endpoint: str = "http://localhost:4317"
    sentry_dsn: str = ""

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def is_development(self) -> bool:
        return self.environment == "development"
