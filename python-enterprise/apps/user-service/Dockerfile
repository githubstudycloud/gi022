FROM python:3.12-slim AS base
WORKDIR /app
RUN pip install --no-cache-dir uv

# ── Dependencies ─────────────────────────────────────────────────────────────
FROM base AS builder
COPY pyproject.toml uv.lock* ./
COPY libs/ ./libs/
RUN uv sync --package user-service --no-dev --frozen

# ── Runtime ───────────────────────────────────────────────────────────────────
FROM python:3.12-slim AS runtime
WORKDIR /app
RUN addgroup --system app && adduser --system --group app

COPY --from=builder /app/.venv /app/.venv
COPY apps/user-service/src ./src

ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONPATH="/app/src" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

USER app
EXPOSE 8000

CMD ["uvicorn", "user_service.interfaces.http.app:app", \
     "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
