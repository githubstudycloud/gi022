.PHONY: help install dev lint test test-unit test-integration build clean \
        infra-up infra-down migrate new-service new-lib docs-serve

SERVICE ?= user-service
LIB     ?= mylib
PORT    ?= 8000

# ─── Colors ─────────────────────────────────────────────────────────────────
CYAN  := \033[0;36m
RESET := \033[0m

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-20s$(RESET) %s\n", $$1, $$2}'

# ─── Setup ──────────────────────────────────────────────────────────────────
install: ## Install all dependencies
	uv sync --all-packages

pre-commit-install: ## Install pre-commit hooks
	uv run pre-commit install

# ─── Development ────────────────────────────────────────────────────────────
dev: ## Run service in dev mode (SERVICE=user-service)
	uv run --package $(SERVICE) uvicorn $(SERVICE).interfaces.http.app:app \
		--reload --host 0.0.0.0 --port $(PORT)

dev-worker: ## Run Celery worker
	uv run --package worker-service celery -A worker_service.infrastructure.celery_app:app worker -l info

dev-beat: ## Run Celery beat scheduler
	uv run --package worker-service celery -A worker_service.infrastructure.celery_app:app beat -l info

# ─── Quality ────────────────────────────────────────────────────────────────
lint: ## Run ruff + mypy
	uv run ruff check .
	uv run ruff format --check .
	uv run mypy apps/ libs/

format: ## Auto-format code
	uv run ruff format .
	uv run ruff check --fix .

# ─── Tests ──────────────────────────────────────────────────────────────────
test: ## Run all tests
	uv run pytest

test-unit: ## Run unit tests only
	uv run pytest -m unit

test-integration: ## Run integration tests only
	uv run pytest -m integration

test-e2e: ## Run e2e tests only
	uv run pytest -m e2e

test-service: ## Run tests for specific service (SERVICE=user-service)
	uv run pytest apps/$(SERVICE)/tests/

cov-report: ## Open HTML coverage report
	uv run pytest --cov-report=html && open htmlcov/index.html

# ─── Infrastructure ──────────────────────────────────────────────────────────
infra-up: ## Start local infrastructure (postgres, redis, kafka, es)
	docker compose -f docker-compose.infra.yml up -d

infra-down: ## Stop local infrastructure
	docker compose -f docker-compose.infra.yml down

infra-reset: ## Reset all infra data
	docker compose -f docker-compose.infra.yml down -v

# ─── Database ────────────────────────────────────────────────────────────────
migrate: ## Run Alembic migrations (SERVICE=user-service)
	uv run --package $(SERVICE) alembic -c apps/$(SERVICE)/alembic.ini upgrade head

migrate-create: ## Create new migration (MSG=description SERVICE=user-service)
	uv run --package $(SERVICE) alembic -c apps/$(SERVICE)/alembic.ini \
		revision --autogenerate -m "$(MSG)"

migrate-rollback: ## Rollback last migration (SERVICE=user-service)
	uv run --package $(SERVICE) alembic -c apps/$(SERVICE)/alembic.ini downgrade -1

# ─── Generators ──────────────────────────────────────────────────────────────
new-service: ## Scaffold a new service (NAME=my-service)
	@python scripts/scaffold.py service $(NAME)

new-lib: ## Scaffold a new shared library (NAME=mylib)
	@python scripts/scaffold.py lib $(NAME)

# ─── Build ───────────────────────────────────────────────────────────────────
build: ## Build Docker images for all services
	docker build -t python-enterprise/user-service:latest  -f apps/user-service/Dockerfile .
	docker build -t python-enterprise/api-gateway:latest   -f apps/api-gateway/Dockerfile .
	docker build -t python-enterprise/worker-service:latest -f apps/worker-service/Dockerfile .
	docker build -t python-enterprise/data-service:latest  -f apps/data-service/Dockerfile .

build-service: ## Build Docker image for one service (SERVICE=user-service)
	docker build -t python-enterprise/$(SERVICE):latest -f apps/$(SERVICE)/Dockerfile .

# ─── Docs ────────────────────────────────────────────────────────────────────
docs-serve: ## Serve docs locally with mkdocs
	uv run mkdocs serve

# ─── Cleanup ─────────────────────────────────────────────────────────────────
clean: ## Remove build artifacts and caches
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .mypy_cache  -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name htmlcov      -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete
