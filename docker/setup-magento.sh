#!/bin/bash
# Magento 2 Installation Script
# Requires Adobe Commerce Marketplace credentials

echo "=========================================="
echo "   Magento 2 Docker Installation"
echo "=========================================="
echo ""
echo "This script will install Magento 2.4.7 in Docker."
echo ""
echo "PREREQUISITES:"
echo "1. Adobe Commerce Marketplace account: https://commercemarketplace.adobe.com"
echo "2. Access Keys from: https://commercemarketplace.adobe.com/customer/accessKeys/"
echo "   - Public Key = Composer username"
echo "   - Private Key = Composer password"
echo ""

read -p "Enter your Adobe Public Key (Composer username): " PUBLIC_KEY
read -s -p "Enter your Adobe Private Key (Composer password): " PRIVATE_KEY
echo ""

if [ -z "$PUBLIC_KEY" ] || [ -z "$PRIVATE_KEY" ]; then
    echo "Error: Both keys are required!"
    exit 1
fi

echo ""
echo "Installing Magento 2..."

# Create auth.json in container
docker exec headless-magento bash -c "cat > /var/www/html/auth.json << EOF
{
    \"http-basic\": {
        \"repo.magento.com\": {
            \"username\": \"$PUBLIC_KEY\",
            \"password\": \"$PRIVATE_KEY\"
        }
    }
}
EOF"

# Download and install Magento
docker exec headless-magento bash -c "
cd /var/www/html && \
composer create-project --repository-url=https://repo.magento.com/ magento/project-community-edition=2.4.7 . --no-interaction
"

if [ $? -ne 0 ]; then
    echo "Error: Composer installation failed!"
    exit 1
fi

# Run Magento setup
docker exec headless-magento bash -c "
cd /var/www/html && \
bin/magento setup:install \
    --base-url=http://localhost:8080 \
    --db-host=mysql \
    --db-name=magento \
    --db-user=magento \
    --db-password=magento \
    --admin-firstname=Admin \
    --admin-lastname=User \
    --admin-email=admin@example.com \
    --admin-user=admin \
    --admin-password=Admin@123 \
    --language=en_US \
    --currency=USD \
    --timezone=America/New_York \
    --use-rewrites=1 \
    --search-engine=elasticsearch7 \
    --elasticsearch-host=elasticsearch \
    --elasticsearch-port=9200 \
    --backend-frontname=admin
"

# Set permissions
docker exec headless-magento bash -c "
cd /var/www/html && \
find var generated vendor pub/static pub/media app/etc -type f -exec chmod g+w {} + 2>/dev/null || true && \
find var generated vendor pub/static pub/media app/etc -type d -exec chmod g+ws {} + 2>/dev/null || true && \
chown -R www-data:www-data .
"

# Disable 2FA for easier development
docker exec headless-magento bash -c "
cd /var/www/html && \
bin/magento module:disable Magento_AdminAdobeImsTwoFactorAuth Magento_TwoFactorAuth && \
bin/magento setup:upgrade && \
bin/magento cache:flush
"

echo ""
echo "=========================================="
echo "   Magento 2 Installation Complete!"
echo "=========================================="
echo ""
echo "Access URLs:"
echo "  Storefront: http://localhost:8080"
echo "  Admin:      http://localhost:8080/admin"
echo ""
echo "Admin Credentials:"
echo "  Username: admin"
echo "  Password: Admin@123"
echo ""


