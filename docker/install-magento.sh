#!/bin/bash
set -e

# Wait for MySQL
echo "Waiting for MySQL..."
while ! mysqladmin ping -h"mysql" --silent; do
    sleep 2
done

# Check if Magento is already installed
if [ ! -f "/var/www/html/app/etc/env.php" ]; then
    echo "Installing Magento 2..."
    
    cd /var/www/html
    
    # Download Magento via Composer (requires Adobe credentials)
    composer create-project --repository-url=https://repo.magento.com/ magento/project-community-edition=2.4.7 . --no-install
    
    # Install dependencies
    composer install
    
    # Install Magento
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
    
    # Set permissions
    find var generated vendor pub/static pub/media app/etc -type f -exec chmod g+w {} +
    find var generated vendor pub/static pub/media app/etc -type d -exec chmod g+ws {} +
    chown -R www-data:www-data .
    
    # Enable developer mode
    bin/magento deploy:mode:set developer
    
    # Disable two-factor auth for easier dev
    bin/magento module:disable Magento_AdminAdobeImsTwoFactorAuth Magento_TwoFactorAuth
    bin/magento setup:upgrade
    bin/magento cache:flush
    
    echo "Magento installation complete!"
else
    echo "Magento already installed."
fi

exec "$@"


