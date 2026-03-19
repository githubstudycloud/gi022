#!/usr/bin/env python3
"""Service and library scaffolding tool."""

import sys
import textwrap
from pathlib import Path

ROOT = Path(__file__).parent.parent


def scaffold_service(name: str) -> None:
    """Scaffold a new DDD microservice."""
    service_dir = ROOT / "apps" / name
    src_pkg = name.replace("-", "_")
    src_dir = service_dir / "src" / src_pkg

    # Directory structure
    dirs = [
        src_dir / "domain" / "entities",
        src_dir / "domain" / "events",
        src_dir / "domain" / "repositories",
        src_dir / "domain" / "value_objects",
        src_dir / "application" / "commands",
        src_dir / "application" / "queries",
        src_dir / "application" / "handlers",
        src_dir / "infrastructure" / "persistence",
        src_dir / "infrastructure" / "messaging",
        src_dir / "interfaces" / "http" / "v1",
        src_dir / "config",
        service_dir / "tests" / "unit",
        service_dir / "tests" / "integration",
        service_dir / "migrations" / "versions",
    ]
    for d in dirs:
        d.mkdir(parents=True, exist_ok=True)
        (d / "__init__.py").touch()

    # pyproject.toml
    (service_dir / "pyproject.toml").write_text(textwrap.dedent(f"""\
        [project]
        name = "{name}"
        version = "0.1.0"
        requires-python = ">=3.12"
        dependencies = [
            "fastapi>=0.115",
            "uvicorn[standard]>=0.32",
            "sqlalchemy[asyncio]>=2.0",
            "asyncpg>=0.30",
            "alembic>=1.14",
            "pydantic-settings>=2.6",
            "pe-core",
            "pe-database",
            "pe-cache",
            "pe-auth",
            "pe-observability",
        ]

        [tool.uv.sources]
        pe-core         = {{ workspace = true }}
        pe-database     = {{ workspace = true }}
        pe-cache        = {{ workspace = true }}
        pe-auth         = {{ workspace = true }}
        pe-observability = {{ workspace = true }}
    """))

    # Main app file
    (src_dir / "interfaces" / "http" / "app.py").write_text(textwrap.dedent(f"""\
        from fastapi import FastAPI
        from {src_pkg}.config.settings import Settings
        from pe_observability.middleware import setup_middleware

        settings = Settings()
        app = FastAPI(
            title="{name}",
            version="0.1.0",
            docs_url="/docs" if settings.debug else None,
        )

        setup_middleware(app, settings.service_name)

        @app.get("/health")
        async def health() -> dict[str, str]:
            return {{"status": "ok", "service": "{name}"}}
    """))

    # Settings
    (src_dir / "config" / "settings.py").write_text(textwrap.dedent(f"""\
        from pe_config import BaseSettings

        class Settings(BaseSettings):
            service_name: str = "{name}"

            class Config:
                env_file = ".env"
    """))

    # Dockerfile
    (service_dir / "Dockerfile").write_text(textwrap.dedent(f"""\
        FROM python:3.12-slim AS base
        WORKDIR /app
        RUN pip install uv

        FROM base AS builder
        COPY pyproject.toml uv.lock* ./
        RUN uv sync --package {name} --no-dev

        FROM base AS runtime
        COPY --from=builder /app/.venv /app/.venv
        COPY apps/{name}/src .
        ENV PATH="/app/.venv/bin:$PATH"
        EXPOSE 8000
        CMD ["uvicorn", "{src_pkg}.interfaces.http.app:app", "--host", "0.0.0.0", "--port", "8000"]
    """))

    print(f"✅  Service '{name}' scaffolded at apps/{name}/")


def scaffold_lib(name: str) -> None:
    """Scaffold a new shared library."""
    pkg_name = f"pe-{name}"
    lib_dir = ROOT / "libs" / name
    src_dir = lib_dir / "src" / f"pe_{name}"

    src_dir.mkdir(parents=True, exist_ok=True)
    (src_dir / "__init__.py").touch()
    (lib_dir / "tests").mkdir(exist_ok=True)

    (lib_dir / "pyproject.toml").write_text(textwrap.dedent(f"""\
        [project]
        name = "{pkg_name}"
        version = "0.1.0"
        requires-python = ">=3.12"
        dependencies = []
    """))

    print(f"✅  Library '{pkg_name}' scaffolded at libs/{name}/")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python scaffold.py <service|lib> <name>")
        sys.exit(1)

    kind, name = sys.argv[1], sys.argv[2]
    if kind == "service":
        scaffold_service(name)
    elif kind == "lib":
        scaffold_lib(name)
    else:
        print(f"Unknown type: {kind}")
        sys.exit(1)
