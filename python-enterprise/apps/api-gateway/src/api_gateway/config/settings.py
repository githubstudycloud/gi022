"""API Gateway settings."""

from pe_config import BaseSettings


class GatewaySettings(BaseSettings):
    service_name: str = "api-gateway"
    user_service_url: str = "http://user-service:8000"
    data_service_url: str = "http://data-service:8000"
    rate_limit_per_minute: int = 100
    redis_url: str = "redis://localhost:6379/1"
