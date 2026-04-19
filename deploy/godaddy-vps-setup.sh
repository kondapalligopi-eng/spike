#!/bin/bash
# =============================================================================
# hispike.in — First-time GoDaddy VPS Setup Script
# =============================================================================
# Run this ONCE on a fresh GoDaddy VPS (Ubuntu 22.04) as root:
#   ssh root@<your-vps-ip>
#   bash godaddy-vps-setup.sh
# =============================================================================

set -euo pipefail

DOMAIN="hispike.in"
PROJECT_DIR="/var/www/petdogs"
GIT_REPO="https://github.com/YOUR_USERNAME/petdogs.git"   # update this

GREEN='\033[0;32m'; NC='\033[0m'
log() { echo -e "${GREEN}[SETUP]${NC} $*"; }

# -----------------------------------------------------------------------------
# 1. System update
# -----------------------------------------------------------------------------
log "Updating system packages..."
apt-get update -qq && apt-get upgrade -y -qq

# -----------------------------------------------------------------------------
# 2. Install Docker
# -----------------------------------------------------------------------------
log "Installing Docker..."
apt-get install -y -qq ca-certificates curl gnupg lsb-release
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
    > /etc/apt/sources.list.d/docker.list
apt-get update -qq
apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin

# docker compose v2 alias
ln -sf /usr/libexec/docker/cli-plugins/docker-compose /usr/local/bin/docker-compose

log "Docker $(docker --version) installed."

# -----------------------------------------------------------------------------
# 3. Install Certbot (Let's Encrypt SSL for hispike.in)
# -----------------------------------------------------------------------------
log "Installing Certbot..."
apt-get install -y -qq certbot

# -----------------------------------------------------------------------------
# 4. Clone repo
# -----------------------------------------------------------------------------
log "Cloning project to $PROJECT_DIR..."
mkdir -p /var/www
git clone "$GIT_REPO" "$PROJECT_DIR"

# -----------------------------------------------------------------------------
# 5. Obtain SSL certificate for hispike.in
# -----------------------------------------------------------------------------
log "Obtaining SSL certificate for $DOMAIN..."
# Stop any service on port 80 first
systemctl stop nginx 2>/dev/null || true

certbot certonly --standalone \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    --non-interactive \
    --agree-tos \
    --email admin@$DOMAIN \
    --no-eff-email

# Copy certs to project ssl folder
mkdir -p "$PROJECT_DIR/nginx/ssl"
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem "$PROJECT_DIR/nginx/ssl/fullchain.pem"
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem   "$PROJECT_DIR/nginx/ssl/privkey.pem"
chmod 600 "$PROJECT_DIR/nginx/ssl/"*.pem

log "SSL certificate obtained and copied."

# -----------------------------------------------------------------------------
# 6. Auto-renew SSL certificate (cron)
# -----------------------------------------------------------------------------
log "Setting up SSL auto-renewal cron..."
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && \
    cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $PROJECT_DIR/nginx/ssl/fullchain.pem && \
    cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $PROJECT_DIR/nginx/ssl/privkey.pem && \
    docker-compose -f $PROJECT_DIR/docker-compose.prod.yml restart nginx") | crontab -

# -----------------------------------------------------------------------------
# 7. Create .env.prod (prompt user to fill in values)
# -----------------------------------------------------------------------------
log "Creating .env.prod from example..."
cp "$PROJECT_DIR/.env.prod.example" "$PROJECT_DIR/.env.prod"

echo ""
echo -e "${GREEN}=====================================================${NC}"
echo -e "${GREEN}  VPS setup complete!${NC}"
echo -e "${GREEN}=====================================================${NC}"
echo ""
echo "  NEXT STEPS:"
echo ""
echo "  1. Edit the production env file with your real secrets:"
echo "     nano $PROJECT_DIR/.env.prod"
echo ""
echo "     Required values to fill in:"
echo "     - POSTGRES_PASSWORD"
echo "     - SECRET_KEY  (run: python3 -c \"import secrets; print(secrets.token_hex(32))\")"
echo "     - CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET"
echo ""
echo "  2. Deploy the app:"
echo "     $PROJECT_DIR/deploy/godaddy-deploy.sh"
echo ""
echo "  3. Point your GoDaddy DNS:"
echo "     A record:   hispike.in     → $(curl -s ifconfig.me)"
echo "     A record:   www.hispike.in → $(curl -s ifconfig.me)"
echo ""
