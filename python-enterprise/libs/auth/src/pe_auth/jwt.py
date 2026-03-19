"""JWT token generation and verification."""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from dataclasses import dataclass

from jose import JWTError, jwt

from pe_core.exceptions import UnauthorizedError


@dataclass(frozen=True)
class TokenPayload:
    sub: str  # user_id
    roles: list[str]
    exp: datetime
    jti: str = ""


class JWTService:
    def __init__(self, secret_key: str, algorithm: str = "HS256") -> None:
        self._secret = secret_key
        self._algorithm = algorithm

    def create_access_token(
        self,
        user_id: str,
        roles: list[str],
        expires_delta: timedelta = timedelta(minutes=30),
    ) -> str:
        now = datetime.now(timezone.utc)
        payload = {
            "sub": user_id,
            "roles": roles,
            "iat": now,
            "exp": now + expires_delta,
            "jti": str(uuid.uuid4()),
        }
        return jwt.encode(payload, self._secret, algorithm=self._algorithm)

    def create_refresh_token(
        self,
        user_id: str,
        expires_delta: timedelta = timedelta(days=7),
    ) -> str:
        now = datetime.now(timezone.utc)
        payload = {
            "sub": user_id,
            "type": "refresh",
            "iat": now,
            "exp": now + expires_delta,
            "jti": str(uuid.uuid4()),
        }
        return jwt.encode(payload, self._secret, algorithm=self._algorithm)

    def decode(self, token: str) -> TokenPayload:
        try:
            data = jwt.decode(token, self._secret, algorithms=[self._algorithm])
        except JWTError as e:
            raise UnauthorizedError(f"Invalid token: {e}") from e
        return TokenPayload(
            sub=data["sub"],
            roles=data.get("roles", []),
            exp=datetime.fromtimestamp(data["exp"], tz=timezone.utc),
            jti=data.get("jti", ""),
        )
