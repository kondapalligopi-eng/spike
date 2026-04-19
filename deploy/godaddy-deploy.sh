#!/bin/bash
# =============================================================================
# Pet Dogs — GoDaddy VPS Deployment Script
# =============================================================================
# Usage:
#   chmod +x deploy/godaddy-deploy.sh
#   ./deploy/godaddy-deploy.sh
#
# Prerequisites on the VPS:
#   - git, docker, docker-compose installed
#   - .env.prod exists in the project root (never committed to git)
#   - SSL certs placed in ./nginx/ssl/ (fullchain.pem + privkey.pem)
# =============================================================================

set -euo pipefail

# -----------------------------------------------------------------------------
# Configuration — adjust these to match your VPS setup
# -----------------------------------------------------------------------------
PROJECT_DIR="/var/www/petdogs"          # Absolute path to the repo on the VPS
GIT_BRANCH="main"                       # Branch to deploy
SITE_URL="https://hispike.in"
COMPOSE_FILE="docker-compose.prod.yml"

# Colour helpers
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Colour

log()  { echo -e "${GREEN}[DEPLOY]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC}  $*"; }
fail() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# -----------------------------------------------------------------------------
# Safety checks
# -----------------------------------------------------------------------------
[[ -d "$PROJECT_DIR" ]] || fail "Project directory $PROJECT_DIR not found. Clone the repo first."
[[ -f "$PROJECT_DIR/.env.prod" ]] || fail ".env.prod not found in $PROJECT_DIR. Create it from .env.prod.example."
command -v docker         >/dev/null 2>&1 || fail "docker is not installed."
command -v docker-compose >/dev/null 2>&1 || fail "docker-compose is not installed."

cd "$PROJECT_DIR"

# -----------------------------------------------------------------------------
# Step 1 — Pull latest code
# -----------------------------------------------------------------------------
log "Pulling latest code from branch '$GIT_BRANCH'..."
git fetch --all
git checkout "$GIT_BRANCH"
git pull origin "$GIT_BRANCH"
log "Code is up to date. Commit: $(git rev-parse --short HEAD)"

# -----------------------------------------------------------------------------
# Step 2 — Sync production env file
# -----------------------------------------------------------------------------
log "Copying .env.prod → .env for docker-compose..."
cp .env.prod .env

# -----------------------------------------------------------------------------
# Step 3 — Pull updated base images
# -----------------------------------------------------------------------------
log "Pulling latest upstream images (postgres, redis, nginx)..."
docker-compose -f "$COMPOSE_FILE" pull --ignore-pull-failures

# -----------------------------------------------------------------------------
# Step 4 — Build & start services
# -----------------------------------------------------------------------------
log "Building images and starting services..."
docker-compose -f "$COMPOSE_FILE" up -d --build --remove-orphans

# Wait briefly for the backend to become healthy before running migrations
log "Waiting for backend to be ready..."
RETRIES=15
until docker-compose -f "$COMPOSE_FILE" exec -T backend \
        curl -sf http://localhost:8000/health >/dev/null 2>&1; do
    RETRIES=$((RETRIES - 1))
    [[ $RETRIES -le 0 ]] && fail "Backend did not become healthy in time. Check logs: docker-compose -f $COMPOSE_FILE logs backend"
    warn "Backend not ready yet — retrying in 4 s ($RETRIES attempts left)..."
    sleep 4
done

# -----------------------------------------------------------------------------
# Step 5 — Run database migrations
# -----------------------------------------------------------------------------
log "Running Alembic migrations..."
docker-compose -f "$COMPOSE_FILE" exec -T backend alembic upgrade head
log "Migrations complete."

# -----------------------------------------------------------------------------
# Step 6 — Prune unused Docker objects to free disk space
# -----------------------------------------------------------------------------
log "Pruning dangling images to free disk space..."
docker image prune -f

# -----------------------------------------------------------------------------
# Done
# -----------------------------------------------------------------------------
echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}  Deployment successful!${NC}"
echo -e "${GREEN}  Site:   $SITE_URL${NC}"
echo -e "${GREEN}  Commit: $(git rev-parse --short HEAD)${NC}"
echo -e "${GREEN}  Time:   $(date '+%Y-%m-%d %H:%M:%S %Z')${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
log "Useful commands:"
echo "  View logs:       docker-compose -f $COMPOSE_FILE logs -f"
echo "  Backend shell:   docker-compose -f $COMPOSE_FILE exec backend bash"
echo "  DB shell:        docker-compose -f $COMPOSE_FILE exec postgres psql -U petdogs petdogs"
