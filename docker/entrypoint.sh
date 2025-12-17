#!/bin/bash
set -e

echo "=========================================="
echo "   Magento 2 Docker Entrypoint"
echo "=========================================="

# Wait for MySQL
echo "Waiting for MySQL..."
while ! mysqladmin ping -h"${MAGENTO_DATABASE_HOST:-mysql}" --silent 2>/dev/null; do
    echo "MySQL not ready, waiting..."
    sleep 5
done
echo "MySQL is ready!"

# Wait for Elasticsearch
echo "Waiting for Elasticsearch..."
until curl -s "http://${ELASTICSEARCH_HOST:-elasticsearch}:${ELASTICSEARCH_PORT:-9200}/_cluster/health" | grep -q '"status":"green"\|"status":"yellow"'; do
    echo "Elasticsearch not ready, waiting..."
    sleep 5
done
echo "Elasticsearch is ready!"

# Check if Magento is already installed
if [ ! -f "/var/www/html/app/etc/env.php" ]; then
    echo "Installing Magento 2.4.7..."
    
    cd /var/www/html
    
    # Configure composer to ignore security advisories
    composer config --global audit.block-insecure false
    
    # Download Magento
    echo "Downloading Magento via Composer..."
    composer create-project --repository-url=https://repo.magento.com/ \
        magento/project-community-edition=2.4.7 . --no-interaction --no-progress
    
    # Run Magento setup
    echo "Running Magento setup:install..."
    bin/magento setup:install \
        --base-url="${MAGENTO_BASE_URL:-http://localhost:8080}" \
        --db-host="${MAGENTO_DATABASE_HOST:-mysql}" \
        --db-name="${MAGENTO_DATABASE_NAME:-magento}" \
        --db-user="${MAGENTO_DATABASE_USER:-magento}" \
        --db-password="${MAGENTO_DATABASE_PASSWORD:-magento}" \
        --admin-firstname=Admin \
        --admin-lastname=User \
        --admin-email="${MAGENTO_ADMIN_EMAIL:-admin@example.com}" \
        --admin-user="${MAGENTO_ADMIN_USER:-admin}" \
        --admin-password="${MAGENTO_ADMIN_PASSWORD:-Admin@123}" \
        --language=en_US \
        --currency=USD \
        --timezone=America/New_York \
        --use-rewrites=1 \
        --search-engine=elasticsearch7 \
        --elasticsearch-host="${ELASTICSEARCH_HOST:-elasticsearch}" \
        --elasticsearch-port="${ELASTICSEARCH_PORT:-9200}" \
        --backend-frontname=admin
    
    # Disable 2FA for development
    echo "Disabling 2FA..."
    bin/magento module:disable Magento_AdminAdobeImsTwoFactorAuth Magento_TwoFactorAuth
    bin/magento setup:upgrade
    bin/magento cache:flush
    
    # Set permissions
    echo "Setting permissions..."
    find var generated vendor pub/static pub/media app/etc -type f -exec chmod g+w {} + 2>/dev/null || true
    find var generated vendor pub/static pub/media app/etc -type d -exec chmod g+ws {} + 2>/dev/null || true
    chown -R www-data:www-data /var/www/html
    
    echo "=========================================="
    echo "   Magento Installation Complete!"
    echo "=========================================="
    echo ""
    echo "Frontend: ${MAGENTO_BASE_URL:-http://localhost:8080}"
    echo "Admin:    ${MAGENTO_BASE_URL:-http://localhost:8080}/admin"
    echo "Username: ${MAGENTO_ADMIN_USER:-admin}"
    echo "Password: ${MAGENTO_ADMIN_PASSWORD:-Admin@123}"
    echo ""
else
    echo "Magento already installed, skipping installation."
    chown -R www-data:www-data /var/www/html
fi

# Execute CMD
exec "$@"
