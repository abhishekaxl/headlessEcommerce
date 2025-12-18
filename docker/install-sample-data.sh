#!/bin/bash
# Force install sample data script

echo "Installing Magento Sample Data..."

docker exec headless-magento bash -c "
cd /var/www/html && \
cp /root/.composer/auth.json . 2>/dev/null || true && \
COMPOSER_AUTH='{\"http-basic\":{\"repo.magento.com\":{\"username\":\"903a085d52adb99acec8bc43ce31be08\",\"password\":\"e01cc3e6d30310552a150996fc98032f\"}}}' \
bin/magento sampledata:deploy && \
bin/magento setup:upgrade && \
bin/magento indexer:reindex && \
bin/magento cache:flush
"

echo "Sample data installation complete!"

