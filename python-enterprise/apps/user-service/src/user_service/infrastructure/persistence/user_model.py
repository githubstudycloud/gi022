"""SQLAlchemy ORM model for User."""

from __future__ import annotations

from sqlalchemy import String, Enum as SAEnum, ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from pe_database.base import Base
from user_service.domain.entities.user import UserStatus


class UserModel(Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    roles: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False, default=list)
    status: Mapped[str] = mapped_column(
        SAEnum(UserStatus, name="user_status"),
        nullable=False,
        default=UserStatus.ACTIVE,
    )
