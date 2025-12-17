#!/bin/bash

# Check if Magento container is running
if [ ! "$(docker ps -q -f name=headless-magento)" ]; then
    echo "Error: Magento container (headless-magento) is not running."
    echo "Please run 'docker compose up -d' first and wait for Magento to initialize."
    exit 1
fi

echo "Deploying Magento Sample Data..."
echo "----------------------------------------------------------------"
echo "NOTE: This operation uses Composer and requires Adobe Commerce keys."
echo "If prompted for username/password:"
echo "  Username: Your Public Key"
echo "  Password: Your Private Key"
echo "Get keys at: https://commercemarketplace.adobe.com/customer/accessKeys/"
echo "----------------------------------------------------------------"

docker exec -it headless-magento bin/magento sampledata:deploy
echo "Running setup:upgrade..."
docker exec -it headless-magento bin/magento setup:upgrade
echo "Reindexing..."
docker exec -it headless-magento bin/magento indexer:reindex
echo "Flushing cache..."
docker exec -it headless-magento bin/magento cache:flush

echo "Sample data deployment complete!"

