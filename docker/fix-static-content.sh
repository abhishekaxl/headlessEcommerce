#!/bin/bash
# Quick fix script for Magento CSS/JS issues

echo "Fixing Magento static content..."

docker exec headless-magento bash -c "
cd /var/www/html && \
bin/magento deploy:mode:set developer && \
bin/magento setup:static-content:deploy -f en_US && \
bin/magento cache:flush && \
chown -R www-data:www-data /var/www/html && \
find var generated vendor pub/static pub/media app/etc -type f -exec chmod g+w {} + 2>/dev/null || true && \
find var generated vendor pub/static pub/media app/etc -type d -exec chmod g+ws {} + 2>/dev/null || true
"

echo "Done! Please refresh your browser."

