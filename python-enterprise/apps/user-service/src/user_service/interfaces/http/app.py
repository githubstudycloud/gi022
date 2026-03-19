"""FastAPI application factory."""

from __future__ import annotations

from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from pe_core.exceptions import ApplicationError
from pe_observability import configure_logging, configure_tracing, setup_middleware
from user_service.config.settings import UserServiceSettings
from user_service.interfaces.http.v1.router import router as v1_router

settings = UserServiceSettings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    configure_logging(level=settings.log_level, json_logs=settings.is_production)
    if settings.otlp_endpoint:
        configure_tracing(settings.service_name, settings.otlp_endpoint)
    yield


app = FastAPI(
    title="User Service",
    version="1.0.0",
    description="Authentication and user management service",
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    lifespan=lifespan,
)

setup_middleware(app, settings.service_name)
app.include_router(v1_router, prefix="/api")


@app.exception_handler(ApplicationError)
async def application_error_handler(request: Request, exc: ApplicationError) -> JSONResponse:
    status_map = {
        "NOT_FOUND": 404,
        "CONFLICT": 409,
        "UNAUTHORIZED": 401,
        "FORBIDDEN": 403,
        "VALIDATION_ERROR": 422,
        "DOMAIN_ERROR": 400,
    }
    return JSONResponse(
        status_code=status_map.get(exc.code, 500),
        content={"code": exc.code, "message": exc.message},
    )


@app.get("/health", tags=["ops"])
async def health() -> dict[str, str]:
    return {"status": "ok", "service": settings.service_name}
