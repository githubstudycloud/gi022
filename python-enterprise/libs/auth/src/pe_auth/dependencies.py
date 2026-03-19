"""FastAPI dependency injection for auth."""

from __future__ import annotations

from collections.abc import Callable

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from pe_auth.jwt import JWTService, TokenPayload
from pe_core.exceptions import UnauthorizedError

_bearer = HTTPBearer()


def _get_jwt_service() -> JWTService:  # pragma: no cover
    """Override in each app's DI setup."""
    raise NotImplementedError("Inject JWTService via app dependency overrides")


async def require_auth(
    credentials: HTTPAuthorizationCredentials = Security(_bearer),
    jwt_service: JWTService = Depends(_get_jwt_service),
) -> TokenPayload:
    try:
        return jwt_service.decode(credentials.credentials)
    except UnauthorizedError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        ) from e


def require_roles(*roles: str) -> Callable[..., TokenPayload]:
    """Dependency factory that checks role membership."""

    async def _check(payload: TokenPayload = Depends(require_auth)) -> TokenPayload:
        if not any(r in payload.roles for r in roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return payload

    return _check
