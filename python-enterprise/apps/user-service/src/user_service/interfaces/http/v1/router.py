"""User API v1 router."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from pe_auth.dependencies import require_auth, require_roles
from pe_auth.jwt import TokenPayload
from pe_core.exceptions import ApplicationError, ConflictError, NotFoundError, UnauthorizedError
from user_service.application.commands.create_user import CreateUserCommand, CreateUserHandler
from user_service.application.commands.login import LoginCommand, LoginHandler
from user_service.application.queries.get_user import GetUserByIdQuery, ListUsersQuery, UserQueryHandler
from user_service.interfaces.http.v1.schemas import (
    AssignRoleRequest,
    CreateUserRequest,
    LoginRequest,
    PaginatedUsersResponse,
    TokenResponse,
    UserResponse,
)

router = APIRouter(prefix="/v1/users", tags=["users"])


def _map_error(exc: ApplicationError) -> HTTPException:
    status_map = {
        "NOT_FOUND": status.HTTP_404_NOT_FOUND,
        "CONFLICT": status.HTTP_409_CONFLICT,
        "UNAUTHORIZED": status.HTTP_401_UNAUTHORIZED,
        "FORBIDDEN": status.HTTP_403_FORBIDDEN,
        "VALIDATION_ERROR": status.HTTP_422_UNPROCESSABLE_ENTITY,
        "DOMAIN_ERROR": status.HTTP_400_BAD_REQUEST,
    }
    return HTTPException(
        status_code=status_map.get(exc.code, status.HTTP_500_INTERNAL_SERVER_ERROR),
        detail={"code": exc.code, "message": exc.message},
    )


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    body: CreateUserRequest,
    handler: CreateUserHandler = Depends(),
) -> UserResponse:
    try:
        user = await handler.handle(CreateUserCommand(**body.model_dump()))
    except ApplicationError as e:
        raise _map_error(e) from e
    return UserResponse(
        id=user.id,
        email=str(user.email),
        full_name=user.full_name,
        roles=user.roles,
        status=user.status,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


@router.post("/auth/login", response_model=TokenResponse)
async def login(
    body: LoginRequest,
    handler: LoginHandler = Depends(),
) -> TokenResponse:
    try:
        tokens = await handler.handle(LoginCommand(email=body.email, password=body.password))
    except ApplicationError as e:
        raise _map_error(e) from e
    return TokenResponse(
        access_token=tokens.access_token,
        refresh_token=tokens.refresh_token,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(
    payload: TokenPayload = Depends(require_auth),
    handler: UserQueryHandler = Depends(),
) -> UserResponse:
    user = await handler.get_by_id(GetUserByIdQuery(user_id=uuid.UUID(payload.sub)))
    return UserResponse(
        id=user.id, email=str(user.email), full_name=user.full_name,
        roles=user.roles, status=user.status,
        created_at=user.created_at, updated_at=user.updated_at,
    )


@router.get("/", response_model=PaginatedUsersResponse)
async def list_users(
    offset: int = 0,
    limit: int = 20,
    _: TokenPayload = Depends(require_roles("admin")),
    handler: UserQueryHandler = Depends(),
) -> PaginatedUsersResponse:
    users, total = await handler.list_users(ListUsersQuery(offset=offset, limit=limit))
    items = [
        UserResponse(
            id=u.id, email=str(u.email), full_name=u.full_name,
            roles=u.roles, status=u.status,
            created_at=u.created_at, updated_at=u.updated_at,
        )
        for u in users
    ]
    return PaginatedUsersResponse(items=items, total=total, offset=offset, limit=limit)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: uuid.UUID,
    _: TokenPayload = Depends(require_roles("admin")),
    handler: UserQueryHandler = Depends(),
) -> UserResponse:
    try:
        user = await handler.get_by_id(GetUserByIdQuery(user_id=user_id))
    except NotFoundError as e:
        raise _map_error(e) from e
    return UserResponse(
        id=user.id, email=str(user.email), full_name=user.full_name,
        roles=user.roles, status=user.status,
        created_at=user.created_at, updated_at=user.updated_at,
    )
