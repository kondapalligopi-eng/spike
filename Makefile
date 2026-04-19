# =============================================================================
# Pet Dogs — Makefile
# =============================================================================
# Usage: make <target>
#
# All targets that communicate with Docker assume you have the correct .env
# (development) or .env.prod (production) file in the project root.
# =============================================================================

.DEFAULT_GOAL := help

COMPOSE         := docker-compose
COMPOSE_PROD    := docker-compose -f docker-compose.prod.yml
BACKEND_SVC     := backend
POSTGRES_SVC    := postgres

# Colours
CYAN  := \033[0;36m
NC    := \033[0m

## ---------------------------------------------------------------------------
## Development
## ---------------------------------------------------------------------------

.PHONY: dev
dev: ## Start all services in development mode (with hot reload)
	$(COMPOSE) up

.PHONY: dev-d
dev-d: ## Start all services in development mode (detached)
	$(COMPOSE) up -d

.PHONY: build
build: ## Build (or rebuild) all Docker images
	$(COMPOSE) build

## ---------------------------------------------------------------------------
## Production
## ---------------------------------------------------------------------------

.PHONY: prod
prod: ## Start all services in production mode (detached)
	$(COMPOSE_PROD) up -d

.PHONY: prod-build
prod-build: ## Build production images and start services
	$(COMPOSE_PROD) up -d --build

## ---------------------------------------------------------------------------
## Lifecycle
## ---------------------------------------------------------------------------

.PHONY: down
down: ## Stop and remove all containers (development)
	$(COMPOSE) down

.PHONY: down-prod
down-prod: ## Stop and remove all containers (production)
	$(COMPOSE_PROD) down

.PHONY: down-v
down-v: ## Stop containers AND delete volumes — WARNING: destroys local DB data
	$(COMPOSE) down -v

.PHONY: restart
restart: ## Restart all development containers
	$(COMPOSE) restart

## ---------------------------------------------------------------------------
## Logs
## ---------------------------------------------------------------------------

.PHONY: logs
logs: ## Tail logs from all development services
	$(COMPOSE) logs -f

.PHONY: logs-backend
logs-backend: ## Tail backend logs only
	$(COMPOSE) logs -f $(BACKEND_SVC)

.PHONY: logs-prod
logs-prod: ## Tail logs from all production services
	$(COMPOSE_PROD) logs -f

## ---------------------------------------------------------------------------
## Database migrations (Alembic)
## ---------------------------------------------------------------------------

.PHONY: migrate
migrate: ## Run alembic upgrade head in the backend container (development)
	$(COMPOSE) exec $(BACKEND_SVC) alembic upgrade head

.PHONY: migrate-prod
migrate-prod: ## Run alembic upgrade head in the backend container (production)
	$(COMPOSE_PROD) exec $(BACKEND_SVC) alembic upgrade head

.PHONY: migrate-create
migrate-create: ## Create a new Alembic migration — usage: make migrate-create MSG="add dog table"
	$(COMPOSE) exec $(BACKEND_SVC) alembic revision --autogenerate -m "$(MSG)"

.PHONY: migrate-downgrade
migrate-downgrade: ## Downgrade one migration step (development)
	$(COMPOSE) exec $(BACKEND_SVC) alembic downgrade -1

## ---------------------------------------------------------------------------
## Shells / REPL
## ---------------------------------------------------------------------------

.PHONY: shell-backend
shell-backend: ## Open a bash shell inside the backend container
	$(COMPOSE) exec $(BACKEND_SVC) bash

.PHONY: shell-db
shell-db: ## Open a psql shell inside the postgres container
	$(COMPOSE) exec $(POSTGRES_SVC) psql -U petdogs petdogs

.PHONY: shell-redis
shell-redis: ## Open a redis-cli shell inside the redis container
	$(COMPOSE) exec redis redis-cli

## ---------------------------------------------------------------------------
## Testing
## ---------------------------------------------------------------------------

.PHONY: test
test: ## Run pytest in the backend container
	$(COMPOSE) exec $(BACKEND_SVC) pytest -v

.PHONY: test-cov
test-cov: ## Run pytest with coverage report
	$(COMPOSE) exec $(BACKEND_SVC) pytest -v --cov=app --cov-report=term-missing

.PHONY: test-fast
test-fast: ## Run pytest skipping slow/integration tests
	$(COMPOSE) exec $(BACKEND_SVC) pytest -v -m "not slow"

## ---------------------------------------------------------------------------
## Code quality
## ---------------------------------------------------------------------------

.PHONY: lint
lint: ## Run ruff linter on the backend
	$(COMPOSE) exec $(BACKEND_SVC) ruff check app/

.PHONY: format
format: ## Auto-format backend code with ruff
	$(COMPOSE) exec $(BACKEND_SVC) ruff format app/

.PHONY: typecheck
typecheck: ## Run mypy type checks on the backend
	$(COMPOSE) exec $(BACKEND_SVC) mypy app/

## ---------------------------------------------------------------------------
## Utilities
## ---------------------------------------------------------------------------

.PHONY: ps
ps: ## Show running containers
	$(COMPOSE) ps

.PHONY: prune
prune: ## Remove dangling Docker images and stopped containers
	docker system prune -f

.PHONY: env-check
env-check: ## Verify that .env exists (development)
	@test -f .env || (echo "ERROR: .env not found. Copy .env.example → .env and fill in values." && exit 1)
	@echo ".env found."

.PHONY: env-check-prod
env-check-prod: ## Verify that .env.prod exists (production)
	@test -f .env.prod || (echo "ERROR: .env.prod not found. Copy .env.prod.example → .env.prod and fill in values." && exit 1)
	@echo ".env.prod found."

## ---------------------------------------------------------------------------
## Help
## ---------------------------------------------------------------------------

.PHONY: help
help: ## Show this help message
	@echo ""
	@echo "  $(CYAN)Pet Dogs — available make targets$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-22s$(NC) %s\n", $$1, $$2}'
	@echo ""
