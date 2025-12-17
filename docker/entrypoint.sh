#!/bin/bash
set -e

echo "=========================================="
echo "   Magento 2 Docker Entrypoint"
echo "=========================================="

DB_HOST="${MAGENTO_DATABASE_HOST:-mysql}"
DB_USER="${MAGENTO_DATABASE_USER:-magento}"
DB_PASS="${MAGENTO_DATABASE_PASSWORD:-magento}"
DB_NAME="${MAGENTO_DATABASE_NAME:-magento}"
ES_HOST="${ELASTICSEARCH_HOST:-elasticsearch}"
ES_PORT="${ELASTICSEARCH_PORT:-9200}"

# Wait for MySQL
echo "Waiting for MySQL at $DB_HOST..."
MAX_TRIES=60
COUNT=0
while [ $COUNT -lt $MAX_TRIES ]; do
    if mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" --skip-ssl -e "SELECT 1" &>/dev/null; then
        echo "MySQL is ready!"
        break
    fi
    COUNT=$((COUNT+1))
    echo "MySQL not ready, attempt $COUNT/$MAX_TRIES..."
    sleep 5
done

if [ $COUNT -eq $MAX_TRIES ]; then
    echo "ERROR: MySQL did not become ready in time"
    exit 1
fi

# Wait for Elasticsearch
echo "Waiting for Elasticsearch at $ES_HOST:$ES_PORT..."
COUNT=0
while [ $COUNT -lt $MAX_TRIES ]; do
    if curl -s "http://$ES_HOST:$ES_PORT/_cluster/health" 2>/dev/null | grep -q '"status"'; then
        echo "Elasticsearch is ready!"
        break
    fi
    COUNT=$((COUNT+1))
    echo "Elasticsearch not ready, attempt $COUNT/$MAX_TRIES..."
    sleep 5
done

if [ $COUNT -eq $MAX_TRIES ]; then
    echo "ERROR: Elasticsearch did not become ready in time"
    exit 1
fi

# Check if Magento is already installed
if [ ! -f "/var/www/html/app/etc/env.php" ]; then
    echo ""
    echo "=========================================="
    echo "   Installing Magento 2.4.7"
    echo "=========================================="
    echo ""
    
    cd /var/www/html
    
    # Configure composer
    composer config --global audit.block-insecure false
    
    # Download Magento
    echo "Downloading Magento via Composer (this takes a while)..."
    composer create-project --repository-url=https://repo.magento.com/ \
        magento/project-community-edition=2.4.7 . --no-interaction --no-progress
    
    # Run Magento setup
    echo ""
    echo "Running Magento setup:install..."
    bin/magento setup:install \
        --base-url="${MAGENTO_BASE_URL:-http://localhost:8080}" \
        --db-host="$DB_HOST" \
        --db-name="$DB_NAME" \
        --db-user="$DB_USER" \
        --db-password="$DB_PASS" \
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
        --elasticsearch-host="$ES_HOST" \
        --elasticsearch-port="$ES_PORT" \
        --backend-frontname=admin
    
    # Set developer mode (allows automatic static content generation)
    echo "Setting developer mode..."
    bin/magento deploy:mode:set developer
    
    # Disable 2FA
    echo "Disabling 2FA for development..."
    bin/magento module:disable Magento_AdminAdobeImsTwoFactorAuth Magento_TwoFactorAuth
    bin/magento setup:upgrade
    bin/magento cache:flush
    
    # Install sample data
    echo ""
    echo "Installing Magento Sample Data (this takes a while)..."
    set +e  # Temporarily disable exit on error
    SAMPLEDATA_OUTPUT=$(bin/magento sampledata:deploy 2>&1)
    SAMPLEDATA_EXIT=$?
    set -e  # Re-enable exit on error
    
    if [ $SAMPLEDATA_EXIT -eq 0 ] || echo "$SAMPLEDATA_OUTPUT" | grep -q "already deployed\|already exists\|Sample data modules have been enabled"; then
        echo "$SAMPLEDATA_OUTPUT"
        echo "Running setup:upgrade..."
        bin/magento setup:upgrade
        echo "Reindexing catalog..."
        bin/magento indexer:reindex
        bin/magento cache:flush
        echo "Sample data installed successfully!"
        
        # Verify products were created
        PRODUCT_COUNT=$(mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" --skip-ssl "$DB_NAME" -sN -e "SELECT COUNT(*) FROM catalog_product_entity;" 2>/dev/null || echo "0")
        echo "Products in database: $PRODUCT_COUNT"
    else
        echo "$SAMPLEDATA_OUTPUT"
        echo "Warning: Sample data installation had issues. Trying alternative method..."
        # Try alternative: enable sample data modules manually
        bin/magento module:enable Magento_SampleData || true
        bin/magento setup:upgrade || true
        bin/magento indexer:reindex || true
        bin/magento cache:flush || true
    fi
    
    # Deploy static content for CSS/JS
    echo ""
    echo "Deploying static content (CSS/JS)..."
    bin/magento setup:static-content:deploy -f en_US
    bin/magento cache:flush
    
    # Set permissions
    echo "Setting permissions..."
    find var generated vendor pub/static pub/media app/etc -type f -exec chmod g+w {} + 2>/dev/null || true
    find var generated vendor pub/static pub/media app/etc -type d -exec chmod g+ws {} + 2>/dev/null || true
    chown -R www-data:www-data /var/www/html
    
    echo ""
    echo "=========================================="
    echo "   Magento Installation Complete!"
    echo "   (Includes Sample Data)"
    echo "=========================================="
    echo ""
    echo "Frontend: ${MAGENTO_BASE_URL:-http://localhost:8080}"
    echo "Admin:    ${MAGENTO_BASE_URL:-http://localhost:8080}/admin"
    echo "Username: ${MAGENTO_ADMIN_USER:-admin}"
    echo "Password: ${MAGENTO_ADMIN_PASSWORD:-Admin@123}"
    echo ""
else
    echo "Magento already installed."
    cd /var/www/html
    
    # Ensure developer mode is set
    CURRENT_MODE=$(bin/magento deploy:mode:show 2>/dev/null | grep -i "current mode" | awk '{print $3}' || echo "")
    if [ "$CURRENT_MODE" != "developer" ]; then
        echo "Setting developer mode..."
        bin/magento deploy:mode:set developer
    fi
    
    # Ensure static content is deployed
    if [ ! -d "pub/static/frontend" ] || [ -z "$(ls -A pub/static/frontend 2>/dev/null)" ]; then
        echo "Deploying static content (CSS/JS)..."
        bin/magento setup:static-content:deploy -f en_US
        bin/magento cache:flush
    fi
    
    # Ensure permissions are correct
    chown -R www-data:www-data /var/www/html 2>/dev/null || true
    find var generated vendor pub/static pub/media app/etc -type f -exec chmod g+w {} + 2>/dev/null || true
    find var generated vendor pub/static pub/media app/etc -type d -exec chmod g+ws {} + 2>/dev/null || true
fi

# Execute CMD
exec "$@"
