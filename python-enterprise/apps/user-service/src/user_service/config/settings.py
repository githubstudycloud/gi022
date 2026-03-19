"""User service settings."""

from pe_config import BaseSettings


class UserServiceSettings(BaseSettings):
    service_name: str = "user-service"
    database_url: str = "postgresql+asyncpg://pe:pe@localhost:5432/user_db"
    redis_url: str = "redis://localhost:6379/0"
